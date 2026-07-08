import { useLayoutEffect, useRef, useState } from 'react'
import { locationsCategories } from './locationsCategories'
import LocationsFlyout from './LocationsFlyout'

const GAP = 8 // px between the bar's top edge and the flyout's bottom edge
const MARGIN = 8 // px minimum clearance the flyout keeps from the viewport edges

// Bottom-center category bar over the /locations WebGL canvas.
//
// Pointer-events island: the outer wrapper is pointer-events-none so dragging the
// map anywhere but the controls still orbits it; the pill and the flyout each
// re-enable pointer events. The flyout is a SIBLING of the pill (not inside a button
// cell) and is positioned by measurement relative to the wrapper:
//   - vertical: measured bar height + GAP above the bar (never tucks under it)
//   - horizontal: centered on the tapped button, clamped into the viewport
// navRef is attached to the WRAPPER so it contains BOTH the pill and the flyout,
// keeping the parent's outside-click boundary correct.
const LocationsNav = ({ activeCategory, onCategoryChange, onSelectLocation, selectedLocationId, navRef }) => {
  const barRef = useRef(null) // the pill; measured for height + resize
  const buttonRefs = useRef({}) // id -> button el, for horizontal anchoring
  const flyoutRef = useRef(null) // the flyout card; measured for width
  const [pos, setPos] = useState(null) // { left, bottom } in wrapper-local px, or null

  useLayoutEffect(() => {
    // No panel open -> nothing to position (the flyout is unmounted). pos keeps its
    // last value; on reopen the effect recomputes pre-paint before anything shows.
    if (!activeCategory) return
    const bar = barRef.current
    const btn = buttonRefs.current[activeCategory]
    const flyout = flyoutRef.current
    const wrapper = navRef.current
    if (!bar || !btn || !flyout || !wrapper) return

    const compute = () => {
      const barRect = bar.getBoundingClientRect()
      const btnRect = btn.getBoundingClientRect()
      const wrapperRect = wrapper.getBoundingClientRect()
      const flyoutW = flyout.offsetWidth

      // VERTICAL — the wrapper shrink-wraps the pill, so wrapper.bottom === pill.bottom.
      // `bottom: barHeight + GAP` lands the flyout's bottom edge exactly GAP above the
      // pill's TOP edge, at every breakpoint, with zero hardcoded offsets.
      const bottom = barRect.height + GAP

      // HORIZONTAL — center on the button, then clamp into the viewport (all rects are
      // post-transform viewport coords).
      const btnCenterX = btnRect.left + btnRect.width / 2
      const desiredLeft = btnCenterX - flyoutW / 2
      const clampedLeft = Math.max(
        MARGIN,
        Math.min(desiredLeft, window.innerWidth - MARGIN - flyoutW),
      )
      // Viewport-space left -> wrapper-local left. The absolutely-positioned flyout
      // inherits the wrapper's -translate-x-1/2, so childViewportLeft = wrapperRect.left
      // + localLeft; subtracting wrapperRect.left cancels the translate exactly.
      const left = clampedLeft - wrapperRect.left

      setPos({ left, bottom })
    }

    compute()

    // Recompute on: bar size (breakpoint padding/height), flyout size (content/font
    // load), and viewport width (clamp target moves even when nothing resizes).
    const ro = new ResizeObserver(compute)
    ro.observe(bar)
    ro.observe(flyout)
    window.addEventListener('resize', compute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [activeCategory, navRef])

  return (
    <div
      ref={navRef}
      className="pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 bottom-2 xl:bottom-3 2xl:bottom-4 3xl:bottom-6 4xl:bottom-8 5xl:bottom-12"
    >
      {/* Rounded-rectangle bar (not a pill). Size/padding/colors unchanged. */}
      <div
        ref={barRef}
        className="pointer-events-auto flex items-center rounded-[1px] bg-white shadow-2xl gap-0.5 xl:gap-1 2xl:gap-1 3xl:gap-1.5 4xl:gap-2 5xl:gap-3 p-0.5 xl:p-0.5 2xl:p-0.5 3xl:p-0.5 4xl:p-1 5xl:p-1.5"
      >
        {locationsCategories.map(({ id, label, Icon }) => {
          const isActive = activeCategory === id
          return (
            <button
              key={id}
              type="button"
              ref={(el) => {
                buttonRefs.current[id] = el
              }}
              aria-pressed={isActive}
              onClick={() => onCategoryChange(isActive ? null : id)}
              className={`group flex items-center rounded-[2px] transition-colors gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 4xl:gap-4 5xl:gap-6 px-2.5 py-3 xl:px-3 xl:py-3 2xl:px-3.5 2xl:py-3.5 3xl:px-4 3xl:py-3 4xl:px-6 4xl:py-5 5xl:px-8 5xl:py-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-on-light-black/40 ${
                isActive ? 'bg-[#7A4833] text-white' : 'text-on-light-grey hover:bg-[#7A4833] hover:text-white'
              }`}
            >
              <Icon
                className={`shrink-0 h-3 w-3 xl:h-3.5 xl:w-3.5 2xl:h-4 2xl:w-4 3xl:h-5 3xl:w-5 4xl:h-7 4xl:w-7 5xl:h-10 5xl:w-10 group-hover:text-white ${
                  isActive ? 'text-white' : 'text-[#4d4d4d]'
                }`}
              />
              <span className="whitespace-nowrap uppercase leading-none tracking-[0.12em] font-medium text-[8px] xl:text-[9px] 2xl:text-[10px] 3xl:text-xs 4xl:text-base 5xl:text-xl">
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Single flyout instance, sibling of the pill, positioned by measurement.
          key={activeCategory} remounts on switch so scroll resets and it re-measures. */}
      {activeCategory && (
        <LocationsFlyout
          key={activeCategory}
          activeCategory={activeCategory}
          onSelectLocation={onSelectLocation}
          selectedLocationId={selectedLocationId}
          containerRef={flyoutRef}
          style={
            pos
              ? { left: pos.left, bottom: pos.bottom, visibility: 'visible' }
              : { left: 0, bottom: 0, visibility: 'hidden' }
          }
        />
      )}
    </div>
  )
}

export default LocationsNav
