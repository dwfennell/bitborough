import type { GameMap } from '@bitborough/core'
import { BUILDING_DEFS } from '../../buildings-registry.js'

const BOOST_THRESHOLD = 0.3
const BOOST_MULTIPLIER = 1.5

function stampRadialInfluence(
  output: Float32Array,
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number,
): void {
  const r = Math.ceil(radius)
  const r2 = radius * radius
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const tx = Math.floor(cx + dx)
      const ty = Math.floor(cy + dy)
      if (tx < 0 || ty < 0 || tx >= width || ty >= height) continue
      const dist2 = dx * dx + dy * dy
      if (dist2 > r2) continue
      const influence = 1.0 - Math.sqrt(dist2) / radius
      const idx = ty * width + tx
      output[idx] = Math.min(1.0, output[idx]! + influence)
    }
  }
}

/**
 * Build a radial influence map from all buildings matching a given defId.
 * Influence decays linearly from 1.0 at center to 0.0 at effectiveRadius.
 * Output is written into the provided Float32Array (values clamped to [0, 1]).
 *
 * When `secondary` is provided, small stations also contribute with a smaller
 * base radius, boosted 1.5x when within a large station's coverage.
 */
/** Convert a [0, 1] float influence buffer to a [0, 255] Uint8Array coverage layer. */
export function influenceToUint8(src: Float32Array, dst: Uint8Array): void {
  for (let i = 0; i < src.length; i++) {
    dst[i] = Math.min(255, Math.floor(src[i]! * 255))
  }
}

export function buildInfluenceMap(
  map: GameMap,
  defId: string,
  baseRadius: number,
  funding: number,
  output: Float32Array,
  secondary?: { defId: string; baseRadius: number },
): void {
  const { width, height, buildings } = map
  output.fill(0)

  const effectiveRadius = baseRadius * (funding / 100)
  if (effectiveRadius <= 0) return

  for (const b of buildings) {
    if (b.defId !== defId) continue
    const def = BUILDING_DEFS[b.defId]
    if (!def) continue
    stampRadialInfluence(output, width, height, b.x + def.size.w / 2, b.y + def.size.h / 2, effectiveRadius)
  }

  if (!secondary) return

  const smallEffective = secondary.baseRadius * (funding / 100)
  if (smallEffective <= 0) return

  for (const b of buildings) {
    if (b.defId !== secondary.defId) continue
    const def = BUILDING_DEFS[b.defId]
    if (!def) continue

    const cx = b.x + def.size.w / 2
    const cy = b.y + def.size.h / 2
    const coveredByLarge = output[Math.floor(cy) * width + Math.floor(cx)]! > BOOST_THRESHOLD
    const radius = coveredByLarge ? smallEffective * BOOST_MULTIPLIER : smallEffective
    stampRadialInfluence(output, width, height, cx, cy, radius)
  }
}
