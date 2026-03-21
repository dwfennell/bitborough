# Simulation Quick Wins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 8 engine-side simulation improvements across pollution, traffic, desirability, and economics. (Spec item 6, LOS Traffic Overlay, is a frontend-only change deferred to a separate UI task.)

**Architecture:** All changes are localized to existing simulation files. One new file (`pollution.ts`) for propagation. No data model changes or save version bumps. TDD throughout — each change gets failing tests first.

**Tech Stack:** TypeScript, Vitest, pnpm monorepo (`@bitborough/engine` package)

**Spec:** `docs/superpowers/specs/2026-03-21-simulation-quick-wins-design.md`

---

## File Structure

| File | Role | Action |
|------|------|--------|
| `packages/engine/src/simulation/pollution.ts` | Pollution propagation from buildings | Create |
| `packages/engine/src/__tests__/pollution.test.ts` | Tests for pollution propagation | Create |
| `packages/engine/src/Engine.ts` | Monthly tick — call pollution before land values | Modify |
| `packages/engine/src/simulation/desirability.ts` | Park decay + zone boundary effects | Modify |
| `packages/engine/src/__tests__/desirability.test.ts` | New tests for park decay + zone boundary | Modify |
| `packages/engine/src/simulation/density.ts` | Logistic fill + variable construction time | Modify |
| `packages/engine/src/__tests__/density.test.ts` | New tests for logistic fill + construction time | Modify |
| `packages/engine/src/road-graph.ts` | BPR edge cost function + `astar()` signature | Modify |
| `packages/engine/src/__tests__/road-graph.test.ts` | New tests for BPR routing | Modify |
| `packages/engine/src/simulation/citizens.ts` | Thread `trafficDensity` to `astar()` calls | Modify |
| `packages/engine/src/simulation/demand.ts` | Vacancy rate feedback | Modify |
| `packages/engine/src/__tests__/demand.test.ts` | New tests for vacancy dampening | Modify |
| `packages/engine/src/simulation/budget.ts` | Sprawl penalty + footprint tile counting | Modify |
| `packages/engine/src/__tests__/budget.test.ts` | New tests for sprawl multiplier | Modify |

---

### Task 1: Pollution Propagation

**Files:**
- Create: `packages/engine/src/simulation/pollution.ts`
- Create: `packages/engine/src/__tests__/pollution.test.ts`
- Modify: `packages/engine/src/Engine.ts:179` (monthly tick sequence)

- [ ] **Step 1: Write failing tests for pollution propagation**

Create `packages/engine/src/__tests__/pollution.test.ts`:

