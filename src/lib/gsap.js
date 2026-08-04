import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase)

// Shared "hop" ease used by the gallery hotspot slide transition (mirrors
// the StorySlider curve). Created once at module load so every page that
// imports `gsap` from this file can reference it by name.
CustomEase.create(
  'hop',
  'M0,0 C0.083,0.294 0.117,0.767 0.413,0.908 0.606,1 0.752,1 1,1 ',
)

gsap.defaults({ ease: 'power3.out' })

// Global motion pacing. 0.7 = every GSAP tween/timeline in the app plays at 70%
// speed (30% slower, so durations run ~1.43x longer) — one knob instead of
// re-timing every page, and it keeps each choreography's internal offsets and
// staggers in proportion. `gsap` is a module singleton, so setting it here also
// covers the towers/loaders code that imports from src/gsap/Gsapconfig.js.
//
// Anything paced by a real-time timer rather than by GSAP has to be divided by
// this to stay in step — see MIN_DISPLAY_MS in useLoaderReady/useTowersAssetsReady,
// which would otherwise lift the loaders mid-draw.
export const MOTION_SCALE = 0.7

gsap.globalTimeline.timeScale(MOTION_SCALE)

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase }

export const fontsReady = () => {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve()
  return document.fonts.ready
}

export const inlineSvgsReady = (scope) => {
  if (!scope) return Promise.resolve()
  return new Promise((resolve) => {
    const start = performance.now()
    const check = () => {
      const pending = scope.querySelectorAll(
        '[data-inline-svg]:not([data-inline-svg-loaded="true"])',
      )
      if (pending.length === 0 || performance.now() - start > 4000) {
        resolve()
      } else {
        requestAnimationFrame(check)
      }
    }
    check()
  })
}

export const aboutReveal = (scope) =>
  Promise.all([fontsReady(), inlineSvgsReady(scope)])
