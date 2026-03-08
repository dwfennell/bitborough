import type { GameState } from '@bitborough/core'

export class InfoBar {
  private el: HTMLElement

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
  }

  update(state: GameState): void {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    this.el.querySelector('#info-population')!.textContent = `Pop: ${state.population.toLocaleString()}`
    this.el.querySelector('#info-funds')!.textContent = `$${state.funds.toLocaleString()}`
    this.el.querySelector('#info-date')!.textContent = `${months[state.time.month - 1]} ${state.time.year}`

    const maxH = 20
    const rBar = this.el.querySelector('.demand-r') as HTMLElement
    const cBar = this.el.querySelector('.demand-c') as HTMLElement
    const iBar = this.el.querySelector('.demand-i') as HTMLElement
    rBar.style.height = `${Math.max(4, Math.abs(state.demand.residential) * maxH)}px`
    rBar.style.opacity = state.demand.residential >= 0 ? '1' : '0.4'
    cBar.style.height = `${Math.max(4, Math.abs(state.demand.commercial) * maxH)}px`
    cBar.style.opacity = state.demand.commercial >= 0 ? '1' : '0.4'
    iBar.style.height = `${Math.max(4, Math.abs(state.demand.industrial) * maxH)}px`
    iBar.style.opacity = state.demand.industrial >= 0 ? '1' : '0.4'
  }
}
