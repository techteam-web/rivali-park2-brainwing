// Size and place a club page's render (the "stage" its hotspots are positioned
// on) so the hotspots stay on screen at every viewport shape.
//
// A plain cover crop fills the screen but, on narrower shapes (4:3 tablets,
// 16:10 laptops), cuts off whatever sits near the render's edges — the
// hotspots there end up half off screen or gone. Two changes fix that:
//
// - The stage is centred on the hotspots' horizontal middle (`mid`), not the
//   render's, so the crop takes evenly from both sides of them.
// - Its width is capped so `span` (the fraction of the render's width the
//   hotspots need, icons included) always fits across the screen. Where cover
//   would zoom in further than that, the render stops at that width and the
//   few pixels it no longer covers fall at the bottom, under the page's dark
//   bottom gradient.
//
// `vAnchor` keeps each page's vertical crop as it was: 0 pins the render's
// top, 0.5 centres it. It only applies while the render is taller than the
// screen; when the cap leaves it shorter, it sits at the top.
export const hotspotStageStyle = ({ w, h, mid = 0.5, span = 1, vAnchor = 0.5 }) => {
  const r = w / h
  const W = `min(max(100vw, calc(100vh * ${r})), calc(100vw / ${span}))`
  const H = `min(max(100vh, calc(100vw / ${r})), calc(100vw / ${span * r}))`
  return {
    width: W,
    height: H,
    left: `clamp(calc(100vw - ${W}), calc(50vw - ${W} * ${mid}), 0px)`,
    top: `min(0px, calc((100vh - ${H}) * ${vAnchor}))`,
  }
}
