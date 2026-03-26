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

describe('Infrastructure clears zones', () => {
  test('placing road on zoned tile clears the zone', () => {
    const engine = Engine.create(createTestMap(32))
    engine.placeZone(5, 5, ZoneType.Residential)
    expect(engine.getTile(5, 5).zone).toBe(ZoneType.Residential)

    engine.placeTile(5, 5, Infrastructure.Road)
    expect(engine.getTile(5, 5).zone).toBe(ZoneType.None)
  })

  test('placing power line on zoned tile clears the zone', () => {
    const engine = Engine.create(createTestMap(32))
    engine.placeZone(5, 5, ZoneType.Commercial)
    expect(engine.getTile(5, 5).zone).toBe(ZoneType.Commercial)

    engine.placeTile(5, 5, Infrastructure.PowerLine)
    expect(engine.getTile(5, 5).zone).toBe(ZoneType.None)
  })

  test('placing road on unzoned tile leaves zone as None', () => {
    const engine = Engine.create(createTestMap(32))
    engine.placeTile(5, 5, Infrastructure.Road)
    expect(engine.getTile(5, 5).zone).toBe(ZoneType.None)
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

describe('Building placement blocks on infrastructure', () => {
  test('placing building on road fails with Occupied', () => {
    const engine = Engine.create(createTestMap(32))
    engine.placeTile(5, 5, Infrastructure.Road)
    const result = engine.placeBuilding(5, 5, 'special.park')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe(FailReason.Occupied)
  })

  test('placing building on power line fails with Occupied', () => {
    const engine = Engine.create(createTestMap(32))
    engine.placeTile(5, 5, Infrastructure.PowerLine)
    const result = engine.placeBuilding(5, 5, 'special.park')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe(FailReason.Occupied)
  })

  test('placing multi-tile building fails if any footprint tile has infrastructure', () => {
    const engine = Engine.create(createTestMap(32))
    // Place a road at (6, 6), inside the 3x3 footprint of police at (5, 5)
    engine.placeTile(6, 6, Infrastructure.Road)
    const result = engine.placeBuilding(5, 5, 'service.police')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe(FailReason.Occupied)
  })

  test('placing building on empty tile still succeeds', () => {
    const engine = Engine.create(createTestMap(32))
    const result = engine.placeBuilding(5, 5, 'special.park')
    expect(result.ok).toBe(true)
  })

  test('small police kiosk can be placed', () => {
    const engine = Engine.create(createTestMap(32))
    const result = engine.placeBuilding(5, 5, 'service.police.small')
    expect(result.ok).toBe(true)
    expect(engine.getState().map.buildings.some((b) => b.defId === 'service.police.small')).toBe(true)
  })

  test('small fire substation can be placed', () => {
    const engine = Engine.create(createTestMap(32))
    const result = engine.placeBuilding(5, 5, 'service.fire.small')
    expect(result.ok).toBe(true)
    expect(engine.getState().map.buildings.some((b) => b.defId === 'service.fire.small')).toBe(true)
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
    expect(BUILDING_DEFS['service.police.small']).toBeDefined()
    expect(BUILDING_DEFS['service.fire.small']).toBeDefined()
    expect(BUILDING_DEFS['special.park']).toBeDefined()
  })

  test('small police kiosk is a 1x1 building with correct cost', () => {
    const def = BUILDING_DEFS['service.police.small']!
    expect(def.size).toEqual({ w: 1, h: 1 })
    expect(def.cost).toBe(50)
    expect(def.maintenanceCost).toBe(10)
  })

  test('small fire substation is a 1x1 building with correct cost', () => {
    const def = BUILDING_DEFS['service.fire.small']!
    expect(def.size).toEqual({ w: 1, h: 1 })
    expect(def.cost).toBe(60)
    expect(def.maintenanceCost).toBe(12)
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

  test('bulldozes multi-tile building from non-origin tile', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1 })
    engine.placeBuilding(5, 5, 'power.diesel')
    expect(engine.getState().map.buildings.length).toBe(1)

    const result = engine.bulldoze(6, 5) // non-origin tile
    expect(result.ok).toBe(true)
    expect(engine.getState().map.buildings.length).toBe(0)

    // All footprint tiles cleared
    for (const [x, y] of [[5, 5], [6, 5], [5, 6], [6, 6]]) {
      const tile = engine.getTile(x, y)
      expect(tile.infrastructure).toBe(0)
      expect(tile.zone).toBe(0)
    }
  })
})
