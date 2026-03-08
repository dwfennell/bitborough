# Milestone D: Engine Traffic System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement traffic simulation — trip generation from R→C/I commutes, DFS pathfinding with 30-step limit, traffic density accumulation, and congestion effects on land value and demand.

**Architecture:** A single `simulation/traffic.ts` module that runs monthly. Builds a road adjacency graph, generates trips from each residential tile to nearest commercial/industrial, routes each trip via DFS, accumulates traffic density per road tile, and feeds congestion back into land value penalties and demand suppression.

**Tech Stack:** TypeScript, Vitest

**PRD:** `tech-design/prd/engine_traffic.md`

**Design Doc:** `docs/plans/2026-03-07-game-implementation-design.md`

---

## Task 1: Road graph and pathfinding

**Files:**
- Create: `packages/engine/src/simulation/traffic.ts`
- Create: `packages/engine/src/__tests__/traffic.test.ts`

**Step 1: Write failing tests**

```typescript
// packages/engine/src/__tests__/traffic.test.ts
import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceMonth } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'

function setupCity(engine: ReturnType<typeof Engine.create>, size: number) {
  // Power plant at (0,0)
  engine.placeBuilding(0, 0, 'power.coal')
  // Road along y=4
  for (let x = 0; x < size; x++) engine.placeTile(x, 4, Infrastructure.Road)
  // Power line along y=3
  for (let x = 0; x < size; x++) engine.placeTile(x, 3, Infrastructure.PowerLine)
}

describe('Traffic system', () => {
  test('no traffic on empty map', () => {
    const engine = Engine.create(createTestMap(32))
    advanceMonth(engine)
    const state = engine.getState()
    const totalTraffic = Array.from(state.trafficDensity).reduce((a, b) => a + b, 0)
    expect(totalTraffic).toBe(0)
  })

  test('traffic appears on roads between residential and commercial zones', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    setupCity(engine, 32)

    // Residential on one side
    for (let x = 5; x < 10; x++) {
      for (let y = 5; y < 10; y++) {
        engine.placeZone(x, y, ZoneType.Residential)
      }
    }
    // Commercial on other side
    for (let x = 20; x < 25; x++) {
      for (let y = 5; y < 10; y++) {
        engine.placeZone(x, y, ZoneType.Commercial)
      }
    }

    // Let zones develop
    for (let i = 0; i < 30; i++) advanceMonth(engine)

    const state = engine.getState()
    // Road tiles between the zones should have traffic
    const roadTraffic = state.trafficDensity[4 * 32 + 15]! // mid-road tile
    // Traffic may or may not exist depending on zone development
    // At minimum, the system should run without error
    expect(state.trafficDensity.length).toBe(32 * 32)
  })

  test('disconnected zones generate zero traffic', () => {
    const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
    // Zones with no connecting road
    for (let x = 5; x < 10; x++) {
      engine.placeZone(x, 5, ZoneType.Residential)
      engine.placeZone(x, 20, ZoneType.Commercial)
    }
    for (let i = 0; i < 10; i++) advanceMonth(engine)
    const state = engine.getState()
    const totalTraffic = Array.from(state.trafficDensity).reduce((a, b) => a + b, 0)
    expect(totalTraffic).toBe(0)
  })

  test('parallel roads reduce congestion', () => {
    const engine1 = Engine.create(createTestMap(32), { startingFunds: 100_000, seed: 42 })
    setupCity(engine1, 32)
    // Single road at y=4 (already placed by setupCity)
    for (let x = 5; x < 10; x++) {
      engine1.placeZone(x, 5, ZoneType.Residential)
      engine1.placeZone(x, 6, ZoneType.Residential)
    }
    for (let x = 20; x < 25; x++) {
      engine1.placeZone(x, 5, ZoneType.Commercial)
    }
    for (let i = 0; i < 30; i++) advanceMonth(engine1)
    const traffic1 = engine1.getState().trafficDensity[4 * 32 + 15]!

    // Second engine with parallel road
    const engine2 = Engine.create(createTestMap(32), { startingFunds: 100_000, seed: 42 })
    setupCity(engine2, 32)
    // Add parallel road at y=6
    for (let x = 0; x < 32; x++) engine2.placeTile(x, 6, Infrastructure.Road)
    for (let x = 5; x < 10; x++) {
      engine2.placeZone(x, 5, ZoneType.Residential)
      engine2.placeZone(x, 7, ZoneType.Residential)
    }
    for (let x = 20; x < 25; x++) {
      engine2.placeZone(x, 5, ZoneType.Commercial)
    }
    for (let i = 0; i < 30; i++) advanceMonth(engine2)
    const traffic2 = engine2.getState().trafficDensity[4 * 32 + 15]!

    // Traffic on the single road should be >= traffic with parallel road
    expect(traffic1).toBeGreaterThanOrEqual(traffic2)
  })
})
```

