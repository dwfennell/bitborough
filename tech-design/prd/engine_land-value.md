# PRD: Engine — Land Value System

**System:** Land value calculation
**Status:** Draft
**Parent:** `@rcity/engine`

---

## Purpose

Land value is the invisible hand of the simulation. It determines where high-density buildings grow, where slums form, and where the most desirable neighborhoods emerge. It's the bridge between player actions (placing services, parks, infrastructure) and simulation outcomes (zone development, tax revenue, population quality).

Players who understand land value can shape their city deliberately. Those who don't will see mysterious patterns of growth and decline — rewarding deeper engagement.

---

## How Land Value Works

Every tile has a land value from 0 to 255. It's recalculated monthly (every 4 ticks) based on a combination of positive and negative factors, each applied as a distance-weighted influence.

### The Formula

```
landValue(x, y) = clamp(0, 255,
  baseLandValue
  + terrainBonus(x, y)
  + serviceBonus(x, y)
  + parkBonus(x, y)
  + centerBonus(x, y)
  + densityBonus(x, y)
  - pollutionPenalty(x, y)
  - crimePenalty(x, y)
  - trafficPenalty(x, y)
)
```

---

## Positive Factors

### Terrain Bonus
Natural features boost land value. Waterfront property is desirable.

```
Water adjacency:  +15 per adjacent water tile (N/E/S/W)
Water proximity:  +5 for tiles within 3 tiles of water
Trees adjacency:  +3 per adjacent tree tile
```

Water access is the strongest terrain bonus — creating naturally valuable waterfront zones that players will compete to develop.

### Service Coverage Bonus
Police and fire stations increase nearby land values (people want to live in safe, protected areas).

```
Police station:  +20 at station, decays linearly to 0 at edge of radius
Fire station:    +10 at station, decays linearly to 0 at edge of radius

Effective radius = baseRadius × (fundingLevel / 100)
  Police baseRadius: 15 tiles
  Fire baseRadius: 15 tiles
```

Underfunded services provide proportionally less land value boost.

### Park Bonus
Parks directly increase surrounding land values. This is one of the player's most direct tools for shaping the city.

```
Park (1x1):  +15 at park, -3 per tile distance, max radius 5
Park (2x2):  +25 at park, -3 per tile distance, max radius 7
Park (3x3):  +35 at park, -3 per tile distance, max radius 9
```

Parks are cheap ($10 for 1x1) but take up zoneable land. The tradeoff: sacrifice a tile for a park to boost surrounding tiles' value.

### Center Bonus
Tiles closer to the center of developed area have higher base value (urban core premium). This encourages dense, centralized development.

```
developmentCenter = average position of all developed tiles
distanceFromCenter = manhattan distance from (x, y) to developmentCenter
maxDistance = map diagonal / 2
centerBonus = 30 × (1 - distanceFromCenter / maxDistance)
```

This bonus shifts dynamically as the city grows, creating a natural "downtown" that moves with the city's center of mass.

### Development Density Bonus
Developed areas near other developed areas get a small boost (agglomeration effect). Cities are more valuable than empty land.

```
nearbyDevelopment = count of developed tiles within radius 3
densityBonus = min(nearbyDevelopment × 2, 20)
```

---

## Negative Factors

### Pollution Penalty
Industrial zones and power plants generate pollution that reduces nearby land values. This is the primary mechanism for separating industrial from residential areas.

```
pollutionSources:
  Industrial (low density):    pollution = 10, radius = 5
  Industrial (medium density): pollution = 20, radius = 8
  Industrial (high density):   pollution = 35, radius = 12
  Coal power plant:            pollution = 30, radius = 10
  Nuclear power plant:         pollution = 5,  radius = 3  (radiation risk, not air pollution)

pollutionAt(x, y) = sum of all sources:
  contribution = source.pollution × (1 - distance / source.radius)
  (only if distance < source.radius)

pollutionPenalty = min(pollutionAt(x, y), 100)
```

Heavy industry near residential zones tanks land values. Players learn to buffer industry with roads or place it at the city's edge.

### Crime Penalty
Crime reduces land value. Crime is higher where police coverage is poor and population density is high.

```
baseCrime = populationDensity × 0.3  (denser areas have more crime)
policeCoverage = effective police influence at this tile (0.0 to 1.0)
crimeLevel = baseCrime × (1.0 - policeCoverage × 0.8)
// Police can reduce crime by up to 80%, never eliminate it entirely

crimePenalty = crimeLevel × 0.5
```

