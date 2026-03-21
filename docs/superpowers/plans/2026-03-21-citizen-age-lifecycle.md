# Citizen Age Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add demographic age histograms to citizen agents — probabilistic aging, births, deaths, and satisfaction-driven migration — so population becomes an emergent property of demographic flows.

**Architecture:** A new `simulation/demographics.ts` module runs a four-pass monthly tick (aging → deaths → births → migration) that mutates demographic counts on existing agents. `syncBuildingResidents` writes totals back to buildings, and `computeTotalPopulation` derives the engine's population. The existing `syncAgentsForBuilding` reconciles agent counts after demographic changes.

**Tech Stack:** TypeScript, Vitest, pnpm workspace monorepo (`@bitborough/engine`, `@bitborough/core`)

**Spec:** `docs/superpowers/specs/2026-03-21-citizen-age-lifecycle-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `packages/core/src/state.ts` | Modify | Extend `CitizenSummary`, `MonthlySnapshot`, `SaveFile` with demographic fields |
| `packages/core/src/index.ts` | Modify | Export any new types (if needed) |
| `packages/engine/src/simulation/citizens.ts` | Modify | Add `demographics` field to `Citizen`, add `syncBuildingResidents()`, `computeTotalPopulation()`, update `computeCitizenSummary()`, update `EMPTY_CITIZEN_SUMMARY` |
| `packages/engine/src/simulation/demographics.ts` | Create | `demographicTick()` — aging, deaths, births, migration |
| `packages/engine/src/__tests__/demographics.test.ts` | Create | Unit tests for all four demographic passes |
| `packages/engine/src/simulation/demand.ts` | Modify | Add dependency-ratio demand modifiers |
| `packages/engine/src/__tests__/demand.test.ts` | Modify | Add demographic demand tests |
| `packages/engine/src/Engine.ts` | Modify | Wire `demographicTick` into tick, replace `population += delta` with derived population, update serialize/restore (v6) |
| `packages/engine/src/__tests__/serialization.test.ts` | Modify | Add demographics serialization tests |

---

## Chunk 1: Core Types + Citizen Model Extension

### Task 1: Extend core types with demographic fields

**Files:**
- Modify: `packages/core/src/state.ts`

- [ ] **Step 1: Extend `CitizenSummary` with demographic fields**

In `packages/core/src/state.ts`, add after `avgCommuteLengthTiles`:

```typescript
export interface CitizenSummary {
  agentCount: number
  avgSatisfaction: number
  unmatchedJobFraction: number
  unmatchedCommerceFraction: number
  avgCommuteLengthTiles: number
  // Demographics
  totalChildren: number
  totalWorking: number
  totalElderly: number
  birthsLastTick: number
  deathsLastTick: number
  netMigrationLastTick: number
}
```

- [ ] **Step 2: Extend `MonthlySnapshot` with demographic fields**

Add to `MonthlySnapshot`:

```typescript
export interface MonthlySnapshot {
  // ... existing fields ...
  births: number       // absolute count this month
  deaths: number       // absolute count this month
  netMigration: number // absolute count this month
}
```

- [ ] **Step 3: Extend `SaveFile.state.citizens.agents` with demographics**

Add `demographics` to the agent schema in `SaveFile`:

```typescript
citizens?: {
  samplingRatio: number
  agents: Array<{
    // ... existing fields ...
    demographics?: {
      children: number
      working: number
      elderly: number
    }
  }>
}
```

- [ ] **Step 4: Build to confirm no type errors**

```bash
cd /path/to/worktree && pnpm -F @bitborough/core typecheck
```
Expected: type errors in engine (CitizenSummary consumers don't provide new fields yet). That's expected — we'll fix in Task 2.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/state.ts
git commit -m "feat: extend CitizenSummary, MonthlySnapshot, SaveFile with demographic fields"
```

---

### Task 2: Add demographics to Citizen interface and update citizens.ts

**Files:**
- Modify: `packages/engine/src/simulation/citizens.ts`

- [ ] **Step 1: Add `AgentDemographics` type and field to `Citizen`**

