export enum BuildingCategory {
  Residential,
  Commercial,
  Industrial,
  Special,
}

export enum DensityLevel {
  Low,
  Medium,
  High,
}

export interface BuildingDef {
  id: string
  category: BuildingCategory
  density: DensityLevel
  size: { w: number; h: number }
  population: number
  jobs: number
  taxValue: number
  pollutionRadius: number
  pollutionAmount: number
  powerRequired: boolean
  roadRequired: boolean
  cost: number
  maintenanceCost: number
}

export type BuildingState = 'active' | 'under_construction' | 'derelict'

export interface Building {
  id: string
  defId: string
  x: number
  y: number
  powered: boolean
  density: DensityLevel
  age: number // months since placed
  state: BuildingState
  // under_construction only:
  constructionMonthsRemaining?: number
  upgradingToDefId?: string
  // derelict only:
  derelictMonths?: number
}
