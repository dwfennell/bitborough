import { type GameMap, type DemandInfo, type Building, ZoneType, DensityLevel } from '@bitborough/core'
import { PRNG } from '../prng.js'
import type { BuildingIndex } from '../building-index.js'
import { hasNearbyRoad } from './road-access.js'

export function updateZones(
  map: GameMap,
  powerGrid: Uint8Array,
  demand: DemandInfo,
  prng: PRNG,
  nextBuildingId: { value: number },
  bldIdx: BuildingIndex,
): { populationDelta: number } {
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const idx = y * map.width + x
      const zone = map.zones[idx] as ZoneType

      if (zone === ZoneType.None) continue

      const powered = powerGrid[idx] !== 0
      const hasRoad = hasNearbyRoad(map, x, y)
      const hasBuilding = bldIdx.has(x, y)

      // Development: zone is empty, powered, has road, and demand is positive
      if (!hasBuilding && powered && hasRoad) {
        const zoneDemand = getZoneDemand(zone, demand)
        if (zoneDemand <= 0) continue

        // Development probability based on demand
        // baseProbability = 0.05 (5% chance per month per tile)
        const probability = 0.12 * zoneDemand
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
            state: 'active',
            residents: 0,
          }
          map.buildings.push(building)
          // New buildings start at residents=0; population grows via the fill loop in density.ts
        }
      }
    }
  }

  return { populationDelta: 0 }
}

export function getZoneDemand(zone: ZoneType, demand: DemandInfo): number {
  switch (zone) {
    case ZoneType.Residential:
      return demand.residential
    case ZoneType.Commercial:
      return demand.commercial
    case ZoneType.Industrial:
      return demand.industrial
    default:
      return 0
  }
}

function getZoneBuildingDefId(zone: ZoneType): string {
  switch (zone) {
    case ZoneType.Residential:
      return 'res.low'
    case ZoneType.Commercial:
      return 'com.low'
    case ZoneType.Industrial:
      return 'ind.low'
    default:
      return 'res.low'
  }
}
