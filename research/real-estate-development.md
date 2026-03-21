# Real Estate Development

> How developers decide what to build --- feasibility analysis, construction economics, market cycles, and speculation dynamics.

## Table of Contents

- [Developer Decision Model](#developer-decision-model)
- [Feasibility Analysis](#feasibility-analysis)
- [Construction Economics](#construction-economics)
- [The 5-over-1 Building](#the-5-over-1-building)
- [Construction Timelines](#construction-timelines)
- [Market Cycles](#market-cycles)
- [Speculation and Bubbles](#speculation-and-bubbles)
- [Land Banking](#land-banking)
- [Adaptive Reuse and Redevelopment](#adaptive-reuse-and-redevelopment)
- [Developer Incentives and Public Subsidy](#developer-incentives-and-public-subsidy)
- [Commercial vs. Residential Development](#commercial-vs-residential-development)
- [Application to Bitborough](#application-to-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

---

## Developer Decision Model

Real estate development is a sequential, capital-intensive process with irreversible commitments at each stage. A developer's core question is always the same: can I buy this land, build something on it, and sell or lease the result for more than it cost me? The answer unfolds across five pipeline stages.

### The Development Pipeline

#### 1. Land Acquisition

The developer identifies a parcel and negotiates a purchase --- often with an option contract that locks in a price for 6--18 months while due diligence proceeds. The land price is the single largest variable in most urban projects. In constrained markets (San Francisco, Manhattan, Boston), land can represent 30--50% of total project cost. In suburban greenfield development, land may be 15--25%.

Key considerations at this stage:
- **Site control:** Options, letters of intent, or purchase-sale agreements
- **Environmental assessment:** Phase I and Phase II environmental site assessments (ASTM E1527)
- **Title search:** Encumbrances, easements, liens
- **Zoning check:** Current entitlements vs. what the developer wants to build

#### 2. Entitlement

Entitlement is the legal process of securing development rights --- zoning approvals, variances, special permits, environmental reviews. This stage is where regulatory risk concentrates. A project that requires rezoning or a variance hearing faces months or years of delay and the possibility of outright denial.

Timelines vary dramatically:
- **By-right development** (project conforms to existing zoning): 2--6 months for permits
- **Discretionary approval** (variance, special permit): 6--18 months
- **Rezoning or comprehensive plan amendment:** 12--36 months

The entitlement process is the source of the "zoning tax" --- the difference between what land is worth under current zoning and what it could be worth under higher-density zoning. Gyourko and Summers (2006) estimated this gap at 50% or more of home prices in supply-constrained coastal markets.

#### 3. Financing

Development financing typically involves two phases:

- **Construction loan:** Short-term (12--36 months), variable rate, disbursed in draws as construction progresses. Loan-to-cost (LTC) ratios of 60--75% are typical, meaning the developer must provide 25--40% equity. Interest rates in 2025 ranged from 7--10% depending on project risk and sponsor track record.
- **Permanent loan (take-out):** Long-term debt secured by the completed, stabilized property. Refinances the construction loan once the building reaches target occupancy (usually 90--95%). Loan-to-value (LTV) ratios of 60--75%.

Many projects also involve **mezzanine debt** (subordinate to the senior construction loan) and **preferred equity** from institutional investors, creating a layered capital stack.

#### 4. Construction

Physical construction is the most capital-intensive stage. The developer manages a general contractor (GC) or acts as owner-builder. Hard costs (physical construction) typically represent 50--65% of total project cost. Soft costs (architecture, engineering, legal, financing, permits) add 25--35%. Developer overhead and profit margin account for the remainder.

#### 5. Lease-Up / Sale

For income-producing properties, the developer must lease the building to stabilization (typically 90--95% occupancy). This absorption period can range from 6 months for well-located apartments to 2+ years for office or retail space. For-sale housing (condos, single-family) involves a separate sales and marketing phase that often begins during construction via pre-sales.

### Decision Heuristic

Developers evaluate opportunities using a simple mental model:

```
Revenue (sale price or capitalized NOI)
- Land cost
- Hard costs (construction)
- Soft costs (design, permits, legal, finance)
- Developer margin (15-25% of cost)
= Residual (must be >= 0 for project to proceed)
```

If the residual is negative, the project does not pencil. If the residual is positive but the implied return falls below the developer's hurdle rate, the capital goes elsewhere. The hurdle rate itself reflects opportunity cost, project risk, and the developer's cost of equity capital.

---

## Feasibility Analysis

Feasibility analysis is the quantitative backbone of the developer decision model. The standard tool is the **development pro forma** --- a spreadsheet model that projects all costs, revenues, and returns over a development timeline.

### Pro Forma Structure

A typical development pro forma contains:

| Line Item | Example (100-unit apartment) |
|---|---|
| **Gross potential revenue** | 100 units x $1,800/mo x 12 = $2,160,000/yr |
| **Vacancy allowance** (5--7%) | -$151,200 |
| **Effective gross income** | $2,008,800 |
| **Operating expenses** (35--45% of EGI) | -$803,520 |
| **Net operating income (NOI)** | $1,205,280 |
| **Total development cost** | $25,000,000 |
| **Return on cost** (NOI / total cost) | 4.82% |
| **Market cap rate** | 4.5% |
| **Development spread** | +32 bps |
| **Stabilized value** (NOI / cap rate) | $26,784,000 |
| **Profit margin** | 7.1% |

### Key Metrics

**Net operating income (NOI):** Revenue minus operating expenses, excluding debt service. NOI is the fundamental measure of a property's cash-generating capacity.

```
NOI = Effective Gross Income - Operating Expenses
```

**Capitalization rate (cap rate):** The ratio of NOI to property value. Cap rates reflect market risk pricing --- lower cap rates indicate lower perceived risk and higher valuations.

```
Cap Rate = NOI / Property Value
Property Value = NOI / Cap Rate
```

Current (2025) cap rate ranges by property type:

| Property Type | Cap Rate Range | Typical |
|---|---|---|
| Multifamily (Class A, gateway city) | 4.0--5.0% | 4.5% |
| Multifamily (Class B, secondary) | 5.0--6.0% | 5.5% |
| Industrial/logistics | 4.5--5.5% | 5.0% |
| Retail (NNN, credit tenant) | 5.5--7.0% | 6.0% |
| Office (Class A, CBD) | 6.0--8.0% | 7.0% |
| Office (Class B, suburban) | 7.5--10.0% | 8.5% |

Source: JP Morgan, CBRE Cap Rate Survey (2025); Westwood Net Lease Year-End 2025 Review.

**Return on cost (development yield):** NOI divided by total development cost. This is the developer's "build-to" cap rate --- what they earn by creating the asset rather than buying it.

```
Return on Cost = Stabilized NOI / Total Development Cost
```

**Development spread:** The difference between return on cost and the prevailing market cap rate for comparable stabilized properties. This spread is the developer's compensation for taking construction and lease-up risk.

```
Development Spread = Return on Cost - Market Cap Rate
```

Target spreads by property type (Wall Street Prep, Adventures in CRE):

| Property Type | Target Spread (bps) |
|---|---|
| Multifamily | 100--200 |
| Industrial | 100--150 |
| Office | 250--350+ |
| Retail | 150--250 |

If the development spread is negative or too thin, rational developers do not build --- they buy existing stabilized properties instead. When spreads compress during late-cycle periods, new construction slows.

**Residual land value:** The maximum a developer can pay for land and still achieve target returns. This is the critical link between construction economics and land markets.

```
Residual Land Value = Completed Project Value - (Construction Costs + Soft Costs + Developer Profit)
```

If the asking price for land exceeds the residual, the project does not pencil. Rising construction costs directly reduce residual land values, which is why land prices often fall when material costs spike.

**Hurdle rate / IRR:** Most developers target a minimum internal rate of return (IRR) that reflects the risk profile of the project:

| Project Type | Typical IRR Target |
|---|---|
| Core / stabilized acquisition | 6--10% |
| Value-add / repositioning | 12--15% |
| Ground-up development | 15--20% |
| Opportunistic / high-risk | 20--25%+ |

Source: Linneman & Kirsch, *Real Estate Finance and Investments*; MDPI Buildings (2024).

---

## Construction Economics

### Hard Costs vs. Soft Costs

**Hard costs** are the physical construction expenditures --- foundations, framing, mechanical/electrical/plumbing (MEP), finishes, sitework. They typically represent 50--65% of total development cost.

**Soft costs** include everything else: architecture and engineering (A&E), legal fees, permits, impact fees, construction loan interest, property taxes during construction, insurance, marketing, and developer overhead. Soft costs typically represent 25--35% of total cost.

| Cost Category | % of Total | Notes |
|---|---|---|
| Land acquisition | 10--40% | Varies enormously by market |
| Hard costs (construction) | 40--55% | Materials + labor |
| Soft costs (A&E, legal, permits) | 8--15% | Architecture, engineering, legal |
| Financing costs | 5--10% | Construction loan interest, fees |
| Developer fee / overhead | 3--5% | Management and profit margin |
| Contingency | 5--10% | Typically 5% hard, 10% soft |

Source: NAHB Cost of Constructing a Home (2024); RSMeans (2025).

### Cost Per Unit by Building Type

Construction costs per square foot increase non-linearly with building height due to structural requirements, fire code compliance, elevator cores, and construction complexity.

| Building Type | Stories | Structure | Cost/SF (2025) | Units/Acre | Cost/Unit |
|---|---|---|---|---|---|
| Single-family detached | 1--2 | Wood frame | $150--200 | 4--8 | $300K--500K |
| Townhouse / rowhouse | 2--3 | Wood frame | $160--210 | 12--25 | $250K--400K |
| Garden apartment | 2--3 | Wood frame | $170--220 | 20--40 | $150K--250K |
| Missing middle (duplex--fourplex) | 2--3 | Wood frame | $170--220 | 15--30 | $180K--300K |
| Mid-rise (wood over podium) | 4--6 | Wood/concrete | $220--320 | 40--80 | $200K--350K |
| Mid-rise (steel/concrete) | 6--8 | Steel frame | $280--400 | 60--100 | $250K--400K |
| High-rise | 12--20 | Concrete/steel | $350--500 | 100--200+ | $350K--600K |
| Supertall | 40+ | Concrete core + steel | $500--700+ | 200+ | $600K--1M+ |

Sources: RSMeans (2025); EVstudio construction cost analysis; Multifamily Loans (2026); NAHB (2024).

These are national averages. Coastal gateway cities (NYC, SF, LA, Boston) run 30--80% above national averages due to higher labor costs, union requirements, more complex regulatory environments, and constrained logistics.

### The "Missing Middle" Cost Gap

The term "missing middle" (coined by Daniel Parolek) refers to building types between single-family homes and large apartment complexes: duplexes, triplexes, fourplexes, courtyard apartments, townhouses. These types are "missing" from most US cities because:

1. **Zoning prohibits them.** Most residentially-zoned land in US cities allows only single-family detached homes. Even where duplexes and triplexes are technically permitted, lot-size minimums, parking requirements, and setback rules make them infeasible.

2. **Economies of scale favor larger projects.** A 200-unit apartment complex amortizes fixed costs (architecture, permitting, site prep, management overhead) across many more units than a 4-unit building. Developers who can build large choose large.

3. **Financing is harder for small projects.** Banks treat 5+ unit buildings as commercial loans with standardized underwriting. 2--4 unit buildings fall into a gray zone --- too large for conventional residential mortgages in many cases, too small for commercial lenders to bother with.

The result is a cost curve with a "valley of death" between approximately 4 and 20 units, where per-unit costs are high relative to achievable rents, making projects financially infeasible without subsidy or favorable land costs.

Portland's Sightline Institute (2021) ran the numbers on Oregon's newly legalized missing-middle types and found that fourplexes could pencil in high-value neighborhoods but struggled in median-value areas, largely because the per-unit land cost savings from density were offset by higher per-unit construction costs and the inability to achieve the rents needed to justify the investment.

---

## The 5-over-1 Building

The 5-over-1 (also called "one-plus-five" or "podium" construction) has become the dominant form of new multifamily construction in the United States. It consists of 4--5 stories of wood-frame (Type V-A) residential construction built atop a 1--2 story concrete podium (Type I-A) that typically contains retail, parking, or amenity space.

### Why It Dominates

The 5-over-1 exists because of a specific intersection of building code, economics, and materials science:

1. **The 2009 IBC revision** allowed up to 5 stories of wood-frame construction over a concrete podium, up from 4 stories previously. Since each podium level counts as a separate building for code purposes, the wood portion can be 5 stories tall, yielding a 6--7 story building total.

2. **Wood framing is dramatically cheaper than steel or concrete.** Wood-frame construction costs $170--220/SF vs. $280--400/SF for steel-frame mid-rise. For a 200-unit building, this difference can be $10--30 million in hard costs.

3. **The density sweet spot.** At 5--7 stories, a building achieves urban density (40--80 units/acre) while staying within the wood-frame cost envelope. Below 4 stories, the density is often too low to justify urban land costs. Above 7 stories, the shift to steel or concrete erases the cost advantage.

### Cost Thresholds at Story Breaks

Construction costs do not increase linearly with height. They jump at specific thresholds driven by building code, structural requirements, and construction methodology:

| Stories | Construction Type (IBC) | Structure | Approx. Cost/SF | Key Cost Driver |
|---|---|---|---|---|
| 1--3 | Type V-B (wood frame) | Wood bearing wall | $150--200 | Simplest construction, no sprinkler req. below 3 in some jurisdictions |
| 4--5 | Type V-A (wood frame, sprinklered) | Wood bearing wall | $180--240 | Fire sprinklers required; fire-rated assemblies |
| 5--6 over podium | Type V-A over Type I-A | Wood over concrete | $220--300 | Concrete podium adds $30--60/SF for ground floor; still wood above |
| 7--8 | Type III-A (heavy timber / mass timber) | Mass timber or steel | $280--380 | Wood bearing walls no longer permitted; shift to steel or mass timber |
| 9--12 | Type I-A (concrete/steel) | Steel frame, concrete core | $350--450 | Elevator core, wind bracing, deeper foundations |
| 13--20 | Type I-A (high-rise) | Reinforced concrete | $400--550 | High-rise fire code (pressurized stairs, refuge floors), tower cranes |
| 20+ | Type I-A (supertall) | Concrete core + steel outrigger | $500--700+ | Wind engineering, specialized logistics, longer construction time |

Sources: WoodWorks / Wood Products Council; EVstudio; RSMeans (2025).

The 5-over-1 exploits the largest cost discontinuity in the table: the jump from wood-frame ($180--240/SF) to steel/concrete ($350--450/SF) that occurs around 7--8 stories. This is why so many new US apartment buildings are exactly 5--6 stories tall --- it is the maximum density achievable within the cheapest structural system.

### Criticism

The 5-over-1 has been criticized for producing monotonous streetscapes (the "architectural pandemic" per Common Edge), for fire risk during construction (several high-profile fires have destroyed buildings under construction before sprinkler systems were operational), and for concentrating development at a single density band rather than producing the full range of building types cities need.

---

## Construction Timelines

### Duration by Building Type

Real estate development is slow. From first concept to occupancy, most projects take 2--5 years. The timeline breaks into pre-development (planning, entitlements, financing), construction, and absorption (lease-up or sales).

| Building Type | Pre-Development | Construction | Absorption | Total |
|---|---|---|---|---|
| Single-family (tract) | 6--12 mo | 6--10 mo | 1--3 mo | 14--25 mo |
| Townhouse / garden apt | 8--14 mo | 8--14 mo | 3--6 mo | 19--34 mo |
| Mid-rise (5-over-1) | 12--18 mo | 14--20 mo | 6--12 mo | 32--50 mo |
| High-rise (12+ stories) | 18--30 mo | 24--36 mo | 12--24 mo | 54--90 mo |
| Office (Class A) | 18--24 mo | 18--30 mo | 12--36 mo | 48--90 mo |
| Industrial / warehouse | 6--12 mo | 6--12 mo | 3--6 mo | 15--30 mo |

Sources: US Census Bureau, Survey of Construction (2024); Lev.co Real Estate Development Timeline.

### Permitting Delays

Building permit timelines vary enormously by jurisdiction:

| Jurisdiction Type | Typical Permit Timeline |
|---|---|
| Rural / small town (by-right) | 1--4 weeks |
| Suburban (standard review) | 4--12 weeks |
| Urban (plan review + fire dept.) | 8--24 weeks |
| Urban (discretionary approval) | 6--18 months |
| Major city (rezoning required) | 12--36 months |

California and the Northeast have the longest average timelines. The Census Bureau reports that single-family homes in the Northeast take an average of 13.5 months from permit to completion vs. 8.1 months in the South (2024 data). The gap is driven by regulatory complexity, not construction difficulty.

### The Supply Lag Problem

Construction lag is the fundamental reason housing supply is inelastic. When prices rise, new supply cannot arrive for 2--5 years, during which prices continue to rise, encouraging speculation. When the new supply finally arrives, demand may have already peaked, creating the classic cobweb overshoot pattern. This lag is a primary driver of real estate cycles.

---

## Market Cycles

### The 18-Year Cycle

Economist Homer Hoyt, in his landmark 1933 study *One Hundred Years of Land Values in Chicago*, documented a recurring pattern of real estate booms and busts with a period of approximately 18 years. Hoyt traced this rhythm through Chicago land values from the 1830s through the 1930s and found it remarkably consistent.

British economist Fred Harrison later refined and popularized the theory, arguing that the 18-year cycle is a structural feature of economies with private land ownership and fractional-reserve banking. Harrison's 2005 book *Boom Bust: House Prices, Banking and the Depression of 2010* predicted the 2008 crisis with startling precision. Economist Fred Foldvary similarly predicted in 1997 that the next major bust would arrive around 2008 --- 18 years after the 1990 downturn.

### Cycle Structure

The typical 18-year cycle follows this pattern:

| Phase | Duration | Characteristics |
|---|---|---|
| **Recovery** (years 1--4) | ~4 years | Excess inventory absorbed; rents stabilize; construction at low levels; land prices depressed; opportunistic buyers acquire distressed assets |
| **Expansion** (years 5--10) | ~6 years | Rents and prices rising; construction accelerates; financing becomes more available; developer confidence grows; land prices rise steadily |
| **Mid-cycle pause** | ~1 year | Brief pullback or plateau in activity; often triggered by a monetary policy tightening; tests over-leveraged players |
| **Late expansion / euphoria** (years 11--14) | ~4 years | Rapid price appreciation; speculative activity increases; underwriting standards loosen; over-building begins; new entrants crowd into development |
| **Downturn** (years 15--18) | ~4 years | Prices decline; vacancies rise; construction halts; loan defaults increase; distressed sales; developer bankruptcies |

### Historical Peaks

| Cycle Peak | Preceding Boom | Downturn |
|---|---|---|
| 1818 | Post-War of 1812 land speculation | Panic of 1819 |
| 1836 | Western land speculation | Panic of 1837 |
| 1854 | Railroad expansion | Panic of 1857 |
| 1873 | Post-Civil War reconstruction | Long Depression (1873--1879) |
| 1890 | Western expansion, railroad land | Panic of 1893 |
| 1907 | Trust company speculation | Panic of 1907 |
| 1926 | Florida land boom, roaring 20s | Great Depression (1929--1939) |
| 1973 | REIT boom, office over-building | Stagflation recession |
| 1989 | S&L crisis, office over-building | 1990--1991 recession |
| 2006 | Subprime mortgage boom | Global Financial Crisis (2007--2009) |

Source: Homer Hoyt, *One Hundred Years of Land Values in Chicago* (1933); Fred Harrison, *Boom Bust* (2005); Georgist Journal (2012).

### Overbuilding Indicators

Key signals that a market is over-building:

- **Development spread compression:** When return on cost barely exceeds (or falls below) market cap rates, developers are accepting insufficient risk compensation.
- **Rising vacancy rates:** Vacancy climbing above the natural rate (5--7% for apartments, 8--12% for office) signals oversupply.
- **Absorption trailing deliveries:** When new units delivered per quarter consistently exceed net absorption, a surplus is forming.
- **Loosening underwriting:** Higher LTV ratios, interest-only periods, aggressive rent growth assumptions in pro formas.
- **Land price escalation exceeding rent growth:** When land prices rise faster than the NOI that buildings on that land can generate, the market is pricing in speculative appreciation rather than income.

---

## Speculation and Bubbles

### Mechanics of Housing Speculation

Speculation in real estate takes several forms:

1. **Land speculation:** Purchasing undeveloped land in anticipation of future rezoning, infrastructure investment, or demand growth. The speculator contributes nothing to the land's productivity --- the value increase comes from external factors (public investment, population growth, zoning changes).

2. **Flipping:** Buying properties (often with minimal renovation) and reselling quickly for a profit. During bubble periods, flippers rely on rapid price appreciation rather than rental income.

3. **Leveraged investment:** Real estate's unique feature is that it can be purchased with 60--90% borrowed money. A 20% price increase on a property purchased with 80% leverage produces a 100% return on equity. This leverage amplifies both gains and losses, creating the conditions for boom-bust dynamics.

### The 2008 Crisis

The 2006--2009 housing crisis is the most thoroughly documented real estate bubble in history. The Case-Shiller US National Home Price Index peaked at 198.01 in Q1 2006 and bottomed at 114 in Q1 2012 --- a 42% decline from peak to trough.

Key mechanics (FDIC Crisis History; BLS Monthly Labor Review 2010):

1. **Loose credit:** Subprime and Alt-A mortgage originations grew from $160 billion in 2001 to over $600 billion in 2006. Underwriting standards collapsed --- no-documentation loans, stated-income loans, zero-down-payment products, and option-ARMs proliferated.

2. **Securitization:** Mortgage-backed securities (MBS) and collateralized debt obligations (CDOs) allowed lenders to originate mortgages and immediately sell the risk. This severed the feedback loop between lending standards and loan performance.

3. **Speculative demand:** In bubble markets (Florida, Arizona, Nevada, California), investor/speculative purchases reached 25--40% of transactions. Case and Shiller's survey data showed that buyers expected 10--15% annual appreciation --- expectations that no fundamental supported.

4. **Supply response:** Builders responded to rising prices with massive construction. US housing starts peaked at 2.07 million in January 2006, far above the long-run average of ~1.5 million. When demand collapsed, this excess inventory took years to absorb.

5. **Leverage unwind:** When prices fell 10--20%, millions of homeowners were "underwater" (mortgage exceeded home value). Defaults cascaded through the MBS market, triggering a global financial crisis.

### Lessons for Modeling

The 2008 crisis demonstrated several dynamics relevant to simulation:
- **Price-to-rent ratios** above historical norms signal a bubble (national ratio peaked at ~1.5x the long-run average in 2006)
- **Speculative demand is self-reinforcing** until it isn't --- rising prices attract more speculators, pushing prices higher
- **Supply elasticity matters:** markets with elastic supply (Texas, Georgia) experienced smaller price bubbles because construction could respond, while supply-constrained markets (California, Florida coastal) saw extreme price swings
- **Credit conditions are the accelerant:** without loose lending, speculative demand cannot reach bubble proportions

---

## Land Banking

### Definition and Strategy

Land banking is the practice of acquiring undeveloped or underutilized land and holding it for future development or resale at higher prices. It is a form of speculation on future land value appreciation, distinct from active development.

Land bankers include:
- **Homebuilders** who acquire raw land years ahead of planned subdivisions
- **Institutional investors** who buy agricultural land on the urban fringe anticipating annexation and rezoning
- **Municipal land banks** (public entities) that acquire tax-delinquent or abandoned properties for future redevelopment
- **Speculators** who buy and hold without any development intent, waiting purely for appreciation

### Economics

The land banking equation:

```
Return = (Future Sale Price - Acquisition Cost - Holding Costs) / Acquisition Cost

Holding Costs = Property Taxes + Opportunity Cost of Capital + Maintenance + Insurance
```

Annual holding costs for raw land typically run 2--5% of value (property taxes of 1--2%, plus insurance, fencing, mowing). The opportunity cost of capital tied up in land --- money that could earn returns elsewhere --- is the largest implicit cost and is often underestimated by amateur speculators.

### Impact on Housing Supply

Land banking can constrain housing supply by keeping developable land off the market. Murray (2020) found in *"Time is money: How landbanking constrains housing supply"* (Journal of Housing Economics) that the option value of holding undeveloped land creates a real cost of development that static models miss. When land appreciates at rates comparable to development profits, the incentive to actually build diminishes --- the landowner can earn comparable returns by simply holding.

Empirical evidence:
- Gyourko and Molloy (NBER, 2014) found that regulation is the single most important influence on housing supply, but land speculation amplifies the effect by reducing the inventory of "shovel-ready" parcels.
- The DC Policy Center (2019) estimated that land use regulations and associated delays add 2.6% to final home prices through the opportunity cost of land sitting idle during approval processes, and an additional 3.1% through interest expense on debt-financed land acquisition during permitting delays.

### The George / Georgist Critique

Henry George's 1879 *Progress and Poverty* argued that land speculation is the primary cause of boom-bust cycles and poverty amid plenty. George proposed a "land value tax" --- taxing land values at near 100% while exempting improvements --- to eliminate the speculative return from holding land and force owners to develop or sell. This remains the theoretical foundation of Georgist economics and has influenced real-world land value taxation in places like Pennsylvania (split-rate property tax), Denmark, and parts of Australia.

---

## Adaptive Reuse and Redevelopment

### The Conversion Opportunity

Adaptive reuse --- converting obsolete buildings to new uses --- has surged in importance as remote work hollowed out urban office markets. The most common conversion is office-to-residential, but warehouse-to-loft, church-to-condo, factory-to-brewery, and retail-to-medical conversions are also common.

RentCafe (2025) reported that nearly 71,000 apartments were expected from office conversions nationally in 2025, a 28% year-over-year increase. This represents an all-time high for adaptive reuse.

### Cost Comparison

Gensler (2024) found that office-to-residential conversion costs can be approximately 30% lower than new construction for comparable projects. However, the economics are highly building-specific:

| Factor | New Construction | Office Conversion |
|---|---|---|
| Acquisition + construction | $350--500/SF | $300--685/SF |
| Timeline | 30--50 months | 18--36 months |
| Unit layouts | Optimized | Constrained by floor plate |
| Natural light / ventilation | Designed for code | Often problematic (deep floor plates) |
| Structural capacity | Purpose-built | May need reinforcement |
| Code compliance | Straightforward | Change-of-use triggers upgrades |
| Parking | Designed in | May require variance |

Source: Gensler (2024); NYC Comptroller Office-to-Residential Report (2025); RentCafe (2025).

### Feasibility Constraints

Not all buildings are good conversion candidates. The ideal office-to-residential conversion building has:
- **Narrow floor plates** (< 70 feet deep, so units can have windows on at least one side)
- **High floor-to-floor heights** (allowing new mechanical distribution within floors)
- **Good structural condition** (avoiding costly seismic or structural upgrades)
- **Central location** with residential amenities (transit, retail, parks)
- **Low acquisition cost** (distressed office assets, often purchased at 30--60% of peak value)

Buildings with deep floor plates (> 90 feet), low floor heights, or central HVAC systems that cannot be split to individual units are often infeasible to convert.

### Redevelopment vs. New Construction

When existing buildings reach the end of their economic life (maintenance costs exceed rental income, or the building no longer meets market needs), the developer faces a build-vs-renovate decision:

```
Redevelopment value = Completed project value - (Renovation cost + Lost income during construction)
New construction value = Completed project value - (Demolition + New construction cost)

Choose whichever yields higher return on cost.
```

In general, adaptive reuse is favored when:
- The existing structure is sound and adaptable
- Acquisition cost is well below replacement cost
- Historic tax credits or other incentives apply (federal historic tax credit = 20% of qualified rehabilitation expenditure)
- The conversion timeline is shorter than new construction

---

## Developer Incentives and Public Subsidy

### Why Subsidies Exist

Private development serves market-rate demand. When policy goals (affordable housing, neighborhood revitalization, job creation) require development that the market would not produce on its own, governments use incentives to bridge the gap between project cost and market return.

### Major Incentive Programs

#### Low-Income Housing Tax Credit (LIHTC)

Created in 1986 and made permanent in 1993, LIHTC is the largest source of affordable housing production in the US. It provides approximately $10.5 billion in annual budget authority through tax credits allocated to state housing finance agencies.

Two credit types:
- **9% credit:** Covers roughly 70% of eligible development costs. Highly competitive --- states receive limited allocations. Used for new construction without other federal subsidies.
- **4% credit:** Covers roughly 30% of eligible development costs. Non-competitive (available to all qualifying projects). Typically paired with tax-exempt bonds. Used for new construction with additional subsidies or acquisition/rehabilitation.

LIHTC credits are claimed over a 10-year period. Developers syndicate the credits to institutional investors (typically banks and insurance companies) who provide upfront equity in exchange for the future tax benefits. A typical LIHTC deal structure:

```
Total development cost: $30,000,000
LIHTC equity (investor): $18,000,000 (60%)
Soft debt (deferred, low-interest): $8,000,000 (27%)
Developer equity: $1,500,000 (5%)
Gap financing (local subsidy): $2,500,000 (8%)
```

Source: Novogradac; Tax Policy Center; Congressional Research Service.

#### Tax Increment Financing (TIF)

TIF captures the increased property tax revenue generated by new development within a designated district and redirects it to fund infrastructure and public improvements within that district. It does not raise taxes --- it redirects the *increment* above the pre-development baseline.

#### Opportunity Zones

Created by the 2017 Tax Cuts and Jobs Act, Opportunity Zones provide capital gains tax benefits for investments in designated low-income census tracts. Investors who place capital gains into Qualified Opportunity Funds receive deferral of the original gain and exclusion of gains on the new investment if held 10+ years. The program has directed significant capital into distressed areas, though critics argue it has primarily subsidized projects that would have occurred anyway.

#### Property Tax Abatements

Local governments may reduce or eliminate property taxes on new development for a fixed period (typically 5--25 years) to incentivize construction. Common structures include:
- **Abatement:** Direct reduction in assessed value or tax rate
- **Exemption:** Property removed from tax roll for a period
- **PILOT (Payment in Lieu of Taxes):** Alternative payment calculated as a percentage of revenue rather than assessed value

#### Impact Fee Waivers and Density Bonuses

Municipalities may waive impact fees (charges to developers to fund infrastructure) or grant density bonuses (allowing more units than zoning permits) in exchange for affordable housing set-asides, green building features, or other public benefits.

---

## Commercial vs. Residential Development

### Fundamental Economic Differences

Commercial and residential real estate operate under different economic logics despite sharing the same feasibility framework.

| Dimension | Residential | Commercial |
|---|---|---|
| **Tenant type** | Individuals / households | Businesses |
| **Lease term** | 12 months (typical) | 3--10+ years |
| **Lease structure** | Gross (landlord pays expenses) | NNN, gross, or modified gross |
| **Tenant improvement** | Minimal (paint, carpet) | $20--80/SF (office TI) |
| **Rent escalation** | Annual (2--5%, market-driven) | Contractual (CPI-linked or fixed bumps) |
| **Vacancy risk** | Low (people always need housing) | Higher (business cycles, remote work) |
| **Cap rates (2025)** | 4--6% (multifamily) | 5--8.5% (office, retail) |
| **Management intensity** | High (many small tenants, turnover) | Lower (fewer tenants, longer terms) |
| **Credit risk** | Diffuse (no single tenant > 1--2% of revenue) | Concentrated (anchor tenant may be 30--50%) |

### Lease Structures Explained

**Gross lease:** Tenant pays a single rent amount; landlord pays all operating expenses (taxes, insurance, maintenance, utilities). Common in residential and some office markets. The landlord bears the risk of rising expenses.

**Modified gross lease:** Tenant pays base rent plus a share of expense increases above a base-year amount. Common in office markets.

**Triple net (NNN) lease:** Tenant pays base rent plus all three "nets" --- property taxes, insurance, and common area maintenance (CAM). The landlord receives a predictable net income stream. Common in retail (especially single-tenant buildings) and industrial. NNN properties trade at lower cap rates (5.5--7.0%) because the income stream is more predictable.

A space advertised at $12/SF NNN typically costs the tenant $18--22/SF when the three nets are added, comparable to a gross lease at the same all-in rate.

### Development Implications

**Residential** development is driven by population growth, household formation, and income levels. Demand is relatively stable (people always need housing) but rents are constrained by tenant income. The developer's primary risk is construction cost and lease-up timing.

**Office** development is driven by employment growth, particularly in white-collar sectors. Demand is highly cyclical and, since 2020, structurally challenged by remote work. Office development requires wider development spreads (250--350+ bps) to compensate for longer lease-up periods and higher tenant improvement costs.

**Retail** development has shifted from speculative shopping center construction to build-to-suit and anchor-tenant-driven models. Most new retail is part of mixed-use projects or pad sites for credit tenants (national chains with strong balance sheets).

**Industrial/logistics** development has been the strongest sector since 2020, driven by e-commerce growth. Industrial buildings are the cheapest to build ($80--150/SF), have the shortest timelines (15--30 months total), and face strong demand. Cap rates have compressed significantly.

---

## Application to Bitborough

The current zone development system uses a probability-based model: each tick, undeveloped zoned tiles have a ~10% base chance of developing (modulated by demand and land value), and existing buildings have a ~2% base chance of density upgrade. This produces organic-feeling growth but abstracts away the economic decision-making that drives real-world development. Adding development economics would create richer emergent behavior.

### 1. Construction Cost Gates

Replace the flat land-value-threshold system for density upgrades with explicit construction cost calculations that interact with zone economics.

Define a construction cost per unit by density tier:

```typescript
const CONSTRUCTION_COST_PER_UNIT: Record<DensityLevel, number> = {
  low: 200,      // $200K — single-family / small building
  medium: 300,   // $300K — mid-rise (wood-over-podium cost jump)
  high: 500,     // $500K — high-rise (steel/concrete cost jump)
};
```

A density upgrade should only occur when the projected revenue from the higher-density building exceeds the construction cost plus a required return:

```
upgrade_feasible = (projected_NOI / construction_cost) >= required_return_on_cost

projected_NOI = units * avg_rent * 12 * (1 - vacancy_rate) * (1 - operating_expense_ratio)
construction_cost = units * cost_per_unit[target_density]
required_return_on_cost = market_cap_rate + development_spread

// Example: medium density (40 units, $1,200/mo rent, 5% vacancy, 40% OpEx)
projected_NOI = 40 * 1200 * 12 * 0.95 * 0.60 = $328,320
construction_cost = 40 * 300000 = $12,000,000
return_on_cost = 328320 / 12000000 = 2.74%
// If market cap rate is 5% + 150bps spread → required 6.5%
// 2.74% < 6.5% → upgrade does NOT pencil at these rents
```

This creates natural density ceilings tied to rent levels. High-density only becomes feasible when rents (driven by demand and desirability) are high enough to justify the cost jump.

### 2. Developer AI with Pro Forma Decisions

Introduce a lightweight developer agent that evaluates potential projects using a simplified pro forma:

```typescript
interface DeveloperDecision {
  tile: TileId;
  targetDensity: DensityLevel;
  projectedNOI: number;
  totalCost: number;        // land + construction + soft costs
  returnOnCost: number;     // NOI / totalCost
  developmentSpread: number; // returnOnCost - marketCapRate
  feasible: boolean;        // spread >= minimumSpread
}

function evaluateDevelopment(tile: TileId, targetDensity: DensityLevel): DeveloperDecision {
  const landCost = getLandValue(tile) * LAND_COST_MULTIPLIER;
  const hardCost = getUnits(targetDensity) * CONSTRUCTION_COST_PER_UNIT[targetDensity];
  const softCostRatio = 0.30; // 30% of hard costs
  const totalCost = landCost + hardCost * (1 + softCostRatio);

  const units = getUnits(targetDensity);
  const monthlyRent = getMarketRent(tile);
  const vacancyRate = getCityVacancyRate();
  const opExRatio = 0.40;
  const projectedNOI = units * monthlyRent * 12 * (1 - vacancyRate) * (1 - opExRatio);

  const returnOnCost = projectedNOI / totalCost;
  const marketCapRate = getMarketCapRate();          // e.g. 0.05
  const minimumSpread = MINIMUM_SPREAD[targetDensity]; // e.g. 0.015
  const developmentSpread = returnOnCost - marketCapRate;

  return {
    tile,
    targetDensity,
    projectedNOI,
    totalCost,
    returnOnCost,
    developmentSpread,
    feasible: developmentSpread >= minimumSpread,
  };
}
```

Each tick, instead of a flat probability roll, the simulation:
1. Identifies undeveloped zoned tiles meeting basic conditions (road, power, demand > 0)
2. Runs `evaluateDevelopment()` for each candidate
3. Ranks feasible projects by development spread (highest spread = most attractive)
4. Develops a limited number per tick (simulating finite developer capacity and capital)

This produces realistic behavior: development concentrates where returns are highest, avoids areas where costs exceed revenue potential, and naturally slows when market conditions deteriorate.

### 3. Market Cycle Oscillation

Add an 18-year market cycle that modulates cap rates, lending standards, and developer confidence:

```typescript
// Cycle position: 0.0 = trough, 1.0 = peak, maps to ~18 game-years
function getMarketCyclePosition(gameMonth: number): number {
  const CYCLE_LENGTH_MONTHS = 18 * 12; // 216 months
  const phase = (gameMonth % CYCLE_LENGTH_MONTHS) / CYCLE_LENGTH_MONTHS;
  // Asymmetric: 14 years up, 4 years down
  if (phase < 14 / 18) {
    // Expansion phase: sinusoidal rise
    return Math.sin((phase / (14 / 18)) * Math.PI / 2);
  } else {
    // Contraction phase: faster decline
    const contractionPhase = (phase - 14 / 18) / (4 / 18);
    return Math.cos(contractionPhase * Math.PI / 2);
  }
}

function getMarketCapRate(cyclePosition: number): number {
  // Cap rates compress during booms, expand during busts
  const BASE_CAP_RATE = 0.055;
  const CYCLE_AMPLITUDE = 0.015; // +/- 150bps over the cycle
  return BASE_CAP_RATE - (cyclePosition - 0.5) * CYCLE_AMPLITUDE * 2;
  // Peak (position=1.0): 4.0% cap rate (high valuations)
  // Trough (position=0.0): 7.0% cap rate (low valuations)
}

function getCreditAvailability(cyclePosition: number): number {
  // LTV ratios loosen during booms
  const BASE_LTV = 0.65;
  const CYCLE_AMPLITUDE = 0.10;
  return BASE_LTV + cyclePosition * CYCLE_AMPLITUDE;
  // Peak: 75% LTV; Trough: 65% LTV
}
```

Effects on gameplay:
- **Expansion:** Lower cap rates increase property values, wider credit availability enables more projects, development spreads are healthy, construction booms
- **Mid-cycle pause:** Brief tightening tests over-leveraged projects
- **Late expansion:** Cap rates compress until development spreads thin, over-building begins
- **Downturn:** Cap rates spike, property values fall, vacancies rise, construction halts, dereliction increases

### 4. Speculation Mechanics

Allow a "speculator" dynamic where land values inflate beyond income-justified levels:

```typescript
function getSpeculativePremium(tile: TileId, cyclePosition: number): number {
  const baseValue = getIncomeBasedLandValue(tile); // NOI / cap rate
  const recentAppreciation = getRecentAppreciationRate(tile, 24); // 2-year lookback
  const speculativeFactor = Math.max(0, recentAppreciation - 0.03); // appreciation > 3%/yr triggers speculation

  // Speculation intensifies late in the cycle
  const cycleMultiplier = Math.pow(cyclePosition, 2); // nonlinear — most speculation near peak

  return baseValue * speculativeFactor * cycleMultiplier * 2.0;
}

// Speculative premium inflates land values above fundamental value
// When the cycle turns, the premium collapses → price correction
function getMarketLandValue(tile: TileId): number {
  const fundamentalValue = getIncomeBasedLandValue(tile);
  const cyclePosition = getMarketCyclePosition(currentGameMonth);
  const premium = getSpeculativePremium(tile, cyclePosition);
  return fundamentalValue + premium;
}
```

This creates bubble dynamics: late-cycle speculative premiums inflate land values, which raises construction costs (via land cost), which squeezes development spreads, which eventually halts new construction even as prices continue to rise (the classic late-bubble pattern). When the cycle turns, the speculative premium collapses, land values crash, and distressed properties become available --- restarting the cycle.

### 5. Adaptive Reuse of Derelict Buildings

Currently, derelict buildings are simply demolished. Add an adaptive reuse pathway:

```typescript
function evaluateAdaptiveReuse(tile: TileId): DeveloperDecision | null {
  const building = getBuilding(tile);
  if (!building || building.condition > 0.3) return null; // only derelict buildings

  const currentZone = building.zone;
  const conversionTargets = getConversionTargets(currentZone);
  // e.g., derelict commercial → residential; derelict industrial → commercial

  for (const targetZone of conversionTargets) {
    const conversionCost = getConversionCost(building, targetZone);
    // Conversion costs are 60-80% of new construction
    const newConstructionCost = getNewConstructionCost(targetZone, building.density);
    const costRatio = 0.70; // 30% savings vs. new construction

    const totalCost = conversionCost;
    const projectedNOI = estimateNOI(tile, targetZone, building.density);
    const returnOnCost = projectedNOI / totalCost;

    if (returnOnCost - getMarketCapRate() >= MINIMUM_SPREAD.reuse) {
      return {
        tile,
        targetDensity: building.density,
        projectedNOI,
        totalCost,
        returnOnCost,
        developmentSpread: returnOnCost - getMarketCapRate(),
        feasible: true,
        isAdaptiveReuse: true,
      };
    }
  }
  return null;
}
```

Conversion rules:
- Derelict commercial/industrial buildings can convert to residential (the office-to-residential pattern)
- Derelict residential can convert to commercial in high-commercial-demand areas
- Conversion costs are 60--80% of new construction
- Conversion timelines are 60--75% of new construction duration
- Buildings must be below a condition threshold (e.g., condition < 0.3) to be conversion candidates

This creates the real-world pattern where obsolete buildings in transitioning neighborhoods are recycled into new uses rather than demolished, producing a more organic-feeling city evolution.

### 6. Subsidy Mechanics (Optional)

Add player-controlled incentive tools:

| Tool | Cost to City | Effect |
|---|---|---|
| **Tax abatement** | Foregone property tax (5--15 years) | Reduces developer operating costs, making marginal projects feasible |
| **Density bonus** | None (regulatory) | Allows higher density in exchange for affordable unit set-aside |
| **TIF district** | Redirected tax increment | Funds infrastructure in designated area, raising land values |
| **Impact fee waiver** | Foregone fee revenue | Reduces development cost by 2--5% |

These create the real-world tradeoff: subsidies accelerate development but reduce near-term city revenue, and poorly targeted subsidies can subsidize projects that would have happened anyway.

---

## Cross-References

- [Housing](./housing.md) --- supply elasticity, filtering theory, affordability, construction cost curves, vacancy dynamics
- [Municipal Finance](./municipal-finance.md) --- property tax, TIF districts, impact fees, revenue per acre, the growth Ponzi scheme
- [Land Use and Zoning](./land-use-and-zoning.md) --- zoning as the binding supply constraint, FAR, density bonuses, entitlement process
- [Economy and Employment](./economy-and-employment.md) --- economic base theory, employment-driven demand, commercial/industrial dynamics
- [Urban Growth Patterns](./urban-growth-patterns.md) --- monocentric/polycentric models, gentrification, neighborhood lifecycle, sprawl vs. infill

---

## Sources

### Academic Papers and Books
- Case, K. & Shiller, R. (2003). ["Is there a bubble in the housing market?"](http://www.econ.yale.edu/~shiller/pubs/p1089.pdf) *Brookings Papers on Economic Activity*, 2003(2), 299-342.
- [Case, K. (2008). "The Central Role of Home Prices in the Current Financial Crisis."](https://www.brookings.edu/wp-content/uploads/2016/07/2008b_bpea_case.pdf) *Brookings Papers on Economic Activity*, Fall 2008.
- [Gao, Z., Sockin, M., & Xiong, W. (2020). "Economic Consequences of Housing Speculation."](https://wxiong.mycpanel.princeton.edu/papers/Speculation.pdf) *Review of Financial Studies*, 33(11), 5248-5287.
- George, H. (1879). *Progress and Poverty.* Robert Schalkenbach Foundation (reprint).
- [Glaeser, E. & Gyourko, J. (2018). "The Economic Implications of Housing Supply."](https://www.aeaweb.org/articles?id=10.1257/jep.32.1.3) *Journal of Economic Perspectives*, 32(1), 3-30.
- [Gyourko, J. & Molloy, R. (2014). "Regulation and Housing Supply."](https://www.nber.org/system/files/working_papers/w20536/w20536.pdf) NBER Working Paper 20536.
- Harrison, F. (2005). *Boom Bust: House Prices, Banking and the Depression of 2010.* Shepheard-Walwyn.
- Hoyt, H. (1933). *One Hundred Years of Land Values in Chicago.* University of Chicago Press.
- Linneman, P. & Kirsch, B. (2024). [*Real Estate Finance and Investments: Risks and Opportunities.*](https://textbook.getrefm.com/chapter-11-development-feasibility-analysis/) REFM Press.
- [Murray, C. (2020). "Time is money: How landbanking constrains housing supply."](https://www.sciencedirect.com/science/article/abs/pii/S1051137720300449) *Journal of Housing Economics*, 49, 101708.
- [Saiz, A. (2010). "The geographic determinants of housing supply."](https://academic.oup.com/qje/article-abstract/125/3/1253/1903664) *Quarterly Journal of Economics*, 125(3), 1253-1296.
- [Selcuk, A. & Yavas, A. (2024). "Real Estate Development Feasibility and Hurdle Rate Selection."](https://www.mdpi.com/2075-5309/14/4/1045) *Buildings*, 14(4), 1045.

### Industry Data and Reports
- [NAHB (2025). "Cost of Constructing a Home in 2024."](https://www.nahb.org/news-and-economics/housing-economics-plus/special-studies/special-studies-pages/cost-of-constructing-a-home-in-2024)
- [NAHB Eye on Housing (2025). "Square Foot Prices Moderate in 2024."](https://eyeonhousing.org/2025/10/square-foot-prices-moderate-in-2024/)
- [RSMeans (2025). "How Much Does It Cost to Build an Apartment Complex?"](https://www.rsmeans.com/resources/how-much-does-it-cost-to-build-an-apartment-complex)
- [EVstudio. "Construction Cost Per Square Foot for Multi-family Housing Based on Construction Type."](https://evstudio.com/construction-cost-per-square-foot-for-multifamily-housing-based-on-construction-type/)
- [Multifamily Loans (2026). "Apartment Construction Costs in 2026."](https://www.multifamily.loans/apartment-finance-blog/multifamily-construction-costs-an-investor-guide/)
- [WoodWorks / Wood Products Council. "Code Path and Requirements for Mid-Rise Podium Projects."](https://www.woodworks.org/resources/code-path-and-requirements-for-podium-projects/)
- [Novogradac. "About the LIHTC."](https://www.novoco.com/resource-centers/affordable-housing-tax-credits/about-lihtc)
- [Tax Policy Center. "What is the Low-Income Housing Tax Credit and how does it work?"](https://taxpolicycenter.org/briefing-book/what-low-income-housing-tax-credit-and-how-does-it-work)
- [Congressional Research Service. "An Introduction to the Low-Income Housing Tax Credit." RS22389.](https://www.congress.gov/crs-product/RS22389)
- [JP Morgan Chase. "Cap Rates, Explained."](https://www.jpmorgan.com/insights/real-estate/commercial-term-lending/cap-rates-explained)
- [Westwood Net Lease (2025). "2025 Year in Review: A Transformational Year for NNN Lease Investors."](https://westwoodnetlease.com/2025-year-in-review-nnn-lease-investors/)
- [Wall Street Prep. "Development Spread: Formula + Calculator."](https://www.wallstreetprep.com/knowledge/development-spread/)
- [Adventures in CRE (2024). "Using Development Spread in Real Estate Analysis."](https://www.adventuresincre.com/development-spread/)
- [PropertyMetrics. "How the Development Spread Works."](https://propertymetrics.com/blog/development-spread/)
- [PropertyMetrics. "The Real Estate Proforma: A Beginner's Guide."](https://propertymetrics.com/blog/real-estate-proforma/)

### Adaptive Reuse
- [RentCafe (2025). "Office to Apartment Conversions to Peak at 71K Units in 2025."](https://www.rentcafe.com/blog/rental-market/market-snapshots/adaptive-reuse-office-to-apartments-2025/)
- [Facilities Dive / Gensler (2024). "Office-to-residential conversion costs can be 30% lower than new construction."](https://www.facilitiesdive.com/news/office-to-residential-conversion-costs-can-be-30-lower-than-new-constructi/700334/)
- [NYC Comptroller (2025). "Office-to-Residential Conversions in NYC: Economics and Fiscal Estimates."](https://comptroller.nyc.gov/reports/office-to-residential-conversions-in-nyc-economics-and-fiscal-estimates/)
- [Sightline Institute (2021). "We Ran the Rent Numbers on Portland's 7 Newly Legal Home Options."](https://www.sightline.org/2021/08/01/we-ran-the-rent-numbers-on-portlands-7-newly-legal-home-options/)

### Market Cycles and Speculation
- [Georgist Journal (2012). "The Eighteen-Year Real Estate Cycle."](http://georgistjournal.org/2012/08/26/the-eighteen-year-real-estate-cycle/)
- [Harrison, F. "The Hoyt Heist" (from *The Power in the Land*, 1983).](https://www.cooperative-individualism.org/harrison-fred_the-power-in-the-land-1983-08-the-hoyt-heist.pdf)
- [Harvard Extension School. "How to Use Real Estate Trends to Predict the Next Housing Bubble."](https://extension.harvard.edu/blog/how-to-use-real-estate-trends-to-predict-the-next-housing-bubble/)
- [FDIC. "Origins of the Crisis."](https://www.fdic.gov/media/18636)
- [BLS (2010). "Housing Bubble and Bust." *Monthly Labor Review*, December 2010.](https://www.bls.gov/opub/mlr/2010/12/art1full.pdf)
- [Lincoln Institute of Land Policy. "Housing, Land, and the Economic Crisis."](https://www.lincolninst.edu/publications/articles/housing-land-economic-crisis/)
- [FRED / S&P CoreLogic Case-Shiller US National Home Price Index.](https://fred.stlouisfed.org/series/CSUSHPINSA)

### Land Banking and Regulation
- [DC Policy Center (2019). "The economic costs of land use regulations."](https://www.dcpolicycenter.org/publications/economic-cost-land-use/)
- [Altus Group. "Property Development Feasibility Guide Part 3: Residual Land Value."](https://www.altusgroup.com/insights/property-development-feasibility-guide-part-3/)
- [HUD. "The Effects of Land Use Regulation on the Price of Housing."](https://www.huduser.gov/periodicals/cityscpe/vol8num1/ch3.pdf)

### Construction Timelines
- [US Census Bureau. Survey of Construction (2024).](https://www.census.gov/construction/nrc/pdf/avg_starttocomp.pdf)
- [Lev.co. "Real Estate Development Timeline: The Complete Guide."](https://www.lev.co/blog/real-estate-development-timeline)
- [CALBO. "Permitting Timelines."](https://www.calbo.org/post/permitting-timelines)
