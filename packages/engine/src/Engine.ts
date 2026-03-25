import {
  type GameMap,
  type GameState,
  type SaveFile,
  type Building,
  type Result,
  type GameEvent,
  calcMonthlyPayment,
  TileType,
  ZoneType,
  Infrastructure,
  BuildingCategory,
  FailReason,
  SimSpeed,
  DEFAULTS,
  COSTS,
} from '@bitborough/core'
import { PRNG } from './prng.js'
import { placeTile, placeZone } from './actions/place.js'
import { bulldoze } from './actions/bulldoze.js'
import { updateConnections } from './connections.js'
import { propagatePower } from './simulation/power.js'
import { calculateDemand } from './simulation/demand.js'
import { calculateLandValues } from './simulation/land-value.js'
import { updateZones } from './simulation/zones.js'
import { calculateBudget } from './simulation/budget.js'
import { calculateCrime } from './simulation/services/crime.js'
import { calculateFireCoverage, updateFires } from './simulation/services/fire.js'
import { buildRoadGraph, updateRoadGraph } from './road-graph.js'
import {
  createRegistry, syncAgentsForBuilding, removeAgentsForBuilding,
  citizenMonthlyTick, computeCitizenSummary, markRoutesStale, markRoutesStaleBatch,
  setNextAgentId, computeTotalPopulation,
  syncBuildingResidents,
  type TileLayers,
} from './simulation/citizens.js'
import { computeReputation } from './simulation/reputation.js'
import { calculatePollution } from './simulation/pollution.js'
import { demographicTick } from './simulation/demographics.js'
import { updateDensity } from './simulation/density.js'
import { hasNearbyRoad } from './simulation/road-access.js'
import { BUILDING_DEFS } from './buildings-registry.js'
import { BuildingIndex } from './building-index.js'
import {
  type EngineState,
  type EngineConfig,
  createEngineState,
  rebuildDerivedState,
  computeLoanRepayment,
  maxPrefixedId,
} from './engine-state.js'

export type { EngineConfig }

export interface TileInfo {
  terrain: TileType
  zone: ZoneType
  infrastructure: number
  connections: number
  elevation: number
  powered: boolean
  hasRoadAccess: boolean
  landValue: number
  crimeLevel: number
  fireCoverage: number
  pollutionLevel: number
  reputation: number
}

export class Engine {
  private state: EngineState
  private speed: SimSpeed = SimSpeed.Normal
  private events: GameEvent[] = []

  private get population(): number { return computeTotalPopulation(this.state.map) }

  private constructor(state: EngineState) {
    this.state = state
  }

  static create(map: GameMap, config: EngineConfig = {}): Engine {
    return new Engine(createEngineState(map, config))
  }