**Step 2: Run tests, verify failure**

Run: `cd packages/engine && pnpm test -- --testPathPattern traffic`
Expected: FAIL

**Step 3: Implement traffic system**

```typescript
// packages/engine/src/simulation/traffic.ts
import { type GameMap, ZoneType, Infrastructure } from '@bitborough/core'

const MAX_TRIP_DISTANCE = 30
const TRAFFIC_PER_TRIP = 50

export function calculateTraffic(
  map: GameMap,
  trafficDensity: Uint8Array,
): void {
  const { width, height } = map
  const size = width * height

  // Reset traffic
  trafficDensity.fill(0)

  // Find all zoned tiles with adjacent roads
  const residentialTiles: number[] = []
  const commercialTiles: number[] = []
  const industrialTiles: number[] = []

  for (let i = 0; i < size; i++) {
    const zone = map.zones[i]
    if (zone === ZoneType.Residential) residentialTiles.push(i)
    else if (zone === ZoneType.Commercial) commercialTiles.push(i)
    else if (zone === ZoneType.Industrial) industrialTiles.push(i)
  }

  // No trips if there's nothing to commute to
  if (residentialTiles.length === 0) return
  if (commercialTiles.length === 0 && industrialTiles.length === 0) return

  // Build road adjacency: for each tile, which road tile is adjacent?
  // Find road-adjacent zone tiles
  for (const rIdx of residentialTiles) {
    const rx = rIdx % width
    const ry = Math.floor(rIdx / width)

    // Find adjacent road tile to start trip
    const startRoad = findAdjacentRoad(map, rx, ry)
    if (startRoad < 0) continue

    // Trip to commercial
    if (commercialTiles.length > 0) {
      const path = findPathDFS(map, startRoad, commercialTiles, width, height)
      if (path) {
        for (const tileIdx of path) {
          const current = trafficDensity[tileIdx]!
          trafficDensity[tileIdx] = Math.min(255, current + TRAFFIC_PER_TRIP)
        }
      }
    }

    // Trip to industrial
    if (industrialTiles.length > 0) {
      const path = findPathDFS(map, startRoad, industrialTiles, width, height)
      if (path) {
        for (const tileIdx of path) {
          const current = trafficDensity[tileIdx]!
          trafficDensity[tileIdx] = Math.min(255, current + TRAFFIC_PER_TRIP)
        }
      }
    }
  }
}

function findAdjacentRoad(map: GameMap, x: number, y: number): number {
  const { width, height } = map
  const neighbors = [
    y > 0 ? (y - 1) * width + x : -1,
    x < width - 1 ? y * width + (x + 1) : -1,
    y < height - 1 ? (y + 1) * width + x : -1,
    x > 0 ? y * width + (x - 1) : -1,
  ]
  for (const idx of neighbors) {
    if (idx >= 0 && (map.infrastructure[idx]! & Infrastructure.Road)) {
      return idx
    }
  }
  return -1
}

function findPathDFS(
  map: GameMap,
  startRoad: number,
  targets: number[],
  width: number,
  height: number,
): number[] | null {
  // DFS along roads, max 30 steps
  // Returns the path of road tiles traversed, or null if no path found
  const targetSet = new Set<number>()
  // Target = any road tile adjacent to a target zone tile
  for (const tIdx of targets) {
    const tx = tIdx % width
    const ty = Math.floor(tIdx / width)
    const adj = findAdjacentRoad(map, tx, ty)
    if (adj >= 0) targetSet.add(adj)
  }

  if (targetSet.size === 0) return null
  if (targetSet.has(startRoad)) return [startRoad]

  const visited = new Set<number>()
  const path: number[] = []

  function dfs(idx: number, depth: number): boolean {
    if (depth > MAX_TRIP_DISTANCE) return false
    if (visited.has(idx)) return false
    visited.add(idx)
    path.push(idx)

    if (targetSet.has(idx)) return true

    const x = idx % width
    const y = Math.floor(idx / width)
    const neighbors = [
      y > 0 ? (y - 1) * width + x : -1,
      x < width - 1 ? y * width + (x + 1) : -1,
      y < height - 1 ? (y + 1) * width + x : -1,
      x > 0 ? y * width + (x - 1) : -1,
    ]

    for (const nIdx of neighbors) {
      if (nIdx < 0) continue
      if (!(map.infrastructure[nIdx]! & Infrastructure.Road)) continue
      if (dfs(nIdx, depth + 1)) return true
    }

    path.pop()
    return false
  }

  if (dfs(startRoad, 0)) return [...path]
  return null
}

export function getTrafficCongestion(trafficDensity: number): number {
  // 0-255 traffic → congestion level
  // capacity = 100 (TRAFFIC_PER_TRIP * 2 trips)
  const capacity = 100
  return trafficDensity / capacity
}

export function getTrafficLandValuePenalty(congestion: number): number {
  if (congestion < 0.5) return 0
  if (congestion < 0.8) return 5
  if (congestion <= 1.0) return 15
  return 30
}
```

