import { type GameMap, type BudgetInfo, Infrastructure, MAINTENANCE, BuildingCategory } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

export function calculateBudget(
  map: GameMap,
  population: number,
  taxRate: number,
  landValues: Uint8Array,
  funding: { police: number; fire: number; transit: number },
  loanRepayment = 0,
): BudgetInfo {
  // Count infrastructure for maintenance
  let roadCount = 0
  let pavedRoadCount = 0
  let railCount = 0
  let powerLineCount = 0

  for (let i = 0; i < map.infrastructure.length; i++) {
    const infra = map.infrastructure[i]!
    if (infra & Infrastructure.Road) roadCount++
    if (infra & Infrastructure.PavedRoad) pavedRoadCount++
    if (infra & Infrastructure.PowerLine) powerLineCount++
    if (infra & Infrastructure.Rail) railCount++
  }

  // Count building maintenance from building defs (single source of truth)
  let powerPlantMaintenance = 0
  let policeStationCount = 0
  let fireStationCount = 0
  let transitStopCount = 0

  for (const building of map.buildings) {
    const def = BUILDING_DEFS[building.defId]
    if (!def) continue
    if (building.defId.startsWith('power.')) powerPlantMaintenance += def.maintenanceCost
    if (building.defId === 'service.police') policeStationCount++
    if (building.defId === 'service.fire') fireStationCount++
    if (building.defId === 'transit.stop') transitStopCount++
  }

  const maintenanceCosts = {
    roads: roadCount * MAINTENANCE.road + pavedRoadCount * MAINTENANCE.pavedRoadSurcharge,
    rails: railCount * MAINTENANCE.rail,
    powerLines: powerLineCount * MAINTENANCE.powerLine,
    powerPlants: powerPlantMaintenance,
    total: 0,
  }
  maintenanceCosts.total = maintenanceCosts.roads + maintenanceCosts.rails +
    maintenanceCosts.powerLines + maintenanceCosts.powerPlants

  // Service costs based on funding level
  const serviceCosts = {
    police: policeStationCount * MAINTENANCE.policeStation * (funding.police / 100),
    fire: fireStationCount * MAINTENANCE.fireStation * (funding.fire / 100),
    transit: transitStopCount * MAINTENANCE.transitStop * (funding.transit / 100),
    total: 0,
  }
  serviceCosts.total = serviceCosts.police + serviceCosts.fire + serviceCosts.transit

  // Tax income: sum taxable value of all zone buildings × taxRate
  // From PRD: totalPopulation × averageLandValue / 120 × taxRate
  let totalLandValue = 0
  let developedTileCount = 0
  for (const building of map.buildings) {
    const def = BUILDING_DEFS[building.defId]
    if (!def || def.category === BuildingCategory.Special) continue // only zone buildings
    const idx = building.y * map.width + building.x
    totalLandValue += landValues[idx]!
    developedTileCount++
  }

  const avgLandValue = developedTileCount > 0 ? totalLandValue / developedTileCount : 0
  const taxIncome = population * avgLandValue / 20 * taxRate

  const balance = taxIncome - maintenanceCosts.total - serviceCosts.total - loanRepayment

  return {
    taxRate,
    totalFunds: 0, // filled by Engine
    funding,
    taxIncome: Math.round(taxIncome),
    maintenanceCosts: {
      roads: Math.round(maintenanceCosts.roads),
      rails: Math.round(maintenanceCosts.rails),
      powerLines: Math.round(maintenanceCosts.powerLines),
      powerPlants: Math.round(maintenanceCosts.powerPlants),
      total: Math.round(maintenanceCosts.total),
    },
    serviceCosts: {
      police: Math.round(serviceCosts.police),
      fire: Math.round(serviceCosts.fire),
      transit: Math.round(serviceCosts.transit),
      total: Math.round(serviceCosts.total),
    },
    loanRepayment: Math.round(loanRepayment),
    balance: Math.round(balance),
    projectedIncome: Math.round(taxIncome),
    projectedExpenses: Math.round(maintenanceCosts.total + serviceCosts.total + loanRepayment),
    projectedBalance: Math.round(balance),
  }
}
