import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

const textScale =
  'text-sm lg:text-base 2xl:text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-4xl'

const welcomeScale =
  'text-[22px] lg:text-[24px] xl:text-[32px] 2xl:text-[38px] 3xl:text-[46px] 4xl:text-[62px] 5xl:text-[92px]'

// The logo leads this screen, so it's sized generously and climbs with the
// project's own breakpoints (md/lg/xl/2xl/3xl/4xl/5xl — this theme defines no
// `sm`, and using one compiles to an unconditional rule that outranks all the
// others). `max-w` keeps it clear of the edges on narrow phones, and the height
// query stops it swallowing a landscape phone's viewport.
const logoScale =
  'w-[175px] max-w-[62vw] md:w-[250px] lg:w-[290px] xl:w-[350px] 2xl:w-[400px] 3xl:w-[480px] 4xl:w-[620px] 5xl:w-[920px] [@media(max-height:560px)]:w-[150px]'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const EnterExperience = ({ isVideoReady, visitorName, onEnter, onExit }) => {
  const containerRef = useRef(null)
  const overlayRef = useRef(null)
  const logoRef = useRef(null)
  const contentRef = useRef(null)

  // The logo settles in on its own, before the video is ready — so the brand
  // greets you rather than a bare "Loading…". It rises out of a soft blur and
  // eases down from a slight over-scale; expo.out gives the long unhurried tail
  // that reads as composed rather than bouncy.
  useGSAP(
    () => {
      const logo = logoRef.current
      if (!logo) return
      if (prefersReducedMotion()) {
        gsap.set(logo, { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)' })
        return
      }
      gsap.set(logo, { autoAlpha: 0, y: 26, scale: 1.06, filter: 'blur(12px)' })
      gsap.to(logo, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.6,
        ease: 'expo.out',
        delay: 0.15,
      })
    },
    { scope: containerRef },
  )

  // Whatever sits under the logo — "Loading…" first, then the greeting and the
  // button — fades up as it swaps in, so the change of state never snaps.
  useGSAP(
    () => {
      const el = contentRef.current
      if (!el || !el.children.length) return
      if (prefersReducedMotion()) {
        gsap.set(el.children, { autoAlpha: 1, y: 0 })
        return
      }
      gsap.fromTo(
        el.children,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.12,
          // Let the logo lead on first paint; once the video is ready the
          // greeting should follow the state change promptly.
          delay: isVideoReady ? 0.1 : 0.55,
        },
      )
    },
    { scope: containerRef, dependencies: [isVideoReady] },
  )

  // Leaving mirrors the entrance: the copy lifts away first, the logo drifts
  // forward out of focus, and the sheet clears last.
  //
  // Deliberately a plain handler rather than contextSafe(): the tweens are
  // created on click, and the overlay unmounts the moment they finish (onExit),
  // so there is no later render for the GSAP context to clean up after.
  const handleClick = () => {
    onEnter()
    if (prefersReducedMotion()) {
      gsap.set(overlayRef.current, { autoAlpha: 0 })
      onExit()
      return
    }
    const tl = gsap.timeline({ onComplete: onExit })
    tl.to(
      contentRef.current,
      { autoAlpha: 0, y: -14, duration: 0.45, ease: 'power2.in' },
      0,
    )
      .to(
        logoRef.current,
        {
          autoAlpha: 0,
          scale: 1.08,
          filter: 'blur(10px)',
          duration: 0.8,
          ease: 'power2.inOut',
        },
        0.08,
      )
      .to(
        overlayRef.current,
        { autoAlpha: 0, duration: 0.55, ease: 'power2.inOut' },
        0.3,
      )
  }

  const trimmedName = (visitorName || '').trim()
  const firstName = trimmedName ? trimmedName.split(/\s+/)[0] : ''

  return (
    <div ref={containerRef}>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-pastel-brown-bg px-6"
      >
        <img
          ref={logoRef}
          src="/about/cci-logo.webp"
          alt="CCI Projects"
          className={`${logoScale} h-auto select-none mb-8 lg:mb-10 xl:mb-11 2xl:mb-12 3xl:mb-16 4xl:mb-20 5xl:mb-28 [@media(max-height:560px)]:mb-5`}
          draggable={false}
        />

        <div ref={contentRef} className="flex flex-col items-center">
          {isVideoReady ? (
            <>
              {firstName && (
                <p
                  className={`${welcomeScale} font-normal tracking-[-0.5px] text-on-light-black text-center mb-6 lg:mb-7 xl:mb-9 2xl:mb-11 3xl:mb-14 4xl:mb-20 5xl:mb-28`}
                >
                  Welcome,{' '}
                  <span className="text-brand-brown">{firstName}</span>
                </p>
              )}
              <button
                type="button"
                onClick={handleClick}
                className={`${textScale} font-sans font-bold text-on-light-black uppercase tracking-[0.25em] border-b border-on-light-black/30 hover:border-on-light-black px-8 py-4 lg:px-10 lg:py-5 3xl:px-14 3xl:py-7 4xl:px-20 4xl:py-10 5xl:px-32 5xl:py-16 transition-colors`}
              >
                {firstName ? 'Click to Enter' : 'Enter'}
              </button>
            </>
          ) : (
            <span
              className={`${textScale} font-sans text-on-light-grey uppercase tracking-[0.2em] animate-pulse`}
            >
              Loading…
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnterExperience
