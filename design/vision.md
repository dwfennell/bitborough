# RCity Vision

## Core Concept
A faithful SimCity (1989) clone that evolves into something with Dwarf Fortress-level depth and emergent complexity. Start simple, grow slowly, let complexity emerge naturally.

## Design Pillars

### 1. Faithful Foundation
Replicate the original SimCity experience first. Zones, infrastructure, budget, disasters. Get the feel right before adding new systems.

### 2. Deep Simulation
Every system should simulate real processes, not just abstract numbers. Traffic is individual cars. Power flows through wires. Water pressure matters. This enables emergent behavior.

### 3. Surprising Depth
Players should discover new layers the longer they play. A casual player sees a city builder. A dedicated player discovers interconnected systems that create unexpected outcomes.

### 4. Readable Complexity
Dwarf Fortress-level depth doesn't mean Dwarf Fortress-level UI. Information should be layered - simple at a glance, detailed on inspection.

### 5. Slow Growth
Add one system at a time. Make sure each system is solid and interesting before adding the next. Resist feature creep.

## The Core Problem (Koster Framework)

Per [GENERAL_GAME_DESIGN_PHILOSOPHY.md](./GENERAL_GAME_DESIGN_PHILOSOPHY.md), fun = mastery of problems.

**RCity's core problem:** Spatial resource allocation under constraints.
Where do you put things, given limited money, space, and competing demands?

**Why it stays unsolved:**
- Demand shifts as the city grows
- Delayed feedback (decisions take time to show effects)
- Scale transitions (what works at 10k fails at 100k)
- Emergent behavior from interacting systems

**The toy:** The simulation itself. Watching a city live and breathe is inherently interesting, even without explicit goals.

See [core-loops.md](./core-loops.md) for detailed loop analysis.

## Development Philosophy
- Playable at every stage
- Each feature should introduce or deepen a *problem*, not just add content
- Complexity emerges from simple rules interacting
- AI-generated art allows rapid iteration
- Clear feedback at every layer so players can learn

## Long-term Vision Ideas (Future)
- Individual citizen simulation (jobs, homes, commutes)
- Dynamic economy with supply chains
- Political systems and citizen demands
- Historical progression through eras
- Procedural events and narratives
- Mod support for custom simulations
