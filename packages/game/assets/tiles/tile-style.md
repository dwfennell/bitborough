# RCity Tile Style Guide

Read this file before authoring any SVG tile. Follow these rules exactly for visual consistency.

## Canvas

- ViewBox: `0 0 128 128` (always)
- Target raster size: 128x128 PNG
- Perspective: pure top-down (bird's eye)
- Light source: top-left (shadows cast down-right)

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

## World Scale

**1 tile = 128px = 32 meters (~105 feet).** 1px = 0.25 meters (25cm).

All structural dimensions derive from this scale. Use this table as the reference when sizing anything.

| Thing              | Real size   | Tile pixels | Notes                           |
|--------------------|-------------|-------------|---------------------------------|
| 2-lane road        | 8m wide     | 32px        | Standard residential street     |
| Sidewalk           | 2m wide     | 8px         | One on each side of road        |
| Road + sidewalks   | 12m total   | 48px        | Full right-of-way               |
| Lane marking       | 0.15m wide  | 1.5px       | Center line, edge lines         |
| Small house        | 10x8m       | 40x32px     | Typical 1-story residential     |
| Medium house       | 12x10m      | 48x40px     | Larger residential              |
| Small shop         | 10x12m      | 40x48px     | Street-front retail             |
| Factory building   | 18x22m      | 72x88px     | Large industrial footprint      |
| Power plant        | 24x24m      | 96x96px     | Multi-tile (2x2) building       |
| Tree canopy        | 5-7m        | 20-28px     | Round blob from above           |
| Bush               | 1.5-2m      | 6-8px       | Small landscaping               |
| Car (top-down)     | 4.5x2m      | 18x8px      | Parked car in lot               |
| Fence/wall segment | 0.3m wide   | 1.5px       | Property boundary               |
| Door               | 1x2m        | 4x8px       | Visible on wall face below roof |
| Window             | 1.2x1.2m    | 5x5px       | Small square from above         |
| Chimney            | 1x1m        | 4x4px       | On rooftop                      |
| Mailbox            | 0.3x0.3m    | 1.5x1.5px   | Tiny yard detail                |
| Flower/plant       | 0.3-0.5m    | 1.5-2px     | Yard accent                     |
| Yard (front/back)  | variable    | remaining   | Space around building           |

### Scale Integrity Rules

- **Buildings must not fill the tile.** A small house is ~40x32px in a 128px tile — roughly 30% of tile width. The rest is yard, setback, and breathing room.
- **Roads are narrow relative to tiles.** A 2-lane road is 32px (25% of tile). With sidewalks, 48px (37.5%).
- **Details must be proportional.** A window is not 10px (2.5m) — it's 5px (1.2m). A door is 4x8px, not 8x12px.
- **Trees are medium-sized features.** A tree canopy is 20-28px — smaller than a house, larger than a bush.
- **When in doubt, measure against the scale table.** If a chimney looks as wide as a door, something is wrong.

## Structural Constants

### Road Geometry
- Pavement width: **32px** (centered in tile: x=48 to x=80)
- Sidewalk width: **8px** each side (x=40 to x=48 left, x=80 to x=88 right)
- Full right-of-way: **48px** (x=40 to x=88)
- Curb line width: **1.5px**
- Lane marking width: **1.5px**
- Lane dash length: **8px**, gap: **6px**
- Lane dash rx: **0.75px** (rounded ends)
- Stop line width: **1.5px**
- Road center line: at **x=64** (vertical) or **y=64** (horizontal)

### Building Geometry (Small Residential)
- Lot margin: **8px** from tile edge (lot fills 8,8 to 120,120)
- Lot corner radius: **3px**
- House footprint: **~40x32px**, centered horizontally in lot, offset toward top
- Roof overhang: **3px** beyond walls on each side
- Roof corner radius: **2px**
- Wall corner radius: **2px**
- Shadow offset: **translate(3, 3)**
- Shadow opacity: **0.1**
- Shadow corner radius: **2px**

### Windows
- Size: **5x5px** (1.2m square)
- Corner radius: **0.5px**
- Glass fill: `window-glass` at **0.8 opacity**
- Frame stroke: `window-frame` at **0.6px**
- Mullion cross: `window-frame` at **0.4px, 0.6 opacity**

### Doors
- Size: **4x8px** (1m x 2m)
- Corner radius: **0.5px**
- Knob radius: **0.6px**

### Chimney
- Size: **4x4px** (1m x 1m)
- Cap overhang: **1px** each side (6x2px cap)

### Trees
- Canopy: **20-28px** diameter ellipse/circle
- Shadow: offset **(2, 2)** at 0.08 opacity
- Use 2-3 overlapping circles for organic shape

### Bushes
- Size: rx=**3-4**, ry=**2.5-3.5** (about 6-8px across)
- Two overlapping ellipses as before but at corrected scale

## Detail Rules

### Opacity Ranges
- Texture patches (grass, water depth): **0.15 - 0.5**
- Grass blades: **0.4 - 0.5**
- Flowers: **0.5 - 0.7**
- Curbs: **0.5**
- Lane markings: **0.7**
- Stop lines: **0.6**
- Building shadows: **0.1**
- Roof shingle lines: **0.25**
- Smoke wisps: **0.3**
- Bushes: **0.6 - 0.7**
- Water ripples: **0.3 - 0.4**
- Water sparkles: **0.45 - 0.6**

### Stroke Widths
- Roof ridge line: **2px**
- Roof shingle lines: **0.5px**
- Wave ripple (primary): **1px**
- Wave ripple (secondary): **0.7px**
- Window frame: **0.8px**
- Window mullion: **0.5px**
- Smoke wisp: **1.5px**
- Manhole cross: **0.5px**

### Texture Density
- Grass patches per tile: **7-10** light ellipses + **3** dark ellipses
- Grass blade clusters: **3-4** clusters of **2-3** blades each
- Flowers per grass tile: **3-5** tiny circles
- Road grain dots: **10-14** per tile
- Water ripple lines: **4** primary + **4** secondary
- Water sparkles: **4-5** dots
- Roof shingle lines: **4** horizontal lines, evenly spaced

### Charm Details (small delightful touches)
- Residential: chimney with smoke wisp, mailbox, bushes, flowers, garden path
- Commercial: rooftop AC unit, signage rectangle, parking lines
- Industrial: smoke stacks, pipes, loading bay rectangle
- Roads: manhole cover at intersections, texture grain
- Terrain: flower clusters, grass blade groups, organic patch shapes

## Shape Vocabulary

### Bushes
Two overlapping ellipses: larger darker one behind, smaller lighter one in front.
- Back: rx=3-4, ry=2.5-3.5, `bush-dark` at 0.7
- Front: rx=2-3, ry=2-2.5, `bush-light` at 0.6
- Offset front ellipse **(-1.5, -1.5)** from back

### Grass Blade Cluster
Group of 2-3 thin triangles, each ~8px tall, ~4px base.
- Pattern: `M[x] [y+8] L[x+2] [y] L[x+4] [y+8]Z`
- Fill: `grass-dark` or `grass-deep`
- Slight x-offset between blades for natural look

### Flowers
1-2 circles, r=1.2-2px, slightly offset from each other.
- Use `flower-pink`, `flower-rose`, or `flower-yellow`

### Chimney Smoke
Single quadratic bezier path, no fill, stroke only.
- Pattern: `M[x] [y] Q[x+2] [y-6] [x-1] [y-12] Q[x-3] [y-18] [x] [y-22]`
- Gentle S-curve, stroke-linecap="round"

### Water Ripples
Quadratic bezier curves with gentle 3px amplitude sine wave.
- Pattern: `M[x1] [y] Q[x2] [y-3] [x3] [y] Q[x4] [y+3] [x5] [y]`
- Span 50-70px wide

### Manhole Cover
Two concentric circles with X cross.
- Outer: r=3, `asphalt-dark` at 0.5
- Inner: r=2, `asphalt-mid` at 0.4
- Cross: 3px diagonal lines, `manhole-line` at 0.5px stroke, 0.4 opacity

## Layer Order (back to front)

1. Base fill (full tile rect with gradient or flat color)
2. Texture patches (ellipses for grass variation, depth patches for water)
3. Surface details (ripples, grain dots, blade clusters)
4. Infrastructure (road surface, curbs)
5. Markings (lane dashes, stop lines)
6. Small infrastructure details (manhole)
7. Building shadow
8. Lot ground
9. Paths/walkways
10. Walls
11. Roof
12. Roof details (ridge, shingles)
13. Chimney
14. Exposed wall elements (windows, doors — below roof line)
15. Yard details (bushes, flowers, mailbox)
16. Atmospheric (smoke wisps)

## SVG Conventions

- Always `xmlns="http://www.w3.org/2000/svg"`
- Gradients go in `<defs>` — use sparingly (terrain base, road asphalt, water only)
- Gradient IDs must be unique per file (prefix with tile type: `grassBase`, `waterBase`, `asphalt`)
- No `<text>` elements
- No external references or `<use>` across files
- Each SVG is fully self-contained
- All strokes use `stroke-linecap="round"` unless rectangular (curbs, stop lines)
- No pure black fills — use `shadow` color at low opacity only for shadows
- Comment each visual layer group for readability

## Seamless Tiling Rules

- Terrain tiles (grass, water, dirt, sand): elements touching edges must be placed so they tile seamlessly with copies of themselves
- Avoid placing prominent features (flowers, blade clusters) within 4px of edges
- Road tiles: pavement extends to tile edge at x=48-80 (vertical) or y=48-80 (horizontal); sidewalks at x=40-48 and x=80-88
- Road curbs and sidewalk edges align exactly at tile boundaries
- Lane dashes must start/end at consistent positions from tile edge (start 4px in, 8px dash, 6px gap repeating)
- Building tiles: buildings should not touch tile edges — lot margin ensures this

## Connection Tile Naming

Road files: `road-NESW.svg` where each letter is `0` or `1`.
- N = connection exits north edge
- E = connection exits east edge
- S = connection exits south edge
- W = connection exits west edge

Examples:
- `road-0000.svg` = isolated road pad (dead end circle)
- `road-1010.svg` = straight north-south
- `road-0110.svg` = east-south curve
- `road-1111.svg` = 4-way intersection
