import type { Result } from '@bitborough/core'
import { Camera } from '../render/Camera.js'
import { ToolManager } from '../tools/ToolManager.js'
import type { Tool } from '../tools/Tool.js'
import type { Engine } from '@bitborough/engine'

export type ToolResultCallback = (tool: Tool, x: number, y: number, result: Result) => void

export class InputManager {
  private isDragging = false
  private isPanning = false
  private lastMouseX = 0
  private lastMouseY = 0
  private hoverTile: { x: number; y: number } | null = null
  private mapWidth = 0
  private mapHeight = 0
  private onToolResult: ToolResultCallback | null = null

  private readonly boundMouseDown = this.onMouseDown.bind(this)
  private readonly boundMouseMove = this.onMouseMove.bind(this)
  private readonly boundMouseUp = this.onMouseUp.bind(this)
  private readonly boundWheel = this.onWheel.bind(this)
  private readonly boundContextMenu = (e: Event) => e.preventDefault()

  constructor(
    private canvas: HTMLCanvasElement,
    private camera: Camera,
    private toolManager: ToolManager,
    private getEngine: () => Engine | null,
  ) {
    this.bindEvents()
  }

  setToolResultCallback(cb: ToolResultCallback): void {
    this.onToolResult = cb
  }

  setMapSize(width: number, height: number): void {
    this.mapWidth = width
    this.mapHeight = height
  }

  getHoverTile(): { x: number; y: number } | null {
    return this.hoverTile
  }

  destroy(): void {
    this.canvas.removeEventListener('mousedown', this.boundMouseDown)
    this.canvas.removeEventListener('mousemove', this.boundMouseMove)
    window.removeEventListener('mouseup', this.boundMouseUp)
    this.canvas.removeEventListener('wheel', this.boundWheel)
    this.canvas.removeEventListener('contextmenu', this.boundContextMenu)
  }

  private bindEvents(): void {
    this.canvas.addEventListener('mousedown', this.boundMouseDown)
    this.canvas.addEventListener('mousemove', this.boundMouseMove)
    window.addEventListener('mouseup', this.boundMouseUp)
    this.canvas.addEventListener('wheel', this.boundWheel, { passive: false })
    this.canvas.addEventListener('contextmenu', this.boundContextMenu)
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
    const zoomDelta = e.deltaY > 0 ? 0.96 : 1.04

    // World-space point under cursor before zoom
    const ts = this.camera.tileSize * this.camera.zoom
    const worldX = e.clientX / ts + this.camera.x
    const worldY = e.clientY / ts + this.camera.y

    this.camera.zoom *= zoomDelta
    this.camera.clampZoom()

    // Adjust camera so the same world point stays under cursor
    const newTs = this.camera.tileSize * this.camera.zoom
    this.camera.x = worldX - e.clientX / newTs
    this.camera.y = worldY - e.clientY / newTs
    this.camera.clamp()
  }

  private applyTool(screenX: number, screenY: number): void {
    const engine = this.getEngine()
    const tool = this.toolManager.activeTool
    if (!engine || !tool) return

    const tile = this.camera.screenToTile(screenX, screenY)
    if (tile.x < 0 || tile.y < 0) return
    if (tile.x >= this.mapWidth || tile.y >= this.mapHeight) return

    let result: Result
    if (this.isDragging && tool.onTileDrag) {
      result = tool.onTileDrag(tile.x, tile.y, engine)
    } else {
      result = tool.onTileClick(tile.x, tile.y, engine)
    }

    this.onToolResult?.(tool, tile.x, tile.y, result)
  }
}
