import { describe, test, expect } from 'vitest'
import { createTestMap } from '../test-helpers.js'
import {
  resolveAccessRoad, createRegistry, syncAgentsForBuilding, removeAgentsForBuilding,
  type CitizenRegistry,
} from '../simulation/citizens.js'
import { buildRoadGraph } from '../road-graph.js'
import { Infrastructure, DensityLevel } from '@bitborough/core'
import type { Building } from '@bitborough/core'

function makeBuilding(x: number, y: number, w: number, h: number): Building {
  return { id: 'b1', defId: 'res.low', x, y, powered: false, density: DensityLevel.Low, age: 0, state: 'active', residents: 5 }
}

describe('resolveAccessRoad', () => {
  test('returns -1 when no adjacent road', () => {
    const map = createTestMap(8)
    const building = makeBuilding(2, 2, 1, 1)
    expect(resolveAccessRoad(map, building)).toBe(-1)
  })

  test('finds road tile directly north of building', () => {
    const map = createTestMap(8)
    // Building at (2,2), road at (2,1)
    map.infrastructure[1 * 8 + 2] = Infrastructure.Road
    const building = makeBuilding(2, 2, 1, 1)
    expect(resolveAccessRoad(map, building)).toBe(1 * 8 + 2)
  })

  test('finds road for multi-tile building (2x2)', () => {
    const map = createTestMap(8)
    // Building at (2,2) with defId 'res.high' (2×2 footprint), road at (3,1)
    // (3,1) is north of footprint tile (3,2) — only reachable via the 2nd column scan
    map.infrastructure[1 * 8 + 3] = Infrastructure.Road
    const building = { ...makeBuilding(2, 2, 2, 2), defId: 'res.high' }
    expect(resolveAccessRoad(map, building)).toBe(1 * 8 + 3)
  })

  test('scan order is row-major footprint, N then E then S then W per tile', () => {
    const map = createTestMap(8)
    // Building 1x1 at (2,2), roads on both N and E sides
    map.infrastructure[1 * 8 + 2] = Infrastructure.Road  // north
    map.infrastructure[2 * 8 + 3] = Infrastructure.Road  // east
    const building = makeBuilding(2, 2, 1, 1)
    // N is checked before E, so north road wins
    expect(resolveAccessRoad(map, building)).toBe(1 * 8 + 2)
  })
})

describe('Agent spawning', () => {
  test('createRegistry returns empty registry with default ratio', () => {
    const registry = createRegistry()
    expect(registry.agents).toHaveLength(0)
    expect(registry.samplingRatio).toBe(50)
  })

  test('syncAgentsForBuilding spawns agents proportional to residents', () => {
    const map = createTestMap(8)
    // Road at y=0 row, residential building at (2,1)
    for (let x = 0; x < 8; x++) map.infrastructure[x] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    const building = makeBuilding(2, 1, 1, 1)
    building.residents = 100
    map.buildings = [building]
    syncAgentsForBuilding(map, registry, graph, building)
    // 100 / 50 = 2 agents
    expect(registry.agents.filter(a => a.homeBuildingId === building.id)).toHaveLength(2)
  })

  test('syncAgentsForBuilding removes agents when residents shrink', () => {
    const map = createTestMap(8)
    for (let x = 0; x < 8; x++) map.infrastructure[x] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    const building = makeBuilding(2, 1, 1, 1)
    building.residents = 100
    map.buildings = [building]
    syncAgentsForBuilding(map, registry, graph, building)
    expect(registry.agents).toHaveLength(2)
    building.residents = 50
    syncAgentsForBuilding(map, registry, graph, building)
    expect(registry.agents).toHaveLength(1)
  })

  test('removeAgentsForBuilding clears all agents for that building', () => {
    const map = createTestMap(8)
    for (let x = 0; x < 8; x++) map.infrastructure[x] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    const building = makeBuilding(2, 1, 1, 1)
    building.residents = 100
    map.buildings = [building]
    syncAgentsForBuilding(map, registry, graph, building)
    removeAgentsForBuilding(registry, building.id)
    expect(registry.agents.filter(a => a.homeBuildingId === building.id)).toHaveLength(0)
  })

  test('agents without road access have empty routes', () => {
    const map = createTestMap(8)
    // No road placed — building has no road access
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    const building = makeBuilding(2, 1, 1, 1)
    building.residents = 100
    map.buildings = [building]
    syncAgentsForBuilding(map, registry, graph, building)
    // No agents spawned because no access road
    expect(registry.agents).toHaveLength(0)
  })
})
