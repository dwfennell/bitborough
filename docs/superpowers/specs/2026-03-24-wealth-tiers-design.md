# Wealth Tiers Design Spec

## Overview

Add economic identity to citizen agents via three-tier wealth classification (Low/Mid/High), with tier-weighted satisfaction, location-weighted tier assignment, a neighborhood reputation layer providing temporal inertia, and mild Schelling same-tier preferences. Together these produce emergent spatial income sorting — including gentrification dynamics — without modifying the existing fill/drain or demand systems.

**Current state:** Citizens are homogeneous agents with a home, job route, commerce route, demographics histogram, and a scalar satisfaction score computed purely from route quality. Desirability is per-tile and tier-agnostic. Population growth flows through fill/drain using flat desirability scores.

**Architecture:** Tier logic lives in the agent layer. Fill/drain and desirability remain unchanged. Spatial sorting emerges from (a) location-weighted tier assignment using reputation, (b) tier-weighted satisfaction including environment factors, and (c) mild Schelling preference reinforcing clusters. A new reputation layer provides temporal inertia so neighborhood transitions happen over game-years, not instantly.

**Research sources:**
- `research/population-and-demographics.md` — income quintiles, Pareto distribution, wealth stratification
- `research/social-dynamics-and-segregation.md` — Schelling model, Tiebout sorting, tier-weighted preferences, school-based sorting
- `research/housing.md` — filtering theory, affordability thresholds
- `research/mechanics-roadmap.md` — items 2.5 (wealth tiers), 2.6 (migration)

---

## Data Model

### WealthTier type

```typescript
export type WealthTier = 1 | 2 | 3  // 1=Low, 2=Mid, 3=High
```

New export from `@bitborough/core`.

### Citizen extension

Add `wealthTier: WealthTier` to the existing `Citizen` interface in `citizens.ts`. Fixed at creation, does not change over time.

### CitizenSummary extension

Add `tierCounts: [low: number, mid: number, high: number]` to `CitizenSummary` in `core/state.ts`. Derived from agents in `computeCitizenSummary`, same pattern as the existing demographic aggregation.

### Reputation layer

A new `reputationLayer: Float32Array` (per-tile, 0.0–1.0) allocated alongside the existing crime/fire/pollution layers in Engine.ts. Updated once per monthly tick.

### No changes to Building or BuildingDef

Tier composition per building is derived from agents on demand (they already track `homeBuildingId`). The fill/drain data model is unchanged.

---

## Tier-Weighted Satisfaction

### Current formula

```
satisfaction = 1 - commutePenalty * 0.4 - jobPenalty - commercePenalty
```

Route-based only, no environment factors, no tier differentiation.

### New formula

All input variables are normalized to 0–1 ranges:

- `commuteNorm` = `route.length / MAX_ROUTE_LENGTH` (clamped 0–1). Currently `MAX_ROUTE_LENGTH = 60`.
- `jobless` = 1 if agent has no work building, 0 otherwise (binary flag).
- `noCommerce` = 1 if agent has no commerce building, 0 otherwise (binary flag).
- `crimeNorm` = `crimeLevel[idx] / 255`.
- `pollNorm` = `pollutionLevel[idx] / 255`.
- `fireNorm` = `fireCoverage[idx] / 255`.
- `parkNorm` = distance-decayed park bonus at the agent's home tile, using the existing `parkDesirabilityBonus()` from `desirability.ts`, divided by `RES_PARK_BONUS` (0.25) to normalize to 0–1.
- `schellingPenalty` = see Schelling Preference section.

The agent's home tile is resolved from the building's anchor position (`building.x`, `building.y`), looked up via `homeBuildingId` from the map's building list.

