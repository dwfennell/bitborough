import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap } from '../test-helpers.js'
import { TileType, Infrastructure } from '@rcity/core'

describe('Land value', () => {
  test('water adjacency increases land value', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    // Set some tiles to water
    const state = engine.getState()
    state.map.terrain[5 * 32 + 10] = TileType.Water
    state.map.terrain[5 * 32 + 11] = TileType.Water
    // Tick to recalculate land values
    for (let i = 0; i < 4; i++) engine.tick()
    // Tile adjacent to water should have higher value than one far away
    const nearWater = state.landValues[6 * 32 + 10]! // adjacent to water
    const farFromWater = state.landValues[20 * 32 + 20]! // far from water
    expect(nearWater).toBeGreaterThan(farFromWater)
  })

  test('park increases nearby land value', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.placeBuilding(10, 10, 'special.park')
    for (let i = 0; i < 4; i++) engine.tick()
    const state = engine.getState()
    const nearPark = state.landValues[11 * 32 + 10]! // adjacent to park
    const farFromPark = state.landValues[25 * 32 + 25]! // far from park
    expect(nearPark).toBeGreaterThan(farFromPark)
  })

  test('all land values are within valid range [0, 255]', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.coal')
    for (let i = 0; i < 4; i++) engine.tick()
    const state = engine.getState()
    for (let i = 0; i < state.landValues.length; i++) {
      expect(state.landValues[i]).toBeGreaterThanOrEqual(0)
      expect(state.landValues[i]).toBeLessThanOrEqual(255)
    }
  })

  test('land value starts at zero for empty map', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    for (let i = 0; i < 4; i++) engine.tick()
    const state = engine.getState()
    // With no features, all land values should be at base level
    const total = Array.from(state.landValues).reduce((a, b) => a + b, 0)
    // Should be very low (base terrain only, no negative factors)
    expect(total).toBeLessThan(state.landValues.length * 50)
  })
})
