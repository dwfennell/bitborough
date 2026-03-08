# Technical Architecture

## Project Structure (Monorepo)

The project consists of multiple packages that share code:

```
rcity/
├── packages/
│   ├── core/              # Shared types, utilities, formats
│   │   ├── types/         # Asset, map, entity definitions
│   │   ├── formats/       # Save/load serialization
│   │   └── rendering/     # Tile rendering primitives
│   │
│   ├── game/              # The main game
│   │   ├── src/
│   │   └── index.html
│   │
│   └── tools/             # Asset & content creation webapp
│       ├── src/
│       └── index.html
│
├── assets/                # Generated/curated game assets
│   ├── raw/               # High-res generated images
│   ├── processed/         # Downscaled, ready for packing
│   └── sheets/            # Packed sprite sheets + manifests
│
├── design/                # Game design docs
├── tech-design/           # Technical docs
└── scripts/               # Build, generation, utility scripts
```

### Why Monorepo?
- Shared types prevent drift between game and tools
- Tile rendering code reused in both
- Single version of asset format definitions
- Coordinated releases

See [tooling-webapp.md](./tooling-webapp.md) for the tools package vision.

---

## Game Architecture

## High-Level Structure

```
┌─────────────────────────────────────────────────────────┐
│                      UI Layer                           │
│  (HTML/CSS, Canvas Renderer, Input Handling)            │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                    Game Layer                           │
│  (Game Loop, State Management, Tool System)             │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                 Simulation Layer                        │
│  (Zone Growth, Traffic, Power, Economy, Citizens)       │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                           │
│  (Map Grid, Entities, Save/Load)                        │
└─────────────────────────────────────────────────────────┘
```

## Core Data Structures

### Map Grid
```
- Fixed size tile grid (e.g., 128x128 to start)
- Each tile has:
  - Terrain type (land, water, trees)
  - Zone type (none, R, C, I)
  - Building reference (if developed)
  - Infrastructure flags (road, rail, power line, pipes)
  - Computed values (land value, pollution, crime)
```

### Entity System
For advanced features, move toward ECS (Entity Component System):
```
Entity: unique ID
Components: data bags (Position, Citizen, Building, Vehicle, etc.)
Systems: logic that operates on components
```

This allows scaling to Dwarf Fortress-level simulation without spaghetti.

### Simulation Ticks
```
- Render: 60 FPS (visual smoothness)
- Game tick: 10/sec (animations, movement)
- Sim tick: 1/sec (growth, economy, needs)
- Long tick: 1/min game time (monthly budget, major updates)
```

## Module Breakdown

### Core Modules (Phase 1)
- `map.ts` - Grid storage and queries
- `renderer.ts` - Canvas drawing, camera, viewport
- `input.ts` - Mouse/keyboard, tool selection
- `tools.ts` - Bulldoze, zone, road, query
- `simulation/zones.ts` - Zone growth logic
- `simulation/power.ts` - Power connectivity
- `simulation/traffic.ts` - Basic traffic calculation
- `ui/` - Panels, buttons, budget screen

### Future Modules
- `simulation/citizens.ts` - Agent simulation
- `simulation/economy.ts` - Money flow
- `simulation/pathfinding.ts` - A* for citizens/vehicles
- `events/` - Disasters, random events
- `history/` - Time tracking, graphs

## Save Format
JSON or binary format with:
- Map state
- Entity list
- Simulation state
- Statistics history
- Game settings

Consider chunked saving for large maps.

## Performance Considerations
- Spatial indexing for entity queries
- Web Workers for heavy simulation
- Dirty rectangles for render optimization
- LOD for zoomed-out view
- Batch entity updates

---

## Shared Core Types (packages/core)

Types shared between game and tools:

### Asset Definitions
```typescript
interface TileAsset {
  id: string;                    // e.g., "terrain.grass.01"
  category: AssetCategory;
  sheet: string;                 // Which sprite sheet
  position: { x: number; y: number };
  size: { w: number; h: number };
  animation?: AnimationDef;
  connections?: ConnectionMask;  // For roads, rails, etc.
}

interface AssetManifest {
  sheets: Record<string, SheetDef>;
  assets: Record<string, TileAsset>;
  animations: Record<string, AnimationDef>;
}
```

### Map Format
```typescript
interface GameMap {
  version: number;
  size: { width: number; height: number };
  terrain: Uint8Array;           // Terrain type per tile
  zones: Uint8Array;             // Zone type per tile
  infrastructure: Uint16Array;   // Bitflags per tile
  buildings: Building[];         // Developed structures
  entities: Entity[];            // Citizens, vehicles
}
```

### Generation Metadata
```typescript
interface GenerationRecord {
  assetId: string;
  prompt: string;
  negativePrompt: string;
  seed: number;
  style: string;
  timestamp: string;
  accepted: boolean;
}
```

This enables:
- Tools export assets game can load
- Game saves maps tools can edit
- Full provenance of generated content
