import { describe, test, expect } from 'vitest'
import { PRNG } from '../prng.js'
import { createNoise2D } from '../noise.js'
import { placeSand, placeVegetation } from '../terrain.js'
import { TileType } from '@rcity/core'

describe('Sand placement', () => {
  test('sand appears on grass tiles only', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(32 * 32) // all grass
    // Set some tiles to water
    for (let i = 0; i < 100; i++) terrain[i] = TileType.Water
    placeSand(terrain, 32, 32, noise, 0.05, 0.5)
    // Sand should not appear on water tiles
    for (let i = 0; i < 100; i++) {
      expect(terrain[i]).not.toBe(TileType.Sand)
    }
  })

  test('sand density varies with threshold', () => {
    const terrain1 = new Uint8Array(64 * 64) // all grass
    const terrain2 = new Uint8Array(64 * 64) // all grass
    const prng1 = new PRNG(42)
    const prng2 = new PRNG(42)
    placeSand(terrain1, 64, 64, createNoise2D(prng1), 0.05, 0.3) // low threshold = more sand
    placeSand(terrain2, 64, 64, createNoise2D(prng2), 0.05, 0.8) // high threshold = less sand
    const sand1 = Array.from(terrain1).filter(t => t === TileType.Sand).length
    const sand2 = Array.from(terrain2).filter(t => t === TileType.Sand).length
    expect(sand1).toBeGreaterThan(sand2)
  })
})

describe('Vegetation', () => {
  test('trees appear on grass only', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(32 * 32) // all grass
    terrain[0] = TileType.Water
    terrain[1] = TileType.Sand
    placeVegetation(terrain, 32, 32, noise, 0.4)
    expect(terrain[0]).toBe(TileType.Water)
    expect(terrain[1]).toBe(TileType.Sand)
  })

  test('forest density 0 produces no trees', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(32 * 32)
    placeVegetation(terrain, 32, 32, noise, 0)
    const treeCount = Array.from(terrain).filter(t => t === TileType.Trees).length
    expect(treeCount).toBe(0)
  })

  test('forest density 1 produces many trees', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(64 * 64)
    placeVegetation(terrain, 64, 64, noise, 1.0)
    const treeCount = Array.from(terrain).filter(t => t === TileType.Trees).length
    expect(treeCount).toBeGreaterThan(64 * 64 * 0.5)
  })
})
