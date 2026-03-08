import type { GameMap } from '@bitborough/core'
import { BUILDING_DEFS } from '../../buildings-registry.js'

/**
 * Build a radial influence map from all buildings matching a given defId.
 * Influence decays linearly from 1.0 at center to 0.0 at effectiveRadius.
 * Output is written into the provided Float32Array (values clamped to [0, 1]).
 */
export function buildInfluenceMap(
  map: GameMap,
  defId: string,
  baseRadius: number,
  funding: number,
  output: Float32Array,
): void {
  const { width, height, buildings } = map
  output.fill(0)

  const effectiveRadius = baseRadius * (funding / 100)
  if (effectiveRadius <= 0) return

  const r = Math.ceil(effectiveRadius)

  for (const b of buildings) {
    if (b.defId !== defId) continue
    const def = BUILDING_DEFS[b.defId]
    if (!def) continue

    const cx = b.x + def.size.w / 2
    const cy = b.y + def.size.h / 2

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const tx = Math.floor(cx + dx)
        const ty = Math.floor(cy + dy)
        if (tx < 0 || ty < 0 || tx >= width || ty >= height) continue
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > effectiveRadius) continue
        const influence = 1.0 - dist / effectiveRadius
        const idx = ty * width + tx
        output[idx] = Math.min(1.0, output[idx]! + influence)
      }
    }
  }
}
