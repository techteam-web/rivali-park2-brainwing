// Hotspot detail pages for the Wellness Club. Mirrors socialClubHotspots —
// each entry powers one slide in WellnessClubHotspot.jsx; coordinates are
// normalized (0..1) against a 1440x1024 reference frame.

const ASSET_BASE = '/gallery/hotspots/wellness club'

export const wellnessClubHotspots = [
  {
    slug: 'wellness-bar',
    name: 'Wellness Bar',
    bg: `${ASSET_BASE}/sports bar bg.webp`,
    progress: 0.25,
    decoratives: [
      {
        name: 'wine',
        src: `${ASSET_BASE}/wine-sports-bar.svg`,
        top: 0.475,
        left: 0.066,
        width: 0.044,
      },
      {
        name: 'cup',
        src: `${ASSET_BASE}/cup-sports-bar-decorative.svg`,
        top: 0.626,
        left: 0.341,
        width: 0.045,
      },
      {
        name: 'mug',
        src: `${ASSET_BASE}/mug-sports-bar.svg`,
        top: 0.610,
        left: 0.700,
        width: 0.091,
      },
    ],
  },
  {
    slug: 'salon',
    name: 'Salon',
    bg: `${ASSET_BASE}/salon bg.webp`,
    progress: 0.5,
    decoratives: [
      {
        name: 'flower-pot-left',
        src: `${ASSET_BASE}/flower-pot-left-salon-decorative.svg`,
        top: 0.459,
        left: 0.022,
        width: 0.062,
      },
      {
        name: 'flower-pot-right',
        src: `${ASSET_BASE}/flower-pot-right-salon-decorative.svg`,
        top: 0.336,
        left: 0.918,
        width: 0.081,
      },
    ],
  },
  {
    slug: 'spa',
    name: 'Spa',
    bg: `${ASSET_BASE}/spa bg.webp`,
    progress: 0.75,
    decoratives: [
      {
        name: 'tiny-table',
        src: `${ASSET_BASE}/tiny-table-spa-decorative.svg`,
        top: 0.56,
        left: 0.16,
        width: 0.07,
      },
    ],
  },
  {
    slug: 'gymnasium',
    name: 'Gymnasium',
    bg: `${ASSET_BASE}/gymnasium bg.webp`,
    objectPosition: 'center bottom',
    progress: 1,
    decoratives: [
      {
        name: 'equipments',
        src: `${ASSET_BASE}/equipments-gymnasium-decorative.svg`,
        top: 0.6,
        left: 0.30,
        width: 0.4,
      },
    ],
  },
]

export const findWellnessHotspotIndex = (slug) =>
  wellnessClubHotspots.findIndex((h) => h.slug === slug)
