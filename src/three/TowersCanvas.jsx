import { Suspense } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { towers } from '../data/towers'
import TowerDepthPlane from './TowerDepthPlane'

const ALL_TOWER_PATHS = towers.flatMap((t) => [t.image, t.depth])

useTexture.preload(ALL_TOWER_PATHS)

// Single useTexture call with a stable input array. Suspends only on initial
// mount (or never, if drei's preload populated the cache). Tower selection is
// an index into the resolved array, so changing activeIndex does NOT trigger
// re-suspension and TowerDepthPlane stays continuously rendered through every
// transition.
const TextureProvider = ({ activeIndex }) => {
  const { gl } = useThree()
  const maxAniso = gl.capabilities.getMaxAnisotropy()

  const textures = useTexture(ALL_TOWER_PATHS, (texArr) => {
    texArr.forEach((tex, i) => {
      const isColor = i % 2 === 0
      tex.colorSpace = THREE.NoColorSpace
      if (isColor) {
        tex.anisotropy = maxAniso
        tex.minFilter = THREE.LinearMipmapLinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.generateMipmaps = true
      } else {
        tex.minFilter = THREE.LinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.generateMipmaps = false
      }
      tex.needsUpdate = true
    })
  })

  const tower = towers[activeIndex]
  const color = textures[activeIndex * 2]
  const depth = textures[activeIndex * 2 + 1]

  return <TowerDepthPlane tower={tower} color={color} depth={depth} />
}

const TowersCanvas = ({ activeIndex }) => (
  <Canvas
    dpr={2}
    camera={{ position: [0, 0, 5], fov: 45 }}
    gl={{
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    }}
    style={{ width: '100%', height: '100%' }}
  >
    <Suspense fallback={null}>
      <TextureProvider activeIndex={activeIndex} />
    </Suspense>
  </Canvas>
)

export default TowersCanvas
