import { useEffect } from 'react'
import { inlineSvgsReady } from '../lib/gsap'
import {
  setupArtGallery,
  setupSteamCup,
  setupKidsSlide,
  setupPool,
  setupCourts,
} from './cardHoverSetups'

// Card names defined in CentralCourtyard.jsx (lowercased): the data uses
// "Liesure pool" — yes, that's the spelling currently on the page.
const setups = {
  'art gallery':         setupArtGallery,
  'coffee shop':         setupSteamCup,
  'kids play area':      setupKidsSlide,
  'liesure pool':        setupPool,
  'swimming pool':       setupPool,
  'multipurpose courts': setupCourts,
}

export function useCentralCourtyardHovers(scopeRef) {
  useEffect(() => {
    const root = scopeRef.current
    if (!root) return
    let cancelled = false
    const cleanups = []

    inlineSvgsReady(root).then(() => {
      if (cancelled) return
      const cards = root.querySelectorAll('[data-card-name]')
      cards.forEach((card) => {
        const name = card.getAttribute('data-card-name')
        const setup = setups[name]
        if (!setup) return
        const svgEl = card.querySelector('svg')
        if (!svgEl) return
        const cleanup = setup(svgEl)
        if (cleanup) cleanups.push(cleanup)
      })
    })

    return () => {
      cancelled = true
      cleanups.forEach((c) => c())
    }
  }, [scopeRef])
}
