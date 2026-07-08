import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useLoader, useThree, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import * as THREE from 'three'
import { locationsConfig } from './locationsConfig'
import { patchLocationsFog, fogUniforms } from './locationsFog'
import { makeWaterMaterial } from './waterMaterial'

import mapUrl from '../assets/locations/Map.glb?url'
import waterNormalUrl from '../assets/locations/water/waternormals.jpg?url'
import terrainKtx from '../assets/locations/rivalibakes/Terrain.ktx2?url'
import nearKtx from '../assets/locations/rivalibakes/BuildingsNear.ktx2?url'
import far1Ktx from '../assets/locations/rivalibakes/BuildingsFar1.ktx2?url'
import far2Ktx from '../assets/locations/rivalibakes/BuildingsFar2.ktx2?url'

// Self-hosted DRACO decoder (offline kiosk) — the GLB is DRACO-compressed and
// geometry-only. Point drei's loader at the local copy in public/draco.
useGLTF.setDecoderPath('/draco/')
useGLTF.preload(mapUrl)

const { materials: mat } = locationsConfig

// The GLB carries no materials or textures; every material is assigned here.
// Baked color maps are 4 separate KTX2 files (not referenced by the GLB), loaded
// manually via KTX2Loader. Lighting is baked, so all materials are unlit
// MeshBasicMaterial with toneMapped={false} and the scene has no lights.
const RivaliMap = () => {
  const gl = useThree((s) => s.gl)
  const { nodes } = useGLTF(mapUrl)
  const groupRef = useRef()

  // Recenter the whole map on the origin (where the camera and OrbitControls
  // target already point). The GLB is authored only "near" origin, so measure
  // the combined bounds once loaded and shift horizontally by -center. Vertical
  // is left as authored so the ground plane stays at its baked height.
  useLayoutEffect(() => {
    const g = groupRef.current
    if (!g) return
    g.position.set(0, 0, 0)
    const box = new THREE.Box3().setFromObject(g)
    const center = box.getCenter(new THREE.Vector3())
    g.position.set(-center.x, 0, -center.z)
  }, [nodes])

  // Single loader call; the returned order matches the input array.
  const bakes = useLoader(
    KTX2Loader,
    [terrainKtx, nearKtx, far1Ktx, far2Ktx],
    (loader) => {
      loader.setTranscoderPath('/basis/')
      loader.detectSupport(gl)
    },
  )

  // Configure each texture once. flipY is ignored on KTX2 CompressedTextures, so
  // if the bakes look vertically flipped, flip V in-shader instead (see below).
  const [terrain, near, far1, far2] = useMemo(() => {
    bakes.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = gl.capabilities.getMaxAnisotropy()
      // If flipped: tex.wrapT = THREE.RepeatWrapping; tex.repeat.y = -1; tex.offset.y = 1
    })
    return bakes
  }, [bakes, gl])

  // Water normal map: a data texture (must NOT be sRGB), tiled in world-XZ, with
  // anisotropy so the large sea does not shimmer at grazing angles. The texture is
  // configured inside makeWaterMaterial (a plain factory) so we never mutate the
  // useLoader return here.
  const waterNormal = useLoader(THREE.TextureLoader, waterNormalUrl)
  const waterMaterial = useMemo(
    () => makeWaterMaterial(waterNormal, gl.capabilities.getMaxAnisotropy()),
    [waterNormal, gl],
  )
  useEffect(() => () => waterMaterial.dispose(), [waterMaterial])

  // Advance the shared fog-noise time uniform. Harmless while fogNoiseSpeed is 0.
  // Also drives the water ripples/glint (shared uTime uniform ref).
  useFrame((s) => {
    fogUniforms.uTime.value = s.clock.elapsedTime
  })

  return (
    // dispose={null} — this route is entered/exited repeatedly on the kiosk;
    // keep the cached useGLTF geometry alive across unmounts.
    <group ref={groupRef} dispose={null}>
      {/* Baked meshes */}
      <mesh geometry={nodes.Terrain_Baked.geometry}>
        <meshBasicMaterial map={terrain} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>
      <mesh geometry={nodes.BuildingsNear.geometry}>
        <meshBasicMaterial map={near} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>
      <mesh geometry={nodes.BuildingsFar1_Baked.geometry}>
        <meshBasicMaterial map={far1} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>
      <mesh geometry={nodes.BuildingsFar2_Baked.geometry}>
        <meshBasicMaterial map={far2} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>

      {/* Plinth */}
      <mesh geometry={nodes.Plinth.geometry}>
        <meshBasicMaterial color={mat.plinth} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>

      {/* Roads */}
      <mesh geometry={nodes.Roads_Motorway.geometry}>
        <meshBasicMaterial color={mat.road} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>
      <mesh geometry={nodes.Roads_Trunk.geometry}>
        <meshBasicMaterial color={mat.road} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>
      <mesh geometry={nodes.Roads_Primary.geometry}>
        <meshBasicMaterial color={mat.road} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>
      <mesh geometry={nodes.Roads_Secondary.geometry}>
        <meshBasicMaterial color={mat.road} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>
      <mesh geometry={nodes.Roads_Tertiary.geometry}>
        <meshBasicMaterial color={mat.road} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>
      <mesh geometry={nodes.Roads_Residential.geometry}>
        <meshBasicMaterial color={mat.road} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>
      <mesh geometry={nodes.Roads_Unclassified.geometry}>
        <meshBasicMaterial color={mat.road} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>
      <mesh geometry={nodes.Roads_Pedestrian.geometry}>
        <meshBasicMaterial color={mat.road} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>
      <mesh geometry={nodes.Roads_Service.geometry}>
        <meshBasicMaterial color={mat.road} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>
      <mesh geometry={nodes.Roads_Track.geometry}>
        <meshBasicMaterial color={mat.road} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>

      {/* Railways */}
      <mesh geometry={nodes.Railways.geometry}>
        <meshBasicMaterial color={mat.railway} toneMapped={false} onBeforeCompile={patchLocationsFog} />
      </mesh>

      {/* Water — custom ocean shader (see waterMaterial.js); shares the map's fog.
          Retopo_SmallWater2 keeps its authored node offset (y = 11.36).
          The GLB node "Retopo_LargeWater.002" is keyed as Retopo_LargeWater002
          here: three's GLTFLoader strips reserved chars (the dot) from names. */}
      <mesh geometry={nodes.Retopo_SmallWater2.geometry} position={[0, 11.36, 0]} material={waterMaterial} />
      <mesh geometry={nodes.Retopo_LargeWater002.geometry} material={waterMaterial} />
    </group>
  )
}

export default RivaliMap
