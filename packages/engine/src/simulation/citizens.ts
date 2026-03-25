import { type GameMap, type Building, type BuildingDef, type CitizenSummary, type WealthTier, Infrastructure, BuildingCategory } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import type { RoadGraph } from '../road-graph.js'
import { astar } from '../road-graph.js'
import { sampleWealthTier, TIER_WEIGHTS, buildTierCountsByBuilding, computeSchellingPenalty } from './wealth-tiers.js'
import { parkDesirabilityBonus, RES_PARK_BONUS } from './desirability.js'
import type { BuildingIndex } from '../building-index.js'
import type { PRNG } from '../prng.js'

// ── Types ────────────────────────────────────────────────────────────────────

export interface AgentDemographics {
  children: number    // ages 0-17
  working: number     // ages 18-64
  elderly: number     // ages 65+
}

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
  demographics: AgentDemographics
  wealthTier: WealthTier
}

export interface CitizenRegistry {
  agents: Citizen[]
  samplingRatio: number
}

export interface TileLayers {
  crimeLevel: Uint8Array
  fireCoverage: Uint8Array
  pollutionLevel: Uint8Array
  reputationLayer: Float32Array
}

export type { CitizenSummary }

export const EMPTY_CITIZEN_SUMMARY: CitizenSummary = {
  agentCount: 0,
  avgSatisfaction: 1,
  unmatchedJobFraction: 0,
  unmatchedCommerceFraction: 0,
  avgCommuteLengthTiles: 0,
  totalChildren: 0,
  totalWorking: 0,
  totalElderly: 0,
  birthsLastTick: 0,
  deathsLastTick: 0,
  netMigrationLastTick: 0,
  tierCounts: [0, 0, 0],
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

function findNearestBuilding(
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
}

let nextAgentId = 1

export function setNextAgentId(id: number): void {
  nextAgentId = id
}

/** @internal — exposed for testing only */
export function getNextAgentId(): number {
  return nextAgentId
}

function createAgent(map: GameMap, graph: RoadGraph, homeBuildingId: string, homeAccessRoad: number, trafficDensity?: Uint8Array, prng?: PRNG, reputationLayer?: Float32Array): Citizen {
  const id = `c${nextAgentId++}`
  let wealthTier: WealthTier = 2
  if (prng) {
    const building = map.buildings.find(b => b.id === homeBuildingId)
    const tileIdx = building ? building.y * map.width + building.x : 0
    const reputation = reputationLayer ? (reputationLayer[tileIdx] ?? 0.5) : 0.5
    wealthTier = sampleWealthTier(prng, reputation)
  }
  const jobMatch = findNearestBuilding(map, graph, homeAccessRoad, d => d.jobs > 0, trafficDensity)
  const commerceMatch = findNearestBuilding(map, graph, homeAccessRoad, d => d.category === BuildingCategory.Commercial, trafficDensity)
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
    demographics: { children: 0, working: 50, elderly: 0 },
    wealthTier,
  }
  buildTileSets(agent)
  return agent
}

