# How City Systems Interact

> The feedback loops, causal chains, and emergent dynamics that connect urban systems — from transit to land value to density to tax revenue.

This document maps how all the city systems interact with each other. It draws on the 16 research documents in this directory and compares them against the current Bitborough engine implementation to identify what works, what is missing, and what matters most for compelling gameplay.

## Table of Contents

- [The Master Causal Map](#the-master-causal-map)
- [Core Feedback Loops](#core-feedback-loops)
- [First-Order Effects](#first-order-effects)
- [Second-Order Effects](#second-order-effects)
- [Third-Order and Emergent Effects](#third-order-and-emergent-effects)
- [System Coupling Matrix](#system-coupling-matrix)
- [Temporal Dynamics](#temporal-dynamics)
- [Currently Implemented in Bitborough](#currently-implemented-in-bitborough)
- [Missing Interactions](#missing-interactions)
- [Design Principles for System Interactions](#design-principles-for-system-interactions)

---

## The Master Causal Map

Every system in the city simulation touches other systems. The map below shows the major directional connections — each arrow represents a causal mechanism documented in the research.

```
                        ┌─────────────────────────────────────────────────────┐
                        │                   PLAYER ACTIONS                    │
                        │  Zone ─ Build Infrastructure ─ Set Tax ─ Fund Svcs  │
                        └──────┬──────────┬────────────────┬────────────┬─────┘
                               │          │                │            │
                               v          v                v            v
                ┌──────────────────┐  ┌────────┐   ┌───────────┐  ┌─────────┐
                │   LAND USE &     │  │ POWER  │   │ MUNICIPAL │  │ PUBLIC  │
                │   ZONING         │  │ GRID   │   │ FINANCE   │  │ SERVICES│
                │                  │  └───┬────┘   └─────┬─────┘  └────┬────┘
                │ zones, density   │      │              │             │
                │ caps, FAR        │      │         tax rate       police, fire,
                └───────┬──────────┘      │         revenue        parks, transit
                        │                 │              │             │
          ┌─────────────┼─────────────────┼──────────────┼─────────────┼──────┐
          │             v                 v              v             v      │
          │  ┌────────────────┐    ┌────────────┐  ┌─────────┐  ┌─────────┐  │
          │  │  DEVELOPMENT   │───>│ POPULATION │  │ BUDGET  │  │ DESIR-  │  │
          │  │  new buildings │    │ & CITIZENS │  │ balance │  │ ABILITY │  │
          │  │  density upgr. │    │ migration  │  │ surplus/│  │ per-tile│  │
          │  └──────┬─────────┘    │ fill/drain │  │ deficit │  │ 0-1     │  │
          │         │              └──────┬─────┘  └────┬────┘  └────┬────┘  │
          │         │                     │             │            │        │
          │         v                     v             v            v        │
          │  ┌────────────┐     ┌──────────────┐  ┌──────────┐ ┌─────────┐   │
          │  │  DENSITY   │     │   ECONOMY &  │  │ INFRA-   │ │ LAND    │   │
          │  │  GRADIENT  │<───>│  EMPLOYMENT  │  │ STRUCTURE│ │ VALUE   │   │
          │  │  Clark's   │     │  jobs, labor │  │ roads,   │ │ per-tile│   │
          │  │  Law decay │     │  multiplier  │  │ utilities│ │ 0-255   │   │
          │  └──────┬─────┘     └──────┬───────┘  └────┬─────┘ └────┬────┘   │
          │         │                  │               │            │         │
          │         v                  v               v            v         │
          │  ┌────────────┐     ┌────────────┐  ┌──────────┐  ┌──────────┐   │
          │  │  TRANSIT-  │     │  TRAFFIC & │  │ ENVIRON- │  │  CRIME   │   │
          │  │  ORIENTED  │<───>│ CONGESTION │  │  MENT &  │  │  LEVEL   │   │
          │  │  DEVELOP.  │     │  v/c ratio │  │ POLLUTION│  │  safety  │   │
          │  └────────────┘     └────────────┘  └──────────┘  └──────────┘   │
          │                                                                   │
          │                    SIMULATION LAYER                               │
          └───────────────────────────────────────────────────────────────────┘
```

### Connection Inventory

The following lists every major directional connection documented across the 16 research docs:

**Land Use / Zoning**
- Zoning type --> permitted development types (land-use-and-zoning)
- Density cap --> maximum building height and capacity (land-use-and-zoning, urban-density-gradients)
- Mixed-use zones --> walkability premium, reduced VMT (urban-design-and-walkability)
- Upzoning --> land value increase, delayed construction response (land-use-and-zoning)

**Transportation**
- Road capacity --> congestion level via BPR function (transportation-and-traffic)
- Congestion --> demand suppression for all zone types (transportation-and-traffic)
- New road capacity --> induced demand --> more traffic (transportation-and-traffic)
- Transit stops --> density anchor for high-density upgrades (transit-oriented-development)
- Transit proximity --> commercial desirability bonus (transit-oriented-development)
- Commute length --> residential demand penalty (transportation-and-traffic)

**Housing / Population**
- Housing capacity --> population ceiling (population-and-demographics)
- Demand + desirability --> fill rate (housing)
- Low occupancy --> dereliction --> density downgrade (housing)
- Building age --> filtering --> lower rents over time (housing)
- Vacancy rate --> rent levels --> affordability (housing)

**Economy**
- Basic (export) employment --> multiplier on non-basic employment (economy-and-employment)
- Agglomeration --> productivity premium at density (economy-and-employment)
- Commercial demand follows residential capacity (economy-and-employment)
- Unmatched jobs --> industrial/commercial demand boost (economy-and-employment)
- Construction cost curve --> density feasibility threshold (real-estate-development)

**Finance**
- Population x land value x tax rate --> tax revenue (municipal-finance)
- Infrastructure count --> maintenance costs (municipal-finance)
- Service building count x funding --> service costs (municipal-finance)
- Revenue - expenses --> budget balance (municipal-finance)
- Negative balance --> emergency loan --> bankruptcy risk (municipal-finance)
- Dense development --> higher revenue per acre (municipal-finance)
- Sprawl --> infrastructure costs exceed revenue long-term (municipal-finance)

**Services**
- Police funding --> coverage radius --> crime reduction (public-services)
- Crime level --> residential desirability penalty (public-services)
- Fire funding --> coverage radius --> fire risk reduction (public-services)
- Fire coverage --> residential desirability bonus (public-services)
- Parks --> residential desirability bonus, land value bonus (public-services)
- Schools --> residential desirability bonus (proposed) (public-services)

**Environment**
- Industrial density --> pollution radius and amount (environment-and-sustainability)
- Power plant type --> pollution output (environment-and-sustainability)
- Pollution --> residential desirability penalty (environment-and-sustainability)
- Pollution --> land value depression (environment-and-sustainability)
- Parks --> pollution absorption (proposed) (environment-and-sustainability)
- Impervious surface --> flood risk (environment-and-sustainability)

**Infrastructure**
- Power plants --> BFS power propagation --> powered status (utilities-and-infrastructure)
- Powered status gates all development (utilities-and-infrastructure)
- Road access gates all development (utilities-and-infrastructure)
- Infrastructure age --> maintenance cost increase --> failure risk (utilities-and-infrastructure)

---

## Core Feedback Loops

These are the self-reinforcing cycles that drive city simulation dynamics. Each one can spiral upward (virtuous) or downward (vicious) depending on player decisions and system state.

### 1. The Growth Loop (Positive)

The fundamental engine of city expansion.

```
    ┌─> Demand ──> Development ──> Population ──> Tax Revenue ─┐
    │                                                          │
    └──── Desirability <── Services <── Funding <── Budget <───┘
```

**Mechanism:** Positive demand triggers zone development in `zones.ts` (12% base probability per tick, scaled by demand). New buildings fill with residents via the fill/drain loop in `density.ts`. More population generates more tax revenue through `budget.ts` (population x avgLandValue / 20 x taxRate). Revenue funds services (police, fire, parks), which raise desirability scores in `desirability.ts`, which increase fill targets, which attract more demand.

**Research grounding:** The logistic growth model from population-and-demographics defines the S-curve shape. Carrying capacity K = min(housing, jobs, infrastructure, amenity). The export base multiplier from economy-and-employment explains why adding industrial/commercial jobs generates proportionally more total employment.

**Gameplay role:** This is what makes the early game feel rewarding. The player zones land, provides power and roads, and watches organic growth unfold. Breaking any link in the chain (no power, no roads, tax too high, no services) stalls the loop.

### 2. The Density Loop (Positive)

The mechanism that creates urban cores and skylines.

```
    ┌─> Density ──> Transit Viability ──> Accessibility ─┐
    │                                                     │
    └─── More Density <── Land Value <── Desirability <───┘
```

**Mechanism:** As areas densify (Low -> Medium -> High in `density.ts`), they justify transit investment. Transit stops act as density anchors via `hasNearbyTransitStop()` — the only way buildings upgrade from Medium to High. Transit proximity boosts commercial desirability by +0.35 in `desirability.ts`. Higher desirability raises fill targets. Higher occupancy enables further density upgrades. The cycle concentrates development into transit-served nodes.

**Research grounding:** Transit-oriented-development documents how transit stations create secondary density peaks via polycentric superposition. Urban-density-gradients shows the exponential decay pattern (Clark's Law) that concentrates density near anchors. The catchment areas range from 3-4 tiles (bus) to 10-14 tiles (metro).

**Gameplay role:** This loop creates the mid-to-late game strategic layer. The player must decide where to place transit to create density nodes, balancing the cost of transit infrastructure against the land value uplift it generates.

### 3. The Decline Loop (Negative)

The vicious cycle that kills neighborhoods and cities.

```
    ┌─> Service Cuts ──> Desirability Drop ──> Population Loss ─┐
    │                                                            │
    └──── More Cuts <── Revenue Loss <── Tax Base Erosion <──────┘
```

**Mechanism:** When the budget enters deficit, the player must cut service funding or raise taxes. Cutting police funding shrinks the effective coverage radius in `crime.ts`, raising crime levels. Higher crime reduces residential desirability by up to 0.30. Lower desirability reduces fill targets in `density.ts`, causing population drain at DRAIN_RATE = 0.2. Fewer residents means less tax revenue in `budget.ts`. Less revenue forces further cuts. Buildings that drop below 10% occupancy for 3 months trigger dereliction, starting a downgrade cascade (High -> Medium -> Low).

**Research grounding:** Municipal-finance documents the "fiscal death spiral" pattern visible in Detroit, Gary, and other shrinking cities. Population-and-demographics describes how the carrying capacity constraint shifts — when amenity quality drops, the effective K falls even if physical capacity remains. The pension crisis pattern (slow accumulation, sudden visibility, crowding out) amplifies this loop over decades.

**Gameplay role:** This is the primary threat in the late game. It punishes overextension and creates genuine strategic tension around budget management. The asymmetry matters: decline is faster than growth (DRAIN_RATE 0.2 > FILL_RATE 0.12).

### 4. The Traffic Loop (Negative)

Congestion as a growth limiter.

```
    ┌─> Development ──> More Commuters ──> Congestion ─┐
    │                                                    │
    └─── Stagnation <── Demand Suppression <─────────────┘
```

**Mechanism:** New residential and commercial buildings generate citizen agents in `citizens.ts` (1:50 sampling ratio). Each agent pathfinds home-work and home-commerce routes via A* on the road graph. Routes are written to the `trafficDensity` layer each month. When average congestion exceeds 0.8 (80% of TRAFFIC_CAPACITY = 100), demand is penalized in `demand.ts` — scaling from 1.0 at 0.8 to 0.5 at 2.0+ congestion. Additionally, average commute lengths above 30 tiles suppress residential demand by up to 0.3.

**Research grounding:** Transportation-and-traffic documents the BPR function (travel time rises as (v/c)^4), induced demand (Duranton-Turner elasticity of 1.0), and Marchetti's Constant (humans devote ~1 hour/day to travel regardless of technology). The Downs-Thomson Paradox shows that improving roads without improving transit can worsen equilibrium speeds.

**Gameplay role:** This prevents infinite growth via road-only strategies. The player must eventually invest in transit or face permanent demand suppression. Currently, roads have uniform capacity and no BPR-weighted routing — congestion is measured after the fact but does not influence route choice.

### 5. The Gentrification Loop (Mixed)

Investment that displaces existing residents.

```
    ┌─> Investment ──> Land Value Rise ──> Displacement ─┐
    │                                                      │
    └─── Commercial Decline <── Workforce Loss <───────────┘
```

**Mechanism (proposed, not yet implemented):** When infrastructure investment (transit, parks) raises land values and desirability in a previously low-value area, density upgrades accelerate. The "rent gap" — the difference between current use value and potential value — drives redevelopment. Existing low-density/low-rent buildings are demolished and replaced with higher-density, higher-rent structures. Existing residents who cannot afford the new rents are displaced. If the displaced residents were the workforce for nearby commercial establishments, those businesses lose customers and employees.

**Research grounding:** Urban-growth-patterns details the gentrification mechanism with quantitative displacement evidence. Social-dynamics-and-segregation describes Schelling-style sorting and Tiebout sorting by income. Population-and-demographics covers the eviction channel and where displaced residents go.

**Gameplay role:** This creates moral and strategic tension. The player wants to invest in neglected areas to raise values, but doing so without protective measures harms existing residents. Not yet in the game, but the rent-gap formula and displacement mechanics are well specified in the research.

### 6. The Sprawl Trap (Negative, Delayed)

Short-term gain masking long-term fiscal ruin.

```
    ┌─> Peripheral Development ──> Upfront Revenue ──> Apparent Growth ─┐
    │                                                                     │
    └── Fiscal Crisis <── Maintenance Backlog <── Infrastructure Aging <──┘
```

**Mechanism (partially implemented):** Extending infrastructure to the city edge provides immediate population growth and tax revenue. But the infrastructure cost scales with area while revenue scales with population density. Low-density suburban development generates $0.10-$0.20 of revenue per $1.00 of long-term liability. After one lifecycle (~25 years), replacement costs exceed cumulative revenue.

**Research grounding:** Municipal-finance documents the "Growth Ponzi Scheme" framework from Strong Towns. Revenue-per-acre data shows downtown mixed-use generates 10-70x more tax revenue per acre than suburban development. Utilities-and-infrastructure describes the infrastructure aging curve and the cost scaling formulas.

**Gameplay role:** Currently, Bitborough charges flat per-tile maintenance but has no infrastructure aging or lifecycle cost model. The sprawl trap is muted because maintenance costs do not increase over time. Adding infrastructure aging would make this loop tangible and teach the core lesson: compact development is fiscally sustainable.

### 7. The Pollution-Sorting Loop (Negative)

Environmental damage driving spatial inequality.

```
    ┌─> Industrial Growth ──> Pollution Increase ──> Desirability Drop ─┐
    │                                                                     │
    └── Concentrated Poverty <── Low Land Value <── Residential Sorting <─┘
```

**Mechanism:** Industrial buildings and diesel/coal power plants emit pollution defined by `pollutionRadius` and `pollutionAmount` in the building definitions. Pollution depresses residential desirability by up to 0.30 via `RES_POLLUTION_PENALTY`. Low desirability suppresses land values in `land-value.ts` (pollution penalty = pollutionLevel * 0.5). Low land values reduce base crime formula inputs, but the overall effect is reduced investment and residential avoidance of polluted areas.

**Research grounding:** Environment-and-sustainability documents Gaussian plume dispersion, environmental justice patterns, and the pollution-land value-sorting chain. Social-dynamics-and-segregation describes how environmental quality differences drive Tiebout sorting.

**Gameplay role:** This forces meaningful trade-offs in power plant placement and industrial zone positioning. The player learns to buffer industrial zones from residential areas — or invest in cleaner (but more expensive) power sources.

---

## First-Order Effects

Direct, immediate impacts. Building X causes Y, with no intermediate steps.

| Action | Immediate Effect | Source Module |
|--------|-----------------|---------------|
| Place zone tile | Tile becomes eligible for development | `zones.ts` |
| Build power plant | Nearby tiles receive power via BFS | `power.ts` |
| Build road | Tiles within Manhattan distance 3 gain road access | `road-access.ts` |
| Build police station | Crime reduced within 15-tile radius | `crime.ts` |
| Build fire station | Fire risk reduced within 15-tile radius | `fire.ts` |
| Place park | Residential desirability +0.25 within 5 tiles | `desirability.ts` |
| Place transit stop | Commercial desirability +0.35 within 10 tiles | `desirability.ts` |
| Set tax rate | Demand modifier shifts (neutral at 7%) | `demand.ts` |
| Set service funding | Service radius scales proportionally | `crime.ts`, `fire.ts` |
| Bulldoze building | Tile cleared, agents removed, routes invalidated | `Engine.ts` |

These are the legible interactions — the player takes an action and sees the result within one tick. Good game design ensures these first-order effects are clearly communicated.

---

## Second-Order Effects

Indirect impacts that emerge from chains of two or more first-order effects. These are what make city simulation more interesting than placing tiles on a grid.

### Road -> Sprawl -> Fiscal Stress

1. Building roads extends the area where development can occur (road access gate)
2. Development spreads to the periphery (low-density buildings on cheap land)
3. Peripheral development requires proportionally more road and power infrastructure per resident
4. Maintenance costs rise faster than tax revenue from low-density areas
5. Budget tightens, forcing tax increases or service cuts

**Time to manifest:** 10-30 game-months. The road is immediate; the fiscal stress accumulates gradually.

### Transit -> Density -> Agglomeration

1. Placing a transit stop creates a density anchor (high-density upgrade eligibility within 10 tiles)
2. Medium-density buildings near transit upgrade to high-density when occupancy reaches 85%
3. High-density clustering triggers agglomeration effects (proposed: productivity bonus from nearby same-type buildings)
4. Higher productivity justifies higher commercial rents, raising land values and tax revenue

**Time to manifest:** 12-24 game-months. Transit placement is immediate; high-density clustering takes time to reach occupancy thresholds.

### Police Cut -> Crime -> Population Flight

1. Reducing police funding shrinks coverage radius
2. Crime rises in uncovered areas
3. Residential desirability drops (crime penalty up to 0.30)
4. Fill targets decline, triggering population drain
5. Lower population reduces tax revenue, potentially forcing further cuts

**Time to manifest:** 3-6 game-months. Crime responds within one tick; population drain follows at DRAIN_RATE = 0.2 per tick.

### Park Placement -> Land Value -> Tax Revenue

1. Park provides +0.25 desirability bonus to residential tiles within 5-tile radius
2. Higher desirability increases fill targets, raising occupancy
3. Occupancy contributes to population, which drives tax revenue
4. Park also provides +10 land value bonus (decaying with distance) in `land-value.ts`
5. Higher land value directly increases per-capita tax income

**Time to manifest:** 1-3 game-months. Desirability updates immediately; population and revenue follow over several ticks.

### Industrial Growth -> Pollution -> Residential Avoidance

1. Industrial zones develop and densify (ind.low -> ind.med -> ind.high)
2. Pollution radius and amount increase (3/10 -> 4/20 -> 6/40)
3. Nearby residential desirability drops
4. Residential development is pushed away from industrial zones
5. Land values near industry decline, reducing tax revenue from those tiles

**Time to manifest:** 3-12 game-months. Industrial density upgrades are gated on occupancy thresholds; pollution effects propagate immediately upon upgrade.

---

## Third-Order and Emergent Effects

Effects that only emerge from multiple interacting systems over long time horizons. These are the "stories" that make city simulations memorable.

### The Transit-Led Transformation

```
Transit investment -> TOD density clustering -> agglomeration economies ->
economic growth -> population attraction -> housing pressure ->
density upgrade cascade -> land value spiral -> tax revenue boom ->
more transit investment capacity
```

This multi-system chain takes 3-5 game-years to fully manifest. The player places a transit stop in a medium-density area. High-density upgrades cluster around it. Commercial buildings follow (commercial desirability bonus from transit). Jobs attract more residents. Tax revenue from the dense node far exceeds what the same land produced at low density. The surplus funds further transit expansion. A single well-placed transit stop can catalyze a self-sustaining urban core.

### The Decline Cascade

```
Factory closure -> job loss -> unmatched worker fraction rises ->
residential demand drops -> population drain -> tax base erosion ->
service funding cuts -> crime increases -> desirability crash ->
dereliction cascade (High -> Medium -> Low) -> abandonment ->
adjacent areas lose population (spillover) -> city-wide contraction
```

This takes 1-3 game-years. The initial shock (losing industrial capacity) triggers a chain reaction through employment, demand, population, revenue, services, and desirability — each step amplifying the last. The dereliction mechanic (3 months below 10% occupancy -> downgrade) creates a visible cascade as high-rises become mid-rises become low-density buildings. Recovery requires deliberate investment in multiple systems simultaneously.

### The Sprawl Reckoning

```
Peripheral road building -> cheap land development -> population growth ->
apparent prosperity -> continued expansion -> infrastructure aging ->
maintenance costs spike -> budget deficit -> service cuts to fund maintenance ->
desirability drops in all areas -> population loss from core and periphery ->
revenue collapse -> inability to maintain either core or periphery
```

This takes 20-40 game-years (the infrastructure lifecycle from utilities-and-infrastructure). The player enjoys decades of easy growth before the maintenance wave hits. The trap is that the apparent success of sprawl encourages more sprawl, deepening the eventual crisis. Currently mostly absent from Bitborough due to flat maintenance costs and no infrastructure aging.

### The Gentrification Frontier

```
Transit investment in low-value area -> land value increase ->
rent gap widens -> density upgrades accelerate -> existing residents displaced ->
displaced residents move to adjacent low-value area -> that area now has
population pressure -> investment follows displaced population ->
gentrification frontier advances outward
```

Not yet implemented, but well specified in urban-growth-patterns and social-dynamics-and-segregation. The "frontier" pattern — where gentrification moves block by block outward from the initial investment — emerges naturally from the rent-gap mechanic spreading to adjacent tiles. Anti-displacement tools (inclusionary zoning, community land trusts) would give the player levers to modulate the speed and equity of this process.

---

## System Coupling Matrix

Rows are **source systems** (the cause). Columns are **target systems** (the effect). Each cell notes coupling strength and primary mechanism.

| | Transportation | Housing | Economy | Services | Environment | Finance | Population | Land Use |
|---|---|---|---|---|---|---|---|---|
| **Transportation** | -- | Moderate: commute length affects res. demand | Moderate: accessibility drives commercial location | Weak: emergency response times | Moderate: VMT drives air pollution | Moderate: road maintenance costs | Moderate: commute suppresses migration | Strong: road access gates development |
| **Housing** | Moderate: density drives trip generation | -- | Moderate: residential capacity enables commercial demand | Moderate: population drives service demand | Weak: construction disruption | Strong: population drives tax revenue | Strong: capacity is the population ceiling | Moderate: occupancy drives density upgrades |
| **Economy** | Moderate: job location drives commute patterns | Strong: employment drives housing demand | -- | Weak: commercial tax funds services | Moderate: industrial activity generates pollution | Strong: employment drives income and tax base | Strong: jobs are primary migration pull factor | Moderate: bid-rent sorts uses spatially |
| **Services** | Weak: fire/police affect road closures | Strong: crime/schools affect desirability | Weak: educated workforce productivity | -- | Weak: parks reduce pollution | Strong: service costs are major expense | Strong: desirability drives migration | Moderate: service quality affects upgrade probability |
| **Environment** | Weak: pollution doesn't affect roads | Strong: pollution reduces residential desirability | Moderate: brownfields suppress development | Weak: disasters increase service demand | -- | Moderate: pollution cleanup costs | Moderate: pollution drives out-migration | Strong: pollution depresses land values |
| **Finance** | Moderate: budget funds road maintenance | Weak: tax rate affects housing demand | Moderate: tax rate affects commercial location | Strong: budget determines service funding levels | Weak: budget for environmental cleanup | -- | Moderate: tax rate affects migration | Moderate: TIF/bonds fund development |
| **Population** | Strong: population generates traffic | Strong: household formation drives housing demand | Strong: labor supply enables economic growth | Strong: population determines service load | Moderate: density drives resource consumption | Strong: population is the tax base | -- | Moderate: demand pressure drives density upgrades |
| **Land Use** | Strong: density determines trip generation rate | Strong: zoning determines housing types allowed | Strong: zoning determines commercial/industrial capacity | Moderate: density affects service coverage efficiency | Moderate: land use determines impervious surface | Strong: development type determines revenue per acre | Strong: zoning determines population capacity | -- |

### Strongest Couplings (must be modeled)

1. **Population <-> Finance**: Population is the tax base; fiscal health determines service quality that retains population.
2. **Housing <-> Population**: Housing capacity is the binding constraint on growth; population drives housing demand.
3. **Land Use <-> Transportation**: Density determines trip generation; road access gates development.
4. **Services <-> Housing**: Crime, fire coverage, and parks directly modify residential desirability.
5. **Economy <-> Population**: Jobs are the primary pull factor; population provides the labor supply.

### Weakest Couplings (can be deferred)

1. **Services <-> Transportation**: Fire trucks in traffic is a real concern but adds little gameplay value.
2. **Finance <-> Environment**: Environmental cleanup budgets are important in reality but add complexity without proportional gameplay return.
3. **Environment <-> Services**: Disaster events increase service demand but can be modeled as discrete events rather than continuous coupling.

---

## Temporal Dynamics

Different interactions operate on different time scales. Getting the tempo right is critical — too-fast feedback loops feel mechanical; too-slow loops are invisible.

### Immediate (same tick)

| Interaction | Time Scale | Example |
|---|---|---|
| Power propagation | Every tick | Plant placed -> BFS -> tiles powered |
| Road access check | Every tick | Road built -> nearby tiles gain access |
| Fire spread | Every monthly tick | Active fire -> 15% spread chance to neighbors |

### Fast (1-3 months)

| Interaction | Time Scale | Example |
|---|---|---|
| Crime response to funding | 1 month | Cut police -> crime rises next month |
| Desirability recalculation | 1 month | Park placed -> desirability bonus next month |
| Demand adjustment | 1 month | Tax change -> demand shift next month |
| Route replanning | 1 month | Road change -> stale routes replanned next month |
| Traffic density update | 1 month | New agents -> traffic layer recomputed |

### Medium (3-12 months)

| Interaction | Time Scale | Example |
|---|---|---|
| Building fill/drain | 3-6 months | Target tracking at FILL_RATE 0.12 / DRAIN_RATE 0.2 |
| Dereliction trigger | 3 months | Below 10% occupancy for 3 months -> derelict state |
| Density upgrade eligibility | 6-12 months | Reaching 70-85% occupancy in neighborhood |
| Construction completion | 2 months | All upgrades take a fixed 2 months currently |

### Slow (1-5 years)

| Interaction | Time Scale | Example |
|---|---|---|
| Density cascade | 1-3 years | Low -> Medium -> High upgrade chain |
| Budget stress accumulation | 1-2 years | Gradual deficit from sprawling infrastructure |
| Population growth S-curve | 2-5 years | Logistic growth approaching carrying capacity |
| Commercial ecosystem | 1-2 years | Retail follows rooftops with delay |

### Very Slow (5+ years, mostly proposed)

| Interaction | Time Scale | Example |
|---|---|---|
| Infrastructure aging | 20+ years | Road condition decline, maintenance cost spike |
| Housing filtering | 50+ years | High-end stock gradually serves lower-income tiers |
| Market cycles | 18 years | Real estate boom/bust cycle |
| Gentrification frontier | 5-15 years | Block-by-block neighborhood transformation |
| Disinvestment persistence | 10+ years | Redlining effects that outlast the cause |

### Timeline Visualization

```
Tick 1        Month 1        Month 6        Year 1         Year 5         Year 20
  │              │              │              │              │              │
  ├─ Power BFS   ├─ Crime       ├─ Dereliction ├─ Density     ├─ Population  ├─ Infra aging
  ├─ Road access ├─ Desirability├─ Fill/drain  │  cascade     │  S-curve     │  (proposed)
  │              ├─ Demand      ├─ Construction├─ Budget      ├─ Market      ├─ Filtering
  │              ├─ Traffic     │  completion  │  stress      │  cycle       │  (proposed)
  │              ├─ Fire spread │              │              │  (proposed)  │
  │              │              │              │              │              │
  IMMEDIATE ──── FAST ───────── MEDIUM ─────── SLOW ───────── VERY SLOW ────
```

---

## Currently Implemented in Bitborough

The following maps engine source files to the interaction model. This represents the simulation as it exists today.

### Active Interactions

| Interaction | Source File(s) | Mechanism |
|---|---|---|
| Zone -> Development | `zones.ts` | 12% x zoneDemand probability per tick for powered, road-accessible empty tiles |
| Demand driven by tax rate | `demand.ts` | taxModifier = 1.0 - (taxRate - 0.07) * 5.0 |
| Commercial follows residential | `demand.ts` | cBase = min(totalResCap / 500, 0.6) |
| Congestion suppresses demand | `demand.ts` | Penalty when avg congestion > 0.8, scaling to 0.5 at 2.0 |
| Commute length suppresses res. demand | `demand.ts` | Up to -0.3 penalty when avg commute > 30 tiles |
| Unmatched jobs boost I/C demand | `demand.ts` | unmatchedJobFraction * 0.3 for industrial, * 0.15 for commercial |
| Desirability gates fill target | `density.ts` | target = capacity * max(0, demand) * desirability |
| Fill/drain population tracking | `density.ts` | FILL_RATE 0.12, DRAIN_RATE 0.2 per tick |
| Clark's Law density gradient | `density.ts` | upgradeProb = demand * e^(-dist / radius), radius grows with sqrt(pop) |
| Transit -> high density gate | `density.ts` | hasNearbyTransitStop() required for Medium -> High upgrade |
| Critical mass for high density | `density.ts` | >50% of neighbors within 3 tiles must be Medium+ |
| Dereliction and downgrade | `density.ts` | 3 months below 10% occupancy -> derelict; 6 months derelict -> downgrade |
| Power BFS propagation | `power.ts` | BFS through conductors (power lines, roads, zones, buildings) with capacity limit |
| Crime from land value + police | `crime.ts` | rawCrime = max(0, 30 - lv * 0.15); policeEffect = influence * 40 |
| Fire risk from coverage | `fire.ts` | effectiveRisk = 0.001 * (1 - coverage * 0.9); spread at 15% * (1 - neighborCoverage * 0.7) |
| Land value from terrain + infrastructure | `land-value.ts` | Base 10 + water adjacency + park bonus + road access - pollution - crime |
| Res. desirability formula | `desirability.ts` | 0.30 baseline + 0.30 safety + 0.15 fire + 0.25 park - 0.30 pollution |
| Com. desirability formula | `desirability.ts` | 0.40 baseline + 0.35 transit + 0.25 residential density |
| Industrial desirability | `desirability.ts` | Always 1.0 (flat) |
| Tax revenue | `budget.ts` | population * avgLandValue / 20 * taxRate |
| Maintenance costs | `budget.ts` | Per-tile road/rail/powerline costs + per-building power plant costs |
| Service costs | `budget.ts` | Per-station cost * funding percentage |
| Agent-based traffic | `citizens.ts` | 1:50 sampling, A* pathfinding, traffic density from route overlay |
| Route invalidation | `citizens.ts` + `Engine.ts` | Road changes mark agent routes stale; replanned next monthly tick |

### Interaction Flow in Engine.tick()

Each monthly tick executes in this order (from `Engine.ts`):

1. `calculateDemand()` — uses tax rate, traffic, citizen summary
2. `calculateLandValues()` — uses power, pollution, crime
3. `calculateCrime()` — uses land values, police funding
4. `calculateFireCoverage()` — uses fire funding
5. `updateFires()` — uses fire coverage, randomness
6. `citizenMonthlyTick()` — replans stale routes, writes traffic density
7. `computeCitizenSummary()` — aggregates agent satisfaction/commute data
8. `updateZones()` — develops empty tiles based on demand
9. `updateDensity()` — fill/drain, dereliction, upgrades
10. `syncAgentsForBuilding()` — creates/removes agents to match population
11. `calculateBudget()` — computes revenue, costs, balance
12. Loan/bankruptcy checks

**Note on ordering:** Land values use the previous month's crime level, while crime uses the current month's land values. This one-tick lag creates a mild damping effect that prevents crime-land-value oscillation.

---

## Missing Interactions

Interactions documented in the research but not yet in the engine, prioritized by gameplay impact.

### High Priority (significant gameplay depth)

**1. BPR-Weighted Routing** (transportation-and-traffic)
Currently all road edges have weight 1 — congestion does not affect route choice. Adding edge costs of `1.0 + 0.15 * (traffic/capacity)^4` would cause agents to naturally distribute across alternative routes instead of piling onto the shortest geometric path. This is the single highest-impact improvement to traffic realism.

**2. Road Hierarchy / Typed Roads** (transportation-and-traffic)
Only two road types exist (road, paved road). Adding capacity tiers (local 50, collector 150, arterial 400) would create meaningful road-building decisions. The BPR function handles heterogeneous capacity naturally.

**3. Infrastructure Aging** (utilities-and-infrastructure)
All infrastructure has flat, constant maintenance costs. Adding a condition score that degrades over time (hockey-stick curve) would create the "sprawl reckoning" loop and make maintenance a strategic concern. Lifespan targets from research: roads 20yr, power lines 40yr, water pipes 50yr.

**4. Per-Tile Tax Productivity** (municipal-finance)
Tax revenue is currently averaged across all developed tiles. Computing it per-tile using land value and density multiplier would make the revenue-per-acre dynamic visible and reward compact development.

**5. Pollution Dispersion Layer** (environment-and-sustainability)
Pollution amounts are defined in building defs but the `pollutionLevel` array is allocated and read by desirability but never actively populated by a propagation step. Implementing the per-tick dispersion (linear decay within radius) would make pollution a tangible force.

### Medium Priority (adds strategic depth)

**6. Export Base Multiplier** (economy-and-employment)
No distinction between basic (export) and non-basic (local-serving) employment. Adding this would create a meaningful relationship between industrial zoning and overall economic capacity.

**7. Vacancy Rate Feedback** (housing)
No city-wide vacancy tracking. Adding vacancy rate modulation of demand and rent growth would prevent over-building and create a housing market signal.

**8. Education Service Building** (public-services)
No school mechanic. Adding schools with influence-based desirability bonuses and capacity constraints would create a new service investment decision and model the school-property-value capitalization effect.

**9. Construction Lag by Density** (real-estate-development)
All upgrades take a fixed 2 months. Differentiating (1 month for low, 3 for medium, 6 for high) would make supply response more realistic and create meaningful lag during demand spikes.

**10. Induced Demand** (transportation-and-traffic)
Building new roads does not generate additional demand. Adding a capacity-proportional demand boost when roads are built would mirror the Duranton-Turner finding and prevent road expansion from permanently solving congestion.

### Lower Priority (adds realism, less gameplay payoff)

**11. Wealth Tiers** (social-dynamics-and-segregation, population-and-demographics)
No income differentiation among citizens. Adding 3 tiers with different sensitivities to tax, crime, pollution, and commute would produce emergent income segregation.

**12. Market Cycles** (real-estate-development)
No cyclical variation in development activity. An 18-year market cycle modulating cap rates and developer confidence would create boom-bust dynamics.

**13. Walkability Score** (urban-design-and-walkability)
No walkability metric. A per-tile score from intersection density, mixed-use proximity, and street quality would create a new design dimension.

**14. Neighborhood Reputation Layer** (social-dynamics-and-segregation)
No path-dependent neighborhood quality tracking. A slow-moving reputation score would create sticky spatial patterns that resist rapid change.

**15. Disaster Events** (disaster-and-resilience)
Only fire exists as a hazard. Earthquakes, floods, and droughts would add late-game challenge and reward resilience investment.

**16. Water/Sewer Infrastructure** (utilities-and-infrastructure)
No water or sewer systems. Adding these as density prerequisites (medium/high density requires water/sewer) would create a natural infrastructure investment curve.

---

## Design Principles for System Interactions

Guidelines for adding new interactions to Bitborough, grounded in what makes city simulation compelling.

### 1. Legibility: Can the Player See Cause and Effect?

Every interaction should be observable through the game's overlay layers or statistics panel. The chain from player action to system response to visible outcome must be traceable.

**Good example (already implemented):** Place police station -> crime overlay shows reduced crime in radius -> residential desirability rises (visible in desirability overlay) -> buildings fill faster (visible in population counter).

**Bad example (to avoid):** A hidden multiplier that adjusts commercial productivity based on a formula the player cannot inspect. The player sees commercial buildings underperforming but cannot diagnose why.

**Guideline:** Every system variable that affects gameplay should be visualizable as an overlay layer, a per-building tooltip value, or a city-wide statistic. If a new interaction cannot be shown to the player, reconsider whether it adds gameplay value or just hidden complexity.

### 2. Appropriate Time Delay

Feedback loops need delays that match their real-world tempo scaled to game-time, but more importantly, delays that create interesting decision-making windows.

**Too fast:** If crime responds instantly to police funding changes, the player can micro-manage by toggling funding up during crises and down during calm periods. The system becomes a whack-a-mole game rather than a strategic one.

**Too slow:** If the sprawl trap only manifests after 40 game-years, most players will never experience it. The lesson is invisible.

**Guideline:** The most important feedback loops should manifest within 1-5 game-years (12-60 monthly ticks). Faster loops (power, road access) serve as infrastructure gates. Slower loops (market cycles, infrastructure aging) create long-term strategic arcs. Each loop should have at least one intermediate signal the player can read before the full effect hits — a "warning phase" that rewards attentive play.

### 3. Strength Tuning: Avoiding Runaway Dynamics

Positive feedback loops create exponential growth or collapse if unchecked. Every reinforcing loop needs a counterbalancing force or saturation point.

**The Growth Loop** is bounded by carrying capacity (housing, jobs, infrastructure). Even with infinite demand, growth cannot exceed the physical capacity the player has built.

**The Decline Loop** is bounded by the floor of the system — a building cannot lose more than 100% of its residents, and dereliction bottoms out at low-density buildings that reset to active state.

**Guideline:** Every positive feedback loop should have an identified saturation mechanism. Before adding a new reinforcing loop, document what stops it from running to infinity. The logistic growth model (growth rate proportional to `1 - P/K`) is the default pattern: strong when far from capacity, weak near it.

### 4. Damping Mechanisms

Real cities have built-in dampers that prevent oscillation. The simulation needs them too.

**Implemented damper:** The one-tick lag between land value calculation and crime calculation in `Engine.ts` prevents land-value-crime oscillation. Land values use last month's crime; crime uses this month's land values.

**Needed damper:** If BPR-weighted routing is added, traffic reassignment should not happen for all agents every tick (that would cause oscillation). Instead, only stale routes should be replanned, and a fraction of agents could be randomly selected for replanning each month.

**Guideline:** When two systems form a tight feedback loop (A raises B, B lowers A), introduce either a time lag (A reads B's value from last tick) or a smoothing function (A responds to an exponential moving average of B, not its instantaneous value). Both approaches prevent the oscillation that makes simulation feel "twitchy."

### 5. Asymmetric Response: Growth is Slower Than Decline

Real cities grow slowly and decline quickly. This asymmetry is already present in Bitborough (FILL_RATE 0.12 < DRAIN_RATE 0.2) and should be maintained in all new interactions.

**Guideline:** When adding a new system that has both positive and negative modes, the negative response should be 1.5-2x faster than the positive response. This makes mistakes costly and recovery hard-won — which is both realistic and creates better gameplay tension.

### 6. Interaction Density: The Goldilocks Zone

Too few interactions produce a spreadsheet game where each system is an independent number to optimize. Too many produce an opaque mess where the player cannot reason about outcomes.

**Current state:** Bitborough has approximately 20 active interactions (see the table in "Currently Implemented"). This is a good foundation but some areas are thin — economy has minimal coupling to other systems, environment is mostly scaffolded but not active.

**Guideline:** Each system should have 2-4 strong couplings to other systems and 1-2 feedback loops it participates in. More than that creates cognitive overload. The coupling matrix in this document identifies which connections have the highest gameplay-per-complexity ratio. Prioritize those.

### 7. Emergence Over Scripting

The best city simulation moments are emergent — patterns the designer did not explicitly code but that arise from system interactions. Scripted events (achievements, milestones) provide structure, but the core experience should come from the systems.

**Emergent example:** The density gradient in Bitborough is not hardcoded — it emerges from Clark's Law decay applied to upgrade probability. The player sees a skyline form around the city center without anyone having specified "put tall buildings here."

**Scripted example:** An achievement for reaching 10,000 population provides a milestone but does not create interesting dynamics.

**Guideline:** Favor systems that produce spatial patterns, temporal patterns, or strategic dilemmas through interaction rather than conditional triggers. Every new mechanic should be evaluated not just for its direct effect but for what emergent behavior it enables when combined with existing mechanics.

---

## References

Each section draws on specific research documents:

| Section | Primary Sources |
|---|---|
| Master Causal Map | All 16 documents (cross-reference index) |
| Growth Loop | population-and-demographics, municipal-finance, housing |
| Density Loop | transit-oriented-development, urban-density-gradients |
| Decline Loop | municipal-finance, public-services, population-and-demographics |
| Traffic Loop | transportation-and-traffic |
| Gentrification Loop | urban-growth-patterns, social-dynamics-and-segregation |
| Sprawl Trap | municipal-finance (Growth Ponzi Scheme, Revenue Per Acre) |
| Pollution-Sorting Loop | environment-and-sustainability, social-dynamics-and-segregation |
| First-Order Effects | Derived from engine source code |
| Second-Order Effects | Cross-references across multiple documents |
| Third-Order Effects | Synthetic analysis of multi-document chains |
| Coupling Matrix | All 16 documents, weighted by mechanism specificity |
| Temporal Dynamics | All 16 documents, with game-time calibration from engine constants |
| Currently Implemented | Engine source: `Engine.ts`, `demand.ts`, `desirability.ts`, `density.ts`, `citizens.ts`, `budget.ts`, `land-value.ts`, `zones.ts`, `power.ts`, `crime.ts`, `fire.ts` |
| Missing Interactions | Gap analysis between research recommendations and engine code |
| Design Principles | Synthesis of gameplay observations with research on system dynamics |
