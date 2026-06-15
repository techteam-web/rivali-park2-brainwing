import { useRef } from 'react'
import InlineSVG from '../components/about/InlineSVG'
import { useGalleryTransition } from '../hooks/useGalleryTransition'
import { useSkyClubHovers } from '../hooks/useSkyClubHovers'

const BG_W = 1440
const BG_H = 1024


const cards = [
  { name: 'Viewing Decks',  src: '/gallery/svgs/sky club/viewing decks.svg',   top: 0.4282, left: 0.2323, slug: 'viewing-decks' },
  { name: 'Kids play area', src: '/gallery/svgs/sky club/kids play area.svg',  top: 0.4282, left: 0.4025, slug: 'kids-play-area' },
  { name: 'Guests Rooms',   src: '/gallery/svgs/sky club/guest rooms.svg',     top: 0.4282, left: 0.555,  slug: 'guest-rooms' },
  { name: 'Banquet hall',   src: '/gallery/svgs/sky club/banquette hall.svg',  top: 0.4282, left: 0.7135 },
  { name: 'Sky Fitness',    src: '/gallery/svgs/sky club/sky fitness.svg',     top: 0.3833, left: 0.8369, slug: 'sky-fitness' },
  { name: 'Spa',            src: '/gallery/svgs/sky club/spa.svg',             top: 0.4282, left: 0.9421, slug: 'spa' },
]

const PILL_BG =
  'radial-gradient(ellipse 38.32% 0.91% at 50% 50%, rgba(255,255,255,0) 0%, rgba(0,0,0,0.112) 100%), linear-gradient(180deg, rgba(243,198,143,0.0051) 0%, rgba(243,198,143,0) 100%)'

const BOTTOM_BG = 'linear-gradient(180deg, rgba(26,26,26,0) 0%, #1A1A1A 76.5%)'

const SkyClub = () => {
  const containerRef = useRef(null)
  const { exitTo } = useGalleryTransition({ containerRef })
  useSkyClubHovers(containerRef)

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
          src="/gallery/sky club bg.webp"
          alt=""
          data-bg-image
          className="block w-full h-full select-none pointer-events-none"
          draggable={false}
        />

        {cards.map((c) => (
          <button
            key={c.name}
            type="button"
            aria-label={c.name}
            data-card-name={c.name.toLowerCase()}
            onClick={c.slug ? () => exitTo(`/gallery/sky-club/${c.slug}`) : undefined}
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
        className="hidden lg:flex absolute top-5 left-5 z-[60] items-center justify-center rounded-full transition-[transform,filter] duration-200 hover:scale-[1.05] hover:brightness-125 focus:outline-none focus-visible:scale-[1.05] focus-visible:brightness-125 h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
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
        Sky Club
      </h1>
    </div>
  )
}

export default SkyClub
