# Urban Growth Patterns

> How cities expand, densify, and restructure over time — models for simulating urban evolution.

## Table of Contents

- [Monocentric City Model](#monocentric-city-model)
- [Polycentric City Emergence](#polycentric-city-emergence)
- [Concentric Zone Model](#concentric-zone-model)
- [Sector Model](#sector-model)
- [Multiple Nuclei Model](#multiple-nuclei-model)
- [Sprawl](#sprawl)
- [Infill Development](#infill-development)
- [Gentrification](#gentrification)
- [Neighborhood Lifecycle](#neighborhood-lifecycle)
- [Urban Growth Boundaries](#urban-growth-boundaries)
- [Annexation and Metropolitan Fragmentation](#annexation-and-metropolitan-fragmentation)
- [Smart Growth Principles](#smart-growth-principles)
- [Application to Bitborough](#application-to-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

---

## Monocentric City Model

### Alonso-Muth-Mills Framework

The standard urban model (Alonso 1964, Muth 1969, Mills 1967) treats the city as a single-center system. All employment is located at the CBD. Residents choose where to live by trading off commute cost against housing cost — those who live farther from the center pay less for land but more for transportation.

The model yields a negative-exponential density gradient described by Clark's Law:

```
D(x) = D₀ × e^(-bx)
```

Where `D₀` is the peak density at the center, `b` is the gradient steepness, and `x` is distance from the CBD. The theoretical underpinning is that housing price per unit area falls with distance, so developers build at lower density on cheaper peripheral land.

### Empirical Performance

Despite its simplicity, the model has surprising explanatory power. Liotta, Viguie, and Lepetit (2022) tested it across 192 cities on every continent and found its core predictions — declining density with distance, higher rents near the center — largely confirmed. Analysis of 359 US metropolitan areas found monocentric structure persists in a majority: 56.5% in 1990, 64.1% in 2000, and 57.7% in 2010 (Arribas-Bel and Sanz-Gracia, 2014).

### When It Breaks Down

The model fails when:

- **Multiple employment centers** emerge (edge cities, suburban office parks)
- **Amenity variation** matters — waterfront, parks, school quality create non-monotonic price gradients
- **Historical path dependence** locks in land use patterns (industrial waterfronts, railroad corridors)
- **Disamenities near the CBD** (pollution, crime, congestion) invert the gradient near the center, as McDonald and Bowman (1979) found in Chicago

**Simulation relevance:** The monocentric model maps directly to Bitborough's existing density system, which uses center-of-mass as the primary anchor for medium-density upgrades with exponential decay. The model's limitations predict when the game should transition to polycentric logic.

---

## Polycentric City Emergence

### Edge Cities

Joel Garreau (1991) identified a new urban form: the "edge city" — suburban nodes with significant employment concentrations that had emerged since the 1960s. His empirical criteria:

| Criterion | Threshold |
|-----------|-----------|
| Office space | >= 5 million sq ft |
| Retail space | >= 600,000 sq ft leasable |
| Jobs vs. bedrooms | More jobs than bedrooms |
| Population perception | Recognized as a single place |
| Age | Did not exist as a city 30 years prior |

Garreau identified over 100 such nodes across the US. By the 1990s, suburban nodes accounted for over 70% of metropolitan office space in major US regions, absorbing 67% of suburban white-collar job growth between 1970 and 1990 versus just 7% in central cities.

### Sub-Center Formation Dynamics

Employment sub-centers form when agglomeration benefits (knowledge spillovers, labor market pooling, input sharing) at a location outweigh the congestion costs of the main CBD. A sub-center typically requires:

1. A transportation node (highway interchange, rail station) that lowers effective distance
2. An initial employment anchor (university, hospital, corporate campus)
3. Enough development momentum to attract complementary businesses

### Polycentricity vs. Dispersal

Not all decentralization produces polycentricity. Robert Lang's "edgeless cities" concept (2003) argues that much suburban employment is scattered rather than clustered — diffuse office parks along highways rather than dense sub-centers. Empirical studies find employment centers account for less than half of all employment in many metros: 47% in San Francisco, one-third in Los Angeles, and less than one-fourth in suburban Chicago.

**Simulation relevance:** Transit stops in Bitborough already function as polycentric density anchors. True edge-city emergence would require commercial zones reaching critical mass far from the original center, creating a secondary "center of mass" node.

---

## Concentric Zone Model

### The Burgess Model (1925)

Ernest Burgess applied ecological concepts (invasion, succession, dominance) from plant ecology to explain urban social structure in 1920s Chicago. The city grows outward in concentric rings, with each zone having distinct characteristics:

| Zone | Name | Characteristics | Density | Typical Land Use |
|------|------|-----------------|---------|------------------|
| I | Central Business District | Commerce, offices, civic buildings | Very high (employment) | Commercial, institutional |
| II | Zone of Transition | Deteriorating housing, immigrant quarters, light manufacturing; highest crime rates | High but declining | Mixed: industrial encroachment on residential |
| III | Working-Class Residential | Blue-collar families, older housing stock, walkable to factories | Moderate | Residential (multi-family, row houses) |
| IV | Middle-Class Residential | Single-family homes, yards, garages; better schools | Lower | Residential (single-family) |
| V | Commuter Zone | Suburbs, exurbs; largest lots, newest housing | Lowest | Residential (detached), agricultural fringe |

### Invasion and Succession

The model's dynamic mechanism is *invasion and succession*: as the CBD expands, it encroaches on Zone II. Residents of Zone II migrate outward into Zone III, displacing its residents into Zone IV, and so on. Each zone is constantly being "invaded" by the adjacent inner zone's population and land uses.

### Criticisms

- Assumes uniform topography and transportation access (no rivers, hills, rail lines)
- Culturally specific to early 20th-century American industrial cities
- Ignores racial segregation enforced by redlining and restrictive covenants
- Assumes a single growth direction (outward) — does not account for gentrification (inward reinvestment)

**Simulation relevance:** The zone-of-transition concept maps to Bitborough's dereliction mechanics — the ring of neglected buildings at the boundary between expanding commercial/industrial zones and residential areas. Invasion-and-succession is a useful mental model for how zone demand waves propagate outward.

---

## Sector Model

### Hoyt's Model (1939)

Homer Hoyt analyzed 142 US cities' rent data and found that high-rent districts did not form complete rings. Instead, they extended outward in wedge-shaped sectors along transportation corridors — rail lines, streetcar routes, and later highways. Key observations:

- **Industrial sectors** align along railroads, rivers, and highways for freight access
- **High-rent residential** extends along prestige corridors (elevated terrain, waterfronts, transit routes to CBD)
- **Low-rent residential** fills the remaining sectors, often adjacent to industrial corridors
- Once a sector's character is established, it tends to persist as the city grows — the sector extends outward but rarely changes use

### Transportation as the Shaping Force

Hoyt's central insight is that transportation infrastructure does not radiate uniformly from the CBD. Rail lines, highways, and waterways create axes of higher accessibility, and development follows these axes in elongated wedges rather than uniform rings. Land values are highest near these corridors and decline with perpendicular distance from them.

### Modern Validation

Hoyt's model explains patterns that the concentric zone model cannot:

- Why industrial districts form linear corridors along rail lines rather than rings
- Why wealthy neighborhoods often form wedges radiating from the CBD along scenic routes
- Why highway construction reshapes land use in sectors rather than rings

**Simulation relevance:** Road networks in Bitborough already create accessibility corridors. If arterial roads or future transit lines carry higher capacity, sector-like development should emerge naturally — dense commercial/residential strips along major roads with lower density perpendicular to them.

---

## Multiple Nuclei Model

### Harris and Ullman (1945)

Chauncy Harris and Edward Ullman proposed that cities develop around multiple distinct nuclei rather than a single CBD. Each nucleus serves a specialized function and attracts compatible land uses while repelling incompatible ones. They identified four principles governing nuclei formation:

1. **Specialized requirements** — some activities require specific facilities (ports, rail yards, flat land for factories)
2. **Agglomeration benefits** — similar activities cluster together (retail districts, financial districts, university towns)
3. **Incompatibility** — some activities repel each other (heavy industry vs. luxury housing)
4. **Rent competition** — some activities cannot afford high-rent locations and are pushed to cheaper nuclei

### Specialized Districts

Real cities exhibit clear nuclei specialization:

| Nucleus Type | Examples | Key Driver |
|-------------|----------|------------|
| Financial district | Wall Street, City of London | Agglomeration of professional services |
| Industrial district | Detroit automotive corridor | Shared supply chains, labor pool |
| University district | College towns, research parks | Knowledge spillovers |
| Entertainment district | Hollywood, Broadway | Creative cluster effects |
| Port/logistics | Long Beach, Rotterdam | Infrastructure dependency |
| Government district | Washington DC core, state capitals | Institutional anchor |

### Automobile and Dispersal

Harris and Ullman recognized that car-based mobility was reshaping how cities formed. When residents no longer depended on walking distance to a single downtown, they could live and work across a wider geography, enabling each nucleus to specialize without requiring internal mixed-use. Los Angeles is the canonical example: distinct districts (Hollywood, Downtown, Long Beach port, LAX area) developed independently around different economic functions.

**Simulation relevance:** Bitborough's zone types (residential, commercial, industrial) already create implicit nuclei through desirability mechanics — industrial zones repel residential through pollution. Explicit specialized buildings (university, hospital, stadium) could serve as nucleation points for sub-center formation.

---

## Sprawl

### Definition

Urban sprawl is low-density, automobile-dependent development at the metropolitan fringe characterized by:

- Single-use zoning separating residential, commercial, and industrial areas
- Discontinuous, leapfrog development with undeveloped parcels between built areas
- Strip commercial development along arterial roads
- Low population density (typically < 10 dwelling units per acre)
- Minimal pedestrian infrastructure; car dependency for all trips

### Causes

| Cause | Mechanism |
|-------|-----------|
| Highway construction | Opens cheap peripheral land; reduces commute friction |
| Single-use zoning | Mandates separation of uses, forcing car trips between zones |
| Cheap land at fringe | Developers prefer greenfield sites — lower acquisition cost, fewer regulatory hurdles |
| Housing preferences | Cultural preference for detached single-family homes with yards |
| Subsidized infrastructure | Developers do not bear full cost of road, sewer, school extensions |
| Mortgage policies | FHA/VA loans historically favored new suburban construction over urban rehabilitation |
| White flight / racial segregation | Post-WWII racial dynamics drove middle-class exodus from city centers |

### Measuring Sprawl

Ewing and Hamidi (2014) developed a composite compactness index for US metropolitan areas using four dimensions:

| Dimension | What It Measures |
|-----------|-----------------|
| Development density | Gross population density, % of population in high-density census blocks |
| Land use mix | Jobs-housing balance, walkability of destinations |
| Activity centering | Share of population/employment near CBD or sub-centers |
| Street accessibility | Block size, intersection density, % of four-way intersections |

The index is normalized to a mean of 100 (SD = 25). Higher scores indicate more compact development. New York scores well above 100; Atlanta and Nashville score well below.

### Fiscal and Environmental Costs

Sprawl imposes measurable costs:

- **Infrastructure**: suburban infrastructure costs 2-3x more per capita than urban (roads, sewers, utilities serving lower density)
- **Transportation**: residents of sprawling metros drive 20-40% more VMT per capita
- **Land consumption**: US urbanized areas grew 2x faster in land area than in population from 1970-2000
- **Environmental**: higher per-capita greenhouse gas emissions, habitat fragmentation, increased impervious surface and stormwater runoff

**Simulation relevance:** If Bitborough gains a larger map or growth boundary mechanics, sprawl becomes a meaningful pattern — players over-extending road networks into low-density fringe areas would face higher infrastructure maintenance costs relative to tax revenue collected.

---

## Infill Development

### Concept

Infill development builds on vacant, underused, or previously developed land within existing urban areas rather than on greenfield sites at the periphery. It is the spatial inverse of sprawl — intensifying use within the existing urban footprint.

### Types

| Type | Description | Example |
|------|-------------|---------|
| **Brownfield redevelopment** | Reuse of contaminated former industrial/commercial sites | Gas stations, factories, rail yards converted to mixed-use |
| **Greyfield redevelopment** | Reuse of obsolete but uncontaminated sites | Dead malls, aging strip centers |
| **Adaptive reuse** | Repurposing existing structures for new functions | Warehouse-to-loft conversions, church-to-restaurant |
| **Vacant lot development** | Building on empty parcels within the urban fabric | Gap sites, parking lot conversions |
| **Densification** | Replacing low-density structures with higher-density ones | Single-family home replaced by townhouses or apartments |

### Planning Strategies

Effective infill requires regulatory support:

- Flexible zoning that allows mixed-use and higher density by-right
- Reduced parking minimums near transit
- Height and density bonuses for affordable housing inclusion
- Streamlined permitting for brownfield cleanup
- Tax increment financing (TIF) to fund infrastructure upgrades in infill areas

The EPA's Smart Growth program identifies brownfield infill as especially beneficial because it leverages existing transportation and utility infrastructure, reduces pressure on greenfield land, and can remediate environmental contamination.

**Simulation relevance:** Bitborough's density upgrade system (Low -> Medium -> High) is fundamentally an infill mechanic. Buildings densify in place rather than expanding outward. The brownfield concept could map to a future mechanic where demolished industrial zones leave contaminated tiles that require cleanup investment before residential/commercial development.

---

## Gentrification

### Origins

Ruth Glass coined the term in 1964, observing middle-class households displacing working-class residents in inner London neighborhoods like Islington. She described a pattern where "one by one, many of the working class quarters of London have been invaded by the middle classes... until all or most of the original working class occupiers are displaced."

### Neil Smith's Rent Gap Theory (1979)

Smith provided an economic explanation rooted in the production of space rather than consumer preferences. The **rent gap** is the difference between:

- **Capitalized ground rent** — the actual income a property generates under its current use
- **Potential ground rent** — the income the land could generate under its "highest and best use"

When the rent gap becomes large enough, investment capital flows into the neighborhood to close it — buying cheap properties, renovating or demolishing them, and extracting the higher potential rent. Smith argued gentrification is driven by capital seeking profitable reinvestment opportunities, not simply by individual lifestyle preferences.

```
rent_gap = potential_ground_rent - capitalized_ground_rent
```

When `rent_gap > threshold`, redevelopment becomes profitable and gentrification pressure mounts.

### Stages of Gentrification (Clay, 1979)

Philip Clay identified four stages of the gentrification process:

| Stage | Actors | Activity | Displacement |
|-------|--------|----------|-------------|
| 1. Pioneer | Artists, students, risk-tolerant individuals | Renovate vacant/cheap properties with private funds | Minimal — targeting vacant units |
| 2. Expansion | Small-scale investors, more middle-class in-movers | Visible renovation wave; media attention; property values begin rising | Moderate — some non-renewal of leases |
| 3. Displacement | Risk-averse gentrifiers, institutional investors | Major rent increases; original commercial tenants displaced; zoning changes | Significant — low-income renters priced out |
| 4. Maturation | Corporations, wealthy residents | Neighborhood fully transformed; luxury development; even early pioneers displaced | Complete — original community dispersed |

### Empirical Patterns

Gentrification tends to occur in neighborhoods with:

- Proximity to CBD or major employment centers
- Architecturally interesting but deteriorated housing stock
- Good transit access
- Adjacent to already-gentrified areas (the "frontier" advances incrementally)
- Large rent gap (long-depressed values in a rising metro market)

**Simulation relevance:** Gentrification maps to a scenario where derelict low-density buildings near the city center are replaced by medium/high-density construction as demand recovers. The rent-gap formula could drive a "reinvestment pressure" score on neglected central tiles, creating waves of renewal that push low-income residents outward.

---

## Neighborhood Lifecycle

### Hoover-Vernon Model (1959)

Edgar Hoover and Raymond Vernon developed the neighborhood lifecycle theory while studying the New York metropolitan region for the Regional Plan Association. They identified five stages:

| Stage | Characteristics | Density Trend | Building Condition |
|-------|----------------|---------------|-------------------|
| 1. Development | Rural/vacant land converted to residential; new single-family homes | Rising (from zero) | New construction |
| 2. Growth | Apartment construction begins; population density increases; infrastructure investment | Rapidly rising | New + recent |
| 3. Stability | Land fully developed; peak density reached; building stock ages | Plateau | Aging but maintained |
| 4. Decline | Population loss; buildings deteriorate; conversion to lower-value uses; filtering | Falling | Deferred maintenance, vacancies |
| 5. Renewal | Reinvestment either through public intervention or private gentrification | Rising again | Renovation + new construction |

### Filtering Theory

The lifecycle model is linked to *filtering* — the process by which housing "filters down" the income ladder as it ages. New housing serves higher-income households; as it ages and becomes less desirable, it becomes affordable to lower-income households. This drives the lifecycle: as housing stock ages (Stage 3 -> 4), the neighborhood's socioeconomic composition shifts downward.

### Critique: Self-Fulfilling Prophecy

The lifecycle model was criticized for contributing to urban disinvestment. Metzger (2000) argued that treating decline as "natural" justified redlining, disinvestment, and planned abandonment — if a neighborhood's decline is inevitable, why invest in maintaining it? This critique is important for simulation design: the lifecycle should not be deterministic but responsive to player investment decisions.

**Simulation relevance:** This maps closely to Bitborough's existing building age/dereliction system. Buildings age, occupancy drops, dereliction sets in, and downgrade follows. The model suggests a complete cycle should be possible: Development (zone + build) -> Growth (density upgrade) -> Stability (high occupancy plateau) -> Decline (aging, dereliction) -> Renewal (player reinvestment or organic gentrification). The key design insight is that renewal should not be automatic — it should require active intervention (infrastructure investment, demolition and rezoning, or transit placement).

---

## Urban Growth Boundaries

### Concept

An urban growth boundary (UGB) is a regulatory line drawn around a metropolitan area beyond which urban-scale development is restricted. Land inside the boundary is designated for urban use; land outside is preserved for agriculture, forestry, or open space.

### Portland's UGB (Established 1979)

Portland, Oregon operates the most studied UGB in the United States, managed by the regional government Metro. Key features:

- Encompasses 24 cities and parts of 3 counties
- Must contain a 20-year supply of developable land
- Expanded 37 times between 1979 and 2020, but total expansion has been modest — roughly 5% growth in area over 40 years
- Land inside the UGB is zoned for urban density; land outside remains rural

### Empirical Effects

| Metric | Finding |
|--------|---------|
| Density | Portland's population density increased 18% from 1990-2010 while many peer cities saw density decline |
| Land prices | UGB creates a measurable price discontinuity at the boundary — land just inside is worth significantly more than land just outside |
| Housing prices | Mixed evidence; some studies find modest upward pressure on housing prices, others find the higher-density housing enabled by the UGB offsets land cost increases |
| Infill rate | Portland has higher infill and redevelopment rates than comparable cities without UGBs |
| Sprawl | Portland's urbanized area grew much more slowly than population, the inverse of the national trend |

### Mechanisms

The UGB works by:

1. **Constraining land supply** at the fringe — preventing cheap greenfield development
2. **Redirecting investment inward** — developers build infill and densify existing areas
3. **Coordinating infrastructure** — public investment in transit, sewers, and schools concentrates inside the boundary
4. **Raising density expectations** — zoning inside the UGB permits and encourages higher-density development

**Simulation relevance:** A growth boundary mechanic would constrain the buildable area and force players to densify rather than sprawl. Implementation: define a boundary radius from the initial settlement; allow expansion only through an explicit (costly) action. Land outside the boundary cannot be zoned. This would make density upgrades, transit investment, and infill the primary growth strategy rather than endless outward expansion.

---

## Annexation and Metropolitan Fragmentation

### Annexation

Municipal annexation is the process by which a city extends its jurisdictional boundary to include adjacent unincorporated land. Historically, American cities grew primarily through annexation — Chicago, for example, annexed over 125 square miles in a single 1889 consolidation.

### Fragmentation

Metropolitan fragmentation occurs when suburban areas incorporate as independent municipalities rather than allowing the central city to annex them. This creates a patchwork of small jurisdictions competing for tax base:

- The average US metropolitan area contains over 100 local government units
- Fragmented metros have weaker regional coordination on land use, transit, and infrastructure
- Central cities become "locked in" — surrounded by incorporated suburbs, unable to annex, with a declining share of the regional tax base

### Strip Annexation and Extraterritorial Jurisdiction

Cities use strategic techniques to manage growth:

- **Strip annexation**: annexing a narrow corridor to enclose unincorporated land, preventing competing municipalities from absorbing it (widely used in Phoenix metro during the 1970s)
- **Extraterritorial jurisdiction (ETJ)**: many states grant cities regulatory authority over a buffer zone of unincorporated land, allowing them to control subdivision standards and reserve future annexation rights

### State Policy Variation

Annexation ease varies dramatically by state. North Carolina's laws strongly favor city expansion; in contrast, most northeastern states make annexation nearly impossible, contributing to extreme fragmentation (e.g., the New York metro area spans over 700 municipalities).

**Simulation relevance:** For Bitborough, annexation could function as an explicit city-expansion action: the player pays a cost to extend the buildable map area in a specific direction. Fragmentation could be an advanced mechanic where neighboring AI cities compete for development at shared borders.

---

## Smart Growth Principles

### Core Principles

The Smart Growth Network (coordinated by the EPA) identifies 10 principles of smart growth:

| # | Principle | Key Idea |
|---|-----------|----------|
| 1 | Mixed land uses | Combine residential, commercial, and civic uses in walkable proximity |
| 2 | Compact building design | Use space efficiently; build up rather than out |
| 3 | Range of housing opportunities | Provide housing at multiple price points and densities |
| 4 | Walkable neighborhoods | Design streets and land use so daily needs are within walking distance (~400m / 5 min) |
| 5 | Distinctive communities with sense of place | Preserve historic character; avoid generic cookie-cutter development |
| 6 | Preserve open space, farmland, natural areas | Protect environmental and agricultural land from development |
| 7 | Direct development toward existing communities | Prioritize infill over greenfield expansion |
| 8 | Variety of transportation choices | Provide transit, bike, and pedestrian options alongside cars |
| 9 | Predictable, fair, cost-effective development decisions | Streamline permitting; make regulations transparent |
| 10 | Community and stakeholder collaboration | Engage residents in planning decisions |

### Transit-Oriented Development (TOD)

TOD is the spatial expression of smart growth: compact, mixed-use development within a 400-800m (5-10 minute walk) catchment of transit stations. TOD typically achieves:

- 2-5x the density of surrounding areas
- 50-80% reduction in car trips compared to equivalent suburban development
- Higher property values (10-25% premium near rail stations)

### Measurable Outcomes

Cities implementing smart growth policies show:

- Lower per-capita vehicle miles traveled (VMT)
- Reduced per-capita infrastructure spending
- Lower greenhouse gas emissions per resident
- Higher rates of walking, cycling, and transit use
- Greater economic productivity per acre of developed land

**Simulation relevance:** Smart growth principles collectively describe what a well-played Bitborough city looks like — dense development around transit stops, mixed commercial/residential zones near each other, preserved open space, compact building footprints. These principles could inform a city scoring or rating system.

---

## Application to Bitborough

### Mapping Models to Existing Mechanics

| Urban Model | Existing Bitborough Mechanic | How It Works |
|-------------|------------------------------|-------------|
| Clark's Law / AMM | `upgradeProb()` in density.ts | Exponential decay from center of mass drives medium-density upgrade probability |
| Monocentric model | `cityCenter()` function | Arithmetic mean of all active building positions serves as the single CBD proxy |
| Polycentric emergence | Transit stop as density anchor | `hasNearbyTransitStop()` creates secondary density peaks; high-density only near transit |
| Concentric zones | Implicit in density gradient | Low density at fringe, medium in middle ring, high near center/transit — emergent concentric pattern |
| Neighborhood lifecycle | Building age + dereliction system | `lowOccupancyMonths` triggers dereliction; `tickDerelict()` downgrades after 6 months |
| Infill / densification | Density upgrade (Low -> Med -> High) | Buildings upgrade in place, consuming adjacent tiles for larger footprints |
| Filtering | Downgrade chain in `DOWNGRADE_TARGET` | High -> Medium -> Low density when occupancy collapses |

### Suggested New Mechanics

#### 1. Neighborhood Lifecycle Score

Track each tile region's lifecycle stage explicitly:

```
lifecycle_stage(neighborhood) = f(avg_building_age, avg_occupancy, density_trend, investment_rate)
```

| Computed Stage | Conditions | Effect |
|---------------|------------|--------|
| Development | age < 12 months, occupancy rising | +10% growth rate bonus |
| Growth | occupancy > 0.7, density upgrades occurring | Normal growth |
| Stability | occupancy 0.5-0.8, no upgrades for 24+ months | Neutral |
| Decline | occupancy < 0.4, avg age > 60 months, no investment | -20% desirability, accelerated dereliction |
| Renewal | new construction or upgrade in declining area | +15% desirability for 12 months (investment momentum) |

#### 2. Gentrification Pressure

Compute rent-gap analog per tile:

```
rent_gap(tile) = potential_density_value(tile) - current_density_value(tile)
```

Where `potential_density_value` is determined by the tile's proximity to center of mass, transit, and infrastructure quality — what density *could* develop there. When `rent_gap > threshold`, the tile gets a "gentrification pressure" modifier that:

- Accelerates density upgrades
- Displaces existing low-density residents (population temporarily drops before climbing higher)
- Spreads to adjacent tiles (frontier effect)

#### 3. Growth Boundary

Define a buildable radius from the initial settlement center:

```
max_buildable_radius = base_radius + boundary_expansions × expansion_increment
```

- Tiles outside the boundary cannot be zoned
- Expanding the boundary costs money and has a cooldown period
- Constraining the boundary forces infill and density upgrades
- Growth boundary pressure: `P(density_upgrade) *= 1 + (population / boundary_capacity)` — as population approaches the boundary's capacity, upgrade pressure increases

#### 4. Sector Development Along Roads

Weight density upgrade probability by road connectivity:

```
road_accessibility(tile) = Σ (road_capacity(r) × e^(-dist(tile, r) / road_influence_radius))
```

Where the sum is over nearby road segments. Tiles along high-capacity roads (paved, future arterials) get higher upgrade probability, producing Hoyt-style sector development. This would emerge naturally if arterial roads carry a higher accessibility weight than dirt roads.

#### 5. Sprawl Penalty

If the city has low average density relative to its spatial extent:

```
sprawl_score = total_developed_area / (total_population × density_target)
```

When `sprawl_score > 1.0`, infrastructure maintenance costs increase proportionally. This creates economic pressure to build compactly — mirroring the real fiscal costs of sprawl documented by Ewing and Hamidi.

### Implementation Priority

| Mechanic | Complexity | Dependency | Priority |
|----------|-----------|------------|----------|
| Sprawl penalty | Low | Existing density system | High — simple ratio, immediate gameplay impact |
| Sector development via road weighting | Low | Road system already exists | High — modifies existing `upgradeProb()` input |
| Neighborhood lifecycle score | Medium | Building age tracking exists | Medium — enriches existing dereliction system |
| Growth boundary | Medium | Map edge mechanics | Medium — significant gameplay change, needs playtesting |
| Gentrification pressure | High | Lifecycle score, desirability system | Low — interesting but complex; depends on lifecycle being in place |

---

## Cross-References

- [Urban Density Gradients](./urban-density-gradients.md) — Clark's Law, exponential decay, center-of-mass heuristics
- [Transit-Oriented Development](./transit-oriented-development.md) — TOD patterns, transit anchors, mono-to-polycentric city evolution
- [Land Use and Zoning](./land-use-and-zoning.md) — Zoning regulations constrain and shape natural density gradients
- [Housing](./housing.md) — Housing market dynamics, filtering, affordability
- [Transportation and Traffic](./transportation-and-traffic.md) — Transit modes, road networks, commute patterns

---

## Sources

### Foundational Models

- Alonso, W. (1964). *Location and Land Use*. Harvard University Press.
- Muth, R. (1969). *Cities and Housing*. University of Chicago Press.
- Mills, E. (1967). "An aggregative model of resource allocation in a metropolitan area." *American Economic Review*.
- Clark, C. (1951). "Urban population densities." *Journal of the Royal Statistical Society*.
- Burgess, E. (1925). "The growth of the city." In *The City*. University of Chicago Press.
- Hoyt, H. (1939). *The Structure and Growth of Residential Neighborhoods in American Cities*. Federal Housing Administration.
- Harris, C. and Ullman, E. (1945). "The nature of cities." *Annals of the American Academy of Political and Social Science*.
- Garreau, J. (1991). *Edge City: Life on the New Frontier*. Doubleday.
- Lang, R. (2003). *Edgeless Cities: Exploring the Elusive Metropolis*. Brookings Institution Press.

### Empirical Studies

- Liotta, C., Viguie, V., and Lepetit, Q. (2022). ["Testing the monocentric standard urban model in a global sample of cities."](https://arxiv.org/pdf/2111.02112)
- Arribas-Bel, D. and Sanz-Gracia, F. (2014). ["The validity of the monocentric city model in a polycentric age."](https://www.tandfonline.com/doi/full/10.1080/02723638.2014.940693) *Urban Geography*.
- McDonald, J. and Bowman, H. (1979). "Land value functions: A reevaluation." *Journal of Urban Economics*.
- Ewing, R. and Hamidi, S. (2014). ["Measuring Urban Sprawl and Validating Sprawl Measures."](https://gis.cancer.gov/tools/urban-sprawl/sprawl-report-short.pdf) Smart Growth America.
- Hamidi, S. and Ewing, R. (2015). ["Measuring Sprawl and Its Impacts."](https://journals.sagepub.com/doi/10.1177/0739456X14565247) *Journal of Planning Education and Research*.

### Gentrification and Neighborhood Change

- Glass, R. (1964). *London: Aspects of Change*. MacGibbon & Kee.
- Smith, N. (1979). ["Gentrification and the Rent Gap."](https://www.academia.edu/8988092/Gentrification_and_the_Rent_Gap) *Annals of the Association of American Geographers*.
- Clay, P. (1979). *Neighborhood Renewal*. Lexington Books.
- Hoover, E. and Vernon, R. (1959). *Anatomy of a Metropolis*. Harvard University Press.
- Metzger, J. (2000). ["Planned abandonment: The neighborhood life-cycle theory and national urban policy."](https://www.researchgate.net/publication/237470090_Planned_Abandonment_The_Neighborhood_Life-Cycle_Theory_and_National_Urban_Policy) *Housing Policy Debate*.

### Growth Boundaries and Smart Growth

- [The Effects of Portland's Urban Growth Boundary on Housing Prices](https://www.tandfonline.com/doi/abs/10.1080/01944360608976742) — *Journal of the American Planning Association* (2006)
- [Smart Growth and Infill Brownfields Redevelopment](https://www.epa.gov/smartgrowth/smart-growth-and-infill-brownfields-redevelopment) — US EPA
- [About Smart Growth](https://www.epa.gov/smartgrowth/about-smart-growth) — US EPA, 10 Principles
- Anas, A., Arnott, R., and Small, K. (1998). ["Urban Spatial Structure."](https://sites.socsci.uci.edu/~ksmall/JEL%20Paper.pdf) *Journal of Economic Literature*.

### Urban Geography Overviews

- [The Characteristics, Causes, and Consequences of Sprawling Development](https://www.nature.com/scitable/knowledge/library/the-characteristics-causes-and-consequences-of-sprawling-103014747/) — *Nature Education Knowledge*
- [The Burgess Urban Land Use Model](https://transportgeography.org/contents/chapter8/urban-land-use-transportation/burgess-land-use/) — *Geography of Transport Systems*
- [Municipal Annexation in the United States](https://en.wikipedia.org/wiki/Municipal_annexation_in_the_United_States) — Wikipedia
- Giuliano, G. et al. ["Metropolitan Spatial Trends in Employment and Housing."](https://onlinepubs.trb.org/onlinepubs/sr/sr298giuliano.pdf) Transportation Research Board.
