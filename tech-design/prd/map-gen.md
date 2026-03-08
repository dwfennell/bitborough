# PRD: @rcity/map-gen

**Package:** `packages/map-gen`
**Status:** Approved
**Dependencies:** `@rcity/core`

---

## Purpose

Procedural terrain generation for RCity. Takes a configuration (size, seed, preset) and produces a `GameMap` with terrain populated — landmasses, water bodies, forests, beaches. The output is ready to hand to the engine or the map editor.

---

## Design Philosophy

Map generation is a **one-shot operation**, separate from the simulation. It answers the question: "What does the world look like before the player starts building?"

Deterministic: same seed + same config = same map, every time.

---

## Public API

```typescript
function generateMap(config: MapGenConfig): GameMap

interface MapGenConfig {
  size: MapSize               // square grid size (32, 64, 128, 256, 512)
  seed: number                // deterministic seed
  preset?: MapPreset          // named terrain style
  waterLevel?: number         // 0.0-1.0, fraction of map that's water (default: 0.3)
  forestDensity?: number      // 0.0-1.0, tree coverage on land (default: 0.4)
  smoothing?: number          // 0-5, how much to smooth terrain edges (default: 2)
}

type MapPreset =
  | 'plains'        // mostly land, small ponds, gentle
  | 'island'        // land surrounded by water
  | 'river'         // river cutting through landmass
  | 'peninsula'     // land jutting into water
  | 'archipelago'   // cluster of islands
  | 'lakeland'      // land with scattered lakes
```

Presets configure the generation algorithm but can be overridden by explicit parameters. A preset is just a named bundle of defaults.

---

## Generation Pipeline

### Step 1: Elevation Map

Generate a 2D heightmap using layered noise (Perlin or Simplex).

- Multiple octaves for natural-looking terrain
- Preset modifies the base shape:
  - `island`: apply circular gradient falloff (edges → water)
  - `river`: carve a noise-based path through the middle
  - `peninsula`: gradient from one side
  - `archipelago`: multiple island centers with falloff
  - `plains`/`lakeland`: flat-ish with noise variation

Output: `Float32Array` of elevation values 0.0-1.0 per tile.

### Step 2: Water Placement

Apply `waterLevel` threshold to the elevation map.

- Tiles below threshold → `TileType.Water`
- Tiles above threshold → `TileType.Grass` (for now)

### Step 3: Shoreline Smoothing

Clean up jagged water/land boundaries.

- Apply cellular automata smoothing (`smoothing` parameter controls iterations)
- Prevents single-tile water holes and one-tile land bridges
- Place `TileType.Sand` along water edges (beach/shoreline)

### Step 4: Vegetation

Place trees on land tiles.

- Use a separate noise layer for forest distribution (clusters, not uniform)
- `forestDensity` controls overall coverage
- Trees avoid water tiles and sand tiles
- Noise creates natural-looking forest patches with clearings

Output: applicable land tiles → `TileType.Trees`

### Step 5: Output

Assemble into a `GameMap`:
- `terrain`: populated with Grass, Water, Sand, Trees, Dirt
- `zones`: all `ZoneType.None`
- `infrastructure`: all `Infrastructure.None`
- `buildings`: empty array

The map is pure terrain. No player-placed content.

---

## Internal Architecture

```
map-gen/src/
├── generate.ts           # Main generateMap function, orchestrates pipeline
├── noise.ts              # Seeded Perlin/Simplex noise implementation
├── elevation.ts          # Heightmap generation with preset shaping
├── water.ts              # Water placement and shoreline smoothing
├── vegetation.ts         # Tree/forest placement
└── presets.ts            # Preset configurations (named defaults)
```

### Noise Implementation

Use a seeded noise algorithm. Options:
- Implement a simple Perlin/Simplex in TypeScript (no deps, ~100-200 lines)
- Use a small library if one exists with no platform deps

The noise module must accept a seed and produce deterministic output.

---

## Design Constraints

- **Zero platform dependencies.** Pure TypeScript + `@rcity/core`. No browser, no Node APIs.
- **Deterministic.** Seeded PRNG and seeded noise throughout. No `Math.random()`.
- **Fast enough.** Generating a 256x256 map should take under 500ms. This runs once at game start, not per frame.
- **No simulation logic.** Map-gen doesn't know about power, zones, traffic, or economy. It produces terrain.
- **Stateless.** `generateMap` is a pure function. No class instances to manage.

---

## Testing Strategy

Map generation is highly testable — pure function, deterministic output.

```typescript
// Determinism
test('same seed produces same map', () => {
  const config = { width: 64, height: 64, seed: 42 }
  const map1 = generateMap(config)
  const map2 = generateMap(config)
  expect(map1.terrain).toEqual(map2.terrain)
})

// Water level
test('higher water level produces more water tiles', () => {
  const dry = generateMap({ width: 64, height: 64, seed: 42, waterLevel: 0.1 })
  const wet = generateMap({ width: 64, height: 64, seed: 42, waterLevel: 0.6 })
  const dryWater = countTiles(dry, TileType.Water)
  const wetWater = countTiles(wet, TileType.Water)
  expect(wetWater).toBeGreaterThan(dryWater)
})

// Presets produce valid maps
test('island preset has water around edges', () => {
  const map = generateMap({ width: 64, height: 64, seed: 42, preset: 'island' })
  // Corner tiles should be water
  expect(getTileType(map, 0, 0)).toBe(TileType.Water)
  expect(getTileType(map, 63, 63)).toBe(TileType.Water)
})

// No trees in water
test('trees are never placed on water', () => {
  const map = generateMap({ width: 128, height: 128, seed: 42, forestDensity: 0.8 })
  for (let i = 0; i < map.terrain.length; i++) {
    if (map.terrain[i] === TileType.Trees) {
      // verify this tile is not also water (shouldn't be possible)
    }
  }
})
```

### Key test areas:
- Determinism (same seed → same map)
- Parameter effects (more water = more water tiles, etc.)
- Preset shapes (island has water edges, river has a water path)
- Boundary conditions (tiny maps, max-size maps)
- Invariants (no trees on water, all tiles valid, correct dimensions)

---

## Future Considerations

- **Elevation as a first-class feature.** Hills and mountains affecting gameplay (water flow, building cost, line-of-sight). Would add an `elevation` layer to `GameMap`.
- **Biomes.** Different terrain generation rules for different climate zones.
- **River generation.** More sophisticated river carving with tributaries and flow direction.
- **Erosion simulation.** Hydraulic erosion for more natural-looking terrain.
- **Editor integration.** The tooling webapp's map editor (Phase 4) could use map-gen as a starting point, then allow manual editing.

---

## Resolved Questions

- **Seed/config in GameMap:** Yes, stored in `MapMeta` (defined in core). Includes seed, preset, and timestamp.
- **Elevation layer:** Included from the start. Map-gen populates `GameMap.elevation` from the heightmap it already computes internally.
- **Map sizes:** Square only. Powers of 2: 32, 64, 128, 256, 512. Min 32x32 (tests/tutorials), default 128x128 (classic SimCity), max 512x512.
- **Extensible presets:** No. Hardcoded list for now. Extensibility is YAGNI until map editor or mod support.
