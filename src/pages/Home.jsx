import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'
import EnterExperience from '../components/home/EnterExperience'
import HomeNavbar from '../components/home/HomeNavbar'
// WelcomeForm (name/email/phone gate shown on site entry) temporarily disabled.
// Uncomment to re-enable. See the commented blocks below as well.
// import WelcomeForm, { readStoredVisitor } from '../components/home/WelcomeForm'

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

  // WelcomeForm disabled — visitor/form state kept commented for easy re-enable.
  // Within the same tab session, treat a prior entry as already-greeted so
  // navigating back here doesn't reopen the form.
  // const [visitor, setVisitor] = useState(() =>
  //   hasEnteredOnce ? readStoredVisitor() : null,
  // )
  // const [isFormMounted, setIsFormMounted] = useState(!hasEnteredOnce)

  useGSAP(
    () => {
      gsap.set(navRef.current, {
        yPercent: hasEnteredOnce ? 0 : 100,
        opacity: hasEnteredOnce ? 1 : 0,
      })
    },
    { scope: containerRef },
  )

  // const handleFormSubmit = (data) => {
  //   setVisitor(data)
  // }

  // const handleFormExit = () => {
  //   setIsFormMounted(false)
  // }

  const handleEnter = () => {
    sessionStorage.setItem(SESSION_KEY, '1')
    const video = videoRef.current
    if (!video) return
    // The intro plays WITH SOUND by default. Synchronous play() inside the
    // click preserves the user gesture browsers require for audio — do not
    // defer with setTimeout.
    video.muted = false
    video.volume = 1
    video.play().catch(() => {
      // Some kiosk/embedded browsers still refuse unmuted playback on a first
      // gesture. Rather than opening silent-and-stuck, fall back to muted
      // playback and unmute on the very next interaction.
      video.muted = true
      video.play().catch((err) => console.warn('video play rejected', err))
      const unmute = () => {
        video.muted = false
        video.volume = 1
      }
      window.addEventListener('pointerdown', unmute, { once: true })
      window.addEventListener('keydown', unmute, { once: true })
    })
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
      {hasEnteredOnce ? (
        <img
          src="/home/landing-poster-end.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          src="/home/landing-video.mp4"
          playsInline
          preload="auto"
          controls={false}
          onLoadedData={() => setIsVideoReady(true)}
          onCanPlay={() => setIsVideoReady(true)}
          onEnded={handleVideoEnded}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <HomeNavbar ref={navRef} />
      {isOverlayMounted && (
        <EnterExperience
          isVideoReady={isVideoReady}
          visitorName={''}
          onEnter={handleEnter}
          onExit={() => setIsOverlayMounted(false)}
        />
      )}
      {/* WelcomeForm (name/email/phone) disabled — uncomment to re-enable.
      {isFormMounted && (
        <WelcomeForm
          onSubmit={handleFormSubmit}
          onExit={handleFormExit}
        />
      )} */}
    </div>
  )
}

export default Home
