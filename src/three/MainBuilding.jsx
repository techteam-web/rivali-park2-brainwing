import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'

import mainBuildingUrl from '../assets/locations/MainBuilding.glb?url'
import { locationsConfig } from './locationsConfig'
import { patchBuildingPulse } from './buildingPulse'

const colorBoost = locationsConfig.mainBuildingColorBoost

// gltfjsx output for MainBuilding.glb. Unlike the unlit map, this GLB keeps its
// embedded standard materials (adskMat*, Central_Courtyard) — they need the lights
// added in LocationsCanvas to be visible. Draco path is set globally in RivaliMap.
// dispose={null}: the /locations route is entered/exited repeatedly on the kiosk;
// keep the cached useGLTF geometry alive across unmounts.
export default function MainBuilding(props) {
  const { nodes, materials } = useGLTF(mainBuildingUrl)

  // Inject the always-on pulse into every embedded material via onBeforeCompile
  // (they are lit standard materials, not JSX ShaderMaterials, so patch not swap),
  // and brighten each material's dull base color once. Materials may be shared
  // across meshes; process each unique one once. The identity guard avoids
  // re-triggering a recompile - and re-multiplying the color - on kiosk re-entry
  // (materials are cached across unmounts via dispose={null}).
  useEffect(() => {
    const seen = new Set()
    Object.values(materials).forEach((m) => {
      if (!m || seen.has(m) || m.onBeforeCompile === patchBuildingPulse) return
      seen.add(m)
      if (m.color && colorBoost !== 1) m.color.multiplyScalar(colorBoost)
      m.onBeforeCompile = patchBuildingPulse
      m.needsUpdate = true
    })
  }, [materials])

  return (
    <group {...props} dispose={null}>
      <group
        position={[0.762, 176, -50.762]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        scale={[-1, 1, 1]}>
        <mesh castShadow receiveShadow geometry={nodes.Skyleap.geometry} material={materials.adskMatSkyleap} scale={0.025} />
      </group>
      <group
        position={[90.825, 19.848, 0.325]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.027, 1.015, 1]}>
        <mesh castShadow receiveShadow geometry={nodes.Tower_5.geometry} material={materials.adskMatTower_5} scale={0.025} />
      </group>
      <group position={[90.026, 23.7, -48.651]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh castShadow receiveShadow geometry={nodes.Moonrise.geometry} material={materials.adskMatMoonrise} scale={0.025} />
      </group>
      <group position={[82.876, 119.489, -106.303]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh castShadow receiveShadow geometry={nodes.Stargaze.geometry} material={materials.adskMatStargaze} scale={0.025} />
      </group>
      <group position={[29.386, 0, -122.885]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 1.247]}>
        <mesh castShadow receiveShadow geometry={nodes.Sunburst.geometry} material={materials.adskMatSunburst} scale={0.025} />
      </group>
      <group position={[27.112, 0, -0.212]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh castShadow receiveShadow geometry={nodes._5479.geometry} material={materials.Central_Courtyard} scale={0.025} />
      </group>
    </group>
  )
}

useGLTF.preload(mainBuildingUrl)
