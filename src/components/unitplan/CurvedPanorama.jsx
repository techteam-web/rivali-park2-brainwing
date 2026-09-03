import { useEffect, useId, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from '../../lib/gsap'
import { usePanoramaSync } from '../../hooks/usePanoramaSync'

// Curved-projection panorama viewer — the viewer for every apartment view, on
// the unit detail page and on the compare screen.
//
// Why this exists: the stitched frames are 5.2:1 to 5.8:1, so cover-fitting one
// into a ~1.9:1 viewport crops away roughly two thirds of its width. What's left
// reads as an over-zoomed close-up pressed flat against the glass.
//
// Here the strip is mapped onto the INSIDE of a wide, shallow band of a sphere
// and viewed from its centre, which buys two things:
//   1. it sits further back, so meaningfully more of the frame fits on screen, and
//   2. the surface is concave — its edges wrap towards you while the centre
//      falls away, which is the parallax you get looking out of a real opening.
// Moving the cursor turns the camera inside that band rather than sliding a flat
// image sideways. Cursor left edge -> left end of the panorama, right edge ->
// right end, exactly as the flat viewer behaves, so the interaction is unchanged.

/** Degrees of the viewer's surroundings the strip is wrapped across. This is
 *  purely how CURVED it looks — it does not affect how much is visible at rest
 *  (that's REVEAL below). Larger = a deeper, more enveloping window. */
const H_SPAN_DEG = 112

/** How much more of the frame's width is visible than a plain cover fit. This
 *  is the one real lever: the strip gives up 1/REVEAL of the viewport height in
 *  exchange, which is why the panorama floats on paper rather than bleeding to
 *  the edges. 1.35 => ~26% more width, strip fills ~74% of the height. */
const REVEAL = 1.35

/** Vertical hover travel. Small on purpose — these frames are shallow, so a big
 *  pitch swing just walks off the top or bottom of the strip. */
const MAX_PITCH_DEG = 3.2

/** Keep the traverse just inside the feathered edge so you never pan into the
 *  fade at the extreme ends. */
const TRAVERSE = 0.96

const RADIUS = 100
const DEG = Math.PI / 180

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Latest cursor position, tracked app-wide from module load for the same reason
// Panorama.jsx does it: a freshly opened (or floor-switched) panorama can then
// lay out at wherever the cursor already is, instead of starting centred and
// sweeping across to meet it.
let lastPointerX = null
let lastPointerY = null
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      lastPointerX = e.clientX
      lastPointerY = e.clientY
    },
    { passive: true },
  )
}

// Soft alpha falloff on all four edges so the strip dissolves into the white
// page instead of ending on a hard rectangle. Horizontal feather is kept
// tighter than vertical because the cursor traverses across it.
const makeFeatherMap = () => {
  const w = 512
  const h = 128
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, h)

  const edge = (gradient, stops) => {
    stops.forEach(([at, a]) => gradient.addColorStop(at, `rgba(0,0,0,${a})`))
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
  }

  edge(ctx.createLinearGradient(0, 0, w, 0), [
    [0, 1],
    [0.035, 0],
    [0.965, 0],
    [1, 1],
  ])
  edge(ctx.createLinearGradient(0, 0, 0, h), [
    [0, 1],
    [0.1, 0],
    [0.9, 0],
    [1, 1],
  ])

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

