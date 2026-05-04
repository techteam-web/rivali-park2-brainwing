import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, aboutReveal } from '../../lib/gsap'
import InlineSVG from './InlineSVG'

const Hero = forwardRef((_props, ref) => {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)
  const isReadyRef = useRef(false)
  const queuedActionRef = useRef(null)

  useGSAP(
    (_context, contextSafe) => {
      const scope = sectionRef.current
      if (!scope) return

      const setup = contextSafe(() => {
        const headingEl = scope.querySelector('[data-hero-heading]')
        const cursiveEl = scope.querySelector('[data-hero-cursive]')
        const bodyParas = scope.querySelectorAll('[data-hero-body] p')
        const heroImg = scope.querySelector('[data-hero-image]')
        const cloudEl = scope.querySelector('[data-hero-cloud-tree]')
        const craneEl = scope.querySelector('[data-hero-crane]')

        const drawSel =
          'svg path, svg line, svg polyline, svg polygon, svg circle, svg ellipse, svg rect'

        const cloudPaths = cloudEl ? cloudEl.querySelectorAll(drawSel) : []
        const cranePathsRaw = craneEl ? craneEl.querySelectorAll(drawSel) : []
        const cranePaths = Array.from(cranePathsRaw).sort((a, b) => {
          try {
            return a.getBBox().x - b.getBBox().x
          } catch {
            return 0
          }
        })

        gsap.set(headingEl, { autoAlpha: 0, y: 18 })
        gsap.set(cursiveEl, { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' })
        gsap.set(cloudEl, { autoAlpha: 1 })
        gsap.set(cloudPaths, { drawSVG: 0 })
        gsap.set(craneEl, { autoAlpha: 1 })
        gsap.set(cranePaths, { drawSVG: 0, fillOpacity: 0 })
        gsap.set(bodyParas, { y: 18, autoAlpha: 0 })
        gsap.set(heroImg, { autoAlpha: 1, clipPath: 'inset(0 100% 100% 0)' })

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: 'power3.out' },
        })

        tl.to(heroImg, { clipPath: 'inset(0 0% 0% 0)', duration: 1.0, ease: 'power2.out' }, 0)

        tl.to(headingEl, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.05)

        tl.to(
          cursiveEl,
          { clipPath: 'inset(0 0% 0 0)', duration: 1.0, ease: 'power1.inOut' },
          0.45,
        )
          .to(bodyParas, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.45 }, 0.55)
          .to(
            cloudPaths,
            { drawSVG: '0% 100%', stagger: 0.025, duration: 0.55, ease: 'power1.inOut' },
            0.7,
          )
          .to(
            cranePaths,
            {
              drawSVG: '0% 100%',
              fillOpacity: 1,
              stagger: 0.012,
              duration: 0.55,
              ease: 'power1.inOut',
            },
            0.95,
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

      aboutReveal(scope).then(setup)
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
    <section ref={sectionRef} className="bg-white w-full h-full">
      <div className="max-w-[1177px] lg:max-w-none xl:max-w-none 2xl:max-w-none 3xl:max-w-none 4xl:max-w-none 5xl:max-w-none mx-auto px-8 lg:px-[6%] xl:px-[6%] 2xl:px-[6%] 3xl:px-[6%] 4xl:px-[6%] 5xl:px-[6%]">
        <div className="grid grid-cols-12 gap-6 lg:gap-10 xl:gap-10 2xl:gap-12 3xl:gap-16 4xl:gap-20 5xl:gap-28 items-stretch">
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-between">
            <div>
              <h2
                data-hero-heading
                className="invisible font-normal text-[40px] lg:text-[34px] xl:text-[46px] 2xl:text-[54px] 3xl:text-[67px] 4xl:text-[92px] 5xl:text-[138px] leading-[1.16] -tracking-[0.5px] text-on-light-black"
              >
                A Quiet Evolution
              </h2>
              <InlineSVG
                src="/about/powering-india.svg"
                aria-label="powering India to building homes"
                data-hero-cursive
                className="invisible mt-3 lg:mt-1 xl:mt-2 3xl:mt-3 4xl:mt-4 5xl:mt-6 h-[28px] lg:h-[32px] xl:h-[40px] 2xl:h-[44px] 3xl:h-[55px] 4xl:h-[71px] 5xl:h-[120px] w-auto lg:w-[20rem] xl:w-[27.5rem] 2xl:w-[32rem] 3xl:w-[40.5rem] 4xl:w-[56rem] 5xl:w-[83rem]"
              />
              <div
                data-hero-body
                className="mt-10 lg:mt-5 xl:mt-6 2xl:mt-7 3xl:mt-9 4xl:mt-12 5xl:mt-16 space-y-5 lg:space-y-3 xl:space-y-4 2xl:space-y-5 3xl:space-y-6 4xl:space-y-7 5xl:space-y-10 text-on-light-black/85 text-[13px] lg:text-[11.5px] xl:text-[16px] 2xl:text-[19px] 3xl:text-[23px] 4xl:text-[31px] 5xl:text-[48px] leading-[1.85] max-w-[500px] 2xl:max-w-[600px] 3xl:max-w-[700px] 4xl:max-w-[1260px] 5xl:max-w-[1480px]"
              >
                <p>
                  Owned by the Khataus, with decades of experience in
                  infrastructure across India (Cable Corporation of India).
                </p>
                <p className="max-w-[400px] lg:max-w-[280px] xl:max-w-[440px] 2xl:max-w-[500px] 3xl:max-w-[560px] 4xl:max-w-[880px] 5xl:max-w-[1320px]">
                  Corporate turned developer with long-standing credibility and
                  process oriented.
                </p>
              </div>
            </div>
            <InlineSVG
              src="/about/crane-about-hero.svg"
              aria-hidden="true"
              data-hero-crane
              className="invisible mt-12 lg:mt-8 xl:mt-10 2xl:mt-12 3xl:mt-16 4xl:mt-20 5xl:mt-28 w-[400px] lg:w-[260px] xl:w-[350px] 2xl:w-[430px] 3xl:w-[520px] 4xl:w-[720px] 5xl:w-[1080px] max-w-full h-auto"
            />
          </div>

          <div className="col-span-12 lg:col-span-7 lg:flex lg:justify-end">
            <div
              data-hero-image
              className="relative w-full lg:w-[400px] xl:w-[560px] 2xl:w-[700px] 3xl:w-[860px] 4xl:w-[1140px] 5xl:w-[1700px] aspect-[611/404] overflow-hidden self-start"
            >
              <img
                src="/about/hero-industrial.webp"
                alt="CCI heritage industrial scene"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <InlineSVG
                src="/about/about-hero-cloud-tree.svg"
                aria-hidden="true"
                data-hero-cloud-tree
                className="invisible absolute inset-x-0 top-[7%] w-[91.5%] h-auto pointer-events-none select-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

Hero.displayName = 'Hero'

export default Hero
