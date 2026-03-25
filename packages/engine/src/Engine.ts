import {
  type GameMap,
  type GameState,
  type SaveFile,
  type Building,
  type Result,
  type GameEvent,
  TileType,
  ZoneType,
  Infrastructure,
  FailReason,
  SimSpeed,
  COSTS,
  calcMonthlyPayment,
} from '@bitborough/core'
import { placeTile, placeZone } from './actions/place.js'
import { bulldoze } from './actions/bulldoze.js'
import { updateConnections } from './connections.js'
import { propagatePower } from './simulation/power.js'
import { calculateBudget } from './simulation/budget.js'
import { updateRoadGraph } from './road-graph.js'
import {
  removeAgentsForBuilding,
  markRoutesStale, markRoutesStaleBatch,
  computeTotalPopulation,
} from './simulation/citizens.js'
import { hasNearbyRoad } from './simulation/road-access.js'
import { BUILDING_DEFS } from './buildings-registry.js'
import { BuildingIndex } from './building-index.js'
import {
  type EngineState,
  type EngineConfig,
  createEngineState,
  serializeState,
  restoreState,
  computeLoanRepayment,
} from './engine-state.js'
import { monthlyTick } from './simulation/tick.js'

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
      this.events = []
      const result = monthlyTick(this.state)
      this.events.push(...result.events)
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
    return serializeState(this.state)
  }

  static restore(save: SaveFile): Engine {
    return new Engine(restoreState(save))
  }
}
