// Per-category location lists for the /locations map. Flat (no sub-groups):
// each location is { id, name, position }, with `position` left null this pass
// and filled later from road-mesh coords. Each category also carries a
// `markerStyle` (shape + color) the future marker/camera passes read. ids are
// category-prefixed so they are globally unique. Category keys mirror the ids in
// locationsCategories.js (access/leisure/healthcare/schools/business/parks).
export const locationsData = {
  access: {
    markerStyle: { shape: 'dot', color: '#9aa0a6' },
    // Exactly the client's list (12 Oct feedback). Link Road, Malad,
    // Kandivali, Dahisar, Ovaripada and Devipada were removed; their routes,
    // cameras and card data stay in the sibling files.
    //
    // Routes added or re-traced on 19 Oct start at the south gate and follow
    // real roads (OpenStreetMap routing), with destinations taken from Google
    // Maps; the twin tunnel ends at its Borivali portal by Magathane.
    locations: [
      { id: 'access-western-express-highway', name: 'Western Express Highway', position: null },
      { id: 'access-sv-road', name: 'SV Road', position: null },
      { id: 'access-borivali', name: 'Borivali Railway Station', position: null },
      { id: 'access-magathane', name: 'Magathane Metro Station', position: null },
      { id: 'access-twin-tunnel', name: 'Borivali-Thane Twin Tunnel', position: null },
    ],
    // Display-only sub-groups (rendered by the drop-up); `locations` above stays
    // the flat source of truth the marker/camera passes read. ids reference the
    // locations above, no duplication. Every access location is in exactly one group.
    groups: [
      { label: 'Highways & Roads', ids: ['access-western-express-highway', 'access-sv-road', 'access-twin-tunnel'] },
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
      // feedback), Oberoi Mall added. The old "PVR" pin already stood on Oberoi
      // Mall in Goregaon, and the PVR INOX nearest the project is inside Sky City
      // Mall, so PVR is folded into those two rather than kept as a third pin.
      { id: 'leisure-oberoi-mall', name: 'Oberoi Mall', position: null },
      // Upcoming, on the CCI land facing the highway (one of the three white
      // blocks drawn next to the project, see SiteBlocks).
      { id: 'leisure-dmart', name: "India's Largest DMart", position: null },
    ],
    // Display-only sub-groups; every leisure location is in exactly one group.
    groups: [
      { label: 'Malls', ids: ['leisure-oberoi-sky-city', 'leisure-raghuleela-mall', 'leisure-oberoi-mall'] },
      { label: 'Shopping', ids: ['leisure-dmart'] },
    ],
  },
  healthcare: {
    markerStyle: { shape: 'square', color: '#22c55e' },
    locations: [
      { id: 'healthcare-apex', name: 'Apex Hospital', position: null },
      { id: 'healthcare-surbhi', name: 'Surbhi Hospital', position: null },
      { id: 'healthcare-seven-star', name: 'Seven Star Hospital', position: null },
      // Upcoming, on the CCI land facing the highway (one of the three white
      // blocks drawn next to the project, see SiteBlocks). Card photo still to
      // come: drop "Damania Hospital.webp" into src/assets/locations/images/.
      { id: 'healthcare-damania', name: 'Damania Hospital', position: null },
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
      // Children's Academy School removed (12 Oct feedback); Oberoi
      // International School added (its Oberoi Garden City campus, Goregaon East).
      { id: 'schools-oberoi-international', name: 'Oberoi International School', position: null },
    ],
  },
  business: {
    markerStyle: { shape: 'dot', color: '#14b8a6' },
    locations: [
      { id: 'business-wadhwa-techno-park', name: 'Wadhwa Techno Park', position: null },
      { id: 'business-agora-business-plaza', name: 'Agora Business Plaza', position: null },
      { id: 'business-western-edge', name: 'Western Edge', position: null },
      { id: 'business-mahindra', name: 'Mahindra & Mahindra Ltd.', position: null },
      // Upcoming Hines office tower on the CCI land facing the highway (12 Oct
      // feedback; one of the three white blocks drawn next to the project).
      { id: 'business-hines', name: 'Hines Tower', position: null },
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
