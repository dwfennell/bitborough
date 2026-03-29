import { describe, test, expect } from 'vitest'
import { TileType, ZoneType, Infrastructure } from '@bitborough/core'
import type { GameState, TileInfo } from '@bitborough/core'
import { describeInfrastructure, describeTile } from '../utils/tile-info.js'
import { hexToRgb, landValueToRgba } from '../render/colors.js'
import { fillMinimapBuffer, TERRAIN_RGB, ZONE_RGB } from '../render/minimap-buffer.js'
import { advanceTicks } from '../utils/tick-accumulator.js'
import { MONTHS, formatGameDate, computeDemandBarStyle } from '../utils/format.js'

// ---------------------------------------------------------------------------
// describeInfrastructure
// ---------------------------------------------------------------------------
describe('describeInfrastructure', () => {
  test('returns empty array when no infrastructure', () => {
    expect(describeInfrastructure(Infrastructure.None)).toEqual([])
  })

  test('returns Road for road bitmask', () => {
    expect(describeInfrastructure(Infrastructure.Road)).toEqual(['Road'])
  })

  test('returns Power Line for power line bitmask', () => {
    expect(describeInfrastructure(Infrastructure.PowerLine)).toEqual(['Power Line'])
  })

  test('returns Road and Power Line for combined mask', () => {
    expect(describeInfrastructure(Infrastructure.Road | Infrastructure.PowerLine)).toEqual(['Road', 'Power Line'])
  })

  test('returns all three for road + power + rail', () => {
    expect(describeInfrastructure(Infrastructure.Road | Infrastructure.PowerLine | Infrastructure.Rail)).toEqual([
      'Road',
      'Power Line',
      'Rail',
    ])
  })
})

// ---------------------------------------------------------------------------
// describeTile
// ---------------------------------------------------------------------------
describe('describeTile', () => {
  function makeState(width: number, landValues: number[]): GameState {
    const size = landValues.length
    return {
      map: {
        width,
        height: 1,
        terrain: new Uint8Array(size),
        zones: new Uint8Array(size),
        buildings: [],
        infrastructure: new Uint8Array(size),
      },
      landValues,
      crimeLevel: new Uint8Array(size),
      fireCoverage: new Uint8Array(size),
      activeFires: [],
      trafficDensity: new Uint8Array(size),
    } as unknown as GameState
  }

  test('basic grass tile with no zone or infrastructure', () => {
    const tile: TileInfo = {
      terrain: TileType.Grass,
      zone: ZoneType.None,
      infrastructure: Infrastructure.None,
      connections: 0,
      elevation: 0,
      powered: false,
      hasRoadAccess: false,
      landValue: 0,
      crimeLevel: 0,
      fireCoverage: 0,
      pollutionLevel: 0,
      reputation: 0,
    }
    const state = makeState(10, new Array(10).fill(0))
    const desc = describeTile(tile, 3, 0, state)

    expect(desc.position).toEqual({ x: 3, y: 0 })
    expect(desc.terrain).toBe('Grass')
    expect(desc.zone).toBe('None')
    expect(desc.infrastructure).toEqual([])
    expect(desc.powered).toBe(false)
    expect(desc.landValue).toBe(0)
  })

  test('tile with zone and infrastructure', () => {
    const tile: TileInfo = {
      terrain: TileType.Dirt,
      zone: ZoneType.Commercial,
      infrastructure: Infrastructure.Road | Infrastructure.PowerLine,
      connections: 0,
      elevation: 0,
      powered: true,
      hasRoadAccess: true,
      landValue: 0,
      crimeLevel: 0,
      fireCoverage: 0,
      pollutionLevel: 0,
      reputation: 0,
    }
    const landValues = new Array(20).fill(0)
    landValues[12] = 150
    const state = makeState(10, landValues)
    const desc = describeTile(tile, 2, 1, state)

    expect(desc.terrain).toBe('Dirt')
    expect(desc.zone).toBe('Commercial')
    expect(desc.infrastructure).toEqual(['Road', 'Power Line'])
    expect(desc.powered).toBe(true)
    expect(desc.landValue).toBe(150)
  })
})

// ---------------------------------------------------------------------------
// hexToRgb
// ---------------------------------------------------------------------------
describe('hexToRgb', () => {
  test('#4a8c3f → [74, 140, 63]', () => {
    expect(hexToRgb('#4a8c3f')).toEqual([74, 140, 63])
  })

  test('#000000 → [0, 0, 0]', () => {
    expect(hexToRgb('#000000')).toEqual([0, 0, 0])
  })

  test('#ffffff → [255, 255, 255]', () => {
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255])
  })
})

