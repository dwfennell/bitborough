import { TileType, ZoneType, Infrastructure, type GameState } from '@bitborough/core'
import type { TileInfo } from '@bitborough/engine'

export interface TileDescription {
  position: { x: number; y: number }
  terrain: string
  zone: string
  infrastructure: string[]
  powered: boolean
  landValue: number
}

export function describeInfrastructure(mask: number): string[] {
  const parts: string[] = []
  if (mask & Infrastructure.Road) parts.push('Road')
  if (mask & Infrastructure.PowerLine) parts.push('Power Line')
  if (mask & Infrastructure.Rail) parts.push('Rail')
  return parts
}

export function describeTile(tile: TileInfo, x: number, y: number, state: GameState): TileDescription {
  const idx = y * state.map.width + x
  return {
    position: { x, y },
    terrain: TileType[tile.terrain] ?? '?',
    zone: ZoneType[tile.zone] ?? 'None',
    infrastructure: describeInfrastructure(tile.infrastructure),
    powered: tile.powered,
    landValue: state.landValues[idx],
  }
}
