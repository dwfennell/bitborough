import { type GameMap, type Result, TileType, Infrastructure, ZoneType, FailReason, COSTS } from '@bitborough/core'
import type { BuildingIndex } from '../building-index.js'

export function placeTile(
  map: GameMap,
  x: number,
  y: number,
  infra: Infrastructure,
  funds: number,
  bldIdx: BuildingIndex,
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

  // Cannot place infrastructure on a building footprint
  if (bldIdx.has(x, y)) {
    return { result: { ok: false, reason: FailReason.Occupied }, cost: 0 }
  }

  const cost = infraCost(infra)
  if (funds < cost) {
    return { result: { ok: false, reason: FailReason.InsufficientFunds }, cost: 0 }
  }

  map.infrastructure[idx]! |= infra

  // Infrastructure replaces zones — roads/power lines over zoned tiles clear the zone
  if (map.zones[idx] !== ZoneType.None) {
    map.zones[idx] = ZoneType.None
  }

  return { result: { ok: true }, cost }
}

export function placeZone(map: GameMap, x: number, y: number, zone: ZoneType, bldIdx: BuildingIndex): Result {
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

  // Cannot zone on infrastructure or building footprints
  if (map.infrastructure[idx] !== 0) {
    return { ok: false, reason: FailReason.Occupied }
  }
  if (bldIdx.has(x, y)) {
    return { ok: false, reason: FailReason.Occupied }
  }

  map.zones[idx] = zone
  return { ok: true }
}

function inBounds(map: GameMap, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < map.width && y < map.height
}

function infraCost(infra: Infrastructure): number {
  switch (infra) {
    case Infrastructure.Road:
      return COSTS.road
    case Infrastructure.PowerLine:
      return COSTS.powerLine
    case Infrastructure.Rail:
      return COSTS.rail
    default:
      return 0
  }
}
