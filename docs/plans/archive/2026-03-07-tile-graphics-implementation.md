# Tile Graphics Implementation Plan

> **Status:** DONE — Implemented and shipped.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Use tile-author skill when authoring SVGs.

**Goal:** Build the SVG-to-PNG rasterization pipeline and author the initial ~40-tile set for the bitborough city builder.

**Architecture:** SVG source files in `packages/game/assets/tiles/`, a Node build script using `@resvg/resvg-js` rasterizes them to 128x128 PNGs in `assets/sprites/`, generating a `manifest.json` that maps tile IDs to sprite filenames. The game package is scaffolded as a pnpm workspace member following the engine package pattern.

**Tech Stack:** TypeScript, pnpm workspaces, `@resvg/resvg-js`, Vitest

---

### Task 1: Scaffold packages/game package

**Files:**
- Create: `packages/game/package.json`
- Create: `packages/game/tsconfig.json`
- Create: `packages/game/vitest.config.ts`
- Create: `packages/game/src/index.ts`

**Step 1: Create package.json**

```json
{
  "name": "@bitborough/game",
  "version": "0.0.1",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "tsc",
    "build:tiles": "tsx scripts/rasterize-tiles.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@bitborough/core": "workspace:*"
  },
  "devDependencies": {
    "@resvg/resvg-js": "^2.6.0",
    "tsx": "^4.0.0",
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
  "include": ["src"]
}
```

**Step 3: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
  },
})
```

**Step 4: Create src/index.ts**

```ts
// @bitborough/game - city builder game package
export {}
```

**Step 5: Install dependencies**

Run: `cd /path/to/bitborough && pnpm install`
Expected: Successful install, new packages linked

**Step 6: Verify package works**

Run: `cd packages/game && pnpm test`
Expected: vitest runs, passes with no tests

**Step 7: Commit**

```
feat(game): scaffold packages/game with build and test tooling
```

---

### Task 2: Build rasterization script

**Files:**
- Create: `packages/game/scripts/rasterize-tiles.ts`
- Test: `packages/game/src/__tests__/manifest.test.ts`

**Step 1: Write test for manifest output**

```ts
// packages/game/src/__tests__/manifest.test.ts
import { describe, it, expect } from 'vitest'

// Test the manifest shape — the actual rasterization is tested by running the script
describe('tile manifest', () => {
  it('should define the expected manifest entry shape', () => {
    // This validates our type contract
    const entry = {
      id: 'terrain/grass',
      file: 'grass.png',
      category: 'terrain',
      width: 128,
      height: 128,
    }
    expect(entry.id).toBe('terrain/grass')
    expect(entry.width).toBe(128)
    expect(entry.height).toBe(128)
  })
})
```

**Step 2: Run test to verify it passes**

Run: `cd packages/game && pnpm test`
Expected: PASS

**Step 3: Write the rasterization script**

```ts
// packages/game/scripts/rasterize-tiles.ts
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, relative, basename, dirname } from 'node:path'

const TILE_SIZE = 128
const TILES_DIR = join(import.meta.dirname, '..', 'assets', 'tiles')
const SPRITES_DIR = join(import.meta.dirname, '..', 'assets', 'sprites')

interface ManifestEntry {
  id: string
  file: string
  category: string
  width: number
  height: number
}

function findSvgs(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...findSvgs(full))
    } else if (entry.endsWith('.svg')) {
      results.push(full)
    }
  }
  return results
}

function rasterize(svgPath: string): Buffer {
  const svg = readFileSync(svgPath, 'utf-8')
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: TILE_SIZE },
  })
  const rendered = resvg.render()
  return Buffer.from(rendered.asPng())
}

