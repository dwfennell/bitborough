import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceMonth, advanceYear } from '../test-helpers.js'

describe('History collection', () => {
  test('history is empty on a fresh engine', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    expect(engine.getState().history).toEqual([])
  })

  test('history gains one snapshot per monthly tick', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    advanceMonth(engine)
    expect(engine.getState().history).toHaveLength(1)
    advanceMonth(engine)
    expect(engine.getState().history).toHaveLength(2)
  })

  test('snapshot contains correct month and year', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    advanceMonth(engine)  // month increments then snapshot captured: month=2, year=1900
    const snap = engine.getState().history[0]!
    expect(snap.month).toBe(2)
    expect(snap.year).toBe(1900)
  })

  test('snapshot fields are numbers', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    advanceMonth(engine)
    const snap = engine.getState().history[0]!
    expect(typeof snap.population).toBe('number')
    expect(typeof snap.funds).toBe('number')
    expect(typeof snap.taxIncome).toBe('number')
    expect(typeof snap.expenses).toBe('number')
    expect(typeof snap.rDemand).toBe('number')
    expect(typeof snap.cDemand).toBe('number')
    expect(typeof snap.iDemand).toBe('number')
  })

  test('history is capped at 1200 entries', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    // Advance 101 years = 1212 months — history should cap at 1200
    for (let i = 0; i < 101; i++) advanceYear(engine)
    expect(engine.getState().history.length).toBe(1200)
  })

  test('history persists through serialize/restore', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    advanceMonth(engine)
    advanceMonth(engine)
    const save = engine.serialize()
    expect(save.state.history).toHaveLength(2)
    const restored = Engine.restore(save)
    expect(restored.getState().history).toHaveLength(2)
    expect(restored.getState().history[0]).toEqual(engine.getState().history[0])
  })

  test('old save without history field restores with empty history', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    const save = engine.serialize()
    // Simulate an old save: remove the history field
    const { history: _hist, ...stateWithout } = save.state as typeof save.state & { history?: unknown }
    void _hist
    const oldSave = { ...save, state: stateWithout }
    const restored = Engine.restore(oldSave as typeof save)
    expect(restored.getState().history).toEqual([])
  })

  test('save version is 7', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    expect(engine.serialize().version).toBe(7)
  })
})
