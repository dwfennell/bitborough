# Tile Graphics System Design

## Problem

AI-generated tiles (via budget image generation models) produce inconsistent results:
- Visual inconsistency across tiles (different styles, lighting, perspective)
- Seamless tiling failures (visible seams between adjacent tiles)
- Connection variants hard to generate (16 road permutations that all match)
- Overall "AI-generated" aesthetic that doesn't look polished

## Decision

Replace AI-generated tiles with hand-authored SVGs created by Claude, rasterized to PNGs at build time.

## Approach: Hand-Authored SVGs

Each tile is an individual SVG file following a strict style guide (`tile-style.md`) for visual consistency across authoring sessions.

### Visual Style

- **Aesthetic**: Charming top-down with pastel colors, organic shapes, subtle details
- **Perspective**: Pure top-down (bird's eye), no isometric or 3/4 view
- **Color palette**: Defined set of pastel hex values, no invented colors
- **Details**: Charm touches (chimneys with smoke, mailboxes, flower patches, parked cars)
- **Gradients**: Used sparingly — water, road asphalt, terrain base only

### World Scale

**1 tile = 128px = 32 meters.** All dimensions derive from this.

Key proportions:
- 2-lane road: 32px pavement + 8px sidewalks each side
- Small house: ~40x32px footprint with generous yard
- Tree canopy: 20-28px diameter
- Stadium (50k seats): 8x6 tiles at true scale

Buildings are realistically scaled relative to each other rather than compressed to fit uniform tile footprints. A stadium dominates a neighborhood; a house sits small in its lot.

### File Organization

```
packages/game/assets/tiles/
├── tile-style.md              # Style guide (authoritative reference)
├── terrain/                   # grass, water, dirt, sand, trees
├── roads/                     # road-NESW.svg (16 connection variants)
├── buildings/                 # residential, commercial, industrial
│   └── special/               # stadium, power plant, airport (multi-tile)
└── power/                     # power lines, plants
```

### Connection System

Road/rail/power tiles use 4-bit NESW naming: `road-1010.svg` = north-south straight, `road-1111.svg` = 4-way intersection. 16 files cover all permutations.

### Multi-Tile Buildings

Large buildings span multiple tiles at realistic scale:
- Named with position suffix: `stadium-0-0.svg` through `stadium-7-5.svg`
- Each tile is still 128x128 viewBox
- Edges align seamlessly between adjacent tiles

### Build Pipeline

1. Author SVGs in `assets/tiles/`
2. Rasterize to 128x128 PNGs using `resvg-js` (Rust-based, fast)
3. Output to `assets/sprites/` with `manifest.json`
4. Game renderer loads manifest + individual PNGs
5. Sprite sheet packing deferred to later optimization

### Consistency Enforcement

A `tile-style.md` style guide codifies:
- Complete color palette with named tokens
- World scale table with real-world size mappings
- Structural constants (road width, building margins, window sizes)
- Detail rules (opacity ranges, stroke widths, texture density)
- Shape vocabulary (how to draw bushes, grass blades, chimneys, etc.)
- Layer ordering and seamless tiling rules

A `tile-author` skill ensures Claude reads this guide before creating any tile in any session.

### Relationship to Game Manager

The existing game-manager AI generation pipeline remains available for experimentation. The hand-authored SVG system is the primary asset source for the game package. Both produce the same output format (PNGs + manifest), so they're interchangeable at the consumption layer.

## Initial Tile Set (~40 SVGs)

- 6 terrain + 8 water edges = 14
- 16 road connection variants
- 6 buildings (2 residential, 2 commercial, 2 industrial)
- 1 power plant + power line variants

## Samples Created

- `terrain/grass.svg` — layered pastel grass with blade clusters and flowers
- `terrain/water.svg` — water with ripples, caustics, sparkle highlights
- `roads/road-1111.svg` — 4-way intersection with sidewalks, lane markings, manhole
- `buildings/residential-small.svg` — house with yard, tree, chimney, parked car
- `buildings/special/stadium-preview.svg` — 4x4 compressed stadium (reference)
- `buildings/special/stadium-truescale-preview.svg` — 8x6 true-scale stadium
- `samples/neighborhood-scene.svg` — 10x8 mixed scene showing scale relationships
