import { TileType, ZoneType } from '@bitborough/core'

export const TERRAIN_COLORS: Record<number, string> = {
  [TileType.Grass]: '#4a8c3f',
  [TileType.Water]: '#3b7dd8',
  [TileType.Dirt]: '#8b7355',
  [TileType.Sand]: '#d4b876',
  [TileType.Trees]: '#2d6b2e',
}

export const ZONE_BASE_RGB: Record<ZoneType, string> = {
  [ZoneType.None]: '128,128,128',
  [ZoneType.Residential]: '76,175,80',
  [ZoneType.Commercial]: '33,150,243',
  [ZoneType.Industrial]: '255,193,7',
}

export const ZONE_HEX_COLORS: Record<ZoneType, string> = {
  [ZoneType.None]: '#808080',
  [ZoneType.Residential]: '#4caf50',
  [ZoneType.Commercial]: '#2196f3',
  [ZoneType.Industrial]: '#ffc107',
}

export const ZONE_OVERLAY_COLORS: Record<ZoneType, string> = {
  [ZoneType.None]: 'transparent',
  [ZoneType.Residential]: `rgba(${ZONE_BASE_RGB[ZoneType.Residential]},0.3)`,
  [ZoneType.Commercial]: `rgba(${ZONE_BASE_RGB[ZoneType.Commercial]},0.3)`,
  [ZoneType.Industrial]: `rgba(${ZONE_BASE_RGB[ZoneType.Industrial]},0.3)`,
}

export const ZONE_PREVIEW_COLORS: Record<ZoneType, string> = {
  [ZoneType.None]: 'transparent',
  [ZoneType.Residential]: `rgba(${ZONE_BASE_RGB[ZoneType.Residential]},0.4)`,
  [ZoneType.Commercial]: `rgba(${ZONE_BASE_RGB[ZoneType.Commercial]},0.4)`,
  [ZoneType.Industrial]: `rgba(${ZONE_BASE_RGB[ZoneType.Industrial]},0.4)`,
}

export const ZONE_LETTERS: Record<number, string> = {
  [ZoneType.Residential]: 'R',
  [ZoneType.Commercial]: 'C',
  [ZoneType.Industrial]: 'I',
}
