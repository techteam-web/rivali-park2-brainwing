// Hotspot detail pages for the Wellness Club. Mirrors socialClubHotspots —
// each entry powers one slide in WellnessClubHotspot.jsx; coordinates are
// normalized (0..1) against a 1440x1024 reference frame.
//
// Order matches the icon order on the landing screen (see WellnessClub.jsx).
// Wellness Bar was dropped here along with its icon (13 Aug mark-up, which
// relabelled that spot Salon); its render is still on disk if it comes back.

const ASSET_BASE = '/gallery/hotspots/wellness club'

export const wellnessClubHotspots = [
  {
    slug: 'outdoor-amphitheatre',
    name: 'Outdoor Amphitheatre',
    bg: `${ASSET_BASE}/outdoor amphitheatre bg.webp`,
    progress: 0.2,
    // Placements measured from the design team's Figma export for this frame.
    // The delivered render is a 4x export of their 1440x1024 artboard, so the
    // numbers are normalized against that artboard. Two corrections are baked
    // in: Figma reports a group's box as geometry bounds while the exported SVG
    // includes the stroke, and the man's layer carries a drop-shadow filter that
    // pads his export canvas by ~19px a side, which has to come back off.
    // Neither figure is mirrored here: the man's layer carries a matrix(-1) but
    // his export already has it baked in, so re-applying it would face him the
    // wrong way. Checked against the client's own composite.
    decoratives: [
      {
        name: 'woman',
        src: `${ASSET_BASE}/woman-amphitheatre.svg`,
        top: 0.5062,
        left: 0.6121,
        width: 0.0625,
      },
      {
        name: 'man',
        src: `${ASSET_BASE}/man-amphitheatre.svg`,
        top: 0.4099,
        left: 0.8127,
        width: 0.0895,
      },
    ],
  },
  {
    slug: 'spa',
    name: 'Spa',
    bg: `${ASSET_BASE}/spa bg.webp`,
    progress: 0.4,
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
    slug: 'salon',
    name: 'Salon',
    bg: `${ASSET_BASE}/salon bg.webp`,
    progress: 0.6,
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
    slug: 'spa-and-wellness-cafe',
    name: 'Spa and Wellness Cafe',
    bg: `${ASSET_BASE}/spa and wellness cafe bg.webp`,
    progress: 0.8,
    decoratives: [
      // Placements measured from the design team's Figma export for this frame.
      //
      // Only one lamp-cluster drawing was exported, and it is CLIPPED by the
      // artboard: the cords run off the top, so it carries no ceiling roses.
      // That suits the two outer clusters, which hang from above the frame —
      // each is placed with its top pushed down by the ~90px the export lost,
      // which is what lands the shades correctly on the left one even though it
      // sits at a different offset. The two middle clusters DO show their
      // ceiling roses and are arranged differently, so they are not here; they
      // need a full-height export of their own.
      //
      // The left cluster is the right one mirrored. That is not read off the
      // Figma transform — the export already has its own instance's transform
      // baked in — but scored both ways against the client's own composite.
      {
        name: 'lamp-cluster-right',
        src: `${ASSET_BASE}/lamp-cluster-dining.svg`,
        top: 0,
        left: 0.7598,
        width: 0.1750,
      },
      {
        name: 'lamp-cluster-left',
        src: `${ASSET_BASE}/lamp-cluster-dining.svg`,
        top: -0.0107,
        left: 0.0763,
        width: 0.1745,
        flip: true,
      },
      {
        name: 'bottles-left',
        src: `${ASSET_BASE}/bottles-dining.svg`,
        top: 0.6316,
        left: 0.2387,
        width: 0.0222,
      },
      {
        name: 'bottles-right',
        src: `${ASSET_BASE}/bottles-dining.svg`,
        top: 0.6128,
        left: 0.7899,
        width: 0.0220,
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
