# Urban Density Gradients

> How population density distributes across cities — exponential decay models, center-of-mass heuristics, and density gradient dynamics.

## Table of Contents

- [Clark's Law (1951)](#clarks-law-1951)
- [Alonso-Muth-Mills Model](#alonso-muth-mills-model)
- [Empirical Gradient Data](#empirical-gradient-data)
- [Gradient Breaks and Discontinuities](#gradient-breaks-and-discontinuities)
- [Polycentric Gradient Interactions](#polycentric-gradient-interactions)
- [Temporal Evolution of Gradients](#temporal-evolution-of-gradients)
- [Amenity-Driven Gradient Anomalies](#amenity-driven-gradient-anomalies)
- [Gradient Steepness as Diagnostic](#gradient-steepness-as-diagnostic)
- [Application to Bitborough](#application-to-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

## Clark's Law (1951)

Population density decreases exponentially with distance from the city center:

```
D(x) = D₀ × e^(-bx)
```

- `D(x)` — population density at distance x from center
- `D₀` — density at city center
- `b` — density gradient (steepness of decay)
- Cities can be visualized as "exponential density cones"

The characteristic radius `r₀ = 1/b` gives the distance at which density falls to ~37% (1/e) of its central value. This single parameter summarizes how steeply the city's density falls off.

Clark's original 1951 analysis of 20 global cities found characteristic decay lengths (`r₀`) ranging from 0.7 km to 8 km, with a mean of 3.2 km, and central densities (`D₀`) ranging from 7,700 to 300,000 inhabitants/km², averaging around 70,000 inhabitants/km².

**Geographic variation:**
- Asian/European cities: steep gradients (compact, well-defined cores)
- North American cities: shallow gradients (sprawl, uniform density)
- Paris: strong center; Los Angeles: relatively flat

**City size:** Larger cities are denser *and* more spread out — the cone is both taller and wider. The characteristic decay distance scales with the square root of population: `r₀(P) ~ sqrt(P)`. Lemoy and Caruso's analysis of 300 European functional urban areas confirmed this — larger cities appear as proportionally scaled versions of smaller ones (homothetic scaling).

## Alonso-Muth-Mills Model

Provides the theoretical foundation for Clark's Law. Density gradient emerges from a trade-off:

- Land near the center is expensive -> households substitute density for space
- Land far from center is cheap but commute costs rise -> households compensate with larger, cheaper land
- Result: density declines monotonically with distance from CBD

**Key insight for simulation:** Accessibility drives density. Areas with lower effective distance from employment centers develop denser, not just areas that are geographically close.

## Empirical Gradient Data

### Measured Density Profiles for World Cities

The following table synthesizes data from Bertaud & Malpezzi (2003), Clark (1951), the Transport Geography project, and Mountain Doodles density timeline analysis. Values are approximate, drawn from fitted exponential models and published density-distance profiles.

| City | D₀ (persons/km²) | b (km⁻¹) | r₀ = 1/b (km) | Profile shape | Notes |
|------|-------------------|-----------|----------------|---------------|-------|
| **Paris** | ~48,000 | ~0.35 | ~2.9 | Steep cone, very good exponential fit | Strong monocentric core; density flattens slightly over time |
| **Barcelona** | ~40,000 | ~0.40 | ~2.5 | High density plateau, sharp drop at edge | Compact Eixample grid holds density far from center |
| **London** | ~25,000 | ~0.15 | ~6.7 | Peak at ~5 km ring, not center | CBD dominated by commercial use; residential peak offset |
| **New York (Manhattan)** | ~59,000 | ~0.20 | ~5.0 | Very high core, sharp drop at borough edges | Outer boroughs form secondary plateau at ~10,000-15,000/km² |
| **Tokyo** | ~30,000 | ~0.12 | ~8.3 | Broad cone with subcenter bumps | Central dip at Imperial Palace; polycentric rail-node peaks |
| **Los Angeles** | ~8,000 | ~0.04 | ~25.0 | Nearly flat, weak gradient | Consistently low gradient across decades; quintessential sprawl |
| **Moscow** | ~15,000 | ~0.08 | ~12.5 | Inverted center (low core, high ring) | Soviet-era planning created density band around center; positive gradient anomaly |
| **Shanghai** | ~45,000 | ~0.18 | ~5.6 | Good exponential fit | Rapid densification; gradient maintained through growth |
| **Mumbai** | ~50,000+ | ~0.01 | ~100 | Extremely flat | b = -0.01 with poor fit (R² = 0.19); peninsula geography distorts gradient |
| **Bangkok** | ~25,000 | ~0.10 | ~10.0 | Moderate cone, fairly constant over time | Maintained stable gradient 1975-2015 |
| **Vancouver** | ~12,000 | ~0.14 (1975) -> ~0.19 (2015) | ~7.1 -> ~5.3 | Gradient steepened over time | Counter-trend: deliberate densification policy increased core density |

### Density-Distance Profiles (Selected Cities)

Approximate population density at distance rings from the city center, synthesized from Bertaud (2003) and Transport Geography data:

```
Distance    Paris      New York   Tokyo      Los Angeles
(km)        (per km²)  (per km²)  (per km²)  (per km²)
─────────────────────────────────────────────────────────
0-2         48,000     59,000     22,000*    8,000
2-5         35,000     40,000     28,000     7,500
5-10        20,000     15,000     22,000     7,000
10-15       10,000     8,000      18,000     6,500
15-20       5,000      5,000      14,000     6,000
20-30       2,000      3,000      10,000     5,000
30-40       800        1,500      6,000      4,000

* Tokyo center dip: Imperial Palace grounds depress the 0-2km ring
```

The contrast is stark: Paris loses 90% of its density by 15 km from center; Los Angeles retains 75% at the same distance.

## Gradient Breaks and Discontinuities

Real cities deviate from smooth exponential decay. Physical barriers, infrastructure, and zoning boundaries create sharp discontinuities — "kinks" in the gradient that a simple `D₀ × e^(-bx)` cannot capture.

### Highways as Barriers

Urban expressways act as hard edges in the density surface. They sever neighborhood connectivity and create abrupt density drops on one or both sides.

**Chicago — Dan Ryan Expressway (I-90/94):** The most documented case of a highway functioning as a density wall. When final plans were announced, the Dan Ryan had been realigned several blocks eastward to run along Wentworth Avenue — a less direct route requiring two sharp curves — so it would serve as a barrier between the Black South Side (Bronzeville) and the white South Side (Bridgeport). The expressway displaced over 81,000 people and created a persistent density discontinuity: neighborhoods east of the Dan Ryan developed at significantly different densities and demographics than those immediately west. Research confirms that at the granularity of individual social ties, urban highways are associated with decreased social connectivity, and this barrier effect is especially strong at short distances.

**General pattern:** Highway corridors create "density shadows" — a low-density band 200-500m wide along the route, with density recovering beyond that band. When highways are depressed or elevated, the shadow is narrower; at-grade highways with frontage roads create the widest shadows.

### Rivers as Gradient Modifiers

Rivers create asymmetric density profiles depending on bridge density and crossing quality.

**London — Thames:** The spatial extent of high building densities is significantly smaller south of the Thames, basically limited to the central areas north of the river between the City and Hyde Park. South London appears particularly inaccessible in density data. The reason: the Thames is wide, and London has relatively few bridges.

**Paris — Seine:** In contrast, densities remain continuously very high both north and south of the Seine. The Seine is narrower than the Thames and has 2.5 times as many bridges, so it functions less as a barrier and more as an amenity axis. The density surface barely registers the river.

**Takeaway for modeling:** A river's barrier effect scales with `width / bridge_density`. A narrow river with frequent crossings (Seine) barely dents the gradient; a wide river with few crossings (Thames, Yangtze) creates measurable density asymmetry.

### Industrial Zones

Heavy industrial land uses create dead zones in the density gradient — areas of near-zero residential density that interrupt the smooth exponential surface. These are especially visible in older manufacturing cities (Detroit, Pittsburgh, the Ruhr) where industrial belts ring the historic core. The gradient resumes on the far side of the industrial zone, but often at a lower level, as if "reset."

### District and Zoning Boundaries

Abrupt zoning transitions (e.g., single-family to multifamily, or residential to commercial) produce step-function changes in density. This is especially visible at the edges of historic districts with height restrictions, or at city-county boundaries where different building codes apply.

## Polycentric Gradient Interactions

When a city has multiple employment centers, each generates its own density cone. The question is how these cones combine.

### The Additive (Superposition) Model

The standard polycentric extension of Clark's law uses additive superposition — density at any point is the sum of contributions from all centers:

```
D(x) = sum_j [ D₀ⱼ × e^(-bⱼ × dⱼ(x)) ]
```

Where:
- `j` indexes each center (CBD + subcenters)
- `D₀ⱼ` is the peak density attributable to center j
- `bⱼ` is the gradient for center j (subcenters typically have steeper gradients than the CBD)
- `dⱼ(x)` is the distance from point x to center j

McMillen (2001) formalized the two-stage approach: first identify candidate subcenters using locally weighted regression on employment density, then estimate each subcenter's contribution to the overall density surface. The additive model furnishes good descriptions for both monocentric and polycentric cities when combined with spatial regression to handle autocorrelation.

**Multicollinearity problem:** As more centers are added, distances to nearby centers become correlated. Inverse-distance weighting for subcenters (rather than raw distance) helps mitigate this.

### Tokyo: Rail-Driven Polycentricity

Tokyo is the canonical example of planned polycentric development. The Tokyo Metropolitan Government designated seven subcenters — Shinjuku, Shibuya, Ikebukuro, Ueno/Asakusa, Kinshicho, Osaki, and the Tokyo Waterfront — each anchored by major rail interchanges.

**Empirical evidence:**
- From a regional view, Tokyo has a typical monocentric concentric structure, but at fine scale, the employment distribution expands along railroad corridors into the suburbs, with both the central district and suburbs being polycentric.
- The seven central wards averaged 142,634 new jobs each from 1970-1995, while the designated subcenters averaged 65,112 new jobs — nearly three times the 23,691 average for other areas in the central 23 wards.
- Over 5 million new jobs were added 1970-1995, with growth primarily outside the 23 central wards. The subcenters averaged four times the growth rate of ordinary suburban municipalities.
- The density surface shows clear secondary peaks at each subcenter, superimposed on the overall distance-decay from the Marunouchi/Tokyo Station core. The effect is a "mountain range" rather than a single cone.

The functional structure of the Tokyo Metropolitan Area has been described as a four-level annular pattern: (1) the CBD core, (2) the inner ring of designated subcenters, (3) suburban rail-corridor clusters, and (4) peripheral satellite cities.

### Los Angeles: Organic Polycentricity

Los Angeles represents the opposite path — polycentric structure emerging organically from automobile-driven decentralization rather than rail-based planning.

**Giuliano and Small (1991)** identified 32 employment subcenters using a cutoff of >10 employees/acre and >10,000 total employees. Key findings:
- Downtown LA remained dominant, with three large subcenters forming a nearly contiguous corridor with it.
- Two-thirds of regional employment fell outside any of the 32 identified centers — the "dispersed" component is enormous.
- The Spearman rank correlation between subcenter employment density and distance from CBD was 0.50 — significant but far from deterministic.
- By 2019, the number of identifiable centers ranged from 32 to over 50 depending on threshold criteria.

**Density implication:** In LA, the additive superposition model shows many shallow, broad cones overlapping to produce the characteristic flat density surface. No single subcenter dominates strongly enough to produce a distinct peak in the residential density profile. The result is a city where the polycentric model fits statistically better than the monocentric one, but neither fits well — the density surface is more of a lumpy plain than a mountain range.

### Combining Models

In practice, polycentric cities fall on a spectrum:

| Type | Example | CBD share of employment | Subcenter signature in density profile |
|------|---------|------------------------|---------------------------------------|
| Strong monocentric | Paris | ~40-50% | Negligible; single dominant cone |
| Polycentric with dominant core | Tokyo | ~25-30% | Clear secondary peaks on slopes of main cone |
| Polycentric, distributed | LA, Houston | ~5-10% | Flat surface, many weak overlapping cones |
| Inverted/planned | Moscow, Brasilia | Varies | Positive gradient (density increases away from center) |

## Temporal Evolution of Gradients

Density gradients have flattened dramatically over the 20th century, driven primarily by falling transportation costs — especially the automobile.

### The Long Flattening

**Quantitative evidence for US cities:**
- Density gradients across 41 US cities declined by **77% between 1900 and 1970** (Edmonston, 1975).
- A five-fold decline in average census tract density occurred in 20 US cities between 1910 and 2000, at an average long-term rate of **1.9% per annum**.
- Globally, a threefold decline in average urbanized area densities occurred across a sample of 30 cities during the 20th century, declining since a peak circa 1890, at an average long-term annual rate of **1.0-1.5%** (Angel et al., Lincoln Institute).

**Approximate gradient evolution (composite US data):**

| Era | Typical b (km⁻¹) | r₀ = 1/b (km) | Dominant transport mode |
|-----|-------------------|----------------|------------------------|
| 1900 | ~0.50-0.80 | 1.3-2.0 | Walking, horse-drawn streetcar |
| 1920 | ~0.35-0.50 | 2.0-2.9 | Electric streetcar, early auto |
| 1950 | ~0.15-0.30 | 3.3-6.7 | Automobile becoming dominant |
| 1970 | ~0.08-0.15 | 6.7-12.5 | Interstate Highway System built |
| 2000 | ~0.04-0.10 | 10.0-25.0 | Fully auto-dependent suburban form |

### The Automobile's Role

The automobile is the single largest driver of gradient flattening. Garcia-Lopez et al. (2022) studied 123 cities in 57 countries and found:

- A one standard deviation increase in car ownership (~20 cars per 100 inhabitants) causes a population density reduction of approximately **35-40%** in the long run.
- This effect is mainly driven by **expansion of the built-up area** (sprawl into the periphery), not by population leaving the city.
- In the US, automobile registrations grew from 23 million (1939) to 82 million (1960) to 221 million (2000), directly paralleling density decline.
- Average commuting distance in Britain expanded from ~3.5 km (1900) to ~15 km (present day) as car ownership rose.
- If developing countries reach Western European car ownership levels, urban density is projected to fall **~50%**. At North American/Australian levels, the projected decline is **~60%**.

### Counter-Trends: Reurbanization

Some cities have bucked the flattening trend in recent decades:

- **Vancouver:** Gradient coefficient *increased* from -0.14 (1975) to -0.19 (2015) — the core got denser relative to the periphery due to deliberate densification policy.
- **Paris:** Gradient remained steep and "slightly flattened" over time — much less dramatic than US cities, reflecting sustained rail transit investment and height regulation in the center.
- **Barcelona:** Maintained its high-density plateau through the Eixample grid, with density dropping sharply only at the metropolitan edge.

The 21st-century pattern in some Western cities is a reversal: young professionals and empty-nesters moving back toward cores, steepening the gradient modestly after a century of flattening.

## Amenity-Driven Gradient Anomalies

The simple exponential model assumes density declines monotonically from center to edge. In reality, amenities create localized density bumps — non-monotonic anomalies where density is higher than the baseline gradient predicts.

### Parks as Density Attractors

Large urban parks create a paradox: the park itself is zero-density, but adjacent blocks are often among the densest in the city.

**New York — Central Park:** The Upper East Side and Upper West Side, bordering Central Park, contain some of Manhattan's densest residential neighborhoods. Luxury courtyard buildings like the Dakota (1884) and the Apthorp (1908) were built specifically to capitalize on park proximity. The density profile across Manhattan shows a distinct dip at the park followed by peaks on both sides — a "density saddle" pattern. This effect has intensified over time: Central Park proximity now commands extreme real estate premiums, driving developers to maximize floor area on adjacent parcels.

**General pattern:** Parks create a ring of elevated density at their edges, typically 1-3 blocks deep, before density returns to baseline gradient levels. The effect is strongest for large parks (>10 hectares) in otherwise dense neighborhoods.

### Waterfront Premiums

Water features — rivers, harbors, lakefronts — create linear amenity-driven density anomalies.

**Empirical magnitude:** Waterfront homes across the US sell for an average of 78% more than comparable inland homes (Zillow). Beachfront properties globally command a 76% premium. Harbor/port views generate a 61% premium; riverside locations 39%. The premium has been *growing*: waterfront homes were worth 64% more than typical homes two decades ago but are now worth 116% more at the median.

This price premium translates directly to density: developers build taller and denser near waterfronts because the land value supports it. The density profile perpendicular to an attractive waterfront typically shows:

```
Density
  |   ___
  |  /   \___
  | /        \___________
  |/
  +─────────────────────────
  Water  1km    2km    3km
```

The peak occurs 200-500m inland (not at the water's edge, which is often occupied by parks, promenades, or commercial uses), then decays back to the background gradient.

### Historic Districts

Historic preservation zones create complex density anomalies. Height restrictions and building preservation requirements cap density, producing a "density crater" in what might otherwise be a dense area. But the charm and walkability of these districts attract residents, so the surrounding blocks often compensate with above-gradient density. The net effect is non-monotonic: a local dip in the historic core flanked by density spikes.

### Transit Station Bumps

Transit-oriented development (TOD) creates the most predictable amenity bumps. A well-served rail station produces a density peak that decays exponentially with its own mini-gradient, superimposed on the background city gradient. This is the polycentric model at micro-scale — every station is a tiny subcenter.

## Gradient Steepness as Diagnostic

The gradient parameter `b` is not just a descriptive statistic — it is a diagnostic tool for urban health, policy outcomes, and transportation efficiency.

### What Steep Gradients Signal (high b, small r₀)

- **Compact urban form:** Short distances between residents and services
- **Transit viability:** High ridership catchment density makes rail and bus systems financially sustainable
- **Lower per-capita energy use:** Compact cities with high density gradients can reduce energy consumption by up to 30% compared to sprawling cities (IEA, 2016)
- **Walkability:** More destinations within walking distance of more residents
- **Higher land value volatility:** Steep gradients mean location matters enormously — small distance changes produce large value changes
- **Examples:** Paris (b ~ 0.35), Barcelona (b ~ 0.40), pre-war Manhattan

### What Flat Gradients Signal (low b, large r₀)

- **Auto-dependence:** Low density everywhere means transit cannot compete with cars
- **Long commutes:** Dispersed employment and housing means more vehicle-miles traveled
- **Infrastructure inefficiency:** Sewer, water, and road networks must serve large low-density areas
- **Lower housing costs (initially):** Abundant peripheral land keeps housing affordable until induced demand catches up
- **Resilience risk:** Sprawl-dependent cities are vulnerable to fuel price shocks
- **Examples:** Los Angeles (b ~ 0.04), Houston, Atlanta, Phoenix

### Gradient as Policy Scorecard

A five-metric framework for comparing urban form (used in a global study of 462 cities) includes:
1. **Weighted density** — how dense the average resident's neighborhood is
2. **Density gradient slope** — the `b` parameter
3. **Density gradient intercept** — the `D₀` parameter
4. **Compactness** — how circular/contiguous the built-up area is
5. **Street connectivity** — intersection density and block size

The density gradient slope (b) and intercept (D₀) together capture more about urban form than any single density number. A city can have high *average* density but a flat gradient (uniform mid-rise sprawl), or moderate average density but a steep gradient (dense core with sparse periphery). The gradient distinguishes these very different urban forms.

### Anomalous Gradient Shapes

Some cities defy the standard declining exponential:

- **Moscow / Brasilia / Seoul:** Predominantly positive gradients (density increases away from center), a product of centralized planning that reserved the core for government functions and pushed residents to peripheral housing blocks.
- **London:** Density peaks not at the center but at ~5 km radius, because the City of London and Westminster are dominated by commercial uses. The gradient is "headless" — high density begins outside the CBD.
- **Mumbai:** Essentially no gradient (b ~ 0.01, R² = 0.19). Peninsula geography constrains the city to a narrow strip, making radial models meaningless.

## Application to Bitborough

### Core Density Formula

Medium-density and high-density upgrade probability should follow exponential decay from anchor points. The base formula:

```
P_upgrade(tile) = demand_factor × e^(-d_eff / radius)
```

Where:
- `demand_factor` — global demand pressure (function of population, employment, satisfaction)
- `d_eff` — effective distance from the nearest density anchor (see below)
- `radius` — characteristic decay distance; should grow with city population

### Effective Distance Calculation

Effective distance accounts for transit and barriers, not just Euclidean distance:

```
d_eff(tile, anchor) = euclidean_distance(tile, anchor)
                      × terrain_penalty(tile)      -- rivers, hills: 1.5-3.0x
                      × barrier_penalty(tile)       -- highways, rail yards: 1.5-2.0x
                      / transit_bonus(tile, anchor)  -- if transit connects them: 0.3-0.7x
```

This captures the key insight from the Alonso-Muth-Mills model: accessibility, not geometry, drives density.

### Polycentric Superposition

When multiple density anchors exist (city center, transit stations, commercial districts), use additive superposition:

```
P_upgrade(tile) = min(1.0, sum_j [ weight_j × e^(-d_eff(tile, anchor_j) / radius_j) ])
```

Where:
- `weight_j` — strength of anchor j (city center = 1.0, major transit station = 0.4, minor station = 0.15, commercial zone = 0.2)
- `radius_j` — decay radius for anchor j (city center radius grows with sqrt(population); station radius is fixed at ~3-5 tiles)

### Gradient Flattening Over Time

As the city grows and transport improves, the gradient should flatten:

```
radius(t) = base_radius × sqrt(population(t) / initial_population)
```

This mirrors the empirical finding that `r₀ ~ sqrt(P)`. A city of 10,000 might have `radius = 5 tiles`; at 100,000, `radius = ~16 tiles`.

Additionally, road infrastructure investment should *independently* flatten the gradient:

```
radius_effective = radius × (1 + road_network_coverage × 0.5)
```

Where `road_network_coverage` is the fraction of the city area served by arterial roads (0.0 to 1.0).

### Barrier and Amenity Modifiers

**Gradient breaks** — tiles adjacent to highway-type roads, industrial zones, or wide rivers should have a density penalty:

```
density_cap(tile) = base_density_cap × barrier_factor
```

Where `barrier_factor` is:
- `0.3` for tiles directly adjacent to a highway
- `0.5` for tiles one step from a highway
- `0.6` for tiles adjacent to heavy industry
- `0.7` for tiles across an unbridged river

**Amenity bumps** — tiles adjacent to parks or waterfronts should get a density bonus:

```
amenity_bonus(tile) = park_adjacency × 0.15 + water_adjacency × 0.10
P_upgrade(tile) = P_upgrade(tile) × (1 + amenity_bonus(tile))
```

This creates the "density saddle" pattern around parks: zero density on the park tile, elevated density on the ring of adjacent tiles.

### Diagnostic Use of Gradient

The game could compute the city's actual density gradient (by fitting an exponential to the density-distance data) and display it as a city health metric:

- **b > 0.3:** "Compact core" — transit works well, walkable, but may signal lack of suburban development
- **b = 0.1-0.3:** "Balanced" — healthy gradient with accessible core and livable suburbs
- **b < 0.1:** "Sprawling" — auto-dependent, high infrastructure costs, transit struggles
- **b near 0 or positive:** "Anomalous" — may indicate planning failures or geographic constraints

This gives the player a single number that summarizes their city's spatial structure and hints at what interventions might help.

### Suggested Mechanic: Density Pressure Visualization

Render the density gradient as a heat map overlay: bright at density anchors, fading outward. Tiles where actual density is well below the gradient-predicted density are "underbuilt" (opportunity zones); tiles above the prediction are "overbuilt" (stress zones needing infrastructure).

## Cross-References

- [Transit-Oriented Development](./transit-oriented-development.md) — TOD creates secondary density peaks that modify the baseline gradient
- [Urban Growth Patterns](./urban-growth-patterns.md) — Monocentric vs. polycentric models of city structure
- [Land Use and Zoning](./land-use-and-zoning.md) — Zoning regulations constrain and shape natural density gradients
- [Real Estate Development](./real-estate-development.md) — Developer feasibility analysis, construction cost thresholds that produce density transitions
- [Urban Design and Walkability](./urban-design-and-walkability.md) — Walkability-density feedback loop, block size effects on density gradients

## Sources

### Foundational

- Clark, C. (1951). "Urban population densities." *Journal of the Royal Statistical Society*
- Muth, R.F. (1969). *Cities and Housing: The Spatial Pattern of Urban Residential Land Use.* University of Chicago Press
- Mills, E.S. (1972). *Studies in the Structure of the Urban Economy.* Johns Hopkins Press
- Alonso, W. (1964). *Location and Land Use.* Harvard University Press

### Empirical Density Data

- Bertaud, A. & Malpezzi, S. (2003). ["The Spatial Distribution of Population in 48 World Cities."](https://www.researchgate.net/publication/228593725_The_Spatial_Distribution_of_Population_in_48_World_Cities_Implications_for_Economies_in_Transition) Center for Urban Land Economics Research, University of Wisconsin
- [Population Density by Distance from City Center](https://transportgeography.org/contents/chapter8/transportation-urban-form/distance-density-urban/) — Transport Geography
- [3D structure of population density in world cities](https://www.nature.com/articles/s42949-025-00262-4) — npj Urban Sustainability (2025)
- [Density timelines — Mountain Doodles](https://doodles.mountainmath.ca/posts/2019-03-27-density-timelines/) — Vancouver, Paris, New York, Shanghai, Bangkok, LA gradient analysis using GHS 250m data (1975-2015)

### Polycentric Models

- Giuliano, G. & Small, K.A. (1991). ["Subcenters in the Los Angeles region."](https://sites.socsci.uci.edu/~ksmall/SUBCEN1.pdf) *Regional Science and Urban Economics* 21(2), 163-182
- McMillen, D.P. (2001). "Nonparametric Employment Subcenter Identification." *Journal of Urban Economics* 50, 448-473
- [Modeling Population Density across Major US Cities: A Polycentric Spatial Regression Approach](https://link.springer.com/article/10.1007/s10109-006-0032-y) — Journal of Geographical Systems
- Sorensen, A. (2001). ["Subcentres and Satellite Cities: Tokyo's 20th Century Experience of Planned Polycentrism."](https://www.tandfonline.com/doi/abs/10.1080/13563470120026505) *International Planning Studies* 6(1)

### Temporal Evolution and Automobiles

- Edmonston, B. (1975). *Population Distribution in American Cities.* — Density gradient decline data for 41 US cities (1900-1970)
- Garcia-Lopez, M.A., Pasidis, I., & Viladecans-Marsal, E. (2022). ["Automobiles and urban density."](https://academic.oup.com/joeg/article/22/5/1073/6530672) *Journal of Economic Geography* 22(5), 1073-1095
- [Cars make cities less compact](https://cepr.org/voxeu/columns/cars-make-cities-less-compact) — CEPR VoxEU summary of Garcia-Lopez et al.
- Angel, S. et al. ["The Persistent Decline in Urban Densities."](https://www.lincolninst.edu/app/uploads/2024/04/1834_1085_angel_final_1.pdf) Lincoln Institute of Land Policy
- [Modeling the spatial growth of cities](https://arxiv.org/html/2510.03045v1) — Lemoy & Caruso homothetic scaling analysis

### Gradient Breaks and Amenities

- [How the Dan Ryan changed the South Side](https://www.wbez.org/curious-city/2013/06/04/how-the-dan-ryan-changed-the-south-side) — WBEZ Chicago
- [Urban highways are barriers to social ties](https://pmc.ncbi.nlm.nih.gov/articles/PMC11912457/) — PMC (2025)
- [The Central Park Effect](https://assets.centralparknyc.org/pdfs/about/The_Central_Park_Effect.pdf) — Central Park Conservancy
- [Density Gradient in Urban Planning](https://www.numberanalytics.com/blog/density-gradient-urban-environmental-policy) — Number Analytics
- [Urban form impacts on air pollution and green space: 462 cities](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0278265) — PLOS One (five-metric urban form framework)
