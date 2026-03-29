# Detailed In-Game Docs Implementation Plan

> **Status:** DONE — Implemented and shipped.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the Game Guide with super-detailed docs including exact formulas, add a Building Reference with SVG sprites, and split docs into separate files.

**Architecture:** Extract each doc section from the monolithic `DocsPanel.ts` into individual files under `ui/docs/`. A master `index.ts` exports the ordered array. DocsPanel imports from there. New CSS styles support formula callout boxes and the building reference table with inline images.

**Tech Stack:** TypeScript, HTML (inline in template literals), CSS

---

### Task 1: Create docs directory and types file

**Files:**
- Create: `packages/game/src/ui/docs/types.ts`

**Step 1: Create the shared type**

```ts
export interface DocSection {
  title: string
  content: string
}
```

**Step 2: Commit**

```bash
git add packages/game/src/ui/docs/types.ts
git commit -m "refactor(docs): extract DocSection type to ui/docs/types.ts"
```

---

### Task 2: Create unchanged section files (Getting Started, Controls, Tools, Overlays)

**Files:**
- Create: `packages/game/src/ui/docs/getting-started.ts`
- Create: `packages/game/src/ui/docs/controls.ts`
- Create: `packages/game/src/ui/docs/tools.ts`
- Create: `packages/game/src/ui/docs/overlays.ts`

**Step 1: Create each file**

Each file exports a `DocSection`. Move existing content verbatim from `DocsPanel.ts` lines 7-71. One change: in `tools.ts`, add "(free)" after each zone line to note zones cost nothing to place.

Example pattern for each file:

```ts
import type { DocSection } from './types.js'

export const gettingStarted: DocSection = {
  title: 'Getting Started',
  content: `
    <!-- existing content verbatim from DocsPanel.ts -->
  `,
}
```

For `tools.ts`, update zones:
```
<tr><td><strong>3</strong></td><td>Residential Zone (free)</td></tr>
<tr><td><strong>4</strong></td><td>Commercial Zone (free)</td></tr>
<tr><td><strong>5</strong></td><td>Industrial Zone (free)</td></tr>
```

**Step 2: Commit**

```bash
git add packages/game/src/ui/docs/getting-started.ts packages/game/src/ui/docs/controls.ts packages/game/src/ui/docs/tools.ts packages/game/src/ui/docs/overlays.ts
git commit -m "refactor(docs): extract unchanged sections to individual files"
```

---

### Task 3: Create expanded Power section

**Files:**
- Create: `packages/game/src/ui/docs/power.ts`

**Step 1: Write expanded content**

Keep existing prose. Add efficiency comparison and pollution tradeoff. Source values from `constants.ts` (COSTS, MAINTENANCE, POWER).

```ts
import type { DocSection } from './types.js'

export const power: DocSection = {
  title: 'Power',
  content: `
    <p>Buildings and zones need electricity to function. Power propagates from plants through adjacent powered tiles — including roads and zoned tiles, so you often don't need power lines within a developed area.</p>

    <p><strong>Diesel Generator</strong> — $300, $15/mo, powers 50 tiles. Small and polluting, but great for getting started.</p>
    <p><strong>Coal Plant</strong> — $2,000, $60/mo, powers 700 tiles. Workhorse mid-game plant. Pollutes heavily.</p>
    <p><strong>Nuclear Plant</strong> — $5,000, $100/mo, powers 2,000 tiles. Most efficient per tile. No pollution.</p>
    <p><strong>Power Lines</strong> — $5 each, $0.50/mo maintenance. Bridge gaps between your plant and developed areas.</p>

    <p><strong>Efficiency comparison:</strong></p>
    <table>
      <tr><td></td><td><strong>Cost/tile</strong></td><td><strong>Maint./tile</strong></td><td><strong>Pollution</strong></td></tr>
      <tr><td>Diesel</td><td>$6.00</td><td>$0.30/mo</td><td>Radius 2</td></tr>
      <tr><td>Coal</td><td>$2.86</td><td>$0.09/mo</td><td>Radius 6</td></tr>
      <tr><td>Nuclear</td><td>$2.50</td><td>$0.05/mo</td><td>None</td></tr>
    </table>
  `,
}
```

