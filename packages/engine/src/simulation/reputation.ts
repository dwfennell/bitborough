import type { GameMap } from '@bitborough/core'
import { BuildingCategory } from '@bitborough/core'
import type { BuildingIndex } from '../building-index.js'
import { BUILDING_DEFS } from '../buildings-registry.js'
import { REPUTATION_DECAY } from './wealth-tiers.js'
import { parkDesirabilityBonus, RES_PARK_BONUS } from './desirability.js'

const QUALITY_CRIME_WEIGHT = 0.35
const QUALITY_POLLUTION_WEIGHT = 0.25
const QUALITY_FIRE_WEIGHT = 0.15
const QUALITY_PARK_WEIGHT = 0.15
const QUALITY_OCCUPANCY_WEIGHT = 0.10

const OCCUPANCY_SEARCH_RADIUS = 5
const OCCUPANCY_HEALTH_THRESHOLD = 0.7

/** @internal — exported for testing only */
export function computeCurrentQuality(
  crimeNorm: number, pollNorm: number, fireNorm: number, parkNorm: number, occupancyHealth: number,
): number {
  return (
    (1 - crimeNorm) * QUALITY_CRIME_WEIGHT +
    (1 - pollNorm) * QUALITY_POLLUTION_WEIGHT +
    fireNorm * QUALITY_FIRE_WEIGHT +
    parkNorm * QUALITY_PARK_WEIGHT +
    occupancyHealth * QUALITY_OCCUPANCY_WEIGHT
  )
}

function computeOccupancyHealth(x: number, y: number, map: GameMap, bldIdx: BuildingIndex): number {
  let bestHealth = 0
  for (let dy = -OCCUPANCY_SEARCH_RADIUS; dy <= OCCUPANCY_SEARCH_RADIUS; dy++) {
    for (let dx = -OCCUPANCY_SEARCH_RADIUS; dx <= OCCUPANCY_SEARCH_RADIUS; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > OCCUPANCY_SEARCH_RADIUS) continue
      const b = bldIdx.get(x + dx, y + dy)
      if (!b || b.state !== 'active') continue
      const def = BUILDING_DEFS[b.defId]
      if (!def || def.category !== BuildingCategory.Residential || def.capacity === 0) continue
      const health = Math.min(1, b.residents / (def.capacity * OCCUPANCY_HEALTH_THRESHOLD))
      if (health > bestHealth) bestHealth = health
    }
  }
  return bestHealth
}

export function computeParkNorm(x: number, y: number, map: GameMap, bldIdx: BuildingIndex): number {
  return Math.min(1, parkDesirabilityBonus(x, y, map, bldIdx) / RES_PARK_BONUS)
}

export function computeReputation(
  reputationLayer: Float32Array,
  map: GameMap,
  crimeLevel: Uint8Array,
  fireCoverage: Uint8Array,
  pollutionLevel: Uint8Array,
  bldIdx: BuildingIndex,
): void {
  const { width, height } = map
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (map.zones[idx] === 0) continue
      const crimeNorm = crimeLevel[idx]! / 255
      const pollNorm = pollutionLevel[idx]! / 255
      const fireNorm = fireCoverage[idx]! / 255
      const parkNorm = computeParkNorm(x, y, map, bldIdx)
      const occupancyHealth = computeOccupancyHealth(x, y, map, bldIdx)
      const quality = computeCurrentQuality(crimeNorm, pollNorm, fireNorm, parkNorm, occupancyHealth)
      reputationLayer[idx] = REPUTATION_DECAY * reputationLayer[idx]! + (1 - REPUTATION_DECAY) * quality
    }
  }
}
