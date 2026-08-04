import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, aboutReveal } from '../../lib/gsap'
import InlineSVG from './InlineSVG'
import BuildingsSvg from './BuildingsSvg'

const masters = [
  {
    name: 'Hafeez Contractor',
    role: 'Master Design & Architecture',
    image: '/about/master-hafeez.webp',
    className: "object-[50%_0%] origin-center translate-y-[5%] scale-130",
    modalClassName: 'object-[50%_0%] scale-110',
    accentColor: '#B08D66',
    bio: 'Padma Bhushan awardee Hafeez Contractor leads South Asia’s largest architecture firm, with 750+ designers and over a billion sq. ft. of work across 100+ cities in 7 countries. Known for icons like 23 Marina and DLF Cyber City, he’s won 150+ global awards and was profiled by The New York Times.',
    quote:
      'At the heart of Rivali Park 2 is the stepped podium… Inspired by natural landforms, it brings a sense of flow, creating a vibrant, multi-level landscape where everyday moments turn into shared experiences.',
  },
  {
    name: 'Landscape Architects 49',
    role: 'Landscape',
    image: '/about/master-predapond.webp',
    className: "object-[50%_0%] origin-top -translate-y-[5%] scale-135",
    // Full-body source — zoom in from the top so the modal column frames the
    // head + upper torso (small headroom, cropped around the mid-chest).
    modalClassName: 'object-[50%_0%] origin-top scale-[1.6]',
    accentColor: '#557E92',
    bio: 'Founded in 1989, Landscape Architects 49 Limited (L49) is a leading consultancy specializing in landscape architecture, urban design, and site planning. With a team of skilled professionals and roots in Architects 49 Limited, the firm brings thoughtful, workable solutions to a wide range of urban and environmental projects.',
    quote:
      'We envisioned Rivali Park 2 as an urban sanctuary—where nature and modern design coexist seamlessly, creating layered landscapes that offer both connection and calm for residents of all ages.',
  },
  {
    name: 'August Design Consultant',
    role: 'Amenities & Common Areas',
    image: '/about/master-augustdesign.webp',
    className: "object-[10%_0%] origin-top -translate-y-[3%] scale-135",
    // Landscape source with the subject left of centre (a painting fills the
    // right). Recentre horizontally on his face and zoom from the top so the
    // column frames head → mid-chest without the painting creeping in.
    modalClassName: 'object-[28%_0%] origin-top scale-[1.18]',
    accentColor: '#6E8664',
    bio: 'August Design Consultant is a Bangkok-based interior design studio with 30+ years of experience in hospitality and residential spaces. Known for refined creativity and cultural sensitivity, they craft timeless, purpose-driven interiors. Their concept-led, detail-focused approach delivers bespoke environments that elevate everyday living.',
    quote:
      'Our goal was simple—to create a place that supports life in all its moments, where comfort meets beauty, and nature is never far away.',
  },
]

const MasterCard = ({ name, role, image, className = '', onOpen }) => (
  <article
    data-master-card
    data-fade-out="decor"
    role="button"
    tabIndex={0}
    aria-label={`View details for ${name}`}
    onClick={onOpen}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onOpen()
      }
    }}
    className="card-shine invisible w-full bg-white border border-on-light-stroke overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B08D66]"
  >
    <div className="aspect-square w-full overflow-hidden">
      <img
        src={image}
        alt={name}
        loading="eager"
        decoding="async"
        className={`w-full h-full object-cover ${className}`}
      />
    </div>
    <div className="px-3 pt-4 pb-2 lg:px-2 lg:pt-3 lg:pb-1 xl:px-3 xl:pt-4 xl:pb-2 2xl:px-4 2xl:pt-5 2xl:pb-3 3xl:px-5 3xl:pt-6 3xl:pb-4 4xl:px-7 4xl:pt-8 4xl:pb-5 5xl:px-10 5xl:pt-12 5xl:pb-7 bg-pastel-brown-bg border-t border-on-light-stroke">
      <p
        data-card-title
        className="font-medium text-[13px] lg:text-[11px] xl:text-[15px] 2xl:text-[18px] 3xl:text-[20px] 4xl:text-[28px] 5xl:text-[40px] tracking-[1.4px] lg:tracking-[1.2px] xl:tracking-[1.4px] 2xl:tracking-[1.6px] 3xl:tracking-[1.8px] 4xl:tracking-[2.2px] 5xl:tracking-[3px] uppercase text-center text-on-light-black mb-2 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3 4xl:mb-4 5xl:mb-6"
      >
        {name}
      </p>
      <p
        data-card-subtitle
        className="text-[12.5px] lg:text-[10px] xl:text-[14px] 2xl:text-[17px] 3xl:text-[19px] 4xl:text-[26px] 5xl:text-[38px] text-on-light-grey text-center leading-[1.6]"
      >
        {role}
      </p>
    </div>
  </article>
)

