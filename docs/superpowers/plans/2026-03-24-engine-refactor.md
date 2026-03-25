# Engine.ts Refactor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Break Engine.ts (686 lines) into three modules — engine-state.ts (state lifecycle), simulation/tick.ts (monthly sequence), and a slimmed Engine.ts (API shell) — so derived-state rebuild can never drift between init and restore.

**Architecture:** Extract `EngineState` interface and `createEngineState`/`rebuildDerivedState`/`serializeState`/`restoreState` into `engine-state.ts`. Extract the monthly tick sequence into `simulation/tick.ts`. Engine.ts becomes a thin wrapper holding an `EngineState` and delegating. The existing 342 tests serve as the correctness oracle — no new tests needed, all must pass after each task.

**Tech Stack:** TypeScript, Vitest, pnpm workspace monorepo (`@bitborough/engine`)

**Spec:** `docs/superpowers/specs/2026-03-24-engine-refactor-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `packages/engine/src/engine-state.ts` | Create | `EngineState` interface, `EngineConfig` interface, `createEngineState`, `rebuildDerivedState`, `serializeState`, `restoreState`, `computeLoanRepayment`, `maxPrefixedId` |
| `packages/engine/src/simulation/tick.ts` | Create | `monthlyTick`, `MonthlyTickResult`, `syncResidentialAgents` |
| `packages/engine/src/Engine.ts` | Modify | Slim to API shell using `EngineState`, delegates to new modules |
| `packages/engine/src/index.ts` | Modify | Re-export `EngineConfig` from `engine-state.ts` instead of `Engine.ts` |

---

## Chunk 1: Extract EngineState Interface and createEngineState

### Task 1: Create engine-state.ts with EngineState and createEngineState

**Files:**
- Create: `packages/engine/src/engine-state.ts`
- Modify: `packages/engine/src/Engine.ts`

- [ ] **Step 1: Create engine-state.ts with EngineState interface**

Create `packages/engine/src/engine-state.ts`. Define the `EngineState` interface containing ALL mutable simulation state currently on the Engine class (lines 85-133 of Engine.ts). Also move `EngineConfig` (lines 65-73) and `maxPrefixedId` (lines 75-82) here.

```typescript
import type { GameMap, BudgetInfo, DemandInfo, Loan, MonthlySnapshot, CitizenSummary } from '@bitborough/core'
import { DEFAULTS } from '@bitborough/core'
import { PRNG } from './prng.js'
import type { RoadGraph } from './road-graph.js'
import { buildRoadGraph } from './road-graph.js'
import type { FireState } from './simulation/services/fire.js'
import { createFireState } from './simulation/services/fire.js'
import { BuildingIndex } from './building-index.js'
import { createRegistry, EMPTY_CITIZEN_SUMMARY, type CitizenRegistry } from './simulation/citizens.js'

export interface EngineConfig {
  seed?: number
  startingFunds?: number
  ticksPerMonth?: number
  monthsPerYear?: number
  startYear?: number
  startMonth?: number
  taxRate?: number
}

export interface EngineState {
  map: GameMap
  prng: PRNG
  roadGraph: RoadGraph

  // Layers
  powerGrid: Uint8Array
  landValues: Uint8Array
  pollutionLevel: Uint8Array
  crimeLevel: Uint8Array
  fireCoverage: Uint8Array
  trafficDensity: Uint8Array
  reputationLayer: Float32Array

  // Scratch buffers
  influenceBuffer: Float32Array
  pollutionBuffer: Float32Array

  bldIdx: BuildingIndex
  citizenRegistry: CitizenRegistry
  citizenSummary: CitizenSummary
  fireState: FireState

  // Time
  tickCount: number
  month: number
  year: number
  ticksPerMonth: number
  monthsPerYear: number

  // Economy
  funds: number
  taxRate: number
  funding: { police: number; fire: number; transit: number }
  demand: DemandInfo
  budgetInfo: BudgetInfo
  loan: Loan | null
  loanRepaymentAmount: number

