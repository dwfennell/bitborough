import type { Building } from './buildings.js'

export interface MapMeta {
  name: string
  seed: number
  preset?: string
  createdAt: string
}

export interface GameMap {
  version: number
  width: number
  height: number
  terrain: Uint8Array
  zones: Uint8Array
  infrastructure: Uint16Array
  connections: Uint8Array
  elevation: Uint8Array
  buildings: Building[]
  meta: MapMeta
}

export const MAP_SIZES = [32, 64, 128, 256, 512] as const
export type MapSize = (typeof MAP_SIZES)[number]

export function createEmptyMap(width: number, height: number, meta: MapMeta): GameMap {
  const size = width * height
  return {
    version: 1,
    width,
    height,
    terrain: new Uint8Array(size), // all Grass (0)
    zones: new Uint8Array(size), // all None (0)
    infrastructure: new Uint16Array(size),
    connections: new Uint8Array(size),
    elevation: new Uint8Array(size),
    buildings: [],
    meta,
  }
}
