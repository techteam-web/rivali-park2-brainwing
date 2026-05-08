import { useRef } from 'react'
import InlineSVG from '../components/about/InlineSVG'
import { useGalleryTransition } from '../hooks/useGalleryTransition'
import { useWellnessClubHovers } from '../hooks/useWellnessClubHovers'

const BG_W = 896
const BG_H = 892

const cards = [
  { name: 'Salon',                       src: '/gallery/svgs/wellness club/salon.svg',                       top: 0.242, left: 0.675, slug: 'salon' },
  { name: 'Outdoor amphitheatre',        src: '/gallery/svgs/wellness club/outdoor amphitheatre.svg',        top: 0.282, left: 0.437 },
  { name: 'Spa',                         src: '/gallery/svgs/wellness club/spa.svg',                         top: 0.362, left: 0.306, slug: 'spa' },
  { name: 'Wellness bar',                src: '/gallery/svgs/wellness club/sports bar.svg',                  top: 0.350, left: 0.683, slug: 'wellness-bar' },
  { name: 'Dinning',                     src: '/gallery/svgs/wellness club/dining.svg',                      top: 0.422, left: 0.47},
  { name: 'Gymnasium & Fitness Studio',  src: '/gallery/svgs/wellness club/gymnasium & fitness studio.svg',  top: 0.568, left: 0.669, slug: 'gymnasium' },
]

const decoratives = [
  { name: 'left-tree',      src: '/gallery/svgs/wellness club/left-tree.svg',      top: 0.486, left: 0.055, width: 0.045 },
  { name: 'left-bush-tree', src: '/gallery/svgs/wellness club/left-bush-tree.svg', top: 0.470, left: 0.246, width: 0.070 },
  { name: 'right-bush',     src: '/gallery/svgs/wellness club/right-bush.svg',     top: 0.63, left: 0.800, width: 0.0390 },
  { name: 'right-bush-2',   src: '/gallery/svgs/wellness club/right-bush-2.svg',   top: 0.63, left: 0.740, width: 0.046 },
  { name: 'right-bush-3',   src: '/gallery/svgs/wellness club/right-bush-3.svg',   top: 0.625, left: 0.595, width: 0.046 },
  { name: 'person-1',       src: '/gallery/svgs/wellness club/person-1.svg',       top: 0.61, left: 0.625, width: 0.020 },
  { name: 'person-2',       src: '/gallery/svgs/wellness club/person-2.svg',       top: 0.65, left: 0.429, width: 0.030 },
  { name: 'person-3',       src: '/gallery/svgs/wellness club/person-3.svg',       top: 0.62, left: 0.325, width: 0.028 },
]

const PILL_BG =
  'radial-gradient(ellipse 38.32% 0.91% at 50% 50%, rgba(255,255,255,0) 0%, rgba(0,0,0,0.112) 100%), linear-gradient(180deg, rgba(243,198,143,0.0051) 0%, rgba(243,198,143,0) 100%)'

const BOTTOM_BG = 'linear-gradient(180deg, rgba(26,26,26,0) 0%, #1A1A1A 76.5%)'

const WellnessClub = () => {
  const containerRef = useRef(null)
  const { exitTo } = useGalleryTransition({ containerRef })
  useWellnessClubHovers(containerRef)

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-black">
      <div
        className="absolute inset-0 m-auto"
        style={{
          '--stage-w': `max(100vw, calc(100vh * ${BG_W} / ${BG_H}))`,
          width: `max(100vw, calc(100vh * ${BG_W} / ${BG_H}))`,
          height: `max(100vh, calc(100vw * ${BG_H} / ${BG_W}))`,
        }}
      >
        <img
          src="/gallery/wellness club bg.png"
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
            onClick={c.slug ? () => exitTo(`/gallery/wellness-club/${c.slug}`) : undefined}
            className="absolute -translate-x-1/2 z-[60] group flex flex-col items-center cursor-pointer p-0 border-0 bg-transparent focus:outline-none lg:gap-0.5 xl:gap-0.75 2xl:gap-0.75 3xl:gap-1 4xl:gap-1.25 5xl:gap-2"
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
        className="hidden lg:block absolute top-0 left-0 right-0 z-50 pointer-events-none lg:backdrop-blur-[2px] xl:backdrop-blur-[2.5px] 2xl:backdrop-blur-[3px] 3xl:backdrop-blur-[3.7px] 4xl:backdrop-blur-[5px] 5xl:backdrop-blur-[7.5px] h-[33px] xl:h-[41px] 2xl:h-[50px] 3xl:h-[62px] 4xl:h-[83px] 5xl:h-[124px]"
        style={{
          mask: 'linear-gradient(to bottom, black 0%, black 30%, transparent 100%)',
          WebkitMask: 'linear-gradient(to bottom, black 0%, black 30%, transparent 100%)',
        }}
      />

      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-0 left-0 right-0 z-[51] pointer-events-none h-[90px] xl:h-[113px] 2xl:h-[135px] 3xl:h-[169px] 4xl:h-[225px] 5xl:h-[338px]"
        style={{
          backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
        }}
      />

      <div
        aria-hidden="true"
        className="hidden lg:block absolute left-0 right-0 pointer-events-none z-5 -bottom-2 h-[150px] xl:h-[188px] 2xl:h-[225px] 3xl:h-[281px] 4xl:h-[375px] 5xl:h-[563px]"
        style={{ backgroundImage: BOTTOM_BG }}
      />

      <button
        type="button"
        aria-label="Back"
        data-back-btn
        onClick={() => exitTo('/gallery')}
        className="hidden lg:flex absolute top-5 left-5 z-[60] items-center justify-center rounded-full transition-all duration-200 hover:scale-[1.05] hover:brightness-125 focus:outline-none focus-visible:scale-[1.05] focus-visible:brightness-125 h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
        style={{ backgroundColor: 'rgba(49, 49, 49, 0.2)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <h1
        data-page-title
        className="hidden lg:block absolute z-10 text-white font-semibold pointer-events-none leading-tight text-xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl 4xl:text-5xl 5xl:text-6xl bottom-[50px] xl:bottom-[63px] 2xl:bottom-[75px] 3xl:bottom-[94px] 4xl:bottom-[125px] 5xl:bottom-[188px] left-[48px] xl:left-[60px] 2xl:left-[72px] 3xl:left-[90px] 4xl:left-[120px] 5xl:left-[180px]"
      >
        Wellness Club
      </h1>
    </div>
  )
}

export default WellnessClub
