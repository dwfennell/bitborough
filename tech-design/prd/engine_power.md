# PRD: Engine — Power System

**System:** Power propagation
**Status:** Draft
**Parent:** `@rcity/engine`

---

## Purpose

Simulates electrical power distribution across the city. Power plants generate electricity, power lines and roads transmit it, and buildings/zones require power to develop. The power system creates one of the game's first interesting problems: efficient grid coverage under budget constraints.

---

## How It Works in Classic SimCity

In the original SimCity / Micropolis:
- Power plants generate power with unlimited capacity (simplified)
- Power conducts through power lines AND through developed zones/buildings (any building can transmit power to adjacent buildings)
- Unpowered zones cannot develop
- Power propagation is a flood fill from power plants
- If a power line is destroyed, everything beyond the break goes dark immediately

RCity follows this model with minor refinements for depth.

---

## Core Mechanics

### Power Sources

| Building       | Size | Capacity | Cost     | Maintenance | Notes                    |
|---------------|------|----------|----------|-------------|--------------------------|
| Coal plant    | 4x4  | 200 tiles | $3,000  | $120/year   | Pollutes surrounding area |
| Nuclear plant | 4x4  | 500 tiles | $5,000  | $250/year   | Meltdown risk (future)    |

**Capacity** limits how many tiles a single plant can power. This forces players to build multiple plants as the city grows — a key economic pressure.

### Power Conductors

The following tile types conduct power to adjacent tiles:
- Power lines (dedicated infrastructure)
- Roads (conduct power as a secondary function, matching SimCity behavior)
- All buildings/developed zones (conduct to neighbors)

This means a continuous strip of development conducts power without explicit power lines, but gaps require lines to bridge.

### Power Consumers

Every developed zone tile and special building consumes 1 unit of power capacity. Undeveloped (empty) zoned tiles do not consume power but also do not conduct it.

---

## Algorithm: Power Propagation

Runs every tick. Uses a multi-source BFS (breadth-first search) flood fill.

### Input
- Positions of all power plants
- Map grid with conductor information (which tiles conduct)

### Output
- `powerGrid: Uint8Array` — 1 if powered, 0 if not, for every tile
- `plantLoad: Map<buildingId, number>` — how many tiles each plant is powering

### Steps

```
1. Clear powerGrid to all zeros
2. Create a queue, seed it with all tiles occupied by power plants
3. For each power plant, initialize a remaining capacity counter
4. BFS from all plants simultaneously:
   a. Dequeue tile (x, y)
   b. If already powered, skip
   c. Mark tile as powered
   d. If tile is a consumer (developed zone or building), decrement the
      source plant's remaining capacity
   e. If source plant capacity exhausted, stop expanding from this plant
   f. For each adjacent tile (N, E, S, W):
      - If tile conducts power (power line, road, or developed building)
        and not yet powered, enqueue it
5. After BFS completes, any tile still 0 in powerGrid is unpowered
```

### Capacity Distribution

When multiple plants serve the same grid, tiles closer to a plant draw from that plant's capacity first (natural BFS ordering). This means:
- A plant can only power up to its capacity limit
- Overloaded grids have dark spots at the edges
- Adding a new plant immediately lights up nearby unpowered tiles

### Performance

For a 128x128 map (16,384 tiles), BFS visits each tile at most once = O(n) where n = total tiles. This is fast enough to run every tick.

For 512x512 (262,144 tiles), still manageable but consider caching and only re-running when the grid topology changes (a tile is placed/removed that affects conductivity).

### Optimization: Dirty Flag

