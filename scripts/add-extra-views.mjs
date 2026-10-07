// Add the apartment views supplied after the original shoots (the
// "Mishing Rivali" folder, Oct 2026) on top of the existing assets.
//
// WHY THIS DOESN'T REBUILD
// ------------------------
// Each build-*-views.mjs wipes its output folder and regenerates the tower
// from the original shoot folder — several of which are no longer on this
// machine (and build-views.mjs's OUT_DIR is the parent of every other tower's
// folder). This script is purely additive: it encodes only the files listed
// below, with the same 1440px / WebP q85 settings, and merges them into the
// existing manifests. Safe to re-run; re-run it after any tower rebuild.
//
// WHAT'S LISTED
// -------------
// Only views new to the app. The supplied folder also held exact copies of
// views already used for neighbouring apartments (verified byte-for-byte);
// those are deliberately left out until the client confirms borrowed views.
//   Stargaze 905  — real 9th-floor shoot, misnamed "Apt_805" at source
//   Stargaze 1702 — real 17th-floor shoot, misnamed "16th Floor_Apt_1602"
//   Moonrise 1307
//   Skyleap floors 32, 34-38 — all four facade views each
//
// Usage: node scripts/add-extra-views.mjs ["/path/to/Mishing Rivali"]
import sharp from 'sharp'
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = dirname(HERE)
const DEFAULT_SRC = '/Users/Arsalan/Downloads/Mishing Rivali'
const VIEWS = join(ROOT, 'public', 'unit', 'views')
const DATA = join(ROOT, 'src', 'data')
const TARGET_H = 1440 // output height in px (full-screen panorama)
const WEBP_QUALITY = 85 // high quality, re-encoded from the original source

// [apartment, file inside the source folder]
const STARGAZE = [
  [905, 'Stargaze/9th Floor_Apt_905.jpg'],
  [1702, 'Stargaze/17th Floor_Apt_1702.jpg'],
]
const MOONRISE = [[1307, 'Moonrise/DJI_0203_13th Floor_Apt_1307.jpg']]
const SKYLEAP_DIR = 'Skyleap-'
// "DJI_0294_38 Floor-4 S.png" — this batch adds a compass letter after the view.
const SKYLEAP_RE = /_(\d+)\s*Floor[-_](\d)(?:\s+[NESW])?\.(?:png|jpe?g)$/i

const encode = (from, to) =>
  sharp(from)
    .resize({ height: TARGET_H, withoutEnlargement: true, kernel: 'lanczos3' })
    .webp({ quality: WEBP_QUALITY })
    .toFile(to)

// Merge apartment numbers into a manifest's `export const NAME = [...]` line.
const mergeApts = (file, name, apts) => {
  const path = join(DATA, file)
  const src = readFileSync(path, 'utf8')
  const re = new RegExp(`(export const ${name} = \\[)([\\d, ]*)(\\])`)
  const current = src.match(re)[2].split(',').map(Number).filter(Boolean)
  const merged = [...new Set([...current, ...apts])].sort((a, b) => a - b)
  writeFileSync(path, src.replace(re, `$1${merged.join(', ')}$3`))
}

// Merge floor -> views into skyleapViews.js's SKYLEAP_VIEWS object.
const mergeSkyleap = (byFloor) => {
  const path = join(DATA, 'skyleapViews.js')
  const src = readFileSync(path, 'utf8')
  const re = /(export const SKYLEAP_VIEWS = \{\n)([\s\S]*?)(\n\})/
  const floors = new Map()
  for (const [, f, v] of src.match(re)[2].matchAll(/(\d+): \[([\d, ]*)\]/g))
    floors.set(Number(f), v.split(',').map(Number))
  for (const [f, views] of byFloor)
    floors.set(f, [...new Set([...(floors.get(f) ?? []), ...views])].sort((a, b) => a - b))
  const body = [...floors.keys()]
    .sort((a, b) => a - b)
    .map((f) => `  ${f}: [${floors.get(f).join(', ')}],`)
    .join('\n')
  writeFileSync(path, src.replace(re, `$1${body}$3`))
}

const main = async () => {
  const src = process.argv[2] || DEFAULT_SRC
  if (!statSync(src, { throwIfNoEntry: false })?.isDirectory()) {
    console.error(`Source folder not found: ${src}`)
    process.exit(1)
  }

  for (const [apt, file] of STARGAZE) {
    await encode(join(src, file), join(VIEWS, `${apt}.webp`))
    console.log(`  Stargaze ${apt}  <-  ${file}`)
  }
  mergeApts('stargazeViews.js', 'STARGAZE_VIEW_APTS', STARGAZE.map(([a]) => a))

  for (const [apt, file] of MOONRISE) {
    await encode(join(src, file), join(VIEWS, 'moonrise', `${apt}.webp`))
    console.log(`  Moonrise ${apt}  <-  ${file}`)
  }
  mergeApts('moonriseViews.js', 'MOONRISE_VIEW_APTS', MOONRISE.map(([a]) => a))

  const byFloor = new Map()
  for (const file of readdirSync(join(src, SKYLEAP_DIR)).sort()) {
    const m = SKYLEAP_RE.exec(file)
    if (!m) continue
    const [floor, view] = [Number(m[1]), Number(m[2])]
    await encode(join(src, SKYLEAP_DIR, file), join(VIEWS, 'skyleap', `${floor}-${view}.webp`))
    byFloor.set(floor, [...(byFloor.get(floor) ?? []), view])
    console.log(`  Skyleap ${floor}-${view}  <-  ${file}`)
  }
  mergeSkyleap(byFloor)
}

main()
