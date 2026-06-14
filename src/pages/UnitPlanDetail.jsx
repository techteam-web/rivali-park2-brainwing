import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import UnitArtboard from '../components/unitplan/UnitArtboard'
import UnitHeader from '../components/unitplan/UnitHeader'
import UnitSelect from '../components/unitplan/UnitSelect'
import PlanLightbox from '../components/unitplan/PlanLightbox'
import {
  POSSESSION,
  fmtSqft,
  fmtBalcony,
  findUnit,
  towerLabel,
  towerBg,
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
  const unit = findUnit(tower, n)
  const label = towerLabel(tower)
  const [zoomed, setZoomed] = useState(false)

  // Bad/stale tower or unit number → bounce back to the floor-plan selector.
  if (!unit) {
    navigate('/unit-plans', { replace: true })
    return null
  }

  return (
    <>
      <UnitArtboard>
        <UnitHeader onBack={() => navigate('/unit-plans')}>
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

        {/* Plan + info sit flush inside one rounded card (no gap). */}
        <div className="absolute inset-x-10 top-32.5 bottom-15 flex overflow-hidden rounded-sm">
          {/* Plan sheet */}
          <div className="relative flex-1">
            <img
              src={unit.image}
              alt={`${label} unit ${unit.n} floor plan`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              aria-label="View plan fullscreen"
              onClick={() => setZoomed(true)}
              className="absolute right-4 top-4 transition-opacity hover:opacity-80"
            >
              <img
                src="/unit/svgs/expand icon.svg"
                alt=""
                className="h-15 w-15"
              />
            </button>
          </div>

          {/* Info panel */}
          <div className="flex w-110 flex-col bg-[#F4F3F0] p-6">
            <UnitSelect
              tower={tower}
              value={unit.n}
              onChange={(next) => navigate(`/unit-plans/${tower}/${next}`)}
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

              {/* STUB — courtyard view link is non-functional until the 360
                  views are wired up. */}
              <button
                type="button"
                className="flex items-center gap-2"
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
                navigate(`/unit-plans/compare?tower=${tower}&from=${unit.n}`)
              }
              className="mt-auto w-full border border-on-light-black py-4 uppercase transition-colors hover:bg-on-light-black hover:text-white"
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

      {zoomed && (
        <PlanLightbox
          src={unit.image}
          alt={`${label} unit ${unit.n} floor plan`}
          title={`${label} Unit Plan`}
          bg={towerBg(tower)}
          onClose={() => setZoomed(false)}
        />
      )}
    </>
  )
}

export default UnitPlanDetail
