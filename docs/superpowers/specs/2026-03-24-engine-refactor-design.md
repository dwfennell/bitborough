# Engine.ts Refactor Design Spec

## Overview

Break Engine.ts (686 lines) into three focused modules: a state module owning all simulation state and its lifecycle, a tick module owning the monthly simulation sequence, and a slimmed-down Engine class that serves as the public API shell.

**Problem:** Engine.ts is a monolith where adding any new layer (like reputation) requires touching 4+ places — property declaration, constructor allocation, tick sequence, restore, and serialize. The `restore()` method manually rebuilt derived state and was missing 4 layers (pollution, land values, crime, fire coverage), causing zero tax income on any loaded game. The monthly tick is a ~100-line procedural block that's hard to test in isolation.

**Goal:** Make it impossible for restore and initialization to drift apart. Make the tick sequence independently testable. Reduce Engine.ts to a thin API shell.

---

## Module Structure

### `packages/engine/src/engine-state.ts` (~250 lines)

Owns the state shape, initialization, derived-state rebuild, and serialization.

#### EngineState interface

Bundles all mutable simulation state:

```typescript
interface EngineState {
  // Map
  map: GameMap
  prng: PRNG
  roadGraph: RoadGraph

  // Layers (derived, rebuilt from map state)
  powerGrid: Uint8Array
  landValues: Uint8Array
  pollutionLevel: Uint8Array
  crimeLevel: Uint8Array
  fireCoverage: Uint8Array
  trafficDensity: Uint8Array
  reputationLayer: Float32Array

  // Scratch buffers (reused, never serialized)
  influenceBuffer: Float32Array
  pollutionBuffer: Float32Array

  // Building index (rebuilt per tick)
  bldIdx: BuildingIndex

  // Citizens
  citizenRegistry: CitizenRegistry
  citizenSummary: CitizenSummary

  // Fire
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

  // Building ID counter
  nextBuildingId: number

  // History
  history: MonthlySnapshot[]
}
```

#### Functions

- **`createEngineState(map, config: EngineConfig): EngineState`** — Allocates all layers as typed arrays, sets defaults for economy/time fields. Calls `propagatePower` and `rebuildDerivedState` before returning. Replaces the Engine constructor's initialization logic. The existing `EngineConfig` interface (seed, startingFunds, ticksPerMonth, etc.) moves here alongside the state.

- **`rebuildDerivedState(state): void`** — Recomputes all derived layers from the map and configuration state. Called by `createEngineState`, `restoreState`, and `monthlyTick`. Does NOT include power propagation (which runs every tick, not just monthly). Sequence:
  1. `state.bldIdx = new BuildingIndex(state.map)`
  2. `calculatePollution(state.map, state.pollutionLevel, state.pollutionBuffer)`
  3. `calculateLandValues(state.map, state.powerGrid, state.pollutionLevel, state.crimeLevel, state.landValues, state.bldIdx)`
  4. `calculateCrime(state.map, state.landValues, state.crimeLevel, state.funding.police, state.influenceBuffer)`
  5. `calculateFireCoverage(state.map, state.fireCoverage, state.funding.fire, state.influenceBuffer)`
  6. `computeReputation(state.reputationLayer, state.map, state.crimeLevel, state.fireCoverage, state.pollutionLevel, state.bldIdx)`

  Note: `propagatePower` is NOT included here because it runs every tick (not just monthly) in the current Engine. It is called separately by `Engine.tick()` and by `createEngineState`/`restoreState` after `rebuildDerivedState`.

- **`serializeState(state): SaveFile`** — Converts EngineState to the JSON-safe SaveFile format. Moves the current `Engine.serialize()` body here. References `state.*` instead of `this.*`.

- **`restoreState(save: SaveFile): EngineState`** — Reconstructs EngineState from a SaveFile. Handles version migration (v6→v7 wealthTier defaults, etc). After reconstructing the base state, calls `propagatePower`, `rebuildDerivedState`, `calculateDemand`, and `calculateBudget` to fully hydrate all derived fields. This is the key fix — rebuild is no longer a separate code path from init.

- **`computeLoanRepayment(state): number`** — Pure helper, extracts the current `Engine.computeLoanRepayment()` private method. Used by `monthlyTick` (budget step) and by Engine mutation methods (`setTaxRate`, `setFunding`).

- **`maxPrefixedId(items, prefix): number`** — Utility for restoring ID counters from saved data. Already exists, moves here alongside `restoreState`.

### `packages/engine/src/simulation/tick.ts` (~150 lines)

Owns the monthly simulation sequence.

#### MonthlyTickResult

```typescript
interface MonthlyTickResult {
  births: number
  deaths: number
  netMigration: number
  events: GameEvent[]   // emergency_loan, bankruptcy, etc.
}
```

#### Functions

