import {
  type GameMap,
  type GameState,
  type BudgetInfo,
  SimSpeed,
  DEFAULTS,
} from '@rcity/core'
import { PRNG } from './prng.js'

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
  }

  static create(map: GameMap, config: EngineConfig = {}): Engine {
    return new Engine(map, config)
  }

  tick(): void {
    this.tickCount++

    // Monthly systems
    if (this.tickCount % this.ticksPerMonth === 0) {
      this.month++
      if (this.month > this.monthsPerYear) {
        this.month = 1
        this.year++
        // Annual systems (budget) will go here
      }
      // Monthly systems (zones, land value, etc.) will go here
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
      demand: { residential: 0, commercial: 0, industrial: 0 },
      budget: this.buildBudgetInfo(),
      powerGrid: this.powerGrid,
      landValues: this.landValues,
      pollutionLevel: this.pollutionLevel,
      crimeLevel: this.crimeLevel,
      trafficDensity: this.trafficDensity,
    }
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
