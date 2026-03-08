import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap } from '../test-helpers.js'
import { Infrastructure, FailReason, POWER } from '@bitborough/core'

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

  test('power capacity is limited (coal=700 tiles)', () => {
    // Use a large enough map to exceed 700 tiles
    const engine = Engine.create(createTestMap(64), { startingFunds: 500_000 })

    // Place coal plant at (0,0) — occupies 16 tiles of its 700 capacity
    engine.placeBuilding(0, 0, 'power.coal')

    // Fill a long line of power lines — more than 700 tiles total
    // Plant footprint is 16 tiles. We need 700 - 16 = 684 more power line tiles,
    // then the next ones should be unpowered.
    // Place a line of power lines from x=4 along y=0, then snake down.
    // Easier: place a grid of power lines.
    // Let's place power lines row by row, connected.
    let count = 0
    const target = POWER.coalCapacity // 700

    // Fill rows with power lines, connecting each row to the one above
    // Start from y=0, x=4 (adjacent to plant footprint)
    for (let y = 0; y < 64 && count < target + 10; y++) {
      const startX = y === 0 ? 4 : 0
      for (let x = startX; x < 64 && count < target + 10; x++) {
        // Skip plant footprint tiles
        if (x < 4 && y < 4) continue
        engine.placeTile(x, y, Infrastructure.PowerLine)
        count++
      }
    }

    engine.tick()

    // Count powered tiles (excluding plant footprint)
    let poweredCount = 0
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        if (engine.getTile(x, y).powered) poweredCount++
      }
    }

    // Should be exactly the coal capacity (700)
    expect(poweredCount).toBe(POWER.coalCapacity)
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
    expect(engine.getState().funds).toBe(fundsBefore - 3000)
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
