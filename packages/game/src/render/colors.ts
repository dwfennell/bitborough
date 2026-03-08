import { ZoneType } from '@bitborough/core'

export const ZONE_BASE_RGB: Record<ZoneType, string> = {
  [ZoneType.None]: '128,128,128',
  [ZoneType.Residential]: '76,175,80',
  [ZoneType.Commercial]: '33,150,243',
  [ZoneType.Industrial]: '255,193,7',
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
