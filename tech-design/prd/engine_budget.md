# PRD: Engine — Budget System

**System:** Budget, taxes, costs, and funds
**Status:** Draft
**Parent:** `@rcity/engine`

---

## Purpose

The budget system is the primary constraint mechanism. It forces tradeoffs: you can't build everything, you can't fund everything fully, and growth requires investment that may not pay off. Without budget pressure, the game has no tension.

---

## Core Design

### The Fundamental Tension

```
Growth requires spending → Spending requires income → Income requires growth
```

This circular dependency is the engine of the game. Players must:
1. Invest in infrastructure to attract development
2. Wait for zones to develop and generate tax revenue
3. Balance spending against income to avoid bankruptcy
4. Decide when to invest in growth vs. save for stability

---

## Revenue

### Tax Income

Taxes are collected annually (every 48 ticks). Revenue is calculated from population and land value, not just zone count. This is adapted from the Micropolis formula:

```
taxIncome = totalPopulation × averageLandValue / 120 × taxRate × difficultyModifier

difficultyModifier:
  Easy:   1.4
  Normal: 1.0
  Hard:   0.8
```

This means higher land values generate more tax revenue per capita — wealthy neighborhoods contribute more than slums. This creates a powerful incentive to invest in land value (parks, services, infrastructure), as the return comes through increased tax revenue.

Additionally, each developed tile has a base taxable value used for budget projections:

**Taxable value per tile** depends on density and zone type:

| Zone Type    | Low Density | Medium Density | High Density |
|-------------|-------------|----------------|--------------|
| Residential | $20         | $60            | $150         |
| Commercial  | $25         | $80            | $200         |
| Industrial  | $15         | $50            | $120         |

Commercial generates the most tax per tile at high density, but requires residential (workers) and good land value to develop. Industrial generates less tax and pollutes, but is essential for jobs early on. This creates natural tension between zone types.

**Tax rate** range: 0% to 20%, default 7%.

### Tax Rate Effects on Growth (The Laffer Curve)

The tax rate directly affects zone demand. Higher taxes suppress demand, lower taxes boost it. Research into SimCity's economics reveals a Laffer Curve effect — there's an optimal revenue-maximizing rate around 9%, with steep population decline above 15%.

```
demandModifier = 1.0 - ((taxRate - 0.07) × 5.0)
// At 4%: modifier = 1.15 (growth boost, but less revenue)
// At 7%: modifier = 1.0 (neutral — the sweet spot for growth)
// At 9%: modifier = 0.9 (slightly suppressed growth, max revenue)
// At 12%: modifier = 0.75 (noticeable suppression)
// At 15%: modifier = 0.6 (significant suppression, population leaving)
// At 20%: modifier = 0.35 (near-stagnation, only existing residents stay)
```

This modifier is applied to all zone demand calculations. The tension:
- **4-6% tax:** Fast growth but may not cover infrastructure costs → budget deficit spiral
- **7-9% tax:** The playable range. Most players will settle here.
- **10-12% tax:** Revenue boost but growth stalls. Works for mature cities with established tax base.
- **13%+ tax:** Actively harmful. Population begins to leave. Only useful as a temporary emergency measure.

---

## Expenses

### Maintenance Costs

Ongoing costs deducted annually. Players can't avoid these — they're the cost of having infrastructure.

| Category | Cost Per Unit | Unit |
|----------|--------------|------|
| Roads | $1/tile/year | per road tile |
| Rails | $1.5/tile/year | per rail tile |
| Power lines | $0.50/tile/year | per power line tile |
| Coal power plant (capacity: 700) | $120/year | per plant |
| Nuclear power plant (capacity: 2000) | $250/year | per plant |

### Service Funding

Services (police, fire, transit) have adjustable funding levels from 0% to 100% (in 10% increments). Funding affects effectiveness.

| Service | Full Funding Cost | Effect |
|---------|------------------|--------|
| Police | $100/station/year | Coverage radius and crime reduction |
| Fire | $100/station/year | Coverage radius and fire response |
| Transit | $50/year base + $1/rail tile | Reduces traffic (future) |

**Underfunding effects:**
```
effectiveRadius = baseRadius × (fundingLevel / 100)
effectiveness = fundingLevel / 100
```

At 50% funding, a police station covers half its normal radius and reduces crime by half as much. At 0%, the station does nothing (but still has building maintenance cost).

### Construction Costs

One-time costs when placing infrastructure or buildings.

| Item | Cost |
|------|------|
| Bulldoze (clear terrain) | $1 |
| Bulldoze (road/power line) | $1 |
| Bulldoze (building) | $1 |
| Road tile | $10 |
| Rail tile | $20 |
| Power line tile | $5 |
| Zone tile (R/C/I) | $0 (zoning is free, like SimCity) |
| Coal power plant | $3,000 |
| Nuclear power plant | $5,000 |
| Police station | $500 |
| Fire station | $500 |
| Stadium | $3,000 | Raises residential population cap by 5,000 |
| Seaport | $5,000 | Unlocks high-density industrial, boosts demand |
| Airport | $10,000 | Unlocks high-density commercial, boosts demand |
| Park (1x1) | $10 | Raises population cap by 500, boosts land value |

