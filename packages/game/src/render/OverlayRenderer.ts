import type { GameState } from '@bitborough/core'
import { landValueToRgba } from './colors.js'

export type OverlayType = 'power' | 'landValue' | 'none'

// Precomputed color lookup for land values (0-255)
const LAND_VALUE_COLORS: string[] = new Array(256)
for (let i = 0; i < 256; i++) {
  LAND_VALUE_COLORS[i] = landValueToRgba(i)
}

const POWER_ON = 'rgba(255, 235, 59, 0.4)'
const POWER_OFF = 'rgba(100, 100, 100, 0.3)'

export interface VisibleTileRange {
  ts: number
  startX: number
  startY: number
  endX: number
  endY: number
  mapWidth: number
  cameraX: number
  cameraY: number
}

export class OverlayRenderer {
  private activeOverlay: OverlayType = 'none'

  render(ctx: CanvasRenderingContext2D, state: GameState, range: VisibleTileRange): void {
    if (this.activeOverlay === 'none') return

    const { ts, startX, startY, endX, endY, mapWidth, cameraX, cameraY } = range

    if (this.activeOverlay === 'power') {
      const grid = state.powerGrid
      for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
          ctx.fillStyle = grid[y * mapWidth + x] ? POWER_ON : POWER_OFF
          ctx.fillRect((x - cameraX) * ts, (y - cameraY) * ts, ts, ts)
        }
      }
    } else {
      const values = state.landValues
      for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
          ctx.fillStyle = LAND_VALUE_COLORS[values[y * mapWidth + x]!]!
          ctx.fillRect((x - cameraX) * ts, (y - cameraY) * ts, ts, ts)
        }
      }
    }
  }

  toggle(overlay: OverlayType): void {
    this.activeOverlay = this.activeOverlay === overlay ? 'none' : overlay
  }
}
