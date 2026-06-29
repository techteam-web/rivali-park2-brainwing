import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import UnitArtboard from '../components/unitplan/UnitArtboard'
import UnitHeader from '../components/unitplan/UnitHeader'
import Dropdown from '../components/unitplan/Dropdown'
import PlanLightbox from '../components/unitplan/PlanLightbox'
import CourtyardView from '../components/unitplan/CourtyardView'
import {
  TOWER_TABS,
  POSSESSION_SHORT,
  fmtSqft,
  fmtBalcony,
  findUnit,
  towerUnits,
  towerLabel,
  towerBg,
  towerTint,
} from '../data/unitPlans'
import { gsap } from '../lib/gsap'
import { usePageTransition } from '../hooks/usePageTransition'

const MAX_COLUMNS = 3
const DEFAULT_TOWER = 'skyleap'

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

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
  const [params] = useSearchParams()
  const pageRef = useRef(null)
  const { exitTo } = usePageTransition({ containerRef: pageRef })
  const fromTower = towerUnits(params.get('tower')).length
    ? params.get('tower')
    : DEFAULT_TOWER
  const from = findUnit(fromTower, params.get('from'))?.n ?? 1
  // Preserve the flow's original entry point (e.g. 'towers') so leaving compare
  // → unit detail → unit-plans still knows where to send the user back.
  const origin = params.get('origin')

  const [columns, setColumns] = useState(() => [
    makeColumn(fromTower, from),
    makeColumn(fromTower, from === 1 ? 2 : 1),
  ])
  const [zoom, setZoom] = useState(null)
  const [courtyard, setCourtyard] = useState(null)

  // Per-card DOM nodes + the set of cards already animated in, so only freshly
  // added cards play the entrance (the initial pair rides the page transition).
  const cardEls = useRef({})
  const seenIds = useRef(null)
  if (seenIds.current === null) {
    seenIds.current = new Set(columns.map((c) => c.id))
  }

  // Animate any newly added card up + into view.
  useEffect(() => {
    if (reduceMotion()) {
      columns.forEach((c) => seenIds.current.add(c.id))
      return
    }
    columns.forEach((c) => {
      if (seenIds.current.has(c.id)) return
      seenIds.current.add(c.id)
      const el = cardEls.current[c.id]
      if (!el) return
      gsap.fromTo(
        el,
        { autoAlpha: 0, scale: 0.9, y: 24 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      )
    })
  }, [columns])

  // Return to the unit the comparison was launched from (the ?tower=&from=
  // params), not whatever the first card was later changed to.
  const goBack = () =>
    exitTo(`/unit-plans/${fromTower}/${from}${origin ? `?origin=${origin}` : ''}`)

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
  // Comparing needs at least two plans, so closing down to a single card has
  // nothing left to compare — return to the unit's detail page instead of
  // stranding a lone compare card. Otherwise animate the card out, then drop it.
  const removeColumn = (id) => {
    if (columns.length <= 2) {
      goBack()
      return
    }
    const drop = () => {
      delete cardEls.current[id]
      seenIds.current.delete(id)
      setColumns((cols) => cols.filter((c) => c.id !== id))
    }
    const el = cardEls.current[id]
    if (!el || reduceMotion()) {
      drop()
      return
    }
    gsap.to(el, {
      autoAlpha: 0,
      scale: 0.9,
      y: 16,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: drop,
    })
  }
  const addColumn = () =>
    setColumns((cols) =>
      cols.length >= MAX_COLUMNS ? cols : [...cols, makeColumn(DEFAULT_TOWER, 1)],
    )

  return (
    <>
      <div ref={pageRef} className="h-full w-full">
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

        <div className="absolute inset-x-8 top-22.5 bottom-0 flex items-center gap-8">
          {columns.map((col, idx) => {
            const unit = findUnit(col.tower, col.unit)
            return (
              <div
                key={col.id}
                ref={(el) => {
                  if (el) cardEls.current[col.id] = el
                }}
                className="relative flex-1"
              >
                <div
                  className="flex w-full flex-col overflow-hidden rounded"
                  style={{ backgroundColor: towerTint(col.tower) }}
                >
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

                {/* Full plan — natural height so the whole sheet is visible */}
                <div className="relative">
                  <img
                    src={unit.image}
                    alt={`${towerLabel(col.tower)} unit ${unit.n} floor plan`}
                    className="block h-auto w-full"
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
                    className="absolute right-4 top-4 transition-[opacity,transform] hover:opacity-80 active:scale-95"
                  >
                    <img
                      src="/unit/svgs/expand icon.svg"
                      alt=""
                      className="h-15 w-15"
                    />
                  </button>
                </div>

                {/* Courtyard view — opens the fullscreen view for this card's
                    selected unit. */}
                <button
                  type="button"
                  onClick={() =>
                    setCourtyard({
                      title: `View From ${towerLabel(col.tower)} ${unit.bhk}BHK (${fmtSqft(unit.carpet)} Sq. Ft.)`,
                      position: col.tower === 'stargaze' ? unit.n : null,
                    })
                  }
                  className="flex items-center gap-2 px-6 py-5 transition-[opacity,transform] hover:opacity-80 active:scale-[0.98]"
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
                    non-clipping wrapper). Shown on every card except the first
                    (the launch unit); closing the second card returns to the
                    unit's detail page since one plan can't be compared. */}
                {idx > 0 && (
                  <button
                    type="button"
                    aria-label="Remove from comparison"
                    onClick={() => removeColumn(col.id)}
                    className="absolute -right-3 -top-3 z-10 h-10 w-10 transition-transform hover:scale-110 active:scale-95"
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
              className="h-16.25 w-16.25 shrink-0 self-center transition-[opacity,transform] hover:opacity-70 hover:scale-105 active:scale-95"
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
      </div>

      {zoom && (
        <PlanLightbox
          src={zoom.src}
          title={zoom.title}
          bg={zoom.bg}
          onClose={() => setZoom(null)}
        />
      )}

      {courtyard && (
        <CourtyardView
          title={courtyard.title}
          position={courtyard.position}
          onClose={() => setCourtyard(null)}
        />
      )}
    </>
  )
}

export default UnitPlanCompare
