import { useEffect } from 'react'
import { bindCardHovers } from './bindCardHovers'
import {
  setupArtGallery,
  setupSteamCup,
  setupKidsSlide,
  setupPool,
  setupCourts,
} from './cardHoverSetups'

// Card names defined in CentralCourtyard.jsx (lowercased). Keep in step with
// the labels there — a renamed card silently loses its hover otherwise.
const setups = {
  'colonnade':           setupArtGallery,
  'wellness club':       setupSteamCup,
  'kids play area':      setupKidsSlide,
  'leisure pool':        setupPool,
  'swimming pool':       setupPool,
  'multipurpose courts': setupCourts,
}

export function useCentralCourtyardHovers(scopeRef) {
  useEffect(() => {
    const root = scopeRef.current
    if (!root) return
    // Self-healing: binds each icon as it lands, so artwork added later needs
    // no extra wiring. See bindCardHovers.
    return bindCardHovers(root, setups)
  }, [scopeRef])
}
