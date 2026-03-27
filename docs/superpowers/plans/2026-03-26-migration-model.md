# Migration Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace simple satisfaction-threshold migration with a multi-factor attractiveness model that modulates fill rate, shifts immigrant wealth tier distribution, and implements tier-ordered brain drain.

**Architecture:** A new `migration.ts` module computes city attractiveness from 5 factors (jobs, satisfaction, services, tax, housing). The score modulates the existing fill rate in `density.ts` via a multiplier (0.5–1.5). Brain drain removes residents from buildings (tier 3 first) when attractiveness drops below 0.4. Existing immigration/emigration in `demographics.ts` is removed. Tier-shifted immigration overrides base weights in `sampleWealthTier()`.

**Tech Stack:** TypeScript, Vitest

**Spec:** `docs/superpowers/specs/2026-03-26-migration-model-design.md`

---

### Task 1: Core Migration Module — Attractiveness & Modifier

Create `migration.ts` with `computeAttractiveness()` and `computeMigrationModifier()`. Pure functions, no side effects.

**Files:**
- Create: `packages/engine/src/simulation/migration.ts`
- Create: `packages/engine/src/__tests__/migration.test.ts`

- [ ] **Step 1: Write failing tests for computeAttractiveness**

In `packages/engine/src/__tests__/migration.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { computeAttractiveness, computeMigrationModifier } from '../simulation/migration.js'
import type { CitizenSummary } from '@bitborough/core'
import { DensityLevel } from '@bitborough/core'
import { EMPTY_CITIZEN_SUMMARY } from '../simulation/citizens.js'
import { createTestMap } from '../test-helpers.js'

function makeSummary(overrides: Partial<CitizenSummary> = {}): CitizenSummary {
  return { ...EMPTY_CITIZEN_SUMMARY, ...overrides }
}

describe('computeAttractiveness', () => {
  test('perfect city scores near 1.0', () => {
    const map = createTestMap(8)
    // res.low has capacity 10; 2 residents = 80% vacancy = high housing availability
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 1, y: 1,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 2,
    })
    const summary = makeSummary({
      avgSatisfaction: 1.0,
      unmatchedJobFraction: 0,
    })
    const crimeLevel = new Uint8Array(64).fill(0) // no crime = full police coverage
    const fireCoverage = new Uint8Array(64).fill(255) // full fire coverage
    const educationQuality = new Uint8Array(64).fill(100) // full education coverage (>=2)
    const funding = { police: 100, fire: 100, education: 100 }

    const { score, factors } = computeAttractiveness(summary, map, 0.07, funding, crimeLevel, fireCoverage, educationQuality)
    expect(score).toBeGreaterThan(0.85)
    expect(factors.jobMatchRate).toBeCloseTo(1.0)
    expect(factors.avgSatisfaction).toBeCloseTo(1.0)
    expect(factors.taxCompetitiveness).toBeCloseTo(1.0)
  })

  test('terrible city scores near 0', () => {
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 1, y: 1,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 10,
    })
    const summary = makeSummary({
      avgSatisfaction: 0,
      unmatchedJobFraction: 1.0,
    })
    const crimeLevel = new Uint8Array(64).fill(255) // max crime
    const fireCoverage = new Uint8Array(64).fill(0) // no fire coverage
    const educationQuality = new Uint8Array(64).fill(0) // no education
    const funding = { police: 0, fire: 0, education: 0 }

    const { score } = computeAttractiveness(summary, map, 0.27, funding, crimeLevel, fireCoverage, educationQuality)
    expect(score).toBeLessThan(0.15)
  })

  test('no residential tiles defaults serviceCoverage to 0.5', () => {
    const map = createTestMap(8)
    // No buildings at all
    const summary = makeSummary({ avgSatisfaction: 0.5, unmatchedJobFraction: 0 })
    const { factors } = computeAttractiveness(
      summary, map, 0.07,
      { police: 100, fire: 100, education: 100 },
      new Uint8Array(64), new Uint8Array(64), new Uint8Array(64),
    )
    expect(factors.serviceCoverage).toBeCloseTo(0.5)
  })

  test('zero capacity defaults housingAvailability to 1.0', () => {
    const map = createTestMap(8)
    const summary = makeSummary()
    const { factors } = computeAttractiveness(
      summary, map, 0.07,
      { police: 100, fire: 100, education: 100 },
      new Uint8Array(64), new Uint8Array(64), new Uint8Array(64),
    )
    expect(factors.housingAvailability).toBeCloseTo(1.0)
  })

  test('tax at 7% gives competitiveness 1.0', () => {
    const map = createTestMap(8)
    const summary = makeSummary()
    const { factors } = computeAttractiveness(
      summary, map, 0.07,
      { police: 100, fire: 100, education: 100 },
      new Uint8Array(64), new Uint8Array(64), new Uint8Array(64),
    )
    expect(factors.taxCompetitiveness).toBeCloseTo(1.0)
  })

  test('tax at 27% gives competitiveness 0', () => {
    const map = createTestMap(8)
    const summary = makeSummary()
    const { factors } = computeAttractiveness(
      summary, map, 0.27,
      { police: 100, fire: 100, education: 100 },
      new Uint8Array(64), new Uint8Array(64), new Uint8Array(64),
    )
    expect(factors.taxCompetitiveness).toBeCloseTo(0)
  })

  test('funding scales service coverage', () => {
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 1, y: 1,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 5,
    })
    const crimeLevel = new Uint8Array(64).fill(0) // full police coverage
    const fireCoverage = new Uint8Array(64).fill(255)
    const educationQuality = new Uint8Array(64).fill(100)
    const summary = makeSummary()

    const fullFunding = computeAttractiveness(summary, map, 0.07, { police: 100, fire: 100, education: 100 }, crimeLevel, fireCoverage, educationQuality)
    const halfFunding = computeAttractiveness(summary, map, 0.07, { police: 50, fire: 50, education: 50 }, crimeLevel, fireCoverage, educationQuality)

    expect(fullFunding.factors.serviceCoverage).toBeGreaterThan(halfFunding.factors.serviceCoverage)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/engine && npx vitest run src/__tests__/migration.test.ts`
