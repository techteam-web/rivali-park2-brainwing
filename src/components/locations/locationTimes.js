// Real travel times per location (walk / bike / car / transit), keyed by location id.
// Consumed by LocationCard. Locations with no entry here fall back to '--' on the card.
// Photos, blurbs, and the distance pill are still placeholders elsewhere; only times are real.

export const locationTimes = {
  'access-western-express-highway': { walk: '10 mins', bike: '3 mins', car: '5 mins', transit: '6 mins' },
  'access-link-road': { walk: '60 mins', bike: '12 mins', car: '15 mins', transit: '55 mins' },
  'access-sv-road': { walk: '153 mins', bike: '19 mins', car: '21 mins', transit: '63 mins' },
  'access-borivali': { walk: '41 mins', bike: '10 mins', car: '11 mins', transit: '27 mins' },
  'access-malad': { walk: '75 mins', bike: '12 mins', car: '13 mins', transit: '32 mins' },
  'access-kandivali': { walk: '46 mins', bike: '10 mins', car: '11 mins', transit: '27 mins' },
  'access-dahisar': { walk: '72 mins', bike: '12 mins', car: '14 mins', transit: '40 mins' },
  'access-magathane': { walk: '16 mins', bike: '4 mins', car: '5 mins', transit: '16 mins' },
  'access-ovaripada': { walk: '61 mins', bike: '8 mins', car: '8 mins', transit: '21 mins' },
  'access-devipada': { walk: '22 mins', bike: '6 mins', car: '7 mins', transit: '22 mins' },
  'leisure-oberoi-sky-city': { walk: '18 mins', bike: '5 mins', car: '6 mins', transit: '18 mins' },
  'leisure-raghuleela-mall': { walk: '40 mins', bike: '8 mins', car: '10 mins', transit: '40 mins' },
  'leisure-growels-mall': { walk: '41 mins', bike: '5 mins', car: '6 mins', transit: '17 mins' },
  'leisure-thakur-mall': { walk: '170 mins', bike: '10 mins', car: '11 mins', transit: '31 mins' },
  'leisure-carnival-cinema': { walk: '80 mins', bike: '10 mins', car: '12 mins', transit: '75 mins' },
  'leisure-pvr': { walk: '85 mins', bike: '9 mins', car: '10 mins', transit: '72 mins' },
  'leisure-evershine-dream-park': { walk: '21 mins', bike: '4 mins', car: '5 mins', transit: '19 mins' },
  'healthcare-apex': { walk: '15 mins', bike: '5 mins', car: '6 mins', transit: '14 mins' },
  'healthcare-surbhi': { walk: '13 mins', bike: '5 mins', car: '6 mins', transit: '13 mins' },
  'healthcare-seven-star': { walk: '12 mins', bike: '4 mins', car: '4 mins', transit: '12 mins' },
  'schools-singapore-international': { walk: '190 mins', bike: '12 mins', car: '14 mins', transit: '38 mins' },
  'schools-jbcn-international': { walk: '75 mins', bike: '12 mins', car: '14 mins', transit: '50 mins' },
  'schools-chatrabhuj-narsee': { walk: '23 mins', bike: '5 mins', car: '6 mins', transit: '23 mins' },
  'schools-cambridge': { walk: '21 mins', bike: '5 mins', car: '6 mins', transit: '15 mins' },
  'schools-oxford-international': { walk: '30 mins', bike: '6 mins', car: '7 mins', transit: '28 mins' },
  'schools-childrens-academy': { walk: '11 mins', bike: '3 mins', car: '4 mins', transit: '10 mins' },
  'business-wadhwa-techno-park': { walk: '71 mins', bike: '14 mins', car: '14 mins', transit: '58 mins' },
  'business-agora-business-plaza': { walk: '33 mins', bike: '7 mins', car: '9 mins', transit: '33 mins' },
  'business-western-edge': { walk: '7 mins', bike: '4 mins', car: '4 mins', transit: '7 mins' },
  'business-mahindra': { walk: '25 mins', bike: '4 mins', car: '5 mins', transit: '12 mins' },
  'parks-sanjay-gandhi-national-park': { walk: '38 mins', bike: '5 mins', car: '6 mins', transit: '20 mins' },
}

// null when a location has no times yet (card shows '--' placeholders).
export const getLocationTimes = (id) => locationTimes[id] ?? null
