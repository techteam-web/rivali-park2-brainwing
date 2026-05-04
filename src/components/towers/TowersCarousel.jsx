import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../../gsap/Gsapconfig'
import { towers, TOWER_ACCENTS } from '../../data/towers'
import TowerPanel from './TowerPanel'
import TowerProgress from './TowerProgress'

const HIGHLIGHT_X = [1.73389, 55.5, 109.25, 163]

// Skyleap (i=0): R→L, Moonrise (i=1): B→T, Stargaze (i=2): R→L, Sunburst (i=3): B→T
const CLIP_CLOSED = [
  'inset(0% 100% 0% 0%)',
  'inset(100% 0% 0% 0%)',
  'inset(0% 100% 0% 0%)',
  'inset(100% 0% 0% 0%)',
]
const CLIP_OPEN = 'inset(0% 0% 0% 0%)'

const SCROLL_PER_TRANSITION = 4.0 // multiplier of viewport height per panel transition

const TowersCarousel = () => {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const panelRefs = useRef([])
  const progressHighlightRef = useRef(null)

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
      const clips = panels.map((p) => p.querySelector('[data-image-clip]'))

      const heroFeatureIcons = Array.from(
        panels[0].querySelectorAll('[data-feature-icon]'),
      )
      const heroCtaButton = panels[0].querySelector('[data-cta-button]')
      const heroStatCards = Array.from(
        panels[0].querySelectorAll('[data-stat-card]'),
      )

      gsap.set(progressHighlightRef.current, {
        attr: { x: HIGHLIGHT_X[0], fill: TOWER_ACCENTS[0] },
      })

      gsap.set(clips[0], { clipPath: CLIP_OPEN })
      clips.slice(1).forEach((el, idx) =>
        gsap.set(el, { clipPath: CLIP_CLOSED[idx + 1] }),
      )

      gsap.set(heroFeatureIcons, { color: TOWER_ACCENTS[0] })
      gsap.set(heroCtaButton, { backgroundColor: TOWER_ACCENTS[0] })
      gsap.set(heroStatCards, { backgroundColor: `${TOWER_ACCENTS[0]}0A` })

      const transitions = towers.length - 1

      let isAnimating = false
      const goToSection = (target) => {
        if (isAnimating || target < 0 || target >= towers.length) return
        isAnimating = true
        const targetY = Math.min(
          target * SCROLL_PER_TRANSITION * window.innerHeight,
          ScrollTrigger.maxScroll(window),
        )
        gsap.to(window, {
          scrollTo: { y: targetY, autoKill: false },
          duration: 1,
          ease: 'power2.inOut',
          onComplete: () => {
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

        const panelLines = panels.map((panel) => {
          const targets = panel.querySelectorAll('[data-reveal]')
          const s = SplitText.create(targets, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            linesClass: 'reveal-line',
          })
          splits.push(s)
          return s.lines
        })

        gsap.set(panelLines[0], { yPercent: 0 })
        panelLines
          .slice(1)
          .forEach((lines) => gsap.set(lines, { yPercent: 110 }))

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
              { attr: { x: HIGHLIGHT_X[i + 1], fill: TOWER_ACCENTS[i + 1] }, ease: 'power2.inOut' },
              t + 0.1,
            )
            .to(heroFeatureIcons,
                { color: TOWER_ACCENTS[i + 1], duration: 0.5, ease: 'power2.inOut' },
                t + 0.1)
            .to(heroCtaButton,
                { backgroundColor: TOWER_ACCENTS[i + 1], duration: 0.5, ease: 'power2.inOut' },
                t + 0.1)
            .to(heroStatCards,
                { backgroundColor: `${TOWER_ACCENTS[i + 1]}0A`, duration: 0.5, ease: 'power2.inOut' },
                t + 0.1)

          tl.to(panelLines[i],
                { yPercent: -110, duration: 0.35, stagger: { each: 0.04, amount: 0.4 }, ease: 'power3.in' }, t)

          tl.to(panelLines[i + 1],
                { yPercent: 0, duration: 0.15, stagger: { each: 0.04, amount: 0.1 }, ease: 'expo.out' }, t + 0.75)
            .to(clips[i + 1],
                { clipPath: CLIP_OPEN, duration: 1.0, ease: 'power3.inOut' }, t)
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
      style={{ height: `${((towers.length - 1) * SCROLL_PER_TRANSITION + 1) * 100}vh` }}
    >
      <div
        ref={stageRef}
        className="absolute top-0 left-0 w-full h-screen overflow-hidden"
      >
        {towers.map((tower, i) => (
          <TowerPanel
            key={tower.id}
            tower={tower}
            ref={(el) => {
              panelRefs.current[i] = el
            }}
          />
        ))}

        <div className="absolute bottom-10 right-10 lg:right-16 3xl:right-24 z-10 pointer-events-none">
          <TowerProgress
            ref={progressHighlightRef}
            initialAccent={TOWER_ACCENTS[0]}
          />
        </div>
      </div>
    </section>
  )
}

export default TowersCarousel
