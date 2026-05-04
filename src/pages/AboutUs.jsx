import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'
import Hero from '../components/about/Hero'
import JourneyThroughTime from '../components/about/JourneyThroughTime'
import Visionaries from '../components/about/Visionaries'
import DesignedByMasters from '../components/about/DesignedByMasters'
import SectionSweeper from '../components/about/SectionSweeper'
import { useDiagonalSweep } from '../hooks/useDiagonalSweep'
import Header from '../components/layout/Header'

const AboutUs = () => {
  const containerRef = useRef(null)
  const slideRefs = useRef([])
  const sectionRefs = useRef([])
  const sweeperRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { playTransition, isAnimating } = useDiagonalSweep({ sweeperRef })

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
        'scale-[0.7] lg:scale-[0.8] xl:scale-[0.85] 2xl:scale-[0.87] 3xl:scale-[0.93] 4xl:scale-[0.93] 5xl:scale-[0.95]',
    },
    {
      Component: Visionaries,
      key: 'visionaries',
      bg: 'bg-white',
      scale:
        'scale-[0.7] lg:scale-[0.75] xl:scale-[0.7] 2xl:scale-[0.7] 3xl:scale-[0.73] 4xl:scale-[0.73] 5xl:scale-[0.75]',
    },
    {
      Component: DesignedByMasters,
      key: 'designed',
      bg: 'bg-pastel-brown-bg',
      scale:
        'scale-[0.7] lg:scale-[0.8] xl:scale-[0.78] 2xl:scale-[0.78] 3xl:scale-[0.8] 4xl:scale-[0.8] 5xl:scale-[0.83]',
    },
  ]
  const totalSlides = sections.length

  // Initial setup: only slide 0 is visible. Other slides sit hidden and
  // disabled until the sweeper transition reveals them.
  useGSAP(
    () => {
      slideRefs.current.forEach((slide, index) => {
        if (!slide) return
        const isFirst = index === 0
        gsap.set(slide, {
          y: 0,
          opacity: isFirst ? 1 : 0,
          zIndex: isFirst ? 1 : 0,
          pointerEvents: isFirst ? 'auto' : 'none',
        })
        slide.setAttribute('aria-hidden', isFirst ? 'false' : 'true')
      })

      // Trigger slide 0's reveal animation. Section may not yet have built its
      // timeline (it waits on aboutReveal + image decode). The section queues
      // the action and runs it once ready.
      sectionRefs.current[0]?.playIn()
    },
    { scope: containerRef },
  )

  const goToSlide = (targetIndex) => {
    if (isAnimating()) return
    let toIdx = targetIndex
    if (toIdx < 0) toIdx = totalSlides - 1
    if (toIdx >= totalSlides) toIdx = 0
    if (toIdx === currentSlide) return

    const fromIdx = currentSlide
    const isForward = toIdx === (fromIdx + 1) % totalSlides
    const direction = isForward ? 'forward' : 'backward'

    playTransition({
      fromIdx,
      toIdx,
      direction,
      fromSlide: slideRefs.current[fromIdx],
      toSlide: slideRefs.current[toIdx],
      fromSection: sectionRefs.current[fromIdx],
      toSection: sectionRefs.current[toIdx],
      onSwap: (idx) => setCurrentSlide(idx),
    })
  }

  // Wheel navigation
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let wheelLock = false
    const handleWheel = (e) => {
      if (isAnimating() || wheelLock) return
      wheelLock = true
      setTimeout(() => {
        wheelLock = false
      }, 100)
      if (e.deltaY > 0) {
        goToSlide(currentSlide + 1)
      } else if (e.deltaY < 0) {
        goToSlide(currentSlide - 1)
      }
    }
    container.addEventListener('wheel', handleWheel, { passive: true })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [currentSlide])

  // Touch navigation
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let touchStartY = 0
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }
    const handleTouchEnd = (e) => {
      if (isAnimating()) return
      const touchEndY = e.changedTouches[0].clientY
      const diff = touchStartY - touchEndY
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToSlide(currentSlide + 1)
        else goToSlide(currentSlide - 1)
      }
    }
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [currentSlide])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (isAnimating()) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToSlide(currentSlide + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToSlide(currentSlide - 1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentSlide])

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden relative"
    >
      <div
        className={`absolute top-0 left-0 right-0 z-50 transition-opacity duration-500 ${
          currentSlide === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
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
              <img
                src="/about/about-footer.svg"
                alt=""
                aria-hidden="true"
                className="absolute bottom-0 left-0 w-full h-auto opacity-50 select-none pointer-events-none"
              />
            )}
          </div>
        )
      })}
      <SectionSweeper ref={sweeperRef} />
    </div>
  )
}

export default AboutUs
