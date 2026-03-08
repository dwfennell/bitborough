import { type GameState, TileType, ZoneType, Infrastructure } from '@bitborough/core'
import { Camera } from './Camera.js'
import { type TileRenderer, ColorTileRenderer } from './TileRenderer.js'
import { BUILDING_DEFS } from '@bitborough/engine'

export class Renderer {
  private tileRenderer: TileRenderer
  private gridLines = true

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

    // Clear
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight)

    const bounds = camera.getVisibleBounds()
    const effectiveTileSize = camera.tileSize * camera.zoom

    // Layer 1: Terrain
    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        if (x < 0 || y < 0 || x >= map.width || y >= map.height) continue
        const idx = y * map.width + x
        const screen = camera.tileToScreen(x, y)
        this.tileRenderer.drawTile(ctx, map.terrain[idx] as TileType, screen.x, screen.y, effectiveTileSize)
      }
    }

    // Layer 2: Zone overlays (only on undeveloped zones)
    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        if (x < 0 || y < 0 || x >= map.width || y >= map.height) continue
        const idx = y * map.width + x
        const zone = map.zones[idx] as ZoneType
        if (zone === ZoneType.None) continue
        const screen = camera.tileToScreen(x, y)
        this.tileRenderer.drawZoneOverlay(ctx, zone, screen.x, screen.y, effectiveTileSize)
      }
    }

    // Layer 3: Infrastructure
    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        if (x < 0 || y < 0 || x >= map.width || y >= map.height) continue
        const idx = y * map.width + x
        const infra = map.infrastructure[idx]!
        if (infra === Infrastructure.None) continue
        const screen = camera.tileToScreen(x, y)
        this.tileRenderer.drawInfrastructure(
          ctx, infra, map.connections[idx]!, screen.x, screen.y, effectiveTileSize,
        )
      }
    }

    // Layer 4: Buildings
    for (const building of map.buildings) {
      const def = BUILDING_DEFS[building.defId]
      if (!def) continue
      if (
        building.x + def.size.w < bounds.minX || building.x > bounds.maxX ||
        building.y + def.size.h < bounds.minY || building.y > bounds.maxY
      ) continue
      const screen = camera.tileToScreen(building.x, building.y)
      this.tileRenderer.drawBuilding(ctx, building, def, screen.x, screen.y, effectiveTileSize)
    }

    // Grid lines
    if (this.gridLines && effectiveTileSize >= 8) {
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.lineWidth = 0.5
      for (let y = bounds.minY; y <= bounds.maxY + 1; y++) {
        const screen = camera.tileToScreen(bounds.minX, y)
        ctx.beginPath()
        ctx.moveTo(0, screen.y)
        ctx.lineTo(camera.viewportWidth, screen.y)
        ctx.stroke()
      }
      for (let x = bounds.minX; x <= bounds.maxX + 1; x++) {
        const screen = camera.tileToScreen(x, bounds.minY)
        ctx.beginPath()
        ctx.moveTo(screen.x, 0)
        ctx.lineTo(screen.x, camera.viewportHeight)
        ctx.stroke()
      }
    }
  }

  setGridLines(show: boolean): void {
    this.gridLines = show
  }
}
