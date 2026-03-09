import type { GameMap } from '@bitborough/core'
import { TileType, Infrastructure } from '@bitborough/core'
import type { PRNG } from '../../prng.js'
import { buildInfluenceMap } from './influence.js'

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
  influenceBuffer: Float32Array,
): void {
  buildInfluenceMap(map, 'service.fire', FIRE_BASE_RADIUS, fireFunding, influenceBuffer)

  // Convert [0, 1] influence to [0, 255] coverage
  for (let i = 0; i < influenceBuffer.length; i++) {
    fireCoverage[i] = Math.min(255, Math.floor(influenceBuffer[i]! * 255))
  }
}

export function updateFires(
  map: GameMap,
  fireState: FireState,
  fireCoverage: Uint8Array,
  prng: PRNG,
): void {
  const { width, height } = map

  // Tick existing fires
  for (const [idx, remaining] of fireState.activeFires) {
    const coverage = fireCoverage[idx]! / 255
    // Fire station speeds up extinguishing
    const ticksToExtinguish = coverage > 0.5 ? 1 : 0
    const newRemaining = remaining - 1 - ticksToExtinguish

    if (newRemaining <= 0) {
      // Fire burns out — destroy zone and any building on it
      fireState.activeFires.delete(idx)
      map.zones[idx] = 0
      const bIdx = map.buildings.findIndex(b => b.x === idx % width && b.y === Math.floor(idx / width))
      if (bIdx !== -1) map.buildings.splice(bIdx, 1)
    } else {
      fireState.activeFires.set(idx, newRemaining)

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

  // Check for new fires (monthly) — skip tiles without zones
  for (let i = 0; i < width * height; i++) {
    if (map.zones[i] === 0) continue
    if (fireState.activeFires.has(i)) continue

    const baseRisk = 0.003
    const coverage = fireCoverage[i]! / 255
    const effectiveRisk = baseRisk * (1.0 - coverage * 0.9)

    if (prng.next() < effectiveRisk) {
      fireState.activeFires.set(i, prng.nextInt(3, 5))
    }
  }
}
