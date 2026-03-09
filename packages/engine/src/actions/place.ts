import {
  type GameMap,
  type Result,
  TileType,
  Infrastructure,
  ZoneType,
  FailReason,
  COSTS,
} from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

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

  // Cannot place infrastructure on a building footprint
  if (hasBuildingAt(map, x, y)) {
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

  // Cannot zone on infrastructure or building footprints
  if (map.infrastructure[idx] !== 0) {
    return { ok: false, reason: FailReason.Occupied }
  }
  if (hasBuildingAt(map, x, y)) {
    return { ok: false, reason: FailReason.Occupied }
  }

  map.zones[idx] = zone
  return { ok: true }
}

function inBounds(map: GameMap, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < map.width && y < map.height
}

function hasBuildingAt(map: GameMap, x: number, y: number): boolean {
  for (const b of map.buildings) {
    const def = BUILDING_DEFS[b.defId]
    if (!def) continue
    if (x >= b.x && x < b.x + def.size.w && y >= b.y && y < b.y + def.size.h) {
      return true
    }
  }
  return false
}

function infraCost(infra: Infrastructure): number {
  switch (infra) {
    case Infrastructure.Road: return COSTS.road
    case Infrastructure.PowerLine: return COSTS.powerLine
    case Infrastructure.Rail: return COSTS.rail
    default: return 0
  }
}
