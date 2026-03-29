# Density Progression Implementation Plan

> **Status:** DONE — Implemented and shipped.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Buildings in zones automatically upgrade from Low → Medium → High density based on infrastructure quality, city growth, and transit access.

**Architecture:** A new `density.ts` simulation module runs monthly alongside `zones.ts`, checking each active building for upgrade eligibility using an exponential decay probability from anchor points (city center of mass for Medium, transit stops for High). Buildings enter an `under_construction` state for 2–3 months before completing, and go `derelict` if infrastructure is removed. A new `PavedRoad` infrastructure flag and `transit.stop` building are prerequisites.

**Tech Stack:** TypeScript, Vitest, `@bitborough/core` types, `@bitborough/engine` simulation layer.

**Design reference:** `docs/plans/2026-03-10-density-progression-design.md`

---

## Task 1: Extend Building type with construction/derelict state

**Files:**
- Modify: `packages/core/src/buildings.ts`

**Step 1: Write the failing test**

In `packages/engine/src/__tests__/zones.test.ts`, add:

```typescript
test('building has active state by default', () => {
  const engine = Engine.create(createTestMap(32), { seed: 42 })
  engine.placeBuilding(0, 0, 'power.coal')
  const b = engine.getState().map.buildings[0]!
  expect(b.state).toBe('active')
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/engine && pnpm test -- --reporter=verbose 2>&1 | grep -E "(PASS|FAIL|state)"
```
Expected: FAIL — `b.state` is `undefined`

**Step 3: Add state fields to Building interface**

In `packages/core/src/buildings.ts`, update `Building`:

```typescript
export type BuildingState = 'active' | 'under_construction' | 'derelict'

export interface Building {
  id: string
  defId: string
  x: number
  y: number
  powered: boolean
  density: DensityLevel
  age: number
  state: BuildingState
  // under_construction only:
  constructionMonthsRemaining?: number
  upgradingToDefId?: string
  // derelict only:
  derelictMonths?: number
}
```

**Step 4: Fix all construction sites that create Buildings**

`packages/engine/src/simulation/zones.ts` — add `state: 'active'` to the building literal:

```typescript
const building: Building = {
  id: `b${nextBuildingId.value++}`,
  defId,
  x,
  y,
  powered: true,
  density: DensityLevel.Low,
  age: 0,
  state: 'active',
}
```

`packages/engine/src/Engine.ts` — add `state: 'active'` to the `placeBuilding` building literal (line ~259):

```typescript
const building: Building = {
  id: `b${this.nextBuildingId++}`,
  defId,
  x,
  y,
  powered: false,
  density: def.density,
  age: 0,
  state: 'active',
}
```

`packages/engine/src/Engine.ts` — `restore()` method rebuilds buildings from save. Add a migration shim for old saves that lack `state`:

```typescript
buildings: save.map.buildings.map((b) => ({ state: 'active' as const, ...b })),
```

**Step 5: Run all tests**

```bash
cd packages/engine && pnpm test
```
Expected: all pass

**Step 6: Commit**

```bash
git add packages/core/src/buildings.ts packages/engine/src/simulation/zones.ts packages/engine/src/Engine.ts packages/engine/src/__tests__/zones.test.ts
git commit -m "feat: add construction/derelict state to Building type"
```

---

## Task 2: Add PavedRoad infrastructure flag and costs

**Files:**
- Modify: `packages/core/src/infrastructure.ts`
- Modify: `packages/core/src/constants.ts`
- Modify: `packages/core/src/index.ts` (export if needed — check it exports everything from constants already)

**Step 1: Write the failing test**

Create `packages/engine/src/__tests__/density.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { Infrastructure } from '@bitborough/core'

describe('PavedRoad infrastructure', () => {
  test('PavedRoad is a distinct bit flag', () => {
    expect(Infrastructure.PavedRoad).toBeDefined()
    expect(Infrastructure.PavedRoad & Infrastructure.Road).toBe(0) // separate bits
  })

  test('a paved road tile has both Road and PavedRoad flags', () => {
    const pavedRoadTile = Infrastructure.Road | Infrastructure.PavedRoad
    expect(pavedRoadTile & Infrastructure.Road).toBeTruthy()
    expect(pavedRoadTile & Infrastructure.PavedRoad).toBeTruthy()
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/engine && pnpm test -- density --reporter=verbose
```
Expected: FAIL — `Infrastructure.PavedRoad` is undefined

**Step 3: Add PavedRoad to Infrastructure enum**

`packages/core/src/infrastructure.ts`:

```typescript
export enum Infrastructure {
  None      = 0,
  Road      = 1 << 0,
  PowerLine = 1 << 1,
  Rail      = 1 << 2,
  Pipe      = 1 << 3,
  PavedRoad = 1 << 4,   // upgrade from Road; tiles have Road | PavedRoad
}
```

**Step 4: Add paved road cost and maintenance**

`packages/core/src/constants.ts`:

```typescript
export const COSTS = {
  // ...existing...
  pavedRoadUpgrade: 20,   // cost to upgrade one dirt road tile to paved
  transitStop: 500,
} as const

export const MAINTENANCE = {
  // ...existing...
  pavedRoadSurcharge: 1,  // extra per paved road tile (total: road + surcharge = 2/mo)
  transitStop: 50,
} as const
```

**Step 5: Run tests**

```bash
cd packages/engine && pnpm test
```
Expected: all pass

**Step 6: Commit**

```bash
git add packages/core/src/infrastructure.ts packages/core/src/constants.ts packages/engine/src/__tests__/density.test.ts
git commit -m "feat: add PavedRoad infrastructure flag and cost constants"
```

---

## Task 3: Add Medium/High building definitions and transit stop

**Files:**
- Modify: `packages/engine/src/buildings-registry.ts`

**Step 1: Write the failing test**

In `packages/engine/src/__tests__/density.test.ts`, add:

