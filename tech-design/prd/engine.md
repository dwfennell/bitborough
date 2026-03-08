# PRD: @rcity/engine

**Package:** `packages/engine`
**Status:** Approved
**Dependencies:** `@rcity/core`

---

## Purpose

Pure simulation engine for RCity. Accepts a `GameMap`, processes player commands, runs simulation ticks, and returns state snapshots. Contains all game logic — zone growth, power propagation, traffic, economy, land value — with zero rendering or platform dependencies.

---

## Sub-System PRDs

Each simulation system has its own detailed PRD:

| System | PRD | Milestone | Detail Level |
|--------|-----|-----------|-------------|
| Time & scheduling | [engine_time.md](engine_time.md) | 0 | Algorithm-level |
| Power propagation | [engine_power.md](engine_power.md) | 3 | Algorithm-level |
| Zones & demand | [engine_zones.md](engine_zones.md) | 2, 4 | Algorithm-level |
| Budget & economy | [engine_budget.md](engine_budget.md) | 5 | Algorithm-level |
| Land value | [engine_land-value.md](engine_land-value.md) | 4 | Algorithm-level |
| Traffic | [engine_traffic.md](engine_traffic.md) | 7 | Behavior-level |
| City services | [engine_services.md](engine_services.md) | 6 | Behavior-level |

---

## Design Philosophy

The engine is a state machine:

```
Commands → Engine → tick() → getState() → snapshot
```

- **Commands in:** Direct method calls that mutate game state (place tile, bulldoze, set tax rate)
- **Tick forward:** `tick()` advances the simulation by one step
- **State out:** `getState()` returns a coherent, read-only snapshot of the current game state

The UI never reaches into engine internals. It reads the snapshot and calls commands. That's the entire interface.

---

## EngineConfig

Configuration passed at engine creation. All fields optional with sensible defaults.

```typescript
interface EngineConfig {
  // Seed for deterministic PRNG (default: Date.now() for casual play)
  seed?: number

  // Starting funds (default: scales with map size, see budget PRD)
  startingFunds?: number

  // Time model (see engine_time.md for details)
  ticksPerMonth?: number      // default: 4
  monthsPerYear?: number      // default: 12
  startYear?: number          // default: 1900
  startMonth?: number         // default: 1

  // Difficulty modifiers
  taxRate?: number            // default: 0.07
  disastersEnabled?: boolean  // default: true

  // Building registry (default: built-in definitions)
  buildings?: BuildingDef[]

  // System-specific overrides
  power?: {
    coalCapacity?: number     // default: 200
    nuclearCapacity?: number  // default: 500
  }
  growth?: {
    baseProbability?: number  // default: 0.1
    upgradeRate?: number      // default: 0.02
    declineMonthsNoPower?: number // default: 3
  }
}
```

Most players will never touch this. It exists for:
- Testing (deterministic seeds, custom starting conditions)
- Difficulty modes (harder budgets, faster decline)
- Scenarios (pre-configured starting conditions)
- Modding (custom building types, rebalanced systems)

---

## Public API

### Lifecycle

```typescript
// Create an engine from a map (produced by map-gen, loaded from save, or hand-built in tests)
static create(map: GameMap, config?: EngineConfig): Engine

// Advance simulation by one tick
tick(): void

// Get current state as a read-only snapshot
// Returns shared references — treat as read-only, valid until next tick() or command
getState(): GameState

// Serialize full state for save/load
serialize(): SaveFile

// Restore from a save file
static restore(save: SaveFile): Engine
```

### Commands

Commands return a `Result` indicating success or failure with a reason. Commands never throw.

```typescript
// Terrain & infrastructure
placeTile(x: number, y: number, type: TileType): Result
bulldoze(x: number, y: number): Result

// Zoning
placeZone(x: number, y: number, zone: ZoneType): Result
removeZone(x: number, y: number): Result

// Buildings (player-placed specials like power plants, services)
placeBuilding(x: number, y: number, defId: string): Result
removeBuilding(x: number, y: number): Result

// Economy
setTaxRate(rate: number): void
setFunding(service: string, level: number): void

// Time
setSpeed(speed: SimSpeed): void
pause(): void
resume(): void
```

