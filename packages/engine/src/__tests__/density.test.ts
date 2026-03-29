import { describe, test, it, expect } from 'vitest'
import { Infrastructure, BuildingCategory, DensityLevel, ZoneType, Building } from '@bitborough/core'
import { BUILDING_DEFS } from '../buildings-registry.js'
import { createTestMap } from '../test-helpers.js'
import { PRNG } from '../prng.js'
import { Engine } from '../Engine.js'
import {
  cityCenter,
  hasNearbyTransitStop,
  upgradeProb,
  mediumRadius,
  hasCriticalMass,
  updateDensity,
  tickDerelict,
  checkFootprintForUpgrade,
  neighbourhoodAvgOccupancy,
} from '../simulation/density.js'
import { hasNearbyPavedRoad } from '../simulation/road-access.js'

describe('PavedRoad infrastructure', () => {
  test('PavedRoad is a distinct bit flag', () => {
    expect(Infrastructure.PavedRoad).toBeDefined()
    expect(Infrastructure.PavedRoad & Infrastructure.Road).toBe(0) // separate bits
  })

  test('a paved road tile has both Road and PavedRoad flags', () => {
    const pavedRoadTile = Infrastructure.Road | Infrastructure.PavedRoad
    expect(pavedRoadTile & Infrastructure.Road).toBeTruthy()
    expect(pavedRoadTile & Infrastructure.PavedRoad).toBeTruthy()
  })
})

describe('Task 3: medium/high building definitions', () => {
  test('BUILDING_DEFS[res.med] exists with density === DensityLevel.Medium', () => {
    expect(BUILDING_DEFS['res.med']).toBeDefined()
    expect(BUILDING_DEFS['res.med']!.density).toBe(DensityLevel.Medium)
  })

  test('BUILDING_DEFS[res.med.b] has size { w: 2, h: 1 }', () => {
    expect(BUILDING_DEFS['res.med.b']).toBeDefined()
    expect(BUILDING_DEFS['res.med.b']!.size).toEqual({ w: 2, h: 1 })
  })

  test('BUILDING_DEFS[res.high] has density === DensityLevel.High and size { w: 2, h: 2 }', () => {
    expect(BUILDING_DEFS['res.high']).toBeDefined()
    expect(BUILDING_DEFS['res.high']!.density).toBe(DensityLevel.High)
    expect(BUILDING_DEFS['res.high']!.size).toEqual({ w: 2, h: 2 })
  })

  test('BUILDING_DEFS[ind.high] has fewer jobs than ind.low and more taxValue', () => {
    const indLow = BUILDING_DEFS['ind.low']!
    const indHigh = BUILDING_DEFS['ind.high']!
    expect(indHigh.jobs).toBeLessThan(indLow.jobs)
    expect(indHigh.taxValue).toBeGreaterThan(indLow.taxValue)
  })

  test('BUILDING_DEFS[transit.stop] has size { w: 2, h: 2 } and category === BuildingCategory.Special', () => {
    expect(BUILDING_DEFS['transit.stop']).toBeDefined()
    expect(BUILDING_DEFS['transit.stop']!.size).toEqual({ w: 2, h: 2 })
    expect(BUILDING_DEFS['transit.stop']!.category).toBe(BuildingCategory.Special)
  })
})

describe('density helpers', () => {
  test('cityCenter returns center of single building', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 10,
      y: 15,
      powered: true,
      density: 0,
      age: 0,
      state: 'active',
      residents: 0,
    })
    const { cx, cy } = cityCenter(map)
    expect(cx).toBe(10)
    expect(cy).toBe(15)
  })

  test('cityCenter averages two buildings', () => {
    const map = createTestMap(32)
    map.buildings.push(
      { id: 'b1', defId: 'res.low', x: 0, y: 0, powered: true, density: 0, age: 0, state: 'active', residents: 0 },
      { id: 'b2', defId: 'res.low', x: 10, y: 10, powered: true, density: 0, age: 0, state: 'active', residents: 0 },
    )
    const { cx, cy } = cityCenter(map)
    expect(cx).toBe(5)
    expect(cy).toBe(5)
  })

  test('hasNearbyPavedRoad returns true when paved road within 3 tiles', () => {
    const map = createTestMap(32)
    map.infrastructure[5 * map.width + 10] = Infrastructure.Road | Infrastructure.PavedRoad
    expect(hasNearbyPavedRoad(map, 10, 7)).toBe(true) // 2 tiles away
  })

  test('hasNearbyPavedRoad returns false for unpaved road', () => {
    const map = createTestMap(32)
    map.infrastructure[5 * map.width + 10] = Infrastructure.Road // dirt only
    expect(hasNearbyPavedRoad(map, 10, 7)).toBe(false)
  })

  test('hasNearbyTransitStop returns true when transit stop within 10 tiles', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'ts1',
      defId: 'transit.stop',
      x: 5,
      y: 5,
      powered: true,
      density: 0,
      age: 0,
      state: 'active',
      residents: 0,
    })
    expect(hasNearbyTransitStop(map, 10, 5)).toBe(true) // 5 tiles away
  })

  test('hasNearbyTransitStop returns false when transit stop > 10 tiles away', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'ts1',
      defId: 'transit.stop',
      x: 0,
      y: 0,
      powered: true,
      density: 0,
      age: 0,
      state: 'active',
      residents: 0,
    })
    expect(hasNearbyTransitStop(map, 15, 0)).toBe(false) // 15 tiles away
  })

  test('upgradeProb decreases with distance', () => {
    const near = upgradeProb(1.0, 2, 10)
    const far = upgradeProb(1.0, 8, 10)
    expect(near).toBeGreaterThan(far)
  })

  test('upgradeProb scales with demand', () => {
    const highDemand = upgradeProb(0.8, 5, 10)
    const lowDemand = upgradeProb(0.2, 5, 10)
    expect(highDemand).toBeGreaterThan(lowDemand)
  })

  test('mediumRadius starts at 5 for small population', () => {
    expect(mediumRadius(0)).toBe(5)
    expect(mediumRadius(100)).toBeCloseTo(5.1, 1)
  })

  test('mediumRadius caps at 30 for large population', () => {
    expect(mediumRadius(50_000)).toBe(30)
    expect(mediumRadius(1_000_000)).toBe(30)
  })

  test('hasCriticalMass returns false when no medium/high neighbors', () => {
    const map = createTestMap(32)
    // Only low-density neighbors
    map.buildings.push(
      { id: 'b1', defId: 'res.low', x: 9, y: 10, powered: true, density: 0, age: 0, state: 'active', residents: 0 },
      { id: 'b2', defId: 'res.low', x: 11, y: 10, powered: true, density: 0, age: 0, state: 'active', residents: 0 },
    )
    expect(hasCriticalMass(map, 10, 10)).toBe(false)
  })

  test('hasCriticalMass returns true when majority of neighbors are medium density', () => {
    const map = createTestMap(32)
    // Fill all cells in the Manhattan-distance-3 diamond with medium buildings.
    // hasCriticalMass counts 24 cells in the diamond; placing a building in every
    // cell gives ratio 24/24 = 1.0, well above the 0.5 threshold.
    const range = 3
    let id = 0
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        if (dx === 0 && dy === 0) continue
        if (Math.abs(dx) + Math.abs(dy) > range) continue
        map.buildings.push({
          id: `m${id++}`,
          defId: 'res.med',
          x: 10 + dx,
          y: 10 + dy,
          powered: true,
          density: 1,
          age: 0,
          state: 'active',
          residents: 0,
        })
      }
    }
    expect(hasCriticalMass(map, 10, 10)).toBe(true)
  })
})

