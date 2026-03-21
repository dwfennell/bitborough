# Simulation Architecture Patterns

> Common architectural patterns in city simulation engines -- tick loops, layer buffers, agent systems, and the tradeoffs between statistical and agent-based approaches.

## Table of Contents

1. [Statistical vs. Agent-Based Simulation](#1-statistical-vs-agent-based-simulation)
2. [The Simulation Tick Loop](#2-the-simulation-tick-loop)
3. [Layer Buffer Architecture](#3-layer-buffer-architecture)
4. [Spatial Indexing](#4-spatial-indexing)
5. [Demand and Development Models](#5-demand-and-development-models)
6. [Pathfinding at Scale](#6-pathfinding-at-scale)
7. [Utility Propagation](#7-utility-propagation)
8. [Service Coverage Models](#8-service-coverage-models)
9. [Event Systems](#9-event-systems)
10. [Save/Load and Serialization](#10-saveload-and-serialization)
11. [Performance Scaling](#11-performance-scaling)
12. [Lessons for Bitborough](#12-lessons-for-bitborough)
13. [Sources](#sources)

---

## 1. Statistical vs. Agent-Based Simulation

City simulation engines have historically chosen between two fundamental paradigms for modeling urban systems: statistical (top-down) and agent-based (bottom-up). Every commercial city builder sits somewhere on this spectrum, and the choice dictates nearly every downstream architectural decision.

### Statistical / Cellular Automata (SimCity Classic, 1989)

Will Wright's original SimCity drew from two intellectual traditions: Jay Forrester's system dynamics and John Horton Conway's Game of Life. The result was a hybrid cellular automata system where the map is a grid and each tile holds numeric values across multiple layers -- pollution, crime, land value, traffic density. Every simulation cycle, these values propagate outward from sources using simple neighbor-averaging rules, creating emergent gradients without simulating individual entities.

The core loop scans every tile and applies deterministic rules:

```
for each tile (x, y):
  pollution[x][y] = avg(pollution[neighbors]) * decay + source_contribution
  crime[x][y] = f(population_density, land_value, police_coverage)
  land_value[x][y] = g(proximity_to_water, pollution, crime, road_access)
```

This approach is O(n) per layer per tick where n is the tile count. A 128x128 map (16,384 tiles) with 8 layers requires ~130,000 cell evaluations per cycle -- trivial even for 1989 hardware. The Micropolis source code (the GPL release of SimCity Classic) reveals that each layer is stored as a flat C array and the scan is a straightforward double loop with hand-tuned constants.

**Strengths:** Deterministic, cache-friendly (sequential memory access), constant-time per tile regardless of city complexity, trivially parallelizable per layer.

**Weaknesses:** No emergent individual behavior. Traffic is modeled as a diffusing quantity, not as vehicles choosing routes. Players cannot follow a specific citizen. Feedback loops between layers require careful tuning to avoid runaway oscillation.

### Agent-Based (SimCity 2013 / GlassBox)

Maxis's GlassBox engine, presented by Andrew Willmott at GDC 2012, inverted the paradigm. Instead of computing aggregate statistics, the engine simulates thousands of individual agents -- Sims, vehicles, units of water, units of electricity -- that carry resources between simulation units (buildings). City-level behavior emerges from the aggregate of individual actions.

The GlassBox architecture splits the world into four object types:

- **Resources** -- the currency of the simulation (water, power, workers, money, goods)
- **Units** -- buildings and structures that consume/produce resources
- **Maps** -- spatial layers that store per-tile data
- **Globals** -- system-wide state (time, budget, population counters)

These are connected by **Rules**, defined in data-driven scripts. A residential building has a rule: "every morning, emit N worker agents onto the road network." A factory has a rule: "absorb worker agents, emit goods agents." The macro behavior of employment emerges from whether worker agents physically reach factories.

Maxis targeted 10,000+ simultaneous agents. To hit this target, agents were kept deliberately simple: they carry a resource type and an amount, navigate the road network using shortest-path, and do not run rules themselves. All intelligence is in the Units (buildings).

**Strengths:** Emergent behavior visible to the player. Every graphical animation corresponds to an actual agent action. Systems like traffic, commuting, and utility distribution unify under a single agent-dispatch framework.

**Weaknesses:** Performance scales with agent count, not map size. The O(agents * pathfinding_cost) per tick cost proved problematic -- SimCity 2013 shipped with notoriously small city sizes (2km x 2km) partly due to this constraint. Agent routing bugs cascaded into systemic failures (the infamous "all Sims go to the nearest house" problem, where agents lacked persistent identity).

### Hybrid (Cities: Skylines)

Colossal Order's Cities: Skylines uses a hybrid approach. Each citizen is a named, persistent entity with a home, workplace, and daily schedule -- but the simulation of land value, pollution, noise, and service coverage uses statistical layer propagation. Traffic is a true agent simulation: every vehicle pathfinds on the road graph using A*, and the resulting congestion feeds back into land value and citizen happiness statistically.

This hybrid captures the best of both worlds: emergent traffic patterns that respond to road layout, combined with efficient statistical layers for values that diffuse smoothly. The cost is architectural complexity -- two simulation paradigms must interoperate, and debugging requires understanding which system "owns" a given behavior.

### The Representative Agent Compromise

When full agent simulation is too expensive, a common compromise is the **representative agent**: simulate one agent per N citizens and multiply its contributions by N. This reduces pathfinding and routing costs by a constant factor while preserving emergent route selection. The tradeoff is statistical noise at low populations and the loss of individual-level fidelity.

A sampling ratio of 50 (one agent per 50 residents) reduces a 10,000-population city to 200 pathfinding agents, which is trivially manageable. The representative approach works well for traffic density computation (the multiplied counts are statistically accurate) but poorly for anything requiring individual identity (citizen names, specific life events).

**Complexity comparison:**

| Approach | Per-tick cost | Memory | Emergent behavior |
|---|---|---|---|
| Statistical (128x128, 8 layers) | O(131,072) | ~128 KB | Gradients only |
| Full agent (10,000 citizens) | O(10,000 * pathfinding) | ~10 MB+ | Rich |
| Representative agent (ratio 50) | O(200 * pathfinding) | ~2 MB | Route-level |

---

## 2. The Simulation Tick Loop

The tick loop is the heartbeat of a city simulation. Its design determines what updates every frame, what updates monthly, and how the simulation stays synchronized with real time.

### Fixed vs. Variable Timestep

Glenn Fiedler's canonical "Fix Your Timestep" article establishes the pattern used by nearly all simulations: decouple the simulation timestep from the rendering framerate. The accumulator pattern deposits elapsed real time into a bucket and withdraws fixed-size chunks:

```
accumulator += frameDelta
while accumulator >= TICK_INTERVAL:
    simulation.tick()
    accumulator -= TICK_INTERVAL
render(interpolation = accumulator / TICK_INTERVAL)
```

City builders universally use fixed simulation timesteps. Variable timesteps cause non-deterministic behavior -- a pollution diffusion that runs at 60 Hz produces different results than one at 30 Hz because floating-point arithmetic is non-associative. Fixed steps guarantee reproducible results regardless of framerate.

### Multi-Rate Updates

Not everything needs to update at the same frequency. City sims typically use a multi-rate tick structure:

**Every tick (fastest rate):**
- Power grid propagation (BFS from plants through conductors)
- Agent movement / animation interpolation
- Fire spread (per-tick countdown timers)

**Every N ticks (monthly):**
- Demand recalculation (RCI curves)
- Land value computation (depends on pollution, crime, amenities)
- Crime/service coverage (radial influence from service buildings)
- Zone development (probability rolls for new buildings)
- Budget calculation (tax income, maintenance costs)
- Citizen route replanning (stale-route invalidation)
- Density progression (building upgrades based on desirability)

**Less frequently (yearly or on-change):**
- Road graph rebuild (only when roads are placed/removed)
- Building index rebuild (only when buildings change)
- Historical snapshot recording

This amortization is critical. On a 128x128 map, computing land values requires visiting 16,384 tiles and, for each, checking water adjacency, park proximity, pollution, crime, and road access. At 4 ticks per second, this would be 65,536 evaluations per second just for land value. Monthly evaluation (every ~12 ticks) reduces this to ~5,400 per second.

### Speed Controls

Players expect multiple simulation speeds. A common scheme maps speed settings to tick intervals:

| Speed | Tick interval | Effective ticks/sec |
|---|---|---|
| Paused | -- | 0 |
| Slow | 1000 ms | 1 |
| Normal | 250 ms | 4 |
| Fast | 100 ms | 10 |
| Turbo | 25 ms | 40 |

At Turbo speed, the monthly tick fires every ~0.3 seconds (12 ticks / 40 tps), which constrains how expensive the monthly computation can be. If the monthly tick takes more than 25 ms, Turbo speed will stutter. This budget drives the optimization strategy for every monthly subsystem.

---

## 3. Layer Buffer Architecture

The layer buffer is the workhorse data structure of statistical city simulation: a flat typed array, one element per map tile, storing a single simulation quantity.

### Memory Layout

A 256x256 map has 65,536 tiles. Common layers and their natural types:

| Layer | Type | Range | Size (256x256) |
|---|---|---|---|
| Terrain | Uint8Array | enum (grass, water, forest...) | 64 KB |
| Zones | Uint8Array | enum (none, R, C, I) | 64 KB |
| Infrastructure | Uint16Array | bitfield (road, power, pipe...) | 128 KB |
| Power grid | Uint8Array | 0/1 (unpowered/powered) | 64 KB |
| Land value | Uint8Array | 0-255 | 64 KB |
| Pollution | Uint8Array | 0-255 | 64 KB |
| Crime | Uint8Array | 0-255 | 64 KB |
| Fire coverage | Uint8Array | 0-255 | 64 KB |
| Traffic density | Uint8Array | 0-255 | 64 KB |
| Elevation | Uint8Array | 0-255 | 64 KB |

Total for a 256x256 city: ~704 KB. This is remarkably compact. Even a 512x512 map uses under 3 MB for all layers combined. The data fits comfortably in L2 cache on modern CPUs.

Using typed arrays (rather than arrays of objects) provides three advantages:

1. **Cache locality.** Sequential iteration over a Uint8Array touches contiguous memory. A full scan of 65,536 bytes fits in ~16 cache lines per KB, and the hardware prefetcher handles the sequential access pattern perfectly.

2. **No GC pressure.** Typed arrays are allocated outside the JavaScript heap (in engines like V8). They produce zero garbage collector work during simulation ticks.

3. **SIMD potential.** Operations like `layer.fill(0)` or element-wise clamping can be auto-vectorized or manually optimized with WebAssembly SIMD.

### Propagation Strategies

Different simulation quantities require different propagation algorithms:

**Radial influence (service coverage, park bonus, pollution sources).** For each source, iterate over a bounding square of radius R and write influence that decays with distance:

```
for dy in range(-R, R+1):
  for dx in range(-R, R+1):
    dist = sqrt(dx*dx + dy*dy)
    if dist > R: continue
    influence = 1.0 - dist / R
    output[tile(cx+dx, cy+dy)] += influence
```

This is O(S * R^2) where S is the number of source buildings and R is the influence radius. For 10 police stations with radius 15, that is 10 * 31 * 31 = 9,610 writes -- fast enough to run every month.

A reusable Float32Array buffer avoids allocation: fill it with 0.0, accumulate influence from all sources, then convert to Uint8 for the final layer. This eliminates per-tick allocation entirely.

**Diffusion (pollution, noise).** Classic cellular automata averaging:

```
for each tile (x, y):
  new_value[x][y] = source[x][y] + decay * avg(old_value[neighbors])
```

This requires double-buffering (read from old, write to new) or careful in-place update ordering. Micropolis uses in-place updates with a specific scan direction, which introduces a slight directional bias but avoids the memory cost of a second buffer.

**BFS flood-fill (power, water).** Start from source buildings, expand through conductors. Uses a queue-based BFS that marks each tile as it is reached. O(V + E) where V is reachable tiles and E is adjacency edges (~4V for a grid). Covered in detail in section 7.

---

## 4. Spatial Indexing

City simulations constantly answer spatial queries: "What building is at tile (x, y)?", "Which police stations are within 15 tiles?", "Is there a road adjacent to this zone?" The choice of spatial index determines whether these queries are O(1), O(log n), or O(n).

### Grid-Based Lookup (Tile Index)

The simplest spatial index maps each tile to its occupant. For a flat grid, the index `y * width + x` provides O(1) lookup into a Map or flat array. For buildings with multi-tile footprints, every tile in the footprint is registered:

```
class BuildingIndex:
  private byTile: Map<number, Building>

  constructor(map):
    for each building b:
      for each (dx, dy) in b.footprint:
        byTile.set((b.y+dy) * width + (b.x+dx), b)

  get(x, y) -> Building | undefined:
    return byTile.get(y * width + x)

  has(x, y) -> boolean:
    return byTile.has(y * width + x)
```

This is the best approach when queries are predominantly point lookups ("what's at this exact tile?"). Rebuild cost is O(B * F) where B is building count and F is average footprint size -- a few hundred microseconds for a typical city.

### Quadtrees

Quadtrees recursively subdivide 2D space into four quadrants. Each leaf node contains a small number of objects. Queries ("find all objects in this rectangle") traverse only the relevant branches.

```
class QuadTree:
  bounds: Rect
  children: QuadTree[4] | null
  objects: Entity[]

  query(rect: Rect) -> Entity[]:
    if not intersects(bounds, rect): return []
    results = objects.filter(o => contains(rect, o.pos))
    if children:
      for child in children:
        results.push(...child.query(rect))
    return results
```

- **Insert/query:** O(log n) average
- **Memory:** O(n) plus tree overhead
- **Best for:** Non-uniform distributions, variable-density data, range queries

Quadtrees are overkill for tile-based city builders where the spatial domain is already discretized into a regular grid. They become valuable when the simulation includes off-grid entities (free-roaming agents, projectiles) or when the map size varies dramatically.

### Spatial Hash Maps

A spatial hash divides space into cells of fixed size and hashes each cell to a bucket:

```
cell_x = floor(entity.x / cell_size)
cell_y = floor(entity.y / cell_size)
bucket = hash(cell_x, cell_y)
```

- **Insert/query:** O(1) amortized
- **Memory:** O(n) for occupied cells only
- **Best for:** Uniform-size objects, dynamic scenes with frequent insertions/removals

For city builders, spatial hashing is most useful for tracking moving agents. Static buildings are better served by the tile-based index since they already live on the grid.

### Practical Heuristic

For tile-based city sims, the recommendation is:

- **Buildings:** Grid-based tile index (Map<number, Building>). Rebuild on mutation.
- **Moving agents:** Spatial hash or simple array scan (agent counts are typically low enough).
- **Range queries ("what's within R tiles"):** Manhattan-distance scan with early termination. For R=15, this checks at most 31x31 = 961 tiles -- fast enough without any index.

---

## 5. Demand and Development Models

The demand system is the economic engine of a city builder. It answers the question: "What should get built next?"

### The RCI Demand Triangle

SimCity established the Residential-Commercial-Industrial (RCI) demand model. Each zone type has a demand value from -1 (contraction) to +1 (growth). The three demands form a feedback loop:

- Residents need jobs (industrial + commercial) and shopping (commercial)
- Commercial needs customers (residential) and goods (industrial)
- Industrial needs workers (residential) and customers (commercial)

In SimCity 4, the RCI meter ranges from -50 to +50 and is displayed as a bar graph. A "balanced" city has all three near zero. Positive demand means more of that zone type should be built; negative means oversupply.

### Demand Calculation

A typical demand function considers:

```
residential_demand = base_demand * tax_modifier
                   - commute_penalty
                   + housing_shortage_signal

commercial_demand  = f(residential_capacity) * tax_modifier
                   + unmatched_shopping_signal

industrial_demand  = base_demand * dampened_tax_modifier
                   + unmatched_job_signal
```

The **tax modifier** is the primary player control: `1.0 - (tax_rate - 0.07) * 5.0` gives neutral demand at 7%, a boost below 7%, and suppression above. This creates the classic city builder tension between revenue and growth.

The **congestion penalty** creates a feedback loop with traffic: when average road congestion exceeds a threshold (e.g., 0.8), all demand is suppressed. This forces the player to solve traffic problems before the city can grow further.

**Citizen signals** (from the agent system) feed back into demand: high unemployment boosts industrial demand, long commutes suppress residential demand. This bidirectional coupling between the statistical demand model and the agent simulation is what makes hybrid architectures powerful.

### Development Probability

When demand is positive, empty zoned tiles have a per-month probability of developing:

```
p(develop) = base_probability * zone_demand
```

With `base_probability = 0.12` and `zone_demand = 0.8`, each empty powered tile with road access has a 9.6% chance of developing each month. Over 10 months, a tile has a 63% cumulative chance of development -- creating the organic, gradual fill-in pattern players expect.

Buildings spawn at the lowest density level. Density upgrades are a separate system (driven by population thresholds, desirability scores, and service coverage) that replaces low-density buildings with higher-density ones over time.

### Building Selection

When a tile develops, the engine must choose which building to place. Simple systems map zone type to a single building definition. More sophisticated systems use weighted random selection from a pool:

```
candidates = buildings.filter(b =>
  b.zone == tile.zone &&
  b.density <= max_allowed_density &&
  b.size fits available_space
)
selected = weighted_random(candidates, weight = b.desirability_match)
```

---

## 6. Pathfinding at Scale

Pathfinding is the most expensive per-agent operation in a city simulation. A city with 200 representative agents, each pathfinding twice per month (work route + commerce route), executes 400 A* queries monthly. The cost of each query depends on the road graph size and the algorithm used.

### A* on a Road Graph

The standard approach: build an adjacency-list graph from the road network and run A* with Manhattan distance as the heuristic.

```
function astar(graph, start, goal, mapWidth):
  gScore = {start: 0}
  fScore = {start: heuristic(start, goal, mapWidth)}
  cameFrom = {}
  open = {start}

  while open is not empty:
    current = argmin(open, n => fScore[n])
    if current == goal: return reconstruct(cameFrom, current)
    open.remove(current)

    for neighbor in graph[current]:
      tentative_g = gScore[current] + 1
      if tentative_g < gScore.get(neighbor, Infinity):
        cameFrom[neighbor] = current
        gScore[neighbor] = tentative_g
        fScore[neighbor] = tentative_g + heuristic(neighbor, goal, mapWidth)
        open.add(neighbor)

  return null  // unreachable
```

**Complexity:** O(V log V) with a proper min-heap for the open set. With a linear scan of the open set (simpler to implement), it degrades to O(V^2). For road graphs under 5,000 nodes, the linear scan is adequate -- the constant factor of heap operations can dominate at small sizes.

**Route length cap:** A maximum route length (e.g., 60 tiles) provides implicit pruning. Any `tentative_g > max_length` is rejected, which limits the search frontier and prevents pathfinding from exploring the entire graph for distant or unreachable goals.

### Stale Route Invalidation

When the player places or removes a road, every agent whose cached route passes through the affected tile must be flagged for replanning. Storing each route as both an array (for ordered traversal) and a Set (for O(1) containment checks) enables efficient invalidation:

```
function markRoutesStale(registry, changedTile):
  for each agent in registry:
    if agent.homeWorkRouteTileSet.has(changedTile):
      agent.homeWorkRouteStale = true
```

This is O(agents) per road change but avoids re-pathfinding until the next monthly tick, amortizing the cost.

### Hierarchical Pathfinding (HPA*)

For larger maps (256x256+), flat A* on the road graph becomes expensive. HPA* (Hierarchical Pathfinding A*) divides the map into clusters and precomputes inter-cluster paths:

1. **Abstraction:** Divide the map into square clusters (e.g., 16x16 tiles). Identify "entrance" nodes where roads cross cluster boundaries.
2. **Preprocessing:** For each cluster, run A* between all entrance pairs. Store the resulting costs in an abstract graph.
3. **Query:** Pathfind on the abstract graph (inter-cluster), then refine each abstract edge to a concrete path within each cluster.

The abstract graph has O(C * E) nodes where C is the cluster count and E is entrances per cluster. For a 256x256 map with 16x16 clusters, that is 256 clusters with perhaps 4-8 entrances each -- roughly 1,500 abstract nodes. A* on this graph is nearly instant.

**Tradeoff:** HPA* paths are near-optimal (not guaranteed optimal). The preprocessing cost is O(E^2) per cluster and must be rerun when roads change within a cluster. For city builders where road changes are infrequent relative to pathfinding queries, this is a net win.

### Contraction Hierarchies

Used in production routing engines (OSRM, Google Maps), contraction hierarchies preprocess the graph by "contracting" nodes: removing a node and adding shortcut edges between its neighbors if the shortcut represents a shortest path. Queries on the contracted graph search bidirectionally from source and target, meeting in the middle.

- **Preprocessing:** O(n log n) to O(n^2) depending on graph structure
- **Query:** O(log n) -- dramatically faster than A*
- **Update cost:** High. Any graph change requires partial re-contraction.

For a city builder where the road graph changes constantly (players add roads every few seconds), the update cost makes contraction hierarchies impractical unless the graph is partitioned into independently contractable regions.

### Route Caching

The cheapest pathfinding query is one you never execute. Cache routes by (source, destination) pair and invalidate only when the graph changes along the cached path. With a tile-set per route, invalidation is O(1) per tile change per agent.

---

## 7. Utility Propagation

Power and water networks in city builders are modeled as connectivity problems: "Is this building connected to a power plant?" The standard algorithm is BFS flood-fill from each source.

### BFS Power Propagation

```
function propagatePower(map, powerGrid, buildingIndex):
  powerGrid.fill(0)
  for each plant in findPowerPlants(map):
    bfsPower(map, powerGrid, plant, buildingIndex)

function bfsPower(map, powerGrid, plant, buildingIndex):
  remaining = plant.capacity
  queue = []

  // Seed BFS with plant footprint tiles
  for each tile in plant.footprint:
    powerGrid[tile] = 1
    remaining--
    queue.push(tile)

  head = 0
  while head < queue.length and remaining > 0:
    current = queue[head++]
    for each neighbor of current:
      if powerGrid[neighbor] != 0: continue
      if isConductor(map, neighbor, buildingIndex):
        powerGrid[neighbor] = 1
        remaining--
        queue.push(neighbor)
```

A tile is a **conductor** if it has a power line, a road, a zone, or a building. This means roads double as power conduits -- a design choice from SimCity that simplifies player experience (no need to lay power lines along roads).

**Capacity limits** turn the connectivity problem into a constrained BFS: each plant can power at most N tiles. The BFS naturally respects this by decrementing `remaining` and stopping when it hits zero. Tiles closest to the plant (in BFS order) are powered first.

**Complexity:** O(V + E) where V is reachable tiles and E is ~4V (grid adjacency). For a 128x128 map, this is at most ~65,000 operations per plant -- the entire power simulation runs in well under 1 ms.

### Network Splits

When the player bulldozes a road that was a power conduit, the network may split. BFS handles this naturally: on the next tick, `powerGrid.fill(0)` clears all power, and BFS recomputes from scratch. Tiles on the disconnected side simply are not reached.

This "clear and recompute" strategy is simpler and more robust than incremental graph maintenance. Since power BFS runs every tick and completes in under 1 ms, the cost of full recomputation is negligible.

### Water and Sewage

Water distribution follows the same BFS pattern but with flow direction and pressure. A simplified model uses BFS from water pumps with a capacity constraint (gallons per month). A more realistic model computes flow using pipe diameters and elevation differences, essentially solving a simplified fluid dynamics problem on a graph.

For most city builders, the simplified BFS model is sufficient. Players care about "is this building connected to water?" -- not "what is the water pressure at this tile?"

---

## 8. Service Coverage Models

Service buildings (police, fire, hospital, school) must define their area of effect. The model chosen affects both gameplay and simulation cost.

### Radius-Based (Euclidean / Manhattan)

The simplest model: a service building covers all tiles within radius R. Implementation iterates over a bounding square and checks distance:

```
for dy in range(-R, R+1):
  for dx in range(-R, R+1):
    if sqrt(dx*dx + dy*dy) <= R:  // Euclidean
      coverage[tile(cx+dx, cy+dy)] += influence(dist)
```

With linear decay (`influence = 1.0 - dist/R`), the result is a smooth gradient from full coverage at the station to zero coverage at the edge. Multiple overlapping stations accumulate, clamped to [0, 1].

**Funding modulation:** An effective radius of `baseRadius * (funding / 100)` lets players trade budget for coverage. At 50% funding, radius halves, and coverage area drops to 25%.

**Cost:** O(S * R^2) per monthly update where S is the station count. With 10 stations and R=15, that is ~9,600 evaluations, writing into a reusable Float32Array buffer. The final conversion to Uint8Array (`Math.min(255, floor(influence * 255))`) produces the overlay-ready layer.

### Road-Connected

Some city builders require services to be connected via roads. A fire truck does not fly in a straight line -- it drives. Road-connected coverage runs BFS or Dijkstra from the station along the road graph with a distance limit:

```
function roadConnectedCoverage(station, graph, maxDist):
  visited = {}
  queue = [(station.accessRoad, 0)]
  while queue not empty:
    (tile, dist) = queue.dequeue()
    if dist > maxDist: continue
    visited[tile] = 1.0 - dist / maxDist
    for neighbor in graph[tile]:
      if neighbor not in visited:
        queue.enqueue((neighbor, dist + 1))
  return visited
```

This produces coverage that follows the road network, creating more interesting gameplay -- players must ensure good road connectivity to their service buildings, and dead-end neighborhoods get worse coverage.

**Cost:** O(V + E) per station, constrained by `maxDist`. More expensive than radius-based but more realistic.

### Response-Time-Based

The most sophisticated model simulates actual response time: how long would it take a fire truck to drive from the station to the fire? This uses Dijkstra's algorithm on a weighted road graph where edge weights reflect speed limits, congestion, and distance.

Cities: Skylines II uses a response-time model for emergency services, where traffic congestion directly affects service quality. This creates a powerful feedback loop: bad traffic leads to slow emergency response, which leads to more fires, which leads to more traffic from fire trucks.

### Voronoi Tessellation

An alternative to radius-based coverage: each tile is assigned to its nearest service building, creating a Voronoi diagram. This is useful for school districts or garbage collection zones where every tile must be assigned to exactly one facility.

Computation: for each tile, find the closest service building by Manhattan distance. O(tiles * stations), but can be accelerated with a multi-source BFS that runs simultaneously from all stations.

---

## 9. Event Systems

City simulations generate a stream of events: fires start, buildings complete construction, citizens are born and die, budgets are calculated, disasters strike. A well-designed event system decouples event generation from event handling.

### Event Queue Pattern

The event queue, described in Robert Nystrom's *Game Programming Patterns*, stores notifications in FIFO order. Producers enqueue events without knowing who will handle them; consumers process events at their own pace.

```
interface GameEvent:
  type: string       // 'fire_started', 'building_complete', 'bankruptcy'
  payload: any       // event-specific data
  timestamp: number  // tick when the event occurred

class EventQueue:
  private queue: GameEvent[] = []

  emit(event: GameEvent):
    queue.push(event)

  drain() -> GameEvent[]:
    result = queue.splice(0)
    return result
```

For city builders, the event queue serves two purposes:

1. **UI notifications.** The rendering layer drains the queue each frame and displays toasts, alerts, and map markers.
2. **Inter-system communication.** When the fire system starts a fire, the event queue notifies the insurance system, the citizen happiness system, and the news ticker -- without any of those systems knowing about each other.

### Monthly Event Lifecycle

A common pattern clears the event queue at the start of each monthly tick and allows subsystems to emit events during processing:

```
tick():
  if isMonthlyTick():
    events = []  // clear
    calculateDemand()         // may emit 'demand_shift'
    updateZones()             // may emit 'building_complete'
    updateFires()             // may emit 'fire_started', 'fire_extinguished'
    calculateBudget()         // may emit 'emergency_loan', 'bankruptcy'
    // events now contains all monthly events for UI consumption
```

### Priority and Urgency

Some events are more important than others. A fire in the city center demands immediate player attention; a minor demand shift does not. Event systems can include a priority field or use separate channels (critical alerts vs. informational notifications).

### Determinism

Events must be generated deterministically from the simulation state. If the event system uses random numbers (e.g., fire probability), those must come from the simulation's seeded PRNG, not from `Math.random()`. This ensures that replaying the same inputs produces the same events.

---

## 10. Save/Load and Serialization

City simulation state is complex: multiple typed array layers, a list of buildings with heterogeneous properties, agent state with cached routes, PRNG state, financial history. Serialization must capture all of this faithfully.

### What to Serialize vs. What to Recompute

A key design decision: **derived state** can be recomputed from **primary state** and does not need to be saved.

| Primary (must save) | Derived (can recompute) |
|---|---|
| Terrain, zones, infrastructure | Power grid (BFS from plants) |
| Buildings (position, type, density, residents) | Land values, crime, pollution layers |
| Tick count, month, year | Demand (from map state + tax rate) |
| Funds, tax rate, funding levels | Budget info |
| PRNG internal state | Building index (from buildings list) |
| Active fires (tile + remaining ticks) | Road graph (from infrastructure) |
| Loan state | Citizen summary |
| Citizen agents (home, work, routes) | |
| History snapshots | |

Recomputing derived state on load ensures consistency. If a save file is loaded after a code change that alters land value calculation, the recomputed values reflect the new formula rather than preserving stale data.

### Typed Array Serialization

Typed arrays (Uint8Array, Uint16Array, Float32Array) cannot be directly JSON-serialized. Two approaches:

1. **Array.from():** Convert to a plain number array. `Array.from(uint8Array)` produces `[0, 1, 0, 255, ...]`. Simple, human-readable in JSON, but ~3-5x larger than binary.

2. **Base64 encoding:** Convert the typed array's underlying ArrayBuffer to a base64 string. Compact (~33% overhead vs. binary), but not human-readable.

For save files under 10 MB, the Array.from approach is simpler and the size penalty is acceptable. For larger cities, base64 or binary formats (MessagePack, Protocol Buffers) become worthwhile.

### Save File Versioning

As the simulation evolves, the save format changes. A version field enables migration:

```
interface SaveFile:
  version: number  // increment on format changes
  map: { ... }
  state: { ... }
  timestamp: string

function restore(save: SaveFile):
  if save.version < 2:
    // v1 didn't store residents; default to building capacity
    for each building:
      if building.residents === undefined:
        building.residents = BUILDING_DEFS[building.defId].capacity

  if save.version < 3:
    // v3 added citizen agents; initialize empty
    save.state.citizens = { agents: [], samplingRatio: 50 }

  // ... continue with normal restore
```

Each version bump adds a migration step. Old saves are progressively upgraded through each version. This is the same pattern used by database migrations and works reliably as long as migrations are never removed.

### PRNG State Preservation

For deterministic simulation, the PRNG state must be saved and restored exactly. A linear congruential generator or xorshift PRNG has a small internal state (typically one or two 32-bit integers) that fully determines the sequence of future outputs. Saving this state ensures that a loaded game produces exactly the same future as if it had never been saved.

---

## 11. Performance Scaling

What limits city size? The answer depends on which subsystem hits its scaling wall first.

### CPU: The Monthly Tick Budget

At Turbo speed (40 tps), the monthly tick fires every ~300 ms. If the monthly simulation takes longer than the tick interval (25 ms at Turbo), the game stutters. The monthly budget must accommodate all subsystems:

| Subsystem | Scaling | Cost (128x128) | Cost (512x512) |
|---|---|---|---|
| Land value | O(tiles) | 0.5 ms | 8 ms |
| Crime | O(tiles + stations * R^2) | 0.3 ms | 5 ms |
| Fire coverage | O(stations * R^2) | 0.2 ms | 3 ms |
| Demand | O(buildings) | 0.1 ms | 0.5 ms |
| Zone development | O(tiles) | 0.3 ms | 5 ms |
| Agent replanning | O(agents * A*) | 1-5 ms | 10-50 ms |
| **Total** | | **~3-7 ms** | **~30-70 ms** |

Agent pathfinding dominates at large scales. On a 512x512 map with 5,000 road tiles and 400 agents replanning, each A* query explores up to 5,000 nodes (with the linear-scan open set, that is 25 million comparisons per month).

### Memory: Layer Storage

Layer memory scales quadratically with map size:

| Map size | Tile count | 10 Uint8 layers | + Uint16 infra | + Float32 influence |
|---|---|---|---|---|
| 64x64 | 4,096 | 40 KB | 48 KB | 64 KB |
| 128x128 | 16,384 | 160 KB | 192 KB | 256 KB |
| 256x256 | 65,536 | 640 KB | 768 KB | 1 MB |
| 512x512 | 262,144 | 2.5 MB | 3 MB | 4 MB |

Memory is rarely the bottleneck. Even at 512x512, total layer storage is under 10 MB.

### Optimization Techniques

**Amortized updates.** Not every subsystem needs to update every month. Crime changes slowly -- update it every 3 months. Land values depend on crime -- update them the month after crime. This spreads the cost across multiple months.

**Simulation LOD.** Distant or inactive parts of the city can be simulated at lower fidelity. A neighborhood with no recent construction or player interaction can skip detailed simulation and use cached values. This is conceptually similar to rendering LOD: simulate what matters, approximate the rest.

**Dirty-flag optimization.** Only recompute layers that have actually changed. If no buildings were placed or removed since the last land value calculation, skip it. Track dirty flags per subsystem.

**Open-set optimization for A*.** Replace the linear scan of the open set with a binary heap. For a road graph of 5,000 nodes, this reduces A* from O(V^2) = 25 million to O(V log V) = ~60,000 operations -- a 400x speedup.

**Batch pathfinding.** When many agents path to the same destination (e.g., all workers going to the same factory), compute the path once and share it. A destination-indexed cache maps (accessRoad_start, accessRoad_end) to path, reused by all agents with the same endpoints.

**Web Workers / Threading.** Move the simulation tick to a Web Worker. The main thread handles rendering and input; the worker computes the next state and posts it back. This prevents simulation computation from dropping frames.

**SIMD for layer operations.** Operations like `powerGrid.fill(0)`, element-wise clamp, and influence accumulation can benefit from WASM SIMD. Filling a 65,536-byte array with SIMD processes 16 bytes per instruction -- 4,096 instructions vs. 65,536 scalar writes.

---

## 12. Lessons for Bitborough

Bitborough already implements many of these patterns. This section maps the patterns described above to the existing codebase and identifies specific improvement opportunities.

### What Bitborough Already Does Well

**Layer buffer architecture.** The engine allocates Uint8Array layers for power, land value, pollution, crime, fire coverage, and traffic density, plus a Uint16Array for infrastructure (bitfield encoding roads, power lines, paved roads). A Float32Array influence buffer is allocated once and reused across crime and fire coverage calculations. This is textbook implementation -- zero allocation per tick, excellent cache locality.

**BFS power propagation.** `propagatePower()` uses BFS from power plant footprints through conductors (power lines, roads, zones, buildings). Capacity is tracked with a `remaining` counter that stops BFS when the plant is exhausted. The power grid is cleared and recomputed every tick, cleanly handling network splits. This is the correct approach.

**Multi-rate tick loop.** Power runs every tick; everything else runs monthly (every `ticksPerMonth` ticks). The tick accumulator in the game layer uses the fixed-timestep accumulator pattern with configurable speed settings (Paused through Turbo).

**Representative agent model.** Citizens use a sampling ratio of 50:1. Each agent has a home, a work destination, and a commerce destination, with A* routes on the road graph. Routes are stored as both arrays and Sets for O(1) stale-detection. Traffic density is computed by accumulating agent routes scaled by the sampling ratio. This is a well-executed hybrid of statistical and agent-based simulation.

**Demand model.** The RCI demand system uses tax modifiers, residential capacity-driven commercial demand, citizen feedback signals (commute length, unmatched jobs/commerce), and congestion penalties. The bidirectional coupling between agent signals and statistical demand creates the feedback loops that drive interesting gameplay.

**Spatial indexing.** `BuildingIndex` maps every tile in a building's footprint to the building, enabling O(1) point queries. Rebuilt once per monthly tick.

**Serialization with versioning.** Save files include a version field and restore logic handles migration from older versions (defaulting residents, initializing citizen registries). Derived state (power grid, demand, budget, road graph) is recomputed on load rather than saved.

### Improvement Opportunities

**A* open-set performance.** The current A* implementation uses a Set with linear-scan minimum extraction (`for (const n of open) { if (f < bestF) ... }`). This is O(V) per extraction, making the total A* cost O(V^2). Replacing with a binary min-heap would bring this to O(V log V). The code notes this as a known tradeoff: "acceptable: road graph <= 5,000 nodes, called infrequently." At 512x512 map sizes with larger road networks, this becomes the primary bottleneck. A simple binary heap implementation is ~30 lines of code.

**Batch pathfinding / destination cache.** Currently, `findNearestBuilding()` runs A* to every candidate building and keeps the shortest. If 50 agents all live in the same neighborhood and work at the same factory, the same (start, end) A* query runs 50 times. A per-month pathfinding cache keyed by `(startRoad, endRoad)` would eliminate redundant queries.

**Amortized monthly updates.** All monthly subsystems run every month. Crime and fire coverage change slowly -- running them every 2-3 months and using cached values for intermediate months would reduce the monthly tick budget by ~30%.

**Dirty-flag building index.** `BuildingIndex` is rebuilt from scratch every monthly tick (`this.bldIdx = new BuildingIndex(this.map)`). Since buildings only change during zone development and bulldoze operations, tracking a `buildingsDirty` flag and skipping the rebuild when clean would save O(B * F) Map insertions most months.

**Road graph as typed array.** The road graph is currently a `Map<number, number[]>` -- a JS Map of arrays. For a 128x128 map, this is fine. At larger scales, the Map has GC overhead. An alternative is a compact adjacency representation using two typed arrays (offset array + neighbor array), similar to a CSR (Compressed Sparse Row) graph format. This eliminates GC pressure entirely.

**Hierarchical pathfinding preparation.** For maps beyond 256x256, HPA* would reduce pathfinding cost dramatically. The road graph is already maintained incrementally (`updateRoadGraph()`), and cluster-level precomputation would integrate cleanly. This is a future optimization -- current map sizes do not warrant it.

**Traffic density as agent output.** Traffic density is currently computed from agent routes monthly. An alternative is to write traffic density incrementally as agents "travel" during sub-tick animation, producing a smoother traffic heatmap. This would require moving agents from monthly to per-tick updates (at the representative-agent scale, this is feasible).

**Web Worker offload.** The entire engine is synchronous. Moving `engine.tick()` to a Web Worker would free the main thread for rendering. The state transfer cost (structured clone of `getState()`) is modest for 128x128 maps (~1 MB) but increases at larger sizes. SharedArrayBuffer for the typed-array layers would eliminate the transfer cost entirely.

---

## Sources

### GDC Talks and Developer Presentations
- Andrew Willmott, ["Inside GlassBox"](https://www.andrewwillmott.com/talks/inside-glassbox) -- GDC 2012 presentation on SimCity 2013's simulation engine architecture
- ["GDC 2012: Breaking Down SimCity's GlassBox Engine"](https://www.gamedeveloper.com/design/gdc-2012-breaking-down-em-simcity-em-s-glassbox-engine) -- Game Developer summary of the GlassBox talk
- Colossal Order, ["Development Diary #2: Traffic AI"](https://colossalorder.fi/?p=1597) -- Cities: Skylines traffic simulation design
- Paradox Interactive, ["Cities: Skylines II Feature Highlight #2: Traffic AI"](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/traffic-ai) -- pathfinding cost model and agent decision-making

### Technical Articles and Books
- Glenn Fiedler, ["Fix Your Timestep!"](https://gafferongames.com/post/fix_your_timestep/) -- canonical article on fixed-timestep game loops and the accumulator pattern
- Glenn Fiedler, ["Floating Point Determinism"](https://gafferongames.com/post/floating_point_determinism/) -- challenges of deterministic simulation with floating-point math
- Glenn Fiedler, ["Serialization Strategies"](https://gafferongames.com/post/serialization_strategies/) -- game state serialization and delta compression
- Robert Nystrom, ["Event Queue"](https://gameprogrammingpatterns.com/event-queue.html) -- *Game Programming Patterns*, event queue pattern for decoupled communication
- Robert Nystrom, ["Spatial Partition"](https://gameprogrammingpatterns.com/spatial-partition.html) -- *Game Programming Patterns*, spatial indexing for game objects
- Robert Nystrom, ["Observer"](https://gameprogrammingpatterns.com/observer.html) -- *Game Programming Patterns*, observer pattern for game event systems
- Amit Patel, ["Pathfinding References"](https://theory.stanford.edu/~amitp/GameProgramming/References.html) -- comprehensive catalog of A*, Dijkstra, and hierarchical pathfinding resources

### Hierarchical Pathfinding
- Alexandru Ene, ["Hierarchical Pathfinding"](https://alexene.dev/2019/06/02/Hierarchical-pathfinding.html) -- practical HPA* implementation guide with performance analysis
- Hugo Scurti, [hugoscurti/hierarchical-pathfinding](https://github.com/hugoscurti/hierarchical-pathfinding) -- Unity implementation of near-optimal HPA*

### SimCity / Micropolis Source Code
- Don Hopkins, [SimHacker/micropolis](https://github.com/SimHacker/micropolis) -- GPL-licensed open source release of SimCity Classic
- Don Hopkins, [SimHacker/MicropolisCore](https://github.com/SimHacker/MicropolisCore) -- C++ core refactor of Micropolis, independent of UI
- Lecrapouille, [OpenGlassBox](https://github.com/Lecrapouille/OpenGlassBox) -- open source reimplementation of the GlassBox engine concepts
- Celia Pearce, ["Sims, BattleBots, Cellular Automata, God and Go"](https://www.gamestudies.org/0102/pearce/) -- interview with Will Wright on SimCity's cellular automata design

### SimCity Design History
- Jimmy Maher, ["Will Wright's City in a Box"](https://www.filfre.net/2016/06/simcity-part-1-will-wrights-city-in-a-box/) -- *The Digital Antiquarian*, history of SimCity's design and development
- Chaim Gingold, [*Building SimCity*](https://mitpress.mit.edu/9780262547482/building-simcity/) -- MIT Press, comprehensive history of SimCity's design and engineering
- ["New Games of Life: Cellular Automata and Subsurface Discourses in SimCity"](https://semioticblocks.com/essays/Newgamesoflife.pdf) -- academic analysis of SimCity's cellular automata foundations

### RCI Demand Systems
- ["RCI - SC4D Encyclopaedia"](https://wiki.sc4devotion.com/index.php?title=RCI) -- detailed documentation of SimCity 4's RCI demand meter mechanics
- ["Demand, Desirability, and Abandonment"](https://community.simtropolis.com/omnibus/simcity-4/reference/demand-desirability-and-abandonment-r31/) -- Simtropolis reference on SimCity 4's demand and development model

### Spatial Indexing
- ["Quadtree vs Spatial Hashing -- a Visualization"](https://zufallsgenerator.github.io/2014/01/26/visually-comparing-algorithms) -- visual performance comparison of spatial indexing approaches
- ["Quad trees vs R-trees vs Spatial hashmaps"](https://gamedev.net/forums/topic/661021-quad-trees-vs-r-trees-vs-spacial-hashmaps/) -- GameDev.net discussion of spatial indexing tradeoffs

### Performance Optimization
- Felipe Alfonso, ["The SIMD Experience: Data Parallelism on my Game Engine"](https://medium.com/@pixelstab/the-simd-experience-data-parallelism-on-my-game-engine-13711054ed6e) -- practical SIMD optimization for game simulation
- Erin Catto, ["SIMD Matters"](https://box2d.org/posts/2024/08/simd-matters/) -- Box2D's use of SIMD for physics constraint solving
- ["How Traffic Works in Cities: Skylines"](https://www.gamedeveloper.com/design/how-traffic-works-in-cities-skylines) -- Game Developer analysis of Cities: Skylines traffic simulation
