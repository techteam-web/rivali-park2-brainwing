import { useLayoutEffect } from 'react'

// Safety net for the hotspots on a club page: after the stage has been sized
// (see hotspotStageStyle), anything still crossing the screen edge is pulled
// back in.
//
// - A label (pill) that would be cut off slides sideways until it fits; its
//   icon stays on the room it marks. That is what keeps e.g. "Social Media
//   Studio", whose icon sits at the render's left edge, readable.
// - An icon that would be cut off moves in with its label, just far enough.
// - Cards marked `data-optional` (repeats of a hotspot shown elsewhere, like
//   the Sky Club's side viewing decks) are hidden instead when the spot they
//   mark is off screen, since there is nothing on screen for them to point at.
//
// Offsets are plain `left` / `margin-left` styles, so they never touch the
// transforms GSAP animates on these elements. Re-run on every resize.
const MARGIN = 0.012 // of the screen width, kept clear at each side

export function useHotspotsInView(scopeRef) {
  useLayoutEffect(() => {
    const root = scopeRef.current
    if (!root) return

    let raf = 0
    const fit = () => {
      raf = 0
      const box = root.getBoundingClientRect()
      const vw = box.width
      const m = Math.round(vw * MARGIN)

      root.querySelectorAll('button[data-card-name]').forEach((btn) => {
        const icon = btn.querySelector('[data-inline-svg]')
        const pill = btn.querySelector('[data-card-label]')
        btn.style.marginLeft = ''
        btn.style.display = ''
        if (pill) pill.style.left = ''
        if (!icon) return

        // The icon may be mid scale-in, so take its centre from the rect and
        // its size from layout, which the animation doesn't change.
        const ir = icon.getBoundingClientRect()
        const iconC = (ir.left + ir.right) / 2 - box.left
        const iconHalf = icon.offsetWidth / 2

        if (btn.hasAttribute('data-optional') && (iconC < 0 || iconC > vw)) {
          btn.style.display = 'none'
          return
        }

        let dx = 0
        if (iconC - iconHalf < m) dx = m - (iconC - iconHalf)
        else if (iconC + iconHalf > vw - m) dx = vw - m - (iconC + iconHalf)
        if (dx) btn.style.marginLeft = `${dx}px`

        if (!pill) return
        const pr = pill.getBoundingClientRect()
        const pl = pr.left - box.left + dx
        const pRight = pr.right - box.left + dx
        let pdx = 0
        if (pl < m) pdx = m - pl
        else if (pRight > vw - m) pdx = vw - m - pRight
        if (pdx) {
          pill.style.position = 'relative'
          pill.style.left = `${pdx}px`
        }
      })
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(fit)
    }

    schedule()
    // Label widths depend on the web font; refit once it's in.
    document.fonts?.ready.then(schedule)
    const ro = new ResizeObserver(schedule)
    ro.observe(root)
    return () => {
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [scopeRef])
}
