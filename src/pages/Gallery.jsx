import { useRef, useState } from 'react'
import InlineSVG from '../components/about/InlineSVG'
import SketchLoadingScreen from '../components/loaders/SketchLoadingScreen'
import useLoaderReady from '../hooks/useLoaderReady'
import AmenitiesLoaderVector from '../assets/loaders/amenities-loader-vector.svg?react'
import AmenitiesLoaderSubheading from '../assets/loaders/amenities-loader-subheading.svg?react'
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
  // Sketch intro over the page while the fonts settle, matching the other tabs.
  const loaderReady = useLoaderReady()
  const [overlayGone, setOverlayGone] = useState(false)
  const { exitTo } = useGalleryTransition({ containerRef })

  return (
    <>
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

        {/* Tower names are display-only labels — not hoverable, no navigation. */}
        {towers.map((t) => (
          <span
            key={t.name}
            data-card-label
            data-tune={t.name}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 font-normal text-white text-center backdrop-blur-[1.3px] xl:backdrop-blur-[1.6px] 2xl:backdrop-blur-[2px] 3xl:backdrop-blur-[2.5px] 4xl:backdrop-blur-[3.3px] 5xl:backdrop-blur-[5px] px-5 py-1.5 text-[13px] leading-[165%] xl:px-6.25 xl:py-2 xl:text-[16px] 2xl:px-7.5 2xl:py-2.25 2xl:text-[20px] 3xl:px-9.5 3xl:py-2.75 3xl:text-[24px] 4xl:px-12.5 4xl:py-3.75 4xl:text-[32px] 5xl:px-18.75 5xl:py-5.75 5xl:text-[49px]"
            style={{
              top: `${t.top * 100}%`,
              left: `${t.left * 100}%`,
              backgroundImage:
                'radial-gradient(ellipse 38.32% 0.91% at 50% 50%, rgba(255,255,255,0) 0%, rgba(0,0,0,0.28) 100%), linear-gradient(180deg, rgba(243,198,143,0.0051) 0%, rgba(243,198,143,0) 100%)',
            }}
          >
            {t.name}
          </span>
        ))}
      </div>

      <div
        data-back-btn
        className="absolute top-5 left-5 z-10 flex items-center gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 4xl:gap-5 5xl:gap-8"
      >
        <button
          type="button"
          aria-label="Back"
          onClick={() => exitTo('/')}
          className="flex items-center justify-center rounded-full bg-white/20 text-white transition-[transform,background-color] duration-200 hover:bg-white/30 hover:scale-[1.05] focus:outline-none focus-visible:bg-white/30 focus-visible:scale-[1.05] h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Go to homepage"
          onClick={() => exitTo('/')}
          className="flex items-center justify-center rounded-full bg-white/20 text-white transition-[transform,background-color] duration-200 hover:bg-white/30 hover:scale-[1.05] focus:outline-none focus-visible:bg-white/30 focus-visible:scale-[1.05] h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12">
            <path d="M4 11.5L12 4l8 7.5" />
            <path d="M6 10.5V19a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-8.5" />
          </svg>
        </button>
      </div>
    </div>

    {/* Sibling of the transition container on purpose: useGalleryTransition
        fades that root up from autoAlpha 0, which would take this overlay
        with it. */}
    {!overlayGone && (
      <SketchLoadingScreen
          ready={loaderReady}
          onExitComplete={() => setOverlayGone(true)}
          Vector={AmenitiesLoaderVector}
          vectorClassName="w-44 md:w-52 lg:w-52 2xl:w-60 3xl:w-68 h-auto"
          heading="Everything you need"
          Subheading={AmenitiesLoaderSubheading}
        subheadingClassName="w-56 md:w-64 lg:w-64 2xl:w-72 h-auto"
      />
    )}
    </>
  )
}

export default Gallery
