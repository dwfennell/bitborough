# Infrastructure Expansion Milestone — Design

## Overview

Three interconnected infrastructure features that deepen the simulation's mid-game and create long-term city management challenges:

1. **Water/Sewer System** — A second utility network modeled after the existing power BFS, gating desirability and density progression.
2. **Road Hierarchy** — Three road types (local road, avenue, highway) with differing capacities, speeds, and costs, integrating with the BPR congestion model.
3. **Infrastructure Aging** — All placed infrastructure and buildings track condition over time. Quadratic decay raises maintenance costs and eventually causes failures.

Together these form a cohesive milestone: water/sewer gives the player a new system to build and manage, road hierarchy gives them strategic choices about transportation investment, and aging ensures that all infrastructure demands ongoing attention rather than being fire-and-forget.

### Research Sources

| Feature | Primary Research | Roadmap Items |
|---------|-----------------|---------------|
| Water/Sewer | `research/utilities-and-infrastructure.md` (Water Supply, Wastewater and Sewer, Application to Bitborough) | 2.9 |
| Road Hierarchy | `research/transportation-and-traffic.md` (Road Hierarchy, Congestion Modeling, Application to Bitborough) | 2.1 |
| Infrastructure Aging | `research/utilities-and-infrastructure.md` (Infrastructure Lifecycle, Infrastructure Costs) | 2.10 |

### Dependency Order

```
1. Road Hierarchy          (no dependencies on other features in this milestone)
2. Water/Sewer System      (no hard dependency, but benefits from road hierarchy
                            since roads are water/sewer conductors)
3. Infrastructure Aging    (depends on both above — needs road types and pipe
                            types to assign lifespans)
```

Road hierarchy should land first because it modifies the `Infrastructure` enum and road graph, which water/sewer propagation and aging both reference. Water/sewer second because it introduces pipe infrastructure that aging needs to track. Aging last because it layers on top of all existing and newly added infrastructure types.

---

## Feature 1: Water/Sewer System

### Gameplay Purpose

Water and sewer service is a second utility network the player must build alongside power. Buildings without water/sewer have sharply reduced desirability and are capped at Low density. Medium and High density require water/sewer connection as a hard prerequisite (paralleling how paved roads gate Medium and transit stops gate High). This creates a natural investment curve: early cities run on power + dirt roads, then the player invests in water/sewer to unlock growth.

### Data Model Changes

**New building definitions** (in `buildings-registry.ts`):

| Building | `defId` | Size | Cost | Maintenance | Capacity (pop) |
|----------|---------|------|------|-------------|-----------------|
| Water Tower | `water.tower` | 2x2 | $400 | $20/mo | 500 |
| Water Treatment Plant | `water.treatment` | 4x4 | $2,500 | $80/mo | 5,000 |
| Sewage Treatment Plant | `sewer.treatment` | 4x4 | $2,000 | $60/mo | 5,000 |

These follow the existing `BuildingDef` interface. Category: `BuildingCategory.Special`. No pollution for water buildings; sewage treatment plant gets `pollutionRadius: 3, pollutionAmount: 8` (mild odor).

**New infrastructure bits** (in `core/infrastructure.ts`):

```typescript
export enum Infrastructure {
  None       = 0,
  Road       = 1 << 0,
  PowerLine  = 1 << 1,
  Rail       = 1 << 2,
  WaterPipe  = 1 << 3,   // NEW
  PavedRoad  = 1 << 4,
  SewerPipe  = 1 << 5,   // NEW
}
```

`WaterPipe` uses the available bit 3. `SewerPipe` uses bit 5 (bit 4 is `PavedRoad`). Both fit within the existing `Uint16Array` infrastructure layer (16 bits available).

**New constants** (in `core/constants.ts`):