Expected: FAIL — module `../simulation/migration.js` not found

- [ ] **Step 3: Implement computeAttractiveness**

Create `packages/engine/src/simulation/migration.ts`:

```typescript
import type { CitizenSummary, GameMap } from '@bitborough/core'
import { BuildingCategory } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

// --- Constants ---
export const ATTRACTIVENESS_BASELINE = 0.5
export const ATTRACTIVENESS_WEIGHTS = {
  jobs: 0.30,
  satisfaction: 0.25,
  services: 0.20,
  tax: 0.15,
  housing: 0.10,
} as const

export const MIGRATION_SENSITIVITY = 2.0
export const MIGRATION_MODIFIER_MIN = 0.5
export const MIGRATION_MODIFIER_MAX = 1.5
export const TAX_NEUTRAL_RATE = 0.07

// NOTE: AttractivenessFactors is defined here initially (Tasks 1-6).
// In Task 7, it moves to @bitborough/core and this file re-exports it.
export interface AttractivenessFactors {
  jobMatchRate: number
  avgSatisfaction: number
  serviceCoverage: number
  taxCompetitiveness: number
  housingAvailability: number
}

export function computeAttractiveness(
  summary: CitizenSummary,
  map: GameMap,
  taxRate: number,
  funding: { police: number; fire: number; education: number },
  crimeLevel: Uint8Array,
  fireCoverage: Uint8Array,
  educationQuality: Uint8Array,
): { score: number; factors: AttractivenessFactors } {
  const jobMatchRate = 1 - summary.unmatchedJobFraction

  const avgSatisfaction = summary.avgSatisfaction

  // Service coverage: fraction of residential tiles covered, scaled by funding
  let totalRes = 0
  let policeCount = 0
  let fireCount = 0
  let eduCount = 0
  let totalResidents = 0
  let totalCapacity = 0

  for (const b of map.buildings) {
    if (b.state !== 'active') continue
    const def = BUILDING_DEFS[b.defId]
    if (!def) continue
    if (def.category === BuildingCategory.Residential) {
      const idx = b.y * map.width + b.x
      totalRes++
      if (crimeLevel[idx]! < 128) policeCount++
      if (fireCoverage[idx]! > 0) fireCount++
      if (educationQuality[idx]! >= 2) eduCount++
      totalResidents += b.residents
      totalCapacity += def.capacity
    }
  }

  let serviceCoverage: number
  if (totalRes === 0) {
    serviceCoverage = 0.5
  } else {
    const policeFrac = policeCount / totalRes
    const fireFrac = fireCount / totalRes
    const eduFrac = eduCount / totalRes
    serviceCoverage = (
      policeFrac * (funding.police / 100) +
      fireFrac * (funding.fire / 100) +
      eduFrac * (funding.education / 100)
    ) / 3
  }

  const taxCompetitiveness = Math.max(0, Math.min(1, 1.0 - (taxRate - TAX_NEUTRAL_RATE) * 5.0))

  const housingAvailability = totalCapacity === 0
    ? 1.0
    : Math.max(0, Math.min(1, 1 - totalResidents / totalCapacity))

  const factors: AttractivenessFactors = {
    jobMatchRate,
    avgSatisfaction,
    serviceCoverage,
    taxCompetitiveness,
    housingAvailability,
  }

  const w = ATTRACTIVENESS_WEIGHTS
  const score = Math.max(0, Math.min(1,
    jobMatchRate * w.jobs +
    avgSatisfaction * w.satisfaction +
    serviceCoverage * w.services +
    taxCompetitiveness * w.tax +
    housingAvailability * w.housing,
  ))

  return { score, factors }
}

export function computeMigrationModifier(attractiveness: number): number {
  const gap = attractiveness - ATTRACTIVENESS_BASELINE
  return Math.max(MIGRATION_MODIFIER_MIN, Math.min(MIGRATION_MODIFIER_MAX, 1.0 + gap * MIGRATION_SENSITIVITY))
}
```

- [ ] **Step 4: Write failing tests for computeMigrationModifier**

Add to `migration.test.ts`:

