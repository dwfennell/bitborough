import type { OverlayType } from '../render/OverlayRenderer.js'

interface LegendEntry {
  color: string
  label: string
}

const LEGENDS: Record<Exclude<OverlayType, 'none'>, { title: string; entries: LegendEntry[] }> = {
  power: {
    title: 'Power',
    entries: [
      { color: 'rgba(255, 235, 59, 0.7)', label: 'Powered' },
      { color: 'rgba(100, 100, 100, 0.6)', label: 'No power' },
    ],
  },
  landValue: {
    title: 'Land Value',
    entries: [
      { color: 'rgba(255, 50, 50, 0.6)', label: 'High' },
      { color: 'rgba(200, 200, 50, 0.6)', label: 'Medium' },
      { color: 'rgba(50, 50, 255, 0.6)', label: 'Low' },
    ],
  },
  crime: {
    title: 'Crime',
    entries: [
      { color: 'rgba(255, 20, 20, 0.7)', label: 'High crime' },
      { color: 'rgba(180, 20, 100, 0.5)', label: 'Moderate' },
      { color: 'rgba(100, 20, 200, 0.4)', label: 'Low crime' },
    ],
  },
  fire: {
    title: 'Fire Coverage',
    entries: [
      { color: 'rgba(255, 100, 0, 0.8)', label: 'Active fire' },
      { color: 'rgba(30, 200, 30, 0.6)', label: 'Covered' },
      { color: 'rgba(220, 30, 30, 0.6)', label: 'At risk' },
    ],
  },
  traffic: {
    title: 'Traffic',
    entries: [
      { color: 'rgba(76, 175, 80, 0.7)', label: 'Light (< 50%)' },
      { color: 'rgba(255, 235, 59, 0.8)', label: 'Moderate (50-80%)' },
      { color: 'rgba(255, 152, 0, 0.8)', label: 'Heavy (80-100%)' },
      { color: 'rgba(244, 67, 54, 0.9)', label: 'Gridlock (> 100%)' },
    ],
  },
}

export class OverlayLegend {
  private el: HTMLElement
  private titleEl: HTMLElement
  private entriesEl: HTMLElement
  private currentOverlay: OverlayType = 'none'

  constructor(container: HTMLElement) {
    this.el = document.createElement('div')
    this.el.id = 'overlay-legend'
    this.el.classList.add('hidden')
    this.el.innerHTML = `
      <div class="legend-title"></div>
      <div class="legend-entries"></div>
    `
    container.appendChild(this.el)

    this.titleEl = this.el.querySelector('.legend-title')!
    this.entriesEl = this.el.querySelector('.legend-entries')!
  }

  update(overlay: OverlayType): void {
    if (overlay === this.currentOverlay) return
    this.currentOverlay = overlay

    if (overlay === 'none') {
      this.el.classList.add('hidden')
      return
    }

    const legend = LEGENDS[overlay]
    this.titleEl.textContent = legend.title
    this.entriesEl.innerHTML = legend.entries
      .map(e => `<div class="legend-entry"><span class="legend-swatch" style="background:${e.color}"></span>${e.label}</div>`)
      .join('')

    this.el.classList.remove('hidden')
  }
}
