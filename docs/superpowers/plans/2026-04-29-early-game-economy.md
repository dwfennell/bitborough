# Early-Game Economy Tuning Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the first ~10 in-game years economically viable so a player who builds modest residential/commercial zones plus a single small police kiosk and fire substation can break even on a 64-tile map without relying on the emergency-loan backstop.

**Background:** During wealth-tiers CLI testing (recorded 2026-03-24), tax income stayed around 36/255 land-value range and only 1 of 4 zoned residential tiles developed in 20 years. Concrete arithmetic from current code (`packages/engine/src/simulation/budget.ts`, `simulation/land-value.ts`, `simulation/zones.ts`):

- Inland tile max land value: base 10 + road 10 = 20 (no water/parks)
- Tax = `totalTaxValue × taxRate + (population × avgLandValue / 40) × taxRate`
- Default `taxRate` = 0.07; `res.low.taxValue` = 20, capacity = 10
- 5 active `res.low` with 50 residents at avg land-value 20: building tax ≈ $7/mo, land tax ≈ $1.75/mo, total ≈ $9/mo
- Small services (`police.small` $10/mo + `fire.small` $12/mo) = $22/mo before road/power maintenance — net negative even at full occupancy

The diagnosis is that *both halves of the formula bottom out at small scale* and that zone development at `0.12 × demand` per tile per month is too slow when demand is also small.

**Architecture / approach:**

Tune-first, feature-second. Three TDD-driven tuning passes against a deterministic gameplay scenario, then (only if tuning is insufficient) a small "starter grant" feature.

1. **Baseline scenario** — write a deterministic engine-level test that simulates a small starter city for 10 years and asserts measured economy properties. This becomes the regression oracle for all subsequent changes.
2. **Land-value floor** — raise the achievable inland land value for a serviced tile so a simple grid produces meaningful tax even before parks/water are placed.
3. **Tax formula rebalance** — adjust the land-tax denominator and/or `res.low.taxValue` so a fully-occupied 5-house neighborhood plus a small kiosk can break even.
4. **Zone development pacing** — increase the development probability multiplier so reasonable demand fills empty zones in a few months, not years.
5. **Optional: starter grant** — flat one-time or decaying monthly grant for cities under 100 population. Only ship if tuning alone doesn't hit the target.

Each pass is its own task, each task starts with a failing assertion in the baseline scenario, and balance numbers are picked to make the existing scenario pass — not invented up front.

**Tech Stack:** TypeScript, Vitest, pnpm monorepo (`@bitborough/engine`)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `packages/engine/src/__tests__/early-game-economy.test.ts` | Create | Deterministic 10-year scenario asserting break-even economy properties |
| `packages/engine/src/simulation/land-value.ts` | Modify | Raise base/road bonus or add a small "civic" floor for road-served tiles |
| `packages/engine/src/simulation/budget.ts` | Modify | Adjust land-tax denominator if needed (line 102) |
| `packages/engine/src/simulation/zones.ts` | Modify | Bump development probability multiplier (line 32) |
| `packages/engine/src/simulation/grants.ts` | Create (optional) | Starter-grant calculation if tuning is insufficient |
| `packages/engine/src/simulation/tick.ts` | Modify (optional) | Wire grant into monthly tick before budget calc |

---

## Chunk 1: Baseline Scenario

### Task 1: Deterministic early-game scenario test

**Files:**
- Create: `packages/engine/src/__tests__/early-game-economy.test.ts`

- [ ] **Step 1: Write the scenario test (initially expected to FAIL on the assertions)**

Build a 64-tile map with a fixed PRNG seed. Place:
- One diesel generator (use diesel per project memory `feedback_diesel_plants.md`)
- A small grid of dirt roads (e.g., 5×5 connected)
- 8 residential zoned tiles, 4 commercial, 2 industrial — all powered and road-adjacent
- One `service.police.small` and one `service.fire.small`

