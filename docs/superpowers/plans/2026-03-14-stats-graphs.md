# Statistics Graphs Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track key city metrics monthly and display them as six time-series charts in a floating Stats panel, with history persisting through save/load.

**Architecture:** `MonthlySnapshot` is added to `@bitborough/core` types and `GameState`. Engine appends a snapshot at the end of each monthly tick (capped at 1200), serializes it, and restores it. `StatsPanel` renders six Canvas 2D charts from `state.history` and is toggled with the `s` key in `Game.ts`.

**Tech Stack:** TypeScript, Canvas 2D API (no charting libraries), Vite monorepo (`@bitborough/core`, `@bitborough/engine`, `@bitborough/game`)

**Key deviation from spec:** The spec says key `g` and version bump 2→3, but `g` is already bound to the Guide panel and version is already 3 (bumped for loans). This plan uses key `s` (Stats) and version 4.

---

## File Structure

| File | Role |
|---|---|
| `packages/core/src/state.ts` | Add `MonthlySnapshot` interface; extend `GameState.history` and `SaveFile.state.history` |
| `packages/core/src/index.ts` | Export `MonthlySnapshot` |
| `packages/engine/src/Engine.ts` | Private `history` field; append snapshot in tick; expose in `getState()`; serialize/restore; bump version 3→4 |
| `packages/engine/src/__tests__/history.test.ts` | New — tests for snapshot collection, cap, and serialization roundtrip |
| `packages/game/src/ui/StatsPanel.ts` | New — Canvas 2D panel, 6 charts, HiDPI, toggle/update API |
| `packages/game/src/Game.ts` | Import StatsPanel; add `s` key action; call `statsPanel.update(state)` each frame |

---

## Chunk 1: Core types + Engine history

### Task 1: Add MonthlySnapshot to core types

**Files:**
- Modify: `packages/core/src/state.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Add `MonthlySnapshot` to `state.ts`**

In `packages/core/src/state.ts`, add after the `GameEvent` type:

```ts
export interface MonthlySnapshot {
  month: number
  year: number
  population: number
  funds: number
  taxIncome: number   // budgetInfo.taxIncome
  expenses: number    // budgetInfo.projectedExpenses
  rDemand: number     // demand.residential, -1..1
  cDemand: number     // demand.commercial, -1..1
  iDemand: number     // demand.industrial, -1..1
}
```

- [ ] **Step 2: Extend `GameState` with `history`**

In `packages/core/src/state.ts`, add to the `GameState` interface:
```ts
history: MonthlySnapshot[]
```

- [ ] **Step 3: Extend `SaveFile.state` with `history`**

In `packages/core/src/state.ts`, add to the `SaveFile.state` type:
```ts
history?: MonthlySnapshot[]   // optional for backwards compatibility; [] if absent
```

- [ ] **Step 4: Export `MonthlySnapshot` from `packages/core/src/index.ts`**

```ts
// Add to the existing export block from './state.js':
  type MonthlySnapshot,
```

- [ ] **Step 5: Build to confirm no type errors**

```bash
cd /Users/dustin/Documents/src/bitborough && npm run build 2>&1 | grep -E 'error|Error|Done'
```
Expected: all packages build cleanly.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/state.ts packages/core/src/index.ts
git commit -m "feat: add MonthlySnapshot type; extend GameState and SaveFile with history"
```

---

### Task 2: Engine history collection, serialization, and restore

**Files:**
- Modify: `packages/engine/src/Engine.ts`
- Create: `packages/engine/src/__tests__/history.test.ts`

- [ ] **Step 1: Write failing tests in `history.test.ts`**

Create `packages/engine/src/__tests__/history.test.ts`:

