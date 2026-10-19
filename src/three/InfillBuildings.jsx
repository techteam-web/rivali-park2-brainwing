import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { locationsConfig } from './locationsConfig'
import { patchLocationsFog } from './locationsFog'
import infillUrl from '../assets/locations/infill.dat?url'

// Buildings the OpenStreetMap-based map is missing (19 Oct, slide 3: "excessive
// barren space, pls check if it's at actuals"). Compared with satellite imagery,
// most of the map's empty patches near the project are dense informal
// settlements that OSM never traced. These are their real footprints, from
// Google's Open Buildings dataset (v3, confidence >= 0.7), within 7 km of the
// project, minus any that overlap a building the map already has or sit on a
// railway or main road: ~97k buildings.
//
// Kept light at runtime; the heavy lifting is done once, offline, by
// scripts/build-infill.mjs:
// - touching huts are merged into one block per cluster (every footprint still
//   covered), so ~790k vertices draw instead of ~1.9M,
// - the result is split into 1 km tiles, each a single mesh that is skipped
//   when off screen.
// Every block stays fully 3D at any distance (19 Oct: no flattening far away;
// measured at ~0.5 ms a frame more than drawing distant tiles as roofs only).
// The data ships gzipped (4.5 MB, infill.dat) and is unpacked in the browser.
//
// The map's lighting is baked, so it can't be reproduced exactly; blocks fake
// it with lighter roofs, wall tones by facing and a darker base, in the baked
// buildings' grey. Switch it off with locationsConfig.infill.enabled.

const { infill } = locationsConfig

// File layout: see scripts/build-infill.mjs.
function parse(buf) {
  const dv = new DataView(buf)
  const tiles = dv.getUint32(4, true)
  let o = 8
  const out = []
  for (let t = 0; t < tiles; t++) {
    const ox = dv.getFloat32(o, true)
    const oz = dv.getFloat32(o + 4, true)
    const nv = dv.getUint32(o + 8, true)
    const ni = dv.getUint32(o + 12, true)
    // (o + 16 holds the roof-only index count, unused now that nothing flattens)
    o += 20
    const pos = new Int16Array(buf, o, nv * 3)
    o += Math.ceil((nv * 3) / 2) * 4
    const shade = new Uint8Array(buf, o, nv)
    o += Math.ceil(nv / 4) * 4
    let idx
    if (nv < 65536) {
      idx = new Uint16Array(buf, o, ni)
      o += Math.ceil(ni / 2) * 4
    } else {
      idx = new Uint32Array(buf, o, ni)
      o += ni * 4
    }
    out.push({ ox, oz, pos, shade, idx })
  }
  return out
}

async function load() {
  // Gzipped on disk (and named .dat so hosts don't label it as a compressed
  // transfer). If a server decompresses it anyway, the gzip header is gone and
  // it's parsed as is.
  const buf = await (await fetch(infillUrl)).arrayBuffer()
  const b = new Uint8Array(buf, 0, 2)
  if (b[0] !== 0x1f || b[1] !== 0x8b) return parse(buf)
  const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))
  return parse(await new Response(stream).arrayBuffer())
}

const roofColor = new THREE.Color()
const wallColor = new THREE.Color()

function buildTile(t) {
  const g = new THREE.BufferGeometry()
  const nv = t.shade.length
  const p = new Float32Array(nv * 3)
  for (let i = 0; i < nv * 3; i++) p[i] = t.pos[i] / 20
  const c = new Float32Array(nv * 3)
  roofColor.set(infill.roof)
  wallColor.set(infill.wall)
  for (let i = 0; i < nv; i++) {
    const s = t.shade[i]
    // 255 marks a roof vertex; anything lower is a wall shade (base already darkened)
    const col = s === 255 ? roofColor : wallColor
    const k = s === 255 ? 1 : s / 210
    c[i * 3] = col.r * k
    c[i * 3 + 1] = col.g * k
    c[i * 3 + 2] = col.b * k
  }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3))
  g.setAttribute('color', new THREE.BufferAttribute(c, 3))
  g.setIndex(new THREE.BufferAttribute(t.idx, 1))
  g.computeBoundingSphere()
  return g
}

export default function InfillBuildings() {
  const [tiles, setTiles] = useState(null)

  useEffect(() => {
    if (!infill.enabled) return
    let live = true
    load()
      .then((d) => live && setTiles(d))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  const material = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })
    m.onBeforeCompile = patchLocationsFog
    return m
  }, [])

  const meshes = useMemo(() => {
    if (!tiles) return null
    return tiles.map((t) => {
      const mesh = new THREE.Mesh(buildTile(t), material)
      mesh.position.set(t.ox, 0, t.oz)
      mesh.updateMatrixWorld()
      mesh.matrixAutoUpdate = false
      return mesh
    })
  }, [tiles, material])

  useEffect(() => () => material.dispose(), [material])
  useEffect(() => () => meshes?.forEach((m) => m.geometry.dispose()), [meshes])

  if (!infill.enabled || !meshes) return null
  return meshes.map((m) => <primitive key={m.uuid} object={m} />)
}
