import { type GameMap, type BudgetInfo, Infrastructure, MAINTENANCE, BuildingCategory } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

export function calculateBudget(
  map: GameMap,
  population: number,
  taxRate: number,
  landValues: Uint8Array,
  funding: { police: number; fire: number; transit: number; education: number },
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
  let policeMaintenance = 0
  let fireMaintenance = 0
  let transitStopCount = 0
  let schoolMaintenance = 0
  let footprintTileCount = 0

  for (const building of map.buildings) {
    const def = BUILDING_DEFS[building.defId]
    if (!def) continue
    if (building.defId.startsWith('power.')) powerPlantMaintenance += def.maintenanceCost
    else if (building.defId.startsWith('service.police')) policeMaintenance += def.maintenanceCost
    else if (building.defId.startsWith('service.fire')) fireMaintenance += def.maintenanceCost
    else if (building.defId.startsWith('service.school')) schoolMaintenance += def.maintenanceCost
    else if (building.defId === 'transit.stop') transitStopCount++
    const footprint = (def.size?.w ?? 1) * (def.size?.h ?? 1)
    footprintTileCount += footprint
  }

  const maintenanceCosts = {
    roads: roadCount * MAINTENANCE.road + pavedRoadCount * MAINTENANCE.pavedRoadSurcharge,
    rails: railCount * MAINTENANCE.rail,
    powerLines: powerLineCount * MAINTENANCE.powerLine,
    powerPlants: powerPlantMaintenance,
    total: 0,
  }
  maintenanceCosts.total =
    maintenanceCosts.roads + maintenanceCosts.rails + maintenanceCosts.powerLines + maintenanceCosts.powerPlants

  // Sprawl penalty: high land-per-capita increases road and power line maintenance.
  // Threshold scales with population — small cities get a generous allowance,
  // converging to 0.05 as population grows past ~1000.
  const SPRAWL_BASE_THRESHOLD = 0.05
  const SPRAWL_MIN_POPULATION = 50
  const effectiveThreshold =
    population < SPRAWL_MIN_POPULATION
      ? Infinity // no sprawl penalty for tiny cities
      : SPRAWL_BASE_THRESHOLD + 50 / population
  const sprawlRatio = population > 0 ? footprintTileCount / population : 0
  const sprawlMultiplier = sprawlRatio > effectiveThreshold ? 1 + (sprawlRatio - effectiveThreshold) * 2 : 1.0

  if (sprawlMultiplier > 1) {
    maintenanceCosts.roads = Math.round(maintenanceCosts.roads * sprawlMultiplier)
    maintenanceCosts.powerLines = Math.round(maintenanceCosts.powerLines * sprawlMultiplier)
    maintenanceCosts.total =
      maintenanceCosts.roads + maintenanceCosts.rails + maintenanceCosts.powerLines + maintenanceCosts.powerPlants
  }

  // Service costs based on funding level
  const serviceCosts = {
    police: policeMaintenance * (funding.police / 100),
    fire: fireMaintenance * (funding.fire / 100),
    transit: transitStopCount * MAINTENANCE.transitStop * (funding.transit / 100),
    education: schoolMaintenance * (funding.education / 100),
    total: 0,
  }
  serviceCosts.total = serviceCosts.police + serviceCosts.fire + serviceCosts.transit + serviceCosts.education

  // Tax income: per-building taxValue scaled by tax rate, plus a population/land-value component
  let totalTaxValue = 0
  let totalLandValue = 0
  let developedTileCount = 0
  for (const building of map.buildings) {
    const def = BUILDING_DEFS[building.defId]
    if (!def || def.category === BuildingCategory.Special) continue
    if (building.state === 'active') totalTaxValue += def.taxValue
    const idx = building.y * map.width + building.x
    totalLandValue += landValues[idx]!
    developedTileCount++
  }

  const avgLandValue = developedTileCount > 0 ? totalLandValue / developedTileCount : 0
  // Building tax: direct revenue from developed buildings
  const buildingTax = totalTaxValue * taxRate
  // Land tax: population-driven component that scales with city growth
  const landTax = ((population * avgLandValue) / 40) * taxRate
  const taxIncome = buildingTax + landTax

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
      education: Math.round(serviceCosts.education),
      total: Math.round(serviceCosts.total),
    },
    loanRepayment: Math.round(loanRepayment),
    balance: Math.round(balance),
    projectedIncome: Math.round(taxIncome),
    projectedExpenses: Math.round(maintenanceCosts.total + serviceCosts.total + loanRepayment),
    projectedBalance: Math.round(balance),
  }
}
