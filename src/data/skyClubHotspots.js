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
    bg: `${ASSET_BASE}/viewing decks bg.png`,
    progress: 0.2,
    decoratives: [],
  },
  {
    slug: 'kids-play-area',
    name: 'Kids Play Area',
    bg: `${ASSET_BASE}/kids play area bg.png`,
    progress: 0.4,
    decoratives: [
      {
        name: 'left-car',
        src: `${ASSET_BASE}/left-car-kids-decorative.svg`,
        top: 0.66,
        left: 0.12,
        width: 0.08,
      },
      {
        name: 'left-car-2',
        src: `${ASSET_BASE}/left-car-2-kids-decorative.svg`,
        top: 0.70,
        left: 0.04,
        width: 0.08,
      },
      {
        name: 'ball',
        src: `${ASSET_BASE}/ball-kids-decorative.svg`,
        top: 0.72,
        left: 0.50,
        width: 0.04,
      },
    ],
  },
  {
    slug: 'guest-rooms',
    name: 'Guest Rooms',
    bg: `${ASSET_BASE}/Guest suites bg.png`,
    progress: 0.6,
    decoratives: [
      {
        name: 'left-vase',
        src: `${ASSET_BASE}/left-vase-guests.svg`,
        top: 0.55,
        left: 0.10,
        width: 0.07,
      },
      {
        name: 'book',
        src: `${ASSET_BASE}/book-guests.svg`,
        top: 0.62,
        left: 0.42,
        width: 0.06,
      },
      {
        name: 'table-right',
        src: `${ASSET_BASE}/table-right-guests.svg`,
        top: 0.58,
        left: 0.78,
        width: 0.14,
      },
    ],
  },
  {
    slug: 'sky-fitness',
    name: 'Sky Fitness',
    bg: `${ASSET_BASE}/Gymnasium bg.png`,
    progress: 0.8,
    decoratives: [
      {
        name: 'dumbell',
        src: `${ASSET_BASE}/dumbell-gymnasium.svg`,
        top: 0.68,
        left: 0.28,
        width: 0.06,
      },
      {
        name: 'bottle',
        src: `${ASSET_BASE}/bottle-gymnasium.svg`,
        top: 0.62,
        left: 0.46,
        width: 0.04,
      },
      {
        name: 'equipment',
        src: `${ASSET_BASE}/equipment-gymnasium.svg`,
        top: 0.55,
        left: 0.62,
        width: 0.16,
      },
    ],
  },
  {
    slug: 'spa',
    name: 'Spa',
    bg: `${ASSET_BASE}/spa bg.png`,
    progress: 1,
    decoratives: [
      {
        name: 'left-cloud',
        src: `${ASSET_BASE}/left-cloud-spa-decorative.svg`,
        top: 0.18,
        left: 0.06,
        width: 0.12,
      },
      {
        name: 'right-cloud',
        src: `${ASSET_BASE}/right-cloud-spa-decorative.svg`,
        top: 0.14,
        left: 0.82,
        width: 0.12,
      },
    ],
  },
]

export const findSkyHotspotIndex = (slug) =>
  skyClubHotspots.findIndex((h) => h.slug === slug)
