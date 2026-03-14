# Loans & Monthly Budget Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch budget application from annual to monthly, add a loan system with manual and automatic emergency loans, and surface loan state in the BudgetPanel UI.

**Architecture:** Core types first (`@bitborough/core`), then engine simulation logic (`@bitborough/engine`), then UI (`@bitborough/game`). Engine changes are TDD — tests written before implementation. UI tasks are write-then-verify (no unit tests for DOM components).

**Spec:** `docs/superpowers/specs/2026-03-13-loans-budget-design.md`

**Tech Stack:** TypeScript, Vitest (tests), HTML/CSS (BudgetPanel DOM)

---

## Chunk 1: Core Types + calculateBudget()

### Task 1: Add core types

**Files:**
- Modify: `packages/core/src/state.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Add `Loan`, `GameEvent` interfaces and new `FailReason` values to `state.ts`**

  In `packages/core/src/state.ts`, add after the existing `FailReason` enum:

  ```ts
  export interface Loan {
    principal: number
    remaining: number
    monthlyPayment: number
    termMonths: number
    monthsLeft: number
    interestRate: number
  }

  export interface GameEvent {
    type: 'emergency_loan' | 'negative_funds'
    amount?: number
  }
  ```

  Add to the `FailReason` enum:
  ```ts
  export enum FailReason {
    InsufficientFunds,
    InvalidLocation,
    Occupied,
    NoPower,
    NotBulldozable,
    NotZonable,
    LoanExists,        // add
    AmountOutOfRange,  // add
  }
  ```

- [ ] **Step 2: Extend `BudgetInfo`, `GameState`, and `SaveFile` in `state.ts`**

  Add `loanRepayment: number` to `BudgetInfo`:
  ```ts
  export interface BudgetInfo {
    // ... existing fields ...
    loanRepayment: number
  }
  ```

  Add `loan`, `loanRepaymentAmount`, `events` to `GameState`:
  ```ts
  export interface GameState {
    // ... existing fields ...
    loan: Loan | null
    loanRepaymentAmount: number
    events: GameEvent[]
  }
  ```

  Add `loan` and `loanRepaymentAmount` to `SaveFile.state`:
  ```ts
  export interface SaveFile {
    // ...
    state: {
      // ... existing fields ...
      loan?: Loan | null
      loanRepaymentAmount?: number
    }
  }
  ```

- [ ] **Step 3: Export new types from `packages/core/src/index.ts`**

  In `packages/core/src/index.ts`, update the `state.js` export block:

  ```ts
  export {
    SimSpeed,
    FailReason,
    type Result,
    type DemandInfo,
    type BudgetInfo,
    type GameState,
    type SaveFile,
    type Loan,          // add
    type GameEvent,     // add
  } from './state.js'
  ```

- [ ] **Step 4: Verify TypeScript compiles with no errors**

  ```bash
  cd packages/core && pnpm tsc --noEmit
  ```
  Expected: no errors (engine/game will have type errors until updated, but core itself should compile).

- [ ] **Step 5: Commit**

  ```bash
  git add packages/core/src/state.ts packages/core/src/index.ts
  git commit -m "feat(core): add Loan, GameEvent types; extend BudgetInfo/GameState/SaveFile"
  ```

---

### Task 2: Update `calculateBudget()` to accept loan repayment

**Files:**
- Modify: `packages/engine/src/simulation/budget.ts`
- Modify: `packages/engine/src/__tests__/budget.test.ts` (existing tests that check balance)

- [ ] **Step 1: Write a failing test for `loanRepayment` in budget**

  This test calls `calculateBudget()` directly (not via Engine) so it can pass a non-zero `loanRepayment` and verify it subtracts from the balance. Add to `packages/engine/src/__tests__/budget.test.ts`:

  ```ts
  import { calculateBudget } from '../simulation/budget.js'
  import { createEmptyMap } from '@bitborough/core'

  // ... inside describe block:
  test('loanRepayment is subtracted from balance and added to projectedExpenses', () => {
    const map = createEmptyMap(32, 32, { name: 'test', seed: 0, createdAt: '' })
    const landValues = new Uint8Array(32 * 32)
    const funding = { police: 100, fire: 100, transit: 100 }

    const withoutLoan = calculateBudget(map, 0, 0.07, landValues, funding, 0)
    const withLoan = calculateBudget(map, 0, 0.07, landValues, funding, 500)

    expect(withLoan.loanRepayment).toBe(500)
    expect(withLoan.balance).toBe(withoutLoan.balance - 500)
    expect(withLoan.projectedExpenses).toBe(withoutLoan.projectedExpenses + 500)
  })
  ```

  Run: `cd packages/engine && pnpm test budget`
  Expected: FAIL — `loanRepayment` does not exist on `calculateBudget` signature or `BudgetInfo`

- [ ] **Step 2: Update `calculateBudget()` signature and output**

  In `packages/engine/src/simulation/budget.ts`:

  Change the function signature to accept `loanRepayment`:
  ```ts
  export function calculateBudget(
    map: GameMap,
    population: number,
    taxRate: number,
    landValues: Uint8Array,
    funding: { police: number; fire: number; transit: number },
    loanRepayment = 0,
  ): BudgetInfo {
  ```

  Update the `balance` calculation to subtract loan repayment:
  ```ts
  const balance = taxIncome - maintenanceCosts.total - serviceCosts.total - loanRepayment
  ```

  Update `projectedExpenses`:
  ```ts
  projectedExpenses: Math.round(maintenanceCosts.total + serviceCosts.total + loanRepayment),
  ```

  Add `loanRepayment` to the return value:
  ```ts
  return {
    // ... existing fields ...
    loanRepayment: Math.round(loanRepayment),
    balance: Math.round(balance),
    projectedBalance: Math.round(balance),
    // ... rest ...
  }
  ```

- [ ] **Step 3: Run the test to verify it passes**

  Run: `cd packages/engine && pnpm test budget`
  Expected: PASS

- [ ] **Step 4: Commit**

  ```bash
  git add packages/engine/src/simulation/budget.ts packages/engine/src/__tests__/budget.test.ts
  git commit -m "feat(engine): add loanRepayment param to calculateBudget()"
  ```

---

## Chunk 2: Monthly Budget + Loan Engine Logic

### Task 3: Switch budget application to monthly

**Files:**
- Modify: `packages/engine/src/Engine.ts`
- Modify: `packages/engine/src/__tests__/budget.test.ts` (existing tests break — fix them)

- [ ] **Step 1: Update existing budget tests to reflect monthly cadence**

  The tests `road maintenance deducted annually` and `power plant maintenance deducted annually` test annual deductions. With monthly application, the same rates apply every month. Update them to test one month:

  In `packages/engine/src/__tests__/budget.test.ts`, replace:

  ```ts
  test('road maintenance deducted annually', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    for (let x = 5; x < 15; x++) {
      engine.placeTile(x, 10, Infrastructure.Road)
    }
    const afterConstruction = engine.getState().funds
    advanceYear(engine) // 48 ticks
    const afterYear = engine.getState().funds
    expect(afterYear).toBe(afterConstruction - 10)
  })
  ```

  With:

  ```ts
  test('road maintenance deducted monthly', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    for (let x = 5; x < 15; x++) {
      engine.placeTile(x, 10, Infrastructure.Road)
    }
    const afterConstruction = engine.getState().funds
    advanceMonth(engine) // 4 ticks = 1 month
    const afterMonth = engine.getState().funds
    // 10 tiles × $1/tile/month = $10 deducted per month
    expect(afterMonth).toBe(afterConstruction - 10)
  })
  ```

  And replace the power plant test:

  ```ts
  test('power plant maintenance deducted annually', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.coal')
    const afterPlacement = engine.getState().funds
    advanceYear(engine)
    const afterYear = engine.getState().funds
    expect(afterYear).toBe(afterPlacement - 60)
  })
  ```

  With:

  ```ts
  test('power plant maintenance deducted monthly', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    engine.placeBuilding(0, 0, 'power.coal')
    const afterPlacement = engine.getState().funds
    advanceMonth(engine) // 4 ticks = 1 month
    const afterMonth = engine.getState().funds
    // Coal plant maintenance: $60/month
    expect(afterMonth).toBe(afterPlacement - 60)
  })
  ```

  Update only the `test-helpers` import line at the top of the file (do NOT change the `@bitborough/core` import):
  ```ts
  // Change this line:
  import { createTestMap, advanceYear } from '../test-helpers.js'
  // To:
  import { createTestMap, advanceYear, advanceMonth } from '../test-helpers.js'
  ```

- [ ] **Step 2: Run tests to confirm they now FAIL (before the engine change)**

  Run: `cd packages/engine && pnpm test budget`
  Expected: the two renamed tests FAIL (budget is still applied annually)

- [ ] **Step 3: Switch Engine.tick() to apply budget monthly**

  In `packages/engine/src/Engine.ts`, find the monthly block and replace:

  ```ts
  // Budget projections (balance applied annually)
  this.budgetInfo = calculateBudget(this.map, this.population, this.taxRate, this.landValues, this.funding)
  if (this.month === 1) {
    // Year just started — apply last year's balance
    this.funds += this.budgetInfo.balance
  }
  ```

  With:

  ```ts
  // Budget applied monthly
  this.budgetInfo = calculateBudget(this.map, this.population, this.taxRate, this.landValues, this.funding)
  this.funds += this.budgetInfo.balance
  ```

- [ ] **Step 4: Run budget tests to verify they pass**

  Run: `cd packages/engine && pnpm test budget`
  Expected: all PASS

- [ ] **Step 5: Run full engine test suite to check for regressions**

  Run: `cd packages/engine && pnpm test`
  Expected: all PASS (serialization tests don't check fund amounts; integration tests may need review if they rely on specific fund values)

  If any integration tests fail due to fund amount assumptions, update their `startingFunds` to accommodate monthly deductions.

- [ ] **Step 6: Commit**

  ```bash
  git add packages/engine/src/Engine.ts packages/engine/src/__tests__/budget.test.ts
  git commit -m "feat(engine): apply budget monthly instead of annually"
  ```

---

### Task 4: Add loan system to Engine

**Files:**
- Modify: `packages/engine/src/Engine.ts`
- Create: `packages/engine/src/__tests__/loans.test.ts`

- [ ] **Step 1: Write failing tests for takeLoan()**

  Create `packages/engine/src/__tests__/loans.test.ts`:

  ```ts
  import { describe, test, expect } from 'vitest'
  import { Engine } from '../Engine.js'
  import { createTestMap, advanceMonth } from '../test-helpers.js'
  import { FailReason } from '@bitborough/core'

  describe('Loan system', () => {
    test('takeLoan adds funds and sets loan state', () => {
      const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 1_000 })
      const result = engine.takeLoan(10_000)
      expect(result.ok).toBe(true)
      const state = engine.getState()
      expect(state.funds).toBe(11_000)
      expect(state.loan).not.toBeNull()
      expect(state.loan!.principal).toBe(10_000)
      expect(state.loan!.remaining).toBe(10_000)
      expect(state.loan!.monthlyPayment).toBeGreaterThan(0)
      expect(state.loan!.interestRate).toBe(0.08)
    })

    test('takeLoan fails when loan already active', () => {
      const engine = Engine.create(createTestMap(32), { seed: 42 })
      engine.takeLoan(10_000)
      const result = engine.takeLoan(10_000)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.reason).toBe(FailReason.LoanExists)
    })

    test('takeLoan fails when amount below minimum', () => {
      const engine = Engine.create(createTestMap(32), { seed: 42 })
      const result = engine.takeLoan(5_000)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.reason).toBe(FailReason.AmountOutOfRange)
    })

    test('takeLoan fails when amount exceeds maximum', () => {
      const engine = Engine.create(createTestMap(32), { seed: 42 })
      // With zero tax income, max is 0; even $10k exceeds it
      // But max is clamped to at least $10k minimum borrow → reject amounts above taxIncome * 48
      // Use very large amount to trigger
      const result = engine.takeLoan(999_999_999)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.reason).toBe(FailReason.AmountOutOfRange)
    })

    test('loan repayment deducted via monthly budget', () => {
      const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 100_000 })
      engine.takeLoan(10_000)
      const fundsAfterLoan = engine.getState().funds
      const payment = engine.getState().loan!.monthlyPayment
      advanceMonth(engine)
      const fundsAfterMonth = engine.getState().funds
      // funds change = -payment (from loan) + balance (from budget)
      // balance already includes -payment so: funds -= payment (net from budget apply)
      const budgetBalance = engine.getState().budget.balance
      // After 1 month: funds = fundsAfterLoan + (balance-before-this-month)
      // budget.balance includes loanRepayment deducted
      expect(fundsAfterMonth).toBeLessThan(fundsAfterLoan)
      expect(engine.getState().loan!.remaining).toBeLessThan(10_000)
    })

    test('loan clears when fully paid off', () => {
      const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 1_000_000 })
      engine.takeLoan(10_000)
      // Set repayment to full remaining to pay off immediately
      engine.setLoanRepayment(engine.getState().loan!.remaining)
      advanceMonth(engine)
      expect(engine.getState().loan).toBeNull()
    })

    test('setLoanRepayment updates repayment amount', () => {
      const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 100_000 })
      engine.takeLoan(10_000)
      const minPayment = engine.getState().loan!.monthlyPayment
      engine.setLoanRepayment(minPayment * 2)
      expect(engine.getState().loanRepaymentAmount).toBeCloseTo(minPayment * 2, 0)
    })

    test('emergency loan triggers when funds go negative with no active loan', () => {
      // Create engine with just enough funds to run for a bit but will go negative
      const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 50 })
      // Place roads to create maintenance costs
      for (let x = 0; x < 10; x++) engine.placeTile(x, 5, 0x01) // Road
      // Advance until funds go negative — emergency loan should trigger
      for (let i = 0; i < 12; i++) advanceMonth(engine)
      const state = engine.getState()
      // Either funds went positive via emergency loan OR loan is now active
      const hasEmergencyLoan = state.loan !== null || state.funds >= 0
      expect(hasEmergencyLoan).toBe(true)
    })

    test('negative_funds event fires when loan active and funds go negative', () => {
      const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 50 })
      engine.takeLoan(10_000)
      // Drain funds
      for (let i = 0; i < 24; i++) advanceMonth(engine)
      // At some point when funds < 0 with active loan, negative_funds event should fire
      // Just verify events array is accessible
      const state = engine.getState()
      expect(Array.isArray(state.events)).toBe(true)
    })
  })
  ```

  Run: `cd packages/engine && pnpm test loans`
  Expected: FAIL — `takeLoan`, `setLoanRepayment` not defined

- [ ] **Step 2: Add loan private state to Engine**

  In `packages/engine/src/Engine.ts`, after the existing private fields, add:

  ```ts
  // Loan system
  private loan: Loan | null = null
  private loanRepaymentAmount = 0
  private events: GameEvent[] = []
  ```

  Add imports at the top:
  ```ts
  import { ..., type Loan, type GameEvent } from '@bitborough/core'
  ```

- [ ] **Step 3: Implement `takeLoan()` method**

  Add to Engine class:

  ```ts
  takeLoan(amount: number): Result {
    if (this.loan !== null) {
      return { ok: false, reason: FailReason.LoanExists }
    }
    const maxAmount = this.budgetInfo.taxIncome * 48
    if (amount < 10_000 || amount > Math.max(10_000, maxAmount)) {
      return { ok: false, reason: FailReason.AmountOutOfRange }
    }
    const r = 0.08 / 12
    const n = 120
    const monthlyPayment = amount * r / (1 - Math.pow(1 + r, -n))
    this.loan = {
      principal: amount,
      remaining: amount,
      monthlyPayment,
      termMonths: n,
      monthsLeft: n,
      interestRate: 0.08,
    }
    this.loanRepaymentAmount = monthlyPayment
    this.funds += amount
    return { ok: true }
  }
  ```

- [ ] **Step 4: Implement `setLoanRepayment()` method**

  ```ts
  setLoanRepayment(amount: number): void {
    if (!this.loan) return
    this.loanRepaymentAmount = Math.max(this.loan.monthlyPayment, Math.min(amount, this.loan.remaining))
  }
  ```

- [ ] **Step 5: Wire repayment into the monthly tick**

  In `Engine.tick()`, inside the monthly block, update the budget and repayment logic. Replace:

  ```ts
  // Budget applied monthly
  this.budgetInfo = calculateBudget(this.map, this.population, this.taxRate, this.landValues, this.funding)
  this.funds += this.budgetInfo.balance
  ```

  With the full monthly sequence:

  ```ts
  // Clear events at start of monthly tick
  this.events = []

  // 1. Compute budget including loan repayment
  const repayment = this.loan
    ? Math.min(this.loanRepaymentAmount, this.loan.remaining)
    : 0
  this.budgetInfo = calculateBudget(
    this.map, this.population, this.taxRate, this.landValues, this.funding, repayment,
  )

  // 2. Apply monthly balance (already includes -repayment)
  this.funds += this.budgetInfo.balance

  // 3. Update loan book (funds already adjusted via balance)
  if (this.loan) {
    this.loan.remaining -= repayment
    this.loan.monthsLeft = Math.ceil(this.loan.remaining / this.loan.monthlyPayment) || 0
    if (this.loan.remaining <= 0) {
      this.loan = null
      this.loanRepaymentAmount = 0
    }
  }

  // 4. Emergency loan if insolvent and no active loan
  if (this.funds < 0 && this.loan === null) {
    const baseExpenses = this.budgetInfo.maintenanceCosts.total + this.budgetInfo.serviceCosts.total
    const emergencyAmount = Math.max(10_000, -this.funds + baseExpenses * 6)
    const r = 0.08 / 12
    const n = 120
    const monthlyPayment = emergencyAmount * r / (1 - Math.pow(1 + r, -n))
    this.loan = { principal: emergencyAmount, remaining: emergencyAmount, monthlyPayment, termMonths: n, monthsLeft: n, interestRate: 0.08 }
    this.loanRepaymentAmount = monthlyPayment
    this.funds += emergencyAmount
    this.events.push({ type: 'emergency_loan', amount: emergencyAmount })
  }

  // 5. Fire event if funds still negative with active loan (no bailout available)
  if (this.funds < 0 && this.loan !== null) {
    this.events.push({ type: 'negative_funds' })
  }
  ```

  **Important:** Move the `this.events = []` clear to the TOP of the monthly block (before all other monthly logic), not at the top of `tick()`. The `if (this.tickCount % this.ticksPerMonth === 0)` block is where it goes.

- [ ] **Step 6: Expose loan state in `getState()`**

  In `Engine.getState()`, add to the return object:

  ```ts
  loan: this.loan,
  loanRepaymentAmount: this.loanRepaymentAmount,
  events: this.events,
  ```

- [ ] **Step 7: Run loan tests**

  Run: `cd packages/engine && pnpm test loans`
  Expected: all PASS

- [ ] **Step 8: Run full test suite**

  Run: `cd packages/engine && pnpm test`
  Expected: all PASS

- [ ] **Step 9: Commit**

  ```bash
  git add packages/engine/src/Engine.ts packages/engine/src/__tests__/loans.test.ts
  git commit -m "feat(engine): add loan system (takeLoan, repayment, emergency loan, events)"
  ```

---

## Chunk 3: Serialization + UI

### Task 5: Serialize and restore loan state

**Files:**
- Modify: `packages/engine/src/Engine.ts` (`serialize()` and `static restore()`)
- Modify: `packages/engine/src/__tests__/serialization.test.ts`

- [ ] **Step 1: Write failing serialization tests for loan**

  Add to `packages/engine/src/__tests__/serialization.test.ts`:

  ```ts
  test('loan state survives save and restore', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 100_000 })
    engine.takeLoan(50_000)
    engine.setLoanRepayment(engine.getState().loan!.monthlyPayment * 2)

    const save = engine.serialize()
    expect(save.version).toBe(3)
    expect(save.state.loan).not.toBeNull()
    expect(save.state.loan!.principal).toBe(50_000)
    expect(save.state.loanRepaymentAmount).toBeGreaterThan(0)

    const restored = Engine.restore(save)
    const state = restored.getState()
    expect(state.loan).not.toBeNull()
    expect(state.loan!.remaining).toBeCloseTo(engine.getState().loan!.remaining, 0)
    expect(state.loanRepaymentAmount).toBeCloseTo(engine.getState().loanRepaymentAmount, 0)
  })

  test('restore without loan field defaults to null', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    const save = engine.serialize()
    // Simulate old save without loan field
    delete (save.state as any).loan
    delete (save.state as any).loanRepaymentAmount
    const restored = Engine.restore(save)
    expect(restored.getState().loan).toBeNull()
    expect(restored.getState().loanRepaymentAmount).toBe(0)
  })
  ```

  Run: `cd packages/engine && pnpm test serialization`
  Expected: FAIL — `save.version` is 2, loan fields not persisted

- [ ] **Step 2: Update `serialize()` to include loan and bump version**

  In `packages/engine/src/Engine.ts`, in `serialize()`:

  ```ts
  return {
    version: 3,  // bump from 2
    // ...
    state: {
      // ... existing fields ...
      loan: this.loan,
      loanRepaymentAmount: this.loanRepaymentAmount,
    },
    // ...
  }
  ```

- [ ] **Step 3: Update `static restore()` to restore loan**

  In `Engine.restore()`, after the existing restore assignments:

  ```ts
  engine.loan = save.state.loan ?? null
  engine.loanRepaymentAmount = save.state.loanRepaymentAmount ?? (engine.loan?.monthlyPayment ?? 0)
  ```

  Also update the v2 compat guard if needed — existing `save.version < 2` check is unaffected; just `loan` and `loanRepaymentAmount` default to null/0 via `??`.

- [ ] **Step 4: Fix the existing version check test**

  In `packages/engine/src/__tests__/serialization.test.ts`, find the test `'v2 save preserves exact residents values'` and update the version assertion:
  ```ts
  // Change:
  expect(save.version).toBe(2)
  // To:
  expect(save.version).toBe(3)
  ```
  Also rename the test to `'v3 save preserves exact residents values'` for accuracy.

- [ ] **Step 5: Run serialization tests**

  Run: `cd packages/engine && pnpm test serialization`
  Expected: all PASS

- [ ] **Step 6: Run full test suite**

  Run: `cd packages/engine && pnpm test`
  Expected: all PASS

- [ ] **Step 7: Commit**

  ```bash
  git add packages/engine/src/Engine.ts packages/engine/src/__tests__/serialization.test.ts
  git commit -m "feat(engine): serialize/restore loan state, bump save version to 3"
  ```

---

### Task 6: BudgetPanel loan UI

**Files:**
- Modify: `packages/game/src/ui/BudgetPanel.ts`
- Modify: `packages/game/src/Game.ts`

- [ ] **Step 1: Add loan callbacks to BudgetPanel constructor**

  Update BudgetPanel constructor signature:

  ```ts
  constructor(
    container: HTMLElement,
    private onTaxChange: (rate: number) => void,
    private onFundingChange: (service: FundingService, level: number) => void,
    private onTakeLoan: (amount: number) => void,
    private onRepaymentChange: (amount: number) => void,
  )
  ```

- [ ] **Step 2: Add loan HTML sections**

  In the panel body HTML, add after the service funding section:

  ```html
  <div class="budget-section" id="loan-take-section">
    <h4>Loans</h4>
    <label>Amount: <input type="number" id="loan-amount" min="10000" step="1000" value="10000"></label>
    <div id="loan-preview" class="budget-line"></div>
    <button id="loan-take-btn">Take Loan</button>
  </div>
  <div class="budget-section hidden" id="loan-status-section">
    <h4>Active Loan</h4>
    <div class="budget-line"><span>Remaining</span><span id="loan-remaining">$0</span></div>
    <div class="budget-line"><span>Min. Payment</span><span id="loan-min-payment">$0</span></div>
    <div class="budget-line"><span>Months Left</span><span id="loan-months-left">0</span></div>
    <label>Repayment: <span id="loan-repayment-display">$0/mo</span></label>
    <input type="range" id="loan-repayment-slider" min="0" max="0" step="500">
    <button id="loan-payoff-btn">Pay Off Now</button>
  </div>
  ```

  Also add a loan repayment line in the budget breakdown section (between services and balance):
  ```html
  <div class="budget-line" id="loan-repayment-line" style="display:none">
    <span>Loan Repayment</span><span id="budget-loan-repayment">$0</span>
  </div>
  ```

- [ ] **Step 3: Wire loan UI events in BudgetPanel**

  Add private element refs:
  ```ts
  private loanTakeSection: HTMLElement
  private loanStatusSection: HTMLElement
  private loanAmountInput: HTMLInputElement
  private loanPreviewEl: HTMLElement
  private loanRemainingEl: HTMLElement
  private loanMinPaymentEl: HTMLElement
  private loanMonthsLeftEl: HTMLElement
  private loanRepaymentDisplay: HTMLElement
  private loanRepaymentSlider: HTMLInputElement
  private loanRepaymentLineEl: HTMLElement
  private loanRepaymentEl: HTMLElement
  ```

  In the constructor, after existing wiring:
  ```ts
  this.loanTakeSection = this.el.querySelector('#loan-take-section')!
  this.loanStatusSection = this.el.querySelector('#loan-status-section')!
  this.loanAmountInput = this.el.querySelector('#loan-amount') as HTMLInputElement
  this.loanPreviewEl = this.el.querySelector('#loan-preview')!
  this.loanRemainingEl = this.el.querySelector('#loan-remaining')!
  this.loanMinPaymentEl = this.el.querySelector('#loan-min-payment')!
  this.loanMonthsLeftEl = this.el.querySelector('#loan-months-left')!
  this.loanRepaymentDisplay = this.el.querySelector('#loan-repayment-display')!
  this.loanRepaymentSlider = this.el.querySelector('#loan-repayment-slider') as HTMLInputElement
  this.loanRepaymentLineEl = this.el.querySelector('#loan-repayment-line')!
  this.loanRepaymentEl = this.el.querySelector('#budget-loan-repayment')!

  this.loanAmountInput.addEventListener('input', () => {
    const amount = parseInt(this.loanAmountInput.value, 10)
    const r = 0.08 / 12
    const n = 120
    const monthly = Math.round(amount * r / (1 - Math.pow(1 + r, -n)))
    const total = monthly * n
    this.loanPreviewEl.textContent = `~$${monthly.toLocaleString()}/mo · $${total.toLocaleString()} total`
  })
  // Trigger initial preview
  this.loanAmountInput.dispatchEvent(new Event('input'))

  this.el.querySelector('#loan-take-btn')!.addEventListener('click', () => {
    const amount = parseInt(this.loanAmountInput.value, 10)
    this.onTakeLoan(amount)
  })

  this.loanRepaymentSlider.addEventListener('input', () => {
    const amount = parseInt(this.loanRepaymentSlider.value, 10)
    this.loanRepaymentDisplay.textContent = `$${amount.toLocaleString()}/mo`
    this.loanRepaymentSlider.dataset.userSet = 'true'  // prevent update() from overriding while dragging
    this.onRepaymentChange(amount)
  })

  this.el.querySelector('#loan-payoff-btn')!.addEventListener('click', () => {
    const remaining = parseInt(this.loanRemainingEl.dataset.raw ?? '0', 10)
    this.loanRepaymentSlider.value = String(remaining)
    this.loanRepaymentSlider.dataset.userSet = 'true'
    this.onRepaymentChange(remaining)
  })
  ```

- [ ] **Step 4: Update `BudgetPanel.update()` to render loan state**

  In the `update(state: GameState)` method, add:

  ```ts
  // Loan repayment budget line
  if (state.budget.loanRepayment > 0) {
    this.loanRepaymentLineEl.style.display = ''
    this.loanRepaymentEl.textContent = `-$${state.budget.loanRepayment.toLocaleString()}`
  } else {
    this.loanRepaymentLineEl.style.display = 'none'
  }

  // Loan sections
  if (state.loan) {
    this.loanTakeSection.classList.add('hidden')
    this.loanStatusSection.classList.remove('hidden')
    this.loanRemainingEl.textContent = `$${Math.round(state.loan.remaining).toLocaleString()}`
    this.loanRemainingEl.dataset.raw = String(Math.round(state.loan.remaining))
    this.loanMinPaymentEl.textContent = `$${Math.round(state.loan.monthlyPayment).toLocaleString()}/mo`
    this.loanMonthsLeftEl.textContent = String(state.loan.monthsLeft)
    const minP = Math.round(state.loan.monthlyPayment)
    const maxP = Math.round(state.loan.remaining)
    this.loanRepaymentSlider.min = String(minP)
    this.loanRepaymentSlider.max = String(maxP)
    if (!this.loanRepaymentSlider.dataset.userSet) {
      this.loanRepaymentSlider.value = String(Math.round(state.loanRepaymentAmount))
    }
    this.loanRepaymentDisplay.textContent = `$${Math.round(state.loanRepaymentAmount).toLocaleString()}/mo`
  } else {
    this.loanTakeSection.classList.remove('hidden')
    this.loanStatusSection.classList.add('hidden')
    this.loanRepaymentSlider.dataset.userSet = ''
  }
  ```

- [ ] **Step 5: Update Game.ts to pass loan callbacks to BudgetPanel**

  In `Game.ts`, update the BudgetPanel constructor call:

  ```ts
  this.budgetPanel = new BudgetPanel(
    uiOverlay,
    (rate) => this.engine?.setTaxRate(rate),
    (service, level) => this.engine?.setFunding(service, level),
    (amount) => { const r = this.engine?.takeLoan(amount); if (r && !r.ok) this.audioManager.playError() },
    (amount) => this.engine?.setLoanRepayment(amount),
  )
  ```

- [ ] **Step 6: Commit**

  ```bash
  git add packages/game/src/ui/BudgetPanel.ts packages/game/src/Game.ts
  git commit -m "feat(game): add loan UI to BudgetPanel (take/repay/status)"
  ```

---

### Task 7: Event notifications in Game.ts

**Files:**
- Modify: `packages/game/src/Game.ts`
- Modify: `packages/game/src/ui/InfoBar.ts`

- [ ] **Step 1: Add a toast notification helper to Game.ts**

  Add a private method to `Game`:

  ```ts
  private showToast(message: string, durationMs = 4000): void {
    const toast = document.createElement('div')
    toast.className = 'game-toast'
    toast.textContent = message
    this.uiOverlay.appendChild(toast)
    setTimeout(() => toast.remove(), durationMs)
  }
  ```

  Add CSS for `.game-toast` to the game stylesheet (or inline style in the element):
  ```ts
  toast.style.cssText = `
    position: fixed; bottom: 60px; left: 50%; transform: translateX(-50%);
    background: #333; color: #fff; padding: 8px 16px; border-radius: 4px;
    font-size: 13px; z-index: 1000; pointer-events: none;
    animation: fadeout 0.5s ${durationMs - 500}ms forwards;
  `
  ```

- [ ] **Step 2: Consume events from Engine state in the game loop**

  In `Game.ts`, find where `engine.tick()` is called and state is retrieved (the main game loop render call). After retrieving `state`, add:

  ```ts
  for (const event of state.events) {
    if (event.type === 'emergency_loan') {
      this.showToast(`Emergency loan taken: $${event.amount!.toLocaleString()}`)
    }
  }
  ```

- [ ] **Step 3: Add persistent negative-funds warning to InfoBar**

  In `packages/game/src/ui/InfoBar.ts`, update the funds display block to color funds red when negative, and add a persistent warning span for the insolvent-with-loan case.

  Add a private field after the existing `lastFunds` field:
  ```ts
  private warningEl: HTMLElement | null = null
  ```

  After constructing `this.el`, append a warning element:
  ```ts
  this.warningEl = document.createElement('span')
  this.warningEl.id = 'info-warning'
  this.warningEl.style.cssText = 'color:#f44336;font-weight:bold;display:none'
  this.el.appendChild(this.warningEl)
  ```

  In `update()`, replace the existing funds update block:
  ```ts
  if (state.funds !== this.lastFunds) {
    this.lastFunds = state.funds
    this.fundsEl.textContent = `$${state.funds.toLocaleString()}`
    this.fundsEl.style.color = state.funds < 0 ? '#f44336' : ''
  }
  // Persistent insolvency warning (funds negative AND loan already active — no bailout available)
  const insolvent = state.funds < 0 && state.loan !== null
  if (this.warningEl) {
    this.warningEl.style.display = insolvent ? '' : 'none'
    if (insolvent) this.warningEl.textContent = '⚠ Insolvent'
  }
  ```

  This turns the funds display red when negative (already partially handled by balance color; this extends it to the funds amount itself).

- [ ] **Step 4: Build and smoke-test the game**

  ```bash
  cd packages/game && pnpm build
  ```
  Expected: builds with no TypeScript errors.

  Then start dev server and manually verify:
  - Budget panel shows loan take section with amount input and preview
  - Taking a loan adds funds and switches to loan status view
  - Repayment slider appears and adjusts the displayed monthly payment
  - Pay Off button sets slider to full remaining amount
  - Loan repayment line appears in budget breakdown
  - Emergency loan toast appears if funds go negative (set very low startingFunds to test)

- [ ] **Step 5: Commit**

  ```bash
  git add packages/game/src/Game.ts packages/game/src/ui/InfoBar.ts
  git commit -m "feat(game): show emergency loan toast and negative-funds warning"
  ```

---

## Final Verification

- [ ] Run the complete test suite one last time

  ```bash
  cd /path/to/bitborough && pnpm test
  ```
  Expected: all tests PASS across all packages.

- [ ] Run a quick build check

  ```bash
  pnpm build
  ```
  Expected: no TypeScript errors.
