# Population Capacity & Desirability System

**Date:** 2026-03-12
**Status:** Approved
**Phase 2 placeholder:** land value + education + wealth stratification (not in scope here)

---

## Problem

Buildings currently add their full population to the city total the moment they become active. Growth feels instant and mechanical — there is no reason to build services, no spatial differentiation between a well-run neighbourhood and a neglected one, and nothing stopping a player from placing two skyscrapers and calling it a city.

---

## Goal

- Buildings have a **capacity** (max residents) and an **actual residents** count that fills gradually
- Fill rate is driven by two independent signals: city-wide **demand** and local **desirability**
- Desirability is **zone-type-specific**: residential cares about safety and greenspace; commercial cares about transit and foot traffic; industrial only cares about road and power
- Density upgrades require an entire **neighbourhood** to be near-full, not just one building
- Dereliction becomes a consequence of sustained low occupancy rather than an instant event on infrastructure removal
- All existing tests updated; new tests cover every new behaviour

---

## Data Model Changes

### `BuildingDef` (packages/core/src/buildings.ts)

Rename `population` → `capacity`. It now means the maximum number of residents the building can hold.

```ts
interface BuildingDef {
  capacity: number   // was: population
  // jobs field unchanged
}
```

**Note:** `capacity: 0` on commercial and industrial `BuildingDef` entries means "no residents" — these buildings are skipped by the fill/drain loop. They still contribute to commercial desirability (foot traffic) and industrial gameplay but are not population-bearing.

### `Building` (packages/core/src/buildings.ts)

```ts
interface Building {
  residents: number           // actual current occupancy, 0–def.capacity; new buildings start at 0
  lowOccupancyMonths?: number // months below 10% capacity; undefined when healthy
}
```

### `buildings-registry.ts`

Rename every `population:` key to `capacity:`. Also update every reference in `density.ts` — there are eight+ call sites. Two of them require semantic changes beyond a simple rename:

- **`tickConstruction` return value:** currently `return newDef.population - check.consumedPop`. Under the new model the completed building starts at `residents = 0`, and consumed buildings lose their *actual* residents (not their capacity). Change to: `return -(check.consumedPop)` where `consumedPop` is the sum of `b.residents` of consumed buildings (not `def.capacity`).
- **`checkFootprintForUpgrade`'s `consumedPop`:** currently accumulates `bDef.population`. Change to accumulate `b.residents` instead.

All other `def.population` → `def.capacity` renames are straightforward.

### Save format

`SaveFile.version` bumped from `1` to `2`. `Engine.restore()` branches on version:
- v1 saves: `building.residents` is missing → default to `def.capacity` (treat as already full)
- v2 saves: `building.residents` is taken as-is

### `state.population`

On restore, population is **recomputed** as `Σ b.residents` over all active buildings — this is always correct regardless of version and avoids any incremental-delta inconsistency on first tick. After restore, population is maintained incrementally each month as `Σ(residents after) − Σ(residents before)` for the buildings processed that tick.

---

## Demand (partially changed)

City-wide signal per zone type, range 0–1. Computed by `calculateDemand()`.

**One change:** commercial demand currently uses `population` (actual residents). This creates an early-game deadlock: `residents = 0` → `cDemand = 0` → no commercial buildings → no foot-traffic bonus → commercial desirability capped → commercial stays empty forever.

Fix: commercial and industrial demand formulas use **total residential capacity** (`Σ def.capacity` over all residential buildings) instead of actual resident count. Demand represents planning intent, not current headcount.

The existing denominator `population / 200` must be recalibrated. Since total capacity ≥ actual population, saturating at `0.6` would happen too early. New formula: `Math.min(totalResidentialCapacity / 500, 0.6)`. The constant `500` is a named tunable (`COMMERCIAL_DEMAND_CAPACITY_DIVISOR`). `calculateDemand` already receives `map` so it can compute the sum by iterating `map.buildings`.

**`mediumRadius(population)`** continues to use actual `state.population` (sum of residents), not capacity. It measures how mature/large the city has grown, not how much zoned capacity exists. No signature change.

---

## Desirability (new — `packages/engine/src/simulation/desirability.ts`)

```ts
export function computeDesirability(
  zone: ZoneType,
  x: number, y: number,
  map: GameMap,
  powerGrid: Uint8Array,
  crimeLevel: Uint8Array,
  fireCoverage: Uint8Array,
  pollutionLevel: Uint8Array,
): number
```

**Infrastructure gate:** if the tile lacks power OR road access, returns `0` immediately regardless of all other factors. This is a hard gate, not a weighted input.

**Pollution prerequisite:** `pollutionLevel` is currently allocated but not written during the tick. Until pollution propagation is wired up, `pollutionLevel` will be all-zero — the penalty never fires. This is acceptable for the initial implementation; pollution wiring is tracked separately. Desirability reads the array directly; when pollution is wired, the penalty activates automatically.

