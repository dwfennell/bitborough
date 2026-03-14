import type { Building, GameMap } from '@bitborough/core'
import { BUILDING_DEFS } from './buildings-registry.js'

/**
 * Spatial index for O(1) building lookups by tile coordinate.
 * Every tile in a building's footprint maps to that building.
 * Rebuilt once per monthly tick (buildings only change during monthly simulation).
 */
export class BuildingIndex {
  /** tile index → building occupying that tile */
  private byTile: Map<number, Building>
  private width: number

  constructor(map: GameMap) {
    this.width = map.width
    this.byTile = new Map()
    for (const b of map.buildings) {
      this.addBuilding(b)
    }
  }

  /** Get the building at a specific tile, or undefined. */
  get(x: number, y: number): Building | undefined {
    return this.byTile.get(y * this.width + x)
  }

  /** Check if any building occupies a specific tile. */
  has(x: number, y: number): boolean {
    return this.byTile.has(y * this.width + x)
  }

  /** Check if any building occupies a tile by linear index. */
  hasIdx(idx: number): boolean {
    return this.byTile.has(idx)
  }

  private addBuilding(b: Building): void {
    const def = BUILDING_DEFS[b.defId]
    if (!def) return
    for (let dy = 0; dy < def.size.h; dy++) {
      for (let dx = 0; dx < def.size.w; dx++) {
        this.byTile.set((b.y + dy) * this.width + (b.x + dx), b)
      }
    }
  }
}
