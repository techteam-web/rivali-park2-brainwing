import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import UnitArtboard from '../components/unitplan/UnitArtboard'
import UnitHeader from '../components/unitplan/UnitHeader'
import PageNav from '../components/layout/PageNav'
import UnitSelect from '../components/unitplan/UnitSelect'
import PlanLightbox from '../components/unitplan/PlanLightbox'
import CourtyardView from '../components/unitplan/CourtyardView'
import StargazeOverlay from '../components/unitplan/StargazeOverlay'
import UnitFootprints from '../components/unitplan/UnitFootprints'
import { gsap } from '../lib/gsap'
import { usePageTransition } from '../hooks/usePageTransition'
import {
  fmtSqft,
  fmtBalcony,
  fmtTotalArea,
  findUnit,
  towerLabel,
  towerBg,
  towerTint,
  towerPlan,
  OVERLAY_TOWER,
  PLAN_W,
  PLAN_H,
  STARGAZE_OVERLAY,
  STARGAZE_OVERLAY_VB,
  UNIT_SHEET_VB,
  towerFootprints,
} from '../data/unitPlans'

const labelStyle = {
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 400,
  fontSize: 13,
  letterSpacing: '0.12em',
  color: '#9A9A9A',
}

const valueStyle = {
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 600,
  fontSize: 22,
  color: '#313131',
}