```
satisfaction(agent) =
  1.0
  - commuteNorm   * 0.4  * tierWeight[tier].commute
  - jobless       * 0.5  * tierWeight[tier].jobMatch
  - noCommerce    * 0.3  * tierWeight[tier].commerce
  - crimeNorm     * 0.3  * tierWeight[tier].crime
  - pollNorm      * 0.3  * tierWeight[tier].pollution
  + fireNorm      * 0.15 * tierWeight[tier].fire
  + parkNorm      * 0.25 * tierWeight[tier].park
  - schellingPenalty
```

Clamped to [0, 1].

At Mid tier (all weights 1.0), this produces the same base behavior as the current formula for route-based terms, plus the new environment terms. The maximum possible satisfaction is ~1.0 (short commute, job, commerce, no crime, no pollution, fire coverage, park nearby, no Schelling penalty). The minimum is 0.0 (clamped).

### Tier weight table

| Factor    | Low (1) | Mid (2) | High (3) |
|-----------|---------|---------|----------|
| Crime     | 0.8     | 1.0     | 1.4      |
| Pollution | 0.7     | 1.0     | 1.5      |
| Park      | 0.5     | 1.0     | 1.3      |
| Fire      | 0.8     | 1.0     | 1.2      |
| Commute   | 1.3     | 1.0     | 0.8      |
| Job match | 1.2     | 1.0     | 0.9      |
| Commerce  | 0.9     | 1.0     | 1.1      |

Source: `research/social-dynamics-and-segregation.md`, "Proposed: Wealth Tiers for Citizens" table.

**Behavioral implications:** Low-income agents prioritize commute and job access (practical concerns). High-income agents prioritize environment quality (crime, pollution, parks). Mid is baseline at 1.0 across the board.

### Implementation

`computeSatisfaction` gains access to tile layers and the agent's home building position. To keep function signatures manageable (and extensible for future layers like education), a `TileLayers` context object is passed through:

```typescript
interface TileLayers {
  crimeLevel: Uint8Array
  fireCoverage: Uint8Array
  pollutionLevel: Uint8Array
  reputationLayer: Float32Array
}
```

This is passed to `citizenMonthlyTick`, which passes it to `computeSatisfaction`. The agent's home building is looked up from `map.buildings` by `homeBuildingId` to get the anchor tile coordinates.

For the Schelling penalty, a `Map<string, [number, number, number]>` (buildingId → tier counts) is pre-computed once at the start of the satisfaction pass, then each agent's penalty is an O(1) lookup. This avoids O(N^2) per-agent scanning.

---

## Location-Weighted Tier Assignment

### Mechanism

When `createAgent` fires (via `syncAgentsForBuilding`), the tier is sampled using probabilities shifted by the building's reputation score rather than the flat 30/45/25 base distribution.

### Formula

```
For a tile with reputation r (0.0–1.0):

  tier1Weight = 0.30 * (1.5 - r)      // peaks at low reputation
  tier2Weight = 0.45                   // stable across range
  tier3Weight = 0.25 * (0.5 + r)      // peaks at high reputation

  Normalize to sum to 1.0, then sample using PRNG.
```

### Example distributions

| Reputation | Tier 1 (Low) | Tier 2 (Mid) | Tier 3 (High) |
|------------|-------------|-------------|---------------|
| 0.0        | ~44%        | ~44%        | ~12%          |
| 0.5        | ~30%        | ~45%        | ~25%          |
| 1.0        | ~15%        | ~46%        | ~39%          |

This gives a smooth gradient with no hard cutoffs. A gentrifying neighborhood with reputation climbing from 0.3 to 0.6 gradually shifts its new arrivals from low-income-heavy to mixed to mid/high-income-heavy.

The reputation value is read from the building's anchor tile (top-left corner, same as how desirability indexes into layers).

---

## Reputation Layer

### Purpose

Reputation provides temporal inertia so neighborhood character changes happen over game-years, not instantly. It's what makes gentrification a multi-phase process: services improve, mid-tier trickles in, reputation slowly rises, high-tier follows years later. Decline works the same way in reverse.

### Update formula

