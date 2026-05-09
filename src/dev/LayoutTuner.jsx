import { useEffect, useRef, useState } from 'react'

// Dev-only floating tool for tuning the position/size of decorative SVGs
// (and other absolutely-positioned overlays) anywhere in the app. The tool
// auto-discovers tunable elements: anything with inline `top: X%` and
// `left: X%` on `position: absolute` qualifies — that's the shape every
// data-driven SVG / card uses across Gallery, hotspot detail pages, and
// the wellness / sky / social / central / convention map pages. No per-
// page tagging required. Optional `data-tune="<name>"` overrides the
// auto-derived label.
//
// Changes are written directly to the element's inline style — they don't
// persist across slide swaps or page reloads. When you're happy, click
// "Copy snippet" to grab the new values as JSON snippets you paste back
// into src/data/*.js.
//
// Values are computed from the rendered geometry against the same
// containing block CSS uses to resolve `top: X%` / `left: X%` / `width: X%`
// — that's `el.offsetParent` for an absolutely-positioned child. So the
// number the panel shows is the exact fraction that, written into a data
// file as `top: N`, will reproduce the position you see on screen.
//
// Only mounts when import.meta.env.DEV is true, so this never ships.

const STORAGE_KEY = 'layoutTuner.enabled'

const fmt = (v) => Number(v.toFixed(3))

// Same containing block CSS uses for percentage resolution on a position:
// absolute child. Falls back to parentElement just in case.
const containingBlock = (el) => el.offsetParent || el.parentElement

// Compute current top/left/width as 0..1 fractions from the rendered
// rects. Width returns null if the element doesn't have an inline
// width set (e.g. tower buttons size from padding) so we don't write
// a width back where there wasn't one.
const readFrac = (el) => {
  const parent = containingBlock(el)
  if (!parent) return { top: null, left: null, width: null }
  const r = el.getBoundingClientRect()
  const pr = parent.getBoundingClientRect()
  if (pr.width === 0 || pr.height === 0)
    return { top: null, left: null, width: null }
  return {
    top: (r.top - pr.top) / pr.height,
    left: (r.left - pr.left) / pr.width,
    width: el.style.width ? r.width / pr.width : null,
  }
}

const writeFrac = (el, frac) => {
  if (frac.top != null) el.style.top = `${(frac.top * 100).toFixed(3)}%`
  if (frac.left != null) el.style.left = `${(frac.left * 100).toFixed(3)}%`
  if (frac.width != null && el.style.width)
    el.style.width = `${(Math.max(0, frac.width) * 100).toFixed(3)}%`
}

// Pick a friendly label for the panel and copy snippet. Priority:
//   1. explicit `data-tune` attribute
//   2. `aria-label` (gallery sections, wellness cards, etc.)
//   3. InlineSVG's source filename (via the data-inline-svg-src that
//      InlineSVG forwards on its wrapper, on the element itself or on
//      the first descendant that has one)
//   4. an `<img alt>` inside
//   5. tag-name + index, as a last resort
const basename = (path) => {
  const seg = path.split('/').pop() || ''
  return seg.replace(/\.[^.]+$/, '')
}

const labelFor = (el, idx) => {
  if (el.dataset.tune) return el.dataset.tune
  const aria = el.getAttribute('aria-label')
  if (aria) return aria
  if (el.dataset.inlineSvgSrc) return basename(el.dataset.inlineSvgSrc)
  const inline = el.querySelector('[data-inline-svg-src]')
  if (inline?.dataset.inlineSvgSrc) return basename(inline.dataset.inlineSvgSrc)
  const img = el.querySelector('img[alt]')
  if (img?.alt) return img.alt
  return `${el.tagName.toLowerCase()}-${idx}`
}

// Auto-discover criteria: inline `top` AND `left` set as percentages, and
// computed `position: absolute`. This matches every data-driven SVG/card
// across the app while excluding fixed UI like back buttons, headings,
// and gradient overlays whose top/left are in px / 0 / auto.
const isTunable = (el) => {
  const top = el.style?.top
  const left = el.style?.left
  if (!top || !left) return false
  if (!top.endsWith('%') || !left.endsWith('%')) return false
  return getComputedStyle(el).position === 'absolute'
}

