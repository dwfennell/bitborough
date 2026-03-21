# Bitborough Mechanics Roadmap

> Every proposed game mechanic from the research collection — categorized, prioritized, and mapped to the existing engine.

This document extracts all mechanics proposed in the "Application to Bitborough" sections across all 16 research documents, catalogs what the engine already implements, and organizes everything into a prioritized implementation roadmap.

## Table of Contents

- [1. What Exists Today](#1-what-exists-today)
- [2. Tier 1: High Impact, Low Complexity](#2-tier-1-high-impact-low-complexity)
- [3. Tier 2: High Impact, Medium Complexity](#3-tier-2-high-impact-medium-complexity)
- [4. Tier 3: Medium Impact, Varies Complexity](#4-tier-3-medium-impact-varies-complexity)
- [5. Tier 4: Ambitious / Future Vision](#5-tier-4-ambitious--future-vision)
- [6. By Domain](#6-by-domain)
- [7. Interaction Dependencies](#7-interaction-dependencies)
- [8. Quick Wins](#8-quick-wins)

---

## 1. What Exists Today

Complete inventory of current game mechanics with code locations, core formulas, and key constants.

### Zone System

| Mechanic | File | Formula / Algorithm |
|----------|------|---------------------|
| R/C/I zone placement | `simulation/zones.ts` | Player paints zones; tiles develop when powered + road-accessible + demand > 0 |
| Development probability | `simulation/zones.ts` | `P(develop) = 0.12 * zoneDemand` per zoned tile per month |
| Zone building spawning | `simulation/zones.ts` | New buildings spawn as `res.low`, `com.low`, or `ind.low` (DensityLevel.Low) |

### Density Progression

| Mechanic | File | Formula / Algorithm |
|----------|------|---------------------|
| Low -> Medium upgrade | `simulation/density.ts` | Requires paved road, occupancy >= 70%, neighborhood avg occupancy >= 70%. `P = demandFactor * e^(-dist / mediumRadius(pop))` (Clark's Law) |
| Medium -> High upgrade | `simulation/density.ts` | Requires transit stop within 10 tiles, critical mass (>50% neighbors at Medium+), occupancy >= 85%. `P = demandFactor * e^(-distToTransit / TRANSIT_RADIUS)` |
| City center calculation | `simulation/density.ts` | Arithmetic mean of all active building positions |
| Dynamic medium radius | `simulation/density.ts` | `mediumRadius(pop) = min(5 + pop/1000, 30)` — gradient flattens with growth |
| Building variants | `simulation/density.ts` | Weighted random selection among variant defs per tier (e.g., `res.med` and `res.med.b`) |
| Construction period | `simulation/density.ts` | Fixed 2-month construction for all upgrades |
| Footprint expansion | `simulation/density.ts` | Larger buildings consume adjacent same-zone buildings |

### Fill/Drain & Dereliction

| Mechanic | File | Formula / Algorithm |
|----------|------|---------------------|
| Population fill/drain | `simulation/density.ts` | `target = capacity * max(0, demand) * desirability`; `residents += (target - residents) * rate`; `FILL_RATE = 0.12`, `DRAIN_RATE = 0.2` |
| Dereliction trigger | `simulation/density.ts` | 3 months below 10% occupancy triggers dereliction state |
| Dereliction downgrade | `simulation/density.ts` | After 6 months derelict, building downgrades (High->Med->Low) via `DOWNGRADE_TARGET` map |

### Power System

| Mechanic | File | Formula / Algorithm |
|----------|------|---------------------|
| BFS power propagation | `simulation/power.ts` | BFS from plant footprint through conductors (power lines, roads, zones, buildings) |
| Conductor types | `simulation/power.ts` | PowerLine, Road, zoned tiles, building tiles all conduct power |
| Capacity limit | `simulation/power.ts` | Each plant powers N building tiles (diesel: 50, coal: 700, nuclear: 2000); BFS stops when capacity exhausted |
| Plant definitions | `core/constants.ts` | Diesel: $300, $15/mo, 2x2, pollution(r2, a5). Coal: $2000, $60/mo, 4x4, pollution(r6, a20). Nuclear: $5000, $100/mo, 4x4, no pollution |

### Road Network & Traffic

| Mechanic | File | Formula / Algorithm |
|----------|------|---------------------|
| Road graph | `road-graph.ts` | 4-connected grid of road tiles; `RoadGraph = Map<number, number[]>` |
| A* pathfinding | `road-graph.ts` | Manhattan-distance heuristic, `MAX_ROUTE_LENGTH = 60` tiles, uniform edge weight of 1 |
| Road types | `core/constants.ts` | Basic Road ($10) and PavedRoad upgrade ($20) |
| Road access check | `simulation/road-access.ts` | Manhattan distance scan within range 3 for any road tile |
| Traffic density layer | `simulation/citizens.ts` | `Uint8Array` per tile; computed monthly from agent routes; work trips weighted 2x, commerce 1x |
| Route staleness | `simulation/citizens.ts` | Agents marked stale when a road tile on their route changes; replanned next monthly tick |

### Citizen Agents

| Mechanic | File | Formula / Algorithm |
|----------|------|---------------------|
| Sampling ratio | `simulation/citizens.ts` | `DEFAULT_SAMPLING_RATIO = 50` — each agent represents 50 residents |
| Agent assignment | `simulation/citizens.ts` | Each agent gets home building, seeks nearest job (ind/com) and nearest commercial building via A* |
| Satisfaction tracking | `simulation/citizens.ts` | Based on employment status, commerce access, commute length |
| Congestion feedback | `simulation/demand.ts` | `TRAFFIC_CAPACITY = 100`; average congestion across road tiles penalizes all demand when > 0.8 |

### Demand (RCI)

| Mechanic | File | Formula / Algorithm |
|----------|------|---------------------|
| Residential demand | `simulation/demand.ts` | `rBase = 1.0 * taxModifier`; suppressed by long commutes (penalty above 30 tiles avg) |
| Commercial demand | `simulation/demand.ts` | `cBase = min(totalResCap / 500, 0.6) * taxModifier`; boosted by unmatched jobs and commerce fractions |
| Industrial demand | `simulation/demand.ts` | `iBase = 0.4 * (taxModifier * 0.5 + 0.5)`; dampened tax sensitivity |
| Tax modifier | `simulation/demand.ts` | `1.0 - (taxRate - 0.07) * 5.0` — neutral at 7% |

### Budget & Taxes

| Mechanic | File | Formula / Algorithm |
|----------|------|---------------------|
| Tax income | `simulation/budget.ts` | `population * (avgLandValue / 20) * taxRate` |
| Infrastructure maintenance | `simulation/budget.ts` | Road $1/mo, paved +$1, power line $0.50, rail $1.50 per tile |
| Service costs | `simulation/budget.ts` | Police/fire stations: $50/mo scaled by funding %; transit stops: $50/mo |
| Tax rate range | `Engine.ts` | 0-20%, default 7% |

### Loans

| Mechanic | File | Formula / Algorithm |
|----------|------|---------------------|
| Single active loan | `Engine.ts` | 8% annual interest, 120-month term, amortized monthly |
| Max loan | `Engine.ts` | 48x monthly tax income, minimum $10,000 |
| Emergency loan | `Engine.ts` | Auto-triggered when funds < 0 and no active loan |
| Bankruptcy | `Engine.ts` | Event emitted when insolvent with active loan and continued negative balance |

### Services

| Mechanic | File | Formula / Algorithm |
|----------|------|---------------------|
| Police coverage | `services/crime.ts` | `POLICE_BASE_RADIUS = 15`; effective radius scales with funding; linear decay 1.0->0.0 |
| Crime formula | `services/crime.ts` | `rawCrime = max(0, 30 - floor(landValue * 0.15))`; `crimeLevel = rawCrime - (influence * 40)` |
| Fire coverage | `services/fire.ts` | `FIRE_BASE_RADIUS = 15`; same funding/influence model as police |
| Fire ignition | `services/fire.ts` | Base risk 0.001 per zoned tile per tick; `effectiveRisk = 0.001 * (1.0 - coverage * 0.9)` |
| Fire spread | `services/fire.ts` | Orthogonal neighbors; `spreadChance = 0.15 * (1.0 - neighborCoverage * 0.7)`; roads and water block spread |
| Fire duration | `services/fire.ts` | Burns 3-5 ticks; coverage accelerates extinguishing |

### Parks, Land Value & Desirability

| Mechanic | File | Formula / Algorithm |
|----------|------|---------------------|
| Parks | `desirability.ts` | `special.park` 1x1, $10 build, $0 maintenance |
| Park bonus to desirability | `desirability.ts` | Binary +0.25 to residential desirability within `PARK_RADIUS = 5` tiles (Manhattan) |
| Residential desirability | `desirability.ts` | `0.30 (baseline) + (1-crime)*0.30 + 0.15 (fire) + 0.25 (park) - pollution*0.30` |
| Commercial desirability | `desirability.ts` | `0.40 (baseline) + 0.35 (transit within 10) + 0.25 (3+ residential within 5)` |
| Industrial desirability | `desirability.ts` | Flat 1.0 |
| Land value calculation | `simulation/land-value.ts` | Base 10 + water adjacency (15/tile) + park bonus (10 decaying by 2/tile within r4) + road (+10) - pollution*0.5 - crime*0.1 |

### Pollution

| Mechanic | Notes | Status |
|----------|-------|--------|
| Pollution array | `Engine.ts` | `pollutionLevel: Uint8Array` allocated but **not actively propagated** from sources |
| Building defs | `BuildingDef` | `pollutionRadius` and `pollutionAmount` fields exist on all building defs |
| Defined values | buildings-registry | `ind.low`: r3/a10; `ind.med`: r4/a20; `ind.high`: r6/a40; `power.diesel`: r2/a5; `power.coal`: r6/a20 |
| Desirability penalty | `desirability.ts` | `RES_POLLUTION_PENALTY = 0.3` applied against normalized pollution level |

---

## 2. Tier 1: High Impact, Low Complexity

Mechanics that significantly improve gameplay and build directly on existing systems.

| # | Mechanic | Description | Source Doc(s) | Extends | Key Formula | Complexity |
|---|----------|-------------|---------------|---------|-------------|------------|
| 1.1 | **Pollution propagation** | Write the existing `pollutionLevel` array from building sources each tick using linear or Lorentzian decay | environment-and-sustainability | `pollutionLevel` array already allocated; building defs have pollution values | `P(d) = A * max(0, 1 - d/R)` or `P(d) = A / (1 + (d/d_half)^2)` | Small |
| 1.2 | **Park distance decay** | Replace binary park bonus with distance-decayed value | public-services | `desirability.ts` park check | `parkBonus = 0.25 * (1 - dist / PARK_RADIUS)` | Small |
| 1.3 | **BPR congestion-weighted A*** | Add traffic density as edge cost in pathfinding so agents spread across parallel routes | transportation-and-traffic | `astar()` in `road-graph.ts` | `edge_cost(tile) = 1.0 + 0.15 * (density/capacity)^4` | Small |
| 1.4 | **Sprawl penalty** | If developed area per capita exceeds threshold, increase infrastructure maintenance cost proportionally | urban-growth-patterns | `budget.ts` maintenance calculation | `sprawl_score = developed_area / (population * density_target)` | Small |
| 1.5 | **LOS traffic overlay** | Map v/c ratio to A-F letter grades for a player-visible traffic overlay | transportation-and-traffic | `trafficDensity` layer already computed | `vc = density / capacity`; thresholds at 0.35, 0.54, 0.77, 0.93, 1.00 | Small |
| 1.6 | **Zone boundary effects** | Commercial proximity bonus to residential (+0.10 within r3); residential proximity penalty to industrial efficiency (*0.85 within r4) | land-use-and-zoning | `desirability.ts` | Adjacency scan per tile | Small |
| 1.7 | **Construction lag by density** | Variable construction time: Low 1mo, Med 3mo, High 6mo (currently fixed 2mo) | housing | `density.ts` `startConstruction()` | Lookup table by density tier | Small |
| 1.8 | **Vacancy rate feedback** | Track city-wide vacancy rate and modulate demand/rent growth at thresholds | housing | `demand.ts` + `density.ts` fill/drain | `vacancy = 1 - (total_residents / total_capacity)`; thresholds at 3%, 5%, 8%, 12% | Small |
| 1.9 | **Mass demolition penalty** | Temporary desirability penalty on surrounding tiles when player bulldozes many adjacent tiles at once | urban-growth-patterns | `bulldoze()` in Engine.ts | `penalty = base * e^(-dist / sqrt(tiles_demolished))` | Small |
| 1.10 | **Sector development via road weighting** | Weight density upgrade probability by road accessibility: paved roads carry higher weight than basic roads | urban-growth-patterns | `upgradeProb()` in density.ts | `road_accessibility = sum(road_capacity * e^(-dist / influence_radius))` | Small |
| 1.11 | **Logistic growth fill rate** | Replace constant `FILL_RATE` with logistic deceleration as building fills | population-and-demographics | `density.ts` fill loop | `fillRate = 0.12 * (1 - P/K)` where K = capacity | Small |
| 1.12 | **Parks as pollution sinks** | Park tiles reduce received pollution in surrounding area | environment-and-sustainability | Pollution propagation (1.1) | `reduction = -PARK_ABSORB * max(0, 1 - d / PARK_RADIUS)` | Small |

---

## 3. Tier 2: High Impact, Medium Complexity

Mechanics that add significant depth but require new systems or notable extensions.

| # | Mechanic | Description | Source Doc(s) | Extends | Key Formula | Complexity |
|---|----------|-------------|---------------|---------|-------------|------------|
| 2.1 | **Road hierarchy** | 2-3 road types with different capacities and speed factors (local/avenue/highway) | transportation-and-traffic | Road system, `Infrastructure` enum | Local: cap 50, cost $10. Avenue: cap 150, cost $40, speed 0.8. Highway: cap 400, cost $100, speed 0.5 | Medium |
| 2.2 | **Education service building** | School as radius-based service building affecting desirability | public-services | Service influence system (police/fire pattern) | `SCHOOL_BASE_RADIUS = 12`, cost $500, maintenance $75/mo, desirability +0.20 above threshold 0.3 | Medium |
| 2.3 | **Per-tile tax productivity** | Replace averaged tax with per-tile revenue using density multiplier | municipal-finance | `budget.ts` tax calculation | `taxIncome = sum(tileLandValue * densityMultiplier * taxRate)` where density multiplier: Low 1x, Med 2.5x, High 6x | Medium |
| 2.4 | **Zone-type fiscal multiplier** | Different service costs by zone type reflecting COCS ratios | municipal-finance | `budget.ts` service costs | Res Low: 1.15x, Res Med: 0.95x, Res High: 0.80x, Com: 0.35x, Ind: 0.40x | Medium |
| 2.5 | **Wealth tiers for citizens** | Three wealth tiers (Low/Mid/High) with different desirability/tax sensitivities | population-and-demographics, social-dynamics | Citizen agents | Distribution: 30% low, 45% mid, 25% high. Each tier weights factors differently | Medium |
| 2.6 | **Migration model** | Harris-Todaro style attractiveness signal driving net migration flow | population-and-demographics | Demand system | `attractiveness = jobMatchRate * 0.6 + satisfaction * 0.4`; `migration = (attractiveness - 0.5) * 0.02 * pop` | Medium |
| 2.7 | **Mixed-use zones** | New `ZoneType.MixedUse` with both capacity and jobs per building, walkability bonus | land-use-and-zoning | Zone system, `ZoneType` enum | +15% residential desirability, +20% commercial desirability; requires paved road | Medium |
| 2.8 | **Transit stops as graph links** | Transit stops add edges between non-adjacent nodes in road graph for faster routing | transportation-and-traffic | Road graph, A* | `transit_cost = manhattan_distance(A, B) * 0.3`; auto-selected when cheaper than driving | Medium |
| 2.9 | **Water/sewer infrastructure** | Water tower, treatment plant with population-based capacity; BFS through pipes/roads | utilities-and-infrastructure | Power system pattern | Water tower: cap 500 pop, $300. Treatment plant: cap 5000 pop, $2000. Sewer parallels water at 0.7x | Medium |
| 2.10 | **Infrastructure aging** | Each asset tracks age; condition decays quadratically; low condition raises costs and causes failures | utilities-and-infrastructure | Building `age` field exists | `condition = 100 * (1 - (age/lifespan)^2)`; lifespans: road 20yr, pipe 50yr, power plant 30-60yr | Medium |
| 2.11 | **Municipal bonds** | Multiple bond types with credit-rating-based interest rates replacing single-loan system | municipal-finance | Loan system | Credit rating from reserve ratio, debt service ratio, debt per capita. AAA: 3%, BB: 8% | Medium |
| 2.12 | **Walkability score** | Per-tile 0-100 score from intersection density, mixed-use proximity, street type, parks, transit | urban-design-and-walkability | Desirability system, road types | Five weighted components: ID 0.30, MU 0.25, GF 0.15, TR 0.15, TN 0.15 | Medium |
| 2.13 | **Export base multiplier** | Distinguish basic/non-basic employment; cap commercial demand when non-basic exceeds multiplier | economy-and-employment | Demand system | `maxNonBasic = basicJobs * multiplier`; multiplier scales 1.5->3.0 with population | Medium |
| 2.14 | **Agglomeration bonus** | Same-category building clusters get productivity/tax revenue bonus | economy-and-employment | Land value, budget | `bonus = 1.0 + min(neighbors * 0.05, 0.5)` within radius | Medium |
| 2.15 | **Per-building rent/price** | Rent level per building from density, desirability, and age | housing | Density fill/drain | `rent = base_rent(density) * desirability * max(0.5, 1.0 - age/600)` | Medium |
| 2.16 | **Rezoning tool** | Player changes permitted density cap; immediate land value change, delayed development | land-use-and-zoning | Zone system, land value | Land value multiplier: Low->Med 1.5-2x, Med->High 2-3x; development still requires demand | Medium |
| 2.17 | **Growth boundary** | Define buildable radius from settlement center; expanding costs money with cooldown | urban-growth-patterns | Map edge mechanics | `max_radius = base + expansions * increment`; constraining forces infill pressure | Medium |
| 2.18 | **Disinvestment persistence** | Per-tile score that accumulates faster than it decays, reducing upgrade probability | urban-growth-patterns | Building age, dereliction | `disinvestment(t) = disinvestment(t-1) * decay + new_negatives`; active investment accelerates recovery | Medium |
| 2.19 | **Neighborhood lifecycle score** | Track per-region lifecycle stage: Development, Growth, Stability, Decline, Renewal | urban-growth-patterns | Building age, occupancy | Function of avg building age, occupancy, density trend, investment rate | Medium |
| 2.20 | **Impact fees** | One-time fee when zone develops; per-building amount by density/type | municipal-finance | Zone development in `zones.ts` | `res.low: $500`, `com.high: $1500`, etc. Triggered on building spawn | Medium |

---

## 4. Tier 3: Medium Impact, Varies Complexity

Nice-to-have mechanics that add flavor or depth but aren't core.

| # | Mechanic | Description | Source Doc(s) | Complexity |
|---|----------|-------------|---------------|------------|
| 3.1 | **FAR as explicit density control** | Per-tile FAR value replacing discrete density enum; finer-grained capacity | land-use-and-zoning | Medium |
| 3.2 | **Non-conforming use mechanics** | Existing buildings on rezoned tiles get 24-month grace period with reduced fill rate | land-use-and-zoning | Medium |
| 3.3 | **Parking requirements toggle** | City-wide or per-district parking policy reducing effective density cap by 15-30% | land-use-and-zoning, transportation-and-traffic | Medium |
| 3.4 | **Congestion pricing policy** | Toll within a player-defined zone; reduces traffic 15-30%, generates revenue, satisfaction penalty | transportation-and-traffic | Medium |
| 3.5 | **Induced demand mechanic** | Road capacity increases temporarily boost residential demand (Duranton-Turner elasticity ~1.0) | transportation-and-traffic | Small |
| 3.6 | **Unemployment tracking** | Explicit labor market: labor force, employed, unemployed, vacancy rate feed into demand signals | economy-and-employment | Medium |
| 3.7 | **Commercial hierarchy** | Tiered commercial demand: neighborhood (500 pop/5 tiles), community (2000/15), regional (8000/30) | economy-and-employment | Medium |
| 3.8 | **Hospital service building** | Radius-based coverage (r20), $2000 build, desirability +0.10; gates max density in area | public-services | Medium |
| 3.9 | **Service quality feedback loop** | Service coverage feeds into land value, which feeds into tax revenue — positive/negative spiral | public-services | Medium |
| 3.10 | **Affordability signal** | City-wide `avg_rent / (avg_income / 12)`; demand penalty when > 0.30 | housing | Small |
| 3.11 | **Filtering via age-driven desirability decay** | `effective_desirability = base * max(0.4, 1.0 - age/720)` — buildings lose desirability over 60 years | housing | Small |
| 3.12 | **NIMBY resistance** | High-desirability neighborhoods resist density upgrades: `block_chance = 0.3 * desirability` | housing | Small |
| 3.13 | **Construction cost curve** | U-shaped cost: Low->Med cheapest per unit (5-over-1 sweet spot), Med->High has cost cliff | housing, real-estate-development | Small |
| 3.14 | **Variance system** | Probabilistic zone variance at boundaries when demand spills over; 75% base approval, modified by demand and neighbor opposition | land-use-and-zoning | Medium |
| 3.15 | **Stormwater as density constraint** | Imperviousness threshold triggers flood risk; parks reduce local imperviousness | utilities-and-infrastructure | Medium |
| 3.16 | **Solid waste service building** | Landfill (cheap, polluting, finite lifespan), recycling center, waste-to-energy plant | utilities-and-infrastructure | Medium |
| 3.17 | **Wind-biased pollution** | Wind direction stretches pollution footprint downwind | environment-and-sustainability | Small |
| 3.18 | **Noise layer** | `Uint8Array` noise from roads and industry; affects residential desirability | environment-and-sustainability | Medium |
| 3.19 | **Sustainability score** | Composite: `w * (1 - pollution) + w * green_ratio + w * transit_coverage + w * renewable_fraction` | environment-and-sustainability | Small |
| 3.20 | **Street design types** | Complete Street (GF=70, cap 80, $80) and Pedestrian Street (GF=100, cap 10, $60) road upgrades | urban-design-and-walkability | Medium |
| 3.21 | **Public space types** | Plaza (2x2, GF+20 within 3 tiles), Civic Building (3x3, +0.10 desirability within 8 tiles) | urban-design-and-walkability | Medium |
| 3.22 | **Density pressure visualization** | Heatmap overlay showing where actual density is below/above gradient prediction | urban-density-gradients | Small |
| 3.23 | **Polycentric superposition** | Multiple density anchors with additive upgrade probability: `sum(weight_j * e^(-d/radius_j))` | urban-density-gradients | Medium |
| 3.24 | **Mode-specific TOD radii** | Bus stop r3-4 (weak), BRT r5-6 (moderate), light rail r8-10 (strong), metro r10-14 (very strong) | transit-oriented-development | Medium |
| 3.25 | **TIF districts** | Player designates tiles; freeze base land values; capture increment for infrastructure investment | municipal-finance | Large |
| 3.26 | **Fiscal stress/bankruptcy rework** | Graduated fiscal health score replacing binary bankruptcy trigger | municipal-finance | Medium |
| 3.27 | **Developer AI with pro forma** | Developer agent evaluating projected NOI vs construction cost before building | real-estate-development | Large |

---

## 5. Tier 4: Ambitious / Future Vision

Complex systems that would be impressive but are large undertakings.

| # | Mechanic | Description | Source Doc(s) | Complexity |
|---|----------|-------------|---------------|------------|
| 4.1 | **Lifecycle simulation** | Birth/death rates, age cohorts, demographic transition | population-and-demographics | Large |
| 4.2 | **Population pyramid effects** | Young pop -> school demand; working-age -> tax revenue; aging -> healthcare demand | population-and-demographics | Large |
| 4.3 | **Household size as game parameter** | Declining from 3.5 to 2.3 with population growth; amplifies housing demand per capita | population-and-demographics | Medium |
| 4.4 | **Immigration and enclave formation** | Distinct inflow channel with clustering behavior; integration progress field | population-and-demographics | Large |
| 4.5 | **Circular migration / remittances** | Temporary workers with remittance outflow reducing local commercial multiplier | population-and-demographics | Large |
| 4.6 | **Brain drain / brain gain events** | High-income agent departure risk when city attractiveness falls below external pull | population-and-demographics | Medium |
| 4.7 | **Aging city fiscal spiral** | Elderly share > 25% creates rising healthcare, declining revenue, rising per-capita infrastructure costs | population-and-demographics | Large |
| 4.8 | **Gentrification pressure and displacement** | Rent-gap computation, displacement routing low-income to cheapest locations, neighborhood character erosion | population-and-demographics, urban-growth-patterns | Large |
| 4.9 | **Schelling-style preference dynamics** | Income-based mild preference for same-tier neighbors; emergent spatial sorting | social-dynamics-and-segregation | Medium |
| 4.10 | **Neighborhood reputation layer** | Slow-decaying Uint8Array per tile tracking quality over time; drives tier attraction thresholds | social-dynamics-and-segregation | Medium |
| 4.11 | **Social capital metric** | Per-building 0-1 score from residential stability; feeds into crime reduction and satisfaction | social-dynamics-and-segregation | Medium |
| 4.12 | **Environmental justice integration** | Cumulative exposure metric per building; health penalty correlated with wealth tier | social-dynamics-and-segregation | Medium |
| 4.13 | **Supply chain linkages** | Inter-sector dependencies: commercial needs industrial output; industrial benefits from commercial services | economy-and-employment | Medium |
| 4.14 | **Unemployment duration and scarring** | Duration-aware unemployment with skill decay and wage penalty upon re-employment | economy-and-employment | Large |
| 4.15 | **Sector evolution events** | Population-threshold triggers that restructure industrial base (automation wave, service economy) | economy-and-employment | Large |
| 4.16 | **Commercial real estate cycle** | Vacancy as lagging indicator with construction pipeline delays; boom-bust dynamics | economy-and-employment | Large |
| 4.17 | **Commute-income stratification** | Income tiers with different housing-location constraints and commute tolerances | economy-and-employment | Large |
| 4.18 | **Informal economy buffer** | During high unemployment, partial economic activity cushions decline | economy-and-employment | Medium |
| 4.19 | **18-year market cycle** | Modulates cap rates, lending standards, developer confidence; asymmetric 14yr up / 4yr down | real-estate-development | Large |
| 4.20 | **Speculation mechanics** | Speculative premium inflates land values late in cycle; collapse when cycle turns | real-estate-development | Large |
| 4.21 | **Adaptive reuse** | Derelict buildings convert to different zone type at 60-80% of new construction cost | real-estate-development | Medium |
| 4.22 | **Construction cost gates** | Density upgrades gated by projected NOI vs construction cost rather than flat probability | real-estate-development | Large |
| 4.23 | **Micro-mobility network** | Bike lanes as road overlay; replace car trips for short distances; 5-10% traffic reduction | transportation-and-traffic | Medium |
| 4.24 | **Freight/delivery traffic** | Background traffic scaling with commercial density; freight vehicles at 2.5x road impact | transportation-and-traffic | Medium |
| 4.25 | **Road maintenance / PCI** | Pavement deterioration from traffic volume and time; deferred maintenance 4-8x cost multiplier | transportation-and-traffic | Large |
| 4.26 | **Dynamic parking occupancy** | Parking as scarce tile-level resource; cruising penalty when occupancy > 85% | transportation-and-traffic | Large |
| 4.27 | **Frequency-based transit** | Transit ridership depends on headway, not just stop existence | transportation-and-traffic | Medium |
| 4.28 | **Distributed generation / solar** | Solar panels as building upgrade reducing grid demand; community solar farms; battery storage | utilities-and-infrastructure | Large |
| 4.29 | **Infrastructure interdependency** | Power loss to water facility cascades into water service loss | utilities-and-infrastructure | Medium |
| 4.30 | **Capacity planning / reserve margin** | Warning below 115% power reserve; rolling blackouts below 100% | utilities-and-infrastructure | Medium |
| 4.31 | **Mental health facility** | Diverts mental health calls from police/EMS; reduces call share by 60% | public-services | Medium |
| 4.32 | **Service equity score** | City-wide measure of coverage standard deviation across occupied tiles | public-services | Small |
| 4.33 | **Fire response time modeling** | Replace binary coverage with distance-based response delay; flashover cliff mechanic | public-services | Medium |
| 4.34 | **Housing concentration penalty** | Clustered low-income buildings trigger desirability decrease and service cost increase | urban-growth-patterns | Medium |
| 4.35 | **Anchor institution demand pull** | University/hospital buildings create stable local demand and commercial revenue bonus | urban-growth-patterns | Medium |
| 4.36 | **Right-sizing / smart decline** | When population drops below 60% of peak, offer consolidation actions and scoring shift | urban-growth-patterns | Large |
| 4.37 | **Vacancy cascade** | Spatial contagion of dereliction: nearby abandoned buildings accelerate dereliction of neighbors | housing | Medium |
| 4.38 | **Speculation cycle** | Smoothed price growth metric; investor demand inflates, then crashes with vacancy spike | housing | Large |
| 4.39 | **Manufactured housing tier** | `res.manufactured`: cap 6, 0.5mo build, 40% of res.low cost, faster depreciation, no upgrade path | housing | Medium |
| 4.40 | **Dark housing / STR leakage** | Fraction of housing withdrawn from market in high-desirability cities; vacancy tax counters | housing | Medium |
| 4.41 | **Disaster event system** | Earthquake, flood, wildfire, tornado, hurricane, drought as probabilistic events | disaster-and-resilience | Large |
| 4.42 | **Disaster recovery phases** | Kates-Pijawka four-phase model with phase duration scaling by severity and city resources | disaster-and-resilience | Large |
| 4.43 | **Building code policies** | Seismic, wind, flood elevation codes that increase construction cost but reduce damage | disaster-and-resilience | Medium |
| 4.44 | **Emergency reserve fund** | Dedicated budget line; balance reduces emergency phase duration by up to 50% | disaster-and-resilience | Medium |
| 4.45 | **Pension system** | Growing background liability; underfunding creates time bomb; funded ratio affects credit rating | municipal-finance | Large |
| 4.46 | **Revenue volatility / economic cycles** | Periodic shocks affecting revenue differently by source; reserve fund mechanic | municipal-finance | Large |
| 4.47 | **Corporate subsidy bidding** | Event-driven choice: match, counter-offer, or decline incentive package for major employer | municipal-finance | Medium |
| 4.48 | **Fee revenue and equity tradeoffs** | Fee-based revenue lever alongside tax rate; higher fees are regressive | municipal-finance | Medium |
| 4.49 | **Brownfield / soil contamination** | Demolished industrial tiles retain contamination; must remediate before residential rezoning | environment-and-sustainability | Medium |
| 4.50 | **Biodiversity layer** | Score from green space connectivity, diversity, pollution, water features | environment-and-sustainability | Medium |
| 4.51 | **Embodied carbon tracking** | Cumulative city-wide metric; each building placed adds carbon; demolition adds more | environment-and-sustainability | Small |
| 4.52 | **Light pollution layer** | Commercial/road light output affects residential desirability and biodiversity | environment-and-sustainability | Medium |
| 4.53 | **Food access score** | Fraction of residential tiles within walkable distance of grocery; health penalty for food deserts | environment-and-sustainability | Medium |
| 4.54 | **Transportation equity metrics** | Per-income-tier commute time, transport cost burden, job accessibility dashboard | transportation-and-traffic | Medium |
| 4.55 | **Inclusionary zoning policy** | Affordable housing mandate on new construction; density bonus partially compensates | land-use-and-zoning | Medium |
| 4.56 | **Historic preservation overlay** | Player designates tiles; +15% land value, caps density, suppresses redevelopment | land-use-and-zoning | Medium |
| 4.57 | **Fiscal impact display** | Per-tile revenue minus service cost visualization | land-use-and-zoning | Small |
| 4.58 | **Value capture from stations** | Land value change display when station built; station-area upzoning; revenue sharing | transit-oriented-development | Medium |
| 4.59 | **Subsidy mechanics** | Tax abatement, density bonus, TIF, impact fee waiver as player tools | real-estate-development | Medium |
| 4.60 | **Inclusionary zoning density bonus** | Affordable set-aside percentage traded for bonus capacity; developer feasibility reduced | land-use-and-zoning | Medium |

---

## 6. By Domain

All mechanics grouped by domain for easy reference. Each row cites the source research document and the tier from sections 2-5 above.

### Land & Zoning

| Mechanic | Source Doc | Tier |
|----------|-----------|------|
| Zone boundary effects (commercial/residential/industrial spillovers) | land-use-and-zoning | 1 |
| FAR as explicit density control | land-use-and-zoning | 3 |
| Rezoning tool (upzoning/downzoning) | land-use-and-zoning | 2 |
| Mixed-use zones | land-use-and-zoning | 2 |
| Non-conforming use mechanics | land-use-and-zoning | 3 |
| Parking requirements toggle | land-use-and-zoning, transportation | 3 |
| Inclusionary zoning / affordable housing mandate | land-use-and-zoning | 4 |
| Historic preservation overlay | land-use-and-zoning | 4 |
| Variance system | land-use-and-zoning | 3 |
| Fiscal impact display (revenue per acre) | land-use-and-zoning | 4 |
| Polycentric superposition | urban-density-gradients | 3 |
| Density pressure visualization | urban-density-gradients | 3 |
| Gradient flattening via road network coverage | urban-density-gradients | 3 |
| Barrier and amenity modifiers (highways/parks affect density cap) | urban-density-gradients | 3 |
| Sector development via road weighting | urban-growth-patterns | 1 |
| Growth boundary | urban-growth-patterns | 2 |
| Sprawl penalty | urban-growth-patterns | 1 |
| Neighborhood lifecycle score | urban-growth-patterns | 2 |
| Disinvestment persistence | urban-growth-patterns | 2 |
| Mass demolition penalty | urban-growth-patterns | 1 |

### Population & Citizens

| Mechanic | Source Doc | Tier |
|----------|-----------|------|
| Logistic growth fill rate | population-and-demographics | 1 |
| Migration model (Harris-Todaro) | population-and-demographics | 2 |
| Wealth tiers (Low/Mid/High) | population-and-demographics, social-dynamics | 2 |
| Lifecycle simulation (birth/death/age) | population-and-demographics | 4 |
| Household size parameter | population-and-demographics | 4 |
| Population pyramid effects | population-and-demographics | 4 |
| Immigration and enclave formation | population-and-demographics | 4 |
| Circular migration / remittances | population-and-demographics | 4 |
| Brain drain / brain gain | population-and-demographics | 4 |
| Aging city fiscal spiral | population-and-demographics | 4 |
| Gentrification pressure and displacement | population-and-demographics, urban-growth-patterns | 4 |
| Schelling-style preference dynamics | social-dynamics-and-segregation | 4 |
| Neighborhood reputation layer | social-dynamics-and-segregation | 4 |
| Social capital metric | social-dynamics-and-segregation | 4 |
| Environmental justice integration | social-dynamics-and-segregation | 4 |

### Economy & Employment

| Mechanic | Source Doc | Tier |
|----------|-----------|------|
| Export base multiplier | economy-and-employment | 2 |
| Agglomeration bonus | economy-and-employment | 2 |
| Supply chain linkages | economy-and-employment | 4 |
| Unemployment tracking | economy-and-employment | 3 |
| Commercial hierarchy (central place theory) | economy-and-employment | 3 |
| Sector evolution events | economy-and-employment | 4 |
| Unemployment duration and scarring | economy-and-employment | 4 |
| Commercial real estate cycle | economy-and-employment | 4 |
| Commute-income stratification | economy-and-employment | 4 |
| Informal economy buffer | economy-and-employment | 4 |
| Construction cost gates (pro forma) | real-estate-development | 4 |
| Developer AI with pro forma decisions | real-estate-development | 3 |
| 18-year market cycle | real-estate-development | 4 |
| Speculation mechanics | real-estate-development | 4 |
| Adaptive reuse of derelict buildings | real-estate-development | 4 |
| Subsidy mechanics (abatement, density bonus, TIF) | real-estate-development | 4 |

### Transportation & Traffic

| Mechanic | Source Doc | Tier |
|----------|-----------|------|
| BPR congestion-weighted A* | transportation-and-traffic | 1 |
| LOS traffic overlay | transportation-and-traffic | 1 |
| Road hierarchy (local/avenue/highway) | transportation-and-traffic | 2 |
| Transit stops as graph links | transportation-and-traffic | 2 |
| Induced demand mechanic | transportation-and-traffic | 3 |
| Congestion pricing | transportation-and-traffic | 3 |
| Parking as density modifier | transportation-and-traffic | 3 |
| Frequency-based transit attractiveness | transportation-and-traffic | 4 |
| Dynamic parking occupancy | transportation-and-traffic | 4 |
| Micro-mobility network (bike lanes) | transportation-and-traffic | 4 |
| Freight/delivery traffic | transportation-and-traffic | 4 |
| Road maintenance / PCI | transportation-and-traffic | 4 |
| Transportation equity metrics | transportation-and-traffic | 4 |
| Mode-specific TOD radii | transit-oriented-development | 3 |
| Value capture from stations | transit-oriented-development | 4 |
| Parking as density constraint at stations | transit-oriented-development | 3 |

### Utilities & Infrastructure

| Mechanic | Source Doc | Tier |
|----------|-----------|------|
| Water/sewer infrastructure | utilities-and-infrastructure | 2 |
| Infrastructure aging model | utilities-and-infrastructure | 2 |
| Stormwater as density constraint | utilities-and-infrastructure | 3 |
| Solid waste service building | utilities-and-infrastructure | 3 |
| Distributed generation / solar + battery | utilities-and-infrastructure | 4 |
| Infrastructure interdependency (power-water cascade) | utilities-and-infrastructure | 4 |
| Capacity planning / reserve margin | utilities-and-infrastructure | 4 |
| Infrastructure financing (bonds, rate revenue, impact fees) | utilities-and-infrastructure | 4 |
| Climate events (heat waves, flooding) | utilities-and-infrastructure | 4 |
| Decentralized wastewater (septic in early game) | utilities-and-infrastructure | 4 |

### Services

| Mechanic | Source Doc | Tier |
|----------|-----------|------|
| Park distance decay | public-services | 1 |
| Education service building (school) | public-services | 2 |
| Hospital service building | public-services | 3 |
| Service quality feedback loop | public-services | 3 |
| Mental health facility | public-services | 4 |
| Service equity score | public-services | 4 |
| Fire response time modeling (flashover cliff) | public-services | 4 |
| Police quality tiers (deterrence vs investigation) | public-services | 4 |
| Mutual aid / unit availability | public-services | 4 |

### Housing & Real Estate

| Mechanic | Source Doc | Tier |
|----------|-----------|------|
| Vacancy rate feedback | housing | 1 |
| Construction lag by density | housing | 1 |
| Per-building rent/price | housing | 2 |
| Affordability signal | housing | 3 |
| Filtering via age-driven desirability decay | housing | 3 |
| NIMBY resistance | housing | 3 |
| Construction cost curve (U-shaped) | housing | 3 |
| Vacancy cascade (spatial contagion) | housing | 4 |
| Speculation cycle (boom/bust) | housing | 4 |
| Manufactured housing tier | housing | 4 |
| Dark housing / STR leakage | housing | 4 |

### Environment

| Mechanic | Source Doc | Tier |
|----------|-----------|------|
| Pollution propagation | environment-and-sustainability | 1 |
| Parks as pollution sinks | environment-and-sustainability | 1 |
| Wind-biased pollution dispersion | environment-and-sustainability | 3 |
| Noise layer | environment-and-sustainability | 3 |
| Sustainability score | environment-and-sustainability | 3 |
| Brownfield / soil contamination | environment-and-sustainability | 4 |
| Biodiversity layer | environment-and-sustainability | 4 |
| Embodied carbon tracking | environment-and-sustainability | 4 |
| Light pollution layer | environment-and-sustainability | 4 |
| Food access score | environment-and-sustainability | 4 |

### Finance & Budget

| Mechanic | Source Doc | Tier |
|----------|-----------|------|
| Per-tile tax productivity | municipal-finance | 2 |
| Zone-type fiscal multiplier | municipal-finance | 2 |
| Municipal bonds with credit rating | municipal-finance | 2 |
| Impact fees | municipal-finance | 2 |
| TIF districts | municipal-finance | 3 |
| Fiscal stress / bankruptcy rework | municipal-finance | 3 |
| Pension system | municipal-finance | 4 |
| Revenue volatility / economic cycles | municipal-finance | 4 |
| Corporate subsidy bidding | municipal-finance | 4 |
| Fee revenue and equity tradeoffs | municipal-finance | 4 |

### Disaster & Resilience

| Mechanic | Source Doc | Tier |
|----------|-----------|------|
| Disaster event system (earthquake, flood, etc.) | disaster-and-resilience | 4 |
| Disaster recovery phases (Kates-Pijawka) | disaster-and-resilience | 4 |
| Building code policies | disaster-and-resilience | 4 |
| Emergency reserve fund | disaster-and-resilience | 4 |
| Disaster frequency profiles (map-level) | disaster-and-resilience | 4 |
| Drought mechanics (water supply, fire risk) | disaster-and-resilience | 4 |
| Post-earthquake fire / conflagration threshold | disaster-and-resilience | 4 |

### Social Dynamics

| Mechanic | Source Doc | Tier |
|----------|-----------|------|
| Wealth tiers with differentiated sensitivity | social-dynamics-and-segregation | 2 |
| Schelling preference dynamics | social-dynamics-and-segregation | 4 |
| Neighborhood reputation layer | social-dynamics-and-segregation | 4 |
| Social capital metric | social-dynamics-and-segregation | 4 |
| Environmental justice / cumulative exposure | social-dynamics-and-segregation | 4 |
| Housing concentration penalty | urban-growth-patterns | 4 |
| Anchor institution demand pull | urban-growth-patterns | 4 |
| Right-sizing / smart decline mode | urban-growth-patterns | 4 |

---

## 7. Interaction Dependencies

The dependency graph determines optimal build order. An arrow means "should be implemented before."

### Foundation Layer (implement first)

```
Pollution propagation (1.1)
  └── Parks as pollution sinks (1.12)
  └── Wind-biased pollution (3.17)
  └── Brownfield contamination (4.49)
  └── Noise layer (3.18)

BPR congestion routing (1.3)
  └── Road hierarchy (2.1)
  └── Transit stops as graph links (2.8)
  └── Mode-specific TOD radii (3.24)
  └── Induced demand (3.5)
  └── Micro-mobility (4.23)
  └── Congestion pricing (3.4)
  └── Freight traffic (4.24)

Per-tile tax productivity (2.3)
  └── Zone-type fiscal multiplier (2.4)
  └── Fiscal impact display (4.57)
  └── TIF districts (3.25)
  └── Revenue per acre overlay
```

### Citizen Depth Layer

```
Wealth tiers (2.5)
  └── Schelling preferences (4.9)
  └── Neighborhood reputation (4.10)
  └── Gentrification pressure (4.8)
  └── Commute-income stratification (4.17)
  └── Housing concentration penalty (4.34)
  └── Transportation equity metrics (4.54)
  └── Environmental justice (4.12)

Per-building rent/price (2.15)
  └── Affordability signal (3.10)
  └── Vacancy rate feedback (1.8)
  └── Filtering via age decay (3.11)
  └── Vacancy cascade (4.37)
  └── Speculation cycle (4.38)
  └── Dark housing / STR (4.40)

Migration model (2.6)
  └── Brain drain / brain gain (4.6)
  └── Immigration + enclaves (4.4)
```

### Infrastructure Layer

```
Water/sewer (2.9)
  └── Infrastructure aging (2.10)
  └── Infrastructure interdependency (4.29)
  └── Stormwater constraint (3.15)
  └── Capacity planning (4.30)

Road hierarchy (2.1)
  └── Road maintenance / PCI (4.25)
  └── Street design types (3.20)
  └── Walkability score (2.12)
```

### Economy Layer

```
Export base multiplier (2.13)
  └── Unemployment tracking (3.6)
  └── Sector evolution (4.15)
  └── Informal economy (4.18)

Agglomeration bonus (2.14)
  └── Supply chain linkages (4.13)
  └── Commercial hierarchy (3.7)
```

### Finance Layer

```
Municipal bonds (2.11)
  └── Credit rating system
  └── Fiscal stress rework (3.26)
  └── Pension system (4.45)
  └── Revenue volatility (4.46)

Impact fees (2.20)
  └── TIF districts (3.25)
  └── Subsidy mechanics (4.59)
```

### Recommended Build Sequence

**Phase 1 (Foundation):** Pollution propagation, BPR routing, park distance decay, sprawl penalty, logistic fill rate, construction lag by density, vacancy rate feedback, zone boundary effects, LOS overlay.

**Phase 2 (Economic Core):** Per-tile tax productivity, zone-type fiscal multiplier, per-building rent/price, export base multiplier, agglomeration bonus, impact fees, road hierarchy.

**Phase 3 (Citizen Depth):** Wealth tiers, migration model, walkability score, education service building, mixed-use zones, municipal bonds, rezoning tool, growth boundary.

**Phase 4 (Infrastructure):** Water/sewer, infrastructure aging, transit as graph links, neighborhood lifecycle, disinvestment persistence.

**Phase 5 (Advanced):** Disaster system, market cycles, sector evolution, social dynamics (Schelling, reputation, social capital), adaptive reuse, distributed generation.

---

## 8. Quick Wins

The 5-10 smallest changes that would have the biggest impact on gameplay feel. Each of these can be done in isolation and requires minimal new architecture.

| # | Change | Why it matters | Effort |
|---|--------|---------------|--------|
| 1 | **Propagate pollution from sources** | The `pollutionLevel` array, building pollution defs, and desirability penalty all exist but aren't connected. A single function scanning buildings and writing distance-decayed values into the array would make industrial placement meaningful and the desirability system richer. | ~50 lines of new code |
| 2 | **Replace binary park bonus with distance decay** | Currently a park 1 tile away and a park 5 tiles away give identical bonus. Changing to `0.25 * (1 - dist/5)` creates a gradient that rewards careful park placement. | ~5 lines changed in `desirability.ts` |
| 3 | **Variable construction time by density** | Changing the hardcoded `constructionMonthsRemaining = 2` in `startConstruction()` to a lookup `{low: 1, medium: 3, high: 6}` creates meaningful supply lag during growth spurts. | ~5 lines changed in `density.ts` |
| 4 | **Add vacancy rate to demand calculation** | Computing `1 - totalResidents / totalCapacity` and applying it as a demand modifier would prevent over-building and create the natural market feedback loop that most city builders lack. | ~15 lines in `demand.ts` |
| 5 | **Logistic fill deceleration** | Replacing `FILL_RATE` constant with `0.12 * (1 - residents/capacity)` gives a realistic S-curve to population growth per building. Nearly empty buildings fill fast; nearly full ones trickle. | ~3 lines changed in `density.ts` |
| 6 | **LOS overlay colors** | Mapping existing `trafficDensity / 100` to A-F grades with a green-to-red color ramp. The data already exists in `trafficDensity`; this is purely a visualization add. | UI-side only |
| 7 | **Sprawl cost multiplier** | In `budget.ts`, multiply maintenance costs by `max(1.0, developedTileCount / (population * TARGET_DENSITY))`. A single constant and one multiplication makes sprawl fiscally painful. | ~5 lines in `budget.ts` |
| 8 | **BPR edge weights in A*** | Modifying the A* neighbor cost from `g + 1` to `g + 1 + 0.15 * (density/100)^4` spreads traffic across parallel routes. The heuristic remains admissible since `edge_cost >= 1.0`. | ~10 lines in `road-graph.ts` |
| 9 | **Zone boundary commercial bonus** | In `residentialDesirability()`, add a scan for nearby commercial buildings and add +0.10 within radius 3. Creates the walkable-neighborhood premium. | ~10 lines in `desirability.ts` |
| 10 | **Surface per-building age in desirability** | Adding `effective = base * max(0.5, 1.0 - building.age / 600)` to the fill/drain target creates filtering: old buildings naturally become affordable, new buildings are premium. Age is already tracked on every building. | ~3 lines in `density.ts` |
