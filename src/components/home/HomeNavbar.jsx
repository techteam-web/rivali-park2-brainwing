import { forwardRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import InlineSVG from '../about/InlineSVG'

const items = [
  { id: 'about', src: '/home/svgs/about.svg', to: '/about', label: 'About Us' },
  { id: 'towers', src: '/home/svgs/towers.svg', to: '/towers', label: 'Towers' },
  { id: 'gallery', src: '/home/svgs/gallery.svg', to: '/gallery', label: 'Gallery' },
  { id: 'unitplan', src: '/home/svgs/unitplan.svg', to: '/unit-plans', label: 'Unit Plans' },
  { id: 'map', src: '/home/svgs/map.svg', to: '/maps', label: 'Map' },
  { id: '360', src: '/home/svgs/360.svg', to: '/viewspage', label: '360' },
]

const iconClass =
  'w-3.5 h-3.5 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4 3xl:w-4.5 3xl:h-4.5 4xl:w-6 4xl:h-6 5xl:w-9 5xl:h-9'

const cellSize =
  'px-4 py-3 lg:px-4 lg:py-2.5 xl:px-5 xl:py-3 2xl:px-6 2xl:py-3.5 3xl:px-7 3xl:py-4 4xl:px-9.5 4xl:py-6 5xl:px-15 5xl:py-10'

const highlightInset =
  'inset-px lg:inset-px 2xl:inset-0.5 3xl:inset-0.5 4xl:inset-1 5xl:inset-1.5'

const labelClass =
  'absolute left-0 right-0 bottom-1.5 lg:bottom-1.5 2xl:bottom-2 3xl:bottom-2.5 4xl:bottom-3 5xl:bottom-5 text-center text-[9px] lg:text-[7px] xl:text-[9px] 2xl:text-[10px] 3xl:text-[11px] 4xl:text-[14px] 5xl:text-[24px] uppercase tracking-[0.12em] leading-none whitespace-nowrap'

const iconShiftActive =
  '-translate-y-1.5 lg:-translate-y-1.5 2xl:-translate-y-1.5 3xl:-translate-y-2 4xl:-translate-y-2.5 5xl:-translate-y-4'

const iconShiftHover =
  'group-hover:-translate-y-1.5 lg:group-hover:-translate-y-1.5 2xl:group-hover:-translate-y-1.5 3xl:group-hover:-translate-y-2 4xl:group-hover:-translate-y-2.5 5xl:group-hover:-translate-y-4'

const elegantTransition =
  'transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]'

const HomeNavbar = forwardRef(function HomeNavbar(_props, ref) {
  const { pathname } = useLocation()

  return (
    <div
      ref={ref}
      className="fixed bottom-2 left-1/2 -translate-x-1/2 z-40 lg:bottom-3 3xl:bottom-4 4xl:bottom-6 5xl:bottom-10"
    >
      <div
        data-home-navbar
        className="bg-pastel-brown-bg/80 backdrop-blur-xs rounded-xs shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden 2xl:px-0 3xl:px-0"
      >
        <ul className="flex items-stretch text-black">
          {items.map((item) => {
            const isActive = pathname === item.to
            return (
              <li key={item.to} data-icon={item.id} className="flex">
                <Link
                  to={item.to}
                  aria-label={item.label}
                  className={`group relative flex items-center justify-center ${cellSize} ${elegantTransition} ${
                    isActive ? 'text-white' : 'hover:text-white'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute ${highlightInset} rounded-xs bg-[#A47866] ${elegantTransition} ${
                      isActive
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  />
                  <InlineSVG
                    src={item.src}
                    className={`relative ${iconClass} ${elegantTransition} ${
                      isActive ? iconShiftActive : iconShiftHover
                    }`}
                  />
                  <span
                    className={`${labelClass} ${elegantTransition} ${
                      isActive
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
})

export default HomeNavbar
