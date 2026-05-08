import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, DrawSVGPlugin, useGSAP)

export { gsap, ScrollTrigger, ScrollToPlugin, SplitText, DrawSVGPlugin, useGSAP }

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.__gsap = gsap
  window.__ST = ScrollTrigger
}
