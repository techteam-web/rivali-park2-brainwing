import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import birdUrl from '../assets/locations/bird.glb?url'
import { locationsConfig } from './locationsConfig'

const { birds } = locationsConfig
const buildingPosition = locationsConfig.mainBuilding.position

// Unlit so the birds land at exactly their color value. The scene lights are hot
// (ambient 1.1 + hemi 1.8 + directional 2.5) with no tone-mapping pass, so a lit white
// material would clear bloom.threshold (1.0) and smear into blobs. The meshes are flat
// planes, so the lit shading this replaces was a constant anyway. Same trick the baked
// map uses. DoubleSide because a flat plane is otherwise invisible from behind.
const birdMaterial = new THREE.MeshBasicMaterial({
  color: birds.color,
  toneMapped: false,
  side: THREE.DoubleSide,
})

// Flock of 13 birds circling in the sky above MainBuilding. The GLB bakes flap + bob for a
// STATIONARY formation, so the orbit is added here as two nested pivots on top of the clips.
// Draco path is set globally in RivaliMap; this component must be imported after it.
const BirdFlock = () => {
  const orbitRef = useRef()
  const modelRef = useRef()
  const { scene, animations } = useGLTF(birdUrl)
  const { actions } = useAnimations(animations, modelRef)

  // Every clip, not just the wings: each bird's body track bakes its position in the
  // formation, so a clip left unplayed drops that bird back to the model origin.
  useEffect(() => {
    Object.values(actions).forEach((action) => action?.reset().play())
  }, [actions])

  // One material is shared by all 39 meshes in the GLB, whose baseColorFactor is black.
  // The identity guard keeps this idempotent across HMR and kiosk re-entry, since useGLTF
  // hands back a cached scene.
  useEffect(() => {
    const originals = new Set()
    scene.traverse((o) => {
      if (o.isMesh && o.material !== birdMaterial) {
        originals.add(o.material)
        o.material = birdMaterial
      }
    })
    originals.forEach((material) => material.dispose())
  }, [scene])

  useFrame((_, dt) => {
    if (orbitRef.current) orbitRef.current.rotation.y += birds.orbitSpeed * dt
  })

  return (
    // Outer pivot at the building center: rotating it sweeps everything below around the tower.
    <group
      ref={orbitRef}
      position={[
        buildingPosition[0],
        buildingPosition[1] + birds.heightOffset,
        buildingPosition[2],
      ]}
    >
      {/* The radius arm. Ry(t) carries the local point (r, 0, 0) to (r*cos t, 0, -r*sin t), so
          travel at t = 0 is along -Z. The birds' baked forward is +Z, and Ry(yaw) sends (0,0,1)
          to (sin yaw, 0, cos yaw), which equals (0, 0, -1) at yaw = PI. Fixed rotation on a
          rotating arm, so tangent at one point means tangent all the way around: no per-frame
          facing math, and the formation stays one rigid unit. This group must sit ABOVE the
          GLB's Bird containers, whose own rotation is driven by the BirdAction clips. */}
      <group position={[birds.orbitRadius, 0, 0]} rotation={[0, birds.tangentYaw, 0]}>
        {/* useAnimations targets this subtree, so the clips stay independent of the orbit above. */}
        <group ref={modelRef} scale={birds.scale}>
          <primitive object={scene} dispose={null} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload(birdUrl)

export default BirdFlock
