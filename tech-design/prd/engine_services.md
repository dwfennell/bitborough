# PRD: Engine — City Services

**System:** Police, fire, and public services
**Status:** Draft (future — Milestone 6)
**Parent:** `@rcity/engine`

---

## Purpose

City services create a coverage optimization problem. Players must decide where to place stations and how much to fund them, balancing cost against the consequences of poor coverage (crime, fires, declining land values).

Services are the player's primary tool for directly influencing land value, and through it, zone development quality.

---

## Services Overview

| Service | Building | Size | Cost | Annual Cost | Base Radius | Effect |
|---------|----------|------|------|-------------|-------------|--------|
| Police | Police Station | 3x3 | $500 | $100 | 15 tiles | Reduces crime |
| Fire | Fire Station | 3x3 | $500 | $100 | 15 tiles | Reduces fire risk, fights fires |

Future services (not specified here):
- Hospital (health/lifespan, advanced features phase)
- School (education/land value, advanced features phase)
- Stadium (happiness boost, large radius)

---

## Coverage Model

### Radius and Influence

Each station creates a circular influence zone. Influence is strongest at the station and decays linearly to zero at the edge of the radius.

```
influence(distance) = 1.0 - (distance / effectiveRadius)
effectiveRadius = baseRadius × (fundingLevel / 100)
```

At full funding (100%), a police station covers 15 tiles in every direction. At 50% funding, only 7.5 tiles. At 0% funding, the station does nothing.

### Overlapping Coverage

When multiple stations of the same type overlap, their influences are combined but capped at 1.0:

```
totalInfluence(x, y) = min(1.0, sum of all station influences at this tile)
```

This means two overlapping stations don't provide double benefit at the overlap center, but they do extend total coverage area. This is realistic — two police stations in the same neighborhood aren't twice as safe, but they cover more ground together.

---

## Police System

### Crime Calculation

Crime is calculated monthly (every 4 ticks).

```
baseCrime(x, y):
  Undeveloped: 0
  Residential low: 5
  Residential medium: 15
  Residential high: 30
  Commercial low: 8
  Commercial medium: 20
  Commercial high: 35
  Industrial low: 3
  Industrial medium: 8
  Industrial high: 12

policeCoverage = totalPoliceInfluence(x, y)  // 0.0 to 1.0

crimeLevel(x, y) = baseCrime × (1.0 - policeCoverage × 0.8)
```

Police can reduce crime by up to 80%. Some baseline crime always exists — you can't eliminate it entirely. Dense areas generate more crime, requiring more police coverage.

### Crime Effects

Crime feeds into land value as a penalty (see `engine_land-value.md`). This creates the feedback loop:

```
No police → high crime → low land value → buildings decline → less tax revenue → can't afford police
```

The player must break this cycle by investing in police, even when budgets are tight.

---

## Fire System

### Fire Risk

Fire risk is a probability that a fire starts each month. Base risk exists everywhere; fire stations reduce it.

```
baseFireRisk(x, y):
  Undeveloped: 0.0
  Low density: 0.002   (0.2% per month)
  Medium density: 0.005 (0.5% per month)
  High density: 0.008   (0.8% per month)
  Industrial: 0.010     (1.0% per month — highest risk)

fireCoverage = totalFireInfluence(x, y)  // 0.0 to 1.0

effectiveRisk = baseFireRisk × (1.0 - fireCoverage × 0.9)
```

Fire stations reduce fire risk by up to 90% in their coverage area.

### Fire Events

When a fire starts (PRNG roll against effectiveRisk):

1. Tile catches fire — building is marked as "on fire"
2. Each tick, fire has a chance to spread to adjacent developed tiles:
   ```
   spreadChance = 0.3 × (1.0 - fireCoverage × 0.7)
   ```
   Fire coverage reduces spread, but doesn't prevent it entirely.
3. Fire burns for 3-5 ticks. After burning, the building is destroyed (tile becomes empty).
4. If a fire station covers the tile, the fire is extinguished faster (1-2 ticks instead of 3-5).

### Fire Spread Pattern

Fire spreads in cardinal directions (N/E/S/W) to adjacent developed tiles. It cannot cross:
- Water tiles (natural firebreak)
- Roads (act as firebreaks — small but useful)
- Empty/undeveloped tiles

This makes road layout matter for fire containment — a grid of roads creates natural firebreaks.

---

## Funding

Services have adjustable funding from 0% to 100%.

```typescript
engine.setFunding('police', 75)  // 75% funding
engine.setFunding('fire', 100)   // full funding
```

**Funding effects:**
- Coverage radius scales linearly with funding
- Annual cost scales linearly with funding (50% funding = 50% cost)
- At 0% funding, the station exists but provides no benefit (building maintenance still applies)

**The tradeoff:** Cutting service funding saves money but increases crime/fire risk, reducing land values and tax revenue. There's often a "sweet spot" where marginal funding reductions save more than they cost in lost revenue.

---

## Service Placement Strategy

The engine doesn't advise on placement, but the system creates clear strategic considerations:

1. **Central placement:** Maximizes coverage efficiency (one station covers more developed area)
2. **Edge placement:** Wastes half the radius on undeveloped land
3. **Dense area priority:** High-density areas have the most crime/fire risk and generate the most tax revenue — they benefit most from coverage
4. **Industrial areas:** Lower crime but higher fire risk. A fire station near industry is more valuable than a police station.

---

## Data in GameState

```typescript
interface GameState {
  // ...
  crimeLevel: Uint8Array      // 0-255 per tile
  fireCoverage: Uint8Array    // 0-255 per tile (how protected)
  activeFireTiles: number[]   // indices of tiles currently on fire
}
```

---

## Testing Strategy

```typescript
test('police station reduces crime in radius', () => {
  const engine = createDevelopedCity()
  const crimeBefore = engine.getState().crimeLevel[tileIndex(15, 15)]
  engine.placeBuilding(15, 15, 'service.police')
  engine.tick4()
  const crimeAfter = engine.getState().crimeLevel[tileIndex(15, 15)]
  expect(crimeAfter).toBeLessThan(crimeBefore)
})

test('underfunded police has smaller radius', () => {
  const engine = createDevelopedCity()
  engine.placeBuilding(15, 15, 'service.police')
  engine.setFunding('police', 100)
  engine.tick4()
  const fullCoverage = engine.getState().crimeLevel[tileIndex(28, 15)]

  engine.setFunding('police', 50)
  engine.tick4()
  const halfCoverage = engine.getState().crimeLevel[tileIndex(28, 15)]

  // Crime should be higher at edge with half funding
  expect(halfCoverage).toBeGreaterThan(fullCoverage)
})

test('fire spreads to adjacent buildings without fire coverage', () => {
  const engine = createDevelopedCity()
  // Manually start fire (test helper)
  engine._startFire(10, 10)
  engine.tick()
  engine.tick()
  // Check if adjacent tiles caught fire
  const state = engine.getState()
  expect(state.activeFireTiles.length).toBeGreaterThan(1)
})

test('roads act as firebreaks', () => {
  const engine = createDevelopedCity()
  // Place road between two developed areas
  engine.placeTile(12, 10, TileType.Road)
  engine._startFire(10, 10)
  // Advance several ticks
  for (let i = 0; i < 5; i++) engine.tick()
  // Fire should not have crossed the road
  expect(isTileOnFire(engine, 14, 10)).toBe(false)
})
```