```typescript
type Result =
  | { ok: true }
  | { ok: false; reason: FailReason; detail?: string }

enum FailReason {
  InsufficientFunds,
  InvalidLocation,    // out of bounds, on water, etc.
  Occupied,           // building/infrastructure already there
  NoPower,            // action requires power (future)
  NotBulldozable,     // can't demolish this (e.g., water)
  NotZonable,         // can't zone this tile (water, existing building)
}

enum SimSpeed {
  Paused,
  Slow,    // 1 tick/sec
  Normal,  // 4 ticks/sec
  Fast,    // 10 ticks/sec
  Turbo,   // uncapped (game calls tick() as fast as possible)
}
```

### Queries

Direct reads for when the UI needs specific data without a full snapshot.

```typescript
getTile(x: number, y: number): TileInfo
getPowerStatus(x: number, y: number): boolean
getLandValue(x: number, y: number): number
getTrafficDensity(x: number, y: number): number
getDemand(): DemandInfo
getPopulation(): number
getBudget(): BudgetInfo
```

### TileInfo

Returned by `getTile()`. Complete information about a single tile.

```typescript
interface TileInfo {
  x: number
  y: number
  terrain: TileType
  zone: ZoneType
  infrastructure: number       // Infrastructure bitflags
  connections: ConnectionMask  // auto-connect mask (0-15)
  elevation: number            // 0-255
  building?: {
    id: string
    defId: string
    density: DensityLevel
    powered: boolean
    age: number                // months since placed
  }
  // Computed values (from latest simulation tick)
  powered: boolean
  landValue: number            // 0-255
  crimeLevel: number           // 0-255
  pollutionLevel: number       // 0-255
  trafficDensity: number       // 0-255
}
```

### DemandInfo

```typescript
interface DemandInfo {
  residential: number   // -1.0 to +1.0
  commercial: number    // -1.0 to +1.0
  industrial: number    // -1.0 to +1.0
}
```

### GameState Snapshot

The snapshot returned by `getState()`. Contains everything the UI needs to render a frame.

```typescript
interface GameState {
  // Map data
  map: GameMap

  // Time
  time: {
    tickCount: number
    month: number         // 1-12
    year: number
    speed: SimSpeed
  }

  // City stats
  population: number
  funds: number
  demand: DemandInfo
  budget: BudgetInfo

  // Simulation layers (Uint8Array, one value per tile, row-major)
  powerGrid: Uint8Array        // 1 = powered, 0 = unpowered
  landValues: Uint8Array       // 0-255
  pollutionLevel: Uint8Array   // 0-255
  crimeLevel: Uint8Array       // 0-255
  trafficDensity: Uint8Array   // 0-255 (zeroes until traffic system implemented)

  // Active events
  activeFireTiles: number[]    // tile indices currently on fire (future)
}
```

### BudgetInfo

```typescript
interface BudgetInfo {
  // Current settings
  taxRate: number
  totalFunds: number
  funding: {
    police: number          // 0-100
    fire: number            // 0-100
    transit: number         // 0-100
  }

  // Last annual cycle results
  taxIncome: number
  maintenanceCosts: {
    roads: number
    rails: number
    powerLines: number
    powerPlants: number
    total: number
  }
  serviceCosts: {
    police: number
    fire: number
    transit: number
    total: number
  }
  balance: number           // income - all expenses

  // Projections (based on current state, updated monthly)
  projectedIncome: number
  projectedExpenses: number
  projectedBalance: number
}
```

---

## Internal Architecture

### Module Breakdown

```
engine/src/
├── Engine.ts              # Public API, orchestrates systems
├── Map.ts                 # Runtime map operations, spatial queries
├── state.ts               # GameState construction, snapshot building
├── prng.ts                # Seeded pseudo-random number generator
├── buildings.ts           # Building registry and definitions
├── actions/
│   ├── place.ts           # Tile/zone/building placement logic + validation
│   ├── bulldoze.ts        # Demolition logic
│   └── economy.ts         # Tax/funding adjustments
└── simulation/
    ├── index.ts           # System runner, tick scheduling
    ├── power.ts           # Power grid propagation (flood fill)
    ├── zones.ts           # Zone development/decline
    ├── demand.ts          # R/C/I demand calculation
    ├── land-value.ts      # Land value calculation (influence maps)
    ├── pollution.ts       # Pollution from industry/plants
    ├── budget.ts          # Revenue and expenses
    ├── traffic.ts         # Traffic simulation (future, stub)
    └── services.ts        # Police/fire coverage (future, stub)
```

