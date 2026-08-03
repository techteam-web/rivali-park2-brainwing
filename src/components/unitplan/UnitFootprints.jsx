import { useEffect, useState } from 'react'
import { UNIT_SHEET_VB, towerBg, towerFootprints } from '../../data/unitPlans'

// Clickable unit footprints laid over a tower's floor plan.
//
// The shapes come straight from the architects' export, which is drawn in the
// SAME coordinate space as the floor-plan sheet itself (viewBox 842.16 x 595.2,
// matching the plan PNG's 3509x2480 exactly). That means no hand-placement:
// the overlay is simply sized to the plan image and the footprints land on
// their units. Contrast StargazeOverlay, whose older export is a tightly-
// cropped viewBox that had to be nudged into position by eye — when Stargaze is
// re-exported in this full-sheet format it can move onto this component too.
//
// Each shape is named for the unit it covers (`data-name="4_3BED"`), so the
// artwork is the single source of truth for which footprint is which unit.

const NAMED = /^(\d+)_/

// Geometry-only attributes; the export's fill/opacity classes are dropped so
// the highlight is driven here.
const SHAPE_ATTRS = {
  polygon: ['points'],
  polyline: ['points'],
  path: ['d'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
  circle: ['cx', 'cy', 'r'],
  ellipse: ['cx', 'cy', 'rx', 'ry'],
}

const parseFootprints = (svgText) => {
  if (typeof DOMParser === 'undefined') return []
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const root = doc.documentElement
  if (!root || root.getElementsByTagName('parsererror').length) return []

  const out = []
  for (const el of Array.from(root.querySelectorAll('*'))) {
    const tag = el.tagName.toLowerCase()
    const keys = SHAPE_ATTRS[tag]
    if (!keys) continue
    // The root <svg> carries a data-name too ("Layer 1"); only shapes named
    // for a unit count.
    const name = el.getAttribute('data-name') || el.getAttribute('id') || ''
    const m = NAMED.exec(name.replace(/^_/, ''))
    if (!m) continue
    const attrs = {}
    keys.forEach((k) => {
      const v = el.getAttribute(k)
      if (v != null) attrs[k] = v
    })
    if (Object.keys(attrs).length) out.push({ n: Number(m[1]), tag, attrs })
  }
  return out.sort((a, b) => a.n - b.n)
}

// `onSelect` makes every footprint clickable (the floor-plan selector).
// `highlightOnly` renders just that one unit as a static locator — used on the
// unit detail sheet to show where the unit sits on the whole floor, with no
// click affordance since there's nothing to select there.
const UnitFootprints = ({ tower, onSelect, highlightOnly = null }) => {
  const src = towerFootprints(tower)
  const [shapes, setShapes] = useState([])

  useEffect(() => {
    if (!src) return
    let cancelled = false
    fetch(src)
      .then((r) => r.text())
      .then((t) => !cancelled && setShapes(parseFootprints(t)))
      .catch(() => !cancelled && setShapes([]))
    return () => {
      cancelled = true
    }
  }, [src])

  if (!src) return null

  const shown =
    highlightOnly != null ? shapes.filter((s) => s.n === highlightOnly) : shapes
  const fill = towerBg(tower)

  return (
    <svg
      viewBox={`0 0 ${UNIT_SHEET_VB.w} ${UNIT_SHEET_VB.h}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
    >
      {shown.map((s) => {
        const Shape = s.tag
        return (
          <Shape
            key={s.n}
            {...s.attrs}
            fill={fill}
            onClick={onSelect ? () => onSelect(s.n) : undefined}
            role={onSelect ? 'button' : undefined}
            aria-label={onSelect ? `Unit ${s.n}` : undefined}
            className={
              onSelect
                ? 'cursor-pointer stroke-on-light-black stroke-[0.6] [fill-opacity:0.28] [transition:fill-opacity_150ms_ease-out] hover:[fill-opacity:0.55]'
                : 'stroke-on-light-black stroke-[0.8] [fill-opacity:0.7]'
            }
          />
        )
      })}
    </svg>
  )
}

export default UnitFootprints
