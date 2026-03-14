import { type GameMap, TileType, Infrastructure } from '@bitborough/core'

export function calculateLandValues(
  map: GameMap,
  powerGrid: Uint8Array,
  pollutionLevel: Uint8Array,
  crimeLevel: Uint8Array,
  landValues: Uint8Array,
): void {
  const { width, height } = map

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x

      if (map.terrain[idx] === TileType.Water) {
        landValues[idx] = 0
        continue
      }

      // Base land value for all non-water tiles
      let value = 10

      // Terrain bonus: water adjacency
      value += waterAdjacencyBonus(map, x, y) // +15 per adjacent water tile

      // Park bonus: nearby parks boost land value
      value += parkBonus(map, x, y) // +10, decaying with distance

      // Road access bonus
      if (hasNearbyRoad(map, x, y, 3)) {
        value += 10
      }

      // Pollution penalty (negative)
      value -= pollutionLevel[idx]! * 0.5

      // Crime penalty (negative)
      value -= crimeLevel[idx]! * 0.1

      // Clamp to [0, 255]
      landValues[idx] = Math.max(0, Math.min(255, Math.round(value)))
    }
  }
}

function waterAdjacencyBonus(map: GameMap, x: number, y: number): number {
  let bonus = 0
  const dirs: [number, number][] = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ]
  for (const [dx, dy] of dirs) {
    const nx = x + dx
    const ny = y + dy
    if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue
    if (map.terrain[ny * map.width + nx] === TileType.Water) {
      bonus += 15
    }
  }
  return bonus
}

function parkBonus(map: GameMap, x: number, y: number): number {
  let bonus = 0
  const radius = 4
  for (const building of map.buildings) {
    if (building.defId !== 'special.park') continue
    const dist = Math.abs(building.x - x) + Math.abs(building.y - y) // Manhattan distance
    if (dist <= radius) {
      bonus += Math.max(0, 10 - dist * 2) // 10 at distance 0, decaying by 2 per tile
    }
  }
  return bonus
}

function hasNearbyRoad(map: GameMap, x: number, y: number, radius: number): boolean {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue
      if (map.infrastructure[ny * map.width + nx]! & Infrastructure.Road) return true
    }
  }
  return false
}