// Unit detail sheet (Figma "Unit Plans" detail). The exported Stargaze sheet is
// a full self-contained marketing page (title/carpet/balcony/compass/logo baked
// in), so it fills the left panel; the right panel mirrors the key specs and
// adds the possession date, courtyard-view link, and the compare action.
const UnitPlanDetail = () => {
  const { tower, n } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Carried from the unit-plan selector so back/compare keep the original
  // entry point (e.g. 'towers') intact through the flow.
  const origin = searchParams.get('origin')
  const originSuffix = origin ? `&origin=${origin}` : ''
  // Floor chosen back on the tower's elevation drawing. Drives which panorama
  // "View from apartment" opens on, and rides along to compare so both sides
  // of a comparison show the same floor.
  const floorParam = Number(searchParams.get('floor'))
  const selectedFloor = Number.isFinite(floorParam) && floorParam > 0 ? floorParam : null
  const floorSuffix = selectedFloor ? `&floor=${selectedFloor}` : ''

  // Query carried onto sibling routes (back to the selector, unit switching).
  const carry = [
    origin ? `origin=${origin}` : null,
    selectedFloor ? `floor=${selectedFloor}` : null,
  ]
    .filter(Boolean)
    .join('&')
  const carrySuffix = carry ? `?${carry}` : ''
  const pageRef = useRef(null)
  const { exitTo } = usePageTransition({ containerRef: pageRef })
  // Card is gently crossfaded when switching unit within the same tower (a
  // same-route param change, so the page itself doesn't re-transition).
  const cardRef = useRef(null)
  const firstUnitRef = useRef(true)
  const unit = findUnit(tower, n)
  const label = towerLabel(tower)
  const [zoomed, setZoomed] = useState(false)
  const [courtyardOpen, setCourtyardOpen] = useState(false)

  useEffect(() => {
    if (firstUnitRef.current) {
      firstUnitRef.current = false
      return
    }
    const el = cardRef.current
    if (
      !el ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    )
      return
    gsap.fromTo(
      el,
      { autoAlpha: 0, filter: 'blur(6px)' },
      { autoAlpha: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' },
    )
  }, [n])

  // Bad/stale tower or unit number → bounce back to the floor-plan selector.
  //
  // Declaratively, via <Navigate>: calling navigate() during render is a no-op
  // in React Router (it only warns), so the guard used to render null and leave
  // the user on a permanently blank page at the bad URL.
  if (!unit) {
    return (
      <Navigate
        to={`/unit-plans?tower=${tower}${originSuffix}${floorSuffix}`}
        replace
      />
    )
  }

  return (
    <>
      <div ref={pageRef} className="relative h-full w-full">
      {/* Sibling of the artboard so the buttons keep real viewport pixels. */}
      <PageNav
        onBack={() => exitTo(`/unit-plans?tower=${tower}${originSuffix}${floorSuffix}`)}
        onHome={() => exitTo('/')}
      />
      <UnitArtboard>
        <UnitHeader>
          <h1
            className="whitespace-nowrap uppercase"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: '0.08em',
              color: '#313131',
            }}
          >
            {label} {unit.bhk} BHK ({fmtSqft(unit.carpet)} Sq. Ft.)
          </h1>
        </UnitHeader>

        {/* Plan + info sit flush inside one rounded card (no gap). Card height
            follows the plan sheet's natural height so the whole plan shows;
            a centered max-width keeps it clear of the screen edges and bottom
            on wide screens (the plan's fixed aspect ratio means capping the
            width caps the height too). */}
        <div
          ref={cardRef}
          className="absolute left-1/2 top-1/2 flex w-[calc(100%-5rem)] max-w-350 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-sm"
        >
          {/* Plan sheet */}
          <div className="relative flex-1">
            <img
              src={unit.image}
              alt={`${label} unit ${unit.n} floor plan`}
              className="block h-auto w-full"
            />
            <button
              type="button"
              aria-label="View plan fullscreen"
              onClick={() => setZoomed(true)}
              className="absolute right-4 top-4 cursor-pointer transition-[opacity,transform] hover:opacity-80 active:scale-95"
            >
              <img
                src="/unit/svgs/expand icon.svg"
                alt=""
                className="h-15 w-15"
              />
            </button>
          </div>

          {/* Info panel */}
          <div
            className="flex w-110 flex-col p-6"
            style={{ backgroundColor: towerTint(tower) }}
          >
            <UnitSelect
              tower={tower}
              value={unit.n}
              onChange={(next) =>
                navigate(
                  `/unit-plans/${tower}/${next}${carrySuffix}`,
                )
              }
            />

            <div className="mt-8 space-y-6">
              <div className="flex gap-12">
                <div>
                  <p className="uppercase" style={labelStyle}>
                    Balcony
                  </p>
                  <p className="mt-1" style={valueStyle}>
                    {fmtBalcony(unit)}
                  </p>
                </div>

                <div>
                  <p className="uppercase" style={labelStyle}>
                    Total Area
                  </p>
                  <p className="mt-1" style={valueStyle}>
                    {fmtTotalArea(unit)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCourtyardOpen(true)}
                className="flex cursor-pointer items-center gap-2 transition-[opacity,transform] hover:opacity-80 active:scale-95"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  fontSize: 17,
                  color: '#7A4833',
                }}
              >
                <img src="/unit/svgs/view.svg" alt="" className="h-5 w-5" />
                View from apartment
                <img
                  src="/unit/svgs/arrow_forward.svg"
                  alt=""
                  className="h-3.5 w-3.5"
                />
              </button>
            </div>

            {/* Locator plan: the tower's whole-floor plate with just this
                unit's footprint highlighted, so the user can see where it
                sits on the floor. Reuses the same plan image + hand-tuned
                overlay placement as the floor-plan selector (UnitPlans),
                just shown non-interactively and filtered to one shape. */}
            {(tower === OVERLAY_TOWER || towerFootprints(tower)) && (
              <div className="mt-6 flex min-h-0 flex-1 items-center justify-center">
                <div
                  className="relative w-full"
                  style={{ aspectRatio: `${PLAN_W} / ${PLAN_H}` }}
                >
                  <img
                    src={towerPlan(tower)}
                    alt={`${label} floor plan`}
                    className="h-full w-full object-contain"
                  />
                  {tower === OVERLAY_TOWER ? (
                    <div
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${STARGAZE_OVERLAY.left}%`,
                        top: `${STARGAZE_OVERLAY.top}%`,
                        width: `${STARGAZE_OVERLAY.width}%`,
                        aspectRatio: `${STARGAZE_OVERLAY_VB.w} / ${STARGAZE_OVERLAY_VB.h}`,
                      }}
                    >
                      <StargazeOverlay highlightOnly={unit.n} />
                    </div>
                  ) : (
                    <div
                      className="pointer-events-none absolute left-1/2 top-1/2 h-full -translate-x-1/2 -translate-y-1/2"
                      style={{
                        aspectRatio: `${UNIT_SHEET_VB.w} / ${UNIT_SHEET_VB.h}`,
                      }}
                    >
                      <UnitFootprints tower={tower} highlightOnly={unit.n} />
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                exitTo(
                  `/unit-plans/compare?tower=${tower}&from=${unit.n}${originSuffix}${floorSuffix}`,
                )
              }
              className="mt-auto w-full cursor-pointer border border-on-light-black py-4 uppercase transition-[background-color,color,transform] hover:bg-on-light-black hover:text-white active:scale-[0.98]"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                fontSize: 15,
                letterSpacing: '0.15em',
              }}
            >
              Compare
            </button>
          </div>
        </div>
      </UnitArtboard>
      </div>

      {/* Home from an overlay navigates directly rather than going through the
          page's exitTo: the overlay runs its own exit first, so chaining the
          page's exit on top played a second fade with the sheet underneath
          flashing back to full opacity in between. */}
      {zoomed && (
        <PlanLightbox
          src={unit.image}
          alt={`${label} unit ${unit.n} floor plan`}
          title={`${label} Unit Plan`}
          bg={towerBg(tower)}
          onClose={() => setZoomed(false)}
          onHome={() => navigate('/')}
        />
      )}

      {courtyardOpen && (
        <CourtyardView
          title={`View From ${label} ${unit.bhk}BHK (${fmtSqft(unit.carpet)} Sq. Ft.)`}
          tower={tower}
          position={unit.n}
          initialFloor={selectedFloor}
          onClose={() => setCourtyardOpen(false)}
          onHome={() => navigate('/')}
        />
      )}
    </>
  )
}

export default UnitPlanDetail
