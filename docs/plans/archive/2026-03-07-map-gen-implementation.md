# Map Generation Implementation Plan

> **Status:** DONE — Implemented and shipped.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement `@bitborough/map-gen` — a pure function that procedurally generates terrain maps for the city builder.

**Architecture:** Pipeline of pure functions: PRNG → simplex noise → water placement → shoreline smoothing → sand biomes → vegetation. Single entry point `generateMap(config): GameMap`. Deterministic via seeded Mulberry32 PRNG. Depends only on `@bitborough/core`.

**Tech Stack:** TypeScript, Vitest, pnpm workspaces (existing monorepo)

**Design Doc:** `docs/plans/2026-03-07-map-gen-design.md`

---

## Task 1: Package scaffolding

**Files:**
- Create: `packages/map-gen/package.json`
- Create: `packages/map-gen/tsconfig.json`
- Create: `packages/map-gen/vitest.config.ts`
- Create: `packages/map-gen/src/index.ts`

**Step 1: Create package.json**

```json
{
  "name": "@bitborough/map-gen",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@bitborough/core": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "references": [{ "path": "../core" }]
}
```

**Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
  },
})
```

**Step 4: Create src/index.ts**

```typescript
// @bitborough/map-gen — procedural terrain generation
export {}
```

**Step 5: Install and verify**

Run: `pnpm install`
Run: `pnpm -r typecheck`
Expected: both pass

**Step 6: Commit**

```
feat: scaffold map-gen package
```

---

## Task 2: PRNG and simplex noise

**Files:**
- Create: `packages/map-gen/src/prng.ts`
- Create: `packages/map-gen/src/noise.ts`
- Create: `packages/map-gen/src/__tests__/noise.test.ts`

**Step 1: Write failing tests**

```typescript
// packages/map-gen/src/__tests__/noise.test.ts
import { describe, test, expect } from 'vitest'
import { PRNG } from '../prng.js'
import { createNoise2D } from '../noise.js'

describe('PRNG', () => {
  test('same seed produces same sequence', () => {
    const a = new PRNG(42)
    const b = new PRNG(42)
    for (let i = 0; i < 100; i++) {
      expect(a.next()).toBe(b.next())
    }
  })

  test('different seeds produce different sequences', () => {
    const a = new PRNG(42)
    const b = new PRNG(99)
    let same = 0
    for (let i = 0; i < 100; i++) {
      if (a.next() === b.next()) same++
    }
    expect(same).toBeLessThan(5)
  })

  test('values are in [0, 1)', () => {
    const prng = new PRNG(42)
    for (let i = 0; i < 1000; i++) {
      const v = prng.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('Simplex noise', () => {
  test('same inputs produce same output', () => {
    const noise = createNoise2D(new PRNG(42))
    const a = noise(1.5, 2.3)
    const noise2 = createNoise2D(new PRNG(42))
    const b = noise2(1.5, 2.3)
    expect(a).toBe(b)
  })

  test('output is in [-1, 1]', () => {
    const noise = createNoise2D(new PRNG(42))
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        const v = noise(x * 0.1, y * 0.1)
        expect(v).toBeGreaterThanOrEqual(-1)
        expect(v).toBeLessThanOrEqual(1)
      }
    }
  })

  test('values vary across space', () => {
    const noise = createNoise2D(new PRNG(42))
    const values = new Set<number>()
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        values.add(Math.round(noise(x * 0.5, y * 0.5) * 100))
      }
    }
    expect(values.size).toBeGreaterThan(10)
  })

  test('noise is smooth (nearby inputs produce nearby outputs)', () => {
    const noise = createNoise2D(new PRNG(42))
    const a = noise(1.0, 1.0)
    const b = noise(1.01, 1.0)
    expect(Math.abs(a - b)).toBeLessThan(0.1)
  })
})
```

**Step 2: Run tests, verify failure**

Run: `cd packages/map-gen && pnpm test`
Expected: FAIL — modules don't exist

**Step 3: Implement PRNG**

Copy the Mulberry32 PRNG from the engine package. Identical implementation:

```typescript
// packages/map-gen/src/prng.ts
export class PRNG {
  private state: number

  constructor(seed: number) {
    this.state = seed | 0
  }

  next(): number {
    this.state |= 0
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1))
  }
}
```

**Step 4: Implement simplex noise**

```typescript
// packages/map-gen/src/noise.ts
import { PRNG } from './prng.js'

