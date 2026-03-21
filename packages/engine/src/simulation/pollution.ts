import type { GameMap } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

export function calculatePollution(map: GameMap, pollutionLevel: Uint8Array): void {
  const { width, height, buildings } = map
  const size = width * height

  // Use Float64Array for accumulation to avoid precision loss
  const buffer = new Float64Array(size)

  for (const building of buildings) {
    if (building.state !== 'active') continue

    const def = BUILDING_DEFS[building.defId]
    if (!def || def.pollutionAmount <= 0 || def.pollutionRadius <= 0) continue

    const { pollutionAmount, pollutionRadius } = def
    const bx = building.x
    const by = building.y
    const bw = def.size.w
    const bh = def.size.h

    const minX = Math.max(0, building.x - pollutionRadius)
    const maxX = Math.min(width - 1, building.x + bw - 1 + pollutionRadius)
    const minY = Math.max(0, building.y - pollutionRadius)
    const maxY = Math.min(height - 1, building.y + bh - 1 + pollutionRadius)

    for (let ty = minY; ty <= maxY; ty++) {
      for (let tx = minX; tx <= maxX; tx++) {
        // Compute distance from tile to nearest point on building footprint
        const clampedX = Math.max(bx, Math.min(bx + bw - 1, tx))
        const clampedY = Math.max(by, Math.min(by + bh - 1, ty))
        const dist = Math.abs(tx - clampedX) + Math.abs(ty - clampedY)

        if (dist >= pollutionRadius) continue

        const contribution = pollutionAmount * Math.max(0, 1 - dist / pollutionRadius)
        buffer[ty * width + tx]! += contribution
      }
    }
  }

  // Write clamped values to output
  for (let i = 0; i < size; i++) {
    pollutionLevel[i] = Math.min(255, Math.round(buffer[i]!))
  }
}