**Step 2: Commit**

```bash
git add packages/game/src/ui/docs/power.ts
git commit -m "docs(guide): expand power section with efficiency comparison"
```

---

### Task 4: Create expanded Zones & Development section

**Files:**
- Create: `packages/game/src/ui/docs/zones.ts`

**Step 1: Write expanded content**

Source: `zones.ts` (probability=0.12, road range=3), `buildings-registry.ts` (pop/jobs values).

```ts
import type { DocSection } from './types.js'

export const zones: DocSection = {
  title: 'Zones & Development',
  content: `
    <p>Zones are where your city grows. Place them and buildings appear automatically when conditions are met.</p>
    <p><strong>Requirements for development:</strong></p>
    <ul>
      <li>Zone must be <em>powered</em></li>
      <li>Zone must be within <em>3 tiles of a road</em> (Manhattan distance)</li>
      <li>Positive <em>demand</em> for that zone type</li>
    </ul>
    <p>Each month, every eligible empty zone tile rolls for development:</p>
    <p class="docs-formula"><code>Development Chance = 12% × Zone Demand</code> — per tile per month</p>
    <p><strong>Residential</strong> — Where people live. Each building adds 10 population. Strong base demand (0.7).</p>
    <p><strong>Commercial</strong> — Shops and offices. Each building provides 5 jobs. Demand scales with population.</p>
    <p><strong>Industrial</strong> — Factories and workshops. Each building provides 10 jobs. Steady base demand (0.4), less sensitive to taxes. Generates pollution.</p>
    <p>Watch the <strong>R/C/I demand bars</strong> in the top bar to know when to zone more.</p>
  `,
}
```

**Step 2: Commit**

```bash
git add packages/game/src/ui/docs/zones.ts
git commit -m "docs(guide): expand zones section with development formula and building stats"
```

---

### Task 5: Create expanded Roads & Traffic section

**Files:**
- Create: `packages/game/src/ui/docs/roads-traffic.ts`

**Step 1: Write expanded content**

Source: `traffic.ts` (MAX_TRIP_DISTANCE=30, TRAFFIC_PER_TRIP=50, capacity=100), `demand.ts` (congestion penalty).

```ts
import type { DocSection } from './types.js'

export const roadsTraffic: DocSection = {
  title: 'Roads & Traffic',
  content: `
    <p>Roads ($10 each, $1/mo maintenance) connect your zones and enable development.</p>
    <p><strong>Traffic</strong> simulates commuters traveling from residential areas to commercial and industrial zones. Each residential building generates trips along roads to the nearest workplace zones.</p>
    <p>Trips follow roads up to <strong>30 tiles</strong>. Each trip adds 50 traffic units to every road tile along the route. Road capacity is 100 units per tile — anything beyond that is heavy congestion.</p>
    <p>When average road congestion exceeds 80%, all zone demand is penalized:</p>
    <p class="docs-formula"><code>Demand Penalty = 1.0 − (Avg Congestion − 0.8) × 0.4</code> — minimum 0.5×</p>
    <p><strong>Tips:</strong></p>
    <ul>
      <li>Build parallel roads to distribute traffic</li>
      <li>Keep residential and work zones within 30 tiles of each other</li>
      <li>Use the <strong>Traffic overlay (T)</strong> to spot bottlenecks</li>
    </ul>
  `,
}
```

**Step 2: Commit**

```bash
git add packages/game/src/ui/docs/roads-traffic.ts
git commit -m "docs(guide): expand traffic section with simulation parameters and congestion formula"
```

---

### Task 6: Create expanded Budget & Taxes section

**Files:**
- Create: `packages/game/src/ui/docs/budget-taxes.ts`

**Step 1: Write expanded content**

Source: `budget.ts` (tax formula line 68), `demand.ts` (tax modifier line 27), `constants.ts` (MAINTENANCE).

