import { describe, test, expect } from 'vitest'
import { DensityLevel, Infrastructure } from '@bitborough/core'
import { createTestMap, advanceMonth } from '../test-helpers.js'
import { calculateEducationCoverage } from '../simulation/services/education.js'
import { Engine } from '../Engine.js'

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

describe('Education integration', () => {
  test('schools provide education coverage visible in getState', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    engine.placeBuilding(0, 0, 'power.diesel')
    for (let x = 0; x < 20; x++) engine.placeTile(x, 3, Infrastructure.PowerLine)
    for (let x = 5; x < 20; x++) engine.placeTile(x, 5, Infrastructure.Road)
    engine.placeBuilding(10, 6, 'service.school')
    advanceMonth(engine)
    const state = engine.getState()
    // School center at (11.5, 7.5) — nearby tile should have coverage
    expect(state.educationCoverage[7 * 32 + 11]).toBeGreaterThan(0)
    // Far away tile should have no coverage
    expect(state.educationCoverage[0]).toBe(0)
  })

  test('education funding slider works', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    engine.placeBuilding(0, 0, 'power.diesel')
    for (let x = 0; x < 20; x++) engine.placeTile(x, 3, Infrastructure.PowerLine)
    for (let x = 5; x < 20; x++) engine.placeTile(x, 5, Infrastructure.Road)
    engine.placeBuilding(10, 6, 'service.school')

    engine.setFunding('education', 100)
    advanceMonth(engine)
    const fullCoverage = engine.getState().educationCoverage[7 * 32 + 11]!

    engine.setFunding('education', 0)
    advanceMonth(engine)
    const zeroCoverage = engine.getState().educationCoverage[7 * 32 + 11]!

    expect(fullCoverage).toBeGreaterThan(0)
    expect(zeroCoverage).toBe(0)
  })
})
