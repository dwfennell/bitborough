# Citizen Simulation — Design Spec

**Date:** 2026-03-14
**Phase:** Milestone 9, Phase 1

---

## Overview

Replace the abstract traffic and demand calculations with a population of representative citizen agents. Each agent tracks a home building, a workplace, and a commerce destination, along with cached road routes between them. Traffic emerges from real commute paths; demand signals emerge from unmet needs.

---

## Scope

**In scope:**
- Citizen agents: home, work, commerce, cached routes
- A\* road routing with incremental cache invalidation
- Monthly traffic contribution from agent routes (replaces `calculateTraffic()`)
- Demand signal adjustments driven by commute length, job access, commerce access
- Commercial foot traffic counter
- Save/load serialization of `CitizenRegistry`

**Out of scope (deferred):**
- Lifecycle: birth, aging, death, migration
- Job market: wages, unemployment, skill levels
- Schools and education (noted for future Milestone 9 sub-feature)
- Economic depth: supply chains, property market

---

## Data Model

### `Citizen`

```ts
interface Citizen {
  id: string
  homeBuildingId: string
  workBuildingId: string | null         // null if no reachable job
  commerceBuildingId: string | null     // null if no reachable commercial building
  homeAccessRoad: number                // road tile index adjacent to home building
  workAccessRoad: number | null         // road tile index adjacent to work building
  commerceAccessRoad: number | null     // road tile index adjacent to commerce building
  homeWorkRoute: number[]               // road tile indices from homeAccessRoad → workAccessRoad
                                        // empty [] when workBuildingId is null
  homeCommerceRoute: number[]           // road tile indices from homeAccessRoad → commerceAccessRoad
                                        // empty [] when commerceBuildingId is null
  homeWorkRouteTileSet: Set<number>     // same tiles as homeWorkRoute, for O(1) invalidation
  homeCommerceRouteTileSet: Set<number>
  homeWorkRouteStale: boolean
  homeCommerceRouteStale: boolean
  satisfaction: number                  // 0–1
}
```

`homeWorkRouteTileSet` and `homeCommerceRouteTileSet` are runtime-only; they are **not serialized**. They are rebuilt from the route arrays when a save file is loaded.

### `CitizenRegistry`

The registry is held **privately by `Engine`** — it does not live in `GameState`. This avoids bloating the public state surface with large agent arrays. A derived `CitizenSummary` (average satisfaction, unmatched counts) is computed monthly and placed in `GameState` for UI consumption.

```ts
interface CitizenRegistry {
  agents: Citizen[]
  samplingRatio: number   // 1 agent per N residents; default 50
}

interface CitizenSummary {
  agentCount: number
  avgSatisfaction: number     // 0–1, average across all agents
  unmatchedJobFraction: number      // 0–1, fraction with no job
  unmatchedCommerceFraction: number // 0–1, fraction with no commerce
  avgCommuteLengthTiles: number
}
```

`CitizenSummary` is added to `GameState`.

---

## Access Road Resolution

The "access road" for a building is the road tile adjacent to any tile in the building's footprint. Resolution rule:

> Scan every tile `(bx, by)` in the building footprint `[x, x+w-1] × [y, y+h-1]`. For each footprint tile, check its four cardinal neighbors. Return the **first** road tile found (scan order: N→E→S→W, footprint scan order: row-major). If no adjacent road exists, the building is inaccessible and cannot be used for assignment.

The resolved `accessRoad` tile index is stored on the agent at spawn time and does not change unless the building is demolished.

---

## Road Graph

A dedicated `RoadGraph` is built and maintained incrementally alongside the map. It is an adjacency list keyed by tile index, containing only road tiles (both dirt and paved — upgrades do not change graph topology). It is updated by `updateRoadGraph(map, x, y)` — the same call pattern as `updateConnections()` — whenever a road tile is placed or demolished.

Paved road upgrades (dirt → paved) do not change graph topology and do not require invalidation.

This structure lives in `packages/engine/src` and is passed into citizen simulation functions. It is **not** stored in `GameState` — it is reconstructed from the map on load (cheap, O(road tiles)). It must be updated from both `placeTile()` (road placement) and `bulldoze()` (road demolition), alongside the existing `updateConnections()` call in each.

```ts
type RoadGraph = Map<number, number[]>  // tileIndex → [neighborTileIndex, ...]
```

---

## Spawning & Assignment

### Spawn

Called monthly when a residential building's `residents` count changes:

