import { gsap } from './gsap'

// Polygon clip-paths used to wipe a slide in/out. FULL shows the entire
// slide; BOTTOM is collapsed against the bottom edge so nothing renders.
const POLYGON_FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
const POLYGON_BOTTOM = 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)'

// Mirrors the StorySlider transition (clipPath wipe + content y parallax,
// custom "hop" ease, 2.0s duration). Centralised so every gallery hotspot
// page shares the identical recipe — change it here, change it everywhere.
//
// Direction "next" wipes the incoming slide up over the outgoing one;
// "prev" collapses the outgoing slide down to reveal the incoming one
// already in place behind it. Both move the inner `.slide-content` y by
// 500px in opposite directions for a parallax feel.
export function runHotspotSlideTransition({
  fromSlide,
  toSlide,
  direction,
  duration = 2.0,
  onComplete,
}) {
  const fromContent = fromSlide?.querySelector('.slide-content')
  const toContent = toSlide?.querySelector('.slide-content')
  if (!fromSlide || !toSlide || !fromContent || !toContent) {
    onComplete?.()
    return null
  }

  if (direction === 'next') {
    gsap.set(toSlide, {
      autoAlpha: 1,
      zIndex: 2,
      pointerEvents: 'auto',
      clipPath: POLYGON_BOTTOM,
    })
    gsap.set(fromSlide, {
      autoAlpha: 1,
      zIndex: 1,
      clipPath: POLYGON_FULL,
    })
    gsap.set(toContent, { y: 500 })
    gsap.set(fromContent, { y: 0 })

    const tl = gsap.timeline({ onComplete })
    tl.to(toContent, { y: 0, duration, ease: 'hop' }, 0)
    tl.to(fromContent, { y: -500, duration, ease: 'hop' }, 0)
    tl.to(toSlide, { clipPath: POLYGON_FULL, duration, ease: 'hop' }, 0)
    return tl
  }

  // 'prev' — incoming slide sits behind the outgoing one and is revealed
  // as the outgoing slide's clip-path collapses to the bottom edge.
  gsap.set(toSlide, {
    autoAlpha: 1,
    zIndex: 1,
    pointerEvents: 'auto',
    clipPath: POLYGON_FULL,
  })
  gsap.set(fromSlide, {
    zIndex: 2,
    clipPath: POLYGON_FULL,
  })
  gsap.set(toContent, { y: -500 })
  gsap.set(fromContent, { y: 0 })

  const tl = gsap.timeline({ onComplete })
  tl.to(toContent, { y: 0, duration, ease: 'hop' }, 0)
  tl.to(fromContent, { y: 500, duration, ease: 'hop' }, 0)
  tl.to(fromSlide, { clipPath: POLYGON_BOTTOM, duration, ease: 'hop' }, 0)
  return tl
}

// Snap a slide back to its resting state after the transition completes —
// invisible, behind, content y reset, clip-path full so it can be reused
// as either the incoming or outgoing slide on the next navigation.
export function resetHotspotSlide(slide) {
  if (!slide) return
  const content = slide.querySelector('.slide-content')
  gsap.set(slide, {
    autoAlpha: 0,
    zIndex: 0,
    pointerEvents: 'none',
    clipPath: POLYGON_FULL,
  })
  if (content) gsap.set(content, { y: 0 })
}

export { POLYGON_FULL, POLYGON_BOTTOM }
