# PRD: Engine — Zone Development & Demand

**System:** Zone growth, decline, and R/C/I demand model
**Status:** Draft
**Parent:** `@rcity/engine`

---

## Purpose

Zone development is the core loop of the game. Players place zones, the simulation decides what develops, and the result feeds back into further decisions. This system must feel alive — buildings should appear organically, density should increase naturally, and neglected areas should visibly decline.

The demand model determines *how much* of each zone type the city wants. Zone development determines *where and when* buildings actually appear.

---

## Demand Model

### What is Demand?

Demand represents how much pressure exists for each zone type. It's displayed as the classic R/C/I bars in the UI. Positive demand means the city wants more of that type; negative means it has too much.

Demand values range from -1.0 to +1.0:
- **+1.0**: Maximum demand — zones develop rapidly
- **0.0**: Equilibrium — zones develop slowly or not at all
- **-1.0**: Oversupply — buildings may decline or be abandoned

### Demand Calculation

Demand is recalculated monthly (every 4 ticks).

#### Residential Demand

People want to live in the city if there are jobs and the city is attractive.

```
baseDemand = 0.5  (cities naturally attract residents)

jobFactor = (industrialJobs + commercialJobs - residentialPopulation) / max(residentialPopulation, 1)
// Positive if more jobs than workers → people want to move in
// Negative if more workers than jobs → people want to leave

qualityFactor = averageLandValue / 128.0  // 0.0 to ~1.0
// Higher land values → more attractive city

taxFactor = demandModifier(taxRate)  // from budget system

residentialDemand = clamp(baseDemand + jobFactor × 0.5 + qualityFactor × 0.3) × taxFactor
```

#### Commercial Demand

Businesses want customers (residents) and accessible locations.

```
baseDemand = 0.0  (commercial follows residential, doesn't lead)

customerFactor = (residentialPopulation - commercialCapacity × 3) / max(residentialPopulation, 1)
// Each commercial tile serves ~3 residential tiles
// More residents than commercial capacity → demand rises

commercialDemand = clamp(baseDemand + customerFactor × 0.6) × taxFactor
```

Commercial demand is *derived from* residential population. You can't have a thriving commercial district without people to serve.

#### Industrial Demand

Industry provides jobs and is always somewhat needed, but excess causes pollution.

```
baseDemand = 0.3  (industry has natural base demand — cities need jobs)

laborFactor = (residentialPopulation - industrialCapacity × 2) / max(residentialPopulation, 1)
// More workers available than industrial jobs → industry can expand
// Each industrial tile employs ~2 residential tiles worth of workers

pollutionPenalty = totalPollution / (mapArea × 0.5)
// High pollution suppresses new industrial demand

industrialDemand = clamp(baseDemand + laborFactor × 0.4 - pollutionPenalty × 0.3) × taxFactor
```

Industrial demand has a natural base because cities always need *some* industry. But as pollution rises, demand is suppressed — creating a natural ceiling.

### Demand Feedback Loops

These interconnections create the emergent complexity:

```
More residents → more commercial demand → more commercial → more jobs
More jobs → more residential demand → more residents → ...

More industry → more jobs → more residential demand
More industry → more pollution → lower land values → lower residential demand

Higher tax → more revenue → better services → higher land value → more demand
Higher tax → suppressed demand → less development → less revenue
```

The player can't just zone everything residential — they need the right *mix*.

### Capacity Calculation

```
residentialPopulation = sum of all residential buildings' population
  Low density: 10 residents
  Medium density: 40 residents
  High density: 120 residents

commercialCapacity = count of developed commercial tiles
  (each tile "serves" ~3 residential tiles worth of demand)

industrialCapacity = count of developed industrial tiles
  (each tile "employs" ~2 residential tiles worth of workers)
```

---

## Zone Development

### Development Conditions

A zoned tile can develop (grow a building) when ALL of the following are true:

