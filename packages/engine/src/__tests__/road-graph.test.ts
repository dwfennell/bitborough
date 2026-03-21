import { describe, test, expect } from 'vitest'
import { createTestMap } from '../test-helpers.js'
import { buildRoadGraph, updateRoadGraph, astar } from '../road-graph.js'
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
    // Should route via y=1: 0→4→5→6→7→3 or 0→4→5→6→2→3
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

  test('prefers uncongested route over shorter congested route (BPR)', () => {
    // 8-wide grid. Two parallel routes from tile 0 to tile 3:
    //
    //   Row 0 (y=0): 0 - 1 - 2 - 3   (short path: 3 edges, 4 tiles)
    //   Row 1 (y=1): 8 - 9 -10 -11   (long path via y=1: 6 edges, 7 tiles)
    //
    // Connect rows: 0↔8 and 3↔11
    const map = createTestMap(8)
    // Short top path
    for (let x = 0; x < 4; x++) map.infrastructure[x] = Infrastructure.Road
    // Long bottom path
    for (let x = 0; x < 4; x++) map.infrastructure[8 + x] = Infrastructure.Road
    const graph = buildRoadGraph(map)

    // Without traffic, A* picks the short top path (4 tiles)
    const shortPath = astar(graph, 0, 3, map.width)
    expect(shortPath).toEqual([0, 1, 2, 3])

    // Now congest the top path heavily (density 200 on tiles 1, 2)
    const trafficDensity = new Uint8Array(8 * 8)
    trafficDensity[1] = 200
    trafficDensity[2] = 200

    // BPR cost per congested tile: 1 + 0.15 * (200/100)^4 = 1 + 0.15 * 16 = 3.4
    // Short path cost: edgeCost(1) + edgeCost(2) + edgeCost(3) = 3.4 + 3.4 + 1 = 7.8
    // Long path cost (via bottom): all tiles uncongested, 6 edges * 1 = 6
    // So A* should prefer the long bottom path
    const congestedPath = astar(graph, 0, 3, map.width, undefined, trafficDensity)
    expect(congestedPath).not.toBeNull()
    // The path should go through row 1 (indices 8-11)
    expect(congestedPath!.some(t => t >= 8 && t <= 11)).toBe(true)
    expect(congestedPath![0]).toBe(0)
    expect(congestedPath![congestedPath!.length - 1]).toBe(3)
  })

  test('without trafficDensity, uses uniform cost (backward compatible)', () => {
    // Same grid as above, but without trafficDensity param
    const map = createTestMap(8)
    for (let x = 0; x < 4; x++) map.infrastructure[x] = Infrastructure.Road
    for (let x = 0; x < 4; x++) map.infrastructure[8 + x] = Infrastructure.Road
    const graph = buildRoadGraph(map)

    // Even though we could pass congestion, calling without it should use uniform cost
    const path = astar(graph, 0, 3, map.width)
    // Should pick shortest path (top row)
    expect(path).toEqual([0, 1, 2, 3])
  })
})
