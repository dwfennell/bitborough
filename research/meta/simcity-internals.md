# SimCity Internal Systems

> Technical deep dive into SimCity's simulation architecture across 35 years -- from cellular automata to agent-based models. Based on analysis of the Micropolis open-source codebase, GDC presentations, developer interviews, and reverse-engineering efforts by the modding community.

## Table of Contents

- [1. System Dynamics Origins](#1-system-dynamics-origins)
- [2. Micropolis Source Code Analysis](#2-micropolis-source-code-analysis)
  - [2.1 Architecture Overview](#21-architecture-overview)
  - [2.2 The 16-Phase Simulation Loop](#22-the-16-phase-simulation-loop)
  - [2.3 RCI Demand: The SetValves Algorithm](#23-rci-demand-the-setvalves-algorithm)
  - [2.4 Power Propagation](#24-power-propagation)
  - [2.5 Traffic Simulation](#25-traffic-simulation)
  - [2.6 Zone Development](#26-zone-development)
  - [2.7 Scanning: Crime, Pollution, Land Value](#27-scanning-crime-pollution-land-value)
  - [2.8 City Evaluation](#28-city-evaluation)
- [3. SimCity 2000/3000 Evolution](#3-simcity-20003000-evolution)
- [4. SimCity 4 Architecture](#4-simcity-4-architecture)
- [5. GlassBox Engine (SimCity 2013)](#5-glassbox-engine-simcity-2013)
- [6. Key Algorithms](#6-key-algorithms)
- [7. What Worked and What Didn't](#7-what-worked-and-what-didnt)
- [8. Lessons for Bitborough](#8-lessons-for-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

---

## 1. System Dynamics Origins

SimCity's simulation architecture descends directly from **Jay Forrester's System Dynamics**, a modeling methodology developed at MIT in the 1950s-60s. Forrester published *Urban Dynamics* in 1969, applying the same stock-and-flow approach he had used for industrial systems to model the lifecycle of a city.

### Forrester's Urban Dynamics Model

The Urban Dynamics model divided a city into three interacting sectors, each with three lifecycle stages:

**Population stocks:**
- Underemployed / Unemployed (U)
- Labor (L) -- working class
- Managerial-Professional (MP)

**Housing stocks:**
- Premium Housing (PH) -- new construction
- Worker Housing (WH) -- aging premium stock
- Underemployed Housing (UH) -- aging worker stock

**Industry stocks:**
- New Enterprise (NE) -- growing businesses
- Mature Business (MB) -- stable operations
- Declining Industry (DI) -- aging mature businesses

The key insight was that these nine stocks were connected by **feedback loops**. New enterprise attracts labor, which increases housing demand, which triggers construction, which ages into lower-quality housing, which attracts underemployed population, which reduces land value, which eventually discourages new enterprise. The model exhibited counterintuitive behavior -- slum clearance programs could worsen poverty by removing the affordable housing stock without addressing the underlying job-attractiveness feedback loop.

Forrester modeled each stock as a differential equation:

```
dStock/dt = inflow_rate - outflow_rate
```

Where inflow and outflow rates were nonlinear functions of multiplier tables (lookup tables indexed by ratios of related stocks). For example, the labor-arrival rate was:

```
labor_arrival = labor_arrival_normal * LAM * LHM * LJM * LAMP
```

Where LAM (Labor Attractiveness Multiplier), LHM (Labor Housing Multiplier), LJM (Labor Job Multiplier), and LAMP (Labor Arrival Mobility Pool) were each table functions. This multiplicative chaining of table-lookup multipliers is the core System Dynamics pattern.

### Wright's Adaptation

Will Wright encountered *Urban Dynamics* while developing his first game, *Raid on Bungeling Bay* (1984). He discovered that building the island maps was more engaging than the helicopter combat itself. As he later described, he started building "essentially a toy to simulate the effects of economics and population growth on a virtual city."

Wright's key adaptations of Forrester's model:

1. **Spatialization.** Forrester's model was aspatial -- a city was a single point with aggregate stocks. Wright distributed the simulation across a 2D grid (120x100 tiles in the original), where each cell had local properties (land value, pollution, traffic density) that interacted with neighbors. This transformed System Dynamics into **cellular automata** -- a fundamental architectural shift.

2. **Simplification for playability.** Wright deliberately rejected realism. He acknowledged that "I know how pathetic the simulations are, really, compared to reality" and emphasized building a player's *mental model* rather than a predictive model. The simulation was a caricature -- exaggerated feedback loops that produced legible cause-and-effect for the player.

3. **Interactive rates.** Forrester's model ran to equilibrium. Wright made the rates controllable -- the player could change tax rates, zone land, build infrastructure, and see the system respond in something approaching real-time. This required the simulation to be fast enough for interactive frame rates on a Commodore 64.

4. **The RCI valve system.** Wright collapsed Forrester's nine-stock model into three aggregate demand signals: Residential (R), Commercial (C), and Industrial (I). These "valves" controlled growth pressure across the entire map, with local conditions (traffic, land value, power) determining which specific zones would respond to that pressure. This two-tier architecture -- global demand signals driving local development probability -- became the defining SimCity pattern.

---

## 2. Micropolis Source Code Analysis

In 2008, Electronic Arts released the original SimCity source code under the GPLv3 license as "Micropolis," facilitated by Don Hopkins who had ported the game to Unix/X11. The codebase is C (not C++), approximately 15,000 lines of simulation code, and provides the definitive reference for how SimCity Classic actually worked.

**Repository:** [github.com/SimHacker/micropolis](https://github.com/SimHacker/micropolis)

### 2.1 Architecture Overview

The simulation code is organized into well-separated modules:

| File | Responsibility |
|------|---------------|
| `sim.c` | Main loop, heat diffusion CA engine |
| `s_sim.c` | Frame dispatch, 16-phase cycle, RCI valve calculation |
| `s_zone.c` | Zone development (residential, commercial, industrial) |
| `s_power.c` | Power grid BFS propagation |
| `s_traf.c` | Traffic pathfinding between zones |
| `s_scan.c` | Pollution, land value, crime, population density maps |
| `s_eval.c` | City score and citizen satisfaction |
| `s_gen.c` | Terrain generation (rivers, forests, lakes) |
| `s_init.c` | Initialization, default constants |
| `s_alloc.c` | Memory allocation for simulation arrays |

The game map is a 120x100 grid of `unsigned short` tiles. Each tile packs type information and bit flags into 16 bits. Multiple overlay arrays at varying resolutions store derived data:

| Array | Resolution | Type | Purpose |
|-------|-----------|------|---------|
| `Map[120][100]` | Full | `unsigned short` | Tile type + flags |
| `PopDensity` | Half (60x50) | `Byte` | Population density |
| `TrfDensity` | Half | `Byte` | Traffic density |
| `PollutionMem` | Half | `Byte` | Pollution levels |
| `LandValueMem` | Half | `Byte` | Land values |
| `CrimeMem` | Half | `Byte` | Crime levels |
| `TerrainMem` | Quarter (30x25) | `Byte` | Terrain desirability |
| `RateOGMem` | Eighth (15x12) | `short` | Rate of growth |
| `ComRate` | Eighth | `short` | Commercial desirability |
| `PoliceMap` | Eighth | `short` | Police coverage |
| `FireRate` | Eighth | `short` | Fire coverage |
| `PowerMap` | Bitpacked | `char[]` | Power grid (1 bit/tile) |

This multi-resolution approach was a pragmatic optimization for 1989 hardware. Lower-resolution maps reduced both computation and memory. The scanning functions sampled the full-resolution map but wrote results to coarser grids.

### 2.2 The 16-Phase Simulation Loop

The simulation operates on a 16-phase cycle, dispatched by `Simulate(int mod16)`. The frame counter `Fcycle` increments each call, and `mod16 = Fcycle & 15` selects the phase:

```
Phase 0:  Increment CityTime, clear census, recalculate RCI valves (every other cycle)
Phase 1:  MapScan columns [0, WORLD_X/8)
Phase 2:  MapScan columns [WORLD_X/8, 2*WORLD_X/8)
Phase 3:  MapScan columns [2*WORLD_X/8, 3*WORLD_X/8)
Phase 4:  MapScan columns [3*WORLD_X/8, 4*WORLD_X/8)
Phase 5:  MapScan columns [4*WORLD_X/8, 5*WORLD_X/8)
Phase 6:  MapScan columns [5*WORLD_X/8, 6*WORLD_X/8)
Phase 7:  MapScan columns [6*WORLD_X/8, 7*WORLD_X/8)
Phase 8:  MapScan columns [7*WORLD_X/8, WORLD_X)
Phase 9:  Census collection (every CENSUSRATE ticks), tax collection, city evaluation
Phase 10: Traffic density decay, rate-of-growth memory decay, message dispatch
Phase 11: Power scan (frequency depends on game speed)
Phase 12: Pollution/Terrain/Land-value scan (frequency depends on game speed)
Phase 13: Crime scan (frequency depends on game speed)
Phase 14: Population density scan (frequency depends on game speed)
Phase 15: Fire analysis, disaster processing
```

The map scan (phases 1-8) is the most important -- it divides the 120-column map into 8 strips of 15 columns each, processing one strip per phase. This spreads the per-tile zone update work across 8 frames, preventing frame-rate spikes. Each tile in the scanned strip is evaluated: if it contains a zone center, the zone's development logic runs; if it contains a special building (power plant, stadium, airport), its maintenance logic runs.

The speed-frequency arrays control how often expensive scans run at each game speed:

```c
static short SpdPwr[4] = { 1,  2,  4,  5 };   // Power scan
static short SpdPtl[4] = { 1,  2,  7, 17 };   // Pollution/land value
static short SpdCri[4] = { 1,  1,  8, 18 };   // Crime
static short SpdPop[4] = { 1,  1,  9, 19 };   // Population density
static short SpdFir[4] = { 1,  1, 10, 20 };   // Fire analysis
```

At the fastest speed (index 3), power scans every 5th cycle while fire analysis runs only every 20th. This creates an explicit quality-vs-speed tradeoff.

Frame throttling happens in `SimFrame()`:

```c
SimFrame(void) {
  if (SimSpeed == 0) return;           // Paused
  if (++Spdcycle > 1023) Spdcycle = 0;
  if (SimSpeed == 1 && Spdcycle % 5) return;   // Slow: 1 in 5
  if (SimSpeed == 2 && Spdcycle % 3) return;   // Medium: 1 in 3
  if (++Fcycle > 1023) Fcycle = 0;
  Simulate(Fcycle & 15);               // Fast: every frame
}
```

### 2.3 RCI Demand: The SetValves Algorithm

The RCI demand system is the direct descendant of Forrester's stock-and-flow model, collapsed into three floating-point valves that accumulate over time. The `SetValves()` function runs every other simulation cycle (phase 0).

The algorithm:

**Step 1: Compute population ratios**
```
NormResPop = ResPop / 8
TotalPop = NormResPop + ComPop + IndPop
Employment = (ComHis[1] + IndHis[1]) / NormResPop    // jobs per resident
```

**Step 2: Project future populations**
```
Migration = NormResPop * (Employment - 1)    // net migration based on job surplus/deficit
Births = NormResPop * 0.02                   // 2% natural growth
PjResPop = NormResPop + Migration + Births   // projected residential

LaborBase = ResHis[1] / (ComHis[1] + IndHis[1])   // workers per job, clamped [0, 1.3]
IntMarket = TotalPop / 3.7                          // internal market size
PjComPop = IntMarket * LaborBase                     // projected commercial

PjIndPop = IndPop * LaborBase * DifficultyMultiplier  // projected industrial
```

The difficulty multiplier scales industrial growth: Easy=1.2, Medium=1.1, Hard=0.98.

**Step 3: Compute demand ratios**
```
Rratio = PjResPop / NormResPop     // >1 means growth pressure
Cratio = PjComPop / ComPop
Iratio = PjIndPop / IndPop
```
Each capped at 2.0.

**Step 4: Apply tax modifier**
A 21-entry tax table converts tax rate (0-20%) into a demand bonus/penalty:

```c
short TaxTable[21] = {
  200, 150, 120, 100, 80, 50, 30, 0, -10, -40, -100,
  -150, -200, -250, -300, -350, -400, -450, -500, -550, -600
};
```

At 7% tax, the bonus is +30. At 0%, it is +200. At 20%, it is -600. The final demand signal for each zone type:

```
Rratio = (Rratio - 1) * 600 + TaxTable[taxRate + gameLevel]
Cratio = (Cratio - 1) * 600 + TaxTable[taxRate + gameLevel]
Iratio = (Iratio - 1) * 600 + TaxTable[taxRate + gameLevel]
```

**Step 5: Accumulate valves**
The ratios are added to running valve totals as velocity changes (not absolute values). Residential valves clamp to [-2000, +2000]; commercial and industrial to [-1500, +1500]. If a zone type has hit capacity (`ResCap`, `ComCap`, `IndCap`), its positive valve is forced to zero.

This velocity-accumulation design means demand has *momentum*. A positive demand signal doesn't instantly fill zones -- it builds pressure that gradually causes more zone upgrades per scan cycle. Negative signals similarly take time to drain. This produces the characteristic SimCity "boom and bust" cycles.

### 2.4 Power Propagation

Power uses a **stack-based BFS flood fill** from each power plant. The algorithm is straightforward:

```
function DoPowerScan():
    clear PowerMap (all bits to 0)
    MaxPower = CoalPop * 700 + NuclearPop * 2000

    while PowerStack is not empty:
        pull (x, y) from stack
        consumed++
        if consumed > MaxPower: break    // capacity exhausted

        for each cardinal direction (N, E, S, W):
            if neighbor has CONDBIT set:        // is a power conductor
            if neighbor is not a power plant:   // plants are always powered
            if neighbor's PowerMap bit is 0:    // not yet powered
                set neighbor's PowerMap bit to 1
                push neighbor onto stack
```

Power plants push themselves onto the stack during the map scan (phases 1-8) via `PushPowerStack()`. The power scan (phase 11) then drains the stack. Key details:

- **Conductor tiles** include roads, rail, and power lines -- all have the `CONDBIT` flag set. Roads inherently conduct power in SimCity Classic, which is why you don't need separate power lines along roads.
- **Capacity is global, not per-plant.** The BFS processes cells in stack order (roughly LIFO, so depth-first-ish) until total consumption exceeds `MaxPower`. This means the order in which plants push onto the stack affects which parts of the city get power first if capacity is insufficient.
- **The PowerMap is a bitfield,** not a byte array. Each tile gets exactly one bit. The `PWRSTKSIZE` limits the stack to prevent overflow -- in practice, this means very large interconnected networks could theoretically exceed the stack and leave portions unpowered.

### 2.5 Traffic Simulation

Traffic in Micropolis is not a flow simulation -- it is a **per-zone pathfinding test**. When a zone is evaluated during the map scan, it calls `MakeTraf(zoneType)` to determine whether the zone can reach a compatible destination.

The algorithm:

```
function MakeTraf(sourceType):
    save current position
    if not FindPRoad():     // find perimeter road within 12-cell check pattern
        return -1           // no road access = traffic failure

    if TryDrive(sourceType):
        SetTrafMem()        // increment traffic density on traversed path
        return 1            // success
    else:
        return 0            // destination unreachable within distance limit
```

**FindPRoad()** scans a hardcoded pattern of offsets around the zone center to find an adjacent road tile. The zone must touch a road to have any traffic at all.

**TryDrive()** is the pathfinding core:

```
function TryDrive(sourceType):
    limit = MAXDIS (30 steps)
    while limit > 0:
        if DriveDone(sourceType):  // check if destination zone is adjacent
            return TRUE

        if not TryGo(lastDirection):   // try to continue in same direction
            if not TryGo(anyDirection): // try any cardinal direction
                // dead end -- backtrack
                if stack is empty: return FALSE
                pull previous position from stack
                limit--
                continue

        if limit is even:
            push current position onto stack  // save for backtracking every other step

        limit--
    return FALSE
```

**DriveDone()** checks whether any neighboring tile contains a destination zone of the correct type:
- Residential zones seek Commercial or Industrial
- Commercial zones seek Industrial or Residential
- Industrial zones seek Residential or Commercial

**TryGo()** validates that the next road tile is drivable and avoids reversing direction.

The critical constraint is the `MAXDIS = 30` step limit. Zones more than 30 road-tiles apart will fail the traffic check, effectively capping city connectivity range. This is why long, winding roads are penalized -- they burn through the step budget without covering much straight-line distance.

**Traffic density** is accumulated by `SetTrafMem()`, which increments the density value on every road tile traversed during a successful pathfinding attempt. When density exceeds 240 on any tile, a police helicopter sprite is spawned at that location (a clever visual indicator of congestion).

### 2.6 Zone Development

Zone development happens during the map scan (phases 1-8). When a zone center tile is encountered, the appropriate handler runs: `DoResidential()`, `DoCommercial()`, or `DoIndustrial()`.

The evaluation process for residential zones:

**Step 1: Get current zone population**
```
pop = RZPop(zone_tile)   // residential population from tile type lookup
```

**Step 2: Run traffic check**
```
traf = MakeTraf(RESIDENTIAL)   // returns -1, 0, or 1
```

**Step 3: Evaluate desirability**
```
function EvalRes():
    if traf < 0: return -3000   // no road access = immediate fail
    value = LandValueMem[x/2][y/2]
    value -= PollutionMem[x/2][y/2]
    value = clamp(value, 0, max)
    value = value << 5           // multiply by 32
    value = min(value, 6000)
    return value - 3000          // range: [-3000, +3000]
```

**Step 4: Compute zone score**
```
zscore = RValve + EvalRes()           // global demand + local desirability
if not powered: zscore = -500         // unpowered penalty
```

**Step 5: Probabilistic growth/decline**

This is the most interesting part. Growth and decline are **stochastic**, gated by the zone score against a random threshold:

```
// Growth check (only if score > -350 AND random test passes)
if zscore > -350:
    if (zscore - 26380) > random_signed_16bit():
        grow zone (increase density tier)

// Decline check (only if score < 350 AND random test passes)
if zscore < 350:
    if (zscore + 26380) < random_signed_16bit():
        shrink zone (decrease density tier)
```

The magic numbers `26380` and `-26380` set the center of the probability distribution. A zone score of 0 gives roughly equal chance of growth and decline. Positive scores bias toward growth; negative toward decline. But even a high-scoring zone only grows probabilistically -- not deterministically. This introduces natural variation in development patterns.

Growth is further rate-limited by a 1-in-8 random gate: only tiles where `Rand16() & 7 == 0` will even attempt the score check. Combined with the 8-phase strip scan, this means any given zone evaluates for development roughly once every 128 simulation cycles.

Commercial evaluation (`EvalCom`) uses the `ComRate` overlay map directly -- a coarse-resolution desirability field. Industrial evaluation (`EvalInd`) is minimal: it returns -1000 on traffic failure and 0 otherwise. Industrial zones are intentionally simple -- they grow wherever there is demand and road access, regardless of local conditions. This matches the game's intended simplification that industry will go anywhere.

### 2.7 Scanning: Crime, Pollution, Land Value

Three scanning functions compute the overlay maps that feed into zone evaluation. They all follow the same pattern: iterate the map, compute raw values, then smooth.

**Pollution (`PTLScan`):**

Pollution sources are per-tile, with hardcoded values based on tile type:

| Tile Type | Pollution Value |
|-----------|----------------|
| Heavy traffic road | 75 |
| Light traffic road | 50 |
| Industrial zone | 50 |
| Power plant / Port | 100 |
| Fire-related tile | 90 |
| Radioactive tile | 255 |

Raw pollution is computed per 2x2 block (4 tiles summed), then smoothed twice using `DoSmooth()`. The smoothing function performs a weighted neighbor average:

```
function DoSmooth(src, dst):
    for each cell (x, y):
        z = src[x-1][y] + src[x+1][y] + src[x][y-1] + src[x][y+1] + src[x][y]
        dst[x][y] = (z + src[x][y]) >> 2    // (sum + center) / 4
```

This effectively performs 2D Gaussian-like blur, spreading pollution from point sources into diffuse clouds. Two smoothing passes produce a roughly 5-tile falloff radius.

**Land Value (also in `PTLScan`):**

Land value combines four factors into a single byte:

```
dis = 34 - distanceToCityCenter(x, y)    // base: proximity to center
dis = dis << 2                             // scale by 4
dis += TerrainMem[x][y]                   // terrain desirability
dis -= PollutionMem[x][y]                 // pollution penalty
if CrimeMem[x][y] > 190: dis -= 20       // high-crime penalty
result = clamp(dis, 1, 250)
```

The city center is computed as the population-weighted centroid (updated during `PopDenScan`). This means land value naturally radiates outward from the population center, creating a monocentric city model. Land value is smoothed twice after computation.

**Crime (`CrimeScan`):**

Crime computation inverts land value and adds population pressure:

```
z = 128 - LandValueMem[x][y]        // low land value = high crime base
z += PopDensity[x][y]                // more people = more crime
z -= PoliceMapEffect[x][y]           // police coverage suppresses crime
result = clamp(z, 0, 250)
```

The police effectiveness map is itself smoothed three times from the raw police station locations, creating wide coverage areas that degrade with distance.

### 2.8 City Evaluation

The `GetScore()` function in `s_eval.c` computes the overall city score (0-1000) that drives the citizen approval rating:

**Seven problem factors are ranked by severity:**
1. Crime (`CrimeAverage`)
2. Pollution (`PolluteAverage`)
3. Housing cost (`LVAverage * 0.7`)
4. Taxes (`CityTax * 10`)
5. Traffic (computed average)
6. Unemployment
7. Fire risk (`FirePop * 5`)

**Score calculation:**
```
problem_sum = sum of top problems / 3
problem_avg = min(problem_sum, 256)
score = (256 - problem_avg) * 4              // base score, max 1000

// Capacity penalties: full zones reduce score by 15% each
if ResCap: score *= 0.85
if ComCap: score *= 0.85
if IndCap: score *= 0.85

// Infrastructure penalties
if RoadEffect < 32: score *= (RoadEffect / 32.0)
if PoliceEffect < 1000: score *= (0.9 + PoliceEffect / 10000.1)
if FireEffect < 1000: score *= (0.9 + FireEffect / 10000.1)

// Direct penalties
score -= taxRate
score -= fireDamage

// Exponential smoothing
CityScore = (previousScore + score) / 2
```

Citizen approval uses Monte Carlo sampling: 100 random trials where `rand(1000) < CityScore` counts as an approval vote. This produces a noisy but statistically correct approval percentage.

---

## 3. SimCity 2000/3000 Evolution

### SimCity 2000 (1994)

SimCity 2000 represented the largest architectural leap in the series, introducing several fundamental simulation systems that persisted through later versions.

**Elevation and terrain.** The flat grid became a height-mapped 3D terrain viewed in isometric projection. Elevation affected water flow, flooding, and visual aesthetics. The terrain was rendered as a grid of cells with discrete height levels, not continuous -- each tile had a single elevation value, and slopes were interpolated visually.

**Underground layer.** A second simulation layer beneath the surface introduced water pipes and subway tunnels. Water propagated through pipes using a system analogous to the power BFS but requiring pump stations to maintain pressure. This was the first time SimCity required players to manage two parallel network layers.

**Water system.** Water demand was computed per-zone based on population, and supply came from pumping stations placed near water sources. Water propagation used a modified BFS similar to power, but with distance-based pressure decay. Tiles too far from a pump station would show insufficient water pressure. Desalination plants provided an expensive alternative water source.

**Zone density tiers.** The original SimCity had a relatively flat zone progression. SimCity 2000 introduced explicit density zones (light and dense residential/commercial/industrial), giving players direct control over the maximum density a zone could achieve. This replaced the original's implicit density progression with player intentionality.

**Expanded building set.** Hospitals, schools, museums, prisons, libraries, marinas, and zoos each had specific coverage radii affecting quality-of-life metrics. The service coverage model was extended from simple police/fire stations to a dozen building types, each contributing to different simulation variables.

**The neighbor connection system.** Cities could establish connections to neighboring cities at the map edge for power, water, and transportation. While not true multi-city simulation, this introduced the concept of inter-city dependencies.

**Budget model.** The budget system was significantly more detailed, with individual funding sliders for each department (police, fire, health, education, transit). Funding levels directly affected service coverage effectiveness -- underfunded police stations had reduced coverage radii.

### SimCity 3000 (1999)

SimCity 3000 refined rather than revolutionized the simulation, but introduced several notable systems:

**Waste management.** Garbage accumulation became a simulation variable. Landfills consumed land area and generated pollution; incinerators reduced volume but created air pollution; recycling centers reduced waste input. Garbage trucks needed road access, adding a logistics constraint.

**Neighbor deals.** The inter-city system expanded from simple connections to negotiable contracts. You could sell excess power to neighbors, import water, or export garbage -- each with monthly payments. This created economic trade-offs and gave meaning to overbuilding utility capacity.

**Agricultural zones.** Low-density areas at the city edge could develop as farms, a new zone type that provided jobs and food but yielded minimal tax revenue. Farms replaced themselves with suburbs as population pressure increased, modeling the urban-rural fringe dynamic.

**Landmark system.** Unlockable landmark buildings provided localized boosts to land value and tourism revenue but occupied prime real estate. This introduced an optimization puzzle: landmarks had opportunity costs.

The underlying simulation architecture remained fundamentally similar to SimCity 2000 -- cellular automata with overlay maps, BFS network propagation, and probabilistic zone development. The major changes were in simulation breadth (more variables to track) rather than architectural depth.

---

## 4. SimCity 4 Architecture

SimCity 4 (2003) represented the most architecturally ambitious version before the 2013 reboot. Developed by Maxis under the leadership of developers including Ocean Quigley (creative director) and the engineering team that would later build GlassBox, it pushed the cellular automata model to its practical limits.

### Region System

The defining innovation was **region play** -- multiple city tiles existed on a shared regional map, and simulation state flowed between them. Each city was an independent simulation instance, but when you played one city, its neighbors' exports and imports were factored in:

- **Commuters** could travel between cities. Workers in City A might commute to jobs in City B if the transportation network connected them at the border. This was tracked as aggregate flow, not individual agents.
- **Utilities** (power, water, garbage) could be shared across city borders through connection points, similar to SimCity 3000's neighbor deals but now between cities you actually controlled.
- **Pollution** drifted across borders based on wind direction, affecting neighboring cities' air quality.

The region map was a grid of city tiles at varying sizes (small/medium/large), allowing players to specialize cities -- an industrial hub here, a bedroom community there, a commercial downtown elsewhere. This distributed the traditional single-city simulation across an interconnected network.

### Lot-Based Development

SimCity 4 replaced the fixed-tile zone development with a **lot-based system**. When zones developed, they selected from a library of lot templates with varying footprints (1x1 up to 4x4 or larger). Each lot had conditions -- minimum land value, zone density type, nearby road type (street vs. avenue vs. highway), and stage (wealth level).

The lot selection algorithm evaluated:

```
for each candidate lot in library:
    if lot.density_type != zone.density_type: skip
    if lot.wealth_level > zone.current_wealth: skip
    if lot.size doesn't fit in available zone space: skip
    if zone.land_value < lot.min_land_value: skip
    score = weighted_random(lot.probability)
    select highest-scoring lot
```

This produced much more visually diverse cities than the original's fixed tile progressions, and created a direct relationship between simulation variables (land value, density) and visual output (building selection).

### Traffic: The Trip Generation Model

SimCity 4's traffic system was dramatically more sophisticated than Micropolis's 30-step pathfinding. It used an **origin-destination matrix** approach:

1. **Trip generation.** Each residential lot generated a number of commute trips proportional to its population. Each commercial/industrial lot generated a trip demand proportional to its job capacity.
2. **Trip distribution.** Trips were assigned from origins (homes) to destinations (jobs) using a gravity model -- closer destinations were preferred, weighted by job availability.
3. **Route assignment.** Each trip was assigned to a route through the road/rail/transit network. SimCity 4 modeled multiple transport modes: roads (streets, avenues, highways), rail, subway, bus, ferry, and even monorail. Each mode had different speed, capacity, and cost characteristics.
4. **Congestion feedback.** Road segments accumulated traffic volume. When volume exceeded capacity, travel time increased, which fed back into route selection in subsequent cycles.

The network itself was modeled as a graph with nodes (intersections) and edges (road/rail segments). Each edge had properties: capacity, speed, and current volume. The pathfinding used a variant of Dijkstra's algorithm weighted by travel time rather than distance, allowing faster roads to attract more traffic even if physically longer.

A known limitation was the "one more lane" problem -- the simulation's pathfinding was static per evaluation cycle, so it didn't fully model real-time congestion avoidance. Players discovered that adding highway capacity could paradoxically increase congestion by attracting more trips (a phenomenon known in transportation planning as induced demand, which the simulation partially captured).

### Simulation Layers

SimCity 4 maintained the multi-layer approach but with higher resolution and more layers:

- **Desirability.** A unified desirability score per tile replaced the ad-hoc evaluation functions. Desirability combined proximity to parks, schools, transit, water features (positive) with proximity to industry, pollution sources, crime (negative).
- **Air pollution and water pollution** were tracked as separate layers (unlike the original's single pollution map).
- **Health and education** were modeled as city-wide statistics affecting population growth rates and maximum building wealth levels. Uneducated cities couldn't attract high-tech industry; unhealthy cities experienced population decline.
- **Commute time** became a first-class simulation variable that directly affected residential desirability. Long commutes reduced happiness and could trigger population exodus.

---

## 5. GlassBox Engine (SimCity 2013)

The 2013 SimCity reboot, developed by Maxis Emeryville, abandoned the cellular automata architecture in favor of a fully **agent-based simulation** called the GlassBox engine. This was the most radical architectural change in the series' history, and its partial failure provides invaluable lessons for simulation game design.

### Architecture: Units, Maps, and Rules

GlassBox was presented at GDC 2012 by Andrew Willmott in his talk "Inside GlassBox." The engine organized simulation into three core concepts:

**Units (Agents).** Every discrete entity in the simulation -- every Sim, every unit of electricity, every gallon of water, every garbage bag -- was represented as an individual agent. These agents moved through the city's road network following pathfinding rules. A residential building didn't "have" 20 residents in a counter; it spawned 20 Sim agents that physically traveled to workplaces each morning.

**Maps.** Continuous data fields overlay the city -- happiness, land value, pollution, etc. These were 2D arrays similar to Micropolis's overlay maps, but updated by agent behavior rather than direct computation. For example, pollution wasn't calculated from tile types; it was emitted as pollution agents from industrial buildings that then diffused across the map.

**Rules.** Building-level behaviors that consumed and produced agents. A power plant had a rule: "consume coal agents, produce electricity agents." A house had a rule: "spawn Sim agents at 7am, recall them at 6pm." Rules could query maps to make decisions -- "if happiness map < threshold, spawn protest agent."

### The "Resources Flowing Through Networks" Paradigm

GlassBox's central metaphor was that everything was a resource flowing through the road network. Electricity wasn't propagated via BFS over a power grid; it was emitted as electric agents from power plants that traveled along roads to buildings. Water agents flowed through water pipe networks. Sewage agents flowed back. Workers flowed from homes to jobs. Shoppers flowed from homes to commercial buildings.

This created a unified simulation framework where every system used the same underlying agent-movement infrastructure. In theory, this meant:
- New systems could be added by defining new agent types and building rules
- Players could visually watch resources flowing through their city
- Emergent behavior would arise from agent interactions

### The Shortest-Path Problem

The fatal flaw was in the pathfinding. To keep simulation performance manageable with thousands of agents, GlassBox used a simple shortest-path algorithm. Agents did not have persistent identities with consistent home-work pairs (despite the visual suggestion otherwise). Instead:

- Morning: Sim agents spawned from residential buildings and traveled to the **nearest available workplace** along the road network.
- Evening: Sim agents left workplaces and traveled to the **nearest available residential building** with capacity.

This meant Sims didn't have "their" home or "their" job. Every morning was a free-for-all where agents grabbed whatever was closest. The consequences were severe:

1. **Traffic convergence.** Because all agents used shortest-path, they all chose the same routes. A five-lane highway next to a small street would see all traffic on the street if it was one tile shorter. Real traffic distributes across parallel routes; GlassBox traffic created single-point bottlenecks.

2. **Service vehicle failures.** Fire trucks, police cars, and ambulances used the same shortest-path logic. Multiple fire trucks would converge on the nearest fire while distant fires burned unchecked. Players observed entire neighborhoods burning while fire stations a block away dispatched trucks to the other side of the city.

3. **Utility oscillation.** Because Sims didn't have fixed homes, residential buildings would cycle between full and empty as agent waves sloshed back and forth. This created artificial instability in population counts and service demand.

4. **U-turn cascades.** Agents that encountered a full building would U-turn and seek the next nearest option, often creating chain reactions of U-turning agents that gridlocked intersections.

### Why Agents Couldn't Scale

The agent-based approach imposed a fundamental computational constraint: **the number of agents was proportional to city population**. In the cellular automata model, simulation cost scaled with map area (fixed). In GlassBox, simulation cost scaled with population (unbounded).

This directly caused the most criticized design decision: **tiny city sizes**. SimCity 2013's city plots were 2km x 2km, dramatically smaller than SimCity 4's large city tiles. Maxis stated this was necessary for simulation performance -- the agent count for a 500,000-population city was already straining the engine. SimCity 4 could simulate millions of residents because it tracked aggregate flows, not individual agents.

The computational profile of each approach:

| Approach | Cost Model | 100K Pop | 1M Pop |
|----------|-----------|----------|--------|
| Cellular automata | O(map_area) | ~12,000 cells | ~12,000 cells |
| Agent-based | O(population * pathfinding) | ~100K pathfinds | ~1M pathfinds |

Even with sampling (not every Sim agent represented one person), the pathfinding budget was the binding constraint. Each agent needed a route computed each commute cycle, and route computation on a non-trivial road network is expensive.

### Post-Launch Patches

Maxis attempted to fix the most egregious agent behaviors through patches:

- **Update 2.0** improved service vehicle dispatch to avoid converging on a single incident
- **Residential persistence** was partially added, making Sims prefer returning to the same home
- **Traffic distribution** was tweaked to spread load across parallel routes
- **RCI calculations** were adjusted to fix demand curves that produced unrealistic growth patterns

These patches improved but didn't fundamentally resolve the architectural limitations. The agent-based approach produced visually compelling micro-scale behavior (watching individual Sims drive to work) at the cost of macro-scale plausibility (the city as a whole behaving realistically).

---

## 6. Key Algorithms

### Power Propagation: BFS Flood Fill

Used in Micropolis, SimCity 2000, SimCity 3000, and SimCity 4 (with refinements). The core algorithm is a breadth-first search from power sources through conductor tiles.

```
function propagatePower(map, powerGrid):
    powerGrid.clear()
    plants = findPowerPlants(map)

    for each plant in plants:
        queue = [all tiles in plant footprint]
        mark plant tiles as powered

        while queue is not empty:
            tile = queue.dequeue()
            for each neighbor in [N, E, S, W]:
                if neighbor is conductor AND not yet powered:
                    mark neighbor as powered
                    queue.enqueue(neighbor)
```

Key implementation detail: Micropolis used a stack (LIFO) rather than a queue (FIFO), making it technically DFS rather than BFS. The practical difference is negligible for power propagation since the entire connected component gets powered either way. The stack approach was likely chosen for simplicity -- push/pop on an array is trivial in C.

Bitborough's implementation uses proper BFS with a queue. The main difference from Micropolis is capacity tracking per-plant rather than globally.

### Traffic: Random Walk vs. Graph Pathfinding

**Micropolis approach (random walk with backtracking):**
```
function tryDrive(sourceType, maxSteps=30):
    steps = maxSteps
    while steps > 0:
        if destinationAdjacent(sourceType): return SUCCESS
        if canContinueForward(): advance()
        else if canTurnToAnyRoad(): turn and advance()
        else:
            if backtrackStack.empty(): return FAILURE
            backtrack()
        steps--
    return FAILURE
```

This is not shortest-path or any standard graph algorithm. It's a bounded random walk that preferentially continues in the current direction, tries turns on dead ends, and backtracks when stuck. The 30-step limit ensures O(1) time per zone evaluation at the cost of connectivity accuracy.

**SimCity 4 approach (weighted Dijkstra on transport graph):**
```
function findRoute(origin, destination, transportModes):
    graph = buildTransportGraph(map, transportModes)
    return dijkstra(graph, origin, destination, weight=travelTime)
```

Travel time per edge = edge.length / edge.speed * congestionMultiplier(edge.volume / edge.capacity).

**GlassBox approach (shortest-path agent dispatch):**
```
function dispatchAgent(agent, buildingType):
    candidates = findBuildingsOfType(buildingType).sortByDistance(agent.position)
    for each candidate in candidates:
        if candidate.hasCapacity():
            route = shortestPath(agent.position, candidate.position)
            agent.followRoute(route)
            return
```

### Zone Demand: The RCI Curve

The RCI demand model evolved across versions but maintained the same core structure -- a feedback loop between employment ratios and zone growth pressure.

Micropolis pseudocode (simplified):
```
function updateDemand():
    employment = jobs / residents
    migration = residents * (employment - 1.0)
    projectedResidents = residents + migration + births

    laborSupply = residents / jobs
    internalMarket = totalPopulation / 3.7
    projectedCommercial = internalMarket * laborSupply

    projectedIndustrial = industrial * laborSupply * difficultyFactor

    resDemand += (projectedRes / actualRes - 1.0) * 600 + taxEffect
    comDemand += (projectedCom / actualCom - 1.0) * 600 + taxEffect
    indDemand += (projectedInd / actualInd - 1.0) * 600 + taxEffect

    clamp demands to [-2000, +2000] or [-1500, +1500]
```

The key feedback loops:
- **Residential-Commercial positive feedback.** More residents create internal market demand, which drives commercial growth, which creates jobs, which attracts more residents.
- **Labor supply negative feedback.** Too many residents relative to jobs reduces the labor ratio below 1.0, which suppresses both commercial and industrial projected populations, which reduces demand for those zones.
- **Tax throttle.** High taxes suppress all demand simultaneously, providing a universal brake. Low taxes boost demand but reduce revenue (and therefore service quality).

### Land Value Calculation

Micropolis land value (single formula):
```
landValue = max(1, min(250,
    (34 - distToCityCenter) * 4
    + terrainDesirability
    - pollution
    - (crime > 190 ? 20 : 0)
))
```

This is monocentric -- land value radiates from a single center point. SimCity 4 moved to a polycentric model where desirability was computed from multiple positive and negative sources without a privileged center.

Bitborough's land value uses an additive model without a city-center bias:
```
value = 10 (base)
      + waterAdjacencyBonus        // +15 per adjacent water tile
      + parkBonus                   // +10, decaying with distance
      + roadAccessBonus             // +10 if within range 3
      - pollution * 0.5
      - crime * 0.1
```

This is closer to SimCity 4's approach and avoids the monocentric assumption, which is appropriate for the small map sizes where a single "center" may not emerge naturally.

### Building Development Probability

The stochastic zone development model from Micropolis:

```
function shouldGrow(zoneScore):
    // 1-in-8 random gate
    if random(8) != 0: return false

    // Score must exceed minimum threshold
    if zoneScore <= -350: return false

    // Probabilistic test against random distribution
    return (zoneScore - 26380) > randomSigned16()
```

The `randomSigned16()` returns a value in [-32768, +32767]. The threshold `26380` means:
- Zone score of +6000 (maximum from EvalRes): probability ~= (6000 - 26380 + 32768) / 65536 ~= 19%
- Zone score of 0: probability ~= (-26380 + 32768) / 65536 ~= 10%
- Zone score of -350: probability ~= (-350 - 26380 + 32768) / 65536 ~= 9%

These are per-evaluation probabilities, and evaluation occurs only 1/8 of the time, so actual per-cycle growth probability is ~1-2% for well-situated zones. This produces the gradual, organic growth pattern characteristic of SimCity.

---

## 7. What Worked and What Didn't

### What Worked

**Cellular automata with overlay maps (SimCity Classic through SC4).** The core architecture of iterating a tile grid, computing overlay maps, and using those maps to drive probabilistic zone development proved remarkably robust. It scaled well (cost proportional to map area, not population), was easy to extend (add a new overlay map), and produced emergent spatial patterns that felt city-like.

**Probabilistic development.** The stochastic zone growth model, where high scores meant higher probability of development rather than guaranteed development, produced organic-looking cities with natural variation. Deterministic development would have produced uniform, mechanical-looking growth.

**Multi-resolution overlay maps.** Computing crime, pollution, and land value at half or quarter resolution saved compute time with minimal loss of simulation fidelity. Most of these properties are spatially smooth -- crime doesn't change dramatically tile-by-tile.

**The RCI valve momentum system.** Demand accumulating as velocity rather than being set absolutely each tick created realistic boom-bust economic cycles. The clamping bounds [-2000, +2000] prevented runaway feedback while allowing meaningful oscillation.

**Smoothing/diffusion for spatial properties.** The 2-3 pass smoothing applied to pollution, crime, and land value maps produced realistic spatial falloff from point sources without expensive distance calculations. Each smoothing pass is just a neighbor average -- O(n) per pass where n is map cells.

### What Didn't Work

**Micropolis's 30-step traffic limit.** The random-walk traffic model was too simple. It couldn't evaluate actual travel time, punished indirect routes regardless of road quality, and produced binary results (connected/not connected) rather than congestion gradients. This led to gameplay where the shape of roads mattered more than their capacity.

**Monocentric land value.** The distance-from-city-center land value formula forced all cities toward a monocentric pattern. Real cities (and good city-builder gameplay) develop multiple centers. SimCity 4's polycentric desirability model was a significant improvement.

**SimCity 2013's stateless agents.** The decision not to give Sims persistent home/work associations was the GlassBox engine's cardinal sin. It was done for performance -- maintaining state per agent is expensive -- but it destroyed macro-level plausibility. Players immediately noticed that "their" Sims went to different houses each night.

**SimCity 2013's shortest-path-only routing.** Real traffic distributes across available routes (approximating Wardrop equilibrium). GlassBox's greedy shortest-path created artificial bottlenecks and made parallel roads useless. This was partially fixable (and was patched), but the underlying architecture made true traffic distribution expensive.

**Agent-based utility simulation (GlassBox).** Representing electricity as agents moving along roads was conceptually elegant but computationally wasteful. BFS power propagation computes the entire power grid in O(n) where n is conductor tiles. Agent-based power required O(consumption * pathfinding_cost) per tick -- orders of magnitude more expensive for the same result.

**Global capacity in Micropolis power.** The BFS power scan consumed capacity globally across all plants, which meant the order of stack processing determined which areas lost power during shortages. This was arbitrary and unpredictable from the player's perspective. Per-plant or per-network capacity tracking (as in later versions and Bitborough) is more intuitive.

---

## 8. Lessons for Bitborough

Bitborough's engine architecture already incorporates several lessons from SimCity's evolution. Here are specific technical connections and remaining opportunities.

### Already Adopted

**BFS power propagation.** Bitborough's `propagatePower()` in `simulation/power.ts` uses proper BFS (queue-based) with per-plant capacity tracking. This is a direct improvement over Micropolis's stack-based DFS with global capacity. The implementation finds power plants, then floods from each plant independently -- matching the SimCity 2000+ approach rather than the Classic model.

**Additive land value without city-center bias.** Bitborough's `calculateLandValues()` uses an additive model (water adjacency, parks, road access, minus pollution and crime) without Micropolis's distance-from-center term. This naturally supports polycentric development, which is correct for Bitborough's map sizes.

**Agent-based citizens with persistent identities.** Bitborough's `CitizenRegistry` in `simulation/citizens.ts` gives each citizen a persistent `homeBuildingId`, `workBuildingId`, and `commerceBuildingId`. Citizens have cached routes (`homeWorkRoute`, `homeCommerceRoute`) that are recomputed only when marked stale. This directly avoids SimCity 2013's cardinal mistake of stateless agents while still getting the benefits of agent-level simulation (satisfaction tracking, commute length, matched employment).

**Sampling ratio for agent scaling.** The `DEFAULT_SAMPLING_RATIO = 50` means each citizen agent represents 50 actual residents. This is the correct hybrid approach -- agent-based micro-simulation with statistical scaling to avoid the O(population) cost that killed GlassBox's city sizes.

**A* pathfinding on a road graph.** Bitborough uses A* on an explicit `RoadGraph` structure rather than Micropolis's bounded random walk. Routes are computed between building access roads, stored per-citizen, and invalidated when the road network changes. This is computationally similar to SimCity 4's approach but at agent granularity rather than aggregate OD-matrix granularity.

### Opportunities from SimCity's Playbook

**Traffic density as a simulation overlay.** Micropolis accumulated traffic density on road tiles during pathfinding. Bitborough already has `trafficDensity: Uint8Array` that feeds into demand suppression. The opportunity is to use the citizen route data (stored as `homeWorkRouteTileSet` and `homeCommerceRouteTileSet`) to compute per-road-segment volume, compare against capacity, and feed congestion back into route selection and desirability. Micropolis's approach of simply incrementing density per traversal is simple and effective.

**Probabilistic zone development.** Micropolis's stochastic growth model (high score = high probability, not certainty) produces natural-looking cities. If Bitborough's zone development is currently deterministic, introducing probability gating would add organic variation. The key parameters from Micropolis: a 1-in-8 random gate, a minimum score threshold (-350), and a sigmoid-like probability curve centered on 26380/65536.

**Multi-phase simulation spreading.** Micropolis's 8-strip map scan is a clean way to amortize per-tile computation across frames. If Bitborough processes all zones in a single tick, spreading the work across 4-8 sub-ticks (round-robin by column or by building index) would smooth frame times. The phase scheduling arrays (`SpdPwr`, `SpdPtl`, etc.) for controlling scan frequency at different game speeds are directly reusable.

**Smoothing for spatial properties.** Micropolis's 2-pass DoSmooth for pollution and crime diffusion is cheap and effective. If Bitborough's pollution/crime are currently computed as point values, applying 1-2 smoothing passes would create more realistic spatial falloff without distance calculations.

**The exponential-smoothing score.** Micropolis's `CityScore = (previous + computed) / 2` prevents jarring jumps in city ratings. Any aggregate metric shown to the player benefits from this treatment.

**RCI valve momentum.** Micropolis's demand values accumulate as velocity (adding delta each cycle) rather than being set absolutely. This creates economic momentum -- a booming city keeps booming for a while even after conditions worsen, and a declining city takes time to recover even after problems are fixed. This produces the satisfying boom-bust cycles that make SimCity's economy feel alive. Bitborough's demand system could adopt velocity accumulation with clamping to create similar dynamics.

### Pitfalls to Avoid

**Don't simulate utilities as agents.** GlassBox's electricity-as-agents was computationally ruinous. BFS propagation for power, water, and similar binary-connectivity systems is asymptotically cheaper and produces identical gameplay results. Bitborough already does this correctly.

**Don't use shortest-path-only for all agents.** If citizen routes are computed via pure shortest-path A*, parallel roads will be underutilized. Consider adding a small random perturbation to edge weights, or splitting traffic across the top-K routes weighted by length. Even Micropolis's random-walk approach produced more distributed traffic than GlassBox's shortest-path.

**Don't let agent count scale linearly with population.** The sampling ratio approach is correct. As cities grow, increase the sampling ratio (e.g., 1:50 for small cities, 1:200 for large) to keep agent count within computational budget. The key metric is not agent count but route computation count per tick.

**Preserve the two-tier architecture.** Micropolis's split between global demand signals (RCI valves) and local development decisions (per-zone score checks) is elegant and performant. The global tier ensures macro-economic coherence; the local tier ensures spatial variety. Collapsing everything to either pure global (no spatial variation) or pure local (no macro trends) loses important gameplay dynamics.

---

## Cross-References

- [Open-Source City Simulations](./open-source-city-sims.md) -- Micropolis Java source code analysis, OpenTTD YAPF pathfinder, Citybound actor system, code pattern catalog
- [Cities: Skylines Internals](./cities-skylines-internals.md) -- Manager pattern architecture, A* traffic, citizen lifecycle, CS2 ECS/DOTS attempt
- [Simulation Architecture Patterns](./simulation-architecture-patterns.md) -- Statistical vs. agent-based simulation, tick loops, layer buffers, demand models, pathfinding at scale
- [Mechanics Comparison](./mechanics-comparison.md) -- Side-by-side comparison of zoning, economy, traffic, citizens across major titles

---

## Sources

### Primary Source Code
- **Micropolis (SimCity Classic) source code.** GPL release, maintained by Don Hopkins. [github.com/SimHacker/micropolis](https://github.com/SimHacker/micropolis). Key files analyzed: `s_sim.c` (simulation loop, SetValves), `s_zone.c` (zone development), `s_power.c` (power BFS), `s_traf.c` (traffic pathfinding), `s_scan.c` (crime/pollution/land value), `s_eval.c` (city evaluation), `s_alloc.c` (data structure dimensions), `s_gen.c` (terrain generation).

### GDC Presentations
- **Andrew Willmott, "Inside GlassBox," GDC 2012.** Presentation on SimCity 2013's agent-based simulation architecture. Slides available via [andrewwillmott.com/talks/inside-glassbox](https://www.andrewwillmott.com/talks/inside-glassbox).
- **Ocean Quigley** (SimCity 2013 Creative Director), various presentations and interviews on GlassBox design philosophy and agent-based simulation decisions.

### Design History
- **Jay Forrester, *Urban Dynamics* (1969).** MIT Press. The System Dynamics model that directly inspired SimCity's stock-and-flow RCI architecture.
- **Will Wright interviews.** Wright has described the Forrester influence in numerous interviews, including that he found building maps more engaging than playing Raid on Bungeling Bay, leading to SimCity's development. Game History Foundation documentation.
- **Don Hopkins, Micropolis documentation.** Commentary on the open-source release and codebase structure. [donhopkins.com](https://donhopkins.com).

### Community Analysis
- **SimCity 4 modding community (Simtropolis, SC4Devotion).** Extensive reverse-engineering of SimCity 4's traffic model, lot selection, and simulation layers by the modding community, particularly through the NAM (Network Addon Mod) project.
- **SimCity 2013 post-launch analysis.** Community documentation of agent pathfinding failures, traffic convergence, and service vehicle dispatch problems that demonstrated the GlassBox engine's limitations.

### Technical References
- **Wolfram, Stephen. *A New Kind of Science* (2002).** Context for cellular automata approaches in simulation.
- **Wardrop, J.G. (1952). "Some theoretical aspects of road traffic research."** The equilibrium traffic distribution model that GlassBox failed to approximate.
