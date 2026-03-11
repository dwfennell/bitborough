import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceMonth } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'

describe('Building state', () => {
  test('building has active state by default', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.coal')
    const b = engine.getState().map.buildings[0]!
    expect(b.state).toBe('active')
  })
})

describe('Zone development', () => {
  function setupPoweredZonedCity(engine: ReturnType<typeof Engine.create>) {
    // Place coal power plant at (0,0) — 4x4 footprint
    engine.placeBuilding(0, 0, 'power.coal')
    // Power line connecting to zones
    for (let x = 4; x < 10; x++) {
      engine.placeTile(x, 2, Infrastructure.PowerLine)
    }
    // Road adjacent to zones
    for (let x = 4; x < 10; x++) {
      engine.placeTile(x, 4, Infrastructure.Road)
    }
    // Zone residential tiles adjacent to road
    for (let x = 4; x < 10; x++) {
      engine.placeZone(x, 3, ZoneType.Residential)
    }
    // Ensure power propagates
    engine.tick()
  }

  test('zone with power and road develops over time', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    setupPoweredZonedCity(engine)
    // Advance several months — some zones should develop
    for (let i = 0; i < 24; i++) advanceMonth(engine) // 6 months (24 = 6*4 ticks)
    // Check if any buildings were placed in residential zones
    const state = engine.getState()
    expect(state.map.buildings.length).toBeGreaterThan(1) // > 1 because power plant is already there
  })

  test('zone without power does not develop', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    // Road but no power plant
    for (let x = 4; x < 10; x++) {
      engine.placeTile(x, 4, Infrastructure.Road)
      engine.placeZone(x, 3, ZoneType.Residential)
    }
    for (let i = 0; i < 24; i++) advanceMonth(engine)
    const rBuildings = engine.getState().map.buildings.filter(b => b.defId.startsWith('res.'))
    expect(rBuildings.length).toBe(0)
  })

  test('zone without road does not develop', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    // Power plant but no road
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 4; x < 10; x++) {
      engine.placeTile(x, 2, Infrastructure.PowerLine)
      engine.placeZone(x, 3, ZoneType.Residential)
    }
    for (let i = 0; i < 24; i++) advanceMonth(engine)
    const rBuildings = engine.getState().map.buildings.filter(b => b.defId.startsWith('res.'))
    expect(rBuildings.length).toBe(0)
  })

  test('population increases when residential zones develop', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    setupPoweredZonedCity(engine)
    for (let i = 0; i < 24; i++) advanceMonth(engine)
    expect(engine.getState().population).toBeGreaterThan(0)
  })
})
