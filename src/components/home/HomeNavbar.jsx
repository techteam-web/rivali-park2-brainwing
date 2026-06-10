import { forwardRef, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import InlineSVG from '../about/InlineSVG'

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
        {/* Single magnetic pill, shared across tabs and animated by GSAP. */}
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
