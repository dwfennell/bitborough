# Mechanics Comparison Across City Builders

> How SimCity, Cities: Skylines, Tropico, Anno, Banished, and others implement core city-building mechanics --- a systematic comparison.

This document compares design decisions across major city-builder titles to inform Bitborough's own mechanic design. Each section presents a comparison table followed by analysis of tradeoffs. The focus is on *how* each game models a system and *why* those choices produce different gameplay outcomes.

## Table of Contents

1. [Zoning Systems](#1-zoning-systems)
2. [Economic Simulation](#2-economic-simulation)
3. [Traffic and Transportation](#3-traffic-and-transportation)
4. [Citizen Simulation](#4-citizen-simulation)
5. [Services and Coverage](#5-services-and-coverage)
6. [Utilities](#6-utilities)
7. [Terrain and Environment](#7-terrain-and-environment)
8. [Progression and Pacing](#8-progression-and-pacing)
9. [Failure States](#9-failure-states)
10. [Modding and Extensibility](#10-modding-and-extensibility)
11. [UI and Information Design](#11-ui-and-information-design)
12. [Summary Matrix](#12-summary-matrix)

---

## 1. Zoning Systems

The fundamental question: how does a player express *where things should go*?

| Game | Zoning Model | Zone Types | Density Control | Mixed Use | Grid Requirement |
|------|-------------|------------|-----------------|-----------|-----------------|
| **SimCity 4** | Paint R/C/I zones on grid | Residential, Commercial, Industrial (each with Low/Med/High density) | Player selects density tier directly | None --- zones are single-use | Strict grid aligned to roads |
| **SimCity (2013)** | Paint zones along road frontage | R/C/I | Road type determines max density (avenue = high density, street = low) | None | Grid, road-adjacent only |
| **Cities: Skylines** | Paint zones along roads + district specialization | R/C/I/Office + specialized industry (forestry, farming, ore, oil) | Low/High toggle; buildings level up organically | None natively; district policies approximate it | Grid, road-adjacent |
| **Cities: Skylines II** | Paint zones + signature buildings | R/Low/Med/High, C/Low/High, I/Industrial/Office, mixed-use row housing | Zone type sets density; buildings upgrade within tier | Limited: row-housing zones mix ground-floor commercial with residential | Grid, road-adjacent |
| **Foundation** | Freeform painted areas | Residential, farming, extraction, monument zones | Emergent --- villagers decide building placement and density within painted area | Not applicable (medieval context) | **Gridless** --- roads emerge from foot traffic |
| **Anno 1800** | Manual building placement | No abstract zones; every building placed individually | Fixed per building type | Production buildings and residences are separate; adjacency bonuses encourage clustering | No grid; free placement with footprint collision |
| **Banished** | Manual building placement | No zones; each structure placed by player | N/A --- each building is a single unit | N/A | Free placement, road-connected |
| **Tropico 6** | Manual building placement | No zones; buildings categorized by function (housing, industry, entertainment, government) | Fixed per building type; upgrade tiers available | N/A | Free placement on terrain |

### Analysis

**RCI zoning** (SimCity family, Skylines) gives the player indirect control --- you designate *intent* and the simulation fills in details. This creates emergence: watching a zone develop from empty lots to skyscrapers is a core SimCity satisfaction loop. The tradeoff is abstraction; the player cannot control individual buildings.

SimCity (2013) introduced an important refinement: **road type as density gate**. Instead of choosing zone density directly, the road infrastructure determines what can grow there. This reduces UI complexity and creates a natural upgrade path --- widen roads to enable density. Cities: Skylines II partially adopted this by tying density to zone type rather than pure road width.

**Manual placement** (Anno, Banished, Tropico) gives the player total control at the cost of more micro. Anno compensates by making placement deeply strategic --- production chain adjacency and workforce radius create emergent puzzle-like optimization. Banished keeps it simple: buildings serve single functions and placement is primarily about walkability and resource proximity.

**Foundation's gridless approach** is the most radical departure. Painting a residential zone and watching villagers organically fill it with houses, creating natural-looking medieval streets from their foot traffic, produces settlements that look nothing like grid-based games. The downside is reduced precision --- you cannot control exactly what gets built where.

**Key design question for Bitborough:** RCI zoning creates satisfying passive growth but requires a robust demand model. Manual placement gives precision but increases cognitive load. A hybrid --- zone-based residential with manually-placed civic/industrial buildings --- may capture benefits of both.

---

## 2. Economic Simulation

| Game | Revenue Model | Budget Granularity | Trade System | Production Depth | Currency |
|------|--------------|-------------------|-------------|-----------------|----------|
| **SimCity 4** | Property tax (R/C/I sliders), ordinance income/costs, neighbor deals | Per-service budget sliders (police, fire, education, transit) | Neighbor city deals (sell/buy water, power, garbage) | None --- demand is abstract | Simoleons |
| **SimCity (2013)** | Hourly tax income from zones, service costs | Global budget with per-building toggle | Regional trade with neighbor cities; commodity selling (oil, ore, alloy) | Light: extract raw resource, refine, sell on global market | Simoleons |
| **Cities: Skylines** | Tax per zone type, service budgets, toll roads, public transit fares | Per-service budget slider (affects quality + range) | Import/export abstracted via cargo terminals and outside connections | None --- goods appear when industrial zones exist | Money (unnamed) |
| **Anno 1800** | Per-capita income from population tiers, building maintenance costs | Per-building maintenance; no global tax slider | Multi-island trade routes with explicit ship logistics; diplomacy-based NPC trade | **Deep:** multi-tier chains (e.g., hops + wheat -> beer; iron ore + coal -> steel -> weapons) | Credits + Influence |
| **Banished** | No currency | No monetary budget | Barter with visiting merchants (trade surplus goods for seeds, livestock, supplies) | Light: gather raw materials, process into finished goods (logs -> firewood, wheat -> flour -> bread) | None --- pure resource economy |
| **Tropico 6** | Export revenue, tourism, foreign aid, rent, attraction fees | Budget not directly controlled; profit = revenue minus building upkeep | Export goods via docks; trade routes with specific nations; import raw materials | Moderate: raw extraction -> factory processing -> export (sugar -> rum, logs -> planks -> furniture) | Treasury ($) |
| **Frostpunk** | No currency | No budget | No external trade | Light: gather coal/wood/steel/food; process into meals, steam cores | None --- survival resources only |

### Analysis

City-builder economies range from **abstracted tax models** to **fully physical resource flows**. SimCity treats the economy as a feedback loop: zones generate tax revenue, which funds services, which increase land value, which increases tax revenue. The player's lever is the tax rate slider and budget allocation. This is elegant but opaque --- it is hard to trace *why* income changed.

Anno 1800 sits at the opposite extreme. Every good is physically produced, transported by cart, stored in a warehouse, loaded onto a ship, and delivered. The player sees the entire supply chain. This creates rich optimization gameplay but demands significant attention. Anno compensates with calculators and production ratio displays.

Tropico's **export economy** is distinctive: your island does not have internal consumer markets in the traditional sense. Revenue comes from selling goods to foreign powers. This creates interesting political gameplay --- which nations you trade with has diplomatic consequences.

Banished's **currencyless economy** is the purest resource simulation. There is no money, only goods. A citizen needs food, firewood, clothing, tools, and herbs. The entire economy is about *producing and distributing these physical goods*. This makes shortages viscerally legible --- you can see the empty storage barn.

**Design implication:** The level of economic abstraction directly determines what the player *thinks about*. Tax sliders produce macro-level strategic thinking. Production chains produce logistics puzzles. Currency-free systems focus attention on physical flows.

---

## 3. Traffic and Transportation

| Game | Traffic Model | Pathfinding | Road Types | Public Transit | Congestion Effects |
|------|-------------|------------|------------|---------------|-------------------|
| **SimCity 4** | Statistical trip generation; aggregated volumes per road segment | Shortest-path with commute-time budget; NAM mod improved to near-perfect pathfinding | Street, road, avenue, highway, one-way, rail, monorail | Bus, subway, rail, ferry, monorail | High traffic lowers desirability; road degradation over time |
| **SimCity (2013)** | Agent-based (GlassBox); every vehicle is a simulated agent | Agents choose routes dynamically; shortest-distance bias caused pathological U-turn behavior | Street, avenue, boulevard, highway | Bus, streetcar, ferry, rail | Traffic jams cause service delays (fire trucks stuck in traffic) |
| **Cities: Skylines** | Agent-based; all vehicles and pedestrians simulated individually | A* on road graph; agents recalculate at intersections; prefer fastest route | 2-lane to 6-lane roads, highways, one-way, gravel | Bus, metro, tram, train, monorail, ferry, cable car, helicopter | Traffic percentage displayed; congestion slows all agents; emergency vehicles delayed |
| **Anno 1800** | Cart-based logistics on road network | Carts take shortest road distance from producer to warehouse/consumer | Dirt road, paved road (speed bonus) | N/A --- goods logistics only | Carts queue; inadequate road infrastructure creates production bottlenecks |
| **Banished** | Individual citizen pathfinding on foot + road speed bonus | Citizens walk to workplace, storage, home; road proximity critical | Dirt path, stone road (speed multiplier) | N/A | No congestion model; distance = lost productivity time |
| **Tropico 6** | Individual citizen pathfinding with vehicle use | Citizens walk or drive; teamsters transport goods | Roads, bridges, tunnels | Bus, metro, cable car | Teamster bottlenecks are a primary logistical challenge |

### Analysis

The split between **statistical** and **agent-based** traffic is the genre's most consequential technical decision.

SimCity 4's statistical model counts trips between origin-destination pairs and assigns volumes to road segments. This scales to enormous cities but is invisible --- you see traffic indicators on roads but never individual cars making decisions. The NAM community mod significantly improved the pathfinder heuristic by increasing maximum commute time to realistic values, which dramatically improved traffic distribution.

Cities: Skylines committed fully to agent-based simulation. Every citizen, car, truck, and bus is an individual entity navigating the road network. Agents recalculate paths at intersections, accounting for congestion. Vehicle movement updates approximately 4 times per second with interpolation for smooth rendering. The downside: the engine caps the number of simultaneously traveling agents, and path selection exhibits herding behavior where all agents choose the same "optimal" route, creating unrealistic congestion on single roads while parallel routes sit empty.

SimCity (2013)'s GlassBox engine used agents for everything --- water, power, workers, shoppers --- under a "What You See Is What You Sim" philosophy. Agents carried resources between buildings, and every animation was linked to agent activity. In practice, agents exhibited degenerate pathfinding: sims took the nearest available job each morning rather than commuting to a consistent workplace, and vehicles U-turned at dead ends rather than rerouting.

Anno 1800's cart system is not about citizen commuting but **goods logistics**. Production buildings dispatch carts to deliver output to warehouses, and the road network determines delivery speed. Congestion is implicit: if carts queue at a warehouse, production stalls.

**Key insight:** Agent-based traffic is more legible and dramatic (you see the traffic jam) but harder to balance at scale. Statistical models handle large cities gracefully but are invisible. A hybrid --- agent-based for visible local traffic, statistical for inter-district flows --- could offer both.

---

## 4. Citizen Simulation

| Game | Population Model | Individual Identity | Lifecycle | Needs System | Behavioral Autonomy |
|------|-----------------|--------------------|-----------|--------------|--------------------|
| **SimCity 4** | Abstract population pools per building | None --- buildings have occupant counts | None --- population is a number | Desirability score: land value, services, pollution, commute | None visible |
| **SimCity (2013)** | Agents ("Sims") travel between buildings | Sims have no persistent identity; they take nearest available home/job each day | None | Happiness from services, jobs, shopping | Agents roam seeking resources; no fixed routines |
| **Cities: Skylines** | Named citizens with household assignments | Names, age, education level, wealth | Birth -> education -> work -> retirement -> death; lifecycle DLC adds aging | Happiness from services, low crime, entertainment | Citizens commute from fixed home to fixed workplace; some leisure trips |
| **Cities: Skylines II** | Full lifecycle simulation | Persistent identity with name, household, education, wealth, health | Birth -> childhood -> teen -> adult -> senior -> death; lifespan affected by health | Multi-factor wellbeing: comfort, health, education, entertainment, services | Persistent daily routines: commute, errands, leisure |
| **Anno 1800** | Population tiers per residence | No individual identity; residences hold a population count per tier | Population tier upgrades (farmer -> worker -> artisan -> engineer -> investor) | Goods consumption per tier (e.g., investors need champagne, jewelry, gramophones) | N/A --- population is a consumption/production resource |
| **Banished** | Individual named citizens | Full identity: name, age, profession, home, health status | Born -> child -> educated (if school exists) -> laborer -> assigned profession -> old age -> death | Food, warmth, clothing, tools, health, happiness | Citizens prioritize personal survival; will idle if unhappy, gather food when hungry, visit neighbors for warmth |
| **Tropico 6** | Individual citizens with attributes | Name, faction affiliation, wealth, happiness breakdown | Citizens age; children grow to workers; workers retire | Eight happiness factors: food, faith, healthcare, entertainment, housing, liberty, safety, job quality | Citizens make autonomous choices about housing, workplaces, entertainment venues |
| **Frostpunk** | Named individuals with health/hope tracking | Name, health status, role | Limited: no birth/death cycle within scenario timeframe; people can die from cold/hunger/sickness | Warmth, food, hope, discontent | Workers assigned by player; limited autonomy |

### Analysis

The spectrum runs from **fully abstract population pools** (SimCity 4, Anno) to **individually tracked citizens** (Banished, Tropico). Each point on this spectrum creates fundamentally different player relationships with the population.

SimCity 4's abstract pools mean the player thinks about population as a *resource*: how many residents, what wealth level, how many workers. There is no emotional attachment to individuals. Anno extends this with a tier system that gives population *character* without identity --- you care about upgrading farmers to workers not because of individual stories but because higher tiers consume more goods and generate more income.

Banished represents the deepest individual simulation in the genre. Citizens are born, grow up, attend school if one exists, take jobs, marry, have children, age, and die. Crucially, citizens have autonomous survival instincts: they will leave work to eat when hungry, visit neighbors for warmth in winter, and idle when depressed. This creates emergent stories and makes death *meaningful* --- losing a blacksmith in winter means no new tools until you train a replacement, which takes time you may not have.

Cities: Skylines occupies a middle ground. Citizens have names and persistent home/work assignments, creating the *impression* of individual lives, but the simulation is relatively shallow --- citizens follow deterministic commute patterns without much behavioral autonomy. The Skylines II sequel deepened this significantly with a full lifepath system including education progression, career choices, and health-affected lifespan.

SimCity (2013)'s approach was uniquely problematic. The GlassBox engine simulated individual agents but without persistent identity --- a "sim" would take the nearest available home each night and the nearest job each morning. This created the visual appearance of individual citizens while producing deeply counterintuitive behavior (entire neighborhoods swapping inhabitants daily).

**Key design insight:** Individual citizens create emotional connection and emergent narrative but are computationally expensive and must be carefully designed to produce legible behavior. Abstract pools scale better but feel sterile. The sweet spot may be small populations with deep simulation (Banished) or large populations with *selective* individual tracking (named citizens for narrative, statistical pools for economic modeling).

---

## 5. Services and Coverage

| Game | Coverage Model | Service Types | Quality Feedback | Capacity vs. Radius |
|------|---------------|--------------|-----------------|---------------------|
| **SimCity 4** | Radius-based from service building; radius scales with funding | Police, fire, education (elementary, high school, college, library, museum), health (clinic, hospital) | Data overlay shows coverage color gradient; building query shows service access | Both: funding affects radius and effectiveness |
| **SimCity (2013)** | Agent-based: service vehicles dispatched to incidents | Police, fire, health, education | Vehicles visibly responding; crime/fire events visible | Vehicle count determines throughput; no radius per se |
| **Cities: Skylines** | Hybrid: capacity is citywide, but proximity gives happiness bonus | Police, fire, health, education (elementary, high school, university), deathcare, garbage | Green road overlay shows "positive boost" zone; info views show city-wide coverage | Capacity is global (enough schools = all educated); proximity affects speed of effect |
| **Anno 1800** | Road-connected radius from service building | Fire station, police, hospital, pub, church, school, university (varies by population tier) | Residence shows unmet needs; service buildings show coverage radius on road network | Radius is road-distance based; each building serves a fixed number of residences |
| **Banished** | Global + proximity for response time | No police; no fire department (fires spread, citizens fight them); herbalist, hospital, chapel, tavern, school, cemetery | Citizens show health/happiness status; sick citizens visible at hospital | Global: one school educates all children; herbalist/hospital serves nearby citizens first |
| **Tropico 6** | Radius-based with building quality tiers | Police, fire, clinic/hospital, high school/college, church, entertainment venues | Per-citizen happiness breakdown across eight categories; faction approval ratings | Radius from building; quality from budget and upgrades |

### Analysis

Three distinct models exist for service coverage:

**Radius-based** (classic SimCity, Tropico): Place a fire station and a circle of influence appears. Simple, legible, and creates clear placement puzzles --- how do you cover the whole city with minimum buildings? The downside is artificiality: coverage drops to zero one tile beyond the radius.

**Agent/vehicle-based** (SimCity 2013, partially Skylines): Services dispatch vehicles to incidents. A fire truck drives to the fire; a police car patrols streets. Coverage depends on response time, which depends on traffic and distance. This is more realistic and creates interesting interactions with the traffic system, but is harder for players to predict and optimize.

**Hybrid capacity** (Cities: Skylines): Services work citywide if total capacity is sufficient, but buildings near a service get a faster or stronger effect. This avoids the "one tile outside radius" problem while still rewarding thoughtful placement.

Anno 1800's **road-network radius** is an interesting variant: the service building covers all residences within N tiles of road distance, not Euclidean distance. This means road layout directly affects service coverage --- a winding road path may leave nearby-but-disconnected residences unserved.

**Design consideration:** Radius systems are the most legible for players and create the clearest placement decisions. Vehicle-based systems produce emergent drama but are harder to balance. Road-network distance is a compelling middle ground that rewards good infrastructure planning.

---

## 6. Utilities

| Game | Power | Water | Waste | Connection Model |
|------|-------|-------|-------|-----------------|
| **SimCity 4** | Power plants connected via power lines or road adjacency; power flows through zone connections | Water pumps/treatment connected via underground pipe network | Landfill placement; waste-to-energy plants | Explicit infrastructure: power lines + water pipes |
| **SimCity (2013)** | Power plants; electricity flows through road network | Water pumps; water flows through road network | Garbage trucks collect from buildings; recycling/landfill | **Road-integrated:** all utilities travel through roads, no separate pipe/line networks |
| **Cities: Skylines** | Power plants + power lines for long distance; buildings transmit power to neighbors | Water pumps + pipe network (separate underground layer); sewage outflow pipes | Garbage trucks + landfills/incinerators | Hybrid: power through buildings + lines; water through dedicated pipes |
| **Cities: Skylines II** | Low-voltage through roads; high-voltage via power lines for long distance | Water through roads; groundwater as new resource with depletion | Garbage collection services | **Road-integrated** for local distribution; explicit infrastructure for trunk lines |
| **Anno 1800** | No electricity system (historical setting); later DLCs add power plants for specific production buildings | No water utility; some buildings require river adjacency | No waste system | N/A for most; late-game electricity is building-specific |
| **Banished** | No power system | No water utility; citizens fetch water from wells or rivers for firefighting | No waste system | N/A |
| **Tropico 6** | Power plants supply electricity to buildings within radius; electrical substation extends range | No water utility network | Garbage dump; waste management building | Radius-based for power |
| **Frostpunk** | Central generator provides heat in radius; steam hubs extend coverage; coal-fueled | No water utility | No waste system | Radius from generator; steam hub relay system |

### Analysis

Utilities represent the **complexity vs. tedium tradeoff** in its purest form.

SimCity 4 required players to lay underground water pipes and overhead power lines --- separate infrastructure layers invisible during normal gameplay. This was realistic but tedious: forgetting to extend a pipe left new zones without water, and diagnosing "why does this building have no power?" required switching to infrastructure views.

SimCity (2013) made the radical decision to route all utilities through roads. This eliminated an entire layer of infrastructure management. Every road carried power, water, and sewage implicitly. This was polarizing: it reduced tedium but also eliminated the puzzle of infrastructure planning and made roads unrealistically load-bearing.

Cities: Skylines II found a middle ground. Local utility distribution happens through roads automatically (low-voltage power, water pipes are built into road types), but long-distance transmission requires explicit infrastructure (high-voltage power lines). This preserves the strategic decision of *where to place power plants and trunk lines* while eliminating the tedium of piping water to every building.

Frostpunk uses utilities as a core survival mechanic. The central generator provides heat in a radius, and steam hubs extend that radius. Managing heat coverage IS the game --- every building placement decision is fundamentally about "can I keep this warm?" This demonstrates how utilities can be elevated from infrastructure busywork to primary gameplay.

**Design insight:** Utilities should require decisions that create interesting tradeoffs, not rote pipe-laying. Road-integrated distribution with explicit trunk infrastructure (the Skylines II model) is a strong default. Alternatively, making a specific utility the core constraint (Frostpunk's heat) can turn infrastructure into compelling gameplay.

---

## 7. Terrain and Environment

| Game | Terrain Modification | Water Simulation | Pollution Model | Natural Resources | Environmental Feedback |
|------|---------------------|-----------------|----------------|-------------------|----------------------|
| **SimCity 4** | God-mode terraforming before city founding; limited in-city terrain tools | Static rivers and coastlines; no dynamic water flow | Air pollution (spreads, blocked by terrain); water table pollution from industry; garbage pollution | None explicitly; water access affects land value | Pollution data overlays; affects health and desirability |
| **SimCity (2013)** | No terraforming; fixed terrain per map | Static water bodies | Air, ground, and water pollution from industry/traffic; pollution agents flow through simulation | Extractable resources: coal, ore, oil, water table | Pollution visually affects terrain color; sick sims |
| **Cities: Skylines** | In-game terrain tools; raise/lower/level/soften | Dynamic water flow; rivers flood; sewage outflow creates visible pollution downstream | Ground pollution from industry; noise pollution from roads/airports; water pollution from sewage | Ore, oil, fertile land, forest (for specialized industry) | Multiple info view overlays; pollution affects health, land value, and citizen happiness |
| **Anno 1800** | No terraforming; fixed island terrain | Static coastlines; rivers for irrigation (with DLC) | Limited: some buildings produce pollution that reduces attractiveness in radius | Island fertilities (grain, hops, grapes, etc.); mineral deposits (iron, coal, zinc, copper, gold, oil) | Attractiveness score per island; pollution reduces it |
| **Banished** | No terraforming | Static rivers; citizens fish in rivers | No pollution model | Forests (renewable), stone quarries (finite), iron deposits (finite), wild game, fish | Resource depletion is primary environmental constraint; forests regrow, minerals do not |
| **Tropico 6** | Limited: can flatten terrain for building placement | Static ocean and rivers | Pollution from industry affects nearby citizen happiness | Island resources: gold, iron, bauxite, oil; agricultural fertility for various crops | Pollution radius around industrial buildings |
| **Frostpunk** | None; fixed crater map | None | None | Coal, wood, steel, food sources --- all finite on map; some renewable via buildings | Resource depletion drives scenario tension |

### Analysis

Environmental systems serve two purposes: **aesthetic realism** and **strategic constraint**.

Cities: Skylines has the genre's most dynamic water simulation. Rivers flow, dams create reservoirs, and sewage outflow visibly pollutes downstream water. This creates real environmental puzzles: place your water intake upstream of sewage output, or your citizens drink polluted water. The terrain tools allow players to reshape the landscape, enabling creative engineering like canal systems and artificial lakes.

SimCity 4's approach of terrain-blocked air pollution is an underappreciated mechanic. Mountains act as natural barriers --- industrial zones placed behind a ridge protect residential areas from pollution. This rewards players who read the terrain and plan accordingly.

Anno 1800 treats natural resources as the core strategic element. Each island has fixed fertilities (what crops can grow) and mineral deposits. Since no single island has everything, the player must establish multi-island trade networks. This transforms resource geography into a logistics puzzle.

Banished and Frostpunk use **resource depletion** as the primary environmental pressure. Banished's stone and iron quarries are finite --- once exhausted, you must trade for materials. Frostpunk's entire map has limited resources, creating constant scarcity pressure.

**Design consideration:** Dynamic water and terrain-aware pollution create the richest environmental gameplay. Resource geography (Anno's fertility system) creates long-term strategic depth. Finite resources (Banished) create urgency but can feel punitive if depletion is not clearly telegraphed.

---

## 8. Progression and Pacing

| Game | Unlock System | Milestones | Population Gates | Tech/Upgrade Tree | Endgame |
|------|-------------|-----------|-----------------|-------------------|---------|
| **SimCity 4** | Buildings unlock with city size and demand; no explicit milestone UI | Informal: city scale triggers new building availability | Implicit: larger cities get access to more building types | None | Open-ended sandbox; regional play provides long-term goals |
| **SimCity (2013)** | Great Works and specializations unlock at population/resource thresholds | Population milestones unlock city hall upgrades, which unlock new departments and buildings | Yes: city hall modules require specific population counts | City hall department specialization (education, safety, finance, etc.) | Great Works as mega-projects; regional cooperation |
| **Cities: Skylines** | 9 milestone tiers from 0 to 90,000 population; each unlocks buildings, services, and policies | Explicit milestone UI with population targets | Yes: milestone system gates all major features | None (linear unlock) | All buildings unlocked; sandbox play continues |
| **Cities: Skylines II** | 20 milestones (Tiny Village to Megalopolis); XP-based rather than pure population | XP earned passively (population + happiness) and actively (building, expanding) | Reduced: XP system means small, well-run towns can progress without hitting high population | Development Point trees for services (unlocking upgraded buildings and policies) | Signature buildings as prestige objectives |
| **Anno 1800** | Population tier upgrades (farmer -> worker -> artisan -> engineer -> investor) unlock new buildings and production chains | Tier transitions are major events requiring specific goods | Yes: advancing tiers requires meeting population needs and reaching minimum counts | Research system (with DLC) for advanced capabilities | Investor-tier mega-projects; world's fair; tourism |
| **Banished** | No unlock system; all buildings available from start | None | None | None | Open-ended survival; player sets own goals |
| **Tropico 6** | Era-based unlocks (Colonial -> World Wars -> Cold War -> Modern) | Era transitions triggered by meeting specific objectives | Some buildings require population thresholds | Research system unlocks edicts and building upgrades | Modern era with full building roster; ongoing election cycles |
| **Frostpunk** | Tech tree unlocked through research (using workshops/engineers) | Scenario-driven events and deadlines | None | Explicit tech tree with branching paths (heating, food, shelter, exploration, industry) | Scenario climax (the Great Storm, etc.) |

### Analysis

Progression systems solve the **information overload problem**: new players should not face every mechanic simultaneously. But they also create the **satisfaction curve** that keeps players engaged.

Cities: Skylines' population-gated milestones are the genre standard. Each tier unlocks a cluster of new buildings and services, creating natural "eras" of gameplay. The system is simple but has a known problem: it forces growth. Players who want to build a small, detailed town must still hit population targets to unlock essential services.

Cities: Skylines II addressed this with **XP-based milestones**. Expansion Points accumulate from both population growth and active building, meaning a small well-designed city can progress without explosive growth. Development Point trees add meaningful choices about *which* upgrades to prioritize.

Anno 1800's **tier system** is perhaps the most elegant progression model. Each population tier organically introduces new complexity: farmers need basic goods (fish, clothes), workers need beer and sausages, artisans need canned food and sewing machines, and so on. The player naturally encounters new production chains as their population advances. The gates are *needs-based* rather than arbitrary --- you cannot have investors without champagne production, and champagne requires grapes, which require a New World island.

Banished takes the opposite approach: **everything is available from the start.** The challenge is not unlocking tools but managing the order of operations with limited labor. This works because the complexity comes from the survival simulation, not from building variety.

Frostpunk's **tech tree** is distinctive because it creates genuine strategic decisions. Research requires scarce engineer time, and branching paths force tradeoffs: do you research better heaters or better food preservation? These choices have life-or-death consequences within the scenario timeframe.

**Design insight:** Population gates are simple but create a growth treadmill. Needs-based progression (Anno) is more organic. XP-based systems (Skylines II) give flexibility. Tech trees (Frostpunk) create strategic depth. The best systems combine multiple unlock vectors so progression does not feel like a single track.

---

## 9. Failure States

| Game | Can You Lose? | Primary Failure Mode | Death Spiral Mechanics | Disaster System | Recovery Possibility |
|------|-------------|---------------------|-----------------------|-----------------|---------------------|
| **SimCity 4** | Soft: bankruptcy triggers forced budget cuts; city degrades but persists | Budget deficit leading to service collapse and population exodus | Reduced services -> lower land value -> lower tax income -> deeper deficit | Earthquake, tornado, volcano, meteor, UFO attack, riot | Yes: slash budgets, rebuild slowly; very difficult from deep bankruptcy |
| **SimCity (2013)** | Soft: bankruptcy leads to service shutdown; city persists | Resource depletion (e.g., oil runs out, economy collapses); budget deficit | Service cuts -> crime/fire -> building abandonment -> less tax -> deeper cuts | Fire, earthquake, tornado, zombie attack, giant lizard, meteor | Yes: pivot economy to new revenue source; regional bailout from neighbor cities |
| **Cities: Skylines** | Very soft: negative budget triggers loan system; almost impossible to truly lose | Budget deficit (rare); traffic gridlock causing cascading service failure | Traffic jams -> no garbage pickup -> building abandonment -> death waves (age-synchronized population all dying simultaneously) | Tsunami, earthquake, tornado, sinkhole, meteor, forest fire | Easy: loans are generous; reduce services temporarily |
| **Anno 1800** | Soft: bankruptcy or military defeat | Supply chain collapse leading to population downgrade; diplomatic/military loss | Unmet needs -> population downgrade -> lost workforce -> more unmet needs | Ship combat; AI rivals can declare war | Yes: restructure supply chains; diplomacy; rebuild fleet |
| **Banished** | Yes: total population death | Starvation, hypothermia, disease epidemic | Food shortage -> weakened citizens -> disease -> fewer workers -> worse shortage -> death spiral | No explicit disasters; harsh winters, disease outbreaks, house fires, tornadoes | Difficult: labor shortage is self-reinforcing; nomad immigration can help if you survive |
| **Tropico 6** | Yes: election loss, revolution, or military invasion | Losing an election or failing to suppress rebellion | Low approval -> protests -> lower productivity -> worse services -> lower approval | Hurricanes, volcanic eruptions | Yes: edicts, emergency measures, martial law |
| **Frostpunk** | Yes: explicitly designed to be losable | Hope reaches zero (banishment); discontent maxes out; population death | Cold -> sickness -> fewer workers -> less coal production -> colder -> more sickness | Scripted scenario events (storms, refugees, crises) | Very difficult: each crisis compounds; scenarios have hard deadlines |

### Analysis

Failure states define a game's **emotional register**. Most city builders are fundamentally *creative toys* with vestigial failure mechanics. Skylines is nearly impossible to lose; the loan system and forgiving economics mean the player always has a safety net. This makes it an excellent sandbox but removes tension.

Frostpunk exists at the other extreme: it is explicitly designed around failure. The game creates a "continual downward spiral" where managing one resource depletes another. Coal for heating competes with coal for industry; sick workers cannot produce resources to prevent more sickness. Every decision has costs, and the scenario's hard deadline means you cannot simply wait for problems to resolve.

Banished occupies an interesting middle ground. There is no currency and no explicit fail screen, but **labor shortage death spirals** can be unrecoverable. If enough citizens die in a harsh winter, the reduced workforce cannot produce enough food for the next year, leading to more deaths. The game's one-developer design (by Shining Rock Software's Luke Hodorowicz) intentionally made labor, not resources, the binding constraint --- creating a fundamentally different kind of pressure than resource scarcity.

SimCity's bankruptcy system is interesting because it degrades *gradually*. You do not instantly lose; instead, forced budget cuts reduce services, which reduces land value, which reduces revenue, creating a downward cycle that is visible and (theoretically) recoverable. This models real municipal fiscal crises surprisingly well.

**Design consideration:** The target audience determines the right failure severity. Sandbox players want consequence-free creativity (Skylines). Strategy players want meaningful risk (Banished, Frostpunk). A difficulty setting that shifts between these modes can serve both --- but the underlying simulation must support genuine failure for the harder mode to feel authentic.

---

## 10. Modding and Extensibility

| Game | Mod Support | Mod Distribution | Asset Creation | Gameplay Mods | Community Scale |
|------|-----------|-----------------|----------------|---------------|----------------|
| **SimCity 4** | Extensive unofficial modding scene; plugin system via DLL injection and file overrides | Simtropolis, SC4 Devotion, LEX (Lot Exchange) | Custom lots, buildings, props via BAT (Building Architect Tool) and Lot Editor | NAM (Network Addon Mod) is genre-defining; overhauls traffic, adds transit options | Very active 20+ years later; NAM has had continuous development since 2004 |
| **SimCity (2013)** | Minimal; no official mod support | N/A | Very limited; some texture/model swaps | Almost none due to online-only architecture and closed engine | Minimal |
| **Cities: Skylines** | Official mod support; C# API; Unity-based engine | Steam Workshop (primary); Simtropolis | Asset Editor built into game; Import custom models and textures | Deep: traffic managers, realistic population, custom AI, new mechanics | Massive: 500,000+ Workshop items; one of Steam's largest modding communities |
| **Cities: Skylines II** | Official mod support via Paradox Mods platform (cross-platform, not Steam Workshop) | Paradox Mods (PC and console) | Code mods and asset packs; new modding framework | Available but ecosystem still growing | Growing; migration from Skylines 1 community |
| **Anno 1800** | Officially supported via mod loader; community-developed tools | Nexus Mods, mod.io, GitHub | Custom buildings and production chains via XML/asset editing; VS Code extension available | Moderate: gameplay tweaks, new production chains, balance changes; reserved GUID range for modders | Active; Spice It Up is a major compilation mod |
| **Banished** | Official mod toolkit released by developer | Steam Workshop; BanishedInfo.com | Custom buildings, resources, production chains via mod kit | Colonial Charter (massive content expansion); MegaMod compilation | Small but dedicated; Colonial Charter is genre-notable for scope |
| **Tropico 6** | Limited official mod support | Steam Workshop | Some asset creation tools | Limited: mostly maps and scenarios | Small |
| **Frostpunk** | Minimal | N/A | N/A | Almost none | Minimal |

### Analysis

Moddability is the strongest predictor of a city builder's **longevity**. SimCity 4, released in 2003, maintains an active community primarily because of its modding ecosystem. The Network Addon Mod alone has been in continuous development for over 20 years, fundamentally transforming the game's traffic simulation.

Cities: Skylines became the genre standard partly because Colossal Order built on Unity and exposed a C# modding API. This lowered the barrier for programmer-modders, resulting in mods like Traffic Manager: President Edition (TMPE) that added features like timed traffic lights, lane routing, and speed limits --- functionality that arguably should have been in the base game. The Steam Workshop integration meant one-click installation, which grew the mod-using audience far beyond the technical modding community.

Banished demonstrates that even a solo-developer game can support a thriving mod scene with the right toolkit. Colonial Charter expanded the game's content by an order of magnitude, adding hundreds of buildings, new resources, and production chains. This effectively gave the game years of additional content at zero cost to the developer.

Anno 1800 took a measured approach: Ubisoft reserved a GUID range (1337471142 to 2147483647) specifically for modders, ensuring mods would never conflict with official updates. The community developed a VS Code extension and dedicated modding guides on GitHub, creating a professional-grade toolchain.

**Design insight:** Investing in mod support has asymmetric returns. A well-designed modding API costs development time upfront but generates *years* of community content. The minimum viable modding support includes: data-driven configuration files (not hardcoded values), an asset pipeline for custom buildings/models, and a stable scripting API for gameplay modifications.

---

## 11. UI and Information Design

| Game | Primary Data Display | Overlay System | Query/Inspect Tool | Budget/Statistics UI | Notification System |
|------|---------------------|---------------|-------------------|---------------------|-------------------|
| **SimCity 4** | Data views: 15+ map overlays (traffic, crime, pollution, land value, etc.) | Full-map color overlays toggled via menu; each shows single data layer | Click-to-query any building for detailed stats; Ctrl+click for advanced data (flammability, pollution values) | Monthly budget panel with per-department sliders; graphs for population, budget, RCI demand over time | News ticker with advisor messages; disaster warnings |
| **SimCity (2013)** | Contextual data layers activated per topic | Color-coded building overlays (happy=green, struggling=yellow, failing=red) | Click building for popup with stats, visitor count, resources | Real-time income/expense display; hourly cash flow | Advisor popups; contextual tips |
| **Cities: Skylines** | 19 info views: electricity, water, traffic, crime, health, education, ground value, pollution, noise, happiness, etc. | Full-map overlays with graduated color (green=good to red=bad); traffic shows percentage per road segment | Click any building for details; citizen click shows name, home, work, education, happiness | Budget panel with income/expense per category; graphs and statistics panel | Chirper feed (social media parody); milestone popups; problem icons on buildings |
| **Anno 1800** | Per-island statistics; newspaper system | Building radius displays on placement; attractiveness heatmap | Click building for production rate, workforce, storage, efficiency | Per-island income/expense breakdown; production statistics; trade route profitability | Newspaper with editorials reflecting city state; quest notifications; warning icons on struggling buildings |
| **Banished** | Minimal HUD: population, food stores, resource counts | No map overlays; status shown via building click | Click building for inventory, worker assignment, efficiency | Resource summary bar; production/consumption charts | Event log; disaster notifications; status icons on citizens (sick, starving, cold) |
| **Tropico 6** | Almanac: comprehensive statistics dashboard | Overlay for approval, faction standing, building coverage | Click building for workers, efficiency, upgrades; click citizen for personal happiness breakdown | Treasury display; trade overview; era-specific economic data | Faction demands; election warnings; advisor radio messages |
| **Frostpunk** | Central HUD: temperature, coal, food, hope, discontent | Heat map showing temperature zones from generator | Click building for workers, efficiency, conditions | Resource production/consumption rates; workforce allocation | Event cards with narrative choices; storm warnings; law consequence notifications |

### Analysis

Information design determines whether a complex simulation feels **manageable or overwhelming**. City builders simulate dozens of interconnected systems, and the UI must help players understand *what is happening* and *what needs attention*.

**Overlay systems** are the dominant pattern. Cities: Skylines offers 19 distinct info views, each painting the city map with color gradients. This lets players quickly identify problem areas --- a red zone in the crime overlay means "build a police station here." The weakness is that overlays show one variable at a time; understanding the *interaction* between systems (e.g., crime is high *because* education is low *because* there is no school *because* the budget was cut) requires toggling between multiple views.

SimCity 4's **query tool** is underappreciated. Clicking any building reveals detailed statistics; Ctrl+click shows advanced simulation data. This creates a two-tier information system: casual players see summary stats, while power players can inspect the underlying simulation variables. The community extended this further with the Query Tool UI Extensions DLL mod, which exposed even more internal data.

Anno 1800's **newspaper system** is a creative approach to information delivery. Instead of abstract UI notifications, the game generates a contextual newspaper with editorials that reflect your city's current state --- a declining economy might produce headlines about unemployment. This makes information delivery feel thematic and world-building rather than clinical.

Frostpunk demonstrates effective **information hierarchy** for a high-stress game. The four critical metrics (temperature, coal, food, hope/discontent) are always visible. The heat map overlay --- showing warm zones radiating from the generator --- is the single most important view and is visually intuitive.

**Design principles:**
1. **Layer information by urgency.** Critical metrics always visible; detailed data on demand.
2. **Spatial overlays for spatial decisions.** Crime, traffic, and services are inherently spatial --- show them on the map.
3. **Comparative views** are underserved across the genre. No major title makes it easy to overlay two variables simultaneously (e.g., crime + income, or traffic + land value).
4. **Query tools** should exist at multiple depth levels: quick tooltip, detailed panel, and power-user data dump.

---

## 12. Summary Matrix

Comprehensive feature comparison across eight major titles.

| Feature | SimCity 4 | SimCity (2013) | Cities: Skylines | Cities: Skylines II | Anno 1800 | Banished | Tropico 6 | Frostpunk |
|---------|-----------|---------------|-----------------|--------------------|-----------|-----------|-----------| ----------|
| **Release** | 2003 | 2013 | 2015 | 2023 | 2019 | 2014 | 2019 | 2018 |
| **Developer** | Maxis | Maxis | Colossal Order | Colossal Order | Ubisoft Blue Byte | Shining Rock | Limbic Ent. | 11 bit studios |
| **Zoning** | RCI grid paint | RCI road-frontage | RCI grid paint | RCI + mixed use | Manual placement | Manual placement | Manual placement | Manual placement |
| **Density model** | Player-selected tiers | Road-type gates | Low/High toggle | Zone-type tiers | Fixed per building | N/A | Fixed + upgrades | N/A |
| **Economy** | Tax + budget | Tax + commodities | Tax + budget | Tax + budget | Production chains + trade | Barter only | Export + tourism | Survival resources |
| **Traffic** | Statistical | Agent (GlassBox) | Agent-based | Agent-based | Cart logistics | Citizen pathfinding | Citizen + teamster | N/A |
| **Population** | Abstract pools | Stateless agents | Named citizens | Full lifepath | Tier-based pools | Individual lifecycle | Individual citizens | Named individuals |
| **Services** | Radius + funding | Vehicle dispatch | Capacity + proximity bonus | Capacity + proximity | Road-distance radius | Global + proximity | Radius + quality | N/A (survival) |
| **Utilities** | Explicit pipes + lines | Road-integrated | Pipes + power lines | Road-integrated + trunk lines | N/A (historical) | N/A | Radius power | Generator + hubs |
| **Terrain tools** | God-mode terraform | None | In-game terrain editing | In-game terrain editing | None | None | Limited flattening | None |
| **Pollution** | Air + water + garbage | Air + ground + water | Ground + noise + water | Ground + noise + water | Attractiveness reduction | None | Happiness reduction | None |
| **Progression** | Implicit size-based | Population + specialization | Population milestones | XP-based milestones + dev trees | Population tier upgrades | None (all unlocked) | Era-based | Tech tree |
| **Failure severity** | Soft (bankruptcy) | Soft (bankruptcy) | Very soft (loans) | Very soft (loans) | Soft (bankruptcy/war) | Hard (death spiral) | Medium (elections/revolt) | Hard (hope/death) |
| **Mod support** | Extensive (unofficial) | Minimal | Massive (Steam Workshop) | Growing (Paradox Mods) | Moderate (Nexus/mod.io) | Good (official toolkit) | Limited | Minimal |
| **Max city scale** | Regional megaregion | ~200K agents | ~1M population | Larger maps, improved perf | Multi-island empire | ~300 citizens practical | Single island | ~700 citizens |

### Key Takeaways for Game Developers

1. **Zoning vs. placement is the first fork.** RCI zoning creates emergent growth and scales to large cities. Manual placement gives control and works for smaller, more intimate simulations. Hybrid approaches (Foundation's painted zones with emergent building) are underexplored.

2. **Agent-based simulation is compelling but treacherous.** It creates legibility (you see the traffic jam, the fire truck, the commuter) but introduces pathfinding bugs, performance caps, and emergent degeneracy. SimCity 2013's GlassBox is the cautionary tale; Cities: Skylines shows how to do it with appropriate compromises.

3. **Economic depth determines playstyle.** Simple tax models create macro-strategists. Production chains create logistics optimizers. The Anno model of tier-based population needs driving production chain expansion is the genre's most elegant economic progression.

4. **Failure must be intentional.** Half-hearted failure states (Skylines' trivial loans) satisfy neither sandbox players (who want zero friction) nor strategy players (who want meaningful risk). Commit to one end or provide explicit difficulty modes.

5. **Mod support pays compound interest.** SimCity 4's 20+ year community and Skylines' 500K+ Workshop items demonstrate that modding infrastructure investment generates returns far exceeding its cost.

6. **Information design is the overlooked differentiator.** Most city builders have similar underlying simulations but vary wildly in how well they communicate simulation state to the player. Comparative overlays, tiered query tools, and contextual information delivery are all areas with room for innovation.

---

## Sources

### Developer Talks and Technical References
- [GDC Vault: Simulating a City, One Page at a Time (Stone Librande, Maxis)](https://gdcvault.com/play/1017708/Simulating-a-City-One-Page)
- [GDC Vault: Cities: Skylines, A Case Study (Colossal Order)](https://gdcvault.com/play/1022809/Cities-Skylines-A-Case)
- [Cities: Skylines dev: Don't punish your players; teach them (Karoliina Korppoo)](https://www.gamedeveloper.com/design/-i-cities-skylines-i-dev-don-t-punish-your-players-teach-them)
- [Game Design Deep Dive: Traffic Systems in Cities: Skylines](https://www.gamedeveloper.com/design/game-design-deep-dive-traffic-systems-in-i-cities-skylines-i-)
- [Inside GlassBox (Andrew Willmott, Maxis)](https://www.andrewwillmott.com/talks/inside-glassbox)
- [GDC 2012: Breaking Down SimCity's GlassBox Engine](https://www.gamedeveloper.com/design/gdc-2012-breaking-down-em-simcity-em-s-glassbox-engine)
- [Banished and Psychological Flow (Gamedeveloper.com)](https://www.gamedeveloper.com/design/banished-and-psychological-flow)

### Game Wikis and Encyclopedias
- [SimCity 4 Zoning and Demand (StrategyWiki)](https://strategywiki.org/wiki/SimCity_4/Zoning_and_Demand)
- [RCI Zones (SC4D Encyclopaedia)](https://wiki.sc4devotion.com/index.php?title=RCI_Zones)
- [SimCity 4 Pollution (StrategyWiki)](https://strategywiki.org/wiki/SimCity_4/Pollution)
- [Cities: Skylines Info Views (Paradox Wiki)](https://skylines.paradoxwikis.com/Info_views)
- [Cities: Skylines II Traffic AI (Paradox Interactive)](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/traffic-ai)
- [Cities: Skylines II Zones and Signature Buildings (Paradox Interactive)](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/zones-signature-buildings)
- [Cities: Skylines II Electricity and Water (Paradox Interactive)](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/electricity-water)
- [Cities: Skylines II Game Progression (Paradox Interactive)](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/game-progression)
- [Cities: Skylines II Citizen Simulation and Lifepath (Paradox Interactive)](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/citizen-simulation-lifepath)
- [Anno 1800 Production Chains (Fandom Wiki)](https://anno1800.fandom.com/wiki/Production_chains)
- [Anno 1800 Fertilities and Resources (Fandom Wiki)](https://anno1800.fandom.com/wiki/Fertilities_and_resources)
- [Banished Citizens (Banished Wiki)](https://banished-wiki.com/wiki/Citizens)
- [SimCity Disasters (Fandom Wiki)](https://simcity.fandom.com/wiki/Disasters)
- [SimCity Pollution (Fandom Wiki)](https://simcity.fandom.com/wiki/Pollution)

### Community Analysis and Modding
- [NAM Traffic Simulator Guide (SC4 NAM)](https://www.sc4nam.com/docs/feature-guides/the-nam-traffic-simulator/)
- [Tutorial: Understanding the Traffic Simulator (SC4D Encyclopaedia)](https://wiki.sc4devotion.com/index.php?title=Tutorial:Understanding_the_Traffic_Simulator)
- [Demand, Desirability, and Abandonment (Simtropolis)](https://community.simtropolis.com/omnibus/simcity-4/reference/demand-desirability-and-abandonment-r31/)
- [Anno 1800 Modding FAQ (Anno Union)](https://www.anno-union.com/modding-in-anno-1800-faq/)
- [Anno 1800 Modding Guide (GitHub)](https://github.com/anno-mods/modding-guide)
- [Colonial Charter mod for Banished (Steam Workshop)](https://steamcommunity.com/sharedfiles/filedetails/?id=849019386)
- [Cities: Skylines Mods (Paradox Wiki)](https://skylines.paradoxwikis.com/Mods)

### Game Design Analysis
- [Tropico 6 Economy Deconstruction (Andrei Medvedev)](https://www.linkedin.com/pulse/tropico-6-economy-deconstruction-andrei-medvedev)
- [Tropico 6 Finances and Trade Mechanics (gamepressure.com)](https://www.gamepressure.com/tropico-6/finances-and-trade/zbc008)
- [Frostpunk Delivers Frozen Failure On A Stick (Game Wisdom)](https://game-wisdom.com/analysis/frostpunk)
- [A Look At the City Builder Genre (Gamedeveloper.com)](https://www.gamedeveloper.com/design/a-look-at-the-city-builder-genre)
- [Foundation: A Freeform Medieval City Builder (PC Gamer)](https://www.pcgamer.com/foundation-is-a-freeform-medieval-city-builder-with-no-grids-to-follow/)
- [Banished: Towards a Playable Human Ecology (Play The Past)](https://www.playthepast.org/?p=5805)
- [SimCities and SimCrises (Molleindustria)](https://molleindustria.org/GamesForCities/)
