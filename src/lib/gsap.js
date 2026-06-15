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
