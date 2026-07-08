import { useRef } from 'react'
import MainBuilding from './MainBuilding'
import { locationsConfig } from './locationsConfig'

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