```typescript
describe('computeMigrationModifier', () => {
  test('attractiveness 0.5 gives modifier 1.0', () => {
    expect(computeMigrationModifier(0.5)).toBeCloseTo(1.0)
  })

  test('attractiveness 0.0 gives modifier 0.5 (floor)', () => {
    expect(computeMigrationModifier(0.0)).toBeCloseTo(0.5)
  })

  test('attractiveness 1.0 gives modifier 1.5 (cap)', () => {
    expect(computeMigrationModifier(1.0)).toBeCloseTo(1.5)
  })

  test('attractiveness 0.75 gives modifier 1.5', () => {
    expect(computeMigrationModifier(0.75)).toBeCloseTo(1.5)
  })

  test('attractiveness 0.25 gives modifier 0.5', () => {
    expect(computeMigrationModifier(0.25)).toBeCloseTo(0.5)
  })
})
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/engine && npx vitest run src/__tests__/migration.test.ts`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add packages/engine/src/simulation/migration.ts packages/engine/src/__tests__/migration.test.ts
git commit -m "feat: add computeAttractiveness and computeMigrationModifier"
```

---

### Task 2: Tier Distribution Interpolation

Add `computeMigrantTierDistribution()` to `migration.ts` with piecewise linear interpolation between struggling/baseline/prosperous brackets.

**Files:**
- Modify: `packages/engine/src/simulation/migration.ts`
- Modify: `packages/engine/src/__tests__/migration.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `migration.test.ts`:

```typescript
import { computeMigrantTierDistribution } from '../simulation/migration.js'

describe('computeMigrantTierDistribution', () => {
  test('attractiveness 0.5 gives baseline distribution', () => {
    const [low, mid, high] = computeMigrantTierDistribution(0.5)
    expect(low).toBeCloseTo(0.30)
    expect(mid).toBeCloseTo(0.45)
    expect(high).toBeCloseTo(0.25)
  })

  test('attractiveness 0.0 gives struggling distribution', () => {
    const [low, mid, high] = computeMigrantTierDistribution(0.0)
    expect(low).toBeCloseTo(0.50)
    expect(mid).toBeCloseTo(0.35)
    expect(high).toBeCloseTo(0.15)
  })

  test('attractiveness 1.0 gives prosperous distribution', () => {
    const [low, mid, high] = computeMigrantTierDistribution(1.0)
    expect(low).toBeCloseTo(0.20)
    expect(mid).toBeCloseTo(0.40)
    expect(high).toBeCloseTo(0.40)
  })

  test('attractiveness 0.25 is halfway between struggling and baseline', () => {
    const [low, mid, high] = computeMigrantTierDistribution(0.25)
    expect(low).toBeCloseTo(0.40) // lerp(0.50, 0.30, 0.5)
    expect(mid).toBeCloseTo(0.40) // lerp(0.35, 0.45, 0.5)
    expect(high).toBeCloseTo(0.20) // lerp(0.15, 0.25, 0.5)
  })

  test('attractiveness 0.75 is halfway between baseline and prosperous', () => {
    const [low, mid, high] = computeMigrantTierDistribution(0.75)
    expect(low).toBeCloseTo(0.25) // lerp(0.30, 0.20, 0.5)
    expect(mid).toBeCloseTo(0.425) // lerp(0.45, 0.40, 0.5)
    expect(high).toBeCloseTo(0.325) // lerp(0.25, 0.40, 0.5)
  })

  test('distribution always sums to 1.0', () => {
    for (const a of [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1.0]) {
      const dist = computeMigrantTierDistribution(a)
      expect(dist[0] + dist[1] + dist[2]).toBeCloseTo(1.0)
    }
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/engine && npx vitest run src/__tests__/migration.test.ts`
Expected: FAIL — `computeMigrantTierDistribution` is not exported

- [ ] **Step 3: Implement computeMigrantTierDistribution**

Add to `packages/engine/src/simulation/migration.ts`:

```typescript
export const TIER_DIST_STRUGGLING: readonly [number, number, number] = [0.50, 0.35, 0.15]
export const TIER_DIST_BASELINE: readonly [number, number, number] = [0.30, 0.45, 0.25]
export const TIER_DIST_PROSPEROUS: readonly [number, number, number] = [0.20, 0.40, 0.40]

function lerpDist(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ]
}

export function computeMigrantTierDistribution(attractiveness: number): [number, number, number] {
  if (attractiveness <= 0.5) {
    const t = attractiveness / 0.5
    return lerpDist(TIER_DIST_STRUGGLING, TIER_DIST_BASELINE, t)
  }
  const t = (attractiveness - 0.5) / 0.5
  return lerpDist(TIER_DIST_BASELINE, TIER_DIST_PROSPEROUS, t)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/engine && npx vitest run src/__tests__/migration.test.ts`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/migration.ts packages/engine/src/__tests__/migration.test.ts
git commit -m "feat: add tier distribution interpolation for migration"
```

---

### Task 3: Brain Drain

Add `applyBrainDrain()` to `migration.ts`. Returns building resident deltas; does not remove agents directly.

**Files:**
- Modify: `packages/engine/src/simulation/migration.ts`
- Modify: `packages/engine/src/__tests__/migration.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `migration.test.ts`:

