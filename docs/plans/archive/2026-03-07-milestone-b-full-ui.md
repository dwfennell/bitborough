# Milestone B: Full Game UI — Implementation Plan

> **Status:** DONE — Implemented and shipped.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the game UI with all panels, overlays, minimap, keyboard shortcuts, all building types, file save/export, and audio.

**Architecture:** Extends the MVP's HTML/CSS panel system and canvas rendering. Overlays are drawn as semi-transparent heatmaps on the canvas. Minimap is a separate small canvas. Audio uses Web Audio API with simple synthesized sounds (no asset files needed for MVP audio).

**Tech Stack:** TypeScript, Canvas 2D, Web Audio API, Vitest

**Prerequisite:** Milestone A complete and working

**Design Doc:** `docs/plans/2026-03-07-game-implementation-design.md`

---

## Task 1: Budget panel

**Files:**
- Create: `packages/game/src/ui/BudgetPanel.ts`
- Modify: `packages/game/src/styles/main.css`
- Modify: `packages/game/src/Game.ts` (integrate panel)

**Step 1: Implement BudgetPanel**

```typescript
// packages/game/src/ui/BudgetPanel.ts
import type { GameState } from '@bitborough/core'

export class BudgetPanel {
  private el: HTMLElement
  private visible = false
  private onTaxChange: (rate: number) => void
  private onFundingChange: (service: string, level: number) => void

  constructor(
    container: HTMLElement,
    onTaxChange: (rate: number) => void,
    onFundingChange: (service: string, level: number) => void,
  ) {
    this.onTaxChange = onTaxChange
    this.onFundingChange = onFundingChange

    this.el = document.createElement('div')
    this.el.id = 'budget-panel'
    this.el.className = 'panel hidden'
    this.el.innerHTML = `
      <div class="panel-header">
        <h3>Budget</h3>
        <button class="panel-close">&times;</button>
      </div>
      <div class="panel-body">
        <div class="budget-section">
          <label>Tax Rate: <span id="tax-rate-display">7%</span></label>
          <input type="range" id="tax-rate-slider" min="0" max="20" value="7" step="1">
        </div>
        <div class="budget-section">
          <div class="budget-line"><span>Tax Income</span><span id="budget-income">$0</span></div>
          <div class="budget-line"><span>Maintenance</span><span id="budget-maintenance">$0</span></div>
          <div class="budget-line"><span>Services</span><span id="budget-services">$0</span></div>
          <div class="budget-line total"><span>Balance</span><span id="budget-balance">$0</span></div>
        </div>
        <div class="budget-section">
          <h4>Service Funding</h4>
          <label>Police: <span id="police-funding-display">100%</span></label>
          <input type="range" id="police-funding" min="0" max="100" value="100" step="10">
          <label>Fire: <span id="fire-funding-display">100%</span></label>
          <input type="range" id="fire-funding" min="0" max="100" value="100" step="10">
        </div>
      </div>
    `
    container.appendChild(this.el)

    // Event listeners
    this.el.querySelector('.panel-close')!.addEventListener('click', () => this.toggle())

    const taxSlider = this.el.querySelector('#tax-rate-slider') as HTMLInputElement
    taxSlider.addEventListener('input', () => {
      const rate = parseInt(taxSlider.value, 10)
      this.el.querySelector('#tax-rate-display')!.textContent = `${rate}%`
      this.onTaxChange(rate / 100)
    })

    const policeSlider = this.el.querySelector('#police-funding') as HTMLInputElement
    policeSlider.addEventListener('input', () => {
      const level = parseInt(policeSlider.value, 10)
      this.el.querySelector('#police-funding-display')!.textContent = `${level}%`
      this.onFundingChange('police', level)
    })

    const fireSlider = this.el.querySelector('#fire-funding') as HTMLInputElement
    fireSlider.addEventListener('input', () => {
      const level = parseInt(fireSlider.value, 10)
      this.el.querySelector('#fire-funding-display')!.textContent = `${level}%`
      this.onFundingChange('fire', level)
    })
  }

  toggle(): void {
    this.visible = !this.visible
    this.el.classList.toggle('hidden', !this.visible)
  }

  update(state: GameState): void {
    if (!this.visible) return
    const b = state.budget
    this.el.querySelector('#budget-income')!.textContent = `$${b.taxIncome.toLocaleString()}`
    this.el.querySelector('#budget-maintenance')!.textContent = `-$${b.maintenanceCosts.total.toLocaleString()}`
    this.el.querySelector('#budget-services')!.textContent = `-$${b.serviceCosts.total.toLocaleString()}`
    const balanceEl = this.el.querySelector('#budget-balance')!
    balanceEl.textContent = `$${b.balance.toLocaleString()}`
    balanceEl.className = b.balance >= 0 ? 'positive' : 'negative'
  }
}
```

