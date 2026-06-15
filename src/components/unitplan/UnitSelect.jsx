import { useEffect, useRef, useState } from 'react'
import { towerUnits, findUnit, unitLabel } from '../../data/unitPlans'

// White, bordered dropdown that lists every unit in `tower` as "{bhk} BHK -
// {carpet} Sq Ft". Controlled by `value` (a unit number); `onChange(n)` fires
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
        className="flex w-full items-center justify-between gap-3 rounded-sm border border-[#D8D6D0] bg-white px-5 py-4 text-left"
      >
        <span
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: 18,
            color: '#313131',
          }}
        >
          {selected ? unitLabel(selected) : 'Select a unit'}
        </span>
        <img
          src="/unit/svgs/keyboard_arrow_down.svg"
          alt=""
          className={`h-2.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-sm border border-[#D8D6D0] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {units.map((u) => {
            const isSelected = u.n === Number(value)
            return (
              <li key={u.n} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onChange(u.n)
                  }}
                  className={`w-full px-5 py-3 text-left transition-colors hover:bg-[#F4F3F0] ${
                    isSelected ? 'bg-[#F4F3F0]' : ''
                  }`}
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: 16,
                    color: '#313131',
                  }}
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
