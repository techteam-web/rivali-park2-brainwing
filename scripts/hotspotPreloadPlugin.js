import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import process from 'node:process'

// Every gallery page's full-screen background is its largest paint, but the
// browser only learns which image that is once React has rendered the route.
// This injects a small inline script into index.html that maps the URL being
// opened to its background and preloads it straight away, while the app's
// JavaScript is still downloading. The preload carries the same srcset/sizes
// as the slide's <img>, so the browser picks the same file and reuses it.

const CLUBS = [
  ['social-club', 'socialClubHotspots.js', 'socialClubHotspots'],
  ['wellness-club', 'wellnessClubHotspots.js', 'wellnessClubHotspots'],
  ['central-courtyard', 'centralCourtyardHotspots.js', 'centralCourtyardHotspots'],
  ['sky-club', 'skyClubHotspots.js', 'skyClubHotspots'],
  ['convention-center', 'conventionCenterHotspots.js', 'conventionCenterHotspots'],
]

// Landing screens use one plain image each (see the matching page component).
const LANDINGS = {
  '/gallery': '/gallery/site aerial bg.webp',
  '/towers': '/gallery/site aerial bg.webp',
  '/gallery/social-club': '/gallery/social club bg.webp',
  '/gallery/wellness-club': '/gallery/wellness club bg.webp',
  '/gallery/central-courtyard': '/gallery/central courtyard bg.webp',
  '/gallery/sky-club': '/gallery/sky club bg.webp',
  '/gallery/convention-center': '/gallery/convention center bg.webp',
}

// Imported fresh each time so edits to the data show up without a restart.
const load = (root, file) =>
  import(`${pathToFileURL(resolve(root, 'src/data', file)).href}?t=${Date.now()}`)

export default function hotspotPreload() {
  let root = process.cwd()
  return {
    name: 'hotspot-preload',
    configResolved(config) {
      root = config.root
    },
    async transformIndexHtml(html) {
      const { hotspotBgSrcSet, HOTSPOT_BG_SIZES } = await load(root, 'hotspotBgSrcSet.js')
      const map = {}
      for (const [route, file, name] of CLUBS) {
        const slides = (await load(root, file))[name]
        for (const h of slides) {
          map[`/gallery/${route}/${h.slug}`] = { s: hotspotBgSrcSet(h.bg), h: encodeURI(h.bg) }
        }
      }
      for (const [route, src] of Object.entries(LANDINGS)) map[route] = { h: encodeURI(src) }

      const script = `(function(){var m=${JSON.stringify(map)}[location.pathname.replace(/\\/+$/,'')];if(!m)return;var l=document.createElement('link');l.rel='preload';l.as='image';l.fetchPriority='high';if(m.s){l.imageSrcset=m.s;l.imageSizes=${JSON.stringify(HOTSPOT_BG_SIZES)}}else{l.href=m.h}document.head.appendChild(l)})()`
      // Straight after <meta charset>: that has to stay in the first 1024 bytes,
      // and anything later (the stylesheet link) would hold the script back.
      return html.replace(/(<meta charset[^>]*>)/i, `$1\n    <script>${script}</script>`)
    },
  }
}
