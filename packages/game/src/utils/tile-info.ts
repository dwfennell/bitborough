import { TileType, ZoneType, Infrastructure, type GameState } from '@bitborough/core'
import { BUILDING_DEFS } from '@bitborough/engine'
import type { TileInfo } from '@bitborough/engine'

export interface TileDescription {
  position: { x: number; y: number }
  terrain: string
  zone: string
  infrastructure: string[]
  powered: boolean
  landValue: number
  building: string | null
  crime: number
  fireCoverage: number
  onFire: boolean
  traffic: number
}

export function describeInfrastructure(mask: number): string[] {
  const parts: string[] = []
  if (mask & Infrastructure.Road) parts.push('Road')
  if (mask & Infrastructure.PowerLine) parts.push('Power Line')
  if (mask & Infrastructure.Rail) parts.push('Rail')
  return parts
}

function describeBuildingName(defId: string): string {
  const def = BUILDING_DEFS[defId]
  if (!def) return defId
  const names: Record<string, string> = {
    'res.low': 'Residential (Low)',
    'com.low': 'Commercial (Low)',
    'ind.low': 'Industrial (Low)',
    'power.coal': 'Coal Power Plant',
    'power.nuclear': 'Nuclear Power Plant',
    'service.police': 'Police Station',
    'service.fire': 'Fire Station',
    'special.park': 'Park',
  }
  return names[defId] ?? defId
}

export function describeTile(tile: TileInfo, x: number, y: number, state: GameState): TileDescription {
  const idx = y * state.map.width + x

  // Find building at this tile (check if tile falls within any building's footprint)
  let buildingName: string | null = null
  for (const b of state.map.buildings) {
    const def = BUILDING_DEFS[b.defId]
    if (!def) continue
    if (x >= b.x && x < b.x + def.size.w && y >= b.y && y < b.y + def.size.h) {
      buildingName = describeBuildingName(b.defId)
      break
    }
  }

  return {
    position: { x, y },
    terrain: TileType[tile.terrain] ?? '?',
    zone: ZoneType[tile.zone] ?? 'None',
    infrastructure: describeInfrastructure(tile.infrastructure),
    powered: tile.powered,
    landValue: state.landValues[idx]!,
    building: buildingName,
    crime: state.crimeLevel[idx]!,
    fireCoverage: state.fireCoverage[idx]!,
    onFire: state.activeFires.includes(idx),
    traffic: (tile.infrastructure & Infrastructure.Road) ? state.trafficDensity[idx]! : 0,
  }
}
