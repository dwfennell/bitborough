import type { WealthTier } from '@bitborough/core'
import type { PRNG } from '../prng.js'

// ── Tier distribution ─────────────────────────────────────────────
export const TIER_DISTRIBUTION: readonly [number, number, number] = [0.30, 0.45, 0.25]

// ── Tier weight table ─────────────────────────────────────────────
export interface TierFactorWeights {
  crime: number; pollution: number; park: number; fire: number
  commute: number; jobMatch: number; commerce: number
}

export const TIER_WEIGHTS: Record<WealthTier, TierFactorWeights> = {
  1: { crime: 0.8, pollution: 0.7, park: 0.5, fire: 0.8, commute: 1.3, jobMatch: 1.2, commerce: 0.9 },
  2: { crime: 1.0, pollution: 1.0, park: 1.0, fire: 1.0, commute: 1.0, jobMatch: 1.0, commerce: 1.0 },
  3: { crime: 1.4, pollution: 1.5, park: 1.3, fire: 1.2, commute: 0.8, jobMatch: 0.9, commerce: 1.1 },
}

// ── Constants ─────────────────────────────────────────────────────
export const REPUTATION_DECAY = 0.95
export const SCHELLING_WEIGHT = 0.08
export const HOMOGENEITY_THRESHOLD = 0.25
export const TIER_LABELS: readonly [string, string, string] = ['Low', 'Mid', 'High']

// ── Tier sampling ─────────────────────────────────────────────────
export function sampleWealthTier(prng: PRNG, reputation: number): WealthTier {
  const w1 = 0.30 * (1.5 - reputation)
  const w2 = 0.45
  const w3 = 0.25 * (0.5 + reputation)
  const sum = w1 + w2 + w3
  const r = prng.next() * sum
  if (r < w1) return 1
  if (r < w1 + w2) return 2
  return 3
}

// ── Schelling ─────────────────────────────────────────────────────
export function buildTierCountsByBuilding(
  agents: ReadonlyArray<{ homeBuildingId: string; wealthTier: WealthTier }>,
): Map<string, [number, number, number]> {
  const map = new Map<string, [number, number, number]>()
  for (const a of agents) {
    let counts = map.get(a.homeBuildingId)
    if (!counts) { counts = [0, 0, 0]; map.set(a.homeBuildingId, counts) }
    counts[a.wealthTier - 1]! ++
  }
  return map
}

export function computeSchellingPenalty(
  agentTier: WealthTier,
  buildingTierCounts: [number, number, number],
): number {
  const total = buildingTierCounts[0] + buildingTierCounts[1] + buildingTierCounts[2]
  if (total <= 1) return 0
  const sameTierFraction = buildingTierCounts[agentTier - 1]! / total
  if (sameTierFraction >= HOMOGENEITY_THRESHOLD) return 0
  return SCHELLING_WEIGHT * (1 - sameTierFraction / HOMOGENEITY_THRESHOLD)
}
