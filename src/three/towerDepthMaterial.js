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
  uniform vec2  uBloomCenter;
  uniform vec3  uPaperColor;
  uniform vec3  uPencilColor;
  uniform float uEdgeLow;
  uniform float uEdgeHigh;
  uniform float uHatchDensity;
  uniform float uHatchAmount;
  uniform float uWobbleAmount;
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

  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

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

  float sobelLuma(sampler2D tex, vec2 uv, vec2 texel) {
    float tl = luma(texture2D(tex, uv + vec2(-texel.x, -texel.y)).rgb);
    float tm = luma(texture2D(tex, uv + vec2(      0.0, -texel.y)).rgb);
    float tr = luma(texture2D(tex, uv + vec2( texel.x, -texel.y)).rgb);
    float ml = luma(texture2D(tex, uv + vec2(-texel.x,      0.0)).rgb);
    float mr = luma(texture2D(tex, uv + vec2( texel.x,      0.0)).rgb);
    float bl = luma(texture2D(tex, uv + vec2(-texel.x,  texel.y)).rgb);
    float bm = luma(texture2D(tex, uv + vec2(      0.0,  texel.y)).rgb);
    float br = luma(texture2D(tex, uv + vec2( texel.x,  texel.y)).rgb);
    float gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
    float gy = -tl - 2.0*tm - tr + bl + 2.0*bm + br;
    return sqrt(gx*gx + gy*gy);
  }

  float sobelDepth(sampler2D tex, vec2 uv, vec2 texel) {
    float tl = texture2D(tex, uv + vec2(-texel.x, -texel.y)).r;
    float tm = texture2D(tex, uv + vec2(      0.0, -texel.y)).r;
    float tr = texture2D(tex, uv + vec2( texel.x, -texel.y)).r;
    float ml = texture2D(tex, uv + vec2(-texel.x,      0.0)).r;
    float mr = texture2D(tex, uv + vec2( texel.x,      0.0)).r;
    float bl = texture2D(tex, uv + vec2(-texel.x,  texel.y)).r;
    float bm = texture2D(tex, uv + vec2(      0.0,  texel.y)).r;
    float br = texture2D(tex, uv + vec2( texel.x,  texel.y)).r;
    float gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
    float gy = -tl - 2.0*tm - tr + bl + 2.0*bm + br;
    return sqrt(gx*gx + gy*gy);
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

    float sketchPhase = smoothstep(0.0, 0.5, uTransition);
    float colorPhase  = smoothstep(0.5, 1.0, uTransition);

    vec2 wob = (vec2(
      vnoise(vUv * 12.0 + uTransition * 3.0),
      vnoise(vUv * 12.0 + uTransition * 3.0 + 17.0)
    ) - 0.5) * uWobbleAmount;

    vec2 sampleUv = mirrored(applyFraming(coverUv(vUv + wob, uPlaneAspect, uColorAspect), uFraming));
    float eC = sobelLuma(uColor, sampleUv, uTexel);
    float eD = sobelDepth(uDepth, sampleUv, uTexel);
    float edge = smoothstep(uEdgeLow, uEdgeHigh, max(eC, eD));

    float hLuma = luma(colorCur.rgb);
    float angle = 0.785398;
    vec2 rot = vec2(
      cos(angle) * vUv.x - sin(angle) * vUv.y,
      sin(angle) * vUv.x + cos(angle) * vUv.y
    );
    float h = smoothstep(0.0, 0.4, sin(rot.x * uHatchDensity));
    float hatch = h * (1.0 - hLuma) * uHatchAmount;

    vec3 sketched = mix(uPaperColor, uPencilColor, clamp(edge + hatch, 0.0, 1.0));

    float threshold = vnoise(vUv * 30.0);
    float remappedSketch = sketchPhase * 1.2 - 0.1;
    float reveal = smoothstep(threshold - 0.1, threshold + 0.1, remappedSketch);
    vec3 phase1 = mix(colorPrev.rgb, sketched, reveal);

    vec2 ratio = vec2(uPlaneAspect, 1.0);
    vec2 d = (vUv - uBloomCenter) * ratio;
    float dist = length(d);
    vec2 cornerDelta = max(uBloomCenter * ratio, (1.0 - uBloomCenter) * ratio);
    float maxDist = length(cornerDelta);
    float edgePos = colorPhase * (maxDist + 0.14) - 0.07;
    float jitter = (vnoise(vUv * 8.0) - 0.5) * 0.06;
    float flood = 1.0 - smoothstep(edgePos - 0.04, edgePos + 0.04, dist + jitter);

    vec3 finalCol = mix(phase1, colorCur.rgb, flood);
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
      uBloomCenter:      { value: new THREE.Vector2(0.5, 0.55) },
      uPaperColor:       { value: new THREE.Color('#f7f3ea') },
      uPencilColor:      { value: new THREE.Color('#2a2622') },
      uEdgeLow:          { value: 0.06 },
      uEdgeHigh:         { value: 0.22 },
      uHatchDensity:     { value: 220.0 },
      uHatchAmount:      { value: 0.35 },
      uWobbleAmount:     { value: 0.003 },
    },
    vertexShader: towerDepthVertex,
    fragmentShader: towerDepthFragment,
  })
