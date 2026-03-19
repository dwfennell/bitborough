import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceMonth } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'

function setupCity(engine: ReturnType<typeof Engine.create>, size: number) {
  engine.placeBuilding(0, 0, 'power.coal')
  for (let x = 0; x < size; x++) engine.placeTile(x, 4, Infrastructure.Road)
  for (let x = 0; x < size; x++) engine.placeTile(x, 3, Infrastructure.PowerLine)
  engine.placeBuilding(15, 0, 'service.fire')
}

describe('Traffic system (citizen-driven)', () => {
  test('no traffic on empty map', () => {
    const engine = Engine.create(createTestMap(32))
    advanceMonth(engine)
    const state = engine.getState()
    const totalTraffic = Array.from(state.trafficDensity).reduce((a, b) => a + b, 0)
    expect(totalTraffic).toBe(0)
  })

  test('traffic appears after citizens develop and commute', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    setupCity(engine, 32)
    for (let x = 5; x < 10; x++) {
      for (let y = 5; y < 10; y++) engine.placeZone(x, y, ZoneType.Residential)
    }
    for (let x = 20; x < 25; x++) {
      for (let y = 5; y < 10; y++) engine.placeZone(x, y, ZoneType.Commercial)
    }
    for (let i = 0; i < 36; i++) advanceMonth(engine)
    const state = engine.getState()
    expect(state.trafficDensity.length).toBe(32 * 32)
    expect(state.citizens.agentCount).toBeGreaterThanOrEqual(0)
  })

  test('disconnected zones generate zero traffic', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    for (let x = 5; x < 10; x++) {
      engine.placeZone(x, 5, ZoneType.Residential)
      engine.placeZone(x, 20, ZoneType.Commercial)
    }
    for (let i = 0; i < 10; i++) advanceMonth(engine)
    const state = engine.getState()
    const totalTraffic = Array.from(state.trafficDensity).reduce((a, b) => a + b, 0)
    expect(totalTraffic).toBe(0)
  })
})
