import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { BuildingIndex } from '../building-index.js'
import { createTestMap } from '../test-helpers.js'
import { Infrastructure, FailReason, POWER, ZoneType, DensityLevel } from '@bitborough/core'

describe('Power propagation', () => {
  test('coal power plant powers adjacent tiles through power lines', () => {
    // Place coal plant at (0,0) on a 32x32 map, then power lines extending east
    const engine = Engine.create(createTestMap(32), { startingFunds: 50_000 })

    // Place coal plant at (0,0) — 4x4 footprint covers (0,0)-(3,3)
    const placeResult = engine.placeBuilding(0, 0, 'power.coal')
    expect(placeResult.ok).toBe(true)

    // Place power lines from (4,0) to (6,0)
    engine.placeTile(4, 0, Infrastructure.PowerLine)
    engine.placeTile(5, 0, Infrastructure.PowerLine)
    engine.placeTile(6, 0, Infrastructure.PowerLine)

    // Run a tick to propagate power
    engine.tick()

    // Power plant footprint tiles should be powered
    expect(engine.getTile(0, 0).powered).toBe(true)
    expect(engine.getTile(3, 3).powered).toBe(true)

    // Power line tiles should be powered
    expect(engine.getTile(4, 0).powered).toBe(true)
    expect(engine.getTile(5, 0).powered).toBe(true)
    expect(engine.getTile(6, 0).powered).toBe(true)
  })

  test('tiles beyond power line gap are NOT powered', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 50_000 })

    // Place coal plant at (0,0)
    engine.placeBuilding(0, 0, 'power.coal')

    // Place power lines with a gap: (4,0), (5,0), skip (6,0), (7,0)
    engine.placeTile(4, 0, Infrastructure.PowerLine)
    engine.placeTile(5, 0, Infrastructure.PowerLine)
    // gap at (6,0)
    engine.placeTile(7, 0, Infrastructure.PowerLine)

    engine.tick()

    // Connected tiles should be powered
    expect(engine.getTile(4, 0).powered).toBe(true)
    expect(engine.getTile(5, 0).powered).toBe(true)

    // Disconnected tiles should NOT be powered
    expect(engine.getTile(7, 0).powered).toBe(false)
  })

  test('roads conduct power', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 50_000 })

    // Place coal plant at (0,0)
    engine.placeBuilding(0, 0, 'power.coal')

    // Place roads extending east from plant
    engine.placeTile(4, 0, Infrastructure.Road)
    engine.placeTile(5, 0, Infrastructure.Road)
    engine.placeTile(6, 0, Infrastructure.Road)

    engine.tick()

    // Road tiles should be powered (roads are conductors)
    expect(engine.getTile(4, 0).powered).toBe(true)
    expect(engine.getTile(5, 0).powered).toBe(true)
    expect(engine.getTile(6, 0).powered).toBe(true)
  })

  test('power capacity only counts building tiles, not roads or power lines', () => {
    // Diesel plant: 2x2 footprint (4 building tiles), capacity 50
    // Place it on a 32x32 map with roads and zone buildings
    const engine = Engine.create(createTestMap(32), { startingFunds: 500_000 })

    // Place diesel plant at (0,0) — 2x2 footprint
    engine.placeBuilding(0, 0, 'power.diesel')

    // Connect roads east from the plant (x=2..31 along y=0) — 30 road tiles
    for (let x = 2; x < 32; x++) {
      engine.placeTile(x, 0, Infrastructure.Road)
    }

    // Place zone tiles with buildings along y=1, adjacent to roads
    // Each is a 1x1 building tile that should count against capacity
    // We need more than (50 - 4) = 46 zone buildings to exceed capacity
    const state = engine.getState()
    for (let x = 2; x < 32; x++) {
      // Zone the tile
      state.map.zones[1 * 32 + x] = ZoneType.Residential
      // Manually add a 1x1 building on each zone tile
      state.map.buildings.push({
        id: `r${x}`,
        defId: 'res.low',
        x,
        y: 1,
        powered: false,
        density: DensityLevel.Low,
        age: 0,
        state: 'active',
        residents: 0,
      })
    }

    // Also add a second row of roads and buildings (y=2, y=3)
    for (let x = 2; x < 32; x++) {
      engine.placeTile(x, 2, Infrastructure.Road)
      state.map.zones[3 * 32 + x] = ZoneType.Residential
      state.map.buildings.push({
        id: `r2${x}`,
        defId: 'res.low',
        x,
        y: 3,
        powered: false,
        density: DensityLevel.Low,
        age: 0,
        state: 'active',
        residents: 0,
      })
    }

    // Total building tiles: 4 (plant) + 30 (row y=1) + 30 (row y=3) = 64
    // Capacity is 50, so 50 building tiles should be powered, rest not
    // Total road tiles: 30 (y=0) + 30 (y=2) = 60 — all should be powered

    // Rebuild the BuildingIndex so power propagation sees the manually-added buildings
    ;(engine as any).state.bldIdx = new BuildingIndex(state.map)

    engine.tick()

    // All road tiles should be powered (roads don't consume capacity)
    for (let x = 2; x < 32; x++) {
      expect(engine.getTile(x, 0).powered).toBe(true)
      expect(engine.getTile(x, 2).powered).toBe(true)
    }

    // Count powered building tiles (plant + zone buildings)
    let poweredBuildingTiles = 0
    // Plant footprint
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        if (engine.getTile(dx, dy).powered) poweredBuildingTiles++
      }
    }
    // Zone buildings on y=1 and y=3
    for (let x = 2; x < 32; x++) {
      if (engine.getTile(x, 1).powered) poweredBuildingTiles++
      if (engine.getTile(x, 3).powered) poweredBuildingTiles++
    }

    // Exactly 50 building tiles should be powered (diesel capacity)
    expect(poweredBuildingTiles).toBe(POWER.dieselCapacity)
  })

  test('bulldozing a power line disconnects downstream tiles', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 50_000 })

    // Place coal plant at (0,0)
    engine.placeBuilding(0, 0, 'power.coal')

    // Place power lines: (4,0) -> (5,0) -> (6,0) -> (7,0)
    engine.placeTile(4, 0, Infrastructure.PowerLine)
    engine.placeTile(5, 0, Infrastructure.PowerLine)
    engine.placeTile(6, 0, Infrastructure.PowerLine)
    engine.placeTile(7, 0, Infrastructure.PowerLine)

    engine.tick()

    // All should be powered
    expect(engine.getTile(7, 0).powered).toBe(true)

    // Bulldoze the middle power line at (5,0)
    engine.bulldoze(5, 0)

    engine.tick()

    // Upstream tiles still powered
    expect(engine.getTile(4, 0).powered).toBe(true)

    // Downstream tiles disconnected — not powered
    expect(engine.getTile(6, 0).powered).toBe(false)
    expect(engine.getTile(7, 0).powered).toBe(false)
  })

  test('a power plant powers its own footprint tiles', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 50_000 })

    // Place coal plant at (0,0) — 4x4 footprint
    engine.placeBuilding(0, 0, 'power.coal')

    engine.tick()

    // All 16 footprint tiles should be powered
    for (let dy = 0; dy < 4; dy++) {
      for (let dx = 0; dx < 4; dx++) {
        expect(engine.getTile(dx, dy).powered).toBe(true)
      }
    }
  })
})

