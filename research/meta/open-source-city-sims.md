# Open-Source City Simulations

> Technical analysis of open-source city builders and transport sims --- architectures, algorithms, and code patterns worth studying.

Where the [mechanics comparison](mechanics-comparison.md) examines *design* decisions across commercial titles, this document examines *implementation* decisions across open-source projects where the code is actually readable. These are not hypothetical architecture diagrams --- they are battle-tested systems that compile, run, and simulate cities. Every claim here can be verified against a public repository.

## Table of Contents

1. [Why Study Open-Source City Sims](#1-why-study-open-source-city-sims)
2. [Micropolis Deep Dive](#2-micropolis-deep-dive)
   - 2.1 [Simulation Loop Structure](#21-simulation-loop-structure)
   - 2.2 [Zone Development Algorithm](#22-zone-development-algorithm)
   - 2.3 [Power Propagation (Flood-Fill BFS)](#23-power-propagation-flood-fill-bfs)
   - 2.4 [Crime, Pollution, and Land Value](#24-crime-pollution-and-land-value)
   - 2.5 [Traffic Model](#25-traffic-model)
   - 2.6 [RCI Demand Calculation (Valve System)](#26-rci-demand-calculation-valve-system)
   - 2.7 [Source File Map](#27-source-file-map)
3. [OpenTTD Architecture](#3-openttd-architecture)
   - 3.1 [Map Representation](#31-map-representation)
   - 3.2 [Pathfinding (YAPF)](#32-pathfinding-yapf)
   - 3.3 [YAPF Deep Dive: Cost Constants and Caching](#33-yapf-deep-dive-cost-constants-and-caching)
   - 3.4 [Economic Model](#34-economic-model)
   - 3.5 [Tick System](#35-tick-system)
4. [Citybound](#4-citybound)
   - 4.1 [The Kay Actor System](#41-the-kay-actor-system)
   - 4.2 [Lane-Based Traffic](#42-lane-based-traffic)
   - 4.3 [Internet-Style Routing](#43-internet-style-routing)
   - 4.4 [Household Economy](#44-household-economy)
   - 4.5 [Actors vs. ECS: Eickhoff's Rationale](#45-actors-vs-ecs-eickhoffs-rationale)
   - 4.6 [Source Code Organization](#46-source-code-organization)
5. [Other Projects](#5-other-projects)
   - 5.1 [Lincity-NG](#51-lincity-ng)
   - 5.2 [Unknown Horizons](#52-unknown-horizons)
   - 5.3 [OpenCity](#53-opencity)
   - 5.4 [Thrive](#54-thrive)
   - 5.5 [A/B Street (Rust Traffic Simulation)](#55-ab-street-rust-traffic-simulation)
   - 5.6 [Egregoria (Rust City Builder)](#56-egregoria-rust-city-builder)
   - 5.7 [OpenLoco](#57-openloco)
   - 5.8 [CorsixTH](#58-corsixth)
   - 5.9 [FreeCol](#59-freecol)
6. [Common Architectural Patterns](#6-common-architectural-patterns)
7. [Data Structures for City Simulation](#7-data-structures-for-city-simulation)
8. [Performance Patterns](#8-performance-patterns)
9. [Code Pattern Catalog](#9-code-pattern-catalog)
   - 9.1 [Grid-Based Influence Propagation](#91-grid-based-influence-propagation)
   - 9.2 [Demand Calculation with Feedback Loops](#92-demand-calculation-with-feedback-loops)
   - 9.3 [Zone Development Probability](#93-zone-development-probability)
   - 9.4 [Agent Spawning and Despawning](#94-agent-spawning-and-despawning)
   - 9.5 [Save/Load Serialization Patterns](#95-saveload-serialization-patterns)
10. [Lessons for Bitborough](#10-lessons-for-bitborough)
- [Cross-References](#cross-references)

---

## 1. Why Study Open-Source City Sims

City simulation is a deceptively hard genre to implement. The player sees a charming grid of buildings growing and shrinking, but behind the rendering layer sits a tangle of interconnected systems: power propagation, traffic routing, demand calculation, crime diffusion, zone development, economic feedback loops. Each of these systems must be fast enough to run every tick, deterministic enough to feel fair, and interconnected enough to produce emergent behavior.

Commercial city builders --- SimCity 4, Cities: Skylines, Anno --- ship polished products but closed source. We can observe their behavior, but we cannot read the algorithms. Open-source projects fill that gap. They expose the actual code that makes a simulation tick: the BFS that propagates power, the heuristic that drives zone demand, the smoothing kernel that diffuses pollution across tiles.

The projects covered here span a wide range:

| Project | Language | Era | Focus | Repository |
|---------|----------|-----|-------|------------|
| **Micropolis** | C / C++ / Java | 1989 (released 2008) | Classic SimCity mechanics | [SimHacker/micropolis](https://github.com/SimHacker/micropolis) |
| **OpenTTD** | C++ | 2004--present | Transport simulation | [OpenTTD/OpenTTD](https://github.com/OpenTTD/OpenTTD) |
| **Citybound** | Rust | 2014--present | Microscopic agent simulation | [citybound/citybound](https://github.com/citybound/citybound) |
| **A/B Street** | Rust | 2018--present | Traffic planning & simulation | [a-b-street/abstreet](https://github.com/a-b-street/abstreet) |
| **Egregoria** | Rust | 2020--present | 3D city builder with agents | [Uriopass/Egregoria](https://github.com/Uriopass/Egregoria) |
| **OpenLoco** | C++ | 2018--present | Transport tycoon (Locomotion) | [OpenLoco/OpenLoco](https://github.com/OpenLoco/OpenLoco) |
| **CorsixTH** | Lua / C++ | 2009--present | Hospital management sim | [CorsixTH/CorsixTH](https://github.com/CorsixTH/CorsixTH) |
| **FreeCol** | Java | 2003--present | Colony management | [FreeCol/freecol](https://github.com/FreeCol/freecol) |
| **Lincity-NG** | C++ | 2005--present | Resource-flow city builder | [lincity-ng/lincity-ng](https://github.com/lincity-ng/lincity-ng) |
| **OpenCity** | C++ | 2003--2017 | 3D city builder | [frodrigo/opencity](https://github.com/frodrigo/opencity) |
| **Unknown Horizons** | Python | 2008--present | Anno-style colony sim | [unknown-horizons/unknown-horizons](https://github.com/unknown-horizons/unknown-horizons) |
| **Thrive** | C# / C++ | 2012--present | Evolution/civilization sim | [Revolutionary-Games/Thrive](https://github.com/Revolutionary-Games/Thrive) |

Each project made different tradeoffs. Micropolis prioritized simplicity on 1980s hardware. OpenTTD optimized for massive transport networks over 20+ years of refinement. Citybound pursued microscopic realism with modern systems programming. A/B Street and Egregoria represent a new wave of Rust-based simulations that combine agent-based modeling with high performance. The patterns that emerge across all of them --- the ones every project converges on independently --- are the ones most worth understanding.

---

## 2. Micropolis Deep Dive

Micropolis is the open-source release of the original SimCity, ported to Unix by Don Hopkins and released under GPL-3 by Electronic Arts in 2008 for the One Laptop Per Child project. The name "Micropolis" was Will Wright's original working title. The code lineage runs from C64 through Mac, SunOS, Unix/X11/Tcl/Tk, and eventually into a C++ core (MicropolisCore) and a Java port (MicropolisJ by Jason Long).

**Repositories:**
- Original C/Tcl release: [SimHacker/micropolis](https://github.com/SimHacker/micropolis)
- C++ engine rewrite: [SimHacker/MicropolisCore](https://github.com/SimHacker/MicropolisCore)
- Java port: [dheid/micropolis](https://github.com/dheid/micropolis) (enhanced MicropolisJ)
- Unity C# rewrite: [bsimser/Micropolis](https://github.com/bsimser/Micropolis)

### 2.1 Simulation Loop Structure

The simulation engine runs a phased scan cycle. Each "simulation pass" advances a phase counter, and different subsystems execute on different phases. The MicropolisJ Java port (by Jason Long) is the most readable version of this logic. The entry point is `step()`, which advances a frame counter and delegates to a 16-phase dispatch:

```java
// Micropolis.java
void step() {
    fcycle = (fcycle + 1) % 1024;
    simulate(fcycle % 16);
}
```

The `simulate(int mod16)` method is the heart of the engine. It divides the map into 8 vertical strips (each `width / 8` tiles wide) and spreads zone scanning across phases 1--8:

```java
void simulate(int mod16) {
    final int band = getWidth() / 8;

    switch (mod16) {
    case 0:
        scycle = (scycle + 1) % 1024;
        cityTime++;
        if (scycle % 2 == 0) { setValves(); }  // RCI demand update
        clearCensus();
        break;

    case 1: mapScan(0 * band, 1 * band); break;
    case 2: mapScan(1 * band, 2 * band); break;
    case 3: mapScan(2 * band, 3 * band); break;
    case 4: mapScan(3 * band, 4 * band); break;
    case 5: mapScan(4 * band, 5 * band); break;
    case 6: mapScan(5 * band, 6 * band); break;
    case 7: mapScan(6 * band, 7 * band); break;
    case 8: mapScan(7 * band, getWidth()); break;

    case 9:
        if (cityTime % CENSUSRATE == 0) { takeCensus(); }
        collectTaxPartial();
        if (cityTime % TAXFREQ == 0) {
            collectTax();
            evaluation.cityEvaluation();
        }
        break;

    case 10: decROGMem(); decTrafficMem(); doMessages(); break;
    case 11: powerScan(); break;
    case 12: ptlScan(); break;       // pollution, terrain, land value
    case 13: crimeScan(); break;
    case 14: popDenScan(); break;
    case 15: fireAnalysis(); doDisasters(); break;
    }
}
```

This staggered approach is critical: rather than scanning the entire map every tick, the simulation divides the 120x100 tile map into eight vertical strips and processes one strip per phase. A full zone scan takes eight phases, spread across eight simulation ticks. This keeps per-tick CPU cost roughly constant regardless of city size.

**Key timing constants:**
- `CENSUSRATE = 4` --- census every 4 city-time ticks (every 64 simulation phases)
- `TAXFREQ = 48` --- tax collection every 48 city-time ticks
- RCI valve update every other scycle (every 32 simulation phases)

The `mapScan()` method iterates over every tile in its strip, identifies zone tiles by their sprite index, and dispatches to the appropriate zone handler (`doResidential`, `doCommercial`, `doIndustrial`). Non-zone tiles (roads, power lines, terrain) are handled by `TerrainBehavior`.

### 2.2 Zone Development Algorithm

Zone development is the heart of SimCity's gameplay loop. When the map scanner reaches a residential, commercial, or industrial zone tile, it evaluates whether that zone should grow, shrink, or remain stable.

The `MapScanner` class in MicropolisJ dispatches to zone-specific handlers:

```java
// MapScanner.java - apply() dispatch
switch (behavior) {
    case RESIDENTIAL: doResidential(); return;
    case COMMERCIAL:  doCommercial();  return;
    case INDUSTRIAL:  doIndustrial();  return;
    // ... roads, rails, power lines handled by TerrainBehavior
}
```

Each zone handler follows the same four-step evaluation:

**Step 1: Count population.** The zone's current population is extracted from its tile sprite index via a lookup table. Each sprite ID maps to a population contribution (e.g., a small house = 16 people, a high-rise = 256).

**Step 2: Generate traffic.** `makeTraffic(ZoneType)` attempts to trace a path from the zone to a complementary zone type (residential seeks commercial/industrial; commercial/industrial seek each other). Returns -1 (no road access), 0 (path failed within step limit), or 1 (path found).

**Step 3: Compute a zone score.** The score combines the global demand valve with local conditions:

```java
int zscore = city.comValve + locValve;  // for commercial zones
if (!powerOn) zscore = -500;            // unpowered zones penalized severely
```

The `locValve` incorporates land value (divided by 32), pollution level, and crime rate. Higher land value encourages commercial growth; pollution blocks residential growth.

**Step 4: Probabilistic growth/decline roll.** This is the core decision:

```java
// Growth check (commercial example from MapScanner.java):
if (trafficGood != 0 && zscore > -350
    && zscore - 26380 > (PRNG.nextInt(0x10000) - 0x8000)) {
    doCommercialIn(tpop, value);   // try to grow
}

// Decline check:
if (zscore < 350
    && zscore + 26380 < (PRNG.nextInt(0x10000) - 0x8000)) {
    doCommercialOut(tpop, value);  // try to shrink
}
```

The magic number 26380 biases the roll so that zones need a significantly positive score to grow and a significantly negative score to shrink. The random roll spans -32768 to +32767 (16-bit signed range). This means a zone with `zscore = 0` has roughly a `(26380 + 32768) / 65536 = 90%` chance of *not* growing on any given scan, creating the slow, organic development feel.

**Growth mechanics (`doCommercialIn`):** Growth checks land value against current population. If the zone's population already exceeds `landValue / 32`, it will not grow further --- land value acts as a population ceiling:

```java
void doCommercialIn(int pop, int value) {
    int z = city.getLandValue(xpos, ypos) / 32;
    if (pop > z) return;          // already at capacity for this land value
    if (pop < 5) {
        comPlop(pop, value);      // advance to next density sprite
        adjustROG(8);             // "rate of growth" positive feedback
    }
}
```

**Decline mechanics (`doCommercialOut`):** Zones regress to lower-density sprites, potentially clearing back to empty lots. The `adjustROG(-8)` call feeds negative growth into the rate-of-growth memory, which influences future development in surrounding areas.

**Land value class determination** (`getCRValue`): Each zone is assigned a value class 0--3 based on `(landValue - pollution)`:

```
Class 0: value < 30    (slum)
Class 1: value < 80    (lower middle)
Class 2: value < 150   (upper middle)
Class 3: value >= 150  (high value)
```

The value class determines which sprite set is used when the zone develops --- class 0 gets small houses, class 3 gets high-rises. This is how SimCity creates organic variation: the same "residential zone" tile produces visually and functionally different buildings depending on surrounding conditions.

Zone tiles carry a "population" value packed into the tile index. Residential tiles range from empty lot to various building sprites representing increasing population. When conditions favor growth, the tile's sprite index advances to a higher-population variant. When conditions deteriorate, it regresses. The total city population is computed by summing these contributions across all residential tiles during the map scan.

### 2.3 Power Propagation (Flood-Fill BFS)

Power propagation uses a flood-fill algorithm starting from power plant tiles. The MicropolisJ implementation in `Micropolis.java` reveals the actual algorithm --- a stack-based traversal with capacity tracking:

```java
void powerScan() {
    // Clear the entire power map
    for (boolean[] bb : powerMap) {
        Arrays.fill(bb, false);
    }

    // Total capacity: coal = 700 units, nuclear = 2000 units
    int maxPower = coalCount * 700 + nuclearCount * 2000;
    int numPower = 0;

    // powerPlants is a Stack<CityLocation> populated during mapScan
    while (!powerPlants.isEmpty()) {
        CityLocation loc = powerPlants.pop();
        int aDir = 4;
        int conNum;
        do {
            if (++numPower > maxPower) {
                sendMessage(MicropolisMessage.BROWNOUTS_REPORT);
                return;  // capacity exhausted --- brownout
            }
            movePowerLocation(loc, aDir);
            powerMap[loc.y][loc.x] = true;

            conNum = 0;
            int dir = 0;
            while (dir < 4 && conNum < 2) {
                if (testForCond(loc, dir)) {
                    conNum++;
                    aDir = dir;
                }
                dir++;
            }
            if (conNum > 1) {
                // Branch point: push current location back on stack
                powerPlants.add(new CityLocation(loc.x, loc.y));
            }
        } while (conNum != 0);
    }
}
```

**How it works:**
1. Each power plant tile is pushed onto a `Stack<CityLocation>` during the map scan phases (1--8).
2. `powerScan()` pops each plant and walks outward through conductive tiles (power lines, zoned buildings adjacent to power lines).
3. `testForCond(loc, dir)` checks whether the neighbor in direction `dir` is a conductive tile that has not yet been powered.
4. When the walk encounters a branch (two or more unpowered conductive neighbors), it pushes the current location back onto the stack --- creating an implicit DFS with stack-based backtracking.
5. Each tile powered increments `numPower`. When `numPower > maxPower`, the scan aborts with a brownout message. This means power is allocated first-come-first-served: plants closer to the stack top get to power their neighborhoods first.

**Capacity per plant type:**
- Coal plant: 700 tiles
- Nuclear plant: 2000 tiles

**Original C quirk:** The 1989 C code used a recursive flood-fill, which could overflow the call stack on large maps. Additionally, due to the recursive traversal order, intersection tiles could be counted multiple times against plant capacity. The MicropolisJ port fixed both issues by switching to an explicit stack.

This is directly analogous to Bitborough's `bfsPower()` function in `simulation/power.ts`, which queues from plant footprint tiles and walks through connected infrastructure using a standard BFS queue. Bitborough uses an iterative queue (true BFS) rather than a stack (DFS), which produces broader, more even power distribution.

### 2.4 Crime, Pollution, and Land Value

These three systems share a common computational pattern: **grid-wide scan followed by smoothing**.

**Crime scan** (`crimeScan`): Iterates over every 2x2 block of the map. Crime starts at a baseline of 128 (half of the 8-bit 0--255 range, a design choice rooted in the Commodore 64 origins). Police station proximity reduces crime; high population density and low land value increase it. After the raw crime values are computed, a smoothing pass (`doSmooth`) diffuses values to adjacent cells, preventing sharp discontinuities.

**Pollution/terrain/land value scan** (`ptlScan`): Computes three values per tile:
- **Pollution**: Industrial zones and heavy traffic generate pollution. Distance from the city center and proximity to parks/water reduce it.
- **Land value**: A composite of terrain quality (water adjacency), distance to pollution sources, distance to city center, and proximity to parks/civic buildings.
- **Terrain score**: Evaluates natural land quality.

Each uses the same `doSmooth()` helper, which performs a 3x3 box blur across the map. In the MicropolisJ Java port, this is implemented as:

```java
static void smoothN(int[][] src, int[][] dest, int w, int h) {
    for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
            int sum = src[y][x];
            int count = 1;
            if (x > 0)     { sum += src[y][x-1]; count++; }
            if (x < w - 1) { sum += src[y][x+1]; count++; }
            if (y > 0)     { sum += src[y-1][x]; count++; }
            if (y < h - 1) { sum += src[y+1][x]; count++; }
            dest[y][x] = sum / count;
        }
    }
}
```

This is a classic 5-point stencil average. Multiple smoothing passes produce increasingly diffuse influence fields. SimCity typically runs two smoothing passes per crime/pollution update, creating a gentle falloff rather than sharp boundaries.

### 2.5 Traffic Model

The original SimCity traffic model is notably simplistic by modern standards. It does not simulate individual vehicles. Instead, when a zone is scanned during development, `makeTraffic(ZoneType)` traces a path from that zone toward a complementary zone type. The implementation in `TrafficGen.java` reveals a bounded random walk:

```java
static final int MAX_TRAFFIC_DISTANCE = 30;  // max steps before giving up

static final int[] DX = { 0, 1, 0, -1 };    // cardinal directions
static final int[] DY = { -1, 0, 1, 0 };
```

**The algorithm:**

1. **Find a road.** Starting from the zone center, check the four cardinal neighbors for a road tile. If no road is adjacent, return -1 (zone has no road access --- development blocked).

2. **Random walk.** Choose a random starting direction (`rdir = PRNG.nextInt(4)`). At each step, try directions starting from `rdir`, cycling through all four. To prevent backtracking, skip any direction that would reverse the last move: `if (realdir == (lastdir + 2) % 4) continue`. After moving, update `lastdir` to the opposite of the move direction.

3. **Destination check.** At each step, `driveDone()` checks adjacent tiles for zones that match the destination type. Residential traffic seeks commercial or industrial zones; commercial/industrial traffic seeks residential zones.

4. **Dead-end handling.** When the walk hits a dead end (no forward road tiles), it backtracks by popping saved positions from a stack. Backtracking increments the step counter by 3, punishing dead ends to ensure the walk terminates quickly in poorly-connected networks.

5. **Recording.** Positions are saved every other step into a stack. If a destination is found, the entire stack of visited positions receives a traffic density increment. If the walk exceeds `MAX_TRAFFIC_DISTANCE` (30 steps) without finding a destination, `makeTraffic` returns 0 (path failed).

**Implications for zone development:** The return value of `makeTraffic` directly controls whether a zone can grow. A zone that returns -1 (no road) or 0 (path too long) will not pass the growth check. This creates the classic SimCity feedback loop: zones need roads to grow, but traffic density on those roads creates pollution that depresses land values. The 30-step limit means that zones far from complementary zones will stagnate, organically creating mixed-use districts.

### 2.6 RCI Demand Calculation (Valve System)

The RCI demand bars --- the three colored meters showing Residential, Commercial, and Industrial growth pressure --- are computed by `setValves()` in `Micropolis.java`. This method runs every other scycle (every 32 simulation phases). The algorithm models a simplified labor market:

```java
void setValves() {
    double normResPop = (double)resPop / 8.0;
    totalPop = (int)(normResPop + comPop + indPop);

    // Employment ratio: are there enough jobs for residents?
    double employment;
    if (normResPop != 0.0) {
        employment = (history.com[1] + history.ind[1]) / normResPop;
    } else {
        employment = 1;
    }

    // Migration: positive when jobs exceed workers
    double migration = normResPop * (employment - 1);
    double births = normResPop * 0.02;  // 2% birth rate
    double projectedResPop = normResPop + migration + births;

    // Labor base: ratio of workers to jobs (clamped 0.0--1.3)
    double laborBase;
    if ((history.com[1] + history.ind[1]) != 0.0) {
        laborBase = history.res[1] / (history.com[1] + history.ind[1]);
    } else {
        laborBase = 1;
    }
    laborBase = Math.max(0.0, Math.min(1.3, laborBase));

    // Internal market drives commercial demand
    double internalMarket = (normResPop + comPop + indPop) / 3.7;
    double projectedComPop = internalMarket * laborBase;

    // Industry adjusted by difficulty
    double projectedIndPop = indPop * laborBase * difficultyMultiplier;
    if (projectedIndPop < 5.0) projectedIndPop = 5.0;

    // Compute ratios, apply tax effects from lookup table
    resRatio = (projectedResPop - normResPop) * 600 + TaxTable[taxEffect + gameLevel];
    comRatio = (projectedComPop - comPop)      * 600 + TaxTable[taxEffect + gameLevel];
    indRatio = (projectedIndPop - indPop)      * 600 + TaxTable[taxEffect + gameLevel];

    // Accumulate into valves with clamping [-2000, +2000]
    resValve += (int)resRatio;
    resValve = Math.max(-2000, Math.min(2000, resValve));
    // ... same for comValve, indValve

    // Demand caps: special buildings gate growth
    if (resCap && resValve > 0) resValve = 0;  // need stadium
    if (comCap && comValve > 0) comValve = 0;  // need airport
    if (indCap && indValve > 0) indValve = 0;  // need seaport
}
```

**Key feedback loops:**
- High unemployment (low `employment` ratio) creates negative migration, reducing residential demand.
- The `laborBase` ratio connects workers to industry/commerce --- too many workers relative to jobs drives commercial/industrial demand up.
- The `internalMarket` term means commercial demand scales with total population --- bigger cities need more commerce.
- Tax rates feed through `TaxTable[]`, a hardcoded lookup indexed by effective tax rate + difficulty level. Higher taxes suppress all three demand types.
- Demand caps (`resCap`, `comCap`, `indCap`) gate growth behind specific buildings: the stadium unlocks residential demand past ~50k pop, the airport unlocks commercial, and the seaport unlocks industrial. This creates the classic SimCity progression milestones.

### 2.7 Source File Map

The MicropolisJ codebase (`micropolis-java/src/micropolisj/engine/`) contains 45 files. The key simulation files:

| File | Purpose |
|------|---------|
| `Micropolis.java` | Main engine: simulation loop, `powerScan()`, `setValves()`, `crimeScan()`, `ptlScan()` |
| `MapScanner.java` | Zone scanning dispatch: `doResidential()`, `doCommercial()`, `doIndustrial()` with growth/decline logic |
| `TrafficGen.java` | Random-walk traffic model: `makeTraffic()`, `driveDone()` |
| `TerrainBehavior.java` | Non-zone tile behavior: roads, rails, fire spread, flooding |
| `TileBehavior.java` | Abstract base for all tile behavior dispatch |
| `Tiles.java` + `TileConstants.java` | Tile sprite IDs and their semantic meanings (zone type, population, powered state) |
| `TileSpec.java` | Tile metadata loaded from `tiles.rc` --- maps sprite IDs to properties |
| `MapGenerator.java` | Terrain generation: rivers, lakes, forests, coastlines |
| `CityBudget.java` | Budget math: tax collection, department funding |
| `CityEval.java` | Mayor approval rating, city problems ranking |
| `BuildingTool.java` / `RoadLikeTool.java` | Player tool actions: zone placement, road drawing |

---

## 3. OpenTTD Architecture

OpenTTD is the open-source reimplementation of Transport Tycoon Deluxe, under continuous development since 2004. With over 20 years of refinement and a codebase exceeding 300,000 lines of C++, it represents perhaps the most mature open-source simulation of its kind.

**Repository:** [OpenTTD/OpenTTD](https://github.com/OpenTTD/OpenTTD)
**Documentation:** [docs.openttd.org](https://docs.openttd.org/source/)
**Decoded walkthrough:** [MaiZure's Decoded: OpenTTD](https://www.maizure.org/projects/decoded-openttd/index.html)

### 3.1 Map Representation

OpenTTD stores its world as a flat array of `Tile` structs. Each tile occupies 8 bytes, packed into bitfields historically labeled `m1` through `m7` plus `type` and `height`. The map must be a rectangle with power-of-two side lengths, up to 4096x4096 tiles.

The tile struct stores:
- **type**: What kind of tile (clear, rail, road, water, station, industry, town building, etc.)
- **height**: Elevation of the tile corner
- **owner**: Which player owns the tile (player indices 0+, with special constants for town-owned, water, etc.)
- **m1--m7**: Packed bitfields whose meaning depends on the tile type

Access is mediated by accessor functions (`TileHeight()`, `TileX()`, `TileXY()`, etc.) so the internal storage can change without affecting the rest of the codebase. This accessor pattern --- rather than direct array access --- was a deliberate design decision that has allowed the tile format to evolve over two decades.

Earlier versions used two separate global arrays (`_m` and `_me`) accessed through pointer arithmetic. Recent refactoring (PR #10380) hid the `Tile` and `TileExtended` implementation details behind a `Map` accessor structure, further abstracting the storage.

```
Tile layout (8 bytes per tile):
+------+--------+----+----+----+----+----+----+----+
| type | height | m1 | m2 |   m3   | m4 | m5 | m6 | m7 |
+------+--------+----+----+--------+----+----+----+----+
  enum    uint8   -- meaning depends on tile type --
```

The overloaded meaning of `m1`--`m7` per tile type is documented in the wiki's [MapRewriteDesign](https://wiki.openttd.org/en/Archive/Development/MapRewriteDesign) pages. This is the classic "union-style" approach to tile storage: maximum memory density at the cost of semantic clarity.

### 3.2 Pathfinding (YAPF)

YAPF (Yet Another Pathfinder) is OpenTTD's third-generation pathfinding system, replacing the older NTP and NPF algorithms. Its design goals were NPF's flexibility with dramatically better performance.

**Key design decisions:**

1. **Template-based architecture**: YAPF uses C++ templates extensively so that vehicle-type-specific cost functions and node types can be inlined by the compiler. The template instantiation eliminates virtual dispatch overhead in the inner loop. This is visible in files like `yapf_costrail.hpp`, `yapf_node_rail.hpp`, and `yapf_destrail.hpp`.

2. **A\* with domain-specific cost functions**: The core algorithm is A\* (open list with priority, closed list for visited nodes), but the cost function varies per vehicle type:
   - **Rail**: Costs account for track length, slopes, curves, signal states, station penalties, and reserved path segments. A red signal adds a configurable penalty. Sharp curves cost more than gentle ones.
   - **Road**: Simpler costs --- path length, slopes, traffic lights.
   - **Ship**: Even simpler, primarily distance-based with obstacle avoidance.

3. **Segment-based for rail**: Rather than evaluating tile-by-tile, YAPF for trains works in "segments" --- stretches of track between junctions or signals. This dramatically reduces the search space compared to per-tile pathfinding.

**Cost components for rail pathfinding** (from `yapf_costrail.hpp`):

| Factor | Penalty | Notes |
|--------|---------|-------|
| Tile traversal | Base cost per tile | Scales with track type |
| Slope | Configurable multiplier | Hills are expensive |
| Curve (45 deg) | Small penalty | Encourages straight routes |
| Curve (90 deg) | Large penalty | Strongly discourages sharp turns |
| Red signal | Configurable, large | Trains avoid blocked paths |
| Station | Medium penalty | Trains avoid unnecessary station stops |
| Path reservation conflict | Very large | Prevents deadlocks |

### 3.3 YAPF Deep Dive: Cost Constants and Caching

Examining the actual YAPF source files (`src/pathfinder/yapf/`) reveals the concrete implementation details behind the abstract architecture above.

**Base cost constants** (from `pathfinder_type.h`):

```cpp
static const int YAPF_TILE_LENGTH        = 100;  // cost of one straight tile
static const int YAPF_TILE_CORNER_LENGTH = 71;   // cost of a diagonal tile (100/sqrt(2))
static const int YAPF_INFINITE_PENALTY   = 1000 * YAPF_TILE_LENGTH;  // 100,000
```

All other penalties are expressed as multiples of `YAPF_TILE_LENGTH`. The default values (from `table/settings/pathfinding_settings.ini`):

| Setting | Default | Actual cost |
|---------|---------|-------------|
| `rail_curve45_penalty` | 1 | 100 |
| `rail_curve90_penalty` | 6 | 600 |
| `rail_slope_penalty` | 2 | 200 |
| `rail_firstred_penalty` | 10 | 1,000 |
| `rail_firstred_exit_penalty` | 100 | 10,000 |
| `rail_lastred_penalty` | 10 | 1,000 |
| `rail_lastred_exit_penalty` | 100 | 10,000 |
| `rail_station_penalty` | 10 | 1,000 |
| `rail_depot_reverse_penalty` | 50 | 5,000 |
| `rail_crossing_penalty` | 3 | 300 |
| `rail_pbs_cross_penalty` | 3 | 300 |
| `rail_pbs_signal_back_penalty` | 15 | 1,500 |
| `rail_shorter_platform_penalty` | 40 | 4,000 |
| `road_slope_penalty` | 2 | 200 |
| `road_curve_penalty` | 1 | 100 |
| `road_crossing_penalty` | 3 | 300 |
| `road_stop_penalty` | 8 | 800 |
| `road_stop_bay_occupied_penalty` | 15 | 1,500 |
| `max_search_nodes` | 10,000 | (node limit) |

**The A\* core** (`yapf_base.hpp`) implements a textbook A\* with dual storage:

```cpp
// From nodelist.hpp --- open list uses both hash table AND binary heap
std::deque<Titem> items;                          // node storage
HashTable<Titem, Thash_bits_open>  open_nodes;    // O(1) key lookup
CBinaryHeapT<Titem>                open_queue;    // O(log n) priority
HashTable<Titem, Thash_bits_closed> closed_nodes; // O(1) visited check
```

The main search loop:

```cpp
inline bool FindPath(const VehicleType *v) {
    for (;;) {
        num_steps++;
        Node *best = nodes.GetBestOpenNode();       // peek at heap top
        if (best == nullptr) break;                  // exhausted
        if (Yapf().PfDetectDestination(*best)) {
            best_dest_node = best;
            break;                                   // found destination
        }
        Yapf().PfFollowNode(*best);                  // expand children
        if (max_search_nodes != 0
            && nodes.ClosedCount() >= max_search_nodes) break;
        nodes.PopOpenNode(best->GetKey());
        nodes.InsertClosedNode(*best);
    }
    return (best_dest_node != nullptr);
}
```

**Segment-based pathfinding for rail.** Rather than evaluating every tile, YAPF collapses straight track between junctions into "segments." A segment ends when the traversal encounters a junction (choice point), station, depot, waypoint, signal, dead end, or rail type change. This is enumerated in `yapf_type.hpp`:

```cpp
enum class EndSegmentReason : uint8_t {
    DeadEnd, RailType, InfiniteLoop, SegmentTooLong,
    ChoiceFollows, Depot, Waypoint, Station, SafeTile,
    // internal-only reasons:
    PathTooLong, FirstTwoWayRed, LookAheadEnd, TargetReached,
};
```

The segment key packs tile index and trackdir into a single 32-bit value (`CYapfRailSegmentKey`), enabling fast hashing:

```cpp
struct CYapfRailSegmentKey {
    uint32_t value;
    void Set(const CYapfNodeKeyTrackDir &node_key) {
        this->value = (node_key.tile.base() << 4) | node_key.td;
    }
};
```

**Global segment cost cache** (`yapf_costcache.hpp`). Segment costs are cached in a global hash table (14-bit, i.e., 16,384 buckets). The cache is invalidated by a single global counter:

```cpp
static int s_rail_change_counter;
static void NotifyTrackLayoutChange(TileIndex, Track) {
    s_rail_change_counter++;  // any track edit invalidates entire cache
}
```

When the counter changes, the entire cache is flushed. This is coarse-grained but simple --- and since track layout changes are rare relative to pathfinding queries, the hit rate is high. The pathfinder tracks cache performance:

```cpp
int stats_cost_calcs = 0;    // fresh calculations
int stats_cache_hits = 0;    // reused from cache
// cache hit ratio = cache_hits / (cache_hits + cost_calcs) * 100%
```

**Signal look-ahead penalty.** For congestion-aware routing, YAPF applies a polynomial penalty based on signal density:

```
penalty = p0 + p1*i + p2*i^2
```

Where `i` is the signal index (0 = next signal, 1 = signal after that, etc.) and the defaults are `p0=500, p1=-100, p2=5`. This produces a decreasing penalty series: `{500, 405, 320, 245, 180, 125, 80, 45, 20, 5}` for signals 0--9. The effect: trains strongly avoid the immediately-next red signal but care less about distant ones, naturally distributing traffic across parallel routes.

**How it handles thousands of vehicles.** Three mechanisms combine:
1. **Node limit**: `max_search_nodes = 10,000` caps the A\* expansion per query, preventing pathological cases.
2. **Segment caching**: Reusing segment costs across vehicles means the first train on a route pays the full computation; subsequent trains get cache hits.
3. **Template inlining**: The C++ template architecture ensures cost functions are fully inlined by the compiler, eliminating virtual dispatch overhead in the inner loop.

**YAPF source files** (`src/pathfinder/yapf/`):

| File | Purpose |
|------|---------|
| `yapf_base.hpp` | Core A\* loop, `FindPath()`, node expansion |
| `yapf_costrail.hpp` | Rail cost functions: curves, slopes, signals |
| `yapf_costcache.hpp` | Global segment cost cache |
| `yapf_costbase.hpp` | Base slope cost logic |
| `yapf_node_rail.hpp` | Rail node + segment data structures |
| `yapf_node_road.hpp` | Road node structure |
| `yapf_node_ship.hpp` | Ship node structure |
| `yapf_type.hpp` | EndSegmentReason enum, type definitions |
| `yapf_rail.cpp` | Rail pathfinder entry points, template instantiation |
| `yapf_road.cpp` | Road vehicle pathfinder |
| `yapf_ship.cpp` | Ship pathfinder |
| `nodelist.hpp` | Open/closed list with hash table + binary heap |

### 3.4 Economic Model

OpenTTD's economy revolves around cargo delivery. Payment depends on three factors: cargo quantity, delivery speed, and cargo perishability. Each cargo type has a time-value curve --- passengers lose value quickly if not delivered promptly, while coal remains valuable for longer.

Town growth is driven by cargo delivery. In temperate climate, simply running a bus service between towns causes population growth. Production of raw materials at industries occurs 8--9 times per month (every 256 ticks), with the exact count depending on month length.

Station ratings determine what fraction of produced cargo a station captures. Ratings are recomputed every 185 ticks (2.5 in-game days) based on factors including vehicle speed, waiting time, and station age. This creates a feedback loop: better service improves ratings, which captures more cargo, which generates more revenue.

### 3.5 Tick System

The smallest time unit is a tick, of which there are 74 per in-game day (each tick = 27 milliseconds at normal speed). Different systems update at different cadences:

- **Vehicle movement**: Every tick (trains/aircraft process twice per tick)
- **Station ratings**: Every 185 ticks
- **Town growth**: Varies by town size; checked on "world ticks"
- **Industry production**: Every 256 ticks
- **Economy/inflation**: Monthly

Vehicle speed uses fixed-point arithmetic: raw speed is added to a `subspeed` accumulator each tick, and the integer part determines how many sub-tile positions the vehicle advances. The fractional remainder carries over to the next tick. This allows smooth movement at any speed without floating-point math.

**The game loop** (from MaiZure's decoded walkthrough of `StateGameLoop()`):

1. Tile animations execute via pre-registered function pointers.
2. `IncreaseDate()` advances the calendar, firing daily/monthly/yearly events.
3. `RunTileLoop()` pseudorandomly cycles through all map tiles --- every tile is processed once per 256 ticks. This means a 256x256 map has 65,536 tiles, each visited exactly once per 256-tick cycle (256 tiles per tick).
4. `CallVehicleTicks()` updates every vehicle for movement, cargo loading, and status changes. Trains and aircraft process twice per tick.
5. `CallLandscapeTick()` handles town growth, industry production, and company updates.
6. AI and game scripts (written in Squirrel scripting language) execute their queued actions.
7. Window events and UI updates occur last.

The design principle from the OpenTTD documentation: "the shortest path through the game loop is short. A game loop should only do work when there's work to be done."

---

## 4. Citybound

Citybound is Anselm Eickhoff's ambitious open-source city simulation written in Rust, pursuing a radically different philosophy from the statistical models of SimCity: every trip, every household, every economic transaction is simulated individually at the microscopic level.

**Repository:** [citybound/citybound](https://github.com/citybound/citybound)
**Dev blog:** [aeplay.org/citybound-devblog](https://aeplay.org/citybound-devblog)
**Website:** [aeplay.org/citybound](https://aeplay.org/citybound)

### 4.1 The Kay Actor System

At Citybound's core is Kay, a custom actor-system framework inspired by Erlang's concurrency model but implemented in Rust for performance and type safety.

**Key properties of Kay:**
- Actors can only mutate their own state --- complete isolation
- Communication is via asynchronous message passing
- Low-level optimizations for cache locality (actors of the same type are stored contiguously in memory)
- Distributed dynamic dispatch and broadcast messages
- Compiles to WebAssembly for browser-based interaction
- Type-safe inter-actor messaging at both the Rust and WebAssembly boundary

The actor system provides the foundation for scaling simulation across cores and eventually across machines. Each subsystem (transport, economy, land use) is composed of actors that communicate through messages rather than shared mutable state.

**API structure** (from the [Rust docs](https://citybound.github.io/citybound/kay/index.html)):

```rust
pub struct ActorSystem {
    // manages all registered actor types,
    // their instances, and message routing
}
```

### 4.2 Lane-Based Traffic

Citybound's traffic simulation is its most technically distinctive feature. Early prototypes demonstrated real-time simulation of up to 400,000 cars --- enough for a city of roughly 4 million population.

**The core insight: lanes are actors, not cars.**

In Citybound, one lane is the atomic actor that updates all the cars on it in a single pass. Cars on a lane move like a train --- they follow the lane geometry and only move laterally when switching between lanes. This design choice has profound implications:

1. **Cache-friendly updates**: All cars on a lane are stored contiguously. Updating them is a single linear sweep, which is ideal for CPU cache performance.
2. **Minimal synchronization**: Cars on one lane rarely need to communicate with cars on other lanes (only during lane changes and at intersections).
3. **Natural LOD**: Distant lanes can update less frequently or use simplified physics without breaking the actor model.

**Car behavior** uses the Intelligent Driver Model (IDM), a well-established traffic flow model from transportation engineering. IDM computes acceleration as a function of desired speed, current speed, distance to the car ahead, and speed difference with the car ahead. Citybound extends IDM to multi-lane traffic with lane-change decision logic.

### 4.3 Internet-Style Routing

Because Citybound's road network changes frequently (the player is constantly building and modifying roads), traditional pathfinding approaches that require expensive precomputation are unsuitable. Instead, Citybound borrows from internet routing protocols:

**Routing information is stored in the road network itself.** Each road segment maintains a routing table that is dynamically updated and propagated through the network, similar to how internet routers exchange routing tables. When a road is added or removed, only the affected portion of the routing table needs updating --- changes propagate outward from the modification point.

This is fundamentally different from A\* pathfinding (which computes routes on-demand from scratch) or precomputed shortest-path databases (which require full recomputation when the graph changes). It is closer to a distance-vector routing protocol: each node knows the next hop toward any destination, and this information is maintained incrementally.

### 4.4 Household Economy

Every household in Citybound is an individually simulated actor with a precise real-time inventory of resources --- not just tangible goods (groceries, raw materials, money) but intangible concepts (sleep, health, recreation, workforce, touristic interest, business services).

Households make decisions based on their resource needs: a family needs groceries, so a family member makes a trip to a commercial building. The commercial building needs to restock, so its employee makes a trip to a wholesaler. This creates emergent supply chains without top-down market simulation.

The economic model uses a "resource" abstraction for everything --- tangible goods and intangible services alike. Each household evaluates its resource deficits, selects trade partners based on price, quality, and transport reachability, and generates trips to fulfill needs. This means traffic patterns emerge directly from economic activity rather than being statistically generated.

### 4.5 Actors vs. ECS: Eickhoff's Rationale

Anselm Eickhoff explicitly chose actors over Entity-Component Systems (ECS), despite ECS being the dominant paradigm in game engine architecture. His rationale, expressed on the Citybound website and dev blog:

**Why not ECS:** ECS excels when all entities of a type need identical per-frame updates (e.g., transform all positions by velocity). But Citybound's entities interact asynchronously --- a household decides to go shopping at an unpredictable time, sends a message to the transport system, which routes a car through lanes. ECS's "system iterates over all components" pattern does not naturally express these event-driven interactions.

**Why actors:** The actor model provides:
1. **Natural distribution.** Actors communicate only via messages, so they can run on different threads or different machines without code changes. This enables Citybound's collaborative multiplayer vision --- multiple players can edit the same city with their simulation nodes communicating over the network.
2. **Encapsulation.** Each actor owns its state exclusively. No shared mutable state means no data races, which Rust's ownership system enforces at compile time.
3. **Selective update.** Unlike ECS where every system runs every frame, actors only process messages when they have work to do. A household sleeping does not consume CPU cycles.

**Borrowing from ECS:** Kay borrows ECS's data-oriented design principles for *storage*. Actors of the same type are stored contiguously in memory (like ECS components), enabling cache-friendly iteration when bulk updates are needed. The key distinction is that the *update pattern* is message-driven (actor) rather than query-driven (ECS).

Eickhoff's tagline for Citybound --- "The city is us" --- reflects the core philosophy: urban systems emerge from millions of individual interactions, not from top-down statistical formulas. Every household, every business, every trip is a discrete actor making decisions. The macroscopic behavior of the city is an emergent property of microscopic agency.

### 4.6 Source Code Organization

The `cb_simulation` crate (Rust, ~84% of the codebase) is structured around domain modules:

| Module | Purpose |
|--------|---------|
| `transport/` | Lane-based traffic, pathfinding, routing tables |
| `economy/` | Household resources, trade, market simulation |
| `planning/` | Player interaction: road drawing, zoning, undo/redo |
| `land_use/` | Zoning, building placement, lot subdivision |

Supporting crates:
- `cb_browser_ui` --- WebAssembly-compiled frontend (JavaScript/TypeScript, 7.4% of code)
- `cb_time` --- Simulation clock and scheduling
- `cb_util` --- Shared utilities
- `cb_server` --- Backend coordination for multiplayer

The project compiles to both native (for the simulation server) and WebAssembly (for the browser-based UI), with type-safe message passing across the Rust-WASM boundary.

---

## 5. Other Projects

### 5.1 Lincity-NG

**Repository:** [lincity-ng/lincity-ng](https://github.com/lincity-ng/lincity-ng)
**Language:** C++ (C++17), SDL2, OpenGL
**License:** GPL-2.0

Lincity-NG's most interesting contribution is its **commodity transport model**. The simulation tracks multiple resource types flowing through the city: high-voltage power, low-voltage power, labor, goods, raw materials (ore, steel, coal), water, and services (education, health, fire protection, leisure). Each building module consumes and produces specific commodities, and the transport network must connect producers to consumers.

The codebase is organized with each building type as a separate module in `src/lincity/modules/` (e.g., `shanty.cpp`, `coalmine.cpp`). Each module implements a standard interface for commodity consumption, production, and transport. This module-per-building-type pattern is clean and extensible.

The simulation considers multiple constraints simultaneously: population, employment, water management, ecology, goods availability, raw material supply, energy (including finite coal reserves plus renewable solar/wind), finance, pollution, and transport. The interplay of these constraints creates emergent economic behavior --- a coal shortage cascades into power failures, which cascade into industrial shutdown, which cascades into unemployment.

### 5.2 Unknown Horizons

**Repository:** [unknown-horizons/unknown-horizons](https://github.com/unknown-horizons/unknown-horizons)
**Language:** Python 3 (originally Python 2, migrated in 2019)
**Engine:** FIFE (being ported to Godot)
**License:** GPL-2.0

Unknown Horizons is an Anno-style colony simulation. Its architectural interest lies in several areas:

- **Python for rapid prototyping**: The choice of Python over C++ enabled fast iteration on game logic at the cost of simulation performance. The FIFE engine handles rendering in C++, while game logic runs in Python.
- **Extensive design documentation**: The project maintains detailed design documents covering everything from menu flow to individual unit behavior, which is unusual for open-source games.
- **Production chain simulation**: Like Anno, the game models complex production chains where raw materials flow through processing buildings to produce finished goods. Each production step has timing, worker requirements, and resource dependencies.

The ongoing port from FIFE to Godot reflects a broader trend in open-source games: purpose-built engines become maintenance burdens, and mature general-purpose engines offer better long-term sustainability.

### 5.3 OpenCity

**Repository:** [frodrigo/opencity](https://github.com/frodrigo/opencity)
**Language:** C++, OpenGL, SDL
**License:** GPL-2.0

Started in 2003 by Duong-Khang Nguyen, OpenCity is notable primarily as an **educational resource**. The project explicitly positions itself as an OpenGL/SDL/C++ game programming tutorial. The resources section includes micro-simulator algorithms, design documents, and UML diagrams.

The simulation follows the SimCity template: R/C/I zoning, power grid connectivity, road-connected growth. The zones depend on each other to grow (residential needs commercial for jobs, commercial needs industrial for goods). The implementation is straightforward enough to serve as a readable introduction to city simulation mechanics without the complexity of Micropolis's optimized C code.

### 5.4 Thrive

**Repository:** [Revolutionary-Games/Thrive](https://github.com/Revolutionary-Games/Thrive)
**Language:** C# (Godot), with native C++ for performance-critical simulation
**License:** GPL-3.0

Thrive is an evolution game rather than a city builder, but its architecture is relevant for one pattern: **native code offloading**. The game runs in Godot with C# scripting, but heavy simulation tasks (physics via Jolt, complex biological simulations) are implemented in C++ and accessed through native bindings.

The code is organized by game stage --- microbe stage, multicellular stage, etc. --- with shared features residing in the earliest stage that requires them. This "feature lives where it was first needed" pattern is pragmatic but can lead to organizational confusion as features are reused in later stages.

### 5.5 A/B Street (Rust Traffic Simulation)

**Repository:** [a-b-street/abstreet](https://github.com/a-b-street/abstreet)
**Language:** Rust (98.2%)
**License:** Apache-2.0
**Stars:** ~8,100

A/B Street is a transportation planning tool that simulates cars, bikes, buses, and pedestrians on real-world street networks imported from OpenStreetMap. While not a city builder, its traffic simulation is among the most technically sophisticated open-source implementations available.

**Discrete event simulation.** Unlike fixed-timestep simulations (where every agent updates every 0.1s), A/B Street uses a priority queue of future events. The scheduler (`sim/src/scheduler.rs`) maintains a binary heap:

```rust
pub struct Scheduler {
    items: BinaryHeap<PriorityQueueItem<Time, CommandType>>,
    queued_commands: HashMap<CommandType, (Command, Time)>,
    latest_time: Time,
    // ...
}
```

Events include `SpawnCar`, `UpdateCar`, `UpdatePed`, `UpdateIntersection`, `UpdateLaggyHead`, and `StartBus`. When an event fires, the agent transitions to a new state and schedules its next event. Time jumps directly to the next event --- an empty road advances time in large leaps, while a congested intersection processes events every fraction of a second.

**Car state machine.** Vehicles cycle through discrete states:

```rust
pub enum CarState {
    Crossing { time_int, dist_int, steep_uphill },
    Queued { blocked_since, want_to_change_lanes },
    WaitingToAdvance { blocked_since },
    Unparking { front, spot, time_int, blocked_starts },
    Parking(dist, spot, time_int),
    ChangingLanes { from, to, new_time, new_dist, lc_time },
    IdlingAtStop(dist, time_int),
}
```

Cars follow a queue-based model rather than continuous physics: each car has a position in a queue on a lane segment, with `FOLLOWING_DISTANCE` maintaining safe gaps. When a leader leaves, followers transition from `Queued` to `Crossing`. Lane changes require `TIME_TO_CHANGE_LANES` (1 second) and sufficient gap in the target lane.

**Why this matters for Bitborough:** A/B Street demonstrates that discrete event simulation can handle city-scale traffic without fixed-timestep overhead. The priority queue approach naturally scales --- agents that are idle (parked, sleeping) consume zero CPU until their next scheduled event.

**Source organization** (`sim/src/`):

| File | Purpose |
|------|---------|
| `scheduler.rs` | Event priority queue, time advancement |
| `mechanics/driving.rs` | Car movement, lane changes, car-following model |
| `mechanics/parking.rs` | Parking search and spot management |
| `mechanics/walking.rs` | Pedestrian movement |
| `mechanics/intersection.rs` | Signal phases, conflict detection |
| `router.rs` | Pathfinding (Contraction Hierarchies on the road graph) |
| `trips.rs` | Trip planning: origin, destination, mode choice |
| `transit.rs` | Bus routes, stops, schedules |

### 5.6 Egregoria (Rust City Builder)

**Repository:** [Uriopass/Egregoria](https://github.com/Uriopass/Egregoria)
**Language:** Rust (95.4%), WGSL shaders, Lua scripting
**License:** GPL-3.0
**Stars:** ~1,600

Egregoria is a 3D city builder inspired by Cities: Skylines, with the distinguishing philosophy that "each individual has its own thought model, meaning every action has its importance and influences the environment." It pursues the same microscopic simulation philosophy as Citybound but with a more practical, game-focused approach.

**Simulation architecture** (`simulation/src/`):

| Module | Purpose |
|--------|---------|
| `economy/` | Labor market, trade, government finances |
| `transportation/` | Vehicle and pedestrian movement, road networks |
| `souls/` | Agent behavior --- the "thought model" for each individual |
| `map/` | Static map data |
| `map_dynamic/` | Dynamic map features (construction, demolition) |
| `multiplayer/` | Networking for collaborative play |
| `world.rs` | Central world state |
| `world_command.rs` | Command processing (player actions, simulation events) |

**Spatial grid for traffic.** Egregoria uses a flat spatial grid (`flat_spatial::Grid`) for collision detection and proximity queries among moving entities:

```rust
pub type TransportGrid = flat_spatial::Grid<TransportState, Vec2>;

pub struct TransportState {
    pub dir: Vec2,
    pub speed: f32,
    pub radius: f32,
    pub height: f32,
    pub group: TransportationGroup,  // Vehicles or Pedestrians
}
```

The grid synchronizes with world state each frame, enabling efficient nearest-neighbor queries for vehicle interactions. The `maintain_deterministic()` call ensures reproducible simulation --- critical for multiplayer sync.

**Economy model.** Workers consume resources at a fixed rate (`WORKER_CONSUMPTION_PER_MINUTE = 10 cents`), deducted from government funds each game minute. Trade occurs between entities (humans, companies, freight stations), with job openings treated as tradeable items:

```rust
if trade.kind == job_opening {
    if let SoulID::GoodsCompany(id) = trade.seller.0 {
        comp.workers.0.push(trade.buyer.0.try_into().unwrap());
    }
}
```

**Why this matters for Bitborough:** Egregoria demonstrates that microscopic agent simulation is achievable in a practical game context with Rust. Its use of a spatial grid for traffic (rather than Citybound's lane-as-actor model) is a more conventional approach that still achieves good performance. The `world_command.rs` pattern --- centralizing all mutations through a command pipeline --- is worth studying for undo/redo and multiplayer.

### 5.7 OpenLoco

**Repository:** [OpenLoco/OpenLoco](https://github.com/OpenLoco/OpenLoco)
**Language:** C++ (98.7%)
**License:** MIT
**Stars:** ~1,200

OpenLoco is a complete C++ reimplementation of Chris Sawyer's Locomotion (2004), a transport tycoon game originally written in x86 assembly. As of late 2025, the team completed reimplementing the entire game in C++, making it the second fully-reversed Sawyer game (after OpenTTD for Transport Tycoon Deluxe).

**Technical interest:**
- **Assembly-to-C++ translation methodology.** The project systematically reversed each assembly function into readable C++, providing a case study in large-scale reverse engineering of a commercial game.
- **Transport simulation.** Like OpenTTD, it models road, rail, air, and sea transport with individual vehicles, cargo routing, and station economics.
- **Save format constraints.** The project remains constrained by the original SV5/SC5 save format, which limits map size and vehicle counts. This is an instructive example of how serialization format choices can permanently constrain a codebase.

**Source organization** (`src/`): Core, Diagnostics, Engine, Gfx, Math, Platform, Resources, Utility, Version --- a clean modular structure with `clang-format` enforcing consistent style across 4,000+ commits.

### 5.8 CorsixTH

**Repository:** [CorsixTH/CorsixTH](https://github.com/CorsixTH/CorsixTH)
**Language:** Lua (76.4%), C++ (15.9%)
**License:** MIT
**Stars:** ~3,200

CorsixTH is an open-source reimplementation of Theme Hospital (1997). While not a city builder, it models service coverage patterns that are directly relevant to any simulation with service buildings (hospitals, police stations, fire stations).

**Architecture:** The game splits cleanly between a C++ engine (rendering, audio, file I/O) and Lua scripting for all game logic. The Lua layer contains ~46 files organized by domain:

| File | Purpose |
|------|---------|
| `hospital.lua` | Hospital management, staff hiring, room construction |
| `room.lua` | Room behavior, service coverage, patient processing |
| `queue.lua` | Patient queuing systems with priority and overflow |
| `entity.lua` / `entity_map.lua` | Entity system with spatial tracking |
| `humanoid_action.lua` | Individual action behaviors (walk, use object, sit) |
| `epidemic.lua` | Disease outbreak mechanics |
| `research_department.lua` | Tech tree progression |

**Service coverage model.** CorsixTH models service as queue-based: patients arrive, get diagnosed, queue for treatment rooms, and occupy staff time. Coverage is not a radius-based influence map but a capacity-based system --- a treatment room can process N patients per time unit, and excess demand creates queues, delays, and eventually patient deaths. This queue-based approach to service coverage is an alternative to Bitborough's radial influence maps.

**Why this matters for Bitborough:** The Lua/C++ split demonstrates that scripting-language game logic can reach production quality (full campaign completable). The queue-based service model is worth considering as a complement to influence-map-based coverage --- a hospital should not just have a coverage radius but also a patient processing capacity.

### 5.9 FreeCol

**Repository:** [FreeCol/freecol](https://github.com/FreeCol/freecol)
**Language:** Java (93.6%)
**License:** GPL-2.0

FreeCol is an open-source reimplementation of Sid Meier's Colonization (1994). Its colony management system models production chains, labor allocation, and resource flows --- patterns directly relevant to any city builder's economic simulation.

**Colony management model:**
- Each colony has a population of colonists who can be assigned to production squares (farming, mining, lumber) or buildings (blacksmith, weaver, church).
- Production is deterministic: a colonist on a plains tile produces a fixed amount of grain per turn, modified by building bonuses and colony improvements.
- Resources flow through processing chains: raw cotton becomes cloth at a weaver's shop; ore becomes tools at a blacksmith; tools become muskets at an armory.
- The colony's warehouse has finite capacity, creating storage pressure that forces trade decisions.

**Why this matters for Bitborough:** FreeCol's turn-based production chain model is the simplest possible version of what Lincity-NG and Citybound simulate in real-time. The "colonist assigned to a building slot" pattern maps directly to "citizen working at a business" in a city builder.

---

## 6. Common Architectural Patterns

Across all these projects, several patterns recur independently:

### 6.1 Tile-Based Maps

Every project uses a regular grid. Even Citybound, which simulates continuous-space traffic, uses a grid for land use, zoning, and building placement. The grid provides O(1) spatial lookup, trivial neighbor iteration, and straightforward serialization.

The grid resolution varies --- Micropolis uses 120x100, OpenTTD supports up to 4096x4096, Bitborough uses configurable sizes --- but the underlying data structure is always a flat array indexed by `y * width + x`.

### 6.2 Tick-Based Simulation

Every project advances time in discrete ticks. The tick rate varies (OpenTTD: 74 ticks/day at 27ms each; Micropolis: variable speed), but the pattern is universal: each tick, run a fixed sequence of update functions. Some systems run every tick (power, movement), others at lower cadences (monthly budget, zone development).

### 6.3 Layer Buffers

Parallel arrays overlaid on the map grid store per-tile computed values. Micropolis maintains separate arrays for population density, land value, pollution, crime, traffic, and power. OpenTTD packs multiple values into the tile struct itself. Bitborough uses `Uint8Array` buffers for `powerGrid`, `landValues`, `pollutionLevel`, `crimeLevel`, `fireCoverage`, and `trafficDensity`.

The universal choice of 8-bit values (0--255) for these layers is not accidental. It provides sufficient resolution for gameplay-relevant gradients while keeping memory footprint low and enabling fast bulk operations (`fill()`, typed array copies).

### 6.4 BFS/Flood-Fill for Utility Propagation

Every project that models power or water uses BFS or flood-fill to propagate utility connectivity from source buildings through the network. Micropolis does it recursively (later converted to iterative BFS). Bitborough does it with an explicit queue. The algorithm is always the same: start at sources, walk outward through connectable tiles, mark reached tiles as serviced.

### 6.5 Phased Scanning

Rather than updating every tile every tick, simulations divide the map into regions and process one region per tick. Micropolis divides into 8 vertical strips. This amortizes the cost of expensive per-tile calculations (zone development, land value updates) across multiple ticks, keeping frame time consistent.

### 6.6 Smoothing Passes

Crime, pollution, land value, and desirability are never left as raw computed values. Every project applies one or more smoothing passes --- typically a 3x3 or 5-point stencil average --- to produce gradual falloffs instead of sharp discontinuities. This serves both realism (real-world influence fields are continuous) and gameplay (the player can reason about gradients rather than hard boundaries).

### 6.7 Agent-Based vs. Statistical Models

The fundamental architectural split in city simulation:

- **Statistical** (Micropolis, Lincity-NG, OpenCity): Aggregate behavior. No individual citizens are tracked. Population is a number per tile. Traffic density is a statistical overlay. Cheaper to compute but less emergent.
- **Agent-based** (Citybound, Bitborough's citizen system): Individual agents with home/work/commerce bindings, pathfinding, and satisfaction scores. More computationally expensive but produces richer emergent behavior (traffic jams from actual routing decisions, organic neighborhood character from household composition).

OpenTTD sits in between: individual vehicles are simulated as agents, but towns and industries are statistical.

---

## 7. Data Structures for City Simulation

### 7.1 Grid Arrays

The dominant data structure across all projects. Flat arrays indexed by tile coordinate, storing either a tile type enum (Micropolis, OpenTTD) or separate typed arrays per data layer (Bitborough).

**Micropolis** packs everything into a single tile value --- the sprite index encodes tile type, zone type, powered status, and development level. This is memory-minimal but requires constant lookup-table indirection to extract semantic meaning.

**OpenTTD** uses a struct-of-arrays approach: the tile type, height, and m1--m7 bytes are stored in a flat array of 8-byte structs. The total map memory for a 4096x4096 map is `4096 * 4096 * 8 = 128 MB`, which is significant but manageable.

**Bitborough** uses separate `Uint8Array` buffers for each layer. This is clean (each array has clear semantics) and TypeScript-friendly (typed arrays provide both performance and type safety). The tradeoff is cache pressure: accessing multiple layers for the same tile requires reading from multiple memory locations.

### 7.2 Spatial Indexes

Flat grids provide O(1) lookup by coordinate but O(n) lookup by entity. When you need to find "all buildings within radius R of this tile," a spatial index accelerates the query.

**Bitborough** uses a `BuildingIndex` that maps tile coordinates to buildings, rebuilt once per monthly tick. This provides O(1) building-at-tile lookup but does not support radius queries directly.

**OpenTTD** relies on the tile array itself as a spatial index (since buildings occupy specific tiles) combined with separate linked lists for vehicles at stations.

**Citybound** uses the actor registry as an implicit spatial index --- actors (lanes, buildings) know their own position, and spatial queries are performed by broadcasting messages to actors in a region.

### 7.3 Adjacency Graphs

Road networks are naturally graphs. Every project that does pathfinding builds some form of adjacency graph from the tile grid:

- **Bitborough**: `RoadGraph = Map<number, number[]>` --- a `Map` from tile index to array of neighboring road tile indices. Built by scanning all road tiles and checking their four cardinal neighbors. A* runs directly on this graph.
- **OpenTTD**: Implicit graph from tile connectivity, with YAPF operating on segments (junction-to-junction stretches) rather than individual tiles.
- **Citybound**: Lane-based graph where lanes are nodes and connections are edges. The graph is maintained incrementally as roads are built/demolished.

### 7.4 Influence Maps

For diffuse effects like crime, pollution, or service coverage, influence maps compute a per-tile value based on distance to source buildings. The computation pattern is either:

1. **Radial stamp**: For each source building, iterate over a square region and compute distance-decayed influence. Bitborough's `buildInfluenceMap()` in `simulation/services/influence.ts` uses this approach:
   ```
   influence = 1.0 - distance / effectiveRadius
   ```
2. **BFS diffusion**: Start from source tiles and propagate outward, decrementing a value at each step. Micropolis uses this for some influence calculations.
3. **Multi-pass smoothing**: Compute raw values, then apply repeated box blur passes. Micropolis's `doSmooth()` is the canonical example.

Each approach has different characteristics. Radial stamps are precise but expensive for many sources. BFS diffusion is cheap but produces diamond-shaped influence regions (unless you use Euclidean distance). Smoothing is simple but the result depends on the number of passes and doesn't precisely correspond to any physical model.

---

## 8. Performance Patterns

### 8.1 Phased Updates (Amortization)

The single most common optimization: do not update everything every tick. Micropolis's 8-strip zone scanning, OpenTTD's staggered industry production (every 256 ticks), and Bitborough's monthly-cadence land value/crime/demand calculations all follow this pattern.

The key insight is that most city simulation values change slowly. Crime rates do not fluctuate tick-to-tick. Land values shift over months, not seconds. By updating these systems at lower cadences, the simulation maintains responsiveness while running complex computations.

### 8.2 Template Metaprogramming (OpenTTD)

YAPF's template-based architecture eliminates virtual dispatch in the pathfinding inner loop. By making vehicle-type-specific behavior a template parameter rather than a virtual method, the compiler can inline cost calculations directly into the search loop. This is a measurable performance win when pathfinding runs for hundreds of vehicles per tick.

The tradeoff is code complexity and compile time --- YAPF's template code is among the most complex in the OpenTTD codebase.

### 8.3 Cache-Friendly Data Layout (Citybound)

Citybound's Kay actor system stores actors of the same type contiguously in memory. When updating all lanes, the CPU iterates over a contiguous memory region rather than chasing pointers. This is explicitly inspired by data-oriented design principles: structure your data for how it is accessed, not for how it is conceptually organized.

Similarly, the decision to make lanes (not cars) the atomic actor means that updating all cars on a lane is a linear memory sweep --- the cars are stored in a Vec within the lane actor, and the update loop touches them sequentially.

### 8.4 Incremental Graph Updates

Both Citybound and Bitborough maintain road graphs that must update when roads are built or demolished. The naive approach (rebuild the entire graph) is O(n) where n is the number of road tiles. The incremental approach (add/remove only affected edges) is O(1) per changed tile.

Bitborough's `updateRoadGraph()` function takes a list of changed tile positions and updates only those nodes in the `RoadGraph` map. Citybound's routing table propagation similarly updates incrementally, with changes rippling outward from the modification point.

### 8.5 Fixed-Point Arithmetic (OpenTTD)

OpenTTD avoids floating-point math in simulation code. Vehicle speeds use fixed-point: raw speed is added to a `subspeed` accumulator, divided by 256, with the remainder preserved. This eliminates floating-point determinism issues (critical for multiplayer sync) and was originally a performance optimization for 1990s hardware that persists because the determinism guarantee is still valuable.

### 8.6 Reusable Buffers

Allocating and deallocating large arrays every tick creates GC pressure in managed languages and fragmentation in unmanaged ones. Bitborough pre-allocates a `Float32Array` influence buffer at construction time and reuses it across all influence map calculations:

```typescript
// Engine constructor
this.influenceBuffer = new Float32Array(size)

// Used by crime, fire coverage, etc. --- no per-tick allocation
calculateCrime(this.map, this.landValues, this.crimeLevel,
  this.funding.police, this.influenceBuffer)
```

Micropolis similarly maintains persistent arrays for its smoothing buffers rather than allocating temporaries.

---

## 9. Code Pattern Catalog

Concrete, copyable patterns extracted from the projects above. Each includes pseudocode or real code that can be adapted for any city simulation.

### 9.1 Grid-Based Influence Propagation

Three standard approaches, in order of increasing sophistication:

**Pattern A: Radial Stamp (Bitborough-style)**

For each source building, iterate over a bounding square and compute distance-decayed influence:

```
function buildInfluenceMap(sources, radius, grid, width, height):
    grid.fill(0)
    for each source in sources:
        x0 = max(0, source.x - radius)
        x1 = min(width - 1, source.x + radius)
        y0 = max(0, source.y - radius)
        y1 = min(height - 1, source.y + radius)
        for y in y0..y1:
            for x in x0..x1:
                dist = sqrt((x - source.x)^2 + (y - source.y)^2)
                if dist <= radius:
                    influence = 1.0 - dist / radius
                    grid[y * width + x] = max(grid[y * width + x], influence)
```

Properties: precise radius, O(sources * radius^2), handles overlapping sources with max(). Use Chebyshev distance (`max(|dx|, |dy|)`) instead of Euclidean to avoid `sqrt()` and get square-shaped influence zones.

**Pattern B: BFS Diffusion (Micropolis-style)**

Propagate from sources outward, decrementing a counter at each step:

```
function bfsDiffusion(sources, maxStrength, grid, width, height):
    grid.fill(0)
    queue = []
    for each source in sources:
        grid[source.y * width + source.x] = maxStrength
        queue.push({x: source.x, y: source.y, strength: maxStrength})

    while queue is not empty:
        {x, y, strength} = queue.shift()
        if strength <= 1: continue
        for each neighbor (nx, ny) of (x, y):
            if inBounds(nx, ny) and grid[ny * width + nx] < strength - 1:
                grid[ny * width + nx] = strength - 1
                queue.push({x: nx, y: ny, strength: strength - 1})
```

Properties: produces diamond-shaped influence (Manhattan distance), O(maxStrength^2 * sources), naturally handles obstacles (skip non-traversable tiles). Good for utility connectivity.

**Pattern C: Multi-Pass Smoothing (Micropolis doSmooth)**

Compute raw values per tile, then blur repeatedly:

```
function smooth(src, dest, width, height):
    for y in 0..height:
        for x in 0..width:
            sum = src[y * width + x]
            count = 1
            if x > 0:     sum += src[y * width + (x-1)]; count++
            if x < w - 1: sum += src[y * width + (x+1)]; count++
            if y > 0:     sum += src[(y-1) * width + x]; count++
            if y < h - 1: sum += src[(y+1) * width + x]; count++
            dest[y * width + x] = sum / count

// Apply twice for gentle gradients:
smooth(rawCrime, tempBuffer, w, h)
smooth(tempBuffer, crimeLevel, w, h)
```

Properties: O(width * height) per pass, produces natural-looking falloffs. Two passes approximate a Gaussian blur. Use double-buffering (src/dest swap) to avoid read-after-write artifacts.

### 9.2 Demand Calculation with Feedback Loops

The Micropolis valve system, generalized to pseudocode:

```
// Run every N simulation ticks (not every frame)
function updateDemand(state):
    // 1. Compute ratios between zone types
    employmentRatio = (comPop + indPop) / max(1, resPop)
    laborRatio = resPop / max(1, comPop + indPop)
    laborRatio = clamp(laborRatio, 0.0, 1.3)

    // 2. Project future demand based on current imbalances
    migration = resPop * (employmentRatio - 1.0)  // positive when jobs > workers
    births = resPop * BIRTH_RATE                    // constant growth pressure
    projectedRes = resPop + migration + births

    internalMarket = (resPop + comPop + indPop) / MARKET_DIVISOR
    projectedCom = internalMarket * laborRatio

    projectedInd = indPop * laborRatio * difficultyMultiplier

    // 3. Convert projections to demand deltas
    resDelta = (projectedRes - resPop) * SENSITIVITY + taxPenalty
    comDelta = (projectedCom - comPop) * SENSITIVITY + taxPenalty
    indDelta = (projectedInd - indPop) * SENSITIVITY + taxPenalty

    // 4. Accumulate into valves with clamping
    resValve = clamp(resValve + resDelta, -MAX_VALVE, MAX_VALVE)
    comValve = clamp(comValve + comDelta, -MAX_VALVE, MAX_VALVE)
    indValve = clamp(indValve + indDelta, -MAX_VALVE, MAX_VALVE)

    // 5. Gate growth behind milestones
    if resPop > RES_CAP_THRESHOLD and not hasStadium: resValve = min(resValve, 0)
    if comPop > COM_CAP_THRESHOLD and not hasAirport: comValve = min(comValve, 0)
```

**Key tuning knobs:**
- `SENSITIVITY` (Micropolis uses 600) --- how fast valves respond to imbalances
- `MARKET_DIVISOR` (Micropolis uses 3.7) --- how much population drives commercial demand
- `BIRTH_RATE` (Micropolis uses 0.02) --- baseline residential growth pressure
- `MAX_VALVE` (Micropolis uses 2000) --- clamp prevents runaway demand
- `taxPenalty` --- from a lookup table indexed by tax rate and difficulty

### 9.3 Zone Development Probability

The Micropolis growth/decline roll, generalized:

```
function evaluateZone(zone, demandValve, localScore):
    // Combine global demand with local conditions
    zscore = demandValve + localScore
    if not zone.powered: zscore = -500

    // Growth roll: biased random check
    // BIAS should be large (Micropolis uses 26380 out of 32768 range)
    // Higher BIAS = slower development = more organic feel
    BIAS = 26380
    RANGE = 65536  // 16-bit random range

    roll = randomInt(RANGE) - RANGE/2   // range: [-32768, 32767]

    if zone.trafficOk and zscore > -350 and (zscore - BIAS) > roll:
        tryGrow(zone)

    if zscore < 350 and (zscore + BIAS) < roll:
        tryShrink(zone)

function tryGrow(zone):
    landValueCap = getLandValue(zone.x, zone.y) / 32
    if zone.population >= landValueCap: return  // at capacity
    if zone.population < MAX_DENSITY:
        advanceToNextDensityLevel(zone)
        adjustRateOfGrowth(zone.neighborhood, +8)

function tryShrink(zone):
    regressToPreviousDensityLevel(zone)
    adjustRateOfGrowth(zone.neighborhood, -8)
```

**Design insight:** The large BIAS value (26380 out of a 32768 half-range) means zones need a strongly positive zscore to have any real chance of growing. With `zscore = 0`, growth probability is `(0 - 26380 + 32768) / 65536 = ~9.7%` per scan. This creates the slow, organic development pace characteristic of SimCity.

### 9.4 Agent Spawning and Despawning

Pattern for managing a population of agents (citizens, vehicles, etc.) across simulation ticks:

```
function updateAgentPool(state):
    targetCount = calculateTargetPopulation(state)
    currentCount = agents.length

    // Spawn
    if currentCount < targetCount:
        deficit = targetCount - currentCount
        spawnBudget = min(deficit, MAX_SPAWNS_PER_TICK)
        for i in 0..spawnBudget:
            home = findAvailableResidence(state)
            if home is null: break
            work = findNearestJob(home, state)  // may be null (unemployed)
            agent = createAgent(home, work)
            agents.push(agent)

    // Despawn (remove agents whose homes were demolished)
    agents = agents.filter(agent =>
        state.buildings.has(agent.homeId)
    )

    // Rebalance (reassign agents with stale routes)
    for agent in agents:
        if agent.routeStale or agent.workplace demolished:
            agent.workplace = findNearestJob(agent.home, state)
            agent.routeStale = true  // will be recomputed on next route tick
```

**A/B Street approach (event-driven):**

```
function spawnAgent(origin, destination, departureTime):
    trip = Trip { origin, destination, mode: chooseBestMode() }
    scheduler.push(Event {
        time: departureTime,
        command: StartTrip(trip)
    })
    // Agent does NOT exist as an object until the event fires
    // No per-tick cost for future agents

function onStartTrip(trip):
    path = router.findPath(trip.origin, trip.destination, trip.mode)
    agent = Agent { path, state: Crossing, position: path[0] }
    scheduler.push(Event {
        time: now + travelTime(path[0]),
        command: UpdateAgent(agent.id)
    })
```

### 9.5 Save/Load Serialization Patterns

**Pattern A: Flat array dump (Micropolis/OpenTTD)**

The simplest approach --- write tile arrays as raw binary:

```
function save(state):
    header = { version, width, height, cityTime, population }
    writeHeader(file, header)
    writeRawBytes(file, state.terrain)      // Uint8Array or Uint16Array
    writeRawBytes(file, state.zoning)
    writeRawBytes(file, state.powerGrid)
    // ... each layer as a flat buffer
    writeJSON(file, state.buildings)         // structured data as JSON
    writeJSON(file, state.budget)

function load(file):
    header = readHeader(file)
    assert(header.version == CURRENT_VERSION)
    state.terrain = readRawBytes(file, header.width * header.height)
    state.zoning = readRawBytes(file, header.width * header.height)
    // ... rebuild computed layers (crime, land value) from saved state
    recalculateAllDerivedLayers(state)
```

**Key principle:** Only save source-of-truth data. Derived layers (crime, land value, traffic density, influence maps) can be recomputed from the saved state. This reduces save file size and avoids version compatibility issues when the calculation algorithms change.

**Pattern B: Versioned schema with migration (OpenTTD)**

OpenTTD maintains backward compatibility across 20+ years of save files:

```
function load(file):
    version = readSaveVersion(file)
    state = readRawState(file, version)

    // Apply migrations in order
    if version < 42: migrateV41toV42(state)  // added rail types
    if version < 87: migrateV86toV87(state)  // changed signal storage
    if version < 195: migrateV194toV195(state) // new cargo system
    // ... hundreds of migration steps

    return state
```

**Pattern C: Command replay (Egregoria/A/B Street)**

Rather than saving world state, save the sequence of player actions:

```
function save(state):
    writeJSON(file, {
        initialSeed: state.seed,
        commands: state.commandLog  // [{tick: 0, cmd: "zone", args: ...}, ...]
    })

function load(file):
    data = readJSON(file)
    state = createWorld(data.initialSeed)
    for cmd in data.commands:
        advanceSimulationTo(state, cmd.tick)
        applyCommand(state, cmd)
    return state
```

This approach guarantees exact reproduction if the simulation is deterministic, and save files are tiny. The tradeoff is that loading requires re-simulating the entire game history, which becomes slow for long games. A hybrid approach saves periodic "checkpoint" snapshots combined with command replay from the last checkpoint.

---

## 10. Lessons for Bitborough

### 10.1 Bitborough Already Follows Best Practices

Bitborough's engine independently converged on many of the patterns documented above:

- **Uint8Array layer buffers** for power, land value, pollution, crime, fire coverage, and traffic density --- matching the universal 8-bit-per-tile pattern across Micropolis, OpenTTD, and others.
- **BFS power propagation** from plant footprint tiles through connected infrastructure --- the same algorithm Micropolis uses, with the iterative queue approach that avoids the original's stack overflow issues.
- **A\* on a road adjacency graph** for citizen routing, with Manhattan-distance heuristic --- cleaner than Micropolis's random-walk traffic model, simpler than OpenTTD's template-metaprogrammed YAPF.
- **Monthly-cadence subsystem updates** (demand, land value, crime, fire, citizen routing, zone development, budget) --- the same phased-update pattern every project uses to amortize expensive computations.
- **Reusable Float32Array influence buffer** shared across crime and fire coverage calculations --- the pre-allocation pattern seen in all performance-conscious simulation code.
- **BuildingIndex spatial index** for O(1) tile-to-building lookup, rebuilt per monthly tick.

### 10.2 Patterns Worth Adopting from Micropolis

**Multi-strip zone scanning.** Bitborough currently runs all zone development in a single monthly tick. If the map grows large, this could cause frame hitches. Micropolis's 8-strip approach --- processing 1/8 of the map per tick across 8 ticks --- would amortize zone development cost without changing game semantics. The key requirement is ensuring that the RNG state remains deterministic regardless of which strip is processed when.

**Multiple smoothing passes for influence fields.** Bitborough computes crime and pollution as raw values. Adding Micropolis-style `doSmooth()` passes would produce more natural-looking gradients. Two passes of a 5-point stencil average is cheap and visually effective.

### 10.3 Patterns Worth Adopting from OpenTTD

**Segment-based pathfinding.** Bitborough's current A\* operates tile-by-tile on the road graph. For larger maps, OpenTTD's approach of collapsing straight road segments into single edges would reduce the search space. A road segment between two intersections could be a single graph edge with weight equal to tile count, rather than N individual edges.

**Fixed-point or integer-only simulation.** Bitborough's influence calculations use `Float32Array` and `Math.sqrt()`. While JavaScript engines optimize this well, switching to integer-approximated distance (e.g., Chebyshev distance or lookup-table Euclidean) would enable future deterministic multiplayer without floating-point sync issues.

**Segment cost caching.** YAPF's global segment cache (with a single invalidation counter) is a surprisingly effective pattern. Bitborough could cache A\* results between pairs of frequently-used intersections, invalidating the entire cache when any road changes. The coarse invalidation is acceptable because road edits are rare relative to pathfinding queries.

### 10.4 Patterns Worth Adopting from Citybound

**Incremental routing table updates.** Bitborough rebuilds routes when they are marked stale, but the road graph itself is maintained incrementally. Taking this further --- pre-computing "next hop" tables at intersections, Citybound-style --- would make pathfinding O(path_length) rather than O(graph_size) for common routes. This is especially valuable as citizen counts grow.

**Lane-as-actor granularity for traffic.** If Bitborough ever moves toward continuous traffic simulation (cars moving along roads in real time rather than statistical route overlays), Citybound's insight that the lane --- not the car --- should be the unit of simulation is the key performance enabler. This is a major architectural change but worth noting as a long-term direction.

### 10.5 Patterns Worth Adopting from New Projects

**Discrete event simulation (A/B Street).** Rather than updating all agents every tick, schedule events in a priority queue. Idle agents (sleeping at home, working at a job) consume zero CPU. Only transitions (departure, arrival, lane change) trigger computation. This is particularly valuable if Bitborough adds real-time citizen movement.

**Spatial grid for agent queries (Egregoria).** Egregoria's `flat_spatial::Grid` provides efficient nearest-neighbor queries for vehicle interaction. If Bitborough needs spatial queries beyond the current `BuildingIndex` (e.g., "find all citizens within radius R of a disaster"), a spatial hash grid is the standard solution.

**Queue-based service coverage (CorsixTH).** Complement Bitborough's radial influence maps with capacity-based service modeling. A hospital should not just have a coverage radius --- it should have a patient processing rate. When demand exceeds capacity, service quality degrades. This creates a natural feedback loop: overloaded hospitals reduce citizen satisfaction, driving demand for more healthcare buildings.

### 10.6 Patterns to Avoid

**Micropolis's tile-sprite-as-data encoding.** Packing zone type, development level, and powered status into a sprite index worked on the Commodore 64 but produces opaque, brittle code. Bitborough's separation of concerns (distinct arrays for terrain, zone, infrastructure, connections) is strictly superior for maintainability.

**OpenTTD's m1--m7 bitfield overloading.** The "meaning depends on tile type" approach to tile storage is a maintenance nightmare that the OpenTTD team has spent years trying to abstract away. Bitborough's typed layer buffers avoid this entirely.

**Unbounded recursive flood-fill.** The original Micropolis power propagation could overflow the call stack. Iterative BFS with an explicit queue (which Bitborough already uses) is the correct approach.

**Save format lock-in (OpenLoco).** OpenLoco's constraint to the original SV5/SC5 save format limits map size and vehicle counts permanently. Design save formats with explicit versioning and migration support from day one.

---

## Cross-References

- [SimCity Internals](./simcity-internals.md) --- System Dynamics origins, Micropolis 16-phase loop, SetValves RCI demand, GlassBox agent architecture
- [Cities: Skylines Internals](./cities-skylines-internals.md) --- Manager pattern, A* traffic pathfinding, TMPE Dynamic Lane Selection, CS2 ECS/DOTS
- [Simulation Architecture Patterns](./simulation-architecture-patterns.md) --- Statistical vs. agent-based simulation, tick loops, spatial indexing, demand models
- [Mechanics Comparison](./mechanics-comparison.md) --- Design-level comparison across commercial titles (complement to this document's code-level analysis)

---

## Sources

### Repositories

- [SimHacker/micropolis](https://github.com/SimHacker/micropolis) --- Original Micropolis GPL release (C/Tcl + Java port)
- [SimHacker/MicropolisCore](https://github.com/SimHacker/MicropolisCore) --- C++ simulation core (Emscripten/WebAssembly)
- [dheid/micropolis](https://github.com/dheid/micropolis) --- Enhanced MicropolisJ (Java port)
- [bsimser/Micropolis](https://github.com/bsimser/Micropolis) --- Unity C# rewrite with [source code description wiki](https://github.com/bsimser/Micropolis/wiki/Source-Code-Description)
- [OpenTTD/OpenTTD](https://github.com/OpenTTD/OpenTTD) --- OpenTTD main repository (300k+ lines C++)
- [citybound/citybound](https://github.com/citybound/citybound) --- Citybound main repository (~8,000 stars, Rust)
- [a-b-street/abstreet](https://github.com/a-b-street/abstreet) --- A/B Street traffic simulation (~8,100 stars, Rust)
- [Uriopass/Egregoria](https://github.com/Uriopass/Egregoria) --- Egregoria city builder (~1,600 stars, Rust)
- [OpenLoco/OpenLoco](https://github.com/OpenLoco/OpenLoco) --- OpenLoco transport sim (~1,200 stars, C++)
- [CorsixTH/CorsixTH](https://github.com/CorsixTH/CorsixTH) --- CorsixTH hospital sim (~3,200 stars, Lua/C++)
- [FreeCol/freecol](https://github.com/FreeCol/freecol) --- FreeCol colony management (Java)
- [lincity-ng/lincity-ng](https://github.com/lincity-ng/lincity-ng) --- Lincity-NG resource-flow city builder (C++)
- [frodrigo/opencity](https://github.com/frodrigo/opencity) --- OpenCity educational city sim (C++)
- [unknown-horizons/unknown-horizons](https://github.com/unknown-horizons/unknown-horizons) --- Unknown Horizons Anno-style colony sim (Python)
- [Revolutionary-Games/Thrive](https://github.com/Revolutionary-Games/Thrive) --- Thrive evolution sim (C#/C++)

### Key Source Files

**Micropolis (MicropolisJ):**
- Simulation loop + power scan + RCI valves: [`micropolis-java/src/micropolisj/engine/Micropolis.java`](https://github.com/SimHacker/micropolis/blob/master/micropolis-java/src/micropolisj/engine/Micropolis.java)
- Zone development logic: [`micropolis-java/src/micropolisj/engine/MapScanner.java`](https://github.com/SimHacker/micropolis/blob/master/micropolis-java/src/micropolisj/engine/MapScanner.java)
- Traffic random walk: [`micropolis-java/src/micropolisj/engine/TrafficGen.java`](https://github.com/SimHacker/micropolis/blob/master/micropolis-java/src/micropolisj/engine/TrafficGen.java)
- Terrain behavior (roads, fire, flood): [`micropolis-java/src/micropolisj/engine/TerrainBehavior.java`](https://github.com/SimHacker/micropolis/blob/master/micropolis-java/src/micropolisj/engine/TerrainBehavior.java)
- C++ simulation core: [`MicropolisEngine/src/simulate.cpp`](https://github.com/SimHacker/MicropolisCore/blob/main/MicropolisEngine/src/) (MicropolisCore)

**OpenTTD YAPF (all in `src/pathfinder/yapf/`):**
- Core A\* loop: [`yapf_base.hpp`](https://github.com/OpenTTD/OpenTTD/blob/master/src/pathfinder/yapf/yapf_base.hpp)
- Rail cost functions: [`yapf_costrail.hpp`](https://github.com/OpenTTD/OpenTTD/blob/master/src/pathfinder/yapf/yapf_costrail.hpp)
- Segment cost cache: [`yapf_costcache.hpp`](https://github.com/OpenTTD/OpenTTD/blob/master/src/pathfinder/yapf/yapf_costcache.hpp)
- Rail node + segment structs: [`yapf_node_rail.hpp`](https://github.com/OpenTTD/OpenTTD/blob/master/src/pathfinder/yapf/yapf_node_rail.hpp)
- Node list (open/closed): [`nodelist.hpp`](https://github.com/OpenTTD/OpenTTD/blob/master/src/pathfinder/yapf/nodelist.hpp)
- End-segment reasons: [`yapf_type.hpp`](https://github.com/OpenTTD/OpenTTD/blob/master/src/pathfinder/yapf/yapf_type.hpp)
- Rail entry points: [`yapf_rail.cpp`](https://github.com/OpenTTD/OpenTTD/blob/master/src/pathfinder/yapf/yapf_rail.cpp)
- Base cost constants: [`src/pathfinder/pathfinder_type.h`](https://github.com/OpenTTD/OpenTTD/blob/master/src/pathfinder/pathfinder_type.h)
- Default penalty values: [`src/table/settings/pathfinding_settings.ini`](https://github.com/OpenTTD/OpenTTD/blob/master/src/table/settings/pathfinding_settings.ini)
- Settings struct: [`src/settings_type.h`](https://github.com/OpenTTD/OpenTTD/blob/master/src/settings_type.h)

**OpenTTD other:**
- Tile map: [`src/tile_map.h`](https://github.com/OpenTTD/OpenTTD/blob/master/src/tile_map.h)
- Economy: [`src/economy.cpp`](https://github.com/OpenTTD/OpenTTD/blob/master/src/economy.cpp)

**Citybound:**
- Simulation crate: [`cb_simulation/src/`](https://github.com/citybound/citybound/tree/main/cb_simulation/src)
- Kay actor system: [Kay Rust docs](https://citybound.github.io/citybound/kay/index.html)

**A/B Street:**
- Event scheduler: [`sim/src/scheduler.rs`](https://github.com/a-b-street/abstreet/blob/master/sim/src/scheduler.rs)
- Driving mechanics: [`sim/src/mechanics/driving.rs`](https://github.com/a-b-street/abstreet/blob/main/sim/src/mechanics/driving.rs)

**Egregoria:**
- Transportation grid: [`simulation/src/transportation/mod.rs`](https://github.com/Uriopass/Egregoria/blob/master/simulation/src/transportation/mod.rs)
- Economy: [`simulation/src/economy/mod.rs`](https://github.com/Uriopass/Egregoria/blob/master/simulation/src/economy/mod.rs)

**Other:**
- Lincity-NG building modules: [`src/lincity/modules/`](https://github.com/lincity-ng/lincity-ng/tree/master/src/lincity/modules)
- CorsixTH game logic: [`CorsixTH/Lua/`](https://github.com/CorsixTH/CorsixTH/tree/master/CorsixTH/Lua)
- Thrive architecture: [`doc/architecture.md`](https://github.com/Revolutionary-Games/Thrive/blob/master/doc/architecture.md)

### Documentation and Analysis

- [OpenTTD Wiki: Game Mechanics](https://wiki.openttd.org/en/Manual/Game%20Mechanics/)
- [OpenTTD Wiki: Yet Another Pathfinder](https://wiki.openttd.org/en/Archive/Manual/Yet%20Another%20Pathfinder) --- YAPF design philosophy, signal look-ahead formula
- [OpenTTD Wiki: Pathfinding (Dev Black Book)](https://wiki.openttd.org/en/Archive/Source/OpenTTDDevBlackBook/Simulation/Pathfinding)
- [OpenTTD Wiki: MapRewriteDesign](https://wiki.openttd.org/en/Archive/Development/MapRewriteDesign)
- [MaiZure's Decoded: OpenTTD](https://www.maizure.org/projects/decoded-openttd/index.html) --- Comprehensive architecture walkthrough including game loop, tile system, vehicle ticks
- [Citybound Dev Blog](https://aeplay.org/citybound-devblog)
- [Citybound: The Computational City](https://aeplay.org/citybound) --- Eickhoff's actors-vs-ECS rationale, microscopic simulation philosophy
- [A/B Street Technical Documentation](https://a-b-street.github.io/docs/tech/trafficsim/index.html) --- Discrete event simulation, car state machine, intersection mechanics
- [Criminal Code: The Procedural Logic of Crime in Videogames](https://samplereality.com/2011/01/14/criminal-code-the-procedural-logic-of-crime-in-videogames/) --- Analysis of Micropolis crime algorithm (baseline 128, land value feedback loop)
- [Data Locality (Game Programming Patterns)](https://gameprogrammingpatterns.com/data-locality.html) --- Cache-friendly design principles
- [OpenTTD Wiki: Towns](https://wiki.openttd.org/en/Manual/Towns) --- Town growth mechanics
