# CLI & Docs Unification Design

> **Status:** DONE — Implemented and shipped.

**Date:** 2026-03-11

## Goal

Two things at once:
1. A `packages/cli` that an AI agent can use to play Bitborough through the terminal
2. A `packages/docs` that is the single source of truth for game documentation, consumed by both the CLI and the web game

A secondary goal: fix the constants duplication between `BUILDING_DEFS` and `COSTS`/`MAINTENANCE`, so the building reference is always derived from real values.

## Package Structure

```
core ← engine ← docs ← cli
              ↖ game ↗
```

`docs` depends on `core` + `engine`. Both `game` and `cli` import from `docs`. No circular deps.

## packages/docs

Exports two things:

**1. Narrative sections** — markdown body, no HTML (that's the consumer's job)

```typescript
export interface DocSection {
  id: string
  title: string
  body: string  // markdown, no HTML tags
}

export const SECTIONS: DocSection[]
```

Game renders `body` as markdown→HTML. CLI returns it as plain text or JSON.

**2. Derived building reference**

```typescript
export interface BuildingRow {
  id: string
  name: string
  cost: number
  maintenanceCost: number
  powerCapacity?: number   // generators only
  population?: number
  jobs?: number
  pollutionRadius?: number
  pollutionAmount?: number
  notes: string
}

export function getBuildingReference(): BuildingRow[]
```

Computed from `BUILDING_DEFS` + `COSTS` + `MAINTENANCE` + `POWER` at import time. Never stale.

The existing `packages/game/src/ui/docs/` files are replaced by imports from `@bitborough/docs`. The game's `DocsPanel` renders sections and the building reference table from this shared data.

## Constants Cleanup

`BUILDING_DEFS` currently hardcodes `cost` and `maintenanceCost` that duplicate `COSTS`/`MAINTENANCE` in core. Fix: make `BUILDING_DEFS` reference core constants:

```typescript
'power.diesel': {
  cost: COSTS.dieselGenerator,          // was: 300
  maintenanceCost: MAINTENANCE.dieselGenerator,  // was: 15
  ...
}
```

`COSTS` and `MAINTENANCE` stay in `core` (game UI needs them to display prices in the toolbar without importing engine).

## packages/cli

A Node.js CLI. State persisted to `game.json` (configurable via `--file`). All output is JSON by default — clean for AI consumption.

### Commands

```
bitt new [--seed N] [--size 64|128|256]
bitt status
bitt tick [N]

bitt place road <x> <y>
bitt place powerline <x> <y>
bitt place diesel <x> <y>
bitt place coal <x> <y>
bitt place nuclear <x> <y>
bitt place pave <x> <y>
bitt place transit <x> <y>
bitt place police <x> <y>
bitt place fire <x> <y>
bitt place park <x> <y>
bitt zone R|C|I <x> <y>
bitt bulldoze <x> <y>

bitt tile <x> <y>
bitt tiles <x1> <y1> <x2> <y2>
bitt buildings
bitt docs [section-id]
```

### Output format

Every command returns JSON:

```json
// bitt status
{
  "month": "Mar 1904", "population": 280, "funds": 19200,
  "monthlyIncome": 45, "demand": { "R": 0.7, "C": 0.3, "I": 0.4 }
}

// bitt tile 10 92
{
  "x": 10, "y": 92, "terrain": "grass", "zone": "R",
  "infra": ["road", "pavedRoad"], "building": { "id": "res.low", "state": "active", "population": 10 },
  "powered": true, "hasRoadAccess": true
}

// bitt tiles 8 88 12 90
{
  "tiles": [
    { "x": 8, "y": 88, "terrain": "grass", "zone": null, "infra": [], "powered": false },
    { "x": 9, "y": 88, "terrain": "water", "zone": null, "infra": [], "powered": false },
    ...
  ],
  "grid": ". ~ . . .\n. ~ R R R\n. . R R R"
}

// bitt place road 10 88
{ "ok": true, "cost": 10, "fundsRemaining": 19190 }

// bitt place road 10 88 (on water)
{ "ok": false, "reason": "invalid_tile" }
```

### Engine gaps to fill

`getTile()` currently returns terrain/infra/zone/building but not `powered` or `hasRoadAccess`. Both need to be added to `TileInfo` (or computed in a new engine method) for the CLI's `tile` and `tiles` commands to be useful.

## Migration

1. Add `packages/docs` — port content from game's `ui/docs/*.ts` to markdown, add `getBuildingReference()`
2. Clean up `BUILDING_DEFS` to reference `COSTS`/`MAINTENANCE`
3. Update `packages/game` to import from `@bitborough/docs` instead of its own `ui/docs/`
4. Add `packages/cli` with all commands above
5. Extend `Engine.getTile()` to include `powered` and `hasRoadAccess`
