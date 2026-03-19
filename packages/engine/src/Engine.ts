import {
  type GameMap,
  type GameState,
  type SaveFile,
  type BudgetInfo,
  type Building,
  type Result,
  type Loan,
  type GameEvent,
  type MonthlySnapshot,
  type CitizenSummary,
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
import { calculateFireCoverage, updateFires, createFireState, type FireState } from './simulation/services/fire.js'
import { buildRoadGraph, updateRoadGraph, type RoadGraph } from './road-graph.js'
import {
  createRegistry, syncAgentsForBuilding, removeAgentsForBuilding,
  citizenMonthlyTick, computeCitizenSummary, markRoutesStale,
  EMPTY_CITIZEN_SUMMARY,
  type CitizenRegistry,
} from './simulation/citizens.js'
import { updateDensity } from './simulation/density.js'
import { hasNearbyRoad } from './simulation/road-access.js'
import { BUILDING_DEFS } from './buildings-registry.js'
import { BuildingIndex } from './building-index.js'

export interface TileInfo {
  terrain: TileType
  zone: ZoneType
  infrastructure: number
  connections: number
  elevation: number
  powered: boolean
  hasRoadAccess: boolean
}

export interface EngineConfig {
  seed?: number
  startingFunds?: number
  ticksPerMonth?: number
  monthsPerYear?: number
  startYear?: number
  startMonth?: number
  taxRate?: number
}

export class Engine {
  private map: GameMap
  private prng: PRNG
  private tickCount = 0
  private month: number
  private year: number
  private speed: SimSpeed = SimSpeed.Normal
  private funds: number
  private population = 0
  private taxRate: number
  private ticksPerMonth: number
  private monthsPerYear: number

  // Demand
  private demand: { residential: number; commercial: number; industrial: number }

  // Budget
  private funding: { police: number; fire: number; transit: number }
  private budgetInfo: BudgetInfo

  // Simulation layers
  private powerGrid: Uint8Array
  private landValues: Uint8Array
  private pollutionLevel: Uint8Array
  private crimeLevel: Uint8Array
  private fireCoverage: Uint8Array
  private trafficDensity: Uint8Array

  // Citizens
  private citizenRegistry: CitizenRegistry
  private roadGraph: RoadGraph
  private citizenSummary: CitizenSummary

  // Fire system
  private fireState: FireState

  // Reusable buffer for radial influence calculations (avoids per-tick allocation)
  private influenceBuffer: Float32Array

  // Spatial index for O(1) building lookups; rebuilt when buildings change
  private bldIdx: BuildingIndex

  // Loan system
  private loan: Loan | null = null
  private loanRepaymentAmount: number = 0
  private events: GameEvent[] = []

  // History
  private history: MonthlySnapshot[] = []

  private computeLoanRepayment(): number {
    if (!this.loan) return 0
    return Math.round(Math.min(this.loanRepaymentAmount, this.loan.remaining))
  }

  private constructor(map: GameMap, config: EngineConfig) {
    this.map = map
    this.prng = new PRNG(config.seed ?? Date.now())
    this.ticksPerMonth = config.ticksPerMonth ?? DEFAULTS.ticksPerMonth
    this.monthsPerYear = config.monthsPerYear ?? DEFAULTS.monthsPerYear
    this.month = config.startMonth ?? DEFAULTS.startMonth
    this.year = config.startYear ?? DEFAULTS.startYear
    this.taxRate = config.taxRate ?? DEFAULTS.taxRate

    const defaultFunds = DEFAULTS.startingFunds[map.width] ?? 20_000
    this.funds = config.startingFunds ?? defaultFunds

    const size = map.width * map.height
    this.powerGrid = new Uint8Array(size)
    this.landValues = new Uint8Array(size)
    this.pollutionLevel = new Uint8Array(size)
    this.crimeLevel = new Uint8Array(size)
    this.fireCoverage = new Uint8Array(size)
    this.trafficDensity = new Uint8Array(size)
    this.fireState = createFireState()
    this.influenceBuffer = new Float32Array(size)
    this.bldIdx = new BuildingIndex(map)
    this.citizenRegistry = createRegistry()
    this.roadGraph = buildRoadGraph(this.map)
    this.citizenSummary = { ...EMPTY_CITIZEN_SUMMARY }

    // Initialize demand
    this.demand = calculateDemand(this.map, this.taxRate)

    // Initialize budget
    this.funding = { police: 100, fire: 100, transit: 100 }
    this.budgetInfo = calculateBudget(this.map, this.population, this.taxRate, this.landValues, this.funding)
  }

  static create(map: GameMap, config: EngineConfig = {}): Engine {
    return new Engine(map, config)
  }

  private nextBuildingId = 1

  tick(): void {
    this.tickCount++

    // Power propagation runs every tick (uses cached building index)
    propagatePower(this.map, this.powerGrid, this.bldIdx)

    // Monthly systems
    if (this.tickCount % this.ticksPerMonth === 0) {
      // 0. Clear events at start of monthly tick
      this.events = []

      // Rebuild index — buildings may change during monthly simulation
      this.bldIdx = new BuildingIndex(this.map)
      this.month++
      if (this.month > this.monthsPerYear) {
        this.month = 1
        this.year++
      }

      this.demand = calculateDemand(this.map, this.taxRate, this.trafficDensity, this.citizenSummary)

      // Land values use previous month's crime; crime uses updated land values
      calculateLandValues(this.map, this.powerGrid, this.pollutionLevel, this.crimeLevel, this.landValues, this.bldIdx)
      calculateCrime(this.map, this.landValues, this.crimeLevel, this.funding.police, this.influenceBuffer)
      calculateFireCoverage(this.map, this.fireCoverage, this.funding.fire, this.influenceBuffer)
      updateFires(this.map, this.fireState, this.fireCoverage, this.prng, this.bldIdx)
      // Citizen monthly tick: replan stale routes, write trafficDensity from agent routes
      citizenMonthlyTick(this.citizenRegistry, this.map, this.roadGraph, this.trafficDensity)
      this.citizenSummary = computeCitizenSummary(this.citizenRegistry)

      // Zone development
      const nextBuildingIdRef = { value: this.nextBuildingId }
      const { populationDelta } = updateZones(this.map, this.powerGrid, this.demand, this.prng, nextBuildingIdRef, this.bldIdx)
      this.nextBuildingId = nextBuildingIdRef.value
      this.population += populationDelta

      // Density progression
      const { populationDelta: densityDelta } = updateDensity(
        this.map,
        this.powerGrid,
        this.demand,
        this.population,
        this.prng,
        nextBuildingIdRef,
        this.crimeLevel,
        this.fireCoverage,
        this.pollutionLevel,
      )
      this.nextBuildingId = nextBuildingIdRef.value
      this.population = Math.max(0, this.population + densityDelta)

      // Sync citizen agents after zone/density changes (population may have changed)
      for (const b of this.map.buildings) {
        if (b.state === 'active') {
          const def = BUILDING_DEFS[b.defId]
          if (def && def.category === BuildingCategory.Residential) {
            syncAgentsForBuilding(this.map, this.citizenRegistry, this.roadGraph, b)
          }
        }
      }

      // 1. Compute budget including loan repayment
      const loanRepayment = this.computeLoanRepayment()
      this.budgetInfo = calculateBudget(this.map, this.population, this.taxRate, this.landValues, this.funding, loanRepayment)

      // 2. Apply monthly balance (already includes repayment deduction)
      this.funds += this.budgetInfo.balance

      // 3. Update loan book (funds already adjusted via balance)
      if (this.loan) {
        const payment = this.budgetInfo.loanRepayment
        this.loan.remaining -= payment
        this.loan.monthsLeft = Math.max(0, this.loan.monthsLeft - 1)
        if (this.loan.remaining <= 0) {
          this.loan = null
          this.loanRepaymentAmount = 0
        }
      }

      // 4. Emergency loan check
      if (this.funds < 0 && this.loan === null) {
        const baseExpenses = this.budgetInfo.maintenanceCosts.total + this.budgetInfo.serviceCosts.total
        const emergencyAmount = Math.max(10_000, -this.funds + baseExpenses * 6)
        const monthlyPayment = calcMonthlyPayment(emergencyAmount)
        this.loan = { principal: emergencyAmount, remaining: emergencyAmount, monthlyPayment, termMonths: 120, monthsLeft: 120, interestRate: 0.08 }
        this.loanRepaymentAmount = monthlyPayment
        this.funds += emergencyAmount
        this.events.push({ type: 'emergency_loan', amount: emergencyAmount })
      }

      // 5. Bankruptcy (loan exists but still broke after emergency loan)
      if (this.funds < 0 && this.loan !== null) {
        this.events.push({ type: 'bankruptcy' })
      }

      // 6. Record monthly snapshot
      this.history.push({
        month: this.month,
        year: this.year,
        population: this.population,
        funds: this.funds,
        taxIncome: this.budgetInfo.taxIncome,
        expenses: this.budgetInfo.projectedExpenses,
        rDemand: this.demand.residential,
        cDemand: this.demand.commercial,
        iDemand: this.demand.industrial,
      })
      if (this.history.length > 1200) this.history.shift()
    }
  }

  getState(): GameState {
    return {
      map: this.map,
      time: {
        tickCount: this.tickCount,
        month: this.month,
        year: this.year,
        speed: this.speed,
      },
      population: this.population,
      funds: this.funds,
      demand: this.demand,
      budget: { ...this.budgetInfo, totalFunds: this.funds },
      powerGrid: this.powerGrid,
      landValues: this.landValues,
      pollutionLevel: this.pollutionLevel,
      crimeLevel: this.crimeLevel,
      fireCoverage: this.fireCoverage,
      trafficDensity: this.trafficDensity,
      activeFires: Array.from(this.fireState.activeFires.keys()),
      loan: this.loan,
      loanRepaymentAmount: this.loanRepaymentAmount,
      events: this.events,
      history: this.history,
      citizens: this.citizenSummary,
    }
  }

  getDemand() {
    return this.demand
  }

  getTile(x: number, y: number): TileInfo {
    const idx = y * this.map.width + x
    return {
      terrain: this.map.terrain[idx] as TileType,
      zone: this.map.zones[idx] as ZoneType,
      infrastructure: this.map.infrastructure[idx]!,
      connections: this.map.connections[idx]!,
      elevation: this.map.elevation[idx]!,
      powered: this.powerGrid[idx] !== 0,
      hasRoadAccess: hasNearbyRoad(this.map, x, y),
    }
  }

  placeTile(x: number, y: number, infra: Infrastructure): Result {
    const { result, cost } = placeTile(this.map, x, y, infra, this.funds, this.bldIdx)
    this.funds -= cost
    if (result.ok) {
      updateConnections(this.map, x, y)
      const placedInfra = this.map.infrastructure[y * this.map.width + x]!
      if (placedInfra & Infrastructure.Road) {
        updateRoadGraph(this.map, this.roadGraph, x, y)
        markRoutesStale(this.citizenRegistry, y * this.map.width + x)
      }
    }
    return result
  }

  placeZone(x: number, y: number, zone: ZoneType): Result {
    return placeZone(this.map, x, y, zone, this.bldIdx)
  }

  upgradeTile(x: number, y: number): Result {
    const idx = y * this.map.width + x
    const infra = this.map.infrastructure[idx]!

    if (!(infra & Infrastructure.Road)) {
      return { ok: false, reason: FailReason.InvalidLocation, detail: 'No road to upgrade' }
    }
    if (infra & Infrastructure.PavedRoad) {
      return { ok: false, reason: FailReason.Occupied, detail: 'Road already paved' }
    }

    const cost = COSTS.pavedRoadUpgrade
    if (this.funds < cost) {
      return { ok: false, reason: FailReason.InsufficientFunds }
    }

    this.map.infrastructure[idx]! |= Infrastructure.PavedRoad
    this.funds -= cost
    return { ok: true }
  }

  bulldoze(x: number, y: number): Result {
    const { result, cost } = bulldoze(this.map, x, y, this.funds)
    this.funds -= cost
    if (result.ok) {
      updateConnections(this.map, x, y)
      this.bldIdx = new BuildingIndex(this.map)
      const idx = y * this.map.width + x
      updateRoadGraph(this.map, this.roadGraph, x, y)
      markRoutesStale(this.citizenRegistry, idx)
      const buildingIds = new Set(this.map.buildings.map(b => b.id))
      const orphanedIds = new Set<string>()
      for (const agent of this.citizenRegistry.agents) {
        if (!buildingIds.has(agent.homeBuildingId)) {
          orphanedIds.add(agent.homeBuildingId)
        }
      }
      for (const id of orphanedIds) {
        removeAgentsForBuilding(this.citizenRegistry, id)
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
    if (this.funds < def.cost) {
      return { ok: false, reason: FailReason.InsufficientFunds }
    }

    // Check footprint fits on map, no water, no existing buildings
    for (let dy = 0; dy < def.size.h; dy++) {
      for (let dx = 0; dx < def.size.w; dx++) {
        const tx = x + dx
        const ty = y + dy
        if (tx < 0 || ty < 0 || tx >= this.map.width || ty >= this.map.height) {
          return { ok: false, reason: FailReason.InvalidLocation, detail: 'Footprint out of bounds' }
        }
        const idx = ty * this.map.width + tx
        if (this.map.terrain[idx] === TileType.Water) {
          return { ok: false, reason: FailReason.InvalidLocation, detail: 'Cannot build on water' }
        }
      }
    }

    // Check overlap with existing buildings using spatial index
    for (let dy = 0; dy < def.size.h; dy++) {
      for (let dx = 0; dx < def.size.w; dx++) {
        if (this.bldIdx.has(x + dx, y + dy)) {
          return { ok: false, reason: FailReason.Occupied }
        }
      }
    }

    // Create building
    const building: Building = {
      id: `b${this.nextBuildingId++}`,
      defId,
      x,
      y,
      powered: false,
      density: def.density,
      age: 0,
      state: 'active',
      residents: 0,
    }

    this.map.buildings.push(building)
    this.bldIdx = new BuildingIndex(this.map)
    this.funds -= def.cost

    // Clear zones under the building footprint
    for (let dy = 0; dy < def.size.h; dy++) {
      for (let dx = 0; dx < def.size.w; dx++) {
        const idx = (y + dy) * this.map.width + (x + dx)
        this.map.zones[idx] = ZoneType.None
      }
    }

    return { ok: true }
  }

  setTaxRate(rate: number): void {
    this.taxRate = Math.max(0, Math.min(0.2, rate))
    this.budgetInfo = calculateBudget(this.map, this.population, this.taxRate, this.landValues, this.funding, this.computeLoanRepayment())
  }

  setFunding(service: 'police' | 'fire' | 'transit', level: number): void {
    this.funding[service] = Math.max(0, Math.min(100, level))
    this.budgetInfo = calculateBudget(this.map, this.population, this.taxRate, this.landValues, this.funding, this.computeLoanRepayment())
  }

  takeLoan(amount: number): Result {
    if (this.loan !== null) return { ok: false, reason: FailReason.LoanExists }
    const maxLoanAmount = this.budgetInfo.taxIncome * 48
    if (amount < 10_000 || amount > maxLoanAmount) return { ok: false, reason: FailReason.AmountOutOfRange }
    const monthlyPayment = calcMonthlyPayment(amount)
    this.loan = { principal: amount, remaining: amount, monthlyPayment, termMonths: 120, monthsLeft: 120, interestRate: 0.08 }
    this.loanRepaymentAmount = monthlyPayment
    this.funds += amount
    return { ok: true }
  }

  setLoanRepayment(amount: number): Result {
    if (this.loan === null) return { ok: false, reason: FailReason.NoActiveLoan }
    if (amount < this.loan.monthlyPayment || amount > this.loan.remaining) return { ok: false, reason: FailReason.AmountOutOfRange }
    this.loanRepaymentAmount = amount
    return { ok: true }
  }

  serialize(): SaveFile {
    // Convert active fires Map to array of [index, remaining] pairs
    const activeFires: Array<[number, number]> = Array.from(this.fireState.activeFires.entries())

    return {
      version: 5,
      map: {
        version: this.map.version,
        width: this.map.width,
        height: this.map.height,
        terrain: Array.from(this.map.terrain) as unknown as Uint8Array,
        zones: Array.from(this.map.zones) as unknown as Uint8Array,
        infrastructure: Array.from(this.map.infrastructure) as unknown as Uint16Array,
        connections: Array.from(this.map.connections) as unknown as Uint8Array,
        elevation: Array.from(this.map.elevation) as unknown as Uint8Array,
        buildings: this.map.buildings.map((b) => ({ ...b })),
        meta: { ...this.map.meta },
      },
      state: {
        funds: this.funds,
        population: this.population,
        month: this.month,
        year: this.year,
        tickCount: this.tickCount,
        taxRate: this.taxRate,
        funding: { ...this.funding },
        seed: this.prng.getInternalState(),
        activeFires,
        loan: this.loan,
        loanRepaymentAmount: this.loanRepaymentAmount,
        history: this.history,
        citizens: {
          samplingRatio: this.citizenRegistry.samplingRatio,
          agents: this.citizenRegistry.agents.map(a => ({
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
          })),
        },
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

    // Create engine with minimal config (we'll override everything)
    const engine = new Engine(map, {
      seed: 0,
      startingFunds: save.state.funds,
      startMonth: save.state.month,
      startYear: save.state.year,
      taxRate: save.state.taxRate,
    })

    // Restore PRNG state
    engine.prng = PRNG.fromState(save.state.seed)

    // Restore simulation state
    engine.tickCount = save.state.tickCount
    engine.funds = save.state.funds
    engine.funding = {
      police: save.state.funding.police ?? 100,
      fire: save.state.funding.fire ?? 100,
      transit: save.state.funding.transit ?? 100,
    }

    // Restore active fires
    const savedFires = save.state.activeFires
    if (savedFires) {
      for (const [idx, remaining] of savedFires) {
        engine.fireState.activeFires.set(idx, remaining)
      }
    }

    // Restore nextBuildingId from existing buildings
    let maxId = 0
    for (const b of map.buildings) {
      const num = parseInt(b.id.replace('b', ''), 10)
      if (num > maxId) maxId = num
    }
    engine.nextBuildingId = maxId + 1

    // Recompute population as Σ b.residents — always correct regardless of save version
    engine.population = map.buildings
      .filter((b) => b.state === 'active')
      .reduce((sum, b) => sum + (b.residents ?? 0), 0)

    // Restore loan state
    engine.loan = save.state.loan ?? null
    engine.loanRepaymentAmount = save.state.loanRepaymentAmount ?? (engine.loan?.monthlyPayment ?? 0)
    engine.history = save.state.history ?? []

    // Restore citizen registry
    if (save.state.citizens) {
      engine.citizenRegistry = {
        samplingRatio: save.state.citizens.samplingRatio,
        agents: save.state.citizens.agents.map(a => ({
          ...a,
          homeWorkRouteStale: false,
          homeCommerceRouteStale: false,
          homeWorkRouteTileSet: new Set(a.homeWorkRoute),
          homeCommerceRouteTileSet: new Set(a.homeCommerceRoute),
        })),
      }
    } else {
      engine.citizenRegistry = createRegistry()
    }
    engine.roadGraph = buildRoadGraph(engine.map)
    engine.citizenSummary = computeCitizenSummary(engine.citizenRegistry)

    // Rebuild derived state
    propagatePower(engine.map, engine.powerGrid, engine.bldIdx)
    engine.demand = calculateDemand(engine.map, engine.taxRate)
    engine.budgetInfo = calculateBudget(
      engine.map,
      engine.population,
      engine.taxRate,
      engine.landValues,
      engine.funding,
      engine.computeLoanRepayment(),
    )

    return engine
  }
}
