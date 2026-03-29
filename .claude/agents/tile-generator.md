---
name: tile-generator
description: Generate game tiles via the backend API. Use when user wants to generate tiles or buildings for the city builder.
tools:
  - Bash
  - Read
  - Write
model: haiku
---

# Tile Generator Agent

> **Note:** For SVG tile authoring, use the `tile-gen` agent instead. This agent is for AI image generation via the backend API (localhost:9847).

Generate tiles by submitting requests to the game manager backend API.

## API Endpoint

```bash
curl -s -X POST http://localhost:9847/api/generations \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "YOUR PROMPT HERE",
    "negativePrompt": "isometric, angled, perspective, 3d, side view, photo, realistic",
    "width": 64,
    "height": 64,
    "steps": 25,
    "autoApprove": true,
    "name": "Building Name",
    "category": "building",
    "tags": "impressionist, orthographic"
  }'
```

## Recommended Style (Orthographic Impressionist)

This style works well for composable map tiles:

```
bird's eye view directly from above, flat orthographic map tile,
impressionist style [BUILDING TYPE], Monet soft brushstrokes,
pastel lavender blue coral sage green palette
```

## Example Request

**Hospital:**
```bash
curl -s -X POST http://localhost:9847/api/generations \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "bird'\''s eye view directly from above, flat orthographic map tile, impressionist style hospital with medical cross, Monet soft brushstrokes, pastel lavender blue coral sage green palette",
    "negativePrompt": "isometric, angled, perspective, 3d, side view, photo, realistic",
    "width": 64,
    "height": 64,
    "steps": 25,
    "autoApprove": true,
    "name": "Hospital",
    "category": "building",
    "tags": "impressionist, orthographic, medical"
  }'
```

## Auto-Approve Fields

When `autoApprove` is true, provide these fields:
- `name`: Display name for the asset (e.g., "Hospital", "Fire Station")
- `category`: Asset category (usually "building" for buildings, "terrain" for ground tiles)
- `tags`: Comma-separated tags for filtering (e.g., "impressionist, orthographic, residential")

## Workflow

1. Build the prompt using the orthographic impressionist template
2. Submit to `POST /api/generations` with autoApprove=true
3. The backend queues, processes, and auto-accepts into the asset library
4. View results in the web UI at http://localhost:9848

## Generating Multiple Tiles

For multiple tiles, submit each as a separate API call. Example batch:

```bash
# Church
curl -s -X POST http://localhost:9847/api/generations -H "Content-Type: application/json" -d '{"prompt":"bird'\''s eye view directly from above, flat orthographic map tile, impressionist style church with steeple, Monet soft brushstrokes, pastel lavender blue coral sage green palette","negativePrompt":"isometric, angled, perspective, 3d, side view, photo, realistic","width":64,"height":64,"steps":25,"autoApprove":true,"name":"Church","category":"building","tags":"impressionist, orthographic, religious"}'

# Bakery
curl -s -X POST http://localhost:9847/api/generations -H "Content-Type: application/json" -d '{"prompt":"bird'\''s eye view directly from above, flat orthographic map tile, impressionist style bakery with chimney, Monet soft brushstrokes, pastel lavender blue coral sage green palette","negativePrompt":"isometric, angled, perspective, 3d, side view, photo, realistic","width":64,"height":64,"steps":25,"autoApprove":true,"name":"Bakery","category":"building","tags":"impressionist, orthographic, commercial"}'
```