Add to citizens.ts types section:

```typescript
export interface AgentDemographics {
  children: number    // ages 0-17
  working: number     // ages 18-64
  elderly: number     // ages 65+
}
```

Add to `Citizen` interface:

```typescript
export interface Citizen {
  // ... existing fields ...
  demographics: AgentDemographics
}
```

- [ ] **Step 2: Update `createAgent` to initialize demographics**

In `createAgent()`, add `demographics` to the agent object:

```typescript
demographics: { children: 0, working: 50, elderly: 0 },
```

This matches the spec: new agents from migration start as a full working-age cohort.

- [ ] **Step 3: Update `EMPTY_CITIZEN_SUMMARY` with new fields**

```typescript
export const EMPTY_CITIZEN_SUMMARY: CitizenSummary = {
  agentCount: 0,
  avgSatisfaction: 1,
  unmatchedJobFraction: 0,
  unmatchedCommerceFraction: 0,
  avgCommuteLengthTiles: 0,
  totalChildren: 0,
  totalWorking: 0,
  totalElderly: 0,
  birthsLastTick: 0,
  deathsLastTick: 0,
  netMigrationLastTick: 0,
}
```

- [ ] **Step 4: Update `computeCitizenSummary` to include demographic totals**

Add demographic tallying to the existing loop:

```typescript
export function computeCitizenSummary(registry: CitizenRegistry): CitizenSummary {
  const { agents } = registry
  if (agents.length === 0) return { ...EMPTY_CITIZEN_SUMMARY }

  let satSum = 0
  let unmatchedJob = 0
  let unmatchedCommerce = 0
  let commuteLengthSum = 0
  let totalChildren = 0
  let totalWorking = 0
  let totalElderly = 0

  for (const agent of agents) {
    satSum += agent.satisfaction
    if (agent.workBuildingId === null) unmatchedJob++
    if (agent.commerceBuildingId === null) unmatchedCommerce++
    commuteLengthSum += agent.homeWorkRoute.length
    totalChildren += agent.demographics.children
    totalWorking += agent.demographics.working
    totalElderly += agent.demographics.elderly
  }

  return {
    agentCount: agents.length,
    avgSatisfaction: satSum / agents.length,
    unmatchedJobFraction: unmatchedJob / agents.length,
    unmatchedCommerceFraction: unmatchedCommerce / agents.length,
    avgCommuteLengthTiles: commuteLengthSum / agents.length,
    totalChildren,
    totalWorking,
    totalElderly,
    birthsLastTick: 0,   // filled by demographicTick, not here
    deathsLastTick: 0,
    netMigrationLastTick: 0,
  }
}
```

- [ ] **Step 5: Add `syncBuildingResidents` and `computeTotalPopulation`**

Add to citizens.ts:

```typescript
/** Sync each residential building's `residents` from the sum of its agents' demographics. */
export function syncBuildingResidents(map: GameMap, registry: CitizenRegistry): void {
  // Build a map of buildingId → total population across agents
  const popByBuilding = new Map<string, number>()
  for (const agent of registry.agents) {
    const d = agent.demographics
    const total = d.children + d.working + d.elderly
    popByBuilding.set(agent.homeBuildingId, (popByBuilding.get(agent.homeBuildingId) ?? 0) + total)
  }

  for (const b of map.buildings) {
    const def = BUILDING_DEFS[b.defId]
    if (!def || def.category !== BuildingCategory.Residential) continue
    b.residents = popByBuilding.get(b.id) ?? 0
  }
}

/** Sum all residential building residents. */
export function computeTotalPopulation(map: GameMap): number {
  let total = 0
  for (const b of map.buildings) {
    const def = BUILDING_DEFS[b.defId]
    if (!def || def.category !== BuildingCategory.Residential) continue
    if (b.state === 'active') total += b.residents
  }
  return total
}
```

- [ ] **Step 6: Run engine typecheck**

```bash
pnpm -F @bitborough/engine typecheck
```
Expected: may have errors in tests or Engine.ts (demographics not wired yet). Fix any type errors in citizens.ts itself.