  nextBuildingId: number
  history: MonthlySnapshot[]
}

export function maxPrefixedId(items: ReadonlyArray<{ id: string }>, prefix: string): number {
  let max = 0
  for (const item of items) {
    const n = parseInt(item.id.slice(prefix.length), 10)
    if (n > max) max = n
  }
  return max
}

export function computeLoanRepayment(state: EngineState): number {
  if (!state.loan) return 0
  return Math.round(Math.min(state.loanRepaymentAmount, state.loan.remaining))
}
```

- [ ] **Step 2: Add `createEngineState` function**

Append to `engine-state.ts`. This replaces Engine's private constructor logic (lines 140-174):

```typescript
import { calculateDemand } from './simulation/demand.js'
import { calculateBudget } from './simulation/budget.js'
import { propagatePower } from './simulation/power.js'

export function createEngineState(map: GameMap, config: EngineConfig = {}): EngineState {
  const size = map.width * map.height
  const prng = new PRNG(config.seed ?? Date.now())
  const defaultFunds = DEFAULTS.startingFunds[map.width] ?? 20_000
  const funding = { police: 100, fire: 100, transit: 100 }
  const bldIdx = new BuildingIndex(map)
  const powerGrid = new Uint8Array(size)

  const state: EngineState = {
    map,
    prng,
    roadGraph: buildRoadGraph(map),
    powerGrid,
    landValues: new Uint8Array(size),
    pollutionLevel: new Uint8Array(size),
    crimeLevel: new Uint8Array(size),
    fireCoverage: new Uint8Array(size),
    trafficDensity: new Uint8Array(size),
    reputationLayer: new Float32Array(size).fill(0.5),
    influenceBuffer: new Float32Array(size),
    pollutionBuffer: new Float32Array(size),
    bldIdx,
    citizenRegistry: createRegistry(),
    citizenSummary: { ...EMPTY_CITIZEN_SUMMARY },
    fireState: createFireState(),
    tickCount: 0,
    month: config.startMonth ?? DEFAULTS.startMonth,
    year: config.startYear ?? DEFAULTS.startYear,
    ticksPerMonth: config.ticksPerMonth ?? DEFAULTS.ticksPerMonth,
    monthsPerYear: config.monthsPerYear ?? DEFAULTS.monthsPerYear,
    funds: config.startingFunds ?? defaultFunds,
    taxRate: config.taxRate ?? DEFAULTS.taxRate,
    funding,
    demand: { residential: 0, commercial: 0, industrial: 0 },
    budgetInfo: {} as BudgetInfo, // computed below
    loan: null,
    loanRepaymentAmount: 0,
    nextBuildingId: 1,
    history: [],
  }

  propagatePower(state.map, state.powerGrid, state.bldIdx)
  rebuildDerivedState(state)
  computeReputation(state.reputationLayer, state.map, state.crimeLevel, state.fireCoverage, state.pollutionLevel, state.bldIdx)
  state.demand = calculateDemand(state.map, state.taxRate)
  state.budgetInfo = calculateBudget(state.map, computeTotalPopulation(state.map), state.taxRate, state.landValues, state.funding)

  return state
}
```

Add the import for `computeTotalPopulation`:

```typescript
import { computeTotalPopulation } from './simulation/citizens.js'
```

- [ ] **Step 3: Add `rebuildDerivedState` function**

Add to `engine-state.ts`:

```typescript
import { calculatePollution } from './simulation/pollution.js'
import { calculateLandValues } from './simulation/land-value.js'
import { calculateCrime } from './simulation/services/crime.js'
import { calculateFireCoverage } from './simulation/services/fire.js'
import { computeReputation } from './simulation/reputation.js'

/**
 * Recompute derived layers from map state. Does NOT include reputation
 * (which must run after updateFires in the monthly tick) or power
 * (which runs every tick). Call computeReputation separately after
 * updateFires in the tick, or directly after this in create/restore.
 */
