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

### Feedback Loops and Urban Economics
- [Zoning, Land Use, and the Reproduction of Urban Inequality — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10691857/)
- [Sprawl and Blight — ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0094119010000677)
- [Decentralized Zoning with Agglomeration Spillovers — University of Illinois](https://economics.illinois.edu/sites/default/files/assoc-files/285/AKhan-JMP-compressed.pdf)
