# Environment and Resilience Milestone

> **Status:** ACTIVE — 1 of 5 features implemented.
>
> | Feature | Status | Notes |
> |---------|--------|-------|
> | 1. Pollution Propagation | DONE | `simulation/pollution.ts` — linear decay from building footprint, runs monthly |
> | 2. Parks as Pollution Sinks | TODO | |
> | 3. Noise Layer | TODO | |
> | 4. Flooding Risk | TODO | |
> | 5. Building Codes Policy | TODO | |
>
> **Stale references:** The research documents cited below (`research/environment-and-sustainability.md`, `research/disaster-and-resilience.md`) were never created.

Five features that give environmental systems real gameplay weight: pollution that matters, parks that fight it, noise that shapes neighborhoods, floods that punish careless development, and building codes that let the player invest in resilience.

---

## 1. Pollution Propagation (DONE)

> Implemented in `simulation/pollution.ts`. Runs monthly via `rebuildDerivedState()`. Uses `Float32Array` scratch buffer, clamps to `Uint8Array`.

**Unblocks:** Parks as Pollution Sinks, Noise Layer (pattern reuse), and indirectly Flooding (impervious surface accounting).

### Gameplay Purpose

Industrial buildings and fossil-fuel power plants define `pollutionRadius` and `pollutionAmount` on their `BuildingDef`. The `pollutionLevel: Uint8Array` feeds into `calculateLandValues` and `computeDesirability`. Pollution propagation makes industrial placement a real tradeoff: jobs and tax revenue versus depressed residential land values and desirability nearby.

### Data Model Changes

None. All structures already exist:

| Structure | Location | Status |
|-----------|----------|--------|
| `pollutionLevel: Uint8Array` | `Engine.ts` line 88 | Allocated, zeroed, passed to consumers, exposed in `GameState` |
| `BuildingDef.pollutionRadius` | `buildings-registry.ts` | Defined on all buildings (0 for non-polluters) |
| `BuildingDef.pollutionAmount` | `buildings-registry.ts` | Defined on all buildings (0 for non-polluters) |
| Land value penalty | `land-value.ts` line 41 | `value -= pollutionLevel[idx] * 0.5` |
| Desirability penalty | `desirability.ts` line 64-70 | `pollNorm = pollutionLevel[idx] / 255; score -= pollNorm * 0.3` |

### Algorithm

New file: `simulation/pollution.ts` exporting `calculatePollution()`.

Called monthly in `Engine.tick()`, after building index rebuild and before `calculateLandValues`.

```
calculatePollution(map, pollutionLevel, bldIdx):
  1. Zero the pollutionLevel array.
  2. For each active building b with pollutionAmount > 0:
       R = b.pollutionRadius
       A = b.pollutionAmount
       For each tile (tx, ty) within Manhattan distance R of the building footprint:
         d = Manhattan distance from (tx, ty) to nearest footprint tile
         contribution = A * max(0, 1 - d / R)   // linear decay
         pollutionLevel[ty * width + tx] += contribution
  3. Clamp every entry to [0, 255].
```

Linear decay chosen over Lorentzian (`A / (1 + (d/d_half)^2)`) because it is simpler, produces a hard cutoff at radius R (no long tail to iterate over), and matches the existing fire/crime influence pattern. The research documents both; linear is adequate for a tile-based sim (see `research/environment-and-sustainability.md`, "Decay with Distance" section).

### Integration Points

| Integration | File | Change |
|-------------|------|--------|
| Monthly tick | `Engine.ts` | Call `calculatePollution(this.map, this.pollutionLevel, this.bldIdx)` after building index rebuild, before `calculateLandValues` |
| Save/restore | `Engine.ts` | No change needed; `pollutionLevel` is recomputed from buildings, not persisted |

### Key Constants

| Constant | Value | Source |
|----------|-------|--------|
| `ind.low` pollutionRadius / pollutionAmount | 3 / 10 | `buildings-registry.ts` |
| `ind.med` | 4 / 20 | `buildings-registry.ts` |
| `ind.med.b` | 4 / 24 | `buildings-registry.ts` |
| `ind.high` | 6 / 40 | `buildings-registry.ts` |
| `ind.high.b` | 6 / 48 | `buildings-registry.ts` |
| `power.diesel` | 2 / 5 | `buildings-registry.ts` |
| `power.coal` | 6 / 20 | `buildings-registry.ts` |
| `power.nuclear` | 0 / 0 | `buildings-registry.ts` |
| Land value penalty factor | 0.5 per pollution unit | `land-value.ts` line 41 |
| Desirability penalty weight | 0.3 (normalized) | `desirability.ts` line 9 |

### Research Source

- `research/environment-and-sustainability.md` -- "Pollution Dispersion" section, linear and Lorentzian decay formulas
- `research/mechanics-roadmap.md` -- item 1.1

---

## 2. Parks as Pollution Sinks

### Gameplay Purpose

Parks currently provide a flat desirability bonus and a distance-decayed land value bonus, but they have no interaction with pollution. Making parks absorb nearby pollution gives the player a tool to mitigate industrial impact: buffer zones of parks between industrial and residential districts become a deliberate strategy, not just aesthetic.

### Data Model Changes

None. Parks are already `special.park` buildings in the building index. The pollution array from Feature 1 is the only input.

### Algorithm

Integrated into `calculatePollution()` as a post-processing step after source contributions are summed:

```
// After step 2 (accumulate source contributions), before step 3 (clamp):

For each active building b where b.defId === 'special.park':
  For each tile (tx, ty) within Manhattan distance PARK_ABSORB_RADIUS of the park:
    d = Manhattan distance from (tx, ty) to (b.x, b.y)
    reduction = PARK_ABSORB_AMOUNT * max(0, 1 - d / PARK_ABSORB_RADIUS)
    pollutionLevel[ty * width + tx] -= reduction

// Then clamp to [0, 255] (step 3 catches negative values).
```

This is subtracted *after* all sources are summed, so a park in a zero-pollution area has no effect (floor of 0). A park adjacent to a factory meaningfully reduces pollution on the tiles between them.

### Integration Points

Same function as Feature 1. No additional Engine changes.

### Key Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `PARK_ABSORB_RADIUS` | 4 | Matches existing `parkBonus` radius in `land-value.ts` (line 74). Keeps park influence area consistent across systems. |
| `PARK_ABSORB_AMOUNT` | 8 | A single park tile at distance 0 reduces pollution by 8 units. At the edge of an `ind.low` zone (pollutionAmount=10, distance 3 from source, contribution ~3), one park adjacent erases it. Two parks can clear a diesel plant's footprint. Tunable. |

### Research Source

- `research/environment-and-sustainability.md` -- "Green Infrastructure" section: urban trees remove PM10 5-20% locally; parks reduce runoff and provide air filtration
- `research/mechanics-roadmap.md` -- item 1.12

---

## 3. Noise Layer

### Gameplay Purpose

Pollution captures industrial and power plant impact, but roads and dense commercial areas also degrade residential quality in ways pollution does not model. A noise layer creates a second environmental pressure: residential desirability drops near busy roads and industrial zones, rewarding players who buffer residential areas or use quieter road layouts. It also provides a visual overlay distinct from pollution.

### Data Model Changes

| Change | File | Detail |
|--------|------|--------|
| New layer | `Engine.ts` | `private noiseLevel: Uint8Array` -- allocated at `new Uint8Array(size)` alongside existing layers |
| Expose in GameState | `packages/core/src/state.ts` | Add `noiseLevel: Uint8Array` to `GameState` interface |
| Expose in getState | `Engine.ts` | Add `noiseLevel: this.noiseLevel` to `getState()` return |
| Desirability integration | `desirability.ts` | New penalty term in `residentialDesirability()` |

No save/restore change needed: noise is recomputed from buildings and infrastructure each month, like pollution.

### Algorithm

New file: `simulation/noise.ts` exporting `calculateNoise()`.

