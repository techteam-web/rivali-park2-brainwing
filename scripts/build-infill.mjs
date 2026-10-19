// Builds src/assets/locations/infill.dat (gzipped): the buildings the /locations map is
// missing (see src/three/InfillBuildings.jsx), merged ahead of time so the map
// draws as little as possible at runtime.
//
// Input: a JSON array of footprints [x, z, groundY, yaw, length, width, area] in
// world units (metres), already filtered against the map's own buildings.
//   node scripts/build-infill.mjs footprints.json
//
// Per 1 km tile, footprints are rasterised at 1 m (grown by 1 m so huts that
// nearly touch join up), and each connected cluster becomes ONE extruded block:
// its outline traced and simplified, roof triangulated, one wall per edge. A
// lone building stays its exact rotated rectangle. Output per tile: Int16 local
// positions (5 cm), a Uint8 shade per vertex, and indices.
import fs from 'fs'
import zlib from 'zlib'
import * as THREE from 'three'

const SRC = process.argv[2]
const OUT = new URL('../src/assets/locations/infill.dat', import.meta.url)
const TILE = 1000
const CELL = 1
const GROW = 1 // m; footprints this close merge
const EPS = 2 // m, outline simplification

const heightOf = (i, area) => {
  const r = ((i * 2654435761) & 0xffff) / 65535
  if (area < 120) return 4 + 2.5 * r
  if (area < 400) return 6.5 + 5 * r
  return 9 + 9 * r
}

const all = JSON.parse(fs.readFileSync(SRC, 'utf8'))
  .filter((f) => f[6] <= 2500 && f[6] >= 0.6 * f[4] * f[5])
  .map((f, i) => ({ x: f[0], z: f[1], y: f[2], yaw: f[3], L: f[4], W: f[5], area: f[6], h: heightOf(i, f[6]) }))

const corners = (f, grow = 0) => {
  const c = Math.cos(f.yaw), s = Math.sin(f.yaw), a = f.L / 2 + grow, b = f.W / 2 + grow
  return [[-a, -b], [a, -b], [a, b], [-a, b]].map(([u, w]) => [f.x + u * c - w * s, f.z + u * s + w * c])
}

// Douglas-Peucker on a closed ring (iterative; traced outlines can be long)
const rdp = (pts, eps) => {
  // drop points that sit on a straight run first (raster outlines are full of them)
  const q = []
  for (let i = 0; i < pts.length; i++) {
    const a = pts[(i - 1 + pts.length) % pts.length], b = pts[i], c = pts[(i + 1) % pts.length]
    if ((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) !== 0) q.push(b)
  }
  if (q.length < 4) return q
  const seg = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L = dx * dx + dz * dz || 1e-9; let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L; t = Math.max(0, Math.min(1, t)); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz) }
  let far = 0, fi = 0
  for (let i = 1; i < q.length; i++) { const d = Math.hypot(q[i][0] - q[0][0], q[i][1] - q[0][1]); if (d > far) { far = d; fi = i } }
  const ring = [...q, q[0]]
  const keep = new Uint8Array(ring.length); keep[0] = keep[fi] = keep[ring.length - 1] = 1
  const stack = [[0, fi], [fi, ring.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop(); let dm = 0, im = -1
    for (let i = a + 1; i < b; i++) { const d = seg(ring[i], ring[a], ring[b]); if (d > dm) { dm = d; im = i } }
    if (dm > eps) { keep[im] = 1; stack.push([a, im], [im, b]) }
  }
  const out = []; for (let i = 0; i < ring.length - 1; i++) if (keep[i]) out.push(ring[i])
  return out
}

const tiles = new Map()
for (const f of all) {
  const k = `${Math.floor(f.x / TILE)},${Math.floor(f.z / TILE)}`
  if (!tiles.has(k)) tiles.set(k, [])
  tiles.get(k).push(f)
}

