# Economy Depth Milestone — Design

## Overview

Five interconnected features that transform Bitborough's budget from a flat population-times-average formula into a spatially-aware fiscal simulation. Together they reward intentional city design: dense mixed-use districts generate visible tax surpluses, sprawling residential zones drain the treasury, bonds unlock capital investment, clustering pays off, and impact fees make growth partially self-funding.

All five features touch `budget.ts` directly or feed into it. They should ship as a single milestone because their gameplay effects reinforce each other — per-tile tax shows the player *why* density matters, fiscal multipliers show *why* zone mix matters, bonds give the player *tools* to invest, agglomeration gives a *reason* to cluster, and impact fees create a short-term revenue pulse that offsets infrastructure spending.

### Research Sources

| Feature | Primary Source | Roadmap Item |
|---------|---------------|--------------|
| Per-Tile Tax Productivity | `research/municipal-finance.md` — Revenue Per Acre, Application to Bitborough s1 | 2.3 |
| Zone-Type Fiscal Multiplier | `research/municipal-finance.md` — Fiscal Multipliers (COCS), Application to Bitborough s2 | 2.4 |
| Municipal Bonds | `research/municipal-finance.md` — Municipal Bonds, Application to Bitborough s3 | 2.11 |
| Agglomeration Bonus | `research/economy-and-employment.md` — Agglomeration Economies, Application to Bitborough s2 | 2.14 |
| Impact Fees | `research/municipal-finance.md` — Development Impact Fees, Application to Bitborough s5 | 2.20 |

---

## Dependency Order

```
1. Per-Tile Tax Productivity   (no dependencies — replaces existing formula)
2. Zone-Type Fiscal Multiplier (no dependencies — extends service cost calc)
3. Impact Fees                 (no dependencies — hooks into zone development)
4. Agglomeration Bonus         (depends on 1 — modifies per-tile tax with cluster multiplier)
5. Municipal Bonds             (depends on 1+2 — credit rating uses the new budget numbers)
```

Features 1, 2, and 3 are independent and can be developed in parallel. Feature 4 multiplies into the per-tile tax output from feature 1. Feature 5 uses the stabilized budget numbers from 1+2 to compute credit ratings, so it should come last.

---

## Feature 1: Per-Tile Tax Productivity

### Gameplay Purpose

Replace the averaged tax formula (`population * avgLandValue / 20 * taxRate`) with a per-tile sum that accounts for building density. This makes dense development visibly more valuable in the budget panel — a single high-density commercial tower produces more tax revenue than an entire block of low-density houses. The player can hover over tiles and see their fiscal contribution, creating a direct feedback loop between urban form and fiscal health.

This implements the "revenue per acre" insight from Strong Towns research: Lafayette, LA's downtown generates 70x more tax revenue per acre than suburban periphery. In-game, the density multipliers compress that ratio to 6x (High vs Low) for playability while preserving the directional signal.

### Current Code

```typescript
// budget.ts lines 60-73 — current averaged calculation
let totalLandValue = 0
let developedTileCount = 0
for (const building of map.buildings) {
  const def = BUILDING_DEFS[building.defId]
  if (!def || def.category === BuildingCategory.Special) continue
  const idx = building.y * map.width + building.x
  totalLandValue += landValues[idx]!
  developedTileCount++
}
const avgLandValue = developedTileCount > 0 ? totalLandValue / developedTileCount : 0
const taxIncome = ((population * avgLandValue) / 20) * taxRate
```

### Data Model Changes

No new types needed. The change is purely algorithmic — the `BudgetInfo` interface already carries `taxIncome` as a number.

Add a constant map for density multipliers to `budget.ts` (or a shared constants file):

```typescript
const DENSITY_TAX_MULTIPLIER: Record<DensityLevel, number> = {
  [DensityLevel.Low]:    1.0,
  [DensityLevel.Medium]: 2.5,
  [DensityLevel.High]:   6.0,
}
```

### Algorithm