// Three gentle "torn paper" silhouettes for the detail modal (Catmull-Rom
// splines walked around a rounded rect, sampled in objectBoundingBox units
// so each scales cleanly with the modal's fitScale). Kept shallow — the
// portrait, quote panel, and close button all sit close to the modal's
// content edges, so the bite must stay well inside the mat margin below.
const MODAL_RAGGED_PATHS = [
  'M 0.1000,0.0292 C 0.1313,0.0188 0.1771,0.0294 0.2157,0.0291 C 0.2543,0.0288 0.2928,0.0281 0.3314,0.0273 C 0.3700,0.0265 0.4086,0.0254 0.4471,0.0243 C 0.4857,0.0233 0.5243,0.0221 0.5628,0.0211 C 0.6014,0.0201 0.6400,0.0191 0.6785,0.0184 C 0.7171,0.0177 0.7556,0.0170 0.7942,0.0168 C 0.8329,0.0165 0.8788,0.0029 0.9104,0.0168 C 0.9420,0.0306 0.9717,0.0668 0.9840,0.1000 C 0.9962,0.1332 0.9839,0.1771 0.9840,0.2157 C 0.9840,0.2543 0.9841,0.2928 0.9841,0.3314 C 0.9842,0.3700 0.9843,0.4086 0.9844,0.4471 C 0.9845,0.4857 0.9846,0.5243 0.9845,0.5628 C 0.9845,0.6014 0.9844,0.6400 0.9843,0.6785 C 0.9842,0.7171 0.9840,0.7556 0.9837,0.7942 C 0.9833,0.8329 0.9962,0.8789 0.9823,0.9103 C 0.9683,0.9416 0.9330,0.9703 0.9000,0.9823 C 0.8670,0.9943 0.8229,0.9821 0.7843,0.9821 C 0.7457,0.9821 0.7072,0.9822 0.6686,0.9822 C 0.6300,0.9823 0.5914,0.9824 0.5529,0.9824 C 0.5143,0.9823 0.4757,0.9823 0.4372,0.9821 C 0.3986,0.9819 0.3600,0.9817 0.3215,0.9813 C 0.2829,0.9810 0.2443,0.9807 0.2058,0.9802 C 0.1672,0.9797 0.1209,0.9918 0.0902,0.9785 C 0.0595,0.9651 0.0330,0.9324 0.0215,0.9000 C 0.0101,0.8676 0.0215,0.8229 0.0214,0.7843 C 0.0214,0.7457 0.0211,0.7072 0.0210,0.6686 C 0.0208,0.6300 0.0206,0.5914 0.0206,0.5529 C 0.0207,0.5143 0.0208,0.4757 0.0212,0.4372 C 0.0215,0.3986 0.0221,0.3600 0.0228,0.3215 C 0.0234,0.2829 0.0243,0.2442 0.0252,0.2058 C 0.0261,0.1673 0.0157,0.1204 0.0282,0.0910 C 0.0407,0.0616 0.0687,0.0395 0.1000,0.0292 Z',
  'M 0.0950,0.0189 C 0.1283,0.0052 0.1775,0.0188 0.2187,0.0190 C 0.2599,0.0192 0.3012,0.0196 0.3424,0.0201 C 0.3837,0.0207 0.4249,0.0215 0.4661,0.0223 C 0.5074,0.0231 0.5486,0.0242 0.5898,0.0251 C 0.6311,0.0260 0.6723,0.0270 0.7135,0.0277 C 0.7548,0.0283 0.7978,0.0258 0.8372,0.0289 C 0.8767,0.0320 0.9275,0.0248 0.9502,0.0461 C 0.9730,0.0674 0.9693,0.1178 0.9737,0.1569 C 0.9781,0.1959 0.9756,0.2393 0.9765,0.2806 C 0.9773,0.3218 0.9783,0.3630 0.9789,0.4043 C 0.9795,0.4455 0.9800,0.4867 0.9803,0.5280 C 0.9806,0.5692 0.9807,0.6104 0.9808,0.6517 C 0.9808,0.6929 0.9807,0.7342 0.9808,0.7754 C 0.9808,0.8166 0.9937,0.8647 0.9811,0.8991 C 0.9685,0.9336 0.9383,0.9680 0.9050,0.9821 C 0.8717,0.9962 0.8225,0.9831 0.7813,0.9836 C 0.7401,0.9841 0.6988,0.9847 0.6576,0.9851 C 0.6163,0.9854 0.5751,0.9857 0.5339,0.9858 C 0.4926,0.9858 0.4514,0.9857 0.4102,0.9855 C 0.3689,0.9852 0.3277,0.9848 0.2865,0.9844 C 0.2452,0.9839 0.2034,0.9868 0.1628,0.9830 C 0.1221,0.9792 0.0668,0.9848 0.0428,0.9615 C 0.0188,0.9382 0.0226,0.8835 0.0186,0.8431 C 0.0146,0.8028 0.0187,0.7607 0.0188,0.7194 C 0.0188,0.6782 0.0188,0.6370 0.0188,0.5957 C 0.0189,0.5545 0.0189,0.5133 0.0190,0.4720 C 0.0191,0.4308 0.0192,0.3896 0.0192,0.3483 C 0.0193,0.3071 0.0193,0.2658 0.0193,0.2246 C 0.0193,0.1834 0.0065,0.1352 0.0191,0.1009 C 0.0317,0.0666 0.0617,0.0325 0.0950,0.0189 Z',
  'M 0.1050,0.0217 C 0.1406,0.0077 0.1930,0.0201 0.2369,0.0191 C 0.2809,0.0181 0.3249,0.0169 0.3689,0.0159 C 0.4128,0.0148 0.4568,0.0136 0.5008,0.0127 C 0.5448,0.0117 0.5887,0.0109 0.6327,0.0103 C 0.6767,0.0098 0.7206,0.0095 0.7647,0.0095 C 0.8087,0.0096 0.8597,-0.0055 0.8968,0.0104 C 0.9339,0.0263 0.9727,0.0673 0.9873,0.1050 C 1.0019,0.1427 0.9854,0.1930 0.9844,0.2369 C 0.9834,0.2809 0.9824,0.3249 0.9816,0.3689 C 0.9807,0.4128 0.9800,0.4568 0.9794,0.5008 C 0.9789,0.5448 0.9785,0.5887 0.9783,0.6327 C 0.9780,0.6767 0.9780,0.7207 0.9780,0.7647 C 0.9779,0.8086 0.9919,0.8610 0.9781,0.8966 C 0.9642,0.9321 0.9308,0.9646 0.8950,0.9781 C 0.8592,0.9917 0.8070,0.9780 0.7631,0.9778 C 0.7191,0.9776 0.6751,0.9774 0.6311,0.9771 C 0.5872,0.9768 0.5432,0.9765 0.4992,0.9762 C 0.4552,0.9759 0.4113,0.9756 0.3673,0.9755 C 0.3233,0.9753 0.2793,0.9753 0.2353,0.9753 C 0.1914,0.9753 0.1388,0.9890 0.1035,0.9756 C 0.0682,0.9622 0.0371,0.9304 0.0237,0.8950 C 0.0103,0.8596 0.0232,0.8070 0.0231,0.7631 C 0.0229,0.7191 0.0228,0.6751 0.0228,0.6311 C 0.0228,0.5872 0.0229,0.5432 0.0230,0.4992 C 0.0231,0.4552 0.0233,0.4113 0.0234,0.3673 C 0.0236,0.3233 0.0237,0.2793 0.0237,0.2353 C 0.0237,0.1914 0.0097,0.1391 0.0233,0.1035 C 0.0368,0.0679 0.0694,0.0358 0.1050,0.0217 Z',
]

