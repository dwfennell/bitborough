# Research Index

Reference material informing Bitborough game design decisions. Each document covers real-world urban systems grounded in academic and empirical sources, with explicit "Application to Bitborough" sections mapping patterns to game mechanics.

**16 topic documents** | ~15,000 lines | ~80,000 words

See also:
- **[Meta-Research: City-Builder Games](./meta/index.md)** — genre history, mechanics comparison, design analysis (11 docs)
- **[Systems Interaction Map](./systems-interaction-map.md)** — feedback loops, causal chains, coupling matrix across all systems
- **[Mechanics Roadmap](./mechanics-roadmap.md)** — every proposed mechanic prioritized by impact/complexity with build order
- **[Glossary](./glossary.md)** — 60 key terms from urban planning, economics, game design, and Bitborough internals

## Table of Contents

- [Land & Growth](#land--growth) (4 docs)
- [People & Society](#people--society) (3 docs)
- [Economy & Finance](#economy--finance) (3 docs)
- [Infrastructure & Services](#infrastructure--services) (4 docs)
- [Environment & Resilience](#environment--resilience) (2 docs)

---

## Land & Growth

- [urban-density-gradients.md](./urban-density-gradients.md) — Clark's Law, exponential density decay, Alonso-Muth-Mills model, polycentric gradient superposition, empirical data for 11 world cities, gradient breaks at highways/rivers, temporal flattening, amenity anomalies, gradient-as-diagnostic
  - Cross-refs: transit-oriented-development, urban-growth-patterns, land-use-and-zoning

- [land-use-and-zoning.md](./land-use-and-zoning.md) — Euclidean vs. form-based zoning, mixed-use development, FAR, setbacks, height limits, zoning tax, inclusionary zoning, historic preservation overlays, parking minimums, fiscal zoning, variance dynamics, feedback loops
  - Cross-refs: housing, urban-growth-patterns, municipal-finance

- [urban-growth-patterns.md](./urban-growth-patterns.md) — Monocentric/polycentric models, Burgess/Hoyt/Harris-Ullman, sprawl, infill, gentrification (with quantitative displacement evidence), neighborhood lifecycle, growth boundaries, smart growth, redlining effects, urban renewal failures, public housing concentration, declining city revitalization
  - Cross-refs: urban-density-gradients, land-use-and-zoning, housing, transportation-and-traffic

- [urban-design-and-walkability.md](./urban-design-and-walkability.md) — Jane Jacobs' four conditions, block size and permeability, street design typology, Walk Score methodology, active frontages (Gehl), public spaces (Whyte), third places (Oldenburg), street trees, cycling infrastructure, walkability-property value premium
  - Cross-refs: transportation-and-traffic, land-use-and-zoning, housing, urban-growth-patterns, public-services

## People & Society

- [population-and-demographics.md](./population-and-demographics.md) — Logistic growth, migration push/pull (Harris-Todaro), demographic transition, age structure, household formation, wealth stratification, Zipf's law, immigration/integration, circular migration, brain drain/gain, aging in place, gentrification displacement
  - Cross-refs: housing, economy-and-employment, public-services

- [social-dynamics-and-segregation.md](./social-dynamics-and-segregation.md) — Schelling segregation model, Tiebout sorting, income/racial segregation measurement, school-based sorting, neighborhood effects (Chetty), social networks (Granovetter), collective efficacy (Sampson), environmental justice, policy tools for integration
  - Cross-refs: population-and-demographics, housing, public-services, urban-growth-patterns, land-use-and-zoning, environment-and-sustainability, municipal-finance, economy-and-employment

- [housing.md](./housing.md) — Supply elasticity, filtering theory, affordability metrics, density types, rent control (Diamond 2019), public housing, NIMBY/YIMBY, school capitalization, vacancy dynamics and abandonment cascades, construction cost curves by density, 5-over-1 buildings, speculation and bubbles, manufactured housing, dark housing stock
  - Cross-refs: population-and-demographics, land-use-and-zoning, municipal-finance, urban-growth-patterns

## Economy & Finance

- [economy-and-employment.md](./economy-and-employment.md) — Economic base theory, agglomeration economies, bid-rent, commercial/industrial dynamics, labor markets, supply chains, multiplier effects (Moretti), creative destruction, sector transition timelines, commercial real estate cycles, unemployment dynamics and hysteresis, commute-income inequality, informal economy
  - Cross-refs: population-and-demographics, transportation-and-traffic, land-use-and-zoning

- [municipal-finance.md](./municipal-finance.md) — Property tax, sales tax, municipal bonds, TIF districts, impact fees, budget structure, fiscal multipliers, revenue per acre, growth Ponzi scheme, bankruptcy, public pension/OPEB crises, tax incidence, corporate tax competition, fee-based revenue, revenue volatility
  - Cross-refs: economy-and-employment, utilities-and-infrastructure, public-services

- [real-estate-development.md](./real-estate-development.md) — Developer decision pipeline, feasibility analysis (pro forma, cap rates, NOI), construction economics, 5-over-1 cost thresholds, construction timelines, 18-year market cycles, speculation and bubbles, land banking, adaptive reuse, LIHTC and developer incentives, commercial vs. residential economics
  - Cross-refs: housing, municipal-finance, land-use-and-zoning, economy-and-employment, urban-growth-patterns

## Infrastructure & Services

- [utilities-and-infrastructure.md](./utilities-and-infrastructure.md) — Power generation/distribution, water supply, sewer, stormwater, waste management, infrastructure lifecycle, capacity planning, cost scaling, distributed generation and microgrids, infrastructure interdependencies (power-water nexus), climate adaptation costs, infrastructure financing
  - Cross-refs: municipal-finance, urban-growth-patterns, environment-and-sustainability

- [transportation-and-traffic.md](./transportation-and-traffic.md) — Traffic flow theory, BPR congestion function, road hierarchy, transit modes and ridership, induced demand, mode choice, parking economics, congestion pricing, VMT, micro-mobility, dynamic parking, goods movement and freight, road maintenance lifecycle, transportation equity
  - Cross-refs: transit-oriented-development, urban-density-gradients, environment-and-sustainability

- [transit-oriented-development.md](./transit-oriented-development.md) — TOD patterns, transit as density anchor, polycentric evolution, mode-specific catchment areas (empirical data), TOD design (parking, pedestrian streets, first-last-mile), value capture (TIF, R+P model), suburban TOD retrofitting, TOD displacement and anti-displacement strategies
  - Cross-refs: transportation-and-traffic, urban-density-gradients, economy-and-employment

- [public-services.md](./public-services.md) — Police/crime models, fire service coverage (NFPA/ISO), education and property values, healthcare access, park typology, service costs, quality feedback loops, service quality outcomes, mental health/homelessness services, service equity measurement, contracted vs. government services, emergency response coordination
  - Cross-refs: municipal-finance, population-and-demographics, housing

## Environment & Resilience

- [environment-and-sustainability.md](./environment-and-sustainability.md) — Air/water/noise pollution, Gaussian plume dispersion, urban heat island, green infrastructure, climate resilience, environmental regulation, sustainability metrics, environmental justice, biodiversity and ecosystem services, soil contamination and brownfields, light pollution, embodied carbon, urban food systems
  - Cross-refs: utilities-and-infrastructure, transportation-and-traffic, urban-growth-patterns

- [disaster-and-resilience.md](./disaster-and-resilience.md) — Disaster typology (earthquake, hurricane, flood, wildfire, tornado, drought), vulnerability assessment, FEMA HAZUS damage models, flooding mechanics, recovery trajectories (Kates-Pijawka), economic impact, resilience strategies, insurance and risk transfer, climate change amplification, case studies (Katrina, SF 1906, Galveston, Paradise, Tokyo)
  - Cross-refs: environment-and-sustainability, utilities-and-infrastructure, municipal-finance, public-services, housing