Run the engine for `10 × 12 × 4` ticks (10 years). Then assert:
- `engine.population >= 50` — zones actually developed
- final `funds >= startingFunds * 0.5` — player did not lose half their treasury
- `engine.budgetInfo.balance >= -5` for the final month — break-even or close
- No emergency loan was triggered (`engine.state.loan === null`)

These thresholds are intentionally easy targets. If they fail, that's the gap to close.

- [ ] **Step 2: Run test to confirm failure**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/early-game-economy.test.ts`
Expected: FAIL on at least one of the assertions. Record the actual numbers in the commit message — they're the baseline.

- [ ] **Step 3: Commit baseline**

```bash
git add packages/engine/src/__tests__/early-game-economy.test.ts
git commit -m "test: baseline scenario for early-game economy (failing — captures current gap)"
```

---

## Chunk 2: Land-Value Floor

### Task 2: Raise achievable inland land value

**Files:**
- Modify: `packages/engine/src/simulation/land-value.ts`
- Modify: `packages/engine/src/__tests__/land-value.test.ts` (if it exists; otherwise inline assertions in the scenario test)

- [ ] **Step 1: Pick the smallest change that meaningfully shifts the average**

Current inland-with-road tile: 10 + 10 = 20 (out of 255). Two minimal candidates, in order of preference:
1. Raise base from 10 → 20 (a tile is "civilized" by virtue of being on a non-water, non-polluted parcel)
2. Raise road bonus from 10 → 15

Try option 1 first — write/update the unit test for `calculateLandValues` to expect inland-road tiles ≈ 30 instead of ≈ 20.

- [ ] **Step 2: Update `land-value.ts` and verify unit tests still pass**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/land-value.test.ts`

- [ ] **Step 3: Re-run scenario test**

If population/funds assertions still fail, **don't keep stacking knobs in this file** — move to Task 3 (tax formula). The scenario will tell us which lever moved.

- [ ] **Step 4: Commit**

```bash
git add packages/engine/src/simulation/land-value.ts packages/engine/src/__tests__/land-value.test.ts
git commit -m "balance: raise base land value to give small cities a working tax base"
```

---

## Chunk 3: Tax Formula Rebalance

### Task 3: Adjust land-tax weighting

**Files:**
- Modify: `packages/engine/src/simulation/budget.ts:102`
- Modify: `packages/engine/src/__tests__/budget.test.ts`

- [ ] **Step 1: Identify the smallest formula change that closes the scenario gap**

Current: `landTax = (population × avgLandValue / 40) × taxRate`

The `/40` divisor was likely tuned against later-game numbers. Two candidates:
1. Lower the divisor to `/20` so land tax doubles at every population
2. Add a per-active-residential-building floor (e.g., `max(taxValue × taxRate, 2)`) so each occupied house guarantees minimum revenue

Prefer (1) — it's a single number and preserves the linear shape.

- [ ] **Step 2: Update `budget.ts`, write/update budget unit tests for new expected values**

Run: `pnpm --filter @bitborough/engine exec vitest run src/__tests__/budget.test.ts`

- [ ] **Step 3: Re-run scenario test**

Population assertion may still fail — that's Task 4. Funds/balance assertions should improve. If balance is now positive but population is still below 50, the bottleneck is zone development, not tax.

- [ ] **Step 4: Commit**

```bash
git add packages/engine/src/simulation/budget.ts packages/engine/src/__tests__/budget.test.ts
git commit -m "balance: rebalance land-tax weight so small populations produce viable revenue"
```

---

## Chunk 4: Zone Development Pacing

### Task 4: Faster zone fill at low demand

**Files:**
- Modify: `packages/engine/src/simulation/zones.ts:32`
- Modify: `packages/engine/src/__tests__/zones.test.ts`

- [ ] **Step 1: Determine the right multiplier**

Current: `probability = 0.12 × zoneDemand`. With early-game demand around 0.3 that's ~3.6% per month per tile — 27 months expected to fill one tile, which matches the "1 of 4 in 20 years" symptom only if demand is even lower.

