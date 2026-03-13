import { describe, test, expect } from 'vitest'
import { COSTS, MAINTENANCE, POWER } from '@bitborough/core'
import { BUILDING_DEFS } from '@bitborough/engine'
import { getBuildingReference } from '../building-reference.js'

describe('getBuildingReference', () => {
  test('diesel generator row has correct cost from COSTS', () => {
    const rows = getBuildingReference()
    const diesel = rows.find(r => r.id === 'power.diesel')
    expect(diesel).toBeDefined()
    expect(diesel!.cost).toBe(COSTS.dieselGenerator)
    expect(diesel!.maintenanceCost).toBe(MAINTENANCE.dieselGenerator)
    expect(diesel!.powerCapacity).toBe(POWER.dieselCapacity)
  })

  test('res.low row has correct capacity', () => {
    const rows = getBuildingReference()
    const res = rows.find(r => r.id === 'res.low')
    expect(res!.capacity).toBe(BUILDING_DEFS['res.low']!.capacity)
  })

  test('every row has an id, name, cost, and maintenanceCost', () => {
    const rows = getBuildingReference()
    for (const row of rows) {
      expect(row.id).toBeTruthy()
      expect(row.name).toBeTruthy()
      expect(typeof row.cost).toBe('number')
      expect(typeof row.maintenanceCost).toBe('number')
    }
  })
})
