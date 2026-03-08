# PRD: @bitborough/core

**Package:** `packages/core`
**Status:** Approved
**Dependencies:** None

---

## Purpose

Shared vocabulary for the Bitborough project. Defines the types, constants, and serialization formats that all other packages depend on. This is the foundation contract — stable, minimal, and deliberate.

---

## What It Defines

### Tile Types

The fundamental terrain and infrastructure layer.

```typescript
enum TileType {
  Grass,
  Water,
  Dirt,
  Sand,
  Trees,
  Road,
  PowerLine,
  Rail,
}
```

Tiles represent the base layer of each grid cell. A cell has exactly one tile type.

### Zone Types

Player-designated land use.

```typescript
enum ZoneType {
  None,
  Residential,
  Commercial,
  Industrial,
}
```

Zones overlay terrain. A tile can be zoned without being developed (no building yet).

### Infrastructure Flags

Per-tile bitflags for infrastructure that can coexist.

```typescript
// Bitmask — a tile can have multiple infrastructure types
enum Infrastructure {
  None        = 0,
  Road        = 1 << 0,
  PowerLine   = 1 << 1,
  Rail        = 1 << 2,
  Pipe        = 1 << 3,  // future: water system
}
```

### Connection Masks

For infrastructure tiles that auto-connect (roads, rails, power lines). 4-bit mask representing connected edges.

```typescript
// Bit 0 = North, Bit 1 = East, Bit 2 = South, Bit 3 = West
type ConnectionMask = number  // 0-15
```

### Building Definitions

```typescript
interface BuildingDef {
  id: string                    // e.g., "residential.low.01"
  category: BuildingCategory    // residential, commercial, industrial, special
  density: DensityLevel         // low, medium, high
  size: { w: number; h: number } // tile footprint (e.g., 1x1, 2x2, 3x3)
  powerRequired: boolean
  roadRequired: boolean
}

enum BuildingCategory {
  Residential,
  Commercial,
  Industrial,
  Special,       // power plants, services, etc.
}

enum DensityLevel {
  Low,
  Medium,
  High,
}
```

### GameMap

The canonical map data structure. This is what map-gen produces and engine operates on.

```typescript
interface GameMap {
  version: number
  width: number
  height: number
  terrain: Uint8Array        // TileType per cell, row-major
  zones: Uint8Array          // ZoneType per cell
  infrastructure: Uint16Array // Infrastructure bitflags per cell
  connections: Uint8Array    // ConnectionMask per cell (engine-managed)
  elevation: Uint8Array      // 0-255 height per cell
  buildings: Building[]      // Placed structures
  meta: MapMeta
}

interface MapMeta {
  name: string
  seed: number
  preset?: string
  createdAt: string
}

interface Building {
  id: string
  defId: string              // references BuildingDef.id
  x: number
  y: number
  powered: boolean
  density: DensityLevel
}
```

Using typed arrays for the grid layers keeps memory compact and enables efficient serialization.

### Simulation Constants

Default values for simulation parameters. The engine uses these as defaults but allows overriding via config.

```typescript
const DEFAULTS = {
  taxRate: 0.07,
  powerRadius: 6,
  policeRadius: 15,
  fireRadius: 15,
  growthTickInterval: 4,     // sim ticks between growth checks
  trafficDecayRate: 0.1,
}
```

### Save/Load Format

Versioned serialization schema for persisting game state.

```typescript
interface SaveFile {
  version: number
  map: GameMap
  state: {
    funds: number
    population: number
    month: number
    year: number
    taxRate: number
    funding: Record<string, number>
  }
  timestamp: string
}
```

---

## What It Does NOT Do

- No logic, algorithms, or behavior
- No runtime state management
- No browser or Node-specific APIs
- No rendering concepts (sprites, atlas, canvas)
- No dependencies on any other package

---

## Design Constraints

- **Stability:** Changes here ripple to every package. Types should be added carefully and changed rarely.
- **Minimalism:** Only include types that are genuinely shared. If only one package needs a type, it belongs in that package.
- **Portability:** Must work in any JS/TS environment — browser, Node, Worker, Deno.
- **Serializable:** All core types should be JSON-serializable or convertible to/from typed arrays for save/load and future Worker message passing.

---

## Resolved Questions

- **Tile size in pixels:** Rendering concern, not in core. Core defines grid coordinates only.
- **Elevation layer:** Included from the start as `Uint8Array` in `GameMap`. Map-gen populates it, engine/game can ignore until needed.
- **Map metadata:** Included as `MapMeta` in `GameMap` — name, seed, preset, timestamp.
