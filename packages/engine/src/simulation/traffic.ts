import { type GameMap, ZoneType, Infrastructure } from '@bitborough/core'

const MAX_TRIP_DISTANCE = 30
const TRAFFIC_PER_TRIP = 50

export function calculateTraffic(
  map: GameMap,
  trafficDensity: Uint8Array,
): void {
  const { width, height } = map
  const size = width * height

  // Reset traffic
  trafficDensity.fill(0)

  // Find all zoned tiles with adjacent roads
  const residentialTiles: number[] = []
  const commercialTiles: number[] = []
  const industrialTiles: number[] = []

  for (let i = 0; i < size; i++) {
    const zone = map.zones[i]
    if (zone === ZoneType.Residential) residentialTiles.push(i)
    else if (zone === ZoneType.Commercial) commercialTiles.push(i)
    else if (zone === ZoneType.Industrial) industrialTiles.push(i)
  }

  // No trips if there's nothing to commute to
  if (residentialTiles.length === 0) return
  if (commercialTiles.length === 0 && industrialTiles.length === 0) return

  // Precompute target road tiles for commercial and industrial zones
  const commercialRoads = findTargetRoads(map, commercialTiles, width)
  const industrialRoads = findTargetRoads(map, industrialTiles, width)

  if (commercialRoads.size === 0 && industrialRoads.size === 0) return

  for (const rIdx of residentialTiles) {
    const rx = rIdx % width
    const ry = Math.floor(rIdx / width)

    // Find adjacent road tile to start trip
    const startRoad = findAdjacentRoad(map, rx, ry)
    if (startRoad < 0) continue

    // Trip to commercial
    if (commercialRoads.size > 0) {
      const path = findPathDFS(map, startRoad, commercialRoads, width, height)
      if (path) {
        for (const tileIdx of path) {
          const current = trafficDensity[tileIdx]!
          trafficDensity[tileIdx] = Math.min(255, current + TRAFFIC_PER_TRIP)
        }
      }
    }

    // Trip to industrial
    if (industrialRoads.size > 0) {
      const path = findPathDFS(map, startRoad, industrialRoads, width, height)
      if (path) {
        for (const tileIdx of path) {
          const current = trafficDensity[tileIdx]!
          trafficDensity[tileIdx] = Math.min(255, current + TRAFFIC_PER_TRIP)
        }
      }
    }
  }
}

function findTargetRoads(map: GameMap, zoneTiles: number[], width: number): Set<number> {
  const roads = new Set<number>()
  for (const tIdx of zoneTiles) {
    const tx = tIdx % width
    const ty = Math.floor(tIdx / width)
    const adj = findAdjacentRoad(map, tx, ty)
    if (adj >= 0) roads.add(adj)
  }
  return roads
}

function findAdjacentRoad(map: GameMap, x: number, y: number): number {
  const { width, height } = map
  const neighbors = [
    y > 0 ? (y - 1) * width + x : -1,
    x < width - 1 ? y * width + (x + 1) : -1,
    y < height - 1 ? (y + 1) * width + x : -1,
    x > 0 ? y * width + (x - 1) : -1,
  ]
  for (const idx of neighbors) {
    if (idx >= 0 && (map.infrastructure[idx]! & Infrastructure.Road)) {
      return idx
    }
  }
  return -1
}

function findPathDFS(
  map: GameMap,
  startRoad: number,
  targetSet: Set<number>,
  width: number,
  height: number,
): number[] | null {
  if (targetSet.has(startRoad)) return [startRoad]

  const visited = new Set<number>()
  const path: number[] = []

  function dfs(idx: number, depth: number): boolean {
    if (depth > MAX_TRIP_DISTANCE) return false
    if (visited.has(idx)) return false
    visited.add(idx)
    path.push(idx)

    if (targetSet.has(idx)) return true

    const x = idx % width
    const y = Math.floor(idx / width)
    const neighbors = [
      y > 0 ? (y - 1) * width + x : -1,
      x < width - 1 ? y * width + (x + 1) : -1,
      y < height - 1 ? (y + 1) * width + x : -1,
      x > 0 ? y * width + (x - 1) : -1,
    ]

    for (const nIdx of neighbors) {
      if (nIdx < 0) continue
      if (!(map.infrastructure[nIdx]! & Infrastructure.Road)) continue
      if (dfs(nIdx, depth + 1)) return true
    }

    path.pop()
    return false
  }

  if (dfs(startRoad, 0)) return [...path]
  return null
}
