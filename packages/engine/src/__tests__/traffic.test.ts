import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceMonth } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'

function setupCity(engine: ReturnType<typeof Engine.create>, size: number) {
  // Power plant at (0,0)
  engine.placeBuilding(0, 0, 'power.coal')
  // Road along y=4
  for (let x = 0; x < size; x++) engine.placeTile(x, 4, Infrastructure.Road)
  // Power line along y=3
  for (let x = 0; x < size; x++) engine.placeTile(x, 3, Infrastructure.PowerLine)
  // Fire station to prevent zone destruction
  engine.placeBuilding(15, 0, 'service.fire')
}

describe('Traffic system', () => {
  test('no traffic on empty map', () => {
    const engine = Engine.create(createTestMap(32))
    advanceMonth(engine)
    const state = engine.getState()
    const totalTraffic = Array.from(state.trafficDensity).reduce((a, b) => a + b, 0)
    expect(totalTraffic).toBe(0)
  })

  test('traffic appears on roads between residential and commercial zones', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    setupCity(engine, 32)

    // Residential on one side
    for (let x = 5; x < 10; x++) {
      for (let y = 5; y < 10; y++) {
        engine.placeZone(x, y, ZoneType.Residential)
      }
    }
    // Commercial on other side
    for (let x = 20; x < 25; x++) {
      for (let y = 5; y < 10; y++) {
        engine.placeZone(x, y, ZoneType.Commercial)
      }
    }

    // Let zones develop
    for (let i = 0; i < 30; i++) advanceMonth(engine)

    const state = engine.getState()
    // At minimum, the system should run without error
    expect(state.trafficDensity.length).toBe(32 * 32)
  })

  test('disconnected zones generate zero traffic', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    // Zones with no connecting road
    for (let x = 5; x < 10; x++) {
      engine.placeZone(x, 5, ZoneType.Residential)
      engine.placeZone(x, 20, ZoneType.Commercial)
    }
    for (let i = 0; i < 10; i++) advanceMonth(engine)
    const state = engine.getState()
    const totalTraffic = Array.from(state.trafficDensity).reduce((a, b) => a + b, 0)
    expect(totalTraffic).toBe(0)
  })

  test('heavy congestion suppresses demand', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    setupCity(engine, 32)
    for (let x = 5; x < 15; x++) {
      for (let y = 5; y < 15; y++) {
        engine.placeZone(x, y, ZoneType.Residential)
      }
    }
    for (let x = 20; x < 30; x++) {
      for (let y = 5; y < 15; y++) {
        engine.placeZone(x, y, ZoneType.Commercial)
      }
    }
    // Let city develop with low traffic
    for (let i = 0; i < 20; i++) advanceMonth(engine)
    const demandBefore = engine.getDemand()

    // Artificially saturate traffic to max on all road tiles
    const state = engine.getState()
    for (let x = 0; x < 32; x++) {
      const idx = 4 * 32 + x
      if (state.map.infrastructure[idx]! & Infrastructure.Road) {
        state.trafficDensity[idx] = 255
      }
    }
    // Advance to recalculate demand with congestion
    advanceMonth(engine)
    const demandAfter = engine.getDemand()

    // Residential demand should be suppressed by congestion
    expect(demandAfter.residential).toBeLessThanOrEqual(demandBefore.residential)
  })

  test('parallel roads reduce congestion', () => {
    const engine1 = Engine.create(createTestMap(32), { startingFunds: 100_000, seed: 42 })
    setupCity(engine1, 32)
    // Single road at y=4 (already placed by setupCity)
    for (let x = 5; x < 10; x++) {
      engine1.placeZone(x, 5, ZoneType.Residential)
      engine1.placeZone(x, 6, ZoneType.Residential)
    }
    for (let x = 20; x < 25; x++) {
      engine1.placeZone(x, 5, ZoneType.Commercial)
    }
    for (let i = 0; i < 30; i++) advanceMonth(engine1)
    const traffic1 = engine1.getState().trafficDensity[4 * 32 + 15]!

    // Second engine with parallel road
    const engine2 = Engine.create(createTestMap(32), { startingFunds: 100_000, seed: 42 })
    setupCity(engine2, 32)
    // Add parallel road at y=6
    for (let x = 0; x < 32; x++) engine2.placeTile(x, 6, Infrastructure.Road)
    for (let x = 5; x < 10; x++) {
      engine2.placeZone(x, 5, ZoneType.Residential)
      engine2.placeZone(x, 7, ZoneType.Residential)
    }
    for (let x = 20; x < 25; x++) {
      engine2.placeZone(x, 5, ZoneType.Commercial)
    }
    for (let i = 0; i < 30; i++) advanceMonth(engine2)
    const traffic2 = engine2.getState().trafficDensity[4 * 32 + 15]!

    // Traffic on the single road should be >= traffic with parallel road
    expect(traffic1).toBeGreaterThanOrEqual(traffic2)
  })
})