  tick(): void {
    this.state.tickCount++

    // Power propagation runs every tick (uses cached building index)
    propagatePower(this.state.map, this.state.powerGrid, this.state.bldIdx)

    // Monthly systems
    if (this.state.tickCount % this.state.ticksPerMonth === 0) {
      // 0. Clear events at start of monthly tick
      this.events = []

      // Rebuild index — buildings may change during monthly simulation
      this.state.bldIdx = new BuildingIndex(this.state.map)
      this.state.month++
      if (this.state.month > this.state.monthsPerYear) {
        this.state.month = 1
        this.state.year++
      }

      this.state.demand = calculateDemand(this.state.map, this.state.taxRate, this.state.trafficDensity, this.state.citizenSummary)

      // Pollution propagation — must run before land values / desirability
      calculatePollution(this.state.map, this.state.pollutionLevel, this.state.pollutionBuffer)

      // Land values use previous month's crime; crime uses updated land values
      calculateLandValues(this.state.map, this.state.powerGrid, this.state.pollutionLevel, this.state.crimeLevel, this.state.landValues, this.state.bldIdx)
      calculateCrime(this.state.map, this.state.landValues, this.state.crimeLevel, this.state.funding.police, this.state.influenceBuffer)
      calculateFireCoverage(this.state.map, this.state.fireCoverage, this.state.funding.fire, this.state.influenceBuffer)
      updateFires(this.state.map, this.state.fireState, this.state.fireCoverage, this.state.prng, this.state.bldIdx)
      computeReputation(this.state.reputationLayer, this.state.map, this.state.crimeLevel, this.state.fireCoverage, this.state.pollutionLevel, this.state.bldIdx)
      // Citizen monthly tick: replan stale routes, write trafficDensity from agent routes
      const tileLayers: TileLayers = {
        crimeLevel: this.state.crimeLevel,
        fireCoverage: this.state.fireCoverage,
        pollutionLevel: this.state.pollutionLevel,
        reputationLayer: this.state.reputationLayer,
      }
      citizenMonthlyTick(this.state.citizenRegistry, this.state.map, this.state.roadGraph, this.state.trafficDensity, tileLayers, this.state.bldIdx)
      this.state.citizenSummary = computeCitizenSummary(this.state.citizenRegistry)

      // Zone development
      const nextBuildingIdRef = { value: this.state.nextBuildingId }
      updateZones(this.state.map, this.state.powerGrid, this.state.demand, this.state.prng, nextBuildingIdRef, this.state.bldIdx)
      this.state.nextBuildingId = nextBuildingIdRef.value

      // Density progression
      updateDensity(
        this.state.map,
        this.state.powerGrid,
        this.state.demand,
        this.population,
        this.state.prng,
        nextBuildingIdRef,
        this.state.crimeLevel,
        this.state.fireCoverage,
        this.state.pollutionLevel,
      )
      this.state.nextBuildingId = nextBuildingIdRef.value

      // Sync citizen agents after zone/density changes
      this.syncResidentialAgents()

      // Demographics — aging, deaths, births, migration
      const demoResult = demographicTick(this.state.citizenRegistry, this.state.map, this.state.prng, this.state.citizenSummary.avgSatisfaction)
      syncBuildingResidents(this.state.map, this.state.citizenRegistry)
      // Second sync: demographicTick changed resident counts, so agent counts need reconciling
      this.syncResidentialAgents()

      // Refresh citizen summary with post-demographics data
      this.state.citizenSummary = computeCitizenSummary(this.state.citizenRegistry)
      this.state.citizenSummary.birthsLastTick = demoResult.births
      this.state.citizenSummary.deathsLastTick = demoResult.deaths
      this.state.citizenSummary.netMigrationLastTick = demoResult.netMigration

      // 1. Compute budget including loan repayment
      const loanRepayment = computeLoanRepayment(this.state)
      this.state.budgetInfo = calculateBudget(this.state.map, this.population, this.state.taxRate, this.state.landValues, this.state.funding, loanRepayment)

      // 2. Apply monthly balance (already includes repayment deduction)
      this.state.funds += this.state.budgetInfo.balance

      // 3. Update loan book (funds already adjusted via balance)
      if (this.state.loan) {
        const payment = this.state.budgetInfo.loanRepayment
        this.state.loan.remaining -= payment
        this.state.loan.monthsLeft = Math.max(0, this.state.loan.monthsLeft - 1)
        if (this.state.loan.remaining <= 0) {
          this.state.loan = null
          this.state.loanRepaymentAmount = 0
        }
      }

      // 4. Emergency loan check
      if (this.state.funds < 0 && this.state.loan === null) {
        const baseExpenses = this.state.budgetInfo.maintenanceCosts.total + this.state.budgetInfo.serviceCosts.total
        const emergencyAmount = Math.max(10_000, -this.state.funds + baseExpenses * 6)
        const monthlyPayment = calcMonthlyPayment(emergencyAmount)
        this.state.loan = { principal: emergencyAmount, remaining: emergencyAmount, monthlyPayment, termMonths: 120, monthsLeft: 120, interestRate: 0.08 }
        this.state.loanRepaymentAmount = monthlyPayment
        this.state.funds += emergencyAmount
        this.events.push({ type: 'emergency_loan', amount: emergencyAmount })
      }

      // 5. Bankruptcy (loan exists but still broke after emergency loan)
      if (this.state.funds < 0 && this.state.loan !== null) {
        this.events.push({ type: 'bankruptcy' })
      }

      // 6. Record monthly snapshot
      this.state.history.push({
        month: this.state.month,
        year: this.state.year,
        population: this.population,
        funds: this.state.funds,
        taxIncome: this.state.budgetInfo.taxIncome,
        expenses: this.state.budgetInfo.projectedExpenses,
        rDemand: this.state.demand.residential,
        cDemand: this.state.demand.commercial,
        iDemand: this.state.demand.industrial,
        births: this.state.citizenSummary.birthsLastTick,
        deaths: this.state.citizenSummary.deathsLastTick,
        netMigration: this.state.citizenSummary.netMigrationLastTick,
      })
      if (this.state.history.length > 1200) this.state.history.shift()
    }
  }

