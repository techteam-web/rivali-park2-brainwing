import { useEffect } from 'react'
import { inlineSvgsReady } from '../lib/gsap'
import {
  setupSalon,
  setupAmphitheatre,
  setupLotus,
  setupWellnessBar,
  setupDining,
  setupBarbell,
} from './cardHoverSetups'

const setups = {
  salon:                          setupSalon,
  'outdoor amphitheatre':         setupAmphitheatre,
  spa:                            setupLotus,
  'wellness bar':                 setupWellnessBar,
  dinning:                        setupDining,
  'gymnasium & fitness studio':   setupBarbell,
}

export function useWellnessClubHovers(scopeRef) {
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