```ts
import type { DocSection } from './types.js'

export const budgetTaxes: DocSection = {
  title: 'Budget & Taxes',
  content: `
    <p>Open the budget panel with <strong>B</strong>.</p>
    <p><strong>Income</strong> comes from property taxes on developed zones. It's based on your population, the average land value across developed tiles, and your tax rate:</p>
    <p class="docs-formula"><code>Tax Income = Population × (Avg Land Value ÷ 20) × Tax Rate</code></p>

    <p><strong>Tax Rate</strong> — Default 7% (neutral). The demand system treats 7% as the baseline. Every 1% above or below shifts demand by ±5%:</p>
    <p class="docs-formula"><code>Tax Modifier = 1.0 − (Tax Rate − 7%) × 5</code></p>
    <p>Lower taxes boost demand but reduce income. Higher taxes suppress growth. Range: 0–20%.</p>

    <p><strong>Maintenance costs per month:</strong></p>
    <table>
      <tr><td>Roads</td><td>$1/tile</td></tr>
      <tr><td>Rail</td><td>$1.50/tile</td></tr>
      <tr><td>Power Lines</td><td>$0.50/tile</td></tr>
      <tr><td>Diesel Generator</td><td>$15</td></tr>
      <tr><td>Coal Plant</td><td>$60</td></tr>
      <tr><td>Nuclear Plant</td><td>$100</td></tr>
      <tr><td>Police/Fire Stations</td><td>$50 × (Funding ÷ 100)</td></tr>
    </table>

    <p><strong>Balance</strong> is calculated monthly but applied to your funds each January. If your funds run out, you can't build — but existing buildings continue to function.</p>
  `,
}
```

**Step 2: Commit**

```bash
git add packages/game/src/ui/docs/budget-taxes.ts
git commit -m "docs(guide): expand budget section with tax formula and maintenance table"
```

---

### Task 7: Create new Demand section

**Files:**
- Create: `packages/game/src/ui/docs/demand.ts`

**Step 1: Write content**

Source: `demand.ts` (all formulas — rBase=0.7, cBase=pop/200 capped 0.6, iBase=0.4, industrial modifier).

```ts
import type { DocSection } from './types.js'

export const demand: DocSection = {
  title: 'Demand',
  content: `
    <p>The <strong>R/C/I demand bars</strong> in the top bar show how much each zone type wants to grow. Demand is recalculated every month and drives zone development.</p>

    <p><strong>Residential</strong> has a strong base demand of 0.7 — people always want to move in, modified by the tax rate.</p>
    <p class="docs-formula"><code>R Demand = 0.7 × Tax Modifier</code></p>

    <p><strong>Commercial</strong> demand scales with your population — shops need customers. It caps at 0.6:</p>
    <p class="docs-formula"><code>C Demand = min(Population ÷ 200, 0.6) × Tax Modifier</code></p>

    <p><strong>Industrial</strong> has a steady base of 0.4 and is only half as sensitive to taxes:</p>
    <p class="docs-formula"><code>I Demand = 0.4 × (Tax Modifier × 0.5 + 0.5)</code></p>

    <p>All demand values are clamped between −1 and 1. High traffic congestion (>80% average) penalizes all demand equally.</p>
  `,
}
```

**Step 2: Commit**

```bash
git add packages/game/src/ui/docs/demand.ts
git commit -m "docs(guide): add demand section with R/C/I formulas"
```

---

### Task 8: Create expanded Crime section

**Files:**
- Create: `packages/game/src/ui/docs/crime.ts`

**Step 1: Write expanded content**

Source: `crime.ts` (base=30, lv factor=0.15, police effect=40), `influence.ts` (linear decay, radius=15).

```ts
import type { DocSection } from './types.js'

export const crime: DocSection = {
  title: 'Crime',
  content: `
    <p>Crime appears on zoned tiles and is driven by low land values. Every zoned tile starts with a base crime score of 30, reduced by the tile's land value. Police stations actively suppress crime within their radius.</p>
    <p class="docs-formula"><code>Crime = 30 − (Land Value × 0.15) − (Police Influence × 40)</code> — minimum 0</p>
    <p><strong>Police Stations</strong> ($300, $50/mo) project influence in a 15-tile radius. Influence is strongest at the station center (1.0) and fades linearly to zero at the edge. Reducing police funding shrinks the effective radius proportionally.</p>
    <p class="docs-formula"><code>Effective Radius = 15 × (Funding ÷ 100)</code></p>
    <p>High crime reduces land values, which in turn increases crime further — a downward spiral if left unchecked. Use the <strong>Crime overlay (C)</strong> to identify problem areas.</p>
  `,
}
```

