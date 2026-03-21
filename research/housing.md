# Housing

> How housing markets function, filter, and fail — models for simulating residential development and affordability.

## Table of Contents

- [Supply and Demand](#supply-and-demand)
- [Filtering Theory](#filtering-theory)
- [Housing Affordability](#housing-affordability)
- [Housing Production](#housing-production)
- [Construction Cost Curves by Density](#construction-cost-curves-by-density)
- [Residential Density Types](#residential-density-types)
- [Rent Control](#rent-control)
- [Public Housing](#public-housing)
- [Inclusionary Zoning](#inclusionary-zoning)
- [NIMBY/YIMBY Dynamics](#nimbyyimby-dynamics)
- [Housing and Schools](#housing-and-schools)
- [Speculation and Housing Bubbles](#speculation-and-housing-bubbles)
- [Vacancy Rates](#vacancy-rates)
- [Vacancy Dynamics and Abandonment](#vacancy-dynamics-and-abandonment)
- [Housing Tenure](#housing-tenure)
- [Manufactured Housing](#manufactured-housing)
- [Second Homes and Dark Housing Stock](#second-homes-and-dark-housing-stock)
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

## Construction Cost Curves by Density

Construction cost per unit does not decrease linearly with density. Instead, it follows a U-shaped curve with a pronounced dip at the garden/mid-rise level and a sharp upturn at the high-rise threshold. Understanding this curve is essential for modeling why certain building types dominate and others are economically marginal.

### The U-Shaped Cost Curve

| Building Type | Stories | Construction Type | Cost/Unit (2024) | Cost/SF (2024) |
|---|---|---|---|---|
| Single-family detached | 1-2 | Wood frame (Type VB) | $350,000-$450,000 | $150-$170 |
| Townhome/rowhouse | 2-3 | Wood frame (Type VB) | $250,000-$350,000 | $140-$165 |
| Duplex/fourplex | 2-3 | Wood frame (Type VB) | $200,000-$300,000 | $135-$160 |
| Garden apartment (3-4 story) | 3-4 | Wood frame (Type VA/IIIA) | $150,000-$250,000 | $160-$200 |
| **5-over-1 podium (sweet spot)** | **5-6** | **Wood over concrete (Type IIIA/VA over I)** | **$200,000-$300,000** | **$200-$280** |
| Mid-rise (7-8 story) | 7-8 | Steel/concrete (Type IA) | $280,000-$400,000 | $250-$350 |
| High-rise (9-20 story) | 9-20 | Steel/concrete (Type IA) | $350,000-$600,000+ | $270-$475 |
| Supertall (20+ story) | 20+ | Steel/concrete (Type IA) | $500,000-$1,000,000+ | $400-$675 |

Sources: RSMeans 2025; NAHB 2024; Multifamily Loans 2026; Willowdale Equity 2025.

The per-unit cost decreases from single-family through garden apartments as land and infrastructure costs are shared across more units. It then rises sharply once buildings exceed wood-frame height limits and require steel/concrete structural systems, elevator cores, and fire suppression systems. The per-SF cost rises more steadily with height because taller buildings require progressively heavier structural systems, more elevator shaft area, and higher fire-rating assemblies.

### The 5-Over-1 Threshold

The 5-over-1 podium design is the single most important threshold in US multifamily construction economics. It exists because of a specific interaction between building codes and material costs:

- **IBC Section 510.2** allows up to 5 stories of combustible (wood-frame) construction over a 1-story noncombustible (concrete) podium, provided the podium has a 3-hour fire-resistance rating and an NFPA 13 sprinkler system.
- Wood framing costs roughly $15-$20 per square foot less than steel/concrete framing (WoodWorks; Pepper Construction). Over a 100,000 SF building, this translates to $1.5-$2.0 million in savings.
- The concrete podium provides structured parking or retail at grade, solving the parking problem that constrains surface-parked garden apartments.

The result is a building type that achieves 50-150 DU/acre at wood-frame costs — the best density-per-dollar ratio in US construction. This explains why the 5-over-1 has become ubiquitous in US cities since the 2000s: it is the densest building you can build cheaply.

Once you exceed 5-6 stories, the entire structure must be noncombustible (Type IA), requiring a concrete or steel frame. This creates a **cost cliff**: going from 6 to 7 stories can increase per-unit cost by 30-50% due to the structural system change alone, before accounting for additional elevator banks, thicker floor plates, and higher wind/seismic loads. This cliff means that buildings of 7-9 stories are rare — developers either stay at 5-over-1 or jump to 12+ stories to amortize the structural cost over more units.

### The Missing Middle Financing Gap

The "missing middle" — duplexes, triplexes, fourplexes, and small apartment buildings of 5-20 units — faces a distinct economic disadvantage that is not primarily about construction cost but about financing and development overhead:

1. **Fixed development costs**: A 12-unit garden apartment requires roughly the same permitting, legal, and architectural costs as a 150-unit mid-rise, but spreads them across far fewer units. Institutional lenders report similar closing costs regardless of project size.
2. **No secondary market**: There is no liquid secondary market for debt on buildings under 50 units. Fannie Mae and Freddie Mac small-balance loans exist but carry higher rates and more restrictive terms than large multifamily loans.
3. **Land cost per unit**: A fourplex on a single-family lot faces land costs per unit roughly 5x higher than a 150-unit project on an equivalent land area, because the land cannot be subdivided further without rezoning.
4. **Break-even threshold**: Analysis suggests the break-even development cost for missing middle housing is approximately $344,000 per unit, which requires rents of $2,800+/month — unaffordable for the moderate-income households these buildings historically served (Gattoni-Celli 2024; Market Urbanism).

The missing middle gap explains why US housing production is bimodal: single-family homes and large apartment complexes, with very little in between. Between 1976 and 2023, buildings of 2-4 units fell from 15% to under 3% of new housing starts (Census SOCD).

### Cost Scaling Formula

For simulation purposes, the cost curve can be approximated as:

```
cost_per_unit(stories) =
  if stories <= 4:  base_cost * (1.0 - 0.08 * stories)     // economies of scale
  if stories 5-6:   base_cost * 0.70                         // 5-over-1 sweet spot
  if stories 7-9:   base_cost * (0.70 + 0.15 * (stories-6)) // cost cliff
  if stories 10+:   base_cost * (1.15 + 0.05 * (stories-9)) // gradual high-rise escalation
```

This produces the characteristic U-shape: declining costs through garden/podium, a sharp jump at the steel/concrete threshold, then slow escalation as height increases.

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

## Speculation and Housing Bubbles

Housing markets are uniquely susceptible to speculative behavior because housing is both a consumption good (shelter) and an investment asset (wealth store). When the investment motive dominates, prices can decouple from fundamentals and overshoot — sometimes dramatically.

### The Anatomy of a Housing Bubble

A housing bubble occurs when prices rise substantially above levels justified by fundamentals (income, population, construction costs, interest rates) due to self-reinforcing expectations of future appreciation. Case and Shiller (2003) formalized the diagnostic criteria in their Brookings paper "Is There a Bubble in the Housing Market?":

1. **Extrapolative expectations**: buyers expect recent price trends to continue indefinitely. Case-Shiller surveys of recent homebuyers found that respondents in bubble markets expected 10-15% annual appreciation for the next decade — far above the long-run real return of ~0% documented in Shiller's data back to 1890.
2. **Investment motive displaces consumption motive**: an increasing share of purchases are made by investors (flippers, speculators, buy-to-rent) rather than owner-occupants.
3. **Prices decouple from rents**: the price-to-rent ratio rises well above historical norms, indicating that purchase prices can no longer be justified by rental income.
4. **Narrative contagion**: stories of "easy money" from flipping or appreciation spread through social networks, drawing more participants into the market (Shiller, *Irrational Exuberance*, 2005).

### Case-Shiller Evidence: The 2000s Bubble

The S&P/Case-Shiller National Home Price Index provides the most comprehensive empirical record of US housing bubbles:

| Period | Index Behavior | Real Price Change |
|---|---|---|
| 1890-1997 | Roughly flat in real terms (index ~100) | ~0% cumulative real appreciation |
| 1997-2006 (boom) | Rapid acceleration | +135% real (inflation-adjusted) |
| 2006-2012 (bust) | Peak-to-trough decline | -38% real (nationally); -50%+ in bubble markets (Las Vegas, Phoenix, Miami) |
| 2012-2022 (recovery) | Exceeded prior peak | +110% real from trough |
| 2022-2025 | Continued appreciation | Current index ~257 (nominal, base 2000=100) |

Source: S&P Cotality Case-Shiller Index; FRED; Shiller (2005, 2015).

Shiller's long-run dataset (1890-present) demonstrates that real home prices show a remarkable tendency to revert to their historical mean. The 1997-2006 deviation was the largest sustained departure from this mean in over a century of data — far exceeding the 1980s regional bubbles in Boston (which overshot fundamentals by ~125 percentage points) and California.

### Speculative Behavior: Flipping and Investor Contagion

**Flipping rates** serve as a direct measure of speculative intensity. ATTOM data shows:

| Year | Homes Flipped | Flip Share of Sales | Median Flip ROI |
|---|---|---|---|
| 2004-2006 (peak) | ~330,000/year | ~7-8% | 30-50% |
| 2008-2011 (bust) | ~100,000/year | ~4% | 10-15% |
| 2019 | 245,000 | 6.2% | 40.6% |
| 2022 | 407,000 | 8.4% | 26.9% |
| 2025 | — | — | <25% (lowest since 2008) |

Source: ATTOM Data Solutions, Year-End Home Flipping Reports.

**DeFusco, Nathanson, and Zwick (2022)** ("Speculative Fever," NBER Working Paper 22065) used a nearest-neighbor research design to identify causal contagion in investor behavior: when one investor in a neighborhood flips a property profitably, nearby non-investors become significantly more likely to purchase investment properties. This investor contagion effect was strongest in 2004-2006 and concentrated in zip codes that experienced the largest subsequent price declines — direct evidence that speculation amplified the bubble.

### The Credit-Leverage Channel

**Mian and Sufi (2014)**, in *House of Debt*, documented the credit supply mechanism underlying the 2000s bubble:

- Total US household debt doubled from $7 trillion to $14 trillion between 2000 and 2007.
- The household debt-to-income ratio rose from 1.4 to 2.1.
- The expansion of subprime mortgage securitization represented a credit supply shock that enabled marginal borrowers to purchase homes, inflating demand beyond fundamental levels.
- Existing homeowners responded to rising prices by extracting equity (home equity loans, cash-out refinancing), creating a feedback loop: **credit expansion -> price increases -> equity extraction -> more spending -> more credit demand**.

The geographic pattern was striking: zip codes with the largest credit expansions (2002-2005) experienced the largest price booms and subsequent busts, even after controlling for income growth, employment, and demographics.

### Investor Share of Purchases

Investor activity in the housing market has surged again in the 2020s, though the composition has shifted:

| Period | Investor Share of Purchases | Dominant Investor Type |
|---|---|---|
| 2000-2003 | ~15-18% | Small (1-10 properties) |
| 2004-2007 | ~30-35% | Small + speculators |
| 2008-2012 | ~20-25% | Institutional (bulk REO) |
| 2020-2024 | ~25-28% | Small (91% of investor-owned) |
| Q2 2025 | ~33% | Small investors; institutions net selling |

Source: Cotality (CoreLogic); JBREC; Econofact.

The distinction matters: institutional investors (Invitation Homes, American Homes 4 Rent, Progress Residential) own less than 2% of single-family homes and have been net sellers since 2024. Small investors (individuals owning 1-10 properties) account for ~91% of investor-owned homes and ~25% of recent purchases. Investors collectively own approximately 20% of the 86 million single-family homes in the US.

### Bubble Dynamics Model

For simulation, a speculative cycle can be modeled as a positive feedback loop with delayed mean reversion:

```
expected_appreciation = smoothed_past_appreciation * extrapolation_factor
investment_demand = base_demand * (1 + expected_appreciation * speculation_sensitivity)
price = f(total_demand, supply)
actual_appreciation = (price - price_last_period) / price_last_period

// Mean reversion trigger
if price / fundamental_value > bubble_threshold (e.g., 1.4):
  correction_probability increases nonlinearly
  when correction triggers: demand collapses, price overshoots downward
```

The key parameters are `extrapolation_factor` (how much past returns drive expectations — typically 0.5-0.9 in bubble episodes), `speculation_sensitivity` (how elastic investment demand is to expected returns), and `bubble_threshold` (the price/fundamental ratio that triggers correction risk). Empirically, US housing bubbles have burst when the national price-to-income ratio exceeded ~1.4x its long-run average.

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

## Vacancy Dynamics and Abandonment

While the previous section describes vacancy as a market signal, this section addresses vacancy as a *process* — particularly the feedback loops through which vacancy, disinvestment, and abandonment cascade through neighborhoods. This is the demand-collapse side of the housing market, the mirror image of the speculation section above.

### The Disinvestment Cycle

When vacancy rises above the natural rate, landlords face a decision: maintain the property in hopes of future tenants, or reduce expenditures to cut losses. The rational landlord's maintenance decision depends on expected future rents relative to maintenance costs:

```
maintain if: E[future_rent] * (1 - vacancy_probability) > maintenance_cost + opportunity_cost
```

As vacancy rises, `vacancy_probability` increases, reducing expected returns and making disinvestment rational. This creates a negative feedback loop:

1. **Rising vacancy** reduces rental income and lowers expected returns on maintenance.
2. **Deferred maintenance** reduces property quality, lowering desirability and market rents.
3. **Lower rents and quality** drive remaining tenants to leave, increasing vacancy further.
4. **Tax delinquency** follows revenue loss — the owner stops paying property taxes.
5. **Abandonment** occurs when the property's liabilities (taxes, code violations, minimum maintenance) exceed its value.

The Center for Community Progress identifies four reinforcing components of this cycle: equity challenges (negative equity), triggers (job loss, population decline, foreclosure), market shifts (declining demand, falling prices), and cascading community impact (blight, crime, tax base erosion).

### The 4% Tipping Point

Research on neighborhood vacancy thresholds has identified critical nonlinearities. The most cited finding comes from Johns Hopkins University research on Baltimore:

> **At approximately 4% vacancy, neighborhoods reach a tipping point** where the negative externalities of vacant properties begin to dominate neighborhood dynamics.

Below this threshold, individual vacancies have limited spillover effects. Above it, the effects compound:

- **Property value spillover**: Each abandoned property reduces the value of nearby homes. The real estate appraisal process uses comparable sales, creating a circular mechanism where declining comps drive further value decline. Research by the National Vacant Properties Campaign found that properties within 500 feet of an abandoned building lost 2-3% of their value, with the effect intensifying as abandonment density increases.
- **Crime amplification**: A study in Austin, Texas, found that blocks with unsecured vacant buildings had 3.2x as many drug calls, 1.8x as many theft calls, and 2x as many violent calls as blocks without vacant buildings (DAWGS Inc. / Community Progress).
- **Tax base erosion**: As property values fall and tax delinquency rises, municipal revenue declines, forcing cuts to public services (police, fire, sanitation), which further reduces neighborhood attractiveness.

### Hypervacancy

When vacancy exceeds roughly 20-25% of a neighborhood's housing stock, the Urban Institute uses the term **hypervacancy** — a condition where market recovery through private investment alone becomes essentially impossible. Hypervacant neighborhoods require coordinated public intervention: strategic demolition, land banking, and targeted reinvestment.

Historical examples of hypervacancy cascades:
- **Detroit**: lost 25% of its population 2000-2010; vacancy rates exceeded 30% in many neighborhoods. Over 100,000 properties entered tax foreclosure between 2011 and 2015.
- **St. Louis**: lost 63% of its population from its 1950 peak. Entire neighborhoods reached 40-50% vacancy, with blocks of contiguous abandoned buildings.
- **Baltimore**: ~16,000 vacant and abandoned buildings (2020), concentrated in historically redlined neighborhoods. The 4% tipping point research originated from studying these patterns.

### Population Decline as Root Cause

Longitudinal analysis of US cities from 1960-2010 (Han 2019, PMC) found that **population change is the primary driver of urban vacancy**, more predictive than income, employment, or housing age. Cities that lost more than 20% of their population saw vacancy rates that were 2-3x higher than stable-population cities, controlling for other factors. The mechanism is simple: when people leave faster than housing is demolished, the surplus stock degrades.

### Abandonment Cascade Model

For simulation, the abandonment cascade can be modeled as a spatial contagion process:

```
// Per-building, per-tick
vacancy_duration += 1 if occupancy < threshold
maintenance_level = max(0, maintenance_level - decay_rate * vacancy_duration)
nearby_abandoned = count_abandoned_within(radius)

// Abandonment probability increases nonlinearly with nearby abandoned buildings
abandon_probability = base_rate * (1 + contagion_factor * nearby_abandoned^1.5)

// Neighborhood-level tipping point
if neighborhood_vacancy_rate > 0.04:
  all buildings in neighborhood get desirability_penalty *= (1 - 0.1 * (vacancy_rate - 0.04) / 0.04)
```

This produces the empirically observed pattern: gradual decline below 4%, accelerating decline above it, and potential hypervacancy collapse above ~20%.

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

## Manufactured Housing

Manufactured housing (commonly "mobile homes") is a distinct segment of US housing that operates under different construction standards, financing mechanisms, and tenure arrangements than site-built housing. It is the largest source of unsubsidized affordable housing in the United States.

### Scale and Distribution

According to the 2021 American Housing Survey, manufactured housing comprises approximately **8.0 million occupied units**, representing **5.6% of all occupied US housing**. However, its significance varies dramatically by geography:

| Region | Manufactured Homes as % of Occupied Stock |
|---|---|
| East South Central (AL, KY, MS, TN) | 9.3% |
| Mountain (AZ, CO, ID, MT, NV, NM, UT, WY) | 8.5% |
| South Atlantic (DE, FL, GA, MD, NC, SC, VA, WV, DC) | 7.7% |
| West South Central (AR, LA, OK, TX) | ~7% |
| National average | 5.6% |
| Rural areas | ~15% |
| Northeast / Pacific | < 3% |

Source: Census AHS 2021; NAHB Eye on Housing 2025; CFPB 2014.

Manufactured homes represent a much larger share of *new* housing in some states: in 2023, manufactured homes accounted for over 25% of new single-family housing placements in Mississippi, West Virginia, and South Carolina (Census MHS). Annual shipments have recovered from their post-2008 low of ~50,000 units to approximately 103,300 units in 2024.

### The HUD Code

All manufactured homes built after June 15, 1976, must comply with the Federal Manufactured Home Construction and Safety Standards (the "HUD Code"), administered by HUD's Office of Manufactured Housing Programs. Key features:

- **Federal preemption**: unlike site-built homes (governed by local building codes — typically the IBC), manufactured homes are regulated by a single federal standard that preempts state and local codes.
- **Factory inspection**: HUD authorizes third-party inspection agencies to monitor factory production. Each compliant home section receives a red certification label.
- **Installation standards**: HUD published national installation standards in 2007, covering foundation, anchoring, and utility connections.

The distinction between "manufactured" (post-1976 HUD Code) and "mobile home" (pre-1976, built to ANSI A119.1 or no standard) is legally and structurally significant. Pre-1976 units were built to lower standards and depreciate faster, but still constitute a significant portion of the existing stock: approximately 72% of occupied manufactured homes were built before 2000.

### Tenure and Property Classification

Manufactured housing has a unique tenure structure that blends elements of homeownership and renting:

| Tenure Type | Share of Manufactured Homes | Legal Classification |
|---|---|---|
| Own home + own land | ~60% | Real property (in most states) |
| Own home + rent land (in community/park) | ~30% | Personal property ("chattel") |
| Rent home + rent land | ~10% | Rental |

Source: CFPB 2021; AHS 2021.

The **chattel/real property distinction** is the central tension in manufactured housing finance:

- **Real property**: when a manufactured home is permanently affixed to land the owner also owns, it can be titled as real estate and financed with a conventional mortgage (30-year, ~7% rate in 2025).
- **Personal property (chattel)**: when the home sits on rented land or is not permanently affixed, it is titled as personal property and financed with a chattel loan — similar to an auto loan. Chattel loans carry higher interest rates (typically 8-12%), shorter terms (15-20 years), and no Fannie/Freddie secondary market access.

Approximately **80% of new manufactured homes are initially titled as personal property**, even though many are eventually converted to real property. The share titled as real estate has grown from 13% to 20% between 2000 and 2023 (Census MHS). This financing gap means that manufactured homeowners who rent their lot face structurally higher borrowing costs and weaker wealth accumulation than site-built homeowners, despite similar underlying housing quality.

### Depreciation vs. Appreciation

The conventional wisdom that manufactured homes always depreciate is increasingly contested by data:

**The depreciation case:**
- Manufactured homes on rented land (chattel-titled) depreciate similarly to vehicles: roughly 10-20% in the first year, then 3-5% annually thereafter.
- Without land ownership, the home is a depreciating asset on someone else's appreciating land — the owner captures none of the land value increase.
- Lot rent increases are a form of value extraction: as the community appreciates, the park owner captures the gains through rent increases, while the home itself ages.

**The appreciation case:**
- Urban Institute research (2024) using Census AHS data found that between 2000 and 2024, manufactured homes appreciated by **211.8%** — nearly identical to the 212.6% appreciation for site-built homes over the same period.
- The key variable is land ownership: manufactured homes on owned land appreciate at rates comparable to site-built homes. Homes on rented land do not.
- Newer double-wide units built to current HUD Code standards have construction quality approaching site-built homes and show correspondingly lower depreciation rates.

### Manufactured Housing and Affordable Supply

Manufactured homes cost roughly **$55-$75 per square foot** to produce (factory cost, excluding land, transport, and installation), compared to $150-$170/SF for site-built single-family homes. This 50-65% cost advantage makes manufactured housing the most cost-effective way to produce detached housing units.

However, regulatory barriers limit its deployment:
- Many municipalities zone manufactured housing into designated "mobile home parks" or exclude it entirely through minimum square footage requirements, aesthetic standards, or outright bans.
- NIMBY opposition to manufactured housing communities is intense, driven by stigma and property value concerns.
- Park closures are accelerating as land values rise: when a park owner can sell to a developer for multifamily construction, existing residents face displacement with few alternatives.

**For simulation:** manufactured housing could be modeled as an ultra-low-cost residential type with fast construction (factory-built, delivered in weeks), high initial affordability, but a distinct depreciation curve and vulnerability to land-cost dynamics if the player zones it without land ownership protections.

---

## Second Homes and Dark Housing Stock

A growing share of the US housing stock is neither owner-occupied nor conventionally rented — it sits vacant as a second home, investment hold, or short-term rental. This "dark" housing stock represents a supply-side distortion with significant implications for local housing markets.

### Scale of Non-Primary-Residence Housing

The US Census Bureau's Housing Vacancy Survey distinguishes several categories of vacant housing:

| Category | Units (2024 est.) | Description |
|---|---|---|
| For rent | ~3.3 million | Actively marketed rental vacancies |
| For sale | ~0.9 million | Actively marketed for-sale vacancies |
| Seasonal/occasional use | ~5.5 million | Second homes, vacation homes |
| Other vacant | ~5.2 million | Investor holds, estate properties, uninhabitable |
| **Total vacant** | **~14.9 million** | **~10% of total housing stock** |

Source: Census Housing Vacancy Survey 2024; NAR.

Of the ~14.9 million vacant homes, the largest category is "other vacant" — properties that are neither for rent, for sale, nor seasonal. This category has grown substantially since 2000 and includes investor-held properties being warehoused for appreciation. As of Q3 2024, investors owned more than **882,300 vacant houses**, representing roughly 63% of the 1.4 million total residential properties with no occupants (excluding seasonal).

### Investor-Owned Vacant Units

The rise of investor ownership has created a new category of housing that is economically withheld from the market:

- **Speculative holds**: Investors purchase properties in appreciating markets and hold them vacant, betting that price appreciation will exceed carrying costs (taxes, insurance, maintenance). Research on Los Angeles found that investor-owners deliberately listed units at above-market rents, preferring vacancy to below-target returns (UCLA 2020).
- **Renovation pipeline**: Properties acquired for renovation or redevelopment sit vacant during the planning and construction process, sometimes for years in jurisdictions with lengthy permitting.
- **Portfolio optimization**: Large landlords may keep a fraction of units vacant to maintain pricing power — similar to how hotels target 70-80% occupancy rather than 100%.

### The Airbnb Effect

Short-term rental platforms, principally Airbnb, have converted a measurable share of the long-term housing stock into transient accommodation, particularly in tourist-heavy markets.

**Barron, Kung, and Proserpio (2021)** published the most rigorous empirical study of this effect in *Marketing Science*:

- A **1% increase in Airbnb listings** leads to a **0.018% increase in rents** and a **0.026% increase in house prices** at the median owner-occupancy zip code.
- At median Airbnb growth rates, this translates to an annual increase of **$9 in monthly rent** and **$1,800 in house prices** per zip code.
- These effects account for approximately **one-fifth of actual rent growth** and **one-seventh of actual price growth** in affected areas.
- The effect is concentrated in **low owner-occupancy zip codes**, where non-owner-occupiers are more likely to convert long-term rentals to short-term.

The mechanism is supply reallocation, not demand creation: Airbnb does not increase the total housing supply but shifts units from the long-term rental market to the short-term market. This tightens long-term rental supply without adding new construction.

**Market cooling (2024-2025):** After rapid expansion through 2022, Airbnb occupancy rates have declined. The US average occupancy fell to approximately 50% in 2025, down from 57% in 2024, as supply saturation in many markets has driven returns below long-term rental yields. Some hosts are converting back to long-term rentals, partially reversing the supply withdrawal.

### Second Homes and Seasonal Vacancy

Approximately 5.5 million US housing units are classified as seasonal or occasional use — vacation homes, pied-a-terre units in cities, and properties used only part of the year. These units are particularly concentrated in:

- Resort/vacation areas (Cape Cod, Lake Tahoe, Florida Gulf Coast, mountain ski towns)
- Global cities with foreign investment (New York, Miami, Los Angeles, San Francisco)
- College towns (parents purchasing for students)

In some resort communities, seasonal vacancy rates exceed 50%, creating ghost-town dynamics for much of the year: businesses cannot sustain year-round operations, workers cannot find housing, and local services are strained by the seasonal population swing.

### Policy Responses

Jurisdictions have responded to dark housing stock with several tools:

| Policy | Example | Mechanism |
|---|---|---|
| Vacancy tax | Vancouver (2017), San Francisco (2024) | Annual tax on units vacant > 6 months |
| Short-term rental registration | New York City (2023), Barcelona | Require registration, cap nights, restrict non-owner-occupied units |
| Empty homes tax | Melbourne (2018), Toronto (2022) | Progressive tax on non-primary-residence properties |
| Foreign buyer restrictions | Canada (2023), New Zealand (2018) | Ban or tax foreign purchases of residential property |
| Inclusionary short-term rental | Some jurisdictions | Require STR operators to also maintain long-term rental units |

Evidence on effectiveness is mixed: Vancouver's Empty Homes Tax reduced reported vacancies by ~15% in its first two years, but enforcement is difficult and some owners simply declare a nominal tenant. New York City's strict STR regulations (Local Law 18, 2023) removed ~75% of Airbnb listings, but rents continued to rise, suggesting the STR effect was smaller than supply constraints.

### Dark Housing Stock Model

For simulation, second homes and investor-held vacancies can be modeled as a demand-side leakage:

```
effective_housing_supply = total_capacity - second_homes - investor_holds - str_conversions

second_homes = f(city_desirability, tourism_attractiveness)  // grows with desirability
investor_holds = f(price_appreciation_rate, vacancy_penalty)  // grows with appreciation
str_conversions = f(tourism_demand, str_profitability vs long_term_rent)

// Housing market tightness based on effective supply
effective_vacancy = 1 - (residents / effective_housing_supply)
```

This means a city can have high total capacity but tight effective supply if a significant share of units are withdrawn from the residential market. The player would need to either build more housing or implement policies to discourage non-residential use of housing stock.

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

#### 7. Construction Cost Curve (from Cost Curves by Density)

Model upgrade costs using the U-shaped cost curve rather than flat per-tier pricing:

```
upgrade_cost(from, to) =
  res.low  -> res.med:   base * 0.70  // 5-over-1 sweet spot — cheapest per unit
  res.med  -> res.high:  base * 1.30  // cost cliff — steel/concrete jump
  res.low  -> res.high:  base * 1.50  // skip penalty — full structural change
```

This makes the `res.med` tier the most economically attractive density upgrade, mirroring the real-world dominance of 5-over-1 podium construction. Players who skip `res.med` and go directly to `res.high` pay a premium, just as developers face a cost cliff when exceeding wood-frame height limits.

#### 8. Speculation Cycle (from Speculation and Housing Bubbles)

Track a city-wide speculative pressure metric:

```
speculation_index = smoothed_price_growth * investment_attractiveness
```

When `speculation_index > threshold`, apply effects:
- Demand artificially inflated (investors entering market)
- Construction activity surges (builders chase rising prices)
- When correction triggers (random event weighted by overshoot magnitude): demand drops sharply, construction halts, vacancy spikes
- Recovery takes 2-4 game-years of depressed demand

This creates boom-bust cycles that punish overbuilding during speculative periods and reward maintaining supply buffers. The player experiences the real-world dynamic where overheated markets crash hardest.

#### 9. Vacancy Cascade (from Vacancy Dynamics and Abandonment)

Extend the existing dereliction mechanic with spatial contagion:

```
// Count abandoned buildings within 3-tile radius
nearby_abandoned = count_derelict_within(building, radius=3)

// Accelerate dereliction timer for buildings near abandoned ones
dereliction_rate *= (1 + 0.3 * nearby_abandoned)

// Neighborhood tipping point at ~4% vacancy
if neighborhood_vacancy > 0.04:
  desirability_penalty = -0.15 * (neighborhood_vacancy / 0.04)
```

This produces the empirically observed cascade: isolated dereliction has limited impact, but clusters of abandoned buildings trigger accelerating neighborhood decline. The player must intervene early (demolish, redevelop, or provide services) to prevent the tipping point.

#### 10. Manufactured Housing Tier (from Manufactured Housing)

Add a `res.manufactured` building type:

| Property | Value | Rationale |
|---|---|---|
| Capacity | 6 | Small park or single-lot placement |
| Construction time | 0.5 months | Factory-built, delivered and installed |
| Cost | 40% of `res.low` | Reflects ~50-65% real-world cost savings |
| Depreciation rate | 2x normal | Without land ownership, depreciates like chattel |
| Desirability impact | -0.05 to neighbors | Models NIMBY resistance / stigma |
| Upgrade path | Cannot upgrade to `res.med` | Different construction type — must demolish to redevelop |

This gives the player a fast, cheap housing option for early-game or emergency demand, with tradeoffs: faster depreciation, lower desirability, and no upgrade path.

#### 11. Dark Housing Stock / STR Leakage (from Second Homes and Dark Housing Stock)

Model supply withdrawal as a function of city attractiveness:

```
// High-desirability cities attract non-resident demand
dark_stock_fraction = 0.02 + 0.08 * city_tourism_score + 0.05 * price_appreciation_rate
effective_capacity = total_capacity * (1 - dark_stock_fraction)
```

As the city becomes more desirable and tourism-oriented, a growing share of housing is withdrawn from the residential market. The player can counter this with vacancy taxes (reduce `dark_stock_fraction` by 30-50%) or STR regulations.

---

## Cross-References

- [Population and Demographics](./population-and-demographics.md) — household formation drives housing demand; income distribution determines affordability
- [Land Use and Zoning](./land-use-and-zoning.md) — zoning constrains density, lot sizes, and building types; the primary supply-side policy lever
- [Municipal Finance](./municipal-finance.md) — property taxes are the link between housing values and local government revenue; Tiebout sorting connects housing to service provision
- [Urban Growth Patterns](./urban-growth-patterns.md) — monocentric vs. polycentric models determine where housing demand concentrates; density gradients shape the upgrade probability function
- [Real Estate Development](./real-estate-development.md) — developer decision pipeline, construction economics, 5-over-1 cost thresholds, market cycles, speculation
- [Social Dynamics and Segregation](./social-dynamics-and-segregation.md) — Schelling segregation, filtering and income sorting, neighborhood effects, housing as segregation mechanism
- [Disaster and Resilience](./disaster-and-resilience.md) — housing supply elasticity in reconstruction, building vulnerability by type, differential recovery

---

## Sources

### Academic Papers
- [Barron, K., Kung, E., & Proserpio, D. (2021). "The effect of home-sharing on house prices and rents: evidence from Airbnb." *Marketing Science*, 40(1), 23-47.](https://pubsonline.informs.org/doi/10.1287/mksc.2020.1227)
- Black, S. (1999). "Do better schools matter? Parental valuation of elementary education." *Quarterly Journal of Economics*, 114(2), 577-599.
- Bayer, P., Ferreira, F., & McMillan, R. (2007). "A unified framework for measuring preferences for schools and neighborhoods." *Journal of Political Economy*, 115(4), 588-638.
- [Case, K. & Shiller, R. (2003). "Is there a bubble in the housing market?" *Brookings Papers on Economic Activity*, 2003(2), 299-362.](https://www.brookings.edu/wp-content/uploads/2003/06/2003b_bpea_caseshiller.pdf)
- [DeFusco, A., Nathanson, C., & Zwick, E. (2022). "Speculative fever: investor contagion in the housing bubble." NBER Working Paper 22065.](https://www.nber.org/system/files/working_papers/w22065/w22065.pdf)
- [Diamond, R., McQuade, T., & Qian, F. (2019). "The effects of rent control expansion on tenants, landlords, and inequality: evidence from San Francisco." *American Economic Review*, 109(9), 3365-3394.](https://www.aeaweb.org/articles?id=10.1257/aer.20181289)
- [Han, H. (2019). "Evaluating drivers of housing vacancy: a longitudinal analysis of large US cities from 1960 to 2010." *Journal of Housing and the Built Environment*.](https://pmc.ncbi.nlm.nih.gov/articles/PMC6920573/)
- [Hsieh, C. & Moretti, E. (2019). "Housing constraints and spatial misallocation." *American Economic Journal: Macroeconomics*, 11(2), 1-39.](https://www.aeaweb.org/articles?id=10.1257/mac.20170388)
- [Leamer, E. (2007). "Housing IS the business cycle." NBER Working Paper 13428.](https://www.nber.org/papers/w13428)
- Lowry, I. (1960). "Filtering and housing standards: A conceptual analysis." *Land Economics*, 36(4), 362-370.
- [Mian, A. & Sufi, A. (2014). *House of Debt: How They (and You) Caused the Great Recession*. University of Chicago Press.](https://press.uchicago.edu/ucp/books/book/chicago/H/bo20832545.html)
- Olsen, E. (1969). "A competitive theory of the housing market." *American Economic Review*, 59(4), 612-622.
- Ratcliff, R. (1949). *Urban Land Economics*. McGraw-Hill.
- Rosen, K. & Smith, L. (1983). "The price-adjustment process for rental housing and the natural vacancy rate." *American Economic Review*, 73(4), 779-786.
- [Saiz, A. (2010). "The geographic determinants of housing supply." *Quarterly Journal of Economics*, 125(3), 1253-1296.](https://academic.oup.com/qje/article-abstract/125/3/1253/1903664)
- [Shiller, R. (2005). *Irrational Exuberance*. 2nd ed. Princeton University Press.](https://press.princeton.edu/books/paperback/9780691173122/irrational-exuberance)
- Tiebout, C. (1956). "A pure theory of local expenditures." *Journal of Political Economy*, 64(5), 416-424.

### Data and Reports
- [ATTOM Data Solutions (2025). "Year-End Home Flipping Report."](https://www.attomdata.com/news/market-trends/flipping/2025-year-end-home-flipping-report/)
- [CFPB (2021). "Manufactured Housing Finance: New Insights from HMDA."](https://files.consumerfinance.gov/f/documents/cfpb_manufactured-housing-finance-new-insights-hmda_report_2021-05.pdf)
- [CFPB (2014). "Manufactured-Housing Consumer Finance in the United States."](https://files.consumerfinance.gov/f/201409_cfpb_report_manufactured-housing.pdf)
- [Center for Community Progress. "Explaining the Cycle of Systemic Vacancy."](https://communityprogress.org/blog/explaining-systemic-vacancy/)
- [Cotality/CoreLogic (2025). "Investors Buy Nearly One-Third of Homes Across US."](https://www.cotality.com/press-releases/investors-buy-nearly-one-third-of-homes-across-us)
- [Harvard JCHS (2025). "The State of the Nation's Housing 2025."](https://www.jchs.harvard.edu/sites/default/files/reports/files/Harvard_JCHS_The_State_of_the_Nations_Housing_2025.pdf)
- [Harvard JCHS (2024). "A Review of Barriers to Greater Use of Manufactured Housing for Entry-Level."](https://www.jchs.harvard.edu/sites/default/files/research/files/harvard_jchs_barriers_manufactured_housing_2024.pdf)
- [NAHB (2025). "Cost of Constructing a Home in 2024."](https://www.nahb.org/news-and-economics/housing-economics-plus/special-studies/special-studies-pages/cost-of-constructing-a-home-in-2024)
- [NAHB Eye on Housing (2025). "Shorter Apartment Construction Time in 2024."](https://eyeonhousing.org/2025/10/shorter-apartment-construction-time-in-2024/)
- [NAHB Eye on Housing (2025). "Manufactured Homes: An Alternative Means of Housing Supply."](https://eyeonhousing.org/2025/04/manufactured-homes-an-alternative-means-of-housing-supply/)
- [RSMeans (2025). "How Much Does It Cost to Build an Apartment Complex?"](https://www.rsmeans.com/resources/how-much-does-it-cost-to-build-an-apartment-complex)
- [S&P Cotality Case-Shiller Index. FRED.](https://fred.stlouisfed.org/series/CSUSHPINSA)
- [Urban Institute (2024). "Manufactured Homes Increase in Value at the Same Pace as Site-Built Homes."](https://www.urban.org/urban-wire/manufactured-homes-increase-value-same-pace-site-built-homes)
- [Urban Institute (2022). "The Role of Manufactured Housing in Increasing the Supply of Affordable Housing."](https://www.urban.org/sites/default/files/2022-07/The%20Role%20of%20Manufactured%20Housing%20in%20Increasing%20the%20Supply%20of%20Affordable%20Housing.pdf)
- [Urban Institute. "Five Elements Cities Need to Address Hypervacancy."](https://www.urban.org/urban-wire/five-elements-cities-need-address-hypervacancy-and-catalyze-neighborhood-recovery)
- [US Census Bureau. Housing Vacancy Survey, Q4 2025.](https://www.census.gov/housing/hvs/current/index.html)
- [US Census Bureau. Average Number of Months from Start to Completion.](https://www.census.gov/construction/nrc/pdf/avg_starttocomp.pdf)
- [US Census Bureau. Manufactured Housing Survey (MHS) Latest Data.](https://www.census.gov/data/tables/time-series/econ/mhs/latest-data.html)
- [Federal Reserve Board (2012). "Supply Constraints and Housing Market Dynamics."](https://www.federalreserve.gov/pubs/feds/2012/201201/201201pap.pdf)
- [Federal Reserve Bank of New York. "Speculative Bubbles in Real Estate."](https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr514.pdf)
- [CEPR (2024). "The declining elasticity of US housing supply."](https://cepr.org/voxeu/columns/declining-elasticity-us-housing-supply)
- [NMHC Research Foundation (2020). "Filtering of Apartment Housing between 1980 and 2018."](https://www.nmhc.org/globalassets/research--insight/research-reports/filtering-data/nmhc-research-foundation-filtering-2020-final.pdf)
- [Urban Institute (2019). "Inclusionary Zoning: What Does the Research Tell Us?"](https://www.urban.org/sites/default/files/publication/99647/inclusionary_zoning._what_does_the_research_tell_us_about_the_effectiveness_of_local_action_2.pdf)
- [National Alliance to End Homelessness (2024). "7 Takeaways from 2024 Point-in-Time Count Data."](https://endhomelessness.org/resources/sharable-graphics/7-takeaways-from-2024-point-in-time-count-data-on-homelessness/)
- [NLIHC. "The Evidence Is Clear: Housing First Works."](https://nlihc.org/sites/default/files/Housing-First-Evidence.pdf)
- [CRS Report R48450 (2025). "Housing Cost Burdens in 2023."](https://www.congress.gov/crs-product/R48450)
- [CRS Report RL32284. "An Overview of the Section 8 Housing Programs."](https://www.everycrsreport.com/reports/RL32284.html)
- [AEI (2024). "Filtering: Theory and Practice."](https://www.aei.org/wp-content/uploads/2024/09/Filtering-overview-Final.pdf)
- [WoodWorks. "Code Path and Requirements for Mid-Rise Podium Projects."](https://www.woodworks.org/resources/code-path-and-requirements-for-podium-projects/)
- [Gattoni-Celli, L. (2024). "Explaining the Missing Middle Housing Financing Gap." Substack.](https://lucagattonicelli.substack.com/p/1000-subscribers-special-explaining)
- [Econofact (2025). "Do private equity firms own 20% of single family homes?"](https://econofact.org/factbrief/do-private-equity-firms-own-20-of-single-family-homes)
- [MRSC (2017). "Visualizing Compatible Density."](https://mrsc.org/stay-informed/mrsc-insight/april-2017/visualizing-compatible-density)
- [Annual Reviews. "NIMBYs, YIMBYs, and the Politics of Land Use in American Cities."](https://www.annualreviews.org/content/journals/10.1146/annurev-polisci-041322-041133)
