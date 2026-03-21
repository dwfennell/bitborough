# Environment and Sustainability

> How pollution, green infrastructure, and climate interact with urban development — models for environmental simulation.

## Table of Contents

- [Air Pollution](#air-pollution)
- [Water Pollution](#water-pollution)
- [Noise Pollution](#noise-pollution)
- [Pollution Dispersion](#pollution-dispersion)
- [Urban Heat Island Effect](#urban-heat-island-effect)
- [Green Infrastructure](#green-infrastructure)
- [Climate Resilience](#climate-resilience)
- [Environmental Regulation](#environmental-regulation)
- [Sustainability Metrics](#sustainability-metrics)
- [Waste and Circular Economy](#waste-and-circular-economy)
- [Environmental Justice](#environmental-justice)
- [Application to Bitborough](#application-to-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

---

## Air Pollution

### Source Categories

Urban air pollution comes from three dominant source types: industrial (stationary point sources), transportation (mobile sources), and power generation. The EPA's AP-42 document catalogs emission factors for over 200 source categories.

| Source Type | Primary Pollutants | Relative Contribution (US urban) | Emission Factor Unit |
|---|---|---|---|
| On-road vehicles | CO, NOx, PM2.5, VOCs | ~50-60% of CO, ~30-35% of NOx | grams/vehicle-mile |
| Industrial facilities | SO2, PM10, VOCs, heavy metals | ~20-30% of SO2 | kg/unit-of-production |
| Power plants (coal) | SO2, NOx, PM, CO2, mercury | ~65% of SO2, ~25% of NOx nationally | kg/MWh generated |
| Power plants (natural gas) | NOx, CO2 | Lower particulates than coal | kg/MWh generated |
| Construction/demolition | PM10, PM2.5 (fugitive dust) | Variable, locally significant | kg/activity-unit |

The six criteria pollutants regulated under the US Clean Air Act are: carbon monoxide (CO), lead (Pb), nitrogen dioxide (NO2), ozone (O3), particulate matter (PM2.5 and PM10), and sulfur dioxide (SO2).

### Health Effects

Air pollution exposure follows a dose-response relationship. The WHO estimates ambient air pollution causes 4.2 million premature deaths worldwide per year. Key thresholds:

- **PM2.5 > 35 ug/m3 (24-hr):** Unhealthy for sensitive groups
- **PM2.5 > 55 ug/m3 (24-hr):** Unhealthy for all
- **Ozone > 70 ppb (8-hr):** Respiratory distress threshold
- Long-term PM2.5 exposure: ~6-8% increase in cardiovascular mortality per 10 ug/m3

### Dispersion Models

The Gaussian plume model is the standard for atmospheric dispersion from point sources:

```
C(x,y,z) = Q / (2pi * u * sigma_y * sigma_z)
            * exp(-y^2 / (2 * sigma_y^2))
            * [exp(-(z-H)^2 / (2 * sigma_z^2)) + exp(-(z+H)^2 / (2 * sigma_z^2))]
```

Where:
- `C(x,y,z)` = concentration at point (x,y,z) in ug/m3
- `Q` = emission rate (ug/s)
- `u` = wind speed at stack height (m/s)
- `sigma_y`, `sigma_z` = horizontal and vertical dispersion coefficients (m)
- `H` = effective stack height (m)
- `x` = downwind distance, `y` = crosswind distance, `z` = height

The model assumes: steady-state emissions, constant wind speed/direction, flat terrain, and Gaussian distribution of concentration in both crosswind and vertical directions. Despite these simplifications, it remains the foundation of regulatory air quality modeling (EPA's ISC and AERMOD).

---

## Water Pollution

### Point vs. Nonpoint Sources

**Point sources** have a discrete, identifiable origin (factory outfall pipe, wastewater treatment plant discharge). These are regulated under the Clean Water Act via NPDES permits.

**Nonpoint sources (NPS)** are diffuse — stormwater runoff carrying oil, fertilizers, sediment, and trash from roads, lawns, and construction sites. NPS is now the leading cause of water quality impairment in US waterways, responsible for degradation in roughly 40% of surveyed rivers and streams.

### Urban Runoff Pollutant Loading

| Pollutant | Typical Urban Runoff Concentration | Primary Sources |
|---|---|---|
| TSS (Total Suspended Solids) | 50-300 mg/L | Construction, erosion, road dust |
| BOD (Biochem. Oxygen Demand) | 10-30 mg/L | Organic debris, lawn waste |
| Total Phosphorus | 0.2-1.7 mg/L | Fertilizers, detergents |
| Total Nitrogen | 1.5-4.0 mg/L | Fertilizers, atmospheric deposition |
| Oil & Grease | 3-10 mg/L | Vehicle leaks, road surfaces |
| Heavy Metals (Zn, Cu, Pb) | 0.01-0.5 mg/L | Vehicle wear, industrial activity |

### Key Water Quality Indicators

- **Dissolved Oxygen (DO):** Healthy streams > 6 mg/L; below 4 mg/L most fish cannot survive
- **BOD:** Measures oxygen consumed by microbial decomposition; BOD > 10 mg/L indicates polluted water
- **TSS:** Reduces light penetration; > 80 mg/L impairs aquatic habitat
- **pH:** Healthy range 6.5-8.5; industrial discharge and acid rain shift it
- **Fecal coliform:** Indicator of sewage contamination; > 200 colonies/100mL unsafe for swimming

Impervious surface coverage is the single strongest predictor of stream health. Watersheds with > 10% impervious cover show measurable degradation; > 25% typically indicates severe impairment.

---

## Noise Pollution

### Traffic Noise Models

Road traffic is the dominant urban noise source. The Federal Highway Administration Traffic Noise Model (FHWA-TNM) and the European Harmonoise model both predict noise levels based on traffic volume, speed, vehicle mix, road surface, and topography.

Key principles of sound propagation:

- **Inverse square law:** Sound intensity drops with the square of distance. For a point source, this yields **-6 dB per doubling of distance**. For a line source (highway), the drop is **-3 to -4.5 dB per doubling of distance** because the road acts as a distributed source.
- **Ground absorption:** Soft ground (grass, vegetation) absorbs 1-3 dB more than hard surfaces (pavement, water) per 100m.
- **Barriers:** A solid wall or earth berm can reduce noise by 5-15 dB depending on height and proximity.
- **Vegetation:** Dense tree belts provide only 1-2 dB attenuation per 30m — less effective than commonly assumed.

### Noise Levels by Source

| Source | Typical Level at Reference Distance | Reference Distance |
|---|---|---|
| Quiet residential street | 40-50 dBA | at facade |
| Urban arterial road | 65-75 dBA | 15m from centerline |
| Highway (60,000 ADT) | 70-80 dBA | 15m from edge |
| Industrial zone | 60-75 dBA | at boundary |
| Construction site | 80-90 dBA | 15m from activity |
| Airport approach path | 75-90 dBA | under flight path |

### Impact on Property Values

Research consistently shows noise depresses residential property values. The Noise Depreciation Index (NDI) typically ranges from 0.2% to 1.2% loss in property value per dB increase above 55 dBA. A study of sound barrier construction found an immediate and largely permanent 6.8% price increase within 100 meters of the barrier. Wealthier communities show greater sensitivity to noise impacts on property values.

For simulation purposes, a simplified attenuation model:

```
L(d) = L_ref - 10 * k * log10(d / d_ref)
```

Where `k` = 1 for point sources, `k` = 0.5 for line sources (roads), `d` = distance in meters, and `d_ref` = reference distance.

---

## Pollution Dispersion

### Spatial Spread Mechanics

Pollutants spread through three primary mechanisms:

1. **Advection** — wind carries pollutants downwind at wind speed
2. **Turbulent diffusion** — atmospheric turbulence spreads the plume laterally and vertically
3. **Deposition and decay** — pollutants settle (dry deposition) or are washed out (wet deposition), and some chemically transform

### Pasquill-Gifford Stability Classes

Atmospheric stability governs how quickly pollutants disperse. The Pasquill-Gifford classification uses surface wind speed and insolation (daytime) or cloud cover (nighttime) to assign one of six classes:

| Class | Condition | Turbulence | Dispersion Rate |
|---|---|---|---|
| A | Strongly unstable | Very high | Rapid — plume spreads quickly, low peak concentrations |
| B | Moderately unstable | High | Fast dispersion |
| C | Slightly unstable | Moderate-high | Moderate-fast |
| D | Neutral | Moderate | Moderate — overcast conditions, most common default |
| E | Slightly stable | Low | Slow — plume stays concentrated |
| F | Stable | Very low | Very slow — nighttime inversions, highest ground-level concentrations |

The dispersion parameters `sigma_y` and `sigma_z` are empirical functions of downwind distance `x` and stability class:

```
sigma_y(x) = a * x^b
sigma_z(x) = c * x^d
```

Approximate coefficients (x in km, sigma in m):

| Class | a (sigma_y) | b | c (sigma_z) | d |
|---|---|---|---|---|
| A | 213 | 0.894 | 440.8 | 1.941 |
| B | 156 | 0.894 | 106.6 | 1.149 |
| C | 104 | 0.894 | 61.0 | 0.911 |
| D | 68 | 0.894 | 33.2 | 0.725 |
| E | 50.5 | 0.894 | 22.8 | 0.678 |
| F | 34 | 0.894 | 14.35 | 0.740 |

### Wind Direction Effects

In real cities, prevailing wind direction creates asymmetric pollution patterns. Pollution plumes extend primarily downwind, with concentration dropping off sharply crosswind. Wind roses (frequency distributions of wind direction and speed) determine which neighborhoods bear the greatest pollution burden from a given source.

### Decay with Distance

For a simplified 2D game grid, concentration from a single source at distance `d` can be approximated as:

```
C(d) = C_0 / (1 + (d / d_half)^2)
```

Where `d_half` is the half-concentration distance (the distance at which concentration drops to 50% of `C_0`). This Lorentzian decay is computationally cheaper than the full Gaussian model while preserving the key property of rapid initial falloff followed by a long tail.

---

## Urban Heat Island Effect

### Causes and Magnitude

The urban heat island (UHI) effect occurs because cities replace natural land cover with impervious, heat-absorbing materials (asphalt, concrete, roofing), reduce evapotranspiration by removing vegetation, and generate waste heat from vehicles, buildings, and industry.

Measured UHI intensity across US cities (USGS study of 50 major cities):

| City | Mean Surface UHI Intensity (C) | Population (millions) |
|---|---|---|
| New Orleans | 4.7 | 0.39 |
| New York | 4.1 | 8.3 |
| Houston | 3.7 | 2.3 |
| Atlanta | 3.6 | 0.50 |
| Chicago | 3.1 | 2.7 |
| Phoenix | 2.4 | 1.7 |
| Average (50 cities) | 2.88 | — |

Key findings from the literature:

- UHI magnitude ranges from 1-7 F (0.6-3.9 C) daytime and 2-5 F (1.1-2.8 C) nighttime in US cities (EPA)
- A Nature study (Zhao et al., 2014) found UHI intensity is largely explained by city population size, climate zone, and vegetation deficit — with daytime UHI dominated by reduced evapotranspiration efficiency and nighttime UHI by reduced heat release efficiency
- Within cities, UHI varies block-by-block: in NYC, some blocks in East Harlem measured nearly 5 C hotter than the reference weather station while nearby tree-covered areas were 2 C cooler
- Impervious surface fraction is the strongest single predictor of local UHI intensity

### Mitigation Strategies

| Strategy | Cooling Effect | Cost | Co-benefits |
|---|---|---|---|
| Urban tree canopy (40% coverage) | 1-5 C local reduction | $15-65/tree/year maintenance | Air quality, stormwater, aesthetics |
| Green roofs | 0.3-3 C building surface reduction | $15-25/sq ft installed | Stormwater, insulation, habitat |
| Cool roofs (high albedo) | 0.3-1 C ambient reduction | $0.75-1.50/sq ft premium | Energy savings 10-30% |
| Permeable pavement | 0.5-2 C local surface reduction | 2-3x conventional cost | Stormwater infiltration |
| Urban water features | 1-3 C within 30m | Variable | Recreation, aesthetics |

---

## Green Infrastructure

### Types and Functions

Green infrastructure (GI) uses natural or engineered ecological systems to provide services traditionally handled by gray infrastructure:

| GI Type | Primary Function | Pollutant Removal | Stormwater Retention | Cost-Effectiveness |
|---|---|---|---|---|
| Urban trees | Air filtration, shade, carbon sequestration | PM10: 5-20% local reduction | 15-30% rainfall interception | $1.37-3.09 benefit per $1 spent |
| Bioswales | Stormwater filtration | TSS: >90%, metals: 50-90% | 50-80% runoff volume reduction | $3-15/sq ft |
| Green roofs | Stormwater retention, insulation | Moderate (depends on substrate) | 57-78% median retention | $15-25/sq ft |
| Rain gardens | Infiltration, filtration | TSS: 70-90%, phosphorus: 50-80% | 40-90% for small storms | $3-10/sq ft |
| Constructed wetlands | Water treatment, habitat | BOD: 70-90%, nitrogen: 30-50% | Large volume capacity | $1-5/sq ft |
| Permeable pavement | Infiltration, reduced runoff | TSS: 80-95% | 50-90% for light rain | 2-3x conventional |

### Ecosystem Services Valuation

The USDA Forest Service has studied urban forest benefits across five US cities. Key economic findings:

- **Annual benefits per tree:** $31-89 (includes energy savings, air quality, stormwater, CO2 reduction, aesthetics)
- **Annual management cost per tree:** $13-65
- **Benefit-cost ratio:** 1.37 to 3.09 — every dollar spent on tree management returns $1.37-3.09 in services
- **Net annual benefit by tree size:** Small tree: ~$1, medium: ~$26, large: ~$48
- Large trees provide disproportionate benefits: a single large tree intercepts 50-80 gallons of rainfall per storm and removes 60-70x more air pollution than a small tree

For stormwater specifically:
- A global synthesis of 548 green roof measurements found median retention rates of 57-78% depending on climate zone
- Bioswales achieve >90% TSS removal and 50-80% runoff volume reduction when properly maintained
- An extensive green roof in Chicago achieved 74% annual stormwater retention over 106 precipitation events

### Carbon Sequestration

Urban trees sequester 10-40 kg CO2 per tree per year depending on species and size. A mature deciduous tree sequesters roughly 22 kg/year; a large conifer can reach 35-40 kg/year. Urban forests in the US collectively store an estimated 708 million tonnes of carbon.

---

## Climate Resilience

### Flooding

Urban flooding results from the combination of impervious surfaces, undersized drainage infrastructure, and increasing precipitation intensity from climate change.

Key vulnerability factors:
- **Impervious cover:** Each 10% increase in impervious surface raises peak stormwater runoff volume by roughly 20-30%
- **Drainage capacity:** Most urban drainage systems were designed for historical rainfall patterns, not current extremes
- **Sea level rise:** Coastal cities face compound flooding from storm surge + rainfall + high tides
- **Flood exposure projections:** By 2100, flood exposure could rise from 1.6 to 1.9 billion people globally, driven 21% by climate change and 77% by population growth (Nature Communications, 2025)

### Extreme Heat

Heat waves are the deadliest weather-related hazard in the US. Impacts are amplified by UHI:
- Cardiovascular mortality during extreme heat was 2.5x higher in neighborhoods with fewer green spaces (Michigan study)
- Heat-related mortality disproportionately affects the elderly, outdoor workers, and those without air conditioning
- Low-income neighborhoods have fewer trees, more impervious surface, and less access to cooling centers — making them substantially hotter

### Infrastructure Vulnerability

| Infrastructure | Heat Vulnerability | Flood Vulnerability | Adaptation Cost Range |
|---|---|---|---|
| Roads/bridges | Pavement buckling > 40C, bridge expansion | Washout, undermining | $100K-10M per mile |
| Power grid | Transformer failure, line sag, peak demand | Substation flooding | $500K-50M per substation |
| Water/sewer | Pipe stress, demand spikes | Combined sewer overflows | $1M-100M per system upgrade |
| Buildings | Cooling load increase 15-40% | Foundation damage, mold | $5K-500K per building |
| Rail/transit | Track buckling > 50C rail temp | Tunnel flooding | $10M-1B per system |

---

## Environmental Regulation

### Regulatory Instruments

Three main categories of environmental regulation relevant to city simulation:

**Command-and-control (emission standards):**
- Set maximum allowable emission rates per source
- National Ambient Air Quality Standards (NAAQS) define safe concentration levels
- Effective but rigid — no incentive to reduce below the standard
- Example: US Clean Air Act standards reduced SO2 emissions by ~90% from 1970 levels

**Market-based (cap-and-trade):**
- Set a total emissions cap, distribute tradable permits
- US Acid Rain Program (1995): reduced SO2 emissions by 3 million tons in year one, at roughly 50% of the projected cost of command-and-control alternatives
- California cap-and-trade: achieved 48% reduction in power sector emissions vs. counterfactual, though industrial sector results were mixed (+6%)
- Meta-analysis of 80 evaluations across 21 carbon pricing systems: average emissions reductions of 5-21%
- Permits create a price signal: polluters who can reduce cheaply do so and sell permits; those facing high abatement costs buy permits

**Environmental Impact Assessment (EIA):**
- Required before major development projects (NEPA in the US, EIA Directive in EU)
- Evaluates air, water, noise, ecological, and social impacts
- Game mechanic parallel: requiring environmental review before placing heavy industry could introduce planning friction that rewards forethought

### Regulatory Effectiveness for Simulation

For a game, regulation mechanics can create strategic trade-offs:
- Emission standards as unlock gates (clean tech becomes available at certain city milestones)
- Cap-and-trade as a city budget mechanic (selling unused permits generates revenue)
- EIA as a placement constraint (industrial zones near residential zones trigger penalties or require mitigation spending)

---

## Sustainability Metrics

### Carbon Footprint

Global urban areas contain ~60% of population but drive ~64% of the global carbon footprint. Per capita emissions vary dramatically:

| City / Context | CO2 per capita (tonnes/year) | Key Driver |
|---|---|---|
| Global average | 4.7 | — |
| US average | 14.7 | Vehicle dependence, energy mix |
| EU average | 6.4 | Mixed transport, cleaner grid |
| New York City | 6.1 | Dense, transit-rich |
| Houston | 14.0+ | Sprawl, petrochemical industry |
| Singapore | 8.5 | Compact, efficient, import-dependent |
| Copenhagen | 3.5 | Cycling, district heating, renewables |

Key insight: **density reduces per-capita emissions.** NYC's per-capita emissions are roughly 60% below the US average, driven by transit use, smaller dwelling units, and shared walls reducing heating demand.

### Ecological Footprint

Ecological footprint measures the biologically productive area required to sustain a population's consumption, measured in global hectares (gha) per capita:
- **Global average:** ~2.6 gha/capita
- **Global biocapacity:** ~1.6 gha/capita (deficit = overshoot)
- **US average:** ~8.1 gha/capita
- **London:** ~4.5 gha/capita
- Food and transportation are the largest components

### Walkability and Sustainability

Walk Score and similar indices correlate with environmental outcomes:
- Walk Score > 70 ("very walkable") is associated with 20-40% lower vehicle miles traveled (VMT) per household
- Transit-oriented development reduces car ownership by 30-50% compared to auto-dependent suburbs
- Walkable neighborhoods show 30-50% lower transport-related CO2 emissions

---

## Waste and Circular Economy

### Waste Generation Rates

US municipal solid waste (MSW) generation (EPA, 2018):
- **Total:** 292.4 million tons/year
- **Per capita:** 4.9 lbs/person/day (2.2 kg)
- **Trend:** +34% per capita from 1980 to 2018

Global comparison of daily per capita waste generation:
- **US:** 2.2 kg
- **Germany:** 1.7 kg
- **UK:** 1.3 kg
- **Sweden:** 1.2 kg
- **Global average:** 0.74 kg (range: 0.11 to 4.54 kg)

Positive correlation between income level and waste generation. High-income countries projected +19% by 2050; low/middle-income countries +40% or more.

### Waste Disposition

| Pathway | US Share (2018) | Key Economics |
|---|---|---|
| Landfill | 50% (146M tons) | $50-100/ton tipping fees |
| Recycling | 24% (69M tons) | Revenue $0-150/ton depending on material |
| Composting | 8.5% (25M tons) | $30-80/ton processing cost |
| Combustion (WTE) | 11.8% (35M tons) | $60-120/ton; generates ~550 kWh/ton |
| Other | 5.7% | — |

### Waste-to-Energy

US waste-to-energy stats (2022): 63 power plants burned 26.6 million tons of MSW and generated 12.8 billion kWh of electricity. Combustion reduces waste volume by 85-95% and weight by 75-85%. The ash residue (10-25% of original weight) is mostly landfilled, though research continues on reuse in construction materials.

### Recycling Economics

Recycling economics depend heavily on commodity markets. Aluminum recycling saves ~95% of the energy required for primary production. Paper and cardboard recycling saves ~60-70% of energy. Plastic recycling is economically marginal for most resins — collection and sorting costs often exceed virgin material prices, particularly for mixed plastics.

Operating costs for integrated waste management: >$100/tonne in high-income countries, ~$35/tonne in lower-income countries.

---

## Environmental Justice

### Pollution Exposure Inequality

Research consistently shows that low-income communities and communities of color bear disproportionate pollution burdens:

- Minority and low-income populations live closer to waste sites, disposal facilities, incinerators, refineries, and other contaminating industries
- An extensive environmental justice literature documents that socioeconomically vulnerable communities are exposed to multiple concurrent pollutants and social stressors that compound health impacts
- The disparity is not limited to one pollutant type — cumulative impact from air, water, noise, and soil contamination concentrates in the same neighborhoods

### LULU Siting Mechanisms

Locally Unwanted Land Uses (LULUs) — landfills, power plants, highways, industrial facilities — create negative externalities for nearby residents. Two competing theories explain their disproportionate placement in disadvantaged communities:

1. **Political power theory:** Low-SES communities lack the social capital and political influence to block LULU placement. Wealthier communities successfully organize NIMBY opposition, redirecting facilities to neighborhoods with less political power.

2. **Market dynamics theory:** LULUs are sited on cheap land (rational economic choice). Once placed, the LULU depresses surrounding property values, making the area affordable only to lower-income households. The inequality is a consequence of market sorting, not necessarily intentional targeting.

In practice, both mechanisms operate simultaneously and reinforce each other.

### Cumulative Impact

Environmental justice analysis increasingly focuses on cumulative impact rather than single-pollutant analysis:
- A neighborhood near both a highway and an industrial zone faces compounding air pollution, noise, and traffic safety risks
- Social vulnerability factors (poverty, limited healthcare access, pre-existing health conditions) amplify the health consequences of pollution exposure
- Tools like CalEnviroScreen score census tracts on combined pollution burden and population vulnerability

### Relevance to Simulation

Environmental justice creates a feedback loop: pollution lowers land values, which concentrates low-income residents near pollution sources, which reduces political pressure to remediate, which perpetuates the exposure disparity. This dynamic is directly modelable as a game mechanic.

---

## Application to Bitborough

### Current State

Bitborough already has the scaffolding for a pollution system:
- `pollutionLevel: Uint8Array` is allocated in game state but not actively propagated
- `BuildingDef` includes `pollutionRadius` and `pollutionAmount` fields
- Industrial buildings have defined pollution values (e.g., `ind.low`: radius 3, amount 10; `ind.high`: radius 6, amount 40)
- Power plants have pollution definitions (`power.diesel`: radius 2, amount 5; `power.coal`: radius 6, amount 20; `power.nuclear`: 0)
- Desirability already applies a `RES_POLLUTION_PENALTY = 0.3` weight against normalized pollution levels
- Parks exist as a building type but have no pollution-reduction effect

### Proposed: Pollution Dispersion Layer

Implement a per-tick pollution propagation step that writes to the existing `pollutionLevel` Uint8Array:

```
For each pollution source (x_s, y_s) with amount A and radius R:
  For each tile (x, y) within radius R:
    d = manhattan_distance(x, y, x_s, y_s)
    pollution[y * width + x] += A * max(0, 1 - d / R)
```

This linear decay within radius is the cheapest option. For more realism, use the Lorentzian falloff described in the dispersion section:

```
pollution(d) = A / (1 + (d / d_half)^2)
```

Where `d_half = R / 2` gives a half-concentration distance at half the radius. This produces a sharper central peak and longer tail than linear decay, better matching real Gaussian plume behavior without the computational cost.

Clamp the accumulated `pollutionLevel` array to [0, 255] after summing contributions from all sources. Normalize against a city-wide maximum when feeding into desirability calculations.

### Proposed: Wind Direction

Add a `windDirection` (0-7 for 8 compass directions) and `windStrength` (0-1) to game state, updated periodically or seasonally. Modify the dispersion kernel:

```
For each tile (x, y) within radius R of source (x_s, y_s):
  dx = x - x_s
  dy = y - y_s
  d = sqrt(dx^2 + dy^2)
  // Wind bias: tiles downwind receive more pollution
  dot = (dx * wind_dx + dy * wind_dy) / d  // cosine of angle to wind direction
  wind_factor = 1 + windStrength * dot       // range [1-windStrength, 1+windStrength]
  pollution += A * max(0, 1 - d / R) * wind_factor
```

This stretches the pollution footprint downwind without requiring a full fluid simulation.

### Proposed: Green Infrastructure Mechanics

**Parks as pollution sinks:** Each park tile within range of a pollution source reduces the received pollution at surrounding tiles. Implement as a negative contribution to the pollution layer:

```
park_reduction(d) = -PARK_ABSORB * max(0, 1 - d / PARK_RADIUS)
```

Where `PARK_ABSORB = 3-5` (calibrate so that a single park partially mitigates a nearby diesel generator but cannot neutralize a coal plant).

**Tree canopy / green roof buildings (future):** Higher-tier park variants with larger radii and stronger absorption. Could be unlocked at population milestones or through research spending.

### Proposed: Environmental Feedback Loops

The research supports several interconnected feedback loops for simulation:

1. **Pollution -> Land Value -> Residential Sorting:**
   Pollution depresses desirability (already implemented via `RES_POLLUTION_PENALTY`). Low desirability suppresses density upgrades and land value. This naturally pushes residential development away from industrial zones.

2. **Industrial Density -> Pollution -> Health/Happiness:**
   As industrial zones densify (`ind.low` -> `ind.med` -> `ind.high`), pollution radius and amount increase (radius 3->4->6, amount 10->20->40). Add a city-wide pollution metric (mean of `pollutionLevel`) that affects citizen happiness or health, creating pressure to invest in mitigation.

3. **Power Source Trade-off:**
   Coal plants (pollution 20, radius 6) vs. diesel generators (pollution 5, radius 2) vs. nuclear (pollution 0, cost high). This already exists structurally; propagating pollution makes the trade-off tangible.

4. **Green Infrastructure ROI:**
   Parks cost money and occupy land that could generate tax revenue. But they reduce pollution, increase nearby desirability, and enable density upgrades. The benefit-cost ratio of 1.37-3.09 from real urban forestry research suggests parks should pay for themselves indirectly — a satisfying economic loop for players to discover.

### Proposed: Noise Layer (Future)

Add a `noiseLevel: Uint8Array` layer. Roads and industrial buildings emit noise using the same distance-decay kernel as pollution but with different source values. Noise affects residential desirability but not commercial desirability (or affects it less). Highway-equivalent roads would have the highest noise values. This creates a reason to buffer residential zones from major roads — matching real planning practice.

### Proposed: Sustainability Score

Expose a composite sustainability score in the city stats panel:

```
sustainability = w1 * (1 - mean_pollution/255)
              + w2 * (1 - mean_crime/255)
              + w3 * green_ratio
              + w4 * transit_coverage
              + w5 * renewable_power_fraction
```

Where `green_ratio` = park tiles / total developed tiles, `transit_coverage` = fraction of residential tiles within transit stop radius, and `renewable_power_fraction` = nuclear power / total power capacity (expandable to solar/wind later).

### Formulas Summary

| Mechanic | Formula | Parameters |
|---|---|---|
| Pollution decay (linear) | `P(d) = A * max(0, 1 - d/R)` | A=amount, R=radius, d=distance |
| Pollution decay (Lorentzian) | `P(d) = A / (1 + (d/d_half)^2)` | d_half = R/2 |
| Wind-biased dispersion | `P *= 1 + windStrength * cos(angle_to_wind)` | windStrength in [0,1] |
| Park absorption | `P -= PARK_ABSORB * max(0, 1 - d/PARK_RADIUS)` | PARK_ABSORB = 3-5 |
| Noise attenuation | `L(d) = L_ref - 10k * log10(d/d_ref)` | k=1 (point), k=0.5 (line) |
| UHI contribution | `T_excess = UHI_BASE * impervious_fraction - TREE_COOLING * green_fraction` | Per-tile or zone-level |
| Desirability penalty | `score -= RES_POLLUTION_PENALTY * (pollutionLevel[i] / 255)` | Already implemented |
| Property value penalty | Noise NDI: 0.5% per dB above 55 dBA | Applied to land value layer |

---

## Cross-References

- [Utilities and Infrastructure](./utilities-and-infrastructure.md) — Power plant pollution trade-offs, water/sewer capacity, infrastructure vulnerability
- [Transportation and Traffic](./transportation-and-traffic.md) — Traffic as pollution and noise source, transit as mitigation, VMT reduction
- [Urban Growth Patterns](./urban-growth-patterns.md) — Sprawl increases per-capita emissions; density reduces environmental footprint
- [Urban Density Gradients](./urban-density-gradients.md) — Pollution affects desirability which shapes density distribution
- [Transit-Oriented Development](./transit-oriented-development.md) — TOD reduces vehicle emissions and noise near transit nodes

---

## Sources

### Air Pollution and Dispersion
- [AP-42: Compilation of Air Emissions Factors — US EPA](https://www.epa.gov/air-emissions-factors-and-quantification/ap-42-compilation-air-emissions-factors-stationary-sources)
- [Atmospheric Dispersion Modeling — Wikipedia](https://en.wikipedia.org/wiki/Atmospheric_dispersion_modeling)
- [Introduction to Gaussian Plume Models — Venkatram & The (2003)](https://apsi.tech/material/modeling/IntroductiontoGaussianPlumeModels.pdf)
- [Self-study notes: Gaussian Plumes — University of Western Ontario](https://www.eng.uwo.ca/people/esavory/gaussian%20plumes.pdf)
- [Plume Dispersion Coefficients — University of Washington CEE](https://courses.washington.edu/cee490/DISPCOEF4WP.htm)
- [READY Tools: Pasquill Stability Classes — NOAA](https://www.ready.noaa.gov/READYpgclass.php)

### Water Pollution
- [Wastewater Quality Indicators — Wikipedia](https://en.wikipedia.org/wiki/Wastewater_quality_indicators)
- [Common Watershed Parameters — Indiana DEM](https://www.in.gov/idem/nps/watershed-assessment/water-monitoring-and-you/common-watershed-parameters/)
- [Typical Water Quality Parameters Explained — MERI](https://meri.njmeadowlands.gov/downloads/typical_water_quality_parameters.pdf)

### Noise Pollution
- [Roadway Noise — Wikipedia](https://en.wikipedia.org/wiki/Roadway_noise)
- [The Traffic Noise Externality — NBER Working Paper (UC Berkeley)](https://eml.berkeley.edu/~moretti/noise.pdf)
- [Noise Overview — AASHTO Environment](https://environment.transportation.org/focus-areas/noise/noise-overview/)
- [Reviewing Noise Analysis — FHWA](https://www.fhwa.dot.gov/Environment/noise/resources/reviewing_noise_analysis/)

### Urban Heat Island
- [What Are Heat Islands? — US EPA](https://www.epa.gov/heatislands/what-are-heat-islands)
- [Characterizing Urban Heat Islands Across 50 Major US Cities — USGS](https://www.usgs.gov/publications/characterizing-urban-heat-islands-across-50-major-cities-united-states)
- [Magnitude of Urban Heat Islands Largely Explained by Climate and Population — Nature (Zhao et al., 2014)](https://www.nature.com/articles/s41586-019-1512-9)
- [Urban Heat Islands 101 — Resources for the Future](https://www.rff.org/publications/explainers/urban-heat-islands-101/)

### Green Infrastructure
- [Municipal Forest Benefits and Costs in Five US Cities — USDA Forest Service](https://www.fs.usda.gov/psw/publications/mcpherson/psw_2005_mcpherson003.pdf)
- [Green Roofs for Stormwater Runoff Retention: A Global Quantitative Synthesis — ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0921344921001841)
- [Bioswales in Urban Stormwater Management — IJSRA](https://ijsra.net/content/bioswales-urban-stormwater-management-literature-review-design-principles-and-performance)
- [Stormwater BMP: Green Roofs — US EPA](https://www.epa.gov/system/files/documents/2021-11/bmp-green-roofs.pdf)
- [Cool Cities: The Value of Urban Trees — CEPR](https://cepr.org/voxeu/columns/cool-cities-value-urban-trees)

### Climate Resilience
- [The Role of Climate and Population Change in Global Flood Exposure — Nature Communications (2025)](https://www.nature.com/articles/s41467-025-56654-8)
- [Extreme Weather and Climate Change: Population Health — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC9013542/)
- [Urban Heat Islands and Heat Mortality — ECMWF](https://stories.ecmwf.int/urban-heat-islands-and-heat-mortality/index.html)

### Environmental Regulation
- [Lessons Learned from Three Decades of Cap and Trade — REEP](https://www.journals.uchicago.edu/doi/10.1093/reep/rew017)
- [The Effect of Cap-and-Trade on Sectoral Emissions: California — ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0301421524000867)
- [Clearing the Air: Facts About Cap and Trade — US EPA](https://www.epa.gov/sites/default/files/2016-03/documents/clearingtheair.pdf)

### Sustainability Metrics
- [Sizing Up the Carbon Footprint of Cities — NASA Earth Observatory](https://earthobservatory.nasa.gov/images/144807/sizing-up-the-carbon-footprint-of-cities)
- [City Footprints and SDGs — Nature Communications](https://www.nature.com/articles/s41467-021-23968-2)
- [Ecological Footprint — Wikipedia](https://en.wikipedia.org/wiki/Ecological_footprint)
- [Walkability and Its Relationships With Health, Sustainability, and Livability — Frontiers](https://www.frontiersin.org/journals/built-environment/articles/10.3389/fbuil.2021.721218/full)

### Waste and Circular Economy
- [National Overview: Facts and Figures on Materials, Wastes and Recycling — US EPA](https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/national-overview-facts-and-figures-materials)
- [Trends in Solid Waste Management — World Bank](https://datatopics.worldbank.org/what-a-waste/trends_in_solid_waste_management.html)
- [Municipal Solid Waste Factsheet — University of Michigan CSS](https://css.umich.edu/publications/factsheets/material-resources/municipal-solid-waste-factsheet)

### Environmental Justice
- [Socioeconomic Disparities and Air Pollution Exposure: A Global Review — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4626327/)
- [Locally Unwanted Land Use — Wikipedia](https://en.wikipedia.org/wiki/Locally_unwanted_land_use)
- [Cumulative Impacts in Environmental Justice — ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0166046224000176)
- [From Toxic Sites to Parks as (Green) LULUs? — Anguelovski (2016)](https://journals.sagepub.com/doi/abs/10.1177/0885412215610491)
