import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../../gsap/Gsapconfig'
import { towers, TOWER_ACCENTS } from '../../data/towers'
import TowerPanel from './TowerPanel'
import TowerProgress from './TowerProgress'
import TowersCanvas from '../../three/TowersCanvas'
import TowerDecorations from './TowerDecorations'
import RaggedyEdge from './RaggedyEdge'

const HIGHLIGHT_X = [1.73389, 56.75, 111.77, 166.79, 1.73389]

// Tuned to roughly match TRANSITION_DURATION in TowerDepthPlane.jsx so
// the scroll-scrubbed text panel transition finishes in sync with the
// shader wipe. If you change one, consider the other.
const SCROLL_PER_TRANSITION = 2.0 // multiplier of viewport height per panel transition

// Wall-clock duration of the snap-driven auto-scroll. Matched to
// TRANSITION_DURATION in TowerDepthPlane.jsx — the text panel scrubs off
// scroll position, so however long this auto-scroll takes is how long the
// text transition takes. Keep it equal to the shader wipe duration so both
// halves of the canvas finish at the same moment.
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

  useEffect(() => {
    const body = document.body
    const html = document.documentElement
    const prevBodyOverscroll = body.style.overscrollBehavior
    const prevHtmlOverscroll = html.style.overscrollBehavior
    body.style.overscrollBehavior = 'none'
    html.style.overscrollBehavior = 'none'
    body.classList.add('scrollbar-hidden')
    html.classList.add('scrollbar-hidden')
    return () => {
      body.style.overscrollBehavior = prevBodyOverscroll
      html.style.overscrollBehavior = prevHtmlOverscroll
      body.classList.remove('scrollbar-hidden')
      html.classList.remove('scrollbar-hidden')
    }
  }, [])

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

      let isAnimating = false
      const goToSection = (target) => {
        if (isAnimating) return
        isAnimating = true

        // Capture the previous tower index BEFORE we mutate the ref — we use
        // it below to compute the hold-scroll position for the text panel.
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
        // transition (scroll = towers.length * SCROLL_PER_TRANSITION * vh = 16vh)
        // so the subsequent backward tween scrubs the wrap transition in reverse,
        // landing the user visually on slide towers.length-1 at scroll = 12vh.
        if (wrapBackward) {
          ScrollTrigger.getAll().forEach((st) => st.disable())
          window.scrollTo(0, towers.length * SCROLL_PER_TRANSITION * vh)
          ScrollTrigger.getAll().forEach((st) => st.enable())
        }

        // Compute scroll target.
        // For wrapForward (target=4): scroll to 16vh, which is the end of wrap transition.
        // For wrapBackward (target=-1): scroll to 12vh, which is the start of wrap transition
        //   (relative to our pre-jumped position at 16vh, this is a backward scroll).
        // For normal targets: scroll to target * 4vh as before.
        const scrollTargetIndex = wrapBackward ? towers.length - 1 : target
        const targetY = Math.min(
          scrollTargetIndex * SCROLL_PER_TRANSITION * vh,
          ScrollTrigger.maxScroll(window),
        )

        // Hold position: the scroll location where the PREVIOUS tower is fully
        // shown. If the user wheeled past the snap threshold (e.g. by 200 px
        // before the snap actually fired), capturing window.scrollY would
        // freeze them mid-slide-out — looks like the text "overshoots up"
        // then snaps. Instead, derive holdY from prevActiveIndex's home
        // position and snap there immediately so the scroll-scrubbed text
        // timeline cleanly returns to "prev tower at rest" before the hold
        // tween starts.
        const holdY = wrapBackward
          ? towers.length * SCROLL_PER_TRANSITION * vh
          : prevActiveIndex * SCROLL_PER_TRANSITION * vh
        window.scrollTo(0, holdY)

        const snapTl = gsap.timeline({
          onComplete: () => {
            // Forward wrap: we landed at 16vh showing slide 0. Reset scroll to 0
            // so the user is at the natural "start" position for the next forward
            // scroll. Slide 0 is shown both before and after — no visible change.
            if (wrapForward) {
              ScrollTrigger.getAll().forEach((st) => st.disable())
              window.scrollTo(0, 0)
              ScrollTrigger.getAll().forEach((st) => st.enable())
            }
            // Backward wrap: we landed at 12vh showing slide towers.length-1.
            // No further reset needed — 12vh is the natural "scroll backward
            // from here" position for slide towers.length-1.
            isAnimating = false
          },
        })

        // Holding phase: force scrollY back to holdY every frame so wheel
        // input is overridden and the scroll-scrubbed text panel stays frozen.
        snapTl.to({}, {
          duration: DECOR_DRAW_OUT_DELAY,
          onUpdate: () => {
            if (window.scrollY !== holdY) window.scrollTo(0, holdY)
          },
        })

        snapTl.to(window, {
          scrollTo: { y: targetY, autoKill: false },
          duration: SNAP_SCROLL_DURATION,
          ease: 'power2.inOut',
        })
      }

      let splits = []
      let snapTriggers = []
      let tl = null
      let onResize = null
      let mounted = true

      const build = contextSafe(() => {
        if (!mounted) return

        const panelLines = panels.map((panel, panelIdx) => {
          const targets = panel.querySelectorAll('[data-reveal]')
          const s = SplitText.create(targets, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            linesClass: 'reveal-line',
            onSplit: (self) => {
              const isActive = panelIdx === activeIndexRef.current
              gsap.set(self.lines, { yPercent: isActive ? 0 : 110 })
            },
          })
          splits.push(s)
          return s.lines
        })

        gsap.set(panelLines[0], { yPercent: 0 })
        panelLines
          .slice(1)
          .forEach((lines) => gsap.set(lines, { yPercent: 110 }))
        gsap.set(nonFirstReveals, { opacity: 1 })

        tl = gsap.timeline({
          scrollTrigger: {
            trigger: stageRef.current,
            start: 'top top',
            end: () => `+=${transitions * SCROLL_PER_TRANSITION * window.innerHeight}`,
            pin: true,
            pinSpacing: false,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })

        for (let i = 0; i < transitions; i++) {
          const t = i

          tl.to(
              progressHighlightRef.current,
              { attr: { x: HIGHLIGHT_X[i + 1], fill: TOWER_ACCENTS[(i + 1) % towers.length] }, ease: 'power2.inOut' },
              t + 0.1,
            )
            .to(heroFeatureIcons,
                { color: TOWER_ACCENTS[(i + 1) % towers.length], duration: 0.5, ease: 'power2.inOut' },
                t + 0.1)
            .to(heroCtaButton,
                { backgroundColor: TOWER_ACCENTS[(i + 1) % towers.length], duration: 0.5, ease: 'power2.inOut' },
                t + 0.1)
            .to(heroStatCards,
                { backgroundColor: `${TOWER_ACCENTS[(i + 1) % towers.length]}0A`, duration: 0.5, ease: 'power2.inOut' },
                t + 0.1)

          tl.to(panelLines[i % towers.length],
                { yPercent: -110, duration: 0.35, stagger: { each: 0.04, amount: 0.4 }, ease: 'power3.in' }, t)

          // Wrap-forward: panel[0]'s lines have been parked at yPercent=-110
          // since the i=0 slide-out and were never re-positioned. Without
          // this reset they'd slide DOWN from above on the wrap-back, while
          // every other panel slides UP from below. Set them to 110
          // off-screen-below just before the wrap slide-in. The position is
          // off-screen on both sides, so the instant change isn't visible.
          if (i === transitions - 1) {
            tl.set(panelLines[0], { yPercent: 110 }, t + 0.4)
          }

          tl.to(panelLines[(i + 1) % towers.length],
                { yPercent: 0, duration: 0.35, stagger: { each: 0.08, amount: 0.45 }, ease: 'expo.out' }, t + 0.5)
        }

        tl.set({}, {}, transitions)

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

        onResize = () => ScrollTrigger.refresh()
        window.addEventListener('resize', onResize)

        ScrollTrigger.refresh()
      })

      document.fonts.ready.then(build)

      return () => {
        mounted = false
        if (tl) tl.kill()
        splits.forEach((s) => s.revert())
        snapTriggers.forEach((t) => t.kill())
        if (onResize) window.removeEventListener('resize', onResize)
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
