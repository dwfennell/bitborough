# Education Service System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add education as a radius-based service system with tiered schools, overlay, budget integration, and reputation/desirability effects.

**Architecture:** Follows the existing police/fire service pattern exactly — `buildInfluenceMap()` for coverage, Uint8Array layer on EngineState, overlay renderer case, budget slider, building registry entries. Education plugs into desirability (flat bonus) and reputation (quality factor with renormalized weights). Tier weighting integrates into citizen satisfaction via `TIER_WEIGHTS`.

**Tech Stack:** TypeScript, Vitest, Canvas 2D (overlay), SVG (tiles)

**Spec:** `docs/superpowers/specs/2026-03-26-education-system-design.md`

---

### Task 1: Core Constants and Building Definitions

**Files:**
- Modify: `packages/core/src/constants.ts`
- Modify: `packages/engine/src/buildings-registry.ts`
- Modify: `packages/docs/src/building-reference.ts`

- [ ] **Step 1: Add cost/maintenance constants**

In `packages/core/src/constants.ts`, add to `COSTS`:
```typescript
school: 500,
schoolSmall: 80,
```
Add to `MAINTENANCE`:
```typescript
school: 75,
schoolSmall: 15,
```

- [ ] **Step 2: Add building definitions**

In `packages/engine/src/buildings-registry.ts`, add after `'service.fire'`:
```typescript
'service.school.small': {
  id: 'service.school.small',
  category: BuildingCategory.Special,
  density: DensityLevel.Low,
  size: { w: 1, h: 1 },
  capacity: 0,
  jobs: 0,
  taxValue: 0,
  pollutionRadius: 0,
  pollutionAmount: 0,
  powerRequired: true,
  roadRequired: true,
  cost: COSTS.schoolSmall,
  maintenanceCost: MAINTENANCE.schoolSmall,
},
'service.school': {
  id: 'service.school',
  category: BuildingCategory.Special,
  density: DensityLevel.Low,
  size: { w: 3, h: 3 },
  capacity: 0,
  jobs: 0,
  taxValue: 0,
  pollutionRadius: 0,
  pollutionAmount: 0,
  powerRequired: true,
  roadRequired: true,
  cost: COSTS.school,
  maintenanceCost: MAINTENANCE.school,
},
```

- [ ] **Step 3: Add building reference entries**

In `packages/docs/src/building-reference.ts`, add to `NAMES`:
```typescript
'service.school.small': 'Small School',
'service.school': 'School',
```
Add to `NOTES`:
```typescript
'service.school.small': '5-tile radius; boosted to 7.5 near a school',
'service.school': '12-tile education radius; boosts nearby small schools',
```

- [ ] **Step 4: Verify build passes**

Run: `cd packages/engine && npx vitest run --reporter=verbose 2>&1 | tail -5`
Expected: All existing tests pass (no new tests yet — just verifying nothing broke).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/constants.ts packages/engine/src/buildings-registry.ts packages/docs/src/building-reference.ts
git commit -m "feat(education): add school building definitions and cost constants"
```

---

### Task 2: Education Coverage Service

**Files:**
- Create: `packages/engine/src/simulation/services/education.ts`
- Create: `packages/engine/src/__tests__/education.test.ts`

- [ ] **Step 1: Write failing tests for education coverage**

Create `packages/engine/src/__tests__/education.test.ts`:
```typescript
import { describe, test, expect } from 'vitest'
import { DensityLevel } from '@bitborough/core'
import { createTestMap } from '../test-helpers.js'
import { calculateEducationCoverage } from '../simulation/services/education.js'

function makeSchool(id: string, defId: string, x: number, y: number) {
  return { id, defId, x, y, powered: true, density: DensityLevel.Low, age: 0, state: 'active' as const, residents: 0 }
}

