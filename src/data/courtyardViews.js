import * as stargazeViews from './stargazeViews'
import * as moonriseViews from './moonriseViews'
import * as sunburstViews from './sunburstViews'

// Per-tower panorama manifests (each exposes floorsForPosition + viewImage over
// its own /unit/views assets). Towers without panoramas are simply absent, so
// callers fall back to a "coming soon" state.
export const VIEW_SOURCES = {
  stargaze: stargazeViews,
  moonrise: moonriseViews,
  sunburst: sunburstViews,
}

// Floors (ascending) where `tower`'s given svg position has a panorama.
export const floorsForTowerPosition = (tower, position) => {
  const views = VIEW_SOURCES[tower]
  return views && position ? views.floorsForPosition(position) : []
}

// Public path to a panorama, or null when unavailable.
export const viewImageForTowerPosition = (tower, floor, position) => {
  const views = VIEW_SOURCES[tower]
  return views && floor != null ? views.viewImage(floor, position) : null
}

// "1ST FLOOR", "2ND FLOOR", "23RD FLOOR", "25TH FLOOR" — handles the 11/12/13
// exceptions correctly.
export const ordinal = (n) => {
  const s = ['TH', 'ST', 'ND', 'RD']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
}