**Step 2: Add panel styles to main.css**

```css
/* Panels */
.panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(20, 20, 40, 0.95);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  min-width: 280px;
  z-index: 20;
}

.panel.hidden { display: none; }

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.panel-header h3 { margin: 0; font-size: 14px; }
.panel-close { background: none; border: none; color: #e0e0e0; font-size: 18px; cursor: pointer; }

.panel-body { padding: 12px; }

.budget-section { margin-bottom: 12px; }
.budget-section h4 { font-size: 12px; margin-bottom: 8px; opacity: 0.7; }

.budget-line {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 2px 0;
}

.budget-line.total {
  border-top: 1px solid rgba(255,255,255,0.2);
  padding-top: 6px;
  margin-top: 4px;
  font-weight: bold;
}

.positive { color: #4caf50; }
.negative { color: #f44336; }

.budget-section label { display: block; font-size: 12px; margin-bottom: 4px; }
.budget-section input[type="range"] { width: 100%; margin-bottom: 8px; }
```

**Step 3: Integrate into Game class**

Add budget panel initialization, keyboard shortcut `b` to toggle, and `update()` call in the game loop. Also add a "Budget" button to the toolbar or info bar.

**Step 4: Commit**

```
feat(game): add BudgetPanel with tax rate and service funding controls
```

---

## Task 2: Query panel

**Files:**
- Create: `packages/game/src/ui/QueryPanel.ts`
- Modify: `packages/game/src/Game.ts` (integrate)

**Step 1: Implement QueryPanel**

```typescript
// packages/game/src/ui/QueryPanel.ts
import { TileType, ZoneType, Infrastructure, type GameState } from '@bitborough/core'
import type { TileInfo } from '@bitborough/engine'

export class QueryPanel {
  private el: HTMLElement

  constructor(container: HTMLElement) {
    this.el = document.createElement('div')
    this.el.id = 'query-panel'
    this.el.className = 'panel hidden'
    this.el.innerHTML = `
      <div class="panel-header">
        <h3>Tile Info</h3>
      </div>
      <div class="panel-body" id="query-body">
        <p>Click a tile with the Query tool to inspect it.</p>
      </div>
    `
    container.appendChild(this.el)
  }

  show(tile: TileInfo, x: number, y: number, state: GameState): void {
    this.el.classList.remove('hidden')
    const idx = y * state.map.width + x

    const terrainNames = ['Grass', 'Water', 'Dirt', 'Sand', 'Trees']
    const zoneNames = ['None', 'Residential', 'Commercial', 'Industrial']
    const infraParts: string[] = []
    if (tile.infrastructure & Infrastructure.Road) infraParts.push('Road')
    if (tile.infrastructure & Infrastructure.PowerLine) infraParts.push('Power Line')
    if (tile.infrastructure & Infrastructure.Rail) infraParts.push('Rail')

    const body = this.el.querySelector('#query-body')!
    body.innerHTML = `
      <div class="query-line"><span>Position</span><span>(${x}, ${y})</span></div>
      <div class="query-line"><span>Terrain</span><span>${terrainNames[tile.terrain] ?? '?'}</span></div>
      <div class="query-line"><span>Zone</span><span>${zoneNames[tile.zone] ?? 'None'}</span></div>
      <div class="query-line"><span>Infrastructure</span><span>${infraParts.join(', ') || 'None'}</span></div>
      <div class="query-line"><span>Powered</span><span>${tile.powered ? 'Yes' : 'No'}</span></div>
      <div class="query-line"><span>Land Value</span><span>${state.landValues[idx]}</span></div>
    `
  }

  hide(): void {
    this.el.classList.add('hidden')
  }
}
```

**Step 2: Add query panel styles**

```css
.query-line {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 2px 0;
}

#query-panel {
  position: absolute;
  bottom: 48px;
  right: 8px;
  top: auto;
  left: auto;
  transform: none;
}
```

**Step 3: Integrate — when QueryTool is active and clicked, call `queryPanel.show()`**

**Step 4: Commit**

```
feat(game): add QueryPanel showing tile details
```

---

## Task 3: Overlay renderer

**Files:**
- Create: `packages/game/src/render/OverlayRenderer.ts`
- Modify: `packages/game/src/render/Renderer.ts` (add overlay support)
- Modify: `packages/game/src/Game.ts` (add overlay toggle)

