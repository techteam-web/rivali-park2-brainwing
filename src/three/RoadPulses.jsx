import { useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from '../gsap/Gsapconfig'
import { roadPaths } from '../components/locations/roadPaths'
import { locationsConfig } from './locationsConfig'

// Always-on comet pulses for two roads on the /locations map (WEH amber, metro cyan).
// Each road is one centripetal Catmull-Rom curve through its traced centerline
// (roadPaths.js), baked into a TubeGeometry that sits just above the road. A small
// unlit ShaderMaterial lights a bright HDR comet (sharp head, fading tail) that loops
// along the tube in BOTH directions at once (uHeadA forward, uHeadB reverse), so the
// two pulses pass through each other. The HDR color (intensity > 1) crosses the bloom
// threshold in LocationsCanvas and glows into the air. When a location is selected the
// comets DIM (uDim) so the route line reads clearly. Mounted at Canvas root (sibling of
// RivaliMap) so the world-space centerline points are not shifted by RivaliMap's
// recenter. Mirrors RouteCurve.jsx's curve/tube/material lifecycle conventions.
const rp = locationsConfig.roadPulses

const vertexShader = /* glsl */ `
  varying float vT;                       // along-curve 0..1 = TubeGeometry uv.x
  void main() {
    vT = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3  uColor;
  uniform float uIntensity;               // HDR multiplier so the head blooms
  uniform float uTailLength;              // tail length as a fraction of the line
  uniform float uOpacity;                 // base opacity
  uniform float uDim;                     // multiplier tweened down while selected
  uniform float uHeadA;                   // 0..1 forward comet head
  uniform float uHeadB;                   // 0..1 reverse comet head
  varying float vT;
  void main() {
    // Comet A: bright at the head, fading along the tail BEHIND it (wrap-aware).
    float dA = fract(uHeadA - vT);        // 0 at head, grows backward, wraps at the seam
    float cometA = smoothstep(uTailLength, 0.0, dA);   // 1 at head -> 0 at tail end
    // Comet B travels the other way: measure behind it in the opposite sense.
    float dB = fract(vT - uHeadB);
    float cometB = smoothstep(uTailLength, 0.0, dB);
    float comet = max(cometA, cometB);    // two pulses passing through each other
    vec3 col = uColor * uIntensity * comet;
    gl_FragColor = vec4(col, comet * uOpacity * uDim);
  }
`

function makePulseMaterial(roadCfg, headA, headB) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(roadCfg.color) },
      uIntensity: { value: roadCfg.intensity },
      uTailLength: { value: rp.tailLength },
      uOpacity: { value: rp.baseOpacity },
      uDim: { value: 1 },
      uHeadA: { value: headA },
      uHeadB: { value: headB },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false, // no self-occlusion of the thin tube
    // depthTest defaults true: a comet is occluded where the road passes behind a building
  })
}

function buildRoadCurve(points) {
  // Dedupe near-coincident points: centripetal Catmull-Rom divides by the gap between
  // consecutive points and yields NaN (blank curve) on duplicates. Mirrors RouteCurve.
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

export default function RoadPulses({ selectedLocationId }) {
  // Two materials, one per road (different colors). Their uniforms objects are stable
  // GSAP targets. The head start phases differ per road so the two lines are not
  // synchronized. Disposed on unmount (RouteCurve's proven material lifecycle).
  const wehMat = useMemo(() => makePulseMaterial(rp.weh, 0.0, 0.5), [])
  const metroMat = useMemo(() => makePulseMaterial(rp.metro, 0.37, 0.68), [])
  useEffect(() => () => wehMat.dispose(), [wehMat])
  useEffect(() => () => metroMat.dispose(), [metroMat])

  // Centerlines never change, so build the curves once. The TubeGeometry itself is a
  // JSX <tubeGeometry> primitive below, so R3F owns its creation AND disposal (the repo
  // convention; StrictMode-safe, unlike a hand-rolled useMemo(geometry) + dispose).
  const wehCurve = useMemo(() => buildRoadCurve(roadPaths.weh), [])
  const metroCurve = useMemo(() => buildRoadCurve(roadPaths.metro), [])

  // Advance both comets every frame. uHeadA runs forward, uHeadB the other way; wrap to
  // [0,1) so the float stays precise over a long session. Continuous, never restarts.
  useFrame((_, dt) => {
    const step = rp.speed * dt
    for (const m of [wehMat, metroMat]) {
      m.uniforms.uHeadA.value = (m.uniforms.uHeadA.value + step) % 1
      m.uniforms.uHeadB.value = (m.uniforms.uHeadB.value - step + 1) % 1
    }
  })

  // Dim both roads while a location is selected so the route line reads clearly; restore
  // on deselect. Manual gsap.to + killTweensOf (not useGSAP) so uDim animates from its
  // CURRENT value and a rapid select/deselect does not snap. Mirrors RouteCurve.jsx.
  useEffect(() => {
    const target = selectedLocationId ? rp.dimOpacity : 1
    const uniforms = [wehMat.uniforms.uDim, metroMat.uniforms.uDim]
    for (const u of uniforms) {
      gsap.killTweensOf(u)
      gsap.to(u, { value: target, duration: rp.dimDuration, ease: 'power2.out' })
    }
    return () => {
      for (const u of uniforms) gsap.killTweensOf(u)
    }
  }, [selectedLocationId, wehMat, metroMat])

  if (!wehCurve || !metroCurve) return null
  const wehSeg = Math.max(200, roadPaths.weh.length * 6)
  const metroSeg = Math.max(200, roadPaths.metro.length * 6)
  return (
    <>
      <mesh material={wehMat} position={[0, rp.yOffset, 0]} renderOrder={999}>
        <tubeGeometry args={[wehCurve, wehSeg, rp.tubeRadius, rp.radialSegments, false]} />
      </mesh>
      <mesh material={metroMat} position={[0, rp.yOffset, 0]} renderOrder={999}>
        <tubeGeometry args={[metroCurve, metroSeg, rp.tubeRadius, rp.radialSegments, false]} />
      </mesh>
    </>
  )
}
