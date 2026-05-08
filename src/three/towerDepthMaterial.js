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
  uniform float uTime;
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

  // Classic Perlin 3D Noise by Stefan Gustavson
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
  float cnoise(vec3 P) {
    vec3 Pi0 = floor(P);
    vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000), dot(g010,g010), dot(g100,g100), dot(g110,g110)));
    g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001), dot(g011,g011), dot(g101,g101), dot(g111,g111)));
    g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
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

    float threshold = (vUv.x + (1.0 - vUv.y)) * 0.5 * 0.7 + vnoise(vUv * 30.0) * 0.3;
    float remappedSketch = sketchPhase * 1.2 - 0.1;
    float reveal = smoothstep(threshold - 0.1, threshold + 0.1, remappedSketch);
    vec3 phase1 = mix(colorPrev.rgb, sketched, reveal);

    // Phase 2: perlin watery bloom from uBloomCenter
    // Domain-warped perlin gives the organic ink-bleed character.
    vec2 displacedUv = vUv + cnoise(vec3(vUv * 5.0, uTime * 0.1));
    float perlin = cnoise(vec3(displacedUv * 5.0, uTime * 0.2));

    // Aspect-corrected normalized distance from bloom center, range [0, 1]
    vec2 ratio = vec2(uPlaneAspect, 1.0);
    vec2 d = (vUv - uBloomCenter) * ratio;
    vec2 cornerDelta = max(uBloomCenter * ratio, (1.0 - uBloomCenter) * ratio);
    float maxDist = length(cornerDelta);
    float ndist = length(d) / maxDist;

    // Bleed amplitude (organic perturbation) and band width (front softness).
    // Both expressed in normalized-distance units.
    const float BLEED = 0.18;
    const float BAND  = 0.10;

    // Remap colorPhase to internal range so endpoints fully resolve
    // (flood = 0 everywhere at colorPhase=0, flood = 1 everywhere at colorPhase=1)
    // accounting for both BLEED amplitude and BAND softness.
    float adjustedPhase = colorPhase * (1.0 + 2.0 * (BLEED + BAND)) - (BLEED + BAND);

    // Front: positive = unrevealed, negative = revealed. Perlin perturbs it.
    float front = ndist + perlin * BLEED - adjustedPhase;
    float flood = 1.0 - smoothstep(-BAND, BAND, front);

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
      uBloomCenter:      { value: new THREE.Vector2(0.6, 0.55) },
      uPaperColor:       { value: new THREE.Color('#f7f3ea') },
      uPencilColor:      { value: new THREE.Color('#2a2622') },
      uEdgeLow:          { value: 0.06 },
      uEdgeHigh:         { value: 0.22 },
      uHatchDensity:     { value: 220.0 },
      uHatchAmount:      { value: 0.35 },
      uWobbleAmount:     { value: 0.003 },
      uTime:             { value: 0 },
    },
    vertexShader: towerDepthVertex,
    fragmentShader: towerDepthFragment,
  })
