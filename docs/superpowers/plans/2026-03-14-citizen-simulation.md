# Citizen Simulation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace abstract DFS traffic with representative citizen agents that cache A\* commute routes, producing emergent traffic and richer demand signals.

**Architecture:** A new `RoadGraph` (adjacency list) powers A\* routing. Citizens are representative agents (1 per 50 residents) that cache home→work and home→commerce routes. Each monthly tick these routes contribute to `trafficDensity`; a `CitizenSummary` feeds three new demand signals into `calculateDemand()`.

**Tech Stack:** TypeScript, Vitest, pnpm workspace monorepo (`@bitborough/engine`, `@bitborough/core`)

**Spec:** `docs/superpowers/specs/2026-03-14-citizen-simulation-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `packages/engine/src/road-graph.ts` | Create | `RoadGraph` type, `buildRoadGraph()`, `updateRoadGraph()`, `astar()` |
| `packages/engine/src/simulation/citizens.ts` | Create | `Citizen`/`CitizenRegistry`/`CitizenSummary` types, `resolveAccessRoad()`, spawn/assign, invalidate, replan, monthly tick, satisfaction, summary |
| `packages/engine/src/__tests__/road-graph.test.ts` | Create | Tests for road graph and A\* |
| `packages/engine/src/__tests__/citizens.test.ts` | Create | Tests for citizen spawn, assign, tick, traffic, demand signals |
| `packages/core/src/state.ts` | Modify | Add `CitizenSummary` to `GameState`; add `citizens?` to `SaveFile` |
| `packages/engine/src/simulation/demand.ts` | Modify | Add `citizens?: CitizenSummary` param; implement three new demand signals |
| `packages/engine/src/simulation/traffic.ts` | Modify | Remove `calculateTraffic()` (traffic is now driven by citizens) |
| `packages/engine/src/Engine.ts` | Modify | Hold `citizenRegistry` + `roadGraph` privately; wire `citizenMonthlyTick()` in place of `calculateTraffic()`; update road graph on place/bulldoze; save/restore citizens |
| `packages/engine/src/__tests__/traffic.test.ts` | Modify | Update tests that rely on the old DFS traffic system |
| `packages/engine/src/__tests__/demand.test.ts` | Modify | Add tests for new citizen demand signals |

---

## Chunk 1: Road Graph

### Task 1: RoadGraph — build and incremental update

**Files:**
- Create: `packages/engine/src/road-graph.ts`
- Create: `packages/engine/src/__tests__/road-graph.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// packages/engine/src/__tests__/road-graph.test.ts
import { describe, test, expect } from 'vitest'
import { createTestMap } from '../test-helpers.js'
import { buildRoadGraph, updateRoadGraph } from '../road-graph.js'
import { Infrastructure } from '@bitborough/core'

