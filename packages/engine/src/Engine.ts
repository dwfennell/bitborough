import {
  type GameMap,
  type GameState,
  type BudgetInfo,
  type Building,
  type Result,
  TileType,
  ZoneType,
  Infrastructure,
  FailReason,
  SimSpeed,
  DEFAULTS,
} from '@rcity/core'
import { PRNG } from './prng.js'
import { placeTile, placeZone } from './actions/place.js'
import { bulldoze } from './actions/bulldoze.js'
import { updateConnections } from './connections.js'
import { propagatePower } from './simulation/power.js'
import { calculateDemand } from './simulation/demand.js'
import { updateZones } from './simulation/zones.js'
import { BUILDING_DEFS } from './buildings-registry.js'

export interface TileInfo {
  terrain: TileType
  zone: ZoneType
  infrastructure: number
  connections: number
  elevation: number
  powered: boolean
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

  // Simulation layers
  private powerGrid: Uint8Array
  private landValues: Uint8Array
  private pollutionLevel: Uint8Array
  private crimeLevel: Uint8Array
  private trafficDensity: Uint8Array

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
    this.trafficDensity = new Uint8Array(size)

    // Initialize demand
    this.demand = calculateDemand(this.map, this.population, this.taxRate)
  }

  static create(map: GameMap, config: EngineConfig = {}): Engine {
    return new Engine(map, config)
  }

  private nextBuildingId = 1

  tick(): void {
    this.tickCount++

    // Power propagation runs every tick
    propagatePower(this.map, this.powerGrid)

    // Monthly systems
    if (this.tickCount % this.ticksPerMonth === 0) {
      this.month++
      if (this.month > this.monthsPerYear) {
        this.month = 1
        this.year++
        // Annual systems (budget) will go here
      }
      // Monthly systems
      this.demand = calculateDemand(this.map, this.population, this.taxRate)

      // Zone development
      const nextBuildingIdRef = { value: this.nextBuildingId }
      const { populationDelta } = updateZones(this.map, this.powerGrid, this.demand, this.prng, nextBuildingIdRef)
      this.nextBuildingId = nextBuildingIdRef.value
      this.population += populationDelta
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
      budget: this.buildBudgetInfo(),
      powerGrid: this.powerGrid,
      landValues: this.landValues,
      pollutionLevel: this.pollutionLevel,
      crimeLevel: this.crimeLevel,
      trafficDensity: this.trafficDensity,
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
      infrastructure: this.map.infrastructure[idx],
      connections: this.map.connections[idx],
      elevation: this.map.elevation[idx],
      powered: this.powerGrid[idx] !== 0,
    }
  }

  placeTile(x: number, y: number, infra: Infrastructure): Result {
    const { result, cost } = placeTile(this.map, x, y, infra, this.funds)
    this.funds -= cost
    if (result.ok) {
      updateConnections(this.map, x, y)
    }
    return result
  }

  placeZone(x: number, y: number, zone: ZoneType): Result {
    return placeZone(this.map, x, y, zone)
  }

  bulldoze(x: number, y: number): Result {
    const { result, cost } = bulldoze(this.map, x, y, this.funds)
    this.funds -= cost
    if (result.ok) {
      updateConnections(this.map, x, y)
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

    // Check overlap with existing buildings
    for (const existing of this.map.buildings) {
      const eDef = BUILDING_DEFS[existing.defId]
      if (!eDef) continue
      // Check if footprints overlap
      if (
        x < existing.x + eDef.size.w &&
        x + def.size.w > existing.x &&
        y < existing.y + eDef.size.h &&
        y + def.size.h > existing.y
      ) {
        return { ok: false, reason: FailReason.Occupied }
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
    }

    this.map.buildings.push(building)
    this.funds -= def.cost

    return { ok: true }
  }

  private buildBudgetInfo(): BudgetInfo {
    return {
      taxRate: this.taxRate,
      totalFunds: this.funds,
      funding: { police: 100, fire: 100, transit: 100 },
      taxIncome: 0,
      maintenanceCosts: {
        roads: 0,
        rails: 0,
        powerLines: 0,
        powerPlants: 0,
        total: 0,
      },
      serviceCosts: {
        police: 0,
        fire: 0,
        transit: 0,
        total: 0,
      },
      balance: 0,
      projectedIncome: 0,
      projectedExpenses: 0,
      projectedBalance: 0,
    }
  }
}
