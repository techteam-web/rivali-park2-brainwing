import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../../gsap/Gsapconfig'
import { towers, TOWER_ACCENTS } from '../../data/towers'
import TowerPanel from './TowerPanel'
import TowerProgress from './TowerProgress'
import TowersCanvas from '../../three/TowersCanvas'
import TowerDecorations from './TowerDecorations'
import RaggedyEdge from './RaggedyEdge'

const HIGHLIGHT_X = [1.73389, 56.75, 111.77, 166.79, 1.73389]

// Viewport-height multiplier of pinned scroll real estate per panel
// transition. Provides the scroll distance that snap triggers fire across.
// Transitions are time-driven (not scrubbed), so this value is independent
// of TRANSITION_DURATION in TowerDepthPlane.jsx.
const SCROLL_PER_TRANSITION = 2.0

// Wall-clock duration of the snap-driven auto-scroll. Matched to
// TRANSITION_DURATION in TowerDepthPlane.jsx so the on-screen scrollbar
// movement finishes at the same moment as the shader wipe.
const SNAP_SCROLL_DURATION = 2.0

// Delay the snap scroll-to (and therefore the text panel scrub) so SVG
// decorations draw out in isolation first. Mirrors DRAW_OUT_DURATION in
// TowerDecorations.jsx and DECOR_DRAW_OUT_DELAY in TowerDepthPlane.jsx —
// keep aligned.
const DECOR_DRAW_OUT_DELAY = 1.0