```
calculateNoise(map, noiseLevel, bldIdx, trafficDensity):
  1. Zero the noiseLevel array.

  2. Road noise — for each tile with Infrastructure.Road:
       baseNoise = ROAD_BASE_NOISE
       // Scale by traffic if available
       if trafficDensity[idx] > 0:
         baseNoise = ROAD_BASE_NOISE + (trafficDensity[idx] / 255) * ROAD_TRAFFIC_NOISE_BONUS
       For each tile within Manhattan distance ROAD_NOISE_RADIUS:
         d = Manhattan distance
         contribution = baseNoise * max(0, 1 - d / ROAD_NOISE_RADIUS)
         noiseLevel[target] += contribution

  3. Industrial noise — for each active building with category Industrial:
       A = INDUSTRIAL_NOISE_AMOUNT[density]
       R = INDUSTRIAL_NOISE_RADIUS[density]
       For each tile within Manhattan distance R of footprint:
         d = Manhattan distance to nearest footprint tile
         contribution = A * max(0, 1 - d / R)
         noiseLevel[target] += contribution

  4. Clamp every entry to [0, 255].
```

Road noise uses linear decay per tile, which is a simplification of the research's log-distance model (`-3 to -4.5 dB per doubling`). For a tile-based sim with small radii (3-5 tiles), linear decay produces a similar gameplay feel without needing logarithmic math.

### Integration Points

| Integration | File | Change |
|-------------|------|--------|
| Monthly tick | `Engine.ts` | Call `calculateNoise()` after pollution, before `calculateLandValues` |
| Desirability | `desirability.ts` | Pass `noiseLevel` to `computeDesirability()`; add residential penalty: `noiseNorm = noiseLevel[idx] / 255; score -= noiseNorm * RES_NOISE_PENALTY` |
| Land value | `land-value.ts` | Optional: `value -= noiseLevel[idx] * NOISE_LAND_VALUE_FACTOR` |

### Key Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `ROAD_BASE_NOISE` | 3 | A single quiet road contributes mildly. Clustered roads accumulate. |
| `ROAD_TRAFFIC_NOISE_BONUS` | 5 | Heavy traffic (density 255) adds up to 5 more, for a max of 8 per road tile. |
| `ROAD_NOISE_RADIUS` | 3 | Roads are line sources; noise drops off quickly. Research: -3 to -4.5 dB per doubling. 3 tiles keeps computation tight. |
| `INDUSTRIAL_NOISE_AMOUNT` | Low: 10, Med: 18, High: 28 | Scales with density tier. |
| `INDUSTRIAL_NOISE_RADIUS` | Low: 3, Med: 5, High: 7 | Larger factories are louder further out. |
| `RES_NOISE_PENALTY` | 0.15 | Weaker than pollution (0.3) because noise is more pervasive but less severe. |
| `NOISE_LAND_VALUE_FACTOR` | 0.2 | Research: 0.2-1.2% property value loss per dB above 55 dBA (NDI). Scaled for 0-255 range. |

### Research Source

- `research/environment-and-sustainability.md` -- "Noise Pollution" section: traffic noise models, NDI property value impact, attenuation formula
- `research/mechanics-roadmap.md` -- item 3.18

---

## 4. Flooding Risk

### Gameplay Purpose

Water-adjacent low-lying tiles are attractive (waterfront land value bonus of +15 per adjacent water tile in `land-value.ts`). Flooding adds the flip side: those same tiles face periodic damage from storm events, especially when surrounded by impervious surfaces. This creates a genuine risk/reward tension and gives parks, green space, and careful zoning a role in flood mitigation.

### Data Model Changes

