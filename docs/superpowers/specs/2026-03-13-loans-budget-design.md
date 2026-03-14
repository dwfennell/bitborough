# Loans & Monthly Budget — Design Spec

**Date:** 2026-03-13
**Milestone:** 5 (Budget & Time) — completing the remaining gap (bankruptcy prevention via loans)

---

## Overview

Two related changes that complete Milestone 5:

1. **Monthly budget cadence** — funds update every month instead of annually
2. **Loan system** — manual loans + automatic emergency credit when funds go negative

---

## 1. Monthly Budget Cadence

### Current behaviour

`Engine.tick()` applies `this.funds += this.budgetInfo.balance` only when `this.month === 1` (once per year). The player can overspend for up to 11 months with no consequence.

### New behaviour

`this.funds += this.budgetInfo.balance` runs every monthly tick. `budgetInfo.balance` is already computed monthly; only the application timing changes. The `projectedBalance` field on `BudgetInfo` becomes the actual monthly delta (no rename needed — it was always shown as the monthly figure in the UI).

### Impact

- Players feel budget pressure immediately rather than once a year
- Starting funds / costs must be reviewed to ensure early game remains playable (costs are currently tuned for annual application — monthly means 12× more frequent deductions; existing balance values are already monthly rates so no scaling needed)
- No changes to `calculateBudget()` signature or output shape

---

## 2. Loan System

### 2a. Data Model

Add to `@bitborough/core/src/state.ts`:

```ts
export interface Loan {
  principal: number       // original amount borrowed
  remaining: number       // outstanding balance
  monthlyPayment: number  // required minimum monthly installment
  termMonths: number      // original repayment term (months)
  monthsLeft: number      // months remaining at minimum payment pace
  interestRate: number    // annual rate (e.g. 0.08 = 8%)
}

export interface GameEvent {
  type: 'emergency_loan' | 'negative_funds'
  amount?: number
}
```

Extend `BudgetInfo`:
```ts
loanRepayment: number   // monthly repayment amount; included in balance and projectedExpenses
```

`calculateBudget()` gains a new final parameter `loanRepayment: number` (Engine passes `Math.min(this.loanRepaymentAmount, this.loan?.remaining ?? 0)`, or 0 if no loan). It subtracts `loanRepayment` from `balance` and adds it to `projectedExpenses` so that `balance` reflects true monthly cash flow including debt service.

Extend `GameState`:
```ts
loan: Loan | null
loanRepaymentAmount: number   // current repayment slider value (0 if no loan)
events: GameEvent[]           // populated during tick, cleared at the START of the next monthly tick
```

Extend `SaveFile.state`:
```ts
loan?: Loan | null
loanRepaymentAmount?: number   // defaults to loan.monthlyPayment on load if absent
```

### 2b. Loan Terms

- **Term:** 10 years (120 months)
- **Interest rate:** 8% annually (≈ 0.667%/month)
- **Monthly installment:** computed via standard amortization:
  `P × r / (1 − (1+r)^−n)` where r = monthly rate, n = 120
- **Maximum loan amount:** `4 × annual tax income` (= `budgetInfo.taxIncome × 48`). Prevents debt spiraling on cities with no income base.
- **Minimum loan amount:** $10,000

### 2c. Manual Loan

New Engine method:
```ts
takeLoan(amount: number): Result
```

Failure cases:
- `loan !== null` → `FailReason.LoanExists` (new entry in core enum)
- `amount < 10_000 || amount > maxLoanAmount` → `FailReason.AmountOutOfRange` (new entry in core enum)

On success: computes `monthlyPayment` via amortization, sets `this.loan`, sets `this.loanRepaymentAmount = monthlyPayment`, adds `amount` to `this.funds`.

### 2d. Automatic Emergency Loan

Events are cleared at the **start** of each monthly tick (before any simulation runs). This ensures `getState()` always returns the events from the tick that just completed, and they remain visible for one full frame.

In `Engine.tick()`, after applying the monthly budget (which now includes repayment):

