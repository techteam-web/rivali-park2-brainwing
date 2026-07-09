// Tunables for the /locations 3D map. Fog, camera, and the flat material colors
// all live here so they can be dialed in from one place without touching the
// component code. See src/three/RivaliMap.jsx and src/three/LocationsCanvas.jsx.
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
  mainBuilding: { position: [2173.201, 37.724, -2.884], rotation: [0, 0.099, 0], scale: [1, 1, 1] },
  // Flock of birds circling in the sky above MainBuilding (see src/three/BirdFlock.jsx).
  // The GLB bakes flap + bob for a stationary formation; the orbit is added there.
  birds: {
    heightOffset: 400,   // world units above mainBuilding.position.y; tune to clear the towers
    scale: 1,            // wingspan ~21u, ~14px from the default camera; drop to 0.6 for smaller
    orbitRadius: 600,    // how far out from the building the flock circles
    orbitSpeed: 0.08,    // radians/sec; slow wheel around the building
    tangentYaw: Math.PI, // aligns the birds' baked +Z forward to the travel direction (derived,
                         // see BirdFlock.jsx); becomes 0 if orbitSpeed is ever negated
    color: '#ffffff',    // unlit white; sits AT bloom.threshold (1.0) so it does not smear
  },
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
}
