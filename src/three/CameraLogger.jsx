import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

// [dev camera capture - commented out, restore together]
// CURRENTLY UNUSED: nothing imports this file. Its render in src/three/LocationsCanvas.jsx and the
// capture panel in src/components/locations/LocationsView.jsx that dispatches 'log-camera' are both
// commented out. Kept in place for later reuse; restore it together with that set. The file itself
// is unchanged and needs no edits to come back.
//
// Dev-only helper (renders nothing). Listens for a window 'log-camera' event and,
// on that event, prints the current camera.position AND the OrbitControls target as
// a rounded, copy-paste-ready block for src/three/locationsConfig.js. Position alone
// cannot reproduce an orbit view — the look-at target is required too. The event carries
// detail.locationId (chosen in the LocationsView capture panel), so the first line is an
// id-keyed entry pasteable per route. Gated at the call site behind import.meta.env.DEV;
// delete this file when the framings are dialed in.
const round = (v) => Math.round(v * 10) / 10

export default function CameraLogger() {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)

  useEffect(() => {
    const log = (e) => {
      if (!controls) return
      const p = camera.position
      const t = controls.target
      const id = e?.detail?.locationId || 'LOCATION_ID'
      console.log(
        `%c[Locations] camera snapshot (${id})\n` +
          `// ${id}\n` +
          `'${id}': { position: [${round(p.x)}, ${round(p.y)}, ${round(p.z)}], ` +
          `target: [${round(t.x)}, ${round(t.y)}, ${round(t.z)}] },\n\n` +
          `// paste into src/three/locationsConfig.js\n` +
          `camera: { position: [${round(p.x)}, ${round(p.y)}, ${round(p.z)}], ` +
          `fov: ${camera.fov}, near: ${camera.near}, far: ${camera.far} },\n` +
          `controls: { target: [${round(t.x)}, ${round(t.y)}, ${round(t.z)}], ` +
          `/* keep existing minDistance/maxDistance/maxPolarAngle */ },`,
        'color:#7dd3fc;font-weight:bold',
      )
    }
    window.addEventListener('log-camera', log)
    return () => window.removeEventListener('log-camera', log)
  }, [camera, controls])

  return null
}
