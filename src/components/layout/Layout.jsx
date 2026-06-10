import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

// Section-tinted veil colors revealed when a gallery page/hotspot fades
// out during a transition. Each is a deep, low-chroma tint of the section
// gradient already used at the bottom of that section's pages, so the
// "between pages" moment reads as a continuation of the scene instead of
// a flat slate. Layout transitions its bg with `transition-colors` so
// cross-section nav (e.g. /gallery → /gallery/wellness-club) eases the
// color shift instead of snapping.
const galleryTintFor = (pathname) => {
  if (!pathname.startsWith('/gallery')) return null
  if (pathname.includes('/wellness-club')) return '#3a1f26'    // deep rose
  if (pathname.includes('/sky-club')) return '#1e2820'         // deep green
  if (pathname.includes('/social-club')) return '#1a1a1c'      // deep neutral
  if (pathname.includes('/central-courtyard')) return '#1c2a30' // deep blue
  if (pathname.includes('/convention-center')) return '#2a2017' // deep mustard
  return '#1a1612' // /gallery hub — warm deep neutral
}

const Layout = () => {
  const { pathname } = useLocation()
  const isFullscreen = pathname === '/about' || pathname.startsWith('/gallery')
  const isTowers = pathname === '/towers'
  const isHome = pathname === '/'
  const isAbout = pathname === '/about'
  const isViewspage = pathname === '/viewspage'
  const isUnitPlans = pathname === '/unit-plans'
  const galleryTint = galleryTintFor(pathname)

  if (isTowers) {
    return (
      <div className="bg-white overflow-x-clip">
        <Header />
        <main className="-mt-22 4xl:-mt-26 5xl:-mt-36">
          <Outlet />
        </main>
      </div>
    )
  }

  if (isFullscreen) {
    return (
      <div
        className="h-screen w-screen relative overflow-hidden transition-colors duration-700 ease-out"
        style={{ backgroundColor: galleryTint ?? '#ffffff' }}
      >
        <main className="absolute inset-0">
          <Outlet />
        </main>
      </div>
    )
  }

  if (isViewspage || isHome || isAbout || isUnitPlans) {
    return (
      <div className="h-screen w-screen relative bg-white overflow-hidden">
        <main className="absolute inset-0">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-clip">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
