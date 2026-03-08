import { TileType, ZoneType } from '@bitborough/core'
import { hexToRgb } from './colors.js'

export const TERRAIN_RGB: [number, number, number][] = [
  hexToRgb('#4a8c3f'), // Grass
  hexToRgb('#3b7dd8'), // Water
  hexToRgb('#8b7355'), // Dirt
  hexToRgb('#d4b876'), // Sand
  hexToRgb('#2d6b2e'), // Trees
]
const FALLBACK_RGB: [number, number, number] = TERRAIN_RGB[0]!

export const ZONE_RGB: Record<number, [number, number, number]> = {
  [ZoneType.Residential]: hexToRgb('#4caf50'),
  [ZoneType.Commercial]: hexToRgb('#2196f3'),
  [ZoneType.Industrial]: hexToRgb('#ffc107'),
}

export function fillMinimapBuffer(
  terrain: Uint8Array,
  zones: Uint8Array,
  width: number,
  height: number,
  buffer: Uint8ClampedArray,
): void {
  for (let i = 0, len = width * height; i < len; i++) {
    const zone = zones[i] as ZoneType
    let rgb: [number, number, number]
    if (zone !== ZoneType.None) {
      rgb = ZONE_RGB[zone] ?? FALLBACK_RGB
    } else {
      rgb = TERRAIN_RGB[terrain[i] as TileType] ?? FALLBACK_RGB
    }
    const off = i * 4
    buffer[off] = rgb[0]
    buffer[off + 1] = rgb[1]
    buffer[off + 2] = rgb[2]
    buffer[off + 3] = 255
  }
}
