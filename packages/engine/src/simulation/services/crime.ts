import type { GameMap } from '@bitborough/core'
import { BUILDING_DEFS } from '../../buildings-registry.js'

const POLICE_BASE_RADIUS = 15

export function calculateCrime(
  map: GameMap,
  landValues: Uint8Array,
  crimeLevel: Uint8Array,
  population: number,
  policeFunding: number,
): void {
  const { width, height, buildings } = map
  const size = width * height

  // Build police influence map
  const policeInfluence = new Float32Array(size)
  const effectiveRadius = POLICE_BASE_RADIUS * (policeFunding / 100)

  for (const b of buildings) {
    if (b.defId !== 'service.police') continue
    const def = BUILDING_DEFS[b.defId]
    if (!def) continue
    // Center of the building
    const cx = b.x + def.size.w / 2
    const cy = b.y + def.size.h / 2

    if (effectiveRadius <= 0) continue

    const r = Math.ceil(effectiveRadius)
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const tx = Math.floor(cx + dx)
        const ty = Math.floor(cy + dy)
        if (tx < 0 || ty < 0 || tx >= width || ty >= height) continue
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > effectiveRadius) continue
        const influence = 1.0 - dist / effectiveRadius
        const idx = ty * width + tx
        policeInfluence[idx] = Math.min(1.0, policeInfluence[idx]! + influence)
      }
    }
  }

  // Calculate crime per tile
  // Scaled-down Micropolis formula — our land values are 0-65, not 0-255
  for (let i = 0; i < size; i++) {
    // Only calculate crime where there are zones
    if (map.zones[i] === 0) {
      crimeLevel[i] = 0
      continue
    }

    // Base crime for any zoned tile, slightly reduced by land value
    const lv = landValues[i]!
    const rawCrime = Math.max(0, 30 - Math.floor(lv * 0.15))
    const policeEffect = policeInfluence[i]! * 40
    crimeLevel[i] = Math.max(0, Math.min(255, Math.floor(rawCrime - policeEffect)))
  }
}
