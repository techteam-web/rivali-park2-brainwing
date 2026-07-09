import { locationsConfig } from './locationsConfig'

const p = locationsConfig.buildingPulse

// Shared uniform refs attached to every patched building material, so one update
// drives all towers in sync. uPulsePhase is the flow position in [0,1), advanced and
// wrapped on the CPU each frame by MainBuildingRig (kept small so it stays float32-
// precise even on multi-day kiosk uptime, unlike an ever-growing elapsed time).
// uMinY/uMaxY are the building's world-space Y bounds, set at load by MainBuildingRig.
export const buildingPulseUniforms = {
  uPulsePhase: { value: 0 },
  uMinY: { value: 0 },
  uMaxY: { value: 1 },
  uPulseWidth: { value: p.bandWidth },
  uPulseIntensity: { value: p.intensity },
}

const pulseParsFrag = /* glsl */ `
#include <common>
uniform float uPulsePhase;
uniform float uMinY;
uniform float uMaxY;
uniform float uPulseWidth;
uniform float uPulseIntensity;
varying vec3 vWorldPosPulse;
`

// Injected BEFORE tonemapping_fragment. Under the /locations EffectComposer the
// scene renders to an HDR (HalfFloat) target with tone mapping forced off, so this
// linear add survives as a value > 1.0 into Bloom's luminance test and glows.
// Source is the material's own base color (diffuse), so the pulse is each tower's
// PURE assigned color, HDR-bright and lighting-independent, only within the band.
const pulseFrag = /* glsl */ `
// normalized height 0 (base) .. 1 (top)
float h = clamp((vWorldPosPulse.y - uMinY) / max(uMaxY - uMinY, 0.0001), 0.0, 1.0);
// band center scrolls up continuously and loops - no pause, no reset jump.
// uPulsePhase is advanced+wrapped to [0,1) on the CPU (MainBuildingRig).
float head = fract(uPulsePhase);
// toroidal distance: the band leaves the top and re-enters the base seamlessly,
// so the flow is smooth and continuous with no discontinuity at the wrap
float d = fract(h - head);
float band = smoothstep(uPulseWidth, 0.0, min(d, 1.0 - d));
// add the tower's OWN pure base color, HDR-bright, within the flowing band
gl_FragColor.rgb += diffuse * band * uPulseIntensity;
#include <tonemapping_fragment>
`

// Stable module-scope patch. Same reference on every material => no recompile churn.
export function patchBuildingPulse(shader) {
  shader.uniforms.uPulsePhase = buildingPulseUniforms.uPulsePhase
  shader.uniforms.uMinY = buildingPulseUniforms.uMinY
  shader.uniforms.uMaxY = buildingPulseUniforms.uMaxY
  shader.uniforms.uPulseWidth = buildingPulseUniforms.uPulseWidth
  shader.uniforms.uPulseIntensity = buildingPulseUniforms.uPulseIntensity

  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vWorldPosPulse;')
    .replace(
      '#include <worldpos_vertex>',
      '#include <worldpos_vertex>\nvWorldPosPulse = (modelMatrix * vec4(transformed, 1.0)).xyz;',
    )

  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', pulseParsFrag)
    .replace('#include <tonemapping_fragment>', pulseFrag)
}
