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
    progress: 1 / 6,
    // Latest Figma frame (622:10099). The supplied render had these three
    // figures flattened into it, so they were lifted back out: the background
    // is that render with the clean photo patched in along each figure, and the
    // figures are the frame's own vector layers. Placement is normalized
    // against the 1440x1024 artboard and stroke-corrected; the woman and dog
    // are mirrored in Figma, which the exports do not carry, so they flip here.
    decoratives: [
      {
        name: 'woman',
        src: `${ASSET_BASE}/woman-outdoor-amphitheatre.svg`,
        top: 0.5347,
        left: 0.1897,
        width: 0.0581,
        flip: true,
      },
      {
        name: 'dog',
        src: `${ASSET_BASE}/dog-outdoor-amphitheatre.svg`,
        top: 0.6582,
        left: 0.5096,
        width: 0.0641,
        flip: true,
      },
      {
        name: 'runner',
        src: `${ASSET_BASE}/runner-outdoor-amphitheatre.svg`,
        top: 0.3513,
        left: 0.6984,
        width: 0.0614,
      },
    ],
  },
  {
    slug: 'spa',
    name: 'Spa',
    bg: `${ASSET_BASE}/spa bg.webp`,
    progress: 2 / 6,
    // New render (12 Oct) arrives with its line drawings already in the picture, so no SVG doodles go over it.
    decoratives: [],
  },
  {
    slug: 'salon',
    name: 'Salon',
    bg: `${ASSET_BASE}/salon bg.webp`,
    progress: 3 / 6,
    // New render (12 Oct) arrives with its line drawings already in the picture, so no SVG doodles go over it.
    decoratives: [],
  },
  {
    slug: 'spa-and-wellness-cafe',
    name: 'Wellness Cafe',
    bg: `${ASSET_BASE}/spa and wellness cafe bg.webp`,
    progress: 4 / 6,
    decoratives: [
      // Placements measured from the design team's Figma export for this frame.
      //
      // Only one lamp-cluster drawing was exported, and it is CLIPPED by the
      // artboard: the cords run off the top, so it carries no ceiling roses.
      // That suits the two outer clusters, which hang from above the frame —
      // each is placed with its top pushed down by the ~90px the export lost,
      // which is what lands the shades correctly on the left one even though it
      // sits at a different offset. The two middle clusters are further down.
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
      // The two middle clusters (Figma 622:7443 and 622:7466) are one smaller
      // arrangement, used twice, that shows its ceiling roses. It is built from
      // the frame's own single-lamp exports, each mirrored as it is in Figma,
      // and fits the design team's render of the frame to within half a pixel.
      {
        name: 'lamp-cluster-middle-left',
        src: `${ASSET_BASE}/lamp-cluster-middle-dining.svg`,
        top: 0.0533,
        left: 0.3241,
        width: 0.1081,
      },
      {
        name: 'lamp-cluster-middle-right',
        src: `${ASSET_BASE}/lamp-cluster-middle-dining.svg`,
        top: 0.0689,
        left: 0.5770,
        width: 0.1081,
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
    progress: 5 / 6,
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
  // Moved here from the Central Courtyard (12 Oct feedback): the courts sit on
  // the footpath in front of the gym. Render and doodles stay in the courtyard
  // folder, as before.
  {
    slug: 'multipurpose-courts',
    name: 'Multipurpose Courts',
    bg: '/gallery/hotspots/central courtyard/multipurpose courts bg.webp',
    progress: 1,
    // Portrait render (753x1024): pin the visible area to the bottom-left so
    // the courts stay in view on wide screens.
    objectPosition: '0% 100%',
    decoratives: [
      {
        name: 'players',
        src: '/gallery/hotspots/central courtyard/players-multipurpose-courts-decorative.svg',
        top: 0.55,
        left: 0.1,
        width: 0.273,
      },
      {
        name: 'bushes',
        src: '/gallery/hotspots/central courtyard/Bushes-multipurpose-courts-decorative.svg',
        top: 0.57,
        left: 0.61,
        width: 0.081,
      },
    ],
  },
]

export const findWellnessHotspotIndex = (slug) =>
  wellnessClubHotspots.findIndex((h) => h.slug === slug)
