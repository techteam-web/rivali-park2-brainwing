import { gsap } from '../lib/gsap'

// Shared hover behaviors for the gallery sub-pages (Convention Center,
// Wellness Club, Sky Club, Central Courtyard). Each setup attaches
// mouseenter/leave to the inner <svg> element and returns a cleanup that
// removes listeners and resets the transformed elements to their identity.
//
// Conventions matched from the Social Club implementation:
// - mark animated elements with `data-hover-anim` so QA / debugging can
//   spot them
// - all loops are infinite while hovered; on leave we kill the loop and
//   tween the targeted elements back to (0, 0, scale 1, rotation 0)
// - `svgOrigin` is preferred over `transform-box: fill-box` for paths,
//   since transform-box on <path> is patchy across browsers

const HOVER_ATTR = 'data-hover-anim'

const markHoverTargets = (els) => {
  els.forEach((el) => el && el.setAttribute(HOVER_ATTR, ''))
}

export const bind = (svgEl, targets, { enter, leave }) => {
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

// ───────── reusable: steam ─────────
// Coffee/tea cup icons end with 3 wavy upward strokes. They drift up &
// sway side-to-side out of phase, then settle back on leave.
export const setupSteamCup = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 5) return null
  const steam = paths.slice(-3)
  markHoverTargets(steam)

  let yTw, xTw
  const enter = () => {
    if (yTw) yTw.kill()
    if (xTw) xTw.kill()
    yTw = gsap.to(steam, {
      y: -2.4,
      duration: 0.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      overwrite: 'auto',
    })
    xTw = gsap.to(steam, {
      x: '+=1.8',
      duration: 0.75,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      overwrite: 'auto',
      stagger: { each: 0.22, repeat: -1, yoyo: true },
    })
  }
  const leave = () => {
    if (yTw) { yTw.kill(); yTw = null }
    if (xTw) { xTw.kill(); xTw = null }
    gsap.to(steam, { x: 0, y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
  }
  return bind(svgEl, steam, { enter, leave })
}

// ───────── reusable: barbell pump ─────────
// The gymnasium / sky fitness icon is a horizontal barbell with two
// weight stacks on each side. The whole thing pumps up + down with a
// slight squash, like a rep being lifted. We rotate around the SVG
// center so weights stay glued to the bar.
export const setupBarbell = (svgEl) => {
  const allChildren = Array.from(svgEl.children)
  // Skip the outer background circle (always the first <circle>).
  const targets = allChildren.filter(
    (c) => !(c.tagName.toLowerCase() === 'circle' && c.getAttribute('r') === '35.4'),
  )
  if (!targets.length) return null
  // Use a wrapping <g>... actually each child gets its own origin at 36,36.
  targets.forEach((t) => gsap.set(t, { transformOrigin: '36px 36px', svgOrigin: '36 36' }))
  markHoverTargets(targets)

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(targets, {
      y: -2.4,
      scaleY: 0.94,
      scaleX: 1.04,
      duration: 0.5,
      ease: 'power2.out',
    }).to(targets, {
      y: 1.8,
      scaleY: 1.02,
      scaleX: 0.98,
      duration: 0.42,
      ease: 'power2.in',
    })
  }
  const leave = () => {
    if (tl) { tl.kill(); tl = null }
    gsap.killTweensOf(targets)
    gsap.to(targets, {
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.4,
      ease: 'power2.out',
    })
  }
  return bind(svgEl, targets, { enter, leave })
}

// ───────── reusable: lotus bloom (spa) ─────────
// Spa icon = lotus flower with 4 petals around a small center pip. We
// "bloom" each petal outward from the SVG center on a stagger loop and
// pulse the center pip slightly, then return to identity on leave.
export const setupLotus = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 6) return null
  // Petals = first 4 long curve paths (the four directional petals).
  const petals = paths.slice(0, 4)
  const tips = paths.slice(4, 6)
  const all = [...petals, ...tips]
  // Lotus center is roughly (36, 36) on the 72×72 viewBox.
  all.forEach((p) => gsap.set(p, { svgOrigin: '36 36' }))
  markHoverTargets(all)

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(petals, {
      scale: 1.14,
      duration: 0.85,
      ease: 'sine.inOut',
      stagger: { each: 0.07, from: 'center' },
    }, 0).to(tips, {
      scale: 1.08,
      duration: 0.85,
      ease: 'sine.inOut',
    }, 0)
  }
  const leave = () => {
    if (tl) { tl.kill(); tl = null }
    gsap.killTweensOf(all)
    gsap.to(all, { scale: 1, duration: 0.45, ease: 'power2.out' })
  }
  return bind(svgEl, all, { enter, leave })
}