const TowersCarousel = () => {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const panelRefs = useRef([])
  const progressHighlightRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(0)

  useGSAP(
    (_context, contextSafe) => {
      const panels = panelRefs.current

      const heroFeatureIcons = Array.from(
        panels[0].querySelectorAll('[data-feature-icon]'),
      )
      const heroCtaButton = panels[0].querySelector('[data-cta-button]')
      const heroStatCards = Array.from(
        panels[0].querySelectorAll('[data-stat-card]'),
      )

      const nonFirstReveals = panels
        .slice(1)
        .flatMap((panel) => Array.from(panel.querySelectorAll('[data-reveal]')))
      gsap.set(nonFirstReveals, { opacity: 0 })

      gsap.set(progressHighlightRef.current, {
        attr: { x: HIGHLIGHT_X[0], fill: TOWER_ACCENTS[0] },
      })

      gsap.set(heroFeatureIcons, { color: TOWER_ACCENTS[0] })
      gsap.set(heroCtaButton, { backgroundColor: TOWER_ACCENTS[0] })
      gsap.set(heroStatCards, { backgroundColor: `${TOWER_ACCENTS[0]}0A` })

      const transitions = towers.length

      let panelLines = []
      const isAnimatingRef = { current: false }

      const goToSection = contextSafe((target) => {
        if (isAnimatingRef.current) return
        if (!panelLines.length) return
        isAnimatingRef.current = true

        const prevActiveIndex = activeIndexRef.current

        // Logical tower index (modular). target=4 means slide 0, target=-1 means slide 3.
        const logicalIndex = ((target % towers.length) + towers.length) % towers.length
        if (activeIndexRef.current !== logicalIndex) {
          activeIndexRef.current = logicalIndex
          setActiveIndex(logicalIndex)
        }

        const wrapForward = target >= towers.length
        const wrapBackward = target < 0
        const vh = window.innerHeight

        // Backward wrap pre-jump: instantly position scroll at the END of the wrap
        // transition so the subsequent backward scroll-to lands the user visually
        // on slide towers.length-1.
        if (wrapBackward) {
          ScrollTrigger.getAll().forEach((st) => st.disable())
          window.scrollTo(0, towers.length * SCROLL_PER_TRANSITION * vh)
          ScrollTrigger.getAll().forEach((st) => st.enable())
        }

        const scrollTargetIndex = wrapBackward ? towers.length - 1 : target
        const targetY = Math.min(
          scrollTargetIndex * SCROLL_PER_TRANSITION * vh,
          ScrollTrigger.maxScroll(window),
        )

        const prevIdx = prevActiveIndex
        const newIdx = logicalIndex
        const newAccent = TOWER_ACCENTS[newIdx]
        // On wrapForward (target = towers.length), the highlight slides to
        // HIGHLIGHT_X[towers.length] — the wrap-back position whose value
        // matches HIGHLIGHT_X[0] visually.
        const newHighlightX = HIGHLIGHT_X[wrapForward ? towers.length : newIdx]

        const tl = gsap.timeline({
          onComplete: () => {
            // Forward wrap: post-jump scroll back to 0 so the user is at the
            // natural "start" position. Slide 0 is shown both before and after.
            if (wrapForward) {
              ScrollTrigger.getAll().forEach((st) => st.disable())
              window.scrollTo(0, 0)
              ScrollTrigger.getAll().forEach((st) => st.enable())
            }
            isAnimatingRef.current = false
          },
        })

        // Park the incoming panel off-screen-below regardless of where it was
        // last left. Lines are masked on both sides, so this instant set is
        // invisible — it normalizes state across forward, backward, and wrap paths.
        tl.set(panelLines[newIdx], { yPercent: 110 }, 0)

        // Stage all visible motion to begin at DECOR_DRAW_OUT_DELAY so the
        // decoration retract (TowerDecorations.jsx) plays in isolation first.
        tl.to(
          panelLines[prevIdx],
          {
            yPercent: -110,
            duration: 0.7,
            stagger: { each: 0.04, amount: 0.4 },
            ease: 'power3.in',
          },
          DECOR_DRAW_OUT_DELAY,
        )

        tl.to(
          progressHighlightRef.current,
          {
            attr: { x: newHighlightX, fill: newAccent },
            duration: 1.0,
            ease: 'power2.inOut',
          },
          DECOR_DRAW_OUT_DELAY,
        )
          .to(
            heroFeatureIcons,
            { color: newAccent, duration: 1.0, ease: 'power2.inOut' },
            DECOR_DRAW_OUT_DELAY,
          )
          .to(
            heroCtaButton,
            { backgroundColor: newAccent, duration: 1.0, ease: 'power2.inOut' },
            DECOR_DRAW_OUT_DELAY,
          )
          .to(
            heroStatCards,
            { backgroundColor: `${newAccent}0A`, duration: 1.0, ease: 'power2.inOut' },
            DECOR_DRAW_OUT_DELAY,
          )

        // Scroll-to: pure UX feedback now — nothing animation-wise depends on
        // its progress. Matches shader wipe duration in TowerDepthPlane.jsx.
        tl.to(
          window,
          {
            scrollTo: { y: targetY, autoKill: false },
            duration: SNAP_SCROLL_DURATION,
            ease: 'power2.inOut',
          },
          DECOR_DRAW_OUT_DELAY,
        )

        // Text slide-in lands ≈ when the shader wipe finishes
        // (DECOR_DRAW_OUT_DELAY + SNAP_SCROLL_DURATION = 3.0s).
        tl.to(
          panelLines[newIdx],
          {
            yPercent: 0,
            duration: 0.9,
            stagger: { each: 0.08, amount: 0.45 },
            ease: 'expo.out',
          },
          DECOR_DRAW_OUT_DELAY + SNAP_SCROLL_DURATION * 0.6,
        )
      })

      let splits = []
      let snapTriggers = []
      let pinTrigger = null
      let onResize = null
      let wheelLock = null
      let touchLock = null
      let keyLock = null
      let mounted = true

      const build = contextSafe(() => {
        if (!mounted) return

        panelLines = panels.map((panel) => {
          const targets = panel.querySelectorAll('[data-reveal]')
          const s = SplitText.create(targets, {
            type: 'lines',
            mask: 'lines',
            autoSplit: false,
            linesClass: 'reveal-line',
          })
          splits.push(s)
          return s.lines
        })

        gsap.set(panelLines[0], { yPercent: 0 })
        panelLines
          .slice(1)
          .forEach((lines) => gsap.set(lines, { yPercent: 110 }))
        gsap.set(nonFirstReveals, { opacity: 1 })

        pinTrigger = ScrollTrigger.create({
          trigger: stageRef.current,
          start: 'top top',
          end: () => `+=${transitions * SCROLL_PER_TRANSITION * window.innerHeight}`,
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
        })

        for (let i = 0; i < transitions; i++) {
          snapTriggers.push(
            ScrollTrigger.create({
              start: () => i * SCROLL_PER_TRANSITION * window.innerHeight + 1,
              end: () =>
                Math.min(
                  (i + 1) * SCROLL_PER_TRANSITION * window.innerHeight - 1,
                  ScrollTrigger.maxScroll(window) - 1,
                ),
              onEnter: () => goToSection(i + 1),
              onEnterBack: () => goToSection(i),
              invalidateOnRefresh: true,
            }),
          )
        }

        // Block wheel/touch/keyboard scroll input during an in-flight transition.
        // The discrete timeline drives scroll position itself via scrollTo; user
        // input during that window would fight ScrollToPlugin and visibly jitter.
        const SCROLL_KEYS = new Set([
          'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ',
        ])
        wheelLock = (e) => {
          if (isAnimatingRef.current) {
            e.preventDefault()
            e.stopPropagation()
          }
        }
        touchLock = (e) => {
          if (isAnimatingRef.current) {
            e.preventDefault()
            e.stopPropagation()
          }
        }
        keyLock = (e) => {
          if (isAnimatingRef.current && SCROLL_KEYS.has(e.key)) {
            e.preventDefault()
            e.stopPropagation()
          }
        }
        window.addEventListener('wheel', wheelLock, { passive: false, capture: true })
        window.addEventListener('touchmove', touchLock, { passive: false, capture: true })
        window.addEventListener('keydown', keyLock, { capture: true })

        onResize = () => ScrollTrigger.refresh()
        window.addEventListener('resize', onResize)

        ScrollTrigger.refresh()
      })

      document.fonts.ready.then(build)

      return () => {
        mounted = false
        if (pinTrigger) pinTrigger.kill()
        splits.forEach((s) => s.revert())
        snapTriggers.forEach((t) => t.kill())
        if (onResize) window.removeEventListener('resize', onResize)
        // Remove listeners with the same options object shape that was used to
        // add them — capture must match for the removal to succeed.
        if (wheelLock) window.removeEventListener('wheel', wheelLock, { capture: true })
        if (touchLock) window.removeEventListener('touchmove', touchLock, { capture: true })
        if (keyLock) window.removeEventListener('keydown', keyLock, { capture: true })
      }
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      className="relative bg-white"
      style={{ height: `${(towers.length * SCROLL_PER_TRANSITION + 1) * 100}vh` }}
    >
      <div
        ref={stageRef}
        className="absolute top-0 left-0 w-full h-screen overflow-hidden"
      >
        {towers.map((tower, i) => (
          <TowerPanel
            key={tower.id}
            tower={tower}
            index={i}
            isActive={i === activeIndex}
            ref={(el) => {
              panelRefs.current[i] = el
            }}
          />
        ))}

        <div className="hidden md:block absolute top-0 right-0 h-full w-[58.3333%] z-0">
          <TowersCanvas activeIndex={activeIndex} />
        </div>
        <div className="hidden md:block absolute top-0 right-0 h-full w-[58.3333%] z-10 pointer-events-none">
          <TowerDecorations tower={towers[activeIndex]} />
        </div>
        <div className="hidden md:block absolute top-0 right-0 h-full w-[58.3333%] z-20 pointer-events-none">
          <RaggedyEdge />
        </div>

        <div className="absolute bottom-10 right-10 lg:right-16 3xl:right-16 z-30 pointer-events-none">
          <TowerProgress
            ref={progressHighlightRef}
            initialAccent={TOWER_ACCENTS[0]}
            className="lg:w-35 lg:h-3.75 3xl:w-45 3xl:h-5 4xl:w-55 4xl:h-10"
          />
        </div>
      </div>
    </section>
  )
}

export default TowersCarousel
