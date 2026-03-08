# Tooling Webapp

A companion web application for content creation and game development.

---

## Vision

Start simple: a UI for generating and managing tiles with `img`.
Grow into: a full content creation suite, potentially a modding platform.

The game and the tools that build it can share infrastructure.

---

## Phase 1: Asset Generator

### Core Features
- **Prompt builder** - Form-based UI for constructing `img` prompts
  - Style presets (terrain, building, vehicle, etc.)
  - Consistent negative prompts
  - Seed management
- **Generation queue** - Queue multiple assets, track progress
- **Preview gallery** - View generated assets in grid
- **Curate & organize** - Accept/reject, tag, categorize
- **Export** - Download individuals or packed sheets

### Technical
- Web UI (same stack as game: Vite + TypeScript)
- Calls `img` CLI via local server or Electron wrapper
- Stores asset metadata in JSON/SQLite
- File-based asset storage

### Workflow
```
Define asset → Generate → Preview → Accept/Reject → Iterate → Export to game
```

---

## Phase 2: Tile Editor

### Features
- **Tile preview canvas** - See tiles in context (3x3 grid)
- **Connection testing** - Verify roads/rails connect properly
- **Touch-up tools** - Basic pixel editing for edge fixes
- **Palette extraction** - Pull colors from existing tiles for consistency
- **Seamless tile checker** - Detect seam issues when tiling

### Tile Variants
- Generate base tile
- Create variations (rotate, tint, flip)
- Group variants under single asset ID

---

## Phase 3: Sprite Sheet Builder

### Features
- **Visual packer** - Drag tiles into sheet layout
- **Auto-pack** - Optimal rectangle packing
- **Atlas export** - Generate sheet + JSON manifest
- **Animation grouping** - Arrange animation frames together
- **Preview animations** - Play back in-tool

---

## Phase 4: Map Editor

### Features
- **Paint terrain** - Brush tools for placing tiles
- **Zone painting** - Define R/C/I areas
- **Infrastructure tools** - Draw roads, rails, power
- **Place specials** - Add power plants, services
- **Scenario setup** - Initial conditions (budget, existing city)
- **Export map** - Save as game-loadable format

### Why Separate from Game?
- Faster iteration without full simulation
- Can make "impossible" states for testing
- Useful for creating challenge scenarios

---

## Phase 5: Scenario & Challenge Editor

### Features
- **Victory conditions** - Population targets, budget goals, time limits
- **Scripted events** - Trigger disasters, economic changes
- **Story beats** - Narrative text, choices
- **Challenge parameters** - Starting conditions, restrictions
- **Test play** - Quick-launch scenario in game

---

## Phase 6: Mod Platform (Long-term)

### Features
- **Custom building types** - Define new structures
- **New simulation rules** - Hook into game systems
- **Asset packs** - Bundle tiles + buildings + config
- **Share mods** - Upload/download community content
- **Version compatibility** - Track game version requirements

---

## Architecture Considerations

### Shared Code with Game
```
packages/
├── bitborough-game/        # The game itself
├── bitborough-tools/       # The tooling webapp
└── bitborough-core/        # Shared code
    ├── types/         # Asset definitions, map format
    ├── rendering/     # Tile rendering (reuse in both)
    └── simulation/    # Maybe expose for scenario testing
```

Monorepo structure lets tools and game share:
- Asset type definitions
- Tile rendering code
- Map serialization format
- Sprite sheet loading

### Offline-First
- Works locally without server
- File-based storage (git-friendly)
- Optional: sync to cloud for sharing

### Electron vs Web
- **Web-only:** Simpler, but can't call `img` CLI directly
- **Electron:** Can shell out to `img`, feels like native app
- **Hybrid:** Web UI + local API server for `img` calls

Recommendation: Start with Electron for tight `img` integration.

---

## UI Sketch

```
┌─────────────────────────────────────────────────────────────┐
│  Bitborough Tools                                    [≡] [─] [×] │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│  Assets  │   ┌──────────────────────────────────────────┐   │
│  ├ Terrain│   │                                          │   │
│  ├ Roads  │   │         Asset Preview / Canvas           │   │
│  ├ Buildings  │                                          │   │
│  │ ├ Res  │   │                                          │   │
│  │ ├ Com  │   └──────────────────────────────────────────┘   │
│  │ └ Ind  │                                                  │
│  ├ Vehicles   ┌──────────────────────────────────────────┐   │
│  └ Effects│   │  Prompt: [grass terrain, subtle texture] │   │
│          │   │  Style:  [Terrain ▼]  Seed: [42]         │   │
│  ──────── │   │  [Generate]  [Variations]  [Accept]      │   │
│  Sheets  │   └──────────────────────────────────────────┘   │
│  Maps    │                                                  │
│  Scenarios│                                                  │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## Immediate Value

Even Phase 1 alone provides:
- Faster asset iteration than command-line
- Visual organization of growing asset library
- Consistent generation settings
- History of what prompts worked

Worth building early in parallel with game.

---

## Open Questions

- [ ] Electron vs web + local server?
- [ ] Same repo as game or separate?
- [ ] Priority vs game development (parallel or sequential?)
- [ ] Could this become a standalone product? (generic tile generator)
