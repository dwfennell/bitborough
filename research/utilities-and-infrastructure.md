# Utilities and Infrastructure

> How power, water, sewer, and waste systems serve cities — engineering models for infrastructure simulation.

## Table of Contents

- [Power Generation](#power-generation)
- [Power Distribution](#power-distribution)
- [Water Supply](#water-supply)
- [Wastewater and Sewer](#wastewater-and-sewer)
- [Stormwater Management](#stormwater-management)
- [Solid Waste Management](#solid-waste-management)
- [Telecom and Broadband](#telecom-and-broadband)
- [Infrastructure Lifecycle](#infrastructure-lifecycle)
- [Infrastructure Costs](#infrastructure-costs)
- [Capacity Planning](#capacity-planning)
- [Infrastructure and Development](#infrastructure-and-development)
- [Application to Bitborough](#application-to-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

---

## Power Generation

Electricity generation is the foundation utility — nearly every other service depends on it. Power plants convert primary energy (fuel, sunlight, wind, falling water) into electrical energy, and each technology occupies a distinct niche defined by its capacity factor, capital cost, fuel cost, and dispatchability.

### Generation technologies

| Technology | Typical Plant Size | Capacity Factor | Overnight Capital Cost ($/kW) | LCOE ($/MWh) | Dispatchable? |
|---|---|---|---|---|---|
| Diesel generator | 1-10 MW | 10-30% | 500-800 | 150-250 | Yes |
| Natural gas (combustion turbine) | 100-300 MW | 10-30% | 560-900 | 100-170 | Yes (peaker) |
| Natural gas (combined cycle) | 300-900 MW | 55-65% | 820-1,200 | 40-75 | Yes (baseload) |
| Coal (subcritical/supercritical) | 300-1,300 MW | 40-55% | 2,000-4,000 | 65-150 | Yes (baseload) |
| Nuclear (light-water reactor) | 1,000-1,400 MW | 90-93% | 6,000-8,000 | 70-170 | Yes (baseload) |
| Onshore wind | 2-5 MW per turbine | 30-45% | 1,200-1,700 | 25-55 | No |
| Offshore wind | 8-15 MW per turbine | 40-55% | 2,500-5,000 | 60-120 | No |
| Solar PV (utility-scale) | 1-500 MW | 20-30% | 800-1,400 | 25-55 | No |

Sources: EIA AEO2025 Capital Cost and Performance report; Lazard LCOE+ June 2025; NREL ATB 2024; World Nuclear Association economics data. Costs in 2024 USD.

**Capacity factor** is the ratio of actual energy output to theoretical maximum output over a period. A 100 MW plant with a 90% capacity factor produces 90 MW on average. Nuclear leads at ~92%, followed by natural gas combined cycle at ~55-65%, then coal at ~40-55%. Wind and solar capacity factors reflect intermittency — they produce power only when the wind blows or the sun shines.

**Dispatchability** — whether a plant can ramp up or down on command — is the critical axis for grid reliability. Baseload plants (nuclear, coal, gas CC) run continuously at high output. Peaker plants (gas turbines, diesel) start quickly to meet demand spikes but have high per-unit fuel costs. Intermittent sources (wind, solar) require either storage or dispatchable backup.

### Pollution and externalities

Each generation type carries environmental costs:

- **Diesel**: High local air pollution per MWh; noise; small footprint. Used mainly for backup and off-grid.
- **Coal**: SO2, NOx, particulates, mercury, CO2. Historically the dominant baseload source; now in structural decline.
- **Natural gas**: ~50% of coal's CO2 per MWh; lower particulates; methane leakage during extraction adds climate impact.
- **Nuclear**: Zero direct emissions; waste storage and accident risk are the primary concerns; very large exclusion zones required.
- **Wind/Solar**: Near-zero operational emissions; land use and visual impact; manufacturing emissions amortize over the lifetime.

---

## Power Distribution

Generating electricity is only half the problem. Delivering it to consumers requires a hierarchical network of transmission and distribution infrastructure.

### Voltage hierarchy

| Level | Voltage Range | Purpose |
|---|---|---|
| Generation | 11-25 kV | Output from generators |
| Transmission | 115-765 kV | Long-distance bulk transport |
| Sub-transmission | 26-69 kV | Regional feeders to substations |
| Primary distribution | 4-35 kV | Feeders along streets to neighborhoods |
| Secondary distribution | 120-480 V | Final delivery to buildings |

Step-up transformers at generation plants raise voltage for transmission (high voltage reduces current, which reduces resistive losses over long distances). Step-down transformers at substations reduce voltage for distribution.

### Grid topologies

Three standard distribution network configurations:

**Radial**: A single feeder line branches outward like a tree. Simplest and cheapest topology. A fault anywhere on the feeder blacks out all downstream consumers. This is the dominant topology for suburban and rural distribution.

**Loop (ring)**: Feeders form a closed ring, with switches that can isolate faulted sections. More reliable than radial — a single fault does not cause a total outage. Common in urban areas with higher reliability requirements.

**Network (mesh)**: Multiple feeders interconnect via ties, providing redundant paths. Most reliable but most expensive. Reserved for dense urban cores (Manhattan, downtown Chicago) where outage cost per hour is enormous.

### Load balancing and blackouts

Grid operators must continuously balance generation with demand. The key constraints:

- **Frequency regulation**: Supply and demand must match instantaneously. Surplus generation speeds up the grid (frequency rises above 60 Hz); deficit slows it down. Generators have automatic governor controls that adjust output in real time.
- **Demand curves**: Residential demand peaks in evening hours (heating, cooking, lighting). Commercial demand peaks during business hours. Industrial demand is often flat (24/7 operations). The combined system peak typically occurs on hot summer afternoons (air conditioning load).
- **Cascading failures**: When a generator or transmission line trips offline, remaining lines carry more current, potentially overloading and tripping in turn. This is the mechanism behind large-scale blackouts — the 2003 Northeast blackout cascaded from a single software bug and untrimmed trees to affect 55 million people.

---

## Water Supply

Municipal water systems have three stages: source, treatment, and distribution.

### Sources

- **Surface water** (rivers, reservoirs, lakes): ~60% of US public supply. Vulnerable to drought, pollution, and seasonal variation. Requires full treatment.
- **Groundwater** (wells, aquifers): ~40% of US public supply. Generally cleaner but limited by recharge rates. Over-pumping causes subsidence and saltwater intrusion.
- **Desalination**: Growing in arid coastal regions. Energy-intensive (~3-5 kWh per cubic meter for reverse osmosis). Capital cost ~$4,000/m3/day of capacity.

### Treatment

Conventional water treatment follows a standard sequence:

1. **Coagulation/flocculation** — chemicals bind suspended particles into clumps
2. **Sedimentation** — clumps settle out under gravity
3. **Filtration** — water passes through sand, gravel, or membrane filters
4. **Disinfection** — chlorine, chloramine, UV, or ozone kills pathogens

Treatment plant costs: $3-15 million per MGD (million gallons per day) of capacity, depending on source water quality, technology, and local construction costs.

### Per-capita consumption

| Category | Gallons per Capita per Day (gpcd) |
|---|---|
| Indoor residential | 50-70 |
| Outdoor residential (irrigation) | 20-100+ (climate-dependent) |
| Commercial/institutional | 20-45 |
| Industrial | Highly variable |
| System losses (leakage) | 10-30% of total |
| **Total public supply** | **80-180** |

The US average is approximately 82 gallons per person per day for indoor residential use (EPA/WaterSense). Total public supply withdrawals, including all sectors, average ~140-180 gpcd nationally but vary enormously by climate — Idaho at 184 gpcd vs. Wisconsin at 78 gpcd. Arid western states consume far more due to irrigation demand.

Conservation trends are notable: per-capita use has declined ~20% since 1985 due to low-flow fixtures, efficient appliances, and pricing signals.

### Distribution networks

Water distribution mirrors power distribution in many ways:

- **Trunk mains** (24-60 inch diameter): carry water from treatment plants to service areas
- **Distribution mains** (6-16 inch): feed neighborhoods and commercial districts
- **Service lines** (3/4-2 inch): connect individual buildings

System pressure is maintained at 40-80 psi via pumping stations and elevated storage tanks (water towers). Gravity-fed systems from reservoirs at elevation reduce pumping costs. Distribution networks are looped (not radial) wherever possible to maintain pressure and provide redundancy during main breaks.

---

## Wastewater and Sewer

Wastewater systems collect, transport, and treat sewage before discharge. They are gravity-dependent, making topography central to their design.

### Collection systems

**Separate sewer systems**: Dedicated pipes carry sanitary sewage only. Stormwater has its own system. Modern standard in most US cities built after ~1940.

**Combined sewer systems**: A single pipe carries both sanitary sewage and stormwater. Common in older cities (NYC, Chicago, Philadelphia). During heavy rain, capacity is exceeded and untreated combined sewage overflows (CSOs) discharge directly to waterways — a major environmental problem.

Sewer mains are sized for peak flow, typically 2-4x average dry-weather flow, to handle infiltration and inflow during storms. Pipe diameters range from 8 inches (laterals) to 10+ feet (interceptors).

### Treatment levels

| Level | Process | Removal Rates | Typical Cost |
|---|---|---|---|
| Primary | Physical settling, screening | 40-60% suspended solids, 25-35% BOD | Lower |
| Secondary | Biological (activated sludge, trickling filter) | 85-95% BOD, 85-95% suspended solids | ~$12M per MGD |
| Tertiary | Filtration, nutrient removal, disinfection | 95-99% of remaining contaminants | ~$15-20M per MGD |

Most US plants provide secondary treatment as a minimum (Clean Water Act requirement). Tertiary treatment is required in sensitive watersheds or where effluent is reused.

### Capacity planning

Wastewater treatment plants are designed for a 20-year planning horizon. Key design parameter: gallons per capita per day of wastewater generated, which typically runs at 60-80% of water consumption (the rest is consumed — irrigation, evaporation, product incorporation). A city of 100,000 at 70 gpcd wastewater flow needs a plant rated for ~7 MGD average daily flow, with peak capacity of 14-21 MGD to handle wet-weather surges.

---

## Stormwater Management

Stormwater is the forgotten utility — it has no treatment plant and no revenue stream, but failures cause flooding, property damage, and water quality degradation.

### The impervious surface problem

Natural ground absorbs 70-80% of rainfall through infiltration. Urban development replaces soil and vegetation with roofs, roads, and parking lots — impervious surfaces that generate runoff instead of absorption.

| Land Cover | Impervious % | Runoff Coefficient |
|---|---|---|
| Forest/undeveloped | 0-5% | 0.05-0.15 |
| Low-density residential (1 acre lots) | 12-20% | 0.15-0.25 |
| Medium-density residential | 25-40% | 0.30-0.50 |
| High-density residential / commercial | 50-80% | 0.50-0.75 |
| CBD / industrial | 75-100% | 0.70-0.95 |

Research shows impervious surface percentage has the strongest explanatory power (~70%) for urban waterlogging risk. A watershed crossing 10% imperviousness begins to show measurable stream degradation; at 25%+, stream ecology is severely impaired.

### Stormwater infrastructure

**Gray infrastructure**: Storm drains, pipes, culverts, detention basins. Sized using the Rational Method:

```
Q = C × i × A
```

- `Q` = peak runoff flow (cubic feet per second)
- `C` = runoff coefficient (from table above)
- `i` = rainfall intensity (inches/hour) for a design storm (e.g., 10-year, 25-year return period)
- `A` = drainage area (acres)

**Green infrastructure**: Bioswales, rain gardens, permeable pavement, green roofs, urban tree canopy. These systems retain or infiltrate stormwater at the source, reducing peak flows. Studies show green stormwater infrastructure is particularly effective at mitigating runoff for storms under 0.8 inches of precipitation, and cascading green-gray systems can reduce total runoff and peak flows by ~50%.

### Flooding risk

Flooding is a function of storm intensity, drainage capacity, and imperviousness. Cities face increasing flood risk from both development (more impervious surface) and climate change (more intense storms). The 100-year floodplain — an area with a 1% annual chance of flooding — is a key planning constraint.

---

## Solid Waste Management

Municipal solid waste (MSW) generation in the US totaled 292 million tons in 2018 — approximately 4.9 pounds per person per day, up from 3.7 lbs/person/day in 1980.

### Disposal methods (US, 2018)

| Method | Percentage | Tons (millions) |
|---|---|---|
| Landfill | 50.0% | 146.1 |
| Recycling | 23.6% | 69.0 |
| Composting | 8.5% | 24.9 |
| Combustion (waste-to-energy) | 11.8% | 34.6 |
| Other | 6.1% | 17.8 |

Landfill rates have declined dramatically from 94% in 1960, but landfilling remains the dominant disposal method. The national recycling/composting rate is 32.1%.

### Collection and logistics

Residential collection is typically weekly curbside pickup. A single collection truck serves 800-1,200 households per day along optimized routes. Collection costs represent 50-70% of total solid waste management costs — the logistics are more expensive than the disposal.

**Transfer stations** aggregate waste from collection vehicles into larger long-haul trucks or rail cars, reducing transport costs to distant landfills. Cities with no nearby landfill capacity rely heavily on transfer stations.

### Landfill engineering

Modern sanitary landfills are engineered containment systems: clay and synthetic liners prevent leachate (contaminated water) from reaching groundwater, leachate collection systems pump and treat liquids, and gas collection systems capture methane (which can be flared or used for energy). Landfill lifespan depends on volume — a typical regional landfill serves 20-50 years.

### Waste-to-energy

Waste-to-energy (WtE) plants incinerate MSW at 1,800-2,200 degF, generating steam that drives turbines. A modern WtE plant produces roughly 500-600 kWh per ton of waste. Capital costs are high ($500-800M for a 3,000 ton/day facility) but they dramatically reduce landfill volume (ash residue is ~10% of original waste volume by mass).

---

## Telecom and Broadband

While telecom is less critical for a city-builder simulation, it follows infrastructure patterns worth noting.

### Infrastructure types

- **Copper (DSL)**: Legacy telephone infrastructure repurposed for data. Range-limited (~3 miles from central office). Declining.
- **Cable (HFC)**: Coaxial cable networks originally built for cable TV. Shared bandwidth among neighborhood nodes.
- **Fiber optic**: Glass strands carrying light signals. Highest capacity (symmetric multi-gigabit). Expensive to deploy ($20,000-50,000 per mile in urban areas) but lowest per-bit cost once built.
- **Wireless (4G/5G)**: Cell towers serve coverage areas. 5G mmWave has very short range (~500m) requiring dense small-cell deployment in urban areas; sub-6 GHz 5G covers larger areas but at lower speeds.

### Coverage patterns

Telecom infrastructure follows development — it is almost never built ahead of demand. Coverage radiates outward from population centers along major corridors. Dense urban areas get fiber and 5G first; rural areas rely on wireless, satellite, or remain underserved. This "follow demand" pattern contrasts with power and water, which must be provisioned before buildings are occupied.

---

## Infrastructure Lifecycle

All infrastructure assets degrade over time. Understanding lifecycle timelines is critical for budgeting and simulation.

### Typical asset lifespans

| Asset Type | Material | Expected Lifespan |
|---|---|---|
| Water mains | Cast iron | 75-100 years |
| Water mains | Ductile iron | 80-100 years |
| Water mains | PVC | 75-110 years |
| Sewer mains | Vitrified clay | 100+ years |
| Sewer mains | Concrete | 50-75 years |
| Sewer mains | PVC | 75-100 years |
| Power lines (overhead) | Steel/aluminum | 40-70 years |
| Power lines (underground) | Copper/aluminum | 25-40 years |
| Power plant (gas turbine) | — | 30-40 years |
| Power plant (coal) | — | 40-60 years |
| Power plant (nuclear) | — | 40-80 years (with license extensions) |
| Roads (asphalt) | — | 15-20 years (surface); 40+ years (base) |
| Water treatment plant | — | 40-50 years (major rehab at 20-25) |
| Wastewater treatment plant | — | 40-50 years |
| Bridges | Steel/concrete | 50-75 years |

Source: EPA buried infrastructure white papers; ASCE Infrastructure Report Card 2021; WSSC Water aging infrastructure data.

### The aging infrastructure crisis

In the US, over 40% of water mains are more than 50 years old. These older pipes — typically cast iron or asbestos cement — have reached the end of their design life. The American Society of Civil Engineers estimates the US needs $2.6 trillion in infrastructure investment over the next decade just to maintain current condition grades.

### Degradation model

Infrastructure condition can be modeled as a declining curve:

```
condition(t) = 100 × (1 - (t / lifespan)^k)
```

Where `k` controls the degradation shape:
- `k < 1`: Rapid early degradation, then slowing (unusual)
- `k = 1`: Linear degradation
- `k = 2`: Slow early degradation, accelerating failure (most realistic — the "hockey stick" pattern)
- `k = 3`: Even more aggressive late-life failure

Most infrastructure follows `k ≈ 2-3`: it performs well for decades, then deteriorates rapidly in the last 20-30% of its lifespan. This creates a political challenge — deferred maintenance is invisible until systems start failing.

---

## Infrastructure Costs

Infrastructure costs divide into capital expenditures (capex) and operating expenditures (opex). The ratio varies dramatically by utility type.

### Capital vs. operating costs

| Utility | Capex Share | Opex Share | Key Opex Drivers |
|---|---|---|---|
| Water | 70-80% | 20-30% | Pumping energy, chemicals, labor |
| Wastewater | 70-80% | 20-30% | Pumping, aeration energy, sludge disposal |
| Power generation | 30-80% | 20-70% | Fuel (gas/coal) or zero (wind/solar) |
| Power distribution | 80-90% | 10-20% | Line maintenance, vegetation management |
| Stormwater | 85-95% | 5-15% | Pipe cleaning, inlet maintenance |
| Solid waste | 20-30% | 70-80% | Collection labor, fuel, disposal fees |

Nuclear and renewable power are capital-heavy with minimal opex. Gas and coal power have lower capex but significant ongoing fuel costs. Solid waste is the opposite — ongoing collection labor dominates.

### Economies of scale

Infrastructure costs per capita decrease with city size, following a power-law relationship:

```
cost_per_capita = C × population^(-0.15 to -0.20)
```

Research shows infrastructure scales at approximately the 0.8 power of population growth — a city doubling in population needs only ~1.74x the infrastructure investment (not 2x). This sublinear scaling arises because:

- Pipe and wire networks are shared among more users
- Treatment plants have fixed overhead that is spread over more capacity
- Denser development requires less linear infrastructure per connection

However, this relationship has limits. Very large cities face diseconomies from congestion, aging systems, and coordination costs. Per-capita spending is highest in both very small municipalities (under 1,000 residents) and very large cities (above 50,000), though for different reasons — small towns lack scale while large cities provide higher service levels.

### Density effects

Development pattern is as important as population size. Research consistently finds that sprawl costs 2-3x as much per household as compact development for hard infrastructure:

| Development Pattern | Infrastructure Cost per Housing Unit |
|---|---|
| Compact urban (10+ units/acre) | $10,000-20,000 |
| Suburban (3-5 units/acre) | $25,000-40,000 |
| Exurban/rural (< 1 unit/acre) | $50,000-100,000+ |

A Halifax regional study found exurban patterns imposed up to 10x the lifecycle infrastructure cost of compact patterns. At the national level, one estimate places the total cost of suburban sprawl in the United States at $1 trillion per year.

---

## Capacity Planning

Utilities must build infrastructure ahead of demand, since construction timelines are long (2-10 years for major facilities) and service interruptions are unacceptable.

### Reserve margins

Electric utilities maintain reserve margins — excess generation capacity beyond expected peak demand — as a buffer against plant outages and unexpected load growth. The standard planning reserve margin is 15% above forecasted peak demand. Some hydro-dominant regions use lower margins (~10%).

Current challenges: many US regions project reserve margins falling below 15% by 2027-2029 as reliable baseload plants retire faster than replacements come online, and demand grows from electrification and data centers.

### Growth projection methods

Utilities use multiple methods to forecast demand growth:

1. **Trend extrapolation**: Project historical growth rates forward. Simple but misses structural breaks.
2. **Land use-based**: Partner with planning departments to project development within service areas. Most accurate for 5-10 year horizons.
3. **Econometric models**: Correlate utility demand with GDP, employment, population, and weather variables.
4. **Scenario planning**: Model best-case, worst-case, and expected-case demand trajectories.

### Phased construction

Rather than building one large facility, utilities often build in phases:

- Phase 1: Build treatment plant rated for 5 MGD, with foundations and site work sized for eventual 15 MGD
- Phase 2: Add capacity modules as demand approaches 80% of Phase 1 capacity
- Phase 3: Full buildout

This approach reduces upfront capital while preserving expansion options. The design threshold for triggering expansion is typically 75-85% of current capacity.

---

## Infrastructure and Development

The relationship between infrastructure and development is bidirectional and creates a chicken-and-egg dynamic.

### Infrastructure leads development

In traditional planning, infrastructure is extended to undeveloped areas to enable growth:

- **Speculative extension**: A city builds water/sewer trunk lines into greenfield areas, betting that development will follow and generate revenue to repay the investment.
- **Developer-funded**: Developers pay for local infrastructure (streets, water mains, sewer laterals) as a condition of subdivision approval, then deed the infrastructure to the city for ongoing maintenance.
- **Public-private timing**: The city builds trunk infrastructure; developers build local connections. Coordination failures — trunk lines built but no developer interest, or developer ready but no trunk capacity — are common.

### Development leads infrastructure

In some cases, development occurs first and infrastructure catches up:

- **Septic-to-sewer conversion**: Rural areas develop with on-site septic systems. When density reaches a threshold (roughly 1 unit per acre), septic systems begin failing and the area converts to municipal sewer — a costly retrofit.
- **Well-to-municipal-water**: Similar pattern for water supply. Individual wells are replaced by a municipal system when contamination or supply issues emerge.
- **Road improvements**: Dirt roads are paved and widened after development generates traffic. This is already modeled in Bitborough's dirt-to-paved road upgrade system.

### The infrastructure trap

Once built, infrastructure creates maintenance obligations that persist for decades. The Strong Towns organization documents a common municipal pattern:

1. New infrastructure enables development and generates short-term growth revenue
2. For 20-30 years, the infrastructure functions with minimal maintenance
3. Major replacement costs arrive all at once (the "hockey stick" from the degradation model)
4. Revenue from the development often cannot cover replacement costs
5. The city must either raise taxes, take on debt, or let infrastructure deteriorate

This pattern means that infrastructure expansion decisions have 50-100 year fiscal consequences that are easy to underestimate at the time of construction.

---

## Application to Bitborough

### Current power system

Bitborough already implements a three-tier power generation system:

| Plant Type | Capacity (tiles) | Cost | Maintenance | Size | Pollution |
|---|---|---|---|---|---|
| Diesel generator | 50 | $300 | $15/mo | 2x2 | radius 2, amount 5 |
| Coal plant | 700 | $2,000 | $60/mo | 4x4 | radius 6, amount 20 |
| Nuclear plant | 2,000 | $5,000 | $100/mo | 4x4 | none |

Power propagates via BFS from plant footprint tiles through conductors (power lines, roads, zoned tiles, buildings). Each plant has a finite capacity measured in tiles it can power. This is a solid abstraction — it captures the essential tension between generation capacity, distribution connectivity, and cost/pollution tradeoffs.

### Suggested water/sewer mechanics

Water and sewer could follow a parallel architecture to power, with important differences:

**Water system**:
- **Source buildings**: Water tower (small, cheap, limited capacity) and water treatment plant (large, expensive, high capacity)
- **Distribution**: BFS propagation through water pipes (new infrastructure type) and roads. Water does not propagate through bare zoned tiles — pipes or roads are required, reflecting real distribution constraints.
- **Capacity metric**: Population served, not tiles powered. Each residential building consumes capacity proportional to its population (`capacity_used = population × water_per_capita`).
- **Suggested constants**: `waterTowerCapacity = 500` (population), `treatmentPlantCapacity = 5000` (population). Water per capita = 1 unit per resident.

**Sewer system**:
- **Collection buildings**: Sewage treatment plant (required for any sewer service)
- **Distribution**: BFS propagation through sewer pipes. Crucially, sewer flow is gravity-dependent — in a tile-based simulation, this could be simplified as: sewer pipes work everywhere, but pumping stations are required when connecting across elevation changes (if terrain is implemented).
- **Capacity metric**: Same as water — population served. Wastewater generation is ~70% of water consumption.
- **Suggested constants**: `sewagePlantCapacity = 5000` (population). Sewer generation per capita = 0.7 units per resident.

**Gameplay implications**:
- Buildings without water/sewer could function but at reduced desirability and capped density (low only)
- Medium and high density could require water/sewer connection as a prerequisite
- This creates a natural infrastructure investment curve: diesel + roads for early game, then water/sewer investment unlocks density upgrades

### Infrastructure aging model

A simplified aging system could add long-term depth without excessive complexity:

```typescript
// Each infrastructure tile and building tracks age in months
interface AgingAsset {
  placedTick: number
  lifespan: number      // months until failure
  condition: number     // 0-100, derived from age
}

// Condition formula (k=2 gives realistic hockey-stick curve)
function getCondition(ageMonths: number, lifespanMonths: number): number {
  const t = Math.min(ageMonths / lifespanMonths, 1.0)
  return Math.round(100 * (1 - t * t))
}

// Suggested lifespans (in game months)
const LIFESPANS = {
  road:         240,   // 20 years
  powerLine:    480,   // 40 years
  waterPipe:    600,   // 50 years (game-compressed from 75-100 real years)
  sewerPipe:    600,   // 50 years
  dieselPlant:  360,   // 30 years
  coalPlant:    480,   // 40 years
  nuclearPlant: 720,   // 60 years
}
```

**Effects of low condition**:
- Condition < 50: Increased maintenance cost (1.5x)
- Condition < 25: Service disruptions (random chance of temporary failure each tick)
- Condition = 0: Asset fails and must be rebuilt

This creates a funding treadmill that mirrors the real municipal infrastructure trap: the player must continuously reinvest in aging infrastructure or face cascading service failures.

### Stormwater as a density constraint

Rather than modeling full stormwater systems, stormwater could function as an implicit constraint on high-density development:

- Each tile has an effective imperviousness based on development density
- When a district's average imperviousness exceeds a threshold, flooding risk increases
- Flooding risk reduces desirability and can trigger flood events (building damage)
- Parks and green space reduce local imperviousness, creating a tangible gameplay value for parks beyond desirability
- Formula: `floodRisk = max(0, avgImperviousness - 0.6) × rainfallIntensity`

### Solid waste as a service building

Waste management could be implemented as a radius-of-effect service building (like police/fire):

- **Landfill**: Cheap, covers large area, generates pollution, finite lifespan (fills up based on population served)
- **Recycling center**: Reduces landfill consumption rate by 30%
- **Waste-to-energy plant**: Expensive, generates small amount of power, eliminates landfill consumption but has some pollution

### Cost scaling formulas

Infrastructure costs should reflect density-based economies of scale:

```
effective_cost_per_tile = base_cost × (1.0 / density_factor)
```

Where `density_factor` is derived from local development density. Compact areas get more infrastructure value per dollar spent. This could be implemented as: pipes and power lines in densely developed areas serve more population per tile than the same infrastructure in sparse areas.

### Capacity planning gameplay

Reserve margin creates a natural tension:

- If total power capacity < 115% of demand, warn the player ("Power reserves low")
- If capacity < 100% of demand, begin rolling blackouts (BFS propagation terminates early, leaving some areas unpowered)
- Water/sewer follow the same pattern with their own capacity/demand ratios
- This forces the player to invest ahead of growth, mirroring real utility planning

---

## Cross-References

- [Municipal Finance](./municipal-finance.md) — Infrastructure costs are the largest category of municipal capital spending; maintenance obligations drive long-term fiscal health
- [Urban Growth Patterns](./urban-growth-patterns.md) — Infrastructure availability determines where development can occur; sprawl vs. compact patterns have dramatically different infrastructure cost profiles
- [Environment and Sustainability](./environment-and-sustainability.md) — Power generation pollution, wastewater discharge, stormwater runoff, and landfill impacts are the primary environmental consequences of infrastructure decisions

---

## Sources

### Power generation and costs
- [EIA AEO2025 — Levelized Costs of New Generation Resources](https://www.eia.gov/outlooks/aeo/electricity_generation/pdf/AEO2025_LCOE_report.pdf)
- [EIA — Capital Cost and Performance Characteristics for Utility-Scale Power](https://www.eia.gov/analysis/studies/powerplants/capitalcost/pdf/capital_cost_AEO2025.pdf)
- [Lazard LCOE+ June 2025](https://www.lazard.com/media/uounhon4/lazards-lcoeplus-june-2025.pdf)
- [NREL Annual Technology Baseline 2024 — Definitions](https://atb.nrel.gov/electricity/2024/definitions)
- [World Nuclear Association — Economics of Nuclear Power](https://world-nuclear.org/information-library/economic-aspects/economics-of-nuclear-power)
- [Cost of Electricity by Source — Wikipedia](https://en.wikipedia.org/wiki/Cost_of_electricity_by_source)

### Power distribution
- [Electric Power Distribution — Wikipedia](https://en.wikipedia.org/wiki/Electric_power_distribution)
- [Radial, Loop, and Network Systems — Apogee Interactive](https://c03.apogee.net/contentplayer/?coursetype=foe&utilityid=wppi&id=4481)

### Water supply
- [USGS — Water Use in the United States](https://www.usgs.gov/mission-areas/water-resources/science/water-use-united-states)
- [EPA — How We Use Water (WaterSense)](https://www.epa.gov/watersense/how-we-use-water)
- [Brookings — Less Water, More Risk: National and Local Water Use Patterns](https://www.brookings.edu/articles/exploring-national-and-local-water-use-patterns-in-the-u-s/)
- [EPA — Data and Information Used by WaterSense](https://www.epa.gov/watersense/data-and-information-used-watersense)

### Wastewater
- [Florida DEP — General Facts and Statistics about Wastewater](https://floridadep.gov/water/domestic-wastewater/content/general-facts-and-statistics-about-wastewater-florida)
- [Fehr Graham — Calculating Wastewater Treatment Plant Construction Costs](https://www.fehrgraham.com/about-us/blog/calculating-wastewater-treatment-plant-construction-costs-fg)
- [AUC Group — How Much Does a Water Treatment Plant Cost?](https://aucgroup.net/water-treatment-plant-costs/)

### Stormwater
- [EPA — Urbanization and Stormwater Runoff](https://www.epa.gov/caddis/urbanization-stormwater-runoff)
- [USGS — Impervious Surfaces and Flooding](https://www.usgs.gov/water-science-school/science/impervious-surfaces-and-flooding)
- [Penn State Extension — Impervious Surfaces and Stormwater Impacts](https://extension.psu.edu/impervious-surfaces-and-stormwater-impacts)

### Solid waste
- [EPA — National Overview: Facts and Figures on Materials, Wastes and Recycling](https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/national-overview-facts-and-figures-materials)
- [University of Michigan CSS — Municipal Solid Waste Factsheet](https://css.umich.edu/publications/factsheets/material-resources/municipal-solid-waste-factsheet)
- [ASCE — US Solid Waste Infrastructure Report Card](https://infrastructurereportcard.org/cat-item/solid-waste-infrastructure/)

### Infrastructure costs and lifecycle
- [MDPI — Relationships between Density and per Capita Municipal Spending](https://www.mdpi.com/2413-8851/5/3/69)
- [ScienceDirect — Cost Economies, Urban Patterns and Population Density](https://www.sciencedirect.com/science/article/pii/S1056819023017815)
- [Strong Towns — What Strong Towns Really Says About Infrastructure Spending](https://www.strongtowns.org/journal/2024-7-22-what-strong-towns-really-says-about-infrastructure-spending)
- [Streetsblog — Sprawl Costs the Public More Than Twice as Much as Compact Development](https://usa.streetsblog.org/2015/03/05/sprawl-costs-the-public-more-than-twice-as-much-as-compact-development)
- [EPA — Deteriorating Buried Infrastructure Management](https://www.epa.gov/sites/default/files/2015-09/documents/2007_09_04_disinfection_tcr_whitepaper_tcr_infrastructure.pdf)
- [WSSC Water — Aging Infrastructure](https://www.wsscwater.com/what-we-do/major-projects/pipes-and-infrastructure-improvements-and-maintenance/aging)

### Capacity planning
- [EIA — Reserve Electric Generating Capacity](https://www.eia.gov/todayinenergy/detail.php?id=6510)
- [SPP — 2024 Resource Adequacy Report](https://www.spp.org/documents/71804/2024%20spp%20june%20resource%20adequacy%20report.pdf)
- [FERC — Resource Adequacy Requirements: Reliability and Economic Implications](https://www.ferc.gov/sites/default/files/2020-05/02-07-14-consultant-report.pdf)
