import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

const LAYER_COLORS = [
  '#1F2F26', // TUNE: back blade — deep forest
  '#3F5A45', // TUNE: sage / pine
  '#C9B79C', // TUNE: putty / unbleached linen
  '#FAF9F6', // TUNE: front blade — section cream
]

const LAYER_BORDER = '1.42px solid #7A4833' // TUNE: brand-brown trim on every blade

const SectionCurtain = forwardRef((_props, ref) => {
  const containerRef = useRef(null)
  const layersRef = useRef([])

  useImperativeHandle(ref, () => ({
    getLayers: () => layersRef.current.filter(Boolean),
    resetLayers: () => {
      const layers = layersRef.current.filter(Boolean)
      if (layers.length) gsap.set(layers, { scaleY: 0 })
    },
  }))

  useGSAP(
    () => {
      const layers = layersRef.current.filter(Boolean)
      if (layers.length) gsap.set(layers, { scaleY: 0 })
    },
    { scope: containerRef },
  )

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 80 }}
      aria-hidden="true"
    >
      {LAYER_COLORS.map((color, i) => (
        <div
          key={i}
          ref={(el) => (layersRef.current[i] = el)}
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundColor: color,
            border: LAYER_BORDER,
            transformOrigin: '50% 0%',
            backfaceVisibility: 'hidden',
            zIndex: 81 + i,
            transform: 'scaleY(0)',
          }}
        />
      ))}
    </div>
  )
})

SectionCurtain.displayName = 'SectionCurtain'

export default SectionCurtain