```typescript
export const COSTS = {
  // ...existing
  waterPipe: 8,
  sewerPipe: 8,
  waterTower: 400,
  waterTreatment: 2_500,
  sewerTreatment: 2_000,
}

export const MAINTENANCE = {
  // ...existing
  waterPipe: 0.5,
  sewerPipe: 0.5,
  waterTower: 20,
  waterTreatment: 80,
  sewerTreatment: 60,
}

export const WATER = {
  towerCapacity: 500,         // population served
  treatmentCapacity: 5_000,   // population served
  perCapita: 1,               // 1 unit per resident
}

export const SEWER = {
  treatmentCapacity: 5_000,   // population served
  perCapita: 0.7,             // 70% of water consumption
}
```

**New simulation layers** (in `Engine.ts`):

```typescript
private waterGrid: Uint8Array    // 0 = no water, 1 = water service
private sewerGrid: Uint8Array    // 0 = no sewer, 1 = sewer service
```

Exposed in `GameState` alongside `powerGrid`.

### Algorithm

Water and sewer each use BFS propagation mirroring `simulation/power.ts`, with these differences:

**Source identification**: Instead of power plants, find water towers/treatment plants (for water) and sewage treatment plants (for sewer). Each has a population-based capacity rather than a tile-based capacity.

**Conductor rules**: Water/sewer propagate through:
- `Infrastructure.WaterPipe` / `Infrastructure.SewerPipe` (dedicated pipes)
- `Infrastructure.Road` (any road type — pipes run under roads)
- Building footprint tiles (buildings connect to adjacent pipes/roads)

Water/sewer do NOT propagate through bare zoned tiles or power lines. This is stricter than power propagation and reflects the physical requirement for pipes.

**Capacity accounting**: Instead of decrementing per tile reached, capacity is decremented per population served. When the BFS reaches a residential building tile, it consumes `building.residents * WATER.perCapita` from remaining capacity. Non-residential buildings consume a flat 5 units per building (commercial water use). If remaining capacity hits zero, the BFS stops expanding but already-reached tiles retain service.

**New file**: `simulation/water.ts`

```
propagateWater(map, waterGrid, bldIdx): void
propagateSewer(map, sewerGrid, bldIdx): void
```

Both called every tick (same as `propagatePower`), or potentially every monthly tick since water/sewer networks change less frequently than power demand. Monthly is sufficient and cheaper.

### Integration Points

**Desirability** (`simulation/desirability.ts`): Add water/sewer as a desirability factor for residential zones:
- No water service: -0.25 desirability penalty
- No sewer service: -0.15 desirability penalty
- Both connected: no penalty (baseline)

This makes water/sewer not strictly required for Low density but severely punishing without it.

**Density progression** (`simulation/density.ts`): Add water+sewer connection as a hard prerequisite for Medium and High density upgrades. This sits alongside the existing paved road (Medium) and transit stop (High) requirements.

**Budget** (`simulation/budget.ts`): Water/sewer pipe maintenance and building maintenance added to infrastructure costs. Same pattern as existing road/power line accounting.

**Demand** (`simulation/demand.ts`): Water/sewer coverage ratio (fraction of population served) could provide a small demand bonus when high (>80%) — cities with good infrastructure attract residents.

**Land value** (`simulation/land-value.ts`): Water/sewer connection adds a small land value bonus (+5 per tile), reflecting the real premium serviced land commands.

### Key Parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Water tower capacity | 500 pop | Affordable early-game option; one tower serves ~50 low-density houses |
| Treatment plant capacity | 5,000 pop | Mid-game scaling; matches nuclear plant as a "big investment" |
| Pipe cost | $8/tile | Slightly cheaper than road ($10) since pipes have no surface maintenance |
| Desirability penalty (no water) | -0.25 | Significant but survivable; makes water a strong incentive, not a gate for Low |
| Desirability penalty (no sewer) | -0.15 | Sewer slightly less impactful than water on livability |
| Sewer per-capita ratio | 0.7 | Standard 70% of water consumption becomes wastewater |

---

## Feature 2: Road Hierarchy

### Gameplay Purpose

Three road types give the player strategic choices about transportation investment. Local roads are cheap and sufficient for low-density neighborhoods. Avenues handle medium traffic corridors. Highways move high volumes but generate noise penalties and act as barriers to pedestrian movement. Combined with BPR-weighted routing (existing or added alongside), road hierarchy makes traffic management a genuine optimization problem rather than "paint roads everywhere."

### Data Model Changes

**Infrastructure enum changes** (in `core/infrastructure.ts`):

```typescript
export enum Infrastructure {
  None       = 0,
  Road       = 1 << 0,      // local road (base type)
  PowerLine  = 1 << 1,
  Rail       = 1 << 2,
  WaterPipe  = 1 << 3,
  PavedRoad  = 1 << 4,      // existing upgrade flag
  SewerPipe  = 1 << 5,
  Avenue     = 1 << 6,      // NEW: avenue upgrade (Road | Avenue)
  Highway    = 1 << 7,      // NEW: highway upgrade (Road | Highway)
}
```

Avenue and Highway are upgrade flags that combine with `Road`, just as `PavedRoad` does. A tile with an avenue has `Road | PavedRoad | Avenue`. A highway has `Road | PavedRoad | Highway`. Both are always paved. This preserves backward compatibility — any code checking `Infrastructure.Road` still matches all road types.

**Road type properties** (new constant block in `core/constants.ts`):

```typescript
export const ROAD_TYPES = {
  local: {
    capacity: 50,
    speedFactor: 1.0,       // base edge cost multiplier
    buildCost: 10,           // existing COSTS.road
    maintenanceCost: 1,      // existing MAINTENANCE.road
    noiseRadius: 0,
    barrierPenalty: 0,
  },
  avenue: {
    capacity: 150,
    speedFactor: 0.8,       // 20% faster traversal
    buildCost: 40,
    maintenanceCost: 3,
    noiseRadius: 0,
    barrierPenalty: 0,
  },
  highway: {
    capacity: 400,
    speedFactor: 0.5,       // 50% faster traversal
    buildCost: 100,
    maintenanceCost: 6,
    noiseRadius: 3,          // noise affects residential desirability within 3 tiles
    barrierPenalty: 0.15,    // reduces pedestrian walkability / desirability nearby
  },
} as const
```

**Per-tile capacity layer**: The existing `trafficDensity: Uint8Array` stores traffic volume per tile. Road type determines the capacity denominator for the v/c ratio. No new layer needed — capacity is derived from the infrastructure bits on each tile.

**New cost/maintenance entries** (in `core/constants.ts`):

```typescript
export const COSTS = {
  // ...existing
  avenue: 40,
  highway: 100,
}

export const MAINTENANCE = {
  // ...existing
  avenue: 3,
  highway: 6,
}
```

### Algorithm

**Placement**: Avenues and highways are placed as upgrades to existing roads (same UX as paved road upgrade). The player selects a road tile and upgrades it. Avenue requires the tile already be a paved road. Highway requires a paved road. Downgrading is done by bulldozing and rebuilding.

**Road graph edge weights** (`road-graph.ts`): The road graph currently uses uniform edge weight of 1. With road hierarchy, the base edge weight for a tile becomes `ROAD_TYPES[type].speedFactor`. Lower speed factor = faster traversal = lower cost. This interacts with BPR congestion weighting:

```
edge_cost(tile) = speedFactor * (1 + alpha * (volume / capacity) ^ beta)
```

Where `alpha = 0.15`, `beta = 4` (standard BPR parameters). A highway tile at 50% capacity costs `0.5 * (1 + 0.15 * 0.5^4) = 0.505` — much cheaper to traverse than a local road at 50% capacity (`1.0 * 1.009 = 1.009`). This naturally routes traffic onto higher-capacity roads.

**Traffic density computation** (`simulation/citizens.ts`): No change to how agents write to `trafficDensity`. The existing per-tile volume accounting works as-is. The capacity value used for v/c ratio calculation comes from the road type lookup.

**Noise penalty**: Highway tiles emit noise in a radius of 3 tiles. This is computed during the land value / desirability pass. Residential desirability within the noise radius takes a `-0.15` penalty per adjacent highway tile (diminishing with distance). This prevents players from running highways through residential neighborhoods without cost.

**Connection visuals**: Avenue and highway tiles use the existing `ConnectionMask` system for rendering but need new tile graphics (wider road appearance). The connection logic in `connections.ts` does not change — avenues and highways connect to adjacent road tiles of any type.

### Integration Points

**A* pathfinding** (`road-graph.ts`): `astar()` accepts a cost function or references the infrastructure layer to determine `speedFactor` and `capacity` per tile. The Manhattan distance heuristic remains admissible since `speedFactor >= 0.5` (minimum edge cost is 0.5, and Manhattan distance assumes cost 1.0 per tile).

Wait — admissibility requires `h(n) <= true_cost(n, goal)`. If edges can cost 0.5, then Manhattan distance (assuming cost 1.0 per step) overestimates by up to 2x, making the heuristic inadmissible. The heuristic must be scaled: `h(n) = manhattan_distance * min_speed_factor` where `min_speed_factor = 0.5` (highway). This preserves optimality.

**Budget** (`simulation/budget.ts`): Avenue and highway tiles incur their own maintenance rate. The budget loop already iterates infrastructure tiles — it needs to check for Avenue/Highway flags in addition to Road/PavedRoad.

**Desirability** (`simulation/desirability.ts`): Highway noise penalty applied during the residential desirability calculation. Scan for highway tiles within `noiseRadius` of each residential building.

**Density progression** (`simulation/density.ts`): The existing paved road requirement for Medium density is satisfied by avenues and highways (both include `PavedRoad`). No change needed.

**Demand** (`simulation/demand.ts`): Road capacity expansion could feed into a mild induced demand boost (Tier 3 mechanic 3.5), but this is not part of the core road hierarchy feature.

### Key Parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Local road capacity | 50 | Matches research: 100-400 veh/hr/lane scaled for game tile units |
| Avenue capacity | 150 | 3x local; handles collector/minor arterial traffic |
| Highway capacity | 400 | 8x local; handles arterial/freeway volumes |
| Highway noise radius | 3 tiles | Meaningful but not devastating; real highway noise extends ~300m |
| Highway barrier penalty | -0.15 desirability | Discourages routing highways through residential cores |
| BPR alpha | 0.15 | Standard BPR default |
| BPR beta | 4.0 | Standard BPR default; steep congestion curve past capacity |
| Heuristic scale factor | 0.5 | `min(speedFactor)` to keep A* admissible |

---

## Feature 3: Infrastructure Aging

### Gameplay Purpose

Infrastructure aging creates a long-term financial management challenge. Currently, all infrastructure is permanent once placed — the player never needs to revisit or maintain existing systems. Aging introduces a condition-based maintenance cost multiplier and eventual failure, forcing the player to budget for ongoing replacement. This mirrors the real-world municipal infrastructure trap where deferred maintenance leads to exponentially higher reconstruction costs.

### Data Model Changes

**Per-tile age tracking**: A new `Uint16Array` on `GameMap` stores the age (in months) of each infrastructure tile:

```typescript
export interface GameMap {
  // ...existing fields
  infrastructureAge: Uint16Array   // NEW: months since placement, per tile
}
```

`Uint16Array` supports values 0-65535, which is 5,461 years — more than sufficient. Tiles with no infrastructure have age 0.

**Building age**: The `Building` interface already has an `age: number` field (months since placed). This is already incremented somewhere in the simulation. Infrastructure aging extends the same concept to per-tile infrastructure.

**Lifespan constants** (in `core/constants.ts`):

```typescript
export const LIFESPANS = {
  road: 240,           // 20 years
  pavedRoad: 240,      // 20 years (surface layer)
  avenue: 240,         // 20 years
  highway: 180,        // 15 years (heavier traffic = faster degradation)
  powerLine: 480,      // 40 years
  waterPipe: 600,      // 50 years
  sewerPipe: 600,      // 50 years
  rail: 360,           // 30 years
} as const

export const BUILDING_LIFESPANS: Record<string, number> = {
  'power.diesel': 360,    // 30 years
  'power.coal': 480,      // 40 years
  'power.nuclear': 720,   // 60 years
  'water.tower': 480,     // 40 years
  'water.treatment': 480, // 40 years
  'sewer.treatment': 480, // 40 years
  'service.police': 600,  // 50 years
  'service.fire': 600,    // 50 years
  'transit.stop': 480,    // 40 years
}
```

