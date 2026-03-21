# Cities: Skylines Internal Systems

> Technical deep dive into Colossal Order's simulation architecture -- traffic pathfinding, citizen lifecycle, economic simulation, and the Unity modding ecosystem. Covers both the original Cities: Skylines (2015) and Cities: Skylines II (2023), with emphasis on what the decompiled code and modding community have revealed about the internals.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Traffic and Pathfinding](#traffic-and-pathfinding)
- [Citizen Simulation](#citizen-simulation)
- [District and Policy System](#district-and-policy-system)
- [Economic Simulation](#economic-simulation)
- [Service Simulation](#service-simulation)
- [Building Simulation](#building-simulation)
- [Cities: Skylines II Changes](#cities-skylines-ii-changes)
- [The Modding Architecture](#the-modding-architecture)
- [Key Algorithms](#key-algorithms)
- [Lessons for Bitborough](#lessons-for-bitborough)
- [Sources](#sources)

---

## Architecture Overview

Cities: Skylines was built by a team of 13 people at Colossal Order in Finland, using Unity 5 (later upgraded through Unity 2017+). The game's architecture follows a **manager pattern** -- a centralized `SimulationManager` orchestrates dozens of domain-specific managers, each responsible for one slice of the simulation. This is a pattern common in Unity games of this era: instead of ECS, you get singleton manager classes with large arrays of structs.

### The Manager Hierarchy

The `SimulationManager` sits at the top. Below it, specialized managers each own a fixed-size array of their domain objects:

- **CitizenManager** -- owns a `Citizen[]` array of 1,048,576 entries and a `CitizenInstance[]` of 65,536 (visible agents). Separately tracks `CitizenUnit[]` (524,288 entries) for building occupancy.
- **VehicleManager** -- owns 16,384 active vehicle slots and 32,768 parked vehicle slots.
- **BuildingManager** -- 49,152 building slots.
- **NetManager** -- 36,864 net segments, 32,768 net nodes, and 262,144 net lanes. The road network is a directed graph of nodes and segments, with lanes as sub-objects of segments.
- **PathManager** -- 262,144 path unit slots. Each path unit represents a computed route stored as a sequence of segment/lane references.
- **DistrictManager** -- 128 district slots.
- **TransportManager** -- 256 transport line slots.
- **TreeManager**, **PropManager**, **TerrainManager**, etc.

All of these use fixed-size arrays with 16-bit or 20-bit indices. This is why the game has hard population caps -- the arrays cannot grow. The `CitizenInstance` array at 65,536 (2^16) is the binding constraint on visible agents. The 1,048,576 `Citizen` entries (2^20) represent the "database" of all citizens who exist in the simulation, most of whom are not actively visible at any moment.

### The Simulation Loop

The simulation runs on a dedicated **simulation thread**, separate from the Unity main/render thread. The `SimulationManager` drives a tick-based loop with the following lifecycle callbacks:

1. **OnBeforeSimulationTick** -- called before each simulation tick begins. Mods use this to inject pre-tick logic.
2. **SimulationStep** -- each manager's `SimulationStepImpl` is called. Managers iterate over a subset of their arrays each frame (not all objects every tick -- they use staggered updates to spread load).
3. **OnAfterSimulationTick** -- post-tick callback.
4. **OnBeforeSimulationFrame** / **OnAfterSimulationFrame** -- frame-level hooks that wrap multiple ticks.

The simulation thread communicates with the render thread through double-buffered data. This is why the game can use "up to 8 threads" but still feels single-threaded -- most of the heavy simulation logic (pathfinding being the notable exception) runs sequentially on the simulation thread.

### Staggered Updates

Rather than simulating every citizen, vehicle, and building every tick, managers use a **round-robin** pattern. For example, `BuildingManager.SimulationStepImpl` might process buildings 0-255 on tick 0, 256-511 on tick 1, and so forth. This means each building gets updated once every N ticks, where N depends on the total count divided by the batch size. This is critical for performance -- simulating 50,000 buildings every tick would be prohibitive.

The pathfinder is the exception: it runs on its own pool of threads (up to 32 `PathFind` worker threads in TMPE's enhanced version), processing path requests from a queue asynchronously.

---

## Traffic and Pathfinding

Traffic is simultaneously Cities: Skylines' most impressive and most criticized system. The pathfinder handles cars, trucks, buses, pedestrians, service vehicles, and cargo -- all through the same A*-based framework operating over the road network graph.

### The Road Network Graph

The network is stored as a graph of **NetNode** and **NetSegment** objects. Nodes are intersections or endpoints; segments are road sections between nodes. Each segment contains multiple **NetLane** objects representing individual driving lanes, pedestrian paths, or parking lanes. The graph is bidirectional -- each segment has a start node and end node, and lanes have direction flags.

A typical four-lane road segment contains: 2 vehicle lanes (one per direction), 2 pedestrian lanes (sidewalks), and potentially parking lanes or bike lanes depending on the asset. Highway segments have more vehicle lanes and no pedestrian lanes.

### PathFind: The A* Implementation

The `PathFind` class runs on its own thread. When a citizen or vehicle needs a route, the relevant AI class (e.g., `CarAI`, `HumanAI`, `ResidentAI`) calls `PathManager.CreatePath()`, which queues a `PathUnit` with source and destination positions. The `PathFind` thread picks up queued requests and runs A* over the network graph.

The A* search operates at the **segment/lane** level, not the node level. The open set contains `(segment, lane, direction)` tuples. For each candidate, the algorithm evaluates:

- **Travel time** -- based on segment length divided by the lane's speed limit, adjusted for road type.
- **Lane change cost** -- changing lanes incurs an additional cost proportional to the number of lanes crossed.
- **Turn cost** -- turning at an intersection costs more than going straight.
- **Vehicle type constraints** -- trucks cannot use certain road types, pedestrians use sidewalk lanes, etc.
- **Transport mode switching** -- the pathfinder can plan multi-modal trips (walk to bus stop, ride bus, walk to destination) by treating transport stops as transfer nodes.

The heuristic is Euclidean distance to the goal, ensuring admissibility. The key weakness is that **routes are computed once and never updated** -- if traffic builds up after a route is computed, the vehicle sits in the jam rather than rerouting. This is the single biggest source of traffic complaints in CS1.

### Lane Selection

In vanilla CS1, lane selection was simplistic: vehicles picked the lane that would let them make their next turn. This meant highway traffic would merge into one lane hundreds of meters before an exit, creating artificial bottlenecks. The TMPE mod's **Dynamic Lane Selection (DLS)** added real-time lane re-evaluation:

- At each node, DLS performs a 5-segment lookahead to identify valid lane transitions.
- Lane transitions are classified as **safe** (no approaching traffic) or **unsafe** (requires gap acceptance).
- A scoring function balances **egoistic** behavior (maximize own speed) against **altruistic** behavior (overall traffic flow).
- Lane changes require at least a 15% speed improvement, and expected speed loss must not exceed 10%.
- Heavy trucks are excluded from DLS; emergency vehicles use separate, more aggressive logic.

### Vehicle Spawning and Despawning

Vehicles are spawned when a citizen or service building creates a trip. They follow their precomputed path until they reach the destination, at which point they despawn (or park, if the destination has parking). The infamous "despawning" behavior occurs when vehicles get stuck: after a timeout, they simply vanish, which prevents permanent gridlock but breaks immersion.

The 16,384 active vehicle limit is the game's Achilles' heel at scale. In a city of 100,000+ citizens, this limit causes phantom traffic -- trips that should generate vehicles but cannot because the pool is full. The "More Vehicles" mod extended this to 65,535 by patching the array size and all hardcoded references to 16,384 scattered through the decompiled code.

### Why Traffic is Both the Strength and the Weakness

The pathfinder is genuinely sophisticated for a city builder. Multi-modal routing, lane-level simulation, and per-vehicle pathfinding were unprecedented in the genre. But the decision to compute routes once (no dynamic rerouting), the simplistic lane selection, and the hard vehicle limits created emergent failure modes that dominated player experience. The modding community spent years building TMPE (Traffic Manager: President Edition) to address these gaps, ultimately producing a mod with more lines of code than many standalone games.

---

## Citizen Simulation

Citizens in Cities: Skylines are named agents with a full lifecycle. Each `Citizen` struct in the 1,048,576-entry array tracks: name, age, education level, wealth, health, happiness, home building, work building, and current activity.

### Lifecycle

Citizens progress through age groups: **Child**, **Teen**, **Young Adult**, **Adult**, **Senior**. Aging is tick-driven -- each simulation step advances age for a batch of citizens. The aging rate was a source of controversy: vanilla CS1 aged citizens unrealistically fast (a citizen could go from child to death in about 6 in-game years), leading to "death waves" where entire neighborhoods of same-age citizens would die simultaneously. The **Lifecycle Rebalance Revisited** mod became near-essential, adjusting aging curves and randomizing lifespans to prevent synchronized mortality.

### Education

Four education levels in CS1: **Uneducated**, **Educated** (elementary), **Well Educated** (high school), **Highly Educated** (university). Citizens attend the nearest available school of the appropriate level. Education level is the single most impactful variable on building levels -- educated citizens cause their residential buildings to level up, which increases tax revenue and population density.

The education system creates an implicit dependency chain: you need elementary schools before high schools matter, high schools before universities matter. Each school building has a student capacity, and citizens pathfind to schools just like they pathfind to work.

### Activity Selection

Each `CitizenInstance` (visible agent) has a current activity: going to work, going to school, shopping, going home, visiting a park, seeking medical care, etc. The AI classes (`ResidentAI`, `TouristAI`) use a state machine to transition between activities. The transition logic considers:

- **Time of day** -- citizens follow a schedule (work during day, home at night).
- **Needs** -- shopping need builds up over time; when it crosses a threshold, the citizen makes a shopping trip.
- **Proximity** -- destinations are selected by proximity. In CS1, this was **straight-line distance**, not network distance. A commercial building across a river might be "closer" than one down the street, leading to illogical trips.

### Happiness Calculation

Happiness in CS1 is an aggregate of several factors, each tracked per-citizen or per-building:

- **Health** -- proximity to healthcare, pollution exposure (air and ground), sewage backup.
- **Safety** -- proximity to police, local crime rate.
- **Education** -- access to schools.
- **Entertainment/Leisure** -- proximity to parks, plazas, unique buildings.
- **Services** -- water, electricity, garbage collection, heating (in Snowfall DLC).
- **Noise** -- proximity to noise sources (roads, industrial buildings, wind turbines).
- **Land value** -- higher land value correlates with higher happiness.

Each factor contributes a score, and the aggregate determines whether a citizen is happy enough to stay or will eventually move out (contributing to building abandonment).

### The 65,536 Agent Problem

Only 65,536 citizens can be "instantiated" (visible, moving around the city) at any time. In a city of 500,000, the vast majority of citizens are abstract entries in the `Citizen[]` array -- they have jobs and homes but never physically appear. The game creates and destroys `CitizenInstance` objects as needed to represent "some citizens going about their day." This is an agent-based approximation: the visible agents represent statistical samples of the population, not every individual.

---

## District and Policy System

Districts provide a spatial overlay for policy application. The `DistrictManager` tracks up to 128 districts, each defined by a painted area on the map. Districts are stored as a grid overlay -- each cell on the district grid maps to a district ID.

### How Districts Override Global Settings

Policies can be applied at two levels: **city-wide** or **per-district**. When a district-level policy is set, it overrides the city-wide setting for buildings and citizens within that district's boundaries. The resolution is determined by which district a building's position falls into on the district grid.

### Policy Categories

CS1 policies fall into four categories:

- **Industrial Specialization** -- farming, forestry, oil, ore. These change what industrial buildings produce and their visual appearance. They can only be applied to districts, not city-wide.
- **Services** -- e.g., smoke detector distribution (reduces fire hazard), high-tech housing (increases land value at a cost), parks and recreation (boosts leisure value).
- **Taxation** -- per-zone-type tax rates, adjustable by building density level.
- **City Planning** -- e.g., heavy traffic ban (prevents trucks on local roads within the district), encourage biking, pet ban.

### Simulation Effects

Each policy modifies specific simulation variables. For example:
- **Heavy Traffic Ban** modifies the pathfinding cost for trucks on roads within the district, making them prohibitively expensive so trucks route around.
- **Smoke Detector Distribution** reduces the fire hazard accumulation rate for residential buildings in the district, at a cost per building per week.
- **Parks and Recreation** multiplies the leisure contribution of parks within the district, boosting land value.
- **Tax adjustments** affect citizen happiness -- higher taxes reduce happiness, lower taxes increase it, both influencing demand.

---

## Economic Simulation

The economy in Cities: Skylines is driven by the **RCI demand system** -- Residential, Commercial, Industrial. Three demand bars reflect the city's need for each zone type, and the interplay between them drives city growth.

### The Demand Triangle

The demand system is fundamentally a feedback loop:

1. **Residential demand** rises when commercial and industrial zones have unfilled jobs. High demand means "we need more workers." The target unemployment rate is approximately 8% -- below this, residential demand drops.
2. **Commercial demand** rises based on the ratio of commercial workers to total population. The ideal ratio is roughly 1 commercial worker per 8 citizens. Commercial zones also need goods from industrial zones to sell.
3. **Industrial demand** rises when unemployment is high (workers available) and when commercial zones need goods. Industrial zones produce goods that commercial zones sell.

This creates a cyclical dependency: industrial growth requires workers (residential) and customers (commercial); commercial growth requires goods (industrial) and customers (residential); residential growth requires jobs (industrial and commercial).

### Tax Income

Tax revenue is calculated per building based on:
- **Zone type** -- residential, commercial, industrial, office each have base rates.
- **Building level** -- higher-level buildings generate more tax. This creates a strong incentive to invest in education and land value (which drive leveling).
- **Tax rate** -- player-adjustable from roughly 1% to 29%. Each zone type has a comfort range; exceeding it reduces happiness and can cause building abandonment.
- **Population density** -- higher-level buildings house more citizens, multiplicatively increasing revenue.

### Import/Export

Industrial zones that produce more goods than local commercial zones can consume will export the surplus. Conversely, if commercial zones need more goods than local industry produces, goods are imported. Import/export routes use the same pathfinding system -- cargo trucks drive to the map edge or to cargo train/ship terminals.

The CS2 production chain is more explicit: raw materials are extracted by specialized industry, refined into material or immaterial goods by manufacturing, and sold by commercial zones. Transportation costs are calculated based on distance and cargo weight, incentivizing co-location of production and retail.

### Building Progression Pool

In CS2, each building maintains a **rent money pool** that determines its level. Rent payments (based on land value, zone type, building level, and lot size) flow into this pool. Service costs (water, electricity, garbage, heating maintenance) are deducted. When the pool reaches a threshold, the building levels up. When it goes negative, the building is abandoned -- the "owner" decides the property is no longer viable.

The rent formula in CS2: `Rent = (LandValue + (ZoneType * BuildingLevel)) * LotSize * SpaceMultiplier`.

---

## Service Simulation

Services in Cities: Skylines (police, fire, health, education, garbage, death care) share a common architectural pattern: each service has buildings that dispatch vehicles to respond to demand.

### Vehicle Dispatch

Each service building maintains a pool of vehicles. When demand occurs (a building catches fire, a citizen gets sick, garbage accumulates), the building dispatches a vehicle. In CS1, dispatch used **straight-line proximity** -- the nearest service building by Euclidean distance would respond, regardless of actual travel time. This was a major pain point: a fire station across a river might be "closer" than one connected by a direct road.

CS2 fixed this by using the **pathfinding cost** for dispatch calculations. The dispatching building evaluates not just current position but projected position after completing existing orders, then selects the vehicle with the lowest total pathfinding cost to the target.

### Coverage Calculation

Service coverage in CS1 operates as a **distance-based heat map** radiating from service buildings along the road network. Coverage strength decays with distance. The coverage overlay (the green shading on roads) shows where the positive happiness effect of a service building reaches.

Key details:
- Coverage propagates along roads, not as a pure radius. Road type affects propagation distance -- 4-lane roads carry coverage farther than 2-lane roads.
- Coverage is binary for response (a fire truck will respond anywhere in the city) but graduated for the happiness/prevention bonus.
- Each service type has different impact factors per zone type. Fire coverage adds +0.5 to industrial buildings' fire prevention but only +0.2 to offices.

In CS2, coverage was split into two systems:
1. **Passive coverage** -- a static radius from the building with three parameters: range (meters), capacity (population before exhaustion), and magnitude (effect strength, fading at edges).
2. **Simulated coverage** -- from patrolling vehicles and citizen visits, extending effects beyond the passive radius. Response time depends on distance and traffic conditions.

### Service-Specific Mechanics

- **Garbage** -- accumulates per building over time. Garbage trucks follow routes, picking up garbage from buildings along their path (not just the target building). Garbage buildings have processing capacity; overflow goes to landfill.
- **Health/Death** -- sick citizens need ambulances; dead citizens need hearses. If hearses cannot reach a building (traffic jam), the dead body remains, lowering happiness for the entire building and eventually causing abandonment.
- **Education** -- school buildings have student capacity. Citizens pathfind to schools. Education level builds over time while attending.
- **Fire** -- fire hazard accumulates per building. When it exceeds a threshold, the building catches fire. Fire trucks respond and reduce the hazard. Burning buildings spread fire to neighbors, creating cascade risk.
- **Police** -- crime probability is calculated per building based on education levels, unemployment, happiness, and police coverage. Police cars patrol and respond to crimes.

---

## Building Simulation

Buildings in Cities: Skylines progress through levels (1-5 for residential, 1-3 for commercial/office) based on a set of requirements that mirror real urban dynamics.

### Level-Up Requirements

**Residential buildings** require:
- **Education** -- the primary driver. Educated citizens cause their buildings to level up. Elementary education enables level 2, high school enables level 3, and university education enables levels 4-5.
- **Land value** -- must exceed a threshold for each level. Land value is primarily driven by leisure (parks, plazas, unique buildings), proximity to water, and service coverage.
- **Services** -- health, fire, police, and education coverage all contribute.

**Commercial buildings** require:
- **Educated workers** -- commercial buildings need workers of appropriate education levels.
- **Land value** -- similar threshold system.
- **Goods supply** -- commercial buildings need industrial goods to sell. Supply chain disruption can prevent leveling.

**Industrial buildings** level based on:
- **Worker education** -- primarily.
- **Service coverage** -- less dependent on land value than residential/commercial.

### Abandonment Mechanics

Buildings can be abandoned when conditions deteriorate below the requirements for their current level. The causes cascade:

1. Land value drops (e.g., a nearby park is removed, or pollution increases).
2. The building can no longer sustain its current level.
3. Citizens become unhappy and begin moving out.
4. Partial occupancy means less rent income but the same fixed upkeep costs.
5. The building is abandoned.

Abandoned buildings are particularly destructive because they **lower land value for neighboring buildings**, potentially triggering a cascade of further abandonments. This is an emergent behavior from the simulation -- not explicitly designed, but arising from the interaction of land value propagation and building level requirements.

### Land Value Influences

Land value is computed per cell on a grid overlay and influenced by:

**Positive factors:**
- Parks, plazas, unique buildings (leisure)
- Service building proximity (education, fire, police, health)
- Water proximity (natural amenity)
- High-level buildings nearby (prestige effect)
- Policies like "Parks and Recreation" or "High Tech Housing"

**Negative factors:**
- Ground pollution (from industrial zones)
- Noise pollution (from roads, industrial buildings, power plants, wind turbines)
- Crime rate
- Dead bodies in buildings (uncollected by hearses)
- Garbage accumulation
- Abandoned buildings nearby

### Noise and Pollution

Noise pollution is a radius-based effect emanating from sources. Each source type has a noise value and a decay distance. Roads generate noise proportional to their traffic volume and road type (highways are louder). Industrial buildings generate noise based on their specialization. Trees act as noise dampeners, reducing propagation distance.

Ground pollution is emitted by industrial buildings and certain service buildings (landfills, incinerators). It spreads through the terrain and decays over time when the source is removed. Water pollution spreads through the water simulation, affecting water supply if intake pipes are downstream of sewage outlets.

---

## Cities: Skylines II Changes

Cities: Skylines II (2023) was a ground-up rewrite targeting Unity's **DOTS** (Data-Oriented Technology Stack) architecture. The technical ambition was enormous; the execution was troubled.

### ECS Architecture

CS2 replaces the manager-pattern-with-fixed-arrays approach with a full **Entity Component System**. Decompiled code reveals approximately **1,200 distinct ECS systems** powering game logic. Entities represent citizens, vehicles, buildings, road segments, etc. Components are pure data structs (position, health, education level, route). Systems are stateless processors that query and transform component data.

The theoretical advantages of ECS for a city simulation are compelling:
- **Cache-friendly iteration** -- processing all citizens' health in one pass touches contiguous memory, rather than jumping between manager arrays.
- **Parallelism** -- systems that touch non-overlapping component sets can run concurrently via Unity's Job System.
- **Burst compilation** -- the Burst compiler converts C# job code to highly optimized native code, with claimed 30-40x speedups for some calculations.
- **No fixed limits** -- entities are dynamically allocated, removing the hardcoded array caps that constrained CS1.

### What Went Wrong

Despite the architectural improvements, CS2 launched with severe performance problems. The root causes were primarily on the **rendering side**, not the simulation side.

**The DOTS-to-Renderer Bridge**: Unity's official Entities Graphics package was too immature for CS2's needs. It lacked proper support for skinned meshes, occlusion culling, and virtual texturing. Colossal Order was forced to implement their own rendering bridge using `BatchRendererGroup` and low-level GPU APIs. This custom renderer had critical gaps:

- **No occlusion culling** -- only frustum culling was implemented. Every building behind every other building was still submitted to the GPU.
- **No effective LOD system** -- character models had 56,000 vertices with no LOD variants. A single clothesline asset contained 25,000+ vertices with individually modeled clothespins. A pile of logs used 100,000+ vertices.
- **Cascaded shadow mapping consumed ~50% of frame time** -- four 2048x2048 shadow cascades generated 4,828 draw calls out of 6,705 total.

A single captured frame processed **121 million input vertices** and **36 million rasterized triangles**, with 6.7 GB of GPU memory consumed. Frame times of 88ms (11 FPS) were observed on capable hardware.

**CEO Mariina Hallikainen acknowledged**: "We completely overestimated the engine's capabilities at the beginning of the project." Colossal Order started development when DOTS was experimental; by the time it was declared production-ready, many core features were still incomplete.

### Simulation Improvements

Where CS2 did improve:

- **Dynamic rerouting** -- vehicles now re-evaluate routes based on traffic conditions, accidents, and congestion. No more sitting in infinite jams.
- **Cost-based pathfinding** -- four factors: Time, Comfort, Money, and Behavior. Different agent demographics (teens, adults, seniors) weight these differently.
- **Age-based behavior** -- teens prioritize cost, adults prioritize speed, seniors prioritize comfort.
- **Agent-specific service dispatch** -- service vehicles are dispatched based on pathfinding cost, not straight-line distance.
- **Building economics** -- the rent-money-pool system creates more realistic building lifecycle dynamics.
- **No hard population cap** -- ECS dynamic allocation removes the fixed array limits.

### The UI Layer

CS2 uses **Coherent Gameface** for its UI -- an HTML/CSS/JavaScript-based framework running React with Webpack bundling. This is a stark departure from Unity's native UI systems and reflects a prioritization of maintainability and iteration speed for UI development over raw performance.

---

## The Modding Architecture

Cities: Skylines' modding ecosystem is one of the most successful in gaming history. This was not accidental -- Colossal Order made deliberate architectural decisions that enabled it.

### Why It Worked

**Unobfuscated code**: Paradox and Colossal Order chose not to obfuscate the game's compiled C# assemblies. Any modder with ILSpy, DotPeek, or JustDecompile could read the game's entire codebase. This transparency was transformative -- modders could understand exactly how any system worked, not just what was exposed through the API.

**The ICities API**: The official modding API lives in the `ICities` namespace and provides several key interfaces:

- **IUserMod** -- the entry point. Defines mod name and description. Every mod implements this.
- **ILoadingExtension** -- hooks into level loading. Methods: `OnCreated`, `OnReleased`, `OnLevelLoaded`, `OnLevelUnloading`. Mods use this to replace managers, inject custom AI classes, and modify data at load time.
- **IThreadingExtension** / **ThreadingExtensionBase** -- hooks into the simulation loop. Provides `OnBeforeSimulationTick`, `OnAfterSimulationTick`, `OnBeforeSimulationFrame`, `OnAfterSimulationFrame`, and `OnUpdate` (render thread). This is how mods run per-tick logic. The base class also provides access to `IManagers`, linking to all manager singletons.

The API was intentionally minimalistic. But because the code was unobfuscated, modders could bypass the API entirely and directly access internal classes, replace AI implementations, and patch methods at runtime.

### Harmony Patching

**Harmony** (by Andreas Pardeike) became the backbone of deep modding. It provides runtime method patching -- prefix, postfix, and transpiler patches that modify game methods without replacing entire classes.

The **CitiesHarmony** mod (by boformer) served as a shared Harmony provider. Rather than each mod bundling its own Harmony DLL (risking version conflicts), all mods depended on CitiesHarmony, which provided a Cities-specific fork of Harmony with bug fixes for Unity's Mono runtime.

Typical Harmony usage pattern:
1. A mod identifies a game method to modify (e.g., `ResidentAI.SimulationStep`).
2. It creates a Harmony prefix patch that runs before the original method, potentially modifying parameters or skipping the original entirely.
3. Or a postfix patch that runs after, modifying the return value.
4. Or a transpiler patch that rewrites the method's IL bytecode.

This enabled mods like TMPE to surgically modify pathfinding behavior without replacing the entire `PathFind` class (though TMPE does that too, for its `CustomPathFind`).

### What Mods Could (and Did) Replace

The most ambitious mods effectively replaced entire subsystems:

- **TMPE** replaced `PathManager` with `CustomPathManager`, replaced `PathFind` with `CustomPathFind`, and patched dozens of AI methods to add lane selection, speed limits, timed traffic lights, and priority signs.
- **Lifecycle Rebalance Revisited** patched `ResidentAI` to adjust aging rates, education probabilities, and death timing.
- **Realistic Population** patched building AI to adjust household and workplace counts per building level.
- **81 Tiles** patched the area manager to unlock all 81 map tiles instead of the vanilla 9.
- **More Vehicles** patched `VehicleManager` and all code referencing the 16,384 constant to support 65,535 vehicles.

### CS2 Modding Changes

CS2's ECS architecture changed the modding paradigm. Instead of patching manager methods, modders create their own ECS systems that the game registers in the update loop. "The game will treat it the same way it treats any base game system." The modding toolchain provides automated setup of Unity, Burst compiler, and ECS dependencies.

However, Harmony patching only works on managed code -- Burst-compiled systems are opaque to Harmony patches. This limits the depth of modification possible compared to CS1, though entity and component data remain accessible.

---

## Key Algorithms

### Pathfinding Weight Calculation

The A* pathfinder in CS1 evaluates edges (segment transitions) with a cost function roughly structured as:

```
cost = base_travel_time
     + lane_change_penalty * num_lanes_changed
     + turn_penalty * turn_angle_factor
     + transport_mode_switch_penalty
     + congestion_estimate  (TMPE only, not vanilla)
```

Where:
- `base_travel_time = segment_length / speed_limit` -- adjusted for road type.
- `lane_change_penalty` has two components: a base cost proportional to lanes crossed, plus an additional cost for multi-lane changes.
- `turn_penalty` is weighted by the severity of the turn (U-turn > left turn > right turn > straight).
- TMPE adds randomization to congestion estimates to prevent herding behavior (all vehicles rerouting to the same "fastest" road, then causing congestion there).

CS2 expands this to four weighted dimensions:
- **Time**: dominant factor, segment travel time under current conditions.
- **Comfort**: penalizes unnecessary turns, rewards smooth routes.
- **Money**: fuel cost (proportional to distance), parking fees, toll roads.
- **Behavior**: willingness to make "dangerous" maneuvers (U-turns, rule violations). Emergency vehicles have lower behavior cost thresholds.

Agent demographic weighting: teens weight money highest; adults weight time highest; seniors weight comfort highest.

### Demand Curves

The RCI demand calculation in CS1 follows these approximate rules:

**Residential demand** = f(unemployment_rate, target_rate=0.08)
- When unemployment < 8%, residential demand is high (city needs more workers).
- When unemployment > 8%, residential demand drops (too many unemployed citizens).

**Commercial demand** = f(commercial_worker_ratio, target_ratio=0.125)
- Target: 1 commercial worker per 8 citizens.
- Below target: commercial demand rises.
- Also depends on goods availability from industrial zones.

**Industrial demand** = f(unemployment_rate, goods_demand)
- High unemployment pushes industrial demand up.
- Commercial zones needing goods pushes industrial demand up.

The three demands form an oscillating system -- satisfying one demand creates demand elsewhere, driving continuous growth.

### Building Level Requirements

Building leveling uses a threshold system where multiple conditions must be met simultaneously:

| Factor | Residential | Commercial | Industrial |
|--------|------------|------------|------------|
| Education | Primary driver | Required for workers | Required for workers |
| Land Value | Threshold per level | Threshold per level | Lower importance |
| Services | Health, fire, police | Health, fire, police | Fire, police |
| Goods Supply | N/A | Required | N/A |

The specific thresholds are not published but have been reverse-engineered by the modding community. Each building checks its conditions periodically (staggered update), and if all conditions are met, the building visually transforms to the next level's model, increasing capacity and tax output.

### Service Coverage Propagation

Coverage radiates from service buildings along the road network using a **flood-fill** algorithm with distance decay:

1. Start at the service building's road connection.
2. Propagate along connected segments, reducing coverage strength with distance.
3. Road type affects propagation speed -- wider roads carry coverage farther.
4. Stop propagation when coverage strength drops below a minimum threshold.

The result is a coverage heat map that follows the road network topology rather than simple Euclidean distance. This is why road connectivity matters for service coverage -- an area might be physically close but poorly covered if it lacks a direct road connection.

---

## Lessons for Bitborough

### Fixed Arrays vs. Dynamic Allocation

CS1's fixed-size arrays created hard caps that defined the game's scaling limits. CS2's ECS removed these caps but introduced complexity. For Bitborough, the tradeoff is clear: use dynamic collections but **design for a target scale** with explicit performance budgets. The 65,536 visible agent limit in CS1 was not arbitrary -- it was the number they could simulate per-tick within their frame budget.

### Staggered Updates Are Essential

CS1's round-robin update pattern is the simplest and most effective approach to simulating tens of thousands of entities. Not every building needs to check its fire hazard every tick. Not every citizen needs to re-evaluate their happiness every frame. Batch processing with staggered offsets keeps per-frame cost constant regardless of city size.

### Pathfinding is the Bottleneck

Traffic pathfinding dominated CS1's CPU budget and was the only system with its own thread pool. Plan for pathfinding to be the most expensive per-agent computation and design accordingly -- cache paths aggressively, use hierarchical pathfinding to avoid full A* for every trip, and consider approximations for service dispatch.

### Compute Routes Lazily, Invalidate Proactively

CS1's biggest mistake was computing routes once and never updating them. CS2 fixed this but at a cost. A middle ground: compute routes lazily (on first need), cache them, and invalidate the cache when the network changes or congestion shifts significantly. Avoid recomputing every route every tick.

### Proximity Should Use Network Distance

CS1's use of straight-line distance for service dispatch and shopping destination selection was a persistent source of unrealistic behavior. Always use network distance (or at minimum, a network-distance cache/approximation). This is more expensive but dramatically improves simulation credibility.

### The 80/20 of Agent Simulation

CS1 simulated 1,048,576 citizens but only 65,536 were visible at any time. This agent-sampling approach is sound: simulate the aggregate statistics for the full population but only instantiate visible agents for a representative sample. This is exactly what Bitborough's citizen system should do -- track population statistics globally, instantiate agents only when needed for pathfinding or visual representation.

### Land Value Cascades Are Emergent Gold

The cascading abandonment behavior in CS1 (where one abandoned building lowers land value, causing neighbors to abandon) was emergent, not designed. But it creates compelling gameplay. Design your land value and building health systems to allow this kind of cascading feedback, but provide the player with tools to intervene.

### Modding as a Survival Strategy

CS1 was built by 13 people. The modding community effectively became an extension of the dev team, fixing traffic AI, rebalancing lifespans, extending limits, and adding missing features. If Bitborough exposes its simulation parameters and systems cleanly, community modding can multiply the effective development team. CS1's decision not to obfuscate code was arguably worth more than any single feature they shipped.

### ECS is Not a Silver Bullet

CS2's ECS migration achieved its simulation goals (better parallelism, no fixed caps, Burst-compiled performance) but created severe problems in areas where ECS and Unity's renderer did not integrate well. For Bitborough, use data-oriented patterns where they provide clear benefits (entity iteration, cache locality) but do not force everything into ECS. The simulation layer and the rendering layer can use different paradigms.

---

## Sources

### GDC Talks and Developer Materials
- [GDC EU 2015: Karoliina Korppoo - "Cities: Skylines, A Case Study"](https://archive.org/details/GDCEU2015Korppoo) -- Internet Archive recording of the GDC Europe presentation
- [GDC Vault - Cities: Skylines, A Case Study](https://gdcvault.com/play/1022809/Cities-Skylines-A-Case) -- Official GDC Vault entry

### Colossal Order Developer Diaries
- [Development Diary #2: Traffic AI](https://colossalorder.fi/?p=1597) -- CO's official traffic AI breakdown for CS2
- [Development Diary #11: Citizen Simulation & Lifepath](https://colossalorder.fi/?p=1851) -- Citizen lifecycle system for CS2
- [Development Diary: Code Modding](https://colossalorder.fi/?p=2200) -- CS2 modding architecture and ECS toolchain

### Paradox Interactive Feature Highlights
- [CS2 Feature Highlight: Traffic AI](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/traffic-ai) -- Pathfinding cost system details
- [CS2 Feature Highlight: Citizen Simulation & Lifepath](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/citizen-simulation-lifepath) -- Education, happiness, agent behavior
- [CS2 Feature Highlight: City Services, Districts & Policies](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/city-services-districts-policies) -- Service dispatch and coverage model
- [CS2 Feature Highlight: Economy & Production](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/economy-production) -- Rent formula, production chains, import/export

### Technical Analysis
- [Why Cities: Skylines 2 Performs Poorly - paavohtl's blog](https://blog.paavo.me/cities-skylines-2-performance/) -- Detailed GPU frame capture analysis, rendering pipeline breakdown, LOD analysis
- [Cities: Skylines 2's Troubled Launch (Hacker News discussion)](https://news.ycombinator.com/item?id=38333474) -- Developer commentary on ECS/DOTS tradeoffs
- [Why Cities: Skylines 2 Performs Poorly (Hacker News discussion)](https://news.ycombinator.com/item?id=38153573) -- Community technical analysis
- [Decompiling Cities: Skylines II Code - Pinter Computing](https://pinter.org/archives/15631) -- Guide to decompiling CS2 assemblies

### Modding Documentation and Community
- [Cities: Skylines Modding Guide (ReadTheDocs)](https://citiesskylinesmoddingguide.readthedocs.io/en/latest/modding/Getting-Started/) -- Official modding getting-started guide
- [Reverse Engineering Guide](https://citiesskylinesmoddingguide.readthedocs.io/en/latest/modding/Workflow/Reverse-Engineering.html) -- Decompilation tools and techniques
- [CitiesHarmony - Harmony 2.x for Cities: Skylines (GitHub)](https://github.com/boformer/CitiesHarmony) -- Harmony patching provider
- [TMPE - Traffic Manager: President Edition (GitHub)](https://github.com/CitiesSkylinesMods/TMPE) -- The most important CS1 mod, full source
- [TMPE Advanced AI Documentation](https://doc.tmpe.me/l-advanced-ai.html) -- Pathfinding cost calculation details
- [TMPE Dynamic Lane Selection Documentation](https://doc.tmpe.me/l-dynamic-lane-selection.html) -- Lane scoring algorithm
- [CS2 ECS Explorer](https://captain-of-coit.github.io/cs2-ecs-explorer/) -- Interactive visualization of CS2's ~1200 ECS systems

### Wiki and Community Resources
- [Cities: Skylines Game Limits Guide (Steam)](https://steamcommunity.com/sharedfiles/filedetails/?id=2712549268) -- Comprehensive list of all hardcoded array sizes
- [Land Value - Cities: Skylines Wiki](https://skylines.paradoxwikis.com/Land_value) -- Land value factor documentation
- [Lifecycle Rebalance Revisited (Nexus Mods)](https://www.nexusmods.com/citiesskylines/mods/58) -- Aging system rebalance mod

### Interviews and Press
- [Cities: Skylines 2 Boss: "Completely Overestimated" Unity (PC Gamer)](https://www.pcgamer.com/games/sim/cities-skylines-2-boss-says-they-completely-overestimated-the-unity-engines-capabilities/) -- Mariina Hallikainen on DOTS challenges
- [CS1 Dev: Don't Punish Your Players, Teach Them (Gamasutra)](https://www.gamedeveloper.com/design/-i-cities-skylines-i-dev-don-t-punish-your-players-teach-them) -- Design philosophy from Korppoo's GDC talk
