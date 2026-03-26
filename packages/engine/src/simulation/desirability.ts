import { type GameMap, ZoneType, BuildingCategory } from '@bitborough/core'
import { type BuildingIndex, forEachBuildingInRadius } from '../building-index.js'
import { BUILDING_DEFS } from '../buildings-registry.js'
import { hasNearbyRoad } from './road-access.js'
import { clamp } from './math.js'

// Residential weights (sum to 1.0 at perfect conditions, no pollution)
const RES_BASELINE = 0.3 // constant when power + road present
const RES_SAFETY_WEIGHT = 0.3 // (1 - crimeNorm) × this
const RES_FIRE_BONUS = 0.15 // flat bonus when fire-covered
export const RES_PARK_BONUS = 0.25 // flat bonus when park within PARK_RADIUS tiles
const RES_POLLUTION_PENALTY = 0.3 // pollutionNorm × this, subtracted
const RES_EDUCATION_BONUS = 0.20
const EDUCATION_COVERAGE_THRESHOLD = 76 // ≈ 0.3 × 255
const PARK_RADIUS = 5

// Zone boundary effects
const ZONE_BOUNDARY_RADIUS = 3
const COM_ADJACENCY_BONUS = 0.10
const IND_ADJACENCY_PENALTY = 0.15

function zoneBoundaryEffect(x: number, y: number, map: GameMap, bldIdx?: BuildingIndex): number {
  if (!bldIdx) return 0
  let effect = 0
  let hasCommercial = false
  let hasIndustrial = false

  forEachBuildingInRadius(bldIdx, x, y, ZONE_BOUNDARY_RADIUS, (b) => {
    if (b.state !== 'active') return
    const def = BUILDING_DEFS[b.defId]
    if (!def) return
    if (def.category === BuildingCategory.Commercial && !hasCommercial) {
      hasCommercial = true
      effect += COM_ADJACENCY_BONUS
    }
    if (def.category === BuildingCategory.Industrial && !hasIndustrial) {
      hasIndustrial = true
      effect -= IND_ADJACENCY_PENALTY
    }
    if (hasCommercial && hasIndustrial) return true
  })
  return effect
}

// Commercial weights (sum to 1.0)
const COM_BASELINE = 0.4
const COM_TRANSIT_BONUS = 0.35
const COM_RESIDENTIAL_BONUS = 0.25
const COM_TRANSIT_RADIUS = 10
const COM_RESIDENTIAL_RADIUS = 5
const COM_RESIDENTIAL_MIN_COUNT = 3 // need at least this many to earn the bonus

/**
 * Compute per-tile desirability for a zone type.
 * Returns 0 if infrastructure gate fails (no power OR no road access).
 * Returns 0–1 otherwise based on zone-type-specific factors.
 */
export function computeDesirability(
  zone: ZoneType,
  x: number,
  y: number,
  map: GameMap,
  powerGrid: Uint8Array,
  crimeLevel: Uint8Array,
  fireCoverage: Uint8Array,
  pollutionLevel: Uint8Array,
  bldIdx?: BuildingIndex,
  educationCoverage?: Uint8Array,
): number {
  const idx = y * map.width + x

  if (!powerGrid[idx]) return 0
  if (!hasNearbyRoad(map, x, y)) return 0

  switch (zone) {
    case ZoneType.Residential:
      return residentialDesirability(x, y, idx, map, crimeLevel, fireCoverage, pollutionLevel, bldIdx, educationCoverage)
    case ZoneType.Commercial:
      return commercialDesirability(x, y, map, bldIdx)
    case ZoneType.Industrial:
      return 1.0
    default:
      return 0
  }
}

function residentialDesirability(
  x: number,
  y: number,
  idx: number,
  map: GameMap,
  crimeLevel: Uint8Array,
  fireCoverage: Uint8Array,
  pollutionLevel: Uint8Array,
  bldIdx?: BuildingIndex,
  educationCoverage?: Uint8Array,
): number {
  const crimeNorm = crimeLevel[idx]! / 255
  const pollNorm = pollutionLevel[idx]! / 255

  let score = RES_BASELINE
  score += (1 - crimeNorm) * RES_SAFETY_WEIGHT
  if (fireCoverage[idx]) score += RES_FIRE_BONUS
  score += parkDesirabilityBonus(x, y, map, bldIdx)
  if (educationCoverage) {
    const eduVal = educationCoverage[idx]!
    if (eduVal > EDUCATION_COVERAGE_THRESHOLD) {
      score += RES_EDUCATION_BONUS * (eduVal / 255)
    }
  }
  score -= pollNorm * RES_POLLUTION_PENALTY
  score += zoneBoundaryEffect(x, y, map, bldIdx)

  return clamp(score, 0, 1)
}

function commercialDesirability(x: number, y: number, map: GameMap, bldIdx?: BuildingIndex): number {
  let score = COM_BASELINE
  if (hasTransitNearby(x, y, map, bldIdx)) score += COM_TRANSIT_BONUS
  if (hasResidentialDensity(x, y, map, bldIdx)) score += COM_RESIDENTIAL_BONUS
  return clamp(score, 0, 1)
}


export function parkDesirabilityBonus(x: number, y: number, map: GameMap, bldIdx?: BuildingIndex): number {
  let best = 0
  if (bldIdx) {
    forEachBuildingInRadius(bldIdx, x, y, PARK_RADIUS, (b, dist) => {
      if (b.defId === 'special.park' && b.state === 'active') {
        const bonus = RES_PARK_BONUS * (1 - dist / PARK_RADIUS)
        if (bonus > best) best = bonus
      }
    })
    return best
  }
  for (const b of map.buildings) {
    if (b.defId !== 'special.park' || b.state !== 'active') continue
    const dist = Math.abs(b.x - x) + Math.abs(b.y - y)
    if (dist <= PARK_RADIUS) {
      const bonus = RES_PARK_BONUS * (1 - dist / PARK_RADIUS)
      if (bonus > best) best = bonus
    }
  }
  return best
}

function hasTransitNearby(x: number, y: number, map: GameMap, bldIdx?: BuildingIndex): boolean {
  if (bldIdx) {
    let found = false
    forEachBuildingInRadius(bldIdx, x, y, COM_TRANSIT_RADIUS, (b) => {
      if (b.defId === 'transit.stop' && b.state === 'active') {
        found = true
        return true
      }
    })
    return found
  }
  for (const b of map.buildings) {
    if (b.defId !== 'transit.stop' || b.state !== 'active') continue
    if (Math.abs(b.x - x) + Math.abs(b.y - y) <= COM_TRANSIT_RADIUS) return true
  }
  return false
}

function hasResidentialDensity(x: number, y: number, map: GameMap, bldIdx?: BuildingIndex): boolean {
  let count = 0
  if (bldIdx) {
    forEachBuildingInRadius(bldIdx, x, y, COM_RESIDENTIAL_RADIUS, (b) => {
      if (b.defId.startsWith('res') && b.state === 'active') {
        count++
        if (count >= COM_RESIDENTIAL_MIN_COUNT) return true
      }
    })
    return count >= COM_RESIDENTIAL_MIN_COUNT
  }
  for (const b of map.buildings) {
    if (!b.defId.startsWith('res') || b.state !== 'active') continue
    if (Math.abs(b.x - x) + Math.abs(b.y - y) <= COM_RESIDENTIAL_RADIUS) count++
    if (count >= COM_RESIDENTIAL_MIN_COUNT) return true
  }
  return false
}
