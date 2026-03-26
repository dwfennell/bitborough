# School Enrollment System — Design Spec

## Overview

Replace the radius-based education coverage system with an enrollment-based model. Citizens with children enroll at the nearest school via road routing (like work/commerce). Schools have capacity limits (120% hard cap with quality degradation). Satisfaction depends on commute distance and school quality (funding × occupancy factor). Tier weights make education more important to wealthier residents.

## Enrollment Model

### Agent Fields

New fields on `Citizen` (following the work/commerce pattern):
- `schoolBuildingId: string | null`
- `schoolAccessRoad: number | null`
- `homeSchoolRoute: number[]`
- `homeSchoolRouteTileSet: Set<number>`

### Who Enrolls

Only agents with `demographics.children > 0` seek school enrollment. Working adults and elderly without children do not enroll. This means education demand scales with age distribution, not total population.

### How Enrollment Works

Reuse `findNearestBuilding` with a filter for buildings whose `defId` starts with `service.school`. A school is "available" if its current enrollment is below 120% of capacity.

Enrollment happens during `syncAgentsForBuilding` (same lifecycle as work/commerce matching). When an agent's school route becomes stale (building destroyed, route blocked), it re-enrolls at the next available school.

### Capacity Tracking

A `Map<string, number>` of `buildingId → enrolled children count`, rebuilt each sync pass by summing `demographics.children` across all agents assigned to each school.

### Capacities

| Building | Capacity | Max (120%) |
|----------|----------|------------|
| `service.school` (3x3) | 300 | 360 |
| `service.school.small` (1x1) | 50 | 60 |

Schools at or above 120% enrollment are excluded from `findNearestBuilding` results.

### School Commute Traffic

`homeSchoolRoute` contributes to `trafficDensity` the same way work and commerce routes do.

## School Quality

Quality is per-school, computed from funding level and occupancy:

```
occupancyRatio = enrolledChildren / capacity
occupancyFactor = 1.0                            if ratio ≤ 1.0
                = 1.0 - (ratio - 1.0) * 2.5      if ratio ≤ 1.2 (linear: 1.0 at 100%, 0.5 at 120%)

quality = (educationFunding / 100) * occupancyFactor
```

| Enrolled/Capacity | Funding | Quality |
|---|---|---|
| 200/300 (67%) | 100% | 1.0 |
| 300/300 (100%) | 100% | 1.0 |
| 330/300 (110%) | 100% | 0.75 |
| 360/300 (120%) | 100% | 0.5 |
| 300/300 (100%) | 50% | 0.5 |
| 360/300 (120%) | 50% | 0.25 |

Quality is looked up per-agent based on their assigned school during satisfaction calculation — it is not a tile-based layer.

## Citizen Satisfaction Integration

In `computeSatisfaction`, replace the current `educationNorm * 0.15 * w.education` (which reads from the now-removed coverage layer) with:

```typescript
if (agent.schoolBuildingId !== null) {
  const commuteNorm = clamp(agent.homeSchoolRoute.length / MAX_SCHOOL_COMMUTE, 0, 1)
  const schoolQuality = getSchoolQuality(agent.schoolBuildingId, enrollmentCounts, funding)
  const educationScore = schoolQuality * (1 - commuteNorm * 0.5)
  // satisfaction += educationScore * 0.15 * w.education
}
// else: no bonus, no penalty
```

### Constants
- `MAX_SCHOOL_COMMUTE = 40` (shorter than work commute of 60 — schools should be closer to home)
- `EDUCATION_SATISFACTION_WEIGHT = 0.15` (same as current)
- Tier weights unchanged: Low=0.6, Mid=1.2, High=1.5

### No-enrollment behavior
Residents who can't reach a school or all schools are full past 120% simply receive no education satisfaction bonus. No penalty. This matches how jobs/commerce work — the incentive to build schools comes from the positive bonus, not from punishment.

## What Gets Removed (Radius-Based System)

