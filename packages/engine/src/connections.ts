import { type GameMap, Infrastructure } from '@rcity/core'

// Direction bits: N=bit0, E=bit1, S=bit2, W=bit3
const DX = [0, 1, 0, -1] as const
const DY = [-1, 0, 1, 0] as const

const CONNECTABLE = Infrastructure.Road | Infrastructure.PowerLine | Infrastructure.Rail

export function updateConnections(map: GameMap, x: number, y: number): void {
  updateTileConnections(map, x, y)
  // Update all neighbors too
  for (let dir = 0; dir < 4; dir++) {
    const nx = x + DX[dir]!
    const ny = y + DY[dir]!
    if (nx >= 0 && ny >= 0 && nx < map.width && ny < map.height) {
      updateTileConnections(map, nx, ny)
    }
  }
}

function updateTileConnections(map: GameMap, x: number, y: number): void {
  const idx = y * map.width + x
  const myInfra = map.infrastructure[idx]!

  if (myInfra === 0) {
    map.connections[idx] = 0
    return
  }

  let mask = 0
  for (let dir = 0; dir < 4; dir++) {
    const nx = x + DX[dir]!
    const ny = y + DY[dir]!
    if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue

    const neighborInfra = map.infrastructure[ny * map.width + nx]!
    if (myInfra & neighborInfra & CONNECTABLE) {
      mask |= (1 << dir)
    }
  }

  map.connections[idx] = mask
}
