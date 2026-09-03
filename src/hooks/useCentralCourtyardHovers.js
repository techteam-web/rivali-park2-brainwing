import { useEffect } from 'react'
import { bindCardHovers } from './bindCardHovers'
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
    // Self-healing: binds each icon as it lands, so artwork added later needs
    // no extra wiring. See bindCardHovers.
    return bindCardHovers(root, setups)
  }, [scopeRef])
}