```
agentsNeeded = floor(residents / samplingRatio)
agentsExisting = agents assigned to this building
delta = agentsNeeded - agentsExisting
```

If `delta > 0`: create `delta` new agents, assign job and commerce.
If `delta < 0`: remove `|delta|` agents from this building.

When a residential building is **demolished**, all agents assigned to it are removed entirely (not just scaled down). The `footTrafficByBuilding` map must be updated to decrement counts for any commercial buildings those agents pointed to.

### Job Assignment

For each new agent, run A\* from `homeAccessRoad` to the nearest road-accessible `active` building where `BUILDING_DEFS[building.defId].jobs > 0`. Greedy nearest-first — no capacity tracking in this phase. (Industrial and commercial buildings typically have `jobs > 0`; residential and most special buildings do not.)

If no job is reachable within `MAX_ROUTE_LENGTH` tiles (default 60), `workBuildingId` and `workAccessRoad` are null, and `homeWorkRoute` is `[]`.

### Commerce Assignment

Same as job assignment, but targets the nearest `active` building with `BUILDING_DEFS[building.defId].category === BuildingCategory.Commercial`. If none reachable, `commerceBuildingId` and `commerceAccessRoad` are null, and `homeCommerceRoute` is `[]`.

---

## Route Caching & Invalidation

### A\* Implementation

Standard A\* on `RoadGraph`. Heuristic: Manhattan distance. Returns ordered list of road tile indices from source access road to destination access road. Cost: 1 per tile.

Routes are stored as both an array (for traffic contribution) and a `Set<number>` (for O(1) invalidation lookups). On load, the `Set` is reconstructed from the array.

### Invalidation

When a road tile at index `t` is placed or demolished:

```
for each agent in registry:
  if agent.homeWorkRouteTileSet.has(t):
    agent.homeWorkRouteStale = true
  if agent.homeCommerceRouteTileSet.has(t):
    agent.homeCommerceRouteStale = true
```

Stale routes are replanned in the monthly tick's replan pass. If the route can no longer be completed (path broken), `workBuildingId` / `commerceBuildingId` is set to null and routes are set to `[]`.

---

## Monthly Simulation Tick

The citizen sim runs **in place of `calculateTraffic()`** in the Engine's existing monthly step order. This preserves the one-month lag: `calculateDemand()` runs first (using last month's `trafficDensity`), then the citizen tick updates `trafficDensity` for next month's demand.

Existing Engine monthly call order (relevant portion):
```
calculateDemand()       ← uses trafficDensity from previous month (unchanged)
calculateLandValues()
calculateCrime()
calculateFireCoverage()
updateFires()
citizenSim.monthlyTick()  ← replaces calculateTraffic() here
updateZones()
updateDensity()
```

### Pass 1 — Route Replan

Iterate all agents with stale routes and recompute via A\*. All stale routes are replanned synchronously within the monthly tick. At expected city scales (≤1,000 agents, rare topology changes) this is fast. If a mass-demolition event stales all routes (worst case: ~1,000 agents × O(5,000 tiles) A\*), this could take ~60M operations. This worst case is accepted for now given its rarity; a future opt-in spreading mechanism (replan N per tick) can be added if profiling shows it is a problem.

### Pass 2 — Traffic Contribution

Reset a temporary `rawTraffic: Float64Array` (same size as map) to zero. For each agent:
- Walk `homeWorkRoute` — increment each tile by `WORK_TRIP_WEIGHT` (default 2)
- Walk `homeCommerceRoute` — increment each tile by `COMMERCE_TRIP_WEIGHT` (default 1)

After all agents, write to `trafficDensity`:

```
trafficDensity[i] = min(255, floor(rawTraffic[i] * samplingRatio))
```

Multiplying by `samplingRatio` scales back from representative agents to real population. The result is in "person-trips per tile," which is numerically compatible with the existing `TRAFFIC_CAPACITY = 100` congestion threshold in `demand.ts` — a tile with 100 person-trips is "at capacity," matching the intent of the existing constant.

Example: 4 agents (representing 200 people at ratio 50) each contributing weight 2 → rawTraffic = 8 → scaled = 8 × 50 = 400, clamped to 255.

This output replaces `calculateTraffic()` entirely. The downstream `computeAverageCongestion()` in `demand.ts` is unchanged.

### Commercial Foot Traffic

After assignment changes (spawn or demolish), recompute a `footTrafficByBuilding: Map<string, number>` — a map from commercial building ID to the count of agents whose `commerceBuildingId` points to it. This map is held privately by the Engine alongside `CitizenRegistry`. It is available for future economic depth calculations.

---

## Demand Signal Changes

`calculateDemand()` gains a new optional `CitizenSummary` parameter:

```ts
function calculateDemand(
  map: GameMap,
  taxRate: number,
  trafficDensity?: Uint8Array,
  citizens?: CitizenSummary
): DemandInfo
```

When `citizens` is provided, three additional adjustments apply:

| Signal | Effect |
|---|---|
| `avgCommuteLengthTiles > 30` | Suppresses residential demand proportionally (max 0.3 penalty at 60+ tiles) |
| `unmatchedJobFraction` | Boosts industrial and commercial demand by up to +0.3 |
| `unmatchedCommerceFraction` | Boosts commercial demand by up to +0.2 |

The existing congestion suppression from `computeAverageCongestion()` is retained — it now uses real agent-derived traffic.

---

## Satisfaction

Per-agent satisfaction is computed after each monthly tick:

```
commutePenalty  = clamp(homeWorkRoute.length / MAX_ROUTE_LENGTH, 0, 1)
                  (0 when homeWorkRoute is [], i.e., no job assigned)
jobPenalty      = workBuildingId === null ? 0.5 : 0
commercePenalty = commerceBuildingId === null ? 0.3 : 0
satisfaction    = clamp(1 - commutePenalty * 0.4 - jobPenalty - commercePenalty, 0, 1)
```

`CitizenSummary.avgSatisfaction` is the mean across all agents, updated each month.

---

## Save / Load

`CitizenRegistry` is serialized in `SaveFile.state.citizens`. Routes are serialized as plain `number[]` arrays. `TileSet` fields are rebuilt from route arrays on load by `buildTileSets(agent)`. Save file version bumps to 5.

```ts
SaveFile.state.citizens?: {
  samplingRatio: number
  agents: Array<{
    id: string
    homeBuildingId: string
    homeAccessRoad: number
    workBuildingId: string | null
    workAccessRoad: number | null
    commerceBuildingId: string | null
    commerceAccessRoad: number | null
    homeWorkRoute: number[]
    homeCommerceRoute: number[]
    satisfaction: number
  }>
}
```

Optional field for backwards compatibility — missing `citizens` block is treated as empty registry. On load, `homeWorkRouteStale` and `homeCommerceRouteStale` are always initialized to `false` — routes serialized in the save file are assumed valid. `TileSet` fields are rebuilt from route arrays via `buildTileSets(agent)`.

`CitizenSummary` is also added to `GameState` (with a zero default when no agents exist) and is **not** persisted — it is recomputed on the first monthly tick after load. The zero default for use before the first tick:

```ts
const EMPTY_CITIZEN_SUMMARY: CitizenSummary = {
  agentCount: 0,
  avgSatisfaction: 1,
  unmatchedJobFraction: 0,
  unmatchedCommerceFraction: 0,
  avgCommuteLengthTiles: 0,
}
```

---

## What Changes vs. What Stays

| | Change |
|---|---|
| `simulation/traffic.ts` | `calculateTraffic()` replaced by citizen route traffic pass in `citizens.ts` |
| `simulation/demand.ts` | Add optional `CitizenSummary` param; add commute/job/commerce signal adjustments |
| `core/state.ts` | Add `CitizenSummary` to `GameState`; add `citizens` block to `SaveFile` |
| `core/buildings.ts` | No changes |
| `engine/Engine.ts` | Hold `CitizenRegistry` and `RoadGraph` privately; wire citizen monthly tick; update road graph on road place/demolish |
| New: `engine/src/simulation/citizens.ts` | All citizen logic (spawn, assign, replan, tick, satisfaction, summary) |
| New: `engine/src/road-graph.ts` | `RoadGraph` type, build + incremental update functions, A\* |
| All rendering, UI, zone dev, budget, services | Unchanged |

---

## Performance Notes

- At 1:50 sampling ratio: 10k residents → 200 agents; 50k residents → 1,000 agents.
- Traffic pass: ~1,000 agents × ~30 tile avg route = ~30,000 counter increments/month. Negligible.
- Route invalidation: O(agents) per road tile change — at 1,000 agents with small `Set` lookups, fast.
- A\* per agent: O(V log V) on road graph, V ≤ 5,000 tiles. ~60M ops worst case (all routes stale after major demolition). Rare; accepted as-is, with spreading as a future optimization.
- `RoadGraph` build on load: O(road tiles), typically < 5,000 tiles.
- Sampling ratio is runtime-tunable if performance issues arise in very large cities.
