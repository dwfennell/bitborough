# Development Milestones

Incremental milestones. Each should produce something playable.

---

## Milestone 0: Foundation
**Goal:** See something on screen

- [ ] Project setup (Vite + TypeScript)
- [ ] Canvas rendering working
- [ ] Load and display a single tile
- [ ] Pan and zoom camera
- [ ] Basic tile grid rendering

**Deliverable:** Can view a map of grass tiles, pan around

---

## Milestone 1: Terrain & Tools
**Goal:** Place and modify terrain

- [ ] Generate terrain tile set (grass, water, trees)
- [ ] Terrain map with mixed tiles
- [ ] Bulldozer tool (clear to grass)
- [ ] Basic tool selection UI
- [ ] Cursor highlights tile under mouse

**Deliverable:** Can bulldoze trees, see terrain variety

---

## Milestone 2: Roads & Zoning
**Goal:** Core city building loop

- [ ] Road placement tool
- [ ] Road tiles (straight, corners, intersections)
- [ ] Auto-connect road rendering
- [ ] Zone placement (R/C/I)
- [ ] Zone visualization (colored overlay or border)

**Deliverable:** Can lay out roads and zones

---

## Milestone 3: Power System
**Goal:** Zones require power

- [ ] Power plant placement (coal, nuclear)
- [ ] Power line tool
- [ ] Power connectivity algorithm (flood fill)
- [ ] Visual indicator for powered/unpowered
- [ ] Zones only develop if powered

**Deliverable:** Must wire up power to grow city

---

## Milestone 4: Zone Development
**Goal:** Zones come alive

- [ ] Zone demand calculation (R/C/I bars)
- [ ] Automatic building placement in zones
- [ ] Development conditions (road access, power)
- [ ] Basic land value calculation

**Deliverable:** Place zones, watch buildings grow

---

## Milestone 4b: Density Progression
**Goal:** Cities develop depth and character over time

See full design: [2026-03-10-density-progression-design.md](../docs/plans/2026-03-10-density-progression-design.md)

**Infrastructure:**
- [x] Paved road type (player upgrades dirt → paved, higher maintenance)
- [x] Transit stop building (2×2, density anchor, no routing yet)

**Upgrade mechanics:**
- [x] Low → Medium: requires paved road within 3 tiles + occupancy threshold
- [x] Medium → High: requires transit stop within 10 tiles + >50% Medium+ neighbors
- [x] Upgrade probability: occupancy-gated with exponential decay from anchor points
- [x] Under-construction state: 2–3 month demolish→rebuild cycle
- [x] Derelict state: buildings go derelict when occupancy falls, downgrade after 6 months

**Building stats:**
- [x] Medium/High residential: ~10×/~33× population per building
- [x] Medium/High commercial: ~6×/~35× jobs per building
- [x] Industrial split stat: higher density = more tax/production, fewer jobs (automation mechanic)

**Assets:**
- [x] Paved road tiles (all 16 connection variants — `paved-NESW.svg`)
- [x] Transit stop tile (2×2)
- [x] Medium R/C/I tiles (SVGs wired up)
- [x] High R/C/I tiles (SVGs wired up)
- [x] Construction sprites (1×1, 2×2, 3×3, 4×4)
- [x] Derelict sprite
- [x] In-game docs updated (`@bitborough/docs` package)

**Deliverable:** Cities organically densify around transit; industrial automation creates jobs/tax tradeoff

---

## Milestone 5: Budget & Time
**Goal:** Game becomes a game

- [ ] Game clock (speed controls)
- [ ] Tax income from developed zones
- [ ] Maintenance costs (roads, power, services)
- [ ] Budget panel UI
- [ ] Simple cash flow

**Deliverable:** Can go bankrupt or profit, time matters

---

## Milestone 6: City Services
**Goal:** Police, fire, quality of life

- [ ] Police station (reduces crime in radius)
- [ ] Fire station (required for fire events)
- [ ] Crime calculation affecting land value
- [ ] Service radius visualization
- [ ] Funding levels affect effectiveness

**Deliverable:** Services affect city development

---

## Milestone 7: Traffic & Commuting
**Goal:** Roads matter beyond connectivity

- [ ] Basic traffic simulation
- [ ] Visual traffic density on roads
- [ ] Traffic affects residential happiness
- [ ] Traffic affects commercial success
- [ ] Congestion calculation

**Deliverable:** Traffic problems emerge in growing cities

---

## Milestone 8: Polish & Save/Load
**Goal:** Actually usable game

- [ ] Save game to localStorage/file
- [ ] Load game
- [ ] Sound effects
- [ ] Mini-map
- [ ] Query tool (inspect any tile)
- [ ] Statistics graphs

**Deliverable:** Complete SimCity 1 core experience

---

## Milestone 9+: Advanced Features
See [advanced-features.md](./advanced-features.md)

Begin individual citizen simulation and deeper systems.

---

## Guiding Principles
1. Each milestone = playable increment
2. Don't skip ahead; nail the basics
3. Generate art assets as needed, not upfront
4. Playtest frequently
5. Refactor when pain emerges, not preemptively