**Step 1: Implement OverlayRenderer**

```typescript
// packages/game/src/render/OverlayRenderer.ts
import type { GameState } from '@bitborough/core'
import type { Camera } from './Camera.js'

export type OverlayType = 'power' | 'landValue' | 'zones' | 'none'

export class OverlayRenderer {
  activeOverlay: OverlayType = 'none'

  render(ctx: CanvasRenderingContext2D, state: GameState, camera: Camera): void {
    if (this.activeOverlay === 'none') return

    const bounds = camera.getVisibleBounds()
    const tileSize = camera.tileSize * camera.zoom

    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        if (x < 0 || y < 0 || x >= state.map.width || y >= state.map.height) continue
        const idx = y * state.map.width + x
        const screen = camera.tileToScreen(x, y)

        let color: string | null = null

        switch (this.activeOverlay) {
          case 'power': {
            const powered = state.powerGrid[idx]
            color = powered ? 'rgba(255, 235, 59, 0.4)' : 'rgba(100, 100, 100, 0.3)'
            break
          }
          case 'landValue': {
            const value = state.landValues[idx]! / 255
            // Blue (low) → Green (mid) → Red (high)
            const r = Math.floor(value * 255)
            const g = Math.floor((1 - Math.abs(value - 0.5) * 2) * 255)
            const b = Math.floor((1 - value) * 255)
            color = `rgba(${r}, ${g}, ${b}, 0.4)`
            break
          }
        }

        if (color) {
          ctx.fillStyle = color
          ctx.fillRect(screen.x, screen.y, tileSize, tileSize)
        }
      }
    }
  }

  toggle(overlay: OverlayType): void {
    this.activeOverlay = this.activeOverlay === overlay ? 'none' : overlay
  }
}
```

**Step 2: Integrate into Renderer — call `overlayRenderer.render()` after buildings layer**

**Step 3: Add keyboard shortcuts: `p` = power overlay, `v` = land value overlay**

**Step 4: Commit**

```
feat(game): add overlay renderer for power grid and land value heatmaps
```

---

## Task 4: Minimap

**Files:**
- Create: `packages/game/src/ui/MiniMap.ts`
- Modify: `packages/game/src/styles/main.css`
- Modify: `packages/game/src/Game.ts`

**Step 1: Implement MiniMap**

```typescript
// packages/game/src/ui/MiniMap.ts
import { TileType, ZoneType, type GameState } from '@bitborough/core'
import type { Camera } from '../render/Camera.js'

const MINI_COLORS: Record<TileType, string> = {
  [TileType.Grass]: '#4a8c3f',
  [TileType.Water]: '#3b7dd8',
  [TileType.Dirt]: '#8b7355',
  [TileType.Sand]: '#d4b876',
  [TileType.Trees]: '#2d6b2e',
}

export class MiniMap {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private dirty = true

  constructor(container: HTMLElement, private maxSize: number = 150) {
    this.canvas = document.createElement('canvas')
    this.canvas.id = 'minimap'
    this.ctx = this.canvas.getContext('2d')!
    container.appendChild(this.canvas)
  }

  render(state: GameState, camera: Camera): void {
    const { map } = state
    const scale = this.maxSize / Math.max(map.width, map.height)
    this.canvas.width = Math.floor(map.width * scale)
    this.canvas.height = Math.floor(map.height * scale)

    const ctx = this.ctx

    // Draw terrain
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const idx = y * map.width + x
        const tileType = map.terrain[idx] as TileType
        ctx.fillStyle = MINI_COLORS[tileType] ?? '#4a8c3f'

        // Override with zone color if zoned
        const zone = map.zones[idx] as ZoneType
        if (zone === ZoneType.Residential) ctx.fillStyle = '#4caf50'
        else if (zone === ZoneType.Commercial) ctx.fillStyle = '#2196f3'
        else if (zone === ZoneType.Industrial) ctx.fillStyle = '#ffc107'

        ctx.fillRect(x * scale, y * scale, Math.ceil(scale), Math.ceil(scale))
      }
    }

    // Draw viewport rectangle
    const bounds = camera.getVisibleBounds()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1
    ctx.strokeRect(
      bounds.minX * scale,
      bounds.minY * scale,
      (bounds.maxX - bounds.minX) * scale,
      (bounds.maxY - bounds.minY) * scale,
    )
  }
}
```

**Step 2: Add minimap styles**

```css
#minimap {
  position: absolute;
  bottom: 8px;
  right: 8px;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  z-index: 10;
}
```

