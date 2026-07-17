// [dev camera capture - commented out, restore together] useEffect was used only by the
// capture-mode sync effect at the bottom of this file. Restore it in this import when that
// effect comes back: import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from '../gsap/Gsapconfig'
import { getLocationCamera } from '../components/locations/locationCameras'
import { locationsConfig } from './locationsConfig'

// Drives the /locations SELECT flights with GSAP off activeCategory + selectedLocationId. The
// framing is resolved in priority order: the selected route's saved camera (locationCameras), else
// the open category's framing (locationsConfig.cameraViews). Orbit stays LOCKED (controls.enabled =
// false) for the whole session; selecting a route only reframes, it never changes the lock. When
// nothing is selected (idle) CameraRig does NOT fly: it kills any in-flight tween and hands the
// camera to IdleOrbitController, which eases it onto its ring from the current position (that owns
// the "return to default" now). Mounted at Canvas root as a sibling of RivaliMap/RouteLayer, so the
// route draw-on and the flight fire together off the same props. No fly on mount; an interruption
// redirects from the CURRENT framing (no snap).
const { cameraViews, cameraFlightDuration } = locationsConfig

// The framing a given (category, route) pair resolves to. The flight effect fires only when this key
// changes, so selecting a location with no saved camera keeps the category key and does not re-fly.
const resolveFlyKey = (activeCategory, selectedLocationId) => {
  if (selectedLocationId && getLocationCamera(selectedLocationId)) return selectedLocationId
  return activeCategory ?? '__default__'
}

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

// [dev camera capture - commented out, restore together] The captureMode prop below came from
// LocationsCanvas (and before it the LocationsView dev panel). Restore the signature as:
// export default function CameraRig({ activeCategory, selectedLocationId, captureMode }) {
export default function CameraRig({ activeCategory, selectedLocationId }) {
  // Imperative store accessor: camera/controls are read from get() inside the effect and mutated
  // directly (the R3F way to drive a camera). controls is null until OrbitControls (makeDefault)
  // registers, so guard for it.
  const get = useThree((s) => s.get)
  // Seeded with the mount-time resolve key: skip the fly on first run; only a real change flies.
  const prevRef = useRef(resolveFlyKey(activeCategory, selectedLocationId))
  const tlRef = useRef(null)             // running flight; killed to redirect from current values
  const slerpingRef = useRef(false)      // true while a slerp flight is in progress (for redirects)

  /* [dev camera capture - commented out, restore together]
     DEV capture mode: read through a ref so the flight callbacks below see the latest value
     without re-subscribing the effect (no killing an in-flight tween on toggle). Kept in sync by
     the capture-toggle effect at the bottom of this file, not during render.

  const captureModeRef = useRef(captureMode)
  */

  useLayoutEffect(() => {
    const flyKey = resolveFlyKey(activeCategory, selectedLocationId)
    if (prevRef.current === flyKey) return
    const { camera, controls } = get()
    if (!controls) return
    prevRef.current = flyKey

    // Framing hierarchy: the selected route's saved camera wins, else the open category's framing.
    // A selected location with no saved camera falls back to the category framing rather than
    // flying to nothing.
    const routeView = selectedLocationId ? getLocationCamera(selectedLocationId) : null
    const categoryView = (activeCategory && cameraViews[activeCategory]) || null

    // Idle (nothing selected): hand the camera to IdleOrbitController, which eases it onto its ring
    // from wherever the camera currently is. CameraRig owns only the SELECT flights now, so it must
    // fully release the camera here: kill any in-flight tween so exactly one owner writes the camera
    // on the handoff frame (single-owner guarantee). Do NOT re-frame and do NOT re-enable controls.
    if (!routeView && !categoryView) {
      tlRef.current?.kill()
      gsap.killTweensOf(camera.position)
      gsap.killTweensOf(camera.quaternion) // in case a pole-slerp flight was mid-air
      gsap.killTweensOf(controls.target)
      slerpingRef.current = false
      return
    }
    const view = routeView || categoryView

    // Interrupt any running flight and start fresh FROM the current framing (no snap). Killing a
    // timeline leaves camera.position/controls.target where they are, so the new tweens snapshot
    // those as their start.
    tlRef.current?.kill()
    gsap.killTweensOf(camera.position)
    gsap.killTweensOf(controls.target)

    // Lock orbit immediately for the whole flight (drei only calls controls.update() while enabled,
    // so this also stops it fighting our tween).
    // [dev camera capture - commented out, restore together] Capture mode suspended this lock so you
    // could orbit with a category open. Restore as: if (!captureModeRef.current) controls.enabled = false
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
        // Category or route view: leave controls.enabled = false (LOCKED). The idle return is no
        // longer a CameraRig flight - deselect hands off to IdleOrbitController (see the idle bail
        // above), so there is no unlock-on-return branch here anymore.
        // [dev camera capture - commented out, restore together] Capture mode force-unlocked here:
        // if (captureModeRef.current) { controls.enabled = true; controls.update() }
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
  }, [activeCategory, selectedLocationId, get])

  /* [dev camera capture - commented out, restore together]
     DEV capture mode toggle: re-sync the lock when the flag flips with a category already open
     (the flight effect above does not run then, because activeCategory is unchanged). On -> unlock
     so you can orbit; off -> restore the category lock. No-op in production (captureMode is always
     false there, so it never unlocks and never touches the return-to-default flight).
     Restoring this also needs: the captureMode prop, the captureModeRef above, the two lock sites
     in the flight effect, and useEffect back in the react import.

  useEffect(() => {
    captureModeRef.current = captureMode // keep the flight callbacks' view of the flag current
    const { controls } = get()
    if (!controls) return
    if (captureMode) controls.enabled = true
    else if (activeCategory && cameraViews[activeCategory]) controls.enabled = false
  }, [captureMode, activeCategory, get])
  */

  return null
}
