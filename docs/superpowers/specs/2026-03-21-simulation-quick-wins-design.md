# Simulation Quick Wins — Design Spec

**Date:** 2026-03-21
**Milestone:** Simulation Tuning (post-Citizen Simulation)

## Goal

Nine small, high-impact changes to existing simulation systems. No new data model fields, no save version bump. Each change is localized to 1-2 files and builds on existing infrastructure.

## Research Basis

All changes derive from the mechanics roadmap (`research/mechanics-roadmap.md` Tier 1) and systems interaction map (`research/systems-interaction-map.md`), grounded in the urban planning and game design research collection.

---

## Batch A: Wire Up Existing Scaffolding

### 1. Pollution Propagation

**File:** New `packages/engine/src/simulation/pollution.ts`
**Integration:** Called in `Engine.ts` monthly tick, **before** `calculateLandValues` so the full chain (pollution → land value → crime) is coherent within a single tick.

The `pollutionLevel` Uint8Array exists. Building defs already have `pollutionRadius` and `pollutionAmount`. Desirability already reads `pollutionLevel` (`-0.30 × pollNorm`). Land value already penalizes it (`-0.5 × pollution`). The only missing piece is the propagation function.

**Algorithm:**
```
clearPollutionArray()
for each building with pollutionAmount > 0:
  for each tile within Manhattan distance ≤ pollutionRadius:
    dist = minManhattanDistToFootprint(tile, building)  // distance to nearest tile of building footprint
    contribution = pollutionAmount × max(0, 1 - dist / pollutionRadius)
    pollutionLevel[tile] += contribution  // additive across sources
clamp all values to [0, 255]
```

**Footprint-aware distance:** Multi-tile buildings (e.g., `ind.high` is 3×3, `power.coal` is 4×4) compute distance as the minimum Manhattan distance from the target tile to any tile in the building's footprint. This produces a symmetric pollution halo and is consistent with `BuildingIndex` which maps every footprint tile to its building.

**Building pollution values (from buildings-registry.ts):**
- `ind.low`: amount 10, radius 3
- `ind.med`: amount 20, radius 4
- `ind.med.b`: amount 24, radius 4
- `ind.high`: amount 40, radius 6
- `ind.high.b`: amount 48, radius 6
- `power.diesel`: amount 5, radius 2
- `power.coal`: amount 20, radius 6
- `power.nuclear`: amount 0, radius 0

**Effect chain:** Industrial/power buildings → pollutionLevel → land value penalty (-0.5/point) + residential desirability penalty (-0.30 × normalized) → lower fill rate → lower population → lower tax revenue.

**Research source:** `research/environment-and-sustainability.md` — Gaussian plume model simplified to linear decay for performance.

---

### 2. Park Distance Decay (Desirability)

**File:** `packages/engine/src/simulation/desirability.ts`
**Change:** Replace `hasParkNearby()` boolean with `parkDesirabilityBonus()` returning 0-0.25.

**Current (line 69):**
```ts
if (hasParkNearby(x, y, map, bldIdx)) score += RES_PARK_BONUS  // binary +0.25
```

**New:**
```ts
score += parkDesirabilityBonus(x, y, map, bldIdx)  // 0 to 0.25, decaying with distance
```

**New function:**
```ts
function parkDesirabilityBonus(x, y, map, bldIdx): number {
  let best = 0
  // scan PARK_RADIUS=5 Manhattan
  for each tile in Manhattan radius PARK_RADIUS:
    if park at tile:
      const bonus = RES_PARK_BONUS * (1 - dist / PARK_RADIUS)  // 0.25 at dist 0, 0.05 at dist 4, 0 at dist 5
      best = max(best, bonus)
  return best
}
```

Use `max` not `sum` — a tile near two parks gets the benefit of the closest one, not double credit. This matches the land value `parkBonus()` pattern but applied to desirability.

**Note:** Land value's `parkBonus()` in `land-value.ts` already uses distance decay (`10 - dist × 2`), so only the desirability system needs this change.

