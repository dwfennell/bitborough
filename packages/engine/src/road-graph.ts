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
