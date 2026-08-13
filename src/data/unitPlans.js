// Single source of truth for the unit-plan screens (floor-plan selector, unit
// detail sheet, and compare view).
//
// Skyleap, Moonrise and Stargaze have exported assets; Sunburst still renders as
// a tab that falls back to a "coming soon" placeholder until its plans land.
// `bg` is the background colour baked into each tower's plan sheets, used so the
// fullscreen viewer's plan area blends seamlessly behind the (contained) image.
// `tint` is the subtle card background (selectors/specs panel) for each tower —
// a very light wash of the tower's brand colour. Stargaze is final (#FCF8F7);
// the others are placeholder tints derived from `bg` until exact values land.
// `footprints` is the architects' unit-footprint overlay, drawn in the same
// coordinate space as the plan sheet itself (see UNIT_SHEET_VB), so it needs no
// placement tuning — it just sizes to the plan image. Towers without one fall
// back to a plain, non-interactive plan. Stargaze predates this format and
// still uses the hand-placed StargazeOverlay below.
export const TOWER_TABS = [
  { id: 'skyleap', label: 'Skyleap', plan: '/unit/skyleap/floorplan.png', footprints: '/unit/skyleap/units.svg', bg: '#557E92', tint: '#F6F9FA' },
  { id: 'moonrise', label: 'Moonrise', plan: '/unit/moonrise/floorplan.png', footprints: '/unit/moonrise/units.svg', bg: '#839033', tint: '#F8FAF1' },
  { id: 'stargaze', label: 'Stargaze', plan: '/unit/stargaze/floorplan.png', footprints: null, bg: '#9C6A7B', tint: '#FCF8F7' },
  { id: 'sunburst', label: 'Sunburst', plan: '/unit/sunburst/floorplan.png', footprints: '/unit/sunburst/units.svg', bg: '#AF8D66', tint: '#FBF8F3' },
]

// The floor-plan sheets are all 3509x2480 (ratio 1.4149); the footprint
// overlays share that exact space, so the two line up with no offset.
export const UNIT_SHEET_VB = { w: 842.16, h: 595.2 }

// Same expected possession across every unit for now (per product). The short
// form is used where space is tight (e.g. the compare cards).
export const POSSESSION = 'January 2027'
export const POSSESSION_SHORT = 'Jan 2027'

// bhk / carpet / balcony are read directly off the exported plan sheets
// (public/unit/<tower>/unit-{n}.png). `balcony: null` means the unit has no
// balcony. `left`/`top` are percentages of the floor-plan image, used to
// position each clickable marker on the selector. Numbers are placed on the
// matching unit type/position printed on the floor plan; among same-type units
// the exact number↔position pairing is a best-effort guess.
export const STARGAZE_UNITS = [
  { n: 1, bhk: 2, carpet: 722, balcony: 46, image: '/unit/stargaze/unit-1.png', left: 44.2, top: 19.2 },
  { n: 2, bhk: 3, carpet: 959, balcony: 46, image: '/unit/stargaze/unit-2.png', left: 61.0, top: 18.9 },
  { n: 3, bhk: 3, carpet: 968, balcony: 46, image: '/unit/stargaze/unit-3.png', left: 56.5, top: 50.6 },
  { n: 4, bhk: 3, carpet: 984, balcony: 46, image: '/unit/stargaze/unit-4.png', left: 18.4, top: 53.5 },
  { n: 5, bhk: 3, carpet: 1066, balcony: 48, image: '/unit/stargaze/unit-5.png', left: 47.6, top: 61.2 },
  { n: 6, bhk: 2, carpet: 803, balcony: 49, image: '/unit/stargaze/unit-6.png', left: 18.4, top: 65.1 },
]

// Skyleap (lower-level plans, "up to 43rd floor"): two top-centre 3 BHK units,
// four 2 BHK +balcony on the sides, two bottom-centre 2 BHK with no balcony.
export const SKYLEAP_UNITS = [
  { n: 1, bhk: 3, carpet: 1279, balcony: 59, image: '/unit/skyleap/unit-1.png', left: 38, top: 15 },
  { n: 2, bhk: 3, carpet: 1279, balcony: 59, image: '/unit/skyleap/unit-2.png', left: 53, top: 15 },
  { n: 3, bhk: 2, carpet: 828, balcony: 55, image: '/unit/skyleap/unit-3.png', left: 27, top: 33 },
  { n: 4, bhk: 2, carpet: 828, balcony: 55, image: '/unit/skyleap/unit-4.png', left: 27, top: 46 },
  { n: 5, bhk: 2, carpet: 810, balcony: null, image: '/unit/skyleap/unit-5.png', left: 48, top: 59 },
  { n: 6, bhk: 2, carpet: 810, balcony: null, image: '/unit/skyleap/unit-6.png', left: 56, top: 59 },
  { n: 7, bhk: 2, carpet: 833, balcony: 55, image: '/unit/skyleap/unit-7.png', left: 74, top: 33 },
  { n: 8, bhk: 2, carpet: 833, balcony: 55, image: '/unit/skyleap/unit-8.png', left: 74, top: 46 },
]

