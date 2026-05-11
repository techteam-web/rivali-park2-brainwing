// Hotspot detail pages for the Sky Club. Mirrors socialClubHotspots —
// each entry powers one slide in SkyClubHotspot.jsx; coordinates are
// normalized (0..1) against a 1440x1024 reference frame.
//
// Order here is the scroll order on the slider; `progress` (0..1) controls
// how far the bottom-right wavy progress bar fills on each slide. Five
// slides → 1/5, 2/5, 3/5, 4/5, 5/5.

const ASSET_BASE = '/gallery/hotspots/sky club'

export const skyClubHotspots = [
  {
    slug: 'viewing-decks',
    name: 'Viewing Decks',
    bg: `${ASSET_BASE}/viewing decks bg.webp`,
    progress: 0.2,
    decoratives: [],
  },
  {
    slug: 'kids-play-area',
    name: 'Kids Play Area',
    bg: `${ASSET_BASE}/kids play area bg.webp`,
    objectPosition: 'center bottom',
    progress: 0.4,
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
    name: 'Guest Rooms',
    bg: `${ASSET_BASE}/guest suites bg.webp`,
    objectPosition: 'center bottom',
    progress: 0.6,
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
    slug: 'sky-fitness',
    name: 'Sky Fitness',
    bg: `${ASSET_BASE}/gymnasium bg.webp`,
    progress: 0.8,
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
    name: 'Spa',
    bg: `${ASSET_BASE}/spa bg.webp`,
    progress: 1,
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
