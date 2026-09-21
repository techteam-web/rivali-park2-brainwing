import { useCallback, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

// Full-screen gate. The sales tool is presented on tablets and laptops where
// the browser chrome eats into the artboard and crops the hotspots along the
// top edge (16 Sep feedback: "icons not entirely visible"). Running in real
// fullscreen gives the pages the whole screen, so on load — and again every
// time the viewer leaves fullscreen — this sheet asks for a tap to go back in.
//
// The Fullscreen API only works from inside a user gesture, which is why this
// is a tap-anywhere sheet rather than something that happens by itself.
// iPhone Safari has no Fullscreen API at all; there the sheet shows once and
// the tap just dismisses it, so nobody is stuck behind it.

const fsElement = () =>
  document.fullscreenElement || document.webkitFullscreenElement || null

const canRequest = () => {
  const el = document.documentElement
  return Boolean(el.requestFullscreen || el.webkitRequestFullscreen)
}

// F11 / the macOS green button put the window in fullscreen without the API,
// and that already gives the pages the whole screen, so it counts too.
const isFullscreen = () =>
  Boolean(fsElement()) ||
  (typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: fullscreen)').matches)

const requestFullscreen = () => {
  const el = document.documentElement
  try {
    if (el.requestFullscreen) return el.requestFullscreen({ navigationUI: 'hide' })
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen()
  } catch {
    // Some engines throw synchronously instead of rejecting.
  }
  return Promise.resolve()
}

// Fixed for the life of the page, so it's read once rather than per render.
const SUPPORTED = typeof document !== 'undefined' && canRequest()

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Same logo ladder as the home page's EnterExperience sheet, so the brand sits
// at the same size on both. The height query keeps it clear of a landscape
// phone's short viewport.
const logoScale =
  'w-[175px] max-w-[62vw] md:w-[250px] lg:w-[290px] xl:w-[350px] 2xl:w-[400px] 3xl:w-[480px] 4xl:w-[620px] 5xl:w-[920px] [@media(max-height:560px)]:w-[130px]'

const iconScale =
  'w-7 h-7 lg:w-8 lg:h-8 2xl:w-9 2xl:h-9 3xl:w-11 3xl:h-11 4xl:w-14 4xl:h-14 5xl:w-20 5xl:h-20'

const ctaScale =
  'text-sm lg:text-base 2xl:text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-4xl'

const hintScale =
  'text-xs lg:text-sm 2xl:text-base 3xl:text-lg 4xl:text-xl 5xl:text-3xl'

const FullscreenGate = () => {
  const [open, setOpen] = useState(() => typeof document !== 'undefined' && !isFullscreen())
  // Where the API is missing the sheet is shown once per load, never again.
  const dismissed = useRef(false)

  const rootRef = useRef(null)
  const sheetRef = useRef(null)
  const logoRef = useRef(null)
  const contentRef = useRef(null)
  const iconRef = useRef(null)

  useEffect(() => {
    const sync = () => {
      if (!SUPPORTED && dismissed.current) return
      setOpen(!isFullscreen())
    }
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    // display-mode changes (F11) don't fire fullscreenchange.
    window.addEventListener('resize', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  // In: the sheet clears in, then the logo rises out of a soft blur and the copy
  // follows — the same entrance as the home page's welcome sheet. Out: a quick
  // fade, since the viewer is already looking at the fullscreen page behind.
  useGSAP(
    () => {
      const sheet = sheetRef.current
      if (!sheet) return
      const reduced = prefersReducedMotion()

      if (!open) {
        gsap.killTweensOf([sheet, logoRef.current, ...contentRef.current.children])
        if (reduced) gsap.set(sheet, { autoAlpha: 0 })
        else gsap.to(sheet, { autoAlpha: 0, duration: 0.45, ease: 'power2.inOut' })
        return
      }

      if (reduced) {
        gsap.set([sheet, logoRef.current, ...contentRef.current.children], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
        })
        return
      }

      gsap.set(sheet, { autoAlpha: 0 })
      gsap.set(logoRef.current, { autoAlpha: 0, y: 26, scale: 1.06, filter: 'blur(12px)' })
      gsap.set(contentRef.current.children, { autoAlpha: 0, y: 18 })

      gsap
        .timeline()
        .to(sheet, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' })
        .to(
          logoRef.current,
          { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'expo.out' },
          0.1,
        )
        .to(
          contentRef.current.children,
          { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.12 },
          0.45,
        )
    },
    { scope: rootRef, dependencies: [open] },
  )

  // The expand corners breathe outward while the sheet is up, hinting at the
  // action without a blinking prompt.
  useGSAP(
    () => {
      const icon = iconRef.current
      if (!icon || !open || prefersReducedMotion()) return
      const corners = icon.querySelectorAll('[data-corner]')
      const tween = gsap.to(corners, {
        x: (i) => (i % 2 ? 1.6 : -1.6),
        y: (i) => (i < 2 ? -1.6 : 1.6),
        duration: 1.1,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
      return () => tween.revert()
    },
    { scope: rootRef, dependencies: [open] },
  )

  const handleEnter = useCallback(() => {
    if (!SUPPORTED) {
      dismissed.current = true
      setOpen(false)
      return
    }
    // Hidden by the fullscreenchange listener once the browser confirms, so a
    // refused request (e.g. a permissions policy) leaves the sheet in place.
    Promise.resolve(requestFullscreen()).catch(() => {})
  }, [])

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleEnter()
    }
  }

  return (
    <div ref={rootRef}>
      <div
        ref={sheetRef}
        role="button"
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
        aria-label="Enter full screen"
        onClick={handleEnter}
        onKeyDown={handleKey}
        className={`invisible fixed inset-0 flex flex-col items-center justify-center bg-pastel-brown-bg px-6 select-none cursor-pointer focus:outline-none ${open ? '' : 'pointer-events-none'}`}
        style={{ zIndex: 100000 }}
      >
        <img
          ref={logoRef}
          src="/about/cci-logo-black.webp"
          alt="CCI Projects"
          className={`${logoScale} h-auto mb-10 lg:mb-12 xl:mb-14 2xl:mb-16 3xl:mb-20 4xl:mb-24 5xl:mb-36 [@media(max-height:560px)]:mb-6`}
          draggable={false}
        />

        <div ref={contentRef} className="flex flex-col items-center text-center">
          <svg
            ref={iconRef}
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`${iconScale} text-brand-brown mb-5 lg:mb-6 3xl:mb-8 4xl:mb-10 5xl:mb-14 [@media(max-height:560px)]:mb-3`}
          >
            <path data-corner d="M4 11V4h7" />
            <path data-corner d="M21 4h7v7" />
            <path data-corner d="M4 21v7h7" />
            <path data-corner d="M28 21v7h-7" />
          </svg>

          <p
            className={`${ctaScale} font-bold uppercase tracking-[0.14em] md:tracking-[0.25em] text-balance text-on-light-black border-b border-on-light-black/30 pb-3 lg:pb-4 3xl:pb-5 4xl:pb-7 5xl:pb-10`}
          >
            {SUPPORTED ? 'Tap anywhere to enter full screen' : 'Tap anywhere to continue'}
          </p>

          <p
            className={`${hintScale} text-on-light-grey mt-4 lg:mt-5 3xl:mt-7 4xl:mt-9 5xl:mt-14 max-w-[46ch] text-balance [@media(max-height:560px)]:mt-2`}
          >
            {SUPPORTED
              ? 'Rivali Park 2 is best experienced in full screen.'
              : 'For the best view, rotate your device to landscape.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FullscreenGate
