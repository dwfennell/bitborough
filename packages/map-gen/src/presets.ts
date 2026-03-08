export interface PresetConfig {
  waterLevel: number
  forestDensity: number
  smoothing: number
  sandFrequency: number
  sandThreshold: number
}

export const PRESETS: Record<'plains' | 'island', PresetConfig> = {
  plains: {
    waterLevel: 0.3,
    forestDensity: 0.4,
    smoothing: 2,
    sandFrequency: 0.05,
    sandThreshold: 0.6,
  },
  island: {
    waterLevel: 0.3,
    forestDensity: 0.5,
    smoothing: 3,
    sandFrequency: 0.04,
    sandThreshold: 0.65,
  },
}
