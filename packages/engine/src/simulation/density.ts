import { DensityLevel, BuildingCategory } from '@bitborough/core'
import type { DemandInfo, GameMap } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import type { PRNG } from '../prng.js'
import { BuildingIndex } from '../building-index.js'
import { computeDesirability } from './desirability.js'
import { hasNearbyPavedRoad } from './road-access.js'
import { getZoneDemand } from './zones.js'
import {
  startConstruction,
  tickConstruction,
  tickDerelict,
  categoryToZone,
  LOW_OCCUPANCY_DERELICT_MONTHS,
  DOWNGRADE_TARGET,
} from './density-lifecycle.js'

// Re-export for consumers
export {
  tickDerelict,
  checkFootprintForUpgrade,
  type FootprintCheck,
  categoryToZone,
} from './density-lifecycle.js'

// ── Constants ───────────────────────────────────────────────────────────────

export const TRANSIT_RADIUS = 10
export const FILL_RATE = 0.12
export const DRAIN_RATE = 0.2

/** Occupancy threshold for low-to-medium density upgrade (building and neighbourhood). */
export const LOW_TO_MED_OCCUPANCY_THRESHOLD = 0.7
/** Occupancy threshold for medium-to-high density upgrade. */
export const MED_TO_HIGH_OCCUPANCY_THRESHOLD = 0.85
/** Occupancy below this triggers the dereliction countdown. */
export const DERELICTION_OCCUPANCY_THRESHOLD = 0.1

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Center of all active buildings (arithmetic mean of positions). Returns map center if no buildings. */
export function cityCenter(map: GameMap): { cx: number; cy: number } {
  let sumX = 0,
    sumY = 0,
    count = 0
  for (const b of map.buildings) {
    if (b.state !== 'active') continue
    sumX += b.x
    sumY += b.y
    count++
  }
  if (count === 0) return { cx: map.width / 2, cy: map.height / 2 }
  return { cx: sumX / count, cy: sumY / count }
}

/** True if any active transit stop building exists within TRANSIT_RADIUS tiles (Manhattan distance). */
export function hasNearbyTransitStop(map: GameMap, x: number, y: number): boolean {
  for (const b of map.buildings) {
    if (b.defId !== 'transit.stop' || b.state !== 'active') continue
    const dist = Math.abs(b.x - x) + Math.abs(b.y - y)
    if (dist <= TRANSIT_RADIUS) return true
  }
  return false
}

/**
 * Upgrade probability using Clark's Law exponential decay.
 * P = demandFactor × e^(-distance / radius)
 */
export function upgradeProb(demandFactor: number, distance: number, radius: number): number {
  return demandFactor * Math.exp(-distance / radius)
}

/**
 * Dynamic radius for medium density — grows with population.
 * Starts at 5 tiles, reaches 30 at ~25,000 population.
 */
export function mediumRadius(population: number): number {
  return Math.min(5 + population / 1000, 30)
}

/** True if more than half of neighbors within 3-tile radius are Medium or High density zone buildings. */
export function hasCriticalMass(map: GameMap, x: number, y: number, bldIdx?: BuildingIndex): boolean {
  let developed = 0
  let total = 0
  const range = 3
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      if (dx === 0 && dy === 0) continue
      if (Math.abs(dx) + Math.abs(dy) > range) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue
      total++
      const neighbor = bldIdx
        ? bldIdx.get(nx, ny)
        : map.buildings.find((b) => b.x === nx && b.y === ny && b.state === 'active')
      if (neighbor && neighbor.state === 'active') {
        const def = BUILDING_DEFS[neighbor.defId]
        if (def && (def.density === DensityLevel.Medium || def.density === DensityLevel.High)) developed++
      }
    }
  }
  return total > 0 && developed / total > 0.5
}

export function neighbourhoodAvgOccupancy(
  map: GameMap,
  x: number,
  y: number,
  radius: number,
  bldIdx?: BuildingIndex,
): number {
  let total = 0
  let count = 0
  const seen = bldIdx ? new Set<string>() : undefined
  if (bldIdx) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > radius) continue
        if (dx === 0 && dy === 0) continue
        const b = bldIdx.get(x + dx, y + dy)
        if (!b || b.state !== 'active' || seen!.has(b.id)) continue
        seen!.add(b.id)
        const def = BUILDING_DEFS[b.defId]
        if (!def || def.capacity === 0 || def.category === BuildingCategory.Special) continue
        total += b.residents / def.capacity
        count++
      }
    }
  } else {
    for (const b of map.buildings) {
      if (b.x === x && b.y === y) continue
      if (b.state !== 'active') continue
      const def = BUILDING_DEFS[b.defId]
      if (!def || def.capacity === 0 || def.category === BuildingCategory.Special) continue
      if (Math.abs(b.x - x) + Math.abs(b.y - y) > radius) continue
      total += b.residents / def.capacity
      count++
    }
  }
  return count === 0 ? 0 : total / count
}

// ── Variant tables ──────────────────────────────────────────────────────────

const MEDIUM_VARIANTS: Record<string, Array<[string, number]>> = {
  'res.low': [
    ['res.med', 1],
    ['res.med.b', 1],
  ],
  'com.low': [
    ['com.med', 1],
    ['com.med.b', 2],
  ],
  'ind.low': [
    ['ind.med', 3],
    ['ind.med.b', 2],
  ],
}

const HIGH_VARIANTS: Record<string, Array<[string, number]>> = {
  'res.med': [['res.high', 1]],
  'res.med.b': [['res.high', 1]],
  'com.med': [
    ['com.high', 1],
    ['com.high.b', 1],
  ],
  'com.med.b': [
    ['com.high', 1],
    ['com.high.b', 1],
  ],
  'ind.med': [
    ['ind.high', 3],
    ['ind.high.b', 2],
  ],
  'ind.med.b': [
    ['ind.high', 3],
    ['ind.high.b', 2],
  ],
}

