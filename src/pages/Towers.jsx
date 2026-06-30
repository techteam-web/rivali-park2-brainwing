import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { towers } from '../data/towers'
import TowersLanding from './TowersLanding'
import TowerDetail from '../components/towers/TowerDetail'
import TowersLoadingScreen from '../components/towers/TowersLoadingScreen'
import useTowersAssetsReady from '../hooks/useTowersAssetsReady'

// /towers is a single route with an aerial landing (four tower pills) and a
// single-tower detail view. Which view shows is driven entirely by the URL: the
// selected tower lives in ?tower=<id>, so a detail view is shareable and
// deep-linkable — opening /towers?tower=stargaze lands straight on Stargaze.
// Picking a pill sets the param; the detail's back arrow clears it. Tower
// switching happens by going back to the landing, never by scrolling.
const Towers = () => {
  const ready = useTowersAssetsReady()
  const [searchParams, setSearchParams] = useSearchParams()

  // Arriving with a ?tower= param means we're deep-linking to (or returning to)
  // a detail view — skip the loading screen and render it immediately. Captured
  // once on mount so it survives backToLanding clearing the param.
  const [skipLoader] = useState(() => searchParams.get('tower') != null)
  const [overlayGone, setOverlayGone] = useState(skipLoader)

  // The URL is the single source of truth for which tower is open.
  const selectedTower =
    towers.find((t) => t.id === searchParams.get('tower')) ?? null

  // Push a history entry so the browser back button returns to the landing too.
  const selectTower = (tower) => setSearchParams({ tower: tower.id })

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

  return (
    <>
      {(ready || skipLoader) &&
        (selectedTower ? (
          <TowerDetail
            key={selectedTower.id}
            tower={selectedTower}
            onBack={backToLanding}
            play={overlayGone}
          />
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
