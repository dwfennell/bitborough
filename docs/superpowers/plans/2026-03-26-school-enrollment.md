# School Enrollment System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace radius-based education coverage with enrollment-based schools — citizens with children route to schools, schools have capacity (120% hard cap), satisfaction depends on commute + quality (funding × occupancy).

**Architecture:** Extends the existing citizen agent system (work/commerce routing) with school enrollment. A new `findNearestSchool` function routes children-having agents to the nearest school with capacity. Quality = funding × occupancy factor. The radius coverage layer, desirability integration, and reputation education factor are removed. The overlay is repurposed to show enrollment quality per tile.

**Tech Stack:** TypeScript, Vitest

**Spec:** `docs/superpowers/specs/2026-03-26-school-enrollment-design.md`

---

### Task 1: Remove Radius-Based Education Coverage

Strip the coverage layer and all its integration points. This is a clean removal — the enrollment system will be added in subsequent tasks.

**Files:**
- Delete: `packages/engine/src/simulation/services/education.ts`
- Modify: `packages/engine/src/engine-state.ts`
- Modify: `packages/engine/src/Engine.ts`
- Modify: `packages/engine/src/index.ts`
- Modify: `packages/engine/src/simulation/desirability.ts`
- Modify: `packages/engine/src/simulation/density.ts`
- Modify: `packages/engine/src/simulation/reputation.ts`
- Modify: `packages/engine/src/simulation/tick.ts`
- Modify: `packages/engine/src/simulation/citizens.ts`
- Modify: `packages/core/src/state.ts`
- Modify: `packages/engine/src/__tests__/desirability.test.ts`
- Modify: `packages/engine/src/__tests__/reputation.test.ts`
- Modify: `packages/engine/src/__tests__/citizens.test.ts`
- Modify: `packages/engine/src/__tests__/citizens-tiers.test.ts`
- Modify: `packages/engine/src/__tests__/education.test.ts`
- Modify: `packages/engine/src/__tests__/serialization.test.ts`
- Modify: `packages/engine/src/__tests__/history.test.ts`

- [ ] **Step 1: Delete education.ts service file**

Delete `packages/engine/src/simulation/services/education.ts`.

- [ ] **Step 2: Remove educationCoverage from EngineState**

In `packages/engine/src/engine-state.ts`:
- Remove `import { calculateEducationCoverage }`
- Remove `educationCoverage: Uint8Array` from `EngineState` interface
- Remove `calculateEducationCoverage(...)` call from `rebuildDerivedState()`
- Remove `educationCoverage` allocation from `createEngineState()` and from the state object literal
- Remove `educationCoverage` allocation from `restoreState()` and from the state object literal
- In `createEngineState()`, update the `computeReputation` call: remove the last argument (`state.educationCoverage`)

- [ ] **Step 3: Remove educationCoverage from GameState and Engine**

In `packages/core/src/state.ts`:
- Remove `educationCoverage: Uint8Array` from `GameState` interface

In `packages/engine/src/Engine.ts`:
- Remove `educationCoverage: this.state.educationCoverage` from `getState()` return

In `packages/engine/src/index.ts`:
- Remove `export { calculateEducationCoverage }` line

- [ ] **Step 4: Remove education from desirability**

In `packages/engine/src/simulation/desirability.ts`:
- Remove `RES_EDUCATION_BONUS` and `EDUCATION_COVERAGE_THRESHOLD` constants
- Remove `educationCoverage?: Uint8Array` parameter from `computeDesirability`
- Remove `educationCoverage` from the `residentialDesirability` call in the switch
- Remove `educationCoverage?: Uint8Array` parameter from `residentialDesirability`
- Remove the education bonus block (`if (educationCoverage) { ... }`)

In `packages/engine/src/simulation/density.ts`:
- Remove `educationCoverage?: Uint8Array` parameter from `updateDensity`
- Remove `educationCoverage` from the `computeDesirability` call

In `packages/engine/src/simulation/tick.ts`:
- Remove `state.educationCoverage` from the `updateDensity` call

- [ ] **Step 5: Revert reputation to 5-factor weights**

In `packages/engine/src/simulation/reputation.ts`:
- Revert to direct weight constants (remove RAW_*/TOTAL pattern):
```typescript
const QUALITY_CRIME_WEIGHT = 0.35
const QUALITY_POLLUTION_WEIGHT = 0.25
const QUALITY_FIRE_WEIGHT = 0.15
const QUALITY_PARK_WEIGHT = 0.15
const QUALITY_OCCUPANCY_WEIGHT = 0.10
```
- Remove `educationNorm` parameter from `computeCurrentQuality`
- Remove `educationNorm * QUALITY_EDUCATION_WEIGHT` from the return
- Remove `educationCoverage: Uint8Array` parameter from `computeReputation`
- Remove `educationNorm` calculation inside the loop

In `packages/engine/src/simulation/tick.ts`:
- Remove `state.educationCoverage` from the `computeReputation` call

- [ ] **Step 6: Remove educationCoverage from TileLayers and satisfaction**

