import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { gsap, useGSAP } from '../../gsap/Gsapconfig'
import useLoaderReady from '../../hooks/useLoaderReady'
import LoaderVector from '../../assets/locations/svgs/Loader.svg?react'

// How long `progress === 100 && !active` must hold before we call the 3D scene
// loaded. RivaliMap suspends on its GLB before its KTX2 loads are even requested,
// so mid-load there is a real window where every started item has finished and
// drei reports 100% / idle. Riding that gap out is what keeps the overlay from
// lifting early.
const SETTLE_MS = 300

// How long to wait for the canvas's first-frame signal once the assets are in.
// The scene should paint within a frame or two; this only exists so a lost WebGL
// context or a backgrounded tab can't strand a full-screen overlay over the map.
// Deliberately started off assetsDone rather than mount: on a slow connection the
// download alone outlasts any mount-based timer, which would bypass the gate on
// every slow load (the towers detail can use a mount timer because its images
// decode fast).
const FIRST_FRAME_TIMEOUT_MS = 2500

// Loading overlay for /locations. Covers the canvas-init + asset stall (map GLB,
// 4 KTX2 bakes, building GLB, bird GLB, water normal) while the hand-sketch city
// draws itself in, then fades to reveal a fully loaded map.
//
// Gated on drei's useProgress, which reads a global store fed by three's
// DefaultLoadingManager — every /locations asset goes through useGLTF/useLoader,
// so it sees all of them, and it works out here in the DOM (outside <Canvas>).
//
// useProgress alone is not enough to fade on, though: it reports the last byte
// DOWNLOADED, which is the moment React commits the Suspense boundary and Three
// compiles every shader and renders the first 4.5M-vertex frame synchronously.
// Fading there means tweening across a blocked frame, which is what stuttered.
// So the fade also waits on sceneRendered — the canvas's first-frame signal.
//
// Must mount as a SIBLING of the usePageTransition container, not a child: that
// hook blurs and fades its container in on mount, which would blur the loader too.
const LocationsLoader = ({ sceneRendered, onExitComplete }) => {
  const containerRef = useRef(null)
  const overlayRef = useRef(null)
  const vectorRef = useRef(null)
  const headingRef = useRef(null)
  const subtitleRef = useRef(null)

  const { progress, active } = useProgress()
  const [assetsDone, setAssetsDone] = useState(false)
  const [frameTimedOut, setFrameTimedOut] = useState(false)

  // Latches once, never unlatches. `active` is also false BEFORE loading starts,
  // so the progress check is what stops this from resolving on the first frame.
  useEffect(() => {
    if (assetsDone) return
    if (active || progress < 100) return
    const id = setTimeout(() => setAssetsDone(true), SETTLE_MS)
    return () => clearTimeout(id)
  }, [active, progress, assetsDone])

  // Safety net: if the canvas never reports a frame, fade anyway rather than
  // leaving a full-screen overlay stuck over a working map.
  useEffect(() => {
    if (!assetsDone || sceneRendered || frameTimedOut) return
    const id = setTimeout(() => setFrameTimedOut(true), FIRST_FRAME_TIMEOUT_MS)
    return () => clearTimeout(id)
  }, [assetsDone, sceneRendered, frameTimedOut])

  // Assets downloaded AND the scene has painted past its compile spike, then
  // fonts + a minimum on-screen window so a cached load still plays the draw-on
  // instead of blinking.
  const ready = useLoaderReady(assetsDone && (sceneRendered || frameTimedOut))

  // No `dependencies`, so this runs once on mount. useProgress re-renders this
  // component on every asset tick, and the draw-on must not restart on any of them.
  useGSAP(
    () => {
      // Every path in Loader.svg is stroked (no fills), so all of them draw.
      const paths = vectorRef.current.querySelectorAll('path')

      gsap.set(paths, { drawSVG: '0% 0%' })
      gsap.set([headingRef.current, subtitleRef.current], { yPercent: 20, opacity: 0 })

      const tl = gsap.timeline()

      tl.to(
        paths,
        {
          drawSVG: '0% 100%',
          duration: 1.1,
          ease: 'power2.out',
          stagger: { each: 0.02, from: 'start' },
        },
        0,
      )

      tl.to(headingRef.current, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, 1.1)
      tl.to(subtitleRef.current, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, 1.3)
    },
    { scope: containerRef },
  )

  useGSAP(
    () => {
      if (!ready) return

      // Opacity only. No filter or scale on a full-screen element: those force a
      // main-thread repaint every frame. willChange promotes the overlay to its
      // own compositor layer so the fade runs on the GPU; no need to clean it up,
      // onExitComplete unmounts the node.
      //
      // autoAlpha lands on visibility: hidden, so the overlay stops blocking the
      // map even in the frame before the parent unmounts it.
      gsap.set(overlayRef.current, { willChange: 'opacity' })
      gsap.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: onExitComplete,
      })
    },
    { scope: containerRef, dependencies: [ready] },
  )

  return (
    <div ref={containerRef}>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-100 flex items-center justify-center bg-pastel-brown-bg"
      >
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <LoaderVector
            ref={vectorRef}
            aria-hidden="true"
            className="w-[260px] md:w-[320px] 2xl:w-[360px] h-auto"
          />

          <div className="flex flex-col items-center gap-1 md:gap-2">
            <h1
              ref={headingRef}
              className="font-sans font-semibold text-on-light-black text-2xl md:text-3xl 2xl:text-4xl leading-none tracking-[-0.5px]"
            >
              Convenient &amp; connected
            </h1>
            <p
              ref={subtitleRef}
              className="font-script text-brand-brown text-xl md:text-2xl 2xl:text-3xl leading-none"
            >
              with everything you need
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationsLoader
