// Hotspot detail pages for the Social Club. Each entry powers one slide in
// SocialClubHotspot.jsx — the slider swaps `bg`, `decoratives`, and `name`
// based on the active index.
//
// Coordinates are normalized (0..1) against a 1440x1024 reference frame so
// the layout scales cleanly across breakpoints, matching the cover-style
// background sizing used by the other gallery pages.
//
// `slug` is the URL segment for the hotspot detail route
// (/gallery/social-club/:hotspot). `progress` (0..1) controls how far the
// bottom-right progress bar's drawSVG fill extends on this slide. Add new
// entries here as designs land.

const ASSET_BASE = '/gallery/hotspots/social club'

export const socialClubHotspots = [
  {
    slug: 'social-media-studio',
    name: 'Social Media Studio',
    bg: `${ASSET_BASE}/social media studio bg.webp`,
    progress: 0.33,
    decoratives: [
      {
        name: 'lamp',
        src: `${ASSET_BASE}/lamp-social-media-decorative.svg`,
        top: 0.244,
        left: 0.442,
        width: 0.156,
      },
      {
        name: 'camera',
        src: `${ASSET_BASE}/camera-social-media-decorative.svg`,
        top: 0.583,
        left: 0.433,
        width: 0.060,
      },
    ],
  },
  {
    slug: 'screening-room',
    name: 'Screening Room',
    bg: `${ASSET_BASE}/screening room bg.webp`,
    bgPosition: 'bottom',
    progress: 0.66,
    decoratives: [
      {
        name: 'dog',
        src: `${ASSET_BASE}/dog-screening-room-decorative.svg`,
        top: 0.680,
        left: 0.358,
        width: 0.180,
      },
      {
        name: 'speaker',
        src: `${ASSET_BASE}/speaker-screening-room-decorative.svg`,
        top: 0.440,
        left: 0.523,
        width: 0.051,
      },
    ],
  },
  {
    slug: 'billiards-room',
    name: 'Billiards Room',
    bg: `${ASSET_BASE}/billiards room bg.webp`,
    progress: 1,
    decoratives: [],
  },
]

export const findHotspotIndex = (slug) =>
  socialClubHotspots.findIndex((h) => h.slug === slug)
