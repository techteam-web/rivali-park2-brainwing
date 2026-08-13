import { useCallback, useRef } from 'react'
import { gsap } from '../lib/gsap'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const DRAW_SEL =
  'path:not([data-no-undraw]),line:not([data-no-undraw]),polyline:not([data-no-undraw]),polygon:not([data-no-undraw]),circle:not([data-no-undraw]),ellipse:not([data-no-undraw]),rect:not([data-no-undraw])'

const collectUndrawPaths = (wrapper) => {
  const containers = wrapper.querySelectorAll('[data-undraw]')
  const out = []
  containers.forEach((c) => c.querySelectorAll(DRAW_SEL).forEach((p) => out.push(p)))
  return out
}

const collectFadeEls = (wrapper) => Array.from(wrapper.querySelectorAll('[data-fade-out]'))

// Sub-heading SVGs (cursive scripts) reverse their reveal clip-path on exit:
// 'inset(0 0% 0 0)' → 'inset(0 100% 0 0)'. The recorded from-value of each
// slide's intro tween for that property is exactly 'inset(0 100% 0 0)', so
// pause(0) on re-visit is consistent with the exit's end state.
const collectClipReverseEls = (wrapper) =>
  Array.from(wrapper.querySelectorAll('[data-clip-reverse]'))