// ───────── reusable: kids slide (whee!) ─────────
// The kid + slide icon shares geometry between Sky Club and Central
// Courtyard. On hover the child figure (path[3] inside the clip) wiggles
// like they're sliding down, while the squiggly ground line waves.
export const setupKidsSlide = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 4) return null
  // Order in source varies (CC reorders kid first, SC has it last). The
  // largest closed shape (the kid w/ slide) is the one with the longest
  // d attribute — fall back to the LAST path if comparing fails.
  const sortedByLen = [...paths].sort(
    (a, b) => (b.getAttribute('d')?.length || 0) - (a.getAttribute('d')?.length || 0),
  )
  const kid = sortedByLen[0]
  const ground = paths.find((p) => p !== kid && (p.getAttribute('d') || '').length > 200) || paths[paths.length - 1]
  const targets = [kid, ground].filter(Boolean)
  markHoverTargets(targets)
  gsap.set(kid, { svgOrigin: '36 38' })

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(kid, {
      rotation: -7,
      y: -1.2,
      duration: 0.45,
      ease: 'sine.inOut',
    }, 0).to(kid, {
      rotation: 7,
      y: 0.4,
      duration: 0.45,
      ease: 'sine.inOut',
    }, 0.45)
    if (ground) {
      gsap.to(ground, {
        y: '+=0.6',
        duration: 0.55,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        overwrite: 'auto',
      })
    }
  }
  const leave = () => {
    if (tl) { tl.kill(); tl = null }
    gsap.killTweensOf(targets)
    gsap.to(targets, { rotation: 0, x: 0, y: 0, duration: 0.4, ease: 'power2.out' })
  }
  return bind(svgEl, targets, { enter, leave })
}

// ───────── reusable: banquet hall (Mexican wave) ─────────
// The banquet hall card has rows of small vertical chair-back lines plus
// a buffet cart on the right with a draped curtain. We send a wave
// running through every path (subtle Y bounce) to suggest a busy hall.
export const setupBanquetHall = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 6) return null
  markHoverTargets(paths)
  paths.forEach((p) => gsap.set(p, { svgOrigin: '36 36', y: 0 }))

  let tw
  const enter = () => {
    if (tw) tw.kill()
    tw = gsap.to(paths, {
      y: -1.2,
      duration: 0.55,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: { each: 0.06, repeat: -1, yoyo: true },
      overwrite: 'auto',
    })
  }
  const leave = () => {
    if (tw) { tw.kill(); tw = null }
    gsap.killTweensOf(paths)
    gsap.to(paths, { y: 0, duration: 0.4, ease: 'power2.out' })
  }
  return bind(svgEl, paths, { enter, leave })
}

// ───────── convention center: guest rooms (sleeping beds) ─────────
// Two beds inside a hotel facade. The two pillow rectangles (paths[1]
// and paths[2] — the two arched bed shapes) drift up + back, slightly
// out of phase, like a slow snore. The whole icon stays grounded.
export const setupGuestRoomsCC = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 4) return null
  const bedA = paths[1]
  const bedB = paths[2]
  const targets = [bedA, bedB]
  markHoverTargets(targets)
  targets.forEach((t) => gsap.set(t, { transformOrigin: '50% 100%', transformBox: 'fill-box' }))

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(bedA, {
      y: -1.0,
      scaleY: 1.06,
      duration: 0.7,
      ease: 'sine.inOut',
    }, 0).to(bedB, {
      y: -1.0,
      scaleY: 1.06,
      duration: 0.7,
      ease: 'sine.inOut',
    }, 0.35)
  }
  const leave = () => {
    if (tl) { tl.kill(); tl = null }
    gsap.killTweensOf(targets)
    gsap.to(targets, { y: 0, scaleY: 1, duration: 0.4, ease: 'power2.out' })
  }
  return bind(svgEl, targets, { enter, leave })
}

