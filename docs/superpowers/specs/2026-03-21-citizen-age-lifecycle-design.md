# Citizen Age Lifecycle Design

**Date:** 2026-03-21

## Goal

Add demographic depth to citizen agents: age histograms (children/working/elderly), probabilistic aging transitions, births, deaths, and satisfaction-driven migration. Population becomes an emergent property of these demographic flows rather than a direct simulation output.

## Context

Citizen agents (1 per ~50 residents) already exist with home/work/commerce assignments, cached A* routes, and satisfaction scores. This spec adds a demographic layer on top without changing the routing or traffic systems. It lays the groundwork for future features (schools, healthcare, age-specific jobs) that depend on age-structured populations.

## Data Model

### AgentDemographics

Added to the `Citizen` interface:

```typescript
interface AgentDemographics {
  children: number    // ages 0-17
  working: number     // ages 18-64
  elderly: number     // ages 65+
}
```

An agent's effective population is `children + working + elderly`. The building's `residents` field is kept in sync as the sum across all its agents' demographics.

New agents created via migration start as `{ children: 0, working: 50, elderly: 0 }` — a full working-age cohort.

### CitizenSummary Extension

`CitizenSummary` in `@bitborough/core` gains:

```typescript
totalChildren: number
totalWorking: number
totalElderly: number
birthsLastTick: number
deathsLastTick: number
netMigrationLastTick: number
```

### MonthlySnapshot Extension

`MonthlySnapshot` gains `births`, `deaths`, and `netMigration` fields (absolute counts per month, not per-capita rates) for historical tracking in the stats panel.

### SaveFile Changes

Save version bumps from 5 to 6. Each serialized agent gains a `demographics` field. Old saves without it restore as `{ children: 0, working: <agent_population>, elderly: 0 }`.

## Module: `simulation/demographics.ts`

A new module following the existing pattern (like `crime.ts`, `fire.ts`). Exports a single entry point:

```typescript
interface DemographicResult {
  births: number
  deaths: number
  netMigration: number
}

function demographicTick(
  registry: CitizenRegistry,
  map: GameMap,
  prng: PRNG,
  avgSatisfaction: number,
): DemographicResult
```

The function only mutates demographic counts on existing agents — it does not create or destroy agent objects. Agent creation/destruction is handled by `syncAgentsForBuilding` which runs after demographics (see Engine Integration).

Called monthly from `Engine.tick()` after zone development.

### Pass 1 — Aging Transitions

Probabilistic monthly transitions simulate aging without tracking individual ages:

- **Children → Working:** `1/216` chance per child per month. This averages to 18 years in the children bucket before transitioning.
- **Working → Elderly:** `1/564` chance per working-age person per month. This averages to 47 working years, with retirement around age 65.

These rates produce a natural age distribution over time. No per-person age tracking is needed.

### Pass 2 — Deaths

- **Elderly mortality:** `1/180` chance per elderly person per month. Averages to ~15 years after retirement, death around age 80.
- When an agent's total population (`children + working + elderly`) drops to 0, it is removed from the registry.

### Pass 3 — Births

- **Birth rate:** `0.0012` per working-age person per month (~1.4% annual rate). Produces ~1.7 children per household over a working lifetime.
- Births only occur for agents with `working > 0`.
- Each birth increments `children` on the agent.

### Pass 4 — Migration

Migration is driven by average citizen satisfaction:

- **Immigration** (satisfaction > 0.5): Rate scales linearly from 0 at 0.5 to `0.02 × totalWorking` per month at 1.0. Immigrants are working-age adults distributed to agents in buildings with spare capacity (`building.residents < BUILDING_DEFS[building.defId].capacity`). The function iterates residential buildings, finds ones with headroom, and increments the `working` count on their agents. If all existing buildings are full, no immigration occurs (the player needs to zone more residential).
- **Emigration** (satisfaction < 0.4): Rate scales linearly from 0 at 0.4 to `0.03 × totalWorking` per month at 0.0. Working-age adults leave from the least-satisfied agents first — agents are sorted by satisfaction and people are removed from the lowest-satisfaction agent until the emigration quota is met, then the next agent, etc. If an agent's total hits 0, it is removed.
- **Dead band** (0.4–0.5): No net migration. Gives the player breathing room before population starts declining.

Emigration is slightly faster than immigration at equivalent distances from the dead band, making population loss feel urgent.

All probabilistic transitions (aging, deaths, births, migration counts) use the engine's seeded `PRNG` for deterministic replay and save/load consistency.

## Engine Integration

The demographic tick runs **after** `updateZones`/`updateDensity` and the existing `syncAgentsForBuilding` loop. This is important: the zone/density system continues to handle building creation, upgrades, and initial capacity allocation. Demographics then operates on the agents that exist after zone development.

