import { useRef } from 'react'
import InlineSVG from '../components/about/InlineSVG'
import { useGalleryTransition } from '../hooks/useGalleryTransition'
import { useCentralCourtyardHovers } from '../hooks/useCentralCourtyardHovers'

const BG_W = 1440
const BG_H = 1024

const cards = [
  { name: 'Art Gallery',         src: '/gallery/svgs/central courtyard/art gallery.svg',         top: 0.1557, left: 0.3538, slug: 'art-gallery' },
  { name: 'Coffee Shop',         src: '/gallery/svgs/central courtyard/coffe shop.svg',          top: 0.1489, left: 0.6094, slug: 'coffee-shop' },
  { name: 'Kids play area',      src: '/gallery/svgs/central courtyard/kids play area.svg',      top: 0.2412, left: 0.8396, slug: 'kids-play-area' },
  { name: 'Liesure pool',        src: '/gallery/svgs/central courtyard/leisure pool.svg',        top: 0.3701, left: 0.2365, slug: 'liesure-pool' },
  { name: 'Swimming pool',       src: '/gallery/svgs/central courtyard/swimming pool.svg',       top: 0.4854, left: 0.8608, slug: 'swimming-pool' },
  { name: 'Multipurpose courts', src: '/gallery/svgs/central courtyard/multipurpose courts.svg', top: 0.6582, left: 0.0974, slug: 'multipurpose-courts' },
]

const decoratives = [
  { name: 'left-bushes', src: '/gallery/svgs/central courtyard/left-side-bushes.svg', top: 0.668,  left: 0.0549, width: 0.0813 },
  { name: 'right-tree',  src: '/gallery/svgs/central courtyard/right-side-tree.svg',  top: 0.6211, left: 0.8875, width: 0.0681 },
]

const PILL_BG =
  'radial-gradient(ellipse 38.32% 0.91% at 50% 50%, rgba(255,255,255,0) 0%, rgba(0,0,0,0.112) 100%), linear-gradient(180deg, rgba(243,198,143,0.0051) 0%, rgba(243,198,143,0) 100%)'

const BOTTOM_BG = 'linear-gradient(180deg, rgba(26,26,26,0) 0%, #1A1A1A 76.5%)'

const CentralCourtyard = () => {
  const containerRef = useRef(null)
  const { exitTo } = useGalleryTransition({ containerRef })
  useCentralCourtyardHovers(containerRef)

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
          src="/gallery/central courtyard bg.webp"
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
            onClick={c.slug ? () => exitTo(`/gallery/central-courtyard/${c.slug}`) : undefined}
            className={`absolute -translate-x-1/2 z-[60] amenity-hotspot group flex flex-col items-center ${c.slug ? 'cursor-pointer is-clickable' : 'cursor-default'} p-0 border-0 bg-transparent focus:outline-none lg:gap-0.5 xl:gap-0.75 2xl:gap-0.75 3xl:gap-1 4xl:gap-1.25 5xl:gap-2`}
            style={{
              top: `${c.top * 100}%`,
              left: `${c.left * 100}%`,
            }}
          >
            <InlineSVG
              src={c.src}
              data-draw
              aria-hidden="true"
              className="amenity-icon block select-none lg:w-[1.95rem] xl:w-[2.4rem] 2xl:w-[2.85rem] 3xl:w-[3.6rem] 4xl:w-[4.8rem] 5xl:w-[7.2rem]"
            />
            <span
              data-card-label
              className="amenity-pill rounded-full border border-transparent font-semibold text-white text-center whitespace-nowrap backdrop-blur-[1.5px] xl:backdrop-blur-[2px] 2xl:backdrop-blur-[2.5px] 3xl:backdrop-blur-[3px] 4xl:backdrop-blur-xs 5xl:backdrop-blur-[6px] transition-[filter,box-shadow,border-color] duration-200 lg:leading-[165%] lg:text-[11px] xl:text-[14px] 2xl:text-[16px] 3xl:text-[21px] 4xl:text-[27px] 5xl:text-[41px] lg:py-1 lg:px-1.5 xl:py-1.25 xl:px-2 2xl:py-1.5 2xl:px-2.25 3xl:py-2 3xl:px-2.75 4xl:py-2.5 4xl:px-3.75 5xl:py-3.75 5xl:px-5.75"
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

      <div
        data-back-btn
        className="hidden lg:flex absolute top-5 left-5 z-[60] items-center gap-2 xl:gap-2.5 2xl:gap-3 3xl:gap-4 4xl:gap-5 5xl:gap-8"
      >
        <button
          type="button"
          aria-label="Back"
          onClick={() => exitTo('/gallery')}
          className="flex items-center justify-center rounded-full transition-[transform,filter] duration-200 hover:scale-[1.05] hover:brightness-125 focus:outline-none focus-visible:scale-[1.05] focus-visible:brightness-125 h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
          style={{ backgroundColor: 'rgba(49, 49, 49, 0.2)' }}
        >
          <svg viewBox="0 0 25 24" fill="none" stroke="white" strokeWidth="3" className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12">
            <path d="M22.332 12.0191H2.21366M11.2814 20.3545L2.21366 12.0191L11.2814 3.64453" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Go to homepage"
          onClick={() => exitTo('/')}
          className="flex items-center justify-center rounded-full transition-[transform,filter] duration-200 hover:scale-[1.05] hover:brightness-125 focus:outline-none focus-visible:scale-[1.05] focus-visible:brightness-125 h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
          style={{ backgroundColor: 'rgba(49, 49, 49, 0.2)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12">
            <path d="M4 11.5L12 4l8 7.5" />
            <path d="M6 10.5V19a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-8.5" />
          </svg>
        </button>
      </div>

      <h1
        data-page-title
        className="hidden lg:block absolute z-10 text-white font-semibold pointer-events-none leading-tight text-xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl 4xl:text-5xl 5xl:text-6xl bottom-[50px] xl:bottom-[63px] 2xl:bottom-[75px] 3xl:bottom-[94px] 4xl:bottom-[125px] 5xl:bottom-[188px] left-[48px] xl:left-[60px] 2xl:left-[72px] 3xl:left-[90px] 4xl:left-[120px] 5xl:left-[180px]"
      >
        Central courtyard
      </h1>
    </div>
  )
}

export default CentralCourtyard
