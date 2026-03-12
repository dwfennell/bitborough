import { Infrastructure } from '@bitborough/core'
import type { GameMap } from '@bitborough/core'

export function hasNearbyInfra(
  map: GameMap,
  x: number,
  y: number,
  flag: Infrastructure,
  range = 3,
): boolean {
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > range) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue
      if (map.infrastructure[ny * map.width + nx]! & flag) return true
    }
  }
  return false
}

// Keep backward-compatible wrappers used by existing callers:
export function hasNearbyRoad(map: GameMap, x: number, y: number, range = 3): boolean {
  return hasNearbyInfra(map, x, y, Infrastructure.Road, range)
}

export function hasNearbyPavedRoad(map: GameMap, x: number, y: number, range = 3): boolean {
  return hasNearbyInfra(map, x, y, Infrastructure.PavedRoad, range)
}
