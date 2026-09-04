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
    // No overlay drawings on this one: the render is used exactly as supplied.
    // The Figma doodles (floor lamp, camera, bin) were placed against the
    // earlier library render and don't describe this room, and the render
    // already carries its own line art baked in.
    decoratives: [],
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
    // No overlay drawings on this one: the render is used exactly as supplied.
    // The Figma doodles (six vases, cups, glasses) were placed against the
    // earlier cafeteria render, and this one already has its own line art
    // (the two figures and the pendant lamps) baked into the image.
    decoratives: [],
  },
]

export const findHotspotIndex = (slug) =>
  socialClubHotspots.findIndex((h) => h.slug === slug)
