import type { GameMap } from '@bitborough/core'
import { TileType, Infrastructure } from '@bitborough/core'
import type { PRNG } from '../../prng.js'
import type { BuildingIndex } from '../../building-index.js'
import { buildInfluenceMap, influenceToUint8 } from './influence.js'

const FIRE_BASE_RADIUS = 15
const FIRE_SMALL_BASE_RADIUS = 6

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
  buildInfluenceMap(
    map, 'service.fire', FIRE_BASE_RADIUS, fireFunding, influenceBuffer,
    { defId: 'service.fire.small', baseRadius: FIRE_SMALL_BASE_RADIUS },
  )

  influenceToUint8(influenceBuffer, fireCoverage)
}

export function updateFires(
  map: GameMap,
  fireState: FireState,
  fireCoverage: Uint8Array,
  prng: PRNG,
  bldIdx: BuildingIndex,
  onBuildingDestroyed?: (buildingId: string) => void,
): void {
  const { width, height } = map

  // Tick existing fires — collect spread fires separately to avoid
  // spreading multiple tiles in a single tick via Map iteration order.
  const newFires = new Map<number, number>()

  for (const [idx, remaining] of fireState.activeFires) {
    const coverage = fireCoverage[idx]! / 255
    // Fire station speeds up extinguishing
    const ticksToExtinguish = coverage > 0.5 ? 1 : 0
    const newRemaining = remaining - 1 - ticksToExtinguish

    if (newRemaining <= 0) {
      // Fire burns out — destroy building but preserve zoning so new
      // buildings can regrow in the area.
      fireState.activeFires.delete(idx)
      const fx = idx % width
      const fy = Math.floor(idx / width)
      const burned = bldIdx.get(fx, fy)
      if (burned) {
        const bIdx = map.buildings.indexOf(burned)
        if (bIdx !== -1) map.buildings.splice(bIdx, 1)
        onBuildingDestroyed?.(burned.id)
      }
    } else {
      fireState.activeFires.set(idx, newRemaining)

      // Spread to neighbors
      const x = idx % width
      const y = Math.floor(idx / width)
      const neighbors = [
        y > 0 ? idx - width : -1, // N
        x < width - 1 ? idx + 1 : -1, // E
        y < height - 1 ? idx + width : -1, // S
        x > 0 ? idx - 1 : -1, // W
      ]

      for (const nIdx of neighbors) {
        if (nIdx < 0 || fireState.activeFires.has(nIdx) || newFires.has(nIdx)) continue
        if (map.terrain[nIdx] === TileType.Water) continue
        if (map.infrastructure[nIdx]! & Infrastructure.Road) continue
        if (map.zones[nIdx] === 0) continue

        const nCoverage = fireCoverage[nIdx]! / 255
        const spreadChance = 0.15 * (1.0 - nCoverage * 0.7)
        if (prng.next() < spreadChance) {
          newFires.set(nIdx, prng.nextInt(3, 5))
        }
      }
    }
  }

  // Merge spread fires after iteration completes
  for (const [idx, remaining] of newFires) {
    fireState.activeFires.set(idx, remaining)
  }

  // Check for new fires (monthly) — skip tiles without zones
  for (let i = 0; i < width * height; i++) {
    if (map.zones[i] === 0) continue
    if (fireState.activeFires.has(i)) continue

    const baseRisk = 0.001
    const coverage = fireCoverage[i]! / 255
    const effectiveRisk = baseRisk * (1.0 - coverage * 0.9)

    if (prng.next() < effectiveRisk) {
      fireState.activeFires.set(i, prng.nextInt(3, 5))
    }
  }
}