const CurvedPanorama = ({ src }) => {
  const wrapRef = useRef(null)
  const engineRef = useRef(null)
  // Compare shows up to three of these side by side and pans them together, so
  // the cursor's position is broadcast as a FRACTION of this element rather
  // than applied here directly. Each viewer then turns that fraction through
  // its own yaw range, which is what keeps panels of different widths tracking
  // the same relative point. A lone viewer is a group of one and behaves
  // exactly as if unsynced. See PanoramaSyncProvider.
  const id = useId()
  const { register, broadcast } = usePanoramaSync()
  const broadcastRef = useRef(broadcast)
  useEffect(() => {
    broadcastRef.current = broadcast
  }, [broadcast])

  // Build the renderer once and tear it down completely on unmount. This view
  // is a modal that opens and closes repeatedly, and the app already holds
  // several WebGL contexts (locations, towers, the Marzipano tour) — leaking one
  // per open would eventually hit the browser's context cap and silently kill
  // the oldest canvas.
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const canvas = document.createElement('canvas')
    canvas.className = 'absolute inset-0 h-full w-full'
    wrap.appendChild(canvas)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      // Nothing here needs either: the only geometry is one mesh whose edges are
      // alpha-feathered (so MSAA has no silhouette to smooth and would only cost
      // a large multisampled buffer), and layers are drawn in explicit order.
      antialias: false,
      depth: false,
      stencil: false,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    camera.rotation.order = 'YXZ'

    const feather = makeFeatherMap()
    const loader = new THREE.TextureLoader()

    let layers = [] // oldest first; the last one is live
    let latestSrc = null // newest REQUESTED frame, to reject stale loads
    let order = 0
    let fading = 0
    let maxYaw = 0
    let yaw = 0
    let pitch = 0
    let targetYaw = 0
    let targetPitch = 0
    let dirty = true
    let raf = 0

    const wake = () => {
      dirty = true
    }

    const active = () => layers[layers.length - 1] ?? null

    // Re-derive the camera framing from the LIVE layer. Every frame in this
    // series has its own width (7527 to 8303 px), so the vertical span differs
    // per image and the fov has to follow it — a hard-coded aspect would squash
    // or stretch them against each other.
    const frame = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (!w || !h) return
      const aspect = w / h
      const live = active()

      if (live) {
        const vSpanDeg = live.userData.vSpanDeg
        const fov = Math.min(vSpanDeg * REVEAL, 80)
        camera.fov = fov
        // Traverse exactly the strip that is off-screen, so the cursor still
        // reaches both ends of the panorama like the flat viewer does.
        const hFovDeg =
          (2 * Math.atan(Math.tan((fov * DEG) / 2) * aspect)) / DEG
        maxYaw =
          Math.max(0, (H_SPAN_DEG - hFovDeg) / 2) * TRAVERSE * DEG
      }

      camera.aspect = aspect
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
      wake()
    }

    // Where the cursor sits inside THIS element, 0-1 on each axis.
    const fractionFor = (clientX, clientY) => {
      const r = wrap.getBoundingClientRect()
      if (!r.width || !r.height) return null
      return {
        fx: Math.min(1, Math.max(0, (clientX - r.left) / r.width)),
        fy: Math.min(1, Math.max(0, (clientY - r.top) / r.height)),
      }
    }

    // Aim from a fraction, using this instance's own yaw range.
    const applyFraction = (f) => {
      if (!f) return
      targetYaw = -(f.fx * 2 - 1) * maxYaw
      targetPitch = -(f.fy * 2 - 1) * MAX_PITCH_DEG * DEG
      wake()
    }

    const disposeLayer = (mesh) => {
      scene.remove(mesh)
      mesh.geometry.dispose()
      mesh.material.map?.dispose()
      mesh.material.dispose()
    }

    // Layer a newly loaded frame over the current one and dissolve it in, then
    // drop everything underneath. Two stacked meshes cost one extra draw call
    // for the duration of the fade only — and unlike the flat viewer's animated
    // CSS blur, nothing has to be re-rasterised per frame.
    const show = (url) => {
      latestSrc = url
      loader.load(url, (texture) => {
        // Stepping through floors quickly can land these out of order (they're
        // already warm in the HTTP cache, so a later request can resolve first).
        // Anything that is no longer the requested frame is dropped, otherwise a
        // slow earlier load would stack on top and contradict the floor label.
        if (url !== latestSrc) {
          texture.dispose()
          return
        }

        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
        texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.magFilter = THREE.LinearFilter
        // Seen from inside the sphere the mapping is mirrored, so flip u back.
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.repeat.x = -1
        texture.offset.x = 1

        const imgAspect =
          (texture.image?.width || 1) / (texture.image?.height || 1)
        const hSpan = H_SPAN_DEG * DEG
        const vSpan = hSpan / imgAspect

        const geometry = new THREE.SphereGeometry(
          RADIUS,
          128,
          48,
          // centre the band on -Z, which is where the camera looks by default
          -Math.PI / 2 - hSpan / 2,
          hSpan,
          Math.PI / 2 - vSpan / 2,
          vSpan,
        )
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          alphaMap: feather,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
          depthTest: false,
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.userData.vSpanDeg = vSpan / DEG
        mesh.renderOrder = ++order

        const isFirst = layers.length === 0
        material.opacity = isFirst ? 1 : 0
        scene.add(mesh)
        const outgoing = layers
        layers = [...layers, mesh]

        frame()

        // Open wherever the cursor already is rather than easing over to it.
        if (isFirst) {
          if (lastPointerX != null && lastPointerY != null) {
            applyFraction(fractionFor(lastPointerX, lastPointerY))
          }
          yaw = targetYaw
          pitch = targetPitch
        }

        if (isFirst || prefersReducedMotion()) {
          material.opacity = 1
          outgoing.forEach(disposeLayer)
          layers = [mesh]
          wake()
          return
        }

        fading += 1
        gsap.to(material, {
          opacity: 1,
          duration: 0.9,
          ease: 'power2.out',
          onUpdate: wake,
          onComplete: () => {
            fading -= 1
            // Drop only what THIS fade covered. A faster floor switch may have
            // already stacked another layer on top; that one prunes itself.
            outgoing.forEach(disposeLayer)
            layers = layers.filter((l) => !outgoing.includes(l))
            wake()
          },
        })
      })
    }

    const onPointerMove = (e) => {
      const f = fractionFor(e.clientX, e.clientY)
      if (f) broadcastRef.current(f)
    }
    // Centre is 0.5/0.5 — broadcast so every synced viewer settles back
    // together rather than leaving the siblings where they were.
    const onPointerLeave = () => broadcastRef.current({ fx: 0.5, fy: 0.5 })

    wrap.addEventListener('pointermove', onPointerMove)
    wrap.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('resize', frame)
    frame()

    // Render on demand. Once the cursor stops and any dissolve has finished
    // there is nothing left to draw, so the loop parks instead of burning a
    // full-screen pass at 60 (or 120) fps for a static picture.
    const tick = () => {
      raf = requestAnimationFrame(tick)

      const dy = targetYaw - yaw
      const dp = targetPitch - pitch
      const moving = Math.abs(dy) > 1e-5 || Math.abs(dp) > 1e-5
      if (!dirty && !moving && fading === 0) return

      yaw += dy * 0.055
      pitch += dp * 0.055

      camera.rotation.y = yaw
      camera.rotation.x = pitch
      renderer.render(scene, camera)
      dirty = false
    }
    raf = requestAnimationFrame(tick)

    engineRef.current = { show, applyFraction }

    return () => {
      engineRef.current = null
      cancelAnimationFrame(raf)
      wrap.removeEventListener('pointermove', onPointerMove)
      wrap.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('resize', frame)
      gsap.killTweensOf(layers.map((l) => l.material))
      layers.forEach(disposeLayer)
      layers = []
      feather.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    }
  }, [])

  // Registered after the engine effect above has run, so applyFraction exists.
  useEffect(
    () => register(id, (f) => engineRef.current?.applyFraction(f)),
    [register, id],
  )

  useEffect(() => {
    if (src) engineRef.current?.show(src)
  }, [src])

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 cursor-ew-resize overflow-hidden bg-white"
    />
  )
}

export default CurvedPanorama