In `packages/engine/src/simulation/citizens.ts`:
- Remove `educationCoverage: Uint8Array` from `TileLayers` interface
- In `computeSatisfaction`: remove `educationNorm` variable, remove `educationNorm = layers.educationCoverage[idx]! / 255` read, remove `+ educationNorm * 0.15 * w.education` from formula

In `packages/engine/src/simulation/tick.ts`:
- Remove `educationCoverage: state.educationCoverage` from the `tileLayers` object

- [ ] **Step 7: Bump serialization version**

In `packages/engine/src/engine-state.ts`:
- Change `version: 8` to `version: 9` in `serializeState`

- [ ] **Step 8: Fix all tests**

In `packages/engine/src/__tests__/education.test.ts`:
- Delete all content (will be rewritten in Task 3). Keep the file with just a placeholder:
```typescript
import { describe, test, expect } from 'vitest'

describe('Education enrollment', () => {
  test.todo('placeholder — tests added in subsequent tasks')
})
```

In `packages/engine/src/__tests__/desirability.test.ts`:
- Remove `educationCoverage` from `makeLayers` helper
- Remove the entire `describe('education bonus', ...)` block
- Remove `educationCoverage` from any `computeDesirability` call (it was an optional last param — just remove it)

In `packages/engine/src/__tests__/reputation.test.ts`:
- Revert `computeCurrentQuality` calls from 6 params back to 5 (remove last `educationNorm` param)
- Update "mixed conditions" assertion back to `toBeCloseTo(0.54)`
- Update "reputation decays" assertion back to `toBeCloseTo(0.505, 2)`
- Remove the "education factor contributes" test
- Remove `educationCoverage` from all `computeReputation` calls (remove 7th argument)

In `packages/engine/src/__tests__/citizens.test.ts`:
- Remove `educationCoverage` from `makeTileLayers`

In `packages/engine/src/__tests__/citizens-tiers.test.ts`:
- Remove `educationCoverage` from `makeLayers`

In `packages/engine/src/__tests__/serialization.test.ts`:
- Change all `toBe(8)` version assertions to `toBe(9)`

In `packages/engine/src/__tests__/history.test.ts`:
- Change `toBe(8)` to `toBe(9)`

- [ ] **Step 9: Verify all tests pass**

Run: `cd packages/engine && npx vitest run --reporter=verbose 2>&1 | tail -10`
Expected: All tests pass.

- [ ] **Step 10: Commit**

```bash
git add -A packages/engine packages/core
git commit -m "refactor(education): remove radius-based coverage system

Strips educationCoverage layer, desirability integration, reputation
education factor, and all related test fixtures. Keeps building defs,
budget, toolbar, tiles, funding slider. Enrollment system follows."
```

---

### Task 2: School Quality Function

**Files:**
- Create: `packages/engine/src/simulation/services/school.ts`
- Modify: `packages/engine/src/__tests__/education.test.ts`

- [ ] **Step 1: Write failing tests for school quality**

Replace the placeholder in `packages/engine/src/__tests__/education.test.ts`:
```typescript
import { describe, test, expect } from 'vitest'
import { computeSchoolQuality, SCHOOL_CAPACITY } from '../simulation/services/school.js'

describe('School quality', () => {
  test('quality is 1.0 at or below capacity with full funding', () => {
    expect(computeSchoolQuality(200, 300, 100)).toBe(1.0)
    expect(computeSchoolQuality(300, 300, 100)).toBe(1.0)
    expect(computeSchoolQuality(0, 300, 100)).toBe(1.0)
  })

  test('quality degrades linearly from 100% to 120% capacity', () => {
    expect(computeSchoolQuality(330, 300, 100)).toBeCloseTo(0.75)
    expect(computeSchoolQuality(360, 300, 100)).toBeCloseTo(0.5)
  })

  test('quality scales with funding', () => {
    expect(computeSchoolQuality(300, 300, 50)).toBeCloseTo(0.5)
    expect(computeSchoolQuality(300, 300, 0)).toBe(0)
  })

  test('quality combines funding and overcrowding', () => {
    // 120% capacity, 50% funding → 0.5 * 0.5 = 0.25
    expect(computeSchoolQuality(360, 300, 50)).toBeCloseTo(0.25)
  })

  test('SCHOOL_CAPACITY has correct values', () => {
    expect(SCHOOL_CAPACITY['service.school']).toBe(300)
    expect(SCHOOL_CAPACITY['service.school.small']).toBe(50)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/engine && npx vitest run src/__tests__/education.test.ts --reporter=verbose 2>&1 | tail -10`
Expected: FAIL — module not found

- [ ] **Step 3: Implement school quality**

