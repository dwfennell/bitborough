import { type GameMap, type DemandInfo, Infrastructure } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

const TRAFFIC_CAPACITY = 100

export const COMMERCIAL_DEMAND_CAPACITY_DIVISOR = 500

function totalResCap(map: GameMap): number {
  let total = 0
  for (const b of map.buildings) {
    if (!b.defId.startsWith('res') || b.state !== 'active') continue
    total += BUILDING_DEFS[b.defId]?.capacity ?? 0
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
 * - Residential base: 0.7 (always positive base demand)
 * - Commercial: follows total residential capacity (planning intent, not actual residents)
 * - Industrial: base 0.3 with dampened tax sensitivity
 * - Congestion: average road congestion > 0.8 suppresses all demand
 */
export function calculateDemand(map: GameMap, taxRate: number, trafficDensity?: Uint8Array): DemandInfo {
  // Tax rate modifier:
  // At 7% tax, modifier is 1.0 (neutral)
  // Lower tax → modifier > 1 (boost)
  // Higher tax → modifier < 1 (suppress)
  const taxModifier = 1.0 - (taxRate - 0.07) * 5.0

  // Residential demand:
  const rBase = 1.0
  let rDemand = rBase * taxModifier

  // Commercial demand uses total residential capacity (not actual residents).
  // This avoids a deadlock where 0 residents → 0 commercial demand → no foot traffic.
  const cBase = Math.min(totalResCap(map) / COMMERCIAL_DEMAND_CAPACITY_DIVISOR, 0.6)
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
