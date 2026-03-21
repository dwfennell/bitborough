import { describe, test, expect } from 'vitest'
import { BuildingIndex } from '../building-index.js'
import { createTestMap } from '../test-helpers.js'
import { DensityLevel } from '@bitborough/core'

describe('BuildingIndex', () => {
  test('get returns building at origin tile', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 5, y: 5, powered: false,
      density: DensityLevel.Low, age: 0, state: 'active', residents: 0,
    })
    const idx = new BuildingIndex(map)
    expect(idx.get(5, 5)?.id).toBe('b1')
  })

  test('get returns building for non-origin footprint tile', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1', defId: 'power.diesel', x: 5, y: 5, powered: false,
      density: DensityLevel.Low, age: 0, state: 'active', residents: 0,
    })
    const idx = new BuildingIndex(map)
    // power.diesel is 2x2 — all footprint tiles should return the building
    expect(idx.get(5, 5)?.id).toBe('b1')
    expect(idx.get(6, 5)?.id).toBe('b1')
    expect(idx.get(5, 6)?.id).toBe('b1')
    expect(idx.get(6, 6)?.id).toBe('b1')
  })

  test('get returns undefined for empty tile', () => {
    const map = createTestMap(32)
    const idx = new BuildingIndex(map)
    expect(idx.get(5, 5)).toBeUndefined()
  })

  test('has returns true for occupied tile', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 5, y: 5, powered: false,
      density: DensityLevel.Low, age: 0, state: 'active', residents: 0,
    })
    const idx = new BuildingIndex(map)
    expect(idx.has(5, 5)).toBe(true)
    expect(idx.has(6, 5)).toBe(false)
  })

  test('hasIdx works with linear index', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 5, y: 5, powered: false,
      density: DensityLevel.Low, age: 0, state: 'active', residents: 0,
    })
    const idx = new BuildingIndex(map)
    expect(idx.hasIdx(5 * 32 + 5)).toBe(true)
    expect(idx.hasIdx(0)).toBe(false)
  })
})
