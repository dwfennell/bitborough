# Citizen Simulation Depth — Feature Plan

## Overview

This milestone extends the existing citizen agent system with four interlocking features that add economic differentiation, population dynamics, a new service building, and progression gating. Together they transform the flat population model into one where citizens have economic identities, the city competes for migrants, education shapes desirability, and growth unlocks new capabilities.

**Current state:** Citizens are homogeneous agents with a home, a job route, a commerce route, and a scalar satisfaction score. Population growth is driven entirely by the RCI demand signal flowing into `FILL_RATE`. There is no wealth differentiation, no explicit migration model, no education service, and no population-gated unlocks.

**Research sources:**
- `research/population-and-demographics.md` -- migration (Harris-Todaro), wealth stratification, logistic growth
- `research/social-dynamics-and-segregation.md` -- Schelling model, Tiebout sorting, tier-weighted preferences
- `research/housing.md` -- filtering theory, affordability thresholds
- `research/mechanics-roadmap.md` -- items 2.5 (wealth tiers), 2.6 (migration), 2.2 (education), and the Citizen Depth dependency chain in section 7

---

## Dependency Order

Features must be implemented in this sequence because each builds on the previous:

```
1. Wealth Tiers
   └── 2. Education Service  (education coverage feeds into tier-weighted desirability)
       └── 3. Migration Model  (tier distribution of migrants depends on wealth tiers + city attractiveness)
           └── 4. Population Milestones  (unlock thresholds depend on migration-driven growth dynamics)
```

Education can technically be built in parallel with wealth tiers (it follows the existing police/fire pattern), but its desirability bonus becomes tier-differentiated once wealth tiers land, so implementing tiers first avoids rework.

Population milestones are implemented last because tuning unlock thresholds requires the growth dynamics from the migration model to be in place.

---

## Feature 1: Wealth Tiers

### Gameplay Purpose

Give citizens economic identity so that different neighborhoods attract different populations. Low-income citizens tolerate pollution and crime but are sensitive to housing cost and commute length. High-income citizens demand parks, low crime, fire coverage, and (later) education, but tolerate longer commutes and higher taxes. This creates spatial sorting -- an emergent Tiebout/Schelling dynamic where the player's infrastructure decisions shape which tiers settle where, and land value feedback reinforces the pattern.

### Data Model Changes

**`Citizen` interface** (in `citizens.ts`):

```typescript
export type WealthTier = 1 | 2 | 3  // 1=Low, 2=Mid, 3=High

export interface Citizen {
  // ... existing fields ...
  wealthTier: WealthTier
}
```

**`CitizenSummary`** (in `@bitborough/core`):

```typescript
export interface CitizenSummary {
  // ... existing fields ...
  tierCounts: [low: number, mid: number, high: number]
}
```

**No changes to `Building` or `BuildingDef`.** Tier affinity is computed dynamically from desirability factors, not stored on the building definition.

### Algorithm

**Tier assignment on agent creation:**

```
function assignWealthTier(rng: PRNG): WealthTier {
  const r = rng.next()
  if (r < 0.30) return 1      // 30% low-income
  if (r < 0.75) return 2      // 45% middle-income
  return 3                     // 25% high-income
}
```

Source: simplified from five-quintile distribution in `research/population-and-demographics.md` (Wealth and Income Stratification section). The 30/45/25 split maps Q1-Q2 to Low, Q3-Q4 to Mid, Q5 to High.

**Tier-weighted satisfaction:**

Each desirability/satisfaction factor is scaled by a per-tier weight before aggregation:

| Factor               | Low (tier 1) | Mid (tier 2) | High (tier 3) |
|----------------------|-------------|-------------|---------------|
| Crime penalty        | 0.8         | 1.0         | 1.4           |
| Pollution penalty    | 0.7         | 1.0         | 1.5           |
| Park bonus           | 0.5         | 1.0         | 1.3           |
| Fire coverage bonus  | 0.8         | 1.0         | 1.2           |
| Commute penalty      | 1.3         | 1.0         | 0.8           |
| Job match bonus      | 1.2         | 1.0         | 0.9           |
| Commerce access      | 0.9         | 1.0         | 1.1           |

