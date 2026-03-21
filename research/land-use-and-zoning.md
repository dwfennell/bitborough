# Land Use and Zoning

> How zoning systems shape urban form, land values, and development patterns — and how to model them in city simulation.

## Table of Contents

- [History and Purpose of Zoning](#history-and-purpose-of-zoning)
- [Euclidean (Use-Based) Zoning](#euclidean-use-based-zoning)
- [Form-Based Codes](#form-based-codes)
- [Mixed-Use Development](#mixed-use-development)
- [Upzoning and Downzoning](#upzoning-and-downzoning)
- [Floor Area Ratio (FAR)](#floor-area-ratio-far)
- [Setbacks, Lot Coverage, and Height Limits](#setbacks-lot-coverage-and-height-limits)
- [Zoning and Land Value](#zoning-and-land-value)
- [Non-Conforming Uses and Variances](#non-conforming-uses-and-variances)
- [Inclusionary Zoning](#inclusionary-zoning)
- [Historic Preservation Overlays](#historic-preservation-overlays)
- [Parking Minimums and Zoning](#parking-minimums-and-zoning)
- [Fiscal Zoning](#fiscal-zoning)
- [Variance Approval Dynamics](#variance-approval-dynamics)
- [Zoning's Feedback Loops](#zonings-feedback-loops)
- [Application to Bitborough](#application-to-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

---

## History and Purpose of Zoning

Zoning is the legal mechanism by which a municipality divides its territory into districts and regulates what can be built where. It controls land use (residential, commercial, industrial), building form (height, setbacks, lot coverage), and intensity (density, floor area ratio). Zoning exists because unregulated land markets produce negative externalities — a tannery next to a school, a skyscraper that blocks all sunlight from a street.

### NYC 1916: The First Comprehensive Zoning Law

On July 25, 1916, New York City adopted the first comprehensive zoning ordinance in the United States. "Comprehensive" meant every parcel in the city was subject to its rules. The resolution was motivated by two immediate problems:

1. **The Equitable Building** (1915): a 40-story office tower that rose straight up from its lot lines, casting a 7-acre shadow over Lower Manhattan. Neighboring property owners demanded protection from the loss of light and air.
2. **Garment district encroachment**: Fifth Avenue retailers feared that expanding garment factories would drive away their customers.

The 1916 resolution created three regulatory layers:

- **Use districts**: residential, commercial, and unrestricted (industrial)
- **Height districts**: five categories defined by a "sky exposure plane" — a building could rise to a multiple of the street width (1x, 1.25x, 1.5x, 2x, 2.5x) before requiring setbacks
- **Area districts**: controlled lot coverage percentages

This three-layer approach — use, height, area — became the template for American zoning.

### The Standard State Zoning Enabling Act (1924/1926)

Secretary of Commerce Herbert Hoover convened an advisory committee in 1921 that produced the Standard State Zoning Enabling Act (SZEA), first published in 1924 and revised in 1926. Over 55,000 copies of the first edition were distributed. By 1925, 19 states had adopted the SZEA as a model. By 1935, 35 states had done so. The number of municipalities with zoning ordinances exploded: 8 cities by end of 1916, 76 by 1926, and over 1,300 by 1936 — covering roughly 70% of the U.S. population.

### Village of Euclid v. Ambler Realty (1926)

The constitutional validity of zoning was settled by the Supreme Court in *Village of Euclid, Ohio v. Ambler Realty Co.* (272 U.S. 365, 1926). Ambler Realty owned 68 acres in Euclid, a suburb of Cleveland. The village's new zoning ordinance divided the land across multiple districts, preventing Ambler from developing it for industrial use — reducing its value from $10,000/acre (industrial) to $2,500/acre (residential). Ambler sued, claiming an unconstitutional taking.

The Supreme Court upheld zoning 6-3 as a valid exercise of police power, finding that the village had a legitimate interest in separating incompatible land uses. The decision gave its name to "Euclidean zoning" — the use-separation model that dominates American land regulation to this day.

---

## Euclidean (Use-Based) Zoning

Euclidean zoning divides land into districts defined primarily by permitted use. The three foundational categories are Residential (R), Commercial (C), and Industrial (I), each typically subdivided by intensity.

### Standard Zone Hierarchy

| Zone | Typical Label | Permitted Uses | Typical Density |
|------|---------------|----------------|-----------------|
| R-1 | Single-family residential | Detached houses on large lots | 1-4 du/acre |
| R-2 | Two-family residential | Duplexes, detached houses | 4-9 du/acre |
| R-3 | Low-density multifamily | Townhouses, small apartments | 9-18 du/acre |
| R-4 | Medium-density multifamily | Garden apartments, mid-rise | 18-40 du/acre |
| R-5+ | High-density multifamily | High-rise apartments | 40-120+ du/acre |
| C-1 | Neighborhood commercial | Retail, restaurants, offices | Varies |
| C-2 | General commercial | Larger retail, services, hotels | Varies |
| C-3+ | Central business district | Offices, major retail, towers | Varies |
| I-1 | Light industrial | Warehousing, light manufacturing | 0.25-1.0 FAR |
| I-2 | Heavy industrial | Manufacturing, processing | 0.15-0.5 FAR |

### How Euclidean Zoning Shapes Cities

Euclidean zoning produces several distinctive urban patterns:

**Use separation.** Homes are far from jobs and shops, requiring automobile trips for daily needs. This is the defining characteristic of postwar American suburbs.

**Density capping.** Minimum lot sizes (e.g., 8,000 sq ft per unit in R-1) effectively cap population density. A city zoned predominantly R-1 cannot physically house more than about 4 families per acre regardless of demand.

**Cumulative vs. exclusive zoning.** Early ordinances were "cumulative" — a residential use was permitted in any zone, since it was considered the "highest" use. Modern ordinances are typically "exclusive" — each zone permits only its listed uses. This matters for simulation: under exclusive zoning, a commercial building cannot appear in a residential zone even if demand is high.

**Buffer zones.** Transition areas between incompatible uses (e.g., light commercial between residential and industrial) reduce negative externalities but consume land.

---

## Form-Based Codes

Form-based codes (FBCs) regulate the physical form of buildings rather than their use. Instead of asking "what happens in this building?" they ask "what does this building look like from the street?"

### The SmartCode and Transect Model

The SmartCode, developed by Duany Plater-Zyberk & Company, is the most widely referenced form-based code template. It organizes the built environment along a rural-to-urban transect:

| Transect Zone | Character | Typical Building Forms |
|---------------|-----------|----------------------|
| T1 (Natural) | Preserved land, parks | None |
| T2 (Rural) | Agricultural, sparse | Farmhouses, barns |
| T3 (Sub-Urban) | Low density, yards | Detached houses, generous setbacks |
| T4 (General Urban) | Mixed, walkable | Rowhouses, small apartments, ground-floor retail |
| T5 (Urban Center) | Dense, active streets | Mid-rise mixed-use, continuous frontages |
| T6 (Urban Core) | Highest intensity | High-rise towers, major institutions |

The key difference from Euclidean zoning: every transect zone allows a mix of uses. A T4 block can have apartments above shops. The regulations focus on building height, setbacks, frontage types, and lot coverage — not whether a building contains residences or offices.

### Why Form-Based Codes Produce Different Cities

FBCs permit mixed-use development by default, which Euclidean zoning prohibits by default. The result is shorter trip distances, higher walkability, and more efficient land use. Empirical evidence suggests that places adopting form-based codes perform better economically than those with conventional Euclidean zoning.

The tradeoff: FBCs are more complex to administer. They require detailed design standards (facade articulation, streetwall requirements, parking placement) rather than simple use/density tables.

---

## Mixed-Use Development

Mixed-use development combines residential, commercial, and sometimes institutional uses within the same building or block. It is the historical default — pre-zoning cities were almost entirely mixed-use — and the explicit target of form-based codes and New Urbanist planning.

### Patterns and Benefits

Mixed-use development typically takes one of three forms:

1. **Vertical mixed-use**: ground-floor commercial with residential above (the classic "shophouse" or "five-over-one")
2. **Horizontal mixed-use**: different uses in adjacent buildings on the same block
3. **District-level mixed-use**: residential and commercial zones interleaved at fine grain

Empirical research shows measurable benefits:

- **Walkability premium**: properties in highly walkable, mixed-use neighborhoods command a 10-30% price premium over comparable properties in car-dependent single-use areas.
- **Reduced vehicle miles traveled (VMT)**: mixed-use neighborhoods generate 20-40% fewer car trips than single-use equivalents.
- **Higher tax revenue per acre**: mixed-use parcels produce more tax revenue per acre than single-use parcels because they concentrate economic activity and reduce infrastructure cost per unit.

### Where Mixed-Use Emerges Naturally

Even under Euclidean zoning, mixed-use patterns emerge in predictable locations:

- **Transit station areas**: high foot traffic supports ground-floor retail
- **Neighborhood edges**: where residential meets commercial zones, informal mixing occurs
- **Historic main streets**: pre-zoning development that was grandfathered in
- **College and hospital districts**: institutional anchors generate demand for nearby services and housing

---

## Upzoning and Downzoning

**Upzoning** increases permitted density or intensity (e.g., changing R-1 to R-3, or raising FAR from 2.0 to 6.0). **Downzoning** does the opposite. Both are politically contentious because they redistribute land value.

### Land Value Impacts

Upzoning creates a "development premium" — the difference between the value of land under its current use and its value under the newly permitted higher use. Empirical studies show:

- A Chicago study found that a 20% increase in allowable density produced a 15-23% increase in land values within two years of rezoning.
- Upzoned parcels are approximately twice as likely to be redeveloped within 15 years compared to non-upzoned parcels.
- Large-scale upzoning (as in Sao Paulo) leads to significant new construction and eventual reduction in housing costs city-wide.

However, the relationship between upzoning and construction is not immediate. Short-term effects include land value increases without new housing. The supply response can take 5-15 years because development requires assembling capital, obtaining permits, and constructing buildings.

### Downzoning Dynamics

Downzoning typically occurs when existing residents seek to prevent further development. It locks in existing neighborhood character but restricts housing supply. The political economy is straightforward: homeowners benefit from scarcity (higher property values) and bear no direct cost from restricting supply. The cost is externalized to would-be residents who cannot find housing in the area.

### Relevance to Simulation

In a city-builder context, upzoning and downzoning are the player's primary levers for controlling urban form. The key dynamic to model: rezoning a tile changes its potential value, but realization of that value requires time, demand, and infrastructure.

---

## Floor Area Ratio (FAR)

Floor Area Ratio is the ratio of total building floor area to lot area. A 10,000 sq ft lot with FAR 2.0 can support up to 20,000 sq ft of floor area — achieved as a 2-story building covering the full lot, a 4-story building covering half the lot, or any other combination.

### How FAR Regulates Density

FAR is the most direct control on development intensity. It governs how much human activity a parcel can support regardless of building shape. Two buildings with the same FAR but different heights and lot coverages will house approximately the same number of people or jobs.

### Typical FAR Values

| Zone Type | Typical FAR | Building Form | Density Outcome |
|-----------|-------------|---------------|-----------------|
| Suburban residential (R-1) | 0.3-0.5 | 1-2 story detached house | 3-6 du/acre |
| Low-density residential (R-2/R-3) | 0.5-1.0 | Duplexes, townhouses | 6-18 du/acre |
| Medium-density residential (R-4) | 1.5-3.0 | 4-6 story apartments | 20-60 du/acre |
| High-density residential (R-5+) | 4.0-10.0 | High-rise apartments | 60-300+ du/acre |
| Neighborhood commercial (C-1) | 1.0-2.0 | 2-3 story mixed-use | — |
| General commercial (C-2/C-3) | 3.0-6.0 | Mid-rise office/retail | — |
| Central business district (C-4+) | 10.0-15.0+ | High-rise office towers | — |
| Light industrial (I-1) | 0.25-1.0 | Single-story warehouses | — |
| Heavy industrial (I-2) | 0.15-0.5 | Large-footprint facilities | — |

NYC provides concrete examples: residential zone R7A has a base FAR of 4.0. Commercial zone C6-4 allows FAR of 10.0-12.0 by right, enabling tall office towers. Manhattan's highest FARs exceed 15.0 in special districts.

### FAR Bonuses

Many cities offer FAR bonuses as incentives: additional floor area in exchange for public amenities. Common bonus triggers include:

- **Public plazas**: providing ground-level open space (NYC's plaza bonus was famously exploited to create Midtown's setback towers)
- **Affordable housing**: inclusionary zoning programs grant 20-35% additional FAR for including below-market units
- **Transit improvements**: direct connections to subway stations or bus terminals
- **Green building**: LEED certification or equivalent

---

## Setbacks, Lot Coverage, and Height Limits

These three regulations jointly determine the physical envelope within which a building can exist.

### Setbacks

A setback is the minimum distance a building must maintain from a property line. Setbacks create the space between buildings that defines street character.

| Context | Front Setback | Side Setback | Rear Setback |
|---------|---------------|--------------|--------------|
| Rural/estate residential | 30-50 ft | 15-25 ft | 25-40 ft |
| Suburban residential | 20-35 ft | 5-15 ft | 15-25 ft |
| Urban residential | 5-15 ft | 0-5 ft | 10-20 ft |
| Commercial/downtown | 0 ft (build-to line) | 0 ft | 0-10 ft |
| Industrial | 10-25 ft | 10-20 ft | 10-25 ft |

In dense urban areas, setbacks may be replaced by "build-to lines" — requirements that the building facade must be placed at or within a few feet of the property line. This creates the continuous streetwall that defines walkable commercial districts.

### Lot Coverage

Lot coverage is the percentage of a lot that can be covered by buildings. It directly constrains footprint size.

| Zone Type | Typical Max Lot Coverage |
|-----------|-------------------------|
| Low-density residential | 25-40% |
| Medium-density residential | 40-65% |
| High-density residential | 65-80% |
| Commercial | 75-100% |
| Industrial | 50-75% |

Corner lots often receive higher coverage allowances (up to 100% in some commercial zones) because they have more street frontage and fewer interior neighbors affected by bulk.

### Height Limits

Height limits vary enormously by jurisdiction and district. Common patterns:

| Zone Type | Typical Height Limit | Stories |
|-----------|---------------------|---------|
| Suburban residential | 30-35 ft | 2-2.5 |
| Urban residential (low) | 35-45 ft | 3-4 |
| Urban residential (mid) | 50-85 ft | 5-8 |
| General commercial | 45-85 ft | 4-8 |
| Downtown commercial | 100-400+ ft | 8-40+ |
| Industrial | 35-60 ft | 1-4 |

Many cities use a "sky exposure plane" system inherited from the 1916 NYC model: a building may rise straight to a base height, then must set back at an angle to preserve light and air to the street.

### The Envelope Effect

Setbacks, lot coverage, and height limits interact to define a "building envelope" — the maximum volume a building can occupy. For simulation purposes, this envelope effectively determines the maximum FAR achievable on a lot, which in turn determines maximum population or employment capacity.

---

## Zoning and Land Value

Zoning regulations are one of the most powerful determinants of land value. The same parcel of dirt can be worth $50,000 or $5,000,000 depending on what the zoning code permits.

### The "Zoning Tax"

Economists Edward Glaeser and Joseph Gyourko introduced the concept of the "zoning tax" — the gap between housing prices and the marginal cost of construction, attributable to regulatory constraints on supply. Their estimates:

| City | Estimated Zoning Tax (% of home value) |
|------|---------------------------------------|
| Manhattan (condos) | ~50% |
| Los Angeles | ~34% |
| San Francisco | ~33% |
| Boston | ~19% |
| Chicago | ~10% |

In dollar terms, more recent estimates put the zoning tax at roughly $500,000 per quarter-acre in New York, $400,000 in San Francisco and Chicago, and $300,000 in Seattle for homes within 15 miles of the urban core.

The methodology is debated. Critics argue the gap reflects location premiums and diminishing returns to lot size rather than pure regulatory cost. But the directional finding is broadly accepted: restrictive zoning raises housing costs by constraining supply.

### How Rezoning Creates Value

When a parcel is rezoned to allow higher-intensity use, its value jumps — often dramatically. The value increase equals the net present value of additional development potential:

```
Value_gain = (Revenue_new_use - Cost_new_construction) - (Revenue_current_use - Cost_current_construction)
```

This is why rezoning is intensely political. A single vote on a city council can transfer millions of dollars in value to a landowner. It also means that land speculation anticipating future rezoning is a powerful market force.

### Value Gradient at Zone Boundaries

Zone boundaries create sharp value discontinuities. A parcel zoned C-3 (commercial, FAR 6.0) may be worth 3-5x more per square foot than the R-1 (residential, FAR 0.5) parcel immediately across the street. These discontinuities create pressure for rezoning at boundaries and are a common source of political conflict.

---

## Non-Conforming Uses and Variances

### Non-Conforming Uses (Grandfathering)

A non-conforming use is a land use or structure that was legal when established but no longer conforms to current zoning. When a zone changes, existing uses are "grandfathered in" — they may continue operating indefinitely but face restrictions:

- **No expansion**: the non-conforming use cannot increase in floor area or intensity
- **No change of use**: switching to a different non-conforming use is typically prohibited
- **Abandonment clock**: if the use ceases for a defined period (typically 6-12 months), the grandfathering is lost permanently
- **Destruction threshold**: if the structure is destroyed beyond a threshold (often 50% of assessed value), it cannot be rebuilt as non-conforming

Non-conforming uses travel with the land, not the owner. A buyer acquires the same grandfathered rights. Over time, attrition naturally eliminates non-conforming uses as buildings age, owners retire, and businesses close.

### Variances

A variance is a one-time waiver of a specific zoning requirement, granted by a board of appeals (typically a Board of Zoning Adjustment or similar body). There are two types:

1. **Use variance**: permits a use not allowed in the zone (rare, difficult to obtain)
2. **Area/dimensional variance**: permits deviations from setback, height, lot coverage, or similar physical standards (more common)

The applicant must demonstrate "unnecessary hardship" — that the property cannot yield a reasonable return under strict application of the zoning code, and the hardship is due to unique characteristics of the property (topography, shape, etc.), not self-imposed conditions.

### Conditional Use Permits

A middle ground between by-right development and variances. Conditional use permits (also called "special exceptions") allow uses that are compatible with the zone but require review. Examples: a church in a residential zone, a gas station in a commercial zone, a daycare center in an office district. Conditions may be attached: operating hours, traffic management, screening, etc.

---

## Inclusionary Zoning

Inclusionary zoning (IZ) requires or incentivizes developers to include a percentage of below-market-rate ("affordable") units in new residential projects. It is one of the most widely adopted tools for producing affordable housing through the private market, and one of the most debated.

### Scale and Prevalence

As of 2019, over 1,000 inclusionary housing programs existed across 31 states and the District of Columbia. Geographic concentration is extreme: New Jersey accounts for 45% of all programs, Massachusetts 27%, and California 17%. A subset of 675 jurisdictions reported creating over 173,000 inclusionary units total, including approximately 70,000 affordable rental units and 31,000 for-sale units. Programs have also collected at least $1.76 billion in in-lieu fees from developers who opted to pay rather than build affordable units on-site.

### Mandatory vs. Voluntary Programs

IZ programs fall on a spectrum:

| Program Type | Mechanism | Typical Set-Aside | Effectiveness |
|---|---|---|---|
| Mandatory, jurisdiction-wide | All projects above a unit threshold must include affordable units | 10-20% of units | Highest production but highest market impact |
| Mandatory, area-specific | Applies only in designated zones (e.g., transit corridors, upzoned areas) | 15-30% of units | Moderate production, targeted to high-value areas |
| Voluntary with incentives | Developers receive density bonuses, fee waivers, or expedited review | 5-15% of units | Lower production, lower market distortion |
| Voluntary, no incentives | Purely optional | 0-5% of units | Near-zero production in practice |

NYC's Mandatory Inclusionary Housing (MIH) program, adopted in 2016, requires affordable set-asides of 20-30% in areas receiving upzoning. Portland's program, adopted in 2017, requires 10-20% affordable units in buildings of 20+ units and offers an FAR bonus of up to 25%.

### Density Bonus Mechanics

The density bonus is the most common developer incentive used to offset the cost of affordable unit requirements. California's Density Bonus Law (Government Code Section 65915) is the most detailed framework:

| Affordable Tier | Minimum Set-Aside | Base Density Bonus | Maximum Bonus | Incentives/Concessions |
|---|---|---|---|---|
| Very low income (<=50% AMI) | 5% of units | 20% | 50% | 1-3 depending on % |
| Low income (<=80% AMI) | 10% of units | 20% | 50% | 1-3 depending on % |
| Moderate income (<=120% AMI, for-sale only) | 10% of units | 5% | 35% | 1-3 depending on % |
| 100% affordable projects | 100% of units | 80% | Unlimited near transit | 4 |

For each additional 1% of low-income units above the 10% threshold, the developer receives a 1.5% increase in the density bonus. Projects within half a mile of a major transit stop can receive an unlimited density bonus if 100% affordable. Since 2020, the maximum bonus for most projects has been 50%, up from the previous 35%.

### In-Lieu Fees

Developers can often pay a per-unit fee instead of building affordable units on-site. Fee levels vary dramatically by market:

- **Boston**: $200,000-$380,000 per required affordable unit (graduated by neighborhood cost zone)
- **San Francisco**: $150,000-$250,000 per unit
- **Moderate-cost cities**: $50,000-$100,000 per unit

State law in California requires that in-lieu fees must be set high enough to produce at least as many affordable units as on-site construction would have yielded. In practice, fee revenue is often pooled into a housing trust fund and used to subsidize deeper affordability (lower AMI targets, special needs housing, homeless services) than the inclusionary program itself would produce.

### Effectiveness Data

Empirical evidence on IZ is mixed:

**Production.** IZ programs have collectively produced over 170,000 affordable units nationally. But this represents a small fraction of total housing need. NYC's MIH program, one of the largest, produced approximately 3,500 affordable units in its first five years.

**Market effects.** A 2025 study of U.S. jurisdictions found that IZ implementation resulted in an average 2.1% increase in home prices, with mandatory jurisdiction-wide programs producing the largest price effects. More stringent requirements (higher set-aside percentages, lower AMI targets) correlate with 5-12% decreases in overall new unit construction, as some projects become financially infeasible.

**Integration outcomes.** Research indicates that developments with 20-30% affordable units achieve optimal social integration when supported by robust institutional frameworks and thoughtful physical design. Below 20%, affordable tenants are too few to form community; above 30%, market-rate buyers begin to avoid the project.

**The cost-pass-through problem.** In strong markets, the cost of affordable units is passed through to market-rate buyers as higher prices. In weak markets, the requirement can kill projects entirely. The sweet spot exists in moderate-demand markets where developers can absorb some cost while remaining profitable.

---

## Historic Preservation Overlays

Historic preservation overlay districts are a form of supplementary zoning regulation that sits on top of ("overlays") the base zoning district. They regulate the physical appearance, alteration, and demolition of structures within areas deemed historically significant. While their stated purpose is cultural preservation, they have profound effects on development capacity, housing supply, and neighborhood economics.

### How Overlay Regulations Work

A historic overlay typically imposes the following additional requirements beyond the base zone:

- **Design review**: all exterior modifications, new construction, and demolitions within the district must be reviewed by a historic preservation commission or architectural review board
- **Demolition restrictions**: demolition of contributing structures is either prohibited outright or requires a "certificate of appropriateness" with a high evidentiary burden
- **Height and massing controls**: new construction must be compatible in height, scale, and massing with existing contributing structures, often capping buildings at 2-4 stories regardless of what the underlying zoning would permit
- **Material and style requirements**: facade materials, window proportions, roof forms, and architectural details are regulated to maintain visual consistency
- **Setback and lot coverage freezes**: new construction may be required to match the setback and lot coverage of surrounding historic structures

The net effect is that the overlay often reduces the effective development capacity of a parcel well below what the base zoning would allow. A parcel zoned R-4 (mid-rise multifamily, FAR 3.0) inside a historic overlay may be limited in practice to a 3-story building matching adjacent 1920s rowhouses, yielding an effective FAR of 1.0-1.5.

### Density Restriction Effects

Historic overlays function as a de facto downzoning mechanism in some of the most desirable, centrally-located neighborhoods in American cities. Research from Los Angeles found that historic districts can be used as protection against state and city regulations intended to encourage development, including density bonus law and small-lot subdivisions. A 2024 study characterized these restrictions as having an "exclusionary nature," reinforcing existing neighborhood demographics by restricting the supply of new housing.

Key data points:

- **New York City**: as of 2020, approximately 3.5% of the city's lots were in historic districts, but these lots accounted for a disproportionate share of Manhattan's developable land. Studies found that designation raises property values in lower-valued boroughs (Brooklyn, Queens) but can depress land values in Manhattan where foregone development potential is highest.
- **San Francisco**: 32% of the city's land area falls within some form of historic overlay or architectural conservation district, contributing to severe housing supply constraints.
- **Washington, D.C.**: approximately 27% of the District's land area is within historic districts, covering much of the most transit-accessible, centrally located land.

### Property Value Effects

Historic district designation has consistently been shown to increase property values for existing structures, creating a tension with housing affordability:

| Study Location | Value Premium | Notes |
|---|---|---|
| Denver | 12-23% | Local historic district designation |
| National Register (multiple cities) | 9-12% | National listing only |
| Philadelphia | Up to 131% | National Register districts (outlier) |
| Spillover to adjacent properties | 10-20% | Within 1-2 blocks of district boundary |

The premium derives from three sources: regulatory certainty (neighbors cannot demolish and build incompatible structures), aesthetic amenity (maintained streetscape quality), and scarcity (restricted supply of units in a desirable area). The third source is the one that creates the affordability tension: the premium is partly a monopoly rent extracted from constrained supply.

### Economic Tradeoffs

The core tradeoff is preservation of existing character vs. foregone development capacity:

**Benefits**: cultural value, tourism revenue, neighborhood stability, streetscape quality, property value increases for existing owners, environmental benefits of building reuse (embodied energy preservation).

**Costs**: reduced housing supply in high-demand areas, increased housing prices, displacement of lower-income residents through gentrification, foregone density near transit, higher renovation costs due to compliance requirements, and opportunity cost of development potential.

Some municipalities have attempted to resolve this tension by offering density transfers (transferable development rights, or TDRs) from historic parcels to receiving sites, or by exempting historic structures from unit-count caps when they are adaptively reused for housing.

---

## Parking Minimums and Zoning

Parking minimums are zoning requirements that mandate a minimum number of off-street parking spaces for new development, typically specified per dwelling unit, per 1,000 sq ft of commercial space, or per seat/bed/room for institutional uses. Since their widespread adoption beginning in the 1950s, they have been one of the most consequential and least-examined elements of American zoning codes. A reform movement to eliminate them has gained major momentum since 2020.

### How Parking Minimums Shape Land Use

Parking requirements interact with land use in several fundamental ways:

**Land consumption.** A surface parking space requires approximately 300-350 sq ft including the access lane. In the median American city with population over 500,000, approximately 26% of downtown land is devoted exclusively to parking. Individual cities range from 4% to 42%. This land cannot be used for housing, commerce, or public space.

**Development cost.** Parking construction costs are substantial:

| Parking Type | Cost Per Space | Annual Operating Cost |
|---|---|---|
| Surface lot | $5,000-$15,000 | $600-$1,200 |
| Above-ground structure | $25,000-$40,000 | $1,500-$3,000 |
| Below-ground structure | $35,000-$75,000 | $2,500-$5,000 |

With most jurisdictions requiring 1-3 spaces per dwelling unit, parking can add $25,000-$225,000 to the cost of each housing unit. Donald Shoup's research found that when considered as an impact fee, minimum parking requirements increase development costs by more than 10 times the impact fees for all other public purposes combined.

**Density suppression.** On a constrained urban lot, the parking requirement often becomes the binding constraint on unit count rather than FAR or height limits. A developer with a 10,000 sq ft lot in a zone that permits 40 units but requires 1.5 parking spaces per unit needs 60 spaces. At 350 sq ft per space, this requires 21,000 sq ft of parking area, exceeding the lot size. The project either shrinks to fewer units, adds expensive structured parking, or does not get built.

**Use pattern reinforcement.** Free parking (which describes 99% of all automobile trips in the United States, per Shoup) subsidizes driving and suppresses transit ridership, walking, and cycling. Parking minimums thus reinforce the car-dependent land use pattern that Euclidean zoning created, forming a feedback loop: separated uses require driving, driving requires parking, parking requirements prevent the density needed for transit, and lack of transit ensures continued car dependency.

### The Reform Movement

The movement to eliminate parking minimums has accelerated rapidly:

- **2017**: Buffalo, NY becomes the first major U.S. city to eliminate all parking minimums citywide. In the years following, 68% of all new homes used parking ratios that would not have been allowed under the prior code.
- **2021**: California bans parking mandates near transit statewide (AB 2097).
- **2024**: Washington State passes the strongest statewide rollback, capping most residential projects at 0.5 spaces per unit and exempting many projects entirely.
- **2025**: Chicago eliminates parking minimums for most new residential and commercial developments in transit-served locations (effective September 2025). NYC's "City of Yes" reforms eliminate parking mandates for residential projects in transit-rich areas.
- **As of 2025**: Over 3,700 cities in 22 countries have enacted reforms to eliminate or reduce parking requirements, with over 100 cities removing all minimums entirely.

### What Happens When Minimums Are Eliminated

Empirical evidence from early-adopter cities shows:

**Developers still build parking, but less.** In Buffalo, developers provided an average of 0.5 spaces per unit voluntarily, down from the 1.0-2.0 mandated previously. The market, not the code, determines parking supply.

**Housing costs moderate.** Minneapolis eliminated parking minimums as part of broader zoning reform in 2020. While national rents increased 22% from 2019 to 2024, Minneapolis rents declined 4% over the same period. Parking reform was one of several contributing factors (the city also legalized triplexes citywide and streamlined permitting).

**More housing gets built.** A 2025 U.S. Department of Transportation study found that removing parking minimums in Colorado would lead to 71% more homes in transit-oriented areas and 41% more homes overall in studied urban areas.

**Historic building reuse becomes feasible.** Many pre-automobile buildings (pre-1940) cannot meet modern parking requirements without demolishing adjacent structures or building expensive underground garages. Eliminating minimums makes adaptive reuse of these buildings economically viable.

**Ground floors activate.** Developers convert ground-floor space from parking garages to retail, offices, or additional housing units, creating more active street frontages and generating more tax revenue per acre.

---

## Fiscal Zoning

Fiscal zoning is the practice of using land-use regulation to maximize a municipality's property and sales tax revenue while minimizing the public expenditure obligations associated with new development. It is one of the most powerful but least publicly discussed motivations behind zoning decisions.

### The Fiscal Calculus of Land Use

Different land uses generate vastly different net fiscal impacts (tax revenue minus service costs):

| Land Use | Revenue Profile | Service Cost Profile | Typical Net Fiscal Impact |
|---|---|---|---|
| Single-family residential (large lot) | Moderate property tax | High (schools, roads, utilities per unit) | Negative to break-even |
| Single-family residential (small lot) | Higher property tax per acre | Moderate (shared infrastructure) | Break-even to slightly positive |
| Multifamily residential | High property tax per acre | Moderate (shared infrastructure, fewer school-age children per unit) | Positive |
| Neighborhood commercial | High property + sales tax | Low (no school demand, limited utility demand) | Strongly positive |
| Big-box retail | Very high sales tax | Low to moderate (road infrastructure) | Strongly positive for sales-tax cities |
| Office/professional | High property tax | Very low (no school demand, minimal residential services) | Strongly positive |
| Light industrial | Moderate property tax | Low | Positive |
| Heavy industrial | Moderate property tax | Moderate (infrastructure, environmental) | Variable |

The key insight: residential development, particularly single-family homes on large lots, is often a net fiscal drain on municipalities because the cost of providing schools, roads, water, sewer, police, and fire service exceeds the property tax revenue generated. Commercial and industrial uses generate revenue with far lower service demands.

### How Fiscal Zoning Manifests

**Commercial corridor protection.** Municipalities zone generous areas for commercial use along arterials, even when market demand does not support it, to attract sales-tax-generating retail. If sales taxes are the primary source of local revenue, shopping centers have a disproportionate chance of being approved, even if they reduce nearby residential property values.

**Industrial preservation.** Industrial zoning functions as a subsidy: municipalities forgo higher tax revenue from converting industrial land to residential or commercial use in order to maintain employment-generating uses that demand few public services. Industrial zoning also protects industries from competition with residential and commercial users who could outbid them for land.

**Large-lot residential zoning.** Paradoxically, fiscal zoning drives some municipalities toward large-lot single-family zoning despite its fiscal inefficiency. The logic: large-lot homes attract high-income residents whose property tax payments exceed service costs, while smaller homes and apartments attract families with more school-age children per dollar of assessed value. This creates exclusionary outcomes -- lower-income households are priced out by minimum lot size requirements.

**Revenue-per-acre analysis.** Strong Towns and other fiscal urbanist organizations have documented dramatic differences in revenue productivity by development pattern:

| Development Type | Property Tax Per Acre | Notes |
|---|---|---|
| Mixed-use downtown building | ~$67,000/acre | Highest revenue productivity |
| Small-lot residential (<0.2 acres) | ~$5,600/acre | Dense single-family |
| Large-lot residential (>1 acre) | ~$538/acre | 10x less than small-lot |
| Walmart (typical) | Varies | A downtown building in Asheville generates 100x more property tax per acre |

The implication is stark: low-density suburban development patterns, despite appearing "safe" from a fiscal perspective, often produce the weakest revenue per acre while demanding the most infrastructure per capita.

### Fiscal Zoning and Housing Affordability

The prioritization of fiscally positive development often comes at the expense of affordable housing. Local governments favor high-end residential or commercial projects that promise greater tax revenues, leading to:

- Displacement of lower-income residents as neighborhoods are rezoned for higher-value uses
- Exclusion of affordable multifamily housing through large-lot zoning and parking requirements
- Competition between neighboring municipalities for commercial tax base ("fiscal competition"), where each city zones aggressively for retail at the expense of regional housing needs
- Resistance to group homes, supportive housing, and subsidized developments that are perceived as fiscally negative regardless of social value

---

## Variance Approval Dynamics

While variances are discussed structurally in [Non-Conforming Uses and Variances](#non-conforming-uses-and-variances) above, the political economy of how variance decisions are actually made deserves separate treatment. The gap between the legal standard for variances and actual board behavior is one of the most studied -- and most troubling -- aspects of zoning administration.

### Approval Rates

Research spanning decades has consistently found variance approval rates far higher than the strict legal standards would predict:

| Study Period | Setting | Approval Rate | Source |
|---|---|---|---|
| 1960-1990 (multiple studies) | Urban, suburban, and rural jurisdictions | 70-80% | Pepperdine Law Review synthesis |
| Indiana (specific board study) | Single jurisdiction | 86% | Academic case study |
| Boston (special permits + variances) | Urban | 81% of requests approved | 52% of all dwelling units involved a variance |

These rates are remarkably consistent across time periods and geographic settings. The 70-80% baseline has held since the 1960s.

### The Legal Standard vs. Practice

The legal standard for granting a variance is high. Under most state statutes (derived from the Standard State Zoning Enabling Act), an applicant must demonstrate:

1. **Unnecessary hardship**: the property cannot yield a reasonable return under strict application of the zoning code
2. **Unique circumstances**: the hardship is due to characteristics of the specific property (topography, irregular lot shape, etc.), not conditions general to the neighborhood
3. **No self-created hardship**: the owner did not create the condition necessitating the variance
4. **No substantial detriment**: the variance will not alter the essential character of the neighborhood
5. **Minimum variance**: the relief granted is the minimum necessary

In practice, research consistently finds that boards routinely ignore these standards. A comprehensive academic analysis concluded that local decision-making bodies base decisions on "inappropriate and substantially irrelevant factors," and there are "no common evidentiary or procedural standards" applied. Many hearings fail to provide fundamental fairness and due process, and the legal prerequisites for obtaining a variance are "frequently ignored."

### The Political Economy of Variance Decisions

Several forces drive the high approval rates:

**Asymmetric participation.** The applicant (who stands to gain a concentrated benefit) always appears. Neighbors who would bear diffuse costs often do not. Board members face a motivated supplicant with no organized opposition.

**Repeat-player dynamics.** In many jurisdictions, the same attorneys, developers, and architects appear before the board repeatedly. Board members develop relationships with these repeat players. One-time applicants (homeowners seeking a shed setback variance) and repeat professional applicants (developers seeking use variances) receive very different levels of scrutiny in practice, even if the legal standard is identical.

**Political pressure.** Board members in many jurisdictions are political appointees. Elected officials who appoint them may have preferences about specific projects. Even where boards are nominally independent, the appointment process creates implicit accountability to political actors.

**The "nice person" problem.** Variance hearings are quasi-judicial proceedings, but they feel like community meetings. Applicants present sympathetic personal narratives. Board members, who are typically laypeople rather than judges, find it difficult to deny a request from someone who appears reasonable and whose project seems harmless.

**Precedent accumulation.** Each granted variance makes the next one harder to deny. If the board approved a similar request last month, denying this one feels arbitrary. Over time, the effective zoning standard drifts far from the written code.

### Consequences of Liberal Variance Granting

**Code erosion.** When 70-80% of variance requests are approved, the written zoning code ceases to reflect the actual regulatory environment. Developers learn to design projects that require variances, knowing they will likely be granted, rather than conforming to the code.

**Uncertainty premium.** Despite high approval rates, the variance process introduces uncertainty, delay (typically 2-6 months), and cost (application fees, attorney fees, architect fees for redesign). This acts as a tax on development that falls disproportionately on smaller projects and less-experienced developers.

**Inequitable access.** Sophisticated developers with legal representation navigate the variance process far more effectively than individual homeowners or small builders. The system favors repeat players with resources.

**Corruption risk.** The discretionary nature of variance decisions, combined with the large dollar values at stake (a use variance can add millions in land value), creates corruption risk. Multiple jurisdictions have experienced zoning board scandals involving bribery or quid pro quo arrangements.

---

## Zoning's Feedback Loops

Zoning does not merely regulate — it actively creates self-reinforcing spatial patterns. Once established, these patterns are difficult to reverse.

### Positive Feedback: Agglomeration

High-density commercial zoning attracts businesses. Businesses attract workers. Workers attract housing demand. Housing demand attracts residential development nearby. More residents support more commercial activity. This loop drives the formation of central business districts and commercial corridors.

The agglomeration economy literature quantifies this: doubling employment density in an area increases productivity by 2-8%, creating a real economic incentive for clustering that zoning either enables or prevents.

### Negative Feedback: Industrial Blight

Industrial zoning can create a degenerative loop. Polluting uses reduce residential desirability. Declining residential values reduce investment. Disinvestment attracts more marginal uses (storage, junkyards). Property values fall further. The neighborhood becomes a "zone of discard" that spreads outward.

This is directly relevant to simulation: industrial zones with pollution radius should depress nearby residential desirability, creating a spatial pattern where residential development avoids industrial areas — matching real-world patterns.

### Exclusionary Feedback

Low-density residential zoning produces expensive housing (large lots, single-family only). Expensive housing attracts high-income residents. High-income residents have political power to maintain restrictive zoning. The loop reinforces itself: restrictive zoning produces homogeneous neighborhoods that resist densification.

### Spillover at Zone Boundaries

Land use changes propagate across zone boundaries. A new high-rise commercial building at the edge of a residential zone increases traffic, noise, and shadow impacts on nearby homes. This can trigger either investment (commercial frontage becomes more valuable) or disinvestment (residential quality declines). The direction depends on the specific uses and the quality of buffering.

### Vacancy and Demand Spirals

When zone demand drops — a factory district losing employers, a retail corridor losing foot traffic — vacancies increase. Vacancies reduce the attractiveness of the area to remaining businesses. More businesses leave. Property values fall, triggering deferred maintenance and eventual abandonment. Reversing this spiral requires either rezoning (to allow new uses) or substantial public investment (infrastructure, remediation).

---

## Application to Bitborough

### Current Mechanics and Their Real-World Parallels

Bitborough already implements the core structure of Euclidean zoning. The mapping:

| Bitborough Mechanic | Real-World Parallel |
|---------------------|---------------------|
| `ZoneType.Residential / Commercial / Industrial` | R/C/I use districts |
| `DensityLevel.Low / Medium / High` | Density tiers within a zone (R-1 through R-5) |
| Development probability gated on demand, power, roads | Infrastructure-dependent development |
| Desirability score (0-1) affecting fill rate | Location value / land desirability |
| Pollution radius depressing residential desirability | Industrial externality / buffer zone logic |
| Transit stops enabling Medium-to-High upgrades | Transit-oriented development |
| Clark's Law exponential decay for upgrade probability | Density gradient from central business district |
| Dereliction after 3 months below 10% occupancy | Blight/abandonment from sustained low demand |
| Downgrade chain (High -> Medium -> Low) | Building deterioration / adaptive downgrading |

### Specific Formulas Already in Use

**Development probability** (zones.ts):
```
P(develop) = 0.12 * zoneDemand
```
Tiles develop when powered, road-accessible, and demand > 0. The 12% base rate per tick creates organic growth.

**Density upgrade probability** (density.ts):
```
P(upgrade_medium) = demandFactor * e^(-distance / mediumRadius)
P(upgrade_high)   = demandFactor * e^(-distToTransit / TRANSIT_RADIUS)
```
Medium upgrade requires occupancy >= 70%, neighbourhood average occupancy >= 70%, and a paved road. High upgrade requires occupancy >= 85%, a transit stop within 10 tiles, and critical mass (>50% of neighbors at Medium+).

**Desirability** (desirability.ts):
```
Residential = 0.30 (baseline) + 0.30 * (1 - crime) + 0.15 * fire + 0.25 * park - 0.30 * pollution
Commercial  = 0.40 (baseline) + 0.35 * transit + 0.25 * residentialDensity
Industrial  = 1.0 (flat)
```

### Suggested Future Mechanics

The following mechanics would bring Bitborough closer to real zoning dynamics:

**1. FAR as an Explicit Density Control**

Currently density is a discrete enum (Low/Medium/High). Introducing an explicit FAR value per tile would allow finer-grained control:

```
maxCapacity = baseLotCapacity * FAR
```

Suggested default FARs by current density tier:

| Density | Residential FAR | Commercial FAR | Industrial FAR |
|---------|----------------|----------------|----------------|
| Low | 0.5 | 1.0 | 0.5 |
| Medium | 2.5 | 4.0 | 1.0 |
| High | 6.0 | 10.0 | 1.5 |

This allows a future "rezone" tool where the player explicitly sets FAR caps per tile or district.

**2. Rezoning Tool (Upzoning/Downzoning)**

Let the player change the permitted density cap of placed zones. Model the value jump and development lag:

```
// On rezone: immediate land value change, delayed construction
tile.maxDensity = newLevel
tile.landValue *= densityMultiplier[newLevel] / densityMultiplier[oldLevel]
// Development still requires demand + time
```

Land value multipliers (derived from real rezoning studies):

| Transition | Value Multiplier |
|------------|-----------------|
| Low -> Medium | 1.5-2.0x |
| Medium -> High | 2.0-3.0x |
| Low -> High | 3.0-5.0x |
| Any downzone | 0.5-0.8x |

**3. Mixed-Use Zones**

Add a `ZoneType.MixedUse` that permits both residential and commercial buildings. Development in mixed-use zones should:

- Allow vertical mixing: a building with both `capacity` (residents) and `jobs`
- Grant a walkability bonus: +15% desirability for residential, +20% for commercial
- Require higher infrastructure (paved road mandatory, transit bonus amplified)

This maps directly to the real-world observation that mixed-use areas generate 10-30% property value premiums.

**4. Zone Boundary Effects**

Introduce a spillover system at zone boundaries:

```
// Industrial pollution already affects residential desirability.
// Add: commercial proximity bonus to residential at zone edges.
if (hasCommercialNeighbor(x, y, radius=3)) {
  residentialDesirability += 0.10  // walkable services bonus
}

// Add: residential proximity penalty to industrial efficiency.
if (hasResidentialNeighbor(x, y, radius=4)) {
  industrialEfficiency *= 0.85  // complaints, operating restrictions
}
```

This creates the buffer-zone dynamic where players learn to separate incompatible uses or pay an efficiency penalty.

**5. Non-Conforming Use Mechanics**

When a player rezones an occupied tile, existing buildings should not be instantly demolished. Instead:

```
building.nonConforming = true
building.nonConformingMonthsRemaining = 24  // 2-year grace period
// Non-conforming buildings cannot upgrade, fill rate reduced by 50%
// After grace period expires, building enters dereliction pipeline
```

This creates a realistic lag between rezoning and redevelopment, and teaches players that rezoning occupied areas has a transition cost.

**6. Desirability Refinements from Zoning Data**

The current desirability model is close to real-world dynamics but could add:

- **Distance-to-CBD bonus for commercial**: commercial desirability should increase with proximity to existing commercial clusters (agglomeration effect)
- **Park radius scaling**: real park premiums decay with distance; use `parkBonus * e^(-dist / PARK_RADIUS)` instead of a flat bonus
- **Pollution decay**: industrial pollution radius is currently uniform. Real pollution follows inverse-square or exponential decay from the source. Modeling this would create more realistic industrial buffer zones.

### Building Capacity Calibration

The current building definitions can be cross-referenced against real density data:

| Building | Capacity | Effective Density | Real-World Equivalent |
|----------|----------|-------------------|-----------------------|
| res.low (1x1) | 10 residents | 10/tile | Single-family homes (~4-8 du/acre) |
| res.med (1x1) | 100 residents | 100/tile | Mid-rise apartment (~30-60 du/acre) |
| res.med.b (2x1) | 120 residents | 60/tile | Low-rise apartment complex |
| res.high (2x2) | 330 residents | 82.5/tile | High-rise tower (~80-120 du/acre) |
| com.low (1x1) | 5 jobs | 5/tile | Small shops (~12-15 jobs/acre) |
| com.med (1x1) | 30 jobs | 30/tile | Office building (~40-60 jobs/acre) |
| com.high (2x2) | 175 jobs | 43.75/tile | Office tower (~60-110 jobs/acre) |
| ind.low (1x1) | 10 jobs | 10/tile | Light industrial (~10-15 jobs/acre) |
| ind.med (2x2) | 10 jobs | 2.5/tile | Medium industrial (~7-12 jobs/acre) |
| ind.high (3x3) | 5 jobs | 0.56/tile | Heavy automated industrial (<7 jobs/acre) |

The industrial job density *decreasing* at higher tiers already matches the real-world pattern documented in the TOD research: heavy industrial facilities are capital-intensive and automated, producing more economic output with fewer workers. This is a strong design choice worth preserving.

### Mechanics Suggested by New Sections

**7. Inclusionary Zoning / Affordable Housing Mandate**

Add a policy toggle (or slider) where the player can impose an affordable housing requirement on new residential construction. This creates a tradeoff between social equity and development throughput:

```
// When inclusionary policy is active:
if (policy.inclusionaryZoning.enabled) {
  const setAside = policy.inclusionaryZoning.percentage  // 0.10 - 0.30
  const densityBonus = setAside * 1.5  // e.g., 15% set-aside -> 22.5% bonus capacity
  building.affordableUnits = Math.floor(building.capacity * setAside)
  building.capacity = Math.floor(building.capacity * (1 + densityBonus))
  // Affordable units generate residents but less tax revenue
  // Higher set-asides reduce P(develop) as marginal projects become infeasible
  tile.developmentProbabilityModifier *= (1 - setAside * 0.4)  // 10% set-aside -> 4% reduction
}
```

This models the real finding that IZ programs produce affordable units at the cost of slightly reduced overall development (5-12% in high-requirement jurisdictions). The density bonus partially compensates.

**8. Historic Preservation Overlay**

Allow the player to designate tiles or districts as "historic," which raises property value for existing buildings but suppresses new development and density upgrades:

```
if (tile.historicOverlay) {
  tile.landValue *= 1.15  // 12-23% premium from research
  tile.maxDensity = Math.min(tile.maxDensity, DensityLevel.Medium)  // cap density
  tile.developmentProbabilityModifier *= 0.3  // demolition/rebuild nearly impossible
  tile.desirability += 0.08  // aesthetic/stability bonus
  // Adjacent tiles get spillover: +5% desirability within radius 2
}
```

This creates an interesting player dilemma: designating historic districts preserves desirable neighborhoods and boosts values, but freezes density in areas that might benefit from growth. It maps to the real tension between preservation and housing supply.

**9. Parking Requirements Toggle**

Add a city-wide or per-district parking policy that affects development capacity:

```
enum ParkingPolicy { Standard, Reduced, None }

function adjustForParking(tile: Tile, baseCapacity: number): number {
  switch (tile.parkingPolicy) {
    case ParkingPolicy.Standard:
      return baseCapacity * 0.70  // 30% capacity lost to parking
    case ParkingPolicy.Reduced:
      return baseCapacity * 0.85  // 15% capacity lost
    case ParkingPolicy.None:
      return baseCapacity * 1.00  // full capacity, but...
      // ...reduced desirability if no transit: residents need cars
  }
}

// No-parking penalty without transit:
if (tile.parkingPolicy === ParkingPolicy.None && !hasTransitStop(tile, radius=6)) {
  tile.residentialDesirability -= 0.12  // car-dependent residents penalized
}
```

This models the real dynamic where parking minimums suppress density (26% of downtown land is parking in the median U.S. city) but eliminating them only works well near transit. It teaches players that parking reform and transit investment are complementary policies.

**10. Fiscal Impact Awareness**

Surface the fiscal impact of zoning decisions to the player through a per-tile or per-district revenue/cost display:

```
function fiscalImpactPerTile(tile: Tile): number {
  const revenue = tile.taxRevenue  // based on land value + building value
  const serviceCost = getServiceCost(tile)  // schools, roads, utilities, police, fire
  return revenue - serviceCost
}

// Revenue per acre varies dramatically by development pattern:
// Mixed-use downtown: ~$67,000/acre
// Small-lot residential: ~$5,600/acre
// Large-lot residential: ~$538/acre
// Commercial corridors and dense mixed-use subsidize suburban residential
```

This would make the fiscal zoning dynamic visible: players would see that sprawling low-density residential zones drain the budget while compact mixed-use development generates surplus. It naturally teaches the Strong Towns lesson without being didactic.

**11. Variance System**

When a building wants to develop but the strict zoning doesn't quite fit (e.g., commercial demand on a residential-edge tile), model variance requests as probabilistic events:

```
function requestVariance(tile: Tile, requestedUse: ZoneType): boolean {
  const approvalRate = 0.75  // matches real 70-80% baseline
  const demandPressure = getDemand(requestedUse) / getMaxDemand()
  const neighborOpposition = countResidentialNeighbors(tile, radius=2) * 0.05
  const P_approve = approvalRate + (demandPressure * 0.15) - neighborOpposition

  if (Math.random() < P_approve) {
    tile.varianceGranted = true
    tile.allowedUse = requestedUse
    // Variance adds delay: development delayed by 2-4 ticks
    tile.developmentDelay += 3
    return true
  }
  return false
}
```

This models the real dynamic where variance approval is likely but not certain, adds delay, and is influenced by demand pressure and neighbor opposition. It could fire automatically at zone boundaries where demand spills over.

---

## Cross-References

- [urban-density-gradients.md](./urban-density-gradients.md) — Clark's Law exponential decay model that drives Bitborough's density upgrade probability
- [transit-oriented-development.md](./transit-oriented-development.md) — TOD patterns, transit as density anchor, employment density by zone type
- housing.md (planned) — housing market dynamics, affordability, residential demand modeling
- urban-growth-patterns.md (planned) — monocentric to polycentric city evolution, sprawl mechanics
- municipal-finance.md (planned) — property tax, tax value by zone/density, fiscal zoning incentives

---

## Sources

### Historical and Legal
- [Revisiting 1916: History of NYC's First Zoning Resolution — Building the Skyline](https://buildingtheskyline.org/revisiting-1916-i/)
- [1916 Zoning Resolution — Wikipedia](https://en.wikipedia.org/wiki/1916_Zoning_Resolution)
- [How the 1916 Zoning Law Shaped Manhattan — Skyscraper Museum](https://old.skyscraper.org/zoning/)
- [Village of Euclid v. Ambler Realty Co. — Wikipedia](https://en.wikipedia.org/wiki/Village_of_Euclid_v._Ambler_Realty_Co.)
- [Village of Euclid v. Ambler Realty — Cornell LII](https://www.law.cornell.edu/wex/village_of_euclid_v_ambler_realty_(1926))
- [Standard State Zoning Enabling Act — Wikipedia](https://en.wikipedia.org/wiki/Standard_State_Zoning_Enabling_Act)
- [A Brief History of Zoning in America — Manhattan Institute](https://manhattan.institute/article/a-brief-history-of-zoning-in-america-and-why-we-need-a-more-flexible-approach)
- [100 Years of Zoning — AIA New York](https://www.aiany.org/membership/special-projects/article/zoning-100/100-years-of-zoning/)

### Zoning Economics and Land Value
- Glaeser, E. & Gyourko, J. (2002). "The Impact of Zoning on Housing Affordability." NBER Working Paper 8835.
- [New Research Quantifies 'Zoning Tax' — City Journal](https://www.city-journal.org/article/the-zoning-tax)
- [Zoning's Steep Price — Cato Institute](https://www.cato.org/sites/cato.org/files/serials/files/regulation/2002/10/v25n3-7.pdf)
- Freemark, Y. (2023). "Zoning Change: Upzonings, Downzonings, and Their Impacts." *Journal of the American Planning Association*.
- [Does Upzoning Work? — Building the Skyline](https://buildingtheskyline.org/upzoning-1/)
- [Zoning Change — Urban Institute](https://www.urban.org/research/publication/zoning-change)

### Form-Based Codes and Mixed Use
- [Form-Based Code — Wikipedia](https://en.wikipedia.org/wiki/Form-based_code)
- [SmartCode — Wikipedia](https://en.wikipedia.org/wiki/SmartCode)
- [In the Zone with Form-Based Codes — Smart Growth America](https://smartgrowthamerica.org/in-the-zone-with-form-based-codes/)
- [An Empirical Study of the Efficacy of Mixed-Use Development — NAIOP](https://www.naiop.org/globalassets/research-and-publications/report/an-empirical-study-of-the-efficacy-of-mixed-use-development---the-seattle-experience/researchreportares-anempiricalstudyoftheefficacyofmixedusedevelopment.pdf)
- [Codes That Support Smart Growth — US EPA](https://www.epa.gov/smartgrowth/codes-support-smart-growth-development)

### Non-Conforming Uses and Variances
- [Nonconforming Uses in Zoning — Extension.org](https://community-planning.extension.org/nonconforming-uses-aka-grandfathered-uses-in-zoning/)
- [Nonconformities in Zoning — Michigan State University Extension](https://www.canr.msu.edu/news/nonconformities_in_zoning_is_the_source_of_much_confusion)
- [Zoning Changes, Variances, and More — FindLaw](https://www.findlaw.com/realestate/land-use-laws/zoning-changes-variances-and-more.html)
- [MRSC — Nonconforming Uses, Structures, and Lots](https://mrsc.org/explore-topics/planning/administration/nonconforming-uses)

### Density and Physical Standards
- [Floor Area Ratio — Wikipedia](https://en.wikipedia.org/wiki/Floor_area_ratio)
- [Visualizing Compatible Density — MRSC](https://mrsc.org/stay-informed/mrsc-insight/april-2017/visualizing-compatible-density)
- [Density — JHP Architecture](https://jhparch.com/density)
- [Zoning Classifications — Anne Arundel County](https://www.aacounty.org/planning-and-zoning/zoning-administration/zoning-classifications-guide)
- [LA Residential Zoning — Benson Construction Group](https://www.bensonconstructiongroup.com/los-angeles-zoning-residential)

### Inclusionary Zoning
- [Inclusionary Housing in the United States — Lincoln Institute of Land Policy](https://www.lincolninst.edu/publications/working-papers/inclusionary-housing-in-united-states/)
- [Inclusionary Housing in the United States: Prevalence, Practices, and Production — Grounded Solutions Network](https://groundedsolutions.org/resources/inclusionary-housing-united-states/)
- [Study Identifies Over 1,000 Inclusionary Housing Programs Nationwide — NLIHC](https://nlihc.org/resource/study-identifies-over-1000-inclusionary-housing-programs-nationwide)
- [Do Inclusionary Zoning Policies Affect Local Housing Markets? — ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0264275125000368)
- [Study Highlights Housing Tradeoffs in Inclusionary Zoning Policies — NAHB](https://www.nahb.org/blog/2024/04/inclusionary-zoning-study-ucla)
- [Inclusionary Zoning Helps Some, but Can Jeopardize Broad-Based Affordability — Pioneer Institute](https://pioneerinstitute.org/study-inclusionary-zoning-helps-some-but-can-jeopardize-broad-based-affordability/)
- [Mandatory Inclusionary Housing — NYC Council Land Use](https://council.nyc.gov/land-use/plans/mih-zqa/mih/)
- [Inclusionary Housing — Portland.gov](https://www.portland.gov/phb/inclusionary-housing)
- [Setting the In-Lieu Fee — InclusionaryHousing.org](https://inclusionaryhousing.org/designing-a-policy/off-site-development/in-lieu-fees/setting-the-in-lieu-fee/)
- [Determining In-Lieu Fees in Inclusionary Zoning Policies — Urban Institute](https://www.urban.org/research/publication/determining-lieu-fees-inclusionary-zoning-policies)
- [California Density Bonus Law FAQ — City of Morgan Hill](https://www.morganhill.ca.gov/2160/Density-Bonus-Law)
- [Density Bonus Law: Incentives, Concessions, and Waivers — SCAG](https://scag.ca.gov/sites/default/files/2024-05/density_bonus_law_-_what_are_incentives_concessions_and_waivers.pdf)

### Historic Preservation Overlays
- [Where Preservation Meets Land Use Regulation: Historic Districts in Los Angeles — Journal of the American Planning Association](https://www.tandfonline.com/doi/full/10.1080/01944363.2024.2417053)
- [Preserving History or Restricting Development? Historic Districts in NYC — ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0094119015000820)
- [When Historic Preservation Clashes with Housing Affordability — Sightline Institute](https://www.sightline.org/2017/12/19/when-historic-preservation-clashes-with-housing-affordability/)
- [Character Contradiction: The Exclusionary Nature of Preservationist Planning Restrictions — Urban Studies (2024)](https://journals.sagepub.com/doi/10.1177/00420980231195218)
- [The Value of Historic District Status — ScienceDirect (2025)](https://www.sciencedirect.com/science/article/abs/pii/S0166046225000742)
- [The Political Economy of Historic Districts — ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0166046220302684)
- [Historic Districting Does Not Have a Negative Effect on Property Values — Nashville Metro](https://www.nashville.gov/sites/default/files/2025-11/Historic-Districting-and-Property-Values.pdf)
- [How Historical Designations Affect Property Values — Urban Land Magazine](https://urbanland.uli.org/economy-markets-trends/historical-designations-affect-property-values)

### Parking Minimums and Reform
- Shoup, D. (2005/2011). *The High Cost of Free Parking*. Planners Press / Routledge.
- [From Austin to Anchorage, U.S. Cities Opt to Ditch Parking Minimums — NPR](https://www.npr.org/2024/01/02/1221366173/u-s-cities-drop-parking-space-minimums-development)
- [Eliminating Parking Mandates to Tackle the Housing Crisis — NAIOP](https://www.naiop.org/research-and-publications/magazine/2025/fall-2025/development-ownership/eliminating-parking-mandates-to-tackle-the-housing-crisis/)
- [In These US Cities, Parking Reform Is Gaining Momentum — ITDP](https://itdp.org/2024/02/01/in-these-us-cities-parking-reform-is-gaining-momentum/)
- [Parking Reforms — U.S. Department of Transportation (2025)](https://www.transportation.gov/sites/dot.gov/files/2025-01/Parking%20Reforms.pdf)
- [Parking Reform Map — Parking Reform Network](https://parkingreform.org/resources/mandates-map/)
- [Eliminating Parking Minimums Works: Minneapolis and Buffalo — NextSTL](https://nextstl.com/2024/01/eliminating-parking-minimums-works-ask-minneapolis-and-buffalo/)
- [Zoning Reform 2025: Parking Minimums Axed and FAR Caps Raised — Innowave Studio](https://www.innowave-studio.com/post/zoning-reform-2025-parking-minimums-axed-and-far-caps-raised-in-major-u-s-cities)
- [Parking Requirement Impacts on Housing Affordability — VTPI](https://www.vtpi.org/park-hou.pdf)
- [Maps: How Much of Your City Is Parking? — Planetizen](https://www.planetizen.com/news/2023/03/122397-maps-how-much-your-city-parking)

### Fiscal Zoning
- Fischel, W. (2014). "Fiscal Zoning and Economists' Views of the Property Tax." Lincoln Institute of Land Policy Working Paper.
- [Understanding the Fiscal Impact of Zoning — Smart Growth America](https://smartgrowthamerica.org/understanding-the-fiscal-impact-of-zoning-and-how-smart-growth-solutions-can-foster-fiscal-responsibility/)
- [Value Per Acre Analysis: A How-To for Beginners — Strong Towns](https://www.strongtowns.org/journal/2018-10-19-value-per-acre-analysis-a-how-to-for-beginners)
- [What's in Your City's Wallet? — Strong Towns](https://archive.strongtowns.org/journal/2019/3/25/whats-in-your-citys-wallet)
- [Industrial Rezoning in U.S. Cities — Manhattan Institute](https://manhattan.institute/article/industrial-rezoning-in-u-s-cities)
- [Fiscal Zoning — Housing Affordability Institute](https://www.housingaffordabilityinstitute.org/fiscal-zoning-2/)
- [Building Better Budgets — Smart Growth America (PDF)](https://smartgrowthamerica.org/wp-content/uploads/2016/08/building-better-budgets.pdf)

### Variance Approval Dynamics
- [Variances: A Canary in the Coal Mine for Zoning Reform? — Pepperdine Law Review](https://digitalcommons.pepperdine.edu/cgi/viewcontent.cgi?article=2635&context=plr)
- [Variance Standards: What Is Hardship? — UNC School of Government](https://canons.sog.unc.edu/2014/05/variance-standards-what-is-hardship-and-when-is-it-unnecessary/)
- [New York State Zoning Board of Appeals: A Guidebook for Local Officials — Syracuse EFC](https://efc.syr.edu/wp-content/uploads/2017/06/NYS-Zoning-Board-Appeals.pdf)
- [Zoning Board of Appeals Overview — NYS Department of State](https://dos.ny.gov/zoning-board-appeals-overview)
- [A Primer on Area Variances in New York — WMPF](https://www.wmpf.org/wp-content/uploads/2017/05/WMPF-LUTI-2017-A-Primer-on-Area-Variances-in-New-York.pdf)

### Feedback Loops and Urban Economics
- [Zoning, Land Use, and the Reproduction of Urban Inequality — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10691857/)
- [Sprawl and Blight — ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0094119010000677)
- [Decentralized Zoning with Agglomeration Spillovers — University of Illinois](https://economics.illinois.edu/sites/default/files/assoc-files/285/AKhan-JMP-compressed.pdf)
