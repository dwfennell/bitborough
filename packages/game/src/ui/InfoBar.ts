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
    this.popEl.textContent = `Pop: ${state.population.toLocaleString()}`
    this.fundsEl.textContent = `$${state.funds.toLocaleString()}`
    this.dateEl.textContent = `${MONTHS[state.time.month - 1]} ${state.time.year}`

    const maxH = 20
    this.rBar.style.height = `${Math.max(4, Math.abs(state.demand.residential) * maxH)}px`
    this.rBar.style.opacity = state.demand.residential >= 0 ? '1' : '0.4'
    this.cBar.style.height = `${Math.max(4, Math.abs(state.demand.commercial) * maxH)}px`
    this.cBar.style.opacity = state.demand.commercial >= 0 ? '1' : '0.4'
    this.iBar.style.height = `${Math.max(4, Math.abs(state.demand.industrial) * maxH)}px`
    this.iBar.style.opacity = state.demand.industrial >= 0 ? '1' : '0.4'
  }
}