| Change | File | Detail |
|--------|------|--------|
| Flood risk layer | `Engine.ts` | `private floodRisk: Uint8Array` -- per-tile 0-255 risk score, recomputed monthly |
| Flood state | `Engine.ts` | `private floodState: FloodState` -- tracks active flood event and cooldown |
| Expose in GameState | `packages/core/src/state.ts` | Add `floodRisk: Uint8Array` and `activeFloods: number[]` |
| Building damage | `packages/core/src/state.ts` | Add optional `damaged?: boolean` and `damageRepairCost?: number` to `Building` interface |
| New event types | `packages/core/src/state.ts` | Add `'storm'` and `'flood_damage'` to `GameEvent.type` |
| Save/restore | `Engine.ts` | Persist `floodState` (cooldown timer, active floods) |

### Algorithm

New file: `simulation/flooding.ts` exporting `calculateFloodRisk()` and `updateFlooding()`.

**Flood risk calculation** (monthly):

```
calculateFloodRisk(map, floodRisk, bldIdx):
  1. Zero the floodRisk array.
  2. For each tile:
     a. Skip if terrain is Water.
     b. waterProximity = count of Water tiles within Manhattan distance FLOOD_WATER_RADIUS
        If waterProximity === 0, skip (no flood risk away from water).
     c. elevationFactor = max(0, 1 - elevation[idx] / FLOOD_ELEVATION_SAFE)
        Tiles at or above FLOOD_ELEVATION_SAFE have zero risk.
        Tiles at elevation 0 have maximum risk.
     d. imperviousFraction = count tiles within IMPERVIOUS_SCAN_RADIUS that have
        (Road | zone with building | non-park building) / total scanned tiles.
        Parks count as pervious. Undeveloped land counts as pervious.
     e. floodRisk[idx] = clamp(
          waterProximity * WATER_PROXIMITY_WEIGHT
          * elevationFactor
          * (0.3 + 0.7 * imperviousFraction),
          0, 255
        )
```

The impervious surface multiplier is the central insight from the research: watersheds with >25% impervious cover show severe water quality and flood impairment. Dense urban areas (75-100% impervious) produce 4x the peak runoff of natural ground.

**Storm events** (monthly, probabilistic):

```
updateFlooding(map, floodRisk, floodState, prng, bldIdx, buildingCodes):
  1. If cooldown > 0, decrement and return.
  2. Roll for storm event: P(storm) = STORM_BASE_PROBABILITY per month.
  3. If storm triggers:
     a. Set cooldown = STORM_COOLDOWN_MONTHS.
     b. stormIntensity = prng.next() * 0.5 + 0.5   // 0.5-1.0
     c. For each tile where floodRisk[idx] > 0:
        floodChance = (floodRisk[idx] / 255) * stormIntensity * FLOOD_DAMAGE_PROBABILITY
        If prng.next() < floodChance:
          - Mark tile as flooded (add to activeFloods).
          - If building exists on tile:
            damageRoll = prng.next()
            codeFactor = buildingCodes ? BUILDING_CODE_DAMAGE_REDUCTION : 1.0
            If damageRoll < BUILDING_DAMAGE_CHANCE * codeFactor:
              building.damaged = true
              building.damageRepairCost = building.def.cost * REPAIR_COST_FRACTION
     d. Emit 'storm' event. If any buildings damaged, emit 'flood_damage' event.
  4. Clear activeFloods after 1 tick (visual only).
```

Damaged buildings stop functioning (no residents, no jobs, no tax revenue) until repaired. Repair costs are deducted from city funds automatically or the player can bulldoze.

### Integration Points

| Integration | File | Change |
|-------------|------|--------|
| Monthly tick | `Engine.ts` | Call `calculateFloodRisk()` then `updateFlooding()` after fire updates |
| Budget | `simulation/budget.ts` | Damaged buildings contribute zero tax revenue |
| Population | `simulation/density.ts` | Damaged residential buildings have zero residents |
| Repair action | `Engine.ts` | New method `repairBuilding(x, y): Result` that spends funds and clears damage |

