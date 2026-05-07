// Hotspot detail pages for the Wellness Club. Mirrors socialClubHotspots —
// each entry powers one slide in WellnessClubHotspot.jsx; coordinates are
// normalized (0..1) against a 1440x1024 reference frame.

const ASSET_BASE = '/gallery/hotspots/wellness club'

export const wellnessClubHotspots = [
  {
    slug: 'wellness-bar',
    name: 'Wellness Bar',
    bg: `${ASSET_BASE}/sports bar bg.png`,
    progress: 0.25,
    decoratives: [
      {
        name: 'wine',
        src: `${ASSET_BASE}/wine-sports-bar.svg`,
        top: 0.395,
        left: 0.052,
        width: 0.040,
      },
      {
        name: 'cup',
        src: `${ASSET_BASE}/cup-sports-bar-decorative.svg`,
        top: 0.560,
        left: 0.205,
        width: 0.052,
      },
      {
        name: 'mug',
        src: `${ASSET_BASE}/mug-sports-bar.svg`,
        top: 0.560,
        left: 0.840,
        width: 0.095,
      },
    ],
  },
  {
    slug: 'salon',
    name: 'Salon',
    bg: `${ASSET_BASE}/Salon bg.png`,
    progress: 0.5,
    decoratives: [
      {
        name: 'flower-pot-left',
        src: `${ASSET_BASE}/flower-pot-left-salon-decorative.svg`,
        top: 0.55,
        left: 0.10,
        width: 0.08,
      },
      {
        name: 'flower-pot-right',
        src: `${ASSET_BASE}/flower-pot-right-salon-decorative.svg`,
        top: 0.55,
        left: 0.85,
        width: 0.08,
      },
    ],
  },
  {
    slug: 'spa',
    name: 'Spa',
    bg: `${ASSET_BASE}/Spa bg.png`,
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
    bg: `${ASSET_BASE}/Gymnasium bg.png`,
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