```ts
import { describe, test, expect } from 'vitest'
import { createTestMap } from '../test-helpers.js'
import { calculatePollution } from '../simulation/pollution.js'
import { BUILDING_DEFS } from '../buildings-registry.js'

function placeBuilding(map: ReturnType<typeof createTestMap>, defId: string, x: number, y: number) {
  const def = BUILDING_DEFS[defId]!
  map.buildings.push({
    id: `b-${x}-${y}`,
    defId,
    x,
    y,
    density: def.density,
    state: 'active',
    residents: 0,
    age: 0,
    powered: true,
  })
}

describe('calculatePollution', () => {
  test('empty map produces zero pollution everywhere', () => {
    const map = createTestMap(16)
    const pollution = new Uint8Array(16 * 16)
    calculatePollution(map, pollution)
    expect(pollution.every(v => v === 0)).toBe(true)
  })

  test('single ind.low building produces pollution decaying with distance', () => {
    const map = createTestMap(32)
    placeBuilding(map, 'ind.low', 10, 10) // amount 10, radius 3
    const pollution = new Uint8Array(32 * 32)
    calculatePollution(map, pollution)

    // At origin tile (dist 0): full amount = 10
    expect(pollution[10 * 32 + 10]).toBe(10)
    // At dist 1: 10 * (1 - 1/3) = 6.67 → 7
    expect(pollution[10 * 32 + 11]).toBeGreaterThanOrEqual(6)
    expect(pollution[10 * 32 + 11]).toBeLessThanOrEqual(7)
    // At dist 3 (edge of radius): 10 * (1 - 3/3) = 0
    expect(pollution[10 * 32 + 13]).toBe(0)
    // Beyond radius: 0
    expect(pollution[10 * 32 + 14]).toBe(0)
  })

  test('multi-tile building uses footprint-aware distance', () => {
    const map = createTestMap(32)
    // ind.high is 3x3, amount 40, radius 6
    placeBuilding(map, 'ind.high', 10, 10)
    const pollution = new Uint8Array(32 * 32)
    calculatePollution(map, pollution)

    // Tile at (13, 10) is 1 tile east of the 3x3 footprint (10-12, 10-12)
    // minDist to footprint = 1 (adjacent to x=12)
    // contribution = 40 * (1 - 1/6) ≈ 33
    const val = pollution[10 * 32 + 13]!
    expect(val).toBeGreaterThanOrEqual(32)
    expect(val).toBeLessThanOrEqual(34)
  })

  test('multiple sources are additive', () => {
    const map = createTestMap(32)
    placeBuilding(map, 'ind.low', 10, 10) // amount 10, radius 3
    placeBuilding(map, 'ind.low', 12, 10) // amount 10, radius 3
    const pollution = new Uint8Array(32 * 32)
    calculatePollution(map, pollution)

    // Tile at (11, 10) is equidistant from both — gets contribution from each
    const val = pollution[10 * 32 + 11]!
    expect(val).toBeGreaterThan(10) // more than a single source
  })

  test('values clamp to 255', () => {
    const map = createTestMap(32)
    // Stack several high-pollution buildings
    placeBuilding(map, 'ind.high', 10, 10)  // 40, radius 6
    placeBuilding(map, 'ind.high.b', 10, 14) // 48, radius 6
    placeBuilding(map, 'power.coal', 14, 10) // 20, radius 6
    const pollution = new Uint8Array(32 * 32)
    calculatePollution(map, pollution)

    // Check no values exceed 255
    for (let i = 0; i < pollution.length; i++) {
      expect(pollution[i]).toBeLessThanOrEqual(255)
    }
  })

  test('buildings with pollutionAmount 0 produce no pollution', () => {
    const map = createTestMap(16)
    placeBuilding(map, 'res.low', 5, 5) // residential — no pollution
    const pollution = new Uint8Array(16 * 16)
    calculatePollution(map, pollution)
    expect(pollution.every(v => v === 0)).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/pollution.test.ts`
Expected: FAIL — module `../simulation/pollution.js` not found

- [ ] **Step 3: Implement pollution propagation**

Create `packages/engine/src/simulation/pollution.ts`:

```ts
import type { GameMap } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

/**
 * Calculate pollution levels using linear decay from polluting buildings.
 * Distance is computed as minimum Manhattan distance to any tile of the building footprint.
 */
export function calculatePollution(map: GameMap, pollutionLevel: Uint8Array): void {
  const { width, height } = map

  // Clear
  pollutionLevel.fill(0)

  // Temporary float buffer for additive accumulation
  const buffer = new Float64Array(width * height)

  for (const building of map.buildings) {
    if (building.state !== 'active') continue
    const def = BUILDING_DEFS[building.defId]
    if (!def || def.pollutionAmount <= 0 || def.pollutionRadius <= 0) continue

    const { pollutionAmount, pollutionRadius } = def
    const bw = def.size.w
    const bh = def.size.h

    // Scan all tiles within Manhattan radius of building footprint
    const scanRadius = pollutionRadius + Math.max(bw, bh)
    for (let dy = -scanRadius; dy <= scanRadius; dy++) {
      for (let dx = -scanRadius; dx <= scanRadius; dx++) {
        const tx = building.x + dx
        const ty = building.y + dy
        if (tx < 0 || ty < 0 || tx >= width || ty >= height) continue

        // Minimum Manhattan distance to any footprint tile
        const clampedX = Math.max(building.x, Math.min(building.x + bw - 1, tx))
        const clampedY = Math.max(building.y, Math.min(building.y + bh - 1, ty))
        const dist = Math.abs(tx - clampedX) + Math.abs(ty - clampedY)

        if (dist > pollutionRadius) continue

        const contribution = pollutionAmount * Math.max(0, 1 - dist / pollutionRadius)
        buffer[ty * width + tx] += contribution
      }
    }
  }

  // Write clamped values to output
  for (let i = 0; i < buffer.length; i++) {
    pollutionLevel[i] = Math.min(255, Math.round(buffer[i]!))
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/pollution.test.ts`
Expected: PASS

