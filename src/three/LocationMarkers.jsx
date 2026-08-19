import { useEffect, useMemo, useState } from 'react'
import { Html } from '@react-three/drei'
import { getCategoryLocations } from '../components/locations/locationsData'
import { getLocationPath } from '../components/locations/locationsPaths'
import { locationsConfig } from './locationsConfig'
import RouteMarker from '../assets/locations/svgs/route-marker.svg?react'

// Standing pins for the OTHER locations in the open category, shown once one of them
// is selected. Without these the map empties out the moment you pick a place: the
// unselected routes retract and take their pins with them, so the only way to reach a
// second location is to reopen the list. These put every other destination back on the
// map as a direct click target.
//
// They are deliberately NOT the same thing as RouteCurve's pin. That one belongs to a
// drawn route and is inert (pointerEvents: 'none') so it can never block an orbit drag.
// These carry the interaction, and are drawn smaller and softer so the selected route's
// own pin still reads as the primary one.
//
// The reveal is CSS, not GSAP, on purpose. These render inside drei's <Html> portal,
// whose container is built in the parent's layout effect — so a ref on this subtree is
// still null when a mount effect here runs, and a GSAP tween keyed off that ref silently
// never starts (it leaves the pin stuck at its from-state). A transition on a state flag
// has no such ordering to lose. Only opacity/transform are transitioned, never `all`.
//
// Mounted at Canvas root next to RouteLayer. Locations with no captured path have no
// end point to stand on, so they are skipped -- the same rule RouteLayer applies.
const r = locationsConfig.route

// Fraction of the selected pin's size. Keeps the hierarchy obvious at a glance.
const IDLE_SCALE = 0.72
const IDLE_OPACITY = 0.62
// Long enough for the retracting routes' own pins to finish fading out (0.3s), so a
// pin never appears to be sitting in two states at the same spot.
const APPEAR_DELAY_MS = 380

function Marker({ location, onSelect }) {
  const [shown, setShown] = useState(false)
  const [hovered, setHovered] = useState(false)

  const end = useMemo(() => {
    const points = getLocationPath(location.id)
    if (!points || !points.length) return null
    return points[points.length - 1]
  }, [location.id])

  useEffect(() => {
    const t = setTimeout(() => setShown(true), APPEAR_DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  if (!end) return null

  const scale = shown ? (hovered ? 1 : IDLE_SCALE) : IDLE_SCALE * 0.6
  const opacity = shown ? (hovered ? 1 : IDLE_OPACITY) : 0

  return (
    <Html
      position={[end[0], end[1] + r.markerYOffset, end[2]]}
      zIndexRange={[30, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div style={{ transform: 'translate(-50%, -100%)' }}>
        <button
          type="button"
          // The page-level outside-click handler closes the open category on any
          // pointerdown outside the nav bar. This attribute is how it recognises a
          // marker press and leaves the category alone (see LocationsView).
          data-location-marker
          aria-label={location.name}
          onClick={() => onSelect(location.id)}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          style={{
            // Inert until it has actually faded in, so an invisible pin is never
            // clickable.
            pointerEvents: shown ? 'auto' : 'none',
            cursor: 'pointer',
            border: 0,
            padding: 0,
            background: 'transparent',
            display: 'block',
            position: 'relative', // anchors the hover label below, not drei's Html wrapper
          }}
        >
          <div
            style={{
              width: r.markerWidthPx,
              transformOrigin: 'bottom center',
              transform: `scale(${scale})`,
              opacity,
              transition:
                'opacity 320ms ease, transform 320ms cubic-bezier(0.34, 1.3, 0.64, 1)',
            }}
          >
            <RouteMarker style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
          {/* Name only on hover: a permanent label per pin would clutter the map. */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '100%',
              transform: 'translate(-50%, 6px)',
              whiteSpace: 'nowrap',
              padding: '4px 9px',
              borderRadius: 2,
              background: 'rgba(255,255,255,0.94)',
              color: '#4d4d4d',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              opacity: hovered && shown ? 1 : 0,
              transition: 'opacity 180ms ease',
              pointerEvents: 'none',
            }}
          >
            {location.name}
          </div>
        </button>
      </div>
    </Html>
  )
}

export default function LocationMarkers({ category, selectedLocationId, onSelect }) {
  // Nothing selected means every route is already drawn with its own pin, so there is
  // nothing for this layer to add. It only earns its place once the set has collapsed
  // to a single route.
  if (!category || !selectedLocationId) return null

  const others = getCategoryLocations(category).filter(
    (l) => l.id !== selectedLocationId && getLocationPath(l.id) != null,
  )
  if (!others.length) return null

  return others.map((l) => <Marker key={l.id} location={l} onSelect={onSelect} />)
}