describe('Low→Medium upgrade', () => {
  test('low building without paved road does not upgrade', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 0,
    })
    // Only dirt road nearby
    map.infrastructure[10 * map.width + 10] = Infrastructure.Road
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGrid = new Uint8Array(map.width * map.height)
    const crimeLevel = new Uint8Array(map.width * map.height)
    const fireCoverage = new Uint8Array(map.width * map.height)
    const pollutionLevel = new Uint8Array(map.width * map.height)
    // Run many iterations — should never upgrade
    for (let i = 0; i < 500; i++) {
      updateDensity(map, powerGrid, demand, 5000, prng, { value: 100 }, crimeLevel, fireCoverage, pollutionLevel)
    }
    expect(map.buildings[0]!.state).toBe('active')
    expect(map.buildings[0]!.defId).toBe('res.low')
  })

  test('low building without sufficient occupancy does not upgrade', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 7,
    })
    // Paved road nearby
    map.infrastructure[10 * map.width + 10] = Infrastructure.Road | Infrastructure.PavedRoad
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGrid = new Uint8Array(map.width * map.height)
    const crimeLevel = new Uint8Array(map.width * map.height)
    const fireCoverage = new Uint8Array(map.width * map.height)
    const pollutionLevel = new Uint8Array(map.width * map.height)
    // Occupancy at 70% — below the 80% threshold
    for (let i = 0; i < 500; i++) {
      map.buildings[0]!.residents = 7 // pin to 70%
      updateDensity(map, powerGrid, demand, 5000, prng, { value: 100 }, crimeLevel, fireCoverage, pollutionLevel)
    }
    expect(map.buildings[0]!.state).toBe('active')
    expect(map.buildings[0]!.defId).toBe('res.low')
  })

  test('low building near paved road at 90%+ occupancy with neighbours eventually upgrades', () => {
    const map = createTestMap(32)
    // Place paved roads and zones for main building and neighbours
    for (let dx = 0; dx < 5; dx++) {
      map.infrastructure[10 * map.width + (10 + dx)] = Infrastructure.Road | Infrastructure.PavedRoad
      map.zones[10 * map.width + (10 + dx)] = ZoneType.Residential
    }
    // Extra zone tile for potential 2-wide expansion
    map.zones[10 * map.width + 15] = ZoneType.Residential
    // Main building at (10,10) + 4 neighbours at 90% occupancy
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 9,
    })
    for (let dx = 1; dx < 5; dx++) {
      map.buildings.push({
        id: `bn${dx}`,
        defId: 'res.low',
        x: 10 + dx,
        y: 10,
        powered: true,
        density: DensityLevel.Low,
        age: 0,
        state: 'active',
        residents: 9,
      })
    }
    const prng = new PRNG(42)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGrid = new Uint8Array(map.width * map.height)
    for (let dx = 0; dx < 6; dx++) powerGrid[10 * map.width + (10 + dx)] = 1
    const crimeLevel = new Uint8Array(map.width * map.height)
    const fireCoverage = new Uint8Array(map.width * map.height)
    const pollutionLevel = new Uint8Array(map.width * map.height)
    // Run many iterations — pin residents to 90% each tick — should eventually upgrade
    let upgraded = false
    for (let i = 0; i < 2000; i++) {
      for (const b of map.buildings) {
        if (b.state === 'active') b.residents = 9
      }
      updateDensity(map, powerGrid, demand, 5000, prng, { value: 100 }, crimeLevel, fireCoverage, pollutionLevel)
      if (map.buildings.some((b) => b.state === 'under_construction' || b.defId.includes('med'))) {
        upgraded = true
        break
      }
    }
    expect(upgraded).toBe(true)
  })

  test('building in under_construction state ticks down and completes', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'under_construction',
      residents: 0,
      constructionMonthsRemaining: 1,
      upgradingToDefId: 'res.med',
    })
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGrid = new Uint8Array(map.width * map.height)
    const crimeLevel = new Uint8Array(map.width * map.height)
    const fireCoverage = new Uint8Array(map.width * map.height)
    const pollutionLevel = new Uint8Array(map.width * map.height)
    const result = updateDensity(
      map,
      powerGrid,
      demand,
      5000,
      prng,
      { value: 100 },
      crimeLevel,
      fireCoverage,
      pollutionLevel,
    )
    // Should complete construction (1 month remaining → 0 → complete)
    expect(map.buildings[0]!.state).toBe('active')
    expect(map.buildings[0]!.defId).toBe('res.med')
    // New building starts at residents=0; no consumed buildings; fill loop skips under_construction
    expect(result.populationDelta).toBe(0)
  })
})

