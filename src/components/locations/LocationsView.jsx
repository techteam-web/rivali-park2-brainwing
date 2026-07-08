import { useEffect, useRef, useState } from 'react'
import { usePageTransition } from '../../hooks/usePageTransition'
import LocationsCanvas from '../../three/LocationsCanvas'
import LocationsNav from './LocationsNav'
import LocationCard from './LocationCard'

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

  // Open, switch, or close a category. Resets the selection so the fresh category draws its
  // full set in; a null id (toggle off) hard-clears the routes.
  const handleCategoryChange = (id) => {
    setActiveCategory(id)
    setSelectedLocationId(null)
  }

  /* Road path tracer panel state + count listener COMMENTED OUT. Re-enable together with
     the tracer panel JSX below and <RoadPathTracer /> in src/three/LocationsCanvas.jsx.
     capture toggles click-to-drop in the canvas, count mirrors the live waypoint count
     RoadPathTracer emits, and locId tags the copied array.

  const [capture, setCapture] = useState(false)
  const [count, setCount] = useState(0)
  const [locId, setLocId] = useState('')
  useEffect(() => {
    const onChanged = (e) => setCount(e.detail?.count ?? 0)
    window.addEventListener('road-path-changed', onChanged)
    return () => window.removeEventListener('road-path-changed', onChanged)
  }, [])
  */

  // Close the open panel on any pointer-down outside the nav bar. navRef attaches to
  // the nav wrapper, which contains both the buttons and the flyout (rendered once as
  // a sibling of the pill and positioned by measurement), so clicks on either stay
  // open while a click anywhere else closes it. Armed only while a panel is open;
  // mirrors the outside-close pattern used by the unit-plan menus.
  const navRef = useRef(null)
  useEffect(() => {
    if (!activeCategory) return
    const onPointerDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveCategory(null)
        setSelectedLocationId(null)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [activeCategory])

  return (
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

      {/* Dev-only camera framing logger COMMENTED OUT. Re-enable together with
          <CameraLogger /> in src/three/LocationsCanvas.jsx. Captures the current camera
          framing to the console so it can be hardcoded in src/three/locationsConfig.js.

      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('log-camera'))}
          className="absolute bottom-5 right-5 z-10 rounded-full bg-white/20 px-3 py-1.5 font-mono text-xs text-white transition-colors duration-200 hover:bg-white/30 focus:outline-none focus-visible:bg-white/30"
        >
          Log camera position
        </button>
      )}
      */}

      {/* Dev-only road path tracer COMMENTED OUT. Re-enable together with the tracer
          state/effect above and <RoadPathTracer /> in src/three/LocationsCanvas.jsx.
          Toggle Capture, then click along the roads to drop ordered waypoints (drag still
          orbits); Copy path writes a paste-ready cameraPath array to the clipboard/console.

      {import.meta.env.DEV && (
        <div className="pointer-events-auto absolute top-5 right-5 z-20 flex w-44 flex-col gap-2 rounded-lg bg-black/70 p-3 font-mono text-xs text-white backdrop-blur-sm">
          <div className="text-[11px] font-bold text-white/80">Road path tracer</div>
          <button
            type="button"
            onClick={() => {
              const next = !capture
              setCapture(next)
              window.dispatchEvent(new CustomEvent('road-capture-toggle', { detail: { enabled: next } }))
            }}
            className={`rounded px-2 py-1 transition-colors ${capture ? 'bg-amber-500/80 text-black hover:bg-amber-500' : 'bg-white/20 hover:bg-white/30'}`}
          >
            Capture: {capture ? 'ON' : 'OFF'}
          </button>
          <div className="text-white/70">points: {count}</div>
          <input
            type="text"
            value={locId}
            onChange={(e) => setLocId(e.target.value)}
            placeholder="location id"
            className="rounded bg-white/10 px-2 py-1 text-white placeholder-white/40 outline-none focus:bg-white/15"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('road-path-undo'))}
              className="flex-1 rounded bg-white/20 px-2 py-1 transition-colors hover:bg-white/30"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('road-path-clear'))}
              className="flex-1 rounded bg-white/20 px-2 py-1 transition-colors hover:bg-white/30"
            >
              Clear
            </button>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('road-path-copy', { detail: { locationId: locId } }))}
            className="rounded bg-white/20 px-2 py-1 transition-colors hover:bg-white/30"
          >
            Copy path
          </button>
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

      {/* Fullscreen 3D map fills the container; back button sits above at z-10. */}
      <div className="absolute inset-0">
        <LocationsCanvas activeCategory={activeCategory} selectedLocationId={selectedLocationId} />
      </div>

      {/* Location detail card, docked top-right. Shows when a location is selected and
          self-hides (returns null) when selectedLocationId is null -- same lifecycle as
          the route. Owns its own positioning/z/pointer-events. */}
      <LocationCard locationId={selectedLocationId} />

      {/* Bottom-center category bar. Clicking a category opens its panel above the
          bar, anchored to the tapped button and measured so it clears the bar; it
          stays open until an outside click. Placeholder select for now; the camera
          flight wires in a later pass. */}
      <LocationsNav
        navRef={navRef}
        activeCategory={activeCategory}
        selectedLocationId={selectedLocationId}
        onCategoryChange={handleCategoryChange}
        onSelectLocation={(location) => setSelectedLocationId(location.id)}
      />
    </div>
  )
}

export default LocationsView
