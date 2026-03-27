# Migration Model Design Spec

## Overview

Replace the existing simple satisfaction-threshold migration in `demographicTick()` with a multi-factor attractiveness model that modulates the fill rate, shifts immigrant wealth tier distributions, and implements brain drain mechanics for departing residents.

**Current state:** Demographics tick has basic immigration (satisfaction > 0.5) and emigration (< 0.4) proportional to working population. Fill/drain in `density.ts` targets `capacity × demand × desirability` at a flat `FILL_RATE = 0.12`. No city-wide attractiveness signal exists.

**After:** A monthly `computeAttractiveness()` produces a 0–1 composite score from five factors. This score modulates the fill rate (growth), shifts incoming migrant tier distribution, and drives tier-ordered brain drain (departures). The player sees the attractiveness score, factor breakdown, and net migration number.

---

## Attractiveness Computation

A new `computeAttractiveness()` function runs once per monthly tick, producing a 0–1 composite score from five factors:

```
attractiveness =
    jobMatchRate        × 0.30
  + avgSatisfaction     × 0.25
  + serviceCoverage     × 0.20
  + taxCompetitiveness  × 0.15
  + housingAvailability × 0.10
```

### Factor Definitions

| Factor | Source | Formula |
|--------|--------|---------|
| `jobMatchRate` | `CitizenSummary.unmatchedJobFraction` | `1 - unmatchedJobFraction` |
| `avgSatisfaction` | `CitizenSummary.avgSatisfaction` | Direct (already 0–1) |
| `serviceCoverage` | Police, fire, education layers | See formula below |
| `taxCompetitiveness` | `state.taxRate` | `clamp(1.0 - (taxRate - 0.07) × 5.0, 0, 1)` — neutral at 7%, zero at 27% |
| `housingAvailability` | Building occupancy | `clamp(1 - totalResidents / totalCapacity, 0, 1)` — full city = 0, empty = 1. When `totalCapacity = 0`, defaults to 1.0 |

**Service coverage formula:**

```
policeFrac = (residential tiles where crimeLevel < 128) / totalResidentialTiles
fireFrac   = (residential tiles where fireCoverage > 0) / totalResidentialTiles
eduFrac    = (residential tiles where educationQuality >= 2) / totalResidentialTiles

serviceCoverage = (
    policeFrac * (funding.police / 100) +
    fireFrac   * (funding.fire / 100) +
    eduFrac    * (funding.education / 100)
) / 3
```

Layer semantics: `crimeLevel` is inverted (high = bad), so police coverage is tiles *below* a threshold (128 = half-scale). `fireCoverage` is direct (high = covered). `educationQuality` uses encoded values where 0 = no children present, 1 = children but no school, 2–255 = quality-encoded; tiles with value >= 2 count as having education coverage.

When there are no residential tiles, `serviceCoverage` defaults to 0.5 (neutral).

**Tax double-counting note:** The demand system already uses the same tax formula to reduce building fill targets. Tax intentionally appears in both places — it suppresses *what buildings aim for* (via demand) and *how fast the city grows* (via attractiveness). This makes tax a strong lever, which is correct: overtaxing should visibly hurt.

**Housing availability stabilizer:** This factor acts as a negative-feedback stabilizer — a nearly-full city has low housing availability, which lowers attractiveness, which slows fill, which prevents overshoot. The demand system has a separate vacancy feedback loop that dampens demand when vacancy > 8% (above 100 pop). These two mechanisms are complementary: demand vacancy prevents overbuilding, housing availability prevents overfilling.

### Output

- `score: number` (0–1) stored on `EngineState.cityAttractiveness`
- `factors: AttractivenessFactors` — raw factor values (0–1 each) for UI breakdown

---

## Migration Modifier & Fill Rate Integration

The attractiveness score produces a `migrationModifier` that scales the fill rate in `density.ts`:

