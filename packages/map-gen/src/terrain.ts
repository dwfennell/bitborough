import { TileType } from '@rcity/core'
import { layeredNoise } from './noise.js'

export function placeSand(
  terrain: Uint8Array,
  width: number,
  height: number,
  noise: (x: number, y: number) => number,
  frequency: number,
  threshold: number,
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (terrain[idx] !== TileType.Grass) continue

      let value = layeredNoise(noise, x, y, 3, frequency, 0.5)
      value = (value + 1) / 2 // normalize to [0, 1]

      if (value > threshold) {
        terrain[idx] = TileType.Sand
      }
    }
  }
}

export function placeVegetation(
  terrain: Uint8Array,
  width: number,
  height: number,
  noise: (x: number, y: number) => number,
  forestDensity: number,
): void {
  if (forestDensity <= 0) return

  // Threshold derived from density: higher density = lower threshold = more trees
  const threshold = 1 - forestDensity

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (terrain[idx] !== TileType.Grass) continue

      let value = layeredNoise(noise, x, y, 3, 0.06, 0.5)
      value = (value + 1) / 2

      if (value > threshold) {
        terrain[idx] = TileType.Trees
      }
    }
  }
}
