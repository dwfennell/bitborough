import { type GameMap, ZoneType, Infrastructure } from '@bitborough/core'
import type { BuildingIndex } from '../building-index.js'

// Residential weights (sum to 1.0 at perfect conditions, no pollution)
const RES_BASELINE = 0.3 // constant when power + road present
const RES_SAFETY_WEIGHT = 0.3 // (1 - crimeNorm) × this
const RES_FIRE_BONUS = 0.15 // flat bonus when fire-covered
const RES_PARK_BONUS = 0.25 // flat bonus when park within PARK_RADIUS tiles
const RES_POLLUTION_PENALTY = 0.3 // pollutionNorm × this, subtracted
const PARK_RADIUS = 5

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
): number {
  const idx = y * map.width + x

  if (!powerGrid[idx]) return 0
  if (!hasRoadAccess(map, x, y)) return 0

  switch (zone) {
    case ZoneType.Residential:
      return residentialDesirability(x, y, idx, map, crimeLevel, fireCoverage, pollutionLevel, bldIdx)
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
): number {
  const crimeNorm = crimeLevel[idx]! / 255
  const pollNorm = pollutionLevel[idx]! / 255

  let score = RES_BASELINE
  score += (1 - crimeNorm) * RES_SAFETY_WEIGHT
  if (fireCoverage[idx]) score += RES_FIRE_BONUS
  if (hasParkNearby(x, y, map, bldIdx)) score += RES_PARK_BONUS
  score -= pollNorm * RES_POLLUTION_PENALTY

  return Math.max(0, Math.min(1, score))
}

function commercialDesirability(x: number, y: number, map: GameMap, bldIdx?: BuildingIndex): number {
  let score = COM_BASELINE
  if (hasTransitNearby(x, y, map, bldIdx)) score += COM_TRANSIT_BONUS
  if (hasResidentialDensity(x, y, map, bldIdx)) score += COM_RESIDENTIAL_BONUS
  return Math.max(0, Math.min(1, score))
}

function hasRoadAccess(map: GameMap, x: number, y: number): boolean {
  const range = 3
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > range) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue
      if (map.infrastructure[ny * map.width + nx]! & Infrastructure.Road) return true
    }
  }
  return false
}

function hasParkNearby(x: number, y: number, map: GameMap, bldIdx?: BuildingIndex): boolean {
  if (bldIdx) {
    for (let dy = -PARK_RADIUS; dy <= PARK_RADIUS; dy++) {
      for (let dx = -PARK_RADIUS; dx <= PARK_RADIUS; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > PARK_RADIUS) continue
        const b = bldIdx.get(x + dx, y + dy)
        if (b && b.defId === 'special.park' && b.state === 'active') return true
      }
    }
    return false
  }
  for (const b of map.buildings) {
    if (b.defId !== 'special.park' || b.state !== 'active') continue
    if (Math.abs(b.x - x) + Math.abs(b.y - y) <= PARK_RADIUS) return true
  }
  return false
}

function hasTransitNearby(x: number, y: number, map: GameMap, bldIdx?: BuildingIndex): boolean {
  if (bldIdx) {
    for (let dy = -COM_TRANSIT_RADIUS; dy <= COM_TRANSIT_RADIUS; dy++) {
      for (let dx = -COM_TRANSIT_RADIUS; dx <= COM_TRANSIT_RADIUS; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > COM_TRANSIT_RADIUS) continue
        const b = bldIdx.get(x + dx, y + dy)
        if (b && b.defId === 'transit.stop' && b.state === 'active') return true
      }
    }
    return false
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
    for (let dy = -COM_RESIDENTIAL_RADIUS; dy <= COM_RESIDENTIAL_RADIUS; dy++) {
      for (let dx = -COM_RESIDENTIAL_RADIUS; dx <= COM_RESIDENTIAL_RADIUS; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > COM_RESIDENTIAL_RADIUS) continue
        const b = bldIdx.get(x + dx, y + dy)
        if (b && b.defId.startsWith('res') && b.state === 'active') count++
        if (count >= COM_RESIDENTIAL_MIN_COUNT) return true
      }
    }
    return false
  }
  for (const b of map.buildings) {
    if (!b.defId.startsWith('res') || b.state !== 'active') continue
    if (Math.abs(b.x - x) + Math.abs(b.y - y) <= COM_RESIDENTIAL_RADIUS) count++
    if (count >= COM_RESIDENTIAL_MIN_COUNT) return true
  }
  return false
}