- [ ] **Step 5: Integrate into Engine.ts monthly tick**

In `packages/engine/src/Engine.ts`, add import and call pollution before land values:

Add import at top:
```ts
import { calculatePollution } from './simulation/pollution.js'
```

In the monthly tick block (around line 179), insert before `calculateLandValues`:
```ts
calculatePollution(this.map, this.pollutionLevel)
```

So the sequence becomes:
```ts
this.demand = calculateDemand(...)
calculatePollution(this.map, this.pollutionLevel)       // NEW
calculateLandValues(this.map, this.powerGrid, this.pollutionLevel, this.crimeLevel, this.landValues, this.bldIdx)
calculateCrime(...)
```

- [ ] **Step 6: Run full test suite**

Run: `pnpm --filter @bitborough/engine exec vitest run`
Expected: All existing tests still pass

- [ ] **Step 7: Commit**

```bash
git add packages/engine/src/simulation/pollution.ts packages/engine/src/__tests__/pollution.test.ts packages/engine/src/Engine.ts
git commit -m "feat: add pollution propagation with linear decay from building footprints"
```

---

### Task 2: Park Distance Decay

**Files:**
- Modify: `packages/engine/src/simulation/desirability.ts:69,96-112`
- Modify: `packages/engine/src/__tests__/desirability.test.ts`

- [ ] **Step 1: Write failing test for park distance decay**

Add to `packages/engine/src/__tests__/desirability.test.ts`.

First, add import at top of file:
```ts
import { BuildingIndex } from '../building-index.js'
```

Then add the test:

```ts
describe('park distance decay', () => {
  test('park bonus decreases with Manhattan distance', () => {
    const map = createTestMap(16)
    const layers = makeLayers(16 * 16)
    // Power the area and add road
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        layers.powerGrid[y * 16 + x] = 1
        map.infrastructure[y * 16 + x] = 0b1 // Road
      }

    // Place a park at (8, 8)
    map.buildings.push({
      id: 'park-1', defId: 'special.park', x: 8, y: 8,
      density: DensityLevel.Low, state: 'active', residents: 0, age: 0, powered: true,
    })

    const bldIdx = new BuildingIndex(map)

    // dist 1: should have higher bonus than dist 4
    const d1 = computeDesirability(ZoneType.Residential, 9, 8, map, layers.powerGrid, layers.crimeLevel, layers.fireCoverage, layers.pollutionLevel, bldIdx)
    const d4 = computeDesirability(ZoneType.Residential, 8, 4, map, layers.powerGrid, layers.crimeLevel, layers.fireCoverage, layers.pollutionLevel, bldIdx)
    const d5 = computeDesirability(ZoneType.Residential, 8, 3, map, layers.powerGrid, layers.crimeLevel, layers.fireCoverage, layers.pollutionLevel, bldIdx)

    expect(d1).toBeGreaterThan(d4) // closer = more bonus
    expect(d4).toBeGreaterThan(d5) // dist 4 > dist 5
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/desirability.test.ts -t "park distance decay"`
Expected: FAIL (d1 === d4 because current bonus is binary)

- [ ] **Step 3: Implement park distance decay**

In `packages/engine/src/simulation/desirability.ts`:

Replace `hasParkNearby` call in `residentialDesirability()` (line 69):
```ts
// Old:
if (hasParkNearby(x, y, map, bldIdx)) score += RES_PARK_BONUS
// New:
score += parkDesirabilityBonus(x, y, map, bldIdx)
```

