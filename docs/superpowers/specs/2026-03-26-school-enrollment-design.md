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
- `homeSchoolRouteStale: boolean`

### Who Enrolls

Only agents with `demographics.children > 0` seek school enrollment. Working adults and elderly without children do not enroll. This means education demand scales with age distribution, not total population.

**Lifecycle note**: new agents spawn with `demographics: { children: 0, working: 50, elderly: 0 }`. Children appear through `demographicTick` births (stochastic, `P_BIRTH = 0.0012` per working adult per tick). This means schools will have no enrollment in the very early game until births start happening — this is intentional and creates a natural progression where schools become relevant as the city matures.

### School Capacity Constants

Capacity is stored as hardcoded constants (not on `BuildingDef.capacity`, which is used by the density system for residential occupancy). The `BuildingDef.capacity` field stays at 0 for schools.

```typescript
const SCHOOL_CAPACITY: Record<string, number> = {
  'service.school': 300,
  'service.school.small': 50,
}
const SCHOOL_OVER_CAPACITY_RATIO = 1.2  // 120% hard cap
```

### How Enrollment Works

Create a new `findNearestSchool` function (separate from the existing private `findNearestBuilding`). It follows the same A* routing pattern but adds a capacity check:

```typescript
function findNearestSchool(
  map: GameMap,
  graph: RoadGraph,
  fromRoad: number,
  enrollmentCounts: Map<string, number>,
  trafficDensity?: Uint8Array,
): { buildingId: string; accessRoad: number; route: number[] } | null
```

The function iterates school buildings, checks `enrollmentCounts.get(id) < capacity * SCHOOL_OVER_CAPACITY_RATIO`, then runs A* to find the nearest accessible school with available slots.

Enrollment happens inside `syncAgentsForBuilding` — the same function that matches agents to jobs and commerce. After job and commerce matching, agents with `demographics.children > 0` get school matching via `findNearestSchool`. This requires passing the enrollment counts map into `syncAgentsForBuilding`.

### Capacity Tracking

A `Map<string, number>` of `buildingId → enrolled children count`, built before the sync pass by summing `demographics.children` across all agents with a `schoolBuildingId`. Updated incrementally during the sync pass as new agents enroll.

### Capacities

| Building | Capacity | Max (120%) |
|----------|----------|------------|
| `service.school` (3x3) | 300 | 360 |
| `service.school.small` (1x1) | 50 | 60 |

Schools at or above 120% enrollment are excluded from enrollment results.

### Stale Route Detection

Add `homeSchoolRouteStale: boolean` to the agent. Update `markRoutesStale` and `markRoutesStaleBatch` (both in `citizens.ts`) to also check school routes against the infrastructure change set. Update `replanStaleRoutes` in `citizenMonthlyTick` to replan school routes when stale — if the school is no longer reachable, clear the enrollment and re-enroll at the next available school.

### School Commute Traffic

`homeSchoolRoute` contributes to `trafficDensity` with weight 1 (same as commerce, since school trips are shorter/less frequent than work trips which use weight 2).

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

In `computeSatisfaction`, replace the current `educationNorm * 0.15 * w.education` (which reads from the now-removed coverage layer) with enrollment-based logic. The function signature needs two new parameters: `enrollmentCounts: Map<string, number>` and `educationFunding: number`.

```typescript
if (agent.schoolBuildingId !== null) {
  const commuteNorm = clamp(agent.homeSchoolRoute.length / MAX_SCHOOL_COMMUTE, 0, 1)
  const schoolQuality = getSchoolQuality(agent.schoolBuildingId, enrollmentCounts, educationFunding)
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
- `state.educationCoverage` argument in `updateDensity` call in `tick.ts`
- `educationCoverage` from `TileLayers` interface in `citizens.ts`
- `educationNorm` from `computeSatisfaction` (replaced by enrollment-based logic)
- Education factor from `computeCurrentQuality` in `reputation.ts` — revert weight renormalization back to 5 factors summing to 1.0 (remove `RAW_EDUCATION`, revert `TOTAL` to 1.0, remove `educationNorm` parameter)
- `educationCoverage` from both `computeReputation` callers: `monthlyTick` in `tick.ts` and `createEngineState` in `engine-state.ts`
- `calculateEducationCoverage` import from `engine-state.ts`
- `calculateEducationCoverage` export from `packages/engine/src/index.ts`
- `educationCoverage` tests in `education.test.ts` (replaced by enrollment tests)

**Note on desirability**: Education no longer affects tile-level desirability (zone fill rate). The presence of a nearby school does not make tiles more attractive at the zone-development level. Education's effect is purely through citizen satisfaction, which influences migration and reputation. This is intentional — desirability is about physical tile qualities (crime, pollution, parks), while education is a service residents actively use.

**Note on `influenceBuffer`**: stays on `EngineState` — still used by crime and fire coverage calculations.

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
- `restoreState` defaults: `schoolBuildingId: null`, `schoolAccessRoad: null`, `homeSchoolRoute: []`, `homeSchoolRouteStale: false` for old saves

## Overlay Repurpose

The education overlay (J key) changes from a coverage heatmap to a school catchment + capacity visualization.

### Data: `educationQuality: Uint8Array` tile layer

Computed during the citizen tick from enrollment data. The overlay renderer reads it like other layers.

Encoding:
- Value 0 = no residential children on this tile = skip (transparent)
- Value 1 = has children but no school enrollment = gray
- Value 2-255 = enrolled, mapped from quality: `Math.floor(quality * 253) + 2`

Add `educationQuality: Uint8Array` to `GameState`. Compute it in `getState()` or during the citizen tick. The overlay renderer decodes values back to colors:
- Value 1 → gray (unserved)
- Values 2-255 → green (high quality) to red (low quality) gradient

### Overlay renderer
Replace the current education case (which reads `educationCoverage`) with logic that reads `educationQuality` using the encoding above. Repurpose the color table or create a new one for the quality-based palette.

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
- Stale school route triggers re-enrollment

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

### New: overlay tests
- Tile with enrolled children shows quality-mapped value
- Tile with unenrolled children shows value 1 (gray)
- Tile with no children shows value 0 (transparent)

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
