import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import RivaliMap from './RivaliMap'
// Must stay below RivaliMap: RivaliMap's module body sets the global Draco decoder path that
// BirdFlock's module-scope preload relies on, and ES modules evaluate in import order.
import BirdFlock from './BirdFlock'
import MainBuildingRig from './MainBuildingRig'
import RouteLayer from './RouteLayer'
import CameraRig from './CameraRig'
// [dev camera capture - commented out, restore together] Re-enable with its render below and the
// capture panel in src/components/locations/LocationsView.jsx.
// import CameraLogger from './CameraLogger' // DEV-only camera logger; rendered below gated on import.meta.env.DEV
// import RoadPathTracer from './RoadPathTracer' // DEV-only road path tracer; re-enable with its render + the panel in LocationsView
import { locationsConfig } from './locationsConfig'

const { fogColor, fogNear, fogFar, camera, controls, bloom } = locationsConfig

// Fullscreen aerial view of the map. Canvas settings mirror TowersCanvas
// (dpr, offsetSize resize, alpha/antialias/high-performance). No shadows and no
// lights — lighting is baked into the KTX2 textures. Linear fog with fogFar tied
// to camera.far so the far terrain edge dissolves into the haze exactly at the
// clip distance instead of showing a hard horizon.
// [dev camera capture - commented out, restore together] The captureMode prop below was threaded
// from LocationsView down to CameraRig. Restore the signature as:
// ({ activeCategory, selectedLocationId, captureMode })
const LocationsCanvas = ({ activeCategory, selectedLocationId }) => (
  <Canvas
    dpr={2}
    resize={{ offsetSize: true }}
    camera={{
      position: camera.position,
      fov: camera.fov,
      near: camera.near,
      far: camera.far,
    }}
    gl={{
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    }}
    style={{ width: '100%', height: '100%' }}
  >
    <color attach="background" args={[fogColor]} />
    <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

    {/* Lights for MainBuilding only. The baked map is unlit MeshBasicMaterial and
        ignores these; only the building's embedded standard materials respond.
        Ambient + hemisphere are the FILL light: raised so the shaded faces (the parts
        the directional sun does not reach) are not dull/dark. Directional stays the
        key light. Raise fill more to further lift the dark sides; raise directional
        for more contrast/sheen on the lit sides. */}
    <ambientLight intensity={1.1} />
    <hemisphereLight args={['#ffffff', '#8a8a8a', 1.8]} />
    <directionalLight position={[6000, 9000, 4000]} intensity={2.5} />

    <Suspense fallback={null}>
      <RivaliMap />
      <MainBuildingRig />
      {/* World-space sibling, not a child of the rig, so the flock does not inherit the
          building's placement transform. Reads its dials from locationsConfig.birds. */}
      <BirdFlock />
    </Suspense>

    {/* Animated routes for the open category. Mounted at Canvas root (sibling of RivaliMap)
        so the captured world-space points are not shifted again by RivaliMap's recenter;
        loads no assets so it sits outside Suspense. key={activeCategory} hard-clears the set
        on a category switch / toggle-off (old routes unmount + dispose, fresh set draws in);
        retract-out animations happen only within a category. Nothing renders when no category. */}
    {activeCategory && (
      <RouteLayer key={activeCategory} category={activeCategory} selectedLocationId={selectedLocationId} />
    )}

    {/* Flies the camera to the selected route's saved framing, else the active category's, else the
        default; orbit locks for as long as a category is open and unlocks on toggle-off. Fires off
        the same props as the routes, so the flight and the draw-on run concurrently.
        [dev camera capture - commented out, restore together] also passed captureMode={captureMode} */}
    <CameraRig activeCategory={activeCategory} selectedLocationId={selectedLocationId} />

    <OrbitControls
      makeDefault
      target={controls.target}
      enableDamping
      minDistance={controls.minDistance}
      maxDistance={controls.maxDistance}
      maxPolarAngle={controls.maxPolarAngle}
    />

    {/* Bloom so the HDR MainBuilding pulse glows into the air. Renders the scene to an
        HDR buffer with tone mapping off, so pulse pixels (>1.0) bloom; the baked map is
        MeshBasicMaterial toneMapped={false} (<=1) and is unaffected. Water sun-glint can
        exceed 1.0 and may also sparkle-bloom (tune via locationsConfig.bloom). No
        <ToneMapping> child on purpose: a final ACES pass would also tone-map the raw
        baked map and change its look. Threshold/intensity are tuned in locationsConfig. */}
    <EffectComposer>
      <Bloom
        intensity={bloom.intensity}
        luminanceThreshold={bloom.threshold}
        luminanceSmoothing={bloom.smoothing}
        mipmapBlur
      />
    </EffectComposer>

    {/* [dev camera capture - commented out, restore together]
        Dev-only camera logger: prints camera.position + controls target (tagged with the capture
        panel's selected location id) on the 'log-camera' event. Restore together with its import
        above and the capture panel in src/components/locations/LocationsView.jsx, which is the only
        thing that dispatches 'log-camera'.
    {import.meta.env.DEV && <CameraLogger />} */}

    {/* Dev-only road path tracer COMMENTED OUT. Re-enable together with the road-path
        tracer panel in src/components/locations/LocationsView.jsx (and its import above).
        Click along the roads to trace a per-location camera path (loads no assets, sits
        outside Suspense; its pointer listeners coexist with OrbitControls).
    {import.meta.env.DEV && <RoadPathTracer />} */}
  </Canvas>
)

export default LocationsCanvas
