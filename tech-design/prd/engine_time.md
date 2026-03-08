# PRD: Engine — Time Model

**System:** Time & scheduling
**Status:** Draft
**Parent:** `@rcity/engine`

---

## Purpose

Defines how simulation time works: what a tick is, how ticks map to game time (months/years), how different simulation systems are scheduled at different frequencies, and how game speed controls affect tick rate.

---

## Concepts

### Tick

A tick is the atomic unit of simulation time. Each `engine.tick()` call advances the simulation by exactly one tick. The engine has no concept of wall-clock time — it just counts ticks. The game package decides how fast to call `tick()` based on the current `SimSpeed`.

### Game Calendar

Ticks accumulate into months and years for player-facing display and budget cycles.

```
1 month = 4 ticks (at Normal speed, this feels like ~1 second)
1 year  = 12 months = 48 ticks
```

This means at Normal speed (4 ticks/sec), one game year passes in ~12 seconds. Fast enough to see progress, slow enough to react.

### SimSpeed → Tick Rate Mapping

The game package calls `tick()` at these rates:

| Speed   | Ticks/sec | Real time per month | Real time per year |
|---------|-----------|--------------------|--------------------|
| Paused  | 0         | —                  | —                  |
| Slow    | 1         | 4.0s               | 48s                |
| Normal  | 4         | 1.0s               | 12s                |
| Fast    | 10        | 0.4s               | 4.8s               |
| Turbo   | uncapped  | ~instant            | ~instant           |

Turbo is useful for testing and "fast forward through boring parts." The engine doesn't limit it — the game loop just calls `tick()` as fast as possible, rendering periodically.

---

## System Scheduling

Not every simulation system needs to run every tick. Running expensive systems less frequently saves CPU and creates natural pacing.

### Schedule Table

| System           | Frequency          | Rationale                                           |
|------------------|--------------------|-----------------------------------------------------|
| Power            | Every tick          | Players expect immediate feedback when placing power |
| Connection masks | On command only     | Only recalculate when infrastructure placed/removed  |
| Zone development | Every 4 ticks (1/month) | Growth should feel gradual, not instant          |
| Land value       | Every 4 ticks (1/month) | Expensive calculation, changes slowly            |
| Budget           | Every 48 ticks (1/year)  | Annual budget cycle, matches SimCity convention   |
| Traffic          | Every 4 ticks (1/month) | Needs to respond to changes but not every tick   |
| Services         | Every 4 ticks (1/month) | Crime/fire risk changes gradually                |
| Pollution        | Every 4 ticks (1/month) | Industrial pollution spreads slowly              |

### Implementation

The engine tracks `tickCount` and each system checks `tickCount % frequency === 0`:

```typescript
tick(): void {
  this.tickCount++

  // Every tick
  this.systems.power.update()

  // Monthly (every 4 ticks)
  if (this.tickCount % 4 === 0) {
    this.systems.zones.update()
    this.systems.landValue.update()
    this.systems.traffic.update()
    this.systems.services.update()
    this.systems.pollution.update()
    this.month++
    if (this.month > 12) {
      this.month = 1
      this.year++
      // Yearly
      this.systems.budget.update()
    }
  }
}
```

### Staggering

If multiple monthly systems running on the same tick causes a CPU spike, they can be staggered across ticks within the month:

```
Tick 0: zones
Tick 1: land value
Tick 2: traffic
Tick 3: services + pollution
```

This distributes the work more evenly. Decision: start with all-at-once, stagger if profiling shows spikes.

---

## Time State

```typescript
interface TimeState {
  tickCount: number   // total ticks since game start
  month: number       // 1-12
  year: number        // starts at 1900 (SimCity convention) or configurable
  speed: SimSpeed
}
```

### Starting Conditions

- Default start year: 1900
- Default start month: 1 (January)
- Default speed: Normal

---

## Events and Milestones

Certain game events are triggered by time thresholds or calendar dates:

- **Budget report:** End of each year (tick 48, 96, 144, ...)
- **Demand recalculation:** Every month
- **Disaster eligibility:** After year 2 (gives player time to set up)
- **Population milestones:** Checked monthly (trigger rewards/unlocks)

These are hooks that other systems register for, not logic owned by the time system itself.

---

## Design Constraints

- **No wall-clock dependency.** The engine never calls `Date.now()` or `performance.now()`. Time is purely tick-based.
- **Deterministic.** Tick count is the sole time input. No system behaves differently based on real elapsed time.
- **Configurable.** `EngineConfig` can override ticks-per-month and months-per-year for testing or different game feels.

---

## Configuration

```typescript
interface TimeConfig {
  ticksPerMonth?: number    // default: 4
  monthsPerYear?: number    // default: 12
  startYear?: number        // default: 1900
  startMonth?: number       // default: 1
}
```
