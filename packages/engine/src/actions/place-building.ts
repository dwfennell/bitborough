import { type GameMap, type Building, type Result, TileType, ZoneType, FailReason } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import type { BuildingIndex } from '../building-index.js'

export function placeBuilding(
  map: GameMap,
  x: number,
  y: number,
  defId: string,
  funds: number,
  bldIdx: BuildingIndex,
  nextBuildingId: number,
): { result: Result; cost: number; building?: Building } {
  const def = BUILDING_DEFS[defId]
  if (!def) {
    return {
      result: { ok: false, reason: FailReason.InvalidLocation, detail: `Unknown building: ${defId}` },
      cost: 0,
    }
  }

  if (funds < def.cost) {
    return { result: { ok: false, reason: FailReason.InsufficientFunds }, cost: 0 }
  }

  // Check footprint fits on map, no water, no existing buildings or infrastructure
  for (let dy = 0; dy < def.size.h; dy++) {
    for (let dx = 0; dx < def.size.w; dx++) {
      const tx = x + dx
      const ty = y + dy
      if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) {
        return { result: { ok: false, reason: FailReason.InvalidLocation, detail: 'Footprint out of bounds' }, cost: 0 }
      }
      const idx = ty * map.width + tx
      if (map.terrain[idx] === TileType.Water) {
        return { result: { ok: false, reason: FailReason.InvalidLocation, detail: 'Cannot build on water' }, cost: 0 }
      }
      if (map.infrastructure[idx] !== 0) {
        return { result: { ok: false, reason: FailReason.Occupied }, cost: 0 }
      }
      if (bldIdx.has(tx, ty)) {
        return { result: { ok: false, reason: FailReason.Occupied }, cost: 0 }
      }
    }
  }

  const building: Building = {
    id: `b${nextBuildingId}`,
    defId,
    x,
    y,
    powered: false,
    density: def.density,
    age: 0,
    state: 'active',
    residents: 0,
  }

  map.buildings.push(building)

  for (let dy = 0; dy < def.size.h; dy++) {
    for (let dx = 0; dx < def.size.w; dx++) {
      const idx = (y + dy) * map.width + (x + dx)
      map.zones[idx] = ZoneType.None
    }
  }

  return { result: { ok: true }, cost: def.cost, building }
}
