import { useEffect } from 'react'
import { inlineSvgsReady } from '../lib/gsap'
import {
  setupSteamCup,
  setupBanquetHall,
  setupGuestRoomsCC,
} from './cardHoverSetups'

const setups = {
  restaurant:     setupSteamCup,
  'banquet hall': setupBanquetHall,
  'guest rooms':  setupGuestRoomsCC,
}

export function useConventionCenterHovers(scopeRef) {
  useEffect(() => {
    const root = scopeRef.current
    if (!root) return
    let cancelled = false
    const cleanups = []

    inlineSvgsReady(root).then(() => {
      if (cancelled) return
      const cards = root.querySelectorAll('[data-card-name]')
      cards.forEach((card) => {
        // Disabled (non-clickable) cards stay inert — animating them would
        // signal interactivity they don't have.
        if (!card.classList.contains('is-clickable')) return
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
