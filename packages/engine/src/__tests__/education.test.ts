import { describe, test, expect } from 'vitest'
import { computeSchoolQuality, SCHOOL_CAPACITY } from '../simulation/services/school.js'

describe('School quality', () => {
  test('quality is 1.0 at or below capacity with full funding', () => {
    expect(computeSchoolQuality(200, 300, 100)).toBe(1.0)
    expect(computeSchoolQuality(300, 300, 100)).toBe(1.0)
    expect(computeSchoolQuality(0, 300, 100)).toBe(1.0)
  })

  test('quality degrades linearly from 100% to 120% capacity', () => {
    expect(computeSchoolQuality(330, 300, 100)).toBeCloseTo(0.75)
    expect(computeSchoolQuality(360, 300, 100)).toBeCloseTo(0.5)
  })

  test('quality scales with funding', () => {
    expect(computeSchoolQuality(300, 300, 50)).toBeCloseTo(0.5)
    expect(computeSchoolQuality(300, 300, 0)).toBe(0)
  })

  test('quality combines funding and overcrowding', () => {
    expect(computeSchoolQuality(360, 300, 50)).toBeCloseTo(0.25)
  })

  test('SCHOOL_CAPACITY has correct values', () => {
    expect(SCHOOL_CAPACITY['service.school']).toBe(300)
    expect(SCHOOL_CAPACITY['service.school.small']).toBe(50)
  })
})