describe('Education coverage', () => {
  test('empty map produces zero coverage', () => {
    const map = createTestMap(16)
    const size = 16 * 16
    const educationCoverage = new Uint8Array(size)
    const influenceBuffer = new Float32Array(size)
    calculateEducationCoverage(map, educationCoverage, 100, influenceBuffer)
    const total = Array.from(educationCoverage).reduce((a, b) => a + b, 0)
    expect(total).toBe(0)
  })

  test('large school stamps coverage within radius', () => {
    const map = createTestMap(32)
    const size = 32 * 32
    // Place a 3x3 school at (14,14) — center at (15.5, 15.5)
    map.buildings.push(makeSchool('b1', 'service.school', 14, 14))
    const educationCoverage = new Uint8Array(size)
    const influenceBuffer = new Float32Array(size)
    calculateEducationCoverage(map, educationCoverage, 100, influenceBuffer)
    // Center tile should have high coverage
    expect(educationCoverage[15 * 32 + 15]).toBeGreaterThan(200)
    // Tile at edge of radius (~12 tiles away) should have low or zero coverage
    expect(educationCoverage[3 * 32 + 15]).toBe(0)
  })

  test('small school stamps smaller radius', () => {
    const map = createTestMap(32)
    const size = 32 * 32
    map.buildings.push(makeSchool('b1', 'service.school.small', 15, 15))
    const educationCoverage = new Uint8Array(size)
    const influenceBuffer = new Float32Array(size)
    calculateEducationCoverage(map, educationCoverage, 100, influenceBuffer)
    // Center tile should have coverage
    expect(educationCoverage[15 * 32 + 15]).toBeGreaterThan(200)
    // 8 tiles away — outside small radius of 5
    expect(educationCoverage[15 * 32 + 23]).toBe(0)
  })

  test('small school near large school gets 1.5x radius boost', () => {
    const map = createTestMap(32)
    const size = 32 * 32
    // Large school at (14,14) — covers center area
    map.buildings.push(makeSchool('b1', 'service.school', 14, 14))
    // Small school at (16,16) — within large school coverage
    map.buildings.push(makeSchool('b2', 'service.school.small', 16, 16))
    const educationCoverage = new Uint8Array(size)
    const influenceBuffer = new Float32Array(size)
    calculateEducationCoverage(map, educationCoverage, 100, influenceBuffer)

    // Now test with small school alone (far from any large school)
    const map2 = createTestMap(32)
    map2.buildings.push(makeSchool('b2', 'service.school.small', 16, 16))
    const coverage2 = new Uint8Array(size)
    const buf2 = new Float32Array(size)
    calculateEducationCoverage(map2, coverage2, 100, buf2)

    // Boosted small school should cover tiles the unboosted one doesn't
    // Check a tile ~7 tiles from small school (outside base 5 radius, inside boosted 7.5)
    const checkIdx = 16 * 32 + 23 // 7 tiles east of small school
    expect(educationCoverage[checkIdx]).toBeGreaterThan(0)
    expect(coverage2[checkIdx]).toBe(0)
  })

  test('zero funding produces zero coverage', () => {
    const map = createTestMap(32)
    const size = 32 * 32
    map.buildings.push(makeSchool('b1', 'service.school', 14, 14))
    const educationCoverage = new Uint8Array(size)
    const influenceBuffer = new Float32Array(size)
    calculateEducationCoverage(map, educationCoverage, 0, influenceBuffer)
    const total = Array.from(educationCoverage).reduce((a, b) => a + b, 0)
    expect(total).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/engine && npx vitest run src/__tests__/education.test.ts --reporter=verbose 2>&1 | tail -10`
Expected: FAIL — module not found

- [ ] **Step 3: Implement calculateEducationCoverage**

Create `packages/engine/src/simulation/services/education.ts`:
```typescript
import type { GameMap } from '@bitborough/core'
import { buildInfluenceMap } from './influence.js'

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

  for (let i = 0; i < influenceBuffer.length; i++) {
    educationCoverage[i] = Math.min(255, Math.floor(influenceBuffer[i]! * 255))
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/engine && npx vitest run src/__tests__/education.test.ts --reporter=verbose 2>&1 | tail -10`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/services/education.ts packages/engine/src/__tests__/education.test.ts
git commit -m "feat(education): add calculateEducationCoverage service with tests"
```

---

### Task 3: Engine State Integration

**Files:**
- Modify: `packages/core/src/state.ts` (GameState, BudgetInfo types)
- Modify: `packages/engine/src/engine-state.ts` (EngineState, create/restore/serialize/rebuild)
- Modify: `packages/engine/src/engine.ts` (getState, setFunding)

- [ ] **Step 1: Update core types**

In `packages/core/src/state.ts`:

Add `educationCoverage: Uint8Array` to `GameState` interface (after `fireCoverage`).

Add `education: number` to `BudgetInfo.serviceCosts` (after `transit`).

Add `education: number` to `BudgetInfo.funding` (after `transit`).

- [ ] **Step 2: Update EngineState interface**

In `packages/engine/src/engine-state.ts`:

Add `educationCoverage: Uint8Array` to `EngineState` interface (after `fireCoverage`).

Add import: `import { calculateEducationCoverage } from './simulation/services/education.js'`

- [ ] **Step 3: Update funding type in EngineState**

Change `funding: { police: number; fire: number; transit: number }` to `funding: { police: number; fire: number; transit: number; education: number }`.

- [ ] **Step 4: Update createEngineState**

Add `educationCoverage` allocation (after `fireCoverage`):
```typescript
const educationCoverage = new Uint8Array(size)
```
Add to funding default: `education: 100`
Add `educationCoverage` to the state object.

- [ ] **Step 5: Update restoreState**

Add `educationCoverage: new Uint8Array(size)` allocation AND add it to the state object literal (after `fireCoverage`).
Add `education: save.state.funding.education ?? 100` to the funding object in the state literal.

- [ ] **Step 6: Update serializeState**

Change `version: 7` to `version: 8`. (funding already serialized via spread — education included automatically.)

- [ ] **Step 7: Update rebuildDerivedState**

After `calculateFireCoverage(...)` line, add:
```typescript
calculateEducationCoverage(state.map, state.educationCoverage, state.funding.education, state.influenceBuffer)
```

- [ ] **Step 8: Update Engine.setFunding**

In `packages/engine/src/engine.ts`, change:
```typescript
setFunding(service: 'police' | 'fire' | 'transit', level: number): void {
```
to:
```typescript
setFunding(service: 'police' | 'fire' | 'transit' | 'education', level: number): void {
```

- [ ] **Step 9: Update Engine.getState**

Add `educationCoverage: this.state.educationCoverage` to the returned object (after `fireCoverage`).

- [ ] **Step 10: Fix serialization and history test version assertions**

In `packages/engine/src/__tests__/serialization.test.ts`: find all `expect(save.version).toBe(7)` and change to `toBe(8)` (approximately 4 occurrences).
In `packages/engine/src/__tests__/history.test.ts`: find `expect(engine.serialize().version).toBe(7)` and change to `toBe(8)`.

- [ ] **Step 11: Fix existing budget test callers**

In `packages/engine/src/__tests__/budget.test.ts`: all direct calls to `calculateBudget` pass a 3-field funding object. Add `education: 100` to each one. There are approximately 6 call sites — search for `{ police:` in the file.

- [ ] **Step 12: Verify build and existing tests pass**

Run: `cd packages/engine && npx vitest run --reporter=verbose 2>&1 | tail -10`
Expected: All tests pass.

- [ ] **Step 13: Commit**

```bash
git add packages/core/src/state.ts packages/engine/src/engine-state.ts packages/engine/src/engine.ts
git commit -m "feat(education): wire educationCoverage into engine state, funding, and getState"
```

---

### Task 4: Desirability Integration

**Files:**
- Modify: `packages/engine/src/simulation/desirability.ts`
- Modify: `packages/engine/src/simulation/density.ts`
- Modify: `packages/engine/src/simulation/tick.ts`
- Modify: `packages/engine/src/__tests__/desirability.test.ts`

- [ ] **Step 1: Write failing desirability tests**

Add to `packages/engine/src/__tests__/desirability.test.ts`:

Update the `makeLayers` helper to include `educationCoverage`:
```typescript
function makeLayers(size: number) {
  return {
    powerGrid: new Uint8Array(size),
    crimeLevel: new Uint8Array(size),
    fireCoverage: new Uint8Array(size),
    pollutionLevel: new Uint8Array(size),
    educationCoverage: new Uint8Array(size),
  }
}
```

Add new describe block:
```typescript
describe('education bonus', () => {
  test('education coverage above threshold boosts residential desirability', () => {
    const map = createTestMap(16)
    const layers = makeLayers(16 * 16)
    layers.powerGrid[5 * 16 + 5] = 1
    map.infrastructure[5 * 16 + 5] = 0b1 // Road
    // Set education coverage above threshold (76 ≈ 0.3 × 255)
    layers.educationCoverage[5 * 16 + 5] = 200
    const withEdu = computeDesirability(
      ZoneType.Residential, 5, 5, map,
      layers.powerGrid, layers.crimeLevel, layers.fireCoverage, layers.pollutionLevel,
      undefined, layers.educationCoverage,
    )
    layers.educationCoverage[5 * 16 + 5] = 0
    const withoutEdu = computeDesirability(
      ZoneType.Residential, 5, 5, map,
      layers.powerGrid, layers.crimeLevel, layers.fireCoverage, layers.pollutionLevel,
      undefined, layers.educationCoverage,
    )
    expect(withEdu).toBeGreaterThan(withoutEdu)
  })

  test('education coverage below threshold adds no bonus', () => {
    const map = createTestMap(16)
    const layers = makeLayers(16 * 16)
    layers.powerGrid[5 * 16 + 5] = 1
    map.infrastructure[5 * 16 + 5] = 0b1
    layers.educationCoverage[5 * 16 + 5] = 50 // Below threshold of 76
    const withLowEdu = computeDesirability(
      ZoneType.Residential, 5, 5, map,
      layers.powerGrid, layers.crimeLevel, layers.fireCoverage, layers.pollutionLevel,
      undefined, layers.educationCoverage,
    )
    layers.educationCoverage[5 * 16 + 5] = 0
    const withoutEdu = computeDesirability(
      ZoneType.Residential, 5, 5, map,
      layers.powerGrid, layers.crimeLevel, layers.fireCoverage, layers.pollutionLevel,
      undefined, layers.educationCoverage,
    )
    expect(withLowEdu).toBe(withoutEdu)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/engine && npx vitest run src/__tests__/desirability.test.ts --reporter=verbose 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Update computeDesirability and residentialDesirability**

In `packages/engine/src/simulation/desirability.ts`:

Add constants:
```typescript
const RES_EDUCATION_BONUS = 0.20
const EDUCATION_COVERAGE_THRESHOLD = 76 // ≈ 0.3 × 255
```

Update `computeDesirability` signature — add `educationCoverage?: Uint8Array` as the last parameter (optional for backwards compatibility with existing callers during transition):
```typescript
export function computeDesirability(
  zone: ZoneType,
  x: number,
  y: number,
  map: GameMap,
  powerGrid: Uint8Array,
  crimeLevel: Uint8Array,
  fireCoverage: Uint8Array,
  pollutionLevel: Uint8Array,
  bldIdx?: BuildingIndex,
  educationCoverage?: Uint8Array,
): number {
```

Thread `educationCoverage` to `residentialDesirability`:
```typescript
case ZoneType.Residential:
  return residentialDesirability(x, y, idx, map, crimeLevel, fireCoverage, pollutionLevel, bldIdx, educationCoverage)
```

Update `residentialDesirability` signature and add education bonus:
```typescript
function residentialDesirability(
  x: number,
  y: number,
  idx: number,
  map: GameMap,
  crimeLevel: Uint8Array,
  fireCoverage: Uint8Array,
  pollutionLevel: Uint8Array,
  bldIdx?: BuildingIndex,
  educationCoverage?: Uint8Array,
): number {
  const crimeNorm = crimeLevel[idx]! / 255
  const pollNorm = pollutionLevel[idx]! / 255

  let score = RES_BASELINE
  score += (1 - crimeNorm) * RES_SAFETY_WEIGHT
  if (fireCoverage[idx]) score += RES_FIRE_BONUS
  score += parkDesirabilityBonus(x, y, map, bldIdx)
  if (educationCoverage && educationCoverage[idx]! > EDUCATION_COVERAGE_THRESHOLD) {
    score += RES_EDUCATION_BONUS * (educationCoverage[idx]! / 255)
  }
  score -= pollNorm * RES_POLLUTION_PENALTY
  score += zoneBoundaryEffect(x, y, map, bldIdx)

  return clamp(score, 0, 1)
}
```

- [ ] **Step 4: Update all existing computeDesirability test calls**

All existing calls to `computeDesirability` in `desirability.test.ts` don't pass `educationCoverage`, which is fine since it's optional. No changes needed to existing tests.

- [ ] **Step 5: Update density.ts to pass educationCoverage**

In `packages/engine/src/simulation/density.ts`, update `updateDensity` signature to accept `educationCoverage: Uint8Array`:
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
  educationCoverage?: Uint8Array,
): { populationDelta: number } {
```

Pass it through in the `computeDesirability` call:
```typescript
const desirability = computeDesirability(
  categoryToZone(def.category),
  building.x, building.y, map,
  powerGrid, crimeLevel, fireCoverage, pollutionLevel,
  bldIdx, educationCoverage,
)
```

- [ ] **Step 6: Update tick.ts to pass educationCoverage**

In `packages/engine/src/simulation/tick.ts`, update the `updateDensity` call (around line 73):
```typescript
updateDensity(
  state.map,
  state.powerGrid,
  state.demand,
  computeTotalPopulation(state.map),
  state.prng,
  nextBuildingIdRef,
  state.crimeLevel,
  state.fireCoverage,
  state.pollutionLevel,
  state.educationCoverage,
)
```

- [ ] **Step 7: Run all tests**

Run: `cd packages/engine && npx vitest run --reporter=verbose 2>&1 | tail -15`
Expected: All tests pass including new education desirability tests.

- [ ] **Step 8: Commit**

```bash
git add packages/engine/src/simulation/desirability.ts packages/engine/src/simulation/density.ts packages/engine/src/simulation/tick.ts packages/engine/src/__tests__/desirability.test.ts
git commit -m "feat(education): add education bonus to residential desirability"
```

---

### Task 5: Reputation Integration

**Files:**
- Modify: `packages/engine/src/simulation/reputation.ts`
- Modify: `packages/engine/src/simulation/tick.ts`
- Modify: `packages/engine/src/engine-state.ts`
- Modify: `packages/engine/src/__tests__/reputation.test.ts`

- [ ] **Step 1: Write failing reputation tests**

Update existing tests in `packages/engine/src/__tests__/reputation.test.ts`:

The existing `computeCurrentQuality` tests will need updating because weights change. First, add the new test:

```typescript
test('education factor contributes to quality score', () => {
  const qWithEdu = computeCurrentQuality(0, 0, 1.0, 1.0, 1.0, 1.0)
  const qWithoutEdu = computeCurrentQuality(0, 0, 1.0, 1.0, 1.0, 0)
  expect(qWithEdu).toBeGreaterThan(qWithoutEdu)
})

test('weights sum to 1.0', () => {
  // Perfect conditions: all norms at best values
  const q = computeCurrentQuality(0, 0, 1.0, 1.0, 1.0, 1.0)
  expect(q).toBeCloseTo(1.0)
})
```

Update ALL three `computeReputation` calls in the test file to pass `educationCoverage` as 7th argument:
```typescript
const educationCoverage = new Uint8Array(16)
computeReputation(reputationLayer, map, crimeLevel, fireCoverage, pollutionLevel, bldIdx, educationCoverage)
```

Update ALL `computeCurrentQuality` calls to pass 6 arguments (add `educationNorm` as 6th param).

**Existing assertion updates needed:**

1. "perfect conditions" test: `computeCurrentQuality(0, 0, 1.0, 1.0, 1.0, 1.0)` — still expect `≈ 1.0`
2. "worst conditions" test: `computeCurrentQuality(1.0, 1.0, 0, 0, 0, 0)` — still expect `≈ 0.0`
3. "mixed conditions" test: `computeCurrentQuality(0.5, 0.3, 0.8, 0.0, 0.7, 0.0)` — new expected:
   `(0.5)*(0.35/1.1) + (0.7)*(0.25/1.1) + (0.8)*(0.15/1.1) + 0*(0.15/1.1) + (0.7)*(0.10/1.1) + 0*(0.10/1.1) ≈ 0.4909`
   Change `toBeCloseTo(0.54)` to `toBeCloseTo(0.4909, 2)`
4. "reputation decays toward current quality" test — quality at tile 0 changes:
   Old: `0.60` → New: `(1-0)*(0.35/1.1) + (1-0)*(0.25/1.1) + 0 + 0 + 0 + 0 ≈ 0.5455`
   New expected reputation: `0.95 * 0.5 + 0.05 * 0.5455 ≈ 0.5023`
   Change `toBeCloseTo(0.505, 2)` to `toBeCloseTo(0.5023, 2)`

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/engine && npx vitest run src/__tests__/reputation.test.ts --reporter=verbose 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Update reputation.ts**

Replace the weight constants with renormalized versions:
```typescript
const RAW_CRIME = 0.35
const RAW_POLLUTION = 0.25
const RAW_FIRE = 0.15
const RAW_PARK = 0.15
const RAW_OCCUPANCY = 0.10
const RAW_EDUCATION = 0.10
const TOTAL = RAW_CRIME + RAW_POLLUTION + RAW_FIRE + RAW_PARK + RAW_OCCUPANCY + RAW_EDUCATION

const QUALITY_CRIME_WEIGHT = RAW_CRIME / TOTAL
const QUALITY_POLLUTION_WEIGHT = RAW_POLLUTION / TOTAL
const QUALITY_FIRE_WEIGHT = RAW_FIRE / TOTAL
const QUALITY_PARK_WEIGHT = RAW_PARK / TOTAL
const QUALITY_OCCUPANCY_WEIGHT = RAW_OCCUPANCY / TOTAL
const QUALITY_EDUCATION_WEIGHT = RAW_EDUCATION / TOTAL
```

Update `computeCurrentQuality`:
```typescript
export function computeCurrentQuality(
  crimeNorm: number, pollNorm: number, fireNorm: number, parkNorm: number, occupancyHealth: number, educationNorm: number,
): number {
  return (
    (1 - crimeNorm) * QUALITY_CRIME_WEIGHT +
    (1 - pollNorm) * QUALITY_POLLUTION_WEIGHT +
    fireNorm * QUALITY_FIRE_WEIGHT +
    parkNorm * QUALITY_PARK_WEIGHT +
    occupancyHealth * QUALITY_OCCUPANCY_WEIGHT +
    educationNorm * QUALITY_EDUCATION_WEIGHT
  )
}
```

Update `computeReputation` signature and body:
```typescript
export function computeReputation(
  reputationLayer: Float32Array,
  map: GameMap,
  crimeLevel: Uint8Array,
  fireCoverage: Uint8Array,
  pollutionLevel: Uint8Array,
  bldIdx: BuildingIndex,
  educationCoverage: Uint8Array,
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
      const occupancyHealth = computeOccupancyHealth(x, y, bldIdx)
      const educationNorm = educationCoverage[idx]! / 255
      const quality = computeCurrentQuality(crimeNorm, pollNorm, fireNorm, parkNorm, occupancyHealth, educationNorm)
      reputationLayer[idx] = REPUTATION_DECAY * reputationLayer[idx]! + (1 - REPUTATION_DECAY) * quality
    }
  }
}
```

- [ ] **Step 4: Update computeReputation callers**

In `packages/engine/src/simulation/tick.ts` (line 58), add `state.educationCoverage`:
```typescript
computeReputation(state.reputationLayer, state.map, state.crimeLevel, state.fireCoverage, state.pollutionLevel, state.bldIdx, state.educationCoverage)
```

In `packages/engine/src/engine-state.ts` `createEngineState` (line ~349), add `state.educationCoverage`:
```typescript
computeReputation(state.reputationLayer, state.map, state.crimeLevel, state.fireCoverage, state.pollutionLevel, state.bldIdx, state.educationCoverage)
```

- [ ] **Step 5: Run all tests**

Run: `cd packages/engine && npx vitest run --reporter=verbose 2>&1 | tail -15`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/engine/src/simulation/reputation.ts packages/engine/src/simulation/tick.ts packages/engine/src/engine-state.ts packages/engine/src/__tests__/reputation.test.ts
git commit -m "feat(education): add education factor to reputation quality score"
```

---

### Task 6: Budget Integration

**Files:**
- Modify: `packages/engine/src/simulation/budget.ts`
- Modify: `packages/engine/src/__tests__/budget.test.ts`

- [ ] **Step 1: Write failing budget test**

Add to `packages/engine/src/__tests__/budget.test.ts`:

```typescript
test('school maintenance deducted with education funding', () => {
  const map = createTestMap(32)
  map.buildings.push({
    id: 'b1', defId: 'service.school', x: 14, y: 14,
    powered: true, density: DensityLevel.Low, age: 0,
    state: 'active', residents: 0,
  })
  const budget = calculateBudget(
    map, 0, 0.07, new Uint8Array(32 * 32),
    { police: 100, fire: 100, transit: 100, education: 100 },
  )
  expect(budget.serviceCosts.education).toBe(75) // $75/mo at 100% funding
})

test('school maintenance scales with funding', () => {
  const map = createTestMap(32)
  map.buildings.push({
    id: 'b1', defId: 'service.school', x: 14, y: 14,
    powered: true, density: DensityLevel.Low, age: 0,
    state: 'active', residents: 0,
  })
  const budget = calculateBudget(
    map, 0, 0.07, new Uint8Array(32 * 32),
    { police: 100, fire: 100, transit: 100, education: 50 },
  )
  expect(budget.serviceCosts.education).toBe(38) // $75 * 0.5 = 37.5, rounded to 38
})

test('mixed school + small school maintenance', () => {
  const map = createTestMap(32)
  map.buildings.push(
    { id: 'b1', defId: 'service.school', x: 14, y: 14, powered: true, density: DensityLevel.Low, age: 0, state: 'active' as const, residents: 0 },
    { id: 'b2', defId: 'service.school.small', x: 5, y: 5, powered: true, density: DensityLevel.Low, age: 0, state: 'active' as const, residents: 0 },
  )
  const budget = calculateBudget(
    map, 0, 0.07, new Uint8Array(32 * 32),
    { police: 100, fire: 100, transit: 100, education: 100 },
  )
  expect(budget.serviceCosts.education).toBe(90) // $75 + $15 = $90
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/engine && npx vitest run src/__tests__/budget.test.ts --reporter=verbose 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Update budget.ts**

Update funding parameter type:
```typescript
funding: { police: number; fire: number; transit: number; education: number },
```

Add `schoolMaintenance` accumulator (line ~30):
```typescript
let schoolMaintenance = 0
```

Add branch in the building loop (after the fire branch):
```typescript
else if (building.defId.startsWith('service.school')) schoolMaintenance += def.maintenanceCost
```

Add education to serviceCosts:
```typescript
const serviceCosts = {
  police: policeMaintenance * (funding.police / 100),
  fire: fireMaintenance * (funding.fire / 100),
  transit: transitStopCount * MAINTENANCE.transitStop * (funding.transit / 100),
  education: schoolMaintenance * (funding.education / 100),
  total: 0,
}
serviceCosts.total = serviceCosts.police + serviceCosts.fire + serviceCosts.transit + serviceCosts.education
```

Add to the return object:
```typescript
serviceCosts: {
  police: Math.round(serviceCosts.police),
  fire: Math.round(serviceCosts.fire),
  transit: Math.round(serviceCosts.transit),
  education: Math.round(serviceCosts.education),
  total: Math.round(serviceCosts.total),
},
```

- [ ] **Step 4: Fix existing budget test callers**

Existing tests that call `calculateBudget` directly pass a 3-field funding object. Update them to include `education: 100`.

The `Engine.create` path already has `education: 100` from Task 3, so engine-level tests are fine.

- [ ] **Step 5: Run all tests**

Run: `cd packages/engine && npx vitest run --reporter=verbose 2>&1 | tail -15`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/engine/src/simulation/budget.ts packages/engine/src/__tests__/budget.test.ts
git commit -m "feat(education): add school maintenance to budget calculation"
```

---

### Task 7: Citizen Satisfaction — Tier Weighting

**Files:**
- Modify: `packages/engine/src/simulation/wealth-tiers.ts`
- Modify: `packages/engine/src/simulation/citizens.ts`

- [ ] **Step 1: Add education to TierFactorWeights and TIER_WEIGHTS**

In `packages/engine/src/simulation/wealth-tiers.ts`:

Update interface:
```typescript
export interface TierFactorWeights {
  crime: number; pollution: number; park: number; fire: number
  commute: number; jobMatch: number; commerce: number; education: number
}
```

Update `TIER_WEIGHTS`:
```typescript
export const TIER_WEIGHTS: Record<WealthTier, TierFactorWeights> = {
  1: { crime: 0.8, pollution: 0.7, park: 0.5, fire: 0.8, commute: 1.3, jobMatch: 1.2, commerce: 0.9, education: 0.6 },
  2: { crime: 1.0, pollution: 1.0, park: 1.0, fire: 1.0, commute: 1.0, jobMatch: 1.0, commerce: 1.0, education: 1.2 },
  3: { crime: 1.4, pollution: 1.5, park: 1.3, fire: 1.2, commute: 0.8, jobMatch: 0.9, commerce: 1.1, education: 1.5 },
}
```

- [ ] **Step 2: Add educationCoverage to TileLayers and computeSatisfaction**

In `packages/engine/src/simulation/citizens.ts`:

Add `educationCoverage` to the `TileLayers` interface:
```typescript
export interface TileLayers {
  crimeLevel: Uint8Array
  fireCoverage: Uint8Array
  pollutionLevel: Uint8Array
  reputationLayer: Float32Array
  educationCoverage: Uint8Array
}
```

In `computeSatisfaction`, add education factor (after `parkNorm` calculation):
```typescript
let educationNorm = 0
if (building) {
  const idx = building.y * map.width + building.x
  educationNorm = layers.educationCoverage[idx]! / 255
}
```

Add to the satisfaction formula:
```typescript
return clamp(
  1.0
  - commuteNorm * 0.4 * w.commute
  - jobless * 0.5 * w.jobMatch
  - noCommerce * 0.3 * w.commerce
  - crimeNorm * 0.3 * w.crime
  - pollNorm * 0.3 * w.pollution
  + fireNorm * 0.15 * w.fire
  + parkNorm * 0.25 * w.park
  + educationNorm * 0.15 * w.education
  - schelling,
  0, 1,
)
```

- [ ] **Step 3: Fix citizen test helpers**

In `packages/engine/src/__tests__/citizens.test.ts`: find `makeTileLayers()` and add `educationCoverage: new Uint8Array(size)` to the returned object.

In `packages/engine/src/__tests__/citizens-tiers.test.ts`: find `makeLayers()` and add `educationCoverage: new Uint8Array(size)` to the returned object.

- [ ] **Step 4: Update TileLayers construction in tick.ts**

In `packages/engine/src/simulation/tick.ts` (line ~61), add `educationCoverage`:
```typescript
const tileLayers: TileLayers = {
  crimeLevel: state.crimeLevel,
  fireCoverage: state.fireCoverage,
  pollutionLevel: state.pollutionLevel,
  reputationLayer: state.reputationLayer,
  educationCoverage: state.educationCoverage,
}
```

- [ ] **Step 5: Run all tests**

Run: `cd packages/engine && npx vitest run --reporter=verbose 2>&1 | tail -15`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/engine/src/simulation/wealth-tiers.ts packages/engine/src/simulation/citizens.ts packages/engine/src/simulation/tick.ts packages/engine/src/__tests__/citizens.test.ts packages/engine/src/__tests__/citizens-tiers.test.ts
git commit -m "feat(education): add education factor to citizen satisfaction with tier weights"
```

---

### Task 8: Overlay Renderer

**Files:**
- Modify: `packages/game/src/render/colors.ts`
- Modify: `packages/game/src/render/OverlayRenderer.ts`
- Modify: `packages/game/src/Game.ts`

- [ ] **Step 1: Add education color function**

In `packages/game/src/render/colors.ts`, add:
```typescript
export function educationCoverageToRgba(value: number): string {
  const v = value / 255
  const r = Math.floor(80 + v * 80)
  const g = Math.floor(120 * (1 - v))
  const b = Math.floor(180 + v * 75)
  return `rgba(${r}, ${g}, ${b}, 0.45)`
}
```

- [ ] **Step 2: Update OverlayRenderer**

In `packages/game/src/render/OverlayRenderer.ts`:

Add import:
```typescript
import { landValueToRgba, crimeToRgba, fireCoverageToRgba, trafficToRgba, educationCoverageToRgba } from './colors.js'
```

Update type:
```typescript
export type OverlayType = 'power' | 'landValue' | 'crime' | 'fire' | 'traffic' | 'education' | 'none'
```

Add color table:
```typescript
const EDUCATION_COVERAGE_COLORS = buildColorTable(educationCoverageToRgba)
```

Add case in render switch (after `case 'traffic'`):
```typescript
case 'education': {
  const coverage = state.educationCoverage
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const v = coverage[y * mapWidth + x]!
      if (v === 0) continue
      ctx.fillStyle = EDUCATION_COVERAGE_COLORS[v]!
      ctx.fillRect(Math.floor((x - cameraX) * posTs), Math.floor((y - cameraY) * posTs), ts, ts)
    }
  }
  break
}
```

- [ ] **Step 3: Add overlay toggle key**

In `packages/game/src/Game.ts`, add to the `actions` array (after the traffic overlay line):
```typescript
{ label: 'Education (J)', key: 'j', action: () => this.renderer.toggleOverlay('education') },
```

- [ ] **Step 4: Verify game builds**

Run: `cd packages/game && npx tsc --noEmit 2>&1 | tail -5`
Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add packages/game/src/render/colors.ts packages/game/src/render/OverlayRenderer.ts packages/game/src/Game.ts
git commit -m "feat(education): add blue-purple education overlay (toggle: J)"
```

---

### Task 9: Budget Panel and Toolbar

**Files:**
- Modify: `packages/game/src/ui/BudgetPanel.ts`
- Modify: `packages/game/src/ui/Toolbar.ts`

- [ ] **Step 1: Add education funding slider to BudgetPanel**

In `packages/game/src/ui/BudgetPanel.ts`:

Update type:
```typescript
export type FundingService = 'police' | 'fire' | 'transit' | 'education'
```

Add slider HTML after the fire funding slider (inside the Service Funding section):
```html
<label>Education: <span id="education-funding-display">100%</span></label>
<input type="range" id="education-funding" min="0" max="100" value="100" step="10">
```

Add binding after the fire slider binding:
```typescript
this.bindFundingSlider('education-funding', 'education-funding-display', 'education')
```

- [ ] **Step 2: Add school tools to Toolbar**

In `packages/game/src/ui/Toolbar.ts`, add after the Fire entry:
```typescript
{
  label: `SmSch ${fmtCost(BUILDING_DEFS['service.school.small']!.cost)}`,
  key: 'o',
  factory: () => new BuildingTool('service.school.small'),
},
{
  label: `School ${fmtCost(BUILDING_DEFS['service.school']!.cost)}`,
  key: 'l',
  factory: () => new BuildingTool('service.school'),
},
```

- [ ] **Step 3: Verify game builds**

Run: `cd packages/game && npx tsc --noEmit 2>&1 | tail -5`
Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add packages/game/src/ui/BudgetPanel.ts packages/game/src/ui/Toolbar.ts
git commit -m "feat(education): add education funding slider and school toolbar entries"
```

---

### Task 10: In-Game Guide

**Files:**
- Create: `packages/docs/src/sections/education.ts`
- Modify: `packages/docs/src/index.ts`
- Modify: `packages/docs/src/sections/overlays.ts`

- [ ] **Step 1: Create education doc section**

Create `packages/docs/src/sections/education.ts`:
```typescript
import type { DocSection } from '../types.js'

export const education: DocSection = {
  id: 'education',
  title: 'Education',
  body: [
    'Education coverage boosts residential desirability and neighborhood reputation, attracting higher-wealth residents.',
    '',
    '**Schools** ($500, $75/mo) are 3×3 buildings with a 12-tile education radius. **Small Schools** ($80, $15/mo) are 1×1 units with a 5-tile radius — affordable early-game coverage. Small schools within a school\'s coverage get a 1.5× range boost (5 → 7.5 tiles).',
    '',
    'Education is more important to wealthier citizens. Mid-wealth residents are moderately attracted (1.2×), while high-wealth residents are strongly attracted (1.5×). Low-wealth residents care less (0.6×).',
    '',
    'Use the **Education overlay (J)** to see coverage across your city (blue-purple gradient). Adjust the education funding slider in the Budget panel to control service spending.',
  ].join('\n'),
}
```

- [ ] **Step 2: Add to SECTIONS array**

In `packages/docs/src/index.ts`, add import and insert after `fire`:
```typescript
import { education } from './sections/education.js'
```
Add `education` to the `SECTIONS` array after `fire`.

- [ ] **Step 3: Update overlays doc**

In `packages/docs/src/sections/overlays.ts`, add the education row to the table:
```
| **J** | *Education* — Blue (low) to purple (high) coverage |
```

- [ ] **Step 4: Verify docs package builds**

Run: `cd packages/docs && npx tsc --noEmit 2>&1 | tail -5`
Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add packages/docs/src/sections/education.ts packages/docs/src/index.ts packages/docs/src/sections/overlays.ts
git commit -m "feat(education): add education section to in-game guide"
```

---

### Task 11: SVG Tiles

**Files:**
- Create: SVG tiles for `service.school` and `service.school.small`

- [ ] **Step 1: Generate school tiles**

Use the tile-generator agent to create:
1. `service.school` (3x3) — a school building
2. `service.school.small` (1x1) — a small school

- [ ] **Step 2: Verify tiles render correctly**

Start the dev server and place both school types to verify visual appearance.

- [ ] **Step 3: Commit**

```bash
git add -A packages/game/public/tiles/
git commit -m "feat(education): add SVG tiles for school and small school"
```

---

### Task 12: Engine Export and Integration Test

**Files:**
- Modify: `packages/engine/src/index.ts` (export new function)
- Test integration end-to-end

- [ ] **Step 1: Add export**

In `packages/engine/src/index.ts`, add:
```typescript
export { calculateEducationCoverage } from './simulation/services/education.js'
```

- [ ] **Step 2: Write integration test**

Add to existing integration tests or create a focused test:

```typescript
test('schools provide education coverage visible in getState', () => {
  const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
  // Place infrastructure
  engine.placeBuilding(0, 0, 'power.diesel')
  for (let x = 0; x < 20; x++) engine.placeTile(x, 3, Infrastructure.PowerLine)
  for (let x = 5; x < 20; x++) engine.placeTile(x, 5, Infrastructure.Road)
  // Place school
  engine.placeBuilding(10, 6, 'service.school')
  advanceMonth(engine)
  const state = engine.getState()
  // School center at (11.5, 7.5) — nearby tile should have coverage
  expect(state.educationCoverage[7 * 32 + 11]).toBeGreaterThan(0)
  // Far away tile should have no coverage
  expect(state.educationCoverage[0]).toBe(0)
})

test('education funding slider works', () => {
  const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
  engine.placeBuilding(0, 0, 'power.diesel')
  for (let x = 0; x < 20; x++) engine.placeTile(x, 3, Infrastructure.PowerLine)
  for (let x = 5; x < 20; x++) engine.placeTile(x, 5, Infrastructure.Road)
  engine.placeBuilding(10, 6, 'service.school')

  engine.setFunding('education', 100)
  advanceMonth(engine)
  const fullCoverage = engine.getState().educationCoverage[7 * 32 + 11]!

  engine.setFunding('education', 0)
  advanceMonth(engine)
  const zeroCoverage = engine.getState().educationCoverage[7 * 32 + 11]!

  expect(fullCoverage).toBeGreaterThan(0)
  expect(zeroCoverage).toBe(0)
})
```

- [ ] **Step 3: Run full test suite**

Run: `cd packages/engine && npx vitest run --reporter=verbose 2>&1 | tail -20`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/engine/src/index.ts packages/engine/src/__tests__/
git commit -m "feat(education): add integration tests and export education coverage"
```

---

### Task 13: Final Verification

- [ ] **Step 1: Run full monorepo build**

Run: `npm run build 2>&1 | tail -10`
Expected: Clean build, no errors.

- [ ] **Step 2: Run full test suite**

Run: `npm test 2>&1 | tail -20`
Expected: All tests pass.

- [ ] **Step 3: Manual smoke test**

Start dev server, place a diesel plant, roads, residential zones, and a school. Verify:
- School places correctly (3x3)
- Small school places correctly (1x1)
- Education overlay (J key) shows blue-purple coverage
- Budget panel shows education funding slider
- Education costs appear in service costs
- After several months, education affects residential development patterns
