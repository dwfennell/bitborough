# Content Pipeline

How assets flow from `img` generation into the game.

---

## Asset Categories

### 1. Terrain Tiles
Static ground tiles that form the base layer.

| Asset | Variants | Notes |
|-------|----------|-------|
| Grass | 3-4 | Subtle variation prevents tiling repetition |
| Water | 1 + animation frames | 3-4 frames for shimmer |
| Sand/Beach | 2-3 | Transition tiles for water edges |
| Dirt | 2-3 | For construction sites |
| Trees/Forest | 4-6 | Different densities |

### 2. Infrastructure Tiles
Roads, rails, power lines - need connection variants.

| Asset | Variants | Notes |
|-------|----------|-------|
| Road | 16 | All connection combinations (straight, corners, T, cross, ends) |
| Rail | 16 | Same connection logic |
| Power line | 16 | Same connection logic |
| Bridge (road) | 2 | Horizontal, vertical over water |
| Bridge (rail) | 2 | Horizontal, vertical over water |

**Connection tile math:** 4 edges × 2 states (connected/not) = 16 combinations. Use bitmask indexing.

### 3. Zone Overlays
Visual indicators for zoned but undeveloped land.

| Asset | Notes |
|-------|-------|
| Residential zone | Green tint/pattern overlay |
| Commercial zone | Blue tint/pattern overlay |
| Industrial zone | Yellow tint/pattern overlay |
| Empty lot | Cleared ground, awaiting development |

### 4. Buildings
Developed structures. Need density levels.

**Residential:**
| Density | Examples | Size |
|---------|----------|------|
| Low | Small house, duplex | 1x1 |
| Medium | Apartment 2-3 floors | 1x1 or 2x2 |
| High | Tower, high-rise | 2x2 or 3x3 |

**Commercial:**
| Density | Examples | Size |
|---------|----------|------|
| Low | Corner store, gas station | 1x1 |
| Medium | Strip mall, office | 2x2 |
| High | Skyscraper, mall | 3x3 or 4x4 |

**Industrial:**
| Density | Examples | Size |
|---------|----------|------|
| Low | Warehouse, workshop | 1x1 or 2x2 |
| Medium | Factory | 2x2 or 3x3 |
| High | Industrial complex | 3x3 or 4x4 |

**Variation:** Each density level should have 3-5 visual variants to prevent repetition.

### 5. Special Buildings
Placed by player, unique appearance.

| Building | Size | Notes |
|----------|------|-------|
| Coal power plant | 4x4 | Smokestacks, maybe animated smoke |
| Nuclear power plant | 4x4 | Cooling towers |
| Police station | 3x3 | |
| Fire station | 3x3 | Fire trucks visible |
| Hospital | 3x3 | |
| School | 3x3 | |
| Stadium | 4x4 | |
| Seaport | 4x6 | Docks, cranes |
| Airport | 6x6 | Runway, terminal |
| Park | 1x1 to 3x3 | Multiple sizes |

### 6. Vehicles (Sprites)
Moving entities, not tiles. Need 4 or 8 directional variants.

| Vehicle | Directions | Animation | Notes |
|---------|------------|-----------|-------|
| Car | 4 or 8 | None | Multiple colors/styles |
| Bus | 4 or 8 | None | |
| Truck | 4 or 8 | None | Industrial areas |
| Train | 4 | None | Follows rail |
| Boat | 4 or 8 | Wake animation? | Water transport |
| Airplane | 8 | None | Flies over city |
| Helicopter | 8 | Rotor animation | Emergency/news |
| Fire truck | 4 | Lights flash | Emergency |
| Police car | 4 | Lights flash | Emergency |

### 7. Effects & Overlays
Visual feedback layers.

| Effect | Notes |
|--------|-------|
| Fire | Animated, 3-4 frames |
| Smoke | From power plants, fires |
| Construction | Crane, scaffolding |
| Explosion | Disaster effect |
| Pollution cloud | Semi-transparent overlay |
| Power radius | Debug/info overlay |
| Service radius | Police/fire coverage |

### 8. UI Elements
Interface assets (may not need `img` generation).

- Tool icons (bulldoze, zone, road, etc.)
- R/C/I demand bars
- Budget icons
- Disaster icons
- Cursor variants

---

## Generation Workflow

### Directory Structure
```
assets/
├── raw/                    # Generated at high res (256x256 or 512x512)
│   ├── terrain/
│   ├── roads/
│   ├── buildings/
│   │   ├── residential/
│   │   ├── commercial/
│   │   └── industrial/
│   ├── special/
│   ├── vehicles/
│   └── effects/
├── processed/              # Downscaled, trimmed, sheet-ready
├── sheets/                 # Packed sprite sheets
│   ├── terrain.png
│   ├── buildings.png
│   ├── vehicles.png
│   └── ui.png
└── manifest.json           # Asset registry
```

### Generation Script Pattern

```bash
#!/bin/bash
# scripts/generate-terrain.sh

STYLE="top-down game tile, flat colors, clean edges, seamless"
NEGATIVE="blurry, text, watermark, 3D render, isometric"
SEED=42
SIZE=256

img "grass terrain with subtle variation, ${STYLE}" \
    --width $SIZE --height $SIZE \
    --seed $SEED \
    --negative "$NEGATIVE" \
    --metadata \
    -o assets/raw/terrain/grass_01.png

img "grass terrain slightly different shade, ${STYLE}" \
    --width $SIZE --height $SIZE \
    --seed $((SEED + 1)) \
    --negative "$NEGATIVE" \
    --metadata \
    -o assets/raw/terrain/grass_02.png

# ... more tiles
```

