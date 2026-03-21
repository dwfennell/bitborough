import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceYear, advanceMonth } from '../test-helpers.js'
import { Infrastructure, ZoneType, DensityLevel, createEmptyMap } from '@bitborough/core'
import { calculateBudget } from '../simulation/budget.js'

describe('Budget system', () => {
  test('road maintenance deducted monthly', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    // Place 10 road tiles (cost: $100 construction)
    for (let x = 5; x < 15; x++) {
      engine.placeTile(x, 10, Infrastructure.Road)
    }
    const afterConstruction = engine.getState().funds
    advanceYear(engine) // 48 ticks = 12 months
    const afterYear = engine.getState().funds
    // $1/tile/month × 10 tiles × 12 months = $120
    // (no tax income since no developed zones)
    expect(afterYear).toBe(afterConstruction - 120)
  })

  test('power plant maintenance deducted monthly', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.coal') // costs $2,000
    const afterPlacement = engine.getState().funds
    advanceYear(engine)
    const afterYear = engine.getState().funds
    // Coal plant maintenance: $60/month × 12 months = $720/year
    expect(afterYear).toBe(afterPlacement - 720)
  })

  test('tax income collected from developed zones', () => {
    const engine = Engine.create(createTestMap(64), { seed: 42 })
    // Set up a city with many zones that will develop
    // Coal plant at (0,0), footprint covers (0-3, 0-3)
    engine.placeBuilding(0, 0, 'power.coal')
    // Connect power from plant edge (y=3) down to zone area
    // Plant tile (3,3) is adjacent to (3,4) via south direction
    for (let y = 4; y <= 5; y++) {
      engine.placeTile(3, y, Infrastructure.PowerLine)
    }
    // Create multiple rows of residential zones with power and roads
    for (let row = 0; row < 5; row++) {
      const baseY = 5 + row * 3
      for (let x = 3; x < 30; x++) {
        engine.placeTile(x, baseY, Infrastructure.PowerLine)
        engine.placeTile(x, baseY + 2, Infrastructure.Road)
        engine.placeZone(x, baseY + 1, ZoneType.Residential)
      }
    }
    // Run 10 years so many zones develop and generate meaningful tax
    for (let i = 0; i < 10; i++) advanceYear(engine)
    const state = engine.getState()
    // Should have some tax income (population × avgLandValue / 120 × taxRate)
    expect(state.budget.taxIncome).toBeGreaterThan(0)
  })

  test('setTaxRate changes the rate', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.setTaxRate(0.12)
    expect(engine.getState().budget.taxRate).toBe(0.12)
  })

  test('setTaxRate clamps to valid range', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.setTaxRate(0.25) // above max 20%
    expect(engine.getState().budget.taxRate).toBe(0.2)
    engine.setTaxRate(-0.05) // below min 0%
    expect(engine.getState().budget.taxRate).toBe(0)
  })

  test('budget info shows maintenance breakdown', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    for (let x = 5; x < 15; x++) {
      engine.placeTile(x, 10, Infrastructure.Road)
    }
    engine.placeBuilding(0, 0, 'power.coal')
    advanceYear(engine)
    const budget = engine.getState().budget
    expect(budget.maintenanceCosts.roads).toBe(10) // 10 roads × $1
    expect(budget.maintenanceCosts.powerPlants).toBe(60) // 1 coal × $60
    expect(budget.maintenanceCosts.total).toBe(70)
  })

  test('insufficient funds blocks construction in austerity', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 15 })
    // Place a road (costs $10)
    engine.placeTile(5, 5, Infrastructure.Road)
    // Now have $5 left — can't afford another road
    const result = engine.placeTile(6, 5, Infrastructure.Road)
    expect(result.ok).toBe(false)
  })

  test('budget balance applied every monthly tick', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    // Place 10 road tiles so there is a non-zero (negative) balance each month
    for (let x = 5; x < 15; x++) {
      engine.placeTile(x, 10, Infrastructure.Road)
    }
    const before = engine.getState().funds
    // Advance exactly one month (4 ticks) — funds should change immediately
    advanceMonth(engine)
    const after = engine.getState().funds
    expect(after).not.toBe(before)
  })

  test('loanRepayment is subtracted from balance and added to projectedExpenses', () => {
    const map = createEmptyMap(32, 32, { name: 'test', seed: 0, createdAt: '' })
    const landValues = new Uint8Array(32 * 32)
    const funding = { police: 100, fire: 100, transit: 100 }

    const withoutLoan = calculateBudget(map, 0, 0.07, landValues, funding, 0)
    const withLoan = calculateBudget(map, 0, 0.07, landValues, funding, 500)

    expect(withLoan.loanRepayment).toBe(500)
    expect(withLoan.balance).toBe(withoutLoan.balance - 500)
    expect(withLoan.projectedBalance).toBe(withoutLoan.projectedBalance - 500)
    expect(withLoan.projectedExpenses).toBe(withoutLoan.projectedExpenses + 500)

    const withLargeLoan = calculateBudget(map, 0, 0.07, landValues, funding, 999_999)
    expect(withLargeLoan.balance).toBe(withoutLoan.balance - 999_999)
  })
})

