# Education Service System — Design Spec

## Overview

Add education as a radius-based service system following the police/fire pattern. Schools boost residential desirability and feed into neighborhood reputation. Includes tiered buildings (small school + large school), an overlay, budget slider, and SVG tiles.

Education also integrates into the citizen satisfaction system via `TIER_WEIGHTS` in `wealth-tiers.ts`, where tier-specific weights (Low=0.6, Mid=1.2, High=1.5) make education matter more to wealthier citizens.

## Buildings

Two new entries in `buildings-registry.ts`, following the `service.police`/`service.police.small` pattern:

| Property | `service.school` | `service.school.small` |
|----------|-----------------|----------------------|
| Size | 3x3 | 1x1 |
| Build cost | $500 | $80 |
| Maintenance | $75/mo | $15/mo |
| Category | `BuildingCategory.Special` | `BuildingCategory.Special` |
| Density | `DensityLevel.Low` | `DensityLevel.Low` |
| Power required | Yes | Yes |
| Road required | Yes | Yes |
| Pollution | 0 | 0 |
| Capacity/jobs | 0 | 0 |

New constants in `packages/core/src/constants.ts`:
- `COSTS.school: 500`
- `COSTS.schoolSmall: 80`
- `MAINTENANCE.school: 75`
- `MAINTENANCE.schoolSmall: 15`

## Service Calculation

New file: `packages/engine/src/simulation/services/education.ts`

```typescript
export function calculateEducationCoverage(
  map: GameMap,
  educationCoverage: Uint8Array,
  educationFunding: number,
  influenceBuffer: Float32Array,
): void
```

Implementation:
1. Call `buildInfluenceMap(map, 'service.school', 12, educationFunding, influenceBuffer, { defId: 'service.school.small', baseRadius: 5 })`
2. Convert `influenceBuffer` (0-1 float) to `educationCoverage` (0-255 uint8), same as `calculateFireCoverage`

Constants:
- `SCHOOL_BASE_RADIUS = 12` (large school)
- `SCHOOL_SMALL_BASE_RADIUS = 5` (small school)

The existing `buildInfluenceMap` handles:
- Linear decay from 1.0 at center to 0.0 at effective radius
- Funding scaling: `effectiveRadius = baseRadius * (funding / 100)`
- Small school 1.5x radius boost when within large school coverage (influence > 0.3)

`rebuildDerivedState()` is the sole integration point for the coverage calculation. No other call sites needed — it already runs on init, after building placement, and in the monthly tick.

## Engine State Changes

In `engine-state.ts`:

### EngineState interface
- Add `educationCoverage: Uint8Array` (allocated at `size = width * height`, same as `fireCoverage`)

### Funding
- Add `education: number` to `funding` object (default: 100)

### createEngineState
- Allocate `educationCoverage = new Uint8Array(size)`
- Set `funding.education = 100`

### restoreState
- Allocate `educationCoverage = new Uint8Array(size)`
- Restore `funding.education` with `?? 100` fallback for old saves

### serializeState
- Bump version from 7 to 8
- `funding` already serialized via spread — education will be included automatically

### rebuildDerivedState
- After `calculateFireCoverage(...)`, add:
  `calculateEducationCoverage(state.map, state.educationCoverage, state.funding.education, state.influenceBuffer)`

## Desirability Integration

In `desirability.ts`:

Education adds a **flat bonus** to residential desirability (no tier weighting here — tier-specific behavior is handled separately in the citizen satisfaction system, see below).

### New constants
- `RES_EDUCATION_BONUS = 0.20`
- `EDUCATION_COVERAGE_THRESHOLD = 76` (≈ 0.3 × 255)

### residentialDesirability changes
- Add `educationCoverage: Uint8Array` parameter
- After park bonus, before pollution penalty:
  ```
  if (educationCoverage[idx]! > EDUCATION_COVERAGE_THRESHOLD) {
    score += RES_EDUCATION_BONUS * (educationCoverage[idx]! / 255)
  }
  ```

### computeDesirability changes
- Add `educationCoverage: Uint8Array` parameter, thread through to `residentialDesirability`

### Concrete callers that need the new parameter
- `updateDensity()` in `density.ts` — calls `computeDesirability`. Add `educationCoverage` to its parameter list.
- `monthlyTick()` in `tick.ts` — calls `updateDensity()`. Pass `state.educationCoverage` through.
- Any other callers of `computeDesirability` (search for all usages).

## Citizen Satisfaction — Tier Weighting

In `wealth-tiers.ts`, the existing `TIER_WEIGHTS` record has per-factor weights for crime, pollution, park, fire, commute, jobMatch, commerce. Add an `education` factor:

```typescript
TIER_WEIGHTS = {
  1: { ..., education: 0.6 },   // Low wealth — less affected
  2: { ..., education: 1.2 },   // Mid wealth — attracted
  3: { ..., education: 1.5 },   // High wealth — strongly attracted
}
```

In `citizens.ts`, `computeSatisfaction()` uses these weights. Add education coverage as a satisfaction factor there, following the same pattern as the existing factors.

This is a **separate integration** from the desirability bonus — desirability controls zone fill/drain rates, while satisfaction affects individual citizen happiness and migration decisions.

## Reputation Integration

In `reputation.ts`:

### Weight renormalization
Add education as a quality factor. The existing weights are hard-coded and sum to 1.0. Adding education changes all existing weight values (e.g., crime goes from 0.35 to ~0.318). Existing reputation tests will need updated assertions.