// ───────── wellness club: salon (snipping scissors) ─────────
// Snip-snip — the long diagonal blades open and close in a quick rhythm.
// The blade paths are the longest two strokes; the comb stays static.
export const setupSalon = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 4) return null
  const sorted = [...paths].sort((a, b) => (b.getAttribute('d')?.length || 0) - (a.getAttribute('d')?.length || 0))
  const bladeA = sorted[0]
  const bladeB = sorted[1]
  const pivot = '32 35'
  ;[bladeA, bladeB].forEach((p) => gsap.set(p, { svgOrigin: pivot }))
  markHoverTargets([bladeA, bladeB])

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1 })
    tl.to(bladeA, { rotation: -6, duration: 0.18, ease: 'power2.in' }, 0)
      .to(bladeB, { rotation: 6,  duration: 0.18, ease: 'power2.in' }, 0)
      .to(bladeA, { rotation: 0,  duration: 0.18, ease: 'power2.out' })
      .to(bladeB, { rotation: 0,  duration: 0.18, ease: 'power2.out' }, '<')
      .to({}, { duration: 0.25 })
  }
  const leave = () => {
    if (tl) { tl.kill(); tl = null }
    gsap.killTweensOf([bladeA, bladeB])
    gsap.to([bladeA, bladeB], { rotation: 0, duration: 0.3, ease: 'power2.out' })
  }
  return bind(svgEl, [bladeA, bladeB], { enter, leave })
}

// ───────── wellness club: amphitheatre (sound waves) ─────────
// The semi-circle amphitheatre has a stage curve, two side poles and
// concentric inner curves. We pulse the inner curves outward in sequence
// — like sound radiating from the stage.
export const setupAmphitheatre = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 5) return null
  // Inner curves (the bleacher rows / dome arches) sit after the four
  // structural lines. Take all but the first 4.
  const arches = paths.slice(-3)
  arches.forEach((p) => gsap.set(p, { svgOrigin: '36 41', transformOrigin: '50% 100%' }))
  markHoverTargets(arches)

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1 })
    tl.fromTo(
      arches,
      { scale: 1, opacity: 0.35 },
      {
        scale: 1.12,
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.18,
      },
    ).to(arches, {
      scale: 1,
      opacity: 1,
      duration: 0.45,
      ease: 'power2.in',
      stagger: 0.06,
    })
  }
  const leave = () => {
    if (tl) { tl.kill(); tl = null }
    gsap.killTweensOf(arches)
    gsap.to(arches, { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' })
  }
  return bind(svgEl, arches, { enter, leave })
}

// ───────── wellness club: wellness bar (sloshing glass) ─────────
// The cocktail/wellness bar icon — body, rim, and a couple of liquid
// curves. We tilt the whole drink left/right (around the base) so it
// looks like the glass is being swirled.
export const setupWellnessBar = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 3) return null
  markHoverTargets(paths)
  paths.forEach((p) => gsap.set(p, { svgOrigin: '36 50' }))

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(paths, { rotation: -4, x: -0.6, duration: 0.55, ease: 'sine.inOut' })
      .to(paths, { rotation: 4,  x: 0.6,  duration: 0.55, ease: 'sine.inOut' })
  }
  const leave = () => {
    if (tl) { tl.kill(); tl = null }
    gsap.killTweensOf(paths)
    gsap.to(paths, { rotation: 0, x: 0, duration: 0.4, ease: 'power2.out' })
  }
  return bind(svgEl, paths, { enter, leave })
}

