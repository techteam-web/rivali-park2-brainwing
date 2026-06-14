import { ARTBOARD_H, useArtboard } from '../../hooks/useArtboardScale'

// Fills the viewport with a fixed-height (1024-unit) artboard whose width
// flexes to the viewport aspect ratio, scaled so it covers edge-to-edge. Lay
// children out in artboard units: use inset-x-*/left-0/right-0 for full-width
// elements (they span the screen) and left-1/2 centering for fixed-width ones.
//
// NOTE: the scale transform makes this a containing block for `position: fixed`
// descendants, so anything that must cover the real viewport (e.g. a lightbox)
// has to be rendered as a sibling of <UnitArtboard>, not inside it.
const UnitArtboard = ({ children }) => {
  const { scale, width } = useArtboard()

  return (
    <div className="h-full w-full overflow-hidden bg-white">
      <div
        className="relative origin-top-left bg-white"
        style={{
          width,
          height: ARTBOARD_H,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default UnitArtboard
