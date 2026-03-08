# PRD: @rcity/game

**Package:** `packages/game`
**Status:** Approved
**Dependencies:** `@rcity/core`, `@rcity/engine`, `@rcity/map-gen`

---

## Purpose

The playable city builder. Wires together engine, map generation, rendering, input, and UI into a complete browser-based game. This is what the player sees and interacts with.

---

## Design Philosophy

The game package is a **thin orchestration layer**. It doesn't contain simulation logic (engine) or terrain algorithms (map-gen). Its job is:

1. Translate player input into engine commands
2. Read engine state and render it visually
3. Provide UI for information and controls

If you removed all rendering and UI, the engine would still work. The game package is the presentation layer.

---

## Startup Flow

```
1. Player selects "New Game" or "Load Game"
2. New Game:
   a. Choose map config (size, preset, seed)
   b. MapGenerator.generate(config) → GameMap
   c. Engine.create(map) → Engine
3. Load Game:
   a. Read SaveFile from localStorage/file
   b. Engine.restore(save) → Engine
4. Load sprite sheets and assets
5. Initialize renderer, input, UI
6. Start game loop
```

---

## Core Systems

### Game Loop

Two rates, one loop:

```
requestAnimationFrame loop:
  1. Accumulate time since last frame
  2. While accumulated time >= sim tick interval:
     a. engine.tick()
     b. Decrement accumulated time
  3. state = engine.getState()
  4. renderer.render(state, camera)
  5. ui.update(state)
```

- **Render rate:** Display refresh (typically 60fps)
- **Sim rate:** Controlled by game speed setting (1-10 ticks/sec)
- Fixed timestep for simulation, variable for rendering

### Renderer

Canvas 2D rendering. Reads the `GameState` snapshot each frame.

```
render/
├── Renderer.ts        # Main render orchestrator
├── Camera.ts          # Viewport: position, zoom, screen↔tile coord conversion
├── TileRenderer.ts    # Draws terrain, zones, infrastructure
├── BuildingRenderer.ts # Draws buildings at correct positions
├── OverlayRenderer.ts # Data overlays (power, land value, traffic)
├── SpriteSheet.ts     # Atlas loading and frame lookup
└── Animation.ts       # Animated tiles (water, fire, smoke)
```

**Render layers** (back to front):
1. Terrain (grass, water, sand, dirt, trees)
2. Zones (colored overlay on undeveloped zones)
3. Infrastructure (roads, power lines, rails)
4. Buildings
5. Vehicles/entities (future)
6. Effects (fire, construction, smoke)
7. UI overlays (tool cursor, selection, data viz)

**Viewport culling:** Only draw tiles visible in the camera viewport. The engine doesn't know about this — it's purely a rendering optimization.

### Camera

```typescript
class Camera {
  x: number           // world position (tile coords)
  y: number
  zoom: number         // 0.5x to 4x

  // Convert screen pixel to tile coordinate
  screenToTile(screenX: number, screenY: number): { x: number; y: number }

  // Convert tile coordinate to screen pixel
  tileToScreen(tileX: number, tileY: number): { x: number; y: number }

  // Get visible tile range for culling
  getVisibleBounds(): { minX, minY, maxX, maxY }

  // Movement
  pan(dx: number, dy: number): void
  zoomTo(level: number, focusX?: number, focusY?: number): void
}
```

Camera is purely UI-side. Engine has no viewport concept.

### Input

Translates raw browser events into game actions.

```
input/
├── Input.ts           # Central input manager
├── MouseHandler.ts    # Click, drag, scroll → tool actions, camera pan
├── KeyboardHandler.ts # Hotkeys for tools, speed, panels
└── TouchHandler.ts    # Pinch zoom, touch drag (future)
```

**Input flow:**
```
Mouse click at (400, 300) screen pixels
  → Camera.screenToTile(400, 300) → tile (12, 8)
  → Current tool: ZoneTool(Residential)
  → engine.placeZone(12, 8, ZoneType.Residential)
  → Result: { ok: true }
  → Play placement sound
```

### Tool System

UI-side tool management. Tools define how clicks/drags translate to engine commands.

```typescript
interface Tool {
  name: string
  cursor: string                    // CSS cursor or custom sprite
  onTileClick(x: number, y: number, engine: Engine): Result
  onTileDrag?(x: number, y: number, engine: Engine): Result  // for painting roads, zones
  getPreview?(x: number, y: number): TilePreview              // ghost preview before placing
}
```

