import { describe, test, expect, beforeEach } from 'vitest'
import { SaveManager } from '../storage/SaveManager.js'
import type { SaveFile } from '@bitborough/core'

const mockStorage: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value
  },
  removeItem: (key: string) => {
    delete mockStorage[key]
  },
} as Storage

const validSave: SaveFile = {
  version: 2,
  map: {
    version: 1,
    width: 8,
    height: 8,
    terrain: new Uint8Array(64),
    zones: new Uint8Array(64),
    infrastructure: new Uint16Array(64),
    connections: new Uint8Array(64),
    elevation: new Uint8Array(64),
    buildings: [],
    meta: { name: 'Test', seed: 1, createdAt: '' },
  },
  state: {
    funds: 10000,
    population: 0,
    month: 1,
    year: 1900,
    tickCount: 0,
    taxRate: 0.07,
    funding: { police: 100, fire: 100, transit: 100 },
    seed: 1,
  },
  timestamp: '2026-01-01T00:00:00Z',
}

describe('SaveManager', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockStorage)) delete mockStorage[key]
  })

  test('hasSave returns false when no save exists', () => {
    const mgr = new SaveManager(mockLocalStorage)
    expect(mgr.hasSave()).toBe(false)
  })

  test('save and load round-trip', () => {
    const mgr = new SaveManager(mockLocalStorage)
    expect(mgr.save(validSave)).toBe(true)
    expect(mgr.hasSave()).toBe(true)
    const loaded = mgr.load()
    expect(loaded).toBeDefined()
    expect(loaded!.version).toBe(2)
  })

  test('deleteSave removes save', () => {
    const mgr = new SaveManager(mockLocalStorage)
    mgr.save(validSave)
    expect(mgr.hasSave()).toBe(true)
    mgr.deleteSave()
    expect(mgr.hasSave()).toBe(false)
  })

  test('load returns null for corrupted JSON', () => {
    mockStorage['bitborough-save'] = '{invalid json'
    const mgr = new SaveManager(mockLocalStorage)
    expect(mgr.load()).toBeNull()
  })

  test('load returns null for invalid save structure', () => {
    mockStorage['bitborough-save'] = JSON.stringify({ foo: 'bar' })
    const mgr = new SaveManager(mockLocalStorage)
    expect(mgr.load()).toBeNull()
  })

  test('save returns false when storage throws', () => {
    const throwingStorage = {
      ...mockLocalStorage,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    } as Storage
    const mgr = new SaveManager(throwingStorage)
    expect(mgr.save(validSave)).toBe(false)
  })
})