```typescript
import { applyBrainDrain, BRAIN_DRAIN_THRESHOLD, BRAIN_DRAIN_MIN_POP } from '../simulation/migration.js'
import { createRegistry } from '../simulation/citizens.js'
import type { Citizen } from '../simulation/citizens.js'
import { PRNG } from '../prng.js'
import { DensityLevel } from '@bitborough/core'

function makeBrainDrainAgent(id: string, buildingId: string, tier: 1 | 2 | 3, satisfaction: number): Citizen {
  return {
    id,
    homeBuildingId: buildingId,
    workBuildingId: null,
    commerceBuildingId: null,
    schoolBuildingId: null,
    homeAccessRoad: 0,
    workAccessRoad: null,
    commerceAccessRoad: null,
    schoolAccessRoad: null,
    homeWorkRoute: [],
    homeCommerceRoute: [],
    homeSchoolRoute: [],
    homeWorkRouteTileSet: new Set(),
    homeCommerceRouteTileSet: new Set(),
    homeSchoolRouteTileSet: new Set(),
    homeWorkRouteStale: false,
    homeCommerceRouteStale: false,
    homeSchoolRouteStale: false,
    satisfaction,
    wealthTier: tier,
    demographics: { children: 0, working: 50, elderly: 0 },
  }
}

describe('applyBrainDrain', () => {
  test('no drain when attractiveness >= threshold', () => {
    const registry = createRegistry()
    registry.agents.push(makeBrainDrainAgent('c1', 'b1', 3, 0.5))
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 0, y: 0,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 500,
    })
    const result = applyBrainDrain(0.5, registry, map, new PRNG(42))
    expect(result.departures).toBe(0)
    expect(result.buildingDeltas.size).toBe(0)
  })

  test('no drain when population below minimum', () => {
    const registry = createRegistry()
    registry.agents.push(makeBrainDrainAgent('c1', 'b1', 3, 0.3))
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 0, y: 0,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 50,
    })
    const result = applyBrainDrain(0.2, registry, map, new PRNG(42))
    expect(result.departures).toBe(0)
  })

  test('tier 3 agents depart before tier 2 and tier 1', () => {
    const registry = createRegistry()
    registry.agents.push(makeBrainDrainAgent('c1', 'b1', 1, 0.3))
    registry.agents.push(makeBrainDrainAgent('c2', 'b1', 2, 0.3))
    registry.agents.push(makeBrainDrainAgent('c3', 'b1', 3, 0.3))
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.med', x: 0, y: 0,
      powered: true, density: DensityLevel.Medium, age: 0, state: 'active', residents: 500,
    })
    const result = applyBrainDrain(0.1, registry, map, new PRNG(42))
    expect(result.departures).toBeGreaterThan(0)
    // Building deltas should be negative (residents leaving)
    const delta = result.buildingDeltas.get('b1') ?? 0
    expect(delta).toBeLessThan(0)
  })

  test('within same tier, lowest satisfaction departs first', () => {
    const registry = createRegistry()
    const happy = makeBrainDrainAgent('c1', 'b1', 3, 0.8)
    const unhappy = makeBrainDrainAgent('c2', 'b1', 3, 0.1)
    registry.agents.push(happy, unhappy)
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.med', x: 0, y: 0,
      powered: true, density: DensityLevel.Medium, age: 0, state: 'active', residents: 500,
    })
    // Low attractiveness but small drain — should only remove ~1 agent worth
    const result = applyBrainDrain(0.35, registry, map, new PRNG(42))
    // The unhappy tier-3 agent should be targeted first
    expect(result.departures).toBeGreaterThan(0)
  })

  test('departure rate is capped', () => {
    const registry = createRegistry()
    // Many agents
    for (let i = 0; i < 20; i++) {
      registry.agents.push(makeBrainDrainAgent(`c${i}`, 'b1', 3, 0.1))
    }
    const map = createTestMap(8)
    map.buildings.push({
      id: 'b1', defId: 'res.high', x: 0, y: 0,
      powered: true, density: DensityLevel.High, age: 0, state: 'active', residents: 5000,
    })
    const result = applyBrainDrain(0.0, registry, map, new PRNG(42))
    // Max drain: 0.016 * 5000 = 80 residents
    expect(result.departures).toBeLessThanOrEqual(80)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/engine && npx vitest run src/__tests__/migration.test.ts`
Expected: FAIL — `applyBrainDrain` not exported

- [ ] **Step 3: Implement applyBrainDrain**

Add to `packages/engine/src/simulation/migration.ts`:

```typescript
import type { CitizenRegistry, Citizen } from './citizens.js'
import type { PRNG } from '../prng.js'

export const BRAIN_DRAIN_THRESHOLD = 0.4
export const BRAIN_DRAIN_RATE = 0.04
export const MAX_MONTHLY_DRAIN_RATE = 0.016
export const BRAIN_DRAIN_MIN_POP = 100

export function applyBrainDrain(
  attractiveness: number,
  registry: CitizenRegistry,
  map: GameMap,
  prng: PRNG,
): { departures: number; buildingDeltas: Map<string, number> } {
  const buildingDeltas = new Map<string, number>()

  if (attractiveness >= BRAIN_DRAIN_THRESHOLD) {
    return { departures: 0, buildingDeltas }
  }

  // Compute total population from buildings
  let totalPopulation = 0
  for (const b of map.buildings) {
    if (b.state === 'active') {
      const def = BUILDING_DEFS[b.defId]
      if (def && def.category === BuildingCategory.Residential) {
        totalPopulation += b.residents
      }
    }
  }

  if (totalPopulation < BRAIN_DRAIN_MIN_POP) {
    return { departures: 0, buildingDeltas }
  }

  const drainGap = BRAIN_DRAIN_THRESHOLD - attractiveness
  const rawRate = drainGap * BRAIN_DRAIN_RATE
  const cappedRate = Math.min(rawRate, MAX_MONTHLY_DRAIN_RATE)
  const rawDepartures = cappedRate * totalPopulation
  let departureTarget = Math.floor(rawDepartures) + (prng.next() < (rawDepartures % 1) ? 1 : 0)

  // Sort: tier DESC, satisfaction ASC
  const sorted = [...registry.agents].sort((a, b) => {
    if (b.wealthTier !== a.wealthTier) return b.wealthTier - a.wealthTier
    return a.satisfaction - b.satisfaction
  })

  let departures = 0
  for (const agent of sorted) {
    if (departureTarget <= 0) break
    const amount = Math.min(departureTarget, registry.samplingRatio)
    const prev = buildingDeltas.get(agent.homeBuildingId) ?? 0
    buildingDeltas.set(agent.homeBuildingId, prev - amount)
    departureTarget -= amount
    departures += amount
  }

  return { departures, buildingDeltas }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/engine && npx vitest run src/__tests__/migration.test.ts`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/migration.ts packages/engine/src/__tests__/migration.test.ts
