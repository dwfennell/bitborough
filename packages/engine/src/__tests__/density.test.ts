import { describe, test, expect } from 'vitest'
import { Infrastructure, BuildingCategory, DensityLevel } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import { createTestMap } from '../test-helpers.js'
import { PRNG } from '../prng.js'
import {
  cityCenter,
  hasNearbyPavedRoad,
  hasNearbyTransitStop,
  upgradeProb,
  mediumRadius,
  hasCriticalMass,
  updateDensity,
} from '../simulation/density.js'

describe('PavedRoad infrastructure', () => {
  test('PavedRoad is a distinct bit flag', () => {
    expect(Infrastructure.PavedRoad).toBeDefined()
    expect(Infrastructure.PavedRoad & Infrastructure.Road).toBe(0) // separate bits
  })

  test('a paved road tile has both Road and PavedRoad flags', () => {
    const pavedRoadTile = Infrastructure.Road | Infrastructure.PavedRoad
    expect(pavedRoadTile & Infrastructure.Road).toBeTruthy()
    expect(pavedRoadTile & Infrastructure.PavedRoad).toBeTruthy()
  })
})

describe('Task 3: medium/high building definitions', () => {
  test('BUILDING_DEFS[res.med] exists with density === DensityLevel.Medium', () => {
    expect(BUILDING_DEFS['res.med']).toBeDefined()
    expect(BUILDING_DEFS['res.med']!.density).toBe(DensityLevel.Medium)
  })

  test('BUILDING_DEFS[res.med.b] has size { w: 2, h: 1 }', () => {
    expect(BUILDING_DEFS['res.med.b']).toBeDefined()
    expect(BUILDING_DEFS['res.med.b']!.size).toEqual({ w: 2, h: 1 })
  })

  test('BUILDING_DEFS[res.high] has density === DensityLevel.High and size { w: 2, h: 2 }', () => {
    expect(BUILDING_DEFS['res.high']).toBeDefined()
    expect(BUILDING_DEFS['res.high']!.density).toBe(DensityLevel.High)
    expect(BUILDING_DEFS['res.high']!.size).toEqual({ w: 2, h: 2 })
  })

  test('BUILDING_DEFS[ind.high] has fewer jobs than ind.low and more taxValue', () => {
    const indLow = BUILDING_DEFS['ind.low']!
    const indHigh = BUILDING_DEFS['ind.high']!
    expect(indHigh.jobs).toBeLessThan(indLow.jobs)
    expect(indHigh.taxValue).toBeGreaterThan(indLow.taxValue)
  })

  test('BUILDING_DEFS[transit.stop] has size { w: 2, h: 2 } and category === BuildingCategory.Special', () => {
    expect(BUILDING_DEFS['transit.stop']).toBeDefined()
    expect(BUILDING_DEFS['transit.stop']!.size).toEqual({ w: 2, h: 2 })
    expect(BUILDING_DEFS['transit.stop']!.category).toBe(BuildingCategory.Special)
  })
})

