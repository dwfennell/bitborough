import type { GameMap } from '@bitborough/core'
import { BuildingCategory } from '@bitborough/core'
import { type BuildingIndex, forEachBuildingInRadius } from '../building-index.js'
import { BUILDING_DEFS } from '../buildings-registry.js'
import { REPUTATION_DECAY } from './wealth-tiers.js'
import { parkDesirabilityBonus, RES_PARK_BONUS } from './desirability.js'

const RAW_CRIME = 0.35
const RAW_POLLUTION = 0.25
const RAW_FIRE = 0.15
const RAW_PARK = 0.15
const RAW_OCCUPANCY = 0.10
const RAW_EDUCATION = 0.10
const TOTAL = RAW_CRIME + RAW_POLLUTION + RAW_FIRE + RAW_PARK + RAW_OCCUPANCY + RAW_EDUCATION

const QUALITY_CRIME_WEIGHT = RAW_CRIME / TOTAL
const QUALITY_POLLUTION_WEIGHT = RAW_POLLUTION / TOTAL
const QUALITY_FIRE_WEIGHT = RAW_FIRE / TOTAL
const QUALITY_PARK_WEIGHT = RAW_PARK / TOTAL
const QUALITY_OCCUPANCY_WEIGHT = RAW_OCCUPANCY / TOTAL
const QUALITY_EDUCATION_WEIGHT = RAW_EDUCATION / TOTAL

const OCCUPANCY_SEARCH_RADIUS = 5
const OCCUPANCY_HEALTH_THRESHOLD = 0.7

/** @internal — exported for testing only */
export function computeCurrentQuality(
  crimeNorm: number, pollNorm: number, fireNorm: number, parkNorm: number, occupancyHealth: number, educationNorm: number,
): number {
  return (
    (1 - crimeNorm) * QUALITY_CRIME_WEIGHT +
    (1 - pollNorm) * QUALITY_POLLUTION_WEIGHT +
    fireNorm * QUALITY_FIRE_WEIGHT +
    parkNorm * QUALITY_PARK_WEIGHT +
    occupancyHealth * QUALITY_OCCUPANCY_WEIGHT +
    educationNorm * QUALITY_EDUCATION_WEIGHT
  )
}

function computeOccupancyHealth(x: number, y: number, bldIdx: BuildingIndex): number {
  let bestHealth = 0
  forEachBuildingInRadius(bldIdx, x, y, OCCUPANCY_SEARCH_RADIUS, (b) => {
    if (b.state !== 'active') return
    const def = BUILDING_DEFS[b.defId]
    if (!def || def.category !== BuildingCategory.Residential || def.capacity === 0) return
    const health = Math.min(1, b.residents / (def.capacity * OCCUPANCY_HEALTH_THRESHOLD))
    if (health > bestHealth) bestHealth = health
  })
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
  educationCoverage: Uint8Array,
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
      const occupancyHealth = computeOccupancyHealth(x, y, bldIdx)
      const educationNorm = educationCoverage[idx]! / 255
      const quality = computeCurrentQuality(crimeNorm, pollNorm, fireNorm, parkNorm, occupancyHealth, educationNorm)
      reputationLayer[idx] = REPUTATION_DECAY * reputationLayer[idx]! + (1 - REPUTATION_DECAY) * quality
    }
  }
}
