import { describe, test, expect } from 'vitest'
import { createTestMap } from '../test-helpers.js'
import { calculateDemand } from '../simulation/demand.js'
import { DensityLevel } from '@bitborough/core'

describe('Zone demand', () => {
  test('initial residential demand is positive', () => {
    const map = createTestMap(32)
    const demand = calculateDemand(map, 0.07)
    expect(demand.residential).toBeGreaterThan(0)
  })

  test('initial industrial demand is positive', () => {
    const map = createTestMap(32)
    const demand = calculateDemand(map, 0.07)
    expect(demand.industrial).toBeGreaterThan(0)
  })

  test('initial commercial demand starts low', () => {
    const map = createTestMap(32)
    const demand = calculateDemand(map, 0.07)
    // Commercial depends on residential capacity, so starts near 0 on empty map
    expect(demand.commercial).toBeLessThanOrEqual(0.1)
  })

  test('high tax rate suppresses residential demand', () => {
    const map = createTestMap(32)
    const demand = calculateDemand(map, 0.20)
    expect(demand.residential).toBeLessThan(0.5)
  })

  test('low tax rate boosts residential demand', () => {
    const map = createTestMap(32)
    const demand = calculateDemand(map, 0.04)
    expect(demand.residential).toBeGreaterThan(0.5)
  })

  test('demand values are clamped to [-1, 1]', () => {
    const map = createTestMap(32)
    const demand = calculateDemand(map, 0.07)
    expect(demand.residential).toBeGreaterThanOrEqual(-1)
    expect(demand.residential).toBeLessThanOrEqual(1)
    expect(demand.commercial).toBeGreaterThanOrEqual(-1)
    expect(demand.commercial).toBeLessThanOrEqual(1)
    expect(demand.industrial).toBeGreaterThanOrEqual(-1)
    expect(demand.industrial).toBeLessThanOrEqual(1)
  })

  test('clamping works with extreme tax rates', () => {
    const map = createTestMap(32)
    // Very high tax rate should not exceed bounds
    const highTax = calculateDemand(map, 0.50)
    expect(highTax.residential).toBeGreaterThanOrEqual(-1)
    expect(highTax.residential).toBeLessThanOrEqual(1)
    expect(highTax.industrial).toBeGreaterThanOrEqual(-1)
    expect(highTax.industrial).toBeLessThanOrEqual(1)

    // Very low (zero) tax should not exceed bounds
    const lowTax = calculateDemand(map, 0.00)
    expect(lowTax.residential).toBeGreaterThanOrEqual(-1)
    expect(lowTax.residential).toBeLessThanOrEqual(1)
    expect(lowTax.industrial).toBeGreaterThanOrEqual(-1)
    expect(lowTax.industrial).toBeLessThanOrEqual(1)
  })

  test('commercial demand increases with more residential capacity', () => {
    const map = createTestMap(32)
    const lowCap = calculateDemand(map, 0.07)

    // Add residential buildings to raise capacity
    for (let x = 0; x < 10; x++) {
      map.buildings.push({
        id: `r${x}`, defId: 'res.low', x, y: 0,
        powered: true, density: DensityLevel.Low, age: 0, state: 'active',
        residents: 0,
      })
    }
    const highCap = calculateDemand(map, 0.07)
    expect(highCap.commercial).toBeGreaterThan(lowCap.commercial)
  })

  test('commercial demand caps at reasonable level', () => {
    const map = createTestMap(32)
    // Need enough capacity: cap is 0.6, formula is totalResCap / 500
    // To hit 0.6 cap we need capacity >= 300 → 30 buildings × 10 capacity each
    for (let x = 0; x < 30; x++) {
      map.buildings.push({
        id: `r${x}`, defId: 'res.low', x, y: x < 30 ? x : 0,
        powered: true, density: DensityLevel.Low, age: 0, state: 'active',
        residents: 0,
      })
    }
    const demand = calculateDemand(map, 0.07)
    // cBase = min(300/500, 0.6) = 0.6; taxModifier = 1.0
    expect(demand.commercial).toBe(0.6)
  })

  test('industrial demand is less sensitive to tax than residential', () => {
    const map = createTestMap(32)
    const neutralTax = 0.07

    // At neutral tax
    const neutral = calculateDemand(map, neutralTax)
    // At high tax
    const high = calculateDemand(map, 0.20)

    const rDrop = neutral.residential - high.residential
    const iDrop = neutral.industrial - high.industrial

    // Industrial should drop less than residential
    expect(iDrop).toBeLessThan(rDrop)
  })

  test('commercial demand uses total residential capacity, not actual population', () => {
    const map = createTestMap(32)
    // Add residential buildings with capacity but residents=0 (not yet filled)
    for (let x = 0; x < 5; x++) {
      map.buildings.push({
        id: `r${x}`, defId: 'res.low', x, y: 0,
        powered: true, density: DensityLevel.Low, age: 0, state: 'active',
        residents: 0,  // empty!
      })
    }
    // 5 × res.low capacity=10 = 50 total capacity
    const demand = calculateDemand(map, 0.07)
    expect(demand.commercial).toBeGreaterThan(0)  // should be non-zero despite 0 actual residents
  })
})
