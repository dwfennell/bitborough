import type { GameMap } from '@bitborough/core'
import { buildInfluenceMap, influenceToUint8 } from './influence.js'

const SCHOOL_BASE_RADIUS = 12
const SCHOOL_SMALL_BASE_RADIUS = 5

export function calculateEducationCoverage(
  map: GameMap,
  educationCoverage: Uint8Array,
  educationFunding: number,
  influenceBuffer: Float32Array,
): void {
  buildInfluenceMap(
    map, 'service.school', SCHOOL_BASE_RADIUS, educationFunding, influenceBuffer,
    { defId: 'service.school.small', baseRadius: SCHOOL_SMALL_BASE_RADIUS },
  )

  influenceToUint8(influenceBuffer, educationCoverage)
}
