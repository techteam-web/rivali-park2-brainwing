// One-line card descriptions per location, keyed by location id.
// Tone matches the loader ("Convenient & connected"): warm, aspirational, grounded in what
// the place actually is. Two entries carry verified facts (Western Express Highway ~25 km to
// the airport; Sanjay Gandhi National Park = one of the world's largest urban forests). The
// rest are anchored to the place's verifiable identity (station / metro / mall / school /
// hospital / business hub) without asserting unverified specifics - sanity-check the local
// businesses against your own knowledge and edit freely.
// getLocationBlurb(id) returns the line, or null (card falls back to its placeholder blurb).

export const locationBlurbs = {
  // Access
  'access-western-express-highway': "Mumbai's 25 km arterial highway, sweeping you to the airport and beyond.",
  'access-link-road': "The western suburbs' key connector, keeping the whole city in easy reach.",
  'access-sv-road': 'Swami Vivekananda Road, the classic lifeline linking suburb to city.',
  'access-borivali': 'A major Western Line junction, where your journey into Mumbai begins.',
  'access-malad': 'A fast-growing western suburb, just a short ride down the line.',
  'access-kandivali': 'Western Line ease, with markets, malls and the city close at hand.',
  'access-dahisar': "Mumbai's northern gateway, your smooth entry into the western suburbs.",
  'access-magathane': 'A Metro Red Line station, gliding you effortlessly across the suburbs.',
  'access-ovaripada': 'Metro connectivity on the doorstep, the whole line within reach.',
  'access-devipada': 'A quick Metro halt nearby, quiet and seamless everyday travel.',

  // Leisure
  'leisure-oberoi-sky-city': 'Marquee brands, dining and retail therapy under one roof.',
  'leisure-raghuleela-mall': 'A buzzing mall for shopping, food and everyday indulgence.',
  'leisure-growels-mall': "Kandivali's lifestyle hub for shopping, dining and family days.",
  'leisure-thakur-mall': "Dahisar's favourite for retail, food courts and weekend fun.",
  'leisure-carnival-cinema': 'Blockbuster nights and big-screen magic, moments from home.',
  'leisure-pvr': 'Premium screens and showtime whenever the mood calls.',
  'leisure-evershine-dream-park': 'Rides, green lawns and easy escapes for the whole family.',

  // Healthcare
  'healthcare-apex': 'Trusted medical care, reassuringly close when it matters most.',
  'healthcare-surbhi': 'Dependable healthcare on hand, right around the corner.',
  'healthcare-seven-star': 'Quality care within easy reach, for peace of mind any hour.',

  // Schools
  'schools-singapore-international': 'A globally minded international school shaping curious young leaders.',
  'schools-jbcn-international': 'World-class international learning, a short journey from home.',
  'schools-chatrabhuj-narsee': 'A respected school nurturing bright young minds nearby.',
  'schools-cambridge': 'Quality schooling that puts a promising future within reach.',
  'schools-oxford-international': 'International education close by, opening doors from an early age.',
  'schools-childrens-academy': 'A well-loved academy where young learners truly thrive.',

  // Business
  'business-wadhwa-techno-park': 'A modern business address where careers take flight.',
  'business-agora-business-plaza': 'A thriving commercial hub, your workday just minutes away.',
  'business-western-edge': "Prime office space at the western suburbs' business edge.",
  'business-mahindra': "Beside one of India's industrial giants, opportunity close to home.",

  // Parks
  'parks-sanjay-gandhi-national-park': "One of the world's largest urban forests, wild right on your doorstep.",
}

// null when a location has no blurb (card shows its placeholder blurb).
export const getLocationBlurb = (id) => locationBlurbs[id] ?? null
