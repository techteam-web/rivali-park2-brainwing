import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Fullscreen plan viewer, opened from the expand icon on any unit plan. The
// raggedy edge IS the thin white header (no solid bar, per Figma): the title
// "{TOWER} UNIT PLAN" and close-cross sit on its solid top band, and the tear
// fades the white into the tower-coloured plan area, where the self-contained
// sheet (title/carpet/balcony/compass/disclaimer baked in) is shown in full.
// `bg` matches the sheet's own background so the contained image blends
// edge-to-edge with no letterbox seam.
//
// Rendered outside the scaled <UnitArtboard> so it covers the real viewport. It
// rises forward out of a soft blur on open and eases back on close (matching
// the gallery transition feel) — the close button animates out before unmount.
const PlanLightbox = ({ src, alt = 'Floor plan', title, bg = '#9C6A7B', onClose }) => {
  const rootRef = useRef(null)
  const closingRef = useRef(false)

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el || prefersReducedMotion()) return
    gsap.set(el, { autoAlpha: 0, scale: 0.985, filter: 'blur(10px)' })
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el || prefersReducedMotion()) return
    const tl = gsap.timeline()
    tl.to(el, {
      autoAlpha: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.85,
      ease: 'power2.out',
    })
    return () => tl.kill()
  }, [])

  const handleClose = useCallback(() => {
    if (closingRef.current) return
    const el = rootRef.current
    if (!el || prefersReducedMotion()) {
      onClose()
      return
    }
    closingRef.current = true
    gsap.to(el, {
      autoAlpha: 0,
      scale: 1.015,
      filter: 'blur(10px)',
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: onClose,
    })
  }, [onClose])

  return (
  <div
    ref={rootRef}
    className="fixed inset-0 z-50 overflow-hidden"
    style={{ backgroundColor: bg }}
  >
    {/* Self-contained plan sheet, pushed below the torn edge so the tear grazes
        only its blank top margin (in vw to track the tear height). */}
    <img src={src} alt={alt} className="h-full w-full object-contain pt-[7vw]" />

    {/* Torn white edge = the header. Per Figma the vector is ~225% wide and flat
        (h ≈ 7.8% of its width); stretched + centred it stays responsive, and
        with no solid bar above it the white reads as a thin torn strip. */}
    <img
      src="/unit plan/svgs/raggedy edge svg.svg"
      alt=""
      className="pointer-events-none absolute left-1/2 top-0 h-[7.8vw] w-[225%] max-w-none -translate-x-1/2 select-none"
    />

    {/* Title + close overlaid on the raggedy's solid top band. The vw-height
        wrapper centres the title within that white strip (Figma: Poppins-500,
        24px, 0.12em; 32px close 48px from the right). */}
    <header className="pointer-events-none absolute inset-x-0 top-0 flex h-[5.5vw] items-center justify-center px-12">
      <h2
        className="uppercase"
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 500,
          fontSize: 24,
          lineHeight: '120%',
          letterSpacing: '0.12em',
          color: '#313131',
        }}
      >
        {title}
      </h2>
      <button
        type="button"
        aria-label="Close"
        onClick={handleClose}
        className="pointer-events-auto absolute right-12 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center transition-[opacity,transform] hover:opacity-60 active:scale-90"
      >
        {/* 18px glyph (Figma: 16px X, 1.8px stroke) inside a 32px hit area —
            rendered at its natural size so the stroke stays crisp. */}
        <img src="/unit/svgs/close cross.svg" alt="" className="h-4.5 w-4.5" />
      </button>
    </header>
  </div>
  )
}

export default PlanLightbox