Add the new function (can replace the old `hasParkNearby` since it's no longer called):
```ts
function parkDesirabilityBonus(x: number, y: number, map: GameMap, bldIdx?: BuildingIndex): number {
  let best = 0
  if (bldIdx) {
    for (let dy = -PARK_RADIUS; dy <= PARK_RADIUS; dy++) {
      for (let dx = -PARK_RADIUS; dx <= PARK_RADIUS; dx++) {
        const dist = Math.abs(dx) + Math.abs(dy)
        if (dist > PARK_RADIUS) continue
        const b = bldIdx.get(x + dx, y + dy)
        if (b && b.defId === 'special.park' && b.state === 'active') {
          const bonus = RES_PARK_BONUS * (1 - dist / PARK_RADIUS)
          if (bonus > best) best = bonus
        }
      }
    }
    return best
  }
  for (const b of map.buildings) {
    if (b.defId !== 'special.park' || b.state !== 'active') continue
    const dist = Math.abs(b.x - x) + Math.abs(b.y - y)
    if (dist <= PARK_RADIUS) {
      const bonus = RES_PARK_BONUS * (1 - dist / PARK_RADIUS)
      if (bonus > best) best = bonus
    }
  }
  return best
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/desirability.test.ts`
Expected: PASS (all existing + new test)

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/desirability.ts packages/engine/src/__tests__/desirability.test.ts
git commit -m "feat: park desirability bonus decays with Manhattan distance"
```

---

### Task 3: Logistic Fill Deceleration

**Files:**
- Modify: `packages/engine/src/simulation/density.ts:175-177`
- Modify: `packages/engine/src/__tests__/density.test.ts`

- [ ] **Step 1: Write failing test**

Add to `packages/engine/src/__tests__/density.test.ts`:

```ts
describe('logistic fill deceleration', () => {
  test('fill rate decreases as occupancy increases', () => {
    // Build a scenario where a building fills over multiple months
    // At high occupancy, monthly resident gain should be smaller
    const map = createTestMap(32)
    // ... (set up powered, zoned, road-connected tile with res.low building at 0 residents)
    // Run multiple months and track residents
    // Verify: resident gain in month 1 > resident gain when building is 80% full
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/density.test.ts -t "logistic fill"`
Expected: FAIL (fill rate is constant)

- [ ] **Step 3: Implement logistic fill**

In `packages/engine/src/simulation/density.ts`, modify the fill/drain loop (around line 175-177):

```ts
// Old:
const rate = target > building.residents ? FILL_RATE : DRAIN_RATE

// New:
const occupancyRatio = def.capacity > 0 ? building.residents / def.capacity : 0
const effectiveFillRate = FILL_RATE * (1 - occupancyRatio)
const rate = target > building.residents ? effectiveFillRate : DRAIN_RATE
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/density.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/density.ts packages/engine/src/__tests__/density.test.ts
git commit -m "feat: logistic fill rate decelerates as buildings approach capacity"
```

---

### Task 4: BPR Congestion-Weighted A*

**Files:**
- Modify: `packages/engine/src/road-graph.ts:37-79`
- Modify: `packages/engine/src/__tests__/road-graph.test.ts`
- Modify: `packages/engine/src/simulation/citizens.ts` (thread `trafficDensity` to `astar()` calls)

- [ ] **Step 1: Write failing test for BPR routing**

Add to `packages/engine/src/__tests__/road-graph.test.ts`:

```ts
describe('BPR congestion-weighted routing', () => {
  test('prefers uncongested route over shorter congested route', () => {
    // Build a grid with two paths between A and B:
    // Path 1: 5 tiles, heavy traffic (density 200)
    // Path 2: 7 tiles, no traffic (density 0)
    // With BPR weighting, path 2 should be chosen despite being longer
    const map = createTestMap(16)
    // ... set up road grid ...
    const graph = buildRoadGraph(map)
    const trafficDensity = new Uint8Array(16 * 16)
    // Set heavy traffic on short path tiles
    // ...
    const route = astar(graph, startIdx, goalIdx, 16, undefined, trafficDensity)
    expect(route).not.toBeNull()
    // Verify route avoids the congested tiles
  })

  test('without trafficDensity, uses uniform cost (backward compatible)', () => {
    const map = createTestMap(16)
    // ... set up roads ...
    const graph = buildRoadGraph(map)
    const route = astar(graph, startIdx, goalIdx, 16)
    expect(route).not.toBeNull()
    // Should pick shortest path as before
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/road-graph.test.ts -t "BPR"`
Expected: FAIL (astar doesn't accept trafficDensity param)

- [ ] **Step 3: Implement BPR edge cost in astar()**

In `packages/engine/src/road-graph.ts`:

Add the edge cost function:
```ts
const TRAFFIC_CAPACITY = 100

function edgeCost(tile: number, trafficDensity?: Uint8Array): number {
  if (!trafficDensity) return 1
  const v = trafficDensity[tile]!
  const vc = v / TRAFFIC_CAPACITY
  return 1 + 0.15 * vc * vc * vc * vc  // BPR: 1 + 0.15 * (v/c)^4
}
```

Update `astar()` signature and edge cost:
```ts
export function astar(
  graph: RoadGraph,
  start: number,
  goal: number,
  mapWidth: number,
  maxLength = MAX_ROUTE_LENGTH,
  trafficDensity?: Uint8Array,
): number[] | null {
  // ... existing code ...
  // Change line 68:
  // Old: const tentativeG = g + 1
  // New:
  const tentativeG = g + edgeCost(neighbor, trafficDensity)
  // ... rest unchanged ...
}
```

- [ ] **Step 4: Run road-graph tests**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/road-graph.test.ts`
Expected: PASS

- [ ] **Step 5: Thread trafficDensity through citizens.ts**

In `packages/engine/src/simulation/citizens.ts`:

Update `findNearestBuilding` to accept and forward `trafficDensity`:
```ts
function findNearestBuilding(
  map: GameMap,
  graph: RoadGraph,
  fromRoad: number,
  filter: (def: BuildingDef) => boolean,
  trafficDensity?: Uint8Array,  // new
): { buildingId: string; accessRoad: number; route: number[] } | null {
  // ... existing code ...
  const route = astar(graph, fromRoad, access, map.width, undefined, trafficDensity)
  // ... rest unchanged ...
}
```

Update `replanRoute` similarly:
```ts
function replanRoute(
  agent: Citizen,
  map: GameMap,
  graph: RoadGraph,
  currentAccessRoad: number | null,
  filter: (def: BuildingDef) => boolean,
  trafficDensity?: Uint8Array,  // new
): { buildingId: string | null; accessRoad: number | null; route: number[] } {
  if (currentAccessRoad !== null) {
    const route = astar(graph, agent.homeAccessRoad, currentAccessRoad, map.width, undefined, trafficDensity)
    // ...
  }
  const match = findNearestBuilding(map, graph, agent.homeAccessRoad, filter, trafficDensity)
  // ...
}
```

Update `replanStaleRoutes` to accept and forward `trafficDensity`:
```ts
export function replanStaleRoutes(registry: CitizenRegistry, map: GameMap, graph: RoadGraph, trafficDensity?: Uint8Array): void {
  for (const agent of registry.agents) {
    if (agent.homeWorkRouteStale) {
      const result = replanRoute(agent, map, graph, agent.workAccessRoad, d => d.jobs > 0, trafficDensity)
      // ...
    }
    if (agent.homeCommerceRouteStale) {
      const result = replanRoute(agent, map, graph, agent.commerceAccessRoad, d => d.category === BuildingCategory.Commercial, trafficDensity)
      // ...
    }
  }
}
```

Update `createAgent` to accept and forward `trafficDensity`:
```ts
function createAgent(map, graph, building, trafficDensity?): Citizen {
  // ... existing code ...
  // Forward trafficDensity to findNearestBuilding calls:
  const work = findNearestBuilding(map, graph, homeRoad, d => d.jobs > 0, trafficDensity)
  const commerce = findNearestBuilding(map, graph, homeRoad, d => d.category === BuildingCategory.Commercial, trafficDensity)
  // ... rest unchanged ...
}
```

Update `syncAgentsForBuilding` to accept and forward `trafficDensity`:
```ts
export function syncAgentsForBuilding(registry, map, graph, building, trafficDensity?): void {
  // ... existing code ...
  // Forward trafficDensity to createAgent calls
}
```

Update `citizenMonthlyTick` to pass `trafficDensity` to `replanStaleRoutes`:
```ts
export function citizenMonthlyTick(...): void {
  // Old:
  replanStaleRoutes(registry, map, graph)
  // New:
  replanStaleRoutes(registry, map, graph, trafficDensity)
  // ... rest unchanged ...
}
```

Update all callers of `syncAgentsForBuilding` in `Engine.ts` to pass `this.trafficDensity`.

- [ ] **Step 6: Run full test suite**

Run: `pnpm --filter @bitborough/engine exec vitest run`
Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add packages/engine/src/road-graph.ts packages/engine/src/__tests__/road-graph.test.ts packages/engine/src/simulation/citizens.ts
git commit -m "feat: BPR congestion-weighted A* routing — agents avoid congested roads"
```

---

### Task 5: Variable Construction Time

**Files:**
- Modify: `packages/engine/src/simulation/density.ts:299-303`
- Modify: `packages/engine/src/__tests__/density.test.ts`

- [ ] **Step 1: Write failing test**

Add to `packages/engine/src/__tests__/density.test.ts`:

```ts
describe('variable construction time', () => {
  test('high-density upgrade takes longer than medium', () => {
    // Set up a building being upgraded to high density
    // Verify constructionMonthsRemaining is 4, not 2
  })

  test('medium-density upgrade takes 2 months', () => {
    // Verify constructionMonthsRemaining is 2 for medium target
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Expected: FAIL (construction time is always 2)

- [ ] **Step 3: Implement variable construction time**

In `packages/engine/src/simulation/density.ts`:

Add lookup and helper before `startConstruction`:
```ts
const CONSTRUCTION_MONTHS: Record<number, number> = {
  [DensityLevel.Low]: 1,
  [DensityLevel.Medium]: 2,
  [DensityLevel.High]: 4,
}

function constructionTime(targetDefId: string): number {
  const def = BUILDING_DEFS[targetDefId]
  if (!def) return 2
  return CONSTRUCTION_MONTHS[def.density] ?? 2
}
```

Modify `startConstruction`:
```ts
function startConstruction(building: Building, targetDefId: string): void {
  building.state = 'under_construction'
  building.upgradingToDefId = targetDefId
  building.constructionMonthsRemaining = constructionTime(targetDefId)
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/density.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/density.ts packages/engine/src/__tests__/density.test.ts
git commit -m "feat: variable construction time — high-density takes 4 months, medium 2, low 1"
```

---

### Task 6: Vacancy Rate Feedback

**Files:**
- Modify: `packages/engine/src/simulation/demand.ts`
- Modify: `packages/engine/src/__tests__/demand.test.ts`

- [ ] **Step 1: Write failing test**

Add to `packages/engine/src/__tests__/demand.test.ts`:

```ts
describe('vacancy rate feedback', () => {
  test('high vacancy suppresses residential demand', () => {
    const map = createTestMap(32)
    // Place residential buildings with high capacity but low residents
    // (simulate high vacancy > 8%)
    // ...
    const demand = calculateDemand(map, 0.07)
    // demand.residential should be lower than with full occupancy
  })

  test('vacancy below 8% has no effect', () => {
    const map = createTestMap(32)
    // Place buildings with ~95% occupancy
    // ...
    const demandFull = calculateDemand(map, 0.07)
    // Should be same as baseline (no penalty)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Expected: FAIL (no vacancy tracking exists)

- [ ] **Step 3: Implement vacancy feedback**

In `packages/engine/src/simulation/demand.ts`:

Add helper functions:
```ts
function sumResidentialCapacity(map: GameMap): number {
  let total = 0
  for (const b of map.buildings) {
    if (!b.defId.startsWith('res') || b.state !== 'active') continue
    total += BUILDING_DEFS[b.defId]?.capacity ?? 0
  }
  return total
}

function sumResidentialResidents(map: GameMap): number {
  let total = 0
  for (const b of map.buildings) {
    if (!b.defId.startsWith('res') || b.state !== 'active') continue
    total += b.residents
  }
  return total
}
```

In `calculateDemand`, after citizen signals block (before final clamp):
```ts
// Vacancy rate feedback: high vacancy suppresses residential demand
const totalCapacity = sumResidentialCapacity(map)
const totalResidents = sumResidentialResidents(map)
const vacancy = totalCapacity > 0 ? 1 - totalResidents / totalCapacity : 0
if (vacancy > 0.08) {
  const vacancyPenalty = Math.min(0.5, (vacancy - 0.08) * 3)
  rDemand -= vacancyPenalty
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/demand.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/demand.ts packages/engine/src/__tests__/demand.test.ts
git commit -m "feat: vacancy rate above 8% dampens residential demand"
```

---

### Task 7: Zone Boundary Effects

**Files:**
- Modify: `packages/engine/src/simulation/desirability.ts`
- Modify: `packages/engine/src/__tests__/desirability.test.ts`

- [ ] **Step 1: Write failing test**

Add to `packages/engine/src/__tests__/desirability.test.ts`:

```ts
describe('zone boundary effects', () => {
  test('commercial building nearby boosts residential desirability', () => {
    const map = createTestMap(16)
    const layers = makeLayers(16 * 16)
    // Power and road everywhere
    for (let i = 0; i < 16 * 16; i++) { layers.powerGrid[i] = 1; map.infrastructure[i] = 0b1 }

    // Place active commercial building at (8, 8)
    map.buildings.push({
      id: 'com-1', defId: 'com.low', x: 8, y: 8,
      density: DensityLevel.Low, state: 'active', residents: 0, age: 0, powered: true,
    })
    const bldIdx = new BuildingIndex(map)

    const withCom = computeDesirability(ZoneType.Residential, 9, 8, map, layers.powerGrid, layers.crimeLevel, layers.fireCoverage, layers.pollutionLevel, bldIdx)
    const withoutCom = computeDesirability(ZoneType.Residential, 9, 8, map, layers.powerGrid, layers.crimeLevel, layers.fireCoverage, layers.pollutionLevel)

    expect(withCom).toBeGreaterThan(withoutCom)
  })

  test('industrial building nearby penalizes residential desirability', () => {
    const map = createTestMap(16)
    const layers = makeLayers(16 * 16)
    for (let i = 0; i < 16 * 16; i++) { layers.powerGrid[i] = 1; map.infrastructure[i] = 0b1 }

    map.buildings.push({
      id: 'ind-1', defId: 'ind.low', x: 8, y: 8,
      density: DensityLevel.Low, state: 'active', residents: 0, age: 0, powered: true,
    })
    const bldIdx = new BuildingIndex(map)

    const withInd = computeDesirability(ZoneType.Residential, 9, 8, map, layers.powerGrid, layers.crimeLevel, layers.fireCoverage, layers.pollutionLevel, bldIdx)
    const withoutInd = computeDesirability(ZoneType.Residential, 9, 8, map, layers.powerGrid, layers.crimeLevel, layers.fireCoverage, layers.pollutionLevel)

    expect(withInd).toBeLessThan(withoutInd)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Expected: FAIL (no zone boundary effect exists)

- [ ] **Step 3: Implement zone boundary effects**

In `packages/engine/src/simulation/desirability.ts`:

Add constants and function:
```ts
const ZONE_BOUNDARY_RADIUS = 3
const COM_ADJACENCY_BONUS = 0.10
const IND_ADJACENCY_PENALTY = 0.15

function zoneBoundaryEffect(x: number, y: number, map: GameMap, bldIdx?: BuildingIndex): number {
  if (!bldIdx) return 0
  let effect = 0
  let hasCommercial = false
  let hasIndustrial = false

  for (let dy = -ZONE_BOUNDARY_RADIUS; dy <= ZONE_BOUNDARY_RADIUS; dy++) {
    for (let dx = -ZONE_BOUNDARY_RADIUS; dx <= ZONE_BOUNDARY_RADIUS; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > ZONE_BOUNDARY_RADIUS) continue
      const b = bldIdx.get(x + dx, y + dy)
      if (!b || b.state !== 'active') continue
      const def = BUILDING_DEFS[b.defId]
      if (!def) continue
      if (def.category === BuildingCategory.Commercial && !hasCommercial) {
        hasCommercial = true
        effect += COM_ADJACENCY_BONUS
      }
      if (def.category === BuildingCategory.Industrial && !hasIndustrial) {
        hasIndustrial = true
        effect -= IND_ADJACENCY_PENALTY
      }
      if (hasCommercial && hasIndustrial) break
    }
    if (hasCommercial && hasIndustrial) break
  }
  return effect
}
```

Add import for `BuildingCategory` at top if not already imported.

In `residentialDesirability()`, add before the final clamp:
```ts
score += zoneBoundaryEffect(x, y, map, bldIdx)
```

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/desirability.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/desirability.ts packages/engine/src/__tests__/desirability.test.ts
git commit -m "feat: zone boundary effects — commercial boosts, industrial penalizes residential"
```

---

### Task 8: Sprawl Penalty

**Files:**
- Modify: `packages/engine/src/simulation/budget.ts:62-73`
- Modify: `packages/engine/src/__tests__/budget.test.ts`

- [ ] **Step 1: Write failing test**

Add to `packages/engine/src/__tests__/budget.test.ts`:

```ts
describe('sprawl penalty', () => {
  test('low population with many buildings increases road maintenance', () => {
    // Set up a city with low population but spread-out development
    // Verify road maintenance is multiplied above 1.0
  })

  test('dense city (high pop, few buildings) has no sprawl penalty', () => {
    // Set up a city with high population, few large buildings
    // Verify road maintenance multiplier is 1.0
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Expected: FAIL (no sprawl multiplier)

- [ ] **Step 3: Implement sprawl penalty**

In `packages/engine/src/simulation/budget.ts`:

Add a separate `footprintTileCount` alongside the existing `developedTileCount` (which is used for tax calculation — do NOT change it):
```ts
// In the existing building loop, add:
let footprintTileCount = 0
// ... inside the loop:
footprintTileCount += (def.size.w * def.size.h)
```

After the existing `maintenanceCosts` object is built and `total` is computed, apply the sprawl multiplier:
```ts
const SPRAWL_THRESHOLD = 0.05
const sprawlRatio = population > 0 ? footprintTileCount / population : 0
const sprawlMultiplier = sprawlRatio > SPRAWL_THRESHOLD
  ? 1 + (sprawlRatio - SPRAWL_THRESHOLD) * 4
  : 1.0

if (sprawlMultiplier > 1) {
  maintenanceCosts.roads = Math.round(maintenanceCosts.roads * sprawlMultiplier)
  maintenanceCosts.powerLines = Math.round(maintenanceCosts.powerLines * sprawlMultiplier)
  maintenanceCosts.total = maintenanceCosts.roads + maintenanceCosts.rails + maintenanceCosts.powerLines + maintenanceCosts.powerPlants
}
```

This preserves the existing `developedTileCount` for the tax income calculation and the existing rounding behavior.

- [ ] **Step 4: Run tests**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/budget.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/budget.ts packages/engine/src/__tests__/budget.test.ts
git commit -m "feat: sprawl penalty — road/powerline maintenance scales with land-per-capita"
```

---

### Task 9: Full Integration Test

**Files:**
- Modify: `packages/engine/src/__tests__/integration.test.ts` (optional)

- [ ] **Step 1: Run full engine test suite**

Run: `pnpm --filter @bitborough/engine exec vitest run`
Expected: All tests pass

- [ ] **Step 2: Run typecheck**

Run: `pnpm --filter @bitborough/engine typecheck`
Expected: No errors

- [ ] **Step 3: Run workspace-wide typecheck**

Run: `pnpm run typecheck` (or `pnpm -r typecheck`)
Expected: No errors

- [ ] **Step 4: Final commit if any fixups needed**

```bash
git add -A
git commit -m "chore: integration fixes for simulation quick wins"
```