- [ ] **Step 7: Run existing citizen tests**

```bash
pnpm -F @bitborough/engine test citizens
```
Expected: tests should still pass (demographics field is additive, existing tests don't check it). If any fail because `demographics` is missing from test building helpers, add `demographics: { children: 0, working: 50, elderly: 0 }` to `createAgent`.

- [ ] **Step 8: Commit**

```bash
git add packages/engine/src/simulation/citizens.ts
git commit -m "feat: add AgentDemographics to Citizen, syncBuildingResidents, computeTotalPopulation"
```

---

## Chunk 2: Demographics Module

### Task 3: Create demographics.ts — aging and deaths

**Files:**
- Create: `packages/engine/src/simulation/demographics.ts`
- Create: `packages/engine/src/__tests__/demographics.test.ts`

- [ ] **Step 1: Write failing tests for aging and deaths**

```typescript
// packages/engine/src/__tests__/demographics.test.ts
import { describe, test, expect } from 'vitest'
import { demographicTick } from '../simulation/demographics.js'
import { createTestMap } from '../test-helpers.js'
import { createRegistry } from '../simulation/citizens.js'
import type { Citizen } from '../simulation/citizens.js'
import { PRNG } from '../prng.js'

function makeAgent(id: string, buildingId: string, demographics: { children: number; working: number; elderly: number }): Citizen {
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
    satisfaction: 0.7,
    demographics,
  }
}

describe('Demographics — aging', () => {
  test('children transition to working over time', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 100, working: 0, elderly: 0 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    const prng = new PRNG(42)

    // Run 300 months (~25 years) — most children should have transitioned
    for (let i = 0; i < 300; i++) {
      demographicTick(registry, map, prng, 0.45) // dead band — no migration
    }

    expect(agent.demographics.children).toBeLessThan(20)
    expect(agent.demographics.working).toBeGreaterThan(50)
  })

  test('working transition to elderly over time', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 0, working: 100, elderly: 0 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    const prng = new PRNG(42)

    // Run 700 months (~58 years) — many should have retired
    for (let i = 0; i < 700; i++) {
      demographicTick(registry, map, prng, 0.45)
    }

    expect(agent.demographics.elderly).toBeGreaterThan(0)
    expect(agent.demographics.working).toBeLessThan(100)
  })
})

describe('Demographics — deaths', () => {
  test('elderly population declines through deaths', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 0, working: 0, elderly: 50 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    const prng = new PRNG(42)

    for (let i = 0; i < 200; i++) {
      demographicTick(registry, map, prng, 0.45)
    }

    expect(agent.demographics.elderly).toBeLessThan(50)
  })

  test('agent is removed when total population hits 0', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 0, working: 0, elderly: 1 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    const prng = new PRNG(42)

    // Run until the single elderly person dies
    for (let i = 0; i < 500; i++) {
      demographicTick(registry, map, prng, 0.45)
      if (registry.agents.length === 0) break
    }

    expect(registry.agents.length).toBe(0)
  })

  test('demographicTick returns death count', () => {
    const registry = createRegistry()
    registry.agents.push(makeAgent('c1', 'b1', { children: 0, working: 0, elderly: 100 }))
    const map = createTestMap(8)
    const prng = new PRNG(42)

    let totalDeaths = 0
    for (let i = 0; i < 100; i++) {
      const result = demographicTick(registry, map, prng, 0.45)
      totalDeaths += result.deaths
    }

    expect(totalDeaths).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm -F @bitborough/engine test demographics
```
Expected: module not found.

- [ ] **Step 3: Implement demographics.ts — passes 1 and 2 (aging + deaths)**

```typescript
// packages/engine/src/simulation/demographics.ts
import type { GameMap } from '@bitborough/core'
import type { CitizenRegistry } from './citizens.js'
import type { PRNG } from '../prng.js'

// Aging transition probabilities (per person per month)
const P_CHILD_TO_WORKING = 1 / 216     // ~18 years as child
const P_WORKING_TO_ELDERLY = 1 / 564   // ~47 working years
const P_ELDERLY_DEATH = 1 / 180        // ~15 years as elderly

export interface DemographicResult {
  births: number
  deaths: number
  netMigration: number
}

export function demographicTick(
  registry: CitizenRegistry,
  map: GameMap,
  prng: PRNG,
  avgSatisfaction: number,
): DemographicResult {
  let births = 0
  let deaths = 0
  let netMigration = 0

  // Pass 1: Aging transitions
  for (const agent of registry.agents) {
    const d = agent.demographics

    // Children → Working
    let childTransitions = 0
    for (let i = 0; i < d.children; i++) {
      if (prng.next() < P_CHILD_TO_WORKING) childTransitions++
    }
    d.children -= childTransitions
    d.working += childTransitions

    // Working → Elderly
    let retirements = 0
    for (let i = 0; i < d.working; i++) {
      if (prng.next() < P_WORKING_TO_ELDERLY) retirements++
    }
    d.working -= retirements
    d.elderly += retirements
  }

  // Pass 2: Deaths
  for (let i = registry.agents.length - 1; i >= 0; i--) {
    const agent = registry.agents[i]!
    const d = agent.demographics

    let elderlyDeaths = 0
    for (let j = 0; j < d.elderly; j++) {
      if (prng.next() < P_ELDERLY_DEATH) elderlyDeaths++
    }
    d.elderly -= elderlyDeaths
    deaths += elderlyDeaths

    // Remove agent if total population is 0
    if (d.children + d.working + d.elderly <= 0) {
      registry.agents.splice(i, 1)
    }
  }

  // Pass 3 & 4: births and migration — added in next task

  return { births, deaths, netMigration }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm -F @bitborough/engine test demographics
```
Expected: all aging and death tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/demographics.ts packages/engine/src/__tests__/demographics.test.ts
git commit -m "feat: demographics module — aging transitions and elderly deaths"
```

---

### Task 4: Add births and migration to demographics.ts

**Files:**
- Modify: `packages/engine/src/simulation/demographics.ts`
- Modify: `packages/engine/src/__tests__/demographics.test.ts`

- [ ] **Step 1: Write failing tests for births and migration**

Add to `demographics.test.ts`:

```typescript
import { Infrastructure, BuildingCategory } from '@bitborough/core'
import { buildRoadGraph } from '../road-graph.js'
import { BUILDING_DEFS } from '../buildings-registry.js'
import type { Building } from '@bitborough/core'

describe('Demographics — births', () => {
  test('working population produces children', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 0, working: 50, elderly: 0 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    const prng = new PRNG(42)

    for (let i = 0; i < 100; i++) {
      demographicTick(registry, map, prng, 0.45)
    }

    expect(agent.demographics.children).toBeGreaterThan(0)
  })

  test('no births when working population is 0', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 10, working: 0, elderly: 5 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    const prng = new PRNG(42)

    const result = demographicTick(registry, map, prng, 0.45)
    expect(result.births).toBe(0)
  })

  test('demographicTick returns birth count', () => {
    const registry = createRegistry()
    registry.agents.push(makeAgent('c1', 'b1', { children: 0, working: 100, elderly: 0 }))
    const map = createTestMap(8)
    const prng = new PRNG(42)

    let totalBirths = 0
    for (let i = 0; i < 100; i++) {
      const result = demographicTick(registry, map, prng, 0.45)
      totalBirths += result.births
    }

    expect(totalBirths).toBeGreaterThan(0)
  })
})

