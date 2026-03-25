# Wealth Tiers Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three-tier wealth classification to citizen agents with tier-weighted satisfaction, a neighborhood reputation layer, location-weighted tier assignment, and Schelling same-tier preferences — producing emergent spatial income sorting.

**Architecture:** Tier logic lives in the agent layer; fill/drain and desirability stay unchanged. A new `reputation.ts` module computes a slow-moving per-tile quality score. `wealth-tiers.ts` holds constants and the tier sampling function. `computeSatisfaction` expands to include environment factors (crime, pollution, fire, parks) with per-tier weights plus a Schelling penalty. `createAgent` uses reputation to bias tier assignment. Save/load bumps to v7.

**Tech Stack:** TypeScript, Vitest, pnpm workspace monorepo (`@bitborough/engine`, `@bitborough/core`)

**Spec:** `docs/superpowers/specs/2026-03-24-wealth-tiers-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `packages/core/src/state.ts` | Modify | Add `WealthTier` type, `tierCounts` to `CitizenSummary`, `wealthTier` to saved agent in `SaveFile`, `reputationLayer?: number[]` to saved state |
| `packages/core/src/index.ts` | Modify | Export `WealthTier` |
| `packages/engine/src/simulation/wealth-tiers.ts` | Create | `TIER_WEIGHTS` table, `sampleWealthTier()`, `computeSchellingPenalty()`, all tier constants |
| `packages/engine/src/__tests__/wealth-tiers.test.ts` | Create | Unit tests for tier sampling, Schelling penalty |
| `packages/engine/src/simulation/reputation.ts` | Create | `computeReputation()` — monthly reputation layer update |
| `packages/engine/src/__tests__/reputation.test.ts` | Create | Unit tests for reputation decay and quality derivation |
| `packages/engine/src/simulation/citizens.ts` | Modify | Add `wealthTier` to `Citizen`, expand `computeSatisfaction` with tier weights + environment + Schelling, update `createAgent` to accept reputation + PRNG, update `computeCitizenSummary` for `tierCounts` |
| `packages/engine/src/__tests__/citizens-tiers.test.ts` | Create | Tests for tier-weighted satisfaction, tier assignment, summary aggregation |
| `packages/engine/src/simulation/desirability.ts` | Modify | Export `parkDesirabilityBonus` |
| `packages/engine/src/Engine.ts` | Modify | Allocate `reputationLayer`, call `computeReputation` in tick, pass `TileLayers` to citizen tick, pass reputation to `syncResidentialAgents`, save/load v7 |
| `packages/engine/src/__tests__/serialization.test.ts` | Modify | Add v7 migration test |

---

## Chunk 1: Core Types & Constants Module

### Task 1: Extend core types with WealthTier and tierCounts

**Files:**
- Modify: `packages/core/src/state.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Add `WealthTier` type and `tierCounts` to `CitizenSummary`**

In `packages/core/src/state.ts`, add after the existing imports/types at the top of the file:

```typescript
export type WealthTier = 1 | 2 | 3 // 1=Low, 2=Mid, 3=High
```

In the `CitizenSummary` interface (line ~64, after `netMigrationLastTick`), add:

```typescript
  tierCounts: [low: number, mid: number, high: number]
```

- [ ] **Step 2: Add `wealthTier` to saved agent schema in `SaveFile`**

In the `SaveFile` interface citizens agents array type (line ~163, inside the agent object type), add:

```typescript
        wealthTier?: WealthTier
```

Optional (`?`) because v6 saves won't have it — the migration handles the default.

- [ ] **Step 3: Export `WealthTier` from core index**

In `packages/core/src/index.ts`, add `WealthTier` to the exports from `'./state.js'`. Find the line that exports `CitizenSummary` and add `WealthTier` alongside it.

- [ ] **Step 4: Verify the build**

Run: `cd packages/core && pnpm build`

This will fail in the engine package because `EMPTY_CITIZEN_SUMMARY` in `citizens.ts` doesn't have `tierCounts` yet. That's expected — we fix it in Task 3.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/state.ts packages/core/src/index.ts
git commit -m "feat: add WealthTier type and tierCounts to CitizenSummary"
```

---

### Task 2: Create wealth-tiers constants module

**Files:**
- Create: `packages/engine/src/simulation/wealth-tiers.ts`
- Create: `packages/engine/src/__tests__/wealth-tiers.test.ts`

- [ ] **Step 1: Write failing tests for `sampleWealthTier` and constants**

Create `packages/engine/src/__tests__/wealth-tiers.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { PRNG } from '../prng.js'
import {
  TIER_WEIGHTS,
  TIER_DISTRIBUTION,
  REPUTATION_DECAY,
  SCHELLING_WEIGHT,
  HOMOGENEITY_THRESHOLD,
  sampleWealthTier,
} from '../simulation/wealth-tiers.js'
import type { WealthTier } from '@bitborough/core'

describe('wealth-tiers constants', () => {
  test('TIER_DISTRIBUTION sums to 1.0', () => {
    const sum = TIER_DISTRIBUTION.reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(1.0)
  })

  test('TIER_WEIGHTS mid tier is 1.0 for all factors', () => {
    for (const [, value] of Object.entries(TIER_WEIGHTS[2])) {
      expect(value).toBe(1.0)
    }
  })

  test('REPUTATION_DECAY is between 0 and 1', () => {
    expect(REPUTATION_DECAY).toBeGreaterThan(0)
    expect(REPUTATION_DECAY).toBeLessThan(1)
  })
})

