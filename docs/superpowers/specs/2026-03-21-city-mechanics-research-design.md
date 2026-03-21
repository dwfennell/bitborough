# City Mechanics Research Collection — Design Spec

## Goal

Build a comprehensive research library covering how real cities work, serving as both a permanent reference and a design resource for Bitborough game mechanics. Each doc grounds real-world urban systems in academic/empirical sources and explicitly maps patterns to game mechanic implications.

## Structure

All research docs live in `research/` (flat directory). A single `research/index.md` serves as the master TOC, organizing entries by thematic group with brief descriptions and cross-reference notes.

### Document Format

Every research doc follows this standard template:

```markdown
# Topic Title

> One-line summary of what this doc covers and why it matters for city simulation.

## Table of Contents

(Internal links to all sections in the doc)

## Sections

(Varies per topic — real-world mechanics, patterns, formulas, data tables)

## Application to Bitborough

How these patterns map to existing and potential game mechanics.
Concrete formulas/parameters where applicable.

## Cross-References

Links to related research docs in this collection.

## Sources

Academic papers, government data, industry reports with links.
```

### Index Format (`research/index.md`)

```markdown
# Research Index

Reference material informing Bitborough game design decisions.

## Topics by Theme

### Theme Group
- [doc-name.md](./doc-name.md) — one-line description
  - Cross-refs: related-doc-1, related-doc-2
```

## Document Inventory

### Existing (update to match new format)

1. **urban-density-gradients.md** — Clark's Law, exponential density decay, center-of-mass heuristics
2. **transit-oriented-development.md** — TOD patterns, transit anchors, polycentric city evolution, employment density

### New Documents

3. **land-use-and-zoning.md** — Euclidean vs. form-based zoning, mixed-use development, upzoning/downzoning dynamics, zoning's effect on land value and urban form
4. **population-and-demographics.md** — Migration push/pull factors, birth/death/aging models, household formation, wealth stratification, demographic transition
5. **transportation-and-traffic.md** — Road network topology, induced demand, congestion modeling, public transit modes and ridership, parking economics, congestion pricing
6. **utilities-and-infrastructure.md** — Power generation and grid distribution, water supply and sewage systems, waste management, infrastructure lifecycle and maintenance costs, telecom
7. **municipal-finance.md** — Property tax mechanics, sales/income tax, municipal bonds, TIF districts, development impact fees, budget cycles, fiscal multipliers
8. **public-services.md** — Police response and crime reduction models, fire service coverage, education systems and school districts, healthcare access, parks and recreation value
9. **economy-and-employment.md** — Economic base theory, commercial/industrial sector dynamics, supply chains, labor markets, agglomeration economies, creative destruction
10. **environment-and-sustainability.md** — Pollution types and dispersion, green infrastructure, urban heat islands, climate resilience, environmental regulation tradeoffs
11. **urban-growth-patterns.md** — Sprawl vs. infill, edge cities, urban renewal, gentrification cycle, neighborhood lifecycle theory, monocentric vs. polycentric models
12. **housing.md** — Housing market fundamentals, filtering theory, affordability metrics, rent control effects, public housing models, NIMBY/YIMBY dynamics, housing supply elasticity

## Thematic Grouping for Index

### Land & Growth
- urban-density-gradients
- land-use-and-zoning
- urban-growth-patterns
- housing

### People & Economy
- population-and-demographics
- economy-and-employment
- municipal-finance

### Infrastructure & Services
- utilities-and-infrastructure
- transportation-and-traffic
- transit-oriented-development
- public-services

### Environment
- environment-and-sustainability

## Cross-Reference Map

| Document | Primary Cross-References |
|----------|------------------------|
| urban-density-gradients | transit-oriented-development, urban-growth-patterns, land-use-and-zoning |
| transit-oriented-development | transportation-and-traffic, urban-density-gradients, economy-and-employment |
| land-use-and-zoning | housing, urban-growth-patterns, municipal-finance |
| population-and-demographics | housing, economy-and-employment, public-services |
| transportation-and-traffic | transit-oriented-development, urban-density-gradients, environment-and-sustainability |
| utilities-and-infrastructure | municipal-finance, urban-growth-patterns, environment-and-sustainability |
| municipal-finance | economy-and-employment, utilities-and-infrastructure, public-services |
| public-services | municipal-finance, population-and-demographics, housing |
| economy-and-employment | population-and-demographics, transportation-and-traffic, land-use-and-zoning |
| environment-and-sustainability | utilities-and-infrastructure, transportation-and-traffic, urban-growth-patterns |
| urban-growth-patterns | urban-density-gradients, land-use-and-zoning, housing, transportation-and-traffic |
| housing | population-and-demographics, land-use-and-zoning, municipal-finance, urban-growth-patterns |

## Scope per Document

Each doc should be **comprehensive but focused** — roughly 3,000-6,000 words covering:
- How the real-world system works (mechanisms, not just descriptions)
- Key models and formulas used in urban planning/economics
- Empirical data and ranges (tables where appropriate)
- Gameplay-relevant tradeoffs and feedback loops
- Concrete "Application to Bitborough" mapping with formulas/parameters

## Quality Standards

- Sources must be real and verifiable (academic papers, government data, established planning resources)
- Formulas should be presented in a way that's directly translatable to code
- Data tables should use realistic ranges applicable to simulation parameters
- "Application to Bitborough" sections should reference existing game systems by name and suggest specific parameter values or mechanic designs