// Walk up to the body looking for any ancestor that's hidden, so we
// only show overlays for things actually visible on the active slide.
const isVisible = (el) => {
  let p = el
  while (p && p !== document.body) {
    const cs = getComputedStyle(p)
    if (cs.display === 'none' || cs.visibility === 'hidden') return false
    if (parseFloat(cs.opacity) === 0) return false
    p = p.parentElement
  }
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0
}

const LayoutTuner = () => {
  if (!import.meta.env.DEV) return null

  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [items, setItems] = useState([])
  const [selectedKey, setSelectedKey] = useState(null)
  const draggingRef = useRef(false)

  // Local input strings for the numeric fields. Tracked separately so
  // typing intermediate values like "0.0" doesn't get clobbered by the
  // rect-sync each frame. Each field stays under user control while it
  // has focus; otherwise it mirrors the rendered fraction.
  const [topStr, setTopStr] = useState('')
  const [leftStr, setLeftStr] = useState('')
  const [widthStr, setWidthStr] = useState('')
  const focusedAxisRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [enabled])

  // Scan loop — every animation frame, auto-discover any element with
  // inline percentage top/left on position:absolute, and capture its rect
  // + fractional values (computed against the offsetParent, the CSS
  // containing block).
  useEffect(() => {
    if (!enabled) return
    let raf = 0
    const tick = () => {
      const found = []
      const seenKeys = new Set()
      // The substring selector is a cheap pre-filter: any element with a
      // percentage in its inline style. We then check top/left/position
      // to confirm.
      const candidates = document.querySelectorAll('[style*="%"]')
      let idx = 0
      candidates.forEach((el) => {
        if (!isTunable(el)) return
        if (!isVisible(el)) return
        const parent = containingBlock(el)
        if (!parent) return
        const frac = readFrac(el)
        if (frac.top == null || frac.left == null) return
        const rect = el.getBoundingClientRect()
        const parentRect = parent.getBoundingClientRect()
        let key = labelFor(el, idx++)
        // Disambiguate duplicate labels (e.g. two SVGs with the same
        // filename used in different positions).
        let dedupe = key
        let n = 2
        while (seenKeys.has(dedupe)) dedupe = `${key} (${n++})`
        seenKeys.add(dedupe)
        found.push({
          key: dedupe,
          el,
          parent,
          rect,
          parentRect,
          ...frac,
        })
      })
      setItems(found)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [enabled])

  const selected = items.find((it) => it.key === selectedKey) || null

  // Mirror selected fractions into the input strings, but only for
  // fields the user isn't currently typing into.
  useEffect(() => {
    if (!selected) {
      setTopStr('')
      setLeftStr('')
      setWidthStr('')
      return
    }
    if (focusedAxisRef.current !== 'top') setTopStr(fmt(selected.top).toString())
    if (focusedAxisRef.current !== 'left') setLeftStr(fmt(selected.left).toString())
    if (focusedAxisRef.current !== 'width') {
      setWidthStr(selected.width != null ? fmt(selected.width).toString() : '')
    }
  }, [selected?.key, selected?.top, selected?.left, selected?.width])

  // Keyboard nudges. Shift = fine. Plus/minus changes width.
  useEffect(() => {
    if (!enabled || !selected) return
    const onKey = (e) => {
      const t = e.target
      if (
        t &&
        (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      )
        return
      const el = selected.el
      if (!el) return
      const stepPos = e.shiftKey ? 0.0005 : 0.002
      const stepW = e.shiftKey ? 0.001 : 0.005
      const cur = readFrac(el)
      let consumed = true
      switch (e.key) {
        case 'ArrowUp':
          cur.top -= stepPos
          break
        case 'ArrowDown':
          cur.top += stepPos
          break
        case 'ArrowLeft':
          cur.left -= stepPos
          break
        case 'ArrowRight':
          cur.left += stepPos
          break
        case '+':
        case '=':
          if (cur.width != null) cur.width += stepW
          break
        case '-':
        case '_':
          if (cur.width != null) cur.width -= stepW
          break
        case 'Escape':
          setSelectedKey(null)
          return
        default:
          consumed = false
      }
      if (consumed) {
        e.preventDefault()
        e.stopPropagation()
        writeFrac(el, cur)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [enabled, selected])

  const onHitMouseDown = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedKey(item.key)
    draggingRef.current = true

    const startX = e.clientX
    const startY = e.clientY
    const start = readFrac(item.el)
    const parentRect = item.parent.getBoundingClientRect()

    const onMove = (ev) => {
      const dx = (ev.clientX - startX) / parentRect.width
      const dy = (ev.clientY - startY) / parentRect.height
      writeFrac(item.el, {
        top: start.top + dy,
        left: start.left + dx,
        width: start.width,
      })
    }
    const onUp = () => {
      draggingRef.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Resize via the right-edge handle on the selection box. Only width is
  // tunable (height comes from the SVG aspect ratio).
  const onResizeMouseDown = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    if (item.width == null) return
    draggingRef.current = true
    const startX = e.clientX
    const start = readFrac(item.el)
    const parentRect = item.parent.getBoundingClientRect()
    const onMove = (ev) => {
      const dx = (ev.clientX - startX) / parentRect.width
      writeFrac(item.el, { ...start, width: start.width + dx })
    }
    const onUp = () => {
      draggingRef.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const applyAxis = (axis, raw) => {
    if (!selected?.el) return
    const n = parseFloat(raw)
    if (!Number.isFinite(n)) return
    const cur = readFrac(selected.el)
    cur[axis] = n
    writeFrac(selected.el, cur)
  }

  const formatSnippet = () => {
    return items
      .map((it) => {
        const parts = [
          `name: '${it.key}'`,
          `top: ${fmt(it.top)}`,
          `left: ${fmt(it.left)}`,
        ]
        if (it.width != null) parts.push(`width: ${fmt(it.width)}`)
        return `{ ${parts.join(', ')} },`
      })
      .join('\n')
  }

  const copy = async () => {
    const text = formatSnippet()
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback: log it so they can grab from devtools
      // eslint-disable-next-line no-console
      console.log('[LayoutTuner] copy failed, snippet below:\n' + text)
    }
  }

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={() => setEnabled(true)}
        style={pillBtn}
        title="Open layout tuner (dev only)"
      >
        Tune
      </button>
    )
  }

  return (
    <>
      {items.map((it) => {
        const isSelected = it.key === selectedKey
        return (
          <div
            key={it.key}
            onMouseDown={(e) => onHitMouseDown(e, it)}
            style={{
              position: 'fixed',
              left: it.rect.left,
              top: it.rect.top,
              width: it.rect.width,
              height: it.rect.height,
              outline: isSelected
                ? '2px solid #ff3b3b'
                : '1px dashed rgba(255,255,255,0.55)',
              outlineOffset: 0,
              cursor: 'move',
              zIndex: 99998,
              pointerEvents: 'auto',
              background: isSelected
                ? 'rgba(255,59,59,0.08)'
                : 'rgba(255,255,255,0.02)',
            }}
            title={it.key}
          >
            <div style={{ ...labelChip, background: isSelected ? '#ff3b3b' : 'rgba(0,0,0,0.7)' }}>
              {it.key}
            </div>
            {isSelected && it.width != null && (
              <div
                onMouseDown={(e) => onResizeMouseDown(e, it)}
                style={resizeHandle}
                title="Drag to resize width"
              />
            )}
          </div>
        )
      })}

      <div style={panel}>
        <div style={panelHeader}>
          <strong style={{ fontSize: 12 }}>Layout tuner</strong>
          <button
            type="button"
            onClick={() => {
              setSelectedKey(null)
              setEnabled(false)
            }}
            style={iconBtn}
            title="Close"
          >
            ×
          </button>
        </div>

        <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 6 }}>
          {items.length} element{items.length === 1 ? '' : 's'} on screen
          {selected && (
            <>
              <br />
              container: {Math.round(selected.parentRect.width)}×{Math.round(selected.parentRect.height)} px
            </>
          )}
        </div>

        <select
          value={selectedKey ?? ''}
          onChange={(e) => setSelectedKey(e.target.value || null)}
          style={selectStyle}
        >
          <option value="">— pick element —</option>
          {items.map((it) => (
            <option key={it.key} value={it.key}>
              {it.key}
            </option>
          ))}
        </select>

        {selected && (
          <div style={{ marginTop: 8 }}>
            <FieldRow
              label="top"
              value={topStr}
              onChange={(v) => {
                setTopStr(v)
                applyAxis('top', v)
              }}
              onFocus={() => (focusedAxisRef.current = 'top')}
              onBlur={() => (focusedAxisRef.current = null)}
              hintPx={Math.round(selected.top * selected.parentRect.height)}
              hintUnit="px from top"
            />
            <FieldRow
              label="left"
              value={leftStr}
              onChange={(v) => {
                setLeftStr(v)
                applyAxis('left', v)
              }}
              onFocus={() => (focusedAxisRef.current = 'left')}
              onBlur={() => (focusedAxisRef.current = null)}
              hintPx={Math.round(selected.left * selected.parentRect.width)}
              hintUnit="px from left"
            />
            {selected.width != null && (
              <FieldRow
                label="width"
                value={widthStr}
                onChange={(v) => {
                  setWidthStr(v)
                  applyAxis('width', v)
                }}
                onFocus={() => (focusedAxisRef.current = 'width')}
                onBlur={() => (focusedAxisRef.current = null)}
                hintPx={Math.round(selected.width * selected.parentRect.width)}
                hintUnit="px wide"
              />
            )}
          </div>
        )}

        <button type="button" onClick={copy} style={copyBtn}>
          Copy snippet
        </button>

        <div style={{ marginTop: 6, fontSize: 10, opacity: 0.7, lineHeight: 1.4 }}>
          Click to select. Drag to move. Arrow keys nudge (Shift = fine).
          <br />
          + / − adjusts width. Type values directly above. Esc deselects.
        </div>
      </div>
    </>
  )
}

const FieldRow = ({ label, value, onChange, onFocus, onBlur, hintPx, hintUnit }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
    <span style={{ width: 36, fontSize: 11, opacity: 0.85 }}>{label}</span>
    <input
      type="number"
      step="0.001"
      min="-1"
      max="2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      style={inputStyle}
    />
    <span style={{ fontSize: 9, opacity: 0.55, whiteSpace: 'nowrap' }}>
      {hintPx} {hintUnit}
    </span>
  </div>
)

const pillBtn = {
  position: 'fixed',
  bottom: 12,
  right: 12,
  zIndex: 99999,
  padding: '6px 10px',
  background: 'rgba(20,20,20,0.85)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 999,
  fontSize: 11,
  fontFamily: 'system-ui, sans-serif',
  cursor: 'pointer',
}

const panel = {
  position: 'fixed',
  bottom: 12,
  right: 12,
  zIndex: 99999,
  width: 260,
  background: 'rgba(20,20,20,0.94)',
  color: 'white',
  borderRadius: 8,
  fontFamily: 'system-ui, sans-serif',
  padding: 10,
  boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.08)',
}

const panelHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 6,
}

const iconBtn = {
  background: 'transparent',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.2)',
  width: 22,
  height: 22,
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1,
  padding: 0,
}

const selectStyle = {
  width: '100%',
  padding: 4,
  background: '#111',
  color: 'white',
  border: '1px solid #444',
  borderRadius: 4,
  fontSize: 11,
}

const inputStyle = {
  flex: 1,
  minWidth: 0,
  padding: '3px 5px',
  background: '#111',
  color: 'white',
  border: '1px solid #444',
  borderRadius: 3,
  fontSize: 11,
  fontFamily: 'ui-monospace, monospace',
}

const copyBtn = {
  width: '100%',
  marginTop: 8,
  padding: 6,
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 500,
}

const labelChip = {
  position: 'absolute',
  top: -16,
  left: 0,
  fontSize: 10,
  color: 'white',
  padding: '1px 4px',
  borderRadius: 3,
  whiteSpace: 'nowrap',
  fontFamily: 'system-ui, sans-serif',
  pointerEvents: 'none',
}

const resizeHandle = {
  position: 'absolute',
  right: -5,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 10,
  height: 18,
  background: '#ff3b3b',
  border: '1px solid white',
  borderRadius: 2,
  cursor: 'ew-resize',
}

export default LayoutTuner
