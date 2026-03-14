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
```

Extend `BudgetInfo`:
```ts
loanRepayment: number   // monthly amount being repaid this month (≥ monthlyPayment)
```

Extend `GameState`:
```ts
loan: Loan | null
```

Extend `SaveFile.state`:
```ts
loan?: Loan | null
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
- `loan !== null` → new `FailReason.LoanExists` (added to core enum)
- `amount < 10_000` → `FailReason.InvalidLocation` (reused — amount below minimum)
- `amount > maxLoanAmount` → `FailReason.InsufficientFunds` (amount exceeds limit)

On success: computes `monthlyPayment`, sets `this.loan`, adds `amount` to `this.funds`.

### 2d. Automatic Emergency Loan

In `Engine.tick()`, after applying the monthly budget:

```ts
if (this.funds < 0 && this.loan === null) {
  // borrow enough to cover 6 months of projected expenses
  const emergencyAmount = Math.max(10_000, -this.funds + this.budgetInfo.projectedExpenses * 6)
  const capped = Math.min(emergencyAmount, maxLoanAmount(this.budgetInfo))
  this.takeLoan(capped)
  this.events.push({ type: 'emergency_loan', amount: capped })
}
```

If a loan is already active and funds go negative: funds go negative, the game continues (no hard bankruptcy — the player must manage their way out by adjusting taxes/services).

### 2e. Repayment

Monthly repayment is deducted from funds as part of the budget cycle (before the emergency loan check). The player controls repayment rate via a slider:

- **Range:** `monthlyPayment` (minimum) to `loan.remaining` (pay off in full)
- **Step:** $500
- **Stored as:** `this.loanRepaymentAmount: number` on Engine (defaults to `monthlyPayment`)

Each monthly tick:
```ts
const payment = Math.min(this.loanRepaymentAmount, this.loan.remaining)
this.loan.remaining -= payment
this.funds -= payment
if (this.loan.remaining <= 0) this.loan = null
```

`loanRepayment` is included in `BudgetInfo` so BudgetPanel can display it as a line item.

### 2f. Events Surface

New field on `GameState`:
```ts
events: GameEvent[]   // cleared each tick, consumed by Game.ts
```

```ts
export interface GameEvent {
  type: 'emergency_loan'
  amount: number
}
```

`Game.ts` reads events each tick and shows a brief notification (e.g. a toast or status bar message).

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
| `packages/core/src/state.ts` | Add `Loan`, `GameEvent`; extend `BudgetInfo`, `GameState`, `SaveFile` |
| `packages/core/src/index.ts` | Export new types |
| `packages/engine/src/Engine.ts` | Monthly budget apply, loan state, `takeLoan()`, repayment tick, events |
| `packages/engine/src/simulation/budget.ts` | Add `loanRepayment` to output |
| `packages/game/src/ui/BudgetPanel.ts` | Loan UI section (take/repay/status) |
| `packages/game/src/Game.ts` | Consume `events`, show notifications |
| `packages/game/src/storage/SaveManager.ts` | Serialize/deserialize `loan` |

---

## 5. Out of Scope

- Hard bankruptcy / game-over (deferred — player can run negative if loan maxed out)
- Multiple concurrent loans
- Variable interest rates
- Stats history snapshots (separate spec)
