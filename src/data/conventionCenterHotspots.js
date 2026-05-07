// Hotspot detail pages for the Convention Center. Each entry powers one
// slide in ConventionCenterHotspot.jsx — the slider swaps `bg`,
// `decoratives`, and `name` based on the active index.
//
// Coordinates are normalized (0..1) against a 1440x1024 reference frame so
// the layout scales cleanly across breakpoints, matching the cover-style
// background sizing used by the other gallery pages.

const ASSET_BASE = '/gallery/hotspots/convention center'

export const conventionCenterHotspots = [
  {
    slug: 'banquet-hall',
    name: 'Banquet Hall',
    bg: `${ASSET_BASE}/Banquette bg.png`,
    progress: 0.33,
    decoratives: [
      {
        name: 'left-person',
        src: `${ASSET_BASE}/left-person-convention-decorative.svg`,
        top: 0.490,
        left: 0.128,
        width: 0.052,
      },
      {
        name: 'right-girl-1',
        src: `${ASSET_BASE}/right-girl-1-convention-decorative.svg`,
        top: 0.515,
        left: 0.844,
        width: 0.061,
      },
      {
        name: 'right-girl-2',
        src: `${ASSET_BASE}/right-girl-2-convention-decorative.svg`,
        top: 0.527,
        left: 0.937,
        width: 0.035,
      },
    ],
  },
  {
    slug: 'restaurant',
    name: 'Cafe',
    bg: `${ASSET_BASE}/Cafe bg.png`,
    progress: 0.66,
    decoratives: [
      {
        name: 'coffee',
        src: `${ASSET_BASE}/coffe-convention-decorative.svg`,
        top: 0.601,
        left: 0.145,
        width: 0.075,
      },
      {
        name: 'girl-reading',
        src: `${ASSET_BASE}/girl-reading-convention-decorative.svg`,
        top: 0.545,
        left: 0.538,
        width: 0.110,
      },
    ],
  },
  {
    slug: 'guest-rooms',
    name: 'Guest Rooms',
    bg: `${ASSET_BASE}/Guest rooms bg.png`,
    progress: 1,
    decoratives: [
      {
        name: 'flower-pot',
        src: `${ASSET_BASE}/flower-pot-guest-room-decorative.svg`,
        top: 0.500,
        left: 0.080,
        width: 0.060,
      },
      {
        name: 'book',
        src: `${ASSET_BASE}/book-guest-room-decorative.svg`,
        top: 0.620,
        left: 0.430,
        width: 0.060,
      },
      {
        name: 'clothes',
        src: `${ASSET_BASE}/clothes-guests-room-decorative.svg`,
        top: 0.560,
        left: 0.820,
        width: 0.055,
      },
    ],
  },
]

export const findConventionHotspotIndex = (slug) =>
  conventionCenterHotspots.findIndex((h) => h.slug === slug)
