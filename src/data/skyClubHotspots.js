// Hotspot detail pages for the Sky Club. Mirrors socialClubHotspots —
// each entry powers one slide in SkyClubHotspot.jsx; coordinates are
// normalized (0..1) against a 1440x1024 reference frame.
//
// Order here is the scroll order on the slider, and matches the icon order on
// the landing screen (see SkyClub.jsx); `progress` (0..1) controls how far the
// bottom-right wavy progress bar fills on each slide, so it is written as
// index/total and every entry is renumbered when one is added or removed.

const ASSET_BASE = '/gallery/hotspots/sky club'

export const skyClubHotspots = [
  {
    slug: 'viewing-decks',
    name: 'Viewing decks',
    bg: `${ASSET_BASE}/viewing decks bg.webp`,
    progress: 1 / 6,
    decoratives: [],
  },
  {
    slug: 'kids-play-area',
    name: 'Kids club',
    bg: `${ASSET_BASE}/kids play area bg.webp`,
    objectPosition: 'center bottom',
    progress: 2 / 6,
    decoratives: [
      {
        name: 'left-car',
        src: `${ASSET_BASE}/left-car-kids-decorative.svg`,
        top: 0.574,
        left: 0.26,
        width: 0.08,
      },
      {
        name: 'left-car-2',
        src: `${ASSET_BASE}/left-car-2-kids-decorative.svg`,
        top: 0.559,
        left: 0.336,
        width: 0.061,
      },
      {
        name: 'ball',
        src: `${ASSET_BASE}/ball-kids-decorative.svg`,
        top: 0.566,
        left: 0.644,
        width: 0.04,
      },
    ],
  },
  {
    slug: 'guest-rooms',
    name: 'Sky suites',
    bg: `${ASSET_BASE}/guest suites bg.webp`,
    objectPosition: 'center bottom',
    progress: 3 / 6,
    decoratives: [
      {
        name: 'left-vase',
        src: `${ASSET_BASE}/left-vase-guests.svg`,
        top: 0.512,
        left: 0.133,
        width: 0.07,
      },
      {
        name: 'book',
        src: `${ASSET_BASE}/book-guests.svg`,
        top: 0.607,
        left: 0.372,
        width: 0.044,
      },
      {
        name: 'table-right',
        src: `${ASSET_BASE}/table-right-guests.svg`,
        top: 0.618,
        left: 0.634,
        width: 0.151,
      },
    ],
  },
  {
    slug: 'banquet-hall',
    name: 'Sky Lounge',
    bg: `${ASSET_BASE}/banquet hall bg.webp`,
    progress: 4 / 6,
    // Placement measured from the design team's Figma export for this frame.
    // The delivered render is a 4x export of their 1440x1024 artboard, so the
    // numbers are normalized against that artboard; and because Figma reports a
    // group's box as geometry bounds while the exported SVG canvas includes the
    // stroke, `width` is the geometry width grown by one stroke and `top`/`left`
    // are pulled back by half of one.
    decoratives: [
      {
        name: 'table',
        src: `${ASSET_BASE}/table-banquet-hall.svg`,
        top: 0.5195,
        left: 0.2919,
        width: 0.4370,
      },
    ],
  },
  {
    slug: 'sky-fitness',
    name: 'Sky Gym',
    bg: `${ASSET_BASE}/gymnasium bg.webp`,
    progress: 5 / 6,
    decoratives: [
      {
        name: 'dumbell',
        src: `${ASSET_BASE}/dumbell-gymnasium.svg`,
        top: 0.572,
        left: 0.445,
        width: 0.078,
      },
      {
        name: 'bottle',
        src: `${ASSET_BASE}/bottle-gymnasium.svg`,
        top: 0.579,
        left: 0.352,
        width: 0.012,
      },
      {
        name: 'equipment',
        src: `${ASSET_BASE}/equipment-gymnasium.svg`,
        top: 0.58,
        left: 0.861,
        width: 0.033,
      },
    ],
  },
  {
    slug: 'spa',
    name: 'Spa and Open to sky Jacuzzi',
    bg: `${ASSET_BASE}/spa bg.webp`,
    progress: 6 / 6,
    decoratives: [
      {
        name: 'left-cloud',
        src: `${ASSET_BASE}/left-cloud-spa-decorative.svg`,
        top: 0.155,
        left: 0.317,
        width: 0.097,
      },
      {
        name: 'right-cloud',
        src: `${ASSET_BASE}/right-cloud-spa-decorative.svg`,
        top: 0.181,
        left: 0.598,
        width: 0.12,
      },
    ],
  },
]

export const findSkyHotspotIndex = (slug) =>
  skyClubHotspots.findIndex((h) => h.slug === slug)
