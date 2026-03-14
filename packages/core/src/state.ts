import type { GameMap } from './map.js'

export enum SimSpeed {
  Paused,
  Slow,
  Normal,
  Fast,
  Turbo,
}

export type Result =
  | { ok: true }
  | { ok: false; reason: FailReason; detail?: string }

export enum FailReason {
  InsufficientFunds,
  InvalidLocation,
  Occupied,
  NoPower,
  NotBulldozable,
  NotZonable,
  LoanExists,
  AmountOutOfRange,
}

export interface Loan {
  principal: number
  remaining: number
  monthlyPayment: number
  termMonths: number
  monthsLeft: number
  interestRate: number
}

export type GameEvent =
  | { type: 'emergency_loan'; amount: number }
  | { type: 'negative_funds' }

export interface DemandInfo {
  residential: number
  commercial: number
  industrial: number
}

export interface BudgetInfo {
  taxRate: number
  totalFunds: number
  funding: {
    police: number
    fire: number
    transit: number
  }
  taxIncome: number
  maintenanceCosts: {
    roads: number
    rails: number
    powerLines: number
    powerPlants: number
    total: number
  }
  serviceCosts: {
    police: number
    fire: number
    transit: number
    total: number
  }
  loanRepayment: number
  balance: number
  projectedIncome: number
  projectedExpenses: number
  projectedBalance: number
}

export interface GameState {
  map: GameMap
  time: {
    tickCount: number
    month: number
    year: number
    speed: SimSpeed
  }
  population: number
  funds: number
  demand: DemandInfo
  budget: BudgetInfo
  powerGrid: Uint8Array
  landValues: Uint8Array
  pollutionLevel: Uint8Array
  crimeLevel: Uint8Array
  fireCoverage: Uint8Array
  trafficDensity: Uint8Array
  activeFires: number[]
  loan: Loan | null
  loanRepaymentAmount: number
  events: GameEvent[]
}

export interface SaveFile {
  version: number
  map: GameMap
  state: {
    funds: number
    population: number
    month: number
    year: number
    tickCount: number
    taxRate: number
    funding: Record<string, number>
    seed: number
    activeFires?: Array<[number, number]>
    loan?: Loan | null
    loanRepaymentAmount?: number
  }
  timestamp: string
}