**Step 3: Integrate — render minimap every 10 frames (not every frame)**

**Step 4: Commit**

```
feat(game): add MiniMap with terrain view and viewport indicator
```

---

## Task 5: Complete building tools

**Files:**
- Modify: `packages/game/src/ui/Toolbar.ts` (add nuclear, police, fire, park entries)

**Step 1: Add remaining tools to TOOL_ENTRIES array**

Add entries for:
- Nuclear Plant (`power.nuclear`, key `9`)
- Police Station (`service.police`)
- Fire Station (`service.fire`)
- Park (`special.park`)

Group tools in the toolbar: infrastructure tools, zone tools, building tools, utility tools.

**Step 2: Commit**

```
feat(game): add all building tools to toolbar
```

---

## Task 6: Keyboard shortcuts

**Files:**
- Create: `packages/game/src/input/KeyboardHandler.ts`
- Modify: `packages/game/src/Game.ts`

**Step 1: Implement KeyboardHandler**

```typescript
// packages/game/src/input/KeyboardHandler.ts
export interface KeyAction {
  key: string
  action: () => void
}

export class KeyboardHandler {
  private actions: KeyAction[] = []

  constructor() {
    window.addEventListener('keydown', (e) => this.handleKey(e))
  }

  register(key: string, action: () => void): void {
    this.actions.push({ key, action })
  }

  private handleKey(e: KeyboardEvent): void {
    // Ignore when typing in inputs
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return

    const action = this.actions.find(a => a.key === e.key)
    if (action) {
      e.preventDefault()
      action.action()
    }
  }
}
```

**Step 2: Register shortcuts in Game.ts**

Key bindings:
- `b` — toggle budget panel
- `p` — toggle power overlay
- `v` — toggle land value overlay
- `g` — toggle grid lines
- `Escape` — clear active tool
- `Space` — toggle pause
- `1`-`9` — tools (already handled by Toolbar)

**Step 3: Commit**

```
feat(game): add KeyboardHandler with shortcuts for panels, overlays, and tools
```

---

## Task 7: File export/import save

**Files:**
- Modify: `packages/game/src/storage/SaveManager.ts`
- Modify: `packages/game/src/Game.ts` (add export/import UI)

**Step 1: Add export/import methods to SaveManager**

```typescript
exportToFile(): void {
  if (!this.hasSave()) return
  const data = this.storage.getItem(SAVE_KEY)!
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bitborough-save-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

importFromFile(): Promise<SaveFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      const reader = new FileReader()
      reader.onload = () => {
        const save = JSON.parse(reader.result as string) as SaveFile
        resolve(save)
      }
      reader.readAsText(file)
    })
    input.click()
  })
}
```

**Step 2: Add export/import buttons to the new game screen or a menu**

**Step 3: Commit**

```
feat(game): add file export/import for save games
```

---

## Task 8: Audio manager

**Files:**
- Create: `packages/game/src/audio/AudioManager.ts`
- Modify: `packages/game/src/Game.ts` (trigger sounds)

**Step 1: Implement AudioManager**

Uses Web Audio API to synthesize simple sounds — no audio files needed.

```typescript
// packages/game/src/audio/AudioManager.ts
export class AudioManager {
  private ctx: AudioContext | null = null
  private enabled = true

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    return this.ctx
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  playPlace(): void {
    this.playTone(440, 0.05, 'square')
  }

  playBulldoze(): void {
    this.playTone(220, 0.08, 'sawtooth')
  }

  playZone(): void {
    this.playTone(330, 0.04, 'sine')
  }

  playError(): void {
    this.playTone(150, 0.1, 'square')
  }

  private playTone(freq: number, duration: number, type: OscillatorType): void {
    if (!this.enabled) return
    const ctx = this.getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.value = 0.1
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  }
}
```

**Step 2: Integrate — play sounds on tool actions based on Result (success → playPlace/playZone, failure → playError)**

**Step 3: Commit**

```
feat(game): add AudioManager with synthesized placement sounds
```

---

## Summary

| Task | What | Dependencies |
|------|------|-------------|
| 1 | Budget panel | Milestone A |
| 2 | Query panel | Milestone A |
| 3 | Overlay renderer | Milestone A |
| 4 | Minimap | Milestone A |
| 5 | Complete building tools | Milestone A |
| 6 | Keyboard shortcuts | Milestone A |
| 7 | File export/import | Milestone A (Task 8) |
| 8 | Audio manager | Milestone A |

Tasks 1-8 are all independent — they can all be parallelized.
