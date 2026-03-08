# Milestone A: Playable MVP — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** A playable city builder in the browser — canvas rendering, camera, tools, minimal UI, and auto-save.

**Architecture:** Standalone Vite app in `packages/game/`. Vanilla TypeScript, Canvas 2D, HTML/CSS UI panels. `Game` class owns the loop, reads engine state snapshots, delegates to `Renderer` and UI. Tools translate mouse events to engine commands. `ColorTileRenderer` draws flat-colored rectangles (swappable via interface for future sprites).

**Tech Stack:** TypeScript, Vite, Canvas 2D, Vitest, `@bitborough/core`, `@bitborough/engine`, `@bitborough/map-gen`

**Design Doc:** `docs/plans/2026-03-07-game-implementation-design.md`

---

## Task 1: Vite app scaffold

**Files:**
- Create: `packages/game/index.html`
- Create: `packages/game/vite.config.ts`
- Create: `packages/game/src/main.ts`
- Create: `packages/game/src/styles/main.css`
- Modify: `packages/game/package.json`

**Step 1: Update package.json**

Add Vite and engine/map-gen dependencies:

```json
{
  "name": "@bitborough/game",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@bitborough/core": "workspace:*",
    "@bitborough/engine": "workspace:*",
    "@bitborough/map-gen": "workspace:*"
  },
  "devDependencies": {
    "@resvg/resvg-js": "^2.6.0",
    "tsx": "^4.0.0",
    "typescript": "^5.7.0",
    "vite": "^7.0.0",
    "vitest": "^3.0.0"
  }
}
```

**Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
  },
})
```

**Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bitborough</title>
  <link rel="stylesheet" href="/src/styles/main.css">
</head>
<body>
  <div id="app">
    <canvas id="game-canvas"></canvas>
    <div id="ui-overlay"></div>
  </div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

**Step 4: Create src/styles/main.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #1a1a2e;
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #e0e0e0;
}

#app {
  width: 100%;
  height: 100%;
  position: relative;
}

#game-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

#ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

#ui-overlay > * {
  pointer-events: auto;
}
```

**Step 5: Create src/main.ts**

```typescript
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

function resize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

resize()
window.addEventListener('resize', resize)

// Placeholder: draw a test rectangle
ctx.fillStyle = '#4a8c3f'
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = '#fff'
ctx.font = '24px system-ui'
ctx.fillText('Bitborough — canvas working', 20, 40)
```

**Step 6: Install and verify**

Run: `cd packages/game && pnpm install`
Run: `cd packages/game && pnpm dev`
Expected: Browser opens, green canvas with white text visible

**Step 7: Commit**

```
feat(game): scaffold Vite app with canvas
```

---

## Task 2: Camera

**Files:**
- Create: `packages/game/src/render/Camera.ts`
- Create: `packages/game/src/__tests__/camera.test.ts`

**Step 1: Write failing tests**

```typescript
// packages/game/src/__tests__/camera.test.ts
import { describe, test, expect } from 'vitest'
import { Camera } from '../render/Camera.js'

describe('Camera', () => {
  test('screenToTile converts at zoom 1', () => {
    const cam = new Camera(100, 100, 16)
    cam.x = 0
    cam.y = 0
    // Tile at top-left of viewport
    const tile = cam.screenToTile(0, 0)
    expect(tile.x).toBe(0)
    expect(tile.y).toBe(0)
  })

  test('screenToTile accounts for camera offset', () => {
    const cam = new Camera(100, 100, 16)
    cam.x = 5
    cam.y = 3
    // Camera offset shifts the world: screen (0,0) maps to tile (5,3)
    // since camera.x/y is the tile at the top-left of the viewport
    const tile = cam.screenToTile(0, 0)
    expect(tile.x).toBe(5)
    expect(tile.y).toBe(3)
  })

  test('screenToTile accounts for zoom', () => {
    const cam = new Camera(100, 100, 16)
    cam.x = 0
    cam.y = 0
    cam.zoom = 2
    // At zoom 2, tiles are 32px each, so pixel 32 = tile 1
    const tile = cam.screenToTile(32, 0)
    expect(tile.x).toBe(1)
    expect(tile.y).toBe(0)
  })

  test('tileToScreen converts at zoom 1', () => {
    const cam = new Camera(100, 100, 16)
    cam.x = 0
    cam.y = 0
    const screen = cam.tileToScreen(2, 3)
    expect(screen.x).toBe(32)
    expect(screen.y).toBe(48)
  })

  test('tileToScreen accounts for camera offset', () => {
    const cam = new Camera(100, 100, 16)
    cam.x = 2
    cam.y = 3
    // Tile (2,3) is at the camera origin, so screen (0,0)
    const screen = cam.tileToScreen(2, 3)
    expect(screen.x).toBe(0)
    expect(screen.y).toBe(0)
  })

  test('getVisibleBounds returns tile range', () => {
    const cam = new Camera(160, 160, 16)
    cam.x = 0
    cam.y = 0
    const bounds = cam.getVisibleBounds()
    expect(bounds.minX).toBe(0)
    expect(bounds.minY).toBe(0)
    expect(bounds.maxX).toBe(10) // 160 / 16 = 10
    expect(bounds.maxY).toBe(10)
  })

  test('pan moves camera position', () => {
    const cam = new Camera(100, 100, 16)
    cam.x = 5
    cam.y = 5
    cam.pan(3, -2)
    expect(cam.x).toBe(8)
    expect(cam.y).toBe(3)
  })

  test('clamp restricts to map bounds', () => {
    const cam = new Camera(160, 160, 16)
    cam.setMapSize(20, 20)
    cam.x = -5
    cam.y = -5
    cam.clamp()
    expect(cam.x).toBe(0)
    expect(cam.y).toBe(0)
  })

  test('zoom is clamped between 0.5 and 4', () => {
    const cam = new Camera(100, 100, 16)
    cam.zoom = 0.1
    cam.clampZoom()
    expect(cam.zoom).toBe(0.5)
    cam.zoom = 10
    cam.clampZoom()
    expect(cam.zoom).toBe(4)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/game && pnpm test`
Expected: FAIL — `Camera` not found

**Step 3: Implement Camera**

