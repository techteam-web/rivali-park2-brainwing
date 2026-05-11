import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import LayoutTuner from '../../dev/LayoutTuner'

const Layout = () => {
  const { pathname } = useLocation()
  const isFullscreen = pathname === '/about' || pathname.startsWith('/gallery')
  const isTowers = pathname === '/towers'
  const isHome = pathname === '/'
  const isAbout = pathname === '/about'
  const isViewspage = pathname === '/viewspage'

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
      <div className="h-screen w-screen relative bg-white overflow-hidden">
        <main className="absolute inset-0">
          <Outlet />
        </main>
        <LayoutTuner />
      </div>
    )
  }

  if (isViewspage || isHome || isAbout) {
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
      <LayoutTuner />
    </div>
  )
}

export default Layout