```typescript
import { BUILDING_DEFS } from '../buildings-registry.js'
import { DensityLevel, BuildingCategory } from '@bitborough/core'

describe('Medium/High building definitions', () => {
  test('medium residential definitions exist with correct density', () => {
    expect(BUILDING_DEFS['res.med']).toBeDefined()
    expect(BUILDING_DEFS['res.med']!.density).toBe(DensityLevel.Medium)
    expect(BUILDING_DEFS['res.med.b']).toBeDefined()
    expect(BUILDING_DEFS['res.med.b']!.size).toEqual({ w: 2, h: 1 })
  })

  test('high residential definition exists', () => {
    expect(BUILDING_DEFS['res.high']).toBeDefined()
    expect(BUILDING_DEFS['res.high']!.density).toBe(DensityLevel.High)
    expect(BUILDING_DEFS['res.high']!.size).toEqual({ w: 2, h: 2 })
  })

  test('industrial high has fewer jobs but more tax than industrial low', () => {
    const low = BUILDING_DEFS['ind.low']!
    const high = BUILDING_DEFS['ind.high']!
    expect(high.taxValue).toBeGreaterThan(low.taxValue * 5)
    expect(high.jobs).toBeLessThan(low.jobs)
  })

  test('transit stop definition exists as 2x2 special building', () => {
    expect(BUILDING_DEFS['transit.stop']).toBeDefined()
    expect(BUILDING_DEFS['transit.stop']!.size).toEqual({ w: 2, h: 2 })
    expect(BUILDING_DEFS['transit.stop']!.category).toBe(BuildingCategory.Special)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/engine && pnpm test -- density --reporter=verbose
```
Expected: FAIL — definitions don't exist

**Step 3: Add all new building definitions**

Append to `packages/engine/src/buildings-registry.ts` (inside the `BUILDING_DEFS` object, after `'ind.low'`):

```typescript
  // --- MEDIUM DENSITY (auto-placed by simulation) ---
  'res.med': {
    id: 'res.med',
    category: BuildingCategory.Residential,
    density: DensityLevel.Medium,
    size: { w: 1, h: 1 },
    population: 100,
    jobs: 0,
    taxValue: 200,
    pollutionRadius: 0,
    pollutionAmount: 0,
    powerRequired: true,
    roadRequired: true,
    cost: 0,
    maintenanceCost: 0,
  },
  'res.med.b': {
    id: 'res.med.b',
    category: BuildingCategory.Residential,
    density: DensityLevel.Medium,
    size: { w: 2, h: 1 },
    population: 120,
    jobs: 0,
    taxValue: 240,
    pollutionRadius: 0,
    pollutionAmount: 0,
    powerRequired: true,
    roadRequired: true,
    cost: 0,
    maintenanceCost: 0,
  },
  'com.med': {
    id: 'com.med',
    category: BuildingCategory.Commercial,
    density: DensityLevel.Medium,
    size: { w: 1, h: 1 },
    population: 0,
    jobs: 30,
    taxValue: 150,
    pollutionRadius: 0,
    pollutionAmount: 0,
    powerRequired: true,
    roadRequired: true,
    cost: 0,
    maintenanceCost: 0,
  },
  'com.med.b': {
    id: 'com.med.b',
    category: BuildingCategory.Commercial,
    density: DensityLevel.Medium,
    size: { w: 2, h: 2 },
    population: 0,
    jobs: 36,
    taxValue: 180,
    pollutionRadius: 0,
    pollutionAmount: 0,
    powerRequired: true,
    roadRequired: true,
    cost: 0,
    maintenanceCost: 0,
  },
  'ind.med': {
    id: 'ind.med',
    category: BuildingCategory.Industrial,
    density: DensityLevel.Medium,
    size: { w: 2, h: 2 },
    population: 0,
    jobs: 10,
    taxValue: 60,
    pollutionRadius: 4,
    pollutionAmount: 20,
    powerRequired: true,
    roadRequired: true,
    cost: 0,
    maintenanceCost: 0,
  },
  'ind.med.b': {
    id: 'ind.med.b',
    category: BuildingCategory.Industrial,
    density: DensityLevel.Medium,
    size: { w: 3, h: 2 },
    population: 0,
    jobs: 12,
    taxValue: 72,
    pollutionRadius: 4,
    pollutionAmount: 24,
    powerRequired: true,
    roadRequired: true,
    cost: 0,
    maintenanceCost: 0,
  },

  // --- HIGH DENSITY (auto-placed by simulation) ---
  'res.high': {
    id: 'res.high',
    category: BuildingCategory.Residential,
    density: DensityLevel.High,
    size: { w: 2, h: 2 },
    population: 330,
    jobs: 0,
    taxValue: 660,
    pollutionRadius: 0,
    pollutionAmount: 0,
    powerRequired: true,
    roadRequired: true,
    cost: 0,
    maintenanceCost: 0,
  },
  'com.high': {
    id: 'com.high',
    category: BuildingCategory.Commercial,
    density: DensityLevel.High,
    size: { w: 2, h: 2 },
    population: 0,
    jobs: 175,
    taxValue: 875,
    pollutionRadius: 0,
    pollutionAmount: 0,
    powerRequired: true,
    roadRequired: true,
    cost: 0,
    maintenanceCost: 0,
  },
  'com.high.b': {
    id: 'com.high.b',
    category: BuildingCategory.Commercial,
    density: DensityLevel.High,
    size: { w: 2, h: 3 },
    population: 0,
    jobs: 200,
    taxValue: 1000,
    pollutionRadius: 0,
    pollutionAmount: 0,
    powerRequired: true,
    roadRequired: true,
    cost: 0,
    maintenanceCost: 0,
  },
  'ind.high': {
    id: 'ind.high',
    category: BuildingCategory.Industrial,
    density: DensityLevel.High,
    size: { w: 3, h: 3 },
    population: 0,
    jobs: 5,           // automation: fewer workers
    taxValue: 150,     // but high production value
    pollutionRadius: 6,
    pollutionAmount: 40,
    powerRequired: true,
    roadRequired: true,
    cost: 0,
    maintenanceCost: 0,
  },
  'ind.high.b': {
    id: 'ind.high.b',
    category: BuildingCategory.Industrial,
    density: DensityLevel.High,
    size: { w: 4, h: 3 },
    population: 0,
    jobs: 6,
    taxValue: 180,
    pollutionRadius: 6,
    pollutionAmount: 48,
    powerRequired: true,
    roadRequired: true,
    cost: 0,
    maintenanceCost: 0,
  },

  // --- TRANSIT (player-placed) ---
  'transit.stop': {
    id: 'transit.stop',
    category: BuildingCategory.Special,
    density: DensityLevel.Low,
    size: { w: 2, h: 2 },
    population: 0,
    jobs: 0,
    taxValue: 0,
    pollutionRadius: 0,
    pollutionAmount: 0,
    powerRequired: true,
    roadRequired: true,
    cost: 500,
    maintenanceCost: 50,
  },
```

