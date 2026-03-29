# CLI & Docs Unification Implementation Plan

> **Status:** DONE — Implemented and shipped.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `packages/cli` (AI-playable terminal interface) and `packages/docs` (shared documentation), cleaning up duplicated constants along the way.

**Architecture:** `core ← engine ← docs ← cli` and `game ← docs`. The engine gains `hasRoadAccess` on `TileInfo`. A shared `hasNearbyRoad` utility replaces two duplicate copies. `BUILDING_DEFS` references `COSTS`/`MAINTENANCE` instead of hardcoding values. `packages/docs` exports markdown sections + a derived `getBuildingReference()`. `packages/cli` wraps the engine with a JSON-outputting command interface.

**Tech Stack:** TypeScript + Vitest (matches existing packages), `commander` for CLI arg parsing, `marked` for markdown→HTML in the game.

---

### Task 1: Extract shared `hasNearbyRoad` utility

`hasNearbyRoad` is currently copy-pasted in `zones.ts` and `land-value.ts`. Extract it first so Task 2 can reuse it.

**Files:**
- Create: `packages/engine/src/simulation/road-access.ts`
- Modify: `packages/engine/src/simulation/zones.ts`
- Modify: `packages/engine/src/simulation/land-value.ts`

**Step 1: Write the failing test**

Add to `packages/engine/src/__tests__/tools.test.ts` (or create a new file `packages/engine/src/__tests__/road-access.test.ts`):

```typescript
import { describe, test, expect } from 'vitest'
import { Infrastructure, ZoneType } from '@bitborough/core'
import { Engine } from '../Engine.js'
import { createTestMap } from '../test-helpers.js'

describe('hasNearbyRoad', () => {
  test('tile adjacent to road returns true', () => {
    const map = createTestMap(16)
    const engine = Engine.create(map)
    engine.placeTile(8, 8, Infrastructure.Road)
    const info = engine.getTile(8, 9)
    expect(info.hasRoadAccess).toBe(true)
  })

  test('tile 3 tiles from road (Manhattan) returns true', () => {
    const map = createTestMap(16)
    const engine = Engine.create(map)
    engine.placeTile(8, 8, Infrastructure.Road)
    const info = engine.getTile(8, 11) // 3 tiles south
    expect(info.hasRoadAccess).toBe(true)
  })

  test('tile 4 tiles from road returns false', () => {
    const map = createTestMap(16)
    const engine = Engine.create(map)
    engine.placeTile(8, 8, Infrastructure.Road)
    const info = engine.getTile(8, 12) // 4 tiles south
    expect(info.hasRoadAccess).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/engine && pnpm test
```
Expected: FAIL — `info.hasRoadAccess` is undefined.

**Step 3: Create `road-access.ts`**

```typescript
// packages/engine/src/simulation/road-access.ts
import { Infrastructure, type GameMap } from '@bitborough/core'

export function hasNearbyRoad(map: GameMap, x: number, y: number, range = 3): boolean {
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > range) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue
      if (map.infrastructure[ny * map.width + nx]! & Infrastructure.Road) return true
    }
  }
  return false
}
```

**Step 4: Add `hasRoadAccess` to `TileInfo` in `Engine.ts`**

In `packages/engine/src/Engine.ts`:

```typescript
// Add to TileInfo interface:
export interface TileInfo {
  terrain: TileType
  zone: ZoneType
  infrastructure: number
  connections: number
  elevation: number
  powered: boolean
  hasRoadAccess: boolean   // ← add this
}
```

In `getTile()`:
```typescript
import { hasNearbyRoad } from './simulation/road-access.js'

getTile(x: number, y: number): TileInfo {
  const idx = y * this.map.width + x
  return {
    terrain: this.map.terrain[idx] as TileType,
    zone: this.map.zones[idx] as ZoneType,
    infrastructure: this.map.infrastructure[idx]!,
    connections: this.map.connections[idx]!,
    elevation: this.map.elevation[idx]!,
    powered: this.powerGrid[idx] !== 0,
    hasRoadAccess: hasNearbyRoad(this.map, x, y),  // ← add this
  }
}
```

**Step 5: Update `zones.ts` and `land-value.ts` to use the shared utility**

In `zones.ts` — remove the local `hasNearbyRoad` function, add import:
```typescript
import { hasNearbyRoad } from './road-access.js'
```

In `land-value.ts` — same: remove local copy, add import.

**Step 6: Run tests**

```bash
cd packages/engine && pnpm test
```
Expected: all pass.

**Step 7: Commit**

```bash
git add packages/engine/src/simulation/road-access.ts packages/engine/src/simulation/zones.ts packages/engine/src/simulation/land-value.ts packages/engine/src/Engine.ts packages/engine/src/__tests__/road-access.test.ts
git commit -m "feat: extract hasNearbyRoad utility, add hasRoadAccess to TileInfo"
```

