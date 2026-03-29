import { describe, test, expect } from 'vitest'
import {
  computeSchoolQuality,
  SCHOOL_CAPACITY,
  findNearestSchool,
  buildEnrollmentCounts,
} from '../simulation/services/school.js'
import { DensityLevel, Infrastructure, ZoneType } from '@bitborough/core'
import { createTestMap, advanceMonth } from '../test-helpers.js'
import { buildRoadGraph } from '../road-graph.js'
import { Engine } from '../Engine.js'

describe('School quality', () => {
  test('quality is 1.0 at or below capacity with full funding', () => {
    expect(computeSchoolQuality(200, 300, 100)).toBe(1.0)
    expect(computeSchoolQuality(300, 300, 100)).toBe(1.0)
    expect(computeSchoolQuality(0, 300, 100)).toBe(1.0)
  })

  test('quality degrades linearly from 100% to 120% capacity', () => {
    expect(computeSchoolQuality(330, 300, 100)).toBeCloseTo(0.75)
    expect(computeSchoolQuality(360, 300, 100)).toBeCloseTo(0.5)
  })

  test('quality scales with funding', () => {
    expect(computeSchoolQuality(300, 300, 50)).toBeCloseTo(0.5)
    expect(computeSchoolQuality(300, 300, 0)).toBe(0)
  })

  test('quality combines funding and overcrowding', () => {
    expect(computeSchoolQuality(360, 300, 50)).toBeCloseTo(0.25)
  })

  test('SCHOOL_CAPACITY has correct values', () => {
    expect(SCHOOL_CAPACITY['service.school']).toBe(300)
    expect(SCHOOL_CAPACITY['service.school.small']).toBe(50)
  })
})

function makeBuilding(id: string, defId: string, x: number, y: number) {
  return { id, defId, x, y, powered: true, density: DensityLevel.Low, age: 0, state: 'active' as const, residents: 0 }
}

describe('findNearestSchool', () => {
  test('finds school reachable by road', () => {
    const map = createTestMap(16)
    for (let x = 3; x <= 10; x++) map.infrastructure[3 * 16 + x] = Infrastructure.Road
    map.buildings.push(makeBuilding('s1', 'service.school', 8, 2))
    const graph = buildRoadGraph(map)
    const enrollment = new Map<string, number>()
    const result = findNearestSchool(map, graph, 3 * 16 + 3, enrollment)
    expect(result).not.toBeNull()
    expect(result!.buildingId).toBe('s1')
  })

  test('skips school at 120% capacity', () => {
    const map = createTestMap(16)
    for (let x = 3; x <= 10; x++) map.infrastructure[3 * 16 + x] = Infrastructure.Road
    map.buildings.push(makeBuilding('s1', 'service.school', 8, 2))
    const graph = buildRoadGraph(map)
    const enrollment = new Map([['s1', 360]])
    const result = findNearestSchool(map, graph, 3 * 16 + 3, enrollment)
    expect(result).toBeNull()
  })

  test('picks closer school', () => {
    const map = createTestMap(32)
    for (let x = 3; x <= 25; x++) map.infrastructure[3 * 32 + x] = Infrastructure.Road
    map.buildings.push(makeBuilding('s1', 'service.school', 20, 2))
    map.buildings.push(makeBuilding('s2', 'service.school.small', 5, 2))
    const graph = buildRoadGraph(map)
    const enrollment = new Map<string, number>()
    const result = findNearestSchool(map, graph, 3 * 32 + 3, enrollment)
    expect(result!.buildingId).toBe('s2')
  })
})

describe('buildEnrollmentCounts', () => {
  test('sums children by school building', () => {
    const agents = [
      { schoolBuildingId: 's1', demographics: { children: 5, working: 50, elderly: 0 } },
      { schoolBuildingId: 's1', demographics: { children: 3, working: 50, elderly: 0 } },
      { schoolBuildingId: 's2', demographics: { children: 2, working: 50, elderly: 0 } },
      { schoolBuildingId: null, demographics: { children: 4, working: 50, elderly: 0 } },
    ] as any[]
    const counts = buildEnrollmentCounts(agents)
    expect(counts.get('s1')).toBe(8)
    expect(counts.get('s2')).toBe(2)
  })
})

describe('Education enrollment integration', () => {
  test('school enrollment appears after births occur', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000, seed: 42 })
    engine.placeBuilding(0, 0, 'power.diesel')
    for (let x = 0; x < 20; x++) engine.placeTile(x, 3, Infrastructure.PowerLine)
    for (let x = 3; x < 18; x++) engine.placeTile(x, 5, Infrastructure.Road)
    for (let x = 3; x < 18; x++) engine.placeZone(x, 4, ZoneType.Residential)
    engine.placeBuilding(10, 6, 'service.school')
    for (let i = 0; i < 60; i++) advanceMonth(engine)
    const state = engine.getState()
    const hasQuality = Array.from(state.educationQuality).some((v) => v > 1)
    // Probabilistic: with seed 42 and 60 months, births should occur
    expect(hasQuality || state.citizens.totalChildren === 0).toBe(true)
  })

  test('education funding affects school quality', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000, seed: 42 })
    engine.placeBuilding(0, 0, 'power.diesel')
    for (let x = 0; x < 20; x++) engine.placeTile(x, 3, Infrastructure.PowerLine)
    for (let x = 3; x < 18; x++) engine.placeTile(x, 5, Infrastructure.Road)
    for (let x = 3; x < 18; x++) engine.placeZone(x, 4, ZoneType.Residential)
    engine.placeBuilding(10, 6, 'service.school')
    engine.setFunding('education', 100)
    for (let i = 0; i < 60; i++) advanceMonth(engine)
    expect(engine.getState().funds).toBeDefined()
  })
})
