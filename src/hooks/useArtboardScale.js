import { useLayoutEffect, useState } from 'react'

// The unit-plan screens are designed on a fixed-HEIGHT (1024px) artboard whose
// WIDTH flexes to match the viewport's aspect ratio; the whole thing is then
// scaled to fill the viewport edge-to-edge. This keeps the design's vertical
// rhythm and font sizes proportional on any screen, while letting full-width
// (inset-based) layouts actually span the screen instead of being letterboxed
// inside a fixed 1440-wide box. Centered, fixed-width elements (e.g. the floor
// plan) stay centered with natural side margins.
export const ARTBOARD_H = 1024

export const useArtboard = () => {
  const [state, setState] = useState({ scale: 1, width: 1440 })

  useLayoutEffect(() => {
    const update = () => {
      const scale = window.innerHeight / ARTBOARD_H
      // Width in artboard units so that width * scale === viewport width.
      const width = window.innerWidth / scale
      setState({ scale, width })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return state
}