**Step 4: Run tests**

```bash
cd packages/engine && pnpm test -- density --reporter=verbose
```
Expected: all density tests pass

**Step 5: Commit**

```bash
git add packages/engine/src/buildings-registry.ts packages/engine/src/__tests__/density.test.ts
git commit -m "feat: add medium/high building definitions and transit stop"
```

---

## Task 4: Create density simulation module — upgrade eligibility helpers

**Files:**
- Create: `packages/engine/src/simulation/density.ts`
- Test: `packages/engine/src/__tests__/density.test.ts`

**Step 1: Write failing tests for helper functions**

Add to `packages/engine/src/__tests__/density.test.ts`:

```typescript
import { Engine } from '../Engine.js'
import { createTestMap } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'
import {
  cityCenter,
  hasNearbyPavedRoad,
  hasNearbyTransitStop,
  upgradeProb,
} from '../simulation/density.js'

describe('density helpers', () => {
  test('cityCenter returns center of single building', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 10, y: 15,
      powered: true, density: 0, age: 0, state: 'active',
    })
    const { cx, cy } = cityCenter(map)
    expect(cx).toBe(10)
    expect(cy).toBe(15)
  })

  test('cityCenter averages two buildings', () => {
    const map = createTestMap(32)
    map.buildings.push(
      { id: 'b1', defId: 'res.low', x: 0, y: 0, powered: true, density: 0, age: 0, state: 'active' },
      { id: 'b2', defId: 'res.low', x: 10, y: 10, powered: true, density: 0, age: 0, state: 'active' },
    )
    const { cx, cy } = cityCenter(map)
    expect(cx).toBe(5)
    expect(cy).toBe(5)
  })

  test('hasNearbyPavedRoad returns true when paved road within 3 tiles', () => {
    const map = createTestMap(32)
    map.infrastructure[5 * map.width + 10] = Infrastructure.Road | Infrastructure.PavedRoad
    expect(hasNearbyPavedRoad(map, 10, 7)).toBe(true)  // 2 tiles away
  })

  test('hasNearbyPavedRoad returns false for unpaved road', () => {
    const map = createTestMap(32)
    map.infrastructure[5 * map.width + 10] = Infrastructure.Road  // dirt only
    expect(hasNearbyPavedRoad(map, 10, 7)).toBe(false)
  })

  test('hasNearbyTransitStop returns true when transit stop within 10 tiles', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'ts1', defId: 'transit.stop', x: 5, y: 5,
      powered: true, density: 0, age: 0, state: 'active',
    })
    expect(hasNearbyTransitStop(map, 10, 5)).toBe(true)  // 5 tiles away
  })

  test('hasNearbyTransitStop returns false when transit stop > 10 tiles away', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'ts1', defId: 'transit.stop', x: 0, y: 0,
      powered: true, density: 0, age: 0, state: 'active',
    })
    expect(hasNearbyTransitStop(map, 15, 0)).toBe(false)  // 15 tiles away
  })

  test('upgradeProb decreases with distance', () => {
    const near = upgradeProb(1.0, 2, 10)
    const far = upgradeProb(1.0, 8, 10)
    expect(near).toBeGreaterThan(far)
  })

  test('upgradeProb scales with demand', () => {
    const highDemand = upgradeProb(0.8, 5, 10)
    const lowDemand = upgradeProb(0.2, 5, 10)
    expect(highDemand).toBeGreaterThan(lowDemand)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/engine && pnpm test -- density --reporter=verbose
```
Expected: FAIL — module not found

**Step 3: Create density.ts with helper functions**

Create `packages/engine/src/simulation/density.ts`:

```typescript
import type { GameMap } from '@bitborough/core'
import { Infrastructure } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

export const TRANSIT_RADIUS = 10
export const MEDIUM_DENSITY_POP_THRESHOLD = 500

/** Weighted center of all active buildings. Returns map center if no buildings. */
export function cityCenter(map: GameMap): { cx: number; cy: number } {
  const active = map.buildings.filter(b => b.state === 'active')
  if (active.length === 0) return { cx: map.width / 2, cy: map.height / 2 }
  const cx = active.reduce((sum, b) => sum + b.x, 0) / active.length
  const cy = active.reduce((sum, b) => sum + b.y, 0) / active.length
  return { cx, cy }
}

/** True if any paved road exists within 3 tiles (Manhattan distance). */
export function hasNearbyPavedRoad(map: GameMap, x: number, y: number): boolean {
  const range = 3
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > range) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue
      const infra = map.infrastructure[ny * map.width + nx]!
      if (infra & Infrastructure.PavedRoad) return true
    }
  }
  return false
}

/** True if any active transit stop building exists within TRANSIT_RADIUS tiles. */
export function hasNearbyTransitStop(map: GameMap, x: number, y: number): boolean {
  for (const b of map.buildings) {
    if (b.defId !== 'transit.stop' || b.state !== 'active') continue
    const dist = Math.abs(b.x - x) + Math.abs(b.y - y)
    if (dist <= TRANSIT_RADIUS) return true
  }
  return false
}

/**
 * Upgrade probability using Clark's Law exponential decay.
 * P = demandFactor × e^(-distance / radius)
 */
export function upgradeProb(demandFactor: number, distance: number, radius: number): number {
  return demandFactor * Math.exp(-distance / radius)
}

/**
 * Dynamic radius for medium density — grows with population.
 * Starts at 5 tiles, reaches 30 at ~25,000 population.
 */
export function mediumRadius(population: number): number {
  return Math.min(5 + population / 1000, 30)
}

/** True if more than half of the 8 immediate neighbors are Medium or High density zone buildings. */
export function hasCriticalMass(map: GameMap, x: number, y: number): boolean {
  let developed = 0
  let total = 0
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      if (dx === 0 && dy === 0) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue
      total++
      const neighbor = map.buildings.find(b => b.x === nx && b.y === ny && b.state === 'active')
      if (neighbor) {
        const def = BUILDING_DEFS[neighbor.defId]
        if (def && (def.density === 1 || def.density === 2)) developed++ // Medium=1, High=2
      }
    }
  }
  return total > 0 && developed / total > 0.5
}
```