describe('density helpers', () => {
  test('cityCenter returns center of single building', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 10, y: 15,
      powered: true, density: 0, age: 0, state: 'active',
    })
    const { cx, cy } = cityCenter(map)
    expect(cx).toBe(10)
    expect(cy).toBe(15)
  })

  test('cityCenter averages two buildings', () => {
    const map = createTestMap(32)
    map.buildings.push(
      { id: 'b1', defId: 'res.low', x: 0, y: 0, powered: true, density: 0, age: 0, state: 'active' },
      { id: 'b2', defId: 'res.low', x: 10, y: 10, powered: true, density: 0, age: 0, state: 'active' },
    )
    const { cx, cy } = cityCenter(map)
    expect(cx).toBe(5)
    expect(cy).toBe(5)
  })

  test('hasNearbyPavedRoad returns true when paved road within 3 tiles', () => {
    const map = createTestMap(32)
    map.infrastructure[5 * map.width + 10] = Infrastructure.Road | Infrastructure.PavedRoad
    expect(hasNearbyPavedRoad(map, 10, 7)).toBe(true)  // 2 tiles away
  })

  test('hasNearbyPavedRoad returns false for unpaved road', () => {
    const map = createTestMap(32)
    map.infrastructure[5 * map.width + 10] = Infrastructure.Road  // dirt only
    expect(hasNearbyPavedRoad(map, 10, 7)).toBe(false)
  })

  test('hasNearbyTransitStop returns true when transit stop within 10 tiles', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'ts1', defId: 'transit.stop', x: 5, y: 5,
      powered: true, density: 0, age: 0, state: 'active',
    })
    expect(hasNearbyTransitStop(map, 10, 5)).toBe(true)  // 5 tiles away
  })

  test('hasNearbyTransitStop returns false when transit stop > 10 tiles away', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'ts1', defId: 'transit.stop', x: 0, y: 0,
      powered: true, density: 0, age: 0, state: 'active',
    })
    expect(hasNearbyTransitStop(map, 15, 0)).toBe(false)  // 15 tiles away
  })

  test('upgradeProb decreases with distance', () => {
    const near = upgradeProb(1.0, 2, 10)
    const far = upgradeProb(1.0, 8, 10)
    expect(near).toBeGreaterThan(far)
  })

  test('upgradeProb scales with demand', () => {
    const highDemand = upgradeProb(0.8, 5, 10)
    const lowDemand = upgradeProb(0.2, 5, 10)
    expect(highDemand).toBeGreaterThan(lowDemand)
  })

  test('mediumRadius starts at 5 for small population', () => {
    expect(mediumRadius(0)).toBe(5)
    expect(mediumRadius(100)).toBeCloseTo(5.1, 1)
  })

  test('mediumRadius caps at 30 for large population', () => {
    expect(mediumRadius(50_000)).toBe(30)
    expect(mediumRadius(1_000_000)).toBe(30)
  })

  test('hasCriticalMass returns false when no medium/high neighbors', () => {
    const map = createTestMap(32)
    // Only low-density neighbors
    map.buildings.push(
      { id: 'b1', defId: 'res.low', x: 9, y: 10, powered: true, density: 0, age: 0, state: 'active' },
      { id: 'b2', defId: 'res.low', x: 11, y: 10, powered: true, density: 0, age: 0, state: 'active' },
    )
    expect(hasCriticalMass(map, 10, 10)).toBe(false)
  })

  test('hasCriticalMass returns true when majority of neighbors are medium density', () => {
    const map = createTestMap(32)
    // Fill all cells in the Manhattan-distance-3 diamond with medium buildings.
    // hasCriticalMass counts 24 cells in the diamond; placing a building in every
    // cell gives ratio 24/24 = 1.0, well above the 0.5 threshold.
    const range = 3
    let id = 0
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        if (dx === 0 && dy === 0) continue
        if (Math.abs(dx) + Math.abs(dy) > range) continue
        map.buildings.push({
          id: `m${id++}`, defId: 'res.med', x: 10 + dx, y: 10 + dy,
          powered: true, density: 1, age: 0, state: 'active',
        })
      }
    }
    expect(hasCriticalMass(map, 10, 10)).toBe(true)
  })
})

describe('Low→Medium upgrade', () => {
  test('low building without paved road does not upgrade', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 10, y: 10,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active',
    })
    // Only dirt road nearby
    map.infrastructure[10 * map.width + 10] = Infrastructure.Road
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGrid = new Uint8Array(map.width * map.height)
    // Run many iterations — should never upgrade
    for (let i = 0; i < 500; i++) {
      updateDensity(map, powerGrid, demand, 5000, prng, { value: 100 })
    }
    expect(map.buildings[0]!.state).toBe('active')
    expect(map.buildings[0]!.defId).toBe('res.low')
  })

  test('low building without sufficient population does not upgrade', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 10, y: 10,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active',
    })
    // Paved road nearby
    map.infrastructure[10 * map.width + 10] = Infrastructure.Road | Infrastructure.PavedRoad
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGrid = new Uint8Array(map.width * map.height)
    // Population below threshold (499)
    for (let i = 0; i < 500; i++) {
      updateDensity(map, powerGrid, demand, 499, prng, { value: 100 })
    }
    expect(map.buildings[0]!.state).toBe('active')
    expect(map.buildings[0]!.defId).toBe('res.low')
  })

  test('low building near paved road with sufficient population eventually upgrades', () => {
    const map = createTestMap(32)
    // Put paved road right on the building tile
    map.infrastructure[10 * map.width + 10] = Infrastructure.Road | Infrastructure.PavedRoad
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 10, y: 10,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active',
    })
    const prng = new PRNG(42)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGrid = new Uint8Array(map.width * map.height)
    // Run many iterations with high demand and pop — should eventually upgrade
    let upgraded = false
    for (let i = 0; i < 2000; i++) {
      updateDensity(map, powerGrid, demand, 5000, prng, { value: 100 })
      if (map.buildings[0]!.state === 'under_construction' || map.buildings[0]!.defId.includes('med')) {
        upgraded = true
        break
      }
    }
    expect(upgraded).toBe(true)
  })

  test('building in under_construction state ticks down and completes', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 10, y: 10,
      powered: true, density: DensityLevel.Low, age: 0, state: 'under_construction',
      constructionMonthsRemaining: 1, upgradingToDefId: 'res.med',
    })
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGrid = new Uint8Array(map.width * map.height)
    const result = updateDensity(map, powerGrid, demand, 5000, prng, { value: 100 })
    // Should complete construction (1 month remaining → 0 → complete)
    expect(map.buildings[0]!.state).toBe('active')
    expect(map.buildings[0]!.defId).toBe('res.med')
    expect(result.populationDelta).toBe(100) // res.med has 100 population
  })
})
