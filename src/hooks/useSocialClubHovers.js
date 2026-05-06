import { useEffect } from 'react'
import { gsap, inlineSvgsReady } from '../lib/gsap'

// Per-card hover behaviors for the Social Club page.
// Each setup attaches mouseenter/leave to the inner <svg> element only,
// so hovering on the pill label does not trigger animations.
// All loops are infinite while hovered; on leave, we kill the loop
// and tween the targeted elements back to their identity transform
// (and dasharray for any drawn paths) before stopping.

const HOVER_ATTR = 'data-hover-anim'

const markHoverTargets = (els) => {
  els.forEach((el) => el && el.setAttribute(HOVER_ATTR, ''))
}

// Common helper: register listeners + return a cleanup that removes
// them and kills tweens on the targeted elements.
const bind = (svgEl, targets, { enter, leave }) => {
  const onEnter = () => enter()
  const onLeave = () => leave()
  svgEl.addEventListener('mouseenter', onEnter)
  svgEl.addEventListener('mouseleave', onLeave)
  return () => {
    svgEl.removeEventListener('mouseenter', onEnter)
    svgEl.removeEventListener('mouseleave', onLeave)
    if (targets && targets.length) gsap.killTweensOf(targets)
  }
}

// Steam paths drift up + sway, out of phase. On leave, ease back to (0, 0).
const setupCafeteria = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 5) return null
  const steam = paths.slice(-3)
  markHoverTargets(steam)

  let yTw, xTw
  const enter = () => {
    if (yTw) yTw.kill()
    if (xTw) xTw.kill()
    yTw = gsap.to(steam, {
      y: -2.2,
      duration: 0.55,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      overwrite: 'auto',
    })
    xTw = gsap.to(steam, {
      x: '+=1.6',
      duration: 0.7,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      overwrite: 'auto',
      stagger: { each: 0.2, repeat: -1, yoyo: true },
    })
  }
  const leave = () => {
    if (yTw) {
      yTw.kill()
      yTw = null
    }
    if (xTw) {
      xTw.kill()
      xTw = null
    }
    gsap.to(steam, {
      x: 0,
      y: 0,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }
  return bind(svgEl, steam, { enter, leave })
}

// 4 windows = 16 stroked paths starting at index 5. Re-draw cycle:
// undraw 0->fully then redraw, infinite.
const setupLibrary = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 21) return null
  const windows = paths.slice(5, 21)
  markHoverTargets(windows)

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1, defaults: { overwrite: 'auto' } })
    tl.to(windows, {
      drawSVG: 0,
      duration: 0.5,
      ease: 'power2.in',
      stagger: 0.02,
    }).to(windows, {
      drawSVG: '0% 100%',
      duration: 0.65,
      ease: 'power2.out',
      stagger: 0.02,
    })
  }
  const leave = () => {
    if (tl) {
      tl.kill()
      tl = null
    }
    gsap.to(windows, {
      drawSVG: '0% 100%',
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }
  return bind(svgEl, windows, { enter, leave })
}

// Cartoonish wobble: slight bounce + tilt around the shape's center.
const setupScreeningRoom = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 2) return null
  const person = paths[1]
  markHoverTargets([person])
  gsap.set(person, { transformOrigin: '50% 50%', transformBox: 'fill-box' })

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(person, {
      y: -1.6,
      rotation: 6,
      duration: 0.42,
      ease: 'sine.inOut',
    }).to(person, {
      y: 0,
      rotation: -6,
      duration: 0.42,
      ease: 'sine.inOut',
    })
  }
  const leave = () => {
    if (tl) {
      tl.kill()
      tl = null
    }
    gsap.killTweensOf(person)
    gsap.to(person, {
      y: 0,
      rotation: 0,
      duration: 0.4,
      ease: 'power2.out',
    })
  }
  return bind(svgEl, [person], { enter, leave })
}

