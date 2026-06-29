import { useEffect, useState } from 'react'

const MIN_DISPLAY_MS = 1600

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
