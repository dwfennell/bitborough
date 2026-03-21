import { type GameMap, Infrastructure } from '@bitborough/core'

export type RoadGraph = Map<number, number[]>

const DX = [0, 1, 0, -1] as const
const DY = [-1, 0, 1, 0] as const

function isRoad(infra: number): boolean {
  return (infra & Infrastructure.Road) !== 0
}

export function buildRoadGraph(map: GameMap): RoadGraph {
  const graph: RoadGraph = new Map()
  const { width, height } = map

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (!isRoad(map.infrastructure[idx]!)) continue
      const neighbors: number[] = []
      for (let dir = 0; dir < 4; dir++) {
        const nx = x + DX[dir]!
        const ny = y + DY[dir]!
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
        const nIdx = ny * width + nx
        if (isRoad(map.infrastructure[nIdx]!)) neighbors.push(nIdx)
      }
      graph.set(idx, neighbors)
    }
  }
  return graph
}

export const MAX_ROUTE_LENGTH = 60

export const TRAFFIC_CAPACITY = 100

function edgeCost(tile: number, trafficDensity?: Uint8Array): number {
  if (!trafficDensity) return 1
  const v = trafficDensity[tile]!
  const vc = v / TRAFFIC_CAPACITY
  return 1 + 0.15 * vc * vc * vc * vc  // BPR: 1 + 0.15 * (v/c)^4
}

/** A* on road graph. Returns path (inclusive of start and goal) or null if unreachable. */
export function astar(
  graph: RoadGraph,
  start: number,
  goal: number,
  mapWidth: number,
  maxLength = MAX_ROUTE_LENGTH,
  trafficDensity?: Uint8Array,
): number[] | null {
  if (!graph.has(start) || !graph.has(goal)) return null
  if (start === goal) return [start]

  const gScore = new Map<number, number>([[start, 0]])
  const fScore = new Map<number, number>([[start, heuristic(start, goal, mapWidth)]])
  const cameFrom = new Map<number, number>()
  // Min-heap via sorted insertion would be ideal; for simplicity use a Set + linear min scan
  // (acceptable: road graph ≤ 5,000 nodes, called infrequently)
  const open = new Set<number>([start])

  while (open.size > 0) {
    // Find node in open with lowest fScore
    let current = -1
    let bestF = Infinity
    for (const n of open) {
      const f = fScore.get(n) ?? Infinity
      if (f < bestF) { bestF = f; current = n }
    }
    if (current === goal) return reconstructPath(cameFrom, current)

    open.delete(current)
    const g = gScore.get(current) ?? Infinity

    for (const neighbor of (graph.get(current) ?? [])) {
      const tentativeG = g + edgeCost(neighbor, trafficDensity)
      if (tentativeG > maxLength) continue  // path would exceed limit
      if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current)
        gScore.set(neighbor, tentativeG)
        fScore.set(neighbor, tentativeG + heuristic(neighbor, goal, mapWidth))
        open.add(neighbor)
      }
    }
  }
  return null
}

function heuristic(a: number, b: number, width: number): number {
  return Math.abs((a % width) - (b % width)) + Math.abs(Math.floor(a / width) - Math.floor(b / width))
}

function reconstructPath(cameFrom: Map<number, number>, current: number): number[] {
  const path = [current]
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!
    path.push(current)
  }
  return path.reverse()
}

export function updateRoadGraph(map: GameMap, graph: RoadGraph, x: number, y: number): void {
  const { width, height } = map
  const idx = y * width + x

  if (isRoad(map.infrastructure[idx]!)) {
    // Tile is now a road — add it and connect to existing road neighbors
    const neighbors: number[] = []
    for (let dir = 0; dir < 4; dir++) {
      const nx = x + DX[dir]!
      const ny = y + DY[dir]!
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
      const nIdx = ny * width + nx
      if (!isRoad(map.infrastructure[nIdx]!)) continue
      neighbors.push(nIdx)
      // Add reverse link
      const existing = graph.get(nIdx)
      if (existing && !existing.includes(idx)) existing.push(idx)
    }
    graph.set(idx, neighbors)
  } else {
    // Tile is no longer a road — remove it and all links to it
    graph.delete(idx)
    for (let dir = 0; dir < 4; dir++) {
      const nx = x + DX[dir]!
      const ny = y + DY[dir]!
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
      const nIdx = ny * width + nx
      const neighbors = graph.get(nIdx)
      if (neighbors) {
        const i = neighbors.indexOf(idx)
        if (i !== -1) neighbors.splice(i, 1)
      }
    }
  }
}
