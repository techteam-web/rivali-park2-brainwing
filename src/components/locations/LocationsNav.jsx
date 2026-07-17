import { useLayoutEffect, useRef, useState } from 'react'
import { useOverlayScale } from '../../hooks/useOverlayScale'
import { locationsCategories } from './locationsCategories'
import LocationsFlyout from './LocationsFlyout'

const GAP = 8 // local px between the bar's top edge and the flyout's bottom edge (scales with the layer)
const MARGIN = 8 // viewport px minimum clearance the flyout keeps from the viewport edges
const BOTTOM_INSET = 24 // viewport px from the bottom edge at scale 1 (the old 3xl:bottom-6)
// The flyout's viewport-relative caps, applied in LOCAL units (see the style prop below).
const MAX_W_FRACTION = 0.8
const MAX_H_FRACTION = 0.7

// Bottom-center category bar over the /locations WebGL canvas.
//
// Sizing: authored at its 1920 look and scaled proportionally by useOverlayScale --
// no breakpoint ramps. The outer div positions (full-width, flex-centered, so no
// -translate-x-1/2 has to compose with the scale); the inner div is the SCALE LAYER
// and shrink-wraps the pill.
//
// Pointer-events island: the positioner is pointer-events-none so dragging the map
// anywhere but the controls still orbits it; the pill and the flyout each re-enable
// pointer events. The flyout is a SIBLING of the pill (not inside a button cell) and
// is positioned by measurement relative to the scale layer:
//   - vertical: measured bar height + GAP above the bar (never tucks under it)
//   - horizontal: centered on the tapped button, clamped into the viewport
// navRef is attached to the SCALE LAYER so it contains BOTH the pill and the flyout,
// keeping the parent's outside-click boundary correct.
const LocationsNav = ({ activeCategory, onCategoryChange, onSelectLocation, selectedLocationId, navRef }) => {
  const barRef = useRef(null) // the pill; measured for height + resize
  const buttonRefs = useRef({}) // id -> button el, for horizontal anchoring
  const flyoutRef = useRef(null) // the flyout card; measured for width
  const [pos, setPos] = useState(null) // { left, bottom } in layer-local px, or null
  const { scale, vw, vh } = useOverlayScale()

  useLayoutEffect(() => {
    // No panel open -> nothing to position (the flyout is unmounted). pos keeps its
    // last value; on reopen the effect recomputes pre-paint before anything shows.
    if (!activeCategory) return
    const bar = barRef.current
    const btn = buttonRefs.current[activeCategory]
    const flyout = flyoutRef.current
    const wrapper = navRef.current
    if (!bar || !btn || !flyout || !wrapper) return

    // getBoundingClientRect() returns POST-transform viewport px, but `left`/`bottom`
    // are CSS lengths in the scale layer's own (un-scaled) coordinate space. So: do all
    // the clamping in viewport px, then convert to local units with a single divide.
    // For a uniform scale, viewportX = wrapperRect.left + localX * scale holds for ANY
    // transform-origin, because wrapperRect.left IS the transformed image of local x=0.
    const compute = () => {
      const barRect = bar.getBoundingClientRect()
      const btnRect = btn.getBoundingClientRect()
      const wrapperRect = wrapper.getBoundingClientRect()
      const flyoutW = flyout.getBoundingClientRect().width // viewport px, already scaled

      // VERTICAL — the layer shrink-wraps the pill, so layer.bottom === pill.bottom.
      // `bottom: barHeight + GAP` lands the flyout's bottom edge exactly GAP above the
      // pill's TOP edge, at every scale, with zero hardcoded offsets.
      const bottom = barRect.height / scale + GAP

      // HORIZONTAL — center on the button, then clamp into the viewport.
      const btnCenterX = btnRect.left + btnRect.width / 2
      const desiredLeft = btnCenterX - flyoutW / 2
      const clampedLeft = Math.max(
        MARGIN,
        Math.min(desiredLeft, window.innerWidth - MARGIN - flyoutW),
      )
      const left = (clampedLeft - wrapperRect.left) / scale

      setPos({ left, bottom })
    }

    compute()

    // Recompute on: bar size (content/font load), flyout size, and viewport width (the
    // clamp target moves, and the scale changes, even when nothing else does). The
    // ResizeObserver reports LAYOUT box size, which the transform does not affect, so it
    // keeps firing on content changes exactly as before.
    const ro = new ResizeObserver(compute)
    ro.observe(bar)
    ro.observe(flyout)
    window.addEventListener('resize', compute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [activeCategory, navRef, scale])

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-50 flex justify-center"
      style={{ bottom: BOTTOM_INSET * scale }}
    >
      {/* Scale layer: everything inside is authored at its 1920 size and scaled from the
          bottom-center, so the bar stays centered and pinned to the bottom as it scales. */}
      <div
        ref={navRef}
        className="relative"
        style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
      >
        {/* Rounded-rectangle bar (not a pill). Colors unchanged. */}
        <div
          ref={barRef}
          className="pointer-events-auto flex items-center rounded-[1px] bg-white shadow-2xl gap-1.5 p-0.5"
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
                className={`group flex items-center rounded-[2px] transition-colors gap-3 px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-on-light-black/40 ${
                  isActive ? 'bg-[#7A4833] text-white' : 'text-on-light-grey hover:bg-[#7A4833] hover:text-white'
                }`}
              >
                <Icon
                  className={`shrink-0 h-5 w-5 group-hover:text-white ${
                    isActive ? 'text-white' : 'text-[#4d4d4d]'
                  }`}
                />
                <span className="whitespace-nowrap uppercase leading-none tracking-[0.12em] font-medium text-xs">
                  {label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Single flyout instance, sibling of the pill, positioned by measurement.
            key={activeCategory} remounts on switch so scroll resets and it re-measures.
            The max caps are viewport fractions expressed in LOCAL units (divided by
            scale), since the layer's transform would otherwise multiply them. */}
        {activeCategory && (
          <LocationsFlyout
            key={activeCategory}
            activeCategory={activeCategory}
            onSelectLocation={onSelectLocation}
            selectedLocationId={selectedLocationId}
            containerRef={flyoutRef}
            style={{
              maxWidth: (vw * MAX_W_FRACTION) / scale,
              maxHeight: (vh * MAX_H_FRACTION) / scale,
              ...(pos
                ? { left: pos.left, bottom: pos.bottom, visibility: 'visible' }
                : { left: 0, bottom: 0, visibility: 'hidden' }),
            }}
          />
        )}
      </div>
    </div>
  )
}

export default LocationsNav
