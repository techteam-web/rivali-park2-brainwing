import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import * as stargazeViews from '../../data/stargazeViews'
import * as moonriseViews from '../../data/moonriseViews'

// Per-tower panorama manifests (each exposes floorsForPosition + viewImage over
// its own /unit/views assets). Towers without panoramas are simply absent, so
// the viewer falls back to "coming soon".
const VIEW_SOURCES = {
  stargaze: stargazeViews,
  moonrise: moonriseViews,
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// "1ST FLOOR", "2ND FLOOR", "23RD FLOOR", "25TH FLOOR" — handles the 11/12/13
// exceptions correctly.
const ordinal = (n) => {
  const s = ['TH', 'ST', 'ND', 'RD']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
}

// Bottom-right floor selector. Opens UPWARD (a "drop-up") so the list never
// runs off the bottom of the screen; the keyboard_arrow_up glyph flips to point
// down while open. Only floors where this apartment exists (has a panorama) are
// listed — sold-out floors are absent. Styling mirrors the Figma "Tab".
const FloorSelect = ({ value, floors, onChange }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="pointer-events-auto absolute bottom-10 right-10 w-[15.1vw] min-w-50 max-w-65">
      {open && (
        <ul
          role="listbox"
          className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-10 max-h-72 overflow-auto rounded-sm border-[0.5px] border-[rgba(122,72,51,0.2)] bg-[#FAF9F6] py-1 shadow-[0_-8px_24px_rgba(0,0,0,0.18)]"
        >
          {floors.map((f) => {
            const isSelected = f === value
            return (
              <li key={f} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onChange(f)
                  }}
                  className={`w-full cursor-pointer px-5 py-2.5 text-center uppercase transition-colors hover:bg-on-light-highlight-brown ${
                    isSelected ? 'bg-on-light-highlight-brown' : ''
                  }`}
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: 15,
                    letterSpacing: '0.1em',
                    color: '#7A4833',
                  }}
                >
                  {ordinal(f)} Floor
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border-[0.5px] border-[rgba(122,72,51,0.2)] bg-[#FAF9F6] px-6 py-5 transition-[box-shadow,transform] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] active:scale-[0.98]"
      >
        <span
          className="uppercase"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            fontSize: 18,
            letterSpacing: '0.1em',
            color: '#7A4833',
          }}
        >
          {ordinal(value)} Floor
        </span>
        <img
          src="/unit plan/svgs/keyboard_arrow_up.svg"
          alt=""
          className={`h-7 w-7 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  )
}

// Latest cursor X, tracked app-wide from module load so a freshly opened (or
// floor-switched) panorama can lay out at the cursor's current position instead
// of starting at the left edge and sweeping over. Passive + window-level, so it
// costs nothing and is already current before the image lays out.
let lastPointerX = null
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      lastPointerX = e.clientX
    },
    { passive: true },
  )
}

// One stacked panorama image. Starts invisible and reports its element up once
// the bitmap is ready (covering the cached case, where onLoad may not re-fire),
// so the parent can settle it to the cursor and crossfade it in.
const Slide = ({ src, onReady }) => {
  const ref = useRef(null)
  const firedRef = useRef(false)

  const fire = () => {
    const img = ref.current
    if (firedRef.current || !img) return
    firedRef.current = true
    onReady(img)
  }

  useEffect(() => {
    const img = ref.current
    if (img && img.complete && img.naturalWidth) fire()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <img
      ref={ref}
      src={src}
      alt=""
      draggable={false}
      onLoad={fire}
      style={{ opacity: 0 }}
      className="absolute inset-0 h-full w-auto max-w-none select-none will-change-transform"
    />
  )
}

// The wide stitched panorama, sized to the full screen height so it overflows
// horizontally. Moving the cursor left/right pans across it (cursor at the left
// edge shows the left of the image, right edge shows the right); a GSAP quickTo
// eases the pan so it glides instead of snapping.
//
// Switching floors layers the new image over the old and crossfades it in (a
// soft blur + gentle settle), then prunes the spent layers — so changing floors
// reads as one continuous, premium dissolve rather than a hard cut.
const Panorama = ({ src }) => {
  const wrapRef = useRef(null)
  const xToRef = useRef(null)
  const overflowRef = useRef(0)
  const activeImgRef = useRef(null)
  const latestIdRef = useRef(0)

  const [layers, setLayers] = useState(() => [{ id: 0, src, fade: false }])

  // Append a new layer whenever the source changes (this effect also runs on
  // mount, where src already matches the seed layer — so it no-ops). The new id
  // is derived purely from the current layers (last id + 1). It must NOT come
  // from a mutating counter inside this updater: React StrictMode double-invokes
  // state updaters to surface impure side effects, and mutating a ref there
  // desynced the committed layer's id from latestIdRef by one — which then made
  // handleReady skip setActive on the 2nd+ floor switch, freezing the pan. A
  // pure updater is immune to the double-invoke.
  useEffect(() => {
    // Appending a crossfade layer when the source changes is exactly what this
    // effect is for (the panorama stacks the new floor over the old and
    // dissolves), so the set-state-in-effect rule doesn't apply here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLayers((ls) => {
      if (ls[ls.length - 1].src === src) return ls
      const id = ls[ls.length - 1].id + 1
      return [...ls, { id, src, fade: true }]
    })
  }, [src])

  // The newest layer's id — the only layer allowed to become the live pan
  // target. Synced from committed state in a layout effect (runs before a
  // freshly-mounted Slide reports its image ready), so handleReady always sees
  // the correct latest id.
  useLayoutEffect(() => {
    latestIdRef.current = layers[layers.length - 1].id
  }, [layers])

  // Fraction (0-1) of the pan range for a given viewport X.
  const fracForX = useCallback((clientX) => {
    const wrap = wrapRef.current
    if (!wrap) return 0
    const r = wrap.getBoundingClientRect()
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width))
  }, [])

  // Make `img` the live pan target: measure its overrun, wire a fresh quickTo,
  // and snap it to wherever the cursor already is (so it never opens on the left
  // and races across).
  const setActive = useCallback(
    (img) => {
      const wrap = wrapRef.current
      if (!wrap || !img) return
      activeImgRef.current = img
      overflowRef.current = Math.max(0, img.offsetWidth - wrap.clientWidth)
      xToRef.current = prefersReducedMotion()
        ? (v) => gsap.set(img, { x: v })
        : gsap.quickTo(img, 'x', { duration: 0.6, ease: 'power3.out' })
      const x =
        lastPointerX == null ? 0 : -fracForX(lastPointerX) * overflowRef.current
      gsap.set(img, { x })
    },
    [fracForX],
  )

  const handleReady = useCallback(
    (id, fade, img) => {
      if (!img) return
      if (id === latestIdRef.current) setActive(img)
      if (!fade || prefersReducedMotion()) {
        gsap.set(img, { autoAlpha: 1 })
        return
      }
      // Premium dissolve: ease out of a soft blur + a hair of scale, then drop
      // the layers underneath it.
      gsap.fromTo(
        img,
        { autoAlpha: 0, filter: 'blur(14px)', scale: 1.035 },
        {
          autoAlpha: 1,
          filter: 'blur(0px)',
          scale: 1,
          duration: 1.1,
          ease: 'power2.out',
          onComplete: () => setLayers((ls) => ls.filter((l) => l.id >= id)),
        },
      )
    },
    [setActive],
  )

  // Keep the active image pinned to the cursor across viewport resizes.
  useEffect(() => {
    const onResize = () => {
      const img = activeImgRef.current
      const wrap = wrapRef.current
      if (!img || !wrap) return
      overflowRef.current = Math.max(0, img.offsetWidth - wrap.clientWidth)
      const x =
        lastPointerX == null ? 0 : -fracForX(lastPointerX) * overflowRef.current
      gsap.set(img, { x })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [fracForX])

  const handleMove = (e) => {
    if (!xToRef.current || overflowRef.current <= 0) return
    xToRef.current(-fracForX(e.clientX) * overflowRef.current)
  }

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMove}
      className="absolute inset-0 cursor-ew-resize overflow-hidden bg-[#23211E]"
    >
      {layers.map((layer) => (
        <Slide
          key={layer.id}
          src={layer.src}
          onReady={(img) => handleReady(layer.id, layer.fade, img)}
        />
      ))}
    </div>
  )
}

// Fullscreen courtyard-view viewer, opened from the "Courtyard View" link on a
// unit. `position` is the floor-plan unit number (1-6); the apartment shown is
// floor*100 + position, drawn from `tower`'s panorama manifest. The floor
// drop-up lists only floors where that apartment is available. Layout matches
// PlanLightbox: the raggedy white tear IS the header (title + close on its solid
// top band).
//
// Rendered outside the scaled <UnitArtboard> so it covers the real viewport. It
// rises forward out of a soft blur on open and eases back on close (matching the
// gallery / plan-lightbox transition feel).
const CourtyardView = ({ title, tower, position, onClose, onHome }) => {
  const rootRef = useRef(null)
  const closingRef = useRef(false)
  const views = VIEW_SOURCES[tower] ?? null
  const floors = views && position ? views.floorsForPosition(position) : []
  const [floor, setFloor] = useState(() => floors[0] ?? null)
  const src = views && floor != null ? views.viewImage(floor, position) : null

  // Warm the browser cache for every floor's panorama the moment the viewer
  // opens, so switching floors is instant instead of waiting on a ~2MB download
  // (an uncached image can otherwise still be loading when you pan, reading as
  // "stuck on the left"). Purely a prefetch — it does not touch the pan /
  // crossfade engine below.
  useEffect(() => {
    if (!views || !position) return
    const preloaded = views
      .floorsForPosition(position)
      .map((f) => views.viewImage(f, position))
      .filter(Boolean)
      .map((s) => {
        const img = new Image()
        img.src = s
        return img
      })
    return () => preloaded.forEach((img) => (img.src = ''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tower, position])

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el || prefersReducedMotion()) return
    gsap.set(el, { autoAlpha: 0, scale: 0.985, filter: 'blur(10px)' })
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el || prefersReducedMotion()) return
    const tl = gsap.timeline()
    tl.to(el, {
      autoAlpha: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.85,
      ease: 'power2.out',
    })
    return () => tl.kill()
  }, [])

  // Shared exit choreography for both Close (return to the unit sheet) and
  // Home (jump to the homepage) — same fade/scale/blur, different onDone.
  const runExit = useCallback(
    (onDone) => {
      if (closingRef.current) return
      const el = rootRef.current
      if (!el || prefersReducedMotion()) {
        onDone()
        return
      }
      closingRef.current = true
      gsap.to(el, {
        autoAlpha: 0,
        scale: 1.015,
        filter: 'blur(10px)',
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: onDone,
      })
    },
    [],
  )

  const handleClose = useCallback(() => runExit(onClose), [runExit, onClose])
  const handleHome = useCallback(() => runExit(onHome), [runExit, onHome])

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 overflow-hidden bg-[#23211E]">
      {/* Panorama stage — stays mounted across floor changes so it can crossfade
          internally. Falls back to a flat dark fill when no view exists. */}
      {src ? (
        <Panorama src={src} />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[#23211E] px-12 text-center">
          <p
            className="uppercase"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              fontSize: 16,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            Panoramic view coming soon
          </p>
        </div>
      )}

      {/* Torn white edge = the header (same vector + sizing as PlanLightbox). */}
      <img
        src="/unit plan/svgs/raggedy edge svg.svg"
        alt=""
        className="pointer-events-none absolute left-1/2 top-0 h-[7.8vw] w-[225%] max-w-none -translate-x-1/2 select-none"
      />

      {/* Title + close overlaid on the raggedy's solid top band. */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex h-[5.5vw] items-center justify-center px-12">
        <h2
          className="uppercase"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            fontSize: 24,
            lineHeight: '120%',
            letterSpacing: '0.12em',
            color: '#313131',
          }}
        >
          {title}
        </h2>
        <div className="pointer-events-auto absolute right-12 top-1/2 flex -translate-y-1/2 items-center gap-3">
          <button
            type="button"
            aria-label="Go to homepage"
            onClick={handleHome}
            className="grid h-8 w-8 cursor-pointer place-items-center transition-[opacity,transform] hover:opacity-60 active:scale-90"
          >
            <img src="/unit/svgs/home.svg" alt="" className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="grid h-8 w-8 cursor-pointer place-items-center transition-[opacity,transform] hover:opacity-60 active:scale-90"
          >
            <img src="/unit/svgs/close cross.svg" alt="" className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {floor != null && (
        <FloorSelect value={floor} floors={floors} onChange={setFloor} />
      )}
    </div>
  )
}

export default CourtyardView
