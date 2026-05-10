import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'
import EnterExperience from '../components/home/EnterExperience'
import HomeNavbar from '../components/home/HomeNavbar'

const SESSION_KEY = 'homeEntered'

const Home = () => {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const navRef = useRef(null)

  // Session-scoped: once the user has entered Home in this tab, returning
  // skips the gate, the playback, and the navbar reveal animation.
  const [hasEnteredOnce] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1',
  )
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [isOverlayMounted, setIsOverlayMounted] = useState(!hasEnteredOnce)

  useGSAP(
    () => {
      gsap.set(navRef.current, {
        yPercent: hasEnteredOnce ? 0 : 100,
        opacity: hasEnteredOnce ? 1 : 0,
      })
    },
    { scope: containerRef },
  )

  const handleLoadedMetadata = () => {
    if (hasEnteredOnce && videoRef.current) {
      const { duration } = videoRef.current
      if (Number.isFinite(duration) && duration > 0) {
        videoRef.current.currentTime = Math.max(0, duration - 0.1)
      }
    }
  }

  const handleEnter = () => {
    sessionStorage.setItem(SESSION_KEY, '1')
    // Synchronous play() inside the click preserves the user gesture
    // required for audio playback — do not defer with setTimeout.
    videoRef.current
      ?.play()
      .catch((err) => console.warn('video play rejected', err))
  }

  const handleVideoEnded = () => {
    if (hasEnteredOnce) return
    sessionStorage.setItem(SESSION_KEY, '1')
    gsap.to(navRef.current, {
      yPercent: 0,
      opacity: 1,
      duration: 1.2,
      ease: 'power3.out',
    })
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden relative bg-black"
    >
      <video
        ref={videoRef}
        src="/home/landing-video.mp4"
        playsInline
        preload="auto"
        controls={false}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadedData={() => setIsVideoReady(true)}
        onCanPlay={() => setIsVideoReady(true)}
        onEnded={handleVideoEnded}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <HomeNavbar ref={navRef} />
      {isOverlayMounted && (
        <EnterExperience
          isVideoReady={isVideoReady}
          onEnter={handleEnter}
          onExit={() => setIsOverlayMounted(false)}
        />
      )}
    </div>
  )
}

export default Home
