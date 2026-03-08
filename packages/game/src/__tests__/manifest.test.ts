import { describe, it, expect } from 'vitest'

describe('tile manifest', () => {
  it('should define the expected manifest entry shape', () => {
    const entry = {
      id: 'terrain/grass',
      file: 'grass.png',
      category: 'terrain',
      width: 128,
      height: 128,
    }
    expect(entry.id).toBe('terrain/grass')
    expect(entry.width).toBe(128)
    expect(entry.height).toBe(128)
  })
})
