import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap'
import EnterExperience from '../components/home/EnterExperience'
import HomeNavbar from '../components/home/HomeNavbar'
import ImageNote from '../components/layout/ImageNote'
// WelcomeForm (name/email/phone gate shown on site entry) temporarily disabled.
// Uncomment to re-enable. See the commented blocks below as well.
// import WelcomeForm, { readStoredVisitor } from '../components/home/WelcomeForm'

const SESSION_KEY = 'homeEntered'

// Home cover (12 Oct site aerial, turned 180° like the Amenities/Towers one,
// watermark cropped out). The intro video still plays on first entry and hands
// over to this still when it ends.
const HOME_COVER = '/home/landing-cover.jpg'

// The intro (16 Oct cut) comes to rest on the same aerial as the cover, framed
// wider: the cover is its last frame zoomed 1.272x about this point (fractions
// of the 16:9 frame), measured by aligning the two. On `ended` both push in
// about that point together, so the video lands exactly on the cover.
const END_ZOOM = 1.272
const END_FOCUS = { x: 0.2886, y: 0.2078 }
const END_PUSH_S = 1.6

// The focus point in px within an object-cover box. Video and cover are both
// 16:9, so they are cropped identically and share it.
const coverFocus = (el) => {
  const { width: bw, height: bh } = el.getBoundingClientRect()
  const k = Math.max(bw / 16, bh / 9)
  const dw = 16 * k
  const dh = 9 * k
  return `${(bw - dw) / 2 + END_FOCUS.x * dw}px ${(bh - dh) / 2 + END_FOCUS.y * dh}px`
}

const Home = () => {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const navRef = useRef(null)
  const coverRef = useRef(null)

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
      if (!hasEnteredOnce) gsap.set(coverRef.current, { autoAlpha: 0 })
    },
    { scope: containerRef },
  )

  // const handleFormSubmit = (data) => {
  //   setVisitor(data)
  // }

  // const handleFormExit = () => {
  //   setIsFormMounted(false)
  // }

  // Listen on the element itself rather than through React's onLoadedData.
  // Home is a lazy route, so React can create the <video> (and it can start
  // loading) before the page is committed; a load event that lands in that gap
  // is dropped, and with a cached video it never fires again, leaving the gate
  // on "Loading…" for good. So check whether it is already ready, too.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const markReady = () => setIsVideoReady(true)
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady()
      return
    }
    video.addEventListener('loadeddata', markReady)
    video.addEventListener('canplay', markReady)
    return () => {
      video.removeEventListener('loadeddata', markReady)
      video.removeEventListener('canplay', markReady)
    }
  }, [])

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
    const video = videoRef.current
    const cover = coverRef.current
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (video && !reduceMotion) {
      // Cover starts shrunk onto the matching part of the last frame and both
      // grow together, so they stay registered the whole way; the cover fades
      // up over the start to soften its edge against the video.
      const origin = coverFocus(video)
      gsap.set([video, cover], { transformOrigin: origin })
      gsap.set(cover, { scale: 1 / END_ZOOM })
      gsap.to(video, { scale: END_ZOOM, duration: END_PUSH_S, ease: 'power2.inOut' })
      gsap.to(cover, {
        scale: 1,
        duration: END_PUSH_S,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set(cover, { clearProps: 'transform,transformOrigin' })
          gsap.set(video, { autoAlpha: 0 })
        },
      })
      gsap.to(cover, { autoAlpha: 1, duration: 0.8, ease: 'power1.out' })
    } else {
      gsap.to(cover, { autoAlpha: 1, duration: 1.2, ease: 'power2.inOut' })
    }
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
      {!hasEnteredOnce && (
        <video
          ref={videoRef}
          src="/home/landing-video.mp4"
          playsInline
          preload="auto"
          controls={false}
          onEnded={handleVideoEnded}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <img
        ref={coverRef}
        src={HOME_COVER}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Not over the Enter screen, which is the logo, not a render. */}
      {!isOverlayMounted && <ImageNote />}
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