const chunks = []
let totalV = 0, totalT = 0, clustersN = 0, singles = 0
for (const [key, fs_] of tiles) {
  const [tx, tz] = key.split(',').map(Number)
  const ox = tx * TILE, oz = tz * TILE
  // raster with a margin so clusters at the edge stay in their tile's grid
  const M = 80, N = Math.ceil((TILE + 2 * M) / CELL)
  const grid = new Int32Array(N * N).fill(-1)
  const gx = (x) => Math.floor((x - ox + M) / CELL), gz = (z) => Math.floor((z - oz + M) / CELL)
  fs_.forEach((f, fi) => {
    const P = corners(f, GROW)
    const xs = P.map((p) => p[0]), zs = P.map((p) => p[1])
    const x0 = Math.max(0, gx(Math.min(...xs))), x1 = Math.min(N - 1, gx(Math.max(...xs)))
    const z0 = Math.max(0, gz(Math.min(...zs))), z1 = Math.min(N - 1, gz(Math.max(...zs)))
    const c = Math.cos(f.yaw), s = Math.sin(f.yaw)
    for (let i = x0; i <= x1; i++) for (let j = z0; j <= z1; j++) {
      const px = ox - M + (i + 0.5) * CELL - f.x, pz = oz - M + (j + 0.5) * CELL - f.z
      const u = px * c + pz * s, w = -px * s + pz * c
      if (Math.abs(u) <= f.L / 2 + GROW && Math.abs(w) <= f.W / 2 + GROW) grid[i * N + j] = fi
    }
  })
  // connected components (4-neighbour) over occupied cells
  const comp = new Int32Array(N * N).fill(-1); const comps = []
  for (let s0 = 0; s0 < N * N; s0++) {
    if (grid[s0] < 0 || comp[s0] >= 0) continue
    const id = comps.length; const stack = [s0]; comp[s0] = id; const members = new Set(); let cells = 0
    while (stack.length) {
      const k = stack.pop(); cells++; members.add(grid[k]); const i = Math.floor(k / N), j = k % N
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + a, jj = j + b; if (ii < 0 || jj < 0 || ii >= N || jj >= N) continue; const kk = ii * N + jj; if (grid[kk] >= 0 && comp[kk] < 0) { comp[kk] = id; stack.push(kk) } }
    }
    comps.push({ members: [...members], start: s0, cells })
  }
  const pos = [], shade = [], idx = [], wallIdx = []
  const addPrism = (ring, base, top) => {
    // ring: CCW-or-CW [[x,z],...] in world; local to tile origin
    const v0 = pos.length / 3
    const shape = ring.map(([x, z]) => new THREE.Vector2(x, z))
    if (THREE.ShapeUtils.isClockWise(shape)) { shape.reverse(); ring = [...ring].reverse() }
    const tri = THREE.ShapeUtils.triangulateShape(shape, [])
    for (const [x, z] of ring) { pos.push(x - ox, top, z - oz); shade.push(255) }
    for (const t of tri) idx.push(v0 + t[0], v0 + t[2], v0 + t[1])
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length]
      const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1
      // outward normal of a CCW (in x-z, as THREE sees it) ring; tone by facing
      const nx = dz / L, nz = -dx / L
      const tone = Math.round(150 + 60 * Math.abs(nx * 0.8 + nz * 0.6))
      const w = pos.length / 3
      pos.push(a[0] - ox, top, a[1] - oz, b[0] - ox, top, b[1] - oz, b[0] - ox, base, b[1] - oz, a[0] - ox, base, a[1] - oz)
      shade.push(tone, tone, Math.round(tone * 0.8), Math.round(tone * 0.8))
      wallIdx.push(w, w + 1, w + 3, w + 1, w + 2, w + 3)
    }
  }
  for (const cmp of comps) {
    const ms = cmp.members.map((i) => fs_[i])
    const cx = ms.reduce((a, f) => a + f.x, 0) / ms.length, cz = ms.reduce((a, f) => a + f.z, 0) / ms.length
    // cluster belongs to the tile its centre falls in (others render it)
    if (Math.floor(cx / TILE) !== tx || Math.floor(cz / TILE) !== tz) continue
    if (ms.length === 1) {
      const f = ms[0]; singles++
      addPrism(corners(f), f.y - 1.5, f.y + f.h)
      continue
    }
    clustersN++
    // Outer outline: every cell side facing a cell outside the cluster is a
    // directed edge (cluster on its left); chain them into loops and keep the
    // longest, which is the outer boundary (inner loops are courtyards, filled).
    const id = comp[cmp.start]
    const inC = (i, j) => i >= 0 && j >= 0 && i < N && j < N && comp[i * N + j] === id
    const next = new Map() // vertex key -> list of next vertex keys
    const vk = (i, j) => i * (N + 1) + j
    const addE = (a, b) => { if (!next.has(a)) next.set(a, []); next.get(a).push(b) }
    // collect cells of this component via flood from start (cheap re-walk)
    const stack2 = [cmp.start]; const seen = new Set([cmp.start])
    while (stack2.length) {
      const k = stack2.pop(); const i = Math.floor(k / N), j = k % N
      if (!inC(i, j - 1)) addE(vk(i, j), vk(i + 1, j))
      if (!inC(i + 1, j)) addE(vk(i + 1, j), vk(i + 1, j + 1))
      if (!inC(i, j + 1)) addE(vk(i + 1, j + 1), vk(i, j + 1))
      if (!inC(i - 1, j)) addE(vk(i, j + 1), vk(i, j))
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + a, jj = j + b; const kk = ii * N + jj; if (inC(ii, jj) && !seen.has(kk)) { seen.add(kk); stack2.push(kk) } }
    }
    let ring = []
    while (next.size) {
      const startK = next.keys().next().value; const loop = []; let cur = startK; let guard = 0
      do {
        loop.push(cur); const outs = next.get(cur); const nx = outs.pop(); if (!outs.length) next.delete(cur); cur = nx
      } while (cur !== startK && next.has(cur) && ++guard < 1e6)
      if (loop.length > ring.length) ring = loop
    }
    ring = ring.map((k) => [ox - M + Math.floor(k / (N + 1)) * CELL, oz - M + (k % (N + 1)) * CELL])
    let simp = rdp(ring, EPS)
    if (simp.length < 3) continue
    // shrink back by GROW approx: ignore (1 m) — blocks read as slightly fuller
    const area = ms.reduce((a, f) => a + f.area, 0)
    const h = ms.reduce((a, f) => a + f.h * f.area, 0) / area
    const base = Math.min(...ms.map((f) => f.y)) - 1.5
    const top = ms.reduce((a, f) => a + f.y * f.area, 0) / area + h
    addPrism(simp, base, top)
  }
  if (!idx.length) continue
  const roofN = idx.length
  idx.push(...wallIdx)
  totalV += pos.length / 3; totalT += idx.length / 3
  chunks.push({ ox, oz, pos, shade, idx, roofN })
}

