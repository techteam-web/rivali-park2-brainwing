import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { gsap, inlineSvgsReady } from '../lib/gsap'
import InlineSVG from '../components/about/InlineSVG'
import {
  centralCourtyardHotspots,
  findCentralCourtyardHotspotIndex,
} from '../data/centralCourtyardHotspots'
import { useGalleryHotspotTransition } from '../hooks/useGalleryHotspotTransition'
import {
  runHotspotSlideTransition,
  resetHotspotSlide,
  POLYGON_FULL,
} from '../lib/hotspotSlideTransition'

const BG_W = 1440
const BG_H = 1024

// Pool-blue overlay along the bottom — Figma values for the Central
// Courtyard hotspot pages: linear-gradient(180deg, rgba(85,126,146,0) 0%,
// #557E92 76.5%). Shared across every slide in this section, matching the
// fixed brown overlay on SocialClubHotspot.
const BOTTOM_BG =
  'linear-gradient(180deg, rgba(85, 126, 146, 0) 0%, #557E92 76.5%)'

// Wavy progress-bar path, lifted from the social club hotspot SVG so the
// two layers (translucent track + opaque overlay) can be addressed
// independently for drawSVG.
const PROGRESS_PATH_D =
  'M0.197938 8.45599L17.1231 6.76912C26.1792 5.86654 35.3214 6.42116 44.202 8.41189L45.3526 8.66982C55.8819 11.0301 66.7816 11.2209 77.3871 9.23031C87.0004 7.42598 96.8642 7.41232 106.483 9.19001L107.606 9.3977C117.431 11.2136 127.499 11.2951 137.352 9.63834L137.765 9.5689C147.891 7.86624 158.238 7.94994 168.335 9.81622L170.53 10.2219C179.205 11.8252 188.053 12.2805 196.846 11.5763L214.191 10.1872'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const DRAW_SEL =
  'path:not([data-no-draw]):not([data-no-undraw]),' +
  'line:not([data-no-draw]):not([data-no-undraw]),' +
  'polyline:not([data-no-draw]):not([data-no-undraw]),' +
  'polygon:not([data-no-draw]):not([data-no-undraw]),' +
  'circle:not([data-no-draw]):not([data-no-undraw]),' +
  'ellipse:not([data-no-draw]):not([data-no-undraw]),' +
  'rect:not([data-no-draw]):not([data-no-undraw])'

