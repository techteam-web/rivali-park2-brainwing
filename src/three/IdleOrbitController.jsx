import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { locationsConfig } from './locationsConfig'

// Custom constrained orbit rig for the /locations IDLE state (nothing selected). It replaces the
// plain OrbitControls for idle: the camera is locked to a RING around MainBuilding (fixed radius +
// fixed polar angle, always looking at the building center) and:
//   - AUTO-ORBITS slowly around the ring (azimuth advances on its own),
//   - a left-drag HORIZONTAL scrubs the orbit angle (auto-orbit pauses during the drag, resumes
//     immediately from the new angle on release),
//   - mouse move gives a small SELF-CENTERING 2-axis PARALLAX (mouse-only, no touch): the camera
//     floats slightly toward the cursor vertically (camera.y) and sideways (along the view-relative
//     right vector), easing back to neutral when the mouse settles or leaves the canvas. The X
//     (sideways) component is suppressed to 0 while drag-scrubbing so it never fights the orbit
//     rotation; the Y component stays active even during a drag,
//   - NO zoom/dolly (radius fixed), NO pan, NO vertical drag (polar fixed).
//
// On BECOMING idle (deselect or initial load) it eases the camera from its CURRENT live position to
// the nearest ring point (the ring point at the camera's current azimuth), then resumes orbiting, so
// there is no snap. It is fully inert while not idle - CameraRig owns the camera then, and the idle
// bail in CameraRig kills its tween before this activates, so exactly one owner writes the camera.
// Mounted at Canvas root as a sibling of CameraRig (see src/three/LocationsCanvas.jsx).

const { idleOrbit, mainBuilding } = locationsConfig

// World up, shared for the per-frame camera-right computation (sideways parallax).
const WORLD_UP = new THREE.Vector3(0, 1, 0)

// Ring point at a given azimuth (writes into `out` to avoid per-frame allocation):
//   x = cx + R*sin(polar)*cos(az);  y = cy + R*cos(polar);  z = cz + R*sin(polar)*sin(az)
const ringPoint = (out, c, R, polar, az) =>
  out.set(
    c.x + R * Math.sin(polar) * Math.cos(az),
    c.y + R * Math.cos(polar),
    c.z + R * Math.sin(polar) * Math.sin(az),
  )

// Gentle in-out on the ease-onto-ring transition (smoothstep).
const easeInOut = (t) => t * t * (3 - 2 * t)

// Near-top-down framings (ACCESS) park the camera almost directly above the building, where
// camera.lookAt hits the gimbal singularity and would roll the view ~68deg on the first idle frame.
// Same near-pole test as CameraRig (horizontal offset small relative to height): slerp orientation
// there instead of lookAt. tan(12deg): horizontal/vertical below this = near pole.
const NEAR_POLE_TAN = Math.tan((12 * Math.PI) / 180)

