import { describe, test, expect } from 'vitest'
import { Engine } from '@bitborough/engine'
import { createEmptyMap, Infrastructure, ZoneType, TileType } from '@bitborough/core'
import { InfrastructureTool } from '../tools/InfrastructureTool.js'
import { ZoneTool } from '../tools/ZoneTool.js'
import { BulldozeTool } from '../tools/BulldozeTool.js'
import { BuildingTool } from '../tools/BuildingTool.js'
import { QueryTool } from '../tools/QueryTool.js'
import { ToolManager } from '../tools/ToolManager.js'

function createTestEngine(size = 10) {
  const map = createEmptyMap(size, size, {
    name: 'Test',
    seed: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
  })
  return Engine.create(map)
}

describe('InfrastructureTool', () => {
  test('places road on grass tile', () => {
    const engine = createTestEngine()
    const tool = new InfrastructureTool('Road', Infrastructure.Road, 'rgba(85,85,85,0.5)')
    const result = tool.onTileClick(5, 5, engine)
    expect(result.ok).toBe(true)
    const tile = engine.getTile(5, 5)
    expect(tile.infrastructure & Infrastructure.Road).toBeTruthy()
  })

  test('places power line on grass tile', () => {
    const engine = createTestEngine()
    const tool = new InfrastructureTool('Power Line', Infrastructure.PowerLine, 'rgba(255,193,7,0.5)')
    const result = tool.onTileClick(5, 5, engine)
    expect(result.ok).toBe(true)
    const tile = engine.getTile(5, 5)
    expect(tile.infrastructure & Infrastructure.PowerLine).toBeTruthy()
  })
})

describe('ZoneTool', () => {
  test('places residential zone', () => {
    const engine = createTestEngine()
    const tool = new ZoneTool(ZoneType.Residential)
    const result = tool.onTileClick(5, 5, engine)
    expect(result.ok).toBe(true)
    expect(engine.getTile(5, 5).zone).toBe(ZoneType.Residential)
  })
})

describe('BulldozeTool', () => {
  test('bulldozes road', () => {
    const engine = createTestEngine()
    engine.placeTile(5, 5, Infrastructure.Road)
    const tool = new BulldozeTool()
    const result = tool.onTileClick(5, 5, engine)
    expect(result.ok).toBe(true)
  })
})

describe('BuildingTool', () => {
  test('places coal plant', () => {
    const engine = createTestEngine(20)
    const tool = new BuildingTool('power.coal')
    const result = tool.onTileClick(5, 5, engine)
    expect(result.ok).toBe(true)
  })
})

describe('QueryTool', () => {
  test('returns tile info without modifying state', () => {
    const engine = createTestEngine()
    const tool = new QueryTool()
    const result = tool.onTileClick(5, 5, engine)
    expect(result.ok).toBe(true)
    expect(tool.lastQuery).toBeDefined()
    expect(tool.lastQuery!.terrain).toBe(TileType.Grass)
  })
})

describe('ToolManager', () => {
  test('tracks active tool', () => {
    const manager = new ToolManager()
    const tool = new InfrastructureTool('Road', Infrastructure.Road, 'rgba(85,85,85,0.5)')
    manager.setTool(tool)
    expect(manager.activeTool).toBe(tool)
  })
})