```ts
if (this.funds < 0 && this.loan === null) {
  // borrow enough to cover ~6 months of base expenses (maintenance + services only)
  const baseExpenses = this.budgetInfo.maintenanceCosts.total + this.budgetInfo.serviceCosts.total
  const emergencyAmount = Math.max(10_000, -this.funds + baseExpenses * 6)
  // Emergency loans bypass takeLoan() validation — applied directly to avoid silent failure
  // on zero-income cities where maxLoanAmount would be 0
  const r = 0.08 / 12
  const n = 120
  const monthlyPayment = emergencyAmount * r / (1 - Math.pow(1 + r, -n))
  this.loan = { principal: emergencyAmount, remaining: emergencyAmount, monthlyPayment, termMonths: n, monthsLeft: n, interestRate: 0.08 }
  this.loanRepaymentAmount = monthlyPayment
  this.funds += emergencyAmount
  this.events.push({ type: 'emergency_loan', amount: emergencyAmount })
}
```

Note: emergency loans bypass `takeLoan()` validation entirely so they always succeed, even for cities with zero tax income. `emergencyAmount` has no upper cap — the city is already insolvent.

**If a loan is already active and funds go negative:** the game continues (no hard bankruptcy). Engine fires `{ type: 'negative_funds' }` event so `Game.ts` can display a persistent warning in the InfoBar or status area until funds recover.

### 2e. Repayment

Monthly repayment is applied during the budget cycle (before the emergency loan check). The player controls repayment rate via a slider:

- **Range:** `monthlyPayment` (minimum) to `loan.remaining` (pay off in full this month)
- **Step:** $500
- **Stored as:** `this.loanRepaymentAmount: number` on Engine (persisted in SaveFile)

**Tick order within the monthly block:**

1. `calculateBudget(...)` — passes `loanRepayment = Math.min(this.loanRepaymentAmount, this.loan?.remaining ?? 0)` so balance already deducts the payment
2. `this.funds += this.budgetInfo.balance` — applies the full monthly result including repayment
3. Update loan book only (funds already adjusted via balance):
```ts
if (this.loan) {
  const payment = this.budgetInfo.loanRepayment  // same value used in calculateBudget
  this.loan.remaining -= payment
  if (this.loan.remaining <= 0) { this.loan = null; this.loanRepaymentAmount = 0 }
}
```
4. Emergency loan check (if `this.funds < 0 && this.loan === null`)

`loanRepayment` is always subtracted from `balance` exactly once — through `calculateBudget()`. The loan book update in step 3 only adjusts `loan.remaining`, never `this.funds`.

### 2f. Events Surface

`Engine` holds `private events: GameEvent[] = []`. At the **start** of each monthly tick, `this.events = []` before any simulation code runs. Events pushed during the tick are available via `getState().events` until the next monthly tick clears them.

`Game.ts` reads `state.events` after each `tick()` call:
- `emergency_loan` → flash toast notification ("Emergency loan of $X taken")
- `negative_funds` → show persistent warning in InfoBar while `state.funds < 0 && state.loan !== null`

---

## 3. UI Changes

### BudgetPanel additions

1. **Loan status section** (shown when `loan !== null`):
   - Remaining balance, monthly payment, months left
   - Repayment rate slider (`monthlyPayment` → `remaining`, step $500)
   - "Pay Off" button (sets repayment to `remaining`)

2. **Take Loan section** (shown when `loan === null`):
   - Amount input (number field, $10k–max)
   - Preview of monthly payment and total cost
   - "Take Loan" button

3. **Budget line item** for loan repayment (between services and balance):
   ```
   Loan Repayment    -$1,234
   ```

---

## 4. Affected Files

| File | Change |
|---|---|
| `packages/core/src/state.ts` | Add `Loan`, `GameEvent`; add `LoanExists`, `AmountOutOfRange` to `FailReason`; extend `BudgetInfo` with `loanRepayment`; extend `GameState` with `loan`, `loanRepaymentAmount`, `events`; extend `SaveFile.state` with `loan`, `loanRepaymentAmount` |
| `packages/core/src/index.ts` | Export new types |
| `packages/engine/src/Engine.ts` | Monthly budget apply, loan state, `loanRepaymentAmount`, `takeLoan()`, repayment tick, events lifecycle |
| `packages/engine/src/simulation/budget.ts` | Accept `loanRepayment` param, include in `balance` and `projectedExpenses` |
| `packages/game/src/ui/BudgetPanel.ts` | Loan UI section (take/repay/status), repayment slider |
| `packages/game/src/Game.ts` | Consume `events`, show toast/InfoBar notifications |
| `packages/game/src/storage/SaveManager.ts` | Serialize/deserialize `loan`, `loanRepaymentAmount` |

---

## 5. Out of Scope

- Hard bankruptcy / game-over (deferred — player can run negative if loan maxed out)
- Multiple concurrent loans
- Variable interest rates
- Stats history snapshots (separate spec)