This creates a feedback loop: no police → high crime → low land value → decline → less tax revenue → can't afford police. Players must intervene to break the cycle.

### Traffic Penalty
Heavy traffic reduces residential desirability. (Future system — stub with zero until traffic is implemented.)

```
trafficPenalty = trafficDensity(x, y) × 0.3  // future
```

---

## Calculation Approach

### Influence Maps

Rather than calculating each tile's value by scanning all sources, use **influence maps** — pre-computed layers that are summed together.

For each factor, maintain a 2D array that stores the influence value at each tile:

```
pollutionMap[y][x] = total pollution influence at (x, y)
serviceMap[y][x] = total service coverage bonus at (x, y)
parkMap[y][x] = total park bonus at (x, y)
```

These maps are recalculated when their inputs change (building placed/removed). The final land value is a simple sum of all influence maps.

### Performance

For factors with large radii (pollution radius 12, service radius 15), the naive approach of iterating over all tiles in radius for each source is O(sources × radius²). With influence maps, each source only writes once, and the final summation is O(mapSize).

For a 128x128 map with ~50 sources, this is fast enough to run monthly without optimization. For larger maps, consider:
- Only recalculating influenced regions when a source changes
- Using a stamp/kernel approach (pre-computed falloff pattern stamped onto the influence map)

---

## Land Value Snapshot

The engine exposes land values as part of `GameState`:

```typescript
interface GameState {
  // ...
  landValues: Uint8Array      // 0-255 per tile
  pollutionLevel: Uint8Array  // 0-255 per tile (for overlay rendering)
  crimeLevel: Uint8Array      // 0-255 per tile (for overlay rendering)
}
```

The game can render these as data overlays (heatmaps) when the player uses the query tool or toggles a map overlay.

---

## Emergent Patterns

Land value creates recognizable city patterns that players will discover:

1. **Waterfront premium:** Tiles near water are naturally high-value. Commercial and high-density residential cluster here.
2. **Industrial buffer zone:** Smart players leave a strip of roads or parks between industry and residential.
3. **Service deserts:** Areas far from police/fire have high crime and low value. Building a station transforms a neighborhood.
4. **Park-driven gentrification:** Dropping a park in a low-value area begins an upgrade cycle.
5. **Pollution creep:** As industry densifies, pollution radius grows, pushing down nearby residential values.
6. **Downtown premium:** The center bonus creates a natural gravity toward the city core.

---

## Testing

```typescript
test('water adjacency increases land value', () => {
  const engine = createEngineWithWater()
  engine.tick4() // monthly update
  const coastal = engine.getLandValue(5, 5)   // next to water
  const inland = engine.getLandValue(15, 15)  // far from water
  expect(coastal).toBeGreaterThan(inland)
})

test('pollution from industry reduces nearby land value', () => {
  const engine = createEngine(30, 30)
  // Place industrial zone and develop it
  placeAndDevelopIndustrial(engine, 15, 15)
  engine.tick4()
  const nearIndustry = engine.getLandValue(17, 15)  // 2 tiles away
  const farAway = engine.getLandValue(28, 28)       // far from industry
  expect(nearIndustry).toBeLessThan(farAway)
})

test('police station increases nearby land value', () => {
  const engine = createEngine(30, 30)
  const before = engine.getLandValue(15, 15)
  engine.placeBuilding(15, 15, 'service.police')
  engine.tick4()
  const after = engine.getLandValue(17, 17)  // within radius
  expect(after).toBeGreaterThan(before)
})

test('park increases adjacent land value', () => {
  const engine = createEngine(20, 20)
  const before = engine.getLandValue(11, 10)
  engine.placeBuilding(10, 10, 'park.1x1')
  engine.tick4()
  const after = engine.getLandValue(11, 10)
  expect(after).toBeGreaterThan(before)
})

test('underfunded police provides less land value bonus', () => {
  const engine = createEngine(30, 30)
  engine.placeBuilding(15, 15, 'service.police')
  engine.setFunding('police', 100)
  engine.tick4()
  const fullFunding = engine.getLandValue(20, 15)

  engine.setFunding('police', 50)
  engine.tick4()
  const halfFunding = engine.getLandValue(20, 15)

  expect(fullFunding).toBeGreaterThan(halfFunding)
})
```
