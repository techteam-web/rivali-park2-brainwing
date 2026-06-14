// Single source of truth for the unit-plan screens (floor-plan selector, unit
// detail sheet, and compare view).
//
// Skyleap, Moonrise and Stargaze have exported assets; Sunburst still renders as
// a tab that falls back to a "coming soon" placeholder until its plans land.
// `bg` is the background colour baked into each tower's plan sheets, used so the
// fullscreen viewer's plan area blends seamlessly behind the (contained) image.
export const TOWER_TABS = [
  { id: 'skyleap', label: 'Skyleap', plan: '/unit/skyleap/floorplan.png', bg: '#557E92' },
  { id: 'moonrise', label: 'Moonrise', plan: '/unit/moonrise/floorplan.png', bg: '#839033' },
  { id: 'stargaze', label: 'Stargaze', plan: '/unit/stargaze/floorplan.png', bg: '#9C6A7B' },
  { id: 'sunburst', label: 'Sunburst', plan: null, bg: '#9C6A7B' },
]

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

// Tower id → its unit list. Towers without assets are simply absent.
export const TOWER_UNITS = {
  skyleap: SKYLEAP_UNITS,
  moonrise: MOONRISE_UNITS,
  stargaze: STARGAZE_UNITS,
}

export const fmtSqft = (n) => n.toLocaleString('en-US')

// Label used in the unit dropdown and selectors, e.g. "3 BHK - 968 Sq Ft".
export const unitLabel = (u) => `${u.bhk} BHK - ${fmtSqft(u.carpet)} Sq Ft`

// Balcony spec for the detail/compare panels; units with no balcony show "—".
export const fmtBalcony = (u) => (u.balcony == null ? '—' : `${u.balcony} sq.ft`)

export const towerLabel = (tower) =>
  TOWER_TABS.find((t) => t.id === tower)?.label ?? ''

export const towerBg = (tower) =>
  TOWER_TABS.find((t) => t.id === tower)?.bg ?? '#9C6A7B'

export const towerUnits = (tower) => TOWER_UNITS[tower] ?? []

export const findUnit = (tower, n) =>
  towerUnits(tower).find((u) => u.n === Number(n)) ?? null
