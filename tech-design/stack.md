# Technology Stack

## Chosen Stack

### Runtime
- **Platform:** Web browser
- **Language:** TypeScript
- **Build:** Vite (fast HMR, easy setup)

### Rendering
- **Primary:** HTML5 Canvas 2D API
- **Future:** Consider PixiJS or WebGL if performance demands

Rationale: Canvas 2D is simple, well-documented, and plenty fast for tile-based 2D. Avoid framework lock-in early.

### State Management
- Plain TypeScript classes and objects
- No Redux/MobX overhead initially
- Consider Immer for immutable updates if state gets complex

### UI
- HTML/CSS for panels and menus (not canvas-rendered)
- CSS Grid for layout
- Consider Preact later if UI gets complex

### Audio
- Web Audio API
- Howler.js if needed for cross-browser consistency

### Testing
- Vitest (integrates with Vite)
- Playwright for E2E if needed

## Project Structure
```
bitborough/
├── design/              # Game design docs
├── tech-design/         # Technical docs
├── assets/
│   ├── tiles/           # AI-generated tile images
│   ├── sprites/         # Characters, vehicles, effects
│   └── audio/           # Sound effects, music
├── src/
│   ├── index.html
│   ├── main.ts          # Entry point
│   ├── game/
│   │   ├── Game.ts      # Main game class, loop
│   │   ├── Map.ts       # Tile grid
│   │   └── Camera.ts    # Viewport, pan, zoom
│   ├── render/
│   │   ├── Renderer.ts  # Canvas rendering
│   │   └── TileAtlas.ts # Sprite sheet handling
│   ├── input/
│   │   └── Input.ts     # Mouse, keyboard, touch
│   ├── simulation/
│   │   ├── Zones.ts
│   │   ├── Power.ts
│   │   └── Traffic.ts
│   ├── ui/
│   │   ├── Toolbar.ts
│   │   └── InfoPanel.ts
│   ├── tools/
│   │   ├── Tool.ts      # Base tool interface
│   │   ├── ZoneTool.ts
│   │   └── BulldozeTool.ts
│   └── utils/
│       └── math.ts
├── scripts/
│   └── generate-tiles.sh  # Batch tile generation with img
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Tile Generation Pipeline

Using the `img` CLI tool:

```bash
# Generate consistent tiles with shared seed/style
STYLE="top-down game tile, 16-bit pixel art style, clean edges"
SEED=42

img "grass terrain, ${STYLE}" --width 256 --height 256 --seed $SEED -o assets/tiles/grass.png
img "water terrain, ${STYLE}" --width 256 --height 256 --seed $SEED -o assets/tiles/water.png
img "residential house small, ${STYLE}" --width 256 --height 256 --seed $SEED -o assets/tiles/r_small.png
```

Considerations:
- Keep prompts consistent for visual cohesion
- Use --seed for reproducibility
- Generate at larger size, downscale if needed
- May need manual touch-up for seamless tiling

## Dependencies (Initial)
```json
{
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^5.x",
    "vitest": "^1.x"
  }
}
```

Keep dependencies minimal. Add only when clearly needed.

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No IE11
- Mobile: touch support planned but not priority
