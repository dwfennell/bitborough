import { Infrastructure, DensityLevel, BuildingCategory, ZoneType } from '@bitborough/core'
import type { Building, DemandInfo, GameMap } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import type { PRNG } from '../prng.js'
import { BuildingIndex } from '../building-index.js'
import { computeDesirability } from './desirability.js'
import { hasNearbyPavedRoad } from './road-access.js'

const CONSTRUCTION_MONTHS: Record<number, number> = {
  [DensityLevel.Low]: 1,
  [DensityLevel.Medium]: 2,
  [DensityLevel.High]: 4,
}

function constructionTime(targetDefId: string): number {
  const def = BUILDING_DEFS[targetDefId]
  if (!def) return 2
  return CONSTRUCTION_MONTHS[def.density] ?? 2
}

export const TRANSIT_RADIUS = 10
export const FILL_RATE = 0.12
export const DRAIN_RATE = 0.2

/** Center of all active buildings (arithmetic mean of positions). Returns map center if no buildings. */
export function cityCenter(map: GameMap): { cx: number; cy: number } {
  const active = map.buildings.filter((b) => b.state === 'active')
  if (active.length === 0) return { cx: map.width / 2, cy: map.height / 2 }
  const cx = active.reduce((sum, b) => sum + b.x, 0) / active.length
  const cy = active.reduce((sum, b) => sum + b.y, 0) / active.length
  return { cx, cy }
}

/** True if any active transit stop building exists within TRANSIT_RADIUS tiles (Manhattan distance). */
export function hasNearbyTransitStop(map: GameMap, x: number, y: number): boolean {
  // Transit stops are 2x2, so any tile of the stop counts
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
      const neighbor = bldIdx ? bldIdx.get(nx, ny) : map.buildings.find((b) => b.x === nx && b.y === ny && b.state === 'active')
      if (neighbor && neighbor.state === 'active') {
        const def = BUILDING_DEFS[neighbor.defId]
        if (def && (def.density === DensityLevel.Medium || def.density === DensityLevel.High)) developed++
      }
    }
  }
  return total > 0 && developed / total > 0.5
}