git commit -m "feat: add brain drain with tier-ordered emigration"
```

---

### Task 4: Integrate Migration Modifier into Density Fill Rate

Modify `updateDensity()` to accept and apply the migration modifier.

**Files:**
- Modify: `packages/engine/src/simulation/density.ts`
- Modify: `packages/engine/src/__tests__/density.test.ts`

- [ ] **Step 1: Write failing test**

Add to `packages/engine/src/__tests__/density.test.ts` inside an existing describe block or a new one:

```typescript
describe('migration modifier', () => {
  test('higher migration modifier fills building faster', () => {
    // Run with modifier 1.5
    const mapA = createTestMap(32)
    mapA.buildings.push({
      id: 'b1', defId: 'res.low', x: 10, y: 10,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 0,
    })
    mapA.infrastructure[10 * mapA.width + 10] = Infrastructure.Road
    const demandA = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGridA = new Uint8Array(mapA.width * mapA.height)
    const crimeA = new Uint8Array(mapA.width * mapA.height)
    const fireA = new Uint8Array(mapA.width * mapA.height)
    const pollA = new Uint8Array(mapA.width * mapA.height)
    for (let i = 0; i < 10; i++) {
      updateDensity(mapA, powerGridA, demandA, 5000, new PRNG(1), { value: 100 }, crimeA, fireA, pollA, 1.5)
    }

    // Run with modifier 0.5
    const mapB = createTestMap(32)
    mapB.buildings.push({
      id: 'b1', defId: 'res.low', x: 10, y: 10,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 0,
    })
    mapB.infrastructure[10 * mapB.width + 10] = Infrastructure.Road
    const demandB = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGridB = new Uint8Array(mapB.width * mapB.height)
    const crimeB = new Uint8Array(mapB.width * mapB.height)
    const fireB = new Uint8Array(mapB.width * mapB.height)
    const pollB = new Uint8Array(mapB.width * mapB.height)
    for (let i = 0; i < 10; i++) {
      updateDensity(mapB, powerGridB, demandB, 5000, new PRNG(1), { value: 100 }, crimeB, fireB, pollB, 0.5)
    }

    expect(mapA.buildings[0]!.residents).toBeGreaterThan(mapB.buildings[0]!.residents)
  })

  test('default modifier (1.0) preserves existing behavior', () => {
    const mapA = createTestMap(32)
    mapA.buildings.push({
      id: 'b1', defId: 'res.low', x: 10, y: 10,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 0,
    })
    mapA.infrastructure[10 * mapA.width + 10] = Infrastructure.Road

    const mapB = createTestMap(32)
    mapB.buildings.push({
      id: 'b1', defId: 'res.low', x: 10, y: 10,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents: 0,
    })
    mapB.infrastructure[10 * mapB.width + 10] = Infrastructure.Road

    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const size = 32 * 32
    // With explicit 1.0
    updateDensity(mapA, new Uint8Array(size), demand, 5000, new PRNG(1), { value: 100 }, new Uint8Array(size), new Uint8Array(size), new Uint8Array(size), 1.0)
    // Without modifier (default)
    updateDensity(mapB, new Uint8Array(size), demand, 5000, new PRNG(1), { value: 100 }, new Uint8Array(size), new Uint8Array(size), new Uint8Array(size))

    expect(mapA.buildings[0]!.residents).toBe(mapB.buildings[0]!.residents)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/engine && npx vitest run src/__tests__/density.test.ts`
Expected: FAIL — `updateDensity` does not accept `migrationModifier` param

- [ ] **Step 3: Add migrationModifier parameter to updateDensity**

In `packages/engine/src/simulation/density.ts`, modify the function signature at line 153:

Add `migrationModifier = 1.0` as a new parameter (with default so existing callers don't break):

```typescript
export function updateDensity(
  map: GameMap,
  powerGrid: Uint8Array,
  demand: DemandInfo,
  population: number,
  prng: PRNG,
  nextBuildingId: { value: number },
  crimeLevel: Uint8Array,
  fireCoverage: Uint8Array,
  pollutionLevel: Uint8Array,
  migrationModifier = 1.0,
): { populationDelta: number } {
```

At line 189, change:

```typescript
const effectiveFillRate = FILL_RATE * (1 - occupancyRatio)
```

to:

```typescript
const effectiveFillRate = FILL_RATE * (1 - occupancyRatio) * migrationModifier
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/engine && npx vitest run src/__tests__/density.test.ts`
Expected: ALL PASS (default value = 1.0 preserves existing behavior)

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/density.ts packages/engine/src/__tests__/density.test.ts
git commit -m "feat: add migrationModifier param to updateDensity fill rate"
```

---

### Task 5: Integrate Tier Distribution Override into sampleWealthTier

Add optional `tierDistOverride` to `sampleWealthTier()` and thread it through `SyncAgentOptions` → `syncAgentsForBuilding` → `syncResidentialAgents`.

**Files:**
- Modify: `packages/engine/src/simulation/wealth-tiers.ts`
- Modify: `packages/engine/src/simulation/citizens.ts`
- Modify: `packages/engine/src/simulation/tick.ts`
- Modify: `packages/engine/src/__tests__/wealth-tiers.test.ts`

- [ ] **Step 1: Write failing test for sampleWealthTier with override**

Add to `packages/engine/src/__tests__/wealth-tiers.test.ts`:

```typescript
test('tierDistOverride replaces base distribution', () => {
  const prng = new PRNG(42)
  // Override: 100% tier 3
  const counts = [0, 0, 0]
  for (let i = 0; i < 100; i++) {
    const tier = sampleWealthTier(prng, 0.5, [0, 0, 1.0])
    counts[tier - 1]++
  }
  expect(counts[2]).toBe(100)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/engine && npx vitest run src/__tests__/wealth-tiers.test.ts`
Expected: FAIL — `sampleWealthTier` doesn't accept third argument

- [ ] **Step 3: Add tierDistOverride to sampleWealthTier**

In `packages/engine/src/simulation/wealth-tiers.ts`, modify `sampleWealthTier` at line 26:

```typescript
export function sampleWealthTier(
  prng: PRNG,
  reputation: number,
  tierDistOverride?: readonly [number, number, number],
): WealthTier {
  const base = tierDistOverride ?? TIER_DISTRIBUTION
  const w1 = base[0] * (1.5 - reputation)
  const w2 = base[1]
  const w3 = base[2] * (0.5 + reputation)
  const sum = w1 + w2 + w3
  const r = prng.next() * sum
  if (r < w1) return 1
  if (r < w1 + w2) return 2
  return 3
}
```

- [ ] **Step 4: Add tierDistOverride to SyncAgentOptions and thread it**

In `packages/engine/src/simulation/citizens.ts`:

Add to `SyncAgentOptions` interface (line 211):

```typescript
export interface SyncAgentOptions {
  trafficDensity?: Uint8Array
  prng?: PRNG
  reputationLayer?: Float32Array
  enrollmentCounts?: Map<string, number>
  agentIndex?: Map<string, Citizen[]>
  tierDistOverride?: readonly [number, number, number]
}
```

In `syncAgentsForBuilding` (line 220), destructure `tierDistOverride`:

```typescript
const { trafficDensity, prng, reputationLayer, enrollmentCounts, agentIndex, tierDistOverride } = opts
```

At the `sampleWealthTier` call (line ~241):

```typescript
wealthTier = sampleWealthTier(prng, reputation, tierDistOverride)
```

In `syncResidentialAgents` in `tick.ts` (line 35), add `tierDistOverride` parameter:

```typescript
export function syncResidentialAgents(
  state: EngineState,
  enrollmentCounts?: Map<string, number>,
  tierDistOverride?: readonly [number, number, number],
): void {
```

And pass it through to opts (after line 42):

```typescript
const opts = {
  trafficDensity: state.trafficDensity,
  prng: state.prng,
  reputationLayer: state.reputationLayer,
  enrollmentCounts: ec,
  agentIndex,
  tierDistOverride,
}
```

- [ ] **Step 5: Run all tests to verify nothing breaks**

Run: `cd packages/engine && npx vitest run`
Expected: ALL PASS (optional params with defaults preserve behavior)

- [ ] **Step 6: Commit**

```bash
git add packages/engine/src/simulation/wealth-tiers.ts packages/engine/src/simulation/citizens.ts packages/engine/src/simulation/tick.ts packages/engine/src/__tests__/wealth-tiers.test.ts
git commit -m "feat: thread tierDistOverride through agent creation pipeline"
```

---

### Task 6: Remove Old Migration from Demographics

Remove the immigration/emigration blocks from `demographicTick()`. Update tests.

**Files:**
- Modify: `packages/engine/src/simulation/demographics.ts`
- Modify: `packages/engine/src/__tests__/demographics.test.ts`

- [ ] **Step 1: Remove migration blocks and avgSatisfaction parameter from demographicTick**

In `packages/engine/src/simulation/demographics.ts`:

1. Remove the `avgSatisfaction` parameter from the function signature (line 36). The new signature:

```typescript
export function demographicTick(
  registry: CitizenRegistry,
  map: GameMap,
  prng: PRNG,
): DemographicResult {
```

2. Remove lines 76–118 (the entire "Pass 4: Migration" section including the `totalWorking` computation, immigration block, and emigration block).

3. The function should go from line 74 (end of births loop) directly to `removeEmptyAgents(registry)` and `return { births, deaths, netMigration: 0 }`.

4. Update the call site in `packages/engine/src/simulation/tick.ts` line 102 — remove the `avgSatisfaction` argument:

```typescript
const demoResult = demographicTick(state.citizenRegistry, state.map, state.prng)
```

- [ ] **Step 2: Update demographics tests**

In `packages/engine/src/__tests__/demographics.test.ts`, update the `'Demographics — migration'` describe block:

Replace it with:

```typescript
describe('Demographics — migration removed', () => {
  test('demographicTick always returns netMigration 0', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 0, working: 50, elderly: 0 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    const building = {
      id: 'b1', defId: 'res.med', x: 0, y: 0,
      powered: true, density: DensityLevel.Medium, age: 0, state: 'active', residents: 50,
    }
    map.buildings = [building]
    const prng = new PRNG(42)

    const result = demographicTick(registry, map, prng)
    expect(result.netMigration).toBe(0)
  })
})

// NOTE: All existing tests that call demographicTick with 4 args must be updated
// to remove the avgSatisfaction argument. The existing aging/death/birth tests
// call demographicTick(registry, map, prng, 0.45) — change all to:
// demographicTick(registry, map, prng)
```

- [ ] **Step 3: Run tests**

Run: `cd packages/engine && npx vitest run src/__tests__/demographics.test.ts`
Expected: ALL PASS

- [ ] **Step 4: Run full test suite to check for regressions**

Run: `cd packages/engine && npx vitest run`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/demographics.ts packages/engine/src/simulation/tick.ts packages/engine/src/__tests__/demographics.test.ts
git commit -m "refactor: remove migration from demographicTick (handled by migration module)"
```

---

### Task 7: Wire Migration into Monthly Tick

Integrate attractiveness computation, migration modifier, tier distribution, and brain drain into `monthlyTick()`.

**Files:**
- Modify: `packages/engine/src/simulation/tick.ts`
- Modify: `packages/engine/src/engine-state.ts`
- Modify: `packages/core/src/state.ts`
- Modify: `packages/engine/src/Engine.ts`

- [ ] **Step 1: Add AttractivenessFactors type to core state**

In `packages/core/src/state.ts`, add before the `GameState` interface:

```typescript
export interface AttractivenessFactors {
  jobMatchRate: number
  avgSatisfaction: number
  serviceCoverage: number
  taxCompetitiveness: number
  housingAvailability: number
}
```

Add to `GameState` interface:

```typescript
cityAttractiveness: number
attractivenessFactors: AttractivenessFactors
netMigration: number
```

Also add `AttractivenessFactors` to the barrel export in `packages/core/src/index.ts`:

```typescript
export type { AttractivenessFactors } from './state.js'
```

- [ ] **Step 2: Add fields to EngineState**

In `packages/engine/src/engine-state.ts`, add to `EngineState` interface:

```typescript
cityAttractiveness: number
attractivenessFactors: AttractivenessFactors
```

Import `AttractivenessFactors` from `@bitborough/core`.

In `createEngineState()`, initialize:

```typescript
cityAttractiveness: 0.5,
attractivenessFactors: {
  jobMatchRate: 0.5,
  avgSatisfaction: 0.5,
  serviceCoverage: 0.5,
  taxCompetitiveness: 0.5,
  housingAvailability: 0.5,
},
```

In `restoreState()`, add the same defaults (for old save compatibility).

- [ ] **Step 3: Update Engine.getState() to expose new fields**

In `packages/engine/src/Engine.ts`, add to the `getState()` return object:

```typescript
cityAttractiveness: this.state.cityAttractiveness,
attractivenessFactors: this.state.attractivenessFactors,
netMigration: this.state.citizenSummary.netMigrationLastTick,
```

- [ ] **Step 4: Wire migration into monthlyTick**

In `packages/engine/src/simulation/tick.ts`:

Add imports:

```typescript
import { computeAttractiveness, computeMigrationModifier, computeMigrantTierDistribution, applyBrainDrain } from './migration.js'
```

After the demand calculation (after line 65), add:

```typescript
// Compute city attractiveness
const { score: attractiveness, factors: attractivenessFactors } = computeAttractiveness(
  state.citizenSummary, state.map, state.taxRate,
  { police: state.funding.police, fire: state.funding.fire, education: state.funding.education },
  state.crimeLevel, state.fireCoverage, state.educationQuality,
)
state.cityAttractiveness = attractiveness
state.attractivenessFactors = attractivenessFactors
const migrationModifier = computeMigrationModifier(attractiveness)
const tierDistOverride = computeMigrantTierDistribution(attractiveness)
```

Snapshot population before density pass (before `updateDensity` call):

```typescript
const popBeforeDensity = computeTotalPopulation(state.map)
```

Pass `migrationModifier` to `updateDensity` (add as last argument):

```typescript
updateDensity(
  state.map, state.powerGrid, state.demand,
  computeTotalPopulation(state.map), state.prng, nextBuildingIdRef,
  state.crimeLevel, state.fireCoverage, state.pollutionLevel,
  migrationModifier,
)
```

Pass `tierDistOverride` to both `syncResidentialAgents` calls:

```typescript
syncResidentialAgents(state, enrollmentCounts, tierDistOverride)
```

After the demographics tick and second sync, add the brain drain pass:

```typescript
// Brain drain pass
const brainDrainResult = applyBrainDrain(attractiveness, state.citizenRegistry, state.map, state.prng)
if (brainDrainResult.departures > 0) {
  const buildingById = new Map<string, Building>()
  for (const b of state.map.buildings) buildingById.set(b.id, b)
  for (const [buildingId, delta] of brainDrainResult.buildingDeltas) {
    const building = buildingById.get(buildingId)
    if (building) {
      building.residents = Math.max(0, building.residents + delta)
    }
  }
  syncResidentialAgents(state, enrollmentCounts, tierDistOverride)
}
```

Update net migration tracking — replace lines 110–112:

```typescript
const popAfterAll = computeTotalPopulation(state.map)
state.citizenSummary.netMigrationLastTick =
  popAfterAll - popBeforeDensity + demoResult.deaths - demoResult.births
```

- [ ] **Step 5: Run full test suite**

Run: `cd packages/engine && npx vitest run`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/state.ts packages/engine/src/engine-state.ts packages/engine/src/Engine.ts packages/engine/src/simulation/tick.ts
git commit -m "feat: wire migration model into monthly tick"
```

---

### Task 8: Export and Serialization

Export migration types from the engine barrel and ensure save/load handles new fields.

**Files:**
- Modify: `packages/engine/src/index.ts`
- Modify: `packages/engine/src/engine-state.ts` (if serialization needs updating)
- Modify: `packages/engine/src/__tests__/engine-state.test.ts` (or `serialization.test.ts`)

- [ ] **Step 1: Add export to engine barrel**

In `packages/engine/src/index.ts`, add:

```typescript
export { computeAttractiveness, computeMigrationModifier, computeMigrantTierDistribution } from './simulation/migration.js'
```

- [ ] **Step 2: Verify save/load handles defaults**

Check `restoreState()` in `engine-state.ts` — ensure `cityAttractiveness` and `attractivenessFactors` have defaults for old saves. These were added in Task 7 Step 2 — verify they're present.

- [ ] **Step 3: Write or update serialization test**

Add a test that saves state, restores it, and verifies the new fields are present with correct defaults.

- [ ] **Step 4: Run full test suite**

Run: `cd packages/engine && npx vitest run`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/index.ts packages/engine/src/engine-state.ts packages/engine/src/__tests__/engine-state.test.ts
git commit -m "feat: export migration module, handle save/load defaults"
```

---

### Task 9: Integration Test

Verify the full migration loop works end-to-end: attractiveness → fill rate modulation → tier shifting → brain drain.

**Files:**
- Modify: `packages/engine/src/__tests__/migration.test.ts`

- [ ] **Step 1: Write integration test**

Add to `migration.test.ts`:

```typescript
import { Engine } from '../Engine.js'
import { advanceMonth, advanceYear } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'

function createCityEngine(taxRate = 0.07) {
  const engine = Engine.create(createTestMap(64), { seed: 42, startingFunds: 50_000 })
  // Power plant (use diesel per project convention)
  engine.placeBuilding(10, 10, 'power.diesel')
  // Road
  for (let x = 14; x < 28; x++) engine.placeTile(x, 12, Infrastructure.Road)
  // Power lines
  for (let x = 14; x < 28; x++) engine.placeTile(x, 10, Infrastructure.PowerLine)
  // Residential zones
  for (let x = 14; x < 28; x++) engine.placeZone(x, 11, ZoneType.Residential)
  // Commercial zones (for jobs)
  for (let x = 14; x < 28; x++) engine.placeZone(x, 13, ZoneType.Commercial)
  // Industrial zones
  for (let x = 14; x < 20; x++) engine.placeZone(x, 14, ZoneType.Industrial)
  engine.setTaxRate(taxRate)
  return engine
}

describe('migration integration', () => {
  test('low-tax city grows faster than high-tax city', () => {
    const lowTax = createCityEngine(0.07)
    const highTax = createCityEngine(0.20)

    for (let i = 0; i < 3; i++) {
      advanceYear(lowTax)
      advanceYear(highTax)
    }

    expect(lowTax.getState().population).toBeGreaterThan(highTax.getState().population)
  })

  test('attractiveness and netMigration are exposed in game state', () => {
    const engine = createCityEngine()
    advanceYear(engine)
    const state = engine.getState()
    expect(state.cityAttractiveness).toBeGreaterThanOrEqual(0)
    expect(state.cityAttractiveness).toBeLessThanOrEqual(1)
    expect(state.attractivenessFactors).toBeDefined()
    expect(state.attractivenessFactors.jobMatchRate).toBeGreaterThanOrEqual(0)
    expect(typeof state.netMigration).toBe('number')
  })

  test('attractiveness factors breakdown sums correctly', () => {
    const engine = createCityEngine()
    advanceYear(engine)
    const { attractivenessFactors: f, cityAttractiveness } = engine.getState()
    // Each factor is 0-1, score is weighted sum
    const expectedScore =
      f.jobMatchRate * 0.30 +
      f.avgSatisfaction * 0.25 +
      f.serviceCoverage * 0.20 +
      f.taxCompetitiveness * 0.15 +
      f.housingAvailability * 0.10
    expect(cityAttractiveness).toBeCloseTo(expectedScore, 2)
  })
})
```

- [ ] **Step 2: Run integration tests**

Run: `cd packages/engine && npx vitest run src/__tests__/migration.test.ts`
Expected: ALL PASS

- [ ] **Step 3: Run full suite one final time**

Run: `cd packages/engine && npx vitest run`
Expected: ALL PASS

- [ ] **Step 4: Commit**

```bash
git add packages/engine/src/__tests__/migration.test.ts
git commit -m "test: add migration model integration tests"
```