```typescript
// Replace the averaged loop with per-tile summation
const BASE_TAX_RATE_SCALE = 0.05  // tuning constant (replaces the /20 divisor)

let taxIncome = 0
for (const building of map.buildings) {
  const def = BUILDING_DEFS[building.defId]
  if (!def || def.category === BuildingCategory.Special) continue

  const idx = building.y * map.width + building.x
  const tileLandValue = landValues[idx]!
  const densityMult = DENSITY_TAX_MULTIPLIER[building.density] ?? 1.0

  taxIncome += tileLandValue * densityMult * BASE_TAX_RATE_SCALE * taxRate
}
```

For multi-tile buildings (size > 1x1), only the origin tile (building.x, building.y) is used for the land value lookup. The density multiplier already accounts for the higher assessed value of larger structures — this avoids double-counting footprint tiles.

### Integration Points

- **`budget.ts: calculateBudget()`** — Replace lines 60-73 with the per-tile loop. Remove the `population` parameter dependency for tax calculation (population is no longer in the formula; density and land value carry the signal instead).
- **`BudgetInfo`** — No interface change. The `taxIncome` field carries the new value transparently.
- **Budget panel UI** — Existing display works unchanged. Optionally add a per-tile revenue overlay later.

### Key Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `DENSITY_TAX_MULTIPLIER[Low]` | 1.0 | Baseline — single-family equivalent |
| `DENSITY_TAX_MULTIPLIER[Medium]` | 2.5 | 2-4 units per tile, higher assessed value per unit area |
| `DENSITY_TAX_MULTIPLIER[High]` | 6.0 | Many units per tile, premium land. Matches ~6x revenue/acre ratio from Strong Towns data |
| `BASE_TAX_RATE_SCALE` | 0.05 | Tuning constant. Adjust to keep early-game income in a similar range to the old formula at ~7% tax / ~500 pop |

### Tuning Note

The old formula coupled tax income to population directly. The new formula decouples them — income depends on *what* is built, not *who* lives there. This is more realistic (commercial towers pay property tax regardless of residents) but means we need to verify that early-game cash flow (before density upgrades exist) remains viable. The `BASE_TAX_RATE_SCALE` constant is the primary tuning lever.

---

## Feature 2: Zone-Type Fiscal Multiplier

### Gameplay Purpose

Residential zones cost more to service than they generate in taxes. Commercial and industrial zones generate surplus revenue. This is the single most important fiscal lesson from the COCS studies: across 200+ U.S. communities, residential land costs a median of $1.15 per $1.00 of tax revenue in services, while commercial/industrial costs only $0.30-$0.35.

In-game, this creates a strategic tension: residential zones grow your population (and thus demand and political support), but they are a net fiscal drain. Commercial and industrial zones are the revenue engines. A city of only residential zones will slowly bleed money. This rewards balanced, mixed-use city design.

### Data Model Changes

Add a new cost line to `BudgetInfo` for zone-based service costs:

```typescript
// In BudgetInfo, extend serviceCosts:
serviceCosts: {
  police: number
  fire: number
  transit: number
  zoneServices: number  // NEW — implicit service costs by zone type
  total: number
}
```

Add constants:

```typescript
const ZONE_SERVICE_COST_MULTIPLIER: Record<string, number> = {
  'res.low':  1.15,   // net fiscal drain — schools, police, fire, parks
  'res.med':  0.95,   // shared infrastructure approaches break-even
  'res.high': 0.80,   // efficient service delivery at density
  'com.low':  0.35,   // low service demand, high tax value
  'com.med':  0.35,
  'com.high': 0.30,
  'ind.low':  0.40,   // low service demand, moderate tax value
  'ind.med':  0.35,
  'ind.high': 0.30,
}

const BASE_SERVICE_COST_PER_TILE = 2.0  // $/month per developed tile
```

### Algorithm

After computing per-tile tax income (from Feature 1), compute the implicit service cost for each zone building:

```typescript
let zoneServiceCost = 0
for (const building of map.buildings) {
  const def = BUILDING_DEFS[building.defId]
  if (!def || def.category === BuildingCategory.Special) continue

  // Build a key like 'res.low', 'com.med', 'ind.high'
  const prefix = def.category === BuildingCategory.Residential ? 'res'
    : def.category === BuildingCategory.Commercial ? 'com' : 'ind'
  const densitySuffix = building.density === DensityLevel.Low ? 'low'
    : building.density === DensityLevel.Medium ? 'med' : 'high'
  const key = `${prefix}.${densitySuffix}`

  const multiplier = ZONE_SERVICE_COST_MULTIPLIER[key] ?? 1.0
  zoneServiceCost += BASE_SERVICE_COST_PER_TILE * multiplier
}
```

