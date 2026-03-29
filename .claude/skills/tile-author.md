---
name: tile-author
description: Author SVG game tiles using the tile-gen harness. Use when creating, editing, or generating tile graphics for the city builder.
---

# Tile Author

Generate SVG tiles using the tile-gen generation-evaluation harness.

## Quick Start

To generate a tile, spawn the tile-gen agent:

1. Confirm the tile description with the user (e.g., "fire station, small")
2. Ask which profile to use (default: `default`). List available profiles:
   ```bash
   npx tsx packages/tile-gen/src/cli.ts profiles
   ```
3. Ask how many iterations (default: 5)
4. Spawn the agent:
   Use the Agent tool with the tile-gen agent. Pass the description, profile, and iteration count as the prompt.

## Reviewing Results

After the agent completes:

```bash
npx tsx packages/tile-gen/src/cli.ts list
npx tsx packages/tile-gen/src/cli.ts show <profile>/<run-id>
```

## Promoting Tiles

If the user approves a tile:

```bash
npx tsx packages/tile-gen/src/cli.ts promote <profile>/<run-id> --to <subdirectory> --as <filename>.svg
```

## Creating New Profiles

For experimental styles:

```bash
npx tsx packages/tile-gen/src/cli.ts profile-create <name>
```

Then edit the scaffolded profile.yaml and style-guide.md.
