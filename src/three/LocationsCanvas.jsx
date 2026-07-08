import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import RivaliMap from './RivaliMap'
import MainBuildingRig from './MainBuildingRig'
import RouteLayer from './RouteLayer'
import CameraRig from './CameraRig'
// import CameraLogger from './CameraLogger' // DEV-only camera logger; re-enable with its render + the button in LocationsView
// import RoadPathTracer from './RoadPathTracer' // DEV-only road path tracer; re-enable with its render + the panel in LocationsView
import { locationsConfig } from './locationsConfig'

const { fogColor, fogNear, fogFar, camera, controls } = locationsConfig

// Fullscreen aerial view of the map. Canvas settings mirror TowersCanvas
// (dpr, offsetSize resize, alpha/antialias/high-performance). No shadows and no
// lights — lighting is baked into the KTX2 textures. Linear fog with fogFar tied
// to camera.far so the far terrain edge dissolves into the haze exactly at the
// clip distance instead of showing a hard horizon.
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
        ignores these; only the building's embedded standard materials respond. */}
    <ambientLight intensity={0.6} />
    <hemisphereLight args={['#ffffff', '#8a8a8a', 1]} />
    <directionalLight position={[6000, 9000, 4000]} intensity={2.5} />

    <Suspense fallback={null}>
      <RivaliMap />
      <MainBuildingRig />
    </Suspense>

    {/* Animated routes for the open category. Mounted at Canvas root (sibling of RivaliMap)
        so the captured world-space points are not shifted again by RivaliMap's recenter;
        loads no assets so it sits outside Suspense. key={activeCategory} hard-clears the set
        on a category switch / toggle-off (old routes unmount + dispose, fresh set draws in);
        retract-out animations happen only within a category. Nothing renders when no category. */}
    {activeCategory && (
      <RouteLayer key={activeCategory} category={activeCategory} selectedLocationId={selectedLocationId} />
    )}

    {/* Flies the camera to the active category's saved framing and locks orbit; returns to the
        default framing and unlocks when the category is toggled off. Fires off the same
        activeCategory prop as the routes, so the flight and the draw-on run concurrently. */}
    <CameraRig activeCategory={activeCategory} />

    <OrbitControls
      makeDefault
      target={controls.target}
      enableDamping
      minDistance={controls.minDistance}
      maxDistance={controls.maxDistance}
      maxPolarAngle={controls.maxPolarAngle}
    />

    {/* Dev-only camera logger COMMENTED OUT. Re-enable together with the "Log camera
        position" button in src/components/locations/LocationsView.jsx (and its import
        above). Prints camera.position + controls target on the 'log-camera' event.
    {import.meta.env.DEV && <CameraLogger />} */}

    {/* Dev-only road path tracer COMMENTED OUT. Re-enable together with the road-path
        tracer panel in src/components/locations/LocationsView.jsx (and its import above).
        Click along the roads to trace a per-location camera path (loads no assets, sits
        outside Suspense; its pointer listeners coexist with OrbitControls).
    {import.meta.env.DEV && <RoadPathTracer />} */}
  </Canvas>
)

export default LocationsCanvas