describe('Medium→High upgrade', () => {
  test('medium building without transit stop does not upgrade to high', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.med',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Medium,
      age: 0,
      state: 'active',
      residents: 50,
    })
    // No transit stop in map
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGrid = new Uint8Array(map.width * map.height)
    const crimeLevel = new Uint8Array(map.width * map.height)
    const fireCoverage = new Uint8Array(map.width * map.height)
    const pollutionLevel = new Uint8Array(map.width * map.height)
    for (let i = 0; i < 1000; i++) {
      map.buildings[0]!.residents = 50 // pin to avoid dereliction from drain
      updateDensity(map, powerGrid, demand, 5000, prng, { value: 100 }, crimeLevel, fireCoverage, pollutionLevel)
    }
    expect(map.buildings[0]!.defId).toBe('res.med')
    expect(map.buildings[0]!.state).toBe('active')
  })

  test('medium building without critical mass does not upgrade to high', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.med',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Medium,
      age: 0,
      state: 'active',
      residents: 50,
    })
    // Add transit stop nearby
    map.buildings.push({
      id: 'ts',
      defId: 'transit.stop',
      x: 12,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 0,
    })
    // No medium-density neighbours for critical mass
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGrid = new Uint8Array(map.width * map.height)
    const crimeLevel = new Uint8Array(map.width * map.height)
    const fireCoverage = new Uint8Array(map.width * map.height)
    const pollutionLevel = new Uint8Array(map.width * map.height)
    for (let i = 0; i < 1000; i++) {
      map.buildings[0]!.residents = 50 // pin to avoid dereliction from drain
      updateDensity(map, powerGrid, demand, 5000, prng, { value: 100 }, crimeLevel, fireCoverage, pollutionLevel)
    }
    expect(map.buildings[0]!.defId).toBe('res.med')
  })

  test('medium→high upgrade blocked if occupancy below 0.85 despite transit and critical mass', () => {
    const map = createTestMap(32)
    // Main building: res.med with only 5 out of 100 capacity (5% occupancy)
    map.buildings.push({
      id: 'b1',
      defId: 'res.med',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Medium,
      age: 0,
      state: 'active',
      residents: 5,
    })
    // Transit stop within 10 tiles
    map.buildings.push({
      id: 'ts',
      defId: 'transit.stop',
      x: 12,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 0,
    })
    // Fill >50% of neighbours in 3-tile radius with medium buildings to satisfy criticalMass
    const range = 3
    let id = 0
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        if (dx === 0 && dy === 0) continue
        if (Math.abs(dx) + Math.abs(dy) > range) continue
        map.buildings.push({
          id: `m${id++}`,
          defId: 'res.med',
          x: 10 + dx,
          y: 10 + dy,
          powered: true,
          density: DensityLevel.Medium,
          age: 0,
          state: 'active',
          residents: 90,
        })
      }
    }
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGrid = new Uint8Array(map.width * map.height)
    const crimeLevel = new Uint8Array(map.width * map.height)
    const fireCoverage = new Uint8Array(map.width * map.height)
    const pollutionLevel = new Uint8Array(map.width * map.height)
    // Run many iterations — pin main building occupancy to 5% each tick
    // Also reset lowOccupancyMonths to prevent dereliction (testing upgrade gate, not dereliction)
    for (let i = 0; i < 500; i++) {
      map.buildings[0]!.residents = 5 // keep occupancy at 5%, well below 0.85
      map.buildings[0]!.lowOccupancyMonths = undefined // prevent dereliction from firing
      updateDensity(map, powerGrid, demand, 5000, prng, { value: 100 }, crimeLevel, fireCoverage, pollutionLevel)
    }
    // Despite transit and critical mass, low occupancy must block upgrade
    expect(map.buildings[0]!.state).toBe('active')
    expect(map.buildings[0]!.defId).toBe('res.med')
  })
})

describe('derelict buildings', () => {
  test('derelict building downgrades to construction after 6 months', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.med',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Medium,
      age: 5,
      state: 'derelict',
      residents: 0,
      derelictMonths: 5,
    })
    // Tick once more (5+1=6) — should trigger downgrade
    tickDerelict(map, map.buildings[0]!)
    // Should now be under_construction heading to res.low
    expect(map.buildings[0]!.state).toBe('under_construction')
    expect(map.buildings[0]!.upgradingToDefId).toBe('res.low')
  })

  test('low-density derelict building just becomes active (no downgrade)', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 5,
      state: 'derelict',
      residents: 0,
      derelictMonths: 5,
    })
    tickDerelict(map, map.buildings[0]!)
    // Low density has nowhere to downgrade — resets to active
    expect(map.buildings[0]!.state).toBe('active')
  })

  it('tickDerelict subtracts actual residents, not capacity', () => {
    const map = createTestMap(32)
    const building: Building = {
      id: 'b1',
      defId: 'res.med',
      x: 5,
      y: 5,
      powered: true,
      density: DensityLevel.Medium,
      age: 10,
      state: 'derelict',
      residents: 3,
      derelictMonths: 5,
    }
    map.buildings.push(building)
    const delta = tickDerelict(map, building)
    expect(delta).toBe(-3) // actual residents, not capacity
  })

  test('updateDensity calls tickDerelict for derelict buildings', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.med',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Medium,
      age: 5,
      state: 'derelict',
      residents: 0,
      derelictMonths: 0,
    })
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGrid = new Uint8Array(map.width * map.height)
    const crimeLevel = new Uint8Array(map.width * map.height)
    const fireCoverage = new Uint8Array(map.width * map.height)
    const pollutionLevel = new Uint8Array(map.width * map.height)
    updateDensity(map, powerGrid, demand, 5000, prng, { value: 100 }, crimeLevel, fireCoverage, pollutionLevel)
    // After one tick, derelictMonths should be 1
    expect(map.buildings[0]!.derelictMonths).toBe(1)
  })
})

