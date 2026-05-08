import SkyleapCloud   from '../assets/towers/skyleap/cloud.svg?react'
import SkyleapCloud2  from '../assets/towers/skyleap/cloud2.svg?react'
import SkyleapBird    from '../assets/towers/skyleap/bird.svg?react'

import MoonriseClouds from '../assets/towers/moonrise/clouds.svg?react'
import MoonriseBird   from '../assets/towers/moonrise/bird.svg?react'

import StargazeLeavesLeft  from '../assets/towers/stargaze/leaves-left.svg?react'
import StargazeLeavesRight from '../assets/towers/stargaze/leaves-right.svg?react'
import StargazeBird        from '../assets/towers/stargaze/bird.svg?react'

import SunburstCloud from '../assets/towers/sunburst/cloud.svg?react'
import SunburstBird1 from '../assets/towers/sunburst/bird1.svg?react'
import SunburstBird2 from '../assets/towers/sunburst/bird2.svg?react'
import SunburstTree  from '../assets/towers/sunburst/tree.svg?react'

export const towers = [
  {
    id: 'skyleap',
    name: 'Skyleap',
    tagline: 'where potential finds its space',
    accent: '#557E92',
    possession: '2028',
    carpetArea: '810 - 1,338 Sq. Ft.',
    features: [
      { icon: 'floors',    text: '53 FLOORS' },
      { icon: 'views',     text: 'STUNNING VIEWS OF PAGODA & SGNP' },
      { icon: 'premium',   text: 'PREMIUM SPECIFICATIONS' },
      { icon: 'vastu',     text: 'VASTU COMPLIANT' },
      { icon: 'windows',   text: 'LARGE WINDOWS' },
      { icon: 'balconies', text: 'EXPANSIVE BALCONIES*' },
    ],
    image: '/towers/skyleap/Skyleap.webp',
    depth: '/towers/skyleap/Skyleap.png',
    textureAspect: 2048 / 1534,
    // scaleX / scaleY > 1 zooms in on that axis; offsetX > 0 shifts image right; offsetY > 0 shifts image up
    framing: { scaleX: 1.0, scaleY: 1.0, offsetX: 0.06, offsetY: 0.0 },
    decorations: [
      { Component: SkyleapCloud,  depth: 0.3, className: 'absolute top-[18%]  left-[0%]    w-[20%]' },
      { Component: SkyleapCloud2, depth: 0.2, className: 'absolute top-[40%] right-[2%]  w-[25%]' },
      { Component: SkyleapBird,   depth: 0.8, drawDuration: 0.7, className: 'absolute top-[15%] right-[10%]  w-[7%]'  },
    ],
  },
  {
    id: 'moonrise',
    name: 'Moonrise',
    tagline: 'your serene abode for a life that rises',
    accent: '#839033',
    possession: '2027',
    carpetArea: '772 - 1,263 Sq. Ft.',
    features: [
      { icon: 'floors',    text: '49 FLOORS INCL. 5 PODIA' },
      { icon: 'views',     text: 'STUNNING VIEWS OF PAGODA & SGNP' },
      { icon: 'premium',   text: 'PREMIUM SPECIFICATIONS' },
      { icon: 'vastu',     text: 'VASTU COMPLIANT' },
      { icon: 'windows',   text: 'LARGE WINDOWS' },
      { icon: 'balconies', text: 'EXPANSIVE BALCONIES*' },
    ],
    image: '/towers/moonrise/Moonrise.webp',
    depth: '/towers/moonrise/Moonrise.png',
    textureAspect: 2048 / 1326,
    framing: { scaleX: 1.0, scaleY: 1.0, offsetX: 0.0, offsetY: 0.0 },
    decorations: [
      { Component: MoonriseClouds, depth: 0.3, className: 'absolute top-[8%]  left-[6%] w-[40%]' },
      { Component: MoonriseBird,   depth: 0.9, className: 'absolute top-[64%] right-[19%] w-[10%]'  },
    ],
  },
  {
    id: 'stargaze',
    name: 'Stargaze',
    tagline: 'your space for a life of wonder',
    accent: '#A4687B',
    possession: '2026',
    carpetArea: '772 - 1,114 Sq. Ft.',
    features: [
      { icon: 'floors',    text: '39 FLOORS INCL. 5 PODIA' },
      { icon: 'views',     text: 'STUNNING VIEWS OF PAGODA & SGNP' },
      { icon: 'premium',   text: 'PREMIUM SPECIFICATIONS' },
      { icon: 'vastu',     text: 'VASTU COMPLIANT' },
      { icon: 'windows',   text: 'LARGE WINDOWS' },
      { icon: 'balconies', text: 'EXPANSIVE BALCONIES*' },
    ],
    image: '/towers/stargaze/Stargaze.webp',
    depth: '/towers/stargaze/Stargaze.png',
    textureAspect: 852 / 1046,
    framing: { scaleX: 1, scaleY: 0.75, offsetX: 0.08, offsetY: 0.009 },
    decorations: [
      { Component: StargazeLeavesLeft,  depth: 0.9, className: 'absolute top-[14%]  left-[26%]  w-[10%]' },
      { Component: StargazeLeavesRight, depth: 0.9, className: 'absolute top-[12%]  -right-[1%] w-[5%]' },
      { Component: StargazeBird,        depth: 0.6, drawDuration: 0.7, className: 'absolute top-[36%] left-[38%] w-[18%]' },
    ],
  },
  {
    id: 'sunburst',
    name: 'Sunburst',
    tagline: 'your space to glow and grow',
    accent: '#B08D66',
    possession: '2027',
    carpetArea: '633 - 988 Sq. Ft.',
    features: [
      { icon: 'floors',    text: '39 FLOORS INCL. 5 PODIA' },
      { icon: 'views',     text: 'STUNNING VIEWS OF PAGODA & SGNP' },
      { icon: 'premium',   text: 'PREMIUM SPECIFICATIONS' },
      { icon: 'vastu',     text: 'VASTU COMPLIANT' },
      { icon: 'windows',   text: 'LARGE WINDOWS' },
      { icon: 'balconies', text: 'EXPANSIVE BALCONIES*' },
    ],
    image: '/towers/sunburst/Sunburst.webp',
    depth: '/towers/sunburst/Sunburst.png',
    textureAspect: 2048 / 1653,
    framing: { scaleX: 1.0, scaleY: 1.0, offsetX: 0.0, offsetY: 0.0 },
    decorations: [
      { Component: SunburstCloud, depth: 0.3,  className: 'absolute top-[28%]    left-[24%]  w-[16%]' },
      { Component: SunburstBird1, depth: 0.7,  className: 'absolute top-[16%]   right-[25%] w-[4%]'  },
      { Component: SunburstBird2, depth: 0.7,  className: 'absolute top-[24%]   right-[22%] w-[5%]'  },
      { Component: SunburstTree,  depth: 0.98, className: 'absolute bottom-[8%] right-[10%]  w-[20%]' },
    ],
  },
]

export const TOWER_ACCENTS = towers.map((t) => t.accent)