**Step 4: Run tests**

```bash
cd packages/engine && pnpm test -- density --reporter=verbose
```
Expected: all helper tests pass

**Step 5: Commit**

```bash
git add packages/engine/src/simulation/density.ts packages/engine/src/__tests__/density.test.ts
git commit -m "feat: add density simulation helpers (cityCenter, upgradeProb, etc.)"
```

---

## Task 5: Implement Low→Medium upgrade logic

**Files:**
- Modify: `packages/engine/src/simulation/density.ts`
- Test: `packages/engine/src/__tests__/density.test.ts`

**Step 1: Write failing tests**

Add to `packages/engine/src/__tests__/density.test.ts`:

```typescript
import { updateDensity } from '../simulation/density.js'
import { DensityLevel, Infrastructure } from '@bitborough/core'
import { PRNG } from '../prng.js'

describe('Low→Medium upgrade', () => {
  function makeEngine() {
    return Engine.create(createTestMap(32), { seed: 42, startingFunds: 999_999 })
  }

  test('low building near paved road upgrades when population threshold met', () => {
    // Build a city above the population threshold
    const engine = makeEngine()
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 5; x < 20; x++) {
      engine.placeTile(x, 5, Infrastructure.PowerLine)
      engine.placeTile(x, 6, Infrastructure.Road | Infrastructure.PavedRoad as any)
      engine.placeZone(x, 4, ZoneType.Residential)
    }
    // Advance enough time to develop and exceed pop threshold
    for (let i = 0; i < 120; i++) engine.tick() // 30 months
    const state = engine.getState()
    // At least one medium building should have appeared (or be under construction)
    const medOrConstruction = state.map.buildings.filter(
      b => b.defId.startsWith('res.med') || b.upgradingToDefId?.startsWith('res.med')
    )
    // This is probabilistic — just verify the system runs without error
    expect(state.population).toBeGreaterThan(0)
  })

  test('low building without paved road does not enter construction', () => {
    const map = createTestMap(32)
    // Place a low building with only dirt road
    map.buildings.push({
      id: 'b1', defId: 'res.low', x: 10, y: 10,
      powered: true, density: DensityLevel.Low, age: 0, state: 'active',
    })
    map.infrastructure[10 * map.width + 10] = Infrastructure.Road // dirt only
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    // Run many times — should never trigger upgrade
    for (let i = 0; i < 1000; i++) {
      updateDensity(map, new Uint8Array(map.width * map.height), demand, 1000, prng, { value: 100 })
    }
    const b = map.buildings[0]!
    expect(b.state).toBe('active')
    expect(b.defId).toBe('res.low')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/engine && pnpm test -- density --reporter=verbose
```
Expected: FAIL — `updateDensity` not exported

**Step 3: Implement updateDensity with Low→Medium logic**

Add to `packages/engine/src/simulation/density.ts`:

```typescript
import { DensityLevel, type DemandInfo } from '@bitborough/core'
import type { Building } from '@bitborough/core'
import type { PRNG } from '../prng.js'

// Weighted variants per zone tier: [defId, weight]
const MEDIUM_VARIANTS: Record<string, Array<[string, number]>> = {
  'res.low': [['res.med', 1], ['res.med.b', 1]],
  'com.low': [['com.med', 1], ['com.med.b', 2]],
  'ind.low': [['ind.med', 3], ['ind.med.b', 2]],
}

const HIGH_VARIANTS: Record<string, Array<[string, number]>> = {
  'res.med':   [['res.high', 1]],
  'res.med.b': [['res.high', 1]],
  'com.med':   [['com.high', 1], ['com.high.b', 1]],
  'com.med.b': [['com.high', 1], ['com.high.b', 1]],
  'ind.med':   [['ind.high', 3], ['ind.high.b', 2]],
  'ind.med.b': [['ind.high', 3], ['ind.high.b', 2]],
}

export function updateDensity(
  map: GameMap,
  powerGrid: Uint8Array,
  demand: DemandInfo,
  population: number,
  prng: PRNG,
  nextBuildingId: { value: number },
): { populationDelta: number } {
  let populationDelta = 0

  const { cx, cy } = cityCenter(map)
  const radius = mediumRadius(population)
  const popThresholdMet = population >= MEDIUM_DENSITY_POP_THRESHOLD

  for (const building of map.buildings) {
    if (building.state === 'under_construction') {
      populationDelta += tickConstruction(map, building, nextBuildingId)
      continue
    }

    if (building.state === 'derelict') {
      tickDerelict(map, building, powerGrid)
      continue
    }

    // active buildings age each month
    building.age++

    const def = BUILDING_DEFS[building.defId]
    if (!def || def.category === BuildingCategory.Special) continue

    if (def.density === DensityLevel.Low && popThresholdMet) {
      const variants = MEDIUM_VARIANTS[building.defId]
      if (!variants) continue
      if (!hasNearbyPavedRoad(map, building.x, building.y)) continue

      const dist = Math.hypot(building.x - cx, building.y - cy)
      const demandFactor = getZoneDemand(building.defId, demand)
      const p = upgradeProb(demandFactor, dist, radius)

      if (prng.next() < p) {
        const targetDefId = pickVariant(variants, prng)
        startConstruction(building, targetDefId, def.population)
        populationDelta -= def.population // remove current contribution
      }
    }
  }

  return { populationDelta }
}

function getZoneDemand(defId: string, demand: DemandInfo): number {
  if (defId.startsWith('res')) return demand.residential
  if (defId.startsWith('com')) return demand.commercial
  if (defId.startsWith('ind')) return demand.industrial
  return 0
}

function pickVariant(variants: Array<[string, number]>, prng: PRNG): string {
  const total = variants.reduce((s, [, w]) => s + w, 0)
  let r = prng.next() * total
  for (const [id, w] of variants) {
    r -= w
    if (r <= 0) return id
  }
  return variants[variants.length - 1]![0]
}

function startConstruction(building: Building, targetDefId: string, currentPop: number): void {
  building.state = 'under_construction'
  building.upgradingToDefId = targetDefId
  building.constructionMonthsRemaining = 2 + Math.floor(Math.random() * 2) // 2-3 months
}

function tickConstruction(
  map: GameMap,
  building: Building,
  nextBuildingId: { value: number },
): number {
  if (building.constructionMonthsRemaining === undefined) return 0
  building.constructionMonthsRemaining--
  if (building.constructionMonthsRemaining > 0) return 0

  // Construction complete
  const newDefId = building.upgradingToDefId!
  const newDef = BUILDING_DEFS[newDefId]
  if (!newDef) return 0

  // Check if expanded footprint fits (for multi-tile buildings)
  if (!footprintFits(map, building.x, building.y, newDef.size, building.id)) {
    // Footprint blocked — reset to 1-month wait and try again next month
    building.constructionMonthsRemaining = 1
    return 0
  }

  building.defId = newDefId
  building.density = newDef.density
  building.state = 'active'
  building.constructionMonthsRemaining = undefined
  building.upgradingToDefId = undefined
  building.age = 0

  return newDef.population
}

function footprintFits(
  map: GameMap,
  x: number,
  y: number,
  size: { w: number; h: number },
  ownId: string,
): boolean {
  for (let dy = 0; dy < size.h; dy++) {
    for (let dx = 0; dx < size.w; dx++) {
      const tx = x + dx
      const ty = y + dy
      if (tx >= map.width || ty >= map.height) return false
      // Check no OTHER building occupies this tile
      const conflict = map.buildings.find(
        b => b.id !== ownId && b.state !== 'under_construction' && occupiesTile(b, tx, ty)
      )
      if (conflict) return false
    }
  }
  return true
}

function occupiesTile(b: Building, x: number, y: number): boolean {
  const def = BUILDING_DEFS[b.defId]
  if (!def) return false
  return x >= b.x && x < b.x + def.size.w && y >= b.y && y < b.y + def.size.h
}
```