```
reputation(tile, t+1) = DECAY * reputation(tile, t) + (1 - DECAY) * currentQuality(tile)
```

`DECAY = 0.95` — reputation moves ~5% toward current conditions each month. A neighborhood takes roughly a game-year to shift meaningfully, several years to fully transition.

### Current quality derivation

All inputs normalized to 0–1:

```
currentQuality(tile) =
    (1 - crimeNorm)  * 0.35      // crimeLevel[idx] / 255
  + (1 - pollNorm)   * 0.25      // pollutionLevel[idx] / 255
  + fireNorm         * 0.15      // fireCoverage[idx] / 255
  + parkNorm         * 0.15      // parkDesirabilityBonus / RES_PARK_BONUS, capped at 1.0
  + occupancyHealth  * 0.10
```

`occupancyHealth` is computed from the building index: find the nearest residential building within a radius of 5 tiles (Manhattan distance). If found:

```
occupancyHealth = clamp(building.residents / (def.capacity * 0.7), 0, 1)
```

This reaches 1.0 at 70% occupancy and tapers linearly to 0 for empty buildings. If no residential building is within range, `occupancyHealth = 0`.

Computation is skipped for tiles with no zone (`zones[idx] === 0`) — water, empty terrain, and roads don't need reputation. Their reputation stays at whatever the decay brings them toward (effectively 0 over time), which is fine since no buildings will reference them.

### Properties

- Cannot be directly manipulated by the player — purely emergent from services and infrastructure
- Player's lever is indirect: invest in an area and wait for reputation to follow
- Initial value for new games: 0.5 (neutral)
- New file: `simulation/reputation.ts` containing `computeReputation()`, following the pattern of existing service influence modules

### Feeds into

1. **Tier assignment** (location-weighted sampling) — shifts who moves in

Reputation does not feed directly into satisfaction. Existing residents feel neighborhood change indirectly: as reputation shifts, the *tier mix* of new arrivals changes, which shifts the Schelling penalty for existing agents. This is a more natural feedback path than adding reputation as a direct satisfaction term.

---

## Schelling Preference

### Purpose

A mild same-tier preference that nudges agents toward clustering without forcing it. Creates feedback loops that reinforce spatial sorting over time.

### Formula

```
sameTierFraction = count of same-tier agents in building / total agents in building

if sameTierFraction < HOMOGENEITY_THRESHOLD:
  schellingPenalty = SCHELLING_WEIGHT * (1 - sameTierFraction / HOMOGENEITY_THRESHOLD)
else:
  schellingPenalty = 0
```

### Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `HOMOGENEITY_THRESHOLD` | 0.25 | Very mild preference — agent only needs 25% same-tier neighbors to be satisfied |
| `SCHELLING_WEIGHT` | 0.08 | Small but persistent push; not enough to override a great location |

### Edge cases

For buildings with only 1 agent: `sameTierFraction = 1.0`, penalty is always zero. Schelling dynamics only activate in medium/high density buildings with multiple agents, which is where income mixing matters.

### Feedback loop (gentrification example)

1. Services improve in a low-reputation area → reputation begins rising (slowly, due to decay)
2. Rising reputation shifts tier assignment probabilities → new arrivals skew toward mid/high-income
3. Incoming high-income agents feel a mild Schelling penalty (minority tier) but location quality compensates
4. As more high-income agents arrive, the Schelling penalty shifts: low-income agents in the building become the minority
5. Low-income agents' satisfaction drops (Schelling + they're more sensitive to commute/job factors which may not have improved)
6. Lower satisfaction feeds into the city-wide average → when buildings drain (via the existing fill/drain loop), the dissatisfied agents are removed

Note: the current drain mechanism in `syncAgentsForBuilding` removes agents from the end of the filtered list, not by satisfaction order. The gentrification dynamic works through a coarser mechanism: buildings in gentrifying areas fill with new high-tier agents while buildings in declining areas drain agents indiscriminately. Satisfaction-ordered removal could be added as a future refinement but is not required for the basic sorting dynamic.

