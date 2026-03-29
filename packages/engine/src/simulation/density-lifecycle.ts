import { type Building, type GameMap, BuildingCategory, ZoneType, DensityLevel } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import { BuildingIndex } from '../building-index.js'

// ── Construction ─────────────────────────────────────────────────────────────

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

export function startConstruction(building: Building, targetDefId: string): void {
  building.state = 'under_construction'
  building.upgradingToDefId = targetDefId
  building.constructionMonthsRemaining = constructionTime(targetDefId)
}

export function tickConstruction(map: GameMap, building: Building, bldIdx: BuildingIndex): number {
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
  if (check.toConsume.length > 0) {
    const consumeSet = new Set(check.toConsume)
    map.buildings = map.buildings.filter((b) => !consumeSet.has(b.id))
  }

  building.defId = newDefId
  building.density = newDef.density
  building.state = 'active'
  building.constructionMonthsRemaining = undefined
  building.upgradingToDefId = undefined
  building.age = 0

  return -check.consumedPop
}

// ── Dereliction ──────────────────────────────────────────────────────────────

export const LOW_OCCUPANCY_DERELICT_MONTHS = 3
const DERELICT_DOWNGRADE_MONTHS = 6

export const DOWNGRADE_TARGET: Record<string, string> = {
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

// ── Footprint check ──────────────────────────────────────────────────────────

export type FootprintCheck = { ok: false } | { ok: true; toConsume: string[]; consumedPop: number }

export function categoryToZone(category: BuildingCategory): ZoneType {
  if (category === BuildingCategory.Residential) return ZoneType.Residential
  if (category === BuildingCategory.Commercial) return ZoneType.Commercial
  if (category === BuildingCategory.Industrial) return ZoneType.Industrial
  return ZoneType.None
}

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
  const toConsumeSet = new Set<string>()
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
        if (
          bDef.category === targetCategory &&
          bDef.category !== BuildingCategory.Special &&
          bAtTile.state === 'active'
        ) {
          if (!toConsumeSet.has(bAtTile.id)) {
            toConsumeSet.add(bAtTile.id)
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
