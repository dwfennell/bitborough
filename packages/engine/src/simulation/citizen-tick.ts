import { type GameMap, type Building } from '@bitborough/core'
import type { RoadGraph } from '../road-graph.js'
import type { BuildingIndex } from '../building-index.js'
import { TIER_WEIGHTS, buildTierCountsByBuilding, computeSchellingPenalty } from './wealth-tiers.js'
import { computeParkNorm } from './reputation.js'
import { clamp } from './math.js'
import { SCHOOL_CAPACITY, buildEnrollmentCounts, findNearestSchool, computeSchoolQuality } from './services/school.js'
import type { Citizen, CitizenRegistry, TileLayers } from './citizens.js'
import { replanStaleRoutes, enrollAgentInSchool } from './citizen-sync.js'

// ── Constants ───────────────────────────────────────────────────────────────

const WORK_TRIP_WEIGHT = 2
const COMMERCE_TRIP_WEIGHT = 1
const SCHOOL_TRIP_WEIGHT = 1
const MAX_SATISFACTION_COMMUTE = 60
const MAX_SCHOOL_COMMUTE = 40

// ── Satisfaction ─────────────────────────────────────────────────────────────

function computeSatisfaction(
  agent: Citizen,
  map: GameMap,
  layers: TileLayers,
  bldIdx: BuildingIndex,
  buildingTierCounts: Map<string, [number, number, number]>,
  buildingById: Map<string, Building>,
  enrollmentCounts: Map<string, number>,
  educationFunding: number,
): number {
  const w = TIER_WEIGHTS[agent.wealthTier]
  const commuteNorm = clamp(agent.homeWorkRoute.length / MAX_SATISFACTION_COMMUTE, 0, 1)
  const jobless = agent.workBuildingId === null ? 1 : 0
  const noCommerce = agent.commerceBuildingId === null ? 1 : 0

  const building = buildingById.get(agent.homeBuildingId)
  let crimeNorm = 0,
    pollNorm = 0,
    fireNorm = 0,
    parkNorm = 0
  if (building) {
    const idx = building.y * map.width + building.x
    crimeNorm = layers.crimeLevel[idx]! / 255
    pollNorm = layers.pollutionLevel[idx]! / 255
    fireNorm = layers.fireCoverage[idx]! / 255
    parkNorm = computeParkNorm(building.x, building.y, map, bldIdx)
  }

  const tierCounts = buildingTierCounts.get(agent.homeBuildingId) ?? [0, 0, 0]
  const schelling = computeSchellingPenalty(agent.wealthTier, tierCounts)

  let educationScore = 0
  if (agent.schoolBuildingId !== null) {
    const schoolCommuteNorm = clamp(agent.homeSchoolRoute.length / MAX_SCHOOL_COMMUTE, 0, 1)
    const schoolBuilding = buildingById.get(agent.schoolBuildingId)
    const capacity = SCHOOL_CAPACITY[schoolBuilding?.defId ?? ''] ?? 0
    const enrolled = enrollmentCounts.get(agent.schoolBuildingId) ?? 0
    const schoolQuality = computeSchoolQuality(enrolled, capacity, educationFunding)
    educationScore = schoolQuality * (1 - schoolCommuteNorm * 0.5)
  }

  return clamp(
    1.0 -
      commuteNorm * 0.4 * w.commute -
      jobless * 0.5 * w.jobMatch -
      noCommerce * 0.3 * w.commerce -
      crimeNorm * 0.3 * w.crime -
      pollNorm * 0.3 * w.pollution +
      fireNorm * 0.15 * w.fire +
      parkNorm * 0.25 * w.park -
      schelling +
      educationScore * 0.15 * w.education,
    0,
    1,
  )
}

// ── Monthly tick ─────────────────────────────────────────────────────────────

export function citizenMonthlyTick(
  registry: CitizenRegistry,
  map: GameMap,
  graph: RoadGraph,
  trafficDensity: Uint8Array,
  layers: TileLayers,
  bldIdx: BuildingIndex,
  educationFunding: number,
): { enrollmentCounts: Map<string, number>; buildingById: Map<string, Building> } {
  // Pass 1: replan stale routes (traffic-aware)
  replanStaleRoutes(registry, map, graph, trafficDensity)

  // Pass 1b: enroll agents with children who aren't enrolled yet (e.g. after births)
  const enrollmentCounts = buildEnrollmentCounts(registry.agents)
  for (const agent of registry.agents) {
    if (agent.demographics.children > 0 && agent.schoolBuildingId === null) {
      const schoolMatch = findNearestSchool(map, graph, agent.homeAccessRoad, enrollmentCounts, trafficDensity)
      if (schoolMatch) {
        enrollAgentInSchool(agent, schoolMatch, enrollmentCounts)
      }
    }
  }

  // Pass 2: traffic contribution
  const size = map.width * map.height
  const rawTraffic = new Float64Array(size)

  const buildingTierCounts = buildTierCountsByBuilding(registry.agents)
  const buildingById = new Map<string, Building>()
  for (const b of map.buildings) buildingById.set(b.id, b)

  for (const agent of registry.agents) {
    // Weight traffic by how many residents this agent represents
    const d = agent.demographics
    const representedPop = d.children + d.working + d.elderly
    const trafficScale = representedPop / registry.samplingRatio
    for (const tileIdx of agent.homeWorkRoute) {
      rawTraffic[tileIdx]! += WORK_TRIP_WEIGHT * trafficScale
    }
    for (const tileIdx of agent.homeCommerceRoute) {
      rawTraffic[tileIdx]! += COMMERCE_TRIP_WEIGHT * trafficScale
    }
    for (const tileIdx of agent.homeSchoolRoute) {
      rawTraffic[tileIdx]! += SCHOOL_TRIP_WEIGHT * trafficScale
    }
    agent.satisfaction = computeSatisfaction(
      agent,
      map,
      layers,
      bldIdx,
      buildingTierCounts,
      buildingById,
      enrollmentCounts,
      educationFunding,
    )
  }

  // Scale by sampling ratio and write to trafficDensity
  trafficDensity.fill(0)
  for (let i = 0; i < size; i++) {
    trafficDensity[i] = Math.min(255, Math.floor(rawTraffic[i]! * registry.samplingRatio))
  }
  return { enrollmentCounts, buildingById }
}
