import type { GameState } from '@bitborough/core'

export type FundingService = 'police' | 'fire' | 'transit'

export class BudgetPanel {
  private el: HTMLElement
  private visible = false
  private incomeEl: HTMLElement
  private maintenanceEl: HTMLElement
  private servicesEl: HTMLElement
  private balanceEl: HTMLElement
  private taxDisplay: HTMLElement
  private loanRepaymentLine: HTMLElement
  private loanRepaymentEl: HTMLElement
  private takeLoanSection: HTMLElement
  private loanStatusSection: HTMLElement
  private loanStatusInfo: HTMLElement
  private repaymentDisplay: HTMLElement
  private repaymentSlider: HTMLInputElement

  constructor(
    container: HTMLElement,
    private onTaxChange: (rate: number) => void,
    private onFundingChange: (service: FundingService, level: number) => void,
    private onTakeLoan: (amount: number) => void,
    private onSetRepayment: (amount: number) => void,
  ) {
    this.el = document.createElement('div')
    this.el.id = 'budget-panel'
    this.el.className = 'panel hidden'
    this.el.innerHTML = `
      <div class="panel-header">
        <h3>Budget</h3>
        <button class="panel-close">&times;</button>
      </div>
      <div class="panel-body">
        <div class="budget-section">
          <label>Tax Rate: <span id="tax-rate-display">7%</span></label>
          <input type="range" id="tax-rate-slider" min="0" max="20" value="7" step="1">
        </div>
        <div class="budget-section">
          <div class="budget-line"><span>Tax Income</span><span id="budget-income">$0</span></div>
          <div class="budget-line"><span>Maintenance</span><span id="budget-maintenance">$0</span></div>
          <div class="budget-line"><span>Services</span><span id="budget-services">$0</span></div>
          <div class="budget-line hidden" id="loan-repayment-line"><span>Loan Repayment</span><span id="budget-loan-repayment">$0</span></div>
          <div class="budget-line total"><span>Balance</span><span id="budget-balance">$0</span></div>
        </div>
        <div class="budget-section">
          <h4>Service Funding</h4>
          <label>Police: <span id="police-funding-display">100%</span></label>
          <input type="range" id="police-funding" min="0" max="100" value="100" step="10">
          <label>Fire: <span id="fire-funding-display">100%</span></label>
          <input type="range" id="fire-funding" min="0" max="100" value="100" step="10">
        </div>
        <div class="budget-section" id="take-loan-section">
          <h4>Take Loan</h4>
          <label>Amount: <span id="loan-amount-display">$50,000</span></label>
          <input type="range" id="loan-amount-slider" min="10000" max="500000" value="50000" step="5000">
          <div id="loan-preview" style="font-size:0.85em;color:#aaa"></div>
          <button id="take-loan-btn">Take Loan</button>
        </div>
        <div class="budget-section hidden" id="loan-status-section">
          <h4>Active Loan</h4>
          <div id="loan-status-info"></div>
          <label>Repayment: <span id="repayment-display">$0/mo</span></label>
          <input type="range" id="repayment-slider" min="0" max="0" value="0" step="500">
          <button id="payoff-btn">Pay Off Loan</button>
        </div>
      </div>
    `
    container.appendChild(this.el)

    this.incomeEl = this.el.querySelector('#budget-income')!
    this.maintenanceEl = this.el.querySelector('#budget-maintenance')!
    this.servicesEl = this.el.querySelector('#budget-services')!
    this.balanceEl = this.el.querySelector('#budget-balance')!
    this.taxDisplay = this.el.querySelector('#tax-rate-display')!
    this.loanRepaymentLine = this.el.querySelector('#loan-repayment-line')!
    this.loanRepaymentEl = this.el.querySelector('#budget-loan-repayment')!
    this.takeLoanSection = this.el.querySelector('#take-loan-section')!
    this.loanStatusSection = this.el.querySelector('#loan-status-section')!
    this.loanStatusInfo = this.el.querySelector('#loan-status-info')!
    this.repaymentDisplay = this.el.querySelector('#repayment-display')!
    this.repaymentSlider = this.el.querySelector('#repayment-slider') as HTMLInputElement

    this.el.querySelector('.panel-close')!.addEventListener('click', () => this.toggle())

    const taxSlider = this.el.querySelector('#tax-rate-slider') as HTMLInputElement
    taxSlider.addEventListener('input', () => {
      const rate = parseInt(taxSlider.value, 10)
      this.taxDisplay.textContent = `${rate}%`
      this.onTaxChange(rate / 100)
    })

    this.bindFundingSlider('police-funding', 'police-funding-display', 'police')
    this.bindFundingSlider('fire-funding', 'fire-funding-display', 'fire')

    // Loan amount slider
    const loanAmountSlider = this.el.querySelector('#loan-amount-slider') as HTMLInputElement
    const loanAmountDisplay = this.el.querySelector('#loan-amount-display')!
    const loanPreview = this.el.querySelector('#loan-preview')!

    const updateLoanPreview = () => {
      const amount = parseInt(loanAmountSlider.value, 10)
      loanAmountDisplay.textContent = `$${amount.toLocaleString()}`
      const r = 0.08 / 12
      const n = 120
      const monthly = Math.round(amount * r / (1 - Math.pow(1 + r, -n)))
      const total = monthly * n
      loanPreview.textContent = `Monthly payment: $${monthly.toLocaleString()} | Total cost: $${total.toLocaleString()}`
    }
    loanAmountSlider.addEventListener('input', updateLoanPreview)
    updateLoanPreview()

    // Take loan button
    const takeLoanBtn = this.el.querySelector('#take-loan-btn')!
    takeLoanBtn.addEventListener('click', () => {
      this.onTakeLoan(parseInt(loanAmountSlider.value, 10))
    })

    // Repayment slider
    this.repaymentSlider.addEventListener('input', () => {
      this.repaymentSlider.dataset.userSet = 'true'
      this.onSetRepayment(parseInt(this.repaymentSlider.value, 10))
    })
    this.repaymentSlider.addEventListener('change', () => {
      delete this.repaymentSlider.dataset.userSet
    })

    // Pay off button
    const payoffBtn = this.el.querySelector('#payoff-btn')!
    payoffBtn.addEventListener('click', () => {
      // Will be handled via update — access loan from last state
      // Store loan in field for payoff button access
      if (this._lastLoan) {
        this.repaymentSlider.dataset.userSet = 'true'
        this.onSetRepayment(this._lastLoan.remaining)
      }
    })
  }

