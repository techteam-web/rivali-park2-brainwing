import { useEffect, useState } from 'react'
import { MOTION_SCALE } from '../lib/gsap'

// Wall-clock floor, so it has to track MOTION_SCALE by hand: the sketch intro it
// is pacing is a GSAP timeline (~2.15s nominal) and is now slowed with everything
// else, so a fixed 1600ms would lift the overlay while the subheading is still
// writing itself in. Dividing keeps the same share of the intro visible as before.
const MIN_DISPLAY_MS = Math.round(1600 / MOTION_SCALE)

// Generic loader gate: stays false until fonts are loaded, a minimum display
// window has elapsed (so the sketch animation is actually seen), and an
// optional external signal (e.g. an iframe finishing load) is true.
export default function useLoaderReady(signal = true) {
  const [timePassed, setTimePassed] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fontsPromise = document.fonts?.ready ?? Promise.resolve()
    const minDelay = new Promise((r) => setTimeout(r, MIN_DISPLAY_MS))

    Promise.all([fontsPromise, minDelay]).then(() => {
      if (!cancelled) setTimePassed(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return timePassed && signal
}
