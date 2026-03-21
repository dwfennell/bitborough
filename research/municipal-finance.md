# Municipal Finance

> How cities fund themselves — tax structures, bonds, budgets, and fiscal sustainability models.

## Table of Contents

- [Property Tax](#property-tax)
- [Tax Incidence and Distributional Effects](#tax-incidence-and-distributional-effects)
- [Sales Tax and Other Revenue](#sales-tax-and-other-revenue)
- [Fee-Based Revenue](#fee-based-revenue)
- [Municipal Bonds](#municipal-bonds)
- [Tax Increment Financing (TIF)](#tax-increment-financing-tif)
- [Development Impact Fees](#development-impact-fees)
- [Corporate Tax Competition](#corporate-tax-competition)
- [Budget Structure](#budget-structure)
- [Public Pensions and OPEB](#public-pensions-and-opeb)
- [Revenue Volatility and Stabilization](#revenue-volatility-and-stabilization)
- [Fiscal Multipliers](#fiscal-multipliers)
- [The Growth Ponzi Scheme](#the-growth-ponzi-scheme)
- [Revenue Per Acre](#revenue-per-acre)
- [Municipal Bankruptcy](#municipal-bankruptcy)
- [Budget Cycles](#budget-cycles)
- [Application to Bitborough](#application-to-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

---

## Property Tax

Property tax is the single most important revenue source for local governments. It accounts for roughly 61% of all local tax collections nationwide and is the dominant tax revenue source in 93% of U.S. localities (ITEP, 2024). Unlike sales or income taxes, property tax is inherently spatial — it maps directly to land and buildings, making it the natural backbone of any city-builder economy.

### Assessment

Every taxable parcel has an **assessed value** determined by a local assessor. The assessed value is typically some fraction of the property's **market value** (also called "fair market value"). The ratio between assessed and market value is the **assessment ratio**, which varies by state:

| State Example | Assessment Ratio |
|---|---|
| Ohio | 35% of market value |
| Georgia | 40% of market value |
| Florida | 100% (with homestead exemptions) |
| South Carolina | 4% (owner-occupied residential), 6% (commercial) |

Assessors use three standard appraisal methods:

1. **Sales comparison approach** — Examines recent sales of comparable properties. The most common method for residential parcels.
2. **Cost approach** — Estimates the cost to replace the structure minus depreciation, plus land value. Used for new or unique buildings.
3. **Income approach** — Capitalizes the net operating income the property generates. Standard for commercial and rental properties.

Reassessment frequency varies: some jurisdictions reassess annually, others on a 3- to 5-year cycle. Infrequent reassessment creates lag between market shifts and the tax base, which can cause revenue shortfalls during downturns (or unexpected windfalls during booms).

### Millage Rates

The **millage rate** (or "mill rate") defines tax owed per $1,000 of assessed value. One mill = $1 per $1,000 of assessed value = 0.1%. The formula:

```
Annual Property Tax = Assessed Value × (Millage Rate / 1000)
```

A homeowner with a $200,000 assessed value in a jurisdiction with a 25-mill rate pays $5,000/year. Multiple overlapping taxing authorities (city, county, school district, special districts) each levy their own millage, and the rates are summed. A typical breakdown:

| Taxing Authority | Mills |
|---|---|
| City / Municipality | 8–15 |
| County | 5–12 |
| School district | 15–30 |
| Fire district | 2–5 |
| Library district | 1–3 |
| **Total** | **31–65** |

Millage rates are set annually by elected officials. The governing body calculates the rate needed to meet its budget from the total assessed value base: `Required mills = Budget / Total assessed value × 1000`.

### Tax Base Erosion

A municipality's **tax base** is the aggregate assessed value of all taxable property. The base erodes through:

- **Population loss** — Fewer residents means lower demand, lower property values, lower assessments.
- **Property abandonment** — Vacant and blighted properties are often removed from the rolls or assessed at near-zero.
- **Tax-exempt expansion** — Government buildings, churches, hospitals, and universities pay no property tax. Cities like Pittsburgh, Boston, and Newark have 30–40% of their land area exempt.
- **Assessment caps** — Proposition 13–style laws that limit annual assessment growth (California caps at 2%/year) cause assessed values to diverge from market values over time.

When the tax base shrinks, the remaining taxpayers must shoulder higher mill rates to maintain the same revenue — a vicious cycle that accelerates decline.

---

## Tax Incidence and Distributional Effects

Property tax is often called the "perfect local tax" because of its stability and spatial fixity, but the question of **who actually bears the burden** is one of the most contested issues in public finance. The answer matters for both equity and for modeling realistic citizen behavior in a city-builder.

### Two Competing Views

Economists have debated property tax incidence for decades through two dominant theoretical lenses:

1. **The "New View" (capital-tax view)** — Associated with Mieszkowski (1972) and Zodrow/Mieszkowski (1986). Under this view, the property tax is fundamentally a tax on capital. The national average rate falls on all owners of capital (stocks, bonds, real estate), making it **progressive** because capital ownership is concentrated among the wealthy. Local deviations from the national average rate are borne by local factors (land and immobile labor), but the dominant effect is progressive.

2. **The "Benefit View"** — Associated with Hamilton (1975) and Tiebout (1956). Under this view, property tax is not really a "tax" at all but a **fee for local public services**. Households sort into jurisdictions that offer the tax-service bundle they prefer. If the tax perfectly matches the value of services received, it is efficient and neither progressive nor regressive — it is a voluntary price.

3. **The "Traditional View"** — The oldest perspective, treating property tax as an excise tax on housing consumption. Because lower-income households spend a larger share of their income on housing, the tax is **regressive**. This is the view that dominates most popular and political discourse.

### Empirical Evidence: Assessment Regressivity

Regardless of which theoretical view one adopts, a separate empirical problem makes the property tax effectively regressive in practice: **assessment bias**. Research from Berry (2021), Avenancio-Leon and Howard (2022), and Amornsiripanitch (2022) has documented a near-universal pattern:

- **Low-value homes are systematically over-assessed** relative to their market value, while high-value homes are under-assessed.
- Homes in the bottom decile of sales prices have an assessment-to-sale-price ratio that is on average **more than double** that of homes in the top decile (University of Chicago Property Tax Fairness Project).
- Owners of inexpensive homes pay effective tax rates roughly **50% higher** than owners of expensive homes in the same jurisdiction.
- Approximately 60% of this regressivity is caused by assessors' flawed valuation methods (failure to account for variation in neighborhood characteristics), and 40% is caused by infrequent reappraisal that fails to track diverging market trends.

### Racial Dimensions

Assessment regressivity has significant racial implications. Research from the Philadelphia Fed and others has found:

- Majority-Black neighborhoods face higher effective property tax rates than majority-white neighborhoods at equivalent home values.
- Detroit's assessment practices resulted in an estimated **$600 million in over-assessment** of primarily low-income, predominantly Black homeowners between 2009 and 2015, contributing to a wave of tax foreclosures.
- The pattern is structural, not intentional: mass appraisal models trained on sparse sales data in declining neighborhoods systematically overvalue properties relative to actual market conditions.

### Who Bears the Burden in Practice

The real-world incidence of property tax depends on the type of property:

| Property Type | Who Bears the Tax | Mechanism |
|---|---|---|
| Owner-occupied housing | Homeowner directly | Paid from household income; capitalized into purchase price |
| Rental housing | Tenants (primarily) | Landlords pass through tax increases via rent; supply elasticity determines split |
| Commercial property | Mixed: consumers, workers, owners | Depends on market power; may raise prices, lower wages, or reduce returns |
| Vacant / agricultural land | Landowner (fully) | Land is perfectly inelastic in supply — the tax cannot be shifted |

For rental housing — which disproportionately serves lower-income households — the evidence suggests that **most of the property tax is passed through to tenants** in the form of higher rent. This makes the effective incidence regressive even if the statutory burden falls on the landlord.

### Tax Limitations and Their Effects

Voter-imposed tax limitations like California's Proposition 13 (1978) create their own distributional distortions:

- **Horizontal inequity** — Two identical homes on the same street can have wildly different tax bills depending on when they were last sold. A home purchased in 1980 might be assessed at $80,000 while the identical house next door (sold in 2020) is assessed at $800,000.
- **Lock-in effect** — Longtime owners are incentivized to stay put rather than sell and reset their assessment, reducing housing mobility and turnover.
- **Intergenerational wealth transfer** — In California, Proposition 19 (2020) allows parents to pass low assessments to children, perpetuating tax advantages across generations.
- **Revenue starvation** — Assessment caps cause the tax base to diverge further from market values each year, requiring the city to either raise rates (often capped separately) or cut services.

---

## Sales Tax and Other Revenue

Property tax is dominant but not the only tool. The full local revenue portfolio:

### Revenue Source Breakdown

For every tax dollar collected by cities and counties nationwide, the typical split is (Pew Charitable Trusts, 2021):

| Source | Share of Local Tax Revenue |
|---|---|
| Property tax | ~61% |
| General sales tax | ~16% |
| Income tax | ~7% |
| Other taxes (excise, utility, hotel) | ~16% |

Beyond taxes, municipalities collect:

- **User fees and charges** — Water/sewer bills, building permits, park fees, parking meters. These can be 20–30% of total general revenue.
- **Fines and forfeitures** — Traffic tickets, code violations, court fees. A small but sometimes controversial source (see: Ferguson, MO, where fines were 23% of general fund revenue).
- **Intergovernmental transfers** — Federal and state grants, shared revenue programs, highway funds. Can represent 30–40% of a small city's total revenue.
- **Franchise fees** — Charges to utilities for using public rights-of-way.

### Sales Tax Mechanics

Local sales tax is levied as a percentage of retail transactions. Rates are typically 1–3% on top of state sales tax. Key characteristics:

- **Pro-cyclical** — Revenue rises in booms, crashes in recessions.
- **Spatially leaky** — Residents can shop in neighboring jurisdictions with lower rates.
- **Retail-dependent** — E-commerce has eroded the base for brick-and-mortar-focused sales tax regimes, though most states now collect online sales tax post-*Wayfair* (2018).

### Income Tax

Only 11 states authorize local income taxes. Where they exist, they generate roughly 24% of local tax revenue. Major cities using local income tax: New York City (3.078–3.876%), Philadelphia (3.75%), Detroit (2.4%).

---

## Fee-Based Revenue

One of the most significant structural shifts in municipal finance over the past four decades is the **growing reliance on fees and charges** relative to traditional tax revenue. User charge revenue in the average U.S. city increased by **143% from 1977 to 2012** (inflation- and population-adjusted). By 2021, local governments collected $326 billion from charges — 16% of general revenue (Tax Policy Center). In a study of the 39 largest U.S. cities, charges grew so much between 2003 and 2018 that they **equaled tax revenue** in half of those cities.

### Types of Municipal Fees

| Fee Type | Examples | Revenue Mechanism |
|---|---|---|
| **User fees** | Water/sewer bills, recreation program fees, transit fares, parking meters | Charges for direct use of a public service or facility |
| **Regulatory fees** | Building permits, zoning applications, health inspections, pet licenses | Charges to cover the cost of government oversight of regulated activities |
| **Utility rates** | Electric, water, sewer, stormwater, solid waste collection | Rates set to cover full cost of providing the utility service |
| **Franchise fees** | Cable TV franchise, electric utility franchise, gas utility franchise | Payment for the exclusive privilege of serving a given area using public rights-of-way |
| **Development fees** | Plan check fees, subdivision fees, environmental review fees | Charges associated with reviewing and approving development applications |
| **Enterprise charges** | Airport landing fees, port docking fees, convention center rentals | Revenue from government-operated business-type activities |

### Why Fees Have Grown

The shift from taxes to fees is driven by several converging forces:

- **Tax revolt legacy** — Proposition 13 (1978) and its successors in other states capped or froze property tax rates, forcing cities to find alternative revenue. Fees are often exempt from these caps because they are classified as "charges for service" rather than taxes.
- **Political path of least resistance** — Raising taxes requires supermajority votes or referendums in many states. Fees can often be set administratively by city councils or utility boards without voter approval.
- **Service-specific accountability** — Fee revenue can be earmarked to the service it funds, making costs transparent. Water rates fund the water system; building permit fees fund the building department.
- **Federal and state aid reductions** — As intergovernmental transfers have declined as a share of local revenue, cities have backfilled with user charges.
- **Infrastructure cost escalation** — Aging water, sewer, and stormwater systems require massive capital investment. Rate increases fund these enterprise obligations directly.

### Regressive Effects

The equity implications of this shift are significant. **User fees are the most regressive form of local revenue** — they are typically flat charges that take no account of ability to pay:

- A $50/month water bill represents 3% of income for a household earning $20,000/year, but only 0.3% for a household earning $200,000.
- Building permit fees, utility connection charges, and impact fees are passed through to homebuyers and renters, increasing housing costs.
- Recreation fees for youth sports, swimming pools, and after-school programs can price out low-income families from public amenities their taxes ostensibly fund.
- Court fines and fees — sometimes 10–20% of a small city's general fund — fall disproportionately on low-income residents and communities of color. The Ferguson, Missouri, DOJ investigation (2015) found that fines and forfeitures were 23% of the city's general fund revenue, with enforcement concentrated in Black neighborhoods.

### The Fines-and-Fees Trap

A subset of fee-based revenue — **legal fines and forfeitures** — has drawn particular scrutiny. The Institute for Justice has documented how some municipalities depend on fines for a significant share of their operating budgets, creating perverse enforcement incentives:

- Traffic cameras, parking tickets, code violations, and court fees generate revenue but impose concentrated costs on residents least able to pay.
- Failure to pay fines triggers additional fees, license suspensions, and even arrest warrants — a debt spiral that has been called a modern form of debtors' prison.
- The Urban Institute found that fine-and-fee revenue is correlated with the share of Black residents in a jurisdiction, even after controlling for crime rates and income levels.

---

## Municipal Bonds

Municipalities borrow by issuing bonds — debt instruments sold to investors, repaid with interest over 10–30 years. The U.S. municipal bond market is roughly $4 trillion outstanding.

### General Obligation (GO) Bonds

- Backed by the **full faith and credit** of the issuing government — meaning the municipality pledges its taxing power to repay.
- Repayment comes from the general fund (primarily property taxes).
- Typically require **voter approval** via referendum.
- Lower interest rates because of the strong security pledge.
- 62% of GO bonds are rated Aa3 or higher (Moody's).

### Revenue Bonds

- Backed by revenue from a **specific project or enterprise** — tolls, water bills, airport fees, etc.
- No general tax pledge; if the project's revenue falls short, bondholders bear the risk.
- Do **not** usually require voter approval.
- Higher yields than GOs because of higher risk.
- Only 41% are rated Aa3 or above.
- Common uses: water/sewer systems, toll roads, hospitals, power plants, stadiums.

### Credit Ratings

Bond credit ratings (Moody's / S&P / Fitch) determine borrowing costs. The scale runs from Aaa/AAA (prime) down to C/D (default). Factors that affect municipal credit:

| Factor | Weight |
|---|---|
| Economy / tax base breadth | High |
| Debt burden and structure | High |
| Financial operations (reserves, fund balance) | High |
| Management quality and governance | Medium |
| Pension and OPEB obligations | Medium-High |

A downgrade from Aa to A can increase borrowing costs by 20–50 basis points, adding millions to debt service over the life of a bond issue.

### Debt Service

**Debt service** = principal repayment + interest payments. A common benchmark: debt service should not exceed 10–15% of general fund expenditures. Above 20% is a red flag. Detroit's debt service consumed over 35% of general fund revenue before bankruptcy.

---

## Tax Increment Financing (TIF)

TIF is a value capture mechanism that uses *future increases* in property tax revenue from a designated district to finance present-day infrastructure and development costs. It is authorized in nearly all 50 states.

### How TIF Works

1. **District designation** — A geographic area is declared a TIF district. In many states, a "blight" finding is required.
2. **Base value freeze** — The aggregate assessed value of all properties in the district is frozen at the current level (the "base value").
3. **Increment capture** — All taxing authorities (city, county, school) continue to receive revenue based on the frozen base value. Any increase in assessed value above the base (the "increment") is captured by the TIF district.
4. **Financing** — The captured increment funds public improvements, either:
   - **Pay-as-you-go** — Increment revenue funds projects as it accumulates.
   - **Bond-financed** — Bonds are issued against projected future increment, providing upfront capital.
5. **Sunset** — TIF districts typically expire after 20–25 years. Once expired, all taxing authorities receive the full property tax revenue (base + increment).

### TIF Revenue Model

```
Annual TIF Revenue = (Current Assessed Value - Base Assessed Value) × Tax Rate

If bond-financed:
  Upfront Capital = PV(Annual TIF Revenue, discount_rate, term_years)
```

### Criticisms

- **Zero-sum redistribution** — TIF diverts revenue from schools and counties. If the development would have happened anyway ("but for" problem), TIF is just a subsidy.
- **Fiscal illusion** — TIF districts can mask the true tax burden. Non-TIF areas subsidize services within TIF districts.
- **Scope creep** — Some cities designate large portions of their area as TIF districts, undermining the intent.

---

## Development Impact Fees

Impact fees are **one-time charges** assessed on new development to fund the capital infrastructure required to serve that development. The goal: make growth pay for itself.

### What They Cover

| Category | Typical Components |
|---|---|
| Transportation | Roads, signals, sidewalks, transit facilities |
| Water / sewer | Treatment capacity, distribution lines |
| Parks / recreation | Parkland acquisition, facility construction |
| Schools | Classroom space for new students |
| Public safety | Police/fire station capacity |

### Typical Amounts

Impact fees vary enormously by jurisdiction. Data from a study of 89 California jurisdictions (HUD/NAHB):

| Percentile | Fee per Single-Family Home |
|---|---|
| Low | $6,783 |
| Median | ~$15,000 |
| Mean | $19,552 |
| High | $47,742 |

National median is lower — roughly $5,000–$12,000 per single-family unit in most states. Some high-cost California and Colorado jurisdictions exceed $50,000.

### Legal Requirements

State enabling statutes generally impose three constraints:

1. **Rational nexus** — The fee must be rationally connected to the need created by the development.
2. **Proportionality** — The fee must be roughly proportional to the development's impact.
3. **Benefit** — Fee revenue must be spent on facilities that benefit the fee-paying development.

Impact fees cannot fund operations or maintenance — only capital improvements.

---

## Corporate Tax Competition

Municipalities compete fiercely for large employers — particularly corporate headquarters, manufacturing plants, and data centers — by offering packages of tax abatements, subsidies, infrastructure investments, and regulatory concessions. This competition is economically significant: Good Jobs First's Subsidy Tracker database contains over **670,000 subsidy entries** from more than 1,400 programs, and academic estimates place the annual cost of state and local business tax incentives at **$45–70 billion**.

### The Race-to-the-Bottom Dynamic

Corporate location decisions pit cities and states against each other in a classic **prisoner's dilemma**:

1. A major employer announces it is considering relocating or expanding.
2. Multiple jurisdictions submit competing bids, each offering progressively larger incentive packages to undercut rivals.
3. The winning jurisdiction often provides subsidies that exceed the net fiscal benefit of the new jobs, especially after accounting for infrastructure costs, service demands, and opportunity costs.
4. Incumbent businesses and residents in the winning jurisdiction bear higher effective tax rates to compensate for the revenue foregone through abatements.

The result is a wealth transfer from taxpayers to corporations. When every jurisdiction offers incentives, none gains a competitive advantage — but all lose revenue. The firms that benefit most are large, mobile employers with the leverage to credibly threaten relocation.

### Case Study: Amazon HQ2

Amazon's 2017–2018 search for a second headquarters is the defining case study of modern corporate tax competition:

- Amazon issued a public RFP inviting bids from any city in North America. **238 cities** submitted proposals.
- Bids included staggering incentive packages: Newark offered $7 billion in tax incentives; Chicago offered $2.25 billion; Maryland offered $8.5 billion in subsidies and infrastructure.
- The process required cities to spend hundreds of hours and hundreds of thousands of dollars compiling detailed data about demographics, education levels, transportation infrastructure, and tax structures — effectively free consulting for Amazon's site selection.
- Amazon ultimately chose Arlington, Virginia (Crystal City) and Long Island City, New York. Virginia offered up to **$773 million**; New York offered nearly **$3 billion** in tax breaks.
- The New York deal collapsed after political backlash. Critics, including Rep. Alexandria Ocasio-Cortez, argued that subsidizing one of the world's most valuable companies while the city faced affordable housing and transit crises was indefensible. Amazon ultimately proceeded in Virginia without the New York site.

**Key lesson:** The HQ2 process demonstrated that incentives are often an extremely inefficient way to attract development. Amazon likely would have chosen the same locations regardless of subsidies — the talent pool, transit access, and proximity to Washington, D.C., were the actual decision drivers. The subsidies were a windfall, not a tipping factor.

### Case Study: Foxconn Wisconsin

The Foxconn deal in Wisconsin stands as perhaps the most spectacular subsidy failure in recent U.S. history:

- In 2017, Wisconsin offered Foxconn up to **$4.8 billion** in subsidies (including $2.85 billion in state tax credits) to build a massive LCD panel factory in Mount Pleasant, promising 13,000 jobs.
- The cost per job: **$346,000–$523,000**, compared to a national average subsidy of roughly $24,000 per job.
- By the end of 2018, Foxconn had created only **156 jobs** (of 260 required to qualify for subsidies). A 2019 audit found only 113 full-time workers.
- Foxconn repeatedly downscaled its plans — from a massive "Gen 10.5" LCD factory to a smaller facility, then to a largely automated plant requiring only 3,000 workers instead of 13,000.
- By 2021, Wisconsin had spent **$683 million** in taxpayer funds on a manufacturing campus that never materialized as promised. A University of Wisconsin study estimated the deal cost the state $20 billion in lost economic growth due to resource misallocation.

### Who Actually Benefits

The evidence on whether tax incentives work is mixed at best:

| Claim | Evidence |
|---|---|
| Incentives attract new jobs | Weak — most research finds that incentives are not the primary factor in location decisions; labor force, infrastructure, and market access matter more |
| Incentives pay for themselves through growth | Rarely — most independent analyses find that the cost of subsidies exceeds the tax revenue from new jobs, particularly when accounting for service demands |
| Incentives create net new economic activity | Usually no — most incentivized relocations are zero-sum transfers between jurisdictions, not new national economic activity |
| Benefits are broadly shared | No — subsidies flow to the relocating firm and its shareholders; costs are borne by existing taxpayers and competing businesses that receive no comparable breaks |

### Scale of the Problem

Good Jobs First tracks subsidies at both state and local levels. Illustrative examples of the scale:

- Amazon has received **$11.6 billion** in cumulative state and local subsidies across all operations (Good Jobs First Amazon Tracker).
- A single Amazon data center complex in Indiana secured **50 years of state sales tax exemptions** worth an estimated $4 billion, plus 35 years of personal property tax abatements valued at another $4 billion.
- Despite GASB Statement No. 77 (2015) requiring local governments to disclose tax abatement information in their financial statements, most jurisdictions still lack comprehensive accounting of the total cost of incentive programs.

---

## Budget Structure

Municipal budgets are organized into **funds**, each a self-balancing set of accounts.

### Fund Types

| Fund | Purpose | Funding Source |
|---|---|---|
| **General Fund** | Core municipal services (police, fire, parks, administration) | Property tax, sales tax, fees |
| **Enterprise Funds** | Self-supporting services (water, sewer, electric, transit) | User fees, rates |
| **Special Revenue Funds** | Earmarked revenues (grants, gas tax for roads) | Specific taxes or grants |
| **Capital Improvement Fund** | Multi-year infrastructure projects | Bonds, impact fees, transfers |
| **Debt Service Fund** | Bond principal and interest payments | Property tax levy, dedicated revenue |

### Typical General Fund Expenditure Breakdown

Based on Urban Institute data and GFOA city revenue dashboards, a representative mid-size U.S. city allocates its general fund roughly as follows:

| Category | % of General Fund |
|---|---|
| Public safety (police + fire) | 35–50% |
| Public works / streets | 10–15% |
| Parks and recreation | 5–10% |
| General government / admin | 8–12% |
| Community development | 3–6% |
| Debt service | 5–15% |
| Other (library, courts, health) | 5–10% |

Employee compensation (salary + benefits + pensions) typically accounts for 60–75% of general fund spending across all categories. This is the single largest cost driver.

### Enterprise Funds

Water, sewer, and electric utilities are typically run as enterprise funds — financially self-sustaining operations funded by user rates, not general taxes. This matters for city-builders because utility infrastructure has its own revenue/cost cycle separate from the general fund.

---

## Public Pensions and OPEB

Public pension obligations and other post-employment benefits (OPEB) represent the **largest off-balance-sheet liabilities** facing most municipalities. Unlike bonds, which are visible in debt service line items, pension and OPEB obligations accumulate silently over decades, emerging as fiscal crises only when the gap between promises and funding becomes politically impossible to ignore. Employee compensation (salary + benefits + pensions) typically accounts for 60–75% of general fund spending, and the pension component is the fastest-growing share.

### How Public Pensions Work

Most public employees participate in **defined-benefit (DB) pension plans** — retirement systems that promise a monthly benefit calculated by a formula, typically:

```
Annual Pension = Years of Service × Benefit Multiplier × Final Average Salary
```

Example: A firefighter who retires after 30 years with a final average salary of $80,000 and a 2.5% multiplier receives `30 × 0.025 × $80,000 = $60,000/year` for life. Many plans also include cost-of-living adjustments (COLAs) that increase the benefit annually.

The pension is funded by three sources:
1. **Employee contributions** — Typically 5–10% of salary, deducted from paychecks.
2. **Employer (government) contributions** — The municipality's annual required contribution (ARC), set by actuaries.
3. **Investment returns** — The pension fund invests accumulated contributions; returns are expected to fund the majority of future benefits.

### The Unfunded Liability Crisis

A pension plan is **unfunded** when its accumulated assets are less than the present value of all benefits promised to current and future retirees. The **funded ratio** = assets / liabilities.

| Funded Ratio | Interpretation |
|---|---|
| > 90% | Healthy; minor adjustments needed |
| 70–90% | Moderate concern; manageable with discipline |
| 50–70% | Serious; requires significant contribution increases |
| < 50% | Crisis; may require benefit cuts, tax increases, or restructuring |

**National scale:** State governments hold $1.29 trillion in unfunded pension liabilities; local governments hold an additional $187 billion (Reason Foundation, 2024). Forty-four public pension systems each carried more than $10 billion in debt at the end of fiscal year 2024.

### The Discount Rate Problem

The most consequential — and controversial — assumption in pension accounting is the **discount rate** used to calculate the present value of future benefit payments. Public pensions use the **expected rate of return on plan assets** as the discount rate, typically 6.5–7.5% (the average was 6.7% in 2022, down from 7.5–8.0% a decade earlier).

The problem: private-sector pensions and most economists argue that pension liabilities — which are essentially guaranteed promises — should be discounted at a **risk-free rate** closer to U.S. Treasury yields (2–4%). Using a higher discount rate makes liabilities appear smaller:

| Discount Rate | Estimated National Unfunded Liability |
|---|---|
| 6.7% (plan assumptions) | ~$1.5 trillion |
| 4.0% (market-based) | ~$3.5 trillion |
| 2.1% (risk-free / Treasury) | ~$5.1 trillion |

Stanford economists Novy-Marx and Rauh estimate that under market-based discounting, the net pension liability of 648 public pensions exceeds **$5 trillion** — more than three times the officially reported figure. The implication: state and local governments should be contributing closer to **40% of payroll** to keep plans solvent, versus the 15–25% most actually contribute.

CalPERS — the largest U.S. public pension system — reported a funding ratio of roughly 77% using its own discount rate assumptions. But at a market-value funding ratio, CalPERS was closer to **48% funded** (Stanford Institute for Economic Policy Research), with $166 billion in pension debt.

### Case Study: Illinois

Illinois faces the most severe pension crisis of any U.S. state, a multi-decade fiscal disaster driven by chronic contribution shortfalls:

- Illinois's five state pension systems carry approximately **$144–211 billion** in unfunded liabilities (the range depends on discount rate assumptions), with a funded ratio of roughly **51.6%** as of 2024.
- The crisis originated in the 1990s, when the state adopted a 50-year "ramp" funding plan that backloaded contributions — paying less than the actuarially required amount in early years, with steep increases later. This was fiscally irresponsible from the start; the state was essentially borrowing against its own pension obligations.
- Pension payments now consume roughly **25–28% of the state's general fund budget**, crowding out spending on education, infrastructure, and social services.
- The Illinois Constitution (Article XIII, Section 5) prohibits any reduction in pension benefits once earned — a "pension protection clause" that makes restructuring nearly impossible without a constitutional amendment.

**Chicago's compounding crisis:** Chicago's municipal pension funds are even worse off than the state's. The city's fire and police pension funds have funding ratios that have dropped as low as **18%** after a 2025 state law (the "Pension Sweetener") increased benefits for police and firefighters hired after 2011 without providing a dedicated funding source. The full cost was shifted onto the City of Chicago, which already faced a **$1.2 billion budget deficit** in FY 2026.

### Case Study: Detroit Pensions and Bankruptcy

Pensions played a central role in Detroit's 2013 bankruptcy — the largest municipal bankruptcy in U.S. history:

- Detroit's two pension funds (General Retirement System and Police and Fire Retirement System) had a combined **$3.5 billion** unfunded liability at the time of filing.
- The city had for years used pension obligation bonds and accounting gimmicks to defer contributions, making the problem progressively worse.
- Under the Plan of Adjustment, retirees took cuts: cost-of-living adjustments for police and fire retirees were cut by **55%**, COLAs for general retirees were eliminated entirely, and general retiree base benefits were cut by approximately **4.5%**. Bondholders fared worse, receiving roughly 44 cents on the dollar.
- A decade later, Detroit's pension obligations continue to strain its budget. The city received a 10-year reprieve from full pension contributions as part of the bankruptcy settlement, but that reprieve is ending, creating renewed budget pressure.

### Other Post-Employment Benefits (OPEB)

OPEB — primarily **retiree health insurance** — is an even larger and less visible liability than pensions. Most governments have historically funded retiree healthcare on a **pay-as-you-go (PAYGO)** basis: using current-year revenue to pay current-year retiree health costs, with no prefunding.

**Scale:** In 2022, net OPEB liabilities for the largest U.S. governments reached **$789 billion** — actually exceeding the $753 billion in unfunded pension liabilities reported by those same entities (Reason Foundation). Individual examples illustrate the magnitude:

| Entity | Unfunded OPEB Liability |
|---|---|
| New York City | $98.2 billion (FY 2024) |
| State of California | $96.7 billion |
| State of Michigan municipalities (aggregate) | $12.7 billion |
| Detroit (alone) | $4.9 billion |

OPEB is structurally harder to manage than pensions because healthcare cost inflation consistently outpaces general inflation, and retiree healthcare has no constitutional protection — meaning benefits can be (and increasingly are) reduced, but only through difficult political negotiations.

### Multi-Decade Fiscal Drains

The pension and OPEB crisis creates a distinctive fiscal pattern:

1. **Slow accumulation** — Benefits are promised incrementally over each employee's career. The liability grows invisibly for 20–30 years.
2. **Deferred recognition** — Actuarial smoothing and optimistic assumptions mask the true cost. Political incentives favor deferring contributions.
3. **Sudden visibility** — When markets decline (2001, 2008) or assumptions are updated, the unfunded gap jumps. GASB 67/68 (2014) required governments to report net pension liabilities on their balance sheets, making the problem suddenly visible to bond markets.
4. **Crowding out** — Once the crisis is acknowledged, required pension contributions escalate rapidly, consuming budget space that would otherwise fund current services. Cities must choose between cutting police, firefighters, and parks or raising taxes — both of which drive residents away, further eroding the tax base.
5. **Vicious cycle** — Population loss reduces the tax base, which increases per-capita pension costs, which requires further service cuts or tax increases, which accelerates population loss.

This pattern is visible across many Rust Belt and legacy cities: Detroit, Chicago, Hartford, Providence, and numerous smaller municipalities where retirees outnumber active employees and pension obligations exceed total general fund revenue.

---

## Revenue Volatility and Stabilization

Municipal revenues are subject to **cyclical volatility** that can create budget crises even in well-managed cities. Different revenue sources exhibit vastly different levels of sensitivity to economic conditions, and the interaction between revenue volatility, balanced-budget requirements, and reserve policies determines whether a city can absorb shocks or is forced into pro-cyclical austerity.

### Volatility by Revenue Source

Not all revenue streams respond equally to economic cycles. During the Great Recession (2007–2009), the pattern was stark:

| Revenue Source | Cyclical Sensitivity | Great Recession Impact |
|---|---|---|
| **Local income tax** | Very high | Declined **17.6%** in 2009 (nationally); 11.3% decline in the 2001 recession |
| **Sales tax** | High | Declined **5.6%** in 2009, another 2.3% in 2010 — the only declines since 1992 |
| **Property tax** | Low (lagged) | Continued rising through 2009, was flat in 2010, fell only ~1% in 2011 — a 2–3 year lag behind home prices |
| **User fees / charges** | Low-moderate | Relatively stable; demand for water, sewer, and waste is inelastic |
| **Intergovernmental aid** | Moderate-high | Federal stimulus (ARRA) temporarily increased aid, but state aid was cut as states faced their own crises |

**Key insight:** Property tax is the most **counter-cyclical** and stable major revenue source. Its lagged response to market conditions (because assessments are based on past values and reassessment cycles are infrequent) provides a natural buffer. Cities heavily dependent on sales or income tax face much larger revenue swings.

The expenditure side is also volatile: during the Great Recession, general expenditures rose **4.7%** from FY07 to FY09 (driven by rising pension contributions, healthcare costs, and demand for safety-net services) while general revenues were essentially flat — creating a scissors effect that forced painful cuts.

### Balanced-Budget Requirements

Unlike the federal government, **virtually all state and local governments are required to balance their budgets** annually. This means they cannot run deficits during recessions and must respond immediately to revenue shortfalls through:

- Spending cuts (service reductions, hiring freezes, furloughs)
- Tax or fee increases (politically difficult during downturns)
- Reserve drawdowns (if reserves exist)
- One-time revenue measures (asset sales, fund sweeps, accounting timing shifts)

This creates a **pro-cyclical fiscal policy**: cities cut spending and raise taxes exactly when the economy is weakest, amplifying the recession's impact on residents. The federal government can deficit-spend to stimulate; cities cannot.

### Rainy Day Funds and Reserve Policies

The primary tool for managing revenue volatility is **reserve accumulation** — building cash balances during good years to draw down during bad years.

**GFOA Recommendations:** The Government Finance Officers Association recommends that general-purpose governments maintain unrestricted fund balance of no less than **two months of regular general fund operating revenue** — approximately **16.7%** of annual revenue. However, GFOA also notes that this is a *floor*, not a target. Governments vulnerable to natural disasters, dependent on volatile revenue sources, or subject to state aid cuts should maintain higher reserves.

**Risk-based approach:** GFOA has recommended shifting from a "savings account" model (a flat percentage target) to an **insurance model** that considers:

- Revenue predictability and expenditure volatility
- Exposure to one-time disasters or emergencies
- Potential drain from other funds (enterprise funds, pension funds)
- Impact on bond ratings and borrowing costs
- Concentration risk in the revenue portfolio

**Practical reserve levels in U.S. cities:**

| Reserve Level | Interpretation |
|---|---|
| < 8% of revenue | Dangerously low; credit rating at risk |
| 8–16% | Below GFOA minimum; adequate only in stable environments |
| 16–25% | GFOA standard range; sufficient for moderate shocks |
| 25–35% | Conservative; appropriate for volatile revenue bases or disaster-prone areas |
| > 35% | Excess reserves; may indicate over-taxation or underinvestment |

### Stabilization Strategies

Beyond reserves, cities use several strategies to smooth revenue over cycles:

- **Revenue diversification** — Cities with balanced portfolios (property tax + sales tax + income tax + fees) are more resilient than those dependent on a single source. However, few cities have the legal authority to levy all four.
- **Conservative budgeting** — Projecting revenue below trend and budgeting to the conservative estimate. Surpluses flow to reserves; shortfalls are absorbed without cuts.
- **Multi-year financial planning** — Three- to five-year revenue and expenditure projections that identify structural imbalances before they become crises. GFOA recommends this as a best practice, but many small cities budget only one year at a time.
- **Countercyclical federal aid** — Programs like the American Rescue Plan Act (2021) provided direct fiscal relief to cities during the COVID-19 pandemic, but such aid is irregular and politically contingent.
- **Expenditure smoothing** — Negotiating multi-year labor contracts with predictable cost trajectories, avoiding lumpy capital spending commitments, and maintaining flexible staffing models (part-time, seasonal) that can be scaled down during downturns.

### Revenue Concentration Risk

Some cities are dangerously dependent on a single revenue source or a single employer/industry:

- **Sales-tax-dependent cities** — Many Texas cities receive no property tax revenue (or very limited amounts) and depend heavily on sales tax, making them extremely sensitive to retail cycles and e-commerce disruption.
- **Single-industry towns** — Cities dependent on one employer or industry (mining, military bases, a single factory) face catastrophic risk if that employer leaves or that industry declines.
- **Tourism-dependent cities** — Cities like Las Vegas, Orlando, and Branson depend on hotel/motel taxes and sales taxes driven by visitor spending, which collapsed during COVID-19.

---

## Fiscal Multipliers

Not all land uses are equal. A core insight from municipal finance: **commercial and industrial land generates surplus revenue, while residential land typically costs more in services than it generates in taxes.**

### Cost of Community Services (COCS) Studies

The American Farmland Trust has compiled data from over 200 COCS studies across the U.S. The studies calculate the ratio of expenditures to revenues for each land use category. A ratio above 1.0 means the land use is a net fiscal drain; below 1.0 means it generates surplus.

| Land Use | Median Revenue:Expenditure Ratio | Range |
|---|---|---|
| Residential | $1.00 : $1.15 | $1.01 – $2.11 |
| Commercial / Industrial | $1.00 : $0.30 | $0.05 – $0.69 |
| Farm / Open Space | $1.00 : $0.37 | $0.02 – $0.96 |

**Interpretation:** For every $1.00 in tax revenue from residential property, the community spends a median of $1.15 on services (schools, roads, police, fire). Commercial and industrial land, by contrast, generates $1.00 in revenue while requiring only $0.30 in services.

### Why Residential Costs More

- **Schools** — The largest single expenditure for most local governments. Residential development generates school-age children; commercial/industrial does not.
- **Service intensity** — Residences require police patrol, fire protection, road maintenance, parks, and libraries. Commercial properties require far fewer service calls per dollar of assessed value.
- **Assessment dynamics** — Commercial properties are often assessed at higher values per acre than residential, especially in suburban contexts.

### Fiscal Impact by Subtype

Research from the Lincoln Institute of Land Policy finds more granular patterns:

| Land Use Subtype | Fiscal Impact |
|---|---|
| Single-family (low density) | Strongest deficit |
| Single-family (small lot / medium density) | Moderate deficit |
| Multifamily / condo | Near break-even or slight surplus |
| Office / professional | Strong surplus |
| Retail | Moderate surplus |
| Industrial | Moderate surplus |
| Farmland / open space | Strong surplus |

The key takeaway: density matters. Higher-density residential approaches fiscal neutrality because infrastructure costs are shared across more units per acre.

---

## The Growth Ponzi Scheme

Strong Towns, a nonprofit focused on municipal fiscal sustainability, has popularized the "Growth Ponzi Scheme" framework to explain why suburban sprawl is structurally insolvent.

### The Mechanism

1. A city extends roads, water, sewer, and power to a new subdivision on its periphery.
2. The city collects development fees and new property tax revenue — an immediate cash infusion.
3. For the first 20–25 years, the new infrastructure is in good condition and requires minimal maintenance.
4. After one lifecycle (~25 years), the infrastructure needs major repair or replacement. The cost of this replacement often exceeds the cumulative tax revenue the development has generated.
5. To fund the repairs, the city must grow *again* — extending infrastructure to yet another new area to capture the upfront cash from new development.
6. This creates a structural dependency on perpetual growth: the revenue from each generation of development subsidizes the previous generation's deferred maintenance.

### The Numbers

Strong Towns estimates that over a full infrastructure lifecycle, many suburban developments generate only **$0.10–$0.20 of revenue per $1.00 of long-term infrastructure liability**. The American Society of Civil Engineers estimates the national infrastructure maintenance backlog at roughly $5 trillion.

The Houston case study is illustrative: a city that has grown rapidly through sprawl, adding enormous quantities of infrastructure — roads, pipes, drainage — that its tax base cannot maintain over the long term. The math only works as long as growth continues, which is the defining feature of a Ponzi scheme.

### Why It Matters for City-Builders

This pattern creates a compelling gameplay dynamic: building sprawling suburbs feels rewarding in the short term (population growth, new revenue) but creates a fiscal time bomb. A realistic finance model should make the long-term cost of sprawl visible to the player.

---

## Revenue Per Acre

**Revenue per acre** (or **value per acre**) is the productivity metric that ties fiscal health to land use patterns. Rather than looking at total revenue, it measures how efficiently each acre of land contributes to the city's finances.

### Comparative Data

Data from Strong Towns analyses and municipal budget studies across multiple U.S. cities:

| Development Type | Property Tax Revenue / Acre / Year | Infrastructure Cost / Acre / Year |
|---|---|---|
| Downtown mixed-use (6+ stories) | $100,000 – $800,000 | $5,000 – $15,000 |
| Traditional neighborhood (small lots, 2–3 stories) | $20,000 – $90,000 | $3,000 – $8,000 |
| Suburban single-family (1/4 acre lots) | $6,000 – $15,000 | $3,000 – $8,000 |
| Low-density suburban (1/2+ acre lots) | $2,000 – $6,500 | $4,000 – $10,000 |
| Big-box retail (with parking) | $5,000 – $12,000 | $3,000 – $7,000 |
| Strip mall | $8,000 – $20,000 | $3,000 – $7,000 |

### Case Studies

- **Lafayette, Louisiana** — Strong Towns analysis found that the city's traditional downtown generated roughly 70x more tax revenue per acre than a comparable area of suburban development on the periphery.
- **Asheville, North Carolina** — Downtown parcels generate approximately $360,000/acre in assessed value vs. $7,995/acre for the suburban Asheville Mall (county taxes).
- **Maplewood vs. St. Paul, Minnesota** — Average property value per acre: $435,000 (suburban Maplewood) vs. $1,630,000 (historic St. Paul). Dense, walkable neighborhoods are 3–4x more productive per acre.
- **Gainesville, Florida** — Downtown generates $94,000/acre in sales tax revenue vs. $48,000/acre in outlying commercial areas.

### The Pattern

The data consistently shows:

1. **Dense, mixed-use development** generates the highest revenue per acre by a wide margin.
2. **Traditional neighborhoods** (pre-WWII grid layouts, small lots, mixed housing types) are highly productive.
3. **Suburban sprawl** generates less revenue per acre than its infrastructure costs — it is subsidized by denser areas.
4. **Big-box retail** is surprisingly unproductive per acre because of the vast parking lots.

---

## Municipal Bankruptcy

Municipal bankruptcy under **Chapter 9** of the U.S. Bankruptcy Code is rare but devastating. Only municipalities — cities, counties, special districts, and public utilities — can file, and only with state authorization.

### Requirements for Filing

1. The municipality must be **specifically authorized** by state law to file. Only about half of states grant this authority.
2. The municipality must be **insolvent** — unable to pay its debts as they come due.
3. The municipality must **desire to effect a plan** to adjust its debts.
4. The municipality must have **negotiated in good faith** with creditors or demonstrated that negotiation is impracticable.

### Notable Cases

| City | Year Filed | Debt | Primary Causes |
|---|---|---|---|
| Detroit, MI | 2013 | $18–20B | Population loss (1.8M to 700K), eroded tax base, pension obligations, failed redevelopment bets |
| Jefferson County, AL | 2011 | $4B | Sewer system debt, derivatives losses, corruption |
| Stockton, CA | 2012 | $900M | Housing crash, pension costs, overbuilding during boom |
| San Bernardino, CA | 2012 | $492M | Structural deficits, declining revenue, pension costs |
| Vallejo, CA | 2008 | $170M | Public safety compensation consuming 75% of general fund |

### Fiscal Stress Indicators

Warning signs that precede bankruptcy:

- **Structural operating deficits** — Recurring expenses exceed recurring revenue, not just in one bad year.
- **Reserve depletion** — General fund balance drops below 2 months of operating expenses (industry standard: maintain 2–3 months or 16–25% of revenue).
- **Debt service ratio > 20%** — Debt payments consume too much of the operating budget.
- **Shrinking tax base** — Declining population, property values, or employment.
- **Unfunded pension liabilities** — The pension funding ratio drops below 60–70%.
- **Deferred maintenance backlog** — Infrastructure repairs are repeatedly postponed.
- **Dependence on one-time revenues** — Asset sales, reserve drawdowns, or borrowing used to fund operating expenses.

### Consequences

Bankruptcy allows a municipality to restructure its debts under court protection. Creditors, pensioners, and bondholders may receive partial payment. The city's credit rating is devastated, making future borrowing extremely expensive. Services are often cut drastically during and after restructuring.

---

## Budget Cycles

### Annual Operating Budget

Most municipalities operate on a fiscal year cycle (often July 1 – June 30, though some use calendar year). The cycle:

1. **Department requests** (3–6 months before fiscal year start) — Each department submits spending requests.
2. **Executive budget proposal** — The city manager or mayor assembles a balanced budget.
3. **Legislative review and adoption** — The city council reviews, amends, and adopts the budget.
4. **Execution** — Departments spend within their approved appropriations.
5. **Audit** — An independent audit verifies financial statements.

### Capital Improvement Program (CIP)

The CIP is a **multi-year plan** (typically 5–10 years) for major infrastructure investments — roads, bridges, water systems, public buildings. It is separate from the annual operating budget. CIP projects are funded through bonds, grants, impact fees, and transfers from the general fund.

The CIP creates a pipeline: projects are planned years in advance, designed, funded, and then constructed. This forward planning is critical because infrastructure has long lead times and long useful lives (20–50+ years).

### Reserve Funds

Prudent fiscal management requires maintaining reserves:

- **Operating reserves** — Typically 16–25% of annual general fund revenue. Provides a cushion for revenue shortfalls or unexpected expenses.
- **Capital reserves** — Accumulated funds for future infrastructure replacement. The annual contribution should reflect the depreciation rate of existing assets.
- **Rainy day funds** — Separate reserves for economic downturns or emergencies.

The Government Finance Officers Association (GFOA) recommends a minimum unrestricted fund balance of **two months of regular general fund operating revenue**, or roughly 16.7% of annual revenue.

---

## Application to Bitborough

### Current Budget System

Bitborough currently implements a simplified monthly budget model:

- **Revenue**: `Tax Income = Population x (Avg Land Value / 20) x Tax Rate`
- **Expenses**: Per-tile maintenance costs (roads $1, paved roads $2, power lines $0.50) + building maintenance (power plants, service buildings) + loan repayment
- **Loans**: Single active loan at a time. 8% annual interest, 120-month term, amortized monthly. Max loan = 48x monthly tax income. Minimum $10,000.
- **Emergency loans**: Auto-triggered when funds go negative.
- **Bankruptcy**: Event emitted when insolvent with an active loan and continued negative balance.
- **Tax rate**: 0–20%, default 7%. Each 1% deviation from 7% shifts demand by +/-5%.

This model captures the basics but misses several dynamics that would add strategic depth.

### Suggested Improvements

#### 1. Per-Tile Tax Productivity

Replace the averaged tax calculation with per-tile revenue calculation. Each developed tile already has a `landValue` in the engine. Computing tax revenue per tile enables the revenue-per-acre gameplay loop.

```
// Current (averaged)
taxIncome = population * (avgLandValue / 20) * taxRate

// Proposed (per-tile)
taxIncome = sum(
  for each developed tile:
    tileLandValue * buildingDensityMultiplier * taxRate * BASE_RATE
)
```

Where `buildingDensityMultiplier` reflects the fiscal reality that denser buildings are more tax-productive per tile:

| Density Level | Multiplier | Rationale |
|---|---|---|
| Low (single-family) | 1.0x | Baseline |
| Medium (townhouse/apartment) | 2.5x | More units per tile, higher assessed value |
| High (mid-rise/high-rise) | 6.0x | Many units per tile, premium land values |

This would make dense development visibly more valuable in the budget panel and create incentive to build compact cities.

#### 2. Zone-Type Fiscal Multiplier

Apply the COCS study ratios as a service cost multiplier per zone type:

```
servicesCostPerTile(zone, density) =
  BASE_SERVICE_COST * ZONE_MULTIPLIER[zone] * DENSITY_MODIFIER[density]
```

| Zone | Service Cost Multiplier | Notes |
|---|---|---|
| Residential (low) | 1.15 | Schools, police, fire — net fiscal drain |
| Residential (medium) | 0.95 | Shared infrastructure, approaching break-even |
| Residential (high) | 0.80 | Efficient service delivery at density |
| Commercial | 0.35 | Low service demand, high tax revenue |
| Industrial | 0.40 | Low service demand, moderate tax revenue |

This rewards balanced zoning: a city of only residential zones will run deficits. Commercial and industrial zones subsidize residential services — matching real-world fiscal dynamics.

#### 3. Municipal Bonds

Extend the loan system to support bond issuance with credit rating mechanics:

```typescript
interface Bond {
  type: 'general_obligation' | 'revenue'
  principal: number
  interestRate: number       // determined by credit rating
  termMonths: number         // 120–360 (10–30 years)
  monthlyPayment: number
  monthsLeft: number
  purpose?: string           // "infrastructure" | "capital_improvement"
}

// Credit rating affects interest rate
function bondInterestRate(rating: CreditRating): number {
  //  AAA: 3.0%,  AA: 3.5%,  A: 4.5%,  BBB: 6.0%,  BB: 8.0%
  return RATE_TABLE[rating]
}

// Credit rating determined by fiscal health indicators
function calculateCreditRating(state: GameState): CreditRating {
  const reserveRatio = state.funds / (state.budget.projectedExpenses * 12)
  const debtServiceRatio = totalDebtService / state.budget.taxIncome
  const debtPerCapita = totalDebt / state.population

  if (reserveRatio > 0.25 && debtServiceRatio < 0.10 && debtPerCapita < 2000)
    return 'AAA'
  if (reserveRatio > 0.16 && debtServiceRatio < 0.15 && debtPerCapita < 4000)
    return 'AA'
  if (reserveRatio > 0.08 && debtServiceRatio < 0.20)
    return 'A'
  if (reserveRatio > 0.0)
    return 'BBB'
  return 'BB' // junk
}
```

Allow multiple active bonds (unlike the current single-loan limit). GO bonds are backed by general tax revenue; revenue bonds would be backed by enterprise fund income (water/power). This adds strategic depth: borrow cheaply while your city is healthy, or pay punishing rates when you're in fiscal distress.

#### 4. TIF Districts

TIF districts would be a powerful zone-level mechanic:

```typescript
interface TIFDistrict {
  tiles: number[]            // indices of tiles in the district
  baseValues: number[]       // frozen land values at creation time
  createdMonth: number
  expirationMonth: number    // typically 240–300 months (20–25 years)
  totalCaptured: number      // cumulative increment captured
  bondIssued: number         // optional upfront borrowing against future increment
}

// Monthly TIF calculation
function calculateTIFIncrement(district: TIFDistrict, currentLandValues: Uint8Array): number {
  let increment = 0
  for (let i = 0; i < district.tiles.length; i++) {
    const current = currentLandValues[district.tiles[i]!]!
    const base = district.baseValues[i]!
    if (current > base) {
      increment += (current - base) * taxRate * BASE_RATE
    }
  }
  return increment
}
```

Gameplay loop: designate a TIF district on underdeveloped land, invest in infrastructure there (roads, transit, utilities), watch land values rise, capture the increment. The player bets that their investment will increase land values enough to pay for itself. If the bet fails (land values don't rise), the city absorbs the infrastructure cost with no offsetting revenue.

#### 5. Impact Fees

Add a one-time construction fee when zones are first developed:

```typescript
const IMPACT_FEE_PER_BUILDING: Record<string, number> = {
  'residential.low':    500,
  'residential.medium': 800,
  'residential.high':   1200,
  'commercial.low':     600,
  'commercial.medium':  1000,
  'commercial.high':    1500,
  'industrial.low':     400,
  'industrial.medium':  700,
  'industrial.high':    1000,
}

// Triggered when a zone tile develops (building spawns)
function onBuildingSpawned(defId: string, state: GameState): void {
  const fee = IMPACT_FEE_PER_BUILDING[defId] ?? 0
  state.funds += fee
}
```

This creates an upfront cash flow from development that partially offsets infrastructure investment — matching the real-world pattern where growth feels profitable in the short term. Combined with the growth Ponzi scheme dynamics (maintenance costs rising over time), it creates a realistic fiscal arc.

#### 6. Fiscal Stress and Bankruptcy Rework

The current bankruptcy trigger is binary (insolvent + active loan = bankruptcy event). A graduated stress model would be more realistic and give players time to react:

```
Fiscal Health Score = weighted average of:
  - Reserve ratio (funds / annual expenses)      weight: 0.3
  - Debt service ratio                           weight: 0.25
  - Revenue trend (3-year moving average)        weight: 0.2
  - Infrastructure condition (deferred maint.)   weight: 0.15
  - Pension/obligation ratio                     weight: 0.1

Thresholds:
  > 0.70  — Healthy (credit rating AAA/AA)
  0.50–0.70 — Watch (credit rating A)
  0.30–0.50 — Fiscal stress (credit rating BBB, warnings)
  0.10–0.30 — Fiscal emergency (credit rating BB, state intervention)
  < 0.10  — Bankruptcy trigger
```

This gives players a visible degradation path rather than a sudden game-over. It also ties into the credit rating system: as fiscal health declines, borrowing becomes more expensive, creating a downward spiral that mirrors real municipal distress.

#### 7. Pension and Legacy Cost System

Model the multi-decade pension obligation dynamic as a growing background liability:

```typescript
interface PensionSystem {
  activeEmployees: number        // tied to service building count
  retirees: number               // employees who "aged out" of service
  fundedRatio: number            // 0.0–1.0; starts at 1.0 for new city
  annualContribution: number     // city's required monthly payment
  unfundedLiability: number      // grows when contributions are skipped
  discountRate: number           // 0.065–0.075; lower = larger liability
}

// Each month: retirees grow, required contribution increases
function updatePension(pension: PensionSystem, budget: Budget): void {
  const requiredContribution = pension.retirees * BENEFIT_PER_RETIREE
  const actualContribution = Math.min(requiredContribution, budget.available)

  // Skipping contributions grows the unfunded liability
  const shortfall = requiredContribution - actualContribution
  pension.unfundedLiability += shortfall
  pension.fundedRatio = pension.assets / (pension.assets + pension.unfundedLiability)
}
```

Gameplay loop: early-game cities have few retirees and low pension costs. As the city matures, retirees accumulate and pension obligations grow. The player can choose to fully fund pensions (responsible but expensive) or underfund them (freeing cash for growth but building a time bomb). If the funded ratio drops below 50%, credit rating takes a hit; below 30%, fiscal emergency warnings trigger. This mirrors the Illinois/Detroit pattern where decades of deferred contributions create crises that consume the entire budget.

#### 8. Revenue Volatility and Economic Cycles

Introduce periodic economic shocks that affect revenue differently by source:

```typescript
interface EconomicCycle {
  phase: 'expansion' | 'peak' | 'recession' | 'recovery'
  monthsInPhase: number
  revenueModifiers: {
    propertyTax: number      // 0.97–1.03 (low volatility, lagged)
    salesTax: number         // 0.80–1.20 (high volatility)
    fees: number             // 0.90–1.05 (moderate stability)
  }
}

// Reserve fund mechanic
interface ReserveFund {
  balance: number
  targetRatio: number          // GFOA recommends 0.167 (2 months)
  autoContributeRate: number   // % of surplus to save during good years
}
```

This creates a risk management layer: cities with diverse revenue and healthy reserves weather recessions; cities with concentrated revenue and no reserves are forced into service cuts or emergency borrowing at punishing rates.

#### 9. Corporate Subsidy Bidding

When a major employer considers locating in the region, the player can choose to offer tax abatements:

```
Corporate Relocation Event:
  - MegaCorp is considering your city for a new HQ (500 jobs)
  - Competing city has offered $2M in incentives

  Options:
    A. Match the offer ($2M abatement, 10-year tax freeze)
       → Jobs arrive, but 10 years of reduced tax revenue from that parcel
    B. Offer infrastructure investment ($1M road/utility upgrade)
       → 50% chance jobs arrive; infrastructure benefits city regardless
    C. No incentive
       → 20% chance jobs arrive anyway (they prefer your talent pool)
    D. Counter-offer ($3M)
       → 90% chance jobs arrive, but net fiscal loss for 15+ years
```

This teaches the real lesson from Amazon HQ2 and Foxconn: the incentive package is rarely the deciding factor, and overpaying is common.

#### 10. Fee Revenue and Equity Tradeoffs

Add fee-based revenue as a distinct lever alongside the tax rate:

```typescript
interface FeePolicy {
  utilityRateMultiplier: number   // 0.5–2.0x base utility cost
  permitFeeLevel: 'low' | 'standard' | 'high'
  recreationFees: boolean         // free parks vs. paid facilities

  // Effects
  revenueBoost: number            // higher fees = more revenue
  demandPenalty: number           // higher fees = lower desirability
  equityScore: number             // higher fees = more regressive
}
```

High fees generate stable revenue but reduce residential desirability (especially for low-income citizens) and lower the city's equity score. This forces a tradeoff between fiscal stability and social equity — a real tension that every city manager faces.

---

## Cross-References

- [economy-and-employment.md](./economy-and-employment.md) — Job markets, commercial/industrial demand drivers, employment density by zone type
- [utilities-and-infrastructure.md](./utilities-and-infrastructure.md) — Enterprise fund mechanics, infrastructure lifecycle costs, maintenance scheduling
- [public-services.md](./public-services.md) — Police/fire service costs, coverage models, service demand by land use
- [urban-density-gradients.md](./urban-density-gradients.md) — Density-driven land value patterns that underlie tax base productivity
- [transit-oriented-development.md](./transit-oriented-development.md) — Transit as density catalyst, which drives property tax revenue concentration

---

## Sources

### Government and Institutional

- [Millage Rate — Corporate Finance Institute](https://corporatefinanceinstitute.com/resources/commercial-real-estate/millage-rate/)
- [How Local Governments Raise Their Tax Dollars — Pew Charitable Trusts (2021)](https://www.pew.org/en/research-and-analysis/data-visualizations/2021/how-local-governments-raise-their-tax-dollars)
- [How Local Governments Raise Revenue — ITEP (2024)](https://itep.org/how-local-governments-raise-revenue-2024/)
- [How Local Governments Raise Revenue — and What it Means for Tax Equity — ITEP](https://itep.org/how-local-governments-raise-revenue-effects-on-tax-equity/)
- [State and Local Expenditures — Urban Institute](https://www.urban.org/policy-centers/cross-center-initiatives/state-and-local-finance-initiative/state-and-local-backgrounders/state-and-local-expenditures)
- [Municipal Bonds: Understanding Credit Risk — SEC](https://www.sec.gov/files/municipalbondsbulletin.pdf)
- [Tax Increment Financing — FHWA](https://www.fhwa.dot.gov/ipd/value_capture/defined/tax_increment_financing.aspx)
- [Development Impact Fees — FHWA](https://www.fhwa.dot.gov/ipd/value_capture/defined/development_impact_fees.aspx)
- [Impact Fees — GFOA](https://www.gfoa.org/materials/impact-fees)
- [Impact Fees and Housing Affordability — HUD](https://www.huduser.gov/periodicals/cityscpe/vol8num1/ch4.pdf)
- [Chapter 9 Municipal Bankruptcy — LII / Cornell](https://www.law.cornell.edu/wex/chapter_9_bankruptcy)
- [Detroit's Bankruptcy — Federal Reserve Bank of Chicago](https://www.chicagofed.org/publications/chicago-fed-letter/2013/november-316)
- [Detroit bankruptcy — Wikipedia](https://en.wikipedia.org/wiki/Detroit_bankruptcy)
- [Fund Balance Guidelines for the General Fund — GFOA](https://www.gfoa.org/materials/fund-balance-guidelines-for-the-general-fund)
- [Financial Policy Challenge: Reserve Policies — GFOA](https://www.gfoa.org/fpc-reserves)
- [Risk Analysis — GFOA](https://www.gfoa.org/risk-analysis)
- [Local Government Revenue Sources (Cities) — GFOA](https://www.gfoa.org/revenue-dashboard-cities)
- [How Do State and Local Revenues from Charges Work? — Tax Policy Center](https://taxpolicycenter.org/briefing-book/how-do-state-and-local-revenues-charges-work)
- [State and Local Government Retiree Health Benefits — GAO (GAO-10-61)](https://www.gao.gov/products/gao-10-61)
- [Health Care Costs: Funding Post-Employment Benefits — NYC Comptroller](https://comptroller.nyc.gov/reports/health-care-costs-funding-post-employment-benefits/)

### Strong Towns

- [America's Growth Ponzi Scheme](https://www.strongtowns.org/journal/2020-5-14-americas-growth-ponzi-scheme-md2020)
- [The Growth Ponzi Scheme (2016)](https://www.strongtowns.org/journal/2016/6/14/greatest-hits-the-growth-ponzi-scheme)
- [What's In Your City's Wallet? — Revenue Per Acre](https://archive.strongtowns.org/journal/2019/3/25/whats-in-your-citys-wallet)
- [Value Per Acre Analysis — Strong Towns Action Lab](https://actionlab.strongtowns.org/hc/en-us/articles/4402942175252-Create-Your-Own-Value-Per-Acre-Analysis)
- [How-To Guide for Making Sense of Your City's Budget](https://archive.strongtowns.org/journal/2020/7/23/a-how-to-guide-for-making-sense-of-your-citys-budget)
- [Cul-de-Sac Fiscal Analysis](https://www.strongtowns.org/journal/2020-8-10-i-did-the-math-on-my-towns-cul-de-sacs)
- [Wisconsin Foxconn Deal Cost Taxpayers Millions](https://www.strongtowns.org/journal/2023-7-20-wisconsin-foxconn-deal-cost-taxpayers-millionsand-it-will-continue-to-cost-more-millions)

### Academic and Research

- [Cost of Community Services Studies — American Farmland Trust](https://farmlandinfo.org/publications/cost-of-community-services-studies/)
- [Meta-Analysis of COCS Studies — Kotchen (Yale)](https://resources.environment.yale.edu/kotchen/pubs/COCS.pdf)
- [Fiscal Impacts of Alternative Land Uses — Ihlanfeldt](https://ihlanfeldt.com/wp-content/uploads/2018/09/The-Fiscal-Impacts-of-Alternative-Land-Uses-An-Empirical-Investigation-of-Cost-of-Community-Services-Studies-published-Public-Finance-Review.pdf)
- [Fiscal Impact Analysis — Lincoln Institute of Land Policy](https://www.lincolninst.edu/publications/working-papers/fiscal-impact-analysis/)
- [Municipal Budgeting Basics — Brookings](https://www.brookings.edu/wp-content/uploads/2016/06/20050823_BudgetingBasics.pdf)
- [Who Pays the Property Tax? — Lincoln Institute of Land Policy](https://www.lincolninst.edu/publications/articles/who-pays-property-tax)
- [Your House Is Worth More Than They Think: The Strange Case of Property Tax Regressivity — Harvard Journal on Legislation (2025)](https://journals.law.harvard.edu/jol/2025/02/22/your-house-is-worth-more-than-they-think-the-strange-case-of-property-tax-regressivity/)
- [Understanding Regressivity — University of Chicago Property Tax Fairness Project](https://propertytaxproject.uchicago.edu/into-to-regressivity/)
- [Why Are Residential Property Tax Rates Regressive? — Philadelphia Fed / Amornsiripanitch](https://www.philadelphiafed.org/consumer-finance/mortgage-markets/why-are-residential-property-tax-rates-regressive)
- [Understanding Detroit's $600 Million Over-Assessment — Citizens Research Council of Michigan](https://crcmich.org/understanding-how-detroits-property-tax-assessment-process-contributed-to-the-600-million-over-assessment)
- [Local Government Finances During and After the Great Recession — Lincoln Institute / Langley](https://www.lincolninst.edu/app/uploads/legacy-files/pubfiles/2443_1789_Langley%20WP14AL1.pdf)
- [State and Local Budgets and the Great Recession — Brookings](https://www.brookings.edu/articles/state-and-local-budgets-and-the-great-recession/)
- [City Budgets in an Era of Increased Uncertainty — Brookings](https://www.brookings.edu/articles/city-budgets-in-an-era-of-increased-uncertainty/)
- [Saving for a Rainy Day: Estimating Appropriate Size — Boston Fed Working Paper 14-12](https://www.bostonfed.org/-/media/Documents/Workingpapers/PDF/wp1412.pdf)
- [Smoothing State Tax Revenues over the Business Cycle — Boston Fed Working Paper 14-11](https://www.bostonfed.org/-/media/Documents/Workingpapers/PDF/wp1411.pdf)

### Pensions and OPEB

- [Public Pension Plans with the Most Debt — Reason Foundation](https://reason.org/data-visualization/pension-plans-debt/)
- [OPEB Debt Surpasses State and Local Pension Debt — Reason Foundation](https://reason.org/commentary/opeb-debt-surpasses-state-local-pension-debt/)
- [What a $1.48 Trillion Pension Gap Means for Cities and States — Smart Cities Dive](https://www.smartcitiesdive.com/news/reason-foundation-pension-report-cities-states/807872/)
- [Public Pensions Are Mixing Risky Investments with Unrealistic Predictions — Stanford (SIEPR)](https://siepr.stanford.edu/news/public-pensions-are-mixing-risky-investments-unrealistic-predictions)
- [Bad Accounting Can't Make the Public Pension Funding Shortfall Crisis Add Up — Manhattan Institute](https://manhattan.institute/article/bad-accounting-cant-make-public-pension-funding-shortfall-crisis-add-up)
- [Illinois Pension Crisis — Wikipedia](https://en.wikipedia.org/wiki/Illinois_pension_crisis)
- [4 Ways to Break Out of Illinois' Pension Trap — Illinois Policy Institute](https://www.illinoispolicy.org/reports/4-ways-to-break-out-of-illinois-pension-trap/)
- [Pension Challenges Facing Illinois / Chicago — Equable Institute](https://equable.org/illinois-chicago-pension-issues/)
- [The Burden of Unfunded Pension Liabilities — Truth in Accounting](https://www.truthinaccounting.org/news/detail/the-burden-of-unfunded-pension-liabilities-a-national-crisis-in-state-finances)
- [The Challenge of Meeting Detroit's Pension Promises — Pew (2018)](https://www.pew.org/-/media/assets/2018/03/challenge_of_meeting_detroits_pension_promises_report_v6.pdf)
- [Why Detroit's Bankruptcy Spared Retirees — Brookings](https://www.brookings.edu/articles/why-detroits-bankruptcy-spared-retirees/)
- [Detroit's Pension Benefit Restoration Should Remain Limited — Citizens Research Council](https://crcmich.org/detroits-pension-benefit-restoration-should-remain-limited)
- [On the Cliff's Edge: Detroit's Pension Payment Reprieve Ending — Crain's Detroit](https://www.crainsdetroit.com/crains-forum/detroits-break-pension-payments-ending-it-ready)
- [OPEBs: What Lies Beneath the Balance Sheet — Minneapolis Fed](https://www.minneapolisfed.org/article/2011/opebs-what-lies-beneath-the-balance-sheet)
- [How Do Retiree Health Benefit Promises Affect Municipal Financing? — Brookings (2023)](https://www.brookings.edu/wp-content/uploads/2023/05/Health_and_Muni_Finance.pdf)
- [Municipality Legacy Costs — MSU Extension](https://www.canr.msu.edu/resources/municipality_legacy_costs)
- [Latest Return Assumptions — NASRA](https://www.nasra.org/latestreturnassumptions)

### Corporate Tax Competition and Subsidies

- [Lessons from the Amazon HQ2 Tax Break Race — Tax Foundation](https://taxfoundation.org/blog/amazon-hq2-tax-break-race/)
- [Amazon HQ2 Tax Incentives: There Ought to Be a Law — Tax Policy Center](https://taxpolicycenter.org/taxvox/amazon-hq2-tax-incentives-there-ought-be-law-or-something)
- [New York, Amazon, and Company-Specific Tax Incentives — Tax Notes (2024)](https://www.taxnotes.com/featured-analysis/new-york-amazon-and-company-specific-tax-incentives-microcosm-national-problem/2024/09/20/7l69r)
- [With Amazon's HQ2 Competition, When You Win, You Lose — Mercatus Center](https://www.mercatus.org/economic-insights/expert-commentary/amazons-hq2-competition-when-you-win-you-lose)
- [Three Takeaways on Investment Incentives from Amazon HQ2 — World Bank](https://blogs.worldbank.org/en/psd/cents-and-sensibility-three-takeaways-investment-incentives-amazon-hq2)
- [Subsidy Tracker — Good Jobs First](https://subsidytracker.goodjobsfirst.org/)
- [Amazon Tracker — Good Jobs First](https://goodjobsfirst.org/amazon-tracker/)
- [New Subsidy Tracker Update Tracks $9B in Corporate Tax Breaks — Good Jobs First (2025)](https://goodjobsfirst.org/subsidytracker-2025-q2-live/)
- [Foxconn Deal Cost Wisconsin $20 Billion in Lost Economic Growth — Reason (2020)](https://reason.com/2020/01/09/study-says-foxconn-deal-cost-wisconsin-20-billion-in-lost-economic-growth/)
- [Wisconn Valley Science and Technology Park — Wikipedia](https://en.wikipedia.org/wiki/Wisconn_Valley_Science_and_Technology_Park)
- [Evaluating State and Local Business Tax Incentives — Princeton Economics](https://economics.princeton.edu/working-papers/evaluating-state-and-local-business-tax-incentives/)

### Fee-Based Revenue and Fines

- [Municipal Fines and Fees — Institute for Justice](https://ij.org/report/municipal-fines-and-fees/)
- [Following the Money on Fines and Fees — Urban Institute](https://www.urban.org/sites/default/files/publication/105331/following-the-money-on-fines-and-fees_final-pdf.pdf)
- [How Do Legal Fines and Fees Work? — ITEP](https://itep.org/how-do-legal-fines-and-fees-work/)
- [The Risks of Relying on User Fees — Governing](https://www.governing.com/columns/smart-mgmt/col-risks-of-raising-non-tax-revenue.html)
- [Rethinking Local Government Revenue — ICMA](https://icma.org/articles/pm-magazine/rethinking-local-government-revenue-why-time-now-and-what-can-be-done)

### Municipal Bond Market

- [General Obligation vs. Revenue Bonds — Alamo Capital](https://www.alamocapital.com/general-obligation-vs-revenue-bonds/)
- [Choosing Municipal Bonds: GO or Revenue? — Charles Schwab](https://www.schwab.com/learn/story/choosing-municipal-bonds-go-or-revenue)
- [Municipal Bonds — Investor.gov](https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products-0)
- [Municipal Bankruptcy and Credit Stress — Bond Buyer](https://www.bondbuyer.com/opinion/municipal-bankruptcy-stays-rare-but-credit-stress-keeps-chapter-9-in-focus)

### Sprawl and Fiscal Sustainability

- [Economics of Sprawl — The Invading Sea (2025)](https://www.theinvadingsea.com/2025/02/12/florida-suburban-low-density-development-sprawl-infrastructure-costs-tax-revenue-1000-friends/)
- [Best Bet for Tax Revenue: Mixed-Use Downtown — New Urban Network](https://newurbannetwork.com/best-bet-tax-revenue-mixed-use-downtown-development/)
- [Growth Ponzi Scheme Revisited: Houston — Strong Towns (2025)](https://archive.strongtowns.org/journal/2025/3/31/the-growth-ponzi-scheme-revisited-houston-as-a-case-study)
- [The Suburban Ponzi Infrastructure Experiment — CNU](https://www.cnu.org/publicsquare/2019/10/15/suburban-ponzi-infrastructure-experiment)

### Revenue Volatility and Fiscal Stability

- [State and Local Governments: Economic Shocks and Fiscal Challenges — Richmond Fed](https://www.richmondfed.org/region_communities/regional_data_analysis/regional_matters/2020/rm_10_20_2020_state_and_local)
- [Municipal Finances Persevere During Recessions — Baker Group](https://www.gobaker.com/municipal-finances-persevere-during-recessions/)
- [City Fiscal Conditions 2023 — National League of Cities](https://www.nlc.org/resource/city-fiscal-conditions-2023/)
- [Volatility in State Tax Revenues — Rockefeller Institute](https://rockinst.org/issue-area/volatility-state-tax-revenues-mounting-fiscal-uncertainties/)
- [Why and How States Should Strengthen Their Rainy Day Funds — CBPP](https://www.cbpp.org/research/why-and-how-states-should-strengthen-their-rainy-day-funds)
- [GFOA Recommends Governments Rethink Reserve Policies — Civic Federation](https://www.civicfed.org/node/4150)
- [How Much Fund Balance is Too Much? — Civic Federation](https://www.civicfed.org/civic-federation/blog/how-much-fund-balance-too-much-not-enough-just-right)