// 2D simplex noise, seeded via PRNG-shuffled permutation table
// Returns a function (x, y) => [-1, 1]

const GRAD2: [number, number][] = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [-1, 1], [1, -1], [-1, -1],
]

const F2 = 0.5 * (Math.sqrt(3) - 1)
const G2 = (3 - Math.sqrt(3)) / 6

export function createNoise2D(prng: PRNG): (x: number, y: number) => number {
  // Build shuffled permutation table
  const perm = new Uint8Array(256)
  for (let i = 0; i < 256; i++) perm[i] = i
  // Fisher-Yates shuffle
  for (let i = 255; i > 0; i--) {
    const j = prng.nextInt(0, i)
    const tmp = perm[i]!
    perm[i] = perm[j]!
    perm[j] = tmp
  }

  function hash(i: number): number {
    return perm[i & 255]!
  }

  return function noise2D(x: number, y: number): number {
    const s = (x + y) * F2
    const i = Math.floor(x + s)
    const j = Math.floor(y + s)

    const t = (i + j) * G2
    const X0 = i - t
    const Y0 = j - t
    const x0 = x - X0
    const y0 = y - Y0

    const i1 = x0 > y0 ? 1 : 0
    const j1 = x0 > y0 ? 0 : 1

    const x1 = x0 - i1 + G2
    const y1 = y0 - j1 + G2
    const x2 = x0 - 1.0 + 2.0 * G2
    const y2 = y0 - 1.0 + 2.0 * G2

    const gi0 = hash(i + hash(j)) % 8
    const gi1 = hash(i + i1 + hash(j + j1)) % 8
    const gi2 = hash(i + 1 + hash(j + 1)) % 8

    let n0 = 0, n1 = 0, n2 = 0

    let t0 = 0.5 - x0 * x0 - y0 * y0
    if (t0 >= 0) {
      t0 *= t0
      const g = GRAD2[gi0]!
      n0 = t0 * t0 * (g[0] * x0 + g[1] * y0)
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1
    if (t1 >= 0) {
      t1 *= t1
      const g = GRAD2[gi1]!
      n1 = t1 * t1 * (g[0] * x1 + g[1] * y1)
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2
    if (t2 >= 0) {
      t2 *= t2
      const g = GRAD2[gi2]!
      n2 = t2 * t2 * (g[0] * x2 + g[1] * y2)
    }

    // Scale to [-1, 1]
    return 70.0 * (n0 + n1 + n2)
  }
}

// Layered noise with octaves for natural terrain
export function layeredNoise(
  noise: (x: number, y: number) => number,
  x: number,
  y: number,
  octaves: number,
  frequency: number,
  persistence: number,
): number {
  let value = 0
  let amplitude = 1
  let maxAmplitude = 0
  let freq = frequency

  for (let i = 0; i < octaves; i++) {
    value += noise(x * freq, y * freq) * amplitude
    maxAmplitude += amplitude
    amplitude *= persistence
    freq *= 2
  }

  return value / maxAmplitude // normalize to [-1, 1]
}
```

**Step 5: Run tests, verify pass**

Run: `cd packages/map-gen && pnpm test`
Expected: ALL PASS

**Step 6: Commit**

```
feat(map-gen): add seeded PRNG and 2D simplex noise
```

---

## Task 3: Presets and water placement

**Files:**
- Create: `packages/map-gen/src/presets.ts`
- Create: `packages/map-gen/src/water.ts`
- Create: `packages/map-gen/src/__tests__/water.test.ts`

**Step 1: Write failing tests**

```typescript
// packages/map-gen/src/__tests__/water.test.ts
import { describe, test, expect } from 'vitest'
import { PRNG } from '../prng.js'
import { createNoise2D } from '../noise.js'
import { placeWater, smoothShoreline } from '../water.js'
import { TileType } from '@bitborough/core'

describe('Water placement', () => {
  test('water level 0 produces no water', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(64 * 64)
    placeWater(terrain, 64, 64, noise, 0, null)
    const waterCount = Array.from(terrain).filter(t => t === TileType.Water).length
    expect(waterCount).toBe(0)
  })

  test('water level 1 produces all water', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(64 * 64)
    placeWater(terrain, 64, 64, noise, 1.0, null)
    const waterCount = Array.from(terrain).filter(t => t === TileType.Water).length
    expect(waterCount).toBe(64 * 64)
  })

  test('island preset has water on all edges', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(64 * 64)
    placeWater(terrain, 64, 64, noise, 0.3, 'island')
    // Check corners and edges are water
    expect(terrain[0]).toBe(TileType.Water) // top-left
    expect(terrain[63]).toBe(TileType.Water) // top-right
    expect(terrain[63 * 64]).toBe(TileType.Water) // bottom-left
    expect(terrain[63 * 64 + 63]).toBe(TileType.Water) // bottom-right
  })

  test('plains preset does not force edge water', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(64 * 64)
    placeWater(terrain, 64, 64, noise, 0.1, 'plains')
    // With low water level, most of the map should be land
    const grassCount = Array.from(terrain).filter(t => t === TileType.Grass).length
    expect(grassCount).toBeGreaterThan(64 * 64 * 0.5)
  })
})