  getState(): GameState {
    return {
      map: this.state.map,
      time: {
        tickCount: this.state.tickCount,
        month: this.state.month,
        year: this.state.year,
        speed: this.speed,
      },
      population: this.population,
      funds: this.state.funds,
      demand: this.state.demand,
      budget: { ...this.state.budgetInfo, totalFunds: this.state.funds },
      powerGrid: this.state.powerGrid,
      landValues: this.state.landValues,
      pollutionLevel: this.state.pollutionLevel,
      crimeLevel: this.state.crimeLevel,
      fireCoverage: this.state.fireCoverage,
      trafficDensity: this.state.trafficDensity,
      activeFires: Array.from(this.state.fireState.activeFires.keys()),
      loan: this.state.loan,
      loanRepaymentAmount: this.state.loanRepaymentAmount,
      events: this.events,
      history: this.state.history,
      citizens: this.state.citizenSummary,
    }
  }

  getDemand() {
    return this.state.demand
  }

  getTile(x: number, y: number): TileInfo {
    const idx = y * this.state.map.width + x
    return {
      terrain: this.state.map.terrain[idx] as TileType,
      zone: this.state.map.zones[idx] as ZoneType,
      infrastructure: this.state.map.infrastructure[idx]!,
      connections: this.state.map.connections[idx]!,
      elevation: this.state.map.elevation[idx]!,
      powered: this.state.powerGrid[idx] !== 0,
      hasRoadAccess: hasNearbyRoad(this.state.map, x, y),
      landValue: this.state.landValues[idx]!,
      crimeLevel: this.state.crimeLevel[idx]!,
      fireCoverage: this.state.fireCoverage[idx]!,
      pollutionLevel: this.state.pollutionLevel[idx]!,
      reputation: this.state.reputationLayer[idx]!,
    }
  }

  placeTile(x: number, y: number, infra: Infrastructure): Result {
    const { result, cost } = placeTile(this.state.map, x, y, infra, this.state.funds, this.state.bldIdx)
    this.state.funds -= cost
    if (result.ok) {
      updateConnections(this.state.map, x, y)
      const placedInfra = this.state.map.infrastructure[y * this.state.map.width + x]!
      if (placedInfra & Infrastructure.Road) {
        updateRoadGraph(this.state.map, this.state.roadGraph, x, y)
        markRoutesStale(this.state.citizenRegistry, y * this.state.map.width + x)
      }
    }
    return result
  }

  placeZone(x: number, y: number, zone: ZoneType): Result {
    return placeZone(this.state.map, x, y, zone, this.state.bldIdx)
  }

  upgradeTile(x: number, y: number): Result {
    const idx = y * this.state.map.width + x
    const infra = this.state.map.infrastructure[idx]!

    if (!(infra & Infrastructure.Road)) {
      return { ok: false, reason: FailReason.InvalidLocation, detail: 'No road to upgrade' }
    }
    if (infra & Infrastructure.PavedRoad) {
      return { ok: false, reason: FailReason.Occupied, detail: 'Road already paved' }
    }

    const cost = COSTS.pavedRoadUpgrade
    if (this.state.funds < cost) {
      return { ok: false, reason: FailReason.InsufficientFunds }
    }

    this.state.map.infrastructure[idx]! |= Infrastructure.PavedRoad
    this.state.funds -= cost
    return { ok: true }
  }