---

### Task 2: Clean up BUILDING_DEFS constants duplication

`BUILDING_DEFS` hardcodes `cost` and `maintenanceCost` values that already exist in `COSTS`/`MAINTENANCE` in `@bitborough/core`.

**Files:**
- Modify: `packages/engine/src/buildings-registry.ts`

**Step 1: Write a test that cost values match core constants**

Add to `packages/engine/src/__tests__/placement.test.ts` (or a new `packages/engine/src/__tests__/buildings-registry.test.ts`):

```typescript
import { describe, test, expect } from 'vitest'
import { COSTS, MAINTENANCE } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

describe('BUILDING_DEFS cost consistency', () => {
  test('transit.stop cost matches COSTS.transitStop', () => {
    expect(BUILDING_DEFS['transit.stop']!.cost).toBe(COSTS.transitStop)
    expect(BUILDING_DEFS['transit.stop']!.maintenanceCost).toBe(MAINTENANCE.transitStop)
  })
  test('power.diesel cost matches COSTS.dieselGenerator', () => {
    expect(BUILDING_DEFS['power.diesel']!.cost).toBe(COSTS.dieselGenerator)
    expect(BUILDING_DEFS['power.diesel']!.maintenanceCost).toBe(MAINTENANCE.dieselGenerator)
  })
  test('power.coal cost matches COSTS.coalPlant', () => {
    expect(BUILDING_DEFS['power.coal']!.cost).toBe(COSTS.coalPlant)
    expect(BUILDING_DEFS['power.coal']!.maintenanceCost).toBe(MAINTENANCE.coalPlant)
  })
  test('power.nuclear cost matches COSTS.nuclearPlant', () => {
    expect(BUILDING_DEFS['power.nuclear']!.cost).toBe(COSTS.nuclearPlant)
    expect(BUILDING_DEFS['power.nuclear']!.maintenanceCost).toBe(MAINTENANCE.nuclearPlant)
  })
  test('service.police cost matches COSTS.policeStation', () => {
    expect(BUILDING_DEFS['service.police']!.cost).toBe(COSTS.policeStation)
    expect(BUILDING_DEFS['service.police']!.maintenanceCost).toBe(MAINTENANCE.policeStation)
  })
  test('service.fire cost matches COSTS.fireStation', () => {
    expect(BUILDING_DEFS['service.fire']!.cost).toBe(COSTS.fireStation)
    expect(BUILDING_DEFS['service.fire']!.maintenanceCost).toBe(MAINTENANCE.fireStation)
  })
  test('special.park cost matches COSTS.park', () => {
    expect(BUILDING_DEFS['special.park']!.cost).toBe(COSTS.park)
  })
})
```

**Step 2: Run test — should already pass** (values match but are hardcoded). This is the baseline.

**Step 3: Update `buildings-registry.ts` to reference constants**

```typescript
import { type BuildingDef, BuildingCategory, DensityLevel } from '@bitborough/core'
import { COSTS, MAINTENANCE } from '@bitborough/core'  // ← add

// Then replace hardcoded values:
'transit.stop': {
  ...
  cost: COSTS.transitStop,              // was: 500
  maintenanceCost: MAINTENANCE.transitStop,  // was: 50
},
'power.diesel': {
  ...
  cost: COSTS.dieselGenerator,          // was: 300
  maintenanceCost: MAINTENANCE.dieselGenerator,  // was: 15
},
'power.coal': {
  ...
  cost: COSTS.coalPlant,               // was: 2000
  maintenanceCost: MAINTENANCE.coalPlant,  // was: 60
},
'power.nuclear': {
  ...
  cost: COSTS.nuclearPlant,            // was: 5000
  maintenanceCost: MAINTENANCE.nuclearPlant,  // was: 100
},
'service.police': {
  ...
  cost: COSTS.policeStation,           // was: 300
  maintenanceCost: MAINTENANCE.policeStation,  // was: 50
},
'service.fire': {
  ...
  cost: COSTS.fireStation,             // was: 300
  maintenanceCost: MAINTENANCE.fireStation,  // was: 50
},
'special.park': {
  ...
  cost: COSTS.park,                    // was: 10
  maintenanceCost: 0,
},
```

**Step 4: Run tests**

```bash
cd packages/engine && pnpm test
```
Expected: all pass.

**Step 5: Commit**

```bash
git add packages/engine/src/buildings-registry.ts packages/engine/src/__tests__/buildings-registry.test.ts
git commit -m "refactor: BUILDING_DEFS references COSTS/MAINTENANCE from core"
```

---

### Task 3: Create `packages/docs`

