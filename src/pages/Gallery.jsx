import { useRef, useState } from 'react'
import InlineSVG from '../components/about/InlineSVG'
import SketchLoadingScreen, { LOADER_HALFWAY_S } from '../components/loaders/SketchLoadingScreen'
import useLoaderReady from '../hooks/useLoaderReady'
import { useEntryLoader } from '../hooks/useEntryLoader'
import AmenitiesLoaderVector from '../assets/loaders/amenities-loader-vector.svg?react'
import AmenitiesLoaderSubheading from '../assets/loaders/amenities-loader-subheading.svg?react'
import { useGalleryTransition } from '../hooks/useGalleryTransition'
import { SITE_AERIAL, SITE_AERIAL_W, SITE_AERIAL_H, TOWER_LABELS, SITE_AERIAL_FRAME } from '../data/siteAerial'
import { hotspotStageStyle } from '../lib/hotspotStage'
import ImageNote from '../components/layout/ImageNote'

const BG_W = SITE_AERIAL_W
const BG_H = SITE_AERIAL_H

// Central Courtyard, Wellness Club and Social Club are the design team's
// outlines (15 Oct), cropped from their 1852x1120 artboard, in which the old
// cropped aerial sat at (144, 113), 1390.4 wide. That crop is the middle
// 78.69% of the full aerial now used (offset 5.97%, 4.19%), and the positions
// below have been carried over onto it. Central Courtyard is drawn at 85% of their size
// about its own centre, so it reads as a marker inside the courtyard rather
// than covering all of it. Social Club is drawn at 85% of their size, held to
// its bottom-right corner on the building and nudged 0.005 right, so its west
// edge pulls clear of the Central Courtyard. Sky Club is the design team's
// cut-out of the Skyleap block (16 Oct), placed with the same mapping, with
// its tower tops and east edge (drawn over the trees) pulled in to the roof
// and wall measured on the render; its
// label text is the earlier outline's lettering, since theirs came as live
// text in a font the site doesn't load. Convention Center is still the older
// outline, placed by eye.
const sections = [
  {
    name: 'Sky Club',
    src: '/gallery/Skyclub.svg',
    top: 0.0608,
    left: 0.33,
    width: 0.2935,
    href: '/gallery/sky-club',
  },
  {
    name: 'Wellness Club',
    src: '/gallery/Wellness Club.svg',
    top: 0.2993,
    left: 0.4791,
    width: 0.0724,
    href: '/gallery/wellness-club',
  },
  {
    name: 'Central Courtyard',
    src: '/gallery/Central.svg',
    top: 0.363,
    left: 0.4184,
    width: 0.2398,
    href: '/gallery/central-courtyard',
  },
  {
    name: 'Convention Center',
    src: '/gallery/Convention Center.svg',
    top: 0.6015,
    left: 0.3957,
    width: 0.0889,
    href: '/gallery/convention-center',
  },
  {
    name: 'Social Club',
    src: '/gallery/Social Club.svg',
    top: 0.4378,
    left: 0.6102,
    width: 0.0961,
    href: '/gallery/social-club',
  },
]

const towers = [
  { name: 'Skyleap', ...TOWER_LABELS.skyleap },
  { name: 'Sunburst', ...TOWER_LABELS.sunburst },
  { name: 'Moonrise', ...TOWER_LABELS.moonrise },
  { name: 'Stargaze', ...TOWER_LABELS.stargaze },
]

const STAGE = hotspotStageStyle({ w: BG_W, h: BG_H, ...SITE_AERIAL_FRAME })

const Gallery = () => {
  const containerRef = useRef(null)
  // Sketch intro over the page while the fonts settle, matching the other tabs.
  const loaderReady = useLoaderReady()
  // The loader introduces the section from the homepage; coming back from a
  // club page lands straight on the hub instead of replaying it.
  const playLoader = useEntryLoader()
  const [overlayGone, setOverlayGone] = useState(() => !playLoader)
  // Behind the loader, the render fades in as the overlay starts to lift and
  // the outlines draw in once it is halfway up, so the draw is seen rather
  // than finished underneath it.
  const { exitTo } = useGalleryTransition({
    containerRef,
    enabled: !playLoader || loaderReady,
    drawDelay: playLoader ? LOADER_HALFWAY_S : 0,
  })

  return (
    <>
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-black">
      <div className="absolute" style={STAGE}>
        <img
          src={SITE_AERIAL}
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

      <ImageNote />
      <div
        data-back-btn
        className="absolute top-5 left-5 z-10 flex items-center gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 4xl:gap-5 5xl:gap-8"
      >
        <button
          type="button"
          aria-label="Back"
          onClick={() => exitTo('/')}
          className="flex items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/30 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-[transform,background-color] duration-200 hover:bg-black/60 hover:scale-[1.05] focus:outline-none focus-visible:bg-black/60 focus-visible:scale-[1.05] h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
        >
          <svg viewBox="0 0 25 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12">
            <path d="M22.332 12.0191H2.21366M11.2814 20.3545L2.21366 12.0191L11.2814 3.64453" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Go to homepage"
          onClick={() => exitTo('/')}
          className="flex items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/30 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-[transform,background-color] duration-200 hover:bg-black/60 hover:scale-[1.05] focus:outline-none focus-visible:bg-black/60 focus-visible:scale-[1.05] h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12">
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
