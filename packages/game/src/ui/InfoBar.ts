import type { GameState } from '@bitborough/core'
import { BUILDING_DEFS } from '@bitborough/engine'
import { formatGameDate, computeDemandBarStyle } from '../utils/format.js'

export class InfoBar {
  private el: HTMLElement
  private popEl: HTMLElement
  private fundsEl: HTMLElement
  private balanceEl: HTMLElement
  private dateEl: HTMLElement
  private rBar: HTMLElement
  private cBar: HTMLElement
  private iBar: HTMLElement

  // Cached values to avoid redundant DOM writes
  private lastPop = -1
  private lastOccupancy = -1
  private lastFunds = -1
  private lastBalance = NaN
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
      <span id="info-balance"></span>
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
    this.balanceEl = this.el.querySelector('#info-balance')!
    this.dateEl = this.el.querySelector('#info-date')!
    this.rBar = this.el.querySelector('.demand-r') as HTMLElement
    this.cBar = this.el.querySelector('.demand-c') as HTMLElement
    this.iBar = this.el.querySelector('.demand-i') as HTMLElement
  }

  update(state: GameState): void {
    const buildings = state.map.buildings.filter(b => b.state === 'active')
    const totalCap = buildings.reduce((s, b) => s + (BUILDING_DEFS[b.defId]?.capacity ?? 0), 0)
    const totalRes = buildings.reduce((s, b) => s + (b.residents ?? 0), 0)
    const occupancyPct = totalCap > 0 ? Math.round(totalRes / totalCap * 100) : 0
    if (state.population !== this.lastPop || occupancyPct !== this.lastOccupancy) {
      this.lastPop = state.population
      this.lastOccupancy = occupancyPct
      this.popEl.textContent = `Pop: ${state.population.toLocaleString()} (${occupancyPct}% full)`
    }
    if (state.funds !== this.lastFunds) {
      this.lastFunds = state.funds
      this.fundsEl.textContent = `$${state.funds.toLocaleString()}`
    }
    const balance = state.budget.balance
    if (balance !== this.lastBalance) {
      this.lastBalance = balance
      const sign = balance >= 0 ? '+' : ''
      this.balanceEl.textContent = `${sign}$${balance.toLocaleString()}/mo`
      this.balanceEl.style.color = balance >= 0 ? '#4caf50' : '#f44336'
    }
    if (state.time.month !== this.lastMonth || state.time.year !== this.lastYear) {
      this.lastMonth = state.time.month
      this.lastYear = state.time.year
      this.dateEl.textContent = formatGameDate(state.time.month, state.time.year)
    }

    const maxH = 20
    const { residential, commercial, industrial } = state.demand
    if (residential !== this.lastDemandR) {
      this.lastDemandR = residential
      const style = computeDemandBarStyle(residential, maxH)
      this.rBar.style.height = `${style.height}px`
      this.rBar.style.opacity = style.opacity
    }
    if (commercial !== this.lastDemandC) {
      this.lastDemandC = commercial
      const style = computeDemandBarStyle(commercial, maxH)
      this.cBar.style.height = `${style.height}px`
      this.cBar.style.opacity = style.opacity
    }
    if (industrial !== this.lastDemandI) {
      this.lastDemandI = industrial
      const style = computeDemandBarStyle(industrial, maxH)
      this.iBar.style.height = `${style.height}px`
      this.iBar.style.opacity = style.opacity
    }
  }
}