export function neighbourhoodAvgOccupancy(map: GameMap, x: number, y: number, radius: number, bldIdx?: BuildingIndex): number {
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

// Weighted variants per zone tier: [defId, weight]
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

export function updateDensity(
  map: GameMap,
  powerGrid: Uint8Array,
  demand: DemandInfo,
  population: number,
  prng: PRNG,
  nextBuildingId: { value: number }, // reserved: may be needed if upgrade creates separate building objects
  crimeLevel: Uint8Array,
  fireCoverage: Uint8Array,
  pollutionLevel: Uint8Array,
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
    const zoneDemand = getZoneDemand(building.defId, demand)
    const target = def.capacity * Math.max(0, zoneDemand) * desirability

    const before = building.residents
    const occupancyRatio = def.capacity > 0 ? building.residents / def.capacity : 0
    const effectiveFillRate = FILL_RATE * (1 - occupancyRatio)
    const rate = target > building.residents ? effectiveFillRate : DRAIN_RATE
    building.residents = Math.max(0, Math.min(def.capacity, building.residents + (target - building.residents) * rate))

    populationDelta += building.residents - before

    // Track low occupancy for dereliction (uses post-fill occupancy)
    if (def.capacity > 0) {
      const postFillOccupancy = building.residents / def.capacity
      if (postFillOccupancy < 0.1) {
        building.lowOccupancyMonths = (building.lowOccupancyMonths ?? 0) + 1
        if (building.lowOccupancyMonths >= LOW_OCCUPANCY_DERELICT_MONTHS) {
          // Trigger dereliction
          const downgradeTarget = DOWNGRADE_TARGET[building.defId]
          populationDelta -= building.residents // subtract actual residents
          building.residents = 0
          if (downgradeTarget) {
            startConstruction(building, downgradeTarget)
          } else {
            // Already lowest density — reset to active, will fill naturally
            building.state = 'active'
            building.lowOccupancyMonths = undefined
          }
        }
      } else {
        building.lowOccupancyMonths = undefined // recovered
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
      if (occupancy < 0.7) continue
      const neighbourAvg = neighbourhoodAvgOccupancy(map, building.x, building.y, 5, bldIdx)
      if (neighbourAvg < 0.7) continue

      const dist = Math.hypot(building.x - cx, building.y - cy)
      const demandFactor = getZoneDemand(building.defId, demand)
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
      if (occupancy < 0.85) continue

      const distToTransit = nearestTransitDist(map, building.x, building.y)
      const demandFactor = getZoneDemand(building.defId, demand)
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
  building.constructionMonthsRemaining = constructionTime(targetDefId)
}

function tickConstruction(map: GameMap, building: Building, bldIdx: BuildingIndex): number {
  if (building.constructionMonthsRemaining === undefined) return 0
  building.constructionMonthsRemaining--
  if (building.constructionMonthsRemaining > 0) return 0

  const newDefId = building.upgradingToDefId!
  const newDef = BUILDING_DEFS[newDefId]
  if (!newDef) return 0

  const currentSize = BUILDING_DEFS[building.defId]?.size ?? { w: 1, h: 1 }
  const check = checkFootprintForUpgrade(
    map,
    building.x,
    building.y,
    newDef.size,
    building.id,
    currentSize,
    newDef.category,
    bldIdx,
  )

  if (!check.ok) {
    building.constructionMonthsRemaining = 1
    return 0
  }

  // Consume same-zone buildings in the expansion area
  for (const id of check.toConsume) {
    const idx = map.buildings.findIndex((b) => b.id === id)
    if (idx !== -1) map.buildings.splice(idx, 1)
  }

  building.defId = newDefId
  building.density = newDef.density
  building.state = 'active'
  building.constructionMonthsRemaining = undefined
  building.upgradingToDefId = undefined
  building.age = 0

  return -check.consumedPop
}

export type FootprintCheck = { ok: false } | { ok: true; toConsume: string[]; consumedPop: number }

/**
 * Check if the new footprint is compatible with the map for an upgrade.
 * For zone buildings (res/com/ind), expansion tiles must:
 *   1. Be in bounds
 *   2. Have the correct zone type
 *   3. Either be empty or occupied by a same-category active building (which will be consumed)
 * Tiles already part of the current building footprint are skipped.
 */
export function checkFootprintForUpgrade(
  map: GameMap,
  x: number,
  y: number,
  newSize: { w: number; h: number },
  ownId: string,
  currentSize: { w: number; h: number },
  targetCategory: BuildingCategory,
  bldIdx?: BuildingIndex,
): FootprintCheck {
  const toConsume: string[] = []
  let consumedPop = 0
  const idx = bldIdx ?? new BuildingIndex(map)

  for (let dy = 0; dy < newSize.h; dy++) {
    for (let dx = 0; dx < newSize.w; dx++) {
      const tx = x + dx
      const ty = y + dy
      if (tx >= map.width || ty >= map.height) return { ok: false }

      // Skip tiles already part of the current building footprint
      if (dx < currentSize.w && dy < currentSize.h) continue

      // Expansion tile: zone check for zone buildings
      if (targetCategory !== BuildingCategory.Special) {
        const tileZone = map.zones[ty * map.width + tx] as ZoneType
        if (tileZone !== categoryToZone(targetCategory)) return { ok: false }
      }

      // Check for buildings in this expansion tile
      const bAtTile = idx.get(tx, ty)
      if (bAtTile && bAtTile.id !== ownId) {
        const bDef = BUILDING_DEFS[bAtTile.defId]
        if (!bDef) return { ok: false }
        if (bDef.category === targetCategory && bDef.category !== BuildingCategory.Special && bAtTile.state === 'active') {
          if (!toConsume.includes(bAtTile.id)) {
            toConsume.push(bAtTile.id)
            consumedPop += bAtTile.residents
          }
        } else {
          return { ok: false }
        }
      }
    }
  }

  return { ok: true, toConsume, consumedPop }
}

function categoryToZone(category: BuildingCategory): ZoneType {
  if (category === BuildingCategory.Residential) return ZoneType.Residential
  if (category === BuildingCategory.Commercial) return ZoneType.Commercial
  if (category === BuildingCategory.Industrial) return ZoneType.Industrial
  return ZoneType.None
}

const LOW_OCCUPANCY_DERELICT_MONTHS = 3
const DERELICT_DOWNGRADE_MONTHS = 6

const DOWNGRADE_TARGET: Record<string, string> = {
  'res.med': 'res.low',
  'res.med.b': 'res.low',
  'com.med': 'com.low',
  'com.med.b': 'com.low',
  'ind.med': 'ind.low',
  'ind.med.b': 'ind.low',
  'res.high': 'res.med',
  'com.high': 'com.med',
  'com.high.b': 'com.med',
  'ind.high': 'ind.med',
  'ind.high.b': 'ind.med',
}

export function tickDerelict(map: GameMap, building: Building): number {
  building.derelictMonths = (building.derelictMonths ?? 0) + 1
  if (building.derelictMonths >= DERELICT_DOWNGRADE_MONTHS) {
    const downgradeTarget = DOWNGRADE_TARGET[building.defId]
    const currentPop = building.residents
    if (downgradeTarget) {
      startConstruction(building, downgradeTarget)
      return -currentPop // subtract current building's population when downgrade starts
    } else {
      // Already lowest density — reset to active so it can redevelop naturally
      building.state = 'active'
      building.derelictMonths = undefined
      building.residents = 0
      building.lowOccupancyMonths = undefined
      return 0 // fill loop restores occupancy naturally
    }
  }
  return 0
}
