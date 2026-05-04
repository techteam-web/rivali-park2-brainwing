import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, aboutReveal } from '../../lib/gsap'
import InlineSVG from './InlineSVG'

const masters = [
  {
    name: 'Hafeez Contractor',
    role: 'Master Design & Architecture',
    image: '/about/master-hafeez.webp',
    className: "object-[50%_0%] origin-center translate-y-[5%] scale-130",
  },
  {
    name: 'Landscape Architects 49',
    role: 'Landscaping',
    image: '/about/master-predapond.webp',
    className: "object-[50%_0%] origin-top -translate-y-[5%] scale-135",
  },
  {
    name: 'August Design Consultant',
    role: 'Amenities',
    image: '/about/master-augustdesign.webp',
    className: "object-[10%_0%] origin-top -translate-y-[3%] scale-135",
  },
]

const MasterCard = ({ name, role, image, className = '' }) => (
  <article
    data-master-card
    className="card-shine invisible w-full bg-white border border-on-light-stroke overflow-hidden"
  >
    <div className="aspect-square w-full overflow-hidden">
      <img
        src={image}
        alt={name}
        loading="eager"
        decoding="async"
        className={`w-full h-full object-cover ${className}`}
      />
    </div>
    <div className="px-3 pt-4 pb-2 lg:px-2 lg:pt-3 lg:pb-1 xl:px-3 xl:pt-4 xl:pb-2 2xl:px-4 2xl:pt-5 2xl:pb-3 3xl:px-5 3xl:pt-6 3xl:pb-4 4xl:px-7 4xl:pt-8 4xl:pb-5 5xl:px-10 5xl:pt-12 5xl:pb-7 bg-pastel-brown-bg border-t border-on-light-stroke">
      <p className="font-medium text-[13px] lg:text-[11px] xl:text-[15px] 2xl:text-[18px] 3xl:text-[20px] 4xl:text-[28px] 5xl:text-[40px] tracking-[1.4px] lg:tracking-[1.2px] xl:tracking-[1.4px] 2xl:tracking-[1.6px] 3xl:tracking-[1.8px] 4xl:tracking-[2.2px] 5xl:tracking-[3px] uppercase text-center text-on-light-black mb-2 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3 4xl:mb-4 5xl:mb-6">
        {name}
      </p>
      <p className="text-[12.5px] lg:text-[10px] xl:text-[14px] 2xl:text-[17px] 3xl:text-[19px] 4xl:text-[26px] 5xl:text-[38px] text-on-light-grey text-center leading-[1.6]">
        {role}
      </p>
    </div>
  </article>
)

