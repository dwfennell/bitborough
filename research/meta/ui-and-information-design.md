# UI and Information Design in City Builders

> How city-builder games present complex simulation data — overlays, dashboards, advisors, and the art of making systems legible.

## Table of Contents

1. [The Information Challenge](#1-the-information-challenge)
2. [Map Overlays](#2-map-overlays)
3. [Dashboards and Panels](#3-dashboards-and-panels)
4. [Advisor Systems](#4-advisor-systems)
5. [Query and Inspect Tools](#5-query-and-inspect-tools)
6. [Notification Systems](#6-notification-systems)
7. [Toolbar and Tool Selection](#7-toolbar-and-tool-selection)
8. [Camera and Navigation](#8-camera-and-navigation)
9. [Color Language](#9-color-language)
10. [Audio as Information](#10-audio-as-information)
11. [Tutorial and Onboarding](#11-tutorial-and-onboarding)
12. [Lessons for Bitborough](#12-lessons-for-bitborough)
13. [Sources](#sources)

---

## 1. The Information Challenge

A city-builder game is, at its core, a dashboard problem. The simulation tracks dozens of interconnected systems — power grids, traffic flow, crime rates, land values, budgets, zoning demand, fire coverage, pollution, water supply, employment, education, healthcare — and the player must understand the relationships between them well enough to make informed decisions. The fundamental tension is between depth and clarity: simulate too little and the game feels shallow; expose too much data and the player drowns.

This is not a hypothetical concern. The history of the genre is littered with examples on both sides. SimCity (2013) was criticized for oversimplifying its simulation, hiding causal relationships behind a polished UI that left players unable to diagnose why their city was failing. Dwarf Fortress, for over a decade before its 2022 Steam release, had all the simulation depth anyone could want but wrapped it in an ASCII interface that constituted a genuine barrier to entry. When Bay 12 Games partnered with Kitfox Games to redesign the UI for the Steam version, the result was instructive: even with clickable tabs, scrollbars, and proper visual design, players still complained about "clicker hell" — too many menus, not enough compact data representation, too many clicks to reach critical information (Dwarf Fortress Steam community discussions, 2022-2023).

The lesson is that information design in city builders is not a cosmetic concern. It is structural. The UI determines what the player can perceive, and what the player can perceive determines what strategies are available. A traffic overlay that clearly distinguishes "moderate congestion" from "gridlock" changes how a player thinks about road layout. A budget panel that shows monthly cash flow as a time-series chart changes how a player thinks about tax policy. The UI is not a window onto the simulation — it is the simulation, as far as the player is concerned.

Chi Chan, the UI Art Director on SimCity (2013), articulated this principle directly: "The dashboard of the HUD extends into the world where the environments are part of the UI system, giving constant feedback to the player." In his design, almost all objects in the world were actually UI elements providing feedback. Buildings changed appearance based on their state. Roads showed congestion through visual cues. The world itself was a data visualization. This layered approach — where the game world, overlays, panels, and notifications form concentric rings of information — has become the standard architecture for city-builder UI (Chi Chan, SimCity UI Design portfolio).

The challenge, then, is not "how do we show data" but "how do we create a hierarchy of attention." The player needs to absorb ambient information passively (the city looks healthy, traffic is flowing), notice problems when they emerge (a district turning red, a budget line going negative), and drill into detail when they choose to investigate (clicking a building, opening a statistics panel). This requires careful design at every layer: the base visual state of the world, the overlay system, the dashboard panels, the notification pipeline, and the tools for direct inspection.

## 2. Map Overlays

Map overlays are the primary tool for making spatial data legible. They answer the question "where" — where is crime highest, where does power reach, where is traffic congested, where is land value peaking. Because city builders are fundamentally spatial games, overlays are often the most important information channel.

### How Overlays Work

The basic pattern is consistent across games: the player toggles an overlay mode, and the normal map rendering is replaced or augmented with a color-coded visualization of a specific data layer. The map geometry remains the same — streets, buildings, and terrain are still visible — but colors shift to represent data values. Typically, a gradient maps low-to-high values onto a color spectrum: blue-to-red for land value, green-to-red for traffic, transparent-to-opaque for coverage areas.

SimCity 4 established many of the conventions still in use. Its "Data Views" displayed diagnostic information as colored overlays across the map, covering crime, education, traffic, land value, pollution, and more. The overlays used semi-transparent fills over the existing terrain, with a legend explaining the color mapping. The SC4 Devotion Encyclopaedia documents these as "pipe overlays" in the code — visualization definitions that render agent data using a standardized handler (SC4D Encyclopaedia, "Data View" entry).

Cities: Skylines refined this into what it calls "Info Views" — a set of toggle buttons in the top-left corner of the screen. Each info view transforms the map into a mode-specific visualization. The traffic view colors roads by congestion level. The land value view colors zones by desirability. The key design decision in Skylines was to make info views feel like a different "lens" on the city rather than a layer drawn on top of it — the entire rendering shifts to a more diagrammatic style, reducing visual noise from buildings and terrain to make the data layer more prominent.

### Color Schemes and Gradients

The choice of color gradient is a surprisingly high-stakes decision. Traffic overlays almost universally use a green-yellow-orange-red progression, borrowing directly from traffic engineering conventions. This works because it maps onto players' existing mental model: green means go, red means stop. Land value overlays tend to use blue-to-red or cool-to-warm gradients, where blue represents low value and red represents high value.

The critical design constraint is that overlays must be readable when rendered on top of varied terrain and building geometry. This requires careful attention to opacity — too transparent and the data is invisible against busy terrain; too opaque and the player loses spatial context. Most games settle on 40-70% opacity with a slight desaturation of the underlying map when an overlay is active.

### Toggle UX

How players switch between overlays matters more than it might seem. SimCity 4 buried its data views in a menu, requiring multiple clicks to switch between them. Cities: Skylines put info view buttons directly in the main UI, reducing the toggle to a single click. This seemingly small difference has a large impact on how often players check overlays. If switching is friction-free, players develop a habit of "scanning" — quickly toggling through several overlays to build a mental picture of city health. If switching requires menu navigation, players only check overlays when they already suspect a problem, which means they miss problems that would have been obvious with a quick scan.

The ideal overlay UX supports three behaviors: quick toggle (single click or hotkey), rapid comparison (switch between overlays without returning to normal view), and persistent access (the overlay stays active while the player pans, zooms, and even places buildings).

## 3. Dashboards and Panels

Where overlays answer "where," dashboards answer "how much" and "how fast." They present aggregate and temporal data — total population, monthly revenue, demand trends, service budgets — in forms that are difficult to convey spatially.

### What Gets a Panel

Not all data deserves a dedicated panel. The design question is: what data requires comparison, trend analysis, or direct manipulation? Budget data almost always gets a panel because players need to see income versus expenses, adjust tax rates, and allocate service funding — all of which require precise numerical display and interactive controls. Population data often gets a panel because players need to see growth trends over time, not just the current snapshot.

Conversely, data that is primarily spatial — crime distribution, power coverage, traffic density — is better served by overlays than panels. A panel showing "average crime rate: 34%" is far less useful than an overlay showing which neighborhoods are dangerous.

### Chart Types

City builders use a limited vocabulary of chart types, and for good reason. Line charts dominate for time-series data: population over time, treasury balance over time, demand fluctuations. They excel at showing trends and inflection points — the moment revenue starts declining, the month population growth stalled.

Bar charts appear in comparative contexts: income versus expenses, demand across zone types (residential vs. commercial vs. industrial). The classic SimCity "RCI meter" — three colored bars showing demand for each zone type — is perhaps the most iconic chart in the genre. Its genius is compression: three bars convey the single most important strategic question in the game (what should I zone next?) at a glance.

Pie charts are notably rare in city builders, and for good reason. The data that matters in city-building games is about change over time and comparison between categories, neither of which pie charts handle well. Budget breakdowns occasionally appear as pie charts, but even these are more commonly rendered as stacked bars or simple line items.

### Snapshot vs. Time-Series

The distinction between "what is the current state" and "how has the state changed" is a fundamental design decision for every data point. Current population is a snapshot. Population over the last 50 months is a time series. Both are useful, but for different decisions. The snapshot tells you whether you need more housing right now. The time series tells you whether your growth rate is sustainable.

The best panels present both: a prominent current value (large number, top of panel) with a small sparkline or chart showing the trend behind it. This dual presentation lets the player glance for the snapshot and study for the trend without needing to switch views.

## 4. Advisor Systems

Advisor systems represent a fundamentally different approach to information delivery: instead of the player pulling data through overlays and panels, the game pushes recommendations through an anthropomorphized interface. The player is not studying a dashboard — they are listening to a character.

### History and Evolution

The first advisor in the SimCity franchise appeared in the SNES port as Dr. Wright, a character referencing series creator Will Wright. SimCity 2000 expanded this to a panel of advisors covering different departments, though they were poorly received — they mostly popped up to complain without offering actionable guidance. SimCity 3000 significantly improved the system by giving advisors full names, detailed briefings, and specific recommendations tied to current city conditions. SimCity 4 went further with animated advisor characters whose expressions reflected the city's state — a visual shorthand for "things are going well" or "things are falling apart" (SimCity Wiki, "Advisor" entry).

Tropico's advisor system takes a different approach entirely. Rather than departmental specialists, Tropico uses politically-flavored characters — a communist revolutionary, a capitalist mogul, a military general — who offer competing advice that reflects their factional interests. The humor of the advisors (acknowledged by players and reviewers as a defining feature of Tropico's personality) serves a design purpose: it makes the advice memorable and gives players a reason to engage with the system even when they do not need guidance.

Anno 1800 introduced the newspaper as a quasi-advisor system. Every issue includes three articles highlighting empire milestones — settling new islands, advancing population tiers, changing diplomatic status. Crucially, newspaper articles have gameplay consequences: proposed articles carry a global happiness modifier (+5 or -5), and the player can spend influence to suppress negative stories. This turns the notification system into a strategic decision rather than passive information consumption (Anno Union DevBlog, "Breaking News" entry).

### Proactive vs. Reactive

The core design question for any advisor system is whether it should be proactive (pushing information before problems occur) or reactive (providing analysis after problems are detected). Proactive advisors risk annoying players who already know what they are doing. Reactive advisors risk arriving too late to prevent cascading failures.

The most successful implementations are contextual: they stay silent when things are going well and speak up when specific thresholds are crossed, but before the situation becomes unrecoverable. SimCity 3000's advisors would alert you to rising crime before it triggered a population exodus, giving you time to build police stations. This "early warning" pattern respects the player's autonomy while still providing genuine value.

The failure mode is over-eagerness. If advisors comment on every minor fluctuation, players learn to ignore them — the "boy who cried wolf" problem. The SimCity 2000 advisors suffered from this: their constant complaints trained players to dismiss the advisor panel entirely, which meant genuinely critical warnings were missed alongside the noise.

### Petitioners

SimCity 3000 and SimCity 4 introduced petitioners — citizens who approach the mayor with specific requests and problems. Unlike advisors, who represent institutional perspectives, petitioners represent individual experiences. A petitioner might complain about a specific intersection, request a park in their neighborhood, or warn about a developing situation. This grounds abstract data in human-scale narrative, making the information more engaging and easier to remember. The challenge is implementation cost: meaningful petitioner dialogue requires content authoring that scales with simulation complexity.

## 5. Query and Inspect Tools

Query tools are the inverse of overlays and dashboards: instead of showing aggregate data across the city, they show detailed data about a single entity. The player clicks on a building, a road segment, or a citizen, and receives a focused information panel.

### Building Inspection

SimCity 4's query tool was comprehensive: clicking any building revealed its type, density, land value, desirability factors, power status, and the positive and negative influences affecting it. This last element — showing the specific factors raising or lowering a building's desirability — was particularly powerful for learning the simulation. A player could click a struggling commercial building and see that it was being depressed by "high crime" and "no transit access," immediately suggesting corrective actions.

Cities: Skylines took a different approach, showing building information in a tooltip-style popup that appeared on hover or click. The information was simpler — building type, level, residents/workers, happiness — but was presented inline without opening a separate panel, reducing context-switching cost.

### Citizen Detail

Cities: Skylines made an unusual and memorable design choice: every citizen in the city is a named individual with a tracked daily routine. Players can click on any citizen, see their name, age, education level, workplace, home, and current activity, and follow their commute through the city. This feature has limited strategic value — individual citizen data rarely changes a macro-level decision — but it has enormous emotional value. It transforms abstract population numbers into recognizable characters and gives players a reason to care about the neighborhoods they build.

Banished, a survival-focused colony builder, made individual citizen tracking a core mechanic rather than a novelty. With a small population where every worker matters, Banished's UI allows players to assign each citizen to specific jobs, track their health and happiness individually, and monitor their paths through the settlement. The professions panel and toggleable citizen path overlays give players granular control. The design tension in Banished is that the multiple data panels needed for this tracking can obstruct the game scenery, particularly on smaller screens (Banished Interface Guide, gamepressure.com).

### What Level of Detail Is Useful?

The answer depends on the game's scale and systems. In a game simulating millions of citizens (SimCity, Cities: Skylines), individual detail is flavor, not strategy. In a game simulating dozens to hundreds (Banished, Frostpunk), individual detail is critical. The UI should match the simulation's granularity: if individual citizens are mechanically important, the query tool should make individual data easy to access and act on. If citizens are statistical abstractions, the query tool should focus on building-level and district-level information that the player can actually respond to.

## 6. Notification Systems

Notification systems handle the urgent and the ephemeral: events that demand attention now, problems that are developing, milestones that have been reached. They are the most interrupt-driven element of city-builder UI, and the most prone to causing frustration.

### Notification Types

City builders typically use several notification channels simultaneously:

**Toast notifications** appear at the edge of the screen, persist for a few seconds, and then disappear. They are used for low-to-medium priority events: a new building has been constructed, a milestone has been reached, an advisor has a suggestion. The design challenge is duration and position — too brief and players miss them during intense building sessions; too persistent and they become visual clutter.

**Sound cues** provide non-visual notification for urgent events. The wail of a fire engine siren in SimCity is unmistakable and immediately communicates both the nature and urgency of the event without requiring the player to look at any specific part of the screen. Sound cues are particularly valuable because they work regardless of what the player is currently looking at or which panel is open.

**Flashing icons** and map markers draw attention to specific locations. A pulsing fire icon on the minimap, a flashing alert over a building losing power — these combine notification with spatial information, answering both "something happened" and "where did it happen" simultaneously.

**News tickers** or scrolling text bars provide a stream of low-priority information: population milestones, election results (in Tropico), economic updates. They occupy minimal screen space and can be ignored during active building but scanned during pauses.

### Notification Fatigue

The most common UI complaint across city builders is notification overload. Research on in-game notification design shows that alert fatigue occurs when players are overwhelmed by frequent or irrelevant notifications, leading to desensitization and reduced responsiveness. The increased volume of notifications is negatively correlated with engagement retention — players who receive too many alerts, especially early in the experience, are more likely to disengage (DataCalculus, "Designing In-Game Notifications and Alerts" guide).

The design solutions are well-established but underutilized:

**Priority levels** — not all events are equally important. A fire is more urgent than a population milestone. Notifications should be visually and audibly differentiated by priority, with only the highest-priority events using interruptive channels (sound, screen flash).

**Frequency capping** — if the same type of event occurs repeatedly (multiple fires, repeated budget warnings), the notification system should consolidate rather than repeat. "3 fires active" is more useful than three separate fire alerts.

**Player control** — Cities: Skylines allows players to disable specific notification categories. This respects the player's autonomy and acknowledges that experienced players need different notifications than beginners.

**Contextual suppression** — notifications that are redundant with the player's current activity should be suppressed. If the player is actively looking at the fire overlay, they do not need a toast notification about a fire.

## 7. Toolbar and Tool Selection

The toolbar is the player's primary means of acting on the city — placing roads, zoning land, building structures, bulldozing mistakes. Its organization directly affects how quickly players can find and select tools, which in turn affects the pace and flow of gameplay.

### Organizational Patterns

**Hierarchical menus** are the most common pattern. Tools are grouped into categories (roads, zones, power, services, civic buildings) with a top-level category bar and a secondary panel showing the tools within the selected category. SimCity 4 and Cities: Skylines both use this pattern. The advantage is scalability — hierarchical menus can accommodate dozens or hundreds of tools. The disadvantage is discoverability — new players may not know which category contains the tool they need.

**Flat toolbars** present all tools in a single row or grid without nesting. This works for games with smaller tool sets, providing immediate visibility of all options at the cost of screen space. The tradeoff becomes untenable as the number of tools grows beyond 15-20.

**Radial menus** appear primarily in games designed with console input in mind. Anno 1800 implements a right-click radial menu for common building shortcuts, with customizable slots on the radial wheel. The radial pattern excels when the number of options is small (8-12) and when spatial memory can supplement visual scanning — players learn that "police station is at 2 o'clock" and select it by gesture rather than reading (HackerNews discussion, "Radial Menus in Video Games," 2024).

### Hotkeys

Every successful city builder provides keyboard shortcuts for frequently-used tools. The design question is whether hotkeys should be mnemonic (R for road, Z for zone) or positional (1-9 for the first nine tools in the toolbar). Mnemonic keys are easier to learn but conflict across languages. Positional keys are universal but require memorization of arbitrary mappings. The best implementations offer both and allow player customization.

### Cost Display

A subtle but important toolbar design element is showing the cost of each tool directly on its button. When a player sees "Road $100" next to "Highway $500," the cost information is available at the moment of decision rather than requiring a separate lookup. This reduces cognitive load and prevents the common frustration of selecting an expensive tool, clicking to place it, and only then discovering that it costs more than expected.

## 8. Camera and Navigation

The camera is not usually thought of as an information system, but in city builders it profoundly affects what the player can perceive and how they think about their city.

### Zoom as Information Filter

A key insight from multiple developers is that zoom level functions as an information filter. At a high zoom (close to the ground), the player sees architectural detail, individual vehicles, citizen activity. At a low zoom (city overview), the player sees district shapes, road networks, spatial relationships between neighborhoods. These are fundamentally different kinds of information that support different kinds of decisions.

Abylight Studios documented this principle in their blog on camera design for city builders and management games: the camera should move at a speed proportional to the zoom level, zoom should be smooth, and the angle should gently rotate toward the horizon when zooming in. This creates a natural transition between "strategic overview" and "street-level inspection" that helps the player maintain spatial orientation (Abylight Studios, "The Camera in City Builders and Management Games").

Citadelum's developers studied camera systems in classic city-building games and noted that modern 3D implementations let players change height, orientation, and zoom freely, with some games allowing seamless transition from inside a building to the entire settlement to a world map — all without loading screens or mode changes (Citadelum, "Camera in Classic City Building Games").

### Tilt-Shift as Aesthetic and Information Device

Several city builders use tilt-shift effects — a photographic technique that makes real scenes look like miniatures — as both an aesthetic choice and an information device. The effect naturally draws focus to the center of the frame while blurring the periphery, creating a built-in attention guide. Unreal Engine 5 includes built-in tilt-shift support for exactly this use case, and the technique has become a signature visual style for the genre.

### Minimap Design

The minimap is a persistent navigation aid that provides global spatial awareness while the main view shows local detail. Effective minimap design for city builders requires showing terrain type (water, land), zone colors, and the current viewport rectangle. The minimap should not try to show all the same data as the main view — its purpose is orientation, not analysis.

The critical minimap interaction is click-to-navigate: clicking on the minimap should instantly move the main camera to that location. This turns the minimap into a teleportation tool that makes large cities navigable. Without it, players spend disproportionate time scrolling across their city to reach the area they want to inspect.

## 9. Color Language

City builders rely on a shared color vocabulary that players absorb from the genre, from other games, and from real-world conventions. This vocabulary is powerful precisely because it is shared — but it creates challenges for accessibility and differentiation.

### The Standard Palette

Across the genre, certain color associations are near-universal:

- **Green** = good, healthy, covered, low traffic, parks, residential zones
- **Red** = bad, danger, fire, high crime, gridlock, budget deficit
- **Blue** = water, commercial zones, low value
- **Yellow** = caution, moderate, industrial zones, power, under construction
- **Orange** = warning, heavy traffic, fire
- **Gray** = unpowered, inactive, empty

This palette is not arbitrary — it draws on traffic signal conventions (green=go, red=stop), natural associations (blue=water, green=vegetation), and cultural conventions (red=danger). The advantage is that players understand the color language without explicit instruction. The disadvantage is that games become harder to distinguish visually from each other, and the palette creates problems for colorblind players.

### Zone Colors

Zone colors deserve special attention because they are the most persistent color layer in the game. SimCity established the convention: green for residential, blue for commercial, yellow for industrial. Cities: Skylines adopted the same scheme. This has become so entrenched that deviating from it would confuse genre veterans, even if an alternative scheme had better perceptual properties.

### Accessibility and Colorblind Design

Approximately 8% of men and 0.5% of women have some form of color vision deficiency, with red-green (deuteranopia/protanopia) being the most common type. A city builder that relies on red-green gradients for its traffic overlay — which is nearly all of them — is rendering that overlay useless for a significant portion of its audience.

Design guidelines for colorblind-accessible game UI converge on several principles (Filament Games, Color Blindness Accessibility guide; Smashing Magazine, Practical Guide to Designing for Colorblindness):

- **Never use color alone** to convey information. Supplement with patterns, shapes, labels, or icons. A traffic overlay that uses both color and line thickness to indicate congestion works for all players.
- **Avoid red-green pairs** as the sole distinguishing colors. Blue-orange provides better differentiation for the most common forms of color vision deficiency.
- **Provide colorblind mode options** — at minimum, palette swaps for deuteranopia, protanopia, and tritanopia. The WCAG 2.1 standard recommends a minimum contrast ratio of 4.5:1 for text and interactive elements.
- **Test with simulation tools.** Colorblind preview simulators (built into modern engines and available as standalone tools) allow designers to see exactly how their overlays appear to colorblind players.
- **Use shapes and icons as redundant encoding.** A fire icon is recognizable regardless of whether the player can distinguish the red overlay color from the green "safe" color.

## 10. Audio as Information

Sound design in city builders serves two information functions: ambient feedback (conveying the overall state of the city through background audio) and event notification (alerting the player to specific occurrences through sound cues).

### Ambient City Sound

The ambient soundscape of a city builder communicates density, activity, and mood without requiring the player to look at any specific data. A thriving commercial district should sound different from a quiet residential suburb, which should sound different from a polluted industrial zone. This ambient information runs continuously and is processed subconsciously, giving the player a background awareness of city state that supplements visual information.

Cities: Skylines II made significant advances in this area. Its audio system uses a concept called "audio grouping" to manage the large number of potential sound sources in a city. Buildings and zones propagate dynamic audio that creates the hustle and bustle of the city, with the soundscape changing based on zone type, weather, and camera position. The system handles the critical challenge of near-far transition: as the camera zooms out, individual sounds (car engines, construction equipment, pedestrian chatter) fade and are replaced by aggregate city noise (traffic hum, distant construction, wind). This mirrors how sound works in real cities and helps maintain the illusion of scale (Paradox Interactive, Cities: Skylines II Feature Highlight #12: Sound & Music).

### Zoom-Level Audio

One of the most elegant audio-as-information techniques is tying sound detail to zoom level. At street level, the player hears individual cars, birdsong, and ambient chatter. At district level, these merge into a generalized urban hum. At city level, only wind and the faintest suggestion of activity below remain. This creates an audio parallel to the visual information filtering that zoom provides, and it reinforces the cognitive shift between "micro decision-making" and "macro planning."

The original SimCity series implemented a simpler version of this: the ambience changed based on camera zoom level, lowering the volume of birds, cars, and city noise while raising the volume of wind as the camera pulled back (Game Audio Learning Portal, "How to Make Ambiences for Games").

### Event Sounds as Notifications

Sound cues for specific events — fire alarms, budget warnings, achievement jingles — function as a non-visual notification layer. Their key advantage is that they reach the player regardless of what is on screen. A player deeply focused on laying out a highway interchange will hear the fire siren even if the fire is occurring in a part of the city they are not looking at.

The design constraint is that event sounds must be distinctive enough to be identified by type (fire vs. crime vs. milestone) without being so intrusive that they break concentration. The fire siren is effective because it is urgent, recognizable, and infrequent. A sound cue that plays every time a building is constructed would quickly become maddening.

### Adaptive Music

Some city builders adjust their music to reflect city state. Frostpunk's soundtrack intensifies as hope decreases and conditions worsen, creating emotional pressure that reinforces the game's mechanics. This is a more subtle form of audio-as-information: the music does not convey specific data, but it creates a mood that shapes the player's perception of how well things are going.

## 11. Tutorial and Onboarding

City builders face an acute onboarding problem. Their systems are complex, interconnected, and not immediately intuitive. A new player needs to learn zoning, road layout, power infrastructure, budgeting, and service placement before they can build a functioning city — and the consequences of misunderstanding any of these systems may not appear for many in-game months.

### Progressive Disclosure

The most effective approach is progressive disclosure: revealing complexity gradually as the player demonstrates mastery of simpler systems. Video games are, in fact, one of the strongest examples of this UX pattern in practice. Players start with basic features and low difficulty, with complexity increasing as they progress. The key is that new mechanics are introduced at the moment they become relevant, not all at once in a front-loaded tutorial (UXPin, "What is Progressive Disclosure?").

Cities: Skylines implemented this through milestone-based unlocks. At population zero, the player has access only to basic roads and zones. As population grows, new building types, services, and infrastructure options unlock at specific thresholds. This serves double duty: it reduces initial complexity (fewer options means less confusion) and creates a natural sense of progression (each unlock feels like a reward and a new toy to play with).

### Tutorial Approaches

Karoliina Korppoo, lead designer of Cities: Skylines, discussed tutorial design at GDC Europe. The studio abandoned traditional standalone tutorial maps, finding them boring and disconnected from real gameplay. Instead, they built an unobtrusive "guide system" that shows context-sensitive messages: "if players forget something they'll get a notice anyway, and they don't have to play a tutorial." Her core principle was that teaching should never feel like punishment: "If you have the greatest game in the world, but nobody knows how to play it, it's not the greatest game in the world" (Gamedeveloper.com, "Cities: Skylines dev: Don't punish your players; teach them").

This approach — contextual hints embedded in normal gameplay rather than a separate tutorial mode — has become the genre standard. It respects the player's time, accommodates different learning speeds, and avoids the problem of tutorial knowledge being forgotten by the time it is needed.

### Sandbox as Learning Tool

A distinctive feature of city builders is that the sandbox itself is the best learning environment. Unlike games with linear progression where tutorial levels must be purpose-built, a city builder's normal gameplay loop — build, observe, adjust — is inherently educational. The UI's job is to make the "observe" step as clear as possible so that the feedback loop between action and consequence is tight.

This means that good overlay design, clear notification systems, and readable dashboards are themselves a form of tutorialization. A player who builds a residential zone far from any road will learn about road connectivity not from a tutorial popup but from seeing the zone fail to develop — provided the UI makes the reason for that failure visible. The query tool, the overlay system, and the notification pipeline all contribute to this ambient teaching function.

### Failure Modes in Onboarding

The worst onboarding pattern in city builders is delayed negative feedback. If a player makes a mistake in month 1 and the consequences do not appear until month 12, the connection between cause and effect is broken. The player does not learn from the mistake; they just experience an inexplicable failure. UI design can help here by making early-warning indicators visible — showing demand dropping before buildings abandon, showing budget trending negative before funds run out, showing traffic increasing before gridlock occurs.

## 12. Lessons for Bitborough

Bitborough already has a solid foundation of UI infrastructure: five map overlays (power, land value, crime, fire coverage, traffic), a query panel for tile inspection, a budget panel with tax and service funding controls, a statistics panel with six canvas-rendered time-series charts, an info bar with population/funds/demand readout, a minimap, and a flat toolbar with hotkey bindings. The following recommendations build on this existing foundation.

### Overlay System

Bitborough's overlay renderer uses precomputed color tables (256-entry lookup arrays) for land value, crime, fire coverage, and traffic, which is an efficient approach. The color gradients follow genre conventions — green-to-red for traffic, green-to-red for fire coverage. Recommendations:

- **Add a colorblind-friendly palette option.** The current traffic and fire overlays rely heavily on red-green differentiation. A blue-orange alternative palette would serve colorblind players. The infrastructure for this is straightforward: swap the color table generator functions in `colors.ts`.
- **Support overlay persistence during building.** If overlays automatically dismiss when the player selects a building tool, valuable spatial context is lost. The player should be able to keep the traffic overlay visible while placing a road, or keep the power overlay visible while routing a power line.
- **Consider adding a pollution/environment overlay** as the simulation grows. This is a standard overlay in the genre and would help players understand the spatial impact of industrial zones.

### Query Panel

The current query panel displays position, terrain, zone, infrastructure, building, power status, land value, crime, fire coverage, and traffic. This is a solid set of attributes. Recommendations:

- **Show causal factors, not just current values.** SimCity 4's query tool showed what was raising or lowering a building's desirability — nearby parks, distant crime, lack of transit. This transforms the query panel from a status display into a diagnostic tool. Adding a "factors" section that lists positive and negative influences on the selected tile would significantly improve the feedback loop.
- **Add citizen detail for occupied buildings.** When the player queries a residential building, showing the number of residents, their commute destinations, and their satisfaction would ground abstract numbers in human-scale information.

### Toolbar

Bitborough's toolbar is currently flat with 14 entries, each showing a hotkey and cost. This is near the upper limit for a flat toolbar before scrolling or grouping becomes necessary. Recommendations:

- **Group tools into categories** as the tool set grows. A natural grouping would be: Infrastructure (Road, Pave, Power Line), Zones (R, C, I), Power Plants (Diesel, Coal, Nuclear), Services (Transit, Police, Fire, Park), and Utility (Bulldoze, Query). Each category could be a collapsible section or a tabbed sub-panel.
- **Keep cost display on buttons.** This is already implemented and should be preserved — it is a best practice that many games miss.

### Statistics Panel

The stats panel renders six time-series charts on a canvas: Population, Treasury, Monthly Cash Flow, and three demand charts. This is a strong selection of metrics. Recommendations:

- **Add current-value callouts.** The charts already display the current value in the top-right corner, which is good. Consider making the current value visually prominent (larger font, bold) while the chart provides trend context.
- **Consider a crime/safety chart and a traffic congestion chart** as the simulation develops. Players who can see city-wide crime trending upward over time will proactively build police stations; players who only see the current state in overlays may react too late.

### Notification System

Bitborough currently has an insolvent warning in the info bar but no general notification system. This is the biggest gap in the current UI. Recommendations:

- **Implement a lightweight toast notification system** for events like: fires started, buildings abandoned, milestones reached (population thresholds), budget deficit, service coverage dropping. Toasts should appear briefly at screen edge and auto-dismiss.
- **Use sound cues for urgent events** (fires, insolvency). Even simple audio feedback dramatically improves awareness of events occurring outside the current viewport.
- **Implement priority levels from the start.** A fire should visually and audibly differ from a population milestone. Building this distinction into the initial implementation prevents the need to retrofit it later.
- **Cap notification frequency.** If three fires start in the same month, show one notification ("3 fires active") rather than three.

### Info Bar

The info bar is well-designed, showing population (with occupancy percentage), funds, monthly balance, date, and RCI demand bars, plus an insolvency warning. Recommendations:

- **The RCI demand bars are an excellent design choice** — they implement the genre's most essential at-a-glance metric. Preserving their prominence as the UI evolves will be important.
- **Consider adding a brief "city health" summary** — a single indicator (icon or color) that synthesizes multiple metrics into an overall assessment. This gives the player a reason to open detailed panels when the summary looks concerning.

### Audio

Bitborough does not currently appear to have audio-as-information features. Even basic implementations would enhance the experience:

- **Ambient city hum that scales with population** would provide a background sense of city vitality.
- **A fire alarm sound** would make fires impossible to miss, even when the player's camera is focused elsewhere.
- **Construction/bulldoze feedback sounds** would confirm tool actions and reduce the need for visual confirmation.

### Onboarding

Bitborough's contextual guide system (via the DocsPanel) provides in-game documentation. Recommendations:

- **Follow the Cities: Skylines model**: context-sensitive hints triggered by game state rather than a linear tutorial. When the player zones their first residential area without road access, a gentle hint about road connectivity is more effective than a tutorial that explains road connectivity before the player has zoned anything.
- **Use progressive disclosure for tool unlocks** if the simulation grows in complexity. Starting with just roads, zones, and one power plant type, and unlocking additional tools at population milestones, reduces initial cognitive load.

---

## Sources

### Game Developer Talks and Portfolios
- [Chi Chan, SimCity UI Design Portfolio](https://www.chichanart.com/simcity-2-1) — UI art direction philosophy for SimCity (2013), including "world as UI" design approach
- [GDC Vault: Cities Skylines, A Case Study](https://gdcvault.com/play/1022809/Cities-Skylines-A-Case) — Karoliina Korppoo's GDC Europe talk on designing Cities: Skylines
- [GDC Vault: Simulating a City, One Page at a Time](https://gdcvault.com/play/1017708/Simulating-a-City-One-Page) — Stone Librande's GDC 2013 talk on SimCity design documentation
- [Stone Librande, One-Page Design Documents (PDF)](https://stonetronix.com/gdc-2013/SimCity-OnePage.pdf) — Slides from the GDC talk on SimCity design process
- [Cities: Skylines Dev: Don't Punish Your Players; Teach Them](https://www.gamedeveloper.com/design/-i-cities-skylines-i-dev-don-t-punish-your-players-teach-them) — Korppoo on tutorial philosophy and player guidance
- [Stone Librande, Wikipedia](https://en.wikipedia.org/wiki/Stone_Librande) — Background on the SimCity lead designer

### Game-Specific UI Documentation
- [SC4D Encyclopaedia: Data View](https://www.wiki.sc4devotion.com/index.php?title=Data_View) — Technical documentation of SimCity 4's data overlay system
- [SC4D Encyclopaedia: UI](https://wiki.sc4devotion.com/index.php?title=UI) — SimCity 4 UI file structure and control elements
- [SimCity Wiki: Advisor](https://simcity.fandom.com/wiki/Advisor) — History of advisor characters across the SimCity franchise
- [SimCity Wiki: Interface (SimCity 2013)](https://simcity.fandom.com/wiki/Interface_(SimCity_(2013))) — Interface documentation for SimCity (2013)
- [Anno 1800 Wiki: Newspapers](https://anno1800.fandom.com/wiki/Newspapers) — Newspaper notification system mechanics
- [Anno Union DevBlog: User Interface](https://www.anno-union.com/devblog-user-interface-2/) — Developer blog on Anno 1800 UX design philosophy
- [Anno Union DevBlog: Breaking News](https://www.anno-union.com/breaking-news/) — Developer blog on the newspaper feature design
- [Banished Interface Guide](https://guides.gamepressure.com/banished/guide.asp?ID=24706) — Interface overview and UI panel documentation
- [Timberborn User Interface, Official Wiki](https://timberborn.wiki.gg/wiki/User_Interface) — UI documentation for Timberborn
- [Frostpunk Interface In Game](https://interfaceingame.com/games/frostpunk/) — UI screenshot reference for Frostpunk
- [Game UI Database: Cities: Skylines](https://www.gameuidatabase.com/gameData.php?id=526) — Categorized UI screenshots for Cities: Skylines

### Technical and Design References
- [How Timberborn's Complex Runtime UI Was Built](https://unity.com/case-study/timberborn) — Unity case study on Mechanistry's UI Toolkit migration
- [Paradox Interactive: Cities Skylines II Feature Highlight #12 — Sound & Music](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/sound-music) — Developer feature highlight on the audio design system
- [Abylight Studios: The Camera in City Builders and Management Games](https://abylight.com/the-camera-in-city-builders-and-management-games/) — Analysis of camera control design patterns
- [Citadelum: Camera in Classic City Building Games](https://citadelum.com/camera-in-classic-city-building-games/) — Historical analysis of camera systems in the genre
- [Rocketflair: Developer Blog #4, Developing Camera Controls for a City-Builder](http://rocketflair.com/developer-blog-4-developing-camera-controls-for-a-city-builder/) — Practical camera implementation for city builders

### Accessibility and Notification Design
- [Filament Games: Color Blindness Accessibility in Video Games](https://www.filamentgames.com/blog/color-blindness-accessibility-in-video-games/) — Guidelines for colorblind-accessible game design
- [Smashing Magazine: A Practical Guide to Designing for Colorblindness](https://www.smashingmagazine.com/2024/02/designing-for-colorblindness/) — Comprehensive colorblind design guide with testing tools
- [Microsoft Learn: Making Games Accessible](https://learn.microsoft.com/en-us/windows/uwp/gaming/accessibility-for-games) — Microsoft's game accessibility guidelines
- [DataCalculus: Designing In-Game Notifications and Alerts](https://datacalculus.com/en/blog/graphic-design/game-interface-designer/designing-in-game-notifications-and-alerts-a-guide-for-game-interface-designers) — Guide to notification design for game interfaces
- [MagicBell: Alert Fatigue, Impact on Users and Solutions](https://www.magicbell.com/blog/alert-fatigue) — Research on notification fatigue and mitigation strategies
- [Game Audio Learning Portal: How to Make Ambiences for Games](https://www.gameaudiolearning.com/knowledgebase/how-to-make-ambiences-for-games) — Technical guide to ambient sound design in games
- [Game UI Database](https://www.gameuidatabase.com/) — Reference database with 55,000+ UI screenshots across 1,300+ games

### Community and Industry Analysis
- [Dwarf Fortress Steam Community: UI Discussions](https://steamcommunity.com/app/975370/discussions/0/3716062978733086311/) — Player feedback on the Steam UI redesign
- [PCGamesN: Dwarf Fortress Has a Much Better UI on Steam](https://www.pcgamesn.com/dwarf-fortress/menus) — Analysis of the Dwarf Fortress UI overhaul
- [Cities: Skylines UI Framework Wiki](https://skylines.paradoxwikis.com/UI_Framework) — Technical documentation for the Cities: Skylines UI system
- [HackerNews: Radial Menus in Video Games (2024)](https://news.ycombinator.com/item?id=40570135) — Community discussion on radial menu design patterns
- [PCGamesN: Cities Skylines 2 Audio System](https://www.pcgamesn.com/cities-skylines-2/sounds) — Coverage of CS2's overhauled audio architecture
