import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import { usePageTransition } from '../../hooks/usePageTransition'
import {
  contentViewBox,
  elevationFor,
  floorNumberFromName,
  floorOrdinal,
  towerViewBox,
} from '../../data/towerElevations'

// Floor picker built on the architects' own artwork. The elevation drawing
// draws itself in with DrawSVG; on top of it sits their floor overlay, whose
// every top-level group IS one storey — already the right shape, including
// Stargaze's corner-on perspective. Hovering a group lights that floor;
// clicking it carries the floor into the unit-plan flow as ?floor=<n>, which is
// what makes "view from apartment" open on the floor the user actually chose.
//
// TWO PAINT LAYERS
// ----------------
// Every floor renders its shapes TWICE: once for the idle wave, once for the
// hover highlight. Each layer's colour is baked in and static; GSAP only ever
// animates the layer's own `opacity`.
//
// This is deliberate. When both effects tweened one shared `fill-opacity`, the
// hover tween needed `overwrite` to take control — and overwriting doesn't just
// interrupt the wave, it permanently removes those tweens from the looping
// timeline. Floors caught mid-fade were stranded lit, and the wave quietly
// eroded the longer you used the page. Separate layers means the two
// animations can never contend, so neither needs to overwrite the other.
//
// React renders both layers once and never touches their opacity again — that
// belongs to GSAP. There are no CSS transitions on these properties either, for
// the same reason.

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Hover: a confident wash with the hand-drawn outline reading as its border.
const BAND_HOVER = 0.22
const OUTLINE_HOVER = 0.85
// Idle wave: the same shapes, fainter — an invitation, not a selection.
const BAND_PULSE = 0.14
const OUTLINE_PULSE = 0.5

