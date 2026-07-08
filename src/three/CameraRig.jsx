import { useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from '../gsap/Gsapconfig'
import { locationsConfig } from './locationsConfig'

// Drives the /locations camera with GSAP off activeCategory. Tapping a category flies to its saved
// framing (locationsConfig.cameraViews) and LOCKS orbit (controls.enabled = false) for the whole
// flight and after; tapping off (activeCategory -> null) flies back to the default framing
// (locationsConfig.camera.position + controls.target) and UNLOCKS. Mounted at Canvas root as a
// sibling of RivaliMap/RouteLayer, so the route draw-on and the flight fire together off the same
// prop. No fly on mount; an interruption redirects from the CURRENT framing (no snap).
const { cameraViews, camera: defaultCamera, controls: defaultControls, cameraFlightDuration } = locationsConfig

// A framing whose camera sits almost directly over its target (offset nearly parallel to world up)
// is a gimbal-lock case for lookAt: driving orientation with controls.update() snaps at the pole.
// When a flight starts or ends at such a framing (e.g. the top-down `access` view) we slerp the
// camera orientation instead, which has no pole singularity. Everything else keeps aiming at the
// moving target via controls.update() (unchanged), so the oblique views fly exactly as before.
const NEAR_POLE_TAN = Math.tan((12 * Math.PI) / 180) // horizontal/vertical ratio below this = near pole

const isNearPole = (px, py, pz, tx, ty, tz) => {
  const horizontal = Math.hypot(px - tx, pz - tz)
  return horizontal < Math.abs(py - ty) * NEAR_POLE_TAN
}

export default function CameraRig({ activeCategory }) {
  // Imperative store accessor: camera/controls are read from get() inside the effect and mutated
  // directly (the R3F way to drive a camera). controls is null until OrbitControls (makeDefault)
  // registers, so guard for it.
  const get = useThree((s) => s.get)
  const prevRef = useRef(activeCategory) // skip the fly on first run; only a real change flies
  const tlRef = useRef(null)             // running flight; killed to redirect from current values
  const slerpingRef = useRef(false)      // true while a slerp flight is in progress (for redirects)

  useLayoutEffect(() => {
    const prev = prevRef.current
    if (prev === activeCategory) return
    const { camera, controls } = get()
    if (!controls) return
    prevRef.current = activeCategory

    const view = (activeCategory && cameraViews[activeCategory]) || {
      position: defaultCamera.position,
      target: defaultControls.target,
    }
    const returningToDefault = !(activeCategory && cameraViews[activeCategory])

    // Interrupt any running flight and start fresh FROM the current framing (no snap). Killing a
    // timeline leaves camera.position/controls.target where they are, so the new tweens snapshot
    // those as their start.
    tlRef.current?.kill()
    gsap.killTweensOf(camera.position)
    gsap.killTweensOf(controls.target)

    // Lock orbit immediately for the whole flight (drei only calls controls.update() while enabled,
    // so this also stops it fighting our tween).
    controls.enabled = false

    // Slerp orientation when either end of the flight is a near-top-down framing (avoids the lookAt
    // pole snap), or when this flight interrupts a still-running slerp (a redirect then stays on
    // the slerp branch and continues from the current orientation instead of snapping via lookAt).
    // Otherwise keep the camera aimed at the moving target via controls.update().
    const poleFlight =
      isNearPole(view.position[0], view.position[1], view.position[2], view.target[0], view.target[1], view.target[2]) ||
      isNearPole(camera.position.x, camera.position.y, camera.position.z, controls.target.x, controls.target.y, controls.target.z) ||
      slerpingRef.current
    slerpingRef.current = poleFlight

    let startQuat = null
    let endQuat = null
    const q = { t: 0 }
    if (poleFlight) {
      startQuat = camera.quaternion.clone()
      const m = new THREE.Matrix4().lookAt(
        new THREE.Vector3(view.position[0], view.position[1], view.position[2]),
        new THREE.Vector3(view.target[0], view.target[1], view.target[2]),
        camera.up,
      )
      endQuat = new THREE.Quaternion().setFromRotationMatrix(m)
    }

    tlRef.current = gsap.timeline({
      defaults: { duration: cameraFlightDuration, ease: 'power2.inOut', overwrite: 'auto' },
      onUpdate: poleFlight
        ? () => camera.quaternion.slerpQuaternions(startQuat, endQuat, q.t) // pole-safe orientation
        : () => controls.update(), // keep the camera looking at the moving target each frame
      onComplete: () => {
        slerpingRef.current = false // flight landed; the next flight re-evaluates fresh
        if (returningToDefault) {
          controls.enabled = true // unlock only after a completed return to default
          controls.update()
        }
        // category view: leave controls.enabled = false (LOCKED, option B)
      },
    })
    // Tween camera position and controls target together on one clock so the camera arcs to the
    // framing while re-aiming at the right point (q drives the orientation slerp for pole flights).
    tlRef.current.to(camera.position, { x: view.position[0], y: view.position[1], z: view.position[2] }, 0)
    tlRef.current.to(controls.target, { x: view.target[0], y: view.target[1], z: view.target[2] }, 0)
    if (poleFlight) tlRef.current.to(q, { t: 1 }, 0)

    return () => {
      tlRef.current?.kill()
    }
  }, [activeCategory, get])

  return null
}
