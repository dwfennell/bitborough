import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap } from '../test-helpers.js'
import { SimSpeed } from '@rcity/core'

describe('Engine', () => {
  test('can be created from a map', () => {
    const map = createTestMap(32)
    const engine = Engine.create(map)
    expect(engine).toBeDefined()
  })

  test('getState returns valid initial state', () => {
    const engine = Engine.create(createTestMap(32))
    const state = engine.getState()
    expect(state.map.width).toBe(32)
    expect(state.map.height).toBe(32)
    expect(state.time.tickCount).toBe(0)
    expect(state.time.month).toBe(1)
    expect(state.time.year).toBe(1900)
    expect(state.time.speed).toBe(SimSpeed.Normal)
    expect(state.population).toBe(0)
    expect(state.funds).toBe(5_000) // 32x32 → $5,000
  })

  test('tick advances tick count', () => {
    const engine = Engine.create(createTestMap(32))
    engine.tick()
    expect(engine.getState().time.tickCount).toBe(1)
    engine.tick()
    expect(engine.getState().time.tickCount).toBe(2)
  })

  test('month advances every 4 ticks', () => {
    const engine = Engine.create(createTestMap(32))
    for (let i = 0; i < 4; i++) engine.tick()
    expect(engine.getState().time.month).toBe(2)
    for (let i = 0; i < 4; i++) engine.tick()
    expect(engine.getState().time.month).toBe(3)
  })

  test('year advances every 12 months', () => {
    const engine = Engine.create(createTestMap(32))
    for (let i = 0; i < 48; i++) engine.tick() // 4 ticks × 12 months
    expect(engine.getState().time.year).toBe(1901)
    expect(engine.getState().time.month).toBe(1)
  })

  test('deterministic with same seed', () => {
    const e1 = Engine.create(createTestMap(32), { seed: 42 })
    const e2 = Engine.create(createTestMap(32), { seed: 42 })
    for (let i = 0; i < 10; i++) {
      e1.tick()
      e2.tick()
    }
    expect(e1.getState().time.tickCount).toBe(e2.getState().time.tickCount)
    expect(e1.getState().funds).toBe(e2.getState().funds)
  })
})
