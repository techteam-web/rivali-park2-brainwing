import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from '../lib/gsap'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Reusable page transition for the unit-plan flow, mirroring the gallery
// hotspot choreography (scale + blur + fade) so every screen change in the app
// feels like one continuous, dimensional handoff. The page rises forward out of
// a soft blur on entry and eases back into it on exit before navigating.
//
// StrictMode hardening matches the gallery hooks: a dataset flag on the root DOM
// node gates the entrance so the dev double-invocation can't replay it, and it's
// set at the start of exitTo so a pending entrance can't race the exit.
//
// Use exitTo() only for navigations to a DIFFERENT route component (so the new
// page mounts and plays its own entrance). For same-route param changes (e.g.
// switching unit within the detail page) animate the content directly instead —
// exitTo would fade the persistent node out and leave it hidden.
export function usePageTransition({ containerRef } = {}) {
  const navigate = useNavigate()
  const isExitingRef = useRef(false)

  useLayoutEffect(() => {
    const root = containerRef.current
    if (!root) return
    if (root.dataset.pageEntrancePlayed === '1') return
    gsap.set(root, {
      autoAlpha: 0,
      scale: 0.985,
      filter: 'blur(8px)',
      transformOrigin: '50% 50%',
    })
  }, [containerRef])

  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    if (root.dataset.pageEntrancePlayed === '1') return
    root.dataset.pageEntrancePlayed = '1'
    isExitingRef.current = false

    if (prefersReducedMotion()) {
      gsap.set(root, { autoAlpha: 1, scale: 1, filter: 'blur(0px)' })
      return
    }

    const tl = gsap.timeline()
    root._pageEntranceTl = tl
    tl.to(root, {
      autoAlpha: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.9,
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
      root.dataset.pageEntrancePlayed = '1'

      const entranceTl = root._pageEntranceTl
      if (entranceTl) entranceTl.kill()

      if (prefersReducedMotion()) {
        navigate(path)
        return
      }

      gsap.to(root, {
        autoAlpha: 0,
        scale: 1.015,
        filter: 'blur(8px)',
        transformOrigin: '50% 50%',
        duration: 0.55,
        ease: 'power2.inOut',
        onComplete: () => navigate(path),
      })
    },
    [navigate, containerRef],
  )

  return { exitTo }
}