**Step 2: Commit**

```bash
git add packages/game/src/ui/docs/crime.ts
git commit -m "docs(guide): expand crime section with formula and radius mechanics"
```

---

### Task 9: Create expanded Fire section

**Files:**
- Create: `packages/game/src/ui/docs/fire.ts`

**Step 1: Write expanded content**

Source: `fire.ts` (baseRisk=0.001, coverage×0.9, spreadChance=0.15, coverage×0.7, duration 3-5 ticks, extinguish at >0.5 coverage).

```ts
import type { DocSection } from './types.js'

export const fire: DocSection = {
  title: 'Fire',
  content: `
    <p>Fires ignite randomly on zoned tiles each month. Each tile has a small chance of catching fire, dramatically reduced by fire station coverage:</p>
    <p class="docs-formula"><code>Fire Risk = 0.1% × (1 − Coverage × 0.9)</code> — per tile per month</p>
    <p>Fires burn for 3–5 months and spread to adjacent zoned tiles. Spread chance per neighbor:</p>
    <p class="docs-formula"><code>Spread Chance = 15% × (1 − Coverage × 0.7)</code></p>
    <p><strong>Fire Stations</strong> ($300, $50/mo) cover a 15-tile radius (scales with funding, same as police). Tiles with over 50% coverage extinguish fires in 1 month instead of 3–5. When a fire burns out, it <strong>destroys the zone and building</strong> on that tile.</p>
    <p>Water, roads, and empty land act as natural firebreaks — fires cannot spread across them.</p>
    <p>Use the <strong>Fire overlay (F)</strong> to see coverage (green = safe) and active fires (orange).</p>
  `,
}
```

**Step 2: Commit**

```bash
git add packages/game/src/ui/docs/fire.ts
git commit -m "docs(guide): expand fire section with risk/spread formulas and extinguish mechanics"
```

---

### Task 10: Create expanded Land Value section

**Files:**
- Create: `packages/game/src/ui/docs/land-value.ts`

**Step 1: Write expanded content**

Source: `land-value.ts` (base=10, water=+15, park=+10 decaying by 2/tile over 4 tiles, road=+10 within 3, pollution=-0.5, crime=-0.1, clamp 0-255).

```ts
import type { DocSection } from './types.js'

export const landValue: DocSection = {
  title: 'Land Value',
  content: `
    <p>Land value is recalculated every month for every non-water tile. It directly affects tax income and influences crime. Higher land values mean more revenue and less crime.</p>
    <p class="docs-formula"><code>Land Value = 10 + Water + Parks + Road − Pollution − Crime</code> — clamped 0–255</p>
    <p><strong>Bonuses:</strong></p>
    <ul>
      <li><strong>Water adjacency:</strong> +15 per adjacent water tile (cardinal directions only)</li>
      <li><strong>Parks:</strong> +10 at the park, fading by 2 per tile (up to 4 tiles away)</li>
      <li><strong>Road access:</strong> +10 if any road exists within 3 tiles</li>
    </ul>
    <p><strong>Penalties:</strong></p>
    <ul>
      <li><strong>Pollution:</strong> −0.5 per pollution level (from industrial zones and power plants)</li>
      <li><strong>Crime:</strong> −0.1 per crime level</li>
    </ul>
    <p>Use the <strong>Land Value overlay (V)</strong> to visualize values across your city (blue = low, red = high).</p>
  `,
}
```

**Step 2: Commit**

```bash
git add packages/game/src/ui/docs/land-value.ts
git commit -m "docs(guide): expand land value section with full formula breakdown"
```

---

### Task 11: Create new Time & Simulation section

**Files:**
- Create: `packages/game/src/ui/docs/time-simulation.ts`

