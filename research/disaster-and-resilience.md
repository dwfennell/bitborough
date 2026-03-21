# Disaster and Urban Resilience

> How cities face, survive, and recover from natural disasters — risk models, damage mechanics, and resilience strategies for simulation.

## Table of Contents

- [Disaster Typology](#disaster-typology)
- [Vulnerability Assessment](#vulnerability-assessment)
- [Damage Models](#damage-models)
- [Fire as Disaster](#fire-as-disaster)
- [Flooding Mechanics](#flooding-mechanics)
- [Recovery Trajectories](#recovery-trajectories)
- [Economic Impact](#economic-impact)
- [Resilience Strategies](#resilience-strategies)
- [Insurance and Risk Transfer](#insurance-and-risk-transfer)
- [Climate Change and Escalating Risk](#climate-change-and-escalating-risk)
- [Case Studies](#case-studies)
- [Application to Bitborough](#application-to-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

---

## Disaster Typology

Natural disasters vary on three axes: frequency (how often), magnitude (how severe), and spatial pattern (localized point vs. broad area). Each hazard type has a distinct risk profile that shapes how cities must prepare and respond.

### Earthquake

Earthquakes are measured by moment magnitude (Mw) for energy released and by Modified Mercalli Intensity (MMI) for observed effects at the surface. MMI is the more useful scale for damage modeling because it captures ground shaking as experienced by structures, not raw seismic energy.

| MMI | Description | Peak Ground Acceleration (g) | Structural Effect |
|-----|-------------|------------------------------|-------------------|
| I-IV | Not felt to light | < 0.039 | No damage |
| V | Moderate | 0.039-0.092 | Minor cracking in weak structures |
| VI | Strong | 0.092-0.18 | Light damage to ordinary buildings |
| VII | Very Strong | 0.18-0.34 | Moderate damage, unreinforced masonry cracks |
| VIII | Severe | 0.34-0.65 | Heavy damage to weak structures, moderate to engineered |
| IX | Violent | 0.65-1.24 | Heavy damage to most structures |
| X+ | Extreme | > 1.24 | Widespread destruction |

Spatial pattern: radiates from an epicenter with intensity decaying roughly logarithmically with distance. Site amplification on soft soils or fill can increase local shaking 2-3x above bedrock levels (as demonstrated in San Francisco's Marina District in 1989). Return periods for major events (M7+) in active seismic zones range from 50-500 years.

### Hurricane

The Saffir-Simpson Hurricane Wind Scale classifies hurricanes by sustained wind speed:

| Category | Wind Speed (mph) | Damage Character |
|----------|-----------------|------------------|
| 1 | 74-95 | Minimal: roof damage, broken branches |
| 2 | 96-110 | Moderate: major roof/siding damage, shallow flooding |
| 3 (Major) | 111-130 | Extensive: structural damage to small buildings, inland flooding |
| 4 | 131-155 | Catastrophic: severe structural damage, area uninhabitable weeks-months |
| 5 | > 155 | Catastrophic: high percentage of framed homes destroyed |

Hurricanes deliver three distinct hazards: wind, storm surge, and rainfall flooding. Storm surge causes the most fatalities and economic damage in coastal areas. Spatial pattern: affects a wide swath (hundreds of miles), with highest intensity in the eyewall. In an average 3-year period, roughly 5 hurricanes strike the U.S. coastline, of which 2 are typically major (NOAA).

### Flood

Floods are classified by return period --- the statistical recurrence interval. A "100-year flood" has a 1% annual probability, not a guarantee of once per century. A property in the 100-year floodplain has a 26% chance of flooding at least once during a 30-year mortgage.

| Return Period | Annual Probability | Common Usage |
|---------------|-------------------|--------------|
| 10-year | 10% | Minor nuisance flooding |
| 50-year | 2% | Moderate property damage |
| 100-year | 1% | FEMA Special Flood Hazard Area (SFHA) |
| 500-year | 0.2% | "Shaded X zone" on FEMA maps |

Spatial pattern: follows drainage basins and topography. Low-lying areas adjacent to rivers and coasts are most vulnerable. Flooding kills more people annually in the U.S. than any other single weather hazard (NOAA). From 1980-2024, NOAA recorded 45 billion-dollar flood events.

### Wildfire

Wildfire risk concentrates at the wildland-urban interface (WUI) --- the zone where development meets undeveloped wildland vegetation. Key variables: fuel load (vegetation type and density), moisture content, wind speed, and topography (fire moves faster uphill). Wildfire events in the U.S. have increased in frequency and severity, with 23 billion-dollar wildfire events from 1980-2024 (NOAA NCEI).

### Tornado

The Enhanced Fujita (EF) Scale rates tornadoes by damage indicators:

| Rating | Wind Speed (mph) | Damage |
|--------|-----------------|--------|
| EF0 | 65-85 | Light: broken branches, minor roof damage |
| EF1 | 86-110 | Moderate: roofs stripped, mobile homes overturned |
| EF2 | 111-135 | Significant: roofs torn off well-built homes, large trees snapped |
| EF3 | 136-165 | Severe: entire stories destroyed, trains overturned |
| EF4 | 166-200 | Devastating: well-built homes leveled |
| EF5 | > 200 | Incredible: strong-frame homes swept away |

Roughly 1,000 tornadoes are reported annually in the U.S. Spatial pattern: narrow damage path (typically 50-500 meters wide, up to several miles long). Unlike hurricanes, tornadoes are highly localized --- devastating for the structures in the path but leaving adjacent areas untouched.

### Drought

The Palmer Drought Severity Index (PDSI) is the standard U.S. measure:

| PDSI Value | Classification |
|------------|---------------|
| -1.0 to -1.9 | Mild drought |
| -2.0 to -2.9 | Moderate drought |
| -3.0 to -3.9 | Severe drought |
| -4.0 or below | Extreme drought |

Drought is a slow-onset disaster. It does not destroy structures but degrades water supply, stresses vegetation (increasing wildfire risk), and harms agriculture. Urban impacts include water rationing, increased utility costs, subsidence from groundwater withdrawal, and cascading fire risk as vegetation dries. From 1980-2024, NOAA recorded 32 billion-dollar drought events.

---

## Vulnerability Assessment

Vulnerability is not just about hazard exposure --- it depends on what is exposed and how susceptible it is. Three dimensions matter: physical, social, and systemic.

### Building Vulnerability

Construction type is the single strongest predictor of earthquake and wind damage. HAZUS classifies 16 model building types, but the critical distinction for game purposes is the gradient from weakest to strongest:

| Building Type | Earthquake Vulnerability | Wind Vulnerability | Fire Vulnerability |
|---------------|-------------------------|--------------------|--------------------|
| Unreinforced masonry (URM) | Extremely high --- cannot absorb tensile forces, facades collapse | Moderate | Low (noncombustible walls) |
| Wood frame | Low-moderate (flexible) | High (light construction) | Very high (combustible) |
| Steel frame | Low (ductile) | Low-moderate | Low (but loses strength at high temp) |
| Reinforced concrete | Low (if properly designed) | Low | Low |
| Manufactured/mobile homes | High | Extremely high | High |

Unreinforced masonry has the worst earthquake record because masonry cannot flex or absorb seismic forces --- instead of bending, walls, facades, and structural elements simply break or crumble (USGS). The Klamath Falls earthquakes of 1993 demonstrated this: downtown's URM buildings suffered extensive facade collapses while modern structures nearby survived largely intact.

Building age strongly correlates with vulnerability because older buildings predate modern seismic, wind, and fire codes. The International Building Code (IBC) assigns Seismic Design Categories (SDC) from A (lowest hazard) through F (near major active faults), with progressively stringent structural requirements at each level.

### Population Vulnerability

Social vulnerability amplifies physical risk. Low-income populations face compounding disadvantages:
- Higher likelihood of living in substandard or older housing
- Lower insurance coverage rates
- Fewer savings for evacuation and temporary housing
- Less access to information and transportation for evacuation
- Slower recovery due to fewer resources and weaker political advocacy

Research on Hurricane Katrina found stark differential recovery: by mid-2007, New Orleans had recovered only 63% of its pre-storm population, but return rates varied dramatically by neighborhood income and race (U.S. Census Bureau).

### Infrastructure Criticality

Not all infrastructure failures are equal. Some systems are force multipliers for disaster damage:

| Infrastructure | Failure Consequence | Cascade Effect |
|---------------|-------------------|----------------|
| Electrical grid | Loss of power to all dependent systems | Water pumps fail, communications down, hospitals stressed |
| Water supply | No firefighting capacity, no potable water | Fire suppression impossible, public health emergency |
| Transportation network | Evacuation blocked, emergency access denied | Delayed response, trapped populations |
| Communications | 911 system down, no coordination | Response paralysis |
| Natural gas | Leaks and explosions post-earthquake | Secondary fires (1906 and 1989 San Francisco) |

---

## Damage Models

### FEMA HAZUS Methodology

HAZUS (Hazards U.S.) is FEMA's standardized loss estimation methodology. It models earthquakes, floods, hurricanes, and tsunamis using a consistent framework. The earthquake module --- the most mature --- provides the clearest template for game mechanics.

#### Damage States

HAZUS defines four damage states for structures, each with associated repair cost ratios:

| Damage State | Description | Typical Repair Cost (% of replacement) |
|-------------|-------------|----------------------------------------|
| Slight | Minor cracking, cosmetic damage | 2-5% |
| Moderate | Structural cracking, permanent drift | 10-25% |
| Extensive | Major structural damage, partial collapse possible | 30-60% |
| Complete | Irreparable damage or collapse | 80-100% |

#### Fragility Curves

The probability of reaching or exceeding each damage state is modeled as a lognormal cumulative distribution function of ground shaking intensity (spectral displacement or spectral acceleration):

```
P(Damage >= DS | S) = Phi[ ln(S / S_median) / beta ]
```

Where:
- `S` = spectral response (demand on the building)
- `S_median` = median spectral value at which the damage state is reached
- `beta` = lognormal standard deviation (captures uncertainty)
- `Phi` = standard normal CDF

Each building type and seismic design level has distinct median and beta values. For example, a low-rise URM building reaches "Extensive" damage at much lower shaking intensity than a seismically-designed steel frame building.

#### Loss Computation

Total building loss combines structural, nonstructural, and contents damage:

```
Loss = Sum over DS [ P(DS) * CostRatio(DS) * ReplacementValue ]
```

For a city-scale estimate, HAZUS aggregates losses across all building inventory in affected census tracts.

### Flood Damage Functions

HAZUS flood damage is modeled with depth-damage curves that relate water depth above first-floor elevation to percent damage:

| Flood Depth (ft above first floor) | Residential Damage (%) | Commercial Damage (%) |
|-------------------------------------|----------------------|---------------------|
| 0 (at floor level) | 5-10 | 5-8 |
| 1 | 15-20 | 10-15 |
| 2 | 20-30 | 15-25 |
| 4 | 35-50 | 30-40 |
| 8 | 50-65 | 45-55 |
| 12+ | 65-80 | 55-70 |

Damage increases sharply in the first few feet (electrical, HVAC, finishes) then flattens as water reaches upper floors. First-floor elevation relative to flood level is the single most important protective factor --- elevating a structure 2 feet above the base flood elevation can reduce expected annual flood losses by 50-70%.

### Wind Damage Functions

Hurricane wind damage follows an S-curve: minimal below threshold speed, steep increase through the damage range, then asymptotic approach to total destruction. HAZUS models this per building type and component (roof cover, roof deck, walls, openings).

---

## Fire as Disaster

Fire is already modeled in Bitborough's simulation (probabilistic ignition, spread mechanics, fire station coverage). This section provides the real-world underpinning for conflagration --- fires that overwhelm normal suppression and become city-scale disasters.

### Urban Conflagration

An urban conflagration is a large, destructive fire that spreads beyond natural or artificial barriers, moving past individual blocks to destroy whole sections of a city (IBHS). Conflagrations dominated urban risk in the 18th and 19th centuries and have returned as a WUI threat in the 21st century.

### Spread Mechanics

Fire spreads between structures through three mechanisms:
1. **Radiation** --- heat transfer across gaps; intensity falls with the inverse square of distance
2. **Convection** --- hot gas and ember transport, strongly amplified by wind
3. **Direct flame impingement** --- structure-to-structure contact via collapse or bridging materials

The critical variables for conflagration risk:

| Factor | Effect on Spread |
|--------|-----------------|
| Building separation < 3m | Radiation alone can ignite adjacent structures |
| Building separation 3-6m | Spread requires wind-driven convection |
| Building separation > 10m | Effective firebreak under most conditions |
| Wood exterior cladding | Easily ignitable, sustains spread |
| Masonry/concrete exterior | Resistant to ignition by radiation |
| Wind speed > 30 mph | Ember transport over hundreds of meters |

### Density and Materials

Historical conflagrations teach a consistent lesson: density plus combustible materials equals catastrophic fire risk. The Great Fire of London (1666), the Great Chicago Fire (1871), the San Francisco fire (1906), and the Tokyo fire (1923) all occurred in dense environments with predominantly wooden construction. Modern building codes requiring noncombustible exterior materials and adequate separation distances emerged directly from these disasters.

The progression of urban fire safety:
1. Post-disaster building codes mandating masonry/stone (London 1667, Chicago 1871)
2. Professional fire departments with steam pumpers (late 1800s)
3. High-pressure auxiliary water systems (San Francisco 1913)
4. Modern fire codes: sprinklers, fire-rated assemblies, maximum building areas by type
5. WUI codes: ember-resistant vents, noncombustible roofing, defensible space

### Conflagration Conditions

Conflagration occurs when ignition rate exceeds suppression capacity. Even highly capable fire departments are quickly overwhelmed when multiple simultaneous fires ignite (as in post-earthquake fires) or when wind drives fire faster than crews can establish defensive positions. The ratio of active fires to available engine companies is the key operational metric --- when it exceeds roughly 3:1, uncontrolled spread is likely.

---

## Flooding Mechanics

### Floodplain Mapping

FEMA maps floodplains by delineating Special Flood Hazard Areas (SFHAs) --- zones with a 1% or greater annual chance of flooding (the "100-year floodplain"). The mapping process involves:
1. Hydrological analysis: watershed delineation, rainfall-runoff modeling
2. Hydraulic analysis: channel capacity, overbank flow depth and extent
3. Topographic overlay: high-resolution elevation data (LiDAR)

Flood zones on a FEMA Flood Insurance Rate Map (FIRM):

| Zone | Description | Insurance Requirement |
|------|-------------|----------------------|
| A, AE | 100-year floodplain (1% annual chance) | Mandatory for federally-backed mortgages |
| AH | Shallow flooding (1-3 ft) in 100-year event | Mandatory |
| VE | Coastal high-hazard (wave action) | Mandatory, stricter building standards |
| X (shaded) | 500-year floodplain (0.2% annual chance) | Optional but recommended |
| X (unshaded) | Outside mapped flood hazard | Optional |

### Impervious Surface and Runoff

Urbanization dramatically increases flood risk by replacing permeable ground with impervious surfaces (roofs, pavement, parking lots). This increases both the volume and speed of stormwater runoff:

| Land Cover | Impervious Surface (%) | Rainwater Becoming Runoff (%) |
|------------|----------------------|------------------------------|
| Natural ground / forest | 0 | 15 |
| Rural / light development | 10-20 | 23 |
| Suburban single-family | 35-50 | 35 |
| Dense urban / commercial | 75-100 | 61 |

The Rational Method provides a simple runoff estimate:

```
Q = C * i * A
```

Where:
- `Q` = peak runoff flow (cubic feet per second)
- `C` = runoff coefficient (0.15 for forest, 0.60 for dense urban, 0.95 for impervious)
- `i` = rainfall intensity (inches/hour for the design storm)
- `A` = drainage area (acres)

As cities develop, `C` increases, and `Q` rises proportionally --- a fully urbanized watershed may produce 4x the peak runoff of its natural state.

### Flood Control Infrastructure

| Infrastructure | Function | Limitation |
|---------------|----------|------------|
| Levees | Contain floodwater within channel | Catastrophic failure when overtopped; false sense of security encourages development |
| Flood walls | Engineered barriers, often concrete | Expensive, requires ongoing maintenance |
| Detention basins | Store peak runoff, release slowly | Requires land area, limited capacity |
| Green infrastructure | Bioswales, permeable pavement, rain gardens | Effective for small storms, limited for major events |
| Channel improvements | Widen/deepen channels for capacity | Can transfer flood risk downstream |

Levees deserve special attention because of the "levee effect": their presence encourages development in the protected floodplain, so when they eventually fail (and they do), losses are far worse than if the land had remained undeveloped. New Orleans in 2005 is the canonical example.

---

## Recovery Trajectories

### The Kates-Pijawka Recovery Model

In 1977, Haas, Kates, and Bowden constructed a four-phase model of post-disaster recovery that remains the standard framework. Each phase has distinct characteristics and timescales:

| Phase | Duration | Activities | Key Metric |
|-------|----------|-----------|------------|
| 1. Emergency | Days to weeks | Search and rescue, emergency shelter, establish order, clear major arteries, drain floodwater | Lives saved, population sheltered |
| 2. Restoration | Weeks to 3-4 months | Restore repairable essentials: power, water, basic services, temporary housing | Utility service restoration % |
| 3. Reconstruction | 1-2 years | Replace destroyed housing, infrastructure, and economic base | Building permits issued, jobs restored |
| 4. Betterment | 2-10+ years | Longer-term improvements beyond pre-disaster conditions: upgraded codes, new infrastructure, memorialization | Population recovery, GDP recovery |

The model's key insight: recovery is not a return to the pre-disaster state but an opportunity (and often a necessity) for transformation. The betterment phase is where cities either rebuild smarter or reproduce the same vulnerabilities.

### Differential Recovery

Recovery rates vary sharply by neighborhood wealth and social capital. Patterns observed across multiple disasters:

- **Wealthy neighborhoods** recover fastest: homeowners have insurance, savings, political influence, and the option to self-fund repairs.
- **Middle-income neighborhoods** face the "donut hole": too wealthy for most federal aid, too cash-poor to self-fund.
- **Low-income neighborhoods** recover slowest or not at all: renters have no property insurance, limited savings, and depend on slower public assistance programs.
- **Commercial districts** depend on customer base return --- a chicken-and-egg problem with residential recovery.

Post-Katrina New Orleans is the defining example: by 2007, the city had recovered only 63% of its pre-hurricane population of 455,046. Affluent areas like the Garden District (on higher ground, less flood damage) recovered quickly; the Lower Ninth Ward (low income, severe flooding) remained largely abandoned years later.

---

## Economic Impact

### Direct vs. Indirect Losses

Disaster economics distinguishes between direct and indirect losses. The total economic impact is typically 2-5x the direct physical damage figure.

| Loss Type | Definition | Examples |
|-----------|-----------|----------|
| Direct | Physical destruction of assets | Building damage, infrastructure damage, inventory loss |
| Indirect - Microeconomic | Revenue loss from business interruption | Closed businesses, lost wages, supply chain disruption |
| Indirect - Mesoeconomic | Sector-wide economic disruption | Tourism collapse, port closure, regional supply chain failure |
| Indirect - Macroeconomic | National-level effects | GDP reduction, inflation, fiscal deficit |

Global economic losses from natural disasters now average $250-300 billion annually (UNDRR). In the U.S., the average number of billion-dollar disaster events has surged from about 3 per year in the 1980s to over 20 per year in 2016-2025 (NOAA NCEI). The average interval between billion-dollar events shrank from 82 days in the 1980s to 18 days in recent years.

### Fiscal Impact on City Budgets

Disasters hit municipal finances from both sides simultaneously:

**Revenue losses:**
- Property tax base erodes as assessed values drop or properties are destroyed
- Sales tax revenue falls as businesses close and consumers leave
- Income/payroll tax declines with job losses

**Expenditure spikes:**
- Emergency response costs (overtime, equipment, mutual aid)
- Debris removal (often the single largest post-disaster expense)
- Temporary infrastructure repairs
- Increased social service demand
- Match requirements for federal aid programs (typically 25%)

Cities without adequate emergency reserves can face fiscal crisis. The Government Finance Officers Association (GFOA) recommends maintaining general fund reserves equal to at least 2 months of operating expenditure (roughly 16.7% of the annual budget). Many cities fall well below this threshold.

### Federal Aid and Insurance

Post-disaster funding flows through several channels:

| Source | Mechanism | Coverage |
|--------|----------|----------|
| FEMA Public Assistance | Reimburses 75% of eligible public infrastructure repair | Roads, utilities, public buildings |
| FEMA Individual Assistance | Grants to individuals (max ~$42,500) | Housing, personal property |
| SBA Disaster Loans | Low-interest loans to businesses and homeowners | Repair, replacement, economic injury |
| CDBG-DR | HUD Community Development Block Grants for disaster recovery | Flexible, often arrives 1-2 years post-disaster |
| Private insurance | Property/casualty insurance payouts | Covered perils only (flood often excluded) |

The gap between total losses and insured losses --- the "protection gap" --- is substantial. Globally, only about 40-45% of disaster losses are insured; in developing regions, the figure drops below 10%.

---

## Resilience Strategies

Resilience is the capacity of a system to absorb disturbance, reorganize, and maintain essential function. For cities, resilience operates across four dimensions: physical, social, economic, and institutional.

### Building Codes and Standards

Building codes are the single most cost-effective resilience investment. FEMA estimates that every $1 invested in hazard-resistant building codes saves $11 in avoided future disaster losses.

| Code Domain | Key Provisions | Effect |
|-------------|---------------|--------|
| Seismic (IBC/ASCE 7) | SDC A-F requirements, ductile detailing, base isolation | Reduces earthquake casualties by 80-90% vs. unregulated construction |
| Wind (IBC/ASCE 7) | Wind speed maps, envelope design, impact-resistant glazing | Cat-3 resistant construction adds 1-3% to building cost |
| Flood (NFIP minimum) | Elevation above BFE, flood-resistant materials below BFE | Elevation is the single most effective flood mitigation measure |
| Fire (IBC/IFC) | Sprinklers, fire-rated assemblies, separation distances | Sprinklered buildings: 97% fire containment rate |
| WUI (IWUIC) | Ember-resistant vents, noncombustible roofing, defensible space | Reduces structure ignition probability by 60-80% |

Code adoption and enforcement vary dramatically. Many jurisdictions use outdated codes or lack enforcement capacity. The gap between code-as-written and construction-as-built is a persistent vulnerability.

### Infrastructure Hardening

- **Grid resilience**: Underground power lines, microgrids, distributed generation, battery storage
- **Water system**: Redundant supply sources, seismic-resistant pipes, emergency interconnections
- **Transportation**: Seismic retrofit of bridges, elevated road grades in flood zones, redundant routes
- **Communications**: Hardened 911 centers, satellite backup, mesh networks

### Land Use Planning

The most effective resilience strategy is often the simplest: do not build in hazard zones.

| Planning Tool | Application |
|--------------|-------------|
| Floodplain development restrictions | Prohibit or restrict construction in SFHA |
| Setbacks from wildfire fuel | Defensible space requirements, WUI zoning |
| Fault zone restrictions (Alquist-Priolo) | No habitable structures on active fault traces |
| Coastal retreat / managed retreat | Buyouts and relocation from eroding coastlines |
| Open space preservation | Floodplains as parks, wetlands as buffers |

### Social Capital and Community Preparedness

Social capital --- the trust, networks, and norms within a community --- is a measurable predictor of disaster recovery speed. Communities with strong civic organizations, religious institutions, and neighborhood associations recover faster because they can organize mutual aid, share information, and advocate collectively for resources.

### Emergency Reserves and Fiscal Preparedness

A dedicated disaster reserve fund, separate from the general fund balance, provides immediate liquidity for emergency response without disrupting normal services. Best practice: maintain a disaster reserve equal to 5-10% of the annual operating budget, funded through a dedicated annual appropriation.

---

## Insurance and Risk Transfer

### Property Insurance

Standard homeowner policies (HO-3) cover fire, wind, hail, lightning, and explosion but explicitly exclude flood and earthquake. This creates a coverage gap for two of the most damaging hazard types.

| Hazard | Standard Policy | Separate Policy Required |
|--------|----------------|-------------------------|
| Fire | Covered | --- |
| Wind/hail | Covered | Windstorm-only in coastal areas |
| Flood | Excluded | NFIP or private flood policy |
| Earthquake | Excluded | CEA (California), stand-alone policies elsewhere |
| Tornado | Covered (as wind) | --- |

### National Flood Insurance Program (NFIP)

The NFIP, administered by FEMA, is the primary source of flood insurance in the U.S. Key parameters:

- Maximum coverage: $250,000 structure / $100,000 contents (residential)
- Mandatory purchase requirement for federally-backed mortgages in SFHAs
- Premiums historically subsidized, transitioning to risk-based pricing under Risk Rating 2.0
- The program carries over $20 billion in debt to the U.S. Treasury from catastrophic loss years

The NFIP creates a well-documented moral hazard: subsidized premiums encourage development in flood-prone areas, and the program allows repetitive-loss properties to be rebuilt in the same locations. Roughly 1% of NFIP-insured properties account for over 25% of all claims paid.

### Earthquake Insurance

Earthquake insurance penetration is low even in high-risk areas. In California, only about 10-15% of homeowners carry earthquake insurance (California Earthquake Authority). Deductibles are typically 10-15% of the dwelling limit, meaning a homeowner with a $500,000 policy may pay the first $50,000-$75,000 out of pocket. This high deductible means earthquake insurance primarily protects against total loss, not moderate damage.

### Moral Hazard and Risk Signaling

Insurance creates a tension: it protects individuals from catastrophic loss but can reduce incentive to mitigate risk. Effective insurance programs pair coverage with risk reduction incentives:
- Premium discounts for mitigation (retrofit, elevation, defensible space)
- Higher deductibles in highest-risk zones
- Non-renewal or surcharge for repetitive claims
- Building code enforcement as a condition of insurability

---

## Climate Change and Escalating Risk

Climate change is not a future risk --- it is actively reshaping disaster frequency and intensity now. The data is unambiguous: the annual average of billion-dollar disaster events in the U.S. has risen from 3.3 in the 1980s to 23.0 in the most recent 5-year period (2020-2024), adjusted for inflation (NOAA NCEI).

### Mechanism-Specific Amplification

| Hazard | Climate Change Effect | Mechanism |
|--------|----------------------|-----------|
| Flooding | Increasing frequency and intensity | Warmer atmosphere holds ~7% more moisture per 1 degree C warming (Clausius-Clapeyron), intensifying rainfall events |
| Wildfire | Longer seasons, larger fires | Earlier snowmelt, drier vegetation, extended fire weather windows |
| Hurricane | Intensification of strongest storms | Warmer sea surface temperatures fuel stronger storms; rapid intensification events increasing |
| Heat waves | More frequent and severe | Direct consequence of rising baseline temperatures |
| Drought | Longer and more severe in affected regions | Increased evapotranspiration, shifting precipitation patterns |
| Sea level rise | Amplifies coastal flooding | Higher baseline means storm surge pushes further inland |

### Compound Events

Climate change is increasing the probability of compound events --- multiple hazards striking simultaneously or in close sequence. Examples:
- **Fire then flood**: Wildfire strips vegetation, creating hydrophobic soils; subsequent rainfall produces flash floods and debris flows (post-Camp Fire mudslides in California)
- **Hurricane plus heat**: Power outages during heat waves produce lethal conditions for vulnerable populations
- **Drought plus fire**: Drought desiccates vegetation, providing tinder; a single ignition source triggers catastrophic fire
- **Sequential hurricanes**: Multiple storms striking the same region before recovery from the first is complete

Compound events are particularly dangerous because they overwhelm response systems designed around single-hazard scenarios and because damage from the second event is amplified by vulnerabilities created by the first.

### Planning Implications

Historical return periods are becoming unreliable guides for future risk. A structure designed for the "100-year flood" based on 20th-century data may actually face that flood level every 25-50 years under current climate conditions. Resilient design must incorporate forward-looking climate projections, not just historical statistics.

---

## Case Studies

### New Orleans --- Hurricane Katrina (2005)

**The event:** Category 3 hurricane at landfall; catastrophic levee failures flooded 80% of the city. Approximately 1,800 deaths across the Gulf Coast, over $170 billion in damages --- the costliest natural disaster in U.S. history at the time.

**Damage pattern:** Not a wind disaster --- a flood disaster caused by infrastructure failure. Levees designed for a Category 3 surge were breached or overtopped in over 50 locations. Areas behind levees (most of the city) experienced 6-15 feet of standing water for weeks.

**Recovery trajectory:**
- Emergency phase: chaotic, marked by delayed federal response
- Restoration: 10 months post-storm, New Orleans had lost an average of 95,000 jobs, representing $2.9 billion in lost wages
- Population: by mid-2007, only 63% of the pre-hurricane population (455,046) had returned
- Differential recovery: high-income neighborhoods on natural high ground (Garden District, French Quarter) recovered within months; the Lower Ninth Ward remained largely depopulated for years
- Long-term: by 2015, individual incomes had actually surpassed pre-Katrina levels on average, masking sharp inequality in who returned and who did not

**Resilience lesson:** Levees create a binary risk --- either they hold and you are dry, or they fail and you face catastrophic flooding with no gradual warning. The $14.5 billion post-Katrina Hurricane and Storm Damage Risk Reduction System rebuilt and upgraded the levee system but also raised a fundamental question: should a city below sea level rely entirely on engineered barriers?

### San Francisco --- 1906 Earthquake and Fire / 1989 Loma Prieta

**1906 event:** Magnitude 7.9 earthquake on the San Andreas Fault. The earthquake itself caused significant structural damage, but the subsequent fires were responsible for 80-95% of total destruction. Over 28,000 buildings destroyed, 3,000+ killed, 227,000-300,000 left homeless (out of 410,000 population). Property losses estimated at $400-524 million in 1906 dollars ($10.4+ billion in 2024 dollars).

**Why fire dominated:** The earthquake ruptured water mains throughout the city, leaving firefighters without water. Dense wooden construction and narrow streets allowed fire to spread unchecked for three days. Military dynamiting of buildings to create firebreaks was partially effective but also caused additional fires.

**Rebuilding:** San Francisco rebuilt within a decade, hosting the 1915 Panama-Pacific International Exposition. A dedicated high-pressure auxiliary water system ($5.2 million) was constructed with 135 miles of pipeline, dedicated reservoirs, pumping stations, and bay water intakes --- ensuring firefighting water supply independent of the domestic water system.

**1989 Loma Prieta:** Magnitude 6.9, 63 deaths, $6.8-10 billion in damage. The Marina District --- built on landfill from 1906 rubble --- experienced severe liquefaction damage. 35 buildings completely destroyed, over 100 collapsed. This demonstrated that site geology is destiny: the same shaking intensity produced dramatically different outcomes depending on soil conditions.

**Resilience lesson:** San Francisco's 1906-to-1989 arc illustrates how building codes evolve through disaster experience. After 1906: fire codes and auxiliary water. After 1989: accelerated seismic retrofit of URM buildings, soft-story buildings, and the Bay Bridge. Each disaster revealed new vulnerabilities that previous codes had not addressed.

### Galveston --- 1900 Hurricane

**The event:** The deadliest natural disaster in U.S. history. An estimated 6,000-12,000 killed (official figure: 8,000). Storm surge of 8-12 feet inundated the entire island city, which had a maximum elevation of only 8.7 feet.

**Recovery:** One of the most remarkable engineering responses in disaster history:
- A 17-foot seawall was approved by voters (3,085-21) and construction began in 1902, with the first 3-mile segment completed in 1904. The seawall eventually extended to over 10 miles.
- The entire city was raised by up to 16 feet using 16.3 million cubic yards of dredged sand --- 500 city blocks with buildings jacked up and fill placed beneath them, completed by 1910.
- The city adopted the commission form of government, an innovation that spread nationwide.

**Resilience lesson:** The seawall proved its value in the 1909 and 1915 hurricanes, dramatically reducing casualties. However, Galveston never recovered its economic preeminence --- Houston, located inland, captured the growth Galveston had dominated before 1900. Disaster can permanently redirect economic geography.

### Paradise, California --- Camp Fire (2018)

**The event:** The deadliest and most destructive wildfire in California history. 85 killed, 18,804 structures destroyed, 153,336 acres burned. The fire was caused by failed Pacific Gas and Electric transmission line hardware during strong katabatic winds.

**Destruction pattern:** The fire moved through Paradise at a speed that outpaced evacuation. Dense development at the WUI, limited escape routes, and extreme fire weather created a "perfect storm" for urban conflagration. The U.S. Fire Administration classified the Camp Fire as an "urban" fire despite Paradise being an unincorporated community --- its building density meant fire spread through structure-to-structure ignition rather than wildland fuel alone.

**Recovery:** Extremely slow. Pre-fire population: 26,000+. By 2020: fewer than 5,000. By 2024: approximately 11,000. At the current rate of ~500 new properties per year, full rebuild would take 30+ years. Many former residents have permanently relocated. New construction must meet California's more stringent WUI building codes, adding cost.

**Resilience lesson:** Evacuation infrastructure --- road capacity relative to population --- is a hard constraint on survivability. Paradise had essentially one primary evacuation route (Skyway) for a population of 26,000. WUI communities must design for evacuation capacity, not just fire resistance.

### Tokyo --- Great Kanto Earthquake (1923) and Modern Seismic Design

**The event:** Magnitude 8.0 earthquake. 105,385 deaths, of which 87% (91,781) were caused by fire, not building collapse. Approximately 300,000 buildings destroyed (212,000 burned, 80,000 collapsed). Total damage exceeded one-third of Japan's GDP.

**Post-fire pattern:** Like San Francisco 1906, the earthquake triggered massive urban conflagration in a city of predominantly wooden construction. Thousands died in firestorms, particularly the 38,000 people who perished in the Rikugun Honjo Hifukusho (military clothing depot), where a fire tornado engulfed refugees.

**Rebuilding and code evolution:**
- 1924: Japan introduced the world's first seismic design requirement in building codes
- Reconstruction featured wider streets (serving as firebreaks), expanded parks, and reinforced concrete buildings
- Tokyo's post-1923 code development continued through successive earthquakes, producing some of the most sophisticated seismic building standards in the world
- Modern Japanese buildings routinely survive M7+ events with minimal damage, vindicating decades of code evolution

**Resilience lesson:** Japan's arc from 1923 to present is the strongest real-world demonstration that building codes work. The 2011 Tohoku earthquake (M9.1) caused catastrophic tsunami damage but remarkably little structural collapse from shaking alone --- a testament to seismic engineering that began as a direct response to 1923.

---

## Application to Bitborough

Bitborough already models fire with probabilistic ignition, spread mechanics, and fire station coverage. The disaster and resilience system extends this foundation to additional hazards, recovery mechanics, and policy tools.

### Disaster Event System

Each disaster type should be modeled as a probabilistic event with configurable frequency, intensity, and spatial pattern:

```
interface DisasterEvent {
  type: 'earthquake' | 'flood' | 'wildfire' | 'tornado' | 'hurricane' | 'drought';
  intensity: number;        // 0-1 normalized scale
  epicenter: { x: number; y: number };
  radius: number;           // affected area radius in tiles
  duration: number;         // ticks
  timestamp: number;        // game tick
}
```

#### Earthquake Mechanics

Earthquake risk should be a map-level property (seismic zone), with damage determined by building type:

```
earthquakeDamage(building, intensity, soilType) =
  baseDamageRate(building.constructionType, intensity)
  * soilAmplification(soilType)
  * codeReduction(building.codeLevel)
```

**Base damage rate by construction type (at intensity 0.5):**

| Construction Type | Base Damage (%) | Code Reduction Factor |
|-------------------|----------------|----------------------|
| Wood frame | 15 | 0.7 per code level |
| Unreinforced masonry | 40 | 0.6 per code level |
| Reinforced masonry | 10 | 0.8 per code level |
| Steel frame | 8 | 0.85 per code level |
| Reinforced concrete | 5 | 0.9 per code level |

**Soil amplification factor:**

| Soil Type | Amplification |
|-----------|--------------|
| Bedrock | 1.0 |
| Firm soil | 1.3 |
| Soft soil | 1.8 |
| Fill / reclaimed land | 2.5 |

Damage scales with intensity via an S-curve: `actualDamage = baseDamage * sigmoid(intensity, midpoint=0.5, steepness=6)`. At low intensity, almost no damage. At high intensity, approaches the theoretical maximum for the building type.

#### Flood Mechanics

Flooding should use water proximity, elevation, and impervious surface coverage:

```
floodRisk(tile) =
  baseFloodProbability(tile.elevation, tile.waterProximity)
  * imperviousSurfaceMultiplier(tile.neighborhood)
  * leveeProtection(tile)
```

**Impervious surface multiplier** (derived from real runoff data):

```
imperviousSurfaceMultiplier(neighborhood) =
  0.15 + 0.85 * (neighborhood.imperviousFraction)
```

Where `imperviousFraction` is the ratio of built/paved tiles to total tiles in the local area. A fully natural area has multiplier 0.15 (baseline runoff); a fully paved area has multiplier 1.0 (4x baseline).

**Flood damage** uses a simplified depth-damage function:

```
floodDamage(building, floodDepth) =
  min(1.0, 0.05 + 0.08 * floodDepth) * building.value
```

Where `floodDepth` is in tiles of water above ground level (each tile unit = ~2 feet). This produces:
- Depth 0 (at grade): 5% damage
- Depth 1: 13% damage
- Depth 4: 37% damage
- Depth 8: 69% damage

**Elevation as mitigation**: buildings elevated above the base flood level reduce effective depth accordingly. A building elevated 2 units in a flood of depth 3 experiences only depth 1.

#### Drought Mechanics

Drought should be a slow-onset event that degrades water supply and increases fire risk:

```
droughtEffect(city, severity) = {
  waterSupplyMultiplier: max(0.3, 1.0 - severity * 0.5),
  fireIgnitionMultiplier: 1.0 + severity * 2.0,
  parkHealthMultiplier: max(0.2, 1.0 - severity * 0.6)
}
```

At maximum severity (1.0): water supply drops to 50%, fire ignition probability triples, and parks/vegetation deteriorate to 40% health.

### Recovery Mechanics

Recovery should follow the Kates-Pijawka four-phase model, with phase duration scaling by disaster severity and city resources:

```
recoveryProgress(city, disaster) = {
  emergencyDuration: baseDays(disaster.severity) * (1 / city.emergencyServiceLevel),
  restorationDuration: baseDays(disaster.severity) * 3 * (1 / city.infrastructureLevel),
  reconstructionDuration: baseDays(disaster.severity) * 12 * (1 / city.budgetHealth),
  bettermentDuration: baseDays(disaster.severity) * 36
}
```

Where `baseDays(severity) = ceil(severity * 14)` --- a maximum-severity event has a 14-day emergency phase baseline. Cities with better emergency services, infrastructure, and budget health recover proportionally faster.

**Differential recovery by neighborhood**: recovery rate should correlate with neighborhood land value:

```
neighborhoodRecoveryRate(neighborhood, city) =
  baseRate * (0.5 + 0.5 * normalize(neighborhood.avgLandValue, city.avgLandValue))
```

Low-value neighborhoods recover at 50-100% of base rate; high-value neighborhoods recover at 100-150%.

### Policy Mechanics

The player should be able to invest in resilience through policy levers:

| Policy | Cost | Effect | Unlock Condition |
|--------|------|--------|-----------------|
| Building code upgrade (seismic) | +5% construction cost | Reduces earthquake damage by 30% for new buildings | First earthquake event |
| Building code upgrade (wind) | +3% construction cost | Reduces hurricane/tornado damage by 25% for new buildings | First wind event |
| Floodplain development ban | Lost tax revenue from restricted land | No new construction in flood zones | Always available |
| Mandatory flood elevation | +8% construction cost in flood zones | Reduces flood damage by 50% for new buildings | Always available |
| URM retrofit mandate | $X per building | Brings existing URM buildings to modern seismic standard | Population > 10,000 |
| Emergency reserve fund | Annual appropriation from budget | Faster emergency response, shorter recovery | Always available |
| WUI defensible space | Maintenance cost per WUI building | Reduces wildfire structure ignition by 60% | Any WUI development |
| Infrastructure hardening | 2x replacement cost | Reduces infrastructure failure probability by 50% | Population > 25,000 |
| Levee construction | High capital cost + maintenance | Eliminates flood damage below design level, catastrophic if overtopped | Coastal/river map |

### Emergency Fund Mechanics

The emergency reserve fund should function as a dedicated budget line:

```
emergencyFund = {
  balance: number,                    // current fund balance
  annualContribution: number,         // annual budget allocation
  maxBalance: cityBudget * 0.20,      // cap at 20% of annual budget
  drawdownRate: disasterCost * 0.10   // available per tick during emergency
}
```

When a disaster strikes:
- If `emergencyFund.balance >= estimatedRecoveryCost`: emergency phase shortened by 50%, no budget crisis
- If `emergencyFund.balance >= estimatedRecoveryCost * 0.5`: emergency phase shortened by 25%
- If `emergencyFund.balance < estimatedRecoveryCost * 0.25`: budget crisis triggered, services degraded, recovery slowed

### Integration with Existing Fire System

The existing fire simulation already models:
- Probabilistic ignition based on building type and density
- Spread mechanics (tile-to-tile)
- Fire station coverage radius and response

Extensions for the disaster system:
- **Post-earthquake fire**: earthquake events should trigger multiple simultaneous ignition points (broken gas lines), with water system damage reducing firefighting effectiveness
- **Drought-amplified fire**: drought severity multiplies base ignition probability
- **WUI fire**: wildfire events at map edges can spread into developed areas
- **Conflagration threshold**: when active fires exceed `fireStationCount * 3`, suppression effectiveness drops to 20% (overwhelmed department)

### Disaster Frequency Configuration

Allow map-level disaster frequency profiles:

| Map Profile | Earthquake | Hurricane | Flood | Wildfire | Tornado | Drought |
|-------------|-----------|-----------|-------|----------|---------|---------|
| Coastal temperate | None | Low | Medium | Low | None | Low |
| Coastal subtropical | Low | High | High | Low | Low | Low |
| Interior plains | Low | None | Medium | Low | High | Medium |
| Mountain west | Medium | None | Low | High | None | High |
| Pacific coast | High | None | Low | High | None | Medium |
| Custom | Configurable | Configurable | Configurable | Configurable | Configurable | Configurable |

---

## Cross-References

- [environment-and-sustainability.md](./environment-and-sustainability.md) --- Climate resilience, pollution from disasters, urban heat island (increases heat wave risk)
- [utilities-and-infrastructure.md](./utilities-and-infrastructure.md) --- Infrastructure capacity, water supply, power generation (disaster targets)
- [municipal-finance.md](./municipal-finance.md) --- Budget structure, emergency reserves, fiscal impact of disasters, bond financing for recovery
- [public-services.md](./public-services.md) --- Fire service coverage models, emergency response, ISO ratings (already models fire risk factors)
- [housing.md](./housing.md) --- Housing supply elasticity (relevant to reconstruction), building types, affordability (affects differential recovery)

---

## Sources

- NOAA NCEI. "Billion-Dollar Weather and Climate Disasters." https://www.ncei.noaa.gov/access/billions/
- NOAA. "2024: An active year of U.S. billion-dollar weather and climate disasters." https://www.climate.gov/news-features/blogs/beyond-data/2024-active-year-us-billion-dollar-weather-and-climate-disasters
- FEMA. "Hazus Earthquake Model Technical Manual, Hazus 5.1." https://www.fema.gov/sites/default/files/documents/fema_hazus-earthquake-model-technical-manual-5-1.pdf
- FEMA. "Hazus Flood Model Technical Manual, Hazus 7.0." https://www.fema.gov/sites/default/files/documents/fema_rsl_hazus-7-fltm_06272025_0.pdf
- FEMA. "Seismic Building Codes." https://www.fema.gov/emergency-managers/risk-management/earthquake/seismic-building-codes
- FEMA. "National Flood Insurance Program, Unit 1: Floods and Floodplain Management." https://www.fema.gov/pdf/floodplain/nfip_sg_unit_1.pdf
- FEMA. "National Risk Index for Natural Hazards." https://www.fema.gov/flood-maps/products-tools/national-risk-index
- USGS. "The Modified Mercalli Intensity Scale." https://www.usgs.gov/programs/earthquake-hazards/modified-mercalli-intensity-scale
- USGS. "Casualties and Damage After the 1906 Earthquake." https://earthquake.usgs.gov/earthquakes/events/1906calif/18april/casualties.php
- USGS. "How Can Climate Change Affect Natural Disasters?" https://www.usgs.gov/faqs/how-can-climate-change-affect-natural-disasters
- NOAA NHC. "Saffir-Simpson Hurricane Wind Scale." https://www.nhc.noaa.gov/aboutsshws.php
- NOAA SPC. "Enhanced Fujita Scale." https://www.spc.noaa.gov/efscale/
- NIST. "Community Resilience Planning Guide for Buildings and Infrastructure Systems." https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1190GB-16.pdf
- IBHS. "Return of Conflagration to the Built Environment." https://ibhs.org/wildfire/returnconflagration/
- Bureau of Labor Statistics. "The Effects of Hurricane Katrina on the New Orleans Economy." https://www.bls.gov/opub/mlr/2007/06/art1full.pdf
- PNAS. "Reconstruction of New Orleans After Hurricane Katrina: A Research Perspective." https://pmc.ncbi.nlm.nih.gov/articles/PMC1595407/
- National Academies Press. "The Impacts of Natural Disasters: A Framework for Loss Estimation." https://nap.nationalacademies.org/read/6425/chapter/5
- UNDRR. "Understanding Disaster Risk: Direct and Indirect Losses." https://www.preventionweb.net/understanding-disaster-risk/key-concepts/direct-indirect-losses
- ScienceDirect. "Revisiting and Adapting the Kates-Pijawka Disaster Recovery Model." https://www.sciencedirect.com/science/article/abs/pii/S2212420921006993
- California Department of Conservation. "The 1906 Great San Francisco Earthquake." https://www.conservation.ca.gov/cgs/earthquakes/san-francisco
- California Department of Conservation. "The 1989 Loma Prieta Earthquake." https://www.conservation.ca.gov/cgs/earthquakes/loma-prieta
- Moody's RMS. "The Great Kanto Earthquake: 100-Year Retrospective." https://www.moodys.com/web/en/us/insights/insurance/the-great-kanto-earthquake-100-year-retrospective.html
- NPS. "Galveston Hurricane of 1900." https://www.nps.gov/articles/galveston-hurricane-of-1900.htm
- Texas Almanac. "Galveston's Response to the Hurricane of 1900." https://www.texasalmanac.com/articles/galvestons-great-hurricane
- OPB. "Paradise, Calif. Burned in 2018. Rebuilding It Offers a Look at What's Ahead for LA." https://www.opb.org/article/2025/01/22/a-california-town-s-rebuilding-offers-lessons-for-la-after-fires/
- PMC. "Observed Changes in the Frequency, Intensity, and Spatial Patterns of Nine Natural Hazards in the United States from 2000 to 2019." https://pmc.ncbi.nlm.nih.gov/articles/PMC9461684/
- UCAR Climate Data Guide. "Palmer Drought Severity Index (PDSI)." https://climatedataguide.ucar.edu/climate-data/palmer-drought-severity-index-pdsi
- ISATts. "Seismic Design Categories, IBC Code Resources." https://isatts.com/seismic-design-categories/
