import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../../gsap/Gsapconfig'
import { pointerState } from '../../three/pointerState'

const MAX_PIXEL_OFFSET = 8
const POINTER_AMPLITUDE = 0.06
const PX_PER_UNIT = MAX_PIXEL_OFFSET / POINTER_AMPLITUDE

// Draw timing — 0.5s delay lets the shader dissolve (1.4s) establish the new
// tower image before strokes start drawing on top. Tune to taste.
const DRAW_DELAY = 0.5
const DRAW_DURATION = 1.4
const DRAW_EASE = 'power2.inOut'

const TowerDecorations = ({ tower }) => {
  const refs = useRef([])

  // Parallax — unchanged behavior. Mutates transform on the SVG element ref.
  // DrawSVG operates on <path> children (stroke-dashoffset / stroke-dasharray),
  // so the two run on different properties on different elements — no conflict.
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

  // DrawSVG — animates each decoration SVG independently so the stagger
  // window stays bounded per-decoration regardless of path count. Re-runs on
  // every tower swap because the `tower.id` dependency triggers it.
  useGSAP(
    () => {
      refs.current.forEach((svg, i) => {
        if (!svg) return
        const dec = tower.decorations[i]
        const paths = Array.from(svg.querySelectorAll('path'))
        if (!paths.length) return

        gsap.set(paths, { drawSVG: '0%' })
        gsap.to(paths, {
          drawSVG: '100%',
          duration: dec.drawDuration ?? DRAW_DURATION,
          ease: DRAW_EASE,
          delay: DRAW_DELAY,
          stagger: { amount: 0.3, from: 'random' },
        })
      })
    },
    { dependencies: [tower.id] },
  )

  return (
    <>
      {tower.decorations?.map((d, i) => {
        const Comp = d.Component
        return (
          <Comp
            key={`${tower.id}-${i}`}
            ref={(el) => { refs.current[i] = el }}
            aria-hidden="true"
            className={`${d.className} pointer-events-none select-none will-change-transform`}
            style={d.style}
          />
        )
      })}
    </>
  )
}

export default TowerDecorations
