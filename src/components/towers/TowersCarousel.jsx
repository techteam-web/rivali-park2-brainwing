import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { towers, TOWER_ACCENTS } from '../../data/towers'
import TowerPanel from './TowerPanel'
import TowerProgress from './TowerProgress'

gsap.registerPlugin(ScrollTrigger)

const HIGHLIGHT_X = [1.73389, 55.5, 109.25, 163]

const TowersCarousel = () => {
  const sectionRef = useRef(null)
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

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 3}`,
          pin: true,
          scrub: 1,
          snap: {
            snapTo: [0, 1 / 3, 2 / 3, 1],
            duration: { min: 0.2, max: 0.5 },
            ease: 'power2.inOut',
          },
          invalidateOnRefresh: true,
        },
      })

      for (let i = 0; i < 3; i++) {
        const t = i

        tl.to(
          stages[i],
          { autoAlpha: 0, y: -40, scale: 1.05, ease: 'power2.in' },
          t,
        )
          .to(
            texts[i],
            { autoAlpha: 0, y: -15, ease: 'power2.in' },
            t + 0.05,
          )
          .to(
            stages[i + 1],
            { autoAlpha: 1, y: 0, scale: 1, ease: 'power2.out' },
            t + 0.15,
          )
          .to(
            texts[i + 1],
            { autoAlpha: 1, y: 0, ease: 'power2.out' },
            t + 0.25,
          )
          .to(
            progressHighlightRef.current,
            {
              attr: { x: HIGHLIGHT_X[i + 1], fill: TOWER_ACCENTS[i + 1] },
              ease: 'power2.inOut',
            },
            t + 0.1,
          )
      }

      // Anchor the timeline's end at exactly 3 units so snap [0, 1/3, 2/3, 1]
      // aligns with towers 0..3 fully landing.
      tl.set({}, {}, 3)
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-white"
    >
      <div className="relative w-full h-full">
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
