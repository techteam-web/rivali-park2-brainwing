import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { towers } from '../data/towers'
import TowerDepthPlane from './TowerDepthPlane'

useTexture.preload(towers.flatMap((t) => [t.image, t.depth]))

const TowersCanvas = ({ activeIndex }) => {
  const tower = towers[activeIndex]
  return (
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
        <TowerDepthPlane tower={tower} />
      </Suspense>
    </Canvas>
  )
}

export default TowersCanvas