**Step 1: Write content**

Source: `constants.ts` (ticksPerMonth=4, monthsPerYear=12, startYear=1900).

```ts
import type { DocSection } from './types.js'

export const timeSimulation: DocSection = {
  title: 'Time & Simulation',
  content: `
    <p>The game runs in <strong>ticks</strong>. Every 4 ticks equals one month, and 12 months make a year (starting from January 1900).</p>
    <p>Each month the simulation recalculates:</p>
    <ul>
      <li>Zone demand (R/C/I)</li>
      <li>Land values</li>
      <li>Crime levels</li>
      <li>Fire coverage and active fires</li>
      <li>Zone development (new buildings)</li>
      <li>Traffic density</li>
      <li>Monthly budget balance</li>
    </ul>
    <p>Your budget balance accumulates monthly but is <strong>applied to your funds once per year in January</strong>.</p>
    <p>Control game speed with <strong>Space</strong> (pause), <strong>[</strong> (slower), and <strong>]</strong> (faster).</p>
  `,
}
```

**Step 2: Commit**

```bash
git add packages/game/src/ui/docs/time-simulation.ts
git commit -m "docs(guide): add time and simulation section"
```

---

### Task 12: Create new Building Reference section with SVG sprites

**Files:**
- Create: `packages/game/src/ui/docs/building-reference.ts`

**Step 1: Write content**

Uses `<img>` tags pointing to the same paths as `TileRenderer.ts` lines 55-63. Display at 40px height. Include all stats from `buildings-registry.ts`.

```ts
import type { DocSection } from './types.js'

function row(img: string, name: string, cost: string, maint: string, power: string, jobs: string, pop: string, pollution: string, notes: string): string {
  return `<tr>
    <td class="docs-ref-sprite"><img src="${img}" alt="${name}"></td>
    <td><strong>${name}</strong></td>
    <td>${cost}</td>
    <td>${maint}</td>
    <td>${power}</td>
    <td>${jobs}</td>
    <td>${pop}</td>
    <td>${pollution}</td>
    <td>${notes}</td>
  </tr>`
}

export const buildingReference: DocSection = {
  title: 'Building Reference',
  content: `
    <table class="docs-ref-table">
      <tr>
        <th></th>
        <th>Building</th>
        <th>Cost</th>
        <th>Maint.</th>
        <th>Power</th>
        <th>Jobs</th>
        <th>Pop.</th>
        <th>Pollution</th>
        <th>Notes</th>
      </tr>
      ${row('/tiles/buildings/residential-small.svg', 'Residential', 'Free', '—', 'Required', '—', '10', '—', 'Develops on zones')}
      ${row('/tiles/buildings/commercial-small.svg', 'Commercial', 'Free', '—', 'Required', '5', '—', '—', 'Needs population')}
      ${row('/tiles/buildings/industrial-small.svg', 'Industrial', 'Free', '—', 'Required', '10', '—', 'R3, Amt 10', 'Steady demand')}
      ${row('/tiles/power/diesel-generator.svg', 'Diesel Generator', '$300', '$15/mo', 'Gen. 50', '—', '—', 'R2, Amt 5', 'Early game')}
      ${row('/tiles/power/power-plant-coal.svg', 'Coal Plant', '$2,000', '$60/mo', 'Gen. 700', '—', '—', 'R6, Amt 20', 'Mid-game')}
      ${row('/tiles/power/power-plant-nuclear.svg', 'Nuclear Plant', '$5,000', '$100/mo', 'Gen. 2,000', '—', '—', 'None', 'Most efficient')}
      ${row('/tiles/buildings/service/police-station.svg', 'Police Station', '$300', '$50/mo', 'Required', '—', '—', '—', '15-tile crime radius')}
      ${row('/tiles/buildings/service/fire-station.svg', 'Fire Station', '$300', '$50/mo', 'Required', '—', '—', '—', '15-tile fire radius')}
      ${row('/tiles/buildings/park.svg', 'Park', '$10', '—', '—', '—', '—', '—', 'Boosts land value')}
    </table>
  `,
}
```

**Step 2: Commit**