describe('placeBuilding', () => {
  test('placeBuilding succeeds on valid location', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 50_000 })
    const result = engine.placeBuilding(0, 0, 'power.coal')
    expect(result.ok).toBe(true)
  })

  test('placeBuilding deducts cost', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 50_000 })
    const fundsBefore = engine.getState().funds
    engine.placeBuilding(0, 0, 'power.coal')
    expect(engine.getState().funds).toBe(fundsBefore - 2000)
  })

  test('placeBuilding fails with insufficient funds', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100 })
    const result = engine.placeBuilding(0, 0, 'power.coal')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe(FailReason.InsufficientFunds)
  })

  test('placeBuilding fails if footprint goes out of bounds', () => {
    const engine = Engine.create(createTestMap(10), { startingFunds: 50_000 })
    // Coal plant is 4x4, placing at (8,8) would go out of bounds on a 10x10 map
    const result = engine.placeBuilding(8, 8, 'power.coal')
    expect(result.ok).toBe(false)
  })

  test('placeBuilding fails if footprint overlaps water', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 50_000 })
    const state = engine.getState()
    // Set one tile in the footprint to water
    state.map.terrain[1 * 32 + 1] = 1 // TileType.Water = 1
    const result = engine.placeBuilding(0, 0, 'power.coal')
    expect(result.ok).toBe(false)
  })

  test('placeBuilding fails if footprint overlaps existing building', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 50_000 })
    // Place first building
    engine.placeBuilding(0, 0, 'power.coal')
    // Try to place second building overlapping the first
    const result = engine.placeBuilding(2, 2, 'power.coal')
    expect(result.ok).toBe(false)
  })

  test('placeBuilding with unknown defId fails', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 50_000 })
    const result = engine.placeBuilding(0, 0, 'nonexistent')
    expect(result.ok).toBe(false)
  })

  test('placeBuilding adds building to map.buildings', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 50_000 })
    engine.placeBuilding(0, 0, 'power.coal')
    const buildings = engine.getState().map.buildings
    expect(buildings).toHaveLength(1)
    expect(buildings[0]!.defId).toBe('power.coal')
    expect(buildings[0]!.x).toBe(0)
    expect(buildings[0]!.y).toBe(0)
  })
})
