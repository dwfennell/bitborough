import type { GameState } from '@bitborough/core'
import { landValueToRgba } from './colors.js'

export type OverlayType = 'power' | 'landValue' | 'crime' | 'fire' | 'none'

// Precomputed color lookup for land values (0-255)
const LAND_VALUE_COLORS: string[] = new Array(256)
for (let i = 0; i < 256; i++) {
  LAND_VALUE_COLORS[i] = landValueToRgba(i)
}

// Precomputed crime colors: blue (low) → red (high)
const CRIME_COLORS: string[] = new Array(256)
for (let i = 0; i < 256; i++) {
  const v = i / 255
  const r = Math.floor(v * 255)
  const b = Math.floor((1 - v) * 200)
  CRIME_COLORS[i] = `rgba(${r}, 20, ${b}, 0.5)`
}

// Precomputed fire coverage colors: green (covered) → red (uncovered)
const FIRE_COVERAGE_COLORS: string[] = new Array(256)
for (let i = 0; i < 256; i++) {
  const v = i / 255
  const r = Math.floor((1 - v) * 220)
  const g = Math.floor(v * 200)
  FIRE_COVERAGE_COLORS[i] = `rgba(${r}, ${g}, 30, 0.4)`
}

const POWER_ON = 'rgba(255, 235, 59, 0.4)'
const POWER_OFF = 'rgba(100, 100, 100, 0.3)'
const FIRE_ACTIVE = 'rgba(255, 100, 0, 0.7)'

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

    switch (this.activeOverlay) {
      case 'power': {
        const grid = state.powerGrid
        for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
            ctx.fillStyle = grid[y * mapWidth + x] ? POWER_ON : POWER_OFF
            ctx.fillRect((x - cameraX) * ts, (y - cameraY) * ts, ts, ts)
          }
        }
        break
      }

      case 'landValue': {
        const values = state.landValues
        for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
            ctx.fillStyle = LAND_VALUE_COLORS[values[y * mapWidth + x]!]!
            ctx.fillRect((x - cameraX) * ts, (y - cameraY) * ts, ts, ts)
          }
        }
        break
      }

      case 'crime': {
        const crime = state.crimeLevel
        for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
            const v = crime[y * mapWidth + x]!
            if (v === 0) continue
            ctx.fillStyle = CRIME_COLORS[v]!
            ctx.fillRect((x - cameraX) * ts, (y - cameraY) * ts, ts, ts)
          }
        }
        break
      }

      case 'fire': {
        const coverage = state.fireCoverage
        const activeSet = new Set(state.activeFires)

        for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
            const idx = y * mapWidth + x

            // Active fires: bright orange
            if (activeSet.has(idx)) {
              ctx.fillStyle = FIRE_ACTIVE
              ctx.fillRect((x - cameraX) * ts, (y - cameraY) * ts, ts, ts)
              continue
            }

            // Fire coverage: green (covered) → red (uncovered, where zoned)
            const v = coverage[idx]!
            if (v > 0 || state.map.zones[idx] !== 0) {
              ctx.fillStyle = FIRE_COVERAGE_COLORS[v]!
              ctx.fillRect((x - cameraX) * ts, (y - cameraY) * ts, ts, ts)
            }
          }
        }
        break
      }
    }
  }

  toggle(overlay: OverlayType): void {
    this.activeOverlay = this.activeOverlay === overlay ? 'none' : overlay
  }
}
