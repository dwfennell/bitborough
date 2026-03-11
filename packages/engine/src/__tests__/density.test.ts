import { describe, test, expect } from 'vitest'
import { Infrastructure, BuildingCategory, DensityLevel } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import { createTestMap } from '../test-helpers.js'
import {
  cityCenter,
  hasNearbyPavedRoad,
  hasNearbyTransitStop,
  upgradeProb,
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
})