  private _lastLoan: import('@bitborough/core').Loan | null = null

  private bindFundingSlider(sliderId: string, displayId: string, service: FundingService): void {
    const slider = this.el.querySelector(`#${sliderId}`) as HTMLInputElement
    const display = this.el.querySelector(`#${displayId}`)!
    slider.addEventListener('input', () => {
      const level = parseInt(slider.value, 10)
      display.textContent = `${level}%`
      this.onFundingChange(service, level)
    })
  }

  toggle(): void {
    this.visible = !this.visible
    this.el.classList.toggle('hidden', !this.visible)
  }

  hide(): void {
    this.visible = false
    this.el.classList.add('hidden')
  }

  get isVisible(): boolean {
    return this.visible
  }

  update(state: GameState): void {
    if (!this.visible) return
    const b = state.budget
    this.incomeEl.textContent = `$${b.taxIncome.toLocaleString()}`
    this.maintenanceEl.textContent = `-$${b.maintenanceCosts.total.toLocaleString()}`
    this.servicesEl.textContent = `-$${b.serviceCosts.total.toLocaleString()}`
    this.balanceEl.textContent = `$${b.balance.toLocaleString()}`
    this.balanceEl.className = b.balance >= 0 ? 'positive' : 'negative'

    const loan = state.loan
    this._lastLoan = loan

    // Show/hide loan repayment line
    this.loanRepaymentLine.classList.toggle('hidden', loan === null)
    this.loanRepaymentEl.textContent = `-$${b.loanRepayment.toLocaleString()}`

    if (loan === null) {
      this.takeLoanSection.classList.remove('hidden')
      this.loanStatusSection.classList.add('hidden')
    } else {
      this.takeLoanSection.classList.add('hidden')
      this.loanStatusSection.classList.remove('hidden')

      const minPayment = Math.round(loan.monthlyPayment)
      const maxPayment = Math.round(loan.remaining)
      this.loanStatusInfo.textContent = `Remaining: $${Math.round(loan.remaining).toLocaleString()} | Monthly min: $${minPayment.toLocaleString()} | Months left: ${loan.monthsLeft}`

      this.repaymentSlider.min = String(minPayment)
      this.repaymentSlider.max = String(maxPayment)

      if (!this.repaymentSlider.dataset.userSet) {
        this.repaymentSlider.value = String(state.loanRepaymentAmount)
      }

      this.repaymentDisplay.textContent = `$${state.loanRepaymentAmount.toLocaleString()}/mo`
    }
  }
}