---

## Integration

### Monthly tick order (Engine.ts)

```
1. Existing layers: power, crime, fire, pollution (unchanged)
2. NEW: computeReputation(reputationLayer, crimeLevel, pollutionLevel, fireCoverage, map, bldIdx)
3. Density tick: fill/drain (unchanged — tier-agnostic)
4. Citizen tick: syncAgents (tier assignment uses reputation), replan routes,
   compute satisfaction (tier-weighted with environment + Schelling)
5. Demographics tick (unchanged)
6. Demand calculation (unchanged — uses avgSatisfaction which now reflects tier dynamics)
```

Tier effects flow through satisfaction → citizen summary → demand feedback. Sorting emerges from who arrives (location-weighted) and who stays (tier-weighted satisfaction).

### New files

| File | Responsibility |
|------|---------------|
| `simulation/reputation.ts` | `computeReputation()` — monthly reputation layer update |
| `simulation/wealth-tiers.ts` | `TIER_WEIGHTS` table, `sampleWealthTier()`, constants |

### Modified files

| File | Change |
|------|--------|
| `core/state.ts` | Add `WealthTier` type, `tierCounts` to `CitizenSummary`, add `wealthTier` to saved agent schema in `SaveFile` |
| `citizens.ts` | Add `wealthTier` to `Citizen`. `createAgent` gains `reputationLayer` and `prng` params for location-weighted tier sampling. `syncAgentsForBuilding` gains `reputationLayer` and `prng` params (passed through from Engine). `citizenMonthlyTick` gains `TileLayers` param. `computeSatisfaction` gains `TileLayers`, building position, and per-building tier counts. `computeCitizenSummary` aggregates `tierCounts`. |
| `Engine.ts` | Allocate `reputationLayer: Float32Array`. Call `computeReputation` in monthly tick. Pass `TileLayers` to `citizenMonthlyTick`. Pass `reputationLayer` to `syncResidentialAgents` → `syncAgentsForBuilding` → `createAgent`. |

### Save/load

Version bump (v6 → v7). Migration for old saves applies during the `restore()` path in Engine.ts, which reconstructs agents from saved data via object spread (not via `createAgent`):

- Existing saved agent objects get `wealthTier: 2` (mid — safe default) added during deserialization
- `reputationLayer` initialized to 0.5 for all tiles via `Float32Array.fill(0.5)`
- `tierCounts` derived from agents on load (not persisted separately)

### Constants

| Constant | Value | Source |
|----------|-------|--------|
| `TIER_DISTRIBUTION` | `[0.30, 0.45, 0.25]` | Research quintile mapping (Q1-Q2→Low, Q3-Q4→Mid, Q5→High) |
| `TIER_WEIGHTS` | See weight table | `research/social-dynamics-and-segregation.md` |
| `REPUTATION_DECAY` | 0.95 | ~5% movement per month; game-year transition timescale |
| `SCHELLING_WEIGHT` | 0.08 | Mild push, won't override location quality |
| `HOMOGENEITY_THRESHOLD` | 0.25 | Low bar — only 25% same-tier needed |
| `TIER_LABELS` | `['Low', 'Mid', 'High']` | UI display |

---

## Out of Scope

- **Tier-aware fill/drain** — Fill/drain remains tier-agnostic. Sorting is agent-driven.
- **Tier mobility** — Agents don't change tier over time. Could be added later.
- **Housing cost / rent by tier** — Per-building rent levels are a separate feature (roadmap item 2.15).
- **Education service** — Schools are the next feature in the dependency chain; education weight is reserved in the tier table but not active until schools land.
- **Tax sensitivity by tier** — The research proposes per-tier tax weights (Low: 1.5, High: 0.6). Deferred until the per-tile tax productivity feature (roadmap item 2.3) lands.
- **UI changes** — Tier breakdown display, reputation overlay, etc. are implementation concerns not covered here.
