import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../../gsap/Gsapconfig'
import { pointerState } from '../../three/pointerState'

const MAX_PIXEL_OFFSET = 8
const POINTER_AMPLITUDE = 0.06
const PX_PER_UNIT = MAX_PIXEL_OFFSET / POINTER_AMPLITUDE

// Draw timing — draw-out runs in ISOLATION first, then the shader wipe + text
// panel scrub + draw-in all fire afterward. Sequencing (with TRANSITION_DURATION
// currently 2.0s in TowerDepthPlane.jsx):
//   t = 0      tower changes; draw-out begins (shader + scroll-to are delayed)
//   t = 1.0    draw-out completes; `displayed` swaps; shader wipe + scroll-to start
//   t = 3.0    shader wipe completes; draw-in starts
//   t ≈ 4.8   draw-in completes
// DRAW_OUT_DURATION is mirrored as a `delay:` in TowerDepthPlane.jsx (shader
// wipe tween) and TowersCarousel.jsx (snap scroll-to tween). If you change
// this value, change those too — grep DECOR_DRAW_OUT_DELAY to find them.
const DRAW_DURATION = 1.8
const DRAW_EASE = 'power2.inOut'
const DRAW_OUT_DURATION = 1.0
const DRAW_OUT_EASE = 'power2.in'
// Measured from the moment the draw-out tween completes (when `displayed`
// swaps). Tuned so draw-in starts ≈ when the (delayed) shader wipe ends.
// Equal to TRANSITION_DURATION in TowerDepthPlane.jsx.
const DRAW_IN_DELAY = 2.0

const TowerDecorations = ({ tower }) => {
  const refs = useRef([])
  const [displayed, setDisplayed] = useState(tower)
  // Tracks whether a real tower change has occurred. Set inside draw-out
  // (which early-returns when tower.id === displayed.id, so Strict Mode's
  // double-invocation on first mount can't accidentally flip it).
  const hasTransitionedRef = useRef(false)

  // Parallax — unchanged behavior. Mutates transform on the SVG element ref.
  // DrawSVG operates on <path> children (stroke-dashoffset / stroke-dasharray),
  // so the two run on different properties on different elements — no conflict.
  useEffect(() => {
    let frameId
    const loop = () => {
      const px = pointerState.x * PX_PER_UNIT
      const py = pointerState.y * PX_PER_UNIT
      displayed.decorations?.forEach((d, i) => {
        const el = refs.current[i]
        if (!el) return
        const w = d.depth ?? 0.5
        el.style.transform = `translate3d(${-px * w}px, ${py * w}px, 0)`
      })
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [displayed])

  // Draw-out — retracts every currently-mounted path in parallel, then swaps
  // `displayed` to the target tower so the draw-in effect can pick up the new
  // refs. `displayed` hasn't changed yet at this point, so the refs still
  // reference the outgoing tower's SVGs.
  useGSAP(
    () => {
      if (tower.id === displayed.id) return
      hasTransitionedRef.current = true
      const paths = refs.current
        .filter(Boolean)
        .flatMap((svg) => Array.from(svg.querySelectorAll('path')))
      if (!paths.length) {
        setDisplayed(tower)
        return
      }
      gsap.to(paths, {
        drawSVG: '0%',
        duration: DRAW_OUT_DURATION,
        ease: DRAW_OUT_EASE,
        onComplete: () => setDisplayed(tower),
      })
    },
    { dependencies: [tower.id] },
  )

  // Draw-in — animates each decoration SVG independently so the stagger
  // window stays bounded per-decoration regardless of path count. Re-runs
  // each time `displayed` swaps to a new tower.
  useGSAP(
    () => {
      refs.current.forEach((svg, i) => {
        if (!svg) return
        const dec = displayed.decorations?.[i]
        if (!dec) return
        const paths = Array.from(svg.querySelectorAll('path'))
        if (!paths.length) return

        if (!hasTransitionedRef.current) {
          gsap.set(paths, { drawSVG: '100%' })
        } else {
          gsap.set(paths, { drawSVG: '0%' })
          gsap.to(paths, {
            drawSVG: '100%',
            duration: dec.drawDuration ?? DRAW_DURATION,
            ease: DRAW_EASE,
            stagger: { amount: 0.3, from: 'random' },
            delay: DRAW_IN_DELAY,
          })
        }
      })
    },
    { dependencies: [displayed.id] },
  )

  return (
    <>
      {displayed.decorations?.map((d, i) => {
        const Comp = d.Component
        return (
          <Comp
            key={`${displayed.id}-${i}`}
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