The existing `syncAgentsForBuilding` loop (which currently runs after density changes) is **replaced** by the demographic tick's migration pass for population changes. `syncAgentsForBuilding` remains only for initial agent creation when new buildings appear — it should no-op when agent count already matches. The `population += densityDelta` accumulation is removed; population is derived.

Tick order within the monthly block:

```
// 1. Existing simulation passes
calculateDemand(...)
calculateLandValues(...)
calculateCrime(...)
calculateFireCoverage(...)
updateFires(...)

// 2. Citizen traffic (existing)
citizenMonthlyTick(registry, map, roadGraph, trafficDensity)
citizenSummary = computeCitizenSummary(registry)

// 3. Zone development (existing — creates/upgrades buildings)
updateZones(...)
updateDensity(...)

// 4. Sync agents for NEW buildings from zone development
//    (uses pre-demographics residents — correct for new buildings)
for (const b of map.buildings) {
  if (b.state === 'active') {
    const def = BUILDING_DEFS[b.defId]
    if (def && def.category === BuildingCategory.Residential) {
      syncAgentsForBuilding(...)
    }
  }
}

// 5. Demographics (NEW — mutates demographic counts only, no agent creation)
const demo = demographicTick(registry, map, prng, citizenSummary.avgSatisfaction)

// 6. Sync building residents from agent demographics (NEW)
syncBuildingResidents(map, registry)

// 7. Re-sync agent count — demographics changed residents, so agent
//    count may need adjusting (e.g. deaths reduced population below
//    a samplingRatio threshold, or immigration grew it above one)
for (const b of map.buildings) { ... syncAgentsForBuilding(...) }

// 8. Refresh citizen summary with post-demographics data (NEW)
citizenSummary = computeCitizenSummary(registry)
this.population = computeTotalPopulation(map)

// 9. Budget, loans, events (existing)
```

Steps 6–8 are the key additions. The double `syncAgentsForBuilding` (steps 4 and 7) is intentional: step 4 handles new buildings from zone development, step 7 reconciles agent counts after demographic changes. Both are cheap no-ops when agent count already matches `Math.floor(building.residents / samplingRatio)`.

### syncBuildingResidents

A new utility in `citizens.ts` that iterates all residential buildings and sets each building's `residents` to the sum of `children + working + elderly` across its agents. Non-residential buildings are unaffected.

### computeTotalPopulation

Sums `building.residents` across all residential buildings. Replaces the `population += densityDelta` accumulation.

## Demand Integration

`calculateDemand` already accepts `CitizenSummary`. The new demographic fields feed demand naturally:

- **Dependency ratio penalty:** When `(totalChildren + totalElderly) / totalWorking > 0.6`, commercial and industrial demand are suppressed. Penalty = `min(0.15, (ratio - 0.6) × 0.3)`. A ratio of 0.6 means no penalty; a ratio of 1.1 (equal dependents and workers) hits the -0.15 cap. This signals a workforce shortage.
- **Children-heavy bonus:** When `totalChildren / (totalChildren + totalWorking + totalElderly) > 0.25`, residential demand gets a small boost of +0.05 (families want more housing). This is a soft signal, not a strong driver.
- All demographic modifiers are additive to existing demand values, applied before the final [-1, 1] clamp.

## Backwards Compatibility

- Save version 5 → 6.
- Agents without `demographics` restore as `{ children: 0, working: <existing_population>, elderly: 0 }`.
- `CitizenSummary` new fields default to 0 when absent.
- `MonthlySnapshot` new fields default to 0 when absent.

## Testing Strategy

### Unit tests (demographics.ts)

- **Aging transitions:** Run 216+ simulated months on an agent with 50 children, verify most transition to working. Run 564+ months, verify working transition to elderly.
- **Deaths:** Run many months on all-elderly agent, verify population declines toward 0.
- **Births:** Verify children count grows proportionally to working population.
- **Immigration:** Set satisfaction to 0.8, verify working-age adults added. Verify no migration in dead band (0.4–0.5).
- **Emigration:** Set satisfaction to 0.2, verify working-age adults removed. Verify least-satisfied agents lose people first.
- **Agent removal:** Verify agent is removed from registry when total population hits 0.

### Integration tests

- Engine with demographics: verify population grows organically over 5+ game years.
- Save/load round-trip preserves demographics.
- Emigration cascade: tank satisfaction, verify population declines.

### Edge cases

- Agent population hits 0 — removed cleanly, no phantom traffic.
- Building with no agents — residents stays 0.
- All-elderly city — population declines naturally through deaths.
- Max-satisfaction city — immigration fills buildings to capacity.

## Scope Boundaries

**In scope:** Age histograms on agents, probabilistic aging/birth/death, satisfaction-based migration, building resident sync, derived population, save/load v6, demand influence, summary stats, MonthlySnapshot extension.

**Out of scope (future specs):** Schools and education, healthcare for elderly, age-specific job requirements, household relationships, named citizens, age-based migration preferences.
