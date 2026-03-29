import {
  type GameMap,
  type Building,
  type CitizenSummary,
  type WealthTier,
  Infrastructure,
  BuildingCategory,
} from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

// ── Types ────────────────────────────────────────────────────────────────────

export interface AgentDemographics {
  children: number // ages 0-17
  working: number // ages 18-64
  elderly: number // ages 65+
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
  schoolBuildingId: string | null
  schoolAccessRoad: number | null
  homeSchoolRoute: number[]
  homeSchoolRouteTileSet: Set<number>
  homeSchoolRouteStale: boolean
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

// ── Population aggregation ───────────────────────────────────────────────────

export function computeCitizenSummary(registry: CitizenRegistry): CitizenSummary {
  const { agents } = registry
  if (agents.length === 0) return { ...EMPTY_CITIZEN_SUMMARY, tierCounts: [0, 0, 0] }

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
    tierCounts[agent.wealthTier - 1]!++
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

/** Sync each residential building's `residents` from the sum of its agents' demographics. */
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

// ── Re-exports from split modules ────────────────────────────────────────────
// Keeps existing import paths working without changes to callers.

export {
  setNextAgentId,
  getNextAgentId,
  findNearestBuilding,
  buildAgentsByBuilding,
  type SyncAgentOptions,
  syncAgentsForBuilding,
  removeAgentsForBuilding,
  clearSchoolEnrollment,
  removeOrphanedAgents,
  markRoutesStale,
  markRoutesStaleBatch,
  replanStaleRoutes,
} from './citizen-sync.js'

export { citizenMonthlyTick } from './citizen-tick.js'
