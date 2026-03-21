# Population and Demographics

> How urban populations grow, age, move, and stratify — models for simulating demographic dynamics.

## Table of Contents

- [Urban Population Growth Models](#urban-population-growth-models)
- [Migration](#migration)
- [Natural Increase](#natural-increase)
- [Age Structure](#age-structure)
- [Household Formation](#household-formation)
- [Wealth and Income Stratification](#wealth-and-income-stratification)
- [Demographic Transition](#demographic-transition)
- [Population Density and City Size](#population-density-and-city-size)
- [Suburbanization and Counter-Urbanization](#suburbanization-and-counter-urbanization)
- [Population Forecasting](#population-forecasting)
- [Application to Bitborough](#application-to-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

---

## Urban Population Growth Models

### The Logistic Growth Equation

The most broadly applicable model for bounded population growth is the logistic equation, first applied to human populations by Verhulst (1838):

```
dP/dt = r × P × (1 - P/K)
```

| Symbol | Meaning |
|--------|---------|
| `P` | Current population |
| `t` | Time |
| `r` | Intrinsic growth rate (births minus deaths as a fraction) |
| `K` | Carrying capacity — the maximum population the environment sustains |

The closed-form solution is:

```
P(t) = K / (1 + ((K - P₀) / P₀) × e^(-rt))
```

This produces an S-shaped (sigmoid) curve with three phases:

1. **Exponential phase** — Population is small relative to K, resources abundant, growth approximates `dP/dt ≈ rP`.
2. **Inflection phase** — Growth rate peaks at `P = K/2`, then decelerates as the `(1 - P/K)` term increasingly dampens growth.
3. **Plateau phase** — Population asymptotically approaches K, with negligible net growth.

### Carrying Capacity in Urban Systems

For cities, K is not a fixed constant. It is a dynamic ceiling determined by:

- **Housing stock** — total residential capacity (units × average household size)
- **Employment base** — jobs available across all sectors
- **Infrastructure** — water, sewerage, electricity, transport throughput
- **Amenities and quality of life** — parks, services, safety, schools

A useful formulation treats K as a composite:

```
K = min(K_housing, K_jobs, K_infrastructure, K_amenity)
```

The binding constraint shifts over time. Early cities are often job-constrained; mature cities are often housing- or infrastructure-constrained. When any one ceiling is hit, growth stalls even if other capacities have headroom.

### Empirical Growth Rates

Historical urban growth rates vary enormously:

| City type | Annual growth rate | Doubling time |
|-----------|--------------------|---------------|
| Rapidly industrializing (Shenzhen 1980s) | 10-15% | 5-7 years |
| Developing-world megacity (Lagos, Dhaka) | 3-5% | 15-23 years |
| Mature Western city (London, NYC) | 0.5-1.5% | 50-140 years |
| Shrinking city (Detroit, Leipzig) | -0.5 to -2% | N/A (decline) |

---

## Migration

### Push-Pull Framework

Migration is the dominant driver of urban population change in most contexts — more significant than natural increase for individual cities, even when natural increase dominates nationally. The push-pull model identifies:

**Push factors** (origin):
- Declining agricultural income, crop failure, land scarcity
- Conflict, insecurity, environmental degradation
- Lack of education and healthcare access
- Social pressure (returning migrants raise expectations)

**Pull factors** (destination):
- Higher expected wages
- Employment diversity and upward mobility
- Access to education, healthcare, cultural amenities
- Existing social networks (chain migration)

### The Harris-Todaro Model (1970)

The Harris-Todaro model formalizes the migration decision as a comparison of *expected* rather than *actual* income:

```
E(W_urban) = p × W_urban + (1 - p) × W_informal
```

| Symbol | Meaning |
|--------|---------|
| `E(W_urban)` | Expected urban income |
| `p` | Probability of formal employment = `L_formal / (L_formal + L_unemployed)` |
| `W_urban` | Formal urban wage |
| `W_informal` | Informal sector wage (often near zero or subsistence) |

**Migration equilibrium condition:** Migration ceases when:

```
E(W_urban) = W_rural
```

The key insight: rational migration can persist even with high urban unemployment, because the *expected* urban wage (wage × probability of employment) still exceeds the rural wage. This explains the paradox of growing cities with growing unemployment.

### Migration Rate Estimation

A simple operational model for net migration into a city:

```
M = α × (E(W_urban) - W_rural) / W_rural × P_rural_catchment
```

Where `α` is a responsiveness coefficient (typically 0.01-0.05 annually). Migration is proportional to the *relative* wage gap, not the absolute gap.

---

## Natural Increase

Natural increase is the difference between births and deaths:

```
NI = CBR - CDR
```

Where CBR is the crude birth rate and CDR is the crude death rate, both expressed per 1,000 population.

### Typical Rates by Development Level

| Development stage | CBR (per 1,000) | CDR (per 1,000) | NI (per 1,000) | Examples |
|-------------------|-----------------|-----------------|-----------------|----------|
| Pre-industrial | 40-50 | 35-45 | 0-10 | Historical (no modern examples) |
| Early developing | 35-45 | 10-20 | 15-30 | Niger (46 CBR), Chad, Mali |
| Mid developing | 20-35 | 6-12 | 10-25 | India, Kenya, Egypt |
| Late developing | 12-20 | 6-9 | 5-12 | Brazil, Mexico, Turkey |
| Developed | 8-14 | 9-12 | -2 to +4 | USA (11), France (11), UK (10) |
| Post-demographic | 5-9 | 10-14 | -5 to -1 | Japan (6.3), South Korea (4.4), Italy (6.7) |

Source: World Bank World Development Indicators, 2022-2024 estimates.

The global average birth rate was approximately 17.3 per 1,000 in 2024, down from 36.9 in 1950. Death rates globally sit around 7-8 per 1,000, though they rise in aging populations (Japan's CDR is ~12).

### Urban vs. Rural Fertility

Urban areas consistently show lower fertility than their national averages:
- Urban total fertility rate (TFR) is typically 0.5-1.5 children lower than rural TFR within the same country.
- Mechanisms: higher cost of child-rearing, women's labor force participation, access to contraception, smaller dwelling sizes.

---

## Age Structure

### Population Pyramids

A population pyramid plots age cohorts (typically 5-year bands) against population count, split by sex. Three archetype shapes correspond to growth regime:

| Shape | Growth regime | Median age | Example |
|-------|--------------|------------|---------|
| Expansive (wide base) | Rapid growth | 15-22 | Nigeria, Uganda |
| Stationary (column) | Stable | 30-38 | USA, France |
| Constrictive (narrow base) | Declining | 40-50 | Japan, Germany |

Cities deviate from national pyramids in characteristic ways:
- **College towns** accumulate 18-25 cohorts; older cohorts are thin.
- **Retirement communities** show bulging upper tiers, thin base.
- **Economic boomtowns** attract 25-40 working-age adults, creating a "chimney" shape.
- **Established suburbs** often show a bimodal distribution: parents (35-55) and children (5-18), with a gap in the 20-30 range.

### Dependency Ratio

The dependency ratio measures the burden on the working-age population:

```
DR = (P_0-14 + P_65+) / P_15-64 × 100
```

| Category | Typical DR | Interpretation |
|----------|-----------|----------------|
| Young population (sub-Saharan Africa) | 80-100 | Heavy youth dependency |
| Balanced (USA, France) | 50-55 | Moderate |
| Aging (Japan, Italy) | 65-70 | Heavy elderly dependency |
| Demographic dividend window | 40-50 | Maximum productive workforce share |

The "demographic dividend" — the period when the working-age share peaks — is a powerful economic accelerant. Cities in this window (much of Southeast Asia and parts of Latin America today) experience rapid GDP growth and housing demand surges.

### Aging and City Lifecycle

Cities that fail to attract young adults progressively age. The feedback loop is self-reinforcing:

1. Working-age residents leave for better opportunities elsewhere.
2. Tax base shrinks, services decline.
3. Remaining population ages, dependency ratio rises.
4. Fewer births, more deaths — natural increase turns negative.
5. Housing demand falls, property values decline, further discouraging investment.

This pattern describes the "shrinking city" phenomenon (Detroit, many former East German cities, rural Japanese municipalities). Reversing it requires breaking the feedback loop, usually through targeted investment, immigration policy, or an external economic shock (new industry, university expansion).

---

## Household Formation

### Global Trends

Household size has been declining worldwide for decades. The trend is driven by urbanization, rising incomes, later marriage, and increased rates of divorce and solo living.

| Region / Country | Avg. household size (c. 2020) |
|------------------|-------------------------------|
| Senegal | 8.4 |
| India | 4.4 |
| Malaysia | 4.6 |
| Indonesia | 3.9 |
| Brazil | 2.9 |
| USA | 2.5 |
| UK | 2.4 |
| Germany | 2.0 |
| Denmark | 1.8 |
| **Global average** | **3.4** |

Source: UN Population Division, Household Size and Composition, 2022.

### Household Composition Shift

In the United States, the transformation over six decades illustrates the broader global trajectory:

- **1960**: 85% of households were family households.
- **2020**: 65% family, 35% non-family.
- Single-person households rose from ~13% (1960) to ~29% (2022).
- In the past decade (2010-2020), 44% of US household growth came from single-person households.

The average US household shrank from 3.33 persons (1960) to 2.53 persons (2020). Urbanization accelerates this: city-center household sizes are typically 0.3-0.5 persons smaller than suburban or rural averages in the same country.

### Implications for Housing Demand

Declining household size means that population growth *understates* housing demand growth. A stable population with shrinking household size still needs more dwelling units:

```
Housing_units_needed = Population / Avg_household_size
```

A city of 100,000 at household size 3.5 needs ~28,600 units. If household size drops to 2.5 (with the same population), it needs 40,000 units — a 40% increase in required housing stock with zero population growth.

---

## Wealth and Income Stratification

### The Gini Coefficient

The Gini coefficient is the standard measure of income inequality, ranging from 0 (perfect equality) to 1 (one person holds all income):

```
G = (Σᵢ Σⱼ |yᵢ - yⱼ|) / (2 × n² × ȳ)
```

| Region / City type | Typical Gini | Interpretation |
|--------------------|-------------|----------------|
| Scandinavian cities | 0.25-0.28 | Low inequality |
| Western European cities | 0.30-0.35 | Moderate |
| US metro areas | 0.35-0.50 | Moderate-high |
| Latin American cities | 0.45-0.55 | High |
| South African cities | 0.60-0.70 | Extreme |

### Spatial Sorting

Income inequality in cities has a spatial dimension. Higher-income households sort into locations with better amenities, school quality, and lower crime — a process called spatial sorting or residential segregation by income. Key empirical patterns:

- Gini coefficients within metro areas are positively correlated with metro population (larger cities are more unequal).
- Neighborhoods tend to be more income-homogeneous than the city as a whole — local Gini is lower than metro Gini.
- Over time, US cities have become more spatially sorted: in 1970, 65% of families lived in middle-income neighborhoods; by 2012, only 40% did (Pew Research, 2015).

### Income Quintiles

A practical discretization for simulation: divide the population into five wealth tiers.

| Quintile | US income range (approx. 2023) | Share of total income | Housing preference |
|----------|-------------------------------|----------------------|-------------------|
| Q1 (lowest) | <$30,000 | ~3% | Social/subsidized housing, high-density |
| Q2 | $30,000-$55,000 | ~8% | Low-density residential, older stock |
| Q3 | $55,000-$90,000 | ~15% | Medium-density, suburban |
| Q4 | $90,000-$150,000 | ~23% | Single-family suburban, newer stock |
| Q5 (highest) | >$150,000 | ~51% | Premium locations, low-density or luxury high-rise |

---

## Demographic Transition

The Demographic Transition Model (DTM) describes the shift societies undergo from high birth and death rates to low birth and death rates as they develop economically. This is the single most robust pattern in demography, observed across every industrialized nation.

### The Five Stages

| Stage | CBR | CDR | Pop. growth | Characteristics |
|-------|-----|-----|-------------|-----------------|
| 1 — Pre-industrial | 40-50 | 40-50 | ~0 | Subsistence agriculture, high infant mortality, no modern medicine. No country remains here today. |
| 2 — Early transition | 40-50 | 15-25 | Rapid (2-3%) | Death rates fall (sanitation, vaccines, food security), birth rates remain high. Population booms. |
| 3 — Late transition | 15-25 | 8-12 | Moderate (1-2%) | Birth rates decline: women's education, urbanization, contraception access. Growth decelerates. |
| 4 — Post-transition | 10-15 | 9-12 | Low (<1%) | Both rates low and similar. Population stabilizes. Most developed countries sit here. |
| 5 — Sub-replacement | 5-10 | 10-14 | Negative | Fertility below replacement (TFR < 2.1). Population ages and shrinks without immigration. Japan, South Korea, parts of Europe. |

### Mechanism

The key mechanism is **asynchronous timing**: death rates fall first (driven by public health, which can be adopted quickly), while birth rates fall later (driven by cultural and economic shifts, which are slow). The gap between the two declines produces the population boom of Stages 2-3.

### Urban Context

Cities typically lead the national transition by one stage. A country in Stage 3 nationally may have its capital city already in Stage 4. This is because urbanization itself accelerates the drivers of fertility decline: education access, women's employment, housing costs, and contraception availability.

---

## Population Density and City Size

### Zipf's Law and Rank-Size Distribution

Zipf's Law for cities states that the population of a city is inversely proportional to its rank:

```
P(r) = P(1) / r^α
```

| Symbol | Meaning |
|--------|---------|
| `P(r)` | Population of the city ranked r-th |
| `P(1)` | Population of the largest city |
| `α` | Zipf exponent (empirically close to 1.0) |

When `α = 1`, the second city is half the size of the first, the third is one-third, and so on. Empirical fits across many national urban systems find `α` between 0.8 and 1.2, with the US at approximately 1.02 for the 135 largest metro areas (Census 2010).

The law holds best for cities above a population threshold (typically 100,000+). Below that threshold, there are "too many" small cities relative to the power-law prediction — the distribution has a heavier tail.

### Density Ranges

Population density varies by orders of magnitude depending on city form and development era:

| City type | Density (persons/hectare) | Density (persons/km²) |
|-----------|--------------------------|----------------------|
| Rural / exurban | 1-5 | 100-500 |
| Low-density suburban (US sprawl) | 10-30 | 1,000-3,000 |
| Medium-density urban (European) | 50-150 | 5,000-15,000 |
| High-density urban (Asian core) | 200-400 | 20,000-40,000 |
| Extreme (historical Kowloon Walled City) | ~12,000 | ~1,200,000 |

The global trend in established cities is *declining* average density. Between 1990 and 2015, the average density of cities worldwide fell by approximately 2% per year as cities expanded spatially faster than their populations grew (Angel et al., Lincoln Institute of Land Policy).

---

## Suburbanization and Counter-Urbanization

### The Urban-Suburban Cycle

Urban population distribution follows a cyclical pattern identified by Berry (1976) and refined by subsequent researchers:

1. **Urbanization** — Rural-to-urban migration concentrates population in the core city. Dominant in early industrialization (19th century Western cities; present-day developing-world cities).

2. **Suburbanization** — Population decentralizes from the core to surrounding suburbs. Driven by rising incomes, automobile ownership, desire for space, and (in the US) racial dynamics ("white flight"). Peak US suburbanization: 1945-1970.

3. **Counter-urbanization / Deurbanization** — Population shifts to small towns and rural areas. Observed in 1970s US and UK, attributed to congestion, crime, environmental preferences, and telecommunications enabling remote work.

4. **Re-urbanization** — Central cities regain population through gentrification, urban renewal, and lifestyle preferences of younger cohorts. Observed in many Western cities from 1990s onward.

### Drivers of Suburbanization

| Driver | Mechanism |
|--------|-----------|
| Transport technology | Automobile → commute range expands → housing market extends outward |
| Housing cost gradient | Land cheaper at periphery → families trade commute time for space |
| School quality sorting | Suburban districts perceived as higher quality → families with children exit city |
| Developer economics | Greenfield development is cheaper per unit than infill → supply response favors periphery |
| Tax and zoning policy | Suburban jurisdictions offer lower taxes, single-use zoning protects property values |

### Counter-Urbanization and Remote Work

The COVID-19 pandemic accelerated counter-urbanization trends. Between 2020 and 2023, US central-city populations grew slower than suburbs (or declined in cities like San Francisco and New York), while exurban and rural-adjacent areas gained population. Remote work reduces the pull factor of urban employment proximity, weakening the core mechanism that concentrates population.

### Van den Berg's Urbanization Cycle

Van den Berg et al. (1982) formalized the four-phase cycle as a model of functional urban regions (FUR):

| Phase | Core population | Ring population | Total FUR | Era (US) |
|-------|----------------|-----------------|-----------|----------|
| Urbanization | Growing fast | Stable/slow | Growing | 1800-1940 |
| Suburbanization | Stable/declining | Growing fast | Growing | 1945-1975 |
| Deurbanization | Declining | Stable/declining | Declining | 1970s-1980s |
| Re-urbanization | Growing again | Stable | Growing | 1990s-present |

The full cycle takes roughly 50-100 years in observed Western cities. For simulation, these phases emerge naturally from the interaction of transport costs, housing costs, and amenity preferences — they do not need to be scripted if the underlying systems are modeled correctly.

---

## Population Forecasting

### Cohort-Component Method

The cohort-component method (CCMPP) is the standard technique used by the US Census Bureau, the UN Population Division, and most national statistics agencies. It projects each age-sex cohort forward by applying age-specific rates of fertility, mortality, and migration.

**Core equation:**

```
P(x+5, t+5) = P(x, t) × S(x, t) + M(x, t)
```

| Symbol | Meaning |
|--------|---------|
| `P(x, t)` | Population of age group x at time t |
| `S(x, t)` | Survival ratio for age group x during period t to t+5 |
| `M(x, t)` | Net migration for age group x during period t to t+5 |

New births are added as the youngest cohort:

```
B(t, t+5) = Σ [P_f(x, t) × ASFR(x, t)] × SRB_adjustment
```

Where `P_f` is the female population, `ASFR` is the age-specific fertility rate, and `SRB` is the sex ratio at birth (typically ~1.05 male per female).

### Simpler Extrapolation Methods

For game simulation, simpler methods are often sufficient:

**Exponential growth:**
```
P(t) = P₀ × e^(rt)
```

**Linear growth:**
```
P(t) = P₀ + g × t
```

**Logistic growth (bounded):**
```
P(t) = K / (1 + ((K - P₀) / P₀) × e^(-rt))
```

### Forecasting Accuracy

Population forecasts are most accurate over short horizons (5-10 years) and for large populations. Common error ranges:

| Horizon | Typical error (national) | Typical error (city) |
|---------|------------------------|---------------------|
| 5 years | 1-3% | 3-8% |
| 10 years | 3-7% | 8-15% |
| 20 years | 5-15% | 15-30% |
| 50 years | 15-40% | Highly uncertain |

City-level forecasts are substantially less accurate because migration — the most volatile component — dominates city-level change, while natural increase (which is more predictable) dominates national-level change.

### Scenario-Based Projection

The UN Population Division and most national agencies produce three scenarios: low, medium, and high variants. These differ primarily in fertility assumptions (mortality and migration vary less between scenarios). The medium variant is the "most likely" projection, while low and high bound the uncertainty.

For a game simulation, this maps well to difficulty settings or player-driven policy:

| Scenario | Fertility assumption | Migration assumption | Game mapping |
|----------|---------------------|---------------------|-------------|
| Low growth | TFR stays below replacement | Net out-migration | High taxes, poor services, negative demand |
| Medium growth | TFR at or near replacement | Modest net in-migration | Balanced city management |
| High growth | TFR above replacement | Strong in-migration | Low taxes, booming economy, infrastructure strain |

---

## Application to Bitborough

### Current Mechanics

Bitborough currently models population through:

- **Citizen agents** at a 1:50 sampling ratio (`DEFAULT_SAMPLING_RATIO = 50` in `citizens.ts`). Each agent represents 50 simulated residents.
- **Fill/drain mechanics** in `density.ts` — buildings gain residents at `FILL_RATE = 0.12` and lose them at `DRAIN_RATE = 0.2` per tick based on demand and desirability.
- **Demand system** in `demand.ts` — residential demand is driven by a base rate (1.0), modified by tax rate (neutral at 7%), congestion (penalty above 0.8 average), and indirectly by citizen satisfaction.
- **Agent assignment** — each agent gets a home, seeks nearest job (industrial/commercial) and nearest commercial building via A* pathfinding. Agents track satisfaction based on employment and commerce access.

There is no lifecycle simulation (birth, aging, death), no wealth differentiation, and no explicit migration model. Population growth is purely a function of the demand signal flowing into fill rate.

### Suggested Future Mechanics

#### 1. Logistic Growth Ceiling

Replace the constant `FILL_RATE` with a demand-modulated logistic growth term:

```typescript
function fillRate(building: Building, map: GameMap): number {
  const def = BUILDING_DEFS[building.defId]
  const K = def.capacity                        // carrying capacity = building capacity
  const P = building.residents
  const baseFill = 0.12
  return baseFill * (1 - P / K)                  // decelerates as building fills
}
```

At the city level, track a composite carrying capacity:

```typescript
function cityCarryingCapacity(map: GameMap): number {
  let housing = 0, jobs = 0
  for (const b of map.buildings) {
    if (b.state !== 'active') continue
    const def = BUILDING_DEFS[b.defId]
    if (def.category === 'residential') housing += def.capacity
    else if (def.jobs > 0) jobs += def.jobs * 2.5  // job supports ~2.5 people (worker + dependents)
  }
  return Math.min(housing, jobs)
}
```

#### 2. Migration Model

Introduce a simplified Harris-Todaro migration signal. Each tick, compute expected city attractiveness and convert it to a net migration flow:

```typescript
function netMigration(map: GameMap, citizens: CitizenSummary): number {
  const jobMatchRate = 1 - citizens.unmatchedJobFraction
  const satisfaction = citizens.avgSatisfaction
  const attractiveness = jobMatchRate * 0.6 + satisfaction * 0.4
  // Migration proportional to gap between attractiveness and a baseline (0.5)
  const migrationSignal = (attractiveness - 0.5) * 0.02 * totalPopulation(map)
  return Math.round(migrationSignal)
}
```

Positive values add residents to under-capacity buildings; negative values drain residents from low-satisfaction buildings.

#### 3. Wealth Tiers

Introduce three wealth tiers (simplified from five quintiles) that map to housing preferences:

| Tier | Label | Income multiple | Housing preference | Demand sensitivity |
|------|-------|----------------|--------------------|--------------------|
| 1 | Low-income | 0.5x | High-density, cheapest available | High tax sensitivity |
| 2 | Middle-income | 1.0x | Medium-density | Moderate |
| 3 | High-income | 2.5x | Low-density or premium high-rise | Low tax sensitivity, high amenity sensitivity |

Citizen agents would carry a `wealthTier` field. Wealth tier distribution could follow a simplified Pareto distribution:

```typescript
function assignWealthTier(rng: PRNG): 1 | 2 | 3 {
  const r = rng.next()
  if (r < 0.30) return 1      // 30% low-income
  if (r < 0.75) return 2      // 45% middle-income
  return 3                     // 25% high-income
}
```

Tax sensitivity per tier:

```
taxModifier(tier) = baseTaxMod × (1.5 - tier * 0.3)
```

This makes Tier 1 (low-income) 20% more tax-sensitive and Tier 3 (high-income) 40% less tax-sensitive than the base.

#### 4. Lifecycle Simulation (Future)

A lightweight lifecycle model using the demographic transition framework:

```typescript
interface LifecycleParams {
  birthRate: number     // per 1000 population per tick-year
  deathRate: number     // per 1000 population per tick-year
  avgHouseholdSize: number
}

// Stage 4 (developed city) defaults:
const DEFAULT_LIFECYCLE: LifecycleParams = {
  birthRate: 11,        // ~US average
  deathRate: 10,
  avgHouseholdSize: 2.5,
}
```

Each tick-year, compute natural increase and apply it to the residential fill pool:

```
naturalIncrease = (birthRate - deathRate) / 1000 × totalPopulation
newHouseholdsNeeded = naturalIncrease / avgHouseholdSize
```

This would feed into the demand system as an additional residential demand signal, layered on top of the migration-based demand.

#### 5. Household Size as a Game Parameter

As the city develops, average household size could decline (modeling the real-world trend), increasing housing demand per capita:

```typescript
function avgHouseholdSize(population: number): number {
  // Starts at 3.5 (small town), declines to 2.3 (mature metro)
  return Math.max(2.3, 3.5 - population / 100_000)
}
```

This creates a natural demand amplifier: even if population growth slows, declining household size maintains pressure on the housing market — a mechanic that mirrors the real experience of growing cities.

#### Mapping Wealth Tiers to Spatial Sorting

High-income agents should prefer locations with high desirability scores (low commute, high amenity, low pollution). Low-income agents should be less selective but more tax-sensitive. The existing `computeDesirability` function in `desirability.ts` could be extended with a wealth-tier weight:

```typescript
function weightedDesirability(base: number, tier: 1 | 2 | 3): number {
  // High-income agents weight amenity more; low-income agents weight cost more
  const amenityWeight = [0.3, 0.5, 0.8][tier - 1]
  const costWeight = [0.8, 0.5, 0.2][tier - 1]
  return base * amenityWeight + (1 - base) * costWeight
}
```

Over many ticks, this produces emergent spatial sorting: wealthy agents cluster near parks and transit; low-income agents cluster in cheap, peripheral, or high-density zones. This mirrors real-world income segregation without requiring explicit zoning rules.

#### 6. Population Pyramid Effects (Advanced)

If age cohorts are eventually tracked per building or district:

- **Young population** (dependency ratio > 70): higher demand for schools, parks; lower tax revenue per capita.
- **Working-age peak** (DR < 50): "demographic dividend" — increased tax revenue, higher commercial demand.
- **Aging population** (DR > 60, elderly-heavy): higher demand for healthcare buildings, lower residential turnover.

The agent sampling ratio (1:50) keeps this tractable: 10,000 population = 200 agents. Adding an `age` field to each agent and advancing it each tick-year is computationally cheap.

---

## Cross-References

- [urban-density-gradients.md](./urban-density-gradients.md) — Clark's Law density decay; directly used in density upgrade probability. Population growth models here determine *when* density transitions trigger.
- [transit-oriented-development.md](./transit-oriented-development.md) — Transit accessibility affects carrying capacity (K_infrastructure) and drives spatial sorting of wealth tiers toward transit corridors.
- housing.md (planned) — Household formation trends determine housing unit demand independent of population growth. Wealth tiers map to housing type preferences.
- economy-and-employment.md (planned) — Employment base sets the jobs component of carrying capacity. Harris-Todaro migration model depends on job availability signals from the economy system.
- public-services.md (planned) — Service capacity (schools, hospitals, fire coverage) acts as an amenity-based carrying capacity ceiling. Age structure determines service demand profiles.

---

## Sources

### Academic Papers and Models

- Verhulst, P.-F. (1838). "Notice sur la loi que la population suit dans son accroissement." *Correspondance Mathématique et Physique*, 10, 113-121.
- Harris, J.R., & Todaro, M.P. (1970). "Migration, Unemployment and Development: A Two-Sector Analysis." *American Economic Review*, 60(1), 126-142.
- Clark, C. (1951). "Urban population densities." *Journal of the Royal Statistical Society*, Series A, 114(4), 490-496.
- Gabaix, X. (1999). "Zipf's Law for Cities: An Explanation." *Quarterly Journal of Economics*, 114(3), 739-767.
- Angel, S. et al. (2016). *Atlas of Urban Expansion*. Lincoln Institute of Land Policy.
- Notestein, F. (1945). "Population — The Long View." In *Food for the World*, ed. T. Schultz. University of Chicago Press.
- Berry, B.J.L. (1976). "The Counterurbanization Process: Urban America Since 1970." *Urbanization and Counterurbanization*, 17-30.

### Data Sources

- [World Bank — Crude Birth Rate (per 1,000 people)](https://data.worldbank.org/indicator/SP.DYN.CBRT.IN)
- [Our World in Data — Demographic Transition](https://ourworldindata.org/demographic-transition)
- [UN Population Division — Household Size and Composition](https://www.un.org/development/desa/pd/household-size-and-composition)
- [Demographia — World Urban Areas, 20th Edition (2025)](http://www.demographia.com/db-worldua.pdf)
- [US Census Bureau — One-Person Households](https://www.census.gov/library/visualizations/2019/comm/one-person-households.html)
- [OECD — Income Levels and Inequality in Metropolitan Areas](https://www.oecd.org/content/dam/oecd/en/publications/reports/2016/07/income-levels-and-inequality-in-metropolitan-areas_g17a282e/5jlwj02zz4mr-en.pdf)
- [Population Pyramids of the World](https://www.populationpyramid.net/world/2024/)

### Textbooks and Surveys

- [Logistic Population Growth — Biology LibreTexts](https://bio.libretexts.org/Bookshelves/Introductory_and_General_Biology/General_Biology_(Boundless)/45:_Population_and_Community_Ecology/45.02:_Environmental_Limits_to_Population_Growth/45.2B:_Logistic_Population_Growth)
- [Cohort Component Method — MEASURE Evaluation](https://www.measureevaluation.org/resources/training/online-courses-and-resources/non-certificate-courses-and-mini-tutorials/population-analysis-for-planners/lesson-8/lesson-8-the-cohort-component-population-projection-method)
- [Harris-Todaro Model — Wikipedia](https://en.wikipedia.org/wiki/Harris%E2%80%93Todaro_model)
- [Zipf's Law — Wikipedia](https://en.wikipedia.org/wiki/Zipf's_law)
- [Freddie Mac — Growth of Sole-Person Households](https://www.freddiemac.com/research/insight/20210826-sole-person-households)
- [Global Household Trends — Springer Nature](https://link.springer.com/article/10.1186/s41118-024-00211-6)
- [Zipf's Law and City Size Distribution — Survey](https://www.sciencedirect.com/science/article/abs/pii/S0378437117310130)