**Research source:** `research/urban-design-and-walkability.md` — amenity effects decay with distance.

---

### 3. Logistic Fill Deceleration

**File:** `packages/engine/src/simulation/density.ts`
**Change:** One-line modification to the fill rate calculation.

**Current (line 176-177):**
```ts
const rate = target > building.residents ? FILL_RATE : DRAIN_RATE
building.residents = Math.max(0, Math.min(def.capacity, building.residents + (target - building.residents) * rate))
```

**New:**
```ts
const occupancyRatio = def.capacity > 0 ? building.residents / def.capacity : 0
const effectiveFillRate = FILL_RATE * (1 - occupancyRatio)  // decelerates as building fills
const rate = target > building.residents ? effectiveFillRate : DRAIN_RATE
building.residents = Math.max(0, Math.min(def.capacity, building.residents + (target - building.residents) * rate))
```

**Effect:** At 0% occupancy, fill rate = 0.12 (unchanged). At 50%, fill rate = 0.06. At 90%, fill rate = 0.012. Last residents are hardest to attract — mirrors real housing absorption curves.

**Drain rate unchanged** — people leave at full speed regardless of occupancy.

**Research source:** `research/population-and-demographics.md` — logistic growth model.

---

## Batch B: Traffic Improvements

### 4. BPR Congestion-Weighted A*

**File:** `packages/engine/src/road-graph.ts`
**Change:** Pass `trafficDensity` to `astar()`, use it for edge costs.

**Current edge cost (line 68-69):**
```ts
const tentativeG = g + 1  // uniform cost
```

**New:**
```ts
const tentativeG = g + edgeCost(neighbor, trafficDensity)
```

**Edge cost function (BPR — Bureau of Public Roads, 1964):**
```ts
const TRAFFIC_CAPACITY = 100

function edgeCost(tile: number, trafficDensity?: Uint8Array): number {
  if (!trafficDensity) return 1
  const v = trafficDensity[tile]!
  const vc = v / TRAFFIC_CAPACITY  // volume-to-capacity ratio
  return 1 + 0.15 * Math.pow(vc, 4)  // BPR function
}
```

At 0 traffic: cost = 1.0 (baseline).
At 50% capacity: cost = 1.01 (negligible).
At 100% capacity: cost = 1.15 (15% penalty).
At 200% capacity: cost = 3.40 (heavy penalty).

**Heuristic admissibility:** Manhattan distance remains admissible since `edgeCost >= 1` always. The heuristic (Manhattan distance × 1) underestimates, which is correct for A*.

**Signature change:**
```ts
export function astar(
  graph: RoadGraph,
  start: number,
  goal: number,
  mapWidth: number,
  maxLength?: number,
  trafficDensity?: Uint8Array,  // new optional parameter
): number[] | null
```

**Integration:** `citizens.ts` passes the previous month's `trafficDensity` array when calling `astar()` for route replanning. First month (no traffic data) uses uniform costs.

**Call sites to update:** All functions in `citizens.ts` that call `astar()` need the `trafficDensity` parameter threaded through: `findNearestBuilding()`, `replanRoute()`, `createAgent()`, and `syncAgentsForBuilding()`. The `citizenMonthlyTick()` already receives `trafficDensity` — it just needs to forward it.

**Research source:** `research/transportation-and-traffic.md` — BPR function with α=0.15, β=4.

---

### 5. Variable Construction Time

**File:** `packages/engine/src/simulation/density.ts`
**Change:** Replace flat `2` in `startConstruction()` with density-based lookup.

**Current (line 302):**
```ts
building.constructionMonthsRemaining = 2
```

**New:**
```ts
const CONSTRUCTION_MONTHS: Record<number, number> = {
  [DensityLevel.Low]: 1,     // small buildings go up fast
  [DensityLevel.Medium]: 2,  // mid-rise takes a bit longer
  [DensityLevel.High]: 4,    // high-rise is a significant investment
}

function constructionTime(targetDefId: string): number {
  const def = BUILDING_DEFS[targetDefId]
  if (!def) return 2
  return CONSTRUCTION_MONTHS[def.density] ?? 2
}
```

