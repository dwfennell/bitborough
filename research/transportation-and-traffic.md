# Transportation and Traffic

> How urban transportation networks function, congest, and shape city development — models for traffic simulation.

## Table of Contents

- [Road Network Topology](#road-network-topology)
- [Traffic Flow Theory](#traffic-flow-theory)
- [Level of Service](#level-of-service)
- [Induced Demand](#induced-demand)
- [Congestion Modeling](#congestion-modeling)
- [Road Hierarchy](#road-hierarchy)
- [Public Transit Modes](#public-transit-modes)
- [Transit Ridership](#transit-ridership)
- [Mode Choice](#mode-choice)
- [Last-Mile Problem](#last-mile-problem)
- [Parking Economics](#parking-economics)
- [Congestion Pricing](#congestion-pricing)
- [Vehicle-Miles Traveled](#vehicle-miles-traveled)
- [Application to Bitborough](#application-to-bitborough)
- [Cross-References](#cross-references)
- [Sources](#sources)

---

## Road Network Topology

Road networks fall into three broad topological families, each with distinct routing and capacity properties.

**Grid networks** use perpendicular intersections and uniform blocks. They maximize connectivity — every intersection provides multiple route options, creating high redundancy and distributing traffic across many paths. Manhattan, Portland, and Barcelona are canonical examples. Grids produce high intersection density (typically 100-200 intersections per square mile in a fine grid) and short blocks that encourage walking.

**Radial networks** organize roads around a central hub with arterials radiating outward and ring roads providing circumferential connections. Paris, Moscow, and Washington DC follow this pattern. Radial layouts maximize accessibility to the center but create bottleneck points where radial routes converge. Circumferential trips (suburb to suburb) are poorly served.

**Organic networks** emerge from incremental historical growth, topography, and property boundaries. Medieval European cities and many Asian cities exhibit this pattern. They have low connectivity, irregular block sizes, and unpredictable routing — but they can produce traffic calming through confusion and circuity.

### Connectivity Metrics

- **Intersection density**: number of intersections per unit area. Higher values correlate with more route options and shorter pedestrian trips.
- **Connected node ratio**: (4-way intersections) / (all intersections). A grid approaches 1.0; a cul-de-sac suburb may be 0.1-0.3.
- **Link-node ratio**: edges / nodes in the road graph. Values above 1.4 indicate a well-connected network; below 1.2 suggests a tree-like (dendritic) structure with limited redundancy.

For a city simulation, network topology determines how well traffic distributes. A well-connected grid allows A* to find many alternative routes of similar length, while a dendritic network funnels all traffic through a few critical links.

---

## Traffic Flow Theory

The **fundamental diagram** of traffic flow, first articulated by Greenshields (1935), relates three variables:

```
q = k * v
```

- `q` = flow (vehicles per hour)
- `k` = density (vehicles per km or per mile)
- `v` = speed (km/h or mph)

Greenshields hypothesized a linear speed-density relationship:

```
v(k) = v_f * (1 - k / k_j)
```

- `v_f` = free-flow speed (speed at zero density)
- `k_j` = jam density (density at which traffic stops)

Substituting into the flow equation produces a parabolic flow-density curve:

```
q(k) = v_f * k * (1 - k / k_j)
```

This curve peaks at **capacity** — the maximum throughput a road segment can sustain. At densities below this peak, traffic is in **free flow** (stable). At densities above it, traffic is in **forced flow** (unstable, congested). The peak itself is the critical point where small perturbations can trigger breakdown.

### Key Thresholds

| Parameter | Typical Freeway Value | Typical Urban Arterial |
|---|---|---|
| Free-flow speed (`v_f`) | 100-120 km/h (60-75 mph) | 50-65 km/h (30-40 mph) |
| Jam density (`k_j`) | 120-160 veh/km/lane | 150-200 veh/km/lane |
| Capacity flow | 2,000-2,400 veh/hr/lane | 800-1,200 veh/hr/lane |
| Capacity density | 25-45 veh/km/lane | 40-60 veh/km/lane |

The key insight: adding vehicles beyond capacity does not increase throughput — it decreases it. This nonlinear breakdown is what makes congestion self-reinforcing.

---

## Level of Service

The Highway Capacity Manual (HCM), maintained by the Transportation Research Board, defines six Levels of Service (LOS A through F) to grade traffic operating conditions. For freeways and multilane highways, the primary metric is density (passenger cars per mile per lane, pc/mi/ln).

| LOS | Density (pc/mi/ln) | v/c Ratio | Description |
|-----|---------------------|-----------|-------------|
| A | <= 11 | <= 0.35 | Free flow. Drivers unimpeded, full lane-change freedom. |
| B | 11-18 | 0.35-0.54 | Reasonably free flow. Slight restriction on maneuverability. |
| C | 18-26 | 0.54-0.77 | Stable flow near free-flow speed. Lane changes require care. |
| D | 26-35 | 0.77-0.93 | Approaching unstable. Speed declines, limited maneuvering. |
| E | 35-45 | 0.93-1.00 | At capacity. Unstable flow, minor disturbances cause breakdown. |
| F | > 45 | > 1.00 | Forced/breakdown flow. Stop-and-go, demand exceeds capacity. |

Density thresholds are from the HCM 6th/7th editions. The LOS E/F boundary is set at 45 pc/mi/ln for all free-flow speeds. For urban arterials and signalized intersections, LOS is measured differently (control delay in seconds per vehicle for intersections, travel speed for arterials), but the A-F grading remains.

**For game purposes**, LOS provides a natural way to grade road segments and communicate congestion to the player. The v/c ratio is the most useful simplification: a single scalar 0.0-1.0+ per road tile.

---

## Induced Demand

Building more road capacity does not reduce congestion — it generates new traffic that fills the capacity. This is empirically one of the most robust findings in transportation economics.

### The Fundamental Law of Road Congestion

Duranton and Turner (2011) analyzed data across US metropolitan areas and found that vehicle-kilometers traveled (VKT) increases in essentially exact proportion to interstate highway lane-kilometers. The elasticity is approximately 1.0: a 10% increase in road capacity produces roughly a 10% increase in traffic, returning congestion to its prior level.

Sources of the additional VKT: increased driving by existing residents, induced commercial traffic, and migration of new residents toward areas with expanded road access.

### Downs-Thomson Paradox

The equilibrium speed of car traffic on a road network is determined by the average door-to-door speed of the equivalent journey by public transit. If roads improve but transit degrades (as often happens when transit loses riders to improved roads), the long-run equilibrium speed may actually decrease. Mogridge (1990) documented this effect in central London.

### Braess's Paradox

Adding a road to a network can increase travel time for all users. In a 1968 paper, Braess demonstrated this mathematically: a new link that appears to help can shift the Nash equilibrium to a worse outcome. Real-world confirmations include Stuttgart (1969), where closing a new road reduced congestion, and Seoul's Cheonggyecheon restoration, where removing an expressway sped up citywide traffic.

### Marchetti's Constant

Humans consistently devote about one hour per day to travel, regardless of available transportation technology. Improvements in speed are consumed as longer distances rather than time savings. This explains why induced demand persists — faster roads cause people to live further from work, not to commute less.

**Implication for simulation**: if the game allows road expansion to permanently solve congestion, it breaks the most fundamental empirical law in transportation. A realistic model must generate new traffic in response to new capacity.

---

## Congestion Modeling

### BPR Function

The Bureau of Public Roads (BPR) function, developed in 1964, is the standard volume-delay relationship used in traffic assignment models:

```
t(v) = t_0 * (1 + alpha * (v / c) ^ beta)
```

- `t(v)` = travel time at volume v
- `t_0` = free-flow travel time
- `v` = traffic volume
- `c` = practical capacity
- `alpha` = delay sensitivity (standard: 0.15)
- `beta` = delay exponent (standard: 4.0)

With default parameters, a road at capacity (v/c = 1.0) takes 1.15x free-flow time. At v/c = 1.5, it takes 1.91x. At v/c = 2.0, it takes 3.40x. The steep exponent means congestion costs accelerate dramatically past capacity.

### Calibrated Parameters by Road Type

| Road Type | alpha | beta | Notes |
|-----------|-------|------|-------|
| Freeway | 0.15 | 4.0 | Standard BPR defaults |
| Urban arterial | 0.15 | 4.0 | Or recalibrated: 0.20, 10.0 |
| Collector | 0.20 | 4.0 | More sensitive to overloading |
| Local street | 0.50 | 4.0 | Breaks down faster |

More recent work proposes alternative functions (conical VDF by Spiess, 1990; Davidson function) that better model the steep inflection near capacity. But the BPR function remains dominant in practice because of its simplicity and differentiability for optimization.

### Application to Routing

In traffic assignment, the BPR function serves as the edge-weight function. Instead of uniform edge weights (as in standard A*), each road segment's cost is `t(v)` — travel time that increases with congestion. This produces **user-equilibrium** routing: agents shift to less-congested routes until no one can improve their travel time by switching.

---

## Road Hierarchy

The FHWA functional classification system organizes roads into three tiers based on the trade-off between **mobility** (moving vehicles through) and **access** (reaching adjacent land).

| Classification | Function | Typical Capacity (veh/hr/lane) | % of Road Miles | % of VMT |
|---|---|---|---|---|
| Arterial | Long-distance through-movement | 800-1,800 | ~10% | ~55-65% |
| Collector | Funnel local traffic to arterials | 400-800 | ~10-15% | ~15-20% |
| Local | Land access, origin/destination | 100-400 | ~75-80% | ~15-20% |

**Arterials** (including interstates and principal arterials) prioritize mobility. They carry the bulk of traffic over long distances with limited access points. Signals are coordinated, turning movements restricted, and speeds higher.

**Collectors** (major and minor) bridge between local streets and arterials. They gather traffic from residential and commercial areas and deliver it to the arterial network.

**Local streets** prioritize access. They serve individual properties, carry low volumes, and feature low design speeds. Cul-de-sacs, residential loops, and alleys fall here.

### Hierarchy in Network Design

A well-functioning road network has clear hierarchy: many local streets feed into fewer collectors, which feed into fewer arterials. Traffic volume increases as you move up the hierarchy, and so does road capacity. When hierarchy breaks down — arterial traffic cutting through residential streets, for instance — livability and safety degrade.

For a game, road hierarchy is both a design lever (the player builds different road types) and an emergent property (traffic volume determines effective function regardless of what was built).

---

## Public Transit Modes

Transit modes vary enormously in capacity, cost, speed, and appropriate urban context.

### Capacity and Cost Comparison

| Mode | Capacity (pphpd) | Capital Cost ($/mile) | Operating Cost ($/veh-rev-mile) | Typical Speed | Right-of-Way |
|---|---|---|---|---|---|
| Local bus | 2,000-7,000 | $0.5-2M | $3.10 | 15-25 km/h | Shared with traffic |
| BRT | 9,000-30,000 | $5-50M | $3.60 | 25-40 km/h | Dedicated lanes |
| Light rail (LRT) | 12,000-27,000 | $35-100M | $5.40 | 30-50 km/h | Dedicated/semi-excl. |
| Metro/heavy rail | 40,000-72,000 | $200M-4B | $6.50 | 35-80 km/h | Grade-separated |
| Commuter rail | 15,000-40,000 | varies | varies | 50-100 km/h | Shared/dedicated rail |

**pphpd** = passengers per hour per direction. Capacity figures represent ranges from ITDP BRT Planning Guide and National Transit Database reports.

Outlier BRT systems (TransMilenio in Bogota at 49,000 pphpd, Guangzhou at 27,000 pphpd) demonstrate that BRT with full infrastructure can approach light metro capacity at a fraction of the capital cost.

### Cost-per-Passenger

The operating cost per vehicle-revenue-mile is misleading in isolation because higher-capacity modes carry more passengers per vehicle. Metro costs $6.50/vehicle-mile but only $282 per thousand passenger-miles — the lowest of any mode. Buses cost $3.10/vehicle-mile but $616 per thousand passenger-miles.

### Mode Selection Logic

In real planning, mode selection follows demand:
1. **< 5,000 pphpd**: local bus is sufficient and cost-effective
2. **5,000-15,000 pphpd**: BRT or enhanced bus
3. **15,000-30,000 pphpd**: LRT or high-capacity BRT
4. **> 30,000 pphpd**: metro/heavy rail justified

---

## Transit Ridership

### What Drives Ridership

Jarrett Walker's "ridership recipe" identifies the key factors:

1. **Density**: more people per unit area within walking distance of stops means more potential riders. Below ~15 persons/acre, transit struggles to attract riders; above ~30 persons/acre, high-frequency service becomes viable.

2. **Walkability**: good pedestrian access to stops. If the walk is unsafe or unpleasant, people drive even for short connections.

3. **Frequency**: Walker's axiom — "frequency is freedom." Headways of 15 minutes or less transform transit from a scheduled mode into a spontaneous one. Houston METRO's redesign around a frequent grid produced 11% weekday ridership growth and 30% weekend growth.

4. **Linearity**: direct routes attract more riders than circuitous ones. Deviating to serve every neighborhood dilutes the usefulness for through-riders.

5. **Speed**: competitive travel time with driving. Dedicated lanes, signal priority, and grade separation all contribute.

6. **Land use mix**: combining residential and commercial uses along transit corridors creates bidirectional demand (commuters in the morning, shoppers in the evening), improving cost-effectiveness.

### Frequency vs. Coverage Trade-off

Transit agencies face a fundamental tension: concentrate service on high-ridership corridors (frequency) or spread service thinly across the entire city (coverage). Ridership-maximizing networks look like high-frequency grids in dense areas with minimal suburban coverage. Coverage-maximizing networks serve everyone poorly.

Walker observes that most agencies try to do both and end up with infrequent service everywhere — the worst of both worlds. The optimal strategy depends on whether the agency prioritizes ridership (revenue, mode share) or equity (access for transit-dependent populations).

### Ridership Elasticities

- Fare elasticity: -0.2 to -0.5 (a 10% fare increase reduces ridership 2-5%)
- Frequency elasticity: 0.3 to 0.5 (doubling frequency increases ridership 30-50%, not 100%)
- Speed elasticity: 0.5 to 1.0 (faster service strongly attracts riders)

---

## Mode Choice

### The Logit Model

Transportation planners model how travelers choose between modes using discrete choice theory. The multinomial logit model assigns a probability to each mode based on its **utility**:

```
P(mode_i) = e^(U_i) / sum(e^(U_j) for all j)
```

The utility function is a weighted sum of attributes:

```
U_i = beta_time * travel_time_i
    + beta_cost * travel_cost_i
    + beta_wait * wait_time_i
    + beta_walk * walk_time_i
    + ASC_i
```

- `beta` coefficients are negative (more time/cost = less utility)
- `ASC_i` = alternative-specific constant capturing unobserved preferences (comfort, reliability, habit)
- In practice, `beta_wait` is typically 2-3x `beta_time` (waiting feels worse than moving)
- `beta_walk` is typically 1.5-2x `beta_time`

### Key Mode Choice Factors

| Factor | Impact | Notes |
|---|---|---|
| Travel time | Primary driver | Door-to-door, including access/egress/wait |
| Cost | Strong, income-dependent | Parking costs often excluded from perceived driving cost |
| Reliability | High | Variance in travel time matters as much as the mean |
| Vehicle ownership | Structural | Car-owning households drive 3-5x more than carless ones |
| Land use density | Indirect | Dense areas make transit competitive, walking viable |
| Parking availability | Strong | Scarce/expensive parking is the strongest transit incentive |

### Value of Time

Travelers implicitly value time at roughly 40-60% of their wage rate for commute trips. This means higher-income travelers are less sensitive to transit fare savings and more sensitive to time losses — a key equity consideration.

---

## Last-Mile Problem

The "last mile" (more accurately, the "first/last mile") is the gap between a transit stop and the traveler's actual origin or destination. It is the single largest barrier to transit ridership.

### Walking Distance Thresholds

- Most transit riders are willing to walk up to **400m (1/4 mile) to a bus stop** and **800m (1/2 mile) to a rail station**.
- The FTA uses a 1/2-mile radius as the standard pedestrian transit catchment area.
- For cycling, the catchment extends to approximately **3 miles** (5 km).
- Beyond these thresholds, ridership drops off steeply — roughly exponentially with distance.

### Solutions

1. **Walkable station areas**: sidewalks, crosswalks, weather protection, safe pedestrian environments within the catchment area.
2. **Feeder bus networks**: local bus routes connecting to rail stations.
3. **Bike infrastructure**: bike lanes, bike parking, and bike-share at stations. Cycling triples the effective catchment area.
4. **Transit-oriented development**: zoning that places density within walking distance of stations, solving the last-mile problem by eliminating the distance.
5. **Ride-hailing/microtransit**: demand-responsive services connecting low-density areas to fixed-route transit.

The last-mile problem is why transit-oriented development matters: if you put enough people and jobs within walking distance of stations, the last-mile problem largely disappears.

---

## Parking Economics

### The Shoup Critique

Donald Shoup's *The High Cost of Free Parking* (2005, revised 2011) demonstrated that minimum parking requirements — mandated by nearly every US city's zoning code — impose enormous hidden costs:

- Parking requirements increase development costs by more than **10x the impact fees** for all other public purposes combined.
- Off-street parking in the US consumes an area roughly the size of Connecticut.
- Minimum parking requirements have been set for over 600 different land uses, with numbers based on surveys of peak parking demand at suburban locations — circular logic that embeds auto-dependency into the built environment.
- Free or subsidized parking inflates driving demand, worsens congestion, and degrades urban design by spreading buildings apart with surface lots.

### Parking's Effect on Land Use

Each surface parking space consumes roughly 300-350 sq ft (including access lanes). A 100-unit apartment building required to provide 1.5 spaces per unit devotes 45,000-52,500 sq ft to parking — often more ground area than the building itself. This forces lower density, wider building setbacks, and auto-oriented site design.

Structured parking costs $25,000-$50,000 per space to build. Underground parking can exceed $75,000 per space. These costs are bundled into rents and purchase prices, whether or not the occupant owns a car.

### Shoup's Three Reforms

1. **Remove minimum parking requirements**: let the market determine how much parking to build.
2. **Charge market prices for on-street parking**: target 85% occupancy (1-2 open spaces per block).
3. **Return parking revenue to the neighborhood**: fund local improvements to build political support.

**Game implication**: parking requirements could function as a density cap. Relaxing parking mandates (a policy lever) would allow higher density at the cost of increased traffic on nearby roads.

---

## Congestion Pricing

Congestion pricing charges drivers for using roads during peak periods, internalizing the external cost that each additional vehicle imposes on all other travelers.

### Theory

The marginal social cost of a trip exceeds its private cost because each additional vehicle slows every other vehicle on the road. A congestion charge bridges this gap, nudging the system toward the socially optimal traffic level. The optimal toll equals the marginal external cost at the efficient traffic level.

### Real-World Results

| City | Started | Traffic Reduction | Mode Shift | Revenue |
|---|---|---|---|---|
| Singapore | 1975 (updated 1998) | Maintains 45-65 km/h on expressways | +3.5% transit | Dynamic pricing |
| London | 2003 | -33% car trips into zone (by 2006) | +25% bus, +49% cycling | ~$280M/year |
| Stockholm | 2006 (trial), 2007 (permanent) | -20% traffic into center | +3.5-6% transit | ~$107M CAD/year |

Stockholm's results are notable: population grew 10% over the following decade while traffic fell 22%. The net social benefit was estimated at EUR 65M/year, driven by shorter travel times ($85M/year), increased road safety ($18M/year), and health/environmental benefits ($13M/year). Public support, which was lowest just before the trial began, rose to roughly 70% once people experienced the results.

London saw congestion charging reduce vehicle-km in the zone by 11% and shift 33% of car trips to other modes, primarily bus and bicycle. The charge zone generated roughly GBP 220M ($280M) in annual revenue, funding transit improvements.

**Game mechanic opportunity**: a congestion toll zone could reduce traffic density within the zone while generating revenue, but requires transit alternatives to avoid simply punishing citizens.

---

## Vehicle-Miles Traveled

VMT per capita is the single best summary metric of a city's transportation demand and auto-dependency. It correlates strongly with density, income, and transit access.

### Density-VMT Relationship

The relationship between residential density and VMT is well-established: doubling density reduces VMT per capita by 5-12%, all else equal. The mechanism is that denser areas place origins and destinations closer together, make transit viable, and make walking/cycling practical.

US metropolitan VMT per capita varies widely:
- New York metro: ~20 miles/day per capita
- San Francisco: ~22 miles/day per capita
- Atlanta, Houston: ~30+ miles/day per capita

The highest VMT metros are predominantly in the southeast US (low density, limited transit, hot climate discouraging walking). The lowest are in the northeast and Pacific coast (higher density, better transit).

### Income-VMT Relationship

Higher-income households drive more: they own more vehicles and make more discretionary trips. But this relationship is weaker in dense, transit-rich areas — wealthy New Yorkers drive less than middle-income Houstonians.

### VMT as a Policy Target

Many state and regional plans now target VMT reduction rather than congestion reduction (which is futile per Duranton-Turner). California's SB 375 requires metropolitan planning organizations to plan for per-capita VMT reductions, achieved through land use changes rather than road building.

---

## Application to Bitborough

### Current Implementation

Bitborough's traffic system has these components:

- **Road graph**: 4-connected grid of road tiles (`RoadGraph = Map<number, number[]>`), built from infrastructure layer. Each edge has uniform weight of 1.
- **A\* pathfinding**: Manhattan-distance heuristic, `MAX_ROUTE_LENGTH = 60` tiles. Returns shortest path or null.
- **Citizen agents**: sampled at 1:50 ratio (`DEFAULT_SAMPLING_RATIO = 50`). Each agent has home-work and home-commerce routes stored as tile arrays.
- **Traffic density layer**: `Uint8Array` (one byte per tile, 0-255). Computed monthly by summing agents on each tile, scaled by sampling ratio. Work trips weighted 2x, commerce trips 1x.
- **Congestion feedback**: `TRAFFIC_CAPACITY = 100`. Average congestion (trafficDensity / 100) across road tiles feeds into demand calculation as a penalty.
- **Route staleness**: when a road tile changes, agents whose routes pass through it are marked stale and replanned next monthly tick.

### Gaps and Proposed Improvements

#### 1. Volume-Delay Edge Weights (BPR Function)

Currently all edges have weight 1 — routing ignores congestion entirely. Agents pathfind the geometrically shortest route, then congestion is measured after the fact. This produces unrealistic traffic concentration on shortest paths.

**Proposed**: use BPR-weighted A\* so congestion feeds back into routing:

```
edge_cost(tile) = 1.0 + 0.15 * (trafficDensity[tile] / TRAFFIC_CAPACITY) ^ 4
```

When a tile is uncongested (density 0), cost is 1.0 (current behavior). At capacity (density 100), cost is 1.15. At 2x capacity (density 200), cost is 3.40. Agents will naturally spread across parallel routes.

Implementation: modify `astar()` to accept an optional `Uint8Array` cost layer. The `tentativeG` calculation changes from `g + 1` to `g + edge_cost(neighbor)`. The heuristic remains Manhattan distance (still admissible since edge_cost >= 1.0).

#### 2. Road Hierarchy / Typed Roads

Introduce 2-3 road types with different capacities:

| Road Type | Capacity | Build Cost | Tiles Wide | Speed Factor |
|---|---|---|---|---|
| Local street | 50 | $10 | 1 | 1.0 |
| Avenue/collector | 150 | $40 | 1 | 0.8 (faster) |
| Highway/arterial | 400 | $100 | 2 (visual) | 0.5 (fastest) |

The BPR function naturally handles this: higher-capacity roads stay in free flow longer, attracting more traffic. Speed factor modifies the base edge cost (a highway tile costs 0.5 base units to traverse, so A\* routes prefer it even when slightly longer geometrically).

#### 3. Transit Stops as Teleportation Links

Transit stops could be modeled as additional edges in the road graph that connect non-adjacent tiles:

```
If tile A is a transit stop and tile B is a transit stop on the same line:
  graph.addEdge(A, B, cost = transit_travel_time)
```

Transit travel time could be: `(manhattan_distance(A, B) * 0.3)` — faster than driving but requiring access to a stop. Citizens would choose transit when the combined walk-to-stop + transit + walk-from-stop cost is lower than the congested driving cost.

This requires no new pathfinding algorithm — A\* handles it automatically once the edges exist in the graph.

#### 4. Induced Demand Mechanic

When road capacity increases (new roads built or roads upgraded), increase residential demand temporarily:

```
demand_boost = new_capacity_added / total_existing_capacity * INDUCED_DEMAND_FACTOR
```

Where `INDUCED_DEMAND_FACTOR` is calibrated so that building roads grows the city (which adds traffic), preventing road expansion from permanently solving congestion. This mirrors Duranton-Turner's elasticity of ~1.0.

#### 5. LOS Display Layer

Map the v/c ratio to LOS grades for the traffic overlay:

```typescript
function losGrade(trafficDensity: number, capacity: number): string {
  const vc = trafficDensity / capacity
  if (vc <= 0.35) return 'A'  // green
  if (vc <= 0.54) return 'B'  // light green
  if (vc <= 0.77) return 'C'  // yellow
  if (vc <= 0.93) return 'D'  // orange
  if (vc <= 1.00) return 'E'  // red
  return 'F'                   // dark red / flashing
}
```

This gives the player an intuitive, real-world-grounded understanding of congestion severity.

#### 6. Congestion Pricing Policy Lever

A city policy that applies a toll to tiles within a defined zone:

```
citizen_satisfaction -= toll_cost_factor  (if route passes through priced zone)
trafficDensity *= (1 - pricing_reduction)  (within the zone)
city_revenue += toll_per_trip * trips_through_zone
```

Based on real-world data, a congestion charge reduces traffic 15-30% within the zone. The revenue can offset transit operating costs. But citizens without transit alternatives lose satisfaction.

#### 7. Parking as a Density Modifier

If minimum parking requirements are implemented as a policy:

```
effective_density_cap = base_density_cap * (1 - parking_requirement_factor)
```

With parking mandates at default levels, maximum density is reduced (parking lots consume land). Reducing or eliminating mandates allows higher density but increases local traffic.

#### 8. Frequency-Based Transit Attractiveness

Transit ridership should depend on service frequency, not just existence of stops:

```
transit_utility = -walk_to_stop_time * 1.5
                  - wait_time * 2.5
                  - travel_time * 1.0
                  + comfort_constant

wait_time = headway / 2  (random arrival assumption)
```

Where headway decreases with investment level. At 5-minute headways, transit becomes competitive with driving for most trips. At 30-minute headways, only captive riders use it.

### Formulas Summary

| Mechanic | Formula | Source |
|---|---|---|
| Volume-delay | `t = t_0 * (1 + 0.15 * (v/c)^4)` | BPR, 1964 |
| Edge cost with congestion | `cost = base_speed * (1 + 0.15 * (density/capacity)^4)` | Adapted BPR |
| LOS grade | `vc = density / capacity`, thresholds at 0.35, 0.54, 0.77, 0.93, 1.00 | HCM 7th ed. |
| Induced demand | `new_VMT ~ 1.0 * new_lane_capacity` | Duranton-Turner, 2011 |
| Mode choice (simplified) | `P(transit) = e^(U_t) / (e^(U_car) + e^(U_t))` | Multinomial logit |
| Transit catchment | Ridership decays exponentially beyond 400m (bus) / 800m (rail) | FTA guidelines |
| Congestion pricing effect | 15-30% traffic reduction within zone | London, Stockholm data |

---

## Cross-References

- [Transit-Oriented Development](./transit-oriented-development.md) — Station catchment areas, density clustering around transit, TOD as last-mile solution
- [Urban Density Gradients](./urban-density-gradients.md) — Clark's Law density decay drives commute patterns; VMT inversely correlates with density
- [Environment and Sustainability](./environment-and-sustainability.md) — VMT is the primary driver of transportation emissions; congestion pricing and transit as mitigation

---

## Sources

### Academic Papers and Books

- Greenshields, B.D. (1935). "A study of traffic capacity." *Highway Research Board Proceedings*, Vol. 14, pp. 448-477.
- Bureau of Public Roads (1964). *Traffic Assignment Manual*. US Department of Commerce.
- Braess, D. (1968). "Uber ein Paradoxon aus der Verkehrsplanung." *Unternehmensforschung* 12, pp. 258-268.
- Mogridge, M.J.H. (1990). *Travel in Towns: Jam Yesterday, Jam Today, Jam Tomorrow?* Macmillan.
- Spiess, H. (1990). ["Conical Volume-Delay Functions."](http://www.spiess.ch/emme2/conic/conic.html) *Transportation Science* 24(2), pp. 153-158.
- Shoup, D. (2005, rev. 2011). [*The High Cost of Free Parking.*](https://en.wikipedia.org/wiki/The_High_Cost_of_Free_Parking) Routledge.
- Duranton, G. and Turner, M.A. (2011). ["The Fundamental Law of Road Congestion: Evidence from US Cities."](https://www.aeaweb.org/articles?id=10.1257/aer.101.6.2616) *American Economic Review* 101(6), pp. 2616-2652.
- Walker, J. (2012). [*Human Transit: How Clearer Thinking about Public Transit Can Enrich Our Communities and Our Lives.*](https://humantransit.org/basics/the-transit-ridership-recipe) Island Press.

### Government and Institutional Sources

- Transportation Research Board. *Highway Capacity Manual*, [7th Edition](https://nap.nationalacademies.org/resource/26432/Highway_Capacity_Manual_Edition_7.1_Chapters.pdf) (2022/2025). National Academies.
- FHWA. ["Highway Functional Classification Concepts, Criteria and Procedures."](https://gis.penndot.pa.gov/BPR_pdf_files/Documents/Traffic/Highway_Statistics/2023_FHWA_Functional_Classification_Guidelines.pdf)
- FHWA. ["Simplified Highway Capacity Calculation Method."](https://www.fhwa.dot.gov/policyinformation/pubs/pl18003/hpms_cap.pdf) HPMS.
- Federal Transit Administration. [National Transit Database](https://www.transit.dot.gov/sites/fta.dot.gov/files/2022-11/2021%20National%20Transit%20Summaries%20and%20Trends_1-1.pdf), 2021 National Transit Summaries and Trends.
- Bureau of Transportation Statistics. ["Daily Vehicle Miles-Traveled per Capita by Urbanized Area."](https://www.bts.gov/geography/geospatial-2/daily-vehicle-miles-traveled-capita-urbanized-area-2022)
- ITDP. [*The Online BRT Planning Guide*](https://brtguide.itdp.org/branch/master/guide/why-brt/performance) — capacity and cost data for BRT systems.

### Congestion Pricing Case Studies

- Transport for London. Congestion Charge reports. Via [Gothamist](https://gothamist.com/news/3-global-cities-have-had-congestion-pricing-for-decades-hows-it-going).
- ITF-OECD. ["Long-Term Effects of the Swedish Congestion Charges."](https://www.itf-oecd.org/sites/default/files/docs/swedish-congestion-charges.pdf)
- SFCTA. ["Congestion Pricing Case Studies."](https://www.sfcta.org/sites/default/files/2020-02/Congestion-Pricing-Case-Studies_2020-02-13.pdf) London, Stockholm, Singapore.
- [Policy Alternatives: Mobility pricing in practice — London, Stockholm and Singapore.](https://www.policyalternatives.ca/news-research/mobility-pricing-in-practice-a-look-at-london-stockholm-and-singapore/)

### Additional References

- [Wikipedia: Fundamental diagram of traffic flow](https://en.wikipedia.org/wiki/Fundamental_diagram_of_traffic_flow)
- [Wikipedia: Braess's paradox](https://en.wikipedia.org/wiki/Braess's_paradox)
- [Wikipedia: Downs-Thomson paradox](https://en.wikipedia.org/wiki/Downs%E2%80%93Thomson_paradox)
- [Wikipedia: Level of service (transportation)](https://en.wikipedia.org/wiki/Level_of_service_(transportation))
- [Wikipedia: Passengers per hour per direction](https://en.wikipedia.org/wiki/Passengers_per_hour_per_direction)
- [City Observatory: The Fundamental, Global Law of Road Congestion](https://cityobservatory.org/the-fundamental-global-law-of-road-congestion/)
- [VTPI: Roadway Connectivity](https://www.vtpi.org/tdm/tdm116.htm)
- [Engineering LibreTexts: Traffic Flow](https://eng.libretexts.org/Bookshelves/Civil_Engineering/Fundamentals_of_Transportation/05:_Traffic/5.02:_Traffic_Flow)