New package. Exports markdown `DocSection[]` and `getBuildingReference()` derived from `BUILDING_DEFS`.

**Files:**
- Create: `packages/docs/package.json`
- Create: `packages/docs/tsconfig.json`
- Create: `packages/docs/src/types.ts`
- Create: `packages/docs/src/building-reference.ts`
- Create: `packages/docs/src/sections/getting-started.ts`
- Create: `packages/docs/src/sections/zones.ts`
- Create: `packages/docs/src/sections/power.ts`
- Create: `packages/docs/src/sections/roads-traffic.ts`
- Create: `packages/docs/src/sections/budget-taxes.ts`
- Create: `packages/docs/src/sections/demand.ts`
- Create: `packages/docs/src/sections/controls.ts`
- Create: `packages/docs/src/sections/tools.ts`
- Create: `packages/docs/src/sections/overlays.ts`
- Create: `packages/docs/src/sections/crime.ts`
- Create: `packages/docs/src/sections/fire.ts`
- Create: `packages/docs/src/sections/land-value.ts`
- Create: `packages/docs/src/sections/time-simulation.ts`
- Create: `packages/docs/src/index.ts`
- Test: `packages/docs/src/__tests__/building-reference.test.ts`

**Step 1: `package.json`**

```json
{
  "name": "@bitborough/docs",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@bitborough/core": "workspace:*",
    "@bitborough/engine": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

**Step 2: `tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

(Copy pattern from `packages/engine/tsconfig.json` — check if `tsconfig.base.json` exists at root or adapt as needed.)

**Step 3: `src/types.ts`**

```typescript
export interface DocSection {
  id: string
  title: string
  body: string  // markdown, no HTML
}

export interface BuildingRow {
  id: string
  name: string
  cost: number
  maintenanceCost: number
  powerCapacity?: number
  population?: number
  jobs?: number
  pollutionRadius?: number
  pollutionAmount?: number
  size: { w: number; h: number }
  notes: string
}
```

**Step 4: Write failing test for `getBuildingReference()`**

```typescript
// packages/docs/src/__tests__/building-reference.test.ts
import { describe, test, expect } from 'vitest'
import { COSTS, MAINTENANCE, POWER } from '@bitborough/core'
import { getBuildingReference } from '../building-reference.js'

describe('getBuildingReference', () => {
  test('diesel generator row has correct cost from COSTS', () => {
    const rows = getBuildingReference()
    const diesel = rows.find(r => r.id === 'power.diesel')
    expect(diesel).toBeDefined()
    expect(diesel!.cost).toBe(COSTS.dieselGenerator)
    expect(diesel!.maintenanceCost).toBe(MAINTENANCE.dieselGenerator)
    expect(diesel!.powerCapacity).toBe(POWER.dieselCapacity)
  })

  test('res.low row has correct population', () => {
    const rows = getBuildingReference()
    const res = rows.find(r => r.id === 'res.low')
    expect(res!.population).toBe(10)
  })

  test('every row has an id, name, cost, and maintenanceCost', () => {
    const rows = getBuildingReference()
    for (const row of rows) {
      expect(row.id).toBeTruthy()
      expect(row.name).toBeTruthy()
      expect(typeof row.cost).toBe('number')
      expect(typeof row.maintenanceCost).toBe('number')
    }
  })
})
```

**Step 5: Run test — verify it fails**

```bash
cd packages/docs && pnpm test
```

**Step 6: `src/building-reference.ts`**