export function rebuildDerivedState(state: EngineState): void {
  state.bldIdx = new BuildingIndex(state.map)
  calculatePollution(state.map, state.pollutionLevel, state.pollutionBuffer)
  calculateLandValues(state.map, state.powerGrid, state.pollutionLevel, state.crimeLevel, state.landValues, state.bldIdx)
  calculateCrime(state.map, state.landValues, state.crimeLevel, state.funding.police, state.influenceBuffer)
  calculateFireCoverage(state.map, state.fireCoverage, state.funding.fire, state.influenceBuffer)
}
```

- [ ] **Step 4: Wire Engine to use createEngineState**

In `Engine.ts`, replace the private constructor body (lines 140-174) with:

```typescript
  private state: EngineState
  private speed: SimSpeed = SimSpeed.Normal
  private events: GameEvent[] = []

  private constructor(state: EngineState) {
    this.state = state
  }

  static create(map: GameMap, config: EngineConfig = {}): Engine {
    return new Engine(createEngineState(map, config))
  }
```

Update ALL `this.xyz` references in Engine methods to use `this.state.xyz` instead. This is the biggest mechanical step — every property access in Engine.ts needs `this.state.` prefix EXCEPT:
- `this.speed` (stays on Engine)
- `this.events` (stays on Engine)
- Method calls (`this.computeLoanRepayment()` → `computeLoanRepayment(this.state)`)
- The `population` getter → `computeTotalPopulation(this.state.map)`

Add imports at the top of Engine.ts:

```typescript
import { type EngineState, type EngineConfig, createEngineState, rebuildDerivedState, computeLoanRepayment, maxPrefixedId } from './engine-state.js'
```

Remove the duplicated types/functions from Engine.ts: `EngineConfig` interface, `maxPrefixedId` function, the private fields (they're now on `this.state`).

- [ ] **Step 5: Update index.ts exports**

In `packages/engine/src/index.ts`, change:

```typescript
export { Engine, type EngineConfig, type TileInfo } from './Engine.js'
```

To:

```typescript
export { Engine, type TileInfo } from './Engine.js'
export { type EngineConfig } from './engine-state.js'
```

- [ ] **Step 6: Run full test suite**

Run: `cd packages/engine && pnpm test -- --run`

Expected: All 342 tests pass. This is a mechanical refactor — if any test fails, it's because a `this.state.` was missed.

- [ ] **Step 7: Commit**

```bash
git add packages/engine/src/engine-state.ts packages/engine/src/Engine.ts packages/engine/src/index.ts
git commit -m "refactor: extract EngineState, createEngineState, rebuildDerivedState to engine-state.ts"
```

---

## Chunk 2: Extract Serialization

### Task 2: Move serialize and restore to engine-state.ts

**Files:**
- Modify: `packages/engine/src/engine-state.ts`
- Modify: `packages/engine/src/Engine.ts`

- [ ] **Step 1: Move `serializeState` to engine-state.ts**

Add to `engine-state.ts`. This is the body of Engine.serialize() (lines 535-587), with `this.` replaced by `state.`:

```typescript
export function serializeState(state: EngineState): SaveFile {
  const activeFires: Array<[number, number]> = Array.from(state.fireState.activeFires.entries())

  return {
    version: 7,
    map: {
      version: state.map.version,
      width: state.map.width,
      height: state.map.height,
      terrain: Array.from(state.map.terrain) as unknown as Uint8Array,
      zones: Array.from(state.map.zones) as unknown as Uint8Array,
      infrastructure: Array.from(state.map.infrastructure) as unknown as Uint16Array,
      connections: Array.from(state.map.connections) as unknown as Uint8Array,
      elevation: Array.from(state.map.elevation) as unknown as Uint8Array,
      buildings: state.map.buildings.map((b) => ({ ...b })),
      meta: { ...state.map.meta },
    },
    state: {
      funds: state.funds,
      population: computeTotalPopulation(state.map),
      month: state.month,
      year: state.year,
      tickCount: state.tickCount,
      taxRate: state.taxRate,
      funding: { ...state.funding },
      seed: state.prng.getInternalState(),
      activeFires,
      loan: state.loan,
      loanRepaymentAmount: state.loanRepaymentAmount,
      history: state.history,
      citizens: {
        samplingRatio: state.citizenRegistry.samplingRatio,
        agents: state.citizenRegistry.agents.map(a => ({
          id: a.id,
          homeBuildingId: a.homeBuildingId,
          homeAccessRoad: a.homeAccessRoad,
          workBuildingId: a.workBuildingId,
          workAccessRoad: a.workAccessRoad,
          commerceBuildingId: a.commerceBuildingId,
          commerceAccessRoad: a.commerceAccessRoad,
          homeWorkRoute: a.homeWorkRoute,
          homeCommerceRoute: a.homeCommerceRoute,
          satisfaction: a.satisfaction,
          demographics: a.demographics,
          wealthTier: a.wealthTier,
        })),
      },
      reputationLayer: Array.from(state.reputationLayer),
    },
    timestamp: new Date().toISOString(),
  }
}
```

Add `SaveFile` to the imports from `@bitborough/core`.

- [ ] **Step 2: Move `restoreState` to engine-state.ts**

Add to `engine-state.ts`. This is the body of Engine.restore() (lines 589-692), creating and returning an `EngineState` instead of an Engine:

```typescript
import { setNextAgentId, computeCitizenSummary } from './simulation/citizens.js'
import { BUILDING_DEFS } from './buildings-registry.js'

