import { getCategoryLocations } from './locationsData'

// > 7 location rows => two columns. access=10 qualifies; leisure=7 stays single.
const TWO_COL_THRESHOLD = 7

// Sizes here are authored at the 1920 look; LocationsNav's scale layer scales them
// proportionally, so there are no breakpoint ramps.

// Structure + padding only; the color/hover/active state is applied per row in renderRow.
const ROW_BASE =
  'flex w-full items-center rounded-[2px] text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-on-light-black/40 px-4 py-3 z-100'
const ROW_TEXT_CLASS = 'whitespace-nowrap uppercase leading-none tracking-[0.12em] text-xs'
// Vertical rhythm INSIDE a column, identical to the single column.
const COLUMN_GAP = 'gap-1'
// The card = scroll container. A uniform p-* inset gives a little space around each
// full-width row and keeps the last row off the rounded corner. Combined with the
// flyout now sitting fully ABOVE the bar (positioned by LocationsNav), nothing is
// clipped. w-max grows for two columns; the max-w/max-h rails come in via `style`
// from the nav -- they are viewport fractions converted to this layer's local units,
// since a max-w-[80vw] class would be measured pre-transform and then scaled up.
const CARD_CLASS =
  'pointer-events-auto absolute z-50 w-max overflow-y-auto overscroll-contain scrollbar-hidden rounded-[1px] bg-white shadow-2xl p-2'

// The ONLY place row markup lives. The selected row (and any hovered row) shows the
// brown pill with white text; the icon-less rows just flip text color.
const renderRow = (location, onSelect, selectedLocationId) => {
  const state =
    selectedLocationId === location.id
      ? 'bg-[#7A4833] text-white'
      : 'text-on-light-grey hover:bg-[#7A4833] hover:text-white'
  return (
    <button key={location.id} type="button" onClick={() => onSelect(location)} className={`${ROW_BASE} ${state}`}>
      <span className={ROW_TEXT_CLASS}>{location.name}</span>
    </button>
  )
}

// Balanced-by-count split for a flat list.
const splitFlat = (rows) => {
  const half = Math.ceil(rows.length / 2)
  return [rows.slice(0, half), rows.slice(half)]
}

// Returns an array of columns (each an array of nodes). Length 1 => single column,
// length 2 => two columns, length 0 => render nothing. Every category renders its
// flat location list; long lists (> threshold) split into two balanced columns.
const buildColumns = (activeCategory, onSelect, selectedLocationId) => {
  const flat = getCategoryLocations(activeCategory)
  if (flat.length === 0) return []
  if (flat.length > TWO_COL_THRESHOLD) {
    return splitFlat(flat).map((col) => col.map((location) => renderRow(location, onSelect, selectedLocationId)))
  }
  return [flat.map((location) => renderRow(location, onSelect, selectedLocationId))]
}

// Presentational + stateless card listing the active category's flat location list.
// Tall categories split into two balanced columns by row count. Position
// (left/bottom/visibility) and the max-width/height rails are passed in via `style`
// from LocationsNav's measurement; containerRef lets the nav measure the card's width.
// The flat `locations` list stays the source of truth for the marker/camera passes.
const LocationsFlyout = ({ activeCategory, onSelectLocation, selectedLocationId, containerRef, style }) => {
  if (!activeCategory) return null

  const columns = buildColumns(activeCategory, onSelectLocation, selectedLocationId)
  if (columns.length === 0) return null

  const twoCol = columns.length === 2

  return (
    <div
      ref={containerRef}
      style={style}
      className={
        twoCol ? `${CARD_CLASS} flex flex-row items-start gap-3` : `${CARD_CLASS} flex flex-col ${COLUMN_GAP}`
      }
    >
      {twoCol
        ? columns.map((col, i) => (
            <div key={i} className={`flex flex-col ${COLUMN_GAP}`}>
              {col}
            </div>
          ))
        : columns[0]}
    </div>
  )
}

export default LocationsFlyout
