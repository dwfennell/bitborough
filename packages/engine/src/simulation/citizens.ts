import { type GameMap, type Building, Infrastructure, BuildingCategory } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import type { RoadGraph } from '../road-graph.js'
import { astar } from '../road-graph.js'

// ── Types ────────────────────────────────────────────────────────────────────

export interface Citizen {
  id: string
  homeBuildingId: string
  workBuildingId: string | null
  commerceBuildingId: string | null
  homeAccessRoad: number
  workAccessRoad: number | null
  commerceAccessRoad: number | null
  homeWorkRoute: number[]
  homeCommerceRoute: number[]
  homeWorkRouteTileSet: Set<number>
  homeCommerceRouteTileSet: Set<number>
  homeWorkRouteStale: boolean
  homeCommerceRouteStale: boolean
  satisfaction: number
}

export interface CitizenRegistry {
  agents: Citizen[]
  samplingRatio: number
}

export interface CitizenSummary {
  agentCount: number
  avgSatisfaction: number
  unmatchedJobFraction: number
  unmatchedCommerceFraction: number
  avgCommuteLengthTiles: number
}

export const EMPTY_CITIZEN_SUMMARY: CitizenSummary = {
  agentCount: 0,
  avgSatisfaction: 1,
  unmatchedJobFraction: 0,
  unmatchedCommerceFraction: 0,
  avgCommuteLengthTiles: 0,
}

export const DEFAULT_SAMPLING_RATIO = 50

// ── Access Road ──────────────────────────────────────────────────────────────

const FOOTPRINT_DX = [0, 1, 0, -1] as const
const FOOTPRINT_DY = [-1, 0, 1, 0] as const

