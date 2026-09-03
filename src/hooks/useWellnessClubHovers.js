import { useEffect } from 'react'
import { bindCardHovers } from './bindCardHovers'
import {
  setupSalon,
  setupAmphitheatre,
  setupLotus,
  setupWellnessBar,
  setupDining,
  setupBarbell,
} from './cardHoverSetups'

// Keyed by the card's lowercased name. Each setup is written against a specific
// icon's path structure, so a card that was renamed but kept its artwork keeps
// the matching setup -- "Spa and Wellness Cafe" still carries the dining icon.
// The old keys are left in place: they cost nothing and save re-deriving the
// animation if a room comes back.
const setups = {
  salon:                          setupSalon,
  'outdoor amphitheatre':         setupAmphitheatre,
  spa:                            setupLotus,
  'wellness bar':                 setupWellnessBar,
  dinning:                        setupDining,
  'spa and wellness cafe':        setupDining,
  'gymnasium & fitness studio':   setupBarbell,
}

export function useWellnessClubHovers(scopeRef) {
  useEffect(() => {
    const root = scopeRef.current
    if (!root) return
    // Self-healing: binds each icon as it lands, so artwork added later needs
    // no extra wiring. See bindCardHovers.
    return bindCardHovers(root, setups)
  }, [scopeRef])
}
