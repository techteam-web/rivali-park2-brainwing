// Per-location card photos, keyed by location id.
// Images live in src/assets/locations/images/ and are resolved at build time via
// import.meta.glob (so the messy filenames - spaces, apostrophes, & - need no manual imports).
// getLocationImage(id) returns the image URL, or null if that location has no image yet
// (currently only healthcare-seven-star; drop "Seven Star Hospital.webp" into the folder and
// it will resolve automatically with no code change). The card falls back to its placeholder
// block when this returns null.
//
// NOTE: keep this file in src/components/locations/ so the glob path below resolves.

const files = import.meta.glob('../../assets/locations/images/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

// key the resolved URLs by bare filename
const byName = {}
for (const path in files) {
  byName[path.split('/').pop()] = files[path]
}

// location id -> exact filename in src/assets/locations/images/
const idToFile = {
  'access-western-express-highway': 'Western-express-highway.webp',
  'access-link-road': 'Link Road.webp',
  'access-sv-road': 'SV Road.webp',
  'access-borivali': 'Borivali.webp',
  'access-malad': 'Malad.webp',
  'access-kandivali': 'Kandivali.webp',
  'access-dahisar': 'Dahisar.webp',
  'access-magathane': 'Magathane Metro Station.webp',
  'access-ovaripada': 'Ovaripada.webp',
  'access-devipada': 'Devipada.webp',
  'leisure-oberoi-sky-city': 'Oberoi Sky City.webp',
  'leisure-raghuleela-mall': 'Raghuleela Mall.webp',
  'leisure-growels-mall': "Growel's Mall.webp",
  'leisure-thakur-mall': 'Thakur Mall.webp',
  'leisure-carnival-cinema': 'Carnival Cinema.webp',
  'leisure-pvr': 'PVR.webp',
  'leisure-evershine-dream-park': 'Evershine Dream Park.webp',
  'healthcare-apex': 'Apex Hospital.webp',
  'healthcare-surbhi': 'Surbhi Hospital.webp',
  'healthcare-seven-star': 'Seven Star Hospital.webp', // no file yet; resolves when added
  'schools-singapore-international': 'Singapore International School.webp',
  'schools-jbcn-international': 'JBCN International School.webp',
  'schools-chatrabhuj-narsee': 'Chatrabhuj Narsee School.webp',
  'schools-cambridge': 'Cambridge School.webp',
  'schools-oxford-international': 'Oxford International School.webp',
  'schools-childrens-academy': "Children's Academy.webp",
  'business-wadhwa-techno-park': 'Wadhwa Techno Park.webp',
  'business-agora-business-plaza': 'Agora.webp',
  'business-western-edge': 'Western Edge.webp',
  'business-mahindra': 'Mahindra & Mahindra LTD.webp',
  'parks-sanjay-gandhi-national-park': 'Sanjay Gandhi National Park.webp',
}

// null when the location has no image on disk yet (card shows its placeholder block).
export const getLocationImage = (id) => byName[idToFile[id]] ?? null
