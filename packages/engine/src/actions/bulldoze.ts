import { type GameMap, type Result, TileType, FailReason, COSTS } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import type { BuildingIndex } from '../building-index.js'

function clearTile(map: GameMap, idx: number): void {
  map.infrastructure[idx] = 0
  map.connections[idx] = 0
  map.zones[idx] = 0
  if (map.terrain[idx] !== TileType.Grass && map.terrain[idx] !== TileType.Sand) {
    map.terrain[idx] = TileType.Grass
  }
}

export function bulldoze(
  map: GameMap,
  x: number,
  y: number,
  funds: number,
  bldIdx: BuildingIndex,
): { result: Result; cost: number } {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) {
    return { result: { ok: false, reason: FailReason.InvalidLocation }, cost: 0 }
  }

  const idx = y * map.width + x
  if (map.terrain[idx] === TileType.Water) {
    return { result: { ok: false, reason: FailReason.NotBulldozable }, cost: 0 }
  }

  if (funds < COSTS.bulldoze) {
    return { result: { ok: false, reason: FailReason.InsufficientFunds }, cost: 0 }
  }

  // Look up building at this tile (may be any tile in a multi-tile footprint)
  const building = bldIdx.get(x, y)

  if (building) {
    const def = BUILDING_DEFS[building.defId]
    if (def) {
      for (let dy = 0; dy < def.size.h; dy++) {
        for (let dx = 0; dx < def.size.w; dx++) {
          clearTile(map, (building.y + dy) * map.width + (building.x + dx))
        }
      }
    }
    map.buildings = map.buildings.filter((b) => b.id !== building.id)
  } else {
    clearTile(map, idx)
  }

  return { result: { ok: true }, cost: COSTS.bulldoze }
}