Source: `research/social-dynamics-and-segregation.md`, "Proposed: Wealth Tiers for Citizens" table.

The satisfaction formula in `computeSatisfaction()` changes from a flat calculation to:

```
satisfaction(agent) =
  clamp(1.0
    - commutePenalty * 0.4 * TIER_WEIGHTS[agent.wealthTier].commute
    - jobPenalty * TIER_WEIGHTS[agent.wealthTier].jobMatch
    - commercePenalty * TIER_WEIGHTS[agent.wealthTier].commerce
    + environmentBonus(tile, agent.wealthTier)
  , 0, 1)
```

Where `environmentBonus` queries the desirability layers (crime, pollution, fire, parks) at the agent's home tile and applies tier weights.

**Tier-aware building fill targets:**

The existing fill/drain formula in `density.ts` uses:

```
target = capacity * max(0, demand) * desirability
```

This becomes tier-segmented. Each building computes a per-tier desirability score, and the fill target becomes a weighted sum reflecting which tiers the location attracts. High-desirability locations with parks and low crime fill preferentially with tier 3; industrial-adjacent locations fill with tier 1.

### Integration Points

| System | Change |
|--------|--------|
| `citizens.ts` -- `createAgent()` | Add `wealthTier` field via `assignWealthTier(rng)` |
| `citizens.ts` -- `computeSatisfaction()` | Apply tier-weighted factor scores |
| `citizens.ts` -- `computeCitizenSummary()` | Aggregate `tierCounts` |
| `desirability.ts` -- `computeDesirability()` | Accept optional `WealthTier` parameter; return tier-adjusted score |
| `demand.ts` | Use tier distribution from `CitizenSummary.tierCounts` to modulate R/C/I demand |
| Save/load | Serialize `wealthTier` on each agent; add `tierCounts` to summary |

### Key Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `TIER_DISTRIBUTION` | `[0.30, 0.45, 0.25]` | Simplified Pareto; research quintile mapping |
| `TIER_WEIGHTS` | See table above | From social-dynamics research, tuned for gameplay |
| `TIER_LABELS` | `['Low', 'Mid', 'High']` | UI display |

---

## Feature 2: Education Service

### Gameplay Purpose

Schools are the third radius-based service building (after police and fire). They boost residential desirability within their coverage area, making neighborhoods more attractive -- especially to mid and high-income tiers. This gives the player a new tool for shaping where population settles and creates a service cost trade-off: schools are expensive but raise land value and attract wealthier (higher-tax-value) residents.

Later, education coverage can feed into workforce quality, affecting commercial/industrial productivity. That extension is out of scope for this milestone.

### Data Model Changes

**New building definition** (in `buildings-registry.ts`):

```typescript
'service.school': {
  id: 'service.school',
  category: BuildingCategory.Special,
  density: DensityLevel.Low,
  size: { w: 3, h: 3 },          // same footprint as police/fire
  capacity: 0,
  jobs: 0,
  taxValue: 0,
  pollutionRadius: 0,
  pollutionAmount: 0,
  powerRequired: true,
  roadRequired: true,
  cost: 500,                      // from roadmap item 2.2
  maintenanceCost: 75,            // from roadmap item 2.2
}
```

**New simulation layer:**

```typescript
// In Engine.ts, alongside existing layers
educationCoverage: Float32Array   // per-tile 0.0-1.0, same pattern as fireCoverage
```

**New funding slider** (follows police/fire pattern):

```typescript
educationFunding: number  // 0-200, default 100
```

### Algorithm

Follows the exact pattern of `services/influence.ts` -- `buildInfluenceMap()`:

```
For each active 'service.school' building:
  effectiveRadius = SCHOOL_BASE_RADIUS * (educationFunding / 100)
  For each tile within effectiveRadius (Manhattan distance):
    dist = manhattan(tile, buildingCenter)
    influence = max(0, 1.0 - dist / effectiveRadius)
    educationCoverage[tile] = max(educationCoverage[tile], influence)
```