The `zoneServiceCost` is added to the expenses side of the budget.

### Integration Points

- **`budget.ts: calculateBudget()`** — Add the zone service cost loop after the existing service costs computation. Add `zoneServiceCost` to total expenses.
- **`BudgetInfo` in `core/state.ts`** — Add `zoneServices` field inside `serviceCosts`.
- **Budget panel UI** — Display the new `zoneServices` line item so the player sees the fiscal drain from residential zones.

### Key Constants

| Constant | Value | Source |
|----------|-------|--------|
| Residential Low multiplier | 1.15 | COCS median: $1.15 cost per $1.00 revenue |
| Residential Medium multiplier | 0.95 | Lincoln Institute: multifamily near break-even |
| Residential High multiplier | 0.80 | Dense residential is service-efficient |
| Commercial multiplier | 0.30-0.35 | COCS median: $0.30 cost per $1.00 revenue |
| Industrial multiplier | 0.30-0.40 | COCS: slightly higher than commercial due to road/infrastructure wear |
| `BASE_SERVICE_COST_PER_TILE` | 2.0 | Tuning constant — total zone service cost should be ~30-50% of infrastructure maintenance at city maturity |

### Design Note

The multiplier applies to an abstract "service cost per tile" rather than to actual police/fire/transit costs. This avoids coupling the fiscal multiplier to the number of service buildings the player has placed. The COCS ratio captures all implicit costs (schools, courts, social services, parks) that the game does not model individually.

---

## Feature 3: Impact Fees

### Gameplay Purpose

A one-time cash payment when a zone tile develops (building spawns) or when a building upgrades to a higher density tier. This models real-world development impact fees that offset infrastructure costs of growth. In-game, it creates a short-term revenue pulse whenever the city grows — growth *feels* profitable in the moment, even if long-term maintenance costs will eventually exceed the one-time fee. Combined with the fiscal multiplier (Feature 2), this produces the "growth Ponzi scheme" dynamic described in the Strong Towns research: expansion generates upfront cash but deferred liabilities.

### Data Model Changes

Add a constant table. No new state or interface changes — fees are simply added to `funds` at development time.

```typescript
const IMPACT_FEE: Record<string, number> = {
  // Initial development fees (building spawns on empty zone)
  'res.low':   500,
  'com.low':   600,
  'ind.low':   400,

  // Density upgrade fees (lower because the tile is already developed)
  'res.med':   300,
  'res.high':  500,
  'com.med':   400,
  'com.high':  600,
  'ind.med':   300,
  'ind.high':  400,
}
```

### Algorithm

Hook into two existing code paths:

**1. New building spawn (`zones.ts: updateZones()`):**

```typescript
// After building is pushed to map.buildings (line 46)
const feeKey = `${zonePrefix}.low`
const fee = IMPACT_FEE[feeKey] ?? 0
// Return fee so Engine.ts can credit funds
```

**2. Density upgrade (`density.ts`):**

```typescript
// When a building upgrades (e.g., res.low -> res.med)
const feeKey = `${prefix}.${newDensitySuffix}`
const fee = IMPACT_FEE[feeKey] ?? 0
// Return fee so Engine.ts can credit funds
```

Both `updateZones()` and the density upgrade function need to return the total fees collected so `Engine.ts` can add them to `funds`.

### Integration Points

- **`zones.ts: updateZones()`** — Return `{ populationDelta, impactFees }` instead of just `{ populationDelta }`. Accumulate fees for all buildings spawned this tick.
- **`density.ts`** — Return impact fees from the density upgrade pass alongside any existing return values.
- **`Engine.ts: tick()`** — After calling `updateZones()` and the density pass, add returned `impactFees` to `this.funds`.
- **`BudgetInfo`** — Optionally add an `impactFeeIncome` field so the budget panel can show one-time revenue separately from recurring tax income. This helps the player distinguish reliable revenue from growth-dependent windfalls.
- **Events** — Optionally emit a `{ type: 'impact_fee', amount }` event when fees are collected, so the UI can flash a notification.

