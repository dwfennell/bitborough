import {
  type GameMap,
  type Building,
  type BuildingDef,
  type WealthTier,
  BuildingCategory,
} from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import type { RoadGraph } from '../road-graph.js'
import { astar } from '../road-graph.js'
import { sampleWealthTier } from './wealth-tiers.js'
import type { PRNG } from '../prng.js'
import type { Citizen, CitizenRegistry } from './citizens.js'
import { resolveAccessRoad, DEFAULT_SAMPLING_RATIO } from './citizens.js'

// ── Agent ID ────────────────────────────────────────────────────────────────

let nextAgentId = 1

export function setNextAgentId(id: number): void {
  nextAgentId = id
}

/** @internal — exposed for testing only */
export function getNextAgentId(): number {
  return nextAgentId
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export function findNearestBuilding(
  map: GameMap,
  graph: RoadGraph,
  fromRoad: number,
  filter: (def: BuildingDef) => boolean,
  trafficDensity?: Uint8Array,
): { buildingId: string; accessRoad: number; route: number[] } | null {
  let best: { buildingId: string; accessRoad: number; route: number[] } | null = null
  for (const building of map.buildings) {
    if (building.state !== 'active') continue
    const def = BUILDING_DEFS[building.defId]
    if (!def || !filter(def)) continue
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

function buildTileSets(agent: Citizen): void {
  agent.homeWorkRouteTileSet = new Set(agent.homeWorkRoute)
  agent.homeCommerceRouteTileSet = new Set(agent.homeCommerceRoute)
  agent.homeSchoolRouteTileSet = new Set(agent.homeSchoolRoute)
}

type RouteMatch = { buildingId: string; accessRoad: number; route: number[] } | null

function createAgent(
  homeBuildingId: string,
  homeAccessRoad: number,
  jobMatch: RouteMatch,
  commerceMatch: RouteMatch,
  wealthTier: WealthTier,
  representedResidents: number = DEFAULT_SAMPLING_RATIO,
): Citizen {
  const id = `c${nextAgentId++}`
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
    schoolBuildingId: null,
    schoolAccessRoad: null,
    homeSchoolRoute: [],
    homeSchoolRouteTileSet: new Set(),
    homeSchoolRouteStale: false,
    satisfaction: 1,
    demographics: { children: 0, working: representedResidents, elderly: 0 },
    wealthTier,
  }
  buildTileSets(agent)
  return agent
}

export function enrollAgentInSchool(
  agent: Citizen,
  schoolMatch: { buildingId: string; accessRoad: number; route: number[] },
  enrollmentCounts: Map<string, number>,
): void {
  agent.schoolBuildingId = schoolMatch.buildingId
  agent.schoolAccessRoad = schoolMatch.accessRoad
  agent.homeSchoolRoute = schoolMatch.route
  agent.homeSchoolRouteTileSet = new Set(schoolMatch.route)
  enrollmentCounts.set(
    schoolMatch.buildingId,
    (enrollmentCounts.get(schoolMatch.buildingId) ?? 0) + agent.demographics.children,
  )
}

// ── Agent ↔ Building sync ───────────────────────────────────────────────────

export function buildAgentsByBuilding(agents: ReadonlyArray<Citizen>): Map<string, Citizen[]> {
  const map = new Map<string, Citizen[]>()
  for (const a of agents) {
    let list = map.get(a.homeBuildingId)
    if (!list) {
      list = []
      map.set(a.homeBuildingId, list)
    }
    list.push(a)
  }
  return map
}

export interface SyncAgentOptions {
  trafficDensity?: Uint8Array
  prng?: PRNG
  reputationLayer?: Float32Array
  enrollmentCounts?: Map<string, number>
  agentIndex?: Map<string, Citizen[]>
  tierDistOverride?: readonly [number, number, number]
}

export function syncAgentsForBuilding(
  map: GameMap,
  registry: CitizenRegistry,
  graph: RoadGraph,
  building: Building,
  opts: SyncAgentOptions = {},
): void {
  const { trafficDensity, prng, reputationLayer, agentIndex, tierDistOverride } = opts
  const homeAccessRoad = resolveAccessRoad(map, building)
  if (homeAccessRoad < 0) return // building has no road access — no agents

  const existing = agentIndex
    ? (agentIndex.get(building.id) ?? [])
    : registry.agents.filter((a) => a.homeBuildingId === building.id)
  const needed = building.residents > 0 ? Math.max(1, Math.floor(building.residents / registry.samplingRatio)) : 0
  const delta = needed - existing.length

  if (delta > 0) {
    // Compute route matches once — all agents from this building share the same access road
    const jobMatch = findNearestBuilding(map, graph, homeAccessRoad, (d) => d.jobs > 0, trafficDensity)
    const commerceMatch = findNearestBuilding(
      map,
      graph,
      homeAccessRoad,
      (d) => d.category === BuildingCategory.Commercial,
      trafficDensity,
    )
    const homeTileIdx = building.y * map.width + building.x
    const residentsPerAgent =
      needed === 1 && building.residents < registry.samplingRatio ? building.residents : registry.samplingRatio
    for (let i = 0; i < delta; i++) {
      let wealthTier: WealthTier = 2
      if (prng) {
        const reputation = reputationLayer ? (reputationLayer[homeTileIdx] ?? 0.5) : 0.5
        wealthTier = sampleWealthTier(prng, reputation, tierDistOverride)
      }
      registry.agents.push(
        createAgent(building.id, homeAccessRoad, jobMatch, commerceMatch, wealthTier, residentsPerAgent),
      )
    }
  } else if (delta < 0) {
    // Remove from end
    const toRemove = existing.slice(delta).map((a) => a.id)
    const removeSet = new Set(toRemove)
    registry.agents = registry.agents.filter((a) => !removeSet.has(a.id))
  }
}

export function removeAgentsForBuilding(registry: CitizenRegistry, buildingId: string): void {
  registry.agents = registry.agents.filter((a) => a.homeBuildingId !== buildingId)
}

export function clearSchoolEnrollment(registry: CitizenRegistry, schoolBuildingId: string): void {
  for (const agent of registry.agents) {
    if (agent.schoolBuildingId === schoolBuildingId) {
      agent.schoolBuildingId = null
      agent.schoolAccessRoad = null
      agent.homeSchoolRoute = []
      agent.homeSchoolRouteTileSet = new Set()
      agent.homeSchoolRouteStale = false
    }
  }
}

export function removeOrphanedAgents(registry: CitizenRegistry, validBuildingIds: Set<string>): void {
  registry.agents = registry.agents.filter((a) => validBuildingIds.has(a.homeBuildingId))
}

// ── Route staleness ─────────────────────────────────────────────────────────

export function markRoutesStale(registry: CitizenRegistry, tileIndex: number): void {
  for (const agent of registry.agents) {
    if (agent.homeWorkRouteTileSet.has(tileIndex)) agent.homeWorkRouteStale = true
    if (agent.homeCommerceRouteTileSet.has(tileIndex)) agent.homeCommerceRouteStale = true
    if (agent.homeSchoolRouteTileSet.has(tileIndex)) agent.homeSchoolRouteStale = true
  }
}

export function markRoutesStaleBatch(registry: CitizenRegistry, tileIndices: Set<number>): void {
  for (const agent of registry.agents) {
    if (agent.homeWorkRouteStale && agent.homeCommerceRouteStale && agent.homeSchoolRouteStale) continue
    for (const idx of tileIndices) {
      if (!agent.homeWorkRouteStale && agent.homeWorkRouteTileSet.has(idx)) agent.homeWorkRouteStale = true
      if (!agent.homeCommerceRouteStale && agent.homeCommerceRouteTileSet.has(idx)) agent.homeCommerceRouteStale = true
      if (!agent.homeSchoolRouteStale && agent.homeSchoolRouteTileSet.has(idx)) agent.homeSchoolRouteStale = true
      if (agent.homeWorkRouteStale && agent.homeCommerceRouteStale && agent.homeSchoolRouteStale) break
    }
  }
}

function replanRoute(
  agent: Citizen,
  map: GameMap,
  graph: RoadGraph,
  currentAccessRoad: number | null,
  filter: (def: BuildingDef) => boolean,
  trafficDensity?: Uint8Array,
): { buildingId: string | null; accessRoad: number | null; route: number[] } {
  if (currentAccessRoad !== null) {
    const route = astar(graph, agent.homeAccessRoad, currentAccessRoad, map.width, undefined, trafficDensity)
    if (route) return { buildingId: null, accessRoad: currentAccessRoad, route }
  }
  const match = findNearestBuilding(map, graph, agent.homeAccessRoad, filter, trafficDensity)
  if (match) return { buildingId: match.buildingId, accessRoad: match.accessRoad, route: match.route }
  return { buildingId: null, accessRoad: null, route: [] }
}

export function replanStaleRoutes(
  registry: CitizenRegistry,
  map: GameMap,
  graph: RoadGraph,
  trafficDensity?: Uint8Array,
): void {
  for (const agent of registry.agents) {
    if (agent.homeWorkRouteStale) {
      const result = replanRoute(agent, map, graph, agent.workAccessRoad, (d) => d.jobs > 0, trafficDensity)
      if (result.buildingId !== null) agent.workBuildingId = result.buildingId
      agent.workAccessRoad = result.accessRoad
      agent.homeWorkRoute = result.route
      if (result.accessRoad === null) agent.workBuildingId = null
      agent.homeWorkRouteTileSet = new Set(agent.homeWorkRoute)
      agent.homeWorkRouteStale = false
    }
    if (agent.homeCommerceRouteStale) {
      const result = replanRoute(
        agent,
        map,
        graph,
        agent.commerceAccessRoad,
        (d) => d.category === BuildingCategory.Commercial,
        trafficDensity,
      )
      if (result.buildingId !== null) agent.commerceBuildingId = result.buildingId
      agent.commerceAccessRoad = result.accessRoad
      agent.homeCommerceRoute = result.route
      if (result.accessRoad === null) agent.commerceBuildingId = null
      agent.homeCommerceRouteTileSet = new Set(agent.homeCommerceRoute)
      agent.homeCommerceRouteStale = false
    }
    if (agent.homeSchoolRouteStale) {
      if (agent.demographics.children > 0 && agent.schoolAccessRoad !== null) {
        const route = astar(graph, agent.homeAccessRoad, agent.schoolAccessRoad, map.width, undefined, trafficDensity)
        if (route) {
          agent.homeSchoolRoute = route
          agent.homeSchoolRouteTileSet = new Set(route)
          agent.homeSchoolRouteStale = false
        } else {
          // Direct route failed — clear enrollment, will re-enroll at next sync
          agent.schoolBuildingId = null
          agent.schoolAccessRoad = null
          agent.homeSchoolRoute = []
          agent.homeSchoolRouteTileSet = new Set()
          agent.homeSchoolRouteStale = false
        }
      } else {
        agent.homeSchoolRouteStale = false
      }
    }
  }
}