This is computed once per monthly tick, same as crime and fire.

**Desirability integration:**

In `residentialDesirability()`, add an education bonus term:

```
if (educationCoverage[idx] > SCHOOL_COVERAGE_THRESHOLD)
  score += SCHOOL_DESIRABILITY_BONUS * educationCoverage[idx]
```

With wealth tiers active, the education bonus is tier-weighted:

| Tier | Education weight |
|------|-----------------|
| Low  | 0.6             |
| Mid  | 1.2             |
| High | 1.5             |

Source: `research/social-dynamics-and-segregation.md` school quality weight table. High-income households are strongly attracted by school quality (Tiebout sorting); this is one of the strongest documented sorting mechanisms.

### Integration Points

| System | Change |
|--------|--------|
| `buildings-registry.ts` | Add `service.school` definition |
| `Engine.ts` | Allocate `educationCoverage` layer; call `computeEducation()` in monthly tick |
| New file: `simulation/services/education.ts` | `computeEducation()` using `buildInfluenceMap()` |
| `desirability.ts` -- `residentialDesirability()` | Add education coverage bonus term |
| `budget.ts` | Add `educationFunding` to service costs: `schoolCount * maintenanceCost * (educationFunding / 100)` |
| UI (toolbar) | Add school placement button; add education funding slider |
| Save/load | Persist `educationFunding` value |

### Key Constants

| Constant | Value | Source |
|----------|-------|--------|
| `SCHOOL_BASE_RADIUS` | 12 | Roadmap item 2.2; smaller than police/fire (15) since school catchment is tighter |
| `SCHOOL_BUILD_COST` | $500 | Roadmap item 2.2 |
| `SCHOOL_MAINTENANCE` | $75/mo | Roadmap item 2.2 |
| `SCHOOL_DESIRABILITY_BONUS` | 0.20 | Roadmap item 2.2; comparable to park bonus (0.25) but requires ongoing funding |
| `SCHOOL_COVERAGE_THRESHOLD` | 0.3 | Minimum influence level to trigger the bonus; prevents distant tiles from getting a free boost |

---

## Feature 3: Migration Model

### Gameplay Purpose

Currently population growth is implicit -- buildings fill at `FILL_RATE` when demand is positive. The migration model replaces this with an explicit flow: each month the city's attractiveness is evaluated against a baseline, producing a net migration number (positive = people moving in, negative = people leaving). This gives the player a visible feedback loop ("your city is attracting/losing N residents per month") and creates real consequences for neglecting services, overtaxing, or failing to provide jobs.

The migration signal also controls the wealth tier distribution of arrivals: attractive cities draw more high-income migrants; struggling cities lose high-income residents first (brain drain).

### Data Model Changes

**New fields on engine state:**

```typescript
// Tracked per month, exposed in GameState for UI
netMigration: number              // last month's net migration (positive = inflow)
cityAttractiveness: number        // 0.0-1.0 composite score
```

**No changes to `Citizen` or `Building`.** Migration affects the fill/drain rate of buildings, not the agent model directly.

### Algorithm

**Attractiveness computation** (Harris-Todaro inspired):

```
attractiveness =
    jobMatchRate       * 0.30    // 1 - unmatchedJobFraction
  + avgSatisfaction    * 0.25    // from citizen summary
  + serviceCoverage    * 0.20    // average of (police + fire + education) coverage fractions
  + taxCompetitiveness * 0.15    // 1.0 - (taxRate - 0.07) * 5.0, clamped 0-1
  + housingAvailability * 0.10   // 1 - (totalResidents / totalCapacity), clamped 0-1
```

Source: adapted from `research/population-and-demographics.md` Harris-Todaro section and roadmap item 2.6. The original roadmap formula `attractiveness = jobMatchRate * 0.6 + satisfaction * 0.4` is expanded to include services, tax, and housing signals for richer gameplay.

