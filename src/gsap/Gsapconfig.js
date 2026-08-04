import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, DrawSVGPlugin, useGSAP)

// Playback speed is NOT set here. `gsap` is a module singleton, so the global
// timeScale applied in src/lib/gsap.js (MOTION_SCALE) already governs every tween
// started through this module too. Kept in one place so the two configs can't drift.

export { gsap, ScrollTrigger, ScrollToPlugin, SplitText, DrawSVGPlugin, useGSAP }

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.__gsap = gsap
  window.__ST = ScrollTrigger
}
