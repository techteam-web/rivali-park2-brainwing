import { forwardRef, useImperativeHandle, useRef } from 'react'
import { gsap } from '../../lib/gsap'

const SWEEP_ANGLE = '-30deg' // TUNE: blade pivot angle
const BACK_COLOR = '#7A4833' // TUNE: back blade — brand brown
const MID_COLOR = '#FFF4DF' // TUNE: middle blade — warm cream
const LAYER_SIZE = '250vmax' // TUNE: never below 200vmax

const SectionSweeper = forwardRef((_props, ref) => {
  const layersRef = useRef([])

  useImperativeHandle(ref, () => ({
    setFrontColor: (color) => {
      const front = layersRef.current[2]
      if (front && color) front.style.backgroundColor = color
    },
    getLayers: () => layersRef.current.filter(Boolean),
    resetLayers: (direction) => {
      const layers = layersRef.current.filter(Boolean)
      if (!layers.length) return
      const hidden = direction === 'forward' ? '-110%' : '110%'
      gsap.set(layers, { '--sweep': hidden })
    },
  }))

  const colors = [BACK_COLOR, MID_COLOR, '#FFFFFF']

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 80 }}
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(el) => (layersRef.current[i] = el)}
          className="absolute will-change-transform"
          style={{
            bottom: 0,
            left: 0,
            width: LAYER_SIZE,
            height: LAYER_SIZE,
            backgroundColor: colors[i],
            transformOrigin: '0% 100%',
            transform: `rotate(${SWEEP_ANGLE}) translateX(var(--sweep, -110%))`,
            backfaceVisibility: 'hidden',
            zIndex: 81 + i,
            ['--sweep']: '-110%',
          }}
        />
      ))}
    </div>
  )
})

SectionSweeper.displayName = 'SectionSweeper'

export default SectionSweeper
