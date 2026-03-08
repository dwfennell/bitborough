# Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the `@rcity/core` and `@rcity/engine` packages — shared types and a pure simulation engine that can be tested headlessly without any rendering.

**Architecture:** Monorepo with TypeScript packages. `core` defines types/constants, `engine` is a pure state machine (commands in, snapshots out). Engine has zero browser dependencies. TDD throughout — write failing test, implement, verify, commit.

**Tech Stack:** TypeScript, Vitest, pnpm workspaces (monorepo linking)

**PRDs:** `tech-design/prd/core.md`, `tech-design/prd/engine.md`, `tech-design/prd/engine_*.md`

---

## Task 1: Monorepo scaffolding

**Files:**
- Create: `package.json` (root workspace config)
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/index.ts`
- Create: `packages/engine/package.json`
- Create: `packages/engine/tsconfig.json`
- Create: `packages/engine/vitest.config.ts`
- Create: `packages/engine/src/index.ts`

**Step 1: Create root workspace files**

```json
// package.json
{
  "name": "rcity",
  "private": true,
  "scripts": {
    "test": "pnpm -r test",
    "build": "pnpm -r build"
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
```

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**Step 2: Create core package**

```json
// packages/core/package.json
{
  "name": "@rcity/core",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

```json
// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

```typescript
// packages/core/src/index.ts
// @rcity/core — shared types, constants, formats
export {}
```

**Step 3: Create engine package**

```json
// packages/engine/package.json
{
  "name": "@rcity/engine",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@rcity/core": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

```json
// packages/engine/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "references": [{ "path": "../core" }]
}
```

```typescript
// packages/engine/vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
  },
})
```

```typescript
// packages/engine/src/index.ts
// @rcity/engine — pure simulation engine
export {}
```

**Step 4: Install dependencies and verify**

Run: `pnpm install`
Expected: lockfile created, workspaces linked

Run: `pnpm -r typecheck`
Expected: no errors

**Step 5: Commit**

```
feat: scaffold monorepo with core and engine packages
```

---

## Task 2: Core types — tiles, zones, infrastructure

**Files:**
- Create: `packages/core/src/tiles.ts`
- Create: `packages/core/src/zones.ts`
- Create: `packages/core/src/infrastructure.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: Define tile types**

```typescript
// packages/core/src/tiles.ts
export enum TileType {
  Grass,
  Water,
  Dirt,
  Sand,
  Trees,
}
```

Terrain types only. Roads, power lines, and rails are tracked via `Infrastructure` bitflags, not `TileType`. This avoids the problem of a tile needing to be both "grass" and "road".

**Step 2: Define zone types**

```typescript
// packages/core/src/zones.ts
export enum ZoneType {
  None,
  Residential,
  Commercial,
  Industrial,
}
```

**Step 3: Define infrastructure flags and connection masks**

```typescript
// packages/core/src/infrastructure.ts
export enum Infrastructure {
  None      = 0,
  Road      = 1 << 0,
  PowerLine = 1 << 1,
  Rail      = 1 << 2,
  Pipe      = 1 << 3,
}

// 4-bit mask: N=bit0, E=bit1, S=bit2, W=bit3
export type ConnectionMask = number
```

**Step 4: Export from index**

```typescript
// packages/core/src/index.ts
export { TileType } from './tiles.js'
export { ZoneType } from './zones.js'
export { Infrastructure, type ConnectionMask } from './infrastructure.js'
```

**Step 5: Verify typecheck passes**

Run: `pnpm -r typecheck`
Expected: PASS

**Step 6: Commit**

```
feat(core): add tile, zone, and infrastructure types
```

---

## Task 3: Core types — buildings, game map, state

**Files:**
- Create: `packages/core/src/buildings.ts`
- Create: `packages/core/src/map.ts`
- Create: `packages/core/src/state.ts`
- Create: `packages/core/src/constants.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: Define building types**

```typescript
// packages/core/src/buildings.ts
export enum BuildingCategory {
  Residential,
  Commercial,
  Industrial,
  Special,
}

export enum DensityLevel {
  Low,
  Medium,
  High,
}

export interface BuildingDef {
  id: string
  category: BuildingCategory
  density: DensityLevel
  size: { w: number; h: number }
  population: number
  jobs: number
  taxValue: number
  pollutionRadius: number
  pollutionAmount: number
  powerRequired: boolean
  roadRequired: boolean
  cost: number
  maintenanceCost: number
}

export interface Building {
  id: string
  defId: string
  x: number
  y: number
  powered: boolean
  density: DensityLevel
  age: number // months since placed
}
```

**Step 2: Define GameMap and MapMeta**

```typescript
// packages/core/src/map.ts
import type { Building } from './buildings.js'

export interface MapMeta {
  name: string
  seed: number
  preset?: string
  createdAt: string
}

export interface GameMap {
  version: number
  width: number
  height: number
  terrain: Uint8Array
  zones: Uint8Array
  infrastructure: Uint16Array
  connections: Uint8Array
  elevation: Uint8Array
  buildings: Building[]
  meta: MapMeta
}

export const MAP_SIZES = [32, 64, 128, 256, 512] as const
export type MapSize = (typeof MAP_SIZES)[number]

export function createEmptyMap(width: number, height: number, meta: MapMeta): GameMap {
  const size = width * height
  return {
    version: 1,
    width,
    height,
    terrain: new Uint8Array(size),       // all Grass (0)
    zones: new Uint8Array(size),         // all None (0)
    infrastructure: new Uint16Array(size),
    connections: new Uint8Array(size),
    elevation: new Uint8Array(size),
    buildings: [],
    meta,
  }
}
```

**Step 3: Define state types**

```typescript
// packages/core/src/state.ts
import type { GameMap } from './map.js'

export enum SimSpeed {
  Paused,
  Slow,
  Normal,
  Fast,
  Turbo,
}

export type Result =
  | { ok: true }
  | { ok: false; reason: FailReason; detail?: string }

export enum FailReason {
  InsufficientFunds,
  InvalidLocation,
  Occupied,
  NoPower,
  NotBulldozable,
  NotZonable,
}

export interface DemandInfo {
  residential: number
  commercial: number
  industrial: number
}

export interface BudgetInfo {
  taxRate: number
  totalFunds: number
  funding: {
    police: number
    fire: number
    transit: number
  }
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
  balance: number
  projectedIncome: number
  projectedExpenses: number
  projectedBalance: number
}

export interface GameState {
  map: GameMap
  time: {
    tickCount: number
    month: number
    year: number
    speed: SimSpeed
  }
  population: number
  funds: number
  demand: DemandInfo
  budget: BudgetInfo
  powerGrid: Uint8Array
  landValues: Uint8Array
  pollutionLevel: Uint8Array
  crimeLevel: Uint8Array
  trafficDensity: Uint8Array
}

export interface SaveFile {
  version: number
  map: GameMap
  state: {
    funds: number
    population: number
    month: number
    year: number
    tickCount: number
    taxRate: number
    funding: Record<string, number>
    seed: number
  }
  timestamp: string
}
```

**Step 4: Define constants**

```typescript
// packages/core/src/constants.ts
export const DEFAULTS = {
  taxRate: 0.07,
  startYear: 1900,
  startMonth: 1,
  ticksPerMonth: 4,
  monthsPerYear: 12,
  startingFunds: {
    32: 5_000,
    64: 10_000,
    128: 20_000,
    256: 30_000,
    512: 50_000,
  } as Record<number, number>,
} as const

export const COSTS = {
  bulldoze: 1,
  road: 10,
  rail: 20,
  powerLine: 5,
  coalPlant: 3_000,
  nuclearPlant: 5_000,
  policeStation: 500,
  fireStation: 500,
  stadium: 3_000,
  seaport: 5_000,
  airport: 10_000,
  park: 10,
} as const

export const MAINTENANCE = {
  road: 1,
  rail: 1.5,
  powerLine: 0.5,
  coalPlant: 120,
  nuclearPlant: 250,
  policeStation: 100,
  fireStation: 100,
} as const

export const POWER = {
  coalCapacity: 700,
  nuclearCapacity: 2_000,
} as const
```

**Step 5: Update index exports**

```typescript
// packages/core/src/index.ts
export { TileType } from './tiles.js'
export { ZoneType } from './zones.js'
export { Infrastructure, type ConnectionMask } from './infrastructure.js'
export {
  BuildingCategory,
  DensityLevel,
  type BuildingDef,
  type Building,
} from './buildings.js'
export {
  type MapMeta,
  type GameMap,
  MAP_SIZES,
  type MapSize,
  createEmptyMap,
} from './map.js'
export {
  SimSpeed,
  FailReason,
  type Result,
  type DemandInfo,
  type BudgetInfo,
  type GameState,
  type SaveFile,
} from './state.js'
export { DEFAULTS, COSTS, MAINTENANCE, POWER } from './constants.js'
```

**Step 6: Verify typecheck**

Run: `pnpm -r typecheck`
Expected: PASS

**Step 7: Commit**

```
feat(core): add buildings, GameMap, GameState, and constants
```

---

## Task 4: Engine scaffold — Engine class, PRNG, test helpers

**Files:**
- Create: `packages/engine/src/Engine.ts`
- Create: `packages/engine/src/prng.ts`
- Create: `packages/engine/src/test-helpers.ts`
- Create: `packages/engine/src/__tests__/engine.test.ts`
- Modify: `packages/engine/src/index.ts`

**Step 1: Write the failing test**

```typescript
// packages/engine/src/__tests__/engine.test.ts
import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap } from '../test-helpers.js'
import { SimSpeed } from '@rcity/core'

describe('Engine', () => {
  test('can be created from a map', () => {
    const map = createTestMap(32)
    const engine = Engine.create(map)
    expect(engine).toBeDefined()
  })

  test('getState returns valid initial state', () => {
    const engine = Engine.create(createTestMap(32))
    const state = engine.getState()
    expect(state.map.width).toBe(32)
    expect(state.map.height).toBe(32)
    expect(state.time.tickCount).toBe(0)
    expect(state.time.month).toBe(1)
    expect(state.time.year).toBe(1900)
    expect(state.time.speed).toBe(SimSpeed.Normal)
    expect(state.population).toBe(0)
    expect(state.funds).toBe(10_000) // 64→10k, 32→5k
  })

  test('tick advances tick count', () => {
    const engine = Engine.create(createTestMap(32))
    engine.tick()
    expect(engine.getState().time.tickCount).toBe(1)
    engine.tick()
    expect(engine.getState().time.tickCount).toBe(2)
  })

  test('month advances every 4 ticks', () => {
    const engine = Engine.create(createTestMap(32))
    for (let i = 0; i < 4; i++) engine.tick()
    expect(engine.getState().time.month).toBe(2)
    for (let i = 0; i < 4; i++) engine.tick()
    expect(engine.getState().time.month).toBe(3)
  })

  test('year advances every 12 months', () => {
    const engine = Engine.create(createTestMap(32))
    for (let i = 0; i < 48; i++) engine.tick() // 4 ticks × 12 months
    expect(engine.getState().time.year).toBe(1901)
    expect(engine.getState().time.month).toBe(1)
  })

  test('deterministic with same seed', () => {
    const e1 = Engine.create(createTestMap(32), { seed: 42 })
    const e2 = Engine.create(createTestMap(32), { seed: 42 })
    for (let i = 0; i < 10; i++) {
      e1.tick()
      e2.tick()
    }
    expect(e1.getState().time.tickCount).toBe(e2.getState().time.tickCount)
    expect(e1.getState().funds).toBe(e2.getState().funds)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/engine && pnpm test`
Expected: FAIL — modules don't exist yet

**Step 3: Implement PRNG**

```typescript
// packages/engine/src/prng.ts
// Mulberry32 — simple, fast, seeded 32-bit PRNG
export class PRNG {
  private state: number

  constructor(seed: number) {
    this.state = seed | 0
  }

  // Returns float in [0, 1)
  next(): number {
    this.state |= 0
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  // Returns int in [min, max] inclusive
  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1))
  }

  getSeed(): number {
    return this.state
  }
}
```

**Step 4: Implement test helpers**

```typescript
// packages/engine/src/test-helpers.ts
import { createEmptyMap, type GameMap, TileType } from '@rcity/core'

export function createTestMap(size: number): GameMap {
  return createEmptyMap(size, size, {
    name: 'Test Map',
    seed: 0,
    createdAt: new Date().toISOString(),
  })
}

export function advanceTicks(engine: { tick(): void }, n: number): void {
  for (let i = 0; i < n; i++) engine.tick()
}

export function advanceMonth(engine: { tick(): void }): void {
  advanceTicks(engine, 4)
}

export function advanceYear(engine: { tick(): void }): void {
  advanceTicks(engine, 48)
}
```

**Step 5: Implement Engine class**

```typescript
// packages/engine/src/Engine.ts
import {
  type GameMap,
  type GameState,
  type BudgetInfo,
  type DemandInfo,
  type Result,
  type SaveFile,
  SimSpeed,
  DEFAULTS,
} from '@rcity/core'
import { PRNG } from './prng.js'

export interface EngineConfig {
  seed?: number
  startingFunds?: number
  ticksPerMonth?: number
  monthsPerYear?: number
  startYear?: number
  startMonth?: number
  taxRate?: number
}

export class Engine {
  private map: GameMap
  private prng: PRNG
  private tickCount = 0
  private month: number
  private year: number
  private speed: SimSpeed = SimSpeed.Normal
  private funds: number
  private population = 0
  private taxRate: number
  private ticksPerMonth: number
  private monthsPerYear: number

  // Simulation layers
  private powerGrid: Uint8Array
  private landValues: Uint8Array
  private pollutionLevel: Uint8Array
  private crimeLevel: Uint8Array
  private trafficDensity: Uint8Array

  private constructor(map: GameMap, config: EngineConfig) {
    this.map = map
    this.prng = new PRNG(config.seed ?? Date.now())
    this.ticksPerMonth = config.ticksPerMonth ?? DEFAULTS.ticksPerMonth
    this.monthsPerYear = config.monthsPerYear ?? DEFAULTS.monthsPerYear
    this.month = config.startMonth ?? DEFAULTS.startMonth
    this.year = config.startYear ?? DEFAULTS.startYear
    this.taxRate = config.taxRate ?? DEFAULTS.taxRate

    const defaultFunds = DEFAULTS.startingFunds[map.width] ?? 20_000
    this.funds = config.startingFunds ?? defaultFunds

    const size = map.width * map.height
    this.powerGrid = new Uint8Array(size)
    this.landValues = new Uint8Array(size)
    this.pollutionLevel = new Uint8Array(size)
    this.crimeLevel = new Uint8Array(size)
    this.trafficDensity = new Uint8Array(size)
  }

  static create(map: GameMap, config: EngineConfig = {}): Engine {
    return new Engine(map, config)
  }

  tick(): void {
    this.tickCount++

    // Monthly systems
    if (this.tickCount % this.ticksPerMonth === 0) {
      this.month++
      if (this.month > this.monthsPerYear) {
        this.month = 1
        this.year++
        // Annual systems (budget) will go here
      }
      // Monthly systems (zones, land value, etc.) will go here
    }
  }

  getState(): GameState {
    return {
      map: this.map,
      time: {
        tickCount: this.tickCount,
        month: this.month,
        year: this.year,
        speed: this.speed,
      },
      population: this.population,
      funds: this.funds,
      demand: { residential: 0, commercial: 0, industrial: 0 },
      budget: this.buildBudgetInfo(),
      powerGrid: this.powerGrid,
      landValues: this.landValues,
      pollutionLevel: this.pollutionLevel,
      crimeLevel: this.crimeLevel,
      trafficDensity: this.trafficDensity,
    }
  }

  private buildBudgetInfo(): BudgetInfo {
    return {
      taxRate: this.taxRate,
      totalFunds: this.funds,
      funding: { police: 100, fire: 100, transit: 100 },
      taxIncome: 0,
      maintenanceCosts: {
        roads: 0, rails: 0, powerLines: 0, powerPlants: 0, total: 0,
      },
      serviceCosts: {
        police: 0, fire: 0, transit: 0, total: 0,
      },
      balance: 0,
      projectedIncome: 0,
      projectedExpenses: 0,
      projectedBalance: 0,
    }
  }
}
```

**Step 6: Update engine index**

```typescript
// packages/engine/src/index.ts
export { Engine, type EngineConfig } from './Engine.js'
export { createTestMap, advanceTicks, advanceMonth, advanceYear } from './test-helpers.js'
```

**Step 7: Run tests**

Run: `cd packages/engine && pnpm test`
Expected: ALL PASS

**Step 8: Commit**

```
feat(engine): scaffold Engine class with lifecycle, time model, and PRNG
```

---

## Task 5: Tile placement and bulldoze commands

**Files:**
- Create: `packages/engine/src/actions/place.ts`
- Create: `packages/engine/src/actions/bulldoze.ts`
- Create: `packages/engine/src/__tests__/placement.test.ts`
- Modify: `packages/engine/src/Engine.ts`

**Step 1: Write failing tests**

```typescript
// packages/engine/src/__tests__/placement.test.ts
import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap } from '../test-helpers.js'
import { TileType, Infrastructure, FailReason } from '@rcity/core'

describe('Tile placement', () => {
  test('place road on grass succeeds', () => {
    const engine = Engine.create(createTestMap(10))
    const result = engine.placeTile(5, 5, Infrastructure.Road)
    expect(result.ok).toBe(true)
  })

  test('placed road is reflected in map infrastructure', () => {
    const engine = Engine.create(createTestMap(10))
    engine.placeTile(5, 5, Infrastructure.Road)
    const tile = engine.getTile(5, 5)
    expect(tile.infrastructure & Infrastructure.Road).toBeTruthy()
  })

  test('placing road deducts cost', () => {
    const engine = Engine.create(createTestMap(32))
    const fundsBefore = engine.getState().funds
    engine.placeTile(5, 5, Infrastructure.Road)
    expect(engine.getState().funds).toBe(fundsBefore - 10)
  })

  test('placing on water fails', () => {
    const engine = Engine.create(createTestMap(10))
    // Set tile to water
    engine.getState().map.terrain[5 * 10 + 5] = TileType.Water
    const result = engine.placeTile(5, 5, Infrastructure.Road)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe(FailReason.InvalidLocation)
  })

  test('placing out of bounds fails', () => {
    const engine = Engine.create(createTestMap(10))
    const result = engine.placeTile(10, 10, Infrastructure.Road)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe(FailReason.InvalidLocation)
  })

  test('placing with insufficient funds fails', () => {
    const engine = Engine.create(createTestMap(10), { startingFunds: 5 })
    const result = engine.placeTile(5, 5, Infrastructure.Road)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe(FailReason.InsufficientFunds)
  })
})

describe('Zoning', () => {
  test('zone placement succeeds on grass', () => {
    const engine = Engine.create(createTestMap(10))
    const result = engine.placeZone(5, 5, 1) // Residential
    expect(result.ok).toBe(true)
  })

  test('zoning is free', () => {
    const engine = Engine.create(createTestMap(32))
    const fundsBefore = engine.getState().funds
    engine.placeZone(5, 5, 1)
    expect(engine.getState().funds).toBe(fundsBefore)
  })

  test('cannot zone water', () => {
    const engine = Engine.create(createTestMap(10))
    engine.getState().map.terrain[5 * 10 + 5] = TileType.Water
    const result = engine.placeZone(5, 5, 1)
    expect(result.ok).toBe(false)
  })
})

describe('Bulldoze', () => {
  test('bulldoze road clears infrastructure', () => {
    const engine = Engine.create(createTestMap(10))
    engine.placeTile(5, 5, Infrastructure.Road)
    const result = engine.bulldoze(5, 5)
    expect(result.ok).toBe(true)
    expect(engine.getTile(5, 5).infrastructure).toBe(0)
  })

  test('bulldoze trees clears to grass', () => {
    const engine = Engine.create(createTestMap(10))
    engine.getState().map.terrain[5 * 10 + 5] = TileType.Trees
    engine.bulldoze(5, 5)
    expect(engine.getTile(5, 5).terrain).toBe(TileType.Grass)
  })

  test('cannot bulldoze water', () => {
    const engine = Engine.create(createTestMap(10))
    engine.getState().map.terrain[5 * 10 + 5] = TileType.Water
    const result = engine.bulldoze(5, 5)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe(FailReason.NotBulldozable)
  })

  test('bulldoze deducts cost', () => {
    const engine = Engine.create(createTestMap(32))
    engine.placeTile(5, 5, Infrastructure.Road)
    const fundsBefore = engine.getState().funds
    engine.bulldoze(5, 5)
    expect(engine.getState().funds).toBe(fundsBefore - 1)
  })
})
```

**Step 2: Run test to verify failures**

Run: `cd packages/engine && pnpm test`
Expected: FAIL — methods don't exist

**Step 3: Implement placement actions**

```typescript
// packages/engine/src/actions/place.ts
import {
  type GameMap,
  type Result,
  TileType,
  Infrastructure,
  ZoneType,
  FailReason,
  COSTS,
} from '@rcity/core'

export function placeTile(
  map: GameMap,
  x: number,
  y: number,
  infra: Infrastructure,
  funds: number,
): { result: Result; cost: number } {
  if (!inBounds(map, x, y)) {
    return { result: { ok: false, reason: FailReason.InvalidLocation }, cost: 0 }
  }

  const idx = y * map.width + x
  if (map.terrain[idx] === TileType.Water) {
    return { result: { ok: false, reason: FailReason.InvalidLocation }, cost: 0 }
  }

  const cost = infraCost(infra)
  if (funds < cost) {
    return { result: { ok: false, reason: FailReason.InsufficientFunds }, cost: 0 }
  }

  map.infrastructure[idx] |= infra
  return { result: { ok: true }, cost }
}

export function placeZone(
  map: GameMap,
  x: number,
  y: number,
  zone: ZoneType,
): Result {
  if (!inBounds(map, x, y)) {
    return { ok: false, reason: FailReason.InvalidLocation }
  }

  const idx = y * map.width + x
  if (map.terrain[idx] === TileType.Water) {
    return { ok: false, reason: FailReason.NotZonable }
  }

  map.zones[idx] = zone
  return { ok: true }
}

function inBounds(map: GameMap, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < map.width && y < map.height
}

function infraCost(infra: Infrastructure): number {
  switch (infra) {
    case Infrastructure.Road: return COSTS.road
    case Infrastructure.PowerLine: return COSTS.powerLine
    case Infrastructure.Rail: return COSTS.rail
    default: return 0
  }
}
```

```typescript
// packages/engine/src/actions/bulldoze.ts
import {
  type GameMap,
  type Result,
  TileType,
  FailReason,
  COSTS,
} from '@rcity/core'

export function bulldoze(
  map: GameMap,
  x: number,
  y: number,
  funds: number,
): { result: Result; cost: number } {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) {
    return { result: { ok: false, reason: FailReason.InvalidLocation }, cost: 0 }
  }

  const idx = y * map.width + x
  if (map.terrain[idx] === TileType.Water) {
    return { result: { ok: false, reason: FailReason.NotBulldozable }, cost: 0 }
  }

  if (funds < COSTS.bulldoze) {
    return { result: { ok: false, reason: FailReason.InsufficientFunds }, cost: 0 }
  }

  // Clear infrastructure
  map.infrastructure[idx] = 0
  map.connections[idx] = 0

  // Clear zone
  map.zones[idx] = 0

  // Clear terrain features (trees, dirt → grass)
  if (map.terrain[idx] !== TileType.Grass && map.terrain[idx] !== TileType.Sand) {
    map.terrain[idx] = TileType.Grass
  }

  // Remove buildings at this tile
  map.buildings = map.buildings.filter(b => {
    const bx = b.x, by = b.y
    // TODO: handle multi-tile buildings via BuildingDef lookup
    return !(bx === x && by === y)
  })

  return { result: { ok: true }, cost: COSTS.bulldoze }
}
```

**Step 4: Add TileInfo and wire methods into Engine**

Add a `TileInfo` type and wire `placeTile`, `placeZone`, `bulldoze`, `getTile` into `Engine.ts`. Add imports for the action modules and delegate to them, adjusting `this.funds` by the returned cost.

Key additions to `Engine.ts`:
- `getTile(x, y): TileInfo` — reads from map arrays
- `placeTile(x, y, infra): Result` — delegates to `actions/place.ts`, deducts cost
- `placeZone(x, y, zone): Result` — delegates to `actions/place.ts`
- `bulldoze(x, y): Result` — delegates to `actions/bulldoze.ts`, deducts cost

**Step 5: Run tests**

Run: `cd packages/engine && pnpm test`
Expected: ALL PASS

**Step 6: Commit**

```
feat(engine): add tile placement, zoning, and bulldoze commands
```

---

## Task 6: Connection masks

**Files:**
- Create: `packages/engine/src/connections.ts`
- Create: `packages/engine/src/__tests__/connections.test.ts`
- Modify: `packages/engine/src/Engine.ts` (call updateConnections after placement/bulldoze)

**Step 1: Write failing tests**

```typescript
// packages/engine/src/__tests__/connections.test.ts
import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap } from '../test-helpers.js'
import { Infrastructure } from '@rcity/core'

describe('Connection masks', () => {
  test('isolated road has no connections', () => {
    const engine = Engine.create(createTestMap(10))
    engine.placeTile(5, 5, Infrastructure.Road)
    expect(engine.getTile(5, 5).connections).toBe(0)
  })

  test('two adjacent roads connect', () => {
    const engine = Engine.create(createTestMap(10))
    engine.placeTile(5, 5, Infrastructure.Road)
    engine.placeTile(6, 5, Infrastructure.Road)
    // (5,5) should have East connection (bit 1 = 2)
    expect(engine.getTile(5, 5).connections & 2).toBeTruthy()
    // (6,5) should have West connection (bit 3 = 8)
    expect(engine.getTile(6, 5).connections & 8).toBeTruthy()
  })

  test('crossroads has all 4 connections', () => {
    const engine = Engine.create(createTestMap(10))
    engine.placeTile(5, 5, Infrastructure.Road)
    engine.placeTile(5, 4, Infrastructure.Road) // North
    engine.placeTile(6, 5, Infrastructure.Road) // East
    engine.placeTile(5, 6, Infrastructure.Road) // South
    engine.placeTile(4, 5, Infrastructure.Road) // West
    expect(engine.getTile(5, 5).connections).toBe(0b1111) // 15
  })

  test('bulldozing updates neighbor connections', () => {
    const engine = Engine.create(createTestMap(10))
    engine.placeTile(5, 5, Infrastructure.Road)
    engine.placeTile(6, 5, Infrastructure.Road)
    engine.bulldoze(6, 5)
    // (5,5) should no longer have East connection
    expect(engine.getTile(5, 5).connections & 2).toBeFalsy()
  })
})
```

**Step 2: Run tests, verify failure**

**Step 3: Implement connection mask logic**

```typescript
// packages/engine/src/connections.ts
import { type GameMap, Infrastructure } from '@rcity/core'

// Direction bits: N=0, E=1, S=2, W=3
const DX = [0, 1, 0, -1]
const DY = [-1, 0, 1, 0]
const OPPOSITE = [2, 3, 0, 1]

export function updateConnections(map: GameMap, x: number, y: number): void {
  updateTileConnections(map, x, y)
  // Update all neighbors too
  for (let dir = 0; dir < 4; dir++) {
    const nx = x + DX[dir]
    const ny = y + DY[dir]
    if (nx >= 0 && ny >= 0 && nx < map.width && ny < map.height) {
      updateTileConnections(map, nx, ny)
    }
  }
}

function updateTileConnections(map: GameMap, x: number, y: number): void {
  const idx = y * map.width + x
  const myInfra = map.infrastructure[idx]

  if (myInfra === 0) {
    map.connections[idx] = 0
    return
  }

  let mask = 0
  for (let dir = 0; dir < 4; dir++) {
    const nx = x + DX[dir]
    const ny = y + DY[dir]
    if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue

    const neighborInfra = map.infrastructure[ny * map.width + nx]
    // Connect if neighbor has any matching infrastructure type
    if (myInfra & neighborInfra & (Infrastructure.Road | Infrastructure.PowerLine | Infrastructure.Rail)) {
      mask |= (1 << dir)
    }
  }

  map.connections[idx] = mask
}
```

**Step 4: Wire into Engine — call `updateConnections` after `placeTile` and `bulldoze`**

**Step 5: Run tests, verify pass**

**Step 6: Commit**

```
feat(engine): add auto-connect infrastructure connection masks
```

---

## Task 7: Power propagation

**Files:**
- Create: `packages/engine/src/simulation/power.ts`
- Create: `packages/engine/src/__tests__/power.test.ts`
- Create: `packages/engine/src/buildings-registry.ts` (built-in building definitions)
- Modify: `packages/engine/src/Engine.ts` (add placeBuilding, run power on tick)

**Step 1: Write failing tests**

Tests per `engine_power.md` PRD: power plant powers adjacent tiles through power lines, gaps block power, roads conduct power, capacity limits, bulldozing disconnects.

**Step 2: Implement building registry**

Define coal plant, nuclear plant, police station, fire station, park, stadium, seaport, airport as `BuildingDef` objects.

**Step 3: Add `placeBuilding` command to Engine**

Validates footprint, checks funds, adds to `map.buildings`, deducts cost.

**Step 4: Implement power BFS**

Multi-source BFS from all power plant tiles. Track capacity per plant. Mark `powerGrid[idx] = 1` for powered tiles. Conductors: power lines, roads, and developed buildings.

**Step 5: Wire power system into Engine.tick()**

Run power propagation every tick. Use dirty flag to skip when grid topology hasn't changed.

**Step 6: Run tests, verify pass**

**Step 7: Commit**

```
feat(engine): add power propagation system with BFS flood fill
```

---

## Task 8: Zone demand model

**Files:**
- Create: `packages/engine/src/simulation/demand.ts`
- Create: `packages/engine/src/__tests__/demand.test.ts`
- Modify: `packages/engine/src/Engine.ts` (run demand monthly, expose getDemand)

**Step 1: Write failing tests**

Tests per `engine_zones.md` PRD: base residential demand is positive, commercial demand follows residential population, industrial has natural base demand, high taxes suppress demand, demand responds to zone ratios.

**Step 2: Implement demand calculation**

Residential, commercial, industrial demand formulas from PRD. Include tax rate modifier.

**Step 3: Wire into Engine tick (monthly)**

**Step 4: Run tests, verify pass**

**Step 5: Commit**

```
feat(engine): add R/C/I demand calculation system
```

---

## Task 9: Zone development and decline

**Files:**
- Create: `packages/engine/src/simulation/zones.ts`
- Create: `packages/engine/src/__tests__/zones.test.ts`
- Modify: `packages/engine/src/Engine.ts`

**Step 1: Write failing tests**

Tests: zone with power + road develops over time, zone without power doesn't develop, zone without road doesn't develop, buildings upgrade with high land value and age, buildings decline without power after 3 months, abandoned buildings are removed.

**Step 2: Implement zone development**

Check conditions (powered, road access, demand > 0), calculate development probability, place buildings. Implement density upgrade logic with age and land value thresholds.

**Step 3: Implement decline**

Check decline triggers (no power, no road, negative demand, low land value). Downgrade density or remove building.

**Step 4: Wire into monthly tick**

**Step 5: Run tests, verify pass**

**Step 6: Commit**

```
feat(engine): add zone development, density upgrades, and decline
```

---

## Task 10: Land value system

**Files:**
- Create: `packages/engine/src/simulation/land-value.ts`
- Create: `packages/engine/src/__tests__/land-value.test.ts`
- Modify: `packages/engine/src/Engine.ts`

**Step 1: Write failing tests**

Tests per `engine_land-value.md` PRD: water adjacency increases value, pollution decreases value, police station increases value, parks increase value, center-of-mass calculation.

**Step 2: Implement influence maps**

Calculate terrain bonus, service bonus, park bonus, center bonus, development density bonus. Calculate pollution penalty, crime penalty. Sum into `landValues` array.

**Step 3: Wire into monthly tick**

**Step 4: Run tests, verify pass**

**Step 5: Commit**

```
feat(engine): add land value calculation with influence maps
```

---

## Task 11: Budget system

**Files:**
- Create: `packages/engine/src/simulation/budget.ts`
- Create: `packages/engine/src/__tests__/budget.test.ts`
- Modify: `packages/engine/src/Engine.ts` (add setTaxRate, setFunding)

**Step 1: Write failing tests**

Tests per `engine_budget.md` PRD: tax income from developed zones, road maintenance deducted annually, high tax suppresses demand, insufficient funds blocks construction, service funding adjustable.

**Step 2: Implement budget calculation**

Annual: calculate tax income (population × landValue / 120 × taxRate), calculate maintenance costs, calculate service costs, update funds. Monthly: calculate projections.

**Step 3: Add `setTaxRate` and `setFunding` commands**

**Step 4: Wire budget into annual tick**

**Step 5: Run tests, verify pass**

**Step 6: Commit**

```
feat(engine): add budget system with taxes, maintenance, and service funding
```

---

## Task 12: Serialize / restore

**Files:**
- Create: `packages/engine/src/__tests__/serialization.test.ts`
- Modify: `packages/engine/src/Engine.ts` (add serialize, restore)

**Step 1: Write failing tests**

```typescript
test('serialize and restore produces identical state', () => {
  const engine = Engine.create(createTestMap(32), { seed: 42 })
  engine.placeBuilding(5, 5, 'power.coal')
  engine.placeTile(6, 5, Infrastructure.Road)
  engine.placeZone(7, 5, ZoneType.Residential)
  for (let i = 0; i < 48; i++) engine.tick()

  const save = engine.serialize()
  const restored = Engine.restore(save)
  const s1 = engine.getState()
  const s2 = restored.getState()

  expect(s2.time.tickCount).toBe(s1.time.tickCount)
  expect(s2.funds).toBe(s1.funds)
  expect(s2.population).toBe(s1.population)
  expect(Array.from(s2.map.terrain)).toEqual(Array.from(s1.map.terrain))
})
```

**Step 2: Implement serialize**

Convert GameMap typed arrays to regular arrays for JSON serialization. Include PRNG seed, all simulation state.

**Step 3: Implement restore**

Reconstruct Engine from SaveFile. Rebuild typed arrays. Restore PRNG state.

**Step 4: Run tests, verify pass**

**Step 5: Commit**

```
feat(engine): add save/load serialization
```

---

## Task 13: Integration test — full city lifecycle

**Files:**
- Create: `packages/engine/src/__tests__/integration.test.ts`

**Step 1: Write integration test**

```typescript
describe('Full city lifecycle', () => {
  test('city grows with proper infrastructure', () => {
    const engine = Engine.create(createTestMap(64), { seed: 42 })

    // Build power
    engine.placeBuilding(10, 10, 'power.coal')

    // Build road
    for (let x = 11; x < 25; x++) {
      engine.placeTile(x, 10, Infrastructure.Road)
    }

    // Zone residential and commercial
    for (let x = 11; x < 25; x++) {
      engine.placeZone(x, 9, ZoneType.Residential)
      engine.placeZone(x, 11, ZoneType.Commercial)
    }

    // Run 5 years
    advanceYear(engine)
    advanceYear(engine)
    advanceYear(engine)
    advanceYear(engine)
    advanceYear(engine)

    const state = engine.getState()
    expect(state.population).toBeGreaterThan(0)
    expect(state.funds).toBeGreaterThan(0)
    expect(state.demand.residential).toBeGreaterThan(-1)
  })

  test('city without power stagnates', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    // Roads and zones but no power plant
    for (let x = 5; x < 15; x++) {
      engine.placeTile(x, 10, Infrastructure.Road)
      engine.placeZone(x, 9, ZoneType.Residential)
    }
    advanceYear(engine)
    advanceYear(engine)
    expect(engine.getState().population).toBe(0)
  })
})
```

**Step 2: Run tests, verify pass**

**Step 3: Commit**

```
test(engine): add full city lifecycle integration tests
```

---

## Summary

| Task | What | Depends On |
|------|------|-----------|
| 1 | Monorepo scaffolding | — |
| 2 | Core types: tiles, zones, infra | 1 |
| 3 | Core types: buildings, map, state | 2 |
| 4 | Engine scaffold + PRNG + time | 3 |
| 5 | Tile placement + bulldoze | 4 |
| 6 | Connection masks | 5 |
| 7 | Power propagation | 6 |
| 8 | Zone demand model | 4 |
| 9 | Zone development + decline | 7, 8 |
| 10 | Land value system | 7 |
| 11 | Budget system | 9 |
| 12 | Serialize / restore | 11 |
| 13 | Integration tests | 12 |

Tasks 7+8 can be parallelized (both depend on 4, neither depends on the other). Task 9 merges them. Tasks 10 and 11 are sequential after 9. Task 12-13 are the capstone.
