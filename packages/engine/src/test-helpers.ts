import { createEmptyMap, DEFAULTS, type GameMap } from '@bitborough/core'

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
