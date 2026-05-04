import { useCallback, useRef } from 'react'
import { gsap } from '../lib/gsap'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Magic-curtain transition. The colored blades drop top→down with a stagger,
// and the incoming slide is layered on top with a clip-path that retracts in
// sync with the front blade — but lagged by one stagger unit, so the trailing
// blades remain visible as colored bands at the leading edge. The outgoing
// slide stays put underneath; once the leading edge passes a row, that row
// shows the new content (or a curtain band) and never the old content again.
export function useDropCurtain({ curtainRef }) {
  const lockRef = useRef(false)

  const isAnimating = useCallback(() => lockRef.current, [])

  const playTransition = useCallback(
    ({ toIdx, direction, fromSlide, toSlide, fromSection, toSection, onSwap }) => {
      if (lockRef.current) return Promise.resolve()
      if (!fromSlide || !toSlide) return Promise.resolve()
      lockRef.current = true

      return new Promise((resolve) => {
        const curtain = curtainRef.current
        curtain?.resetLayers()
        const layers = curtain?.getLayers() || []
        const isBackward = direction === 'backward'

        const cleanup = () => {
          if (layers.length) gsap.set(layers, { scaleY: 0 })
          gsap.set(fromSlide, {
            y: 0,
            opacity: 0,
            zIndex: 0,
            pointerEvents: 'none',
            clearProps: 'clipPath,willChange',
          })
          if (fromSlide.children?.length) {
            gsap.set(Array.from(fromSlide.children), { opacity: 0 })
          }
          fromSlide.setAttribute('aria-hidden', 'true')
          gsap.set(toSlide, {
            y: 0,
            opacity: 1,
            zIndex: 1,
            pointerEvents: 'auto',
            clearProps: 'clipPath,willChange',
          })
          toSlide.setAttribute('aria-hidden', 'false')
          lockRef.current = false
          resolve()
        }

        // Reduced motion → simple cross-fade, no curtain.
        if (prefersReducedMotion()) {
          gsap.set(toSlide, {
            y: 0,
            opacity: 0,
            zIndex: 2,
            pointerEvents: 'auto',
            clearProps: 'clipPath',
          })
          if (toSlide.children?.length) {
            gsap.set(Array.from(toSlide.children), { opacity: 1 })
          }
          toSlide.setAttribute('aria-hidden', 'false')
          toSection?.prepare()
          fromSection?.playOut()
          onSwap?.(toIdx)
          const tl = gsap.timeline({ onComplete: cleanup })
          tl.to(toSlide, { opacity: 1, duration: 0.3 }, 0)
          tl.to(fromSlide, { opacity: 0, duration: 0.3 }, 0)
          tl.call(() => toSection?.playIn(), [], 0)
          return
        }

        // Set blade origin per direction so they grow toward the leading edge.
        // Forward → grow downward from top; Backward → grow upward from bottom.
        if (layers.length) {
          gsap.set(layers, {
            transformOrigin: isBackward ? '50% 100%' : '50% 0%',
            scaleY: 0,
          })
        }

        // Stage incoming slide ABOVE the curtain, fully clipped (invisible).
        // clip-path inset(top right bottom left): the inset on the leading
        // side starts at 100% (band collapsed). It animates to 0% so the band
        // grows toward the trailing side, revealing content as the curtain
        // sweeps that way.
        const startClip = isBackward
          ? 'inset(100% 0% 0% 0%)' // visible band at bottom, grows upward
          : 'inset(0% 0% 100% 0%)' // visible band at top, grows downward
        gsap.set(toSlide, {
          y: 0,
          opacity: 1,
          zIndex: 90, // above the curtain blades (max ~84)
          pointerEvents: 'none',
          clipPath: startClip,
          willChange: 'clip-path',
        })
        if (toSlide.children?.length) {
          gsap.set(Array.from(toSlide.children), { opacity: 1 })
        }
        toSlide.setAttribute('aria-hidden', 'false')
        toSection?.prepare()

        fromSection?.playOut()

        const DROP_DUR = 0.9 // TUNE: blade drop duration
        const STAGGER = 0.09 // TUNE: per-blade lag
        const numLayers = layers.length || 4
        // Reveal lags the front blade by one stagger unit so the front blade
        // (and the others trailing it) form colored bands at the leading edge.
        const REVEAL_START = numLayers * STAGGER

        const tl = gsap.timeline({ onComplete: cleanup })

        // Curtain blades drop, back-first → front-last
        if (layers.length) {
          tl.to(
            layers,
            {
              scaleY: 1,
              duration: DROP_DUR,
              stagger: STAGGER,
              ease: 'power3.inOut',
            },
            0,
          )
        }

        // Incoming slide reveals top→down via clip-path, in sync with (and
        // lagging) the front blade. New content overtakes the cream blade,
        // while putty/sage/forest remain visible as trailing bands.
        tl.to(
          toSlide,
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: DROP_DUR,
            ease: 'power3.inOut',
          },
          REVEAL_START,
        )

        // Run the section's own reveal alongside the clip wipe so its inner
        // animations play as the new content is exposed.
        tl.call(() => toSection?.playIn(), [], REVEAL_START)

        // Update React state once the new slide starts to appear so the
        // header fade lines up with the visible reveal.
        tl.call(() => onSwap?.(toIdx), [], REVEAL_START)
      })
    },
    [curtainRef],
  )

  return { playTransition, isAnimating }
}
