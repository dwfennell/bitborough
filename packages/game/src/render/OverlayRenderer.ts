import type { GameState } from '@bitborough/core'
import { Infrastructure } from '@bitborough/core'
import { landValueToRgba, crimeToRgba, fireCoverageToRgba } from './colors.js'

export type OverlayType = 'power' | 'landValue' | 'crime' | 'fire' | 'traffic' | 'none'

// Precomputed color lookups (0-255 index → rgba string)
function buildColorTable(fn: (v: number) => string): string[] {
  const table = new Array<string>(256)
  for (let i = 0; i < 256; i++) table[i] = fn(i)
  return table
}

const LAND_VALUE_COLORS = buildColorTable(landValueToRgba)
const CRIME_COLORS = buildColorTable(crimeToRgba)
const FIRE_COVERAGE_COLORS = buildColorTable(fireCoverageToRgba)

const POWER_ON = 'rgba(255, 235, 59, 0.4)'
const POWER_OFF = 'rgba(100, 100, 100, 0.3)'
const FIRE_ACTIVE = 'rgba(255, 100, 0, 0.7)'

// Traffic congestion colors (by capacity ratio)
const TRAFFIC_FREE = 'rgba(76, 175, 80, 0.5)'      // green: < 50%
const TRAFFIC_MODERATE = 'rgba(255, 235, 59, 0.6)'  // yellow: 50-80%
const TRAFFIC_HEAVY = 'rgba(255, 152, 0, 0.7)'      // orange: 80-100%
const TRAFFIC_GRIDLOCK = 'rgba(244, 67, 54, 0.8)'   // red: > 100%
const TRAFFIC_CAPACITY = 100

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
        const fires = state.activeFires

        for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
            const idx = y * mapWidth + x

            // Active fires: bright orange (check small array directly)
            if (fires.includes(idx)) {
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

      case 'traffic': {
        const traffic = state.trafficDensity
        const infra = state.map.infrastructure

        for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
            const idx = y * mapWidth + x
            if (!(infra[idx]! & Infrastructure.Road)) continue
            const congestion = traffic[idx]! / TRAFFIC_CAPACITY
            if (congestion < 0.5) ctx.fillStyle = TRAFFIC_FREE
            else if (congestion < 0.8) ctx.fillStyle = TRAFFIC_MODERATE
            else if (congestion <= 1.0) ctx.fillStyle = TRAFFIC_HEAVY
            else ctx.fillStyle = TRAFFIC_GRIDLOCK
            ctx.fillRect((x - cameraX) * ts, (y - cameraY) * ts, ts, ts)
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
