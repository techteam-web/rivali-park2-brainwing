import { useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { CatmullRomLine, Html } from '@react-three/drei'
import * as THREE from 'three'

// Dev-only helper for authoring per-location camera paths on the /locations map.
// With Capture on, a click (press and release without moving) raycasts the map and
// drops the hit point as the next ordered waypoint; a drag still orbits (handled by
// OrbitControls) and drops nothing. The tool previews a Catmull-Rom curve through the
// points (the same curve the camera pass will follow), then Copy path writes a
// paste-ready [x,y,z] array to the clipboard and console, tagged with a typed id.
// Talks to the DOM panel in LocationsView via window events, mirroring CameraLogger.
// Gated at the call site behind import.meta.env.DEV; delete this file once the paths
// are captured.
const DRAG_THRESHOLD = 6      // px between down/up above which it's a drag (orbit), not a click
const POINT_RADIUS = 10       // world units; small so waypoints stay precise. Bump if hard to see when zoomed out
const COINCIDENT_EPS = 0.01   // world units; a new hit closer than this to the last point is dropped
const round = (v) => Math.round(v * 100) / 100
// true if the object or any ancestor is part of the tracer, so tool geometry is never picked
const isTracer = (o) => { let p = o; while (p) { if (p.userData?.tracerIgnore) return true; p = p.parent } return false }

export default function RoadPathTracer() {
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const scene = useThree((s) => s.scene)
  const raycaster = useThree((s) => s.raycaster)

  const [points, setPoints] = useState([])   // THREE.Vector3[]
  const captureRef = useRef(false)
  const downRef = useRef(null)
  const pointsRef = useRef(points)

  // tracer -> DOM: keep the panel's live count in sync, and mirror points into a ref
  // for the copy handler. Emitted from an effect (not inside the setPoints updater, and
  // not by assigning the ref during render) so it fires exactly once per change, even
  // under the StrictMode double-invoke of updaters in dev.
  useEffect(() => {
    pointsRef.current = points
    window.dispatchEvent(new CustomEvent('road-path-changed', { detail: { count: points.length } }))
  }, [points])

  // click = drop point, drag = orbit. pointerdown records the start on the canvas;
  // pointerup/pointercancel listen on window so a release outside the canvas still
  // resets cleanly and can never leave stale state.
  useEffect(() => {
    const el = gl.domElement
    const onDown = (e) => { downRef.current = { x: e.clientX, y: e.clientY } }
    const onCancel = () => { downRef.current = null }
    const onUp = (e) => {
      if (!captureRef.current || !downRef.current) return
      const dx = e.clientX - downRef.current.x
      const dy = e.clientY - downRef.current.y
      downRef.current = null
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) return
      const rect = el.getBoundingClientRect()
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(ndc, camera)
      const hit = raycaster.intersectObject(scene, true).find((h) => !isTracer(h.object))
      if (!hit) return
      // Drop a hit that lands on top of the previous point. Centripetal Catmull-Rom
      // divides by the distance between consecutive points, so coincident waypoints
      // (an easy double-click, especially on touch) would produce NaN and blank the curve.
      setPoints((prev) => {
        const last = prev[prev.length - 1]
        if (last && last.distanceToSquared(hit.point) < COINCIDENT_EPS * COINCIDENT_EPS) return prev
        return [...prev, hit.point.clone()]
      })
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [gl, camera, scene, raycaster])

  // DOM -> tracer controls.
  useEffect(() => {
    const onToggle = (e) => { captureRef.current = !!e.detail?.enabled }
    const onUndo = () => setPoints((prev) => prev.slice(0, -1))
    const onClear = () => setPoints([])
    const onCopy = (e) => {
      const id = (e.detail?.locationId || '').trim() || 'LOCATION_ID'
      const body = pointsRef.current.map((p) => `    [${round(p.x)}, ${round(p.y)}, ${round(p.z)}],`).join('\n')
      const text = `// cameraPath for ${id}\ncameraPath: [\n${body}\n],`
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {})
      console.log(`%c[RoadPathTracer] ${pointsRef.current.length} points copied\n${text}`, 'color:#f59e0b;font-weight:bold')
    }
    window.addEventListener('road-capture-toggle', onToggle)
    window.addEventListener('road-path-undo', onUndo)
    window.addEventListener('road-path-clear', onClear)
    window.addEventListener('road-path-copy', onCopy)
    return () => {
      window.removeEventListener('road-capture-toggle', onToggle)
      window.removeEventListener('road-path-undo', onUndo)
      window.removeEventListener('road-path-clear', onClear)
      window.removeEventListener('road-path-copy', onCopy)
    }
  }, [])

  // All tool geometry is tagged tracerIgnore (so it is never raycast), drawn with
  // depthTest off and a high renderOrder so it paints over the map even where a road
  // dips behind terrain, regardless of material creation order.
  return (
    <group userData={{ tracerIgnore: true }}>
      {points.map((p, i) => (
        <mesh key={i} position={p} renderOrder={999}>
          <sphereGeometry args={[POINT_RADIUS, 16, 16]} />
          <meshBasicMaterial
            color={i === 0 ? '#22c55e' : i === points.length - 1 ? '#ef4444' : '#f59e0b'}
            toneMapped={false}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
      ))}
      {points.map((p, i) => (
        <Html key={`l${i}`} position={p} center zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#111', background: 'rgba(255,255,255,.85)', padding: '0 4px', borderRadius: 3 }}>{i}</span>
        </Html>
      ))}
      {points.length >= 2 && (
        <CatmullRomLine points={points} curveType="centripetal" color="#f59e0b" lineWidth={3} depthTest={false} renderOrder={999} />
      )}
    </group>
  )
}
