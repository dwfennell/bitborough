# Modding and Community Ecosystems

> How modding support and community engagement extend city-builder longevity -- Steam Workshop, custom assets, gameplay mods, and community-driven development.

## Table of Contents

1. [Why Modding Matters for City Builders](#1-why-modding-matters-for-city-builders)
2. [Cities: Skylines as the Gold Standard](#2-cities-skylines-as-the-gold-standard)
3. [SimCity 4 Modding Legacy](#3-simcity-4-modding-legacy)
4. [Asset Creation Pipelines](#4-asset-creation-pipelines)
5. [Gameplay Mods vs. Cosmetic Mods](#5-gameplay-mods-vs-cosmetic-mods)
6. [Map and Scenario Sharing](#6-map-and-scenario-sharing)
7. [Community-Driven Bug Fixing](#7-community-driven-bug-fixing)
8. [The Modding-to-Development Pipeline](#8-the-modding-to-development-pipeline)
9. [Technical Modding Architectures](#9-technical-modding-architectures)
10. [Monetization and Mods](#10-monetization-and-mods)
11. [Community Management](#11-community-management)
12. [Lessons for Bitborough](#12-lessons-for-bitborough)

---

## 1. Why Modding Matters for City Builders

City builders are, more than almost any other genre, defined by the creative agency they give players. The same impulse that drives someone to lay out a transit network or zone a waterfront district drives them to want tools the developer never shipped. Modding is the natural extension of the genre's core promise: *your city, your rules*.

The data backs this up. While most AAA titles experience predictable player drop-offs within months of release, heavily modded games maintain active populations for years or decades [1]. City builders show an even more striking pattern than other genres, because the open-ended nature means there is no "ending" to reach -- mods don't just add content, they redefine what the game *is*.

The most instructive comparison in the genre is SimCity (2013) versus Cities: Skylines (2015). Both shipped as modern city builders targeting the same audience. SimCity launched with always-online DRM, tiny 4 km^2 maps, and minimal mod support. Cities: Skylines launched with Steam Workshop integration, maps up to 36 km^2 of a 100 km^2 total area, and a modding API from day one [2]. SimCity received one expansion pack and a handful of paid cosmetic items before EA effectively abandoned it. Cities: Skylines accumulated over 350,000 Workshop items, received continuous DLC support for eight years, and as of 2025 still drew roughly twice the daily players of its own sequel [3]. The game that treated modding as a first-class feature won the market. The game that locked players in lost it.

This pattern repeats across the genre. Banished (2014) shipped with mod support and its community created the Colonial Charter mega-mod, effectively building a new game on top of the original. Factorio's modding scene has produced total conversions like Space Exploration that extend playtime by hundreds of hours. The economic logic is straightforward: every mod is free content that the developer did not have to build, test, or support. For a small studio, this leverage is not a nice-to-have -- it is a survival strategy.

---

## 2. Cities: Skylines as the Gold Standard

Cities: Skylines is the reference implementation for modding in city builders. As of early 2026, its Steam Workshop hosts more than 358,000 items -- mods, assets, maps, saves, and scenarios -- making it one of the largest Workshop libraries for any game on Steam [4]. Understanding how Colossal Order achieved this is essential for anyone designing a moddable city builder.

### Designed for Modding from Day One

Damien Morello, Colossal Order's graphics and gameplay programmer, explained in a 2015 Game Developer interview that modding was considered from the beginning of the project. The team started actively working on modding tools two months into development. Paradox Interactive, the publisher, always wanted modding as part of the game [5]. The systems were built to be robust enough that the team could extend them later -- which also meant the community could extend them.

### The ICities API

Cities: Skylines exposes a C# modding API through `ICities.dll`. Modders inherit from interfaces like `IUserMod` (to define a mod's name and description) and `ILoadingExtension` (to hook into the game's loading process). The API also provides `IThreadingExtension` for per-frame logic. On Windows, modders can reference `Assembly-CSharp.dll` and `UnityEngine.dll` directly for deeper access, though the official API is intentionally limited to encourage stable, compatible mods [6].

This two-tier architecture -- a narrow official API plus access to the full Unity assembly -- is a deliberate design choice. It gives casual modders a safe surface to work with while letting advanced modders do virtually anything. The tradeoff is that deep mods can break across game updates, but Cities: Skylines' long update cycles gave modders time to adapt.

### The Asset Editor

The built-in Asset Editor lets players create and modify buildings, vehicles, props, and intersections without writing code. Players import 3D models (FBX format), configure properties like footprint size and service radius, and publish directly to the Workshop. This dramatically lowers the barrier to entry: a 3D artist who cannot write C# can still contribute buildings that thousands of players use [7].

### Most Popular Mod Categories

The Workshop breaks down roughly into these tiers by volume:

- **Buildings and props**: The largest category by far. Real-world landmarks (Big Ben, the Eiffel Tower), residential building sets by region and era, commercial storefronts, industrial facilities, and decorative props like trees, fences, and street furniture.
- **Roads and networks**: Custom road types, highway interchanges, roundabouts, rail configurations. Network-related content is disproportionately popular relative to its count because it affects every city.
- **Gameplay mods**: Traffic management, simulation tweaks, UI improvements, loading optimization. Fewer in number but higher in subscriber counts per item.
- **Maps and themes**: Terrain maps (often based on real geography), map themes controlling ground textures and lighting, and save games.
- **Vehicles**: Custom cars, buses, trams, trains, and aircraft with region-specific liveries.

### The TMPE Phenomenon

Traffic Manager: President Edition (TMPE) is arguably the single most important mod in Cities: Skylines history. It addresses the game's most persistent complaint -- its simplified traffic AI -- by adding lane-level traffic control, advanced vehicle pathfinding, customizable junction rules, and a parking AI system [8]. TMPE is maintained as an open-source project on GitHub by the CitiesSkylinesMods organization, with its own website (tmpe.me), documentation, and release process. It is, in effect, an unofficial expansion pack maintained by the community. The mod demonstrates something important: when a core system is weak, the community will build the fix if you give them the tools to do so.

---

## 3. SimCity 4 Modding Legacy

SimCity 4 (2003) offers the most compelling evidence that modding can sustain a game for decades. More than twenty years after release, the SimCity 4 community remains active, producing new content and maintaining complex infrastructure mods.

### The Network Addon Mod (NAM)

The NAM is the flagship mod of the SimCity 4 community. It overhauls the game's transportation network system -- adding new road types, fixing pathfinding bugs, improving intersection behavior, and introducing transit options that Maxis never shipped. The mod is now in its 49th version, with the most recent release (Version 49, revision 1) published in March 2025 [9]. The NAM Team maintains an official documentation site at sc4nam.com and coordinates development through the SC4 Devotion Discord server and a GitHub repository (NAMTeam/Network-Addon-Mod).

The NAM's longevity is remarkable. It has been continuously developed for over two decades by a rotating cast of volunteer developers. On Simtropolis alone, the NAM has accumulated nearly 650,000 downloads and over 1.4 million page views [9]. This is a mod for a game whose developer stopped supporting it in 2004.

### Custom Lots and the BAT

SimCity 4's Building Architect Tool (BAT) -- originally based on the gmax 3D modeling application -- allowed the community to create custom buildings that plug into the game's lot system. The Simtropolis and SC4 Evermore sites host thousands of custom lots covering residential, commercial, industrial, civic, and landmark categories. The BAT workflow has evolved over time; the community has developed BAT4Blender, a modern replacement that works with the open-source Blender 3D editor, keeping the pipeline alive for new creators even as gmax has become obsolete.

### Why It Lasted

SimCity 4's modding longevity comes down to three factors. First, the game's simulation is deep enough that there is always something to improve or extend. Second, Maxis shipped the BAT and Lot Editor as official tools, giving the community a sanctioned creation pipeline. Third, the community self-organized around durable institutions -- Simtropolis (founded 2002), SC4 Devotion, SC4 Evermore -- that outlasted the developer's involvement. These sites still host active forums, file exchanges, and collaborative projects in 2025 [10].

The lesson is clear: a game's modding community can outlive its developer by decades if the tools are good and the community has places to gather.

---

## 4. Asset Creation Pipelines

The single most important modding feature for a city builder is the ability to add custom buildings. Cities are, visually, collections of buildings. A player who can add their own buildings can make their city look like *their* city -- a specific real-world location, a historical era, an architectural fantasy.

### What Makes a Good Asset Pipeline

The best asset pipelines share common traits:

- **Standard import formats**: FBX, OBJ, or glTF for 3D models. Proprietary formats create friction.
- **In-game editors**: Cities: Skylines' Asset Editor and SimCity 4's Lot Editor let creators work within the game itself, seeing real-time previews of how their asset will look in context.
- **LOD (Level of Detail) support**: City builders render hundreds or thousands of buildings simultaneously. Assets need multiple detail levels -- a high-poly version for close-up and a low-poly version for zoom-out. Good pipelines either auto-generate LODs or provide clear guidance on creating them.
- **Property configuration**: Building footprint, service radius, capacity, cost, upkeep, and simulation category (residential, commercial, industrial, civic) should be configurable without code changes. Ideally through a GUI or a human-readable data file (JSON, XML).
- **Workshop integration**: One-click publishing to a distribution platform. If uploading an asset requires manual file management, adoption drops sharply.

### Cities: Skylines Pipeline

The creator models a building in Blender/3ds Max/SketchUp, exports to FBX, imports into the Asset Editor, configures properties (size, type, sub-buildings, effects), generates or imports a LOD model, and publishes to the Workshop. Round-trip time for experienced creators: under an hour [7].

### SimCity 4 Pipeline

SimCity 4 uses the BAT for 3D modeling and rendering, then the Lot Editor to place the building onto a game lot with zoning, capacity, and prop configurations. More manual than Skylines', but durable enough for twenty years. The community's migration to BAT4Blender shows how a committed community modernizes a pipeline when original tools age out.

### Implications for Smaller Projects

A full 3D asset pipeline with in-game editors is expensive to build. For a smaller project, the pragmatic approach is to support a well-documented data format (JSON or TOML definitions for building properties) and a standard image format for 2D sprites or tilesets. If the game reads building definitions from data files rather than hardcoding them, modders can add new buildings by dropping files into a directory. This is the approach taken by many successful indie games: Dwarf Fortress, Cataclysm: Dark Days Ahead, and Stardew Valley all use data-driven architectures that make modding possible without an official editor.

---

## 5. Gameplay Mods vs. Cosmetic Mods

The breakdown between gameplay mods and cosmetic/asset mods in city builders reveals what players want that developers are not providing.

### The Numbers

In Cities: Skylines' Workshop, cosmetic assets (buildings, props, vehicles, trees) vastly outnumber gameplay mods by raw count -- likely 80-90% of all items are assets. But the picture inverts when you look at subscriber counts. The most-subscribed items are overwhelmingly gameplay mods: TMPE, Move It (a tool for precise object placement), Loading Screen Mod (performance optimization), Network Anarchy (road building freedom), and 81 Tiles (which unlocks the full map) [4]. A single gameplay mod can have millions of subscribers. A single building asset might have a few thousand.

### What This Tells Us

The pattern suggests two distinct modding populations:

1. **Creators** (smaller group, high output): 3D artists and builders who produce assets. They are motivated by the creative act itself and by community recognition. They need good tools and a distribution platform.
2. **Players** (larger group, high consumption): Players who subscribe to gameplay mods and curated asset collections. They want the game to work better, look better, and offer more freedom. They need easy installation and compatibility.

For developers, this means gameplay modding support (APIs, hooks, configuration systems) has the highest impact per engineering hour invested. A well-designed traffic API that enables one modder to build TMPE affects millions of players. An asset editor that enables thousands of creators to build assets also affects millions, but requires more total community effort to reach that impact.

### The Quality-of-Life Category

There is a third category that blurs the line: quality-of-life mods. These are not strictly gameplay changes or cosmetic additions -- they fix UI problems, add information displays, improve camera controls, or optimize performance. In Skylines, mods like the Loading Screen Mod and Precision Engineering fall into this category. Their popularity indicates gaps in the base game's polish that the developer either did not prioritize or did not have time to address. Every successful QoL mod is a bug report in disguise.

---

## 6. Map and Scenario Sharing

Maps and scenarios represent a lightweight form of modding that requires no code and minimal technical skill, making them the most accessible entry point for community content creation.

### Terrain Maps

Cities: Skylines includes a map editor that lets players sculpt terrain, place water sources, and define resource deposits. The community has used this extensively to recreate real-world geography -- players can find Workshop maps for hundreds of real cities, river valleys, and island chains. The process often involves importing heightmap data from real-world elevation sources, giving the maps genuine topographic accuracy.

### Scenario and Challenge Sharing

Beyond terrain, communities self-organize around challenges and collaborative projects. Paradox Interactive organized the Global Collaboration project for Cities: Skylines, where different builders worked on the same save file for one week each, then passed it to the next builder. Each participant posted their build on YouTube, creating both content and marketing simultaneously [11].

Community challenges -- "build a profitable city with no highways," "reach 100K population on this island map," "fix this traffic disaster" -- drive engagement and YouTube content. Biffa's "Fix Your City" series, where the YouTuber takes subscriber save files and diagnoses their traffic problems, became one of the most popular Cities: Skylines content formats. The save file is the mod: sharable, remixable, and narratively rich.

### Why This Matters

Map and scenario sharing serves as a funnel. Players start by downloading maps, then try the scenario editor, then maybe create an asset, and eventually some percentage try code modding. Each step is a deeper investment in the game's ecosystem. Designing for this progression -- easy download, easy editor, documented asset pipeline, documented code API -- is designing for community growth.

---

## 7. Community-Driven Bug Fixing

One of the most complicated dynamics in modded games is the community fixing problems that the developer shipped. This is simultaneously a testament to the community's skill and a source of tension about developer responsibility.

### TMPE and Traffic AI

Cities: Skylines' traffic simulation uses a simplified pathfinding model that makes unrealistic decisions: vehicles ignore available lanes, merge chaotically, and sometimes despawn rather than route around congestion. Colossal Order acknowledged these limitations but prioritized other features. The community built TMPE to address them -- adding advanced vehicle AI with pre-calculated routing decisions, lane-level traffic control, and a parking AI system that the base game lacks entirely [8].

TMPE is not a small patch. It is a substantial rewrite of core simulation behavior, maintained by an open-source team on GitHub with a formal release process, bug tracker, and documentation site. It represents hundreds of person-hours of engineering that the developer received for free, in exchange for having shipped the modding tools that made it possible.

### Broken Nodes Detector

Another instructive example is the Broken Nodes Detector mod. Cities: Skylines has a bug where certain road/rail network configurations create "broken nodes" -- invisible corruption in the transport graph that causes vehicles to despawn when they reach certain segments. The base game provides no way to detect or fix these. The Broken Nodes Detector mod scans the network, identifies corrupted nodes and ghost nodes (which cause pathfinding errors), and helps the player repair them [12]. TMPE's own documentation recommends running Broken Nodes Detector as a diagnostic step for traffic problems.

### The Developer's Dilemma

Community bug fixes create an awkward dynamic. If the modding community has already fixed a problem, the developer faces reduced pressure to fix it officially -- but the fix is fragile, dependent on volunteer maintainers, and can break with game updates. When Cities: Skylines II launched without mod support, all the community fixes that players had come to depend on were suddenly unavailable, contributing to the sequel's poor reception [3].

The lesson for developers: do not rely on the community to fix your bugs, but do build the systems that let them fix what you cannot prioritize. And when the community does build something essential, consider incorporating it officially or hiring the person who built it.

---

## 8. The Modding-to-Development Pipeline

Modding communities are talent incubators. The skills required to build a successful mod -- understanding game systems, writing maintainable code, managing a user community, shipping updates on a schedule -- are the same skills required for professional game development.

### Colossal Order's Own History

Colossal Order was founded in 2009 by developers from the mobile game company Universomo. They started with Cities in Motion, a mass transit simulator, learning about community modding through that game and its sequel. By the time they built Cities: Skylines, they understood that modding was not an add-on feature but a core part of the product [13]. CEO Mariina Hallikainen noted in a 2021 Game Informer interview that the most important learning from the Cities in Motion games was understanding the meaning of modding for their games.

### Modders Hired by Colossal Order

Colossal Order has at least four team members with modding backgrounds in Cities: Skylines [14]. The most documented case is MacSergey, author of popular mods including Intersection Marking Tool and Node Controller Renewal, who was hired by Colossal Order to work on modding features in Cities: Skylines II. His experience as a modder gave him direct insight into what made the first game's modding painful and what would make the sequel's modding better [14].

### Creator Pack Partnerships

Starting in 2016, Paradox began engaging modders to create official content packs. The first was an art deco building set by modder Matt Crux, sold as paid DLC with the creator receiving a portion of sales revenue [15]. This "creator pack" model represented a middle path between free community mods and traditional developer-built DLC. It acknowledged that some community creators were producing professional-quality work and deserved compensation, while giving the publisher a content pipeline that scaled beyond the core development team.

### The Broader Pattern

This pipeline is not unique to city builders. Valve hired the modders behind Counter-Strike and Team Fortress. Bethesda has hired from its Elder Scrolls modding community. For any game that supports modding, the community is simultaneously a hiring pool and a product incubator.

---

## 9. Technical Modding Architectures

How a game is built determines how moddable it is. The technical choices made during architecture design -- sometimes years before modding is even discussed -- constrain what the community can do.

### Runtime Code Injection: Harmony

Harmony is a library for patching .NET and Mono methods during runtime via monkey-patching at the IL level. It supports three patch types: **Prefix** (called before the target method, can modify arguments or skip execution), **Postfix** (called after, can modify return values), and **Transpiler** (modifies IL code directly) [16]. Harmony is the backbone of modding in Cities: Skylines, Rimworld, Stardew Valley, Kerbal Space Program, and dozens of other Unity/.NET games. Multiple mods can patch the same method without replacing entire assemblies, though load order still matters in practice.

### Mod Loaders: BepInEx

BepInEx is a universal Unity plugin loader that enables code execution and in-memory patching for games without native modding support. Its layered architecture -- native injection (UnityDoorstop), preloader, and core framework with plugin infrastructure, configuration management, and logging -- integrates HarmonyX for runtime patching [17]. BepInEx makes virtually any Unity game moddable regardless of developer intent. Games like Valheim and Lethal Company have thriving mod scenes built entirely on BepInEx with no official mod support.

### Official Plugin APIs

The alternative to injection-based modding is a designed API: Cities: Skylines' ICities, Factorio's Lua scripting, and Paradox grand strategy event/decision scripting. The developer defines a surface area and the modder works within those constraints. Official APIs trade power for stability -- mods are less likely to break across updates but can only do what the API permits. In practice, successful moddable games offer both: an official API for common use cases and enough runtime access that power users can go deeper.

### Asset Bundles and Data Files

Not all modding is code. Asset modding -- adding buildings, textures, sounds, maps -- requires a different architecture. The common approaches are:

- **Unity Asset Bundles**: Packaged collections of Unity assets (meshes, textures, prefabs) that can be loaded at runtime. Cities: Skylines uses this for Workshop assets.
- **Loose file loading**: The game scans a directory for files in known formats (PNG for textures, JSON for definitions, OBJ for models) and loads them at startup. Simpler to implement, easier for modders to work with, but less performant for large asset counts.
- **Data-driven definitions**: Game entities are defined in text files (JSON, XML, TOML, YAML, Lua tables) rather than compiled code. Adding a new building means adding a new JSON file with the building's properties. This is the most accessible form of modding and the easiest to implement for small teams [18].

### What Makes a Game Moddable

In summary, moddability is not a feature you bolt on at the end. It is an architectural property that emerges from decisions made throughout development:

- Separating data from code (so data can be overridden without recompilation)
- Using standard formats (so tools already exist for creating content)
- Providing hooks at key lifecycle points (loading, updating, rendering)
- Documenting what you expose (so modders don't have to reverse-engineer everything)
- Not obfuscating or stripping your assemblies (so Harmony/BepInEx can work if needed)

---

## 10. Monetization and Mods

The relationship between paid content and free mods is one of the most contentious topics in game communities. City builders have been at the center of several key moments in this debate.

### The Skylines DLC Model

Cities: Skylines shipped at $30 and eventually accumulated over $200 worth of DLC -- major expansions (After Dark, Snowfall, Mass Transit, Industries, etc.), content creator packs, and radio stations. This DLC coexisted with a massive free modding scene. The coexistence worked because the DLC and mods served different roles: DLC added major new systems (tourism, natural disasters, industries) that required deep engine-level changes, while mods added assets, quality-of-life improvements, and tweaks to existing systems [15].

The model succeeded because Colossal Order and Paradox did not try to monetize the same space that modders occupied. They did not sell building packs that competed with free Workshop buildings. They did not charge for traffic fixes. The DLC offered things modders could not easily build (new simulation systems, new map types, new gameplay mechanics), and the mods offered things the developer could not cost-effectively build at scale (thousands of individual buildings, region-specific asset sets, niche gameplay tweaks).

### Creator Packs: The Middle Ground

Creator packs introduced a hybrid model: community creators made the content, Paradox published it as paid DLC, and the creator received a revenue share. Community reaction was mixed. Supporters argued that talented modders deserved compensation for professional-quality work. Critics argued that charging for content similar to what was available free on the Workshop undermined the modding community's ethos [15].

The Cities: Skylines II creator packs intensified this debate. Priced at $7.99 each and criticized for containing less content than the original game's creator packs, they launched alongside a game that still lacked basic mod support -- the very thing that made the original game's community thrive. The timing made the monetization feel extractive rather than collaborative [3].

### Valve's Paid Mods Experiment

In 2015, Valve briefly enabled paid mods on the Steam Workshop for Skyrim. The backlash was immediate and intense, and Valve reversed the decision within days. The controversy established a norm: mods are expected to be free, and monetization must come through voluntary donations or developer-sanctioned creator programs, not a direct Workshop paywall.

### The Sustainable Model

The pattern that works: sell the game and major expansions, support free modding, and optionally create a creator program with transparent revenue sharing. Do not charge for what the community gives away free. Do not gate modding behind paid tools. Do not launch paid content before delivering promised mod support.

---

## 11. Community Management

A modding ecosystem does not sustain itself. It requires active community management across multiple platforms, each serving a different function.

### Platform Roles

**Steam Workshop / Mod Distribution Platform**: The primary download and discovery channel. Frictionless one-click installation is essential. Steam Workshop's integration with the Steam client -- subscribe, auto-download, auto-update -- set the standard that every mod platform is measured against. Paradox's decision to use their own Paradox Mods platform for Cities: Skylines II instead of Steam Workshop was widely criticized for creating unnecessary friction [3].

**Discord**: The real-time coordination layer. Modding teams use Discord for development discussion, bug reporting, and user support. The TMPE team, the NAM team, and individual asset creators all maintain Discord presences. Discord is where problems get diagnosed in minutes rather than days.

**Reddit**: The public discussion layer. Subreddits like r/CitiesSkylines serve as showcases (screenshot posts), help desks (troubleshooting threads), and feedback channels (feature requests, complaints). Reddit threads have high visibility through search engines, making them important for discoverability.

**Forums (Simtropolis, Paradox Forums)**: The long-form knowledge layer. Forums are better than Discord for persistent information -- tutorials, mod compatibility lists, development logs. Simtropolis has sustained the SimCity 4 community for over two decades partly because forum threads are searchable, archivable, and organized by topic [10].

**YouTube and Twitch**: The marketing layer. Content creators are the primary vector through which players discover mods. A YouTuber featuring a mod in a video drives more downloads than any other channel.

### Content Creators as Community Infrastructure

Cities: Skylines has over fifty active YouTube channels [19]. Key figures include Biffa (whose "Fix Your City" series directly drives TMPE adoption), City Planner Plays (an actual professional city planner from Wisconsin, bridging game and professional communities), and detailed builders like Two Dollars Twenty and Imperatur who drive demand for asset mods. Paradox leveraged this ecosystem through events like Red Bull Metropolis, a competitive Cities: Skylines event featuring streamers including Biffa and The Spiffing Brit [20] -- simultaneously entertainment and marketing.

### The Self-Organizing Community

Mature city-builder communities develop their own infrastructure: compatibility guides, load-order recommendations, curated mod collections for new players, and tools like the Compatibility Report mod that automate conflict detection. This self-organization is a sign of community health -- but it also means the community can turn hostile when the developer threatens the ecosystem, as Cities: Skylines II demonstrated.

---

## 12. Lessons for Bitborough

Bitborough is not Cities: Skylines. It is not backed by a publisher with a dedicated modding platform budget, and it does not have a team of dozens. But the principles that make modding work scale down. Here is what is realistic and high-value for a smaller project.

### Tier 1: Data-Driven Building Definitions (High Impact, Low Cost)

The single highest-leverage modding feature for Bitborough is externalizing building definitions to JSON (or TOML) files. If every building in the game -- its name, footprint, cost, upkeep, capacity, service radius, sprite reference, and simulation behavior category -- is defined in a data file rather than hardcoded, then modders can add new buildings by creating new files. No code changes required, no recompilation, no API to learn [18].

This is not just a modding feature -- it is good architecture. Data-driven definitions make the game easier to balance, test, and extend. The modding benefit is a free bonus on top of sound engineering.

### Tier 2: Custom Tile Graphics (Medium Impact, Medium Cost)

If buildings are defined in data files, the next step is allowing custom sprites or tile graphics. Define a convention (buildings reference a sprite name, sprites live in a known directory, format is PNG with transparency) and provide a template sprite sheet with size guides and anchor points. For a tile-based game, this is far more tractable than a full 3D asset pipeline -- the creator needs a 2D image editor, not Blender.

### Tier 3: Scenario and Map Sharing (Medium Impact, Low Cost)

If the game's map state can be serialized to a file, then save-game sharing is nearly free. Players can share interesting starting conditions, challenge scenarios ("fix this bankrupt city"), or showcase builds. A simple export/import mechanism in the UI is enough. If the game ever has Steam Workshop integration, saves and scenarios are the easiest content type to distribute.

### Tier 4: Configuration Modding (Low-Medium Impact, Low Cost)

Expose tuning parameters -- simulation speeds, cost multipliers, growth rates, service thresholds -- in a configuration file. This lets players adjust difficulty, create custom rule sets, or simulate different economic conditions without any code-level modding. It is the cheapest form of gameplay modding to support.

### Tier 5: Code Modding / Plugin API (High Impact, High Cost)

A full plugin API is the most powerful form of mod support but also the most expensive to build and maintain. For a small project, this is a later-stage investment, justified only after the game has players pushing against the limits of data-driven modding. If Bitborough runs on a .NET runtime, Harmony-based modding will be *possible* regardless -- motivated modders will find a way. The pragmatic answer for a small team: do not block it, but do not spend cycles polishing it until demand is proven.

### Community Building on a Small Budget

For community management, start small and focused:

1. **A Discord server** with channels for feedback, bug reports, screenshots, and modding discussion. This is free and sufficient for an early community.
2. **A GitHub repository** (or similar) for tracking issues and accepting contributions. If building definitions are in JSON, community members can submit new buildings via pull request.
3. **Document the data formats**. A single markdown file explaining the building definition schema, sprite conventions, and file structure is more valuable than a polished modding toolkit. Modders will figure out the tools; they need to know the *format*.
4. **Engage with content creators early**. Even a small game benefits enormously from a single YouTuber doing a let's-play. The city-builder YouTube community is always looking for new games to cover.

### What Not to Do

- Do not build a custom mod distribution platform. Use Steam Workshop, itch.io, or a GitHub releases page. The infrastructure is not worth building from scratch.
- Do not gate modding behind a paid tier or special edition. Modding support should be a feature of the base game.
- Do not hardcode data that could live in files. Every hardcoded building, every magic number in the simulation, is a modding opportunity foreclosed.
- Do not promise mod support you cannot deliver. Cities: Skylines II's biggest community relations failure was promising robust modding and launching without it. Under-promise and over-deliver.

---

## Sources

1. [How Modding Communities Are Rewriting the Rules of Game Longevity](https://catch-and-shoot.com/how-modding-communities-are-rewriting-the-rules-of-game-longevity/) -- Catch and Shoot
2. [SimCity vs. Cities: Skylines -- Who Wins?](https://www.escapistmagazine.com/simcity-vs-cities-skylines-who-wins/) -- The Escapist
3. [Cities: Skylines 2 boss says lack of mod support is the 'biggest regret we have'](https://www.pcgamer.com/cities-skylines-2-boss-says-lack-of-mod-support-is-the-biggest-regret-we-have/) -- PC Gamer
4. [26 of the Best Cities Skylines Mods in 2026](https://www.gamespot.com/gallery/best-cities-skylines-mods/2900-6467/) -- GameSpot
5. [If you build it: Colossal Order on Cities: Skylines modding](https://www.gamedeveloper.com/business/if-you-build-it-colossal-order-on-i-cities-skylines-i-modding) -- Game Developer (Gamasutra)
6. [The ICities API -- Cities: Skylines Modding Documentation](https://citiesskylinesmoddingguide.readthedocs.io/en/latest/modding/Development/ICities-API.html)
7. [Asset Editor -- Cities: Skylines Wiki](https://skylines.paradoxwikis.com/Asset_Editor)
8. [TMPE -- Cities: Skylines Traffic Manager: President Edition](https://github.com/CitiesSkylinesMods/TMPE) -- GitHub
9. [Network Addon Mod (NAM) -- Simtropolis](https://community.simtropolis.com/files/file/26793-network-addon-mod-nam-cross-platform/)
10. [Simtropolis Community](https://community.simtropolis.com/) -- SimCity 4, Cities: Skylines, and city-building community since 2002
11. [Global Collaboration 2022 Map -- Steam Workshop](https://steamcommunity.com/workshop/filedetails/?id=2870556593)
12. [Broken Nodes Detector -- GitHub](https://github.com/CitiesSkylinesMods/BrokenNodeDetector)
13. [How Colossal Order touched the clouds: the making and success of Cities: Skylines](https://www.pcgamesn.com/cities-skylines/how-colossal-order-touched-the-clouds-the-making-and-success-of-cities-skylines) -- PCGamesN
14. [How two Cities: Skylines modders turned hobbyist work into life-changing careers](https://www.pcgamer.com/how-two-cities-skylines-modders-turned-hobbyist-work-into-life-changing-careers/) -- PC Gamer
15. [Cities: Skylines Studio CEO Talks Development, Mod Community, and Six Years of Success](https://gameinformer.com/interview/2021/03/13/cities-skylines-studio-ceo-talks-development-mod-community-and-six-years-of) -- Game Informer
16. [Harmony -- A library for patching .NET and Mono methods during runtime](https://harmony.pardeike.net/) -- Andreas Pardeike
17. [BepInEx -- Unity / XNA game patcher and plugin framework](https://github.com/BepInEx/BepInEx) -- GitHub
18. [How to make your games moddable](https://www.gamedev.net/blogs/entry/2270892-how-to-make-your-games-moddable/) -- GameDev.net
19. [50 Cities Skylines YouTubers You Must Follow in 2026](https://videos.feedspot.com/cities_skylines_youtube_channels/) -- Feedspot
20. [Red Bull Metropolis: UK and Ireland streamers to take part in competitive Cities: Skylines event](https://esports-news.co.uk/2021/08/06/red-bull-metropolis-uk-ireland-streamers-cities-skylines-event/) -- Esports News UK
