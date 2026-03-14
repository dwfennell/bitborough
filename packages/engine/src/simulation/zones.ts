import { type GameMap, type DemandInfo, type Building, ZoneType, Infrastructure, DensityLevel } from '@bitborough/core'
import { PRNG } from '../prng.js'

export function updateZones(
  map: GameMap,
  powerGrid: Uint8Array,
  demand: DemandInfo,
  prng: PRNG,
  nextBuildingId: { value: number },
): { populationDelta: number } {
  const populationDelta = 0

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const idx = y * map.width + x
      const zone = map.zones[idx] as ZoneType

      if (zone === ZoneType.None) continue

      const powered = powerGrid[idx] !== 0
      const hasRoad = hasNearbyRoad(map, x, y)
      const hasBuilding = map.buildings.some(b => b.x === x && b.y === y)

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

  return { populationDelta }
}

/** Zone develops if a road exists within 3 tiles (Manhattan distance), per SC2K rules. */
function hasNearbyRoad(map: GameMap, x: number, y: number): boolean {
  const range = 3
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > range) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue
      const nIdx = ny * map.width + nx
      if (map.infrastructure[nIdx]! & Infrastructure.Road) return true
    }
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
