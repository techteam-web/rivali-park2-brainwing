import { useRef } from 'react'
import { gsap, useGSAP } from '../../gsap/Gsapconfig'
import LoaderFloorplan from '../../assets/towers/loader-floorplan.svg?react'
import LoaderSubheading from '../../assets/towers/loader-subheading.svg?react'

const TowersLoadingScreen = ({ ready, onExitComplete }) => {
  const containerRef = useRef(null)
  const overlayRef = useRef(null)
  const vectorRef = useRef(null)
  const headingRef = useRef(null)
  const subheadingRef = useRef(null)

  useGSAP(
    () => {
      const vectorPaths = vectorRef.current.querySelectorAll('path')
      // Filled detail marks can't "draw" (no stroke), so fade them in instead.
      const strokePaths = []
      const fillPaths = []
      vectorPaths.forEach((p) => {
        const stroke = p.getAttribute('stroke')
        if (stroke && stroke !== 'none') strokePaths.push(p)
        else fillPaths.push(p)
      })

      gsap.set(strokePaths, { drawSVG: '0% 0%' })
      gsap.set(fillPaths, { opacity: 0 })
      gsap.set(headingRef.current, { yPercent: 20, opacity: 0 })
      gsap.set(subheadingRef.current, { clipPath: 'inset(0 100% 0 0)', opacity: 0 })

      const tl = gsap.timeline()

      // 1. Draw the floor-plan strokes.
      tl.to(
        strokePaths,
        {
          drawSVG: '0% 100%',
          duration: 0.9,
          ease: 'power2.out',
          stagger: { each: 0.03, from: 'start' },
        },
        0,
      )

      tl.to(fillPaths, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.9)

      // 2. Reveal the black heading.
      tl.to(
        headingRef.current,
        { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out' },
        1.0,
      )

      // 3. "Write" the script subheading left-to-right.
      tl.to(
        subheadingRef.current,
        { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.9, ease: 'power1.inOut' },
        1.25,
      )
    },
    { scope: containerRef },
  )

  useGSAP(
    () => {
      if (!ready) return

      const exitTl = gsap.timeline({ onComplete: onExitComplete })

      exitTl.to({}, { duration: 0.15 }, 0)

      exitTl.to(
        overlayRef.current,
        { yPercent: -100, duration: 1.8, ease: 'expo.in' },
        0.15,
      )
    },
    { scope: containerRef, dependencies: [ready] },
  )

  return (
    <div ref={containerRef}>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-pastel-brown-bg"
      >
        <div className="flex flex-col items-center gap-6 md:gap-8 2xl:gap-10">
          <LoaderFloorplan
            ref={vectorRef}
            className="w-40 md:w-44 lg:w-44 2xl:w-52 3xl:w-60 h-auto"
          />

          <div className="flex flex-col items-center gap-3 md:gap-4">
            <h1
              ref={headingRef}
              className="font-sans font-semibold text-on-light-black text-3xl md:text-4xl lg:text-4xl 2xl:text-5xl leading-none tracking-[-0.5px]"
            >
              Finding the right space
            </h1>
            <LoaderSubheading
              ref={subheadingRef}
              className="w-56 md:w-64 lg:w-64 2xl:w-72 h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TowersLoadingScreen
