import { describe, test, expect, beforeEach } from 'vitest'
import { SaveManager } from '../storage/SaveManager.js'

const mockStorage: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => { mockStorage[key] = value },
  removeItem: (key: string) => { delete mockStorage[key] },
} as Storage

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
    const data = { version: 1, map: {}, state: {}, timestamp: '' }
    mgr.save(data as any)
    expect(mgr.hasSave()).toBe(true)
    const loaded = mgr.load()
    expect(loaded).toBeDefined()
    expect(loaded!.version).toBe(1)
  })

  test('deleteSave removes save', () => {
    const mgr = new SaveManager(mockLocalStorage)
    mgr.save({ version: 1 } as any)
    expect(mgr.hasSave()).toBe(true)
    mgr.deleteSave()
    expect(mgr.hasSave()).toBe(false)
  })
})
