import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─────────────────────────────────────────────────────────────────────────
// FIRST-PASS / placeholder data. Assets are the 72-DPI PNG conversions of the
// Stargaze PDFs (swap for high-res/SVG later). Hotspot x/y %, possession date,
// and the Courtyard View / Compare actions are all STUBBED — tune manually.
// Only Stargaze is populated; the structure is generic so other towers slot in.
// ─────────────────────────────────────────────────────────────────────────

const POSSESSION_STUB = 'January 2027' // TODO: real per-unit/tower date

const STARGAZE_UNITS = [
  { id: 1, bhk: 2, carpet: 722, balcony: 46, image: '/unit/stargaze/unit-1.png', x: 30, y: 65 },
  { id: 2, bhk: 3, carpet: 959, balcony: 46, image: '/unit/stargaze/unit-2.png', x: 30, y: 59 },
  { id: 3, bhk: 3, carpet: 968, balcony: 46, image: '/unit/stargaze/unit-3.png', x: 50.5, y: 32 },
  { id: 4, bhk: 3, carpet: 984, balcony: 46, image: '/unit/stargaze/unit-4.png', x: 54.5, y: 32 },
  { id: 5, bhk: 3, carpet: 1066, balcony: 48, image: '/unit/stargaze/unit-5.png', x: 55, y: 38 },
  { id: 6, bhk: 2, carpet: 803, balcony: 49, image: '/unit/stargaze/unit-6.png', x: 37, y: 65 },
]

const TOWERS = [
  { id: 'skyleap', name: 'Skyleap', active: false },
  { id: 'moonrise', name: 'Moonrise', active: false },
  { id: 'stargaze', name: 'Stargaze', active: true, floorplan: '/unit/stargaze/floorplan.png', units: STARGAZE_UNITS },
  { id: 'sunburst', name: 'Sunburst', active: false },
]

const fmt = (n) => n.toLocaleString('en-US')

// ── Header with the tower tabs (floor-plan view) ──────────────────────────
const TabHeader = ({ towers, activeId, onSelect, onBack }) => (
  <header className="flex items-center px-10 pt-5 pb-2.5">
    <button
      type="button"
      onClick={onBack}
      aria-label="Go back"
      className="grid h-15 w-15 place-items-center rounded-full"
    >
      <img src="/unit/svgs/arrow-left.svg" alt="" className="h-6 w-6" />
    </button>

    <nav className="mx-auto flex items-center gap-10">
      {towers.map((t) => {
        const isActive = t.id === activeId
        return (
          <button
            key={t.id}
            type="button"
            disabled={!t.active}
            onClick={() => t.active && onSelect(t.id)}
            className={`relative uppercase ${
              isActive
                ? 'text-[17px] font-semibold tracking-[0.07em] text-on-light-black'
                : t.active
                  ? 'text-[16px] tracking-[0.1em] text-on-light-grey'
                  : 'text-[16px] tracking-[0.1em] text-on-light-grey/40 cursor-not-allowed'
            }`}
          >
            {t.name}
            {isActive && (
              <span className="absolute -bottom-2 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-[#7A4833]" />
            )}
          </button>
        )
      })}
    </nav>

    <div className="h-15 w-15" aria-hidden />
  </header>
)

