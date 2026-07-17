import { useLayoutEffect, useState } from 'react'

// The /locations DOM overlays (nav, flyout, card) are authored at ONE size -- their
// 1920-wide look -- and scaled proportionally by a CSS transform. This replaces the
// old per-breakpoint size ramps, which jumped between steps and only read correctly
// at the breakpoints that were hand-tuned.
//
// scale = clamp(MIN, min(vw / REF_W, vh / REF_H), MAX)
//
// REF_H is 900, NOT 1080, on purpose. window.innerHeight is the VIEWPORT, not the
// screen: a maximized browser on a 1080p display reports ~950 once tabs and the
// address bar are subtracted. Referencing 1080 would compute min(1.0, 0.88) = 0.88
// at the anchor resolution and shrink every overlay 12%. 900 sits below any real
// 16:9 browser viewport, so the height term stays dormant on normal windows and
// only engages on genuinely short-but-wide ones (e.g. 2560x700), where it keeps the
// card from outgrowing the viewport.
const REF_W = 1920
const REF_H = 900
const MIN_SCALE = 0.75
const MAX_SCALE = 2.2

const compute = () => {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const raw = Math.min(vw / REF_W, vh / REF_H)
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, raw))
  return { scale, vw, vh }
}

// vw/vh ride along because the flyout's viewport-relative caps have to be computed
// in the scaled layer's LOCAL units (see LocationsNav), which needs both.
export const useOverlayScale = () => {
  const [state, setState] = useState(compute)

  useLayoutEffect(() => {
    const update = () => setState(compute())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return state
}
