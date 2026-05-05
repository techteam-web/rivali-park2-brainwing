import { useEffect, useRef } from 'react'
import { pointerState } from '../../three/pointerState'

const MAX_PIXEL_OFFSET = 8
const POINTER_AMPLITUDE = 0.06
const PX_PER_UNIT = MAX_PIXEL_OFFSET / POINTER_AMPLITUDE

const TowerDecorations = ({ tower }) => {
  const refs = useRef([])

  useEffect(() => {
    let frameId
    const loop = () => {
      const px = pointerState.x * PX_PER_UNIT
      const py = pointerState.y * PX_PER_UNIT
      tower.decorations?.forEach((d, i) => {
        const el = refs.current[i]
        if (!el) return
        const w = d.depth ?? 0.5
        el.style.transform = `translate3d(${-px * w}px, ${py * w}px, 0)`
      })
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [tower])

  return (
    <>
      {tower.decorations?.map((d, i) => (
        <img
          key={`${tower.id}-${i}`}
          ref={(el) => { refs.current[i] = el }}
          src={d.src}
          alt=""
          aria-hidden="true"
          className={`${d.className} pointer-events-none select-none will-change-transform`}
          style={d.style}
        />
      ))}
    </>
  )
}

export default TowerDecorations
