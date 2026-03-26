import type { GameMap } from './map.js'

export type WealthTier = 1 | 2 | 3 // 1=Low, 2=Mid, 3=High

export enum SimSpeed {
  Paused,
  Slow,
  Normal,
  Fast,
  Turbo,
}

export type Result = { ok: true } | { ok: false; reason: FailReason; detail?: string }

export enum FailReason {
  InsufficientFunds,
  InvalidLocation,
  Occupied,
  NoPower,
  NotBulldozable,
  NotZonable,
  LoanExists,
  AmountOutOfRange,
  NoActiveLoan,
}

export interface Loan {
  principal: number
  remaining: number
  monthlyPayment: number
  termMonths: number
  monthsLeft: number
  interestRate: number
}

export type GameEvent = { type: 'emergency_loan'; amount: number } | { type: 'negative_funds' } | { type: 'bankruptcy' }

export interface MonthlySnapshot {
  month: number
  year: number
  population: number
  funds: number
  taxIncome: number   // budgetInfo.taxIncome
  expenses: number    // budgetInfo.projectedExpenses (projected, not actual charged amount)
  rDemand: number     // demand.residential, -1..1
  cDemand: number     // demand.commercial, -1..1
  iDemand: number     // demand.industrial, -1..1
  births: number       // absolute count this month
  deaths: number       // absolute count this month
  netMigration: number // absolute count this month
}

export interface CitizenSummary {
  agentCount: number
  avgSatisfaction: number
  unmatchedJobFraction: number
  unmatchedCommerceFraction: number
  avgCommuteLengthTiles: number
  // Demographics
  totalChildren: number
  totalWorking: number
  totalElderly: number
  birthsLastTick: number
  deathsLastTick: number
  netMigrationLastTick: number
  tierCounts: [low: number, mid: number, high: number]
}

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
    education: number
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
    education: number
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
  educationCoverage: Uint8Array
  trafficDensity: Uint8Array
  activeFires: number[]
  loan: Loan | null
  loanRepaymentAmount: number
  events: GameEvent[]
  history: MonthlySnapshot[]
  citizens: CitizenSummary
}

/** Compute the fixed monthly payment for an amortized loan. */
export function calcMonthlyPayment(principal: number, annualRate = 0.08, termMonths = 120): number {
  const r = annualRate / 12
  if (r === 0) return principal / termMonths
  return principal * r / (1 - Math.pow(1 + r, -termMonths))
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
    history?: MonthlySnapshot[]   // optional for backwards compatibility; [] if absent
    citizens?: {
      samplingRatio: number
      agents: Array<{
        id: string
        homeBuildingId: string
        homeAccessRoad: number
        workBuildingId: string | null
        workAccessRoad: number | null
        commerceBuildingId: string | null
        commerceAccessRoad: number | null
        homeWorkRoute: number[]
        homeCommerceRoute: number[]
        satisfaction: number
        demographics?: {
          children: number
          working: number
          elderly: number
        }
        wealthTier?: WealthTier
      }>
    }
    reputationLayer?: number[]
  }
  timestamp: string
}
