import { type GameState, TileType, ZoneType, Infrastructure } from '@bitborough/core'
import { Camera } from './Camera.js'
import { type TileRenderer, ColorTileRenderer } from './TileRenderer.js'
import { OverlayRenderer, type OverlayType } from './OverlayRenderer.js'
import { BUILDING_DEFS } from '@bitborough/engine'

export class Renderer {
  private tileRenderer: TileRenderer
  private gridLines = true
  private overlayRenderer = new OverlayRenderer()

  constructor(
    private ctx: CanvasRenderingContext2D,
    private camera: Camera,
    tileRenderer?: TileRenderer,
  ) {
    this.tileRenderer = tileRenderer ?? new ColorTileRenderer()
  }

  render(state: GameState): void {
    const { ctx, camera } = this
    const { map } = state

    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight)

    const bounds = camera.getVisibleBounds()
    const ts = camera.tileSize * camera.zoom
    const startX = Math.max(0, bounds.minX)
    const startY = Math.max(0, bounds.minY)
    const endX = Math.min(map.width - 1, bounds.maxX)
    const endY = Math.min(map.height - 1, bounds.maxY)

    // Snap tile size up to avoid sub-pixel gaps between adjacent tiles
    const snappedTs = Math.ceil(ts)

    // Single pass: terrain + zone overlays + infrastructure per tile
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const idx = y * map.width + x
        const sx = Math.floor((x - camera.x) * ts)
        const sy = Math.floor((y - camera.y) * ts)

        // Terrain
        this.tileRenderer.drawTile(ctx, map.terrain[idx] as TileType, sx, sy, snappedTs)

        // Zone overlay
        const zone = map.zones[idx] as ZoneType
        if (zone !== ZoneType.None) {
          this.tileRenderer.drawZoneOverlay(ctx, zone, sx, sy, snappedTs)
        }

        // Infrastructure
        const infra = map.infrastructure[idx]!
        if (infra !== Infrastructure.None) {
          this.tileRenderer.drawInfrastructure(ctx, infra, map.connections[idx]!, sx, sy, snappedTs)
        }
      }
    }

    // Buildings
    for (const building of map.buildings) {
      const def = BUILDING_DEFS[building.defId]
      if (!def) continue
      if (
        building.x + def.size.w < startX || building.x > endX ||
        building.y + def.size.h < startY || building.y > endY
      ) continue
      const sx = Math.floor((building.x - camera.x) * ts)
      const sy = Math.floor((building.y - camera.y) * ts)
      this.tileRenderer.drawBuilding(ctx, building, def, sx, sy, snappedTs)
    }

    // Overlays (power grid, land value heatmaps)
    this.overlayRenderer.render(ctx, state, {
      ts: snappedTs, startX, startY, endX, endY,
      mapWidth: map.width,
      cameraX: camera.x,
      cameraY: camera.y,
      rawTs: ts,
    })

    // Grid lines (batched single stroke)
    if (this.gridLines && ts >= 8) {
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      for (let y = bounds.minY; y <= bounds.maxY + 1; y++) {
        const sy = (y - camera.y) * ts
        ctx.moveTo(0, sy)
        ctx.lineTo(camera.viewportWidth, sy)
      }
      for (let x = bounds.minX; x <= bounds.maxX + 1; x++) {
        const sx = (x - camera.x) * ts
        ctx.moveTo(sx, 0)
        ctx.lineTo(sx, camera.viewportHeight)
      }
      ctx.stroke()
    }
  }

  setGridLines(show: boolean): void {
    this.gridLines = show
  }

  getGridLines(): boolean {
    return this.gridLines
  }

  toggleGridLines(): void {
    this.gridLines = !this.gridLines
  }

  toggleOverlay(type: OverlayType): void {
    this.overlayRenderer.toggle(type)
  }

  get activeOverlay(): OverlayType {
    return this.overlayRenderer.active
  }
}