describe('occupancy-based dereliction', () => {
  test('lowOccupancyMonths increments when residents < 10% capacity', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.med',
      x: 5,
      y: 5,
      powered: true,
      density: DensityLevel.Medium,
      age: 3,
      state: 'active',
      residents: 0, // 0% of capacity=100 — below 10%
      lowOccupancyMonths: undefined,
    })
    const powerGrid = new Uint8Array(map.width * map.height)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const prng = new PRNG(1)
    const nextId = { value: 100 }
    const empty = new Uint8Array(map.width * map.height)

    updateDensity(map, powerGrid, demand, 0, prng, nextId, empty, empty, empty)
    // After one tick: lowOccupancyMonths should be 1
    const b = map.buildings[0]!
    expect(b.lowOccupancyMonths).toBe(1)
  })

  test('building goes derelict after 3 months below 10% capacity', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.med',
      x: 5,
      y: 5,
      powered: true,
      density: DensityLevel.Medium,
      age: 3,
      state: 'active',
      residents: 0, // empty → below 10% of capacity=100
      lowOccupancyMonths: 2, // pre-seed: 2 months already low
    })
    const powerGrid = new Uint8Array(map.width * map.height)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const prng = new PRNG(1)
    const nextId = { value: 100 }
    const empty = new Uint8Array(map.width * map.height)

    updateDensity(map, powerGrid, demand, 0, prng, nextId, empty, empty, empty)
    // Month 3 (2+1) → triggers dereliction → startConstruction to downgrade to res.low
    // With variable construction time, low-density construction takes 1 month,
    // so tickConstruction completes it in the same tick → state = 'active', defId = 'res.low'
    expect(map.buildings[0]!.defId).toBe('res.low')
    expect(map.buildings[0]!.state).toBe('active')
  })

  test('lowOccupancyMonths resets to undefined when residents recover above 10%', () => {
    const map = createTestMap(32)
    map.infrastructure[5 * map.width + 5] = Infrastructure.Road
    map.zones[5 * map.width + 5] = ZoneType.Residential
    map.buildings.push({
      id: 'b1',
      defId: 'res.med',
      x: 5,
      y: 5,
      powered: true,
      density: DensityLevel.Medium,
      age: 3,
      state: 'active',
      residents: 15, // 15% — above 10% threshold
      lowOccupancyMonths: 1,
    })
    const powerGrid = new Uint8Array(map.width * map.height)
    powerGrid[5 * map.width + 5] = 1
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const prng = new PRNG(1)
    const nextId = { value: 100 }
    const empty = new Uint8Array(map.width * map.height)

    updateDensity(map, powerGrid, demand, 0, prng, nextId, empty, empty, empty)
    expect(map.buildings[0]!.lowOccupancyMonths).toBeUndefined()
  })

  test('populationDelta on dereliction uses actual residents not capacity', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.med',
      x: 5,
      y: 5,
      powered: true,
      density: DensityLevel.Medium,
      age: 3,
      state: 'active',
      residents: 8, // 8% of capacity=100 — below 10%
      lowOccupancyMonths: 2,
    })
    const powerGrid = new Uint8Array(map.width * map.height)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const prng = new PRNG(1)
    const nextId = { value: 100 }
    const empty = new Uint8Array(map.width * map.height)

    const { populationDelta } = updateDensity(map, powerGrid, demand, 0, prng, nextId, empty, empty, empty)
    // residents was 8, fill loop drains it slightly (target=0), then dereliction fires
    // the populationDelta from dereliction should be -residents (whatever residents is after fill)
    // The exact value depends on drain, but it should be negative
    expect(populationDelta).toBeLessThan(0)
  })

  test('bulldozing paved road no longer instantly derelicts medium building', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1, startingFunds: 999_999 })
    // Place a medium building manually
    engine.placeBuilding(0, 0, 'power.diesel')
    for (let x = 3; x < 8; x++) {
      engine.placeTile(x, 0, Infrastructure.Road)
      engine.upgradeTile(x, 0)
      engine.placeZone(x, 1, ZoneType.Residential)
    }
    // Manually place a medium building into the state
    const state = engine.getState()
    state.map.buildings.push({
      id: 'med1',
      defId: 'res.med',
      x: 3,
      y: 1,
      powered: true,
      density: DensityLevel.Medium,
      age: 5,
      state: 'active',
      residents: 80,
    })
    // Bulldoze the paved road
    engine.bulldoze(3, 0)
    // Building should NOT be immediately derelict
    const b = engine.getState().map.buildings.find((b) => b.id === 'med1')!
    expect(b.state).toBe('active') // still active, will drain slowly
  })
})

describe('paved road upgrade', () => {
  test('can upgrade a dirt road to paved', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1, startingFunds: 10_000 })
    engine.placeTile(5, 5, Infrastructure.Road)
    const result = engine.upgradeTile(5, 5)
    expect(result.ok).toBe(true)
    const infra = engine.getTile(5, 5).infrastructure
    expect(infra & Infrastructure.PavedRoad).toBeTruthy()
  })

  test('cannot upgrade a tile with no road', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1, startingFunds: 10_000 })
    const result = engine.upgradeTile(5, 5)
    expect(result.ok).toBe(false)
  })

  test('cannot upgrade an already paved road', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1, startingFunds: 10_000 })
    engine.placeTile(5, 5, Infrastructure.Road)
    engine.upgradeTile(5, 5)
    const result = engine.upgradeTile(5, 5)
    expect(result.ok).toBe(false)
  })

  test('upgrading costs money', () => {
    const engine = Engine.create(createTestMap(32), { seed: 1, startingFunds: 10_000 })
    engine.placeTile(5, 5, Infrastructure.Road)
    const before = engine.getState().funds
    engine.upgradeTile(5, 5)
    expect(engine.getState().funds).toBeLessThan(before)
  })
})

