import { describe, test, expect } from 'vitest'
import { demographicTick } from '../simulation/demographics.js'
import { createTestMap } from '../test-helpers.js'
import { createRegistry } from '../simulation/citizens.js'
import type { Citizen, AgentDemographics } from '../simulation/citizens.js'
import { PRNG } from '../prng.js'
import { DensityLevel } from '@bitborough/core'

function makeAgent(id: string, buildingId: string, demographics: AgentDemographics): Citizen {
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
    satisfaction: 0.7,
    wealthTier: 2,
    demographics,
  }
}

describe('Demographics — aging', () => {
  test('children transition to working over time', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 100, working: 0, elderly: 0 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    const prng = new PRNG(42)
    for (let i = 0; i < 300; i++) {
      demographicTick(registry, map, prng)
    }
    expect(agent.demographics.children).toBeLessThan(40)
    expect(agent.demographics.working).toBeGreaterThan(30)
  })

  test('working transition to elderly over time', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 0, working: 100, elderly: 0 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    const prng = new PRNG(42)
    for (let i = 0; i < 700; i++) {
      demographicTick(registry, map, prng)
    }
    expect(agent.demographics.elderly).toBeGreaterThan(0)
    expect(agent.demographics.working).toBeLessThan(100)
  })
})

describe('Demographics — deaths', () => {
  test('elderly population declines through deaths', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 0, working: 0, elderly: 50 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    const prng = new PRNG(42)
    for (let i = 0; i < 200; i++) {
      demographicTick(registry, map, prng)
    }
    expect(agent.demographics.elderly).toBeLessThan(50)
  })

  test('agent is removed when total population hits 0', () => {
    const registry = createRegistry()
    registry.agents.push(makeAgent('c1', 'b1', { children: 0, working: 0, elderly: 1 }))
    const map = createTestMap(8)
    const prng = new PRNG(42)
    for (let i = 0; i < 500; i++) {
      demographicTick(registry, map, prng)
      if (registry.agents.length === 0) break
    }
    expect(registry.agents.length).toBe(0)
  })

  test('demographicTick returns death count', () => {
    const registry = createRegistry()
    registry.agents.push(makeAgent('c1', 'b1', { children: 0, working: 0, elderly: 100 }))
    const map = createTestMap(8)
    const prng = new PRNG(42)
    let totalDeaths = 0
    for (let i = 0; i < 100; i++) {
      const result = demographicTick(registry, map, prng)
      totalDeaths += result.deaths
    }
    expect(totalDeaths).toBeGreaterThan(0)
  })
})

describe('Demographics — births', () => {
  test('working population produces children', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 0, working: 50, elderly: 0 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    const prng = new PRNG(42)
    for (let i = 0; i < 100; i++) {
      demographicTick(registry, map, prng)
    }
    expect(agent.demographics.children).toBeGreaterThan(0)
  })

  test('no births when working population is 0', () => {
    const registry = createRegistry()
    registry.agents.push(makeAgent('c1', 'b1', { children: 10, working: 0, elderly: 5 }))
    const map = createTestMap(8)
    const prng = new PRNG(42)
    const result = demographicTick(registry, map, prng)
    expect(result.births).toBe(0)
  })

  test('demographicTick returns birth count', () => {
    const registry = createRegistry()
    registry.agents.push(makeAgent('c1', 'b1', { children: 0, working: 100, elderly: 0 }))
    const map = createTestMap(8)
    const prng = new PRNG(42)
    let totalBirths = 0
    for (let i = 0; i < 100; i++) {
      const result = demographicTick(registry, map, prng)
      totalBirths += result.births
    }
    expect(totalBirths).toBeGreaterThan(0)
  })
})

describe('Demographics — migration removed', () => {
  test('demographicTick always returns netMigration 0', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 0, working: 50, elderly: 0 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    const building = {
      id: 'b1', defId: 'res.med', x: 0, y: 0,
      powered: true, density: DensityLevel.Medium, age: 0, state: 'active', residents: 50,
    }
    map.buildings = [building]
    const prng = new PRNG(42)

    const result = demographicTick(registry, map, prng)
    expect(result.netMigration).toBe(0)
  })
})
