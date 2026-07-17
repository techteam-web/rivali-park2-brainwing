import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { useOverlayScale } from '../../hooks/useOverlayScale'
import { getLocationById } from './locationsData'
import { getLocationTimes } from './locationTimes'
import { getLocationImage } from './locationImages'
import { getLocationBlurb } from './locationBlurbs'
import { getLocationDistance } from './locationDistances'
import RaggedyEdge from '../../assets/locations/svgs/raggedy-edge.svg?react'
import WalkIcon from '../../assets/locations/svgs/walk.svg?react'
import BikeIcon from '../../assets/locations/svgs/bike.svg?react'
import CarIcon from '../../assets/locations/svgs/car.svg?react'
import TransitIcon from '../../assets/locations/svgs/transport.svg?react'

// Placeholder blurb shown on every card for now; real per-location copy lands later.
const PLACEHOLDER_BLURB =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.'

// walk / bike / car / transit, in order. transport.svg is the transit icon; the SVGs carry a
// baked stroke="#7A4833" so they render brown natively (no recolor).
const TRAVEL_MODES = [
  { key: 'walk', Icon: WalkIcon },
  { key: 'bike', Icon: BikeIcon },
  { key: 'car', Icon: CarIcon },
  { key: 'transit', Icon: TransitIcon },
]

// px inset from the top/right edges at scale 1 (the old 3xl:top-8 / 3xl:right-8).
const INSET = 32

// Detail card docked top-right over the /locations map. Shows when a location is selected and
// self-hides (returns null) when locationId is null, so its lifecycle mirrors the route.
//
// Sizing: authored at its 1920 look and scaled proportionally by useOverlayScale -- no
// breakpoint ramps. The scale lives on a WRAPPER, not on cardRef, because GSAP owns
// cardRef's inline transform (below) and would overwrite a React one on every tick.
// Same split as the about page's DesignedByMasters fit wrapper.
const LocationCard = ({ locationId, exiting }) => {
  const cardRef = useRef(null)
  const location = locationId ? getLocationById(locationId) : null
  const { scale } = useOverlayScale()

  // Slide/fade IN on each new selection; slide/fade OUT when the sequenced deselect begins. The card
  // stays mounted through its exit because selectedLocationId is preserved until Phase B, then
  // unmounts with no flash (it is already faded, and useGSAP reverts on the detached node). The exit
  // is kept shorter than the route retract-out (locationsConfig.route.drawDuration) so the routes,
  // not the card, gate the deselect sequence.
  useGSAP(
    () => {
      if (!cardRef.current) return
      if (exiting) {
        gsap.to(cardRef.current, { autoAlpha: 0, x: 20, duration: 0.3, ease: 'power2.in' })
      } else {
        gsap.fromTo(
          cardRef.current,
          { autoAlpha: 0, x: 20 },
          { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power2.out' },
        )
      }
    },
    { dependencies: [locationId, exiting], scope: cardRef },
  )

  if (!location) return null

  // Real travel times keyed by id; null when a location has no entry yet (shows '--').
  const times = getLocationTimes(locationId)

  // Per-location photo URL; null when there's no image on disk yet (shows placeholder block).
  const photo = getLocationImage(locationId)

  // Per-location card copy; null when a location has no blurb (falls back to PLACEHOLDER_BLURB).
  const blurb = getLocationBlurb(locationId)

  // Per-location road distance label; null when a location has no entry (falls back to '200 m').
  const distance = getLocationDistance(locationId)

  return (
    // Positioner + scale layer. Scaling from the top-right corner keeps the card pinned
    // there; the insets are scaled inline (plain numbers, so they never interact with the
    // transform) which keeps the corner gap proportional too.
    //
    // pointer-events stays on the CARD, not here: GSAP's autoAlpha hides the card with
    // visibility: hidden, which also stops it receiving pointer events, so the top-right
    // corner is orbit-draggable again the moment the card fades. A pointer-events-auto
    // wrapper would keep swallowing those drags while the card is invisible.
    <div
      className="pointer-events-none absolute z-60"
      style={{
        top: INSET * scale,
        right: INSET * scale,
        transform: `scale(${scale})`,
        transformOrigin: 'top right',
      }}
    >
      <div ref={cardRef} className="pointer-events-auto overflow-hidden rounded-xs bg-white shadow-2xl w-72">
        {/* Photo region */}
        <div className="relative w-full h-52">
          {photo ? (
            <img src={photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[#ECE7E0]" />
          )}

          {/* Fine torn-paper edge: white body tears UP into the photo (solid bottom, raggedy top;
              -bottom-px kills the seam). preserveAspectRatio="none" stretches it to the card width. */}
          <RaggedyEdge
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-px block w-full h-6"
          />

          {/* Distance pill, floating at the photo's bottom-right, clearing the tear.
              Text uses brand-brown to match the travel icons' baked stroke. */}
          <div className="absolute right-3 bottom-7 z-10 rounded-full bg-white shadow px-2 py-0.5 font-medium text-brand-brown text-[11px]">
            {distance ?? '200 m'}
          </div>
        </div>

        {/* Body (extra bottom padding so the card reads longer on the y axis) */}
        <div className="px-5 pt-4 pb-9">
          <h3 className="font-semibold leading-tight text-on-light-black text-xl">{location.name}</h3>
          <p className="mt-2.5 leading-snug text-on-light-grey text-xs">{blurb ?? PLACEHOLDER_BLURB}</p>

          {/* Travel row: walk / bike / car / transit, icon above its time */}
          <div className="mt-3.5 grid grid-cols-4 gap-2 pt-4">
            {TRAVEL_MODES.map(({ key, Icon }) => (
              <div key={key} className="flex flex-col items-center gap-1">
                <Icon aria-hidden="true" className="w-auto h-6" />
                <span className="text-on-light-black text-[11px]">{times ? times[key] : '--'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationCard
