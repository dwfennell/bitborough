import { type GameMap, type DemandInfo, type CitizenSummary, Infrastructure } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import { TRAFFIC_CAPACITY } from '../road-graph.js'
import { clamp } from './math.js'

export const COMMERCIAL_DEMAND_CAPACITY_DIVISOR = 500
const VACANCY_MIN_POPULATION = 100

function sumResidentialCapacity(map: GameMap): number {
  let total = 0
  for (const b of map.buildings) {
    if (!b.defId.startsWith('res') || b.state !== 'active') continue
    total += BUILDING_DEFS[b.defId]?.capacity ?? 0
  }
  return total
}

function sumResidentialResidents(map: GameMap): number {
  let total = 0
  for (const b of map.buildings) {
    if (!b.defId.startsWith('res') || b.state !== 'active') continue
    total += b.residents
  }
  return total
}

/**
 * Calculate zone demand based on current map state, tax rate, and traffic.
 *
 * Demand values range from -1 (strong decline) to 1 (strong growth).
 *
 * Key formulas (from PRD):
 * - Tax modifier: 1.0 - ((taxRate - 0.07) * 5.0) — neutral at 7%
 * - Residential base: 0.9 (always positive base demand)
 * - Commercial: follows total residential capacity (planning intent, not actual residents)
 * - Industrial: base 0.3 with dampened tax sensitivity
 * - Congestion: average road congestion > 0.8 suppresses all demand
 */
export function calculateDemand(
  map: GameMap,
  taxRate: number,
  trafficDensity?: Uint8Array,
  citizens?: CitizenSummary,
): DemandInfo {
  const taxModifier = 1.0 - (taxRate - 0.07) * 5.0

  // Residential demand:
  const rBase = 0.9
  let rDemand = rBase * taxModifier

  // Commercial demand uses total residential capacity (not actual residents).
  // This avoids a deadlock where 0 residents → 0 commercial demand → no foot traffic.
  const resCap = sumResidentialCapacity(map)
  const cBase = Math.min(resCap / COMMERCIAL_DEMAND_CAPACITY_DIVISOR, 0.6)
  let cDemand = cBase * taxModifier

  // Industrial demand:
  const iBase = 0.4
  let iDemand = iBase * (taxModifier * 0.5 + 0.5)

  // Congestion suppression: high average road congestion reduces demand
  if (trafficDensity) {
    const avgCongestion = computeAverageCongestion(map, trafficDensity)
    if (avgCongestion > 0.8) {
      // Scale from 1.0 at 0.8 congestion to 0.5 at 2.0+ congestion
      const penalty = Math.max(0.5, 1.0 - (avgCongestion - 0.8) * 0.4)
      rDemand *= penalty
      cDemand *= penalty
      iDemand *= penalty
    }
  }

  // Citizen signals (only when citizens are present)
  if (citizens && citizens.agentCount > 0) {
    // Long commute suppresses residential demand (max -0.3 penalty at 60 tiles)
    if (citizens.avgCommuteLengthTiles > 30) {
      const penalty = Math.min(0.3, ((citizens.avgCommuteLengthTiles - 30) / 30) * 0.3)
      rDemand -= penalty
    }

    // Unmatched job fraction boosts industrial + commercial demand (up to +0.3)
    const jobBoost = citizens.unmatchedJobFraction * 0.3
    iDemand += jobBoost
    cDemand += jobBoost * 0.5

    // Unmatched commerce fraction boosts commercial demand (up to +0.2)
    cDemand += citizens.unmatchedCommerceFraction * 0.2
  }

  // Vacancy rate feedback: high vacancy dampens residential demand.
  // Only applies above 100 population — small cities need to fill first buildings freely.
  const totalResidents = sumResidentialResidents(map)
  if (totalResidents >= VACANCY_MIN_POPULATION) {
    const vacancy = resCap > 0 ? 1 - totalResidents / resCap : 0
    if (vacancy > 0.08) {
      const vacancyPenalty = Math.min(0.5, (vacancy - 0.08) * 3)
      rDemand -= vacancyPenalty
    }
  }

  // Demographic signals
  if (citizens) {
    const totalPop = citizens.totalChildren + citizens.totalWorking + citizens.totalElderly
    if (totalPop > 0 && citizens.totalWorking > 0) {
      const depRatio = (citizens.totalChildren + citizens.totalElderly) / citizens.totalWorking
      if (depRatio > 0.6) {
        const penalty = Math.min(0.15, (depRatio - 0.6) * 0.3)
        cDemand -= penalty
        iDemand -= penalty
      }
      const childFraction = citizens.totalChildren / totalPop
      if (childFraction > 0.25) {
        rDemand += 0.05
      }
    }
  }

  // Clamp all values to [-1, 1]
  return {
    residential: clamp(rDemand, -1, 1),
    commercial: clamp(cDemand, -1, 1),
    industrial: clamp(iDemand, -1, 1),
  }
}

function computeAverageCongestion(map: GameMap, trafficDensity: Uint8Array): number {
  let totalCongestion = 0
  let roadCount = 0

  for (let i = 0; i < map.infrastructure.length; i++) {
    if (map.infrastructure[i]! & Infrastructure.Road) {
      totalCongestion += trafficDensity[i]! / TRAFFIC_CAPACITY
      roadCount++
    }
  }

  return roadCount > 0 ? totalCongestion / roadCount : 0
}
