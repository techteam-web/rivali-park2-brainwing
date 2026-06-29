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
//
// Options:
// - `skipEntrance`: opt out of the entrance entirely (page renders visible),
//   while keeping exitTo()/exitWith() intact.
// - `play` (default true): defer the entrance until it flips true. The root is
//   still hidden synchronously on mount, so nothing flashes while you wait — used
//   by the towers detail, which holds its entrance until the WebGL scene's first
//   frame so the canvas-init stall can't make the animation stutter.
//
// exitWith(onDone) runs the same exit animation as exitTo but calls onDone on
// completion instead of navigating — for in-page view swaps (e.g. the towers
// landing↔detail handoff, which is a state change, not a route change).
export function usePageTransition({ containerRef, skipEntrance = false, play = true } = {}) {
  const navigate = useNavigate()
  const isExitingRef = useRef(false)

  useLayoutEffect(() => {
    const root = containerRef.current
    if (!root) return
    if (skipEntrance) return
    if (root.dataset.pageEntrancePlayed === '1') return
    gsap.set(root, {
      autoAlpha: 0,
      scale: 0.985,
      filter: 'blur(8px)',
      transformOrigin: '50% 50%',
    })
  }, [containerRef, skipEntrance])

  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    if (skipEntrance) {
      // No entrance to play; just mark it so exit gating stays consistent.
      root.dataset.pageEntrancePlayed = '1'
      isExitingRef.current = false
      return
    }
    if (!play) return
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
  }, [containerRef, skipEntrance, play])

  // Shared exit tween. onDone runs when it finishes (navigate, or an in-page
  // state swap). Guarded so a double-click can't fire two exits.
  const runExit = useCallback(
    (onDone) => {
      if (isExitingRef.current) return
      const root = containerRef.current
      if (!root) {
        onDone?.()
        return
      }
      isExitingRef.current = true
      root.dataset.pageEntrancePlayed = '1'

      const entranceTl = root._pageEntranceTl
      if (entranceTl) entranceTl.kill()

      if (prefersReducedMotion()) {
        onDone?.()
        return
      }

      gsap.to(root, {
        autoAlpha: 0,
        scale: 1.015,
        filter: 'blur(8px)',
        transformOrigin: '50% 50%',
        duration: 0.55,
        ease: 'power2.inOut',
        onComplete: onDone,
      })
    },
    [containerRef],
  )

  const exitTo = useCallback((path) => runExit(() => navigate(path)), [runExit, navigate])

  const exitWith = useCallback((onDone) => runExit(onDone), [runExit])

  return { exitTo, exitWith }
}
