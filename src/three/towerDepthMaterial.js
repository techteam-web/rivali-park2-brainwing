import * as THREE from 'three'

export const towerDepthVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const towerDepthFragment = /* glsl */ `
  uniform sampler2D uColor;
  uniform sampler2D uDepth;
  uniform sampler2D uPrevColor;
  uniform sampler2D uPrevDepth;
  uniform vec2  uMouse;
  uniform float uDepthStrength;
  uniform float uTransition;
  uniform float uColorAspect;
  uniform float uPrevColorAspect;
  uniform float uPlaneAspect;
  uniform vec4  uFraming;      // xy = scale, zw = offset (UV units)
  uniform vec4  uPrevFraming;
  uniform vec2  uTexel;
  varying vec2 vUv;

  vec2 mirrored(vec2 v) {
    vec2 m = mod(v, 2.0);
    return mix(m, 2.0 - m, step(1.0, m));
  }

  float hash(vec2 p) {
    p = fract(p * vec2(443.897, 441.423));
    p += dot(p, p.yx + 19.19);
    return fract((p.x + p.y) * p.x);
  }

  // object-fit: cover for textures: maps plane UV [0,1] to a centered sub-range
  // of texture UV so the texture fully fills the plane with crop on the longer
  // axis instead of letterboxing.
  vec2 coverUv(vec2 uv, float planeAspect, float texAspect) {
    vec2 ratio = vec2(
      min(planeAspect / texAspect, 1.0),
      min(texAspect / planeAspect, 1.0)
    );
    return vec2(
      uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
  }

  // per-image scale + offset on top of cover-fit. scale > 1 zooms in,
  // offset.x > 0 shifts the image right, offset.y > 0 shifts it up.
  vec2 applyFraming(vec2 uv, vec4 framing) {
    vec2 scale  = framing.xy;
    vec2 offset = framing.zw;
    return (uv - 0.5) / scale + 0.5 - offset;
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  void main() {
    vec2 uvCur = applyFraming(coverUv(vUv, uPlaneAspect, uColorAspect), uFraming);
    vec4 dCur = texture2D(uDepth, mirrored(uvCur));
    vec2 fake3dCur = uvCur + (uMouse / uDepthStrength) * dCur.r;
    vec4 colorCur = texture2D(uColor, mirrored(fake3dCur));

    if (uTransition >= 1.0) {
      gl_FragColor = colorCur;
      return;
    }

    vec2 uvPrev = applyFraming(coverUv(vUv, uPlaneAspect, uPrevColorAspect), uPrevFraming);
    vec4 dPrev = texture2D(uPrevDepth, mirrored(uvPrev));
    vec2 fake3dPrev = uvPrev + (uMouse / uDepthStrength) * dPrev.r;
    vec4 colorPrev = texture2D(uPrevColor, mirrored(fake3dPrev));

    // Right-to-left raggedy wipe.
    // Front is a vertical line at vUv.x = frontX, sweeping 1.0 → 0.0 as
    // uTransition goes 0 → 1. Two octaves of vnoise on the Y axis perturb the
    // front horizontally to give it a torn-paper edge (low-freq big tears +
    // high-freq fine grain). Static — no uTime — so the edge has character,
    // not shimmer.
    const float RAGGED = 0.012;   // total amplitude of edge irregularity
    const float BAND   = 0.0099;  // band width — keep small for a crisp tear

    float raggedness =
        (vnoise(vec2(vUv.y *  10.0, 0.0)) - 0.4) * RAGGED * 0.99 +
        (vnoise(vec2(vUv.y * 40.0, 0.0)) - 0.5) * RAGGED * 0.15;

    // Remap uTransition so endpoints fully resolve, accounting for both
    // amplitude (RAGGED) and softness (BAND).
    float adjustedPhase = uTransition * (1.0 + 2.0 * (RAGGED + BAND)) - (RAGGED + BAND);

    // frontX sweeps right (1.0) → left (0.0). dx > 0 means right of the front
    // (revealed = new photo); dx < 0 means prev photo side.
    float frontX = 1.0 - adjustedPhase;
    float dx = vUv.x - (frontX + raggedness);
    float flood = smoothstep(-BAND, BAND, dx);

    vec3 finalCol = mix(colorPrev.rgb, colorCur.rgb, flood);
    gl_FragColor = vec4(finalCol, 1.0);
  }
`

export const makeTowerDepthMaterial = (colorMap, depthMap) =>
  new THREE.ShaderMaterial({
    uniforms: {
      uColor:           { value: colorMap },
      uDepth:           { value: depthMap },
      uColorAspect:     { value: 1.0 },
      uPrevColor:       { value: colorMap },
      uPrevDepth:       { value: depthMap },
      uPrevColorAspect: { value: 1.0 },
      uFraming:         { value: new THREE.Vector4(1, 1, 0, 0) },
      uPrevFraming:     { value: new THREE.Vector4(1, 1, 0, 0) },
      uMouse:            { value: new THREE.Vector2(0, 0) },
      uDepthStrength:    { value: 7.0 },
      uTransition:       { value: 1.0 },
      uPlaneAspect:      { value: 1.0 },
      uTexel:            { value: new THREE.Vector2(1 / 1920, 1 / 1080) },
    },
    vertexShader: towerDepthVertex,
    fragmentShader: towerDepthFragment,
  })
