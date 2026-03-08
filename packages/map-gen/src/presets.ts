export interface PresetConfig {
  waterLevel: number
  forestDensity: number
  smoothing: number
  noiseFrequency: number
  noiseOctaves: number
  islandMask: boolean
  sandFrequency: number
  sandThreshold: number
}

export const PRESETS: Record<string, PresetConfig> = {
  plains: {
    waterLevel: 0.3,
    forestDensity: 0.4,
    smoothing: 2,
    noiseFrequency: 0.03,
    noiseOctaves: 4,
    islandMask: false,
    sandFrequency: 0.05,
    sandThreshold: 0.6,
  },
  island: {
    waterLevel: 0.3,
    forestDensity: 0.5,
    smoothing: 3,
    noiseFrequency: 0.03,
    noiseOctaves: 4,
    islandMask: true,
    sandFrequency: 0.04,
    sandThreshold: 0.65,
  },
}
