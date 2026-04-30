# Bitborough Tile Style Guide — v3

Read this file before authoring any SVG tile. Follow these rules for visual consistency.

## Canvas

- ViewBox: `0 0 128 128` (always)
- Target raster size: 128x128 PNG
- Perspective: pure top-down (bird's eye)
- Light source: top-left (shadows cast down-right)
- Background: transparent — terrain renders underneath building tiles

## Design Philosophy

**Deliberate, not dense.** Every element in the tile should exist for a reason. A wheelbarrow next to a garden bed tells a story. A random scattering of flower circles is noise. Ask "why is this here?" for every element — if there's no answer, remove it.

**Quality of detail over quantity.** A well-drawn bicycle with wheels, frame, and handlebars is worth more than ten scattered circles. Fewer elements, each with enough detail to be recognizable at 128px, beats many tiny indistinct blobs.

**Composition matters.** Don't center the building. Offset it to create interesting negative space — a garden on one side, a driveway on the other. Let the layout suggest how the space is used. Asymmetry feels natural; symmetry feels like a diagram.

**Warm and lived-in.** Tiles should feel like someone is home. Smoke from the chimney, a car in the driveway, a garden that's been tended. But achieve this through a few well-chosen details, not by filling every empty pixel.

**Minimum visible opacity: 0.3.** If an element renders invisibly at 128px, it's wasted. Every element you draw should be visible. The only exception is building shadows (0.08-0.1) and very subtle ground shadows under trees (0.06-0.08).

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
| Chimney            | 1x1m        | 4x4px       | On rooftop                      |
| Flower/plant       | 0.3-0.5m    | 1.5-2px     | Yard accent                     |

### Scale Integrity Rules

- **Buildings must not fill the tile.** A small house is ~40x32px in a 128px tile. The rest is yard, setback, and breathing room.
- **Details must be proportional.** A window is 5px, a door is 4x8px. Don't make them larger.
- **When in doubt, measure against the scale table.**

## Architectural Detail

### Windows (5x5px)
1. Glass fill: `window-glass` at 0.8 opacity
2. Frame: `window-frame` stroke at 0.6px
3. Mullion cross: vertical + horizontal lines at 0.4px, 0.6 opacity

### Doors (4x8px)
1. Base fill: `door` color
2. Knob: 0.6px circle in `door-knob`
3. Step/threshold: small rect below door, `path` at 0.35 opacity

### Roofs
1. Main fill appropriate to building type
2. Ridge line: 2px stroke at 0.5 opacity
3. Shingle texture: 3-4 horizontal lines at 0.5px, 0.25 opacity
4. At least one distinguishing detail — a vent, skylight, or second ridge angle

### Chimneys
1. Body: 4x4px rect with cap (6x2px)
2. Smoke: 1-2 curving bezier wisps, `smoke` at 0.3 opacity

## Telling a Story

Instead of scattering random props, think about who lives or works in this building and what evidence they'd leave visible from above. Pick 3-4 story elements that work together:

**Examples of good storytelling:**
- A cottage with a *vegetable garden* (neat rows of green rectangles), a *wheelbarrow* beside it, and a *garden hose* coiled near the faucet
- A family home with a *swing set* in the backyard, a *parked minivan*, and *chalk drawings* (faint colored circles) on the driveway
- A retired person's house with a *bird feeder* (pole + small platform), *well-tended flower beds* along the foundation, and a *rocking chair* on the porch
- A fire station with a *truck in the bay*, a *hose tower* with ladder detail, and a *training yard* with obstacles

**Examples of bad storytelling:**
- Random flower circles scattered everywhere with no grouping or purpose
- A bike, bench, bird bath, grill, clothesline, and potted plant all crammed into one yard — no one's yard has all of these
- Fence posts running the entire perimeter like a picture frame
- Grass blade triangles filling every empty space

## Composition

- **Offset the building.** Place it upper-left, upper-right, or centered-back — not dead center. Leave room for the yard to breathe on at least one side.
- **Create zones.** A front yard, a driveway, a backyard garden — each area should feel distinct, not uniform.
- **Use negative space.** Empty grass is fine. Not every square pixel needs an element. A few well-placed details surrounded by breathing room read better than wall-to-wall stuff.
- **Fences are optional and subtle.** If used, only along one or two sides. Thin strokes, moderate opacity. Never a full rectangle around the lot.
- **Ground shadows anchor objects.** Every tree needs a shadow. The building shadow is required. These ground the scene.

## Layer Order (back to front)

1. Base fill (full tile rect with gradient or flat color)
2. Texture patches (grass variation — keep these subtle, 4-6 patches max)
3. Surface details (grass blade clusters — 2-3 max, not filling every corner)
4. Infrastructure (road surface, curbs)
5. Markings (lane dashes, stop lines)
6. Small infrastructure details (manhole)
7. Fence sections (if any — partial, not perimeter)
8. Building shadow
9. Lot ground
10. Paths/walkways
11. Walls
12. Roof
13. Roof details (ridge, shingles, vent/skylight)
14. Chimney
15. Exposed wall elements (windows, doors)
16. Story props (the 3-4 deliberate elements that tell who lives here)
17. Vegetation (bushes, trees with shadows, intentional flower groupings)
18. Atmospheric (smoke wisps)

## SVG Conventions

- Always `xmlns="http://www.w3.org/2000/svg"`
- Gradients in `<defs>`, used sparingly (terrain base, road asphalt, water)
- Gradient IDs unique per file (prefix with tile type)
- No external references, no `<use>` across files, fully self-contained
- All strokes use `stroke-linecap="round"` unless rectangular
- No pure black fills — shadows use `#000000` at low opacity only
- Comment each layer group for readability

## Seamless Tiling Rules

- Terrain tiles: elements touching edges must tile seamlessly
- Avoid prominent features within 4px of edges
- Building tiles: buildings don't touch edges — lot margin handles this

## Connection Tile Naming

Road files: `road-NESW.svg` where each letter is `0` or `1`.
- `road-1010.svg` = straight north-south
- `road-0110.svg` = east-south curve
- `road-1111.svg` = 4-way intersection