### Key Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `FLOOD_WATER_RADIUS` | 4 | Tiles within 4 Manhattan of water are at risk. |
| `FLOOD_ELEVATION_SAFE` | 180 | Elevation values are 0-255. Tiles at 180+ are safe from flooding. Tiles at lower elevation face proportionally higher risk. |
| `WATER_PROXIMITY_WEIGHT` | 20 | Scales water adjacency count into the 0-255 risk range. 4 adjacent water tiles * 20 * elevationFactor * imperviousFraction. |
| `IMPERVIOUS_SCAN_RADIUS` | 6 | Area around each tile to measure imperviousness. |
| `STORM_BASE_PROBABILITY` | 0.03 | ~3% per month = roughly one storm every ~3 years. |
| `STORM_COOLDOWN_MONTHS` | 6 | Minimum 6 months between storm events. |
| `FLOOD_DAMAGE_PROBABILITY` | 0.4 | Given a tile is at-risk and a storm hits, 40% chance of actual flooding. |
| `BUILDING_DAMAGE_CHANCE` | 0.6 | Given flooding, 60% chance the building takes damage. |
| `REPAIR_COST_FRACTION` | 0.3 | Repair costs 30% of original building cost. Based on HAZUS "Moderate" damage state (10-25% of replacement). Rounded up for gameplay impact. |
| `BUILDING_CODE_DAMAGE_REDUCTION` | 0.4 | With building codes active, damage chance multiplied by 0.4 (60% reduction). |

### Research Source

- `research/disaster-and-resilience.md` -- "Flooding Mechanics" section: impervious surface runoff table, Rational Method, FEMA floodplain mapping, depth-damage curves
- `research/environment-and-sustainability.md` -- "Water Pollution" section: impervious surface as strongest predictor of stream health, >25% threshold
- `research/mechanics-roadmap.md` -- item 3.15 (Stormwater as density constraint)

---

## 5. Building Codes Policy

### Gameplay Purpose

A city-wide policy toggle that increases all construction costs but reduces damage from disasters (currently fire and flooding). This is the player's primary resilience investment. The research is emphatic: building codes are the single most cost-effective resilience strategy, with FEMA estimating $11 saved per $1 invested. In gameplay, it creates a budget tension: spend more upfront to avoid catastrophic losses later, or save money and gamble.

### Data Model Changes

| Change | File | Detail |
|--------|------|--------|
| Policy state | `Engine.ts` | `private buildingCodes: boolean = false` |
| Policy toggle | `Engine.ts` | New method `setBuildingCodes(enabled: boolean): void` |
| Expose in GameState | `packages/core/src/state.ts` | Add `buildingCodes: boolean` to `GameState` |
| Save/restore | `Engine.ts` | Persist `buildingCodes` in save state |

### Algorithm

Building codes is a modifier applied to two systems:

**Construction cost increase:**

```
// In placeBuilding(), zones.ts, and density.ts (anywhere a building is created):
effectiveCost = baseCost * (buildingCodes ? BUILDING_CODE_COST_MULTIPLIER : 1.0)
```

This applies to player-placed buildings (power plants, service buildings, parks) and implicitly to zone development (which is free to the player but the cost factor can gate density upgrades by requiring higher land values).

For density upgrades in `density.ts`, the cost multiplier is not charged to the player directly (zone buildings are auto-placed), but the upgrade probability is reduced slightly to represent slower development under stricter codes:

```
// In density upgrade probability:
codeFactor = buildingCodes ? BUILDING_CODE_UPGRADE_SLOWDOWN : 1.0
P = baseProb * codeFactor
```

**Disaster damage reduction:**

```
// Fire system (services/fire.ts):
// Reduce fire ignition probability and spread chance when building codes are active.
effectiveBaseRisk = baseRisk * (buildingCodes ? BUILDING_CODE_FIRE_REDUCTION : 1.0)
effectiveSpreadChance = spreadChance * (buildingCodes ? BUILDING_CODE_FIRE_REDUCTION : 1.0)

// Flood system (simulation/flooding.ts):
// Reduce building damage chance (already shown in Feature 4).
codeFactor = buildingCodes ? BUILDING_CODE_DAMAGE_REDUCTION : 1.0
```

### Integration Points