1. **Powered:** Tile has power (from power grid)
2. **Road access:** At least one adjacent tile (N/E/S/W) is a road
3. **Positive demand:** Demand for this zone type is > 0
4. **Not blocked:** No existing building occupying this tile
5. **Land value threshold:** Land value meets minimum for this density level

### Development Process

Checked monthly (every 4 ticks). For each undeveloped zoned tile that meets conditions:

```
developmentChance = baseProbability × demandFactor × landValueFactor × randomFactor

baseProbability = 0.1  (10% base chance per month)
demandFactor = demand for this zone type (0.0 to 1.0)
landValueFactor = 0.5 + (landValue / 255.0) × 0.5  (range: 0.5 to 1.0)
randomFactor = PRNG.next() × 0.5 + 0.75  (range: 0.75 to 1.25, adds variance)

if (PRNG.next() < developmentChance):
  place building at initial density (Low)
```

This means:
- At maximum demand (1.0) and high land value, ~10% chance per month
- At low demand (0.1) and low land value, ~0.5% chance per month
- Random factor prevents all zones from developing simultaneously

### Density Upgrade

Existing buildings can upgrade to higher density when conditions are met. Checked monthly.

```
upgradeChance = baseUpgradeRate × demandFactor × landValueFactor × ageFactor

baseUpgradeRate = 0.02  (2% base chance per month)

// Land value thresholds for density
Low → Medium: requires landValue >= 50
Medium → High: requires landValue >= 120

ageFactor = min(buildingAge / 24, 1.0)  // buildings must exist ~2 years before upgrading
```

Density upgrades are slow and require sustained good conditions. A building in a declining area won't upgrade.

### Density Levels and Population

| Zone | Density | Population | Visual | Land Value Threshold |
|------|---------|------------|--------|---------------------|
| R | Low | 10 | Small house | 0 |
| R | Medium | 40 | Apartment building | 50 |
| R | High | 120 | High-rise | 120 |
| C | Low | — | Corner store | 0 |
| C | Medium | — | Office building | 60 |
| C | High | — | Skyscraper | 140 |
| I | Low | — | Warehouse | 0 |
| I | Medium | — | Factory | 30 |
| I | High | — | Industrial complex | 60 |

Industrial has lower land value thresholds because industry tolerates (and creates) worse conditions.

---

## Decline and Abandonment

Buildings decline when conditions deteriorate. This prevents the game from reaching a solved state — neglect has consequences.

### Decline Triggers

A developed tile is evaluated monthly. It declines when:
- **No power** for 3+ months
- **No road access** (adjacent road destroyed)
- **Negative demand** for its zone type
- **Very low land value** (below threshold for its density)
- **High crime** (land value proxy handles this indirectly)

### Decline Process

```
declineChance = 0.0

if (!powered && monthsWithoutPower >= 3):
  declineChance += 0.15

if (!roadAccess):
  declineChance += 0.20

if (demand < -0.3):
  declineChance += abs(demand) × 0.1

if (landValue < densityThreshold × 0.5):
  declineChance += 0.05

if (PRNG.next() < declineChance):
  if (density > Low):
    downgrade density by one level
  else:
    remove building (tile becomes empty zoned lot)
```

Decline is gradual — high-density buildings downgrade to medium, then low, then empty. This creates visible urban decay in neglected areas.

### Abandonment

When a low-density building declines, the building is removed but the zone remains. The tile can re-develop if conditions improve. Zones are only removed by explicit player action (bulldoze or rezone).

---

## Multi-Tile Buildings

Some buildings (medium and high density, special buildings) occupy multiple tiles.

### Placement Rules
- All tiles in the footprint must be the same zone type
- All tiles must be powered
- At least one edge tile must have road access
- No existing buildings in the footprint

### Multi-Tile Development
When a zone develops into a multi-tile building:
- One tile is the "anchor" (stores the building reference)
- Other tiles reference the anchor
- The building is treated as a unit for power, decline, etc.

