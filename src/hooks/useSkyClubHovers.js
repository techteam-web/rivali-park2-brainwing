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
import { setupTeenLounge } from './useSocialClubHovers'

// Card names defined in SkyClub.jsx — must match `data-card-name` after
// lowercasing. Re-keyed when the labels were reworded to the sales-team markup
// (Sales tool feedback.pdf, p3); the icons and their animations are unchanged,
// so each new label points at exactly the setup its icon had before.
const setups = {
  'gymnasium':                   setupBarbell,
  'viewing decks':               setupViewingDecks,
  'sky suites':                  setupGuestRoomsSC,
  'spa':                         setupLotus,
  'kids club':                   setupKidsSlide,
  'banquet hall':                setupBanquetHall,
  'sky lounge':                  setupTeenLounge,
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