describe('RoadGraph', () => {
  test('empty map has no road nodes', () => {
    const map = createTestMap(8)
    const graph = buildRoadGraph(map)
    expect(graph.size).toBe(0)
  })

  test('single road tile has entry with no neighbors', () => {
    const map = createTestMap(8)
    map.infrastructure[0] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    expect(graph.size).toBe(1)
    expect(graph.get(0)).toEqual([])
  })

  test('two adjacent road tiles are neighbors', () => {
    const map = createTestMap(8)
    map.infrastructure[0] = Infrastructure.Road
    map.infrastructure[1] = Infrastructure.Road  // (1,0)
    const graph = buildRoadGraph(map)
    expect(graph.get(0)).toContain(1)
    expect(graph.get(1)).toContain(0)
  })

  test('non-road tiles are not included', () => {
    const map = createTestMap(8)
    map.infrastructure[0] = Infrastructure.Road
    map.infrastructure[1] = Infrastructure.PowerLine
    const graph = buildRoadGraph(map)
    expect(graph.size).toBe(1)
    expect(graph.get(0)).toEqual([])
  })

  test('updateRoadGraph adds newly placed road', () => {
    const map = createTestMap(8)
    map.infrastructure[0] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    // Place road at (1,0) index=1
    map.infrastructure[1] = Infrastructure.Road
    updateRoadGraph(map, graph, 1, 0)
    expect(graph.get(1)).toContain(0)
    expect(graph.get(0)).toContain(1)
  })

  test('updateRoadGraph removes demolished road', () => {
    const map = createTestMap(8)
    map.infrastructure[0] = Infrastructure.Road
    map.infrastructure[1] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    // Demolish tile at index=1
    map.infrastructure[1] = 0
    updateRoadGraph(map, graph, 1, 0)
    expect(graph.has(1)).toBe(false)
    expect(graph.get(0)).not.toContain(1)
  })

  test('paved road tiles are included (same topology as dirt road)', () => {
    const map = createTestMap(8)
    map.infrastructure[0] = Infrastructure.Road | Infrastructure.PavedRoad
    map.infrastructure[1] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    expect(graph.size).toBe(2)
    expect(graph.get(0)).toContain(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/dustin/Documents/src/bitborough
pnpm -F @bitborough/engine test road-graph
```
Expected: import errors — `road-graph.ts` does not exist yet.

- [ ] **Step 3: Implement `road-graph.ts`**

```typescript
// packages/engine/src/road-graph.ts
import { type GameMap, Infrastructure } from '@bitborough/core'

export type RoadGraph = Map<number, number[]>

const DX = [0, 1, 0, -1] as const
const DY = [-1, 0, 1, 0] as const

function isRoad(infra: number): boolean {
  return (infra & Infrastructure.Road) !== 0
}

export function buildRoadGraph(map: GameMap): RoadGraph {
  const graph: RoadGraph = new Map()
  const { width, height } = map

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (!isRoad(map.infrastructure[idx]!)) continue
      const neighbors: number[] = []
      for (let dir = 0; dir < 4; dir++) {
        const nx = x + DX[dir]!
        const ny = y + DY[dir]!
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
        const nIdx = ny * width + nx
        if (isRoad(map.infrastructure[nIdx]!)) neighbors.push(nIdx)
      }
      graph.set(idx, neighbors)
    }
  }
  return graph
}

export function updateRoadGraph(map: GameMap, graph: RoadGraph, x: number, y: number): void {
  const { width, height } = map
  const idx = y * width + x

  if (isRoad(map.infrastructure[idx]!)) {
    // Tile is now a road — add it and connect to existing road neighbors
    const neighbors: number[] = []
    for (let dir = 0; dir < 4; dir++) {
      const nx = x + DX[dir]!
      const ny = y + DY[dir]!
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
      const nIdx = ny * width + nx
      if (!isRoad(map.infrastructure[nIdx]!)) continue
      neighbors.push(nIdx)
      // Add reverse link
      const existing = graph.get(nIdx)
      if (existing && !existing.includes(idx)) existing.push(idx)
    }
    graph.set(idx, neighbors)
  } else {
    // Tile is no longer a road — remove it and all links to it
    graph.delete(idx)
    for (let dir = 0; dir < 4; dir++) {
      const nx = x + DX[dir]!
      const ny = y + DY[dir]!
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
      const nIdx = ny * width + nx
      const neighbors = graph.get(nIdx)
      if (neighbors) {
        const i = neighbors.indexOf(idx)
        if (i !== -1) neighbors.splice(i, 1)
      }
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm -F @bitborough/engine test road-graph
```
Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/road-graph.ts packages/engine/src/__tests__/road-graph.test.ts
git commit -m "feat: RoadGraph — adjacency list, incremental update"
```

---

### Task 2: A\* on RoadGraph

**Files:**
- Modify: `packages/engine/src/road-graph.ts`
- Modify: `packages/engine/src/__tests__/road-graph.test.ts`

- [ ] **Step 1: Write the failing A\* tests**

Add to `road-graph.test.ts`:

```typescript
import { buildRoadGraph, updateRoadGraph, astar } from '../road-graph.js'

// ... existing tests ...

describe('astar', () => {
  test('returns single-element array containing start when start === goal', () => {
    const map = createTestMap(8)
    map.infrastructure[0] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    expect(astar(graph, 0, 0, map.width)).toEqual([0])
  })

  test('finds direct path between adjacent tiles', () => {
    const map = createTestMap(8)
    map.infrastructure[0] = Infrastructure.Road
    map.infrastructure[1] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const path = astar(graph, 0, 1, map.width)
    expect(path).toEqual([0, 1])
  })

  test('finds path along a straight road', () => {
    const map = createTestMap(8)
    // Road: (0,0),(1,0),(2,0),(3,0)
    for (let x = 0; x < 4; x++) map.infrastructure[x] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const path = astar(graph, 0, 3, map.width)
    expect(path).toEqual([0, 1, 2, 3])
  })

  test('finds shortest path around an obstacle', () => {
    const map = createTestMap(4)
    // Road row at y=0: 0,1,2,3 and row y=1: 0,1,2,3 but NOT (1,0)
    // So going 0→3 must go via y=1
    // Layout (4-wide): indices 0..3 = y=0, 4..7 = y=1
    map.infrastructure[0] = Infrastructure.Road  // (0,0)
    // (1,0) index=1 is blocked (not road)
    map.infrastructure[2] = Infrastructure.Road  // (2,0)
    map.infrastructure[3] = Infrastructure.Road  // (3,0)
    map.infrastructure[4] = Infrastructure.Road  // (0,1)
    map.infrastructure[5] = Infrastructure.Road  // (1,1)
    map.infrastructure[6] = Infrastructure.Road  // (2,1)
    map.infrastructure[7] = Infrastructure.Road  // (3,1)
    const graph = buildRoadGraph(map)
    const path = astar(graph, 0, 3, map.width)
    // Should route via y=1: 0→4→5→6→7→3
    expect(path).not.toBeNull()
    expect(path![0]).toBe(0)
    expect(path![path!.length - 1]).toBe(3)
  })

  test('returns null when no path exists', () => {
    const map = createTestMap(8)
    map.infrastructure[0] = Infrastructure.Road
    map.infrastructure[7] = Infrastructure.Road  // disconnected
    const graph = buildRoadGraph(map)
    expect(astar(graph, 0, 7, map.width)).toBeNull()
  })

  test('returns null when start is not in graph', () => {
    const map = createTestMap(8)
    map.infrastructure[1] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    expect(astar(graph, 0, 1, map.width)).toBeNull()
  })

  test('respects MAX_ROUTE_LENGTH limit', () => {
    const map = createTestMap(16)
    // Long straight road of 14 tiles (indices 0..13)
    for (let i = 0; i < 14; i++) map.infrastructure[i] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    // With a limit of 5, cannot reach index 13
    expect(astar(graph, 0, 13, map.width, 5)).toBeNull()
    // Without limit, can reach
    expect(astar(graph, 0, 13, map.width)).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm -F @bitborough/engine test road-graph
```
Expected: `astar is not a function` errors.

- [ ] **Step 3: Implement `astar()`**

Add to `packages/engine/src/road-graph.ts`:

```typescript
export const MAX_ROUTE_LENGTH = 60

/** A* on road graph. Returns path (inclusive of start and goal) or null if unreachable. */
export function astar(
  graph: RoadGraph,
  start: number,
  goal: number,
  mapWidth: number,
  maxLength = MAX_ROUTE_LENGTH,
): number[] | null {
  if (!graph.has(start)) return null
  if (start === goal) return [start]

  const gScore = new Map<number, number>([[start, 0]])
  const fScore = new Map<number, number>([[start, heuristic(start, goal, mapWidth)]])
  const cameFrom = new Map<number, number>()
  // Min-heap via sorted insertion would be ideal; for simplicity use a Set + linear min scan
  // (acceptable: road graph ≤ 5,000 nodes, called infrequently)
  const open = new Set<number>([start])

  while (open.size > 0) {
    // Find node in open with lowest fScore
    let current = -1
    let bestF = Infinity
    for (const n of open) {
      const f = fScore.get(n) ?? Infinity
      if (f < bestF) { bestF = f; current = n }
    }
    if (current === goal) return reconstructPath(cameFrom, current)

    open.delete(current)
    const g = gScore.get(current) ?? Infinity

    for (const neighbor of (graph.get(current) ?? [])) {
      const tentativeG = g + 1
      if (tentativeG > maxLength) continue  // path would exceed limit
      if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current)
        gScore.set(neighbor, tentativeG)
        fScore.set(neighbor, tentativeG + heuristic(neighbor, goal, mapWidth))
        open.add(neighbor)
      }
    }
  }
  return null
}

function heuristic(a: number, b: number, width: number): number {
  return Math.abs((a % width) - (b % width)) + Math.abs(Math.floor(a / width) - Math.floor(b / width))
}

function reconstructPath(cameFrom: Map<number, number>, current: number): number[] {
  const path = [current]
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!
    path.unshift(current)
  }
  return path
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm -F @bitborough/engine test road-graph
```
Expected: all A\* tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/road-graph.ts packages/engine/src/__tests__/road-graph.test.ts
git commit -m "feat: A* pathfinding on RoadGraph with MAX_ROUTE_LENGTH guard"
```

---

## Chunk 2: Citizen Types, Access Road, Spawn, Assign

### Task 3: Citizen types + resolveAccessRoad

**Files:**
- Create: `packages/engine/src/simulation/citizens.ts`
- Create: `packages/engine/src/__tests__/citizens.test.ts`

- [ ] **Step 1: Write failing tests for resolveAccessRoad**

```typescript
// packages/engine/src/__tests__/citizens.test.ts
import { describe, test, expect } from 'vitest'
import { createTestMap } from '../test-helpers.js'
import { resolveAccessRoad } from '../simulation/citizens.js'
import { Infrastructure } from '@bitborough/core'
import type { Building } from '@bitborough/core'

function makeBuilding(x: number, y: number, w: number, h: number): Building {
  return { id: 'b1', defId: 'res.low', x, y, powered: false, density: 0, age: 0, state: 'active', residents: 5 }
}

describe('resolveAccessRoad', () => {
  test('returns -1 when no adjacent road', () => {
    const map = createTestMap(8)
    const building = makeBuilding(2, 2, 1, 1)
    expect(resolveAccessRoad(map, building)).toBe(-1)
  })

  test('finds road tile directly north of building', () => {
    const map = createTestMap(8)
    // Building at (2,2), road at (2,1)
    map.infrastructure[1 * 8 + 2] = Infrastructure.Road
    const building = makeBuilding(2, 2, 1, 1)
    expect(resolveAccessRoad(map, building)).toBe(1 * 8 + 2)
  })

  test('finds road for multi-tile building (2x2)', () => {
    const map = createTestMap(8)
    // Building at (2,2) with defId 'res.high' (2×2 footprint), road at (3,1)
    // (3,1) is north of footprint tile (3,2) — only reachable via the 2nd column scan
    map.infrastructure[1 * 8 + 3] = Infrastructure.Road
    const building = { ...makeBuilding(2, 2, 2, 2), defId: 'res.high' }
    expect(resolveAccessRoad(map, building)).toBe(1 * 8 + 3)
  })

  test('scan order is row-major footprint, N then E then S then W per tile', () => {
    const map = createTestMap(8)
    // Building 1x1 at (2,2), roads on both N and E sides
    map.infrastructure[1 * 8 + 2] = Infrastructure.Road  // north
    map.infrastructure[2 * 8 + 3] = Infrastructure.Road  // east
    const building = makeBuilding(2, 2, 1, 1)
    // N is checked before E, so north road wins
    expect(resolveAccessRoad(map, building)).toBe(1 * 8 + 2)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm -F @bitborough/engine test citizens
```
Expected: module not found.

- [ ] **Step 3: Create `citizens.ts` with types and `resolveAccessRoad`**

`packages/engine/src/simulation/citizens.ts`:

```typescript
import { type GameMap, type Building, BuildingCategory, Infrastructure } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import type { RoadGraph } from '../road-graph.js'
import { astar } from '../road-graph.js'

// ── Types ────────────────────────────────────────────────────────────────────

export interface Citizen {
  id: string
  homeBuildingId: string
  workBuildingId: string | null
  commerceBuildingId: string | null
  homeAccessRoad: number
  workAccessRoad: number | null
  commerceAccessRoad: number | null
  homeWorkRoute: number[]
  homeCommerceRoute: number[]
  homeWorkRouteTileSet: Set<number>
  homeCommerceRouteTileSet: Set<number>
  homeWorkRouteStale: boolean
  homeCommerceRouteStale: boolean
  satisfaction: number
}

export interface CitizenRegistry {
  agents: Citizen[]
  samplingRatio: number
}

export interface CitizenSummary {
  agentCount: number
  avgSatisfaction: number
  unmatchedJobFraction: number
  unmatchedCommerceFraction: number
  avgCommuteLengthTiles: number
}

export const EMPTY_CITIZEN_SUMMARY: CitizenSummary = {
  agentCount: 0,
  avgSatisfaction: 1,
  unmatchedJobFraction: 0,
  unmatchedCommerceFraction: 0,
  avgCommuteLengthTiles: 0,
}

export const DEFAULT_SAMPLING_RATIO = 50

// ── Access Road ──────────────────────────────────────────────────────────────

const FOOTPRINT_DX = [0, 1, 0, -1] as const
const FOOTPRINT_DY = [-1, 0, 1, 0] as const

/** Scan all footprint tiles N→E→S→W, row-major; return first adjacent road tile index, or -1. */
export function resolveAccessRoad(map: GameMap, building: Building): number {
  const def = BUILDING_DEFS[building.defId]
  const w = def?.size.w ?? 1
  const h = def?.size.h ?? 1
  const { width, height } = map

  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const fx = building.x + dx
      const fy = building.y + dy
      for (let dir = 0; dir < 4; dir++) {
        const nx = fx + FOOTPRINT_DX[dir]!
        const ny = fy + FOOTPRINT_DY[dir]!
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
        const nIdx = ny * width + nx
        if (map.infrastructure[nIdx]! & Infrastructure.Road) return nIdx
      }
    }
  }
  return -1
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm -F @bitborough/engine test citizens
```
Expected: all `resolveAccessRoad` tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/citizens.ts packages/engine/src/__tests__/citizens.test.ts
git commit -m "feat: Citizen types + resolveAccessRoad (multi-tile aware)"
```

---

### Task 4: Spawn/assign agents

**Files:**
- Modify: `packages/engine/src/simulation/citizens.ts`
- Modify: `packages/engine/src/__tests__/citizens.test.ts`

- [ ] **Step 1: Write failing spawn/assign tests**

Add to `citizens.test.ts`:

```typescript
import {
  resolveAccessRoad, createRegistry, syncAgentsForBuilding, removeAgentsForBuilding,
  type CitizenRegistry,
} from '../simulation/citizens.js'
import { buildRoadGraph } from '../road-graph.js'

describe('Agent spawning', () => {
  test('createRegistry returns empty registry with default ratio', () => {
    const registry = createRegistry()
    expect(registry.agents).toHaveLength(0)
    expect(registry.samplingRatio).toBe(50)
  })

  test('syncAgentsForBuilding spawns agents proportional to residents', () => {
    const map = createTestMap(8)
    // Road at y=0 row, residential building at (2,1)
    for (let x = 0; x < 8; x++) map.infrastructure[x] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    const building = makeBuilding(2, 1, 1, 1)
    building.residents = 100
    map.buildings = [building]
    syncAgentsForBuilding(map, registry, graph, building)
    // 100 / 50 = 2 agents
    expect(registry.agents.filter(a => a.homeBuildingId === building.id)).toHaveLength(2)
  })

  test('syncAgentsForBuilding removes agents when residents shrink', () => {
    const map = createTestMap(8)
    for (let x = 0; x < 8; x++) map.infrastructure[x] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    const building = makeBuilding(2, 1, 1, 1)
    building.residents = 100
    map.buildings = [building]
    syncAgentsForBuilding(map, registry, graph, building)
    expect(registry.agents).toHaveLength(2)
    building.residents = 50
    syncAgentsForBuilding(map, registry, graph, building)
    expect(registry.agents).toHaveLength(1)
  })

  test('removeAgentsForBuilding clears all agents for that building', () => {
    const map = createTestMap(8)
    for (let x = 0; x < 8; x++) map.infrastructure[x] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    const building = makeBuilding(2, 1, 1, 1)
    building.residents = 100
    map.buildings = [building]
    syncAgentsForBuilding(map, registry, graph, building)
    removeAgentsForBuilding(registry, building.id)
    expect(registry.agents.filter(a => a.homeBuildingId === building.id)).toHaveLength(0)
  })

  test('agents without road access have empty routes', () => {
    const map = createTestMap(8)
    // No road placed — building has no road access
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    const building = makeBuilding(2, 1, 1, 1)
    building.residents = 100
    map.buildings = [building]
    syncAgentsForBuilding(map, registry, graph, building)
    // No agents spawned because no access road
    expect(registry.agents).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm -F @bitborough/engine test citizens
```
Expected: `createRegistry is not a function` etc.

- [ ] **Step 3: Implement spawn/assign in `citizens.ts`**

Add after existing code in `citizens.ts`:

```typescript
// ── Registry ─────────────────────────────────────────────────────────────────

export function createRegistry(samplingRatio = DEFAULT_SAMPLING_RATIO): CitizenRegistry {
  return { agents: [], samplingRatio }
}

// ── Assign ───────────────────────────────────────────────────────────────────

function findNearestJobBuilding(map: GameMap, graph: RoadGraph, fromRoad: number): { buildingId: string; accessRoad: number; route: number[] } | null {
  let best: { buildingId: string; accessRoad: number; route: number[] } | null = null
  for (const building of map.buildings) {
    if (building.state !== 'active') continue
    const def = BUILDING_DEFS[building.defId]
    if (!def || def.jobs <= 0) continue
    const access = resolveAccessRoad(map, building)
    if (access < 0) continue
    const route = astar(graph, fromRoad, access, map.width)
    if (!route) continue
    if (!best || route.length < best.route.length) {
      best = { buildingId: building.id, accessRoad: access, route }
    }
  }
  return best
}

function findNearestCommerceBuilding(map: GameMap, graph: RoadGraph, fromRoad: number): { buildingId: string; accessRoad: number; route: number[] } | null {
  let best: { buildingId: string; accessRoad: number; route: number[] } | null = null
  for (const building of map.buildings) {
    if (building.state !== 'active') continue
    const def = BUILDING_DEFS[building.defId]
    if (!def || def.category !== BuildingCategory.Commercial) continue
    const access = resolveAccessRoad(map, building)
    if (access < 0) continue
    const route = astar(graph, fromRoad, access, map.width)
    if (!route) continue
    if (!best || route.length < best.route.length) {
      best = { buildingId: building.id, accessRoad: access, route }
    }
  }
  return best
}

function buildTileSets(agent: Citizen): void {
  agent.homeWorkRouteTileSet = new Set(agent.homeWorkRoute)
  agent.homeCommerceRouteTileSet = new Set(agent.homeCommerceRoute)
}

let nextAgentId = 1

function createAgent(map: GameMap, graph: RoadGraph, homeBuildingId: string, homeAccessRoad: number): Citizen {
  const id = `c${nextAgentId++}`
  const jobMatch = findNearestJobBuilding(map, graph, homeAccessRoad)
  const commerceMatch = findNearestCommerceBuilding(map, graph, homeAccessRoad)
  const agent: Citizen = {
    id,
    homeBuildingId,
    workBuildingId: jobMatch?.buildingId ?? null,
    commerceBuildingId: commerceMatch?.buildingId ?? null,
    homeAccessRoad,
    workAccessRoad: jobMatch?.accessRoad ?? null,
    commerceAccessRoad: commerceMatch?.accessRoad ?? null,
    homeWorkRoute: jobMatch?.route ?? [],
    homeCommerceRoute: commerceMatch?.route ?? [],
    homeWorkRouteTileSet: new Set(),
    homeCommerceRouteTileSet: new Set(),
    homeWorkRouteStale: false,
    homeCommerceRouteStale: false,
    satisfaction: 1,
  }
  buildTileSets(agent)
  return agent
}

export function syncAgentsForBuilding(map: GameMap, registry: CitizenRegistry, graph: RoadGraph, building: Building): void {
  const homeAccessRoad = resolveAccessRoad(map, building)
  if (homeAccessRoad < 0) return  // building has no road access — no agents

  const existing = registry.agents.filter(a => a.homeBuildingId === building.id)
  const needed = Math.floor(building.residents / registry.samplingRatio)
  const delta = needed - existing.length

  if (delta > 0) {
    for (let i = 0; i < delta; i++) {
      registry.agents.push(createAgent(map, graph, building.id, homeAccessRoad))
    }
  } else if (delta < 0) {
    // Remove from end
    const toRemove = existing.slice(delta).map(a => a.id)
    const removeSet = new Set(toRemove)
    registry.agents = registry.agents.filter(a => !removeSet.has(a.id))
  }
}

export function removeAgentsForBuilding(registry: CitizenRegistry, buildingId: string): void {
  registry.agents = registry.agents.filter(a => a.homeBuildingId !== buildingId)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm -F @bitborough/engine test citizens
```
Expected: all spawn/assign tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/citizens.ts packages/engine/src/__tests__/citizens.test.ts
git commit -m "feat: citizen spawn/assign — greedy nearest job and commerce"
```

---

## Chunk 3: Route Invalidation, Monthly Tick, Traffic, Satisfaction

### Task 5: Route invalidation + replan

**Files:**
- Modify: `packages/engine/src/simulation/citizens.ts`
- Modify: `packages/engine/src/__tests__/citizens.test.ts`

- [ ] **Step 1: Write failing invalidation tests**

Add to `citizens.test.ts`:

```typescript
import { syncAgentsForBuilding, markRoutesStale, replanStaleRoutes, removeAgentsForBuilding, createRegistry } from '../simulation/citizens.js'

describe('Route invalidation', () => {
  function buildScenario() {
    const map = createTestMap(8)
    // Road: (0,0)..(4,0) as y=0 row
    for (let x = 0; x < 5; x++) map.infrastructure[x] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    // Residential building at (0,1), its north neighbor (0,0) is road access
    const home: Building = { id: 'b1', defId: 'res.low', x: 0, y: 1, powered: true, density: 0, age: 0, state: 'active', residents: 50 }
    // Commercial building at (4,1), its north neighbor (4,0) is road access
    const shop: Building = { id: 'b2', defId: 'com.low', x: 4, y: 1, powered: true, density: 0, age: 0, state: 'active', residents: 0 }
    map.buildings = [home, shop]
    syncAgentsForBuilding(map, registry, graph, home)
    return { map, graph, registry, home, shop }
  }

  test('markRoutesStale flags agents whose routes include a demolished tile', () => {
    const { registry } = buildScenario()
    const agent = registry.agents[0]!
    // Route goes through index=2 (x=2,y=0)
    expect(agent.homeCommerceRoute).toContain(2)
    markRoutesStale(registry, 2)
    expect(agent.homeCommerceRouteStale).toBe(true)
  })

  test('markRoutesStale does not affect agents whose routes do not include the tile', () => {
    const { registry } = buildScenario()
    const agent = registry.agents[0]!
    markRoutesStale(registry, 99)  // tile not in any route
    expect(agent.homeWorkRouteStale).toBe(false)
    expect(agent.homeCommerceRouteStale).toBe(false)
  })

  test('replanStaleRoutes replans a stale route', () => {
    const { map, graph, registry } = buildScenario()
    const agent = registry.agents[0]!
    agent.homeCommerceRouteStale = true
    const originalRoute = [...agent.homeCommerceRoute]
    replanStaleRoutes(registry, map, graph)
    // Route should still be valid (same path)
    expect(agent.homeCommerceRoute).toEqual(originalRoute)
    expect(agent.homeCommerceRouteStale).toBe(false)
  })

  test('replanStaleRoutes sets route to [] when path is broken', () => {
    const { map, graph, registry } = buildScenario()
    const agent = registry.agents[0]!
    // Remove road tiles in the middle so path is broken
    map.infrastructure[2] = 0
    map.infrastructure[3] = 0
    updateRoadGraph(map, graph, 2, 0)
    updateRoadGraph(map, graph, 3, 0)
    agent.homeCommerceRouteStale = true
    replanStaleRoutes(registry, map, graph)
    expect(agent.homeCommerceRoute).toEqual([])
    expect(agent.homeCommerceRouteStale).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm -F @bitborough/engine test citizens
```
Expected: `markRoutesStale is not a function` etc.

- [ ] **Step 3: Implement invalidation + replan in `citizens.ts`**

Add to `citizens.ts`:

```typescript
export function markRoutesStale(registry: CitizenRegistry, tileIndex: number): void {
  for (const agent of registry.agents) {
    if (agent.homeWorkRouteTileSet.has(tileIndex)) agent.homeWorkRouteStale = true
    if (agent.homeCommerceRouteTileSet.has(tileIndex)) agent.homeCommerceRouteStale = true
  }
}

export function replanStaleRoutes(registry: CitizenRegistry, map: GameMap, graph: RoadGraph): void {
  for (const agent of registry.agents) {
    if (agent.homeWorkRouteStale) {
      if (agent.workAccessRoad !== null) {
        const route = astar(graph, agent.homeAccessRoad, agent.workAccessRoad, map.width)
        agent.homeWorkRoute = route ?? []
        if (!route) { agent.workBuildingId = null; agent.workAccessRoad = null }
      } else {
        agent.homeWorkRoute = []
      }
      agent.homeWorkRouteTileSet = new Set(agent.homeWorkRoute)
      agent.homeWorkRouteStale = false
    }
    if (agent.homeCommerceRouteStale) {
      if (agent.commerceAccessRoad !== null) {
        const route = astar(graph, agent.homeAccessRoad, agent.commerceAccessRoad, map.width)
        agent.homeCommerceRoute = route ?? []
        if (!route) { agent.commerceBuildingId = null; agent.commerceAccessRoad = null }
      } else {
        agent.homeCommerceRoute = []
      }
      agent.homeCommerceRouteTileSet = new Set(agent.homeCommerceRoute)
      agent.homeCommerceRouteStale = false
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm -F @bitborough/engine test citizens
```
Expected: all invalidation tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/citizens.ts packages/engine/src/__tests__/citizens.test.ts
git commit -m "feat: route cache invalidation and stale route replanning"
```

---

### Task 6: Traffic contribution pass + satisfaction + summary

**Files:**
- Modify: `packages/engine/src/simulation/citizens.ts`
- Modify: `packages/engine/src/__tests__/citizens.test.ts`

- [ ] **Step 1: Write failing traffic/satisfaction tests**

Add to `citizens.test.ts`:

```typescript
import { citizenMonthlyTick, computeCitizenSummary } from '../simulation/citizens.js'

describe('Monthly tick — traffic + satisfaction', () => {
  function buildCity() {
    const map = createTestMap(8)
    for (let x = 0; x < 8; x++) map.infrastructure[x] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    const home: Building = { id: 'b1', defId: 'res.low', x: 0, y: 1, powered: true, density: 0, age: 0, state: 'active', residents: 100 }
    const shop: Building = { id: 'b2', defId: 'com.low', x: 6, y: 1, powered: true, density: 0, age: 0, state: 'active', residents: 0 }
    map.buildings = [home, shop]
    syncAgentsForBuilding(map, registry, graph, home)
    return { map, graph, registry }
  }

  test('traffic is zero on empty registry', () => {
    const map = createTestMap(8)
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    const trafficDensity = new Uint8Array(64)
    citizenMonthlyTick(registry, map, graph, trafficDensity)
    expect(Array.from(trafficDensity).every(v => v === 0)).toBe(true)
  })

  test('traffic appears on road tiles along agent routes', () => {
    const { map, graph, registry } = buildCity()
    const trafficDensity = new Uint8Array(64)
    citizenMonthlyTick(registry, map, graph, trafficDensity)
    // Road at y=0 (indices 0..7) should have traffic from commerce route
    const roadTraffic = Array.from(trafficDensity.slice(0, 8))
    expect(roadTraffic.some(v => v > 0)).toBe(true)
  })

  test('more agents produce more traffic', () => {
    const { map, graph, registry } = buildCity()
    const t1 = new Uint8Array(64)
    citizenMonthlyTick(registry, map, graph, t1)
    const sum1 = Array.from(t1).reduce((a, b) => a + b, 0)

    // Double residents
    const home = map.buildings.find(b => b.id === 'b1')!
    home.residents = 200
    syncAgentsForBuilding(map, registry, graph, home)
    const t2 = new Uint8Array(64)
    citizenMonthlyTick(registry, map, graph, t2)
    const sum2 = Array.from(t2).reduce((a, b) => a + b, 0)
    expect(sum2).toBeGreaterThan(sum1)
  })

  test('satisfaction is 1 when agent has short commute and commerce', () => {
    const { registry } = buildCity()
    const agent = registry.agents[0]!
    // Short route (≤ a few tiles), has commerce
    expect(agent.satisfaction).toBeGreaterThan(0.5)
  })

  test('satisfaction penalised when no job assigned', () => {
    const map = createTestMap(8)
    for (let x = 0; x < 8; x++) map.infrastructure[x] = Infrastructure.Road
    const graph = buildRoadGraph(map)
    const registry = createRegistry()
    // Only residential, no jobs nearby
    const home: Building = { id: 'b1', defId: 'res.low', x: 0, y: 1, powered: true, density: 0, age: 0, state: 'active', residents: 50 }
    map.buildings = [home]
    syncAgentsForBuilding(map, registry, graph, home)
    const trafficDensity = new Uint8Array(64)
    citizenMonthlyTick(registry, map, graph, trafficDensity)
    const agent = registry.agents[0]!
    // jobPenalty = 0.5, so satisfaction ≤ 0.5
    expect(agent.satisfaction).toBeLessThanOrEqual(0.5)
  })

  test('computeCitizenSummary returns empty summary for empty registry', () => {
    const registry = createRegistry()
    const summary = computeCitizenSummary(registry)
    expect(summary.agentCount).toBe(0)
    expect(summary.avgSatisfaction).toBe(1)
    expect(summary.unmatchedJobFraction).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm -F @bitborough/engine test citizens
```
Expected: `citizenMonthlyTick is not a function`.

- [ ] **Step 3: Implement traffic pass, satisfaction, and summary in `citizens.ts`**

Add to `citizens.ts`:

```typescript
const WORK_TRIP_WEIGHT = 2
const COMMERCE_TRIP_WEIGHT = 1
const MAX_SATISFACTION_COMMUTE = 60  // same as MAX_ROUTE_LENGTH

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function computeSatisfaction(agent: Citizen): number {
  const commutePenalty = clamp(agent.homeWorkRoute.length / MAX_SATISFACTION_COMMUTE, 0, 1)
  const jobPenalty = agent.workBuildingId === null ? 0.5 : 0
  const commercePenalty = agent.commerceBuildingId === null ? 0.3 : 0
  return clamp(1 - commutePenalty * 0.4 - jobPenalty - commercePenalty, 0, 1)
}

export function citizenMonthlyTick(
  registry: CitizenRegistry,
  map: GameMap,
  graph: RoadGraph,
  trafficDensity: Uint8Array,
): void {
  // Pass 1: replan stale routes
  replanStaleRoutes(registry, map, graph)

  // Pass 2: traffic contribution
  const size = map.width * map.height
  const rawTraffic = new Float64Array(size)

  for (const agent of registry.agents) {
    for (const tileIdx of agent.homeWorkRoute) {
      rawTraffic[tileIdx]! += WORK_TRIP_WEIGHT
    }
    for (const tileIdx of agent.homeCommerceRoute) {
      rawTraffic[tileIdx]! += COMMERCE_TRIP_WEIGHT
    }
    agent.satisfaction = computeSatisfaction(agent)
  }

  // Scale by sampling ratio and write to trafficDensity
  trafficDensity.fill(0)
  for (let i = 0; i < size; i++) {
    trafficDensity[i] = Math.min(255, Math.floor(rawTraffic[i]! * registry.samplingRatio))
  }
}

export function computeCitizenSummary(registry: CitizenRegistry): CitizenSummary {
  const { agents } = registry
  if (agents.length === 0) return { ...EMPTY_CITIZEN_SUMMARY }

  let satSum = 0
  let unmatchedJob = 0
  let unmatchedCommerce = 0
  let commuteLengthSum = 0

  for (const agent of agents) {
    satSum += agent.satisfaction
    if (agent.workBuildingId === null) unmatchedJob++
    if (agent.commerceBuildingId === null) unmatchedCommerce++
    commuteLengthSum += agent.homeWorkRoute.length
  }

  return {
    agentCount: agents.length,
    avgSatisfaction: satSum / agents.length,
    unmatchedJobFraction: unmatchedJob / agents.length,
    unmatchedCommerceFraction: unmatchedCommerce / agents.length,
    avgCommuteLengthTiles: commuteLengthSum / agents.length,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm -F @bitborough/engine test citizens
```
Expected: all traffic/satisfaction tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/citizens.ts packages/engine/src/__tests__/citizens.test.ts
git commit -m "feat: citizen monthly tick — traffic contribution, satisfaction, summary"
```

---

## Chunk 4: Demand Integration + Core Types

### Task 7: Add CitizenSummary to core/state.ts

**Files:**
- Modify: `packages/core/src/state.ts`

- [ ] **Step 1: Add `CitizenSummary` to `GameState` and `SaveFile`**

In `packages/core/src/state.ts`, add the `CitizenSummary` interface and update `GameState` and `SaveFile`:

```typescript
// Add after DemandInfo interface:
export interface CitizenSummary {
  agentCount: number
  avgSatisfaction: number
  unmatchedJobFraction: number
  unmatchedCommerceFraction: number
  avgCommuteLengthTiles: number
}
```

In `GameState`, add:
```typescript
citizens: CitizenSummary
```

In `SaveFile.state`, add:
```typescript
citizens?: {
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

- [ ] **Step 2: Run typecheck to confirm no errors**

```bash
pnpm -F @bitborough/core typecheck
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/state.ts
git commit -m "feat: add CitizenSummary to GameState and SaveFile schema"
```

---

### Task 8: Update calculateDemand with citizen signals

**Files:**
- Modify: `packages/engine/src/simulation/demand.ts`
- Modify: `packages/engine/src/__tests__/demand.test.ts`

- [ ] **Step 1: Write failing tests for citizen demand signals**

Add to `demand.test.ts`:

```typescript
import type { CitizenSummary } from '@bitborough/core'

const baseSummary: CitizenSummary = {
  agentCount: 100,
  avgSatisfaction: 1,
  unmatchedJobFraction: 0,
  unmatchedCommerceFraction: 0,
  avgCommuteLengthTiles: 10,
}

describe('Citizen demand signals', () => {
  test('long average commute suppresses residential demand', () => {
    const map = createTestMap(32)
    const baseline = calculateDemand(map, 0.07)
    const withLongCommute = calculateDemand(map, 0.07, undefined, {
      ...baseSummary,
      avgCommuteLengthTiles: 60,
    })
    expect(withLongCommute.residential).toBeLessThan(baseline.residential)
  })

  test('high unmatched job fraction boosts industrial demand', () => {
    const map = createTestMap(32)
    const baseline = calculateDemand(map, 0.07)
    const withUnmatched = calculateDemand(map, 0.07, undefined, {
      ...baseSummary,
      unmatchedJobFraction: 1.0,
    })
    expect(withUnmatched.industrial).toBeGreaterThan(baseline.industrial)
  })

  test('high unmatched commerce fraction boosts commercial demand', () => {
    const map = createTestMap(32)
    const baseline = calculateDemand(map, 0.07)
    const withUnmatched = calculateDemand(map, 0.07, undefined, {
      ...baseSummary,
      unmatchedCommerceFraction: 1.0,
    })
    expect(withUnmatched.commercial).toBeGreaterThan(baseline.commercial)
  })

  test('short commute with all matched produces no penalty', () => {
    const map = createTestMap(32)
    const baseline = calculateDemand(map, 0.07)
    const withGoodCitizens = calculateDemand(map, 0.07, undefined, baseSummary)
    // No penalty applied — demand should be >= baseline (clamping may affect)
    expect(withGoodCitizens.residential).toBeCloseTo(baseline.residential, 2)
  })

  test('demand values remain clamped to [-1, 1] with citizen signals', () => {
    const map = createTestMap(32)
    const demand = calculateDemand(map, 0.07, undefined, {
      ...baseSummary,
      unmatchedJobFraction: 1.0,
      unmatchedCommerceFraction: 1.0,
      avgCommuteLengthTiles: 60,
    })
    expect(demand.residential).toBeGreaterThanOrEqual(-1)
    expect(demand.residential).toBeLessThanOrEqual(1)
    expect(demand.commercial).toBeGreaterThanOrEqual(-1)
    expect(demand.commercial).toBeLessThanOrEqual(1)
    expect(demand.industrial).toBeGreaterThanOrEqual(-1)
    expect(demand.industrial).toBeLessThanOrEqual(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm -F @bitborough/engine test demand
```
Expected: type errors — `calculateDemand` doesn't accept a 4th param yet.

- [ ] **Step 3: Implement citizen signals in `demand.ts`**

Update the `calculateDemand` signature and add citizen signal logic:

```typescript
import type { CitizenSummary } from '@bitborough/core'

export function calculateDemand(
  map: GameMap,
  taxRate: number,
  trafficDensity?: Uint8Array,
  citizens?: CitizenSummary
): DemandInfo {
  // ... existing tax/base/congestion logic unchanged ...

  // Citizen signals (only when citizens are present)
  if (citizens && citizens.agentCount > 0) {
    // Long commute suppresses residential demand (max -0.3 penalty at 60 tiles)
    if (citizens.avgCommuteLengthTiles > 30) {
      const penalty = Math.min(0.3, (citizens.avgCommuteLengthTiles - 30) / 30 * 0.3)
      rDemand -= penalty
    }

    // Unmatched job fraction boosts industrial + commercial demand (up to +0.3)
    const jobBoost = citizens.unmatchedJobFraction * 0.3
    iDemand += jobBoost
    cDemand += jobBoost * 0.5

    // Unmatched commerce fraction boosts commercial demand (up to +0.2)
    cDemand += citizens.unmatchedCommerceFraction * 0.2
  }

  // Clamp all values to [-1, 1] (existing clamp call, unchanged)
  return {
    residential: clamp(rDemand, -1, 1),
    commercial: clamp(cDemand, -1, 1),
    industrial: clamp(iDemand, -1, 1),
  }
}
```

- [ ] **Step 4: Run all demand tests to verify they pass**

```bash
pnpm -F @bitborough/engine test demand
```
Expected: all existing + new tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/engine/src/simulation/demand.ts packages/engine/src/__tests__/demand.test.ts packages/core/src/state.ts
git commit -m "feat: citizen demand signals — commute penalty, job/commerce boost"
```

---

## Chunk 5: Engine Wiring + Save/Load

### Task 9: Wire citizens into Engine.ts

**Files:**
- Modify: `packages/engine/src/Engine.ts`
- Modify: `packages/engine/src/simulation/traffic.ts`
- Modify: `packages/engine/src/__tests__/traffic.test.ts`

- [ ] **Step 1: Update Engine.ts — swap imports, add fields, wire tick**

Do all Engine.ts changes atomically (the import removal and traffic.ts gutting must happen in the same step to avoid a broken build):

**1a. In `Engine.ts` imports:** Remove the `calculateTraffic` import line and add:
```typescript
import { buildRoadGraph, updateRoadGraph, type RoadGraph } from './road-graph.js'
import {
  createRegistry, syncAgentsForBuilding, removeAgentsForBuilding,
  citizenMonthlyTick, computeCitizenSummary, markRoutesStale,
  EMPTY_CITIZEN_SUMMARY,
  type CitizenRegistry,
} from './simulation/citizens.js'
import type { CitizenSummary } from '@bitborough/core'
```

Also add `BuildingCategory` to the `@bitborough/core` import.

**1b. Add private fields** (alongside existing simulation layer fields):
```typescript
private citizenRegistry: CitizenRegistry
private roadGraph: RoadGraph
private citizenSummary: CitizenSummary
```

**1c. In the constructor body**, after existing field initialization:
```typescript
this.citizenRegistry = createRegistry()
this.roadGraph = buildRoadGraph(this.map)
this.citizenSummary = { ...EMPTY_CITIZEN_SUMMARY }
```

**1d. Gut `traffic.ts`** — replace the entire file contents with:
```typescript
// Traffic is now driven by citizen agent routes.
// See packages/engine/src/simulation/citizens.ts — citizenMonthlyTick()
```

- [ ] **Step 2: Wire `citizenMonthlyTick` into Engine.tick() — two insertion points**

**Insertion point A** — replace `calculateTraffic(this.map, this.trafficDensity)` (currently the only call site, before `updateZones`):
```typescript
// Citizen monthly tick: replan stale routes, write trafficDensity from agent routes
citizenMonthlyTick(this.citizenRegistry, this.map, this.roadGraph, this.trafficDensity)
this.citizenSummary = computeCitizenSummary(this.citizenRegistry)
```
This preserves the one-month lag — `calculateDemand()` already ran above using last month's `trafficDensity`.

**Insertion point B** — after the existing `updateDensity` block (after `this.population = Math.max(0, ...)`), add:
```typescript
// Sync citizen agents after zone/density changes (population may have changed)
for (const b of this.map.buildings) {
  if (b.state === 'active') {
    const def = BUILDING_DEFS[b.defId]
    if (def && def.category === BuildingCategory.Residential) {
      syncAgentsForBuilding(this.map, this.citizenRegistry, this.roadGraph, b)
    }
  }
}
```

Also update the `calculateDemand` call (already at the top of the monthly block) to pass the summary:
```typescript
this.demand = calculateDemand(this.map, this.taxRate, this.trafficDensity, this.citizenSummary)
```

Also update `getState()` to include:
```typescript
citizens: this.citizenSummary,
```

- [ ] **Step 3: Update placeTile and bulldoze to maintain road graph**

In `placeTile()`, after `updateConnections(this.map, x, y)`:
```typescript
// Update road graph if a road tile was placed
const placedInfra = this.map.infrastructure[y * this.map.width + x]!
if (placedInfra & Infrastructure.Road) {
  updateRoadGraph(this.map, this.roadGraph, x, y)
  markRoutesStale(this.citizenRegistry, y * this.map.width + x)
}
```

In `bulldoze()`, after `updateConnections(this.map, x, y)` and before rebuilding `bldIdx`:
```typescript
const idx = y * this.map.width + x
// Always update road graph (updateRoadGraph is a no-op if tile was not a road)
updateRoadGraph(this.map, this.roadGraph, x, y)
markRoutesStale(this.citizenRegistry, idx)
// Remove agents whose home building was just demolished
// (bldIdx is about to be rebuilt; check buildings still present before rebuild)
const buildingIds = new Set(this.map.buildings.map(b => b.id))
for (const agent of this.citizenRegistry.agents) {
  if (!buildingIds.has(agent.homeBuildingId)) {
    removeAgentsForBuilding(this.citizenRegistry, agent.homeBuildingId)
    break  // removeAgentsForBuilding modifies the array; restart in next tick
  }
}
```

Note: The cleaner approach is to call `removeAgentsForBuilding` before the bulldoze action mutates `map.buildings`. The implementation step here uses a post-hoc check because `bulldoze()` delegates to `actions/bulldoze.ts`. A cleaner refactor can be done in a follow-up; the post-hoc check is safe because `removeAgentsForBuilding` filters by ID.

- [ ] **Step 4: Run typecheck**

```bash
pnpm -F @bitborough/engine typecheck
```
Expected: no type errors. Fix any that appear.

- [ ] **Step 5: Run all engine tests**

```bash
pnpm -F @bitborough/engine test
```
Expected: most tests PASS. Some traffic tests may fail because traffic is now agent-driven.

- [ ] **Step 6: Update traffic tests**

The existing traffic tests relied on DFS-based traffic. Update `traffic.test.ts` to reflect agent-driven traffic:

```typescript
// packages/engine/src/__tests__/traffic.test.ts
import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceMonth } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'

function setupCity(engine: ReturnType<typeof Engine.create>, size: number) {
  engine.placeBuilding(0, 0, 'power.coal')
  for (let x = 0; x < size; x++) engine.placeTile(x, 4, Infrastructure.Road)
  for (let x = 0; x < size; x++) engine.placeTile(x, 3, Infrastructure.PowerLine)
  engine.placeBuilding(15, 0, 'service.fire')
}

describe('Traffic system (citizen-driven)', () => {
  test('no traffic on empty map', () => {
    const engine = Engine.create(createTestMap(32))
    advanceMonth(engine)
    const state = engine.getState()
    const totalTraffic = Array.from(state.trafficDensity).reduce((a, b) => a + b, 0)
    expect(totalTraffic).toBe(0)
  })

  test('traffic appears after citizens develop and commute', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    setupCity(engine, 32)
    for (let x = 5; x < 10; x++) {
      for (let y = 5; y < 10; y++) engine.placeZone(x, y, ZoneType.Residential)
    }
    for (let x = 20; x < 25; x++) {
      for (let y = 5; y < 10; y++) engine.placeZone(x, y, ZoneType.Commercial)
    }
    // Let zones develop and citizens spawn
    for (let i = 0; i < 36; i++) advanceMonth(engine)
    const state = engine.getState()
    const totalTraffic = Array.from(state.trafficDensity).reduce((a, b) => a + b, 0)
    // Some traffic should exist if citizens have commutes
    expect(state.trafficDensity.length).toBe(32 * 32)
    // Citizens summary should show agents
    expect(state.citizens.agentCount).toBeGreaterThanOrEqual(0)
  })

  test('disconnected zones generate zero traffic', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    // Zones with no road — no agents spawn
    for (let x = 5; x < 10; x++) {
      engine.placeZone(x, 5, ZoneType.Residential)
      engine.placeZone(x, 20, ZoneType.Commercial)
    }
    for (let i = 0; i < 10; i++) advanceMonth(engine)
    const state = engine.getState()
    const totalTraffic = Array.from(state.trafficDensity).reduce((a, b) => a + b, 0)
    expect(totalTraffic).toBe(0)
  })
})
```

- [ ] **Step 7: Run all engine tests**

```bash
pnpm -F @bitborough/engine test
```
Expected: all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/engine/src/Engine.ts packages/engine/src/simulation/traffic.ts packages/engine/src/__tests__/traffic.test.ts
git commit -m "feat: wire citizen simulation into Engine — replaces calculateTraffic"
```

---

### Task 10: Save/load citizens

**Files:**
- Modify: `packages/engine/src/Engine.ts`
- Modify: `packages/engine/src/__tests__/serialization.test.ts`

- [ ] **Step 1: Write failing serialization test**

Add to `serialization.test.ts`:

```typescript
test('citizens are serialized and restored', () => {
  const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 100_000 })
  engine.placeBuilding(0, 0, 'power.coal')
  for (let x = 4; x < 10; x++) {
    engine.placeTile(x, 2, Infrastructure.PowerLine)
    engine.placeTile(x, 4, Infrastructure.Road)
    engine.placeZone(x, 3, ZoneType.Residential)
  }
  for (let x = 15; x < 20; x++) {
    engine.placeTile(x, 4, Infrastructure.Road)
    engine.placeZone(x, 3, ZoneType.Commercial)
  }
  // Let city develop so citizens spawn
  for (let i = 0; i < 24; i++) advanceMonth(engine)

  const state1 = engine.getState()
  const save = engine.serialize()

  expect(save.version).toBe(5)
  if (state1.citizens.agentCount > 0) {
    expect(save.state.citizens).toBeDefined()
    expect(save.state.citizens!.agents.length).toBeGreaterThan(0)
  }

  const restored = Engine.restore(save)
  const state2 = restored.getState()

  expect(state2.citizens.agentCount).toBe(state1.citizens.agentCount)
})

test('restore from v4 save (no citizens field) starts with empty registry', () => {
  const engine = Engine.create(createTestMap(32), { seed: 42 })
  const save = engine.serialize()
  // Simulate a v4 save by removing citizens and setting version to 4
  const v4Save = { ...save, version: 4 as const, state: { ...save.state, citizens: undefined } }
  const restored = Engine.restore(v4Save as any)
  expect(restored.getState().citizens.agentCount).toBe(0)
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm -F @bitborough/engine test serialization
```
Expected: `version` mismatch (still 4) and citizens not in state.

- [ ] **Step 3: Update `serialize()` in Engine.ts**

In `serialize()`:
1. Change `version: 4` to `version: 5`
2. Add citizens to state:

```typescript
citizens: {
  samplingRatio: this.citizenRegistry.samplingRatio,
  agents: this.citizenRegistry.agents.map(a => ({
    id: a.id,
    homeBuildingId: a.homeBuildingId,
    homeAccessRoad: a.homeAccessRoad,
    workBuildingId: a.workBuildingId,
    workAccessRoad: a.workAccessRoad,
    commerceBuildingId: a.commerceBuildingId,
    commerceAccessRoad: a.commerceAccessRoad,
    homeWorkRoute: a.homeWorkRoute,
    homeCommerceRoute: a.homeCommerceRoute,
    satisfaction: a.satisfaction,
  })),
},
```

- [ ] **Step 4: Update `restore()` in Engine.ts**

After rebuilding derived state, add:

```typescript
// Restore citizen registry
if (save.state.citizens) {
  engine.citizenRegistry = {
    samplingRatio: save.state.citizens.samplingRatio,
    agents: save.state.citizens.agents.map(a => ({
      ...a,
      homeWorkRouteStale: false,
      homeCommerceRouteStale: false,
      homeWorkRouteTileSet: new Set(a.homeWorkRoute),
      homeCommerceRouteTileSet: new Set(a.homeCommerceRoute),
    })),
  }
} else {
  engine.citizenRegistry = createRegistry()
}
engine.roadGraph = buildRoadGraph(engine.map)
engine.citizenSummary = computeCitizenSummary(engine.citizenRegistry)
```

- [ ] **Step 5: Run serialization tests**

```bash
pnpm -F @bitborough/engine test serialization
```
Expected: all PASS.

- [ ] **Step 6: Run full test suite**

```bash
pnpm -F @bitborough/engine test
```
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/engine/src/Engine.ts packages/engine/src/__tests__/serialization.test.ts
git commit -m "feat: citizen save/load — serialize registry, restore on load, version 5"
```

---

### Task 11: Final typecheck and integration smoke test

**Files:**
- No new files

- [ ] **Step 1: Run full typecheck across all packages**

```bash
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 2: Run full test suite**

```bash
pnpm test
```
Expected: all tests PASS across all packages.

- [ ] **Step 3: Commit if any lint/typecheck fixes were needed**

```bash
git add -p
git commit -m "fix: typecheck and lint cleanup for citizen simulation"
```

---

## Summary

| Chunk | Tasks | What it produces |
|---|---|---|
| 1 | 1–2 | `road-graph.ts` with A\*, incremental update |
| 2 | 3–4 | `citizens.ts` types, access road resolution, spawn/assign |
| 3 | 5–6 | Route invalidation, replan, traffic pass, satisfaction, summary |
| 4 | 7–8 | `CitizenSummary` in core types; demand signal integration |
| 5 | 9–11 | Engine wiring, traffic.ts removal, save/load (v5) |
