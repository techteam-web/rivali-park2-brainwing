import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import UnitArtboard from '../components/unitplan/UnitArtboard'
import UnitHeader from '../components/unitplan/UnitHeader'
import Dropdown from '../components/unitplan/Dropdown'
import PlanLightbox from '../components/unitplan/PlanLightbox'
import {
  TOWER_TABS,
  POSSESSION_SHORT,
  fmtSqft,
  fmtBalcony,
  findUnit,
  towerUnits,
  towerLabel,
  towerBg,
} from '../data/unitPlans'

const MAX_COLUMNS = 3
const DEFAULT_TOWER = 'skyleap'

// Tower options mirror the floor-plan tabs: towers without assets (Sunburst)
// render as disabled rows until their plans land.
const TOWER_OPTIONS = TOWER_TABS.map((t) => ({
  value: t.id,
  label: t.label,
  disabled: !t.plan,
}))

// Unit dropdown options depend on the column's selected tower.
const unitOptions = (tower) =>
  towerUnits(tower).map((u) => ({
    value: u.n,
    label: `${u.bhk} BHK - ${fmtSqft(u.carpet)} Sq Ft`,
  }))

// Stable ids so removing a column doesn't reshuffle React keys.
let nextColumnId = 0
const makeColumn = (tower, unit) => ({ id: nextColumnId++, tower, unit })

const Spec = ({ label, value }) => (
  <div>
    <p
      className="uppercase"
      style={{
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 400,
        fontSize: 12,
        letterSpacing: '0.12em',
        color: '#9A9A9A',
      }}
    >
      {label}
    </p>
    <p
      className="mt-1"
      style={{
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 600,
        fontSize: 20,
        color: '#313131',
      }}
    >
      {value}
    </p>
  </div>
)

// Compare view — units side by side as cards (tower + unit dropdowns,
// balcony/possession, full-bleed plan, courtyard-view link). The first card is
// seeded from the ?tower=<id>&from=<n> unit; extra cards can be added (up to
// MAX_COLUMNS) or removed. Towers and units can be mixed freely, so plans from
// different towers can be compared against each other.
const UnitPlanCompare = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const fromTower = towerUnits(params.get('tower')).length
    ? params.get('tower')
    : DEFAULT_TOWER
  const from = findUnit(fromTower, params.get('from'))?.n ?? 1

  const [columns, setColumns] = useState(() => [
    makeColumn(fromTower, from),
    makeColumn(fromTower, from === 1 ? 2 : 1),
  ])
  const [zoom, setZoom] = useState(null)

  // Return to the unit the comparison was launched from.
  const goBack = () =>
    navigate(`/unit-plans/${columns[0].tower}/${columns[0].unit}`)

  const setUnit = (id, unit) =>
    setColumns((cols) => cols.map((c) => (c.id === id ? { ...c, unit } : c)))
  // Switching tower keeps the current unit number when that tower has it,
  // otherwise falls back to the tower's first unit (towers vary in unit count).
  const setTower = (id, tower) =>
    setColumns((cols) =>
      cols.map((c) => {
        if (c.id !== id) return c
        const unit = findUnit(tower, c.unit)
          ? c.unit
          : towerUnits(tower)[0]?.n ?? 1
        return { ...c, tower, unit }
      }),
    )
  // Closing the last remaining card leaves nothing to compare, so go back to
  // the previous page rather than stranding a single plan.
  const removeColumn = (id) => {
    if (columns.length === 1) {
      goBack()
      return
    }
    setColumns((cols) => cols.filter((c) => c.id !== id))
  }
  const addColumn = () =>
    setColumns((cols) =>
      cols.length >= MAX_COLUMNS ? cols : [...cols, makeColumn(DEFAULT_TOWER, 1)],
    )

  return (
    <>
      <UnitArtboard>
        <UnitHeader onBack={goBack}>
          <h1
            className="whitespace-nowrap capitalize"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              fontSize: 24,
              letterSpacing: '0.12em',
              color: '#313131',
            }}
          >
            Compare Unit Plans
          </h1>
        </UnitHeader>

        <div className="absolute inset-x-8 top-35.25 bottom-7.25 flex items-stretch gap-8">
          {columns.map((col, idx) => {
            const unit = findUnit(col.tower, col.unit)
            return (
              <div key={col.id} className="relative flex-1">
                <div className="flex h-full w-full flex-col overflow-hidden rounded bg-[#F4F7F2]">
                {/* Selectors + specs */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex gap-3">
                    <Dropdown
                      value={col.tower}
                      options={TOWER_OPTIONS}
                      onChange={(v) => setTower(col.id, v)}
                      className="w-[42%]"
                    />
                    <Dropdown
                      value={col.unit}
                      options={unitOptions(col.tower)}
                      onChange={(v) => setUnit(col.id, v)}
                      className="flex-1"
                    />
                  </div>

                  <div className="mt-6 flex gap-12">
                    <Spec label="Balcony" value={fmtBalcony(unit)} />
                    <Spec
                      label="Expected Possession"
                      value={POSSESSION_SHORT}
                    />
                  </div>
                </div>

                {/* Full-bleed plan */}
                <div className="relative flex-1">
                  <img
                    src={unit.image}
                    alt={`${towerLabel(col.tower)} unit ${unit.n} floor plan`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label="View plan fullscreen"
                    onClick={() =>
                      setZoom({
                        src: unit.image,
                        title: `${towerLabel(col.tower)} Unit Plan`,
                        bg: towerBg(col.tower),
                      })
                    }
                    className="absolute right-4 top-4 transition-opacity hover:opacity-80"
                  >
                    <img
                      src="/unit/svgs/expand icon.svg"
                      alt=""
                      className="h-15 w-15"
                    />
                  </button>
                </div>

                {/* Courtyard view (STUB — non-functional until 360 views land) */}
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-5"
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

                {/* Pinned to the card's top-right corner, clear of the
                    dropdowns (the card itself clips, so this lives on the
                    non-clipping wrapper). Shown on added cards, and on the sole
                    remaining card (where closing returns to the previous page). */}
                {(idx > 0 || columns.length === 1) && (
                  <button
                    type="button"
                    aria-label="Remove from comparison"
                    onClick={() => removeColumn(col.id)}
                    className="absolute -right-3 -top-3 z-10 h-10 w-10 transition-transform hover:scale-105"
                  >
                    <img
                      src="/unit/svgs/Close.svg"
                      alt=""
                      className="h-full w-full"
                    />
                  </button>
                )}
              </div>
            )
          })}

          {columns.length < MAX_COLUMNS && (
            <button
              type="button"
              aria-label="Add a unit to compare"
              onClick={addColumn}
              className="h-16.25 w-16.25 shrink-0 self-center transition-opacity hover:opacity-70"
            >
              <img
                src="/unit/svgs/plus svg.svg"
                alt=""
                className="h-full w-full"
              />
            </button>
          )}
        </div>
      </UnitArtboard>

      {zoom && (
        <PlanLightbox
          src={zoom.src}
          title={zoom.title}
          bg={zoom.bg}
          onClose={() => setZoom(null)}
        />
      )}
    </>
  )
}

export default UnitPlanCompare
