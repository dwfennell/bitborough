import { type GameState, TileType, ZoneType, Infrastructure } from '@bitborough/core'
import { Camera } from './Camera.js'
import { type TileRenderer, ColorTileRenderer } from './TileRenderer.js'
import { OverlayRenderer, type OverlayType } from './OverlayRenderer.js'
import { BUILDING_DEFS } from '@bitborough/engine'

export class Renderer {
  private tileRenderer: TileRenderer
  private gridLines = true
  private overlayRenderer = new OverlayRenderer()
  private buildingTiles = new Set<number>()
  private lastBuildingCount = -1

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

    // Grid lines — skip tiles occupied by buildings
    if (this.gridLines && ts >= 8) {
      if (map.buildings.length !== this.lastBuildingCount) {
        this.buildingTiles.clear()
        for (const building of map.buildings) {
          const def = BUILDING_DEFS[building.defId]
          if (!def) continue
          for (let dy = 0; dy < def.size.h; dy++) {
            for (let dx = 0; dx < def.size.w; dx++) {
              this.buildingTiles.add((building.y + dy) * map.width + (building.x + dx))
            }
          }
        }
        this.lastBuildingCount = map.buildings.length
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
          if (this.buildingTiles.has(y * map.width + x)) continue
          const sx = Math.floor((x - camera.x) * ts)
          const sy = Math.floor((y - camera.y) * ts)
          ctx.moveTo(sx + snappedTs, sy)
          ctx.lineTo(sx + snappedTs, sy + snappedTs)
          ctx.moveTo(sx, sy + snappedTs)
          ctx.lineTo(sx + snappedTs, sy + snappedTs)
        }
      }
      ctx.stroke()
    } else {
      this.lastBuildingCount = -1
    }

    // Buildings
    for (const building of map.buildings) {
      const def = BUILDING_DEFS[building.defId]
      if (!def) continue
      if (
        building.x + def.size.w < startX ||
        building.x > endX ||
        building.y + def.size.h < startY ||
        building.y > endY
      )
        continue
      const sx = Math.floor((building.x - camera.x) * ts)
      const sy = Math.floor((building.y - camera.y) * ts)
      this.tileRenderer.drawBuilding(ctx, building, def, sx, sy, snappedTs)
    }

    // Active fires (always visible)
    if (state.activeFires.length > 0) {
      const pulse = 0.5 + 0.2 * Math.sin(Date.now() / 200)
      const fireOuter = `rgba(255, 80, 0, ${pulse})`
      const fireInner = `rgba(255, 200, 0, ${pulse})`
      for (const idx of state.activeFires) {
        const fx = idx % map.width
        const fy = (idx - fx) / map.width
        if (fx < startX || fx > endX || fy < startY || fy > endY) continue
        const sx = Math.floor((fx - camera.x) * ts)
        const sy = Math.floor((fy - camera.y) * ts)
        ctx.fillStyle = fireOuter
        ctx.fillRect(sx, sy, snappedTs, snappedTs)
        const cx = sx + snappedTs / 2
        const cy = sy + snappedTs / 2
        const r = snappedTs * 0.3
        ctx.fillStyle = fireInner
        ctx.beginPath()
        ctx.moveTo(cx, cy - r)
        ctx.quadraticCurveTo(cx + r, cy - r * 0.3, cx + r * 0.5, cy + r * 0.5)
        ctx.quadraticCurveTo(cx, cy + r * 0.2, cx, cy + r)
        ctx.quadraticCurveTo(cx, cy + r * 0.2, cx - r * 0.5, cy + r * 0.5)
        ctx.quadraticCurveTo(cx - r, cy - r * 0.3, cx, cy - r)
        ctx.fill()
      }
    }

    // Overlays (power grid, land value heatmaps)
    this.overlayRenderer.render(ctx, state, {
      ts: snappedTs,
      startX,
      startY,
      endX,
      endY,
      mapWidth: map.width,
      cameraX: camera.x,
      cameraY: camera.y,
      rawTs: ts,
    })
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
