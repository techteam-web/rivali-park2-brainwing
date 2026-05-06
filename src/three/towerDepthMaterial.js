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
  uniform float uNoiseScale;
  uniform float uColorAspect;
  uniform float uPrevColorAspect;
  uniform float uPlaneAspect;
  uniform vec4  uFraming;      // xy = scale, zw = offset (UV units)
  uniform vec4  uPrevFraming;
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

  void main() {
    vec2 uvCur = applyFraming(coverUv(vUv, uPlaneAspect, uColorAspect), uFraming);
    vec4 dCur = texture2D(uDepth, mirrored(uvCur));
    vec2 fake3dCur = uvCur + (uMouse / uDepthStrength) * dCur.r;
    vec4 colorCur = texture2D(uColor, mirrored(fake3dCur));

    if (uTransition > 0.0 && uTransition < 1.0) {
      vec2 uvPrev = applyFraming(coverUv(vUv, uPlaneAspect, uPrevColorAspect), uPrevFraming);
      vec4 dPrev = texture2D(uPrevDepth, mirrored(uvPrev));
      vec2 fake3dPrev = uvPrev + (uMouse / uDepthStrength) * dPrev.r;
      vec4 colorPrev = texture2D(uPrevColor, mirrored(fake3dPrev));

      float noise = (hash(vUv * uNoiseScale) - 0.5) * 0.08;
      float threshold = dPrev.r + noise;
      float reveal = smoothstep(uTransition - 0.025, uTransition + 0.025, threshold);
      gl_FragColor = mix(colorCur, colorPrev, reveal);
    } else {
      gl_FragColor = colorCur;
    }
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
      uNoiseScale:       { value: 8.0 },
      uPlaneAspect:      { value: 1.0 },
    },
    vertexShader: towerDepthVertex,
    fragmentShader: towerDepthFragment,
  })
