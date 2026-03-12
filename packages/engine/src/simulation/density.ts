import { DensityLevel, BuildingCategory } from '@bitborough/core'
import type { Building, DemandInfo, GameMap } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import type { PRNG } from '../prng.js'
import { hasNearbyPavedRoad } from './road-access.js'

export const TRANSIT_RADIUS = 10
export const MEDIUM_DENSITY_POP_THRESHOLD = 500

/** Center of all active buildings (arithmetic mean of positions). Returns map center if no buildings. */
export function cityCenter(map: GameMap): { cx: number; cy: number } {
  const active = map.buildings.filter(b => b.state === 'active')
  if (active.length === 0) return { cx: map.width / 2, cy: map.height / 2 }
  const cx = active.reduce((sum, b) => sum + b.x, 0) / active.length
  const cy = active.reduce((sum, b) => sum + b.y, 0) / active.length
  return { cx, cy }
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
export function hasCriticalMass(map: GameMap, x: number, y: number): boolean {
  let developed = 0
  let total = 0
  const range = 3
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      if (dx === 0 && dy === 0) continue
      if (Math.abs(dx) + Math.abs(dy) > range) continue  // Manhattan distance guard
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue
      total++
      const neighbor = map.buildings.find(b => b.x === nx && b.y === ny && b.state === 'active')
      if (neighbor) {
        const def = BUILDING_DEFS[neighbor.defId]
        if (def && (def.density === DensityLevel.Medium || def.density === DensityLevel.High)) developed++
      }
    }
  }
  return total > 0 && developed / total > 0.5
}

// Weighted variants per zone tier: [defId, weight]
const MEDIUM_VARIANTS: Record<string, Array<[string, number]>> = {
  'res.low': [['res.med', 1], ['res.med.b', 1]],
  'com.low': [['com.med', 1], ['com.med.b', 2]],
  'ind.low': [['ind.med', 3], ['ind.med.b', 2]],
}

const HIGH_VARIANTS: Record<string, Array<[string, number]>> = {
  'res.med':   [['res.high', 1]],
  'res.med.b': [['res.high', 1]],
  'com.med':   [['com.high', 1], ['com.high.b', 1]],
  'com.med.b': [['com.high', 1], ['com.high.b', 1]],
  'ind.med':   [['ind.high', 3], ['ind.high.b', 2]],
  'ind.med.b': [['ind.high', 3], ['ind.high.b', 2]],
}