const ModalRaggedDefs = () => (
  <svg aria-hidden="true" focusable="false" className="absolute h-0 w-0 overflow-hidden">
    <defs>
      {MODAL_RAGGED_PATHS.map((d, i) => (
        <clipPath key={i} id={`dbm-modal-ragged-${i}`} clipPathUnits="objectBoundingBox">
          <path d={d} />
        </clipPath>
      ))}
    </defs>
  </svg>
)

// Resting rotation (deg) for the modal's mid/outer backing layers — varied
// per master index so the three masters' popups don't fan out identically.
const MODAL_LAYER_ROTATE = [
  { mid: -2.4, outer: 3.4 },
  { mid: 2.8, outer: -3.6 },
  { mid: -2.0, outer: 2.8 },
]

// Detail modal shown when a master card is clicked. Portaled to document.body
// so its `fixed` positioning is relative to the viewport — the about page
// slides live inside transformed containers, which would otherwise become the
// containing block for `position: fixed` and mis-place the overlay.
// Design frame is a fixed 900×573 card on a 1440×1024 artboard (Figma "Hafeez
// Contractor"). To stay pixel-perfect — same px layout, same text line-breaks —
// the whole card is rendered at that exact size and uniformly scaled by the
// viewport's ratio to the artboard, so it occupies the same fraction of the
// screen (and looks identical) at every breakpoint.
const MODAL_W = 900
const MODAL_H = 573
const FONT = 'Poppins, sans-serif'

