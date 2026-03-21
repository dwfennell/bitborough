# Transit-Oriented Development (TOD)

> How transit stations act as density anchors, driving polycentric city evolution and shaping land use patterns.

## Table of Contents

- [Core Pattern](#core-pattern)
- [Monocentricity to Polycentricity](#monocentricity--polycentricity)
- [TOD Design Principles](#tod-design-principles)
- [Application to Bitborough](#application-to-bitborough)
- [Spawning Heuristic](#spawning-heuristic)
- [Employment Density by Zone Type](#employment-density-by-zone-type-research-backed)
- [Cross-References](#cross-references)
- [Sources](#sources)

## Core Pattern

Transit stations act as secondary density anchors, creating sub-peaks in the exponential density gradient. Development clusters around stations because transit access reduces effective commute cost — the same mechanism that drives density toward city centers.

## Monocentricity → Polycentricity

Cities evolve in a predictable pattern:

1. **Early city**: single CBD, monocentric density cone
2. **Transit expansion**: stations create accessibility nodes outside the core
3. **Polycentric emergence**: secondary density clusters form around major stations
4. **Mature city**: multiple centers, each with its own local density gradient

Tokyo is a canonical example: dense transit network → multiple sub-centers → decentralized but high-density urban form.

## TOD Design Principles

- **Catchment area**: TOD effects are typically strongest within 400–800m of a station (~5–10 minute walk)
- **Density threshold**: TOD requires minimum existing density to take hold — a station in an empty area has weak effect
- **Land use mix**: real TOD combines residential + commercial at high density around stations

## Application to Bitborough

- Transit stations are density magnets, not just gates
- High-density upgrade probability uses transit stations as primary anchors (not just city center of mass)
- The TOD radius in-game can be simplified to a fixed tile distance (e.g. 8–12 tiles)
- Building a station in a medium-density area accelerates high-density clustering around it
- Commercial zones benefit more strongly from transit proximity than residential (mirrors real patterns)

## Spawning Heuristic

```
P(medium_upgrade) = demand_factor × e^(-dist_to_nearest_anchor / radius_medium)
P(high_upgrade)   = demand_factor × e^(-dist_to_transit_station / radius_high)
```

Where `anchors` for medium = [city center of mass, transit stations] and `anchors` for high = [transit stations only].

## Employment Density by Zone Type (Research-Backed)

From Oregon employment density standards and City Observatory research:

| Zone Type | Low Density | Medium Density | High Density |
|-----------|-------------|----------------|--------------|
| Commercial | ~12–15 jobs/acre | ~40–100 jobs/acre | ~60–110 jobs/acre (finance/professional) |
| Industrial (light) | ~10–15 jobs/acre | ~7–12 jobs/acre | decreases with automation |
| Industrial (heavy) | — | ~7–12 jobs/acre | <7 jobs/acre |

**Key insight:** Industrial employment density *decreases* at higher density tiers as operations become capital-intensive and automated. High-density industrial = more economic output, fewer jobs. This creates a meaningful gameplay tradeoff.

Sources for employment density:
- [Employment Density Survey — ECONorthwest](https://www.piercecountywa.gov/DocumentCenter/View/100439/BLP-ECONW-Employment-Density-Survey)
- [Job Density — City Observatory](https://cityobservatory.org/job-density-a-new-metric-for-urban-economies/)
- [Employment Density Assumptions — Clark County WA](https://clark.wa.gov/sites/default/files/dept/files/community-planning/Buildable%20Lands/2_%20Employment%20Density%20memo.pdf)

## Cross-References

- [Urban Density Gradients](./urban-density-gradients.md) — The baseline density model that TOD modifies with secondary peaks
- [Transportation and Traffic](./transportation-and-traffic.md) — Transit modes, ridership drivers, and mode choice
- [Economy and Employment](./economy-and-employment.md) — Employment density patterns that TOD concentrates

## Sources

- [Transit-oriented development with urban sprawl — Tokyo case study](https://www.sciencedirect.com/science/article/abs/pii/S0264837721005779)
- [Modelling volumetric growth around new transit stations](https://www.nature.com/articles/s42949-024-00171-y)
- [Identifying Urban Structure Based on TOD](https://www.mdpi.com/2071-1050/11/24/7241)
- [Transportation and Urban Form](https://transportgeography.org/contents/chapter8/transportation-urban-form/)
