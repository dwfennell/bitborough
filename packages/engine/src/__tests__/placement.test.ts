import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap } from '../test-helpers.js'
import { BUILDING_DEFS } from '../buildings-registry.js'
import { TileType, ZoneType, Infrastructure, FailReason } from '@bitborough/core'

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

describe('Duplicate placement', () => {
  test('placing road on existing road costs nothing', () => {
    const engine = Engine.create(createTestMap(32))
    engine.placeTile(5, 5, Infrastructure.Road)
    const fundsBefore = engine.getState().funds
    const result = engine.placeTile(5, 5, Infrastructure.Road)
    expect(result.ok).toBe(true)
    expect(engine.getState().funds).toBe(fundsBefore)
  })

  test('placing power line on existing power line costs nothing', () => {
    const engine = Engine.create(createTestMap(32))
    engine.placeTile(5, 5, Infrastructure.PowerLine)
    const fundsBefore = engine.getState().funds
    const result = engine.placeTile(5, 5, Infrastructure.PowerLine)
    expect(result.ok).toBe(true)
    expect(engine.getState().funds).toBe(fundsBefore)
  })

  test('placing same zone on existing zone is a no-op', () => {
    const engine = Engine.create(createTestMap(10))
    engine.placeZone(5, 5, ZoneType.Residential)
    const result = engine.placeZone(5, 5, ZoneType.Residential)
    expect(result.ok).toBe(true)
  })
})

describe('Building placement', () => {
  test('placing building on zone clears the zone', () => {
    const engine = Engine.create(createTestMap(32))
    engine.placeZone(5, 5, ZoneType.Residential)
    expect(engine.getTile(5, 5).zone).toBe(ZoneType.Residential)

    engine.placeBuilding(5, 5, 'special.park')
    expect(engine.getTile(5, 5).zone).toBe(ZoneType.None)
  })

  test('placing multi-tile building clears all zones in footprint', () => {
    const engine = Engine.create(createTestMap(32))
    // Zone a 4x4 area
    for (let dy = 0; dy < 4; dy++) {
      for (let dx = 0; dx < 4; dx++) {
        engine.placeZone(5 + dx, 5 + dy, ZoneType.Industrial)
      }
    }
    engine.placeBuilding(5, 5, 'power.coal')
    for (let dy = 0; dy < 4; dy++) {
      for (let dx = 0; dx < 4; dx++) {
        expect(engine.getTile(5 + dx, 5 + dy).zone).toBe(ZoneType.None)
      }
    }
  })
})

describe('Building registry', () => {
  test('all zone building defIds are in BUILDING_DEFS', () => {
    expect(BUILDING_DEFS['res.low']).toBeDefined()
    expect(BUILDING_DEFS['com.low']).toBeDefined()
    expect(BUILDING_DEFS['ind.low']).toBeDefined()
  })

  test('all player building defIds are in BUILDING_DEFS', () => {
    expect(BUILDING_DEFS['power.coal']).toBeDefined()
    expect(BUILDING_DEFS['power.nuclear']).toBeDefined()
    expect(BUILDING_DEFS['service.police']).toBeDefined()
    expect(BUILDING_DEFS['service.fire']).toBeDefined()
    expect(BUILDING_DEFS['special.park']).toBeDefined()
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
