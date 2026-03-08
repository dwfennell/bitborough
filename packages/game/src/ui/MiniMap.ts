import type { GameState } from '@bitborough/core'
import type { Camera } from '../render/Camera.js'
import { fillMinimapBuffer } from '../render/minimap-buffer.js'

export class MiniMap {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private imageData: ImageData | null = null

  constructor(container: HTMLElement, private maxSize: number = 150) {
    this.canvas = document.createElement('canvas')
    this.canvas.id = 'minimap'
    this.ctx = this.canvas.getContext('2d')!
    container.appendChild(this.canvas)
  }

  render(state: GameState, camera: Camera): void {
    const { map } = state
    const w = map.width
    const h = map.height

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
      this.imageData = null
    }

    if (!this.imageData || this.imageData.width !== w) {
      this.imageData = this.ctx.createImageData(w, h)
    }

    fillMinimapBuffer(map.terrain, map.zones, w, h, this.imageData.data)

    this.ctx.putImageData(this.imageData, 0, 0)

    // Scale canvas display to maxSize via CSS
    const scale = this.maxSize / Math.max(w, h)
    this.canvas.style.width = `${Math.floor(w * scale)}px`
    this.canvas.style.height = `${Math.floor(h * scale)}px`
    this.canvas.style.imageRendering = 'pixelated'

    // Viewport rectangle
    const bounds = camera.getVisibleBounds()
    this.ctx.strokeStyle = '#fff'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(
      Math.max(0, bounds.minX),
      Math.max(0, bounds.minY),
      bounds.maxX - bounds.minX,
      bounds.maxY - bounds.minY,
    )
  }
}
