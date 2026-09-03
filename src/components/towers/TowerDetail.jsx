import { useEffect, useRef, useState } from 'react'
import { gsap, SplitText, useGSAP } from '../../gsap/Gsapconfig'
import { towers } from '../../data/towers'
import TowerPanel from './TowerPanel'
import TowerDecorations from './TowerDecorations'
import RaggedyEdge from './RaggedyEdge'
import TowersCanvas from '../../three/TowersCanvas'
import { usePageTransition } from '../../hooks/usePageTransition'
import PageNav from '../layout/PageNav'

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

// Orchestrated reveal timing. The heading + tagline slide in as masked lines;
// the stat cards, feature rows and CTA fade-and-rise as whole blocks (lighter
// and calmer than line-splitting every label). Offsets are timeline positions
// in seconds, tuned so each group lifts off just as the previous one settles.
const TEXT_REVEAL_DURATION = 0.9
const TEXT_REVEAL_EASE = 'expo.out'
const BLOCK_EASE = 'power3.out'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const TowerDetail = ({ tower, onBack, onPlans, play = true }) => {
  const pageRef = useRef(null)

  const index = towers.findIndex((t) => t.id === tower.id)

  // The page entrance + content reveal only play once BOTH the loader curtain
  // has cleared (`play`) and the WebGL scene has rendered its first frame
  // (`canvasReady`). The latter is the fix for the glitchy entrance: when
  // arriving from the aerial landing there's no curtain, so the canvas's
  // context-create + shader-compile + texture-upload burst would otherwise
  // freeze the main thread right while the entrance animation played. Waiting
  // for it keeps the handoff buttery.
  // Below md the canvas is display:none (it never renders, so it can't signal) —
  // treat it as ready immediately so the text panel still reveals on mobile.
  const [canvasReady, setCanvasReady] = useState(
    () =>
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function' ||
      !window.matchMedia('(min-width: 768px)').matches,
  )
  const shouldReveal = play && canvasReady

  // Shared scale + blur + fade entrance (deferred until shouldReveal) and the
  // matching exit on Back, so the towers landing↔detail handoff feels like the
  // gallery/unit-plan transitions. The whole page rises out of soft focus once
  // the scene is ready; Back eases it back into focus before swapping views.
  const { exitTo, exitWith } = usePageTransition({
    containerRef: pageRef,
    play: shouldReveal,
  })

  // Safety net: if the canvas never reports ready (lost context, slow device),
  // reveal anyway so the page can't get stuck hidden.
  useEffect(() => {
    if (canvasReady) return
    const id = setTimeout(() => setCanvasReady(true), 1500)
    return () => clearTimeout(id)
  }, [canvasReady])

  // Inner content stagger that layers on top of the page entrance: the heading +
  // tagline slide in as masked lines, then the stat cards, feature rows and CTA
  // fade-and-rise. Initial hidden states are set on mount (before paint) so
  // nothing flashes; the reveal itself is gated on shouldReveal.
  useGSAP(
    (_context, contextSafe) => {
      const root = pageRef.current
      if (!root) return

      const textTargets = root.querySelectorAll('[data-reveal]')
      const statCards = gsap.utils.toArray('[data-stat-card]', root)
      const featureRows = gsap.utils.toArray('[data-feature-row]', root)
      const cta = root.querySelector('[data-cta-button]')
      const blocks = [...statCards, ...featureRows, cta].filter(Boolean)

      if (prefersReducedMotion()) {
        gsap.set(textTargets, { autoAlpha: 1 })
        gsap.set(blocks, { autoAlpha: 1, y: 0 })
        return
      }

      // Hidden initial state — always applied so the page never flashes its
      // content before the reveal plays.
      gsap.set(textTargets, { autoAlpha: 0 })
      gsap.set(statCards, { autoAlpha: 0, y: 24 })
      gsap.set(featureRows, { autoAlpha: 0, y: 18 })
      if (cta) gsap.set(cta, { autoAlpha: 0, y: 18 })

      if (!shouldReveal) return

      let split = null
      let mounted = true

      const build = contextSafe(() => {
        if (!mounted || !pageRef.current) return

        // Split after fonts are ready so line breaks measure correctly.
        split = SplitText.create(textTargets, {
          type: 'lines',
          mask: 'lines',
          autoSplit: false,
          linesClass: 'reveal-line',
        })
        gsap.set(split.lines, { yPercent: 110 })
        gsap.set(textTargets, { autoAlpha: 1 })

        const tl = gsap.timeline({ defaults: { ease: BLOCK_EASE } })
        tl.to(
          split.lines,
          {
            yPercent: 0,
            duration: TEXT_REVEAL_DURATION,
            ease: TEXT_REVEAL_EASE,
            stagger: { each: 0.08, amount: 0.45 },
          },
          0,
        )
          .to(statCards, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.2)
          .to(featureRows, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.4)
          .to(cta, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.65)
      })

      document.fonts.ready.then(build)

      return () => {
        mounted = false
        if (split) split.revert()
      }
    },
    { scope: pageRef, dependencies: [tower.id, shouldReveal] },
  )

  return (
    <div ref={pageRef} className="relative h-screen w-full overflow-hidden bg-white">
      {/* "Plans" now opens the tower's elevation drawing first, where a floor
          is picked; that choice is carried on into the unit-plan flow. It's an
          in-page view swap (same route, ?view= param), so exitWith — not
          exitTo — plays the handoff. */}
      <TowerPanel
        tower={tower}
        index={0}
        isActive
        onCta={() => exitWith(onPlans)}
      />

      <div className="hidden md:block absolute top-0 right-0 h-full w-[58.3333%] z-0">
        <TowersCanvas activeIndex={index} onReady={() => setCanvasReady(true)} />
      </div>
      <div className="hidden md:block absolute top-0 right-0 h-full w-[58.3333%] z-10 pointer-events-none">
        <TowerDecorations tower={tower} animateOnMount play={shouldReveal} />
      </div>
      <div className="hidden md:block absolute top-0 right-0 h-full w-[58.3333%] z-20 pointer-events-none">
        <RaggedyEdge />
      </div>

      {/* Back to the aerial landing + Home — the shared group (z-40 keeps it
          above the panel). */}
      <PageNav
        backLabel="Back to towers"
        onBack={() => exitWith(onBack)}
        onHome={() => exitTo('/')}
      />
    </div>
  )
}

export default TowerDetail