export default function IdleOrbitController({ isIdle }) {
  // Imperative store access: camera/controls are read from get() and mutated directly (the R3F way).
  const get = useThree((s) => s.get)
  const gl = useThree((s) => s.gl)

  const { radius, polarAngle, autoRotateSpeed, dragSensitivity, transitionDuration, parallaxAmountX, parallaxAmountY, parallaxEase, settleSeconds, startAzimuthDeg } = idleOrbit
  // First-load-only override for the opening orientation (see locationsConfig).
  // After that every activation reads the azimuth off the live camera, so a
  // deselect still slides back onto the ring where you left it.
  const firstActivationRef = useRef(true)
  // Building center = orbit pivot. mainBuilding.position is authored in the recentered world space.
  const center = useMemo(() => new THREE.Vector3(...mainBuilding.position), [])

  // All per-frame/input state lives in refs so input never triggers a React re-render.
  const azimuthRef = useRef(0)             // current orbit angle around the ring
  const phaseRef = useRef('transition')    // 'transition' (easing onto ring) | 'orbit'
  const tProgressRef = useRef(0)           // 0..1 progress of the ease-onto-ring
  const startRadiusRef = useRef(0)         // 3D distance from center at activation, eased to ring radius
  const startPolarRef = useRef(0)          // polar angle at activation, eased to ring polarAngle
  const startTargetRef = useRef(new THREE.Vector3()) // held look-at target at activation, eased to center
  const draggingRef = useRef(false)
  const lastXRef = useRef(0)
  const parallaxTargetYRef = useRef(0)     // desired vertical offset from mouse Y
  const parallaxCurrentYRef = useRef(0)    // eased vertical offset applied to camera.y
  const parallaxTargetXRef = useRef(0)     // desired sideways offset from mouse X
  const parallaxCurrentXRef = useRef(0)    // eased sideways offset applied along camera-right
  const lastMoveElapsedRef = useRef(0)     // clock time of the last mouse move (for settle)
  const mouseOverRef = useRef(false)       // mouse currently over the canvas
  const prevIdleRef = useRef(false)        // detects the not-idle -> idle activation edge
  const elapsedRef = useRef(0)             // latest clock time, so handlers can measure settle
  const isIdleRef = useRef(isIdle)         // latest isIdle for the once-attached pointer handlers
  const scratch = useMemo(() => new THREE.Vector3(), []) // ring position, reused each frame
  const fwd = useMemo(() => new THREE.Vector3(), [])     // camera->center, for the right vector
  const right = useMemo(() => new THREE.Vector3(), [])   // camera right, for the sideways parallax
  const aimScratch = useMemo(() => new THREE.Vector3(), []) // eased aim point during the return transition
  const nearPoleRef = useRef(false)                    // this return started near top-down (slerp orientation)
  const startQuatRef = useRef(new THREE.Quaternion())  // parked orientation at activation
  const endQuatRef = useRef(new THREE.Quaternion())    // ring-landing orientation (looking at center)
  const landScratch = useMemo(() => new THREE.Vector3(), []) // ring-landing position, for endQuat
  const poleMat = useMemo(() => new THREE.Matrix4(), [])     // lookAt matrix, for endQuat

  // Keep the handlers' view of isIdle current and re-arm the ease-in when we leave idle. The useFrame
  // early-returns while not idle, so prevIdleRef must be reset here (not in the frame loop).
  useEffect(() => {
    isIdleRef.current = isIdle
    if (!isIdle) {
      prevIdleRef.current = false // next time we become idle, ease onto the ring afresh
      draggingRef.current = false
    }
  }, [isIdle])

  // Custom pointer input on the canvas element. Attached once; each handler bails when not idle so it
  // is inert while a category/route is selected. drei's OrbitControls is disabled (no listeners), so
  // there is nothing to conflict with.
  useEffect(() => {
    const el = gl.domElement

    const onPointerDown = (e) => {
      if (!isIdleRef.current) return
      draggingRef.current = true // pauses auto-orbit (we stop advancing azimuth while dragging)
      lastXRef.current = e.clientX
    }

    const onPointerMove = (e) => {
      if (!isIdleRef.current) return
      // Horizontal drag-scrub (all pointer types, incl. touch). The scrub only advances the azimuth
      // while actually orbiting; the brief ease-onto-ring transition is left alone. lastX is kept
      // fresh even during the transition so the first orbit-phase move does not jump.
      if (draggingRef.current) {
        if (phaseRef.current === 'orbit') {
          azimuthRef.current += (e.clientX - lastXRef.current) * dragSensitivity
        }
        lastXRef.current = e.clientX
      }
      // Self-centering 2-axis parallax - MOUSE ONLY (no hover on touch). X floats toward the
      // cursor (nx), Y floats toward the cursor with the inverted screen-Y (-ny = mouse up ->
      // camera up). The drag-suppression of X happens in the frame loop, not here.
      if (e.pointerType === 'mouse') {
        const rect = el.getBoundingClientRect()
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1 // -1 (left) .. 1 (right)
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1 // -1 (top) .. 1 (bottom)
        parallaxTargetXRef.current = nx * parallaxAmountX
        parallaxTargetYRef.current = -ny * parallaxAmountY
        lastMoveElapsedRef.current = elapsedRef.current
        mouseOverRef.current = true
      }
    }

    const endDrag = () => {
      draggingRef.current = false // auto-orbit resumes next frame from the new azimuth
    }
    const onPointerLeave = () => {
      draggingRef.current = false
      mouseOverRef.current = false // parallax self-centers back to neutral
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', endDrag)
    el.addEventListener('pointercancel', endDrag)
    el.addEventListener('pointerleave', onPointerLeave)
    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', endDrag)
      el.removeEventListener('pointercancel', endDrag)
      el.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [gl, dragSensitivity, parallaxAmountX, parallaxAmountY])

  useFrame((state, delta) => {
    elapsedRef.current = state.clock.elapsedTime
    if (!isIdle) return // fully inert; CameraRig owns the camera while something is selected
    const dt = Math.min(delta, 0.1) // clamp so a tab-refocus spike cannot fling the orbit

    const { camera, controls } = get()

    // Activation edge: became idle (deselect) or first idle frame (initial load). Read the LIVE parked
    // pose the instant idle takes ownership (CameraRig's idle-bail has killed its tweens without moving
    // the camera, so this is exactly where it was held) and capture the ORBIT PARAMETERS: azimuth (the
    // nearest ring point stays at this azimuth, a radial slide-in), the 3D radius, and the polar angle.
    // Easing these (not raw XYZ) means ringPoint reconstructs the exact parked position at t=0 (no
    // frame-1 snap) and lands on the ring at this same azimuth at t=1 (where auto-orbit continues).
    // Also stash the held look-at target so the aim can ease to center over the same window, and drop
    // the parallax offset frozen from the last idle exit so it does not re-engage as a frame-1 jump.
    if (!prevIdleRef.current) {
      prevIdleRef.current = true
      const dx = camera.position.x - center.x
      const dy = camera.position.y - center.y
      const dz = camera.position.z - center.z
      azimuthRef.current = Math.atan2(dz, dx)
      // Opening shot only: swing to the authored start angle instead of the one
      // implied by the default camera position. The ease-onto-ring below then
      // runs at THAT azimuth, so the map settles straight into the framing the
      // page is meant to open on.
      if (firstActivationRef.current) {
        firstActivationRef.current = false
        if (typeof startAzimuthDeg === 'number') {
          azimuthRef.current = (startAzimuthDeg * Math.PI) / 180
        }
      }
      startRadiusRef.current = Math.hypot(dx, dy, dz) || 1
      startPolarRef.current = Math.acos(THREE.MathUtils.clamp(dy / startRadiusRef.current, -1, 1))
      startTargetRef.current.copy(controls ? controls.target : center)
      // Near-top-down parked pose (ACCESS): lookAt is gimbal-degenerate and would roll the view on the
      // first idle frame. Slerp orientation from the parked quaternion to the ring-landing orientation
      // (looking at center from the landing point) instead. Oblique framings keep the lookAt(aim) ease.
      nearPoleRef.current = Math.hypot(dx, dz) < Math.abs(dy) * NEAR_POLE_TAN
      if (nearPoleRef.current) {
        startQuatRef.current.copy(camera.quaternion)
        ringPoint(landScratch, center, radius, polarAngle, azimuthRef.current)
        poleMat.lookAt(landScratch, center, camera.up)
        endQuatRef.current.setFromRotationMatrix(poleMat)
      }
      parallaxCurrentXRef.current = 0
      parallaxCurrentYRef.current = 0
      phaseRef.current = 'transition'
      tProgressRef.current = 0
      draggingRef.current = false
    }

    // Base ring position for this frame (before the parallax offset) -> scratch.
    if (phaseRef.current === 'transition') {
      tProgressRef.current = Math.min(1, tProgressRef.current + dt / transitionDuration)
      // Ease the orbit PARAMETERS (radius + polar) toward the ring at a CONSTANT azimuth, then rebuild
      // the position via ringPoint. At t=0 this reconstructs the exact parked pose; at t=1 it is the
      // ring point at azimuthRef, which is where the orbit branch below continues from - no snap.
      const e = easeInOut(tProgressRef.current)
      const r = startRadiusRef.current + (radius - startRadiusRef.current) * e
      const p = startPolarRef.current + (polarAngle - startPolarRef.current) * e
      ringPoint(scratch, center, r, p, azimuthRef.current)
      if (tProgressRef.current >= 1) phaseRef.current = 'orbit'
    } else {
      if (!draggingRef.current) azimuthRef.current += autoRotateSpeed * dt
      ringPoint(scratch, center, radius, polarAngle, azimuthRef.current)
    }

    // Self-centering 2-axis parallax. Y follows mouse Y whenever the mouse is active over the canvas.
    // X follows mouse X too, EXCEPT while drag-scrubbing the orbit - then X eases to 0 so the sideways
    // float never compounds the drag rotation. Both ease back to neutral when the mouse settles/leaves.
    const active = mouseOverRef.current && elapsedRef.current - lastMoveElapsedRef.current < settleSeconds
    const desiredY = active ? parallaxTargetYRef.current : 0
    const desiredX = active && !draggingRef.current ? parallaxTargetXRef.current : 0
    const k = Math.min(1, parallaxEase * dt)
    parallaxCurrentYRef.current += (desiredY - parallaxCurrentYRef.current) * k
    parallaxCurrentXRef.current += (desiredX - parallaxCurrentXRef.current) * k

    // Ring position + vertical parallax.
    camera.position.set(scratch.x, scratch.y + parallaxCurrentYRef.current, scratch.z)
    // Horizontal parallax: shift sideways along the camera's RIGHT vector (view-relative, so it stays
    // consistent as the camera orbits) rather than a fixed world axis. right = normalize(forward x
    // worldUp); forward = center - camera. three's normalize is zero-safe and the ring polar is a
    // fixed oblique angle (never top-down), so this is never degenerate in steady state.
    fwd.subVectors(center, camera.position).normalize()
    right.crossVectors(fwd, WORLD_UP).normalize()
    camera.position.addScaledVector(right, parallaxCurrentXRef.current)
    // Keep the disabled OrbitControls' target in sync with where we look, so a subsequent CameraRig
    // select-flight starts from controls.target = center (no orientation jump on the handoff). During
    // the return transition, ease the aim from the held framing target to center over the same
    // tProgress as the position, so orientation and position land together (no one-frame look-at pop
    // on the first idle frame). Once orbiting, aim straight at center.
    if (phaseRef.current === 'transition') {
      if (nearPoleRef.current) {
        // Pole-safe: slerp from the parked orientation to the ring-landing orientation (lookAt would
        // roll at the near-vertical start). controls.target is only read by the next select-flight, so
        // point it at center now to match the landing.
        camera.quaternion.slerpQuaternions(startQuatRef.current, endQuatRef.current, easeInOut(tProgressRef.current))
        if (controls) controls.target.copy(center)
      } else {
        aimScratch.lerpVectors(startTargetRef.current, center, easeInOut(tProgressRef.current))
        if (controls) controls.target.copy(aimScratch)
        camera.lookAt(aimScratch)
      }
    } else {
      if (controls) controls.target.copy(center)
      camera.lookAt(center)
    }
  })

  return null
}
