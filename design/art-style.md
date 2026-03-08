# Art Style Guide

Visual direction for AI-generated tiles and assets.

## Style Reference
Target a look between:
- SimCity 2000's detailed isometric (but top-down)
- Pixel art clarity of SNES-era games
- Modern indie games like "A Short Hike" or "Mindustry"

## View Perspective
**Top-down, slight angle** (like classic Zelda or Pokémon)
- Not pure bird's eye (boring, flat)
- Not isometric (complex tiling, harder to generate consistently)
- ~30-45 degree viewing angle gives depth without complexity

## Tile Specifications
- **Size:** 256x256 generation → scale to 64x64 or 128x128 for game
- **Edge handling:** Tiles should be designed to connect seamlessly
- **Palette:** Limited, cohesive color palette across all tiles

## Prompt Template
```
[subject], top-down game tile, slight angle view, [style modifiers], clean edges, seamless tile

Style modifiers options:
- "16-bit pixel art style" - retro feel
- "flat colors, minimal shading" - clean modern
- "illustrated, soft shadows" - cozy indie
```

## Tile Categories & Prompts

### Terrain
```bash
img "grass terrain with subtle texture, top-down game tile, flat colors, seamless" --seed 100
img "shallow water with gentle ripples, top-down game tile, flat colors, seamless" --seed 100
img "sand/beach terrain, top-down game tile, flat colors, seamless" --seed 100
img "dense forest trees from above, top-down game tile, flat colors" --seed 100
img "dirt/mud terrain, top-down game tile, flat colors, seamless" --seed 100
```

### Roads
```bash
img "asphalt road straight section, top-down game tile, urban" --seed 100
img "road intersection 4-way, top-down game tile, urban" --seed 100
img "road corner turn, top-down game tile, urban" --seed 100
```

### Zones - Residential
```bash
img "small suburban house from above, top-down game tile, green lawn" --seed 100
img "medium apartment building 2-3 floors from above, top-down game tile" --seed 100
img "tall residential tower from above, top-down game tile, modern" --seed 100
img "empty lot with grass, construction planned sign, top-down game tile" --seed 100
```

### Zones - Commercial
```bash
img "small shop storefront from above, top-down game tile" --seed 100
img "strip mall building from above, parking lot, top-down game tile" --seed 100
img "office building skyscraper from above, top-down game tile" --seed 100
```

### Zones - Industrial
```bash
img "small factory warehouse from above, top-down game tile" --seed 100
img "large industrial plant smokestacks from above, top-down game tile" --seed 100
img "storage tanks industrial from above, top-down game tile" --seed 100
```

### Infrastructure
```bash
img "coal power plant from above, smokestacks, top-down game tile" --seed 100
img "nuclear power plant cooling towers from above, top-down game tile" --seed 100
img "power lines electrical pylons from above, top-down game tile" --seed 100
img "police station building from above, top-down game tile" --seed 100
img "fire station building from above, fire trucks, top-down game tile" --seed 100
```

## Color Palette (Suggested)
```
Grass:      #7EC850, #5A9A32
Water:      #4A90D9, #2E6DB4
Roads:      #4A4A4A, #6B6B6B
Residential: warm tones, browns, creams, red roofs
Commercial:  blues, grays, glass
Industrial:  grays, rust, concrete
```

## Negative Prompts
Always include to avoid common issues:
```
--negative "blurry, distorted, text, watermark, signature, isometric, 3D render, photo"
```

## Iteration Process
1. Generate candidate tiles at 256x256
2. Review for style consistency
3. Test tiling in-game
4. Adjust prompts and regenerate as needed
5. Manual touch-up for edge cases (optional)
6. Batch export at final resolution

## Animation (Future)
- Water: 3-4 frame loop
- Traffic: separate vehicle sprites
- Buildings: optional smoke, lights
- Construction: building stages
