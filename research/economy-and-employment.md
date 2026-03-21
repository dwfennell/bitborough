# Economy and Employment

> How urban economies generate jobs, attract firms, and create wealth — models for simulating economic dynamics.

## Table of Contents

- [Economic Base Theory](#economic-base-theory)
- [Agglomeration Economies](#agglomeration-economies)
- [Industrial Location Theory](#industrial-location-theory)
- [Commercial Sector Dynamics](#commercial-sector-dynamics)
- [Industrial Sector Dynamics](#industrial-sector-dynamics)
- [Labor Markets](#labor-markets)
- [Supply Chains and Input-Output Models](#supply-chains-and-input-output-models)
- [Creative Destruction](#creative-destruction)
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

**Economic Development:**
- [Minnesota House Research — Enterprise Zones: A Review of the Economic Theory and Evidence](https://www.house.mn.gov/hrd/pubs/entzones.pdf)
- [Florida EDR — Literature Review of Enterprise Zone Impact](https://edr.state.fl.us/content/special-research-projects/economic/EnterpriseZoneAnalysis.pdf)
- [Economic Base Analysis — Wikipedia](https://en.wikipedia.org/wiki/Economic_base_analysis)
- [Bid Rent Theory — Wikipedia](https://en.wikipedia.org/wiki/Bid_rent_theory)
- [Central Place Theory — Wikipedia](https://en.wikipedia.org/wiki/Central_place_theory)
- [Creative Destruction — Wikipedia](https://en.wikipedia.org/wiki/Creative_destruction)
