import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap, inlineSvgsReady } from '../lib/gsap'

const DRAW_SEL =
  'path:not([data-no-draw]):not([data-no-undraw]),' +
  'line:not([data-no-draw]):not([data-no-undraw]),' +
  'polyline:not([data-no-draw]):not([data-no-undraw]),' +
  'polygon:not([data-no-draw]):not([data-no-undraw]),' +
  'circle:not([data-no-draw]):not([data-no-undraw]),' +
  'ellipse:not([data-no-draw]):not([data-no-undraw]),' +
  'rect:not([data-no-draw]):not([data-no-undraw])'

const collectDrawables = (scope) => {
  if (!scope) return []
  const wrappers = scope.querySelectorAll('[data-draw]')
  const out = []
  wrappers.forEach((w) => {
    w.querySelectorAll(DRAW_SEL).forEach((p) => out.push(p))
  })
  return out
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Page-level entrance + exit choreography for gallery pages.
//
// Entrance: opacity-only fade for the background image, draw-in for any
// SVGs inside [data-draw] containers, slide-up for the page title, and
// plain fades for [data-card-label] elements and the back button. We
// deliberately avoid GSAP transforms on `data-card-label` and the back
// button because those nodes (e.g. the gallery tower pills) rely on
// Tailwind translate-x/y classes for positioning — an inline GSAP
// transform would override them and shift things out of place.
//
// Exit (exitTo): undraw is fast (0.5s) and the page fade (0.6s) starts
// 0.4s in, so undraw completes before the fade ends — same shape as the
// About-page exit. Navigation runs from the timeline's onComplete.
//
// StrictMode hardening: the entrance is gated by a data-attribute flag
// on the root DOM node, so the dev-mode double-invocation of effects
// can't run the animation twice (the visible "fade in → snap back to
// hidden → fade in again" glitch). Real navigation destroys the DOM,
// so the flag never persists across genuine route changes.
export function useGalleryTransition({ containerRef, entranceDeps = [] }) {
  const navigate = useNavigate()
  const isExitingRef = useRef(false)

  // Hide the page synchronously before paint so users never see fully
  // drawn SVGs flash before the entrance applies drawSVG:0. Skipping
  // this work on a strict re-mount (when the entrance has already
  // played) avoids re-hiding an animation that's already visible.
  useLayoutEffect(() => {
    const root = containerRef.current
    if (!root) return
    if (root.dataset.galleryEntrancePlayed === '1') return
    gsap.set(root, { autoAlpha: 0 })
  }, [containerRef])

  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    if (root.dataset.galleryEntrancePlayed === '1') return

    let cancelled = false
    isExitingRef.current = false

    inlineSvgsReady(root).then(() => {
      if (cancelled) return
      if (root.dataset.galleryEntrancePlayed === '1') return
      root.dataset.galleryEntrancePlayed = '1'

      const drawables = collectDrawables(root)
      if (drawables.length) gsap.set(drawables, { drawSVG: 0 })

      // Each card SVG has a colored circular fill behind its strokes.
      // drawSVG only affects strokes, so without this the fill would
      // show fully visible from t=0 — looking like a beige disc that
      // strokes pop into. We scale + fade the whole card-SVG wrapper
      // so the disc itself eases in, then the strokes draw inside it.
      const cardSvgs = root.querySelectorAll('[data-card-name] [data-draw]')
      if (cardSvgs.length) {
        gsap.set(cardSvgs, {
          autoAlpha: 0,
          scale: 0.55,
          transformOrigin: '50% 50%',
        })
      }

      const bgImg = root.querySelector('[data-bg-image]')
      // Subtle "emerge from haze" reveal: starts hidden + softly blurred
      // and clears to crisp alongside the SVG draw, so the page settles
      // as one cohesive scene instead of the bg snapping in first.
      if (bgImg) gsap.set(bgImg, { autoAlpha: 0, filter: 'blur(8px)' })

      const title = root.querySelector('[data-page-title]')
      if (title) gsap.set(title, { autoAlpha: 0, y: 24 })

      const labels = root.querySelectorAll('[data-card-label]')
      if (labels.length) gsap.set(labels, { autoAlpha: 0 })

      const backBtn = root.querySelector('[data-back-btn]')
      if (backBtn) gsap.set(backBtn, { autoAlpha: 0 })

      gsap.set(root, { autoAlpha: 1 })

      if (prefersReducedMotion()) {
        if (drawables.length) gsap.set(drawables, { drawSVG: '0% 100%' })
        if (bgImg) gsap.set(bgImg, { autoAlpha: 1, filter: 'blur(0px)' })
        if (title) gsap.set(title, { autoAlpha: 1, y: 0 })
        if (labels.length) gsap.set(labels, { autoAlpha: 1 })
        if (backBtn) gsap.set(backBtn, { autoAlpha: 1 })
        if (cardSvgs.length) gsap.set(cardSvgs, { autoAlpha: 1, scale: 1 })
        return
      }

      const tl = gsap.timeline()
      // Stash the timeline on the DOM so exitTo can find and kill it
      // even after a strict re-mount (refs reset across the cycle, but
      // the DOM element persists).
      root._galleryEntranceTl = tl

      if (bgImg) {
        tl.to(
          bgImg,
          {
            autoAlpha: 1,
            filter: 'blur(0px)',
            duration: 1.8,
            ease: 'power2.out',
          },
          0,
        )
      }
      if (cardSvgs.length) {
        tl.to(
          cardSvgs,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: 0.035,
          },
          0,
        )
      }
      if (drawables.length) {
        // Start the stroke draw a hair after the card discs begin
        // settling in, so the strokes appear to ink onto the now-visible
        // background rather than racing it.
        tl.to(
          drawables,
          {
            drawSVG: '0% 100%',
            duration: 1.7,
            ease: 'power2.inOut',
            stagger: { each: 0.012, from: 'random' },
          },
          cardSvgs.length ? 0.4 : 0.15,
        )
      }
      if (title) {
        tl.to(
          title,
          { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          0.5,
        )
      }
      if (labels.length) {
        tl.to(
          labels,
          {
            autoAlpha: 1,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.04,
          },
          0.6,
        )
      }
      if (backBtn) {
        tl.to(
          backBtn,
          { autoAlpha: 1, duration: 0.5, ease: 'power2.out' },
          0.3,
        )
      }
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, entranceDeps)

  const exitTo = useCallback(
    (path) => {
      if (isExitingRef.current) return
      const root = containerRef.current
      if (!root) {
        navigate(path)
        return
      }
      isExitingRef.current = true
      // Mark played so any inlineSvgsReady().then() that's still pending
      // (e.g. user clicked a card before the entrance even started)
      // can't trigger a new entrance under us.
      root.dataset.galleryEntrancePlayed = '1'

      // Stop entrance so undraw isn't fighting an in-flight drawSVG tween.
      const entranceTl = root._galleryEntranceTl
      if (entranceTl) entranceTl.kill()

      const drawables = collectDrawables(root)

      if (prefersReducedMotion()) {
        navigate(path)
        return
      }

      // Stop any infinite hover loops mid-flight; their elements are part
      // of the drawables we're about to undraw.
      gsap.killTweensOf(root.querySelectorAll('[data-hover-anim]'))

      const tl = gsap.timeline({
        onComplete: () => navigate(path),
      })

      if (drawables.length) {
        tl.to(
          drawables,
          {
            drawSVG: 0,
            duration: 0.5,
            ease: 'power2.inOut',
            stagger: 0.004,
          },
          0,
        )
      }
      tl.to(
        root,
        { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' },
        0.4,
      )
    },
    [navigate, containerRef],
  )

  return { exitTo }
}