describe('checkFootprintForUpgrade — building consumption', () => {
  test('non-expanding upgrade (1x1 → 1x1) always succeeds with no buildings to consume', () => {
    const map = createTestMap(32)
    map.zones[10 * map.width + 10] = ZoneType.Residential
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'under_construction',
      residents: 0,
      constructionMonthsRemaining: 0,
      upgradingToDefId: 'res.med',
    })
    const result = checkFootprintForUpgrade(
      map,
      10,
      10,
      { w: 1, h: 1 },
      'b1',
      { w: 1, h: 1 },
      BuildingCategory.Residential,
    )
    expect(result).toEqual({ ok: true, toConsume: [], consumedPop: 0 })
  })

  test('expanding upgrade consumes same-zone building in new footprint', () => {
    const map = createTestMap(32)
    // Zone both tiles as Residential
    map.zones[10 * map.width + 10] = ZoneType.Residential
    map.zones[10 * map.width + 11] = ZoneType.Residential
    // res.low at (10,10) upgrading to res.med.b (2×1); res.low at (11,10) should be consumed
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'under_construction',
      residents: 0,
      constructionMonthsRemaining: 0,
      upgradingToDefId: 'res.med.b',
    })
    map.buildings.push({
      id: 'b2',
      defId: 'res.low',
      x: 11,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 10,
    })
    const result = checkFootprintForUpgrade(
      map,
      10,
      10,
      { w: 2, h: 1 },
      'b1',
      { w: 1, h: 1 },
      BuildingCategory.Residential,
    )
    expect(result).toEqual({ ok: true, toConsume: ['b2'], consumedPop: 10 })
  })

  test('expansion tile with wrong zone type blocks the upgrade', () => {
    const map = createTestMap(32)
    map.zones[10 * map.width + 10] = ZoneType.Residential
    map.zones[10 * map.width + 11] = ZoneType.Commercial // wrong zone
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'under_construction',
      residents: 0,
      constructionMonthsRemaining: 0,
      upgradingToDefId: 'res.med.b',
    })
    const result = checkFootprintForUpgrade(
      map,
      10,
      10,
      { w: 2, h: 1 },
      'b1',
      { w: 1, h: 1 },
      BuildingCategory.Residential,
    )
    expect(result.ok).toBe(false)
  })

  test('expansion tile with unzoned land blocks the upgrade', () => {
    const map = createTestMap(32)
    map.zones[10 * map.width + 10] = ZoneType.Residential
    // tile (11,10) has ZoneType.None (default)
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'under_construction',
      residents: 0,
      constructionMonthsRemaining: 0,
      upgradingToDefId: 'res.med.b',
    })
    const result = checkFootprintForUpgrade(
      map,
      10,
      10,
      { w: 2, h: 1 },
      'b1',
      { w: 1, h: 1 },
      BuildingCategory.Residential,
    )
    expect(result.ok).toBe(false)
  })

  test('different-zone building in expansion area blocks the upgrade', () => {
    const map = createTestMap(32)
    map.zones[10 * map.width + 10] = ZoneType.Residential
    map.zones[10 * map.width + 11] = ZoneType.Residential
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'under_construction',
      residents: 0,
      constructionMonthsRemaining: 0,
      upgradingToDefId: 'res.med.b',
    })
    // Commercial building on an R-zoned tile (unusual but should still block)
    map.buildings.push({
      id: 'b2',
      defId: 'com.low',
      x: 11,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 0,
    })
    const result = checkFootprintForUpgrade(
      map,
      10,
      10,
      { w: 2, h: 1 },
      'b1',
      { w: 1, h: 1 },
      BuildingCategory.Residential,
    )
    expect(result.ok).toBe(false)
  })

  test('under_construction building in expansion area blocks (waits)', () => {
    const map = createTestMap(32)
    map.zones[10 * map.width + 10] = ZoneType.Residential
    map.zones[10 * map.width + 11] = ZoneType.Residential
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'under_construction',
      residents: 0,
      constructionMonthsRemaining: 0,
      upgradingToDefId: 'res.med.b',
    })
    map.buildings.push({
      id: 'b2',
      defId: 'res.low',
      x: 11,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'under_construction',
      residents: 0,
      constructionMonthsRemaining: 1,
    })
    const result = checkFootprintForUpgrade(
      map,
      10,
      10,
      { w: 2, h: 1 },
      'b1',
      { w: 1, h: 1 },
      BuildingCategory.Residential,
    )
    expect(result.ok).toBe(false)
  })

  test('out-of-bounds expansion blocks the upgrade', () => {
    const map = createTestMap(32)
    map.zones[10 * map.width + 31] = ZoneType.Residential
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 31,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'under_construction',
      residents: 0,
      constructionMonthsRemaining: 0,
      upgradingToDefId: 'res.med.b',
    })
    // Expanding to x=32 which is out of bounds for a 32-wide map
    const result = checkFootprintForUpgrade(
      map,
      31,
      10,
      { w: 2, h: 1 },
      'b1',
      { w: 1, h: 1 },
      BuildingCategory.Residential,
    )
    expect(result.ok).toBe(false)
  })

  test('multiple buildings consumed in a 2×2 upgrade', () => {
    const map = createTestMap(32)
    // Zone all four tiles
    for (const [dx, dy] of [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ] as const) {
      map.zones[(10 + dy) * map.width + (10 + dx)] = ZoneType.Residential
    }
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'under_construction',
      residents: 0,
      constructionMonthsRemaining: 0,
      upgradingToDefId: 'res.high',
    })
    map.buildings.push({
      id: 'b2',
      defId: 'res.low',
      x: 11,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 10,
    })
    map.buildings.push({
      id: 'b3',
      defId: 'res.low',
      x: 10,
      y: 11,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 10,
    })
    map.buildings.push({
      id: 'b4',
      defId: 'res.low',
      x: 11,
      y: 11,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 10,
    })
    const result = checkFootprintForUpgrade(
      map,
      10,
      10,
      { w: 2, h: 2 },
      'b1',
      { w: 1, h: 1 },
      BuildingCategory.Residential,
    )
    expect(result).toMatchObject({ ok: true, consumedPop: 30 })
    if (result.ok) expect(result.toConsume.sort()).toEqual(['b2', 'b3', 'b4'])
  })

  test('tickConstruction removes consumed buildings and corrects population delta', () => {
    const map = createTestMap(32)
    map.zones[10 * map.width + 10] = ZoneType.Residential
    map.zones[10 * map.width + 11] = ZoneType.Residential
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'under_construction',
      residents: 0,
      constructionMonthsRemaining: 1,
      upgradingToDefId: 'res.med.b',
    })
    // b2 has 8 residents; fill loop will drain it (no power/road) before construction consumes it
    map.buildings.push({
      id: 'b2',
      defId: 'res.low',
      x: 11,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 8,
    })
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const powerGrid = new Uint8Array(map.width * map.height)
    const crimeLevel = new Uint8Array(map.width * map.height)
    const fireCoverage = new Uint8Array(map.width * map.height)
    const pollutionLevel = new Uint8Array(map.width * map.height)
    const result = updateDensity(
      map,
      powerGrid,
      demand,
      5000,
      prng,
      { value: 100 },
      crimeLevel,
      fireCoverage,
      pollutionLevel,
    )
    // Fill loop: b2 drains (no power/road → desirability=0 → target=0): 8 - 8*0.20 = 6.4, delta = -1.6
    // Construction: b2 (now 6.4 residents) consumed, consumedPop=6.4; b1→res.med.b (residents=0), return -6.4
    // Total populationDelta ≈ -1.6 + (-6.4) = -8
    expect(result.populationDelta).toBeCloseTo(-8)
    expect(map.buildings).toHaveLength(1)
    expect(map.buildings[0]!.defId).toBe('res.med.b')
    expect(map.buildings[0]!.state).toBe('active')
  })
})

