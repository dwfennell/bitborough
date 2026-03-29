# Map Generation Design

> **Status:** DONE — Implemented and shipped.

**Package:** `@bitborough/map-gen`
**Dependencies:** `@bitborough/core`
**Status:** Approved

---

## Purpose

Procedural terrain generation for city maps. A single pure function that takes a config and returns a populated `GameMap`. Deterministic via seeded PRNG. No simulation logic, no platform dependencies.

## Public API

```typescript
function generateMap(config: MapGenConfig): GameMap

interface MapGenConfig {
  size: MapSize        // 32, 64, 128, 256, 512
  seed: number
  preset: 'plains' | 'island'
  waterLevel?: number      // 0.0-1.0, default 0.3
  forestDensity?: number   // 0.0-1.0, default 0.4
  smoothing?: number       // 0-5 iterations, default 2
}
```

## Generation Pipeline

1. **Noise generation** — Seeded 2D simplex noise, layered octaves for natural-looking heightmaps
2. **Water placement** — Threshold noise values below `waterLevel` become Water tiles. For island preset, a radial gradient mask forces edges below water level.
3. **Shoreline smoothing** — Cellular automata passes clean up jagged coastlines. Configurable iteration count.
4. **Sand biomes** — Separate noise layer places sand patches as arid terrain areas (not as water/land transitions)
5. **Vegetation** — Another noise layer places Trees on Grass tiles. Avoids water and sand. Density controlled by `forestDensity`.

## Output

Populates `GameMap.terrain` with: `TileType.Water`, `TileType.Grass`, `TileType.Sand`, `TileType.Trees`.

Elevation array left zeroed (future feature). All other map arrays (zones, infrastructure, connections, buildings) are empty/default.

## Modules

```
packages/map-gen/src/
├── generate.ts       # Public API orchestrator
├── noise.ts          # Seeded 2D simplex noise (from scratch)
├── prng.ts           # Mulberry32 PRNG (copied from engine)
├── water.ts          # Water placement + shoreline smoothing
├── terrain.ts        # Sand biomes + vegetation placement
└── presets.ts        # Plains & island preset configs
```

## Presets

- **Plains**: Low water level, scattered ponds/lakes, moderate trees, some sand patches. Lots of buildable land.
- **Island**: Radial gradient mask on noise — edges are ocean, center is a landmass. Dense forest possible, minimal sand.

## Noise Implementation

Simplex noise written from scratch in TypeScript. Seeded via Mulberry32 PRNG (same algorithm as engine, copied to avoid cross-package dependency). Layered octaves for natural terrain:

```
value = noise(x, y, frequency) * amplitude
      + noise(x, y, frequency*2) * amplitude/2
      + noise(x, y, frequency*4) * amplitude/4
```

## Constraints

- Pure TypeScript, zero platform dependencies
- Deterministic: same seed + config = identical map
- Performance: 256x256 in under 500ms
- Square maps only, powers of 2 (32-512)

## Testing Strategy

- **Determinism**: two calls with same seed produce byte-identical terrain arrays
- **Preset shapes**: island preset has water on all edges, plains does not
- **Terrain distribution**: water/grass/sand/trees ratios are reasonable for each preset
- **Performance**: 256x256 generates within time budget
- **Edge cases**: minimum size (32), maximum size (512), extreme water levels (0.0, 1.0)
