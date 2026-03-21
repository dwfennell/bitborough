# Simulation Depth vs. Fun

> Where city builders simplify reality for gameplay, where depth creates emergent fun, and how to find the right balance.

## Table of Contents

- [1. The Fundamental Tension](#1-the-fundamental-tension)
- [2. Abstraction Levels](#2-abstraction-levels)
- [3. Emergent vs. Scripted Gameplay](#3-emergent-vs-scripted-gameplay)
- [4. The "Interesting Decision" Framework](#4-the-interesting-decision-framework)
- [5. Systems the Genre Always Simplifies](#5-systems-the-genre-always-simplifies)
- [6. Systems Where Depth Pays Off](#6-systems-where-depth-pays-off)
- [7. The Feedback Loop Problem](#7-the-feedback-loop-problem)
- [8. Pacing and the Growth S-Curve](#8-pacing-and-the-growth-s-curve)
- [9. The "Spreadsheet Game" Trap](#9-the-spreadsheet-game-trap)
- [10. Difficulty and Failure](#10-difficulty-and-failure)
- [11. Player Types and What They Want](#11-player-types-and-what-they-want)
- [12. Lessons for Bitborough](#12-lessons-for-bitborough)
- [Sources](#sources)

---

## 1. The Fundamental Tension

Every city builder confronts the same design paradox: real cities are among the most complex systems humans have ever created, and the genre's appeal rests on letting players build one. But complexity is a double-edged instrument. More simulation can mean richer emergent behavior, deeper strategic decisions, and the satisfying feeling that your city is *alive*. It can also mean opaque mechanics, tedious micromanagement, and the nagging sense that the computer is playing itself while you watch.

Sid Meier articulated this tension directly: "The more elaborate the simulation is, the less interactive the game becomes, as prioritizing realism means that much of the controls will be taken away from the player and handed over to the computer instead." An early Civilization prototype failed, he noted, because "you did a lot more watching than you did playing" (GDC 2012). The lesson was not that simulation is bad, but that simulation must serve player agency. Every system you model is a system the player must either control, understand, or ignore --- and the design cost of "ignore" is higher than most developers realize, because opaque systems undermine trust in the ones players *do* engage with.

Raph Koster's *A Theory of Fun for Game Design* (2005) frames the issue from the player's cognitive perspective. Fun, Koster argues, is the feeling of learning --- the brain's reward for successfully pattern-matching against novel complexity. Games are fun precisely when they present systems complex enough to sustain learning but legible enough for the player to form and test mental models. "Fun from games arises out of mastery. It is the act of solving puzzles that makes games fun. In other words, with games, learning is the drug." A city builder that simulates groundwater contamination at the molecular level is not inherently better than one that shows a red overlay labeled "pollution." The question is whether the simulation layer creates a *learnable puzzle* the player can engage with, or just noise they must endure.

The genre's history is littered with examples on both sides. SimCity (1989) modeled traffic, crime, land value, and pollution with relatively simple equations, yet the interplay between those systems generated decades of replayable depth. SimCity 2013 invested enormous engineering effort into its Glassbox agent simulation, promising a city built from individual behaviors "up" --- and the result was a game where citizens forgot where they lived. More simulation, less fun.

This tension cannot be resolved with a universal rule. It must be resolved system by system, asking for each mechanic: does this simulation layer create decisions the player can engage with? Does it produce outcomes the player can read, predict, and learn from? If yes, it earns its complexity budget. If not, it should be abstracted away or replaced with a simpler model that does.

---

## 2. Abstraction Levels

City builders occupy a wide spectrum of simulation fidelity. Understanding where successful games sit on this spectrum --- and why --- is essential for positioning a new entry.

**The deep end: Dwarf Fortress and Workers & Resources: Soviet Republic.** Dwarf Fortress simulates individual dwarves with over 500 interlocking needs, skills, and memories. Each dwarf has a personality, relationships, preferences, and a deterministic state machine governing behavior. Creator Tarn Adams has stated that, by his estimation, the game is "42% of the way towards simulating the narratively interesting parts of existence." Workers & Resources: Soviet Republic tracks over 30 commodities through realistic production chains --- raw materials mined, refined, stored in appropriate facilities, transported by type-specific vehicles. Both games find dedicated audiences precisely because their depth produces unique, unreproducible outcomes. The cost is brutal learning curves and interfaces that assume the player *wants* to engage with every system.

**The middle ground: Cities: Skylines and Anno 1800.** Cities: Skylines abstracts citizens into statistical distributions for most purposes but simulates traffic at the individual vehicle level, creating the game's signature challenge. The traffic system is deep enough to produce emergent puzzles (highway interchanges that bottleneck, roundabouts that flow) while abstracting away the thousands of decisions real commuters make. Anno 1800 takes a similar approach to production chains: each good progresses through multiple stages of refinement, but the system naturally trends toward equilibrium rather than catastrophic failure, allowing experimentation without permadeath anxiety.

**The shallow end: Pocket City and mobile city builders.** Pocket City deliberately strips the genre to its essentials: zone, build services, watch your city grow. As reviewers noted, the game "gives you the veneer and some important deeper systems from the city-building genre while cutting out a lot of the complexity in between." The result is accessible and satisfying in short sessions, but lacks the emergent depth that sustains long-term play. Players rarely tell stories about their Pocket City saves.

**The narrative middle: Frostpunk and Banished.** These games achieve depth not through simulation fidelity but through scarcity and moral weight. Frostpunk simulates relatively little --- its economy is straightforward, its citizens are abstract --- but every decision is freighted with ethical consequence. Lead designer Kuba Stokalski described the game as exploring "how willing players are to sacrifice their morals and ideals to achieve a better outcome." Banished achieves difficulty through resource scarcity and population dynamics rather than simulation complexity.

The pattern across successful games: simulation depth should be concentrated where it produces the most *player-facing* complexity. Skylines is deep where depth produces puzzles (traffic). Anno is deep where depth produces satisfying chains (economy). Frostpunk is deep where depth produces narrative tension (moral choices). None of them are uniformly deep. The genre's failures tend to come from either uniform shallowness (nothing to master) or uniform depth (everything is exhausting).

---

## 3. Emergent vs. Scripted Gameplay

The promise of simulation is emergence --- outcomes the designer never scripted but that arise naturally from system interactions. When emergence works, it produces the genre's peak moments. When it fails, it produces confusion, frustration, and the feeling that the game is broken.

**Emergence as puzzle: Cities: Skylines traffic.** The defining experience of Skylines is the traffic jam. You zone residential on one side of the map and commercial on the other, and at a certain population threshold, the highway interchange between them gridlocks. This was never scripted. It emerged from the interaction of zoning placement, road network topology, and the traffic simulation's first-come-first-served pathfinding. The result is a puzzle the player can diagnose (overlay shows red roads), hypothesize about (too few lanes? wrong interchange type?), and solve (add a bypass, upgrade to highway, rezone to reduce commute distance). The traffic system works because the simulation is legible: the player can see vehicles, understand their behavior, and predict the consequences of changes. As the Colossal Order team explained, traffic is "carefully modeled after real-life traffic" but with simplifications that keep behavior predictable --- vehicles use target points for collision avoidance, traffic lights prevent intersection conflicts, and calculations are distributed across frames for performance.

**Emergence as storytelling: Dwarf Fortress and RimWorld.** Dwarf Fortress and its spiritual successor RimWorld produce emergent narratives that players recount for years. A dwarf goes insane because their favorite mug was destroyed in a flood caused by a mining accident that breached an underground river. None of this was authored. RimWorld formalizes this with its AI Storyteller system --- three configurable directors that analyze the colony's state and generate events calibrated to produce narrative arcs. Tynan Sylvester's studio "defined RimWorld not as a game, but as a story generator," and this frame "opened up entirely new mechanisms for creating compelling play." The simulation serves storytelling, not the other way around.

**Emergence as failure: SimCity 2013's Glassbox.** SimCity 2013 is the cautionary tale. The Glassbox engine simulated every citizen as an individual agent, promising unprecedented realism. In practice, agents had no persistent identity --- Sims did not return to their own homes but simply drove to the nearest available house. Power and water were delivered by "agents" that wandered semi-randomly through the grid, sometimes failing to reach distant buildings. Traffic pathfinding used shortest-path without congestion awareness, so every vehicle piled onto the same road while parallel routes sat empty. The simulation was deep, but its depth produced behavior that contradicted player intuition. When you build a power plant, you expect it to power the city. When citizens have homes, you expect them to return to those homes. Glassbox violated these expectations at a fundamental level, and no amount of simulation depth could compensate for the resulting loss of trust. Community analysis documented the problems extensively, but the core lesson is simple: emergence must be *legible* emergence. If the player cannot build a mental model of why the simulation behaves as it does, depth becomes a liability.

**The design heuristic.** Emergence is worth pursuing when three conditions hold: (1) the player can observe the emergent behavior, (2) the player can form a causal explanation for it, and (3) the player has tools to respond to it. Traffic jams in Skylines meet all three. Glassbox's wandering power agents met none of them.

---

## 4. The "Interesting Decision" Framework

Sid Meier's principle --- "Games are a series of interesting decisions" --- is the genre's most important design heuristic. At GDC 2012, Meier elaborated on what makes a decision interesting: the player must understand their options, the options must have meaningfully different outcomes, and the right choice must not be obvious. If a player always picks the first option, or picks randomly, the decision is not interesting.

Applied to city builders, this framework separates what the player should decide from what the simulation should handle automatically.

**Decisions the player should make:**
- *Where* to place things (spatial reasoning is the genre's core skill)
- *When* to expand (pacing and risk management)
- *What* to prioritize when resources are scarce (tradeoffs)
- *How* to respond to emergent problems (diagnosis and problem-solving)

**Decisions the simulation should automate:**
- Individual citizen pathfinding (the player designs the network, not the routes)
- Utility distribution within a service radius (the player places the plant, not the pipes)
- Moment-to-moment economic transactions (the player sets tax rates, not individual prices)
- Building-level maintenance (the player funds the department, not each repair)

The boundary between these categories is the genre's central design challenge. Push too many decisions to the player and you get micromanagement hell --- the "spreadsheet game" problem discussed in section 9. Push too many to the simulation and you get Meier's early Civilization problem: "more watching than playing."

Frostpunk demonstrates a masterful application of this framework. The simulation handles resource gathering, building operation, and citizen daily life automatically. The player makes a small number of high-stakes decisions: which laws to enact, where to send scouts, when to extend working hours. Each decision is informed (you can see your coal reserves, your sick count, your hope meter), impactful (child labor permanently changes your workforce and your citizens' morale), and non-obvious (is it worth the moral cost?). The game strips away hundreds of decisions a more simulation-heavy game might offer and concentrates player attention on the ones that carry the most narrative and strategic weight.

The Citystate II postmortem provides a negative example. Developer Andy Sztark reflected that "a realistic city building game with economics and politics could become more mainstream, but Citystate II failed to introduce interesting game mechanics. The lack of clear goals, rewards, and immediate feedback prevented players from staying engaged and focused." The game offered many decisions, but too few of them were interesting --- they lacked clear outcomes, meaningful tradeoffs, or visible consequences. Simulation fidelity without decision quality is wasted engineering.

---

## 5. Systems the Genre Always Simplifies

Certain real-world city systems are consistently abstracted away across the genre, and the pattern is instructive. These omissions are not laziness --- they reflect hard-won knowledge about what makes engaging gameplay.

**Politics and governance.** Real cities are governed by elected councils, appointed managers, zoning boards, planning commissions, and courts. Decisions involve negotiation, compromise, and legal process. Nearly every city builder puts the player in the role of an unchallenged autocrat. Attempts to simulate politics (Urban Empire, Citystate II) have struggled commercially. The Citystate II postmortem identified a fundamental audience problem: "There are basically two groups of people interested in Citystate: people looking for a political simulation and people looking for a Cities Skylines alternative. The problem is that these two groups are probably impossible to satisfy simultaneously." Politics adds friction without adding spatial puzzles, and city builders are fundamentally about spatial reasoning.

**Federal and state government.** Real cities operate within a hierarchy of government --- federal regulations, state mandates, court rulings. City builders almost universally treat the city as a sovereign entity. This simplification is so universal that players do not even notice it. The alternative (simulating federal highway funding applications, state environmental review, Supreme Court zoning precedent) would add realistic constraints but no interesting decisions.

**Racial dynamics and social inequality.** Real cities are shaped profoundly by race --- redlining, white flight, school segregation, environmental racism, gentrification and displacement. These dynamics are almost entirely absent from mainstream city builders. Cities: Skylines, as the Citystate II developer noted, "indirectly portrays a very naive representation of society where bike lanes and bus stops are enough to make a city thrive." This is partly a commercial sensitivity issue, but it also reflects a genuine design problem: racial dynamics involve structural forces and historical path-dependence that resist gamification without trivialization. The research literature on Schelling segregation models shows that even simple agent rules produce complex emergent patterns, but translating those patterns into *player decisions* is extremely difficult.

**Legal systems.** Property law, eminent domain, environmental regulations, building codes, liability --- the legal infrastructure that shapes real cities is entirely absent from the genre. The player's bulldozer encounters no lawsuits. This simplification dramatically increases the pace and agency of gameplay, which is why it persists.

**Climate and weather.** Beyond disaster events, the daily influence of climate on city form (building orientation, street width, vegetation, HVAC demand, seasonal migration) is rarely modeled. Climate is a slow variable that produces constraints rather than decisions, making it a poor fit for the genre's decision-oriented design.

**The consistent pattern:** systems get simplified when they add constraints without adding decisions, when they operate on timescales too long for gameplay pacing, when they involve sensitivity that risks trivialization, or when they pull focus from the genre's core loop of spatial placement and resource management.

---

## 6. Systems Where Depth Pays Off

The inverse question is equally instructive: which systems consistently reward deeper simulation? Three stand out across the genre's history.

**Traffic and transportation.** From SimCity (1989) through Cities: Skylines II (2023), traffic has been the genre's richest source of emergent gameplay. The reason is structural: traffic is the direct spatial consequence of the player's two most fundamental decisions (where to place things and how to connect them). Deeper traffic simulation translates directly into richer feedback on those decisions. Skylines' traffic system --- with multiple road types, one-way streets, highways, roundabouts, public transit, and individual vehicle simulation --- created the genre's definitive late-game challenge. As the Colossal Order team documented in their Game Design Deep Dive, managing traffic is "possibly the most important" end-game task, with "many different road types that all need to be usable and interesting choices." The traffic system works because it is the natural consequence of spatial decisions the player is already making.

**Economy and production chains.** Anno 1800 demonstrates how deep economic simulation creates satisfying gameplay. Its multi-stage production chains (raw materials through intermediate goods to final products) produce a logistical puzzle that rewards planning and spatial optimization. Critically, the system trends toward equilibrium rather than catastrophic failure, so depth creates challenge without punishment. Workers & Resources: Soviet Republic pushes this further with 30+ commodities, type-specific storage, and realistic transport logistics. The audience is smaller but intensely devoted. The pattern: economic depth works when it creates visible, spatial puzzles (where to place the factory relative to the resource and the market) rather than abstract number-tuning.

**Citizen lifecycle and population dynamics.** Banished demonstrated that population management --- birth, aging, education, employment, death --- can be a compelling core loop even with minimal simulation elsewhere. The game's difficulty comes from the tension between population growth (which provides labor) and population needs (which consume resources). Expanding too fast produces a death spiral as new citizens consume food before they can contribute. Workers & Resources tracks citizens "from childhood to the end of their lives," creating attachment and consequence. RimWorld's colonists, each with individual traits, relationships, and histories, are the emotional core of the game. Population depth works because it humanizes the city --- it turns abstract growth numbers into characters the player cares about.

**The common thread:** systems where depth pays off are systems where deeper simulation produces *spatially visible, player-diagnosable consequences* that connect directly to the player's core decisions. Traffic jams you can see on the map. Production bottlenecks you can trace to a missing factory. Population collapses you can attribute to overbuilding. The simulation must close the loop between player action, system response, and observable outcome.

---

## 7. The Feedback Loop Problem

The deepest simulation is worthless if the player cannot understand what it is doing. Legibility --- the ability to read the simulation's state and trace cause-and-effect relationships --- is the bridge between simulation depth and player engagement.

Daniel Cook, writing on game system design, distinguishes between "tight" systems (where cause-and-effect connections are obvious) and "loose" systems (where connections are ambiguous). "Making all systems tight would kill the intrigue and sense of achievement. Making them all loose would give players a feeling of deep confusion." City builders need both: tight systems for the mechanics the player directly controls (I built a road, traffic flows on it), and looser systems for emergent outcomes the player must diagnose (why is this neighborhood's land value dropping?).

Jesse Schell's *The Art of Game Design* (2008) frames this as an interface problem: "A good interface provides good feedback, gives the player satisfying control, and communicates all the information necessary to play the game." For city builders, this translates into a layered information architecture.

**Layer 1: The map itself.** The primary feedback channel. Visual density, building types, road congestion, green space --- a well-designed city builder communicates enormous amounts of state through the map view alone. SimCity's genius was making land value visible through building appearance: shacks in low-value areas, towers in high-value ones.

**Layer 2: Data overlays.** The genre's standard solution for showing simulation internals. Traffic heat maps, pollution clouds, land value gradients, service coverage radii. Overlays work because they are spatial --- they map simulation data onto the same geography the player is already reasoning about. The best overlays reveal *why*, not just *what*: a traffic overlay that shows congestion is useful; one that also shows vehicle origin-destination flows is revelatory.

**Layer 3: Advisors and notifications.** Contextual information that draws attention to problems or opportunities. "Your citizens are complaining about traffic on Main Street." "The industrial district has no water coverage." These work best when they are specific (naming a location or system) and actionable (implying a response the player can take).

**Layer 4: Statistics and graphs.** Time-series data, budget breakdowns, demographic charts. These serve players who want to understand trends and optimize. They are essential for the "optimizer" player type (see section 11) but should never be the primary feedback channel --- if the only way to understand your city is through spreadsheets, the simulation has failed its legibility test.

**The SimCity 2013 failure revisited.** Glassbox's problems were fundamentally legibility problems. The simulation was deep, but players could not build accurate mental models of agent behavior. When power failed to reach a building, was it a bug or a feature? When Sims drove past their own homes, was the simulation modeling some real behavior or was it broken? The player had no way to tell, and the simulation offered no tools to diagnose the issue. Compare this to Skylines' traffic, where the player can click on any vehicle, see where it came from and where it is going, and understand exactly why it is sitting in traffic.

**The design principle:** every simulation system needs a legibility plan. Before implementing a mechanic, answer: how will the player observe this system's state? How will they diagnose problems? How will they trace the connection between their actions and the system's response? If you cannot answer these questions, the system is not ready for implementation --- not because the simulation is wrong, but because the feedback design is incomplete.

---

## 8. Pacing and the Growth S-Curve

City builders share a characteristic pacing problem rooted in the logistics growth curve. Early game is exciting (everything is new, each building matters, unlocks come quickly). Mid-game is engaging but risks repetition (systems are understood, the challenge is optimization and expansion). Late game often stagnates (the city is stable, all systems are unlocked, and there is nothing left to learn).

**Early game: the excitement of constraint.** The best city builders make the early game compelling through scarcity and unlocking. Banished starts you with a handful of citizens and no infrastructure --- every building placement is a life-or-death decision. Skylines gates road types and services behind population milestones, creating a clear progression. Frostpunk begins with a single generator and a dwindling coal supply. The common pattern: early game works because every decision is high-impact (there is nothing redundant in your toolset) and the learning curve is steep (new systems are being introduced faster than the player can master them).

**Mid-game: the management plateau.** Once core systems are understood and the city is self-sustaining, pacing depends on new challenges. Traffic problems emerge as population grows. Budget constraints tighten. Service demands diversify. The risk is that mid-game becomes "more of the same" --- zoning more residential, building more services, extending more roads, without new types of decisions. Games combat this through escalating complexity (Skylines introduces transit and inter-city connections), narrative events (Frostpunk's scouts discover new survivors and new crises), and tier systems (Anno 1800's citizen tiers unlock entirely new production chains and building types). The mid-game challenge is fundamentally about the rate of new system introduction: too fast and the player is overwhelmed; too slow and they are bored.

**Late game: the stagnation problem.** As analysts have noted, "once a city reaches stability, there is little incentive to continue refining it." Late-game city builders struggle because the core loop (place buildings, watch city grow) has diminishing returns once the map is mostly built out. Common solutions include: scenarios with defined endpoints (Frostpunk), escalating difficulty through external threats (Banished's disasters and population aging), mega-projects that redefine the map (Skylines' monuments), and infinite optimization challenges (Workers & Resources' production efficiency). The fundamental problem is that city builders are about *building*, and building has a natural endpoint.

Koster's theory applies directly here: fun is learning, and when the player has learned everything the simulation offers, the fun stops. The solution is not necessarily more simulation (which may just mean more of the same learning at a different scale) but *different kinds* of learning at different stages. Early game: learn placement. Mid-game: learn optimization. Late game: learn systemic mastery or creative expression. Each phase should demand a qualitatively different kind of thinking.

---

## 9. The "Spreadsheet Game" Trap

Deep simulation creates a gravitational pull toward optimization. When every system has measurable outputs, players who want to "win" will inevitably reduce the game to its numbers. The city becomes a spreadsheet with a graphical frontend. Creativity and self-expression get crowded out by efficiency calculations.

This is not inherently bad. Many players enjoy optimization (see section 11). The trap is when optimization becomes the *only* viable playstyle --- when the simulation punishes creative choices so severely that players must min-max to survive. The key distinction, as researchers and designers have noted, is between games where "winning is a personal objective of creative expression" and games where winning demands convergence on a single optimal solution.

**How games fall into the trap:**
- *Single dominant strategies.* If grid layouts always outperform organic ones, players who care about outcomes will always build grids, regardless of aesthetic preference.
- *Harsh failure states.* If suboptimal play leads to irreversible collapse, experimentation is punished. Players stop trying creative solutions and start looking up guides.
- *Opaque optimization targets.* If the player cannot tell what "good" looks like without consulting external tools, the game has effectively outsourced its feedback to wikis and calculators.

**How games avoid the trap:**
- *Multiple viable strategies.* Anno 1800 trends toward equilibrium rather than death spirals, allowing multiple layout approaches to work. There is no single "correct" island design.
- *Aesthetic rewards.* Skylines' screenshot-friendly engine rewards beautiful cities even when they are not optimally efficient. The game's community is as much about city *appearance* as city *performance*.
- *Sandbox modes.* Unlimited money modes let players who want to build creatively do so without economic pressure. This is not a cop-out; it is an explicit acknowledgment that optimization and creativity are different play motivations that may need different rule sets.
- *Soft failure.* Systems that degrade gracefully (lower happiness, slower growth) rather than catastrophically (city bankruptcy, population death spiral) allow suboptimal play to continue. The player is informed that things could be better but is not punished for prioritizing aesthetics over efficiency.

The deeper lesson: simulation depth and creative freedom are not inherently opposed, but they require deliberate design to coexist. The simulation should create *constraints that inspire creativity* (you must solve this traffic problem, and there are many valid solutions) rather than *constraints that eliminate creativity* (there is one correct road layout and all others fail).

---

## 10. Difficulty and Failure

Should city builders be hard? The genre offers a wide range of answers, and the right answer depends on what the game is trying to achieve.

**The survival school: Banished and Frostpunk.** Banished creates difficulty through unforgiving population dynamics. Expand too fast and your citizens starve. Expand too slow and your population ages without replacement. There is no explicit "game over" but there is effective death: a settlement with no children and depleting resources is functionally finished. Frostpunk goes further, with explicit failure states (the generator explodes, hope reaches zero, you are exiled) and a ticking clock that prevents turtling. Both games use difficulty to create meaning: decisions matter because they have real consequences.

**The sandbox school: Cities: Skylines.** Skylines is forgiving by design. Budget problems can be resolved by pausing and adjusting taxes. Traffic problems are frustrating but never city-ending. There is no "game over" screen. Difficulty comes from self-imposed challenges: can you build a city with no traffic problems? Can you reach a million population? Can you build a realistic recreation of Manhattan? The game provides tools and lets players define their own difficulty.

**The narrative school: Frostpunk's moral difficulty.** Frostpunk's hardest moments are not mechanical but ethical. The choice to enact child labor is not hard because the game makes it difficult --- it is hard because the player does not want to do it. As critics observed, the game explores "how willing players are to sacrifice their morals and ideals to achieve a better outcome." The game "doesn't try to punish players for horrifying choices --- players can force children to work, kill injured people instead of treating them, or let explorers die in the ice desert without judgment." The difficulty is internal, not external.

**What failure teaches.** The strongest argument for difficulty in city builders is pedagogical. Failure is the fastest way to learn a system. When your Banished settlement collapses because you built too many houses without enough farms, you learn the relationship between population growth and food production more deeply than any tutorial could teach. Koster's framework predicts this: learning requires challenge, and challenge requires the possibility of failure. But failure must be *legible* failure --- the player needs to understand what went wrong and what they could have done differently. A death spiral that cascades too quickly for the player to diagnose teaches nothing except frustration.

**The difficulty dial.** Most successful modern city builders offer difficulty settings or modes. Skylines has sandbox mode. Frostpunk has difficulty levels. Banished lets you toggle disasters. This is not design cowardice; it is recognition that different players want different relationships with failure. The simulation's depth should be constant across difficulty levels --- what changes is the margin for error.

---

## 11. Player Types and What They Want

City builders attract at least three distinct player archetypes, each with different relationships to simulation depth.

**Builders and painters.** These players care primarily about aesthetics. They want to create beautiful, realistic, or fantastical cityscapes. For builders, simulation is a means to an end: it creates constraints that make the city feel real (buildings need roads, zones need services) but should never prevent the player from achieving their creative vision. Deep simulation is welcome if it adds visual richness (citizens walking on streets, traffic flowing on highways) but unwelcome if it forces ugly-but-optimal layouts. Skylines' move-it mod, which lets players place objects with pixel precision, is the builder's dream tool. Builders are the reason sandbox modes exist and the reason screenshot-sharing communities thrive.

**Optimizers.** These players treat the city as a system to be mastered. They want to understand every mechanic, find optimal layouts, maximize population or revenue, and solve the game's hardest challenges. For optimizers, simulation depth is the game. Shallow simulation means shallow optimization, which means boredom. Workers & Resources: Soviet Republic is an optimizer's paradise: 30+ commodities, realistic transport logistics, and a global market that responds to supply and demand. Optimizers are the players who build spreadsheets, write guides, and datamine simulation formulas. They are also the players most sensitive to balance issues, dominant strategies, and simulation bugs. Deep simulation serves optimizers well, but only if it produces complex, multi-variable optimization problems rather than simple puzzles with single solutions.

**Storytellers.** These players engage with the city as a narrative space. They create backstories for neighborhoods, imagine the lives of citizens, role-play as a specific kind of mayor. RimWorld and Dwarf Fortress cater to storytellers explicitly --- both games produce emergent narratives that players recount and share. For storytellers, simulation depth matters insofar as it produces interesting, surprising, human-feeling outcomes. A citizen who loses their job, cannot find a new one, and ends up in a declining neighborhood tells a story. A population counter that ticks down does not. Storytellers value individual citizen identity, neighborhood character, and the kind of path-dependent history that makes each city unique.

**Serving all three.** The best city builders do not force players to choose. Skylines lets builders place decorative assets, gives optimizers traffic puzzles, and produces enough emergent narrative (a neighborhood that gentrifies, a highway that transforms a district) to engage storytellers. The trick is layered design: a surface that rewards aesthetic play, a middle layer that rewards optimization, and a deep layer that produces narrative. Simulation depth should be distributed across these layers, with the deepest simulation concentrated where it serves the most player types simultaneously.

---

## 12. Lessons for Bitborough

Drawing from the preceding analysis, here are specific recommendations for where Bitborough should invest in simulation depth and where it should simplify.

### Invest in depth: traffic and transportation

Traffic is the genre's most reliable source of emergent gameplay. Bitborough's existing citizen-agent system, with A* routing and cached commute paths, is a strong foundation. Recommendations:

- **Keep individual-agent routing for traffic.** The per-citizen route model produces the kind of visible, diagnosable congestion that players find compelling. The 1:50 sampling ratio is a sensible performance tradeoff.
- **Invest in traffic legibility.** Road-level congestion overlays, vehicle origin-destination data, and commute-length statistics are as important as the simulation itself. Players need to see *why* a road is congested, not just *that* it is.
- **Add incremental transport depth over time.** Public transit, one-way streets, and road hierarchy should be future milestones. Each addition creates new decision types rather than just more of the same.

### Invest in depth: citizen lifecycle

Bitborough's citizen simulation currently tracks home, work, and commerce. The deferred features (birth, aging, death, migration, job markets) represent the genre's second-most reliable source of depth. Recommendations:

- **Add lifecycle before adding economic complexity.** Population dynamics (growth, aging, decline) create pacing and challenge. Economic systems (wages, supply chains) add optimization depth but are harder to make legible.
- **Make citizens visible.** Even at the 1:50 sampling ratio, aggregate citizen data should produce narrative-feeling outputs: "Westside residents have long commutes and low satisfaction." "Downtown is popular with workers but has no commercial access." These summaries turn simulation data into stories.
- **Use lifecycle for pacing.** Population growth should be the primary driver of the early-to-mid-game transition. Aging and decline should drive late-game challenges. The S-curve of city growth should map to a progression of gameplay phases.

### Moderate depth: economy

Economic simulation is a deep well with diminishing returns. Bitborough should simulate enough to create meaningful tradeoffs without falling into the spreadsheet trap. Recommendations:

- **Property tax and basic municipal finance first.** Budget constraints create the genre's fundamental tradeoff: spend on services or save for growth. This requires only moderate simulation depth.
- **Defer production chains.** Anno-style production chains are engaging but represent an enormous design and engineering investment. Bitborough's economy should start with demand-and-supply for basic services and add depth only if the core loop demands it.
- **Make economic feedback spatial.** Land value, tax revenue, and service costs should all be visible on the map. Economic data that only lives in menus is economic data that most players will ignore.

### Simplify: politics and governance

Bitborough should follow the genre consensus and give the player direct control. Recommendations:

- **No council votes, elections, or NPC opposition.** These add friction without adding spatial decisions.
- **Policy choices as direct settings.** Tax rates, service funding levels, and zoning rules should be direct player controls, not negotiated outcomes.
- **Consider moral decisions sparingly.** Frostpunk-style moral choices could work for specific moments (a disaster response, a budget crisis) but should not be the core loop.

### Simplify: social dynamics

While the research corpus includes material on segregation (Schelling model) and social dynamics, these systems are extremely difficult to gamify without trivialization. Recommendations:

- **Represent socioeconomic diversity through citizen satisfaction tiers, not racial or ethnic categories.** Wealth-based differences in housing preference and service demand are gameable. Racial dynamics are not, at least not in a city builder context.
- **Let neighborhood character emerge from mechanics.** If wealthy citizens prefer low-density areas with parks, and poorer citizens cluster near jobs, spatial segregation will emerge naturally without explicit modeling. This is more honest and more gameable than scripted social dynamics.

### Invest in: legibility infrastructure

Before adding any new simulation system, build the feedback tools that make it readable. Recommendations:

- **Overlays for every simulated system.** Traffic, satisfaction, commute length, service coverage, land value. If a system is not visible on the map, it might as well not exist for most players.
- **Contextual notifications.** "Elm Street is congested." "Northside residents cannot reach commercial districts." Specific, spatial, actionable.
- **A statistics panel for optimizers.** Time-series graphs, budget breakdowns, demographic data. Essential for the optimizer audience, optional for everyone else.

### The guiding principle

For each system Bitborough considers modeling, apply the three-part test:

1. **Does it produce decisions?** If the simulation runs itself without player input, it is background flavor, not gameplay. Keep it cheap.
2. **Is it legible?** If the player cannot observe the system's state and trace cause-and-effect, depth is wasted. Build the feedback tools first.
3. **Is it spatial?** City builders are fundamentally about placing things on a map. Systems that produce spatial consequences (traffic, land value, service coverage) earn more complexity budget than systems that produce abstract consequences (citizen happiness as a single number).

Where all three answers are yes, invest in depth. Where any answer is no, simplify until it becomes yes, or abstract the system away entirely.

---

## Sources

### GDC Talks and Developer Resources
- [GDC 2012: Sid Meier on How to See Games as Sets of Interesting Decisions](https://www.gamedeveloper.com/design/gdc-2012-sid-meier-on-how-to-see-games-as-sets-of-interesting-decisions)
- [GDC Vault: Interesting Decisions](https://www.gdcvault.com/play/1015756/Interesting)
- [GDC Vault: Cities: Skylines, A Case Study](https://gdcvault.com/play/1022809/Cities-Skylines-A-Case)
- [GDC Vault: Simulating a City, One Page at a Time (SimCity)](https://gdcvault.com/play/1017708/Simulating-a-City-One-Page)
- [GDC Vault: RimWorld — Contrarian, Ridiculous, and Impossible Game Design Methods](https://www.gdcvault.com/play/1024232/-RimWorld-Contrarian-Ridiculous-and)
- [Crafting a Meaningful Experience: Principles of Frostpunk's Game Design Process](https://www.slideshare.net/slideshow/crafting-a-meaningful-experience-principles-of-frostpunks-game-design-process/122774360)

### Developer Interviews and Postmortems
- [Game Design Deep Dive: Traffic Systems in Cities: Skylines](https://www.gamedeveloper.com/design/game-design-deep-dive-traffic-systems-in-i-cities-skylines-i-)
- [Citystate II: Postmortem — A Lesson in Game Design](https://www.citystategame.com/post/citystate-ii-postmortem-a-lesson-in-game-design-for-city-building-games)
- [Frostpunk: An Analysis of Emotional Narrative Engagement](https://www.gamedeveloper.com/design/frostpunk-an-analysis-of-emotional-narrative-engagement)
- [How Frostpunk Injects Harrowing Moral Choices into the City-Builder Genre](https://brickwallpictures.medium.com/how-frostpunk-injects-harrowing-moral-choices-into-the-city-builder-genre-8536ad222cee)
- [How RimWorld Fleshes Out the Dwarf Fortress Formula](https://www.gamedeveloper.com/design/how-i-rimworld-i-fleshes-out-the-i-dwarf-fortress-i-formula)
- [Interview: Cities Skylines Lead Game Designer Karoliina Korppoo](https://community.simtropolis.com/news/interview-cities-skylines-lead-game-designer-karoliina-korppoo-r791/)
- [Banished Developer Interview: Player Choice in an Indie City Builder](https://www.pcgamer.com/interview-banished-developer-talks-player-choice-in-the-indie-city-builder-sandbox-game/)

### Game Design Books
- Koster, Raph. *A Theory of Fun for Game Design.* O'Reilly Media, 2005. [Official site](https://www.theoryoffun.com/)
- Schell, Jesse. *The Art of Game Design: A Book of Lenses.* CRC Press, 2008. [O'Reilly listing](https://www.oreilly.com/library/view/the-art-of/9781466598645/)
- Sylvester, Tynan. *Designing Games: A Guide to Engineering Experiences.* O'Reilly Media, 2013. [Author site](https://tynansylvester.com/book/)

### Academic and Analytical Sources
- [Systems-Based Game Design in Dwarf Fortress (Lehner, Theseus)](https://www.theseus.fi/bitstream/handle/10024/814557/Lehner_Niilo.pdf)
- [Simulation Principles from Dwarf Fortress — Game AI Pro 2](https://www.oreilly.com/library/view/game-ai-pro/9781482254792/K23980_C041.xhtml)
- [Interpreting Dwarf Fortress: Finitude, Absurdity, and Narrative (Cartlidge, 2024)](https://journals.sagepub.com/doi/full/10.1177/15554120231162418)
- [A Look at the City Builder Genre](https://www.gamedeveloper.com/design/a-look-at-the-city-builder-genre)
- [Gods of the City? Reflecting on City Building Games as an Early Introduction to Urban Systems](https://www.tandfonline.com/doi/full/10.1080/00221341.2015.1070366)
- [Gamespace Urbanism: City-Building Games and Radical Simulations](https://failedarchitecture.com/gamespace-urbanism-city-building-games-and-radical-simulations/)

### Game System Design
- [Building Tight Game Systems of Cause and Effect (Daniel Cook / Lostgarden)](https://lostgarden.com/2012/07/01/building-tight-game-systems-of-cause-and-effect/comment-page-1/)
- [Analysis: Sid Meier's Key Design Lessons](https://www.gamedeveloper.com/game-platforms/analysis-sid-meier-s-key-design-lessons)
- [Cities, Growth, and the Late-Game Slowdown](http://zarkonnen.com/cities_growth_late_game_slowdown)
- [Designing Game Analytics for a City-Builder Game (Korppoo)](https://files.core.ac.uk/download/250137884.pdf)

### Community and Player Analysis
- [Your Complete Guide to the SimCity Disaster (Kotaku)](https://kotaku.com/your-complete-guide-to-the-simcity-disaster-5991077)
- [The Problem Is the Glassbox (Simtropolis)](https://community.simtropolis.com/forums/topic/53963-the-problem-is-the-glassbox/)
- [SimCity: Welcome to the Glassbox Simulation Engine (Simtropolis)](https://community.simtropolis.com/forums/topic/48253-simcity-welcome-to-the-glassbox-simulation-engine/)
- [Why Frostpunk Game Design Is So Good (RetroStyle Games)](https://retrostylegames.com/blog/frostpunk-game-design/)

### Game References
- [Cities: Skylines II — Economy & Production Feature Highlight](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/economy-production)
- [Workers & Resources: Soviet Republic](https://store.steampowered.com/app/784150/Workers__Resources_Soviet_Republic/)
- [Pocket City (Kotaku review)](https://kotaku.com/pocket-city-is-a-damn-fine-city-building-game-1828075635)
- [RimWorld: Sci-Fi Colony Sim](https://rimworldgame.com/)
