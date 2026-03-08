import type { GameMap } from '@bitborough/core'
import { TileType, Infrastructure } from '@bitborough/core'
import type { PRNG } from '../../prng.js'
import { BUILDING_DEFS } from '../../buildings-registry.js'

const FIRE_BASE_RADIUS = 15

export interface FireState {
  activeFires: Map<number, number> // tile index → ticks remaining
}

export function createFireState(): FireState {
  return { activeFires: new Map() }
}

export function calculateFireCoverage(
  map: GameMap,
  fireCoverage: Uint8Array,
  fireFunding: number,
): void {
  const { width, height, buildings } = map
  const effectiveRadius = FIRE_BASE_RADIUS * (fireFunding / 100)

  // Reset
  fireCoverage.fill(0)

  for (const b of buildings) {
    if (b.defId !== 'service.fire') continue
    const def = BUILDING_DEFS[b.defId]
    if (!def) continue
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
        fireCoverage[idx] = Math.min(255, fireCoverage[idx]! + Math.floor(influence * 255))
      }
    }
  }
}

export function updateFires(
  map: GameMap,
  fireState: FireState,
  fireCoverage: Uint8Array,
  prng: PRNG,
): number[] {
  const { width, height } = map
  const activeTiles: number[] = []

  // Tick existing fires
  for (const [idx, remaining] of fireState.activeFires) {
    const coverage = fireCoverage[idx]! / 255
    // Fire station speeds up extinguishing
    const ticksToExtinguish = coverage > 0.5 ? 1 : 0
    const newRemaining = remaining - 1 - ticksToExtinguish

    if (newRemaining <= 0) {
      // Fire burns out — destroy zone
      fireState.activeFires.delete(idx)
      map.zones[idx] = 0
    } else {
      fireState.activeFires.set(idx, newRemaining)
      activeTiles.push(idx)

      // Spread to neighbors
      const x = idx % width
      const y = Math.floor(idx / width)
      const neighbors = [
        y > 0 ? idx - width : -1,         // N
        x < width - 1 ? idx + 1 : -1,     // E
        y < height - 1 ? idx + width : -1, // S
        x > 0 ? idx - 1 : -1,             // W
      ]

      for (const nIdx of neighbors) {
        if (nIdx < 0 || fireState.activeFires.has(nIdx)) continue
        // Can't spread across water, roads, or empty tiles
        if (map.terrain[nIdx] === TileType.Water) continue
        if (map.infrastructure[nIdx]! & Infrastructure.Road) continue
        if (map.zones[nIdx] === 0) continue

        const nCoverage = fireCoverage[nIdx]! / 255
        const spreadChance = 0.3 * (1.0 - nCoverage * 0.7)
        if (prng.next() < spreadChance) {
          fireState.activeFires.set(nIdx, prng.nextInt(3, 5))
        }
      }
    }
  }

  // Check for new fires (monthly)
  for (let i = 0; i < width * height; i++) {
    if (fireState.activeFires.has(i)) continue
    if (map.zones[i] === 0) continue

    // Base fire risk by zone density
    const baseRisk = 0.003
    const coverage = fireCoverage[i]! / 255
    const effectiveRisk = baseRisk * (1.0 - coverage * 0.9)

    if (prng.next() < effectiveRisk) {
      fireState.activeFires.set(i, prng.nextInt(3, 5))
      activeTiles.push(i)
    }
  }

  return activeTiles
}
