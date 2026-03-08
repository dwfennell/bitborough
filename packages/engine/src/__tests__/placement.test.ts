import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap } from '../test-helpers.js'
import { TileType, Infrastructure, FailReason } from '@bitborough/core'

describe('Tile placement', () => {
  test('place road on grass succeeds', () => {
    const engine = Engine.create(createTestMap(10))
    const result = engine.placeTile(5, 5, Infrastructure.Road)
    expect(result.ok).toBe(true)
  })

  test('placed road is reflected in map infrastructure', () => {
    const engine = Engine.create(createTestMap(10))
    engine.placeTile(5, 5, Infrastructure.Road)
    const tile = engine.getTile(5, 5)
    expect(tile.infrastructure & Infrastructure.Road).toBeTruthy()
  })

  test('placing road deducts cost', () => {
    const engine = Engine.create(createTestMap(32))
    const fundsBefore = engine.getState().funds
    engine.placeTile(5, 5, Infrastructure.Road)
    expect(engine.getState().funds).toBe(fundsBefore - 10)
  })

  test('placing on water fails', () => {
    const engine = Engine.create(createTestMap(10))
    // Set tile to water
    engine.getState().map.terrain[5 * 10 + 5] = TileType.Water
    const result = engine.placeTile(5, 5, Infrastructure.Road)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe(FailReason.InvalidLocation)
  })

  test('placing out of bounds fails', () => {
    const engine = Engine.create(createTestMap(10))
    const result = engine.placeTile(10, 10, Infrastructure.Road)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe(FailReason.InvalidLocation)
  })

  test('placing with insufficient funds fails', () => {
    const engine = Engine.create(createTestMap(10), { startingFunds: 5 })
    const result = engine.placeTile(5, 5, Infrastructure.Road)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe(FailReason.InsufficientFunds)
  })
})

describe('Zoning', () => {
  test('zone placement succeeds on grass', () => {
    const engine = Engine.create(createTestMap(10))
    const result = engine.placeZone(5, 5, 1) // Residential
    expect(result.ok).toBe(true)
  })

  test('zoning is free', () => {
    const engine = Engine.create(createTestMap(32))
    const fundsBefore = engine.getState().funds
    engine.placeZone(5, 5, 1)
    expect(engine.getState().funds).toBe(fundsBefore)
  })

  test('cannot zone water', () => {
    const engine = Engine.create(createTestMap(10))
    engine.getState().map.terrain[5 * 10 + 5] = TileType.Water
    const result = engine.placeZone(5, 5, 1)
    expect(result.ok).toBe(false)
  })
})

describe('Bulldoze', () => {
  test('bulldoze road clears infrastructure', () => {
    const engine = Engine.create(createTestMap(10))
    engine.placeTile(5, 5, Infrastructure.Road)
    const result = engine.bulldoze(5, 5)
    expect(result.ok).toBe(true)
    expect(engine.getTile(5, 5).infrastructure).toBe(0)
  })

  test('bulldoze trees clears to grass', () => {
    const engine = Engine.create(createTestMap(10))
    engine.getState().map.terrain[5 * 10 + 5] = TileType.Trees
    engine.bulldoze(5, 5)
    expect(engine.getTile(5, 5).terrain).toBe(TileType.Grass)
  })

  test('cannot bulldoze water', () => {
    const engine = Engine.create(createTestMap(10))
    engine.getState().map.terrain[5 * 10 + 5] = TileType.Water
    const result = engine.bulldoze(5, 5)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe(FailReason.NotBulldozable)
  })

  test('bulldoze deducts cost', () => {
    const engine = Engine.create(createTestMap(32))
    engine.placeTile(5, 5, Infrastructure.Road)
    const fundsBefore = engine.getState().funds
    engine.bulldoze(5, 5)
    expect(engine.getState().funds).toBe(fundsBefore - 1)
  })
})
