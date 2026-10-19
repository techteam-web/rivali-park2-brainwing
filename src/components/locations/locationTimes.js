// Real travel times per location (walk / bike / car / transit), keyed by location id.
// Consumed by LocationCard. Locations with no entry here fall back to '--' on the card.
// Every listed location was refreshed from Google Maps directions on 19 Oct, from the
// project's south gate (CCI Compound, Western Express Highway); "bike" is Google's
// two-wheeler time. Singapore International School's walk is distance at walking pace,
// since Google's walking route there detours round the Dahisar toll plaza (6 h 28 m).

export const locationTimes = {
  'access-western-express-highway': { walk: '4 mins', bike: '2 mins', car: '2 mins', transit: '4 mins' },
  'access-link-road': { walk: '60 mins', bike: '12 mins', car: '15 mins', transit: '55 mins' },
  'access-sv-road': { walk: '32 mins', bike: '6 mins', car: '6 mins', transit: '32 mins' },
  'access-borivali': { walk: '38 mins', bike: '8 mins', car: '8 mins', transit: '38 mins' },
  'access-malad': { walk: '75 mins', bike: '12 mins', car: '13 mins', transit: '32 mins' },
  'access-kandivali': { walk: '46 mins', bike: '10 mins', car: '11 mins', transit: '27 mins' },
  'access-dahisar': { walk: '72 mins', bike: '12 mins', car: '14 mins', transit: '40 mins' },
  'access-magathane': { walk: '5 mins', bike: '2 mins', car: '2 mins', transit: '5 mins' },
  'access-ovaripada': { walk: '61 mins', bike: '8 mins', car: '8 mins', transit: '21 mins' },
  'access-devipada': { walk: '22 mins', bike: '6 mins', car: '7 mins', transit: '22 mins' },
  'leisure-oberoi-sky-city': { walk: '17 mins', bike: '5 mins', car: '5 mins', transit: '17 mins' },
  'leisure-raghuleela-mall': { walk: '41 mins', bike: '11 mins', car: '10 mins', transit: '41 mins' },
  'leisure-growels-mall': { walk: '41 mins', bike: '5 mins', car: '6 mins', transit: '17 mins' },
  'leisure-thakur-mall': { walk: '170 mins', bike: '10 mins', car: '11 mins', transit: '31 mins' },
  'leisure-carnival-cinema': { walk: '80 mins', bike: '10 mins', car: '12 mins', transit: '75 mins' },
  'leisure-pvr': { walk: '85 mins', bike: '9 mins', car: '10 mins', transit: '72 mins' },
  'leisure-evershine-dream-park': { walk: '21 mins', bike: '4 mins', car: '5 mins', transit: '19 mins' },
  'healthcare-apex': { walk: '15 mins', bike: '4 mins', car: '4 mins', transit: '15 mins' },
  'healthcare-surbhi': { walk: '13 mins', bike: '6 mins', car: '7 mins', transit: '13 mins' },
  'healthcare-seven-star': { walk: '12 mins', bike: '7 mins', car: '7 mins', transit: '12 mins' },
  'schools-singapore-international': { walk: '82 mins', bike: '16 mins', car: '16 mins', transit: '53 mins' },
  'schools-jbcn-international': { walk: '68 mins', bike: '11 mins', car: '11 mins', transit: '44 mins' },
  'schools-chatrabhuj-narsee': { walk: '24 mins', bike: '8 mins', car: '8 mins', transit: '24 mins' },
  'schools-cambridge': { walk: '20 mins', bike: '8 mins', car: '8 mins', transit: '20 mins' },
  'schools-oxford-international': { walk: '30 mins', bike: '9 mins', car: '10 mins', transit: '30 mins' },
  'schools-childrens-academy': { walk: '11 mins', bike: '3 mins', car: '4 mins', transit: '10 mins' },
  'business-wadhwa-techno-park': { walk: '69 mins', bike: '11 mins', car: '10 mins', transit: '52 mins' },
  'business-agora-business-plaza': { walk: '33 mins', bike: '9 mins', car: '8 mins', transit: '33 mins' },
  'business-western-edge': { walk: '9 mins', bike: '3 mins', car: '3 mins', transit: '9 mins' },
  'business-mahindra': { walk: '25 mins', bike: '7 mins', car: '7 mins', transit: '20 mins' },
  'parks-sanjay-gandhi-national-park': { walk: '38 mins', bike: '6 mins', car: '6 mins', transit: '38 mins' },
  'access-twin-tunnel': { walk: '19 mins', bike: '5 mins', car: '5 mins', transit: '19 mins' },
  'leisure-oberoi-mall': { walk: '81 mins', bike: '13 mins', car: '13 mins', transit: '32 mins' },
  'schools-oberoi-international': { walk: '89 mins', bike: '13 mins', car: '12 mins', transit: '45 mins' },
  'business-hines': { walk: '5 mins', bike: '3 mins', car: '3 mins', transit: '5 mins' },
  'leisure-dmart': { walk: '6 mins', bike: '3 mins', car: '3 mins', transit: '6 mins' },
  'healthcare-damania': { walk: '6 mins', bike: '3 mins', car: '3 mins', transit: '6 mins' },
}

// null when a location has no times yet (card shows '--' placeholders).
export const getLocationTimes = (id) => locationTimes[id] ?? null
