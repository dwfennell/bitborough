import { describe, test, expect } from 'vitest'
import { COSTS, MAINTENANCE } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'

describe('BUILDING_DEFS cost consistency with core constants', () => {
  test('transit.stop cost matches COSTS.transitStop', () => {
    expect(BUILDING_DEFS['transit.stop']!.cost).toBe(COSTS.transitStop)
    expect(BUILDING_DEFS['transit.stop']!.maintenanceCost).toBe(MAINTENANCE.transitStop)
  })
  test('power.diesel cost matches COSTS.dieselGenerator', () => {
    expect(BUILDING_DEFS['power.diesel']!.cost).toBe(COSTS.dieselGenerator)
    expect(BUILDING_DEFS['power.diesel']!.maintenanceCost).toBe(MAINTENANCE.dieselGenerator)
  })
  test('power.coal cost matches COSTS.coalPlant', () => {
    expect(BUILDING_DEFS['power.coal']!.cost).toBe(COSTS.coalPlant)
    expect(BUILDING_DEFS['power.coal']!.maintenanceCost).toBe(MAINTENANCE.coalPlant)
  })
  test('power.nuclear cost matches COSTS.nuclearPlant', () => {
    expect(BUILDING_DEFS['power.nuclear']!.cost).toBe(COSTS.nuclearPlant)
    expect(BUILDING_DEFS['power.nuclear']!.maintenanceCost).toBe(MAINTENANCE.nuclearPlant)
  })
  test('service.police cost matches COSTS.policeStation', () => {
    expect(BUILDING_DEFS['service.police']!.cost).toBe(COSTS.policeStation)
    expect(BUILDING_DEFS['service.police']!.maintenanceCost).toBe(MAINTENANCE.policeStation)
  })
  test('service.fire cost matches COSTS.fireStation', () => {
    expect(BUILDING_DEFS['service.fire']!.cost).toBe(COSTS.fireStation)
    expect(BUILDING_DEFS['service.fire']!.maintenanceCost).toBe(MAINTENANCE.fireStation)
  })
  test('special.park cost matches COSTS.park', () => {
    expect(BUILDING_DEFS['special.park']!.cost).toBe(COSTS.park)
  })
})
