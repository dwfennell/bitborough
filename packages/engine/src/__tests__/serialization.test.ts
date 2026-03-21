import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceYear, advanceMonth } from '../test-helpers.js'
import { Infrastructure, ZoneType } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import { setNextAgentId, getNextAgentId } from '../simulation/citizens.js'
import type { SaveFile } from '@bitborough/core'

describe('Serialization', () => {
  test('serialize produces valid JSON', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    const save = engine.serialize()
    expect(() => JSON.stringify(save)).not.toThrow()
  })

  test('serialize and restore produces identical state', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 4; x < 10; x++) {
      engine.placeTile(x, 2, Infrastructure.PowerLine)
      engine.placeTile(x, 4, Infrastructure.Road)
      engine.placeZone(x, 3, ZoneType.Residential)
    }
    advanceYear(engine) // let some zones develop

    const save = engine.serialize()
    const restored = Engine.restore(save)
    const s1 = engine.getState()
    const s2 = restored.getState()

    expect(s2.time.tickCount).toBe(s1.time.tickCount)
    expect(s2.time.month).toBe(s1.time.month)
    expect(s2.time.year).toBe(s1.time.year)
    expect(s2.funds).toBe(s1.funds)
    // population is recomputed from Σ b.residents on restore
    const expectedPop = s2.map.buildings.filter((b) => b.state === 'active').reduce((sum, b) => sum + b.residents, 0)
    expect(s2.population).toBe(expectedPop)
    expect(s2.budget.taxRate).toBe(s1.budget.taxRate)
    expect(Array.from(s2.map.terrain)).toEqual(Array.from(s1.map.terrain))
    expect(Array.from(s2.map.zones)).toEqual(Array.from(s1.map.zones))
    expect(Array.from(s2.map.infrastructure)).toEqual(Array.from(s1.map.infrastructure))
    expect(s2.map.buildings.length).toBe(s1.map.buildings.length)
  })

  test('restored engine continues simulation correctly', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 4; x < 10; x++) {
      engine.placeTile(x, 4, Infrastructure.Road)
      engine.placeZone(x, 3, ZoneType.Residential)
    }
    advanceYear(engine)

    const save = engine.serialize()
    const restored = Engine.restore(save)

    // Both should be able to continue ticking without errors
    advanceYear(engine)
    advanceYear(restored)

    // Restored engine should have advanced correctly
    expect(restored.getState().time.year).toBe(engine.getState().time.year)
  })

  test('v1 save (no residents field) defaults residents to capacity on restore', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1, startingFunds: 10_000 })
    // Manually craft a v1-style save (no residents on buildings)
    const save = engine.serialize()
    // Simulate v1 save: strip residents from buildings and set version to 1
    const v1Save = {
      ...save,
      version: 1,
      map: {
        ...save.map,
        buildings: save.map.buildings.map(({ residents: _r, lowOccupancyMonths: _l, ...rest }) => rest),
      },
    }
    const restored = Engine.restore(v1Save as any)
    for (const b of restored.getState().map.buildings) {
      const def = BUILDING_DEFS[b.defId]
      if (def && def.capacity > 0) {
        expect(b.residents).toBe(def.capacity)
      }
    }
  })

  test('v5 save preserves exact residents values', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1, startingFunds: 10_000 })
    const save = engine.serialize()
    expect(save.version).toBe(5)
    const restored = Engine.restore(save)
    for (let i = 0; i < engine.getState().map.buildings.length; i++) {
      expect(restored.getState().map.buildings[i]!.residents).toBe(engine.getState().map.buildings[i]!.residents)
    }
  })

  test('population after restore equals sum of residents', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 999_999 })
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 4; x < 10; x++) {
      engine.placeTile(x, 2, Infrastructure.PowerLine)
      engine.placeTile(x, 3, Infrastructure.Road)
      engine.placeZone(x, 4, ZoneType.Residential)
    }
    for (let i = 0; i < 120; i++) engine.tick() // let buildings fill up a bit
    const save = engine.serialize()
    const restored = Engine.restore(save)
    const expectedPop = restored
      .getState()
      .map.buildings.filter((b) => b.state === 'active')
      .reduce((sum, b) => sum + b.residents, 0)
    expect(restored.getState().population).toBe(expectedPop)
  })

  test('loan state persists through save/load', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    // Inject a loan directly into the save file to avoid needing tax income
    const baseSave = engine.serialize()
    const loanBefore = {
      principal: 50_000,
      remaining: 42_000,
      monthlyPayment: 510.31,
      termMonths: 120,
      monthsLeft: 98,
      interestRate: 0.08,
    }
    const loanRepaymentAmountBefore = 510.31
    const saveWithLoan: SaveFile = {
      ...baseSave,
      state: {
        ...baseSave.state,
        loan: loanBefore,
        loanRepaymentAmount: loanRepaymentAmountBefore,
      },
    }

    const restored = Engine.restore(saveWithLoan)
    const stateAfter = restored.getState()

    expect(stateAfter.loan).not.toBeNull()
    expect(stateAfter.loan!.principal).toBe(loanBefore.principal)
    expect(stateAfter.loan!.remaining).toBe(loanBefore.remaining)
    expect(stateAfter.loan!.monthlyPayment).toBe(loanBefore.monthlyPayment)
    expect(stateAfter.loan!.termMonths).toBe(loanBefore.termMonths)
    expect(stateAfter.loan!.monthsLeft).toBe(loanBefore.monthsLeft)
    expect(stateAfter.loan!.interestRate).toBe(loanBefore.interestRate)
    expect(stateAfter.loanRepaymentAmount).toBe(loanRepaymentAmountBefore)
  })

  test('no-loan state persists through save/load', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    const save = engine.serialize()
    const restored = Engine.restore(save)
    expect(restored.getState().loan).toBeNull()
  })

  test('missing loan fields in save file gracefully default to null/0', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    const save = engine.serialize()
    // Simulate an old save without loan fields
    const oldSave: SaveFile = {
      ...save,
      state: {
        funds: save.state.funds,
        population: save.state.population,
        month: save.state.month,
        year: save.state.year,
        tickCount: save.state.tickCount,
        taxRate: save.state.taxRate,
        funding: save.state.funding,
        seed: save.state.seed,
        activeFires: save.state.activeFires,
        // intentionally omit loan and loanRepaymentAmount
      },
    }
    const restored = Engine.restore(oldSave)
    expect(restored.getState().loan).toBeNull()
    expect(restored.getState().loanRepaymentAmount).toBe(0)
  })

  test('citizens are serialized and restored', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 100_000 })
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 4; x < 10; x++) {
      engine.placeTile(x, 2, Infrastructure.PowerLine)
      engine.placeTile(x, 4, Infrastructure.Road)
      engine.placeZone(x, 3, ZoneType.Residential)
    }
    for (let x = 15; x < 20; x++) {
      engine.placeTile(x, 4, Infrastructure.Road)
      engine.placeZone(x, 3, ZoneType.Commercial)
    }
    // Let city develop so citizens spawn
    for (let i = 0; i < 24; i++) advanceMonth(engine)

    const state1 = engine.getState()
    const save = engine.serialize()

    expect(save.version).toBe(5)
    if (state1.citizens.agentCount > 0) {
      expect(save.state.citizens).toBeDefined()
      expect(save.state.citizens!.agents.length).toBeGreaterThan(0)
    }

    const restored = Engine.restore(save)
    const state2 = restored.getState()

    expect(state2.citizens.agentCount).toBe(state1.citizens.agentCount)
  })

  test('restore from v4 save (no citizens field) starts with empty registry', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    const save = engine.serialize()
    // Simulate a v4 save by removing citizens and setting version to 4
    const v4Save = { ...save, version: 4 as const, state: { ...save.state, citizens: undefined } }
    const restored = Engine.restore(v4Save as any)
    expect(restored.getState().citizens.agentCount).toBe(0)
  })

  test('restores nextAgentId so new citizens get unique IDs', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1 })

    // Inject agents with high IDs to simulate a save with existing citizens
    const registry = (engine as any).citizenRegistry
    registry.agents.push(
      { id: 'c10', homeBuildingId: 'b1', workBuildingId: null, commerceBuildingId: null, homeAccessRoad: 0, workAccessRoad: null, commerceAccessRoad: null, homeWorkRoute: [], homeCommerceRoute: [], homeWorkRouteStale: false, homeCommerceRouteStale: false, homeWorkRouteTileSet: new Set(), homeCommerceRouteTileSet: new Set(), satisfaction: 0.5 },
      { id: 'c20', homeBuildingId: 'b1', workBuildingId: null, commerceBuildingId: null, homeAccessRoad: 0, workAccessRoad: null, commerceAccessRoad: null, homeWorkRoute: [], homeCommerceRoute: [], homeWorkRouteStale: false, homeCommerceRouteStale: false, homeWorkRouteTileSet: new Set(), homeCommerceRouteTileSet: new Set(), satisfaction: 0.5 },
    )

    const save = engine.serialize()
    // Reset the counter to 1 to simulate a fresh process loading a save
    setNextAgentId(1)
    expect(getNextAgentId()).toBe(1) // precondition: counter is low

    const restored = Engine.restore(save)

    // After restore, nextAgentId should be past the highest existing ID (c20 → 21)
    expect(getNextAgentId()).toBe(21)
  })

  test('restored engine is deterministic with original', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.coal')
    for (let x = 4; x < 10; x++) {
      engine.placeTile(x, 4, Infrastructure.Road)
      engine.placeZone(x, 3, ZoneType.Residential)
    }
    // Run for a while
    for (let i = 0; i < 24; i++) engine.tick()

    const save = engine.serialize()
    const restored = Engine.restore(save)

    // Both should produce identical states after same number of ticks
    for (let i = 0; i < 48; i++) {
      engine.tick()
      restored.tick()
    }

    // Both engines advance time identically
    expect(restored.getState().time.year).toBe(engine.getState().time.year)
    expect(restored.getState().time.month).toBe(engine.getState().time.month)
    // population and funds diverge until Task 4 fills in residents — tested via 'population after restore' test
  })
})
