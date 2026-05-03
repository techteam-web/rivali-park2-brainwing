import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'
import { CustomEase } from 'gsap/CustomEase'
import Hero from '../components/about/Hero'
import JourneyThroughTime from '../components/about/JourneyThroughTime'
import Visionaries from '../components/about/Visionaries'
import DesignedByMasters from '../components/about/DesignedByMasters'
import Header from '../components/layout/Header'

gsap.registerPlugin(CustomEase)

if (!CustomEase.get('hop')) {
  CustomEase.create('hop', 'M0,0 C0.083,0.294 0.117,0.767 0.413,0.908 0.606,1 0.752,1 1,1')
}

const directions = {
  fromBottom: {
    initial: 'inset(100% 0 0 0)',
    animate: 'inset(0 0 0% 0)',
  },
  fromTop: {
    initial: 'inset(0 0 100% 0)',
    animate: 'inset(0 0 0% 0)',
  },
}

const SLIDE_TRANSITION_DURATION = 1.2
const REVERSE_TO_TRANSITION_DELAY = 0.2
const POST_REVEAL_PAUSE = 0.05

const AboutUs = () => {
  const containerRef = useRef(null)
  const slideRefs = useRef([])
  const sectionRefs = useRef([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const isAnimatingRef = useRef(false)

  // Per-slide scale per breakpoint and full-viewport background color.
  // `bg` paints the entire slide so colored sections (e.g. pastel brown)
  // extend across the full screen instead of looking like a centered box.
  const sections = [
    {
      Component: Hero,
      key: 'hero',
      bg: 'bg-white',
      scale:
        'scale-[0.7] lg:scale-[0.9] xl:scale-[0.72] 2xl:scale-[0.75] 3xl:scale-[0.78] 4xl:scale-[0.82] 5xl:scale-[0.85]',
    },
    {
      Component: JourneyThroughTime,
      key: 'journey',
      bg: 'bg-pastel-brown-bg',
      scale:
        'scale-[0.7] lg:scale-[0.8] xl:scale-[0.72] 2xl:scale-[0.75] 3xl:scale-[0.78] 4xl:scale-[0.82] 5xl:scale-[0.85]',
    },
    {
      Component: Visionaries,
      key: 'visionaries',
      bg: 'bg-white',
      scale:
        'scale-[0.7] lg:scale-[0.75] xl:scale-[0.72] 2xl:scale-[0.75] 3xl:scale-[0.78] 4xl:scale-[0.82] 5xl:scale-[0.85]',
    },
    {
      Component: DesignedByMasters,
      key: 'designed',
      bg: 'bg-pastel-brown-bg',
      scale:
        'scale-[0.7] lg:scale-[0.8] xl:scale-[0.72] 2xl:scale-[0.75] 3xl:scale-[0.78] 4xl:scale-[0.82] 5xl:scale-[0.85]',
    },
  ]
  const totalSlides = sections.length

  // Initial setup: position all slides, play in slide 0
  useGSAP(
    () => {
      slideRefs.current.forEach((slide, index) => {
        if (!slide) return
        if (index === 0) {
          gsap.set(slide, { clipPath: 'inset(0 0 0 0)', zIndex: 1 })
        } else {
          // Default hidden state — sits "below" the viewport, ready to rise
          // up. goToSlide will overwrite based on actual nav direction.
          gsap.set(slide, { clipPath: directions.fromBottom.initial, zIndex: 0 })
        }
      })

      // Trigger slide 0's reveal animation. Section may not yet have built its
      // timeline (it waits on aboutReveal + image decode). The section queues
      // the action and runs it once ready.
      sectionRefs.current[0]?.playIn()
    },
    { scope: containerRef },
  )

  const goToSlide = (targetIndex) => {
    if (isAnimatingRef.current) return
    let toIdx = targetIndex
    if (toIdx < 0) toIdx = totalSlides - 1
    if (toIdx >= totalSlides) toIdx = 0
    if (toIdx === currentSlide) return

    const fromIdx = currentSlide
    const fromSlide = slideRefs.current[fromIdx]
    const toSlide = slideRefs.current[toIdx]
    const fromSection = sectionRefs.current[fromIdx]
    const toSection = sectionRefs.current[toIdx]
    if (!fromSlide || !toSlide) return

    // Direction-based clip-path:
    //   forward (next slide)  → incoming rises from bottom
    //   backward (prev slide) → incoming drops from top
    // Wrap-around is handled: last → 0 is forward, 0 → last is backward.
    const isForward = toIdx === (fromIdx + 1) % totalSlides
    const dir = isForward ? directions.fromBottom : directions.fromTop

    isAnimatingRef.current = true

    // Update active slide index immediately so UI driven by currentSlide
    // (header fade) responds in sync with the outgoing slide.
    setCurrentSlide(toIdx)

    // 1. Start outgoing section's reverse animation immediately (fast).
    fromSection?.playOut()

    // 2. Reset the incoming section to its pre-animation initial state and
    //    make it visible. The slide itself is still hidden by its clip-path,
    //    so this snap is invisible to the user.
    toSection?.prepare()

    // 3. Position the incoming slide for its clip-path reveal.
    gsap.set(toSlide, { clipPath: dir.initial, zIndex: 2 })

    // 4. After the brief delay, sweep the slide in. The incoming section's
    //    full original animation only starts once the slide is fully
    //    revealed, so the entire choreography is visible to the user.
    gsap.to(toSlide, {
      clipPath: dir.animate,
      duration: SLIDE_TRANSITION_DURATION,
      ease: 'hop',
      delay: REVERSE_TO_TRANSITION_DELAY,
      onComplete: () => {
        // Stash outgoing in a hidden default; next nav will set the right
        // direction when this slide becomes incoming again.
        gsap.set(fromSlide, { zIndex: 0, clipPath: directions.fromBottom.initial })
        gsap.set(toSlide, { zIndex: 1 })

        // Small breathing room before the section animation starts so the
        // reveal feels like it has settled.
        gsap.delayedCall(POST_REVEAL_PAUSE, () => {
          toSection?.playIn()
        })

        isAnimatingRef.current = false
      },
    })
  }

  // Wheel navigation
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let wheelLock = false
    const handleWheel = (e) => {
      if (isAnimatingRef.current || wheelLock) return
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
      if (isAnimatingRef.current) return
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
      if (isAnimatingRef.current) return
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
            style={{ willChange: 'clip-path' }}
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
    </div>
  )
}

export default AboutUs
