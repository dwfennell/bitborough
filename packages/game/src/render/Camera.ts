export class Camera {
  x = 0
  y = 0
  zoom = 1
  private mapWidth = Infinity
  private mapHeight = Infinity

  constructor(
    public viewportWidth: number,
    public viewportHeight: number,
    public tileSize: number,
  ) {}

  setMapSize(width: number, height: number): void {
    this.mapWidth = width
    this.mapHeight = height
  }

  setViewport(width: number, height: number): void {
    this.viewportWidth = width
    this.viewportHeight = height
  }

  screenToTile(screenX: number, screenY: number): { x: number; y: number } {
    const effectiveTileSize = this.tileSize * this.zoom
    return {
      x: Math.floor(screenX / effectiveTileSize + this.x),
      y: Math.floor(screenY / effectiveTileSize + this.y),
    }
  }

  tileToScreen(tileX: number, tileY: number): { x: number; y: number } {
    const effectiveTileSize = this.tileSize * this.zoom
    return {
      x: (tileX - this.x) * effectiveTileSize,
      y: (tileY - this.y) * effectiveTileSize,
    }
  }

  getVisibleBounds(): {
    minX: number
    minY: number
    maxX: number
    maxY: number
  } {
    const effectiveTileSize = this.tileSize * this.zoom
    const tilesWide = Math.ceil(this.viewportWidth / effectiveTileSize)
    const tilesHigh = Math.ceil(this.viewportHeight / effectiveTileSize)
    return {
      minX: Math.floor(this.x),
      minY: Math.floor(this.y),
      maxX: Math.floor(this.x) + tilesWide,
      maxY: Math.floor(this.y) + tilesHigh,
    }
  }

  pan(dx: number, dy: number): void {
    this.x += dx
    this.y += dy
  }

  clamp(): void {
    if (this.x < 0) this.x = 0
    if (this.y < 0) this.y = 0
    const effectiveTileSize = this.tileSize * this.zoom
    const maxX = this.mapWidth - this.viewportWidth / effectiveTileSize
    const maxY = this.mapHeight - this.viewportHeight / effectiveTileSize
    if (this.x > maxX) this.x = Math.max(0, maxX)
    if (this.y > maxY) this.y = Math.max(0, maxY)
  }

  clampZoom(): void {
    if (this.zoom < 0.5) this.zoom = 0.5
    if (this.zoom > 4) this.zoom = 4
  }
}
