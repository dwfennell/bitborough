import { createEmptyMap, DEFAULTS, Infrastructure, ZoneType, type GameMap, type Building } from '@bitborough/core'
import { BUILDING_DEFS } from './buildings-registry.js'
import { Engine } from './Engine.js'

export function createTestMap(size: number): GameMap {
  return createEmptyMap(size, size, {
    name: 'Test Map',
    seed: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
  })
}

export function advanceTicks(engine: { tick(): void }, n: number): void {
  for (let i = 0; i < n; i++) engine.tick()
}

export function advanceMonth(engine: { tick(): void }): void {
  advanceTicks(engine, DEFAULTS.ticksPerMonth)
}

export function advanceYear(engine: { tick(): void }): void {
  advanceTicks(engine, DEFAULTS.ticksPerMonth * DEFAULTS.monthsPerYear)
}

export function makeBuilding(defId: string, x: number, y: number, overrides?: Partial<Building>): Building {
  const def = BUILDING_DEFS[defId]!
  return {
    id: 'b1',
    defId,
    x,
    y,
    density: def.density,
    state: 'active',
    residents: 0,
    age: 0,
    powered: true,
    ...overrides,
  }
}

export interface DevelopedCityOptions {
  mapSize?: number
  years?: number
  seed?: number
  startingFunds?: number
  taxRate?: number
}

/**
 * Create an engine with a fully developed city: diesel power plant, power
 * lines, roads, and residential/commercial/industrial zones that have been
 * advanced for several years so buildings are occupied and producing tax
 * income.
 *
 * Defaults produce a 64x64 city advanced 20 years with $50M starting funds,
 * yielding meaningful population and tax revenue.
 */
export function createDevelopedCity(opts: DevelopedCityOptions = {}): Engine {
  const { mapSize = 64, years = 20, seed = 42, startingFunds = 50_000_000, taxRate } = opts

  const engine = Engine.create(createTestMap(mapSize), { seed, startingFunds })

  // Diesel power plant at (0,0) — 2x2 footprint
  engine.placeBuilding(0, 0, 'power.diesel')

  // Power line from plant edge down to zones
  for (let y = 2; y <= 5; y++) {
    engine.placeTile(1, y, Infrastructure.PowerLine)
  }

  // Large grid of zones with power lines and roads
  for (let row = 0; row < 10; row++) {
    const baseY = 5 + row * 3
    if (baseY + 2 >= mapSize) break
    for (let x = 1; x < Math.min(50, mapSize); x++) {
      engine.placeTile(x, baseY, Infrastructure.PowerLine)
      engine.placeTile(x, baseY + 2, Infrastructure.Road)
      if (row < 6) {
        engine.placeZone(x, baseY + 1, ZoneType.Residential)
      } else if (row < 8) {
        engine.placeZone(x, baseY + 1, ZoneType.Commercial)
      } else {
        engine.placeZone(x, baseY + 1, ZoneType.Industrial)
      }
    }
  }

  if (taxRate !== undefined) {
    engine.setTaxRate(taxRate)
  }

  // Advance the specified number of years so zones fully develop
  for (let i = 0; i < years; i++) advanceYear(engine)

  return engine
}