// ───────── wellness club: dining (utensils tap) ─────────
// Roof + utensils. The fork (left vertical) and knife (right vertical)
// gently tap — fork down, knife up, alternating, like cutting + eating.
export const setupDining = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 6) return null
  // Fork prongs are the short verticals near the centre — paths whose d
  // strings are short verticals (M..Vxxx). Take the two paths closest
  // to the centre with simple vertical d. Heuristic: use paths 1 (fork
  // body) and 3 (prong group). We'll just animate the two centre verticals.
  const fork = paths[1] // central fork shaft (M36.66 37.78V47.96)
  const cross1 = paths[2]
  const targets = [fork, cross1].filter(Boolean)
  markHoverTargets(targets)
  targets.forEach((t) => gsap.set(t, { transformOrigin: '50% 0%', transformBox: 'fill-box' }))

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(fork, { y: 0.8, scaleY: 0.96, duration: 0.32, ease: 'sine.inOut' }, 0)
    if (cross1) tl.to(cross1, { rotation: 4, duration: 0.32, ease: 'sine.inOut' }, 0)
  }
  const leave = () => {
    if (tl) { tl.kill(); tl = null }
    gsap.killTweensOf(targets)
    gsap.to(targets, { y: 0, rotation: 0, scaleY: 1, duration: 0.3, ease: 'power2.out' })
  }
  return bind(svgEl, targets, { enter, leave })
}

// ───────── sky club: viewing decks (railing scan) ─────────
// The viewing deck SVG is dominated by tall vertical railings + a roof
// curve. We send a brightness/scan wave across the railings and bounce
// the roof slightly — feels like wind sweeping through.
export const setupViewingDecks = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 8) return null
  // Vertical railings = paths whose d starts with "M" then a number and
  // contains short vertical "C ..." but the cleanest cut is "all paths
  // after the roof outline (paths[0]) up to but not including the last
  // 4 (which are decorative bird/figure)." This is the main facade.
  const railings = paths.slice(2, 8)
  markHoverTargets(railings)
  railings.forEach((r) => gsap.set(r, { svgOrigin: '36 43' }))

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1 })
    tl.fromTo(
      railings,
      { scaleY: 1, y: 0 },
      {
        scaleY: 1.08,
        y: -1.2,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.07,
      },
    ).to(railings, {
      scaleY: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.in',
      stagger: 0.07,
    })
  }
  const leave = () => {
    if (tl) { tl.kill(); tl = null }
    gsap.killTweensOf(railings)
    gsap.to(railings, { scaleY: 1, y: 0, duration: 0.35, ease: 'power2.out' })
  }
  return bind(svgEl, railings, { enter, leave })
}

// ───────── sky club: guest rooms (turning key) ─────────
// The guest rooms icon resembles a stylised key + lock. Rotate the
// whole pictogram 360° on a slow loop while the key "wiggles" first to
// suggest unlocking, then commits to the spin.
export const setupGuestRoomsSC = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 3) return null
  // Whole icon, except outer circle, rotates as one rigid pictogram.
  const allChildren = Array.from(svgEl.children)
  const targets = allChildren.filter(
    (c) => !(c.tagName.toLowerCase() === 'circle' && c.getAttribute('r') === '35.4'),
  )
  if (!targets.length) return null
  targets.forEach((t) => gsap.set(t, { svgOrigin: '36 36' }))
  markHoverTargets(targets)

  let tw
  const enter = () => {
    if (tw) tw.kill()
    // Tiny "jiggle" then commit to a slow spin.
    const tl = gsap.timeline()
    tl.to(targets, { rotation: -8, duration: 0.18, ease: 'power2.out' })
      .to(targets, { rotation: 8, duration: 0.18, ease: 'sine.inOut' })
      .to(targets, { rotation: 0, duration: 0.18, ease: 'power2.out' })
    tw = gsap.to(targets, {
      rotation: '+=360',
      duration: 5.5,
      ease: 'none',
      repeat: -1,
      delay: 0.55,
    })
  }
  const leave = () => {
    if (tw) { tw.kill(); tw = null }
    gsap.killTweensOf(targets)
    gsap.to(targets, { rotation: 0, duration: 0.45, ease: 'power2.out' })
  }
  return bind(svgEl, targets, { enter, leave })
}

