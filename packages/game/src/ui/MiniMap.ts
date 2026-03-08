import { TileType, ZoneType, type GameState } from '@bitborough/core'
import type { Camera } from '../render/Camera.js'

// Precomputed RGB lookup tables for minimap (avoids hex string parsing per tile)
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

const TERRAIN_RGB: [number, number, number][] = [
  hexToRgb('#4a8c3f'), // Grass
  hexToRgb('#3b7dd8'), // Water
  hexToRgb('#8b7355'), // Dirt
  hexToRgb('#d4b876'), // Sand
  hexToRgb('#2d6b2e'), // Trees
]
const FALLBACK_RGB: [number, number, number] = TERRAIN_RGB[0]!

const ZONE_RGB: Record<number, [number, number, number]> = {
  [ZoneType.Residential]: hexToRgb('#4caf50'),
  [ZoneType.Commercial]: hexToRgb('#2196f3'),
  [ZoneType.Industrial]: hexToRgb('#ffc107'),
}

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

    const data = this.imageData.data

    for (let i = 0, len = w * h; i < len; i++) {
      const zone = map.zones[i] as ZoneType
      let rgb: [number, number, number]
      if (zone !== ZoneType.None) {
        rgb = ZONE_RGB[zone] ?? FALLBACK_RGB
      } else {
        rgb = TERRAIN_RGB[map.terrain[i] as TileType] ?? FALLBACK_RGB
      }
      const off = i * 4
      data[off] = rgb[0]
      data[off + 1] = rgb[1]
      data[off + 2] = rgb[2]
      data[off + 3] = 255
    }

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
