import * as THREE from 'three'

/**
 * Creates a sculpted aerodynamic sports car hood (capo) geometry.
 * Uses procedural vertex displacement on a dense grid to form distinct center ridges,
 * side curves, and a sloping front nose reminiscent of luxury GT supercars.
 */
export function createSportsHoodGeometry(
  width = 5.6,
  height = 3.8,
  widthSegments = 140,
  heightSegments = 90
): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments)
  const posAttr = geometry.attributes.position as THREE.BufferAttribute
  const halfW = width / 2
  const halfH = height / 2

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i)
    const y = posAttr.getY(i)

    // Normalized coordinates (-1 to 1)
    const u = x / halfW
    const v = y / halfH

    let z = 0

    // 1. Sloping front nose curvature (as v moves towards -1, bottom of viewport)
    if (v < 0) {
      z -= Math.pow(Math.abs(v), 2.2) * 0.75
    }

    // 2. Side aerodynamic roll-off (left and right edges curve down smoothly)
    z -= Math.pow(Math.abs(u), 2.4) * 0.45

    // 3. Dual longitudinal aerodynamic ridges (sculpted creases along u = ±0.42)
    const ridgeOffset = 0.42
    const distFromRidge = Math.abs(Math.abs(u) - ridgeOffset)
    const ridgeProfile = Math.exp(-distFromRidge * distFromRidge * 45.0) * 0.18
    // Ridge tapers slightly towards the rear (v -> 1)
    const longitudinalTaper = Math.cos(v * 0.4) * 1.1
    z += ridgeProfile * longitudinalTaper

    // 4. Subtle center power dome bulge
    const centerDist = Math.abs(u)
    z += Math.exp(-centerDist * centerDist * 6.0) * 0.12

    posAttr.setZ(i, z)
  }

  geometry.computeVertexNormals()
  return geometry
}
