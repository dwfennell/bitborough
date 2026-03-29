# Building Density Progression — Design

> **Status:** DONE — Implemented and shipped.

## Overview

Three density tiers (Low → Medium → High) for all zone types (Residential, Commercial, Industrial). Buildings upgrade automatically based on infrastructure quality and city growth patterns, physically demolishing and rebuilding at the higher density.

Two new infrastructure types are introduced: **paved roads** (prerequisite for Medium density) and a basic **transit stop** building (prerequisite for High density).

Upgrade probability follows real-world urban density research (Clark's Law / Alonso-Muth-Mills model) — exponential decay from anchor points, with the dense core widening as the city grows.

See `research/urban-density-gradients.md` and `research/transit-oriented-development.md` for the research backing this design.

---

## New Infrastructure

### Paved Roads

- Player explicitly upgrades individual dirt road tiles to paved via an "upgrade road" tool
- Same footprint as dirt road, visually distinct (darker asphalt)
- Higher monthly maintenance cost than dirt roads
- Required within 3 tiles for Medium density to emerge

**Tiles needed:** paved road variants for all connection patterns (matching existing dirt road set)

### Transit Stop *(scoped for density anchoring only — full transit routing deferred)*

- Placeable 2×2 building (like police/fire station)
- Zone of influence: ~10 tile radius within which High density can emerge
- Has build cost + monthly maintenance
- No passenger routing or network simulation yet — purely a density anchor
- Required within 10 tiles for High density to emerge

**Tiles needed:** new 2×2 transit stop tile

---

## Upgrade Mechanics

### Two new simulation passes per tick

1. **Upgrade eligibility check** — evaluates each developed zone tile against upgrade criteria
2. **Under construction tracker** — manages demolish→rebuild window for upgrading tiles

### Low → Medium

**Requirements:**
- Paved road within 3 tiles
- City-wide population above threshold (~500, tunable)

**Probability:**
```
P = demand_factor × e^(-dist_to_center_of_mass / radius)
```
- `center_of_mass` = weighted average position of all developed tiles
- `radius` grows as city population increases — dense core widens naturally
- `demand_factor` = current zone demand (0.0–1.0)

### Medium → High

**Requirements:**
- Transit stop within 10 tiles
- >50% of neighbors within 3-tile radius already Medium or High density

**Probability:**
```
P = demand_factor × e^(-dist_to_nearest_transit / radius_high)
```
- Transit stops are the only anchor for High density (not center of mass)
- The critical mass requirement prevents isolated high-rises; density must cluster

### Upgrade Process

1. Eligible tile enters **under construction** state
2. Existing building is removed; construction sprite shown for 2–3 months
3. New higher-density building spawns (size drawn from weighted random of tier's size options)
4. If new building footprint > 1×1, it claims adjacent empty/same-zone tiles — waits if blocked

### Downgrade / Abandonment

- Infrastructure removed (road cut, transit demolished) → building becomes **derelict**
  - Derelict: no population/jobs/tax output, derelict sprite shown
- If derelict for **6 months** without infrastructure restored → downgrades one tier (triggers demolish→rebuild)
- Infrastructure restored before 6 months → building recovers automatically

---

## Building Sizes (with variance)

Sizes reflect real-world footprints. Larger footprints are chosen via weighted random at upgrade time.

| Zone | Low | Medium | High |
|------|-----|--------|------|
| Residential | 1×1 | 1×1 or 2×1 | 2×2 |
| Commercial | 1×1 | 1×1 or 2×2 | 2×2 or 2×3 |
| Industrial | 1×1 | 2×2 or 3×2 | 3×3 or 4×3 |

Real-world basis: towers have surprisingly small footprints (tall, not wide). Industrial complexes sprawl. High-density commercial skyscrapers vary more than residential towers.

---

## Building Stats

Multipliers are per-building (not per tile) — larger footprints are their own game balance reward.

### Residential — Population

| Tier | Multiplier | Basis |
|------|-----------|-------|
| Low | 1× | ~30 people/acre (single family) |
| Medium | ~10× | ~300 people/acre (mid-rise apartments) |
| High | ~33× | ~1,000+ people/acre (tower blocks) |

### Commercial — Jobs

| Tier | Multiplier | Basis |
|------|-----------|-------|
| Low | 1× | ~12–15 jobs/acre (small retail) |
| Medium | ~6× | ~40–100 jobs/acre (offices) |
| High | ~35× | ~60–110 jobs/acre for finance/professional services |

### Industrial — Split Stat (key mechanic)

| Tier | Jobs | Tax/Production Value | Basis |
|------|------|----------------------|-------|
| Low | 1× | 1× | Light industrial: 10–15 jobs/acre |
| Medium | ~1× | ~4× | Heavy industrial: 7–12 jobs/acre (capital intensive) |
| High | ~0.5× | ~10× | Large complexes: automated, high output, fewer workers |

**Design intent:** High-density industrial produces more economic output but *fewer jobs*. Players who over-industrialize at high density see tax revenue rise but unemployment climb, with downstream effects on residential demand and city mood. This reflects real-world industrial automation.

Tax values for Residential and Commercial scale proportionally with population/jobs respectively.

---

## Assets Required

### Road tiles
- Paved road variants (all connection patterns matching existing dirt road set)
- Optional: construction/transition sprite for road upgrade

### Zone buildings

| | Low | Medium | High |
|-|-----|--------|------|
| Residential | ✅ exists | ✅ SVG exists, needs wiring up | ❌ new 2×2 tile |
| Commercial | ✅ exists | ✅ SVG exists, needs wiring up | ❌ new 2×2 + 2×3 tile |
| Industrial | ✅ exists | ❌ new 2×2 + 3×2 tiles | ❌ new 3×3 + 4×3 tiles |

### Other
- Transit stop: new 2×2 tile
- Construction sprite: generic "under construction" tile (reused across all upgrade types)
- Derelict sprite variants per zone type (residential, commercial, industrial)

---

## Deferred / Future Work

- **Full transit routing** — transit stop is an anchor only for now; passenger simulation, bus routes, rail networks deferred
- **Distinct building variants** — multiple visual variants per tier so neighborhoods look organic, not repetitive
- **Pollution system redesign** — how does pollution scale with density? Per-tile vs per-building? Wind drift, long-term contamination. See `design/advanced-features.md`
- **Downgrade visual polish** — fire/crime events resetting density tier
- **High density commercial agglomeration bonus** — real cities show superlinear economic output in CBDs