### Batch Generation Manifest

Create a JSON manifest to drive generation:

```json
{
  "style": {
    "base": "top-down game tile, flat colors, clean edges",
    "negative": "blurry, text, watermark, 3D render, isometric",
    "seed": 42,
    "size": 256
  },
  "assets": [
    {
      "id": "terrain.grass.01",
      "prompt": "grass terrain with subtle texture",
      "category": "terrain"
    },
    {
      "id": "terrain.water.01",
      "prompt": "calm water surface with gentle ripples",
      "category": "terrain"
    },
    {
      "id": "building.residential.low.01",
      "prompt": "small suburban house with lawn from above",
      "category": "buildings/residential"
    }
  ]
}
```

Script reads manifest, generates all assets with consistent settings.

---

## Sprite Sheet Packing

### Why Sprite Sheets?
- Fewer HTTP requests
- GPU texture batching
- Efficient memory layout

### Tool Options
- **TexturePacker** (commercial, excellent)
- **Free alternatives:** spritesheet.js, Shoebox, online packers
- **Custom script:** Simple grid packing for uniform tiles

### Sheet Organization
Separate sheets by render layer/frequency:
1. `terrain.png` - Base tiles, always visible
2. `infrastructure.png` - Roads, rails, power
3. `buildings.png` - Developed zones
4. `vehicles.png` - Moving sprites
5. `effects.png` - Animations, overlays
6. `ui.png` - Interface elements

### Atlas Format
```json
{
  "terrain.png": {
    "width": 1024,
    "height": 1024,
    "tileSize": 64,
    "tiles": {
      "grass_01": { "x": 0, "y": 0 },
      "grass_02": { "x": 64, "y": 0 },
      "water_01": { "x": 128, "y": 0 }
    }
  }
}
```

---

## Connection Tiles (Roads, Rails, Power)

Use bitmask for tile selection:

```
Bit 0 = North connected
Bit 1 = East connected
Bit 2 = South connected
Bit 3 = West connected

Examples:
0000 (0)  = No connections (end cap or isolated)
0101 (5)  = North + South (vertical straight)
1010 (10) = East + West (horizontal straight)
1111 (15) = All four (crossroads)
0011 (3)  = North + East (corner)
```

Generate or design all 16 variants per connection type.

### Generation Approach
```bash
# Straight pieces
img "asphalt road straight section vertical, top-down" -o road_05.png
img "asphalt road straight section horizontal, top-down" -o road_10.png

# Corners
img "asphalt road corner turning from bottom to right, top-down" -o road_03.png

# Intersections
img "asphalt road 4-way intersection, top-down" -o road_15.png
```

**Challenge:** AI may not reliably generate exact connection points. May need:
- Post-processing to align edges
- Manual touch-up
- Procedural generation for road markings

---

## Vehicle Sprites

### Multi-Directional Generation

```bash
# Generate each direction
VEHICLE="red sedan car"
img "${VEHICLE} facing up, top-down view, game sprite" -o car_red_n.png
img "${VEHICLE} facing right, top-down view, game sprite" -o car_red_e.png
img "${VEHICLE} facing down, top-down view, game sprite" -o car_red_s.png
img "${VEHICLE} facing left, top-down view, game sprite" -o car_red_w.png
```

**Alternative:** Generate one direction, rotate programmatically (works for symmetric vehicles).

### Vehicle Scale
Vehicles should be smaller than tiles:
- Tile: 64x64
- Vehicle: ~24x48 (car) or ~32x16 (truck)

Generate larger, downscale.

---

## Animation Frames

### Water Animation
```bash
for i in 1 2 3 4; do
  img "calm water surface frame ${i} of 4, subtle ripple, top-down" \
      --seed $((42 + i)) \
      -o water_frame_${i}.png
done
```

### Fire Animation
```bash
for i in 1 2 3 4; do
  img "fire flames frame ${i} of 4, top-down game effect" \
      --seed $((100 + i)) \
      -o fire_frame_${i}.png
done
```

### Animation Metadata
```json
{
  "water": {
    "frames": ["water_01", "water_02", "water_03", "water_04"],
    "frameTime": 200,
    "loop": true
  },
  "fire": {
    "frames": ["fire_01", "fire_02", "fire_03", "fire_04"],
    "frameTime": 100,
    "loop": true
  }
}
```

---

## Style Consistency Checklist

When generating assets, verify:

- [ ] Same seed (or seed range) for cohesion
- [ ] Same style keywords in all prompts
- [ ] Same negative prompts
- [ ] Consistent lighting direction (pick one, stick to it)
- [ ] Consistent color palette
- [ ] Consistent level of detail
- [ ] Edges align for tiles that connect
- [ ] Scale is consistent (buildings look right next to roads)

---

## Iteration Process

1. **Generate candidates** - Create 3-5 variants of each asset
2. **Review in context** - Drop into test scene, view alongside other tiles
3. **Curate** - Pick best, note needed adjustments
4. **Regenerate or edit** - Refine prompts or manually fix
5. **Process** - Downscale, pack into sheets
6. **Test in game** - Verify rendering, animations
7. **Commit** - Add to version control with generation metadata

---

## Open Questions

- [ ] Isometric vs top-down decision affects ALL asset generation
- [ ] Exact tile size (32, 64, 128?) - affects generation resolution
- [ ] How to handle multi-tile buildings in sprite sheets?
- [ ] Procedural variation (tinting, rotation) vs generating variants?
- [ ] Audio asset pipeline (separate doc?)
