import { describe, test, expect } from 'vitest'
import {
  createRegistry,
  computeCitizenSummary,
  EMPTY_CITIZEN_SUMMARY,
  citizenMonthlyTick,
  type TileLayers,
} from '../simulation/citizens.js'
import type { WealthTier } from '@bitborough/core'
import type { Citizen } from '../simulation/citizens.js'
import { createTestMap } from '../test-helpers.js'
import { BuildingIndex } from '../building-index.js'
import { buildRoadGraph } from '../road-graph.js'

function makeTestAgent(id: string, buildingId: string, tier: WealthTier): Citizen {
  return {
    id,
    homeBuildingId: buildingId,
    workBuildingId: 'work1',
    commerceBuildingId: 'commerce1',
    homeAccessRoad: 0,
    workAccessRoad: 0,
    commerceAccessRoad: 0,
    homeWorkRoute: [],
    homeCommerceRoute: [],
    homeWorkRouteTileSet: new Set(),
    homeCommerceRouteTileSet: new Set(),
    homeWorkRouteStale: false,
    homeCommerceRouteStale: false,
    satisfaction: 0.8,
    demographics: { children: 5, working: 40, elderly: 5 },
    wealthTier: tier,
  }
}

describe('Citizen wealthTier', () => {
  test('EMPTY_CITIZEN_SUMMARY has zero tierCounts', () => {
    expect(EMPTY_CITIZEN_SUMMARY.tierCounts).toEqual([0, 0, 0])
  })

  test('computeCitizenSummary aggregates tierCounts', () => {
    const registry = createRegistry()
    registry.agents.push(
      makeTestAgent('c1', 'b1', 1),
      makeTestAgent('c2', 'b1', 2),
      makeTestAgent('c3', 'b1', 2),
      makeTestAgent('c4', 'b2', 3),
    )
    const summary = computeCitizenSummary(registry)
    expect(summary.tierCounts).toEqual([1, 2, 1])
  })

  test('computeCitizenSummary with empty registry returns zero tierCounts', () => {
    const registry = createRegistry()
    const summary = computeCitizenSummary(registry)
    expect(summary.tierCounts).toEqual([0, 0, 0])
  })
})

function makeLayers(size: number): TileLayers {
  return {
    crimeLevel: new Uint8Array(size),
    fireCoverage: new Uint8Array(size),
    pollutionLevel: new Uint8Array(size),
    reputationLayer: new Float32Array(size).fill(0.5),
  }
}

describe('tier-weighted satisfaction', () => {
  test('high-income agents are more sensitive to crime', () => {
    const map = createTestMap(8)
    const graph = buildRoadGraph(map)
    const size = 64
    const layers = makeLayers(size)
    const trafficDensity = new Uint8Array(size)
    const bldIdx = new BuildingIndex(map)

    const registry = createRegistry()
    const lowAgent = makeTestAgent('c1', 'b1', 1)
    const highAgent = makeTestAgent('c2', 'b1', 3)
    registry.agents.push(lowAgent, highAgent)

    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 1, y: 1,
      state: 'active', residents: 100, constructionMonthsLeft: 0,
    } as any)

    layers.crimeLevel[9] = 200 // tile (1,1) = index 9

    citizenMonthlyTick(registry, map, graph, trafficDensity, layers, bldIdx)

    expect(highAgent.satisfaction).toBeLessThan(lowAgent.satisfaction)
  })

  test('low-income agents are more sensitive to commute', () => {
    const map = createTestMap(8)
    const graph = buildRoadGraph(map)
    const size = 64
    const layers = makeLayers(size)
    const trafficDensity = new Uint8Array(size)
    const bldIdx = new BuildingIndex(map)

    const registry = createRegistry()
    const lowAgent = makeTestAgent('c1', 'b1', 1)
    const highAgent = makeTestAgent('c2', 'b1', 3)
    lowAgent.homeWorkRoute = Array.from({ length: 40 }, (_, i) => i)
    highAgent.homeWorkRoute = Array.from({ length: 40 }, (_, i) => i)
    registry.agents.push(lowAgent, highAgent)

    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 1, y: 1,
      state: 'active', residents: 100, constructionMonthsLeft: 0,
    } as any)

    citizenMonthlyTick(registry, map, graph, trafficDensity, layers, bldIdx)

    expect(lowAgent.satisfaction).toBeLessThan(highAgent.satisfaction)
  })
})