| Integration | File | Change |
|-------------|------|--------|
| Building placement | `Engine.ts` | Apply cost multiplier in `placeBuilding()` |
| Fire ignition/spread | `services/fire.ts` | Accept `buildingCodes` parameter; reduce base risk and spread chance |
| Flood damage | `simulation/flooding.ts` | Accept `buildingCodes` parameter (Feature 4) |
| Budget display | `simulation/budget.ts` | Optionally note the policy in budget info |
| Monthly tick | `Engine.ts` | Pass `this.buildingCodes` to `updateFires()` and `updateFlooding()` |

### Key Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `BUILDING_CODE_COST_MULTIPLIER` | 1.15 | 15% increase in construction costs. Research: Cat-3 wind-resistant construction adds 1-3% to building cost; flood elevation is cheap; seismic adds more. 15% is a round number that is noticeable but not prohibitive. |
| `BUILDING_CODE_UPGRADE_SLOWDOWN` | 0.85 | 15% slower density upgrades (stricter permitting). |
| `BUILDING_CODE_FIRE_REDUCTION` | 0.4 | 60% reduction in fire ignition and spread. Research: sprinklered buildings have 97% containment; WUI codes reduce ignition 60-80%. |
| `BUILDING_CODE_DAMAGE_REDUCTION` | 0.4 | 60% reduction in flood building damage chance. Research: elevation above BFE reduces expected annual losses 50-70%. |

### Research Source

- `research/disaster-and-resilience.md` -- "Building Codes and Standards" section: $1 invested saves $11, code provisions table, wind/flood/fire/seismic code effects
- `research/mechanics-roadmap.md` -- item 4.43

---

## Implementation Order

Features are ordered by dependency:

| Order | Feature | Depends On | New Files | Estimated Scope |
|-------|---------|------------|-----------|-----------------|
| 1 | Pollution Propagation | Nothing (all scaffolding exists) | `simulation/pollution.ts` | Small |
| 2 | Parks as Pollution Sinks | Feature 1 | Same file | Small |
| 3 | Building Codes Policy | Nothing | None (modifications only) | Small |
| 4 | Noise Layer | Feature 1 (pattern, not data) | `simulation/noise.ts` | Medium |
| 5 | Flooding Risk | Feature 3 (building codes param) | `simulation/flooding.ts` | Medium |

Features 1 and 2 should ship together since sink logic is part of the same calculation. Feature 3 is independent and small. Feature 4 reuses the same linear-decay-over-Manhattan-distance pattern established by Feature 1. Feature 5 is the most complex (new event type, building damage state, repair action) and benefits from building codes being available first.

---

## Testing Strategy

Each feature follows red/green TDD. Key test cases per feature:

**Pollution Propagation:**
- Industrial building at (10, 10) with pollutionAmount 10 / pollutionRadius 3: verify pollution > 0 at distance 1, pollution === 0 at distance 4.
- Two adjacent industrial buildings: pollution values stack (additive).
- Bulldoze the only polluter: after next monthly tick, all pollution is 0.
- Pollution is clamped to 255 (stack many sources).

**Parks as Pollution Sinks:**
- Park adjacent to industrial zone: pollution at park location is lower than without park.
- Park far from any source: no negative pollution (clamped to 0).
- Multiple parks stack absorption.

**Noise Layer:**
- Road tile generates noise within ROAD_NOISE_RADIUS.
- Heavy-traffic road generates more noise than empty road.
- Industrial building generates noise proportional to density tier.
- Noise feeds into residential desirability (score lower with noise).

**Flooding Risk:**
- Tile adjacent to water at low elevation has floodRisk > 0.
- Tile far from water has floodRisk === 0.
- High-impervious area near water has higher risk than park-buffered area.
- Storm event can damage buildings; damaged buildings produce zero residents/jobs.
- Repair action clears damage and costs funds.

**Building Codes:**
- Toggle on: placeBuilding cost is 15% higher.
- Toggle on: fire base risk is reduced (fewer fires ignite over N months).
- Toggle on: flood damage probability is lower.
- Toggle off then on: applies prospectively (no retroactive changes).
