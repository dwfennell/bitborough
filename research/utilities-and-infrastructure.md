# Utilities and Infrastructure

> How power, water, sewer, and waste systems serve cities — engineering models for infrastructure simulation.

## Table of Contents

- [Power Generation](#power-generation)
- [Power Distribution](#power-distribution)
- [Distributed Generation and Microgrids](#distributed-generation-and-microgrids)
- [Water Supply](#water-supply)
- [Wastewater and Sewer](#wastewater-and-sewer)
- [Decentralized Wastewater](#decentralized-wastewater)
- [Stormwater Management](#stormwater-management)
- [Solid Waste Management](#solid-waste-management)
- [Telecom and Broadband](#telecom-and-broadband)
- [Infrastructure Interdependencies](#infrastructure-interdependencies)
- [Infrastructure Lifecycle](#infrastructure-lifecycle)
- [Infrastructure Costs](#infrastructure-costs)
- [Infrastructure Financing](#infrastructure-financing)
- [Climate Adaptation Costs](#climate-adaptation-costs)
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

## Distributed Generation and Microgrids

The traditional model of large centralized power plants feeding one-way power through transmission and distribution networks is being disrupted by distributed energy resources (DERs) — small-scale generation and storage located at or near the point of consumption. This shift changes grid economics, resilience characteristics, and the relationship between utilities and customers.

### Rooftop solar

Residential and commercial rooftop solar PV is the most widespread form of distributed generation. As of 2025, installed cost for residential rooftop solar averages approximately **$2.58 per watt** before incentives, or roughly $13,000-$18,000 for a typical 5-7 kW residential system. The 30% federal Investment Tax Credit (ITC) reduces this significantly.

Key characteristics:
- **Capacity factor**: 15-25% depending on location, orientation, and shading — lower than utility-scale solar (20-30%) due to suboptimal tilt angles and partial shading
- **System size**: Residential 3-10 kW; commercial 50-500 kW; community solar 1-5 MW
- **Lifespan**: 25-30 years with ~0.5% annual degradation in output
- **Grid interaction**: Most systems are grid-tied, exporting surplus daytime production and importing power at night

### Community solar

Community solar (also called solar gardens or shared solar) allows multiple customers to subscribe to a shared solar installation and receive bill credits proportional to their share. This model serves renters, shaded properties, and customers who cannot host rooftop panels. Subscribers typically save 5-20% on electricity costs. Community solar capacity has grown rapidly, exceeding 7 GW nationally by 2025.

### Battery storage

Battery energy storage is the enabling technology for making intermittent renewables dispatchable. Costs have fallen dramatically:

| Metric | 2015 | 2020 | 2025 |
|---|---|---|---|
| Lithium-ion pack cost ($/kWh) | ~$350 | ~$140 | ~$108 |
| Residential installed cost ($/kWh usable) | $1,500+ | $1,100 | $700-1,000 |
| Utility-scale installed cost ($/kWh) | $500+ | $300 | ~$200 |

A typical residential battery system (e.g., Tesla Powerwall 3 at 13.5 kWh) costs $15,000-$16,500 installed before incentives. Battery pack costs are projected to continue declining at 8-12% per year.

Storage serves multiple functions:
- **Peak shaving**: Charging during low-price periods, discharging during high-price peaks
- **Solar self-consumption**: Storing midday solar surplus for evening use
- **Backup power**: Providing hours of power during grid outages
- **Grid services**: Providing frequency regulation and demand response to utilities

### Microgrids

A microgrid is a localized energy system that can operate connected to the main grid or independently ("islanded") during outages. Microgrids combine local generation (solar, diesel backup, fuel cells), battery storage, and intelligent controls.

**Costs by market segment** (per MW of DERs installed):
- Community microgrids: ~$2.1 million/MW (lowest due to economies of scale)
- Utility microgrids: ~$2.6 million/MW
- Campus microgrids: ~$3.3 million/MW
- Commercial microgrids: ~$4.0 million/MW

Typical community microgrids range from 2-10 MW and can serve a neighborhood or critical facility cluster. The DOE announced $2.2 billion for microgrid projects in 2024, with the Infrastructure Act earmarking $10 billion total for grid resilience through distributed systems.

**Cost breakdown** for a typical microgrid installation:
- Energy resources (solar, generators): 30-45%
- Switchgear, protection, transformers: ~20%
- Communications and controls: 10-20%
- Site engineering and construction: ~30%
- Operations and markets integration: 5-15%

### The duck curve and grid economics

As solar penetration increases, the net load curve (total demand minus solar generation) develops a distinctive shape known as the **duck curve** — low midday demand (belly of the duck) followed by a steep evening ramp (neck of the duck) as solar output drops while demand rises. California's duck curve has deepened dramatically since the term was coined by CAISO in 2012.

The duck curve creates two problems:
1. **Operational**: The steep evening ramp (up to 13 GW in 3 hours in California) requires fast-ramping conventional generation or storage
2. **Economic**: Midday wholesale prices drop to zero or negative, undermining the revenue of both solar generators and baseload plants

### The utility death spiral

The **utility death spiral** is a theoretical positive feedback loop: as customers adopt rooftop solar and reduce grid purchases, utilities must raise rates on remaining customers to cover fixed infrastructure costs, which drives more customers to adopt solar, further reducing the rate base. While the full spiral has not materialized anywhere, it has influenced rate design — utilities increasingly use fixed monthly charges, demand charges, and time-of-use rates rather than purely volumetric (per-kWh) pricing to recover fixed costs regardless of net consumption.

Net metering policies — where rooftop solar exports are credited at the full retail rate — are a focal point of this tension. Many states are transitioning to "net billing" or "value of solar" tariffs that compensate exports at a lower wholesale-adjacent rate.

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

## Decentralized Wastewater

Not all wastewater flows to a centralized treatment plant. Approximately 20% of US households — over 26 million homes — rely on onsite wastewater treatment systems (septic systems), primarily in rural and suburban areas where extending municipal sewer service is impractical or uneconomical.

### Septic system basics

A conventional septic system consists of a septic tank (where solids settle and partially decompose) and a drain field (where effluent percolates through soil for final treatment). The soil itself is the treatment medium — bacteria in the soil break down remaining contaminants before they reach groundwater.

**Minimum lot size requirements** vary by jurisdiction but follow general patterns:
- With public water supply: minimum **1/2 acre** for most system types
- With private well: minimum **3/4 to 1 acre** to maintain safe separation between well and drain field
- Poor soils (clay, high water table, shallow bedrock): **1-3+ acres** may be required
- High-performance engineered systems (aerobic treatment units, mound systems): can sometimes serve smaller lots

**Installation costs**: A conventional septic system costs $3,100-$9,600 to install. Advanced systems (aerobic treatment units, sand filter systems) cost $10,000-$25,000.

### When septic works and when it fails

Septic systems are appropriate and cost-effective when:
- Development density is low (lots of 1/2 acre or larger)
- Soils have adequate percolation rates (sandy loam to loamy sand ideal)
- Water tables are sufficiently deep (4+ feet below drain field)
- Properties have enough area for a replacement drain field when the primary field reaches end of life

Septic systems become problematic when:
- **Density increases**: As lot sizes shrink below 1/2 acre, the cumulative nitrogen loading from multiple septic systems can contaminate groundwater and surface water. Studies have documented groundwater contamination from nitrates at densities as low as 1 unit per acre in vulnerable hydrogeologic settings.
- **Systems age**: Nearly 70% of onsite wastewater systems are 25 years or older, presenting elevated environmental risk. The EPA reports that failure rates range from 1-5% per year overall, but some communities with aging systems report failure rates as high as 70%.
- **Soils are marginal**: Clay soils, high water tables, and shallow bedrock cause premature drain field failure. State agencies report failing septic systems as the third most common source of groundwater contamination.
- **Maintenance is neglected**: Tanks that are not pumped every 3-5 years accumulate solids that eventually clog drain fields irreversibly.

### Septic-to-sewer conversion

When an area with septic systems develops enough density or experiences enough system failures, the community faces a decision point: convert to municipal sewer or continue with individual systems.

**Conversion triggers** (conditions that typically initiate conversion):
- Documented groundwater contamination from onsite systems
- Failure rates exceeding 10-20% of systems in an area
- Development pressure pushing densities above 1-2 units per acre
- State environmental agency mandate due to water quality violations
- Proximity to sensitive water bodies (coastal bays, drinking water reservoirs)

**Conversion costs** are substantial:
- **Household connection**: $5,000-$15,000 per home (national average $7,000-$10,000), including sewer connection fee ($1,000-$5,000), lateral installation ($2,000-$7,000), septic tank decommissioning ($500-$2,000), and permits
- **Street-level sewer mains**: $50-$250 per linear foot depending on depth and soil conditions
- **Trunk infrastructure**: $7,000-$67,500+ per property depending on proximity to existing sewer
- **Treatment plant capacity expansion**: Additional cost borne by the utility to accommodate new flows

The EPA's Clean Water State Revolving Fund provides low-interest financing for septic-to-sewer conversion projects. States including Florida, California, and Nevada offer additional financial assistance programs, recognizing the water quality benefits of conversion.

### Cluster systems — the middle ground

Between individual septic and full municipal sewer lies a middle option: **cluster (community) decentralized systems**. These serve 10-100+ homes through a shared collection network and a small community treatment unit. They cost less than extending municipal sewer to low-density areas while providing better treatment than individual septic systems. Cluster systems are increasingly favored for new developments in the 0.5-2 units per acre density range where neither individual septic nor municipal sewer is clearly optimal.

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

## Infrastructure Interdependencies

Modern infrastructure systems are not independent — they form a tightly coupled network where failures in one system cascade into others. Understanding these interdependencies is critical for both real-world resilience planning and realistic simulation.

### The power-water nexus

Power and water systems have a deep bilateral dependency that creates dangerous feedback loops during disasters:

**Water needs power**:
- Pumping accounts for approximately 85% of electricity consumption in water supply systems
- The average US water supply system consumes ~2,000 kWh per million gallons of treated water
- Wastewater treatment plants consume 1,000-3,000 kWh per million gallons, primarily for aeration and pumping
- Regional variation is extreme: Southern California requires ~9,800 kWh/MG due to long-distance water transport, while surface water systems elsewhere may need only 1,500 kWh/MG
- Without power, water treatment stops, pumps fail, and pressure drops — leading to boil-water advisories, service loss, and potential backflow contamination

**Power needs water**:
- Thermoelectric power plants (coal, gas, nuclear) require cooling water. US power generation has a water-withdrawal intensity of ~11,600 gallons per MWh (2021 data, down from ~14,900 gal/MWh in 2015)
- Water intensity varies dramatically by fuel and cooling type: coal plants withdraw ~19,200 gal/MWh vs. natural gas combined cycle at ~2,800 gal/MWh
- Consumptive water use (evaporated, not returned) averages ~0.47 gallons per kWh at point of end use
- During droughts, power plants may be forced to curtail output due to insufficient cooling water or thermal discharge limits — creating a double crisis of water scarcity and power shortage
- Wind and solar generation consume essentially zero water during operation, providing a resilience advantage

### Dependency graph

Infrastructure dependencies can be mapped as a directed graph. The major first-order dependencies:

```
Power → Water treatment (pumping, disinfection)
Power → Wastewater treatment (pumping, aeration)
Power → Telecom (towers, switches, data centers)
Power → Natural gas (compressor stations)
Natural gas → Power generation (fuel supply)
Water → Power generation (cooling)
Water → Firefighting (hydrant pressure)
Telecom → All systems (SCADA control, monitoring)
Roads → All systems (maintenance access, fuel delivery)
```

Second-order dependencies amplify failure chains: if power fails, water treatment stops, which threatens cooling water supply to the very power plants that need to restart — a deadlock condition.

### Cascading failure analysis

Research on interdependent infrastructure failures reveals important patterns:

**Frequency vs. severity**: Studies modeling coupled power-water systems find that approximately 89% of initial transmission line failures do not propagate to water systems, and power failures do not lead to water outages in 96% of simulations. However, approximately 3.7% of simulations produce large cascading failures across both systems — low probability but catastrophic consequence.

**Perfect storms**: When cascading failures do occur, they tend to be far worse than the sum of individual system failures. A Phoenix study modeling 120,000 failure scenarios found the most severe cascading event left 25% of water system nodes with insufficient pressure — triggered not by a water system failure but by power outages at pumping stations.

**Propagation speed**: Power failures propagate in seconds to minutes (electrical). Water pressure loss propagates in minutes to hours (hydraulic). Sewer backup propagates in hours to days. This temporal layering means that a power outage that is restored in 2 hours may cause a water crisis that lasts 2 days.

### Case study: Texas Winter Storm Uri (2021)

Winter Storm Uri is the definitive modern example of cascading infrastructure failure in the United States:

1. **Trigger**: Record cold temperatures (Feb 14-17, 2021) caused natural gas production to drop as wellheads and pipelines froze
2. **Power cascade**: Gas shortages combined with frozen wind turbines and coal pile freeze-ups caused generation to collapse. ERCOT lost 48.6 GW of capacity — roughly half the grid
3. **Water cascade**: Power outages knocked out water treatment plants and pumping stations across the state. Over **14.9 million people** lost water service. Boil-water notices were issued across 190 counties
4. **Pipe failures**: Buildings that lost heat experienced pipe freezes and bursts, creating massive water demand when service was restored — further overwhelming depleted systems
5. **Death toll and cost**: 246 deaths; over **$20 billion** in damages — making it the costliest winter storm on US record

The critical lesson: the power system and water system each had vulnerabilities that were manageable in isolation, but their interdependence transformed a severe weather event into a civilizational disruption. Sub-freezing temperatures caused simultaneous failure in natural gas production, power generation, water treatment, and building plumbing — a "perfect storm" of coupled infrastructure failure.

### Interdependency types

Infrastructure interdependencies fall into four categories (Rinaldi et al. classification):

1. **Physical**: One system's output is a direct input to another (water for power plant cooling; power for water pumps)
2. **Cyber**: Information systems link infrastructure operations (SCADA systems controlling water valves depend on telecom networks powered by the electrical grid)
3. **Geographic**: Co-located systems share exposure to the same hazard (a flood damages both the substation and the water treatment plant in a river valley)
4. **Logical**: Regulatory, policy, or market mechanisms create coupling (electricity market price spikes during a heat wave cause water utilities to curtail pumping to reduce costs, lowering pressure)

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

## Infrastructure Financing

Infrastructure must be paid for, and the financing mechanism shapes what gets built, when, and who bears the cost. Municipal infrastructure financing is a distinct domain with its own instruments, institutions, and political dynamics.

### The revenue requirement

For regulated utilities (both public and investor-owned), the fundamental equation governing rates is the **revenue requirement**:

```
Revenue Requirement = (Rate of Return × Rate Base) + O&M + Depreciation + Taxes
```

- **Rate base**: The undepreciated value of the utility's capital assets (pipes, plants, lines). This is what the utility has invested and on which it earns a return.
- **Rate of return**: The authorized return on invested capital, set by regulators. For investor-owned utilities, this reflects a weighted average cost of capital (WACC) combining cost of debt (~4-5%) and authorized return on equity (~9-11%). A typical utility capital structure is approximately 50% debt, 50% equity.
- **O&M**: Operating costs — labor, chemicals, energy, materials
- **Depreciation**: Annual accounting charge that recovers the original capital investment over the asset's useful life

This formula means that **utilities earn more money by building more capital assets**. A utility that builds a $100 million treatment plant earns 9-11% equity return on its share of that investment every year for the asset's depreciable life. This creates a well-documented capital bias — utilities prefer capital-intensive solutions over operational solutions, even when the latter may be more cost-effective.

### Municipal bonds

Municipal bonds are the primary financing instrument for public infrastructure in the United States. The outstanding municipal bond market exceeds **$4.1 trillion**, with approximately 85% consisting of tax-exempt bonds. Municipal bond issuance reached approximately $500 billion in 2024 and $585 billion in 2025 — back-to-back records driven by infrastructure demand and rising construction costs.

**General obligation (GO) bonds**:
- Backed by the full faith, credit, and taxing power of the issuing municipality
- Repaid from general tax revenues (property tax, sales tax)
- Considered lower risk; typically carry lower interest rates
- Require voter approval in most jurisdictions
- Used for general public infrastructure: roads, schools, parks, public buildings

**Revenue bonds**:
- Backed solely by the revenue stream of the specific project or utility they finance
- Repaid from user fees, tolls, or utility rates
- Higher interest rates than GO bonds (reflecting narrower revenue base), though the spread has narrowed in recent years
- Do not always require voter approval
- Used for self-supporting infrastructure: water systems, sewer systems, electric utilities, airports, toll roads

Water and sewer revenue bonds are considered particularly reliable because these are **essential services** — customers will pay water and sewer bills before most other obligations. Debt service coverage ratios for water/sewer utilities are generally strong, and defaults are rare.

### Rate setting — who pays and how

Utility rates must recover the full revenue requirement while maintaining affordability and fairness. Rate structures fall into several categories:

**Flat rate**: Every customer pays the same amount per unit regardless of consumption. Simple but provides no conservation incentive.

**Increasing block rate**: Price per unit rises as consumption increases (e.g., first 5,000 gallons at $3/1,000 gal, next 5,000 at $5/1,000 gal). Encourages conservation and charges heavy users more. Most common for water utilities.

**Decreasing block rate**: Price per unit falls with higher consumption. Historically used by electric utilities to encourage consumption; now declining.

**Fixed + volumetric**: A fixed monthly charge covers infrastructure costs regardless of consumption, plus a per-unit charge for actual use. Increasingly favored because it ensures cost recovery even as conservation reduces per-unit sales.

**Demand charges**: Charges based on peak instantaneous demand (kW) rather than total consumption (kWh). Common for commercial and industrial electric customers. Recovers the cost of maintaining capacity to serve peak loads.

**Affordability threshold**: The EPA uses 2.5% of median household income as a benchmark for combined water and sewer bill affordability. Bills exceeding this threshold indicate potential financial hardship for low-income customers. Many utilities offer lifeline rates or low-income assistance programs.

### Impact fees and developer contributions

New development imposes costs on existing infrastructure. Municipalities recover these costs through:

- **Impact fees**: One-time charges on new development to fund capacity expansion. Typically $2,000-$15,000 per residential unit, varying by jurisdiction and utility type. Must be proportional to the actual infrastructure burden of the development.
- **Developer-funded infrastructure**: Developers build local infrastructure (streets, water/sewer laterals, stormwater facilities) as a condition of subdivision approval, then deed the assets to the municipality for ongoing maintenance.
- **Special assessment districts**: Property owners in a defined area are assessed for infrastructure that specifically benefits that area (e.g., a new sewer main serving a particular subdivision).
- **Tax increment financing (TIF)**: Future property tax increases generated by new development in a designated district are pledged to repay infrastructure bonds. Controversial because it diverts tax revenue from general services.

### Public-private partnerships (P3s)

Public-private partnerships involve private firms in the financing, construction, and/or operation of public infrastructure. P3 structures range from simple design-build contracts to full concessions where the private partner finances, builds, operates, and maintains the asset for 30-75 years.

**Advantages**: Access to private capital; risk transfer (construction cost overruns are contractually borne by the private partner); operational efficiency; performance guarantees over the asset lifecycle.

**Disadvantages**: Higher cost of capital (private borrowing costs exceed municipal bond rates); reduced public control; complexity; long-term contractual lock-in; profit extraction from essential services.

P3s are more common for large, revenue-generating assets (toll roads, airports, water/wastewater systems) and less common for non-revenue infrastructure (local roads, stormwater). The US P3 market is smaller than in the UK, Canada, and Australia, partly because the municipal bond market provides efficient low-cost public financing.

### The state revolving fund model

The EPA administers two major revolving loan funds:
- **Clean Water State Revolving Fund (CWSRF)**: Provides below-market-rate loans for wastewater infrastructure, stormwater management, and nonpoint source pollution control
- **Drinking Water State Revolving Fund (DWSRF)**: Provides below-market-rate loans for water treatment and distribution infrastructure

These programs offer interest rates typically 1-3 percentage points below market, with some states offering principal forgiveness for disadvantaged communities. The Bipartisan Infrastructure Law (2021) provided an additional $43 billion to these programs through 2026.

---

## Climate Adaptation Costs

Climate change is imposing new costs on infrastructure systems — both through damage from extreme events and through the need to upgrade systems designed for a climate that no longer exists. These costs are large, growing, and unevenly distributed.

### Heat impacts on infrastructure

Rising temperatures and more frequent extreme heat events damage infrastructure in multiple ways:

**Power systems**:
- Transmission line capacity decreases as ambient temperature rises (conductors sag, increasing the risk of contact with vegetation or ground)
- Transformer capacity is derated in extreme heat — a transformer rated for 100 MVA at 25 degC may only safely carry 85-90 MVA at 40 degC
- Peak demand surges from air conditioning can exceed system capacity, causing rolling blackouts. Heat waves have triggered rolling blackouts in California (2020), Texas (2023), and across the Southeast
- Thermal power plants lose efficiency at higher ambient temperatures and may be forced to curtail output when cooling water temperatures exceed discharge limits

**Roads and pavement**:
- Asphalt softens and deforms at sustained temperatures above 90 degF, causing rutting, cracking, and buckling. Approximately **5.8 million miles** of US roads face increasing risk as high-temperature days become more frequent
- Concrete pavement expands, and if expansion joints are inadequate, slabs buckle
- Climate-related road damage alone could incur **$20 billion** in repair costs by end of century
- Adaptation strategies include heat-resistant asphalt mixes, smaller concrete slabs, and reflective surface coatings

**Rail and bridges**:
- Steel rail tracks expand and can buckle at temperatures above 95 degF (rail neutral temperature design thresholds)
- Bridge expansion joints reach their limits; thermal movement can shift entire structures
- Speed restrictions are imposed during heat events, reducing system throughput

**Water systems**:
- Higher temperatures increase water demand (landscape irrigation, cooling) while reducing supply (increased evaporation from reservoirs, reduced snowpack)
- Warmer water temperatures accelerate disinfection byproduct formation and algal blooms in source water
- Pipe thermal expansion/contraction stress increases joint failure rates

### Flooding and sea level rise

Flooding is the costliest natural hazard for infrastructure, and the costs are rising:

**Sea level rise projections**: Global mean sea level is projected to rise 1-4 feet by 2100 depending on emissions trajectory, with local variations due to land subsidence, ocean currents, and glacial rebound. Conservative estimates project **$2-5 trillion** in global coastal infrastructure damages by 2100, with higher estimates reaching tens of trillions under accelerated warming.

**US coastal adaptation costs**:
- Houston/Harris County: **$30 billion** needed for 100-year flood protection
- Boston: **$2.4 billion** for flood protection over coming decades
- Norfolk, Virginia: **$1.4 billion** for seawalls and shoreline infrastructure (Army Corps of Engineers estimate)
- US nationwide: **$300 billion** in shoreline armoring costs projected by 2100

**Inland flooding**: More intense precipitation events (driven by a warmer atmosphere holding more moisture) overwhelm stormwater systems designed for historical rainfall patterns. Many cities are finding their "100-year storm" design standard is now closer to a 25-50 year event.

### Adaptation cost estimates by infrastructure type

| Infrastructure Type | Climate Threat | Adaptation Measure | Estimated Cost Premium |
|---|---|---|---|
| Power transmission | Heat, storms | Undergrounding, stronger poles, wider ROW | 5-15% of replacement cost |
| Power generation | Heat, water scarcity | Dry cooling, efficiency upgrades | 10-20% capex increase |
| Water treatment | Flooding, source quality | Elevated facilities, advanced treatment | 10-30% capex increase |
| Water distribution | Heat/freeze cycles | Deeper burial, flexible joints | 5-10% per mile |
| Sewer systems | Intense rainfall | Upsizing pipes, green infrastructure | 20-50% of gray infrastructure cost |
| Roads | Heat, flooding | Heat-resistant materials, elevation | 3-10% of construction cost |
| Bridges | Heat, flooding | Higher clearances, scour protection | 10-25% of construction cost |
| Coastal infrastructure | Sea level rise | Seawalls, elevation, managed retreat | Highly variable; $10M-$1B+ per mile |

The general finding across studies is that making infrastructure **climate-resilient adds approximately 3% to upfront costs** but yields a benefit-cost ratio of approximately **4:1** — every dollar spent on adaptation avoids roughly four dollars in future damage and disruption.

### The adaptation finance gap

The United Nations Environment Programme estimates the global adaptation finance gap at **$187-359 billion per year**. Developed nations pledged to provide $40 billion annually in climate adaptation finance under the Glasgow Climate Pact, but even if fully delivered, this would close only about 5% of the gap. The shortfall is particularly acute for infrastructure in developing countries, where systems are being built for the first time and must be designed for a changed climate from the start.

In the United States, the adaptation challenge is complicated by the fact that most infrastructure is owned and maintained by state and local governments, which have limited fiscal capacity. The federal government provides grants and loans (FEMA hazard mitigation, EPA revolving funds, USDA rural development), but the bulk of adaptation investment must come from local rate increases, bond issuance, and land use decisions.

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

### Distributed generation and microgrids

Rooftop solar and battery storage could add a mid-to-late-game energy layer:

- **Solar panels**: A building upgrade (not a standalone structure) that reduces a building's power demand from the grid. A solar panel upgrade on a residential building could reduce its grid power consumption by 30-50% during daylight ticks, with zero reduction at night.
- **Battery storage**: A building upgrade that stores surplus solar production for use during non-solar ticks. Without batteries, solar only helps during daytime; with batteries, the building can be partially self-sufficient around the clock.
- **Community solar farm**: A standalone 3x3 or 4x4 building that acts like a small power plant (capacity ~200 tiles) but with intermittent output — full capacity during day ticks, zero at night. Cheaper than a diesel generator per tile served but unreliable without storage.
- **Microgrid resilience**: Areas with sufficient local solar + battery capacity could maintain partial power during grid failures (when a power plant goes offline due to aging or disaster). This creates a tangible resilience benefit for investing in distributed generation.

**Duck curve gameplay**: If time-of-day simulation is implemented, solar-heavy cities would experience midday power surplus and evening power deficit — mirroring the real duck curve. Players would need to balance solar with storage or dispatchable generation.

### Infrastructure interdependency mechanics

Cascading failures could add dramatic emergent gameplay:

- **Power-water coupling**: If power supply to a water treatment plant or water tower tile is lost (the tile is no longer reached by power BFS), the water facility stops functioning — all tiles it served lose water service. This means a single power plant failure can cascade into a water crisis.
- **Failure chain events**: When a power plant ages and fails (condition = 0), the immediate effect is power loss. But if that power loss disconnects a water facility, buildings lose both power and water simultaneously. The player must prioritize which systems to repair first.
- **Suggested implementation**: Each water/sewer facility tile checks whether it is powered. If not, it contributes zero capacity. This is a simple check layered on top of the existing BFS systems — no new propagation algorithm needed.

```typescript
function getEffectiveWaterCapacity(facility: WaterFacility): number {
  if (!isTilePowered(facility.tile)) return 0
  return facility.baseCapacity * getConditionMultiplier(facility.condition)
}
```

### Decentralized wastewater in early game

Low-density development could function without municipal sewer via implicit septic systems:

- Residential buildings at low density (1 unit per tile or less) function without sewer connection, but at reduced desirability
- When local density exceeds a threshold (e.g., more than 2 residential buildings within a 3-tile radius), a "septic overload" warning appears, and desirability drops sharply
- The player must then extend sewer service to the area — a retrofit that costs more than building sewer before development (reflecting real septic-to-sewer conversion costs)
- This creates a natural early-game-to-mid-game transition: initial growth uses septic (free but density-limited), then sewer investment unlocks higher density

### Infrastructure financing gameplay

The funding mechanics for infrastructure could reflect real financing constraints:

- **Upfront vs. bonded**: The player can pay full cost immediately or issue bonds (pay 20% upfront, then monthly debt service for 20 years at ~1.3x total cost). This mirrors real municipal bond financing and creates cash flow management decisions.
- **Rate revenue**: Water and sewer facilities generate monthly revenue from connected buildings (a per-building fee), partially offsetting maintenance costs. This models the real revenue bond structure where utility fees repay infrastructure debt.
- **Impact fees**: New development in areas with existing infrastructure could pay a reduced connection cost, while development that requires infrastructure extension pays full cost. This creates an incentive for infill development over sprawl.
- **The infrastructure trap**: If the player builds extensive infrastructure to serve sparse suburban development, the ongoing maintenance costs may exceed the tax/fee revenue from those areas — forcing difficult choices about service cuts or tax increases. This is the Strong Towns dynamic made playable.

### Climate events and adaptation

Climate-related events could create periodic challenges:

- **Heat waves**: Power demand spikes (all buildings consume 1.5x power for cooling). Power plants with low condition have elevated failure chance. Roads degrade faster during heat events.
- **Flooding**: Heavy rain events based on imperviousness (from stormwater model). Flooded tiles temporarily lose all services. More frequent/severe as the game progresses (modeling climate change).
- **Adaptation upgrades**: Higher-cost versions of standard infrastructure that resist climate events. For example, a "hardened power line" that costs 2x but resists storm damage, or "flood-resistant roads" that cost 1.5x but do not degrade during floods. The 3% cost premium / 4:1 benefit ratio from real-world studies could inform the pricing.

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

### Distributed generation and microgrids
- [DOE — Solar Integration: Distributed Energy Resources and Microgrids](https://www.energy.gov/eere/solar/solar-integration-distributed-energy-resources-and-microgrids)
- [NREL — Resilience and Economics of Microgrids with PV, Battery Storage](https://docs.nrel.gov/docs/fy21osti/78837.pdf)
- [NREL — Cost Projections for Utility-Scale Battery Storage (2025)](https://docs.nrel.gov/docs/fy25osti/93281.pdf)
- [NREL — Ten Years of Analyzing the Duck Chart](https://www.nrel.gov/news/program/2018/10-years-duck-curve.html)
- [DOE — Confronting the Duck Curve: How to Address Over-Generation of Solar Energy](https://www.energy.gov/cmei/articles/confronting-duck-curve-how-address-over-generation-solar-energy)
- [EIA — As Solar Capacity Grows, Duck Curves Are Getting Deeper in California](https://www.eia.gov/todayinenergy/detail.php?id=56880)
- [EnergySage — Solar Panel Cost in 2025](https://www.energysage.com/local-data/solar-panel-cost/)
- [Microgrid Knowledge — What Does a Microgrid Cost?](https://microgridknowledge.com/microgrid-cost/)
- [NREL — Phase I Microgrid Cost Study: Data Collection and Analysis](https://docs.nrel.gov/docs/fy19osti/67821.pdf)
- [Duck Curve — Wikipedia](https://en.wikipedia.org/wiki/Duck_curve)
- [ScienceDirect — On the Utility Death Spiral and the Impact of Utility Rate Structures](https://www.sciencedirect.com/science/article/abs/pii/S0306261916315732)

### Infrastructure interdependencies
- [MDPI — Resilience of Interdependent Water and Power Systems: A Literature Review](https://www.mdpi.com/2073-4441/13/20/2846)
- [ASCE — Cascading Failure Propagation and Perfect Storms in Interdependent Infrastructures](https://ascelibrary.org/doi/10.1061/AOMJAH.AOENG-0045)
- [ORNL — Cascading Failure Propagation and Perfect Storms in Interdependent Infrastructures](https://www.ornl.gov/publication/cascading-failure-propagation-and-perfect-storms-interdependent-infrastructures)
- [ResearchGate — Cascading Failure Analysis of Interdependent Water-Power Networks](https://www.researchgate.net/publication/389190853_Cascading_Failure_Analysis_of_Interdependent_Water-Power_Networks_Based_on_Functional_Coupling)
- [UNDRR — The Texas Coldwave Disaster: How Cascading Risks Took Out an Entire Power Grid](https://www.undrr.org/news/texas-coldwave-disaster-how-cascading-risks-took-out-entire-power-grid)
- [ScienceDirect — Tracking the Post-Disaster Evolution of Water Infrastructure Resilience: Texas Winter Storm](https://www.sciencedirect.com/science/article/abs/pii/S2210670723000288)
- [MDPI — Exploring the Impact of Winter Storm Uri on Power, Air Quality, and Water Systems in Texas](https://www.mdpi.com/2071-1050/15/5/4173)
- [Wikipedia — 2021 Texas Power Crisis](https://en.wikipedia.org/wiki/2021_Texas_power_crisis)

### Power-water nexus
- [USGS — Thermoelectric Power Water Use](https://www.usgs.gov/mission-areas/water-resources/science/thermoelectric-power-water-use)
- [EIA — US Electric Power Sector Continues Water Efficiency Gains](https://www.eia.gov/todayinenergy/detail.php?id=56820)
- [EIA — US Electric Power Sector's Use of Water Continued Downward Trend in 2020](https://www.eia.gov/todayinenergy/detail.php?id=50698)
- [NREL — Consumptive Water Use for US Power Production](https://docs.nrel.gov/docs/fy04osti/33905.pdf)
- [Hansen Allen & Luce — Quantifying Energy Use in the US Public Water Sector](https://www.hansenallenluce.com/wp-content/uploads/2015/11/Energy-Use-Water-Sector.pdf)
- [ACEEE — Driving Energy Efficiency in the US Water & Wastewater Industry](https://www.aceee.org/files/proceedings/2009/data/papers/6_83.pdf)
- [DOE — Energy Data Management Manual for the Wastewater Treatment Sector](https://www.energy.gov/sites/prod/files/2018/01/f46/WastewaterTreatmentDataGuide_Final_0118.pdf)

### Decentralized wastewater
- [EPA — Decentralized Wastewater Systems Technology Fact Sheets](https://www.epa.gov/septic/decentralized-wastewater-systems-technology-fact-sheets)
- [EPA — Septic Systems Overview](https://19january2021snapshot.epa.gov/septic/septic-systems-overview_.html)
- [EPA — Septic Tanks and Natural Hazards Resource Guide (2024)](https://www.epa.gov/system/files/documents/2024-12/septic-tanks-and-natural-hazards-resource-guide.pdf)
- [National Academies — Small and Decentralized Systems for Wastewater](https://www.nationalacademies.org/read/11241/chapter/5)
- [AUC Group — Centralized Versus Decentralized Treatment](https://aucgroup.net/centralized-versus-decentralized-treatment/)
- [WWEMA — Eliminating Failing Septic Tanks in the United States](https://wwema.org/wp-content/uploads/2020/09/PositionPaperFailingSepticSystems050320.pdf)
- [Building Advisor — Minimum Lot Size for Septic System](https://buildingadvisor.com/what-is-minimum-lot-size-for-septic-system/)
- [Washington DOH — Lot Size (Minimum Land Area) for Onsite Sewage Systems](https://doh.wa.gov/sites/default/files/legacy/Documents/Pubs/337-101.pdf)

### Infrastructure financing
- [MSRB — Municipal Securities: Financing the Nation's Infrastructure](https://www.msrb.org/sites/default/files/MSRB-Infrastructure-Primer.pdf)
- [MSRB — US Infrastructure Is Backed by Municipal Bonds: Three Things to Know](https://www.msrb.org/sites/default/files/MSRB-Infrastructure-Explainer.pdf)
- [Baird Asset Management — Municipal Bonds and the Making of American Infrastructure](https://www.bairdassetmanagement.com/insights/2026/03/municipal-bonds-and-the-making-of-american-infrastructure/)
- [Roosevelt Institute — Financing State and Local Investment: Uses and Limitations of the Municipal Bond Market](https://rooseveltinstitute.org/publications/financing-state-and-local-investment/)
- [American Public Power Association — Municipal Bonds and Public Power](https://www.publicpower.org/policy/municipal-bonds-and-public-power)
- [NARUC — Ratemaking Fundamentals and Principles](https://www.naruc.org/commissioners-desk-reference-manual/3-ratemaking-fundamentals-and-principles/)
- [NARUC — What is "Cost of Service" Regulation?](https://pubs.naruc.org/pub.cfm?id=538E730E-2354-D714-51A6-5B621A9534CB)
- [Enerdynamics — The Revenue Requirement is the Key to How Utilities Make Money](https://www.enerdynamics.com/Energy-Currents_Blog/The-Revenue-Requirement-is-the-Key-to-How-Utilities-Make-Money.aspx)
- [Enerdynamics — How Regulators Determine a Utility's Return on Equity](https://www.enerdynamics.com/Energy-Currents_Blog/How-Regulators-Determine-a-Utilitys-Return-on-Equity-ROE.aspx)
- [RMI — Rebalancing Return on Equity to Accelerate an Affordable Clean Energy Future](https://rmi.org/rebalancing-return-on-equity-to-accelerate-an-affordable-clean-energy-future/)
- [FHWA — Sources of Public Sector Financing](https://www.fhwa.dot.gov/ipd/p3/toolkit/publications/primers/financial_structuring_and_assessment/ch_4.aspx)
- [Bond Buyer — Private Sector Funding Flooding into Infrastructure](https://www.bondbuyer.com/news/private-sector-funding-flooding-into-infrastructure)

### Climate adaptation
- [National Climate Assessment — Infrastructure](https://nca2014.globalchange.gov/highlights/report-findings/infrastructure)
- [US Climate Resilience Toolkit — Infrastructure and the Built Environment](https://toolkit.climate.gov/infrastructure-and-built-environment)
- [McKinsey — Will Climate Change Cause Infrastructure to Bend or Break?](https://www.mckinsey.com/capabilities/sustainability/our-insights/will-infrastructure-bend-or-break-under-climate-stress)
- [BSR — Infrastructure Breaks Under Extreme Heat](https://www.bsr.org/en/emerging-issues/infrastructure-breaks-under-extreme-heat)
- [Pew — Climate Change Poses Risks to Neglected Public Transportation and Water Systems](https://www.pew.org/en/research-and-analysis/issue-briefs/2024/09/climate-change-poses-risks-to-neglected-public-transportation-and-water-systems)
- [Columbia Climate School — The Case for Climate-Resilient Infrastructure](https://news.climate.columbia.edu/2024/07/22/the-case-for-climate-resilient-infrastructure/)
- [Springer — Global Costs of Protecting Against Sea-Level Rise at 1.5 to 4.0 degC](https://link.springer.com/article/10.1007/s10584-021-03130-z)
- [Nature — Coastal Adaptation and Damage Costs at Different Global Warming Thresholds](https://www.nature.com/articles/s44304-025-00089-0)
- [Yale E360 — Who Will Pay for the Huge Costs of Holding Back Rising Seas?](https://e360.yale.edu/features/who-will-pay-for-the-huge-costs-of-holding-back-rising-seas)
- [CFR Education — How to Address the Economic Costs of Climate Change](https://education.cfr.org/learn/reading/infrastructure-economic-damage-climate-change)
- [PreventionWeb — Climate Change and Transportation](https://www.preventionweb.net/news/explainer-climate-change-and-transportation)