export function restoreState(save: SaveFile): EngineState {
  const map: GameMap = {
    version: save.map.version,
    width: save.map.width,
    height: save.map.height,
    terrain: new Uint8Array(save.map.terrain),
    zones: new Uint8Array(save.map.zones),
    infrastructure: new Uint16Array(save.map.infrastructure),
    connections: new Uint8Array(save.map.connections),
    elevation: new Uint8Array(save.map.elevation),
    buildings: save.map.buildings.map((b) => ({
      ...b,
      state: b.state ?? 'active',
      residents: b.residents ?? (save.version < 2 ? (BUILDING_DEFS[b.defId]?.capacity ?? 0) : 0),
      lowOccupancyMonths: b.lowOccupancyMonths,
    })),
    meta: { ...save.map.meta },
  }

  const size = map.width * map.height
  const prng = PRNG.fromState(save.state.seed)
  const roadGraph = buildRoadGraph(map)

  const citizenRegistry: CitizenRegistry = save.state.citizens
    ? {
        samplingRatio: save.state.citizens.samplingRatio,
        agents: save.state.citizens.agents.map(a => ({
          ...a,
          demographics: a.demographics ?? { children: 0, working: 50, elderly: 0 },
          wealthTier: a.wealthTier ?? 2,
          homeWorkRouteStale: false,
          homeCommerceRouteStale: false,
          homeWorkRouteTileSet: new Set(a.homeWorkRoute),
          homeCommerceRouteTileSet: new Set(a.homeCommerceRoute),
        })),
      }
    : createRegistry()

  if (citizenRegistry.agents.length > 0) {
    setNextAgentId(maxPrefixedId(citizenRegistry.agents, 'c') + 1)
  }

  const reputationLayer = save.state.reputationLayer
    ? new Float32Array(save.state.reputationLayer)
    : new Float32Array(size).fill(0.5)

  const funding = {
    police: save.state.funding.police ?? 100,
    fire: save.state.funding.fire ?? 100,
    transit: save.state.funding.transit ?? 100,
  }

  const state: EngineState = {
    map,
    prng,
    roadGraph,
    powerGrid: new Uint8Array(size),
    landValues: new Uint8Array(size),
    pollutionLevel: new Uint8Array(size),
    crimeLevel: new Uint8Array(size),
    fireCoverage: new Uint8Array(size),
    trafficDensity: new Uint8Array(size),
    reputationLayer,
    influenceBuffer: new Float32Array(size),
    pollutionBuffer: new Float32Array(size),
    bldIdx: new BuildingIndex(map),
    citizenRegistry,
    citizenSummary: computeCitizenSummary(citizenRegistry),
    fireState: createFireState(),
    tickCount: save.state.tickCount,
    month: save.state.month,
    year: save.state.year,
    ticksPerMonth: DEFAULTS.ticksPerMonth,
    monthsPerYear: DEFAULTS.monthsPerYear,
    funds: save.state.funds,
    taxRate: save.state.taxRate,
    funding,
    demand: { residential: 0, commercial: 0, industrial: 0 },
    budgetInfo: {} as BudgetInfo,
    loan: save.state.loan ?? null,
    loanRepaymentAmount: save.state.loanRepaymentAmount ?? (save.state.loan?.monthlyPayment ?? 0),
    nextBuildingId: maxPrefixedId(map.buildings, 'b') + 1,
    history: save.state.history ?? [],
  }

  // Restore active fires
  if (save.state.activeFires) {
    for (const [idx, remaining] of save.state.activeFires) {
      state.fireState.activeFires.set(idx, remaining)
    }
  }

  // Rebuild ALL derived state — same sequence as createEngineState
  propagatePower(state.map, state.powerGrid, state.bldIdx)
  rebuildDerivedState(state)
  computeReputation(state.reputationLayer, state.map, state.crimeLevel, state.fireCoverage, state.pollutionLevel, state.bldIdx)
  state.demand = calculateDemand(state.map, state.taxRate, undefined, state.citizenSummary)
  state.budgetInfo = calculateBudget(
    state.map,
    computeTotalPopulation(state.map),
    state.taxRate,
    state.landValues,
    state.funding,
    computeLoanRepayment(state),
  )

  return state
}
```

- [ ] **Step 3: Update Engine.ts to delegate serialize/restore**

Replace `Engine.serialize()` with:

```typescript
  serialize(): SaveFile {
    return serializeState(this.state)
  }
