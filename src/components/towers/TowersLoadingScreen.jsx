import { useRef } from 'react'
import { gsap, useGSAP } from '../../gsap/Gsapconfig'
import { towers, TOWER_ACCENTS } from '../../data/towers'

// Heights normalized to Skyleap (53 floors) = 100%. Moonrise 49 ≈ 92%,
// Stargaze/Sunburst 39 ≈ 74%, split by 2px so all four read distinctly.
const TOWER_HEIGHTS = [180, 166, 133, 131]

// SVG layout in viewBox units. 4 rects, each 60 wide, 20 gap, 30 side pad.
// 30 + 4*60 + 3*20 + 30 = 360.
const TOWER_WIDTH = 60
const TOWER_GAP = 20
const SIDE_PAD = 30
const VB_WIDTH = 360
const VB_HEIGHT = 184
const Y_BOTTOM = 182

const TowersLoadingScreen = ({ ready, onExitComplete }) => {
  const containerRef = useRef(null)
  const overlayRef = useRef(null)
  const towerPathRefs = useRef([])
  const rivaliRef = useRef(null)
  const underlinePathRef = useRef(null)

  useGSAP(
    () => {
      gsap.set(towerPathRefs.current, { drawSVG: '0% 0%', fillOpacity: 0 })
      gsap.set(rivaliRef.current, { yPercent: 10, opacity: 0 })
      gsap.set(underlinePathRef.current, { drawSVG: '0% 0%' })

      const tl = gsap.timeline()

      // Each path's first point is the bottom-left corner, so the stroke
      // draw begins by rising up the left edge before sweeping around.
      tl.to(
        towerPathRefs.current,
        {
          drawSVG: '0% 100%',
          duration: 0.6,
          ease: 'power3.out',
          stagger: { each: 0.12 },
        },
        0,
      )

      tl.to(
        towerPathRefs.current,
        {
          fillOpacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          stagger: { each: 0.12 },
        },
        0.3,
      )

      tl.to(
        rivaliRef.current,
        { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out' },
        0.7,
      )

      tl.to(
        underlinePathRef.current,
        { drawSVG: '0% 100%', duration: 0.5, ease: 'none' },
        1.0,
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
          <svg
            viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
            className="w-70 md:w-90 lg:w-80 2xl:w-105 3xl:w-120 h-auto"
            fill="none"
          >
            {towers.map((t, i) => {
              const x = SIDE_PAD + i * (TOWER_WIDTH + TOWER_GAP)
              const x2 = x + TOWER_WIDTH
              const yTop = Y_BOTTOM - TOWER_HEIGHTS[i]
              return (
                <path
                  key={t.id}
                  ref={(el) => (towerPathRefs.current[i] = el)}
                  d={`M ${x} ${Y_BOTTOM} L ${x} ${yTop} L ${x2} ${yTop} L ${x2} ${Y_BOTTOM} Z`}
                  stroke={TOWER_ACCENTS[i]}
                  strokeWidth={3}
                  fill={TOWER_ACCENTS[i]}
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </svg>

          <div className="flex flex-col items-center gap-3 md:gap-4">
            <div ref={rivaliRef}>
              <h1 className="font-script text-brand-brown text-5xl lg:text-4xl 2xl:text-6xl leading-none">
                Rivali Park 2
              </h1>
            </div>
            <svg
              viewBox="0 0 1200 20"
              className="w-25 md:w-30 lg:w-25 2xl:w-35 h-0.5 text-brand-brown"
              fill="none"
            >
              <path
                ref={underlinePathRef}
                d="M 0 10 L 1200 10"
                stroke="currentColor"
                strokeWidth={15}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TowersLoadingScreen