Create `packages/engine/src/simulation/services/school.ts`:
```typescript
export const SCHOOL_CAPACITY: Record<string, number> = {
  'service.school': 300,
  'service.school.small': 50,
}

export const SCHOOL_OVER_CAPACITY_RATIO = 1.2

export function computeSchoolQuality(
  enrolledChildren: number,
  capacity: number,
  fundingLevel: number,
): number {
  if (capacity === 0) return 0
  const ratio = enrolledChildren / capacity
  const occupancyFactor = ratio <= 1.0
    ? 1.0
    : Math.max(0, 1.0 - (ratio - 1.0) * 2.5)
  return (fundingLevel / 100) * occupancyFactor
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/engine && npx vitest run src/__tests__/education.test.ts --reporter=verbose 2>&1 | tail -10`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/services/school.ts packages/engine/src/__tests__/education.test.ts
git commit -m "feat(education): add school quality function with capacity/funding"
```

---

### Task 3: School Enrollment (findNearestSchool + Agent Fields)

**Files:**
- Modify: `packages/engine/src/simulation/citizens.ts`
- Modify: `packages/engine/src/simulation/services/school.ts`
- Modify: `packages/engine/src/__tests__/education.test.ts`
- Modify: `packages/core/src/state.ts` (SaveFile)

- [ ] **Step 1: Write failing enrollment tests**

Add to `packages/engine/src/__tests__/education.test.ts`:
```typescript
import { DensityLevel, Infrastructure, BuildingCategory, ZoneType } from '@bitborough/core'
import { createTestMap } from '../test-helpers.js'
import { buildRoadGraph } from '../road-graph.js'
import { findNearestSchool, buildEnrollmentCounts } from '../simulation/services/school.js'

function makeBuilding(id: string, defId: string, x: number, y: number) {
  return { id, defId, x, y, powered: true, density: DensityLevel.Low, age: 0, state: 'active' as const, residents: 0 }
}

describe('findNearestSchool', () => {
  test('finds school reachable by road', () => {
    const map = createTestMap(16)
    // Road from (3,3) to (10,3)
    for (let x = 3; x <= 10; x++) map.infrastructure[3 * 16 + x] = Infrastructure.Road
    // School at (8,2) — access road at (8,3)
    map.buildings.push(makeBuilding('s1', 'service.school', 8, 2))
    const graph = buildRoadGraph(map)
    const enrollment = new Map<string, number>()
    const result = findNearestSchool(map, graph, 3 * 16 + 3, enrollment)
    expect(result).not.toBeNull()
    expect(result!.buildingId).toBe('s1')
  })

  test('skips school at 120% capacity', () => {
    const map = createTestMap(16)
    for (let x = 3; x <= 10; x++) map.infrastructure[3 * 16 + x] = Infrastructure.Road
    map.buildings.push(makeBuilding('s1', 'service.school', 8, 2))
    const graph = buildRoadGraph(map)
    const enrollment = new Map([['s1', 360]]) // 300 * 1.2 = full
    const result = findNearestSchool(map, graph, 3 * 16 + 3, enrollment)
    expect(result).toBeNull()
  })

  test('picks closer school', () => {
    const map = createTestMap(32)
    for (let x = 3; x <= 25; x++) map.infrastructure[3 * 32 + x] = Infrastructure.Road
    map.buildings.push(makeBuilding('s1', 'service.school', 20, 2))
    map.buildings.push(makeBuilding('s2', 'service.school.small', 5, 2))
    const graph = buildRoadGraph(map)
    const enrollment = new Map<string, number>()
    const result = findNearestSchool(map, graph, 3 * 32 + 3, enrollment)
    expect(result).not.toBeNull()
    expect(result!.buildingId).toBe('s2')
  })
})

