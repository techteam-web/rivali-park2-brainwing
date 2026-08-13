import { useCallback, useEffect, useRef, useState } from 'react'
import { usePageTransition } from '../../hooks/usePageTransition'
import LocationsCanvas from '../../three/LocationsCanvas'
import LocationsLoader from '../loaders/LocationsLoader'
import LocationsNav from './LocationsNav'
import LocationCard from './LocationCard'
// [dev camera capture - commented out, restore together] Used only by the capture panel's dropdown.
// import { getCategoryLocations } from './locationsData' // DEV capture panel only

// Main view for the /locations route. Kept as a component (mirroring how
// TowersLanding/TowerDetail live under components/towers) so the page file
// stays thin and any locations sub-components can be composed in here later.
const LocationsView = () => {
  const pageRef = useRef(null)
  // Gallery-style rise-out-of-blur entrance; exitTo drives the route change back
  // home so the back arrow plays the same transition as the other pages.
  const { exitTo } = usePageTransition({ containerRef: pageRef })
  // Which category panel is open. Click-driven and sticky: a click opens it and it
  // stays until you click the same category again, another category, or outside the
  // bar. Single source of truth for the nav highlight and its flyout.
  const [activeCategory, setActiveCategory] = useState(null)

  // The single chosen route within the open category, or null to show the whole category
  // set (see src/three/RouteLayer.jsx). Opening a category shows every path in it; picking
  // a location row keeps that one and retracts the others out. Cleared whenever the open
  // category changes (handleCategoryChange + the outside-click handler below).
  const [selectedLocationId, setSelectedLocationId] = useState(null)

  // Is the category's location list (the drop-up) actually on screen? Tracked
  // SEPARATELY from activeCategory: picking a location closes the list so it
  // stops covering the map, while the category stays open so the chosen route,
  // its card and the camera framing all hold (client feedback, 08 Aug). Tapping
  // the lit category button again brings the list back.
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)

  // Phase flag for the sequenced deselect: selected -> exiting -> idle. While true, the routes
  // retract-out and the card fades out, the camera HOLDS at the category framing, and the idle rig
  // stays inert. activeCategory/selectedLocationId are kept ALIVE during this window (so the routes
  // stay mounted to retract and CameraRig does not move); the actual null transition is DEFERRED to
  // handleExitComplete (Phase B), fired once the routes finish retracting. See RouteLayer onAllExited.
  const [isExiting, setIsExiting] = useState(false)
  // Mirror so handleExitComplete can guard against a stale completion (mid-exit switch/reopen) while
  // staying a stable useCallback.
  const isExitingRef = useRef(false)
  useEffect(() => {
    isExitingRef.current = isExiting
  }, [isExiting])

  // Flips once the loading overlay has finished fading out, which unmounts it.
  const [overlayGone, setOverlayGone] = useState(false)

  // Flips once the 3D scene has painted a real frame, i.e. past the synchronous
  // shader-compile + first-render spike. The loader waits for this before fading,
  // so GSAP never tries to tween across that blocked frame. Same signal the towers
  // detail uses to hold its entrance (see src/three/FirstFrameSignal.jsx).
  const [sceneRendered, setSceneRendered] = useState(false)
  // Stable identity so the memo on LocationsCanvas actually holds.
  const handleSceneReady = useCallback(() => setSceneRendered(true), [])

  /* [dev camera capture - commented out, restore together]
     DEV-only camera capture: captureMode suspends the category lock in CameraRig so you can orbit
     with a category open; selectedCaptureId tags the logged framing. Only the dev panel below flips
     captureMode true, so it stays false in production (no behavior change).

  const [captureMode, setCaptureMode] = useState(false)
  const [selectedCaptureId, setSelectedCaptureId] = useState('')
  */

  // Open, switch, or close a category. Opening/switching (non-null id) resets the selection so the
  // fresh category draws its full set in, and cancels any in-flight exit. A null id (toggle off)
  // starts the sequenced exit instead of hard-clearing: activeCategory/selectedLocationId stay put
  // so the routes retract and the camera holds; the null transition happens in handleExitComplete.
  const handleCategoryChange = (id) => {
    if (id == null) {
      setIsExiting(true) // Phase A; the null transition is deferred to handleExitComplete (Phase B).
      setIsFlyoutOpen(false)
      return
    }
    setIsExiting(false)
    setActiveCategory(id)
    setSelectedLocationId(null)
    setIsFlyoutOpen(true)
  }

  // Re-tapping the lit category button while its list is hidden just brings the
  // list back — the current selection, route and camera are left alone, so this
  // is never a way to lose your place.
  const handleReopenFlyout = () => setIsFlyoutOpen(true)

  // Picking a location keeps the category open and hides the list, so nothing
  // sits over the establishment you just selected.
  const handleSelectLocation = (location) => {
    setSelectedLocationId((prev) => (prev === location.id ? null : location.id))
    setIsFlyoutOpen(false)
  }

  // Phase B: the route retract-out has finished (RouteLayer onAllExited). NOW drop the selection so
  // the routes/card unmount and isIdle flips true, releasing the camera to IdleOrbitController, which
  // eases from the held position to the nearest ring. Guarded so a stale completion after a mid-exit
  // switch/reopen is a no-op.
  const handleExitComplete = useCallback(() => {
    if (!isExitingRef.current) return
    setActiveCategory(null)
    setSelectedLocationId(null)
    setIsExiting(false)
    setIsFlyoutOpen(false)
  }, [])

  // Close the open panel on any pointer-down outside the nav bar. navRef attaches to
  // the nav wrapper, which contains both the buttons and the flyout (rendered once as
  // a sibling of the pill and positioned by measurement), so clicks on either stay
  // open while a click anywhere else closes it. Armed only while a panel is open;
  // mirrors the outside-close pattern used by the unit-plan menus.
  // [dev camera capture - commented out, restore together] Capture mode used to disarm this, so
  // dragging the map to orbit would not deselect the category. Restore as:
  // if (!activeCategory || captureMode) return  ...and add captureMode back to the dep array.
  const navRef = useRef(null)
  useEffect(() => {
    if (!activeCategory) return
    const onPointerDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsExiting(true) // Phase A; the null transition is deferred to handleExitComplete.
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [activeCategory])

  /* [dev camera capture - commented out, restore together]
     DEV capture panel: the dropdown lists the open category's locations. captureId is the
     effective, always-valid selection (the remembered pick if it belongs to the open category,
     else the first option), so the controlled <select> never warns across a category switch.

  const captureOptions = import.meta.env.DEV && activeCategory ? getCategoryLocations(activeCategory) : []
  const captureId = captureOptions.some((l) => l.id === selectedCaptureId)
    ? selectedCaptureId
    : (captureOptions[0]?.id ?? '')
  */

  return (
    <>
      <div
        ref={pageRef}
        className="relative min-h-screen w-full overflow-hidden bg-black text-white"
      >
        {/* Back to home — same pill/arrow pattern as TowersLanding. */}
        <button
          type="button"
          aria-label="Back"
          onClick={() => exitTo('/')}
          className="absolute top-5 left-5 z-50 flex items-center justify-center rounded-full bg-white/20 text-white transition-[transform,background-color] duration-200 hover:bg-white/30 hover:scale-[1.05] focus:outline-none focus-visible:bg-white/30 focus-visible:scale-[1.05] h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* [dev camera capture - commented out, restore together]
            DEV-only camera capture panel. Capture mode ON suspends the category lock (see captureMode
            in src/three/CameraRig.jsx) so you can orbit with a category open, frame a route, pick its
            id, and Log camera to print a paste-ready block tagged with that id (see CameraLogger).
            Restore together with: the captureMode/selectedCaptureId state and the captureOptions/
            captureId derived values above, the getCategoryLocations import, the captureMode prop on
            LocationsCanvas below, the captureMode plumbing in LocationsCanvas + CameraRig, and the
            CameraLogger render in LocationsCanvas (the only listener for the 'log-camera' event
            dispatched here).

        {import.meta.env.DEV && (
          <div className="pointer-events-auto absolute bottom-5 right-5 z-20 flex w-56 flex-col gap-2 rounded-lg bg-black/70 p-3 font-mono text-xs text-white backdrop-blur-sm">
            <div className="text-[11px] font-bold text-white/80">Camera capture</div>
            <button
              type="button"
              onClick={() => setCaptureMode((v) => !v)}
              className={`rounded px-2 py-1 transition-colors ${captureMode ? 'bg-amber-500/80 text-black hover:bg-amber-500' : 'bg-white/20 hover:bg-white/30'}`}
            >
              Capture mode: {captureMode ? 'ON' : 'OFF'}
            </button>
            <select
              value={captureId}
              onChange={(e) => setSelectedCaptureId(e.target.value)}
              disabled={captureOptions.length === 0}
              className="rounded bg-white/10 px-2 py-1 text-white outline-none focus:bg-white/15 disabled:opacity-40"
            >
              {captureOptions.length === 0 ? (
                <option value="">open a category</option>
              ) : (
                captureOptions.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))
              )}
            </select>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('log-camera', { detail: { locationId: captureId } }))}
              disabled={!captureId}
              className="rounded bg-white/20 px-2 py-1 transition-colors hover:bg-white/30 disabled:opacity-40"
            >
              Log camera
            </button>
            <div className="text-[10px] leading-tight text-white/50">
              {captureMode ? 'Orbit unlocked. Frame a route, pick its id, Log camera.' : 'Turn ON, then open a category to orbit.'}
            </div>
          </div>
        )}
        */}

        {/* Dev-only building placement trigger — COMMENTED OUT. Re-enable together
            with the gizmo in src/three/MainBuildingRig.jsx to re-place the building
            (drag/rotate/scale, then click to log a paste-ready transform).

        {import.meta.env.DEV && (
          <div className="absolute bottom-16 right-5 z-10 flex items-center gap-2">
            <span className="font-mono text-[10px] text-white/50">
              W move, E rotate, R scale, [ ] resize
            </span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('log-building'))}
              className="rounded-full bg-white/20 px-3 py-1.5 font-mono text-xs text-white transition-colors duration-200 hover:bg-white/30 focus:outline-none focus-visible:bg-white/30"
            >
              Log building transform
            </button>
          </div>
        )}
        */}

        {/* Fullscreen 3D map fills the container; back button sits above at z-10.
            [dev camera capture - commented out, restore together] also passed captureMode={captureMode} */}
        <div className="absolute inset-0">
          <LocationsCanvas
          activeCategory={activeCategory}
          selectedLocationId={selectedLocationId}
          isExiting={isExiting}
          onExitComplete={handleExitComplete}
          onReady={handleSceneReady}
        />
        </div>

        {/* Location detail card, docked top-right. Shows when a location is selected and
            self-hides (returns null) when selectedLocationId is null -- same lifecycle as
            the route. Owns its own positioning/z/pointer-events. */}
        <LocationCard locationId={selectedLocationId} exiting={isExiting} />

        {/* Bottom-center category bar. Clicking a category opens its panel above the
            bar, anchored to the tapped button and measured so it clears the bar; it
            stays open until an outside click. Rows toggle like the category buttons do:
            re-tapping the selected row clears it, so the route and card go away and the
            camera flies back to the category framing. */}
        <LocationsNav
          navRef={navRef}
          activeCategory={isExiting ? null : activeCategory}
          isFlyoutOpen={isFlyoutOpen && !isExiting}
          selectedLocationId={selectedLocationId}
          onCategoryChange={handleCategoryChange}
          onReopenFlyout={handleReopenFlyout}
          onSelectLocation={handleSelectLocation}
        />
      </div>

      {/* Covers the canvas-init + asset-load stall until the 3D scene is ready.
          Sibling of pageRef, not a child: usePageTransition hides its container on
          mount and fades it in out of a blur, which would blur the loader too. The
          page entrance plays underneath, so the map is fully faded in by the time
          the overlay clears. */}
      {!overlayGone && (
        <LocationsLoader
          sceneRendered={sceneRendered}
          onExitComplete={() => setOverlayGone(true)}
        />
      )}
    </>
  )
}

export default LocationsView
