import { type GameMap, type DemandInfo, type Building, type BuildingDef, ZoneType, Infrastructure, DensityLevel, BuildingCategory } from '@bitborough/core'
import { PRNG } from '../prng.js'

// Zone building definitions (auto-placed by simulation, not by player)
const ZONE_BUILDINGS: Record<string, BuildingDef> = {
  'res.low': {
    id: 'res.low',
    category: BuildingCategory.Residential,
    density: DensityLevel.Low,
    size: { w: 1, h: 1 },
    population: 10,
    jobs: 0,
    taxValue: 20,
    pollutionRadius: 0,
    pollutionAmount: 0,
    powerRequired: true,
    roadRequired: true,
    cost: 0,
    maintenanceCost: 0,
  },
  'com.low': {
    id: 'com.low',
    category: BuildingCategory.Commercial,
    density: DensityLevel.Low,
    size: { w: 1, h: 1 },
    population: 0,
    jobs: 5,
    taxValue: 25,
    pollutionRadius: 0,
    pollutionAmount: 0,
    powerRequired: true,
    roadRequired: true,
    cost: 0,
    maintenanceCost: 0,
  },
  'ind.low': {
    id: 'ind.low',
    category: BuildingCategory.Industrial,
    density: DensityLevel.Low,
    size: { w: 1, h: 1 },
    population: 0,
    jobs: 10,
    taxValue: 15,
    pollutionRadius: 3,
    pollutionAmount: 10,
    powerRequired: true,
    roadRequired: true,
    cost: 0,
    maintenanceCost: 0,
  },
}

export function getZoneBuildingDef(defId: string): BuildingDef | undefined {
  return ZONE_BUILDINGS[defId]
}

export function updateZones(
  map: GameMap,
  powerGrid: Uint8Array,
  demand: DemandInfo,
  prng: PRNG,
  nextBuildingId: { value: number },
): { populationDelta: number } {
  let populationDelta = 0

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const idx = y * map.width + x
      const zone = map.zones[idx] as ZoneType

      if (zone === ZoneType.None) continue

      const powered = powerGrid[idx] !== 0
      const hasRoad = hasAdjacentRoad(map, x, y)
      const hasBuilding = map.buildings.some(b => b.x === x && b.y === y)

      // Development: zone is empty, powered, has road, and demand is positive
      if (!hasBuilding && powered && hasRoad) {
        const zoneDemand = getZoneDemand(zone, demand)
        if (zoneDemand <= 0) continue

        // Development probability based on demand
        // baseProbability = 0.05 (5% chance per month per tile)
        const probability = 0.05 * zoneDemand
        if (prng.next() < probability) {
          const defId = getZoneBuildingDefId(zone)
          const building: Building = {
            id: `b${nextBuildingId.value++}`,
            defId,
            x,
            y,
            powered: true,
            density: DensityLevel.Low,
            age: 0,
          }
          map.buildings.push(building)
          const def = ZONE_BUILDINGS[defId]
          if (def) {
            populationDelta += def.population
          }
        }
      }
    }
  }

  return { populationDelta }
}

function hasAdjacentRoad(map: GameMap, x: number, y: number): boolean {
  const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]]
  for (const [dx, dy] of dirs) {
    const nx = x + dx!
    const ny = y + dy!
    if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue
    const nIdx = ny * map.width + nx
    if (map.infrastructure[nIdx]! & Infrastructure.Road) return true
  }
  return false
}

function getZoneDemand(zone: ZoneType, demand: DemandInfo): number {
  switch (zone) {
    case ZoneType.Residential: return demand.residential
    case ZoneType.Commercial: return demand.commercial
    case ZoneType.Industrial: return demand.industrial
    default: return 0
  }
}

function getZoneBuildingDefId(zone: ZoneType): string {
  switch (zone) {
    case ZoneType.Residential: return 'res.low'
    case ZoneType.Commercial: return 'com.low'
    case ZoneType.Industrial: return 'ind.low'
    default: return 'res.low'
  }
}