Zone buildings (residential, commercial, industrial) use the existing `Building.age` field. Their effective lifespan varies by density: Low = 360 months (30 years), Medium = 480 months (40 years), High = 600 months (50 years).

**Condition formula**:

```typescript
function getCondition(ageMonths: number, lifespanMonths: number): number {
  const t = Math.min(ageMonths / lifespanMonths, 1.0)
  return Math.round(100 * (1 - t * t))  // k=2 quadratic decay
}
```

This produces the "hockey stick" deterioration curve from the research: infrastructure holds up well for roughly 60-70% of its lifespan, then condition drops sharply. At half-life (t=0.5), condition is 75. At 80% of lifespan (t=0.8), condition is 36. At end of life (t=1.0), condition is 0.

**Repair action**: The player can repair infrastructure tiles and buildings. Repair resets age to a fraction of the original (not zero — repaired infrastructure does not last as long as new):

```typescript
function repairAge(currentAge: number, lifespanMonths: number): number {
  // Repair restores to 25% of lifespan age (condition ~94)
  return Math.round(lifespanMonths * 0.25)
}
```

Repair cost scales with how degraded the infrastructure is:

```typescript
function repairCost(baseCost: number, condition: number): number {
  // Cheaper to repair early, expensive to repair late
  // At condition 75: cost = baseCost * 0.3
  // At condition 50: cost = baseCost * 0.5
  // At condition 25: cost = baseCost * 0.8
  return Math.round(baseCost * (1 - condition / 100) * 1.1)
}
```

This captures the FHWA principle: every $1 of preventive maintenance avoids $4-8 in reconstruction.

### Algorithm

**Age increment** (monthly tick in `Engine.ts`): After all other monthly systems, increment age for every tile that has infrastructure:

```
for each tile with infrastructure bits set:
  infrastructureAge[tile] += 1
for each building:
  building.age += 1   // already happens in existing code
```

**Maintenance cost multiplier** (`simulation/budget.ts`): When computing infrastructure maintenance costs, apply a condition-based multiplier:

```
condition = getCondition(age, lifespan)
if condition >= 50: multiplier = 1.0
if condition 25-49: multiplier = 1.5
if condition < 25:  multiplier = 2.5
```

This means a road at condition 30 costs 1.5x normal maintenance, and at condition 15 costs 2.5x. The player is incentivized to repair before condition drops below 25.

**Service disruption** (monthly tick): Infrastructure with condition < 25 has a chance of temporary failure each month:

```
failureChance = (25 - condition) / 100   // max 25% at condition 0
```

