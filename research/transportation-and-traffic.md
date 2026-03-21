# Transportation and Traffic

> How urban transportation networks function, congest, and shape city development — models for traffic simulation.

## Table of Contents

- [Road Network Topology](#road-network-topology)
- [Traffic Flow Theory](#traffic-flow-theory)
- [Level of Service](#level-of-service)
- [Induced Demand](#induced-demand)
- [Congestion Modeling](#congestion-modeling)
- [Road Hierarchy](#road-hierarchy)
- [Road Maintenance Lifecycle](#road-maintenance-lifecycle)
- [Public Transit Modes](#public-transit-modes)
- [Transit Ridership](#transit-ridership)
- [Mode Choice](#mode-choice)
- [Micro-Mobility](#micro-mobility)
- [Last-Mile Problem](#last-mile-problem)
- [Parking Economics](#parking-economics)
- [Dynamic Parking Modeling](#dynamic-parking-modeling)
- [Congestion Pricing](#congestion-pricing)
- [Vehicle-Miles Traveled](#vehicle-miles-traveled)
- [Goods Movement and Freight](#goods-movement-and-freight)
- [Transportation Equity](#transportation-equity)
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

## Road Maintenance Lifecycle

Roads are not permanent infrastructure. Pavement deteriorates through use, weather, and time, following a well-studied nonlinear curve. Managing this deterioration is one of the largest ongoing costs a city faces.

### Pavement Condition Index (PCI)

The Pavement Condition Index, developed by the US Army Corps of Engineers and standardized by ASTM D6433, rates pavement on a 0-100 scale:

| PCI Range | Rating | Condition |
|-----------|--------|-----------|
| 85-100 | Good | New or recently resurfaced. Minor distresses only. |
| 70-84 | Satisfactory | Some visible cracking, minor roughness. Preventive maintenance effective. |
| 55-69 | Fair | Moderate cracking, rutting, patching. Rehabilitation needed. |
| 40-54 | Poor | Significant distress. Major rehabilitation or structural overlay required. |
| 25-39 | Very Poor | Extensive deterioration. Reconstruction likely more cost-effective than repair. |
| 0-24 | Failed | Pavement has failed structurally. Full reconstruction required. |

Other common indices include the International Roughness Index (IRI), measured in inches per mile, and the Present Serviceability Index (PSI), the original AASHO metric from the 1960s road test.

### The Deterioration Curve

Pavement condition follows a characteristic S-shaped deterioration curve. The critical insight: **deterioration accelerates over time**. For the first 75% of a pavement's service life, condition drops by roughly 40%. In the remaining 25% of life, condition drops another 40-60% — falling off a cliff.

More precisely, after approximately 40-50% of a pavement's designed service life, it reaches an inflection point beyond which deterioration rates increase sharply. This nonlinearity is the central fact of pavement management.

### Typical Service Lives and Treatment Costs

| Treatment | Typical Cost (per lane-mile) | PCI Threshold | Life Extension | Notes |
|-----------|------------------------------|---------------|----------------|-------|
| Crack sealing | $350-$1,500 | PCI > 70 | 2-4 years | Cheapest preventive measure |
| Slurry seal / chip seal | $5,000-$15,000 | PCI > 65 | 3-7 years | Surface treatment, delays oxidation |
| Thin overlay (1.5-2") | $40,000-$80,000 | PCI 55-70 | 8-12 years | Restores ride quality |
| Mill and fill | $60,000-$120,000 | PCI 40-60 | 10-15 years | Removes and replaces surface layer |
| Structural overlay (3-4") | $100,000-$190,000 | PCI 30-50 | 12-20 years | Adds structural capacity |
| Full reconstruction | $500,000-$1,500,000 | PCI < 30 | 20-30+ years | Tear out and rebuild from subgrade |

Costs vary significantly by region. New Jersey DOT data puts the average resurfacing cost at $191,175 per lane-mile. FHWA data confirms this is within the typical national range.

### The Cost of Deferred Maintenance

The FHWA and AASHTO have established a critical principle: **every $1 spent on preventive maintenance avoids $4-8 in future rehabilitation and reconstruction costs**. The nonlinear deterioration curve means that delaying treatment by even 2-3 years past the optimal intervention point can increase restoration costs by 4-5x.

This produces a characteristic budgeting trap:
1. Maintenance budgets are cut because roads "look fine" (PCI > 60)
2. Pavement passes the inflection point and deteriorates rapidly
3. Reconstruction becomes the only option, costing 6-10x what preventive treatment would have cost
4. The reconstruction budget displaces preventive maintenance for other roads, propagating the cycle

The American Society of Civil Engineers estimates the US has a $786 billion backlog of road and bridge repair needs. Municipalities that defer maintenance systematically destroy asset value — a form of invisible fiscal decline that does not appear in annual budgets.

### AASHTO Design Standards

AASHTO's pavement design methodology (currently the Mechanistic-Empirical Pavement Design Guide, MEPDG) calculates required pavement thickness based on:

- **Traffic loading**: measured in Equivalent Single Axle Loads (ESALs). A standard 18,000 lb single axle = 1 ESAL. Pavement damage scales with the **fourth power of axle weight** — a truck with twice the axle weight causes 16x the damage.
- **Subgrade strength**: measured by California Bearing Ratio (CBR) or resilient modulus.
- **Climate**: freeze-thaw cycles are the dominant environmental factor. A pavement in Minnesota faces fundamentally different stresses than one in Arizona.
- **Reliability target**: design for 85-95% reliability (probability the pavement lasts the design life).
- **Design life**: typically 20 years for new construction, 8-15 years for overlays.

The fourth-power axle-weight rule has profound implications: a single 80,000 lb truck does as much pavement damage as approximately 9,600 passenger cars. Heavy vehicle traffic dominates pavement lifecycle costs even when trucks are a small percentage of total traffic.

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

## Micro-Mobility

Micro-mobility — shared and personal e-scooters, bike-share systems, and e-bikes — has emerged as a significant urban transportation mode, particularly for short trips that are too long to walk but too short to justify driving or waiting for transit.

### Scale and Growth

Shared micro-mobility has grown rapidly. In 2024, at least 225 million trips were taken on shared micro-mobility in North America — a 31% increase over 2023 and the second consecutive record-setting year (NABSA 2025 State of the Industry Report). Over 415 cities in North America had bike-share or scooter-share services in 2024, up from 224 cities in 2020.

NACTO's 2023 report documented 157 million trips on shared bikes and scooters in the US and Canada, with e-scooter trips at 69 million (up 15% from 2022) and dockless e-bike trips at 6.7 million (up nearly 50%).

### Electrification

The fleet is rapidly electrifying. In 2024, 79% of shared micro-mobility systems included electric devices, and 66% of all shared micro-mobility trips used electric vehicles (e-bikes or e-scooters). E-bike trips reached an all-time high of 64 million, and e-scooter trips reached 85 million.

Private e-bike ownership is growing even faster than shared systems. Personal e-bike sales in the US exceeded 1 million units annually by 2023. E-bikes extend practical cycling range significantly — average e-bike trips are 1.9 miles compared to ~1.4 miles for standard bike-share.

### Trip Characteristics

| Metric | Shared Scooter | Shared Bike | Shared E-Bike |
|--------|---------------|-------------|---------------|
| Average trip distance | 0.8-1.5 miles | 1.0-2.5 miles | 1.5-3.6 miles |
| Average trip duration | 11-12 min | 15-20 min (dockless), 30-35 min (station-based) | 12-18 min |
| Peak usage | Noon-evening, weekends | Commute peaks + midday | Commute peaks + midday |
| Average trip cost (shared) | ~$6.00 | ~$3.00-5.00 | ~$6.00 |

More than half of all car trips in the US are under 3 miles — the distance sweet spot for micro-mobility. An INRIX study found that shared bikes and scooters could replace nearly 50% of downtown vehicle trips based on distance alone.

### Car Trip Replacement

The key policy question is how many micro-mobility trips actually replace car trips versus replacing walking or transit trips. Research findings vary by city and context:

- The median rate at which micro-mobility trips substitute for car trips is **41%** across studies, with a range of 16-71% depending on the city (DOE / NACTO data).
- The US Department of Energy reports that 37% of surveyed shared micro-mobility trips replaced a car trip.
- Roughly 25-35% replace walking trips and 15-25% replace transit trips — meaning micro-mobility both reduces car traffic and competes with other sustainable modes.

In 2024, shared micro-mobility offset approximately 101 million pounds of CO2 emissions by replacing car trips (NABSA).

### Infrastructure Requirements

Micro-mobility usage is highly sensitive to infrastructure quality. Protected bike lanes are the single strongest predictor of cycling and scooter adoption:

- Washington DC's Pennsylvania Avenue protected bike lane saw a **200% increase** in bicycle volumes after installation.
- NYC's Prospect Park West protected bike lane produced a **190% increase** in weekday ridership.
- Boston's Commonwealth Avenue separated lane increased bike-share ridership by **80%**.
- Seville built a citywide network and saw cyclist counts rise from 330/day to 2,000/day, with cycling mode share growing from 5% to nearly 9%.
- From 2009 to 2014, bicycle commuting doubled in both New York City and Washington DC, coinciding with construction of extensive protected lane networks.

The infrastructure effect is not just about individual corridors — it is about **network completeness**. Disconnected bike lanes that end abruptly provide little value. Connected networks that allow safe travel between many origins and destinations produce nonlinear ridership gains.

Key infrastructure elements:
- **Protected bike lanes**: physically separated from traffic (bollards, curbs, planters). Most effective for ridership.
- **Bike parking / corrals**: secure parking at destinations and transit stations. Theft is a major barrier to personal bike ownership.
- **Docking stations**: for station-based systems. Spacing of 300-400m in dense areas provides adequate coverage.
- **Charging infrastructure**: for e-bikes and e-scooters. Battery swapping or overnight collection for shared fleets.
- **Intersection treatments**: bike boxes, protected intersections, leading pedestrian/bike signal intervals. Intersections are where most cycling crashes occur.

### Mode Share Data

Cycling mode share varies enormously across cities, driven primarily by infrastructure quality and cultural factors:

| City | Cycling Mode Share | Notes |
|------|-------------------|-------|
| Copenhagen | ~28% | Mature, fully separated network |
| Amsterdam | ~36% | Ubiquitous infrastructure, cultural norm |
| Portland, OR | ~6-7% | Highest US major city |
| Minneapolis | ~4-5% | Despite harsh winters |
| US national average | ~1% | Low infrastructure investment |

E-bikes are changing the calculus by flattening hills, extending range, and reducing physical effort — making cycling viable for demographics and geographies previously excluded.

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
6. **Micro-mobility integration**: shared scooters and e-bikes placed at transit stations explicitly to bridge the last-mile gap. Average micro-mobility trip distances (1-3 miles) align precisely with the gap between transit catchment and actual origins/destinations.

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

## Dynamic Parking Modeling

Beyond Shoup's structural critique of parking mandates, the real-time dynamics of parking search, occupancy, and pricing have major effects on urban traffic — effects that are usually invisible but empirically substantial.

### Cruising for Parking

Shoup's landmark research compiled studies spanning from 1927 to 2011 across cities including Detroit, London, New York, San Francisco, and Cambridge. The findings: **an average of 34% of cars in congested downtown traffic were cruising for parking** on streets where curb parking was underpriced and overcrowded. Individual studies ranged from 8% to 74%, depending on time of day, location, and pricing.

The mechanism is straightforward. When curb parking is free or underpriced, occupancy reaches 100%. Arriving drivers cannot find a space and circle the block repeatedly. Each cruising vehicle adds to traffic volume, slowing all other vehicles. In a dense grid, even a small number of cruising vehicles creates disproportionate congestion because they occupy road space without making productive trips.

Shoup estimated that in a 15-block area of Westwood Village, Los Angeles, drivers cruising for underpriced curb parking generated an extra 950,000 VMT per year — equivalent to 38 trips around the Earth. This was from a single small commercial district.

### Occupancy Dynamics

Parking behaves like a queuing system with arrival rates, service times, and capacity constraints. The key variable is **occupancy rate** — the percentage of spaces in use at a given time.

| Occupancy | Condition | Effect on Traffic |
|-----------|-----------|-------------------|
| < 60% | Underused | Spaces easy to find. Suggests overbuilt parking or underpriced land. |
| 60-80% | Healthy | Spaces available within 1-2 blocks. Minimal cruising. |
| 80-90% | Optimal target | 1-2 open spaces per block face. Shoup's recommended target: 85%. |
| 90-95% | Tight | Drivers begin circling. Cruising traffic emerges. |
| 95-100% | Saturated | Significant cruising. 10-15+ minutes searching. Spillover to adjacent areas. |
| 100% | Full | All spaces occupied. All arriving drivers must cruise or leave. Double-parking begins. |

The transition from 85% to 100% occupancy is where parking dynamics become pathological. A small increase in demand produces a large increase in cruising traffic — a nonlinear relationship analogous to the traffic flow fundamental diagram.

### Parking Pricing Elasticity

Research on demand-responsive parking pricing, particularly from San Francisco's SFpark program and Seattle's performance pricing, has quantified how price affects parking behavior:

- **Occupancy elasticity**: the price elasticity of parking demand averages **-0.4** (a 10% price increase reduces occupancy by about 4%), though it varies greatly by time of day, location, and availability of alternatives (Shoup / Pierce & Shoup, 2013).
- **Trip elasticity**: the price elasticity of vehicle trips with respect to parking price is **-0.1 to -0.3** (a 10% increase in parking fees reduces vehicle trips by 1-3%).
- **Duration elasticity**: higher prices reduce the average duration of stays, increasing turnover — more distinct users per space per day.

SFpark, San Francisco's demand-responsive pricing pilot (2011-2013), adjusted meter prices every 6-8 weeks based on occupancy data. Results:
- Average parking availability increased from 40% to 60% of blocks having open spaces
- Cruising-related VMT fell
- Meter revenue was roughly neutral (higher prices on busy blocks offset lower prices on underused blocks)
- Average meter rates actually decreased slightly citywide

The counterintuitive result — higher prices on the busiest blocks while cutting prices elsewhere — demonstrates that the goal is not revenue maximization but occupancy management.

### Spillover and Spatial Effects

Parking pricing in one area displaces demand to adjacent areas. Drivers who encounter priced or full parking in a commercial core may:
1. Park in nearby residential neighborhoods (if unrestricted)
2. Park further away and walk
3. Switch modes (transit, bike, walk for the entire trip)
4. Forgo the trip entirely

Residential parking permit programs, time limits, and meter zones in adjacent areas are responses to this spillover. In a simulation, parking dynamics in one tile affect neighboring tiles.

### Double-Parking and Delivery Conflicts

When curb parking reaches 100% occupancy, delivery vehicles have nowhere to stop. They double-park, blocking a travel lane and reducing road capacity — often by 50% on a two-lane road. This is a major source of congestion in dense commercial areas and creates a direct conflict between passenger parking and goods delivery (see [Goods Movement and Freight](#goods-movement-and-freight)).

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

## Goods Movement and Freight

Urban freight — the movement of goods into, out of, and within cities — is a major component of traffic that is often invisible in transportation planning. Most cities lack even basic data on how many trucks and vans operate within their boundaries, where they go, or when they make deliveries.

### Scale of Urban Freight

Commercial vehicles account for approximately 5-10% of urban vehicle traffic by count, but they consume a **disproportionate 20-40% of motorized road space** because of their size, slower acceleration, wider turning radii, and frequent stopping for deliveries (World Bank, Urban Freight Module). In New York City, retail and wholesale trade generate the largest share of truck trips, with key industry sectors accounting for 84% of all freight trips.

On the national highway network, commercial trucks account for about 10% of total vehicle-miles traveled. On interstate highways near major freight corridors, truck percentages commonly exceed 20-30%.

### Last-Mile Delivery Explosion

E-commerce has fundamentally reshaped urban goods movement. The numbers are staggering:

- In 2024, Americans received an average of **66 parcels per person** — approximately **167 packages per household** per year.
- Amazon alone delivered **6.7 billion packages** in 2025, surpassing USPS (6.6 billion) to become the largest carrier in the US.
- Amazon's delivery density has reached **3.5 parcels per week per household** in many areas.
- A typical suburban Amazon delivery driver makes **180 stops and delivers 250-300 packages** in a single route.
- The US domestic parcel market reached **23.9 billion shipments** in 2025, with a projected compound annual growth rate of 3.9%.
- The last-mile delivery market was valued at $184.2 billion in 2025 and is projected to grow to $277.8 billion by 2030 (CAGR 8.6%).

### Traffic and Congestion Effects

The growth of delivery traffic is measurable in congestion data:

- Manhattan saw a **55% rise in delivery stops** and **46% more delivery vehicles** in recent years.
- Dense, rapidly growing cities can expect goods-related vehicle traffic to increase by **up to 30%** in the coming decade (World Economic Forum).
- Last-mile delivery demand is expected to increase by **78% globally by 2030**, with a potential **61% increase in last-mile delivery vehicles**.
- Delivery traffic contributes to an estimated **5 additional minutes** on average urban commutes.

Delivery vehicles create congestion through mechanisms distinct from passenger vehicles:
1. **Frequent stops**: a delivery van making 180 stops per route is effectively stopped or blocking traffic for a significant portion of its operating time.
2. **Double-parking**: when curb space is unavailable, delivery vehicles block travel lanes. This is the single largest freight-related congestion source in dense areas.
3. **Loading/unloading dwell time**: each stop requires 2-10 minutes depending on package size and building access.
4. **Route concentration**: deliveries cluster in commercial and residential areas during daytime hours, coinciding with peak traffic.

### Freight Corridor Planning

Cities that actively manage freight distinguish between:

- **Through freight**: trucks passing through the city on interstate highways. Managed through bypass routes and truck-only lanes.
- **Regional distribution**: trucks moving goods from warehouses/distribution centers to retail locations. Managed through strategic placement of logistics facilities and designated truck routes.
- **Last-mile delivery**: vans and small trucks delivering directly to residences and businesses. Managed through curb management, delivery windows, and consolidation points.

Emerging solutions include:
- **Smart loading zones**: Pittsburgh's smart loading zone pilot increased turnover by 40%, reduced average stay times by 23%, and cut CO2 emissions from circling and idling by 12 metric tonnes per year.
- **Off-peak delivery programs**: New York's Off-Hour Delivery program shifted 10% of deliveries to nighttime hours, reducing daytime truck traffic.
- **Cargo bikes**: increasingly used for last-mile delivery in dense urban cores. A cargo bike can replace a delivery van for packages under 100 lbs within a 3-5 mile radius.
- **Micro-consolidation centers**: small warehouses in urban areas where large trucks deliver in bulk and cargo bikes/small EVs handle the final delivery.
- **Delivery lockers and pickup points**: aggregating deliveries to reduce the number of individual stops.

### Pavement Damage from Freight

Heavy vehicles cause dramatically more pavement damage than passenger cars due to the fourth-power axle-weight rule (see [Road Maintenance Lifecycle](#road-maintenance-lifecycle)). A city with heavy freight corridors will face accelerated pavement deterioration on those routes, creating a direct link between freight planning and infrastructure maintenance budgets. Restricting truck traffic to designated routes concentrates damage where it can be managed with appropriately designed pavement.

---

## Transportation Equity

Transportation systems are not neutral — they distribute access, cost, and harm unevenly across income levels, races, and geographies. Transportation equity concerns who benefits from infrastructure investments, who bears the costs of auto-oriented design, and who is excluded when systems fail.

### Car Ownership and Income

Vehicle access in the United States is strongly stratified by income and race:

- Nationally, approximately **9% of urban households** and **6% of rural households** lack access to a car (BTS).
- Among households below 200% of the federal poverty level, **19%** lack car access, compared to just **5%** of those above that threshold.
- Across 100 metropolitan areas, **59.8% of zero-vehicle households** have incomes below 80% of their metro area's median income (Brookings).
- Car access is also racialized: barely more than **two-thirds of Black households** own vehicles, compared to 82% of all households and 86% of white households (National Equity Atlas).
- Only **20% of adults living in poverty** reported no vehicle access in 2016, down from 22% in 2006 — but this means most poor households own cars they can barely afford rather than having viable alternatives.

The decline in carlessness among low-income households does not indicate improved wellbeing — it reflects the lack of alternatives. In most American metro areas, not having a car means not having access to jobs, healthcare, groceries, and social networks. Car ownership becomes a survival necessity, not a choice.

### Transportation Cost Burden

Transportation is the second-largest household expense in the US after housing, and the burden falls heaviest on those least able to afford it:

- Households in the **lowest income group** spent **32% of their before-tax income** on transportation in 2023, compared to 9.6% for the highest income group (BTS).
- Households earning less than $25,000 that **owned at least one vehicle** spent **38% of their after-tax income** on transportation.
- The **working poor** (annual personal income under $8,000) spent nearly **10% of their income** on commuting alone — more than twice the 4% figure for the general population. Those who drove spent **21% of income** on commuting; transit users spent **13%** (BTS).
- In counties where low-income commuters use public transit frequently, transportation costs as a share of income are measurably lower — transit access directly reduces cost burden.

The combined housing + transportation cost burden is the more accurate measure of affordability. Cheap housing in distant suburbs often produces higher total costs than expensive housing near transit, because transportation costs consume the savings.

### Transit Dependency

Transit-dependent populations — those who rely on public transit because they cannot drive or cannot afford a car — are distinct from choice riders who use transit when it is convenient:

- Transit carried **nearly 30%** of workers in zero-vehicle households to their jobs. Another 26% of zero-vehicle household workers drove alone (mostly in employer-supplied vehicles), and 9.5% carpooled (Census / Brookings).
- Dependence on public transit constitutes an **accessibility disadvantage** in most American cities, where transit networks provide slow, infrequent service compared to driving.
- The **double burden**: living where transit service is poor while also lacking car access. Areas with high shares of carless households and low transit access are primarily in **suburbs and exurbs** — places built for cars where transit was never designed to serve.
- Rural carless households earn **64% less** than rural households with full car access. Rural carless residents are **2x more likely to forgo trips** entirely due to lack of transportation options (Smart Growth America).

### Job Access

Access to employment is the most consequential equity dimension of transportation. The spatial mismatch hypothesis (Kain, 1968) argues that low-income and minority workers are concentrated in locations poorly connected to job centers:

- In most US metros, only **25-30%** of jobs are reachable within 90 minutes by transit, compared to 60-80% by car.
- The modal access gap disproportionately affects **socially vulnerable populations**, including the elderly, people with disabilities, low-income households, Hispanics, and African Americans. Low-income households face measurable modal access inequity in at least **17 metropolitan areas** (Maharjan et al., 2024).
- Job access via transit is worst for **suburban poor** populations, who live in areas designed around car access but cannot afford reliable vehicles.

### Environmental Justice

The harms of transportation infrastructure — air pollution, noise, crash risk, neighborhood severance — concentrate in low-income communities and communities of color:

- Highway construction in the 1950s-1970s systematically demolished Black neighborhoods in nearly every major American city (documented extensively in the FHWA's "Highways and the Environment" reports).
- Proximity to major roads and freight corridors produces elevated rates of asthma, cardiovascular disease, and premature death. These corridors disproportionately run through low-income areas.
- Traffic crash fatality rates are higher in low-income neighborhoods, where streets are wider, speeds are higher, and pedestrian infrastructure is minimal.

### Fare Policy and Equity

Transit fare structures interact with equity in complex ways:

- **Flat fares** are regressive relative to trip length (short-trip riders pay the same as long-trip riders) but simple and predictable.
- **Distance-based fares** are more economically efficient but penalize low-income riders who often commute long distances from affordable housing in the periphery to jobs in the core.
- **Fare-free transit** eliminates cost barriers entirely and has been adopted by dozens of smaller US cities. Kansas City became the largest US city to go fare-free (2020). Evidence shows fare-free policies increase ridership 20-40% but require replacement funding.
- **Reduced fare programs** (income-based, student, elderly) target subsidies but create administrative complexity and stigma.

### Equity Metrics for Planning

Modern transportation equity analysis uses several quantitative measures:

- **Accessibility isochrones**: how many jobs, hospitals, grocery stores are reachable within X minutes by mode Y? Comparing isochrones across income groups and neighborhoods reveals disparities.
- **Transportation cost burden**: % of income spent on transportation by income quintile.
- **Level of traffic stress (LTS)**: measures how comfortable a street is for cycling. Low-income areas often have high-stress streets with no cycling infrastructure.
- **Transit frequency by neighborhood income**: maps of service frequency overlaid with income data reveal whether investment follows need or follows wealth.

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

#### 9. Dynamic Parking Occupancy

Model parking as a scarce, tile-level resource rather than a static density modifier:

```
parking_supply[tile] = base_spaces * zoning_factor
parking_demand[tile] = sum(agents whose destination is this tile or adjacent tiles)
parking_occupancy[tile] = parking_demand[tile] / parking_supply[tile]
```

When occupancy exceeds 85%, agents arriving at that tile incur a **cruising penalty** — additional time (and traffic contribution) spent circling for a space:

```
cruising_time(tile) = 0                                  if occupancy < 0.85
                    = base_cruising * ((occ - 0.85) / 0.15) ^ 2   if 0.85 <= occ < 1.0
                    = base_cruising * 3.0                if occupancy >= 1.0
```

This creates a feedback loop: full parking generates cruising traffic, which worsens congestion, which makes the area less attractive. Shoup's data suggests `base_cruising` equivalent to 5-8 minutes of additional driving.

The player can intervene with:
- **Priced parking**: reduces occupancy toward 85% target, generates revenue
- **Parking structures**: increases supply (expensive capital cost, but concentrated)
- **Parking mandate reform**: less supply built per development, increasing density but reducing parking availability
- **Loading zones**: reserved curb spaces for deliveries, reducing double-parking congestion

#### 10. Micro-Mobility Network

Model bike/scooter infrastructure as an overlay on the road network:

```
If tile has bike lane:
  bike_edge_cost(tile) = 0.7  // faster than walking, competitive with driving for short trips
  bike_capacity(tile) = 30    // lower capacity than roads but independent

If tile has no bike lane:
  bike_edge_cost(tile) = 1.2  // slower and dangerous, agents avoid
```

Micro-mobility trips replace car trips for distances under ~3 miles (15-20 tiles in the game grid). Each replaced car trip removes one agent from the road traffic layer. At the observed 37-41% car-trip replacement rate, a well-built bike network in a dense area could reduce road traffic by 5-10%.

The investment cost is low (bike lanes cost ~1/10th of road capacity expansion) but requires network completeness to be effective — isolated lanes produce minimal mode shift.

#### 11. Freight and Delivery Traffic

Model commercial deliveries as a background traffic component that scales with commercial zone density:

```
freight_traffic[tile] = commercial_density_nearby * FREIGHT_FACTOR * (1 + ecommerce_growth_rate * years)
trafficDensity[tile] += freight_traffic[tile]
```

Freight traffic has outsized road impact because commercial vehicles are larger:

```
effective_traffic_units = passenger_vehicles * 1.0 + freight_vehicles * 2.5
```

The 2.5x factor reflects that a delivery van consumes roughly 2.5x the road space of a passenger car in stop-and-go urban conditions (frequent stops, double-parking, wider turning).

Player interventions:
- **Designated truck routes**: concentrate freight on high-capacity roads (preserves local streets)
- **Off-peak delivery incentives**: shift freight traffic to nighttime (reduces peak congestion but increases noise complaints)
- **Loading zones**: dedicated curb spaces reduce double-parking blockages
- **Cargo bike subsidies**: replace van deliveries in dense cores

#### 12. Road Maintenance Budget

Model pavement deterioration as a function of traffic volume and time:

```
pci[tile] -= (base_deterioration + traffic_damage_factor * trafficDensity[tile] + freight_damage_factor * freight_traffic[tile]) per year
```

Freight damage factor should be ~4x the passenger traffic factor (reflecting the fourth-power axle-weight rule). When PCI drops below thresholds:

| PCI | Effect | Required Treatment |
|-----|--------|-------------------|
| > 70 | No effect | Preventive maintenance ($) |
| 55-70 | Speed penalty: +10% edge cost | Resurfacing ($$) |
| 40-55 | Speed penalty: +30% edge cost, citizen satisfaction hit | Major rehabilitation ($$$) |
| < 40 | Speed penalty: +60% edge cost, vehicle damage complaints | Reconstruction ($$$$) |

The cost multiplier for deferred maintenance creates a meaningful budget management game: spend small amounts regularly on preventive maintenance, or face ballooning reconstruction costs later. This mirrors the real 4-8x cost escalation documented by FHWA.

#### 13. Transportation Equity Metrics

Track and display equity indicators to give the player feedback on distributional outcomes:

```
// For each income tier (low, medium, high):
avg_commute_time[tier] = mean(commute_time for agents in tier)
avg_transport_cost_burden[tier] = mean(transport_cost / income for agents in tier)
job_accessibility[tier] = mean(jobs_reachable_in_30min for agents in tier)
transit_dependency_rate[tier] = count(agents without car in tier) / count(agents in tier)
```

Display as a dashboard or overlay. If low-income commute times exceed high-income commute times by more than 2x, or if transport cost burden exceeds 30% for the lowest tier, flag an equity warning.

Policy levers that affect equity:
- **Fare-free transit**: increases ridership 20-40%, reduces cost burden for transit-dependent residents, requires tax revenue replacement
- **Transit frequency in low-income areas**: directly improves job access for carless households
- **Parking pricing revenue recycling**: Shoup's third reform — return meter revenue to the neighborhood — can fund sidewalks, bus shelters, and bike lanes in underserved areas
- **Road investment equity**: spending on highways primarily benefits car owners (higher income); spending on transit and pedestrian infrastructure primarily benefits lower-income residents

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
| Cruising for parking | Emerges when occupancy > 85%; up to 34% of downtown traffic | Shoup, 2006 |
| Parking pricing elasticity | -0.4 occupancy elasticity; -0.1 to -0.3 trip elasticity | Pierce & Shoup, 2013; VTPI |
| Pavement deterioration | PCI drops 40% in first 75% of life, then accelerates | FHWA LTPP |
| Deferred maintenance cost | 4-8x multiplier for delayed treatment | FHWA / AASHTO |
| Axle-weight damage | Damage proportional to (axle weight)^4 | AASHO road test, 1962 |
| Micro-mobility car replacement | 37-41% of trips replace car trips | DOE / NACTO |
| Freight road space factor | 1 delivery van ~ 2.5 passenger car equivalents (urban) | FHWA PCE tables |
| Transport cost burden | 32% of income for lowest quintile vs 9.6% for highest | BTS, 2023 |
| E-commerce delivery growth | ~167 packages/household/year, CAGR 3.9% | NABSA / ShipMatrix, 2025 |

---

## Cross-References

- [Transit-Oriented Development](./transit-oriented-development.md) — Station catchment areas, density clustering around transit, TOD as last-mile solution
- [Urban Density Gradients](./urban-density-gradients.md) — Clark's Law density decay drives commute patterns; VMT inversely correlates with density
- [Environment and Sustainability](./environment-and-sustainability.md) — VMT is the primary driver of transportation emissions; congestion pricing and transit as mitigation
- [Urban Design and Walkability](./urban-design-and-walkability.md) — block size and permeability, street design typology, cycling infrastructure, mode choice at the street level

---

## Sources

### Academic Papers and Books

- Greenshields, B.D. (1935). "A study of traffic capacity." *Highway Research Board Proceedings*, Vol. 14, pp. 448-477.
- Bureau of Public Roads (1964). *Traffic Assignment Manual*. US Department of Commerce.
- Braess, D. (1968). "Uber ein Paradoxon aus der Verkehrsplanung." *Unternehmensforschung* 12, pp. 258-268.
- Kain, J.F. (1968). "Housing Segregation, Negro Employment, and Metropolitan Decentralization." *Quarterly Journal of Economics* 82(2), pp. 175-197.
- Mogridge, M.J.H. (1990). *Travel in Towns: Jam Yesterday, Jam Today, Jam Tomorrow?* Macmillan.
- Spiess, H. (1990). ["Conical Volume-Delay Functions."](http://www.spiess.ch/emme2/conic/conic.html) *Transportation Science* 24(2), pp. 153-158.
- Shoup, D. (2005, rev. 2011). [*The High Cost of Free Parking.*](https://en.wikipedia.org/wiki/The_High_Cost_of_Free_Parking) Routledge.
- Shoup, D. (2006). ["Cruising for Parking."](http://shoup.bol.ucla.edu/CruisingForParkingAccess.pdf) *Transport Policy* 13(6), pp. 479-486.
- Duranton, G. and Turner, M.A. (2011). ["The Fundamental Law of Road Congestion: Evidence from US Cities."](https://www.aeaweb.org/articles?id=10.1257/aer.101.6.2616) *American Economic Review* 101(6), pp. 2616-2652.
- Walker, J. (2012). [*Human Transit: How Clearer Thinking about Public Transit Can Enrich Our Communities and Our Lives.*](https://humantransit.org/basics/the-transit-ridership-recipe) Island Press.
- Pierce, G. and Shoup, D. (2013). ["Getting the Prices Right."](https://www.tandfonline.com/doi/full/10.1080/01944363.2013.787307) *Journal of the American Planning Association* 79(1), pp. 67-81.
- Maharjan, S., Janatabadi, F., and Ermagun, A. (2024). ["Spatial Inequity of Transit and Automobile Access Gap across America for Underserved Population."](https://journals.sagepub.com/doi/10.1177/03611981231171914) *Transportation Research Record*.

### Government and Institutional Sources

- AASHO (1962). *The AASHO Road Test*. Highway Research Board Special Reports 61A-61G. National Academy of Sciences.
- Transportation Research Board. *Highway Capacity Manual*, [7th Edition](https://nap.nationalacademies.org/resource/26432/Highway_Capacity_Manual_Edition_7.1_Chapters.pdf) (2022/2025). National Academies.
- FHWA. ["Highway Functional Classification Concepts, Criteria and Procedures."](https://gis.penndot.pa.gov/BPR_pdf_files/Documents/Traffic/Highway_Statistics/2023_FHWA_Functional_Classification_Guidelines.pdf)
- FHWA. ["Simplified Highway Capacity Calculation Method."](https://www.fhwa.dot.gov/policyinformation/pubs/pl18003/hpms_cap.pdf) HPMS.
- FHWA. ["Pavement Performance Measures and Forecasting and The Effects of Maintenance and Rehabilitation Strategy on Treatment Effectiveness."](https://www.fhwa.dot.gov/publications/research/infrastructure/pavements/ltpp/17095/004.cfm) FHWA-HRT-17-095, 2017.
- FHWA. ["Reformulated Pavement Remaining Service Life Framework."](https://www.fhwa.dot.gov/publications/research/infrastructure/pavements/13038/13038.pdf) FHWA-HRT-13-038, 2013.
- FHWA. ["Pavement Preservation Definitions."](https://www.fhwa.dot.gov/pavement/preservation/091205.cfm)
- Federal Transit Administration. [National Transit Database](https://www.transit.dot.gov/sites/fta.dot.gov/files/2022-11/2021%20National%20Transit%20Summaries%20and%20Trends_1-1.pdf), 2021 National Transit Summaries and Trends.
- Federal Transit Administration. ["Evaluating Transportation Equity."](https://www.transit.dot.gov/sites/fta.dot.gov/files/FTA_Report_No._0066.pdf) FTA Report No. 0066.
- Bureau of Transportation Statistics. ["Daily Vehicle Miles-Traveled per Capita by Urbanized Area."](https://www.bts.gov/geography/geospatial-2/daily-vehicle-miles-traveled-capita-urbanized-area-2022)
- Bureau of Transportation Statistics. ["The Household Cost of Transportation: Is it Affordable?"](https://www.bts.gov/data-spotlight/household-cost-transportation-it-affordable)
- Bureau of Transportation Statistics. ["Long-Term Trends in Zero-Vehicle Households 1970-2023."](https://www.bts.gov/browse-statistical-products-and-data/info-gallery/long-term-trends-zero-vehicle-households-1970)
- Bureau of Transportation Statistics. ["Commuting Expenses: Disparity for the Working Poor."](https://www.bts.gov/archive/publications/special_reports_and_issue_briefs/issue_briefs/number_01/entire)
- US DOT. ["Key Performance Indicators (KPIs) for Equity."](https://www.transportation.gov/sites/dot.gov/files/2023-11/Cost%20Burden%20KPI%20Public%20Summary%20Review%2011.28.2023.pdf) 2023.
- ITDP. [*The Online BRT Planning Guide*](https://brtguide.itdp.org/branch/master/guide/why-brt/performance) — capacity and cost data for BRT systems.
- ITDP. ["The High Cost of Transportation in the United States."](https://itdp.org/2024/01/24/high-cost-transportation-united-states/) 2024.

### Micro-Mobility and Active Transportation

- NACTO. ["A Micromobility Record: 157 Million Trips on Bike Share and Scooter Share in 2023."](https://nacto.org/latest/a-micromobility-record-157-million-trips-on-bike-and-scooter-share-in-2023/)
- NACTO. [*Shared Micromobility Report: 2023.*](https://nacto.org/publication/shared-micromobility-report-2023/)
- NACTO. ["High-Quality Bike Facilities Increase Ridership and Make Biking Safer."](https://nacto.org/latest/high-quality-bike-facilities-increase-ridership-make-biking-safer/)
- NABSA. ["2024 Shared Micromobility State of the Industry Report."](https://nabsa.net/2025/08/07/2024industryreport/) 2025.
- NABSA. ["About the Shared Micromobility Industry."](https://nabsa.net/about/industry/)
- PeopleForBikes. ["Protected Bike Lanes Statistics."](https://www.peopleforbikes.org/statistics/economic-benefits)
- INRIX. ["Shared Bikes and Scooters Could Replace Nearly 50 Percent of Downtown Vehicle Trips."](https://inrix.com/press-releases/micromobility-study-us-2019/) 2019.
- Argonne National Laboratory. ["Shared and Ownership Mobility Technologies in the US."](https://publications.anl.gov/anlpubs/2025/01/193683.pdf) ANL/25-4, 2025.
- Urban Institute. ["Why US Cities Are Investing in Safer, More-Connected Cycling Infrastructure."](https://www.urban.org/urban-wire/why-us-cities-are-investing-safer-more-connected-cycling-infrastructure)

### Parking Research

- Shoup, D. ["Cruising for Parking."](http://shoup.bol.ucla.edu/CruisingForParkingAccess.pdf) UCLA.
- Hampshire, R. and Shoup, D. ["How Much Traffic is Cruising for Parking?"](https://transfersmagazine.org/wp-content/uploads/sites/13/2019/11/Nov2019_Transfers_Hampshire-Shoup.pdf) *Transfers Magazine*, November 2019.
- Millard-Ball, A., Weinberger, R., and Hampshire, R. (2021). ["Pricing curb parking."](https://www.sciencedirect.com/science/article/pii/S0965856421001105) *Transportation Research Part A*.
- Pierce, G. and Shoup, D. ["Price Elasticity of On-Street Parking Demand."](https://onlinepubs.trb.org/onlinepubs/conferences/2012/4thITM/Papers-A/0117-000111.pdf) TRB 4th International Conference, Seattle.
- VTPI. ["Parking Pricing Implementation Guidelines."](https://www.vtpi.org/parkpricing.pdf)

### Freight and Goods Movement

- World Economic Forum. ["Sustainable Deliveries: How Cities and Companies Can Lead on Logistics."](https://www.weforum.org/stories/2024/10/sustainable-deliveries-cities-companies-logistics/) 2024.
- World Bank. ["Urban Freight."](https://thedocs.worldbank.org/en/doc/5a6deb91f1140264f8f3e2b3ee4117e8-0090062024/original/C5-M3-Urban-Freight-100924-DR.pdf) Beyond Public Transport module.
- Urban Freight Lab. ["Last-Mile Delivery Research."](https://urbanfreightlab.com/research_keywords/last-mile-delivery/)
- FHWA. ["Share of Highway Vehicle Miles Traveled by Vehicle Type."](https://ops.fhwa.dot.gov/freight/freight_analysis/nat_freight_stats/docs/11factsfigures/figure3_6.htm) Freight Facts and Figures.
- FHWA. ["Primer for Improved Urban Freight Mobility and Delivery."](https://ops.fhwa.dot.gov/publications/fhwahop18020/benefits.htm)
- NYC DOT. ["Improving the Efficiency of Truck Deliveries in NYC."](https://www.nyc.gov/html/dot/downloads/pdf/truck-deliveries-ll189.pdf) 2019.
- APA. ["Last-Mile Impacts on Deliveries."](https://www.planning.org/blog/9304921/last-mile-impacts-on-deliveries/)
- NAIOP. ["How E-Commerce Affects Urban Industrial Lands and Transportation Systems."](https://www.naiop.org/research-and-publications/magazine/2022/winter-2022/business-trends/how-e-commerce-affects-urban-industrial-lands-and-transportation-systems/) 2022.

### Transportation Equity

- Brookings Institution. ["Transit Access and Zero-Vehicle Households."](https://www.brookings.edu/wp-content/uploads/2016/06/0818_transportation_tomer.pdf) Tomer, A. et al., 2011.
- National Equity Atlas. ["Car Access."](https://www.nationalequityatlas.org/indicators/car-access)
- Urban Institute. ["How Commuters with Low Incomes Use Public Transit."](https://www.urban.org/urban-wire/how-commuters-low-incomes-use-public-transit-and-how-one-city-expanded-ridership)
- Smart Growth America. ["More Than One Million Households Without a Car in Rural America Need Better Transit."](https://smartgrowthamerica.org/more-than-one-million-households-without-a-car-in-rural-america-need-better-transit/)
- Stanford Center on Poverty and Inequality. ["The Working Poor and Commuting in the United States."](https://inequality.stanford.edu/sites/default/files/media/_media/pdf/key_issues/transportation_policy.pdf)
- Inequality.org. ["How the U.S. Transportation System Fuels Inequality."](https://inequality.org/article/public-transit-inequality/)

### Congestion Pricing Case Studies

- Transport for London. Congestion Charge reports. Via [Gothamist](https://gothamist.com/news/3-global-cities-have-had-congestion-pricing-for-decades-hows-it-going).
- ITF-OECD. ["Long-Term Effects of the Swedish Congestion Charges."](https://www.itf-oecd.org/sites/default/files/docs/swedish-congestion-charges.pdf)
- SFCTA. ["Congestion Pricing Case Studies."](https://www.sfcta.org/sites/default/files/2020-02/Congestion-Pricing-Case-Studies_2020-02-13.pdf) London, Stockholm, Singapore.
- [Policy Alternatives: Mobility pricing in practice — London, Stockholm and Singapore.](https://www.policyalternatives.ca/news-research/mobility-pricing-in-practice-a-look-at-london-stockholm-and-singapore/)

### Pavement and Road Maintenance

- [Pavement Interactive: Pavement Life-Cycle.](https://pavementinteractive.org/reference-desk/pavement-management/analysis/pavement-life-cycle/)
- [Wikipedia: Pavement Performance Modeling.](https://en.wikipedia.org/wiki/Pavement_performance_modeling)
- [Wikipedia: Pavement Condition Index.](https://en.wikipedia.org/wiki/Pavement_condition_index)
- [National Transportation Library: Life Cycle of Pavement.](https://transportation.libguides.com/PavementLife)
- FHWA. ["Estimating Cost per Lane Mile for Routine Highway Operations and Maintenance."](https://highways.dot.gov/safety/data-analysis-tools/rsdp/rsdp-tools/estimating-cost-lane-mile-routine-highway-operations-and)
- Strong Towns. ["How Much Does a Mile of Road Actually Cost?"](https://www.strongtowns.org/journal/2020-1-27-how-much-does-a-mile-of-road-actually-cost) 2020.

### Additional References

- [Wikipedia: Fundamental diagram of traffic flow](https://en.wikipedia.org/wiki/Fundamental_diagram_of_traffic_flow)
- [Wikipedia: Braess's paradox](https://en.wikipedia.org/wiki/Braess's_paradox)
- [Wikipedia: Downs-Thomson paradox](https://en.wikipedia.org/wiki/Downs%E2%80%93Thomson_paradox)
- [Wikipedia: Level of service (transportation)](https://en.wikipedia.org/wiki/Level_of_service_(transportation))
- [Wikipedia: Passengers per hour per direction](https://en.wikipedia.org/wiki/Passengers_per_hour_per_direction)
- [City Observatory: The Fundamental, Global Law of Road Congestion](https://cityobservatory.org/the-fundamental-global-law-of-road-congestion/)
- [VTPI: Roadway Connectivity](https://www.vtpi.org/tdm/tdm116.htm)
- [Engineering LibreTexts: Traffic Flow](https://eng.libretexts.org/Bookshelves/Civil_Engineering/Fundamentals_of_Transportation/05:_Traffic/5.02:_Traffic_Flow)
