import { type GameMap, type Result, TileType, FailReason, COSTS } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import type { BuildingIndex } from '../building-index.js'

export function bulldoze(map: GameMap, x: number, y: number, funds: number, bldIdx: BuildingIndex): { result: Result; cost: number } {
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
      // Clear all footprint tiles
      for (let dy = 0; dy < def.size.h; dy++) {
        for (let dx = 0; dx < def.size.w; dx++) {
          const ti = (building.y + dy) * map.width + (building.x + dx)
          map.infrastructure[ti] = 0
          map.connections[ti] = 0
          map.zones[ti] = 0
          if (map.terrain[ti] !== TileType.Grass && map.terrain[ti] !== TileType.Sand) {
            map.terrain[ti] = TileType.Grass
          }
        }
      }
    }
    // Remove building by id
    map.buildings = map.buildings.filter((b) => b.id !== building.id)
  } else {
    // No building — just clear the single tile
    map.infrastructure[idx] = 0
    map.connections[idx] = 0
    map.zones[idx] = 0
    if (map.terrain[idx] !== TileType.Grass && map.terrain[idx] !== TileType.Sand) {
      map.terrain[idx] = TileType.Grass
    }
  }

  return { result: { ok: true }, cost: COSTS.bulldoze }
}
