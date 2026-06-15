import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { usePageTransition } from '../../hooks/usePageTransition'

const navItems = [
  { to: '/about', label: 'About Us' },
  { to: '/towers', label: 'Towers' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/unit-plans', label: 'Unit Plans' },
  { to: '/maps', label: 'Maps' },
  { to: '/360', label: '360' },
]

const StubPage = ({ title }) => {
  const pageRef = useRef(null)
  // Gallery-style rise-out-of-blur entrance on navigation to this page.
  usePageTransition({ containerRef: pageRef })

  return (
  <div
    ref={pageRef}
    className="min-h-[60vh] flex flex-col items-center justify-center gap-6 p-12"
  >
    <h2 className="font-medium text-5xl tracking-tight">{title}</h2>
    <p className="text-on-light-grey">Coming soon.</p>
    <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-4">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="text-brand-brown text-sm tracking-wider uppercase hover:underline"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  </div>
  )
}

export default StubPage
