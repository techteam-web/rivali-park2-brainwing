import { useRef } from 'react'
import InlineSVG from '../components/about/InlineSVG'
import { useGalleryTransition } from '../hooks/useGalleryTransition'

const BG_W = 1226
const BG_H = 995

const sections = [
  {
    name: 'Sky Club',
    src: '/gallery/Skyclub.svg',
    top: 0.155,
    left: 0.259,
    width: 0.310,
    href: '/gallery/sky-club',
  },
  {
    name: 'Wellness Club',
    src: '/gallery/Wellness Club.svg',
    top: 0.25,
    left: 0.342,
    width: 0.150,
    href: '/gallery/wellness-club',
  },
  {
    name: 'Central Courtyard',
    src: '/gallery/Central.svg',
    top: 0.32,
    left: 0.105,
    width: 0.680,
    href: '/gallery/central-courtyard',
  },
  {
    name: 'Convention Center',
    src: '/gallery/Convention Center.svg',
    top: 0.69,
    left: 0.13,
    width: 0.186,
    href: '/gallery/convention-center',
  },
  {
    name: 'Social Club',
    src: '/gallery/Social Club.svg',
    top: 0.457,
    left: 0.602,
    width: 0.260,
    href: '/gallery/social-club',
  },
]

const towers = [
  { name: 'Skyleap',  top: 0.235, left: 0.634 },
  { name: 'Sunburst', top: 0.355, left: 0.925 },
  { name: 'Moonrise', top: 0.775, left: 0.555 },
  { name: 'Stargaze', top: 0.735, left: 0.935 },
]

const Gallery = () => {
  const containerRef = useRef(null)
  const { exitTo } = useGalleryTransition({ containerRef })

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-black">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `max(100vw, calc(100vh * ${BG_W} / ${BG_H}))`,
          height: `max(100vh, calc(100vw * ${BG_H} / ${BG_W}))`,
        }}
      >
        <img
          src="/gallery/gallery bg.webp"
          alt=""
          data-bg-image
          className="block w-full h-full select-none pointer-events-none"
          draggable={false}
        />

        {sections.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => exitTo(s.href)}
            aria-label={s.name}
            data-tune={s.name}
            className="absolute pointer-events-none p-0 border-0 bg-transparent focus:outline-none transition-transform duration-200 ease-out has-[svg_*:hover]:scale-[1.03] has-[svg_*:hover]:brightness-110 focus-visible:scale-[1.03]"
            style={{
              top: `${s.top * 100}%`,
              left: `${s.left * 100}%`,
              width: `${s.width * 100}%`,
            }}
          >
            <InlineSVG
              src={s.src}
              aria-label={s.name}
              data-draw
              className="svg-hit-painted block w-full select-none transition-[filter] duration-200"
            />
          </button>
        ))}

        {towers.map((t) => (
          <button
            key={t.name}
            type="button"
            data-card-label
            onClick={() => exitTo(`/towers#${t.name.toLowerCase()}`)}
            aria-label={t.name}
            data-tune={t.name}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-white/40 font-normal text-white text-center backdrop-blur-[1.3px] xl:backdrop-blur-[1.6px] 2xl:backdrop-blur-[2px] 3xl:backdrop-blur-[2.5px] 4xl:backdrop-blur-[3.3px] 5xl:backdrop-blur-[5px] transition-[transform,filter] duration-200 hover:scale-[1.05] hover:brightness-110 focus:outline-none focus-visible:scale-[1.05] focus-visible:brightness-110 px-5 py-1.5 text-[13px] leading-[165%] xl:px-6.25 xl:py-2 xl:text-[16px] 2xl:px-7.5 2xl:py-2.25 2xl:text-[20px] 3xl:px-9.5 3xl:py-2.75 3xl:text-[24px] 4xl:px-12.5 4xl:py-3.75 4xl:text-[32px] 5xl:px-18.75 5xl:py-5.75 5xl:text-[49px]"
            style={{
              top: `${t.top * 100}%`,
              left: `${t.left * 100}%`,
              backgroundImage:
                'radial-gradient(ellipse 38.32% 0.91% at 50% 50%, rgba(255,255,255,0) 0%, rgba(0,0,0,0.28) 100%), linear-gradient(180deg, rgba(243,198,143,0.0051) 0%, rgba(243,198,143,0) 100%)',
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label="Back"
        data-back-btn
        onClick={() => exitTo('/')}
        className="absolute top-5 left-5 z-10 flex items-center justify-center rounded-full bg-white/20 text-white transition-[transform,background-color] duration-200 hover:bg-white/30 hover:scale-[1.05] focus:outline-none focus-visible:bg-white/30 focus-visible:scale-[1.05] h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>
    </div>
  )
}

export default Gallery
