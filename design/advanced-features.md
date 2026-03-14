# Advanced Features Roadmap

The "Dwarf Fortress" layer. Add these gradually after the SimCity 1 foundation is solid.

## Phase 1: Individual Simulation
**Goal:** Citizens aren't just numbers, they're agents.

- [ ] Individual citizens with home/work locations
- [ ] Actual commute pathfinding (not abstract traffic)
- [ ] Citizens have needs: housing, jobs, goods, services
- [ ] Birth, aging, death
- [ ] Migration in/out based on city quality

**Emergent behavior:** Traffic jams form organically. Neighborhoods develop character based on who lives there.

## Phase 2: Economic Depth
**Goal:** Money flows through the city realistically.

- [ ] Businesses have actual products/services
- [ ] Supply chains: factory → warehouse → store → consumer
- [ ] Job market: wages, unemployment, skills
- [ ] Property market: rent, prices, speculation
- [ ] Inter-city trade

**Emergent behavior:** Economic districts form. Recessions cascade through connected businesses.

## Phase 3: Infrastructure Realism
**Goal:** Utilities are simulated, not just on/off.

- [ ] Power grid with voltage, load balancing, brownouts
- [ ] Water pressure system (elevation matters)
- [ ] Sewage that needs treatment
- [ ] Internet/telecom infrastructure
- [ ] Actual traffic light timing

**Emergent behavior:** Infrastructure failures cascade. A broken water main floods streets.

## Phase 4: Political & Social
**Goal:** Citizens have opinions and organize.

- [ ] Citizen satisfaction by demographic
- [ ] Protests and civil action
- [ ] City council with competing interests
- [ ] Elections (if we add a mayor role)
- [ ] NIMBYism - citizens oppose nearby development
- [ ] Neighborhood identity and culture

**Emergent behavior:** Gentrification. Political movements. Community organizing.

## Phase 5: Historical Progression
**Goal:** Cities evolve through time periods.

- [ ] Technology eras (horse → car → transit → ???)
- [ ] Building style evolution
- [ ] Infrastructure obsolescence
- [ ] Historical events that shape development
- [ ] Legacy of past decisions (old infrastructure, pollution cleanup)

**Emergent behavior:** Cities have visible history. Old neighborhoods vs new development.

## Phase 6: Narrative & Events
**Goal:** Procedural storytelling.

- [ ] Named citizens with stories
- [ ] Dynamic events (not just disasters)
- [ ] Newspaper/media reporting on city
- [ ] Scandals, achievements, milestones
- [ ] Player choices create lasting consequences

**Emergent behavior:** Each city has a unique story to tell.

---

## Pollution System (Revisit)

Current pollution is a simple radius+amount per building. Worth redesigning with density progression in mind:
- Industrial high-density: more production value, fewer jobs, but how does pollution scale?
- Should pollution be per-tile or per-building? A 4x4 industrial complex vs four 1x1 factories.
- Wind direction, pollution drift, long-term contamination, cleanup mechanics.
- Health effects on nearby residential density (dense residential near polluted industrial = bad outcomes).
- See `research/urban-density-gradients.md` for density mechanics context.

## Wild Ideas (Maybe Someday)
- Climate change affecting city over decades
- Multiplayer region with connected cities
- AI city advisor that learns your style
- VR walkthrough of your city
- Citizen social media simulation
- Actual zoning law system
- Real-world data import (OSM → game map)