```typescript
import { COSTS, MAINTENANCE, POWER } from '@bitborough/core'
import { BUILDING_DEFS } from '@bitborough/engine'
import type { BuildingRow } from './types.js'

const NAMES: Record<string, string> = {
  'res.low': 'Residential (Low)',
  'res.med': 'Residential (Med)',
  'res.med.b': 'Residential (Med B)',
  'res.high': 'Residential (High)',
  'com.low': 'Commercial (Low)',
  'com.med': 'Commercial (Med)',
  'com.med.b': 'Commercial (Med B)',
  'com.high': 'Commercial (High)',
  'com.high.b': 'Commercial (High B)',
  'ind.low': 'Industrial (Low)',
  'ind.med': 'Industrial (Med)',
  'ind.med.b': 'Industrial (Med B)',
  'ind.high': 'Industrial (High)',
  'ind.high.b': 'Industrial (High B)',
  'transit.stop': 'Transit Stop',
  'power.diesel': 'Diesel Generator',
  'power.coal': 'Coal Plant',
  'power.nuclear': 'Nuclear Plant',
  'service.police': 'Police Station',
  'service.fire': 'Fire Station',
  'special.park': 'Park',
}

const NOTES: Record<string, string> = {
  'res.low': 'Develops on R zones',
  'res.med': 'Needs paved road + pop 500',
  'res.med.b': 'Needs paved road + pop 500',
  'res.high': 'Needs transit stop',
  'com.low': 'Needs population',
  'com.med': 'Needs paved road',
  'com.med.b': 'Needs paved road',
  'com.high': 'Needs transit stop',
  'com.high.b': 'Needs transit stop',
  'ind.low': 'Steady demand',
  'ind.med': 'More tax, same jobs',
  'ind.med.b': 'More tax, same jobs',
  'ind.high': 'Automated: high tax, few jobs',
  'ind.high.b': 'Automated: high tax, few jobs',
  'transit.stop': 'Anchors high density in 10-tile radius',
  'power.diesel': 'Early game power',
  'power.coal': 'Mid-game power',
  'power.nuclear': 'Most efficient',
  'service.police': '15-tile crime radius',
  'service.fire': '15-tile fire radius',
  'special.park': 'Boosts land value',
}

const POWER_CAPACITY: Record<string, number> = {
  'power.diesel': POWER.dieselCapacity,
  'power.coal': POWER.coalCapacity,
  'power.nuclear': POWER.nuclearCapacity,
}

export function getBuildingReference(): BuildingRow[] {
  return Object.entries(BUILDING_DEFS).map(([id, def]) => ({
    id,
    name: NAMES[id] ?? id,
    cost: def.cost,
    maintenanceCost: def.maintenanceCost,
    powerCapacity: POWER_CAPACITY[id],
    population: def.population > 0 ? def.population : undefined,
    jobs: def.jobs > 0 ? def.jobs : undefined,
    pollutionRadius: def.pollutionRadius > 0 ? def.pollutionRadius : undefined,
    pollutionAmount: def.pollutionAmount > 0 ? def.pollutionAmount : undefined,
    size: def.size,
    notes: NOTES[id] ?? '',
  }))
}
```

**Step 7: Port narrative sections from `packages/game/src/ui/docs/`**

For each section, convert the existing HTML content to clean markdown. Example for `src/sections/getting-started.ts`:

```typescript
import type { DocSection } from '../types.js'

export const gettingStarted: DocSection = {
  id: 'getting-started',
  title: 'Getting Started',
  body: `
Welcome to Bitborough! Build and manage a thriving city.

**Basic steps:**

1. Place a **Diesel Generator** (key \`6\`) or **Coal Power Plant** (key \`7\`) to generate electricity
2. Run **Power Lines** (key \`2\`) from the plant toward your city
3. Build **Roads** (key \`1\`) for access
4. Zone **Residential** (\`3\`), **Commercial** (\`4\`), and **Industrial** (\`5\`) areas next to roads
5. Wait for buildings to develop automatically

Zones only develop when they are **powered** and **within 3 tiles of a road**.
`.trim(),
}
```

Do the same for all other sections (zones, power, roads-traffic, budget-taxes, demand, controls, tools, overlays, crime, fire, land-value, time-simulation). Convert `<strong>` → `**`, `<em>` → `*`, `<ul>/<li>` → `- `, `<ol>/<li>` → `1.`, `<code>` → backtick, `<p>` → blank line between paragraphs.

**Step 8: `src/index.ts`**

```typescript
export type { DocSection, BuildingRow } from './types.js'
export { getBuildingReference } from './building-reference.js'

import { gettingStarted } from './sections/getting-started.js'
import { controls } from './sections/controls.js'
import { tools } from './sections/tools.js'
import { overlays } from './sections/overlays.js'
import { power } from './sections/power.js'
import { zones } from './sections/zones.js'
import { roadsTraffic } from './sections/roads-traffic.js'
import { budgetTaxes } from './sections/budget-taxes.js'
import { demand } from './sections/demand.js'
import { crime } from './sections/crime.js'
import { fire } from './sections/fire.js'
import { landValue } from './sections/land-value.js'
import { timeSimulation } from './sections/time-simulation.js'