```ts
import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceMonth, advanceYear } from '../test-helpers.js'

describe('History collection', () => {
  test('history is empty on a fresh engine', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    expect(engine.getState().history).toEqual([])
  })

  test('history gains one snapshot per monthly tick', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    advanceMonth(engine)
    expect(engine.getState().history).toHaveLength(1)
    advanceMonth(engine)
    expect(engine.getState().history).toHaveLength(2)
  })

  test('snapshot contains correct month and year', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    advanceMonth(engine)  // month becomes 2 (starts at 1, increments each month)
    const snap = engine.getState().history[0]!
    expect(snap.month).toBe(2)
    expect(snap.year).toBe(1)
  })

  test('snapshot fields are numbers', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    advanceMonth(engine)
    const snap = engine.getState().history[0]!
    expect(typeof snap.population).toBe('number')
    expect(typeof snap.funds).toBe('number')
    expect(typeof snap.taxIncome).toBe('number')
    expect(typeof snap.expenses).toBe('number')
    expect(typeof snap.rDemand).toBe('number')
    expect(typeof snap.cDemand).toBe('number')
    expect(typeof snap.iDemand).toBe('number')
  })

  test('history is capped at 1200 entries', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    // Advance 101 years = 1212 months — history should cap at 1200
    for (let i = 0; i < 101; i++) advanceYear(engine)
    expect(engine.getState().history.length).toBeLessThanOrEqual(1200)
  })

  test('history persists through serialize/restore', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    advanceMonth(engine)
    advanceMonth(engine)
    const save = engine.serialize()
    expect(save.state.history).toHaveLength(2)
    const restored = Engine.restore(save)
    expect(restored.getState().history).toHaveLength(2)
    expect(restored.getState().history[0]).toEqual(engine.getState().history[0])
  })

  test('old save without history field restores with empty history', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    const save = engine.serialize()
    // Simulate old save: remove history field
    const { history: _removed, ...stateWithout } = save.state as typeof save.state & { history?: unknown }
    const oldSave = { ...save, state: stateWithout }
    const restored = Engine.restore(oldSave as typeof save)
    expect(restored.getState().history).toEqual([])
  })

  test('save version is 4', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    expect(engine.serialize().version).toBe(4)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/dustin/Documents/src/bitborough && npm run test 2>&1 | grep -E 'FAIL|fail|history|pass|Tests'
```
Expected: history tests fail (Engine has no `history` field yet).

- [ ] **Step 3: Add `private history` field to Engine**

In `packages/engine/src/Engine.ts`, in the "Loan system" private fields block, add:
```ts
private history: MonthlySnapshot[] = []
```

Also add `MonthlySnapshot` to the import from `@bitborough/core`:
```ts
import {
  // ... existing imports ...
  type MonthlySnapshot,
  // ...
} from '@bitborough/core'
```

- [ ] **Step 4: Append snapshot at end of monthly tick**

In `packages/engine/src/Engine.ts`, in `tick()`, at the **end** of the monthly block (after step 5 — the negative funds warning event, but before the closing `}`), add:

```ts
// 6. Record monthly snapshot
this.history.push({
  month: this.month,
  year: this.year,
  population: this.population,
  funds: this.funds,
  taxIncome: this.budgetInfo.taxIncome,
  expenses: this.budgetInfo.projectedExpenses,
  rDemand: this.demand.residential,
  cDemand: this.demand.commercial,
  iDemand: this.demand.industrial,
})
if (this.history.length > 1200) this.history.shift()
```

- [ ] **Step 5: Expose `history` in `getState()`**

In `packages/engine/src/Engine.ts`, in `getState()`, add:
```ts
history: this.history,
```

- [ ] **Step 6: Add `history` to `serialize()`**

In `packages/engine/src/Engine.ts`, in the `state` object returned by `serialize()`, add:
```ts
history: this.history,
```

Also bump the version from 3 to 4:
```ts
version: 4,
```

- [ ] **Step 7: Restore `history` in `static restore()`**

In `packages/engine/src/Engine.ts`, in `static restore()`, after the loan restoration lines, add:
```ts
engine.history = save.state.history ?? []
```

- [ ] **Step 8: Run tests to confirm they pass**

```bash
cd /Users/dustin/Documents/src/bitborough && npm run test 2>&1 | grep -E 'FAIL|Tests|pass'
```
Expected: all tests pass including the 7 new history tests.

- [ ] **Step 9: Commit**

```bash
git add packages/engine/src/Engine.ts packages/engine/src/__tests__/history.test.ts
git commit -m "feat: Engine history collection — monthly snapshot, cap 1200, serialize/restore, version 4"
```

---

## Chunk 2: StatsPanel UI + Game.ts wiring

### Task 3: Create StatsPanel with Canvas 2D charts

**Files:**
- Create: `packages/game/src/ui/StatsPanel.ts`

No unit tests — pure canvas rendering, verified by visual inspection in browser.

- [ ] **Step 1: Create `StatsPanel.ts`**

Create `packages/game/src/ui/StatsPanel.ts` with the full implementation:

