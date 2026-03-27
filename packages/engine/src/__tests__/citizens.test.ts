import { describe, test, expect } from 'vitest'
import { createTestMap } from '../test-helpers.js'
import {
  resolveAccessRoad, createRegistry, syncAgentsForBuilding, removeAgentsForBuilding,
  markRoutesStale, replanStaleRoutes, citizenMonthlyTick, computeCitizenSummary,
  type TileLayers,
} from '../simulation/citizens.js'
import { buildRoadGraph, updateRoadGraph } from '../road-graph.js'
import { BuildingIndex } from '../building-index.js'
import { Infrastructure, DensityLevel } from '@bitborough/core'
import type { Building, GameMap } from '@bitborough/core'

function makeTileLayers(map: GameMap): TileLayers {
  const size = map.width * map.height
  return {
    crimeLevel: new Uint8Array(size),
    fireCoverage: new Uint8Array(size),
    pollutionLevel: new Uint8Array(size),
    reputationLayer: new Float32Array(size).fill(0.5),
  }
}

function makeBuilding(x: number, y: number, _w: number, _h: number): Building {
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
    expect(registry.samplingRatio).toBe(10)
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
    // 100 / 10 = 10 agents
    expect(registry.agents.filter(a => a.homeBuildingId === building.id)).toHaveLength(10)
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
    expect(registry.agents).toHaveLength(10)
    building.residents = 50
    syncAgentsForBuilding(map, registry, graph, building)
    expect(registry.agents).toHaveLength(5)
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

describe('Route invalidation', () => {
  function buildScenario() {
    const map = createTestMap(8)
    // Road: (0,0)..(4,0) as y=0 row
    for (let x = 0; x < 5; x++) map.infrastructure[x] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    // Residential building at (0,1), its north neighbor (0,0) is road access
    const home: Building = { id: 'b1', defId: 'res.low', x: 0, y: 1, powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 50 }
    // Commercial building at (4,1), its north neighbor (4,0) is road access
    const shop: Building = { id: 'b2', defId: 'com.low', x: 4, y: 1, powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 0 }
    map.buildings = [home, shop]
    syncAgentsForBuilding(map, registry, graph, home)
    return { map, graph, registry, home, shop }
  }

  test('markRoutesStale flags agents whose routes include a demolished tile', () => {
    const { registry } = buildScenario()
    const agent = registry.agents[0]!
    // Route goes through index=2 (x=2,y=0)
    expect(agent.homeCommerceRoute).toContain(2)
    markRoutesStale(registry, 2)
    expect(agent.homeCommerceRouteStale).toBe(true)
  })

  test('markRoutesStale does not affect agents whose routes do not include the tile', () => {
    const { registry } = buildScenario()
    const agent = registry.agents[0]!
    markRoutesStale(registry, 99)  // tile not in any route
    expect(agent.homeWorkRouteStale).toBe(false)
    expect(agent.homeCommerceRouteStale).toBe(false)
  })

  test('replanStaleRoutes replans a stale route', () => {
    const { map, graph, registry } = buildScenario()
    const agent = registry.agents[0]!
    agent.homeCommerceRouteStale = true
    const originalRoute = [...agent.homeCommerceRoute]
    replanStaleRoutes(registry, map, graph)
    // Route should still be valid (same path)
    expect(agent.homeCommerceRoute).toEqual(originalRoute)
    expect(agent.homeCommerceRouteStale).toBe(false)
  })

  test('replanStaleRoutes sets route to [] when path is broken', () => {
    const { map, graph, registry } = buildScenario()
    const agent = registry.agents[0]!
    // Remove road tiles in the middle so path is broken
    map.infrastructure[2] = 0
    map.infrastructure[3] = 0
    updateRoadGraph(map, graph, 2, 0)
    updateRoadGraph(map, graph, 3, 0)
    agent.homeCommerceRouteStale = true
    replanStaleRoutes(registry, map, graph)
    expect(agent.homeCommerceRoute).toEqual([])
    expect(agent.homeCommerceRouteStale).toBe(false)
  })
})

describe('Monthly tick — traffic + satisfaction', () => {
  function buildCity() {
    const map = createTestMap(8)
    for (let x = 0; x < 8; x++) map.infrastructure[x] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    const home: Building = { id: 'b1', defId: 'res.low', x: 0, y: 1, powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 100 }
    const shop: Building = { id: 'b2', defId: 'com.low', x: 6, y: 1, powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 0 }
    map.buildings = [home, shop]
    syncAgentsForBuilding(map, registry, graph, home)
    return { map, graph, registry }
  }

  test('traffic is zero on empty registry', () => {
    const map = createTestMap(8)
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    const trafficDensity = new Uint8Array(64)
    citizenMonthlyTick(registry, map, graph, trafficDensity, makeTileLayers(map), new BuildingIndex(map), 100)
    expect(Array.from(trafficDensity).every(v => v === 0)).toBe(true)
  })

  test('traffic appears on road tiles along agent routes', () => {
    const { map, graph, registry } = buildCity()
    const trafficDensity = new Uint8Array(64)
    citizenMonthlyTick(registry, map, graph, trafficDensity, makeTileLayers(map), new BuildingIndex(map), 100)
    // Road at y=0 (indices 0..7) should have traffic from commerce route
    const roadTraffic = Array.from(trafficDensity.slice(0, 8))
    expect(roadTraffic.some(v => v > 0)).toBe(true)
  })

  test('more agents produce more traffic', () => {
    // Use samplingRatio=1 so each agent is 1 resident — avoids Uint8 saturation at 255
    const map = createTestMap(8)
    for (let x = 0; x < 8; x++) map.infrastructure[x] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const registry = createRegistry(1)
    const home: Building = { id: 'b1', defId: 'res.low', x: 0, y: 1, powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 2 }
    const shop: Building = { id: 'b2', defId: 'com.low', x: 6, y: 1, powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 0 }
    map.buildings = [home, shop]
    syncAgentsForBuilding(map, registry, graph, home)

    const t1 = new Uint8Array(64)
    citizenMonthlyTick(registry, map, graph, t1, makeTileLayers(map), new BuildingIndex(map), 100)
    const sum1 = Array.from(t1).reduce((a, b) => a + b, 0)

    // Double residents
    home.residents = 4
    syncAgentsForBuilding(map, registry, graph, home)
    const t2 = new Uint8Array(64)
    citizenMonthlyTick(registry, map, graph, t2, makeTileLayers(map), new BuildingIndex(map), 100)
    const sum2 = Array.from(t2).reduce((a, b) => a + b, 0)
    expect(sum2).toBeGreaterThan(sum1)
  })

  test('satisfaction is 1 when agent has short commute and commerce', () => {
    const { registry } = buildCity()
    const agent = registry.agents[0]!
    // Short route (≤ a few tiles), has commerce
    expect(agent.satisfaction).toBeGreaterThan(0.5)
  })

  test('satisfaction penalised when no job assigned', () => {
    const map = createTestMap(8)
    for (let x = 0; x < 8; x++) map.infrastructure[x] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    // Only residential, no jobs nearby
    const home: Building = { id: 'b1', defId: 'res.low', x: 0, y: 1, powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 50 }
    map.buildings = [home]
    syncAgentsForBuilding(map, registry, graph, home)
    const trafficDensity = new Uint8Array(64)
    citizenMonthlyTick(registry, map, graph, trafficDensity, makeTileLayers(map), new BuildingIndex(map), 100)
    const agent = registry.agents[0]!
    // jobPenalty = 0.5, so satisfaction ≤ 0.5
    expect(agent.satisfaction).toBeLessThanOrEqual(0.5)
  })

  test('computeCitizenSummary returns empty summary for empty registry', () => {
    const registry = createRegistry()
    const summary = computeCitizenSummary(registry)
    expect(summary.agentCount).toBe(0)
    expect(summary.avgSatisfaction).toBe(1)
    expect(summary.unmatchedJobFraction).toBe(0)
  })
})
