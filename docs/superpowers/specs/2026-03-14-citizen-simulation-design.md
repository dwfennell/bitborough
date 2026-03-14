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
  workBuildingId: string | null       // null if no reachable job
  commerceBuildingId: string | null   // null if no reachable commercial building
  homeWorkRoute: number[]             // road tile indices, home → work access road
  homeCommerceRoute: number[]         // road tile indices, home → commerce access road
  homeWorkRouteTileSet: Set<number>   // for O(1) cache invalidation
  homeCommerceRouteTileSet: Set<number>
  homeWorkRouteStale: boolean
  homeCommerceRouteStale: boolean
  satisfaction: number                // 0–1
}
```

### `CitizenRegistry`

```ts
interface CitizenRegistry {
  agents: Citizen[]
  samplingRatio: number   // 1 agent per N residents; default 50
}
```

`CitizenRegistry` is added to `GameState` and serialized in `SaveFile` (bumps save version).

---

## Road Graph

A dedicated `RoadGraph` is built and maintained incrementally alongside the map. It is an adjacency list keyed by tile index, containing only road tiles. It is updated by `updateRoadGraph(map, x, y)` — the same call pattern as `updateConnections()` — whenever a road tile is placed or demolished.

This structure lives in `packages/engine/src` and is passed into citizen simulation functions. It is **not** stored in `GameState` — it is reconstructed from the map on load (cheap, O(road tiles)).

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

### Job Assignment

For each new agent, run A\* from the residential building's access road to the nearest road-accessible `active` building with `jobs > 0` (commercial or industrial). Greedy nearest-first — no capacity tracking in this phase.

If no job is reachable within `MAX_ROUTE_LENGTH` tiles (default 60), `workBuildingId` is null.

### Commerce Assignment

Same as job assignment, but targets the nearest `active` commercial building. If none reachable, `commerceBuildingId` is null.

---

## Route Caching & Invalidation

### A\* Implementation

Standard A\* on `RoadGraph`. Heuristic: Manhattan distance. Returns ordered list of road tile indices from start access road to destination access road. Cost: 1 per tile.

Routes are stored as both an array (for traffic contribution) and a `Set<number>` (for O(1) invalidation lookups).

### Invalidation

When a road tile at index `t` is placed or demolished:

```
for each agent in registry:
  if agent.homeWorkRouteTileSet.has(t):
    agent.homeWorkRouteStale = true
  if agent.homeCommerceRouteTileSet.has(t):
    agent.homeCommerceRouteStale = true
```

Stale routes are replanned in the monthly tick's replan pass. If the route can no longer be completed (road demolished, path broken), the building assignment (`workBuildingId` / `commerceBuildingId`) is set to null and the agent is flagged as unmatched.

---

## Monthly Simulation Tick

The citizen sim runs in two sequential passes during the Engine's monthly step, after zone updates and before demand calculation.

### Pass 1 — Route Replan

Iterate all agents with stale routes and recompute via A\*. If a large number of routes are stale (e.g., after a major road demolition), replan all of them synchronously — the monthly tick is already expected to do heavy work, and agent counts stay small (1,000 agents at 50k residents).

### Pass 2 — Traffic Contribution

Reset `trafficDensity` array to zero. For each agent:
- Walk `homeWorkRoute` — increment each tile's traffic counter by `WORK_TRIP_WEIGHT` (default 2)
- Walk `homeCommerceRoute` — increment each tile's traffic counter by `COMMERCE_TRIP_WEIGHT` (default 1)

After all agents: normalize counters to 0–255 range capped at `TRAFFIC_CAPACITY` (same constant as today). This output replaces `calculateTraffic()` entirely — the `trafficDensity` Uint8Array is populated by citizen routes.

### Commercial Foot Traffic

Each commercial building accumulates a `footTraffic` count: the number of agents whose `commerceBuildingId` points to it. This is computed once after assignment changes and stored on the building or in a parallel map. It is available for future economic depth calculations.

---

## Demand Signal Changes

`calculateDemand()` in `simulation/demand.ts` gains two additional inputs derived from the citizen registry:

| Signal | Existing behaviour | New addition |
|---|---|---|
| Commute penalty | Traffic congestion suppresses all demand | Average `homeWorkRoute` length > threshold (30 tiles) additionally suppresses residential demand |
| Job access deficit | None | Fraction of unmatched agents (no job) boosts industrial + commercial demand |
| Commerce access deficit | None | Fraction of agents with no commerce access boosts commercial demand |

The existing congestion suppression from `computeAverageCongestion()` is retained — it now uses real agent-derived traffic, so it naturally becomes more accurate.

---

## Satisfaction

Per-agent satisfaction is computed after each monthly tick:

```
commutePenalty = clamp(homeWorkRoute.length / MAX_ROUTE_LENGTH, 0, 1)
jobPenalty     = workBuildingId === null ? 0.5 : 0
commercePenalty = commerceBuildingId === null ? 0.3 : 0
satisfaction   = clamp(1 - commutePenalty * 0.4 - jobPenalty - commercePenalty, 0, 1)
```

Average satisfaction across agents in a residential zone is available for future use (display in query panel, influence land value).

---

## Save / Load

`CitizenRegistry` is added to `SaveFile.state`. Routes are serialized as plain `number[]` arrays. `TileSet` fields are not serialized — they are reconstructed from route arrays on load. Save file version bumps to 5.

```ts
SaveFile.state.citizens?: {
  samplingRatio: number
  agents: Array<{
    id: string
    homeBuildingId: string
    workBuildingId: string | null
    commerceBuildingId: string | null
    homeWorkRoute: number[]
    homeCommerceRoute: number[]
    satisfaction: number
  }>
}
```

Optional field for backwards compatibility — missing citizens block is treated as empty registry.

---

## What Changes vs. What Stays

| | Change |
|---|---|
| `simulation/traffic.ts` | `calculateTraffic()` replaced by citizen route traffic pass |
| `simulation/demand.ts` | Add commute/job/commerce signals as inputs |
| `core/state.ts` | Add `CitizenRegistry` to `GameState`, extend `SaveFile` |
| `core/buildings.ts` | No changes |
| `engine/Engine.ts` | Wire citizen monthly tick into simulation step |
| New: `engine/src/simulation/citizens.ts` | All citizen logic (spawn, assign, replan, tick) |
| New: `engine/src/road-graph.ts` | `RoadGraph` type, build + update functions, A\* |
| All rendering, UI, zone dev, budget, services | Unchanged |

---

## Performance Notes

- At 1:50 sampling ratio, 50k residents → 1,000 agents. At 1:50 with 10k residents → 200 agents.
- Traffic pass: ~1,000 agents × ~30 tile avg route = ~30,000 counter increments per month. Negligible.
- Route replan on road change: O(agents × route tile-set lookup) for invalidation, O(stale agents × A\* cost) for replan. Topology changes are rare events.
- `RoadGraph` build on load: O(road tiles), typically < 5,000 tiles.
- Sampling ratio is runtime-tunable if performance issues arise in very large cities.
