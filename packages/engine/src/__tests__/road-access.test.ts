import { describe, test, expect } from 'vitest'
import { Infrastructure } from '@bitborough/core'
import { Engine } from '../Engine.js'
import { createTestMap } from '../test-helpers.js'
import { hasNearbyRoad, hasNearbyPavedRoad } from '../simulation/road-access.js'

describe('hasRoadAccess on TileInfo', () => {
  test('tile adjacent to road returns true', () => {
    const map = createTestMap(16)
    const engine = Engine.create(map)
    engine.placeTile(8, 8, Infrastructure.Road)
    expect(engine.getTile(8, 9).hasRoadAccess).toBe(true)
  })

  test('tile 3 tiles away (Manhattan) returns true', () => {
    const map = createTestMap(16)
    const engine = Engine.create(map)
    engine.placeTile(8, 8, Infrastructure.Road)
    expect(engine.getTile(8, 11).hasRoadAccess).toBe(true)
  })

  test('tile 4 tiles away returns false', () => {
    const map = createTestMap(16)
    const engine = Engine.create(map)
    engine.placeTile(8, 8, Infrastructure.Road)
    expect(engine.getTile(8, 12).hasRoadAccess).toBe(false)
  })

  test('tile with no road anywhere returns false', () => {
    const map = createTestMap(16)
    const engine = Engine.create(map)
    expect(engine.getTile(5, 5).hasRoadAccess).toBe(false)
  })
})

describe('hasNearbyRoad (direct)', () => {
  test('returns true when road is within range', () => {
    const map = createTestMap(16)
    map.infrastructure[8 * 16 + 8] = Infrastructure.Road
    expect(hasNearbyRoad(map, 8, 11)).toBe(true)  // 3 tiles away (Manhattan)
  })

  test('returns false when road is beyond range', () => {
    const map = createTestMap(16)
    map.infrastructure[8 * 16 + 8] = Infrastructure.Road
    expect(hasNearbyRoad(map, 8, 12)).toBe(false)  // 4 tiles away
  })

  test('returns false when no road exists', () => {
    const map = createTestMap(16)
    expect(hasNearbyRoad(map, 5, 5)).toBe(false)
  })

  test('paved road does not satisfy hasNearbyRoad', () => {
    const map = createTestMap(16)
    map.infrastructure[8 * 16 + 8] = Infrastructure.PavedRoad
    expect(hasNearbyRoad(map, 8, 9)).toBe(false)
  })
})

describe('hasNearbyPavedRoad (direct)', () => {
  test('returns true when paved road is within range', () => {
    const map = createTestMap(16)
    map.infrastructure[8 * 16 + 8] = Infrastructure.PavedRoad
    expect(hasNearbyPavedRoad(map, 8, 11)).toBe(true)  // 3 tiles away (Manhattan)
  })

  test('returns false when paved road is beyond range', () => {
    const map = createTestMap(16)
    map.infrastructure[8 * 16 + 8] = Infrastructure.PavedRoad
    expect(hasNearbyPavedRoad(map, 8, 12)).toBe(false)  // 4 tiles away
  })

  test('returns false when no paved road exists', () => {
    const map = createTestMap(16)
    expect(hasNearbyPavedRoad(map, 5, 5)).toBe(false)
  })

  test('regular road does not satisfy hasNearbyPavedRoad', () => {
    const map = createTestMap(16)
    map.infrastructure[8 * 16 + 8] = Infrastructure.Road
    expect(hasNearbyPavedRoad(map, 8, 9)).toBe(false)
  })
})