// binary (gzipped): 'RIN2', uint32 tiles; per tile: float32 ox, oz, uint32 nv,
// uint32 ni, uint32 roofN, int16 pos[nv*3] (local, 5 cm, padded to 4 bytes),
// uint8 shade[nv] (padded to 4), uint16|uint32 idx[ni] (uint16 padded to 4).
// Indices list every roof triangle first (roofN), then the walls, so a distant
// tile can draw its roofs alone.
const parts = [Buffer.from('RIN2'), Buffer.from(new Uint32Array([chunks.length]).buffer)]
for (const c of chunks) {
  const nv = c.pos.length / 3, ni = c.idx.length
  parts.push(Buffer.from(new Float32Array([c.ox, c.oz]).buffer), Buffer.from(new Uint32Array([nv, ni, c.roofN]).buffer))
  const p16 = new Int16Array(Math.ceil((nv * 3) / 2) * 2); p16.set(c.pos.map((v) => Math.round(v * 20))); parts.push(Buffer.from(p16.buffer))
  const sh = new Uint8Array(Math.ceil(nv / 4) * 4); sh.set(c.shade); parts.push(Buffer.from(sh.buffer))
  parts.push(Buffer.from((nv < 65536 ? new Uint16Array(c.idx.length % 2 ? [...c.idx, 0] : c.idx) : new Uint32Array(c.idx)).buffer))
}
fs.writeFileSync(OUT, zlib.gzipSync(Buffer.concat(parts), { level: 9 }))
console.log(`footprints ${all.length}, clusters ${clustersN}, singles ${singles}, tiles ${chunks.length}, vertices ${totalV}, triangles ${totalT}, bytes ${fs.statSync(OUT).size}`)
