// Stargaze unit-footprint overlays. The six shapes were exported from
// Illustrator in one shared coordinate space (so they sit correctly relative to
// each other); we drop the export's stray translate and render them in a single
// SVG with a viewBox that tightly bounds all six. The whole SVG is then placed
// over the floor plan by the parent (UnitPlans) — moved/scaled in the editor
// until it lines up, then frozen.
//
// STARGAZE_OVERLAY_VB (in data/unitPlans) bounds the combined extent of every
// shape (x≈113.5–701.8, y≈25.3–532.1) with a little padding; the parent uses it
// to give the placement wrapper the right aspect ratio.
import { STARGAZE_OVERLAY_VB as VB } from '../../data/unitPlans'

const SHAPES = [
  {
    n: 1,
    type: 'polygon',
    d: '113.7,422.2 113.7,414.3 116.3,414.3 116.3,363.7 250,363.7 267.2,380.9 255,393.1 243.8,393.1 243.8,459.8 226.2,459.8 226.1,531.3 114.4,531.3 114.4,524.9 116.3,524.9 116.3,519.7 116.3,422.2',
  },
  {
    n: 2,
    type: 'polygon',
    d: '116.3,203.2 113.5,203.2 113.5,198.4 152.7,198.4 152.7,194.9 135.6,177.8 195.6,117.8 241.9,164.2 208.2,197.9 250.2,197.9 250.2,320.3 271.5,341.7 249.8,363.6 116.2,363.6 116.2,312.9 113.7,312.9 113.7,305.3 116.3,305.3',
  },
  {
    n: 3,
    type: 'polygon',
    d: '453.1,182.4 424.2,182.4 424.2,157.4 358.9,157.4 358.9,159.3 289.1,159.3 289.1,117.2 255.5,150.6 209.2,104.2 288,25.3 455.5,25.3 455.5,153.6 453.1,153.6',
  },
  {
    n: 4,
    type: 'polygon',
    d: '698.9,46.8 698.9,104.5 701.8,104.5 701.8,134.7 616,134.7 616,113.5 602,113.5 602,134.5 564.3,134.5 564.3,154.3 476.7,154.3 476.7,182.5 453,182.4 453,153.6 455.4,153.6 455.4,25.4 621.7,25.4 621.7,46.8',
  },
  {
    n: 5,
    type: 'polygon',
    d: '484.1,361.3 517.2,361.3 517.2,356.1 616.4,356.1 616.4,361.2 621.5,361.2 621.5,334.4 700.9,334.4 700.9,246.5 616.2,246.5 616.2,267.1 557.1,267.1 557.1,246.7 516.8,246.7 516.8,227 477.1,227 476.9,214.8 427.3,214.8 427.3,230.6 452.8,256.1 400.3,308.6 468.5,376.8',
  },
  {
    n: 6,
    type: 'path',
    d: 'm 337.3,532.1 v -35.7 h 25.3 v -28.8 h -25.1 v -43 H 318.3 V 383.3 H 308.1 V 335.7 H 323 l 24.9,24.9 52.2,-52.2 68.2,68.2 -18.2,18.2 v 29.9 H 445 v 98.6 h 5.2 v 8.6 c 0,0 -113.3,0 -113,0.2 z',
  },
]

// Each shape is a clickable region that opens its unit's detail sheet.
const StargazeOverlay = ({ onSelect }) => (
  <svg
    viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
    className="h-full w-full overflow-visible"
    preserveAspectRatio="xMidYMid meet"
  >
    {SHAPES.map((s) => {
      const Tag = s.type
      const shapeProps = s.type === 'polygon' ? { points: s.d } : { d: s.d }
      return (
        <Tag
          key={s.n}
          {...shapeProps}
          onClick={() => onSelect(s.n)}
          className="cursor-pointer fill-[#a4687b] stroke-on-light-black stroke-[0.6] transition-[fill-opacity] [fill-opacity:0.3] hover:[fill-opacity:0.55]"
        />
      )
    })}
  </svg>
)

export default StargazeOverlay
