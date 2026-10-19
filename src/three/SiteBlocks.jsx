import { useMemo } from 'react'
import * as THREE from 'three'
import { locationsConfig } from './locationsConfig'

// Two plain blocks on the CCI land between the project and the Western Express
// Highway, standing in for the upcoming Hines Tower and DMart (12 Oct feedback,
// slides 6-7). Neither is built yet, so the OpenStreetMap-derived map has
// nothing there. Damania Hospital is the existing building beside them.
//
// One flat colour, no lighting or shading: the darker grey of the baked block
// beside them (19 Oct), so they read as distinct buildings without standing out.
const COLOR = '#8c9393'

export default function SiteBlocks() {
  const { size, baseY, rotationY, blocks } = locationsConfig.siteBlocks
  const geometry = useMemo(() => new THREE.BoxGeometry(size, size, size), [size])
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: COLOR, toneMapped: false }),
    [],
  )

  return blocks.map((b) => (
    <mesh
      key={b.id}
      geometry={geometry}
      material={material}
      position={[b.position[0], baseY + size / 2, b.position[1]]}
      rotation={[0, rotationY, 0]}
    />
  ))
}
