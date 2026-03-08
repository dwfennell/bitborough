import { describe, test, expect } from 'vitest'
import { createTestMap } from '../test-helpers.js'
import { calculateDemand } from '../simulation/demand.js'

describe('Zone demand', () => {
  test('initial residential demand is positive', () => {
    const map = createTestMap(32)
    const demand = calculateDemand(map, 0, 0.07)
    expect(demand.residential).toBeGreaterThan(0)
  })

  test('initial industrial demand is positive', () => {
    const map = createTestMap(32)
    const demand = calculateDemand(map, 0, 0.07)
    expect(demand.industrial).toBeGreaterThan(0)
  })

  test('initial commercial demand starts low', () => {
    const map = createTestMap(32)
    const demand = calculateDemand(map, 0, 0.07)
    // Commercial depends on residential population, so starts near 0
    expect(demand.commercial).toBeLessThanOrEqual(0.1)
  })

  test('high tax rate suppresses residential demand', () => {
    const map = createTestMap(32)
    const demand = calculateDemand(map, 0, 0.20)
    expect(demand.residential).toBeLessThan(0.5)
  })

  test('low tax rate boosts residential demand', () => {
    const map = createTestMap(32)
    const demand = calculateDemand(map, 0, 0.04)
    expect(demand.residential).toBeGreaterThan(0.5)
  })

  test('demand values are clamped to [-1, 1]', () => {
    const map = createTestMap(32)
    const demand = calculateDemand(map, 0, 0.07)
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
    const highTax = calculateDemand(map, 0, 0.50)
    expect(highTax.residential).toBeGreaterThanOrEqual(-1)
    expect(highTax.residential).toBeLessThanOrEqual(1)
    expect(highTax.industrial).toBeGreaterThanOrEqual(-1)
    expect(highTax.industrial).toBeLessThanOrEqual(1)

    // Very low (zero) tax should not exceed bounds
    const lowTax = calculateDemand(map, 0, 0.00)
    expect(lowTax.residential).toBeGreaterThanOrEqual(-1)
    expect(lowTax.residential).toBeLessThanOrEqual(1)
    expect(lowTax.industrial).toBeGreaterThanOrEqual(-1)
    expect(lowTax.industrial).toBeLessThanOrEqual(1)
  })

  test('commercial demand increases with population', () => {
    const map = createTestMap(32)
    const lowPop = calculateDemand(map, 0, 0.07)
    const highPop = calculateDemand(map, 1000, 0.07)
    expect(highPop.commercial).toBeGreaterThan(lowPop.commercial)
  })

  test('commercial demand caps at reasonable level', () => {
    const map = createTestMap(32)
    const demand = calculateDemand(map, 100_000, 0.07)
    // cBase = min(100000/500, 0.5) = 0.5; taxModifier = 1.0
    expect(demand.commercial).toBe(0.5)
  })

  test('industrial demand is less sensitive to tax than residential', () => {
    const map = createTestMap(32)
    const neutralTax = 0.07

    // At neutral tax
    const neutral = calculateDemand(map, 0, neutralTax)
    // At high tax
    const high = calculateDemand(map, 0, 0.20)

    const rDrop = neutral.residential - high.residential
    const iDrop = neutral.industrial - high.industrial

    // Industrial should drop less than residential
    expect(iDrop).toBeLessThan(rDrop)
  })
})