// Mat border (px, in the 900×573 authored space) between the ragged edge and
// the actual content — the portrait/quote panel sit flush with the content
// box, so this margin is what keeps the bite off them. See MODAL_RAGGED_PATHS.
const MODAL_MAT = 48
const OUTER_W = MODAL_W + MODAL_MAT * 2
const OUTER_H = MODAL_H + MODAL_MAT * 2
// Backing-layer bleed (px, authored space) — same ragged silhouette family,
// scaled up around the mat card so it peeks out like a mounted paper cut-out.
const MODAL_LAYER_BLEED = { mid: 16, outer: 34 }

// ── Tweak the card size here ─────────────────────────────────────────────
// Fraction of the viewport WIDTH the card should occupy (Figma design ≈ 0.625).
// Lower = smaller card. Stepped down on very large screens (3xl+) so the card
// doesn't feel oversized there.
const cardWidthFraction = (vw) => {
  if (vw >= 1920) return 0.4 // 3xl and up
  return 0.46
}
// Max fraction of the viewport HEIGHT, as a safety clamp on short screens.
const CARD_MAX_HEIGHT_FRACTION = 0.9
// ─────────────────────────────────────────────────────────────────────────

const MasterModal = ({ master, index, onClose }) => {
  const overlayRef = useRef(null)
  const dialogRef = useRef(null)
  const cardRef = useRef(null)
  const outerLayerRef = useRef(null)
  const midLayerRef = useRef(null)
  const closingRef = useRef(false)
  const [fitScale, setFitScale] = useState(1)

  const i = ((index % 3) + 3) % 3
  const frontShape = i
  const midShape = (i + 1) % 3
  const outerShape = (i + 2) % 3
  const rest = MODAL_LAYER_ROTATE[i]

  // Width-driven scale so the card stays a consistent fraction of the viewport
  // width (see cardWidthFraction) at every breakpoint. Clamped by height so it
  // never overflows on short screens.
  useEffect(() => {
    const update = () => {
      setFitScale(
        Math.min(
          (window.innerWidth * cardWidthFraction(window.innerWidth)) / OUTER_W,
          (window.innerHeight * CARD_MAX_HEIGHT_FRACTION) / OUTER_H,
        ),
      )
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Animated close: fade/scale out, then unmount via onClose. Guarded so a
  // second trigger (backdrop + Escape racing) doesn't start a second timeline.
  const close = () => {
    if (closingRef.current) return
    closingRef.current = true
    gsap
      .timeline({ onComplete: onClose })
      .to(dialogRef.current, { autoAlpha: 0, scale: 0.96, duration: 0.25, ease: 'power2.in' }, 0)
      .to(overlayRef.current, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0)
  }

  // Enter animation — scoped to opacity/scale only (no `transition-all`, which
  // fights GSAP autoAlpha on this project). Also locks body scroll and wires
  // Escape-to-close while open. The backing layers start stacked flush behind
  // the front card and fan out into their resting rotation as it settles in.
  useGSAP(() => {
    gsap.set(overlayRef.current, { autoAlpha: 0 })
    gsap.set(dialogRef.current, { autoAlpha: 0, scale: 0.96, y: 12 })
    gsap.set(outerLayerRef.current, { rotate: 0, scale: 0.94 })
    gsap.set(midLayerRef.current, { rotate: 0, scale: 0.97 })
    gsap
      .timeline()
      .to(overlayRef.current, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 0)
      .to(dialogRef.current, { autoAlpha: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0.05)
      .to(
        outerLayerRef.current,
        { rotate: rest.outer, scale: 1, duration: 0.55, ease: 'power2.out' },
        0.2,
      )
      .to(midLayerRef.current, { rotate: rest.mid, scale: 1, duration: 0.5, ease: 'power2.out' }, 0.16)
  }, [])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return createPortal(
    <div
      ref={overlayRef}
      onClick={close}
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
    >
      <ModalRaggedDefs />
      {/* Fit wrapper scales the fixed-size card; GSAP animates the card itself. */}
      <div style={{ transform: `scale(${fitScale})` }}>
        <div ref={dialogRef} className="relative" style={{ width: OUTER_W, height: OUTER_H }}>
          {/* Backing layers — same ragged silhouette family, scaled up via
              bleed and tinted with the master's accent colour, so they peek
              out around the mat card like a mounted paper cut-out. */}
          <div
            ref={outerLayerRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: -MODAL_LAYER_BLEED.outer,
              clipPath: `url(#dbm-modal-ragged-${outerShape})`,
              backgroundColor: master.accentColor ?? '#B08D66',
              opacity: 0.4,
            }}
          />
          <div
            ref={midLayerRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: -MODAL_LAYER_BLEED.mid,
              clipPath: `url(#dbm-modal-ragged-${midShape})`,
              backgroundColor: master.accentColor ?? '#B08D66',
            }}
          />

          {/* Front mat card — the ragged bite only ever eats into this white
              margin; the actual content sits inset by MODAL_MAT, untouched. */}
          <div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-label={master.name}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 overflow-hidden bg-white shadow-2xl"
            style={{ clipPath: `url(#dbm-modal-ragged-${frontShape})`, fontFamily: FONT }}
          >
            <div
              className="absolute"
              style={{ left: MODAL_MAT, top: MODAL_MAT, width: MODAL_W, height: MODAL_H }}
            >
              {/* Portrait — fixed 360px column, full height */}
              <div className="absolute left-0 top-0 h-143.25 w-90 overflow-hidden">
                <img
                  src={master.image}
                  alt={master.name}
                  className={`h-full w-full object-cover ${master.modalClassName ?? ''}`}
                />
              </div>

              {/* Close — 32px hit area at (852,16); 16px glyph, 1.8px stroke */}
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1 1L15 15M15 1L1 15"
                    stroke="#313131"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Title (24/120%/500) */}
              <h3
                className="absolute capitalize"
                style={{
                  left: 384,
                  top: 52,
                  width: 360,
                  fontWeight: 500,
                  fontSize: 24,
                  lineHeight: '120%',
                  color: '#313131',
                }}
              >
                {master.name}
              </h3>

              {/* Role (18/200%/400) */}
              <p
                className="absolute"
                style={{
                  left: 384,
                  top: 88,
                  width: 360,
                  fontWeight: 400,
                  fontSize: 18,
                  lineHeight: '200%',
                  color: '#666666',
                }}
              >
                {master.role}
              </p>

              {/* Bio (16/150%/400, 492px → governs line breaks) */}
              <p
                className="absolute"
                style={{
                  left: 384,
                  top: 156,
                  width: 492,
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: '150%',
                  color: '#666666',
                }}
              >
                {master.bio}
              </p>

              {/* Accent quote panel — 540×210 pinned bottom-right */}
              <div
                className="absolute"
                style={{
                  left: 360,
                  top: 363,
                  width: 540,
                  height: 210,
                  backgroundColor: master.accentColor ?? '#B08D66',
                }}
              />

              {/* Quote mark (16×16 at 398,398) */}
              <svg
                className="absolute"
                style={{ left: 398, top: 398 }}
                width="16"
                height="16"
                viewBox="0 0 16 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 5.5V12.5H0V5.4C0 0.6 4.5 0 4.5 0L5.1 1.4C5.1 1.4 3.1 1.7 2.7 3.3C2.3 4.5 3.1 5.5 3.1 5.5H7ZM16 5.5V12.5H9V5.4C9 0.6 13.5 0 13.5 0L14.1 1.4C14.1 1.4 12.1 1.7 11.7 3.3C11.3 4.5 12.1 5.5 12.1 5.5H16Z"
                  fill="white"
                />
              </svg>

              {/* Quote text (16/150%/400, 423px → governs line breaks) */}
              <p
                className="absolute"
                style={{
                  left: 418,
                  top: 413,
                  width: 423,
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: '150%',
                  color: '#FFFFFF',
                }}
              >
                {master.quote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

const DesignedByMasters = forwardRef((_props, ref) => {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)
  const splitsRef = useRef([])
  const bodySplitRef = useRef(null)
  const isReadyRef = useRef(false)
  const queuedActionRef = useRef(null)
  const [activeMaster, setActiveMaster] = useState(null)

  useGSAP(
    (_context, contextSafe) => {
      const scope = sectionRef.current
      if (!scope) return

      const setup = contextSafe(() => {
        const headingEl = scope.querySelector('[data-dbm-heading]')
        const cursiveEl = scope.querySelector('[data-dbm-cursive]')
        const bodyEl = scope.querySelector('[data-dbm-body]')
        const buildingsEl = scope.querySelector('[data-dbm-buildings]')
        const cards = scope.querySelectorAll('[data-master-card]')

        const drawSel =
          'svg path, svg line, svg polyline, svg polygon, svg circle, svg ellipse, svg rect'

        const buildingPaths = buildingsEl ? buildingsEl.querySelectorAll(drawSel) : []

        gsap.set(headingEl, { autoAlpha: 0, y: 18 })
        gsap.set(cursiveEl, { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' })
        gsap.set(buildingsEl, { autoAlpha: 1 })
        gsap.set(buildingPaths, { drawSVG: 0 })
        gsap.set(cards, {
          autoAlpha: 1,
          clipPath: 'inset(0 0 100% 0)',
          willChange: 'clip-path',
        })

        // Pre-split body copy into masked lines for a classy line-by-line rise.
        const bodySplit = bodyEl
          ? SplitText.create(bodyEl, {
              type: 'lines',
              linesClass: 'dbm-body-line',
              mask: 'lines',
            })
          : null
        bodySplitRef.current = bodySplit
        if (bodySplit) {
          gsap.set(bodyEl, { autoAlpha: 1 })
          gsap.set(bodySplit.lines, { yPercent: 100, autoAlpha: 0 })
        }

        // Pre-split each card's title (chars) and subtitle (lines) so the text
        // can animate in AFTER its card's clip-path reveal completes.
        const cardSplits = Array.from(cards).map((card) => {
          const titleEl = card.querySelector('[data-card-title]')
          const subtitleEl = card.querySelector('[data-card-subtitle]')
          const titleSplit = titleEl
            ? SplitText.create(titleEl, {
                type: 'words',
                wordsClass: 'card-title-word',
                mask: 'words',
              })
            : null
          const subtitleSplit = subtitleEl
            ? SplitText.create(subtitleEl, {
                type: 'lines',
                linesClass: 'card-subtitle-line',
                mask: 'lines',
              })
            : null
          return { titleSplit, subtitleSplit }
        })
        splitsRef.current = cardSplits

        cardSplits.forEach(({ titleSplit, subtitleSplit }) => {
          if (titleSplit) {
            gsap.set(titleSplit.words, { yPercent: 100, autoAlpha: 0 })
          }
          if (subtitleSplit) {
            gsap.set(subtitleSplit.lines, { yPercent: 100, autoAlpha: 0 })
          }
        })

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(cards, { willChange: 'auto' })
          },
        })

        tl.to(headingEl, { autoAlpha: 1, y: 0, duration: 0.6 }, 0)

        tl.to(
          cursiveEl,
          { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power1.inOut' },
          0.3,
        )
          .to(
            bodySplit ? bodySplit.lines : bodyEl,
            bodySplit
              ? {
                  yPercent: 0,
                  autoAlpha: 1,
                  stagger: 0.09,
                  duration: 0.85,
                  ease: 'power3.out',
                }
              : { y: 0, autoAlpha: 1, duration: 0.5 },
            0.45,
          )
          .to(
            buildingPaths,
            {
              drawSVG: '0% 100%',
              stagger: 0.018,
              duration: 0.6,
              ease: 'power1.inOut',
            },
            0.5,
          )
          .to(
            cards,
            {
              clipPath: 'inset(0 0 0% 0)',
              stagger: 0.08,
              duration: 1.0,
              ease: 'power2.out',
            },
            0.85,
          )

        // Per-card text reveal AFTER each card's clip-path completes.
        // card[i] starts at 0.85 + i*0.08, finishes at start + 1.0.
        const cardStart = 0.85
        const cardStagger = 0.08
        const cardDuration = 1.0
        cardSplits.forEach(({ titleSplit, subtitleSplit }, i) => {
          const cardEnd = cardStart + i * cardStagger + cardDuration
          if (titleSplit) {
            tl.to(
              titleSplit.words,
              {
                yPercent: 0,
                autoAlpha: 1,
                stagger: 0.07,
                duration: 0.9,
                ease: 'power4.out',
              },
              cardEnd - 0.05,
            )
          }
          if (subtitleSplit) {
            tl.to(
              subtitleSplit.lines,
              {
                yPercent: 0,
                autoAlpha: 1,
                stagger: 0.08,
                duration: 0.8,
                ease: 'power3.out',
              },
              cardEnd + 0.15,
            )
          }
        })

        tlRef.current = tl
        isReadyRef.current = true

        const queued = queuedActionRef.current
        queuedActionRef.current = null
        if (queued === 'in') {
          gsap.set(scope, { autoAlpha: 1 })
          tl.timeScale(1).play(0)
        } else if (queued === 'out') {
          tl.timeScale(2.5).reverse()
        }
      })

      const cardImages = scope.querySelectorAll('[data-master-card] img')
      const decodes = Array.from(cardImages).map((img) => {
        if (img.complete && img.decode) return img.decode().catch(() => {})
        if (img.decode)
          return new Promise((res) => {
            img.addEventListener('load', () => img.decode().then(res, res), {
              once: true,
            })
            img.addEventListener('error', () => res(), { once: true })
          })
        return Promise.resolve()
      })

      Promise.all([aboutReveal(scope), ...decodes]).then(setup)

      return () => {
        splitsRef.current.forEach(({ titleSplit, subtitleSplit }) => {
          titleSplit?.revert?.()
          subtitleSplit?.revert?.()
        })
        splitsRef.current = []
        bodySplitRef.current?.revert?.()
        bodySplitRef.current = null
      }
    },
    { scope: sectionRef },
  )

  useImperativeHandle(ref, () => ({
    prepare: () => {
      if (!isReadyRef.current || !tlRef.current) return
      gsap.set(sectionRef.current, { autoAlpha: 1 })
      tlRef.current.timeScale(1).pause(0)
    },
    playIn: () => {
      if (!isReadyRef.current || !tlRef.current) {
        queuedActionRef.current = 'in'
        return
      }
      gsap.set(sectionRef.current, { autoAlpha: 1 })
      tlRef.current.timeScale(1).play(0)
    },
    // stop freezes the intro timeline at its current position so its tweens
    // stop fighting the exit choreography. Tween references are preserved so
    // pause(0) on the next visit can rewind cleanly.
    stop: () => {
      if (tlRef.current) tlRef.current.pause()
    },
  }))

  return (
    <section
      ref={sectionRef}
      className="bg-pastel-brown-bg w-full h-full px-6 lg:px-[10%] xl:px-[10%] 2xl:px-[10%] 3xl:px-[10%] 4xl:px-[10%] 5xl:px-[10%]"
    >
      <div className="max-w-[1180px] lg:max-w-none xl:max-w-none 2xl:max-w-none 3xl:max-w-none 4xl:max-w-none 5xl:max-w-none mx-auto">
        <div className="grid grid-cols-12 gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 3xl:gap-14 4xl:gap-18 5xl:gap-24 items-end mb-14 lg:mb-16 xl:mb-20 2xl:mb-24 3xl:mb-28 4xl:mb-36 5xl:mb-52">
          <div className="col-span-12 lg:col-span-7">
            <h2
              data-dbm-heading
              data-fade-out="text"
              className="invisible font-normal text-[36px] lg:text-[34px] xl:text-[42px] 2xl:text-[47.7px] 3xl:text-[58.5px] 4xl:text-[77px] 5xl:text-[108px] leading-[1.16] -tracking-[0.5px] text-on-light-black"
            >
              Designed By Masters
            </h2>
            <InlineSVG
              src="/about/inspired-by-life.svg"
              aria-label="inspired by life"
              data-dbm-cursive
              data-fade-out="decor"
              data-clip-reverse
              className="invisible mt-3 lg:w-[8.5rem] xl:w-[10.5rem] 2xl:w-[12rem] 3xl:w-[14.5rem] 4xl:w-[19rem] 5xl:w-[27rem] h-auto"
            />
            <p
              data-dbm-body
              data-fade-out="text"
              className="text-on-light-black/85 text-[13px] lg:text-[12px] xl:text-[15px] 2xl:text-[17px] 3xl:text-[21px] 4xl:text-[28px] 5xl:text-[39px] leading-[1.85] mt-7 lg:mt-5 xl:mt-7 2xl:mt-8 3xl:mt-9 4xl:mt-12 5xl:mt-16 max-w-[600px] lg:max-w-[580px] xl:max-w-[630px] 3xl:max-w-[800px] 4xl:max-w-[1060px] 5xl:max-w-[1480px]"
            >
              Crafted with vision by three acclaimed design houses, including
              the legendary Architect Hafeez Contractor, Rivali Park 2 is a
              celebration of intentionally designed spaces, landscapes, and
              life-enhancing amenities.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-5 flex lg:justify-end">
            <div
              data-dbm-buildings
              data-undraw
              data-inline-svg=""
              data-inline-svg-loaded="true"
              aria-hidden="true"
              className="invisible block w-full max-w-105 lg:max-w-[260px] xl:max-w-[400px] 2xl:max-w-[480px] 3xl:max-w-[580px] 4xl:max-w-[800px] 5xl:max-w-[1180px] h-auto"
            >
              <BuildingsSvg />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 xl:gap-6 2xl:gap-8 3xl:gap-10 4xl:gap-12 5xl:gap-18">
          {masters.map((m) => (
            <MasterCard key={m.name} {...m} onOpen={() => setActiveMaster(m)} />
          ))}
        </div>
      </div>

      {activeMaster && (
        <MasterModal
          master={activeMaster}
          index={masters.indexOf(activeMaster)}
          onClose={() => setActiveMaster(null)}
        />
      )}
    </section>
  )
})

DesignedByMasters.displayName = 'DesignedByMasters'

export default DesignedByMasters
