import { Camera } from '../render/Camera.js'
import { ToolManager } from '../tools/ToolManager.js'
import type { Engine } from '@bitborough/engine'

export class InputManager {
  private isDragging = false
  private isPanning = false
  private lastMouseX = 0
  private lastMouseY = 0
  private hoverTile: { x: number; y: number } | null = null

  constructor(
    private canvas: HTMLCanvasElement,
    private camera: Camera,
    private toolManager: ToolManager,
    private getEngine: () => Engine | null,
  ) {
    this.bindEvents()
  }

  getHoverTile(): { x: number; y: number } | null {
    return this.hoverTile
  }

  private bindEvents(): void {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
    this.canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false })
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button === 1 || e.button === 2) {
      this.isPanning = true
      this.lastMouseX = e.clientX
      this.lastMouseY = e.clientY
      return
    }

    if (e.button === 0) {
      this.isDragging = true
      this.lastMouseX = e.clientX
      this.lastMouseY = e.clientY
      this.applyTool(e.clientX, e.clientY)
    }
  }

  private onMouseMove(e: MouseEvent): void {
    this.hoverTile = this.camera.screenToTile(e.clientX, e.clientY)

    if (this.isPanning) {
      const dx = (e.clientX - this.lastMouseX) / (this.camera.tileSize * this.camera.zoom)
      const dy = (e.clientY - this.lastMouseY) / (this.camera.tileSize * this.camera.zoom)
      this.camera.pan(-dx, -dy)
      this.camera.clamp()
      this.lastMouseX = e.clientX
      this.lastMouseY = e.clientY
      return
    }

    if (this.isDragging) {
      this.applyTool(e.clientX, e.clientY)
    }
  }

  private onMouseUp(_e: MouseEvent): void {
    this.isDragging = false
    this.isPanning = false
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault()
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1
    this.camera.zoom *= zoomDelta
    this.camera.clampZoom()
    this.camera.clamp()
  }

  private applyTool(screenX: number, screenY: number): void {
    const engine = this.getEngine()
    const tool = this.toolManager.activeTool
    if (!engine || !tool) return

    const tile = this.camera.screenToTile(screenX, screenY)
    if (tile.x < 0 || tile.y < 0) return

    const state = engine.getState()
    if (tile.x >= state.map.width || tile.y >= state.map.height) return

    if (this.isDragging && tool.onTileDrag) {
      tool.onTileDrag(tile.x, tile.y, engine)
    } else {
      tool.onTileClick(tile.x, tile.y, engine)
    }
  }
}
