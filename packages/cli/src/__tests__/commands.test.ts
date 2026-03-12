import { describe, test, expect, afterEach } from 'vitest'
import { unlinkSync, existsSync } from 'fs'
import { Engine } from '@bitborough/engine'
import { generateMap } from '@bitborough/map-gen'
import { Infrastructure } from '@bitborough/core'

const TEST_FILE = '/tmp/bitt-test-game.json'

afterEach(() => {
  if (existsSync(TEST_FILE)) unlinkSync(TEST_FILE)
})

describe('state: load/save roundtrip', () => {
  test('serialized engine restores with same funds', () => {
    const map = generateMap({ size: 32, seed: 42, preset: 'plains' })
    const engine = Engine.create(map)
    const save = engine.serialize()
    const restored = Engine.restore(save)
    expect(restored.getState().funds).toBe(engine.getState().funds)
  })
})

describe('getTile hasRoadAccess', () => {
  test('returns false on tile with no nearby road', () => {
    const map = generateMap({ size: 32, seed: 42, preset: 'plains' })
    const engine = Engine.create(map)
    const info = engine.getTile(5, 5)
    expect(info.hasRoadAccess).toBe(false)
  })

  test('returns true after placing road 2 tiles away', () => {
    const map = generateMap({ size: 32, seed: 42, preset: 'plains' })
    const engine = Engine.create(map)
    engine.placeTile(5, 5, Infrastructure.Road)
    const info = engine.getTile(5, 7)
    expect(info.hasRoadAccess).toBe(true)
  })
})