// Master controller for About-page slide transitions. Replaces the old
// drop-curtain hook with a fade + un-draw + clip-reverse exit, an overlapping
// bg crossfade, a small breathing pause, and the incoming slide's normal
// forward intros re-triggered fresh. Backward navigation runs the identical
// choreography.
export function useSlideTransition({
  totalSlides,
  slideRefs,
  sectionRefs,
  headerRef,
  onSwap,
  initialIndex = 0,
  wrap = true,
  // Scrolling past the LAST slide with wrap off. About Us uses this to leave
  // the page entirely (back to Home) instead of dead-ending on the final slide.
  onPastEnd,
}) {
  const currentIndexRef = useRef(initialIndex)
  const isTransitioningRef = useRef(false)
  const wheelLockRef = useRef(false)
  const initDoneRef = useRef(false)

  const isAnimating = useCallback(() => isTransitioningRef.current, [])

  const initWrappers = useCallback(() => {
    if (initDoneRef.current) return
    const wrappers = slideRefs.current || []
    wrappers.forEach((slide, index) => {
      if (!slide) return
      const isFirst = index === initialIndex
      gsap.set(slide, {
        y: 0,
        opacity: isFirst ? 1 : 0,
        zIndex: isFirst ? 1 : 0,
        pointerEvents: isFirst ? 'auto' : 'none',
      })
      slide.setAttribute('aria-hidden', isFirst ? 'false' : 'true')
    })
    if (headerRef?.current) {
      gsap.set(headerRef.current, { autoAlpha: 1 })
    }
    sectionRefs.current?.[initialIndex]?.playIn()
    initDoneRef.current = true
  }, [slideRefs, sectionRefs, headerRef, initialIndex])

  const runTransition = useCallback(
    (fromIdx, toIdx) => {
      const fromWrapper = slideRefs.current?.[fromIdx]
      const toWrapper = slideRefs.current?.[toIdx]
      const fromSection = sectionRefs.current?.[fromIdx]
      const toSection = sectionRefs.current?.[toIdx]
      if (!fromWrapper || !toWrapper) return

      isTransitioningRef.current = true

      // Freeze the outgoing slide's intro timeline in place if it's still
      // running. Pausing (rather than killing) preserves the tween references
      // so pause(0) on the next re-visit can rewind them. Killing would
      // permanently remove tweens from the timeline and break replay — that's
      // what caused "animations break on rapid forward/back".
      fromSection?.stop?.()

      const fadeEls = collectFadeEls(fromWrapper)
      const undrawPaths = collectUndrawPaths(fromWrapper)
      const clipReverseEls = collectClipReverseEls(fromWrapper)

      const cleanup = () => {
        fromWrapper.setAttribute('aria-hidden', 'true')
        // opacity must be 0 (not 1). Exited slides sit at zIndex:0 below the
        // active slide; if their wrapper stays opaque, any of their children
        // not animated by exit (e.g. Journey's dots, which carry data-no-undraw
        // and no data-fade-out) bleed through translucent crossfades on later
        // transitions.
        gsap.set(fromWrapper, {
          opacity: 0,
          zIndex: 0,
          pointerEvents: 'none',
        })
        currentIndexRef.current = toIdx
        isTransitioningRef.current = false
      }

      // Helper: stage the incoming slide. Re-snap is intentionally BEFORE
      // toSection.prepare(). Reasoning:
      //   - Hero (rebuild pattern): prepare() re-runs every gsap.set in
      //     buildAndPlay, AUTHORITATIVELY overriding the re-snap with the
      //     correct pre-intro state (heading→0, body→0, crane→0, etc.).
      //     If re-snap ran AFTER prepare, it would force heading to 1 right
      //     before the intro plays — exactly the "heading visible → vanishes
      //     → animates" flicker.
      //   - Slides 1-3 (paused-timeline pattern): prepare() = tl.pause(0)
      //     rewinds tweened properties to their from-values. For elements
      //     in the timeline's autoAlpha tween (heading), the rewind takes
      //     them back to 0 even after re-snap set them to 1. For elements
      //     NOT in any autoAlpha tween (cursive, cards), the rewind doesn't
      //     touch autoAlpha, and the re-snap's autoAlpha:1 sticks — which
      //     is what those elements need (their Tailwind `invisible` class
      //     would otherwise leave them hidden after the previous exit).
      const stageIncoming = () => {
        const inFadeEls = collectFadeEls(toWrapper)
        if (inFadeEls.length) gsap.set(inFadeEls, { autoAlpha: 1 })
        toSection?.prepare()
        const inUndrawPaths = collectUndrawPaths(toWrapper)
        if (inUndrawPaths.length) gsap.set(inUndrawPaths, { drawSVG: 0 })
        gsap.set(toWrapper, { opacity: 0, zIndex: 1, pointerEvents: 'auto' })
        toWrapper.setAttribute('aria-hidden', 'false')
      }

      if (prefersReducedMotion()) {
        stageIncoming()
        gsap.set(fromWrapper, { opacity: 0, zIndex: 0, pointerEvents: 'none' })
        gsap.set(toWrapper, { opacity: 1, zIndex: 1, pointerEvents: 'auto' })
        onSwap?.(toIdx)
        toSection?.playIn()
        cleanup()
        return
      }

      const tl = gsap.timeline({ onComplete: cleanup })

      // EXIT — un-draw + clip-reverse run faster (0.5s) than fade (1.0s),
      // so SVG paths visibly retract and cursive sub-headings un-clip BEFORE
      // the bulk of the fade dominates. All complete within the 1.0s exit
      // window so crossfade (which starts at t=0.45) doesn't fight them.
      if (undrawPaths.length) {
        tl.to(
          undrawPaths,
          {
            drawSVG: 0,
            duration: 0.5,
            stagger: 0.005,
            ease: 'power2.inOut',
          },
          0,
        )
      }
      if (clipReverseEls.length) {
        tl.to(
          clipReverseEls,
          {
            clipPath: 'inset(0 100% 0 0)',
            duration: 0.5,
            ease: 'power2.inOut',
          },
          0,
        )
      }
      if (fadeEls.length) {
        tl.to(
          fadeEls,
          {
            autoAlpha: 0,
            duration: 1.0,
            stagger: 0.015,
            ease: 'power2.inOut',
          },
          0,
        )
      }
      // CROSSFADE — overlaps exit tail, starts at t=0.45, ends at t=1.35
      tl.addLabel('crossfade', 0.45)
      tl.call(stageIncoming, [], 'crossfade')

      tl.to(
        fromWrapper,
        { opacity: 0, duration: 0.9, ease: 'power2.inOut' },
        'crossfade',
      )
      tl.to(
        toWrapper,
        { opacity: 1, duration: 0.9, ease: 'power2.inOut' },
        'crossfade',
      )

      // INTRO — absolute t=1.50 (0.15s breathing pause after crossfade ends)
      tl.addLabel('intro', 1.5)
      tl.call(
        () => {
          onSwap?.(toIdx)
          toSection?.playIn()
        },
        [],
        'intro',
      )
    },
    [slideRefs, sectionRefs, onSwap],
  )

  const goTo = useCallback(
    (targetIndex) => {
      if (isTransitioningRef.current) return
      let toIdx = targetIndex
      if (wrap) {
        if (toIdx < 0) toIdx = totalSlides - 1
        if (toIdx >= totalSlides) toIdx = 0
      } else {
        // Past the end with a handler attached: hand off (e.g. exit to Home)
        // and lock further input so a second scroll can't fire it twice while
        // the page transition plays.
        if (toIdx >= totalSlides && onPastEnd) {
          isTransitioningRef.current = true
          onPastEnd()
          return
        }
        if (toIdx < 0 || toIdx >= totalSlides) return
      }
      const fromIdx = currentIndexRef.current
      if (toIdx === fromIdx) return
      runTransition(fromIdx, toIdx)
    },
    [runTransition, totalSlides, wrap, onPastEnd],
  )

  const goToNext = useCallback(() => goTo(currentIndexRef.current + 1), [goTo])
  const goToPrev = useCallback(() => goTo(currentIndexRef.current - 1), [goTo])

  const attachTriggers = useCallback(
    (containerRef) => {
      initWrappers()
      const container = containerRef?.current
      if (!container) return () => {}

      const handleWheel = (e) => {
        if (isTransitioningRef.current || wheelLockRef.current) return
        wheelLockRef.current = true
        setTimeout(() => {
          wheelLockRef.current = false
        }, 100)
        if (e.deltaY > 0) goToNext()
        else if (e.deltaY < 0) goToPrev()
      }

      let touchStartY = 0
      const handleTouchStart = (e) => {
        touchStartY = e.touches[0].clientY
      }
      const handleTouchEnd = (e) => {
        if (isTransitioningRef.current) return
        const touchEndY = e.changedTouches[0].clientY
        const diff = touchStartY - touchEndY
        if (Math.abs(diff) > 50) {
          if (diff > 0) goToNext()
          else goToPrev()
        }
      }

      const handleKey = (e) => {
        if (isTransitioningRef.current) return
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
          goToNext()
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
          goToPrev()
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
    },
    [initWrappers, goToNext, goToPrev],
  )

  return { isAnimating, attachTriggers, goTo, goToNext, goToPrev }
}
