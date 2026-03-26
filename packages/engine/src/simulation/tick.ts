import {
  type GameEvent,
  calcMonthlyPayment,
  BuildingCategory,
} from '@bitborough/core'
import { type EngineState, rebuildDerivedState, computeLoanRepayment } from '../engine-state.js'
import { BUILDING_DEFS } from '../buildings-registry.js'
import { calculateDemand } from './demand.js'
import { calculateBudget } from './budget.js'
import { updateFires } from './services/fire.js'
import { computeReputation } from './reputation.js'
import {
  syncAgentsForBuilding,
  citizenMonthlyTick,
  computeCitizenSummary,
  computeTotalPopulation,
  syncBuildingResidents,
  removeAgentsForBuilding,
  type TileLayers,
} from './citizens.js'
import { updateZones } from './zones.js'
import { updateDensity } from './density.js'
import { demographicTick } from './demographics.js'

export interface MonthlyTickResult {
  births: number
  deaths: number
  netMigration: number
  events: GameEvent[]
}

export function syncResidentialAgents(state: EngineState): void {
  for (const b of state.map.buildings) {
    if (b.state === 'active') {
      const def = BUILDING_DEFS[b.defId]
      if (def && def.category === BuildingCategory.Residential) {
        syncAgentsForBuilding(state.map, state.citizenRegistry, state.roadGraph, b, state.trafficDensity, state.prng, state.reputationLayer)
      }
    }
  }
}

export function monthlyTick(state: EngineState): MonthlyTickResult {
  const events: GameEvent[] = []

  state.month++
  if (state.month > state.monthsPerYear) {
    state.month = 1
    state.year++
  }

  rebuildDerivedState(state)
  state.demand = calculateDemand(state.map, state.taxRate, state.trafficDensity, state.citizenSummary)
  updateFires(state.map, state.fireState, state.fireCoverage, state.prng, state.bldIdx, (buildingId) => {
    removeAgentsForBuilding(state.citizenRegistry, buildingId)
  })
  // Reputation after fires — fires can destroy buildings, affecting neighborhood quality
  computeReputation(state.reputationLayer, state.map, state.crimeLevel, state.fireCoverage, state.pollutionLevel, state.bldIdx, state.educationCoverage)

  // 8. Citizen monthly tick: replan stale routes, write trafficDensity from agent routes
  const tileLayers: TileLayers = {
    crimeLevel: state.crimeLevel,
    fireCoverage: state.fireCoverage,
    pollutionLevel: state.pollutionLevel,
    reputationLayer: state.reputationLayer,
    educationCoverage: state.educationCoverage,
  }
  citizenMonthlyTick(state.citizenRegistry, state.map, state.roadGraph, state.trafficDensity, tileLayers, state.bldIdx)
  state.citizenSummary = computeCitizenSummary(state.citizenRegistry)

  // 9. Zone development
  const nextBuildingIdRef = { value: state.nextBuildingId }
  updateZones(state.map, state.powerGrid, state.demand, state.prng, nextBuildingIdRef, state.bldIdx)
  updateDensity(
    state.map,
    state.powerGrid,
    state.demand,
    computeTotalPopulation(state.map),
    state.prng,
    nextBuildingIdRef,
    state.crimeLevel,
    state.fireCoverage,
    state.pollutionLevel,
    state.educationCoverage,
  )
  state.nextBuildingId = nextBuildingIdRef.value

  // 11. Sync citizen agents after zone/density changes
  syncResidentialAgents(state)

  // 12. Demographics — aging, deaths, births, migration
  const demoResult = demographicTick(state.citizenRegistry, state.map, state.prng, state.citizenSummary.avgSatisfaction)
  syncBuildingResidents(state.map, state.citizenRegistry)
  // Second sync: demographicTick changed resident counts, so agent counts need reconciling
  syncResidentialAgents(state)

  // 13. Refresh citizen summary with post-demographics data
  state.citizenSummary = computeCitizenSummary(state.citizenRegistry)
  state.citizenSummary.birthsLastTick = demoResult.births
  state.citizenSummary.deathsLastTick = demoResult.deaths
  state.citizenSummary.netMigrationLastTick = demoResult.netMigration

  // 14. Compute budget including loan repayment
  const population = computeTotalPopulation(state.map)
  const loanRepayment = computeLoanRepayment(state)
  state.budgetInfo = calculateBudget(state.map, population, state.taxRate, state.landValues, state.funding, loanRepayment)

  // Apply monthly balance (already includes repayment deduction)
  state.funds += state.budgetInfo.balance

  // Update loan book (funds already adjusted via balance)
  if (state.loan) {
    const payment = state.budgetInfo.loanRepayment
    state.loan.remaining -= payment
    state.loan.monthsLeft = Math.max(0, state.loan.monthsLeft - 1)
    if (state.loan.remaining <= 0) {
      state.loan = null
      state.loanRepaymentAmount = 0
    }
  }

  // Emergency loan check
  if (state.funds < 0 && state.loan === null) {
    const baseExpenses = state.budgetInfo.maintenanceCosts.total + state.budgetInfo.serviceCosts.total
    const emergencyAmount = Math.max(10_000, -state.funds + baseExpenses * 6)
    const monthlyPayment = calcMonthlyPayment(emergencyAmount)
    state.loan = { principal: emergencyAmount, remaining: emergencyAmount, monthlyPayment, termMonths: 120, monthsLeft: 120, interestRate: 0.08 }
    state.loanRepaymentAmount = monthlyPayment
    state.funds += emergencyAmount
    events.push({ type: 'emergency_loan', amount: emergencyAmount })
  }

  // Bankruptcy (loan exists but still broke after emergency loan)
  if (state.funds < 0 && state.loan !== null) {
    events.push({ type: 'bankruptcy' })
  }

  // 15. Record monthly snapshot
  state.history.push({
    month: state.month,
    year: state.year,
    population,
    funds: state.funds,
    taxIncome: state.budgetInfo.taxIncome,
    expenses: state.budgetInfo.projectedExpenses,
    rDemand: state.demand.residential,
    cDemand: state.demand.commercial,
    iDemand: state.demand.industrial,
    births: state.citizenSummary.birthsLastTick,
    deaths: state.citizenSummary.deathsLastTick,
    netMigration: state.citizenSummary.netMigrationLastTick,
  })
  if (state.history.length > 1200) state.history.shift()

  return {
    births: demoResult.births,
    deaths: demoResult.deaths,
    netMigration: demoResult.netMigration,
    events,
  }
}
