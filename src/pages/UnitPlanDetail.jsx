import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import UnitArtboard from '../components/unitplan/UnitArtboard'
import UnitHeader from '../components/unitplan/UnitHeader'
import UnitSelect from '../components/unitplan/UnitSelect'
import PlanLightbox from '../components/unitplan/PlanLightbox'
import CourtyardView from '../components/unitplan/CourtyardView'
import { gsap } from '../lib/gsap'
import { usePageTransition } from '../hooks/usePageTransition'
import {
  POSSESSION,
  fmtSqft,
  fmtBalcony,
  findUnit,
  towerLabel,
  towerBg,
  towerTint,
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
  if (!unit) {
    navigate(`/unit-plans?tower=${tower}${originSuffix}`, { replace: true })
    return null
  }

  return (
    <>
      <div ref={pageRef} className="h-full w-full">
      <UnitArtboard>
        <UnitHeader onBack={() => exitTo(`/unit-plans?tower=${tower}${originSuffix}`)}>
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
                  `/unit-plans/${tower}/${next}${origin ? `?origin=${origin}` : ''}`,
                )
              }
            />

            <div className="mt-8 space-y-6">
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
                  Expected Possession
                </p>
                <p className="mt-1" style={valueStyle}>
                  {POSSESSION}
                </p>
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
                Courtyard View
                <img
                  src="/unit/svgs/arrow_forward.svg"
                  alt=""
                  className="h-3.5 w-3.5"
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                exitTo(`/unit-plans/compare?tower=${tower}&from=${unit.n}${originSuffix}`)
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

      {zoomed && (
        <PlanLightbox
          src={unit.image}
          alt={`${label} unit ${unit.n} floor plan`}
          title={`${label} Unit Plan`}
          bg={towerBg(tower)}
          onClose={() => setZoomed(false)}
        />
      )}

      {courtyardOpen && (
        <CourtyardView
          title={`View From ${label} ${unit.bhk}BHK (${fmtSqft(unit.carpet)} Sq. Ft.)`}
          tower={tower}
          position={unit.n}
          onClose={() => setCourtyardOpen(false)}
        />
      )}
    </>
  )
}

export default UnitPlanDetail
