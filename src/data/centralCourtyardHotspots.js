// Hotspot detail pages for the Central Courtyard. Mirrors
// socialClubHotspots — each entry powers one slide in
// CentralCourtyardHotspot.jsx; coordinates are normalized (0..1) against a
// 1440x1024 reference frame.
//
// `progress` is written as index/total, so every entry has to be renumbered
// whenever one is added or removed. Colonnade and Multipurpose Courts were
// removed by the 12 Oct feedback (their renders stay on disk).

const ASSET_BASE = '/gallery/hotspots/central courtyard'

export const centralCourtyardHotspots = [
  {
    slug: 'coffee-shop',
    name: 'Wellness Club',
    bg: `${ASSET_BASE}/coffee shop bg.webp`,
    progress: 1 / 8,
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
    name: 'Leisure Pool',
    bg: `${ASSET_BASE}/leisure pool bg.webp`,
    progress: 2 / 8,
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
    progress: 3 / 8,
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
    name: 'Kids Play',
    bg: `${ASSET_BASE}/kids play area bg.webp`,
    progress: 4 / 8,
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
  // Project renders (16 Oct) rather than stock photos, so these slides carry
  // the "Artist's impression" note. No line drawings over them yet.
  {
    slug: 'cocoon-seating',
    name: 'Cocoon Seating',
    bg: `${ASSET_BASE}/cocoon seating bg.webp`,
    note: 'render',
    progress: 5 / 8,
    decoratives: [],
  },
  {
    slug: 'cocoon-seating-2',
    name: 'Cocoon Seating',
    bg: `${ASSET_BASE}/cocoon seating 2 bg.webp`,
    note: 'render',
    // Very wide frame with the cocoon at its right end; keep that end in view
    // where the screen crops the sides.
    objectPosition: '85% center',
    progress: 6 / 8,
    decoratives: [],
  },
  {
    slug: 'amphitheatre',
    name: 'Amphitheatre',
    bg: `${ASSET_BASE}/amphitheatre bg.webp`,
    note: 'render',
    progress: 7 / 8,
    decoratives: [],
  },
  // The courtyard's previous landing render (night view over the central
  // lawn), reused here since the landing moved to the 12 Oct daytime render.
  {
    slug: 'multi-purpose-lawns',
    name: 'Multi purpose lawns',
    bg: `${ASSET_BASE}/multi purpose lawns bg.webp`,
    note: 'render',
    progress: 8 / 8,
    decoratives: [],
  },
]

export const findCentralCourtyardHotspotIndex = (slug) =>
  centralCourtyardHotspots.findIndex((h) => h.slug === slug)
