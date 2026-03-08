import {
  TileType,
  ZoneType,
  Infrastructure,
  type Building,
  type BuildingDef,
} from '@bitborough/core'

export interface TileRenderer {
  drawTile(
    ctx: CanvasRenderingContext2D,
    tileType: TileType,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void
  drawInfrastructure(
    ctx: CanvasRenderingContext2D,
    infra: number,
    connections: number,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void
  drawBuilding(
    ctx: CanvasRenderingContext2D,
    building: Building,
    def: BuildingDef,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void
  drawZoneOverlay(
    ctx: CanvasRenderingContext2D,
    zone: ZoneType,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void
}

const TERRAIN_COLORS: Record<TileType, string> = {
  [TileType.Grass]: '#4a8c3f',
  [TileType.Water]: '#3b7dd8',
  [TileType.Dirt]: '#8b7355',
  [TileType.Sand]: '#d4b876',
  [TileType.Trees]: '#2d6b2e',
}

const ZONE_COLORS: Record<ZoneType, string> = {
  [ZoneType.None]: 'transparent',
  [ZoneType.Residential]: 'rgba(76, 175, 80, 0.3)',
  [ZoneType.Commercial]: 'rgba(33, 150, 243, 0.3)',
  [ZoneType.Industrial]: 'rgba(255, 193, 7, 0.3)',
}

const BUILDING_COLORS: Record<string, string> = {
  'power.coal': '#555',
  'power.nuclear': '#7e57c2',
  'service.police': '#1565c0',
  'service.fire': '#c62828',
  'special.park': '#66bb6a',
}

export class ColorTileRenderer implements TileRenderer {
  drawTile(
    ctx: CanvasRenderingContext2D,
    tileType: TileType,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void {
    ctx.fillStyle = TERRAIN_COLORS[tileType] ?? '#4a8c3f'
    ctx.fillRect(screenX, screenY, tileSize, tileSize)
  }

  drawInfrastructure(
    ctx: CanvasRenderingContext2D,
    infra: number,
    connections: number,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void {
    const cx = screenX + tileSize / 2
    const cy = screenY + tileSize / 2
    const half = tileSize / 2

    if (infra & Infrastructure.Road) {
      ctx.fillStyle = '#555'
      const roadWidth = tileSize * 0.4
      const offset = (tileSize - roadWidth) / 2
      ctx.fillRect(screenX + offset, screenY + offset, roadWidth, roadWidth)

      // Draw connections: N=1, E=2, S=4, W=8
      if (connections & 1)
        ctx.fillRect(cx - roadWidth / 2, screenY, roadWidth, half)
      if (connections & 2)
        ctx.fillRect(cx, cy - roadWidth / 2, half, roadWidth)
      if (connections & 4)
        ctx.fillRect(cx - roadWidth / 2, cy, roadWidth, half)
      if (connections & 8)
        ctx.fillRect(screenX, cy - roadWidth / 2, half, roadWidth)
    }

    if (infra & Infrastructure.PowerLine) {
      ctx.strokeStyle = '#ffc107'
      ctx.lineWidth = Math.max(1, tileSize * 0.08)

      if (connections & 1) {
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx, screenY)
        ctx.stroke()
      }
      if (connections & 2) {
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(screenX + tileSize, cy)
        ctx.stroke()
      }
      if (connections & 4) {
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx, screenY + tileSize)
        ctx.stroke()
      }
      if (connections & 8) {
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(screenX, cy)
        ctx.stroke()
      }

      ctx.fillStyle = '#ffc107'
      ctx.beginPath()
      ctx.arc(cx, cy, tileSize * 0.1, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawBuilding(
    ctx: CanvasRenderingContext2D,
    building: Building,
    def: BuildingDef,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void {
    const w = def.size.w * tileSize
    const h = def.size.h * tileSize
    const pad = tileSize * 0.1

    ctx.fillStyle = BUILDING_COLORS[building.defId] ?? '#888'
    ctx.fillRect(screenX + pad, screenY + pad, w - pad * 2, h - pad * 2)

    if (tileSize >= 12) {
      ctx.fillStyle = '#fff'
      ctx.font = `${Math.max(8, tileSize * 0.3)}px system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const label = building.defId.split('.')[1] ?? ''
      ctx.fillText(label.slice(0, 4), screenX + w / 2, screenY + h / 2)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }

  drawZoneOverlay(
    ctx: CanvasRenderingContext2D,
    zone: ZoneType,
    screenX: number,
    screenY: number,
    tileSize: number,
  ): void {
    if (zone === ZoneType.None) return
    ctx.fillStyle = ZONE_COLORS[zone]
    ctx.fillRect(screenX, screenY, tileSize, tileSize)

    if (tileSize >= 12) {
      const letters: Record<number, string> = {
        [ZoneType.Residential]: 'R',
        [ZoneType.Commercial]: 'C',
        [ZoneType.Industrial]: 'I',
      }
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = `${Math.max(8, tileSize * 0.4)}px system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        letters[zone] ?? '',
        screenX + tileSize / 2,
        screenY + tileSize / 2,
      )
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }
}
