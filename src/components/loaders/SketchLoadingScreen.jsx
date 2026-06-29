import { useRef } from 'react'
import { gsap, useGSAP } from '../../gsap/Gsapconfig'

// Shared hand-sketch loading overlay (mirrors the towers loader): a line-art
// vector "draws" itself in, a plain heading lifts up, and a cursive subheading
// "writes" left-to-right. When `ready` flips true the whole overlay slides up
// and off, then calls `onExitComplete`.
//
// Pass the vector / subheading as imported `?react` SVG components so their
// individual <path>s can be animated.
const SketchLoadingScreen = ({
  ready,
  onExitComplete,
  Vector,
  vectorClassName,
  heading,
  Subheading,
  subheadingClassName,
}) => {
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

      // 1. Draw the line-art strokes.
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
          <Vector ref={vectorRef} className={vectorClassName} />

          <div className="flex flex-col items-center gap-3 md:gap-4">
            <h1
              ref={headingRef}
              className="font-sans font-semibold text-on-light-black text-3xl md:text-4xl lg:text-4xl 2xl:text-5xl leading-none tracking-[-0.5px]"
            >
              {heading}
            </h1>
            <Subheading ref={subheadingRef} className={subheadingClassName} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SketchLoadingScreen