describe('sampleWealthTier', () => {
  test('returns valid tier (1, 2, or 3)', () => {
    const prng = new PRNG(42)
    for (let i = 0; i < 100; i++) {
      const tier = sampleWealthTier(prng, 0.5)
      expect([1, 2, 3]).toContain(tier)
    }
  })

  test('neutral reputation (0.5) produces base distribution', () => {
    const prng = new PRNG(42)
    const counts: Record<WealthTier, number> = { 1: 0, 2: 0, 3: 0 }
    const N = 10_000
    for (let i = 0; i < N; i++) {
      counts[sampleWealthTier(prng, 0.5)]++
    }
    // Base distribution: 30% / 45% / 25% — allow ±3% tolerance
    expect(counts[1] / N).toBeCloseTo(0.30, 1)
    expect(counts[2] / N).toBeCloseTo(0.45, 1)
    expect(counts[3] / N).toBeCloseTo(0.25, 1)
  })

  test('low reputation (0.0) skews toward tier 1', () => {
    const prng = new PRNG(42)
    const counts: Record<WealthTier, number> = { 1: 0, 2: 0, 3: 0 }
    const N = 10_000
    for (let i = 0; i < N; i++) {
      counts[sampleWealthTier(prng, 0.0)]++
    }
    // At rep 0.0: ~44% / ~44% / ~12%
    expect(counts[1] / N).toBeGreaterThan(0.40)
    expect(counts[3] / N).toBeLessThan(0.16)
  })

  test('high reputation (1.0) skews toward tier 3', () => {
    const prng = new PRNG(42)
    const counts: Record<WealthTier, number> = { 1: 0, 2: 0, 3: 0 }
    const N = 10_000
    for (let i = 0; i < N; i++) {
      counts[sampleWealthTier(prng, 1.0)]++
    }
    // At rep 1.0: ~15% / ~46% / ~39%
    expect(counts[1] / N).toBeLessThan(0.20)
    expect(counts[3] / N).toBeGreaterThan(0.34)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/engine && pnpm test -- --run src/__tests__/wealth-tiers.test.ts`

Expected: FAIL — module `../simulation/wealth-tiers.js` does not exist.

- [ ] **Step 3: Implement wealth-tiers.ts**

Create `packages/engine/src/simulation/wealth-tiers.ts`:

```typescript
import type { WealthTier } from '@bitborough/core'
import type { PRNG } from '../prng.js'

// ── Tier distribution ────────────────────────────────────────────────────────

/** Base probability of each tier for new citizens: [Low, Mid, High]. */
export const TIER_DISTRIBUTION: readonly [number, number, number] = [0.30, 0.45, 0.25]

// ── Tier weight table ────────────────────────────────────────────────────────

export interface TierFactorWeights {
  crime: number
  pollution: number
  park: number
  fire: number
  commute: number
  jobMatch: number
  commerce: number
}

/** Per-tier sensitivity multipliers. Mid (tier 2) is always 1.0 (baseline). */
export const TIER_WEIGHTS: Record<WealthTier, TierFactorWeights> = {
  1: { crime: 0.8, pollution: 0.7, park: 0.5, fire: 0.8, commute: 1.3, jobMatch: 1.2, commerce: 0.9 },
  2: { crime: 1.0, pollution: 1.0, park: 1.0, fire: 1.0, commute: 1.0, jobMatch: 1.0, commerce: 1.0 },
  3: { crime: 1.4, pollution: 1.5, park: 1.3, fire: 1.2, commute: 0.8, jobMatch: 0.9, commerce: 1.1 },
}

// ── Reputation & Schelling constants ─────────────────────────────────────────

export const REPUTATION_DECAY = 0.95
export const SCHELLING_WEIGHT = 0.08
export const HOMOGENEITY_THRESHOLD = 0.25
export const TIER_LABELS: readonly [string, string, string] = ['Low', 'Mid', 'High']

// ── Tier sampling ────────────────────────────────────────────────────────────

/**
 * Sample a wealth tier using probabilities shifted by the local reputation score.
 * At reputation 0.5 (neutral), produces the base distribution (30/45/25).
 * Low reputation skews toward tier 1; high reputation skews toward tier 3.
 */
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

// ── Schelling penalty ────────────────────────────────────────────────────────

/**
 * Compute per-building tier counts from agents for Schelling penalty lookup.
 * Returns a map of buildingId → [tier1Count, tier2Count, tier3Count].
 */
export function buildTierCountsByBuilding(
  agents: ReadonlyArray<{ homeBuildingId: string; wealthTier: WealthTier }>,
): Map<string, [number, number, number]> {
  const map = new Map<string, [number, number, number]>()
  for (const a of agents) {
    let counts = map.get(a.homeBuildingId)
    if (!counts) {
      counts = [0, 0, 0]
      map.set(a.homeBuildingId, counts)
    }
    counts[a.wealthTier - 1]++
  }
  return map
}

/**
 * Compute the Schelling same-tier preference penalty for an agent.
 * Returns 0 when the agent's tier comprises >= HOMOGENEITY_THRESHOLD of building agents.
 */
export function computeSchellingPenalty(
  agentTier: WealthTier,
  buildingTierCounts: [number, number, number],
): number {
  const total = buildingTierCounts[0] + buildingTierCounts[1] + buildingTierCounts[2]
  if (total <= 1) return 0

  const sameTierFraction = buildingTierCounts[agentTier - 1] / total
  if (sameTierFraction >= HOMOGENEITY_THRESHOLD) return 0

  return SCHELLING_WEIGHT * (1 - sameTierFraction / HOMOGENEITY_THRESHOLD)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/engine && pnpm test -- --run src/__tests__/wealth-tiers.test.ts`

Expected: PASS

- [ ] **Step 5: Add Schelling tests**

Append to `packages/engine/src/__tests__/wealth-tiers.test.ts`:

```typescript
describe('computeSchellingPenalty', () => {
  test('returns 0 for single agent in building', () => {
    const penalty = computeSchellingPenalty(1, [1, 0, 0])
    expect(penalty).toBe(0)
  })

  test('returns 0 when same-tier fraction >= threshold', () => {
    // 2 of 4 agents are tier 1 → 50% >= 25% threshold
    const penalty = computeSchellingPenalty(1, [2, 1, 1])
    expect(penalty).toBe(0)
  })

  test('returns positive penalty when minority tier', () => {
    // 1 of 10 agents is tier 1 → 10% < 25% threshold
    const penalty = computeSchellingPenalty(1, [1, 5, 4])
    expect(penalty).toBeGreaterThan(0)
    expect(penalty).toBeLessThanOrEqual(SCHELLING_WEIGHT)
  })

  test('maximum penalty when sole agent of tier in large building', () => {
    // 1 of 20 → 5% same-tier
    const penalty = computeSchellingPenalty(3, [10, 9, 1])
    // (1 - 0.05/0.25) * 0.08 = 0.8 * 0.08 = 0.064
    expect(penalty).toBeCloseTo(0.064, 3)
  })
})

describe('buildTierCountsByBuilding', () => {
  test('groups agents by building', () => {
    const agents = [
      { homeBuildingId: 'b1', wealthTier: 1 as WealthTier },
      { homeBuildingId: 'b1', wealthTier: 2 as WealthTier },
      { homeBuildingId: 'b1', wealthTier: 2 as WealthTier },
      { homeBuildingId: 'b2', wealthTier: 3 as WealthTier },
    ]
    const counts = buildTierCountsByBuilding(agents)
    expect(counts.get('b1')).toEqual([1, 2, 0])
    expect(counts.get('b2')).toEqual([0, 0, 1])
  })
})
```

Add the imports at the top of the file:

```typescript
import {
  computeSchellingPenalty,
  buildTierCountsByBuilding,
} from '../simulation/wealth-tiers.js'
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd packages/engine && pnpm test -- --run src/__tests__/wealth-tiers.test.ts`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add packages/engine/src/simulation/wealth-tiers.ts packages/engine/src/__tests__/wealth-tiers.test.ts
git commit -m "feat: add wealth-tiers constants module with tier sampling and Schelling penalty"
```

---

## Chunk 2: Citizen Model Extension

### Task 3: Add wealthTier to Citizen, update createAgent and summary

**Files:**
- Modify: `packages/engine/src/simulation/citizens.ts`
- Create: `packages/engine/src/__tests__/citizens-tiers.test.ts`

- [ ] **Step 1: Write failing tests for tier on agent and summary aggregation**

Create `packages/engine/src/__tests__/citizens-tiers.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { PRNG } from '../prng.js'
import {
  createRegistry,
  computeCitizenSummary,
  EMPTY_CITIZEN_SUMMARY,
} from '../simulation/citizens.js'
import type { WealthTier } from '@bitborough/core'
import type { Citizen } from '../simulation/citizens.js'

function makeTestAgent(id: string, buildingId: string, tier: WealthTier): Citizen {
  return {
    id,
    homeBuildingId: buildingId,
    workBuildingId: null,
    commerceBuildingId: null,
    homeAccessRoad: 0,
    workAccessRoad: null,
    commerceAccessRoad: null,
    homeWorkRoute: [],
    homeCommerceRoute: [],
    homeWorkRouteTileSet: new Set(),
    homeCommerceRouteTileSet: new Set(),
    homeWorkRouteStale: false,
    homeCommerceRouteStale: false,
    satisfaction: 0.8,
    demographics: { children: 5, working: 40, elderly: 5 },
    wealthTier: tier,
  }
}

describe('Citizen wealthTier', () => {
  test('EMPTY_CITIZEN_SUMMARY has zero tierCounts', () => {
    expect(EMPTY_CITIZEN_SUMMARY.tierCounts).toEqual([0, 0, 0])
  })

  test('computeCitizenSummary aggregates tierCounts', () => {
    const registry = createRegistry()
    registry.agents.push(
      makeTestAgent('c1', 'b1', 1),
      makeTestAgent('c2', 'b1', 2),
      makeTestAgent('c3', 'b1', 2),
      makeTestAgent('c4', 'b2', 3),
    )
    const summary = computeCitizenSummary(registry)
    expect(summary.tierCounts).toEqual([1, 2, 1])
  })

  test('computeCitizenSummary with empty registry returns zero tierCounts', () => {
    const registry = createRegistry()
    const summary = computeCitizenSummary(registry)
    expect(summary.tierCounts).toEqual([0, 0, 0])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/engine && pnpm test -- --run src/__tests__/citizens-tiers.test.ts`

Expected: FAIL — `Citizen` interface has no `wealthTier` field, `EMPTY_CITIZEN_SUMMARY` has no `tierCounts`.

- [ ] **Step 3: Add `wealthTier` to `Citizen` interface and update `EMPTY_CITIZEN_SUMMARY`**

In `packages/engine/src/simulation/citizens.ts`:

Add import of `WealthTier` from `@bitborough/core` (at line 1, add to the existing import).

Add `wealthTier: WealthTier` to the `Citizen` interface (after `demographics` field, around line 29).

Add `tierCounts: [0, 0, 0]` to `EMPTY_CITIZEN_SUMMARY` (after `netMigrationLastTick`, around line 51).

- [ ] **Step 4: Update `createAgent` to accept PRNG and reputation, assign tier**

In `packages/engine/src/simulation/citizens.ts`:

Add import of `sampleWealthTier` from `./wealth-tiers.js`.

Add import of `type PRNG` from `../prng.js`.

Change `createAgent` signature (line ~130) from:

```typescript
function createAgent(map: GameMap, graph: RoadGraph, homeBuildingId: string, homeAccessRoad: number, trafficDensity?: Uint8Array): Citizen {
```

To (new params are optional to avoid breaking callers before Engine integration):

```typescript
function createAgent(map: GameMap, graph: RoadGraph, homeBuildingId: string, homeAccessRoad: number, trafficDensity?: Uint8Array, prng?: PRNG, reputationLayer?: Float32Array): Citizen {
```

Inside `createAgent`, before the `const agent` declaration, compute the tier:

```typescript
  let wealthTier: WealthTier = 2
  if (prng) {
    const building = map.buildings.find(b => b.id === homeBuildingId)
    const tileIdx = building ? building.y * map.width + building.x : 0
    const reputation = reputationLayer ? (reputationLayer[tileIdx] ?? 0.5) : 0.5
    wealthTier = sampleWealthTier(prng, reputation)
  }
```

Add `wealthTier` to the agent object literal (after `demographics`).

- [ ] **Step 5: Update `syncAgentsForBuilding` to accept and pass through PRNG and reputation**

Change `syncAgentsForBuilding` signature (line ~155) from:

```typescript
export function syncAgentsForBuilding(map: GameMap, registry: CitizenRegistry, graph: RoadGraph, building: Building, trafficDensity?: Uint8Array): void {
```

To (new params optional — Engine integration makes them required later):

```typescript
export function syncAgentsForBuilding(map: GameMap, registry: CitizenRegistry, graph: RoadGraph, building: Building, trafficDensity?: Uint8Array, prng?: PRNG, reputationLayer?: Float32Array): void {
```

Update the `createAgent` call inside (line ~165) to pass through `prng` and `reputationLayer`:

```typescript
      registry.agents.push(createAgent(map, graph, building.id, homeAccessRoad, trafficDensity, prng, reputationLayer))
```

- [ ] **Step 6: Update `computeCitizenSummary` to aggregate `tierCounts`**

In `computeCitizenSummary` (line ~296), add tier counting:

After the existing aggregation variables, add:

```typescript
  const tierCounts: [number, number, number] = [0, 0, 0]
```

Inside the agent loop, add:

```typescript
    tierCounts[agent.wealthTier - 1]++
```

Add `tierCounts` to the return object.

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd packages/engine && pnpm test -- --run src/__tests__/citizens-tiers.test.ts`

Expected: PASS

- [ ] **Step 8: Run full test suite to check for regressions**

Run: `cd packages/engine && pnpm test -- --run`

Expected: All tests should pass. The new `prng` and `reputationLayer` params are optional, so existing callers in Engine.ts continue to work without changes. Agents created without `prng` default to `wealthTier: 2`.

- [ ] **Step 9: Commit**

```bash
git add packages/engine/src/simulation/citizens.ts packages/engine/src/__tests__/citizens-tiers.test.ts
git commit -m "feat: add wealthTier to Citizen, tier-aware createAgent and summary"
```

---

## Chunk 3: Reputation Layer

### Task 4: Create reputation module

**Files:**
- Create: `packages/engine/src/simulation/reputation.ts`
- Create: `packages/engine/src/__tests__/reputation.test.ts`

- [ ] **Step 1: Write failing tests for `computeReputation`**

Create `packages/engine/src/__tests__/reputation.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { computeReputation, computeCurrentQuality } from '../simulation/reputation.js'
import { ZoneType } from '@bitborough/core'
import { createTestMap } from '../test-helpers.js'
import { BuildingIndex } from '../building-index.js'

describe('computeCurrentQuality', () => {
  test('perfect conditions produce quality near 1.0', () => {
    const q = computeCurrentQuality(
      0,    // crimeNorm (no crime)
      0,    // pollNorm (no pollution)
      1.0,  // fireNorm (full fire coverage)
      1.0,  // parkNorm (perfect park access)
      1.0,  // occupancyHealth (full occupancy)
    )
    // 1.0*0.35 + 1.0*0.25 + 1.0*0.15 + 1.0*0.15 + 1.0*0.10 = 1.0
    expect(q).toBeCloseTo(1.0)
  })

  test('worst conditions produce quality near 0.0', () => {
    const q = computeCurrentQuality(1.0, 1.0, 0, 0, 0)
    // 0*0.35 + 0*0.25 + 0 + 0 + 0 = 0.0
    expect(q).toBeCloseTo(0.0)
  })

  test('mixed conditions produce intermediate quality', () => {
    const q = computeCurrentQuality(0.5, 0.3, 0.8, 0.0, 0.7)
    // (1-0.5)*0.35 + (1-0.3)*0.25 + 0.8*0.15 + 0.0*0.15 + 0.7*0.10
    // = 0.175 + 0.175 + 0.12 + 0.0 + 0.07 = 0.54
    expect(q).toBeCloseTo(0.54)
  })
})

describe('computeReputation', () => {
  test('reputation decays toward current quality', () => {
    const map = createTestMap(4)
    // Zone a tile so reputation is computed for it
    map.zones[0] = ZoneType.Residential

    const reputationLayer = new Float32Array(16).fill(0.5)
    const crimeLevel = new Uint8Array(16)      // no crime
    const fireCoverage = new Uint8Array(16)     // no fire coverage
    const pollutionLevel = new Uint8Array(16)   // no pollution
    const bldIdx = new BuildingIndex(map)

    // Current quality at tile 0: no fire, no parks, no occupancy
    // = (1-0)*0.35 + (1-0)*0.25 + 0*0.15 + 0*0.15 + 0*0.10 = 0.60
    computeReputation(reputationLayer, map, crimeLevel, fireCoverage, pollutionLevel, bldIdx)

    // After one tick: 0.95 * 0.5 + 0.05 * 0.60 = 0.475 + 0.03 = 0.505
    expect(reputationLayer[0]).toBeCloseTo(0.505, 2)
  })

  test('unzoned tiles are not updated', () => {
    const map = createTestMap(4)
    // Leave all tiles unzoned (ZoneType.None = 0)

    const reputationLayer = new Float32Array(16).fill(0.5)
    const crimeLevel = new Uint8Array(16)
    const fireCoverage = new Uint8Array(16)
    const pollutionLevel = new Uint8Array(16)
    const bldIdx = new BuildingIndex(map)

    computeReputation(reputationLayer, map, crimeLevel, fireCoverage, pollutionLevel, bldIdx)

    // All tiles should remain at 0.5
    expect(reputationLayer[0]).toBe(0.5)
  })

  test('reputation converges over many ticks', () => {
    const map = createTestMap(4)
    map.zones[0] = ZoneType.Residential

    const reputationLayer = new Float32Array(16).fill(0.0) // start low
    const crimeLevel = new Uint8Array(16)      // no crime → high quality
    const fireCoverage = new Uint8Array(16)
    const pollutionLevel = new Uint8Array(16)
    const bldIdx = new BuildingIndex(map)

    // Run 60 ticks (5 game-years)
    for (let i = 0; i < 60; i++) {
      computeReputation(reputationLayer, map, crimeLevel, fireCoverage, pollutionLevel, bldIdx)
    }

    // Should have converged most of the way toward quality (~0.60)
    expect(reputationLayer[0]).toBeGreaterThan(0.5)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/engine && pnpm test -- --run src/__tests__/reputation.test.ts`

Expected: FAIL — module `../simulation/reputation.js` does not exist.

- [ ] **Step 3: Implement reputation.ts**

Create `packages/engine/src/simulation/reputation.ts`:

```typescript
import type { GameMap } from '@bitborough/core'
import { BuildingCategory } from '@bitborough/core'
import type { BuildingIndex } from '../building-index.js'
import { BUILDING_DEFS } from '../buildings-registry.js'
import { REPUTATION_DECAY } from './wealth-tiers.js'
import { parkDesirabilityBonus, RES_PARK_BONUS } from './desirability.js'

const QUALITY_CRIME_WEIGHT = 0.35
const QUALITY_POLLUTION_WEIGHT = 0.25
const QUALITY_FIRE_WEIGHT = 0.15
const QUALITY_PARK_WEIGHT = 0.15
const QUALITY_OCCUPANCY_WEIGHT = 0.10

const OCCUPANCY_SEARCH_RADIUS = 5
const OCCUPANCY_HEALTH_THRESHOLD = 0.7

/**
 * Compute current neighborhood quality for a tile from normalized inputs.
 * All inputs should be 0–1. Returns 0–1.
 */
export function computeCurrentQuality(
  crimeNorm: number,
  pollNorm: number,
  fireNorm: number,
  parkNorm: number,
  occupancyHealth: number,
): number {
  return (
    (1 - crimeNorm) * QUALITY_CRIME_WEIGHT +
    (1 - pollNorm) * QUALITY_POLLUTION_WEIGHT +
    fireNorm * QUALITY_FIRE_WEIGHT +
    parkNorm * QUALITY_PARK_WEIGHT +
    occupancyHealth * QUALITY_OCCUPANCY_WEIGHT
  )
}

function computeOccupancyHealth(x: number, y: number, map: GameMap, bldIdx: BuildingIndex): number {
  let bestHealth = 0
  for (let dy = -OCCUPANCY_SEARCH_RADIUS; dy <= OCCUPANCY_SEARCH_RADIUS; dy++) {
    for (let dx = -OCCUPANCY_SEARCH_RADIUS; dx <= OCCUPANCY_SEARCH_RADIUS; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > OCCUPANCY_SEARCH_RADIUS) continue
      const b = bldIdx.get(x + dx, y + dy)
      if (!b || b.state !== 'active') continue
      const def = BUILDING_DEFS[b.defId]
      if (!def || def.category !== BuildingCategory.Residential || def.capacity === 0) continue
      const health = Math.min(1, b.residents / (def.capacity * OCCUPANCY_HEALTH_THRESHOLD))
      if (health > bestHealth) bestHealth = health
    }
  }
  return bestHealth
}

/** Reuse the exported parkDesirabilityBonus from desirability.ts, normalized to 0-1. */
function computeParkNorm(x: number, y: number, map: GameMap, bldIdx: BuildingIndex): number {
  return Math.min(1, parkDesirabilityBonus(x, y, map, bldIdx) / RES_PARK_BONUS)
}

/**
 * Update the reputation layer in-place using exponential moving average.
 * Skips unzoned tiles. Modifies `reputationLayer` directly.
 */
export function computeReputation(
  reputationLayer: Float32Array,
  map: GameMap,
  crimeLevel: Uint8Array,
  fireCoverage: Uint8Array,
  pollutionLevel: Uint8Array,
  bldIdx: BuildingIndex,
): void {
  const { width, height } = map
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (map.zones[idx] === 0) continue

      const crimeNorm = crimeLevel[idx]! / 255
      const pollNorm = pollutionLevel[idx]! / 255
      const fireNorm = fireCoverage[idx]! / 255
      const parkNorm = computeParkNorm(x, y, map, bldIdx)
      const occupancyHealth = computeOccupancyHealth(x, y, map, bldIdx)

      const quality = computeCurrentQuality(crimeNorm, pollNorm, fireNorm, parkNorm, occupancyHealth)
      reputationLayer[idx] = REPUTATION_DECAY * reputationLayer[idx]! + (1 - REPUTATION_DECAY) * quality
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/engine && pnpm test -- --run src/__tests__/reputation.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/reputation.ts packages/engine/src/__tests__/reputation.test.ts
git commit -m "feat: add reputation layer with exponential decay toward neighborhood quality"
```

---

## Chunk 4: Tier-Weighted Satisfaction

### Task 5: Export park bonus utility and expand computeSatisfaction

**Files:**
- Modify: `packages/engine/src/simulation/desirability.ts`
- Modify: `packages/engine/src/simulation/citizens.ts`
- Modify: `packages/engine/src/__tests__/citizens-tiers.test.ts`

- [ ] **Step 1: Write tests for tier-weighted satisfaction first (TDD: red)**

Append to `packages/engine/src/__tests__/citizens-tiers.test.ts`:

```typescript
import { citizenMonthlyTick, type TileLayers } from '../simulation/citizens.js'
import { createTestMap } from '../test-helpers.js'
import { BuildingIndex } from '../building-index.js'
import { buildRoadGraph } from '../road-graph.js'

function makeLayers(size: number): TileLayers {
  return {
    crimeLevel: new Uint8Array(size),
    fireCoverage: new Uint8Array(size),
    pollutionLevel: new Uint8Array(size),
    reputationLayer: new Float32Array(size).fill(0.5),
  }
}

describe('tier-weighted satisfaction', () => {
  test('high-income agents are more sensitive to crime', () => {
    const map = createTestMap(8)
    const graph = buildRoadGraph(map)
    const size = 64
    const layers = makeLayers(size)
    const trafficDensity = new Uint8Array(size)
    const bldIdx = new BuildingIndex(map)

    const registry = createRegistry()
    const lowAgent = makeTestAgent('c1', 'b1', 1)
    const highAgent = makeTestAgent('c2', 'b1', 3)
    registry.agents.push(lowAgent, highAgent)

    // Add a building to the map so the agents can resolve home tile
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 1, y: 1,
      state: 'active', residents: 100, constructionMonthsLeft: 0,
    } as any)

    // Set high crime at tile (1,1) = index 9
    layers.crimeLevel[9] = 200

    citizenMonthlyTick(registry, map, graph, trafficDensity, layers, bldIdx)

    // High-income agent should have lower satisfaction due to crime sensitivity (1.4 vs 0.8)
    expect(highAgent.satisfaction).toBeLessThan(lowAgent.satisfaction)
  })

  test('low-income agents are more sensitive to commute', () => {
    const map = createTestMap(8)
    const graph = buildRoadGraph(map)
    const size = 64
    const layers = makeLayers(size)
    const trafficDensity = new Uint8Array(size)
    const bldIdx = new BuildingIndex(map)

    const registry = createRegistry()
    const lowAgent = makeTestAgent('c1', 'b1', 1)
    const highAgent = makeTestAgent('c2', 'b1', 3)
    // Give both agents a long commute
    lowAgent.homeWorkRoute = Array.from({ length: 40 }, (_, i) => i)
    highAgent.homeWorkRoute = Array.from({ length: 40 }, (_, i) => i)
    registry.agents.push(lowAgent, highAgent)

    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 1, y: 1,
      state: 'active', residents: 100, constructionMonthsLeft: 0,
    } as any)

    citizenMonthlyTick(registry, map, graph, trafficDensity, layers, bldIdx)

    // Low-income agent should have lower satisfaction due to commute sensitivity (1.3 vs 0.8)
    expect(lowAgent.satisfaction).toBeLessThan(highAgent.satisfaction)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/engine && pnpm test -- --run src/__tests__/citizens-tiers.test.ts`

Expected: FAIL — `TileLayers` not exported, `citizenMonthlyTick` doesn't accept the new params.

- [ ] **Step 3: Export `parkDesirabilityBonus` from desirability.ts**

In `packages/engine/src/simulation/desirability.ts`, change line ~119 from:

```typescript
function parkDesirabilityBonus(x: number, y: number, map: GameMap, bldIdx?: BuildingIndex): number {
```

To:

```typescript
export function parkDesirabilityBonus(x: number, y: number, map: GameMap, bldIdx?: BuildingIndex): number {
```

Also export the `RES_PARK_BONUS` constant (line ~10):

```typescript
export const RES_PARK_BONUS = 0.25
```

- [ ] **Step 4: Create `TileLayers` interface and expand `computeSatisfaction`**

In `packages/engine/src/simulation/citizens.ts`:

Add imports:

```typescript
import { TIER_WEIGHTS, buildTierCountsByBuilding, computeSchellingPenalty } from './wealth-tiers.js'
import { parkDesirabilityBonus, RES_PARK_BONUS } from './desirability.js'
import type { BuildingIndex } from '../building-index.js'
```

Add the `TileLayers` interface after the existing type declarations:

```typescript
export interface TileLayers {
  crimeLevel: Uint8Array
  fireCoverage: Uint8Array
  pollutionLevel: Uint8Array
  reputationLayer: Float32Array
}
```

Replace `computeSatisfaction` (lines ~259-264) with:

```typescript
function computeSatisfaction(
  agent: Citizen,
  map: GameMap,
  layers: TileLayers,
  bldIdx: BuildingIndex,
  buildingTierCounts: Map<string, [number, number, number]>,
  buildingById: Map<string, Building>,
): number {
  const w = TIER_WEIGHTS[agent.wealthTier]

  // Route-based factors
  const commuteNorm = clamp(agent.homeWorkRoute.length / MAX_SATISFACTION_COMMUTE, 0, 1)
  const jobless = agent.workBuildingId === null ? 1 : 0
  const noCommerce = agent.commerceBuildingId === null ? 1 : 0

  // Environment factors — resolve agent's home tile via O(1) lookup
  const building = buildingById.get(agent.homeBuildingId)
  let crimeNorm = 0, pollNorm = 0, fireNorm = 0, parkNorm = 0
  if (building) {
    const idx = building.y * map.width + building.x
    crimeNorm = layers.crimeLevel[idx]! / 255
    pollNorm = layers.pollutionLevel[idx]! / 255
    fireNorm = layers.fireCoverage[idx]! / 255
    const rawPark = parkDesirabilityBonus(building.x, building.y, map, bldIdx)
    parkNorm = Math.min(1, rawPark / RES_PARK_BONUS)
  }

  // Schelling penalty
  const tierCounts = buildingTierCounts.get(agent.homeBuildingId) ?? [0, 0, 0]
  const schelling = computeSchellingPenalty(agent.wealthTier, tierCounts)

  return clamp(
    1.0
    - commuteNorm * 0.4 * w.commute
    - jobless * 0.5 * w.jobMatch
    - noCommerce * 0.3 * w.commerce
    - crimeNorm * 0.3 * w.crime
    - pollNorm * 0.3 * w.pollution
    + fireNorm * 0.15 * w.fire
    + parkNorm * 0.25 * w.park
    - schelling,
    0, 1,
  )
}
```

Note: `buildingById` is a `Map<string, Building>` for O(1) building lookups, pre-computed per tick.

- [ ] **Step 5: Update `citizenMonthlyTick` to accept and pass `TileLayers` and `BuildingIndex`**

Change `citizenMonthlyTick` signature (line ~266). New params are optional so existing callers don't break:

```typescript
export function citizenMonthlyTick(
  registry: CitizenRegistry,
  map: GameMap,
  graph: RoadGraph,
  trafficDensity: Uint8Array,
  layers?: TileLayers,
  bldIdx?: BuildingIndex,
): void {
```

Inside the function, before the agent loop that computes satisfaction (pass 2), add pre-computations:

```typescript
  // Pre-compute for tier-weighted satisfaction
  const buildingTierCounts = buildTierCountsByBuilding(registry.agents)
  const buildingById = new Map<string, Building>()
  for (const b of map.buildings) buildingById.set(b.id, b)
```

Update the satisfaction assignment inside the agent loop. If layers are provided, use the new formula; otherwise fall back to the legacy formula for backward compatibility during the transition:

```typescript
    if (layers && bldIdx) {
      agent.satisfaction = computeSatisfaction(agent, map, layers, bldIdx, buildingTierCounts, buildingById)
    } else {
      // Legacy path — route-based only
      const commuteNorm = clamp(agent.homeWorkRoute.length / MAX_SATISFACTION_COMMUTE, 0, 1)
      const jobless = agent.workBuildingId === null ? 1 : 0
      const noCommerce = agent.commerceBuildingId === null ? 1 : 0
      agent.satisfaction = clamp(1 - commuteNorm * 0.4 - jobless * 0.5 - noCommerce * 0.3, 0, 1)
    }
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd packages/engine && pnpm test -- --run src/__tests__/citizens-tiers.test.ts`

Expected: PASS

- [ ] **Step 7: Run full test suite**

Run: `cd packages/engine && pnpm test -- --run`

Expected: All pass — legacy path handles existing callers.

- [ ] **Step 8: Commit**

```bash
git add packages/engine/src/simulation/desirability.ts packages/engine/src/simulation/citizens.ts packages/engine/src/__tests__/citizens-tiers.test.ts
git commit -m "feat: tier-weighted satisfaction with environment factors and Schelling penalty"
```

---

## Chunk 5: Engine Integration & Save/Load

### Task 6: Wire reputation layer into Engine

**Files:**
- Modify: `packages/engine/src/Engine.ts`

- [ ] **Step 1: Allocate reputation layer in constructor**

In `Engine.ts`, after `this.fireCoverage = new Uint8Array(size)` (line ~140), add:

```typescript
    this.reputationLayer = new Float32Array(size).fill(0.5)
```

Add the private property declaration alongside the other layers (near line ~90-95):

```typescript
  private reputationLayer: Float32Array
```

Add imports at the top of Engine.ts:

```typescript
import { computeReputation } from './simulation/reputation.js'
import type { TileLayers } from './simulation/citizens.js'
```

- [ ] **Step 2: Call `computeReputation` in the monthly tick**

In the monthly tick method, after `updateFires` (line ~192) and before the citizen monthly tick (line ~194), add:

```typescript
      computeReputation(this.reputationLayer, this.map, this.crimeLevel, this.fireCoverage, this.pollutionLevel, this.bldIdx)
```

Note: uses `this.bldIdx` (the instance property rebuilt at line 176), NOT a local variable.

- [ ] **Step 3: Build TileLayers and pass to citizenMonthlyTick**

Before the `citizenMonthlyTick` call, create the layers object:

```typescript
      const tileLayers: TileLayers = {
        crimeLevel: this.crimeLevel,
        fireCoverage: this.fireCoverage,
        pollutionLevel: this.pollutionLevel,
        reputationLayer: this.reputationLayer,
      }
```

Update the `citizenMonthlyTick` call (line ~194) from:

```typescript
      citizenMonthlyTick(this.citizenRegistry, this.map, this.roadGraph, this.trafficDensity)
```

To:

```typescript
      citizenMonthlyTick(this.citizenRegistry, this.map, this.roadGraph, this.trafficDensity, tileLayers, this.bldIdx)
```

- [ ] **Step 4: Update `syncResidentialAgents` to pass PRNG and reputation**

In the `syncResidentialAgents` method (line ~466), update the `syncAgentsForBuilding` call inside the loop from:

```typescript
        syncAgentsForBuilding(this.map, this.citizenRegistry, this.roadGraph, b, this.trafficDensity)
```

To:

```typescript
        syncAgentsForBuilding(this.map, this.citizenRegistry, this.roadGraph, b, this.trafficDensity, this.prng, this.reputationLayer)
```

- [ ] **Step 5: Verify build compiles**

Run: `cd packages/engine && pnpm build`

Expected: Success (or type errors that reveal missed updates — fix them).

- [ ] **Step 6: Commit**

```bash
git add packages/engine/src/Engine.ts
git commit -m "feat: wire reputation layer and TileLayers into Engine monthly tick"
```

---

### Task 7: Save/load v7 migration

**Files:**
- Modify: `packages/engine/src/Engine.ts`
- Modify: `packages/engine/src/__tests__/serialization.test.ts`

- [ ] **Step 1: Write failing test for v7 migration**

In `packages/engine/src/__tests__/serialization.test.ts`, add a test (uses `Engine.create` and `save.state.citizens` path matching codebase conventions):

```typescript
test('v6 save migrates to v7 — agents get wealthTier 2', () => {
  // Create an engine, serialize, then simulate v6 format
  const engine = Engine.create(createTestMap(16), { seed: 42 })
  engine.placeBuilding(0, 0, 'power.diesel')
  for (let x = 2; x < 6; x++) {
    engine.placeTile(x, 2, Infrastructure.Road)
    engine.placeZone(x, 1, ZoneType.Residential)
  }
  advanceYear(engine)

  const save = engine.serialize()

  // Simulate v6 save: remove wealthTier from agents, set version to 6, remove reputationLayer
  const v6Save = {
    ...save,
    version: 6,
    state: {
      ...save.state,
      reputationLayer: undefined,
      citizens: {
        ...save.state.citizens,
        agents: save.state.citizens.agents.map(({ wealthTier, ...rest }: any) => rest),
      },
    },
  }

  const restored = Engine.restore(v6Save as any)
  const reSerialized = restored.serialize()

  // All agents should have wealthTier 2 (migration default)
  for (const agent of reSerialized.state.citizens!.agents) {
    expect(agent.wealthTier).toBe(2)
  }

  // Version should be current
  expect(reSerialized.version).toBe(7)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/engine && pnpm test -- --run src/__tests__/serialization.test.ts`

Expected: FAIL

- [ ] **Step 3: Update serialize to include wealthTier, reputation, and bump version**

In `Engine.ts` `serialize()` method (line ~505):

Change the version number from `6` to `7`.

In the agents serialization (line ~536), add `wealthTier` to each serialized agent:

```typescript
            wealthTier: a.wealthTier,
```

In the `state` block of the serialized save (after the `citizens` block), add the reputation layer:

```typescript
        reputationLayer: Array.from(this.reputationLayer),
```

Also update the `SaveFile` interface in `core/state.ts` to include `reputationLayer?: number[]` in the state block.

- [ ] **Step 4: Update restore to handle v6→v7 migration**

In `Engine.ts` `restore()` method (line ~557):

In the agent restoration loop (line ~625), when reconstructing agent objects, add:

```typescript
          wealthTier: a.wealthTier ?? 2,
```

After restoring the citizen registry, restore the reputation layer:

```typescript
    if (save.state.reputationLayer) {
      engine.reputationLayer = new Float32Array(save.state.reputationLayer)
    } else {
      engine.reputationLayer.fill(0.5)
    }
```

This preserves accumulated reputation across save/load cycles. V6 saves without reputation data default to 0.5.

- [ ] **Step 5: Run tests**

Run: `cd packages/engine && pnpm test -- --run src/__tests__/serialization.test.ts`

Expected: PASS

- [ ] **Step 6: Run full test suite**

Run: `cd packages/engine && pnpm test -- --run`

Expected: All tests PASS. If any tests fail due to the changed `citizenMonthlyTick` or `syncAgentsForBuilding` signatures, update those call sites to pass the new parameters.

- [ ] **Step 7: Commit**

```bash
git add packages/engine/src/Engine.ts packages/engine/src/__tests__/serialization.test.ts
git commit -m "feat: save/load v7 — persist wealthTier, migrate v6 saves"
```

---

## Chunk 6: Full Integration Verification

### Task 8: Integration test and final fixes

**Files:**
- Create: `packages/engine/src/__tests__/wealth-tiers-integration.test.ts`

- [ ] **Step 1: Write integration test**

Create `packages/engine/src/__tests__/wealth-tiers-integration.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceMonth, advanceYear } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'

describe('wealth tiers integration', () => {
  test('engine runs multiple months without error and produces tier counts', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })

    // Place infrastructure for a small city
    engine.placeBuilding(2, 2, 'power.diesel')
    for (let x = 4; x < 8; x++) {
      engine.placeTile(x, 3, Infrastructure.Road)
      engine.placeZone(x, 2, ZoneType.Residential)
      engine.placeTile(x, 1, Infrastructure.PowerLine)
    }
    engine.placeZone(4, 4, ZoneType.Industrial)
    engine.placeZone(5, 4, ZoneType.Industrial)
    engine.placeZone(6, 4, ZoneType.Commercial)

    // Run 2 game-years
    advanceYear(engine)
    advanceYear(engine)

    const state = engine.getState()
    const summary = state.citizens

    // Should have some population and tier distribution
    if (summary.agentCount > 0) {
      const [low, mid, high] = summary.tierCounts
      expect(low + mid + high).toBe(summary.agentCount)
    }
  })

  test('serialize/restore round-trip preserves wealth tiers', () => {
    const engine = Engine.create(createTestMap(16), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.diesel')
    for (let x = 2; x < 6; x++) {
      engine.placeTile(x, 2, Infrastructure.Road)
      engine.placeZone(x, 1, ZoneType.Residential)
    }

    // Run enough to get agents
    advanceYear(engine)

    const save = engine.serialize()
    const restored = Engine.restore(save)
    const restoredSave = restored.serialize()

    // Agent wealth tiers should be preserved
    expect(restoredSave.state.citizens!.agents.length).toBe(save.state.citizens!.agents.length)
    for (let i = 0; i < save.state.citizens!.agents.length; i++) {
      expect(restoredSave.state.citizens!.agents[i].wealthTier).toBe(save.state.citizens!.agents[i].wealthTier)
    }
  })

  test('reputation layer is preserved across save/restore', () => {
    const engine = Engine.create(createTestMap(16), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.diesel')
    for (let x = 2; x < 6; x++) {
      engine.placeTile(x, 2, Infrastructure.Road)
      engine.placeZone(x, 1, ZoneType.Residential)
    }

    advanceYear(engine)

    const save = engine.serialize()
    // Reputation layer should be in the save
    expect(save.state.reputationLayer).toBeDefined()
    expect(save.state.reputationLayer!.length).toBe(16 * 16)

    const restored = Engine.restore(save)
    const reSave = restored.serialize()
    // Reputation values should be preserved (not reset to 0.5)
    expect(reSave.state.reputationLayer!).toEqual(save.state.reputationLayer!)
  })
})
```

- [ ] **Step 2: Run integration tests**

Run: `cd packages/engine && pnpm test -- --run src/__tests__/wealth-tiers-integration.test.ts`

Expected: PASS. If any tests fail, debug and fix — these tests exercise the full Engine tick path with wealth tiers active.

- [ ] **Step 3: Run complete test suite**

Run: `cd packages/engine && pnpm test -- --run`

Expected: All tests PASS.

- [ ] **Step 4: Run linting**

Run: `cd packages/engine && pnpm lint`

Expected: No errors. Fix any lint issues.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/__tests__/wealth-tiers-integration.test.ts
git commit -m "test: wealth tiers integration tests — full engine tick and save/restore"
```

- [ ] **Step 6: Final full-suite verification**

Run from the repo root:

```bash
pnpm test -- --run
pnpm lint
pnpm build
```

Expected: All pass across all packages. Fix any issues.

- [ ] **Step 7: Final commit if any fixes needed**

```bash
git add -u
git commit -m "fix: resolve integration issues from wealth tiers feature"
```
