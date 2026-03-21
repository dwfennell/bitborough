import type { GameMap } from '@bitborough/core'
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

export function demographicTick(
  registry: CitizenRegistry,
  map: GameMap,
  prng: PRNG,
  avgSatisfaction: number,
): DemographicResult {
  let births = 0
  let deaths = 0
  let netMigration = 0

  // Pass 1: Aging transitions
  for (const agent of registry.agents) {
    const d = agent.demographics
    let childTransitions = 0
    for (let i = 0; i < d.children; i++) {
      if (prng.next() < P_CHILD_TO_WORKING) childTransitions++
    }
    d.children -= childTransitions
    d.working += childTransitions

    let retirements = 0
    for (let i = 0; i < d.working; i++) {
      if (prng.next() < P_WORKING_TO_ELDERLY) retirements++
    }
    d.working -= retirements
    d.elderly += retirements
  }

  // Pass 2: Deaths
  for (let i = registry.agents.length - 1; i >= 0; i--) {
    const agent = registry.agents[i]!
    const d = agent.demographics
    let elderlyDeaths = 0
    for (let j = 0; j < d.elderly; j++) {
      if (prng.next() < P_ELDERLY_DEATH) elderlyDeaths++
    }
    d.elderly -= elderlyDeaths
    deaths += elderlyDeaths
    if (d.children + d.working + d.elderly <= 0) {
      registry.agents.splice(i, 1)
    }
  }

  // Pass 3: Births
  for (const agent of registry.agents) {
    const d = agent.demographics
    if (d.working <= 0) continue
    let newBirths = 0
    for (let i = 0; i < d.working; i++) {
      if (prng.next() < P_BIRTH) newBirths++
    }
    d.children += newBirths
    births += newBirths
  }

  // Pass 4: Migration
  const totalWorking = registry.agents.reduce((sum, a) => sum + a.demographics.working, 0)

  if (avgSatisfaction > 0.5 && totalWorking > 0) {
    const rate = ((avgSatisfaction - 0.5) / 0.5) * 0.02 * totalWorking
    // Stochastic rounding: floor + probabilistic extra
    const immigrantCount = Math.floor(rate) + (prng.next() < (rate % 1) ? 1 : 0)
    let placed = 0
    for (const agent of registry.agents) {
      if (placed >= immigrantCount) break
      const building = map.buildings.find(b => b.id === agent.homeBuildingId)
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
    const rate = ((0.4 - avgSatisfaction) / 0.4) * 0.03 * totalWorking
    // Stochastic rounding: floor + probabilistic extra
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
