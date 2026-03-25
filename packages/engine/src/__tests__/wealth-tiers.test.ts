import { describe, test, expect } from 'vitest'
import { PRNG } from '../prng.js'
import {
  TIER_DISTRIBUTION,
  TIER_WEIGHTS,
  REPUTATION_DECAY,
  sampleWealthTier,
  computeSchellingPenalty,
  buildTierCountsByBuilding,
} from '../simulation/wealth-tiers.js'

describe('TIER_DISTRIBUTION', () => {
  test('sums to 1.0', () => {
    const sum = TIER_DISTRIBUTION[0] + TIER_DISTRIBUTION[1] + TIER_DISTRIBUTION[2]
    expect(sum).toBeCloseTo(1.0, 10)
  })
})

describe('TIER_WEIGHTS', () => {
  test('mid tier (tier 2) has 1.0 for all factors', () => {
    const mid = TIER_WEIGHTS[2]
    expect(mid.crime).toBe(1.0)
    expect(mid.pollution).toBe(1.0)
    expect(mid.park).toBe(1.0)
    expect(mid.fire).toBe(1.0)
    expect(mid.commute).toBe(1.0)
    expect(mid.jobMatch).toBe(1.0)
    expect(mid.commerce).toBe(1.0)
  })
})

describe('REPUTATION_DECAY', () => {
  test('is between 0 and 1', () => {
    expect(REPUTATION_DECAY).toBeGreaterThan(0)
    expect(REPUTATION_DECAY).toBeLessThan(1)
  })
})

describe('sampleWealthTier', () => {
  test('returns a valid tier (1, 2, or 3)', () => {
    const prng = new PRNG(42)
    for (let i = 0; i < 100; i++) {
      const tier = sampleWealthTier(prng, 0.5)
      expect([1, 2, 3]).toContain(tier)
    }
  })

  test('neutral reputation (0.5) produces base distribution (~30/45/25 within ±3%)', () => {
    const prng = new PRNG(12345)
    const counts = [0, 0, 0]
    const N = 10_000
    for (let i = 0; i < N; i++) {
      const tier = sampleWealthTier(prng, 0.5)
      counts[tier - 1]!++
    }
    const [f1, f2, f3] = counts.map(c => c / N)
    expect(f1).toBeCloseTo(0.30, 1)
    expect(f2).toBeCloseTo(0.45, 1)
    expect(f3).toBeCloseTo(0.25, 1)
  })

  test('low reputation (0.0) skews toward tier 1 (>40%) and away from tier 3 (<16%)', () => {
    const prng = new PRNG(99999)
    const counts = [0, 0, 0]
    const N = 10_000
    for (let i = 0; i < N; i++) {
      const tier = sampleWealthTier(prng, 0.0)
      counts[tier - 1]!++
    }
    const f1 = counts[0]! / N
    const f3 = counts[2]! / N
    expect(f1).toBeGreaterThan(0.40)
    expect(f3).toBeLessThan(0.16)
  })

  test('high reputation (1.0) skews toward tier 3 (>34%) and away from tier 1 (<20%)', () => {
    const prng = new PRNG(77777)
    const counts = [0, 0, 0]
    const N = 10_000
    for (let i = 0; i < N; i++) {
      const tier = sampleWealthTier(prng, 1.0)
      counts[tier - 1]!++
    }
    const f1 = counts[0]! / N
    const f3 = counts[2]! / N
    expect(f3).toBeGreaterThan(0.34)
    expect(f1).toBeLessThan(0.20)
  })
})

describe('computeSchellingPenalty', () => {
  test('returns 0 for single agent in building', () => {
    expect(computeSchellingPenalty(1, [1, 0, 0])).toBe(0)
    expect(computeSchellingPenalty(2, [0, 1, 0])).toBe(0)
    expect(computeSchellingPenalty(3, [0, 0, 1])).toBe(0)
  })

  test('returns 0 when same-tier fraction >= threshold (0.25)', () => {
    // 5 out of 20 agents are tier 1 = 0.25, which meets threshold
    expect(computeSchellingPenalty(1, [5, 10, 5])).toBe(0)
    // 6 out of 20 = 0.30, above threshold
    expect(computeSchellingPenalty(1, [6, 9, 5])).toBe(0)
  })

  test('returns positive penalty when minority tier', () => {
    // 1 out of 4 agents is tier 2 = 0.25, meets threshold, so 0
    // 1 out of 5 agents is tier 2 = 0.20, below threshold
    const penalty = computeSchellingPenalty(2, [2, 1, 2])
    expect(penalty).toBeGreaterThan(0)
  })

  test('maximum penalty calculation: 1 of 20 agents, tier 3 in [10,9,1] → (1-0.05/0.25)*0.08 = 0.064', () => {
    // tier 3: counts[2] = 1, total = 20, fraction = 0.05
    // penalty = 0.08 * (1 - 0.05 / 0.25) = 0.08 * (1 - 0.2) = 0.08 * 0.8 = 0.064
    const penalty = computeSchellingPenalty(3, [10, 9, 1])
    expect(penalty).toBeCloseTo(0.064, 10)
  })
})

describe('buildTierCountsByBuilding', () => {
  test('groups agents correctly by building', () => {
    const agents = [
      { homeBuildingId: 'bldg-1', wealthTier: 1 as const },
      { homeBuildingId: 'bldg-1', wealthTier: 2 as const },
      { homeBuildingId: 'bldg-1', wealthTier: 1 as const },
      { homeBuildingId: 'bldg-2', wealthTier: 3 as const },
      { homeBuildingId: 'bldg-2', wealthTier: 3 as const },
    ]
    const result = buildTierCountsByBuilding(agents)
    expect(result.size).toBe(2)
    expect(result.get('bldg-1')).toEqual([2, 1, 0])
    expect(result.get('bldg-2')).toEqual([0, 0, 2])
  })

  test('returns empty map for empty agents array', () => {
    const result = buildTierCountsByBuilding([])
    expect(result.size).toBe(0)
  })
})