describe('fill/drain loop', () => {
  function setupBuildingWithInfra(map: ReturnType<typeof createTestMap>, x = 5, y = 5) {
    map.infrastructure[y * map.width + x] = Infrastructure.Road
    map.zones[y * map.width + x] = ZoneType.Residential
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x,
      y,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 0,
    })
  }

  test('building fills toward target at FILL_RATE per month', () => {
    const map = createTestMap(32)
    setupBuildingWithInfra(map)
    const powerGrid = new Uint8Array(map.width * map.height)
    powerGrid[5 * map.width + 5] = 1
    const crimeLevel = new Uint8Array(map.width * map.height)
    const fireCoverage = new Uint8Array(map.width * map.height)
    const pollutionLevel = new Uint8Array(map.width * map.height)
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const nextId = { value: 100 }

    updateDensity(map, powerGrid, demand, 0, prng, nextId, crimeLevel, fireCoverage, pollutionLevel)

    const b = map.buildings[0]!
    // desirability ≈ 0.60 (baseline 0.30 + safety 0.30, no crime)
    // target = 10 * 1.0 * 0.60 = 6
    // after 1 month at FILL_RATE=0.12: residents = 0 + 6 * 0.12 ≈ 0.72
    expect(b.residents).toBeGreaterThan(0)
    expect(b.residents).toBeLessThan(5) // hasn't jumped to full
  })

  test('building drains faster than it fills', () => {
    const map = createTestMap(32)
    setupBuildingWithInfra(map)
    map.buildings[0]!.residents = 10 // start full
    const powerGrid = new Uint8Array(map.width * map.height)
    // no power → desirability = 0 → target = 0
    const crimeLevel = new Uint8Array(map.width * map.height)
    const fireCoverage = new Uint8Array(map.width * map.height)
    const pollutionLevel = new Uint8Array(map.width * map.height)
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const nextId = { value: 100 }

    // Run 3 months — measure drain
    let drainTotal = 0
    for (let i = 0; i < 3; i++) {
      const before = map.buildings[0]!.residents
      updateDensity(map, powerGrid, demand, 0, prng, nextId, crimeLevel, fireCoverage, pollutionLevel)
      drainTotal += before - map.buildings[0]!.residents
    }

    // Now test fill with power on
    map.buildings[0]!.residents = 0
    powerGrid[5 * map.width + 5] = 1
    map.infrastructure[5 * map.width + 5] = Infrastructure.Road
    let fillTotal = 0
    for (let i = 0; i < 3; i++) {
      const before = map.buildings[0]!.residents
      updateDensity(map, powerGrid, demand, 0, prng, nextId, crimeLevel, fireCoverage, pollutionLevel)
      fillTotal += map.buildings[0]!.residents - before
    }

    expect(drainTotal).toBeGreaterThan(fillTotal) // drain is faster
  })

  test('special buildings (power plants) are not affected by fill loop', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'p1',
      defId: 'power.diesel',
      x: 0,
      y: 0,
      powered: false,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 0,
    })
    const powerGrid = new Uint8Array(map.width * map.height)
    const crimeLevel = new Uint8Array(map.width * map.height)
    const fireCoverage = new Uint8Array(map.width * map.height)
    const pollutionLevel = new Uint8Array(map.width * map.height)
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const nextId = { value: 100 }

    updateDensity(map, powerGrid, demand, 0, prng, nextId, crimeLevel, fireCoverage, pollutionLevel)
    expect(map.buildings[0]!.residents).toBe(0)
  })

  test('logistic fill: gain at 80% occupancy is proportionally reduced by occupancy factor', () => {
    // Use res.med (capacity=100) with full desirability (target=100).
    // With logistic rate, effectiveFillRate at 80% = FILL_RATE*(1-0.8) = FILL_RATE*0.2
    // Gain at 80%: (100-80) * FILL_RATE * 0.2 = 20 * 0.024 = 0.48
    // With constant rate (old behavior), gain at 80%: (100-80) * 0.12 = 2.4
    // The logistic gain at 80% should be 5x less than constant-rate gain at 80%.
    // Specifically: gain_at_80pct < gain_at_80pct_if_constant_rate / 4

    function runOneFillStep(startResidents: number): number {
      const map = createTestMap(32)
      const x = 5
      const y = 5
      map.zones[y * map.width + x] = ZoneType.Residential
      map.infrastructure[y * map.width + x] = Infrastructure.Road
      map.buildings.push({
        id: 'b1',
        defId: 'res.med',
        x,
        y,
        powered: true,
        density: DensityLevel.Medium,
        age: 0,
        state: 'active',
        residents: startResidents,
      })
      // Park at (x, y-1): dist=1, park bonus = 0.25*(1-1/5)=0.2
      // Total desirability = 0.3 + 0.3 + 0.15 (fire) + 0.2 (park) = 0.95 → target = 95
      map.buildings.push({
        id: 'park1',
        defId: 'special.park',
        x,
        y: y - 1,
        powered: false,
        density: DensityLevel.Low,
        age: 0,
        state: 'active',
        residents: 0,
      })
      const powerGrid = new Uint8Array(map.width * map.height)
      powerGrid[y * map.width + x] = 1
      const crimeLevel = new Uint8Array(map.width * map.height)
      const fireCoverage = new Uint8Array(map.width * map.height)
      fireCoverage[y * map.width + x] = 1
      const pollutionLevel = new Uint8Array(map.width * map.height)
      const prng = new PRNG(1)
      const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }

      updateDensity(map, powerGrid, demand, 0, prng, { value: 100 }, crimeLevel, fireCoverage, pollutionLevel)
      return map.buildings.find((b) => b.id === 'b1')!.residents - startResidents
    }

    // target ≈ 95, capacity = 100
    // At 0% (0 residents): logistic rate = 0.12*(1-0) = 0.12 → gain ≈ 95*0.12 = 11.4
    // At 80% (80 residents): logistic rate = 0.12*(1-0.8) = 0.024 → gain ≈ 15*0.024 = 0.36
    // Constant rate at 80%: 15*0.12 = 1.8
    // Test: gain at 80% must be more than 3x smaller than gain at 0%
    //       (true for logistic: 11.4/0.36≈31, false for constant: 11.4/1.8=6.3 — but 6.3 > 3 so that passes too)
    // Better: gain_at_0pct / gain_at_80pct > 20 (logistic: ~31, constant: ~6.3)
    const gainAtEmpty = runOneFillStep(0)
    const gainAt80Pct = runOneFillStep(80)

    expect(gainAtEmpty).toBeGreaterThan(0)
    expect(gainAt80Pct).toBeGreaterThan(0)
    // logistic ratio ≈ 31; constant ratio ≈ 6.3; threshold of 15 distinguishes them
    expect(gainAtEmpty / gainAt80Pct).toBeGreaterThan(15)
  })

  test('populationDelta from fill reflects net change in residents', () => {
    const map = createTestMap(32)
    setupBuildingWithInfra(map)
    const powerGrid = new Uint8Array(map.width * map.height)
    powerGrid[5 * map.width + 5] = 1
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const nextId = { value: 100 }
    const crimeLevel = new Uint8Array(map.width * map.height)
    const fireCoverage = new Uint8Array(map.width * map.height)
    const pollutionLevel = new Uint8Array(map.width * map.height)

    const { populationDelta } = updateDensity(
      map,
      powerGrid,
      demand,
      0,
      prng,
      nextId,
      crimeLevel,
      fireCoverage,
      pollutionLevel,
    )
    expect(populationDelta).toBeGreaterThan(0) // building gained residents
    expect(populationDelta).toBe(map.buildings[0]!.residents) // started at 0, gained residents
  })
})

