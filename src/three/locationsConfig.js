// Tunables for the /locations 3D map. Fog, camera, and the flat material colors
// all live here so they can be dialed in from one place without touching the
// component code. See src/three/RivaliMap.jsx and src/three/LocationsCanvas.jsx.

// Hoisted so mainBuilding.position and the flock that circles it cannot drift apart.
const MAIN_BUILDING_POSITION = [2173.201, 37.724, -2.884]

export const locationsConfig = {
  fogMode: 'linear', // linear <fog>; far edge dissolves at the clip distance
  fogColor: '#ADDFFF', // haze the fog dissolves into (also the background)
  fogNear: 4000, // was 3500, haze starts closer
  fogFar: 8000, // was 12000, reaches full sky sooner; camera.far stays 12000 (far geometry = full haze)
  fogNearColor: '#dfeaf3', // near/mid haze (lighter than the sky far color)
  fogNoiseFreq: 0.0006, // patch scale for the ~24km scene (0.0003 broad .. 0.0015 patchy)
  fogNoiseImpact: 0.4, // how much noise perturbs the fog line, 0..1
  fogNoiseSpeed: 0, // world-units/sec drift; 0 = static. Try 40..80 to enable
  camera: { position: [744.1, 1142.2, -20.9], fov: 45, near: 10, far: 12000 },
  controls: {
    target: [2470.1, -9.6, -83.9],
    minDistance: 800,
    maxDistance: 9000,
    maxPolarAngle: Math.PI / 2 - 0.05, // stay above the ground plane
  },
  // Per-category camera framings for the /locations flight (see src/three/CameraRig.jsx).
  // Tapping a category flies here and locks orbit; tapping off returns to the camera.position +
  // controls.target default above and unlocks. Captured with the dev CameraLogger.
  cameraViews: {
    access:     { position: [1624.5, 5947.5, 217.1],  target: [1624.5, -23.2, 217.1] },
    leisure:    { position: [-3057.1, 3206.2, 335.9],  target: [1701.8, 119.7, 313.1] },
    healthcare: { position: [1580.6, 1442, -1843.4],   target: [2305.1, -8, -112] },
    schools:    { position: [-1201.2, 2617.7, 1805.5], target: [2077.3, 153, -321] },
    business:   { position: [-2320.9, 2079.9, 381],    target: [1531.8, -208.9, -742.5] },
    parks:      { position: [-52.8, 1271.8, -1927.3],  target: [2185.6, 72.4, -1251.5] },
  },
  cameraFlightDuration: 1.6, // seconds, GSAP fly-to for the category camera flight
  materials: {
    plinth: '#c8c4bc',
    road: '#8a8a8a',
    railway: '#5a5a5a',
    water: '#3b6ea5',
    waterOpacity: 0.72,
  },
  // Ocean shader for the two /locations water meshes (see src/three/waterMaterial.js).
  // Aerial view, so no vertex displacement; the look is normal maps + Fresnel + a fake
  // sun glint. Keep skyColor == fogColor so the grazing reflection matches sky and fog.
  water: {
    deepColor: '#2d6e84', // looking straight down
    skyColor: '#ADDFFF', // grazing reflection = sky (keep == fogColor)
    sunColor: '#fff2d6', // warm glint
    sunIntensity: 1.2,
    sunDir: [0.6, 0.5, 0.4], // world-space, normalized in-shader
    shininess: 400, // higher = smaller, sharper sparkles
    fresnelPower: 3.0,
    normalStrength: 0.35, // higher = choppier ripples
    opacity: 0.85,
    scale1: 0.02,
    speed1: [0.01, 0.006], // world-XZ tiling + drift
    scale2: 0.008,
    speed2: [-0.006, 0.009],
    scale3: 0.0012, // large swell, ~830u features, stays visible zoomed out
    speed3: [0.008, -0.006], // world drift ~7u/s (= speed/scale), the motion seen from far
    swellStrength: 0.4, // how much the swell tilts the normal; higher = more visible
  },
  // Placement for MainBuilding.glb, dialed in with the dev gizmo on /locations.
  // rotation in radians (~6 deg yaw); re-log and paste here to adjust.
  mainBuilding: { position: MAIN_BUILDING_POSITION, rotation: [0, 0.099, 0], scale: [1, 1, 1] },
  // One entry per flock of birds circling in the sky (see src/three/BirdFlock.jsx). The GLB
  // bakes flap + bob for a stationary formation; the orbit is added there. Vary scale, radius
  // and speed between entries so the flocks do not read as copies of one another.
  // Every `center` is WORLD-space, and RivaliMap recenters the map on the origin, so a point
  // logged by the DEV flock-center picker pastes in here directly.
  //   heightOffset: world units above center[1]; tune to clear the towers/terrain
  //   scale:        wingspan ~21u, ~14px from the default camera; drop to 0.6 for smaller
  //   orbitRadius:  how far out from center the flock circles
  //   orbitSpeed:   radians/sec; positive sweeps one way, negative the other
  //   tangentYaw:   aligns the birds' baked +Z forward to the travel direction (derived, see
  //                 BirdFlock.jsx). PI for a positive orbitSpeed, 0 for a negative one.
  //   color:        unlit white; sits AT bloom.threshold (1.0) so it does not smear
  flocks: [
    // Over MainBuilding. Values as originally tuned.
    { center: [...MAIN_BUILDING_POSITION], heightOffset: 400, scale: 1, orbitRadius: 600, orbitSpeed: 0.08, tangentYaw: Math.PI, color: '#ffffff' },
    // Over the mountain/forest, captured with the DEV flock-center picker.
    { center: [4452.38, 99.61, -86.67], heightOffset: 500, scale: 1.2, orbitRadius: 800, orbitSpeed: 0.06, tangentYaw: Math.PI, color: '#ffffff' },
    // Near, but not on, MainBuilding: captured with the DEV flock-center picker; higher and
    // tighter than the first.
    { center: [2198.83, 39.32, 2297.78], heightOffset: 650, scale: 0.8, orbitRadius: 450, orbitSpeed: 0.1, tangentYaw: Math.PI, color: '#ffffff' },
  ],
  // Brighten MainBuilding's embedded (dull) base colors a touch. Applied ONCE as
  // material.color *= this factor when the pulse is attached (see MainBuilding.jsx).
  // 1 = unchanged; raise for brighter towers. Also brightens the pulse (uses diffuse).
  mainBuildingColorBoost: 1.4,
  // Always-on glowing band that flows continuously up MainBuilding in each tower's
  // own base color and loops seamlessly (see src/three/buildingPulse.js). HDR-bright
  // so it crosses the bloom threshold below and glows into the air.
  buildingPulse: {
    speed: 0.16,     // cycles/sec; continuous seamless upward flow (~6.25s per pass)
    bandWidth: 0.25, // band half-thickness as a fraction of building height (0..0.5)
    intensity: 2.4,  // HDR-bright base-color add (raise toward ~4-6 if towers barely glow)
  },
  // Bloom for the HDR pulse (see src/three/LocationsCanvas.jsx). The baked map is
  // unlit (<=1) and stays out. NOTE: the water's specular sun-glint can exceed 1.0,
  // so tiny water sparkles may also bloom - since that glint peak (~2.0) can be
  // brighter than a muted tower's pulse, RAISE buildingPulse.intensity so the column
  // is clearly the brightest thing rather than lowering this threshold (lowering it
  // blooms more of the scene; water is out of scope to change here).
  bloom: {
    intensity: 1.1,
    threshold: 1.0,
    smoothing: 0.2,
  },
  // Animated route line drawn on /locations when a location is selected
  // (see src/three/RouteCurve.jsx). Tunables for the aerial camera.
  route: {
    color: '#E0D9C0', // cream, gradient stop A (Figma)
    pulseColor: '#a36f5a', // brown, gradient stop B (Figma)
    tubeRadius: 6, // world units
    radialSegments: 8,
    yOffset: 4, // lift above ground to avoid z-fight
    opacity: 0.95,
    drawDuration: 1.5, // seconds, draw-on
    pulseDuration: 2.2, // seconds per gradient sweep along the route
    pulseWidth: 0.16, // reserved: unused by the cosine gradient (fills the whole cycle)
    markerYOffset: 12, // world units the destination pin floats above the end point
    markerWidthPx: 42, // on-screen pin width, constant screen size
  },
  // Always-on comet pulses that run continuously along two roads on the map
  // (see src/three/RoadPulses.jsx). Each road is one centerline; a bright HDR comet
  // (sharp head, fading tail) loops along it in BOTH directions, so the two pulses
  // pass through each other. HDR-bright (intensity > 1) so they cross the bloom
  // threshold above and glow into the air. They DIM while a location is selected so
  // the route line reads clearly. Centerline data lives in
  // src/components/locations/roadPaths.js.
  roadPulses: {
    weh: { color: '#ffb454', intensity: 3.2 }, // warm amber (HDR > 1 so it blooms)
    metro: { color: '#4fd0ff', intensity: 3.2 }, // cool cyan
    tubeRadius: 7, // world units; tuned for the aerial camera
    radialSegments: 8,
    yOffset: 5, // lift above the road to avoid z-fight
    tailLength: 0.12, // comet tail length as a fraction of the line (head bright -> fades over this)
    speed: 0.06, // fraction of the line per second the comet travels
    baseOpacity: 0.9,
    dimOpacity: 0.18, // opacity multiplier while a route/location is selected
    dimDuration: 0.5, // seconds to fade to/from dim
  },
}