```
gap = attractiveness - ATTRACTIVENESS_BASELINE    // baseline = 0.5
migrationModifier = clamp(1.0 + gap × MIGRATION_SENSITIVITY, 0.5, 1.5)
```

With `MIGRATION_SENSITIVITY = 2.0`:
- Attractiveness 0.0 → modifier 0.5 (half fill speed)
- Attractiveness 0.5 → modifier 1.0 (unchanged)
- Attractiveness 1.0 → modifier 1.5 (50% faster fill)

In `updateDensity()`, the fill calculation changes from:

```
effectiveFillRate = FILL_RATE × (1 - occupancyRatio)
```

to:

```
effectiveFillRate = FILL_RATE × (1 - occupancyRatio) × migrationModifier
```

The drain rate is **not** modified — buildings above target still drain normally. Migration makes it easier/harder to grow but doesn't prevent decline in undesirable areas.

### Net Migration Tracking

`netMigration` is computed as:

```
netMigration = populationAfterAllPasses - populationBeforeDensity + deaths - births
```

This captures both fill-rate-driven growth and brain drain departures in one metric, stored on `EngineState` and surfaced via `CitizenSummary.netMigrationLastTick`.

The algebra: the tick sequence is density → demographics (births/deaths) → brain drain. Population changes from all three are interleaved. Adding back deaths and subtracting births isolates the migration-attributable delta. The implementation should snapshot population before the density pass and after the brain drain pass to compute this.

---

## Tier-Shifted Immigration

When the city is growing (net positive migration), the wealth tier distribution of new agents shifts based on attractiveness.

### Tier Distribution Brackets

| Attractiveness | Low (T1) | Mid (T2) | High (T3) |
|---------------|----------|----------|-----------|
| < 0.35 (struggling) | 0.50 | 0.35 | 0.15 |
| 0.35–0.65 (baseline) | 0.30 | 0.45 | 0.25 |
| > 0.65 (prosperous) | 0.20 | 0.40 | 0.40 |

Linear interpolation between bracket midpoints for smooth transitions:

```
Anchor points: 0.0 → STRUGGLING, 0.5 → BASELINE, 1.0 → PROSPEROUS

For attractiveness in [0.0, 0.5]:
  t = attractiveness / 0.5
  dist = lerp(STRUGGLING, BASELINE, t)

For attractiveness in [0.5, 1.0]:
  t = (attractiveness - 0.5) / 0.5
  dist = lerp(BASELINE, PROSPEROUS, t)
```

At exactly 0.5, distribution equals BASELINE. At 0.25, it's halfway between STRUGGLING and BASELINE.

### Integration with Agent Creation

`sampleWealthTier(prng, reputation)` currently uses building-local reputation to bias tier selection. The city-wide attractiveness tier shift acts as a prior that adjusts the base weights before reputation modifies them:

```
baseWeights = interpolateTierDist(attractiveness)
// then reputation further biases within these weights
```

A prosperous city's high-reputation neighborhoods become strongly tier-3, while low-reputation areas still lean tier-1 — but the overall city mix shifts wealthier.

`sampleWealthTier()` gains an optional `tierDistOverride: [number, number, number]` parameter. When provided, it replaces the hardcoded `TIER_DISTRIBUTION` base weights. The existing reputation modifiers (`(1.5 - reputation)` for tier 1, `(0.5 + reputation)` for tier 3) continue to apply on top of the overridden base weights.

---

## Brain Drain (Tier-Ordered Emigration)

When attractiveness drops below a threshold, a brain drain pass runs after density fill/drain and agent sync.

### Trigger

`attractiveness < BRAIN_DRAIN_THRESHOLD (0.4)`

The 0.4–0.5 range is a buffer zone where the city experiences neither brain drain nor accelerated growth. The fill rate modifier at 0.4 is 0.8 (below-baseline but nonzero), so buildings still fill slowly — but no agents are forcibly removed. Brain drain only starts below 0.4.