```typescript
// packages/game/src/render/Camera.ts
export class Camera {
  x = 0   // top-left tile X
  y = 0   // top-left tile Y
  zoom = 1
  private mapWidth = Infinity
  private mapHeight = Infinity

  constructor(
    public viewportWidth: number,
    public viewportHeight: number,
    public tileSize: number,
  ) {}

  setMapSize(width: number, height: number): void {
    this.mapWidth = width
    this.mapHeight = height
  }

  setViewport(width: number, height: number): void {
    this.viewportWidth = width
    this.viewportHeight = height
  }

  screenToTile(screenX: number, screenY: number): { x: number; y: number } {
    const effectiveTileSize = this.tileSize * this.zoom
    return {
      x: Math.floor(screenX / effectiveTileSize + this.x),
      y: Math.floor(screenY / effectiveTileSize + this.y),
    }
  }

  tileToScreen(tileX: number, tileY: number): { x: number; y: number } {
    const effectiveTileSize = this.tileSize * this.zoom
    return {
      x: (tileX - this.x) * effectiveTileSize,
      y: (tileY - this.y) * effectiveTileSize,
    }
  }

  getVisibleBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    const effectiveTileSize = this.tileSize * this.zoom
    const tilesWide = Math.ceil(this.viewportWidth / effectiveTileSize)
    const tilesHigh = Math.ceil(this.viewportHeight / effectiveTileSize)
    return {
      minX: Math.floor(this.x),
      minY: Math.floor(this.y),
      maxX: Math.floor(this.x) + tilesWide,
      maxY: Math.floor(this.y) + tilesHigh,
    }
  }

  pan(dx: number, dy: number): void {
    this.x += dx
    this.y += dy
  }

  clamp(): void {
    if (this.x < 0) this.x = 0
    if (this.y < 0) this.y = 0
    const effectiveTileSize = this.tileSize * this.zoom
    const maxX = this.mapWidth - this.viewportWidth / effectiveTileSize
    const maxY = this.mapHeight - this.viewportHeight / effectiveTileSize
    if (this.x > maxX) this.x = Math.max(0, maxX)
    if (this.y > maxY) this.y = Math.max(0, maxY)
  }

  clampZoom(): void {
    if (this.zoom < 0.5) this.zoom = 0.5
    if (this.zoom > 4) this.zoom = 4
  }
}
```

**Step 4: Run tests, verify pass**

Run: `cd packages/game && pnpm test`
Expected: ALL PASS

**Step 5: Commit**

```
feat(game): add Camera with coordinate conversion and viewport culling
```

---

## Task 3: TileRenderer interface + ColorTileRenderer

**Files:**
- Create: `packages/game/src/render/TileRenderer.ts`

**Step 1: Implement TileRenderer interface and ColorTileRenderer**

No tests needed for rendering code — it's purely visual. The interface is the contract.

