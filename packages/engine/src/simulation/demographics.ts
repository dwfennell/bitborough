import type { GameMap } from '@bitborough/core'
import type { CitizenRegistry } from './citizens.js'
import type { PRNG } from '../prng.js'

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
export function stochasticCount(n: number, p: number, prng: PRNG): number {
  const expected = n * p
  return Math.floor(expected) + (prng.next() < (expected % 1) ? 1 : 0)
}

function removeEmptyAgents(registry: CitizenRegistry): void {
  for (let i = registry.agents.length - 1; i >= 0; i--) {
    const d = registry.agents[i]!.demographics
    if (d.children + d.working + d.elderly <= 0) {
      registry.agents.splice(i, 1)
    }
  }
}

export function demographicTick(
  registry: CitizenRegistry,
  map: GameMap,
  prng: PRNG,
): DemographicResult {
  let births = 0
  let deaths = 0

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

  removeEmptyAgents(registry)

  return { births, deaths, netMigration: 0 }
}
