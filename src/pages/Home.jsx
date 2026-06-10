import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'
import EnterExperience from '../components/home/EnterExperience'
import HomeNavbar from '../components/home/HomeNavbar'
import WelcomeForm, { readStoredVisitor } from '../components/home/WelcomeForm'

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

  // Within the same tab session, treat a prior entry as already-greeted so
  // navigating back here doesn't reopen the form.
  const [visitor, setVisitor] = useState(() =>
    hasEnteredOnce ? readStoredVisitor() : null,
  )
  const [isFormMounted, setIsFormMounted] = useState(!hasEnteredOnce)

  useGSAP(
    () => {
      gsap.set(navRef.current, {
        yPercent: hasEnteredOnce ? 0 : 100,
        opacity: hasEnteredOnce ? 1 : 0,
      })
    },
    { scope: containerRef },
  )

  const handleFormSubmit = (data) => {
    setVisitor(data)
  }

  const handleFormExit = () => {
    setIsFormMounted(false)
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
      {/* TEMP: quick link to the Unit Plans page for review — remove later. */}
      <Link
        to="/unit-plans"
        className="fixed top-4 right-4 z-70 rounded-full bg-[#7A4833] px-5 py-2.5 text-[13px] font-medium uppercase tracking-[0.12em] text-white shadow-lg hover:bg-[#653a28] transition-colors"
      >
        Unit Plans →
      </Link>
      {isOverlayMounted && (
        <EnterExperience
          isVideoReady={isVideoReady}
          visitorName={visitor?.name || ''}
          onEnter={handleEnter}
          onExit={() => setIsOverlayMounted(false)}
        />
      )}
      {isFormMounted && (
        <WelcomeForm
          onSubmit={handleFormSubmit}
          onExit={handleFormExit}
        />
      )}
    </div>
  )
}

export default Home
