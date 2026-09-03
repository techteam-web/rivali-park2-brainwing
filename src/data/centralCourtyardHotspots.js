// Hotspot detail pages for the Central Courtyard. Mirrors
// socialClubHotspots — each entry powers one slide in
// CentralCourtyardHotspot.jsx; coordinates are normalized (0..1) against a
// 1440x1024 reference frame.
//
// `progress` is written as index/total, so every entry has to be renumbered
// whenever one is added or removed.

const ASSET_BASE = '/gallery/hotspots/central courtyard'

export const centralCourtyardHotspots = [
  {
    slug: 'art-gallery',
    name: 'Art Gallery',
    bg: `${ASSET_BASE}/art gallery bg.webp`,
    progress: 1 / 6,
    // Placements measured from the design team's Figma export for this frame.
    // The delivered render is a 4x export of their 1440x1024 artboard, so the
    // numbers are normalized against that artboard; `width` is the geometry
    // width grown by one stroke, and `top`/`left` are pulled back by half of
    // one, because Figma reports geometry bounds while the SVG includes the
    // stroke. The left visitor's layer also carries a drop-shadow filter that
    // pads his export canvas, which is measured off again here.
    decoratives: [
      {
        name: 'visitor-left',
        src: `${ASSET_BASE}/visitor-left-art-gallery.svg`,
        top: 0.4792,
        left: 0.3873,
        width: 0.0833,
      },
      {
        name: 'visitor-right',
        src: `${ASSET_BASE}/visitor-right-art-gallery.svg`,
        top: 0.5208,
        left: 0.7707,
        width: 0.0361,
      },
    ],
  },
  {
    slug: 'coffee-shop',
    name: 'Coffee Shop',
    bg: `${ASSET_BASE}/coffee shop bg.webp`,
    progress: 2 / 6,
    decoratives: [
      // Placements measured from the design team's Figma export for this frame,
      // normalized against their 1440x1024 artboard and corrected for the stroke
      // Figma leaves out of a group's box but the SVG canvas includes. Both are
      // set at a slight angle in the artwork; the rotation is baked into the
      // exports, so the boxes here are their upright bounds.
      {
        name: 'girl-reading',
        src: `${ASSET_BASE}/girl-reading-coffee-shop.svg`,
        top: 0.4862,
        left: 0.5764,
        width: 0.1107,
      },
      {
        name: 'coffee-cup',
        src: `${ASSET_BASE}/coffee-cup-coffee-shop.svg`,
        top: 0.5865,
        left: 0.2057,
        width: 0.0355,
      },
    ],
  },
  {
    slug: 'liesure-pool',
    name: 'Liesure Pool',
    bg: `${ASSET_BASE}/leisure pool bg.webp`,
    progress: 3 / 6,
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
    bg: `${ASSET_BASE}/swimming pool bg.webp`,
    progress: 4 / 6,
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
    bg: `${ASSET_BASE}/kids play area bg.webp`,
    progress: 5 / 6,
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
    bg: `${ASSET_BASE}/multipurpose courts bg.webp`,
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
