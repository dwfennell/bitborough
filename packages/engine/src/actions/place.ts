import {
  type GameMap,
  type Result,
  TileType,
  Infrastructure,
  ZoneType,
  FailReason,
  COSTS,
} from '@bitborough/core'

export function placeTile(
  map: GameMap,
  x: number,
  y: number,
  infra: Infrastructure,
  funds: number,
): { result: Result; cost: number } {
  if (!inBounds(map, x, y)) {
    return { result: { ok: false, reason: FailReason.InvalidLocation }, cost: 0 }
  }

  const idx = y * map.width + x
  if (map.terrain[idx] === TileType.Water) {
    return { result: { ok: false, reason: FailReason.InvalidLocation }, cost: 0 }
  }

  // Already has this infrastructure — no-op, no charge
  if ((map.infrastructure[idx]! & infra) === infra) {
    return { result: { ok: true }, cost: 0 }
  }

  const cost = infraCost(infra)
  if (funds < cost) {
    return { result: { ok: false, reason: FailReason.InsufficientFunds }, cost: 0 }
  }

  map.infrastructure[idx]! |= infra
  return { result: { ok: true }, cost }
}

export function placeZone(
  map: GameMap,
  x: number,
  y: number,
  zone: ZoneType,
): Result {
  if (!inBounds(map, x, y)) {
    return { ok: false, reason: FailReason.InvalidLocation }
  }

  const idx = y * map.width + x
  if (map.terrain[idx] === TileType.Water) {
    return { ok: false, reason: FailReason.NotZonable }
  }

  // Already this zone — no-op
  if (map.zones[idx] === zone) {
    return { ok: true }
  }

  map.zones[idx] = zone
  return { ok: true }
}

function inBounds(map: GameMap, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < map.width && y < map.height
}

function infraCost(infra: Infrastructure): number {
  switch (infra) {
    case Infrastructure.Road: return COSTS.road
    case Infrastructure.PowerLine: return COSTS.powerLine
    case Infrastructure.Rail: return COSTS.rail
    default: return 0
  }
}
