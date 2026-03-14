import { describe, test, expect } from 'vitest'
import { ZoneType, DensityLevel } from '@bitborough/core'
import { createTestMap } from '../test-helpers.js'
import { computeDesirability } from '../simulation/desirability.js'

// Helper: blank simulation layers
function makeLayers(size: number) {
  return {
    powerGrid: new Uint8Array(size),
    crimeLevel: new Uint8Array(size),
    fireCoverage: new Uint8Array(size),
    pollutionLevel: new Uint8Array(size),
  }
}

describe('infrastructure gate', () => {
  test('no power → 0 for residential', () => {
    const map = createTestMap(16)
    const { powerGrid, crimeLevel, fireCoverage, pollutionLevel } = makeLayers(16 * 16)
    // powerGrid all zero (no power), road present via infrastructure
    map.infrastructure[5 * 16 + 5] = 0b1 // Road bit
    expect(
      computeDesirability(ZoneType.Residential, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel),
    ).toBe(0)
  })

  test('no road → 0 for residential', () => {
    const map = createTestMap(16)
    const { powerGrid, crimeLevel, fireCoverage, pollutionLevel } = makeLayers(16 * 16)
    powerGrid[5 * 16 + 5] = 1 // powered
    // no road in infrastructure
    expect(
      computeDesirability(ZoneType.Residential, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel),
    ).toBe(0)
  })

  test('power + road → non-zero baseline for residential', () => {
    const map = createTestMap(16)
    const { powerGrid, crimeLevel, fireCoverage, pollutionLevel } = makeLayers(16 * 16)
    powerGrid[5 * 16 + 5] = 1
    map.infrastructure[5 * 16 + 5] = 0b1 // Road
    const d = computeDesirability(ZoneType.Residential, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    expect(d).toBeGreaterThan(0)
    expect(d).toBeLessThanOrEqual(1)
  })

  test('road within 3 tiles (not on tile itself) → non-zero desirability', () => {
    const map = createTestMap(16)
    const { powerGrid, crimeLevel, fireCoverage, pollutionLevel } = makeLayers(16 * 16)
    powerGrid[5 * 16 + 5] = 1
    // Road on adjacent tile (1 tile away), NOT on (5,5) itself
    map.infrastructure[5 * 16 + 6] = 0b1 // Road on (6,5)
    const d = computeDesirability(ZoneType.Residential, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    expect(d).toBeGreaterThan(0) // should get road access bonus from nearby road
  })

  test('road more than 3 tiles away → 0 (no road access)', () => {
    const map = createTestMap(16)
    const { powerGrid, crimeLevel, fireCoverage, pollutionLevel } = makeLayers(16 * 16)
    powerGrid[5 * 16 + 5] = 1
    // Road 4 tiles away (beyond the 3-tile radius)
    map.infrastructure[5 * 16 + 9] = 0b1 // Road on (9,5) — distance 4
    const d = computeDesirability(ZoneType.Residential, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    expect(d).toBe(0) // too far away
  })
})

describe('residential desirability', () => {
  function setup() {
    const map = createTestMap(16)
    const layers = makeLayers(16 * 16)
    // Give tile (5,5) power + road
    layers.powerGrid[5 * 16 + 5] = 1
    map.infrastructure[5 * 16 + 5] = 0b1 // Road
    return { map, ...layers }
  }

  test('baseline (infra only, no services, no pollution) ≈ 0.30', () => {
    const { map, powerGrid, crimeLevel, fireCoverage, pollutionLevel } = setup()
    // crimeLevel is 0 (all zeros), so safety bonus is also active
    // Wait — with crimeLevel=0, we get baseline 0.30 + safety 0.30 = 0.60
    // The "baseline only" test requires crime at max to suppress safety
    crimeLevel[5 * 16 + 5] = 255 // max crime → safety = 0
    const d = computeDesirability(ZoneType.Residential, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    expect(d).toBeCloseTo(0.3, 2)
  })

  test('zero crime adds safety bonus → 0.60 total', () => {
    const { map, powerGrid, crimeLevel, fireCoverage, pollutionLevel } = setup()
    // crimeLevel already 0 → full safety factor
    const d = computeDesirability(ZoneType.Residential, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    // 0.30 baseline + 0.30 safety (crime=0) = 0.60
    expect(d).toBeCloseTo(0.6, 2)
  })

  test('fire coverage adds 0.15', () => {
    const { map, powerGrid, crimeLevel, fireCoverage, pollutionLevel } = setup()
    fireCoverage[5 * 16 + 5] = 1
    const d = computeDesirability(ZoneType.Residential, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    // 0.30 + 0.30 (no crime) + 0.15 fire = 0.75
    expect(d).toBeCloseTo(0.75, 2)
  })

  test('park within 5 tiles adds 0.25', () => {
    const { map, powerGrid, crimeLevel, fireCoverage, pollutionLevel } = setup()
    map.buildings.push({
      id: 'park1',
      defId: 'special.park',
      x: 7,
      y: 5,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 0,
    })
    const d = computeDesirability(ZoneType.Residential, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    // 0.30 + 0.30 + 0.25 = 0.85
    expect(d).toBeCloseTo(0.85, 2)
  })

  test('perfect conditions (no crime, fire, park, no pollution) → 1.0', () => {
    const { map, powerGrid, crimeLevel, fireCoverage, pollutionLevel } = setup()
    fireCoverage[5 * 16 + 5] = 1
    map.buildings.push({
      id: 'park1',
      defId: 'special.park',
      x: 7,
      y: 5,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 0,
    })
    const d = computeDesirability(ZoneType.Residential, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    expect(d).toBeCloseTo(1.0, 2)
  })

  test('max pollution penalises (result ≥ 0)', () => {
    const { map, powerGrid, crimeLevel, fireCoverage, pollutionLevel } = setup()
    pollutionLevel[5 * 16 + 5] = 255
    const d = computeDesirability(ZoneType.Residential, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    // 0.30 + 0.30 (no crime) - 0.30 (max pollution) = 0.30, but clamped ≥ 0
    expect(d).toBeGreaterThanOrEqual(0)
    expect(d).toBeLessThan(0.35)
  })

  test('park outside 5 tiles does not add bonus', () => {
    const { map, powerGrid, crimeLevel, fireCoverage, pollutionLevel } = setup()
    map.buildings.push({
      id: 'park1',
      defId: 'special.park',
      x: 15,
      y: 15, // >5 tiles away
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 0,
    })
    const d = computeDesirability(ZoneType.Residential, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    expect(d).toBeCloseTo(0.6, 2) // no park bonus
  })
})

describe('commercial desirability', () => {
  function setup() {
    const map = createTestMap(16)
    const layers = makeLayers(16 * 16)
    layers.powerGrid[5 * 16 + 5] = 1
    map.infrastructure[5 * 16 + 5] = 0b1 // Road
    return { map, ...layers }
  }

  test('infra only → exactly 0.40', () => {
    const { map, powerGrid, crimeLevel, fireCoverage, pollutionLevel } = setup()
    const d = computeDesirability(ZoneType.Commercial, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    expect(d).toBeCloseTo(0.4, 2)
  })

  test('transit stop within 10 tiles adds 0.35', () => {
    const { map, powerGrid, crimeLevel, fireCoverage, pollutionLevel } = setup()
    map.buildings.push({
      id: 'ts1',
      defId: 'transit.stop',
      x: 8,
      y: 5,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 0,
    })
    const d = computeDesirability(ZoneType.Commercial, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    expect(d).toBeCloseTo(0.75, 2)
  })

  test('3+ residential buildings within 5 tiles adds 0.25', () => {
    const { map, powerGrid, crimeLevel, fireCoverage, pollutionLevel } = setup()
    for (let i = 0; i < 3; i++) {
      map.buildings.push({
        id: `r${i}`,
        defId: 'res.low',
        x: 5 + i,
        y: 6,
        powered: true,
        density: DensityLevel.Low,
        age: 0,
        state: 'active',
        residents: 5,
      })
    }
    const d = computeDesirability(ZoneType.Commercial, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    expect(d).toBeCloseTo(0.65, 2)
  })

  test('transit + residential density → 1.0', () => {
    const { map, powerGrid, crimeLevel, fireCoverage, pollutionLevel } = setup()
    map.buildings.push({
      id: 'ts1',
      defId: 'transit.stop',
      x: 8,
      y: 5,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 0,
    })
    for (let i = 0; i < 3; i++) {
      map.buildings.push({
        id: `r${i}`,
        defId: 'res.low',
        x: 5 + i,
        y: 6,
        powered: true,
        density: DensityLevel.Low,
        age: 0,
        state: 'active',
        residents: 5,
      })
    }
    const d = computeDesirability(ZoneType.Commercial, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    expect(d).toBeCloseTo(1.0, 2)
  })

  test('transit stop >10 tiles away does not add bonus', () => {
    const { map, powerGrid, crimeLevel, fireCoverage, pollutionLevel } = setup()
    map.buildings.push({
      id: 'ts1',
      defId: 'transit.stop',
      x: 15,
      y: 15, // distance 20 from (5,5)
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 0,
    })
    const d = computeDesirability(ZoneType.Commercial, 5, 5, map, powerGrid, crimeLevel, fireCoverage, pollutionLevel)
    expect(d).toBeCloseTo(0.4, 2)
  })
})

describe('industrial desirability', () => {
  test('road + power → 1.0', () => {
    const map = createTestMap(16)
    const layers = makeLayers(16 * 16)
    layers.powerGrid[5 * 16 + 5] = 1
    map.infrastructure[5 * 16 + 5] = 0b1 // Road
    const d = computeDesirability(
      ZoneType.Industrial,
      5,
      5,
      map,
      layers.powerGrid,
      layers.crimeLevel,
      layers.fireCoverage,
      layers.pollutionLevel,
    )
    expect(d).toBe(1.0)
  })

  test('road only (no power) → 0 (infra gate)', () => {
    const map = createTestMap(16)
    const layers = makeLayers(16 * 16)
    map.infrastructure[5 * 16 + 5] = 0b1
    // no power
    const d = computeDesirability(
      ZoneType.Industrial,
      5,
      5,
      map,
      layers.powerGrid,
      layers.crimeLevel,
      layers.fireCoverage,
      layers.pollutionLevel,
    )
    expect(d).toBe(0)
  })

  test('industrial ignores pollution', () => {
    const map = createTestMap(16)
    const layers = makeLayers(16 * 16)
    layers.powerGrid[5 * 16 + 5] = 1
    map.infrastructure[5 * 16 + 5] = 0b1
    layers.pollutionLevel[5 * 16 + 5] = 255 // max pollution — ignored
    const d = computeDesirability(
      ZoneType.Industrial,
      5,
      5,
      map,
      layers.powerGrid,
      layers.crimeLevel,
      layers.fireCoverage,
      layers.pollutionLevel,
    )
    expect(d).toBe(1.0)
  })
})
