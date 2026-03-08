import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap } from '../test-helpers.js'
import { Infrastructure } from '@rcity/core'

describe('Connection masks', () => {
  test('isolated road has no connections', () => {
    const engine = Engine.create(createTestMap(10))
    engine.placeTile(5, 5, Infrastructure.Road)
    expect(engine.getTile(5, 5).connections).toBe(0)
  })

  test('two adjacent roads connect', () => {
    const engine = Engine.create(createTestMap(10))
    engine.placeTile(5, 5, Infrastructure.Road)
    engine.placeTile(6, 5, Infrastructure.Road)
    // (5,5) should have East connection (bit 1 = 2)
    expect(engine.getTile(5, 5).connections & 2).toBeTruthy()
    // (6,5) should have West connection (bit 3 = 8)
    expect(engine.getTile(6, 5).connections & 8).toBeTruthy()
  })

  test('crossroads has all 4 connections', () => {
    const engine = Engine.create(createTestMap(10))
    engine.placeTile(5, 5, Infrastructure.Road)
    engine.placeTile(5, 4, Infrastructure.Road) // North
    engine.placeTile(6, 5, Infrastructure.Road) // East
    engine.placeTile(5, 6, Infrastructure.Road) // South
    engine.placeTile(4, 5, Infrastructure.Road) // West
    expect(engine.getTile(5, 5).connections).toBe(0b1111) // 15
  })

  test('bulldozing updates neighbor connections', () => {
    const engine = Engine.create(createTestMap(10))
    engine.placeTile(5, 5, Infrastructure.Road)
    engine.placeTile(6, 5, Infrastructure.Road)
    engine.bulldoze(6, 5)
    // (5,5) should no longer have East connection
    expect(engine.getTile(5, 5).connections & 2).toBeFalsy()
  })
})