### Departure Rate

```
drainGap = BRAIN_DRAIN_THRESHOLD - attractiveness    // 0 to 0.4
departureRate = drainGap × BRAIN_DRAIN_RATE × totalPopulation
```

With `BRAIN_DRAIN_RATE = 0.04`, a city at attractiveness 0.2 (gap of 0.2) loses `0.2 × 0.04 × pop = 0.8%` of population per month. Capped at `MAX_MONTHLY_DRAIN_RATE = 0.016` (1.6% of population — matches worst-case uncapped rate at attractiveness 0.0).

Brain drain is disabled when `totalPopulation < BRAIN_DRAIN_MIN_POP (100)`. Small cities shouldn't experience punitive tier-3 departures — the mechanic is designed for mid-to-late game feedback.

### Tier Ordering

Departures are selected from agents sorted by:
1. **Tier 3 first**, then tier 2, then tier 1
2. Within each tier, **lowest satisfaction first**

Collect all agents, sort by `(tier DESC, satisfaction ASC)`, remove from the front of the list until the departure count is met.

**Removal mechanics:** Brain drain decrements `building.residents` directly (by `samplingRatio` per removed agent), then the subsequent agent sync pass in the tick reconciles agent counts. Brain drain does NOT remove agents itself — it only adjusts `building.residents` downward, and agent sync handles the actual agent removal. This keeps the agent lifecycle in one place.

---

## Replacing Existing Migration in Demographics

### Remove from `demographicTick()`

- Immigration block (satisfaction > 0.5 → add residents)
- Emigration block (satisfaction < 0.4 → remove residents)

### Keep in `demographicTick()`

- Aging (children → working → elderly)
- Deaths (elderly)
- Births (from working population)

### New migration lives in two places

1. **Fill rate modulation** — in `density.ts`, attractiveness modifier on fill rate (growth side)
2. **Brain drain pass** — new `applyBrainDrain()` function called in monthly tick after agent sync (departure side)

---

## Monthly Tick Order

Updated sequence with migration additions marked:

1. Increment month/year
2. Rebuild derived state (power, pollution, land value, crime, fire coverage)
3. Calculate demand
4. **Compute attractiveness** ← new
5. Update fires
6. Compute reputation
7. Citizen monthly tick (routes, enrollment, satisfaction)
8. Update zones and density ← **fill rate now uses migration modifier**
9. Sync agents
10. Demographics tick (aging, births, deaths only — **migration removed**)
11. **Brain drain pass** ← new
12. Sync agents again
13. Education quality overlay
14. Budget, loans, history

---

## Data Model Changes

### New Type

```typescript
interface AttractivenessFactors {
  jobMatchRate: number        // 0–1, raw factor value
  avgSatisfaction: number     // 0–1, raw factor value
  serviceCoverage: number     // 0–1, raw factor value
  taxCompetitiveness: number  // 0–1, raw factor value
  housingAvailability: number // 0–1, raw factor value
}
```

### New Fields on `EngineState`

```typescript
cityAttractiveness: number              // 0.0–1.0, computed monthly
attractivenessFactors: AttractivenessFactors  // breakdown for UI
```

### Changes to `GameState` (Public API)

```typescript
cityAttractiveness: number
attractivenessFactors: AttractivenessFactors
netMigration: number   // top-level for convenience (also in CitizenSummary)
```

### Changes to `CitizenSummary`

- `netMigrationLastTick` — already exists, computation method changes

### No changes to `Building` or `Citizen`

Tier-shifted immigration modifies inputs to `sampleWealthTier()`. Brain drain removes agents through the existing removal path.

### Save/Load Migration

Old saves default:
- `cityAttractiveness` → `0.5`
- `attractivenessFactors` → all fields `0.5`
- `netMigration` → `0`

---

## File Structure

### New File

**`packages/engine/src/simulation/migration.ts`**