  bulldoze(x: number, y: number): Result {
    // Read the building before bulldoze so we know the footprint for cleanup
    const building = this.state.bldIdx.get(x, y)
    const def = building ? BUILDING_DEFS[building.defId] : undefined

    const { result, cost } = bulldoze(this.state.map, x, y, this.state.funds, this.state.bldIdx)
    this.state.funds -= cost
    if (result.ok) {
      this.state.bldIdx = new BuildingIndex(this.state.map)

      if (building && def) {
        for (let dy = 0; dy < def.size.h; dy++) {
          for (let dx = 0; dx < def.size.w; dx++) {
            updateConnections(this.state.map, building.x + dx, building.y + dy)
            updateRoadGraph(this.state.map, this.state.roadGraph, building.x + dx, building.y + dy)
          }
        }
        // Batch mark all footprint tiles as stale in a single agent scan
        const staleTiles = new Set<number>()
        for (let dy = 0; dy < def.size.h; dy++) {
          for (let dx = 0; dx < def.size.w; dx++) {
            staleTiles.add((building.y + dy) * this.state.map.width + (building.x + dx))
          }
        }
        markRoutesStaleBatch(this.state.citizenRegistry, staleTiles)
        removeAgentsForBuilding(this.state.citizenRegistry, building.id)
      } else {
        updateConnections(this.state.map, x, y)
        updateRoadGraph(this.state.map, this.state.roadGraph, x, y)
        markRoutesStale(this.state.citizenRegistry, y * this.state.map.width + x)
      }
    }
    return result
  }

  placeBuilding(x: number, y: number, defId: string): Result {
    const def = BUILDING_DEFS[defId]
    if (!def) {
      return { ok: false, reason: FailReason.InvalidLocation, detail: `Unknown building: ${defId}` }
    }

    // Check funds
    if (this.state.funds < def.cost) {
      return { ok: false, reason: FailReason.InsufficientFunds }
    }

    // Check footprint fits on map, no water, no existing buildings
    for (let dy = 0; dy < def.size.h; dy++) {
      for (let dx = 0; dx < def.size.w; dx++) {
        const tx = x + dx
        const ty = y + dy
        if (tx < 0 || ty < 0 || tx >= this.state.map.width || ty >= this.state.map.height) {
          return { ok: false, reason: FailReason.InvalidLocation, detail: 'Footprint out of bounds' }
        }
        const idx = ty * this.state.map.width + tx
        if (this.state.map.terrain[idx] === TileType.Water) {
          return { ok: false, reason: FailReason.InvalidLocation, detail: 'Cannot build on water' }
        }
      }
    }

    // Check overlap with existing buildings using spatial index
    for (let dy = 0; dy < def.size.h; dy++) {
      for (let dx = 0; dx < def.size.w; dx++) {
        if (this.state.bldIdx.has(x + dx, y + dy)) {
          return { ok: false, reason: FailReason.Occupied }
        }
      }
    }

    // Create building
    const building: Building = {
      id: `b${this.state.nextBuildingId++}`,
      defId,
      x,
      y,
      powered: false,
      density: def.density,
      age: 0,
      state: 'active',
      residents: 0,
    }

    this.state.map.buildings.push(building)
    this.state.bldIdx = new BuildingIndex(this.state.map)
    this.state.funds -= def.cost

    // Clear zones under the building footprint
    for (let dy = 0; dy < def.size.h; dy++) {
      for (let dx = 0; dx < def.size.w; dx++) {
        const idx = (y + dy) * this.state.map.width + (x + dx)
        this.state.map.zones[idx] = ZoneType.None
      }
    }

    return { ok: true }
  }

  private syncResidentialAgents(): void {
    for (const b of this.state.map.buildings) {
      if (b.state === 'active') {
        const def = BUILDING_DEFS[b.defId]
        if (def && def.category === BuildingCategory.Residential) {
          syncAgentsForBuilding(this.state.map, this.state.citizenRegistry, this.state.roadGraph, b, this.state.trafficDensity, this.state.prng, this.state.reputationLayer)
        }
      }
    }
  }

