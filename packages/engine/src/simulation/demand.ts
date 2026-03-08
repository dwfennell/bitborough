import { type GameMap, type DemandInfo, ZoneType } from '@bitborough/core'

/**
 * Calculate zone demand based on current map state, population, and tax rate.
 *
 * Demand values range from -1 (strong decline) to 1 (strong growth).
 *
 * Key formulas (from PRD):
 * - Tax modifier: 1.0 - ((taxRate - 0.07) * 5.0) — neutral at 7%
 * - Residential base: 0.5 (always positive base demand)
 * - Commercial: follows population (needs customers)
 * - Industrial: base 0.3 with dampened tax sensitivity
 */
export function calculateDemand(
  map: GameMap,
  population: number,
  taxRate: number,
): DemandInfo {
  // Count existing zones of each type (reserved for future saturation logic)
  let _rCount = 0, _cCount = 0, _iCount = 0
  for (let i = 0; i < map.zones.length; i++) {
    switch (map.zones[i]) {
      case ZoneType.Residential: _rCount++; break
      case ZoneType.Commercial: _cCount++; break
      case ZoneType.Industrial: _iCount++; break
    }
  }

  // Tax rate modifier:
  // At 7% tax, modifier is 1.0 (neutral)
  // Lower tax → modifier > 1 (boost)
  // Higher tax → modifier < 1 (suppress)
  const taxModifier = 1.0 - ((taxRate - 0.07) * 5.0)

  // Residential demand:
  // Base demand of 0.5 (people always want to live somewhere)
  // Modified by tax rate
  const rBase = 0.5
  const rDemand = rBase * taxModifier

  // Commercial demand:
  // Follows residential population (needs customers)
  // Base is proportional to population, capped at 0.5
  // Modified by tax rate
  const cBase = population > 0 ? Math.min(population / 500, 0.5) : 0
  const cDemand = cBase * taxModifier

  // Industrial demand:
  // Natural base demand (always some demand for industry)
  // Less affected by tax rate than residential (dampened effect)
  const iBase = 0.3
  const iDemand = iBase * (taxModifier * 0.5 + 0.5)

  // Clamp all values to [-1, 1]
  return {
    residential: clamp(rDemand, -1, 1),
    commercial: clamp(cDemand, -1, 1),
    industrial: clamp(iDemand, -1, 1),
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
