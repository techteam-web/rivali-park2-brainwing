import { useCallback, useMemo, useState } from 'react'
import RouteCurve from './RouteCurve'
import { getCategoryLocations } from '../components/locations/locationsData'
import { getLocationPath } from '../components/locations/locationsPaths'

// Route-set manager for one category on the /locations map. Mounted keyed by category id in
// LocationsCanvas, so each instance lives for a single category and only reacts to the
// selection changing. It owns the mounted list of routes and keeps a route mounted through
// its retract-out animation (a route that leaves the shown set is flagged phase 'out' and only
// removed once its out-tween reports back via onExited), so the exit actually plays.
//
// Model:
//  - selection null  -> the full set: every location in the category that has a path draws in.
//  - selection an id -> that route holds ('in'); all others retract ('out') then unmount.
// Category switch / toggle-off is a hard-clear handled by the key in LocationsCanvas (this whole
// component unmounts), so there is no 'out' branch for the category changing.
export default function RouteLayer({ category, selectedLocationId }) {
  // Only locations with a captured path get a route (path-less ones drop out).
  const allIds = useMemo(
    () =>
      getCategoryLocations(category)
        .map((l) => l.id)
        .filter((id) => getLocationPath(id) != null),
    [category],
  )

  // Mounted routes with their phase. Fresh category opens with selection null, so the whole
  // set starts drawing in.
  const [routes, setRoutes] = useState(() => allIds.map((id) => ({ id, phase: 'in' })))

  // React to a selection change with the derive-during-render pattern (adjust state when a prop
  // changes) rather than a set-state effect: the selected route holds 'in', every other shown
  // route flips to 'out' to retract, and a route that had already exited is remounted 'in'.
  // Unchanged-phase entries keep their identity so the held route's RouteCurve does not
  // re-render or re-animate. The previous selection is tracked in state (not a ref) per React's
  // store-info-from-previous-renders pattern.
  const [prevSel, setPrevSel] = useState(selectedLocationId)
  if (selectedLocationId !== prevSel) {
    setPrevSel(selectedLocationId)
    if (selectedLocationId != null) {
      setRoutes((prev) => {
        let found = false
        const next = prev.map((rt) => {
          if (rt.id === selectedLocationId) {
            found = true
            return rt.phase === 'in' ? rt : { id: rt.id, phase: 'in' }
          }
          return rt.phase === 'out' ? rt : { id: rt.id, phase: 'out' }
        })
        if (!found) next.push({ id: selectedLocationId, phase: 'in' })
        return next
      })
    }
  }

  // A route's out-tween finished: drop it so it unmounts and disposes. A route reversed back to
  // 'in' mid-retract has its out-tween killed before completing, so this never fires for it.
  const handleExited = useCallback((id) => {
    setRoutes((prev) => prev.filter((rt) => rt.id !== id))
  }, [])

  return (
    <>
      {routes.map((rt) => (
        <RouteCurve key={rt.id} locationId={rt.id} phase={rt.phase} onExited={handleExited} />
      ))}
    </>
  )
}