```

Replace `static restore()` with:

```typescript
  static restore(save: SaveFile): Engine {
    return new Engine(restoreState(save))
  }
```

Add imports for `serializeState`, `restoreState` from `./engine-state.js`.

Remove the old serialize/restore bodies and any now-unused imports from Engine.ts.

- [ ] **Step 4: Run full test suite**

Run: `cd packages/engine && pnpm test -- --run`

Expected: All 342 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/engine-state.ts packages/engine/src/Engine.ts
git commit -m "refactor: extract serializeState and restoreState to engine-state.ts"
```

---

## Chunk 3: Extract Monthly Tick

### Task 3: Move monthly tick to simulation/tick.ts

**Files:**
- Create: `packages/engine/src/simulation/tick.ts`
- Modify: `packages/engine/src/Engine.ts`

- [ ] **Step 1: Create simulation/tick.ts with monthlyTick**

Create `packages/engine/src/simulation/tick.ts`. Extract the monthly tick body from Engine.tick() (lines 189-306):

```typescript
import type { GameEvent } from '@bitborough/core'
import { BuildingCategory, calcMonthlyPayment } from '@bitborough/core'
import type { EngineState } from '../engine-state.js'
import { rebuildDerivedState, computeLoanRepayment } from '../engine-state.js'
import { computeReputation } from './reputation.js'
import { BUILDING_DEFS } from '../buildings-registry.js'
import { calculateDemand } from './demand.js'
import { calculateBudget } from './budget.js'
import { updateFires } from './services/fire.js'
import { citizenMonthlyTick, computeCitizenSummary, syncAgentsForBuilding, syncBuildingResidents, computeTotalPopulation, type TileLayers } from './citizens.js'
import { updateZones } from './zones.js'
import { updateDensity } from './density.js'
import { demographicTick } from './demographics.js'

export interface MonthlyTickResult {
  births: number
  deaths: number
  netMigration: number
  events: GameEvent[]
}

export function syncResidentialAgents(state: EngineState): void {
  for (const b of state.map.buildings) {
    if (b.state === 'active') {
      const def = BUILDING_DEFS[b.defId]
      if (def && def.category === BuildingCategory.Residential) {
        syncAgentsForBuilding(state.map, state.citizenRegistry, state.roadGraph, b, state.trafficDensity, state.prng, state.reputationLayer)
      }
    }
  }
}

export function monthlyTick(state: EngineState): MonthlyTickResult {
  const events: GameEvent[] = []

  // 0. Advance month/year
  state.month++
  if (state.month > state.monthsPerYear) {
    state.month = 1
    state.year++
  }

  // 1. Rebuild derived layers (bldIdx, pollution, land values, crime, fire coverage)
  rebuildDerivedState(state)

  // 2. Calculate demand
  state.demand = calculateDemand(state.map, state.taxRate, state.trafficDensity, state.citizenSummary)

  // 3. Update fires (after fire coverage, before reputation — fires can destroy buildings)
  updateFires(state.map, state.fireState, state.fireCoverage, state.prng, state.bldIdx)

  // 3b. Reputation (after fires, matches original Engine.ts tick order)
  computeReputation(state.reputationLayer, state.map, state.crimeLevel, state.fireCoverage, state.pollutionLevel, state.bldIdx)

  // 4. Citizen monthly tick
  const tileLayers: TileLayers = {
    crimeLevel: state.crimeLevel,
    fireCoverage: state.fireCoverage,
    pollutionLevel: state.pollutionLevel,
    reputationLayer: state.reputationLayer,
  }
  citizenMonthlyTick(state.citizenRegistry, state.map, state.roadGraph, state.trafficDensity, tileLayers, state.bldIdx)

  // 5. Citizen summary
  state.citizenSummary = computeCitizenSummary(state.citizenRegistry)

  // 6. Zone development
  const nextBuildingIdRef = { value: state.nextBuildingId }
  updateZones(state.map, state.powerGrid, state.demand, state.prng, nextBuildingIdRef, state.bldIdx)
  state.nextBuildingId = nextBuildingIdRef.value

  // 7. Density progression
  updateDensity(
    state.map, state.powerGrid, state.demand,
    computeTotalPopulation(state.map), state.prng, nextBuildingIdRef,
    state.crimeLevel, state.fireCoverage, state.pollutionLevel,
  )
  state.nextBuildingId = nextBuildingIdRef.value

  // 8. Sync agents after zone/density changes
  syncResidentialAgents(state)

  // 9. Demographics
  const demoResult = demographicTick(state.citizenRegistry, state.map, state.prng, state.citizenSummary.avgSatisfaction)
  syncBuildingResidents(state.map, state.citizenRegistry)
  syncResidentialAgents(state)

  // 10. Final citizen summary
  state.citizenSummary = computeCitizenSummary(state.citizenRegistry)
  state.citizenSummary.birthsLastTick = demoResult.births
  state.citizenSummary.deathsLastTick = demoResult.deaths
  state.citizenSummary.netMigrationLastTick = demoResult.netMigration

  // 11. Budget + loans
  const population = computeTotalPopulation(state.map)
  const loanRepayment = computeLoanRepayment(state)
  state.budgetInfo = calculateBudget(state.map, population, state.taxRate, state.landValues, state.funding, loanRepayment)
  state.funds += state.budgetInfo.balance

  if (state.loan) {
    const payment = state.budgetInfo.loanRepayment
    state.loan.remaining -= payment
    state.loan.monthsLeft = Math.max(0, state.loan.monthsLeft - 1)
    if (state.loan.remaining <= 0) {
      state.loan = null
      state.loanRepaymentAmount = 0
    }
  }

  if (state.funds < 0 && state.loan === null) {
    const baseExpenses = state.budgetInfo.maintenanceCosts.total + state.budgetInfo.serviceCosts.total
    const emergencyAmount = Math.max(10_000, -state.funds + baseExpenses * 6)
    const monthlyPayment = calcMonthlyPayment(emergencyAmount)
    state.loan = { principal: emergencyAmount, remaining: emergencyAmount, monthlyPayment, termMonths: 120, monthsLeft: 120, interestRate: 0.08 }
    state.loanRepaymentAmount = monthlyPayment
    state.funds += emergencyAmount
    events.push({ type: 'emergency_loan', amount: emergencyAmount })
  }

  if (state.funds < 0 && state.loan !== null) {
    events.push({ type: 'bankruptcy' })
  }

  // 12. History snapshot
  state.history.push({
    month: state.month,
    year: state.year,
    population,
    funds: state.funds,
    taxIncome: state.budgetInfo.taxIncome,
    expenses: state.budgetInfo.projectedExpenses,
    rDemand: state.demand.residential,
    cDemand: state.demand.commercial,
    iDemand: state.demand.industrial,
    births: state.citizenSummary.birthsLastTick,
    deaths: state.citizenSummary.deathsLastTick,
    netMigration: state.citizenSummary.netMigrationLastTick,
  })
  if (state.history.length > 1200) state.history.shift()

  return { births: demoResult.births, deaths: demoResult.deaths, netMigration: demoResult.netMigration, events }
}
```

