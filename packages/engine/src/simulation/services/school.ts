import type { GameMap } from '@bitborough/core'
import { Infrastructure } from '@bitborough/core'
import { BUILDING_DEFS } from '../../buildings-registry.js'
import type { RoadGraph } from '../../road-graph.js'
import { astar } from '../../road-graph.js'

export const SCHOOL_CAPACITY: Record<string, number> = {
  'service.school': 300,
  'service.school.small': 50,
}

export const SCHOOL_OVER_CAPACITY_RATIO = 1.2

const FOOTPRINT_DX = [0, 1, 0, -1] as const
const FOOTPRINT_DY = [-1, 0, 1, 0] as const

function resolveSchoolAccessRoad(map: GameMap, x: number, y: number, w: number, h: number): number {
  const { width, height } = map
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const fx = x + dx
      const fy = y + dy
      for (let dir = 0; dir < 4; dir++) {
        const nx = fx + FOOTPRINT_DX[dir]!
        const ny = fy + FOOTPRINT_DY[dir]!
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
        const nIdx = ny * width + nx
        if (map.infrastructure[nIdx]! & Infrastructure.Road) return nIdx
      }
    }
  }
  return -1
}

export function buildEnrollmentCounts(
  agents: ReadonlyArray<{ schoolBuildingId: string | null; demographics: { children: number } }>,
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const agent of agents) {
    if (agent.schoolBuildingId === null) continue
    counts.set(agent.schoolBuildingId, (counts.get(agent.schoolBuildingId) ?? 0) + agent.demographics.children)
  }
  return counts
}

export function findNearestSchool(
  map: GameMap,
  graph: RoadGraph,
  fromRoad: number,
  enrollmentCounts: Map<string, number>,
  trafficDensity?: Uint8Array,
): { buildingId: string; accessRoad: number; route: number[] } | null {
  let best: { buildingId: string; accessRoad: number; route: number[] } | null = null
  for (const building of map.buildings) {
    if (building.state !== 'active') continue
    const capacity = SCHOOL_CAPACITY[building.defId]
    if (capacity === undefined) continue
    const enrolled = enrollmentCounts.get(building.id) ?? 0
    if (enrolled >= capacity * SCHOOL_OVER_CAPACITY_RATIO) continue
    const def = BUILDING_DEFS[building.defId]
    if (!def) continue
    const w = def.size.w
    const h = def.size.h
    const access = resolveSchoolAccessRoad(map, building.x, building.y, w, h)
    if (access < 0) continue
    const route = astar(graph, fromRoad, access, map.width, undefined, trafficDensity)
    if (!route) continue
    if (!best || route.length < best.route.length) {
      best = { buildingId: building.id, accessRoad: access, route }
    }
  }
  return best
}

export function computeSchoolQuality(
  enrolledChildren: number,
  capacity: number,
  fundingLevel: number,
): number {
  if (capacity === 0) return 0
  const ratio = enrolledChildren / capacity
  const occupancyFactor = ratio <= 1.0
    ? 1.0
    : Math.max(0, 1.0 - (ratio - 1.0) * 2.5)
  return (fundingLevel / 100) * occupancyFactor
}
