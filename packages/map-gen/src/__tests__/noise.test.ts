import { describe, test, expect } from 'vitest'
import { PRNG } from '../prng.js'
import { createNoise2D } from '../noise.js'

describe('PRNG', () => {
  test('same seed produces same sequence', () => {
    const a = new PRNG(42)
    const b = new PRNG(42)
    for (let i = 0; i < 100; i++) {
      expect(a.next()).toBe(b.next())
    }
  })

  test('different seeds produce different sequences', () => {
    const a = new PRNG(42)
    const b = new PRNG(99)
    let same = 0
    for (let i = 0; i < 100; i++) {
      if (a.next() === b.next()) same++
    }
    expect(same).toBeLessThan(5)
  })

  test('values are in [0, 1)', () => {
    const prng = new PRNG(42)
    for (let i = 0; i < 1000; i++) {
      const v = prng.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('Simplex noise', () => {
  test('same inputs produce same output', () => {
    const noise = createNoise2D(new PRNG(42))
    const a = noise(1.5, 2.3)
    const noise2 = createNoise2D(new PRNG(42))
    const b = noise2(1.5, 2.3)
    expect(a).toBe(b)
  })

  test('output is in [-1, 1]', () => {
    const noise = createNoise2D(new PRNG(42))
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        const v = noise(x * 0.1, y * 0.1)
        expect(v).toBeGreaterThanOrEqual(-1)
        expect(v).toBeLessThanOrEqual(1)
      }
    }
  })

  test('values vary across space', () => {
    const noise = createNoise2D(new PRNG(42))
    const values = new Set<number>()
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        values.add(Math.round(noise(x * 0.5, y * 0.5) * 100))
      }
    }
    expect(values.size).toBeGreaterThan(10)
  })

  test('noise is smooth (nearby inputs produce nearby outputs)', () => {
    const noise = createNoise2D(new PRNG(42))
    const a = noise(1.0, 1.0)
    const b = noise(1.01, 1.0)
    expect(Math.abs(a - b)).toBeLessThan(0.1)
  })
})
