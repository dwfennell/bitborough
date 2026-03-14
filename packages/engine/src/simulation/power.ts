import { type GameMap, Infrastructure, ZoneType, POWER } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import type { BuildingIndex } from '../building-index.js'

interface PowerPlant {
  x: number
  y: number
  w: number
  h: number
  capacity: number
}

export function propagatePower(map: GameMap, powerGrid: Uint8Array, bldIdx: BuildingIndex): void {
  // Clear power grid
  powerGrid.fill(0)

  // Find all power plants
  const plants = findPowerPlants(map)

  for (const plant of plants) {
    bfsPower(map, powerGrid, plant, bldIdx)
  }
}

function findPowerPlants(map: GameMap): PowerPlant[] {
  const plants: PowerPlant[] = []

  for (const building of map.buildings) {
    const def = BUILDING_DEFS[building.defId]
    if (!def) continue

    let capacity = 0
    if (building.defId === 'power.diesel') {
      capacity = POWER.dieselCapacity
    } else if (building.defId === 'power.coal') {
      capacity = POWER.coalCapacity
    } else if (building.defId === 'power.nuclear') {
      capacity = POWER.nuclearCapacity
    }

    if (capacity > 0) {
      plants.push({
        x: building.x,
        y: building.y,
        w: def.size.w,
        h: def.size.h,
        capacity,
      })
    }
  }

  return plants
}

function bfsPower(map: GameMap, powerGrid: Uint8Array, plant: PowerPlant, bldIdx: BuildingIndex): void {
  const { width, height } = map
  let remaining = plant.capacity

  // Queue for BFS — start from all footprint tiles
  const queue: number[] = []

  // Mark and enqueue all footprint tiles first
  for (let dy = 0; dy < plant.h; dy++) {
    for (let dx = 0; dx < plant.w; dx++) {
      const tx = plant.x + dx
      const ty = plant.y + dy
      if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
        const idx = ty * width + tx
        if (powerGrid[idx] === 0) {
          powerGrid[idx] = 1
          remaining--
          queue.push(idx)
        }
      }
    }
  }

  // BFS through conductors
  const DX = [0, 1, 0, -1]
  const DY = [-1, 0, 1, 0]

  let head = 0
  while (head < queue.length && remaining > 0) {
    const idx = queue[head++]!
    const x = idx % width
    const y = (idx - x) / width

    for (let dir = 0; dir < 4; dir++) {
      const nx = x + DX[dir]!
      const ny = y + DY[dir]!
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue

      const nIdx = ny * width + nx
      if (powerGrid[nIdx] !== 0) continue // already powered
      if (remaining <= 0) break

      // A tile is a conductor if it has power lines, roads, or a building on it
      if (isConductor(map, nIdx, bldIdx)) {
        powerGrid[nIdx] = 1
        remaining--
        queue.push(nIdx)
      }
    }
  }
}

function isConductor(map: GameMap, idx: number, bldIdx: BuildingIndex): boolean {
  const infra = map.infrastructure[idx]!
  if (infra & Infrastructure.PowerLine) return true
  if (infra & Infrastructure.Road) return true
  if (map.zones[idx] !== ZoneType.None) return true
  if (bldIdx.hasIdx(idx)) return true
  return false
}
