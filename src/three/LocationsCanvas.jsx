import { memo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import FirstFrameSignal from './FirstFrameSignal'
import RivaliMap from './RivaliMap'
// Must stay below RivaliMap: RivaliMap's module body sets the global Draco decoder path that
// BirdFlock's module-scope preload relies on, and ES modules evaluate in import order.
import BirdFlock from './BirdFlock'
import MainBuildingRig from './MainBuildingRig'
import RouteLayer from './RouteLayer'
import LocationMarkers from './LocationMarkers'
import CameraRig from './CameraRig'
import IdleOrbitController from './IdleOrbitController'
// [dev camera capture - commented out, restore together] Re-enable with its render below and the
// capture panel in src/components/locations/LocationsView.jsx.
// import CameraLogger from './CameraLogger' // DEV-only camera logger; rendered below gated on import.meta.env.DEV
import RoadPulses from './RoadPulses'
import { locationsConfig } from './locationsConfig'

const { fogColor, fogNear, fogFar, camera, controls, bloom } = locationsConfig

// Fullscreen aerial view of the map. Canvas settings mirror TowersCanvas
// (dpr, offsetSize resize, alpha/antialias/high-performance). No shadows and no
// lights — lighting is baked into the KTX2 textures. Linear fog with fogFar tied
// to camera.far so the far terrain edge dissolves into the haze exactly at the
// clip distance instead of showing a hard horizon.
// onReady fires once the scene has painted a couple of real frames; LocationsView
// holds the loading overlay's fade until then (see FirstFrameSignal below).
// [dev camera capture - commented out, restore together] The captureMode prop below was threaded
// from LocationsView down to CameraRig. Restore the signature as:
// ({ activeCategory, selectedLocationId, captureMode, onReady })
const LocationsCanvas = ({ activeCategory, selectedLocationId, isExiting, onExitComplete, onSelectLocation, onReady }) => {
  // Idle = nothing selected. Drives the IdleOrbitController on/off; CameraRig owns the camera
  // whenever this is false.
  const isIdle = activeCategory == null && selectedLocationId == null
  return (
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
      {/* Always-on comet pulses along the WEH + metro centerlines. World-space sibling of
          RivaliMap (its centerline points are absolute, so the recenter must not shift them);
          loads no assets. Dims while a location is selected so the route line reads clearly. */}
      <RoadPulses selectedLocationId={selectedLocationId} />
      <MainBuildingRig />
      {/* One flock per locationsConfig.flocks entry, each circling its own world-space center.
          World-space siblings, not children of the rig, so they do not inherit the building's
          placement transform. Each mount clones the shared bird GLB (see BirdFlock.jsx). */}
      {locationsConfig.flocks.map((flock, i) => (
        <BirdFlock key={i} config={flock} />
      ))}

      {/* Inside this boundary on purpose: it cannot tick until the map/building/bird
          assets have resolved and the first frame — with its shader-compile stall —
          is past. That is the moment the loader is safe to fade on. */}
      <FirstFrameSignal onReady={onReady} />
    </Suspense>

    {/* Animated routes for the open category. Mounted at Canvas root (sibling of RivaliMap)
        so the captured world-space points are not shifted again by RivaliMap's recenter;
        loads no assets so it sits outside Suspense. key={activeCategory} hard-clears the set
        on a category SWITCH (old routes unmount + dispose, fresh set draws in). A toggle-off
        (deselect to idle) is now a sequenced exit: isExiting drives the whole set to retract-out
        in place, and onAllExited fires onExitComplete once they finish (see LocationsView Phase B),
        so this stays mounted through the retract instead of hard-clearing. Nothing renders when no
        category. */}
    {activeCategory && (
      <RouteLayer
        key={activeCategory}
        category={activeCategory}
        selectedLocationId={selectedLocationId}
        exiting={isExiting}
        onAllExited={onExitComplete}
      />
    )}

    {/* Standing pins for the rest of the open category, so a second destination can be
        picked straight off the map instead of reopening the list. Only renders once a
        location is selected -- before that every route carries its own pin. Sibling of
        RouteLayer for the same world-space reason. */}
    {activeCategory && !isExiting && (
      <LocationMarkers
        category={activeCategory}
        selectedLocationId={selectedLocationId}
        onSelect={onSelectLocation}
      />
    )}

    {/* Flies the camera to the selected route's saved framing, else the active category's, and locks
        orbit for as long as a category is open. On deselect it does NOT fly - it hands the camera to
        IdleOrbitController below. Fires off the same props as the routes, so the flight and the
        draw-on run concurrently.
        [dev camera capture - commented out, restore together] also passed captureMode={captureMode} */}
    <CameraRig activeCategory={activeCategory} selectedLocationId={selectedLocationId} />

    {/* Idle-state (nothing selected) constrained orbit rig around MainBuilding: fixed-ring auto-orbit
        + horizontal drag-scrub + self-centering mouse parallax. Inert while a category/route is
        selected (CameraRig owns the camera then). See src/three/IdleOrbitController.jsx. */}
    <IdleOrbitController isIdle={isIdle} />

    {/* KEPT but permanently disabled: makeDefault registers it into the R3F store so CameraRig can
        drive its flights via get().controls (.target/.update()); IdleOrbitController drives the idle
        camera directly. enabled=false means drei attaches no listeners and runs no per-frame update
        (damping + autoRotate both off), so it never fights either rig. No user orbit/zoom/pan. */}
    <OrbitControls
      makeDefault
      target={controls.target}
      enabled={false}
      enablePan={false}
      enableZoom={false}
      enableDamping={false}
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
  </Canvas>
  )
}

// memo, not polish: the onReady setState re-renders LocationsView on exactly the
// frame the loader's fade begins. Without this, that render would walk the whole
// R3F tree (RivaliMap, MainBuildingRig, BirdFlock, EffectComposer) right when we
// need the main thread clear. Props are unchanged on that render, so React skips
// the subtree; category/location clicks do change props and still re-render.
export default memo(LocationsCanvas)