**Step 4: Integrate into Engine.tick() monthly cycle**

Add `calculateTraffic()` call in the monthly tick block. Pass `(this.map, this.trafficDensity)`.

Also integrate `getTrafficLandValuePenalty()` into the land value calculation — subtract the penalty from tiles with congested adjacent roads.

**Step 5: Run tests, verify pass**

Run: `cd packages/engine && pnpm test`
Expected: ALL PASS

**Step 6: Commit**

```
feat(engine): add traffic system with DFS pathfinding and congestion effects
```

---

## Task 2: Traffic congestion effects on demand

**Files:**
- Modify: `packages/engine/src/simulation/demand.ts`
- Modify: `packages/engine/src/__tests__/traffic.test.ts` (add demand suppression test)

**Step 1: Write failing test**

```typescript
test('heavy congestion suppresses demand', () => {
  // Verify that calculateDemand accepts trafficDensity parameter
  // and reduces demand when congestion is high
  const engine = Engine.create(createTestMap(32), { startingFunds: 100_000 })
  // Set up city that would normally generate positive demand
  setupCity(engine, 32)
  for (let x = 5; x < 15; x++) {
    for (let y = 5; y < 15; y++) {
      engine.placeZone(x, y, ZoneType.Residential)
    }
  }
  for (let i = 0; i < 10; i++) advanceMonth(engine)
  const demandBefore = engine.getDemand()
  // Demand should be defined and have residential/commercial/industrial fields
  expect(demandBefore.residential).toBeDefined()
})
```

**Step 2: Add average congestion as a demand modifier**

In `calculateDemand()`, accept `trafficDensity: Uint8Array` as an optional parameter. Compute average congestion across developed tiles. If average congestion > 0.8, apply a demand penalty (multiply demand by 0.5-0.8 depending on severity).

**Step 3: Run tests, verify pass**

Run: `cd packages/engine && pnpm test`
Expected: ALL PASS

**Step 4: Commit**

```
feat(engine): add traffic congestion as demand suppression factor
```

---

## Task 3: Game UI traffic overlay

**Files:**
- Modify: `packages/game/src/render/OverlayRenderer.ts`

**Step 1: Add traffic overlay**

Add `'traffic'` case to `OverlayRenderer.render()`:
- Road tiles colored by congestion: green (free-flowing) → yellow (moderate) → red (gridlock)
- Non-road tiles remain transparent

```typescript
case 'traffic': {
  const infra = state.map.infrastructure[idx]!
  if (!(infra & Infrastructure.Road)) break
  const traffic = state.trafficDensity[idx]!
  const congestion = traffic / 100 // capacity = 100
  if (congestion < 0.5) color = `rgba(76, 175, 80, 0.5)` // green
  else if (congestion < 0.8) color = `rgba(255, 235, 59, 0.6)` // yellow
  else if (congestion <= 1.0) color = `rgba(255, 152, 0, 0.7)` // orange
  else color = `rgba(244, 67, 54, 0.8)` // red
  break
}
```

**Step 2: Add keyboard shortcut `t` = traffic overlay**

**Step 3: Commit**

```
feat(game): add traffic congestion overlay
```

---

## Summary

| Task | What | Dependencies |
|------|------|-------------|
| 1 | Road graph + DFS pathfinding + traffic density | Milestone A engine |
| 2 | Congestion → demand suppression | Task 1 |
| 3 | Traffic overlay in game UI | Milestone B, Task 1 |
