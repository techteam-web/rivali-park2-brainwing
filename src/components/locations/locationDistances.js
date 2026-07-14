// Road distance from Rivali Park 2 (Kandivali East) to each location, keyed by id.
// Computed by summing the traced road-path geometry in locationsPaths.js (ground distance).
// World units are meters (map ~24 km across ~24,000 units); validated against travel-time
// speeds (e.g. SV Road 6.8 km / 21 min car = ~19 km/h). Formatted: meters under 1 km, km above.
// getLocationDistance(id) returns the label (drop-in for the card's distance pill), or null.

export const locationDistances = {
  'access-western-express-highway': { meters: 282, label: '280 m' },
  'access-link-road': { meters: 3218, label: '3.2 km' },
  'access-sv-road': { meters: 6753, label: '6.8 km' },
  'access-borivali': { meters: 3156, label: '3.2 km' },
  'access-malad': { meters: 5905, label: '5.9 km' },
  'access-kandivali': { meters: 4583, label: '4.6 km' },
  'access-dahisar': { meters: 5432, label: '5.4 km' },
  'access-magathane': { meters: 1976, label: '2.0 km' },
  'access-ovaripada': { meters: 3284, label: '3.3 km' },
  'access-devipada': { meters: 1437, label: '1.4 km' },
  'leisure-oberoi-sky-city': { meters: 1003, label: '1.0 km' },
  'leisure-raghuleela-mall': { meters: 2925, label: '2.9 km' },
  'leisure-growels-mall': { meters: 2416, label: '2.4 km' },
  'leisure-thakur-mall': { meters: 5644, label: '5.6 km' },
  'leisure-carnival-cinema': { meters: 5827, label: '5.8 km' },
  'leisure-pvr': { meters: 5821, label: '5.8 km' },
  'leisure-evershine-dream-park': { meters: 1602, label: '1.6 km' },
  'healthcare-apex': { meters: 980, label: '980 m' },
  'healthcare-surbhi': { meters: 1272, label: '1.3 km' },
  'healthcare-seven-star': { meters: 1166, label: '1.2 km' },
  'schools-singapore-international': { meters: 5934, label: '5.9 km' },
  'schools-jbcn-international': { meters: 4796, label: '4.8 km' },
  'schools-chatrabhuj-narsee': { meters: 1383, label: '1.4 km' },
  'schools-cambridge': { meters: 1601, label: '1.6 km' },
  'schools-oxford-international': { meters: 2161, label: '2.2 km' },
  'schools-childrens-academy': { meters: 871, label: '870 m' },
  'business-wadhwa-techno-park': { meters: 5710, label: '5.7 km' },
  'business-agora-business-plaza': { meters: 2036, label: '2.0 km' },
  'business-western-edge': { meters: 734, label: '730 m' },
  'business-mahindra': { meters: 2885, label: '2.9 km' },
  'parks-sanjay-gandhi-national-park': { meters: 1884, label: '1.9 km' },
}

// null when a location has no distance (card falls back to its placeholder).
export const getLocationDistance = (id) => locationDistances[id]?.label ?? null