**Built-in tools:**
- Bulldoze — `engine.bulldoze(x, y)`
- Zone (R/C/I) — `engine.placeZone(x, y, zone)`
- Road — `engine.placeTile(x, y, TileType.Road)`
- Power line — `engine.placeTile(x, y, TileType.PowerLine)`
- Rail — `engine.placeTile(x, y, TileType.Rail)` (future)
- Buildings — `engine.placeBuilding(x, y, defId)` (power plants, services)
- Query — Read-only, shows `engine.getTile(x, y)` info in a panel

### UI Panels

HTML/CSS overlays positioned over the canvas. Not rendered in canvas.

```
ui/
├── Toolbar.ts         # Tool selection palette
├── InfoBar.ts         # Population, funds, date, speed controls
├── DemandBars.ts      # R/C/I demand indicator
├── BudgetPanel.ts     # Tax and funding controls
├── QueryPanel.ts      # Tile inspection details
├── SpeedControls.ts   # Pause, slow, normal, fast
└── MiniMap.ts         # Overview map (future)
```

### Audio

Sound effects triggered by game events.

```
audio/
├── AudioManager.ts    # Web Audio API wrapper
└── sounds/            # Sound definitions and loading
```

**Sound triggers:**
- Tool placement (per tool type)
- Bulldoze
- Building appears (zone develops)
- Budget warning (low funds)
- Disaster events (future)
- Ambient city noise (scales with population, future)

---

## Asset Loading

The game needs to load sprite sheets and map them to tile types.

```typescript
// Asset manifest maps tile types to sprite sheet positions
interface AssetManifest {
  sheets: Record<string, {
    url: string
    tileSize: number
  }>
  tiles: Record<string, {
    sheet: string
    x: number
    y: number
    variants?: number        // number of visual variants
    animation?: {
      frames: number
      frameTime: number      // ms per frame
    }
  }>
}
```

Assets are loaded at startup. The manifest connects engine tile types to visual sprites. This is the bridge between the game-manager's asset library and the game.

---

## Data Flow Summary

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

---

## Design Constraints

- **No simulation logic.** The game package never calculates power grids, land values, or growth. It calls engine methods and reads results.
- **Browser-only.** Unlike core, engine, and map-gen, this package can freely use DOM, Canvas, Web Audio, localStorage.
- **Responsive.** Must maintain 60fps rendering even if simulation ticks are slower.
- **Keyboard accessible.** All tools and panels should have keyboard shortcuts.

---

## Testing Strategy

Game package tests are primarily integration and visual tests, since unit logic lives in engine and map-gen.

- **Integration tests:** Create engine with test map, simulate user interactions, verify engine state changes
- **Renderer tests:** Snapshot-based or Playwright visual regression (future)
- **Input tests:** Verify screen-to-tile coordinate conversion, tool dispatch
- **Camera tests:** Pan, zoom, bounds clamping, coordinate conversion math

```typescript
// Camera coordinate conversion
test('screenToTile converts correctly at zoom 1', () => {
  const camera = new Camera({ x: 0, y: 0, zoom: 1, tileSize: 64 })
  const tile = camera.screenToTile(128, 192)
  expect(tile).toEqual({ x: 2, y: 3 })
})

// Tool dispatch
test('zone tool calls engine.placeZone', () => {
  const engine = Engine.create(createTestMap(10, 10))
  const tool = new ZoneTool(ZoneType.Residential)
  const result = tool.onTileClick(5, 5, engine)
  expect(result.ok).toBe(true)
  expect(engine.getTile(5, 5).zone).toBe(ZoneType.Residential)
})
```

---

## Future Considerations

- **Web Worker rendering:** If the main thread gets busy, consider OffscreenCanvas in a Worker for rendering.
- **WebGL migration:** If Canvas 2D can't keep up with large maps + effects, migrate renderer to WebGL/PixiJS. The renderer module is isolated, so this is a swap, not a rewrite.
- **Mobile support:** Touch input, responsive UI, performance tuning for mobile GPUs.
- **Multiplayer viewer:** Read-only mode where another client watches a shared engine state. Enabled by the clean state snapshot model.

---

## Resolved Questions

- **Asset loading:** Bundled with Vite. Sprite sheets and manifests in `packages/game/public/assets/`. Game works standalone without the Go server. Game-manager exports approved assets into this directory as a build step.
- **New game UI:** Separate screen. Menu screen (new game config, load game) → Game screen (canvas + UI panels). No canvas rendering until the player starts a game.
- **Mini-map:** Separate small canvas element. Renders at different scale and frequency than main canvas. Positioned via CSS. Updates only when map changes, not every frame.
- **Multiple save slots:** No. Single save to start. Save/load is Milestone 8. Single `localStorage` key is simplest. Easy to add slots later without format changes.
- **Connection rendering:** Engine tracks connection masks in `GameMap.connections`. Game reads the mask value (0-15) and selects the corresponding sprite variant. No connection logic in the game package.
