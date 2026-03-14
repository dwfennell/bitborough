export interface DocSection {
  id: string
  title: string
  body: string // markdown, no HTML
}

export interface BuildingRow {
  id: string
  name: string
  cost: number
  maintenanceCost: number
  powerCapacity?: number
  capacity?: number
  jobs?: number
  pollutionRadius?: number
  pollutionAmount?: number
  size: { w: number; h: number }
  notes: string
}
