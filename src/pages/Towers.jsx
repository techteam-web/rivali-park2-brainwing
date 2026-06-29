import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { towers } from '../data/towers'
import TowersLanding from './TowersLanding'
import TowerDetail from '../components/towers/TowerDetail'
import TowersLoadingScreen from '../components/towers/TowersLoadingScreen'
import useTowersAssetsReady from '../hooks/useTowersAssetsReady'

// /towers is a single, state-driven route: an aerial landing (four tower pills)
// and a single-tower detail view. Picking a pill opens that tower's detail; the
// detail's back arrow returns to the landing. Tower switching happens by going
// back to the landing, never by scrolling.
//
// A ?tower= param (set when leaving for a tower's unit plan) opens that tower's
// detail directly on mount, so returning from the unit plan restores the view.
const Towers = () => {
  const ready = useTowersAssetsReady()
  const [searchParams, setSearchParams] = useSearchParams()

  // Arriving with a ?tower= param means we're returning from a tower's unit
  // plan (or deep-linking to a detail) — skip the loading screen and render the
  // view immediately. Captured once on mount so it survives backToLanding
  // clearing the param.
  const [skipLoader] = useState(() => searchParams.get('tower') != null)
  const [overlayGone, setOverlayGone] = useState(skipLoader)

  const [selectedTower, setSelectedTower] = useState(() => {
    const id = searchParams.get('tower')
    return towers.find((t) => t.id === id) ?? null
  })

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

  const backToLanding = () => {
    setSelectedTower(null)
    // Drop the ?tower= param so the URL reflects the landing.
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
          <TowersLanding onSelect={setSelectedTower} />
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
