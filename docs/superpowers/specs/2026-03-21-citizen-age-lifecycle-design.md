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
birthRate: number       // births last tick
deathRate: number       // deaths last tick
netMigration: number    // net migration last tick
```

### MonthlySnapshot Extension

`MonthlySnapshot` gains `births`, `deaths`, and `netMigration` fields for historical tracking in the stats panel.

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
  roadGraph: RoadGraph,
  avgSatisfaction: number,
): DemographicResult
```

Called monthly from `Engine.tick()` after the citizen monthly tick.

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

- **Immigration** (satisfaction > 0.5): Rate scales linearly from 0 at 0.5 to `0.02 × totalWorking` per month at 1.0. New working-age adults are added to existing agents in buildings with spare capacity, or new agents are spawned via `syncAgentsForBuilding` if needed.
- **Emigration** (satisfaction < 0.4): Rate scales linearly from 0 at 0.4 to `0.03 × totalWorking` per month at 0.0. Working-age adults leave from the least-satisfied agents first. If an agent's total hits 0, it is removed.
- **Dead band** (0.4–0.5): No net migration. Gives the player breathing room before population starts declining.

Emigration is slightly faster than immigration at equivalent distances from the dead band, making population loss feel urgent.

## Engine Integration

In `Engine.tick()`, after the existing citizen block:

```
// Existing
citizenMonthlyTick(registry, map, roadGraph, trafficDensity)
citizenSummary = computeCitizenSummary(registry)

// New
const demo = demographicTick(registry, map, roadGraph, citizenSummary.avgSatisfaction)
syncBuildingResidents(map, registry)
this.population = computeTotalPopulation(map)
```

### syncBuildingResidents

A new utility in `citizens.ts` that iterates all buildings and sets each building's `residents` to the sum of `children + working + elderly` across its agents. This replaces the current implicit population tracking.

### computeTotalPopulation

Sums `building.residents` across all buildings. Replaces the current `population += densityDelta` approach. Population is now fully derived from demographics.

## Demand Integration

`calculateDemand` already accepts `CitizenSummary`. The new demographic fields feed demand naturally:

- High `totalChildren / totalWorking` ratio (many dependents, few workers) suppresses commercial and industrial demand slightly — a workforce shortage signal.
- High `totalElderly / totalWorking` ratio has the same but weaker effect.
- The existing satisfaction-based signals already capture the main dynamics. Demographic demand modifiers are additive, clamped to ±0.15.

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