// Roll the entire icon (excluding the bg circle) left↔right with a bounce.
// All targeted paths rotate around the SVG's geometric center so they
// move as one rolling object instead of each spinning independently.
const setupKidsClub = (svgEl) => {
  const allChildren = Array.from(svgEl.children)
  // Skip the outer background circle (always the first <circle> child).
  const targets = allChildren.filter(
    (c) => !(c.tagName.toLowerCase() === 'circle' && c.getAttribute('r') === '35.4'),
  )
  if (!targets.length) return null
  // Shared origin = SVG viewBox center (36, 36 for a 72×72 viewBox).
  targets.forEach((t) =>
    gsap.set(t, { transformOrigin: '36px 36px', svgOrigin: '36 36' }),
  )
  markHoverTargets(targets)

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(targets, {
      x: 3,
      rotation: 14,
      y: -1.4,
      duration: 0.45,
      ease: 'power1.inOut',
    }).to(targets, {
      y: 0,
      duration: 0.22,
      ease: 'power2.out',
    })
  }
  const leave = () => {
    if (tl) {
      tl.kill()
      tl = null
    }
    gsap.killTweensOf(targets)
    gsap.to(targets, {
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.45,
      ease: 'power2.out',
    })
  }
  return bind(svgEl, targets, { enter, leave })
}

// Balls drift around the table; cue moves along its own axis (front/back).
const setupBilliard = (svgEl) => {
  const balls = Array.from(svgEl.querySelectorAll('g circle'))
  // Cue line: long path going diagonally (M34.5 36.8 ... goes down-left).
  const paths = Array.from(svgEl.querySelectorAll('g path'))
  // Try to find the cue: the one whose pathLength is largest among paths
  // in the lower half. Fallback: use index 5 (sixth path inside <g>).
  const cue = paths[5] || null
  const targets = [...balls, cue].filter(Boolean)
  markHoverTargets(targets)

  if (cue) {
    gsap.set(cue, { transformOrigin: '50% 50%', transformBox: 'fill-box' })
  }
  balls.forEach((b) => gsap.set(b, { transformOrigin: '50% 50%', transformBox: 'fill-box' }))

  // Each ball gets a small random orbit; cue oscillates along its axis.
  // The cue path runs from upper-right to lower-left (~135deg).
  const ballOffsets = balls.map((_, i) => {
    const angle = (i / balls.length) * Math.PI * 2
    return {
      x: Math.cos(angle) * 1.6,
      y: Math.sin(angle) * 1.6,
    }
  })

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1, yoyo: true })
    balls.forEach((b, i) => {
      tl.to(
        b,
        {
          x: ballOffsets[i].x,
          y: ballOffsets[i].y,
          duration: 0.6,
          ease: 'sine.inOut',
        },
        0,
      )
    })
    if (cue) {
      // Cue runs along NE→SW. Push direction = toward NE (up-right).
      tl.to(
        cue,
        { x: 2.2, y: -2.2, duration: 0.6, ease: 'sine.inOut' },
        0,
      )
    }
  }
  const leave = () => {
    if (tl) {
      tl.kill()
      tl = null
    }
    gsap.killTweensOf(targets)
    gsap.to(targets, {
      x: 0,
      y: 0,
      duration: 0.45,
      ease: 'power2.out',
    })
  }
  return bind(svgEl, targets, { enter, leave })
}

// 2 cards open out then close. Targets the two stroked card paths inside <g>.
const setupCardRoom = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('g path'))
  if (paths.length < 2) return null
  // path[0] = filled card body, path[1] = inner card outline, path[2] = pip
  const left = paths[0]
  const right = paths[1]
  const detail = paths[2] || null
  const targets = [left, right, detail].filter(Boolean)
  targets.forEach((t) => gsap.set(t, { transformOrigin: '50% 50%', transformBox: 'fill-box' }))
  markHoverTargets(targets)

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(left, { x: -2.8, rotation: -6, duration: 0.55, ease: 'power2.inOut' }, 0)
    tl.to(right, { x: 2.8, rotation: 6, duration: 0.55, ease: 'power2.inOut' }, 0)
    if (detail) tl.to(detail, { y: -1.2, duration: 0.55, ease: 'power2.inOut' }, 0)
  }
  const leave = () => {
    if (tl) {
      tl.kill()
      tl = null
    }
    gsap.killTweensOf(targets)
    gsap.to(targets, {
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.45,
      ease: 'power2.out',
    })
  }
  return bind(svgEl, targets, { enter, leave })
}