function nearestTransitDist(map: GameMap, x: number, y: number): number {
  let minDist = Infinity
  for (const b of map.buildings) {
    if (b.defId !== 'transit.stop' || b.state !== 'active') continue
    const dist = Math.abs(b.x - x) + Math.abs(b.y - y)
    if (dist < minDist) minDist = dist
  }
  return minDist === Infinity ? TRANSIT_RADIUS + 1 : minDist
}

function pickVariant(variants: Array<[string, number]>, prng: PRNG): string {
  const total = variants.reduce((s, [, w]) => s + w, 0)
  let r = prng.next() * total
  for (const [id, w] of variants) {
    r -= w
    if (r <= 0) return id
  }
  return variants[variants.length - 1]![0]
}

// ── Main update ─────────────────────────────────────────────────────────────

export function updateDensity(
  map: GameMap,
  powerGrid: Uint8Array,
  demand: DemandInfo,
  population: number,
  prng: PRNG,
  nextBuildingId: { value: number },
  crimeLevel: Uint8Array,
  fireCoverage: Uint8Array,
  pollutionLevel: Uint8Array,
  migrationModifier = 1.0,
): { populationDelta: number } {
  let populationDelta = 0
  const bldIdx = new BuildingIndex(map)

  // --- Fill/drain loop ---
  for (const building of map.buildings) {
    if (building.state !== 'active') continue
    const def = BUILDING_DEFS[building.defId]
    if (!def || def.capacity === 0 || def.category === BuildingCategory.Special) continue

    const desirability = computeDesirability(
      categoryToZone(def.category),
      building.x,
      building.y,
      map,
      powerGrid,
      crimeLevel,
      fireCoverage,
      pollutionLevel,
      bldIdx,
    )
    const zoneDemand = getZoneDemand(categoryToZone(def.category), demand)
    const target = def.capacity * Math.max(0, zoneDemand) * desirability

    const before = building.residents
    const occupancyRatio = def.capacity > 0 ? building.residents / def.capacity : 0
    const effectiveFillRate = FILL_RATE * (1 - occupancyRatio) * migrationModifier
    const rate = target > building.residents ? effectiveFillRate : DRAIN_RATE
    building.residents = Math.max(0, Math.min(def.capacity, building.residents + (target - building.residents) * rate))

    populationDelta += building.residents - before

    // Track low occupancy for dereliction (uses post-fill occupancy)
    if (def.capacity > 0) {
      const postFillOccupancy = building.residents / def.capacity
      if (postFillOccupancy < DERELICTION_OCCUPANCY_THRESHOLD) {
        building.lowOccupancyMonths = (building.lowOccupancyMonths ?? 0) + 1
        if (building.lowOccupancyMonths >= LOW_OCCUPANCY_DERELICT_MONTHS) {
          const downgradeTarget = DOWNGRADE_TARGET[building.defId]
          populationDelta -= building.residents
          building.residents = 0
          if (downgradeTarget) {
            startConstruction(building, downgradeTarget)
          } else {
            building.state = 'active'
            building.lowOccupancyMonths = undefined
          }
        }
      } else {
        building.lowOccupancyMonths = undefined
      }
    }
  }

  const { cx, cy } = cityCenter(map)
  const radius = mediumRadius(population)

  for (const building of map.buildings) {
    if (building.state === 'under_construction') {
      populationDelta += tickConstruction(map, building, bldIdx)
      continue
    }

    if (building.state === 'derelict') {
      populationDelta += tickDerelict(map, building)
      continue
    }

    // Active buildings age each month
    building.age++

    const def = BUILDING_DEFS[building.defId]
    if (!def || def.category === BuildingCategory.Special) continue

    // Low → Medium
    if (def.density === DensityLevel.Low) {
      const variants = MEDIUM_VARIANTS[building.defId]
      if (!variants) continue
      if (!hasNearbyPavedRoad(map, building.x, building.y)) continue

      const occupancy = def.capacity > 0 ? building.residents / def.capacity : 0
      if (occupancy < LOW_TO_MED_OCCUPANCY_THRESHOLD) continue
      const neighbourAvg = neighbourhoodAvgOccupancy(map, building.x, building.y, 5, bldIdx)
      if (neighbourAvg < LOW_TO_MED_OCCUPANCY_THRESHOLD) continue

      const dist = Math.hypot(building.x - cx, building.y - cy)
      const demandFactor = getZoneDemand(categoryToZone(def.category), demand)
      const p = upgradeProb(demandFactor, dist, radius)

      if (prng.next() < p) {
        const targetDefId = pickVariant(variants, prng)
        populationDelta -= building.residents
        startConstruction(building, targetDefId)
      }
    }

    // Medium → High
    if (def.density === DensityLevel.Medium) {
      const variants = HIGH_VARIANTS[building.defId]
      if (!variants) continue
      if (!hasNearbyTransitStop(map, building.x, building.y)) continue
      if (!hasCriticalMass(map, building.x, building.y, bldIdx)) continue

      const occupancy = def.capacity > 0 ? building.residents / def.capacity : 0
      if (occupancy < MED_TO_HIGH_OCCUPANCY_THRESHOLD) continue

      const distToTransit = nearestTransitDist(map, building.x, building.y)
      const demandFactor = getZoneDemand(categoryToZone(def.category), demand)
      const p = upgradeProb(demandFactor, distToTransit, TRANSIT_RADIUS)

      if (prng.next() < p) {
        const targetDefId = pickVariant(variants, prng)
        populationDelta -= building.residents
        startConstruction(building, targetDefId)
      }
    }
  }

  return { populationDelta }
}
