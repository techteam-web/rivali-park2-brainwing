import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from '../lib/gsap'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Container-level fade choreography for the hotspot detail pages
// (Wellness / Sky / Social / Central / Convention). The gallery sub-pages
// exit via useGalleryTransition.exitTo, which fades them out to reveal
// the Layout's section-tinted veil (see galleryTintFor in Layout.jsx).
// This hook plays the symmetric entrance — the hotspot page rises out of
// the same veil with a slight scale + blur — and an analogous exit on
// the back button so leaving the hotspot doesn't snap. The pair makes
// cross-page transitions feel like one continuous, dimensional handoff
// instead of two separate fades meeting at a flat color.
//
// StrictMode hardening mirrors useGalleryTransition: a dataset flag on
// the root DOM node gates the entrance so the dev-mode double-invocation
// of effects can't replay it. The flag is set synchronously at the start
// of exitTo too, so any pending entrance can't race against the exit.
export function useGalleryHotspotTransition({ containerRef }) {
  const navigate = useNavigate()
  const isExitingRef = useRef(false)

  useLayoutEffect(() => {
    const root = containerRef.current
    if (!root) return
    if (root.dataset.hotspotEntrancePlayed === '1') return
    // Pre-state for the cinematic entrance: hidden, slightly receded, and
    // softly blurred, so the scene rises forward out of the section veil
    // instead of flat-fading in.
    gsap.set(root, {
      autoAlpha: 0,
      scale: 0.96,
      filter: 'blur(10px)',
      transformOrigin: '50% 50%',
    })
  }, [containerRef])

  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    if (root.dataset.hotspotEntrancePlayed === '1') return
    root.dataset.hotspotEntrancePlayed = '1'
    isExitingRef.current = false

    if (prefersReducedMotion()) {
      gsap.set(root, { autoAlpha: 1, scale: 1, filter: 'blur(0px)' })
      return
    }

    const tl = gsap.timeline()
    root._hotspotEntranceTl = tl
    tl.to(root, {
      autoAlpha: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 1.1,
      ease: 'power2.out',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exitTo = useCallback(
    (path) => {
      if (isExitingRef.current) return
      const root = containerRef.current
      if (!root) {
        navigate(path)
        return
      }
      isExitingRef.current = true
      root.dataset.hotspotEntrancePlayed = '1'

      const entranceTl = root._hotspotEntranceTl
      if (entranceTl) entranceTl.kill()

      if (prefersReducedMotion()) {
        navigate(path)
        return
      }

      // Symmetric exit: page eases back into the section veil with the
      // same scale + blur shape, slightly faster than the entrance so the
      // handoff feels decisive rather than ponderous.
      gsap.to(root, {
        autoAlpha: 0,
        scale: 1.04,
        filter: 'blur(10px)',
        transformOrigin: '50% 50%',
        duration: 0.9,
        ease: 'power2.inOut',
        onComplete: () => navigate(path),
      })
    },
    [navigate, containerRef],
  )

  return { exitTo }
}
