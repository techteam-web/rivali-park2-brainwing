import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
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
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Idle breath. Deliberately slow and shallow — this sits under a floor plan
// people are reading, so it should register as "these are alive" from the
// corner of the eye and never pull focus.
const PULSE_TO = 0.5 // element opacity at the bottom of the breath
const PULSE_SECONDS = 2.8
const PULSE_OFFSET = 0.22 // per-unit delay, so the breath drifts across the plate

// Start (or restart) one shape's breath. Kept as a plain function so the hover
// handlers can rebuild a shape's tween without reaching back through refs.
const startPulse = (el, delay = 0) =>
  gsap.to(el, {
    opacity: PULSE_TO,
    duration: PULSE_SECONDS,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    delay,
  })

// Hover steadies the shape under the cursor: its own tween is paused and it
// comes up to full, so the one being pointed at holds still.
//
// The tween is found via gsap.getTweensOf(el) rather than an index into a refs
// array. An earlier version looked it up positionally and silently paused
// nothing, so the hovered unit kept drifting — asking the element which tweens
// belong to it can't fall out of sync.
const holdShape = (el) => {
  gsap.getTweensOf(el).forEach((t) => t.pause())
  gsap.to(el, { opacity: 1, duration: 0.25, ease: 'power2.out' })
}

const releaseShape = (el, delay = 0) => {
  gsap.getTweensOf(el).forEach((t) => t.kill())
  gsap.set(el, { opacity: 1 })
  startPulse(el, delay)
}

const UnitFootprints = ({ tower, onSelect, highlightOnly = null }) => {
  const src = towerFootprints(tower)
  const [shapes, setShapes] = useState([])
  const shapeEls = useRef([])
  const pulses = useRef([])

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

  // GSAP drives each shape's ELEMENT opacity; the CSS below owns fill-opacity
  // and its hover step. Two different properties, so the two never contend —
  // the mistake that made the tower's floor bands stick lit was having both
  // reach for the same one.
  //
  // One tween per shape rather than a single staggered tween: that way hovering
  // can pause just the shape under the cursor without disturbing the others (a
  // staggered tween is one instance, so pausing it would stop the whole plate).
  //
  // NOTE the dependency is `interactive`, not `onSelect`. The parent passes a
  // fresh arrow every render, and it re-renders on every mousemove over the
  // plan (it tracks the cursor for zoom) — so depending on the function itself
  // tore down and rebuilt every tween mid-hover, which is what made a hovered
  // unit start drifting again a moment after you pointed at it.
  const interactive = Boolean(onSelect)
  useEffect(() => {
    pulses.current.forEach((t) => t?.kill())
    pulses.current = []
    if (!interactive || prefersReducedMotion()) return
    shapeEls.current.forEach((el, i) => {
      if (el) pulses.current[i] = startPulse(el, i * PULSE_OFFSET)
    })
    return () => {
      pulses.current.forEach((t) => t?.kill())
      pulses.current = []
    }
  }, [shapes, interactive])

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
      {shown.map((s, i) => {
        const Shape = s.tag
        return (
          <Shape
            key={s.n}
            ref={(el) => {
              shapeEls.current[i] = el
            }}
            {...s.attrs}
            fill={fill}
            onClick={onSelect ? () => onSelect(s.n) : undefined}
            role={onSelect ? 'button' : undefined}
            aria-label={onSelect ? `Unit ${s.n}` : undefined}
            // Hovering steadies the unit under the cursor: its breath pauses and
            // it comes up to full, so the one you're pointing at holds still.
            onMouseEnter={
              onSelect ? (e) => holdShape(e.currentTarget) : undefined
            }
            onMouseLeave={
              onSelect ? (e) => releaseShape(e.currentTarget) : undefined
            }
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
