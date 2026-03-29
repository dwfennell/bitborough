# Pollution System — Planning Notes

> **Status:** DONE — Basic pollution propagation implemented in `simulation/pollution.ts`. See `environment-and-resilience.md` for remaining pollution features (parks as sinks, noise layer).

## What Was Implemented

`simulation/pollution.ts` exports `calculatePollution()` which:
- Runs monthly as part of `rebuildDerivedState()`
- Iterates all active buildings with `pollutionAmount > 0`
- Applies linear decay from building footprint using Manhattan distance
- Uses a `Float32Array` scratch buffer for accumulation, then clamps to `Uint8Array` (0-255)
- Sources: industrial buildings (all densities) and fossil power plants (diesel, coal)

The existing consumers (`calculateLandValues`, `computeDesirability`) now receive real values.

## Remaining Work (tracked elsewhere)

- Parks as pollution sinks — see `environment-and-resilience.md` Feature 2
- Noise layer — see `environment-and-resilience.md` Feature 3
- Traffic-generated pollution — not yet designed