describe('Shoreline smoothing', () => {
  test('smoothing removes isolated water tiles', () => {
    const terrain = new Uint8Array(10 * 10) // all grass
    // Place single isolated water tile
    terrain[5 * 10 + 5] = TileType.Water
    smoothShoreline(terrain, 10, 10, 2)
    // Isolated tile should be converted to land
    expect(terrain[5 * 10 + 5]).toBe(TileType.Grass)
  })

  test('smoothing preserves large water bodies', () => {
    const terrain = new Uint8Array(10 * 10)
    // Place 3x3 water block
    for (let y = 3; y <= 5; y++) {
      for (let x = 3; x <= 5; x++) {
        terrain[y * 10 + x] = TileType.Water
      }
    }
    smoothShoreline(terrain, 10, 10, 2)
    // Center should still be water
    expect(terrain[4 * 10 + 4]).toBe(TileType.Water)
  })
})
```

**Step 2: Run tests, verify failure**

**Step 3: Implement presets**

```typescript
// packages/map-gen/src/presets.ts
export interface PresetConfig {
  waterLevel: number
  forestDensity: number
  smoothing: number
  noiseFrequency: number
  noiseOctaves: number
  islandMask: boolean
  sandFrequency: number
  sandThreshold: number
}

export const PRESETS: Record<string, PresetConfig> = {
  plains: {
    waterLevel: 0.3,
    forestDensity: 0.4,
    smoothing: 2,
    noiseFrequency: 0.03,
    noiseOctaves: 4,
    islandMask: false,
    sandFrequency: 0.05,
    sandThreshold: 0.6,
  },
  island: {
    waterLevel: 0.3,
    forestDensity: 0.5,
    smoothing: 3,
    noiseFrequency: 0.03,
    noiseOctaves: 4,
    islandMask: true,
    sandFrequency: 0.04,
    sandThreshold: 0.65,
  },
}
```

**Step 4: Implement water placement**

```typescript
// packages/map-gen/src/water.ts
import { TileType } from '@bitborough/core'
import { layeredNoise } from './noise.js'

export function placeWater(
  terrain: Uint8Array,
  width: number,
  height: number,
  noise: (x: number, y: number) => number,
  waterLevel: number,
  preset: string | null,
): void {
  const freq = 0.03
  const octaves = 4

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = layeredNoise(noise, x, y, octaves, freq, 0.5)
      // Normalize from [-1,1] to [0,1]
      value = (value + 1) / 2

      // Island mask: radial gradient that pushes edges below water
      if (preset === 'island') {
        const cx = width / 2
        const cy = height / 2
        const maxDist = Math.min(cx, cy)
        const dx = (x - cx) / maxDist
        const dy = (y - cy) / maxDist
        const dist = Math.sqrt(dx * dx + dy * dy)
        // Smooth falloff: land in center, water at edges
        const mask = 1 - Math.pow(dist, 2)
        value *= Math.max(0, mask)
      }

      if (value < waterLevel) {
        terrain[y * width + x] = TileType.Water
      }
    }
  }
}