describe('Sprawl penalty', () => {
  test('low population with many spread-out buildings increases road maintenance', () => {
    const map = createEmptyMap(32, 32, { name: 'test', seed: 0, createdAt: '' })
    const landValues = new Uint8Array(32 * 32)
    const funding = { police: 100, fire: 100, transit: 100 }

    // Add 20 road tiles for baseline maintenance
    for (let x = 0; x < 20; x++) {
      map.infrastructure[5 * 32 + x] = Infrastructure.Road
    }
    // Add 10 power line tiles
    for (let x = 0; x < 10; x++) {
      map.infrastructure[3 * 32 + x] = Infrastructure.PowerLine
    }

    // Add 10 res.low buildings (each 1x1 = 10 footprint tiles total)
    for (let x = 0; x < 10; x++) {
      map.buildings.push({
        id: `r${x}`,
        defId: 'res.low',
        x,
        y: 4,
        density: DensityLevel.Low,
        state: 'active',
        residents: 0,
        age: 0,
        powered: true,
      })
    }

    // With population=10 and footprint=10: sprawlRatio = 10/10 = 1.0
    // sprawlMultiplier = 1 + (1.0 - 0.05) * 4 = 1 + 3.8 = 4.8
    const sprawlBudget = calculateBudget(map, 10, 0.07, landValues, funding)

    // With population=10000 and footprint=10: sprawlRatio = 10/10000 = 0.001
    // 0.001 < 0.05 threshold → sprawlMultiplier = 1.0 (no penalty)
    const denseBudget = calculateBudget(map, 10000, 0.07, landValues, funding)

    // Road maintenance should be higher with sprawl
    expect(sprawlBudget.maintenanceCosts.roads).toBeGreaterThan(denseBudget.maintenanceCosts.roads)
    // Power line maintenance should also be higher with sprawl
    expect(sprawlBudget.maintenanceCosts.powerLines).toBeGreaterThan(denseBudget.maintenanceCosts.powerLines)
  })

  test('high population with dense buildings gets no sprawl penalty', () => {
    const map = createEmptyMap(32, 32, { name: 'test', seed: 0, createdAt: '' })
    const landValues = new Uint8Array(32 * 32)
    const funding = { police: 100, fire: 100, transit: 100 }

    // Add 10 road tiles
    for (let x = 0; x < 10; x++) {
      map.infrastructure[5 * 32 + x] = Infrastructure.Road
    }

    // Add 5 res.low buildings (footprint = 5)
    for (let x = 0; x < 5; x++) {
      map.buildings.push({
        id: `r${x}`,
        defId: 'res.low',
        x,
        y: 4,
        density: DensityLevel.Low,
        state: 'active',
        residents: 0,
        age: 0,
        powered: true,
      })
    }

    // population=1000, footprint=5: sprawlRatio = 5/1000 = 0.005
    // 0.005 < 0.05 threshold → no penalty
    const budget = calculateBudget(map, 1000, 0.07, landValues, funding)

    // Road maintenance should be exactly roadCount * MAINTENANCE.road = 10 * 1 = 10
    expect(budget.maintenanceCosts.roads).toBe(10)
  })
})
