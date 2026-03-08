import {
  type GameMap,
  type GameState,
  type SaveFile,
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
import { calculateLandValues } from './simulation/land-value.js'
import { updateZones } from './simulation/zones.js'
import { calculateBudget } from './simulation/budget.js'
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

  // Budget
  private funding: { police: number; fire: number; transit: number }
  private budgetInfo: BudgetInfo

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

    // Power propagation runs every tick
    propagatePower(this.map, this.powerGrid)

    // Monthly systems
    if (this.tickCount % this.ticksPerMonth === 0) {
      this.month++
      if (this.month > this.monthsPerYear) {
        this.month = 1
        this.year++
        // Annual systems: calculate budget and apply balance to funds
        this.budgetInfo = calculateBudget(this.map, this.population, this.taxRate, this.landValues, this.funding)
        this.funds += this.budgetInfo.balance
      }
      // Monthly systems
      this.demand = calculateDemand(this.map, this.population, this.taxRate)
      calculateLandValues(this.map, this.powerGrid, this.pollutionLevel, this.crimeLevel, this.landValues)

      // Zone development
      const nextBuildingIdRef = { value: this.nextBuildingId }
      const { populationDelta } = updateZones(this.map, this.powerGrid, this.demand, this.prng, nextBuildingIdRef)
      this.nextBuildingId = nextBuildingIdRef.value
      this.population += populationDelta

      // Update budget projections monthly (without applying balance)
      this.budgetInfo = calculateBudget(this.map, this.population, this.taxRate, this.landValues, this.funding)
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
      infrastructure: this.map.infrastructure[idx]!,
      connections: this.map.connections[idx]!,
      elevation: this.map.elevation[idx]!,
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

  setTaxRate(rate: number): void {
    this.taxRate = Math.max(0, Math.min(0.20, rate))
    this.budgetInfo = calculateBudget(this.map, this.population, this.taxRate, this.landValues, this.funding)
  }

  setFunding(service: 'police' | 'fire' | 'transit', level: number): void {
    this.funding[service] = Math.max(0, Math.min(100, level))
    this.budgetInfo = calculateBudget(this.map, this.population, this.taxRate, this.landValues, this.funding)
  }

  serialize(): SaveFile {
    return {
      version: 1,
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
      },
      timestamp: new Date().toISOString(),
    }
  }

  static restore(save: SaveFile): Engine {
    const size = save.map.width * save.map.height

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
      buildings: save.map.buildings.map((b) => ({ ...b })),
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
    engine.population = save.state.population
    engine.funding = {
      police: save.state.funding.police ?? 100,
      fire: save.state.funding.fire ?? 100,
      transit: save.state.funding.transit ?? 100,
    }

    // Restore nextBuildingId from existing buildings
    let maxId = 0
    for (const b of map.buildings) {
      const num = parseInt(b.id.replace('b', ''), 10)
      if (num > maxId) maxId = num
    }
    engine.nextBuildingId = maxId + 1

    // Rebuild derived state
    propagatePower(engine.map, engine.powerGrid)
    engine.demand = calculateDemand(engine.map, engine.population, engine.taxRate)
    engine.budgetInfo = calculateBudget(engine.map, engine.population, engine.taxRate, engine.landValues, engine.funding)

    return engine
  }
}
