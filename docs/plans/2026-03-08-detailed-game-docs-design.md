# Detailed In-Game Documentation Design

## Goal

Expand the in-game Game Guide (G key) with super-detailed documentation of all game mechanics, including exact formulas, constants, and a building reference with SVG sprites. Split the docs into separate files for maintainability.

## Formula Presentation Style

Hybrid approach — natural language explanation first, then a compact formula in a styled `<code>` callout:

> Crime starts at 30 and decreases as land value rises. Police stations suppress crime within their radius.
>
> `Crime = 30 - (Land Value × 0.15) - (Police Influence × 40)` — minimum 0

## File Structure

Split `DocsPanel.ts` section data into separate files under `ui/docs/`:

```
ui/docs/
  index.ts              # Master TOC — exports ordered DocSection[]
  types.ts              # DocSection interface
  getting-started.ts
  controls.ts
  tools.ts
  overlays.ts
  power.ts
  zones.ts
  roads-traffic.ts
  budget-taxes.ts
  demand.ts             # NEW section
  crime.ts
  fire.ts
  land-value.ts
  time-simulation.ts    # NEW section
  building-reference.ts # NEW section with SVG images
```

`DocsPanel.ts` imports `SECTIONS` from `ui/docs/index.ts` instead of defining them inline.

## Section Changes

### Unchanged (existing content is sufficient)
- Getting Started
- Controls
- Tools & Shortcuts (add note that zones are free to place)
- Overlays

### Expanded Sections

**Power** — Add cost-per-tile efficiency, maintenance-per-tile, pollution tradeoff comparison.

**Zones & Development** — Add development formula (`12% × demand` per tile/month), road proximity requirement (3 tiles Manhattan), building stats (10 pop, 5/10 jobs).

**Roads & Traffic** — Add max trip distance (30), traffic per trip (50), capacity (100), congestion demand penalty formula.

**Budget & Taxes** — Add tax income formula (`Pop × AvgLandValue / 20 × Rate`), tax modifier formula, maintenance cost table, annual application note.

**Crime** — Add full formula with base 30, land value factor, police influence factor, radius/funding scaling.

**Fire** — Add base risk formula (0.1%), spread chance (15%), coverage reduction factors, fire duration with/without coverage.

**Land Value** — Add full formula: base 10, water +15, park bonus (fading), road +10, pollution/crime penalties, clamp 0-255.

### New Sections

**Demand** — R/C/I base values (0.7, pop/200 capped 0.6, 0.4), tax modifier, industrial half-sensitivity, congestion suppression.

**Building Reference** — Table with inline SVG images from `/tiles/...` paths. Columns: sprite, name, cost, maintenance, power, jobs, population, pollution, notes.

**Time & Simulation** — 4 ticks/month, 12 months/year, start 1900, what recalculates monthly, budget applied annually in January.

## SVG References in Building Reference

Use `<img>` tags pointing to the same paths the renderer uses:
- `/tiles/buildings/residential-small.svg`
- `/tiles/buildings/commercial-small.svg`
- `/tiles/buildings/industrial-small.svg`
- `/tiles/power/diesel-generator.svg`
- `/tiles/power/power-plant-coal.svg`
- `/tiles/power/power-plant-nuclear.svg`
- `/tiles/buildings/service/police-station.svg`
- `/tiles/buildings/service/fire-station.svg`
- `/tiles/buildings/park.svg`

Display at ~40px height, inline in the table.

## Exclusions (per user)

- No building sizes in docs
- No starting funds by map size
