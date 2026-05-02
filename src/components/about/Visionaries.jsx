import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, aboutReveal } from '../../lib/gsap'
import InlineSVG from './InlineSVG'

const visionaries = [
  { name: 'Rohan Khatau', role: 'Director', image: '/about/visionary-rohan.webp', className:"object-[100%_0%]" },
  { name: 'Shijil Meledath', role: 'Chief Operating Officer', image: '/about/visionary-shijil.webp', className:"object-[100%_0%]" },
  { name: 'Raunaq Rathi', role: 'VP, Strategy and Business', image: '/about/visionary-raunaq.webp', className:"object-[100%_0%]" },
  { name: 'Vatsal Vazir', role: 'Head of Design', image: '/about/visionary-vatsal.webp', className:"object-[100%_0%]" },
  { name: 'Harshil Shah', role: 'Head of Customer Experience', image: '/about/visionary-harshil.webp', className:"object-[100%_0%]" },
]

const VisionaryCard = ({ name, role, image, className = '' }) => (
  <article
    data-visionary-card
    className="invisible w-full bg-pastel-brown-bg border border-on-light-stroke pb-3 lg:pb-2 xl:pb-3 2xl:pb-4 3xl:pb-5 4xl:pb-7 5xl:pb-10 overflow-hidden"
  >
    <div className="aspect-square w-full overflow-hidden">
      <img
        src={image}
        alt={name}
        loading="eager"
        decoding="async"
        className={`w-full h-full object-cover ${className} scale-115 `}
      />
    </div>
    <div className="px-3 pt-4 pb-2 lg:px-2 lg:pt-3 lg:pb-1 xl:px-3 xl:pt-4 xl:pb-2 2xl:px-4 2xl:pt-5 2xl:pb-3 3xl:px-5 3xl:pt-6 3xl:pb-4 4xl:px-7 4xl:pt-8 4xl:pb-5 5xl:px-10 5xl:pt-12 5xl:pb-7">
      <p className="font-medium text-[13px] lg:text-[11px] xl:text-[15px] 2xl:text-[18px] 3xl:text-[20px] 4xl:text-[28px] 5xl:text-[40px] tracking-[1.4px] lg:tracking-[1.2px] xl:tracking-[1.4px] 2xl:tracking-[1.6px] 3xl:tracking-[1.8px] 4xl:tracking-[2.2px] 5xl:tracking-[3px] uppercase text-center text-on-light-black mb-2 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3 4xl:mb-4 5xl:mb-6">
        {name}
      </p>
      <p className="text-[12.5px] lg:text-[10px] xl:text-[14px] 2xl:text-[17px] 3xl:text-[19px] 4xl:text-[26px] 5xl:text-[38px] text-on-light-grey text-center leading-[1.6]">
        {role}
      </p>
    </div>
  </article>
)

const Visionaries = () => {
  const sectionRef = useRef(null)

  useGSAP(
    (_context, contextSafe) => {
      const scope = sectionRef.current
      if (!scope) return

      const setup = contextSafe(() => {
        const headingEl = scope.querySelector('[data-visionaries-heading]')
        const cursiveEl = scope.querySelector('[data-visionaries-cursive]')
        const cards = scope.querySelectorAll('[data-visionary-card]')

        const headingSplit = headingEl
          ? SplitText.create(headingEl, {
              type: 'words',
              wordsClass: 'inline-block will-change-transform',
            })
          : null

        gsap.set(headingEl, { autoAlpha: 1 })
        if (headingSplit) {
          gsap.set(headingSplit.words, { yPercent: 110, autoAlpha: 0 })
        }
        gsap.set(cursiveEl, { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' })
        gsap.set(cards, {
          y: 28,
          autoAlpha: 0,
          willChange: 'transform, opacity',
        })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scope,
            start: 'top 25%',
            once: true,
          },
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(cards, { willChange: 'auto' })
          },
        })

        if (headingSplit) {
          tl.to(
            headingSplit.words,
            { yPercent: 0, autoAlpha: 1, stagger: 0.04, duration: 0.55 },
            0,
          )
        }

        tl.to(
          cursiveEl,
          { clipPath: 'inset(0 0% 0 0)', duration: 1.0, ease: 'power1.inOut' },
          0.35,
        ).to(
          cards,
          { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.55 },
          0.5,
        )
      })

      const cardImages = scope.querySelectorAll('[data-visionary-card] img')
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

  return (
    <section
      ref={sectionRef}
      className="bg-white pt-20 lg:pt-16 xl:pt-20 2xl:pt-24 3xl:pt-28 4xl:pt-36 5xl:pt-52 pb-20 lg:pb-16 xl:pb-20 2xl:pb-24 3xl:pb-28 4xl:pb-36 5xl:pb-52 px-6 lg:px-[18%] xl:px-[18%] 2xl:px-[18%] 3xl:px-[18%] 4xl:px-[18%] 5xl:px-[18%]"
    >
      <div className="text-center mb-14 lg:mb-10 xl:mb-14 2xl:mb-16 3xl:mb-20 4xl:mb-28 5xl:mb-44">
        <h2
          data-visionaries-heading
          className="invisible font-normal text-[40px] lg:text-[36px] xl:text-[50px] 2xl:text-[62px] 3xl:text-[78px] 4xl:text-[108px] 5xl:text-[156px] leading-[1.2] -tracking-[1px] text-on-light-black"
        >
          The visionaries
        </h2>
        <InlineSVG
          src="/about/led-by-legacy.svg"
          aria-label="led by legacy, fuelled by foresight"
          data-visionaries-cursive
          className="invisible mt-3 mx-auto h-auto w-[35rem] lg:w-[22rem] xl:w-[30rem] 2xl:w-[37rem] 3xl:w-[44rem] 4xl:w-[60rem] 5xl:w-[90rem]"
        />
      </div>

      <div className="max-w-[820px] lg:max-w-none xl:max-w-none 2xl:max-w-none 3xl:max-w-none 4xl:max-w-none 5xl:max-w-none mx-auto grid grid-cols-12 gap-5 lg:gap-4 xl:gap-5 2xl:gap-6 3xl:gap-7 4xl:gap-9 5xl:gap-13">
        <div className="col-span-4">
          <VisionaryCard {...visionaries[0]} />
        </div>
        <div className="col-span-4">
          <VisionaryCard {...visionaries[1]} />
        </div>
        <div className="col-span-4">
          <VisionaryCard {...visionaries[2]} />
        </div>
        <div className="col-span-4 col-start-3">
          <VisionaryCard {...visionaries[3]} />
        </div>
        <div className="col-span-4 col-start-7">
          <VisionaryCard {...visionaries[4]} />
        </div>
      </div>
    </section>
  )
}

export default Visionaries