// Geometry-only attributes we lift off each overlay shape. Everything else
// (the Illustrator classes, which bake in a fill and a permanent ~40% opacity)
// is dropped — the highlight is ours to drive.
const SHAPE_ATTRS = {
  polygon: ['points'],
  polyline: ['points'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
  path: ['d'],
  circle: ['cx', 'cy', 'r'],
  ellipse: ['cx', 'cy', 'rx', 'ry'],
  line: ['x1', 'y1', 'x2', 'y2'],
}

// Split the overlay into one entry per floor.
//
// The shapes are converted into plain data and rendered as REAL React elements
// rather than injected as markup. That matters for more than tidiness: with
// dangerouslySetInnerHTML, the re-render triggered by hovering a floor swapped
// the shape nodes out between mousedown and mouseup, so a quick click on a
// freshly-hovered floor was silently swallowed. Real elements let React diff
// attributes in place, so the nodes are stable and clicks always land.
//
// A group holds a clean geometric band (rect, or a perspective polygon on
// Stargaze) plus a hand-drawn outline path — together the soft fill + sketchy
// border the artwork was drawn for.
//
// Groups are then MERGED BY NAME. Moonrise and Stargaze give one group per
// storey, but Skyleap is a three-wing building and splits each storey into a
// left, centre and right section that all share one `data-name`. Merging makes
// a floor a single hover target whichever wing the cursor is over, and keeps
// React keys unique. For the single-group towers it's a no-op.
const parseFloorGroups = (svgText) => {
  if (typeof DOMParser === 'undefined') return []
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const root = doc.documentElement
  if (!root || root.getElementsByTagName('parsererror').length) return []

  const byName = new Map()
  const order = []

  for (const g of Array.from(root.children)) {
    if (g.tagName.toLowerCase() !== 'g') continue
    const name = g.getAttribute('data-name') || g.getAttribute('id') || ''
    const floor = floorNumberFromName(name)
    // Numbered storeys only. The overlays also carry retail podium groups
    // ("shop", "shop-1"…) which aren't floors — no plan to open, so they're
    // never drawn or hoverable.
    if (floor == null) continue

    const shapes = Array.from(g.children)
      .map((el) => {
        const tag = el.tagName.toLowerCase()
        const keys = SHAPE_ATTRS[tag]
        if (!keys) return null
        const attrs = {}
        keys.forEach((k) => {
          const v = el.getAttribute(k)
          if (v != null) attrs[k] = v
        })
        return Object.keys(attrs).length ? { tag, attrs } : null
      })
      .filter(Boolean)
    if (!shapes.length) continue

    // Vertical extent, used below to tell a genuine multi-part storey from a
    // mislabelled group that happens to share a name.
    const ys = shapeYRange(g)

    if (!byName.has(name)) {
      byName.set(name, { name, floor, parts: [] })
      order.push(name)
    }
    byName.get(name).parts.push({ shapes, ys })
  }

  // Same-named groups belong to ONE storey only when they sit at the same
  // height — that's Skyleap's left/centre/right wings. A same-named group at a
  // completely different height is a labelling slip in the artwork (Sunburst's
  // export carries a crown band mislabelled as "30th", 600 units above the real
  // 30th floor). Merging those would light one floor in two places, so each
  // distinct height becomes its own candidate and the odd one out is dropped by
  // the ordering check below.
  const candidates = []
  for (const n of order) {
    const { name, floor, parts } = byName.get(n)
    const clusters = []
    for (const part of parts) {
      const hit = clusters.find(
        (c) => part.ys.lo <= c.ys.hi && part.ys.hi >= c.ys.lo,
      )
      if (hit) {
        hit.shapes.push(...part.shapes)
        hit.ys = { lo: Math.min(hit.ys.lo, part.ys.lo), hi: Math.max(hit.ys.hi, part.ys.hi) }
      } else {
        clusters.push({ shapes: [...part.shapes], ys: { ...part.ys } })
      }
    }
    clusters.forEach((c) => candidates.push({ name, floor, shapes: c.shapes, ys: c.ys }))
  }

  // Floors must climb as you go up the building. Anything breaking that is
  // mislabelled, so keep the largest self-consistent set (longest strictly
  // decreasing run of floor numbers, read top-down) and discard the rest.
  candidates.sort((a, b) => a.ys.lo - b.ys.lo)
  const best = longestDescending(candidates.map((c) => c.floor))
  return best.map((i) => {
    const { name, floor, shapes } = candidates[i]
    return { name, floor, shapes }
  })
}

// Vertical span of a group's shapes, from raw attributes (no layout needed).
const shapeYRange = (g) => {
  let lo = Infinity
  let hi = -Infinity
  for (const el of Array.from(g.children)) {
    const tag = el.tagName.toLowerCase()
    let ys = []
    if (tag === 'rect') {
      const y = parseFloat(el.getAttribute('y'))
      const h = parseFloat(el.getAttribute('height'))
      if (Number.isFinite(y)) ys = [y, y + (Number.isFinite(h) ? h : 0)]
    } else if (tag === 'polygon' || tag === 'polyline') {
      const nums = (el.getAttribute('points') || '').match(/-?\d*\.?\d+/g) || []
      ys = nums.filter((_, i) => i % 2 === 1).map(Number)
    } else if (tag === 'path') {
      // First coordinate pair of the leading moveto is enough to place it.
      const m = /^[Mm]\s*(-?\d*\.?\d+)[ ,]+(-?\d*\.?\d+)/.exec(
        (el.getAttribute('d') || '').trim(),
      )
      if (m) ys = [Number(m[2])]
    }
    for (const y of ys) {
      if (!Number.isFinite(y)) continue
      lo = Math.min(lo, y)
      hi = Math.max(hi, y)
    }
  }
  return Number.isFinite(lo) ? { lo, hi } : { lo: 0, hi: 0 }
}

// Indices of the longest strictly-decreasing run in `a` (O(n^2) is ample for
// the few dozen floors an overlay holds).
const longestDescending = (a) => {
  if (!a.length) return []
  const len = a.map(() => 1)
  const prev = a.map(() => -1)
  let bestEnd = 0
  for (let i = 1; i < a.length; i++) {
    for (let j = 0; j < i; j++) {
      if (a[j] > a[i] && len[j] + 1 > len[i]) {
        len[i] = len[j] + 1
        prev[i] = j
      }
    }
    if (len[i] > len[bestEnd]) bestEnd = i
  }
  const out = []
  for (let i = bestEnd; i !== -1; i = prev[i]) out.push(i)
  return out.reverse()
}

// One floor's shapes, at the opacity of whichever layer is asking.
const FloorShapes = ({ floor, band, outline }) =>
  floor.shapes.map((s, i) => {
    const Shape = s.tag
    const isOutline = s.tag === 'path'
    return (
      <Shape
        key={`${floor.name}-${i}`}
        {...s.attrs}
        fillOpacity={isOutline ? outline : band}
      />
    )
  })

const TowerElevation = ({ tower, onBack, onPick, onSkip }) => {
  const pageRef = useRef(null)
  const svgHostRef = useRef(null)
  const overlayRef = useRef(null)
  const numberRef = useRef(null)
  const pulseRef = useRef(null)
  const hoveringRef = useRef(false)
  const { exitTo, exitWith } = usePageTransition({ containerRef: pageRef })

  const elevation = elevationFor(tower.id)
  const [hovered, setHovered] = useState(null)
  const [markup, setMarkup] = useState(null)
  const [floorGroups, setFloorGroups] = useState([])
  // The wave holds until the building has finished drawing itself, so the two
  // animations never overlap and the entrance stays clean. With reduced motion
  // there is no draw-in to wait for, so it starts out satisfied.
  const [drawn, setDrawn] = useState(() => prefersReducedMotion())

  // Crop to the tower when the viewport can't carry the full plate: portrait,
  // narrow, or short (landscape phones) all reduce to the same problem.
  const TIGHT_QUERY =
    '(max-aspect-ratio: 1/1), (max-width: 900px), (max-height: 560px)'
  const [tight, setTight] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia(TIGHT_QUERY).matches,
  )
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(TIGHT_QUERY)
    const on = (e) => setTight(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [TIGHT_QUERY])

  const viewBox = useMemo(
    () => (tight ? towerViewBox(tower.id) : contentViewBox(tower.id)),
    [tight, tower.id],
  )

  // Fetch the drawing as markup (rather than an <img>) so its paths are real
  // DOM nodes we can hand to DrawSVG.
  useEffect(() => {
    if (!elevation) return
    let cancelled = false
    fetch(elevation.src)
      .then((r) => r.text())
      .then((t) => !cancelled && setMarkup(t))
      .catch(() => !cancelled && setMarkup(''))
    return () => {
      cancelled = true
    }
  }, [elevation])

  // ...and the floor overlay alongside it.
  useEffect(() => {
    if (!elevation?.floorsSrc) return
    let cancelled = false
    fetch(elevation.floorsSrc)
      .then((r) => r.text())
      .then((t) => !cancelled && setFloorGroups(parseFloorGroups(t)))
      .catch(() => !cancelled && setFloorGroups([]))
    return () => {
      cancelled = true
    }
  }, [elevation])

  // The drawing is injected imperatively and deliberately kept OUT of React's
  // tree. Rendering it through dangerouslySetInnerHTML meant any later render
  // (hovering a floor is a state change) could rebuild the subtree from the
  // source string — reverting the reframed viewBox and resetting every stroke
  // GSAP had mid-animation. Owning the node ourselves makes both stick.
  useLayoutEffect(() => {
    const host = svgHostRef.current
    if (!host || !markup) return
    host.innerHTML = markup
    const svg = host.querySelector('svg')
    if (!svg) return
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    svg.removeAttribute('width')
    svg.removeAttribute('height')
    svg.style.height = '100%'
    svg.style.width = '100%'
    if (prefersReducedMotion()) return
    // Only the drawing's own strokes are animatable — the <clipPath> in <defs>
    // holds a <path> too, and tweening THAT would redefine the clip region and
    // wipe the whole illustration.
    const paths = Array.from(svg.querySelectorAll('path')).filter(
      (p) => !p.closest('defs'),
    )
    // Hidden before paint so the finished drawing never flashes ahead of its
    // own draw-in.
    if (paths.length) gsap.set(paths, { drawSVG: 0, autoAlpha: 0 })
  }, [markup])

  // Reframe on breakpoint changes without touching stroke state, so resizing
  // mid-draw can't strand paths hidden.
  useLayoutEffect(() => {
    const svg = svgHostRef.current?.querySelector('svg')
    if (svg) svg.setAttribute('viewBox', viewBox)
  }, [markup, viewBox])

  // Draw the tower in from the ground up. Paths are sorted by vertical position
  // so the stagger reads as the building rising, not as the file's arbitrary
  // drawing order.
  useEffect(() => {
    const svg = svgHostRef.current?.querySelector('svg')
    if (!markup || !svg) return
    const paths = Array.from(svg.querySelectorAll('path')).filter(
      (p) => !p.closest('defs'),
    )
    if (!paths.length) return

    if (prefersReducedMotion()) {
      gsap.set(paths, { drawSVG: '0% 100%', autoAlpha: 1 })
      return
    }

    const ordered = paths
      .map((p) => {
        let y
        try {
          y = p.getBBox().y
        } catch {
          y = 0
        }
        return { p, y }
      })
      .sort((a, b) => b.y - a.y)
      .map((o) => o.p)

    const tl = gsap.timeline({ onComplete: () => setDrawn(true) })
    tl.to(ordered, {
      drawSVG: '0% 100%',
      autoAlpha: 1,
      duration: 0.55,
      ease: 'power1.out',
      stagger: { amount: 0.95 },
    })
    return () => tl.kill()
  }, [markup])

  const layersOf = useCallback((attr) => {
    const root = overlayRef.current
    if (!root) return []
    return Array.from(root.querySelectorAll(`[${attr}]`))
  }, [])

  // Idle wave: a soft pass running top → bottom, over and over, so it's obvious
  // the floors are live. Only ever touches the pulse layer's opacity.
  useEffect(() => {
    if (!floorGroups.length || !drawn || prefersReducedMotion()) return
    const root = overlayRef.current
    if (!root) return

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 1,
      // onRepeat fires at the top of each new cycle — i.e. once the previous
      // pass has run all the way down and cleared. Pausing here is what gives
      // the requested behaviour: start hovering and the wave finishes its
      // descent, then stops; it never restarts while the cursor is on a floor.
      onRepeat: () => {
        if (hoveringRef.current) tl.pause()
      },
    })

    floorGroups.forEach((f, i) => {
      const layer = root.querySelector(`[data-pulse="${f.name}"]`)
      if (!layer) return
      const at = i * 0.045
      tl.to(layer, { opacity: 1, duration: 0.2, ease: 'sine.out' }, at).to(
        layer,
        { opacity: 0, duration: 0.45, ease: 'sine.inOut' },
        at + 0.2,
      )
    })

    pulseRef.current = tl
    if (hoveringRef.current) tl.pause()
    return () => {
      tl.kill()
      pulseRef.current = null
    }
  }, [floorGroups, drawn])

  // Hover highlight. Every hover layer is driven on every change — the one
  // under the cursor up, ALL others down — so moving the cursor across floors
  // can never leave a trail of lit bands behind it.
  useEffect(() => {
    if (!floorGroups.length) return
    hoveringRef.current = Boolean(hovered)

    const layers = layersOf('data-hover')
    if (!layers.length) return

    layers.forEach((l) => {
      const on = l.getAttribute('data-hover') === hovered
      if (prefersReducedMotion()) {
        gsap.set(l, { opacity: on ? 1 : 0 })
        return
      }
      gsap.to(l, {
        opacity: on ? 1 : 0,
        // Kept short deliberately: a long fade-out reads as floors "staying
        // highlighted" when you run the cursor up and down the tower.
        duration: on ? 0.14 : 0.11,
        ease: 'power2.out',
        // Moving the cursor quickly queues a fade-out and a fade-in on the
        // same layer within a few frames; without this they both stay live and
        // the stale fade-out drags the floor you're actually on back to
        // invisible. Safe to overwrite here precisely because the idle wave
        // lives on its own separate layer — this can only ever cancel another
        // hover tween.
        overwrite: 'auto',
      })
    })

    // Cursor is off the tower again — let the wave pick back up.
    if (!hovered) pulseRef.current?.play()
  }, [hovered, floorGroups, layersOf])

  const hoveredFloor =
    floorGroups.find((f) => f.name === hovered)?.floor ?? null
  // A tower whose floor overlay hasn't been supplied yet still shows its
  // drawing; it just has nothing to hover, so the readout becomes a plain
  // route onward to the plans.
  const hasFloors = Boolean(elevation?.floorsSrc)

  // Each new floor number rises into its mask as the old one clears — the same
  // masked-line language the tower detail panel uses for its headings.
  useLayoutEffect(() => {
    const el = numberRef.current
    if (!el || hoveredFloor == null) return
    if (prefersReducedMotion()) {
      gsap.set(el, { yPercent: 0, autoAlpha: 1 })
      return
    }
    const tween = gsap.fromTo(
      el,
      { yPercent: 55, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 0.42, ease: 'expo.out' },
    )
    return () => tween.kill()
  }, [hoveredFloor])

  const pick = useCallback(
    (floor) => exitWith(() => onPick(floor)),
    [exitWith, onPick],
  )

  if (!elevation) return null

  const accent = elevation.accent

  return (
    <div
      ref={pageRef}
      className="relative h-screen w-full overflow-hidden bg-white"
    >
      {/* Drawing + floor overlay share one box and one viewBox, so the
          highlight stays welded to the artwork at every breakpoint. */}
      {/* Vertical padding is clawed back on short viewports (landscape phones),
          where the tower is height-constrained and every pixel of headroom goes
          straight into how big the building reads. */}
      <div className="absolute inset-0 flex items-center justify-center px-4 pt-16 pb-12 [@media(max-height:560px)]:pt-9 [@media(max-height:560px)]:pb-4 md:px-8 md:pt-24 md:pb-20 2xl:pt-28 2xl:pb-24 3xl:pt-34 3xl:pb-28 4xl:pt-44 4xl:pb-36 5xl:pt-64 5xl:pb-52">
        <div className="relative h-full w-full">
          {/* Intentionally childless in JSX — the drawing is injected in the
              layout effect above and owned outside React. */}
          <div ref={svgHostRef} className="absolute inset-0" aria-hidden />

          <svg
            ref={overlayRef}
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
            role="group"
            aria-label={`${tower.name} floors`}
          >
            {floorGroups.map((f) => (
              <g
                key={f.name}
                data-floor={f.name}
                fill={accent}
                // Hit-test the whole band even while both layers are painted at
                // zero opacity, so a floor is hoverable without being visible.
                pointerEvents="all"
                // No focus ring: focusing a floor already lights it (onFocus
                // drives the same highlight as hover), so the browser's default
                // blue outline is redundant and reads as a glitch on top of the
                // artwork.
                className="cursor-pointer outline-none focus:outline-none focus-visible:outline-none"
                onMouseEnter={() => setHovered(f.name)}
                onMouseLeave={() =>
                  setHovered((c) => (c === f.name ? null : c))
                }
                onFocus={() => setHovered(f.name)}
                onBlur={() => setHovered((c) => (c === f.name ? null : c))}
                onClick={() => pick(f.floor)}
                tabIndex={0}
                role="button"
                aria-label={`${floorOrdinal(f.floor)} floor`}
              >
                {/* Layer 1 — the idle wave. GSAP owns this opacity. */}
                <g data-pulse={f.name} opacity={0}>
                  <FloorShapes
                    floor={f}
                    band={BAND_PULSE}
                    outline={OUTLINE_PULSE}
                  />
                </g>
                {/* Layer 2 — the hover highlight. GSAP owns this opacity. */}
                <g data-hover={f.name} opacity={0}>
                  <FloorShapes
                    floor={f}
                    band={BAND_HOVER}
                    outline={OUTLINE_HOVER}
                  />
                </g>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Tower name, centred. */}
      <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex flex-col items-center px-16 md:top-6 3xl:top-8 4xl:top-10 5xl:top-14">
        <h1
          className="text-center uppercase"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: '#313131',
          }}
        >
          <span className="text-[15px] md:text-[18px] 2xl:text-[22px] 3xl:text-[26px] 4xl:text-[34px] 5xl:text-[50px]">
            {tower.name}
          </span>
        </h1>
      </div>

      {/* Floor readout — right side, level with the top of the tower. The
          caption is the standing instruction; the number swaps in beneath it as
          floors are hovered. */}
      <div className="pointer-events-none absolute right-[5%] top-[13%] z-30 flex flex-col items-end md:right-[7%] md:top-[16%] 2xl:right-[8%]">
        <p
          className="uppercase"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.18em',
            color: hoveredFloor != null ? accent : '#9A9A9A',
          }}
        >
          <span className="text-[10px] md:text-[11px] 2xl:text-[13px] 3xl:text-[15px] 4xl:text-[19px] 5xl:text-[28px]">
            {hasFloors ? 'Select a floor' : 'Floor plans'}
          </span>
        </p>

        {/* No floor overlay yet: offer the plans directly instead of a number
            that could never change. */}
        {!hasFloors && (
          <button
            type="button"
            onClick={() => exitWith(onSkip)}
            className="pointer-events-auto mt-2 cursor-pointer border px-5 py-2.5 uppercase transition-[background-color,color] md:mt-3 md:px-6 md:py-3 2xl:px-7 2xl:py-3.5 3xl:px-9 3xl:py-4 4xl:px-12 4xl:py-5 5xl:px-16 5xl:py-7"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              letterSpacing: '0.15em',
              borderColor: accent,
              color: accent,
            }}
          >
            <span className="text-[10px] md:text-[12px] 2xl:text-[14px] 3xl:text-[16px] 4xl:text-[20px] 5xl:text-[30px]">
              View floor plans
            </span>
          </button>
        )}

        {/* Masked so the number rises into view rather than just fading. */}
        <div className={`overflow-hidden ${hasFloors ? '' : 'hidden'}`}>
          <p
            key={hoveredFloor ?? 'none'}
            ref={numberRef}
            className="leading-[0.9] tabular-nums"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: accent,
              visibility: hoveredFloor == null ? 'hidden' : undefined,
            }}
          >
            {/* Explicit width query rather than a breakpoint variant: this
                project's theme defines md upward only, and the widest tower
                (Skyleap's twin wings) reaches the readout on a 320px screen. */}
            <span className="text-[52px] [@media(max-width:360px)]:text-[38px] md:text-[88px] 2xl:text-[112px] 3xl:text-[136px] 4xl:text-[176px] 5xl:text-[260px]">
              {hoveredFloor ?? 0}
            </span>
          </p>
        </div>
      </div>

      {/* Back + Home, matching the tower detail header exactly. */}
      <div className="absolute left-5 top-3 z-40 flex items-center gap-2 md:left-8 md:top-4 lg:left-10 lg:gap-1.5 xl:left-14 xl:top-5 xl:gap-2 2xl:left-15 2xl:top-6 2xl:gap-2.5 3xl:left-18 3xl:top-8 3xl:gap-3 4xl:left-24 4xl:top-10 4xl:gap-4 5xl:left-36 5xl:top-14 5xl:gap-6">
        <button
          type="button"
          aria-label="Back to tower"
          onClick={() => exitWith(onBack)}
          className="grid h-9 w-9 place-items-center transition-opacity hover:opacity-60 lg:h-7 lg:w-7 xl:h-9 xl:w-9 2xl:h-10 2xl:w-10 3xl:h-12 3xl:w-12 4xl:h-14 4xl:w-14 5xl:h-20 5xl:w-20"
        >
          <img
            src="/about/icon-arrow-left.svg"
            alt=""
            className="h-5 w-5 lg:h-4 lg:w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 3xl:h-7 3xl:w-7 4xl:h-8 4xl:w-8 5xl:h-12 5xl:w-12"
          />
        </button>
        <button
          type="button"
          aria-label="Go to homepage"
          onClick={() => exitTo('/')}
          className="grid h-9 w-9 place-items-center transition-opacity hover:opacity-60 lg:h-7 lg:w-7 xl:h-9 xl:w-9 2xl:h-10 2xl:w-10 3xl:h-12 3xl:w-12 4xl:h-14 4xl:w-14 5xl:h-20 5xl:w-20"
        >
          <img
            src="/about/icon-home.svg"
            alt=""
            className="h-5 w-5 lg:h-4 lg:w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 3xl:h-7 3xl:w-7 4xl:h-8 4xl:w-8 5xl:h-12 5xl:w-12"
          />
        </button>
      </div>
    </div>
  )
}

export default TowerElevation
