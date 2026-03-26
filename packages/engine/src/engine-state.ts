import {
  type GameMap,
  type BudgetInfo,
  type Loan,
  type MonthlySnapshot,
  type CitizenSummary,
  type SaveFile,
  DEFAULTS,
} from '@bitborough/core'
import { PRNG } from './prng.js'
import { buildRoadGraph, type RoadGraph } from './road-graph.js'
import { BuildingIndex } from './building-index.js'
import { BUILDING_DEFS } from './buildings-registry.js'
import {
  createRegistry, computeTotalPopulation, computeCitizenSummary,
  setNextAgentId,
  type CitizenRegistry,
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
  funding: { police: number; fire: number; transit: number; education: number }
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

export function serializeState(state: EngineState): SaveFile {
  // Convert active fires Map to array of [index, remaining] pairs
  const activeFires: Array<[number, number]> = Array.from(state.fireState.activeFires.entries())

  return {
    version: 9,
    map: {
      version: state.map.version,
      width: state.map.width,
      height: state.map.height,
      terrain: Array.from(state.map.terrain) as unknown as Uint8Array,
      zones: Array.from(state.map.zones) as unknown as Uint8Array,
      infrastructure: Array.from(state.map.infrastructure) as unknown as Uint16Array,
      connections: Array.from(state.map.connections) as unknown as Uint8Array,
      elevation: Array.from(state.map.elevation) as unknown as Uint8Array,
      buildings: state.map.buildings.map((b) => ({ ...b })),
      meta: { ...state.map.meta },
    },
    state: {
      funds: state.funds,
      population: computeTotalPopulation(state.map),
      month: state.month,
      year: state.year,
      tickCount: state.tickCount,
      taxRate: state.taxRate,
      funding: { ...state.funding },
      seed: state.prng.getInternalState(),
      activeFires,
      loan: state.loan,
      loanRepaymentAmount: state.loanRepaymentAmount,
      history: state.history,
      citizens: {
        samplingRatio: state.citizenRegistry.samplingRatio,
        agents: state.citizenRegistry.agents.map(a => ({
          id: a.id,
          homeBuildingId: a.homeBuildingId,
          homeAccessRoad: a.homeAccessRoad,
          workBuildingId: a.workBuildingId,
          workAccessRoad: a.workAccessRoad,
          commerceBuildingId: a.commerceBuildingId,
          commerceAccessRoad: a.commerceAccessRoad,
          homeWorkRoute: a.homeWorkRoute,
          homeCommerceRoute: a.homeCommerceRoute,
          satisfaction: a.satisfaction,
          demographics: a.demographics,
          wealthTier: a.wealthTier,
          schoolBuildingId: a.schoolBuildingId,
          schoolAccessRoad: a.schoolAccessRoad,
          homeSchoolRoute: a.homeSchoolRoute,
        })),
      },
      reputationLayer: Array.from(state.reputationLayer),
    },
    timestamp: new Date().toISOString(),
  }
}

export function restoreState(save: SaveFile): EngineState {
  // Rebuild typed arrays from saved number arrays
  const map: GameMap = {
    version: save.map.version,
    width: save.map.width,
    height: save.map.height,
    terrain: new Uint8Array(save.map.terrain),
    zones: new Uint8Array(save.map.zones),
    infrastructure: new Uint16Array(save.map.infrastructure),
    connections: new Uint8Array(save.map.connections),
    elevation: new Uint8Array(save.map.elevation),
    buildings: save.map.buildings.map((b) => ({
      ...b,
      state: b.state ?? 'active',
      residents:
        b.residents ??
        // v1 save: default to capacity so old cities aren't empty
        (save.version < 2 ? (BUILDING_DEFS[b.defId]?.capacity ?? 0) : 0),
      lowOccupancyMonths: b.lowOccupancyMonths,
    })),
    meta: { ...save.map.meta },
  }

  const size = map.width * map.height

  // Build citizen registry
  let citizenRegistry
  if (save.state.citizens) {
    citizenRegistry = {
      samplingRatio: save.state.citizens.samplingRatio,
      agents: save.state.citizens.agents.map(a => ({
        ...a,
        demographics: a.demographics ?? { children: 0, working: 50, elderly: 0 },
        wealthTier: a.wealthTier ?? 2,
        homeWorkRouteStale: false,
        homeCommerceRouteStale: false,
        homeWorkRouteTileSet: new Set(a.homeWorkRoute),
        homeCommerceRouteTileSet: new Set(a.homeCommerceRoute),
        schoolBuildingId: a.schoolBuildingId ?? null,
        schoolAccessRoad: a.schoolAccessRoad ?? null,
        homeSchoolRoute: a.homeSchoolRoute ?? [],
        homeSchoolRouteTileSet: new Set(a.homeSchoolRoute ?? []),
        homeSchoolRouteStale: false,
      })),
    }
  } else {
    citizenRegistry = createRegistry()
  }

  const reputationLayer = save.state.reputationLayer
    ? new Float32Array(save.state.reputationLayer)
    : new Float32Array(size).fill(0.5)

  // Build EngineState manually for restore (not via createEngineState)
  const state: EngineState = {
    map,
    prng: PRNG.fromState(save.state.seed),
    tickCount: save.state.tickCount,
    month: save.state.month,
    year: save.state.year,
    funds: save.state.funds,
    taxRate: save.state.taxRate,
    ticksPerMonth: DEFAULTS.ticksPerMonth,
    monthsPerYear: DEFAULTS.monthsPerYear,
    demand: { residential: 0, commercial: 0, industrial: 0 },
    funding: {
      police: save.state.funding.police ?? 100,
      fire: save.state.funding.fire ?? 100,
      transit: save.state.funding.transit ?? 100,
      education: save.state.funding.education ?? 100,
    },
    budgetInfo: undefined!,  // will be set below
    powerGrid: new Uint8Array(size),
    landValues: new Uint8Array(size),
    pollutionLevel: new Uint8Array(size),
    crimeLevel: new Uint8Array(size),
    fireCoverage: new Uint8Array(size),
    trafficDensity: new Uint8Array(size),
    reputationLayer,
    citizenRegistry,
    roadGraph: buildRoadGraph(map),
    citizenSummary: computeCitizenSummary(citizenRegistry),
    fireState: { activeFires: new Map() },
    influenceBuffer: new Float32Array(size),
    pollutionBuffer: new Float32Array(size),
    bldIdx: new BuildingIndex(map),
    loan: save.state.loan ?? null,
    loanRepaymentAmount: save.state.loanRepaymentAmount ?? (save.state.loan?.monthlyPayment ?? 0),
    history: save.state.history ?? [],
    nextBuildingId: maxPrefixedId(map.buildings, 'b') + 1,
  }

  // Restore active fires
  const savedFires = save.state.activeFires
  if (savedFires) {
    for (const [idx, remaining] of savedFires) {
      state.fireState.activeFires.set(idx, remaining)
    }
  }

  if (state.citizenRegistry.agents.length > 0) {
    setNextAgentId(maxPrefixedId(state.citizenRegistry.agents, 'c') + 1)
  }

  // Rebuild derived state (reputation is NOT recomputed — it's restored from the save file)
  propagatePower(state.map, state.powerGrid, state.bldIdx)
  rebuildDerivedState(state)
  state.demand = calculateDemand(state.map, state.taxRate, undefined, state.citizenSummary)
  state.budgetInfo = calculateBudget(
    state.map,
    computeTotalPopulation(state.map),
    state.taxRate,
    state.landValues,
    state.funding,
    computeLoanRepayment(state),
  )

  return state
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
    funding: { police: 100, fire: 100, transit: 100, education: 100 },
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
