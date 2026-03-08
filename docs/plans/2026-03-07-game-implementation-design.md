# Game Implementation Design

**Date:** 2026-03-07
**Scope:** Full playable game + remaining engine systems (services, traffic)
**Approach:** Incremental — MVP first, then full UI, then engine extensions

---

## Architecture

The game package (`@bitborough/game`) is a standalone Vite + TypeScript app. No framework — vanilla TypeScript with HTML/CSS for UI panels and Canvas 2D for the game world.

### Data Flow

```
Player Input
    │
    ▼
Tool System ──→ Engine Commands
                     │
                     ▼
               Engine.tick()
                     │
                     ▼
              Engine.getState()
                     │
              ┌──────┴──────┐
              ▼              ▼
          Renderer        UI Panels
          (Canvas)        (HTML/CSS)
```

No data flows backward from renderer to engine. The engine is the single source of truth.

### Key Classes

- **`Game`** — Owns the loop. Calls `engine.tick()` on a timer, calls `renderer.draw()` on `requestAnimationFrame`. Manages startup flow (new game / load game).
- **`Renderer`** — Reads `engine.getState()` snapshots. Orchestrates layer drawing.
- **`Camera`** — Viewport state: position, zoom, screen↔tile coordinate conversion, viewport culling bounds.
- **`TileRenderer`** (interface) — Draws individual tiles. MVP: `ColorTileRenderer` (flat `fillRect`). Future: `SpriteTileRenderer` (SVG/PNG `drawImage`).
- **`InputManager`** — Translates raw browser events (mouse, keyboard) into tool actions and camera commands.
- **`ToolManager`** — Manages active tool. Tools define how clicks/drags map to engine commands.

### File Structure

```
packages/game/
├── index.html              # Vite entry, canvas + UI container
├── vite.config.ts
├── src/
│   ├── main.ts             # Entry: init Game, mount to DOM
│   ├── Game.ts             # Game loop, lifecycle, state management
│   ├── render/
│   │   ├── Renderer.ts     # Layer orchestrator
│   │   ├── Camera.ts       # Viewport, coordinate conversion
│   │   ├── TileRenderer.ts # Interface + ColorTileRenderer
│   │   └── OverlayRenderer.ts  # Power/land value/zone overlays
│   ├── input/
│   │   ├── InputManager.ts # Central event handling
│   │   ├── MouseHandler.ts # Click, drag, scroll
│   │   └── KeyboardHandler.ts  # Hotkeys
│   ├── tools/
│   │   ├── Tool.ts         # Tool interface
│   │   ├── ToolManager.ts  # Active tool state
│   │   ├── RoadTool.ts
│   │   ├── PowerLineTool.ts
│   │   ├── ZoneTool.ts
│   │   ├── BulldozeTool.ts
│   │   ├── BuildingTool.ts
│   │   └── QueryTool.ts
│   ├── ui/
│   │   ├── Toolbar.ts      # Tool selection buttons
│   │   ├── InfoBar.ts      # Population, funds, date, demand
│   │   ├── SpeedControls.ts
│   │   ├── BudgetPanel.ts
│   │   ├── QueryPanel.ts
│   │   └── MiniMap.ts
│   ├── audio/
│   │   └── AudioManager.ts # Web Audio API, SFX triggers
│   ├── storage/
│   │   └── SaveManager.ts  # LocalStorage save/load
│   ├── styles/
│   │   └── main.css        # All game styles
│   └── __tests__/
│       ├── camera.test.ts
│       ├── tools.test.ts
│       └── save-manager.test.ts
```

---

## TileRenderer Interface (Sprite-Swap Path)

```typescript
interface TileRenderer {
  drawTile(ctx: CanvasRenderingContext2D, tileType: TileType,
           screenX: number, screenY: number, tileSize: number): void
  drawInfrastructure(ctx: CanvasRenderingContext2D, infra: number,
           connections: number, screenX: number, screenY: number, tileSize: number): void
  drawBuilding(ctx: CanvasRenderingContext2D, building: Building, def: BuildingDef,
           screenX: number, screenY: number, tileSize: number): void
  drawZoneOverlay(ctx: CanvasRenderingContext2D, zone: ZoneType,
           screenX: number, screenY: number, tileSize: number): void
}
```

`ColorTileRenderer` implements this with `fillRect` + colors:
- Grass → `#4a8c3f`, Water → `#3b7dd8`, Sand → `#d4b876`, Trees → `#2d6b2e`
- Roads → `#555`, Power lines → `#888` with yellow connectors
- Zones → semi-transparent overlay (R=green, C=blue, I=yellow)
- Buildings → colored rectangle matching category, scaled to footprint

`SpriteTileRenderer` (future) loads SVGs/PNGs and draws with `drawImage`. Same interface, one-line swap in Renderer constructor.

---

## Render Layers (back to front)

1. **Terrain** — grass, water, sand, trees
2. **Zone overlay** — semi-transparent color on undeveloped zoned tiles
3. **Infrastructure** — roads, power lines (drawn using connection mask for correct shapes)
4. **Buildings** — placed buildings rendered at correct footprint size
5. **Tool preview** — ghost of what would be placed at cursor position
6. **Data overlay** — power grid, land value heatmap, etc. (toggled)

