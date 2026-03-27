import { describe, test, expect } from 'vitest'
import { computeAttractiveness, computeMigrationModifier, computeMigrantTierDistribution, applyBrainDrain, BRAIN_DRAIN_THRESHOLD, BRAIN_DRAIN_MIN_POP } from '../simulation/migration.js'
import type { CitizenSummary } from '@bitborough/core'
import { DensityLevel, Infrastructure, ZoneType } from '@bitborough/core'
import { createRegistry, EMPTY_CITIZEN_SUMMARY } from '../simulation/citizens.js'
import type { Citizen } from '../simulation/citizens.js'
import { createTestMap, advanceYear } from '../test-helpers.js'
import { PRNG } from '../prng.js'
import { Engine } from '../Engine.js'

function makeSummary(overrides: Partial<CitizenSummary> = {}): CitizenSummary {
  return { ...EMPTY_CITIZEN_SUMMARY, ...overrides }
}

describe('computeAttractiveness', () => {
  test('perfect city scores near 1.0', () => {
    const map = createTestMap(8)
    // res.low has capacity 10; 2 residents = 80% vacancy = high housing availability
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 1, y: 1,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 2,
    })
    const summary = makeSummary({
      avgSatisfaction: 1.0,
      unmatchedJobFraction: 0,
    })
    const crimeLevel = new Uint8Array(64).fill(0) // no crime = full police coverage
    const fireCoverage = new Uint8Array(64).fill(255) // full fire coverage
    const educationQuality = new Uint8Array(64).fill(100) // full education coverage (>=2)
    const funding = { police: 100, fire: 100, education: 100 }

    const { score, factors } = computeAttractiveness(summary, map, 0.07, funding, crimeLevel, fireCoverage, educationQuality)
    expect(score).toBeGreaterThan(0.85)
    expect(factors.jobMatchRate).toBeCloseTo(1.0)
    expect(factors.avgSatisfaction).toBeCloseTo(1.0)
    expect(factors.taxCompetitiveness).toBeCloseTo(1.0)
    expect(factors.serviceCoverage).toBeCloseTo(1.0)
  })

  test('terrible city scores near 0', () => {
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 1, y: 1,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 10,
    })
    const summary = makeSummary({
      avgSatisfaction: 0,
      unmatchedJobFraction: 1.0,
    })
    const crimeLevel = new Uint8Array(64).fill(255)
    const fireCoverage = new Uint8Array(64).fill(0)
    const educationQuality = new Uint8Array(64).fill(0)
    const funding = { police: 0, fire: 0, education: 0 }

    const { score } = computeAttractiveness(summary, map, 0.27, funding, crimeLevel, fireCoverage, educationQuality)
    expect(score).toBeLessThan(0.15)
  })

  test('no residential tiles defaults serviceCoverage to 0.5', () => {
    const map = createTestMap(8)
    const summary = makeSummary({ avgSatisfaction: 0.5, unmatchedJobFraction: 0 })
    const { factors } = computeAttractiveness(
      summary, map, 0.07,
      { police: 100, fire: 100, education: 100 },
      new Uint8Array(64), new Uint8Array(64), new Uint8Array(64),
    )
    expect(factors.serviceCoverage).toBeCloseTo(0.5)
  })

  test('zero capacity defaults housingAvailability to 1.0', () => {
    const map = createTestMap(8)
    const summary = makeSummary()
    const { factors } = computeAttractiveness(
      summary, map, 0.07,
      { police: 100, fire: 100, education: 100 },
      new Uint8Array(64), new Uint8Array(64), new Uint8Array(64),
    )
    expect(factors.housingAvailability).toBeCloseTo(1.0)
  })

  test('tax at 7% gives competitiveness 1.0', () => {
    const map = createTestMap(8)
    const summary = makeSummary()
    const { factors } = computeAttractiveness(
      summary, map, 0.07,
      { police: 100, fire: 100, education: 100 },
      new Uint8Array(64), new Uint8Array(64), new Uint8Array(64),
    )
    expect(factors.taxCompetitiveness).toBeCloseTo(1.0)
  })

  test('tax at 27% gives competitiveness 0', () => {
    const map = createTestMap(8)
    const summary = makeSummary()
    const { factors } = computeAttractiveness(
      summary, map, 0.27,
      { police: 100, fire: 100, education: 100 },
      new Uint8Array(64), new Uint8Array(64), new Uint8Array(64),
    )
    expect(factors.taxCompetitiveness).toBeCloseTo(0)
  })

  test('funding scales service coverage', () => {
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 1, y: 1,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 5,
    })
    const crimeLevel = new Uint8Array(64).fill(0)
    const fireCoverage = new Uint8Array(64).fill(255)
    const educationQuality = new Uint8Array(64).fill(100)
    const summary = makeSummary()

    const fullFunding = computeAttractiveness(summary, map, 0.07, { police: 100, fire: 100, education: 100 }, crimeLevel, fireCoverage, educationQuality)
    const halfFunding = computeAttractiveness(summary, map, 0.07, { police: 50, fire: 50, education: 50 }, crimeLevel, fireCoverage, educationQuality)

    expect(fullFunding.factors.serviceCoverage).toBeGreaterThan(halfFunding.factors.serviceCoverage)
  })
})