// Moonrise: four corner 3 BHK units, four centre 2 BHK units (top + bottom row).
export const MOONRISE_UNITS = [
  { n: 1, bhk: 3, carpet: 1196, balcony: 67, image: '/unit/moonrise/unit-1.png', left: 22, top: 33 },
  { n: 2, bhk: 2, carpet: 781, balcony: 45, image: '/unit/moonrise/unit-2.png', left: 37, top: 36 },
  { n: 3, bhk: 2, carpet: 780, balcony: 45, image: '/unit/moonrise/unit-3.png', left: 43, top: 36 },
  { n: 4, bhk: 3, carpet: 1111, balcony: 64, image: '/unit/moonrise/unit-4.png', left: 76, top: 33 },
  { n: 5, bhk: 3, carpet: 1125, balcony: 45, image: '/unit/moonrise/unit-5.png', left: 22, top: 67 },
  { n: 6, bhk: 2, carpet: 781, balcony: 45, image: '/unit/moonrise/unit-6.png', left: 37, top: 67 },
  { n: 7, bhk: 2, carpet: 781, balcony: 45, image: '/unit/moonrise/unit-7.png', left: 43, top: 67 },
  { n: 8, bhk: 3, carpet: 1110, balcony: 45, image: '/unit/moonrise/unit-8.png', left: 76, top: 67 },
]

// Sunburst: two 3 BHK corner units (1 and 8) with six 2 BHK between them.
// carpet/balcony are read straight off the supplied plan sheets; every unit
// has the same 38 sq.ft balcony. No footprint overlay has been supplied yet,
// so its floor plan renders without clickable units — `left`/`top` are omitted
// rather than guessed.
export const SUNBURST_UNITS = [
  { n: 1, bhk: 3, carpet: 889, balcony: 38, image: '/unit/sunburst/unit-1.png' },
  { n: 2, bhk: 2, carpet: 641, balcony: 38, image: '/unit/sunburst/unit-2.png' },
  { n: 3, bhk: 2, carpet: 641, balcony: 38, image: '/unit/sunburst/unit-3.png' },
  { n: 4, bhk: 2, carpet: 641, balcony: 38, image: '/unit/sunburst/unit-4.png' },
  { n: 5, bhk: 2, carpet: 716, balcony: 38, image: '/unit/sunburst/unit-5.png' },
  { n: 6, bhk: 2, carpet: 722, balcony: 38, image: '/unit/sunburst/unit-6.png' },
  { n: 7, bhk: 2, carpet: 722, balcony: 38, image: '/unit/sunburst/unit-7.png' },
  { n: 8, bhk: 3, carpet: 905, balcony: 38, image: '/unit/sunburst/unit-8.png' },
]

// Tower id → its unit list. Towers without assets are simply absent.
export const TOWER_UNITS = {
  skyleap: SKYLEAP_UNITS,
  moonrise: MOONRISE_UNITS,
  stargaze: STARGAZE_UNITS,
  sunburst: SUNBURST_UNITS,
}

// Combined viewBox bounding all six Stargaze footprint shapes (shared
// coordinate space from the Illustrator export). Lives here so both the overlay
// component and the selector page can use it without tripping fast-refresh.
export const STARGAZE_OVERLAY_VB = { x: 108, y: 20, w: 600, h: 518 }

// Towers whose units are clickable/highlightable footprint-shape overlays.
export const OVERLAY_TOWER = 'stargaze'

// Floor-plan box (artboard units). Keeps the exported sheet's aspect ratio so
// any box using it renders the plan without letterboxing drift, and so the
// hand-tuned STARGAZE_OVERLAY placement below lines up correctly wherever the
// box is reused (the selector page, the unit detail sheet's locator plan).
export const PLAN_W = 1320
export const PLAN_H = 704

// Placement of the Stargaze overlay over the plan (centre %, width % of the
// PLAN_W x PLAN_H box), hand-tuned in the editor until it lines up.
export const STARGAZE_OVERLAY = { left: 48.8, top: 47, width: 53.7 }

// NOTE (client feedback, 08 Aug): "Courtyard Facing / External Facing must line
// up with the sheet's own tower title, logo and disclaimer, same across all
// towers/plans". That can't be done reliably from this side — each exported
// sheet has different margins (Stargaze's plate runs right to the top edge),
// so any single position lands on the drawing for some towers. Parked until
// re-exported sheets arrive with consistent clear space above the plan and
// between the plan and the bottom disclaimer/logo row.

export const fmtSqft = (n) => n.toLocaleString('en-US')

// Label used in the unit dropdown and selectors, e.g. "Unit 6 - 2 BHK".
export const unitLabel = (u) => `Unit ${u.n} - ${u.bhk} BHK`

// Balcony spec for the detail/compare panels; units with no balcony show "—".
export const fmtBalcony = (u) => (u.balcony == null ? '—' : `${u.balcony} sq.ft`)

// Total area spec: carpet + balcony (units with no balcony just show carpet).
export const fmtTotalArea = (u) =>
  `${fmtSqft(u.carpet + (u.balcony ?? 0))} sq.ft`

export const towerLabel = (tower) =>
  TOWER_TABS.find((t) => t.id === tower)?.label ?? ''

export const towerBg = (tower) =>
  TOWER_TABS.find((t) => t.id === tower)?.bg ?? '#9C6A7B'

export const towerPlan = (tower) =>
  TOWER_TABS.find((t) => t.id === tower)?.plan ?? null

// Unit-footprint overlay for a tower, or null if it doesn't have one yet.
export const towerFootprints = (tower) =>
  TOWER_TABS.find((t) => t.id === tower)?.footprints ?? null

// Subtle card-panel tint for a tower (falls back to a neutral off-white).
export const towerTint = (tower) =>
  TOWER_TABS.find((t) => t.id === tower)?.tint ?? '#F4F7F2'

export const towerUnits = (tower) => TOWER_UNITS[tower] ?? []

export const findUnit = (tower, n) =>
  towerUnits(tower).find((u) => u.n === Number(n)) ?? null
