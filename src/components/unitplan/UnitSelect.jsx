import { useEffect, useRef, useState } from 'react'
import { towerUnits, findUnit, unitLabel } from '../../data/unitPlans'

// Shared Poppins type for the dropdown (H4: 18px / 0.1em / uppercase).
const LABEL_FONT = {
  fontFamily: 'Poppins, sans-serif',
  fontSize: 18,
  lineHeight: '120%',
  letterSpacing: '0.1em',
}

// White, bordered dropdown that lists every unit in `tower` as "Unit {n} -
// {bhk} BHK". Controlled by `value` (a unit number); `onChange(n)` fires
// with the chosen unit — the caller decides whether to navigate or set state.
const UnitSelect = ({ tower, value, onChange }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = findUnit(tower, value)
  const units = towerUnits(tower)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-1.5 rounded-sm border border-[rgba(122,72,51,0.2)] bg-white px-6 py-5 text-left"
      >
        <span
          className="truncate uppercase"
          style={{ ...LABEL_FONT, fontWeight: 500, color: '#313131' }}
        >
          {selected ? unitLabel(selected) : 'Select a unit'}
        </span>
        <img
          src="/unit/svgs/keyboard_arrow_down.svg"
          alt=""
          className={`w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+12px)] z-20 overflow-hidden rounded-sm border-[0.5px] border-[rgba(122,72,51,0.2)] bg-[#FAF9F6] pb-1.5 shadow-[0_0_20px_rgba(0,0,0,0.08)]"
        >
          {units.map((u) => {
            const isSelected = u.n === Number(value)
            const isDisabled = u.disabled
            return (
              <li key={u.n} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    setOpen(false)
                    onChange(u.n)
                  }}
                  className={`flex h-13.5 w-full items-center px-6 text-left uppercase transition-colors ${
                    isDisabled
                      ? 'cursor-not-allowed font-medium text-black/20'
                      : isSelected
                        ? 'cursor-pointer bg-[#F7F4F3] font-semibold text-on-light-black hover:text-brand-brown'
                        : 'cursor-pointer font-medium text-on-light-black hover:bg-[#F7F4F3] hover:text-brand-brown'
                  }`}
                  style={LABEL_FONT}
                >
                  {unitLabel(u)}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default UnitSelect
