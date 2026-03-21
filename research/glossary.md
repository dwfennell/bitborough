# Glossary

> Key terms from urban planning, economics, game design, and Bitborough-specific concepts used across the research collection.

## Table of Contents
- [Urban Planning & Geography](#urban-planning--geography)
- [Economics & Finance](#economics--finance)
- [Transportation](#transportation)
- [Game Design](#game-design)
- [Simulation & Architecture](#simulation--architecture)
- [Bitborough-Specific](#bitborough-specific)

---

## Urban Planning & Geography

**Agglomeration economies** — The productivity benefits firms gain by clustering in cities rather than distributing across space. Three mechanisms drive agglomeration: labor market pooling (deeper talent pools reduce search costs), input sharing (shared specialized suppliers), and knowledge spillovers (face-to-face transfer of tacit knowledge). A city of one million typically enjoys a 12-18% productivity premium over rural areas. Appears in economy-and-employment.md, urban-growth-patterns.md.

**Alonso-Muth-Mills model** — The standard monocentric urban economics model (Alonso 1964, Muth 1969, Mills 1967). All employment locates at the CBD; residents trade off commute cost against housing cost. Produces the negative-exponential density gradient described by Clark's Law. The model predicts that areas with lower effective distance from employment develop at higher density. Appears in urban-density-gradients.md, urban-growth-patterns.md.

**Bid-rent theory** — A model explaining how different land users sort themselves spatially by competing on willingness to pay for central locations. Commercial uses have the steepest bid-rent gradient (highest willingness to pay near the CBD, dropping rapidly with distance), industrial uses have a moderate gradient, and residential uses have the flattest. The intersection of these curves produces the concentric land-use pattern. Appears in economy-and-employment.md.

**Brownfield** — A previously developed site, typically former industrial or commercial land, that may be contaminated and requires cleanup before reuse. Brownfield redevelopment is a type of infill that leverages existing infrastructure while remediating environmental damage. Appears in urban-growth-patterns.md, environment-and-sustainability.md.

**Catchment area** — The geographic zone from which a facility draws its users, typically defined by walking distance or travel time. Standard planning catchments: 400m (5-minute walk) for bus stops, 800m (10-minute walk) for rail stations. Empirical 85th-percentile walking distances often exceed these standards. Appears in transit-oriented-development.md, public-services.md.

**CBD (Central Business District)** — The primary commercial and employment core of a city, characterized by the highest land values, tallest buildings, and greatest job concentration. In the monocentric model, the CBD is the single point around which the city organizes. Appears in economy-and-employment.md, urban-density-gradients.md, urban-growth-patterns.md.

**Clark's Law** — Colin Clark's 1951 empirical finding that population density decreases exponentially with distance from the city center: `D(x) = D_0 * e^(-bx)`, where `D_0` is central density, `b` is the gradient steepness, and `x` is distance. The characteristic radius `r_0 = 1/b` gives the distance at which density falls to 37% of its central value. Asian/European cities have steep gradients (compact cores); North American cities have shallow gradients (sprawl). Appears in urban-density-gradients.md, urban-growth-patterns.md.

**Concentric zone model (Burgess, 1925)** — A model of urban social structure where the city grows outward in rings: CBD at the center, a zone of transition (deteriorating housing, immigrant quarters), working-class residential, middle-class residential, and a commuter zone. The dynamic mechanism is invasion and succession, where each ring is progressively encroached upon by the adjacent inner ring. Appears in urban-growth-patterns.md.

**Euclidean zoning** — The dominant American land-use regulatory model, named after the 1926 Supreme Court case *Village of Euclid v. Ambler Realty*. Divides land into districts defined primarily by permitted use (Residential, Commercial, Industrial), each subdivided by intensity. Separates incompatible uses but produces car-dependent, single-use development patterns. Appears in land-use-and-zoning.md.

**FAR (Floor Area Ratio)** — The ratio of total building floor area to lot area. A 10,000 sq ft lot with FAR 2.0 can support 20,000 sq ft of floor area. FAR is the most direct control on development intensity, governing how much human activity a parcel can support regardless of building shape. Typical values range from 0.3-0.5 (suburban residential) to 10.0-15.0+ (CBD high-rise). Appears in land-use-and-zoning.md.

**Filtering** — The process by which housing moves down the quality and price spectrum as it ages, eventually serving lower-income households. New luxury construction frees up upper-middle units, which free up middle units, and so on. Empirical filtering cycles can take up to 100 years for a complete transition. Appears in housing.md.

**Form-based code** — A land-use regulatory system that controls the physical form of buildings (height, setbacks, frontage) rather than their use. Organized along a rural-to-urban transect (T1 Natural through T6 Urban Core). Permits mixed-use development by default, producing shorter trip distances and higher walkability than Euclidean zoning. Appears in land-use-and-zoning.md.

**Gentrification** — The process by which middle-class investment displaces working-class residents from inner-city neighborhoods. Neil Smith's rent gap theory (1979) explains it economically: when the gap between a property's current income and its potential income under highest-and-best use exceeds a threshold, capital flows in to close it. `rent_gap = potential_ground_rent - capitalized_ground_rent`. Clay (1979) identified four stages: pioneer, expansion, displacement, maturation. Appears in urban-growth-patterns.md, population-and-demographics.md, social-dynamics-and-segregation.md.

**Infill development** — Construction on vacant, underused, or previously developed land within existing urban areas rather than on greenfield sites at the periphery. Types include brownfield redevelopment, greyfield redevelopment (obsolete but uncontaminated sites like dead malls), adaptive reuse, vacant lot development, and densification. Appears in urban-growth-patterns.md.

**NIMBY / YIMBY** — NIMBY ("Not In My Backyard") describes opposition to new development, especially housing, near existing residents. YIMBY ("Yes In My Backyard") is a counter-movement advocating for increased housing construction and density. The NIMBY-YIMBY tension is central to housing supply politics and affordability debates. Appears in housing.md.

**Redlining** — The practice of denying mortgage credit and insurance to neighborhoods based on racial composition, institutionalized by the Home Owners' Loan Corporation (HOLC) maps (1935-1940). Neighborhoods graded "D" (marked in red) were cut off from conventional credit, creating self-reinforcing cycles of disinvestment. 74% of neighborhoods graded "Hazardous" in the 1930s remain low-to-moderate income today. Appears in urban-growth-patterns.md, social-dynamics-and-segregation.md.

**Sprawl** — Low-density, automobile-dependent development at the metropolitan fringe, characterized by single-use zoning, discontinuous development, strip commercial corridors, and minimal pedestrian infrastructure. Sprawl imposes 2-3x higher per-capita infrastructure costs and 20-40% more VMT than compact urban development. Appears in urban-growth-patterns.md.

**Tiebout sorting** — Charles Tiebout's 1956 theory that households "vote with their feet" by moving to the municipality whose tax-service bundle best matches their preferences. Creates self-reinforcing spatial inequality: high-income residents cluster, generating high tax revenue and excellent services, attracting more high-income residents. The mirror image is the fiscal death spiral. Appears in social-dynamics-and-segregation.md.

**TOD (Transit-Oriented Development)** — Development clustered around transit stations, combining high density, mixed use, and pedestrian-oriented design within a station's catchment area (typically 400-800m). Transit stations act as secondary density anchors, creating sub-peaks in the exponential density gradient. Property value premiums near stations average 10-40%. Appears in transit-oriented-development.md.

**UGB (Urban Growth Boundary)** — A regulatory line drawn around a metropolitan area beyond which urban-scale development is restricted. Portland, Oregon operates the most studied UGB in the US (established 1979), which increased population density 18% from 1990-2010 while constraining outward sprawl. Appears in urban-growth-patterns.md.

---

## Economics & Finance

**Cap rate (Capitalization rate)** — The ratio of a property's net operating income to its market value: `Cap Rate = NOI / Property Value`. Lower cap rates indicate lower perceived risk and higher valuations. Current ranges: 4.0-5.0% for Class A multifamily, 6.0-8.0% for Class A CBD office. Used to estimate property value from income: `Value = NOI / Cap Rate`. Appears in real-estate-development.md.

**Creative destruction** — Joseph Schumpeter's concept that capitalism advances through the perpetual cycle of new technologies and industries destroying existing ones. The cycle: Innovation, Imitation swarm, Market saturation, Profit erosion, Decline, New innovation. Cities dependent on a single sector are especially fragile to creative destruction (e.g., Detroit's auto industry decline). Appears in economy-and-employment.md.

**Economic base theory** — Divides a regional economy into basic (export) and non-basic (local-serving) sectors. Growth in the basic sector drives non-basic growth through a multiplier: `M = 1 / (1 - (Non-Basic / Total))`. Typical multipliers range from 1.5-2.0 (small towns) to 3.0-5.0+ (major metros). Larger cities capture more local spending, producing higher multipliers. Appears in economy-and-employment.md.

**Fiscal multiplier** — The ratio of change in economic output to a change in government spending. Local fiscal multipliers measure how much additional economic activity a dollar of municipal spending generates. Related to but distinct from the export base multiplier. Appears in municipal-finance.md.

**Millage rate** — The property tax rate expressed as dollars owed per $1,000 of assessed value. One mill = $1 per $1,000 = 0.1%. Formula: `Annual Property Tax = Assessed Value * (Millage Rate / 1000)`. Multiple overlapping taxing authorities (city, county, school district) each levy their own millage, summing to typical totals of 31-65 mills. Appears in municipal-finance.md.

**Multiplier effect** — The amplification of initial economic activity through successive rounds of local spending. When a factory hires workers, those workers spend money locally, creating demand for housing, retail, and services. Moretti's research found each tradable-sector job creates approximately 1.6 additional non-tradable jobs; high-tech jobs may create up to 2.0-5.0. Appears in economy-and-employment.md.

**NOI (Net Operating Income)** — A property's revenue minus operating expenses, excluding debt service. The fundamental measure of a property's cash-generating capacity: `NOI = Effective Gross Income - Operating Expenses`. Used to calculate cap rates and property valuations. Appears in real-estate-development.md.

**Property tax** — The single most important local government revenue source, accounting for roughly 61% of all local tax collections. Inherently spatial (maps directly to land and buildings). Assessed on the basis of market value using sales comparison, cost, or income approaches. Tax base erosion through population loss, abandonment, or exempt expansion creates vicious cycles of rising mill rates. Appears in municipal-finance.md.

**RCI demand** — The three-sector demand model originating in SimCity: Residential (R), Commercial (C), and Industrial (I). Global demand signals drive local development probability, with local conditions (traffic, land value, power) determining which zones respond. The interplay creates cyclical dependencies: industrial needs workers (R) and customers (C); commercial needs goods (I) and customers (R); residential needs jobs (I and C). Appears in simcity-internals.md, cities-skylines-internals.md, simulation-architecture-patterns.md.

**TIF (Tax Increment Financing)** — A value-capture mechanism where the base property tax assessment in a designated district is frozen, and the increment (growth in assessed value above the base) is diverted to a special fund for infrastructure or development. The property's overall tax rate does not change; TIF captures the growth. Chicago has over 140 TIF districts. Appears in transit-oriented-development.md, municipal-finance.md.

---

## Transportation

**A* pathfinding** — A graph-search algorithm that finds the shortest (or lowest-cost) path between two nodes using a heuristic to guide the search. Uses `f(n) = g(n) + h(n)`, where `g` is the cost from the start and `h` is a heuristic estimate to the goal. In city simulations, A* operates over road network graphs with edge weights representing travel time or distance. Cities: Skylines uses lane-level A*; Bitborough uses tile-level A* on its road graph. Appears in open-source-city-sims.md, cities-skylines-internals.md, simulation-architecture-patterns.md.

**BPR function (Bureau of Public Roads function)** — The standard volume-delay relationship for traffic modeling, developed in 1964: `t(v) = t_0 * (1 + alpha * (v/c)^beta)`, where `t_0` is free-flow travel time, `v` is traffic volume, `c` is capacity, `alpha` = 0.15, and `beta` = 4.0. At capacity (v/c = 1.0), travel time is 1.15x free-flow. The steep exponent means congestion costs accelerate dramatically past capacity. Appears in transportation-and-traffic.md.

**Congestion pricing** — Charging drivers a fee to use roads during peak periods, reflecting the external cost of congestion. The theoretical foundation is that each additional vehicle above capacity imposes costs on all other road users. Empirical implementations include London's Congestion Charge and Stockholm's time-varying tolls. Appears in transportation-and-traffic.md.

**Induced demand** — The empirically robust finding that building more road capacity generates new traffic that fills the capacity rather than reducing congestion. Duranton and Turner (2011) found an elasticity of approximately 1.0: a 10% increase in road capacity produces roughly 10% more traffic. Sources include increased driving by existing residents, induced commercial traffic, and migration toward expanded access. Appears in transportation-and-traffic.md.

**LOS (Level of Service)** — A six-grade system (A through F) from the Highway Capacity Manual that rates traffic operating conditions. LOS A is free flow (density <= 11 pc/mi/ln); LOS F is breakdown/forced flow (density > 45 pc/mi/ln). For game purposes, the v/c (volume-to-capacity) ratio provides a useful scalar from 0.0 to 1.0+. Appears in transportation-and-traffic.md.

**Marchetti's constant** — The empirical observation that humans consistently devote about one hour per day to travel regardless of available transportation technology. Improvements in speed are consumed as longer distances rather than time savings, explaining why induced demand persists. Appears in transportation-and-traffic.md.

**Mode choice** — The decision a traveler makes about which transportation mode to use (car, bus, rail, walking, cycling). Influenced by travel time, cost, reliability, comfort, and habit. Mode split models (typically logit-based) predict aggregate shares. Higher urban density and better transit access shift mode choice toward non-car options. Appears in transportation-and-traffic.md.

**VMT (Vehicle Miles Traveled)** — Total distance driven by all vehicles in a geographic area, typically reported per capita for comparison. Mixed-use neighborhoods generate 20-40% fewer VMT than single-use equivalents. VMT is a key measure of both transportation demand and environmental impact. Appears in transportation-and-traffic.md, land-use-and-zoning.md.

**YAPF (Yet Another Pathfinder)** — OpenTTD's production pathfinder, a templated A* implementation in C++ that handles road vehicles, trains, and ships through a unified framework. Uses segment-level caching (NPF caches at nodes; YAPF caches at segments — sequences of tiles between junctions) to amortize pathfinding cost across similar queries. Distinguishes between node penalty (turns, signals, slopes) and segment cost (distance, speed limits). Appears in open-source-city-sims.md.

---

## Game Design

**Cellular automata** — A discrete computational model where a grid of cells evolves over time based on simple rules applied to each cell and its neighbors. SimCity Classic used cellular automata for pollution diffusion, crime propagation, and land-value calculation. The approach is O(n) per layer per tick, cache-friendly, and trivially parallelizable. Appears in simcity-internals.md, simulation-architecture-patterns.md.

**Emergent gameplay** — Game behavior that arises from the interaction of multiple systems without being explicitly scripted by the designer. Traffic jams in Cities: Skylines are emergent: they result from the interaction of zoning placement, road topology, and agent pathfinding. Emergence is valuable when three conditions hold: the player can observe it, form a causal explanation, and respond to it. Appears in simulation-depth-vs-fun.md.

**Feedback loop** — A circular causal chain where the output of a system influences its own input. Positive (reinforcing) loops amplify change (high land value attracts wealthy residents, who raise land value further). Negative (balancing) loops stabilize systems (high crime drives residents away, reducing population density, which eventually reduces crime). City builders rely heavily on interacting feedback loops. Appears in simulation-depth-vs-fun.md, simcity-internals.md.

**Interesting decision (Meier's principle)** — Sid Meier's design heuristic: "Games are a series of interesting decisions." A decision is interesting when the player understands the options, the options have meaningfully different outcomes, and the right choice is not obvious. In city builders, spatial placement (where), timing (when to expand), and prioritization under scarcity (what to build first) are the primary interesting decisions. Appears in simulation-depth-vs-fun.md.

**Progression curve** — The arc of a city builder's gameplay experience across time. Typical phases: founding rush (0-30 min, creative optimism), infrastructure building (30-90 min, problem-solving), first crisis (1-2 hours, tension), expansion (2-6 hours, confident growth), optimization (6-20 hours, analytical satisfaction), and mastery/stagnation (20+ hours). Managing the mid-game transition from creation to maintenance is the genre's defining pacing challenge. Appears in progression-and-pacing.md, simulation-depth-vs-fun.md.

**Representative agent** — A simulation compromise where one agent represents N citizens, with its contributions multiplied by N. Reduces pathfinding and routing costs by a constant factor while preserving emergent route selection. A sampling ratio of 50 (one agent per 50 residents) reduces a 10,000-population city to 200 pathfinding agents. Works well for aggregate traffic density but poorly for individual identity. Appears in simulation-architecture-patterns.md.

**Simulation depth** — The degree of detail and fidelity in a game's underlying model. Deeper simulation can produce richer emergent behavior but risks opacity and micromanagement. The genre's history shows that simulation depth pays off most where it produces spatially visible, player-diagnosable consequences that connect directly to the player's core decisions (traffic, production chains, population dynamics). Appears in simulation-depth-vs-fun.md.

---

## Simulation & Architecture

**BFS propagation (Breadth-First Search propagation)** — A graph traversal algorithm that explores all nodes at the current depth before moving to the next level. In city simulations, BFS is used to propagate power from plants through conductors: starting from plant tiles, BFS visits adjacent tiles that carry power (roads, buildings), marking them as powered until capacity is exhausted. Micropolis/SimCity Classic established this pattern. Appears in simcity-internals.md, simulation-architecture-patterns.md, open-source-city-sims.md.

**Demand curve** — In city-builder context, the function mapping game state to growth pressure for each zone type (R, C, I). Demand values typically range from -1 (decline) to +1 (strong growth). The curve accounts for tax rates, employment ratios, congestion, and population. SimCity's "SetValves" algorithm is the original implementation; Bitborough uses a simplified variant with tax modifiers, congestion suppression, and citizen feedback signals. Appears in simcity-internals.md, simulation-architecture-patterns.md.

**Desirability** — A per-tile score (typically 0.0-1.0) measuring how attractive a location is for a given zone type. Factors vary by zone: residential desirability depends on safety (low crime), fire coverage, park proximity, and low pollution; commercial desirability depends on transit proximity and nearby residential density. A tile with zero desirability (no power or no road access) will not develop. Appears in simulation-architecture-patterns.md, cities-skylines-internals.md.

**Layer buffer** — A flat typed array (one element per map tile) storing a single simulation quantity such as pollution, crime, land value, or power state. The workhorse data structure of statistical city simulation. A 256x256 map with 10 layers uses under 1 MB. Typed arrays provide cache locality, zero GC pressure, and SIMD potential. Propagation strategies include radial influence (service coverage), diffusion (pollution), and BFS (power). Appears in simulation-architecture-patterns.md.

**Spatial indexing** — Data structures that enable efficient queries over spatial data, such as "which building occupies this tile?" or "what buildings are within radius R?" Bitborough uses a `BuildingIndex` class (a Map from tile index to Building) for O(1) lookups by coordinate. Cities: Skylines uses fixed-size arrays with index-based lookups. Spatial indexes must be rebuilt when the underlying data changes. Appears in simulation-architecture-patterns.md.

**Tick loop** — The heartbeat of a simulation engine: a fixed-timestep cycle where each "tick" advances the simulation by a discrete step. City builders use multi-rate tick structures: fast-rate updates for power propagation and agent movement, monthly-rate updates for demand, land value, crime, zone development, and density, and infrequent updates for road graph rebuilds. Speed controls map user-selected speeds to tick intervals (e.g., Slow = 1 tick/sec, Fast = 10 ticks/sec). Appears in simulation-architecture-patterns.md, simcity-internals.md, cities-skylines-internals.md.

---

## Bitborough-Specific

**Building definition (BuildingDef)** — A static data record that defines a building type's properties: ID (e.g., `res.low`, `com.high.b`), category (Residential, Commercial, Industrial, Special), density level, footprint size, resident capacity, job count, tax value, pollution radius and amount, and maintenance cost. Building definitions are stored in `buildings-registry.ts` and referenced by the `defId` field on placed buildings. Appears in the engine source at `/packages/engine/src/buildings-registry.ts`.

**Citizen agent** — A simulated individual with a home building, work building (job), commerce building (shopping), computed routes between them, and a satisfaction score. Citizens are stored in a `CitizenRegistry` and each agent represents multiple real residents according to the sampling ratio. Agents pathfind on the road graph using A*, and their routes contribute to traffic density on road tiles. Appears in the engine source at `/packages/engine/src/simulation/citizens.ts`.

**Density tier** — Bitborough organizes buildings into three density levels: Low, Medium, and High. Low-density buildings spawn from zoned tiles when demand is positive. Medium-density buildings replace low-density ones when conditions are met: proximity to the city center (using Clark's Law exponential decay), sufficient demand, and adequate desirability. High-density buildings replace medium-density ones when critical mass is achieved (more than half of neighbors within 3 tiles are Medium or High density). Upgrade probability uses: `P = demandFactor * e^(-distance / radius)`. Dereliction (downgrade) occurs after 3 months of sub-10% occupancy. Appears in the engine source at `/packages/engine/src/simulation/density.ts`.

**Dereliction** — The mechanic by which buildings downgrade when sustained low occupancy occurs. If a building's occupancy ratio stays below 10% for 3 consecutive months, it downgrades to the next lower density tier (High to Medium, Medium to Low). This models the real-world filtering process where buildings decline in quality and rent level over time. Residents are removed and the building enters a construction state before becoming active at the lower tier. Appears in the engine source at `/packages/engine/src/simulation/density.ts`.

**Fill rate / Drain rate** — The rates at which building populations converge toward their target occupancy. Fill rate (0.12) applies when the target exceeds current residents; drain rate (0.2) applies when the target is below current residents. The target is computed as `capacity * max(0, zoneDemand) * desirability`. Drain is faster than fill, meaning buildings empty more quickly than they fill, creating realistic population dynamics where decline is sharper than growth. Appears in the engine source at `/packages/engine/src/simulation/density.ts`.

**Power grid** — A Uint8Array layer buffer where each tile is either powered (1) or unpowered (0). Power propagates from power plant buildings (diesel, coal, nuclear) outward via BFS through adjacent tiles that contain roads, buildings, or other conductors. Each plant has a capacity (maximum number of tiles it can power). Unpowered tiles cannot develop; loss of power causes desirability to drop to zero. Appears in the engine source at `/packages/engine/src/simulation/power.ts`.

**Road graph** — A Map-based adjacency list representing the road network, where each road tile's index maps to an array of neighboring road tile indices. Built by scanning the full map for tiles with the `Infrastructure.Road` flag and connecting orthogonal neighbors. The road graph is the substrate for A* pathfinding by citizen agents and is rebuilt when roads are placed or removed. Maximum route length is capped at 60 tiles. Appears in the engine source at `/packages/engine/src/road-graph.ts`.

**Sampling ratio** — The number of real residents each citizen agent represents. Default value is 50, meaning one simulated agent per 50 residents. A city of 10,000 population generates approximately 200 pathfinding agents. This representative-agent approach reduces pathfinding cost while preserving aggregate traffic patterns. The tradeoff is statistical noise at low populations. Appears in the engine source at `/packages/engine/src/simulation/citizens.ts`.