/** Scan all footprint tiles N→E→S→W, row-major; return first adjacent road tile index, or -1. */
export function resolveAccessRoad(map: GameMap, building: Building): number {
  const def = BUILDING_DEFS[building.defId]
  const w = def?.size.w ?? 1
  const h = def?.size.h ?? 1
  const { width, height } = map

  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const fx = building.x + dx
      const fy = building.y + dy
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

// ── Registry ─────────────────────────────────────────────────────────────────

export function createRegistry(samplingRatio = DEFAULT_SAMPLING_RATIO): CitizenRegistry {
  return { agents: [], samplingRatio }
}

// ── Assign ───────────────────────────────────────────────────────────────────

function findNearestJobBuilding(map: GameMap, graph: RoadGraph, fromRoad: number): { buildingId: string; accessRoad: number; route: number[] } | null {
  let best: { buildingId: string; accessRoad: number; route: number[] } | null = null
  for (const building of map.buildings) {
    if (building.state !== 'active') continue
    const def = BUILDING_DEFS[building.defId]
    if (!def || def.jobs <= 0) continue
    const access = resolveAccessRoad(map, building)
    if (access < 0) continue
    const route = astar(graph, fromRoad, access, map.width)
    if (!route) continue
    if (!best || route.length < best.route.length) {
      best = { buildingId: building.id, accessRoad: access, route }
    }
  }
  return best
}

function findNearestCommerceBuilding(map: GameMap, graph: RoadGraph, fromRoad: number): { buildingId: string; accessRoad: number; route: number[] } | null {
  let best: { buildingId: string; accessRoad: number; route: number[] } | null = null
  for (const building of map.buildings) {
    if (building.state !== 'active') continue
    const def = BUILDING_DEFS[building.defId]
    if (!def || def.category !== BuildingCategory.Commercial) continue
    const access = resolveAccessRoad(map, building)
    if (access < 0) continue
    const route = astar(graph, fromRoad, access, map.width)
    if (!route) continue
    if (!best || route.length < best.route.length) {
      best = { buildingId: building.id, accessRoad: access, route }
    }
  }
  return best
}

function buildTileSets(agent: Citizen): void {
  agent.homeWorkRouteTileSet = new Set(agent.homeWorkRoute)
  agent.homeCommerceRouteTileSet = new Set(agent.homeCommerceRoute)
}

let nextAgentId = 1

function createAgent(map: GameMap, graph: RoadGraph, homeBuildingId: string, homeAccessRoad: number): Citizen {
  const id = `c${nextAgentId++}`
  const jobMatch = findNearestJobBuilding(map, graph, homeAccessRoad)
  const commerceMatch = findNearestCommerceBuilding(map, graph, homeAccessRoad)
  const agent: Citizen = {
    id,
    homeBuildingId,
    workBuildingId: jobMatch?.buildingId ?? null,
    commerceBuildingId: commerceMatch?.buildingId ?? null,
    homeAccessRoad,
    workAccessRoad: jobMatch?.accessRoad ?? null,
    commerceAccessRoad: commerceMatch?.accessRoad ?? null,
    homeWorkRoute: jobMatch?.route ?? [],
    homeCommerceRoute: commerceMatch?.route ?? [],
    homeWorkRouteTileSet: new Set(),
    homeCommerceRouteTileSet: new Set(),
    homeWorkRouteStale: false,
    homeCommerceRouteStale: false,
    satisfaction: 1,
  }
  buildTileSets(agent)
  return agent
}

export function syncAgentsForBuilding(map: GameMap, registry: CitizenRegistry, graph: RoadGraph, building: Building): void {
  const homeAccessRoad = resolveAccessRoad(map, building)
  if (homeAccessRoad < 0) return  // building has no road access — no agents

  const existing = registry.agents.filter(a => a.homeBuildingId === building.id)
  const needed = Math.floor(building.residents / registry.samplingRatio)
  const delta = needed - existing.length

  if (delta > 0) {
    for (let i = 0; i < delta; i++) {
      registry.agents.push(createAgent(map, graph, building.id, homeAccessRoad))
    }
  } else if (delta < 0) {
    // Remove from end
    const toRemove = existing.slice(delta).map(a => a.id)
    const removeSet = new Set(toRemove)
    registry.agents = registry.agents.filter(a => !removeSet.has(a.id))
  }
}

export function removeAgentsForBuilding(registry: CitizenRegistry, buildingId: string): void {
  registry.agents = registry.agents.filter(a => a.homeBuildingId !== buildingId)
}

export function markRoutesStale(registry: CitizenRegistry, tileIndex: number): void {
  for (const agent of registry.agents) {
    if (agent.homeWorkRouteTileSet.has(tileIndex)) agent.homeWorkRouteStale = true
    if (agent.homeCommerceRouteTileSet.has(tileIndex)) agent.homeCommerceRouteStale = true
  }
}

export function replanStaleRoutes(registry: CitizenRegistry, map: GameMap, graph: RoadGraph): void {
  for (const agent of registry.agents) {
    if (agent.homeWorkRouteStale) {
      if (agent.workAccessRoad !== null) {
        const route = astar(graph, agent.homeAccessRoad, agent.workAccessRoad, map.width)
        agent.homeWorkRoute = route ?? []
        if (!route) { agent.workBuildingId = null; agent.workAccessRoad = null }
      } else {
        agent.homeWorkRoute = []
      }
      agent.homeWorkRouteTileSet = new Set(agent.homeWorkRoute)
      agent.homeWorkRouteStale = false
    }
    if (agent.homeCommerceRouteStale) {
      if (agent.commerceAccessRoad !== null) {
        const route = astar(graph, agent.homeAccessRoad, agent.commerceAccessRoad, map.width)
        agent.homeCommerceRoute = route ?? []
        if (!route) { agent.commerceBuildingId = null; agent.commerceAccessRoad = null }
      } else {
        agent.homeCommerceRoute = []
      }
      agent.homeCommerceRouteTileSet = new Set(agent.homeCommerceRoute)
      agent.homeCommerceRouteStale = false
    }
  }
}

