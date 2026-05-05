import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useEffect, useState } from 'react'
import { gsap } from '../gsap/Gsapconfig'
import { makeTowerDepthMaterial } from './towerDepthMaterial'
import { pointerState } from './pointerState'

const POINTER_AMPLITUDE = 0.06
const POINTER_LERP = 0.08
const POINTER_RETURN_TO_REST = 0.04
const RAGGEDY_UV_THRESHOLD = 0.14

const TRANSITION_DURATION = 1.4
const TRANSITION_EASE = 'power2.inOut'

const TowerDepthPlane = ({ tower, color, depth }) => {
  const meshRef = useRef()
  const { camera, size } = useThree()

  const target = useRef({ x: 0, y: 0 })
  const isOver = useRef(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const material = useMemo(() => makeTowerDepthMaterial(color, depth), [])

  useEffect(() => () => material.dispose(), [material])

  const prevTowerIdRef = useRef(tower.id)
  const [geometryAspect, setGeometryAspect] = useState(() =>
    color.image ? color.image.width / color.image.height : 1,
  )

  useEffect(() => {
    const mat = meshRef.current?.material
    if (!mat) return
    const u = mat.uniforms

    if (prevTowerIdRef.current === tower.id) return
    if (u.uColor.value === color && u.uDepth.value === depth) return

    u.uPrevColor.value = u.uColor.value
    u.uPrevDepth.value = u.uDepth.value
    u.uColor.value = color
    u.uDepth.value = depth
    // Start at a tiny non-zero value so the first rendered frame routes into
    // the dissolve branch (showing prev), not the else fast-path.
    u.uTransition.value = 0.001

    gsap.to(u.uTransition, {
      value: 1,
      duration: TRANSITION_DURATION,
      ease: TRANSITION_EASE,
      overwrite: 'auto',
      onComplete: () => {
        if (color.image) {
          setGeometryAspect(color.image.width / color.image.height)
        }
      },
    })

    prevTowerIdRef.current = tower.id

    return () => {
      gsap.killTweensOf(u.uTransition)
    }
  }, [tower, color, depth])

  const { width: planeW, height: planeH } = useMemo(() => {
    const aspect = size.width / size.height
    const frustumH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
    const frustumW = frustumH * aspect
    if (aspect > geometryAspect) {
      return { width: frustumW, height: frustumW / geometryAspect }
    }
    return { width: frustumH * geometryAspect, height: frustumH }
  }, [geometryAspect, size, camera])

  useFrame(() => {
    if (!meshRef.current) return
    const u = meshRef.current.material.uniforms.uMouse.value
    const lerp = isOver.current ? POINTER_LERP : POINTER_RETURN_TO_REST
    u.x += (target.current.x - u.x) * lerp
    u.y += (target.current.y - u.y) * lerp
    pointerState.x = u.x
    pointerState.y = u.y
  })

  const handlePointerMove = (e) => {
    if (!e.uv || e.uv.x < RAGGEDY_UV_THRESHOLD) {
      if (isOver.current) {
        isOver.current = false
        target.current.x = 0
        target.current.y = 0
      }
      return
    }
    isOver.current = true
    target.current.x = (e.uv.x - 0.5) * 2 * POINTER_AMPLITUDE
    target.current.y = (e.uv.y - 0.5) * 2 * POINTER_AMPLITUDE
  }

  const handlePointerLeave = () => {
    isOver.current = false
    target.current.x = 0
    target.current.y = 0
  }

  return (
    <mesh
      ref={meshRef}
      material={material}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <planeGeometry args={[planeW, planeH, 1, 1]} />
    </mesh>
  )
}

export default TowerDepthPlane
