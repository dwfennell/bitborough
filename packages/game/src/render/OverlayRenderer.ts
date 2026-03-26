import type { GameState } from '@bitborough/core'
import { Infrastructure } from '@bitborough/core'
import { landValueToRgba, crimeToRgba, fireCoverageToRgba, trafficToRgba, educationCoverageToRgba } from './colors.js'

export type OverlayType = 'power' | 'landValue' | 'crime' | 'fire' | 'traffic' | 'education' | 'none'

// Precomputed color lookups (0-255 index → rgba string)
function buildColorTable(fn: (v: number) => string): string[] {
  const table = new Array<string>(256)
  for (let i = 0; i < 256; i++) table[i] = fn(i)
  return table
}

const LAND_VALUE_COLORS = buildColorTable(landValueToRgba)
const CRIME_COLORS = buildColorTable(crimeToRgba)
const FIRE_COVERAGE_COLORS = buildColorTable(fireCoverageToRgba)
const TRAFFIC_COLORS = buildColorTable(trafficToRgba)
const EDUCATION_COVERAGE_COLORS = buildColorTable(educationCoverageToRgba)

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
  rawTs?: number
}

export class OverlayRenderer {
  private activeOverlay: OverlayType = 'none'

  render(ctx: CanvasRenderingContext2D, state: GameState, range: VisibleTileRange): void {
    if (this.activeOverlay === 'none') return

    const { ts, startX, startY, endX, endY, mapWidth, cameraX, cameraY, rawTs } = range
    const posTs = rawTs ?? ts

    switch (this.activeOverlay) {
      case 'power': {
        const grid = state.powerGrid
        for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
            ctx.fillStyle = grid[y * mapWidth + x] ? POWER_ON : POWER_OFF
            ctx.fillRect(Math.floor((x - cameraX) * posTs), Math.floor((y - cameraY) * posTs), ts, ts)
          }
        }
        break
      }

      case 'landValue': {
        const values = state.landValues
        for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
            ctx.fillStyle = LAND_VALUE_COLORS[values[y * mapWidth + x]!]!
            ctx.fillRect(Math.floor((x - cameraX) * posTs), Math.floor((y - cameraY) * posTs), ts, ts)
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
            ctx.fillRect(Math.floor((x - cameraX) * posTs), Math.floor((y - cameraY) * posTs), ts, ts)
          }
        }
        break
      }

      case 'fire': {
        const coverage = state.fireCoverage
        const fireSet = new Set(state.activeFires)

        for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
            const idx = y * mapWidth + x

            // Active fires: bright orange (check small array directly)
            if (fireSet.has(idx)) {
              ctx.fillStyle = FIRE_ACTIVE
              ctx.fillRect(Math.floor((x - cameraX) * posTs), Math.floor((y - cameraY) * posTs), ts, ts)
              continue
            }

            // Fire coverage: green (covered) → red (uncovered, where zoned)
            const v = coverage[idx]!
            if (v > 0 || state.map.zones[idx] !== 0) {
              ctx.fillStyle = FIRE_COVERAGE_COLORS[v]!
              ctx.fillRect(Math.floor((x - cameraX) * posTs), Math.floor((y - cameraY) * posTs), ts, ts)
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
            const v = traffic[idx]!
            if (v === 0) continue
            ctx.fillStyle = TRAFFIC_COLORS[v]!
            ctx.fillRect(Math.floor((x - cameraX) * posTs), Math.floor((y - cameraY) * posTs), ts, ts)
          }
        }
        break
      }

      case 'education': {
        const coverage = state.educationCoverage
        for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
            const idx = y * mapWidth + x
            const v = coverage[idx]!
            if (v === 0 || state.map.zones[idx] === 0) continue
            ctx.fillStyle = EDUCATION_COVERAGE_COLORS[v]!
            ctx.fillRect(Math.floor((x - cameraX) * posTs), Math.floor((y - cameraY) * posTs), ts, ts)
          }
        }
        break
      }
    }
  }

  toggle(overlay: OverlayType): void {
    this.activeOverlay = this.activeOverlay === overlay ? 'none' : overlay
  }

  get active(): OverlayType {
    return this.activeOverlay
  }
}
