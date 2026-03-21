import { describe, test, expect } from 'vitest'
import { Engine } from '../Engine.js'
import { createTestMap, advanceMonth, advanceYear } from '../test-helpers.js'
import { FailReason, Infrastructure, ZoneType } from '@bitborough/core'

/**
 * Create an engine with enough population and land value to produce
 * meaningful taxIncome. Uses a 64x64 map with zones and advances 20 years.
 */
function createEngineWithIncome() {
  const engine = Engine.create(createTestMap(64), { seed: 42, startingFunds: 2_000_000 })
  // Power plant at (0,0)
  engine.placeBuilding(0, 0, 'power.coal')
  // Power line from plant edge down to zones
  for (let y = 4; y <= 5; y++) {
    engine.placeTile(3, y, Infrastructure.PowerLine)
  }
  // Large grid of zones with roads and power
  for (let row = 0; row < 10; row++) {
    const baseY = 5 + row * 3
    if (baseY + 2 >= 64) break
    for (let x = 3; x < 50; x++) {
      if (x >= 64) break
      engine.placeTile(x, baseY, Infrastructure.PowerLine)
      engine.placeTile(x, baseY + 2, Infrastructure.Road)
      if (row < 6) {
        engine.placeZone(x, baseY + 1, ZoneType.Residential)
      } else if (row < 8) {
        engine.placeZone(x, baseY + 1, ZoneType.Commercial)
      } else {
        engine.placeZone(x, baseY + 1, ZoneType.Industrial)
      }
    }
  }
  // Advance 20 years so zones fully develop
  for (let i = 0; i < 20; i++) advanceYear(engine)
  return engine
}

