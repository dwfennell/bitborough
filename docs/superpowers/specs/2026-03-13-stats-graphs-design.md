# Statistics Graphs — Design Spec

**Date:** 2026-03-13
**Milestone:** 8 (Polish & Save/Load) — last remaining item (statistics graphs)

---

## Overview

Track key city metrics monthly and display them as time-series charts in a dedicated Stats panel. History persists in the save file so graphs survive save/load cycles.

---

## 1. Data Model

### 1a. MonthlySnapshot

Add to `@bitborough/core/src/state.ts`:

```ts
export interface MonthlySnapshot {
  month: number
  year: number
  population: number
  funds: number
  taxIncome: number   // budgetInfo.taxIncome for that month (matches BudgetInfo field name)
  expenses: number    // budgetInfo.projectedExpenses (maintenance + services + loanRepayment)
  rDemand: number     // demand.residential, range -1..1
  cDemand: number     // demand.commercial
  iDemand: number     // demand.industrial
}
```

### 1b. GameState extension

```ts
history: MonthlySnapshot[]
```

### 1c. SaveFile extension

```ts
// in SaveFile.state:
history?: MonthlySnapshot[]   // optional for backwards compatibility; treated as [] on load if absent
```

---

## 2. History Collection

In `Engine.tick()`, at the **end** of each monthly tick (after budget, loans, and zone updates have run), append a snapshot:

```ts
const snapshot: MonthlySnapshot = {
  month: this.month,
  year: this.year,
  population: this.population,
  funds: this.funds,
  taxIncome: this.budgetInfo.taxIncome,
  expenses: this.budgetInfo.projectedExpenses,
  rDemand: this.demand.residential,
  cDemand: this.demand.commercial,
  iDemand: this.demand.industrial,
}
this.history.push(snapshot)
if (this.history.length > 1200) this.history.shift()  // cap at 100 years
```

`Engine` holds `private history: MonthlySnapshot[] = []`. On construction from a save file, `history` is restored from `SaveFile.state.history ?? []`.

`getState()` exposes `history: this.history` (reference, not copy — consumers must not mutate).

---

## 3. Stats Panel UI

### 3a. Layout

A new `StatsPanel` class in `packages/game/src/ui/StatsPanel.ts`. Toggled by keyboard shortcut `g` (added to `Game.ts` actions). Panel is a floating overlay (same pattern as BudgetPanel) with a close button.

Panel contains a single `<canvas>` element that StatsPanel draws into. The panel is 480×400px logical size. Six charts are laid out in a 2-column × 3-row grid (each chart ~220×110px with 8px padding).

**HiDPI / devicePixelRatio:** apply the standard pattern so charts are crisp on retina screens:
```ts
const dpr = window.devicePixelRatio || 1
canvas.width = 480 * dpr
canvas.height = 400 * dpr
canvas.style.width = '480px'
canvas.style.height = '400px'
ctx.scale(dpr, dpr)
```
All drawing coordinates remain in logical pixels (0–480, 0–400).

### 3b. Charts

| # | Title | Series |
|---|---|---|
| 1 | Population | `population` |
| 2 | Treasury | `funds` |
| 3 | Monthly Cash Flow | `taxIncome` (green), `expenses` (red) |
| 4 | Residential Demand | `rDemand` |
| 5 | Commercial Demand | `cDemand` |
| 6 | Industrial Demand | `iDemand` |

Demand charts have a horizontal zero-line. Income/expenses chart draws two lines on the same axes with a legend dot.

### 3c. Rendering

Drawn with Canvas 2D — no third-party library. On each `update(state)` call (only when visible), StatsPanel:

1. Clears the canvas
2. For each of the 6 charts:
   - Draws a labelled background rect
   - Computes Y range from `[min, max]` of the series over the visible window
   - Draws gridlines (3–4 horizontal lines)
   - Plots the time-series as a `lineTo` path
   - Draws axis labels (title, current value, min/max)

**X-axis window:** always shows the last N snapshots where N fits in the chart width (1 px per month at 220px = 220 months ≈ 18 years; all history if shorter). No interactive pan/zoom in this iteration.

**Y-axis:** auto-scaled per chart per update. Demand charts always show `-1..1`. Population and funds use `[0, max * 1.1]`. Income/expenses use `[0, max(taxIncome, expenses) * 1.1]`.

**Funds line color:** determined per-render based on the current (last) value in the series — `#81c784` (green) if `funds >= 0`, `#e57373` (red) if negative. The entire line uses the same color (not per-segment).

**Empty / single-point history:** if `history.length === 0`, render a centered "No data yet" message in each chart area. If `history.length === 1` or all values in a series are equal (zero Y range), use a default Y range of `[0, 1]` (or `[-1, 1]` for demand) to prevent division by zero in coordinate mapping.

### 3d. Styling

Consistent with existing UI (dark panel background `#1a1a1a`, text `#e0e0e0`, panel border `#333`). Series colors:
- Population: `#4fc3f7` (light blue)
- Funds: `#81c784` (green) or `#e57373` (red) when negative
- Income: `#81c784`
- Expenses: `#e57373`
- R Demand: `#ef9a9a`
- C Demand: `#80cbc4`
- I Demand: `#ffcc80`

---

## 4. Save/Load Integration

`MonthlySnapshot[]` is a plain array of plain objects — JSON-serializable without special handling. However, `Engine.serialize()` constructs its return value explicitly (not via `JSON.stringify(this)`), so `history` must be added explicitly:

**In `Engine.serialize()`:**
```ts
state: {
  // ... existing fields ...
  history: this.history,
}
```

**In `Engine.restore(save)`:**
```ts
engine.history = save.state.history ?? []
```
This follows the existing pattern (e.g. `engine.funding = save.state.funding ?? defaults`).

`SaveFile.version` should be bumped (2 → 3) to signal the schema change. Old saves without `history` are handled gracefully by `?? []`.

---

## 5. Affected Files

| File | Change |
|---|---|
| `packages/core/src/state.ts` | Add `MonthlySnapshot`; extend `GameState` with `history`; extend `SaveFile.state` with `history` |
| `packages/core/src/index.ts` | Export `MonthlySnapshot` |
| `packages/engine/src/Engine.ts` | `private history`, append snapshot each month, expose in `getState()`, add `history` to `serialize()` return, restore in `static restore()`, bump save version 2→3 |
| `packages/game/src/ui/StatsPanel.ts` | New file — Canvas 2D chart panel |
| `packages/game/src/Game.ts` | Instantiate StatsPanel, wire `g` key, call `statsPanel.update(state)` each frame |
| `packages/game/src/storage/SaveManager.ts` | No change — `history` flows through automatically once added to `SaveFile` type |

---

## 6. Out of Scope

- Interactive pan/zoom on charts
- Exporting charts as images
- Configurable time window
- Overlaying multiple series on one chart (beyond the income/expenses combo chart)
