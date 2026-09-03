import { useEffect } from 'react'
import { bindCardHovers } from './bindCardHovers'
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
    // Self-healing: binds each icon as it lands, so artwork added later needs
    // no extra wiring. See bindCardHovers.
    return bindCardHovers(root, setups)
  }, [scopeRef])
}