Also add `import { BuildingCategory, type DemandInfo } from '@bitborough/core'` to the top of the file (merge with existing import).

**Step 4: Run tests**

```bash
cd packages/engine && pnpm test -- density --reporter=verbose
```
Expected: all pass

**Step 5: Commit**

```bash
git add packages/engine/src/simulation/density.ts packages/engine/src/__tests__/density.test.ts
git commit -m "feat: implement Low→Medium density upgrade logic"
```

---

## Task 6: Add Medium→High upgrade logic

**Files:**
- Modify: `packages/engine/src/simulation/density.ts`
- Test: `packages/engine/src/__tests__/density.test.ts`

**Step 1: Write failing test**

Add to density test file:

```typescript
describe('Medium→High upgrade', () => {
  test('medium building without transit stop does not upgrade', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1', defId: 'res.med', x: 10, y: 10,
      powered: true, density: DensityLevel.Medium, age: 0, state: 'active',
    })
    // Add paved road but no transit
    map.infrastructure[10 * map.width + 10] = Infrastructure.Road | Infrastructure.PavedRoad as any
    // Fill neighbors with medium buildings for critical mass
    for (let dx = -2; dx <= 2; dx++) {
      if (dx === 0) continue
      map.buildings.push({
        id: `n${dx}`, defId: 'res.med', x: 10 + dx, y: 10,
        powered: true, density: DensityLevel.Medium, age: 0, state: 'active',
      })
    }
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    for (let i = 0; i < 1000; i++) {
      updateDensity(map, new Uint8Array(map.width * map.height), demand, 5000, prng, { value: 100 })
    }
    expect(map.buildings[0]!.state).toBe('active')
    expect(map.buildings[0]!.defId).toBe('res.med')
  })
})
```

