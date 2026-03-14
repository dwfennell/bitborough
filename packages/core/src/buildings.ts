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
  capacity: number // max residents this building can hold
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
  residents: number // current occupancy, 0–def.capacity; always 0 for special buildings
  // under_construction only:
  constructionMonthsRemaining?: number
  upgradingToDefId?: string
  // derelict only:
  derelictMonths?: number
  lowOccupancyMonths?: number // months residents < 10% capacity; undefined when healthy
}
