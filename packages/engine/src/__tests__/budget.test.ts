import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceYear } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@rcity/core'

describe('Budget system', () => {
  test('road maintenance deducted annually', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    // Place 10 road tiles (cost: $100 construction)
    for (let x = 5; x < 15; x++) {
      engine.placeTile(x, 10, Infrastructure.Road)
    }
    const afterConstruction = engine.getState().funds
    advanceYear(engine) // 48 ticks
    const afterYear = engine.getState().funds
    // Should have deducted $10 maintenance (10 tiles × $1/tile)
    // (no tax income since no developed zones)
    expect(afterYear).toBe(afterConstruction - 10)
  })

  test('power plant maintenance deducted annually', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.coal') // costs $3,000
    const afterPlacement = engine.getState().funds
    advanceYear(engine)
    const afterYear = engine.getState().funds
    // Coal plant maintenance: $120/year
    expect(afterYear).toBe(afterPlacement - 120)
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
    expect(engine.getState().budget.taxRate).toBe(0.20)
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
    expect(budget.maintenanceCosts.powerPlants).toBe(120) // 1 coal × $120
    expect(budget.maintenanceCosts.total).toBe(130)
  })

  test('insufficient funds blocks construction in austerity', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 15 })
    // Place a road (costs $10)
    engine.placeTile(5, 5, Infrastructure.Road)
    // Now have $5 left — can't afford another road
    const result = engine.placeTile(6, 5, Infrastructure.Road)
    expect(result.ok).toBe(false)
  })
})
