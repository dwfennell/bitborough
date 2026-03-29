import type { GameMap } from '@bitborough/core'
import type { RoadGraph } from '../../road-graph.js'
import { astar } from '../../road-graph.js'
import { resolveAccessRoad } from '../citizens.js'

// Student enrollment capacity (separate from BuildingDef.capacity which tracks residents)
export const SCHOOL_CAPACITY: Record<string, number> = {
  'service.school': 300,
  'service.school.small': 50,
}

export const SCHOOL_OVER_CAPACITY_RATIO = 1.2

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
    const access = resolveAccessRoad(map, building)
    if (access < 0) continue
    const route = astar(graph, fromRoad, access, map.width, undefined, trafficDensity)
    if (!route) continue
    if (!best || route.length < best.route.length) {
      best = { buildingId: building.id, accessRoad: access, route }
    }
  }
  return best
}

export function computeSchoolQuality(enrolledChildren: number, capacity: number, fundingLevel: number): number {
  if (capacity === 0) return 0
  const ratio = enrolledChildren / capacity
  const occupancyFactor = ratio <= 1.0 ? 1.0 : Math.max(0, 1.0 - (ratio - 1.0) * 2.5)
  return (fundingLevel / 100) * occupancyFactor
}