// Camera button drops down; lens glare orbits around the lens center.
const setupSocialMediaStudio = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 5) return null
  const button = paths[2]
  const glare = paths[4]
  const targets = [button, glare]
  markHoverTargets(targets)

  // Lens center (in viewBox coords) ~ (38.3, 37.0). Rotate glare around it.
  // svgOrigin sets the origin in SVG user coordinates without relying on
  // transform-box (which has spotty cross-browser support for paths).
  gsap.set(glare, { svgOrigin: '38.3 37' })
  gsap.set(button, { transformOrigin: '50% 50%', transformBox: 'fill-box' })

  let buttonTl
  let glareTw
  const enter = () => {
    if (buttonTl) buttonTl.kill()
    if (glareTw) glareTw.kill()
    buttonTl = gsap.timeline({ repeat: -1, yoyo: true })
    buttonTl.to(button, { y: 1.6, duration: 0.6, ease: 'power2.inOut' })
    glareTw = gsap.to(glare, {
      rotation: 360,
      duration: 2.2,
      ease: 'none',
      repeat: -1,
    })
  }
  const leave = () => {
    if (buttonTl) {
      buttonTl.kill()
      buttonTl = null
    }
    if (glareTw) {
      glareTw.kill()
      glareTw = null
    }
    gsap.killTweensOf(targets)
    gsap.to(button, { y: 0, duration: 0.35, ease: 'power2.out' })
    gsap.to(glare, { rotation: 0, duration: 0.5, ease: 'power2.out' })
  }
  return bind(svgEl, targets, { enter, leave })
}

// Crosshair scales outward + fades out, then resets — like an anime glint.
const setupTeenLounge = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 10) return null
  // Crosshair lines are the last 4 stroked paths (top, right, left, bottom of +).
  const crosshair = paths.slice(-4)
  markHoverTargets(crosshair)
  // Center of the cross is ~ (49, 28) in viewBox coords.
  crosshair.forEach((p) => gsap.set(p, { svgOrigin: '49 28' }))

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1 })
    tl.fromTo(
      crosshair,
      { scale: 1, opacity: 1 },
      { scale: 1.9, opacity: 0, duration: 0.65, ease: 'power2.out' },
    )
      .set(crosshair, { scale: 1, opacity: 1 })
      .to(crosshair, { duration: 0.15 })
  }
  const leave = () => {
    if (tl) {
      tl.kill()
      tl = null
    }
    gsap.killTweensOf(crosshair)
    gsap.to(crosshair, {
      scale: 1,
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out',
    })
  }
  return bind(svgEl, crosshair, { enter, leave })
}

const setups = {
  cafeteria: setupCafeteria,
  'library & business centre': setupLibrary,
  'screening room': setupScreeningRoom,
  'kids club': setupKidsClub,
  'billiard room': setupBilliard,
  'card room': setupCardRoom,
  'social media studio': setupSocialMediaStudio,
  'teen lounge': setupTeenLounge,
}

export function useSocialClubHovers(scopeRef) {
  useEffect(() => {
    const root = scopeRef.current
    if (!root) return
    let cancelled = false
    const cleanups = []

    inlineSvgsReady(root).then(() => {
      if (cancelled) return
      const cards = root.querySelectorAll('[data-card-name]')
      cards.forEach((card) => {
        const name = card.getAttribute('data-card-name')
        const setup = setups[name]
        if (!setup) return
        const svgEl = card.querySelector('svg')
        if (!svgEl) return
        const cleanup = setup(svgEl)
        if (cleanup) cleanups.push(cleanup)
      })
    })

    return () => {
      cancelled = true
      cleanups.forEach((c) => c())
    }
  }, [scopeRef])
}
