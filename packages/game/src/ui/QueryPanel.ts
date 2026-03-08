import { TileType, ZoneType, Infrastructure, type GameState } from '@bitborough/core'
import type { TileInfo } from '@bitborough/engine'

export class QueryPanel {
  private el: HTMLElement
  private bodyEl: HTMLElement

  constructor(container: HTMLElement) {
    this.el = document.createElement('div')
    this.el.id = 'query-panel'
    this.el.className = 'panel hidden'
    this.el.innerHTML = `
      <div class="panel-header">
        <h3>Tile Info</h3>
        <button class="panel-close">&times;</button>
      </div>
      <div class="panel-body" id="query-body">
        <p>Click a tile with the Query tool to inspect it.</p>
      </div>
    `
    container.appendChild(this.el)

    this.bodyEl = this.el.querySelector('#query-body')!
    this.el.querySelector('.panel-close')!.addEventListener('click', () => this.hide())
  }

  show(tile: TileInfo, x: number, y: number, state: GameState): void {
    this.el.classList.remove('hidden')
    const idx = y * state.map.width + x

    const infraParts: string[] = []
    if (tile.infrastructure & Infrastructure.Road) infraParts.push('Road')
    if (tile.infrastructure & Infrastructure.PowerLine) infraParts.push('Power Line')
    if (tile.infrastructure & Infrastructure.Rail) infraParts.push('Rail')

    this.bodyEl.innerHTML = `
      <div class="query-line"><span>Position</span><span>(${x}, ${y})</span></div>
      <div class="query-line"><span>Terrain</span><span>${TileType[tile.terrain] ?? '?'}</span></div>
      <div class="query-line"><span>Zone</span><span>${ZoneType[tile.zone] ?? 'None'}</span></div>
      <div class="query-line"><span>Infrastructure</span><span>${infraParts.join(', ') || 'None'}</span></div>
      <div class="query-line"><span>Powered</span><span>${tile.powered ? 'Yes' : 'No'}</span></div>
      <div class="query-line"><span>Land Value</span><span>${state.landValues[idx]}</span></div>
    `
  }

  hide(): void {
    this.el.classList.add('hidden')
  }
}