### Residential desirability (with infrastructure present)

| Factor | Formula | Max contribution |
|--------|---------|-----------------|
| Infrastructure baseline | constant `0.30` when gate passes | 0.30 |
| Safety | `(1 − crimeNorm) × 0.30` | 0.30 |
| Fire coverage | `fireCoverage[tile] ? 0.15 : 0` | 0.15 |
| Park within 5 tiles | `0.25` if any `special.park` building within Manhattan distance 5 | 0.25 |
| Pollution penalty | `−pollutionNorm × 0.30` | −0.30 |

Weights sum: `0.30 + 0.30 + 0.15 + 0.25 = 1.00` at perfect conditions, zero pollution.
Result is clamped to `[0, 1]`.

Examples:
- Early city (infra only, no services, no pollution): `0.30 + 0 + 0 + 0 = 0.30` → fills to 30% × demand
- Police + fire coverage, no crime, no park, no pollution: `0.30 + 0.30 + 0.15 = 0.75`
- Full services + park: `1.00` → fills to 100% × demand
- Heavy industrial pollution nearby (norm ≈ 0.7): `1.00 − 0.21 = 0.79`

### Commercial desirability (with infrastructure present)

| Factor | Formula | Max contribution |
|--------|---------|-----------------|
| Infrastructure baseline | constant `0.40` | 0.40 |
| Transit stop within 10 tiles | `0.35` if any active `transit.stop` within Manhattan distance 10 | 0.35 |
| Residential density nearby | `0.25` if ≥ 3 active residential buildings within 5 tiles | 0.25 |

Sum: `0.40 + 0.35 + 0.25 = 1.00`. Without transit, max is `0.65`.
Commercial ignores pollution and crime.

### Industrial desirability (with infrastructure present)

| Factor | Formula | Max contribution |
|--------|---------|-----------------|
| Road access | `0.50` | 0.50 |
| Power | `0.50` | 0.50 |

Sum: `1.00`. Both are required by the gate anyway; this effectively means industrial is always `1.0` when infra is present, `0` otherwise.

> All weights are initial values. Expose as named constants (e.g. `RES_SAFETY_WEIGHT = 0.30`) to make tuning easy without touching logic.

---

## Fill Mechanics (monthly, in `density.ts`)

Applied to every active zone building with `def.capacity > 0`:

```
targetResidents = def.capacity × demand × desirability

if targetResidents > residents:
  residents += (targetResidents − residents) × FILL_RATE    // 0.12
else:
  residents += (targetResidents − residents) × DRAIN_RATE   // 0.20

residents = clamp(residents, 0, def.capacity)
```

**FILL_RATE = 0.12/month** — empty building at full desirability reaches ~70% in 10 months, ~95% in 24 months.
**DRAIN_RATE = 0.20/month** — building that loses all desirability empties ~65% in 6 months.

Draining is faster than filling. Special buildings are skipped entirely.

---

## Density Upgrade Triggers

Replace the global `MEDIUM_DENSITY_POP_THRESHOLD = 500` gate (this constant is removed). The global population check is deleted from `updateDensity`.

| Transition | Required conditions |
|-----------|---------------------|
| Low → Medium | `occupancy ≥ 0.80` AND `neighbourhoodAvgOccupancy ≥ 0.75` AND paved road within 3 tiles |
| Medium → High | `occupancy ≥ 0.85` AND `hasCriticalMass` AND transit stop within 10 tiles |

where `occupancy = building.residents / def.capacity`.

**`neighbourhoodAvgOccupancy(radius, building)`** = mean `residents / capacity` of all active zone buildings within `radius` tiles (Manhattan distance), **excluding the building under evaluation**. If there are zero qualifying neighbours, returns `0` — upgrade is blocked. This prevents any isolated building from ever upgrading regardless of how full it is.

The existing `upgradeProb` exponential decay formula is retained — upgrades remain probabilistic once the gate passes.

---

## Dereliction (unified path)

**`checkDereliction` is retired entirely** — both the mark-derelict and recover-from-derelict branches. Infrastructure removal sets desirability to `0`, which engages the drain rate. No building goes derelict instantly.

New unified rule: when `residents < 0.10 × def.capacity` for **3 consecutive months**, the building goes derelict. Tracked by `building.lowOccupancyMonths`:

- Incremented each month the building is below threshold
- Set to `undefined` when `residents ≥ 0.10 × capacity` for any month — this is also the recovery path. Infrastructure restored → desirability recovers → residents fill back above 10% → `lowOccupancyMonths` resets. No separate recovery check is needed.
- When it reaches `3`: call `startConstruction(building, downgradeTarget)` — building begins downgrade as before