export function smoothShoreline(
  terrain: Uint8Array,
  width: number,
  height: number,
  iterations: number,
): void {
  for (let iter = 0; iter < iterations; iter++) {
    const copy = new Uint8Array(terrain)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        // Count water neighbors (4-directional)
        let waterCount = 0
        if (copy[(y - 1) * width + x] === TileType.Water) waterCount++
        if (copy[(y + 1) * width + x] === TileType.Water) waterCount++
        if (copy[y * width + (x - 1)] === TileType.Water) waterCount++
        if (copy[y * width + (x + 1)] === TileType.Water) waterCount++

        // If majority of neighbors disagree, flip
        if (copy[idx] === TileType.Water && waterCount <= 1) {
          terrain[idx] = TileType.Grass
        } else if (copy[idx] !== TileType.Water && waterCount >= 3) {
          terrain[idx] = TileType.Water
        }
      }
    }
  }
}
```

**Step 5: Run tests, verify pass**

Run: `cd packages/map-gen && pnpm test`
Expected: ALL PASS

**Step 6: Commit**

```
feat(map-gen): add presets, water placement, and shoreline smoothing
```

---

## Task 4: Sand biomes and vegetation

**Files:**
- Create: `packages/map-gen/src/terrain.ts`
- Create: `packages/map-gen/src/__tests__/terrain.test.ts`

**Step 1: Write failing tests**

```typescript
// packages/map-gen/src/__tests__/terrain.test.ts
import { describe, test, expect } from 'vitest'
import { PRNG } from '../prng.js'
import { createNoise2D } from '../noise.js'
import { placeSand, placeVegetation } from '../terrain.js'
import { TileType } from '@bitborough/core'

describe('Sand placement', () => {
  test('sand appears on grass tiles only', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(32 * 32) // all grass
    // Set some tiles to water
    for (let i = 0; i < 100; i++) terrain[i] = TileType.Water
    placeSand(terrain, 32, 32, noise, 0.05, 0.5)
    // Sand should not appear on water tiles
    for (let i = 0; i < 100; i++) {
      expect(terrain[i]).not.toBe(TileType.Sand)
    }
  })

  test('sand density varies with threshold', () => {
    const terrain1 = new Uint8Array(64 * 64) // all grass
    const terrain2 = new Uint8Array(64 * 64) // all grass
    const prng1 = new PRNG(42)
    const prng2 = new PRNG(42)
    placeSand(terrain1, 64, 64, createNoise2D(prng1), 0.05, 0.3) // low threshold = more sand
    placeSand(terrain2, 64, 64, createNoise2D(prng2), 0.05, 0.8) // high threshold = less sand
    const sand1 = Array.from(terrain1).filter(t => t === TileType.Sand).length
    const sand2 = Array.from(terrain2).filter(t => t === TileType.Sand).length
    expect(sand1).toBeGreaterThan(sand2)
  })
})

describe('Vegetation', () => {
  test('trees appear on grass only', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(32 * 32) // all grass
    terrain[0] = TileType.Water
    terrain[1] = TileType.Sand
    placeVegetation(terrain, 32, 32, noise, 0.4)
    expect(terrain[0]).toBe(TileType.Water)
    expect(terrain[1]).toBe(TileType.Sand)
  })

  test('forest density 0 produces no trees', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(32 * 32)
    placeVegetation(terrain, 32, 32, noise, 0)
    const treeCount = Array.from(terrain).filter(t => t === TileType.Trees).length
    expect(treeCount).toBe(0)
  })

  test('forest density 1 produces many trees', () => {
    const prng = new PRNG(42)
    const noise = createNoise2D(prng)
    const terrain = new Uint8Array(64 * 64)
    placeVegetation(terrain, 64, 64, noise, 1.0)
    const treeCount = Array.from(terrain).filter(t => t === TileType.Trees).length
    expect(treeCount).toBeGreaterThan(64 * 64 * 0.5)
  })
})
```

**Step 2: Run tests, verify failure**

**Step 3: Implement terrain features**

```typescript
// packages/map-gen/src/terrain.ts
import { TileType } from '@bitborough/core'
import { layeredNoise } from './noise.js'

