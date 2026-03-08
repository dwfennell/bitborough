import {
  type GameMap,
  type Result,
  TileType,
  FailReason,
  COSTS,
} from '@bitborough/core'

export function bulldoze(
  map: GameMap,
  x: number,
  y: number,
  funds: number,
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

  // Clear infrastructure
  map.infrastructure[idx] = 0
  map.connections[idx] = 0

  // Clear zone
  map.zones[idx] = 0

  // Clear terrain features (trees, dirt -> grass)
  if (map.terrain[idx] !== TileType.Grass && map.terrain[idx] !== TileType.Sand) {
    map.terrain[idx] = TileType.Grass
  }

  // Remove buildings at this tile
  map.buildings = map.buildings.filter(b => {
    return !(b.x === x && b.y === y)
  })

  return { result: { ok: true }, cost: COSTS.bulldoze }
}