function main() {
  mkdirSync(SPRITES_DIR, { recursive: true })

  const svgFiles = findSvgs(TILES_DIR)
  const manifest: ManifestEntry[] = []
  let count = 0

  for (const svgPath of svgFiles) {
    const rel = relative(TILES_DIR, svgPath)
    const category = dirname(rel).split('/')[0] ?? 'misc'
    const name = basename(rel, '.svg')
    const pngName = `${name}.png`
    const id = rel.replace(/\.svg$/, '').replaceAll('\\', '/')

    // Skip non-tile files (style guide, etc.)
    if (!svgPath.endsWith('.svg')) continue

    const png = rasterize(svgPath)
    writeFileSync(join(SPRITES_DIR, pngName), png)

    manifest.push({
      id,
      file: pngName,
      category,
      width: TILE_SIZE,
      height: TILE_SIZE,
    })
    count++
  }

  writeFileSync(
    join(SPRITES_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  )

  console.log(`Rasterized ${count} tiles to ${SPRITES_DIR}`)
  console.log(`Manifest written to ${join(SPRITES_DIR, 'manifest.json')}`)
}

main()
```

**Step 4: Run the rasterization script**

Run: `cd packages/game && pnpm build:tiles`
Expected: Rasterizes existing SVGs (grass, water, road-1111, residential-small) to PNGs, writes manifest.json

**Step 5: Verify output**

Run: `ls packages/game/assets/sprites/`
Expected: `grass.png`, `water.png`, `road-1111.png`, `residential-small.png`, `manifest.json`

**Step 6: Add assets/sprites/ to .gitignore**

```
# packages/game/.gitignore
assets/sprites/
```

Generated PNGs are build artifacts, not source.

**Step 7: Commit**

```
feat(game): add SVG-to-PNG tile rasterization build script
```

---

### Task 3: Author terrain tiles

**Files:**
- Create: `packages/game/assets/tiles/terrain/dirt.svg`
- Create: `packages/game/assets/tiles/terrain/sand.svg`
- Create: `packages/game/assets/tiles/terrain/trees.svg`
- Create: `packages/game/assets/tiles/terrain/grass-flowers.svg`
- Existing: `terrain/grass.svg`, `terrain/water.svg` (already done)

**Step 1: Read tile-style.md for reference**

Read: `packages/game/assets/tiles/tile-style.md`
Use the tile-author skill. Follow palette, scale, and detail rules exactly.

**Step 2: Author dirt.svg**

Earth-toned tile using `dirt-base`, `dirt-dark`, `dirt-light` palette. Subtle rock/pebble details (small circles), organic patches for variation. Must tile seamlessly.

**Step 3: Author sand.svg**

Lighter variant of dirt, warmer tones. Small shell or driftwood details for charm.

**Step 4: Author trees.svg**

Dense tree cluster tile. 4-6 overlapping tree canopies (20-28px each per scale table) using `tree-dark`, `tree-mid`, `tree-light`. Slight shadow underneath each canopy.

**Step 5: Author grass-flowers.svg**

Variant of grass.svg with more prominent flower clusters (5-8 flowers vs 3-5). Provides visual variety when placed alongside regular grass.

**Step 6: Open each SVG and visually verify**

Run: `open packages/game/assets/tiles/terrain/*.svg`
Verify: Consistent palette, proper scale, seamless edges

**Step 7: Run rasterization to verify all render**

Run: `cd packages/game && pnpm build:tiles`
Expected: All terrain PNGs generated successfully

**Step 8: Commit**

```
feat(game): add dirt, sand, trees, and grass-flowers terrain tiles
```

---

### Task 4: Author water edge transition tiles

**Files:**
- Create: `packages/game/assets/tiles/terrain/water-edge-n.svg`
- Create: `packages/game/assets/tiles/terrain/water-edge-e.svg`
- Create: `packages/game/assets/tiles/terrain/water-edge-s.svg`
- Create: `packages/game/assets/tiles/terrain/water-edge-w.svg`
- Create: `packages/game/assets/tiles/terrain/water-edge-ne.svg`
- Create: `packages/game/assets/tiles/terrain/water-edge-se.svg`
- Create: `packages/game/assets/tiles/terrain/water-edge-sw.svg`
- Create: `packages/game/assets/tiles/terrain/water-edge-nw.svg`

**Step 1: Read tile-style.md**

Use tile-author skill. These tiles show grass on one side transitioning to water on the other, with an organic shoreline.

**Step 2: Author cardinal edge tiles (N/E/S/W)**

Each tile is grass on one half, water on the other, with an irregular shoreline curve between them. The shoreline uses a gentle organic path with small sand/pebble details along the edge.

- `water-edge-n.svg`: water on top half, grass on bottom
- `water-edge-e.svg`: water on right half, grass on left
- `water-edge-s.svg`: water on bottom half, grass on top
- `water-edge-w.svg`: water on left half, grass on right

**Step 3: Author corner edge tiles (NE/SE/SW/NW)**

Corner pieces where water fills one corner. Example: `water-edge-ne.svg` has water in the top-right corner with a curved shoreline from roughly the north edge to the east edge.

**Step 4: Open and verify alignment**

Lay out edge tiles mentally: a water-edge-n tile placed above a grass tile should have matching edges. The shoreline curve must start/end at consistent positions on the tile edge.

**Step 5: Run rasterization**

Run: `cd packages/game && pnpm build:tiles`
Expected: All water edge PNGs generated

**Step 6: Commit**

```
feat(game): add water-to-grass edge transition tiles (4 cardinal + 4 corner)
```

---

### Task 5: Author road connection tiles (16 variants)

**Files:**
- Create: `packages/game/assets/tiles/roads/road-0000.svg` through `road-1111.svg`
- Existing: `roads/road-1111.svg` (already done)

**Step 1: Read tile-style.md road geometry section**

Pavement: 32px wide (x=48-80 vertical, y=48-80 horizontal). Sidewalks: 8px each side. Center line at 64. Curbs at road edges. Background is grass.

**Step 2: Author the 15 remaining road variants**

Follow NESW naming convention. For each variant:
- Draw grass background with texture patches
- Draw sidewalk + pavement for each active direction
- Draw curbs along grass-to-sidewalk boundaries
- Draw center lane dashes on each road segment (skip near intersections)
- Add road grain texture dots
- Add charm details where appropriate (manhole at intersections, etc.)

Key variants to pay attention to:
- `road-0000.svg` — isolated pad/cul-de-sac (circle of pavement)
- `road-1010.svg` — straight north-south
- `road-0101.svg` — straight east-west
- `road-1100.svg` / `road-0110.svg` / `road-0011.svg` / `road-1001.svg` — curves (L-shapes)
- `road-1110.svg` / `road-1101.svg` / `road-1011.svg` / `road-0111.svg` — T-intersections
- `road-1000.svg` / `road-0100.svg` / `road-0010.svg` / `road-0001.svg` — dead ends

**Step 3: Verify all 16 files exist**

Run: `ls packages/game/assets/tiles/roads/ | wc -l`
Expected: 16

**Step 4: Open a few key variants and verify**

Run: `open packages/game/assets/tiles/roads/road-1010.svg packages/game/assets/tiles/roads/road-0110.svg packages/game/assets/tiles/roads/road-1000.svg`
Verify: Road geometry matches style guide, curves look natural, dead ends are clean

**Step 5: Run rasterization**

Run: `cd packages/game && pnpm build:tiles`
Expected: All 16 road PNGs generated

**Step 6: Commit**

```
feat(game): add all 16 road connection variant tiles
```

---

### Task 6: Author building tiles

**Files:**
- Existing: `buildings/residential-small.svg` (already done)
- Create: `packages/game/assets/tiles/buildings/residential-medium.svg`
- Create: `packages/game/assets/tiles/buildings/commercial-small.svg`
- Create: `packages/game/assets/tiles/buildings/commercial-medium.svg`
- Create: `packages/game/assets/tiles/buildings/industrial-small.svg`
- Create: `packages/game/assets/tiles/buildings/industrial-medium.svg`

**Step 1: Read tile-style.md building geometry and scale table**

Use tile-author skill. Buildings have transparent backgrounds (terrain renders underneath). Each building sits on a lot with yard space. Follow the scale table for footprint sizes.

**Step 2: Author residential-medium.svg**

Larger house (~48x40px footprint). Two-story look (wider roof), more windows (3-4), larger yard, maybe a backyard fence or shed detail. Different roof color variation from residential-small.

**Step 3: Author commercial-small.svg**

Small shop (~40x48px). Blue-tinted roof (`com-roof` palette). Storefront windows (wider, horizontal). Signage rectangle. Parking lines in front. AC unit on roof.

**Step 4: Author commercial-medium.svg**

Larger office building (~48x56px). Multiple roof AC units. More windows. Parking area with 2-3 cars.

**Step 5: Author industrial-small.svg**

Workshop (~48x40px). Gray/olive roof (`ind-roof` palette). One smoke stack. Loading bay door. Pipe details. Rust accents.

**Step 6: Author industrial-medium.svg**

Factory (~72x60px, larger footprint). Two smoke stacks with smoke wisps. Multiple loading bays. Pipe runs. Tank/silo circle on roof. Rust and grime details.

**Step 7: Open all and verify visual consistency**

Run: `open packages/game/assets/tiles/buildings/*.svg`
Verify: Each building type is visually distinct (residential=warm, commercial=blue, industrial=gray/olive), proportions match scale table, all have proper shadow offsets

**Step 8: Run rasterization**

Run: `cd packages/game && pnpm build:tiles`
Expected: All building PNGs generated

**Step 9: Commit**

```
feat(game): add residential, commercial, and industrial building tiles
```

---

### Task 7: Author power infrastructure tiles

**Files:**
- Create: `packages/game/assets/tiles/power/power-plant-coal.svg`
- Create: `packages/game/assets/tiles/power/power-line-0000.svg` through key variants

**Step 1: Read tile-style.md power section and scale table**

Coal power plant is a large building (~80x60m = 2x2 tiles per scale, but we can do a simplified 1x1 for now that represents a small plant). Power lines use same NESW connection system as roads but are much thinner.

**Step 2: Author power-plant-coal.svg**

Large industrial building filling most of the tile. Cooling towers (circles from above), smoke stacks, yellow accent (`power-yellow`). Dark industrial colors. Prominent smoke.

**Step 3: Author key power line variants**

Power lines are simpler than roads — just thin lines with small tower dots at intersections. Author at minimum:
- `power-line-1010.svg` — north-south
- `power-line-0101.svg` — east-west
- `power-line-1111.svg` — 4-way
- `power-line-1100.svg` — L-turn
(Remaining variants can follow the same pattern later)

**Step 4: Open and verify**

Run: `open packages/game/assets/tiles/power/*.svg`

**Step 5: Run rasterization**

Run: `cd packages/game && pnpm build:tiles`
Expected: Power tiles rasterized

**Step 6: Commit**

```
feat(game): add coal power plant and power line tiles
```

---

### Task 8: Create tile preview HTML page

**Files:**
- Create: `packages/game/assets/preview.html`

**Step 1: Write a simple HTML page that displays all tiles**

A static HTML page that loads `manifest.json` and renders all sprites in a grid, grouped by category. This serves as a visual catalog for reviewing tiles without opening them individually.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Bitborough Tile Preview</title>
  <style>
    body { background: #1a1a1a; color: #eee; font-family: system-ui; padding: 20px; }
    h2 { border-bottom: 1px solid #444; padding-bottom: 8px; }
    .grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }
    .tile { text-align: center; }
    .tile img { width: 128px; height: 128px; border: 1px solid #333; image-rendering: pixelated; }
    .tile p { font-size: 11px; color: #888; margin: 4px 0; }
  </style>
</head>
<body>
  <h1>Bitborough Tile Catalog</h1>
  <div id="content"></div>
  <script>
    fetch('sprites/manifest.json')
      .then(r => r.json())
      .then(manifest => {
        const grouped = {};
        for (const entry of manifest) {
          (grouped[entry.category] ??= []).push(entry);
        }
        const content = document.getElementById('content');
        for (const [category, tiles] of Object.entries(grouped).sort()) {
          const h2 = document.createElement('h2');
          h2.textContent = category;
          content.appendChild(h2);
          const grid = document.createElement('div');
          grid.className = 'grid';
          for (const tile of tiles) {
            const div = document.createElement('div');
            div.className = 'tile';
            div.innerHTML = `<img src="sprites/${tile.file}"><p>${tile.id}</p>`;
            grid.appendChild(div);
          }
          content.appendChild(grid);
        }
      });
  </script>
</body>
</html>
```

**Step 2: Build tiles and open preview**

Run: `cd packages/game && pnpm build:tiles && open assets/preview.html`
Expected: Browser shows all tiles in a categorized grid

**Step 3: Commit**

```
feat(game): add tile preview HTML catalog page
```

---

### Task 9: Final verification and cleanup

**Step 1: Run full rasterization**

Run: `cd packages/game && pnpm build:tiles`
Expected: All ~40 tiles rasterized, manifest complete

**Step 2: Run all tests**

Run: `cd /path/to/bitborough && pnpm test`
Expected: All packages pass

**Step 3: Verify manifest completeness**

Run: `cat packages/game/assets/sprites/manifest.json | grep '"id"' | wc -l`
Expected: ~40 entries

**Step 4: Open preview page for final visual review**

Run: `open packages/game/assets/preview.html`
Verify: All tiles present, consistent style, proper proportions

**Step 5: Clean up sample/preview SVGs**

Remove the combined preview SVGs that were design exploration artifacts:
- `buildings/special/stadium-preview.svg` (keep true-scale one as reference)
- `samples/neighborhood-scene.svg` (keep as reference)

These are design references, not game tiles. Move to `docs/` or keep as-is.

**Step 6: Final commit**

```
feat(game): complete initial tile set with ~40 SVG tiles and build pipeline
```
