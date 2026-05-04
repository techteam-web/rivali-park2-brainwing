import { useCallback, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { SECTION_BG_MAP } from '../components/about/aboutSections.config'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function useDiagonalSweep({ sweeperRef }) {
  const lockRef = useRef(false)

  const isAnimating = useCallback(() => lockRef.current, [])

  const playTransition = useCallback(
    ({ toIdx, direction, fromSlide, toSlide, fromSection, toSection, onSwap }) => {
      if (lockRef.current) return Promise.resolve()
      if (!fromSlide || !toSlide) return Promise.resolve()
      lockRef.current = true

      return new Promise((resolve) => {
        const sweeper = sweeperRef.current
        const bg = SECTION_BG_MAP[toIdx] || '#FFFFFF'

        sweeper?.setFrontColor(bg)
        sweeper?.resetLayers(direction)
        fromSection?.playOut()

        const layers = sweeper?.getLayers() || []

        const cleanup = () => {
          if (layers.length) gsap.set(layers, { '--sweep': '-110%' })
          lockRef.current = false
          resolve()
        }

        const swap = () => {
          gsap.set(fromSlide, { y: 0, opacity: 0, zIndex: 0, pointerEvents: 'none' })
          fromSlide.setAttribute('aria-hidden', 'true')
          gsap.set(toSlide, { y: 0, opacity: 1, zIndex: 1, pointerEvents: 'auto' })
          toSlide.setAttribute('aria-hidden', 'false')
          toSection?.prepare()
          onSwap?.(toIdx)
        }

        if (prefersReducedMotion()) {
          const tl = gsap.timeline({ onComplete: cleanup })
          tl.to(fromSlide, { opacity: 0, duration: 0.2 }, 0)
          tl.call(
            () => {
              gsap.set(fromSlide, { y: 0, opacity: 0, zIndex: 0, pointerEvents: 'none' })
              fromSlide.setAttribute('aria-hidden', 'true')
              gsap.set(toSlide, { y: 0, opacity: 0, zIndex: 1, pointerEvents: 'auto' })
              toSlide.setAttribute('aria-hidden', 'false')
              toSection?.prepare()
              onSwap?.(toIdx)
            },
            [],
            0.2,
          )
          tl.to(toSlide, { opacity: 1, duration: 0.2 }, 0.2)
          tl.call(() => toSection?.playIn(), [], 0.4)
          return
        }

        const tl = gsap.timeline({ onComplete: cleanup })

        // PHASE 2 — sweeper sweeps in (0 → 0.7)
        if (layers.length) {
          tl.to(
            layers,
            {
              '--sweep': '0%',
              duration: 0.7, // TUNE
              stagger: 0.09, // TUNE
              ease: 'power3.inOut',
            },
            0,
          )
        }

        // PHASE 3 — outgoing slide drift + fade (0 → 0.7), parallel with Phase 2
        tl.to(
          fromSlide,
          {
            y: direction === 'forward' ? 60 : -60, // TUNE
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
          },
          0,
        )

        // PHASE 4 — swap at 0.70, invisible behind the front blade
        tl.call(swap, [], 0.7) // TUNE: swap timestamp

        // PHASE 5 — sweeper sweeps out (0.70 → 1.30), reversed stagger
        if (layers.length) {
          tl.to(
            layers,
            {
              '--sweep': direction === 'forward' ? '110%' : '-110%',
              duration: 0.6, // TUNE
              stagger: { each: 0.07, from: 'end' }, // TUNE
              ease: 'power3.inOut',
            },
            0.7,
          )
        }

        // PHASE 5b — incoming section internal animation kicks off mid-sweep-out
        tl.call(() => toSection?.playIn(), [], 0.8) // TUNE: playIn fire timestamp
      })
    },
    [sweeperRef],
  )

  return { playTransition, isAnimating }
}
