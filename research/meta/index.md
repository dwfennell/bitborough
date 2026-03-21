# Meta-Research: City-Builder Games

Analysis of the city-builder game genre — history, mechanics, design patterns, and lessons for Bitborough. Complements the [real-world city mechanics research](../index.md) with game-specific knowledge.

**11 documents** | ~6,500 lines | ~55,000 words

## Documents

### History & Context

- [genre-history-and-evolution.md](./genre-history-and-evolution.md) — SimCity (1989) through Cities: Skylines 2, Tropico, Anno, Banished, Manor Lords. Key innovations, sales data, what each title proved about the genre.

- [indie-and-experimental-builders.md](./indie-and-experimental-builders.md) — Banished, Foundation, Frostpunk, Ostriv, Manor Lords, Terra Nil, Timberborn, Islanders. How smaller studios innovate with gridless design, survival mechanics, and niche themes.

### Design Analysis

- [mechanics-comparison.md](./mechanics-comparison.md) — Side-by-side comparison of how 8 major titles implement zoning, economy, traffic, citizens, services, utilities, progression, failure states, modding, and UI.

- [simulation-depth-vs-fun.md](./simulation-depth-vs-fun.md) — The tension between realism and gameplay. Abstraction spectrum, emergent vs. scripted play, the "interesting decision" framework, player types.

- [progression-and-pacing.md](./progression-and-pacing.md) — Growth curves, unlock systems, density as visual reward, the mid-game problem, late-game challenges, speed controls, replayability.

- [ui-and-information-design.md](./ui-and-information-design.md) — Overlays, dashboards, advisors, query tools, notifications, toolbars, camera, color language, audio, onboarding.

- [modding-and-community.md](./modding-and-community.md) — Steam Workshop ecosystems, modding architectures (Harmony, plugin APIs), asset pipelines, community-driven bug fixing, the TMPE phenomenon, lessons for smaller projects.

### Technical Deep Dives

- [simcity-internals.md](./simcity-internals.md) — Micropolis source code analysis (16-phase sim loop, SetValves RCI demand, BFS power, random-walk traffic), SimCity 4 trip generation, GlassBox agent architecture and why it failed.

- [cities-skylines-internals.md](./cities-skylines-internals.md) — Manager pattern architecture, A* traffic pathfinding, citizen lifecycle, building level-up, TMPE's Dynamic Lane Selection, CS2's ECS/DOTS attempt and performance failures.

- [open-source-city-sims.md](./open-source-city-sims.md) — Deep dives into Micropolis (actual Java code), OpenTTD YAPF pathfinder (cost tables, segment caching), Citybound (Rust actors), A/B Street (discrete event sim), Egregoria, OpenLoco, CorsixTH, FreeCol. Includes a reusable code pattern catalog.

- [simulation-architecture-patterns.md](./simulation-architecture-patterns.md) — Statistical vs. agent-based simulation, tick loops, layer buffers, spatial indexing, demand models, pathfinding at scale, utility propagation, service coverage, serialization, performance scaling.