On going derelict, `populationDelta -= building.residents` (actual residents, not `def.capacity`). `building.residents` is set to `0`.

**Low-density derelict recovery:** `tickDerelict`'s branch for buildings already at lowest density (no downgrade target) currently returns them to `active` with `+currentPop`. Under the new model, return them to `active` with `residents = 0` and no population delta — let the fill loop restore their occupancy naturally over the following months.

This replaces `checkDereliction` in `density.ts` and removes both `checkDereliction` calls from `Engine.ts` (post-bulldoze and monthly).

---

## Files Changed

| File | Change |
|------|--------|
| `packages/core/src/buildings.ts` | `population → capacity` on `BuildingDef`; add `residents`, `lowOccupancyMonths` to `Building` |
| `packages/engine/src/buildings-registry.ts` | All `population:` → `capacity:` |
| `packages/engine/src/simulation/desirability.ts` | **New file** — `computeDesirability()` per zone type |
| `packages/engine/src/simulation/density.ts` | All `def.population` / `bDef.population` refs → `def.capacity`; add fill/drain loop; replace upgrade gate; replace dereliction with occupancy path; remove `checkDereliction`; remove `MEDIUM_DENSITY_POP_THRESHOLD` |
| `packages/engine/src/simulation/zones.ts` | New buildings start with `residents: 0`; remove `populationDelta += def.population` on creation |
| `packages/engine/src/simulation/demand.ts` | Commercial/industrial demand uses total residential capacity, not `state.population` |
| `packages/engine/src/Engine.ts` | Pass simulation layers into `updateDensity`; recompute population as `Σ b.residents` on restore; remove `checkDereliction` call; bump save version to 2; add restore version branch |
| `packages/engine/src/index.ts` | Export `computeDesirability` |
| `packages/game/src/ui/InfoBar.ts` | Show occupancy % alongside population |
| `packages/docs/src/index.ts` | Update growth/density reference text |

---

## Tests

### New: `desirability.test.ts`
- Infrastructure gate: no power → `0`; no road → `0`; both present → non-zero
- Residential: each factor in isolation (crime at max → low score; fire coverage → +0.15; park nearby → +0.25; pollution at max → penalty)
- Residential: all factors perfect, no pollution → `1.0`
- Commercial: transit bonus (+0.35); residential density bonus (+0.25); no transit → exactly `0.65`; no transit and no neighbours → `0.40`
- Industrial: road + power → `1.0`; missing road → `0`
- `neighbourhoodAvgOccupancy`: zero neighbours returns `0`; excludes self; correct mean across multiple neighbours

### Updated: `density.test.ts`
- Remove `population >= 500` threshold tests; replace with occupancy-based gate tests
- Fill rate: building at `residents = 0`, `demand = 1`, `desirability = 1` → after 1 month `residents ≈ capacity × 0.12`
- Drain rate: building at full capacity, desirability drops to `0` → drains faster than fill rate
- Neighbourhood gate: single full building with no neighbours → upgrade blocked (`neighbourhoodAvgOccupancy = 0`)
- Neighbourhood gate: full neighbourhood (4+ buildings all at 90%+) → upgrade allowed
- Dereliction: `lowOccupancyMonths` increments monthly below threshold; resets to `undefined` on recovery; goes derelict after 3 months
- `populationDelta` on dereliction = `−building.residents` not `−def.capacity`
- `checkDereliction` is removed — test that bulldozing paved road does NOT instantly derelict medium buildings

### Updated: `zones.test.ts`
- New buildings start with `residents = 0`
- Population does not jump on zone development tick

### Updated: `integration.test.ts`
- No density upgrades in first 6 months (buildings need time to fill)
- Dense neighbourhood achieves upgrades after ~24 simulated months with correct services
- Industrial pollution prevents residential from filling near it (once pollution layer is wired)

### Updated: `serialization.test.ts`
- v1 save (no `residents` field) loads and defaults `residents = capacity`
- v2 save preserves exact `residents` values
- Population after restore equals `Σ b.residents`

---

## Docs (packages/docs)

Update the "How growth works" section:
- Buildings fill gradually over months based on desirability × demand
- Services (police, fire) and parks improve residential fill rate
- Transit drives commercial desirability; commercial also needs nearby residents
- Industrial pollution suppresses nearby residential desirability
- Density upgrades require the whole neighbourhood to be near-full — one full building in an empty area cannot upgrade

---

## Phase 2 (out of scope)

- **Land value** as a spatial intermediary: services → land value → fill rate multiplier
- **Wealth stratification**: R$ tolerates pollution/crime; R$$$ demands parks and clean air
- **Education**: time-lagged effect on residential desirability
- **Pollution propagation**: wire up `pollutionLevel` in the monthly tick so the penalty in residential desirability becomes active
