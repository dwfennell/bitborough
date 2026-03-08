import { type GameMap, Infrastructure, ZoneType, POWER } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

interface PowerPlant {
  x: number
  y: number
  w: number
  h: number
  capacity: number
}

export function propagatePower(map: GameMap, powerGrid: Uint8Array): void {
  // Clear power grid
  powerGrid.fill(0)

  // Find all power plants
  const plants = findPowerPlants(map)

  for (const plant of plants) {
    bfsPower(map, powerGrid, plant)
  }
}

function findPowerPlants(map: GameMap): PowerPlant[] {
  const plants: PowerPlant[] = []

  for (const building of map.buildings) {
    const def = BUILDING_DEFS[building.defId]
    if (!def) continue

    let capacity = 0
    if (building.defId === 'power.coal') {
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

function bfsPower(
  map: GameMap,
  powerGrid: Uint8Array,
  plant: PowerPlant,
): void {
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
      if (isConductor(map, nIdx)) {
        powerGrid[nIdx] = 1
        remaining--
        queue.push(nIdx)
      }
    }
  }
}

function isConductor(map: GameMap, idx: number): boolean {
  const infra = map.infrastructure[idx]!
  // Power lines conduct
  if (infra & Infrastructure.PowerLine) return true
  // Roads conduct
  if (infra & Infrastructure.Road) return true
  // Zoned tiles conduct (so they can receive power from adjacent infrastructure)
  if (map.zones[idx] !== ZoneType.None) return true
  // Tiles with buildings on them conduct
  // Check if any building covers this tile
  if (hasBuildingAt(map, idx)) return true
  return false
}

function hasBuildingAt(map: GameMap, idx: number): boolean {
  const { width } = map
  const x = idx % width
  const y = (idx - x) / width

  for (const building of map.buildings) {
    const def = BUILDING_DEFS[building.defId]
    if (!def) continue
    const bx = building.x
    const by = building.y
    if (x >= bx && x < bx + def.size.w && y >= by && y < by + def.size.h) {
      return true
    }
  }
  return false
}
