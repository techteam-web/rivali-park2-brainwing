import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

// Dev-only helper (renders nothing). Listens for a window 'log-camera' event and,
// on that event, prints the current camera.position AND the OrbitControls target as
// a rounded, copy-paste-ready block for src/three/locationsConfig.js. Position alone
// cannot reproduce an orbit view — the look-at target is required too. Gated at the
// call site behind import.meta.env.DEV; delete this file when the framing is dialed in.
const round = (v) => Math.round(v * 10) / 10

export default function CameraLogger() {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)

  useEffect(() => {
    const log = () => {
      if (!controls) return
      const p = camera.position
      const t = controls.target
      console.log(
        `%c[Locations] camera snapshot\n` +
          `position: [${round(p.x)}, ${round(p.y)}, ${round(p.z)}]\n` +
          `target:   [${round(t.x)}, ${round(t.y)}, ${round(t.z)}]\n\n` +
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
