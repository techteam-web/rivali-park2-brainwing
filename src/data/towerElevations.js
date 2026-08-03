// Per-tower line-art elevation drawings + the architects' own floor-shape
// overlays, used by the tower elevation screen
// (/towers?tower=<id>&view=floors).
//
// Both files come straight from the architects' Illustrator artwork and share
// the same 4096.08 x 2712.24 user space, so the overlay sits on the drawing
// pixel-perfectly at any rendered size — the two <svg>s just need the same
// viewBox.
//
// FLOOR SHAPES
// ------------
// `floorsSrc` is an overlay SVG whose top-level groups ARE the floors: each one
// is named for the floor it covers (`data-name="23rd"`), and holds the exact
// shape of that storey — a plain rect on a straight-on elevation, a perspective
// polygon on Stargaze, which is drawn corner-on. That makes the artwork the
// single source of truth for floor geometry: nothing here interpolates or
// guesses, so a highlight can never drift off its row.
//
// A tower with no `floorsSrc` yet simply has no elevation screen — its "Plans"
// button goes straight to the floor plans, exactly as it did before. Drop the
// overlay in and it lights up; nothing else needs changing.
//
// `content` is the drawn extent of the illustration (each plate carries ~400
// units of empty margin), used as the default viewBox so the tower fills the
// screen. `focus` is a tighter crop around the tower itself, used on
// narrow/portrait viewports where the full plate would shrink it to a sliver.

export const ELEVATION_VB = { w: 4096.08, h: 2712.24 }

export const TOWER_ELEVATIONS = {
  skyleap: {
    src: '/towers/skyleap/Skyleap-Illustration.svg',
    // Three-wing tower: each storey is split across a left, centre and right
    // section, so a floor arrives as up to three same-named groups (the centre
    // stops short of the top, which is why floors 49-52 have only two). They're
    // merged back into one floor on load — see parseFloorGroups.
    floorsSrc: '/towers/skyleap/Skyleap-Floors.svg',
    accent: '#557E92',
    content: { x: 443, y: 196, w: 3177, h: 2481 },
    focus: { x: 991, y: 0, w: 2106, h: 2712 },
  },
  moonrise: {
    src: '/towers/moonrise/Moonrise-Illustration.svg',
    floorsSrc: '/towers/moonrise/Moonrise-Floors.svg',
    accent: '#839033',
    content: { x: 416, y: 53, w: 3284, h: 2615 },
    focus: { x: 1044, y: 0, w: 1967, h: 2712 },
  },
  stargaze: {
    src: '/towers/stargaze/Stargaze-Illustration.svg',
    floorsSrc: '/towers/stargaze/Stargaze-Floors.svg',
    accent: '#A4687B',
    content: { x: 380, y: 37, w: 3176, h: 2609 },
    focus: { x: 1050, y: 0, w: 1850, h: 2712 },
  },
  sunburst: {
    src: '/towers/sunburst/Sunburst-Illustration.svg',
    floorsSrc: '/towers/sunburst/Sunburst-Floors.svg',
    accent: '#B08D66',
    content: { x: 394, y: 67, w: 3124, h: 2582 },
    focus: { x: 970, y: 0, w: 1897, h: 2712 },
  },
}

export const elevationFor = (tower) => TOWER_ELEVATIONS[tower] ?? null

// Whether this tower has its floor overlay yet. Gates the elevation screen.
export const hasFloorPicker = (tower) =>
  Boolean(TOWER_ELEVATIONS[tower]?.floorsSrc)

const boxToViewBox = (b) => `${b.x} ${b.y} ${b.w} ${b.h}`

// Default framing: the drawing cropped to its artwork, context and all.
export const contentViewBox = (tower) => {
  const e = elevationFor(tower)
  return e ? boxToViewBox(e.content) : `0 0 ${ELEVATION_VB.w} ${ELEVATION_VB.h}`
}

// Tight framing for narrow/portrait viewports.
export const towerViewBox = (tower) => {
  const e = elevationFor(tower)
  return e ? boxToViewBox(e.focus) : `0 0 ${ELEVATION_VB.w} ${ELEVATION_VB.h}`
}

// "23rd" / "3rd" / "shop" -> 23 / 3 / null. The overlay names floors the way a
// person would, so non-numeric groups (the retail podium) come back as null and
// are shown but not made selectable.
export const floorNumberFromName = (name) => {
  const m = /^\s*(\d+)/.exec(name ?? '')
  return m ? Number(m[1]) : null
}

// "1ST", "2ND", "23RD" — shares the 11/12/13 handling used by the unit-plan
// floor selectors (see data/courtyardViews.js).
export const floorOrdinal = (n) => {
  const s = ['TH', 'ST', 'ND', 'RD']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
}