Zoning is free — the cost of development is borne by the simulation (it just happens or doesn't). The player's investment is in infrastructure to make zones attractive.

**Special building investment decisions** are some of the most interesting in the game. A stadium costs $3,000 — roughly the same as a coal power plant — but unlocks 5,000 more potential residents. Timing this investment (too early = waste, too late = stalled growth) is a key skill players develop.

---

## Budget Cycle

### Annual Budget (Every 48 Ticks)

```
1. Calculate tax income from all developed zones
2. Calculate total maintenance costs
3. Calculate service funding costs
4. balance = taxIncome - maintenance - serviceCosts
5. funds += balance
```

### Monthly Check (Every 4 Ticks)

Between annual budgets, the engine doesn't collect taxes or deduct maintenance. But it does track month-to-month to provide projected values to the UI:

```
projectedAnnualIncome = currentTaxableBase × taxRate
projectedAnnualExpenses = currentMaintenance + currentServiceCosts
projectedBalance = projectedAnnualIncome - projectedAnnualExpenses
```

This lets the UI show "you're projected to lose $500 this year" without waiting for the annual cycle.

---

## Starting Funds

| Map Size | Starting Funds |
|----------|---------------|
| 32x32 | $5,000 |
| 64x64 | $10,000 |
| 128x128 | $20,000 |
| 256x256 | $30,000 |
| 512x512 | $50,000 |

Scaled so players have enough to build initial infrastructure but feel pressure quickly.

---

## Bankruptcy

When funds drop to $0 or below:

1. **Warning phase** (funds < $0 for 1 year): UI shows warning. Player can still build if they can afford individual items.
2. **Austerity phase** (funds < -$1,000): Service funding automatically drops to 50%. No new construction allowed.
3. **Game over** (funds < -$5,000): The city is bankrupt. Player can continue watching but can't recover without a bailout (future feature?).

Alternative: instead of hard game over, allow the player to continue in a degraded state. The city declines but doesn't force a restart. This matches the "toy" philosophy — let players watch what happens.

Decision: **No hard game over.** Bankruptcy degrades the city but the player can always keep watching and potentially recover by raising taxes or reducing services. The simulation is the toy.

---

## BudgetInfo Snapshot

```typescript
interface BudgetInfo {
  // Current state
  taxRate: number
  totalFunds: number

  // Last annual cycle
  taxIncome: number
  maintenanceCosts: {
    roads: number
    rails: number
    powerLines: number
    powerPlants: number
    total: number
  }
  serviceCosts: {
    police: number
    fire: number
    transit: number
    total: number
  }
  balance: number           // income - all expenses

  // Projections (based on current state)
  projectedIncome: number
  projectedExpenses: number
  projectedBalance: number

  // Funding levels
  funding: {
    police: number          // 0-100
    fire: number            // 0-100
    transit: number         // 0-100
  }
}
```

---

## Interesting Decisions the Budget Creates

1. **When to build the second power plant:** The first one covers early growth, but expansion demands more power. $3,000 is a big investment — time it wrong and you stall.

2. **Tax rate balancing act:** Low taxes grow the city fast but may not cover maintenance. High taxes generate revenue but choke growth.

3. **Service funding tradeoffs:** Cutting police saves money but crime rises, lowering land values, reducing tax revenue. There's a feedback loop.

4. **Road vs. rail:** Roads are cheap but create traffic. Rail is expensive upfront but cheaper long-term and reduces traffic.

5. **Growth investment timing:** Spending big on infrastructure when you're small is risky. Spending too late means you miss growth opportunities.

---

## Testing

```typescript
test('tax income calculated from developed zones', () => {
  const engine = createEngineWithDevelopedCity()
  // City has 10 low-density residential tiles
  engine.tick48() // advance one year
  const budget = engine.getBudget()
  expect(budget.taxIncome).toBe(10 * 20 * 0.07) // 10 tiles × $20 × 7%
})

test('road maintenance deducted annually', () => {
  const engine = createEngine(20, 20)
  const startFunds = engine.getState().funds
  // Place 100 road tiles (cost: $1,000 construction)
  placeRoadGrid(engine, 100)
  const afterConstruction = engine.getState().funds
  expect(afterConstruction).toBe(startFunds - 1000)

  advanceOneYear(engine) // 48 ticks
  const afterYear = engine.getState().funds
  // Should have deducted $100 maintenance (100 tiles × $1/tile)
  // Plus whatever tax income (none if no developed zones)
  expect(afterYear).toBe(afterConstruction - 100)
})

test('high tax rate suppresses demand', () => {
  const engine = createEngine(64, 64)
  engine.setTaxRate(0.20) // 20%
  const demand = engine.getDemand()
  // All demand should be significantly suppressed
  expect(demand.r).toBeLessThan(0.5)
})

test('bankruptcy prevents construction', () => {
  const engine = createEngine(20, 20, { startingFunds: 0 })
  engine.getState().funds = -2000 // force negative
  const result = engine.placeTile(5, 5, TileType.Road)
  expect(result.ok).toBe(false)
  expect(result.reason).toBe(FailReason.InsufficientFunds)
})

test('service underfunding reduces coverage', () => {
  const engine = createEngineWithPoliceStation()
  engine.setFunding('police', 50) // half funding
  engine.tick4() // monthly update
  // Crime should be higher than with full funding
  // (tested by comparing land values or crime levels)
})
```
