import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import { usePanoramaSync } from '../../hooks/usePanoramaSync'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

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
// so the parent can settle it to the cursor and crossfade it in. `sizeToCover`
// is applied first so the reported element already has its final cover-fit
// dimensions (see Panorama's sizeToCover for why this can't be plain CSS).
const Slide = ({ src, sizeToCover, onReady }) => {
  const ref = useRef(null)
  const firedRef = useRef(false)

  const fire = () => {
    const img = ref.current
    if (firedRef.current || !img) return
    firedRef.current = true
    sizeToCover(img)
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
      className="absolute left-0 max-w-none select-none will-change-transform"
    />
  )
}

// The wide stitched panorama, sized to the full height of its wrapper so it
// overflows horizontally. Moving the cursor left/right pans across it (cursor
// at the left edge shows the left of the image, right edge shows the right) —
// broadcast through the enclosing <PanoramaSyncProvider> rather than applied
// directly, so every Panorama sharing that provider pans in lockstep. A GSAP
// quickTo eases each instance's own pan so it glides instead of snapping.
//
// Switching floors (`src` changes) layers the new image over the old and
// crossfades it in (a soft blur + gentle settle), then prunes the spent
// layers — so changing floors reads as one continuous, premium dissolve
// rather than a hard cut.
const Panorama = ({ src }) => {
  const { register, broadcast } = usePanoramaSync()
  const id = useId()
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

  // Cover-fit an image to the wrap: scale it up so it's at least as tall AND
  // at least as wide as the wrap (like CSS object-fit: cover), computed from
  // its natural pixel size rather than left to height:100%/width:auto CSS.
  // That CSS-only approach silently leaves a gap when a panorama's natural
  // aspect ratio is too narrow to fill a SHORT wrap (e.g. a compare-page
  // card) purely by matching its height — unlike the roomy fullscreen viewer,
  // where every panorama is wide enough relative to the viewport that this
  // never came up. When width ends up the constrained dimension there's no
  // horizontal overflow to pan across, which is correct: covering fully
  // means nothing is hidden off to either side to pan toward.
  const sizeToCover = useCallback((img) => {
    const wrap = wrapRef.current
    if (!wrap || !img.naturalWidth || !img.naturalHeight) return
    const scale = Math.max(
      wrap.clientHeight / img.naturalHeight,
      wrap.clientWidth / img.naturalWidth,
    )
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    img.style.width = `${w}px`
    img.style.height = `${h}px`
    img.style.top =
      h > wrap.clientHeight ? `${-(h - wrap.clientHeight) / 2}px` : '0px'
  }, [])

  // Fraction (0-1) of the pan range for a given viewport X, relative to THIS
  // instance's own wrapper.
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

  // Keep the active image cover-sized and pinned to the cursor across
  // viewport resizes (the wrap's own dimensions changed, so the cover-fit
  // scale has to be recomputed, not just the pan offset).
  useEffect(() => {
    const onResize = () => {
      const img = activeImgRef.current
      const wrap = wrapRef.current
      if (!img || !wrap) return
      sizeToCover(img)
      overflowRef.current = Math.max(0, img.offsetWidth - wrap.clientWidth)
      const x =
        lastPointerX == null ? 0 : -fracForX(lastPointerX) * overflowRef.current
      gsap.set(img, { x })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [fracForX, sizeToCover])

  // Apply an externally-broadcast fraction to THIS instance's active image,
  // using its own overflow — this is what actually moves the picture.
  const applyFraction = useCallback((frac) => {
    if (!xToRef.current || overflowRef.current <= 0) return
    xToRef.current(-frac * overflowRef.current)
  }, [])

  useEffect(() => register(id, applyFraction), [register, id, applyFraction])

  const handleMove = (e) => broadcast(fracForX(e.clientX))

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
          sizeToCover={sizeToCover}
          onReady={(img) => handleReady(layer.id, layer.fade, img)}
        />
      ))}
    </div>
  )
}

export default Panorama
