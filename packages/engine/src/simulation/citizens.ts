import { type GameMap, type Building, Infrastructure } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import type { RoadGraph } from '../road-graph.js'
import { astar } from '../road-graph.js'

// ── Types ────────────────────────────────────────────────────────────────────

export interface Citizen {
  id: string
  homeBuildingId: string
  workBuildingId: string | null
  commerceBuildingId: string | null
  homeAccessRoad: number
  workAccessRoad: number | null
  commerceAccessRoad: number | null
  homeWorkRoute: number[]
  homeCommerceRoute: number[]
  homeWorkRouteTileSet: Set<number>
  homeCommerceRouteTileSet: Set<number>
  homeWorkRouteStale: boolean
  homeCommerceRouteStale: boolean
  satisfaction: number
}

export interface CitizenRegistry {
  agents: Citizen[]
  samplingRatio: number
}

export interface CitizenSummary {
  agentCount: number
  avgSatisfaction: number
  unmatchedJobFraction: number
  unmatchedCommerceFraction: number
  avgCommuteLengthTiles: number
}

export const EMPTY_CITIZEN_SUMMARY: CitizenSummary = {
  agentCount: 0,
  avgSatisfaction: 1,
  unmatchedJobFraction: 0,
  unmatchedCommerceFraction: 0,
  avgCommuteLengthTiles: 0,
}

export const DEFAULT_SAMPLING_RATIO = 50

// ── Access Road ──────────────────────────────────────────────────────────────

const FOOTPRINT_DX = [0, 1, 0, -1] as const
const FOOTPRINT_DY = [-1, 0, 1, 0] as const

/** Scan all footprint tiles N→E→S→W, row-major; return first adjacent road tile index, or -1. */
export function resolveAccessRoad(map: GameMap, building: Building): number {
  const def = BUILDING_DEFS[building.defId]
  const w = def?.size.w ?? 1
  const h = def?.size.h ?? 1
  const { width, height } = map

  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const fx = building.x + dx
      const fy = building.y + dy
      for (let dir = 0; dir < 4; dir++) {
        const nx = fx + FOOTPRINT_DX[dir]!
        const ny = fy + FOOTPRINT_DY[dir]!
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
        const nIdx = ny * width + nx
        if (map.infrastructure[nIdx]! & Infrastructure.Road) return nIdx
      }
    }
  }
  return -1
}

