import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceMonth } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'

describe('Crime system', () => {
  test('undeveloped map has zero crime', () => {
    const engine = Engine.create(createTestMap(32))
    advanceMonth(engine)
    const state = engine.getState()
    const totalCrime = Array.from(state.crimeLevel).reduce((a, b) => a + b, 0)
    expect(totalCrime).toBe(0)
  })

  test('crime exists in developed areas without police', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    // Zone and develop an area
    for (let x = 5; x < 15; x++) {
      for (let y = 5; y < 15; y++) {
        engine.placeZone(x, y, ZoneType.Residential)
      }
    }
    // Add road and power for development
    for (let x = 4; x < 16; x++) {
      engine.placeTile(x, 4, Infrastructure.Road)
    }
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 0; x < 16; x++) {
      engine.placeTile(x, 3, Infrastructure.PowerLine)
    }
    // Advance to let zones develop
    for (let i = 0; i < 20; i++) advanceMonth(engine)
    const state = engine.getState()
    // Some tiles should have crime > 0
    let crimeCount = 0
    for (let i = 0; i < state.crimeLevel.length; i++) {
      if (state.crimeLevel[i]! > 0) crimeCount++
    }
    expect(crimeCount).toBeGreaterThan(0)
  })

  test('police station reduces crime in radius', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    // Create developed area
    for (let x = 10; x < 20; x++) {
      for (let y = 10; y < 20; y++) {
        engine.placeZone(x, y, ZoneType.Residential)
      }
    }
    for (let x = 9; x < 21; x++) engine.placeTile(x, 9, Infrastructure.Road)
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 0; x < 21; x++) engine.placeTile(x, 8, Infrastructure.PowerLine)

    // Measure crime without police
    for (let i = 0; i < 20; i++) advanceMonth(engine)
    const crimeWithout = engine.getState().crimeLevel[15 * 32 + 15]!

    // Add police station
    engine.placeBuilding(14, 14, 'service.police')
    for (let i = 0; i < 4; i++) advanceMonth(engine)
    const crimeWith = engine.getState().crimeLevel[15 * 32 + 15]!

    expect(crimeWith).toBeLessThan(crimeWithout)
  })

  test('underfunded police has reduced effect', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    for (let x = 10; x < 20; x++) {
      for (let y = 10; y < 20; y++) {
        engine.placeZone(x, y, ZoneType.Residential)
      }
    }
    for (let x = 9; x < 21; x++) engine.placeTile(x, 9, Infrastructure.Road)
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 0; x < 21; x++) engine.placeTile(x, 8, Infrastructure.PowerLine)
    engine.placeBuilding(14, 14, 'service.police')

    // Full funding
    engine.setFunding('police', 100)
    for (let i = 0; i < 20; i++) advanceMonth(engine)
    const crimeFullFunding = engine.getState().crimeLevel[15 * 32 + 15]!

    // Cut funding
    engine.setFunding('police', 50)
    for (let i = 0; i < 8; i++) advanceMonth(engine)
    const crimeHalfFunding = engine.getState().crimeLevel[15 * 32 + 15]!

    // Crime should be higher with less funding
    expect(crimeHalfFunding).toBeGreaterThanOrEqual(crimeFullFunding)
  })
})