First check: in the failing baseline scenario, log `engine.demand.residential` for the first 12 months. If it's near zero, the fix is in `demand.ts` (the population-feedback term), not here. If it's positive but small (~0.2-0.4), then bumping the multiplier to `0.20` is the right move.

- [ ] **Step 2: Apply the chosen change with a unit test for the new probability**

If demand is the issue, instead modify `simulation/demand.ts` to prevent residential demand from collapsing at zero population — there should be a baseline "newcomer" demand that doesn't depend on existing residents.

- [ ] **Step 3: Re-run scenario test**

All four assertions (population, funds, balance, no-loan) should now pass. If any still fails, capture the actual numbers and decide whether they justify Chunk 5.

- [ ] **Step 4: Commit**

```bash
git add packages/engine/src/simulation/zones.ts packages/engine/src/__tests__/zones.test.ts
git commit -m "balance: faster zone development pacing so small cities can grow within a decade"
```

---

## Chunk 5: Starter Grant (only if needed)

### Task 5: Decaying monthly grant for tiny cities

**Skip this chunk if Chunks 2-4 made the scenario pass.** Tuning is preferred over new mechanics.

**Files:**
- Create: `packages/engine/src/simulation/grants.ts`
- Create: `packages/engine/src/__tests__/grants.test.ts`
- Modify: `packages/engine/src/simulation/tick.ts` (call grant before budget calc)
- Modify: `packages/engine/src/simulation/budget.ts` (include grant in `taxIncome` or a separate `BudgetInfo.grants` field)
- Modify: `packages/core/src/types.ts` (extend `BudgetInfo`)

- [ ] **Step 1: Spec the grant shape**

Proposed: `grant = max(0, GRANT_BASE × (1 - population / GRANT_CAP_POPULATION))` evaluated monthly. Defaults: `GRANT_BASE = 100`, `GRANT_CAP_POPULATION = 200`. Linear decay from $100/mo at population 0 to $0 at population 200.

- [ ] **Step 2: TDD — write `grants.test.ts` with cases for population 0, 100, 200, 300**

Expected outputs: 100, 50, 0, 0.

- [ ] **Step 3: Implement `grants.ts`**

- [ ] **Step 4: Wire into `tick.ts` before budget calc; surface in `BudgetInfo` so UI can display it**

- [ ] **Step 5: Update scenario test to assert grant was received in first months and faded by year 5**

- [ ] **Step 6: Run full engine suite**

Run: `pnpm --filter @bitborough/engine exec vitest run`

- [ ] **Step 7: Commit**

```bash
git add packages/engine/src/simulation/grants.ts packages/engine/src/__tests__/grants.test.ts packages/engine/src/simulation/tick.ts packages/engine/src/simulation/budget.ts packages/core/src/types.ts
git commit -m "feat: starter grant — decaying monthly subsidy for cities under 200 population"
```

---

## Chunk 6: Verification

### Task 6: Full verification

- [ ] **Step 1: Run full engine test suite**

Run: `pnpm --filter @bitborough/engine exec vitest run`
Expected: all tests pass, including the early-game scenario.

- [ ] **Step 2: Run workspace typecheck and lint**

```bash
pnpm run typecheck
pnpm run lint
```

- [ ] **Step 3: Manual playtest via `bitt`**

The user prefers diesel plants for testing (memory `feedback_diesel_plants.md`). Run `bitt` for a real session and confirm the early game *feels* viable, not just passes the test.

- [ ] **Step 4: Final commit if any cleanup needed**

```bash
git add -u
git commit -m "chore: early-game economy verification fixes"
```

---

## Open Questions

- Does the scenario test belong in `__tests__/` or should longer-running integration scenarios live in a separate `__scenarios__/` folder? Current convention puts integration tests next to unit tests; this stays consistent unless they get slow enough to warrant separation.
- Is the 10-year horizon the right benchmark? A shorter (5-year) version would catch failures faster. Consider running both.
- The wealth-tiers feature already differentiates building taxValue; once early game works at all, those mid-game numbers may need a re-tune since the bottom of the curve shifted.