- **`monthlyTick(state: EngineState): MonthlyTickResult`** — The full monthly simulation sequence, extracted from the `if (tickCount % ticksPerMonth === 0)` block in Engine.tick(). Steps:
  0. Advance month/year (`state.month++`, wrap to next year)
  1. Rebuild derived layers (`rebuildDerivedState` — this rebuilds bldIdx, pollution, land values, crime, fire, reputation in one call)
  2. Calculate demand
  3. Update fires
  4. Citizen monthly tick (routes, satisfaction, traffic)
  5. Compute citizen summary
  6. Zone development
  7. Density progression (fill/drain, upgrades, dereliction)
  8. Sync residential agents
  9. Demographics (aging, births, deaths, migration)
  10. Sync building residents + re-sync agents
  11. Final citizen summary
  12. Budget calculation + loan/bankruptcy logic → emit events
  13. Record history snapshot

  Returns births/deaths/netMigration and any events (emergency loan, bankruptcy).

- **`syncResidentialAgents(state: EngineState): void`** — Moves from Engine's private method. Iterates active residential buildings and calls `syncAgentsForBuilding`.

### `packages/engine/src/Engine.ts` (~250 lines)

Thin API shell. Holds an `EngineState` and delegates.

```typescript
export class Engine {
  private state: EngineState
  private speed: SimSpeed
  private events: GameEvent[]

  // Factory
  static create(map, config): Engine
  static restore(save): Engine

  // Simulation
  tick(): void  // propagatePower every tick; increments tickCount, calls monthlyTick on month boundary
  serialize(): SaveFile  // delegates to serializeState(this.state)

  // Queries
  getState(): GameState
  getTile(x, y): TileInfo
  getDemand(): DemandInfo

  // Mutations
  placeTile(x, y, infra): Result
  placeZone(x, y, zone): Result
  placeBuilding(x, y, defId): Result
  bulldoze(x, y): Result
  upgradeTile(x, y): Result
  setTaxRate(rate): void
  setFunding(service, level): void
  takeLoan(amount): Result
  setLoanRepayment(amount): Result
}
```

`Engine.create()` calls `createEngineState()` and wraps in Engine.
`Engine.restore()` calls `restoreState()` and wraps in Engine.
`Engine.tick()` calls `propagatePower` every tick (preserving current per-tick power behavior), increments `state.tickCount`, calls `monthlyTick(this.state)` on month boundary, collects events from `MonthlyTickResult`.
All mutation methods operate on `this.state.map` directly and trigger localized rebuilds where needed (e.g., `placeTile` updates road graph, `bulldoze` rebuilds building index).

---

## Key Design Decisions

### rebuildDerivedState called in three places

1. `createEngineState` — fresh game
2. `restoreState` — loaded game
3. `monthlyTick` — each month

This is the core fix. Previously, the monthly tick and restore had separate, manually-maintained layer computation sequences that could (and did) drift.

### EngineState is a mutable struct, not immutable

Simulation functions mutate the arrays in place (filling `Uint8Array` buffers, pushing to agent arrays). This matches the existing pattern and avoids allocation overhead. `EngineState` is passed by reference.

### monthlyTick handles economy (budget, loans, bankruptcy)

The loan/bankruptcy logic could arguably stay in Engine since it produces events. But it's deeply interleaved with the budget calculation which depends on population computed in the same tick. Keeping it in `monthlyTick` avoids splitting the sequence across modules. Engine just reads the result.

### Events flow through MonthlyTickResult

Game events (emergency loan, bankruptcy) are produced by `monthlyTick` and returned in `MonthlyTickResult.events`. Engine collects them into its `events` array, which is cleared at the start of each monthly tick. Events are not part of `EngineState` — they're transient notifications for the UI layer.

### population is always derived

Population is currently a getter on Engine that calls `computeTotalPopulation(state.map)`. This stays as a derived value — never stored on `EngineState`. Both `monthlyTick` (for budget/snapshot) and Engine methods (for `getState`) call it on demand. The function is cheap (single pass over buildings).

### speed stays on Engine

`SimSpeed` is a UI control that determines tick pacing. Not simulation state.

---

## Migration Path

This is a pure refactor — no behavioral changes, no new features. The test suite (342 tests) serves as the correctness oracle. If all tests pass after the refactor, the behavior is preserved.

Steps:
1. Create `engine-state.ts` with `EngineState` interface and `createEngineState`
2. Create `rebuildDerivedState` and use it in `createEngineState`
3. Move `serialize` logic to `serializeState`
4. Move `restore` logic to `restoreState` (using `rebuildDerivedState`)
5. Create `simulation/tick.ts` with `monthlyTick`
6. Slim Engine.ts to use the new modules
7. All 342 tests must pass at each step

---

## Out of Scope

- **Changing simulation behavior** — this is a structural refactor only
- **New features** — no new layers, no new game mechanics
- **Fixing the residents-overflow bug** — separate concern (demographics pushing past capacity)
- **Fixing game balance** — land values, tax income, zone development rates are tuning issues
- **Extracting individual simulation systems** — crime, fire, etc. already have their own modules; this refactor focuses on the orchestration layer
