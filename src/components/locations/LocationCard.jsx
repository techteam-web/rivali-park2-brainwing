import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
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

// Detail card docked top-right over the /locations map. Shows when a location is selected and
// self-hides (returns null) when locationId is null, so its lifecycle mirrors the route.
const LocationCard = ({ locationId, exiting }) => {
  const cardRef = useRef(null)
  const location = locationId ? getLocationById(locationId) : null

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
    <div
      ref={cardRef}
      className="pointer-events-auto absolute top-5 right-5 z-60 overflow-hidden rounded-xs bg-white shadow-2xl w-60 xl:w-64 2xl:w-68 3xl:w-72 4xl:w-80 5xl:w-88 2xl:top-6 2xl:right-6 3xl:top-8 3xl:right-8 4xl:top-10 4xl:right-10 5xl:top-14 5xl:right-14"
    >
      {/* Photo region */}
      <div className="relative w-full h-44 xl:h-48 2xl:h-48 3xl:h-52 4xl:h-60 5xl:h-80">
        {photo ? (
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[#ECE7E0]" />
        )}

        {/* Fine torn-paper edge: white body tears UP into the photo (solid bottom, raggedy top;
            -bottom-px kills the seam). preserveAspectRatio="none" stretches it to the card width. */}
        <RaggedyEdge
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-px block w-full h-4 xl:h-5 2xl:h-5 3xl:h-6 4xl:h-7 5xl:h-8"
        />

        {/* Distance pill, floating at the photo's bottom-right, clearing the tear.
            Text uses brand-brown to match the travel icons' baked stroke. */}
        <div className="absolute right-2 xl:right-2.5 3xl:right-3 5xl:right-4 bottom-5 xl:bottom-6 2xl:bottom-6 3xl:bottom-7 4xl:bottom-8 5xl:bottom-10 z-10 rounded-full bg-white shadow px-2 py-0.5 font-medium text-brand-brown text-[9px] xl:text-[10px] 2xl:text-[10px] 3xl:text-[11px] 4xl:text-xs 5xl:text-sm">
          {distance ?? '200 m'}
        </div>
      </div>

      {/* Body (extra bottom padding so the card reads longer on the y axis) */}
      <div className="px-3.5 pt-2.5 pb-6 xl:px-4 xl:pt-3 xl:pb-7 2xl:pb-7 3xl:px-5 3xl:pt-4 3xl:pb-9 4xl:pb-10 5xl:px-6 5xl:pt-5 5xl:pb-12">
        <h3 className="font-semibold leading-tight text-on-light-black text-base xl:text-lg 2xl:text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-3xl">
          {location.name}
        </h3>
        <p className="mt-2 3xl:mt-2.5 leading-snug text-on-light-grey text-[10px] xl:text-[10px] 2xl:text-[11px] 3xl:text-xs 4xl:text-xs 5xl:text-sm">
          {blurb ?? PLACEHOLDER_BLURB}
        </p>

        {/* Travel row: walk / bike / car / transit, icon above its time */}
        <div className="mt-3.5 grid grid-cols-4 gap-1.5 3xl:gap-2 pt-3 3xl:pt-4">
          {TRAVEL_MODES.map(({ key, Icon }) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <Icon
                aria-hidden="true"
                className="w-auto h-4 xl:h-5 2xl:h-5 3xl:h-6 4xl:h-7 5xl:h-8"
              />
              <span className="text-on-light-black text-[9px] xl:text-[10px] 2xl:text-[10px] 3xl:text-[11px] 4xl:text-xs 5xl:text-sm">
                {times ? times[key] : '--'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LocationCard
