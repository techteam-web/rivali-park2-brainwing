import StargazeOverlay from './StargazeOverlay'
import UnitFootprints from './UnitFootprints'
import {
  OVERLAY_TOWER,
  PLAN_W,
  PLAN_H,
  STARGAZE_OVERLAY,
  STARGAZE_OVERLAY_VB,
  UNIT_SHEET_VB,
  towerFootprints,
  towerLabel,
  towerPlan,
} from '../../data/unitPlans'

// Key plan (locator): the tower's whole floor plate with only the selected
// unit's footprint filled in, so you can see where that apartment sits on the
// floor. The unit detail sheet shows one in its info panel; the compare view
// insets a small one into the corner of each plan sheet.
//
// This box is the ARTWORK's own aspect ratio, so the component's bounds are
// exactly what you see — nothing is letterboxed inside it. That is what lets the
// compare view place it against measured clearances and know it can't collide
// with the drawing.
//
// The detail sheet instead renders the artwork `object-contain` inside a
// PLAN_W x PLAN_H (1320:704) box, which letterboxes it to the middle ~75% of the
// width, and STARGAZE_OVERLAY was hand-tuned in the editor against THAT box.
// Rather than re-tuning a second set of numbers by eye, the placement is re-based
// into artwork space here — STARGAZE_OVERLAY stays the single source of truth, so
// re-tuning it still moves both.
const CONTAIN = UNIT_SHEET_VB.w / UNIT_SHEET_VB.h / (PLAN_W / PLAN_H)
const SIDE_PAD = (1 - CONTAIN) / 2

const SG = {
  // Heights match (the artwork fills the box vertically), so `top` carries over.
  left: ((STARGAZE_OVERLAY.left / 100 - SIDE_PAD) / CONTAIN) * 100,
  top: STARGAZE_OVERLAY.top,
  width: STARGAZE_OVERLAY.width / CONTAIN,
}

// Stargaze's footprints predate the full-sheet export format and are hand-placed
// (see StargazeOverlay); every other tower ships a units.svg drawn in the sheet's
// own coordinate space, which needs no placement at all. Towers with neither
// render nothing rather than a plate with no unit marked.
const hasKeyPlan = (tower) =>
  tower === OVERLAY_TOWER || Boolean(towerFootprints(tower))

// Fills its parent's width and takes its height from the artwork's ratio, so
// callers position it by sizing a wrapper — it owns no placement of its own.
const UnitKeyPlan = ({ tower, unitN, className = '' }) => {
  if (!hasKeyPlan(tower)) return null

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ aspectRatio: `${UNIT_SHEET_VB.w} / ${UNIT_SHEET_VB.h}` }}
    >
      <img
        src={towerPlan(tower)}
        alt={`${towerLabel(tower)} floor plan`}
        className="absolute inset-0 h-full w-full object-contain"
      />
      {tower === OVERLAY_TOWER ? (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${SG.left}%`,
            top: `${SG.top}%`,
            width: `${SG.width}%`,
            aspectRatio: `${STARGAZE_OVERLAY_VB.w} / ${STARGAZE_OVERLAY_VB.h}`,
          }}
        >
          <StargazeOverlay highlightOnly={unitN} />
        </div>
      ) : (
        // units.svg shares the sheet's coordinate space, so it lines up by
        // simply filling this box.
        <div className="pointer-events-none absolute inset-0">
          <UnitFootprints tower={tower} highlightOnly={unitN} />
        </div>
      )}
    </div>
  )
}

export default UnitKeyPlan
