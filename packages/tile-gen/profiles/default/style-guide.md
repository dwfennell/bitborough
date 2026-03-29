# Bitborough Tile Style Guide — v2

Read this file before authoring any SVG tile. Follow these rules for visual consistency. The goal is tiles that are **pleasant to look at** — charming, detailed, and alive. Every tile should feel like a tiny world worth zooming into.

## Canvas

- ViewBox: `0 0 128 128` (always)
- Target raster size: 128x128 PNG
- Perspective: pure top-down (bird's eye)
- Light source: top-left (shadows cast down-right)
- Background: transparent — terrain renders underneath building tiles

## Design Philosophy

**Warm, impressionist, inviting.** Tiles should evoke the charm of a beloved small town seen from above. Think Miyazaki backgrounds meets SimCity — organic shapes, soft colors, lived-in details. Every building should look like someone lives or works there.

**Detail density matters.** The difference between a lackluster tile and a charming one is the small touches: a bicycle leaning against a fence, flower boxes under windows, a cat on a rooftop, smoke curling from a chimney. Aim for **150-200 SVG elements per building tile** (current tiles average 60-90 and feel sparse).

**Organic over geometric.** Use rounded corners, overlapping shapes, and slight irregularity. Perfectly aligned grid-like layouts feel sterile. Offset elements slightly, vary sizes, let shapes overlap naturally.

## Color Palette

Use ONLY these colors. Do not invent new hex values.

### Greens (grass, vegetation)
| Token            | Hex       | Use                              |
|------------------|-----------|----------------------------------|
| `grass-base`     | `#8cc870` | Grass fill, road tile background |
| `grass-light`    | `#95d07a` | Light texture patches            |
| `grass-mid`      | `#82c466` | Mid texture patches              |
| `grass-highlight`| `#a0da88` | Bright accent patches            |
| `grass-soft`     | `#9ad680` | Gentle variation                 |
| `grass-dark`     | `#6aaa50` | Dark patches, grass blade fill   |
| `grass-deep`     | `#78b868` | Blade clusters, secondary dark   |
| `yard`           | `#a0d48a` | Building lot ground              |
| `bush-dark`      | `#78b868` | Bush base layer                  |
| `bush-light`     | `#90c880` | Bush highlight layer             |
| `bush-mid`       | `#88c070` | Bush secondary highlight         |
| `tree-dark`      | `#60a850` | Dense tree shadow                |
| `tree-mid`       | `#78b868` | Tree canopy base                 |
| `tree-light`     | `#90c880` | Tree canopy highlight            |

### Blues (water)
| Token            | Hex       | Use                          |
|------------------|-----------|------------------------------|
| `water-base-1`   | `#88c8e8` | Water gradient stop 1        |
| `water-base-2`   | `#78b8d8` | Water gradient stop 2        |
| `water-deep`     | `#6aaccf` | Depth variation patches      |
| `water-caustic`  | `#a8ddf0` | Caustic light spots          |
| `water-ripple`   | `#a0d8f0` | Wave line stroke             |
| `water-ripple-2` | `#b0e0f4` | Secondary ripple stroke      |
| `water-sparkle`  | `#d0eef8` | Sparkle highlight dots       |

### Earth (dirt, sand, paths)
| Token            | Hex       | Use                      |
|------------------|-----------|--------------------------|
| `dirt-base`      | `#d8c498` | Dirt terrain fill        |
| `dirt-dark`      | `#c8b480` | Dirt dark patches        |
| `dirt-light`     | `#e8d8b0` | Dirt light patches       |
| `path`           | `#c8b898` | Garden paths, walkways   |

### Grays (roads, infrastructure)
| Token            | Hex       | Use                            |
|------------------|-----------|---------------------------------|
| `asphalt-1`      | `#707070` | Road gradient stop 1           |
| `asphalt-2`      | `#686868` | Road gradient stop 2           |
| `asphalt-grain`  | `#606060` | Road texture dots              |
| `asphalt-dark`   | `#585858` | Manhole, dark accents          |
| `asphalt-mid`    | `#626262` | Manhole inner ring             |
| `curb`           | `#989898` | Sidewalk/curb edge             |
| `marking-yellow` | `#e8d080` | Center lane dashes             |
| `marking-white`  | `#e0e0e0` | Stop lines, crosswalks         |

### Residential
| Token            | Hex       | Use                        |
|------------------|-----------|----------------------------|
| `res-roof`       | `#d08870` | Residential roof fill      |
| `res-roof-line`  | `#c07060` | Roof ridge line            |
| `res-roof-tex`   | `#c07860` | Roof shingle lines         |
| `res-wall`       | `#e8c8b0` | Wall base                  |
| `res-wall-shade` | `#e0b89a` | Wall shading overlay       |
| `window-glass`   | `#a8d0e8` | Window fill                |
| `window-frame`   | `#987868` | Window frame, mullions     |
| `door`           | `#8a6848` | Door fill                  |
| `door-knob`      | `#c0a080` | Door hardware              |
| `chimney`        | `#a08070` | Chimney body               |
| `chimney-cap`    | `#8a7060` | Chimney cap/top            |
| `smoke`          | `#d0d0d0` | Chimney smoke wisp         |

### Commercial
| Token            | Hex       | Use                        |
|------------------|-----------|----------------------------|
| `com-roof`       | `#90b8d8` | Commercial roof fill       |
| `com-roof-dark`  | `#80a8c8` | Commercial roof shade      |
| `com-roof-light` | `#b0d0e8` | Commercial roof highlight  |
| `com-wall`       | `#d8d8d0` | Commercial wall base       |

### Industrial
| Token            | Hex       | Use                        |
|------------------|-----------|----------------------------|
| `ind-roof`       | `#a8a898` | Industrial roof fill       |
| `ind-roof-dark`  | `#989880` | Industrial roof shade      |
| `ind-roof-light` | `#c0c0b0` | Industrial roof highlight  |
| `ind-metal`      | `#8a8878` | Metal/pipe accents         |
| `ind-rust`       | `#b09070` | Rust accent details        |

### Power
| Token            | Hex       | Use                      |
|------------------|-----------|--------------------------|
| `power-yellow`   | `#e8d080` | Power plant accent       |
| `power-dark`     | `#d8c070` | Power plant shade        |

### Accent / Detail
| Token            | Hex       | Use                        |
|------------------|-----------|----------------------------|
| `flower-pink`    | `#e8c8d0` | Pink flower accent         |
| `flower-pink-2`  | `#d8a8b8` | Pink flower darker         |
| `flower-pink-3`  | `#d8b8c0` | Pink flower variant        |
| `flower-rose`    | `#e8a8b8` | Rose flower accent         |
| `flower-yellow`  | `#e8d8a0` | Yellow flower accent       |
| `mailbox`        | `#6088c0` | Mailbox body               |
| `mailbox-top`    | `#5078b0` | Mailbox cap                |
| `shadow`         | `#000000` | Building shadow (use 0.1 opacity) |
| `manhole-line`   | `#555555` | Manhole cross lines        |
| `fence-wood`     | `#b09878` | Wooden fence posts/rails   |
| `fence-light`    | `#c8b898` | Fence highlight            |
| `metal-light`    | `#b8b8a8` | Light metal (bike frames, poles) |
| `fabric-warm`    | `#d8a888` | Awnings, clotheslines      |

## World Scale

**1 tile = 128px = 32 meters (~105 feet).** 1px = 0.25 meters (25cm).

| Thing              | Real size   | Tile pixels | Notes                           |
|--------------------|-------------|-------------|---------------------------------|
| 2-lane road        | 8m wide     | 32px        | Standard residential street     |
| Sidewalk           | 2m wide     | 8px         | One on each side of road        |
| Small house        | 10x8m       | 40x32px     | Typical 1-story residential     |
| Medium house       | 12x10m      | 48x40px     | Larger residential              |
| Small shop         | 10x12m      | 40x48px     | Street-front retail             |
| Factory building   | 18x22m      | 72x88px     | Large industrial footprint      |
| Tree canopy        | 5-7m        | 20-28px     | Round blob from above           |
| Bush               | 1.5-2m      | 6-8px       | Small landscaping               |
| Car (top-down)     | 4.5x2m      | 18x8px      | Parked car in lot               |
| Bicycle            | 1.8x0.6m    | 7x2.5px     | Leaning or parked               |
| Door               | 1x2m        | 4x8px       | Visible on wall face below roof |
| Window             | 1.2x1.2m    | 5x5px       | Small square from above         |
| Window box         | 1.2x0.4m    | 5x1.5px     | Below each window               |
| Chimney            | 1x1m        | 4x4px       | On rooftop                      |
| Fence post         | 0.1x0.1m    | 1x1px       | At regular intervals            |
| Fence rail         | varies      | 1px stroke  | Between posts                   |
| Flower/plant       | 0.3-0.5m    | 1.5-2px     | Yard accent                     |
| Streetlight        | 0.3m pole   | 1.5px wide  | 8-10px tall with 2px head       |

### Scale Integrity Rules

- **Buildings must not fill the tile.** A small house is ~40x32px in a 128px tile. The rest is yard, setback, and breathing room.
- **Details must be proportional.** A window is 5px, a door is 4x8px. Don't make them larger.
- **When in doubt, measure against the scale table.**

## Architectural Detail Standards

### Windows (5x5px) — REQUIRED DETAIL
Every window should have:
1. Glass fill: `window-glass` at 0.8 opacity
2. Frame: `window-frame` stroke at 0.6px
3. Mullion cross: vertical + horizontal lines at 0.4px, 0.6 opacity
4. **Window box** (on at least half the windows): 5x1.5px rect below window, `bush-dark` at 0.5 opacity, with 2-3 tiny flower circles (1px radius) in pink/yellow

### Doors (4x8px) — REQUIRED DETAIL
Every door should have:
1. Base fill: `door` color
2. Panel lines: 2 horizontal lines at 0.3px, 0.2 opacity (suggests 3-panel door)
3. Knob: 0.6px circle in `door-knob`
4. **Threshold shadow**: 4x1px rect below door, `shadow` at 0.08 opacity
5. **Step/welcome mat**: 5x2px rect below threshold, `path` at 0.3 opacity

### Roofs — REQUIRED DETAIL
Every roof should have:
1. Main fill with color appropriate to building type
2. Ridge line: 2px stroke at 0.5 opacity
3. Shingle texture: 4-5 horizontal lines at 0.5px, 0.2 opacity
4. **Gutter line**: thin stroke (0.5px) along the bottom edge of roof, slightly darker than roof
5. **Roof variation**: at least one detail beyond flat color — a vent (2x2px circle), a skylight (3x4px lighter rect), or a second ridge angle

### Chimneys — REQUIRED DETAIL
1. Body: 4x4px rect
2. Cap: 6x2px rect (1px overhang each side)
3. **Smoke**: always include 1-2 curving bezier wisps, `smoke` color at 0.25-0.35 opacity
4. Smoke should curl and drift — use Q (quadratic) curves with gentle S-shape

## Charm Elements

These are what make tiles feel alive. **Every building tile MUST include at least 5 charm elements** from this list (in addition to the architectural detail above):

### Yard & Garden
- **Flower clusters**: groups of 3-5 tiny circles (1-2px), mix pink/yellow/rose colors, scattered naturally
- **Bushes**: pairs of overlapping ellipses (dark behind, light in front), at least 2-3 per building
- **Trees**: 3-4 overlapping circles of varying size and opacity, with shadow underneath. **Vary tree shapes** — not all identical
- **Garden path**: curved or winding path from door to edge, `path` color at 0.4 opacity
- **Garden bed**: oval area near building with denser flower clusters
- **Potted plants**: small circle on porch/entrance area

### Props & Furniture
- **Bicycle**: two small circles (wheels, 1.5px radius) connected by frame lines, leaning against building or fence
- **Clothesline**: two thin posts (1px wide) with 2-3 curved lines between them (fabric shapes)
- **Outdoor chair/bench**: small rect (4x3px) with back line, in yard or patio area
- **Grill/BBQ**: small dark circle (2px) with smoke wisp, in backyard
- **Stepping stones**: 3-4 small circles (2-3px) in a path through grass
- **Bird bath**: small circle (3px) with lighter inner circle, in garden

### Building Accessories
- **Fence sections**: thin posts (1px) at regular intervals along lot edge, connected by horizontal rail strokes
- **Mailbox**: small rect (1.5x3px) near lot entrance with `mailbox` color
- **Streetlight**: narrow pole (1.5px wide, 10px tall) with circular head (2px), placed at lot corner
- **Satellite dish**: tiny circle (2px) on roof edge, gray
- **AC unit** (commercial): circle with cross stroke on roof

### Life & Movement
- **Parked cars**: include at least 1 car for residential, 2-3 for commercial. Cars should have windshield detail (lighter rect) and vary in color
- **Smoke/steam**: from chimneys, industrial stacks, or kitchen vents. Use curving bezier paths
- **Pets**: optional — a small oval (3x2px) on a porch or yard suggests a resting cat or dog
- **Puddle**: small blue-tinted ellipse (4x2px) in a driveway or path after rain (water-base-1 at 0.2 opacity)

## Layer Order (back to front)

1. Base fill (full tile rect with gradient or flat color)
2. Texture patches (ellipses for grass variation, depth patches for water)
3. Surface details (ripples, grain dots, blade clusters)
4. Infrastructure (road surface, curbs)
5. Markings (lane dashes, stop lines)
6. Small infrastructure details (manhole)
7. **Fence/boundary elements**
8. Building shadow
9. Lot ground
10. Paths/walkways/stepping stones
11. Walls
12. Roof
13. Roof details (ridge, shingles, vents, skylights, gutter)
14. Chimney
15. Exposed wall elements (windows with boxes, doors with thresholds)
16. **Props & furniture** (bikes, chairs, grills, bird baths)
17. Yard details (bushes, flowers, mailbox, streetlight)
18. **Pets/life details**
19. Atmospheric (smoke wisps, steam)

## Texture Density

- Grass patches per tile: **10-14** light ellipses + **4-5** dark ellipses
- Grass blade clusters: **4-6** clusters of **2-3** blades each
- Flowers per building tile: **8-15** tiny circles in **3-5** clusters
- Flowers per grass tile: **5-8** tiny circles
- Roof shingle lines: **4-5** horizontal lines, evenly spaced
- Road grain dots: **12-16** per tile
- Water ripple lines: **5** primary + **5** secondary
- Window boxes: on **at least half** of all windows
- Charm props per building: **minimum 5** distinct elements

## SVG Conventions

- Always `xmlns="http://www.w3.org/2000/svg"`
- Gradients go in `<defs>` — use sparingly (terrain base, road asphalt, water only)
- Gradient IDs must be unique per file (prefix with tile type: `grassBase`, `waterBase`)
- No external references or `<use>` across files
- Each SVG is fully self-contained
- All strokes use `stroke-linecap="round"` unless rectangular (curbs, stop lines)
- No pure black fills — use `shadow` color at low opacity only for shadows
- Comment each visual layer group for readability
- Use `<g>` groups with comments to organize layers: `<!-- Yard details -->`, `<!-- Charm props -->`

## Seamless Tiling Rules

- Terrain tiles: elements touching edges must tile seamlessly with copies of themselves
- Avoid placing prominent features (flowers, blade clusters) within 4px of edges
- Building tiles: buildings should not touch tile edges — lot margin ensures this
- Fence elements at lot boundary should align to consistent positions near edges

## Connection Tile Naming

Road files: `road-NESW.svg` where each letter is `0` or `1`.
- N = connection exits north edge
- E = connection exits east edge
- S = connection exits south edge
- W = connection exits west edge

Examples:
- `road-1010.svg` = straight north-south
- `road-0110.svg` = east-south curve
- `road-1111.svg` = 4-way intersection
