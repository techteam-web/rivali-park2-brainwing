import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import FullscreenGate from './components/layout/FullscreenGate'

// Every page is its own chunk. Imported eagerly they all landed in one 2.4 MB
// bundle, and the 3D pages' module-scope preloads (Map.glb, the tower and bird
// models, the terrain textures, ~30 MB) then fired on whichever page loaded
// first, even a gallery slide. Now a page pulls only its own code, and the rest
// are warmed in the background once the first page has settled, so moving
// between pages still doesn't wait on a download.
const routes = {
  Home: () => import('./pages/Home'),
  AboutUs: () => import('./pages/AboutUs'),
  Towers: () => import('./pages/Towers'),
  Gallery: () => import('./pages/Gallery'),
  SocialClub: () => import('./pages/SocialClub'),
  SocialClubHotspot: () => import('./pages/SocialClubHotspot'),
  WellnessClub: () => import('./pages/WellnessClub'),
  WellnessClubHotspot: () => import('./pages/WellnessClubHotspot'),
  CentralCourtyard: () => import('./pages/CentralCourtyard'),
  CentralCourtyardHotspot: () => import('./pages/CentralCourtyardHotspot'),
  SkyClub: () => import('./pages/SkyClub'),
  SkyClubHotspot: () => import('./pages/SkyClubHotspot'),
  ConventionCenter: () => import('./pages/ConventionCenter'),
  ConventionCenterHotspot: () => import('./pages/ConventionCenterHotspot'),
  UnitPlans: () => import('./pages/UnitPlans'),
  UnitPlanDetail: () => import('./pages/UnitPlanDetail'),
  UnitPlanCompare: () => import('./pages/UnitPlanCompare'),
  Maps: () => import('./pages/Maps'),
  Locations: () => import('./pages/Locations'),
  Viewspage: () => import('./pages/ViewsPage'),
  Video: () => import('./pages/Video'),
}
const L = Object.fromEntries(
  Object.entries(routes).map(([name, load]) => [name, lazy(load)]),
)
const { Home, AboutUs, Towers, Gallery, SocialClub, SocialClubHotspot, WellnessClub, WellnessClubHotspot, CentralCourtyard, CentralCourtyardHotspot, SkyClub, SkyClubHotspot, ConventionCenter, ConventionCenterHotspot, UnitPlans, UnitPlanDetail, UnitPlanCompare, Maps, Locations, Viewspage, Video } = L

// Towers and Locations are left out: loading their code runs the 3D asset
// preloads at module scope (useGLTF/useTexture.preload), so warming them would
// pull the ~30 MB of models and textures on every page. They have their own
// loading screens, which cover the fetch when someone actually opens them.
const COLD_ROUTES = new Set(['Towers', 'Locations'])
const warmRoutes = () => {
  Object.entries(routes).forEach(([name, load]) => {
    if (!COLD_ROUTES.has(name)) load().catch(() => {})
  })
}
const App = () => {
  // Warm the other pages only after this one has loaded and gone idle, so
  // their downloads never compete with the page actually on screen.
  useEffect(() => {
    let idle
    const start = () => {
      const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 1))
      idle = setTimeout(() => ric(warmRoutes), 2500)
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => {
      clearTimeout(idle)
      window.removeEventListener('load', start)
    }
  }, [])

  return (
    <>
    {/* Sits above every route, loaders included; see FullscreenGate. */}
    <FullscreenGate />
    <Suspense fallback={null}>
    <Routes>
         
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/towers" element={<Towers />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/gallery/social-club" element={<SocialClub />} />
        <Route path="/gallery/social-club/:hotspot" element={<SocialClubHotspot />} />
        <Route path="/gallery/wellness-club" element={<WellnessClub />} />
        <Route path="/gallery/wellness-club/:hotspot" element={<WellnessClubHotspot />} />
        <Route path="/gallery/central-courtyard" element={<CentralCourtyard />} />
        <Route path="/gallery/central-courtyard/:hotspot" element={<CentralCourtyardHotspot />} />
        <Route path="/gallery/sky-club" element={<SkyClub />} />
        <Route path="/gallery/sky-club/:hotspot" element={<SkyClubHotspot />} />
        <Route path="/gallery/convention-center" element={<ConventionCenter />} />
        <Route path="/gallery/convention-center/:hotspot" element={<ConventionCenterHotspot />} />
        <Route path="/unit-plans" element={<UnitPlans />} />
        <Route path="/unit-plans/compare" element={<UnitPlanCompare />} />
        <Route path="/unit-plans/:tower/:n" element={<UnitPlanDetail />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/locations" element={<Locations />} />
        {/* The navbar's "360" links here; it shows the Marzipano panorama
            viewer (formerly /viewspage, kept below as an alias). */}
        <Route path="/360" element={<Viewspage />} />
        <Route path="/viewspage" element={<Viewspage />} />
        <Route path="/video" element={<Video />} />
        <Route path="/construction" element={<Video videoId="1cio1iIzrqM" loader="construction" />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </Suspense>
    </>
  )
}

export default App