### Remove entirely
- `calculateEducationCoverage()` in `services/education.ts` — delete the file
- `educationCoverage: Uint8Array` from `EngineState` and `GameState`
- `calculateEducationCoverage` call in `rebuildDerivedState()`
- `educationCoverage` from `Engine.getState()` return object
- `educationCoverage` from `createEngineState()` and `restoreState()` allocation
- `RES_EDUCATION_BONUS`, `EDUCATION_COVERAGE_THRESHOLD` from `desirability.ts`
- `educationCoverage` parameter from `computeDesirability`, `residentialDesirability`, `updateDensity`
- `educationCoverage` from `TileLayers` interface in `citizens.ts`
- `educationNorm` from `computeSatisfaction` (replaced by enrollment-based logic)
- Education factor from `computeCurrentQuality` in `reputation.ts` (revert weight renormalization back to 5 factors summing to 1.0)
- `educationCoverage` from reputation callers

### Keep
- Building definitions (`service.school`, `service.school.small`), costs, constants
- Budget integration (school maintenance counting in `budget.ts`)
- Tier weights (`education` in `TIER_WEIGHTS`) — used by the new satisfaction logic
- SVG tiles, toolbar entries, funding slider, in-game guide
- Overlay infrastructure (key J, color table) — repurposed below
- `influenceToUint8` utility in `influence.ts` (still used by fire)

### Serialization
- Bump save version (from 8 to 9)
- New citizen fields (`schoolBuildingId`, `schoolAccessRoad`, `homeSchoolRoute`) serialized alongside existing route fields
- `restoreState` defaults: `schoolBuildingId: null`, `schoolAccessRoad: null`, `homeSchoolRoute: []` for old saves

## Overlay Repurpose

The education overlay (J key) changes from a coverage heatmap to a school catchment + capacity visualization:

- For each enrolled agent: color the agent's home tile by the assigned school's quality
  - Green: quality ≥ 0.8
  - Yellow: quality 0.5–0.8
  - Red: quality < 0.5
- Tiles with residential buildings that have children but no school enrollment: gray
- Non-residential / no-children tiles: skip (transparent)

This tells the player immediately: "where do I need more schools?"

### GameState changes for overlay
- Add `schoolEnrollment: Array<{ homeTile: number; quality: number }>` to `GameState` (computed in `getState()` from agent data)
- Or: add `educationQuality: Uint8Array` tile layer (per-tile, 0-255 mapped from quality, 0 = no enrollment) — simpler for the renderer

Recommendation: `educationQuality: Uint8Array` tile layer, computed during the citizen tick from enrollment data. The overlay renderer reads it the same way it reads other layers. Tiles with children but no enrollment get value 1 (maps to gray in the color function). Tiles with enrollment get `quality * 254 + 1`. Value 0 = no residential children = skip.

## In-Game Guide Update

Update the education section in `packages/docs/src/sections/education.ts` to describe enrollment, capacity, quality, and commute mechanics instead of radius-based coverage.

## Tests

### New/modified: education enrollment tests
- Agent with children enrolls at nearest school
- Agent without children does not enroll
- School at 120% capacity excluded from enrollment
- School at 100% capacity still accepts enrollment (up to 120%)
- Agent picks closer school over farther one
- No school available = no enrollment (no crash, no penalty)

### New: school quality tests
- Quality = 1.0 at ≤100% capacity, 100% funding
- Quality degrades linearly from 100% to 120% capacity
- Quality = 0.5 at 120% capacity, 100% funding
- Quality scales with funding
- Quality = 0 at 0% funding regardless of occupancy

### Modified: satisfaction tests
- Enrolled agent gets education satisfaction bonus
- Unenrolled agent gets no bonus (no penalty)
- Long commute reduces education score
- Quality of school affects education score
- Tier weight applies correctly

### Modified: existing tests
- Remove all `educationCoverage` references from desirability, reputation, and citizen test helpers
- Revert reputation weight assertions to 5-factor values
- Remove education coverage tests (replaced by enrollment tests)

## Out of Scope
- Education as a persistent citizen attribute (educated vs uneducated)
- Teacher/staffing mechanics
- School choice (parents preferring higher-quality farther school over closer low-quality one)
- Private vs public schools
- Education affecting job eligibility or productivity
