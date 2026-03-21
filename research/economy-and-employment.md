# Economy and Employment

> How urban economies generate jobs, attract firms, and create wealth — models for simulating economic dynamics.

## Table of Contents

- [Economic Base Theory](#economic-base-theory)
- [Agglomeration Economies](#agglomeration-economies)
- [Industrial Location Theory](#industrial-location-theory)
- [Commercial Sector Dynamics](#commercial-sector-dynamics)
- [Commercial Real Estate Cycles](#commercial-real-estate-cycles)
- [Industrial Sector Dynamics](#industrial-sector-dynamics)
- [Labor Markets](#labor-markets)
- [Unemployment Dynamics and Duration](#unemployment-dynamics-and-duration)
- [Commute-Income Inequality](#commute-income-inequality)
- [Supply Chains and Input-Output Models](#supply-chains-and-input-output-models)
- [Creative Destruction](#creative-destruction)
- [Sector Transition Timelines](#sector-transition-timelines)
- [Informal Economy](#informal-economy)
- [Economic Development Tools](#economic-development-tools)
- [Multiplier Effects](#multiplier-effects)
- [Land Value and Economic Activity](#land-value-and-economic-activity)
- [Application to Bitborough](#application-to-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

---

## Economic Base Theory

Economic base analysis divides a regional economy into two sectors:

- **Basic (export) sector** — industries that sell goods/services outside the region, bringing external money in. Examples: manufacturing, tech headquarters, ports, universities drawing out-of-state students.
- **Non-basic (local-serving) sector** — industries that recirculate money within the region. Examples: grocery stores, barbershops, local restaurants, residential construction.

The central claim: growth in the basic sector drives growth in the non-basic sector through a multiplier. If a factory hires 100 workers, those workers spend money locally, creating demand for housing, retail, and services.

**The export base multiplier:**

```
Total Employment = Basic Employment × Multiplier
Multiplier = Total Employment / Basic Employment
```

Or equivalently:

```
M = 1 / (1 - (Non-Basic / Total))
```

**Empirical multiplier values by metro size:**

| Metro population | Typical multiplier | Notes |
|---|---|---|
| < 50,000 | 1.5 - 2.0 | Small towns, limited local services |
| 50,000 - 250,000 | 2.0 - 2.5 | Mid-size cities, moderate service sector |
| 250,000 - 1,000,000 | 2.5 - 3.0 | Large metros, diversified economy |
| > 1,000,000 | 3.0 - 5.0+ | Major metros, deep service layers |

Larger cities have higher multipliers because a greater share of spending is captured locally rather than leaking to imports. A New York City dollar recirculates more times than a dollar in a small town where residents drive to the next city for most purchases.

**Critiques:** The multiplier is not stable over time — it shifts as economies diversify. Classification of "basic" vs. "non-basic" is ambiguous for many industries (a hospital serves locals but also draws patients regionally). Short-run multipliers are smaller than long-run ones because labor supply is constrained in the near term.

---

## Agglomeration Economies

Agglomeration economies explain why firms cluster in cities rather than distributing evenly across space. Three mechanisms, first identified by Marshall (1890) and formalized by Duranton and Puga (2004):

### 1. Labor Market Pooling

A deep local labor market benefits both firms and workers. Firms can find specialized talent faster; workers face lower search costs and better wage bargaining. In larger markets, more productive job-worker matches occur at a faster rate. Empirical estimates attribute roughly 12% of the urban productivity premium to labor pooling effects.

### 2. Input Sharing

Firms in proximity share specialized suppliers, infrastructure, and business services. A cluster of software companies supports a local ecosystem of recruiters, IP lawyers, cloud consultants, and coworking spaces that no single firm could sustain alone. This mechanism shows the largest empirical effect — approximately 15% of agglomeration benefits.

### 3. Knowledge Spillovers

Dense environments accelerate the transfer of tacit knowledge through face-to-face contact, informal networks, and worker mobility between firms. This is why R&D labs and tech startups cluster despite being able to operate remotely. Empirical contribution: roughly 10% of agglomeration benefits.

**Productivity premium by city size:**

| City population | Productivity premium vs. rural | Primary mechanism |
|---|---|---|
| 100,000 | +3-5% | Input sharing |
| 500,000 | +8-12% | Labor pooling + input sharing |
| 1,000,000 | +12-18% | All three mechanisms |
| 5,000,000+ | +20-30% | Knowledge spillovers dominate |

**Localization vs. urbanization economies:**

- **Localization** — benefits from clustering with firms in the *same* industry (Silicon Valley for tech, Wall Street for finance). Strongest for manufacturing and knowledge-intensive sectors.
- **Urbanization** — benefits from being in a *large, diverse* city regardless of industry composition. Strongest for consumer-facing services and creative industries.

---

## Industrial Location Theory

### Weber's Least-Cost Model (1909)

Alfred Weber proposed that firms choose locations to minimize total cost across three factors:

1. **Transportation costs** — moving raw materials to the factory and finished goods to market. Weight-losing industries (steel, lumber) locate near raw materials. Weight-gaining or perishable-output industries (beverages, bakeries) locate near markets.
2. **Labor costs** — firms will deviate from the transport-optimal point if cheap labor savings exceed added transport costs. Weber introduced the concept of an "isodapane" — a contour line of equal transport cost — to determine when a labor-cost location is cheaper.
3. **Agglomeration savings** — clustering with other firms can reduce costs through shared infrastructure. Firms deviate toward clusters when agglomeration savings exceed the transport cost penalty.

**Weber's location decision:**

```
Optimal Location = argmin(TransportCost + LaborCost - AgglomerationSavings)
```

### Bid-Rent Theory Applied to Firms

Alonso (1964) extended von Thunen's agricultural model to urban land use. Different land users compete for central locations by bidding on rent:

- **Commercial/retail** — highest willingness-to-pay for central locations (customer access is paramount). Steepest bid-rent gradient: rent tolerance drops rapidly with distance from CBD.
- **Industrial** — moderate willingness-to-pay. Needs freight access and space more than customer proximity. Flatter gradient, often occupying middle-ring locations.
- **Residential** — lowest per-square-foot willingness-to-pay but needs the most space. Flattest gradient, dominates peripheral areas.

The intersection of these bid-rent curves determines the concentric pattern of land use observed in most cities:

```
CBD core:     Commercial (offices, retail)
Inner ring:   Mixed commercial/industrial, high-density residential
Middle ring:  Light industrial, medium-density residential
Outer ring:   Low-density residential, warehousing
Periphery:    Agriculture, undeveloped land
```

---

## Commercial Sector Dynamics

### "Retail Follows Rooftops"

The commercial sector is fundamentally demand-driven. Retail and service businesses locate where customers already live or work. The planning maxim "retail follows rooftops" captures this: residential development creates the customer base that commercial development then serves.

This creates a sequencing constraint: commercial zones cannot thrive without nearby residential population, but residential zones need nearby commercial amenity to be attractive.

### Central Place Theory (Christaller, 1933)

Christaller's model explains the spatial hierarchy of commercial centers through two variables:

- **Threshold** — the minimum market population needed to support a business. A convenience store needs ~1,000 people; a department store needs ~25,000; a specialized hospital needs ~100,000+.
- **Range** — the maximum distance consumers will travel for a good. Daily necessities: 1-2 km. Clothing: 5-15 km. Specialty goods: 50+ km.

**Retail hierarchy:**

| Center type | Threshold population | Typical range | Example businesses |
|---|---|---|---|
| Neighborhood | 1,000 - 5,000 | 0.5 - 2 km | Convenience store, laundromat, cafe |
| Community | 10,000 - 30,000 | 3 - 8 km | Grocery, pharmacy, bank branch |
| Regional | 50,000 - 150,000 | 10 - 30 km | Department store, cinema, medical clinic |
| Metro | 300,000+ | 30 - 100+ km | Specialty hospital, university, IKEA |

Settlements arrange themselves in a hexagonal lattice pattern where lower-order centers nest within the market areas of higher-order centers. Every regional center is also a community center and a neighborhood center, but not vice versa.

### Commercial Employment Density

Office-based commercial uses are far denser in employment than retail:

| Commercial type | Sq ft per employee | Jobs per acre (typical) |
|---|---|---|
| Office (high-rise) | 150 - 250 | 100 - 200+ |
| Office (suburban) | 250 - 400 | 30 - 80 |
| General retail | 400 - 600 | 15 - 40 |
| Restaurant | 200 - 350 | 40 - 100 |
| Big-box retail | 600 - 1,000 | 8 - 15 |

---

## Commercial Real Estate Cycles

### The 18-Year Property Cycle

Economist Homer Hoyt, analyzing 100 years of land values in Chicago (1933), identified an approximately 18-year real estate cycle that has recurred since at least 1800. The modern formulation divides the cycle into four phases:

| Phase | Duration (typical) | Characteristics | Vacancy trend |
|---|---|---|---|
| **Recovery** | 2-4 years | Low prices, minimal construction, cautious lending, distressed sales | Falling from peak |
| **Expansion** | 5-7 years | Rising demand, easier credit, new construction starts, prices climb | Low and stable (5-10%) |
| **Hypersupply** | 3-5 years | Speculative building, construction pipeline overflows, demand plateaus | Rising (10-15%) |
| **Recession** | 3-5 years | Prices crash, foreclosures rise, construction halts, distressed assets | Peak (15-25%+) |

The pattern consists of roughly 14 years of growth (often with a mid-cycle pause or correction) followed by about 4 years of decline and stagnation. The cycle's persistence is driven by fundamental construction lags — it takes 2-4 years to deliver a major office building from initial planning to occupancy, meaning supply decisions made during expansion arrive during hypersupply.

### Historical U.S. Office Vacancy Cycles

**The 1980s boom and bust (the canonical overbuilding cycle):**

In the 31 largest U.S. office markets, annual completions nearly tripled from 33.6 million sq ft (1975-1979) to 97.8 million sq ft (1980-1984), held roughly steady through 1989, then collapsed to 28.1 million sq ft annually (1990-1994). Tax incentives (the 1981 Economic Recovery Tax Act) fueled speculative development with little regard for actual demand.

- Dallas and Phoenix saw vacancy rates approach **30%** by the early 1990s.
- Net operating income for prime office properties declined by an average annual rate of 0.9% from 1982-1991.
- Office property values fell **26%** between 1987-1993.
- Overall office returns plummeted from +18.1% (1980) to **-6.1%** (1991), remaining negative or near-zero until 1994.
- The S&L crisis was directly linked to this overbuilding — over 1,000 savings institutions failed, costing taxpayers $130 billion.

**The dot-com bust (2001-2004):**

Tech-sector office demand evaporated after the 2000 crash. San Francisco's vacancy rate rose from under 5% (2000) to over 20% (2003). Sublease space flooded the market as failed startups dumped leases.

**The post-COVID structural shift (2020-present):**

Remote work created a structural — not merely cyclical — demand shock. U.S. office vacancy broke **20%** nationally for the first time in history (2024), surpassing even the 1980s-90s peaks. Key data points:

| City | Pre-COVID vacancy (2019) | Post-COVID vacancy (2024) | Change |
|---|---|---|---|
| San Francisco | ~5% | ~33% | +28 pts |
| Austin | ~10% | ~27% | +17 pts |
| Manhattan | ~8% | ~13% | +5 pts |
| National average | ~12% | ~20.5% | +8.5 pts |

New office construction starts collapsed from 15.4 million sq ft (2022) to just 2.4 million (2025). In 2019, 20 markets had at least 1 million sq ft starting construction; by 2025, only three did. Office inventory is on track to contract for the first time in a quarter-century as demolitions and conversions outpace new starts.

### The Construction Lag Problem

The core driver of commercial real estate cycles is the **construction lag** — the delay between when development is initiated and when space is delivered and occupied:

```
Decision lag:      6-12 months (market analysis, financing, permitting)
Construction lag:  18-36 months (depending on building type)
Absorption lag:    6-18 months (tenant fit-out, lease-up)
Total pipeline:    2.5-5.5 years from "go" decision to full occupancy
```

This means developers responding to today's strong demand will deliver space into a market that may have already turned. The lag is longest for the largest projects — precisely the ones most likely to be speculative.

**Speculative vs. build-to-suit:**

| Development type | Share of pipeline (healthy market) | Share of pipeline (overheated market) | Risk profile |
|---|---|---|---|
| Build-to-suit | 60-70% | 30-40% | Low — tenant committed |
| Pre-leased speculative | 15-25% | 20-30% | Moderate — partial tenant |
| Fully speculative | 10-15% | 30-40% | High — no tenant commitment |

When fully speculative development exceeds ~25% of the pipeline, the market is at elevated risk of oversupply. The 1980s bust saw speculative share well above 40%.

### Vacancy-Rent Dynamics

Office rents respond to vacancy with a characteristic asymmetry:

- **Vacancy below natural rate (~8-10%):** Rents rise rapidly as landlords gain pricing power.
- **Vacancy near natural rate:** Rents track inflation.
- **Vacancy above natural rate:** Rents decline slowly — landlords offer concessions (free rent, tenant improvement allowances) before cutting face rents.
- **Vacancy far above natural rate (>20%):** Face rents begin falling; class B and C buildings suffer most as tenants "flight to quality" into discounted class A space.

```
Effective rent = Face rent - Concessions - Free rent periods
```

During downturns, effective rents can be 20-40% below face rents even before nominal cuts appear in market statistics.

---

## Industrial Sector Dynamics

### Manufacturing Evolution

Cities follow a predictable industrial lifecycle:

1. **Early industrialization** — heavy manufacturing near raw materials and transport (rail, water). High employment density per firm. Pollution-intensive.
2. **Mature manufacturing** — standardized production, increasing automation, firms begin relocating to suburbs and exurbs for cheaper land and freight access.
3. **Deindustrialization** — manufacturing moves offshore or automates. Employment collapses in legacy industrial areas. Detroit's population fell from 1.6M (1960) to 639K (2020) as auto manufacturing restructured.
4. **Post-industrial** — remaining urban industry is light, clean, and knowledge-intensive: biotech labs, artisan manufacturing, data centers, logistics hubs.

### Light vs. Heavy Industry

| Characteristic | Light industry | Heavy industry |
|---|---|---|
| Footprint | 1-5 acres | 10-100+ acres |
| Jobs per acre | 10 - 25 | 2 - 8 |
| Pollution radius | Low (1-2 blocks) | High (0.5-2 miles) |
| Transport needs | Truck access | Rail + truck + sometimes port |
| Location preference | Near labor, highways | Near raw materials, rail yards |
| Examples | Electronics assembly, food processing | Steel, chemicals, auto assembly |

### Industrial Employment Density

Industrial uses employ far fewer workers per unit of land than commercial uses:

| Industrial type | Sq ft per employee | Jobs per acre |
|---|---|---|
| High-tech manufacturing | 300 - 500 | 15 - 30 |
| General manufacturing | 500 - 800 | 8 - 15 |
| Wholesale/distribution | 800 - 1,500 | 5 - 10 |
| Warehousing | 1,500 - 4,000+ | 2 - 5 |
| Heavy industry | 1,000 - 3,000 | 2 - 8 |

Key insight: as cities mature, industrial zones shift from high-employment manufacturing to low-employment warehousing and logistics — the same zoned land produces fewer jobs over time.

---

## Labor Markets

### Unemployment and Labor Force Participation

The labor market has several measurable dimensions:

- **Labor force participation rate (LFPR)** — share of working-age population (16+) that is either employed or actively seeking work. U.S. national average: approximately 62-63%. Varies significantly by city, age group, and education level.
- **Unemployment rate** — share of the labor force that is jobless and actively seeking work. A "healthy" rate is typically 3-5% (frictional unemployment from job transitions).
- **Underemployment** — workers in jobs below their skill level or working fewer hours than desired. Often 2-3x the official unemployment rate.

### Skill Matching

Not all jobs and workers are interchangeable. A mismatch between available jobs and worker skills creates "structural unemployment" — jobs go unfilled while workers remain jobless.

**Skill tiers for simulation:**

| Tier | Education proxy | Job types | Share of workforce |
|---|---|---|---|
| Unskilled | No diploma | Manual labor, basic retail | ~15% |
| Semi-skilled | High school | Manufacturing, clerical, trades | ~40% |
| Skilled | Bachelor's | Professional, technical, management | ~30% |
| Highly skilled | Graduate+ | Research, executive, specialized professional | ~15% |

### Commute Sheds

A commute shed is the geographic area from which a workplace draws its employees. Key findings:

- The average U.S. commute is approximately 27-28 minutes one-way.
- 45% of workers in the largest 98 metro areas work more than 10 miles from the urban center.
- Workers tolerate longer commutes for higher-paying jobs (wage-commute trade-off).
- Geographic mismatch — when jobs and affordable housing are spatially separated — causes prolonged unemployment, especially for low-income workers.

**Labor mobility:** An increase of 100 unemployed workers in an area is associated with net out-migration of approximately 47 workers. Labor is partially mobile but sticky — people do not instantly relocate to where jobs are.

---

## Unemployment Dynamics and Duration

### How Long Does Unemployment Last?

Unemployment duration varies dramatically by economic conditions, geography, and worker characteristics. BLS data reveals the following patterns:

**Median unemployment duration by economic period:**

| Period | Median duration (weeks) | Mean duration (weeks) | Long-term unemployed (27+ weeks) share |
|---|---|---|---|
| Pre-Great Recession (2007) | 8.5 | 16.8 | ~18% |
| Great Recession peak (2010) | 22.1 | 33.3 | ~46% |
| Post-recovery (2019) | 9.1 | 21.3 | ~21% |
| COVID peak (2021) | 16.5 | 27.0 | ~35% |
| Post-COVID recovery (2023) | 9.2 | 19.5 | ~20% |

**Geographic variation:** Even within a single year, unemployment duration ranges enormously by state. In 2021, median duration ranged from 4.9 weeks (South Dakota) to 30.1 weeks (Nevada) — a 6x spread explained by local industry mix, labor market tightness, and housing lock-in effects.

### Wage Scarring: The Permanent Cost of Job Loss

Workers who experience unemployment suffer lasting earnings damage — a phenomenon called **wage scarring**:

- A spell of unemployment carries a wage penalty of approximately **6%** upon re-employment in the first year.
- Three years later, cumulative earnings loss grows to approximately **14%** below the counterfactual earnings path.
- Workers displaced during a recession with unemployment rates above 8% lose roughly **three years' worth of earnings** on average.
- The aggregate cost of excess unemployment during the Great Recession was estimated at over **$1 trillion** in long-run wage losses for displaced high-tenure workers alone (~$50 billion annually over 20 years).

**Scarring mechanisms:**

| Mechanism | Effect | Duration |
|---|---|---|
| Skill depreciation | Technical skills atrophy during joblessness | Accelerates after 6 months |
| Signal degradation | Employers view unemployment duration as negative signal | Worsens with duration; most acute after 12+ months |
| Network erosion | Professional contacts weaken, reducing referral hiring | Gradual, cumulative |
| Psychological withdrawal | Discouragement reduces search intensity and interview performance | Onset at 3-6 months; deepens over time |
| Occupational downgrading | Workers accept lower-skill jobs to end unemployment | Immediate upon re-employment; persists 5-10 years |

### Hysteresis: When Unemployment Becomes Self-Sustaining

Hysteresis in unemployment means that short-run cyclical fluctuations permanently alter the long-run "natural" rate of unemployment. After a recession, unemployment does not simply return to its pre-crisis level — it settles at a **higher** equilibrium.

**Empirical estimates:**

- After a positive unemployment shock, actual unemployment rises above its natural rate for approximately **8 years**.
- During that period, the natural rate itself is pulled upward — estimated at **0.16 percentage points** of increase in the natural rate (u*) for every 1-point deviation of actual unemployment (u) above u* sustained for one year.
- This means a recession that raises unemployment by 5 points for 2 years permanently increases the natural rate by approximately 1.6 points.

**The insider-outsider mechanism:** Employed workers ("insiders") bargain for wages; unemployed workers ("outsiders") have no bargaining power. As unemployment rises, the pool of insiders shrinks, and those remaining bargain for higher wages rather than expanding hiring — perpetuating high unemployment.

### Spatial Dynamics of Unemployment

Unemployment is not randomly distributed across a city. It clusters spatially through several reinforcing mechanisms:

**Concentrated poverty and unemployment:**

- In extremely poor U.S. neighborhoods, **37%** of prime-age men (25-54) are either unemployed or out of the labor force entirely, compared with **19%** nationally.
- Neighborhood employment deprivation prolongs individual unemployment, but the effect is strongest for workers whose social networks are locally concentrated — if all of a worker's friends live in the same neighborhood, local unemployment rates directly prolong their own joblessness.
- Long-term unemployment in a neighborhood induces behavioral spillovers: reduced job-search intensity, erosion of work norms, and weakened institutional capacity (closure of local businesses, reduced public services).

**Spatial mismatch amplifies duration:**

Research using matched employer-employee data finds that improved accessibility to appropriate jobs significantly decreases the duration of joblessness — but this effect is strongest for **lower-paid displaced workers**, precisely those with the least transportation flexibility. Workers displaced from jobs in areas with poor transit access to alternative employers face unemployment durations 20-40% longer than otherwise comparable workers.

**Unemployment propagation in simulation terms:**

```
Spatial unemployment spread:
  1. Plant closure → direct layoffs in immediate area
  2. Local spending drops → nearby retail/service firms lose revenue → secondary layoffs (1-3 month lag)
  3. Residential property values decline → reduced tax revenue → service cuts (6-12 month lag)
  4. Residents with means out-migrate → population loss → further commercial decline (12-24 month lag)
  5. Remaining residents face reduced local networks, fewer employers, longer search → duration rises
```

---

## Commute-Income Inequality

### The Spatial Mismatch Trap

Low-income workers face a structural trap: affordable housing is located far from employment centers, but the workers who need affordable housing also have the least capacity to absorb long commutes. This creates a self-reinforcing cycle of disadvantage.

**The core problem:**

- Housing near employment centers is expensive.
- Low-income workers are priced out to peripheral locations.
- Peripheral locations have poor transit connections to job centers.
- Long commutes consume time, money, and energy — reducing productivity and job access.
- Reduced job access leads to longer unemployment spells and lower wages.
- Lower wages further constrain housing choices.

### Transportation Cost Burden by Income

Transportation costs are deeply regressive. The Bureau of Transportation Statistics provides stark data:

| Income quintile | Annual transportation spending (2023) | Share of pre-tax income | Vehicles per household |
|---|---|---|---|
| Lowest (bottom 20%) | $4,917 | **32%** | 1.0 |
| Second | $7,454 | 20% | 1.5 |
| Third | $10,824 | 16% | 2.0 |
| Fourth | $13,856 | 13% | 2.3 |
| Highest (top 20%) | $17,693 | **9.6%** | 2.6 |

The lowest-income households spend **more than 3x** the income share on transportation compared to the highest. Combined with housing costs (often 40-50% of income for low-income renters), transportation creates a "double burden" that can consume 70-80% of household income.

**Vehicle access gap:** 30% of households in the lowest income quintile do not own or lease a vehicle, compared with only 3% of those in the highest quintile. Workers without vehicles are functionally limited to jobs accessible by transit — which in most U.S. cities means a small fraction of total employment.

### Commute Disparities

The relationship between income and commute time is not a simple linear gradient. Several patterns emerge:

**Duration disparities:**

- A significantly higher share of low-income workers (**11.7%**) endure "mega-commutes" (60+ minutes one-way) compared with middle-earning (9.2%) or highest-earning (8.2%) workers.
- Only **4%** of lower-wage workers work in neighborhoods where affordable rentals exceed low-wage jobs (jobs-housing balance), compared to 58% of medium-wage and 77% of higher-wage workers.
- Late-shift workers — disproportionately low-income and people of color — who rely on public transit face commute times **twice as long** as workers with car access.

**Mode penalty:**

| Commute mode | Average one-way time (minutes) | Income profile of users |
|---|---|---|
| Drive alone | 26-28 | All income levels |
| Carpool | 28-32 | Lower and middle income |
| Public transit (bus) | 45-55 | Disproportionately low income |
| Public transit (rail) | 40-50 | Mixed; skews higher near rail stations |
| Walking/biking | 15-25 | Very low income or very high income (choice vs. necessity) |

**The energy poverty overlay:**

Low-income households spend on average **17.8%** of their income on energy bills and transportation fuel combined — more than 3x the national average. Three in four low-income households experience high combined energy burdens (>12% of income on energy). When fuel prices spike, low-income commuters face an immediate squeeze on all other household spending.

### Geographic Manifestations

**Suburban job sprawl:** As employment has decentralized, low-income workers in inner cities face a reversed spatial mismatch. The U.S. Census Bureau documents this dynamic: jobs in service, retail, and logistics increasingly locate in suburbs with poor transit access from urban core neighborhoods where affordable housing exists.

**The "drive until you qualify" phenomenon:** Workers priced out of urban housing markets move to distant exurbs where homes are affordable but commutes are extreme — sometimes 60-90 minutes each way. This trades housing cost savings for transportation cost increases, with net household financial position often unchanged or worse.

**Empirical policy effects:** Cities with affordable housing incentives, urban growth boundaries, and eased restrictions on accessory dwelling units show lower commute burdens for low-income workers. The mechanism: increasing housing supply near jobs directly shortens commutes for the most cost-burdened households.

---

## Supply Chains and Input-Output Models

### Leontief Input-Output Framework

Wassily Leontief's input-output model (Nobel Prize, 1973) represents the interdependencies between economic sectors using a matrix of technical coefficients. Each entry `a_ij` represents the amount of input from sector `i` required to produce one unit of output in sector `j`.

**The core equation:**

```
x = (I - A)^(-1) × d
```

Where:
- `x` = total output vector (by sector)
- `A` = technical coefficients matrix (inter-industry flows)
- `I` = identity matrix
- `d` = final demand vector
- `(I - A)^(-1)` = the Leontief inverse (total requirements matrix)

**Simplified example — three-sector city:**

| | Residential (consumes) | Commercial (consumes) | Industrial (consumes) |
|---|---|---|---|
| Residential (produces) | 0.05 | 0.10 | 0.15 |
| Commercial (produces) | 0.30 | 0.10 | 0.20 |
| Industrial (produces) | 0.10 | 0.15 | 0.05 |

Reading: the commercial sector consumes 30% of residential output (housing services for workers), 10% of its own output (business services for other businesses), and 10% of industrial output (manufactured goods).

### Economic Linkages

- **Backward linkages** — a new factory demands inputs from suppliers (steel, components, logistics). These suppliers expand, creating upstream jobs.
- **Forward linkages** — factory output becomes input for other industries (a steel mill supplies construction, auto, and appliance manufacturers).
- **Strong-linkage sectors** (high multiplier): food processing, construction, auto manufacturing.
- **Weak-linkage sectors** (low multiplier): mining, agriculture, professional services.

### Three Types of Multipliers

| Multiplier type | What it measures | Typical range |
|---|---|---|
| Output | Total dollar output generated per dollar of new demand | 1.5 - 3.0 |
| Income | Total wage income generated per dollar of new wage income | 1.3 - 2.0 |
| Employment | Total jobs created per direct job | 1.4 - 2.5 |

---

## Creative Destruction

### Schumpeter's Model

Joseph Schumpeter argued that capitalism's defining feature is not equilibrium but perpetual disruption. New technologies, products, and organizational forms destroy existing industries while creating new ones. This "creative destruction" is the engine of long-run growth but causes severe short-run dislocation.

**The cycle:**

```
Innovation → Imitation swarm → Market saturation → Profit erosion → Decline → New innovation
```

### Sector Transitions in Cities

Cities experience creative destruction as dominant industries rise and fall:

| Era | Dominant sector | Successor | Urban impact |
|---|---|---|---|
| 1850-1920 | Textiles, rail | Heavy manufacturing | Mill towns → industrial cities |
| 1920-1970 | Auto, steel, heavy mfg | Suburbanization + services | Inner-city decline, suburban growth |
| 1970-2000 | Manufacturing (domestic) | Finance, tech, services | Rust Belt collapse, Sun Belt rise |
| 2000-present | Retail (brick-and-mortar) | E-commerce, logistics | Mall decline, warehouse boom |

**Detroit as canonical example:** Population fell from 1.6M to 639K between 1960 and 2020 as auto manufacturing automated and offshored. The city filed for bankruptcy in 2013. Meanwhile, cities that transitioned early to knowledge economies (Austin, Seattle, Raleigh) grew rapidly.

**Key insight for simulation:** Economies that depend on a single sector are fragile. Diversification buffers against sector-specific shocks. A healthy city economy has multiple basic-sector industries so that the decline of one does not cascade into systemic collapse.

---

## Sector Transition Timelines

### How Fast Does Creative Destruction Actually Happen?

Sector transitions span decades, not years. The disruption narrative — "overnight obsolescence" — is a myth at the macro level. Even the fastest technology-driven transitions take 10-20 years from tipping point to completion. The slower structural shifts (agriculture to manufacturing, manufacturing to services) take 30-60 years.

### U.S. Manufacturing Employment: The Canonical Decline

The most thoroughly documented sector transition in modern economics:

| Year | Manufacturing employment (millions) | Share of total nonfarm employment | Key event |
|---|---|---|---|
| 1950 | ~15.2 | ~38% | Post-WWII industrial peak |
| 1960 | ~16.8 | ~31% | Suburban industrial expansion |
| 1970 | ~18.4 | ~26% | Peak absolute growth era |
| **1979** | **19.6** | **22%** | **All-time peak employment** |
| 1985 | ~17.8 | ~19% | First major automation wave |
| 1990 | ~17.7 | ~17% | NAFTA-era offshoring begins |
| 2000 | ~17.3 | ~13% | China WTO accession imminent |
| 2007 | ~13.8 | ~10% | Pre-financial-crisis |
| **2009** | **11.5** | **~9%** | **Post-recession trough** |
| 2019 | ~12.8 | ~9% | Pre-COVID |
| 2024 | ~12.9 | ~8% | Partial stabilization |

From peak (1979) to trough (2009): **8.1 million jobs lost over 30 years**, a 41% decline. The sharpest single-decade drop was 2000-2009, when 5.8 million manufacturing jobs vanished — driven by the "China shock" (WTO accession), automation, and the financial crisis.

### Individual Industry Disruption Timelines

| Industry | Peak employment | Tipping point | Collapse to <25% of peak | Duration | Trigger |
|---|---|---|---|---|---|
| U.S. railroads | 2.1M (1920) | Eisenhower Interstate (1956) | <200K (2000) | ~80 years | Highway + air competition |
| British coal | 1.0M (1920) | North Sea gas (1960s) | <5K (2020) | ~60 years | Cheap alternatives + policy |
| U.S. steel (Pittsburgh) | 90K regional (1970s) | Japanese imports (1975) | <5K (2000) | ~25 years | Global competition + automation |
| Telephone operators | 421K (1970) | Electronic switching | 156K (2000) | ~30 years | Automation |
| U.S. textile mills | 900K (1973) | Offshore competition (1980s) | <120K (2020) | ~40 years | Globalization |
| Film photography (Kodak) | 145K (1988) | Digital cameras (2000) | Bankruptcy (2012) | ~24 years | Technology substitution |
| Video rental (Blockbuster) | 84K (2004) | Netflix streaming (2007) | Bankruptcy (2010) | ~6 years | Platform disruption |
| U.S. brick-and-mortar retail | Peak (2017) | E-commerce + COVID (2020) | Ongoing | Ongoing | Channel shift |

**Key observations:**

- **Infrastructure-dependent industries** (rail, coal, steel) decline slowly — 30-80 years — because sunk costs and political inertia slow the transition.
- **Consumer-facing services** (Blockbuster, retail) can collapse in 5-15 years once a viable substitute achieves critical mass.
- **Employment-to-output divergence:** Manufacturing output often continues rising even as employment collapses. U.S. manufacturing output roughly doubled from 1979 to 2019, even as employment fell 41%. The jobs disappeared; the production did not.

### City-Level Transition Case Studies

**Pittsburgh: Steel to Eds-and-Meds (30+ year transition)**

Pittsburgh lost over 150,000 manufacturing jobs in the 1980s when the steel industry collapsed. Unemployment peaked above 17%. Population fell from 520K (1970) to 305K (2010). The recovery was slow and university-anchored:

- 1980s-1990s: Crisis phase. Mass layoffs, population exodus, brownfield contamination.
- 1990s-2000s: Anchor institution phase. Carnegie Mellon and University of Pittsburgh invested in robotics, biotech, and AI research. Healthcare employment grew to 100,000+ jobs.
- 2000s-2010s: Diversification phase. ~1,600 technology firms established in the region. Financial and business services expanded.
- 2010s-present: The city now has lower-than-national-average unemployment. Worker productivity rose 10%, wages 9%, and standard of living 13% between 2010-2015.

**Key factor:** Education. The 29 colleges and universities in southwestern Pennsylvania provided the human capital pipeline for reinvention. Cities without anchor institutions (Youngstown, Flint) have not recovered.

**Detroit: Auto Dependency and Incomplete Transition (40+ years and counting)**

Detroit lost its primary industry more gradually than Pittsburgh but failed to diversify:

- 1960s-1980s: Auto industry automates and suburbanizes. Population begins declining from 1.6M peak (1960).
- 1980s-2000s: Japanese competition erodes market share. Manufacturing jobs continue bleeding.
- 2008-2013: Financial crisis collapses auto industry. GM and Chrysler require federal bailout. Detroit files for municipal bankruptcy (2013).
- 2015-present: Partial recovery led by Dan Gilbert's downtown investments, small tech ecosystem, and auto industry pivot to EVs. But city population has stabilized around 620K — less than 40% of peak.

**The critical difference:** Pittsburgh had multiple universities and hospitals to anchor reinvention. Detroit's economy was overwhelmingly dependent on a single industry cluster (auto + auto supply chain), and its anchor institutions were weaker relative to the scale of displacement.

### What Triggers Sector Transitions?

Transitions rarely have a single cause. They result from the convergence of multiple pressures:

| Trigger type | Mechanism | Lag to employment impact | Example |
|---|---|---|---|
| **Technology substitution** | New technology makes old production method uncompetitive | 10-25 years | Digital photography replacing film |
| **Global competition** | Lower-cost foreign producers capture market share | 5-15 years | Chinese manufacturing after WTO (2001) |
| **Policy/regulatory change** | Government action shifts economics of production | 5-20 years | Clean Air Act accelerating coal decline |
| **Demand shift** | Consumer preferences change fundamentally | 5-15 years | Streaming replacing physical media |
| **Resource depletion** | Physical inputs become scarce or expensive | 20-50 years | Oil towns after field depletion |
| **Infrastructure change** | New infrastructure makes old locations disadvantaged | 10-30 years | Interstate highways bypassing rail towns |

---

## Informal Economy

### Definition and Scope

The informal economy encompasses all economic activity that operates outside government regulation, taxation, and measurement. It includes:

- **Street vending and hawking** — unlicensed food, goods, and services sold in public spaces
- **Day labor and casual work** — construction, domestic work, agricultural labor without formal contracts
- **Home-based production** — garment work, food preparation, craft manufacturing from residences
- **Underground commerce** — unlicensed businesses, cash-only transactions, unreported income
- **Gig and platform work** (gray area) — ride-hailing, delivery, task services that may or may not be formally captured in statistics

The informal economy is **not** synonymous with illegal activity, although there is overlap. Most informal economic activity is legal in nature (selling food, cleaning houses, construction labor) but operates outside tax and regulatory frameworks.

### Scale by Country Income Level

The IMF estimates that the informal economy averages **35%** of GDP in low- and middle-income countries versus **15%** in advanced economies. But variation within these categories is enormous:

| Country/Region | Informal economy (% of GDP) | Informal employment (% of total) | Notes |
|---|---|---|---|
| **Sub-Saharan Africa** | ~34% | ~85% | Highest informality globally |
| **Latin America & Caribbean** | ~34% | ~55% | Wide variation by country |
| **South Asia** | ~28-33% | ~80% | India: ~52% of GDP |
| **Southeast Asia** | ~25-30% | ~60-70% | — |
| **Eastern Europe/Central Asia** | ~20-30% | ~25-40% | Post-Soviet transition economies |
| **OECD average** | ~15% | ~18% | — |
| **North America** | ~9% | ~10-15% | U.S.: ~7-9% of GDP ($1.4-2.0 trillion) |
| **Nordic countries** | ~8-10% | ~5-8% | Lowest globally |

**Nepal** illustrates the extreme case: shadow activity accounts for **51%** of GDP, and 85% of the labor force participates in the informal economy.

### Informal Economy by City Type

Informality is fundamentally an urban phenomenon in developing countries, though it manifests differently by city size and governance capacity:

| City type | Informal employment share | Dominant informal activities | Spatial pattern |
|---|---|---|---|
| Mega-city (developing) | 40-60% of workforce | Street vending, domestic work, transport, construction | Concentrated in slums, transit nodes, market areas |
| Mid-size city (developing) | 50-70% of workforce | Small-scale manufacturing, agriculture-linked processing | More dispersed, tied to market schedules |
| Small town (developing) | 60-80% of workforce | Agricultural processing, petty trade, services | Centered on periodic markets |
| Large metro (developed) | 5-15% of workforce | Construction, domestic work, food service, gig work | Immigrant neighborhoods, industrial periphery |
| Small city (developed) | 3-8% of workforce | Cash-based services, agriculture | Rural-urban fringe |

In urban areas of low-income and lower-middle-income countries, approximately **three-quarters** of employment is informal. The most prevalent types are home-based workers and street vendors, which combined represent 10-15% of the non-agricultural workforce in developing countries and over 5% in developed countries.

### Informal Economy in Developed Countries

Even in wealthy nations, substantial economic activity escapes formal measurement:

**United States (~7-9% of GDP, $1.4-2.0 trillion):**

Components of the U.S. shadow economy include:
- Unreported income from cash-based businesses (restaurants, construction, personal services)
- Gig and platform workers not fully captured in tax reporting
- Under-the-table employment (domestic work, landscaping, childcare)
- Undocumented immigrant labor (construction, agriculture, food processing, hospitality)

The U.S. shadow economy is estimated between 7.3-10% of GDP depending on methodology, generating $1.4-2.5 trillion in economic activity. This places it among the lowest informality rates globally, alongside Switzerland (8.1%) and Austria (8.9%).

**Relationship to formal economy:**

The informal economy is not separate from the formal economy — it is deeply intertwined:

- Formal firms subcontract to informal workers (construction, garment industry)
- Informal businesses serve as suppliers to formal retailers
- Workers move fluidly between formal and informal employment
- Informal activity increases during recessions as formal employment contracts

**Economic cycle effects:**

```
Recession → formal layoffs → workers enter informal economy → informal sector expands
Recovery → formal hiring resumes → workers exit informal economy → informal sector contracts
```

This counter-cyclical behavior means the informal economy acts as a **shock absorber** — providing subsistence income when formal employment contracts. In developing countries, this buffer function is critical: without it, recessions would produce far higher destitution.

### Street Vending as Urban Economic Infrastructure

Street vendors merit specific attention because they represent the most visible and spatially significant form of informal economic activity:

- Street vending employs an estimated **2.5%** of the urban workforce in developing countries and contributes significantly to food access, particularly in low-income neighborhoods.
- Vendors cluster at **transit nodes, market entrances, and high-pedestrian-traffic streets** — following the same location logic as formal retail (maximizing customer access per unit time).
- Vendor density correlates with formal commercial vacancy — when formal retail retreats from an area, informal commerce fills the gap.
- Regulatory crackdowns on street vending frequently harm low-income consumers who depend on vendors for affordable food and goods.

---

## Economic Development Tools

### Tax Incentives

Local governments use tax abatements, credits, and exemptions to attract firms. Empirical evidence on effectiveness is mixed:

- **Indiana enterprise zones (1988):** Direct budgetary costs averaged $4,564 per new job and $31,113 per new zone resident job.
- **California enterprise zones:** Multiple studies found no statistically significant increase in employment.
- **Federal empowerment zones:** Wages and employment increased, but it is difficult to separate tax incentive effects from simultaneous grant funding.

Consensus: tax incentives can shift activity between jurisdictions (zero-sum) more than they create net new activity. They work best when combined with genuine locational advantages.

### Enterprise Zones

Designated areas with reduced taxes, streamlined permitting, and sometimes infrastructure investment. The theory: lower operating costs attract firms to distressed neighborhoods. The evidence: most rigorous studies find minimal net employment gains. Firms that relocate into enterprise zones often would have located nearby regardless.

### Anchor Institutions

Universities, hospitals, and military bases serve as stable economic anchors because they are immobile and recession-resistant. "Eds and meds" account for the largest employment sector in many mid-size cities:

- Universities generate knowledge spillovers, spin-off companies, and a steady flow of skilled graduates.
- Hospitals anchor a health-care supply chain: clinics, labs, pharmacies, medical equipment suppliers.
- Both create reliable demand for local commercial services (housing, food, retail).

---

## Multiplier Effects

### Moretti's Local Multiplier Research

Enrico Moretti (UC Berkeley) published influential research on local job multipliers using U.S. Census data from 1980-2000.

**Core finding:** For each additional job in the tradable (export) sector in a given city, approximately 1.6 additional jobs are created in the non-tradable (local-serving) sector.

**Variation by skill level:**

| Job type added (tradable sector) | Non-tradable jobs created | Notes |
|---|---|---|
| Average tradable job | 1.6 | Baseline finding |
| High-tech / innovation job | Up to 5.0 (claimed) | Moretti's headline number |
| Skilled tradable job | ~2.0 skilled non-tradable | Skill-biased multiplier |
| Unskilled tradable job | ~3.3 unskilled non-tradable | Higher count but lower wages |

**Important caveat:** The headline "5 jobs per tech job" claim has been contested. A reanalysis found the true high-skill multiplier may be closer to 1.0 additional non-tradable job. The truth likely lies between these extremes and varies by local conditions.

**Multiplier values by sector (synthesis of multiple studies):**

| Sector | Employment multiplier | Rationale |
|---|---|---|
| High-tech manufacturing | 2.0 - 4.0 | High wages, strong supply chains |
| Traditional manufacturing | 1.5 - 2.5 | Moderate wages, local suppliers |
| Professional services | 1.5 - 2.0 | High wages but fewer supply chain links |
| Health care | 1.4 - 1.8 | Stable demand, moderate wages |
| Retail | 1.1 - 1.4 | Low wages, limited multiplier |
| Warehousing/logistics | 1.2 - 1.5 | Low wages but some supply chain activity |
| Government/education | 1.3 - 1.6 | Stable, moderate wages |

**Swedish comparison:** Adding a high-skilled tradable job in Sweden created approximately 3 additional non-tradable jobs (vs. Moretti's U.S. claim of 5), suggesting that safety-net policies and labor market structure affect multiplier magnitude.

### Mechanism

The multiplier operates through spending chains:

```
New factory job ($50K salary)
  → Worker spends ~60% locally ($30K)
    → Local businesses hire to meet demand
      → Those workers spend locally
        → Chain continues with diminishing intensity
```

The multiplier is larger when:
- Wages are higher (more local spending per job)
- The local economy is more self-contained (less spending leaks to imports)
- Housing supply is elastic (workers can actually move in rather than just bidding up rents)

---

## Land Value and Economic Activity

### Bid-Rent Curves Revisited

Land value in cities is fundamentally a function of accessibility — to customers, workers, suppliers, and amenities. The bid-rent curve formalizes this as a declining function of distance from the point of maximum accessibility (historically the CBD, increasingly polycentric).

**Typical land value gradient (U.S. metro):**

| Distance from CBD | Relative land value | Dominant use |
|---|---|---|
| 0 (CBD core) | 100% (baseline) | High-rise office, luxury retail |
| 0.5 miles | 60-80% | Office, mixed-use, high-density residential |
| 1-2 miles | 30-50% | Commercial strips, medium-density residential |
| 3-5 miles | 15-25% | Light industrial, suburban commercial |
| 5-10 miles | 5-15% | Low-density residential, warehousing |
| 10+ miles | 2-8% | Exurban residential, agriculture |

### Highest and Best Use

The economic principle that land gravitates toward whatever use generates the maximum return. This explains:

- Why gas stations at highway interchanges become shopping centers as the metro expands
- Why inner-city factories convert to loft apartments when deindustrialization raises the relative value of residential use
- Why agricultural land at the urban fringe converts to subdivisions when population growth pushes the "boundary of profitability" outward

**Formula for land use transition:**

```
Transition occurs when:
  Revenue(new_use) - Conversion_Cost > Revenue(current_use)
```

In practice, zoning regulations, NIMBYism, and infrastructure constraints delay these transitions, creating misallocation of land relative to pure market outcomes.

---

## Application to Bitborough

### Current System

Bitborough uses a three-zone R/C/I (Residential, Commercial, Industrial) demand model. Key current mechanics:

- **Demand** ranges from -1 to 1 per zone type, driven by tax rate, congestion, and citizen signals.
- **Commercial demand** tracks total residential capacity (`totalResCap / 500`), capped at 0.6 — implementing a simplified "retail follows rooftops" pattern.
- **Industrial demand** has a constant base (0.4) with dampened tax sensitivity.
- **Citizens** are assigned a home, a workplace, and a commerce destination. Pathfinding uses A* on the road graph.
- **Unmatched job fraction** and **unmatched commerce fraction** feed back into demand.
- **Commute length** suppresses residential demand when average exceeds 30 tiles.

**Current jobs per building:**

| Building | Size | Jobs | Jobs/tile | Density level |
|---|---|---|---|---|
| `com.low` | 1x1 | 5 | 5.0 | Low |
| `com.med` | 1x1 | 30 | 30.0 | Medium |
| `com.med.b` | 2x2 | 36 | 9.0 | Medium |
| `com.high` | 2x2 | 175 | 43.75 | High |
| `com.high.b` | 2x3 | 200 | 33.3 | High |
| `ind.low` | 1x1 | 10 | 10.0 | Low |
| `ind.med` | 2x2 | 10 | 2.5 | Medium |
| `ind.med.b` | 3x2 | 12 | 2.0 | Medium |
| `ind.high` | 3x3 | 5 | 0.56 | High |
| `ind.high.b` | 4x3 | 6 | 0.50 | High |

Note: industrial buildings have *decreasing* jobs/tile at higher density, which correctly models the real-world pattern of industrial automation — larger facilities employ fewer workers per unit area (warehousing vs. small workshops).

### Suggested Enhancements

#### 1. Export Base Multiplier

Introduce a distinction between basic and non-basic employment. Industrial jobs are "basic" (export-producing); commercial jobs are split between basic (offices serving external clients) and non-basic (local retail). The multiplier determines how much non-basic employment is sustainable.

```typescript
// Simplified export base multiplier
const basicJobs = industrialJobs + (commercialJobs * OFFICE_EXPORT_FRACTION)
const maxNonBasicJobs = basicJobs * BASE_MULTIPLIER
// BASE_MULTIPLIER scales with city population:
//   pop < 1000: 1.5
//   pop < 5000: 2.0
//   pop < 20000: 2.5
//   pop >= 20000: 3.0
```

If actual non-basic employment exceeds `maxNonBasicJobs`, commercial demand should decline (over-served market).

#### 2. Agglomeration Bonus

Buildings near other buildings of the same type should receive a productivity bonus (localization economies). This could manifest as increased tax revenue or accelerated density upgrades.

```typescript
// Agglomeration bonus: count same-category buildings within radius
function agglomerationFactor(map: GameMap, building: Building, radius: number): number {
  const category = BUILDING_DEFS[building.defId]?.category
  let neighbors = 0
  // scan tiles within radius for same-category buildings
  // ...
  return 1.0 + Math.min(neighbors * 0.05, 0.5) // max +50% bonus
}
```

#### 3. Supply Chain Linkages

Add inter-sector dependencies. Commercial buildings should require nearby industrial output (goods to sell); industrial buildings benefit from nearby commercial services (logistics, business services).

```typescript
interface SectorDependency {
  industrialNeedsCommercial: number  // 0.2 — industrial benefits from business services
  commercialNeedsIndustrial: number  // 0.3 — retail needs manufactured goods
  commercialNeedsResidential: number // 0.5 — retail needs customers (already modeled)
}

// Satisfaction penalty when dependencies unmet
// If no industrial buildings exist, commercial satisfaction -= commercialNeedsIndustrial
```

#### 4. Unemployment Simulation

Track unemployment explicitly rather than just "unmatched job fraction."

```typescript
interface LaborMarket {
  laborForce: number           // working-age population (e.g., 60% of residents)
  employed: number             // citizens with matched jobs
  unemployed: number           // laborForce - employed
  unemploymentRate: number     // unemployed / laborForce
  vacancies: number            // totalJobs - employed
  vacancyRate: number          // vacancies / totalJobs
}

// Demand signal: high unemployment → boost industrial demand (need jobs)
// Demand signal: high vacancy rate → boost residential demand (need workers)
// Demand signal: unemployment > 10% → residential demand penalty (people leave)
```

#### 5. Sector Evolution

Implement creative destruction as a long-run mechanic. As the city grows, industrial composition should evolve:

```
Phase 1 (pop < 2000):   Light industry dominates, high jobs/building
Phase 2 (pop 2000-10000): Mixed industry, some automation
Phase 3 (pop > 10000):  Shift toward logistics/warehousing (low jobs/tile) +
                          office/tech (high jobs/tile in commercial zone)
```

This could be modeled by adjusting the building definitions available at each phase or by introducing building-level evolution (a `ind.low` workshop upgrades to `ind.med` factory, but `ind.high` is a warehouse with fewer jobs).

#### 6. Commercial Hierarchy

Replace flat commercial demand with a tiered system matching central place theory:

```typescript
// Neighborhood commercial: threshold 500 residents within 5 tiles
// Community commercial: threshold 2000 residents within 15 tiles
// Regional commercial: threshold 8000 residents within 30 tiles

function commercialTierDemand(pop: number, radius: number): CommercialTier {
  if (pop >= 8000) return 'regional'   // unlocks com.high
  if (pop >= 2000) return 'community'  // unlocks com.med
  return 'neighborhood'                // only com.low
}
```

#### 7. Land Value Layer

Add a land value overlay computed from accessibility, zone type, and agglomeration. Use it to drive density upgrades and zone transitions.

```typescript
// Land value at tile = sum of accessibility factors
function landValue(tile: number, map: GameMap): number {
  let value = 0
  value += cbdProximityFactor(tile, map)        // bid-rent gradient
  value += transitProximityFactor(tile, map)     // TOD premium
  value += agglomerationFactor(tile, map)        // cluster bonus
  value -= pollutionPenalty(tile, map)           // pollution discount
  value *= infrastructureAccess(tile, map)       // road/power multiplier
  return value
}

// Density upgrade when: landValue > threshold[currentDensity]
// Zone transition when: landValue(new_use) >> landValue(current_use)
```

#### 8. Unemployment Duration and Scarring

Model unemployment as a **duration-aware** system rather than a binary employed/unemployed state. Workers who remain unemployed for longer become harder to re-employ, creating hysteresis effects that can trap neighborhoods in decline.

```typescript
interface UnemployedCitizen {
  id: number
  ticksUnemployed: number    // duration counter
  skillDecay: number         // 0.0-1.0, increases with duration
  searchIntensity: number    // 1.0 at start, decays over time
  wagePenalty: number        // accepted wage discount to end unemployment
}

// Scarring formula: probability of finding work decays with duration
function jobFindProbability(citizen: UnemployedCitizen): number {
  const baseProbability = 0.15  // 15% chance per tick when newly unemployed
  const durationPenalty = Math.min(citizen.ticksUnemployed * 0.01, 0.10)
  const accessPenalty = commuteAccessFactor(citizen) // 0.0-0.5 based on distance to jobs
  return Math.max(baseProbability - durationPenalty - accessPenalty, 0.01)
}

// After re-employment, wage scarring persists:
// wage = baseWage * (1.0 - 0.06 * yearsUnemployed)  // 6% penalty per year, from empirical data
```

**Spatial propagation:** When a building is bulldozed or an industrial plant closes, nearby commercial buildings should experience a demand shock with a 1-3 tick lag (representing the spending multiplier in reverse). This creates realistic cascading decline rather than instant adjustment.

#### 9. Commercial Real Estate Cycle

Model office/commercial vacancy as a lagging indicator with construction pipeline delays. This prevents the player from perfectly timing commercial zone expansion and creates realistic boom-bust dynamics.

```typescript
interface CommercialMarket {
  occupiedSpace: number
  totalSpace: number
  pipeline: number           // space under construction, not yet delivered
  deliveryCountdown: number  // ticks until pipeline becomes totalSpace
  vacancyRate: number        // (totalSpace - occupiedSpace) / totalSpace
  effectiveRent: number      // declines when vacancy > naturalVacancy
}

const NATURAL_VACANCY = 0.08        // 8% is "healthy"
const CONSTRUCTION_LAG = 12         // ticks from zone to occupancy
const RENT_SENSITIVITY = -0.5       // rent drops 0.5% per 1% vacancy above natural

// Vacancy-adjusted rent
function effectiveRent(market: CommercialMarket): number {
  const excessVacancy = Math.max(market.vacancyRate - NATURAL_VACANCY, 0)
  return market.effectiveRent * (1.0 + RENT_SENSITIVITY * excessVacancy)
}

// Tax revenue from commercial = effectiveRent * occupiedSpace * taxRate
// This means overbuilding directly reduces city revenue, creating fiscal pressure
```

#### 10. Commute-Income Stratification

Model citizens with income tiers where lower-income workers face compounding disadvantages: they live farther from jobs (affordable housing at periphery), spend more time commuting (less productive), and are more vulnerable to job loss.

```typescript
interface CitizenEconomics {
  incomeTier: 'low' | 'mid' | 'high'
  maxAffordableRent: number          // constrains housing location
  transportBudgetShare: number       // low=0.32, mid=0.16, high=0.10
  commuteTimeTolerance: number       // low=45min, mid=35min, high=25min
  hasVehicle: boolean                // low=70%, mid=95%, high=97%
}

// Housing choice: citizen picks cheapest housing within commute tolerance
// If no affordable housing within tolerance → accept longer commute OR leave city
// Residential demand penalty when avg low-income commute exceeds threshold

// Feedback loop: if city builds affordable housing near jobs, low-income commutes shorten
// If only peripheral residential is affordable, low-income workers face commute trap
```

#### 11. Sector Transition Events

At population thresholds, trigger sector transition events that restructure the industrial base — modeling the decades-long creative destruction process in compressed game time.

```typescript
interface SectorTransition {
  trigger: 'population' | 'technology' | 'external_shock'
  threshold: number
  effect: {
    industrialJobsPerBuilding: number    // changes jobs/tile for existing buildings
    newBuildingTypesUnlocked: string[]
    obsoleteBuildingTypes: string[]       // these stop upgrading, may abandon
    transitionDurationTicks: number       // how many ticks the disruption lasts
    unemploymentSpike: number             // temporary unemployment increase
  }
}

// Example transitions:
// pop 5000: "Automation wave" — ind.med jobs drop from 10 to 6, ind.high unlocks
// pop 15000: "Service economy" — new com.office type added, ind employment -20%
// pop 30000: "Knowledge economy" — com.tech type added (high jobs/tile), old industry stagnates
// External shock (random): "Trade disruption" — industrial demand drops 40% for 20 ticks
```

#### 12. Informal Economy Buffer

During high unemployment, a fraction of unemployed citizens enter informal employment — generating partial economic activity that cushions the city from complete collapse. This creates a more realistic recession dynamic where cities decline gradually rather than catastrophically.

```typescript
// When unemployment > 8%, informal economy activates
function informalEmployment(laborMarket: LaborMarket): number {
  if (laborMarket.unemploymentRate <= 0.08) return 0
  const excessUnemployment = laborMarket.unemployed - (laborMarket.laborForce * 0.08)
  const informalRate = 0.3  // 30% of excess unemployed enter informal work
  const informalWorkers = Math.floor(excessUnemployment * informalRate)
  return informalWorkers
}

// Informal workers:
// - Generate 40% of formal worker tax revenue (partial economic contribution)
// - Do not require a workplace building (they work "anywhere")
// - Reduce out-migration pressure (they have subsistence income)
// - Convert back to formal employment when jobs become available
// - Cluster near commercial zones and transit (matching real vendor location patterns)
```

---

## Cross-References

- [Population and Demographics](./population-and-demographics.md) — labor force size, age distribution, skill levels feed into employment capacity
- [Transportation and Traffic](./transportation-and-traffic.md) — commute sheds, congestion penalties on demand, road network as supply chain infrastructure
- [Land Use and Zoning](./land-use-and-zoning.md) — zoning constrains bid-rent outcomes, determines what can build where
- [Urban Density Gradients](./urban-density-gradients.md) — density gradient shapes employment density, commercial viability thresholds
- [Transit-Oriented Development](./transit-oriented-development.md) — transit access modifies bid-rent curves, creates secondary employment centers

---

## Sources

**Foundational Texts:**
- Alonso, W. (1964). *Location and Land Use*. Harvard University Press.
- Christaller, W. (1933). *Central Places in Southern Germany*. (English translation, 1966).
- Leontief, W. (1986). *Input-Output Economics*. Oxford University Press.
- Marshall, A. (1890). *Principles of Economics*. Macmillan.
- Schumpeter, J. (1942). *Capitalism, Socialism and Democracy*. Harper & Brothers.
- Weber, A. (1909). *Theory of the Location of Industries*. (English translation, 1929).

**Empirical Research:**
- [Moretti, E. "Local Multipliers." *American Economic Review*, 2010.](https://eml.berkeley.edu/~moretti/multipliers.pdf)
- [Moretti, E. and Thulin, P. "Local multipliers and human capital in the United States and Sweden." *Industrial and Corporate Change*, 2013.](https://academic.oup.com/icc/article/22/1/339/885578)
- [Rosenthal, S. and Strange, W. "Evidence on the Nature and Sources of Agglomeration Economies." *Handbook of Regional and Urban Economics*, 2004.](https://www.sciencedirect.com/science/article/abs/pii/S1574008004800063)
- [Combes, P.P. and Gobillon, L. "The Empirics of Agglomeration Economies." *Handbook of Regional and Urban Economics*, 2015.](https://hceconomics.uchicago.edu/sites/default/files/pdf/events/Combes_Gobillon_2015_empirics-agglomeration.pdf)
- [Ellison, G., Glaeser, E., and Kerr, W. "What Causes Industry Agglomeration? Evidence from Coagglomeration Patterns." *American Economic Review*, 2010.](https://economics.mit.edu/sites/default/files/publications/What%20Causes%20Industry%20Agglomeration%20Evidence%20from%20C.pdf)
- [Kemeny, T. and Osman, T. "Local Job Multipliers Revisited." *Journal of Regional Science*, 2021.](https://qmro.qmul.ac.uk/xmlui/bitstream/handle/123456789/73902/Kemeny%20Local%20Job%20Multipliers%20Revisited%202021%20Accepted.pdf?sequence=2&isAllowed=y)
- [Centre for Cities. "The impact of agglomeration on the economy."](https://www.centreforcities.org/reader/office-politics/the-impact-of-agglomeration-on-the-economy/)

**Data Sources:**
- [U.S. Bureau of Labor Statistics — Employment by Major Industry Sector](https://www.bls.gov/emp/tables/employment-by-major-industry-sector.htm)
- [Metropolitan Council — How to Measure Employment Intensity and Capacity](https://metrocouncil.org/Handbook/Files/Resources/Fact-Sheet/ECONOMIC-COMPETITIVENESS/How-to-Measure-Employment-Intensity-and-Capacity.aspx)
- [Pierce County Employment Density Survey (ECONorthwest)](https://www.piercecountywa.gov/DocumentCenter/View/100439/BLP-ECONW-Employment-Density-Survey)
- [FRED — Unemployment Rate (UNRATE)](https://fred.stlouisfed.org/series/UNRATE)
- [Brookings Institution — "Multiplier Effects: Connecting the Innovation and Opportunity Agendas"](https://www.brookings.edu/articles/multiplier-effects-connecting-the-innovation-and-opportunity-agendas/)

**Unemployment, Hysteresis, and Wage Scarring:**
- [BLS — Duration of Unemployment](https://www.bls.gov/charts/employment-situation/duration-of-unemployment.htm)
- [BLS — Unemployment Duration in the Pandemic: A Look at Jobseeker Demographics](https://www.bls.gov/spotlight/2024/unemployment-duration-in-the-pandemic-a-look-at-jobseeker-demographics/home.htm)
- [FRED — Average Weeks Unemployed (UEMPMEAN)](https://fred.stlouisfed.org/series/UEMPMEAN)
- [ECB Working Paper — "Hysteresis in unemployment: evidence from OECD estimates"](https://www.ecb.europa.eu/pub/pdf/scpwps/ecb.wp2625~f013b1096b.en.pdf)
- [Blanchard, O. and Summers, L. "Hysteresis in Unemployment." *NBER Working Paper 14818*.](https://www.nber.org/system/files/working_papers/w14818/w14818.pdf)
- [EPI — "Long-Term Unemployment Has Not Damaged the Productivity of Workers"](https://www.epi.org/publication/long-term-unemployment-scarring/)
- [NBER — "Spatial Mismatch and the Duration of Joblessness"](https://www.nber.org/digest/sep14/spatial-mismatch-and-duration-joblessness)
- [Ioannides, Y. and Topa, G. "Neighborhood effects on unemployment?" *Regional Science and Urban Economics*, 2010.](https://www.sciencedirect.com/science/article/abs/pii/S0166046210000311)
- [Urban Institute — "Long-term unemployment and poverty produce a vicious cycle"](https://www.urban.org/urban-wire/long-term-unemployment-and-poverty-produce-vicious-cycle)
- [Econofact — "Concentrated Poverty and the Disconnect Between Jobs and Workers"](https://econofact.org/concentrated-poverty-and-the-disconnect-between-jobs-and-workers)

**Commercial Real Estate Cycles:**
- [NAREIT — "What Can Past Real Estate Construction Cycles Tell Us About the Outlook For REITs Today?"](https://www.reit.com/data-research/research/nareit-research/what-can-past-real-estate-construction-cycles-tell-us-about)
- [FDIC — "Commercial Real Estate and the Banking Crises"](https://www.fdic.gov/bank/historical/history/137_165.pdf)
- [Moody's — "US vacancy rate of commercial buildings sits at nearly 40-year high"](https://www.moodys.com/web/en/us/insights/data-stories/us-commercial-real-estate-vacancies-downtown-vs-suburbs.html)
- [Facilities Dive — "US office vacancy rates break 20% for first time ever"](https://www.facilitiesdive.com/news/us-office-vacancy-rates-moodys-analysis/720862/)
- [CommercialCafe — National Office Report](https://www.commercialcafe.com/blog/national-office-report/)
- [Hoyt, H. (1933). *One Hundred Years of Land Values in Chicago*. University of Chicago Press.](https://www.effectiveagents.com/resources/the-18-year-real-estate-cycle-understanding-market-phases-to-make-smarter-decisions)
- [NYC Comptroller — "NYC's Office Market: Doom Loop or Boom Loop?"](https://comptroller.nyc.gov/reports/nycs-office-market-doom-loop-or-boom-loop/)

**Sector Transitions and Creative Destruction:**
- [BLS — "Forty years of falling manufacturing employment"](https://www.bls.gov/opub/btn/volume-9/forty-years-of-falling-manufacturing-employment.htm)
- [BLS — "The fall of employment in the manufacturing sector"](https://www.bls.gov/opub/mlr/2018/beyond-bls/the-fall-of-employment-in-the-manufacturing-sector.htm)
- [Econlib — "Creative Destruction"](https://www.econlib.org/library/Enc/CreativeDestruction.html)
- [ITIF — "The Process of Creative Destruction, Illustrated: The US Retail Industry"](https://itif.org/publications/2022/10/03/the-process-of-creative-destruction-illustrated-the-us-retail-industry/)
- [Cleveland Fed — "Rust and Renewal: A Pittsburgh Retrospective"](https://www.clevelandfed.org/regional-analysis/pittsburgh-retrospective)
- [World Economic Forum — "How Pittsburgh shed its rust belt image"](https://www.weforum.org/stories/2014/08/pittsburgh-rust-steel-city/)
- [Caballero, R. "Creative destruction." *MIT Economics Working Paper*.](https://economics.mit.edu/sites/default/files/publications/creative%20destruction.pdf)

**Informal Economy:**
- [IMF — "The Global Informal Economy: Large but On The Decline"](https://www.imf.org/en/Blogs/Articles/2019/10/30/the-global-informal-economy-large-but-on-the-decline)
- [IMF — "Five Things to Know about the Informal Economy"](https://www.imf.org/en/news/articles/2021/07/28/na-072821-five-things-to-know-about-the-informal-economy)
- [World Bank — Informal Economy Database](https://www.worldbank.org/en/research/brief/informal-economy-database)
- [WIEGO — Statistical Picture of the Informal Economy](https://www.wiego.org/informal-economy/statistical-picture/)
- [World Economics — Informal Economy Size by Country](https://www.worldeconomics.com/Informal-Economy/)
- [IMF Working Paper — "Shadow Economies Around the World: What Did We Learn?"](https://www.imf.org/-/media/Files/Publications/WP/2018/wp1817.ashx)
- [Visual Capitalist — "Mapped: The Size of the Shadow Economy by Country"](https://www.visualcapitalist.com/size-of-the-shadow-economy-by-country/)

**Commute-Income Inequality:**
- [Urban Institute — "The Unequal Commute"](https://www.urban.org/features/unequal-commute)
- [Bureau of Transportation Statistics — "The Household Cost of Transportation: Is it Affordable?"](https://www.bts.gov/data-spotlight/household-cost-transportation-it-affordable)
- [BTS — "Transportation Cost Burden Falls Significantly for Second-Lowest, but No Other, Income Group"](https://www.bts.gov/data-spotlight/transportation-cost-burden-falls-significantly-second-lowest-no-other-income-group)
- [U.S. Census — "Spatial Mismatch: When Workers Can't Get to Jobs in the Suburbs"](https://www.census.gov/library/stories/2020/03/spatial-mismatch-when-workers-can-not-get-to-jobs-in-suburbs.html)
- [National Low Income Housing Coalition — "Research Finds Lack of Affordable Housing Increases Commute Times"](https://nlihc.org/resource/research-finds-lack-affordable-housing-increases-commute-times)
- [ACEEE — "Low-Income Households Spend Nearly 20% of Income on Home Energy and Auto Fuel Costs"](https://www.aceee.org/blog-post/2024/05/low-income-households-spend-nearly-20-income-home-energy-and-auto-fuel-costs)
- [Terner Center, UC Berkeley — "Residential Land Use Regulation and the Spatial Mismatch"](https://ternercenter.berkeley.edu/research-and-policy/residential-land-use-regulation-and-the-spatial-mismatch-between-housing-and-employment-opportunities-in-california-cities/)
- [ITDP — "The High Cost of Transportation in the United States"](https://itdp.org/2024/01/24/high-cost-transportation-united-states/)

**Economic Development:**
- [Minnesota House Research — Enterprise Zones: A Review of the Economic Theory and Evidence](https://www.house.mn.gov/hrd/pubs/entzones.pdf)
- [Florida EDR — Literature Review of Enterprise Zone Impact](https://edr.state.fl.us/content/special-research-projects/economic/EnterpriseZoneAnalysis.pdf)
- [Economic Base Analysis — Wikipedia](https://en.wikipedia.org/wiki/Economic_base_analysis)
- [Bid Rent Theory — Wikipedia](https://en.wikipedia.org/wiki/Bid_rent_theory)
- [Central Place Theory — Wikipedia](https://en.wikipedia.org/wiki/Central_place_theory)
- [Creative Destruction — Wikipedia](https://en.wikipedia.org/wiki/Creative_destruction)
