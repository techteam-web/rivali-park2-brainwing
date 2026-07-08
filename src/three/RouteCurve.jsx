import { useMemo, useEffect, useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { gsap, useGSAP } from '../gsap/Gsapconfig'
import { getLocationPath } from '../components/locations/locationsPaths'
import { locationsConfig } from './locationsConfig'
import RouteMarker from '../assets/locations/svgs/route-marker.svg?react'

// One animated route line for the /locations map (RouteLayer mounts one per shown location in
// a category). It builds a centripetal Catmull-Rom curve through the location's captured
// world-space road points (getLocationPath) and bakes it into a TubeGeometry so it reads as a
// 3D route on the ground. A small unlit ShaderMaterial reveals the tube start->end (uProgress)
// with a continuously scrolling cream->brown gradient (uPulseHead), plus a destination pin.
// The `phase` prop drives it: 'in' reveals + holds, 'out' retracts end->start then calls
// onExited so RouteLayer can unmount it. GSAP drives the uniforms; no per-frame useFrame.
// Mounted at Canvas root (sibling of RivaliMap) so the world-space points are not shifted a
// second time by RivaliMap's recenter. Returns null if the location has no captured path.
const r = locationsConfig.route

const vertexShader = /* glsl */ `
  varying float vT;                       // along-curve 0..1 = TubeGeometry uv.x
  void main() {
    vT = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uProgress;                // draw-on front
  uniform vec3  uColor;
  uniform vec3  uPulseColor;
  uniform float uPulseHead;               // gradient scroll position 0..1
  uniform float uOpacity;
  varying float vT;
  void main() {
    if (vT > uProgress) discard;          // reveal up to the draw-on front

    // traveling cream->brown gradient. uPulseHead scrolls 0..1 (existing looping tween).
    // fract() makes one cycle span the line and wrap seamlessly; the cosine is C1-continuous,
    // so cream meets cream at the seam (g=0 at coord 0 and 1) with a single smooth rise to
    // brown at the half cycle -- both colors always on the line, no jump, no blob.
    float coord = fract(vT - uPulseHead);
    float g = 0.5 - 0.5 * cos(coord * 6.2831853);   // 0 at coord 0, 1 at 0.5, back to 0 at 1
    vec3 col = mix(uColor, uPulseColor, g);
    gl_FragColor = vec4(col, uOpacity);
  }
`

function makeRouteMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uProgress: { value: 0 },
      uColor: { value: new THREE.Color(r.color) },
      uPulseColor: { value: new THREE.Color(r.pulseColor) },
      uPulseHead: { value: 0 },
      uPulseWidth: { value: r.pulseWidth },
      uOpacity: { value: r.opacity },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false, // no self-occlusion of the thin tube
    // depthTest defaults true: route is correctly occluded behind buildings/terrain
  })
}

function buildRouteCurve(points) {
  // Dedupe near-coincident points: centripetal Catmull-Rom divides by the gap
  // between consecutive points and yields NaN (blank curve) on duplicates.
  const vecs = []
  for (const p of points) {
    const v = new THREE.Vector3(p[0], p[1], p[2])
    const last = vecs[vecs.length - 1]
    if (last && last.distanceToSquared(v) < 0.01 * 0.01) continue
    vecs.push(v)
  }
  if (vecs.length < 2) return null
  return new THREE.CatmullRomCurve3(vecs, false, 'centripetal')
}