### Simulation Tick Order

Each `tick()` runs systems in a deterministic order. See [engine_time.md](engine_time.md) for scheduling details.

**Every tick:**
1. **Power propagation** — Flood fill from power plants. Mark tiles powered/unpowered. (Skipped if grid topology hasn't changed.)

**Monthly (every 4 ticks):**
2. **Services** — Update police/fire coverage, calculate crime levels.
3. **Pollution** — Recalculate pollution from industrial zones and power plants.
4. **Land value** — Recalculate from all influence factors.
5. **Demand** — Recalculate R/C/I demand based on current city state.
6. **Zone development** — Evaluate growth/decline for each zoned tile.
7. **Traffic** — Recalculate traffic density from commute patterns. (Future)
8. **Fire events** — Roll for new fires, spread existing fires. (Future)

**Annually (every 48 ticks):**
9. **Budget** — Collect taxes, deduct maintenance, update funds.

**On command (not scheduled):**
- **Connection masks** — Updated immediately when infrastructure is placed/removed.

### System Interface

Each simulation system implements a common interface:

```typescript
interface SimulationSystem {
  // Run the system's update logic
  update(state: EngineState): void

  // Whether this system needs to run this tick
  // (some systems track dirty flags to skip unnecessary work)
  needsUpdate(): boolean
}
```

`EngineState` is the mutable internal state (not `GameState`, which is the read-only snapshot). Systems can read and write `EngineState`.

---

## Command Validation

Every command validates before mutating state. Validation rules:

### placeTile(x, y, type)
- x, y must be within map bounds → `InvalidLocation`
- Target tile must not be water (can't build on water) → `InvalidLocation`
- Player must have sufficient funds for the tile type → `InsufficientFunds`
- If placing road/power line/rail, deduct cost and update connection masks for this tile and neighbors

### placeZone(x, y, zone)
- x, y must be within map bounds → `InvalidLocation`
- Target tile must be clear land (grass/dirt) or already zoned → `InvalidLocation`
- Can't zone water or tiles with buildings → `NotZonable`
- Zoning is free (no cost check)

### placeBuilding(x, y, defId)
- Look up BuildingDef by defId → `InvalidLocation` if not found
- Check all tiles in footprint (x..x+w, y..y+h):
  - Must be within bounds → `InvalidLocation`
  - Must be clear land or matching zone type → `Occupied`
  - No existing buildings → `Occupied`
- Player must have sufficient funds → `InsufficientFunds`
- Deduct cost, place building, update power grid

### bulldoze(x, y)
- x, y must be within map bounds → `InvalidLocation`
- Can't bulldoze water → `NotBulldozable`
- Deduct bulldoze cost ($1)
- Remove building, infrastructure, or terrain feature
- If removing infrastructure, update connection masks for neighbors
- If removing part of a multi-tile building, remove the entire building

---

## Design Constraints

- **Zero platform dependencies.** No DOM, no Canvas, no `window`, no `fs`, no `process`. Only core JS/TS and `@rcity/core`.
- **Deterministic.** Same seed + same commands + same ticks = same state. No `Math.random()` — use a seeded PRNG.
- **No thrown errors for control flow.** Commands return `Result` types. Only throw on true programmer errors (invariant violations).
- **Serializable state.** `getState()` and `serialize()` output must be JSON-serializable (typed arrays convert to base64 or arrays).
- **Testable in isolation.** Create an engine with a hand-built `GameMap` in a test, call commands, assert on state. No setup ceremony.
- **Modular systems.** Each simulation system is self-contained. Systems communicate through shared state, not direct references to each other.

---

## Testing Strategy

Engine tests are the backbone of the project's test suite. They require no mocking, no browser, no rendering.

### Test Utilities

```typescript
// Create a simple all-grass test map
function createTestMap(size: number): GameMap

// Create a map with power plant and roads pre-placed
function createPoweredCity(size: number): Engine

// Advance engine by N ticks
function advanceTicks(engine: Engine, n: number): void

// Advance engine by 1 month (4 ticks)
function advanceMonth(engine: Engine): void

// Advance engine by 1 year (48 ticks)
function advanceYear(engine: Engine): void
```

### Example Tests

```typescript
// Command validation
test('placing a road on grass succeeds', () => {
  const engine = Engine.create(createTestMap(10))
  const result = engine.placeTile(5, 5, TileType.Road)
  expect(result.ok).toBe(true)
  expect(engine.getTile(5, 5).terrain).toBe(TileType.Road)
})

test('placing a road on water fails', () => {
  const engine = Engine.create(createTestMap(10))
  // set tile (5,5) to water in the test map
  const result = engine.placeTile(5, 5, TileType.Road)
  expect(result.ok).toBe(false)
  expect(result.reason).toBe(FailReason.InvalidLocation)
})

// Determinism
test('same seed produces identical simulation', () => {
  function runSim(seed: number) {
    const engine = Engine.create(createTestMap(32), { seed })
    engine.placeBuilding(5, 5, 'power.coal')
    engine.placeTile(6, 5, TileType.Road)
    engine.placeZone(7, 5, ZoneType.Residential)
    for (let i = 0; i < 96; i++) engine.tick() // 2 years
    return engine.getState()
  }

  const state1 = runSim(42)
  const state2 = runSim(42)
  expect(state1.population).toBe(state2.population)
  expect(state1.funds).toBe(state2.funds)
  expect(state1.map.terrain).toEqual(state2.map.terrain)
})

// Integration: full game loop
test('city grows with proper infrastructure', () => {
  const engine = Engine.create(createTestMap(32), { seed: 42 })

  // Build basic infrastructure
  engine.placeBuilding(10, 10, 'power.coal')
  for (let x = 11; x < 20; x++) engine.placeTile(x, 10, TileType.Road)
  for (let x = 11; x < 20; x++) {
    engine.placeZone(x, 9, ZoneType.Residential)
    engine.placeZone(x, 11, ZoneType.Commercial)
  }

  // Simulate 5 years
  for (let i = 0; i < 48 * 5; i++) engine.tick()

  const state = engine.getState()
  expect(state.population).toBeGreaterThan(0)
  expect(state.funds).toBeGreaterThan(0)
})
```

### Key test areas:
- Command validation (bounds, terrain, funds, occupancy)
- Power propagation (flood fill, capacity, disconnection)
- Zone growth conditions (power + road + demand → development)
- Zone decline (power loss, negative demand, low land value)
- Demand equilibrium (R/C/I balance responds to zone ratios)
- Budget math (tax income, expenses, bankruptcy thresholds)
- Land value (terrain, services, pollution influence)
- Determinism (same inputs → same outputs)
- Edge cases (map boundaries, overlapping buildings, zero funds)
- Serialization round-trip (serialize → restore → identical state)

---

## Future Considerations

- **Rust/WASM hot paths:** If power propagation, pathfinding, or land value calculation becomes a bottleneck, individual systems can be extracted to Rust/WASM while keeping the same API contract.
- **Web Worker migration:** The direct API is designed to be trivially wrappable in a message-passing proxy. All commands are serializable, all state is snapshot-based.
- **Mod support:** Simulation systems are modular. Future modding could add/replace systems without forking the engine.
- **Disasters:** Fire system is specced in [engine_services.md](engine_services.md). Other disasters (flood, tornado, earthquake) follow the same pattern: random event → localized destruction → recovery.
- **Scenarios:** EngineConfig supports custom starting conditions. Future scenario system would pre-configure maps + config + victory conditions.

---

## Resolved Questions

- **Seeded PRNG:** Engine owns it. Seed passed via `EngineConfig`, engine creates PRNG internally.
- **Result error reasons:** Enum (`FailReason`) with optional `detail` string. Enum for programmatic UI reactions, detail for edge cases.
- **`getState()` copying:** Returns shared refs, documented as read-only. Valid until next `tick()` or command. Zero-copy for performance. Can add `Object.freeze` in dev mode as safety net.
- **Multi-tile building placement:** Engine handles full footprint validation (checks all tiles in building's size for valid terrain, no existing buildings, sufficient funds).
- **Connection masks:** Engine tracks them in `GameMap.connections`. Updated when infrastructure is placed/removed. Game reads the mask to pick the right sprite.
- **SimSpeed:** Engine stores speed but doesn't manage timing. Game calls `tick()` at the appropriate rate. Added `Turbo` speed for uncapped simulation.
- **Tick scheduling:** See [engine_time.md](engine_time.md). Systems run at different frequencies (every tick, monthly, annually).
