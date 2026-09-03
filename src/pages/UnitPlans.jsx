import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import UnitArtboard from '../components/unitplan/UnitArtboard'
import UnitHeader from '../components/unitplan/UnitHeader'
import PageNav from '../components/layout/PageNav'
import StargazeOverlay from '../components/unitplan/StargazeOverlay'
import UnitFootprints from '../components/unitplan/UnitFootprints'
import {
  STARGAZE_OVERLAY_VB,
  STARGAZE_OVERLAY,
  OVERLAY_TOWER,
  PLAN_W,
  PLAN_H,
  TOWER_TABS,
  UNIT_SHEET_VB,
  towerFootprints,
} from '../data/unitPlans'
import { gsap } from '../lib/gsap'
import { usePageTransition } from '../hooks/usePageTransition'

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Wheel zoom never shrinks below the original size (min 1), so "zoom out" just
// returns to the base view rather than making the plan smaller.
const MIN_ZOOM = 1
const MAX_ZOOM = 2.5

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

// Floor-plan selector (Figma "Unit Plans"). The exported sheet is a
// self-contained landscape page (its own title/compass/logo baked in), so it
// just needs a centered, aspect-correct box below the header. Stargaze overlays
// clickable unit footprints on top; clicking one opens that unit's detail sheet.
// Scrolling over the plan zooms toward the cursor (image + overlay scale
// together so they stay aligned); leaving the plan resets to the base view.
const UnitPlans = () => {
  // Tower lives in the URL (?tower=) so returning from a unit's detail sheet
  // lands back on the tower it was opened from instead of resetting to Skyleap.
  const [searchParams] = useSearchParams()
  const [activeTower] = useState(() => {
    const t = searchParams.get('tower')
    return TOWER_TABS.some((x) => x.id === t) ? t : 'skyleap'
  })
  // Where the user entered the unit-plan flow from (e.g. 'towers'). Threaded
  // through detail/compare so the back button returns to the right place
  // instead of falling through to the homepage.
  const entryOrigin = searchParams.get('origin')
  // Floor picked on the tower's elevation drawing, carried the whole way to the
  // apartment view so it opens on that floor rather than the first available.
  const entryFloor = searchParams.get('floor')

  // Query string shared by every onward link out of this page.
  const carry = [
    entryOrigin ? `origin=${entryOrigin}` : null,
    entryFloor ? `floor=${entryFloor}` : null,
  ]
    .filter(Boolean)
    .join('&')
  const carrySuffix = carry ? `?${carry}` : ''
  const [zoom, setZoom] = useState(1)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const planRef = useRef(null)
  // Page-level enter/exit transition (matches the gallery feel).
  const pageRef = useRef(null)
  const { exitTo } = usePageTransition({ containerRef: pageRef })
  // Floor-plan layer — crossfaded on tower switch (skipping first mount, which
  // the page entrance already covers).
  const planLayerRef = useRef(null)
  const firstPlanRef = useRef(true)

  const current =
    TOWER_TABS.find((t) => t.id === activeTower) ??
    TOWER_TABS.find((t) => t.id === 'skyleap')

  const hasPlan = Boolean(current.plan)
  const hasOverlay = current.id === OVERLAY_TOWER
  const footprints = towerFootprints(current.id)

  // Wheel-to-zoom via a native non-passive listener so we can stop the page
  // scrolling. Clamped so zoom-out never shrinks the plan below its base size.
  useEffect(() => {
    const el = planRef.current
    if (!el || !hasPlan) return
    const onWheel = (e) => {
      e.preventDefault()
      setZoom((z) => clamp(z - e.deltaY * 0.0025, MIN_ZOOM, MAX_ZOOM))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [hasPlan])

  // Elegant tower switch: gently crossfade the new floor plan (+ overlay) in
  // from a soft blur instead of hard-swapping the image.
  useEffect(() => {
    if (firstPlanRef.current) {
      firstPlanRef.current = false
      return
    }
    const el = planLayerRef.current
    if (!el || reduceMotion()) return
    gsap.fromTo(
      el,
      { autoAlpha: 0, filter: 'blur(7px)' },
      { autoAlpha: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power2.out' },
    )
  }, [activeTower])

  // Zoom focuses on the cursor: track its position as a % of the plan box.
  const handlePlanMove = (e) => {
    const r = planRef.current?.getBoundingClientRect()
    if (!r) return
    setOrigin({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    })
  }
  const resetZoom = () => {
    setZoom(1)
    setOrigin({ x: 50, y: 50 })
  }


  return (
    <div ref={pageRef} className="relative h-full w-full">
    {/* Outside <UnitArtboard> on purpose: the artboard's scale transform would
        rescale these offsets and drift the buttons off the shared position. */}
    <PageNav
      onBack={() =>
        exitTo(
          entryOrigin === 'towers'
            ? // Came in through the elevation floor picker? Go back to it,
              // not past it to the tower detail.
              `/towers?tower=${activeTower}${entryFloor ? '&view=floors' : ''}`
            : '/',
        )
      }
      onHome={() => exitTo('/')}
    />
    <UnitArtboard>
      <UnitHeader />

      {/* Courtyard / external facing labels + floor plan */}
      <p
        className="absolute left-1/2 top-40 -translate-x-1/2 uppercase"
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: '0.12em',
          color: '#7A4833',
        }}
      >
        Courtyard Facing
      </p>

      <div
        ref={planRef}
        onMouseMove={hasPlan ? handlePlanMove : undefined}
        onMouseLeave={hasPlan ? resetZoom : undefined}
        className={`absolute left-1/2 -translate-x-1/2 overflow-hidden ${
          hasPlan ? 'cursor-zoom-in' : ''
        }`}
        style={{ top: 200, width: PLAN_W, height: PLAN_H }}
      >
        {current.plan ? (
          // Zoom layer: image + overlay scale together so the overlay stays
          // pinned to the plan at any zoom level.
          <div
            ref={planLayerRef}
            className="relative h-full w-full transition-transform duration-100 ease-out"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
          >
            <img
              src={current.plan}
              alt={`${current.label} floor plan`}
              className="h-full w-full object-contain"
            />

            {hasOverlay && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${STARGAZE_OVERLAY.left}%`,
                  top: `${STARGAZE_OVERLAY.top}%`,
                  width: `${STARGAZE_OVERLAY.width}%`,
                  aspectRatio: `${STARGAZE_OVERLAY_VB.w} / ${STARGAZE_OVERLAY_VB.h}`,
                }}
              >
                <StargazeOverlay
                  onSelect={(n) =>
                    exitTo(`/unit-plans/${current.id}/${n}${carrySuffix}`)
                  }
                />
              </div>
            )}

            {/* Full-sheet footprint overlay. The plan image is object-contain
                inside a wider box, so it renders at full height with the
                sheet's own aspect ratio — which is exactly the contained
                image's box. No offsets to keep in sync. */}
            {footprints && (
              <div
                className="absolute left-1/2 top-1/2 h-full -translate-x-1/2 -translate-y-1/2"
                style={{
                  aspectRatio: `${UNIT_SHEET_VB.w} / ${UNIT_SHEET_VB.h}`,
                }}
              >
                <UnitFootprints
                  tower={current.id}
                  onSelect={(n) =>
                    exitTo(`/unit-plans/${current.id}/${n}${carrySuffix}`)
                  }
                />
              </div>
            )}
          </div>
        ) : (
          <div
            className="grid h-full w-full place-items-center uppercase"
            style={{
              fontFamily: 'Poppins, sans-serif',
              letterSpacing: '0.1em',
              color: '#666666',
            }}
          >
            {current.label} floor plan coming soon
          </div>
        )}
      </div>

      <p
        className="absolute left-1/2 bottom-10 -translate-x-1/2 uppercase"
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: '0.12em',
          color: '#7A4833',
        }}
      >
        External Facing
      </p>
    </UnitArtboard>
    </div>
  )
}

export default UnitPlans
