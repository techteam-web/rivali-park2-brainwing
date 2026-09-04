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
import SketchLoadingScreen from '../components/loaders/SketchLoadingScreen'
import useLoaderReady from '../hooks/useLoaderReady'
import { useEntryLoader } from '../hooks/useEntryLoader'
import AboutLoaderVector from '../assets/loaders/about-loader-vector.svg?react'
import AboutLoaderSubheading from '../assets/loaders/about-loader-subheading.svg?react'

const AboutUs = () => {
  const containerRef = useRef(null)
  // Gallery-style page entrance on an outer wrapper so the slide container and
  // its per-slide animations are left untouched.
  const pageRef = useRef(null)
  const { exitTo } = usePageTransition({ containerRef: pageRef })
  const slideRefs = useRef([])
  const sectionRefs = useRef([])
  const headerRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  // Sketch intro over the page while the fonts settle, matching the other tabs.
  const loaderReady = useLoaderReady()
  const playLoader = useEntryLoader()
  const [overlayGone, setOverlayGone] = useState(() => !playLoader)

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
      Component: DesignedByMasters,
      key: 'designed',
      bg: 'bg-pastel-brown-bg',
      scale:
        'scale-[0.7] lg:scale-[0.7] xl:scale-[0.68] 2xl:scale-[0.68] 3xl:scale-[0.65] 4xl:scale-[0.7] 5xl:scale-[0.73]',
    },
    {
      Component: Visionaries,
      key: 'visionaries',
      bg: 'bg-white',
      scale:
        'scale-[0.7] lg:scale-[0.65] xl:scale-[0.65] 2xl:scale-[0.65] 3xl:scale-[0.63] 4xl:scale-[0.65] 5xl:scale-[0.7]',
    },
  ]
  const totalSlides = sections.length

  // The deck runs Hero → Journey → Designed By Masters → Visionaries and then
  // ENDS: scrolling on past the Visionaries returns to the homepage rather than
  // wrapping around to the Hero again (client feedback, 08 Aug).
  const { attachTriggers } = useSlideTransition({
    totalSlides,
    slideRefs,
    sectionRefs,
    headerRef,
    onSwap: setCurrentSlide,
    initialIndex: 0,
    wrap: false,
    onPastEnd: () => exitTo('/'),
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
      const isDbm = sections[currentSlide]?.key === 'designed'

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
    <>
    <div ref={pageRef} className="h-full w-full">
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden relative"
    >
      <div
        ref={headerRef}
        className="absolute top-0 left-0 right-0 z-50"
      >
        <Header onBack={() => exitTo('/')} arrowOnly />
      </div>
      {sections.map(({ Component, key, scale, bg }, index) => {
        const hasFooter = key === 'designed'
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
            {hasFooter && (
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
    {/* Sibling of the transition container on purpose: usePageTransition scales
        and blurs that container, which would both blur this overlay and make it
        the containing block for its `fixed` positioning. */}
    {!overlayGone && (
      <SketchLoadingScreen
        ready={loaderReady}
        onExitComplete={() => setOverlayGone(true)}
        Vector={AboutLoaderVector}
        vectorClassName="w-28 md:w-32 lg:w-32 2xl:w-40 3xl:w-48 h-auto"
        heading="Discover the story"
        Subheading={AboutLoaderSubheading}
        subheadingClassName="w-56 md:w-64 lg:w-64 2xl:w-72 h-auto"
      />
    )}
    </>
  )
}

export default AboutUs
