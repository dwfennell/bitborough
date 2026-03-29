import { describe, test, expect } from 'vitest'
import { PRNG } from '../prng.js'

describe('PRNG', () => {
  describe('determinism', () => {
    test('same seed produces same sequence', () => {
      const a = new PRNG(42)
      const b = new PRNG(42)
      for (let i = 0; i < 100; i++) {
        expect(a.next()).toBe(b.next())
      }
    })

    test('same seed produces same nextInt sequence', () => {
      const a = new PRNG(123)
      const b = new PRNG(123)
      for (let i = 0; i < 100; i++) {
        expect(a.nextInt(0, 100)).toBe(b.nextInt(0, 100))
      }
    })
  })

  describe('different seeds', () => {
    test('different seeds produce different sequences', () => {
      const a = new PRNG(42)
      const b = new PRNG(99)
      let same = 0
      for (let i = 0; i < 100; i++) {
        if (a.next() === b.next()) same++
      }
      expect(same).toBeLessThan(5)
    })
  })

  describe('next() range', () => {
    test('values are in [0, 1)', () => {
      const prng = new PRNG(42)
      for (let i = 0; i < 10_000; i++) {
        const v = prng.next()
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(1)
      }
    })

    test('seed 0 produces values in [0, 1)', () => {
      const prng = new PRNG(0)
      for (let i = 0; i < 1000; i++) {
        const v = prng.next()
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(1)
      }
    })

    test('negative seed produces values in [0, 1)', () => {
      const prng = new PRNG(-12345)
      for (let i = 0; i < 1000; i++) {
        const v = prng.next()
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(1)
      }
    })
  })

  describe('nextInt() range', () => {
    test('values are in [min, max] inclusive', () => {
      const prng = new PRNG(42)
      for (let i = 0; i < 10_000; i++) {
        const v = prng.nextInt(5, 10)
        expect(v).toBeGreaterThanOrEqual(5)
        expect(v).toBeLessThanOrEqual(10)
        expect(Number.isInteger(v)).toBe(true)
      }
    })

    test('min equals max returns that value', () => {
      const prng = new PRNG(42)
      for (let i = 0; i < 100; i++) {
        expect(prng.nextInt(7, 7)).toBe(7)
      }
    })

    test('negative range works correctly', () => {
      const prng = new PRNG(42)
      for (let i = 0; i < 1000; i++) {
        const v = prng.nextInt(-10, -5)
        expect(v).toBeGreaterThanOrEqual(-10)
        expect(v).toBeLessThanOrEqual(-5)
        expect(Number.isInteger(v)).toBe(true)
      }
    })

    test('range spanning zero works correctly', () => {
      const prng = new PRNG(42)
      for (let i = 0; i < 1000; i++) {
        const v = prng.nextInt(-3, 3)
        expect(v).toBeGreaterThanOrEqual(-3)
        expect(v).toBeLessThanOrEqual(3)
        expect(Number.isInteger(v)).toBe(true)
      }
    })

    test('hits both endpoints over many samples', () => {
      const prng = new PRNG(42)
      let sawMin = false
      let sawMax = false
      for (let i = 0; i < 10_000; i++) {
        const v = prng.nextInt(1, 6)
        if (v === 1) sawMin = true
        if (v === 6) sawMax = true
      }
      expect(sawMin).toBe(true)
      expect(sawMax).toBe(true)
    })
  })

  describe('state round-trip', () => {
    test('getInternalState then fromState produces the same continuation', () => {
      const prng = new PRNG(42)
      // Advance a few steps
      for (let i = 0; i < 50; i++) prng.next()

      const state = prng.getInternalState()
      const restored = PRNG.fromState(state)

      // Both should produce identical sequences going forward
      for (let i = 0; i < 100; i++) {
        expect(prng.next()).toBe(restored.next())
      }
    })

    test('fromState with nextInt continues identically', () => {
      const prng = new PRNG(999)
      for (let i = 0; i < 20; i++) prng.next()

      const state = prng.getInternalState()
      const restored = PRNG.fromState(state)

      for (let i = 0; i < 100; i++) {
        expect(prng.nextInt(0, 1000)).toBe(restored.nextInt(0, 1000))
      }
    })

    test('getInternalState returns a number', () => {
      const prng = new PRNG(42)
      prng.next()
      const state = prng.getInternalState()
      expect(typeof state).toBe('number')
    })
  })

  describe('distribution', () => {
    test('next() values are roughly uniformly distributed', () => {
      const prng = new PRNG(42)
      const bucketCount = 10
      const buckets = new Array(bucketCount).fill(0)
      const samples = 100_000

      for (let i = 0; i < samples; i++) {
        const v = prng.next()
        const bucket = Math.min(Math.floor(v * bucketCount), bucketCount - 1)
        buckets[bucket]++
      }

      const expected = samples / bucketCount
      for (let i = 0; i < bucketCount; i++) {
        // Each bucket should be within 10% of the expected count
        expect(buckets[i]).toBeGreaterThan(expected * 0.9)
        expect(buckets[i]).toBeLessThan(expected * 1.1)
      }
    })

    test('nextInt() hits all values in a small range', () => {
      const prng = new PRNG(42)
      const counts = new Map<number, number>()
      const samples = 10_000

      for (let i = 0; i < samples; i++) {
        const v = prng.nextInt(1, 6)
        counts.set(v, (counts.get(v) ?? 0) + 1)
      }

      // All 6 values should appear
      expect(counts.size).toBe(6)

      // Each value should appear roughly equally (within 30% of expected)
      const expected = samples / 6
      for (const [, count] of counts) {
        expect(count).toBeGreaterThan(expected * 0.7)
        expect(count).toBeLessThan(expected * 1.3)
      }
    })
  })
})