export function placeSand(
  terrain: Uint8Array,
  width: number,
  height: number,
  noise: (x: number, y: number) => number,
  frequency: number,
  threshold: number,
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (terrain[idx] !== TileType.Grass) continue

      let value = layeredNoise(noise, x, y, 3, frequency, 0.5)
      value = (value + 1) / 2 // normalize to [0, 1]

      if (value > threshold) {
        terrain[idx] = TileType.Sand
      }
    }
  }
}

export function placeVegetation(
  terrain: Uint8Array,
  width: number,
  height: number,
  noise: (x: number, y: number) => number,
  forestDensity: number,
): void {
  if (forestDensity <= 0) return

  // Threshold derived from density: higher density = lower threshold = more trees
  const threshold = 1 - forestDensity

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (terrain[idx] !== TileType.Grass) continue

      let value = layeredNoise(noise, x, y, 3, 0.06, 0.5)
      value = (value + 1) / 2

      if (value > threshold) {
        terrain[idx] = TileType.Trees
      }
    }
  }
}
```

**Step 4: Run tests, verify pass**

Run: `cd packages/map-gen && pnpm test`
Expected: ALL PASS

**Step 5: Commit**

```
feat(map-gen): add sand biomes and vegetation placement
```

---

## Task 5: Main generate function and integration tests

**Files:**
- Create: `packages/map-gen/src/generate.ts`
- Create: `packages/map-gen/src/__tests__/generate.test.ts`
- Modify: `packages/map-gen/src/index.ts`

**Step 1: Write failing tests**

```typescript
// packages/map-gen/src/__tests__/generate.test.ts
import { describe, test, expect } from 'vitest'
import { generateMap } from '../generate.js'
import { TileType } from '@bitborough/core'

describe('generateMap', () => {
  test('returns a valid GameMap', () => {
    const map = generateMap({ size: 64, seed: 42, preset: 'plains' })
    expect(map.width).toBe(64)
    expect(map.height).toBe(64)
    expect(map.terrain.length).toBe(64 * 64)
    expect(map.meta.seed).toBe(42)
    expect(map.meta.preset).toBe('plains')
  })

  test('deterministic: same seed produces identical maps', () => {
    const a = generateMap({ size: 64, seed: 42, preset: 'plains' })
    const b = generateMap({ size: 64, seed: 42, preset: 'plains' })
    expect(Array.from(a.terrain)).toEqual(Array.from(b.terrain))
  })

  test('different seeds produce different maps', () => {
    const a = generateMap({ size: 64, seed: 42, preset: 'plains' })
    const b = generateMap({ size: 64, seed: 99, preset: 'plains' })
    expect(Array.from(a.terrain)).not.toEqual(Array.from(b.terrain))
  })

  test('plains has mixed terrain', () => {
    const map = generateMap({ size: 128, seed: 42, preset: 'plains' })
    const counts = countTerrain(map.terrain)
    expect(counts.grass).toBeGreaterThan(0)
    expect(counts.water).toBeGreaterThan(0)
    expect(counts.trees).toBeGreaterThan(0)
  })

  test('island has water on all edges', () => {
    const map = generateMap({ size: 64, seed: 42, preset: 'island' })
    // Top row
    for (let x = 0; x < 64; x++) {
      expect(map.terrain[x]).toBe(TileType.Water)
    }
    // Bottom row
    for (let x = 0; x < 64; x++) {
      expect(map.terrain[63 * 64 + x]).toBe(TileType.Water)
    }
  })

  test('waterLevel 0 produces minimal water', () => {
    const map = generateMap({ size: 64, seed: 42, preset: 'plains', waterLevel: 0 })
    const waterCount = Array.from(map.terrain).filter(t => t === TileType.Water).length
    expect(waterCount).toBe(0)
  })

  test('generates 32x32 map', () => {
    const map = generateMap({ size: 32, seed: 42, preset: 'plains' })
    expect(map.width).toBe(32)
    expect(map.terrain.length).toBe(32 * 32)
  })

  test('generates 256x256 within time budget', () => {
    const start = performance.now()
    generateMap({ size: 256, seed: 42, preset: 'island' })
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(500)
  })

  test('all terrain values are valid TileTypes', () => {
    const map = generateMap({ size: 64, seed: 42, preset: 'island' })
    const validTypes = [TileType.Grass, TileType.Water, TileType.Sand, TileType.Trees]
    for (let i = 0; i < map.terrain.length; i++) {
      expect(validTypes).toContain(map.terrain[i])
    }
  })

  test('buildings array is empty', () => {
    const map = generateMap({ size: 64, seed: 42, preset: 'plains' })
    expect(map.buildings).toEqual([])
  })

  test('zones and infrastructure are zeroed', () => {
    const map = generateMap({ size: 64, seed: 42, preset: 'plains' })
    const zoneSum = Array.from(map.zones).reduce((a, b) => a + b, 0)
    const infraSum = Array.from(map.infrastructure).reduce((a, b) => a + b, 0)
    expect(zoneSum).toBe(0)
    expect(infraSum).toBe(0)
  })
})

