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

  constructor(
    container: HTMLElement,
    private onTaxChange: (rate: number) => void,
    private onFundingChange: (service: FundingService, level: number) => void,
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
          <div class="budget-line total"><span>Balance</span><span id="budget-balance">$0</span></div>
        </div>
        <div class="budget-section">
          <h4>Service Funding</h4>
          <label>Police: <span id="police-funding-display">100%</span></label>
          <input type="range" id="police-funding" min="0" max="100" value="100" step="10">
          <label>Fire: <span id="fire-funding-display">100%</span></label>
          <input type="range" id="fire-funding" min="0" max="100" value="100" step="10">
        </div>
      </div>
    `
    container.appendChild(this.el)

    this.incomeEl = this.el.querySelector('#budget-income')!
    this.maintenanceEl = this.el.querySelector('#budget-maintenance')!
    this.servicesEl = this.el.querySelector('#budget-services')!
    this.balanceEl = this.el.querySelector('#budget-balance')!
    this.taxDisplay = this.el.querySelector('#tax-rate-display')!

    this.el.querySelector('.panel-close')!.addEventListener('click', () => this.toggle())

    const taxSlider = this.el.querySelector('#tax-rate-slider') as HTMLInputElement
    taxSlider.addEventListener('input', () => {
      const rate = parseInt(taxSlider.value, 10)
      this.taxDisplay.textContent = `${rate}%`
      this.onTaxChange(rate / 100)
    })

    this.bindFundingSlider('police-funding', 'police-funding-display', 'police')
    this.bindFundingSlider('fire-funding', 'fire-funding-display', 'fire')
  }

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

  update(state: GameState): void {
    if (!this.visible) return
    const b = state.budget
    this.incomeEl.textContent = `$${b.taxIncome.toLocaleString()}`
    this.maintenanceEl.textContent = `-$${b.maintenanceCosts.total.toLocaleString()}`
    this.servicesEl.textContent = `-$${b.serviceCosts.total.toLocaleString()}`
    this.balanceEl.textContent = `$${b.balance.toLocaleString()}`
    this.balanceEl.className = b.balance >= 0 ? 'positive' : 'negative'
  }
}
