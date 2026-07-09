import { useRef, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import MainBuilding from './MainBuilding'
import { locationsConfig } from './locationsConfig'
import mainBuildingUrl from '../assets/locations/MainBuilding.glb?url'
import { buildingPulseUniforms } from './buildingPulse'

// Placement wrapper for MainBuilding: renders the model at the baked
// locationsConfig.mainBuilding transform.
//
// The DEV placement gizmo (TransformControls drag/rotate/scale, the [ ] resize +
// W/E/R keys, and a 'log-building' listener that prints a paste-ready transform)
// is COMMENTED OUT below. To re-place the building later, restore the four
// commented sections in this file and un-comment the matching "Log building
// transform" button in src/components/locations/LocationsView.jsx.

// --- gizmo imports (re-enable) ---
// import { useEffect } from 'react'
// import { TransformControls } from '@react-three/drei'

// --- gizmo helpers (re-enable) ---
// const DEV = import.meta.env.DEV
// const r3 = (v) => Math.round(v * 1000) / 1000
// const deg = (rad) => (Math.round((rad * 180) / Math.PI) * 10) / 10

export default function MainBuildingRig() {
  const groupRef = useRef() // kept wired to the group so the gizmo re-enables cleanly
  // const tcRef = useRef()
  const { position, rotation, scale } = locationsConfig.mainBuilding
  const { speed } = locationsConfig.buildingPulse

  // Cached GLTF (same object MainBuilding uses) — a readiness signal for measuring.
  const { nodes } = useGLTF(mainBuildingUrl)

  // Drive the pulse flow. Wrap the phase to [0,1) on the CPU (float64) so the value
  // uploaded to the shader stays small and float32-precise on long kiosk uptime,
  // instead of feeding an ever-growing elapsed time into fract() in the shader.
  useFrame((s) => {
    buildingPulseUniforms.uPulsePhase.value = (s.clock.elapsedTime * speed) % 1
  })

  // Feed the pulse band its world-space Y bounds so it self-calibrates to the
  // actual on-screen building (survives any mainBuilding placement change). Measure
  // groupRef — it carries the placement transform — after the geometry has loaded.
  useLayoutEffect(() => {
    const g = groupRef.current
    if (!g) return
    g.updateWorldMatrix(true, true) // ensure the placement transform is baked before measuring
    const box = new THREE.Box3().setFromObject(g)
    buildingPulseUniforms.uMinY.value = box.min.y
    buildingPulseUniforms.uMaxY.value = box.max.y
  }, [nodes])

  // --- gizmo keyboard + logger (re-enable) ---
  // useEffect(() => {
  //   if (!DEV) return
  //   const onKey = (e) => {
  //     const tc = tcRef.current
  //     const g = groupRef.current
  //     if (e.key === 'w') tc?.setMode?.('translate')
  //     else if (e.key === 'e') tc?.setMode?.('rotate')
  //     else if (e.key === 'r') tc?.setMode?.('scale')
  //     else if (e.key === ']' && g) g.scale.multiplyScalar(1.1)
  //     else if (e.key === '[' && g) g.scale.multiplyScalar(0.9)
  //   }
  //   const onLog = () => {
  //     const g = groupRef.current
  //     if (!g) return
  //     const p = g.position
  //     const rot = g.rotation
  //     const s = g.scale
  //     console.log(
  //       `%c[Locations] MainBuilding transform  // paste into src/three/locationsConfig.js\n` +
  //         `mainBuilding: {\n` +
  //         `  position: [${r3(p.x)}, ${r3(p.y)}, ${r3(p.z)}],\n` +
  //         `  rotation: [${r3(rot.x)}, ${r3(rot.y)}, ${r3(rot.z)}], // deg [${deg(rot.x)}, ${deg(rot.y)}, ${deg(rot.z)}]\n` +
  //         `  scale: [${r3(s.x)}, ${r3(s.y)}, ${r3(s.z)}],\n` +
  //         `},`,
  //       'color:#7dd3fc;font-weight:bold',
  //     )
  //   }
  //   window.addEventListener('keydown', onKey)
  //   window.addEventListener('log-building', onLog)
  //   return () => {
  //     window.removeEventListener('keydown', onKey)
  //     window.removeEventListener('log-building', onLog)
  //   }
  // }, [])

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <MainBuilding />
    </group>
  )

  // --- gizmo render path (re-enable) — replace the return above with this ---
  // const model = (
  //   <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
  //     <MainBuilding />
  //   </group>
  // )
  // if (!DEV) return model
  // return (
  //   <>
  //     {model}
  //     <TransformControls ref={tcRef} object={groupRef} mode="translate" />
  //   </>
  // )
}
