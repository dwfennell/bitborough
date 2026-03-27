import type { CitizenSummary, GameMap } from '@bitborough/core'
import { BuildingCategory } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

// --- Constants ---
export const ATTRACTIVENESS_BASELINE = 0.5
export const ATTRACTIVENESS_WEIGHTS = {
  jobs: 0.30,
  satisfaction: 0.25,
  services: 0.20,
  tax: 0.15,
  housing: 0.10,
} as const

export const MIGRATION_SENSITIVITY = 2.0
export const MIGRATION_MODIFIER_MIN = 0.5
export const MIGRATION_MODIFIER_MAX = 1.5
export const TAX_NEUTRAL_RATE = 0.07

export interface AttractivenessFactors {
  jobMatchRate: number
  avgSatisfaction: number
  serviceCoverage: number
  taxCompetitiveness: number
  housingAvailability: number
}

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
  let resBuildingCountidents = 0
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
      resBuildingCountidents += b.residents
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
    serviceCoverage = (
      policeFrac * (funding.police / 100) +
      fireFrac * (funding.fire / 100) +
      eduFrac * (funding.education / 100)
    ) / 3
  }

  const taxCompetitiveness = Math.max(0, Math.min(1, 1.0 - (taxRate - TAX_NEUTRAL_RATE) * 5.0))

  const housingAvailability = totalCapacity === 0
    ? 1.0
    : Math.max(0, Math.min(1, 1 - resBuildingCountidents / totalCapacity))

  const factors: AttractivenessFactors = {
    jobMatchRate,
    avgSatisfaction,
    serviceCoverage,
    taxCompetitiveness,
    housingAvailability,
  }

  const w = ATTRACTIVENESS_WEIGHTS
  const score = Math.max(0, Math.min(1,
    jobMatchRate * w.jobs +
    avgSatisfaction * w.satisfaction +
    serviceCoverage * w.services +
    taxCompetitiveness * w.tax +
    housingAvailability * w.housing,
  ))

  return { score, factors }
}

export function computeMigrationModifier(attractiveness: number): number {
  const gap = attractiveness - ATTRACTIVENESS_BASELINE
  return Math.max(MIGRATION_MODIFIER_MIN, Math.min(MIGRATION_MODIFIER_MAX, 1.0 + gap * MIGRATION_SENSITIVITY))
}
