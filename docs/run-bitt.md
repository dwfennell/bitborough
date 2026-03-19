---
name: run-bitt
description: Use when testing the game via the bitt CLI — covers city setup, common pitfalls, and diagnostic commands
user_invocable: true
---

# Testing with bitt CLI

The `bitt` CLI is an AI-friendly terminal interface for Bitborough at `packages/cli`. Run commands with `npx tsx packages/cli/src/index.ts` from the project root.

## Quick Reference

```bash
# Create a new game
bitt new --size 32 --seed 42 --file game.json

# Place infrastructure
bitt place diesel 15 10 --file game.json   # power plant (prefer diesel over coal)
bitt place powerline 15 11 --file game.json
bitt place road 15 14 --file game.json
bitt place police 20 10 --file game.json
bitt place fire 22 10 --file game.json

# Zone tiles
bitt zone R 12 15 --file game.json   # Residential
bitt zone C 18 15 --file game.json   # Commercial
bitt zone I 24 15 --file game.json   # Industrial

# Advance time
bitt tick 12 --file game.json        # 12 months

# Inspect
bitt status --file game.json
bitt tile 12 15 --file game.json
bitt tiles 10 10 20 20 --file game.json
bitt buildings --file game.json
bitt docs                             # game documentation
```

## City Layout Pitfalls

### Power lines overwrite zones
Placing a power line ON a zoned tile removes the zone. Power lines and zones must be on **separate tiles**. Layout pattern:

```
Row 12: powerline powerline powerline powerline  (power distribution)
Row 13: (empty — power propagates to adjacent zones)
Row 14: road road road road road                  (road access)
Row 15: R    R    R    C    C    C               (zones — adjacent to power, not on it)
```

### Power doesn't jump gaps
Power propagates via flood-fill through adjacent power lines and powered buildings. A single empty tile breaks the chain. Always verify with `bitt tile x y` that zones show `"powered": true`.

### Zones need BOTH power AND road access
A zone won't develop buildings unless:
- `"powered": true` — connected to a power plant via power lines
- `"hasRoadAccess": true` — within 3 Manhattan distance of a road

### Roads don't conduct power
Roads and power lines are separate infrastructure. A road tile is NOT a power conductor.

## Recommended City Template (32x32)

```bash
GAME=/tmp/test-city.json
bitt new --size 32 --seed 42 --file $GAME

# Power plant
bitt place diesel 15 8 --file $GAME

# Power distribution (row 10, with vertical drops)
for x in $(seq 8 24); do bitt place powerline $x 10 --file $GAME; done
for y in $(seq 8 10); do bitt place powerline 15 $y --file $GAME; done  # connect plant

# Vertical power drops to reach zones (cols 9, 17, 23)
for y in $(seq 10 13); do bitt place powerline 9 $y --file $GAME; done
for y in $(seq 10 13); do bitt place powerline 17 $y --file $GAME; done
for y in $(seq 10 13); do bitt place powerline 23 $y --file $GAME; done

# Road grid
for x in $(seq 8 24); do bitt place road $x 12 --file $GAME; done   # main E-W road
for y in $(seq 12 18); do bitt place road 13 $y --file $GAME; done  # N-S connector
for y in $(seq 12 18); do bitt place road 19 $y --file $GAME; done  # N-S connector

# Zones (below road, adjacent to power drops — NOT on power lines)
for x in $(seq 10 12); do for y in $(seq 13 16); do bitt zone R $x $y --file $GAME; done; done
for x in $(seq 14 16); do for y in $(seq 13 16); do bitt zone C $x $y --file $GAME; done; done
for x in $(seq 20 22); do for y in $(seq 13 16); do bitt zone I $x $y --file $GAME; done; done

# Develop
bitt tick 60 --file $GAME
bitt status --file $GAME
bitt buildings --file $GAME
```

## Diagnostic Checklist

When zones aren't developing:

1. **Check power:** `bitt tile x y` — is `"powered": true`?
2. **Check road access:** `bitt tile x y` — is `"hasRoadAccess": true`?
3. **Check zone exists:** `bitt tile x y` — is `"zone"` set (not null)?
4. **Check demand:** `bitt status` — is R/C/I demand > 0?
5. **Check funds:** Negative funds can trigger bankruptcy

When population is 0 despite buildings:
- `bitt buildings` — check if any have `"state": "derelict"`
- Buildings need continued power to stay active

## Building Summary Script

```bash
bitt buildings --file $GAME | python3 -c "
import json, sys
buildings = json.load(sys.stdin)
by_type = {}
for b in buildings:
    by_type[b['id']] = by_type.get(b['id'], 0) + 1
print(f'Total: {len(buildings)}')
for t, n in sorted(by_type.items()):
    print(f'  {t}: {n}')
"
```

## Notes

- Use `--file` on every command (default is `game.json` in cwd)
- Prefer diesel plants — cheaper, smaller footprint
- `tick` output shows population at end of simulation, `status` re-reads from saved file
- Citizen simulation: 1 agent per 50 residents, A* commute routes, emergent traffic
- Save version is currently 5 (citizen registry included)
