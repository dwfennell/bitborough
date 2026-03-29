import type { CitizenSummary, GameMap, AttractivenessFactors } from '@bitborough/core'
import { BuildingCategory } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import type { CitizenRegistry } from './citizens.js'
import { PRNG } from '../prng.js'
import { stochasticCount } from './demographics.js'

// --- Constants ---
export const ATTRACTIVENESS_BASELINE = 0.5
export const ATTRACTIVENESS_WEIGHTS = {
  jobs: 0.3,
  satisfaction: 0.25,
  services: 0.2,
  tax: 0.15,
  housing: 0.1,
} as const

export const MIGRATION_SENSITIVITY = 2.0
export const MIGRATION_MODIFIER_MIN = 0.5
export const MIGRATION_MODIFIER_MAX = 1.5
export const TAX_NEUTRAL_RATE = 0.07

export type { AttractivenessFactors }

export function computeAttractiveness(
  summary: CitizenSummary,
  map: GameMap,
  taxRate: number,
  funding: { police: number; fire: number; education: number },
  crimeLevel: Uint8Array,
  fireCoverage: Uint8Array,
  educationQuality: Uint8Array,
): { score: number; factors: AttractivenessFactors } {
  const jobMatchRate = 1 - summary.unmatchedJobFraction
  const avgSatisfaction = summary.avgSatisfaction

  // Service coverage: fraction of residential tiles covered, scaled by funding
  let resBuildingCount = 0
  let policeCount = 0
  let fireCount = 0
  let eduCount = 0
  let totalResidents = 0
  let totalCapacity = 0

  for (const b of map.buildings) {
    if (b.state !== 'active') continue
    const def = BUILDING_DEFS[b.defId]
    if (!def) continue
    if (def.category === BuildingCategory.Residential) {
      const idx = b.y * map.width + b.x
      resBuildingCount++
      if (crimeLevel[idx]! < 128) policeCount++
      if (fireCoverage[idx]! > 0) fireCount++
      if (educationQuality[idx]! >= 2) eduCount++
      totalResidents += b.residents
      totalCapacity += def.capacity
    }
  }

  let serviceCoverage: number
  if (resBuildingCount === 0) {
    serviceCoverage = 0.5
  } else {
    const policeFrac = policeCount / resBuildingCount
    const fireFrac = fireCount / resBuildingCount
    const eduFrac = eduCount / resBuildingCount
    serviceCoverage =
      (policeFrac * (funding.police / 100) + fireFrac * (funding.fire / 100) + eduFrac * (funding.education / 100)) / 3
  }

  const taxCompetitiveness = Math.max(0, Math.min(1, 1.0 - (taxRate - TAX_NEUTRAL_RATE) * 5.0))

  const housingAvailability = totalCapacity === 0 ? 1.0 : Math.max(0, Math.min(1, 1 - totalResidents / totalCapacity))

  const factors: AttractivenessFactors = {
    jobMatchRate,
    avgSatisfaction,
    serviceCoverage,
    taxCompetitiveness,
    housingAvailability,
  }

  const w = ATTRACTIVENESS_WEIGHTS
  const score = Math.max(
    0,
    Math.min(
      1,
      jobMatchRate * w.jobs +
        avgSatisfaction * w.satisfaction +
        serviceCoverage * w.services +
        taxCompetitiveness * w.tax +
        housingAvailability * w.housing,
    ),
  )

  return { score, factors }
}

export const TIER_DIST_STRUGGLING: readonly [number, number, number] = [0.5, 0.35, 0.15]
export const TIER_DIST_BASELINE: readonly [number, number, number] = [0.3, 0.45, 0.25]
export const TIER_DIST_PROSPEROUS: readonly [number, number, number] = [0.2, 0.4, 0.4]

function lerpDist(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number,
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

export function computeMigrantTierDistribution(attractiveness: number): [number, number, number] {
  if (attractiveness <= 0.5) {
    const t = attractiveness / 0.5
    return lerpDist(TIER_DIST_STRUGGLING, TIER_DIST_BASELINE, t)
  }
  const t = (attractiveness - 0.5) / 0.5
  return lerpDist(TIER_DIST_BASELINE, TIER_DIST_PROSPEROUS, t)
}

export function computeMigrationModifier(attractiveness: number): number {
  const gap = attractiveness - ATTRACTIVENESS_BASELINE
  return Math.max(MIGRATION_MODIFIER_MIN, Math.min(MIGRATION_MODIFIER_MAX, 1.0 + gap * MIGRATION_SENSITIVITY))
}

// --- Brain Drain ---

export const BRAIN_DRAIN_THRESHOLD = 0.4
export const BRAIN_DRAIN_RATE = 0.04
export const MAX_MONTHLY_DRAIN_RATE = 0.016
export const BRAIN_DRAIN_MIN_POP = 100

export function applyBrainDrain(
  attractiveness: number,
  registry: CitizenRegistry,
  totalPopulation: number,
  prng: PRNG,
): { departures: number; buildingDeltas: Map<string, number> } {
  const buildingDeltas = new Map<string, number>()

  if (attractiveness >= BRAIN_DRAIN_THRESHOLD || totalPopulation < BRAIN_DRAIN_MIN_POP) {
    return { departures: 0, buildingDeltas }
  }

  const drainGap = BRAIN_DRAIN_THRESHOLD - attractiveness
  const cappedRate = Math.min(drainGap * BRAIN_DRAIN_RATE, MAX_MONTHLY_DRAIN_RATE)
  let departureTarget = stochasticCount(totalPopulation, cappedRate, prng)

  // Highest-wealth, least-satisfied agents leave first — they have options elsewhere
  const sorted = [...registry.agents].sort((a, b) => {
    if (b.wealthTier !== a.wealthTier) return b.wealthTier - a.wealthTier
    return a.satisfaction - b.satisfaction
  })

  let departures = 0
  for (const agent of sorted) {
    if (departureTarget <= 0) break
    const amount = Math.min(departureTarget, registry.samplingRatio)
    const prev = buildingDeltas.get(agent.homeBuildingId) ?? 0
    buildingDeltas.set(agent.homeBuildingId, prev - amount)
    departureTarget -= amount
    departures += amount
  }

  return { departures, buildingDeltas }
}