---

## Game Loop

```typescript
// Two rates, one loop
requestAnimationFrame loop:
  1. delta = now - lastFrame
  2. simAccumulator += delta
  3. While simAccumulator >= simTickInterval:
     a. engine.tick()
     b. simAccumulator -= simTickInterval
  4. state = engine.getState()
  5. renderer.render(state, camera)
  6. ui.update(state)
```

- **Render rate:** Display refresh (60fps via rAF)
- **Sim rate:** Controlled by speed setting (paused=0, slow=1, normal=4, fast=10 ticks/sec)
- Fixed timestep for simulation, variable for rendering

---

## Input Flow

```
Mouse click at (400, 300) screen pixels
  → Camera.screenToTile(400, 300) → tile (12, 8)
  → ToolManager.activeTool: ZoneTool(Residential)
  → engine.placeZone(12, 8, ZoneType.Residential)
  → Result: { ok: true }
```

Mouse drag paints continuously (roads, zones). Right-click or middle-click + drag pans camera. Scroll wheel zooms.

---

## Tool System

```typescript
interface Tool {
  name: string
  cursor: string
  cost?: number
  onTileClick(x: number, y: number, engine: Engine): Result
  onTileDrag?(x: number, y: number, engine: Engine): Result
  getPreviewColor?(): string  // For ghost rendering
}
```

**MVP tools:**
- Road — `engine.placeTile(x, y, Infrastructure.Road)`
- Power line — `engine.placeTile(x, y, Infrastructure.PowerLine)`
- Zone R/C/I — `engine.placeZone(x, y, zone)`
- Bulldoze — `engine.bulldoze(x, y)`
- Query — read-only, shows `engine.getTile(x, y)` in info panel
- Coal plant — `engine.placeBuilding(x, y, 'power.coal')`

**Full game adds:**
- Nuclear plant, police station, fire station, park
- Rail (after traffic system)

---

## UI Panels

All HTML/CSS overlaid on canvas via absolute positioning. Updated from `GameState` snapshots.

- **InfoBar** (top): Population, funds, date (month/year), R/C/I demand bars
- **Toolbar** (left): Tool buttons with icons/labels, active tool highlight
- **SpeedControls** (bottom): Pause/Slow/Normal/Fast buttons
- **BudgetPanel** (toggle): Tax rate slider, income/expense breakdown, service funding sliders
- **QueryPanel** (toggle): Tile details when query tool active (terrain, zone, powered, land value)
- **MiniMap** (bottom-right, milestone B): Small canvas showing full map overview

---

## Persistence (MVP)

Single auto-save to `localStorage` under key `bitborough-save`. Save triggers:
- Every 48 ticks (1 game year)
- On pause
- On page unload (`beforeunload`)

Load on startup if save exists, otherwise show new game screen.

---

## New Game Screen

Simple HTML form shown before canvas:
- Map size dropdown (64, 128, 256)
- Preset dropdown (plains, island)
- Seed input (number, randomized default)
- "Start" button → generates map, creates engine, starts game loop

---

## Milestones

### A: Playable MVP
Vite scaffold, canvas, game loop, camera (pan/zoom), `ColorTileRenderer`, basic tools (road, power line, zone R/C/I, bulldoze, coal plant, query), minimal UI (toolbar, info bar, speed controls), new game screen, LocalStorage auto-save.

### B: Full Game UI
All UI panels (budget, query detail, demand chart), overlays (power grid, land value heatmap, zone), minimap, all building types (nuclear, police, fire, park), keyboard shortcuts, file export/import save, audio (Web Audio SFX).

### C: Engine Services System
Implement `simulation/services.ts` per `engine_services.md` PRD. Crime calculation, police coverage, fire risk, fire events and spread, fire station coverage. Add `crimeLevel`/`fireCoverage`/`activeFireTiles` to GameState. Game UI: place police/fire stations, crime/fire overlays.

### D: Engine Traffic System
Implement `simulation/traffic.ts` per `engine_traffic.md` PRD. Trip generation (R→C, R→I), DFS pathfinding with 30-step limit, traffic density accumulation, congestion effects on land value and demand. Add `trafficDensity` to GameState. Game UI: traffic overlay, road coloring by congestion.

---

## Testing Strategy

- **Camera:** coordinate conversion at various zoom levels, bounds clamping
- **Tools:** verify each tool calls correct engine method, validates results
- **SaveManager:** round-trip save/load to localStorage
- **Integration:** create engine, simulate user interactions, verify state changes
- Rendering is visual — tested via Playwright screenshots (future), not unit tests

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | None (vanilla TS) | Game loop + canvas doesn't benefit from React/Vue overhead |
| Rendering | Canvas 2D | Sufficient for tile-based 2D, simpler than WebGL |
| MVP tiles | Colored rectangles | Decouples gameplay from art pipeline |
| Sprite swap | TileRenderer interface | One-line swap when sprites ready |
| UI panels | HTML/CSS over canvas | Better text rendering, accessibility, styling than canvas UI |
| Persistence | LocalStorage | Simplest, no backend needed |
| Serving | Standalone Vite | Independent of game-manager |