```ts
import type { GameState, MonthlySnapshot } from '@bitborough/core'

interface ChartDef {
  title: string
  getValue: (s: MonthlySnapshot) => number
  color: string | ((last: number) => string)
  yMin?: number   // fixed min (demand charts use -1)
  yMax?: number   // fixed max (demand charts use 1)
  secondSeries?: { getValue: (s: MonthlySnapshot) => number; color: string }
}

const CHARTS: ChartDef[] = [
  {
    title: 'Population',
    getValue: (s) => s.population,
    color: '#4fc3f7',
  },
  {
    title: 'Treasury',
    getValue: (s) => s.funds,
    color: (last) => (last >= 0 ? '#81c784' : '#e57373'),
  },
  {
    title: 'Monthly Cash Flow',
    getValue: (s) => s.taxIncome,
    color: '#81c784',
    secondSeries: { getValue: (s) => s.expenses, color: '#e57373' },
  },
  {
    title: 'Residential Demand',
    getValue: (s) => s.rDemand,
    color: '#ef9a9a',
    yMin: -1,
    yMax: 1,
  },
  {
    title: 'Commercial Demand',
    getValue: (s) => s.cDemand,
    color: '#80cbc4',
    yMin: -1,
    yMax: 1,
  },
  {
    title: 'Industrial Demand',
    getValue: (s) => s.iDemand,
    color: '#ffcc80',
    yMin: -1,
    yMax: 1,
  },
]

const PANEL_W = 480
const PANEL_H = 400
const COLS = 2
const ROWS = 3
const PAD = 8
const CHART_W = Math.floor((PANEL_W - PAD * (COLS + 1)) / COLS)  // ~220
const CHART_H = Math.floor((PANEL_H - 40 - PAD * (ROWS + 1)) / ROWS)  // ~100 (40px header)

export class StatsPanel {
  private el: HTMLElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private visible = false

  constructor(container: HTMLElement) {
    this.el = document.createElement('div')
    this.el.id = 'stats-panel'
    this.el.className = 'panel hidden'
    this.el.style.cssText = 'position:fixed;top:60px;right:20px;width:480px;background:#1a1a1a;border:1px solid #333;border-radius:6px;z-index:100;'

    this.el.innerHTML = `
      <div class="panel-header">
        <h3>Statistics</h3>
        <button class="panel-close">&times;</button>
      </div>
    `

    this.canvas = document.createElement('canvas')
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = PANEL_W * dpr
    this.canvas.height = PANEL_H * dpr
    this.canvas.style.width = `${PANEL_W}px`
    this.canvas.style.height = `${PANEL_H}px`
    this.canvas.style.display = 'block'
    this.el.appendChild(this.canvas)

    this.ctx = this.canvas.getContext('2d')!
    this.ctx.scale(dpr, dpr)

    container.appendChild(this.el)
    this.el.querySelector('.panel-close')!.addEventListener('click', () => this.toggle())
  }

  toggle(): void {
    this.visible = !this.visible
    this.el.classList.toggle('hidden', !this.visible)
  }

  hide(): void {
    this.visible = false
    this.el.classList.add('hidden')
  }

  get isVisible(): boolean {
    return this.visible
  }

  update(state: GameState): void {
    if (!this.visible) return
    const { ctx } = this
    const history = state.history

    ctx.clearRect(0, 0, PANEL_W, PANEL_H)

    if (history.length === 0) {
      ctx.fillStyle = '#666'
      ctx.font = '13px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      CHARTS.forEach((_, i) => {
        const col = i % COLS
        const row = Math.floor(i / COLS)
        const x = PAD + col * (CHART_W + PAD)
        const y = 40 + PAD + row * (CHART_H + PAD)
        ctx.fillStyle = '#222'
        ctx.fillRect(x, y, CHART_W, CHART_H)
        ctx.fillStyle = '#555'
        ctx.fillText('No data yet', x + CHART_W / 2, y + CHART_H / 2)
      })
      return
    }

    CHARTS.forEach((def, i) => {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const x = PAD + col * (CHART_W + PAD)
      const y = 40 + PAD + row * (CHART_H + PAD)
      this.drawChart(def, history, x, y)
    })
  }

  private drawChart(def: ChartDef, history: MonthlySnapshot[], x: number, y: number): void {
    const { ctx } = this
    const w = CHART_W
    const h = CHART_H

    // Background
    ctx.fillStyle = '#222'
    ctx.fillRect(x, y, w, h)

    // Visible window: last N months (1px per month)
    const maxPoints = w - 2  // leave 1px border
    const slice = history.length > maxPoints ? history.slice(-maxPoints) : history

    const values = slice.map(def.getValue)
    const lastValue = values[values.length - 1] ?? 0

    // Y range
    let yMin = def.yMin ?? 0
    let yMax = def.yMax ?? 0

    if (def.yMin !== undefined && def.yMax !== undefined) {
      // Fixed range (demand charts)
      yMin = def.yMin
      yMax = def.yMax
    } else if (def.secondSeries) {
      // Income/expenses: 0 to max of both series * 1.1
      const secondValues = slice.map(def.secondSeries.getValue)
      const allVals = [...values, ...secondValues]
      yMax = Math.max(...allVals) * 1.1
      if (yMax === 0) yMax = 1
    } else {
      // Population, funds: [0, max * 1.1]
      yMax = Math.max(...values) * 1.1
      if (yMax === 0) yMax = 1
    }

    // Prevent division by zero when all values equal
    if (yMax === yMin) {
      yMax = yMin + (def.yMin !== undefined ? 2 : 1)
    }

    const toScreenY = (v: number) => y + h - 1 - ((v - yMin) / (yMax - yMin)) * (h - 2)

    // Gridlines (3 lines at 25%, 50%, 75%)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 0.5
    for (let t = 1; t <= 3; t++) {
      const gy = y + (h * t) / 4
      ctx.beginPath()
      ctx.moveTo(x, gy)
      ctx.lineTo(x + w, gy)
      ctx.stroke()
    }

    // Zero line for demand charts
    if (def.yMin !== undefined) {
      const zy = toScreenY(0)
      ctx.strokeStyle = '#444'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, zy)
      ctx.lineTo(x + w, zy)
      ctx.stroke()
    }

    // Draw series line
    const drawLine = (vals: number[], color: string) => {
      if (vals.length === 0) return
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      vals.forEach((v, i) => {
        const sx = x + i
        const sy = toScreenY(v)
        if (i === 0) ctx.moveTo(sx, sy)
        else ctx.lineTo(sx, sy)
      })
      ctx.stroke()
    }

    const mainColor = typeof def.color === 'function' ? def.color(lastValue) : def.color
    drawLine(values, mainColor)

    if (def.secondSeries) {
      const secondValues = slice.map(def.secondSeries.getValue)
      drawLine(secondValues, def.secondSeries.color)

      // Legend dots
      ctx.fillStyle = mainColor
      ctx.beginPath()
      ctx.arc(x + 6, y + 8, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = def.secondSeries.color
      ctx.beginPath()
      ctx.arc(x + 6, y + 18, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    // Chart title
    ctx.fillStyle = '#e0e0e0'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(def.title, x + (def.secondSeries ? 16 : 4), y + 4)

    // Current value (top-right)
    ctx.textAlign = 'right'
    const displayVal = Math.round(lastValue).toLocaleString()
    ctx.fillText(displayVal, x + w - 4, y + 4)

    // Min/max labels (bottom corners)
    ctx.font = '9px system-ui'
    ctx.fillStyle = '#888'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillText(Math.round(yMin).toLocaleString(), x + 4, y + h - 2)
    ctx.textAlign = 'right'
    ctx.fillText(Math.round(yMax).toLocaleString(), x + w - 4, y + h - 2)
  }
}
```