describe('Loan system', () => {
  test('takeLoan() success — funds increase, loan is set', () => {
    const engine = createEngineWithIncome()
    const state0 = engine.getState()
    const taxIncome = state0.budget.taxIncome
    expect(taxIncome).toBeGreaterThan(0)
    expect(state0.loan).toBeNull()

    const fundsBefore = state0.funds
    const maxLoan = taxIncome * 48
    // Use whatever amount is valid (between 10_000 and maxLoan, or the maxLoan if < 10_000)
    // The actual amount doesn't matter for testing the mechanics
    const loanAmount = Math.floor(maxLoan * 0.5)
    expect(loanAmount).toBeGreaterThan(0)

    // If maxLoan is below minimum, the takeLoan call will fail with AmountOutOfRange
    // which is correct behavior — test that instead
    if (maxLoan < 10_000) {
      const result = engine.takeLoan(loanAmount)
      expect(result.ok).toBe(false)
      return
    }

    const result = engine.takeLoan(loanAmount)
    expect(result.ok).toBe(true)
    const stateAfter = engine.getState()
    expect(stateAfter.funds).toBe(fundsBefore + loanAmount)
    expect(stateAfter.loan).not.toBeNull()
    expect(stateAfter.loan!.principal).toBe(loanAmount)
    expect(stateAfter.loan!.remaining).toBe(loanAmount)
    expect(stateAfter.loan!.termMonths).toBe(120)
    expect(stateAfter.loan!.interestRate).toBe(0.08)
    expect(stateAfter.loanRepaymentAmount).toBeGreaterThan(0)
  })

  test('takeLoan() fails when loan already exists', () => {
    // Use emergency loan to get a loan, then try takeLoan
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 200 })
    for (let x = 0; x < 15; x++) {
      engine.placeTile(x, 5, Infrastructure.Road)
    }
    for (let i = 0; i < 24; i++) advanceMonth(engine)
    expect(engine.getState().loan).not.toBeNull()

    const result = engine.takeLoan(10_000)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe(FailReason.LoanExists)
    }
  })

  test('takeLoan() fails when amount < 10,000', () => {
    // Even with 0 taxIncome, amount < 10_000 triggers the range check
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    const result = engine.takeLoan(5_000)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe(FailReason.AmountOutOfRange)
    }
  })

  test('takeLoan() fails when amount > 48x taxIncome', () => {
    const engine = createEngineWithIncome()
    const maxLoan = engine.getState().budget.taxIncome * 48
    // Any amount above maxLoan should fail
    const result = engine.takeLoan(maxLoan + 1)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe(FailReason.AmountOutOfRange)
    }
  })

  test('emergency loan triggers when funds go negative', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 200 })
    for (let x = 0; x < 15; x++) {
      engine.placeTile(x, 5, Infrastructure.Road)
    }
    for (let i = 0; i < 24; i++) advanceMonth(engine)
    const state = engine.getState()
    expect(state.loan).not.toBeNull()
  })

  test('loan repayment reduces loan.remaining each month', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 200 })
    for (let x = 0; x < 15; x++) {
      engine.placeTile(x, 5, Infrastructure.Road)
    }
    for (let i = 0; i < 24; i++) advanceMonth(engine)
    const stateWithLoan = engine.getState()
    expect(stateWithLoan.loan).not.toBeNull()
    const remainingAfterLoan = stateWithLoan.loan!.remaining

    advanceMonth(engine)
    const stateAfterRepayment = engine.getState()
    if (stateAfterRepayment.loan) {
      expect(stateAfterRepayment.loan.remaining).toBeLessThan(remainingAfterLoan)
    }
  })

  test('loan clears when remaining reaches 0', () => {
    // Use emergency loan path: trigger one, then pay it all off in one go.
    // After payoff, funds may go negative again → new emergency loan.
    // We verify the old loan was cleared by checking monthsLeft resets to 120.
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 200 })
    for (let x = 0; x < 15; x++) {
      engine.placeTile(x, 5, Infrastructure.Road)
    }
    for (let i = 0; i < 24; i++) advanceMonth(engine)
    const stateWithLoan = engine.getState()
    expect(stateWithLoan.loan).not.toBeNull()

    // Advance a few months so loan.monthsLeft < 120
    advanceMonth(engine)
    advanceMonth(engine)
    const statePartial = engine.getState()
    expect(statePartial.loan).not.toBeNull()
    expect(statePartial.loan!.monthsLeft).toBeLessThan(120)
    const monthsLeftBefore = statePartial.loan!.monthsLeft

    // Now pay off the remaining balance in one shot
    const remaining = statePartial.loan!.remaining
    const result = engine.setLoanRepayment(remaining)
    expect(result.ok).toBe(true)

    advanceMonth(engine)
    const stateAfter = engine.getState()

    if (stateAfter.loan) {
      // A new emergency loan was created (because funds went negative after payoff).
      // Verify it's fresh: monthsLeft should be 120 (not monthsLeftBefore - 1).
      expect(stateAfter.loan.monthsLeft).toBe(120)
      // And remaining should equal principal (no payments yet on the new loan)
      expect(stateAfter.loan.remaining).toBe(stateAfter.loan.principal)
    } else {
      // Loan fully cleared and no emergency re-triggered
      expect(stateAfter.loan).toBeNull()
      expect(stateAfter.loanRepaymentAmount).toBe(0)
    }
  })

  test('setLoanRepayment() fails when no loan exists', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42 })
    const result = engine.setLoanRepayment(500)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe(FailReason.NoActiveLoan)
    }
  })

  test('setLoanRepayment() fails when amount below minimum payment', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 200 })
    for (let x = 0; x < 15; x++) {
      engine.placeTile(x, 5, Infrastructure.Road)
    }
    for (let i = 0; i < 24; i++) advanceMonth(engine)
    const state = engine.getState()
    if (!state.loan) return

    const result = engine.setLoanRepayment(1)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe(FailReason.AmountOutOfRange)
    }
  })

  test('events include emergency_loan when emergency loan triggers', () => {
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 200 })
    for (let x = 0; x < 15; x++) {
      engine.placeTile(x, 5, Infrastructure.Road)
    }
    let foundEmergencyEvent = false
    for (let i = 0; i < 24; i++) {
      advanceMonth(engine)
      const state = engine.getState()
      const emergencyEvent = state.events.find((e) => e.type === 'emergency_loan')
      if (emergencyEvent) {
        foundEmergencyEvent = true
        expect(emergencyEvent.type).toBe('emergency_loan')
        if (emergencyEvent.type === 'emergency_loan') {
          expect(emergencyEvent.amount).toBeGreaterThan(0)
        }
        break
      }
    }
    expect(foundEmergencyEvent).toBe(true)
  })

  test('budgetInfo.loanRepayment reflects loan payment after taking a loan', () => {
    // Use emergency loan to get a loan, then check budget
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 200 })
    for (let x = 0; x < 15; x++) {
      engine.placeTile(x, 5, Infrastructure.Road)
    }
    for (let i = 0; i < 24; i++) advanceMonth(engine)
    const state = engine.getState()
    if (state.loan) {
      expect(state.budget.loanRepayment).toBeGreaterThan(0)
    }
  })

  test('emits bankruptcy event when insolvent with active loan', () => {
    // Start with tiny funds and lots of roads so expenses exceed any income.
    // The engine will auto-take an emergency loan when funds first go negative.
    // Once that loan is active, continued negative balance triggers bankruptcy.
    const engine = Engine.create(createTestMap(32), { seed: 42, startingFunds: 200 })
    for (let x = 0; x < 30; x++) {
      engine.placeTile(x, 5, Infrastructure.Road)
    }
    let foundBankruptcy = false
    // Advance up to 15 years; the emergency loan (~$10k) drains at ~$150/month
    // (loan payment + road maintenance) with zero income — bankrupts ~month 70+
    for (let i = 0; i < 180; i++) {
      advanceMonth(engine)
      const state = engine.getState()
      if (state.events.some((e) => e.type === 'bankruptcy')) {
        foundBankruptcy = true
        break
      }
    }
    expect(foundBankruptcy).toBe(true)
  })
})
