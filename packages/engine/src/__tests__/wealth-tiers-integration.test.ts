import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceYear } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'

describe('wealth tiers integration', () => {
  test('engine runs multiple months without error and produces tier counts', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })

    engine.placeBuilding(2, 2, 'power.diesel')
    for (let x = 4; x < 8; x++) {
      engine.placeTile(x, 3, Infrastructure.Road)
      engine.placeZone(x, 2, ZoneType.Residential)
      engine.placeTile(x, 1, Infrastructure.PowerLine)
    }
    engine.placeZone(4, 4, ZoneType.Industrial)
    engine.placeZone(5, 4, ZoneType.Industrial)
    engine.placeZone(6, 4, ZoneType.Commercial)

    advanceYear(engine)
    advanceYear(engine)

    const state = engine.getState()
    const summary = state.citizens

    if (summary.agentCount > 0) {
      const [low, mid, high] = summary.tierCounts
      expect(low + mid + high).toBe(summary.agentCount)
    }
  })

  test('serialize/restore round-trip preserves wealth tiers', () => {
    const engine = Engine.create(createTestMap(16), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.diesel')
    for (let x = 2; x < 6; x++) {
      engine.placeTile(x, 2, Infrastructure.Road)
      engine.placeZone(x, 1, ZoneType.Residential)
    }

    advanceYear(engine)

    const save = engine.serialize()
    const restored = Engine.restore(save)
    const restoredSave = restored.serialize()

    expect(restoredSave.state.citizens!.agents.length).toBe(save.state.citizens!.agents.length)
    for (let i = 0; i < save.state.citizens!.agents.length; i++) {
      expect(restoredSave.state.citizens!.agents[i]!.wealthTier).toBe(save.state.citizens!.agents[i]!.wealthTier)
    }
  })

  test('reputation layer is preserved across save/restore', () => {
    const engine = Engine.create(createTestMap(16), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.diesel')
    for (let x = 2; x < 6; x++) {
      engine.placeTile(x, 2, Infrastructure.Road)
      engine.placeZone(x, 1, ZoneType.Residential)
    }

    advanceYear(engine)

    const save = engine.serialize()
    expect(save.state.reputationLayer).toBeDefined()
    expect(save.state.reputationLayer!.length).toBe(16 * 16)

    const restored = Engine.restore(save)
    const reSave = restored.serialize()
    expect(reSave.state.reputationLayer!).toEqual(save.state.reputationLayer!)
  })
})