- [ ] **Step 2: Build to check for TypeScript errors**

```bash
cd /Users/dustin/Documents/src/bitborough && npm run build 2>&1 | grep -E 'error|Error|Done'
```
Expected: all packages build cleanly.

- [ ] **Step 3: Commit**

```bash
git add packages/game/src/ui/StatsPanel.ts
git commit -m "feat: StatsPanel — canvas 2D chart panel with 6 time-series charts"
```

---

### Task 4: Wire StatsPanel into Game.ts

**Files:**
- Modify: `packages/game/src/Game.ts`

- [ ] **Step 1: Import StatsPanel and add private field**

In `packages/game/src/Game.ts`:

Add import at the top:
```ts
import { StatsPanel } from './ui/StatsPanel.js'
```

Add private field after `overlayLegend`:
```ts
private statsPanel: StatsPanel
```

- [ ] **Step 2: Instantiate StatsPanel in the constructor**

In the constructor, after `this.overlayLegend = new OverlayLegend(uiOverlay)`:
```ts
this.statsPanel = new StatsPanel(uiOverlay)
```

- [ ] **Step 3: Add `s` key action**

In the `this.actions` array, add:
```ts
{ label: 'Stats (S)', key: 's', action: () => this.statsPanel.toggle() },
```

- [ ] **Step 4: Call `statsPanel.update(state)` in the render loop**

In the `if (this.engine)` block where `state` is available and other panels are updated (right after `this.budgetPanel.update(state)`):
```ts
this.statsPanel.update(state)
```

- [ ] **Step 5: Build and run all tests**

```bash
cd /Users/dustin/Documents/src/bitborough && npm run build 2>&1 | grep -E 'error|Error|Done' && npm run test 2>&1 | grep -E 'FAIL|Tests|pass'
```
Expected: build clean, all tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/game/src/Game.ts
git commit -m "feat: wire StatsPanel into Game.ts — s key, frame update"
```
