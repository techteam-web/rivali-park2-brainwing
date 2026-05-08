import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import LayoutTuner from '../../dev/LayoutTuner'

const Layout = () => {
  const { pathname } = useLocation()
  const isFullscreen = pathname === '/about' || pathname.startsWith('/gallery')

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

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
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
