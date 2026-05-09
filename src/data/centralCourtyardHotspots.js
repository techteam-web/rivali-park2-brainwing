// Hotspot detail pages for the Central Courtyard. Mirrors
// socialClubHotspots — each entry powers one slide in
// CentralCourtyardHotspot.jsx; coordinates are normalized (0..1) against a
// 1440x1024 reference frame.

const ASSET_BASE = '/gallery/hotspots/central courtyard'

export const centralCourtyardHotspots = [
  {
    slug: 'liesure-pool',
    name: 'Liesure Pool',
    bg: `${ASSET_BASE}/Leisure Pool bg.png`,
    progress: 0.25,
    decoratives: [
      {
        name: 'water-splash',
        src: `${ASSET_BASE}/water-splash-swimming-pool-decorative.svg`,
        top: 0.549,
        left: 0.526,
        width: 0.258,
      },
      {
        name: 'falling-water',
        src: `${ASSET_BASE}/falling-water-swimming-pool-decorative.svg`,
        top: 0.293,
        left: 0.795,
        width: 0.117,
      },
    ],
  },
  {
    slug: 'swimming-pool',
    name: 'Swimming Pool',
    bg: `${ASSET_BASE}/Swimming Pool bg.png`,
    progress: 0.5,
    decoratives: [
      {
        name: 'flamingo',
        src: `${ASSET_BASE}/flamingo-floate-swimming-pool.svg`,
        top: 0.6,
        left: 0.549,
        width: 0.12,
      },
    ],
  },
  {
    slug: 'kids-play-area',
    name: 'Kids Play Area',
    bg: `${ASSET_BASE}/Play Area bg.png`,
    progress: 0.75,
    decoratives: [
      {
        name: 'kids',
        src: `${ASSET_BASE}/kids-kids-play-area-decorative.svg`,
        top: 0.55,
        left: 0.307,
        width: 0.142,
      },
    ],
  },
  {
    slug: 'multipurpose-courts',
    name: 'Multipurpose Courts',
    bg: `${ASSET_BASE}/Multipurpose Courts bg.png`,
    progress: 1,
    // The Multipurpose Courts asset is portrait (753x1024) so object-cover
    // crops it horizontally on wide viewports. Pin the visible area to
    // the bottom-left so the courts stay anchored there. Tweak this value
    // (CSS object-position syntax: '<x> <y>') to slide what's visible.
    objectPosition: '0% 100%',
    decoratives: [
      {
        name: 'players',
        src: `${ASSET_BASE}/players-multipurpose-courts-decorative.svg`,
        top: 0.55,
        left: 0.1,
        width: 0.273,
      },
      {
        name: 'bushes',
        src: `${ASSET_BASE}/Bushes-multipurpose-courts-decorative.svg`,
        top: 0.57,
        left: 0.61,
        width: 0.081,
      },
    ],
  },
]

export const findCentralCourtyardHotspotIndex = (slug) =>
  centralCourtyardHotspots.findIndex((h) => h.slug === slug)
