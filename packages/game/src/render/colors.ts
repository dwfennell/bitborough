import { TileType, ZoneType } from '@bitborough/core'

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

export function landValueToRgba(value: number): string {
  const v = value / 255
  const r = Math.floor(v * 255)
  const g = Math.floor((1 - Math.abs(v - 0.5) * 2) * 255)
  const b = Math.floor((1 - v) * 255)
  return `rgba(${r}, ${g}, ${b}, 0.4)`
}

export function crimeToRgba(value: number): string {
  const v = value / 255
  const r = Math.floor(v * 255)
  const b = Math.floor((1 - v) * 200)
  return `rgba(${r}, 20, ${b}, 0.5)`
}

export function fireCoverageToRgba(value: number): string {
  const v = value / 255
  const r = Math.floor((1 - v) * 220)
  const g = Math.floor(v * 200)
  return `rgba(${r}, ${g}, 30, 0.4)`
}

export function educationCoverageToRgba(value: number): string {
  const v = value / 255
  const r = Math.floor(80 + v * 80)
  const g = Math.floor(120 * (1 - v))
  const b = Math.floor(180 + v * 75)
  return `rgba(${r}, ${g}, ${b}, 0.45)`
}

export function trafficToRgba(value: number): string {
  // value 0-255 maps to congestion 0-2.55 (capacity = 100, so 100/255 ≈ 0.39)
  // Thresholds: <50 green, <80 yellow, <=100 orange, >100 red
  if (value === 0) return 'rgba(0, 0, 0, 0)'
  if (value < 50) return 'rgba(76, 175, 80, 0.5)'
  if (value < 80) return 'rgba(255, 235, 59, 0.6)'
  if (value <= 100) return 'rgba(255, 152, 0, 0.7)'
  return 'rgba(244, 67, 54, 0.8)'
}

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
