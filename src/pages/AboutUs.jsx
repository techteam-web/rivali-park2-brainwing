import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'
import Hero from '../components/about/Hero'
import JourneyThroughTime from '../components/about/JourneyThroughTime'
import Visionaries from '../components/about/Visionaries'
import DesignedByMasters from '../components/about/DesignedByMasters'
import { useSlideTransition } from '../hooks/useSlideTransition'
import { usePageTransition } from '../hooks/usePageTransition'
import InlineSVG from '../components/about/InlineSVG'
import Header from '../components/layout/Header'

const AboutUs = () => {
  const containerRef = useRef(null)
  // Gallery-style page entrance on an outer wrapper so the slide container and
  // its per-slide animations are left untouched.
  const pageRef = useRef(null)
  usePageTransition({ containerRef: pageRef })
  const slideRefs = useRef([])
  const sectionRefs = useRef([])
  const headerRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Per-slide scale per breakpoint and full-viewport background color.
  // `bg` paints the entire slide so colored sections (e.g. pastel brown)
  // extend across the full screen instead of looking like a centered box.
  const sections = [
    {
      Component: Hero,
      key: 'hero',
      bg: 'bg-white',
      scale:
        'scale-[0.7] lg:scale-[0.95] xl:scale-[0.9] 2xl:scale-[0.95] 3xl:scale-[0.94] 4xl:scale-[0.92] 5xl:scale-[1]',
    },
    {
      Component: JourneyThroughTime,
      key: 'journey',
      bg: 'bg-pastel-brown-bg',
      scale:
        'scale-[0.7] lg:scale-[0.67] xl:scale-[0.75] 2xl:scale-[0.75] 3xl:scale-[0.8] 4xl:scale-[0.8] 5xl:scale-[0.85]',
    },
    {
      Component: Visionaries,
      key: 'visionaries',
      bg: 'bg-white',
      scale:
        'scale-[0.7] lg:scale-[0.65] xl:scale-[0.65] 2xl:scale-[0.65] 3xl:scale-[0.63] 4xl:scale-[0.65] 5xl:scale-[0.7]',
    },
    {
      Component: DesignedByMasters,
      key: 'designed',
      bg: 'bg-pastel-brown-bg',
      scale:
        'scale-[0.7] lg:scale-[0.7] xl:scale-[0.68] 2xl:scale-[0.68] 3xl:scale-[0.65] 4xl:scale-[0.7] 5xl:scale-[0.73]',
    },
  ]
  const totalSlides = sections.length

  const { attachTriggers } = useSlideTransition({
    totalSlides,
    slideRefs,
    sectionRefs,
    headerRef,
    onSwap: setCurrentSlide,
    initialIndex: 0,
    wrap: true,
  })

  useEffect(() => attachTriggers(containerRef), [attachTriggers])

  // Footer SVG draw-in. Owned here (not in DesignedByMasters) because the
  // footer is rendered at the page level. Tied directly to currentSlide so
  // it can never drift out of sync with the visible slide. The InlineSVG is
  // async — if its paths aren't ready yet, we poll until they are.
  useGSAP(
    () => {
      const drawSel =
        'svg path, svg line, svg polyline, svg polygon, svg circle, svg ellipse, svg rect'
      let cancelled = false
      const isDbm = currentSlide === sections.length - 1

      const apply = () => {
        const el = document.querySelector('[data-about-footer]')
        if (!el || el.getAttribute('data-inline-svg-loaded') !== 'true') return false
        const paths = el.querySelectorAll(drawSel)
        if (!paths.length) return false
        gsap.killTweensOf(paths)
        if (isDbm) {
          gsap.set(paths, { drawSVG: 0 })
          gsap.to(paths, {
            drawSVG: '0% 100%',
            stagger: 0.01,
            duration: 0.6,
            ease: 'power1.inOut',
            delay: 0.3,
          })
        } else {
          gsap.set(paths, { drawSVG: 0 })
        }
        return true
      }

      if (apply()) return

      const start = performance.now()
      const tick = () => {
        if (cancelled) return
        if (apply() || performance.now() - start > 4000) return
        requestAnimationFrame(tick)
      }
      tick()

      return () => {
        cancelled = true
      }
    },
    { scope: containerRef, dependencies: [currentSlide] },
  )

  return (
    <div ref={pageRef} className="h-full w-full">
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden relative"
    >
      <div
        ref={headerRef}
        className="absolute top-0 left-0 right-0 z-50"
      >
        <Header />
      </div>
      {sections.map(({ Component, key, scale, bg }, index) => {
        const isLast = index === sections.length - 1
        return (
          <div
            key={key}
            ref={(el) => (slideRefs.current[index] = el)}
            data-slide-index={index}
            className={`absolute inset-0 w-full h-full overflow-hidden ${bg}`}
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className={`w-full origin-center ${scale}`}>
                <Component ref={(el) => (sectionRefs.current[index] = el)} />
              </div>
            </div>
            {isLast && (
              <InlineSVG
                src="/about/about-footer.svg"
                aria-hidden="true"
                data-about-footer
                data-undraw
                className="absolute bottom-0 left-0 w-full h-auto opacity-50 select-none pointer-events-none"
              />
            )}
          </div>
        )
      })}
    </div>
    </div>
  )
}

export default AboutUs
