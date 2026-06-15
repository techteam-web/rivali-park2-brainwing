import { forwardRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import InlineSVG from '../about/InlineSVG'

// ---------------------------------------------------------------------------
// OLD NAVBAR (currently active) — grid of cells with an active/hover highlight
// that slides the icon up and reveals its label.
// ---------------------------------------------------------------------------
const items = [
  { id: 'about', src: '/home/svgs/about.svg', to: '/about', label: 'About Us' },
  { id: 'towers', src: '/home/svgs/towers.svg', to: '/towers', label: 'Towers' },
  { id: 'gallery', src: '/home/svgs/gallery.svg', to: '/gallery', label: 'Gallery' },
  { id: 'unitplan', src: '/home/svgs/unitplan.svg', to: '/unit-plans', label: 'Unit Plans' },
  { id: 'map', src: '/home/svgs/map.svg', to: '/maps', label: 'Map' },
  { id: '360', src: '/home/svgs/360.svg', to: '/360', label: '360' },
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

/* ===========================================================================
 * CURRENT NAVBAR (commented out — kept for future reuse)
 * Magnetic-pill navbar: a single GSAP-animated pill chases whichever tab is
 * hovered. To re-enable, comment out the old navbar above and uncomment this.
 * Requires these imports at the top of the file:
 *   import { forwardRef, useRef } from 'react'
 *   import { Link } from 'react-router-dom'
 *   import { useGSAP } from '@gsap/react'
 *   import { gsap } from '../../lib/gsap'
 *   import InlineSVG from '../about/InlineSVG'
 * ===========================================================================

// Tabs in display order. `to: null` = the page isn't built yet, so the tab
// renders identically but is non-clickable (per product decision). Icons all
// live in /home/svgs and inherit the tab's text colour via the
// [data-home-navbar] currentColor rules in index.css.
const items = [
  { id: 'about', label: 'About Us', icon: '/home/svgs/about.svg', to: '/about' },
  { id: 'location', label: 'Location', icon: '/home/svgs/map.svg', to: null },
  { id: 'video', label: 'Video', icon: '/home/svgs/video.svg', to: null },
  { id: 'amenities', label: 'Amenities', icon: '/home/svgs/aminities.svg', to: null },
  { id: 'towers', label: 'Towers', icon: '/home/svgs/towers.svg', to: '/towers' },
  { id: 'construction', label: 'Construction', icon: '/home/svgs/construction.svg', to: null },
  { id: 'views', label: 'Views', icon: '/home/svgs/360.svg', to: '/viewspage' },
]

// Icon box (24px at 2xl) — the SVG fills it and preserveAspectRatio centres it.
const iconClass =
  'inline-flex items-center justify-center shrink-0 w-[18px] h-[18px] lg:w-4 lg:h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-[26px] 3xl:h-[26px] 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12'

const labelClass =
  'uppercase tracking-[0.07em] leading-none whitespace-nowrap text-[13px] lg:text-[12px] xl:text-[14px] 2xl:text-[18px] 3xl:text-[20px] 4xl:text-[26px] 5xl:text-[36px]'

// Every tab fills the full bar height (so the magnetic pill is full-height and
// the bar height never changes). Vertical padding = 22px at 2xl → 68px tall bar.
const itemClass =
  'group relative flex items-center justify-center rounded-full gap-1.5 xl:gap-2 3xl:gap-2.5 4xl:gap-3 5xl:gap-4 px-3 xl:px-3.5 2xl:px-[18px] 3xl:px-5 4xl:px-7 5xl:px-10 py-3 xl:py-3.5 2xl:py-[22px] 3xl:py-6 4xl:py-8 5xl:py-12'

// Bold-on-hover without reflow: an invisible semibold copy reserves the wider
// bold width, so flipping the visible copy's weight doesn't nudge other tabs.
const Label = ({ children }) => (
  <span className="relative grid">
    <span aria-hidden className={`${labelClass} invisible font-semibold col-start-1 row-start-1`}>
      {children}
    </span>
    <span className={`${labelClass} col-start-1 row-start-1 font-normal group-hover:font-semibold`}>
      {children}
    </span>
  </span>
)

const HomeNavbar = forwardRef(function HomeNavbar(_props, ref) {
  const navInnerRef = useRef(null)
  const pillRef = useRef(null)
  const moversRef = useRef(null)
  const visibleRef = useRef(false)

  useGSAP(
    () => {
      const pill = pillRef.current
      if (!pill) return
      gsap.set(pill, { opacity: 0, width: 0, height: 0 })
      // quickTo gives a continuously-retargetable tween per property, so the
      // pill smoothly chases whichever tab is hovered without restarting.
      moversRef.current = {
        x: gsap.quickTo(pill, 'x', { duration: 0.45, ease: 'power3' }),
        y: gsap.quickTo(pill, 'y', { duration: 0.45, ease: 'power3' }),
        width: gsap.quickTo(pill, 'width', { duration: 0.45, ease: 'power3' }),
        height: gsap.quickTo(pill, 'height', { duration: 0.45, ease: 'power3' }),
      }
    },
    { scope: navInnerRef },
  )

  // Slide/snap the pill onto a tab. First appearance snaps into place then
  // fades in; subsequent hovers animate the move (the magnetic chase).
  const moveTo = (el) => {
    const pill = pillRef.current
    const movers = moversRef.current
    if (!pill || !movers || !el) return
    const box = { x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight }
    if (!visibleRef.current) {
      gsap.set(pill, box)
      gsap.to(pill, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      visibleRef.current = true
    } else {
      movers.x(box.x)
      movers.y(box.y)
      movers.width(box.width)
      movers.height(box.height)
    }
  }

  const hide = () => {
    const pill = pillRef.current
    if (!pill) return
    gsap.to(pill, { opacity: 0, duration: 0.3, ease: 'power2.out' })
    visibleRef.current = false
  }

  return (
    <div
      ref={ref}
      className="fixed left-1/2 -translate-x-1/2 z-40 bottom-3 xl:bottom-4 2xl:bottom-5 3xl:bottom-6 4xl:bottom-8 5xl:bottom-12"
    >
      <nav
        ref={navInnerRef}
        data-home-navbar
        aria-label="Primary"
        onPointerLeave={hide}
        className="relative flex items-center gap-1 4xl:gap-1.5 5xl:gap-2 rounded-full bg-[#FAF9F6] border border-[#7A4833]/20 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
      >
        {/* Single magnetic pill, shared across tabs and animated by GSAP. *X/}
        <span
          ref={pillRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 rounded-full bg-[#7A4833] will-change-transform"
        />

        {items.map((item) => {
          const isClickable = Boolean(item.to)

          const content = (
            <span className="relative z-10 flex items-center gap-1.5 xl:gap-2 3xl:gap-2.5 4xl:gap-3 5xl:gap-4 text-on-light-black transition-colors duration-400 ease-out group-hover:text-white">
              <InlineSVG src={item.icon} aria-hidden className={iconClass} />
              <Label>{item.label}</Label>
            </span>
          )

          if (isClickable) {
            return (
              <Link
                key={item.id}
                to={item.to}
                aria-label={item.label}
                onPointerEnter={(e) => moveTo(e.currentTarget)}
                className={itemClass}
              >
                {content}
              </Link>
            )
          }

          // Non-routed tab: present and hover-highlighted, but inert (no nav).
          return (
            <span
              key={item.id}
              aria-disabled="true"
              onPointerEnter={(e) => moveTo(e.currentTarget)}
              className={`${itemClass} cursor-default`}
            >
              {content}
            </span>
          )
        })}
      </nav>
    </div>
  )
})

export default HomeNavbar

 * =========================================================================== */