### Multi-Tile Decline
When a multi-tile building declines:
- The entire building downgrades or is removed as a unit
- Individual tiles can't decline separately

---

## Building Registry

The engine maintains a registry of building definitions. Each zone type and density maps to available building variants.

```typescript
interface BuildingDef {
  id: string                      // e.g., "residential.low.01"
  category: BuildingCategory
  density: DensityLevel
  size: { w: number; h: number }
  population: number              // residents (residential only)
  jobs: number                    // employment capacity
  taxValue: number                // annual taxable value per tile
  pollutionRadius: number         // 0 for most, >0 for industrial
  pollutionAmount: number         // intensity of pollution
  powerRequired: boolean
  roadRequired: boolean
}
```

When a zone develops, the engine picks a random building variant for that zone type and density from the registry. This creates visual variety.

---

## Growth Momentum (Rate of Growth)

Inspired by Micropolis, each 8x8 region of the map tracks a "Rate of Growth" (ROG) value that provides momentum to development. This prevents cities from feeling static — areas that are growing tend to keep growing, and areas in decline tend to keep declining.

```
ROG is stored per 8x8 block: rogMap[y/8][x/8]
Range: -200 to +200

When a building is placed:   ROG += 10
When a building upgrades:    ROG += 5
When a building declines:    ROG -= 10
When a building is abandoned: ROG -= 15

Each month, ROG decays toward zero by 1:
  if (ROG > 0) ROG--
  if (ROG < 0) ROG++
```

ROG affects development chance:
```
rogFactor = 1.0 + (ROG / 200.0) × 0.5
// At ROG +200: 1.5x development chance (growth hotspot)
// At ROG 0: 1.0x (neutral)
// At ROG -200: 0.5x development chance (declining area)
```

This creates visible "waves" of development and decline across the city, rather than uniform behavior.

---

## Population Caps (Special Building Requirements)

Population growth has hard caps that require specific special buildings to unlock. This creates clear milestones and investment decisions. Inspired by SimCity's stadium/airport/seaport requirements.

```
Residential population cap:
  Base: 2,000 (no special buildings needed)
  + Stadium: raises cap by 5,000
  + Park (any): raises cap by 500 per park

Commercial demand cap:
  Base: uncapped in low/medium density
  High density commercial: requires Airport
  Airport boosts commercial demand by +0.3

Industrial demand cap:
  Base: uncapped in low/medium density
  High density industrial: requires Seaport
  Seaport boosts industrial demand by +0.3
```

Without a stadium, a city plateaus around 2,000 residents. Players must invest $3,000 in a stadium to unlock growth — a significant early-game decision. This creates the "what should I build next?" tension that makes SimCity engaging.

---

## Traffic Impact on Zones

When the traffic system is active (Milestone 7+), traffic routing directly affects zone health. This is one of the strongest feedback mechanisms in the game.

Each developed zone attempts to find a road path to a compatible destination:
- Residential → Commercial or Industrial
- Commercial → Residential or Industrial
- Industrial → Residential or Commercial

The result affects the zone:

| Traffic Result | Meaning | Zone Effect |
|---------------|---------|-------------|
| Route found (< 30 road tiles) | Good connectivity | Normal growth |
| Route found (30+ tiles) | Long commute | Slight development penalty |
| Route failed (dead end) | Poor connectivity | Zone declines |
| No road access at all | Isolated | **Immediate abandonment** |

The 30-tile threshold (from Micropolis) means that distant zones need efficient road networks. This is what transforms roads from a checkbox into a real optimization problem.

---

## Land Value Classes

Land value determines which building variants appear, creating visual distinction between wealthy and poor neighborhoods. Adapted from Micropolis's 4-class system:

| Class | Land Value Range | Residential Visual | Commercial Visual |
|-------|-----------------|-------------------|-------------------|
| 0 (Low) | 0–30 | Shacks, basic houses | Pawn shop, vacant storefront |
| 1 (Working) | 31–80 | Modest homes, duplexes | Corner store, small office |
| 2 (Middle) | 81–150 | Nice houses, apartments | Office building, retail |
| 3 (Wealthy) | 151–255 | Mansions, luxury towers | Glass skyscraper, mall |

