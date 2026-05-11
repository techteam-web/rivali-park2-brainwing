import { useEffect, useState } from 'react'
import { towers } from '../data/towers'

const MIN_DISPLAY_MS = 1600

export default function useTowersAssetsReady() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const pendingImages = []

    const fontsPromise = document.fonts?.ready ?? Promise.resolve()

    const imagePromises = towers
      .flatMap((t) => [t.image, t.depth])
      .map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image()
            pendingImages.push(img)
            img.onload = () => resolve()
            img.onerror = () => resolve()
            img.src = src
          }),
      )

    const minDelay = new Promise((r) => setTimeout(r, MIN_DISPLAY_MS))

    Promise.all([fontsPromise, Promise.all(imagePromises), minDelay]).then(() => {
      if (!cancelled) setReady(true)
    })

    return () => {
      cancelled = true
      pendingImages.forEach((img) => {
        img.onload = null
        img.onerror = null
        img.src = ''
      })
    }
  }, [])

  return ready
}
