# Urban Density Gradients

> How population density distributes across cities — exponential decay models, center-of-mass heuristics, and density gradient dynamics.

## Table of Contents

- [Clark's Law (1951)](#clarks-law-1951)
- [Alonso-Muth-Mills Model](#alonso-muth-mills-model)
- [Application to Bitborough](#application-to-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

## Clark's Law (1951)

Population density decreases exponentially with distance from the city center:

```
D(x) = D₀ × e^(-bx)
```

- `D(x)` — population density at distance x from center
- `D₀` — density at city center
- `b` — density gradient (steepness of decay)
- Cities can be visualized as "exponential density cones"

**Geographic variation:**
- Asian/European cities: steep gradients (compact, well-defined cores)
- North American cities: shallow gradients (sprawl, uniform density)
- Paris: strong center; Los Angeles: relatively flat

**City size:** Larger cities are denser *and* more spread out — the cone is both taller and wider.

## Alonso-Muth-Mills Model

Provides the theoretical foundation for Clark's Law. Density gradient emerges from a trade-off:

- Land near the center is expensive → households substitute density for space
- Land far from center is cheap but commute costs rise → households compensate with larger, cheaper land
- Result: density declines monotonically with distance from CBD

**Key insight for simulation:** Accessibility drives density. Areas with lower effective distance from employment centers develop denser, not just areas that are geographically close.

## Application to Bitborough

- Medium-density upgrade probability should follow exponential decay from anchor points (city center of mass, transit stations)
- Formula: `P(upgrade) = demand_factor × e^(-distance / radius)`
- The `radius` constant should expand as city population grows — the dense core widens over time
- City center of mass = weighted average of all developed tile positions

## Cross-References

- [Transit-Oriented Development](./transit-oriented-development.md) — TOD creates secondary density peaks that modify the baseline gradient
- [Urban Growth Patterns](./urban-growth-patterns.md) — Monocentric vs. polycentric models of city structure
- [Land Use and Zoning](./land-use-and-zoning.md) — Zoning regulations constrain and shape natural density gradients

## Sources

- Clark, C. (1951). "Urban population densities." *Journal of the Royal Statistical Society*
- [Population Density by Distance from City Center](https://transportgeography.org/contents/chapter8/transportation-urban-form/distance-density-urban/)
- [Density Gradient in Urban Planning](https://www.numberanalytics.com/blog/density-gradient-urban-environmental-policy)
- [3D structure of population density in world cities](https://www.nature.com/articles/s42949-025-00262-4)
