import { TileType } from '@bitborough/core'
import { layeredNoise } from './noise.js'

export function placeWater(
  terrain: Uint8Array,
  width: number,
  height: number,
  noise: (x: number, y: number) => number,
  waterLevel: number,
  preset: 'plains' | 'island',
): void {
  const freq = 0.03
  const octaves = 4

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = layeredNoise(noise, x, y, octaves, freq, 0.5)
      // Normalize from [-1,1] to [0,1]
      value = (value + 1) / 2

      // Island mask: radial gradient that pushes edges below water
      if (preset === 'island') {
        const cx = width / 2
        const cy = height / 2
        const maxDist = Math.min(cx, cy)
        const dx = (x - cx) / maxDist
        const dy = (y - cy) / maxDist
        const dist = Math.sqrt(dx * dx + dy * dy)
        // Smooth falloff: land in center, water at edges
        const mask = 1 - Math.pow(dist, 2)
        value *= Math.max(0, mask)
      }

      if (value < waterLevel) {
        terrain[y * width + x] = TileType.Water
      }
    }
  }
}

export function smoothShoreline(
  terrain: Uint8Array,
  width: number,
  height: number,
  iterations: number,
): void {
  for (let iter = 0; iter < iterations; iter++) {
    const copy = new Uint8Array(terrain)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        // Count water neighbors (4-directional)
        let waterCount = 0
        if (copy[(y - 1) * width + x] === TileType.Water) waterCount++
        if (copy[(y + 1) * width + x] === TileType.Water) waterCount++
        if (copy[y * width + (x - 1)] === TileType.Water) waterCount++
        if (copy[y * width + (x + 1)] === TileType.Water) waterCount++

        // If majority of neighbors disagree, flip
        if (copy[idx] === TileType.Water && waterCount <= 1) {
          terrain[idx] = TileType.Grass
        } else if (copy[idx] !== TileType.Water && waterCount >= 3) {
          terrain[idx] = TileType.Water
        }
      }
    }
  }
}
