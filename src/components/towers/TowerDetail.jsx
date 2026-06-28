import { useRef } from 'react'
import { gsap, SplitText, useGSAP } from '../../gsap/Gsapconfig'
import { towers } from '../../data/towers'
import TowerPanel from './TowerPanel'
import TowerDecorations from './TowerDecorations'
import RaggedyEdge from './RaggedyEdge'
import TowersCanvas from '../../three/TowersCanvas'
import { usePageTransition } from '../../hooks/usePageTransition'

// Standalone single-tower detail view. Reproduces one carousel panel at the
// exact same dimensions, but driven by selection instead of scroll. The parent
// keys this by tower id, so every selection remounts it and the entrance +
// DrawSVG draw-in replay from clean initial states.
//
// Layout note: the old 900vh pinned carousel section established the height
// context. With that gone, this container is an explicit full-viewport box so
// the R3F canvas keeps a stable sized parent. TowerPanel renders as index 0 so
// the index.css `[data-tower-id]:nth-child(n+2)` rule keeps its static UI
// visible (it is the only / first panel here).

// Text line-mask slide-in — mirrors the carousel's reveal feel.
const TEXT_REVEAL_DURATION = 0.9
const TEXT_REVEAL_EASE = 'expo.out'

const TowerDetail = ({ tower, onBack }) => {
  const pageRef = useRef(null)
  const { exitTo } = usePageTransition({ containerRef: pageRef })

  const index = towers.findIndex((t) => t.id === tower.id)

  // Standalone text reveal: split the panel's [data-reveal] into masked lines
  // and slide them in. No ScrollTrigger / scroll / wheel / section-height
  // coupling. Split after fonts are ready so line breaks measure correctly;
  // revert on unmount.
  useGSAP(
    (_context, contextSafe) => {
      const root = pageRef.current
      if (!root) return
      const targets = root.querySelectorAll('[data-reveal]')
      if (!targets.length) return

      // Hide until SplitText has wrapped lines, so the container entrance can't
      // briefly reveal un-split text.
      gsap.set(targets, { autoAlpha: 0 })

      let split = null
      let mounted = true

      const build = contextSafe(() => {
        if (!mounted || !pageRef.current) return
        split = SplitText.create(targets, {
          type: 'lines',
          mask: 'lines',
          autoSplit: false,
          linesClass: 'reveal-line',
        })
        gsap.set(split.lines, { yPercent: 110 })
        gsap.set(targets, { autoAlpha: 1 })
        gsap.to(split.lines, {
          yPercent: 0,
          duration: TEXT_REVEAL_DURATION,
          ease: TEXT_REVEAL_EASE,
          stagger: { each: 0.08, amount: 0.45 },
        })
      })

      document.fonts.ready.then(build)

      return () => {
        mounted = false
        if (split) split.revert()
      }
    },
    { scope: pageRef, dependencies: [tower.id] },
  )

  return (
    <div ref={pageRef} className="relative h-screen w-full overflow-hidden bg-white">
      <TowerPanel
        tower={tower}
        index={0}
        isActive
        onCta={() => exitTo(`/unit-plans?tower=${tower.id}&from=towers`)}
      />

      <div className="hidden md:block absolute top-0 right-0 h-full w-[58.3333%] z-0">
        <TowersCanvas activeIndex={index} />
      </div>
      <div className="hidden md:block absolute top-0 right-0 h-full w-[58.3333%] z-10 pointer-events-none">
        <TowerDecorations tower={tower} animateOnMount />
      </div>
      <div className="hidden md:block absolute top-0 right-0 h-full w-[58.3333%] z-20 pointer-events-none">
        <RaggedyEdge />
      </div>

      {/* Back to the aerial landing (z-40 keeps it above the panel). */}
      <button
        type="button"
        aria-label="Back to towers"
        onClick={onBack}
        className="absolute left-5 top-3 md:left-8 md:top-4 lg:left-10 lg:top-4 xl:left-14 xl:top-5 2xl:left-15 2xl:top-6 3xl:left-18 3xl:top-8 4xl:left-24 4xl:top-10 5xl:left-36 5xl:top-14 z-40 grid h-9 w-9 lg:h-7 lg:w-7 xl:h-9 xl:w-9 2xl:h-10 2xl:w-10 3xl:h-12 3xl:w-12 4xl:h-14 4xl:w-14 5xl:h-20 5xl:w-20 place-items-center hover:opacity-60 transition-opacity"
      >
        <img
          src="/about/icon-arrow-left.svg"
          alt=""
          className="w-5 h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12"
        />
      </button>
    </div>
  )
}

export default TowerDetail
