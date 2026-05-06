import { useRef } from 'react'
import InlineSVG from '../components/about/InlineSVG'
import { useGalleryTransition } from '../hooks/useGalleryTransition'
import { useSocialClubHovers } from '../hooks/useSocialClubHovers'

const BG_W = 1324
const BG_H = 745

const cards = [
  { name: 'Cafeteria',                 src: '/gallery/svgs/social club/cafeteria.svg',                 top: 0.360, left: 0.24 },
  { name: 'Screening room',            src: '/gallery/svgs/social club/screeing room.svg',             top: 0.40, left: 0.36 },
  { name: 'Kids Club',                 src: '/gallery/svgs/social club/kids club.svg',                 top: 0.42, left: 0.57 },
  { name: 'Card room',                 src: '/gallery/svgs/social club/card room.svg',                 top: 0.39, left: 0.69 },
  { name: 'Social media studio',       src: '/gallery/svgs/social club/social media studio.svg',       top: 0.33, left: 0.824 },
  { name: 'Library & business centre', src: '/gallery/svgs/social club/library & business center.svg', top: 0.55, left: 0.22 },
  { name: 'Billiard room',             src: '/gallery/svgs/social club/billiard room.svg',             top: 0.54, left: 0.66 },
  { name: 'Teen lounge',               src: '/gallery/svgs/social club/teen lounge.svg',               top: 0.54, left: 0.85 },
]

const decoratives = [
  { name: 'man-walking', src: '/gallery/svgs/social club/man walking svg.svg',  top: 0.555, left: 0.444, width: 0.024 },
  { name: 'birds',       src: '/gallery/svgs/social club/birds-social-club.svg', top: 0.69, left: 0.30, width: 0.052 },
]

const PILL_BG =
  'radial-gradient(ellipse 38.32% 0.91% at 50% 50%, rgba(255,255,255,0) 0%, rgba(0,0,0,0.112) 100%), linear-gradient(180deg, rgba(243,198,143,0.0051) 0%, rgba(243,198,143,0) 100%)'

const BOTTOM_BG = 'linear-gradient(180deg, rgba(26,26,26,0) 0%, #1A1A1A 76.5%)'

const SocialClub = () => {
  const containerRef = useRef(null)
  const { exitTo } = useGalleryTransition({ containerRef })
  useSocialClubHovers(containerRef)

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-black">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          '--stage-w': `max(100vw, calc(100vh * ${BG_W} / ${BG_H}))`,
          width: `max(100vw, calc(100vh * ${BG_W} / ${BG_H}))`,
          height: `max(100vh, calc(100vw * ${BG_H} / ${BG_W}))`,
        }}
      >
        <img
          src="/gallery/social club bg.png"
          alt=""
          data-bg-image
          className="block w-full h-full select-none pointer-events-none"
          draggable={false}
        />

        {decoratives.map((d) => (
          <InlineSVG
            key={d.name}
            src={d.src}
            data-draw
            aria-hidden="true"
            className="absolute block select-none pointer-events-none"
            style={{
              top: `${d.top * 100}%`,
              left: `${d.left * 100}%`,
              width: `${d.width * 100}%`,
            }}
          />
        ))}

        {cards.map((c) => (
          <button
            key={c.name}
            type="button"
            aria-label={c.name}
            data-card-name={c.name.toLowerCase()}
            className="absolute -translate-x-1/2 group flex flex-col items-center cursor-pointer p-0 border-0 bg-transparent focus:outline-none lg:gap-0.5 xl:gap-0.75 2xl:gap-0.75 3xl:gap-1 4xl:gap-1.25 5xl:gap-2"
            style={{
              top: `${c.top * 100}%`,
              left: `${c.left * 100}%`,
            }}
          >
            <InlineSVG
              src={c.src}
              data-draw
              aria-hidden="true"
              className="block select-none transition-[filter,transform] duration-200 ease-out hover:scale-[1.06] hover:brightness-110 focus-visible:scale-[1.06] focus-visible:brightness-110 lg:w-10 xl:w-12.5 2xl:w-15 3xl:w-18.75 4xl:w-25 5xl:w-37.5"
            />
            <span
              data-card-label
              className="rounded-full font-semibold text-white text-center whitespace-nowrap backdrop-blur-[1.5px] xl:backdrop-blur-[2px] 2xl:backdrop-blur-[2.5px] 3xl:backdrop-blur-[3px] 4xl:backdrop-blur-xs 5xl:backdrop-blur-[6px] transition-[filter] duration-200 lg:leading-[165%] lg:text-[11px] xl:text-[14px] 2xl:text-[16px] 3xl:text-[21px] 4xl:text-[27px] 5xl:text-[41px] lg:py-1 lg:px-1.5 xl:py-1.25 xl:px-2 2xl:py-1.5 2xl:px-2.25 3xl:py-2 3xl:px-2.75 4xl:py-2.5 4xl:px-3.75 5xl:py-3.75 5xl:px-5.75"
              style={{
                backgroundImage: PILL_BG,
              }}
            >
              {c.name}
            </span>
          </button>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="hidden lg:block lg:backdrop-blur-[2px] xl:backdrop-blur-[2.5px] 2xl:backdrop-blur-[3px] 3xl:backdrop-blur-[3.7px] 4xl:backdrop-blur-[5px] 5xl:backdrop-blur-[7.5px]"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '33px',
          mask: 'linear-gradient(to bottom, black 0%, black 30%, transparent 100%)',
          WebkitMask: 'linear-gradient(to bottom, black 0%, black 30%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />

      <div
        aria-hidden="true"
        className="hidden lg:block"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '90px',
          backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
          zIndex: 51,
        }}
      />

      <div
        aria-hidden="true"
        className="hidden lg:block absolute left-0 right-0 pointer-events-none z-5"
        style={{ bottom: '-8px', height: '220px', backgroundImage: BOTTOM_BG }}
      />

      <button
        type="button"
        aria-label="Back"
        data-back-btn
        onClick={() => exitTo('/gallery')}
        className="hidden lg:flex absolute top-5 left-5 z-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-[1.05] hover:brightness-125 focus:outline-none focus-visible:scale-[1.05] focus-visible:brightness-125 h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
        style={{ backgroundColor: 'rgba(49, 49, 49, 0.2)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <h1
        data-page-title
        className="hidden lg:block absolute z-10 text-white font-semibold pointer-events-none leading-tight text-xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl 4xl:text-5xl 5xl:text-6xl"
        style={{ top: 'auto', bottom: '3rem', left: '3rem' }}
      >
        Social Club
      </h1>
    </div>
  )
}

export default SocialClub
