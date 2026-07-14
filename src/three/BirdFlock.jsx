import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import birdUrl from '../assets/locations/bird.glb?url'

// One flock of 13 birds circling a point in the sky. The GLB bakes flap + bob for a
// STATIONARY formation, so the orbit is added here as two nested pivots on top of the clips.
// Every dial arrives via `config` so the same GLB mounts once per locationsConfig.flocks entry;
// config.center is WORLD-space (this is mounted at Canvas root, not under the building rig).
// Draco path is set globally in RivaliMap; this component must be imported after it.
const BirdFlock = ({ config }) => {
  const { center, heightOffset, scale, orbitRadius, orbitSpeed, tangentYaw, color } = config
  const orbitRef = useRef()
  const modelRef = useRef()
  const { scene, animations } = useGLTF(birdUrl)

  // useGLTF hands back ONE cached scene. Mounting <primitive object={scene}> per flock would
  // reparent that single Object3D (last flock wins), and the flocks' mixers would all bind to
  // the same nodes and fight every frame. Clone so each flock owns its nodes. There are no
  // SkinnedMeshes here, so this degrades to a recursive Object3D.clone: node names survive
  // (the clips bind by name) and geometry/material stay shared by reference.
  const model = useMemo(() => cloneSkeleton(scene), [scene])

  // One mixer per component instance, bound to this flock's clone.
  const { actions } = useAnimations(animations, modelRef)

  // Unlit so the birds land at exactly their color value. The scene lights are hot
  // (ambient 1.1 + hemi 1.8 + directional 2.5) with no tone-mapping pass, so a lit white
  // material would clear bloom.threshold (1.0) and smear into blobs. The meshes are flat
  // planes, so the lit shading this replaces was a constant anyway. Same trick the baked
  // map uses. DoubleSide because a flat plane is otherwise invisible from behind.
  // One material per flock, since color is per-flock. Not R3F-managed, so dispose it here;
  // keying the cleanup on identity covers StrictMode remounts and an HMR color edit.
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color, toneMapped: false, side: THREE.DoubleSide }),
    [color],
  )
  useEffect(() => () => material.dispose(), [material])

  // Paint only OUR clone. The GLB's own materials (39 meshes, baseColorFactor black) are NOT
  // disposed: every clone starts out referencing those same objects and the useGLTF cache still
  // owns them, so disposing from one flock would yank them out from under the others. They cost
  // nothing left alone, as the cached scene never enters the render graph and never compiles a
  // program. Layout effect so no frame paints the black baseColor first.
  useLayoutEffect(() => {
    model.traverse((o) => {
      if (o.isMesh) o.material = material
    })
  }, [model, material])

  // Every clip, not just the wings: each bird's body track bakes its position in the
  // formation, so a clip left unplayed drops that bird back to the model origin.
  useEffect(() => {
    Object.values(actions).forEach((action) => action?.reset().play())
  }, [actions])

  useFrame((_, dt) => {
    if (orbitRef.current) orbitRef.current.rotation.y += orbitSpeed * dt
  })

  return (
    // Outer pivot at the flock center: rotating it sweeps everything below around that point.
    <group ref={orbitRef} position={[center[0], center[1] + heightOffset, center[2]]}>
      {/* The radius arm. Ry(t) carries the local point (r, 0, 0) to (r*cos t, 0, -r*sin t), so
          travel at t = 0 is along -Z. The birds' baked forward is +Z, and Ry(yaw) sends (0,0,1)
          to (sin yaw, 0, cos yaw), which equals (0, 0, -1) at yaw = PI. Fixed rotation on a
          rotating arm, so tangent at one point means tangent all the way around: no per-frame
          facing math, and the formation stays one rigid unit. Center and radius do not enter the
          derivation, but the SIGN of orbitSpeed does, so each flock's tangentYaw must track its
          own orbitSpeed (PI when positive, 0 when negative). This group must sit ABOVE the
          GLB's Bird containers, whose own rotation is driven by the BirdAction clips. */}
      <group position={[orbitRadius, 0, 0]} rotation={[0, tangentYaw, 0]}>
        {/* useAnimations targets this subtree, so the clips stay independent of the orbit above. */}
        <group ref={modelRef} scale={scale}>
          {/* dispose={null}: the clone shares geometry with the cached GLTF. R3F 9 never
              auto-disposes a primitive, so this documents intent more than it guards. */}
          <primitive object={model} dispose={null} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload(birdUrl)

export default BirdFlock
