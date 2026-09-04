import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

// The route the app was on before the current one. Null on a cold load (a
// deep link, a refresh, the very first paint).
let previousPath = null

// Called once by <Layout>, which wraps every route.
//
// Ordering is what makes this work: React runs child effects BEFORE parent
// effects, and a page reads `previousPath` during render — earlier still. So a
// page mounting at a new route sees the value written on the previous
// navigation, which is exactly the route it came from, and only afterwards
// does this overwrite it for the next one.
export function useRecordPath() {
  const { pathname } = useLocation()
  useEffect(() => {
    previousPath = pathname
  }, [pathname])
}

// Whether this page should play its loading screen on this particular visit.
//
// The loader introduces a section on the way in from the homepage — it is not
// a spinner that fires every time the route mounts. Coming back to a section's
// hub from one of its own nested pages (gallery → a club → back to gallery,
// towers → a tower → back) should land on the page directly, with no loader
// replaying over content the user has already seen.
//
// So it plays on a cold load, and when arriving from the homepage. Never
// otherwise. Read once at mount, so it can't flip mid-visit.
export function useEntryLoader() {
  const [play] = useState(() => previousPath === null || previousPath === '/')
  return play
}
