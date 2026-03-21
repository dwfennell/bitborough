# Population and Demographics

> How urban populations grow, age, move, and stratify — models for simulating demographic dynamics.

## Table of Contents

- [Urban Population Growth Models](#urban-population-growth-models)
- [Migration](#migration)
  - [Push-Pull Framework](#push-pull-framework)
  - [The Harris-Todaro Model (1970)](#the-harris-todaro-model-1970)
  - [Migration Rate Estimation](#migration-rate-estimation)
- [Immigration and Integration Dynamics](#immigration-and-integration-dynamics)
  - [Immigration as the Engine of Urban Growth](#immigration-as-the-engine-of-urban-growth)
  - [Immigrant Community Formation and Ethnic Enclaves](#immigrant-community-formation-and-ethnic-enclaves)
  - [Economic Contributions of Immigrants](#economic-contributions-of-immigrants)
  - [Legal Status Effects](#legal-status-effects)
  - [Integration Trajectories](#integration-trajectories)
- [Return and Circular Migration](#return-and-circular-migration)
  - [Migration is Not One-Way](#migration-is-not-one-way)
  - [Seasonal and Temporary Migration](#seasonal-and-temporary-migration)
  - [Remittances](#remittances)
  - [Return Migration and Skills Transfer](#return-migration-and-skills-transfer)
- [Brain Drain and Brain Gain](#brain-drain-and-brain-gain)
  - [Selection Effects of Migration](#selection-effects-of-migration)
  - [Impact on Origin Cities and Countries](#impact-on-origin-cities-and-countries)
  - [Impact on Destination Cities](#impact-on-destination-cities)
  - [Brain Gain Mechanisms](#brain-gain-mechanisms)
- [Natural Increase](#natural-increase)
- [Age Structure](#age-structure)
- [Aging in Place and Shrinking Cities](#aging-in-place-and-shrinking-cities)
  - [The Shrinking City Phenomenon](#the-shrinking-city-phenomenon)
  - [Fiscal Death Spiral](#fiscal-death-spiral)
  - [Healthcare Demand and Workforce Mismatch](#healthcare-demand-and-workforce-mismatch)
  - [Infrastructure Over-Provisioning](#infrastructure-over-provisioning)
  - [Case Studies](#case-studies-aging)
- [Household Formation](#household-formation)
- [Wealth and Income Stratification](#wealth-and-income-stratification)
- [Gentrification-Driven Displacement](#gentrification-driven-displacement)
  - [What Gentrification Is and How It Proceeds](#what-gentrification-is-and-how-it-proceeds)
  - [Who Gets Displaced](#who-gets-displaced)
  - [Where Do the Displaced Go](#where-do-the-displaced-go)
  - [Quantitative Evidence](#quantitative-evidence)
  - [The Eviction Channel](#the-eviction-channel)
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

## Immigration and Integration Dynamics

### Immigration as the Engine of Urban Growth

In mature economies, international migration — not natural increase — is the primary driver of urban population growth. Between 2018 and 2023, immigrants accounted for 42% of population growth across America's 100 largest metro areas (American Immigration Council, 2024). In specific metros, the share was far higher: 92% for Seattle, 82% for New York, and 77% for Poughkeepsie. Across the decade, immigrant arrivals (approximately 1.25 million per year to the US alone) accounted for 50-75% of the growth of the largest metropolitan areas.

This pattern is not unique to the United States. As of 2024, 31.5% of Australia's residents were born overseas (8.6 million people), and migrants constitute 40% of the population in the greater metro areas of Sydney, Melbourne, Perth, and Brisbane. In OECD countries collectively, the foreign-born share rose from 9% to 11% between 2013 and 2023, with over 150 million foreign-born residents total. A record 6.5 million new permanent immigrants moved to OECD countries in 2023 — 28% more than in 2019.

| Country / Region | Foreign-born share (c. 2023) | Key destination cities |
|------------------|------------------------------|----------------------|
| Australia | 31.5% | Sydney (40%), Melbourne (40%) |
| Switzerland | ~30% | Zurich, Geneva |
| Canada | ~23% | Toronto (47%), Vancouver (41%) |
| Germany | ~16% | Berlin, Munich, Frankfurt |
| United States | ~14% | Miami (40%), LA (34%), NYC (37%) |
| France | ~13% | Paris (25%), Lyon |
| United Kingdom | ~14% | London (37%), Birmingham |

Without immigration, many cities in developed countries would be shrinking. For cities already below replacement fertility (TFR < 2.1), immigration is the only mechanism that prevents population decline and workforce contraction.

### Immigrant Community Formation and Ethnic Enclaves

Immigrants do not distribute evenly across a city. They cluster in specific neighborhoods through a process driven by:

1. **Chain migration** — Earlier migrants lower the information and psychic costs of migration for family and community members who follow. The resulting network produces spatially concentrated settlement (MacDonald & MacDonald, 1964). A successful co-ethnic community acts as an attractor, providing housing leads, job referrals, and cultural familiarity.

2. **Economic constraint** — New arrivals with limited capital and local knowledge are channeled into affordable housing, which concentrates in specific districts. This initial spatial clustering can persist for generations even as incomes rise.

3. **Institutional completeness** — As ethnic populations reach critical mass, they support ethnic-specific businesses, houses of worship, media, and social services. This institutional infrastructure further strengthens the pull, creating what sociologists call "ethnic enclaves" (Wilson & Portes, 1980).

**Economic effects of enclaves are mixed:**

- **Positive:** Social networks provide job information, shelter from discrimination, and entrepreneurial capital. Refugees assigned to areas with larger co-ethnic networks are more likely to find employment within five years (IZA, 2024). Enclave businesses can serve as stepping stones to broader economic participation.
- **Negative:** Wages within enclave economies are typically lower than in the broader labor market. Prolonged enclave residence can slow language acquisition and reduce intergenerational mobility if it limits children's exposure to the host-country education system. Enclaves can become "mobility traps" for low-skilled workers.

The spatial pattern that emerges — concentrated immigrant neighborhoods with high commercial vitality but lower average wages — is a key feature of real urban landscapes. Over successive generations, residential patterns typically diffuse outward (the "spatial assimilation" model), though some enclaves persist for decades when reinforced by continued inflows and institutional depth.

### Economic Contributions of Immigrants

Immigrants punch above their demographic weight in economic terms:

| Metric | Value | Source |
|--------|-------|--------|
| Share of US labor force (foreign-born) | 18.6% (29.1 million workers) | BLS, 2024 |
| Labor force participation (foreign-born vs. native-born) | 66.6% vs. 61.8% | BLS, 2024 |
| Share of business owners in top 100 US metros | 29.8% (immigrants) | AIC, 2024 |
| Business income generated by immigrant entrepreneurs | $98.2 billion (2023) | AIC, 2024 |
| Tax contributions (immigrant-led households) | $577.4 billion (2023) | AIC, 2024 |
| Spending power (immigrant-led households) | $1.5 trillion (2023) | AIC, 2024 |
| Share of nurses in top 100 US metros | 20.7% (immigrants) | AIC, 2024 |

Comparative studies find that high-immigration cities outperform low-immigration cities on several economic indicators: double the job creation rate, higher per capita incomes, lower poverty rates, and approximately 20% less crime (Hoover Institution).

### Legal Status Effects

Legal status profoundly shapes immigrants' economic integration and spatial behavior:

- **Authorized immigrants** have full labor market access, can invest in location-specific capital (homeownership, professional licensing), and exhibit residential patterns converging toward native-born norms over time.
- **Unauthorized immigrants** face wage penalties averaging 42% below citizen wages (as of 2019). Despite this, the approximately 8.5 million unauthorized workers in the US fill critical roles: 1 in 7 construction workers, 1 in 8 agricultural workers, and 1 in 14 hospital workers. In 2023, unauthorized immigrant households paid $89.8 billion in federal, state, and local taxes and held $299 billion in spending power.
- **Legal status transitions** — Legalization of unauthorized workers is estimated to add $1.2 trillion to the US economy over ten years and $184 billion annually in tax revenue, primarily through improved job matching and higher wages.

For cities, unauthorized status creates a population that contributes economically but is undercounted in census data, underserved by public systems, and spatially concentrated in areas with informal housing and employment networks. This "shadow population" affects real demand for housing and services in ways that official data miss.

### Integration Trajectories

The classic assimilation trajectory follows a three-generation arc:

1. **First generation** — Economic insertion, often in co-ethnic economy. Limited host-language proficiency. High labor force participation but low wages. Residential concentration in ethnic enclaves.
2. **Second generation** — Bilingual, higher educational attainment than parents, occupational mobility. Begin residential dispersal to broader metro area. Often the peak entrepreneurship generation.
3. **Third generation** — Near-complete linguistic assimilation. Residential patterns approximate native-born. Income convergence (though gaps persist for some origin groups due to structural discrimination).

This trajectory is not universal — it depends on reception context, human capital at arrival, co-ethnic community resources, and the legal framework of the destination country.

---

## Return and Circular Migration

### Migration is Not One-Way

A significant share of migrants eventually return to their origin country or move onward to a third destination. In the Netherlands, between 20% and 50% of immigrants do not stay permanently. Globally, circular migration — repeated movement between origin and destination — is far more common than the permanent one-way migration that dominates popular imagination.

Circular migration takes several forms:

| Type | Duration | Example | Scale |
|------|----------|---------|-------|
| Seasonal agricultural | 3-9 months | Mexican farmworkers in US, Eastern European harvest workers in Western Europe | Millions annually |
| Contract labor | 1-3 years | Gulf state construction workers (India, Philippines, Bangladesh) | ~35 million in GCC states |
| Professional rotation | 2-5 years | Multinational employees, academics, health workers | Millions globally |
| Transnational entrepreneurship | Ongoing back-and-forth | Diaspora business owners investing in home and host country | Growing, hard to quantify |

### Seasonal and Temporary Migration

Seasonal migration is the oldest form of circular movement. In the developing world, rural-to-urban seasonal migration remains massive: India's National Commission on Rural Labour estimated 10 million circular migrant workers in the 1990s; current estimates place the figure at 60-100 million. These workers move to cities during agricultural off-seasons, provide labor for construction, manufacturing, and services, and return for planting and harvest.

In developed countries, formalized seasonal worker programs manage agricultural labor flows:
- The US H-2A visa program admitted over 370,000 temporary agricultural workers in 2023.
- Canada's Seasonal Agricultural Worker Program (SAWP) has operated since 1966, bringing workers from Mexico and the Caribbean.
- Germany and other EU nations draw seasonal agricultural workers from Eastern Europe and North Africa.

These temporary populations create real demand for housing, services, and transport — but their seasonal nature means demand fluctuates, creating a pattern of surge and vacancy in affected neighborhoods and towns.

### Remittances

Remittances — money sent by migrants to family in their origin country — represent one of the largest financial flows in the global economy, exceeding both foreign direct investment (FDI) and official development assistance (ODA) to developing countries.

| Metric | Value | Year |
|--------|-------|------|
| Global remittance flows (total) | ~$905 billion | 2024 est. |
| Flows to low- and middle-income countries | $685 billion | 2024 est. |
| Top recipient: India | >$111 billion | 2022 |
| Top recipient by GDP share: Tonga | ~44% of GDP | 2023 |
| Countries where remittances exceed 20% of GDP | El Salvador, Honduras, Nepal, Lebanon, Tajikistan | 2023 |
| Number of countries where remittances > 3% of GDP | 60+ | 2024 |
| Growth rate (LMICs) | 5.8% | 2024 est. |

Source: World Bank Migration and Development Brief, 2024.

Remittances have several effects relevant to urban dynamics:

1. **Origin-side investment** — Remittances fund housing construction, small business formation, and education in origin communities. This drives local construction booms and changes settlement patterns (remittance-funded houses are often larger and more durable than local norms).
2. **Demand reduction at destination** — Migrants who remit heavily have lower local consumption, reducing their effective demand on housing and amenities in the destination city below what their income would suggest.
3. **Counter-cyclical stability** — Unlike FDI, remittances tend to increase during crises in the origin country and are relatively stable during destination-country recessions, providing a buffer to origin communities.

### Return Migration and Skills Transfer

Returning migrants carry human capital acquired abroad — technical skills, management practices, professional networks, and entrepreneurial experience. This "knowledge remittance" can be more transformative than financial remittances:

- Returnees to India and China have founded a disproportionate share of technology startups, including major companies like Sun Microsystems and Baidu.
- Return migrants in developing countries earn 10-30% wage premiums over non-migrants with similar education, reflecting skill acquisition abroad (IZA World of Labor).
- "Diaspora networks" — professional associations of emigrants — facilitate technology transfer and investment flows back to origin countries even when members do not physically return.

For the destination city, return migration creates population churn: experienced workers leave, creating vacancies that attract new migrants. The city's population may appear stable while its composition continuously turns over — a dynamic invisible to simple headcount models.

---

## Brain Drain and Brain Gain

### Selection Effects of Migration

Migration is not random. Migrants are selected on observable and unobservable characteristics — education, risk tolerance, ambition, health, and social connections. This selection produces asymmetric effects:

- **Positive selection** (typical for long-distance and international migration): Migrants tend to be younger, more educated, and more entrepreneurial than the origin population average. This drains human capital from the origin and concentrates it at the destination.
- **Negative selection** (occurs in some contexts): When migration is driven by desperation (conflict, extreme poverty), the very poorest or least skilled may migrate. This is more common for short-distance and forced migration.

The degree of selection depends on migration costs (higher costs = stronger positive selection), visa policies (skill-based systems amplify positive selection), and network effects (chain migration can reduce selection over time as entire communities follow pioneers).

### Impact on Origin Cities and Countries

Brain drain is severe and measurable for the world's poorest countries:

| Country | Skilled emigration rate | Specific losses |
|---------|----------------------|-----------------|
| Haiti | >80% of college-educated | Chronic institutional weakness |
| Jamaica | ~85% of college-educated | One of the highest rates globally |
| Nigeria | High | ~30,000 doctors and ~60,000 nurses lost per year |
| Pakistan | High | ~80% of trained doctors emigrate within 5 years of graduation |
| Philippines | Moderate-high | ~10,000 nurses per year to US, UK, Middle East |
| Ethiopia | ~35% of locally trained doctors working abroad | Concentrated in US and Europe |
| Sub-Saharan Africa (avg.) | ~20% of tertiary-educated | Higher for medical professionals |

Source: IZA World of Labor; UNCTAD; PMC/NCBI studies on health worker migration.

The effects cascade through the urban system:
1. **Service quality declines** — Hospitals, universities, and government agencies lose their most capable staff. This reduces the quality of life that attracts new residents, weakening the city's pull factor.
2. **Innovation capacity shrinks** — The creative class that drives urban economic dynamism is precisely the population most likely to emigrate.
3. **Fiscal base erodes** — High earners who leave take their tax contributions with them while the cost of their publicly funded education remains with the origin city.

### Impact on Destination Cities

For receiving cities, skilled immigration is an economic accelerant:

- Immigrants account for 36% of US patent holders (despite being 14% of the population).
- Foreign-born workers represent over 40% of STEM PhD holders in the United States.
- Immigrant entrepreneurs founded or co-founded 55% of US unicorn startups (valued at $1 billion+) as of 2022.
- High-skilled immigrants increase innovation and productivity spillovers to native-born workers in the same industry and metro area.

The concentration of global talent in a small number of "superstar cities" (New York, San Francisco, London, Singapore, Sydney) creates a self-reinforcing dynamic: talent attracts capital, capital attracts more talent, and the gap between these cities and the rest widens.

### Brain Gain Mechanisms

Recent research (Chand & Clemens, *Science*, 2023) challenges the simple brain-drain narrative by identifying "brain gain" mechanisms:

1. **Incentive effect** — The prospect of emigration to a high-wage country motivates investment in education. Many who invest ultimately do not emigrate, increasing the domestic stock of human capital. When the US expanded nursing visa access for Filipinos, enrollment in nursing schools surged — nine new nurses were trained domestically for every one who migrated.

2. **Return migration** — Emigrants who return bring enhanced skills. The net effect depends on the return rate and the skill premium acquired abroad.

3. **Diaspora channels** — Emigrants facilitate trade, FDI, and technology transfer between origin and destination countries. Indian diaspora networks were instrumental in the growth of Bangalore's IT sector.

4. **Institutional development** — Emigrants who acquire experience with stronger institutions (rule of law, democratic governance, regulatory frameworks) can influence reform in their origin countries through both return and remote engagement.

Whether brain drain or brain gain dominates depends on:
- The **origin country's training capacity** — Can education systems scale up to replace emigrants?
- The **return rate** — Higher return rates favor brain gain.
- The **emigration rate** — Beyond a threshold (~15-20% of skilled workers), drain overwhelms gain.
- The **selectivity of destination immigration policy** — Skill-based selection amplifies drain; lottery or family-based systems produce more mixed selection.

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

## Aging in Place and Shrinking Cities

### The Shrinking City Phenomenon

As of 2024, 63 countries have declining national populations, including major economies like Japan, Germany, and China. Within countries that are still growing nationally, hundreds of individual cities are shrinking. The phenomenon is concentrated in three contexts:

1. **Post-industrial cities** — Cities whose economic base collapsed (manufacturing decline, resource exhaustion). Detroit, Cleveland, St. Louis, Pittsburgh, and numerous Rust Belt cities in the US; Liverpool, Sunderland in the UK; much of the Ruhr Valley in Germany.
2. **Post-socialist cities** — Cities that lost population after the collapse of centrally planned economies. Leipzig, Halle, Chemnitz, and many former East German cities; cities across the former Soviet Union, Poland, Romania, and Bulgaria.
3. **Rural-drain cities** — Small and mid-sized cities in countries experiencing extreme metropolitan concentration. Japan's "Unipolar Concentration" toward Tokyo has hollowed out provincial cities; South Korea concentrates in Seoul; France in Paris.

The scale is substantial. UN projections estimate Japan's population will contract 16% between 2020 and 2050. The Japanese government projects continued aging and shrinking for the next century. Detroit lost over 60% of its peak population (from 1.86 million in 1950 to ~640,000 today).

### Fiscal Death Spiral

Aging populations combined with shrinking tax bases create a self-reinforcing fiscal crisis:

```
Revenue decline:
  - Fewer working-age residents → lower income tax receipts
  - Property values fall → lower property tax receipts
  - Businesses close or relocate → lower sales and business tax

Expenditure pressure:
  - Aging residents require more healthcare, social services
  - Infrastructure maintenance costs remain fixed even as users decline
  - Pension obligations to retired city workers persist and grow
  - Debt service on bonds issued during growth era continues

Result: Per-capita fiscal burden rises → services degrade → more residents leave → spiral deepens
```

**Detroit's fiscal collapse illustrates the endgame:**
- Only 6% of the taxable value of real estate in the tri-county Detroit metro area is within the city itself; 94% is in the suburbs.
- From FY2008 to FY2015, taxable values declined 27.2%, state revenue sharing payments declined 21.8%, while expenditures dropped only 8.4% — creating a structural deficit.
- Detroit filed for Chapter 9 bankruptcy in 2013, the largest municipal bankruptcy in US history ($18.5 billion in debt).

**Japan's municipal stress:**
- Small Japanese communities face slower or negative economic growth, a reduced labor force, diminished tax revenues, school closures, vacant land and buildings, and difficulty maintaining infrastructure.
- Urban shrinkage significantly deteriorates local fiscal revenues, particularly affecting building (property) taxes — the primary local revenue source for Japanese municipalities.

### Healthcare Demand and Workforce Mismatch

Aging populations create a simultaneous surge in healthcare demand and a shortage of healthcare workers:

- **Medicare spending** in the US is projected to grow at 9.7% per year through 2030, eclipsing 5% of GDP within two decades (CMS estimates).
- The US faces a projected deficit of **1.2 million registered nurses** and **121,900 physicians** by 2030.
- In shrinking cities, the mismatch is more acute: healthcare facilities lose staff to migration even as the remaining population ages and requires more care.
- Most existing housing stock is not adapted for aging residents — accessibility modifications, single-floor living, proximity to medical facilities — yet 80%+ of this housing will still be in use by 2050.

The healthcare workforce challenge creates a secondary migration dynamic: healthcare workers concentrate in cities that can pay competitive wages, further depleting the healthcare capacity of shrinking cities.

### Infrastructure Over-Provisioning

Cities built for larger populations carry infrastructure sized for their peak — water systems, sewers, roads, transit networks, school buildings — that must be maintained even as usage plummets.

**Leipzig's water system** is a striking example: Water demand dropped from 700,000 m³/day at peak to just 165,000 m³/day — the level of the mid-1940s — while the supply network built for the larger population remains in place. The city faces higher per-unit operation, maintenance, and restructuring costs for water infrastructure that serves a fraction of its designed capacity.

The same dynamic applies across all infrastructure categories:

| Infrastructure | Problem with decline | Fiscal impact |
|---------------|---------------------|---------------|
| Water/sewer | Oversized pipes, low flow reduces water quality | Higher per-unit costs, capital for rightsizing |
| Roads | Maintenance cost per user rises, underuse leads to decay | Deferred maintenance creates safety hazards |
| Schools | Enrollment drops below viable levels | Closures reduce neighborhood desirability |
| Transit | Ridership cannot support service frequency | Service cuts → car dependency → further ridership loss |
| Fire/police | Response area per station increases | Longer response times, safety concerns |

### Case Studies {#case-studies-aging}

**Japan — National-scale aging and shrinkage:**
Japan's total fertility rate of ~1.2 (2024) is far below replacement. The median age is 49, the highest of any major economy. Approximately 30% of the population is over 65. The "akiya" (vacant house) problem reflects the physical manifestation of shrinkage — an estimated 9 million vacant houses nationwide (2023), concentrated in rural and provincial cities. Despite government incentives for decentralization, Tokyo continues to grow while the rest of the country empties.

**Germany — East German shrinkage and partial recovery:**
After reunification (1990), East German cities lost 10-30% of their populations within a decade as residents migrated west. Leipzig dropped from 530,000 (1989) to 437,000 (1998). The city has since partially recovered (620,000 by 2024) through a combination of low housing costs attracting young residents, university expansion, and targeted economic development. Leipzig's experience shows that the shrinking-city spiral can be reversed, but recovery took 25+ years and required specific conditions (proximity to Western Germany, cultural amenities, university anchor).

**Detroit — Post-industrial paradigm case:**
Detroit lost 1.2 million residents over seven decades. The city now has approximately 80,000 vacant structures and 24 square miles of vacant land. Property tax reform is essential but politically difficult: assessments based on peak-era values create crushing burdens on remaining residents. The 2013 bankruptcy forced restructuring of pension obligations, reduced debt, and enabled limited reinvestment — but the population continues to decline slowly, and large areas of the city remain functionally abandoned.

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

## Gentrification-Driven Displacement

### What Gentrification Is and How It Proceeds

Gentrification is the process by which higher-income, often college-educated residents move into lower-income neighborhoods, driving up property values, rents, and the cost of goods and services. The number of gentrifying US urban neighborhoods increased from 246 during the 1970s to 1,807 in the 2010s, and approximately 15% of urban neighborhoods now show indications of gentrification (NCRC, 2023).

The process typically follows a sequence:

1. **Pioneer phase** — Artists, students, and young professionals discover affordable space in a disinvested neighborhood. Initial investment is small-scale (cafe, gallery, studio conversion).
2. **Transition phase** — Media attention and word-of-mouth attract higher-income residents. Property investors begin acquiring buildings. Rents rise. Existing small businesses face higher lease costs.
3. **Consolidation phase** — Large-scale development replaces or renovates existing housing stock. National chain retailers enter. The neighborhood's demographic and commercial character has fundamentally shifted.
4. **Stabilization** — The neighborhood has fully transitioned to a higher-income profile. Original residents and businesses have been largely replaced.

### Who Gets Displaced

Displacement is not uniform. The populations most vulnerable to displacement are:

- **Low-income renters** — Renters have no equity buffer and face direct exposure to rent increases. In gentrifying neighborhoods, rents can increase 40-50% in a decade (e.g., median rents in gentrifying D.C. neighborhoods rose 40% from 2010-2020). Low-income New Yorkers typically pay more than 30% of income on rent; between 2000 and 2014, median household income rose 25% while rents increased 53%.
- **Black and Latino residents** — Gentrification has disproportionately affected communities of color. Between 1980 and 2020, gentrification impacted 523 majority-Black neighborhoods, with 155 (nearly a third) undergoing full racial turnover. There are 261,000 fewer Black people living in neighborhoods that were majority-Black before gentrification began (NCRC, 2023).
- **Elderly long-term residents** — Even homeowners can be displaced through rising property taxes and the loss of neighborhood social networks and culturally specific services.
- **Small business owners** — Commercial lease increases and shifting customer demographics force out businesses that served the original population.

Oakland's experience quantifies the rent burden: low-income residents in gentrified areas face rent burdens of up to 50% of income, well above the 30% affordability threshold.

### Where Do the Displaced Go

Research on displacement destinations reveals a troubling pattern (Freeman, Hwang, Haupert & Zhang, 2024):

- Displaced residents disproportionately move to **lower-income neighborhoods** — not to neighborhoods of comparable or higher quality.
- Moves to worse-off neighborhoods **intensify poverty conditions** and inhibit economic mobility. Research from Philadelphia shows that families displaced to worse neighborhoods experience declining credit scores and long-term financial strain.
- Displaced residents lose access to the **location-specific advantages** of center-city neighborhoods: public transportation, social services, employment centers, and social networks.
- Children displaced to higher-poverty neighborhoods show **lower test scores** and **reduced adult earnings** compared to peers who remained (Chetty et al.).
- The net effect is a **spatial reshuffling of poverty** — gentrification does not eliminate poverty, it relocates and concentrates it in already-disadvantaged areas.

### Quantitative Evidence

The quantitative literature on gentrification and displacement is notably contentious:

**The "null finding" camp:** Several influential studies using large-sample outmigration data found that low-income residents in gentrifying neighborhoods do not move at higher rates than similar residents in non-gentrifying neighborhoods (Freeman, 2005; Vigdor, 2002; McKinnish et al., 2010). This suggests displacement is less widespread than commonly assumed.

**The "composition change" interpretation:** Most neighborhood-level demographic change in gentrifying areas occurs through *differential in-migration* — higher-income, often white residents move in at elevated rates — rather than elevated outmigration of incumbents. The neighborhood changes not because residents are pushed out, but because incoming residents are different from those who would have moved in absent gentrification.

**The eviction and hardship evidence:** More recent research using administrative data (eviction records, credit reports) paints a more complex picture:

| Finding | Source |
|---------|--------|
| Gentrifying neighborhoods = 13.2% of all neighborhoods, account for 11.7% of evictions | Eviction Lab |
| Non-gentrifying low-SES neighborhoods = 45.7% of all neighborhoods, account for 60%+ of evictions | Eviction Lab |
| Portland gentrifying neighborhoods: 30% rise in eviction rates | Eviction Lab |
| Displaced movers in Philadelphia show declining credit scores | Federal Reserve Bank of Philadelphia |

The nuanced conclusion: **Gentrifying neighborhoods are not where the most evictions happen** — that distinction belongs to persistently poor neighborhoods. But gentrification does increase displacement pressure at the margins, and the *consequences* of displacement from gentrifying neighborhoods are particularly damaging because they move people from improving areas to deteriorating ones.

### The Eviction Channel

Eviction is the most acute mechanism of displacement. While overall eviction rates may not spike dramatically in gentrifying neighborhoods, the character of evictions shifts:

- **No-fault evictions** increase as landlords seek to renovate units for higher-paying tenants (Ellis Act evictions in San Francisco, "renovictions" in Vancouver and Berlin).
- **Informal displacement** — Landlords allow buildings to deteriorate or harass tenants to induce voluntary departure, avoiding formal eviction proceedings. This displacement is invisible in eviction data.
- **Rent-increase displacement** — When leases expire, landlords raise rents beyond existing tenants' ability to pay. In markets without rent stabilization, this is the dominant displacement channel.

Policy responses that cities have attempted:

| Policy | Mechanism | Effectiveness |
|--------|-----------|---------------|
| Rent control / stabilization | Caps annual rent increases | Protects existing tenants; reduces mobility; may discourage new supply |
| Just-cause eviction ordinances | Limits reasons for eviction | Reduces no-fault evictions; does not address rent increases |
| Community land trusts | Removes land from speculative market | Preserves long-term affordability; slow to scale |
| Inclusionary zoning | Requires affordable units in new development | Adds some affordable supply; can slow overall development |
| Right of first refusal | Gives tenants/nonprofits priority to purchase buildings | Preserves existing affordable stock; requires capital |

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

#### 7. Immigration and Enclave Formation

Model international migration as a distinct inflow channel with clustering behavior:

```typescript
interface ImmigrantWave {
  originGroup: string          // identifier for cultural/ethnic group
  skillLevel: 'low' | 'mid' | 'high'
  arrivalRate: number          // agents per tick-year
  clusteringAffinity: number   // 0-1, how strongly they prefer co-ethnic neighbors
}

function immigrantSettlement(
  wave: ImmigrantWave,
  buildings: Building[],
  existingAgents: CitizenAgent[]
): Building | null {
  // Score buildings by: (1 - clusteringAffinity) * desirability + clusteringAffinity * coEthnicDensity
  // Immigrants with high clustering affinity concentrate in enclaves
  // Immigrants with low clustering affinity distribute like native-born residents
  const scored = buildings
    .filter(b => hasCapacity(b))
    .map(b => ({
      building: b,
      score: (1 - wave.clusteringAffinity) * desirability(b)
             + wave.clusteringAffinity * coEthnicShare(b, wave.originGroup, existingAgents)
    }))
    .sort((a, b) => b.score - a.score)
  return scored[0]?.building ?? null
}
```

Over time, this produces emergent ethnic enclaves — concentrated immigrant neighborhoods with distinct commercial character. The enclave formation mechanic would interact with the existing desirability system: enclaves initially have low desirability scores (affordable areas) but could develop cultural amenity bonuses as institutional completeness grows.

Immigrant agents could carry an `integrationProgress` field (0 to 1) that advances each tick, gradually shifting their settlement preferences from enclave-seeking to desirability-maximizing — modeling the spatial assimilation trajectory.

#### 8. Circular Migration and Remittances

Model temporary workers who occupy housing and jobs but remit a portion of income, reducing their local economic multiplier:

```typescript
interface MigrantAgent extends CitizenAgent {
  migrantType: 'permanent' | 'temporary' | 'seasonal'
  remittanceRate: number       // fraction of income sent out of city (0-0.5)
  returnProbability: number    // per tick-year probability of departure
}

// Seasonal migrants: present only during certain tick-ranges
// Temporary migrants: present for N ticks, then leave (creating churn)
// The city's apparent population stability may mask high turnover
```

Remittance outflow reduces the local commercial demand multiplier: a seasonal worker earning $X but remitting 40% generates only 0.6X in local spending. This means neighborhoods with high temporary-migrant shares show lower commercial demand per capita — a pattern the player would need to account for when zoning commercial space.

#### 9. Brain Drain / Brain Gain Events

Model skilled worker departure as a risk when city attractiveness falls below external opportunities:

```typescript
function brainDrainRisk(agent: CitizenAgent, cityAttractiveness: number): number {
  if (agent.wealthTier < 3) return 0  // only high-skill agents are at risk
  const externalPull = 0.6            // baseline attractiveness of "elsewhere"
  const gap = externalPull - cityAttractiveness
  if (gap <= 0) return 0
  return gap * 0.05                    // 5% departure probability per unit of gap
}
```

When high-income agents leave, the city loses tax revenue and innovation capacity (modeled as reduced commercial desirability). This creates the brain-drain feedback loop: declining attractiveness causes departures, which further reduce attractiveness. The player must invest in amenities and services to retain talent — or accept the transition to a different city archetype.

#### 10. Aging City Mechanics

If age tracking is implemented, model the shrinking-city fiscal spiral:

```typescript
function agingPenalty(ageDistribution: AgeDistribution): FiscalModifier {
  const elderlyShare = ageDistribution.over65 / ageDistribution.total
  const workingShare = ageDistribution.age15to64 / ageDistribution.total

  return {
    taxRevenueMultiplier: workingShare / 0.65,    // normalized: 1.0 when 65% working-age
    healthcareDemand: elderlyShare / 0.15,         // normalized: 1.0 when 15% elderly
    infrastructureCostPerCapita: 1 + (1 - ageDistribution.total / peakPopulation) * 0.5
    // Infrastructure costs rise 50% per capita when population is far below peak
  }
}
```

A city where the elderly share exceeds 25% would face simultaneously rising healthcare costs, declining tax revenue, and increasing per-capita infrastructure burden — the fiscal death spiral. The player's options mirror reality: attract young immigrants, invest in economic development to retain working-age residents, or manage decline gracefully by rightsizing infrastructure.

#### 11. Gentrification and Displacement

Gentrification emerges naturally from the wealth-tier + desirability system if implemented correctly: high-income agents moving into low-rent, high-potential-amenity neighborhoods will bid up desirability and displace low-income agents. To model displacement consequences:

```typescript
function displacementDestination(
  displaced: CitizenAgent,
  buildings: Building[]
): Building | null {
  // Displaced agents are forced to move quickly, so they accept suboptimal locations
  // They tend to end up in lower-desirability neighborhoods
  const affordable = buildings
    .filter(b => hasCapacity(b) && rentLevel(b) <= displaced.affordability)
    .sort((a, b) => rentLevel(a) - rentLevel(b))  // cheapest first, not best
  return affordable[0] ?? null
}
```

The key mechanic: displaced agents do not optimize for desirability — they optimize for cost, which systematically routes them to the least desirable available locations. Over time, this produces poverty concentration in specific districts, replicating the empirical finding that gentrification reshuffles poverty rather than eliminating it.

A "neighborhood character" or "cultural heritage" score could track how much turnover a district has experienced. Rapid turnover reduces this score, which in turn reduces the amenity bonus that attracted gentrifiers in the first place — a self-limiting dynamic observed in real cities where "authenticity" erodes as gentrification proceeds.

---

## Cross-References

- [urban-density-gradients.md](./urban-density-gradients.md) — Clark's Law density decay; directly used in density upgrade probability. Population growth models here determine *when* density transitions trigger. Gentrification dynamics affect where density transitions occur (incumbent neighborhoods vs. new development).
- [transit-oriented-development.md](./transit-oriented-development.md) — Transit accessibility affects carrying capacity (K_infrastructure) and drives spatial sorting of wealth tiers toward transit corridors. Immigrant enclaves often form near transit nodes; gentrification frequently follows transit investment.
- housing.md (planned) — Household formation trends determine housing unit demand independent of population growth. Wealth tiers map to housing type preferences. Gentrification displacement mechanics depend on rent dynamics and housing stock age/quality. Immigrant housing demand patterns differ from native-born (higher occupancy, more multi-family).
- economy-and-employment.md (planned) — Employment base sets the jobs component of carrying capacity. Harris-Todaro migration model depends on job availability signals from the economy system. Brain drain/gain dynamics affect the city's innovation and entrepreneurship capacity. Immigrant entrepreneurship creates distinct commercial corridors. Remittance outflows reduce local economic multipliers.
- public-services.md (planned) — Service capacity (schools, hospitals, fire coverage) acts as an amenity-based carrying capacity ceiling. Age structure determines service demand profiles. Aging-in-place dynamics create healthcare demand surges. Shrinking cities face infrastructure over-provisioning costs. Immigrant integration requires language services, credential recognition.

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
- MacDonald, J.S. & MacDonald, L.D. (1964). "Chain Migration, Ethnic Neighborhood Formation, and Social Networks." *Milbank Memorial Fund Quarterly*, 42(1), 82-97.
- Wilson, K.L. & Portes, A. (1980). "Immigrant Enclaves: An Analysis of the Labor Market Experiences of Cubans in Miami." *American Journal of Sociology*, 86(2), 295-319.
- Freeman, L. (2005). "Displacement or Succession? Residential Mobility in Gentrifying Neighborhoods." *Urban Affairs Review*, 40(4), 463-491.
- Freeman, L., Hwang, J., Haupert, T. & Zhang, I. (2024). "Where Do They Go? The Destinations of Residents Moving from Gentrifying Neighborhoods." *Urban Affairs Review*, 60(2).
- Vigdor, J.L. (2002). "Does Gentrification Harm the Poor?" *Brookings-Wharton Papers on Urban Affairs*, 133-182.
- McKinnish, T., Walsh, R. & White, T.K. (2010). "Who Gentrifies Low-Income Neighborhoods?" *Journal of Urban Economics*, 67(2), 180-193.
- Chand, S. & Clemens, M. (2023). "Brain drain or brain gain? Effects of high-skilled international emigration on origin countries." *Science*, 382(6670).
- Card, D. (2007). "How Immigration Affects U.S. Cities." CReAM Discussion Paper No. 11/07. University of California, Berkeley.
- Van den Berg, L., Drewett, R., Klaassen, L.H., Rossi, A. & Vijverberg, C.H.T. (1982). *Urban Europe: A Study of Growth and Decline*. Pergamon Press.

### Data Sources

- [World Bank — Crude Birth Rate (per 1,000 people)](https://data.worldbank.org/indicator/SP.DYN.CBRT.IN)
- [Our World in Data — Demographic Transition](https://ourworldindata.org/demographic-transition)
- [UN Population Division — Household Size and Composition](https://www.un.org/development/desa/pd/household-size-and-composition)
- [Demographia — World Urban Areas, 20th Edition (2025)](http://www.demographia.com/db-worldua.pdf)
- [US Census Bureau — One-Person Households](https://www.census.gov/library/visualizations/2019/comm/one-person-households.html)
- [OECD — Income Levels and Inequality in Metropolitan Areas](https://www.oecd.org/content/dam/oecd/en/publications/reports/2016/07/income-levels-and-inequality-in-metropolitan-areas_g17a282e/5jlwj02zz4mr-en.pdf)
- [Population Pyramids of the World](https://www.populationpyramid.net/world/2024/)
- [World Bank — Migration and Remittances Overview](https://www.worldbank.org/en/topic/migration/overview)
- [World Bank — Remittance Flows to LMICs, 2024](https://blogs.worldbank.org/en/peoplemove/in-2024--remittance-flows-to-low--and-middle-income-countries-ar)
- [Migration Data Portal — Urbanization and Migration](https://www.migrationdataportal.org/themes/urbanisierung-und-migration)
- [Migration Data Portal — Remittances Overview](https://www.migrationdataportal.org/themes/remittances-overview)
- [BLS — Foreign-Born Workers: Labor Force Characteristics 2024](https://www.bls.gov/news.release/pdf/forbrn.pdf)
- [OECD — International Migration Outlook 2024](https://www.oecd.org/en/publications/2024/11/international-migration-outlook-2024_c6f3e803.html)
- [UN DESA — International Migrant Stock 2024](https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2025_intlmigstock_2024_key_facts_and_figures_advance-unedited.pdf)

### Immigration, Enclaves, and Integration

- [American Immigration Council — Immigrants and the Growth of America's Largest Cities](https://www.americanimmigrationcouncil.org/report/immigrants-and-the-growth-of-americas-largest-cities/)
- [American Immigration Council — How Immigration is Shaping US Cities](https://www.americanimmigrationcouncil.org/blog/how-is-immigration-shaping-us-cities/)
- [Hoover Institution — Immigration and the Rise and Decline of American Cities](https://www.hoover.org/research/immigration-and-rise-and-decline-american-cities)
- [Brookings — New Census Data Hints at an Urban Population Revival, Assisted by Immigration](https://www.brookings.edu/articles/new-census-data-hints-at-an-urban-population-revival-assisted-by-immigration/)
- [IZA World of Labor — Ethnic Enclaves and Immigrant Economic Integration](https://wol.iza.org/articles/ethnic-enclaves-and-immigrant-economic-integration/long)
- [IZA World of Labor — Circular Migration](https://wol.iza.org/articles/circular-migration/long)

### Brain Drain and Skilled Migration

- [Chand & Clemens (2023) — Brain Drain or Brain Gain? (Science)](https://www.science.org/doi/10.1126/science.adr8861)
- [University of Michigan — Brain Drain or Brain Gain? New Evidence](https://news.umich.edu/brain-drain-or-brain-gain-new-evidence-points-to-benefits-of-skilled-migration/)
- [VoxDev — Why Brain Drain Is an Incomplete Story](https://voxdev.org/topic/migration-urbanisation/why-brain-drain-incomplete-story-migration)
- [IZA World of Labor — The Brain Drain from Developing Countries](https://wol.iza.org/articles/brain-drain-from-developing-countries/long)
- [UNCTAD — Brain Drain Undermines Progress in Least Developed Countries](https://unctad.org/press-material/brain-drain-undermines-progress-least-developed-countries-unctad-warns)
- [PMC — Brain Drain and Health Care Delivery in Developing Countries](https://pmc.ncbi.nlm.nih.gov/articles/PMC5345397/)

### Aging, Shrinking Cities, and Fiscal Stress

- [Nature — Ageing and Population Shrinking: Implications for Sustainability](https://www.nature.com/articles/s42949-021-00023-z)
- [Peter G. Peterson Foundation — How Does Aging Affect Fiscal Health?](https://www.pgpf.org/article/how-does-the-aging-of-the-population-affect-our-fiscal-health/)
- [Nature — Healthcare on the Brink: Navigating an Aging Society in the US](https://www.nature.com/articles/s41514-024-00148-2)
- [World Economic Forum — Shrinking Cities Are a Forgotten Problem](https://weforum.org/agenda/2018/03/managing-shrinking-cities-in-an-expanding-world)
- [Citizens Research Council of Michigan — Detroit's Population Decline and Property Tax](https://crcmich.org/detroits-population-decline-should-prompt-property-tax-reforms)
- [Wikipedia — Shrinking City](https://en.wikipedia.org/wiki/Shrinking_city)
- [ICMA — A Brave New Demographic World: Depopulation and Japan](https://icma.org/articles/pm-magazine/brave-new-demographic-world-depopulation-and-examples-japan)

### Gentrification and Displacement

- [Freeman, Hwang, Haupert & Zhang (2024) — Where Do They Go?](https://journals.sagepub.com/doi/10.1177/10780874231169921)
- [PMC — Beyond Gentrification: Housing Loss, Poverty, and the Geography of Displacement](https://pmc.ncbi.nlm.nih.gov/articles/PMC10789166/)
- [NCRC — Displaced By Design: Fifty Years of Gentrification](https://ncrc.org/displaced-by-design/)
- [Eviction Lab — Gentrification's Role in the Eviction Crisis](https://evictionlab.org/gentrifications-role-in-the-eviction-crisis/)
- [Urban Displacement Project — What Are Gentrification and Displacement](https://www.urbandisplacement.org/about/what-are-gentrification-and-displacement/)
- [HUD — The Consequences of Gentrification: A Focus on Residents](https://www.huduser.gov/portal/periodicals/cityscpe/vol18num3/ch2.pdf)
- [Federal Reserve Bank of Philadelphia — Gentrification and Residential Mobility](https://www.philadelphiafed.org/community-development/housing-and-neighborhoods/gentrification-research-and-practitioner-perspectives)
- [CSS NY — Gentrification, Rising Rents and the City's Changing Housing Landscape](https://www.cssny.org/news/entry/gentrification-rising-rents-and-the-citys-changing-housing-landscape)

### Textbooks and Surveys

- [Logistic Population Growth — Biology LibreTexts](https://bio.libretexts.org/Bookshelves/Introductory_and_General_Biology/General_Biology_(Boundless)/45:_Population_and_Community_Ecology/45.02:_Environmental_Limits_to_Population_Growth/45.2B:_Logistic_Population_Growth)
- [Cohort Component Method — MEASURE Evaluation](https://www.measureevaluation.org/resources/training/online-courses-and-resources/non-certificate-courses-and-mini-tutorials/population-analysis-for-planners/lesson-8/lesson-8-the-cohort-component-population-projection-method)
- [Harris-Todaro Model — Wikipedia](https://en.wikipedia.org/wiki/Harris%E2%80%93Todaro_model)
- [Zipf's Law — Wikipedia](https://en.wikipedia.org/wiki/Zipf's_law)
- [Freddie Mac — Growth of Sole-Person Households](https://www.freddiemac.com/research/insight/20210826-sole-person-households)
- [Global Household Trends — Springer Nature](https://link.springer.com/article/10.1186/s41118-024-00211-6)
- [Zipf's Law and City Size Distribution — Survey](https://www.sciencedirect.com/science/article/abs/pii/S0378437117310130)
- [IOM — World Migration Report 2024: International Remittances](https://worldmigrationreport.iom.int/what-we-do/world-migration-report-2024-chapter-2/international-remittances)