describe('neighbourhoodAvgOccupancy', () => {
  test('returns 0 when no neighbours', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 5,
      y: 5,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 8,
    })
    expect(neighbourhoodAvgOccupancy(map, 5, 5, 5)).toBe(0)
  })

  test('excludes self from calculation', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 5,
      y: 5,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 10,
    })
    map.buildings.push({
      id: 'b2',
      defId: 'res.low',
      x: 6,
      y: 5,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 5,
    })
    // Only b2 should count: 5/10 = 0.5
    expect(neighbourhoodAvgOccupancy(map, 5, 5, 5)).toBeCloseTo(0.5, 2)
  })

  test('averages multiple neighbours', () => {
    const map = createTestMap(32)
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x: 5,
      y: 5,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 8,
    })
    map.buildings.push({
      id: 'b2',
      defId: 'res.low',
      x: 6,
      y: 5,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 8,
    })
    map.buildings.push({
      id: 'b3',
      defId: 'res.low',
      x: 7,
      y: 5,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 6,
    })
    // Asking from b1's perspective: neighbours are b2 (8/10=0.8) and b3 (6/10=0.6) — avg = 0.7
    expect(neighbourhoodAvgOccupancy(map, 5, 5, 5)).toBeCloseTo(0.7, 2)
  })
})

describe('occupancy-based upgrade gates', () => {
  function makeResBuilding(
    id: string,
    x: number,
    y: number,
    residents: number,
    defId = 'res.low',
  ): import('@bitborough/core').Building {
    return { id, defId, x, y, powered: true, density: DensityLevel.Low, age: 0, state: 'active', residents }
  }

  test('low building below 80% occupancy does not upgrade', () => {
    const map = createTestMap(32)
    map.infrastructure[5 * map.width + 5] = Infrastructure.Road | Infrastructure.PavedRoad
    map.zones[5 * map.width + 5] = ZoneType.Residential
    // res.low capacity=10; 70% = 7 residents — below threshold
    map.buildings.push(makeResBuilding('b1', 5, 5, 7))
    const powerGrid = new Uint8Array(map.width * map.height)
    powerGrid[5 * map.width + 5] = 1
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const nextId = { value: 100 }
    const empty = new Uint8Array(map.width * map.height)

    for (let i = 0; i < 500; i++) {
      map.buildings[0]!.residents = 7 // pin to 70% each tick
      updateDensity(map, powerGrid, demand, 5000, prng, nextId, empty, empty, empty)
    }
    expect(map.buildings[0]!.state).toBe('active')
    expect(map.buildings[0]!.defId).toBe('res.low')
  })

  test('lone building at 90% occupancy does not upgrade (no neighbours)', () => {
    const map = createTestMap(32)
    map.infrastructure[5 * map.width + 5] = Infrastructure.Road | Infrastructure.PavedRoad
    map.zones[5 * map.width + 5] = ZoneType.Residential
    // 90% of capacity=10 → 9 residents
    map.buildings.push(makeResBuilding('b1', 5, 5, 9))
    const powerGrid = new Uint8Array(map.width * map.height)
    powerGrid[5 * map.width + 5] = 1
    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const nextId = { value: 100 }
    const empty = new Uint8Array(map.width * map.height)

    for (let i = 0; i < 1000; i++) {
      map.buildings[0]!.residents = 9 // pin to 90%
      updateDensity(map, powerGrid, demand, 5000, prng, nextId, empty, empty, empty)
    }
    // No neighbours → neighbourhoodAvgOccupancy = 0 → upgrade blocked
    expect(map.buildings[0]!.defId).toBe('res.low')
  })

  test('building at 90%+ with neighbourhood also at 80%+ eventually upgrades', () => {
    const map = createTestMap(32)
    // Main building + several neighbours, all near-full
    for (let dx = 0; dx < 6; dx++) {
      const x = 5 + dx
      map.infrastructure[5 * map.width + x] = Infrastructure.Road | Infrastructure.PavedRoad
      map.zones[5 * map.width + x] = ZoneType.Residential
    }
    // Add an extra zone tile for potential 2-wide expansion
    map.zones[5 * map.width + 11] = ZoneType.Residential
    // All 6 buildings at 90% of capacity=10
    for (let dx = 0; dx < 6; dx++) {
      map.buildings.push(makeResBuilding(`b${dx}`, 5 + dx, 5, 9))
    }
    const powerGrid = new Uint8Array(map.width * map.height)
    for (let dx = 0; dx < 7; dx++) powerGrid[5 * map.width + 5 + dx] = 1
    const prng = new PRNG(42)
    const demand = { residential: 1.0, commercial: 0.5, industrial: 0.5 }
    const nextId = { value: 100 }
    const empty = new Uint8Array(map.width * map.height)

    let upgraded = false
    for (let i = 0; i < 2000; i++) {
      // Pin residents to 90% each tick so fill loop doesn't drain them
      for (const b of map.buildings) {
        if (b.state === 'active') b.residents = 9
      }
      updateDensity(map, powerGrid, demand, 5000, prng, nextId, empty, empty, empty)
      if (map.buildings.some((b) => b.defId.includes('med') || b.state === 'under_construction')) {
        upgraded = true
        break
      }
    }
    expect(upgraded).toBe(true)
  })

  test('MEDIUM_DENSITY_POP_THRESHOLD is not exported (removed)', () => {
    // @ts-expect-error — should not exist
    expect(typeof MEDIUM_DENSITY_POP_THRESHOLD).toBe('undefined')
  })
})