export const SECTIONS: DocSection[] = [
  gettingStarted, controls, tools, overlays, power, zones,
  roadsTraffic, budgetTaxes, demand, crime, fire, landValue, timeSimulation,
]
```

**Step 9: Run tests**

```bash
cd packages/docs && pnpm test
```
Expected: all pass.

**Step 10: Commit**

```bash
git add packages/docs/
git commit -m "feat: add @bitborough/docs package with shared sections and derived building reference"
```

---

### Task 4: Update `packages/game` to use `@bitborough/docs`

Replace `packages/game/src/ui/docs/` with imports from `@bitborough/docs`.

**Files:**
- Modify: `packages/game/package.json` (add deps)
- Delete: `packages/game/src/ui/docs/*.ts` (all except `types.ts` if referenced elsewhere)
- Modify: `packages/game/src/ui/DocsPanel.ts`
- Modify: `packages/game/src/ui/docs/building-reference.ts` → replaced by `getBuildingReference()`

**Step 1: Add dependencies to game's `package.json`**

```json
"dependencies": {
  "@bitborough/docs": "workspace:*",
  "marked": "^12.0.0"
}
```

Run: `pnpm install` in `packages/game`.

**Step 2: Update `DocsPanel.ts`**

Find where `SECTIONS` from the local docs is used and replace with the shared import. The game renders `section.body` (markdown) as HTML using `marked`:

```typescript
import { SECTIONS, getBuildingReference } from '@bitborough/docs'
import { marked } from 'marked'

// When rendering a section body:
const html = marked.parse(section.body) as string

// When rendering the building reference:
const rows = getBuildingReference()
// build the same HTML table from rows instead of the hardcoded string
```

**Step 3: Delete the game's local docs files**

```bash
rm packages/game/src/ui/docs/getting-started.ts
rm packages/game/src/ui/docs/zones.ts
rm packages/game/src/ui/docs/power.ts
rm packages/game/src/ui/docs/roads-traffic.ts
rm packages/game/src/ui/docs/budget-taxes.ts
rm packages/game/src/ui/docs/demand.ts
rm packages/game/src/ui/docs/controls.ts
rm packages/game/src/ui/docs/tools.ts
rm packages/game/src/ui/docs/overlays.ts
rm packages/game/src/ui/docs/crime.ts
rm packages/game/src/ui/docs/fire.ts
rm packages/game/src/ui/docs/land-value.ts
rm packages/game/src/ui/docs/time-simulation.ts
rm packages/game/src/ui/docs/building-reference.ts
rm packages/game/src/ui/docs/index.ts
rm packages/game/src/ui/docs/types.ts
```

**Step 4: Verify game builds and docs render**

```bash
cd packages/game && pnpm dev
```

Open http://localhost:5173, click **Guide (G)**, verify all sections show content and building reference table is populated.

**Step 5: Commit**

```bash
git add packages/game/
git commit -m "refactor: game docs now imported from @bitborough/docs"
```

---

### Task 5: Create `packages/cli`

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/src/index.ts` (entry, registers all commands)
- Create: `packages/cli/src/state.ts` (load/save game.json)
- Create: `packages/cli/src/output.ts` (JSON output helpers)
- Create: `packages/cli/src/commands/new.ts`
- Create: `packages/cli/src/commands/status.ts`
- Create: `packages/cli/src/commands/tick.ts`
- Create: `packages/cli/src/commands/place.ts`
- Create: `packages/cli/src/commands/zone.ts`
- Create: `packages/cli/src/commands/bulldoze.ts`
- Create: `packages/cli/src/commands/tile.ts`
- Create: `packages/cli/src/commands/tiles.ts`
- Create: `packages/cli/src/commands/buildings.ts`
- Create: `packages/cli/src/commands/docs.ts`
- Test: `packages/cli/src/__tests__/commands.test.ts`

**Step 1: `package.json`**

```json
{
  "name": "@bitborough/cli",
  "version": "0.0.1",
  "type": "module",
  "bin": { "bitt": "./src/index.ts" },
  "scripts": {
    "dev": "tsx src/index.ts",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@bitborough/core": "workspace:*",
    "@bitborough/engine": "workspace:*",
    "@bitborough/map-gen": "workspace:*",
    "@bitborough/docs": "workspace:*",
    "commander": "^12.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vitest": "^3.0.0",
    "tsx": "^4.0.0"
  }
}
```

**Step 2: `src/state.ts`** — load/save engine state to a JSON file

```typescript
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { Engine } from '@bitborough/engine'
import type { SaveFile } from '@bitborough/core'

export function loadEngine(file = 'game.json'): Engine {
  if (!existsSync(file)) {
    console.error(JSON.stringify({ ok: false, error: `No game file at ${file}. Run: bitt new` }))
    process.exit(1)
  }
  const save = JSON.parse(readFileSync(file, 'utf-8')) as SaveFile
  return Engine.restore(save)
}

export function saveEngine(engine: Engine, file = 'game.json'): void {
  writeFileSync(file, JSON.stringify(engine.serialize(), null, 2))
}
```

**Step 3: `src/output.ts`** — print JSON and exit

```typescript
export function out(data: unknown): never {
  console.log(JSON.stringify(data, null, 2))
  process.exit(0)
}

export function err(error: string, code = 1): never {
  console.error(JSON.stringify({ ok: false, error }))
  process.exit(code)
}
```

**Step 4: Write tests for commands**

```typescript
// packages/cli/src/__tests__/commands.test.ts
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { writeFileSync, unlinkSync, existsSync } from 'fs'
import { Engine } from '@bitborough/engine'
import { generateMap } from '@bitborough/map-gen'
import { Infrastructure, ZoneType } from '@bitborough/core'

const TEST_FILE = '/tmp/bitt-test-game.json'

function makeTestGame(): string {
  const map = generateMap({ width: 32, height: 32, seed: 42 })
  const engine = Engine.create(map)
  const json = JSON.stringify(engine.serialize(), null, 2)
  writeFileSync(TEST_FILE, json)
  return TEST_FILE
}

afterEach(() => {
  if (existsSync(TEST_FILE)) unlinkSync(TEST_FILE)
})

describe('state: load/save roundtrip', () => {
  test('serialized engine restores with same funds', () => {
    const map = generateMap({ width: 32, height: 32, seed: 42 })
    const engine = Engine.create(map)
    const save = engine.serialize()
    const restored = Engine.restore(save)
    expect(restored.getState().funds).toBe(engine.getState().funds)
  })
})

describe('getTile hasRoadAccess', () => {
  test('returns false on tile with no nearby road', () => {
    const map = generateMap({ width: 32, height: 32, seed: 42 })
    const engine = Engine.create(map)
    const info = engine.getTile(5, 5)
    expect(info.hasRoadAccess).toBe(false)
  })

  test('returns true after placing road 2 tiles away', () => {
    const map = generateMap({ width: 32, height: 32, seed: 42 })
    const engine = Engine.create(map)
    engine.placeTile(5, 5, Infrastructure.Road)
    const info = engine.getTile(5, 7)
    expect(info.hasRoadAccess).toBe(true)
  })
})
```

**Step 5: Run tests — verify they pass**

```bash
cd packages/cli && pnpm install && pnpm test
```

**Step 6: Implement each command**

**`src/commands/new.ts`:**
```typescript
import { Command } from 'commander'
import { Engine } from '@bitborough/engine'
import { generateMap } from '@bitborough/map-gen'
import { saveEngine } from '../state.js'
import { out } from '../output.js'

export function newCommand(program: Command) {
  program
    .command('new')
    .option('--seed <n>', 'map seed', '0')
    .option('--size <n>', 'map size (32|64|128|256)', '128')
    .option('--file <path>', 'output file', 'game.json')
    .action((opts) => {
      const size = parseInt(opts.size)
      const seed = parseInt(opts.seed)
      const map = generateMap({ width: size, height: size, seed })
      const engine = Engine.create(map)
      saveEngine(engine, opts.file)
      const state = engine.getState()
      out({ ok: true, file: opts.file, size, seed, funds: state.funds })
    })
}
```

**`src/commands/status.ts`:**
```typescript
import { Command } from 'commander'
import { loadEngine } from '../state.js'
import { out } from '../output.js'

export function statusCommand(program: Command) {
  program
    .command('status')
    .option('--file <path>', 'game file', 'game.json')
    .action((opts) => {
      const engine = loadEngine(opts.file)
      const s = engine.getState()
      const d = engine.getDemand()
      out({
        month: s.month,
        year: s.year,
        population: s.population,
        funds: s.funds,
        monthlyIncome: s.budget.monthlyIncome,
        monthlyCosts: s.budget.monthlyCosts,
        demand: { R: d.residential, C: d.commercial, I: d.industrial },
      })
    })
}
```

**`src/commands/tick.ts`:**
```typescript
import { Command } from 'commander'
import { loadEngine, saveEngine } from '../state.js'
import { out } from '../output.js'

export function tickCommand(program: Command) {
  program
    .command('tick [n]')
    .option('--file <path>', 'game file', 'game.json')
    .action((n, opts) => {
      const months = parseInt(n ?? '1')
      const engine = loadEngine(opts.file)
      const ticksPerMonth = 4  // matches DEFAULTS.ticksPerMonth
      for (let i = 0; i < months * ticksPerMonth; i++) engine.tick()
      saveEngine(engine, opts.file)
      const s = engine.getState()
      out({
        ok: true,
        monthsAdvanced: months,
        month: s.month,
        year: s.year,
        population: s.population,
        funds: s.funds,
        monthlyIncome: s.budget.monthlyIncome,
      })
    })
}
```

**`src/commands/place.ts`:**
```typescript
import { Command } from 'commander'
import { Infrastructure } from '@bitborough/core'
import { loadEngine, saveEngine } from '../state.js'
import { out } from '../output.js'

const INFRA_MAP: Record<string, Infrastructure> = {
  road:      Infrastructure.Road,
  powerline: Infrastructure.PowerLine,
  pave:      Infrastructure.PavedRoad,
}

const BUILDING_MAP: Record<string, string> = {
  diesel:  'power.diesel',
  coal:    'power.coal',
  nuclear: 'power.nuclear',
  transit: 'transit.stop',
  police:  'service.police',
  fire:    'service.fire',
  park:    'special.park',
}

export function placeCommand(program: Command) {
  program
    .command('place <type> <x> <y>')
    .option('--file <path>', 'game file', 'game.json')
    .action((type, x, y, opts) => {
      const engine = loadEngine(opts.file)
      const tx = parseInt(x), ty = parseInt(y)
      let result

      if (type in INFRA_MAP) {
        result = engine.placeTile(tx, ty, INFRA_MAP[type]!)
      } else if (type in BUILDING_MAP) {
        result = engine.placeBuilding(tx, ty, BUILDING_MAP[type]!)
      } else {
        out({ ok: false, error: `Unknown type: ${type}. Valid: ${[...Object.keys(INFRA_MAP), ...Object.keys(BUILDING_MAP)].join(', ')}` })
      }

      if (result!.ok) saveEngine(engine, opts.file)
      out({ ok: result!.ok, reason: result!.ok ? undefined : result!.reason, funds: engine.getState().funds })
    })
}
```

**`src/commands/zone.ts`:**
```typescript
import { Command } from 'commander'
import { ZoneType } from '@bitborough/core'
import { loadEngine, saveEngine } from '../state.js'
import { out } from '../output.js'

const ZONE_MAP: Record<string, ZoneType> = {
  R: ZoneType.Residential,
  C: ZoneType.Commercial,
  I: ZoneType.Industrial,
}

export function zoneCommand(program: Command) {
  program
    .command('zone <type> <x> <y>')
    .option('--file <path>', 'game file', 'game.json')
    .action((type, x, y, opts) => {
      const engine = loadEngine(opts.file)
      const zone = ZONE_MAP[type.toUpperCase()]
      if (!zone) out({ ok: false, error: `Zone must be R, C, or I` })
      const result = engine.placeZone(parseInt(x), parseInt(y), zone!)
      if (result.ok) saveEngine(engine, opts.file)
      out({ ok: result.ok, reason: result.ok ? undefined : result.reason })
    })
}
```

**`src/commands/bulldoze.ts`:**
```typescript
import { Command } from 'commander'
import { loadEngine, saveEngine } from '../state.js'
import { out } from '../output.js'

export function bulldozeCommand(program: Command) {
  program
    .command('bulldoze <x> <y>')
    .option('--file <path>', 'game file', 'game.json')
    .action((x, y, opts) => {
      const engine = loadEngine(opts.file)
      const result = engine.bulldoze(parseInt(x), parseInt(y))
      if (result.ok) saveEngine(engine, opts.file)
      out({ ok: result.ok, reason: result.ok ? undefined : result.reason, funds: engine.getState().funds })
    })
}
```

**`src/commands/tile.ts`:**
```typescript
import { Command } from 'commander'
import { loadEngine } from '../state.js'
import { out } from '../output.js'
import { TileType, ZoneType, Infrastructure } from '@bitborough/core'

export function tileCommand(program: Command) {
  program
    .command('tile <x> <y>')
    .option('--file <path>', 'game file', 'game.json')
    .action((x, y, opts) => {
      const engine = loadEngine(opts.file)
      const tx = parseInt(x), ty = parseInt(y)
      const state = engine.getState()
      const info = engine.getTile(tx, ty)
      const building = state.map.buildings.find(b => b.x === tx && b.y === ty)
      out({
        x: tx, y: ty,
        terrain: TileType[info.terrain],
        zone: info.zone !== ZoneType.None ? ZoneType[info.zone] : null,
        infra: infraFlags(info.infrastructure),
        powered: info.powered,
        hasRoadAccess: info.hasRoadAccess,
        building: building ? { id: building.defId, state: building.state } : null,
      })
    })
}

function infraFlags(infra: number): string[] {
  const flags: string[] = []
  if (infra & Infrastructure.Road) flags.push(infra & Infrastructure.PavedRoad ? 'pavedRoad' : 'road')
  if (infra & Infrastructure.PowerLine) flags.push('powerLine')
  return flags
}
```

**`src/commands/tiles.ts`:**
```typescript
import { Command } from 'commander'
import { loadEngine } from '../state.js'
import { out } from '../output.js'
import { TileType, ZoneType, Infrastructure } from '@bitborough/core'

export function tilesCommand(program: Command) {
  program
    .command('tiles <x1> <y1> <x2> <y2>')
    .option('--file <path>', 'game file', 'game.json')
    .action((x1, y1, x2, y2, opts) => {
      const engine = loadEngine(opts.file)
      const state = engine.getState()
      const tiles = []
      const gridRows: string[] = []

      for (let y = parseInt(y1); y <= parseInt(y2); y++) {
        const rowCells: string[] = []
        for (let x = parseInt(x1); x <= parseInt(x2); x++) {
          const info = engine.getTile(x, y)
          const building = state.map.buildings.find(b => b.x === x && b.y === y)
          tiles.push({
            x, y,
            terrain: TileType[info.terrain],
            zone: info.zone !== ZoneType.None ? ZoneType[info.zone] : null,
            infra: info.infrastructure & Infrastructure.Road ? (info.infrastructure & Infrastructure.PavedRoad ? '=' : '-') : null,
            powered: info.powered,
            hasRoadAccess: info.hasRoadAccess,
            building: building?.defId ?? null,
          })
          // grid cell: W=water, .=empty, R/C/I=zone, ==paved, -=road, *=powered
          let cell = '.'
          if (info.terrain === TileType.Water) cell = '~'
          else if (info.infrastructure & Infrastructure.Road) cell = info.infrastructure & Infrastructure.PavedRoad ? '=' : '-'
          else if (info.zone !== ZoneType.None) cell = ZoneType[info.zone][0]!
          rowCells.push(cell)
        }
        gridRows.push(rowCells.join(''))
      }
      out({ tiles, grid: gridRows.join('\n') })
    })
}
```

**`src/commands/buildings.ts`:**
```typescript
import { Command } from 'commander'
import { loadEngine } from '../state.js'
import { out } from '../output.js'

export function buildingsCommand(program: Command) {
  program
    .command('buildings')
    .option('--file <path>', 'game file', 'game.json')
    .action((opts) => {
      const engine = loadEngine(opts.file)
      const state = engine.getState()
      out(state.map.buildings.map(b => ({
        x: b.x, y: b.y, id: b.defId, state: b.state,
      })))
    })
}
```

**`src/commands/docs.ts`:**
```typescript
import { Command } from 'commander'
import { SECTIONS, getBuildingReference } from '@bitborough/docs'
import { out } from '../output.js'

export function docsCommand(program: Command) {
  program
    .command('docs [section]')
    .action((section) => {
      if (!section) {
        out({ sections: SECTIONS.map(s => ({ id: s.id, title: s.title })) })
      } else if (section === 'buildings') {
        out(getBuildingReference())
      } else {
        const s = SECTIONS.find(x => x.id === section)
        if (!s) out({ ok: false, error: `Unknown section: ${section}` })
        out({ id: s!.id, title: s!.title, body: s!.body })
      }
    })
}
```

**Step 7: `src/index.ts`**

```typescript
#!/usr/bin/env node
import { Command } from 'commander'
import { newCommand } from './commands/new.js'
import { statusCommand } from './commands/status.js'
import { tickCommand } from './commands/tick.js'
import { placeCommand } from './commands/place.js'
import { zoneCommand } from './commands/zone.js'
import { bulldozeCommand } from './commands/bulldoze.js'
import { tileCommand } from './commands/tile.js'
import { tilesCommand } from './commands/tiles.js'
import { buildingsCommand } from './commands/buildings.js'
import { docsCommand } from './commands/docs.js'

const program = new Command()
  .name('bitt')
  .description('Bitborough CLI — AI-friendly terminal interface')
  .version('0.0.1')

newCommand(program)
statusCommand(program)
tickCommand(program)
placeCommand(program)
zoneCommand(program)
bulldozeCommand(program)
tileCommand(program)
tilesCommand(program)
buildingsCommand(program)
docsCommand(program)

program.parse()
```

**Step 8: Run tests**

```bash
cd packages/cli && pnpm test
```
Expected: all pass.

**Step 9: Smoke test manually**

```bash
cd packages/cli
npx tsx src/index.ts new --seed 42 --size 64 --file /tmp/test.json
npx tsx src/index.ts status --file /tmp/test.json
npx tsx src/index.ts tiles 30 30 35 35 --file /tmp/test.json
npx tsx src/index.ts place diesel 31 31 --file /tmp/test.json
npx tsx src/index.ts tile 31 31 --file /tmp/test.json
npx tsx src/index.ts tick 12 --file /tmp/test.json
npx tsx src/index.ts status --file /tmp/test.json
```

**Step 10: Commit**

```bash
git add packages/cli/
git commit -m "feat: add @bitborough/cli with AI-friendly terminal interface"
```

---

### Task 6: Wire up `pnpm` workspace and run all tests

**Step 1: Add cli and docs to root workspace**

Check `pnpm-workspace.yaml` (or root `package.json` workspaces field) includes `packages/*`. If it does, no change needed.

**Step 2: Run all tests from root**

```bash
cd /path/to/bitborough && pnpm test
```
Expected: all packages pass.

**Step 3: Final commit if any workspace wiring was needed**

```bash
git add pnpm-workspace.yaml package.json
git commit -m "chore: add docs and cli to workspace"
```
