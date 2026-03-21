# Progression and Pacing

> How city builders create satisfying gameplay arcs -- unlock systems, growth curves, and the art of keeping players engaged from village to metropolis.

## Table of Contents

1. [The City-Builder Growth Curve](#1-the-city-builder-growth-curve)
2. [Population Milestones](#2-population-milestones)
3. [Unlock Systems](#3-unlock-systems)
4. [Economic Progression](#4-economic-progression)
5. [Density as Visual Progression](#5-density-as-visual-progression)
6. [The Mid-Game Problem](#6-the-mid-game-problem)
7. [Late-Game Challenges](#7-late-game-challenges)
8. [Scenario/Campaign vs. Sandbox](#8-scenariocampaign-vs-sandbox)
9. [Speed Controls and Time Pressure](#9-speed-controls-and-time-pressure)
10. [Replayability](#10-replayability)
11. [Session Structure](#11-session-structure)
12. [Lessons for Bitborough](#12-lessons-for-bitborough)

---

## 1. The City-Builder Growth Curve

Every city builder follows a recognizable arc. The specifics differ -- SimCity 4's arc is not Tropico 6's arc -- but the emotional shape is remarkably consistent across the genre. Understanding each phase, what it feels like, and how long it should last is the foundation of good pacing design.

### Phase 1: The Founding Rush (0-30 minutes)

The player starts with empty land, a budget, and a handful of tools. This is the highest-agency moment in the game. Every decision matters visibly: the first road determines the city's shape, the first zone attracts the first residents, the first power plant makes everything come alive.

Emotionally, this phase is pure creative optimism. The player is sketching a vision. SimCity's original designer Will Wright described it as "painting with systems" -- the player sees possibility in every tile. Stone Librande's GDC 2013 talk on SimCity emphasized documenting the game as "arcs over time," and the founding rush is the steepest upward slope on that arc [1].

The founding rush should last roughly 15-30 minutes. Shorter than that and the player never gets to plan; longer and the initial excitement dissipates before anything interesting happens. Cities: Skylines nails this -- within 10 minutes of starting, you have a functioning (if tiny) town with roads, zones, and services beginning to fill.

### Phase 2: Infrastructure Building (30-90 minutes)

The initial settlement works, but barely. Power keeps cutting out, there is no fire coverage, traffic is already backing up at the single intersection. The player transitions from creator to problem-solver. Each service they add -- police, fire, healthcare, transit -- solves a visible problem and introduces a new cost line in the budget.

This phase is satisfying because the feedback loop is tight: identify problem, spend money, see improvement. The player is learning the game's systems through direct cause and effect. Anno 1800 excels here by structuring its entire early game around a needs chain -- Farmers need fish and clothing, Workers need sausages and bread -- where each satisfied need visibly upgrades the population tier and unlocks new production chains [2].

### Phase 3: The First Crisis (60-120 minutes)

Something breaks. A fire spreads through an unprotected district. The budget goes negative. Traffic gridlocks and commercial zones start losing customers. This is the game's first real test of the player's understanding.

The first crisis is a critical design moment. Too harsh and it punishes new players unfairly; too gentle and the player never feels the weight of their decisions. SimCity 4 handled this with graduated consequences -- low approval ratings and declining tax revenue rather than instant failure. Cities: Skylines uses the "death wave" as an emergent crisis: buildings constructed at the same time age together, and when they die simultaneously the city's services are overwhelmed [3].

The first crisis should arrive between the 45-minute and 2-hour mark, depending on game speed. It must be survivable but instructive.

### Phase 4: Expansion (2-6 hours)

The player has internalized the core systems and now applies them at scale. New districts, transit networks, and specialized zones. Cities: Skylines' milestone system feeds new tools into this phase at a steady cadence, ensuring the player always has something new to try [4].

### Phase 5: Optimization (6-20 hours)

Growth slows. The player's focus shifts from expansion to efficiency: maximizing land value, perfecting traffic flow, eliminating service gaps. The rate of visible change drops. Games that handle this well provide clear metrics (traffic flow percentages, budget graphs) that make invisible improvements feel tangible.

### Phase 6: Stagnation or Mastery (20+ hours)

The city runs itself. The player either finds satisfaction in fine-tuning, sets new self-imposed goals, or stops playing. This phase is discussed in detail in Section 6.

### Timing Summary

| Phase | Duration | Primary Emotion | Design Goal |
|-------|----------|----------------|-------------|
| Founding Rush | 15-30 min | Creative optimism | Immediate agency and visible results |
| Infrastructure | 30-90 min | Purposeful problem-solving | Tight feedback loops |
| First Crisis | 1-2 hours | Tension, then relief | Test understanding without punishment |
| Expansion | 2-6 hours | Confident growth | Steady drip of new tools and challenges |
| Optimization | 6-20 hours | Analytical satisfaction | Clear metrics for invisible improvements |
| Mastery/Stagnation | 20+ hours | Completion or boredom | Endgame systems or graceful exit |

---

## 2. Population Milestones

Population is the universal scoreboard of city builders. It is the one number every player watches, and virtually every game in the genre uses it as a gating mechanism for progression. But how that gating works varies enormously, and the design choices around population milestones have a direct impact on pacing.

### SimCity's Legacy: Named Tiers

The original SimCity (1989) established the template that persists today. The SNES version made it explicit: Village (start), Town (2,000), City (10,000), Capital (50,000), Metropolis (100,000), Megalopolis (500,000). Each tier unlocked special gift buildings -- the bank at low funds, police and fire headquarters for building enough stations, a Mario statue at Megalopolis [5]. These were not just rewards; they were functional tools. The bank provided loans; the headquarters extended service coverage. The milestone told you "you are progressing," and the reward gave you a new capability at the moment you needed it.

SimCity 4 refined this with a two-axis system: density (Low, Medium, High) and wealth (Low $, Medium $$, High $$$). Low-density buildings topped out at stage 3. Medium density only appeared after the relevant population class reached 1,114. High density required 25,952 [6]. This was invisible gating -- the player never saw a "you unlocked medium density" message. Buildings simply started appearing taller as the city grew. The implicit milestone felt organic; the city evolved rather than leveled up.

### Cities: Skylines' Milestone System

Colossal Order made the gating explicit and generous. The original Cities: Skylines had population-threshold milestones from "Tiny Village" through "Megalopolis." Each milestone unlocked new service buildings, policy options, land tiles, and a cash reward. The system was simple and effective: it ensured players did not face the full complexity of the game at minute one while providing a steady stream of new toys [4].

Cities: Skylines II overhauled this with a two-layer system: Milestones plus Development Trees. Milestones are earned through Expansion Points (XP), accumulated both passively (from population and happiness) and actively (from placing buildings and roads). Each milestone awards Development Points that players spend in branching skill trees to unlock specific advanced buildings [7]. This was a deliberate response to a common complaint about the original: players felt forced down a single progression path. The development tree gives agency over what you unlock next -- do you invest in better transit or advanced healthcare?

### What Milestones Do Well

**Complexity gating.** Milestones introduce tools when the player has enough context to use them -- you unlock the fire station around the time fires become a risk. **Goal-setting.** Population targets give aimless sandbox play concrete direction. **Reward pacing.** Cash and tool rewards create mini-celebrations that break up the long arc.

### What Milestones Do Poorly

**Artificial gates.** When the player knows what they want but cannot build it because of an arbitrary population number, the system frustrates. Cities: Skylines' "Unlock All" mod was among the Workshop's most popular. **Linear progression.** Real cities do not develop in a fixed sequence; Cities: Skylines II's development trees partially address this. **Population as proxy.** Population is imprecise -- a player can reach 50,000 through sprawl with no transit, then suddenly unlock transit tools they should have used hours earlier.

---

## 3. Unlock Systems

Beyond population milestones, city builders use several approaches to gate complexity and drip-feed new mechanics.

### The Drip-Feed Approach

Most commercial city builders start simple and layer in complexity. In Anno 1800, this is structural: the game's five population tiers (Farmers, Workers, Artisans, Engineers, Investors) are a cascading unlock system. Each tier introduces new needs, new production chains, new buildings, and new strategic considerations. A player cannot skip to Engineers without first building the entire supply chain for Artisans below them [2]. This is arguably the most elegant unlock system in the genre because it is diegetic -- the progression is the city's economic development, not a gamified XP bar.

### All-at-Once (Sandbox)

SimCity 4 gave players everything from the start (aside from density caps based on invisible population thresholds). This respected player autonomy but created a steep learning curve. New players placed expensive buildings they could not maintain, went bankrupt, and quit. Experienced players loved it because they could execute their vision without waiting for arbitrary gates.

The tension between these approaches is one of the genre's core design challenges. The solution most games have landed on: offer both. Guided mode for new players, sandbox/unlock-all for veterans. Cities: Skylines' toggle and SimCity's difficulty settings serve this dual audience.

### Tech Trees

Cities: Skylines II's development trees represent the genre's most explicit adoption of a strategy-game tech tree [7]. Each city service (transportation, healthcare, fire, police, education, electricity, water, communications, garbage) has its own tree with branching paths. You might unlock bus transit first, then choose between rail or air transport for your next investment.

The advantage of tech trees is player agency within structure. The game still controls pacing (you cannot rush the entire tree), but the player controls direction. The disadvantage is that tech trees can feel game-y in a simulation context -- real cities do not research technologies; they raise capital and build infrastructure.

### Needs-Based Progression

Anno 1800 solves the unlock problem through simulation. Farmers need fish, clothing, and schnapps. Providing these allows houses to upgrade to Workers, who need sausages, bread, soap, and beer. The chain extends to Investors demanding champagne and steam carriages [2]. Every unlock requires supporting infrastructure -- you cannot rush to Engineers without a functioning economy below them. The unlock is a consequence of mastery, not a metric reward.

### Hybrid Approaches

Against the Storm uses meta-progression outside individual runs -- players earn permanent unlocks at the Smoldering City hub [8]. This ensures each new settlement has more tools, while individual runs feature within-session progression through randomly dealt blueprint cards.

---

## 4. Economic Progression

The economic arc of a city builder is, in many ways, the real progression system. Population milestones and building unlocks are visible markers, but the budget is what drives decision-making at every phase of the game.

### The Scarcity Phase

Every city builder begins with scarcity. The player has a starting fund (typically enough for basic infrastructure) and a ticking clock of maintenance costs. SimCity's original design made this explicit: without sufficient money, you cannot build the infrastructure for an ideal city, so you save up from taxes and purchase services one at a time [9]. This scarcity creates meaningful trade-offs. Do you build the fire station now (preventing catastrophic loss) or a new residential zone (generating future tax revenue)? Every dollar spent has an opportunity cost.

The scarcity phase typically lasts 1-3 hours, depending on difficulty settings. It should feel tight but not punishing. A player who makes reasonable decisions should never go bankrupt during the scarcity phase. Going bankrupt should require active mismanagement.

### The Transition to Sustainability

At some point, monthly revenue exceeds monthly costs with a comfortable margin. The player stops checking the budget every few minutes and starts thinking in terms of projects rather than transactions. This is a subtle but important shift in the gameplay experience -- the emotional register changes from survival to ambition.

Games that handle this transition poorly create what economist and game designer Geoffrey Hill calls "the engine for racking up points vs. a foundation for flourishing outcomes" dilemma [10]. If the budget becomes trivially positive too quickly, the economic system stops driving interesting decisions. If it stays tight too long, the player feels punished for growing.

### The Surplus Problem

Late-game city builders almost universally suffer from budget surplus. Tax revenue scales with population while costs scale sub-linearly. Abundance eliminates trade-offs -- when the player can afford everything, building decisions lose their weight.

Solutions vary: SimCity (2013) used regional great works requiring enormous investment. Cities: Skylines offered expensive late-game monuments. Anno 1800's upper tiers require expensive imported goods, creating ongoing costs that scale with city size. Tropico uses political instability as a non-monetary cost that money alone cannot solve.

The most effective approaches make money necessary but insufficient. When the constraint shifts from "can I afford this?" to "where should I put this, and what will the consequences be?", the game stays engaging despite surplus. Games that surface the budget arc through history graphs and annual reports give economic progression emotional resonance.

---

## 5. Density as Visual Progression

Density is the city builder's most powerful visual reward. When a block of single-family homes transforms into a cluster of mid-rise apartments, or when a downtown district sprouts its first skyscraper, the player sees their city becoming a city. No other progression mechanic has this much emotional impact per pixel.

### How Density Works Across Games

**SimCity 4** used a stage system with eight stages for residential and commercial buildings. Stage 1-3 were small houses and shops. Stage 4-5 were mid-rise structures. Stage 6-8 were towers and skyscrapers. Crucially, higher stages only appeared when the relevant population class reached specific thresholds (1,114 for medium density, 25,952 for high density) [6]. Building stage was also influenced by desirability: high-wealth zones near parks and waterfronts grew taller and more architecturally distinct than low-wealth zones in polluted areas.

The two-axis system (density x wealth) created enormous visual variety. A low-density, high-wealth neighbourhood looked like Beverly Hills -- mansions with large lots. A high-density, low-wealth neighbourhood looked like public housing -- tall towers packed tightly. This visual differentiation made the simulation legible: you could read the city's economic geography just by looking at it.

**Cities: Skylines** simplified density to two explicit zone types (low and high) chosen by the player. High-density zones attracted taller buildings but also generated more traffic and required more services. The player's choice of where to place high density was a meaningful strategic decision rather than an emergent outcome [3].

**Cities: Skylines II** introduced mixed-use and medium-density zones, filling a gap that the community had long requested. The three-tier system (low, medium, high) creates a more gradual visual progression.

### Why Density Feels Like Achievement

Density works as a reward because it is emergent. The player does not click a "build skyscraper" button; they create the conditions for skyscrapers to appear. This indirect causation is more satisfying than direct placement because it validates system-level thinking. There is a parallel to gardening: you create the conditions for growth, and when growth happens, you feel responsible even though you did not directly cause it.

### Density as Spatial Narrative

The physical layout of density tells the city's growth story. Dense downtown cores surrounded by rings of decreasing density follow patterns described by the Alonso-Muth-Mills urban economics model. SimCity 4 naturally produced this monocentric city model -- dense center, sprawling suburbs -- because high-density buildings required population thresholds and desirability radiated from commercial cores. No design constraint forced it; the simulation produced it.

---

## 6. The Mid-Game Problem

The mid-game problem is the city-builder genre's defining weakness. After the initial build-out -- the founding rush, the infrastructure phase, the first crisis, and the early expansion -- many players stop playing. The city works. What now?

### Why Engagement Drops

The root cause is a shift from **creation** to **maintenance**. Ryan Young identifies this structural problem: "players build everything they want, clicking buttons to place structures wherever desired," and once that completes, the creative driver is gone [11]. Troy Goodfellow argues that the genre's core loop naturally reaches a stable state where neither success nor failure is likely [12]. The tight feedback loop that drove the early game weakens as systems become self-sustaining.

### Steam Data: Where Players Stop

Steam achievement data illustrates the drop-off. In Cities: Skylines, "Tiny Town" (1,200 population) has a far higher completion rate than "Grand City" (36,000). SteamSpy estimates 10-20 million owners, but concurrent players hover around 9,000-10,000 [13]. This is not a failure -- city builders are finite creative canvases, and many players are satisfied once their city "works."

### How Games Combat the Mid-Game Problem

**Disasters.** SimCity's earthquakes and tornadoes force the player back into crisis mode. Effective only if recovery is interesting (rebuilding a district), not tedious (replacing identical buildings).

**New Areas.** Cities: Skylines' tile-purchasing system gates map expansion, creating mid-game moments of "opening up new land" that recapture the founding rush.

**Scenarios.** SimCity's scenarios (fix Tokyo's traffic, rebuild San Francisco) give the player a problem to solve. Tropico's mission structure avoids mid-game stagnation by ending each island before it sets in.

**DLC.** Cities: Skylines sustained engagement through DLC (mass transit, industries, airports) that effectively reset progression for existing cities. A business model solution to a design problem, but effective.

**Against the Storm's Structural Solution.** Settlements are temporary -- 30-60 minute runs that end in success or failure. The game repeatedly delivers the founding rush and first crisis (the most engaging phases), while meta-progression between runs provides long-term goals [8]. Eremite Games' designer noted at GDC 2023 that this emerged from asking "what is the most interesting part of city builders?"

---

## 7. Late-Game Challenges

For players who persist past the mid-game, city builders present a distinct set of late-game challenges. These are often the most technically demanding aspects of both the game design and the underlying simulation.

### Traffic at Scale

Traffic is the late-game challenge that defines Cities: Skylines. Karoliina Korppoo and the team at Colossal Order built an agent-based traffic simulation where every vehicle is persistent and individually pathfinding [14]. At small city sizes, this creates charming realism. At large city sizes, it becomes the game's dominant system -- and its primary source of both frustration and deep engagement.

The Gamasutra deep dive on Cities: Skylines' traffic system explains the core tension: "The agent system brutally punishes players for suboptimal road configurations, and much of the mid and late game revolves around resolving the inevitable traffic jams" [14]. Traffic is an emergent consequence of every other decision the player made: where they placed residential zones relative to commercial and industrial, how they designed intersections, whether they invested in public transit.

Traffic works as a late-game challenge because it scales non-linearly with city size. A city of 10,000 has manageable traffic. A city of 100,000 has traffic problems that require fundamental restructuring of road networks. This non-linear scaling ensures that the problem gets harder as the player gets more skilled, maintaining the flow state balance between challenge and ability.

### Budget Complexity

Late-game budgets involve dozens of service categories, variable tax rates, loan payments, and aging infrastructure. The challenge shifts from "can I afford this?" to "how do I allocate across competing priorities?" Games that surface breakdowns by district and service category give analytical players optimization opportunities; games that hide everything behind a single balance number lose engagement.

### Performance and Simulation Fidelity

The most insidious late-game challenge is one the player cannot solve: simulation slowdown. Cities: Skylines' simulation slowed on large cities. Cities: Skylines II launched with performance problems that dominated its early reception [15].

There is a fundamental tension between fidelity and performance. Agent-based simulation creates emergent behavior but scales poorly; abstract models scale well but feel mechanical. Citybound demonstrated that optimized agent simulation could handle 400,000 cars in real-time [16], suggesting the ceiling is partly an engineering problem. But even with perfect performance, the design question remains: does a city of 4 million need individual agents, or do statistical models produce equivalent gameplay at a fraction of the cost?

### Endgame Content

The best late-game content creates new optimization dimensions: SimCity's arcologies introduced entirely new rules, Cities: Skylines' monuments required specific achievement conditions, and Anno 1800's Investors demanded complex cross-session trade routes for champagne, jewelry, and steam carriages [2] -- qualitatively different logistics than early game.

---

## 8. Scenario/Campaign vs. Sandbox

City builders exist on a spectrum from pure sandbox (SimCity 4, Cities: Skylines) to structured campaign (Anno 1800's story mode, Tropico 6's missions). The choice between these modes profoundly affects progression and pacing.

### Campaign Advantages

**Structured learning.** Anno 1800's campaign introduces mechanics systematically, following the Trelawney family through their industrial ambitions while teaching every core system [17].

**Focused goals.** Tropico 6's missions each have specific objectives and modifiers -- one might allow piracy economics; another might prohibit building houses [18]. These constraints force creative problem-solving that sandbox mode never demands. Each mission is 2-4 hours, short enough to avoid mid-game stagnation.

**Narrative motivation.** When the player has a story reason to build, the "why am I doing this?" question never arises.

### Campaign Disadvantages

**Constrained creativity.** Campaigns that tell you what to build undermine the genre's core appeal. **Low completion rates.** Tropico 6's forums reveal few players finish all missions; the best missions have interesting modifiers, while generic "reach X" missions feel like busywork [18]. **Limited replay value.** A campaign can only be played fresh once.

### The Hybrid Approach

Anno 1800 added standalone scenarios separate from the campaign: shorter, focused on specific systems, designed for players who want structure without multi-hour commitments [17]. The most successful modern city builders offer campaign, sandbox, scenarios, and challenges -- recognizing that different players (and the same player at different moments) want different levels of structure.

---

## 9. Speed Controls and Time Pressure

City builders are fundamentally about the relationship between the player's decision-making and the passage of simulated time. How the game handles time -- whether it is real-time, pausable, or turn-based -- shapes every aspect of the experience.

### The Pause-Plan-Execute Pattern

Most city builders are technically real-time but practically pausable. Shamus Young describes this as "real time with pause" -- "most of the user's gameplay will be done during pauses, with the 'real time' bit mostly just to show you how things turned out from those decisions" [19]. This works because city building is fundamentally a planning activity. Flow state research confirms that optimal engagement requires matching challenge to skill [20]; the pause button ensures the player has time to meet spatial and economic planning challenges.

### Speed Settings

Each speed setting serves a different player state: **Pause** is for thinking and layout design. **Normal (1x)** is for observing the simulation react. **Fast (2-3x)** is for waiting on funds, construction, or population growth. **Ultra-fast (4x+)** is rare in the genre but useful for experienced players. Games that restrict speed options frustrate players caught in the wrong state for the available speed.

### Time Pressure

Some city builders introduce external time pressure: Tropico's election cycles, Frostpunk's approaching storm, Against the Storm's storm cycle. Moderate time pressure prevents analysis paralysis; excessive pressure creates frantic gameplay that undermines the genre's contemplative appeal. Frostpunk threads this needle by putting pressure on the timeline while allowing moment-to-moment pausing for planning.

At the other extreme, games like Tiny Glade and Townscaper eliminate time pressure entirely, demonstrating that "the calm of creation" [21] is a legitimate play mode for players who build to unwind.

---

## 10. Replayability

City builders are theoretically infinite -- you can always start a new city -- but in practice, players restart far less often than they play individual sessions. Understanding what motivates a restart versus a continuation is critical for designing long-term engagement.

### Why Players Start Over

**Knowledge application.** The most common restart motivation is applying lessons learned. "Now I know how traffic works, so I will design my road network differently." The appeal is not new content but new application of existing knowledge.

**Fresh creative canvas.** Existing cities carry the weight of past decisions -- suboptimal roads, poorly placed services, awkward zones. Starting fresh lets the player build without legacy constraints.

**New maps and terrain.** Procedural maps ensure each start presents unique geographic challenges. Manor Lords' community notably requested procedural maps at launch, recognizing that terrain variety is essential for spatial problem-solving [22].

**Mechanical changes.** After patches or DLC, players restart to experience updated mechanics from the beginning.

### Procedural Generation and Roguelite Structure

Procedural generation is the most direct driver of replayability. Against the Storm takes it further by randomizing available buildings, resources, and objectives each run, preventing any single optimal strategy [8].

Against the Storm also makes "starting over" the intended experience rather than failure. Each 30-60 minute settlement run feeds into meta-progression (permanent upgrades at the Smoldering City), compressing the genre's typical 20-hour arc into repeatable sessions. This model has influenced a wave of roguelite city builders.

### Self-Imposed Challenges

Experienced players generate replayability through constraints: public-transit-only cities, zero pollution, realistic zoning. The modding community extends this further -- Cities: Skylines' Workshop offered hundreds of thousands of custom assets and gameplay modifications that kept the game relevant for a decade.

---

## 11. Session Structure

How long is a typical city builder session? How do games handle the transition between sessions? The answers to these questions affect retention, satisfaction, and the overall pacing experience.

### Session Length and Flow

City builder sessions run long. The genre naturally fulfills Csikszentmihalyi's flow conditions: clear goals, immediate feedback, and challenge matched to skill [20]. A player who sits down for 30 minutes frequently looks up after two hours.

The genre's "one more turn" is "one more district" or "one more problem to fix." Each completed task reveals a new task (the new district needs a fire station; the fire station strains the budget; the budget needs a tax adjustment), creating an unbroken chain of engagement.

### Save/Resume Design

The critical question: what state does the player return to? A city mid-crisis creates a hostile resume experience; a city in steady-state creates a directionless one. Games that handle resume well provide a "state of the city" summary on load -- population, budget trend, recent events, pending problems -- helping the player reconstruct their mental model.

### The "One More Turn" Effect

Unlike Civilization's turn structure, city builders have no natural stopping points. The simulation runs continuously with something always happening. This creates deep immersion but makes it hard to stop in a state of satisfaction. Games that provide periodic "check-in" moments -- end-of-year reports, milestone celebrations, advisor summaries -- create artificial stopping points that let the player close the game feeling complete rather than interrupted.

### Ideal Session Targets

| Session Type | Duration | Design Support |
|-------------|----------|---------------|
| Quick check-in | 15-30 min | Autosave, state summary on load, minor tasks available |
| Standard session | 1-3 hours | Natural task arcs (build a district, solve a problem) |
| Deep session | 4-8 hours | Major milestones, expansion into new areas |
| Marathon | 8+ hours | Flow state, minimal interruption, automate where possible |

Good session design supports all four types. The player who has 20 minutes should find something meaningful to do. The player who has 6 hours should not hit a wall of tedium.

---

## 12. Lessons for Bitborough

Bitborough's existing systems -- three density tiers, occupancy-based upgrades, desirability scores, citizen agents, and a monthly budget with loans -- already contain the ingredients for satisfying progression. The question is how to sequence, pace, and surface them. The following recommendations are based on the genre analysis above, mapped to Bitborough's specific mechanics.

### 12.1 Define Explicit Pacing Phases

Bitborough currently has implicit phases: the player places roads and zones, waits for buildings to fill, upgrades roads for medium density, places transit stops for high density. These phases should be made legible to the player through UI feedback.

**Recommendation:** Track a hidden "city phase" variable (Founding, Growing, Established, Thriving, Metropolis) based on population, density distribution, and service coverage. Use it to drive advisor hints, ambient audio changes, and UI celebrations. Do not gate mechanics behind phases -- keep the sandbox feel -- but acknowledge the player's progress.

The phase thresholds can align with the existing building registry's natural breakpoints:
- **Founding:** 0-100 residents (all low-density, no services)
- **Growing:** 100-500 residents (first services, paved roads appearing)
- **Established:** 500-2,000 residents (medium density emerging, budget becoming sustainable)
- **Thriving:** 2,000-10,000 residents (high density appearing, transit stops active)
- **Metropolis:** 10,000+ residents (dense core, complex traffic, surplus budget)

### 12.2 Front-Load the Founding Rush

The first 15 minutes must produce a functioning village. Bitborough's current flow -- place diesel plant, lay dirt roads, zone residential/commercial/industrial, wait for buildings -- is structurally correct. But the occupancy fill rate (FILL_RATE = 0.12/month) means buildings take many simulated months to fill. At normal game speed, the player may wait a long time before seeing meaningful population.

**Recommendation:** Consider a "founding boost" modifier that increases fill rate during the first 6-12 simulated months or until population reaches 100. This makes the founding rush feel responsive without changing long-term balance. Alternatively, tune the game speed defaults so that the first year passes quickly.

### 12.3 Use Density as the Primary Reward

Bitborough's three-tier density system (Low, Medium, High) with infrastructure prerequisites (paved roads for Medium, transit stops for High) is well-designed for pacing. The key is ensuring the density transitions feel earned and visually dramatic.

**Recommendation:** When a building upgrades density, briefly highlight it with a visual effect (flash, particle burst, construction animation). The player should notice every upgrade. Consider a running counter ("12 Medium-density buildings, 3 High-density") in the info bar. Drawing from SimCity 4's approach, the visual difference between density tiers should be stark -- low-density buildings should look fundamentally different from high-density buildings, not just slightly taller.

The existing design doc's building size progression (1x1 Low, 1x1/2x1 Medium, 2x2 High for residential) already creates this visual contrast. Ensure the art reinforces it.

### 12.4 Design the First Crisis

Bitborough's desirability system creates natural crises: a neighbourhood without police coverage has high crime, which lowers desirability, which drains residents, which can trigger dereliction. But this crisis may arrive too gradually to feel like a crisis.

**Recommendation:** Introduce a "tipping point" notification when a building drops below 50% occupancy. Frame it as an advisor warning: "Residents are leaving the north district -- crime is too high." The player needs to connect cause (missing police station) with effect (population loss) quickly enough to act before dereliction sets in. The 3-month low-occupancy window before dereliction provides time to respond, but only if the player is aware of the problem.

### 12.5 Combat Mid-Game Stagnation

Bitborough's current mechanics provide the tools to fight mid-game stagnation, but they need intentional sequencing. The mid-game gap typically appears after the player has placed all basic services and before high density becomes achievable.

**Recommendations:**
- **Density as mid-game content:** The Medium-to-High density transition should be the mid-game's primary driver. Place transit stops, watch the neighbourhood densify, observe the traffic implications of concentrated population. This is a whole new round of the build-observe-adjust loop.
- **Industrial automation tension:** The existing design where high-density industrial produces more tax revenue but fewer jobs creates a mid-game strategic dilemma. Surface this through the UI: "Industrial output up 400%, but unemployment rising." The player must respond with more commercial zones or risk residential exodus.
- **Budget milestones:** When monthly revenue crosses specific thresholds, unlock new cosmetic or quality-of-life improvements (parks are already in the game; future additions like plazas, fountains, or landmarks could serve this role).

### 12.6 Make Traffic the Late-Game Challenge

Bitborough's citizen agent system, where each citizen has cached routes between home, work, and commerce buildings, naturally produces traffic as an emergent late-game challenge. As population grows and density concentrates, road segments near dense cores will become congested.

**Recommendation:** Traffic should become the dominant challenge only after the player has achieved high density. At low and medium density, traffic should be manageable with basic road networks. At high density, the player should need to rethink their road hierarchy. This mirrors Cities: Skylines' progression arc and ensures that traffic complexity arrives when the player has the experience to engage with it productively.

### 12.7 Session Design for Bitborough

Given Bitborough's monthly tick system, natural session boundaries should align with simulated time:

- **Short session (15-30 min):** Place a few buildings, advance a few months, check on a developing neighbourhood. The game should display a meaningful summary on load ("6 buildings upgraded to Medium density last year; north district occupancy rising").
- **Standard session (1-2 hours):** Build a new district, solve a service coverage gap, upgrade infrastructure for a density transition.
- **Deep session (3+ hours):** Achieve a major density milestone, redesign traffic for a growing core, manage the industrial-to-commercial economic transition.

**Recommendation:** Implement periodic "city report" summaries (quarterly or annually in game time) that surface key statistics: population change, density distribution, budget trend, top problems. These serve as both information tools and natural pause points.

### 12.8 Replayability Through Map Generation

Bitborough already has procedural map generation (`packages/map-gen`). The genre analysis confirms this is the single most important replayability feature. Different terrain forces different city layouts, which produces different traffic patterns, which requires different infrastructure strategies.

**Recommendation:** Ensure map presets offer meaningfully different geographic constraints: coastal maps with limited buildable land, mountain maps with elevation-constrained road networks, island maps requiring bridge infrastructure, flat plains maps that enable sprawl. Each preset should change the optimal strategy, not just the aesthetics.

### 12.9 Avoid Over-Gating

Bitborough's current design wisely avoids hard milestone gates. Density upgrades are driven by occupancy and infrastructure proximity, not by arbitrary population thresholds. This organic approach is stronger than explicit unlock systems for a simulation-focused game.

**Recommendation:** Resist the temptation to add a formal milestone/unlock system. The existing infrastructure prerequisites (paved roads gate Medium, transit stops gate High) already pace the game effectively. If anything, add more infrastructure types as prerequisites for future features (water treatment for pollution control, schools for education bonuses) rather than population-number gates.

### 12.10 Speed Control Defaults

**Recommendation:** Offer at least four speed settings (Pause, 1x, 2x, 4x). Default to 2x. New players should see their city develop at a pace fast enough to maintain engagement but slow enough to observe. Experienced players will use 4x for waiting periods and Pause for planning. Ensure the simulation remains stable at 4x -- dropping frames or producing inconsistent results at high speed undermines player trust.

---

## Sources

1. Stone Librande, ["Simulating a City, One Page at a Time"](https://gdcvault.com/play/1017708/Simulating-a-City-One-Page), GDC 2013. Presentation slides: [stonetronix.com/gdc-2013/SimCity-OnePage.pdf](https://stonetronix.com/gdc-2013/SimCity-OnePage.pdf)
2. ["Population"](https://anno1800.fandom.com/wiki/Population) and ["Needs"](https://anno1800.fandom.com/wiki/Needs), Anno 1800 Wiki.
3. Karoliina Korppoo, Antti Lehto, and Damien Morello, ["Game Design Deep Dive: Traffic Systems in Cities: Skylines"](https://www.gamedeveloper.com/design/game-design-deep-dive-traffic-systems-in-i-cities-skylines-i-), Gamasutra/Game Developer, March 2015.
4. ["Milestones"](https://skylines.paradoxwikis.com/Milestones), Cities: Skylines Wiki.
5. ["SimCity SNES Guide"](https://peterthedj.com/simcity-snes/), PetertheDJ.com; ["SimCity Strategy Guide"](https://gamefaqs.gamespot.com/snes/588657-simcity/faqs/20252), GameFAQs.
6. ["Density"](https://simcity.fandom.com/wiki/Density), SimCity Wiki; ["SimCity 4 Stage Caps"](https://infinitemirai.wordpress.com/2012/01/05/sim-city-4-stage-caps/), The Infinite Zenith; ["SimCity 4/Zoning and Demand"](https://strategywiki.org/wiki/SimCity_4/Zoning_and_Demand), StrategyWiki.
7. ["Cities: Skylines II Feature Highlight #10: Game Progression"](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/game-progression), Paradox Interactive; ["Development Diary #10: Game Progression"](https://forum.paradoxplaza.com/forum/threads/development-diary-10-game-progression.1596392/), Paradox Forums.
8. ["How Against the Storm managed to mix city-building and roguelite play"](https://www.gamedeveloper.com/business/how-against-the-storm-managed-to-mix-city-building-and-roguelite-play), Game Developer; ["How Against The Storm injects dark roguelike fantasy into a city builder"](https://www.shacknews.com/article/135267/against-the-storm-gdc-2023-interview), Shacknews (GDC 2023 interview).
9. Josh Bycer, ["A Look at the City Builder Genre"](https://www.gamedeveloper.com/design/a-look-at-the-city-builder-genre), Game Developer.
10. Geoffrey Hill, ["Rethinking Economy-Building Video Games"](https://openresearch.ocadu.ca/id/eprint/3557/1/Hill_Geoffrey_2021_MDes_SFI_MRP.pdf), OCAD University, 2021.
11. Ryan Young, ["The Problem with City-Building Games"](https://youngryan.com/2014/03/the-problem-with-city-building-games/), 2014.
12. Troy Goodfellow, ["A Few Thoughts on City Builders and End Games"](https://flashofsteel.com/index.php/2015/01/14/a-few-thoughts-on-city-builders-and-end-games/), Flash of Steel, January 2015.
13. [Cities: Skylines stats](https://steamspy.com/app/255710), SteamSpy; [Cities: Skylines Steam Charts](https://steamcharts.com/app/255710).
14. Korppoo et al., "Game Design Deep Dive: Traffic Systems in Cities: Skylines" (see source 3).
15. [Cities: Skylines II Steam Charts](https://steamdb.info/app/949230/charts/), SteamDB.
16. ["Citybound"](https://aeplay.org/citybound), Anselm Eickhoff. Performance claims from developer documentation.
17. ["Anno 1800 Game Modes Explained"](https://chillplacegaming.com/anno-1800-game-modes/), Chill Place Gaming; ["The Scenarios of Anno 1800"](https://www.matchstickeyes.com/2022/04/24/the-scenarios-of-anno-1800-adding-a-new-side-to-the-game/), Matchsticks for My Eyes, April 2022.
18. ["Missions (Tropico 6)"](https://tropico.fandom.com/wiki/Missions_(Tropico_6)), Tropico Wiki; ["Why so few people completed the campaign missions?"](https://steamcommunity.com/app/492720/discussions/0/600778060484111217/), Steam Community discussion.
19. Shamus Young, ["This Dumb Industry: Real Time With Pause"](https://www.shamusyoung.com/twentysidedtale/?p=32829), Twenty Sided, 2015.
20. Mihaly Csikszentmihalyi's Flow theory applied to game design: ["Flow in Games (and everything else)"](https://www.researchgate.net/publication/220421228_Flow_in_games_and_everything_else), ResearchGate; ["Flow Theory -- Game Design Toolkit"](https://tkdev.dss.cloud/gamedesign/toolkit/flow-theory/); ["The Flow Theory Applied to Game Design"](https://thinkgamedesign.com/flow-theory-game-design/), Think Game Design.
21. ["The Calm of Creation: Why City-Building Games Are Perfect for Gamer Dads"](https://www.crazykinux.ca/2024/09/the-calm-of-creation-why-city-building.html), CrazyKinux's Musings, September 2024.
22. ["Procedural maps not an option... Tragic...."](https://steamcommunity.com/app/1363080/discussions/0/4362376876612022941/), Manor Lords Steam Community discussion; general procedural generation analysis from [itch.io city builder tag](https://itch.io/games/tag-city-builder/tag-procedural).
