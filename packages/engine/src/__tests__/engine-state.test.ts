import { describe, test, expect } from 'vitest'
import { DEFAULTS } from '@bitborough/core'
import {
  createEngineState,
  rebuildDerivedState,
  serializeState,
  restoreState,
  computeLoanRepayment,
  maxPrefixedId,
} from '../engine-state.js'
import { createTestMap } from '../test-helpers.js'

// ---------------------------------------------------------------------------
// maxPrefixedId
// ---------------------------------------------------------------------------

describe('maxPrefixedId', () => {
  test('returns 0 for empty array', () => {
    expect(maxPrefixedId([], 'b')).toBe(0)
  })

  test('finds highest numeric ID after prefix', () => {
    const items = [{ id: 'b3' }, { id: 'b10' }, { id: 'b7' }]
    expect(maxPrefixedId(items, 'b')).toBe(10)
  })
})

// ---------------------------------------------------------------------------
// computeLoanRepayment
// ---------------------------------------------------------------------------

describe('computeLoanRepayment', () => {
  function makeState(loan: any, loanRepaymentAmount: number) {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })
    state.loan = loan
    state.loanRepaymentAmount = loanRepaymentAmount
    return state
  }

  test('returns 0 when loan is null', () => {
    const state = makeState(null, 500)
    expect(computeLoanRepayment(state)).toBe(0)
  })

  test('returns monthlyPayment when remaining > monthlyPayment', () => {
    const loan = { principal: 50_000, remaining: 40_000, monthlyPayment: 500, termMonths: 120, monthsLeft: 80, interestRate: 0.08 }
    const state = makeState(loan, 500)
    expect(computeLoanRepayment(state)).toBe(500)
  })

  test('returns remaining when remaining < monthlyPayment (final payment)', () => {
    const loan = { principal: 50_000, remaining: 200, monthlyPayment: 500, termMonths: 120, monthsLeft: 1, interestRate: 0.08 }
    const state = makeState(loan, 500)
    expect(computeLoanRepayment(state)).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// createEngineState
// ---------------------------------------------------------------------------

describe('createEngineState', () => {
  test('creates state with correct map dimensions', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })
    const size = 32 * 32
    expect(state.powerGrid.length).toBe(size)
    expect(state.landValues.length).toBe(size)
    expect(state.pollutionLevel.length).toBe(size)
    expect(state.crimeLevel.length).toBe(size)
    expect(state.fireCoverage.length).toBe(size)
    expect(state.trafficDensity.length).toBe(size)
    expect(state.reputationLayer.length).toBe(size)
  })

  test('applies DEFAULTS.taxRate when taxRate not specified', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })
    expect(state.taxRate).toBe(DEFAULTS.taxRate)
  })

  test('applies explicit config values', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 42, startingFunds: 99_000, taxRate: 0.05 })
    expect(state.funds).toBe(99_000)
    expect(state.taxRate).toBe(0.05)
  })

  test('all layers are allocated and non-null', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })
    expect(state.powerGrid).not.toBeNull()
    expect(state.landValues).not.toBeNull()
    expect(state.pollutionLevel).not.toBeNull()
    expect(state.crimeLevel).not.toBeNull()
    expect(state.fireCoverage).not.toBeNull()
    expect(state.trafficDensity).not.toBeNull()
    expect(state.reputationLayer).not.toBeNull()
    expect(state.influenceBuffer).not.toBeNull()
    expect(state.pollutionBuffer).not.toBeNull()
  })

  test('reputationLayer is initialized to 0.5', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })
    for (let i = 0; i < state.reputationLayer.length; i++) {
      expect(state.reputationLayer[i]).toBeCloseTo(0.5, 3)
    }
  })

  test('citizenRegistry is empty', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })
    expect(state.citizenRegistry.agents.length).toBe(0)
  })

  test('demand and budgetInfo are populated', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })
    expect(state.demand).toBeDefined()
    expect(state.demand.residential).toBeDefined()
    expect(state.demand.commercial).toBeDefined()
    expect(state.demand.industrial).toBeDefined()
    expect(state.budgetInfo).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// rebuildDerivedState
// ---------------------------------------------------------------------------

