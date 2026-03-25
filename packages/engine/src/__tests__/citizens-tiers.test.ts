import { describe, test, expect } from 'vitest'
import { PRNG } from '../prng.js'
import {
  createRegistry,
  computeCitizenSummary,
  EMPTY_CITIZEN_SUMMARY,
} from '../simulation/citizens.js'
import type { WealthTier } from '@bitborough/core'
import type { Citizen } from '../simulation/citizens.js'

function makeTestAgent(id: string, buildingId: string, tier: WealthTier): Citizen {
  return {
    id,
    homeBuildingId: buildingId,
    workBuildingId: null,
    commerceBuildingId: null,
    homeAccessRoad: 0,
    workAccessRoad: null,
    commerceAccessRoad: null,
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