```typescript
// packages/game/src/render/TileRenderer.ts
import { TileType, ZoneType, Infrastructure, type Building, type BuildingDef } from '@bitborough/core'

export interface TileRenderer {
  drawTile(
    ctx: CanvasRenderingContext2D,
    tileType: TileType,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void
  drawInfrastructure(
    ctx: CanvasRenderingContext2D,
    infra: number,
    connections: number,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void
  drawBuilding(
    ctx: CanvasRenderingContext2D,
    building: Building,
    def: BuildingDef,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void
  drawZoneOverlay(
    ctx: CanvasRenderingContext2D,
    zone: ZoneType,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void
}

const TERRAIN_COLORS: Record<TileType, string> = {
  [TileType.Grass]: '#4a8c3f',
  [TileType.Water]: '#3b7dd8',
  [TileType.Dirt]: '#8b7355',
  [TileType.Sand]: '#d4b876',
  [TileType.Trees]: '#2d6b2e',
}

const ZONE_COLORS: Record<ZoneType, string> = {
  [ZoneType.None]: 'transparent',
  [ZoneType.Residential]: 'rgba(76, 175, 80, 0.3)',
  [ZoneType.Commercial]: 'rgba(33, 150, 243, 0.3)',
  [ZoneType.Industrial]: 'rgba(255, 193, 7, 0.3)',
}

const BUILDING_COLORS: Record<string, string> = {
  'power.coal': '#555',
  'power.nuclear': '#7e57c2',
  'service.police': '#1565c0',
  'service.fire': '#c62828',
  'special.park': '#66bb6a',
}

export class ColorTileRenderer implements TileRenderer {
  drawTile(
    ctx: CanvasRenderingContext2D,
    tileType: TileType,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void {
    ctx.fillStyle = TERRAIN_COLORS[tileType] ?? '#4a8c3f'
    ctx.fillRect(screenX, screenY, tileSize, tileSize)
  }

  drawInfrastructure(
    ctx: CanvasRenderingContext2D,
    infra: number,
    connections: number,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void {
    const cx = screenX + tileSize / 2
    const cy = screenY + tileSize / 2
    const half = tileSize / 2

    if (infra & Infrastructure.Road) {
      ctx.fillStyle = '#555'
      // Center square
      const roadWidth = tileSize * 0.4
      const offset = (tileSize - roadWidth) / 2
      ctx.fillRect(screenX + offset, screenY + offset, roadWidth, roadWidth)

      // Draw connections: N=1, E=2, S=4, W=8
      if (connections & 1) ctx.fillRect(cx - roadWidth / 2, screenY, roadWidth, half)
      if (connections & 2) ctx.fillRect(cx, cy - roadWidth / 2, half, roadWidth)
      if (connections & 4) ctx.fillRect(cx - roadWidth / 2, cy, roadWidth, half)
      if (connections & 8) ctx.fillRect(screenX, cy - roadWidth / 2, half, roadWidth)
    }

    if (infra & Infrastructure.PowerLine) {
      ctx.strokeStyle = '#ffc107'
      ctx.lineWidth = Math.max(1, tileSize * 0.08)

      // Draw power line connections
      if (connections & 1) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, screenY); ctx.stroke() }
      if (connections & 2) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(screenX + tileSize, cy); ctx.stroke() }
      if (connections & 4) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, screenY + tileSize); ctx.stroke() }
      if (connections & 8) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(screenX, cy); ctx.stroke() }

      // Center dot
      ctx.fillStyle = '#ffc107'
      ctx.beginPath()
      ctx.arc(cx, cy, tileSize * 0.1, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawBuilding(
    ctx: CanvasRenderingContext2D,
    building: Building,
    def: BuildingDef,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void {
    const w = def.size.w * tileSize
    const h = def.size.h * tileSize
    const pad = tileSize * 0.1

    ctx.fillStyle = BUILDING_COLORS[building.defId] ?? '#888'
    ctx.fillRect(screenX + pad, screenY + pad, w - pad * 2, h - pad * 2)

    // Label
    if (tileSize >= 12) {
      ctx.fillStyle = '#fff'
      ctx.font = `${Math.max(8, tileSize * 0.3)}px system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const label = building.defId.split('.')[1] ?? ''
      ctx.fillText(label.slice(0, 4), screenX + w / 2, screenY + h / 2)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }

  drawZoneOverlay(
    ctx: CanvasRenderingContext2D,
    zone: ZoneType,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void {
    if (zone === ZoneType.None) return
    ctx.fillStyle = ZONE_COLORS[zone]
    ctx.fillRect(screenX, screenY, tileSize, tileSize)

    // Zone letter
    if (tileSize >= 12) {
      const letters = { [ZoneType.Residential]: 'R', [ZoneType.Commercial]: 'C', [ZoneType.Industrial]: 'I' }
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = `${Math.max(8, tileSize * 0.4)}px system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(letters[zone] ?? '', screenX + tileSize / 2, screenY + tileSize / 2)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }
}
```

**Step 2: Commit**

```
feat(game): add TileRenderer interface and ColorTileRenderer
```

---

## Task 4: Renderer

**Files:**
- Create: `packages/game/src/render/Renderer.ts`

**Step 1: Implement Renderer**

```typescript
// packages/game/src/render/Renderer.ts
import { type GameState, TileType, ZoneType, Infrastructure } from '@bitborough/core'
import { Camera } from './Camera.js'
import { type TileRenderer, ColorTileRenderer } from './TileRenderer.js'
import { BUILDING_DEFS } from '@bitborough/engine'

export class Renderer {
  private tileRenderer: TileRenderer
  private gridLines = true

  constructor(
    private ctx: CanvasRenderingContext2D,
    private camera: Camera,
    tileRenderer?: TileRenderer,
  ) {
    this.tileRenderer = tileRenderer ?? new ColorTileRenderer()
  }

  render(state: GameState): void {
    const { ctx, camera } = this
    const { map } = state

    // Clear
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight)

    const bounds = camera.getVisibleBounds()
    const effectiveTileSize = camera.tileSize * camera.zoom

    // Layer 1: Terrain
    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        if (x < 0 || y < 0 || x >= map.width || y >= map.height) continue
        const idx = y * map.width + x
        const screen = camera.tileToScreen(x, y)
        this.tileRenderer.drawTile(ctx, map.terrain[idx] as TileType, screen.x, screen.y, effectiveTileSize)
      }
    }

    // Layer 2: Zone overlays (only on undeveloped zones)
    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        if (x < 0 || y < 0 || x >= map.width || y >= map.height) continue
        const idx = y * map.width + x
        const zone = map.zones[idx] as ZoneType
        if (zone === ZoneType.None) continue
        const screen = camera.tileToScreen(x, y)
        this.tileRenderer.drawZoneOverlay(ctx, zone, screen.x, screen.y, effectiveTileSize)
      }
    }

    // Layer 3: Infrastructure
    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        if (x < 0 || y < 0 || x >= map.width || y >= map.height) continue
        const idx = y * map.width + x
        const infra = map.infrastructure[idx]!
        if (infra === Infrastructure.None) continue
        const screen = camera.tileToScreen(x, y)
        this.tileRenderer.drawInfrastructure(
          ctx, infra, map.connections[idx]!, screen.x, screen.y, effectiveTileSize,
        )
      }
    }

    // Layer 4: Buildings
    for (const building of map.buildings) {
      const def = BUILDING_DEFS[building.defId]
      if (!def) continue
      // Check if building is in visible bounds
      if (
        building.x + def.size.w < bounds.minX || building.x > bounds.maxX ||
        building.y + def.size.h < bounds.minY || building.y > bounds.maxY
      ) continue
      const screen = camera.tileToScreen(building.x, building.y)
      this.tileRenderer.drawBuilding(ctx, building, def, screen.x, screen.y, effectiveTileSize)
    }

    // Grid lines
    if (this.gridLines && effectiveTileSize >= 8) {
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.lineWidth = 0.5
      for (let y = bounds.minY; y <= bounds.maxY + 1; y++) {
        const screen = camera.tileToScreen(bounds.minX, y)
        ctx.beginPath()
        ctx.moveTo(0, screen.y)
        ctx.lineTo(camera.viewportWidth, screen.y)
        ctx.stroke()
      }
      for (let x = bounds.minX; x <= bounds.maxX + 1; x++) {
        const screen = camera.tileToScreen(x, bounds.minY)
        ctx.beginPath()
        ctx.moveTo(screen.x, 0)
        ctx.lineTo(screen.x, camera.viewportHeight)
        ctx.stroke()
      }
    }
  }

  setGridLines(show: boolean): void {
    this.gridLines = show
  }
}
```

Note: This imports `BUILDING_DEFS` from `@bitborough/engine`. Check that this is exported from the engine package index. If not, add it:

Modify `packages/engine/src/index.ts` to add:
```typescript
export { BUILDING_DEFS } from './buildings-registry.js'
```

**Step 2: Commit**

```
feat(game): add Renderer with layered tile/zone/infra/building drawing
```

---

## Task 5: Tool system

**Files:**
- Create: `packages/game/src/tools/Tool.ts`
- Create: `packages/game/src/tools/ToolManager.ts`
- Create: `packages/game/src/tools/RoadTool.ts`
- Create: `packages/game/src/tools/PowerLineTool.ts`
- Create: `packages/game/src/tools/ZoneTool.ts`
- Create: `packages/game/src/tools/BulldozeTool.ts`
- Create: `packages/game/src/tools/BuildingTool.ts`
- Create: `packages/game/src/tools/QueryTool.ts`
- Create: `packages/game/src/__tests__/tools.test.ts`

**Step 1: Write failing tests**

```typescript
// packages/game/src/__tests__/tools.test.ts
import { describe, test, expect } from 'vitest'
import { Engine } from '@bitborough/engine'
import { createEmptyMap, Infrastructure, ZoneType, TileType } from '@bitborough/core'
import { RoadTool } from '../tools/RoadTool.js'
import { PowerLineTool } from '../tools/PowerLineTool.js'
import { ZoneTool } from '../tools/ZoneTool.js'
import { BulldozeTool } from '../tools/BulldozeTool.js'
import { BuildingTool } from '../tools/BuildingTool.js'
import { QueryTool } from '../tools/QueryTool.js'
import { ToolManager } from '../tools/ToolManager.js'

function createTestEngine(size = 10) {
  const map = createEmptyMap(size, size, {
    name: 'Test', seed: 0, createdAt: '2026-01-01T00:00:00.000Z',
  })
  return Engine.create(map)
}

describe('RoadTool', () => {
  test('places road on grass tile', () => {
    const engine = createTestEngine()
    const tool = new RoadTool()
    const result = tool.onTileClick(5, 5, engine)
    expect(result.ok).toBe(true)
    const tile = engine.getTile(5, 5)
    expect(tile.infrastructure & Infrastructure.Road).toBeTruthy()
  })
})

describe('PowerLineTool', () => {
  test('places power line on grass tile', () => {
    const engine = createTestEngine()
    const tool = new PowerLineTool()
    const result = tool.onTileClick(5, 5, engine)
    expect(result.ok).toBe(true)
    const tile = engine.getTile(5, 5)
    expect(tile.infrastructure & Infrastructure.PowerLine).toBeTruthy()
  })
})

describe('ZoneTool', () => {
  test('places residential zone', () => {
    const engine = createTestEngine()
    const tool = new ZoneTool(ZoneType.Residential)
    const result = tool.onTileClick(5, 5, engine)
    expect(result.ok).toBe(true)
    expect(engine.getTile(5, 5).zone).toBe(ZoneType.Residential)
  })
})

describe('BulldozeTool', () => {
  test('bulldozes road', () => {
    const engine = createTestEngine()
    engine.placeTile(5, 5, Infrastructure.Road)
    const tool = new BulldozeTool()
    const result = tool.onTileClick(5, 5, engine)
    expect(result.ok).toBe(true)
  })
})

describe('BuildingTool', () => {
  test('places coal plant', () => {
    const engine = createTestEngine(20)
    const tool = new BuildingTool('power.coal')
    const result = tool.onTileClick(5, 5, engine)
    expect(result.ok).toBe(true)
  })
})

describe('QueryTool', () => {
  test('returns tile info without modifying state', () => {
    const engine = createTestEngine()
    const tool = new QueryTool()
    const result = tool.onTileClick(5, 5, engine)
    expect(result.ok).toBe(true)
    expect(tool.lastQuery).toBeDefined()
    expect(tool.lastQuery!.terrain).toBe(TileType.Grass)
  })
})

describe('ToolManager', () => {
  test('tracks active tool', () => {
    const manager = new ToolManager()
    const road = new RoadTool()
    manager.setTool(road)
    expect(manager.activeTool).toBe(road)
  })
})
```

**Step 2: Run tests, verify failure**

Run: `cd packages/game && pnpm test`
Expected: FAIL — modules not found

**Step 3: Implement tools**

```typescript
// packages/game/src/tools/Tool.ts
import { type Result, type Engine, type TileInfo } from '@bitborough/engine'

export interface Tool {
  readonly name: string
  readonly cursor: string
  onTileClick(x: number, y: number, engine: Engine): Result
  onTileDrag?(x: number, y: number, engine: Engine): Result
  getPreviewColor?(): string
}
```

```typescript
// packages/game/src/tools/ToolManager.ts
import type { Tool } from './Tool.js'

export class ToolManager {
  activeTool: Tool | null = null

  setTool(tool: Tool): void {
    this.activeTool = tool
  }

  clear(): void {
    this.activeTool = null
  }
}
```

```typescript
// packages/game/src/tools/RoadTool.ts
import type { Tool } from './Tool.js'
import { Infrastructure, type Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'

export class RoadTool implements Tool {
  readonly name = 'Road'
  readonly cursor = 'crosshair'

  onTileClick(x: number, y: number, engine: Engine): Result {
    return engine.placeTile(x, y, Infrastructure.Road)
  }

  onTileDrag(x: number, y: number, engine: Engine): Result {
    return engine.placeTile(x, y, Infrastructure.Road)
  }

  getPreviewColor(): string {
    return 'rgba(85, 85, 85, 0.5)'
  }
}
```

```typescript
// packages/game/src/tools/PowerLineTool.ts
import type { Tool } from './Tool.js'
import { Infrastructure, type Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'

export class PowerLineTool implements Tool {
  readonly name = 'Power Line'
  readonly cursor = 'crosshair'

  onTileClick(x: number, y: number, engine: Engine): Result {
    return engine.placeTile(x, y, Infrastructure.PowerLine)
  }

  onTileDrag(x: number, y: number, engine: Engine): Result {
    return engine.placeTile(x, y, Infrastructure.PowerLine)
  }

  getPreviewColor(): string {
    return 'rgba(255, 193, 7, 0.5)'
  }
}
```

```typescript
// packages/game/src/tools/ZoneTool.ts
import type { Tool } from './Tool.js'
import { ZoneType, type Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'

export class ZoneTool implements Tool {
  readonly name: string
  readonly cursor = 'crosshair'

  constructor(private zone: ZoneType) {
    const names = { [ZoneType.Residential]: 'Residential', [ZoneType.Commercial]: 'Commercial', [ZoneType.Industrial]: 'Industrial' }
    this.name = `Zone ${names[zone] ?? 'Zone'}`
  }

  onTileClick(x: number, y: number, engine: Engine): Result {
    return engine.placeZone(x, y, this.zone)
  }

  onTileDrag(x: number, y: number, engine: Engine): Result {
    return engine.placeZone(x, y, this.zone)
  }

  getPreviewColor(): string {
    const colors = {
      [ZoneType.Residential]: 'rgba(76, 175, 80, 0.4)',
      [ZoneType.Commercial]: 'rgba(33, 150, 243, 0.4)',
      [ZoneType.Industrial]: 'rgba(255, 193, 7, 0.4)',
    }
    return colors[this.zone] ?? 'rgba(128,128,128,0.4)'
  }
}
```

```typescript
// packages/game/src/tools/BulldozeTool.ts
import type { Tool } from './Tool.js'
import type { Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'

export class BulldozeTool implements Tool {
  readonly name = 'Bulldoze'
  readonly cursor = 'crosshair'

  onTileClick(x: number, y: number, engine: Engine): Result {
    return engine.bulldoze(x, y)
  }

  onTileDrag(x: number, y: number, engine: Engine): Result {
    return engine.bulldoze(x, y)
  }

  getPreviewColor(): string {
    return 'rgba(244, 67, 54, 0.4)'
  }
}
```

```typescript
// packages/game/src/tools/BuildingTool.ts
import type { Tool } from './Tool.js'
import type { Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'

export class BuildingTool implements Tool {
  readonly name: string
  readonly cursor = 'crosshair'

  constructor(private defId: string) {
    this.name = defId
  }

  onTileClick(x: number, y: number, engine: Engine): Result {
    return engine.placeBuilding(x, y, this.defId)
  }

  getPreviewColor(): string {
    return 'rgba(128, 128, 128, 0.5)'
  }
}
```

```typescript
// packages/game/src/tools/QueryTool.ts
import type { Tool } from './Tool.js'
import type { Result } from '@bitborough/core'
import { type Engine, type TileInfo } from '@bitborough/engine'

export class QueryTool implements Tool {
  readonly name = 'Query'
  readonly cursor = 'help'
  lastQuery: TileInfo | null = null

  onTileClick(x: number, y: number, engine: Engine): Result {
    this.lastQuery = engine.getTile(x, y)
    return { ok: true }
  }
}
```

**Step 4: Run tests, verify pass**

Run: `cd packages/game && pnpm test`
Expected: ALL PASS

**Step 5: Commit**

```
feat(game): add tool system with road, power line, zone, bulldoze, building, and query tools
```

---

## Task 6: Input manager

**Files:**
- Create: `packages/game/src/input/InputManager.ts`

**Step 1: Implement InputManager**

This wires DOM events to camera panning and tool dispatch. No unit tests — it's DOM event wiring, tested via the running app.

```typescript
// packages/game/src/input/InputManager.ts
import { Camera } from '../render/Camera.js'
import { ToolManager } from '../tools/ToolManager.js'
import type { Engine } from '@bitborough/engine'

export class InputManager {
  private isDragging = false
  private isPanning = false
  private lastMouseX = 0
  private lastMouseY = 0
  private hoverTile: { x: number; y: number } | null = null

  constructor(
    private canvas: HTMLCanvasElement,
    private camera: Camera,
    private toolManager: ToolManager,
    private getEngine: () => Engine | null,
  ) {
    this.bindEvents()
  }

  getHoverTile(): { x: number; y: number } | null {
    return this.hoverTile
  }

  private bindEvents(): void {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
    this.canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false })
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  private onMouseDown(e: MouseEvent): void {
    // Right or middle click = pan
    if (e.button === 1 || e.button === 2) {
      this.isPanning = true
      this.lastMouseX = e.clientX
      this.lastMouseY = e.clientY
      return
    }

    // Left click = tool action
    if (e.button === 0) {
      this.isDragging = true
      this.lastMouseX = e.clientX
      this.lastMouseY = e.clientY
      this.applyTool(e.clientX, e.clientY)
    }
  }

  private onMouseMove(e: MouseEvent): void {
    // Update hover tile
    this.hoverTile = this.camera.screenToTile(e.clientX, e.clientY)

    if (this.isPanning) {
      const dx = (e.clientX - this.lastMouseX) / (this.camera.tileSize * this.camera.zoom)
      const dy = (e.clientY - this.lastMouseY) / (this.camera.tileSize * this.camera.zoom)
      this.camera.pan(-dx, -dy)
      this.camera.clamp()
      this.lastMouseX = e.clientX
      this.lastMouseY = e.clientY
      return
    }

    if (this.isDragging) {
      this.applyTool(e.clientX, e.clientY)
    }
  }

  private onMouseUp(_e: MouseEvent): void {
    this.isDragging = false
    this.isPanning = false
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault()
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1
    this.camera.zoom *= zoomDelta
    this.camera.clampZoom()
    this.camera.clamp()
  }

  private applyTool(screenX: number, screenY: number): void {
    const engine = this.getEngine()
    const tool = this.toolManager.activeTool
    if (!engine || !tool) return

    const tile = this.camera.screenToTile(screenX, screenY)
    if (tile.x < 0 || tile.y < 0) return

    const state = engine.getState()
    if (tile.x >= state.map.width || tile.y >= state.map.height) return

    if (this.isDragging && tool.onTileDrag) {
      tool.onTileDrag(tile.x, tile.y, engine)
    } else {
      tool.onTileClick(tile.x, tile.y, engine)
    }
  }

  destroy(): void {
    // Listeners are bound to the canvas, which will be GC'd
  }
}
```

**Step 2: Commit**

```
feat(game): add InputManager for mouse/keyboard → tool/camera wiring
```

---

## Task 7: UI panels (InfoBar, Toolbar, SpeedControls)

**Files:**
- Create: `packages/game/src/ui/InfoBar.ts`
- Create: `packages/game/src/ui/Toolbar.ts`
- Create: `packages/game/src/ui/SpeedControls.ts`
- Modify: `packages/game/src/styles/main.css`

**Step 1: Implement InfoBar**

```typescript
// packages/game/src/ui/InfoBar.ts
import type { GameState, SimSpeed } from '@bitborough/core'

export class InfoBar {
  private el: HTMLElement

  constructor(container: HTMLElement) {
    this.el = document.createElement('div')
    this.el.id = 'info-bar'
    this.el.innerHTML = `
      <span id="info-population">Pop: 0</span>
      <span id="info-funds">$0</span>
      <span id="info-date">Jan 1900</span>
      <span id="info-demand" class="demand-bars">
        <span class="demand-r" title="Residential">R</span>
        <span class="demand-c" title="Commercial">C</span>
        <span class="demand-i" title="Industrial">I</span>
      </span>
    `
    container.appendChild(this.el)
  }

  update(state: GameState): void {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    this.el.querySelector('#info-population')!.textContent = `Pop: ${state.population.toLocaleString()}`
    this.el.querySelector('#info-funds')!.textContent = `$${state.funds.toLocaleString()}`
    this.el.querySelector('#info-date')!.textContent = `${months[state.time.month - 1]} ${state.time.year}`

    // Demand bars: scale height
    const maxH = 20
    const rBar = this.el.querySelector('.demand-r') as HTMLElement
    const cBar = this.el.querySelector('.demand-c') as HTMLElement
    const iBar = this.el.querySelector('.demand-i') as HTMLElement
    rBar.style.height = `${Math.max(4, Math.abs(state.demand.residential) * maxH)}px`
    rBar.style.opacity = state.demand.residential >= 0 ? '1' : '0.4'
    cBar.style.height = `${Math.max(4, Math.abs(state.demand.commercial) * maxH)}px`
    cBar.style.opacity = state.demand.commercial >= 0 ? '1' : '0.4'
    iBar.style.height = `${Math.max(4, Math.abs(state.demand.industrial) * maxH)}px`
    iBar.style.opacity = state.demand.industrial >= 0 ? '1' : '0.4'
  }
}
```

**Step 2: Implement Toolbar**

```typescript
// packages/game/src/ui/Toolbar.ts
import { ZoneType } from '@bitborough/core'
import { ToolManager } from '../tools/ToolManager.js'
import { RoadTool } from '../tools/RoadTool.js'
import { PowerLineTool } from '../tools/PowerLineTool.js'
import { ZoneTool } from '../tools/ZoneTool.js'
import { BulldozeTool } from '../tools/BulldozeTool.js'
import { BuildingTool } from '../tools/BuildingTool.js'
import { QueryTool } from '../tools/QueryTool.js'
import type { Tool } from '../tools/Tool.js'

interface ToolEntry {
  label: string
  key: string
  factory: () => Tool
}

const TOOL_ENTRIES: ToolEntry[] = [
  { label: 'Road', key: '1', factory: () => new RoadTool() },
  { label: 'Power', key: '2', factory: () => new PowerLineTool() },
  { label: 'Zone R', key: '3', factory: () => new ZoneTool(ZoneType.Residential) },
  { label: 'Zone C', key: '4', factory: () => new ZoneTool(ZoneType.Commercial) },
  { label: 'Zone I', key: '5', factory: () => new ZoneTool(ZoneType.Industrial) },
  { label: 'Coal', key: '6', factory: () => new BuildingTool('power.coal') },
  { label: 'Bulldoze', key: '7', factory: () => new BulldozeTool() },
  { label: 'Query', key: '8', factory: () => new QueryTool() },
]

export class Toolbar {
  private el: HTMLElement
  private buttons: HTMLButtonElement[] = []

  constructor(container: HTMLElement, private toolManager: ToolManager) {
    this.el = document.createElement('div')
    this.el.id = 'toolbar'

    for (const entry of TOOL_ENTRIES) {
      const btn = document.createElement('button')
      btn.textContent = `${entry.key} ${entry.label}`
      btn.dataset.key = entry.key
      btn.addEventListener('click', () => this.selectTool(entry, btn))
      this.el.appendChild(btn)
      this.buttons.push(btn)
    }

    container.appendChild(this.el)

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      const entry = TOOL_ENTRIES.find(t => t.key === e.key)
      if (entry) {
        const btn = this.buttons.find(b => b.dataset.key === e.key)!
        this.selectTool(entry, btn)
      }
    })
  }

  private selectTool(entry: ToolEntry, btn: HTMLButtonElement): void {
    this.buttons.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    this.toolManager.setTool(entry.factory())
  }
}
```

**Step 3: Implement SpeedControls**

```typescript
// packages/game/src/ui/SpeedControls.ts
import { SimSpeed } from '@bitborough/core'

export class SpeedControls {
  private el: HTMLElement
  private buttons: HTMLButtonElement[] = []
  private _speed: SimSpeed = SimSpeed.Normal
  private onChange: (speed: SimSpeed) => void

  constructor(container: HTMLElement, onChange: (speed: SimSpeed) => void) {
    this.onChange = onChange
    this.el = document.createElement('div')
    this.el.id = 'speed-controls'

    const speeds: { label: string; speed: SimSpeed; key: string }[] = [
      { label: '⏸', speed: SimSpeed.Paused, key: ' ' },
      { label: '▶', speed: SimSpeed.Slow, key: '' },
      { label: '▶▶', speed: SimSpeed.Normal, key: '' },
      { label: '▶▶▶', speed: SimSpeed.Fast, key: '' },
    ]

    for (const s of speeds) {
      const btn = document.createElement('button')
      btn.textContent = s.label
      btn.addEventListener('click', () => this.setSpeed(s.speed, btn))
      this.el.appendChild(btn)
      this.buttons.push(btn)
      if (s.speed === this._speed) btn.classList.add('active')
    }

    container.appendChild(this.el)

    // Space = toggle pause
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault()
        if (this._speed === SimSpeed.Paused) {
          this.setSpeed(SimSpeed.Normal, this.buttons[2]!)
        } else {
          this.setSpeed(SimSpeed.Paused, this.buttons[0]!)
        }
      }
    })
  }

  private setSpeed(speed: SimSpeed, btn: HTMLButtonElement): void {
    this._speed = speed
    this.buttons.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    this.onChange(speed)
  }

  get speed(): SimSpeed {
    return this._speed
  }
}
```

**Step 4: Add UI styles to main.css**

Append these styles to `packages/game/src/styles/main.css`:

```css
/* Info Bar */
#info-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 36px;
  background: rgba(20, 20, 40, 0.9);
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 16px;
  font-size: 14px;
  z-index: 10;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

#info-bar span {
  white-space: nowrap;
}

.demand-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 24px;
}

.demand-r, .demand-c, .demand-i {
  width: 14px;
  min-height: 4px;
  text-align: center;
  font-size: 9px;
  font-weight: bold;
  line-height: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.demand-r { background: #4caf50; color: #fff; }
.demand-c { background: #2196f3; color: #fff; }
.demand-i { background: #ffc107; color: #000; }

/* Toolbar */
#toolbar {
  position: absolute;
  top: 44px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
}

#toolbar button {
  background: rgba(20, 20, 40, 0.9);
  color: #e0e0e0;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  min-width: 90px;
}

#toolbar button:hover {
  background: rgba(40, 40, 70, 0.95);
}

#toolbar button.active {
  background: rgba(60, 80, 120, 0.95);
  border-color: #5c9ce6;
}

/* Speed Controls */
#speed-controls {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  z-index: 10;
}

#speed-controls button {
  background: rgba(20, 20, 40, 0.9);
  color: #e0e0e0;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
}

#speed-controls button:hover {
  background: rgba(40, 40, 70, 0.95);
}

#speed-controls button.active {
  background: rgba(60, 80, 120, 0.95);
  border-color: #5c9ce6;
}

/* New Game Screen */
#new-game-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a2e;
  z-index: 100;
}

#new-game-form {
  background: rgba(30, 30, 50, 0.95);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  padding: 32px;
  min-width: 300px;
}

#new-game-form h1 {
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
}

#new-game-form label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
}

#new-game-form select,
#new-game-form input {
  width: 100%;
  margin-top: 4px;
  padding: 6px 8px;
  background: rgba(20, 20, 40, 0.8);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 14px;
}

#new-game-form button {
  width: 100%;
  margin-top: 20px;
  padding: 10px;
  background: #5c9ce6;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

#new-game-form button:hover {
  background: #4a8ad4;
}
```

**Step 5: Commit**

```
feat(game): add UI panels — InfoBar, Toolbar, SpeedControls with styles
```

---

## Task 8: SaveManager

**Files:**
- Create: `packages/game/src/storage/SaveManager.ts`
- Create: `packages/game/src/__tests__/save-manager.test.ts`

**Step 1: Write failing tests**

```typescript
// packages/game/src/__tests__/save-manager.test.ts
import { describe, test, expect, beforeEach } from 'vitest'
import { SaveManager } from '../storage/SaveManager.js'

// Mock localStorage for tests
const mockStorage: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => { mockStorage[key] = value },
  removeItem: (key: string) => { delete mockStorage[key] },
} as Storage

describe('SaveManager', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockStorage)) delete mockStorage[key]
  })

  test('hasSave returns false when no save exists', () => {
    const mgr = new SaveManager(mockLocalStorage)
    expect(mgr.hasSave()).toBe(false)
  })

  test('save and load round-trip', () => {
    const mgr = new SaveManager(mockLocalStorage)
    const data = { version: 1, map: {}, state: {}, timestamp: '' }
    mgr.save(data as any)
    expect(mgr.hasSave()).toBe(true)
    const loaded = mgr.load()
    expect(loaded).toBeDefined()
    expect(loaded!.version).toBe(1)
  })

  test('deleteSave removes save', () => {
    const mgr = new SaveManager(mockLocalStorage)
    mgr.save({ version: 1 } as any)
    expect(mgr.hasSave()).toBe(true)
    mgr.deleteSave()
    expect(mgr.hasSave()).toBe(false)
  })
})
```

**Step 2: Run tests, verify failure**

Run: `cd packages/game && pnpm test`
Expected: FAIL — SaveManager not found

**Step 3: Implement SaveManager**

```typescript
// packages/game/src/storage/SaveManager.ts
import type { SaveFile } from '@bitborough/core'

const SAVE_KEY = 'bitborough-save'

export class SaveManager {
  constructor(private storage: Storage = localStorage) {}

  hasSave(): boolean {
    return this.storage.getItem(SAVE_KEY) !== null
  }

  save(data: SaveFile): void {
    this.storage.setItem(SAVE_KEY, JSON.stringify(data))
  }

  load(): SaveFile | null {
    const raw = this.storage.getItem(SAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SaveFile
  }

  deleteSave(): void {
    this.storage.removeItem(SAVE_KEY)
  }
}
```

**Step 4: Run tests, verify pass**

Run: `cd packages/game && pnpm test`
Expected: ALL PASS

**Step 5: Commit**

```
feat(game): add SaveManager for localStorage persistence
```

---

## Task 9: Game class (main loop + lifecycle)

**Files:**
- Create: `packages/game/src/Game.ts`

**Step 1: Implement Game class**

This is the orchestrator. It wires everything together: engine, renderer, input, UI, save.

```typescript
// packages/game/src/Game.ts
import { SimSpeed, type GameState } from '@bitborough/core'
import { Engine } from '@bitborough/engine'
import { generateMap, type MapGenConfig } from '@bitborough/map-gen'
import { Camera } from './render/Camera.js'
import { Renderer } from './render/Renderer.js'
import { InputManager } from './input/InputManager.js'
import { ToolManager } from './tools/ToolManager.js'
import { InfoBar } from './ui/InfoBar.js'
import { Toolbar } from './ui/Toolbar.js'
import { SpeedControls } from './ui/SpeedControls.js'
import { SaveManager } from './storage/SaveManager.js'

const TICK_INTERVALS: Record<SimSpeed, number> = {
  [SimSpeed.Paused]: 0,
  [SimSpeed.Slow]: 1000,
  [SimSpeed.Normal]: 250,
  [SimSpeed.Fast]: 100,
  [SimSpeed.Turbo]: 25,
}

const TILE_SIZE = 16

export class Game {
  private engine: Engine | null = null
  private camera: Camera
  private renderer: Renderer
  private inputManager: InputManager
  private toolManager: ToolManager
  private infoBar: InfoBar
  private toolbar: Toolbar
  private speedControls: SpeedControls
  private saveManager: SaveManager

  private speed: SimSpeed = SimSpeed.Normal
  private simAccumulator = 0
  private lastFrameTime = 0
  private animationId = 0
  private ticksSinceSave = 0

  constructor(
    private canvas: HTMLCanvasElement,
    private uiOverlay: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d')!

    this.camera = new Camera(canvas.width, canvas.height, TILE_SIZE)
    this.renderer = new Renderer(ctx, this.camera)
    this.toolManager = new ToolManager()
    this.inputManager = new InputManager(canvas, this.camera, this.toolManager, () => this.engine)
    this.saveManager = new SaveManager()

    // UI
    this.infoBar = new InfoBar(uiOverlay)
    this.toolbar = new Toolbar(uiOverlay, this.toolManager)
    this.speedControls = new SpeedControls(uiOverlay, (s) => {
      this.speed = s
    })
  }

  start(): void {
    // Try to load existing save
    if (this.saveManager.hasSave()) {
      const save = this.saveManager.load()
      if (save) {
        this.engine = Engine.restore(save)
        this.camera.setMapSize(save.map.width, save.map.height)
        this.startLoop()
        return
      }
    }

    // Show new game screen
    this.showNewGameScreen()
  }

  private showNewGameScreen(): void {
    const screen = document.createElement('div')
    screen.id = 'new-game-screen'
    screen.innerHTML = `
      <form id="new-game-form">
        <h1>Bitborough</h1>
        <label>
          Map Size
          <select id="map-size">
            <option value="64">64×64 (Small)</option>
            <option value="128" selected>128×128 (Medium)</option>
            <option value="256">256×256 (Large)</option>
          </select>
        </label>
        <label>
          Preset
          <select id="map-preset">
            <option value="plains" selected>Plains</option>
            <option value="island">Island</option>
          </select>
        </label>
        <label>
          Seed
          <input type="number" id="map-seed" value="${Math.floor(Math.random() * 100000)}">
        </label>
        <button type="submit">Start Game</button>
      </form>
    `
    this.uiOverlay.appendChild(screen)

    const form = screen.querySelector('form')!
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const size = parseInt((screen.querySelector('#map-size') as HTMLSelectElement).value, 10) as 64 | 128 | 256
      const preset = (screen.querySelector('#map-preset') as HTMLSelectElement).value as 'plains' | 'island'
      const seed = parseInt((screen.querySelector('#map-seed') as HTMLInputElement).value, 10)

      const config: MapGenConfig = { size, seed, preset }
      const map = generateMap(config)
      this.engine = Engine.create(map)
      this.camera.setMapSize(size, size)
      screen.remove()
      this.startLoop()
    })
  }

  private startLoop(): void {
    this.lastFrameTime = performance.now()
    this.loop(this.lastFrameTime)

    // Auto-save on page unload
    window.addEventListener('beforeunload', () => this.autoSave())
  }

  private loop(now: number): void {
    const delta = now - this.lastFrameTime
    this.lastFrameTime = now

    // Resize canvas if needed
    if (this.canvas.width !== window.innerWidth || this.canvas.height !== window.innerHeight) {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
      this.camera.setViewport(this.canvas.width, this.canvas.height)
    }

    // Sim ticks
    const tickInterval = TICK_INTERVALS[this.speed]
    if (tickInterval > 0 && this.engine) {
      this.simAccumulator += delta
      while (this.simAccumulator >= tickInterval) {
        this.engine.tick()
        this.simAccumulator -= tickInterval
        this.ticksSinceSave++

        // Auto-save every game year (48 ticks)
        if (this.ticksSinceSave >= 48) {
          this.autoSave()
          this.ticksSinceSave = 0
        }
      }
    }

    // Render
    if (this.engine) {
      const state = this.engine.getState()
      this.renderer.render(state)
      this.infoBar.update(state)

      // Draw tool preview at hover position
      this.drawToolPreview(state)
    }

    this.animationId = requestAnimationFrame((t) => this.loop(t))
  }

  private drawToolPreview(state: GameState): void {
    const hover = this.inputManager.getHoverTile()
    const tool = this.toolManager.activeTool
    if (!hover || !tool?.getPreviewColor) return
    if (hover.x < 0 || hover.y < 0 || hover.x >= state.map.width || hover.y >= state.map.height) return

    const ctx = this.canvas.getContext('2d')!
    const screen = this.camera.tileToScreen(hover.x, hover.y)
    const tileSize = this.camera.tileSize * this.camera.zoom
    ctx.fillStyle = tool.getPreviewColor()
    ctx.fillRect(screen.x, screen.y, tileSize, tileSize)
  }

  private autoSave(): void {
    if (!this.engine) return
    this.saveManager.save(this.engine.serialize())
  }
}
```

**Step 2: Commit**

```
feat(game): add Game class with loop, lifecycle, new game screen, and auto-save
```

---

## Task 10: Wire everything together in main.ts

**Files:**
- Modify: `packages/game/src/main.ts`
- Modify: `packages/engine/src/index.ts` (export BUILDING_DEFS)

**Step 1: Export BUILDING_DEFS from engine**

Add to `packages/engine/src/index.ts`:

```typescript
export { BUILDING_DEFS } from './buildings-registry.js'
```

**Step 2: Update main.ts**

```typescript
// packages/game/src/main.ts
import { Game } from './Game.js'

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const uiOverlay = document.getElementById('ui-overlay') as HTMLElement

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const game = new Game(canvas, uiOverlay)
game.start()
```

**Step 3: Verify the app runs**

Run: `cd packages/game && pnpm dev`
Expected: Browser opens, new game form appears, selecting options and clicking "Start" renders the map with tools working.

**Step 4: Run all tests**

Run: `pnpm -r test`
Expected: ALL PASS across all packages

**Step 5: Commit**

```
feat(game): wire Game into main.ts entry point — playable MVP complete
```

---

## Task 11: Update game package index exports

**Files:**
- Modify: `packages/game/src/index.ts`

**Step 1: Update index.ts**

```typescript
// packages/game/src/index.ts — public API
export { Game } from './Game.js'
export { Camera } from './render/Camera.js'
export { type TileRenderer, ColorTileRenderer } from './render/TileRenderer.js'
export { Renderer } from './render/Renderer.js'
export { ToolManager } from './tools/ToolManager.js'
export { type Tool } from './tools/Tool.js'
```

**Step 2: Verify typecheck**

Run: `pnpm -r typecheck`
Expected: PASS

**Step 3: Commit**

```
feat(game): export public API from index
```

---

## Summary

| Task | What | Dependencies |
|------|------|-------------|
| 1 | Vite app scaffold | — |
| 2 | Camera | 1 |
| 3 | TileRenderer interface + ColorTileRenderer | 1 |
| 4 | Renderer | 2, 3 |
| 5 | Tool system | 1 |
| 6 | Input manager | 2, 5 |
| 7 | UI panels (InfoBar, Toolbar, SpeedControls) | 5 |
| 8 | SaveManager | 1 |
| 9 | Game class (main loop) | 4, 6, 7, 8 |
| 10 | Wire main.ts + verify | 9 |
| 11 | Update exports | 10 |

Tasks 2, 3, 5, 8 can be parallelized (all depend only on 1).
Tasks 4, 6, 7 can be partially parallelized.
