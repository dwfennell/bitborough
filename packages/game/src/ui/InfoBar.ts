import type { GameState } from '@bitborough/core'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export class InfoBar {
  private el: HTMLElement
  private popEl: HTMLElement
  private fundsEl: HTMLElement
  private dateEl: HTMLElement
  private rBar: HTMLElement
  private cBar: HTMLElement
  private iBar: HTMLElement

  // Cached values to avoid redundant DOM writes
  private lastPop = -1
  private lastFunds = -1
  private lastMonth = -1
  private lastYear = -1
  private lastDemandR = NaN
  private lastDemandC = NaN
  private lastDemandI = NaN

  constructor(container: HTMLElement) {
    this.el = document.createElement('div')
    this.el.id = 'info-bar'
    this.el.innerHTML = `
      <span id="info-population">Pop: 0</span>
      <span id="info-funds">$0</span>
      <span id="info-date">Jan 1900</span>
      <span id="info-demand" class="demand-bars">
        <span class="demand-r" title="Residential">R</span>
        <span class="demand-c" title="Commercial">C</span>
        <span class="demand-i" title="Industrial">I</span>
      </span>
    `
    container.appendChild(this.el)

    this.popEl = this.el.querySelector('#info-population')!
    this.fundsEl = this.el.querySelector('#info-funds')!
    this.dateEl = this.el.querySelector('#info-date')!
    this.rBar = this.el.querySelector('.demand-r') as HTMLElement
    this.cBar = this.el.querySelector('.demand-c') as HTMLElement
    this.iBar = this.el.querySelector('.demand-i') as HTMLElement
  }

  update(state: GameState): void {
    if (state.population !== this.lastPop) {
      this.lastPop = state.population
      this.popEl.textContent = `Pop: ${state.population.toLocaleString()}`
    }
    if (state.funds !== this.lastFunds) {
      this.lastFunds = state.funds
      this.fundsEl.textContent = `$${state.funds.toLocaleString()}`
    }
    if (state.time.month !== this.lastMonth || state.time.year !== this.lastYear) {
      this.lastMonth = state.time.month
      this.lastYear = state.time.year
      this.dateEl.textContent = `${MONTHS[state.time.month - 1]} ${state.time.year}`
    }

    const maxH = 20
    const { residential, commercial, industrial } = state.demand
    if (residential !== this.lastDemandR) {
      this.lastDemandR = residential
      this.rBar.style.height = `${Math.max(4, Math.abs(residential) * maxH)}px`
      this.rBar.style.opacity = residential >= 0 ? '1' : '0.4'
    }
    if (commercial !== this.lastDemandC) {
      this.lastDemandC = commercial
      this.cBar.style.height = `${Math.max(4, Math.abs(commercial) * maxH)}px`
      this.cBar.style.opacity = commercial >= 0 ? '1' : '0.4'
    }
    if (industrial !== this.lastDemandI) {
      this.lastDemandI = industrial
      this.iBar.style.height = `${Math.max(4, Math.abs(industrial) * maxH)}px`
      this.iBar.style.opacity = industrial >= 0 ? '1' : '0.4'
    }
  }
}