function countTerrain(terrain: Uint8Array) {
  let grass = 0, water = 0, sand = 0, trees = 0
  for (let i = 0; i < terrain.length; i++) {
    switch (terrain[i]) {
      case TileType.Grass: grass++; break
      case TileType.Water: water++; break
      case TileType.Sand: sand++; break
      case TileType.Trees: trees++; break
    }
  }
  return { grass, water, sand, trees }
}
```

**Step 2: Run tests, verify failure**

**Step 3: Implement generateMap**

```typescript
// packages/map-gen/src/generate.ts
import { type GameMap, type MapSize, createEmptyMap, TileType } from '@bitborough/core'
import { PRNG } from './prng.js'
import { createNoise2D } from './noise.js'
import { PRESETS, type PresetConfig } from './presets.js'
import { placeWater, smoothShoreline } from './water.js'
import { placeSand, placeVegetation } from './terrain.js'

export interface MapGenConfig {
  size: MapSize
  seed: number
  preset: 'plains' | 'island'
  waterLevel?: number
  forestDensity?: number
  smoothing?: number
}

export function generateMap(config: MapGenConfig): GameMap {
  const preset = PRESETS[config.preset]!
  const waterLevel = config.waterLevel ?? preset.waterLevel
  const forestDensity = config.forestDensity ?? preset.forestDensity
  const smoothing = config.smoothing ?? preset.smoothing
  const { size, seed } = config

  const map = createEmptyMap(size, size, {
    name: `${config.preset} map`,
    seed,
    preset: config.preset,
    createdAt: new Date().toISOString(),
  })

  // Each pipeline stage gets its own noise from the same PRNG sequence
  const prng = new PRNG(seed)
  const waterNoise = createNoise2D(new PRNG(prng.nextInt(0, 0x7fffffff)))
  const sandNoise = createNoise2D(new PRNG(prng.nextInt(0, 0x7fffffff)))
  const treeNoise = createNoise2D(new PRNG(prng.nextInt(0, 0x7fffffff)))

  // Pipeline
  placeWater(map.terrain, size, size, waterNoise, waterLevel, config.preset)
  smoothShoreline(map.terrain, size, size, smoothing)
  placeSand(map.terrain, size, size, sandNoise, preset.sandFrequency, preset.sandThreshold)
  placeVegetation(map.terrain, size, size, treeNoise, forestDensity)

  return map
}
```

**Step 4: Update index.ts**

```typescript
// packages/map-gen/src/index.ts
export { generateMap, type MapGenConfig } from './generate.js'
```

**Step 5: Run tests, verify pass**

Run: `cd packages/map-gen && pnpm test`
Expected: ALL PASS

**Step 6: Verify typecheck**

Run: `pnpm -r typecheck`
Expected: PASS

**Step 7: Commit**

```
feat(map-gen): add generateMap with plains and island presets
```

---

## Summary

| Task | What | Depends On |
|------|------|-----------|
| 1 | Package scaffolding | — |
| 2 | PRNG + simplex noise | 1 |
| 3 | Presets + water placement + smoothing | 2 |
| 4 | Sand biomes + vegetation | 2 |
| 5 | Main generateMap + integration tests | 3, 4 |

Tasks 3 and 4 can be parallelized (both depend on 2, neither depends on the other). Task 5 merges them.