export function updateDensity(
  map: GameMap,
  powerGrid: Uint8Array,
  demand: DemandInfo,
  population: number,
  prng: PRNG,
  nextBuildingId: { value: number }, // reserved: may be needed if upgrade creates separate building objects
): { populationDelta: number } {
  let populationDelta = 0

  const { cx, cy } = cityCenter(map)
  const radius = mediumRadius(population)
  const popThresholdMet = population >= MEDIUM_DENSITY_POP_THRESHOLD

  for (const building of map.buildings) {
    if (building.state === 'under_construction') {
      populationDelta += tickConstruction(map, building)
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
    if (def.density === DensityLevel.Low && popThresholdMet) {
      const variants = MEDIUM_VARIANTS[building.defId]
      if (!variants) continue
      if (!hasNearbyPavedRoad(map, building.x, building.y)) continue

      const dist = Math.hypot(building.x - cx, building.y - cy)
      const demandFactor = getZoneDemand(building.defId, demand)
      const p = upgradeProb(demandFactor, dist, radius)

      if (prng.next() < p) {
        const targetDefId = pickVariant(variants, prng)
        populationDelta -= def.population
        startConstruction(building, targetDefId)
      }
    }

    // Medium → High
    if (def.density === DensityLevel.Medium) {
      const variants = HIGH_VARIANTS[building.defId]
      if (!variants) continue
      if (!hasNearbyTransitStop(map, building.x, building.y)) continue
      if (!hasCriticalMass(map, building.x, building.y)) continue

      const distToTransit = nearestTransitDist(map, building.x, building.y)
      const demandFactor = getZoneDemand(building.defId, demand)
      const p = upgradeProb(demandFactor, distToTransit, TRANSIT_RADIUS)

      if (prng.next() < p) {
        const targetDefId = pickVariant(variants, prng)
        populationDelta -= def.population
        startConstruction(building, targetDefId)
      }
    }
  }

  return { populationDelta }
}

function getZoneDemand(defId: string, demand: DemandInfo): number {
  if (defId.startsWith('res')) return demand.residential
  if (defId.startsWith('com')) return demand.commercial
  if (defId.startsWith('ind')) return demand.industrial
  return 0
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

function startConstruction(building: Building, targetDefId: string): void {
  building.state = 'under_construction'
  building.upgradingToDefId = targetDefId
  building.constructionMonthsRemaining = 2  // fixed 2 months (deterministic)
}

function tickConstruction(map: GameMap, building: Building): number {
  if (building.constructionMonthsRemaining === undefined) return 0
  building.constructionMonthsRemaining--
  if (building.constructionMonthsRemaining > 0) return 0

  const newDefId = building.upgradingToDefId!
  const newDef = BUILDING_DEFS[newDefId]
  if (!newDef) return 0

  // Check if expanded footprint fits
  if (!footprintFits(map, building.x, building.y, newDef.size, building.id)) {
    // Wait one more month
    building.constructionMonthsRemaining = 1
    return 0
  }

  building.defId = newDefId
  building.density = newDef.density
  building.state = 'active'
  building.constructionMonthsRemaining = undefined
  building.upgradingToDefId = undefined
  building.age = 0

  return newDef.population
}

function footprintFits(
  map: GameMap,
  x: number,
  y: number,
  size: { w: number; h: number },
  ownId: string,
): boolean {
  for (let dy = 0; dy < size.h; dy++) {
    for (let dx = 0; dx < size.w; dx++) {
      const tx = x + dx
      const ty = y + dy
      if (tx >= map.width || ty >= map.height) return false
      const conflict = map.buildings.find(
        b => b.id !== ownId && b.state !== 'under_construction' && occupiesTile(b, tx, ty)
      )
      if (conflict) return false
    }
  }
  return true
}

function occupiesTile(b: Building, x: number, y: number): boolean {
  const def = BUILDING_DEFS[b.defId]
  if (!def) return false
  return x >= b.x && x < b.x + def.size.w && y >= b.y && y < b.y + def.size.h
}

const DERELICT_DOWNGRADE_MONTHS = 6

const DOWNGRADE_TARGET: Record<string, string> = {
  'res.med': 'res.low', 'res.med.b': 'res.low',
  'com.med': 'com.low', 'com.med.b': 'com.low',
  'ind.med': 'ind.low', 'ind.med.b': 'ind.low',
  'res.high': 'res.med', 'com.high': 'com.med',
  'com.high.b': 'com.med', 'ind.high': 'ind.med', 'ind.high.b': 'ind.med',
}

/**
 * Check all active non-Low zone buildings for missing infrastructure.
 * Marks them derelict if requirements are no longer met.
 * Recovers derelict buildings if infrastructure is restored.
 * Called by Engine after any bulldoze action.
 */
export function checkDereliction(map: GameMap, powerGrid: Uint8Array): { populationDelta: number } {
  let populationDelta = 0
  for (const building of map.buildings) {
    const def = BUILDING_DEFS[building.defId]
    if (!def || def.category === BuildingCategory.Special) continue

    if (building.state === 'active' && def.density > DensityLevel.Low) {
      const infraOk = def.density === DensityLevel.Medium
        ? hasNearbyPavedRoad(map, building.x, building.y)
        : hasNearbyTransitStop(map, building.x, building.y)
      if (!infraOk) {
        building.state = 'derelict'
        building.derelictMonths = 0
        populationDelta -= def.population  // subtract lost population
      }
    } else if (building.state === 'derelict' && def.density > DensityLevel.Low) {
      const infraRestored = def.density === DensityLevel.Medium
        ? hasNearbyPavedRoad(map, building.x, building.y)
        : hasNearbyTransitStop(map, building.x, building.y)
      if (infraRestored) {
        building.state = 'active'
        building.derelictMonths = undefined
        populationDelta += def.population  // restore population on recovery
      }
    }
  }
  return { populationDelta }
}

export function tickDerelict(map: GameMap, building: Building): number {
  building.derelictMonths = (building.derelictMonths ?? 0) + 1
  if (building.derelictMonths >= DERELICT_DOWNGRADE_MONTHS) {
    const downgradeTarget = DOWNGRADE_TARGET[building.defId]
    const currentPop = BUILDING_DEFS[building.defId]?.population ?? 0
    if (downgradeTarget) {
      startConstruction(building, downgradeTarget)
      return -currentPop  // subtract current building's population when downgrade starts
    } else {
      // Already lowest density — reset to active so it can redevelop naturally
      building.state = 'active'
      building.derelictMonths = undefined
      return currentPop  // restore population for low-density buildings resetting to active
    }
  }
  return 0
}
