# Housing

> How housing markets function, filter, and fail — models for simulating residential development and affordability.

## Table of Contents

- [Supply and Demand](#supply-and-demand)
- [Filtering Theory](#filtering-theory)
- [Housing Affordability](#housing-affordability)
- [Housing Production](#housing-production)
- [Residential Density Types](#residential-density-types)
- [Rent Control](#rent-control)
- [Public Housing](#public-housing)
- [Inclusionary Zoning](#inclusionary-zoning)
- [NIMBY/YIMBY Dynamics](#nimbyyimby-dynamics)
- [Housing and Schools](#housing-and-schools)
- [Vacancy Rates](#vacancy-rates)
- [Housing Tenure](#housing-tenure)
- [Homelessness](#homelessness)
- [Application to Bitborough](#application-to-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

---

## Supply and Demand

Housing prices are determined by the intersection of demand (household formation, income growth, migration, interest rates) and supply (construction of new units, conversion of existing stock). Unlike most commodities, housing supply responds slowly to price signals due to construction lag, land-use regulation, and the durability of the existing stock.

### Price Determination

The basic model: when demand increases in a market with inelastic supply, prices rise sharply. When supply is elastic, demand shocks translate into more construction rather than higher prices. This is the central insight of Saiz (2010), who estimated housing supply elasticities for 95 US metro areas using satellite data on terrain and water bodies. His findings:

| Metro Area Type | Supply Elasticity | Price Response to Demand Shock |
|---|---|---|
| Geographically unconstrained (e.g., Atlanta) | ~2.5 | Mostly new construction |
| Moderately constrained (e.g., Chicago) | ~1.3 | Mixed price + construction |
| Severely constrained (e.g., San Francisco) | ~0.7 | Mostly price increases |

The population-weighted average elasticity across US metros was 1.75 in 2000. The median was 1.34 with a maximum of 5.16 (Saiz 2010). CEPR research shows US housing supply has become less elastic since the 2008 financial crisis, with the largest declines in places where land-use regulation tightened most.

### Construction Lag

New housing takes months or years to deliver. This lag is a fundamental source of supply inelasticity and creates a cobweb-style dynamic where builders respond to past prices rather than future ones.

| Building Type | Average Permit-to-Completion (2024) |
|---|---|
| Single-family detached | 10.1 months |
| 2-4 unit buildings | 15.3 months |
| 5-9 unit buildings | 19.1 months |
| 10-19 unit buildings | 19.2 months |
| 20+ unit buildings | 22.1 months |

Source: US Census Bureau, Survey of Construction (2024); NAHB Eye on Housing.

Regional variation is significant: the Northeast averages 23.4 months for multifamily vs. 18.5 months in the South. Regulatory permitting adds further delay beyond physical construction time. The Federal Reserve Board (2012) found that permitting lags and rising marginal costs explain most of the observable differences in elasticity across markets.

### Housing Starts and the Business Cycle

Edward Leamer (2007) argued that "housing IS the business cycle." Residential fixed investment leads GDP by roughly 7 quarters. Between 1980 and 2010, each of the five US recessions was preceded by a large decline in single-family housing starts. Housing starts are a component of the Conference Board's Leading Economic Indicators index for this reason. More recent research (Green 2022) suggests the leading-indicator relationship has weakened somewhat, but housing remains a powerful cyclical signal.

---

## Filtering Theory

Filtering describes how housing moves down the quality and price spectrum as it ages, eventually serving lower-income households. The concept is central to housing policy debates: if new luxury construction eventually becomes affordable through depreciation, then building at any price point expands access over time.

### The Ratcliff Model (1949)

Richard Ratcliff defined filtering as "the changing of occupancy as the housing that is occupied by one income group becomes available to the next lower income group as a result of decline in market price." Key conditions for filtering to function:

1. A structural oversupply of housing is necessary — tight markets stall the filtering chain.
2. New construction must be maintained at the top of the market to keep the chain moving.
3. The process works through a sequence: new luxury units free up upper-middle units, which free up middle units, and so on.

### The Lowry Critique (1960)

Ira Lowry challenged Ratcliff's optimism, arguing that filtering "fails to provide adequate housing without accelerating physical deterioration." Lowry and Olsen (1969) noted that if housing stock were perfectly malleable (easily renovated or demolished), price filtering would be impossible in the long run because owners would simply upgrade declining units. In practice, housing is not perfectly malleable, so filtering does occur — but it is uneven and slow.

### Empirical Evidence

The NMHC Research Foundation (2020) tracked apartment filtering between 1980 and 2018 and found that housing does filter downward in value and rent over time, but the rate varies dramatically by geography. In Philadelphia County, a complete filtering cycle — from top-market to bottom-market — appears to take up to 100 years. Research published in the Journal of Regional Science (2021) found significant geographic and temporal variation in filtering rates, with faster filtering in metros with more elastic housing supply.

**For simulation purposes:** filtering means that building age should gradually reduce both quality and rent level. New high-capacity buildings serve high-income demand; as they age, they transition to serving lower income tiers. This is a natural justification for Bitborough's existing density-downgrade mechanic (dereliction after sustained low occupancy).

---

## Housing Affordability

### The 30% Rule

The standard US affordability threshold: a household is "cost-burdened" if it spends more than 30% of gross income on housing (rent or mortgage + utilities). Congress adopted this threshold in 1981, replacing an earlier 25% cap. HUD uses two tiers:

| Classification | Housing Cost Share | US Households (2024) |
|---|---|---|
| Not burdened | < 30% of income | ~88.7 million |
| Cost-burdened | 30-50% of income | ~21.9 million |
| Severely burdened | > 50% of income | ~21.6 million |
| **Total burdened** | **> 30%** | **43.5 million (33%)** |

Source: Harvard JCHS, State of the Nation's Housing 2025; CRS Report R48450 (2025).

Renters are disproportionately affected: 49% of all US renters (22.7 million households) were cost-burdened in 2024 — a record high for the fourth consecutive year. Geographic concentration is severe: 60% of renters in Florida, 57% in Nevada, and 55% in California exceed the 30% threshold.

### Affordability Indexes

Several measures exist beyond the 30% rule:

- **NAR Housing Affordability Index**: compares median family income to the income required to qualify for a median-priced home mortgage. An index of 100 means the median family can exactly afford the median home.
- **HUD Area Median Income (AMI) bands**: affordable housing programs typically target households at 30%, 50%, 60%, or 80% of AMI.
- **Residual income approach**: measures what households have left after paying for housing, rather than the housing-to-income ratio. The 30% rule is critiqued because 30% of a $30,000 income leaves far less for essentials than 30% of a $100,000 income.

### Causes of Housing Crises

The primary driver of affordability crises is the gap between housing cost growth and income growth. Structural factors include:

1. **Supply constraints**: restrictive zoning, lengthy permitting, NIMBYism, geographic barriers.
2. **Demand shocks**: population growth, in-migration, household formation, speculative investment.
3. **Construction cost inflation**: labor shortages, material costs (lumber, concrete), tariffs.
4. **Interest rates**: higher rates reduce purchasing power for buyers but can also reduce new supply.
5. **Land costs**: in constrained markets, land can account for 30-50% of total housing cost.

As of Q1 2025, homeownership was unaffordable (by HUD's definition) in 17 US states, up from only California in Q1 2020.

---

## Housing Production

### Construction Costs

The NAHB's 2024 survey found an average single-family construction cost of $428,215, or approximately $162 per square foot — the highest in the survey's history.

| Cost Component | Share of Total |
|---|---|
| Interior finishes (cabinets, flooring, paint, lighting, appliances) | 24.1% |
| Major systems rough-ins (HVAC, plumbing, electrical) | 19.2% |
| Framing | 17.4% |
| Foundation | 11.9% |
| Exterior finishes | 10.8% |
| Site work | 8.3% |
| Other | 8.3% |

Source: NAHB, Cost of Constructing a Home (2024).

Regional cost variation is extreme:

| Region | Median $/sq ft (2024) |
|---|---|
| New England | $282 |
| Pacific | $223 |
| Middle Atlantic | $198 |
| National median (spec) | $153 |
| East South Central | $133 |

State-level outliers: Hawaii ($230/sf), Alaska ($228/sf), California/New Jersey ($225/sf), Mississippi ($154/sf).

### Construction by Density Type

Multifamily construction costs per unit decrease with scale but costs per square foot increase with building height due to structural requirements (concrete/steel framing, elevator cores, fire suppression):

| Type | Typical Cost/Unit (2024 est.) | Structure |
|---|---|---|
| Single-family detached | $350,000-$450,000 | Wood frame |
| Townhome/rowhouse | $250,000-$350,000 | Wood frame |
| Garden apartment (3-4 story) | $150,000-$250,000 | Wood frame (Type V) |
| Mid-rise (5-8 story) | $200,000-$350,000 | Podium (Type III/V over I) |
| High-rise (9+ story) | $350,000-$600,000+ | Steel/concrete (Type I) |

The "5-over-1" podium design (5 wood-frame stories over a concrete podium) is the dominant US multifamily construction type because it maximizes density within wood-frame cost structure. This is a significant threshold in the real world and could be modeled as the boundary between Bitborough's medium and high density tiers.

---

## Residential Density Types

Density is measured in dwelling units per acre (DU/acre). Real-world ranges by housing type:

| Housing Type | Typical DU/Acre | Stories | Description |
|---|---|---|---|
| Rural/estate | 0.25-1 | 1-2 | Large-lot single-family |
| Suburban single-family | 3-8 | 1-2 | Standard subdivision lots |
| Duplex/triplex | 8-16 | 2-3 | Small multifamily on SF-scale lot |
| Townhome/rowhouse | 12-22 | 2-4 | Attached, narrow lots |
| Garden apartment | 20-40 | 2-4 | Surface parking, landscaped |
| Mid-rise apartment | 50-150 | 5-8 | Structured parking, urban context |
| High-rise apartment | 100-300+ | 9-40+ | Elevator-served, dense urban core |

Sources: MRSC (2017); JHP Architecture; Los Angeles City Planning density tables; MAPC (2024).

Key thresholds:
- **15 DU/acre** is a common "missing middle" target — achievable with townhomes and small apartment buildings while maintaining a neighborhood-scale streetscape.
- **50 DU/acre** roughly marks the transition from garden-style to urban mid-rise, requiring structured parking and elevator service.
- **100+ DU/acre** requires high-rise construction, typically only economically viable in high-rent markets due to steel/concrete structural costs.

### Mapping to Bitborough Tiers

| Bitborough Building | Capacity | Tiles | Effective DU/Acre Equivalent |
|---|---|---|---|
| `res.low` | 10 | 1x1 | Low-density (suburban SF) |
| `res.med` | 100 | 1x1 | Mid-rise apartment |
| `res.med.b` | 120 | 2x1 | Mid-rise, larger footprint |
| `res.high` | 330 | 2x2 | High-rise tower |

The 10:1 capacity jump from `res.low` (10) to `res.med` (100) on the same 1x1 footprint models the real-world ~10x density increase from suburban single-family to mid-rise apartment construction.

---

## Rent Control

Rent control (or rent stabilization) limits the amount by which landlords can increase rents on existing tenants, typically to some percentage above inflation or a fixed cap.

### Diamond, McQuade, and Qian (2019)

The most rigorous modern empirical study. Diamond et al. exploited a 1994 quasi-natural experiment in San Francisco where rent control was extended to buildings with 4 or fewer units built before 1980. Key findings:

- **Tenant mobility reduced 20%**: controlled tenants stayed in their apartments significantly longer, with effects concentrated among tenants over 40 who had lived at their address 4+ years.
- **Rental supply reduced 15%**: landlords responded to rent control by converting units to condos, demolishing buildings, or redeveloping — removing 15% of treated rental stock.
- **Citywide rent increase of 5.1%**: the supply reduction pushed up market rents for everyone.
- **Net welfare effect ambiguous**: incumbent tenants benefited from stability, but the supply reduction undermined long-run affordability — "the exact opposite of the intended goal."

Published in the *American Economic Review*, 109(9), 3365-3394.

### General Empirical Consensus

The economics literature is broadly consistent:

1. **Rent control benefits current tenants** — reduces mobility and displacement in the short run.
2. **Rent control reduces supply** — landlords exit the rental market through conversion, neglect, or demolition.
3. **Rent control reduces maintenance** — capped rents reduce the return on upkeep investment.
4. **Rent control creates misallocation** — controlled tenants stay in units that no longer match their needs (too large, too small, wrong location), reducing market efficiency.

---

## Public Housing

### History (US)

Public housing in the United States evolved through several phases:

1. **1937-1949**: the US Housing Act of 1937 created the framework for federally funded, locally administered public housing projects. Early projects served working-class families displaced by slum clearance.
2. **1949-1970s**: massive expansion under urban renewal. Large high-rise projects concentrated poverty. Many became symbols of physical deterioration and social distress (Pruitt-Igoe, Cabrini-Green).
3. **1974-present**: the Section 8 program introduced vouchers as an alternative. Congress stopped funding new project-based Section 8 contracts in 1983, pivoting to tenant-based vouchers.
4. **1992-present**: HOPE VI and later Choice Neighborhoods replaced distressed projects with mixed-income developments.

### Current Programs

| Program | Units/Households Served | Model |
|---|---|---|
| Public housing (project-based, PHA-owned) | ~960,000 units | Government-owned buildings |
| Housing Choice Vouchers (Section 8) | ~2.3 million | Portable tenant subsidy |
| Project-based rental assistance | ~1.2 million | Subsidy attached to private units |
| Low-Income Housing Tax Credit (LIHTC) | ~3.5 million since 1987 | Tax credits to developers |

Source: CRS Report RL32284; HUD 2022 data.

Vouchers are now the primary federal housing assistance tool. They allow tenants to choose units in the private market and pay approximately 30% of income toward rent, with the voucher covering the remainder up to a payment standard. Evidence shows vouchers improve mobility and provide access to higher-opportunity neighborhoods, particularly for children (Chetty et al. 2016, Moving to Opportunity).

---

## Inclusionary Zoning

Inclusionary zoning (IZ) requires or incentivizes developers to include affordable units in new market-rate developments, typically 10-20% of total units.

### Policy Design

| Feature | Common Approaches |
|---|---|
| Mandate type | Mandatory vs. voluntary |
| Set-aside percentage | 10-25% of units |
| Target income level | 50-80% AMI |
| Duration | 20-99 years (affordability period) |
| Developer incentives | Density bonuses, parking reductions, fee waivers, tax abatement |
| Alternatives | In-lieu fees, off-site construction, land dedication |

### Effectiveness

The Urban Institute (2019) found that most IZ programs produce relatively small numbers of affordable units, particularly in jurisdictions with inexpensive land. However, mandatory programs — applied jurisdiction-wide and targeting multiple income levels — are significantly more productive than voluntary ones. Density bonuses are the most effective incentive: they directly offset the revenue lost to below-market units.

Research from the Furman Center and others shows that IZ works best in high-demand markets where the gap between market rent and affordable rent is large enough to cross-subsidize. In low-demand markets, the affordability mandate can actually discourage development entirely.

**Key finding for developers:** predictability is the most important design element. Developers need clear requirements and consistent administration to accurately calculate costs and profits. Without predictability, development slows.

---

## NIMBY/YIMBY Dynamics

### NIMBY Opposition

NIMBY (Not In My Back Yard) opposition is a major constraint on housing supply. Homeowners and neighborhood groups oppose new development — especially higher-density or affordable housing — through public hearings, lawsuits, and political pressure on zoning boards.

Research reveals structural asymmetries in political participation:
- Homeowners attend local zoning meetings at far higher rates than renters.
- Meeting attendees skew older and wealthier.
- Opponents of development are more likely to participate than supporters.

This creates a systematic bias toward restricting supply. Hsieh and Moretti (2019) estimated that housing restrictions in high-productivity cities cost US workers approximately $1 trillion annually in foregone wages, because workers cannot relocate to where they would be most productive.

### YIMBY Counter-Movement

The YIMBY (Yes In My Back Yard) movement emerged in the 2010s as a pro-housing political force, advocating for zoning reform, density increases, and streamlined permitting. Legislative victories include California's SB 9 (2021, legalizing duplexes on single-family lots), Minneapolis's elimination of single-family-only zoning (2018), and Oregon's statewide upzoning (HB 2001, 2019).

However, recent Yale ISPS research (2025) suggests that anti-development sentiment cannot be explained by self-interest alone — homeowners and renters often hold similar views toward new construction, complicating simple NIMBY narratives.

### Game Design Relevance

NIMBY/YIMBY dynamics create a feedback loop: successful cities attract demand, but existing residents resist the density increases needed to accommodate it. This tension is a natural fit for Bitborough's desirability system — high-desirability areas attract development pressure, but nearby residents could generate political resistance as density increases.

---

## Housing and Schools

### Capitalization of School Quality

A robust empirical finding: school quality is capitalized into home prices. Families bid up prices in neighborhoods with better schools, creating a self-reinforcing sorting mechanism.

**Black (1999)** pioneered the boundary discontinuity approach — comparing houses on opposite sides of school attendance zone boundaries. She found that a one standard deviation increase in school test scores was associated with a 10 percentage point increase in house values. Later studies using similar methods found more modest effects (2-4% per standard deviation) after controlling for neighborhood characteristics.

### Tiebout Sorting

Charles Tiebout (1956) proposed that households "vote with their feet," choosing jurisdictions that offer their preferred bundle of public services and tax rates. Housing markets are the mechanism through which this sorting occurs: households with high willingness-to-pay for school quality bid up prices in good-school districts, excluding lower-income families.

Bayer, Ferreira, and McMillan (2007) estimated that the indirect sorting effects — the way school quality shapes neighborhood demographics, which in turn affect desirability — are 2-4 times larger than the direct effect of school quality alone.

**For simulation:** school quality (if modeled) should increase residential desirability and property values in a radius, creating positive feedback where high-income areas generate better-funded schools, which attract more high-income residents.

---

## Vacancy Rates

The vacancy rate is the share of housing units that are unoccupied and available for rent or sale. It is one of the most direct signals of market tightness.

### Natural Vacancy Rate

The "natural" or equilibrium vacancy rate is the rate at which real rents remain constant — analogous to the natural rate of unemployment. Estimates vary:

| Source | Estimated Natural Vacancy Rate |
|---|---|
| General rule of thumb | 5-8% (rental) |
| Rosen and Smith (1983) | 4-4.5% |
| National average (Q4 2025) | 7.2% (rental), 1.2% (homeowner) |

Source: US Census Bureau Housing Vacancy Survey (Q4 2025); FRED; JSTOR.

### Interpreting Vacancy Signals

| Vacancy Rate | Market Signal |
|---|---|
| < 3% | Severe shortage — rapid rent growth, displacement pressure |
| 3-5% | Tight market — moderate rent growth, limited tenant choice |
| 5-8% | Balanced market — stable rents, normal turnover |
| 8-12% | Soft market — rent discounts, concessions, landlord competition |
| > 12% | Oversupply or decline — falling rents, disinvestment risk |

When vacancy falls well below the natural rate, it signals unmet demand. When it rises well above, it signals oversupply or structural decline. Both extremes trigger price adjustments, but with significant lag due to the durability and illiquidity of housing.

---

## Housing Tenure

Tenure refers to whether a household owns or rents its dwelling. The US homeownership rate was 65.7% in Q4 2025, with approximately 35% of households renting.

### Tenure by Demographics (Q4 2025)

| Group | Homeownership Rate |
|---|---|
| Age 65+ | 79.0% |
| Age 35-64 | ~68% |
| Age < 35 | 37.9% |
| White | 73.3% |
| Asian | 60.5% |
| Hispanic | 50.6% |
| Black | 44.1% |
| **National** | **65.7%** |

Source: US Census Bureau Housing Vacancy Survey (Q4 2025).

### Tenure Choice Models

The own-vs-rent decision is driven by:

1. **User cost of capital**: the cost of owning (mortgage interest, property tax, maintenance, depreciation, opportunity cost of equity) vs. rent. When user cost < rent, ownership is favored.
2. **Tax treatment**: mortgage interest deduction and capital gains exclusion favor ownership.
3. **Credit constraints**: down payment requirements are the primary barrier for younger and lower-income households.
4. **Mobility expectations**: renters retain flexibility; owners face transaction costs (6% broker fees, closing costs).
5. **Risk preferences**: ownership exposes households to house price risk and maintenance shocks.

### Regional Variation

Homeownership rates vary sharply by region: Midwest (71.3%), South (66.5%), Northeast (63.1%), West (60.8%). The West's lower rate reflects higher housing costs and a younger, more mobile population.

JCHS projections for 2025-2035 show the national rate staying roughly flat (base scenario: 65.9%), with household growth slowing for both owners and renters as the baby boom generation ages.

---

## Homelessness

### Scale

The 2024 HUD Point-in-Time (PIT) count, conducted on a single night in January 2024, found homelessness increasing for most subgroups. However, veteran homelessness continues to decline — attributed to robust and coordinated investments in permanent supportive housing and services. The share of unsheltered people was nearly 4 percentage points lower in 2024 than in 2023.

### Causes

Homelessness research identifies a hierarchy of causes:

1. **Structural**: housing costs exceeding incomes, insufficient affordable supply, poverty.
2. **Systemic**: exits from incarceration, foster care, or hospital without housing arranged.
3. **Individual**: mental illness, substance use disorders, domestic violence, job loss.

The strongest predictor of a metro area's homelessness rate is the gap between median rent and the income of the lowest quintile — a structural, market-level variable, not an individual one.

### Housing First

The Housing First model provides permanent housing to people experiencing homelessness without requiring sobriety, treatment participation, or "housing readiness" as preconditions. Evidence from randomized trials in the US and Canada:

- **Housing retention**: 80%+ of participants remain housed after one year.
- **Cost savings**: every $1 invested returns approximately $1.44 in reduced emergency room, hospital, shelter, and criminal justice costs.
- **Healthcare**: associated with reductions in inpatient and emergency health care utilization.
- **Compared to "treatment first"**: Housing First achieves quicker exit from homelessness and greater long-term stability.

Source: National Alliance to End Homelessness; NLIHC; HUD PD&R (2024).

---

## Application to Bitborough

### Current State

Bitborough models residential housing with three density tiers:

| Building | Capacity | Size | Upgrade Condition |
|---|---|---|---|
| `res.low` | 10 | 1x1 | Spawns on zoned tiles with demand > 0 |
| `res.med` / `res.med.b` | 100 / 120 | 1x1 / 2x1 | Low at 70%+ occupancy, near city center (Clark's Law decay) |
| `res.high` | 330 | 2x2 | Medium at 85%+ occupancy, near transit, critical mass |

Fill/drain uses a target-tracking model: `target = capacity * max(0, demand) * desirability`, with `FILL_RATE = 0.12` and `DRAIN_RATE = 0.2` per tick. Desirability for residential tiles is a weighted sum of safety, fire coverage, park proximity, and pollution avoidance (max 1.0). Buildings that stay below 10% occupancy for 3 months trigger dereliction, which eventually downgrades density — the existing mechanic that parallels real-world filtering.

### Suggested Housing Market Depth

To add realism based on this research, consider:

#### 1. Per-Building Rent/Price

Assign each residential building a rent level that reflects its age, density, and desirability:

```
rent = base_rent(density) * desirability * age_factor(age)
```

Where:
- `base_rent(density)`: the tier baseline — e.g., `res.low = 500`, `res.med = 1200`, `res.high = 2000`
- `desirability`: the existing 0-1 score from `computeDesirability()`
- `age_factor(age)`: filtering decay — `max(0.5, 1.0 - age / 600)` (linear decline to 50% over 50 game-years at 12 ticks/year)

This gives newer buildings higher rents that gradually decline, modeling filtering without adding a separate income-segmentation system.

#### 2. Affordability Signal

Track a city-wide affordability ratio:

```
affordability = avg_rent / (avg_income / 12)
```

When `affordability > 0.30`, flag cost burden. When it exceeds `0.50`, apply a residential demand penalty (households stop moving in). This creates a natural ceiling on rent growth and forces the player to either build more supply or accept population stagnation.

#### 3. Vacancy Rate Feedback

Compute a city-wide vacancy rate:

```
vacancy_rate = 1 - (total_residents / total_capacity)
```

Use it to modulate demand and rent growth:

| Vacancy Rate | Effect |
|---|---|
| < 0.03 | Rent growth +5%/tick, demand boost +0.2 |
| 0.03-0.05 | Rent growth +2%/tick, no modifier |
| 0.05-0.08 | Rent stable, balanced market |
| 0.08-0.12 | Rent growth -2%/tick, demand dampened |
| > 0.12 | Rent decline -5%/tick, dereliction risk rises |

This connects the existing fill/drain system to a market price signal.

#### 4. Construction Lag by Density

Currently all upgrades take a fixed 2 months. More realistic values based on Census data:

| Upgrade | Suggested Construction Time |
|---|---|
| Zone to `res.low` | 1 month (instant in sim time — light construction) |
| `res.low` to `res.med` | 3 months |
| `res.med` to `res.high` | 6 months |

This reflects the real-world pattern where taller buildings take proportionally longer to build and creates a meaningful supply lag during periods of high demand.

#### 5. Filtering as Age-Driven Desirability Decay

Add an `age_penalty` to the desirability calculation:

```
effective_desirability = base_desirability * max(0.4, 1.0 - building.age / 720)
```

Buildings lose up to 60% of their desirability over 60 game-years. When effective desirability drops low enough, occupancy falls, triggering the existing dereliction-and-downgrade cycle. This models Ratcliff/Lowry filtering: old high-density buildings eventually become the affordable stock, and severely aged buildings are demolished and rebuilt.

#### 6. NIMBY Resistance (Optional)

When a density upgrade is attempted in a high-desirability neighborhood (desirability > 0.8), apply a resistance probability:

```
nimby_block_chance = 0.3 * neighborhood_avg_desirability
```

This creates the real-world pattern where the most desirable neighborhoods are hardest to densify, forcing growth to spread outward or into lower-desirability areas — paralleling the political economy of housing supply.

---

## Cross-References

- [Population and Demographics](./population-and-demographics.md) — household formation drives housing demand; income distribution determines affordability
- [Land Use and Zoning](./land-use-and-zoning.md) — zoning constrains density, lot sizes, and building types; the primary supply-side policy lever
- [Municipal Finance](./municipal-finance.md) — property taxes are the link between housing values and local government revenue; Tiebout sorting connects housing to service provision
- [Urban Growth Patterns](./urban-growth-patterns.md) — monocentric vs. polycentric models determine where housing demand concentrates; density gradients shape the upgrade probability function

---

## Sources

### Academic Papers
- Black, S. (1999). "Do better schools matter? Parental valuation of elementary education." *Quarterly Journal of Economics*, 114(2), 577-599.
- Bayer, P., Ferreira, F., & McMillan, R. (2007). "A unified framework for measuring preferences for schools and neighborhoods." *Journal of Political Economy*, 115(4), 588-638.
- [Diamond, R., McQuade, T., & Qian, F. (2019). "The effects of rent control expansion on tenants, landlords, and inequality: evidence from San Francisco." *American Economic Review*, 109(9), 3365-3394.](https://www.aeaweb.org/articles?id=10.1257/aer.20181289)
- [Hsieh, C. & Moretti, E. (2019). "Housing constraints and spatial misallocation." *American Economic Journal: Macroeconomics*, 11(2), 1-39.](https://www.aeaweb.org/articles?id=10.1257/mac.20170388)
- [Leamer, E. (2007). "Housing IS the business cycle." NBER Working Paper 13428.](https://www.nber.org/papers/w13428)
- Lowry, I. (1960). "Filtering and housing standards: A conceptual analysis." *Land Economics*, 36(4), 362-370.
- Olsen, E. (1969). "A competitive theory of the housing market." *American Economic Review*, 59(4), 612-622.
- Ratcliff, R. (1949). *Urban Land Economics*. McGraw-Hill.
- [Saiz, A. (2010). "The geographic determinants of housing supply." *Quarterly Journal of Economics*, 125(3), 1253-1296.](https://academic.oup.com/qje/article-abstract/125/3/1253/1903664)
- Tiebout, C. (1956). "A pure theory of local expenditures." *Journal of Political Economy*, 64(5), 416-424.

### Data and Reports
- [Harvard JCHS (2025). "The State of the Nation's Housing 2025."](https://www.jchs.harvard.edu/sites/default/files/reports/files/Harvard_JCHS_The_State_of_the_Nations_Housing_2025.pdf)
- [NAHB (2025). "Cost of Constructing a Home in 2024."](https://www.nahb.org/news-and-economics/housing-economics-plus/special-studies/special-studies-pages/cost-of-constructing-a-home-in-2024)
- [NAHB Eye on Housing (2025). "Shorter Apartment Construction Time in 2024."](https://eyeonhousing.org/2025/10/shorter-apartment-construction-time-in-2024/)
- [US Census Bureau. Housing Vacancy Survey, Q4 2025.](https://www.census.gov/housing/hvs/current/index.html)
- [US Census Bureau. Average Number of Months from Start to Completion.](https://www.census.gov/construction/nrc/pdf/avg_starttocomp.pdf)
- [Federal Reserve Board (2012). "Supply Constraints and Housing Market Dynamics."](https://www.federalreserve.gov/pubs/feds/2012/201201/201201pap.pdf)
- [CEPR (2024). "The declining elasticity of US housing supply."](https://cepr.org/voxeu/columns/declining-elasticity-us-housing-supply)
- [NMHC Research Foundation (2020). "Filtering of Apartment Housing between 1980 and 2018."](https://www.nmhc.org/globalassets/research--insight/research-reports/filtering-data/nmhc-research-foundation-filtering-2020-final.pdf)
- [Urban Institute (2019). "Inclusionary Zoning: What Does the Research Tell Us?"](https://www.urban.org/sites/default/files/publication/99647/inclusionary_zoning._what_does_the_research_tell_us_about_the_effectiveness_of_local_action_2.pdf)
- [National Alliance to End Homelessness (2024). "7 Takeaways from 2024 Point-in-Time Count Data."](https://endhomelessness.org/resources/sharable-graphics/7-takeaways-from-2024-point-in-time-count-data-on-homelessness/)
- [NLIHC. "The Evidence Is Clear: Housing First Works."](https://nlihc.org/sites/default/files/Housing-First-Evidence.pdf)
- [CRS Report R48450 (2025). "Housing Cost Burdens in 2023."](https://www.congress.gov/crs-product/R48450)
- [CRS Report RL32284. "An Overview of the Section 8 Housing Programs."](https://www.everycrsreport.com/reports/RL32284.html)
- [AEI (2024). "Filtering: Theory and Practice."](https://www.aei.org/wp-content/uploads/2024/09/Filtering-overview-Final.pdf)
- [MRSC (2017). "Visualizing Compatible Density."](https://mrsc.org/stay-informed/mrsc-insight/april-2017/visualizing-compatible-density)
- [Annual Reviews. "NIMBYs, YIMBYs, and the Politics of Land Use in American Cities."](https://www.annualreviews.org/content/journals/10.1146/annurev-polisci-041322-041133)