  setTaxRate(rate: number): void {
    this.state.taxRate = Math.max(0, Math.min(0.2, rate))
    this.state.budgetInfo = calculateBudget(this.state.map, this.population, this.state.taxRate, this.state.landValues, this.state.funding, computeLoanRepayment(this.state))
  }

  setFunding(service: 'police' | 'fire' | 'transit', level: number): void {
    this.state.funding[service] = Math.max(0, Math.min(100, level))
    this.state.budgetInfo = calculateBudget(this.state.map, this.population, this.state.taxRate, this.state.landValues, this.state.funding, computeLoanRepayment(this.state))
  }

  takeLoan(amount: number): Result {
    if (this.state.loan !== null) return { ok: false, reason: FailReason.LoanExists }
    const maxLoanAmount = this.state.budgetInfo.taxIncome * 48
    if (amount < 10_000 || amount > maxLoanAmount) return { ok: false, reason: FailReason.AmountOutOfRange }
    const monthlyPayment = calcMonthlyPayment(amount)
    this.state.loan = { principal: amount, remaining: amount, monthlyPayment, termMonths: 120, monthsLeft: 120, interestRate: 0.08 }
    this.state.loanRepaymentAmount = monthlyPayment
    this.state.funds += amount
    return { ok: true }
  }

  setLoanRepayment(amount: number): Result {
    if (this.state.loan === null) return { ok: false, reason: FailReason.NoActiveLoan }
    if (amount < this.state.loan.monthlyPayment || amount > this.state.loan.remaining) return { ok: false, reason: FailReason.AmountOutOfRange }
    this.state.loanRepaymentAmount = amount
    return { ok: true }
  }

  serialize(): SaveFile {
    // Convert active fires Map to array of [index, remaining] pairs
    const activeFires: Array<[number, number]> = Array.from(this.state.fireState.activeFires.entries())

    return {
      version: 7,
      map: {
        version: this.state.map.version,
        width: this.state.map.width,
        height: this.state.map.height,
        terrain: Array.from(this.state.map.terrain) as unknown as Uint8Array,
        zones: Array.from(this.state.map.zones) as unknown as Uint8Array,
        infrastructure: Array.from(this.state.map.infrastructure) as unknown as Uint16Array,
        connections: Array.from(this.state.map.connections) as unknown as Uint8Array,
        elevation: Array.from(this.state.map.elevation) as unknown as Uint8Array,
        buildings: this.state.map.buildings.map((b) => ({ ...b })),
        meta: { ...this.state.map.meta },
      },
      state: {
        funds: this.state.funds,
        population: this.population,
        month: this.state.month,
        year: this.state.year,
        tickCount: this.state.tickCount,
        taxRate: this.state.taxRate,
        funding: { ...this.state.funding },
        seed: this.state.prng.getInternalState(),
        activeFires,
        loan: this.state.loan,
        loanRepaymentAmount: this.state.loanRepaymentAmount,
        history: this.state.history,
        citizens: {
          samplingRatio: this.state.citizenRegistry.samplingRatio,
          agents: this.state.citizenRegistry.agents.map(a => ({
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
          })),
        },
        reputationLayer: Array.from(this.state.reputationLayer),
      },
      timestamp: new Date().toISOString(),
    }
  }

  static restore(save: SaveFile): Engine {
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

    // Rebuild derived state
    propagatePower(state.map, state.powerGrid, state.bldIdx)
    calculatePollution(state.map, state.pollutionLevel, state.pollutionBuffer)
    calculateLandValues(state.map, state.powerGrid, state.pollutionLevel, state.crimeLevel, state.landValues, state.bldIdx)
    calculateCrime(state.map, state.landValues, state.crimeLevel, state.funding.police, state.influenceBuffer)
    calculateFireCoverage(state.map, state.fireCoverage, state.funding.fire, state.influenceBuffer)
    state.demand = calculateDemand(state.map, state.taxRate, undefined, state.citizenSummary)
    state.budgetInfo = calculateBudget(
      state.map,
      computeTotalPopulation(state.map),
      state.taxRate,
      state.landValues,
      state.funding,
      computeLoanRepayment(state),
    )

    return new Engine(state)
  }
}