Track whether the power grid needs recalculation:
- **Dirty after:** placing/removing power line, road, building, power plant, or bulldozing
- **Not dirty after:** zone placement (empty zones don't conduct), economy changes, time passing without construction

If not dirty, skip power propagation on that tick. This is safe because power state only changes when the physical grid changes.

---

## Effects of Power Status

| Condition | Effect |
|-----------|--------|
| Zone powered | Can develop (grow buildings) |
| Zone unpowered | Cannot develop, existing buildings begin to decline |
| Zone loses power | Buildings don't disappear immediately; they stop growing and slowly decline over several months |
| Building powered | Functions normally |
| Building unpowered | Reduced or no function (police station with no power = no crime reduction) |

### Decline Mechanic

When a developed zone loses power:
1. First month without power: no growth, building "stalls"
2. After 3 months without power: building begins to decline (density drops)
3. After 6 months without power: building is abandoned (removed)

This gives players time to fix power issues without instant punishment, but creates urgency.

---

## Visual Feedback (Engine → Game)

The engine exposes power data; the game renders it:

- `powerGrid` array: game can render powered/unpowered overlay
- Unpowered buildings: game can show a visual indicator (flashing, dimmed, icon)
- Power plant capacity: game can show load bar on plant query

---

## Costs

| Item | Placement Cost | Annual Maintenance |
|------|---------------|-------------------|
| Power line (per tile) | $5 | $0.5 |
| Coal power plant | $3,000 | $120 |
| Nuclear power plant | $5,000 | $250 |

Power lines are cheap to place but add up over long distances. This incentivizes compact cities and building near power plants.

---

## Edge Cases

- **Island grids:** Two separate power networks work independently. Each plant powers only its connected grid.
- **Plant destroyed:** All tiles powered only by that plant go dark on next tick.
- **Circular paths:** BFS naturally handles cycles — tiles are marked visited, no infinite loops.
- **Power line on water:** Not allowed (placement validation in engine).
- **Bridge power:** Roads on bridges conduct power across water (future).

---

## Testing

```typescript
test('power plant powers adjacent zones through power line', () => {
  const engine = createEngine(20, 20)
  engine.placeBuilding(5, 5, 'power.coal')
  engine.placeTile(6, 5, TileType.PowerLine)
  engine.placeTile(7, 5, TileType.PowerLine)
  engine.placeZone(8, 5, ZoneType.Residential)
  engine.tick()
  expect(engine.getPowerStatus(8, 5)).toBe(true)
})

test('zones beyond a gap are not powered', () => {
  const engine = createEngine(20, 20)
  engine.placeBuilding(5, 5, 'power.coal')
  engine.placeTile(6, 5, TileType.PowerLine)
  // gap at (7, 5)
  engine.placeZone(8, 5, ZoneType.Residential)
  engine.tick()
  expect(engine.getPowerStatus(8, 5)).toBe(false)
})

test('power plant has capacity limit', () => {
  const engine = createEngine(30, 30)
  engine.placeBuilding(0, 0, 'power.coal')  // capacity: 200
  // Fill 250 connected tiles with power lines
  for (let x = 0; x < 25; x++) {
    for (let y = 0; y < 10; y++) {
      if (x < 4 && y < 4) continue // skip plant footprint
      engine.placeTile(x, y, TileType.PowerLine)
    }
  }
  engine.tick()
  // Some tiles at the edge should be unpowered (exceeded capacity)
  const state = engine.getState()
  const poweredCount = countPowered(state.powerGrid)
  expect(poweredCount).toBeLessThanOrEqual(200 + 16) // 200 capacity + 16 plant tiles
})

test('roads conduct power', () => {
  const engine = createEngine(20, 20)
  engine.placeBuilding(5, 5, 'power.coal')
  engine.placeTile(6, 5, TileType.Road)
  engine.placeTile(7, 5, TileType.Road)
  engine.placeZone(8, 5, ZoneType.Residential)
  engine.tick()
  expect(engine.getPowerStatus(8, 5)).toBe(true)
})

test('destroying power line disconnects zones beyond it', () => {
  const engine = createEngine(20, 20)
  engine.placeBuilding(5, 5, 'power.coal')
  engine.placeTile(6, 5, TileType.PowerLine)
  engine.placeTile(7, 5, TileType.PowerLine)
  engine.placeZone(8, 5, ZoneType.Residential)
  engine.tick()
  expect(engine.getPowerStatus(8, 5)).toBe(true)

  engine.bulldoze(7, 5)
  engine.tick()
  expect(engine.getPowerStatus(8, 5)).toBe(false)
})
```