- [ ] **Step 2: Slim Engine.tick() to delegate**

Replace the entire `tick()` method in Engine.ts with:

```typescript
  tick(): void {
    this.state.tickCount++

    // Power runs every tick
    propagatePower(this.state.map, this.state.powerGrid, this.state.bldIdx)

    // Monthly systems
    if (this.state.tickCount % this.state.ticksPerMonth === 0) {
      this.events = []
      const result = monthlyTick(this.state)
      this.events.push(...result.events)
    }
  }
```

Add import for `monthlyTick` from `./simulation/tick.js`.

Remove the `syncResidentialAgents` private method from Engine.ts (it's now in tick.ts).

- [ ] **Step 3: Clean up Engine.ts**

Remove all now-unused imports from Engine.ts. The remaining Engine.ts should contain:
- Imports from `@bitborough/core` (types used by getState, getTile, mutations)
- Imports from `engine-state.ts` (`EngineState`, `createEngineState`, `serializeState`, `restoreState`, `computeLoanRepayment`)
- Import from `simulation/tick.ts` (`monthlyTick`)
- Imports for mutation actions (`placeTile`, `placeZone`, `bulldoze`)
- Imports for road graph, connections, citizens (route staleness), building index, building defs, road access
- `TileInfo` interface
- `Engine` class

The class should be ~250 lines.

- [ ] **Step 4: Run full test suite**

Run: `cd packages/engine && pnpm test -- --run`

Expected: All 342 tests pass.

- [ ] **Step 5: Run lint**

Run: `cd packages/engine && pnpm lint`

Fix any unused import warnings.

- [ ] **Step 6: Commit**

```bash
git add packages/engine/src/simulation/tick.ts packages/engine/src/Engine.ts
git commit -m "refactor: extract monthlyTick to simulation/tick.ts, slim Engine to API shell"
```

---

## Chunk 4: Verification

### Task 4: Full verification and cleanup

**Files:**
- All modified files

- [ ] **Step 1: Run full test suite from repo root**

Run: `pnpm test -- --run`

Expected: All tests pass across all packages (engine, core, cli, etc.).

- [ ] **Step 2: Run lint**

Run: `pnpm lint`

Fix any issues.

- [ ] **Step 3: Verify file sizes**

Run: `wc -l packages/engine/src/Engine.ts packages/engine/src/engine-state.ts packages/engine/src/simulation/tick.ts`

Expected: Engine.ts ~250, engine-state.ts ~250, tick.ts ~150. Total similar to original 686 lines.

- [ ] **Step 4: Verify no behavioral changes**

The existing test suite is the correctness oracle. If all 342 tests pass, behavior is preserved. No new tests are needed for this task.

- [ ] **Step 5: Commit any final fixes**

```bash
git add -u
git commit -m "refactor: engine refactor cleanup — fix lint, verify all tests pass"
```
