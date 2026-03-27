import { describe, test, expect } from 'vitest'
import { computeAttractiveness, computeMigrationModifier } from '../simulation/migration.js'
import type { CitizenSummary } from '@bitborough/core'
import { DensityLevel } from '@bitborough/core'
import { EMPTY_CITIZEN_SUMMARY } from '../simulation/citizens.js'
import { createTestMap } from '../test-helpers.js'

function makeSummary(overrides: Partial<CitizenSummary> = {}): CitizenSummary {
  return { ...EMPTY_CITIZEN_SUMMARY, ...overrides }
}

describe('computeAttractiveness', () => {
  test('perfect city scores near 1.0', () => {
    const map = createTestMap(8)
    // res.low has capacity 10; 2 residents = 80% vacancy = high housing availability
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 1, y: 1,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 2,
    })
    const summary = makeSummary({
      avgSatisfaction: 1.0,
      unmatchedJobFraction: 0,
    })
    const crimeLevel = new Uint8Array(64).fill(0) // no crime = full police coverage
    const fireCoverage = new Uint8Array(64).fill(255) // full fire coverage
    const educationQuality = new Uint8Array(64).fill(100) // full education coverage (>=2)
    const funding = { police: 100, fire: 100, education: 100 }

    const { score, factors } = computeAttractiveness(summary, map, 0.07, funding, crimeLevel, fireCoverage, educationQuality)
    expect(score).toBeGreaterThan(0.85)
    expect(factors.jobMatchRate).toBeCloseTo(1.0)
    expect(factors.avgSatisfaction).toBeCloseTo(1.0)
    expect(factors.taxCompetitiveness).toBeCloseTo(1.0)
    expect(factors.serviceCoverage).toBeCloseTo(1.0)
  })

  test('terrible city scores near 0', () => {
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 1, y: 1,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 10,
    })
    const summary = makeSummary({
      avgSatisfaction: 0,
      unmatchedJobFraction: 1.0,
    })
    const crimeLevel = new Uint8Array(64).fill(255)
    const fireCoverage = new Uint8Array(64).fill(0)
    const educationQuality = new Uint8Array(64).fill(0)
    const funding = { police: 0, fire: 0, education: 0 }

    const { score } = computeAttractiveness(summary, map, 0.27, funding, crimeLevel, fireCoverage, educationQuality)
    expect(score).toBeLessThan(0.15)
  })

  test('no residential tiles defaults serviceCoverage to 0.5', () => {
    const map = createTestMap(8)
    const summary = makeSummary({ avgSatisfaction: 0.5, unmatchedJobFraction: 0 })
    const { factors } = computeAttractiveness(
      summary, map, 0.07,
      { police: 100, fire: 100, education: 100 },
      new Uint8Array(64), new Uint8Array(64), new Uint8Array(64),
    )
    expect(factors.serviceCoverage).toBeCloseTo(0.5)
  })

  test('zero capacity defaults housingAvailability to 1.0', () => {
    const map = createTestMap(8)
    const summary = makeSummary()
    const { factors } = computeAttractiveness(
      summary, map, 0.07,
      { police: 100, fire: 100, education: 100 },
      new Uint8Array(64), new Uint8Array(64), new Uint8Array(64),
    )
    expect(factors.housingAvailability).toBeCloseTo(1.0)
  })

  test('tax at 7% gives competitiveness 1.0', () => {
    const map = createTestMap(8)
    const summary = makeSummary()
    const { factors } = computeAttractiveness(
      summary, map, 0.07,
      { police: 100, fire: 100, education: 100 },
      new Uint8Array(64), new Uint8Array(64), new Uint8Array(64),
    )
    expect(factors.taxCompetitiveness).toBeCloseTo(1.0)
  })

  test('tax at 27% gives competitiveness 0', () => {
    const map = createTestMap(8)
    const summary = makeSummary()
    const { factors } = computeAttractiveness(
      summary, map, 0.27,
      { police: 100, fire: 100, education: 100 },
      new Uint8Array(64), new Uint8Array(64), new Uint8Array(64),
    )
    expect(factors.taxCompetitiveness).toBeCloseTo(0)
  })

  test('funding scales service coverage', () => {
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 1, y: 1,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 5,
    })
    const crimeLevel = new Uint8Array(64).fill(0)
    const fireCoverage = new Uint8Array(64).fill(255)
    const educationQuality = new Uint8Array(64).fill(100)
    const summary = makeSummary()

    const fullFunding = computeAttractiveness(summary, map, 0.07, { police: 100, fire: 100, education: 100 }, crimeLevel, fireCoverage, educationQuality)
    const halfFunding = computeAttractiveness(summary, map, 0.07, { police: 50, fire: 50, education: 50 }, crimeLevel, fireCoverage, educationQuality)

    expect(fullFunding.factors.serviceCoverage).toBeGreaterThan(halfFunding.factors.serviceCoverage)
  })
})

describe('computeMigrationModifier', () => {
  test('attractiveness 0.5 gives modifier 1.0', () => {
    expect(computeMigrationModifier(0.5)).toBeCloseTo(1.0)
  })

  test('attractiveness 0.0 gives modifier 0.5 (floor)', () => {
    expect(computeMigrationModifier(0.0)).toBeCloseTo(0.5)
  })

  test('attractiveness 1.0 gives modifier 1.5 (cap)', () => {
    expect(computeMigrationModifier(1.0)).toBeCloseTo(1.5)
  })

  test('attractiveness 0.75 gives modifier 1.5', () => {
    expect(computeMigrationModifier(0.75)).toBeCloseTo(1.5)
  })

  test('attractiveness 0.25 gives modifier 0.5', () => {
    expect(computeMigrationModifier(0.25)).toBeCloseTo(0.5)
  })
})