For power lines, failure means the tile stops conducting power (treated as if the power line were removed for that tick's propagation). For water/sewer pipes, same — stops conducting water/sewer. For roads, failure means the tile is impassable for that month's routing (agents re-route around it). These failures are temporary and self-heal next month, but they signal to the player that replacement is needed.

**Complete failure**: When `condition = 0` (age >= lifespan), the infrastructure does not auto-destroy. Instead, it enters a permanent failure state where it no longer functions (does not conduct power, water, sewer, or allow traffic) until repaired or bulldozed and rebuilt. Repair at condition 0 costs the full original build cost (effectively reconstruction).

**Building aging effects**: Buildings already have the `age` field. With this feature, building age affects:
- Maintenance cost: same multiplier as infrastructure (applied to `BuildingDef.maintenanceCost`)
- Power plant capacity: plants below condition 50 operate at `condition / 50` fraction of rated capacity (a coal plant at condition 30 produces only 60% of its 700-tile capacity)
- Zone building desirability: minor effect — `effective_desirability *= max(0.7, condition / 100)` (a building at condition 50 has 70% of base desirability; at condition 100, no penalty)

### Integration Points

**Engine.ts (tick sequence)**: Age increment runs at the end of the monthly tick, after all other systems. The condition-based effects are read by other systems (budget, power propagation, desirability) during their normal execution using the age values from the previous month.

**Power propagation** (`simulation/power.ts`): `findPowerPlants` applies the capacity reduction for aged plants. The BFS capacity parameter becomes `Math.round(ratedCapacity * Math.max(0, condition / 50))` when condition < 50.

**Water/sewer propagation** (`simulation/water.ts`): Same capacity reduction for aged water/sewer treatment plants.

**Budget** (`simulation/budget.ts`): The maintenance loop applies the condition multiplier when summing per-tile and per-building maintenance costs.

**Desirability**: Building condition feeds into desirability as a mild modifier.

**Serialize/restore** (`Engine.ts`): `infrastructureAge` must be included in `SaveFile`. Increment save file version.

**UI**: A new "infrastructure condition" overlay showing per-tile condition as a color gradient (green = good, yellow = fair, red = poor). This gives the player visibility into where maintenance is needed.

### Key Parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Decay exponent (k) | 2 | Quadratic — matches real-world "hockey stick" pattern from research |
| Road lifespan | 240 months (20 years) | Matches real asphalt surface life (15-20 years) |
| Power line lifespan | 480 months (40 years) | Real overhead lines: 40-70 years; game-compressed |
| Water/sewer pipe lifespan | 600 months (50 years) | Real: 75-100 years; game-compressed |
| Maintenance multiplier (cond 25-49) | 1.5x | Encourages early repair without being punishing |
| Maintenance multiplier (cond < 25) | 2.5x | Painful enough to motivate replacement |
| Failure chance (cond < 25) | (25 - cond) / 100 | Gradual escalation, max 25% per month at condition 0 |
| Repair cost ratio | `(1 - cond/100) * 1.1 * baseCost` | Early repair cheap, late repair expensive |
| Plant capacity reduction | `cond/50` below condition 50 | Plants produce less as they age past half-life |

---

## Cross-Cutting Concerns

### Save File Migration

All three features add data to `GameMap` and `GameState`:
- `infrastructureAge: Uint16Array` (new map layer)
- `waterGrid`, `sewerGrid` in game state (derived, not saved — recomputed on load like `powerGrid`)
- New `Infrastructure` enum values (backward compatible — old saves have 0 in new bit positions)
- New building defs (backward compatible — old saves never reference them)
- Save file version bump from 5 to 6

Migration for v5 saves: initialize `infrastructureAge` to all zeros (existing infrastructure starts as "new"). This is generous to the player but avoids a jarring mass-failure event on loading an old save.

### Budget Display

The budget panel needs to show:
- Water/sewer maintenance as a separate line item
- Road maintenance broken down by road type
- An "infrastructure condition" summary (average condition across all placed infrastructure)
- Aging surcharge amount (difference between base maintenance and condition-adjusted maintenance)

### Performance

Water/sewer BFS runs monthly (not every tick), limiting cost. Infrastructure aging is a single pass over the map once per month. The condition multiplier lookup in budget is O(tiles) but that loop already exists. No significant performance concern.

### New Player Actions

| Action | Input | Cost | Effect |
|--------|-------|------|--------|
| Place water pipe | Click tile | $8 | Sets `WaterPipe` bit |
| Place sewer pipe | Click tile | $8 | Sets `SewerPipe` bit |
| Place water tower | Click tile | $400 | 2x2 building, 500 pop capacity |
| Place water treatment plant | Click tile | $2,500 | 4x4 building, 5,000 pop capacity |
| Place sewage treatment plant | Click tile | $2,000 | 4x4 building, 5,000 pop capacity |
| Upgrade road to avenue | Click road tile | $40 | Sets `Avenue` bit; requires paved road |
| Upgrade road to highway | Click road tile | $100 | Sets `Highway` bit; requires paved road |
| Repair infrastructure | Click tile | Variable | Resets age; cost based on current condition |
| Repair building | Click building | Variable | Resets building age; cost based on condition |
