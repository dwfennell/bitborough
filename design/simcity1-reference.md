# SimCity 1 (1989) Reference

Features to faithfully replicate before expanding.

## Zones (The Core Loop)
- **Residential (R)** - Where citizens live. Grows based on demand.
- **Commercial (C)** - Shops and offices. Needs customers and workers.
- **Industrial (I)** - Factories. Pollutes but provides jobs.

Zone mechanics:
- Place zone, it develops automatically if conditions are met
- Density increases over time (small houses → apartments)
- Zones need road access (within 3 tiles, Manhattan distance) and power to develop
- Land value affects development quality

## Infrastructure

### Roads
- Required for zone development
- Traffic congestion affects growth
- Maintenance cost

### Rails
- Mass transit alternative
- Reduces traffic
- Higher upfront cost, lower maintenance

### Power
- Power plants generate electricity
- Power lines transmit to zones
- Zones without power don't develop
- Coal plants: cheap, pollute
- Nuclear plants: expensive, meltdown risk

## City Services
- **Police stations** - Reduce crime in radius
- **Fire stations** - Fight fires, reduce fire spread
- **Stadiums** - Boost residential happiness
- **Seaports** - Boost industrial
- **Airports** - Boost commercial

## Budget & Taxes
- Tax rate affects growth (high tax = slow growth)
- Funding levels for police, fire, transit
- Annual budget review

## Simulation Factors
- **Land value** - Affected by parks, water, pollution, crime
- **Crime** - Higher in dense/poor areas, reduced by police
- **Pollution** - From industry and traffic
- **Traffic** - From commuting, affects quality of life
- **Population** - Primary score metric

## Disasters
- Fire (spreads without fire dept)
- Flood
- Tornado
- Earthquake
- Monster attack
- Nuclear meltdown

## Map Features
- Water (lakes, rivers, ocean)
- Forests (can be bulldozed)
- Terrain affects building

## UI Elements
- Mini-map
- Budget window
- Graphs (population, crime, etc over time)
- Query tool (click to inspect)
- Demand indicator (R/C/I bars)
