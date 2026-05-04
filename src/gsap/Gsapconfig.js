import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, useGSAP)

export { gsap, ScrollTrigger, ScrollToPlugin, SplitText, useGSAP }

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.__gsap = gsap
  window.__ST = ScrollTrigger
}
