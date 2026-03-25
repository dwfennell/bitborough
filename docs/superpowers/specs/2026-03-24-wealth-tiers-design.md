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

```
satisfaction(agent) =
  1.0
  - commutePenalty   * 0.4  * tierWeight[tier].commute
  - jobPenalty       * 0.5  * tierWeight[tier].jobMatch
  - commercePenalty  * 0.3  * tierWeight[tier].commerce
  - crimeNorm        * 0.3  * tierWeight[tier].crime
  - pollutionNorm    * 0.3  * tierWeight[tier].pollution
  + fireCoverage     * 0.15 * tierWeight[tier].fire
  + parkBonus        * 0.25 * tierWeight[tier].park
  - schellingPenalty
```

Clamped to [0, 1].

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

`computeSatisfaction` gains access to tile layers (crime, pollution, fire coverage, park proximity) and the agent's home tile position. The citizen monthly tick already has access to the map; layers are passed through as additional parameters.

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

```
currentQuality(tile) =
    (1 - crimeNorm) * 0.35
  + (1 - pollNorm)  * 0.25
  + fireCoverage     * 0.15
  + parkBonus        * 0.15
  + occupancyHealth  * 0.10
```

`occupancyHealth` is 1.0 when the nearest residential building is well-occupied (~70%+), tapering toward 0 for vacant/derelict areas. Captures the "eyes on the street" effect.

### Properties

- Cannot be directly manipulated by the player — purely emergent from services and infrastructure
- Player's lever is indirect: invest in an area and wait for reputation to follow
- Initial value for new games: 0.5 (neutral)
- New file: `simulation/reputation.ts` containing `computeReputation()`, following the pattern of existing service influence modules

### Feeds into

1. **Tier assignment** (location-weighted sampling) — shifts who moves in
2. **Satisfaction** — as a minor additional factor so existing residents feel neighborhood change

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

1. A few high-income agents move into a mid-income building (location-weighted assignment as reputation rises)
2. They feel a mild Schelling penalty (minority tier)
3. But if reputation continues rising, more high-income agents arrive over subsequent months
4. Eventually high-income becomes the majority — penalty flips to remaining low-income agents
5. Low-income agents' satisfaction drops — they drain first — gentrification completes

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
| `core/state.ts` | Add `WealthTier` type, `tierCounts` to `CitizenSummary` |
| `citizens.ts` | Add `wealthTier` to `Citizen`, tier-weighted `computeSatisfaction`, location-weighted tier in `createAgent`, `tierCounts` in summary, Schelling check |
| `Engine.ts` | Allocate reputation layer, call `computeReputation` in tick, pass layers to citizen tick |

### Save/load

Version bump (v6 → v7). Migration for old saves:
- Existing agents get `wealthTier: 2` (mid — safe default)
- `reputationLayer` initialized to 0.5 for all tiles
- `tierCounts` derived from agents on load

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