const DesignedByMasters = forwardRef((_props, ref) => {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)
  const isReadyRef = useRef(false)
  const queuedActionRef = useRef(null)

  useGSAP(
    (_context, contextSafe) => {
      const scope = sectionRef.current
      if (!scope) return

      const setup = contextSafe(() => {
        const headingEl = scope.querySelector('[data-dbm-heading]')
        const cursiveEl = scope.querySelector('[data-dbm-cursive]')
        const bodyEl = scope.querySelector('[data-dbm-body]')
        const buildingsEl = scope.querySelector('[data-dbm-buildings]')
        const cards = scope.querySelectorAll('[data-master-card]')

        const drawSel =
          'svg path, svg line, svg polyline, svg polygon, svg circle, svg ellipse, svg rect'

        const buildingPaths = buildingsEl ? buildingsEl.querySelectorAll(drawSel) : []

        gsap.set(headingEl, { autoAlpha: 0, y: 18 })
        gsap.set(cursiveEl, { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' })
        gsap.set(buildingsEl, { autoAlpha: 1 })
        gsap.set(buildingPaths, { drawSVG: 0 })
        gsap.set(bodyEl, { y: 18, autoAlpha: 0 })
        gsap.set(cards, {
          autoAlpha: 1,
          clipPath: 'inset(0 0 100% 0)',
          willChange: 'clip-path',
        })

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(cards, { willChange: 'auto' })
          },
        })

        tl.to(headingEl, { autoAlpha: 1, y: 0, duration: 0.6 }, 0)

        tl.to(
          cursiveEl,
          { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power1.inOut' },
          0.3,
        )
          .to(bodyEl, { y: 0, autoAlpha: 1, duration: 0.5 }, 0.45)
          .to(
            buildingPaths,
            {
              drawSVG: '0% 100%',
              stagger: 0.018,
              duration: 0.6,
              ease: 'power1.inOut',
            },
            0.5,
          )
          .to(
            cards,
            {
              clipPath: 'inset(0 0 0% 0)',
              stagger: 0.08,
              duration: 0.7,
              ease: 'power2.out',
            },
            0.85,
          )

        tlRef.current = tl
        isReadyRef.current = true

        const queued = queuedActionRef.current
        queuedActionRef.current = null
        if (queued === 'in') {
          gsap.set(scope, { autoAlpha: 1 })
          tl.timeScale(1).play(0)
        } else if (queued === 'out') {
          tl.timeScale(2.5).reverse()
        }
      })

      const cardImages = scope.querySelectorAll('[data-master-card] img')
      const decodes = Array.from(cardImages).map((img) => {
        if (img.complete && img.decode) return img.decode().catch(() => {})
        if (img.decode)
          return new Promise((res) => {
            img.addEventListener('load', () => img.decode().then(res, res), {
              once: true,
            })
            img.addEventListener('error', () => res(), { once: true })
          })
        return Promise.resolve()
      })

      Promise.all([aboutReveal(scope), ...decodes]).then(setup)
    },
    { scope: sectionRef },
  )

  useImperativeHandle(ref, () => ({
    prepare: () => {
      if (!isReadyRef.current || !tlRef.current) return
      gsap.set(sectionRef.current, { autoAlpha: 1 })
      tlRef.current.timeScale(1).pause(0)
    },
    playIn: () => {
      if (!isReadyRef.current || !tlRef.current) {
        queuedActionRef.current = 'in'
        return
      }
      gsap.set(sectionRef.current, { autoAlpha: 1 })
      tlRef.current.timeScale(1).play(0)
    },
    playOut: () => {
      if (!isReadyRef.current || !tlRef.current) {
        queuedActionRef.current = 'out'
        return
      }
      tlRef.current.timeScale(2.5).reverse()
      gsap.to(sectionRef.current, { autoAlpha: 0, duration: 0.4, ease: 'power2.out' })
    },
  }))

  return (
    <section
      ref={sectionRef}
      className="bg-pastel-brown-bg w-full h-full px-6 lg:px-[10%] xl:px-[10%] 2xl:px-[10%] 3xl:px-[10%] 4xl:px-[10%] 5xl:px-[10%]"
    >
      <div className="max-w-[1180px] lg:max-w-none xl:max-w-none 2xl:max-w-none 3xl:max-w-none 4xl:max-w-none 5xl:max-w-none mx-auto">
        <div className="grid grid-cols-12 gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 3xl:gap-14 4xl:gap-18 5xl:gap-24 items-end mb-14 lg:mb-16 xl:mb-20 2xl:mb-24 3xl:mb-28 4xl:mb-36 5xl:mb-52">
          <div className="col-span-12 lg:col-span-7">
            <h2
              data-dbm-heading
              className="invisible font-normal text-[36px] lg:text-[34px] xl:text-[42px] 2xl:text-[47.7px] 3xl:text-[58.5px] 4xl:text-[77px] 5xl:text-[108px] leading-[1.16] -tracking-[0.5px] text-on-light-black"
            >
              Designed By Masters
            </h2>
            <InlineSVG
              src="/about/inspired-by-life.svg"
              aria-label="inspired by life"
              data-dbm-cursive
              className="invisible mt-3 h-6.5 lg:h-5.5 xl:h-8 2xl:h-9 3xl:h-11 4xl:h-15 5xl:h-22 w-auto"
            />
            <p
              data-dbm-body
              className="text-on-light-black/85 text-[13px] lg:text-[12px] xl:text-[15px] 2xl:text-[17px] 3xl:text-[21px] 4xl:text-[28px] 5xl:text-[39px] leading-[1.85] mt-7 lg:mt-5 xl:mt-7 2xl:mt-8 3xl:mt-9 4xl:mt-12 5xl:mt-16 max-w-[600px] lg:max-w-[580px] xl:max-w-[630px] 3xl:max-w-[800px] 4xl:max-w-[1060px] 5xl:max-w-[1480px]"
            >
              Crafted with vision by three acclaimed design houses, including
              the legendary Architect Hafeez Contractor, Rivali Park 2 is a
              celebration of intentionally designed spaces, landscapes, and
              life-enhancing amenities.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-5 flex lg:justify-end">
            <InlineSVG
              src="/about/designed-clouds-buildings.svg"
              aria-hidden="true"
              data-dbm-buildings
              className="invisible block w-full max-w-105 lg:max-w-[260px] xl:max-w-[400px] 2xl:max-w-[480px] 3xl:max-w-[580px] 4xl:max-w-[800px] 5xl:max-w-[1180px] h-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 xl:gap-6 2xl:gap-8 3xl:gap-10 4xl:gap-12 5xl:gap-18">
          {masters.map((m) => (
            <MasterCard key={m.name} {...m} />
          ))}
        </div>
      </div>
    </section>
  )
})

DesignedByMasters.displayName = 'DesignedByMasters'

export default DesignedByMasters
