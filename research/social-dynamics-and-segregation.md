# Social Dynamics and Segregation

> How cities sort, segregate, and stratify their populations — models of spatial inequality and social interaction.

## Table of Contents

- [Schelling Segregation Model](#schelling-segregation-model)
  - [The Tipping Model](#the-tipping-model)
  - [Threshold Dynamics](#threshold-dynamics)
  - [Key Parameters](#key-parameters)
  - [Emergent Outcomes](#emergent-outcomes)
- [Tiebout Sorting](#tiebout-sorting)
  - [Voting with Your Feet](#voting-with-your-feet)
  - [Empirical Evidence](#empirical-evidence)
  - [Implications for Inequality](#implications-for-inequality)
- [Income Segregation](#income-segregation)
  - [Trends Since the 1970s](#trends-since-the-1970s)
  - [Measurement Indexes](#measurement-indexes)
  - [Spatial Patterns](#spatial-patterns)
- [Racial Segregation](#racial-segregation)
  - [Historical Mechanisms](#historical-mechanisms)
  - [Hypersegregation](#hypersegregation)
  - [Persistence and Slow Decline](#persistence-and-slow-decline)
- [School-Based Sorting](#school-based-sorting)
  - [School Quality Drives Residential Choice](#school-quality-drives-residential-choice)
  - [District Boundaries as Segregation Lines](#district-boundaries-as-segregation-lines)
  - [Capitalization into Property Values](#capitalization-into-property-values)
- [Neighborhood Effects](#neighborhood-effects)
  - [The Opportunity Atlas](#the-opportunity-atlas)
  - [Peer Effects](#peer-effects)
  - [Social Capital and Upward Mobility](#social-capital-and-upward-mobility)
- [Social Networks and Community](#social-networks-and-community)
  - [Granovetter's Weak Ties](#granovetters-weak-ties)
  - [Urban Form and Social Connection](#urban-form-and-social-connection)
  - [Loneliness and Isolation](#loneliness-and-isolation)
- [Gentrification as Social Dynamics](#gentrification-as-social-dynamics)
  - [Who Moves In](#who-moves-in)
  - [Who Moves Out](#who-moves-out)
  - [Cultural vs Physical Displacement](#cultural-vs-physical-displacement)
- [Crime and Social Disorder](#crime-and-social-disorder)
  - [Broken Windows Theory (Contested)](#broken-windows-theory-contested)
  - [Collective Efficacy](#collective-efficacy)
  - [Spatial Clustering of Crime](#spatial-clustering-of-crime)
- [Social Cohesion and Trust](#social-cohesion-and-trust)
  - [Putnam's Social Capital Research](#putnams-social-capital-research)
  - [The Diversity-Trust Tension](#the-diversity-trust-tension)
  - [Neighborhood Stability and Cohesion](#neighborhood-stability-and-cohesion)
- [Environmental Justice](#environmental-justice)
  - [Pollution Exposure by Race and Income](#pollution-exposure-by-race-and-income)
  - [Facility Siting](#facility-siting)
  - [Cumulative Impact Assessment](#cumulative-impact-assessment)
- [Policy Tools for Integration](#policy-tools-for-integration)
  - [Inclusionary Zoning](#inclusionary-zoning)
  - [Mobility Vouchers](#mobility-vouchers)
  - [School Integration](#school-integration)
  - [Community Land Trusts](#community-land-trusts)
- [Application to Bitborough](#application-to-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

---

## Schelling Segregation Model

### The Tipping Model

Thomas Schelling introduced his spatial segregation model in 1971, demonstrating one of the most powerful results in social science: mild individual preferences for same-group neighbors produce extreme collective segregation. The model is purely spatial and agent-based, making it directly applicable to tile-grid city simulations.

Agents of two types occupy cells on a grid with some fraction vacant. Each evaluates its Moore neighborhood (eight surrounding cells) and relocates if the fraction of same-type neighbors falls below a threshold F.

The critical insight is the **tipping point**. An integrated random pattern remains stable when F is below roughly 1/3. Once F reaches this critical value, the system converges rapidly toward macro-segregation — agents content with a 65% different-type neighborhood collectively produce 90%+ same-type neighborhoods.

### Threshold Dynamics

The satisfaction function for an agent at position (x, y) is binary in the basic model:

```
satisfied(agent) = (same_type_neighbors / total_neighbors) >= F
```

| Parameter | Symbol | Typical Range | Effect |
|-----------|--------|---------------|--------|
| Tolerance threshold | F | 0.0 - 1.0 | Fraction of same-type neighbors required for satisfaction |
| Grid size | N x N | 20x20 to 100x100 | Larger grids show more realistic patterns |
| Vacancy rate | v | 0.05 - 0.30 | Higher vacancy enables faster sorting |
| Population ratio | B/R | 0.3 - 0.7 | Asymmetry amplifies minority displacement |
| Neighborhood radius | r | 1 - 5 cells | Larger radius smooths but slows dynamics |

When unsatisfied, agents relocate to a vacant cell meeting their threshold. The system iterates until stable. Card, Mas, and Rothstein (2008) provided empirical validation: real neighborhoods exceeding a city-specific tipping point (typically 5-20% non-white) experienced accelerated white flight, confirming that Schelling's abstract model captures real demographic transitions.

### Key Parameters

Extended versions of the Schelling model introduce additional parameters that matter for simulation design:

| Extension | Parameter | Description |
|-----------|-----------|-------------|
| Heterogeneous thresholds | F_i per agent | Agents have different tolerance levels drawn from a distribution |
| Utility gradient | U(f) = f^alpha | Agents prefer more same-type neighbors (not just above/below threshold) |
| Moving friction | p_move | Probability an unsatisfied agent actually moves (< 1.0 = inertia) |
| Satisfied movers | r | Fraction of satisfied agents who randomly relocate anyway |
| Multiple groups | k > 2 | More than two group types increases segregation complexity |

Gauvin et al. (2009) showed that at high density with few vacancies, even low F values can produce segregation because agents cannot escape local imbalances.

### Emergent Outcomes

Depending on parameters, three stable outcomes emerge:

1. **Integration** — F low enough, vacancies distributed, random initial state persists
2. **Segregation** — Large same-type clusters through cascading relocations
3. **Takeover** — One group dominates, minority pushed to edges (asymmetric ratios + high F)

The integration-to-segregation transition is a sharp phase transition, not gradual — a narrow parameter range where small interventions could prevent large-scale segregation.

---

## Tiebout Sorting

### Voting with Your Feet

Charles Tiebout proposed in 1956 that local public goods provision has a market-like solution. When multiple municipalities within a metropolitan area each offer different bundles of public services at different tax rates, households "vote with their feet" by moving to the jurisdiction that best matches their preferences. In equilibrium, each jurisdiction contains households with similar preferences, and the provision of local public goods is efficient.

Key assumptions and their validity:

| Assumption | Real-World Validity |
|------------|-------------------|
| Perfect mobility | Partial; moving costs limit this |
| Full information | Partial; school ratings and tax rates are visible |
| Many jurisdictions | Valid in fragmented metros (St. Louis: 90+ municipalities) |
| No spillovers | Weak; pollution, crime, traffic cross boundaries |
| No scale economies | Weak; some services have large fixed costs |

### Empirical Evidence

Banzhaf and Walsh (2008) provided strong support using environmental quality as a natural experiment: when polluting facilities opened, higher-income households moved away while lower-income households moved in, with sorting detectable within a few years. Gramlich and Rubinfeld (1982) found greater within-jurisdiction preference homogeneity in metros with more jurisdictions, consistent with Tiebout's prediction.

### Implications for Inequality

Tiebout sorting creates a self-reinforcing cycle of spatial inequality:

```
High-income residents cluster
  -> High property values -> High tax revenue per capita
  -> Excellent schools and services
  -> Higher desirability -> More high-income in-migration
  -> Property values rise further
```

The mirror image is the fiscal death spiral (see municipal-finance.md). This explains why metros with more jurisdictional fragmentation have higher income segregation.

---

## Income Segregation

### Trends Since the 1970s

Income segregation in the United States has increased substantially since 1970, with the trend accelerating in the 2000s. Research by Sean Reardon and Kendra Bischoff (2011) documented this rise using Census data across all US metropolitan areas.

| Decade | Families in Poor or Affluent Neighborhoods (change in pct. points) | Middle-Class Neighborhood Share |
|--------|--------------------------------------------------------------------|-------------------------------|
| 1970 baseline | — | 66% |
| 1970-1980 | +4.1 | Declining |
| 1980-1990 | +4.6 | Declining |
| 1990-2000 | +4.2 | Declining |
| 2000-2009 | +5.1 (fastest decade) | 43% by 2007 |
| 2010-2020 | Continued increase, especially in Sun Belt metros | ~40% estimated |

The disappearance of middle-class neighborhoods is the defining trend: two-thirds of families lived in middle-income neighborhoods in 1970; fewer than half did by 2007. Among Black families, income segregation grew more than three times faster than among white families in the 1970s-1980s, reflecting compounding racial and economic sorting.

### Measurement Indexes

Researchers use several indexes to quantify segregation, each capturing a different dimension:

| Index | What It Measures | Range | Interpretation |
|-------|-----------------|-------|---------------|
| **Dissimilarity Index (D)** | Evenness — share of one group that would need to move for even distribution | 0-1 | 0 = perfect integration, >0.6 = high segregation |
| **Isolation Index (xPx*)** | Exposure — probability a group member's neighbor is same group | 0-1 | Higher = more isolated from other groups |
| **Information Theory Index (H)** | Multi-group evenness — entropy-based, handles multiple income bins | 0-1 | 0 = maximum diversity in all areas |
| **Neighborhood Sorting Index (NSI)** | Ratio of between-neighborhood to total income variance | 0-1 | Higher = more income sorting across neighborhoods |
| **Gini Coefficient (spatial)** | Concentration of one group relative to area | 0-1 | Higher = more spatially concentrated |

The Dissimilarity Index between affluent (top quintile) and poor (bottom quintile) families rose from 0.29 in 1970 to 0.43 in 1990. By 2010, values above 0.50 were common in large metros.

### Spatial Patterns

Consistent spatial patterns across US metros:

- **Core-periphery gradient**: Poverty in inner cities/inner-ring suburbs; affluence in outer suburbs (partially reversing in "superstar" cities where gentrification pushes poverty outward)
- **Sectoral wedges**: High-income corridors along waterfronts, highways, and good school districts
- **Clustered poverty**: Poor neighborhoods cluster more than affluent ones, creating large contiguous disadvantaged zones
- **Edge city sorting**: Employment subcenters generate their own income gradients

In 1970, only 14% of poor families lived in predominantly poor areas. By 1990, this had doubled to 28%.

---

## Racial Segregation

### Historical Mechanisms

US racial segregation was constructed through deliberate policy and coordinated private action. Primary mechanisms:

**Redlining (1934-1968).** The FHA systematically refused to insure mortgages in or near Black neighborhoods. The HOLC created "residential security maps" grading neighborhoods A through D, with D ("hazardous," red) assigned to areas with Black residents, cutting off credit and investment from entire communities. FHA staff concluded that "no loan could be economically sound if the property was located in a neighborhood that was or could become populated by Black people."

**Restrictive Covenants (1910s-1948).** Contractual agreements attached to property deeds prohibited sale or rental to non-white buyers. They proliferated after Buchanan v. Warley (1917) struck down municipal segregation ordinances, remained enforceable until Shelley v. Kraemer (1948), and were not made illegal until the Fair Housing Act of 1968.

**Racial Steering.** Real estate agents steered Black homebuyers toward Black neighborhoods and white buyers away from them. HUD audit studies from the 1970s through the 2010s consistently detect steering, though its prevalence has declined.

**Urban Renewal and Highway Construction (1950s-1970s).** Federal programs disproportionately demolished Black neighborhoods, displacing hundreds of thousands while creating physical barriers between Black and white areas.

**Exclusionary Zoning.** Minimum lot sizes, single-family-only zoning, and multifamily restrictions in suburbs effectively excluded low-income and Black households. The Mt. Laurel decisions in New Jersey (1975, 1983) were landmark challenges to this practice.

### Hypersegregation

Massey and Denton (1989) defined **hypersegregation** as extreme segregation along four or more of five geographic dimensions simultaneously:

| Dimension | Measure | What It Captures |
|-----------|---------|-----------------|
| **Evenness** | Dissimilarity Index | Whether group share in each tract matches metro share |
| **Exposure** | Isolation Index | Probability of contact between groups |
| **Clustering** | Spatial Proximity Index | Whether minority tracts are contiguous or scattered |
| **Centralization** | Centralization Index | Whether minorities are confined to the urban core |
| **Concentration** | Relative Concentration Index | Physical area occupied per group member |

In *American Apartheid* (1993), Massey and Denton documented that Black Americans experienced residential segregation unmatched by any other group in any country. Using 1980 Census data, they identified ten hypersegregated metros: Baltimore, Chicago, Cleveland, Detroit, Gary, Los Angeles, Milwaukee, Newark, Philadelphia, and St. Louis.

By 2010, the list had evolved but not shortened. Midwest manufacturing centers (Chicago, Cleveland, Detroit, Flint, St. Louis) remained hypersegregated on all five dimensions, joined by Birmingham and Baltimore. Additional areas including New York, Boston, and Philadelphia were hypersegregated on four dimensions.

### Persistence and Slow Decline

Black-white D peaked above 0.80 around 1960-1970 and has declined slowly to ~0.55-0.60 by 2020. At this rate, integration would take another century. Hispanic-Asian segregation is moderate (D ~ 0.40-0.50) and partly voluntary (ethnic enclaves), while Black segregation has been overwhelmingly imposed.

---

## School-Based Sorting

### School Quality Drives Residential Choice

School quality is one of the strongest drivers of residential location decisions, even for households without school-aged children, because perceived school quality capitalizes into home values. Families observe test scores (which largely reflect parental income, not instructional quality), choose neighborhoods with "good" schools, bid up housing prices, and exclude lower-income families. The concentration of affluent families further improves test scores, confirming the initial perception in a self-reinforcing loop.

### District Boundaries as Segregation Lines

Residential segregation accounts for approximately 76% of school segregation in metropolitan areas, and between-district segregation accounts for two-thirds of total school segregation — making district boundaries the primary sorting mechanism.

Many boundaries trace to historical segregation: research links unequal school boundaries to 1930s HOLC redlining maps. District secessions worsen the pattern — when affluent areas break away, they take their tax base and leave the remaining district with fewer resources and more concentrated poverty.

### Capitalization into Property Values

Boundary discontinuity studies find a one-standard-deviation improvement in school quality is associated with a 3-7% house price increase. However, Black et al. (2005) found the true impact is roughly one-quarter of naive cross-sectional estimates, because boundaries also correlate with other neighborhood characteristics.

---

## Neighborhood Effects

### The Opportunity Atlas

Chetty, Friedman, Hendren et al. constructed the Opportunity Atlas using anonymized tax records covering 20 million Americans, mapping children's outcomes in adulthood for nearly 80,000 neighborhoods by parental income, race, and gender. Key findings:

| Finding | Magnitude |
|---------|-----------|
| Standard deviation of mean income at age 35 across tracts (for children of parents at 25th percentile) | $5,000 |
| Share of cross-neighborhood outcome variation that is causal | ~60% |
| Lifetime earnings gain from moving to an above-average tract (low-income family) | ~$200,000 |
| Predictive power of tracts 1 mile away (conditional on own tract) | Near zero |

The granularity finding is critical for simulation: tracts one mile away have essentially no predictive power conditional on the child's own tract, implying effects operate at block level. The Moving to Opportunity experiment provided causal confirmation: children who moved to lower-poverty neighborhoods before age 13 earned 31% more as adults.

### Peer Effects

Neighborhood peer effects operate through multiple channels:

- **Role model effects**: Children's aspirations shaped by observable adults; fewer professional role models in high-poverty areas
- **Norm transmission**: Behavioral norms propagate through peer networks; Wilson (1987) argued the departure of middle-class Black families removed normative infrastructure
- **Information networks**: Job leads, college knowledge, and financial literacy flow through social networks; segregation restricts access
- **Collective socialization**: Density of employed, educated adults affects informal supervision of youth

### Social Capital and Upward Mobility

Chetty, Jackson, et al. (2022) used Facebook data covering 72 million Americans to show that **economic connectedness** — the share of high-income individuals in a person's social network — is the strongest predictor of upward mobility. When segregation separates income groups geographically, cross-class ties become rare and the information that facilitates mobility fails to transmit.

---

## Social Networks and Community

### Granovetter's Weak Ties

Granovetter's 1973 paper argued that **acquaintances (weak ties) are more valuable than close friends (strong ties) for accessing novel information**, because acquaintances bridge otherwise disconnected social clusters. Most job-seekers who found employment through personal contacts used weak ties.

The spatial implication: dense, mixed-use neighborhoods generate more weak ties through daily-routine encounters (commuting, shopping, park use) than homogeneous suburbs. Jane Jacobs described this as the "ballet of the sidewalk" (1961), arguing that casual public contact in walkable neighborhoods is the foundation of urban social capital.

### Urban Form and Social Connection

Research on urban form and social connectivity reveals consistent patterns:

| Urban Form Feature | Effect on Social Ties |
|-------------------|----------------------|
| Walkability | More neighborhood weak ties, more casual encounters |
| Front porches / stoops | Higher rates of neighbor interaction |
| Cul-de-sacs | Stronger within-group bonds, fewer bridging ties |
| Mixed-use development | Cross-class encounters through shared commercial spaces |
| High-rise towers | Fewer neighbor interactions than low-rise, despite density |
| Third places (cafes, barber shops, libraries) | Critical infrastructure for weak-tie formation |
| Gated communities | Strong internal bonds, near-zero bridging ties |

Jan Gehl's research on Copenhagen demonstrated that pedestrian-scale urban design dramatically increases the duration and frequency of casual social contact. Streets designed for cars produce almost no social interaction among residents, while shared streets and pedestrian zones generate sustained encounters.

### Loneliness and Isolation

The US Surgeon General's 2023 advisory identified social disconnection as a health risk comparable to smoking 15 cigarettes daily. Suburban sprawl, car-dependent design, and disappearing third places all contribute. Residents of concentrated-poverty neighborhoods report lower trust, fewer interactions, and more isolation than mixed-income neighborhood residents, even controlling for individual characteristics.

---

## Gentrification as Social Dynamics

### Who Moves In

Gentrification involves an influx of higher-income, higher-education residents (in the US context, disproportionately white) into previously low-income, often minority neighborhoods. Freeman (2005) documented a surge in white movement into historically Black neighborhoods after 2000. Early-stage gentrifiers (artists, students) differ from later-stage gentrifiers (professionals, families) in their economic impact and relationship to existing residents.

### Who Moves Out

The empirical evidence on displacement is more contested than the popular narrative suggests. Several studies (Freeman 2005, Vigdor 2002, McKinnish et al. 2010) found no significantly higher mobility rates in gentrifying vs. non-gentrifying neighborhoods. However, this is complicated by selection effects: residents who remain may do so because they cannot afford to move. When displacement does occur:

| Characteristic | Finding |
|---------------|---------|
| Involuntary movers | ~25% of all movers in gentrifying neighborhoods |
| Demographics of displaced | Disproportionately Black, elderly, poor |
| Displacement probability | Poor households ~2x more likely than non-poor |
| Destination | Lower-income neighborhoods, further from economic cores |
| Mechanism | Rent increases, eviction, building conversion/demolition |

The NCRC (2019) found that in 1,049 gentrifying Census tracts, displacement was concentrated among Black residents, with significant Black population loss even when aggregate mobility rates appeared modest.

### Cultural vs Physical Displacement

Marcuse (1985) distinguished four types of displacement:

1. **Direct displacement (physical)**: Forced to move by rent increase, eviction, or demolition.
2. **Exclusionary displacement**: Cannot move into a neighborhood one previously could have afforded.
3. **Displacement pressure**: Loss of familiar businesses, social networks, and cultural institutions.
4. **Cultural displacement**: Neighborhood character changes such that long-term residents feel alienated without moving.

Cultural displacement operates through the destruction of social capital rather than housing costs alone. When the businesses, churches, and community organizations that serve existing residents are replaced by those serving newcomers, the neighborhood becomes unrecognizable to its long-term inhabitants.

---

## Crime and Social Disorder

### Broken Windows Theory (Contested)

Wilson and Kelling (1982) proposed that visible disorder (broken windows, graffiti) signals absent social control, emboldening criminals. The theory drove NYC's "quality of life" policing and zero-tolerance approaches nationwide. The evidence does not support the causal claim:

| Critique | Source | Finding |
|----------|--------|---------|
| No causal link between disorder and crime | Harcourt & Ludwig (2006) | Five-city social experiment found no support for disorder-crime causation |
| Disorder is confounded with poverty | Sampson & Raudenbush (1999) | Perceived disorder reflects neighborhood racial composition more than actual physical conditions |
| Neighborhood effects explain the correlation | O'Brien et al. (2019) | Northeastern researchers found disorder does not cause law-breaking or neighborhood decline |
| Biased enforcement | Multiple studies | Officer discretion in defining "disorder" enables racial profiling |

For game design: disorder is a *symptom* of weak social control, not a *cause* of crime.

### Collective Efficacy

Sampson, Raudenbush, and Earls (1997) proposed **collective efficacy** — social cohesion (mutual trust) combined with informal social control (willingness to intervene for the common good). Their study of 8,782 residents across 343 Chicago neighborhoods found:

- Neighborhoods with high collective efficacy had **40% lower violent crime rates** than those with low collective efficacy, controlling for concentrated disadvantage, residential instability, and individual characteristics.
- Collective efficacy **mediated** the relationship between concentrated disadvantage and violence. That is, disadvantaged neighborhoods had higher crime primarily because disadvantage eroded collective efficacy, not because poverty itself caused crime.
- Residential stability and homeownership were the strongest predictors of collective efficacy, because long-term residents invest in neighborhood social networks.

Subsequent research found neighborhoods with high collective efficacy also maintain their physical environment better, preventing abandoned buildings — the "broken windows" Sampson argues are consequences, not causes, of weak social organization.

### Spatial Clustering of Crime

Crime concentrates in space far more than population:

- **Law of Crime Concentration (Weisburd 2015)**: ~50% of crime occurs in just 4-5% of street segments, stable over decades
- **Hot spots**: Crime clusters at micro-geographic levels (intersections, blocks), not neighborhoods
- **Temporal stability**: Hot spots reflect stable environmental features, not transient conditions
- **Limited spillover**: Targeted policing of hot spots does not significantly displace crime to nearby areas

For simulation, crime should emerge from land use, population density, collective efficacy, and policing coverage — not spread like contagion.

---

## Social Cohesion and Trust

### Putnam's Social Capital Research

Putnam's *Bowling Alone* (2000) documented decades of declining American civic participation — voting, club membership, church attendance, dinner parties — across virtually every dimension. He distinguished two forms of social capital:

| Type | Definition | Examples | Effect |
|------|-----------|----------|--------|
| **Bonding** social capital | Ties within homogeneous groups | Family, ethnic associations, church groups | Provides mutual aid, emotional support; can be insular |
| **Bridging** social capital | Ties across groups | Cross-class friendships, diverse civic organizations | Provides information, opportunity, broader trust |

Bonding capital is essential for community resilience but insufficient for upward mobility. Bridging capital is what connects individuals to opportunity and what Granovetter's weak ties provide. Segregation tends to increase bonding capital (everyone knows their neighbors) while destroying bridging capital (nobody knows people outside their group).

### The Diversity-Trust Tension

Putnam's most controversial finding (2007): in a study of 41 US communities, residents of more diverse neighborhoods reported lower trust in neighbors (about half the level of homogeneous settings), lower political participation, less charitable giving, fewer close friends, and more television watching. The "hunkering down" applied to all residents — in diverse settings, white residents trusted other whites less, and minorities trusted other minorities less.

However, Putnam emphasized that long-run diversity effects are positive — more creativity and economic dynamism. Short-run costs can be mitigated by institutions that create shared identities across group lines (schools, sports leagues, national service).

### Neighborhood Stability and Cohesion

Residential turnover is the primary destroyer of neighborhood social capital. Sampson's Chicago research found that high-mobility neighborhoods had lower collective efficacy regardless of poverty or racial composition. Building trust takes time; when turnover is high, social capital investments are constantly lost.

This creates a critical feedback loop for simulation:

```
High residential stability
  -> Social networks develop -> Collective efficacy rises
  -> Crime falls -> Desirability rises
  -> Property values rise -> Stability reinforced

vs.

High residential turnover
  -> Social networks disrupted -> Collective efficacy falls
  -> Crime rises -> Desirability falls
  -> Lower-income in-movers -> Turnover continues
```

---

## Environmental Justice

### Pollution Exposure by Race and Income

Minority and low-income communities bear disproportionate pollution exposure — a pattern consistent across methodologies, scales, and time periods.

| Finding | Source | Data |
|---------|--------|------|
| Race is the strongest predictor of hazardous waste facility location | UCC Commission for Racial Justice (1987) | National study of all commercial hazardous waste facilities |
| 3 of 4 hazardous waste landfills in SE states were in Black/Latino communities | US GAO (1983) | Eight southeastern states |
| People of color face 38% higher NO2 exposure than whites | Clark et al. (2014) | National air quality data |
| Black individuals face 54% greater health burden from particulate pollution | US EPA (2018) | Facility emissions data |
| Low-income whites are exposed to less pollution than highest-income minorities | Multiple studies | National pollution and demographic data |

The last finding is key: even the wealthiest minority communities face more pollution than low-income white communities, demonstrating that racial segregation, not just poverty, drives environmental injustice.

### Facility Siting

Facility siting follows a consistent pattern: initial placement in low-income minority neighborhoods, followed by demographic sorting that reinforces the pattern. Banzhaf and Walsh (2008) showed that facility openings cause higher-income residents to leave and lower-income residents to move in, further depressing property values and attracting additional unwanted land uses.

Bullard's foundational work documented how corporations, regulatory agencies, and zoning boards targeted communities of color for landfills, incinerators, diesel garages, chemical plants, refineries, and CAFOs. The mechanism is political power asymmetry: communities with fewer resources and less political representation are chosen because they cannot effectively resist.

### Cumulative Impact Assessment

Traditional regulation evaluates facilities one at a time. Cumulative impact assessment recognizes that communities near multiple facilities face aggregate exposure far more harmful than any single source.

California's CalEnviroScreen is the leading model, scoring Census tracts on pollution burden (ozone, PM2.5, diesel particulates, toxic releases, hazardous waste) and population vulnerability (asthma rates, poverty, unemployment, housing burden, education). The composite score identifies communities with both high pollution and high vulnerability, preventing the error of siting new facilities in already-overburdened areas.

---

## Policy Tools for Integration

### Inclusionary Zoning

Inclusionary zoning (IZ) requires or incentivizes developers to include affordable units in new residential developments, typically 10-20% of units at below-market rents. As of 2023, hundreds of US jurisdictions have IZ policies, with notable examples in Montgomery County (MD), New York City, San Francisco, and Denver.

Effectiveness findings:

| Dimension | Finding |
|-----------|---------|
| Unit production | Modest; IZ typically produces 1-5% of affordable housing stock |
| Racial integration | Tracts with IZ units become measurably more racially integrated |
| School access | IZ units tend to be in attendance zones of slightly higher-performing schools |
| Impact on supply | Contested; some studies find IZ reduces total construction, others find no effect with density bonuses |
| Long-term affordability | Depends on covenant length; 30-year covenants are common but not permanent |

The Montgomery County, MD program is the most studied. Research found that children in IZ units who attended integrated, low-poverty schools outperformed peers in school-based interventions, suggesting that housing-based integration may be more effective than school-based programs alone.

### Mobility Vouchers

Housing mobility programs provide vouchers and counseling to help low-income families move to higher-opportunity neighborhoods. Long-term findings from the Moving to Opportunity (MTO) experiment (five cities, starting 1994) and the Creating Moves to Opportunity (CMTO) pilot:

| Program | Finding |
|---------|---------|
| MTO | Children who moved before age 13 earned 31% more as adults |
| MTO | Movers had lower rates of obesity, diabetes, and psychological distress |
| MTO | Adults who moved reported improved safety and life satisfaction |
| CMTO | With active counseling and landlord engagement, 54% of families moved to high-opportunity areas (vs. 14% control) |

The CMTO finding is critical: vouchers alone are insufficient. Without active counseling and landlord engagement, most families use vouchers in neighborhoods similar to where they started.

### School Integration

School integration tools include controlled choice (rank-based assignments balancing integration targets), magnet schools, inter-district transfers, and weighted student funding. Evidence consistently shows integration improves outcomes for disadvantaged students without harming advantaged ones, while resegregation since the 1990s has widened achievement gaps.

### Community Land Trusts

Community land trusts (CLTs) are nonprofits that acquire land, retain permanent ownership, and lease it to homeowners or developers for affordable housing. By separating land from building ownership, CLTs remove the speculative component and maintain affordability in perpetuity. As of 2023, 313 CLTs hold more than 40,000 units in the US, with 60% of residents reporting improved economic security (2021 survey). CLTs are particularly relevant in gentrifying neighborhoods as permanent affordability anchors that cannot be eroded by rising land values.

---

## Application to Bitborough

### Current Mechanics

Current relevant systems:

- **Citizen satisfaction** (`citizens.ts`): Agents track `satisfaction` from employment/commercial access and commute. No wealth differentiation.
- **Desirability** (`desirability.ts`): Per-tile 0-1 scores from crime, fire coverage, parks, pollution. No social factors.
- **Crime** (`crime.ts`): Micropolis-derived formula; base crime inversely related to land value, reduced by police. No collective efficacy.
- **Density** (`density.ts`): Buildings fill/drain at fixed rates by demand and desirability. No resident-type differentiation.

### Proposed: Wealth Tiers for Citizens

Extend the `Citizen` interface with a `wealthTier` field and differentiate behavior:

```
WealthTier = 1 (Low) | 2 (Middle) | 3 (High)

Distribution (new citizens):
  P(tier=1) = 0.30
  P(tier=2) = 0.45
  P(tier=3) = 0.25
```

Each tier has different sensitivities to neighborhood attributes:

| Factor | Tier 1 (Low) Weight | Tier 2 (Mid) Weight | Tier 3 (High) Weight |
|--------|---------------------|---------------------|----------------------|
| Tax rate | 1.5 | 1.0 | 0.6 |
| Crime level | 0.8 | 1.0 | 1.4 |
| Pollution | 0.7 | 1.0 | 1.5 |
| Park access | 0.5 | 1.0 | 1.3 |
| School quality* | 0.6 | 1.2 | 1.5 |
| Commute length | 1.3 | 1.0 | 0.8 |
| Housing cost | 1.5 | 1.0 | 0.4 |

*If education buildings are implemented.

The tier-weighted satisfaction formula becomes:

```
satisfaction(citizen) = sum(factor_score_i * tier_weight_i) / sum(tier_weight_i)
```

### Proposed: Schelling-Style Preference Dynamics

Introduce a lightweight Schelling mechanism to model income sorting (rather than racial sorting, which is more appropriate for the abstract city-builder context):

```
For each residential building b:
  tier_counts = count of agents per wealth tier in b
  total = sum(tier_counts)

  For each agent a in b:
    same_tier_fraction = tier_counts[a.wealthTier] / total
    preference_satisfaction = same_tier_fraction >= HOMOGENEITY_THRESHOLD

  HOMOGENEITY_THRESHOLD = 0.25  // very mild preference
```

When `preference_satisfaction` is false, the agent's overall satisfaction takes a small penalty (e.g., -0.05). This mild preference, combined with differential housing-cost sensitivity, will produce emergent income segregation without hard-coding it.

The relocation logic in the density drain system can incorporate this:

```
relocate_priority(agent) =
  base_dissatisfaction
  + (1 - preference_satisfaction) * SCHELLING_WEIGHT

SCHELLING_WEIGHT = 0.15  // mild push factor
```

Agents who are both economically stressed (high housing cost relative to tier) and in a mismatched-tier building are the most likely to relocate, which naturally sorts tiers across the city.

### Proposed: Neighborhood Reputation Score

Add a per-tile `reputation` layer (Uint8Array, 0-255) that tracks neighborhood quality over time, creating path-dependent dynamics:

```
reputation(tile, t+1) =
  DECAY * reputation(tile, t)
  + (1 - DECAY) * current_quality(tile)

where:
  DECAY = 0.95  // slow-changing, sticky reputation
  current_quality = weighted average of:
    (1 - crimeNorm) * 0.3
    + desirability * 0.3
    + residential_stability * 0.2
    + avg_wealth_tier_norm * 0.2
```

Reputation affects which tier of citizen considers moving to a building:

```
tier_attraction(tile, tier) =
  reputation(tile) >= TIER_THRESHOLD[tier]

TIER_THRESHOLD = { 1: 0, 2: 80, 3: 160 }  // out of 255
```

Low-reputation neighborhoods attract only Tier 1. As reputation improves, Tier 2 and then Tier 3 residents move in — creating emergent gentrification where investment raises reputation, attracts higher tiers, and eventually displaces lower tiers through housing competition.

### Proposed: Social Capital Metric

Add a per-building `socialCapital` score (0-1) that tracks collective efficacy:

```
socialCapital(building, t+1) =
  socialCapital(building, t)
  + GROWTH_RATE * residentialStability(building)
  - TURNOVER_PENALTY * recentTurnover(building)

where:
  GROWTH_RATE = 0.02 per tick
  TURNOVER_PENALTY = 0.10 per agent turnover event

  residentialStability(building) =
    agentsUnchangedSinceLastTick / totalAgents

  recentTurnover(building) =
    agentsAddedOrRemoved / totalAgents
```

Social capital feeds back into crime and satisfaction:

```
// Modified crime formula:
effectiveCrime(tile) = baseCrime(tile) * (1 - socialCapital(nearestResBuilding) * 0.4)

// Modified satisfaction:
satisfaction += socialCapital(homeBuilding) * SOCIAL_CAPITAL_WEIGHT

SOCIAL_CAPITAL_WEIGHT = 0.10
```

This creates the Sampson-style feedback loop: stable neighborhoods build social capital, which reduces crime, which increases desirability, which increases stability. Conversely, high turnover (from gentrification, demolition, or economic distress) destroys social capital, increasing crime and reducing desirability.

### Proposed: Environmental Justice Integration

Extend the existing pollution system to interact with wealth tiers:

```
// Polluting facilities (industrial zones, diesel plants) have higher
// probability of being placed near low-reputation tiles.
// This is emergent from the desirability system: high-tier residents
// avoid pollution, so polluting land uses cluster where they are absent.

// Add a cumulative exposure metric:
cumulativeExposure(building) =
  sum(pollutionLevel[tile] for tile in radius=3) / tileCount

// Health penalty (affects satisfaction):
healthPenalty(agent) = cumulativeExposure(homeBuilding) * HEALTH_WEIGHT
HEALTH_WEIGHT = 0.15
```

### Summary of New Systems

| System | Data Structure | Updates Per | Feeds Into |
|--------|---------------|-------------|------------|
| Wealth Tiers | `citizen.wealthTier: 1\|2\|3` | Agent creation | Satisfaction, relocation, demand |
| Schelling Preferences | Per-building tier counts | Each tick | Agent satisfaction, relocation priority |
| Neighborhood Reputation | `Uint8Array` per tile | Each tick (slow decay) | Tier attraction thresholds, gentrification |
| Social Capital | Per-building float (0-1) | Each tick | Crime modifier, satisfaction bonus |
| Cumulative Exposure | Per-building float | Each tick | Health penalty on satisfaction |

---

## Cross-References

- [population-and-demographics.md](./population-and-demographics.md) — Wealth tiers (Section: Suggested Future Mechanics), migration push/pull, gentrification displacement
- [housing.md](./housing.md) — Filtering theory (how housing stock passes between income groups), affordability, rent control
- [public-services.md](./public-services.md) — Police/crime models, fire service, education and property values, park typology
- [urban-growth-patterns.md](./urban-growth-patterns.md) — Neighborhood lifecycle model, gentrification, sprawl, infill
- [land-use-and-zoning.md](./land-use-and-zoning.md) — Exclusionary zoning, mixed-use as integration tool, zoning and density controls
- [environment-and-sustainability.md](./environment-and-sustainability.md) — Pollution dispersion models, environmental regulation, urban heat island (which correlates with segregation)
- [municipal-finance.md](./municipal-finance.md) — Fiscal death spiral from Tiebout sorting, TIF districts, property tax and segregation
- [economy-and-employment.md](./economy-and-employment.md) — Labor markets, agglomeration, spatial mismatch between jobs and low-income housing

---

## Sources

### Foundational Works

- Schelling, Thomas C. "Dynamic Models of Segregation." *Journal of Mathematical Sociology* 1, no. 2 (1971): 143-186.
- Tiebout, Charles M. "A Pure Theory of Local Expenditures." *Journal of Political Economy* 64, no. 5 (1956): 416-424.
- Massey, Douglas S. and Nancy A. Denton. *American Apartheid: Segregation and the Making of the Underclass*. Cambridge, MA: Harvard University Press, 1993.
- Massey, Douglas S. and Nancy A. Denton. "Hypersegregation in U.S. Metropolitan Areas: Black and Hispanic Segregation Along Five Dimensions." *Demography* 26, no. 3 (1989): 373-391.
- Granovetter, Mark S. "The Strength of Weak Ties." *American Journal of Sociology* 78, no. 6 (1973): 1360-1380.
- Putnam, Robert D. *Bowling Alone: The Collapse and Revival of American Community*. New York: Simon & Schuster, 2000.
- Wilson, James Q. and George L. Kelling. "Broken Windows: The Police and Neighborhood Safety." *Atlantic Monthly* (March 1982): 29-38.
- Jacobs, Jane. *The Death and Life of Great American Cities*. New York: Random House, 1961.

### Empirical Research

- Sampson, Robert J., Stephen W. Raudenbush, and Felton Earls. "Neighborhoods and Violent Crime: A Multilevel Study of Collective Efficacy." *Science* 277, no. 5328 (1997): 918-924.
- Card, David, Alexandre Mas, and Jesse Rothstein. "Tipping and the Dynamics of Segregation." *Quarterly Journal of Economics* 123, no. 1 (2008): 177-218.
- Chetty, Raj, John N. Friedman, Nathaniel Hendren, Maggie R. Jones, and Sonya R. Porter. "The Opportunity Atlas: Mapping the Childhood Roots of Social Mobility." NBER Working Paper 25147 (2018).
- Chetty, Raj, Matthew O. Jackson, et al. "Social Capital I: Measurement and Associations with Economic Mobility." *Nature* 608 (2022): 108-121.
- Reardon, Sean F. and Kendra Bischoff. "Income Inequality and Income Segregation." *American Journal of Sociology* 116, no. 4 (2011): 1092-1153.
- Banzhaf, H. Spencer and Randall P. Walsh. "Do People Vote with Their Feet? An Empirical Test of Tiebout." *American Economic Review* 98, no. 3 (2008): 843-863.
- Freeman, Lance. "Displacement or Succession? Residential Mobility in Gentrifying Neighborhoods." *Urban Affairs Review* 40, no. 4 (2005): 463-491.
- Weisburd, David. "The Law of Crime Concentration and the Criminology of Place." *Criminology* 53, no. 2 (2015): 133-157.
- Harcourt, Bernard E. and Jens Ludwig. "Broken Windows: New Evidence from New York City and a Five-City Social Experiment." *University of Chicago Law Review* 73 (2006): 271-320.
- Putnam, Robert D. "E Pluribus Unum: Diversity and Community in the Twenty-first Century." *Scandinavian Political Studies* 30, no. 2 (2007): 137-174.

### Policy and Applied Research

- Schwartz, Heather. "Housing Policy Is School Policy: Economically Integrative Housing Promotes Academic Success in Montgomery County, Maryland." *Century Foundation* (2010).
- Chetty, Raj, Nathaniel Hendren, and Lawrence F. Katz. "The Effects of Exposure to Better Neighborhoods on Children: New Evidence from the Moving to Opportunity Experiment." *American Economic Review* 106, no. 4 (2016): 855-902.
- Bullard, Robert D. "Environmental Justice in the 21st Century." Clark Atlanta University (2001).
- National Community Reinvestment Coalition. "Shifting Neighborhoods: Gentrification and Cultural Displacement in American Cities." (2019).
- Marcuse, Peter. "Gentrification, Abandonment, and Displacement: Connections, Causes, and Policy Responses in New York City." *Urban Law Annual* 28 (1985): 195-240.
- Wilson, William Julius. *The Truly Disadvantaged: The Inner City, the Underclass, and Public Policy*. Chicago: University of Chicago Press, 1987.
