# Environment and Sustainability

> How pollution, green infrastructure, and climate interact with urban development — models for environmental simulation.

## Table of Contents

- [Air Pollution](#air-pollution)
- [Water Pollution](#water-pollution)
- [Noise Pollution](#noise-pollution)
- [Pollution Dispersion](#pollution-dispersion)
- [Urban Heat Island Effect](#urban-heat-island-effect)
- [Green Infrastructure](#green-infrastructure)
- [Biodiversity and Ecosystem Services](#biodiversity-and-ecosystem-services)
- [Soil Contamination and Brownfields](#soil-contamination-and-brownfields)
- [Light Pollution](#light-pollution)
- [Embodied Carbon and Lifecycle Assessment](#embodied-carbon-and-lifecycle-assessment)
- [Urban Food Systems](#urban-food-systems)
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

## Biodiversity and Ecosystem Services

### Urban Biodiversity Overview

Cities are not ecological wastelands. Despite intensive land use, fragmented green spaces, and the prevalence of non-native species, urban areas can harbor substantial biological richness. A Nature Reviews Biodiversity synthesis (2025) found that cities support meaningful populations of birds, insects, mammals, and plants — particularly when green infrastructure is intentionally designed for habitat value rather than aesthetics alone.

However, urbanization consistently reduces species richness relative to surrounding natural areas. The primary drivers are:

- **Habitat fragmentation** — roads, buildings, and infrastructure break continuous habitat into isolated patches, reducing genetic diversity and population viability
- **Impervious surface coverage** — eliminates ground-nesting habitat, reduces soil invertebrate populations, and blocks hydrological connectivity
- **Simplified vegetation structure** — manicured lawns and monoculture plantings support far fewer species than structurally complex native plantings
- **Chemical inputs** — pesticides, herbicides, and road salt reduce invertebrate and amphibian populations
- **Noise and light** — disrupt breeding, foraging, and migration behaviors (see Light Pollution section below)

### Species Richness in Cities

Urban biodiversity surveys reveal consistent patterns across taxa:

| Taxon | Urban vs. Rural Richness | Key Limiting Factors | Urban Hotspots |
|---|---|---|---|
| Birds | 50-80% of surrounding rural richness | Habitat patch size, canopy cover, insect prey availability | Riparian corridors, mature tree canopy, wetlands |
| Native bees | 30-70% of rural richness; some generalists thrive | Nesting substrate (bare soil, dead wood), floral diversity | Community gardens, meadow plantings, green roofs |
| Butterflies | 20-60% of rural richness | Host plant availability, corridor connectivity | Wildflower meadows, railway margins, river corridors |
| Mammals | Variable; some mesopredators (raccoons, foxes) increase | Road mortality, den site availability, food subsidies | Riparian zones, large parks (>10 ha), cemetery grounds |
| Amphibians | 10-40% of rural richness; most sensitive taxon | Water quality, road mortality, habitat connectivity | Constructed wetlands, stormwater ponds, stream buffers |

A Nature Communications study (2020) found that urban areas can actually be hotspots for bees and pollination relative to surrounding agricultural land — primarily because intensive agriculture has degraded rural pollinator habitat so severely that even fragmented urban green spaces offer superior foraging resources.

### Pollinator Corridors

Pollinators — bees, butterflies, hoverflies, moths — provide critical ecosystem services to both urban gardens and surrounding agricultural land. Connected habitat corridors increase pollinator movement by 68% compared to isolated patches (research tracking small mammals, butterflies, plants, and pollinators).

Effective urban pollinator corridors consist of:

- **Linear parks and greenways** connecting larger habitat patches
- **Street tree plantings** with flowering species selected for sequential bloom periods (providing nectar/pollen from March through October)
- **Railway margins and utility easements** left unmanaged or planted with native wildflower mixes
- **Stepping stones** — small habitat patches (even individual gardens, green roofs, or planted medians) spaced < 200m apart, allowing flight-limited species to traverse the urban matrix
- **River and stream corridors** — naturally linear, providing both habitat and movement pathways

Design guidelines for effective pollinator corridors:
- Minimum corridor width: 5-10m for insects, 30-50m for birds and small mammals
- Stepping stone spacing: < 200m for bees, < 500m for butterflies, < 1km for birds
- Plant diversity: minimum 15-20 native flowering species per corridor segment
- Connectivity: corridors should link to larger habitat patches (parks > 2 ha) at both ends

Singapore's Park Connector Network — a 300+ km system of greenways connecting parks across the city — has attracted 550 species of birds and butterflies and enabled gene flow between previously isolated park populations.

### Urban Wildlife and Connectivity

Habitat fragmentation is a leading cause of urban species decline. Roads divide forests, railways bisect wetlands, and dense development blocks migration. The consequences are:

- **Genetic isolation** — small, disconnected populations lose genetic diversity and face inbreeding depression
- **Edge effects** — fragmented patches have disproportionately high perimeter-to-area ratios, exposing interior species to noise, light, predators, and invasive species
- **Road mortality** — one of the leading causes of wildlife death in urban areas, particularly for amphibians, reptiles, and medium-sized mammals

Mitigation infrastructure:

| Structure | Cost Range | Effectiveness | Target Species |
|---|---|---|---|
| Wildlife overpass (green bridge) | $1-12M each | Reduced collisions 80-90% (Banff data: 200,000+ safe crossings) | Large mammals, ungulates |
| Wildlife underpass | $100K-2M each | Effective for medium mammals, amphibians | Coyotes, foxes, turtles, salamanders |
| Amphibian tunnels | $10K-100K each | 80-95% reduction in road mortality at crossing points | Frogs, salamanders, turtles |
| Rope bridges / canopy bridges | $5K-50K each | Effective for arboreal species | Squirrels, possums, monkeys |
| Fish ladders / passages | $100K-5M each | Restores upstream migration | Salmon, trout, shad |

### Ecosystem Services Valuation Beyond Trees

Ecosystem services are the direct and indirect benefits that natural systems provide to human populations. The TEEB (The Economics of Ecosystems and Biodiversity) framework and Costanza et al.'s landmark studies provide monetary valuations:

| Ecosystem Type | Estimated Value ($/ha/year) | Primary Services |
|---|---|---|
| Urban green space (parks) | $3,000-6,000 | Recreation, air filtration, heat mitigation, mental health |
| Urban wetlands | $25,000-100,000+ | Stormwater management, water filtration, flood control, habitat |
| Riparian buffers | $8,000-20,000 | Erosion control, water filtration, habitat connectivity |
| Urban forests | $4,000-12,000 | Carbon sequestration, air filtration, shade, stormwater |
| Pollination services | $2,000-8,000 (cropland context) | Fruit/vegetable production, genetic diversity maintenance |
| Coral reefs (for coastal cities) | $130,000-1,200,000 | Coastal protection, fisheries, tourism |

Costanza et al. (2014) estimated total global ecosystem services at $125-145 trillion/year — roughly 1.5-2x global GDP. More than half of global GDP (~$40 trillion) depends directly on nature and its services. The implication for urban planning: destroying or degrading natural systems imposes real economic costs that are typically externalized.

Key valuation categories relevant to urban simulation:

- **Provisioning services:** food, water, raw materials
- **Regulating services:** air quality, climate regulation, water purification, flood mitigation, pollination, pest control
- **Cultural services:** recreation, aesthetic value, mental health, education
- **Supporting services:** nutrient cycling, soil formation, habitat provision

---

## Soil Contamination and Brownfields

### Types of Soil Contamination

Urban soils accumulate contaminants from decades of industrial activity, transportation, waste disposal, and atmospheric deposition. The primary contaminant categories:

| Contaminant Class | Common Compounds | Typical Sources | Health Risks |
|---|---|---|---|
| Heavy metals | Lead (Pb), arsenic (As), cadmium (Cd), chromium (Cr), mercury (Hg), zinc (Zn) | Smelters, foundries, paint, gasoline (leaded), batteries, coal ash | Neurotoxicity (Pb), carcinogenic (As, Cr-VI, Cd), kidney damage |
| Petroleum hydrocarbons | Benzene, toluene, ethylbenzene, xylene (BTEX), diesel range organics (DRO), motor oil | Gas stations, fuel storage tanks, auto repair, refineries | Benzene is a known human carcinogen (leukemia); vapors cause respiratory distress |
| Volatile organic compounds (VOCs) | Trichloroethylene (TCE), perchloroethylene (PCE), vinyl chloride, methylene chloride | Dry cleaners, degreasing operations, electronics manufacturing | Liver/kidney damage, CNS effects, carcinogenic (vinyl chloride, TCE) |
| Polycyclic aromatic hydrocarbons (PAHs) | Benzo[a]pyrene, naphthalene, phenanthrene | Coal tar, creosote, incomplete combustion, asphalt production | Carcinogenic; bioaccumulate in soil organisms |
| Polychlorinated biphenyls (PCBs) | Aroclor series | Electrical transformers, hydraulic fluids, caulking (pre-1979 buildings) | Endocrine disruption, carcinogenic, bioaccumulative |
| Pesticides/herbicides | DDT, chlordane, dieldrin, arsenic-based compounds | Agricultural land converted to urban, termite treatment, lawn care | Neurotoxicity, endocrine disruption, persistent in soil for decades |

Soil contamination is not limited to industrial sites. A comprehensive FAO global assessment found that organic contaminant-polluted soils are mainly localized around industrial and urban centers, but urban residential soils routinely contain elevated lead (from legacy paint and gasoline), PAHs (from combustion), and pesticide residues.

### Brownfield Definition and Scale

A **brownfield** is a property where expansion, redevelopment, or reuse may be complicated by the presence or potential presence of a hazardous substance, pollutant, or contaminant (EPA definition). Brownfields are distinct from Superfund sites — they are typically less severely contaminated but far more numerous.

Key statistics:
- **Estimated brownfield sites in the US:** 450,000-1,000,000 (EPA estimates vary)
- **Total Superfund NPL (National Priorities List) sites:** ~1,300 active sites
- **Brownfield land area:** estimated 5-15 million acres nationally
- **Common former uses:** gas stations, dry cleaners, factories, rail yards, landfills, military installations

### CERCLA/Superfund Regulatory Framework

The Comprehensive Environmental Response, Compensation, and Liability Act (CERCLA, 1980) — commonly known as Superfund — authorizes the federal government to clean up contaminated sites and hold "potentially responsible parties" (PRPs) financially liable.

**Superfund cleanup phases:**

| Phase | Purpose | Typical Duration | Typical Cost |
|---|---|---|---|
| Preliminary Assessment / Site Inspection (PA/SI) | Identify potential hazard, decide if further investigation needed | 6-18 months | $50K-500K |
| Remedial Investigation / Feasibility Study (RI/FS) | Characterize contamination extent; evaluate cleanup alternatives | 2-5 years | $500K-10M |
| Record of Decision (ROD) | Document selected remedy, cost estimates, cleanup goals | 6-12 months | Administrative |
| Remedial Design (RD) | Engineering specifications for the selected remedy | 1-3 years | $200K-5M |
| Remedial Action (RA) | Actual construction and implementation of cleanup | 2-10+ years | $1M-500M+ |
| Long-term monitoring / O&M | Verify remedy effectiveness, maintain systems | 10-30+ years | $100K-2M/year |

Total timeline: Superfund cleanups averaged 3.9 years from listing to completion in 1986-1989, but by 1996 this had increased to 10.6 years on average. Complex sites can take 20-30+ years.

**Liability under CERCLA:**
- **Strict liability** — PRPs are liable regardless of fault or negligence
- **Joint and several liability** — any single PRP can be held responsible for the entire cleanup cost
- **Retroactive liability** — applies to contamination that occurred before CERCLA was enacted
- These provisions make brownfield acquisition risky for developers, even if contamination is minor, because the new owner can inherit cleanup liability

### Cleanup Costs

| Site Type | Median Cleanup Cost | Cost Range | Cost Per Acre (median) |
|---|---|---|---|
| Gas station (UST removal) | $100K-500K | $50K-2M | $200K-500K |
| Dry cleaner (PCE plume) | $500K-2M | $100K-10M | $500K-2M |
| Former factory (mixed contaminants) | $2M-20M | $500K-100M+ | $57K-5M (varies enormously) |
| Superfund NPL site | $12M-30M (median) | $1M-500M+ | Highly variable |
| PFAS contamination | $1M-50M+ | Emerging; costs escalating rapidly | Unknown — emerging liability |

The Council for Urban Economic Development (CUED) found a median brownfield cleanup cost of $57,000 per acre, but this varies by orders of magnitude depending on contaminant type, depth, and groundwater involvement. Sites with contaminants in groundwater and sediment are the most expensive to remediate; contamination limited to surface soil or building materials is the least expensive.

### Brownfield Redevelopment Incentives

Federal and state programs exist to overcome the liability and cost barriers that leave brownfields abandoned:

| Program | Mechanism | Key Benefit |
|---|---|---|
| EPA Brownfields Grants | Assessment ($500K), cleanup ($500K), revolving loan fund grants | Direct federal funding; reduces developer risk |
| Federal Brownfields Tax Incentive | Cleanup costs fully deductible in year incurred (not capitalized) | Immediate tax benefit rather than multi-year amortization |
| Qualified Opportunity Zones | Tax deferral/reduction on capital gains invested in designated zones | Many brownfield sites are in designated QOZs |
| State Voluntary Cleanup Programs (VCPs) | Liability protection ("No Further Action" letters) after completing state-supervised cleanup | Removes open-ended liability; enables financing |
| State tax credits (e.g., Maryland) | 50-70% property tax credit on post-cleanup assessed value increase for 5 years | Directly rewards value creation from remediation |
| Tax Increment Financing (TIF) | Future property tax revenue from redeveloped site funds current cleanup costs | Self-financing mechanism for municipalities |

**Economic benefits of brownfield redevelopment:**
- Property values within 1.29 miles of remediated brownfield sites increase 5-15%
- EPA estimates 8.9 jobs created per $100,000 of brownfield investment
- Economic multiplier: 2-7x more tax revenue generated than initial government investment
- Brownfield redevelopment reduces sprawl pressure by returning central urban land to productive use

---

## Light Pollution

### Sources and Scale

Light pollution is excessive, misdirected, or obtrusive artificial light. It is one of the fastest-growing forms of environmental pollution, yet one of the most overlooked.

Key statistics:
- **83%** of the world's population lives under light-polluted skies
- **23%** of the world's land surface between 75N and 60S is affected by skyglow
- Global light pollution increased by at least **49%** from 1992 to 2017
- Artificial night sky brightness is increasing at approximately **10% per year**
- An estimated **30-60%** of outdoor lighting is wasted — directed upward or sideways where it serves no useful purpose

Primary sources of urban light pollution:

| Source | Contribution | Key Characteristics |
|---|---|---|
| Street lighting | 30-40% of outdoor light | Often poorly shielded; older fixtures emit light above horizontal |
| Commercial signage and facades | 15-25% | Illuminated 24/7 in many areas; bright white LEDs increasingly common |
| Parking lots and security lighting | 15-25% | Over-lit relative to need; unshielded floodlights |
| Sports and recreation facilities | 5-15% | Extremely bright (500-2000 lux); significant glare beyond facility |
| Residential exterior lighting | 5-10% | Unshielded porch lights, landscape lighting, decorative fixtures |
| Industrial facilities | 5-10% | Security lighting, process area illumination |

### The Bortle Dark-Sky Scale

The Bortle scale (John Bortle, 2001) provides a nine-level classification of night sky brightness, from pristine dark sky to inner-city skyglow:

| Class | Description | Naked-Eye Limiting Magnitude | SQM (mag/arcsec2) | Typical Location |
|---|---|---|---|---|
| 1 | Excellent dark sky | 7.6-8.0 | 21.7-22.0 | Remote wilderness, no towns within 100+ km |
| 2 | Typical truly dark site | 7.1-7.5 | 21.5-21.7 | Rural, far from towns |
| 3 | Rural sky | 6.6-7.0 | 21.3-21.5 | Some light domes on horizon |
| 4 | Rural/suburban transition | 6.1-6.5 | 20.4-21.3 | Small town outskirts |
| 5 | Suburban sky | 5.6-6.0 | 19.5-20.4 | Outer suburbs |
| 6 | Bright suburban sky | 5.1-5.5 | 18.9-19.5 | Suburbs, Milky Way barely visible |
| 7 | Suburban/urban transition | 4.6-5.0 | 18.4-18.9 | Inner suburbs, sky grayish-white |
| 8 | City sky | 4.1-4.5 | 17.8-18.4 | City, only brightest stars visible |
| 9 | Inner-city sky | 3.5-4.0 | <17.8 | City center, sky bright grayish-white |

As urbanization increases, more people live under Bortle 8-9 conditions. The Sky Quality Meter (SQM), measuring in magnitudes per square arcsecond, provides the standard quantitative measurement — higher values mean darker skies.

### Effects on Wildlife

Artificial light at night (ALAN) disrupts ecological processes across virtually all taxa:

**Insects:**
- Artificial lights act as ecological traps — insects are attracted, circle until exhausted, and are killed by heat, predation, or exhaustion
- A single streetlight can reduce local moth populations by up to 1/3 over a growing season
- Insect declines from ALAN cascade through food webs, reducing food availability for bats, birds, and amphibians
- LED lights, particularly those with blue-white spectra (high correlated color temperature, CCT > 4000K), attract 2-3x more insects than warm-spectrum alternatives (CCT < 3000K)

**Birds:**
- Light pollution causes birds to sing earlier in the morning, disrupting territorial and mating behavior
- Migratory birds use stars for navigation; bright city lights disorient millions of migrants annually, causing building collisions (estimated 100 million to 1 billion bird deaths per year in the US from building collisions, many light-related)
- Exposure to ALAN suppresses melatonin rhythms and disrupts photoperiodic activities (timing of breeding, molting, migration)
- House sparrows exposed to broad-spectrum light at night showed suppressed melatonin and increased mortality from West Nile virus

**Sea turtles:**
- Hatchlings orient toward the brightest horizon — naturally, the moonlit ocean. Artificial lights on shore disorient hatchlings inland, where they die from dehydration, predation, or vehicle strikes
- Florida alone estimates tens of thousands of hatchling deaths per year from light disorientation

**Mammals:**
- Bat species that are light-averse (most insectivorous bats) avoid illuminated areas, losing foraging territory
- A few fast-flying bat species (e.g., pipistrelles) exploit insect aggregations around lights, creating competitive imbalance
- Nocturnal mammals shift activity patterns, increasing predation risk and reducing foraging efficiency

### Effects on Human Health

Melatonin — the hormone regulating the sleep-wake cycle — is suppressed by exposure to light at night. The sensitivity is species-dependent but humans are affected at remarkably low levels:

- Melatonin suppression begins at **6 lux** in sensitive individuals (equivalent to a dim room)
- Blue-rich light (short wavelength, 440-500nm) is 3-5x more effective at suppressing melatonin than warm/amber light
- For comparison: a typical streetlight produces 10-30 lux at ground level; indoor room lighting is 100-500 lux

Health effects associated with chronic ALAN exposure:

| Effect | Evidence Level | Mechanism |
|---|---|---|
| Sleep disruption | Strong — consistent across studies | Melatonin suppression, circadian misalignment |
| Increased cancer risk (breast, prostate) | Moderate — epidemiological association | Melatonin is anti-oncogenic; suppression may increase tumor growth |
| Obesity and metabolic dysfunction | Moderate — animal and human studies | Circadian disruption alters glucose metabolism and appetite hormones |
| Depression and mood disorders | Moderate | Circadian disruption, sleep fragmentation |
| Cardiovascular risk | Emerging | Linked to disrupted circadian regulation of blood pressure and heart rate |

Shift workers exposed to chronic light at night have elevated rates of breast cancer (40-60% higher in long-term night shift workers per some studies), supporting the mechanistic link between ALAN, melatonin suppression, and cancer.

### Measurement Methods

| Method | Unit | Range | Use Case |
|---|---|---|---|
| Sky Quality Meter (SQM) | mag/arcsec2 | 16-22 | Point measurements of zenith sky brightness |
| Lux meter | lux | 0.001-100,000 | Ground-level illuminance from artificial sources |
| Satellite (VIIRS DNB) | nW/cm2/sr | 0-300+ | Large-scale spatial mapping of upward light emissions |
| All-sky camera | calibrated image | Variable | Full-hemisphere sky brightness mapping |

### Mitigation Strategies

The International Dark-Sky Association (IDA, now DarkSky International) has established best practices:

| Strategy | Skyglow Reduction | Cost Impact | Co-Benefits |
|---|---|---|---|
| Full cutoff / shielded fixtures | 30-50% reduction in upward light | Comparable cost; may reduce fixture count needed | Reduced glare, better visibility for drivers |
| Warm-spectrum LEDs (< 3000K CCT) | 20-40% reduction in ecological impact | Minimal premium over cool-white LEDs | Less insect attraction, less melatonin suppression |
| Dimming / adaptive controls | 30-60% energy savings during low-traffic hours | $50-200 per fixture for controls; rapid payback | Energy cost savings, reduced maintenance |
| Curfews (turning off ornamental/commercial lighting after midnight) | 20-40% reduction | Zero cost; saves energy | Energy savings, reduced wildlife disruption |
| Reduced over-lighting (right-sizing illumination levels) | 20-50% energy/light reduction | Reduces initial fixture cost | Lower energy bills, less glare |

A critical caution: the global transition to LED lighting, while energy-efficient, risks a 2-3x increase in skyglow on clear nights if LEDs are deployed without careful attention to shielding, spectrum, and dimming. Energy efficiency gains are often offset by increased illumination (the "rebound effect"), resulting in more total light despite lower per-lumen energy cost.

---

## Embodied Carbon and Lifecycle Assessment

### The Embodied Carbon Problem

Buildings are responsible for approximately 39% of global energy-related carbon emissions. This breaks down into two categories:

- **Operational carbon (~28% of global emissions):** Emissions from energy used to heat, cool, light, and operate buildings during their lifespan
- **Embodied carbon (~11% of global emissions):** Emissions from extracting raw materials, manufacturing building products, transporting them to site, construction, maintenance, and end-of-life demolition/disposal

As buildings become more energy-efficient (better insulation, heat pumps, renewable electricity), operational carbon is declining. This means embodied carbon's share is growing rapidly — projected to rise from ~25% to nearly **50% of whole-life building emissions by 2050**.

For a new, high-performance building today, embodied carbon can already represent **50-70%** of its total lifecycle emissions. Ignoring embodied carbon while optimizing only for operational efficiency misses a large and growing fraction of the problem.

### Lifecycle Assessment Stages

The EN 15978 standard defines lifecycle stages for whole-life carbon assessment:

| Stage | Code | Description | Examples |
|---|---|---|---|
| Product | A1-A3 | Raw material extraction, transport to factory, manufacturing | Mining iron ore, smelting steel, producing cement |
| Construction | A4-A5 | Transport to site, on-site construction, waste | Trucking, crane operation, formwork |
| Use | B1-B7 | Maintenance, repair, replacement, refurbishment, operational energy/water | Repainting, HVAC replacement, heating fuel |
| End of life | C1-C4 | Demolition, transport, waste processing, disposal | Demolition, landfill, incineration |
| Beyond lifecycle | D | Reuse, recovery, recycling potential (credits) | Recycled steel, reclaimed timber |

"Upfront carbon" (A1-A5) is the most critical for decision-making because it is emitted immediately and cannot be offset by future operational savings for decades. RICS and LETI benchmarks focus primarily on these stages.

### Embodied Carbon by Building Type

| Building Type | Typical Embodied Carbon (A1-A5) kgCO2e/m2 | LETI 2030 Target kgCO2e/m2 | Key Contributors |
|---|---|---|---|
| Single-family residential (wood frame) | 200-400 | 300 | Foundation (concrete), roofing, insulation |
| Multi-family residential (concrete frame) | 400-600 | 350 | Structure (concrete/steel), foundations |
| Office (steel frame + glass curtain wall) | 500-800 | 350 | Steel structure, facade, mechanical systems |
| Office (concrete frame) | 450-700 | 350 | Concrete structure, facade |
| Retail / commercial | 350-600 | 350 | Fitout intensity drives variation |
| Industrial / warehouse | 200-400 | — | Large spans, low fitout, but heavy foundations |
| Hospital / laboratory | 700-1,200 | — | Complex mechanical systems, specialized materials |
| High-rise residential (concrete) | 500-800 | 400 | Structure dominates; foundation piles |

The RIBA 2030 Climate Challenge specifies 850 kgCO2e/m2 as a "business as usual" upfront carbon benchmark, with aspirational targets of 300-500 kgCO2e/m2 depending on building type. The 25th percentile across all building types falls around 500 kgCO2e/m2.

### Embodied Carbon of Structural Materials

The structural system is typically 40-60% of a building's total embodied carbon. Material choice is therefore the single largest lever:

| Material | Embodied Carbon (kgCO2e/kg) | Density (kg/m3) | Carbon Intensity per m3 | Key Notes |
|---|---|---|---|---|
| Concrete (typical mix) | 0.10-0.15 | 2,400 | 240-360 kgCO2e/m3 | Cement is 5-8% of global CO2 emissions |
| Structural steel | 1.2-2.5 | 7,850 | 9,400-19,600 kgCO2e/m3 | High per-kg but used in smaller quantities; recyclable |
| Reinforcing steel (rebar) | 0.7-1.5 | 7,850 | — | Often blended into concrete quantities |
| Cross-laminated timber (CLT) | -0.7 to 0.5 (net) | 500 | -350 to 250 kgCO2e/m3 | Sequesters carbon; can be net-negative if sustainably sourced |
| Glulam (glue-laminated timber) | -0.5 to 0.4 | 500 | -250 to 200 kgCO2e/m3 | Similar to CLT; good for beams and columns |
| Aluminum | 8-13 | 2,700 | 21,600-35,100 kgCO2e/m3 | Extremely high; recycled aluminum is ~95% lower |
| Brick (fired clay) | 0.2-0.5 | 1,800 | 360-900 kgCO2e/m3 | Kiln firing is energy-intensive |
| Glass | 0.7-1.5 | 2,500 | 1,750-3,750 kgCO2e/m3 | Curtain wall systems have high embodied carbon |

Key comparisons:
- Substituting reinforced concrete with mass timber can avoid ~43% of embodied structural carbon on average
- CLT emits up to 75% less CO2 than reinforced concrete for equivalent structural performance
- Mass timber: 198 kgCO2e/m2; steel equivalent: 243 kgCO2e/m2 (direct comparison study)
- Recycled steel has 50-70% lower embodied carbon than virgin steel; recycled aluminum is ~95% lower

### Carbon Payback Period

"Carbon payback" measures how long operational carbon savings from an energy-efficient material or system take to offset the upfront embodied carbon cost:

| Measure | Additional Embodied Carbon | Annual Operational Savings | Payback Period |
|---|---|---|---|
| Extra insulation (doubling R-value) | 5-15 kgCO2e/m2 | 2-8 kgCO2e/m2/yr | 1-5 years |
| Triple glazing (vs. double) | 10-30 kgCO2e/m2 | 1-5 kgCO2e/m2/yr | 3-15 years |
| Ground source heat pump | 500-2,000 kgCO2e per system | 200-1,000 kgCO2e/yr | 2-5 years |
| PV solar panels | 50-100 kgCO2e/m2 panel | 30-80 kgCO2e/m2/yr offset | 1-3 years |

### Implications for Urban Planning

At the city scale, embodied carbon is driven by:
- **Building stock turnover rate** — demolishing and rebuilding emits more embodied carbon than renovation
- **Building height** — high-rises use 30-50% more structural material per m2 of floor area than mid-rise
- **Infrastructure** — roads, bridges, water/sewer systems have significant embodied carbon (concrete and steel)
- **Material supply chains** — local materials reduce transport emissions (A4 stage)

A city that grows primarily through mid-rise timber construction will have dramatically lower embodied carbon than one built with high-rise concrete and steel — even if both achieve the same operational energy efficiency.

---

## Urban Food Systems

### Food Access and Food Deserts

A **food desert** is defined by the USDA as a low-income census tract where a substantial number or share of residents have limited access to affordable, nutritious food. Specifically:
- **Urban:** low-income tract where 500+ people or 33%+ of the population live more than **1 mile** from a supermarket or large grocery store
- **Rural:** low-income tract where a significant number live more than **10 miles** from a supermarket

Scale of the problem:
- **18.8 million Americans** (6.1% of population) live in food deserts by the strictest definition
- Under broader definitions: **39.5 million people** (12.9% of US population) live in low-income, low-food-access areas
- **96%** of food desert residents live in urban areas (51.7 million by broadest count)
- Food deserts disproportionately affect Black communities and other communities of color
- Residents in food deserts have higher rates of diet-related illness: obesity, diabetes, cardiovascular disease

Food deserts are not merely about distance — they reflect intersecting deprivations of income, transportation access, and retail investment. A neighborhood may technically have a grocery store within 1 mile but if residents lack vehicles and public transit is poor, effective access is far worse than distance suggests.

### Food Miles and Supply Chain Emissions

The average food item in the US travels approximately **1,500 miles** from farm to plate. However, the relationship between food miles and emissions is more nuanced than distance alone suggests:

| Supply Chain Stage | Share of Food System GHG Emissions | Key Drivers |
|---|---|---|
| Agricultural production | 60-70% | Fertilizer (N2O), livestock methane, land use change |
| Processing and packaging | 10-15% | Energy for processing, packaging materials |
| Transportation | 10-15% | Distance, mode (truck vs. rail vs. ship vs. air) |
| Retail and storage | 5-10% | Refrigeration, building operations |
| Consumer (storage, cooking, waste) | 5-10% | Home refrigeration, cooking energy, food waste |

Transport mode matters more than distance: air freight produces 50x more CO2 per ton-km than ocean shipping. A tomato shipped by sea from a warm climate may have lower total emissions than one grown in a heated greenhouse locally. Life-cycle analysis is essential — "local" does not automatically mean "low carbon."

That said, local food systems offer benefits beyond carbon:
- **Freshness and nutrition** — produce loses nutrients during transport and storage; local food arrives faster
- **Economic multiplier** — money spent at local farms and farmers markets recirculates in the local economy at 2-3x the rate of money spent at national chains
- **Food security** — shorter supply chains are more resilient to disruption (pandemics, natural disasters, fuel price spikes)
- **Community connection** — farmers markets and CSAs build social capital and food literacy

### Urban Agriculture

Urban agriculture encompasses all forms of food production within cities: community gardens, rooftop farms, vertical farms, backyard gardens, school gardens, and commercial urban farms.

**Production capacity:**
- The USDA estimates urban agriculture already produces **15-20% of the world's food supply** (globally, including developing-world subsistence farming)
- Yields on urban plots typically range from **0.5-2 kg/m2** per growing season for community gardens
- Intensive urban farms and rooftop operations can achieve **3-6 kg/m2**
- Vertical farming can produce **10-20x the yield per acre** of open-field agriculture for certain crops (leafy greens, herbs, microgreens)
- In Seattle, community gardening families offset **30-40% of their fresh produce needs**

| Urban Agriculture Type | Yield (kg/m2/year) | Startup Cost | Key Constraints |
|---|---|---|---|
| Community garden (open soil) | 0.5-3 | Low ($2-10/m2) | Soil contamination testing needed; seasonal |
| Raised bed garden | 1-5 | Moderate ($20-50/m2) | Imported soil; limited scale |
| Rooftop farm (intensive) | 2-6 | High ($50-200/m2) | Structural load capacity; wind exposure |
| Greenhouse (urban) | 5-15 | High ($100-300/m2) | Heating costs in cold climates; land competition |
| Vertical farm (controlled environment) | 50-200+ (lettuce equivalent) | Very high ($500-2,000/m2) | Energy-intensive; limited to leafy greens and herbs economically |
| Aquaponics / hydroponics | 10-50 | High ($200-500/m2) | Technical complexity; energy costs |

**Limitations of urban agriculture:**
- Cannot meaningfully replace conventional agriculture for staple crops (grains, legumes, oilseeds) — caloric density per acre is far higher on conventional farmland
- Soil contamination risk on former industrial or heavily trafficked land (see Soil Contamination section)
- Competition for land with housing — in high-cost cities, the opportunity cost of using land for farming rather than housing can be very high
- Seasonal limitations in temperate climates without greenhouses
- Water access and stormwater contamination concerns

### Community Gardens

Community gardens serve multiple functions beyond food production:

| Benefit Category | Evidence |
|---|---|
| Food security | Participating households offset 30-40% of fresh produce needs; reduces grocery spending in low-income areas |
| Mental health | Gardening associated with reduced stress, anxiety, and depression; social interaction combats isolation |
| Physical activity | Regular moderate exercise from gardening; associated with lower BMI |
| Social capital | Gardens build cross-cultural relationships, neighborhood trust, and civic engagement |
| Education | School and youth gardens improve nutritional knowledge and willingness to eat vegetables |
| Property values | Community gardens increase nearby residential property values by 3-9% |
| Environmental | Reduce stormwater runoff, support pollinators, improve soil health, reduce urban heat island |

The USDA invested $14.4 million in urban agriculture grants in recent years, recognizing these multi-dimensional benefits. Detroit's urban farming movement — born from post-industrial vacancy — has become a national model, with organizations like Planted Detroit converting vacant lots into productive farms that provide both food and community revitalization.

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
| Biodiversity score | `B = species_base * habitat_connectivity * green_diversity` | Per-zone or city-wide |
| Brownfield contamination | `contamination[i] = CONTAM_LEVEL; decays via cleanup spending` | Per-tile, persists until remediated |
| Light pollution | `L(d) = LIGHT_AMOUNT * max(0, 1 - d/LIGHT_RADIUS)` | Similar kernel to air pollution |
| Embodied carbon | `EC = building_EC_per_m2 * floor_area` | Tracked cumulatively at city level |
| Food access score | `F = 1 - (residents_beyond_1mi_from_grocery / total_residents)` | City-wide metric |

### Proposed: Biodiversity Layer (Future)

Add a `biodiversityScore` per zone or per large tile cluster. Biodiversity is driven by:

- **Green space connectivity:** adjacent or linked park tiles form corridors; isolated parks provide less biodiversity than connected networks. Compute connectivity as the number of park tiles reachable from each park without crossing non-green tiles, or use a simpler metric of adjacent-park-tile count.
- **Green space diversity:** parks, wetlands, community gardens, and street trees each contribute different habitat value. A zone with multiple green infrastructure types scores higher than one with only mowed parks.
- **Pollution penalty:** high pollution zones have reduced biodiversity regardless of green space.
- **Proximity to water features:** tiles near rivers, ponds, or constructed wetlands receive a biodiversity bonus.

Biodiversity score feeds into:
- Citizen happiness (people prefer biodiverse neighborhoods)
- Pollination bonus for any future urban agriculture mechanic
- Tourism/recreation attractiveness
- A city-wide environmental rating

```
biodiversity[zone] = BASE_SCORE
  + CONNECTIVITY_BONUS * connected_green_tiles / max_possible
  + DIVERSITY_BONUS * unique_green_types / TOTAL_GREEN_TYPES
  - POLLUTION_PENALTY * mean_pollution_in_zone / 255
  + WATER_BONUS * (has_water_feature ? 1 : 0)
```

### Proposed: Brownfield / Soil Contamination Mechanic

When industrial buildings or power plants are demolished (bulldozed), the underlying tile retains a `contamination` value proportional to the building's pollution amount and how long it operated. Contaminated tiles:

- Cannot be rezoned to residential without remediation
- Reduce desirability of surrounding tiles (smaller radius than active pollution, but persistent)
- Require spending to remediate: cost proportional to contamination level

```
On demolish(building):
  contamination[tile] = building.pollutionAmount * years_operated * CONTAM_FACTOR
  // Clamp to [0, 255]

On remediate(tile, spending):
  contamination[tile] -= spending / COST_PER_CONTAM_POINT
  // Clamp to [0, 255]
```

This creates a real cost to deindustrialization — players cannot simply bulldoze a factory and immediately build apartments. The Superfund-inspired mechanic introduces the concept of environmental liability and rewards long-term planning (choosing cleaner industry from the start avoids future cleanup costs).

**Brownfield redevelopment bonus:** successfully remediating and redeveloping a contaminated site could grant a temporary desirability bonus (reflecting real-world property value increases of 5-15% near remediated brownfields) and a small economic multiplier on the new development.

### Proposed: Light Pollution Layer (Future)

Add a `lightLevel: Uint8Array` layer. Commercial zones, roads, and industrial facilities emit light using a distance-decay kernel similar to noise:

```
light(d) = LIGHT_AMOUNT * max(0, 1 - d / LIGHT_RADIUS)
```

Light pollution affects:
- Residential desirability at night (penalty for high light levels adjacent to residential — distinct from the existing noise penalty)
- Biodiversity score (light pollution reduces wildlife habitat value of nearby green spaces)
- Energy waste metric (contributes to the sustainability score negatively)

Mitigation options:
- **Shielded lighting upgrade** (applied per-building or per-zone): reduces light pollution radius by 50% at moderate cost
- **Lighting curfew ordinance** (city-wide policy): reduces commercial light output after midnight, trading slight commercial desirability penalty for residential and biodiversity benefits
- **Warm-spectrum LED mandate**: reduces ecological impact without reducing illumination — smaller penalty to biodiversity

### Proposed: Embodied Carbon Tracking

Track cumulative embodied carbon as a city-wide metric. Each building placed adds its embodied carbon (based on building type and size) to a running total. Demolition adds demolition-phase carbon. This creates visibility into the environmental cost of building and rebuilding.

```
On place(building):
  city.embodiedCarbon += EMBODIED_EC[building.type] * building.footprint

On demolish(building):
  city.embodiedCarbon += DEMOLITION_EC[building.type] * building.footprint
```

Approximate values for game balance (simplified from research data):

| Building Type | Embodied Carbon (game units per tile) | Notes |
|---|---|---|
| Residential (low) | 3 | Wood frame, low-rise |
| Residential (med) | 6 | Concrete frame, mid-rise |
| Residential (high) | 10 | Concrete/steel high-rise |
| Commercial (low) | 4 | Light construction |
| Commercial (high) | 12 | Steel + glass curtain wall |
| Industrial (low) | 3 | Light warehouse |
| Industrial (high) | 8 | Heavy industrial |
| Park | 0 | Minimal construction |
| Road | 2 | Concrete/asphalt |

Display embodied carbon alongside operational carbon (from power generation) in the sustainability dashboard. This rewards players who build for the long term and renovate rather than demolish-and-rebuild, matching the real-world principle that the greenest building is the one already standing.

### Proposed: Food Access Score (Future)

Track food access as a city health metric. Define grocery stores / markets as a building type (or a commercial sub-type). Compute the fraction of residential tiles within a walkable distance (e.g., 8-12 tiles, representing ~1 mile) of a food source:

```
food_access = residential_tiles_near_grocery / total_residential_tiles
```

Low food access triggers:
- Health penalty for affected citizens (higher disease rates, lower happiness)
- Environmental justice flag if low food access correlates with low-income zones

Community gardens (a new building type, or a park variant) could partially offset food access deficits in their radius, providing a smaller but meaningful food access bonus while also contributing to biodiversity, desirability, and social cohesion.

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

### Biodiversity and Ecosystem Services
- [Urban Areas as Hotspots for Bees and Pollination — Nature Communications (2020)](https://www.nature.com/articles/s41467-020-14496-6)
- [Promoting Urban Biodiversity for People and Nature — Nature Reviews Biodiversity (2025)](https://www.nature.com/articles/s44358-025-00035-y)
- [Plant-Pollinator Interactions in Urban Ecosystems — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7982380/)
- [Urban Wildlife Corridors: Building Bridges for Wildlife and People — Frontiers](https://www.frontiersin.org/journals/sustainable-cities/articles/10.3389/frsc.2022.954089/full)
- [Changes in the Global Value of Ecosystem Services — Costanza et al. (2014)](https://www.robertcostanza.com/wp-content/uploads/2017/02/2014_J_Costanza_GlobalValueUpdate.pdf)
- [The Economics of Ecosystems and Biodiversity (TEEB)](https://teebweb.org/)
- [Urban Green Infrastructure: Bridging Biodiversity and Sustainable Development — Frontiers](https://www.frontiersin.org/journals/ecology-and-evolution/articles/10.3389/fevo.2024.1440477/full)
- [A "Plan Bee" for Cities: Pollinator Diversity in Urban Green Spaces — PLOS One](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0235492)

### Soil Contamination and Brownfields
- [CERCLA Summary — Cornell Law Institute](https://www.law.cornell.edu/wex/comprehensive_environmental_response_compensation_and_liability_act_(cercla))
- [About the Superfund Cleanup Process — US EPA](https://www.epa.gov/superfund/about-superfund-cleanup-process)
- [Supporting Brownfields Redevelopment Using Tax Incentives — US EPA](https://www.epa.gov/brownfields/supporting-brownfields-redevelopment-using-tax-incentives-and-credits)
- [The Value of Brownfield Remediation — NBER](https://www.nber.org/digest/jan15/value-brownfield-remediation)
- [Brownfield Remediation — Green Building Alliance](https://www.gba.org/resources/green-building-methods/processes/brownfield-remediation/)
- [Superfund Site Cleanup Times — GAO](https://www.gao.gov/assets/t-rced-98-74.pdf)
- [Federal Environmental Remediation Under CERCLA — Congressional Research Service](https://www.congress.gov/crs-product/R48630)
- [Global Assessment of Soil Pollution — FAO](https://openknowledge.fao.org/server/api/core/bitstreams/8fa95d84-bb05-4c77-b02e-425f70ba6834/content)
- [Heavy Metals in Contaminated Soils: A Review — Wuana & Okieimen (2011)](https://onlinelibrary.wiley.com/doi/10.5402/2011/402647)

### Light Pollution
- [Missing the Dark: Health Effects of Light Pollution — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC2627884/)
- [80% of World Population Lives Under Skyglow — DarkSky International](https://darksky.org/news/80-of-world-population-lives-under-skyglow-new-study-finds/)
- [Light Pollution — Wikipedia](https://en.wikipedia.org/wiki/Light_pollution)
- [Bortle Dark-Sky Scale — Wikipedia](https://en.wikipedia.org/wiki/Bortle_scale)
- [Light Pollution, Circadian Photoreception, and Melatonin in Vertebrates — MDPI](https://www.mdpi.com/2071-1050/11/22/6400)
- [Broad-Spectrum Light Pollution Suppresses Melatonin and Increases WNV Mortality in House Sparrows — Ornithological Applications](https://academic.oup.com/condor/article/122/3/duaa018/5822083)
- [Artificial Light at Night Alters Behavior in Laboratory and Wild Animals — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6205897/)
- [Light Pollution — Night Skies, US National Park Service](https://www.nps.gov/subjects/nightskies/lightpollution.htm)
- [About Lighting Pollution — Florida Fish and Wildlife Conservation Commission](https://myfwc.com/conservation/you-conserve/lighting/pollution/)
- [Light Pollution Map](https://www.lightpollutionmap.info/)

### Embodied Carbon and Lifecycle Assessment
- [Embodied Carbon — World Green Building Council](https://worldgbc.org/climate-action/embodied-carbon/)
- [Embodied Carbon 101 — Carbon Leadership Forum](https://carbonleadershipforum.org/embodied-carbon-101-v2/)
- [Embodied Carbon vs. Operational Carbon — One Click LCA](https://oneclicklca.com/en/resources/articles/embodied-carbon-vs-operational-carbon)
- [Embodied Carbon — New Buildings Institute](https://newbuildings.org/code_policy/embodied-carbon/)
- [RICS Whole Life Carbon Assessment Standard](https://www.rics.org/profession-standards/rics-standards-and-guidance/sector-standards/construction-standards/whole-life-carbon-assessment)
- [Embodied Carbon Benchmarks for European Buildings — One Click LCA](https://143253260.fs1.hubspotusercontent-eu1.net/hubfs/143253260/Ebooks/Embodied-Carbon-Benchmarks-for-European-Buildings-10-June-2021-FINAL.pdf)
- [Comparison of Embodied Carbon: Mass Timber vs. Steel — MDPI Buildings](https://www.mdpi.com/2075-5309/14/5/1276)
- [CLT vs. Concrete Climate Impact — MIT Climate Portal](https://climate.mit.edu/ask-mit/how-does-climate-impact-cross-laminated-timber-compare-steel-or-concrete)
- [How to Calculate Embodied Carbon for RIBA 2030 — RIBAJ](https://www.ribaj.com/intelligence/how-to-calculate-embodied-carbon-for-riba-2030-climate-challenge/)
- [A Brief Guide to Calculating Embodied Carbon — IStructE](https://www.istructe.org/IStructE/media/Public/TSE-Archive/2020/A-brief-guide-to-calculating-embodied-carbon.pdf)

### Urban Food Systems
- [Mapping Food Deserts in the United States — USDA ERS](https://www.ers.usda.gov/amber-waves/2011/december/data-feature-mapping-food-deserts-in-the-u-s)
- [Food Access Research Atlas — USDA ERS](https://www.ers.usda.gov/data-products/food-access-research-atlas)
- [Characteristics and Influential Factors of Food Deserts — USDA ERS](https://ers.usda.gov/sites/default/files/_laserfiche/publications/45014/30940_err140.pdf)
- [Food Production and Crop Yields of Urban Agriculture: A Meta-Analysis — Earth's Future (Payen, 2022)](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2022EF002748)
- [Small-Scale Urban Agriculture Results in High Yields — PNAS](https://www.pnas.org/doi/10.1073/pnas.1809707115)
- [Food Production and Resource Use of Urban Farms: A Five-Country Study — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC9891751/)
- [How Urban Farms Are Reducing Food Deserts — Sustainable Living Association](https://sustainablelivingassociation.org/how-urban-farms-are-reducing-food-deserts/)
- [The Intersection of Planning, Urban Agriculture, and Food Justice — JAPA](https://www.tandfonline.com/doi/full/10.1080/01944363.2017.1322914)
- [Urban Agriculture in the United States: Baseline Findings — ATTRA](https://attra.ncat.org/publication/urban-agriculture-in-the-united-states-baseline-findings-of-a-nationwide-survey/)
