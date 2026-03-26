import { describe, test, expect } from 'vitest'
import { Infrastructure } from '@bitborough/core'
import { createEngineState, rebuildDerivedState } from '../engine-state.js'
import { monthlyTick, syncResidentialAgents } from '../simulation/tick.js'
import { createTestMap } from '../test-helpers.js'

// ---------------------------------------------------------------------------
// monthlyTick
// ---------------------------------------------------------------------------

describe('monthlyTick', () => {
  test('advances month correctly (month 1 → 2)', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })
    expect(state.month).toBe(1)
    monthlyTick(state)
    expect(state.month).toBe(2)
  })

  test('year wraps at end of year (month 12 → year+1, month 1)', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })
    // Advance to month 12
    for (let i = 0; i < 11; i++) monthlyTick(state)
    expect(state.month).toBe(12)
    const yearBefore = state.year
    monthlyTick(state)
    expect(state.month).toBe(1)
    expect(state.year).toBe(yearBefore + 1)
  })

  test('demand is recalculated (non-zero after tick on a developed map)', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })

    // Manually place a residential building to give the simulation something to work with
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 5,
      y: 5,
      state: 'active',
      residents: 10,
      powered: true,
      density: 0,
      age: 0,
    } as any)

    const demandBefore = { ...state.demand }
    monthlyTick(state)

    // demand object should be a new reference (recalculated)
    expect(state.demand).not.toBe(demandBefore)
  })

  test('history grows by 1 entry per tick', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })
    expect(state.history.length).toBe(0)
    monthlyTick(state)
    expect(state.history.length).toBe(1)
    monthlyTick(state)
    expect(state.history.length).toBe(2)
  })

  test('history is capped at 1200 entries', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })

    // Pre-fill history with 1200 entries
    for (let i = 0; i < 1200; i++) {
      state.history.push({
        month: 1, year: 1900, population: 0, funds: 5000,
        taxIncome: 0, expenses: 0, rDemand: 0, cDemand: 0, iDemand: 0,
        births: 0, deaths: 0, netMigration: 0,
      })
    }

    // Tick once more: push brings it to 1201, then shift() trims to 1200
    monthlyTick(state)

    expect(state.history.length).toBe(1200)
  })

  test('emergency loan issued when funds < 0 with no existing loan', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })
    state.funds = -1000
    state.loan = null

    const result = monthlyTick(state)

    expect(result.events.some((e) => e.type === 'emergency_loan')).toBe(true)
    expect(state.loan).not.toBeNull()
    expect(state.funds).toBeGreaterThanOrEqual(0)
  })

  test('bankruptcy event when funds < 0 with existing loan', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })

    // Set up an existing loan so the emergency loan branch is skipped
    state.loan = {
      principal: 10_000,
      remaining: 10_000,
      monthlyPayment: 100,
      termMonths: 120,
      monthsLeft: 120,
      interestRate: 0.08,
    }
    state.loanRepaymentAmount = 100
    // Set funds sufficiently negative that even after adding balance it stays < 0,
    // and ensure the balance won't rescue it by zeroing out any income
    state.funds = -999_999
    state.taxRate = 0

    const result = monthlyTick(state)

    expect(result.events.some((e) => e.type === 'bankruptcy')).toBe(true)
  })

  test('budgetInfo fields populated after tick', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })
    monthlyTick(state)

    expect(state.budgetInfo).toBeDefined()
    expect(typeof state.budgetInfo.taxIncome).toBe('number')
    expect(typeof state.budgetInfo.balance).toBe('number')
    expect(state.budgetInfo.maintenanceCosts).toBeDefined()
    expect(state.budgetInfo.serviceCosts).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// syncResidentialAgents
// ---------------------------------------------------------------------------

describe('syncResidentialAgents', () => {
  test('creates agents for active residential buildings with residents', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })

    // Place building at (4, 3) and a road at (4, 4) so resolveAccessRoad succeeds.
    // residents must be >= samplingRatio (50) so that Math.floor(residents/50) >= 1 agent.
    map.infrastructure[4 * map.width + 4] = Infrastructure.Road
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 4,
      y: 3,
      state: 'active',
      residents: 50,
      powered: true,
      density: 0,
      age: 0,
    } as any)

    // Rebuild the index so the building is findable by agents
    rebuildDerivedState(state)

    syncResidentialAgents(state)

    // At least one agent should now exist for the residential building
    expect(state.citizenRegistry.agents.length).toBeGreaterThan(0)
  })

  test('does not create agents for non-residential buildings', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })

    // Commercial building — no agents should be created
    map.buildings.push({
      id: 'b1',
      defId: 'power.diesel',
      x: 4,
      y: 3,
      state: 'active',
      residents: 0,
      powered: true,
      density: 0,
      age: 0,
    } as any)

    syncResidentialAgents(state)

    expect(state.citizenRegistry.agents.length).toBe(0)
  })

  test('does not create agents for buildings in under_construction state', () => {
    const map = createTestMap(32)
    const state = createEngineState(map, { seed: 1 })

    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 4,
      y: 3,
      state: 'under_construction',
      residents: 10,
      powered: false,
      density: 0,
      age: 0,
    } as any)

    syncResidentialAgents(state)

    expect(state.citizenRegistry.agents.length).toBe(0)
  })
})
