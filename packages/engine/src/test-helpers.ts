import { createEmptyMap, type GameMap } from '@rcity/core'

export function createTestMap(size: number): GameMap {
  return createEmptyMap(size, size, {
    name: 'Test Map',
    seed: 0,
    createdAt: new Date().toISOString(),
  })
}

export function advanceTicks(engine: { tick(): void }, n: number): void {
  for (let i = 0; i < n; i++) engine.tick()
}

export function advanceMonth(engine: { tick(): void }): void {
  advanceTicks(engine, 4)
}

export function advanceYear(engine: { tick(): void }): void {
  advanceTicks(engine, 48)
}
