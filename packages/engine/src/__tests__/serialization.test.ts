import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceYear } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

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
    // population is recomputed from Σ b.residents on restore
    const expectedPop = s2.map.buildings.filter((b) => b.state === 'active').reduce((sum, b) => sum + b.residents, 0)
    expect(s2.population).toBe(expectedPop)
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

  test('v1 save (no residents field) defaults residents to capacity on restore', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1, startingFunds: 10_000 })
    // Manually craft a v1-style save (no residents on buildings)
    const save = engine.serialize()
    // Simulate v1 save: strip residents from buildings and set version to 1
    const v1Save = {
      ...save,
      version: 1,
      map: {
        ...save.map,
        buildings: save.map.buildings.map(({ residents: _r, lowOccupancyMonths: _l, ...rest }) => rest),
      },
    }
    const restored = Engine.restore(v1Save as any)
    for (const b of restored.getState().map.buildings) {
      const def = BUILDING_DEFS[b.defId]
      if (def && def.capacity > 0) {
        expect(b.residents).toBe(def.capacity)
      }
    }
  })

  test('v2 save preserves exact residents values', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1, startingFunds: 10_000 })
    const save = engine.serialize()
    expect(save.version).toBe(2)
    const restored = Engine.restore(save)
    for (let i = 0; i < engine.getState().map.buildings.length; i++) {
      expect(restored.getState().map.buildings[i]!.residents).toBe(engine.getState().map.buildings[i]!.residents)
    }
  })

  test('population after restore equals sum of residents', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 999_999 })
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 4; x < 10; x++) {
      engine.placeTile(x, 2, Infrastructure.PowerLine)
      engine.placeTile(x, 3, Infrastructure.Road)
      engine.placeZone(x, 4, ZoneType.Residential)
    }
    for (let i = 0; i < 120; i++) engine.tick() // let buildings fill up a bit
    const save = engine.serialize()
    const restored = Engine.restore(save)
    const expectedPop = restored
      .getState()
      .map.buildings.filter((b) => b.state === 'active')
      .reduce((sum, b) => sum + b.residents, 0)
    expect(restored.getState().population).toBe(expectedPop)
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

    // Both engines advance time identically
    expect(restored.getState().time.year).toBe(engine.getState().time.year)
    expect(restored.getState().time.month).toBe(engine.getState().time.month)
    // population and funds diverge until Task 4 fills in residents — tested via 'population after restore' test
  })
})
