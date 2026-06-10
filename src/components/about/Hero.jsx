import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, aboutReveal } from '../../lib/gsap'
import InlineSVG from './InlineSVG'

const Hero = forwardRef((_props, ref) => {
  const sectionRef = useRef(null)
  const tlRef = useRef(null)
  const isReadyRef = useRef(false)
  const queuedActionRef = useRef(null)
  const buildAndPlayRef = useRef(null)

  useGSAP(
    () => {
      const scope = sectionRef.current
      if (!scope) return

      const drawSel =
        'svg path, svg line, svg polyline, svg polygon, svg circle, svg ellipse, svg rect'

      // Snap every animated element to its pre-intro hidden state. Queries run
      // fresh each call so this works both before the InlineSVGs have loaded
      // (their paths simply aren't found yet) and after. Crucially this is
      // also called SYNCHRONOUSLY below: useGSAP runs in a layout effect, so
      // it lands before the browser's first paint. Previously the only
      // hide-step lived inside buildAndPlay, which is gated behind
      // aboutReveal() (fonts + async InlineSVG fetches) and therefore ran
      // several frames AFTER first paint — so any element not already hidden
      // by its `invisible` class (the body copy, the hero image) flashed at
      // its final position, then snapped away and re-animated. The cursive
      // SVG, injected late by its fetch, showed the same jump.
      const applyInitialState = () => {
        const s = sectionRef.current
        if (!s) return

        const headingEl = s.querySelector('[data-hero-heading]')
        const cursiveEl = s.querySelector('[data-hero-cursive]')
        const bodyParas = s.querySelectorAll('[data-hero-body] p')
        const heroImg = s.querySelector('[data-hero-image]')
        const cloudEl = s.querySelector('[data-hero-cloud-tree]')
        const craneEl = s.querySelector('[data-hero-crane]')
        const cloudPaths = cloudEl ? cloudEl.querySelectorAll(drawSel) : []
        const cranePaths = craneEl ? craneEl.querySelectorAll(drawSel) : []

        gsap.killTweensOf(s)
        gsap.set(s, { autoAlpha: 1 })
        gsap.set(headingEl, { autoAlpha: 0, y: 18 })
        gsap.set(cursiveEl, { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' })
        gsap.set(cloudEl, { autoAlpha: 1 })
        gsap.set(cloudPaths, { drawSVG: 0 })
        // craneEl starts hidden via autoAlpha (not just drawSVG: 0 on the
        // inner paths). 18 of the crane's paths are filled (fill="#7A4833"),
        // so drawSVG alone wouldn't hide them — fillOpacity: 0 is needed too,
        // and that pair doesn't reset cleanly on re-entry after the timeline
        // has already played once. The crane is also the only Hero element
        // with no clipped ancestor and no autoAlpha gate, so any leak shows.
        // Treating the container like headingEl (autoAlpha 0 → 1) is the
        // robust fix: even if inner-path resets misfire, the container hides
        // them. See peers: heroImg/cursive use clipPath, heading/body use
        // autoAlpha; cloud is inside heroImg's clipPath so it's covered.
        gsap.set(craneEl, { autoAlpha: 0 })
        gsap.set(cranePaths, { drawSVG: 0, fillOpacity: 0 })
        gsap.set(bodyParas, { y: 18, autoAlpha: 0 })
        gsap.set(heroImg, { autoAlpha: 1, clipPath: 'inset(0 100% 100% 0)' })
      }

      // Rebuild the entire timeline from scratch every time we want to play.
      // This is the only reliable way to avoid stale tween state, leftover
      // reversed flags, plugin caches (drawSVG/clipPath), or DOM nodes that
      // may have been replaced when InlineSVG re-renders. Each call freshly
      // re-queries the DOM, re-applies the initial state, and creates a new
      // GSAP timeline that plays forward from 0.
      const buildAndPlay = () => {
        if (!sectionRef.current) return
        const s = sectionRef.current

        // Tear down anything previously hooked up so we start clean.
        if (tlRef.current) {
          tlRef.current.kill()
          tlRef.current = null
        }

        const headingEl = s.querySelector('[data-hero-heading]')
        const cursiveEl = s.querySelector('[data-hero-cursive]')
        const bodyParas = s.querySelectorAll('[data-hero-body] p')
        const heroImg = s.querySelector('[data-hero-image]')
        const cloudEl = s.querySelector('[data-hero-cloud-tree]')
        const craneEl = s.querySelector('[data-hero-crane]')

        const cloudPaths = cloudEl ? cloudEl.querySelectorAll(drawSel) : []
        const cranePathsRaw = craneEl ? craneEl.querySelectorAll(drawSel) : []
        const cranePaths = Array.from(cranePathsRaw).sort((a, b) => {
          try {
            return a.getBBox().x - b.getBBox().x
          } catch {
            return 0
          }
        })

        applyInitialState()

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
        })

        // fromTo for DrawSVG paths is intentional: the gsap.set lines above
        // can fail to reset drawSVG/fillOpacity on re-entry (a known
        // DrawSVGPlugin caching quirk noted in the comment near the crane
        // gsap.set). Without fromTo, the tween records whatever stale value
        // the plugin holds — typically '0% 100%' from the previous intro —
        // and animates 100→100 (no visible draw). fromTo forces the from-state
        // at tween fire time, guaranteeing every re-entry animates fresh.
        tl.to(heroImg, { clipPath: 'inset(0 0% 0% 0)', duration: 1.4, ease: 'power2.out' }, 0)
          .to(headingEl, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.05)
          .to(
            cursiveEl,
            { clipPath: 'inset(0 0% 0 0)', duration: 1.0, ease: 'power1.inOut' },
            0.45,
          )
          .to(bodyParas, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.45 }, 0.55)
          .fromTo(
            cloudPaths,
            { drawSVG: 0 },
            { drawSVG: '0% 100%', stagger: 0.025, duration: 0.55, ease: 'power1.inOut' },
            0.7,
          )
          .fromTo(
            craneEl,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.25, ease: 'power2.out' },
            0.95,
          )
          .fromTo(
            cranePaths,
            { drawSVG: 0, fillOpacity: 0 },
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
      }

      buildAndPlayRef.current = buildAndPlay

      // Hide everything BEFORE the first paint (this runs in a layout effect).
      // The intro itself still waits for aboutReveal() below, but by then the
      // section is already staged hidden, so nothing flashes in the meantime.
      applyInitialState()

      aboutReveal(scope).then(() => {
        isReadyRef.current = true
        if (queuedActionRef.current === 'in') {
          queuedActionRef.current = null
          buildAndPlay()
        } else {
          queuedActionRef.current = null
        }
      })
    },
    { scope: sectionRef },
  )

  useImperativeHandle(ref, () => ({
    // prepare puts Hero in a "ready to animate" visual state: section visible,
    // all child elements snapped to their initial pre-animation values. We do
    // this by killing the previous timeline and re-running the gsap.set lines
    // (reusing buildAndPlay would also play; we pause(0) immediately after).
    prepare: () => {
      if (!isReadyRef.current || !buildAndPlayRef.current) return
      buildAndPlayRef.current()
      if (tlRef.current) tlRef.current.pause(0)
    },
    playIn: () => {
      if (!isReadyRef.current || !buildAndPlayRef.current) {
        queuedActionRef.current = 'in'
        return
      }
      buildAndPlayRef.current()
      // tl is freshly created and not paused → plays forward from 0.
    },
    // stop freezes the in-flight intro timeline at its current position.
    // Called by the controller at the start of an exit so the slide's intro
    // tweens don't keep updating elements while exit choreography runs and
    // crossfade hides the slide. Pausing (rather than killing) preserves the
    // tween references so pause(0) on the next visit can rewind cleanly.
    stop: () => {
      if (tlRef.current) tlRef.current.pause()
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
                data-fade-out="text"
                className="invisible font-normal text-[40px] lg:text-[34px] xl:text-[46px] 2xl:text-[54px] 3xl:text-[67px] 4xl:text-[92px] 5xl:text-[138px] leading-[1.16] -tracking-[0.5px] text-on-light-black"
              >
                A Quiet Evolution
              </h2>
              <InlineSVG
                src="/about/powering-india.svg"
                aria-label="powering India to building homes"
                data-hero-cursive
                data-fade-out="decor"
                data-clip-reverse
                className="invisible mt-3 lg:mt-1 xl:mt-2 3xl:mt-3 4xl:mt-4 5xl:mt-6 h-[28px] lg:h-[32px] xl:h-[40px] 2xl:h-[44px] 3xl:h-[55px] 4xl:h-[71px] 5xl:h-[120px] w-auto lg:w-[20rem] xl:w-[27.5rem] 2xl:w-[32rem] 3xl:w-[40.5rem] 4xl:w-[56rem] 5xl:w-[83rem]"
              />
              <div
                data-hero-body
                data-fade-out="text"
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
              src="/about/pen.svg"
              aria-hidden="true"
              data-hero-crane
              data-fade-out="decor"
              data-undraw
              className="invisible mt-12 lg:mt-8 xl:mt-10 2xl:mt-12 3xl:mt-16 4xl:mt-20 5xl:mt-28 w-[400px] lg:w-[260px] xl:w-[350px] 2xl:w-[430px] 3xl:w-[520px] 4xl:w-[720px] 5xl:w-[1080px] max-w-full h-auto"
            />
          </div>

          <div className="col-span-12 lg:col-span-7 lg:flex lg:justify-end">
            <div
              data-hero-image
              data-fade-out="image"
              className="invisible relative w-full lg:w-[400px] xl:w-[560px] 2xl:w-[700px] 3xl:w-[860px] 4xl:w-[1140px] 5xl:w-[1700px] aspect-[611/404] overflow-hidden self-start"
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
                data-undraw
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