// ── Floor-plan view: image + clickable unit hotspots ──────────────────────
const FloorPlanView = ({ tower, onPickUnit }) => (
  <div className="flex h-full flex-col items-center justify-center px-10 pb-6">
    <p className="mb-2 text-center text-[15px] font-semibold uppercase tracking-[0.12em] text-[#7A4833]">
      Courtyard Facing
    </p>

    <div className="relative mx-auto w-full max-w-[1100px]">
      <img src={tower.floorplan} alt={`${tower.name} floor plan`} className="w-full select-none" draggable={false} />

      {tower.units.map((u) => (
        <button
          key={u.id}
          type="button"
          onClick={() => onPickUnit(u.id)}
          aria-label={`Unit ${u.id} — ${u.bhk} BHK`}
          style={{ left: `${u.x}%`, top: `${u.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full border border-[#7A4833] bg-white/70 text-[11px] font-semibold text-[#7A4833]">
            {u.id}
          </span>
        </button>
      ))}
    </div>

    <p className="mt-2 text-center text-[15px] font-semibold uppercase tracking-[0.12em] text-[#7A4833]">
      External Facing
    </p>

    {/* Explicit entry into the unit detail view (hotspots are also clickable,
        but this is the obvious path). Opens the first unit; the unit pills in
        the detail view switch between all units. */}
    <button
      type="button"
      onClick={() => onPickUnit(tower.units[0].id)}
      className="mt-4 rounded-full bg-[#7A4833] px-7 py-3 text-[14px] font-medium uppercase tracking-[0.12em] text-white"
    >
      View Unit Plans →
    </button>
  </div>
)

// ── Unit detail view: plan image + info panel ─────────────────────────────
const UnitDetailView = ({ tower, unit, onChangeUnit, onBack }) => {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center px-10 pt-5 pb-2.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to floor plan"
          className="grid h-15 w-15 place-items-center rounded-full"
        >
          <img src="/unit/svgs/arrow-left.svg" alt="" className="h-6 w-6" />
        </button>
        <h1 className="mx-auto text-[22px] font-semibold uppercase tracking-[0.08em] text-on-light-black">
          {tower.name} {unit.bhk} BHK ({fmt(unit.carpet)} Sq. Ft.)
        </h1>
        <div className="h-15 w-15" aria-hidden />
      </header>

      <div className="flex flex-1 gap-6 px-10 pb-8">
        {/* Plan image panel */}
        <div className="relative flex-2 overflow-hidden rounded-sm bg-[#A8576A]">
          {/* Intentionally always the same image regardless of selected unit. */}
          <img src="/unit/stargaze/unit-1.png" alt="Unit plan" className="h-full w-full object-contain" />
          <button
            type="button"
            aria-label="Fullscreen (todo)"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-sm bg-black/30"
          >
            <img src="/unit/svgs/arrows_output.svg" alt="" className="h-5 w-5 invert" />
          </button>
        </div>

        {/* Info panel */}
        <div className="flex flex-1 flex-col rounded-sm bg-[#F4F3F0] p-6">
          {/* Unit selector — plain pill row, no dropdown */}
          <div className="flex flex-wrap gap-2">
            {tower.units.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => onChangeUnit(u.id)}
                className={`rounded-sm border px-3 py-2 text-[14px] ${
                  u.id === unit.id
                    ? 'border-[#7A4833] bg-[#7A4833] text-white'
                    : 'border-on-light-stroke bg-white text-on-light-grey'
                }`}
              >
                Unit {u.id}
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <p className="text-[12px] uppercase tracking-[0.12em] text-on-light-grey">Balcony</p>
              <p className="text-[20px] font-semibold text-on-light-black">{unit.balcony} sq.ft</p>
            </div>
            <div>
              <p className="text-[12px] uppercase tracking-[0.12em] text-on-light-grey">Expected Possession</p>
              <p className="text-[20px] font-semibold text-on-light-black">{POSSESSION_STUB}</p>
            </div>
            {/* STUB — non-functional */}
            <button type="button" className="flex items-center gap-2 text-[17px] font-medium text-[#7A4833]">
              <img src="/unit/svgs/view.svg" alt="" className="h-5 w-5" />
              Courtyard View
              <img src="/unit/svgs/arrow_forward.svg" alt="" className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* STUB — non-functional */}
          <button
            type="button"
            className="mt-auto w-full border border-on-light-black py-4 text-[15px] font-medium uppercase tracking-[0.15em] text-on-light-black"
          >
            Compare
          </button>
        </div>
      </div>
    </div>
  )
}

const UnitPlans = () => {
  const navigate = useNavigate()
  const [activeTowerId, setActiveTowerId] = useState('stargaze')
  const [selectedUnitId, setSelectedUnitId] = useState(null)

  const tower = TOWERS.find((t) => t.id === activeTowerId)
  const unit = tower.units?.find((u) => u.id === selectedUnitId) ?? null

  return (
    <div className="h-full w-full overflow-y-auto bg-white">
      {unit ? (
        <UnitDetailView
          tower={tower}
          unit={unit}
          onChangeUnit={setSelectedUnitId}
          onBack={() => setSelectedUnitId(null)}
        />
      ) : (
        <>
          <TabHeader
            towers={TOWERS}
            activeId={activeTowerId}
            onSelect={(id) => {
              setActiveTowerId(id)
              setSelectedUnitId(null)
            }}
            onBack={() => navigate('/')}
          />
          <div className="h-[calc(100%-90px)]">
            <FloorPlanView tower={tower} onPickUnit={setSelectedUnitId} />
          </div>
        </>
      )}
    </div>
  )
}

export default UnitPlans