```bash
git add packages/game/src/ui/docs/building-reference.ts
git commit -m "docs(guide): add building reference with SVG sprites and stats table"
```

---

### Task 13: Create master index.ts with TOC ordering

**Files:**
- Create: `packages/game/src/ui/docs/index.ts`

**Step 1: Write the index**

Imports all sections and exports them in display order.

```ts
import type { DocSection } from './types.js'
import { gettingStarted } from './getting-started.js'
import { controls } from './controls.js'
import { tools } from './tools.js'
import { overlays } from './overlays.js'
import { power } from './power.js'
import { zones } from './zones.js'
import { roadsTraffic } from './roads-traffic.js'
import { budgetTaxes } from './budget-taxes.js'
import { demand } from './demand.js'
import { crime } from './crime.js'
import { fire } from './fire.js'
import { landValue } from './land-value.js'
import { timeSimulation } from './time-simulation.js'
import { buildingReference } from './building-reference.js'

export type { DocSection }

export const SECTIONS: DocSection[] = [
  gettingStarted,
  controls,
  tools,
  overlays,
  power,
  zones,
  roadsTraffic,
  budgetTaxes,
  demand,
  crime,
  fire,
  landValue,
  timeSimulation,
  buildingReference,
]
```

**Step 2: Commit**

```bash
git add packages/game/src/ui/docs/index.ts
git commit -m "refactor(docs): create master index with section ordering"
```

---

### Task 14: Update DocsPanel.ts to import from docs/index.ts

**Files:**
- Modify: `packages/game/src/ui/DocsPanel.ts:1-152`

**Step 1: Replace inline sections with import**

Remove the `DocSection` interface and the entire `SECTIONS` array (lines 1-152). Replace with a single import:

```ts
import { type DocSection, SECTIONS } from './docs/index.js'
```

The rest of `DocsPanel.ts` (the class, lines 154-261) stays exactly the same — it already references `SECTIONS` by that name.

**Step 2: Verify build**

```bash
cd packages/game && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add packages/game/src/ui/DocsPanel.ts
git commit -m "refactor(docs): DocsPanel imports sections from docs/ modules"
```

---

### Task 15: Add CSS for formula callouts and building reference table

**Files:**
- Modify: `packages/game/src/styles/main.css:499-503` (after existing docs styles)

**Step 1: Add styles after line 503**

Add after the `.docs-section td:first-child` rule:

```css
.docs-formula {
  background: rgba(92, 156, 230, 0.08);
  border-left: 3px solid rgba(92, 156, 230, 0.4);
  padding: 6px 10px;
  margin: 8px 0;
  font-size: 13px;
}

.docs-formula code {
  color: #7fb8f0;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 12px;
}

.docs-ref-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
  font-size: 11px;
}

.docs-ref-table th {
  font-size: 11px;
  text-align: left;
  padding: 4px 6px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  color: rgba(224, 224, 224, 0.7);
}

.docs-ref-table td {
  padding: 4px 6px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  white-space: nowrap;
}

.docs-ref-sprite img {
  height: 40px;
  width: auto;
  display: block;
  image-rendering: pixelated;
}
```

**Step 2: Verify visually**

Run the dev server and open the Game Guide (G key):
```bash
cd packages/game && npm run dev
```

Check:
- All sections appear in the TOC
- Formula callouts have blue left border and code styling
- Building reference table shows SVG sprites at 40px height
- Search still filters correctly
- TOC scroll highlighting still works

**Step 3: Commit**

```bash
git add packages/game/src/styles/main.css
git commit -m "style(docs): add formula callout and building reference table styles"
```

---

### Task 16: Final verification and combined commit

**Step 1: Full build check**

```bash
cd packages/game && npx tsc --noEmit
```

**Step 2: Run dev server and verify**

```bash
cd packages/game && npm run dev
```

Open the Game Guide (G key) and verify:
- All 14 sections render with correct content
- Formula callouts are styled (blue left border, monospace code)
- Building reference shows all 9 building SVGs inline
- Search works across all sections
- TOC navigation scrolls correctly
- No console errors

**Step 3: Final commit if any fixes needed**
