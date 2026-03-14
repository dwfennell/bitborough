import { describe, test, expect } from 'vitest'
import { PRNG } from '../prng.js'
import { createNoise2D } from '../noise.js'
import { placeWater, smoothShoreline } from '../water.js'
import { TileType } from '@bitborough/core'

describe('Water placement', () => {
  test('water level 0 produces no water', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(64 * 64)
    placeWater(terrain, 64, 64, noise, 0, 'plains')
    const waterCount = Array.from(terrain).filter((t) => t === TileType.Water).length
    expect(waterCount).toBe(0)
  })

  test('water level 1 produces all water', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(64 * 64)
    placeWater(terrain, 64, 64, noise, 1.0, 'plains')
    const waterCount = Array.from(terrain).filter((t) => t === TileType.Water).length
    expect(waterCount).toBe(64 * 64)
  })

  test('island preset has water on all edges', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(64 * 64)
    placeWater(terrain, 64, 64, noise, 0.3, 'island')
    // Check corners and edges are water
    expect(terrain[0]).toBe(TileType.Water) // top-left
    expect(terrain[63]).toBe(TileType.Water) // top-right
    expect(terrain[63 * 64]).toBe(TileType.Water) // bottom-left
    expect(terrain[63 * 64 + 63]).toBe(TileType.Water) // bottom-right
  })

  test('plains preset does not force edge water', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(64 * 64)
    placeWater(terrain, 64, 64, noise, 0.1, 'plains')
    // With low water level, most of the map should be land
    const grassCount = Array.from(terrain).filter((t) => t === TileType.Grass).length
    expect(grassCount).toBeGreaterThan(64 * 64 * 0.5)
  })
})

describe('Shoreline smoothing', () => {
  test('smoothing removes isolated water tiles', () => {
    const terrain = new Uint8Array(10 * 10) // all grass
    // Place single isolated water tile
    terrain[5 * 10 + 5] = TileType.Water
    smoothShoreline(terrain, 10, 10, 2)
    // Isolated tile should be converted to land
    expect(terrain[5 * 10 + 5]).toBe(TileType.Grass)
  })

  test('smoothing preserves large water bodies', () => {
    const terrain = new Uint8Array(10 * 10)
    // Place 3x3 water block
    for (let y = 3; y <= 5; y++) {
      for (let x = 3; x <= 5; x++) {
        terrain[y * 10 + x] = TileType.Water
      }
    }
    smoothShoreline(terrain, 10, 10, 2)
    // Center should still be water
    expect(terrain[4 * 10 + 4]).toBe(TileType.Water)
  })
})
