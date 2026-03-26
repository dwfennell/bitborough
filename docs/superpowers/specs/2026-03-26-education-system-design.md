# Education Service System — Design Spec

## Overview

Add education as a radius-based service system following the police/fire pattern. Schools boost residential desirability (tier-weighted) and feed into neighborhood reputation. Includes tiered buildings (small school + large school), an overlay, budget slider, and SVG tiles.

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
- `COSTS.schoolKiosk: 80`
- `MAINTENANCE.school: 75`
- `MAINTENANCE.schoolKiosk: 15`

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

### New constants
- `RES_EDUCATION_BONUS = 0.20`
- `EDUCATION_COVERAGE_THRESHOLD = 76` (≈ 0.3 × 255)

### Education tier weights
```typescript
const EDUCATION_TIER_WEIGHT: Record<WealthTier, number> = {
  1: 0.6,   // Low wealth — less attracted by education
  2: 1.2,   // Mid wealth — attracted
  3: 1.5,   // High wealth — strongly attracted
}
```

### residentialDesirability changes
- Add `educationCoverage: Uint8Array` parameter
- After park bonus, before pollution penalty:
  ```
  if (educationCoverage[idx]! > EDUCATION_COVERAGE_THRESHOLD) {
    score += RES_EDUCATION_BONUS * (educationCoverage[idx]! / 255)
  }
  ```
- Note: Tier weighting is applied at a higher level where the wealth tier is known, not inside `residentialDesirability` itself (which doesn't currently know the tier). The tier weight multiplier will be applied where desirability is consumed for tier-specific decisions.

### computeDesirability changes
- Add `educationCoverage: Uint8Array` parameter, thread through to `residentialDesirability`

### Tier weighting integration point
The `EDUCATION_TIER_WEIGHT` multiplier applies where desirability influences wealth-tier-specific outcomes. The exact integration point depends on how `computeDesirability` results are consumed — if desirability is used in a tier-aware context (e.g., `wealth-tiers.ts` tier factor weights), add `education` to the `TIER_WEIGHTS` record. If desirability is consumed as a single scalar, apply the tier weight as a multiplier on the education component before summing.

Looking at the existing code: `TIER_WEIGHTS` in `wealth-tiers.ts` already has per-factor weights (crime, pollution, park, fire, commute, jobMatch, commerce). Add `education: 0.6/1.2/1.5` there to keep the pattern consistent, and use it wherever tier-weighted desirability is calculated.

## Reputation Integration

In `reputation.ts`:

### Weight renormalization
Add education as a quality factor and renormalize so all weights sum to 1.0:

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

## Budget Integration

In `budget.ts`:

### Service costs
- Count `service.school` and `service.school.small` buildings
- Sum maintenance: `schoolMaintenance * (funding.education / 100)`
- Add `education: number` to `serviceCosts` in `BudgetInfo`

### BudgetInfo changes (in core `state.ts`)
- Add `education: number` to `serviceCosts`
- Add `education: number` to `funding`

### calculateBudget signature
- Already receives `funding` object — education funding will be included automatically

## Core Type Changes

In `packages/core/src/state.ts`:

### GameState
- Add `educationCoverage: Uint8Array`

### BudgetInfo
- Add `education: number` to `serviceCosts`
- Add `education: number` to `funding`

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
- Add `{ label: 'Education (E)', key: 'e', action: () => this.renderer.toggleOverlay('education') }`

## Toolbar

In `Toolbar.ts`:
- Add "School" entry: `key` TBD (next available number/letter in services group), factory `() => new BuildingTool('service.school')`
- Add "School Kiosk" entry: factory `() => new BuildingTool('service.school.small')`

## Budget Panel

In `BudgetPanel.ts`:
- Add education funding slider matching police/fire pattern
- `bindFundingSlider('education-funding', 'education-funding-display', 'education')`
- HTML: slider input + display span, same structure as existing sliders

## In-Game Guide

Add entries for:
- School (3x3, $500, $75/mo) — provides education coverage, boosts residential desirability especially for mid/high wealth tiers
- School Kiosk (1x1, $80, $15/mo) — smaller coverage, gets 1.5x radius boost when near a full school
- Education overlay toggle (E key)
- Education funding slider

## SVG Tiles

Two new SVG tiles via tile-generator:
- `service.school` (3x3) — school building
- `service.school.small` (1x1) — small school/kiosk

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

### Modified: budget.test.ts
- School maintenance counted in service costs
- School maintenance scales with education funding
- Mixed school + kiosk maintenance summed correctly

## Call-Site Updates

All callers of modified functions need parameter updates:

### computeDesirability callers
- Add `educationCoverage` parameter wherever `computeDesirability` is called (zone transitions, density upgrades, etc.)

### computeReputation callers
- Add `educationCoverage` parameter (called in `tick.ts` monthly tick and `createEngineState`)

### GameState construction
- Wherever `GameState` is built from `EngineState` (likely in the engine's `getState()` method), include `educationCoverage`

## Out of Scope
- Education affecting citizen satisfaction directly (beyond reputation)
- School capacity limits
- Teacher/staffing mechanics
- Education level as a persistent citizen attribute
