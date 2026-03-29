import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceMonth, advanceYear, createDevelopedCity } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'

describe('Full city lifecycle', () => {
  test('city grows with proper infrastructure', () => {
    const engine = createDevelopedCity({ startingFunds: 50_000, years: 5 })

    const state = engine.getState()
    expect(state.population).toBeGreaterThan(0)
    expect(state.funds).toBeGreaterThan(0)
    expect(state.demand.residential).toBeGreaterThan(-1)
  })

  test('city without power stagnates', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    // Roads and zones but no power plant
    for (let x = 5; x < 15; x++) {
      engine.placeTile(x, 10, Infrastructure.Road)
      engine.placeZone(x, 9, ZoneType.Residential)
    }
    advanceYear(engine)
    advanceYear(engine)
    expect(engine.getState().population).toBe(0)
  })

  test('city without roads stagnates', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.diesel')
    // Power lines and zones but no roads
    for (let x = 2; x < 14; x++) {
      engine.placeTile(x, 5, Infrastructure.PowerLine)
      engine.placeZone(x, 6, ZoneType.Residential)
    }
    advanceYear(engine)
    advanceYear(engine)
    expect(engine.getState().population).toBe(0)
  })

  test('high tax rate suppresses growth', { timeout: 30_000 }, () => {
    const highTax = createDevelopedCity({ startingFunds: 50_000, years: 5, taxRate: 0.2 })
    const normalTax = createDevelopedCity({ startingFunds: 50_000, years: 5 })

    // High-tax city should have less population
    expect(highTax.getState().population).toBeLessThanOrEqual(normalTax.getState().population)
  })

  test('no density upgrades occur in first 3 months (buildings need time to fill)', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 999_999 })
    engine.placeBuilding(0, 0, 'power.diesel')
    // Connect power and build paved roads with residential zones
    for (let x = 2; x < 12; x++) {
      engine.placeTile(x, 2, Infrastructure.PowerLine)
      engine.placeTile(x, 3, Infrastructure.Road)
      engine.upgradeTile(x, 3)
      engine.placeZone(x, 4, ZoneType.Residential)
    }
    // Only 3 months (12 ticks at 4 ticks/month)
    for (let m = 0; m < 3; m++) advanceMonth(engine)
    // No building should be medium density yet (need time to fill)
    const hasMed = engine
      .getState()
      .map.buildings.some(
        (b) => b.state !== 'under_construction' && (b.defId.includes('med') || b.defId.includes('high')),
      )
    expect(hasMed).toBe(false)
  })

  test('population grows gradually, not instantly on zone development', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 999_999 })
    engine.placeBuilding(0, 0, 'power.diesel')
    // Power line spine from plant edge down to zone row
    for (let y = 2; y <= 4; y++) engine.placeTile(1, y, Infrastructure.PowerLine)
    for (let x = 1; x < 8; x++) {
      engine.placeTile(x, 4, Infrastructure.PowerLine) // power line row
      engine.placeZone(x, 5, ZoneType.Residential) // zone row
      engine.placeTile(x, 6, Infrastructure.Road) // road row
    }
    // After first monthly tick, population should be very low (buildings just placed, residents=0)
    advanceMonth(engine)
    const popAfter1Month = engine.getState().population
    // After 24 months, population should be higher (fill loop working)
    for (let m = 0; m < 23; m++) advanceMonth(engine)
    const popAfter24Months = engine.getState().population
    // After 1 month, residents should still be relatively low (gradual fill, not instant)
    expect(popAfter1Month).toBeLessThan(100)
    // After 24 months, population should have grown substantially
    expect(popAfter24Months).toBeGreaterThan(5)
  })

  test('save and load preserves city', () => {
    const engine = createDevelopedCity({ startingFunds: 50_000, years: 2 })

    const fundsBefore = engine.getState().funds

    const save = engine.serialize()
    const json = JSON.stringify(save)
    const parsed = JSON.parse(json)
    const restored = Engine.restore(parsed)

    // population is recomputed from Σ b.residents on restore; funds are preserved
    const expectedPop = restored
      .getState()
      .map.buildings.filter((b) => b.state === 'active')
      .reduce((sum, b) => sum + b.residents, 0)
    expect(restored.getState().population).toBe(expectedPop)
    expect(restored.getState().funds).toBe(fundsBefore)
  })
})
