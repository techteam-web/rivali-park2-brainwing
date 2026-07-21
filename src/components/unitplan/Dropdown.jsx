import { useEffect, useRef, useState } from 'react'

// Shared Poppins type for the dropdown (H4: 18px / 0.1em / uppercase).
const LABEL_FONT = {
  fontFamily: 'Poppins, sans-serif',
  fontSize: 18,
  lineHeight: '120%',
  letterSpacing: '0.1em',
}

// Generic white, bordered dropdown used by the compare cards (tower + unit
// selectors, and the embedded courtyard-view floor picker). `options` is
// [{ value, label, disabled? }]; `onChange(value)` fires on selection.
// Disabled options render greyed and are not selectable. `dropUp` opens the
// list above the button instead of below — for triggers pinned near the
// bottom of their container, so the list has room to open into.
const Dropdown = ({ value, options, onChange, className = '', dropUp = false }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className={`relative ${className}`}>
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
          {selected ? selected.label : '—'}
        </span>
        <img
          src="/unit/svgs/keyboard_arrow_down.svg"
          alt=""
          className={`w-4 shrink-0 transition-transform ${open !== dropUp ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute left-0 right-0 z-20 max-h-64 overflow-auto rounded-sm border-[0.5px] border-[rgba(122,72,51,0.2)] bg-[#FAF9F6] pb-1.5 shadow-[0_0_20px_rgba(0,0,0,0.08)] ${
            dropUp ? 'bottom-[calc(100%+12px)]' : 'top-[calc(100%+12px)]'
          }`}
        >
          {options.map((o) => {
            const isSelected = o.value === value
            return (
              <li key={o.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  disabled={o.disabled}
                  onClick={() => {
                    setOpen(false)
                    onChange(o.value)
                  }}
                  className={`flex h-13.5 w-full items-center px-6 text-left uppercase transition-colors ${
                    o.disabled
                      ? 'cursor-not-allowed font-medium text-black/20'
                      : isSelected
                        ? 'cursor-pointer bg-[#F7F4F3] font-semibold text-on-light-black hover:text-brand-brown'
                        : 'cursor-pointer font-medium text-on-light-black hover:bg-[#F7F4F3] hover:text-brand-brown'
                  }`}
                  style={LABEL_FONT}
                >
                  {o.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Dropdown
