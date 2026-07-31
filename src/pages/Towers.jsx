import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { towers } from '../data/towers'
import TowersLanding from './TowersLanding'
import TowerDetail from '../components/towers/TowerDetail'
import TowerElevation from '../components/towers/TowerElevation'
import TowersLoadingScreen from '../components/towers/TowersLoadingScreen'
import useTowersAssetsReady from '../hooks/useTowersAssetsReady'
import { hasFloorPicker } from '../data/towerElevations'

// /towers is a single route with an aerial landing (four tower pills) and a
// single-tower detail view. Which view shows is driven entirely by the URL: the
// selected tower lives in ?tower=<id>, so a detail view is shareable and
// deep-linkable — opening /towers?tower=stargaze lands straight on Stargaze.
// Picking a pill sets the param; the detail's back arrow clears it. Tower
// switching happens by going back to the landing, never by scrolling.
const Towers = () => {
  const ready = useTowersAssetsReady()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Arriving with a ?tower= param means we're deep-linking to (or returning to)
  // a detail view — skip the loading screen and render it immediately. Captured
  // once on mount so it survives backToLanding clearing the param.
  const [skipLoader] = useState(() => searchParams.get('tower') != null)
  const [overlayGone, setOverlayGone] = useState(skipLoader)

  // The URL is the single source of truth for which tower is open.
  const selectedTower =
    towers.find((t) => t.id === searchParams.get('tower')) ?? null

  // ...and for which of the tower's two screens is showing. `view=floors` is
  // the elevation drawing (the floor picker); anything else is the detail
  // panel. Keeping it in the URL makes the floor picker deep-linkable and
  // gives the browser back button the right behaviour for free.
  //
  // Only towers whose floor overlay has landed can show the picker — the others
  // keep the original behaviour (straight to the floor plans), so a missing
  // overlay degrades to the old flow rather than to an empty screen.
  const canPickFloors = selectedTower ? hasFloorPicker(selectedTower.id) : false
  const showingFloors = canPickFloors && searchParams.get('view') === 'floors'

  // Push a history entry so the browser back button returns to the landing too.
  const selectTower = (tower) => setSearchParams({ tower: tower.id })

  const openFloors = () => {
    if (canPickFloors) {
      setSearchParams({ tower: selectedTower.id, view: 'floors' })
    } else {
      navigate(`/unit-plans?tower=${selectedTower.id}&origin=towers`)
    }
  }

  const backToDetail = () => setSearchParams({ tower: selectedTower.id })

  // A picked floor rides into the unit-plan flow so the courtyard/apartment
  // views can open on the floor the user actually chose.
  const openPlansForFloor = (floor) =>
    navigate(
      `/unit-plans?tower=${selectedTower.id}&origin=towers&floor=${floor}`,
    )

  useEffect(() => {
    const body = document.body
    const html = document.documentElement
    const prevBodyOverscroll = body.style.overscrollBehavior
    const prevHtmlOverscroll = html.style.overscrollBehavior
    body.style.overscrollBehavior = 'none'
    html.style.overscrollBehavior = 'none'
    body.classList.add('scrollbar-hidden')
    html.classList.add('scrollbar-hidden')
    return () => {
      body.style.overscrollBehavior = prevBodyOverscroll
      html.style.overscrollBehavior = prevHtmlOverscroll
      body.classList.remove('scrollbar-hidden')
      html.classList.remove('scrollbar-hidden')
    }
  }, [])

  // Drop the ?tower= param so the URL (and view) reflects the landing.
  const backToLanding = () => {
    if (searchParams.has('tower')) setSearchParams({}, { replace: true })
  }

  const detailOrFloors = () =>
    showingFloors ? (
      <TowerElevation
        key={`${selectedTower.id}-floors`}
        tower={selectedTower}
        onBack={backToDetail}
        onPick={openPlansForFloor}
      />
    ) : (
      <TowerDetail
        key={selectedTower.id}
        tower={selectedTower}
        onBack={backToLanding}
        onPlans={openFloors}
        play={overlayGone}
      />
    )

  return (
    <>
      {(ready || skipLoader) &&
        (selectedTower ? (
          detailOrFloors()
        ) : (
          <TowersLanding onSelect={selectTower} />
        ))}
      {!overlayGone && (
        <TowersLoadingScreen
          ready={ready}
          onExitComplete={() => setOverlayGone(true)}
        />
      )}
    </>
  )
}

export default Towers
