import { describe, test, expect } from 'vitest'
import { DensityLevel } from '@bitborough/core'
import { createTestMap } from '../test-helpers.js'
import { calculateEducationCoverage } from '../simulation/services/education.js'

function makeSchool(id: string, defId: string, x: number, y: number) {
  return { id, defId, x, y, powered: true, density: DensityLevel.Low, age: 0, state: 'active' as const, residents: 0 }
}

describe('Education coverage', () => {
  test('empty map produces zero coverage', () => {
    const map = createTestMap(16)
    const size = 16 * 16
    const educationCoverage = new Uint8Array(size)
    const influenceBuffer = new Float32Array(size)
    calculateEducationCoverage(map, educationCoverage, 100, influenceBuffer)
    const total = Array.from(educationCoverage).reduce((a, b) => a + b, 0)
    expect(total).toBe(0)
  })

  test('large school stamps coverage within radius', () => {
    const map = createTestMap(32)
    const size = 32 * 32
    map.buildings.push(makeSchool('b1', 'service.school', 14, 14))
    const educationCoverage = new Uint8Array(size)
    const influenceBuffer = new Float32Array(size)
    calculateEducationCoverage(map, educationCoverage, 100, influenceBuffer)
    expect(educationCoverage[15 * 32 + 15]).toBeGreaterThan(200)
    expect(educationCoverage[3 * 32 + 15]).toBe(0)
  })

  test('small school stamps smaller radius', () => {
    const map = createTestMap(32)
    const size = 32 * 32
    map.buildings.push(makeSchool('b1', 'service.school.small', 15, 15))
    const educationCoverage = new Uint8Array(size)
    const influenceBuffer = new Float32Array(size)
    calculateEducationCoverage(map, educationCoverage, 100, influenceBuffer)
    expect(educationCoverage[15 * 32 + 15]).toBeGreaterThan(200)
    expect(educationCoverage[15 * 32 + 23]).toBe(0)
  })

  test('small school near large school gets 1.5x radius boost', () => {
    const map = createTestMap(32)
    const size = 32 * 32
    map.buildings.push(makeSchool('b1', 'service.school', 14, 14))
    map.buildings.push(makeSchool('b2', 'service.school.small', 16, 16))
    const educationCoverage = new Uint8Array(size)
    const influenceBuffer = new Float32Array(size)
    calculateEducationCoverage(map, educationCoverage, 100, influenceBuffer)

    const map2 = createTestMap(32)
    map2.buildings.push(makeSchool('b2', 'service.school.small', 16, 16))
    const coverage2 = new Uint8Array(size)
    const buf2 = new Float32Array(size)
    calculateEducationCoverage(map2, coverage2, 100, buf2)

    const checkIdx = 16 * 32 + 23
    expect(educationCoverage[checkIdx]).toBeGreaterThan(0)
    expect(coverage2[checkIdx]).toBe(0)
  })

  test('zero funding produces zero coverage', () => {
    const map = createTestMap(32)
    const size = 32 * 32
    map.buildings.push(makeSchool('b1', 'service.school', 14, 14))
    const educationCoverage = new Uint8Array(size)
    const influenceBuffer = new Float32Array(size)
    calculateEducationCoverage(map, educationCoverage, 0, influenceBuffer)
    const total = Array.from(educationCoverage).reduce((a, b) => a + b, 0)
    expect(total).toBe(0)
  })
})
