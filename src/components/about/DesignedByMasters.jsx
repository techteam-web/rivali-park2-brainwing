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
    role: 'Landscaping',
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
    role: 'Amenities',
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

const MasterModal = ({ master, onClose }) => {
  const overlayRef = useRef(null)
  const dialogRef = useRef(null)
  const closingRef = useRef(false)
  const [fitScale, setFitScale] = useState(1)

  // Width-driven scale so the card stays a consistent fraction of the viewport
  // width (see cardWidthFraction) at every breakpoint. Clamped by height so it
  // never overflows on short screens.
  useEffect(() => {
    const update = () => {
      setFitScale(
        Math.min(
          (window.innerWidth * cardWidthFraction(window.innerWidth)) / MODAL_W,
          (window.innerHeight * CARD_MAX_HEIGHT_FRACTION) / MODAL_H,
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
  // Escape-to-close while open.
  useGSAP(() => {
    gsap.set(overlayRef.current, { autoAlpha: 0 })
    gsap.set(dialogRef.current, { autoAlpha: 0, scale: 0.96, y: 12 })
    gsap
      .timeline()
      .to(overlayRef.current, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 0)
      .to(dialogRef.current, { autoAlpha: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0.05)
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
      {/* Fit wrapper scales the fixed-size card; GSAP animates the card itself. */}
      <div style={{ transform: `scale(${fitScale})` }}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={master.name}
          onClick={(e) => e.stopPropagation()}
          className="relative overflow-hidden bg-white shadow-2xl"
          style={{ width: MODAL_W, height: MODAL_H, fontFamily: FONT }}
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
        <MasterModal master={activeMaster} onClose={() => setActiveMaster(null)} />
      )}
    </section>
  )
})

DesignedByMasters.displayName = 'DesignedByMasters'

export default DesignedByMasters