export function syncAgentsForBuilding(map: GameMap, registry: CitizenRegistry, graph: RoadGraph, building: Building, trafficDensity?: Uint8Array, prng?: PRNG, reputationLayer?: Float32Array): void {
  const homeAccessRoad = resolveAccessRoad(map, building)
  if (homeAccessRoad < 0) return  // building has no road access — no agents

  const existing = registry.agents.filter(a => a.homeBuildingId === building.id)
  const needed = Math.floor(building.residents / registry.samplingRatio)
  const delta = needed - existing.length

  if (delta > 0) {
    for (let i = 0; i < delta; i++) {
      registry.agents.push(createAgent(map, graph, building.id, homeAccessRoad, trafficDensity, prng, reputationLayer))
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

export function removeOrphanedAgents(registry: CitizenRegistry, validBuildingIds: Set<string>): void {
  const orphanedIds = new Set<string>()
  for (const agent of registry.agents) {
    if (!validBuildingIds.has(agent.homeBuildingId)) {
      orphanedIds.add(agent.homeBuildingId)
    }
  }
  for (const id of orphanedIds) {
    removeAgentsForBuilding(registry, id)
  }
}

export function markRoutesStale(registry: CitizenRegistry, tileIndex: number): void {
  for (const agent of registry.agents) {
    if (agent.homeWorkRouteTileSet.has(tileIndex)) agent.homeWorkRouteStale = true
    if (agent.homeCommerceRouteTileSet.has(tileIndex)) agent.homeCommerceRouteStale = true
  }
}

export function markRoutesStaleBatch(registry: CitizenRegistry, tileIndices: Set<number>): void {
  for (const agent of registry.agents) {
    for (const idx of tileIndices) {
      if (agent.homeWorkRouteTileSet.has(idx)) { agent.homeWorkRouteStale = true; break }
    }
    for (const idx of tileIndices) {
      if (agent.homeCommerceRouteTileSet.has(idx)) { agent.homeCommerceRouteStale = true; break }
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

export function replanStaleRoutes(registry: CitizenRegistry, map: GameMap, graph: RoadGraph, trafficDensity?: Uint8Array): void {
  for (const agent of registry.agents) {
    if (agent.homeWorkRouteStale) {
      const result = replanRoute(agent, map, graph, agent.workAccessRoad, d => d.jobs > 0, trafficDensity)
      if (result.buildingId !== null) agent.workBuildingId = result.buildingId
      agent.workAccessRoad = result.accessRoad
      agent.homeWorkRoute = result.route
      if (result.accessRoad === null) agent.workBuildingId = null
      agent.homeWorkRouteTileSet = new Set(agent.homeWorkRoute)
      agent.homeWorkRouteStale = false
    }
    if (agent.homeCommerceRouteStale) {
      const result = replanRoute(agent, map, graph, agent.commerceAccessRoad, d => d.category === BuildingCategory.Commercial, trafficDensity)
      if (result.buildingId !== null) agent.commerceBuildingId = result.buildingId
      agent.commerceAccessRoad = result.accessRoad
      agent.homeCommerceRoute = result.route
      if (result.accessRoad === null) agent.commerceBuildingId = null
      agent.homeCommerceRouteTileSet = new Set(agent.homeCommerceRoute)
      agent.homeCommerceRouteStale = false
    }
  }
}

// ── Monthly tick ──────────────────────────────────────────────────────────────

const WORK_TRIP_WEIGHT = 2
const COMMERCE_TRIP_WEIGHT = 1
const MAX_SATISFACTION_COMMUTE = 60  // same as MAX_ROUTE_LENGTH

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function computeSatisfaction(
  agent: Citizen,
  map: GameMap,
  layers: TileLayers,
  bldIdx: BuildingIndex,
  buildingTierCounts: Map<string, [number, number, number]>,
  buildingById: Map<string, Building>,
): number {
  const w = TIER_WEIGHTS[agent.wealthTier]
  const commuteNorm = clamp(agent.homeWorkRoute.length / MAX_SATISFACTION_COMMUTE, 0, 1)
  const jobless = agent.workBuildingId === null ? 1 : 0
  const noCommerce = agent.commerceBuildingId === null ? 1 : 0

  const building = buildingById.get(agent.homeBuildingId)
  let crimeNorm = 0, pollNorm = 0, fireNorm = 0, parkNorm = 0
  if (building) {
    const idx = building.y * map.width + building.x
    crimeNorm = layers.crimeLevel[idx]! / 255
    pollNorm = layers.pollutionLevel[idx]! / 255
    fireNorm = layers.fireCoverage[idx]! / 255
    const rawPark = parkDesirabilityBonus(building.x, building.y, map, bldIdx)
    parkNorm = Math.min(1, rawPark / RES_PARK_BONUS)
  }

  const tierCounts = buildingTierCounts.get(agent.homeBuildingId) ?? [0, 0, 0]
  const schelling = computeSchellingPenalty(agent.wealthTier, tierCounts)

  return clamp(
    1.0
    - commuteNorm * 0.4 * w.commute
    - jobless * 0.5 * w.jobMatch
    - noCommerce * 0.3 * w.commerce
    - crimeNorm * 0.3 * w.crime
    - pollNorm * 0.3 * w.pollution
    + fireNorm * 0.15 * w.fire
    + parkNorm * 0.25 * w.park
    - schelling,
    0, 1,
  )
}

export function citizenMonthlyTick(
  registry: CitizenRegistry,
  map: GameMap,
  graph: RoadGraph,
  trafficDensity: Uint8Array,
  layers?: TileLayers,
  bldIdx?: BuildingIndex,
): void {
  // Pass 1: replan stale routes (traffic-aware)
  replanStaleRoutes(registry, map, graph, trafficDensity)

  // Pass 2: traffic contribution
  const size = map.width * map.height
  const rawTraffic = new Float64Array(size)

  const buildingTierCounts = buildTierCountsByBuilding(registry.agents)
  const buildingById = new Map<string, Building>()
  for (const b of map.buildings) buildingById.set(b.id, b)

  for (const agent of registry.agents) {
    for (const tileIdx of agent.homeWorkRoute) {
      rawTraffic[tileIdx]! += WORK_TRIP_WEIGHT
    }
    for (const tileIdx of agent.homeCommerceRoute) {
      rawTraffic[tileIdx]! += COMMERCE_TRIP_WEIGHT
    }
    if (layers && bldIdx) {
      agent.satisfaction = computeSatisfaction(agent, map, layers, bldIdx, buildingTierCounts, buildingById)
    } else {
      const commuteNorm = clamp(agent.homeWorkRoute.length / MAX_SATISFACTION_COMMUTE, 0, 1)
      const jobless = agent.workBuildingId === null ? 1 : 0
      const noCommerce = agent.commerceBuildingId === null ? 1 : 0
      agent.satisfaction = clamp(1 - commuteNorm * 0.4 - jobless * 0.5 - noCommerce * 0.3, 0, 1)
    }
  }

  // Scale by sampling ratio and write to trafficDensity
  trafficDensity.fill(0)
  for (let i = 0; i < size; i++) {
    trafficDensity[i] = Math.min(255, Math.floor(rawTraffic[i]! * registry.samplingRatio))
  }
}

export function computeCitizenSummary(registry: CitizenRegistry): CitizenSummary {
  const { agents } = registry
  if (agents.length === 0) return { ...EMPTY_CITIZEN_SUMMARY }

  let satSum = 0
  let unmatchedJob = 0
  let unmatchedCommerce = 0
  let commuteLengthSum = 0
  let totalChildren = 0
  let totalWorking = 0
  let totalElderly = 0
  const tierCounts: [number, number, number] = [0, 0, 0]

  for (const agent of agents) {
    satSum += agent.satisfaction
    if (agent.workBuildingId === null) unmatchedJob++
    if (agent.commerceBuildingId === null) unmatchedCommerce++
    commuteLengthSum += agent.homeWorkRoute.length
    totalChildren += agent.demographics.children
    totalWorking += agent.demographics.working
    totalElderly += agent.demographics.elderly
    tierCounts[agent.wealthTier - 1]! ++
  }

  return {
    agentCount: agents.length,
    avgSatisfaction: satSum / agents.length,
    unmatchedJobFraction: unmatchedJob / agents.length,
    unmatchedCommerceFraction: unmatchedCommerce / agents.length,
    avgCommuteLengthTiles: commuteLengthSum / agents.length,
    totalChildren,
    totalWorking,
    totalElderly,
    birthsLastTick: 0,
    deathsLastTick: 0,
    netMigrationLastTick: 0,
    tierCounts,
  }
}

/** Sync each residential building's `residents` from the sum of its agents' demographics.
 *  Only updates buildings that have at least one agent; buildings below the sampling
 *  threshold keep their fill-system residents value. */
export function syncBuildingResidents(map: GameMap, registry: CitizenRegistry): void {
  const popByBuilding = new Map<string, number>()
  for (const agent of registry.agents) {
    const d = agent.demographics
    const total = d.children + d.working + d.elderly
    popByBuilding.set(agent.homeBuildingId, (popByBuilding.get(agent.homeBuildingId) ?? 0) + total)
  }
  for (const b of map.buildings) {
    const def = BUILDING_DEFS[b.defId]
    if (!def || def.category !== BuildingCategory.Residential) continue
    if (popByBuilding.has(b.id)) {
      b.residents = popByBuilding.get(b.id)!
    }
  }
}

/** Sum all residential building residents. */
export function computeTotalPopulation(map: GameMap): number {
  let total = 0
  for (const b of map.buildings) {
    const def = BUILDING_DEFS[b.defId]
    if (!def || def.category !== BuildingCategory.Residential) continue
    if (b.state === 'active') total += b.residents
  }
  return total
}
