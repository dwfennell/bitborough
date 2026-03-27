import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceMonth } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'

describe('Fire system', () => {
  test('fire destroys building and displaces residents', () => {
    // Match the integration test setup that reliably produces buildings
    const engine = Engine.create(createTestMap(64), { startingFunds: 50_000, seed: 42 })
    engine.placeBuilding(10, 10, 'power.coal')
    for (let x = 14; x < 28; x++) {
      engine.placeTile(x, 12, Infrastructure.Road)
      engine.placeTile(x, 10, Infrastructure.PowerLine)
      engine.placeZone(x, 11, ZoneType.Residential)
    }

    // Run 2 years to let buildings develop
    for (let i = 0; i < 24; i++) advanceMonth(engine)

    const state = engine.getState()
    const resBefore = state.map.buildings.filter(b => b.defId.startsWith('res.'))
    expect(resBefore.length).toBeGreaterThan(0)

    const b = resBefore[0]!
    const idx = b.y * 64 + b.x
    const popBefore = state.population

    // Set a fire with 1 remaining tick so it burns out next month
    ;(engine as any).state.fireState.activeFires.set(idx, 1)
    advanceMonth(engine)

    const after = engine.getState()
    expect(after.map.buildings.filter(b2 => b2.id === b.id).length).toBe(0)
    expect(after.population).toBeLessThan(popBefore)
  })

  test('fire preserves zoning so buildings can regrow', () => {
    const engine = Engine.create(createTestMap(64), { startingFunds: 50_000, seed: 42 })
    engine.placeBuilding(10, 10, 'power.coal')
    for (let x = 14; x < 28; x++) {
      engine.placeTile(x, 12, Infrastructure.Road)
      engine.placeTile(x, 10, Infrastructure.PowerLine)
      engine.placeZone(x, 11, ZoneType.Residential)
    }

    // Run 2 years to let buildings develop
    for (let i = 0; i < 24; i++) advanceMonth(engine)

    const state = engine.getState()
    const resBefore = state.map.buildings.filter(b => b.defId.startsWith('res.'))
    expect(resBefore.length).toBeGreaterThan(0)

    const b = resBefore[0]!
    const idx = b.y * 64 + b.x

    // Set a fire with 1 remaining tick so it burns out next month
    ;(engine as any).state.fireState.activeFires.set(idx, 1)
    advanceMonth(engine)

    // Building should be destroyed but zoning should remain
    const after = engine.getState()
    expect(after.map.buildings.filter(b2 => b2.id === b.id).length).toBe(0)
    expect(after.map.zones[idx]).toBe(ZoneType.Residential)
  })

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
    ;(engine as any).state.fireState.activeFires.set(9 * 32 + 10, 5)

    // Tick once — next tick triggers monthly (ticksPerMonth=4, set tickCount=3)
    ;(engine as any).state.tickCount = 3
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
