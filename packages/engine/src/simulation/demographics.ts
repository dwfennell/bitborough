import type { GameMap, Building } from '@bitborough/core'
import type { CitizenRegistry } from './citizens.js'
import type { PRNG } from '../prng.js'
import { BUILDING_DEFS } from '../buildings-registry.js'

const P_CHILD_TO_WORKING = 1 / 150
const P_WORKING_TO_ELDERLY = 1 / 564
const P_ELDERLY_DEATH = 1 / 180
const P_BIRTH = 0.0012

export interface DemographicResult {
  births: number
  deaths: number
  netMigration: number
}

/** Stochastic rounding: floor(n*p) + probabilistic remainder. O(1) per call. */
function stochasticCount(n: number, p: number, prng: PRNG): number {
  const expected = n * p
  return Math.floor(expected) + (prng.next() < (expected % 1) ? 1 : 0)
}

export function demographicTick(
  registry: CitizenRegistry,
  map: GameMap,
  prng: PRNG,
  avgSatisfaction: number,
): DemographicResult {
  let births = 0
  let deaths = 0
  let netMigration = 0

  // Passes 1-3: Aging, deaths, births (merged into single loop)
  for (let i = registry.agents.length - 1; i >= 0; i--) {
    const agent = registry.agents[i]!
    const d = agent.demographics

    // Aging: children → working
    const childTransitions = stochasticCount(d.children, P_CHILD_TO_WORKING, prng)
    d.children -= childTransitions
    d.working += childTransitions

    // Aging: working → elderly
    const retirements = stochasticCount(d.working, P_WORKING_TO_ELDERLY, prng)
    d.working -= retirements
    d.elderly += retirements

    // Deaths
    const elderlyDeaths = stochasticCount(d.elderly, P_ELDERLY_DEATH, prng)
    d.elderly -= elderlyDeaths
    deaths += elderlyDeaths

    // Remove empty agents
    if (d.children + d.working + d.elderly <= 0) {
      registry.agents.splice(i, 1)
      continue
    }

    // Births
    if (d.working > 0) {
      const newBirths = stochasticCount(d.working, P_BIRTH, prng)
      d.children += newBirths
      births += newBirths
    }
  }

  // Pass 4: Migration
  const totalWorking = registry.agents.reduce((sum, a) => sum + a.demographics.working, 0)

  if (avgSatisfaction > 0.5 && totalWorking > 0) {
    // Immigration
    const rate = ((avgSatisfaction - 0.5) / 0.5) * 0.02 * totalWorking
    const immigrantCount = Math.floor(rate) + (prng.next() < (rate % 1) ? 1 : 0)

    // Build lookup for O(1) building access
    const buildingById = new Map<string, Building>()
    for (const b of map.buildings) buildingById.set(b.id, b)

    let placed = 0
    for (const agent of registry.agents) {
      if (placed >= immigrantCount) break
      const building = buildingById.get(agent.homeBuildingId)
      if (!building) continue
      const def = BUILDING_DEFS[building.defId]
      if (!def) continue
      const headroom = def.capacity - building.residents
      if (headroom <= 0) continue
      const toAdd = Math.min(immigrantCount - placed, headroom)
      agent.demographics.working += toAdd
      building.residents += toAdd
      placed += toAdd
    }
    netMigration += placed
  } else if (avgSatisfaction < 0.4 && totalWorking > 0) {
    // Emigration — drain proportionally from least-satisfied agents
    const rate = ((0.4 - avgSatisfaction) / 0.4) * 0.03 * totalWorking
    let toRemove = Math.floor(rate) + (prng.next() < (rate % 1) ? 1 : 0)
    const sorted = [...registry.agents].sort((a, b) => a.satisfaction - b.satisfaction)
    let actualRemoved = 0
    for (const agent of sorted) {
      if (toRemove <= 0) break
      const d = agent.demographics
      const canRemove = Math.min(toRemove, d.working)
      d.working -= canRemove
      toRemove -= canRemove
      actualRemoved += canRemove
    }
    netMigration -= actualRemoved
  }

  // Clean up empty agents from emigration
  for (let i = registry.agents.length - 1; i >= 0; i--) {
    const d = registry.agents[i]!.demographics
    if (d.children + d.working + d.elderly <= 0) {
      registry.agents.splice(i, 1)
    }
  }

  return { births, deaths, netMigration }
}
