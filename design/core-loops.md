# Core Loops & Problems

Applying Koster's framework: what problems are players solving?

---

## The Fundamental Problem

**Spatial resource allocation under constraints.**

You have limited money, limited space, and competing demands. Where do you put things? This is the same problem as:
- Chess (position pieces for advantage)
- Tetris (fit shapes in space)
- Tower defense (place defenses optimally)

The "dressing" is city building, but the core is optimization under constraints.

---

## Primary Loops

### Loop 1: Zone & Grow (The Core Toy)
```
Place zone → Wait → See what develops → Evaluate → Adjust
```

**Problem:** Where should zones go to maximize development?

**Uncertainty sources:**
- Demand fluctuates (R/C/I ratios shift)
- Development is probabilistic, not deterministic
- Nearby factors affect outcomes (land value, pollution, traffic)

**Feedback:**
- Visual: buildings appear, density increases
- Numerical: population, tax revenue
- Comparative: this zone thrived, that one stagnated

**Why it stays unsolved:** The optimal layout depends on factors that change as the city grows. Early good decisions become constraints later.

---

### Loop 2: Infrastructure Network
```
Identify bottleneck → Build connection → Observe flow → Find new bottleneck
```

**Problem:** How do you connect everything efficiently?

**Sub-problems:**
- Road connectivity (graph theory)
- Power grid coverage (spanning tree)
- Traffic flow (network capacity)

**Uncertainty sources:**
- Demand changes as city grows
- New developments create new bottlenecks
- Budget limits force tradeoffs

**Why it stays unsolved:** The network that works for 10k population fails at 50k. You're always retrofitting.

---

### Loop 3: Budget Balance
```
Set taxes/funding → Observe effects → Adjust → Repeat
```

**Problem:** How do you balance income vs expenses vs growth?

**Tension triangle:**
- High taxes → more money, slower growth
- Low funding → cheaper, worse services, decline
- Spending → immediate benefit, long-term debt

**Uncertainty:** Economic feedback is delayed. You won't know if this year's budget was right until next year.

**Why it stays unsolved:** The optimal budget changes with city size, composition, and goals.

---

### Loop 4: Crisis Response
```
Disaster occurs → Assess damage → Respond → Rebuild → Prevent future
```

**Problem:** How do you recover from setbacks?

**Uncertainty:** Disasters are random (or triggered by neglect). You can't fully prepare.

**Why it's fun:** Breaks routine, creates stories, tests your systems.

---

## Secondary Loops (Emerge from Primary)

### Traffic Management
Emerges from: Zone placement + Road network
```
Congestion appears → Analyze patterns → Add capacity or reroute → New congestion elsewhere
```

### Land Value Optimization
Emerges from: All loops
```
Notice low-value area → Identify cause → Intervene (parks, services, remove pollution) → Values shift
```

### Service Coverage
Emerges from: Budget + Zone growth
```
Crime/fire risk rises → Place station → Adjust funding → Coverage changes
```

---

## The Meta-Loop (Long-term)

```
Build city → Hit limits → Understand why → Rebuild/expand → Hit new limits
```

This is the "one more turn" loop. Each city teaches you something. The next city, you'll do better... but face new problems at larger scale.

---

## Sources of Uncertainty (Keep it Unsolved)

1. **Demand fluctuation** - R/C/I demand shifts based on city state
2. **Probabilistic development** - Zones don't develop identically
3. **Delayed feedback** - Effects of decisions take time to manifest
4. **Emergent traffic** - Patterns you didn't predict
5. **Disasters** - Random disruption
6. **Scale transitions** - What works at 10k breaks at 100k
7. **Competing goals** - Growth vs sustainability vs aesthetics

---

## The Dwarf Fortress Layer

SimCity 1's loops are relatively shallow. The "DF layer" adds:

### Individual Simulation
Each citizen is an agent with needs. Now "residential demand" isn't abstract—it's Maria needing an apartment near her job.

**New problems:**
- Commute optimization (per citizen)
- Housing market matching
- Employment matching

**New uncertainty:** Emergent behavior from thousands of agents.

### Economic Simulation
Money flows through the city. Businesses have supply chains.

**New problems:**
- Supply chain optimization
- Market dynamics
- Wage/price equilibria

**New uncertainty:** Economic emergent behavior (booms, busts, shortages).

### Political Simulation
Citizens have opinions and organize.

**New problems:**
- Approval management
- Competing interest groups
- Policy tradeoffs

**New uncertainty:** Social dynamics, protests, elections.

---

## Design Implications

1. **Each milestone should introduce a new problem or deepen an existing one** - Not just add content.

2. **Feedback must be clear at each layer** - Players need to see cause and effect to learn.

3. **Uncertainty should increase with city size** - Small cities are learnable. Large cities stay surprising.

4. **The simulation is the toy** - Goals are optional. Watching the city is inherently interesting.

5. **Avoid "solved" states** - If there's one optimal city layout, the game dies. Ensure tradeoffs.
