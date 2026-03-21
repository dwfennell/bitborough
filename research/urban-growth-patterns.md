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
- [Redlining and Long-Term Effects](#redlining-and-long-term-effects)
- [Urban Renewal Failures](#urban-renewal-failures)
- [Public Housing Concentration Effects](#public-housing-concentration-effects)
- [Gentrification](#gentrification)
- [Neighborhood Lifecycle](#neighborhood-lifecycle)
- [Declining City Revitalization](#declining-city-revitalization)
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

## Redlining and Long-Term Effects

### HOLC Grading System (1935-1940)

The Home Owners' Loan Corporation (HOLC), a New Deal agency, created "Residential Security Maps" for 239 cities between 1935 and 1940. These maps graded neighborhoods on a four-tier scale:

| Grade | Color | Label | Criteria |
|-------|-------|-------|----------|
| A | Green | "Best" | New, homogeneous, in-demand; exclusively white, native-born residents |
| B | Blue | "Still Desirable" | Fully developed, stable; "American business and professional men" |
| C | Yellow | "Definitely Declining" | Aging housing, infiltration of "lower grade" population; often immigrant or mixed-race |
| D | Red | "Hazardous" | Oldest housing, "detrimental influences"; African-American or heavily minority |

The maps were used by the Federal Housing Administration (FHA) and private lenders to guide mortgage underwriting. Neighborhoods graded "D" were effectively cut off from conventional mortgage credit — a practice that became known as **redlining**. The FHA Underwriting Manual explicitly stated that "incompatible racial groups" should not share neighborhoods and recommended restrictive covenants as a tool to maintain racial homogeneity.

### Mechanism of Disinvestment

Redlining created a self-reinforcing cycle of decline:

1. **Credit denial** — Banks refused conventional mortgages in D-graded areas. Residents could only access predatory contract sales or exploitative land installment contracts.
2. **Maintenance collapse** — Without access to home improvement loans, property owners could not maintain or upgrade housing stock.
3. **Capital flight** — Insurance companies, retailers, and employers followed the credit maps, withdrawing services from redlined areas.
4. **Tax base erosion** — Declining property values reduced municipal revenue, leading to reduced public services (schools, parks, sanitation).
5. **Speculative exploitation** — Speculators bought properties cheaply in redlined areas and extracted rents without maintenance investment, accelerating physical deterioration.

### Persistence: 74% Still Disadvantaged

The National Coalition for Reinvestment in Communities (NCRC) analyzed 114 metropolitan areas in 2018, comparing 1930s HOLC maps to contemporary census data. The findings demonstrate extraordinary persistence:

- **74% of neighborhoods graded "Hazardous" (D) in the 1930s remain low-to-moderate income today**
- **64% of D-graded areas are majority-minority neighborhoods today**
- Cities with more minority-occupied D-graded areas show significantly greater overall economic inequality and are associated with "hypersegregation"

Appel and Nickerson (2016), published in the *American Economic Journal: Economic Policy*, found the HOLC maps could account for **15-30% of the gap** in African-American population share and homeownership between D-graded and C-graded neighborhoods, and **40% of the gap in house values**, measured over the 1950-1980 period. The effects persisted well after the Fair Housing Act of 1968 formally outlawed discriminatory lending.

### Multi-Generational Wealth Gap

The homeownership channel is central to understanding the wealth gap. For most American families, home equity represents the primary store of wealth. By denying mortgage access to Black families during the 1940s-1960s — precisely the decades when suburban homeownership generated enormous returns — redlining prevented an entire generation from building equity. Aaronson, Hartley, and Mazumder (2021) found that growing up on the lower-graded side of a HOLC boundary had economically large effects on life chances for cohorts born *decades after* the maps were drawn, with magnitudes typically 4-12% of an outcome's sample mean.

The racial wealth gap quantifies the cumulative damage: the median white family holds roughly 6-8 times the wealth of the median Black family, a ratio that has remained stubbornly persistent since reliable measurement began.

### Health and Environmental Consequences

The effects of redlining extend well beyond economics. A scoping review in the *Journal of the National Medical Association* (Nardone et al., 2022) synthesized findings across dozens of studies:

| Health Metric | Finding |
|--------------|---------|
| Life expectancy | 3.6-4.8 years lower in D-graded vs. A-graded tracts |
| Asthma prevalence | 8.6% (A-graded) vs. 10.7% (D-graded) |
| COPD prevalence | 5.0% (A-graded) vs. 7.4% (D-graded) |
| Hypertension | 29.3% (A-graded) vs. 34.1% (D-graded) |
| Diabetes mortality | Significantly higher in lower-graded areas |
| COVID-19 risk factors | Higher prevalence in historically redlined neighborhoods |

D-graded areas have consistently higher exposure to PM2.5 particulate matter and NO2 pollution. Historically redlined neighborhoods are disproportionately located near Superfund sites, industrial facilities, and highway corridors — a pattern that reflects how environmental disamenities were deliberately sited in communities with reduced political power.

### The Redlining-to-Gentrification Pipeline

Redlining created the conditions for later gentrification by suppressing land values for decades. As Smith's rent gap theory predicts, the prolonged disinvestment in centrally located D-graded neighborhoods created enormous gaps between capitalized and potential ground rent. When demographic and cultural shifts made urban living desirable again (starting in the 1990s), these neighborhoods became prime targets for reinvestment — often displacing the very communities that had endured decades of imposed deprivation.

**Simulation relevance:** Redlining demonstrates how external credit constraints can lock neighborhoods into decline independent of their physical characteristics. In Bitborough, a "disinvestment zone" mechanic could model this: tiles marked by a negative modifier (from policy, pollution, or adjacency to industrial disamenities) receive reduced upgrade probability and accelerated dereliction — and the modifier persists even after the original cause is removed, requiring active player intervention to break the cycle. This would teach players that neglect compounds and that recovery requires deliberate reinvestment, not just the removal of the original harm.

---

## Urban Renewal Failures

### The Federal Urban Renewal Program (1949-1974)

Title I of the Housing Act of 1949 established the federal urban renewal program with an aspirational goal: "a decent home and a suitable living environment for every American family." The mechanism was straightforward — the federal government would provide two-thirds of the cost for local authorities to acquire "blighted" areas through eminent domain, demolish existing structures, and sell the cleared land to private developers at a write-down.

In practice, the program became one of the most destructive episodes in American urban history.

### Scale of Destruction

Between 1949 and 1974, when the program was formally ended by the Housing and Community Development Act:

| Metric | Figure |
|--------|--------|
| Total projects funded | Over 2,000 |
| Acres cleared | 37,200+ (1949-1967 alone) |
| Housing units demolished | 404,000+ (by 1967) |
| People displaced | Over 1,000,000 |
| Total federal expenditure | Exceeding $50 billion (inflation-adjusted) |
| Peak annual displacement | 50,000-66,000 families per year in mid-1960s |

### "Negro Removal"

The novelist James Baldwin gave the program its most enduring epithet in 1963: "Urban renewal means Negro removal. That is what it means." The data confirmed his assessment:

- **Two-thirds or more** of displaced residents in cities like Philadelphia, Detroit, and Atlanta were people of color
- In Newark, **77% of those displaced** by urban renewal were Black — in a city that was only 34.1% Black in 1960
- A 1961 study of renewal projects in 41 cities found that **60% of displaced tenants were merely relocated to other slums**; in large cities the proportion exceeded 70%
- The Federal-Aid Highway Act of 1956 compounded the damage — highway construction displaced over **one million** additional low-income people of color by routing interstates through the hearts of Black neighborhoods (e.g., the Cross Bronx Expressway, I-81 through Syracuse, I-95 through Overtown in Miami)

### The Demolition-Reconstruction Gap

A central failure was that destruction far outpaced rebuilding. Of the 37,200 acres cleared between 1949 and 1967, only 17,400 acres had been or were being redeveloped. Cities were left with vast empty lots — "urban prairies" — where neighborhoods had once stood. When interest rates rose and federal funding contracted in the mid-1970s, many cleared sites remained vacant for decades.

Specific examples illustrate the pattern:

- **Boston's West End** — A thriving immigrant neighborhood of 7,000 residents demolished in 1958-1960; replaced by luxury high-rises that housed none of the original residents. Herbert Gans documented the community's destruction in *The Urban Villagers* (1962).
- **St. Louis's Mill Creek Valley** — 800 acres cleared in the late 1950s, displacing 20,000 residents (95% Black). Much of the land sat vacant for over a decade.
- **San Francisco's Western Addition** — Nearly 5,000 families (over 20,000 people, majority people of color) displaced over two decades of phased demolition.
- **Newark's Central Ward** — Massive clearance for a medical school and highway contributed directly to the 1967 Newark riots.

### Why Some Cleared Areas Revitalized and Others Did Not

The outcomes diverged sharply. Factors that predicted recovery vs. persistent vacancy:

| Factor | Favored Revitalization | Led to Persistent Vacancy |
|--------|----------------------|--------------------------|
| Location | Adjacent to expanding CBD or university | Isolated from employment centers |
| Institutional anchor | Hospital, university, or government complex nearby | No anchor to attract investment |
| Market timing | Cleared during economic expansion | Cleared during or before recession |
| Replacement housing | Mixed-income development with some original residents retained | Pure luxury or institutional development |
| Community resistance | Strong organized opposition forced compromise and community benefits | Weak resistance allowed total displacement |
| Infrastructure investment | Transit, parks, and public facilities accompanied redevelopment | Cleared land left as parking lots or vacant |

Cities like Philadelphia (Society Hill) and Washington DC (Southwest) eventually saw cleared areas gentrify into wealthy neighborhoods — but only after decades of vacancy and at the cost of permanent displacement of the original communities. Cities like East St. Louis and Camden saw cleared areas remain vacant or underutilized for generations.

### Legacy and Lessons

The urban renewal era demonstrated several principles relevant to simulation:

1. **Demolition is fast; rebuilding is slow and uncertain** — political will and funding for demolition exceeded the capacity for reconstruction
2. **Displacement destroys social capital** — the loss of churches, schools, social clubs, and neighbor networks could not be replaced even when physical housing was eventually rebuilt
3. **"Blight" is a political designation** — areas labeled "blighted" were often functioning communities whose residents lacked political power to resist clearance
4. **Top-down planning without community input produces the worst outcomes** — the most destructive projects had the least resident participation

**Simulation relevance:** Urban renewal maps to a "mass bulldoze" mechanic. If a player demolishes a large area at once, the game could model the reconstruction gap — cleared tiles do not automatically attract new development; they sit vacant unless the player actively invests in infrastructure and creates demand pull. A "community disruption" penalty could reduce desirability in the surrounding area when too many adjacent tiles are demolished simultaneously, reflecting the social-capital destruction documented in the historical record. The lesson for gameplay: surgical, incremental redevelopment produces better outcomes than wholesale clearance.

---

## Public Housing Concentration Effects

### The High-Rise Era (1950s-1970s)

American public housing policy underwent a fateful shift in the 1950s. The Housing Act of 1949 funded massive construction, but local opposition (especially from white neighborhoods refusing to accept public housing) and cost pressures pushed construction toward high-density, high-rise towers concentrated in already-poor, already-segregated neighborhoods. The results became some of the most notorious failures in American urban policy.

### Landmark Failures

| Project | City | Units | Built | Demolished | Key Facts |
|---------|------|-------|-------|------------|-----------|
| Pruitt-Igoe | St. Louis | 2,870 | 1954 | 1972-1976 | 33 towers designed by Minoru Yamasaki (later architect of the World Trade Center); over two-thirds vacant by 1970; televised implosion in 1972 became an icon of modernist failure |
| Robert Taylor Homes | Chicago | 4,321 | 1962 | 1998-2007 | Largest public housing project in the US; 28 sixteen-story buildings stretching 2 miles along the Dan Ryan Expressway; subject to decades of gang violence, disinvestment, and infrastructure neglect |
| Cabrini-Green | Chicago | ~3,600 | 1942-1962 | 1995-2011 | Mix of rowhouses and 23 high-rises; located near Chicago's affluent Gold Coast; became a symbol of concentrated poverty adjacent to extreme wealth |

### Why Concentration Failed

The concentration of public housing in high-rise towers within already-distressed neighborhoods produced compounding negative effects:

1. **Poverty concentration** — When nearly all residents are very low income, there are no employed role models, no informal job networks, and no mixed-income commercial activity to sustain local businesses.
2. **Social isolation** — High-rise design eliminated the "eyes on the street" natural surveillance that Jane Jacobs identified as essential to neighborhood safety. Long corridors, stairwells, and elevators became unmonitored spaces.
3. **Maintenance collapse** — Operating budgets were perpetually underfunded. The federal government funded construction but provided inadequate ongoing maintenance support. By the 1970s, many projects had broken elevators, non-functioning plumbing, and pest infestations.
4. **Political abandonment** — Residents of concentrated public housing had minimal political power. Municipal governments had little incentive to invest in maintenance when the residents could not exert electoral pressure.
5. **Stigma effects** — The address itself became a barrier to employment, credit, and social mobility.

### Scattered-Site vs. Clustered Housing

Research comparing scattered-site public housing (small buildings dispersed throughout a metropolitan area) to large concentrated projects consistently favors the scattered approach:

- Residents in scattered-site housing perceive neighbors as healthier and more socially active (24.7% of network members exercised regularly vs. 14.0% in clustered housing)
- Low-income women in scattered-site housing showed greater employment gains and networking benefits compared to women in poverty-concentrated environments
- Scattered-site housing avoids the stigma and social isolation of identifiable "projects"
- Neighborhood opposition ("NIMBYism") remains the primary barrier to scattered-site construction

### The HOPE VI Program (1992-2010)

HOPE VI (Housing Opportunities for People Everywhere) represented a fundamental policy reversal: instead of concentrating poverty, demolish the worst public housing projects and replace them with mixed-income communities. The program funded demolition of 96,200 public housing units and construction of 107,800 new mixed-income units.

Recent research from Opportunity Insights (Chetty et al., 2025) provides the most rigorous evidence yet on HOPE VI's effectiveness:

| Finding | Magnitude |
|---------|-----------|
| Income gain per year of childhood exposure | 2.77% increase in household income at age 30 |
| Impact of 5 years exposure (childhood) | 14% higher household income at age 30 |
| Adolescent exposure vs. early childhood | Impacts approximately 2x larger during adolescence |
| High-income surrounding neighborhood | ~$5,000/year earnings increase |
| Middle-income surrounding neighborhood | ~$1,700/year earnings increase |
| Low-income surrounding neighborhood | Near-zero effect |

The critical finding: **location matters enormously**. HOPE VI sites surrounded by high-income neighborhoods produced large gains because children gained access to better schools, safer streets, and employed adult role models. Sites surrounded by disadvantaged communities showed virtually no benefit — simply replacing the physical structures without changing the neighborhood context was insufficient.

### Moving to Opportunity (MTO) Experiment

The MTO experiment (1994-1998), conducted by HUD in five cities, randomly assigned public housing residents to receive vouchers for low-poverty neighborhoods, unrestricted vouchers, or no vouchers (control). The long-term results (Chetty, Hendren, and Katz, 2016) revealed:

- Children who moved to low-poverty neighborhoods **before age 13** earned **31% more** in their mid-twenties than the control group
- The lifetime earnings gain was approximately **$302,000 per child** (present value ~$99,000 at age 8)
- Moving as an **adolescent** produced slightly *negative* effects, possibly due to disruption of existing social networks
- **Adults** showed no economic gains from moving, but reported reduced violent crime exposure and greater subjective well-being

### Implications for Housing Policy

The convergent evidence from HOPE VI and MTO establishes that:

1. Where people live profoundly affects life outcomes, especially for children
2. Physical replacement of buildings is necessary but not sufficient — the surrounding neighborhood context determines outcomes
3. Poverty deconcentration works best when it provides access to genuinely high-opportunity neighborhoods, not merely different low-opportunity ones
4. Timing matters — children benefit most from early and sustained exposure to better environments

**Simulation relevance:** Public housing concentration maps to a mechanic where placing too many low-income residential buildings in a single cluster triggers a "concentration penalty" — reduced desirability, increased service costs, and accelerated decline. A scattered-site approach (distributing affordable housing across the city) would avoid this penalty. The HOPE VI findings suggest that redevelopment of failed housing should produce outcomes proportional to the quality of the surrounding neighborhood — replacing a derelict building in a thriving district yields better results than replacing one surrounded by other derelict buildings. This could be modeled as a "neighborhood quality multiplier" on redevelopment success.

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

### Waves of Gentrification

Hackworth and Smith (2001) introduced an influential wave framework, later extended by Lees, Slater, and Wyly (2008) and Aalbers (2019):

| Wave | Period | Key Actors | Characteristics |
|------|--------|-----------|----------------|
| First | 1950s-1970s | Individual pioneer gentrifiers | Sporadic, small-scale renovation; artists and bohemians in select neighborhoods; largely ignored by government |
| Second | 1970s-1980s | Small developers, early institutional capital | Gentrification becomes visible; linked to back-to-the-city movement; government begins subsidizing through tax incentives |
| Third | 1990s-2000s | Corporate developers, state policy | Large-scale, state-sponsored gentrification; public-private partnerships; entire neighborhoods transformed by plan |
| Fourth | 2000s-2010s | Global capital, financial instruments | Financialization of housing; securitization of rental income; gentrification as explicit policy goal |
| Fifth | 2010s-present | Platform capitalism, corporate landlords | Post-financial-crisis emergence of institutional landlords (buying foreclosed homes at scale); Airbnb-driven displacement; gentrification as "the urban materialisation of financialised capitalism" (Aalbers, 2019) |

Lees further developed the concept of **super-gentrification**: the re-gentrification of already-gentrified neighborhoods by ultra-wealthy in-movers (e.g., Brooklyn Heights in the 2000s, where finance-industry professionals displaced the artists and professionals who had gentrified the area in the 1970s-1980s).

### Quantitative Displacement Evidence

The empirical literature on gentrification-driven displacement is surprisingly contested. Studies vary widely depending on methodology, definition of gentrification, time period, and geographic scope.

**Studies finding limited displacement:**

- Freeman and Braconi (2004) analyzed seven gentrifying New York neighborhoods (Chelsea, Harlem, Lower East Side, Fort Greene, Park Slope, Williamsburg, Morningside Heights) from 1991-1999. They found that poor households in gentrifying neighborhoods were actually *less* likely to move than poor households in non-gentrifying neighborhoods. Poor families faced average rent increases of **25.1% over 8 years**, but many chose to stay in improving neighborhoods.
- Freeman (2005) expanded the analysis nationally using the Panel Study of Income Dynamics and found "no evidence" that gentrification increased displacement probability for renters or homeowners.
- Vigdor, Massey, and Rivlin (2002) found that low-income residents of Boston's gentrifying neighborhoods had longer tenure than those in non-gentrifying areas.

**Studies finding significant displacement:**

- Newman and Wyly (2006) criticized the above findings, arguing that survey-based methods systematically *undercount* displacement because displaced people leave the sample — you cannot interview someone who has already been pushed out. They found that 8-10% of recent movers in gentrifying New York neighborhoods reported being directly displaced.
- The NCRC's "Displaced by Design" report (2023) found that across US cities, neighborhoods that gentrified between 2000 and 2013 saw significant declines in Black population share, with an estimated 135,000 Black residents displaced from gentrifying census tracts in the 50 largest metro areas.
- Dragan, Ellen, and Glied (2019) used Medicaid records to track individual moves in New York and found that children in gentrifying neighborhoods were more likely to move to lower-performing school districts.

**The measurement problem:**

The disconnect between quantitative and qualitative evidence reflects fundamental measurement challenges:

| Method | What It Captures | What It Misses |
|--------|-----------------|----------------|
| Panel surveys (PSID, AHS) | Whether current residents moved | People who already left the sample; indirect displacement (not moving in because priced out) |
| Census tract comparison | Aggregate demographic change | Whether change reflects displacement vs. in-situ income growth vs. selective in-migration |
| Administrative data (Medicaid, tax records) | Individual-level moves for those in the system | People not in administrative databases; reasons for moving |
| Qualitative interviews | Lived experience, mechanisms, community effects | Small sample sizes, selection bias |

### Income Changes in Gentrifying Neighborhoods

Gentrifying neighborhoods show characteristic income trajectories:

- **Median household income** in gentrifying tracts typically rises **40-80%** faster than the metro average over a 10-20 year period (varies by city and wave)
- Income growth is driven primarily by **compositional change** (higher-income in-movers replacing lower-income out-movers) rather than incumbent income growth
- One study tracking incumbent workers in gentrifying neighborhoods found **no adverse effects** on their individual income trajectories — those who stayed did not earn less. The damage is to those who leave and to the community fabric, not to remaining individuals' wages.
- Rent-to-income ratios for remaining low-income renters increase sharply, creating "cost-burdened" households spending more than 30% (often more than 50%) of income on housing

### Timeline of a Gentrifying Neighborhood

Synthesizing Clay's stages with contemporary evidence, a typical gentrification timeline looks approximately like:

| Years | Phase | Visible Signs | Rent Trajectory |
|-------|-------|--------------|----------------|
| 0-3 | Pioneer entry | Coffee shops, art galleries in former industrial spaces; scattered renovation | Flat to modest increase (5-10% above trend) |
| 3-7 | Expansion | Visible renovation wave; real estate media attention; "up and coming" designation; new restaurants | Accelerating (15-30% above baseline) |
| 7-15 | Transformation | Chain retail replaces local businesses; condo conversions; zoning variances for density; original commercial tenants priced out | Rapid increase (50-100%+ from pre-gentrification baseline) |
| 15-25 | Maturation | Neighborhood fully transformed; luxury development; even early gentrifiers may be priced out by super-gentrification | Plateau at new high level; neighborhood becomes "established" |

**Simulation relevance:** Gentrification maps to a scenario where derelict low-density buildings near the city center are replaced by medium/high-density construction as demand recovers. The rent-gap formula could drive a "reinvestment pressure" score on neglected central tiles, creating waves of renewal that push low-income residents outward. The quantitative evidence suggests modeling displacement as a gradual population-composition shift rather than sudden mass eviction — the population count may remain stable or even increase, but the *character* of the population changes. For gameplay, a "displacement counter" could track the number of low-income residents pushed out over time, serving as both a realism metric and a scoring dimension (players must balance growth with equity).

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

## Declining City Revitalization

### The Shrinking Cities Problem

Between 1950 and 2010, many major American cities lost more than half their peak populations:

| City | Peak Population | Peak Year | 2010 Population | % Loss |
|------|----------------|-----------|-----------------|--------|
| Detroit | 1,849,568 | 1950 | 713,777 | -61.4% |
| St. Louis | 856,796 | 1950 | 319,294 | -62.7% |
| Cleveland | 914,808 | 1950 | 396,815 | -56.6% |
| Pittsburgh | 676,806 | 1950 | 305,704 | -54.8% |
| Buffalo | 580,132 | 1950 | 261,310 | -55.0% |
| Baltimore | 949,708 | 1950 | 620,961 | -34.6% |
| Gary, IN | 178,320 | 1960 | 80,294 | -55.0% |
| Youngstown, OH | 166,689 | 1930 | 66,982 | -59.8% |

The causes follow a common pattern: deindustrialization (loss of manufacturing base), suburbanization accelerated by highway construction and white flight, metropolitan fragmentation that locked cities out of suburban tax revenue, and in many cases the compounding effects of redlining and urban renewal.

### What Doesn't Work

Decades of revitalization attempts have identified strategies that consistently underperform:

- **Convention centers and sports stadiums** — The "build it and they'll come" approach has been extensively studied. Research consistently shows stadiums and convention centers do not generate net new economic activity for the metro area; they redistribute spending from other entertainment and shift public money to private team owners. Cities that bet on mega-projects (e.g., Gary, Indiana's Genesis Convention Center) saw no measurable recovery.
- **Tax incentive bidding wars** — Competing with other jurisdictions by offering tax abatements to attract large employers produces a race to the bottom. Even when a firm relocates, the lost tax revenue often offsets the employment gains. Amazon's HQ2 search (2017-2018) demonstrated the extremes of this dynamic.
- **Demolition without a plan** — Clearing blighted areas without a reconstruction strategy (the urban renewal lesson) leaves vacant lots that further depress surrounding property values.
- **Population growth targets** — Setting goals to return to peak population is almost always unrealistic and leads to over-building infrastructure for a population that never arrives.

### What Works: Evidence-Based Strategies

#### Anchor Institution Strategy ("Eds and Meds")

Universities and hospitals are "anchored" — they cannot relocate to the suburbs. This makes them uniquely valuable partners for urban revitalization. The most studied example is the **University of Pennsylvania's West Philadelphia Initiatives** (launched 1996):

- Penn shifted nearly **$100 million annually** in procurement to West Philadelphia businesses
- In FY2015, Penn spent **$122 million with local businesses** (13% of total purchasing)
- Penn and its Health System hired **1,572 local residents** (47.5% of all new hires)
- University City District trained over **600 local residents** for jobs at Penn and other anchors, with **90% connected to employment**
- Surrounding neighborhoods saw significant increases in property values, commercial activity, and population

Other anchor-driven recoveries include the Cleveland Clinic's role in Cleveland's Health-Tech Corridor and Johns Hopkins' partnerships in East Baltimore. The strategy works because it leverages existing institutional spending (procurement, hiring, real estate) toward local economic development without requiring new public subsidy.

However, anchor strategies carry risks: they can drive gentrification in surrounding neighborhoods, and the institution's interests may not align with community needs (the University of Chicago's fraught relationship with Woodlawn is a cautionary example).

#### Creative Economy and Cultural Districts

Arts and cultural strategies work through multiple channels:

1. **Pioneer stage activation** — Artists occupy cheap space in declining neighborhoods, providing the "pioneer gentrifier" function identified in Clay's model but with community-building benefits
2. **Placemaking** — Public art, performance spaces, and cultural events create distinctive neighborhood identity that attracts visitors and investment
3. **Small business incubation** — Creative enterprises (studios, galleries, maker spaces) fill vacant commercial spaces with low-capital-requirement businesses
4. **Tourism and external spending** — Cultural districts attract spending from outside the neighborhood

Examples with measured impact:
- **Pittsburgh's Lawrenceville** — Former industrial neighborhood transformed through artist studios and maker spaces; population stabilized after decades of decline; median home values increased significantly
- **Detroit's Heidelberg Project** — Vacant lot art installations in a severely blighted neighborhood attracted international attention and tourism
- **Cleveland's Tremont** — Victorian neighborhood revitalized through a mix of arts galleries, restaurants, and walkable streets; population has stabilized

The limitation: cultural strategies alone cannot overcome fundamental economic decline. They work best as complements to anchor institution and infrastructure strategies, not as standalone solutions.

#### Smart Decline and Right-Sizing

A paradigm shift emerged in the 2000s: rather than trying to grow back to peak population, some cities adopted "smart decline" — strategies to improve quality of life for the current, smaller population.

Key approaches:

- **Right-sizing infrastructure** — Consolidating city services (schools, fire stations, utilities) to match actual population rather than maintaining infrastructure built for 2-3x the current residents
- **Land banking** — Public acquisition of vacant and abandoned properties to control disposition, prevent speculation, and assemble parcels for strategic reuse. Cleveland and Detroit have both established land banks that manage thousands of properties.
- **Green infrastructure** — Converting vacant lots to community gardens, parks, urban farms, and stormwater management green space. Youngstown, Ohio was an early adopter of this approach in its Youngstown 2010 plan (notable for being the first US comprehensive plan to explicitly plan for a smaller population).
- **Neighborhood consolidation** — Encouraging residents in the most sparsely populated areas to relocate to denser, better-serviced neighborhoods. Detroit's "Detroit Work Project" plan identified nine neighborhoods for concentration of investment and services. This is politically contentious because it can feel like managed abandonment of some areas.

#### Population Attraction Strategies

Cities that have partially recovered often leveraged specific population-attraction mechanisms:

- **Lower cost of living** — Pittsburgh's relative affordability compared to coastal cities attracted remote workers and young professionals, especially post-2020
- **Quality-of-life investments** — Pittsburgh converted polluted riverfronts into recreational areas and abandoned steel mills into heritage parks, fundamentally changing the city's image
- **Immigration** — Many shrinking cities have been partially stabilized by immigrant communities. Refugee resettlement has revitalized neighborhoods in Buffalo, Cleveland, and Utica, NY
- **University retention** — Strategies to keep graduates of local universities (Carnegie Mellon, Case Western Reserve, University of Pittsburgh) in the region through startup incubators and quality-of-life investments

### Comparative Outcomes

Among the major shrinking cities, Pittsburgh is the most frequently cited success story, though the recovery is partial and uneven:

| City | Recovery Trajectory | Key Factor |
|------|-------------------|------------|
| Pittsburgh | Population stabilizing; tech/medical economy growing; gentrification in select neighborhoods | Strong anchor institutions (CMU, Pitt, UPMC); quality-of-life investments; tech industry |
| Cleveland | Population decline slowed to near-zero; some neighborhood revival | Cleveland Clinic anchor; lakefront investment; immigrant communities |
| Detroit | Severe decline continued through 2013 bankruptcy; selective recovery in core neighborhoods | Auto industry restructuring; land banking; extreme right-sizing challenges |
| St. Louis | Continued decline; city-county division prevents metropolitan coordination | Extreme fragmentation; no dominant anchor; loss of corporate headquarters |
| Buffalo | Modest stabilization; medical campus expansion | Refugee resettlement; waterfront development; lower cost of living |

**Simulation relevance:** Declining city mechanics could model population loss and the player's choices about how to respond. Key mechanics: (1) **Right-sizing** — the player can choose to contract services to a smaller area, reducing maintenance costs but abandoning peripheral neighborhoods; (2) **Anchor investment** — placing a university or hospital building creates a strong localized demand pull that resists decline; (3) **Land banking** — a mechanic to acquire derelict properties cheaply and hold them for future strategic development rather than letting them drag down surrounding values; (4) **Smart decline scoring** — rather than penalizing population loss per se, the game could score on quality-of-life metrics for the *existing* population, rewarding efficient right-sizing over futile growth chasing.

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
| Redlining / disinvestment | (Not yet modeled) | Persistent negative modifiers on neglected tiles that compound over time |
| Urban renewal | Bulldoze mechanic | Mass demolition clears tiles but does not guarantee reconstruction |
| Housing concentration | (Not yet modeled) | Clustering low-income buildings could trigger concentration penalties |
| Gentrification displacement | (Not yet modeled) | Population composition shift during density upgrades in formerly declined areas |
| Declining city dynamics | Dereliction cascade | Cascading building decline when population drops; recovery requires active investment |

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

#### 6. Disinvestment Persistence (Redlining Model)

Track a per-tile "disinvestment score" that accumulates when tiles are adjacent to pollution, lack infrastructure, or have prolonged low occupancy:

```
disinvestment(tile, t) = disinvestment(tile, t-1) × decay_rate + new_negative_factors(tile, t)
```

Key properties:
- The score accumulates faster than it decays (asymmetric dynamics) — reflecting how disinvestment compounds
- High disinvestment reduces upgrade probability and increases dereliction rate
- Removal of the original cause (e.g., closing a polluting factory) does not instantly reset the score — it decays slowly
- Active investment (new infrastructure, transit placement, building renovation) accelerates decay
- Teaches the core redlining lesson: neglect has long-lasting consequences that require deliberate intervention to reverse

#### 7. Mass Demolition Penalty (Urban Renewal Model)

When the player demolishes more than N adjacent tiles in a single action or within a short time window:

```
disruption_radius = sqrt(tiles_demolished) × disruption_factor
disruption_penalty(nearby_tile) = base_penalty × e^(-dist / disruption_radius)
```

- Surrounding tiles receive a temporary desirability penalty (reflecting community disruption)
- Cleared tiles do not automatically attract new development — they require infrastructure investment or adjacency to existing demand
- The penalty scales with the *concentration* of demolition — demolishing 10 scattered tiles has less impact than demolishing 10 contiguous tiles
- Encourages incremental, surgical redevelopment over wholesale clearance

#### 8. Housing Concentration Penalty

When low-income residential buildings cluster beyond a threshold:

```
concentration_score(area) = low_income_units(area) / total_units(area)
```

When `concentration_score > threshold`:
- Desirability decreases for the area (reflecting poverty concentration effects)
- Service costs increase (more policing, maintenance per unit)
- Upgrade probability drops (no market demand for densification in deeply disadvantaged clusters)

Scattered placement of affordable housing across the city avoids this penalty and produces better outcomes — directly modeling the HOPE VI and MTO findings.

#### 9. Anchor Institution Demand Pull

University and hospital buildings (if added) create a localized demand pull that:
- Resists dereliction in surrounding tiles (institutional employment provides stable demand)
- Boosts commercial zone viability (workers need services)
- Partially buffers against population decline (anchor employment is recession-resistant)
- Creates a "procurement radius" within which commercial buildings get a revenue bonus

```
anchor_pull(tile) = Σ (anchor_strength(a) × e^(-dist(tile, a) / anchor_radius))
```

#### 10. Right-Sizing / Smart Decline Mode

When total city population drops below a threshold (e.g., 60% of peak):
- The game offers a "right-sizing" action: consolidate services to a smaller area
- Tiles outside the consolidated area have reduced service costs but also reduced desirability
- Scoring shifts from population growth to quality-of-life metrics for existing residents
- Land banking becomes available: acquire derelict tiles cheaply to hold for future strategic use

### Implementation Priority

| Mechanic | Complexity | Dependency | Priority |
|----------|-----------|------------|----------|
| Sprawl penalty | Low | Existing density system | High — simple ratio, immediate gameplay impact |
| Sector development via road weighting | Low | Road system already exists | High — modifies existing `upgradeProb()` input |
| Mass demolition penalty | Low | Bulldoze mechanic exists | High — simple adjacency check, discourages unrealistic play |
| Disinvestment persistence | Medium | Building age tracking exists | Medium — enriches dereliction with historical memory |
| Neighborhood lifecycle score | Medium | Building age tracking exists | Medium — enriches existing dereliction system |
| Growth boundary | Medium | Map edge mechanics | Medium — significant gameplay change, needs playtesting |
| Housing concentration penalty | Medium | Residential building tracking | Medium — straightforward ratio calculation |
| Anchor institution demand pull | Medium | Requires university/hospital buildings | Medium — depends on new building types |
| Gentrification pressure | High | Lifecycle score, desirability system | Low — interesting but complex; depends on lifecycle being in place |
| Right-sizing / smart decline | High | Population tracking, scoring system | Low — requires significant new UI and scoring mechanics |

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
- Hackworth, J. and Smith, N. (2001). "The changing state of gentrification." *Tijdschrift voor Economische en Sociale Geografie*.
- Lees, L., Slater, T., and Wyly, E. (2008). *Gentrification*. Routledge.
- Aalbers, M. (2019). ["Introduction to the Forum: From Third to Fifth-Wave Gentrification."](https://onlinelibrary.wiley.com/doi/abs/10.1111/tesg.12332) *Tijdschrift voor Economische en Sociale Geografie*.
- Freeman, L. and Braconi, F. (2004). ["Gentrification and Displacement: New York City in the 1990s."](https://www.tandfonline.com/doi/abs/10.1080/01944360408976337) *Journal of the American Planning Association*.
- Freeman, L. (2005). ["Displacement or Succession? Residential Mobility in Gentrifying Neighborhoods."](https://ds4ps.org/cpp-528-spr-2020/articles/gentrification/displacement-or-succession.pdf) *Urban Affairs Review*.
- Newman, K. and Wyly, E. (2006). "The Right to Stay Put, Revisited: Gentrification and Resistance to Displacement in New York City." *Urban Studies*.
- NCRC. (2023). ["Displaced by Design: Fifty Years of Gentrification and Black Cultural Displacement in US Cities."](https://ncrc.org/displaced-by-design/)
- [Displacement of Lower-Income Families in Urban Areas Report](https://www.huduser.gov/portal/sites/default/files/pdf/displacementreport.pdf) — HUD USER.
- Hoover, E. and Vernon, R. (1959). *Anatomy of a Metropolis*. Harvard University Press.
- Metzger, J. (2000). ["Planned abandonment: The neighborhood life-cycle theory and national urban policy."](https://www.researchgate.net/publication/237470090_Planned_Abandonment_The_Neighborhood_Life-Cycle_Theory_and_National_Urban_Policy) *Housing Policy Debate*.

### Redlining and Discriminatory Housing Policy

- Aaronson, D., Hartley, D., and Mazumder, B. (2021). ["The Effects of the 1930s HOLC 'Redlining' Maps."](https://www.aeaweb.org/articles?id=10.1257/pol.20190414) *American Economic Journal: Economic Policy*.
- NCRC. (2018). ["HOLC 'Redlining' Maps: The Persistent Structure of Segregation and Economic Inequality."](https://ncrc.org/holc/)
- Aaronson, D. et al. (2022). ["The Long-run Effects of the 1930s Redlining Maps on Children."](https://www2.census.gov/ces/wp/2022/CES-WP-22-56.pdf) US Census Bureau Working Paper.
- Nardone, A. et al. (2022). ["The Relationship of Historical Redlining with Present-Day Neighborhood Environmental and Health Outcomes: A Scoping Review."](https://pmc.ncbi.nlm.nih.gov/articles/PMC9342590/) *Journal of the National Medical Association*.
- Lane, H.M. et al. (2022). ["Historical Neighborhood Redlining and Contemporary Environmental Racism."](https://pmc.ncbi.nlm.nih.gov/articles/PMC10427113/)
- [HOLC Redlining and Neighborhood Health](https://ncrc.org/holc-health/) — NCRC.

### Urban Renewal

- Gans, H. (1962). *The Urban Villagers*. Free Press.
- Anderson, M. (1964). *The Federal Bulldozer*. MIT Press.
- [The Failure of Urban Renewal](https://www.commentary.org/articles/herbert-gans/the-failure-of-urban-renewal/) — Herbert Gans, *Commentary Magazine* (1965).
- [Urban Renewal](https://en.wikipedia.org/wiki/Urban_renewal) — Wikipedia.
- [Maps Show How Tearing Down City Slums Displaced Thousands](https://www.nationalgeographic.com/history/article/urban-renewal-projects-maps-united-states) — National Geographic.
- [Tearing Down Black America](https://www.bostonreview.net/articles/brent-cebul-tearing-down-black-america/) — Brent Cebul, *Boston Review*.
- [The Creation of the US Federal Urban Renewal Program](https://thewestendmuseum.org/history/era/new-boston/the-creation-of-the-us-federal-urban-renewal-program/) — West End Museum.

### Public Housing and Poverty Deconcentration

- Chetty, R. et al. (2025). ["Creating High-Opportunity Neighborhoods: Evidence from the HOPE VI Program."](https://opportunityinsights.org/wp-content/uploads/2025/09/HopeVI_Paper.pdf) NBER Working Paper.
- Chetty, R., Hendren, N., and Katz, L. (2016). ["The Effects of Exposure to Better Neighborhoods on Children: New Evidence from the Moving to Opportunity Experiment."](https://scholar.harvard.edu/files/lkatz/files/chk_aer_mto_0416.pdf) *American Economic Review*.
- [Why Did Pruitt-Igoe Fail?](https://www.huduser.gov/portal/pdredge/pdr_edge_featd_article_110314.html) — HUD USER.
- [Public Housing's Most Notorious Failure](https://www.city-journal.org/article/public-housings-most-notorious-failure) — *City Journal*.
- [NPR: Raj Chetty's latest research on the HOPE VI public housing experiment](https://www.npr.org/2026/01/28/nx-s1-5691692/hope-vi-public-housing-opportunity-insights-raj-chetty) — NPR (2026).

### Declining Cities and Revitalization

- Hollingsworth, T. and Goebel, A. ["Revitalizing America's Smaller Legacy Cities."](https://www.lincolninst.edu/app/uploads/legacy-files/pubfiles/revitalizing-americas-smaller-legacy-cities-full.pdf) Lincoln Institute of Land Policy.
- Mallach, A. and Brachman, L. (2013). *Regenerating America's Legacy Cities*. Lincoln Institute of Land Policy.
- Ehlenz, M. (2016). ["Neighborhood Revitalization and the Anchor Institution."](https://journals.sagepub.com/doi/abs/10.1177/1078087415601220) *Urban Affairs Review*.
- [The Power of Eds and Meds](https://penniur.upenn.edu/uploads/media/Anchor-Institutions-PRAI-2014.pdf) — Penn IUR.
- [Anchor Institutions Toolkit](https://www.nettercenter.upenn.edu/sites/default/files/Anchor_Toolkit6_09.pdf) — Netter Center, University of Pennsylvania.
- ["Shrinking Cities" Revisited](https://realestate.wharton.upenn.edu/working-papers/shrinking-cities-revisited/) — Wharton Real Estate Center.
- [Facing the Urban Challenge](https://www.urban.org/sites/default/files/publication/28101/1001392-Facing-the-Urban-Challenge-The-Federal-Government-and-America-s-Older-Distressed-Cities.PDF) — Urban Institute.

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
