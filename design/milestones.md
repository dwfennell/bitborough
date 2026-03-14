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

- [x] Game clock (speed controls) — SpeedControls UI, SimSpeed.Paused/Slow/Normal/Fast
- [x] Tax income from developed zones — `calculateBudget()` taxIncome = population × avgLandValue / 20 × taxRate
- [x] Maintenance costs (roads, power, services) — per-tile road/powerLine + per-building maintenance
- [x] Budget panel UI — BudgetPanel with police/fire funding sliders
- [x] Simple cash flow — `funds += budgetInfo.balance` each month
- [x] Bankruptcy / game-over when funds < 0

**Deliverable:** Can go bankrupt or profit, time matters

---

## Milestone 6: City Services
**Goal:** Police, fire, quality of life

- [x] Police station (reduces crime in radius) — `calculateCrime()` with police funding
- [x] Fire station (required for fire events) — `calculateFireCoverage()`, `updateFires()`
- [x] Crime calculation affecting land value — crime array fed into `calculateLandValues()`
- [x] Service radius visualization — fire/crime overlays in OverlayRenderer
- [x] Funding levels affect effectiveness — police/fire sliders in BudgetPanel

**Deliverable:** Services affect city development

---

## Milestone 7: Traffic & Commuting
**Goal:** Roads matter beyond connectivity

- [x] Basic traffic simulation — `calculateTraffic()` via DFS path routing
- [x] Visual traffic density on roads — traffic overlay (OverlayType includes 'traffic')
- [x] Traffic affects residential happiness — congestion > 0.8 suppresses R/C/I demand
- [x] Traffic affects commercial success — demand suppression hits commercial equally
- [x] Congestion calculation — `computeAverageCongestion()` across all road tiles

**Deliverable:** Traffic problems emerge in growing cities

---

## Milestone 8: Polish & Save/Load
**Goal:** Actually usable game

- [x] Save game to localStorage/file — SaveManager with localStorage + JSON export
- [x] Load game — EscapeMenu save/load UI wired to SaveManager
- [x] Sound effects — AudioManager (place, bulldoze, zone, error tones)
- [x] Mini-map — MiniMap.ts canvas overlay
- [x] Query tool (inspect any tile) — QueryTool + QueryPanel
- [x] Statistics graphs — population/funds/demand over time charts

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