```typescript
const RAW_CRIME = 0.35
const RAW_POLLUTION = 0.25
const RAW_FIRE = 0.15
const RAW_PARK = 0.15
const RAW_OCCUPANCY = 0.10
const RAW_EDUCATION = 0.10
const TOTAL = RAW_CRIME + RAW_POLLUTION + RAW_FIRE + RAW_PARK + RAW_OCCUPANCY + RAW_EDUCATION

const QUALITY_CRIME_WEIGHT = RAW_CRIME / TOTAL
const QUALITY_POLLUTION_WEIGHT = RAW_POLLUTION / TOTAL
const QUALITY_FIRE_WEIGHT = RAW_FIRE / TOTAL
const QUALITY_PARK_WEIGHT = RAW_PARK / TOTAL
const QUALITY_OCCUPANCY_WEIGHT = RAW_OCCUPANCY / TOTAL
const QUALITY_EDUCATION_WEIGHT = RAW_EDUCATION / TOTAL
```

### computeCurrentQuality
- Add `educationNorm: number` parameter
- Add `+ educationNorm * QUALITY_EDUCATION_WEIGHT` to the formula

### computeReputation
- Add `educationCoverage: Uint8Array` parameter
- Compute `educationNorm = educationCoverage[idx]! / 255` per tile
- Pass to `computeCurrentQuality`

### Concrete callers
- `createEngineState()` in `engine-state.ts` (line 349) — pass `state.educationCoverage`
- `monthlyTick()` in `tick.ts` (line 58) — pass `state.educationCoverage`

## Budget Integration

In `budget.ts`:

### Service costs
The existing building-counting logic uses an `else if` chain with `startsWith()`:
```typescript
if (building.defId.startsWith('service.police')) policeMaintenance += ...
else if (building.defId.startsWith('service.fire')) fireMaintenance += ...
```

Add a new branch: `else if (building.defId.startsWith('service.school')) schoolMaintenance += def.maintenanceCost`

Then: `education: schoolMaintenance * (funding.education / 100)`

### BudgetInfo changes (in core `state.ts`)
- Add `education: number` to `serviceCosts`
- Add `education: number` to `funding`

### calculateBudget
- Already receives `funding` object — education funding will be included when the new branch is added

## Core Type Changes

In `packages/core/src/state.ts`:

### GameState
- Add `educationCoverage: Uint8Array`

### BudgetInfo
- Add `education: number` to `serviceCosts`
- Add `education: number` to `funding`

## Engine API Changes

In `packages/engine/src/engine.ts`:

### setFunding
The `service` parameter type is currently `'police' | 'fire' | 'transit'`. Add `'education'` to this union.

### getState
This method manually maps `EngineState` fields to `GameState` (it's not a spread). Add `educationCoverage: this.state.educationCoverage` to the returned object.

## Budget Panel

In `BudgetPanel.ts`:

### FundingService type
Currently `type FundingService = 'police' | 'fire' | 'transit'`. Add `'education'`.

### Slider
- Add education funding slider matching police/fire pattern
- `bindFundingSlider('education-funding', 'education-funding-display', 'education')`
- HTML: slider input + display span, same structure as existing sliders

## Overlay

### OverlayRenderer.ts
- Add `'education'` to `OverlayType` union
- Add `EDUCATION_COVERAGE_COLORS` table via `buildColorTable(educationCoverageToRgba)`
- Add `case 'education'` to render switch: iterate visible tiles, skip zero values, paint from color table — similar to crime overlay pattern (skip zero, paint coverage on zoned tiles)

### colors.ts
```typescript
export function educationCoverageToRgba(value: number): string {
  // Blue-purple gradient: low coverage = light blue, high = deep purple
  const v = value / 255
  const r = Math.floor(80 + v * 80)   // 80 → 160
  const g = Math.floor(120 * (1 - v))  // 120 → 0
  const b = Math.floor(180 + v * 75)   // 180 → 255
  return `rgba(${r}, ${g}, ${b}, 0.45)`
}
```

### Game.ts overlay toggle
- Key `u` (for ed**u**cation — `e` is taken by zoom controls)
- `{ label: 'Education (U)', key: 'u', action: () => this.renderer.toggleOverlay('education') }`

## Toolbar

In `Toolbar.ts`:
- Add "School" entry: `key` TBD (next available in services group), factory `() => new BuildingTool('service.school')`
- Add "Small School" entry: factory `() => new BuildingTool('service.school.small')`

## In-Game Guide

Add entries for:
- School (3x3, $500, $75/mo) — provides education coverage, boosts residential desirability and neighborhood reputation
- Small School (1x1, $80, $15/mo) — smaller coverage, gets 1.5x radius boost when near a full school
- Education overlay toggle (U key)
- Education funding slider

## SVG Tiles

Two new SVG tiles via tile-generator:
- `service.school` (3x3) — school building
- `service.school.small` (1x1) — small school

## Tests

### New: education.test.ts
- Single large school stamps correct radius coverage
- Single small school stamps correct (smaller) radius
- Small school near large school gets 1.5x radius boost
- Small school far from large school gets no boost
- Funding at 0 produces zero coverage
- Funding at 200 doubles effective radius
- Empty map (no schools) produces zero coverage

### Modified: desirability.test.ts
- Education coverage above threshold adds bonus to residential desirability
- Education coverage below threshold adds no bonus
- No education coverage adds no bonus
- Education bonus scales with coverage intensity

### Modified: reputation.test.ts
- Education factor contributes to quality score
- Weights still sum to 1.0 after renormalization
- Quality score increases with education coverage
- **Update existing assertions** for changed weight values (crime 0.35→0.318, etc.)

### Modified: budget.test.ts
- School maintenance counted in service costs
- School maintenance scales with education funding
- Mixed school + small school maintenance summed correctly

### Modified: citizens.test.ts (if exists)
- Education tier weight affects satisfaction differently per wealth tier

## Out of Scope
- School capacity limits
- Teacher/staffing mechanics
- Education level as a persistent citizen attribute