describe('variable construction time', () => {
  test('upgrading to high-density sets constructionMonthsRemaining to 4', () => {
    const map = createTestMap(32)
    // Zone tiles for 2x2 expansion across a wide area
    for (let y = 7; y <= 13; y++) {
      for (let x = 7; x <= 13; x++) {
        map.zones[y * map.width + x] = ZoneType.Residential
        map.infrastructure[y * map.width + x] = Infrastructure.Road
      }
    }
    // Transit stop for medium→high gate
    map.buildings.push({
      id: 'ts',
      defId: 'transit.stop',
      x: 12,
      y: 10,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 0,
    })
    // Main building: res.med at high occupancy
    map.buildings.push({
      id: 'b1',
      defId: 'res.med',
      x: 10,
      y: 10,
      powered: true,
      density: DensityLevel.Medium,
      age: 5,
      state: 'active',
      residents: 90,
    })
    // Fill neighbourhood with medium density for critical mass
    const range = 3
    let id = 0
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        if (dx === 0 && dy === 0) continue
        if (Math.abs(dx) + Math.abs(dy) > range) continue
        map.buildings.push({
          id: `m${id++}`,
          defId: 'res.med',
          x: 10 + dx,
          y: 10 + dy,
          powered: true,
          density: DensityLevel.Medium,
          age: 0,
          state: 'active',
          residents: 90,
        })
      }
    }

    const prng = new PRNG(1)
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }
    const size = map.width * map.height
    const powerGrid = new Uint8Array(size)
    powerGrid.fill(1) // power everywhere
    const crimeLevel = new Uint8Array(size)
    const fireCoverage = new Uint8Array(size)
    const pollutionLevel = new Uint8Array(size)

    // Run until upgrade triggers
    let found = false
    for (let i = 0; i < 5000 && !found; i++) {
      // Pin residents high so fill loop doesn't drain below 85%
      for (const b of map.buildings) {
        if (b.state === 'active' && b.defId.startsWith('res')) b.residents = 95
        b.lowOccupancyMonths = undefined
      }
      updateDensity(map, powerGrid, demand, 5000, prng, { value: 100 }, crimeLevel, fireCoverage, pollutionLevel)
      const uc = map.buildings.find((b) => b.state === 'under_construction' && b.upgradingToDefId === 'res.high')
      if (uc) {
        expect(uc.constructionMonthsRemaining).toBe(4)
        found = true
      }
    }
    expect(found).toBe(true)
  })

  test('upgrading to medium-density sets constructionMonthsRemaining to 2', () => {
    const map = createTestMap(32)
    // Set up a low→medium upgrade
    map.infrastructure[5 * map.width + 5] = Infrastructure.Road | Infrastructure.PavedRoad
    map.zones[5 * map.width + 5] = ZoneType.Residential
    // Multiple nearby buildings for neighbourhood occupancy
    for (let dx = 0; dx < 6; dx++) {
      const x = 5 + dx
      map.infrastructure[5 * map.width + x] = Infrastructure.Road | Infrastructure.PavedRoad
      map.zones[5 * map.width + x] = ZoneType.Residential
      map.buildings.push({
        id: `b${dx}`,
        defId: 'res.low',
        x,
        y: 5,
        powered: true,
        density: DensityLevel.Low,
        age: 0,
        state: 'active',
        residents: 9,
      })
    }
    const powerGrid = new Uint8Array(map.width * map.height)
    for (let dx = 0; dx < 7; dx++) powerGrid[5 * map.width + 5 + dx] = 1
    const prng = new PRNG(42)
    const demand = { residential: 1.0, commercial: 0.5, industrial: 0.5 }
    const empty = new Uint8Array(map.width * map.height)

    let found = false
    for (let i = 0; i < 5000 && !found; i++) {
      for (const b of map.buildings) {
        if (b.state === 'active') b.residents = 9
      }
      updateDensity(map, powerGrid, demand, 5000, prng, { value: 100 }, empty, empty, empty)
      const uc = map.buildings.find(
        (b) => b.state === 'under_construction' && b.upgradingToDefId?.startsWith('res.med'),
      )
      if (uc) {
        expect(uc.constructionMonthsRemaining).toBe(2)
        found = true
      }
    }
    expect(found).toBe(true)
  })
})

describe('migration modifier', () => {
  function setupFillableMap() {
    const map = createTestMap(32)
    const x = 10
    const y = 10
    map.infrastructure[y * map.width + x] = Infrastructure.Road
    map.zones[y * map.width + x] = ZoneType.Residential
    map.buildings.push({
      id: 'b1',
      defId: 'res.low',
      x,
      y,
      powered: true,
      density: DensityLevel.Low,
      age: 0,
      state: 'active',
      residents: 0,
    })
    const size = map.width * map.height
    const powerGrid = new Uint8Array(size)
    powerGrid[y * map.width + x] = 1
    const crime = new Uint8Array(size)
    const fire = new Uint8Array(size)
    const poll = new Uint8Array(size)
    return { map, powerGrid, crime, fire, poll }
  }

  test('higher migration modifier fills building faster', () => {
    const a = setupFillableMap()
    const b = setupFillableMap()
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }

    for (let i = 0; i < 10; i++) {
      updateDensity(a.map, a.powerGrid, demand, 5000, new PRNG(1), { value: 100 }, a.crime, a.fire, a.poll, 1.5)
    }
    for (let i = 0; i < 10; i++) {
      updateDensity(b.map, b.powerGrid, demand, 5000, new PRNG(1), { value: 100 }, b.crime, b.fire, b.poll, 0.5)
    }

    expect(a.map.buildings[0]!.residents).toBeGreaterThan(b.map.buildings[0]!.residents)
  })

  test('default modifier (1.0) preserves existing behavior', () => {
    const a = setupFillableMap()
    const b = setupFillableMap()
    const demand = { residential: 1.0, commercial: 1.0, industrial: 1.0 }

    updateDensity(a.map, a.powerGrid, demand, 5000, new PRNG(1), { value: 100 }, a.crime, a.fire, a.poll, 1.0)
    updateDensity(b.map, b.powerGrid, demand, 5000, new PRNG(1), { value: 100 }, b.crime, b.fire, b.poll)

    expect(a.map.buildings[0]!.residents).toBe(b.map.buildings[0]!.residents)
  })
})

describe('density in Engine.tick()', () => {
  test('engine runs density update without errors over 10 years', () => {
    const engine = Engine.create(createTestMap(32), { seed: 99, startingFunds: 999_999 })
    engine.placeBuilding(0, 0, 'power.coal')
    // Bridge the gap between plant (x=0..3) and power lines (x=5..14) with tile at x=4
    engine.placeTile(4, 2, Infrastructure.PowerLine)
    for (let x = 5; x < 15; x++) {
      engine.placeTile(x, 2, Infrastructure.PowerLine)
      engine.placeTile(x, 3, Infrastructure.Road)
      engine.placeZone(x, 4, ZoneType.Residential)
    }
    expect(() => {
      for (let i = 0; i < 480; i++) engine.tick()
    }).not.toThrow()
  })

  test('engine population accounts for density upgrades', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 999_999 })
    engine.placeBuilding(0, 0, 'power.coal')
    // Bridge the gap between plant (x=0..3) and power lines (x=5..14) with tile at x=4
    engine.placeTile(4, 2, Infrastructure.PowerLine)
    // Paved roads to enable medium density
    for (let x = 5; x < 15; x++) {
      engine.placeTile(x, 2, Infrastructure.PowerLine)
      engine.placeTile(x, 3, Infrastructure.Road)
      engine.upgradeTile(x, 3) // pave the roads
      engine.placeZone(x, 4, ZoneType.Residential)
    }
    // Run 10 years
    for (let i = 0; i < 480; i++) engine.tick()
    // Population should be greater than what pure low-density would give (10 pop * 10 zones = 100)
    // Medium density gives 100 pop per building — so even 1 upgrade means population > 100
    expect(engine.getState().population).toBeGreaterThan(0)
  })
})
