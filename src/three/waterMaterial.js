import * as THREE from 'three'
import { locationsConfig } from './locationsConfig'
import { fogUniforms, fogParsFragmentGLSL, fogFragmentGLSL } from './locationsFog'

// Aerial-view ocean shader for the two /locations water meshes. No vertex displacement
// (height is invisible top-down) and no scene lights (the map is baked/unlit): the look
// is two scrolling world-XZ normal-map layers, a Fresnel blend to the sky color, and a
// fake Blinn sun glint. It splices the same custom fog as the rest of the map so water
// dissolves into the horizon with no seam. Mirrors the towerDepthMaterial factory pattern.
const w = locationsConfig.water

const vertexShader = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vViewDir;
  varying float vFogDepth;
  varying vec3 vFogWorldPosition;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vViewDir = cameraPosition - worldPos.xyz;
    vFogWorldPosition = worldPos.xyz;
    vec4 mvPosition = viewMatrix * worldPos;
    vFogDepth = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uNormalMap;
  uniform vec3 uDeepColor;
  uniform vec3 uSkyColor;
  uniform vec3 uSunColor;
  uniform float uSunIntensity;
  uniform vec3 uSunDir;
  uniform float uShininess;
  uniform float uFresnelPower;
  uniform float uNormalStrength;
  uniform float uOpacity;
  uniform float uScale1;
  uniform float uScale2;
  uniform vec2 uSpeed1;
  uniform vec2 uSpeed2;
  uniform float uScale3;
  uniform vec2 uSpeed3;
  uniform float uSwellStrength;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  ${fogParsFragmentGLSL}   // declares fog uniforms + varyings + cnoise (uTime lives here)

  void main() {
    vec2 uv1 = vWorldPos.xz * uScale1 + uSpeed1 * uTime;
    vec2 uv2 = vWorldPos.xz * uScale2 + uSpeed2 * uTime;
    vec2 uv3 = vWorldPos.xz * uScale3 + uSpeed3 * uTime;   // large swell, resolvable when zoomed out
    vec3 n1 = texture2D(uNormalMap, uv1).rgb * 2.0 - 1.0;
    vec3 n2 = texture2D(uNormalMap, uv2).rgb * 2.0 - 1.0;
    vec3 n3 = texture2D(uNormalMap, uv3).rgb * 2.0 - 1.0;
    // water is horizontal: force +Y up, R/G give the tilt (blue channel unused)
    float tiltX = (n1.x + n2.x) * uNormalStrength + n3.x * uSwellStrength;
    float tiltZ = (n1.y + n2.y) * uNormalStrength + n3.y * uSwellStrength;
    vec3 N = normalize(vec3(tiltX, 1.0, tiltZ));
    vec3 V = normalize(vViewDir);
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), uFresnelPower);
    vec3 col = mix(uDeepColor, uSkyColor, fres);
    vec3 H = normalize(normalize(uSunDir) + V);
    float spec = pow(max(dot(N, H), 0.0), uShininess);
    col += uSunColor * uSunIntensity * spec;
    gl_FragColor = vec4(col, uOpacity);
    ${fogFragmentGLSL}       // same dual-color + noise fog as the rest of the map
  }
`

export function makeWaterMaterial(normalMap, maxAnisotropy = 1) {
  // Configure the normal map here (not in the component) so we never mutate a value
  // returned straight from useLoader. It is a data texture: no sRGB, tiled in world-XZ,
  // anisotropic so the big sea does not shimmer at grazing angles.
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping
  normalMap.colorSpace = THREE.NoColorSpace
  normalMap.anisotropy = maxAnisotropy
  normalMap.needsUpdate = true

  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog, // fogColor/fogNear/fogFar, kept in sync by three (fog:true)
    {
      uNormalMap: { value: null },
      uDeepColor: { value: new THREE.Color(w.deepColor) },
      uSkyColor: { value: new THREE.Color(w.skyColor) },
      uSunColor: { value: new THREE.Color(w.sunColor) },
      uSunIntensity: { value: w.sunIntensity },
      uSunDir: { value: new THREE.Vector3(w.sunDir[0], w.sunDir[1], w.sunDir[2]) },
      uShininess: { value: w.shininess },
      uFresnelPower: { value: w.fresnelPower },
      uNormalStrength: { value: w.normalStrength },
      uOpacity: { value: w.opacity },
      uScale1: { value: w.scale1 },
      uScale2: { value: w.scale2 },
      uSpeed1: { value: new THREE.Vector2(w.speed1[0], w.speed1[1]) },
      uSpeed2: { value: new THREE.Vector2(w.speed2[0], w.speed2[1]) },
      uScale3: { value: w.scale3 },
      uSpeed3: { value: new THREE.Vector2(w.speed3[0], w.speed3[1]) },
      uSwellStrength: { value: w.swellStrength },
    },
  ])
  // share the SAME custom-fog uniform refs as the map, so fog tuning and the single
  // uTime tick (already advanced by RivaliMap's fog useFrame) drive the water too
  uniforms.fogNearColor = fogUniforms.fogNearColor
  uniforms.fogNoiseFreq = fogUniforms.fogNoiseFreq
  uniforms.fogNoiseImpact = fogUniforms.fogNoiseImpact
  uniforms.fogNoiseSpeed = fogUniforms.fogNoiseSpeed
  uniforms.uTime = fogUniforms.uTime
  uniforms.uNormalMap.value = normalMap

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false, // avoid z-fighting where the two water meshes meet
    fog: true, // makes three inject USE_FOG and sync fogColor/near/far
  })
}
