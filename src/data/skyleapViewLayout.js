import { SKYLEAP_VIEWS } from './skyleapViews'

// Corrected Skyleap view layout (16 Oct, design team's marked-up floor plan).
//
// Only two of each floor's four facade shots are used:
//
//   view 3 -> looks out over the top of the plate
//   view 1 -> looks out over the bottom of the plate
//
// Views 2 and 4 face the side wings, where the tower's own other wing fills
// most of the frame, so the side units borrow from the top and bottom shots
// instead. Every unit is locked to its own part of a shot (see LAYOUT): the
// side units 3, 4, 7, 8 to one half, and units 1, 2 (top wing) and 5, 6
// (bottom wing) to a wider span, see WIDE.
//
// Each frame is shot facing out from its wing's balconies, so its left end is
// what the left-hand unit sees standing at the balcony: unit 1 on the top
// wing, and unit 5 on the bottom wing (which looks down the page, so its
// left-hand unit is the one on the plate's right).
//
// TRIM is cut off both outer ends of every frame before the split. All
// Skyleap frames are exported at the same 8046 x 1440, so one value fits every
// floor. 0.162 is measured from the framing the client approved on floor 42.
//
// Applies to every floor. skyleapViews.js (generated) still lists which
// frames exist per floor; this file decides which unit sees which part.

const TRIM = 0.162
const LEFT = [TRIM, 0.5]
const RIGHT = [0.5, 1 - TRIM]

// Units 1, 2 (top wing) and 5, 6 (bottom wing) sit side by side with nothing
// between them, so each sees most of the frame rather than half: from its own
// outer edge to 80% of the way across the (trimmed) frame. The two ranges
// overlap in the middle. Side units 3, 4, 7, 8 keep the plain halves.
const WIDE = 0.8
const SPAN = 1 - 2 * TRIM
const WIDE_LEFT = [TRIM, TRIM + SPAN * WIDE]
const WIDE_RIGHT = [1 - TRIM - SPAN * WIDE, 1 - TRIM]

const LAYOUT = {
  1: { view: 3, crop: WIDE_LEFT },
  8: { view: 3, crop: LEFT },
  2: { view: 3, crop: WIDE_RIGHT },
  3: { view: 3, crop: RIGHT },
  5: { view: 1, crop: WIDE_LEFT },
  7: { view: 1, crop: LEFT },
  6: { view: 1, crop: WIDE_RIGHT },
  4: { view: 1, crop: RIGHT },
}

export { SKYLEAP_VIEWS }

// Floors (ascending) where the given unit position has a panorama.
export const floorsForPosition = (position) => {
  const view = LAYOUT[position]?.view
  if (!view) return []
  return Object.keys(SKYLEAP_VIEWS)
    .map(Number)
    .filter((f) => SKYLEAP_VIEWS[f].includes(view))
    .sort((a, b) => a - b)
}

// Public path to a panorama, or null when that apartment has no view.
export const viewImage = (floor, position) => {
  const entry = LAYOUT[position]
  return entry && SKYLEAP_VIEWS[floor]?.includes(entry.view)
    ? `/unit/views/skyleap/${floor}-${entry.view}.webp`
    : null
}

// The part of the frame (fractions of its width) this apartment may see, or
// null for the whole frame.
export const viewCrop = (floor, position) =>
  SKYLEAP_VIEWS[floor] ? LAYOUT[position]?.crop ?? null : null
