// Per-category location lists for the /locations map. Flat (no sub-groups):
// each location is { id, name, position }, with `position` left null this pass
// and filled later from road-mesh coords. Each category also carries a
// `markerStyle` (shape + color) the future marker/camera passes read. ids are
// category-prefixed so they are globally unique. Category keys mirror the ids in
// locationsCategories.js (access/leisure/healthcare/schools/business/parks).
export const locationsData = {
  access: {
    markerStyle: { shape: 'dot', color: '#9aa0a6' },
    // Trimmed to the client's list (12 Oct feedback). Link Road, Malad,
    // Kandivali, Dahisar, Ovaripada and Devipada were removed; their routes,
    // cameras and card data stay in the sibling files. "Borivali-Thane Twin
    // Tunnel" is on the client's list too but is not added yet: it needs a
    // route, camera framing and card photo first (see the Damania note below).
    locations: [
      { id: 'access-western-express-highway', name: 'Western Express Highway', position: null },
      { id: 'access-sv-road', name: 'SV Road', position: null },
      { id: 'access-borivali', name: 'Borivali Railway Station', position: null },
      { id: 'access-magathane', name: 'Magathane Metro Station', position: null },
    ],
    // Display-only sub-groups (rendered by the drop-up); `locations` above stays
    // the flat source of truth the marker/camera passes read. ids reference the
    // locations above, no duplication. Every access location is in exactly one group.
    groups: [
      { label: 'Highways & Roads', ids: ['access-western-express-highway', 'access-sv-road'] },
      { label: 'Railway Stations', ids: ['access-borivali'] },
      { label: 'Metro', ids: ['access-magathane'] },
    ],
  },
  leisure: {
    markerStyle: { shape: 'dot', color: '#ec4899' },
    locations: [
      // Same destination as before, renamed per client feedback (08 Aug):
      // the mall is listed as "Sky City Mall", not by its developer's name.
      // The id is left alone so its route, camera framing, distance and times
      // all keep resolving.
      { id: 'leisure-oberoi-sky-city', name: 'Sky City Mall', position: null },
      { id: 'leisure-raghuleela-mall', name: 'Raghuleela Mall', position: null },
      // Growel's Mall removed (08 Aug) — it no longer exists. Its route,
      // camera and card data are left in place in the sibling files so it can
      // be restored by putting this row back if that turns out to be wrong.
      // Thakur Mall, Carnival Cinema and Evershine Dream Park removed (12 Oct
      // feedback). "Oberoi Mall" is to be added once its route, camera and card
      // photo exist.
      {
        id: 'leisure-pvr',
        name: 'PVR',
        position: null,
        // optional card content (all may be absent -> LocationCard PLACEHOLDER fills in):
        photo: null,
        blurb: 'Premium screens and dining a short hop from the door.',
        distance: '200 m',
        times: { walk: '10 mins', bike: '5 mins', car: '8 mins', transit: '10 mins' },
      },
    ],
    // Display-only sub-groups; every leisure location is in exactly one group.
    groups: [
      { label: 'Malls', ids: ['leisure-oberoi-sky-city', 'leisure-raghuleela-mall'] },
      { label: 'Entertainment & Cinemas', ids: ['leisure-pvr'] },
    ],
  },
  healthcare: {
    markerStyle: { shape: 'square', color: '#22c55e' },
    locations: [
      { id: 'healthcare-apex', name: 'Apex Hospital', position: null },
      { id: 'healthcare-surbhi', name: 'Surbhi Hospital', position: null },
      { id: 'healthcare-seven-star', name: 'Seven Star Hospital', position: null },
      // TODO(client feedback 08 Aug): add "Upcoming Damania Hospital". Kept
      // commented until the three pieces a healthcare row needs are supplied,
      // because a row with none of them selects to a blank card and no route:
      //   1. its route path      -> locationsPaths.js (traced on the map with
      //      the dev capture panel in LocationsView, same as every other row)
      //   2. its camera framing  -> locationCameras.js (dev CameraLogger)
      //   3. card content        -> photo in src/assets/locations/images/
      //      ("Damania Hospital.webp") + distance + walk/bike/car/transit times
      // Everything else (blurb) is already written below in locationBlurbs.js.
      // { id: 'healthcare-damania', name: 'Upcoming Damania Hospital', position: null },
    ],
  },
  schools: {
    markerStyle: { shape: 'dot', color: '#f59e0b' },
    locations: [
      { id: 'schools-singapore-international', name: 'Singapore International School', position: null },
      { id: 'schools-jbcn-international', name: 'JBCN International School', position: null },
      { id: 'schools-chatrabhuj-narsee', name: 'Chatrabhuj Narsee School', position: null },
      { id: 'schools-cambridge', name: 'Cambridge School', position: null },
      { id: 'schools-oxford-international', name: 'Oxford International School', position: null },
      // Children's Academy School removed (12 Oct feedback). "Oberoi
      // International School" is to be added once its route, camera and photo exist.
    ],
  },
  business: {
    markerStyle: { shape: 'dot', color: '#14b8a6' },
    locations: [
      { id: 'business-wadhwa-techno-park', name: 'Wadhwa Techno Park', position: null },
      { id: 'business-agora-business-plaza', name: 'Agora Business Plaza', position: null },
      { id: 'business-western-edge', name: 'Western Edge', position: null },
      { id: 'business-mahindra', name: 'Mahindra & Mahindra Ltd.', position: null },
    ],
  },
  parks: {
    markerStyle: { shape: 'tree', color: '#16a34a' },
    locations: [
      // Listed by its short name per the 12 Oct feedback.
      { id: 'parks-sanjay-gandhi-national-park', name: 'SGNP', position: null },
    ],
  },
}

// Small helper the drop-up and future marker/camera passes can share:
export const getCategoryLocations = (id) => locationsData[id]?.locations ?? []

// flat by-id lookup across every category (ids are globally unique), for the detail card
export const getLocationById = (id) =>
  Object.values(locationsData)
    .flatMap((c) => c.locations)
    .find((l) => l.id === id) ?? null

// by-id lookup within a category, for group rendering
export const getCategoryGroups = (id) => locationsData[id]?.groups ?? null

// resolve a group's ids to full location objects, preserving order
export const getLocationsByIds = (categoryId, ids) => {
  const all = getCategoryLocations(categoryId)
  return ids.map((lid) => all.find((l) => l.id === lid)).filter(Boolean)
}