Then in `startConstruction`:
```ts
building.constructionMonthsRemaining = constructionTime(targetDefId)
```

**Effect:** High-density development feels like a bigger commitment. Players see construction sites persist longer for skyscrapers, creating visual and temporal weight.

**Research source:** `research/real-estate-development.md` — construction timelines by building type.

---

### 6. LOS Traffic Overlay

**File:** Frontend overlay renderer (not engine — purely visual).
**Change:** Map traffic density values to Level of Service grades with distinct colors.

**LOS thresholds (from HCM):**

| Grade | v/c Ratio | trafficDensity Value | Color | Meaning |
|-------|-----------|---------------------|-------|---------|
| A | 0.00–0.35 | 0–35 | Green | Free flow |
| B | 0.35–0.54 | 35–54 | Light green | Stable flow |
| C | 0.54–0.77 | 54–77 | Yellow | Stable, restricted |
| D | 0.77–0.93 | 77–93 | Orange | Approaching unstable |
| E | 0.93–1.00 | 93–100 | Red | Unstable flow |
| F | 1.00+ | 100+ | Dark red | Forced flow / breakdown |

**This is a frontend-only change.** The engine already computes `trafficDensity` values. The overlay just needs to map them to colors instead of using a simple gradient.

**Research source:** `research/transportation-and-traffic.md` — Highway Capacity Manual LOS grades.

---

## Batch C: Economic and Desirability Tuning

### 7. Vacancy Rate Feedback

**File:** `packages/engine/src/simulation/demand.ts`
**Change:** Add vacancy rate computation and demand dampening.

**New code (after citizen signals, before clamp):**
```ts
// Vacancy rate feedback: high vacancy suppresses residential demand
const totalCapacity = sumResidentialCapacity(map)
const totalResidents = sumResidentialResidents(map)
const vacancy = totalCapacity > 0 ? 1 - totalResidents / totalCapacity : 0

if (vacancy > 0.08) {
  // Above 8% natural vacancy, dampen residential demand
  const vacancyPenalty = Math.min(0.5, (vacancy - 0.08) * 3)
  rDemand -= vacancyPenalty
}
```

**Helper functions:** `sumResidentialCapacity` and `sumResidentialResidents` iterate buildings and sum `def.capacity` and `building.residents` for residential buildings.

**Effect:** Prevents overbuilding. If player zones too much residential, vacancy rises above 8%, demand drops, and new development slows until existing buildings fill. Self-correcting feedback loop.

**Note:** Vacancy tracking is residential-only by design. Commercial/industrial buildings use `jobs` not `residents`/`capacity`, so vacancy is not meaningful for them.

**Research source:** `research/housing.md` — natural vacancy rate of 5-8%.

---

### 8. Zone Boundary Effects

**File:** `packages/engine/src/simulation/desirability.ts`
**Change:** Add zone-adjacency scan to `residentialDesirability()`.

**New constant and logic:**
```ts
const ZONE_BOUNDARY_RADIUS = 3
const COM_ADJACENCY_BONUS = 0.10    // commercial near residential = walkable services
const IND_ADJACENCY_PENALTY = 0.15  // industrial near residential = noise/pollution

function zoneBoundaryEffect(x, y, map, bldIdx): number {
  let effect = 0
  let hasCommercialNeighbor = false
  let hasIndustrialNeighbor = false

  for each tile in Manhattan radius ZONE_BOUNDARY_RADIUS:
    const b = bldIdx.get(tx, ty)
    if !b || b.state !== 'active': continue
    const def = BUILDING_DEFS[b.defId]
    if def.category === Commercial && !hasCommercialNeighbor:
      hasCommercialNeighbor = true
      effect += COM_ADJACENCY_BONUS
    if def.category === Industrial && !hasIndustrialNeighbor:
      hasIndustrialNeighbor = true
      effect -= IND_ADJACENCY_PENALTY

  return effect  // range: -0.15 to +0.10
}
```

