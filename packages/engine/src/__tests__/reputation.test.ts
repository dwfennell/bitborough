import { describe, test, expect } from 'vitest'
import { computeReputation, computeCurrentQuality } from '../simulation/reputation.js'
import { ZoneType } from '@bitborough/core'
import { createTestMap } from '../test-helpers.js'
import { BuildingIndex } from '../building-index.js'

describe('computeCurrentQuality', () => {
  test('perfect conditions produce quality near 1.0', () => {
    const q = computeCurrentQuality(0, 0, 1.0, 1.0, 1.0)
    expect(q).toBeCloseTo(1.0)
  })

  test('worst conditions produce quality near 0.0', () => {
    const q = computeCurrentQuality(1.0, 1.0, 0, 0, 0)
    expect(q).toBeCloseTo(0.0)
  })

  test('mixed conditions produce intermediate quality', () => {
    const q = computeCurrentQuality(0.5, 0.3, 0.8, 0.0, 0.7)
    // (1-0.5)*0.35 + (1-0.3)*0.25 + 0.8*0.15 + 0.0*0.15 + 0.7*0.10
    // = 0.175 + 0.175 + 0.12 + 0.0 + 0.07 = 0.54
    expect(q).toBeCloseTo(0.54)
  })
})

describe('computeReputation', () => {
  test('reputation decays toward current quality', () => {
    const map = createTestMap(4)
    map.zones[0] = ZoneType.Residential
    const reputationLayer = new Float32Array(16).fill(0.5)
    const crimeLevel = new Uint8Array(16)
    const fireCoverage = new Uint8Array(16)
    const pollutionLevel = new Uint8Array(16)
    const bldIdx = new BuildingIndex(map)
    // Quality at tile 0: (1-0)*0.35 + (1-0)*0.25 + 0*0.15 + 0*0.15 + 0*0.10 = 0.60
    computeReputation(reputationLayer, map, crimeLevel, fireCoverage, pollutionLevel, bldIdx)
    // 0.95 * 0.5 + 0.05 * 0.60 = 0.505
    expect(reputationLayer[0]).toBeCloseTo(0.505, 2)
  })

  test('unzoned tiles are not updated', () => {
    const map = createTestMap(4)
    const reputationLayer = new Float32Array(16).fill(0.5)
    const crimeLevel = new Uint8Array(16)
    const fireCoverage = new Uint8Array(16)
    const pollutionLevel = new Uint8Array(16)
    const bldIdx = new BuildingIndex(map)
    computeReputation(reputationLayer, map, crimeLevel, fireCoverage, pollutionLevel, bldIdx)
    expect(reputationLayer[0]).toBe(0.5)
  })

  test('reputation converges over many ticks', () => {
    const map = createTestMap(4)
    map.zones[0] = ZoneType.Residential
    const reputationLayer = new Float32Array(16).fill(0.0)
    const crimeLevel = new Uint8Array(16)
    const fireCoverage = new Uint8Array(16)
    const pollutionLevel = new Uint8Array(16)
    const bldIdx = new BuildingIndex(map)
    for (let i = 0; i < 60; i++) {
      computeReputation(reputationLayer, map, crimeLevel, fireCoverage, pollutionLevel, bldIdx)
    }
    expect(reputationLayer[0]).toBeGreaterThan(0.5)
  })
})
