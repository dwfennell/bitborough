import type { GameMap } from '@bitborough/core'
import { buildInfluenceMap } from './influence.js'

const POLICE_BASE_RADIUS = 15
const POLICE_SMALL_BASE_RADIUS = 6

export function calculateCrime(
  map: GameMap,
  landValues: Uint8Array,
  crimeLevel: Uint8Array,
  policeFunding: number,
  influenceBuffer: Float32Array,
): void {
  const size = map.width * map.height

  buildInfluenceMap(
    map, 'service.police', POLICE_BASE_RADIUS, policeFunding, influenceBuffer,
    { defId: 'service.police.small', baseRadius: POLICE_SMALL_BASE_RADIUS },
  )

  // Scaled-down Micropolis formula — our land values are 0-65, not 0-255
  for (let i = 0; i < size; i++) {
    if (map.zones[i] === 0) {
      crimeLevel[i] = 0
      continue
    }

    // Base crime for any zoned tile, slightly reduced by land value
    const lv = landValues[i]!
    const rawCrime = Math.max(0, 30 - Math.floor(lv * 0.15))
    const policeEffect = influenceBuffer[i]! * 40
    crimeLevel[i] = Math.max(0, Math.min(255, Math.floor(rawCrime - policeEffect)))
  }
}
