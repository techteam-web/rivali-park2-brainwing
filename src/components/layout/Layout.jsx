import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const Layout = () => {
  const { pathname } = useLocation()
  const isAbout = pathname === '/about'

  if (isAbout) {
    return (
      <div className="h-screen w-screen relative bg-white overflow-hidden">
        <main className="absolute inset-0">
          <Outlet />
        </main>
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
    </div>
  )
}

export default Layout
