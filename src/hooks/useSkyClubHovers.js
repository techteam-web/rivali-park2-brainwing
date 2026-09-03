import { useEffect } from 'react'
import { bindCardHovers } from './bindCardHovers'
import {
  setupViewingDecks,
  setupKidsSlide,
  setupGuestRoomsSC,
  setupBanquetHall,
  setupBarbell,
  setupLotus,
} from './cardHoverSetups'

// Card names defined in SkyClub.jsx — must match `data-card-name` after lowercasing.
const setups = {
  'viewing decks':  setupViewingDecks,
  'kids play area': setupKidsSlide,
  'guests rooms':   setupGuestRoomsSC,
  'banquet hall':   setupBanquetHall,
  'sky fitness':    setupBarbell,
  spa:              setupLotus,
}

export function useSkyClubHovers(scopeRef) {
  useEffect(() => {
    const root = scopeRef.current
    if (!root) return
    // Self-healing: binds each icon as it lands, so artwork added later needs
    // no extra wiring. See bindCardHovers.
    return bindCardHovers(root, setups)
  }, [scopeRef])
}
