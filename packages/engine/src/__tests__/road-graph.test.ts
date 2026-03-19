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