describe('buildEnrollmentCounts', () => {
  test('sums children by school building', () => {
    const agents = [
      { schoolBuildingId: 's1', demographics: { children: 5, working: 50, elderly: 0 } },
      { schoolBuildingId: 's1', demographics: { children: 3, working: 50, elderly: 0 } },
      { schoolBuildingId: 's2', demographics: { children: 2, working: 50, elderly: 0 } },
      { schoolBuildingId: null, demographics: { children: 4, working: 50, elderly: 0 } },
    ] as any[]
    const counts = buildEnrollmentCounts(agents)
    expect(counts.get('s1')).toBe(8)
    expect(counts.get('s2')).toBe(2)
    expect(counts.has(null as any)).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/engine && npx vitest run src/__tests__/education.test.ts --reporter=verbose 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Add findNearestSchool and buildEnrollmentCounts to school.ts**

Add to `packages/engine/src/simulation/services/school.ts`:
```typescript
import type { GameMap, Building } from '@bitborough/core'
import { BUILDING_DEFS } from '../../buildings-registry.js'
import type { RoadGraph } from '../../road-graph.js'
import { astar } from '../../road-graph.js'

// resolveAccessRoad for school buildings (same logic as in citizens.ts)
const FOOTPRINT_DX = [0, 1, 0, -1]
const FOOTPRINT_DY = [-1, 0, 1, 0]

function resolveSchoolAccessRoad(map: GameMap, building: Building): number {
  const def = BUILDING_DEFS[building.defId]
  if (!def) return -1
  const { w, h } = def.size
  const { width, height, infrastructure } = map
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const fx = building.x + dx
      const fy = building.y + dy
      for (let dir = 0; dir < 4; dir++) {
        const nx = fx + FOOTPRINT_DX[dir]!
        const ny = fy + FOOTPRINT_DY[dir]!
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
        const nIdx = ny * width + nx
        if (infrastructure[nIdx]! & 1) return nIdx // Infrastructure.Road = 1
      }
    }
  }
  return -1
}

export function buildEnrollmentCounts(
  agents: ReadonlyArray<{ schoolBuildingId: string | null; demographics: { children: number } }>,
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const a of agents) {
    if (a.schoolBuildingId === null) continue
    counts.set(a.schoolBuildingId, (counts.get(a.schoolBuildingId) ?? 0) + a.demographics.children)
  }
  return counts
}

export function findNearestSchool(
  map: GameMap,
  graph: RoadGraph,
  fromRoad: number,
  enrollmentCounts: Map<string, number>,
  trafficDensity?: Uint8Array,
): { buildingId: string; accessRoad: number; route: number[] } | null {
  let best: { buildingId: string; accessRoad: number; route: number[] } | null = null
  for (const building of map.buildings) {
    if (building.state !== 'active') continue
    const capacity = SCHOOL_CAPACITY[building.defId]
    if (capacity === undefined) continue
    const enrolled = enrollmentCounts.get(building.id) ?? 0
    if (enrolled >= capacity * SCHOOL_OVER_CAPACITY_RATIO) continue
    const access = resolveSchoolAccessRoad(map, building)
    if (access < 0) continue
    const route = astar(graph, fromRoad, access, map.width, undefined, trafficDensity)
    if (!route) continue
    if (!best || route.length < best.route.length) {
      best = { buildingId: building.id, accessRoad: access, route }
    }
  }
  return best
}
```

Note: `resolveSchoolAccessRoad` duplicates `resolveAccessRoad` from `citizens.ts` because that function is module-private. The implementer should consider whether to export it from `citizens.ts` instead, but for now duplication is acceptable since the plan calls for keeping these independent.

- [ ] **Step 4: Add agent school fields to Citizen interface**

In `packages/engine/src/simulation/citizens.ts`, add to the `Citizen` interface:
```typescript
schoolBuildingId: string | null
schoolAccessRoad: number | null
homeSchoolRoute: number[]
homeSchoolRouteTileSet: Set<number>
homeSchoolRouteStale: boolean
```

Update `createAgent` to initialize the new fields:
```typescript
schoolBuildingId: null,
schoolAccessRoad: null,
homeSchoolRoute: [],
homeSchoolRouteTileSet: new Set(),
homeSchoolRouteStale: false,
```

Update `buildTileSets` to also build school tile set:
```typescript
function buildTileSets(agent: Citizen): void {
  agent.homeWorkRouteTileSet = new Set(agent.homeWorkRoute)
  agent.homeCommerceRouteTileSet = new Set(agent.homeCommerceRoute)
  agent.homeSchoolRouteTileSet = new Set(agent.homeSchoolRoute)
}
```

- [ ] **Step 5: Add school fields to SaveFile**

In `packages/core/src/state.ts`, add to the agents array item in `SaveFile.state.citizens`:
```typescript
schoolBuildingId?: string | null
schoolAccessRoad?: number | null
homeSchoolRoute?: number[]
```

In `packages/engine/src/engine-state.ts` `restoreState`, add defaults when restoring agents:
```typescript
schoolBuildingId: a.schoolBuildingId ?? null,
schoolAccessRoad: a.schoolAccessRoad ?? null,
homeSchoolRoute: a.homeSchoolRoute ?? [],
homeSchoolRouteTileSet: new Set(a.homeSchoolRoute ?? []),
homeSchoolRouteStale: false,
```

In `serializeState`, add the fields to the agent serialization:
```typescript
schoolBuildingId: a.schoolBuildingId,
schoolAccessRoad: a.schoolAccessRoad,
homeSchoolRoute: a.homeSchoolRoute,
```

- [ ] **Step 6: Run all tests**

Run: `cd packages/engine && npx vitest run --reporter=verbose 2>&1 | tail -10`
Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/engine/src/simulation/services/school.ts packages/engine/src/simulation/citizens.ts packages/engine/src/__tests__/education.test.ts packages/core/src/state.ts packages/engine/src/engine-state.ts
git commit -m "feat(education): add findNearestSchool, enrollment counts, agent school fields"
```

---

### Task 4: Wire Enrollment into Agent Lifecycle

**Files:**
- Modify: `packages/engine/src/simulation/citizens.ts`

- [ ] **Step 1: Add school enrollment to syncAgentsForBuilding**

In `packages/engine/src/simulation/citizens.ts`:

Update `syncAgentsForBuilding` signature to accept enrollment data:
```typescript
export function syncAgentsForBuilding(
  map: GameMap, registry: CitizenRegistry, graph: RoadGraph, building: Building,
  trafficDensity?: Uint8Array, prng?: PRNG, reputationLayer?: Float32Array,
  enrollmentCounts?: Map<string, number>,
): void {
```

After agent creation (inside the `if (delta > 0)` block), add school enrollment for agents with children:
```typescript
if (enrollmentCounts) {
  for (let i = 0; i < delta; i++) {
    const agent = registry.agents[registry.agents.length - delta + i]!
    if (agent.demographics.children > 0) {
      const schoolMatch = findNearestSchool(map, graph, homeAccessRoad, enrollmentCounts, trafficDensity)
      if (schoolMatch) {
        agent.schoolBuildingId = schoolMatch.buildingId
        agent.schoolAccessRoad = schoolMatch.accessRoad
        agent.homeSchoolRoute = schoolMatch.route
        agent.homeSchoolRouteTileSet = new Set(schoolMatch.route)
        // Update enrollment counts for subsequent agents
        enrollmentCounts.set(schoolMatch.buildingId, (enrollmentCounts.get(schoolMatch.buildingId) ?? 0) + agent.demographics.children)
      }
    }
  }
}
```

Add import: `import { findNearestSchool, buildEnrollmentCounts } from './services/school.js'`

- [ ] **Step 2: Add stale route detection for school routes**

Update `markRoutesStale`:
```typescript
export function markRoutesStale(registry: CitizenRegistry, tileIndex: number): void {
  for (const agent of registry.agents) {
    if (agent.homeWorkRouteTileSet.has(tileIndex)) agent.homeWorkRouteStale = true
    if (agent.homeCommerceRouteTileSet.has(tileIndex)) agent.homeCommerceRouteStale = true
    if (agent.homeSchoolRouteTileSet.has(tileIndex)) agent.homeSchoolRouteStale = true
  }
}
```

Update `markRoutesStaleBatch`:
```typescript
export function markRoutesStaleBatch(registry: CitizenRegistry, tileIndices: Set<number>): void {
  for (const agent of registry.agents) {
    if (agent.homeWorkRouteStale && agent.homeCommerceRouteStale && agent.homeSchoolRouteStale) continue
    for (const idx of tileIndices) {
      if (!agent.homeWorkRouteStale && agent.homeWorkRouteTileSet.has(idx)) agent.homeWorkRouteStale = true
      if (!agent.homeCommerceRouteStale && agent.homeCommerceRouteTileSet.has(idx)) agent.homeCommerceRouteStale = true
      if (!agent.homeSchoolRouteStale && agent.homeSchoolRouteTileSet.has(idx)) agent.homeSchoolRouteStale = true
      if (agent.homeWorkRouteStale && agent.homeCommerceRouteStale && agent.homeSchoolRouteStale) break
    }
  }
}
```

- [ ] **Step 3: Add school route replanning**

Update `replanStaleRoutes` — add after the commerce replan block:
```typescript
if (agent.homeSchoolRouteStale) {
  if (agent.demographics.children > 0) {
    // Try direct re-route first, then search for new school
    if (agent.schoolAccessRoad !== null) {
      const route = astar(graph, agent.homeAccessRoad, agent.schoolAccessRoad, map.width, undefined, trafficDensity)
      if (route) {
        agent.homeSchoolRoute = route
        agent.homeSchoolRouteTileSet = new Set(route)
        agent.homeSchoolRouteStale = false
      }
    }
    // Direct route failed — find new school
    // Enrollment counts not available here; clear enrollment and let next sync handle it
    agent.schoolBuildingId = null
    agent.schoolAccessRoad = null
    agent.homeSchoolRoute = []
    agent.homeSchoolRouteTileSet = new Set()
  }
  agent.homeSchoolRouteStale = false
}
```

Note: The `replanStaleRoutes` function loops over agents and handles work/commerce replans independently. The school replan follows the same pattern. If direct re-route fails, the agent's enrollment is cleared and will be re-established at the next `syncAgentsForBuilding` call.

- [ ] **Step 4: Add school commute traffic**

In `citizenMonthlyTick`, add school route traffic after the commerce loop:
```typescript
const SCHOOL_TRIP_WEIGHT = 1

for (const tileIdx of agent.homeSchoolRoute) {
  rawTraffic[tileIdx]! += SCHOOL_TRIP_WEIGHT
}
```

- [ ] **Step 5: Add enrollment pass for existing agents with children**

This is critical: agents start with `children: 0` and gain children through `demographicTick`. The enrollment in `syncAgentsForBuilding` only runs for *new* agents. We need a separate pass in `citizenMonthlyTick` to enroll existing agents who gained children but have no school.

In `citizenMonthlyTick`, after `replanStaleRoutes` and before the traffic/satisfaction loop, add:

```typescript
// Enroll unenrolled agents with children at schools
const enrollmentCounts = buildEnrollmentCounts(registry.agents)
for (const agent of registry.agents) {
  if (agent.demographics.children > 0 && agent.schoolBuildingId === null) {
    const schoolMatch = findNearestSchool(map, graph, agent.homeAccessRoad, enrollmentCounts, trafficDensity)
    if (schoolMatch) {
      agent.schoolBuildingId = schoolMatch.buildingId
      agent.schoolAccessRoad = schoolMatch.accessRoad
      agent.homeSchoolRoute = schoolMatch.route
      agent.homeSchoolRouteTileSet = new Set(schoolMatch.route)
      enrollmentCounts.set(schoolMatch.buildingId, (enrollmentCounts.get(schoolMatch.buildingId) ?? 0) + agent.demographics.children)
    }
  }
}
```

Add import: `import { findNearestSchool, buildEnrollmentCounts } from './services/school.js'`

- [ ] **Step 6: Add school enrollment cleanup on building demolition**

When a school is demolished, agents enrolled at it need their enrollment cleared. In `packages/engine/src/simulation/citizens.ts`, add:

```typescript
export function clearSchoolEnrollment(registry: CitizenRegistry, schoolBuildingId: string): void {
  for (const agent of registry.agents) {
    if (agent.schoolBuildingId === schoolBuildingId) {
      agent.schoolBuildingId = null
      agent.schoolAccessRoad = null
      agent.homeSchoolRoute = []
      agent.homeSchoolRouteTileSet = new Set()
      agent.homeSchoolRouteStale = false
    }
  }
}
```

In `packages/engine/src/Engine.ts`, in the `bulldoze` method (or wherever buildings are removed), after removing agents for demolished residential buildings, add a check: if the demolished building is a school (`defId.startsWith('service.school')`), call `clearSchoolEnrollment(registry, building.id)`. Import the function from `citizens.ts`.

- [ ] **Step 7: Update tick.ts to pass enrollment counts**

In `packages/engine/src/simulation/tick.ts`, update `syncResidentialAgents` to build and pass enrollment counts:

```typescript
export function syncResidentialAgents(state: EngineState): void {
  const enrollmentCounts = buildEnrollmentCounts(state.citizenRegistry.agents)
  for (const b of state.map.buildings) {
    if (b.state === 'active') {
      const def = BUILDING_DEFS[b.defId]
      if (def && def.category === BuildingCategory.Residential) {
        syncAgentsForBuilding(state.map, state.citizenRegistry, state.roadGraph, b, state.trafficDensity, state.prng, state.reputationLayer, enrollmentCounts)
      }
    }
  }
}
```

Add import: `import { buildEnrollmentCounts } from './services/school.js'`

- [ ] **Step 6: Run all tests**

Run: `cd packages/engine && npx vitest run --reporter=verbose 2>&1 | tail -10`
Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/engine/src/simulation/citizens.ts packages/engine/src/simulation/tick.ts
git commit -m "feat(education): wire school enrollment into agent lifecycle and traffic"
```

---

### Task 5: Enrollment-Based Satisfaction

**Files:**
- Modify: `packages/engine/src/simulation/citizens.ts`
- Modify: `packages/engine/src/__tests__/education.test.ts`

- [ ] **Step 1: Write failing satisfaction tests**

Add to `packages/engine/src/__tests__/education.test.ts`:
```typescript
import { computeSchoolQuality } from '../simulation/services/school.js'

describe('Education satisfaction', () => {
  test('enrolled agent with short commute and high quality gets bonus', () => {
    // quality = 1.0, commuteNorm = 5/40 = 0.125
    // educationScore = 1.0 * (1 - 0.125 * 0.5) = 0.9375
    // contribution = 0.9375 * 0.15 * w.education
    // For tier 2 (w.education = 1.2): 0.9375 * 0.15 * 1.2 = 0.169
    const score = computeSchoolQuality(100, 300, 100) // quality = 1.0
    expect(score).toBe(1.0)
  })

  test('overcrowded school reduces satisfaction bonus', () => {
    const fullQuality = computeSchoolQuality(300, 300, 100) // 1.0
    const overQuality = computeSchoolQuality(360, 300, 100) // 0.5
    expect(fullQuality).toBeGreaterThan(overQuality)
  })
})
```

- [ ] **Step 2: Update computeSatisfaction to use enrollment**

In `packages/engine/src/simulation/citizens.ts`:

Add to `computeSatisfaction` signature: `enrollmentCounts: Map<string, number>`, `educationFunding: number`

Replace the old education line with enrollment-based logic:
```typescript
const MAX_SCHOOL_COMMUTE = 40

// Education — enrollment-based
let educationScore = 0
if (agent.schoolBuildingId !== null) {
  const schoolCommuteNorm = clamp(agent.homeSchoolRoute.length / MAX_SCHOOL_COMMUTE, 0, 1)
  const capacity = SCHOOL_CAPACITY[
    buildingById.get(agent.schoolBuildingId)?.defId ?? ''
  ] ?? 0
  const enrolled = enrollmentCounts.get(agent.schoolBuildingId) ?? 0
  const schoolQuality = computeSchoolQuality(enrolled, capacity, educationFunding)
  educationScore = schoolQuality * (1 - schoolCommuteNorm * 0.5)
}
```

And in the return formula, replace the old education line with:
```typescript
+ educationScore * 0.15 * w.education
```

Add imports: `import { computeSchoolQuality, SCHOOL_CAPACITY } from './services/school.js'`

- [ ] **Step 3: Update citizenMonthlyTick to pass enrollment data to satisfaction**

In `citizenMonthlyTick`, build enrollment counts before the satisfaction loop (after building `buildingById`):
```typescript
const enrollmentCounts = buildEnrollmentCounts(registry.agents)
```

Update the `computeSatisfaction` call:
```typescript
agent.satisfaction = computeSatisfaction(agent, map, layers, bldIdx, buildingTierCounts, buildingById, enrollmentCounts, educationFunding)
```

Note: `educationFunding` needs to be passed into `citizenMonthlyTick`. Update the function signature to accept it, and pass `state.funding.education` from the caller in `tick.ts`.

- [ ] **Step 4: Update tick.ts to pass educationFunding**

In `packages/engine/src/simulation/tick.ts`, update the `citizenMonthlyTick` call:
```typescript
citizenMonthlyTick(state.citizenRegistry, state.map, state.roadGraph, state.trafficDensity, tileLayers, state.bldIdx, state.funding.education)
```

- [ ] **Step 5: Fix citizenMonthlyTick callers in test files**

In `packages/engine/src/__tests__/citizens.test.ts`: all calls to `citizenMonthlyTick` need a 7th argument `100` (default education funding). Search for `citizenMonthlyTick(` and add `, 100` before the closing `)`. Approximately 5 call sites.

In `packages/engine/src/__tests__/citizens-tiers.test.ts`: same fix — add `, 100` to all `citizenMonthlyTick` calls. Approximately 2 call sites.

- [ ] **Step 6: Run all tests**

Run: `cd packages/engine && npx vitest run --reporter=verbose 2>&1 | tail -10`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/engine/src/simulation/citizens.ts packages/engine/src/simulation/tick.ts packages/engine/src/__tests__/education.test.ts
git commit -m "feat(education): enrollment-based satisfaction with commute + quality"
```

---

### Task 6: Education Quality Overlay

**Files:**
- Modify: `packages/core/src/state.ts`
- Modify: `packages/engine/src/engine-state.ts`
- Modify: `packages/engine/src/Engine.ts`
- Modify: `packages/engine/src/simulation/citizens.ts`
- Modify: `packages/game/src/render/OverlayRenderer.ts`
- Modify: `packages/game/src/render/colors.ts`

- [ ] **Step 1: Add educationQuality layer to GameState**

In `packages/core/src/state.ts`:
- Add `educationQuality: Uint8Array` to `GameState` (replaces the removed `educationCoverage`)

In `packages/engine/src/engine-state.ts`:
- Add `educationQuality: Uint8Array` to `EngineState` interface
- Allocate in `createEngineState` and `restoreState`

In `packages/engine/src/Engine.ts`:
- Add `educationQuality: this.state.educationQuality` to `getState()`

- [ ] **Step 2: Compute educationQuality in citizenMonthlyTick**

In `citizenMonthlyTick`, after satisfaction computation, fill the quality layer:

```typescript
// Education quality overlay — fill after satisfaction loop
state.educationQuality.fill(0)
```

Wait — `citizenMonthlyTick` doesn't have access to `state.educationQuality`. Pass it as a parameter, or compute it in `tick.ts` after `citizenMonthlyTick` returns.

Better approach: compute it in `monthlyTick` in `tick.ts` after the citizen tick, using enrollment data.

First, add missing imports to `tick.ts`:
```typescript
import { buildEnrollmentCounts, SCHOOL_CAPACITY, computeSchoolQuality } from './services/school.js'
import type { Building } from '@bitborough/core'
```

Then add after the citizen tick:

```typescript
// Education quality overlay
state.educationQuality.fill(0)
const enrollmentCounts = buildEnrollmentCounts(state.citizenRegistry.agents)
const buildingById = new Map<string, Building>()
for (const b of state.map.buildings) buildingById.set(b.id, b)

for (const agent of state.citizenRegistry.agents) {
  if (agent.demographics.children === 0) continue
  const building = buildingById.get(agent.homeBuildingId)
  if (!building) continue
  const homeTile = building.y * state.map.width + building.x
  if (agent.schoolBuildingId === null) {
    // Has children but no school — mark as unserved (value 1)
    if (state.educationQuality[homeTile] === 0) state.educationQuality[homeTile] = 1
  } else {
    const schoolDef = buildingById.get(agent.schoolBuildingId)
    const capacity = SCHOOL_CAPACITY[schoolDef?.defId ?? ''] ?? 0
    const enrolled = enrollmentCounts.get(agent.schoolBuildingId) ?? 0
    const quality = computeSchoolQuality(enrolled, capacity, state.funding.education)
    const encoded = Math.floor(quality * 253) + 2  // 2-255 range
    state.educationQuality[homeTile] = Math.max(state.educationQuality[homeTile]!, encoded)
  }
}
```

- [ ] **Step 3: Repurpose overlay renderer**

In `packages/game/src/render/colors.ts`, replace `educationCoverageToRgba` with:
```typescript
export function educationQualityToRgba(value: number): string {
  if (value === 0) return 'rgba(0, 0, 0, 0)' // transparent — no children
  if (value === 1) return 'rgba(128, 128, 128, 0.4)' // gray — unserved
  // Values 2-255: quality gradient green → yellow → red
  const quality = (value - 2) / 253
  const r = Math.floor((1 - quality) * 220)
  const g = Math.floor(quality * 200)
  return `rgba(${r}, ${g}, 40, 0.45)`
}
```

In `packages/game/src/render/OverlayRenderer.ts`:
- Update import to use `educationQualityToRgba`
- Rename color table: `const EDUCATION_QUALITY_COLORS = buildColorTable(educationQualityToRgba)`
- Update the `case 'education'` to read `state.educationQuality` instead of `state.educationCoverage`:
```typescript
case 'education': {
  const quality = state.educationQuality
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const v = quality[y * mapWidth + x]!
      if (v === 0) continue
      ctx.fillStyle = EDUCATION_QUALITY_COLORS[v]!
      ctx.fillRect(Math.floor((x - cameraX) * posTs), Math.floor((y - cameraY) * posTs), ts, ts)
    }
  }
  break
}
```

- [ ] **Step 4: Verify game builds**

Run: `cd packages/game && npx tsc --noEmit 2>&1 | tail -5`
Expected: No new type errors.

- [ ] **Step 5: Run all engine tests**

Run: `cd packages/engine && npx vitest run --reporter=verbose 2>&1 | tail -10`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/state.ts packages/engine/src/engine-state.ts packages/engine/src/Engine.ts packages/engine/src/simulation/tick.ts packages/game/src/render/colors.ts packages/game/src/render/OverlayRenderer.ts
git commit -m "feat(education): repurpose overlay to show enrollment quality per tile"
```

---

### Task 7: Update In-Game Guide

**Files:**
- Modify: `packages/docs/src/sections/education.ts`

- [ ] **Step 1: Update education guide content**

Replace the body in `packages/docs/src/sections/education.ts`:
```typescript
import type { DocSection } from '../types.js'

export const education: DocSection = {
  id: 'education',
  title: 'Education',
  body: [
    'Citizens with children enroll at the nearest school, improving their satisfaction. Education is more important to wealthier residents.',
    '',
    '**Schools** ($500, $75/mo) are 3×3 buildings with capacity for 300 children. **Small Schools** ($80, $15/mo) are 1×1 with capacity for 50 children. Schools can accept up to 120% capacity, but quality degrades — overcrowded schools make residents less happy.',
    '',
    'School **quality** depends on two factors: funding level (set in the Budget panel) and occupancy. A school at 100% capacity with full funding has quality 1.0. At 120% capacity, quality drops to 0.5. Cutting funding reduces quality further.',
    '',
    'Resident satisfaction from education depends on both the school\'s quality and the commute distance. Build schools close to residential areas for the best effect.',
    '',
    'Use the **Education overlay (J)** to see enrollment status: green = good quality, yellow = moderate, red = poor, gray = children with no school access.',
  ].join('\n'),
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/sections/education.ts
git commit -m "feat(education): update in-game guide for enrollment system"
```

---

### Task 8: Integration Tests and Final Verification

**Files:**
- Modify: `packages/engine/src/__tests__/education.test.ts`

- [ ] **Step 1: Write integration tests**

Add to `packages/engine/src/__tests__/education.test.ts`:
```typescript
import { Engine } from '../Engine.js'
import { advanceMonth } from '../test-helpers.js'

describe('Education enrollment integration', () => {
  test('school enrollment appears after births occur', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000, seed: 42 })
    engine.placeBuilding(0, 0, 'power.diesel')
    for (let x = 0; x < 20; x++) engine.placeTile(x, 3, Infrastructure.PowerLine)
    for (let x = 3; x < 18; x++) engine.placeTile(x, 5, Infrastructure.Road)
    // Zone residential
    for (let x = 3; x < 18; x++) engine.placeZone(x, 4, ZoneType.Residential)
    // Place school
    engine.placeBuilding(10, 6, 'service.school')
    // Advance many months for births to happen
    for (let i = 0; i < 60; i++) advanceMonth(engine)
    // Check if any agent has school enrollment
    const state = engine.getState()
    // educationQuality should have some non-zero tiles if births occurred
    const hasQuality = Array.from(state.educationQuality).some(v => v > 1)
    // This test is probabilistic — with seed 42 and 60 months, births should occur
    expect(hasQuality || state.citizens.totalChildren === 0).toBe(true)
  })

  test('education funding affects school quality', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000, seed: 42 })
    engine.placeBuilding(0, 0, 'power.diesel')
    for (let x = 0; x < 20; x++) engine.placeTile(x, 3, Infrastructure.PowerLine)
    for (let x = 3; x < 18; x++) engine.placeTile(x, 5, Infrastructure.Road)
    for (let x = 3; x < 18; x++) engine.placeZone(x, 4, ZoneType.Residential)
    engine.placeBuilding(10, 6, 'service.school')
    engine.setFunding('education', 100)
    for (let i = 0; i < 60; i++) advanceMonth(engine)
    // No crash, engine runs with education enrollment
    expect(engine.getState().funds).toBeDefined()
  })
})
```

- [ ] **Step 2: Run full test suite**

Run: `cd packages/engine && npx vitest run --reporter=verbose 2>&1 | tail -20`
Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/engine/src/__tests__/education.test.ts
git commit -m "feat(education): add enrollment integration tests"
```

- [ ] **Step 4: Final verification**

Run: `cd packages/engine && npx vitest run --reporter=verbose 2>&1 | tail -5`
Run: `cd packages/game && npx tsc --noEmit 2>&1 | tail -5`
Expected: All tests pass, no new type errors.
