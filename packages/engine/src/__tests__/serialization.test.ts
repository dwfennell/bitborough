import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceYear } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@rcity/core'

describe('Serialization', () => {
  test('serialize produces valid JSON', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    const save = engine.serialize()
    expect(() => JSON.stringify(save)).not.toThrow()
  })

  test('serialize and restore produces identical state', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 4; x < 10; x++) {
      engine.placeTile(x, 2, Infrastructure.PowerLine)
      engine.placeTile(x, 4, Infrastructure.Road)
      engine.placeZone(x, 3, ZoneType.Residential)
    }
    advanceYear(engine) // let some zones develop

    const save = engine.serialize()
    const restored = Engine.restore(save)
    const s1 = engine.getState()
    const s2 = restored.getState()

    expect(s2.time.tickCount).toBe(s1.time.tickCount)
    expect(s2.time.month).toBe(s1.time.month)
    expect(s2.time.year).toBe(s1.time.year)
    expect(s2.funds).toBe(s1.funds)
    expect(s2.population).toBe(s1.population)
    expect(s2.budget.taxRate).toBe(s1.budget.taxRate)
    expect(Array.from(s2.map.terrain)).toEqual(Array.from(s1.map.terrain))
    expect(Array.from(s2.map.zones)).toEqual(Array.from(s1.map.zones))
    expect(Array.from(s2.map.infrastructure)).toEqual(Array.from(s1.map.infrastructure))
    expect(s2.map.buildings.length).toBe(s1.map.buildings.length)
  })

  test('restored engine continues simulation correctly', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 4; x < 10; x++) {
      engine.placeTile(x, 4, Infrastructure.Road)
      engine.placeZone(x, 3, ZoneType.Residential)
    }
    advanceYear(engine)

    const save = engine.serialize()
    const restored = Engine.restore(save)

    // Both should be able to continue ticking without errors
    advanceYear(engine)
    advanceYear(restored)

    // Restored engine should have advanced correctly
    expect(restored.getState().time.year).toBe(engine.getState().time.year)
  })

  test('restored engine is deterministic with original', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 4; x < 10; x++) {
      engine.placeTile(x, 4, Infrastructure.Road)
      engine.placeZone(x, 3, ZoneType.Residential)
    }
    // Run for a while
    for (let i = 0; i < 24; i++) engine.tick()

    const save = engine.serialize()
    const restored = Engine.restore(save)

    // Both should produce identical states after same number of ticks
    for (let i = 0; i < 48; i++) {
      engine.tick()
      restored.tick()
    }

    expect(restored.getState().funds).toBe(engine.getState().funds)
    expect(restored.getState().population).toBe(engine.getState().population)
  })
})
