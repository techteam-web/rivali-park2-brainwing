import { useCallback, useEffect, useRef, useState } from 'react'
import CurvedPanorama from './CurvedPanorama'
import { PanoramaSyncProvider } from './PanoramaSyncProvider'
import { VIEW_SOURCES, ordinal } from '../../data/courtyardViews'
import PageNav from '../layout/PageNav'
import { usePageTransition } from '../../hooks/usePageTransition'

// Bottom-right floor selector. Opens UPWARD (a "drop-up") so the list never
// runs off the bottom of the screen; the keyboard_arrow_up glyph flips to point
// down while open. Only floors where this apartment exists (has a panorama) are
// listed — sold-out floors are absent. Styling mirrors the Figma "Tab".
const FloorSelect = ({ value, floors, onChange }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="pointer-events-auto absolute bottom-10 right-10 w-[15.1vw] min-w-50 max-w-65">
      {open && (
        <ul
          role="listbox"
          className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-10 max-h-72 overflow-auto rounded-sm border-[0.5px] border-[rgba(122,72,51,0.2)] bg-[#FAF9F6] py-1 shadow-[0_-8px_24px_rgba(0,0,0,0.18)]"
        >
          {floors.map((f) => {
            const isSelected = f === value
            return (
              <li key={f} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onChange(f)
                  }}
                  className={`w-full cursor-pointer px-5 py-2.5 text-center uppercase transition-colors hover:bg-on-light-highlight-brown ${
                    isSelected ? 'bg-on-light-highlight-brown' : ''
                  }`}
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: 15,
                    letterSpacing: '0.1em',
                    color: '#7A4833',
                  }}
                >
                  {ordinal(f)} Floor
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border-[0.5px] border-[rgba(122,72,51,0.2)] bg-[#FAF9F6] px-6 py-5 transition-[box-shadow,transform] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] active:scale-[0.98]"
      >
        <span
          className="uppercase"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            fontSize: 18,
            letterSpacing: '0.1em',
            color: '#7A4833',
          }}
        >
          {ordinal(value)} Floor
        </span>
        <img
          src="/unit plan/svgs/keyboard_arrow_up.svg"
          alt=""
          className={`h-7 w-7 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  )
}

// Fullscreen courtyard-view viewer, opened from the "Courtyard View" link on a
// unit. `position` is the floor-plan unit number (1-6); the apartment shown is
// floor*100 + position, drawn from `tower`'s panorama manifest. The floor
// drop-up lists only floors where that apartment is available. Layout matches
// PlanLightbox: the raggedy white tear IS the header (title + close on its solid
// top band).
//
// Rendered outside the scaled <UnitArtboard> so it covers the real viewport. It
// rises forward out of a soft blur on open and eases back on close (matching the
// gallery / plan-lightbox transition feel).
const CourtyardView = ({
  title,
  tower,
  position,
  initialFloor,
  onClose,
  onHome,
  // Called the instant Home is pressed, before this view starts fading, so the
  // page underneath can take itself out of sight rather than be revealed.
  onLeaving,
}) => {
  const rootRef = useRef(null)
  const views = VIEW_SOURCES[tower] ?? null
  const floors = views && position ? views.floorsForPosition(position) : []
  // A floor picked back on the tower elevation wins even when THIS apartment
  // has no panorama on it — the point of choosing a floor is to see that
  // floor, so we honour it and show the empty state rather than silently
  // dropping the user somewhere else in the building.
  const [floor, setFloor] = useState(
    () => initialFloor ?? floors[0] ?? null,
  )
  const src = views && floor != null ? views.viewImage(floor, position) : null
  // Keep the current floor visible in the drop-up even if it isn't one of the
  // floors with a view, so the list never contradicts the button's label.
  const floorOptions =
    floor != null && !floors.includes(floor)
      ? [...floors, floor].sort((a, b) => a - b)
      : floors

  // Warm the browser cache for every floor's panorama the moment the viewer
  // opens, so switching floors is instant instead of waiting on a ~2MB download
  // (an uncached image can otherwise still be loading when you pan, reading as
  // "stuck on the left"). Purely a prefetch — it does not touch the pan /
  // crossfade engine below.
  useEffect(() => {
    if (!views || !position) return
    const preloaded = views
      .floorsForPosition(position)
      .map((f) => views.viewImage(f, position))
      .filter(Boolean)
      .map((s) => {
        const img = new Image()
        img.src = s
        return img
      })
    return () => preloaded.forEach((img) => (img.src = ''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tower, position])

  // The overlay runs the app's standard page transition — the same hook every
  // screen change in this flow uses — instead of its own hand-rolled copy.
  //
  // The copy had drifted from it (blur 10px vs 8px, 0.85s/0.5s vs 0.9s/0.55s,
  // no transformOrigin), and crucially it lacked the hook's StrictMode
  // hardening: with nothing gating the entrance, the effect's double-invocation
  // could replay it, which is what made the header controls flicker in
  // half-blurred instead of rising cleanly out of the blur.
  const { exitWith } = usePageTransition({ containerRef: rootRef })

  const handleClose = useCallback(() => exitWith(onClose), [exitWith, onClose])

  // Home leaves for the homepage in ONE fade, straight from this view.
  //
  // The unit sheet is still painted underneath, so it has to be taken out of
  // the picture before the fade begins — otherwise it is revealed as this
  // overlay turns transparent, and the trip home reads as "back a screen,
  // then fade". onLeaving hides it outright (instantly, under cover of this
  // still-opaque overlay); then this view fades away over the background and
  // onHome navigates once it lands.
  const handleHome = useCallback(() => {
    onLeaving?.()
    exitWith(onHome)
  }, [onLeaving, exitWith, onHome])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 overflow-hidden bg-white"
    >
      {/* Panorama stage — stays mounted across floor changes so it can crossfade
          internally. Falls back to a plain fill when no view exists. Its own
          sync group of one — the compare page groups several together. */}
      {src ? (
        <PanoramaSyncProvider>
          <CurvedPanorama src={src} />
        </PanoramaSyncProvider>
      ) : (
        <div
          className="absolute inset-0 grid place-items-center px-12 text-center bg-white"
        >
          <p
            className="uppercase"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              fontSize: 16,
              letterSpacing: '0.12em',
              color: 'rgba(49,49,49,0.55)',
            }}
          >
            {/* Sales-team wording (client feedback, 08 Aug): the honest read
                of "this unit doesn't exist on that floor" is that the
                apartment isn't available there, not that a view is missing. */}
            {floor != null && !floors.includes(floor)
              ? 'Apartment not available'
              : 'Panoramic view coming soon'}
          </p>
        </div>
      )}

      {/* Torn white edge = the header (same vector + sizing as PlanLightbox). */}
      <img
        src="/unit plan/svgs/raggedy edge svg.svg"
        alt=""
        className="pointer-events-none absolute left-1/2 top-0 h-[7.8vw] w-[225%] max-w-none -translate-x-1/2 select-none"
      />

      {/* Title + close overlaid on the raggedy's solid top band. */}
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
        {/* Close only. Home used to sit alongside it here, at a size and a
            corner all its own; it's now the shared <PageNav> home button at
            top-left, on the same pixels as every other screen's. */}
        <div className="pointer-events-auto absolute right-12 top-1/2 flex -translate-y-1/2 items-center gap-3">
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="grid h-8 w-8 cursor-pointer place-items-center transition-[opacity,transform] hover:opacity-60 active:scale-90"
          >
            <img src="/unit/svgs/close cross.svg" alt="" className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* No back arrow here — closing is what returns to the unit sheet — so
          PageNav holds the back slot open and home keeps its usual position. */}
      <PageNav onHome={handleHome} />

      {floor != null && (
        <FloorSelect value={floor} floors={floorOptions} onChange={setFloor} />
      )}
    </div>
  )
}

export default CourtyardView
