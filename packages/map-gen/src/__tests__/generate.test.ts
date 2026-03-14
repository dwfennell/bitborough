import { describe, test, expect } from 'vitest'
import { generateMap } from '../generate.js'
import { TileType } from '@bitborough/core'

describe('generateMap', () => {
  test('returns a valid GameMap', () => {
    const map = generateMap({ size: 64, seed: 42, preset: 'plains' })
    expect(map.width).toBe(64)
    expect(map.height).toBe(64)
    expect(map.terrain.length).toBe(64 * 64)
    expect(map.meta.seed).toBe(42)
    expect(map.meta.preset).toBe('plains')
  })

  test('deterministic: same seed produces identical maps', () => {
    const a = generateMap({ size: 64, seed: 42, preset: 'plains' })
    const b = generateMap({ size: 64, seed: 42, preset: 'plains' })
    expect(Array.from(a.terrain)).toEqual(Array.from(b.terrain))
  })

  test('different seeds produce different maps', () => {
    const a = generateMap({ size: 64, seed: 42, preset: 'plains' })
    const b = generateMap({ size: 64, seed: 99, preset: 'plains' })
    expect(Array.from(a.terrain)).not.toEqual(Array.from(b.terrain))
  })

  test('plains has mixed terrain', () => {
    const map = generateMap({ size: 128, seed: 42, preset: 'plains' })
    const counts = countTerrain(map.terrain)
    expect(counts.grass).toBeGreaterThan(0)
    expect(counts.water).toBeGreaterThan(0)
    expect(counts.trees).toBeGreaterThan(0)
  })

  test('island has water on all edges', () => {
    const map = generateMap({ size: 64, seed: 42, preset: 'island' })
    // Top row
    for (let x = 0; x < 64; x++) {
      expect(map.terrain[x]).toBe(TileType.Water)
    }
    // Bottom row
    for (let x = 0; x < 64; x++) {
      expect(map.terrain[63 * 64 + x]).toBe(TileType.Water)
    }
  })

  test('waterLevel 0 produces minimal water', () => {
    const map = generateMap({ size: 64, seed: 42, preset: 'plains', waterLevel: 0 })
    const waterCount = Array.from(map.terrain).filter((t) => t === TileType.Water).length
    expect(waterCount).toBe(0)
  })

  test('generates 32x32 map', () => {
    const map = generateMap({ size: 32, seed: 42, preset: 'plains' })
    expect(map.width).toBe(32)
    expect(map.terrain.length).toBe(32 * 32)
  })

  test('generates 256x256 within time budget', () => {
    const start = performance.now()
    generateMap({ size: 256, seed: 42, preset: 'island' })
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(500)
  })

  test('all terrain values are valid TileTypes', () => {
    const map = generateMap({ size: 64, seed: 42, preset: 'island' })
    const validTypes = [TileType.Grass, TileType.Water, TileType.Sand, TileType.Trees]
    for (let i = 0; i < map.terrain.length; i++) {
      expect(validTypes).toContain(map.terrain[i])
    }
  })

  test('buildings array is empty', () => {
    const map = generateMap({ size: 64, seed: 42, preset: 'plains' })
    expect(map.buildings).toEqual([])
  })

  test('zones and infrastructure are zeroed', () => {
    const map = generateMap({ size: 64, seed: 42, preset: 'plains' })
    const zoneSum = Array.from(map.zones).reduce((a: number, b: number) => a + b, 0)
    const infraSum = Array.from(map.infrastructure).reduce((a: number, b: number) => a + b, 0)
    expect(zoneSum).toBe(0)
    expect(infraSum).toBe(0)
  })
})

function countTerrain(terrain: Uint8Array) {
  let grass = 0,
    water = 0,
    sand = 0,
    trees = 0
  for (let i = 0; i < terrain.length; i++) {
    switch (terrain[i]) {
      case TileType.Grass:
        grass++
        break
      case TileType.Water:
        water++
        break
      case TileType.Sand:
        sand++
        break
      case TileType.Trees:
        trees++
        break
    }
  }
  return { grass, water, sand, trees }
}