// ---------------------------------------------------------------------------
// fillMinimapBuffer
// ---------------------------------------------------------------------------
describe('fillMinimapBuffer', () => {
  test('fills 2x2 buffer with mixed terrain and zones', () => {
    const terrain = new Uint8Array([TileType.Grass, TileType.Water, TileType.Sand, TileType.Trees])
    const zones = new Uint8Array([ZoneType.None, ZoneType.None, ZoneType.Residential, ZoneType.None])
    const buffer = new Uint8ClampedArray(2 * 2 * 4)

    fillMinimapBuffer(terrain, zones, 2, 2, buffer)

    // pixel 0: Grass terrain (no zone)
    expect([buffer[0], buffer[1], buffer[2], buffer[3]]).toEqual([...TERRAIN_RGB[TileType.Grass]!, 255])

    // pixel 1: Water terrain (no zone)
    expect([buffer[4], buffer[5], buffer[6], buffer[7]]).toEqual([...TERRAIN_RGB[TileType.Water]!, 255])

    // pixel 2: Residential zone overrides Sand terrain
    expect([buffer[8], buffer[9], buffer[10], buffer[11]]).toEqual([...ZONE_RGB[ZoneType.Residential]!, 255])

    // pixel 3: Trees terrain (no zone)
    expect([buffer[12], buffer[13], buffer[14], buffer[15]]).toEqual([...TERRAIN_RGB[TileType.Trees]!, 255])
  })
})

// ---------------------------------------------------------------------------
// landValueToRgba
// ---------------------------------------------------------------------------
describe('landValueToRgba', () => {
  test('value 0 → blue (low land value)', () => {
    // v=0: r=0, g=floor((1 - |0-0.5|*2)*255) = floor(0) = 0, b=floor(1*255) = 255
    expect(landValueToRgba(0)).toBe('rgba(0, 0, 255, 0.4)')
  })

  test('value 255 → red (high land value)', () => {
    // v=1: r=255, g=floor((1 - |1-0.5|*2)*255) = floor(0) = 0, b=floor(0) = 0
    expect(landValueToRgba(255)).toBe('rgba(255, 0, 0, 0.4)')
  })

  test('value 128 midpoint check', () => {
    const result = landValueToRgba(128)
    // v = 128/255 ≈ 0.50196; r = 128
    // g = floor((1 - abs(0.50196 - 0.5) * 2) * 255) = 254
    // b = floor((1 - 0.50196) * 255) = 127
    expect(result).toBe('rgba(128, 254, 127, 0.4)')
  })
})

// ---------------------------------------------------------------------------
// advanceTicks
// ---------------------------------------------------------------------------
describe('advanceTicks', () => {
  test('zero delta → 0 ticks', () => {
    const result = advanceTicks(0, 0, 250)
    expect(result.ticks).toBe(0)
    expect(result.remainder).toBe(0)
  })

  test('exact interval → 1 tick', () => {
    const result = advanceTicks(0, 250, 250)
    expect(result.ticks).toBe(1)
    expect(result.remainder).toBe(0)
  })

  test('2.5x interval → 2 ticks with remainder', () => {
    const result = advanceTicks(0, 625, 250)
    expect(result.ticks).toBe(2)
    expect(result.remainder).toBe(125)
  })

  test('zero interval → 0 ticks', () => {
    const result = advanceTicks(50, 200, 0)
    expect(result.ticks).toBe(0)
    expect(result.remainder).toBe(50)
  })
})

// ---------------------------------------------------------------------------
// formatGameDate
// ---------------------------------------------------------------------------
describe('formatGameDate', () => {
  test('month 1, year 1900 → Jan 1900', () => {
    expect(formatGameDate(1, 1900)).toBe('Jan 1900')
  })

  test('month 12 → Dec', () => {
    expect(formatGameDate(12, 2025)).toBe('Dec 2025')
  })
})

// ---------------------------------------------------------------------------
// computeDemandBarStyle
// ---------------------------------------------------------------------------
describe('computeDemandBarStyle', () => {
  test('positive demand', () => {
    const style = computeDemandBarStyle(0.8, 20)
    expect(style.height).toBe(16)
    expect(style.opacity).toBe('1')
  })

  test('negative demand has opacity 0.4', () => {
    const style = computeDemandBarStyle(-0.6, 20)
    expect(style.height).toBe(12)
    expect(style.opacity).toBe('0.4')
  })

  test('zero demand', () => {
    const style = computeDemandBarStyle(0, 20)
    expect(style.height).toBe(4)
    expect(style.opacity).toBe('1')
  })

  test('demand producing height below 4 is clamped to 4', () => {
    const style = computeDemandBarStyle(0.1, 20)
    expect(style.height).toBe(4)
  })
})

// ---------------------------------------------------------------------------
// MONTHS constant
// ---------------------------------------------------------------------------
describe('MONTHS', () => {
  test('has 12 entries', () => {
    expect(MONTHS).toHaveLength(12)
  })

  test('starts with Jan and ends with Dec', () => {
    expect(MONTHS[0]).toBe('Jan')
    expect(MONTHS[11]).toBe('Dec')
  })
})
