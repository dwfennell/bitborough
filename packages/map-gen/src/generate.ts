import { type GameMap, type MapSize, createEmptyMap } from '@rcity/core'
import { PRNG } from './prng.js'
import { createNoise2D } from './noise.js'
import { PRESETS } from './presets.js'
import { placeWater, smoothShoreline } from './water.js'
import { placeSand, placeVegetation } from './terrain.js'

export interface MapGenConfig {
  size: MapSize
  seed: number
  preset: 'plains' | 'island'
  waterLevel?: number
  forestDensity?: number
  smoothing?: number
}

export function generateMap(config: MapGenConfig): GameMap {
  const preset = PRESETS[config.preset]!
  const waterLevel = config.waterLevel ?? preset.waterLevel
  const forestDensity = config.forestDensity ?? preset.forestDensity
  const smoothing = config.smoothing ?? preset.smoothing
  const { size, seed } = config

  const map = createEmptyMap(size, size, {
    name: `${config.preset} map`,
    seed,
    preset: config.preset,
    createdAt: new Date().toISOString(),
  })

  // Each pipeline stage gets its own noise from the same PRNG sequence
  const prng = new PRNG(seed)
  const waterNoise = createNoise2D(new PRNG(prng.nextInt(0, 0x7fffffff)))
  const sandNoise = createNoise2D(new PRNG(prng.nextInt(0, 0x7fffffff)))
  const treeNoise = createNoise2D(new PRNG(prng.nextInt(0, 0x7fffffff)))

  // Pipeline — order matters: smoothing must run before sand/vegetation
  placeWater(map.terrain, size, size, waterNoise, waterLevel, config.preset)
  smoothShoreline(map.terrain, size, size, smoothing)
  placeSand(map.terrain, size, size, sandNoise, preset.sandFrequency, preset.sandThreshold)
  placeVegetation(map.terrain, size, size, treeNoise, forestDensity)

  return map
}
