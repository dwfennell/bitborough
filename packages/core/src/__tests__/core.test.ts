import { describe, test, expect } from 'vitest'
import {
  TileType,
  ZoneType,
  Infrastructure,
  BuildingCategory,
  DensityLevel,
  SimSpeed,
  FailReason,
  MAP_SIZES,
  createEmptyMap,
  DEFAULTS,
  COSTS,
  MAINTENANCE,
  POWER,
} from '../index.js'

describe('TileType enum', () => {
  test('has expected members', () => {
    expect(TileType.Grass).toBe(0)
    expect(TileType.Water).toBeDefined()
    expect(TileType.Trees).toBeDefined()
  })
})

describe('ZoneType enum', () => {
  test('None is 0', () => {
    expect(ZoneType.None).toBe(0)
  })

  test('has RCI zones', () => {
    expect(ZoneType.Residential).toBeDefined()
    expect(ZoneType.Commercial).toBeDefined()
    expect(ZoneType.Industrial).toBeDefined()
  })
})

describe('Infrastructure bit flags', () => {
  test('None is 0', () => {
    expect(Infrastructure.None).toBe(0)
  })

  test('flags are distinct powers of 2', () => {
    const flags = [
      Infrastructure.Road,
      Infrastructure.PowerLine,
      Infrastructure.Rail,
      Infrastructure.Pipe,
      Infrastructure.PavedRoad,
    ]
    for (let i = 0; i < flags.length; i++) {
      for (let j = i + 1; j < flags.length; j++) {
        expect(flags[i]! & flags[j]!).toBe(0)
      }
    }
  })

  test('flags can be combined with bitwise OR', () => {
    const roadAndPower = Infrastructure.Road | Infrastructure.PowerLine
    expect(roadAndPower & Infrastructure.Road).toBeTruthy()
    expect(roadAndPower & Infrastructure.PowerLine).toBeTruthy()
    expect(roadAndPower & Infrastructure.Rail).toBeFalsy()
  })
})

describe('BuildingCategory enum', () => {
  test('has all expected categories', () => {
    expect(BuildingCategory.Residential).toBeDefined()
    expect(BuildingCategory.Commercial).toBeDefined()
    expect(BuildingCategory.Industrial).toBeDefined()
    expect(BuildingCategory.Special).toBeDefined()
  })
})

describe('DensityLevel enum', () => {
  test('Low < Medium < High', () => {
    expect(DensityLevel.Low).toBeLessThan(DensityLevel.Medium)
    expect(DensityLevel.Medium).toBeLessThan(DensityLevel.High)
  })
})

describe('SimSpeed enum', () => {
  test('Paused is 0', () => {
    expect(SimSpeed.Paused).toBe(0)
  })

  test('speeds increase', () => {
    expect(SimSpeed.Slow).toBeLessThan(SimSpeed.Normal)
    expect(SimSpeed.Normal).toBeLessThan(SimSpeed.Fast)
    expect(SimSpeed.Fast).toBeLessThan(SimSpeed.Turbo)
  })
})

describe('FailReason enum', () => {
  test('has expected members', () => {
    expect(FailReason.InsufficientFunds).toBeDefined()
    expect(FailReason.InvalidLocation).toBeDefined()
    expect(FailReason.Occupied).toBeDefined()
  })
})

describe('MAP_SIZES', () => {
  test('contains expected sizes in ascending order', () => {
    expect(MAP_SIZES).toEqual([32, 64, 128, 256, 512])
    for (let i = 1; i < MAP_SIZES.length; i++) {
      expect(MAP_SIZES[i]).toBeGreaterThan(MAP_SIZES[i - 1]!)
    }
  })
})

describe('createEmptyMap', () => {
  test('creates map with correct dimensions', () => {
    const map = createEmptyMap(64, 32, { name: 'Test', seed: 1, createdAt: '' })
    expect(map.width).toBe(64)
    expect(map.height).toBe(32)
  })

  test('typed arrays have correct length', () => {
    const map = createEmptyMap(8, 8, { name: 'Test', seed: 1, createdAt: '' })
    const size = 64
    expect(map.terrain.length).toBe(size)
    expect(map.zones.length).toBe(size)
    expect(map.infrastructure.length).toBe(size)
    expect(map.connections.length).toBe(size)
    expect(map.elevation.length).toBe(size)
  })

  test('starts with empty buildings array', () => {
    const map = createEmptyMap(8, 8, { name: 'Test', seed: 1, createdAt: '' })
    expect(map.buildings).toEqual([])
  })

  test('terrain is all Grass (0) by default', () => {
    const map = createEmptyMap(4, 4, { name: 'Test', seed: 1, createdAt: '' })
    for (let i = 0; i < map.terrain.length; i++) {
      expect(map.terrain[i]).toBe(TileType.Grass)
    }
  })

  test('preserves meta', () => {
    const meta = { name: 'My City', seed: 42, preset: 'island', createdAt: '2026-01-01' }
    const map = createEmptyMap(8, 8, meta)
    expect(map.meta).toEqual(meta)
  })
})

describe('DEFAULTS', () => {
  test('taxRate is between 0 and 1', () => {
    expect(DEFAULTS.taxRate).toBeGreaterThan(0)
    expect(DEFAULTS.taxRate).toBeLessThan(1)
  })

  test('startingFunds exist for all MAP_SIZES', () => {
    for (const size of MAP_SIZES) {
      expect(DEFAULTS.startingFunds[size]).toBeGreaterThan(0)
    }
  })

  test('startingFunds increase with map size', () => {
    for (let i = 1; i < MAP_SIZES.length; i++) {
      expect(DEFAULTS.startingFunds[MAP_SIZES[i]!]).toBeGreaterThanOrEqual(DEFAULTS.startingFunds[MAP_SIZES[i - 1]!]!)
    }
  })
})

describe('COSTS', () => {
  test('all costs are positive', () => {
    for (const [, v] of Object.entries(COSTS)) {
      expect(v).toBeGreaterThan(0)
    }
  })
})

describe('MAINTENANCE', () => {
  test('all maintenance values are positive', () => {
    for (const [, v] of Object.entries(MAINTENANCE)) {
      expect(v).toBeGreaterThan(0)
    }
  })
})

describe('POWER', () => {
  test('capacities increase: diesel < coal < nuclear', () => {
    expect(POWER.dieselCapacity).toBeLessThan(POWER.coalCapacity)
    expect(POWER.coalCapacity).toBeLessThan(POWER.nuclearCapacity)
  })
})