// Single-page slider for Central Courtyard hotspot detail screens. Mirrors
// SocialClubHotspot — adding a new entry to `centralCourtyardHotspots`
// gets a new slide for free. Wheel / touch / arrow keys advance between
// slides; the URL stays in sync so links into a specific hotspot land on
// the right slide.
const CentralCourtyardHotspot = () => {
  const navigate = useNavigate()
  const { hotspot } = useParams()
  const containerRef = useRef(null)
  const slideRefs = useRef([])
  const progressRef = useRef(null)
  const titleRef = useRef(null)
  const { exitTo } = useGalleryHotspotTransition({ containerRef })

  const initialIndex = Math.max(0, findCentralCourtyardHotspotIndex(hotspot))
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const isAnimatingRef = useRef(false)
  const wheelLockRef = useRef(false)

  useEffect(() => {
    if (findCentralCourtyardHotspotIndex(hotspot) === -1) {
      navigate(
        `/gallery/central-courtyard/${centralCourtyardHotspots[0].slug}`,
        { replace: true },
      )
    }
  }, [hotspot, navigate])

  useEffect(() => {
    const idx = findCentralCourtyardHotspotIndex(hotspot)
    if (idx !== -1 && idx !== activeIndex) {
      setActiveIndex(idx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspot])

  // Initial state: hide every slide except the active one and snap any
  // already-loaded decorative paths to drawSVG: 0 before first paint.
  // useLayoutEffect runs synchronously before paint, so we never flash
  // fully-drawn SVGs on mount when InlineSVG returns a cached document.
  useLayoutEffect(() => {
    slideRefs.current.forEach((slide, i) => {
      if (!slide) return
      const isActive = i === initialIndex
      gsap.set(slide, {
        autoAlpha: isActive ? 1 : 0,
        zIndex: isActive ? 1 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
        clipPath: POLYGON_FULL,
      })
      const content = slide.querySelector('.slide-content')
      if (content) gsap.set(content, { y: 0 })
      const paths = slide.querySelectorAll(DRAW_SEL)
      if (paths.length) gsap.set(paths, { opacity: 0, drawSVG: 0 })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Opacity tweens 0 → 1 in lockstep with drawSVG so round-linecap "dot"
  // artefacts that appear when stroke-dasharray makes the visible portion
  // 0 stay hidden — the path is also at opacity 0 at the start of its
  // tween, so the cap circle can never paint visibly.
  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const slide = slideRefs.current[activeIndex]
    if (!slide) return

    let cancelled = false
    inlineSvgsReady(slide).then(() => {
      if (cancelled) return
      const paths = slide.querySelectorAll(DRAW_SEL)
      if (!paths.length) return
      gsap.killTweensOf(paths)
      gsap.set(paths, { opacity: 0, drawSVG: 0 })
      if (prefersReducedMotion()) {
        gsap.set(paths, { opacity: 1, drawSVG: '0% 100%' })
        return
      }
      gsap.to(paths, {
        opacity: 1,
        drawSVG: '0% 100%',
        duration: 1.4,
        ease: 'power2.inOut',
        // Cap the total stagger window. At a flat 0.02s per path a slide
        // whose artwork reuses one drawing several times (the cafeteria
        // has 282 paths across six vases) took ~10s to finish drawing.
        // Small sets keep the original per-path feel.
        stagger: { amount: Math.min(paths.length * 0.02, 1.2), from: 'random' },
        delay: 0.25,
      })
    })

    return () => {
      cancelled = true
    }
  }, [activeIndex])

  // Per-slide title animation: fade + slide up the heading every time the
  // active slide changes. `key={slug}` on the <h1> remounts the element,
  // so titleRef points at a fresh node here. useLayoutEffect runs before
  // paint so the first frame is already at autoAlpha 0 — no flash of the
  // new title at full opacity before the tween kicks in.
  useLayoutEffect(() => {
    const el = titleRef.current
    if (!el) return
    gsap.killTweensOf(el)
    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, y: 0 })
      return
    }
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 },
    )
  }, [activeIndex])

  // First mount snaps the bar to empty so landing on any hotspot starts
  // at zero and draws up to the target. Subsequent slide changes tween
  // from the bar's current value to the new target.
  const hasMountedProgressRef = useRef(false)
  useEffect(() => {
    const path = progressRef.current
    if (!path) return
    const target = centralCourtyardHotspots[activeIndex]?.progress ?? 0
    const end = `0% ${Math.max(0, Math.min(1, target)) * 100}%`
    gsap.killTweensOf(path)
    if (prefersReducedMotion()) {
      gsap.set(path, { drawSVG: end })
      hasMountedProgressRef.current = true
      return
    }
    if (!hasMountedProgressRef.current) {
      gsap.set(path, { drawSVG: '0% 0%' })
      hasMountedProgressRef.current = true
    }
    gsap.to(path, {
      drawSVG: end,
      duration: 0.9,
      ease: 'power2.inOut',
    })
  }, [activeIndex])

  const goTo = (target) => {
    if (isAnimatingRef.current) return
    const total = centralCourtyardHotspots.length
    let toIdx = target
    if (toIdx < 0) toIdx = total - 1
    if (toIdx >= total) toIdx = 0
    if (toIdx === activeIndex) return

    const fromSlide = slideRefs.current[activeIndex]
    const toSlide = slideRefs.current[toIdx]
    if (!fromSlide || !toSlide) return

    isAnimatingRef.current = true

    // Pre-hide the incoming slide's strokes synchronously so they don't
    // appear fully drawn during the crossfade — only matters on revisits
    // where drawSVG was last left at '0% 100%'. The activeIndex effect
    // re-runs the draw-in once we settle on the new slide.
    const toPaths = toSlide.querySelectorAll(DRAW_SEL)
    if (toPaths.length) {
      gsap.killTweensOf(toPaths)
      gsap.set(toPaths, { opacity: 0, drawSVG: 0 })
    }

    // Fade the current title out alongside the crossfade. The new title's
    // own fade-up tween fires from the activeIndex layout effect once the
    // <h1> remounts with the next slide's name.
    const titleEl = titleRef.current
    if (titleEl && !prefersReducedMotion()) {
      gsap.killTweensOf(titleEl)
      gsap.to(titleEl, {
        autoAlpha: 0,
        y: -20,
        duration: 0.4,
        ease: 'power2.in',
      })
    }

    const direction = toIdx > activeIndex ? 'next' : 'prev'

    const onDone = () => {
      resetHotspotSlide(fromSlide)
      gsap.set(toSlide, {
        autoAlpha: 1,
        zIndex: 1,
        pointerEvents: 'auto',
        clipPath: POLYGON_FULL,
      })
      isAnimatingRef.current = false
      setActiveIndex(toIdx)
      navigate(
        `/gallery/central-courtyard/${centralCourtyardHotspots[toIdx].slug}`,
        { replace: true },
      )
    }

    if (prefersReducedMotion()) {
      gsap.set(toSlide, { autoAlpha: 1, zIndex: 1, pointerEvents: 'auto' })
      onDone()
      return
    }

    runHotspotSlideTransition({
      fromSlide,
      toSlide,
      direction,
      onComplete: onDone,
    })
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e) => {
      if (isAnimatingRef.current || wheelLockRef.current) return
      wheelLockRef.current = true
      setTimeout(() => {
        wheelLockRef.current = false
      }, 120)
      if (e.deltaY > 0) goTo(activeIndex + 1)
      else if (e.deltaY < 0) goTo(activeIndex - 1)
    }

    let touchStartY = 0
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }
    const handleTouchEnd = (e) => {
      if (isAnimatingRef.current) return
      const diff = touchStartY - e.changedTouches[0].clientY
      if (Math.abs(diff) > 50) {
        if (diff > 0) goTo(activeIndex + 1)
        else goTo(activeIndex - 1)
      }
    }

    const handleKey = (e) => {
      if (isAnimatingRef.current) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
        goTo(activeIndex + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goTo(activeIndex - 1)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: true })
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('keydown', handleKey)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('keydown', handleKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex])

  const handleBack = () => navigate('/gallery/central-courtyard')

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black"
    >
      {centralCourtyardHotspots.map((h, i) => (
        <div
          key={h.slug}
          ref={(el) => (slideRefs.current[i] = el)}
          className="absolute inset-0 w-full h-full"
        >
          <div className="slide-content absolute inset-0 w-full h-full">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: `max(100vw, calc(100vh * ${BG_W} / ${BG_H}))`,
                height: `max(100vh, calc(100vw * ${BG_H} / ${BG_W}))`,
              }}
            >
              <img
                src={h.bg}
                alt=""
                className="block w-full h-full object-cover select-none pointer-events-none"
                style={h.objectPosition ? { objectPosition: h.objectPosition } : undefined}
                draggable={false}
              />

              {h.decoratives.map((d) => (
                <InlineSVG
                  key={d.name}
                  src={d.src}
                  aria-hidden="true"
                  data-draw
                  data-tune={d.name}
                  className="absolute block select-none pointer-events-none"
                  style={{
                    top: `${d.top * 100}%`,
                    left: `${d.left * 100}%`,
                    width: `${d.width * 100}%`,
                    // Mirrors a doodle the artwork reuses facing the other way.
                    // Scaling about the centre leaves the bounding box — and so
                    // top/left — exactly where it is.
                    transform: d.flip ? 'scaleX(-1)' : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Bottom pool-blue gradient overlay — sits above slides, below UI.
          Height uses vh (not the literal 330px from Figma) so the band keeps
          its design proportion (~32% of the 1024px-tall design canvas) on
          taller-than-design viewports. */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute left-0 right-0 pointer-events-none z-10"
        style={{ bottom: 0, height: '32vh', backgroundImage: BOTTOM_BG }}
      />

      {/* Top header gradient + blur, mirroring the SocialClub map page. */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-0 left-0 right-0 z-50 pointer-events-none lg:backdrop-blur-[2px] xl:backdrop-blur-[2.5px] 2xl:backdrop-blur-[3px] 3xl:backdrop-blur-[3.7px] 4xl:backdrop-blur-[5px] 5xl:backdrop-blur-[7.5px] h-[33px] xl:h-[41px] 2xl:h-[50px] 3xl:h-[62px] 4xl:h-[83px] 5xl:h-[124px]"
        style={{
          mask: 'linear-gradient(to bottom, black 0%, black 30%, transparent 100%)',
          WebkitMask:
            'linear-gradient(to bottom, black 0%, black 30%, transparent 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-0 left-0 right-0 z-[51] pointer-events-none h-[90px] xl:h-[113px] 2xl:h-[135px] 3xl:h-[169px] 4xl:h-[225px] 5xl:h-[338px]"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
        }}
      />

      <div className="hidden lg:flex absolute top-5 left-5 z-50 items-center gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 4xl:gap-5 5xl:gap-8">
        <button
          type="button"
          aria-label="Back"
          onClick={handleBack}
          className="flex items-center justify-center rounded-full transition-[transform,filter] duration-200 hover:scale-[1.05] hover:brightness-125 focus:outline-none focus-visible:scale-[1.05] focus-visible:brightness-125 h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
          style={{ backgroundColor: 'rgba(49, 49, 49, 0.2)' }}
        >
          <svg
            viewBox="0 0 25 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12"
          >
            <path d="M22.332 12.0191H2.21366M11.2814 20.3545L2.21366 12.0191L11.2814 3.64453" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Go to homepage"
          onClick={() => exitTo('/')}
          className="flex items-center justify-center rounded-full transition-[transform,filter] duration-200 hover:scale-[1.05] hover:brightness-125 focus:outline-none focus-visible:scale-[1.05] focus-visible:brightness-125 h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
          style={{ backgroundColor: 'rgba(49, 49, 49, 0.2)' }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12"
          >
            <path d="M4 11.5L12 4l8 7.5" />
            <path d="M6 10.5V19a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-8.5" />
          </svg>
        </button>
      </div>

      <h1
        key={centralCourtyardHotspots[activeIndex].slug}
        ref={titleRef}
        className="hidden lg:block absolute z-20 text-white pointer-events-none left-[45px] xl:left-[56px] 2xl:left-[68px] 3xl:left-[84px] 4xl:left-[113px] 5xl:left-[169px] bottom-[40px] xl:bottom-[50px] 2xl:bottom-[60px] 3xl:bottom-[75px] 4xl:bottom-[100px] 5xl:bottom-[150px] text-[17px] xl:text-[21px] 2xl:text-[26px] 3xl:text-[32px] 4xl:text-[43px] 5xl:text-[64px]"
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 400,
          lineHeight: '120%',
          letterSpacing: '0.12em',
          textTransform: 'capitalize',
        }}
      >
        {centralCourtyardHotspots[activeIndex].name}
      </h1>

      {/* Progress bar — bottom-right per Figma. Two layers share the
          same wavy path: a translucent track (always full length) and an
          opaque overlay whose drawSVG range is animated per slide. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 215 18"
        preserveAspectRatio="none"
        className="hidden lg:block absolute z-20 pointer-events-none right-[45px] xl:right-[56px] 2xl:right-[68px] 3xl:right-[84px] 4xl:right-[113px] 5xl:right-[169px] bottom-[43px] xl:bottom-[54px] 2xl:bottom-[64px] 3xl:bottom-[81px] 4xl:bottom-[108px] 5xl:bottom-[161px] w-[151px] xl:w-[189px] 2xl:w-[227px] 3xl:w-[283px] 4xl:w-[378px] 5xl:w-[566px] h-[11px] xl:h-[14px] 2xl:h-[17px] 3xl:h-[21px] 4xl:h-[28px] 5xl:h-[41px]"
        style={{ transform: 'rotate(0.46deg)' }}
      >
        <path
          d={PROGRESS_PATH_D}
          stroke="white"
          strokeOpacity="0.4"
          strokeWidth="4"
          fill="none"
        />
        <path
          ref={progressRef}
          d={PROGRESS_PATH_D}
          stroke="white"
          strokeWidth="4"
          fill="none"
        />
      </svg>
    </div>
  )
}

export default CentralCourtyardHotspot
