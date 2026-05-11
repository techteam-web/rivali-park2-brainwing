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
    bg: `${ASSET_BASE}/banquet hall bg.webp`,
    progress: 0.33,
    decoratives: [
      {
        name: 'left-person',
        src: `${ASSET_BASE}/left-person-convention-decorative.svg`,
        top: 0.5,
        left: 0.128,
        width: 0.078,
      },
      {
        name: 'right-girl-1',
        src: `${ASSET_BASE}/right-girl-1-convention-decorative.svg`,
        top: 0.539,
        left: 0.824,
        width: 0.057,
      },
      {
        name: 'right-girl-2',
        src: `${ASSET_BASE}/right-girl-2-convention-decorative.svg`,
        top: 0.551,
        left: 0.911,
        width: 0.035,
      },
    ],
  },
  {
    slug: 'restaurant',
    name: 'Cafe',
    bg: `${ASSET_BASE}/cafe bg.webp`,
    progress: 0.66,
    decoratives: [
      {
        name: 'coffee',
        src: `${ASSET_BASE}/coffe-convention-decorative.svg`,
        top: 0.601,
        left: 0.195,
        width: 0.045,
      },
      {
        name: 'girl-reading',
        src: `${ASSET_BASE}/girl-reading-convention-decorative.svg`,
        top: 0.525,
        left: 0.568,
        width: 0.100,
      },
    ],
  },
  {
    slug: 'guest-rooms',
    name: 'Guest Rooms',
    bg: `${ASSET_BASE}/guests room bg.webp`,
    progress: 1,
    decoratives: [
      {
        name: 'flower-pot',
        src: `${ASSET_BASE}/flower-pot-guest-room-decorative.svg`,
        top: 0.500,
        left: 0.220,
        width: 0.080,
      },
      {
        name: 'book',
        src: `${ASSET_BASE}/book-guest-room-decorative.svg`,
        top: 0.530,
        left: 0.377,
        width: 0.080,
      },
      {
        name: 'clothes',
        src: `${ASSET_BASE}/clothes-guests-room-decorative.svg`,
        top: 0.560,
        left: 0.614,
        width: 0.065,
      },
    ],
  },
]

export const findConventionHotspotIndex = (slug) =>
  conventionCenterHotspots.findIndex((h) => h.slug === slug)