```typescript
computeAttractiveness(
  summary: CitizenSummary,
  map: GameMap,
  taxRate: number,
  funding: { police: number, fire: number, education: number },
  crimeLevel: Uint8Array,
  fireCoverage: Uint8Array,
  educationQuality: Uint8Array
): { score: number, factors: AttractivenessFactors }

computeMigrationModifier(attractiveness: number): number

computeMigrantTierDistribution(attractiveness: number): [number, number, number]

applyBrainDrain(
  attractiveness: number,
  registry: CitizenRegistry,
  map: GameMap,
  prng: PRNG
): { departures: number, buildingDeltas: Map<string, number> }
```

`applyBrainDrain` returns a map of building ID → resident count decrements. The caller applies these to `building.residents` before the subsequent agent sync pass.

### Modified Files

| File | Change |
|------|--------|
| `simulation/density.ts` — `updateDensity()` | Accept `migrationModifier` param, multiply into fill rate |
| `simulation/demographics.ts` — `demographicTick()` | Remove immigration/emigration blocks, keep aging/births/deaths |
| `simulation/wealth-tiers.ts` — `sampleWealthTier()` | Accept optional `tierDistOverride` from migration tier shift |
| `simulation/citizens.ts` — `syncAgentsForBuilding()` | Thread `tierDistOverride` through to `sampleWealthTier()` calls |
| `simulation/citizens.ts` — `syncResidentialAgents()` | Accept and pass `tierDistOverride` to `syncAgentsForBuilding()` |
| `simulation/tick.ts` — `monthlyTick()` | Add attractiveness computation, pass modifier to density, compute tier dist, thread to agent sync, add brain drain pass |
| `engine-state.ts` | Add `cityAttractiveness` and `attractivenessFactors` fields, init defaults |
| `Engine.ts` | Expose new fields in `GameState` |
| `packages/core/src/state.ts` | Add `AttractivenessFactors` type, add fields to `GameState` |

### Test File

**`packages/engine/src/__tests__/migration.test.ts`**

Covers: attractiveness computation from factor inputs, migration modifier clamping range, tier distribution interpolation across attractiveness range, brain drain tier ordering and rate capping, integration with fill/drain.

---

## Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `ATTRACTIVENESS_BASELINE` | 0.5 | Neutral point — city must exceed to attract growth |
| `ATTRACTIVENESS_WEIGHTS` | `{ jobs: 0.30, satisfaction: 0.25, services: 0.20, tax: 0.15, housing: 0.10 }` | Jobs weighted highest per Harris-Todaro; matches citizen depth plan |
| `MIGRATION_SENSITIVITY` | 2.0 | Maps ±0.5 attractiveness gap to ±1.0 modifier range |
| `MIGRATION_MODIFIER_MIN` | 0.5 | Floor — even terrible cities don't completely stop filling |
| `MIGRATION_MODIFIER_MAX` | 1.5 | Cap — prevents runaway growth |
| `BRAIN_DRAIN_THRESHOLD` | 0.4 | Emigration starts below this; 0.4–0.5 is neutral band |
| `BRAIN_DRAIN_RATE` | 0.04 | Departure count = gap × rate × population |
| `MAX_MONTHLY_DRAIN_RATE` | 0.016 | Cap at 1.6% of population per month (matches worst-case uncapped rate) |
| `BRAIN_DRAIN_MIN_POP` | 100 | Disable brain drain below this population |
| `TIER_DIST_STRUGGLING` | `[0.50, 0.35, 0.15]` | At attractiveness < 0.35 |
| `TIER_DIST_BASELINE` | `[0.30, 0.45, 0.25]` | At attractiveness 0.35–0.65 |
| `TIER_DIST_PROSPEROUS` | `[0.20, 0.40, 0.40]` | At attractiveness > 0.65 |
| `TAX_NEUTRAL_RATE` | 0.07 | 7% tax = no penalty/bonus |