When a building develops, the engine selects from variants matching both the density level AND the land value class. This means the same "low density residential" looks different in a rich neighborhood vs a poor one.

---

## Emergent Behaviors

This system creates several emergent patterns that experienced players will discover:

1. **Suburban sprawl:** Low taxes + cheap land = lots of low-density residential spreading outward
2. **Downtown formation:** High land value at center → commercial towers → drives up surrounding value
3. **Industrial districts:** Industry clusters in low-value areas (near edges, away from residential)
4. **Urban decay:** Power outage or removed police → crime rises → land value drops → buildings decline → more decline (death spiral)
5. **Gentrification:** Building a park or police station near low-value area → land value rises → buildings upgrade → character changes
6. **Boom and bust:** Rapid expansion → infrastructure costs exceed revenue → budget crisis → service cuts → decline

---

## Testing

```typescript
test('zone with power and road access develops', () => {
  const engine = createPoweredCityWithRoads()
  engine.placeZone(10, 10, ZoneType.Residential)
  // Advance many months to give development a chance
  for (let i = 0; i < 48; i++) engine.tick() // 1 year
  const tile = engine.getTile(10, 10)
  expect(tile.building).toBeDefined()
})

test('zone without power does not develop', () => {
  const engine = createEngine(20, 20)
  engine.placeTile(10, 9, TileType.Road)
  engine.placeZone(10, 10, ZoneType.Residential)
  // No power plant — zone should not develop
  for (let i = 0; i < 48; i++) engine.tick()
  const tile = engine.getTile(10, 10)
  expect(tile.building).toBeUndefined()
})

test('zone without road access does not develop', () => {
  const engine = createPoweredCity() // has power but no roads near zone
  engine.placeZone(10, 10, ZoneType.Residential)
  for (let i = 0; i < 48; i++) engine.tick()
  const tile = engine.getTile(10, 10)
  expect(tile.building).toBeUndefined()
})

test('R/C/I demand responds to zone ratio', () => {
  const engine = createEngine(64, 64)
  // Place lots of residential, no commercial or industrial
  placeResidentialBlock(engine, 20)
  developAll(engine) // helper to force development
  const demand = engine.getDemand()
  // Should have high commercial and industrial demand, lower residential
  expect(demand.c).toBeGreaterThan(demand.r)
  expect(demand.i).toBeGreaterThan(0)
})

test('building declines after losing power', () => {
  const engine = createDevelopedResidentialTile()
  // Cut power
  engine.bulldoze(powerLineX, powerLineY)
  // Advance 6 months (24 ticks)
  for (let i = 0; i < 24; i++) engine.tick()
  const tile = engine.getTile(10, 10)
  // Building should have declined or been removed
  expect(tile.building?.density).not.toBe(DensityLevel.High)
})

test('high land value enables density upgrade', () => {
  const engine = createLongRunningCity() // city with parks, services, high land value
  // Find a low-density residential building
  const tile = findLowDensityResidential(engine)
  // Advance several years
  for (let i = 0; i < 48 * 5; i++) engine.tick() // 5 years
  const updated = engine.getTile(tile.x, tile.y)
  // Should have upgraded to at least medium density
  expect(updated.building?.density).not.toBe(DensityLevel.Low)
})

test('high tax rate suppresses all zone development', () => {
  const engine = createPoweredCityWithRoads()
  engine.setTaxRate(0.20) // 20% tax
  engine.placeZone(10, 10, ZoneType.Residential)
  for (let i = 0; i < 48; i++) engine.tick() // 1 year
  // Development should be very unlikely at 20% tax
  const tile = engine.getTile(10, 10)
  // This is probabilistic, so we run multiple times or check demand
  expect(engine.getDemand().r).toBeLessThan(0.3)
})
```