**Net migration calculation:**

```
baseline = 0.5                           // "average" city attractiveness
gap = attractiveness - baseline
migrationRate = gap * MIGRATION_SENSITIVITY
netMigration = round(migrationRate * totalPopulation)
```

When `netMigration > 0`: distribute incoming residents across under-capacity residential buildings, weighted by desirability. Prefer buildings matching the incoming tier distribution.

When `netMigration < 0`: drain residents from lowest-satisfaction buildings first. High-income agents leave before low-income agents (brain drain effect from `research/population-and-demographics.md`).

**Tier distribution of migrants:**

The base distribution (30/45/25) shifts based on attractiveness:

```
if attractiveness > 0.65:
  // Prosperous city attracts more high-income
  tierDist = [0.20, 0.40, 0.40]
else if attractiveness < 0.35:
  // Struggling city loses high-income, gains low-income
  tierDist = [0.50, 0.35, 0.15]
else:
  tierDist = [0.30, 0.45, 0.25]   // baseline
```

Linear interpolation between these brackets for smooth transitions.

**Integration with fill/drain:**

The existing fill/drain loop in `density.ts` is modified:

```
// Before (current):
target = capacity * max(0, demand) * desirability
residents += (target - residents) * FILL_RATE

// After:
target = capacity * max(0, demand) * desirability
naturalDelta = (target - residents) * FILL_RATE
migrationDelta = building's share of netMigration
residents += naturalDelta + migrationDelta
```

The `migrationDelta` distributes the city-wide `netMigration` across buildings proportionally to their available capacity and desirability, capped so no building exceeds capacity or drops below zero.

### Integration Points

| System | Change |
|--------|--------|
| New file: `simulation/migration.ts` | `computeAttractiveness()`, `computeNetMigration()`, `distributeMigration()` |
| `Engine.ts` -- monthly tick | Call migration computation after citizen tick; apply migration deltas to buildings |
| `density.ts` -- fill/drain loop | Incorporate `migrationDelta` alongside natural fill |
| `demand.ts` | Attractiveness feeds back into residential demand as a boost/penalty |
| `citizens.ts` -- `syncAgentsForBuilding()` | Already handles agent count changes when `building.residents` changes; no modification needed |
| UI | Display net migration and attractiveness on stats panel |
| Save/load | Persist `netMigration` and `cityAttractiveness` for UI continuity |

### Key Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `MIGRATION_SENSITIVITY` | 0.02 | From roadmap item 2.6; at max attractiveness (1.0), 1% of population migrates in per month |
| `ATTRACTIVENESS_BASELINE` | 0.5 | Neutral point; city must exceed this to attract migrants |
| `BRAIN_DRAIN_TIER_ORDER` | `[3, 2, 1]` | High-income leaves first during net outflow |
| `MAX_MONTHLY_MIGRATION_RATE` | 0.03 | Cap prevents population explosions; 3% of population per month max |
| `ATTRACTIVENESS_WEIGHTS` | `{ jobs: 0.30, satisfaction: 0.25, services: 0.20, tax: 0.15, housing: 0.10 }` | Tuned for gameplay; jobs weighted highest per Harris-Todaro |

---

## Feature 4: Population Milestones

### Gameplay Purpose

Gate advanced buildings and tools behind population thresholds to pace the game. Early-game players work with basic infrastructure; as the city grows, new options unlock. This prevents overwhelming new players with choices, rewards growth with tangible new capabilities, and creates natural "era" transitions that mark progression.

### Data Model Changes

**New type** (in `@bitborough/core`):

```typescript
export interface PopulationMilestone {
  population: number
  unlocks: string[]       // building defIds or tool keys unlocked at this threshold
  label: string           // display name for the milestone
}
```

**New field on `GameState`:**

```typescript
unlockedMilestones: number[]     // indices of milestones achieved (persisted)
```

**`BuildingDef` extension:**

```typescript
export interface BuildingDef {
  // ... existing fields ...
  requiredPopulation?: number    // if set, building is locked until city reaches this population
}
```

