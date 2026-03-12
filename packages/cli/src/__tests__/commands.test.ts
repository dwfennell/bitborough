import { describe, test, expect, afterEach } from 'vitest'
import { unlinkSync, existsSync } from 'fs'
import { spawnSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Engine } from '@bitborough/engine'
import { generateMap } from '@bitborough/map-gen'
import { Infrastructure } from '@bitborough/core'

const __dirname = dirname(fileURLToPath(import.meta.url))
const INDEX = resolve(__dirname, '../../src/index.ts')

const TEST_FILE = '/tmp/bitt-test-game.json'

afterEach(() => {
  if (existsSync(TEST_FILE)) unlinkSync(TEST_FILE)
})

function bitt(args: string[], file?: string): unknown {
  const allArgs = file ? [...args, '--file', file] : args
  const result = spawnSync('npx', ['tsx', INDEX, ...allArgs], {
    encoding: 'utf-8',
    timeout: 15000,
  })
  const text = result.stdout.trim()
  if (!text) throw new Error(`No output. stderr: ${result.stderr}`)
  return JSON.parse(text)
}

function tempFile(): string {
  return `/tmp/bitt-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
}

// ---------------------------------------------------------------------------
// Existing tests (preserved)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// CLI command tests (subprocess-based)
// ---------------------------------------------------------------------------

describe('bitt new', () => {
  test('creates a game file and returns ok with expected fields', () => {
    const file = tempFile()
    try {
      const result = bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file) as Record<string, unknown>
      expect(result.ok).toBe(true)
      expect(result.seed).toBe(42)
      expect(result.size).toBe(32)
      expect(result.preset).toBe('plains')
      expect(typeof result.funds).toBe('number')
      expect(existsSync(file)).toBe(true)
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })
})

describe('bitt status', () => {
  test('returns population, funds, demand with R/C/I keys', () => {
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      const result = bitt(['status'], file) as Record<string, unknown>
      expect(typeof result.population).toBe('number')
      expect(typeof result.funds).toBe('number')
      expect(result.demand).toBeDefined()
      const demand = result.demand as Record<string, unknown>
      expect(typeof demand.R).toBe('number')
      expect(typeof demand.C).toBe('number')
      expect(typeof demand.I).toBe('number')
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })
})

describe('bitt tick', () => {
  test('advances months and returns updated state with monthsAdvanced', () => {
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      const result = bitt(['tick', '3'], file) as Record<string, unknown>
      expect(result.ok).toBe(true)
      expect(result.monthsAdvanced).toBe(3)
      expect(typeof result.month).toBe('number')
      expect(typeof result.year).toBe('number')
      expect(typeof result.population).toBe('number')
      expect(typeof result.funds).toBe('number')
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })

  test('returns ok: false for non-numeric tick count', () => {
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      const result = bitt(['tick', 'abc'], file) as Record<string, unknown>
      expect(result.ok).toBe(false)
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })
})

describe('bitt place', () => {
  test('place road returns ok: true and funds', () => {
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      const result = bitt(['place', 'road', '5', '5'], file) as Record<string, unknown>
      expect(result.ok).toBe(true)
      expect(typeof result.funds).toBe('number')
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })

  test('place diesel returns ok: true and funds', () => {
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      const result = bitt(['place', 'diesel', '10', '10'], file) as Record<string, unknown>
      expect(result.ok).toBe(true)
      expect(typeof result.funds).toBe('number')
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })

  test('place unknown type returns ok: false', () => {
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      const result = bitt(['place', 'xyz', '5', '5'], file) as Record<string, unknown>
      expect(result.ok).toBe(false)
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })
})

describe('bitt zone', () => {
  test('zone R after placing a nearby road returns ok: true', () => {
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      bitt(['place', 'road', '5', '5'], file)
      const result = bitt(['zone', 'R', '5', '6'], file) as Record<string, unknown>
      expect(result.ok).toBe(true)
      expect(typeof result.funds).toBe('number')
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })
})

describe('bitt bulldoze', () => {
  test('bulldoze after placing a road returns ok: true', () => {
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      bitt(['place', 'road', '5', '5'], file)
      const result = bitt(['bulldoze', '5', '5'], file) as Record<string, unknown>
      expect(result.ok).toBe(true)
      expect(typeof result.funds).toBe('number')
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })
})

describe('bitt tile', () => {
  test('returns terrain, zone, infra, powered, hasRoadAccess, building for a plain tile', () => {
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      const result = bitt(['tile', '5', '5'], file) as Record<string, unknown>
      expect(typeof result.terrain).toBe('string')
      expect(result.zone === null || typeof result.zone === 'string').toBe(true)
      expect(Array.isArray(result.infra)).toBe(true)
      expect(typeof result.powered).toBe('boolean')
      expect(typeof result.hasRoadAccess).toBe('boolean')
      expect('building' in result).toBe(true)
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })

  test('hasRoadAccess is true after placing road on the tile', () => {
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      bitt(['place', 'road', '5', '5'], file)
      const result = bitt(['tile', '5', '5'], file) as Record<string, unknown>
      expect(result.hasRoadAccess).toBe(true)
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })

  test('returns ok: false for out-of-bounds coordinates', () => {
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      const result = bitt(['tile', '999', '999'], file) as Record<string, unknown>
      expect(result.ok).toBe(false)
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })
})

describe('bitt tiles', () => {
  test('returns tiles array and grid string for a region', () => {
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      const result = bitt(['tiles', '5', '5', '8', '8'], file) as Record<string, unknown>
      expect(Array.isArray(result.tiles)).toBe(true)
      expect((result.tiles as unknown[]).length).toBe(16) // 4x4 region
      expect(typeof result.grid).toBe('string')
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })
})

describe('bitt buildings', () => {
  test('returns empty array on a fresh map', () => {
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      const result = bitt(['buildings'], file)
      expect(Array.isArray(result)).toBe(true)
      expect((result as unknown[]).length).toBe(0)
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })

  test('returns non-empty array after placing a diesel plant', () => {
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      bitt(['place', 'diesel', '10', '10'], file)
      const result = bitt(['buildings'], file) as unknown[]
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      const building = result[0] as Record<string, unknown>
      expect(building.id).toBeDefined()
      expect(typeof building.x).toBe('number')
      expect(typeof building.y).toBe('number')
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })
})

describe('bug regressions', () => {
  test('failed placement reason is a string name, not a number', () => {
    // Bug: FailReason enum was serialised as its numeric value ("2") instead of name ("Occupied")
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      bitt(['place', 'diesel', '10', '10'], file)
      // Try to place something on an occupied footprint tile
      const result = bitt(['place', 'road', '10', '10'], file) as Record<string, unknown>
      expect(result.ok).toBe(false)
      expect(typeof result.reason).toBe('string')
      expect(result.reason).not.toMatch(/^\d+$/)  // must not be a bare number
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })

  test('tile inside multi-tile building footprint shows the building', () => {
    // Bug: only origin tile showed building; footprint tiles showed building: null
    // Diesel is 2×2, so origin (10,10) and footprint tile (11,10) both belong to it
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      bitt(['place', 'diesel', '10', '10'], file)
      const origin = bitt(['tile', '10', '10'], file) as Record<string, unknown>
      const footprint = bitt(['tile', '11', '10'], file) as Record<string, unknown>
      expect((origin.building as Record<string, unknown>).id).toBe('power.diesel')
      expect((footprint.building as Record<string, unknown>).id).toBe('power.diesel')
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })

  test('tiles grid shows B for building footprint tiles', () => {
    // Bug: grid used "." for all building tiles, hiding their presence
    const file = tempFile()
    try {
      bitt(['new', '--seed', '42', '--size', '32', '--preset', 'plains'], file)
      bitt(['place', 'diesel', '10', '10'], file)
      const result = bitt(['tiles', '10', '10', '12', '11'], file) as Record<string, unknown>
      const grid = result.grid as string
      // 2×2 diesel at (10,10) means both rows of a 3-wide, 2-tall region start with BB
      expect(grid).toContain('BB')
    } finally {
      if (existsSync(file)) unlinkSync(file)
    }
  })
})

describe('bitt docs', () => {
  test('without section returns sections list with id and title', () => {
    const result = bitt(['docs']) as Record<string, unknown>
    expect(Array.isArray(result.sections)).toBe(true)
    const sections = result.sections as Record<string, unknown>[]
    expect(sections.length).toBeGreaterThan(0)
    expect(typeof sections[0].id).toBe('string')
    expect(typeof sections[0].title).toBe('string')
  })

  test('with getting-started section returns id, title, body', () => {
    const result = bitt(['docs', 'getting-started']) as Record<string, unknown>
    expect(result.id).toBe('getting-started')
    expect(typeof result.title).toBe('string')
    expect(typeof result.body).toBe('string')
    expect((result.body as string).length).toBeGreaterThan(0)
  })

  test('with buildings section returns array of BuildingRow objects', () => {
    const result = bitt(['docs', 'buildings'])
    expect(Array.isArray(result)).toBe(true)
    const rows = result as Record<string, unknown>[]
    expect(rows.length).toBeGreaterThan(0)
    expect(typeof rows[0].id).toBe('string')
    expect(typeof rows[0].cost).toBe('number')
    expect(typeof rows[0].maintenanceCost).toBe('number')
  })
})
