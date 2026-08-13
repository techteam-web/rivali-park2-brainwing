import { useRef } from 'react'
import { towers } from '../data/towers'
import { usePageTransition } from '../hooks/usePageTransition'

// Aerial landing for /towers. Reuses the gallery's site render and pill pattern,
// but shows only the four tower pills (no amenity markers) and selects a tower
// in-page rather than navigating. Picking a pill hands the tower up to the
// parent, which swaps in the detail view.

// Native size of the shared aerial render (matches Gallery.jsx).
const BG_W = 1226
const BG_H = 995

// Pill placement anchored to the VIEWPORT (top/bottom/left/right) rather than to
// the cover-cropped aerial image, so the names hold their on-screen position
// across breakpoints and aspect ratios. Percentages keep it responsive;
// skyleap/moonrise centre horizontally on their point via -translate-x-1/2
// (which composes with the hover scale). Keyed by id.
const PILL_POS = {
  // Skyleap moved right off its old 41.5% per the client's markup (08 Aug), so
  // the pill sits centred on the tower's own roof rather than at its left edge.
  // This value is the pill's CENTRE as a % of the viewport width — nudge it
  // here if it needs to travel further either way.
  skyleap: 'top-[6%] left-[65%] -translate-x-1/2',
  sunburst: 'top-[33%] right-[6%]',
  moonrise: 'bottom-[7%] left-[60.5%] -translate-x-1/2',
  stargaze: 'bottom-[7%] right-[6%]',
}

const PILL_CLASS =
  'absolute z-10 cursor-pointer rounded-full border border-white/40 font-normal text-white text-center backdrop-blur-[1.3px] xl:backdrop-blur-[1.6px] 2xl:backdrop-blur-[2px] 3xl:backdrop-blur-[2.5px] 4xl:backdrop-blur-[3.3px] 5xl:backdrop-blur-[5px] transition-[transform,filter] duration-200 hover:scale-[1.05] hover:brightness-110 focus:outline-none focus-visible:scale-[1.05] focus-visible:brightness-110 px-5 py-1.5 text-[13px] leading-[165%] xl:px-6.25 xl:py-2 xl:text-[16px] 2xl:px-7.5 2xl:py-2.25 2xl:text-[20px] 3xl:px-9.5 3xl:py-2.75 3xl:text-[24px] 4xl:px-12.5 4xl:py-3.75 4xl:text-[32px] 5xl:px-18.75 5xl:py-5.75 5xl:text-[49px]'

const PILL_GRADIENT =
  'radial-gradient(ellipse 38.32% 0.91% at 50% 50%, rgba(255,255,255,0) 0%, rgba(0,0,0,0.28) 100%), linear-gradient(180deg, rgba(243,198,143,0.0051) 0%, rgba(243,198,143,0) 100%)'

const TowersLanding = ({ onSelect }) => {
  const pageRef = useRef(null)
  // exitTo drives the route change back home; exitWith plays the same scale +
  // blur + fade for the in-page handoff to a tower's detail view.
  const { exitTo, exitWith } = usePageTransition({ containerRef: pageRef })

  return (
    <div ref={pageRef} className="relative h-screen w-full overflow-hidden bg-black">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `max(100vw, calc(100vh * ${BG_W} / ${BG_H}))`,
          height: `max(100vh, calc(100vw * ${BG_H} / ${BG_W}))`,
        }}
      >
        <img
          src="/gallery/gallery bg.webp"
          alt=""
          className="block w-full h-full select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Pills sit against the viewport (not inside the image wrapper) so their
          top/bottom/left/right values are relative to the screen. */}
      {towers.map((t) => {
        const pos = PILL_POS[t.id]
        if (!pos) return null
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => exitWith(() => onSelect(t))}
            aria-label={t.name}
            className={`${PILL_CLASS} ${pos}`}
            style={{ backgroundImage: PILL_GRADIENT }}
          >
            {t.name}
          </button>
        )
      })}

      <div className="absolute top-5 left-5 z-10 flex items-center gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 4xl:gap-5 5xl:gap-8">
        <button
          type="button"
          aria-label="Back"
          onClick={() => exitTo('/')}
          className="flex items-center justify-center rounded-full bg-white/20 text-white transition-[transform,background-color] duration-200 hover:bg-white/30 hover:scale-[1.05] focus:outline-none focus-visible:bg-white/30 focus-visible:scale-[1.05] h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Go to homepage"
          onClick={() => exitTo('/')}
          className="flex items-center justify-center rounded-full bg-white/20 text-white transition-[transform,background-color] duration-200 hover:bg-white/30 hover:scale-[1.05] focus:outline-none focus-visible:bg-white/30 focus-visible:scale-[1.05] h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12">
            <path d="M4 11.5L12 4l8 7.5" />
            <path d="M6 10.5V19a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-8.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TowersLanding