### Key Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `res.low` fee | $500 | Covers ~6 months of low-density residential service drain |
| `com.low` fee | $600 | Slightly higher — commercial triggers more road wear |
| `ind.low` fee | $400 | Lower — we want to encourage industrial development |
| Upgrade fees | $300-600 | Roughly 60% of initial fee — the tile already has some infrastructure |

### Design Note

Impact fees are intentionally modest. They should feel like a pleasant bonus when the city is growing, not a major revenue source. If fees are too high, they create a perverse incentive to maximize churn (bulldoze and re-develop) rather than maintain stable neighborhoods. The fee amounts should total less than 6 months of the building's net tax contribution.

---

## Feature 4: Agglomeration Bonus

### Gameplay Purpose

Clusters of same-category buildings get a productivity bonus that increases their tax revenue. This rewards intentional district design — an industrial park surrounded by other industrial buildings is more productive than an isolated factory. A downtown commercial cluster generates more revenue per building than scattered shops.

This models localization economies from agglomeration research (Marshall 1890, Duranton & Puga 2004): firms in proximity share specialized suppliers, labor pools, and knowledge. Empirical data shows a 3-30% productivity premium from clustering, depending on city size and sector.

### Data Model Changes

No persistent state changes. The agglomeration factor is computed on-the-fly during the budget calculation (Feature 1's per-tile tax loop). It does not need to be stored because it changes whenever buildings are added or removed.

Add constants:

```typescript
const AGGLOMERATION_RADIUS = 4         // tiles — scan radius for same-category neighbors
const AGGLOMERATION_PER_NEIGHBOR = 0.05 // +5% per same-category neighbor
const AGGLOMERATION_MAX_BONUS = 0.50    // cap at +50%
```

### Algorithm

During the per-tile tax loop (Feature 1), compute a cluster bonus for each building:

```typescript
function agglomerationFactor(
  building: Building,
  bldIdx: BuildingIndex,
  buildingDefs: Record<string, BuildingDef>,
): number {
  const def = buildingDefs[building.defId]
  if (!def) return 1.0

  const category = def.category
  let neighbors = 0

  for (let dy = -AGGLOMERATION_RADIUS; dy <= AGGLOMERATION_RADIUS; dy++) {
    for (let dx = -AGGLOMERATION_RADIUS; dx <= AGGLOMERATION_RADIUS; dx++) {
      if (dx === 0 && dy === 0) continue
      const dist = Math.abs(dx) + Math.abs(dy)
      if (dist > AGGLOMERATION_RADIUS) continue

      const neighbor = bldIdx.get(building.x + dx, building.y + dy)
      if (!neighbor || neighbor.id === building.id) continue

      const neighborDef = buildingDefs[neighbor.defId]
      if (neighborDef && neighborDef.category === category) {
        neighbors++
      }
    }
  }

  return 1.0 + Math.min(neighbors * AGGLOMERATION_PER_NEIGHBOR, AGGLOMERATION_MAX_BONUS)
}
```

Apply in the tax loop:

```typescript
// Inside the per-tile tax loop from Feature 1
const agglomMult = agglomerationFactor(building, bldIdx, BUILDING_DEFS)
taxIncome += tileLandValue * densityMult * agglomMult * BASE_TAX_RATE_SCALE * taxRate
```

### Integration Points

- **`budget.ts: calculateBudget()`** — Add `bldIdx: BuildingIndex` parameter. The existing `Engine.ts` already maintains a `BuildingIndex` that can be passed through.
- **`calculateBudget()` signature** — Changes from `(map, population, taxRate, landValues, funding, loanRepayment)` to `(map, population, taxRate, landValues, funding, loanRepayment, bldIdx)`. All call sites in `Engine.ts` must be updated.
- **Land value overlay** — Optionally visualize agglomeration zones in a future UI overlay so the player can see cluster boundaries.

### Key Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| `AGGLOMERATION_RADIUS` | 4 tiles | ~1 city block. Localization effects are strongest at close range. Matches the `parkBonus` scan radius in `land-value.ts`. |
| `AGGLOMERATION_PER_NEIGHBOR` | 0.05 (+5%) | Conservative — a fully surrounded building (up to ~10 neighbors within r=4) gets +50% |
| `AGGLOMERATION_MAX_BONUS` | 0.50 (+50%) | Caps the bonus to prevent runaway revenue from extremely dense clusters. Aligned with the research upper bound of localization benefits |

### Performance Note

The nested loop (buildings x radius scan) uses `BuildingIndex.get()` which is O(1) per tile lookup. For a city with 500 buildings and radius 4, the scan visits ~32 tiles per building = ~16,000 lookups per tick. This is comparable to the existing `parkBonus()` computation in `land-value.ts` and should not be a performance concern.

### Design Note

The bonus applies to tax revenue only, not to demand or density upgrade probability. This keeps the mechanic legible: "cluster your buildings, earn more money." It does not affect whether buildings *want* to develop (that is demand's job) or *can* upgrade (that is density progression's job). The agglomeration bonus is purely a fiscal reward for good spatial planning.

---

## Feature 5: Municipal Bonds

### Gameplay Purpose

Replace the single-loan system with a richer bond issuance mechanic. The player can issue multiple bonds to fund capital projects (infrastructure, service buildings). Bond interest rates depend on the city's credit rating, which is computed from fiscal health indicators. A well-managed city borrows cheaply (3% AAA); a struggling city pays punishing rates (8% BB) or cannot borrow at all.

This adds a strategic financing layer: the player must decide when to borrow, how much, and whether the investment will generate enough incremental revenue to cover debt service. It also creates a visible consequence of fiscal mismanagement — credit rating downgrades increase borrowing costs, creating a downward spiral that mirrors real municipal distress (Detroit's debt service consumed 35% of general fund revenue before bankruptcy).

Emergency loans are retained as a backstop but trigger a credit rating penalty.

### Data Model Changes

**New types in `core/state.ts`:**

```typescript
export type CreditRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB'

export interface Bond {
  id: string
  type: 'general_obligation' | 'revenue'
  principal: number
  remaining: number
  interestRate: number
  termMonths: number        // 120 (10yr), 240 (20yr), or 360 (30yr)
  monthlyPayment: number
  monthsLeft: number
  purpose: string           // freeform label, e.g. "Transit expansion"
}
```

**Changes to `GameState`:**

```typescript
export interface GameState {
  // ... existing fields ...
  loan: Loan | null              // DEPRECATED — keep for save compat, migrate on load
  bonds: Bond[]                  // NEW — replaces single loan
  creditRating: CreditRating     // NEW
  totalDebtService: number       // NEW — sum of all bond monthly payments
}
```

**Changes to `BudgetInfo`:**

```typescript
export interface BudgetInfo {
  // ... existing fields ...
  loanRepayment: number          // RENAMED conceptually to bondRepayment, keep field name for compat
  bondCount: number              // NEW — number of active bonds
  creditRating: CreditRating     // NEW — mirrored here for UI convenience
}
```

### Algorithm

**Credit Rating Calculation:**

```typescript
function calculateCreditRating(
  funds: number,
  monthlyExpenses: number,
  totalDebtService: number,
  taxIncome: number,
  totalDebt: number,
  population: number,
  hadEmergencyLoan: boolean,
): CreditRating {
  // Reserve ratio: months of expenses the city can cover with current funds
  const reserveRatio = monthlyExpenses > 0 ? funds / (monthlyExpenses * 12) : 1.0

  // Debt service ratio: fraction of tax income consumed by debt payments
  const debtServiceRatio = taxIncome > 0 ? (totalDebtService * 12) / taxIncome : 0

  // Debt per capita
  const debtPerCapita = population > 0 ? totalDebt / population : 0

  // Emergency loan penalty
  const emergencyPenalty = hadEmergencyLoan ? 1 : 0

  if (!emergencyPenalty && reserveRatio > 0.25 && debtServiceRatio < 0.10 && debtPerCapita < 2000)
    return 'AAA'
  if (reserveRatio > 0.16 && debtServiceRatio < 0.15 && debtPerCapita < 4000)
    return 'AA'
  if (reserveRatio > 0.08 && debtServiceRatio < 0.20)
    return 'A'
  if (reserveRatio > 0.0)
    return 'BBB'
  return 'BB'
}
```

**Interest Rate Table:**

```typescript
const BOND_INTEREST_RATE: Record<CreditRating, number> = {
  'AAA': 0.03,   // 3.0% annual
  'AA':  0.035,  // 3.5%
  'A':   0.045,  // 4.5%
  'BBB': 0.06,   // 6.0%
  'BB':  0.08,   // 8.0% — same as current emergency loan rate
}
```

**Bond Issuance:**

```typescript
function issueBond(
  state: GameState,
  amount: number,
  termMonths: 120 | 240 | 360,
  type: 'general_obligation' | 'revenue',
  purpose: string,
): { ok: true; bond: Bond } | { ok: false; reason: string } {
  const rating = state.creditRating

  // Cannot issue bonds at junk rating
  if (rating === 'BB') return { ok: false, reason: 'Credit rating too low' }

  // Debt service cap: total debt service cannot exceed 20% of tax income
  const rate = BOND_INTEREST_RATE[rating]
  const monthlyPayment = calcMonthlyPayment(amount, rate, termMonths)
  const newTotalDebtService = state.totalDebtService + monthlyPayment
  const annualDebtService = newTotalDebtService * 12
  if (annualDebtService > state.budget.taxIncome * 0.20) {
    return { ok: false, reason: 'Would exceed 20% debt service limit' }
  }

  // Max 5 active bonds (UI constraint, keeps panel manageable)
  if (state.bonds.length >= 5) {
    return { ok: false, reason: 'Maximum 5 active bonds' }
  }

  const bond: Bond = {
    id: `bond-${Date.now()}`,
    type,
    principal: amount,
    remaining: amount,
    interestRate: rate,
    termMonths,
    monthlyPayment,
    monthsLeft: termMonths,
    purpose,
  }

  return { ok: true, bond }
}
```

**Monthly Tick — Bond Servicing:**

```typescript
// In Engine.ts tick(), replace single loan logic:
let totalBondPayment = 0
for (const bond of this.bonds) {
  const payment = Math.min(bond.monthlyPayment, bond.remaining)
  bond.remaining -= payment
  bond.monthsLeft = Math.max(0, bond.monthsLeft - 1)
  totalBondPayment += payment
}
// Remove fully paid bonds
this.bonds = this.bonds.filter(b => b.remaining > 0)
this.totalDebtService = this.bonds.reduce((sum, b) => sum + b.monthlyPayment, 0)

// Pass totalBondPayment as loanRepayment to calculateBudget
```

### Integration Points

- **`Engine.ts`** — Replace `loan: Loan | null` with `bonds: Bond[]`. Replace `takeLoan()` with `issueBond()`. Replace single-loan tick logic with bond array servicing. Keep `setLoanRepayment()` as a per-bond override or remove it (bonds use fixed amortization).
- **`Engine.ts: emergencyLoan`** — Keep as a special-case bond auto-issued at the `BB` rate. Set a `hadEmergencyLoan` flag that penalizes credit rating for 24 months.
- **`budget.ts: calculateBudget()`** — Accept total bond repayment amount instead of single loan repayment. No algorithmic change — it already treats `loanRepayment` as a lump sum expense.
- **`core/state.ts`** — Add `Bond`, `CreditRating` types. Add `bonds`, `creditRating`, `totalDebtService` to `GameState`. Deprecate `Loan` interface (keep for save migration).
- **Save/load** — Migrate old `loan` field to a single-element `bonds` array on load. Handle missing `creditRating` by computing it from current state.
- **CLI / UI** — New commands or panel for bond issuance (amount, term, purpose). Display credit rating, active bonds with remaining balance, and total debt service.

### Key Constants

| Constant | Value | Rationale |
|----------|-------|-----------|
| AAA interest rate | 3.0% | Roughly matches current high-grade muni bond yields |
| BB interest rate | 8.0% | Matches current emergency loan rate — continuity |
| Max debt service ratio | 20% | Standard red-flag threshold from municipal finance (Detroit was at 35%) |
| Max active bonds | 5 | UI constraint — keeps the bond panel manageable |
| Available terms | 10yr, 20yr, 30yr | Standard muni bond maturities |
| Emergency loan penalty duration | 24 months | Prevents immediate re-borrowing at better rates |
| Credit rating: AAA reserve threshold | 25% | GFOA recommends 16.7% minimum; AAA requires strong reserves |
| Credit rating: AAA debt service threshold | 10% | Conservative — well below the 15-20% warning zone |
| Credit rating: AAA debt per capita threshold | $2,000 | Moderate — U.S. average muni debt per capita is ~$3,500 |

### Migration Strategy

The current `Loan` interface is simple (single loan, 8% fixed, 120-month term). On save load:

1. If `save.state.loan` exists, convert it to a `Bond` with `type: 'general_obligation'`, the existing interest rate and term, and `purpose: 'Legacy loan'`.
2. Place it in the `bonds` array.
3. Compute `creditRating` from current state.
4. Clear the deprecated `loan` field.

---

## Cross-Cutting Concerns

### Budget Formula Summary (After All Features)

```
Monthly Tax Income = SUM over each developed building:
  landValue[tile] * DENSITY_TAX_MULT[density] * agglomerationFactor * BASE_TAX_RATE_SCALE * taxRate

Monthly Expenses =
  + Infrastructure maintenance (roads, rails, power lines, power plants)  [existing]
  + Service costs (police, fire, transit)                                 [existing]
  + Zone service costs (per-tile * ZONE_SERVICE_COST_MULT)                [Feature 2]
  + Bond debt service (sum of all bond monthly payments)                  [Feature 5]

One-Time Income (not in monthly balance):
  + Impact fees on building spawn / density upgrade                       [Feature 3]

Monthly Balance = Tax Income - Expenses
```

### Test Strategy

Each feature should follow Red/Green TDD:

1. **Per-Tile Tax** — Test that a single `res.high` building produces 6x the tax income of a single `res.low` building at the same land value. Test that removing the population dependency does not break early-game viability (write a scenario with 0 population but developed tiles).
2. **Fiscal Multiplier** — Test that a city with only residential zones has higher expenses than a balanced R/C/I city. Test the exact multiplier values against known inputs.
3. **Impact Fees** — Test that building spawn credits funds. Test that density upgrade credits funds. Test that bulldozing and re-developing does not create an exploit (fee < long-term value).
4. **Agglomeration** — Test that an isolated building gets factor 1.0. Test that a building surrounded by 10 same-category neighbors gets factor 1.5. Test that mixed-category neighbors do not contribute.
5. **Bonds** — Test credit rating computation at each threshold. Test bond issuance at each rating. Test that BB rating blocks issuance. Test debt service cap enforcement. Test monthly bond servicing and payoff. Test save migration from old `Loan` format.

### UI Considerations (Out of Scope but Noted)

- Budget panel should show the new `zoneServices` line item.
- A "revenue per tile" overlay would make Feature 1 tangible — color-code tiles by fiscal contribution (green = surplus, red = drain).
- Bond management panel: list active bonds, show credit rating, allow issuance with term/amount selection.
- Impact fee notifications: brief toast when fees are collected during growth.

### Balancing

The five features interact multiplicatively. After implementation, a balancing pass should verify:

1. **Early game (pop 0-500):** Low-density only, no agglomeration, no bonds. Tax income from Feature 1 with `BASE_TAX_RATE_SCALE` tuned so a small town of ~20 low-density buildings at 7% tax breaks even after zone service costs (Feature 2).
2. **Mid game (pop 500-5000):** Medium density emerging, some agglomeration clusters forming. Player should have enough surplus to issue 1-2 bonds for infrastructure. Impact fees from growth should cover ~30% of infrastructure spending.
3. **Late game (pop 5000+):** High-density core generating significant surplus via density multiplier + agglomeration. Bond portfolio active. Sprawling residential periphery visible as a fiscal drain. Credit rating reflects management quality.
