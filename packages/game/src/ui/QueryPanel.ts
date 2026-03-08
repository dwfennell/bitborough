import type { GameState } from '@bitborough/core'
import type { TileInfo } from '@bitborough/engine'
import { describeTile } from '../utils/tile-info.js'

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
    const desc = describeTile(tile, x, y, state)

    this.bodyEl.innerHTML = `
      <div class="query-line"><span>Position</span><span>(${desc.position.x}, ${desc.position.y})</span></div>
      <div class="query-line"><span>Terrain</span><span>${desc.terrain}</span></div>
      <div class="query-line"><span>Zone</span><span>${desc.zone}</span></div>
      <div class="query-line"><span>Infrastructure</span><span>${desc.infrastructure.join(', ') || 'None'}</span></div>
      <div class="query-line"><span>Powered</span><span>${desc.powered ? 'Yes' : 'No'}</span></div>
      <div class="query-line"><span>Land Value</span><span>${desc.landValue}</span></div>
    `
  }

  hide(): void {
    this.el.classList.add('hidden')
  }

  get isVisible(): boolean {
    return !this.el.classList.contains('hidden')
  }
}
