import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceMonth } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'

describe('Fire system', () => {
  test('fire coverage exists near fire stations', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    engine.placeBuilding(10, 10, 'service.fire')
    advanceMonth(engine)
    const state = engine.getState()
    // Tiles near fire station should have fire coverage > 0
    const idx = 11 * 32 + 11
    expect(state.fireCoverage[idx]).toBeGreaterThan(0)
  })

  test('fire coverage is zero far from fire stations', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    engine.placeBuilding(0, 0, 'service.fire')
    advanceMonth(engine)
    const state = engine.getState()
    // Far corner should have no coverage
    const idx = 31 * 32 + 31
    expect(state.fireCoverage[idx]).toBe(0)
  })

  test('fire system runs without error on developed city', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000, seed: 42 })
    // Create dense development
    for (let x = 5; x < 25; x++) {
      for (let y = 5; y < 25; y++) {
        engine.placeZone(x, y, ZoneType.Industrial)
      }
    }
    for (let x = 4; x < 26; x++) engine.placeTile(x, 4, Infrastructure.Road)
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 0; x < 26; x++) engine.placeTile(x, 3, Infrastructure.PowerLine)

    // Place fire station
    engine.placeBuilding(14, 14, 'service.fire')

    // Advance many months — should run without error
    for (let i = 0; i < 50; i++) advanceMonth(engine)

    const state = engine.getState()
    expect(state).toBeDefined()
    expect(state.fireCoverage).toBeDefined()
  })

  test('fires spread at most one tile per tick', () => {
    const engine = Engine.create(createTestMap(32), { seed: 53 })
    // Place a row of zones for fire to potentially spread through
    for (let x = 5; x < 20; x++) {
      engine.placeTile(x, 10, Infrastructure.Road)
      engine.placeZone(x, 9, ZoneType.Residential)
      engine.placeZone(x, 11, ZoneType.Residential)
    }
    // Access engine internals to set a single fire
    ;(engine as any).fireState.activeFires.set(9 * 32 + 10, 5)

    // Tick once — next tick triggers monthly (ticksPerMonth=4, set tickCount=3)
    ;(engine as any).tickCount = 3
    engine.tick()

    const fires = engine.getState().activeFires
    // All fires should be within Manhattan distance 1 of original (x=10, y=9)
    for (const idx of fires) {
      const fx = idx % 32
      const fy = Math.floor(idx / 32)
      const dist = Math.abs(fx - 10) + Math.abs(fy - 9)
      expect(dist).toBeLessThanOrEqual(1)
    }
  })

  test('active fires can start in developed areas', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000, seed: 42 })
    // Create dense development WITHOUT fire station to increase fire risk
    for (let x = 5; x < 25; x++) {
      for (let y = 5; y < 25; y++) {
        engine.placeZone(x, y, ZoneType.Industrial)
      }
    }
    for (let x = 4; x < 26; x++) engine.placeTile(x, 4, Infrastructure.Road)
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 0; x < 26; x++) engine.placeTile(x, 3, Infrastructure.PowerLine)

    // Let zones develop and fires start — high probability over 100 months
    let firesSeen = false
    for (let i = 0; i < 100; i++) {
      advanceMonth(engine)
      const state = engine.getState()
      if (state.activeFires.length > 0) {
        firesSeen = true
        break
      }
    }
    expect(firesSeen).toBe(true)
  })
})
