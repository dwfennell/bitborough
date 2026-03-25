import {
  type GameMap,
  type BudgetInfo,
  type Loan,
  type MonthlySnapshot,
  type CitizenSummary,
  DEFAULTS,
} from '@bitborough/core'
import { PRNG } from './prng.js'
import { buildRoadGraph, type RoadGraph } from './road-graph.js'
import { BuildingIndex } from './building-index.js'
import {
  createRegistry, computeTotalPopulation, type CitizenRegistry,
  EMPTY_CITIZEN_SUMMARY,
} from './simulation/citizens.js'
import { propagatePower } from './simulation/power.js'
import { calculateDemand } from './simulation/demand.js'
import { calculateLandValues } from './simulation/land-value.js'
import { calculateBudget } from './simulation/budget.js'
import { calculateCrime } from './simulation/services/crime.js'
import { calculateFireCoverage, createFireState, type FireState } from './simulation/services/fire.js'
import { computeReputation } from './simulation/reputation.js'
import { calculatePollution } from './simulation/pollution.js'

export interface EngineConfig {
  seed?: number
  startingFunds?: number
  ticksPerMonth?: number
  monthsPerYear?: number
  startYear?: number
  startMonth?: number
  taxRate?: number
}

export interface EngineState {
  map: GameMap
  prng: PRNG
  tickCount: number
  month: number
  year: number
  funds: number
  taxRate: number
  ticksPerMonth: number
  monthsPerYear: number

  // Demand
  demand: { residential: number; commercial: number; industrial: number }

  // Budget
  funding: { police: number; fire: number; transit: number }
  budgetInfo: BudgetInfo

  // Simulation layers
  powerGrid: Uint8Array
  landValues: Uint8Array
  pollutionLevel: Uint8Array
  crimeLevel: Uint8Array
  fireCoverage: Uint8Array
  trafficDensity: Uint8Array
  reputationLayer: Float32Array

  // Citizens
  citizenRegistry: CitizenRegistry
  roadGraph: RoadGraph
  citizenSummary: CitizenSummary

  // Fire system
  fireState: FireState

  // Reusable buffers for radial calculations (avoids per-tick allocation)
  influenceBuffer: Float32Array
  pollutionBuffer: Float32Array

  // Spatial index for O(1) building lookups; rebuilt when buildings change
  bldIdx: BuildingIndex

  // Loan system
  loan: Loan | null
  loanRepaymentAmount: number

  // History
  history: MonthlySnapshot[]

  // Building ID counter
  nextBuildingId: number
}

export function maxPrefixedId(items: ReadonlyArray<{ id: string }>, prefix: string): number {
  let max = 0
  for (const item of items) {
    const n = parseInt(item.id.slice(prefix.length), 10)
    if (n > max) max = n
  }
  return max
}

export function computeLoanRepayment(state: EngineState): number {
  if (!state.loan) return 0
  return Math.round(Math.min(state.loanRepaymentAmount, state.loan.remaining))
}

export function rebuildDerivedState(state: EngineState): void {
  state.bldIdx = new BuildingIndex(state.map)
  calculatePollution(state.map, state.pollutionLevel, state.pollutionBuffer)
  calculateLandValues(state.map, state.powerGrid, state.pollutionLevel, state.crimeLevel, state.landValues, state.bldIdx)
  calculateCrime(state.map, state.landValues, state.crimeLevel, state.funding.police, state.influenceBuffer)
  calculateFireCoverage(state.map, state.fireCoverage, state.funding.fire, state.influenceBuffer)
}

export function createEngineState(map: GameMap, config: EngineConfig): EngineState {
  const prng = new PRNG(config.seed ?? Date.now())
  const ticksPerMonth = config.ticksPerMonth ?? DEFAULTS.ticksPerMonth
  const monthsPerYear = config.monthsPerYear ?? DEFAULTS.monthsPerYear
  const month = config.startMonth ?? DEFAULTS.startMonth
  const year = config.startYear ?? DEFAULTS.startYear
  const taxRate = config.taxRate ?? DEFAULTS.taxRate

  const defaultFunds = DEFAULTS.startingFunds[map.width] ?? 20_000
  const funds = config.startingFunds ?? defaultFunds

  const size = map.width * map.height
  const powerGrid = new Uint8Array(size)
  const landValues = new Uint8Array(size)
  const pollutionLevel = new Uint8Array(size)
  const crimeLevel = new Uint8Array(size)
  const fireCoverage = new Uint8Array(size)
  const trafficDensity = new Uint8Array(size)
  const reputationLayer = new Float32Array(size).fill(0.5)
  const fireState = createFireState()
  const influenceBuffer = new Float32Array(size)
  const pollutionBuffer = new Float32Array(size)
  const bldIdx = new BuildingIndex(map)
  const citizenRegistry = createRegistry()
  const roadGraph = buildRoadGraph(map)
  const citizenSummary: CitizenSummary = { ...EMPTY_CITIZEN_SUMMARY }

  const state: EngineState = {
    map,
    prng,
    tickCount: 0,
    month,
    year,
    funds,
    taxRate,
    ticksPerMonth,
    monthsPerYear,
    demand: { residential: 0, commercial: 0, industrial: 0 },
    funding: { police: 100, fire: 100, transit: 100 },
    budgetInfo: undefined!,  // will be set below
    powerGrid,
    landValues,
    pollutionLevel,
    crimeLevel,
    fireCoverage,
    trafficDensity,
    reputationLayer,
    citizenRegistry,
    roadGraph,
    citizenSummary,
    fireState,
    influenceBuffer,
    pollutionBuffer,
    bldIdx,
    loan: null,
    loanRepaymentAmount: 0,
    history: [],
    nextBuildingId: 1,
  }

  // Power propagation runs on init + every tick
  propagatePower(state.map, state.powerGrid, state.bldIdx)

  // Rebuild derived state: pollution, land values, crime, fire coverage
  rebuildDerivedState(state)

  // Reputation must run after rebuildDerivedState
  computeReputation(state.reputationLayer, state.map, state.crimeLevel, state.fireCoverage, state.pollutionLevel, state.bldIdx)

  // Initialize demand
  state.demand = calculateDemand(state.map, state.taxRate)

  // Initialize budget
  state.budgetInfo = calculateBudget(state.map, computeTotalPopulation(state.map), state.taxRate, state.landValues, state.funding)

  return state
}