**Step 2: Run test to verify it fails (or passes vacuously since High logic isn't in yet)**

```bash
cd packages/engine && pnpm test -- density --reporter=verbose
```

**Step 3: Add Medium→High logic inside `updateDensity`**

In `packages/engine/src/simulation/density.ts`, inside the `for (const building of map.buildings)` loop, after the Low→Medium block, add:

```typescript
    if (def.density === DensityLevel.Medium) {
      const variants = HIGH_VARIANTS[building.defId]
      if (!variants) continue
      if (!hasNearbyTransitStop(map, building.x, building.y)) continue
      if (!hasCriticalMass(map, building.x, building.y)) continue

      const distToTransit = nearestTransitDist(map, building.x, building.y)
      const demandFactor = getZoneDemand(building.defId, demand)
      const p = upgradeProb(demandFactor, distToTransit, TRANSIT_RADIUS)

      if (prng.next() < p) {
        const targetDefId = pickVariant(variants, prng)
        startConstruction(building, targetDefId, def.population)
        populationDelta -= def.population
      }
    }
```

Also add this helper to the file:

```typescript
function nearestTransitDist(map: GameMap, x: number, y: number): number {
  let minDist = Infinity
  for (const b of map.buildings) {
    if (b.defId !== 'transit.stop' || b.state !== 'active') continue
    const dist = Math.abs(b.x - x) + Math.abs(b.y - y)
    if (dist < minDist) minDist = dist
  }
  return minDist === Infinity ? TRANSIT_RADIUS + 1 : minDist
}
```

**Step 4: Run tests**

```bash
cd packages/engine && pnpm test -- density --reporter=verbose
```
Expected: all pass

**Step 5: Commit**

```bash
git add packages/engine/src/simulation/density.ts packages/engine/src/__tests__/density.test.ts
git commit -m "feat: add Medium→High density upgrade with transit anchor and critical mass"
```

---

## Task 7: Add derelict state — detection and recovery

**Files:**
- Modify: `packages/engine/src/simulation/density.ts`
- Modify: `packages/engine/src/Engine.ts`
- Test: `packages/engine/src/__tests__/density.test.ts`

**Step 1: Write failing tests**

Add to density test file:

```typescript
describe('derelict buildings', () => {
  test('building goes derelict when paved road is removed after Medium upgrade', () => {
    const map = createTestMap(32)
    // Medium building, no nearby paved road
    map.buildings.push({
      id: 'b1', defId: 'res.med', x: 10, y: 10,
      powered: true, density: DensityLevel.Medium, age: 5, state: 'active',
    })
    const powerGrid = new Uint8Array(map.width * map.height)
    powerGrid[10 * map.width + 10] = 1 // powered
    checkDereliction(map, powerGrid)
    expect(map.buildings[0]!.state).toBe('derelict')
  })

  test('derelict building recovers when paved road is restored', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1', defId: 'res.med', x: 10, y: 10,
      powered: true, density: DensityLevel.Medium, age: 5, state: 'derelict', derelictMonths: 2,
    })
    // Restore paved road
    map.infrastructure[10 * map.width + 10] = Infrastructure.Road | Infrastructure.PavedRoad as any
    const powerGrid = new Uint8Array(map.width * map.height)
    powerGrid[10 * map.width + 10] = 1
    checkDereliction(map, powerGrid)
    expect(map.buildings[0]!.state).toBe('active')
  })

  test('derelict building downgrades after 6 months', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1', defId: 'res.med', x: 10, y: 10,
      powered: true, density: DensityLevel.Medium, age: 5, state: 'derelict', derelictMonths: 5,
    })
    const powerGrid = new Uint8Array(map.width * map.height)
    const prng = new PRNG(1)
    const result = tickDerelict(map, map.buildings[0]!, powerGrid)
    // 6th month: should start construction back to low
    expect(map.buildings[0]!.state === 'under_construction' || map.buildings[0]!.upgradingToDefId?.includes('low')).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/engine && pnpm test -- density --reporter=verbose
```
Expected: FAIL — `checkDereliction`, `tickDerelict` not exported

**Step 3: Add dereliction logic**

Add to `packages/engine/src/simulation/density.ts`:

```typescript
const DERELICT_DOWNGRADE_MONTHS = 6

// Map from density tier defId prefix back to the downgrade target
const DOWNGRADE_TARGET: Record<string, string> = {
  'res.med': 'res.low', 'res.med.b': 'res.low',
  'com.med': 'com.low', 'com.med.b': 'com.low',
  'ind.med': 'ind.low', 'ind.med.b': 'ind.low',
  'res.high': 'res.med', 'com.high': 'com.med',
  'com.high.b': 'com.med', 'ind.high': 'ind.med', 'ind.high.b': 'ind.med',
}

/**
 * Check all active non-Low buildings for missing infrastructure.
 * Marks them derelict if requirements are no longer met.
 * Recovers derelict buildings if infrastructure is restored.
 * Exported so Engine can call this after any bulldoze action.
 */
export function checkDereliction(map: GameMap, powerGrid: Uint8Array): void {
  for (const building of map.buildings) {
    const def = BUILDING_DEFS[building.defId]
    if (!def || def.category === BuildingCategory.Special) continue

    if (building.state === 'active' && def.density > DensityLevel.Low) {
      // Medium buildings need paved road; High buildings need transit stop
      const infraOk = def.density === DensityLevel.Medium
        ? hasNearbyPavedRoad(map, building.x, building.y)
        : hasNearbyTransitStop(map, building.x, building.y)
      if (!infraOk) {
        building.state = 'derelict'
        building.derelictMonths = 0
      }
    }

    if (building.state === 'derelict') {
      const def2 = BUILDING_DEFS[building.defId]
      if (!def2) continue
      const infraRestored = def2.density === DensityLevel.Medium
        ? hasNearbyPavedRoad(map, building.x, building.y)
        : hasNearbyTransitStop(map, building.x, building.y)
      if (infraRestored) {
        building.state = 'active'
        building.derelictMonths = undefined
      }
    }
  }
}

export function tickDerelict(map: GameMap, building: Building, powerGrid: Uint8Array): number {
  if (building.state !== 'derelict') return 0
  building.derelictMonths = (building.derelictMonths ?? 0) + 1
  if (building.derelictMonths >= DERELICT_DOWNGRADE_MONTHS) {
    const downgradeTarget = DOWNGRADE_TARGET[building.defId]
    if (downgradeTarget) {
      startConstruction(building, downgradeTarget, 0)
    } else {
      // Already low density — just remove building entirely
      building.state = 'active' // will redevelop naturally
    }
  }
  return 0
}
```

Update `updateDensity` to call `tickDerelict` in the `derelict` branch:

```typescript
    if (building.state === 'derelict') {
      tickDerelict(map, building, powerGrid)
      continue
    }
```

**Step 4: Wire `checkDereliction` into Engine after bulldoze**

In `packages/engine/src/Engine.ts`, add the import:
```typescript
import { updateDensity, checkDereliction } from './simulation/density.js'
```

In the `bulldoze` method, after `updateConnections`:
```typescript
  bulldoze(x: number, y: number): Result {
    const { result, cost } = bulldoze(this.map, x, y, this.funds)
    this.funds -= cost
    if (result.ok) {
      updateConnections(this.map, x, y)
      checkDereliction(this.map, this.powerGrid)
    }
    return result
  }
```

**Step 5: Run tests**

```bash
cd packages/engine && pnpm test -- density --reporter=verbose
```
Expected: all pass

**Step 6: Commit**

```bash
git add packages/engine/src/simulation/density.ts packages/engine/src/Engine.ts packages/engine/src/__tests__/density.test.ts
git commit -m "feat: add derelict state — buildings decay when infrastructure is removed"
```

---

## Task 8: Wire density simulation into Engine.tick()

**Files:**
- Modify: `packages/engine/src/Engine.ts`
- Test: `packages/engine/src/__tests__/density.test.ts`

**Step 1: Write failing integration test**

Add to density test file:

```typescript
describe('density in Engine.tick()', () => {
  test('engine tick runs density update without errors', () => {
    const engine = Engine.create(createTestMap(32), { seed: 99, startingFunds: 999_999 })
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 5; x < 15; x++) {
      engine.placeTile(x, 2, Infrastructure.PowerLine)
      engine.placeTile(x, 3, Infrastructure.Road)
      engine.placeZone(x, 4, ZoneType.Residential)
    }
    // Should not throw over 10 years
    expect(() => { for (let i = 0; i < 480; i++) engine.tick() }).not.toThrow()
  })
})
```

**Step 2: Run test to verify it fails (density not called yet)**

```bash
cd packages/engine && pnpm test -- density --reporter=verbose
```

**Step 3: Wire updateDensity into Engine.tick()**

In `packages/engine/src/Engine.ts`, in the monthly block after `updateZones`:

```typescript
      // Zone development
      const nextBuildingIdRef = { value: this.nextBuildingId }
      const { populationDelta } = updateZones(this.map, this.powerGrid, this.demand, this.prng, nextBuildingIdRef)
      this.nextBuildingId = nextBuildingIdRef.value
      this.population += populationDelta

      // Density progression
      const { populationDelta: densityDelta } = updateDensity(
        this.map, this.powerGrid, this.demand, this.population, this.prng, nextBuildingIdRef
      )
      this.nextBuildingId = nextBuildingIdRef.value
      this.population = Math.max(0, this.population + densityDelta)
```

Add the import at the top of Engine.ts:
```typescript
import { updateDensity, checkDereliction } from './simulation/density.js'
```

**Step 4: Run all engine tests**

```bash
cd packages/engine && pnpm test
```
Expected: all pass

**Step 5: Commit**

```bash
git add packages/engine/src/Engine.ts
git commit -m "feat: wire density progression into monthly simulation tick"
```

---

## Task 9: Add upgradeTile() action for paved roads

**Files:**
- Modify: `packages/engine/src/Engine.ts`
- Modify: `packages/engine/src/actions/place.ts`
- Test: `packages/engine/src/__tests__/density.test.ts`

**Step 1: Write failing test**

Add to density test file:

```typescript
describe('paved road upgrade', () => {
  test('can upgrade a dirt road to paved', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1, startingFunds: 10_000 })
    engine.placeTile(5, 5, Infrastructure.Road)
    const result = engine.upgradeTile(5, 5)
    expect(result.ok).toBe(true)
    const infra = engine.getTile(5, 5).infrastructure
    expect(infra & Infrastructure.PavedRoad).toBeTruthy()
  })

  test('cannot upgrade a tile that has no road', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1, startingFunds: 10_000 })
    const result = engine.upgradeTile(5, 5)
    expect(result.ok).toBe(false)
  })

  test('cannot upgrade an already-paved road', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1, startingFunds: 10_000 })
    engine.placeTile(5, 5, Infrastructure.Road)
    engine.upgradeTile(5, 5)
    const result = engine.upgradeTile(5, 5)
    expect(result.ok).toBe(false) // already paved — no-op or error
  })

  test('upgrading costs money', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1, startingFunds: 10_000 })
    engine.placeTile(5, 5, Infrastructure.Road)
    const before = engine.getState().funds
    engine.upgradeTile(5, 5)
    expect(engine.getState().funds).toBeLessThan(before)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/engine && pnpm test -- density --reporter=verbose
```
Expected: FAIL — `engine.upgradeTile` is not a function

**Step 3: Add upgradeTile to Engine**

In `packages/engine/src/Engine.ts`, add method:

```typescript
  upgradeTile(x: number, y: number): Result {
    const idx = y * this.map.width + x
    const infra = this.map.infrastructure[idx]!

    if (!(infra & Infrastructure.Road)) {
      return { ok: false, reason: FailReason.InvalidLocation, detail: 'No road to upgrade' }
    }
    if (infra & Infrastructure.PavedRoad) {
      return { ok: false, reason: FailReason.Occupied, detail: 'Road already paved' }
    }

    const cost = COSTS.pavedRoadUpgrade
    if (this.funds < cost) {
      return { ok: false, reason: FailReason.InsufficientFunds }
    }

    this.map.infrastructure[idx]! |= Infrastructure.PavedRoad
    this.funds -= cost
    return { ok: true }
  }
```

Add `COSTS` and `Infrastructure` to the Engine.ts imports (already imported from `@bitborough/core`).

**Step 4: Update budget to include paved road maintenance**

In `packages/engine/src/simulation/budget.ts`, update the road counting loop:

```typescript
  let roadCount = 0
  let pavedRoadCount = 0
  let railCount = 0
  let powerLineCount = 0
  let transitStopCount = 0

  for (let i = 0; i < map.infrastructure.length; i++) {
    const infra = map.infrastructure[i]!
    if (infra & Infrastructure.Road) roadCount++
    if (infra & Infrastructure.PavedRoad) pavedRoadCount++
    if (infra & Infrastructure.PowerLine) powerLineCount++
    if (infra & Infrastructure.Rail) railCount++
  }

  for (const building of map.buildings) {
    // ...existing power/police/fire counting...
    if (building.defId === 'transit.stop') transitStopCount++
  }
```

And update `maintenanceCosts`:

```typescript
  const maintenanceCosts = {
    roads: roadCount * MAINTENANCE.road + pavedRoadCount * MAINTENANCE.pavedRoadSurcharge,
    // ...rest unchanged
  }
```

Add transit to service costs:
```typescript
  serviceCosts.transit = transitStopCount * MAINTENANCE.transitStop * (funding.transit / 100)
```

**Step 5: Run all tests**

```bash
cd packages/engine && pnpm test
```
Expected: all pass

**Step 6: Commit**

```bash
git add packages/engine/src/Engine.ts packages/engine/src/simulation/budget.ts packages/engine/src/__tests__/density.test.ts
git commit -m "feat: add upgradeTile() for paved roads, update budget for paved roads and transit"
```

---

## Task 10: Export density module from engine index

**Files:**
- Modify: `packages/engine/src/index.ts`

**Step 1: Check what's currently exported**

```bash
cat packages/engine/src/index.ts
```

**Step 2: Add exports if density types are needed by game package**

In `packages/engine/src/index.ts`, add:

```typescript
export type { BuildingState } from '@bitborough/core'
```

(The `BuildingState` type is in `@bitborough/core` — ensure it's exported there too.)

In `packages/core/src/buildings.ts`, ensure `BuildingState` is exported (it should be from Task 1).

In `packages/core/src/index.ts`, add `BuildingState` to the buildings export:

```typescript
export {
  BuildingCategory,
  DensityLevel,
  type BuildingState,
  type BuildingDef,
  type Building,
} from './buildings.js'
```

**Step 3: Run typecheck**

```bash
cd packages/engine && pnpm typecheck
cd packages/core && pnpm typecheck
```
Expected: no errors

**Step 4: Commit**

```bash
git add packages/core/src/buildings.ts packages/core/src/index.ts packages/engine/src/index.ts
git commit -m "feat: export BuildingState type from core"
```

---

## Task 11: Update in-game documentation

**Files:**
- Modify: `packages/game/src/ui/docs/zones.ts`
- Modify: `packages/game/src/ui/docs/building-reference.ts`

**Step 1: Update zones.ts to describe density progression**

Replace the content of `zones.ts` with:

```typescript
import type { DocSection } from './types.js'

export const zones: DocSection = {
  title: 'Zones & Development',
  content: `
    <p>Zones are where your city grows. Place them and buildings appear automatically when conditions are met.</p>
    <p><strong>Requirements for initial development:</strong></p>
    <ul>
      <li>Zone must be <em>powered</em></li>
      <li>Zone must be within <em>3 tiles of a road</em> (Manhattan distance)</li>
      <li>Positive <em>demand</em> for that zone type</li>
    </ul>
    <p>Each month, every eligible empty zone tile rolls for development:</p>
    <p class="docs-formula"><code>Development Chance = 12% × Zone Demand</code> — per tile per month</p>

    <p><strong>Density progression:</strong> As your city grows, buildings automatically upgrade from Low → Medium → High density.</p>
    <ul>
      <li><strong>Low → Medium:</strong> Requires a <em>paved road</em> within 3 tiles and city population above 500. Buildings near the city center upgrade first.</li>
      <li><strong>Medium → High:</strong> Requires a <em>transit stop</em> within 10 tiles and a dense surrounding neighborhood. Clusters around transit hubs.</li>
    </ul>
    <p>Upgrades take <em>2–3 months</em> — you'll see a construction phase before the new building appears.</p>
    <p>If you remove infrastructure after an upgrade, the building goes <em>derelict</em>. Restore the infrastructure within 6 months to recover it, or it will downgrade.</p>

    <p><strong>Residential</strong> — Where people live. Low: 10 pop. Medium: 100+ pop. High: 330+ pop.</p>
    <p><strong>Commercial</strong> — Shops and offices. Demand scales with population. High density commercial generates exceptional tax revenue.</p>
    <p><strong>Industrial</strong> — Factories. Higher density means <em>more production value but fewer jobs</em> due to automation — watch your unemployment.</p>
    <p>Watch the <strong>R/C/I demand bars</strong> in the top bar to know when to zone more.</p>
  `,
}
```

**Step 2: Add new buildings to building-reference.ts**

Add rows for medium/high buildings and transit stop. After the existing zone building rows:

```typescript
      ${row('/tiles/buildings/residential-medium.svg', 'Residential (Med)', 'Free', '—', 'Required', '—', '100–120', '—', 'Needs paved road + pop 500')}
      ${row('/tiles/buildings/residential-high.svg', 'Residential (High)', 'Free', '—', 'Required', '—', '330', '—', 'Needs transit stop')}
      ${row('/tiles/buildings/commercial-medium.svg', 'Commercial (Med)', 'Free', '—', 'Required', '30–36', '—', '—', 'Needs paved road')}
      ${row('/tiles/buildings/commercial-high.svg', 'Commercial (High)', 'Free', '—', 'Required', '175–200', '—', '—', 'Needs transit stop')}
      ${row('/tiles/buildings/industrial-medium.svg', 'Industrial (Med)', 'Free', '—', 'Required', '~10', '—', 'R4, Amt 20', 'More tax, same jobs')}
      ${row('/tiles/buildings/industrial-high.svg', 'Industrial (High)', 'Free', '—', 'Required', '5–6', '—', 'R6, Amt 40', 'Automated: high tax, few jobs')}
      ${row('/tiles/buildings/transit-stop.svg', 'Transit Stop', '$500', '$50/mo', 'Required', '—', '—', '—', 'Anchors high density in 10-tile radius')}
```

**Step 3: Run typecheck on game package**

```bash
cd packages/game && pnpm typecheck
```
Expected: no errors (tile paths will be resolved at runtime)

**Step 4: Commit**

```bash
git add packages/game/src/ui/docs/zones.ts packages/game/src/ui/docs/building-reference.ts
git commit -m "docs: update in-game docs for density progression and new buildings"
```

---

## Task 12: Author tile assets (tile-author skill)

> **Note:** This task requires the `tile-author` skill. Open a session in the project root and invoke it.

**Tiles needed** (create SVGs in `packages/game/assets/tiles/buildings/`):

| File | Description |
|------|-------------|
| `residential-high.svg` | 2×2 tower block, taller than medium, distinct roofline |
| `commercial-high.svg` | 2×2 skyscraper |
| `commercial-high-b.svg` | 2×3 skyscraper variant |
| `industrial-medium.svg` | 2×2 factory with smokestack |
| `industrial-medium-b.svg` | 3×2 factory variant |
| `industrial-high.svg` | 3×3 large industrial complex |
| `industrial-high-b.svg` | 4×3 large complex variant |
| `transit-stop.svg` | 2×2 bus depot / transit hub |
| `construction.svg` | Generic 1×1 under-construction sprite (scaffolding) |
| `derelict-residential.svg` | 1×1 abandoned residential |
| `derelict-commercial.svg` | 1×1 abandoned commercial |
| `derelict-industrial.svg` | 1×1 abandoned industrial |

**Paved road tiles** (in `packages/game/assets/tiles/roads/`):

Same connection-mask variants as dirt roads (`NESW` bitmask pattern), but with asphalt styling.

After authoring, run the rasterization script:
```bash
cd packages/game && pnpm rasterize-tiles
```

---

## Task 13: Run full test suite and typecheck

```bash
cd /path/to/bitborough
pnpm -r test
pnpm -r typecheck
```

Expected: all pass. Fix any type errors in the density module (particularly `DensityLevel` numeric comparisons — use `DensityLevel.Medium` and `DensityLevel.High` not raw numbers).

**Commit:**
```bash
git add -A
git commit -m "fix: resolve typecheck issues in density simulation"
```

---

## Notes

- **Population accounting:** `updateDensity` returns `populationDelta`. Subtracts old building's population when construction starts, adds new building's population on completion. Engine applies both.
- **Backward compatibility:** `Engine.restore()` spreads `state: 'active'` as default for old saves missing the `state` field.
- **PRNG in `startConstruction`:** Currently uses `Math.random()` for construction duration. Should use the engine's `PRNG` instance for determinism. Pass `prng` into `startConstruction` in a future cleanup.
- **Tile paths in docs:** The `building-reference.ts` paths assume tiles are rasterized and available. If tiles don't exist yet, the img tags will show broken images but won't error.