// ───────── central courtyard: art gallery (paintings come alive) ─────────
// Frames first, then 4 art-content paths. The art elements scale + tilt
// alternately so it feels like the paintings are lit up & breathing.
export const setupArtGallery = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 12) return null
  // First 7 paths are the two nested frames; remainder is the art.
  const art = paths.slice(7)
  art.forEach((p) => gsap.set(p, { svgOrigin: '36 36' }))
  markHoverTargets(art)

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1, yoyo: true })
    art.forEach((el, i) => {
      tl.to(
        el,
        {
          scale: 1.08,
          rotation: i % 2 === 0 ? 2 : -2,
          duration: 0.55,
          ease: 'sine.inOut',
        },
        i * 0.08,
      )
    })
  }
  const leave = () => {
    if (tl) { tl.kill(); tl = null }
    gsap.killTweensOf(art)
    gsap.to(art, { scale: 1, rotation: 0, duration: 0.4, ease: 'power2.out' })
  }
  return bind(svgEl, art, { enter, leave })
}

// ───────── central courtyard: pools (ripple) ─────────
// Both the leisure & swimming pool icons have 3 horizontal water lanes
// + chairs/figures. We send a wave through the 3 water lines and let
// the chairs bob slightly. The ripple direction alternates each pass.
export const setupPool = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 6) return null
  // The water lanes are the three near-horizontal lines (the last 3
  // paths in both pool variants by inspection).
  const lanes = paths.slice(-3)
  // Side figures (chair/diver) are the 2 vertical/curve paths just
  // before the lanes. We bob them subtly.
  const figures = paths.slice(-5, -3)
  markHoverTargets([...lanes, ...figures])
  lanes.forEach((l) => gsap.set(l, { svgOrigin: '36 38' }))

  let tl
  const enter = () => {
    if (tl) tl.kill()
    tl = gsap.timeline({ repeat: -1 })
    tl.fromTo(
      lanes,
      { x: -1.2 },
      {
        x: 1.2,
        duration: 1.2,
        ease: 'sine.inOut',
        stagger: 0.18,
      },
    ).to(lanes, {
      x: -1.2,
      duration: 1.2,
      ease: 'sine.inOut',
      stagger: 0.18,
    })
    if (figures.length) {
      gsap.to(figures, {
        y: -0.8,
        duration: 0.7,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.18,
        overwrite: 'auto',
      })
    }
  }
  const leave = () => {
    if (tl) { tl.kill(); tl = null }
    gsap.killTweensOf([...lanes, ...figures])
    gsap.to([...lanes, ...figures], {
      x: 0,
      y: 0,
      duration: 0.4,
      ease: 'power2.out',
    })
  }
  return bind(svgEl, [...lanes, ...figures], { enter, leave })
}

// ───────── central courtyard: multipurpose courts (spinning ball) ─────────
// Court rectangle + centre ball + side bench panels. The ball (3rd path:
// the small circle in the middle) spins, while the centre line scales
// pulsing, like a referee whistle moment.
export const setupCourts = (svgEl) => {
  const paths = Array.from(svgEl.querySelectorAll('path'))
  if (paths.length < 5) return null
  const ball = paths[2] // the central circle/ball
  const centreLine = paths[1] // the centre divider line
  markHoverTargets([ball, centreLine])
  gsap.set(ball, { transformOrigin: '50% 50%', transformBox: 'fill-box' })
  gsap.set(centreLine, { svgOrigin: '36 36' })

  let tw, tl
  const enter = () => {
    if (tw) tw.kill()
    if (tl) tl.kill()
    tw = gsap.to(ball, {
      rotation: '+=360',
      duration: 1.6,
      ease: 'none',
      repeat: -1,
    })
    tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(ball, { y: -1.4, duration: 0.4, ease: 'sine.inOut' }, 0)
      .to(centreLine, { scaleY: 1.04, duration: 0.4, ease: 'sine.inOut' }, 0)
  }
  const leave = () => {
    if (tw) { tw.kill(); tw = null }
    if (tl) { tl.kill(); tl = null }
    gsap.killTweensOf([ball, centreLine])
    gsap.to([ball, centreLine], {
      rotation: 0,
      y: 0,
      scaleY: 1,
      duration: 0.4,
      ease: 'power2.out',
    })
  }
  return bind(svgEl, [ball, centreLine], { enter, leave })
}
