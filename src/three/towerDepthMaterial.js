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

  void main() {
    vec4 dCur = texture2D(uDepth, mirrored(vUv));
    vec2 fake3dCur = vUv + (uMouse / uDepthStrength) * dCur.r;
    vec4 colorCur = texture2D(uColor, mirrored(fake3dCur));

    if (uTransition < 1.0) {
      vec4 dPrev = texture2D(uPrevDepth, mirrored(vUv));
      vec2 fake3dPrev = vUv + (uMouse / uDepthStrength) * dPrev.r;
      vec4 colorPrev = texture2D(uPrevColor, mirrored(fake3dPrev));

      float noise = (hash(vUv * uNoiseScale) - 0.5) * 0.08;
      float threshold = dPrev.r + noise;
      // Remap [0, 1] to [-0.1, 1.1] so the smoothstep saturates fully at the
      // endpoints — at uTransition=0 every pixel reads as prev, at =1 every
      // pixel reads as new. Without this, foreground pixels (depth.r near 0)
      // would partially blend at uTransition=0 and produce a one-frame flash.
      float t = mix(-0.1, 1.1, uTransition);
      float reveal = smoothstep(t - 0.025, t + 0.025, threshold);
      gl_FragColor = mix(colorCur, colorPrev, reveal);
    } else {
      gl_FragColor = colorCur;
    }
  }
`

export const makeTowerDepthMaterial = (colorMap, depthMap) =>
  new THREE.ShaderMaterial({
    uniforms: {
      uColor:         { value: colorMap },
      uDepth:         { value: depthMap },
      uPrevColor:     { value: colorMap },
      uPrevDepth:     { value: depthMap },
      uMouse:         { value: new THREE.Vector2(0, 0) },
      uDepthStrength: { value: 7.0 },
      uTransition:    { value: 1.0 },
      uNoiseScale:    { value: 8.0 },
    },
    vertexShader: towerDepthVertex,
    fragmentShader: towerDepthFragment,
  })
