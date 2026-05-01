import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin)

gsap.defaults({ ease: 'power3.out' })

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin }

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