### Algorithm

**Milestone check** (run once per monthly tick):

```
for each milestone in MILESTONES:
  if totalPopulation >= milestone.population
     and milestone.index not in unlockedMilestones:
    unlockedMilestones.push(milestone.index)
    emit GameEvent('milestone_reached', milestone)
```

**Toolbar filtering:**

Buildings with `requiredPopulation > currentPopulation` are hidden or grayed out in the build toolbar. The milestone event triggers a notification toast so the player knows new options are available.

### Milestone Table

| Population | Unlocks | Rationale |
|-----------|---------|-----------|
| 0 (start) | Diesel plant, road, zone tools, park | Minimum viable city toolkit |
| 500 | Paved road, police station | Basic services needed once density pressure begins |
| 1,000 | Fire station, school | City large enough to need fire protection and education |
| 2,500 | Coal plant, transit stop | Power scaling and density anchoring for medium tier |
| 5,000 | Avenue (road hierarchy*) | Traffic management at scale |
| 10,000 | Hospital* | Large city service need |
| 25,000 | Highway (road hierarchy*) | Regional connectivity |
| 50,000 | Nuclear plant | Late-game clean power at scale |

*Items marked with asterisk are future buildings not yet in the game. Their milestone slots are defined now but remain inert until those buildings are implemented. The unlock system checks `BUILDING_DEFS[defId]` existence before surfacing in UI.

### Integration Points

| System | Change |
|--------|--------|
| `@bitborough/core` -- `state.ts` | Add `PopulationMilestone` type; add `unlockedMilestones` to `GameState` |
| New file: `simulation/milestones.ts` | `checkMilestones()` function; `MILESTONES` constant array |
| `Engine.ts` -- monthly tick | Call `checkMilestones()` after population update; emit events |
| `BuildingDef` | Add optional `requiredPopulation` field |
| `buildings-registry.ts` | Set `requiredPopulation` on gated buildings |
| UI (toolbar) | Filter/gray out locked buildings; show unlock toast on milestone events |
| Save/load | Persist `unlockedMilestones` array |

### Key Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `MILESTONES` | See table above | Tuned to match natural growth curve; early milestones close together, later ones spaced out |
| `MILESTONE_NOTIFICATION_DURATION` | 5000ms | Toast display time |

---

## Cross-Cutting Concerns

### Save/Load Compatibility

All four features add new fields to the persisted state. A save version bump (e.g., version N to N+1) is required. The migration function for old saves should:

- Default `wealthTier` to `2` (Mid) for all existing agents
- Default `educationFunding` to `100`
- Default `unlockedMilestones` to all milestones at or below the current population
- Default `netMigration` and `cityAttractiveness` to `0` and `0.5`

### Performance

Wealth tiers add no new per-tick computation -- the satisfaction formula changes from 3 terms to ~7 weighted terms, which is negligible. Education coverage uses the existing `buildInfluenceMap()` BFS, adding one more pass per tick (same cost as fire or crime). Migration adds a single O(buildings) pass per tick. Milestone checks are O(milestones) = O(1) per tick.

### Testing Strategy

Each feature gets its own test file following the existing pattern (`__tests__/`):

- `wealth-tiers.test.ts` -- tier assignment distribution, tier-weighted satisfaction, tier-aware desirability
- `education.test.ts` -- coverage radius, desirability bonus, funding scaling (mirrors `fire.test.ts`)
- `migration.test.ts` -- attractiveness computation, net migration sign and magnitude, tier distribution shift, fill/drain integration
- `milestones.test.ts` -- threshold detection, unlock persistence, event emission, toolbar filtering

### UI Summary

| Feature | UI Change |
|---------|-----------|
| Wealth Tiers | Tier breakdown in population panel; optional overlay showing dominant tier per tile |
| Education | School in build toolbar; education funding slider; education coverage overlay |
| Migration | Net migration readout on stats panel; attractiveness indicator |
| Milestones | Unlock toast notifications; locked/grayed items in toolbar; milestone log in stats |