describe('Demographics — migration', () => {
  test('high satisfaction attracts immigrants (working-age)', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 0, working: 5, elderly: 0 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    // res.med has capacity 100 — plenty of headroom
    const building: Building = {
      id: 'b1', defId: 'res.med', x: 0, y: 0,
      powered: true, density: 1, age: 0, state: 'active', residents: 5,
    }
    map.buildings = [building]
    const prng = new PRNG(42)

    let totalImmigration = 0
    for (let i = 0; i < 50; i++) {
      const result = demographicTick(registry, map, prng, 0.8) // high satisfaction
      totalImmigration += result.netMigration
    }

    expect(totalImmigration).toBeGreaterThan(0)
    expect(agent.demographics.working).toBeGreaterThan(5)
  })

  test('low satisfaction causes emigration', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 0, working: 50, elderly: 0 })
    agent.satisfaction = 0.2
    registry.agents.push(agent)
    const map = createTestMap(8)
    const prng = new PRNG(42)

    let totalEmigration = 0
    for (let i = 0; i < 50; i++) {
      const result = demographicTick(registry, map, prng, 0.2) // low satisfaction
      totalEmigration += result.netMigration
    }

    expect(totalEmigration).toBeLessThan(0)
    expect(agent.demographics.working).toBeLessThan(50)
  })

  test('dead band (0.4-0.5) produces no migration', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 0, working: 50, elderly: 0 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    const prng = new PRNG(42)

    const result = demographicTick(registry, map, prng, 0.45)
    expect(result.netMigration).toBe(0)
  })

  test('emigration removes from least-satisfied agents first', () => {
    const registry = createRegistry()
    const happy = makeAgent('c1', 'b1', { children: 0, working: 30, elderly: 0 })
    happy.satisfaction = 0.6
    const unhappy = makeAgent('c2', 'b2', { children: 0, working: 30, elderly: 0 })
    unhappy.satisfaction = 0.1
    registry.agents.push(happy, unhappy)
    const map = createTestMap(8)
    const prng = new PRNG(42)

    for (let i = 0; i < 20; i++) {
      demographicTick(registry, map, prng, 0.2)
    }

    // Unhappy agent should have lost more people
    expect(unhappy.demographics.working).toBeLessThan(happy.demographics.working)
  })

  test('immigration stops when all buildings are at capacity', () => {
    const registry = createRegistry()
    const agent = makeAgent('c1', 'b1', { children: 0, working: 10, elderly: 0 })
    registry.agents.push(agent)
    const map = createTestMap(8)
    // res.low has capacity 10 — already at capacity with residents: 10
    const building: Building = {
      id: 'b1', defId: 'res.low', x: 0, y: 0,
      powered: true, density: 0, age: 0, state: 'active', residents: 10,
    }
    map.buildings = [building]
    const prng = new PRNG(42)

    const result = demographicTick(registry, map, prng, 0.9) // high satisfaction
    // No immigration because building is at capacity
    expect(result.netMigration).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm -F @bitborough/engine test demographics
```
Expected: birth/migration tests fail (births always 0, migration always 0).

- [ ] **Step 3: Implement Pass 3 (births) and Pass 4 (migration)**

Add to `demographicTick()` after the deaths pass:

```typescript
  // Pass 3: Births
  const P_BIRTH = 0.0012  // per working-age person per month
  for (const agent of registry.agents) {
    const d = agent.demographics
    if (d.working <= 0) continue
    let newBirths = 0
    for (let i = 0; i < d.working; i++) {
      if (prng.next() < P_BIRTH) newBirths++
    }
    d.children += newBirths
    births += newBirths
  }

  // Pass 4: Migration
  const totalWorking = registry.agents.reduce((sum, a) => sum + a.demographics.working, 0)

  if (avgSatisfaction > 0.5 && totalWorking > 0) {
    // Immigration: rate scales linearly from 0 at 0.5 to 0.02 * totalWorking at 1.0
    const rate = ((avgSatisfaction - 0.5) / 0.5) * 0.02 * totalWorking
    const immigrantCount = Math.floor(rate)

    // Find buildings with spare capacity
    let placed = 0
    for (const agent of registry.agents) {
      if (placed >= immigrantCount) break
      const building = map.buildings.find(b => b.id === agent.homeBuildingId)
      if (!building) continue
      const def = BUILDING_DEFS[building.defId]
      if (!def) continue
      const capacity = def.capacity
      const currentPop = agent.demographics.children + agent.demographics.working + agent.demographics.elderly
      const headroom = capacity - building.residents
      if (headroom <= 0) continue
      const toAdd = Math.min(immigrantCount - placed, headroom)
      agent.demographics.working += toAdd
      building.residents += toAdd  // keep in sync for capacity checks within this tick
      placed += toAdd
    }
    netMigration += placed
  } else if (avgSatisfaction < 0.4 && totalWorking > 0) {
    // Emigration: rate scales linearly from 0 at 0.4 to 0.03 * totalWorking at 0.0
    const rate = ((0.4 - avgSatisfaction) / 0.4) * 0.03 * totalWorking
    let toRemove = Math.floor(rate)

    // Sort agents by satisfaction (lowest first)
    const sorted = [...registry.agents].sort((a, b) => a.satisfaction - b.satisfaction)
    for (const agent of sorted) {
      if (toRemove <= 0) break
      const d = agent.demographics
      const canRemove = Math.min(toRemove, d.working)
      d.working -= canRemove
      toRemove -= canRemove
    }
    netMigration -= Math.floor(rate) - toRemove
  }
  // Dead band (0.4–0.5): no migration — netMigration stays 0

  // Clean up empty agents (from emigration)
  for (let i = registry.agents.length - 1; i >= 0; i--) {
    const d = registry.agents[i]!.demographics
    if (d.children + d.working + d.elderly <= 0) {
      registry.agents.splice(i, 1)
    }
  }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm -F @bitborough/engine test demographics
```
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/demographics.ts packages/engine/src/__tests__/demographics.test.ts
git commit -m "feat: demographics births and satisfaction-driven migration"
```

---

## Chunk 3: Demand Integration

### Task 5: Add demographic demand modifiers

**Files:**
- Modify: `packages/engine/src/simulation/demand.ts`
- Modify: `packages/engine/src/__tests__/demand.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `demand.test.ts`:

```typescript
describe('Demographic demand signals', () => {
  test('high dependency ratio suppresses commercial and industrial demand', () => {
    const map = createTestMap(32)
    const baseline = calculateDemand(map, 0.07)
    const highDependency = calculateDemand(map, 0.07, undefined, {
      ...baseSummary,
      totalChildren: 60,
      totalWorking: 40,
      totalElderly: 30,
      // dependency ratio = (60+30)/40 = 2.25, well above 0.6 threshold
    })
    expect(highDependency.commercial).toBeLessThan(baseline.commercial)
    expect(highDependency.industrial).toBeLessThan(baseline.industrial)
  })

  test('low dependency ratio produces no penalty', () => {
    const map = createTestMap(32)
    const baseline = calculateDemand(map, 0.07)
    const lowDependency = calculateDemand(map, 0.07, undefined, {
      ...baseSummary,
      totalChildren: 10,
      totalWorking: 80,
      totalElderly: 5,
      // dependency ratio = (10+5)/80 = 0.19, below 0.6 threshold
    })
    expect(lowDependency.commercial).toBeCloseTo(baseline.commercial, 2)
    expect(lowDependency.industrial).toBeCloseTo(baseline.industrial, 2)
  })

  test('children-heavy population boosts residential demand', () => {
    const map = createTestMap(32)
    const baseline = calculateDemand(map, 0.07)
    const childHeavy = calculateDemand(map, 0.07, undefined, {
      ...baseSummary,
      totalChildren: 40,
      totalWorking: 50,
      totalElderly: 10,
      // children fraction = 40/100 = 0.4, above 0.25 threshold
    })
    expect(childHeavy.residential).toBeGreaterThan(baseline.residential)
  })
})
```

Note: `baseSummary` already exists in the test file. You need to add the new fields to it:

```typescript
const baseSummary: CitizenSummary = {
  agentCount: 100,
  avgSatisfaction: 1,
  unmatchedJobFraction: 0,
  unmatchedCommerceFraction: 0,
  avgCommuteLengthTiles: 10,
  totalChildren: 20,
  totalWorking: 70,
  totalElderly: 10,
  birthsLastTick: 0,
  deathsLastTick: 0,
  netMigrationLastTick: 0,
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm -F @bitborough/engine test demand
```
Expected: demographic tests fail (no penalty applied).

- [ ] **Step 3: Add demographic modifiers to `calculateDemand`**

In `demand.ts`, after the citizen signals block and before the final clamp:

```typescript
  // Demographic signals
  if (citizens && citizens.agentCount > 0) {
    const totalPop = citizens.totalChildren + citizens.totalWorking + citizens.totalElderly
    if (totalPop > 0 && citizens.totalWorking > 0) {
      // Dependency ratio penalty: (children + elderly) / working > 0.6 suppresses C/I
      const depRatio = (citizens.totalChildren + citizens.totalElderly) / citizens.totalWorking
      if (depRatio > 0.6) {
        const penalty = Math.min(0.15, (depRatio - 0.6) * 0.3)
        cDemand -= penalty
        iDemand -= penalty
      }

      // Children-heavy bonus: children fraction > 0.25 boosts residential
      const childFraction = citizens.totalChildren / totalPop
      if (childFraction > 0.25) {
        rDemand += 0.05
      }
    }
  }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm -F @bitborough/engine test demand
```
Expected: all demand tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/demand.ts packages/engine/src/__tests__/demand.test.ts
git commit -m "feat: demographic demand modifiers — dependency ratio and children bonus"
```

---

## Chunk 4: Engine Wiring + Save/Load

### Task 6: Wire demographics into Engine.ts

**Files:**
- Modify: `packages/engine/src/Engine.ts`

- [ ] **Step 1: Add import for demographicTick**

```typescript
import { demographicTick, type DemographicResult } from './simulation/demographics.js'
import { syncBuildingResidents, computeTotalPopulation } from './simulation/citizens.js'
```

(Note: `syncBuildingResidents` and `computeTotalPopulation` were added to citizens.ts in Task 2.)

- [ ] **Step 2: Add `lastDemographicResult` private field**

```typescript
private lastDemographicResult: DemographicResult = { births: 0, deaths: 0, netMigration: 0 }
```

- [ ] **Step 3: Wire demographics into the monthly tick**

Replace the current population tracking in `tick()`. After the existing `syncAgentsForBuilding` loop (line ~219), add:

```typescript
      // 5. Demographics — aging, deaths, births, migration
      this.lastDemographicResult = demographicTick(this.citizenRegistry, this.map, this.prng, this.citizenSummary.avgSatisfaction)

      // 6. Sync building residents from agent demographics
      syncBuildingResidents(this.map, this.citizenRegistry)

      // 7. Re-sync agent count after demographic changes
      for (const b of this.map.buildings) {
        if (b.state === 'active') {
          const def = BUILDING_DEFS[b.defId]
          if (def && def.category === BuildingCategory.Residential) {
            syncAgentsForBuilding(this.map, this.citizenRegistry, this.roadGraph, b)
          }
        }
      }

      // 8. Refresh citizen summary with post-demographics data
      this.citizenSummary = computeCitizenSummary(this.citizenRegistry)
      this.citizenSummary.birthsLastTick = this.lastDemographicResult.births
      this.citizenSummary.deathsLastTick = this.lastDemographicResult.deaths
      this.citizenSummary.netMigrationLastTick = this.lastDemographicResult.netMigration
      this.population = computeTotalPopulation(this.map)
```

Also remove the existing `this.population += populationDelta` and `this.population = Math.max(0, this.population + densityDelta)` lines. Population is now fully derived.

- [ ] **Step 4: Update MonthlySnapshot recording**

In the snapshot push block, add the new fields:

```typescript
      this.history.push({
        // ... existing fields ...
        births: this.lastDemographicResult.births,
        deaths: this.lastDemographicResult.deaths,
        netMigration: this.lastDemographicResult.netMigration,
      })
```

- [ ] **Step 5: Run typecheck**

```bash
pnpm -F @bitborough/engine typecheck
```

- [ ] **Step 6: Run all engine tests**

```bash
pnpm -F @bitborough/engine test
```
Expected: most tests pass. Some may fail due to population tracking changes. Fix any that break.

- [ ] **Step 7: Commit**

```bash
git add packages/engine/src/Engine.ts
git commit -m "feat: wire demographics into Engine tick — derived population, MonthlySnapshot"
```

---

### Task 7: Save/load with demographics (version 6)

**Files:**
- Modify: `packages/engine/src/Engine.ts`
- Modify: `packages/engine/src/__tests__/serialization.test.ts`

- [ ] **Step 1: Write failing serialization tests**

Add to `serialization.test.ts`:

```typescript
test('demographics are serialized and restored', () => {
  const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 100_000 })
  engine.placeBuilding(0, 0, 'power.diesel')
  for (let x = 2; x < 8; x++) {
    engine.placeTile(x, 2, Infrastructure.PowerLine)
    engine.placeTile(x, 4, Infrastructure.Road)
    engine.placeZone(x, 3, ZoneType.Residential)
  }
  for (let x = 12; x < 16; x++) {
    engine.placeTile(x, 4, Infrastructure.Road)
    engine.placeZone(x, 3, ZoneType.Commercial)
  }
  for (let i = 0; i < 36; i++) advanceMonth(engine)

  const state1 = engine.getState()
  const save = engine.serialize()

  expect(save.version).toBe(6)

  const restored = Engine.restore(save)
  const state2 = restored.getState()

  expect(state2.citizens.totalChildren).toBe(state1.citizens.totalChildren)
  expect(state2.citizens.totalWorking).toBe(state1.citizens.totalWorking)
  expect(state2.citizens.totalElderly).toBe(state1.citizens.totalElderly)
})

test('restore from v5 save defaults demographics to all-working', () => {
  const engine = Engine.create(createTestMap(32), { seed: 42 })
  const save = engine.serialize()
  const v5Save = { ...save, version: 5 as const }
  // Remove demographics from agents
  if (v5Save.state.citizens) {
    v5Save.state.citizens.agents = v5Save.state.citizens.agents.map(a => {
      const { demographics: _, ...rest } = a as any
      return rest
    })
  }
  const restored = Engine.restore(v5Save as any)
  // Should have defaulted to all-working
  for (const agent of (restored as any).citizenRegistry.agents) {
    const d = agent.demographics
    expect(d.children).toBe(0)
    expect(d.elderly).toBe(0)
  }
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm -F @bitborough/engine test serialization
```

- [ ] **Step 3: Update `serialize()` — bump version, add demographics**

Change `version: 5` to `version: 6`.

Add `demographics` to each serialized agent:

```typescript
agents: this.citizenRegistry.agents.map(a => ({
  // ... existing fields ...
  demographics: a.demographics,
})),
```

- [ ] **Step 4: Update `restore()` — handle demographics field**

In the citizen restore block, handle the demographics field:

```typescript
agents: save.state.citizens.agents.map(a => ({
  ...a,
  demographics: (a as any).demographics ?? { children: 0, working: 50, elderly: 0 },
  homeWorkRouteStale: false,
  homeCommerceRouteStale: false,
  homeWorkRouteTileSet: new Set(a.homeWorkRoute),
  homeCommerceRouteTileSet: new Set(a.homeCommerceRoute),
})),
```

- [ ] **Step 5: Run all tests**

```bash
pnpm -F @bitborough/engine test
```
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/engine/src/Engine.ts packages/engine/src/__tests__/serialization.test.ts
git commit -m "feat: demographics save/load — version 6, backwards compatible"
```

---

### Task 8: Final typecheck and integration smoke test

- [ ] **Step 1: Run full typecheck**

```bash
pnpm typecheck
```

- [ ] **Step 2: Run full test suite**

```bash
pnpm test
```
Expected: all tests pass across all packages.

- [ ] **Step 3: Fix any issues and commit**

```bash
git add -p && git commit -m "fix: typecheck and lint cleanup for demographics"
```

---

## Summary

| Chunk | Tasks | What it produces |
|---|---|---|
| 1 | 1–2 | Core types extended, `Citizen` gains demographics, `syncBuildingResidents`, `computeTotalPopulation` |
| 2 | 3–4 | `demographics.ts` — aging, deaths, births, migration |
| 3 | 5 | Demand modifiers for dependency ratio and children |
| 4 | 6–8 | Engine wiring, derived population, save/load v6, final verification |