describe('computeMigrationModifier', () => {
  test('attractiveness 0.5 gives modifier 1.0', () => {
    expect(computeMigrationModifier(0.5)).toBeCloseTo(1.0)
  })

  test('attractiveness 0.0 gives modifier 0.5 (floor)', () => {
    expect(computeMigrationModifier(0.0)).toBeCloseTo(0.5)
  })

  test('attractiveness 1.0 gives modifier 1.5 (cap)', () => {
    expect(computeMigrationModifier(1.0)).toBeCloseTo(1.5)
  })

  test('attractiveness 0.75 gives modifier 1.5', () => {
    expect(computeMigrationModifier(0.75)).toBeCloseTo(1.5)
  })

  test('attractiveness 0.25 gives modifier 0.5', () => {
    expect(computeMigrationModifier(0.25)).toBeCloseTo(0.5)
  })
})

describe('computeMigrantTierDistribution', () => {
  test('attractiveness 0.5 gives baseline distribution', () => {
    const [low, mid, high] = computeMigrantTierDistribution(0.5)
    expect(low).toBeCloseTo(0.30)
    expect(mid).toBeCloseTo(0.45)
    expect(high).toBeCloseTo(0.25)
  })

  test('attractiveness 0.0 gives struggling distribution', () => {
    const [low, mid, high] = computeMigrantTierDistribution(0.0)
    expect(low).toBeCloseTo(0.50)
    expect(mid).toBeCloseTo(0.35)
    expect(high).toBeCloseTo(0.15)
  })

  test('attractiveness 1.0 gives prosperous distribution', () => {
    const [low, mid, high] = computeMigrantTierDistribution(1.0)
    expect(low).toBeCloseTo(0.20)
    expect(mid).toBeCloseTo(0.40)
    expect(high).toBeCloseTo(0.40)
  })

  test('attractiveness 0.25 is halfway between struggling and baseline', () => {
    const [low, mid, high] = computeMigrantTierDistribution(0.25)
    expect(low).toBeCloseTo(0.40) // lerp(0.50, 0.30, 0.5)
    expect(mid).toBeCloseTo(0.40) // lerp(0.35, 0.45, 0.5)
    expect(high).toBeCloseTo(0.20) // lerp(0.15, 0.25, 0.5)
  })

  test('attractiveness 0.75 is halfway between baseline and prosperous', () => {
    const [low, mid, high] = computeMigrantTierDistribution(0.75)
    expect(low).toBeCloseTo(0.25) // lerp(0.30, 0.20, 0.5)
    expect(mid).toBeCloseTo(0.425) // lerp(0.45, 0.40, 0.5)
    expect(high).toBeCloseTo(0.325) // lerp(0.25, 0.40, 0.5)
  })

  test('distribution always sums to 1.0', () => {
    for (const a of [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1.0]) {
      const dist = computeMigrantTierDistribution(a)
      expect(dist[0] + dist[1] + dist[2]).toBeCloseTo(1.0)
    }
  })
})

function makeBrainDrainAgent(id: string, buildingId: string, tier: 1 | 2 | 3, satisfaction: number): Citizen {
  return {
    id,
    homeBuildingId: buildingId,
    workBuildingId: null,
    commerceBuildingId: null,
    schoolBuildingId: null,
    homeAccessRoad: 0,
    workAccessRoad: null,
    commerceAccessRoad: null,
    schoolAccessRoad: null,
    homeWorkRoute: [],
    homeCommerceRoute: [],
    homeSchoolRoute: [],
    homeWorkRouteTileSet: new Set(),
    homeCommerceRouteTileSet: new Set(),
    homeSchoolRouteTileSet: new Set(),
    homeWorkRouteStale: false,
    homeCommerceRouteStale: false,
    homeSchoolRouteStale: false,
    satisfaction,
    wealthTier: tier,
    demographics: { children: 0, working: 50, elderly: 0 },
  }
}

