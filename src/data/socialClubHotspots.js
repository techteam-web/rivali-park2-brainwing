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
// bottom-right progress bar's drawSVG fill extends on this slide, so it is
// written as index/total and every entry has to be renumbered when one is
// added or removed.
//
// Order matches the icon order on the landing screen (see SocialClub.jsx).
// Social Media Studio was dropped here along with its icon (13 Aug mark-up);
// its render is still on disk if the room comes back. Cafeteria is the reverse:
// its icon was dropped by that mark-up and has been restored, because the room
// itself stayed — the mark-up renamed the POSITION it used to sit at.

const ASSET_BASE = '/gallery/hotspots/social club'

export const socialClubHotspots = [
  {
    slug: 'screening-room',
    name: 'Screening Room',
    bg: `${ASSET_BASE}/screening room bg.webp`,
    bgPosition: 'bottom',
    progress: 1 / 7,
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
    slug: 'card-room',
    name: 'Card Room',
    bg: `${ASSET_BASE}/card room bg.webp`,
    progress: 2 / 7,
    decoratives: [
      // Placements measured from the design team's Figma export for this frame.
      // Both lamps are layers named "Mask group"; Figma numbers duplicate names
      // on export and they pair off in layer order, so each is its own export
      // and neither is mirrored.
      {
        name: 'floor-lamp-tall',
        src: `${ASSET_BASE}/floor-lamp-tall-card-room.svg`,
        top: 0.4586,
        left: 0.2366,
        width: 0.1019,
      },
      {
        name: 'floor-lamp-short',
        src: `${ASSET_BASE}/floor-lamp-short-card-room.svg`,
        top: 0.4650,
        left: 0.4814,
        width: 0.0561,
      },
    ],
  },
  {
    slug: 'billiards-room',
    name: 'Billiards Room',
    bg: `${ASSET_BASE}/billiards room bg.webp`,
    progress: 3 / 7,
    decoratives: [],
  },
  {
    slug: 'library-business-centre',
    name: 'Library & Business Centre',
    bg: `${ASSET_BASE}/library business centre bg.webp`,
    progress: 4 / 7,
    decoratives: [
      // Placements measured from the design team's Figma export for this frame,
      // normalized against their 1440x1024 artboard and corrected for the stroke
      // Figma leaves out of a group's box but the SVG canvas includes.
      //
      // That dump covers the whole Social Club section — five artboards stacked
      // in one column — so it also carries the screening room's doodles at
      // coordinates that look plausible here. Only the three that actually
      // appear on this render are listed.
      {
        name: 'floor-lamp',
        src: `${ASSET_BASE}/floor-lamp-library.svg`,
        top: 0.3538,
        left: 0.0333,
        width: 0.1139,
      },
      {
        name: 'camera',
        src: `${ASSET_BASE}/camera-library.svg`,
        top: 0.6004,
        left: 0.6412,
        width: 0.0319,
      },
      {
        name: 'bin',
        src: `${ASSET_BASE}/bin-library.svg`,
        top: 0.6770,
        left: 0.9172,
        width: 0.0563,
      },
    ],
  },
  {
    slug: 'teens-lounge',
    name: 'Teens Lounge',
    bg: `${ASSET_BASE}/teens lounge bg.webp`,
    progress: 5 / 7,
    // Placements measured from the design team's Figma export for this frame.
    // The two cushions are separate drawings rather than one mirrored twice, so
    // each is its own export and neither is flipped.
    decoratives: [
      {
        name: 'floor-lamp',
        src: `${ASSET_BASE}/floor-lamp-teens-lounge.svg`,
        top: 0.3771,
        left: 0.6046,
        width: 0.0628,
      },
      {
        name: 'cushion-left',
        src: `${ASSET_BASE}/cushion-left-teens-lounge.svg`,
        top: 0.5983,
        left: 0.2165,
        width: 0.0638,
      },
      {
        name: 'cushion-right',
        src: `${ASSET_BASE}/cushion-right-teens-lounge.svg`,
        top: 0.5843,
        left: 0.6591,
        width: 0.0638,
      },
    ],
  },
  {
    slug: 'kids-club',
    name: 'Kids Club',
    bg: `${ASSET_BASE}/kids club bg.webp`,
    progress: 6 / 7,
    decoratives: [
      // Placements measured from the design team's Figma export for this frame.
      // Both toys are layers named "Group"; Figma numbers duplicate names on
      // export (Group.svg, Group-1.svg) and they pair off in layer order, which
      // is what tells the car from the truck — the two fit each other's box to
      // within a few percent, so shape alone cannot.
      //
      // The second ball sits almost entirely past the right edge of the artboard
      // in their artwork, so only a sliver of it shows here too.
      {
        name: 'ball',
        src: `${ASSET_BASE}/ball-kids-club.svg`,
        top: 0.6308,
        left: 0.3838,
        width: 0.0442,
      },
      {
        name: 'car',
        src: `${ASSET_BASE}/car-kids-club.svg`,
        top: 0.7332,
        left: 0.5695,
        width: 0.0839,
      },
      {
        name: 'truck',
        src: `${ASSET_BASE}/truck-kids-club.svg`,
        top: 0.7183,
        left: 0.6496,
        width: 0.0638,
      },
      {
        name: 'ball-edge',
        src: `${ASSET_BASE}/ball-kids-club.svg`,
        top: 0.7340,
        left: 0.9978,
        width: 0.0442,
      },
    ],
  },
  {
    slug: 'cafeteria',
    name: 'Cafeteria',
    bg: `${ASSET_BASE}/cafeteria bg.webp`,
    progress: 7 / 7,
    // Placements measured from the design team's Figma export for this frame.
    // One flower-vase drawing is reused six times at two sizes; the cups and the
    // glasses are their own exports. Mirroring is decided by scoring each vase
    // both ways against the client's composite, not by the Figma transform,
    // which describes the instance rather than the export.
    decoratives: [
      { name: 'vase-1',  src: `${ASSET_BASE}/vase-cafeteria.svg`,    top: 0.5419, left: 0.0880, width: 0.0480, flip: true },
      { name: 'vase-2',  src: `${ASSET_BASE}/vase-cafeteria.svg`,    top: 0.4873, left: 0.2680, width: 0.0329, flip: true },
      { name: 'vase-3',  src: `${ASSET_BASE}/vase-cafeteria.svg`,    top: 0.4993, left: 0.5911, width: 0.0299, flip: true },
      { name: 'vase-4',  src: `${ASSET_BASE}/vase-cafeteria.svg`,    top: 0.5062, left: 0.6640, width: 0.0298 },
      { name: 'vase-5',  src: `${ASSET_BASE}/vase-cafeteria.svg`,    top: 0.5697, left: 0.7537, width: 0.0479 },
      { name: 'vase-6',  src: `${ASSET_BASE}/vase-cafeteria.svg`,    top: 0.4679, left: 0.8507, width: 0.0299, flip: true },
      { name: 'cups',    src: `${ASSET_BASE}/cups-cafeteria.svg`,    top: 0.5835, left: 0.6122, width: 0.0598 },
      { name: 'glasses', src: `${ASSET_BASE}/glasses-cafeteria.svg`, top: 0.5949, left: 0.8196, width: 0.0438 },
    ],
  },
]

export const findHotspotIndex = (slug) =>
  socialClubHotspots.findIndex((h) => h.slug === slug)
