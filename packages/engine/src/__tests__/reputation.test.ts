import { describe, test, expect } from 'vitest'
import { computeReputation, computeCurrentQuality } from '../simulation/reputation.js'
import { ZoneType } from '@bitborough/core'
import { createTestMap } from '../test-helpers.js'
import { BuildingIndex } from '../building-index.js'

describe('computeCurrentQuality', () => {
  test('perfect conditions produce quality near 1.0', () => {
    const q = computeCurrentQuality(0, 0, 1.0, 1.0, 1.0, 1.0)
    expect(q).toBeCloseTo(1.0)
  })

  test('worst conditions produce quality near 0.0', () => {
    const q = computeCurrentQuality(1.0, 1.0, 0, 0, 0, 0)
    expect(q).toBeCloseTo(0.0)
  })

  test('mixed conditions produce intermediate quality', () => {
    const q = computeCurrentQuality(0.5, 0.3, 0.8, 0.0, 0.7, 0.0)
    // (0.5)*(0.35/1.1) + (0.7)*(0.25/1.1) + (0.8)*(0.15/1.1) + 0*(0.15/1.1) + (0.7)*(0.10/1.1) + 0*(0.10/1.1)
    // = 0.1591 + 0.1591 + 0.1091 + 0 + 0.0636 + 0 ≈ 0.4909
    expect(q).toBeCloseTo(0.4909, 2)
  })

  test('education factor contributes to quality score', () => {
    const qWithEdu = computeCurrentQuality(0, 0, 1.0, 1.0, 1.0, 1.0)
    const qWithoutEdu = computeCurrentQuality(0, 0, 1.0, 1.0, 1.0, 0)
    expect(qWithEdu).toBeGreaterThan(qWithoutEdu)
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
    const educationCoverage = new Uint8Array(16)
    const bldIdx = new BuildingIndex(map)
    // Quality at tile 0: (1-0)*(0.35/1.1) + (1-0)*(0.25/1.1) + 0 + 0 + 0 + 0 = 0.3182 + 0.2273 = 0.5455
    computeReputation(reputationLayer, map, crimeLevel, fireCoverage, pollutionLevel, bldIdx, educationCoverage)
    // 0.95 * 0.5 + 0.05 * 0.5455 ≈ 0.5023
    expect(reputationLayer[0]).toBeCloseTo(0.5023, 2)
  })

  test('unzoned tiles are not updated', () => {
    const map = createTestMap(4)
    const reputationLayer = new Float32Array(16).fill(0.5)
    const crimeLevel = new Uint8Array(16)
    const fireCoverage = new Uint8Array(16)
    const pollutionLevel = new Uint8Array(16)
    const educationCoverage = new Uint8Array(16)
    const bldIdx = new BuildingIndex(map)
    computeReputation(reputationLayer, map, crimeLevel, fireCoverage, pollutionLevel, bldIdx, educationCoverage)
    expect(reputationLayer[0]).toBe(0.5)
  })

  test('reputation converges over many ticks', () => {
    const map = createTestMap(4)
    map.zones[0] = ZoneType.Residential
    const reputationLayer = new Float32Array(16).fill(0.0)
    const crimeLevel = new Uint8Array(16)
    const fireCoverage = new Uint8Array(16)
    const pollutionLevel = new Uint8Array(16)
    const educationCoverage = new Uint8Array(16)
    const bldIdx = new BuildingIndex(map)
    for (let i = 0; i < 60; i++) {
      computeReputation(reputationLayer, map, crimeLevel, fireCoverage, pollutionLevel, bldIdx, educationCoverage)
    }
    expect(reputationLayer[0]).toBeGreaterThan(0.5)
  })
})
