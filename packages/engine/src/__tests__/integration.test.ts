import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceYear } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'

describe('Full city lifecycle', () => {
  test('city grows with proper infrastructure', () => {
    const engine = Engine.create(createTestMap(64), { seed: 42 })

    // Build power
    engine.placeBuilding(10, 10, 'power.coal')

    // Build road
    for (let x = 14; x < 28; x++) {
      engine.placeTile(x, 12, Infrastructure.Road)
    }

    // Power lines connecting plant to road area
    for (let x = 14; x < 28; x++) {
      engine.placeTile(x, 10, Infrastructure.PowerLine)
    }

    // Zone residential and commercial
    for (let x = 14; x < 28; x++) {
      engine.placeZone(x, 11, ZoneType.Residential)
      engine.placeZone(x, 13, ZoneType.Commercial)
    }

    // Run 5 years
    advanceYear(engine)
    advanceYear(engine)
    advanceYear(engine)
    advanceYear(engine)
    advanceYear(engine)

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
    engine.placeBuilding(0, 0, 'power.coal')
    // Power lines and zones but no roads
    for (let x = 4; x < 14; x++) {
      engine.placeTile(x, 5, Infrastructure.PowerLine)
      engine.placeZone(x, 6, ZoneType.Residential)
    }
    advanceYear(engine)
    advanceYear(engine)
    expect(engine.getState().population).toBe(0)
  })

  test('high tax rate suppresses growth', () => {
    const engine = Engine.create(createTestMap(64), { seed: 42 })
    engine.setTaxRate(0.20) // maximum tax

    engine.placeBuilding(10, 10, 'power.coal')
    for (let x = 14; x < 28; x++) {
      engine.placeTile(x, 10, Infrastructure.PowerLine)
      engine.placeTile(x, 12, Infrastructure.Road)
      engine.placeZone(x, 11, ZoneType.Residential)
    }

    // Compare with a normal-tax city
    const normalEngine = Engine.create(createTestMap(64), { seed: 42 })
    normalEngine.placeBuilding(10, 10, 'power.coal')
    for (let x = 14; x < 28; x++) {
      normalEngine.placeTile(x, 10, Infrastructure.PowerLine)
      normalEngine.placeTile(x, 12, Infrastructure.Road)
      normalEngine.placeZone(x, 11, ZoneType.Residential)
    }

    for (let i = 0; i < 5; i++) {
      advanceYear(engine)
      advanceYear(normalEngine)
    }

    // High-tax city should have less population
    expect(engine.getState().population).toBeLessThanOrEqual(normalEngine.getState().population)
  })

  test('save and load preserves city', () => {
    const engine = Engine.create(createTestMap(64), { seed: 42 })
    engine.placeBuilding(10, 10, 'power.coal')
    for (let x = 14; x < 28; x++) {
      engine.placeTile(x, 12, Infrastructure.Road)
      engine.placeTile(x, 10, Infrastructure.PowerLine)
      engine.placeZone(x, 11, ZoneType.Residential)
    }
    advanceYear(engine)
    advanceYear(engine)

    const popBefore = engine.getState().population
    const fundsBefore = engine.getState().funds

    const save = engine.serialize()
    const json = JSON.stringify(save)
    const parsed = JSON.parse(json)
    const restored = Engine.restore(parsed)

    expect(restored.getState().population).toBe(popBefore)
    expect(restored.getState().funds).toBe(fundsBefore)
  })
})