**Note:** Checks actual buildings via `BuildingIndex`, not raw zone paint. This avoids penalizing residential desirability for empty industrial zones with no buildings yet. The pollution system (section 1) handles environmental impact from actual sources; this zone boundary effect handles the proximity/noise/traffic signal from operating businesses.
```

**Integrated into `residentialDesirability()`:**
```ts
score += zoneBoundaryEffect(x, y, map)
```

**Effect:** Players learn to buffer industrial zones from residential with commercial strips or parks — a real urban planning pattern. Mixed commercial-residential areas become more desirable.

**Research source:** `research/land-use-and-zoning.md` — zone compatibility and feedback loops.

---

### 9. Sprawl Penalty

**File:** `packages/engine/src/simulation/budget.ts`
**Change:** Compute sprawl ratio and apply maintenance multiplier.

**New code (in `calculateBudget`):**

Note: Change the existing `developedTileCount` to count actual footprint tiles (`def.size.w * def.size.h`) rather than buildings, so a 3×3 industrial building counts as 9 tiles of developed land, not 1. This better measures actual land consumption.

```ts
// Sprawl penalty: dispersed development costs more to maintain
const SPRAWL_THRESHOLD = 0.05  // 1 developed tile per 20 population is "compact"
const sprawlRatio = population > 0 ? developedTileCount / population : 0
const sprawlMultiplier = sprawlRatio > SPRAWL_THRESHOLD
  ? 1 + (sprawlRatio - SPRAWL_THRESHOLD) * 4  // linear increase above threshold
  : 1.0

maintenanceCosts.roads = Math.round(roadCount * MAINTENANCE.road * sprawlMultiplier + pavedRoadCount * MAINTENANCE.pavedRoadSurcharge * sprawlMultiplier)
```

Apply `sprawlMultiplier` to road and power line maintenance only (not building maintenance).

**Effect at various densities:**
- Compact city (50 pop, 2 developed tiles): ratio 0.04, multiplier 1.0x
- Moderate sprawl (50 pop, 5 tiles): ratio 0.10, multiplier 1.20x
- Heavy sprawl (50 pop, 10 tiles): ratio 0.20, multiplier 1.60x

**Effect:** Players who build dense pay less per capita for infrastructure. Players who sprawl face escalating costs. Mirrors the "growth Ponzi scheme" research.

**Research source:** `research/municipal-finance.md` — revenue per acre analysis, fiscal unsustainability of sprawl.

---

## Affected Files Summary

| File | Changes |
|------|---------|
| **New:** `simulation/pollution.ts` | Pollution propagation function |
| `Engine.ts` | Call `calculatePollution()` in monthly tick |
| `simulation/desirability.ts` | Park distance decay (2), zone boundary effects (8) |
| `simulation/density.ts` | Logistic fill (3), variable construction time (5) |
| `road-graph.ts` | BPR edge cost (4) — new `trafficDensity` param on `astar()` |
| `simulation/citizens.ts` | Pass `trafficDensity` to `astar()` calls (4) |
| `simulation/demand.ts` | Vacancy rate feedback (7) |
| `simulation/budget.ts` | Sprawl penalty (9) |
| Frontend overlay renderer | LOS color grades (6) |

## Out of Scope

- Save format changes (none needed)
- New building types
- UI panels or new overlays (LOS reuses existing traffic overlay)
- Any Tier 2+ features (road hierarchy, water/sewer, education, etc.)

## Testing Strategy

Each change can be tested independently:
- Pollution: verify propagation matches building defs; verify desirability/land-value respond
- Park decay: verify bonus decreases with distance
- Logistic fill: verify fill rate decreases as occupancy increases
- BPR routing: verify agents prefer uncongested routes
- Construction time: verify density-appropriate delays
- LOS: visual/snapshot test
- Vacancy: verify demand suppression above 8% vacancy
- Zone boundary: verify commercial bonus and industrial penalty
- Sprawl: verify multiplier scales with ratio
