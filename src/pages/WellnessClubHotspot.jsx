import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { gsap, inlineSvgsReady } from '../lib/gsap'
import InlineSVG from '../components/about/InlineSVG'
import {
  wellnessClubHotspots,
  findWellnessHotspotIndex,
} from '../data/wellnessClubHotspots'

const BG_W = 1440
const BG_H = 1024

// Rose overlay along the bottom — Figma values for the wellness hotspot
// pages: linear-gradient(180deg, rgba(164,104,123,0) 0%, #A4687B 76.5%)
const BOTTOM_BG =
  'linear-gradient(180deg, rgba(164, 104, 123, 0) 0%, #A4687B 76.5%)'

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

const WellnessClubHotspot = () => {
  const navigate = useNavigate()
  const { hotspot } = useParams()
  const containerRef = useRef(null)
  const slideRefs = useRef([])
  const progressRef = useRef(null)

  const initialIndex = Math.max(0, findWellnessHotspotIndex(hotspot))
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const isAnimatingRef = useRef(false)
  const wheelLockRef = useRef(false)

  useEffect(() => {
    if (findWellnessHotspotIndex(hotspot) === -1) {
      navigate(`/gallery/wellness-club/${wellnessClubHotspots[0].slug}`, {
        replace: true,
      })
    }
  }, [hotspot, navigate])

  useEffect(() => {
    const idx = findWellnessHotspotIndex(hotspot)
    if (idx !== -1 && idx !== activeIndex) {
      setActiveIndex(idx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspot])

  useEffect(() => {
    slideRefs.current.forEach((slide, i) => {
      if (!slide) return
      const isActive = i === initialIndex
      gsap.set(slide, {
        autoAlpha: isActive ? 1 : 0,
        zIndex: isActive ? 1 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      gsap.set(paths, { drawSVG: 0 })
      if (prefersReducedMotion()) {
        gsap.set(paths, { drawSVG: '0% 100%' })
        return
      }
      gsap.to(paths, {
        drawSVG: '0% 100%',
        duration: 1.4,
        ease: 'power2.inOut',
        stagger: { each: 0.02, from: 'random' },
        delay: 0.25,
      })
    })

    return () => {
      cancelled = true
    }
  }, [activeIndex])

  // First mount snaps the bar to empty so landing on any hotspot starts
  // at zero and draws up to the target. Subsequent slide changes tween
  // from the bar's current value to the new target.
  const hasMountedProgressRef = useRef(false)
  useEffect(() => {
    const path = progressRef.current
    if (!path) return
    const target = wellnessClubHotspots[activeIndex]?.progress ?? 0
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
    const total = wellnessClubHotspots.length
    let toIdx = target
    if (toIdx < 0) toIdx = total - 1
    if (toIdx >= total) toIdx = 0
    if (toIdx === activeIndex) return

    const fromSlide = slideRefs.current[activeIndex]
    const toSlide = slideRefs.current[toIdx]
    if (!fromSlide || !toSlide) return

    isAnimatingRef.current = true

    const onDone = () => {
      gsap.set(fromSlide, {
        autoAlpha: 0,
        zIndex: 0,
        pointerEvents: 'none',
      })
      isAnimatingRef.current = false
      setActiveIndex(toIdx)
      navigate(`/gallery/wellness-club/${wellnessClubHotspots[toIdx].slug}`, {
        replace: true,
      })
    }

    if (prefersReducedMotion()) {
      gsap.set(toSlide, { autoAlpha: 1, zIndex: 1, pointerEvents: 'auto' })
      onDone()
      return
    }

    gsap.set(toSlide, { zIndex: 1, pointerEvents: 'auto' })
    const tl = gsap.timeline({ onComplete: onDone })
    tl.to(toSlide, { autoAlpha: 1, duration: 0.9, ease: 'power2.inOut' }, 0)
    tl.to(fromSlide, { autoAlpha: 0, duration: 0.9, ease: 'power2.inOut' }, 0)
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

  const handleBack = () => navigate('/gallery/wellness-club')

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black"
    >
      {wellnessClubHotspots.map((h, i) => (
        <div
          key={h.slug}
          ref={(el) => (slideRefs.current[i] = el)}
          className="absolute inset-0 w-full h-full"
        >
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
                className="absolute block select-none pointer-events-none"
                style={{
                  top: `${d.top * 100}%`,
                  left: `${d.left * 100}%`,
                  width: `${d.width * 100}%`,
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Bottom rose gradient overlay — sits above slides, below UI. */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute left-0 right-0 pointer-events-none z-10"
        style={{ bottom: 0, height: '32vh', backgroundImage: BOTTOM_BG }}
      />

      {/* Top header gradient + blur, mirroring SocialClubHotspot. */}
      <div
        aria-hidden="true"
        className="hidden lg:block lg:backdrop-blur-[2px] xl:backdrop-blur-[2.5px] 2xl:backdrop-blur-[3px] 3xl:backdrop-blur-[3.7px] 4xl:backdrop-blur-[5px] 5xl:backdrop-blur-[7.5px]"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '33px',
          mask: 'linear-gradient(to bottom, black 0%, black 30%, transparent 100%)',
          WebkitMask:
            'linear-gradient(to bottom, black 0%, black 30%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />
      <div
        aria-hidden="true"
        className="hidden lg:block"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '90px',
          backgroundImage:
            'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
          zIndex: 51,
        }}
      />

      <button
        type="button"
        aria-label="Back"
        onClick={handleBack}
        className="hidden lg:flex absolute top-5 left-5 z-50 items-center justify-center rounded-full transition-all duration-200 hover:scale-[1.05] hover:brightness-125 focus:outline-none focus-visible:scale-[1.05] focus-visible:brightness-125 h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15"
        style={{ backgroundColor: 'rgba(49, 49, 49, 0.2)' }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <h1
        key={wellnessClubHotspots[activeIndex].slug}
        className="hidden lg:block absolute z-20 text-white pointer-events-none"
        style={{
          left: '64px',
          bottom: '56px',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 500,
          fontSize: '24px',
          lineHeight: '120%',
          letterSpacing: '0.12em',
          textTransform: 'capitalize',
        }}
      >
        {wellnessClubHotspots[activeIndex].name}
      </h1>

      <svg
        aria-hidden="true"
        viewBox="0 0 215 18"
        preserveAspectRatio="none"
        className="hidden lg:block absolute z-20 pointer-events-none"
        style={{
          right: '64px',
          bottom: '60px',
          width: '213px',
          height: '16px',
          transform: 'rotate(0.46deg)',
        }}
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

export default WellnessClubHotspot
