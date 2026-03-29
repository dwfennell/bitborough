import { describe, test, expect } from 'vitest'
import { createTestMap, makeBuilding } from '../test-helpers.js'
import { buildInfluenceMap, influenceToUint8 } from '../simulation/services/influence.js'

function makeOutput(map: { width: number; height: number }): Float32Array {
  return new Float32Array(map.width * map.height)
}

describe('buildInfluenceMap', () => {
  describe('single building radial decay', () => {
    test('influence is 1.0 at center of a 1x1 building', () => {
      const map = createTestMap(32)
      const output = makeOutput(map)
      // service.police.small is 1x1, center at (10.5, 10.5) -> stamps floor coords
      map.buildings.push(makeBuilding('service.police.small', 10, 10))
      buildInfluenceMap(map, 'service.police.small', 8, 100, output)

      // Center of 1x1 at (10,10) is (10.5, 10.5); tile (10,10) has dx=0, dy=0 from integer floor
      // Actually the stamp loops from cx-r to cx+r, checking dist. The center is (10.5, 10.5).
      // For tile (10,10): dx = 10 - 10.5 = -0.5, dy = 10 - 10.5 = -0.5
      // dist = sqrt(0.25 + 0.25) = ~0.707, influence = 1 - 0.707/8 ≈ 0.912
      // The tile closest to center is actually the 4 tiles around (10.5, 10.5).
      // Let's just check that the center area has high influence (close to 1.0).
      const idx = 10 * 32 + 10
      expect(output[idx]).toBeGreaterThan(0.9)
    })

    test('influence decays linearly with distance from center', () => {
      const map = createTestMap(32)
      const output = makeOutput(map)
      // Use a 1x1 building with radius 10 so we have clear decay to measure
      map.buildings.push(makeBuilding('service.police.small', 15, 15))
      buildInfluenceMap(map, 'service.police.small', 10, 100, output)

      // Center is at (15.5, 15.5). Check tiles along x axis from center.
      // Tile (15,15) - near center - should have highest value
      const center = output[15 * 32 + 15]!
      // Tile (20,15) - 4.5 tiles from center - should be less
      const mid = output[15 * 32 + 20]!
      // Tile (24,15) - 8.5 tiles from center - should be even less
      const far = output[15 * 32 + 24]!

      expect(center).toBeGreaterThan(mid)
      expect(mid).toBeGreaterThan(far)
      expect(far).toBeGreaterThan(0) // still within radius 10
    })

    test('influence is zero outside the radius', () => {
      const map = createTestMap(32)
      const output = makeOutput(map)
      map.buildings.push(makeBuilding('service.fire.small', 10, 10))
      buildInfluenceMap(map, 'service.fire.small', 5, 100, output)

      // Center at (10.5, 10.5), radius 5. Tile at (16, 10) is 5.5 tiles away, beyond radius.
      expect(output[10 * 32 + 16]).toBe(0)
      // Tile at (10, 16) is also 5.5 tiles away
      expect(output[16 * 32 + 10]).toBe(0)
      // Tile far away
      expect(output[25 * 32 + 25]).toBe(0)
    })

    test('influence near radius edge is small but positive', () => {
      const map = createTestMap(64)
      const output = makeOutput(map)
      // service.police is 3x3, center at (31.5, 31.5)
      map.buildings.push(makeBuilding('service.police', 30, 30))
      buildInfluenceMap(map, 'service.police', 10, 100, output)

      // The stamp uses integer dx/dy offsets. For dy=9, dx=0:
      // tx = floor(31.5 + 0) = 31, ty = floor(31.5 + 9) = 40
      // dist = sqrt(81) = 9, influence = 1 - 9/10 = 0.1
      const nearEdge = output[40 * 64 + 31]!
      expect(nearEdge).toBeCloseTo(0.1, 2)

      // At dy=10, dx=0: dist = 10 = radius, influence = 1 - 10/10 = 0
      // ty = floor(31.5 + 10) = 41
      const atEdge = output[41 * 64 + 31]!
      expect(atEdge).toBe(0)
    })
  })

  describe('multi-tile building center calculation', () => {
    test('3x3 building stamps from center (x+1.5, y+1.5)', () => {
      const map = createTestMap(32)
      const output = makeOutput(map)
      // service.police is 3x3
      map.buildings.push(makeBuilding('service.police', 10, 10))
      buildInfluenceMap(map, 'service.police', 8, 100, output)

      // Center at (11.5, 11.5). Tile (11, 11) is closest: dist = sqrt(0.25+0.25) ≈ 0.707
      // Tile (10, 10) is farther: dist = sqrt(2.25 + 2.25) ≈ 2.12
      const nearCenter = output[11 * 32 + 11]!
      const corner = output[10 * 32 + 10]!
      expect(nearCenter).toBeGreaterThan(corner)
    })
  })

  describe('multiple buildings accumulate influence', () => {
    test('two buildings contribute additively', () => {
      const map = createTestMap(32)
      const outputSingle = makeOutput(map)
      const outputDouble = makeOutput(map)

      // Single building
      map.buildings.push(makeBuilding('service.fire.small', 10, 15))
      buildInfluenceMap(map, 'service.fire.small', 6, 100, outputSingle)

      // Add a second building
      map.buildings.push(makeBuilding('service.fire.small', 20, 15, { id: 'b2' }))
      buildInfluenceMap(map, 'service.fire.small', 6, 100, outputDouble)

      // At tile (10,15) near first building, both outputs should be the same
      // since second building is far away (radius 6, distance 10)
      expect(outputDouble[15 * 32 + 10]).toBeCloseTo(outputSingle[15 * 32 + 10]!, 5)

      // At a midpoint (15,15), second building contributes additional influence
      const midSingle = outputSingle[15 * 32 + 15]!
      const midDouble = outputDouble[15 * 32 + 15]!
      expect(midDouble).toBeGreaterThan(midSingle)
    })

    test('accumulated influence is capped at 1.0', () => {
      const map = createTestMap(32)
      const output = makeOutput(map)

      // Stack many buildings at the same location
      for (let i = 0; i < 10; i++) {
        map.buildings.push(makeBuilding('service.fire.small', 15, 15, { id: `b${i}` }))
      }
      buildInfluenceMap(map, 'service.fire.small', 8, 100, output)

      // Center tile should be capped at 1.0
      const centerVal = output[15 * 32 + 15]!
      expect(centerVal).toBeLessThanOrEqual(1.0)
      expect(centerVal).toBe(1.0)
    })

    test('no tile exceeds 1.0 across the entire map', () => {
      const map = createTestMap(32)
      const output = makeOutput(map)

      for (let i = 0; i < 5; i++) {
        map.buildings.push(makeBuilding('service.police.small', 14 + i, 15, { id: `b${i}` }))
      }
      buildInfluenceMap(map, 'service.police.small', 10, 100, output)

      let maxVal = 0
      for (let i = 0; i < output.length; i++) {
        if (output[i]! > maxVal) maxVal = output[i]!
      }
      expect(maxVal).toBeLessThanOrEqual(1.0)
    })
  })

  describe('funding parameter', () => {
    test('funding scales the effective radius', () => {
      const map = createTestMap(32)
      map.buildings.push(makeBuilding('service.police.small', 15, 15))

      const outputFull = makeOutput(map)
      buildInfluenceMap(map, 'service.police.small', 10, 100, outputFull)

      const outputHalf = makeOutput(map)
      buildInfluenceMap(map, 'service.police.small', 10, 50, outputHalf)

      // At half funding, effective radius is 5. Tile at distance 6 from center
      // should have influence with full funding but zero with half.
      // Center at (15.5, 15.5). Tile (21, 15): dist ≈ 5.5
      // Full funding (radius 10): influence = 1 - 5.5/10 = 0.45
      // Half funding (radius 5): dist > radius, so 0
      expect(outputFull[15 * 32 + 21]).toBeGreaterThan(0)
      expect(outputHalf[15 * 32 + 21]).toBe(0)
    })

    test('full funding gives larger coverage area than partial funding', () => {
      const map = createTestMap(32)
      map.buildings.push(makeBuilding('service.fire.small', 15, 15))

      const outputFull = makeOutput(map)
      buildInfluenceMap(map, 'service.fire.small', 10, 100, outputFull)
      const coveredFull = Array.from(outputFull).filter((v) => v > 0).length

      const outputPartial = makeOutput(map)
      buildInfluenceMap(map, 'service.fire.small', 10, 60, outputPartial)
      const coveredPartial = Array.from(outputPartial).filter((v) => v > 0).length

      expect(coveredFull).toBeGreaterThan(coveredPartial)
    })

    test('zero funding produces zero coverage', () => {
      const map = createTestMap(32)
      map.buildings.push(makeBuilding('service.police.small', 15, 15))

      const output = makeOutput(map)
      buildInfluenceMap(map, 'service.police.small', 10, 0, output)

      const total = Array.from(output).reduce((a, b) => a + b, 0)
      expect(total).toBe(0)
    })

    test('very low funding results in tiny effective radius', () => {
      const map = createTestMap(32)
      map.buildings.push(makeBuilding('service.fire.small', 15, 15))

      const output = makeOutput(map)
      buildInfluenceMap(map, 'service.fire.small', 10, 10, output)

      // Effective radius = 10 * (10/100) = 1. Only tiles within 1 tile of center get influence.
      const covered = Array.from(output).filter((v) => v > 0).length
      // A circle of radius 1 covers very few tiles
      expect(covered).toBeGreaterThan(0)
      expect(covered).toBeLessThanOrEqual(9) // at most a 3x3 area
    })
  })

  describe('secondary station boost mechanic', () => {
    test('small station gets 1.5x radius when within large station coverage', () => {
      const map = createTestMap(64)
      // Place large police station at center — it covers a wide area
      map.buildings.push(makeBuilding('service.police', 30, 30))
      // Place small station within the large station's coverage
      map.buildings.push(makeBuilding('service.police.small', 32, 32, { id: 'b2' }))

      const output = makeOutput(map)
      buildInfluenceMap(map, 'service.police', 15, 100, output, {
        defId: 'service.police.small',
        baseRadius: 6,
      })

      // Small station at (32.5, 32.5) with boosted radius = 6 * 1.5 = 9
      // Tile at dist 7 from small center should be covered (within boosted radius)
      // (32.5 + 7 = 39.5) -> tile (39, 32)
      // dist = sqrt((39-32.5)^2 + (32-32.5)^2) = sqrt(42.25 + 0.25) = sqrt(42.5) ≈ 6.52
      const atDist7 = output[32 * 64 + 39]!
      expect(atDist7).toBeGreaterThan(0)
    })

    test('small station without large station coverage uses base radius', () => {
      const map = createTestMap(64)
      // Place small station far from any large station
      map.buildings.push(makeBuilding('service.police.small', 50, 50, { id: 'b2' }))

      const output = makeOutput(map)
      // No large station, so primary pass produces nothing
      buildInfluenceMap(map, 'service.police', 15, 100, output, {
        defId: 'service.police.small',
        baseRadius: 6,
      })

      // Small station center at (50.5, 50.5). Base radius = 6.
      // Stamp uses integer offsets. For dx=5, dy=0:
      // tx = floor(50.5 + 5) = 55, dist = 5, influence = 1 - 5/6 ≈ 0.167
      const nearEdge = output[50 * 64 + 55]!
      expect(nearEdge).toBeGreaterThan(0)

      // For dx=6, dy=0: tx = floor(50.5 + 6) = 56, dist = 6 = radius
      // influence = 1 - 6/6 = 0
      const atEdge = output[50 * 64 + 56]!
      expect(atEdge).toBe(0)

      // For dx=7, dy=0: dist2 = 49 > 36 = r2, skipped entirely
      const beyondBase = output[50 * 64 + 57]!
      expect(beyondBase).toBe(0)
    })

    test('boost only applies when large station influence exceeds threshold (0.3)', () => {
      const map = createTestMap(64)
      // Place large station at (10, 30) and small station at (30, 30)
      // Large station center at (11.5, 31.5), radius 15
      // Distance from small station center (30.5, 30.5) to large center:
      // sqrt((30.5-11.5)^2 + (30.5-31.5)^2) = sqrt(361 + 1) = sqrt(362) ≈ 19.03
      // This is beyond the large radius of 15, so no boost
      map.buildings.push(makeBuilding('service.police', 10, 30))
      map.buildings.push(makeBuilding('service.police.small', 30, 30, { id: 'b2' }))

      const output = makeOutput(map)
      buildInfluenceMap(map, 'service.police', 15, 100, output, {
        defId: 'service.police.small',
        baseRadius: 6,
      })

      // Small station at (30.5, 30.5) should not be boosted because large station
      // coverage at that point is < 0.3 (actually 0 since it's beyond radius)
      // So it uses base radius 6.
      // Check that tile at distance 7 from small center is NOT covered (unboosted)
      const beyondBase = output[30 * 64 + 37]! // dist ≈ 6.5 > 6
      expect(beyondBase).toBe(0)
    })

    test('secondary with zero funding produces zero coverage', () => {
      const map = createTestMap(32)
      map.buildings.push(makeBuilding('service.police', 10, 10))
      map.buildings.push(makeBuilding('service.police.small', 15, 15, { id: 'b2' }))

      const output = makeOutput(map)
      buildInfluenceMap(map, 'service.police', 10, 0, output, {
        defId: 'service.police.small',
        baseRadius: 6,
      })

      const total = Array.from(output).reduce((a, b) => a + b, 0)
      expect(total).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('empty map produces zero influence', () => {
      const map = createTestMap(32)
      const output = makeOutput(map)
      buildInfluenceMap(map, 'service.police', 10, 100, output)

      const total = Array.from(output).reduce((a, b) => a + b, 0)
      expect(total).toBe(0)
    })

    test('buildings not matching defId are ignored', () => {
      const map = createTestMap(32)
      map.buildings.push(makeBuilding('service.fire', 15, 15))

      const output = makeOutput(map)
      buildInfluenceMap(map, 'service.police', 10, 100, output)

      const total = Array.from(output).reduce((a, b) => a + b, 0)
      expect(total).toBe(0)
    })

    test('building near map edge does not write out of bounds', () => {
      const map = createTestMap(16)
      map.buildings.push(makeBuilding('service.police.small', 0, 0))

      const output = makeOutput(map)
      // Should not throw even though the influence radius extends beyond map edges
      buildInfluenceMap(map, 'service.police.small', 10, 100, output)

      // Tile (0,0) should still have influence
      expect(output[0]).toBeGreaterThan(0)
      // Output array should not have NaN or Infinity
      for (let i = 0; i < output.length; i++) {
        expect(Number.isFinite(output[i])).toBe(true)
      }
    })

    test('output array is cleared before stamping', () => {
      const map = createTestMap(16)
      map.buildings.push(makeBuilding('service.fire.small', 8, 8))

      const output = makeOutput(map)
      // Fill with garbage
      output.fill(0.5)

      buildInfluenceMap(map, 'service.fire.small', 5, 100, output)

      // Tiles far from the building should be 0 (cleared), not 0.5
      expect(output[0]).toBe(0)
    })
  })
})

describe('influenceToUint8', () => {
  test('converts 0.0 to 0', () => {
    const src = new Float32Array([0.0])
    const dst = new Uint8Array(1)
    influenceToUint8(src, dst)
    expect(dst[0]).toBe(0)
  })

  test('converts 1.0 to 255', () => {
    const src = new Float32Array([1.0])
    const dst = new Uint8Array(1)
    influenceToUint8(src, dst)
    expect(dst[0]).toBe(255)
  })

  test('converts 0.5 to 127', () => {
    const src = new Float32Array([0.5])
    const dst = new Uint8Array(1)
    influenceToUint8(src, dst)
    // floor(0.5 * 255) = floor(127.5) = 127
    expect(dst[0]).toBe(127)
  })

  test('clamps values above 1.0 to 255', () => {
    const src = new Float32Array([1.5])
    const dst = new Uint8Array(1)
    influenceToUint8(src, dst)
    // floor(1.5 * 255) = 382, min(255, 382) = 255
    expect(dst[0]).toBe(255)
  })

  test('converts multiple values correctly', () => {
    const src = new Float32Array([0.0, 0.25, 0.5, 0.75, 1.0])
    const dst = new Uint8Array(5)
    influenceToUint8(src, dst)
    expect(dst[0]).toBe(0)
    expect(dst[1]).toBe(63) // floor(0.25 * 255) = floor(63.75) = 63
    expect(dst[2]).toBe(127) // floor(0.5 * 255) = floor(127.5) = 127
    expect(dst[3]).toBe(191) // floor(0.75 * 255) = floor(191.25) = 191
    expect(dst[4]).toBe(255)
  })

  test('handles very small positive values', () => {
    const src = new Float32Array([0.001])
    const dst = new Uint8Array(1)
    influenceToUint8(src, dst)
    // floor(0.001 * 255) = floor(0.255) = 0
    expect(dst[0]).toBe(0)
  })

  test('converts a full influence map buffer', () => {
    const size = 16
    const src = new Float32Array(size * size)
    const dst = new Uint8Array(size * size)

    // Create a gradient pattern
    for (let i = 0; i < src.length; i++) {
      src[i] = i / (src.length - 1)
    }
    influenceToUint8(src, dst)

    expect(dst[0]).toBe(0)
    expect(dst[dst.length - 1]).toBe(255)
    // Monotonically non-decreasing
    for (let i = 1; i < dst.length; i++) {
      expect(dst[i]).toBeGreaterThanOrEqual(dst[i - 1]!)
    }
  })
})
