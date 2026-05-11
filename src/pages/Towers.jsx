import { useEffect, useState } from 'react'
import TowersCarousel from '../components/towers/TowersCarousel'
import TowersLoadingScreen from '../components/towers/TowersLoadingScreen'
import useTowersAssetsReady from '../hooks/useTowersAssetsReady'

const Towers = () => {
  const ready = useTowersAssetsReady()
  const [overlayGone, setOverlayGone] = useState(false)

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

  return (
    <>
      {ready && <TowersCarousel />}
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
