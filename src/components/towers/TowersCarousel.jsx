import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { useGSAP } from '@gsap/react'
import { towers, TOWER_ACCENTS } from '../../data/towers'
import TowerPanel from './TowerPanel'
import TowerProgress from './TowerProgress'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const HIGHLIGHT_X = [1.73389, 55.5, 109.25, 163]

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
    () => {
      const panels = panelRefs.current
      const stages = panels.map((p) => p.querySelector('[data-image-stage]'))
      const texts = panels.map((p) => p.querySelector('[data-text-col]'))

      gsap.set(stages[0], { autoAlpha: 1, y: 0, scale: 1 })
      gsap.set(texts[0], { autoAlpha: 1, y: 0 })
      gsap.set(stages.slice(1), { autoAlpha: 0, y: 60, scale: 1.06 })
      gsap.set(texts.slice(1), { autoAlpha: 0, y: 30 })
      gsap.set(progressHighlightRef.current, {
        attr: { x: HIGHLIGHT_X[0], fill: TOWER_ACCENTS[0] },
      })

      const transitions = towers.length - 1

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stageRef.current,
          start: 'top top',
          end: () => `+=${transitions * window.innerHeight}`,
          pin: true,
          pinSpacing: false,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      for (let i = 0; i < transitions; i++) {
        const t = i

        tl.to(stages[i],     { autoAlpha: 0, y: -40, scale: 1.05, ease: 'power2.in' }, t)
          .to(texts[i],      { autoAlpha: 0, y: -15, ease: 'power2.in' }, t + 0.05)
          .to(stages[i + 1], { autoAlpha: 1, y: 0, scale: 1, ease: 'power2.out' }, t + 0.15)
          .to(texts[i + 1],  { autoAlpha: 1, y: 0, ease: 'power2.out' }, t + 0.25)
          .to(
            progressHighlightRef.current,
            { attr: { x: HIGHLIGHT_X[i + 1], fill: TOWER_ACCENTS[i + 1] }, ease: 'power2.inOut' },
            t + 0.1,
          )
      }

      tl.set({}, {}, transitions)

      let isAnimating = false

      const goToSection = (target) => {
        if (isAnimating || target < 0 || target >= towers.length) return
        isAnimating = true
        const targetY = Math.min(
          target * window.innerHeight,
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

      const snapTriggers = []
      for (let i = 0; i < transitions; i++) {
        snapTriggers.push(
          ScrollTrigger.create({
            start: () => i * window.innerHeight + 1,
            end: () =>
              Math.min(
                (i + 1) * window.innerHeight - 1,
                ScrollTrigger.maxScroll(window) - 1,
              ),
            onEnter: () => goToSection(i + 1),
            onEnterBack: () => goToSection(i),
            invalidateOnRefresh: true,
          }),
        )
      }

      const onResize = () => ScrollTrigger.refresh()
      window.addEventListener('resize', onResize)

      return () => {
        snapTriggers.forEach((t) => t.kill())
        window.removeEventListener('resize', onResize)
      }
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      className="relative bg-white"
      style={{ height: `${towers.length * 100}vh` }}
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