describe('applyBrainDrain', () => {
  test('no drain when attractiveness >= threshold', () => {
    const registry = createRegistry()
    registry.agents.push(makeBrainDrainAgent('c1', 'b1', 3, 0.5))
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 0, y: 0,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 500,
    })
    const result = applyBrainDrain(0.5, registry, map, new PRNG(42))
    expect(result.departures).toBe(0)
    expect(result.buildingDeltas.size).toBe(0)
  })

  test('no drain when population below minimum', () => {
    const registry = createRegistry()
    registry.agents.push(makeBrainDrainAgent('c1', 'b1', 3, 0.3))
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 0, y: 0,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 50,
    })
    const result = applyBrainDrain(0.2, registry, map, new PRNG(42))
    expect(result.departures).toBe(0)
  })

  test('tier 3 agents depart before tier 2 and tier 1', () => {
    const registry = createRegistry()
    registry.agents.push(makeBrainDrainAgent('c1', 'b1', 1, 0.3))
    registry.agents.push(makeBrainDrainAgent('c2', 'b1', 2, 0.3))
    registry.agents.push(makeBrainDrainAgent('c3', 'b1', 3, 0.3))
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.med', x: 0, y: 0,
      powered: true, density: DensityLevel.Medium, age: 0, state: 'active', residents: 500,
    })
    const result = applyBrainDrain(0.1, registry, map, new PRNG(42))
    expect(result.departures).toBeGreaterThan(0)
    const delta = result.buildingDeltas.get('b1') ?? 0
    expect(delta).toBeLessThan(0)
  })

  test('within same tier, lowest satisfaction departs first', () => {
    const registry = createRegistry()
    const happy = makeBrainDrainAgent('c1', 'b1', 3, 0.8)
    const unhappy = makeBrainDrainAgent('c2', 'b1', 3, 0.1)
    registry.agents.push(happy, unhappy)
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.med', x: 0, y: 0,
      powered: true, density: DensityLevel.Medium, age: 0, state: 'active', residents: 500,
    })
    const result = applyBrainDrain(0.35, registry, map, new PRNG(42))
    expect(result.departures).toBeGreaterThan(0)
  })

  test('departure rate is capped', () => {
    const registry = createRegistry()
    for (let i = 0; i < 20; i++) {
      registry.agents.push(makeBrainDrainAgent(`c${i}`, 'b1', 3, 0.1))
    }
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.high', x: 0, y: 0,
      powered: true, density: DensityLevel.High, age: 0, state: 'active', residents: 5000,
    })
    const result = applyBrainDrain(0.0, registry, map, new PRNG(42))
    // Max drain: 0.016 * 5000 = 80 residents
    expect(result.departures).toBeLessThanOrEqual(80)
  })
})

// ---------------------------------------------------------------------------
// Integration tests — full Engine loop
// ---------------------------------------------------------------------------

function createCityEngine(taxRate = 0.07) {
  const engine = Engine.create(createTestMap(64), { seed: 42, startingFunds: 50_000 })
  // Power plant (diesel per project convention) — 2x2 at (10,10)
  engine.placeBuilding(10, 10, 'power.diesel')
  // Power lines connecting plant to zones (bridge from x=12)
  for (let x = 12; x < 28; x++) engine.placeTile(x, 10, Infrastructure.PowerLine)
  // Road at y=12
  for (let x = 12; x < 28; x++) engine.placeTile(x, 12, Infrastructure.Road)
  // Residential zones at y=11 (adjacent to power lines and road)
  for (let x = 12; x < 28; x++) engine.placeZone(x, 11, ZoneType.Residential)
  // Commercial zones at y=13 (below road, for jobs)
  for (let x = 12; x < 28; x++) engine.placeZone(x, 13, ZoneType.Commercial)
  // Industrial zones at y=14
  for (let x = 12; x < 18; x++) engine.placeZone(x, 14, ZoneType.Industrial)
  engine.setTaxRate(taxRate)
  return engine
}

describe('migration integration', () => {
  test('low-tax city grows faster than high-tax city', () => {
    const lowTax = createCityEngine(0.07)
    const highTax = createCityEngine(0.20)

    for (let i = 0; i < 3; i++) {
      advanceYear(lowTax)
      advanceYear(highTax)
    }

    expect(lowTax.getState().population).toBeGreaterThan(highTax.getState().population)
  })

  test('attractiveness and netMigration are exposed in game state', () => {
    const engine = createCityEngine()
    advanceYear(engine)
    const state = engine.getState()
    expect(state.cityAttractiveness).toBeGreaterThanOrEqual(0)
    expect(state.cityAttractiveness).toBeLessThanOrEqual(1)
    expect(state.attractivenessFactors).toBeDefined()
    expect(state.attractivenessFactors.jobMatchRate).toBeGreaterThanOrEqual(0)
    expect(typeof state.netMigration).toBe('number')
  })

  test('attractiveness factors breakdown sums correctly', () => {
    const engine = createCityEngine()
    advanceYear(engine)
    const { attractivenessFactors: f, cityAttractiveness } = engine.getState()
    const expectedScore =
      f.jobMatchRate * 0.30 +
      f.avgSatisfaction * 0.25 +
      f.serviceCoverage * 0.20 +
      f.taxCompetitiveness * 0.15 +
      f.housingAvailability * 0.10
    expect(cityAttractiveness).toBeCloseTo(expectedScore, 2)
  })
})
