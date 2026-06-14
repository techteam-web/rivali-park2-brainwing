import { useEffect, useRef, useState } from 'react'

// Generic white, bordered dropdown used by the compare cards (tower + unit
// selectors). `options` is [{ value, label, disabled? }]; `onChange(value)`
// fires on selection. Disabled options render greyed and are not selectable.
const Dropdown = ({ value, options, onChange, className = '' }) => {
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
        className="flex w-full items-center justify-between gap-2 rounded-sm border border-[#D8D6D0] bg-white px-4 py-3 text-left"
      >
        <span
          className="truncate uppercase"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: '0.04em',
            color: '#313131',
          }}
        >
          {selected ? selected.label : '—'}
        </span>
        <img
          src="/unit/svgs/keyboard_arrow_down.svg"
          alt=""
          className={`h-2.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-64 overflow-auto rounded-sm border border-[#D8D6D0] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
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
                  className={`w-full px-4 py-2.5 text-left uppercase transition-colors ${
                    o.disabled
                      ? 'cursor-not-allowed opacity-40'
                      : 'hover:bg-[#F4F3F0]'
                  } ${isSelected ? 'bg-[#F4F3F0]' : ''}`}
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: 14,
                    letterSpacing: '0.04em',
                    color: '#313131',
                  }}
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
