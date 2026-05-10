import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../../gsap/Gsapconfig'
import { towers, TOWER_ACCENTS } from '../../data/towers'
import TowerPanel from './TowerPanel'
import TowerProgress from './TowerProgress'
import TowersCanvas from '../../three/TowersCanvas'
import TowerDecorations from './TowerDecorations'
import RaggedyEdge from './RaggedyEdge'

const HIGHLIGHT_X = [1.73389, 56.75, 111.77, 166.79, 1.73389]

const SCROLL_PER_TRANSITION = 4.0 // multiplier of viewport height per panel transition

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

        gsap.to(window, {
          scrollTo: { y: targetY, autoKill: false },
          duration: 5.2,
          ease: 'power2.inOut',
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
