// Road distance from Rivali Park 2's south gate to each location, keyed by id: the length
// of its route in locationsPaths.js. World units are metres (the map matches real
// distances to within 0.4%, fitted against the Western Express Highway); routes follow
// OpenStreetMap roads (19 Oct). Formatted: metres under 1 km, km above.
// getLocationDistance(id) returns the label (drop-in for the card's distance pill), or null.

export const locationDistances = {
  'access-western-express-highway': { meters: 252, label: '250 m' },
  'access-link-road': { meters: 3218, label: '3.2 km' },
  'access-sv-road': { meters: 2259, label: '2.3 km' },
  'access-borivali': { meters: 2596, label: '2.6 km' },
  'access-malad': { meters: 5905, label: '5.9 km' },
  'access-kandivali': { meters: 4583, label: '4.6 km' },
  'access-dahisar': { meters: 5432, label: '5.4 km' },
  'access-magathane': { meters: 371, label: '370 m' },
  'access-ovaripada': { meters: 3284, label: '3.3 km' },
  'access-devipada': { meters: 1437, label: '1.4 km' },
  'leisure-oberoi-sky-city': { meters: 1148, label: '1.1 km' },
  'leisure-raghuleela-mall': { meters: 3541, label: '3.5 km' },
  'leisure-growels-mall': { meters: 2416, label: '2.4 km' },
  'leisure-thakur-mall': { meters: 5644, label: '5.6 km' },
  'leisure-carnival-cinema': { meters: 5827, label: '5.8 km' },
  'leisure-pvr': { meters: 5821, label: '5.8 km' },
  'leisure-evershine-dream-park': { meters: 1602, label: '1.6 km' },
  'healthcare-apex': { meters: 1093, label: '1.1 km' },
  'healthcare-surbhi': { meters: 919, label: '920 m' },
  'healthcare-seven-star': { meters: 827, label: '830 m' },
  'schools-singapore-international': { meters: 6572, label: '6.6 km' },
  'schools-jbcn-international': { meters: 5146, label: '5.1 km' },
  'schools-chatrabhuj-narsee': { meters: 1522, label: '1.5 km' },
  'schools-cambridge': { meters: 1503, label: '1.5 km' },
  'schools-oxford-international': { meters: 3404, label: '3.4 km' },
  'schools-childrens-academy': { meters: 871, label: '870 m' },
  'business-wadhwa-techno-park': { meters: 5351, label: '5.4 km' },
  'business-agora-business-plaza': { meters: 2326, label: '2.3 km' },
  'business-western-edge': { meters: 609, label: '610 m' },
  'business-mahindra': { meters: 1752, label: '1.8 km' },
  'parks-sanjay-gandhi-national-park': { meters: 2150, label: '2.2 km' },
  'access-twin-tunnel': { meters: 1325, label: '1.3 km' },
  'leisure-oberoi-mall': { meters: 7183, label: '7.2 km' },
  'schools-oberoi-international': { meters: 7844, label: '7.8 km' },
  'business-hines': { meters: 255, label: '260 m' },
  'leisure-dmart': { meters: 332, label: '330 m' },
  'healthcare-damania': { meters: 345, label: '350 m' },
}

// null when a location has no distance (card falls back to its placeholder).
export const getLocationDistance = (id) => locationDistances[id]?.label ?? null