describe('rebuildDerivedState', () => {
  test('updates bldIdx so a placed building is findable', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })

    // Place a building manually after state creation
    map.buildings.push({
      id: 'b1',
      defId: 'power.diesel',
      x: 5,
      y: 5,
      state: 'active',
      residents: 0,
      powered: false,
      density: 0,
      age: 0,
    } as any)

    // Before rebuild, the index doesn't know about the building
    expect(state.bldIdx.get(5, 5)).toBeUndefined()

    rebuildDerivedState(state)

    // After rebuild, the building is findable
    expect(state.bldIdx.get(5, 5)).toBeDefined()
    expect(state.bldIdx.get(5, 5)!.id).toBe('b1')
  })

  test('after placing a polluting building, pollution levels become non-zero at nearby tiles', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })

    // coal plant has large pollution radius
    map.buildings.push({
      id: 'b1',
      defId: 'power.coal',
      x: 10,
      y: 10,
      state: 'active',
      residents: 0,
      powered: false,
      density: 0,
      age: 0,
    } as any)

    rebuildDerivedState(state)

    // Tiles near the coal plant should have pollution > 0
    const nearIdx = 10 * 32 + 10
    expect(state.pollutionLevel[nearIdx]).toBeGreaterThan(0)
  })

  test('updates fire coverage when a fire station exists with funding', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })

    // Before station: all fire coverage should be 0
    const allZero = Array.from(state.fireCoverage).every((v) => v === 0)
    expect(allZero).toBe(true)

    // Place a fire station (3x3)
    map.buildings.push({
      id: 'b1',
      defId: 'service.fire',
      x: 10,
      y: 10,
      state: 'active',
      residents: 0,
      powered: true,
      density: 0,
      age: 0,
    } as any)

    rebuildDerivedState(state)

    // Tiles near the fire station should have coverage > 0
    const coverageSum = Array.from(state.fireCoverage).reduce((a, b) => a + b, 0)
    expect(coverageSum).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// serializeState + restoreState round-trip
// ---------------------------------------------------------------------------

describe('serializeState + restoreState', () => {
  test('key fields match after round-trip', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 42, startingFunds: 12_345, taxRate: 0.09 })
    state.month = 6
    state.year = 1905
    state.tickCount = 100

    const save = serializeState(state)
    const restored = restoreState(save)

    expect(restored.month).toBe(6)
    expect(restored.year).toBe(1905)
    expect(restored.tickCount).toBe(100)
    expect(restored.funds).toBe(state.funds)
    expect(restored.taxRate).toBe(0.09)
  })

  test('agents preserved with wealthTier after round-trip', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })

    // Inject a fake agent with wealthTier
    state.citizenRegistry.agents.push({
      id: 'c1',
      homeBuildingId: 'b1',
      homeAccessRoad: 0,
      workBuildingId: null,
      workAccessRoad: null,
      commerceBuildingId: null,
      commerceAccessRoad: null,
      homeWorkRoute: [],
      homeCommerceRoute: [],
      homeWorkRouteStale: false,
      homeCommerceRouteStale: false,
      homeWorkRouteTileSet: new Set(),
      homeCommerceRouteTileSet: new Set(),
      satisfaction: 0.8,
      demographics: { children: 0, working: 50, elderly: 0 },
      wealthTier: 3,
    } as any)

    const save = serializeState(state)
    const restored = restoreState(save)

    expect(restored.citizenRegistry.agents.length).toBe(1)
    expect(restored.citizenRegistry.agents[0]!.wealthTier).toBe(3)
  })

  test('reputationLayer preserved after round-trip', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })

    // Set some specific reputation values
    state.reputationLayer[0] = 0.9
    state.reputationLayer[100] = 0.1

    const save = serializeState(state)
    const restored = restoreState(save)

    expect(restored.reputationLayer[0]).toBeCloseTo(0.9, 5)
    expect(restored.reputationLayer[100]).toBeCloseTo(0.1, 5)
  })

  test('loan state preserved after round-trip', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })

    state.loan = {
      principal: 50_000,
      remaining: 30_000,
      monthlyPayment: 510,
      termMonths: 120,
      monthsLeft: 60,
      interestRate: 0.08,
    }
    state.loanRepaymentAmount = 510

    const save = serializeState(state)
    const restored = restoreState(save)

    expect(restored.loan).not.toBeNull()
    expect(restored.loan!.principal).toBe(50_000)
    expect(restored.loan!.remaining).toBe(30_000)
    expect(restored.loan!.monthlyPayment).toBe(510)
    expect(restored.loanRepaymentAmount).toBe(510)
  })

  test('history preserved after round-trip', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })

    state.history.push({
      month: 3, year: 1902, population: 500, funds: 8_000,
      taxIncome: 200, expenses: 100, rDemand: 0.5, cDemand: 0.3, iDemand: 0.2,
      births: 1, deaths: 0, netMigration: 5,
    })

    const save = serializeState(state)
    const restored = restoreState(save)

    expect(restored.history.length).toBe(1)
    expect(restored.history[0]!.month).toBe(3)
    expect(restored.history[0]!.year).toBe(1902)
    expect(restored.history[0]!.population).toBe(500)
  })

  test('active fires preserved after round-trip', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })

    state.fireState.activeFires.set(42, 10)
    state.fireState.activeFires.set(99, 5)

    const save = serializeState(state)
    const restored = restoreState(save)

    expect(restored.fireState.activeFires.size).toBe(2)
    expect(restored.fireState.activeFires.get(42)).toBe(10)
    expect(restored.fireState.activeFires.get(99)).toBe(5)
  })
})
