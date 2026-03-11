import { Infrastructure, DensityLevel } from '@bitborough/core'
import type { GameMap } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

export const TRANSIT_RADIUS = 10
export const MEDIUM_DENSITY_POP_THRESHOLD = 500

/** Weighted center of all active buildings. Returns map center if no buildings. */
export function cityCenter(map: GameMap): { cx: number; cy: number } {
  const active = map.buildings.filter(b => b.state === 'active')
  if (active.length === 0) return { cx: map.width / 2, cy: map.height / 2 }
  const cx = active.reduce((sum, b) => sum + b.x, 0) / active.length
  const cy = active.reduce((sum, b) => sum + b.y, 0) / active.length
  return { cx, cy }
}

/** True if any paved road exists within 3 tiles (Manhattan distance). */
export function hasNearbyPavedRoad(map: GameMap, x: number, y: number): boolean {
  const range = 3
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > range) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue
      const infra = map.infrastructure[ny * map.width + nx]!
      if (infra & Infrastructure.PavedRoad) return true
    }
  }
  return false
}

/** True if any active transit stop building exists within TRANSIT_RADIUS tiles (Manhattan distance). */
export function hasNearbyTransitStop(map: GameMap, x: number, y: number): boolean {
  for (const b of map.buildings) {
    if (b.defId !== 'transit.stop' || b.state !== 'active') continue
    const dist = Math.abs(b.x - x) + Math.abs(b.y - y)
    if (dist <= TRANSIT_RADIUS) return true
  }
  return false
}

/**
 * Upgrade probability using Clark's Law exponential decay.
 * P = demandFactor × e^(-distance / radius)
 */
export function upgradeProb(demandFactor: number, distance: number, radius: number): number {
  return demandFactor * Math.exp(-distance / radius)
}

/**
 * Dynamic radius for medium density — grows with population.
 * Starts at 5 tiles, reaches 30 at ~25,000 population.
 */
export function mediumRadius(population: number): number {
  return Math.min(5 + population / 1000, 30)
}

/** True if more than half of neighbors within 3-tile radius are Medium or High density zone buildings. */
export function hasCriticalMass(map: GameMap, x: number, y: number): boolean {
  let developed = 0
  let total = 0
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      if (dx === 0 && dy === 0) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue
      total++
      const neighbor = map.buildings.find(b => b.x === nx && b.y === ny && b.state === 'active')
      if (neighbor) {
        const def = BUILDING_DEFS[neighbor.defId]
        if (def && (def.density === DensityLevel.Medium || def.density === DensityLevel.High)) developed++
      }
    }
  }
  return total > 0 && developed / total > 0.5
}