export default function RouteCurve({ locationId, phase = 'in', onExited }) {
  // Inner div of the destination pin; GSAP pop-in target.
  const markerRef = useRef(null)

  // Material built once and reused across routes; its uniforms object is a stable
  // GSAP target. Disposed on unmount (mirrors TowerDepthPlane's material lifecycle,
  // which is proven under this app's StrictMode).
  const material = useMemo(() => makeRouteMaterial(), [])
  useEffect(() => () => material.dispose(), [material])

  // Rebuild only the CURVE per route (keyed on locationId). The TubeGeometry is a
  // JSX <tubeGeometry> primitive below, so R3F owns its creation AND disposal: it
  // disposes the old geometry when args (the curve ref) change and on unmount. This
  // is the repo convention (no manual geometry.dispose() exists anywhere) and is safe
  // under React StrictMode's mount/cleanup/mount, which a hand-rolled useMemo(geometry)
  // plus dispose effect is not (it can dispose then reuse the same ref).
  const points = locationId ? getLocationPath(locationId) : null
  const curve = useMemo(
    () => (points ? buildRouteCurve(points) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locationId],
  )

  // Continuous cream->brown gradient scroll. Independent of phase (never restarted on a
  // phase change), so it keeps flowing while the route reveals, holds, or retracts. useGSAP
  // reverts it only on unmount, which is fine here.
  useGSAP(
    () => {
      if (!curve) return
      gsap.to(material.uniforms.uPulseHead, { value: 1, duration: r.pulseDuration, ease: 'none', repeat: -1 })
    },
    { dependencies: [locationId] },
  )

  // Phase-driven reveal/retract + pin. Manual gsap (NOT useGSAP) so tweens are killed in place
  // on a phase change and animate uProgress from its CURRENT value: useGSAP reverts its tweens
  // to their START on a dep change, which would snap uProgress to 0 (completed draw-on) or 1
  // and break the retract/reverse. useLayoutEffect matches useGSAP's pre-paint timing so the
  // pin's initial hidden state applies before paint (no flash). Mirrors TowerDepthPlane's
  // gsap.to + killTweensOf pattern.
  useLayoutEffect(() => {
    if (!curve) return
    const u = material.uniforms
    const marker = markerRef.current
    gsap.killTweensOf(u.uProgress)
    if (marker) gsap.killTweensOf(marker)
    if (phase === 'out') {
      // Retract end->start, then report exit so RouteLayer unmounts + disposes this route.
      // PERF fallback (do NOT apply now): if the ~10-route peak stutters, make 'out' a fast
      // autoAlpha fade of the material/marker instead of a uProgress retract (much cheaper).
      gsap.to(u.uProgress, { value: 0, duration: r.drawDuration, ease: 'power2.in', onComplete: () => onExited?.(locationId) })
      if (marker) gsap.to(marker, { autoAlpha: 0, scale: 0.6, duration: 0.3, ease: 'power2.in' })
    } else {
      gsap.to(u.uProgress, { value: 1, duration: r.drawDuration, ease: 'power2.out' })
      // Pin drops in as the draw-on reaches the end; grows up from its tip.
      if (marker) {
        gsap.fromTo(
          marker,
          { autoAlpha: 0, scale: 0.6 },
          { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', delay: r.drawDuration },
        )
      }
    }
    return () => {
      gsap.killTweensOf(u.uProgress)
      if (marker) gsap.killTweensOf(marker)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, phase])

  if (!curve) return null
  const tubular = Math.max(64, curve.points.length * 8)
  const end = points[points.length - 1] // [x, y, z]; points is non-null whenever curve is
  return (
    <>
      <mesh
        material={material}
        position={[0, r.yOffset, 0]} // lift above ground to avoid z-fighting
        renderOrder={999} // draw after opaque plus transparent water
      >
        <tubeGeometry args={[curve, tubular, r.tubeRadius, r.radialSegments, false]} />
      </mesh>
      {/* Destination pin at the curve end. Constant screen size (no distanceFactor),
          always visible (no occlude), and non-interactive so it never blocks orbit. The
          outer div bottom-center-anchors so the pin tip lands on the end point. */}
      <Html position={[end[0], end[1] + r.markerYOffset, end[2]]} zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{ transform: 'translate(-50%, -100%)' }}>
          <div ref={markerRef} style={{ width: r.markerWidthPx, transformOrigin: 'bottom center' }}>
            <RouteMarker style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>
      </Html>
    </>
  )
}
