import { TileType, ZoneType, Infrastructure, type Building, type BuildingDef } from '@bitborough/core'
import { TERRAIN_COLORS, ZONE_OVERLAY_COLORS, ZONE_LETTERS } from './colors.js'
import { SpriteCache } from './SpriteCache.js'

export interface TileRenderer {
  drawTile(ctx: CanvasRenderingContext2D, tileType: TileType, screenX: number, screenY: number, tileSize: number): void
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

const BUILDING_COLORS: Record<string, string> = {
  'power.diesel': '#8d6e63',
  'power.coal': '#555',
  'power.nuclear': '#7e57c2',
  'service.police.small': '#4a90d9',
  'service.police': '#1565c0',
  'service.fire.small': '#e53935',
  'service.fire': '#c62828',
  'special.park': '#66bb6a',
}

// Maps building defIds to SVG asset paths (served from publicDir)
const BUILDING_SPRITES: Record<string, string> = {
  // Low density
  'res.low': '/tiles/buildings/residential-small.svg',
  'com.low': '/tiles/buildings/commercial-small.svg',
  'ind.low': '/tiles/buildings/industrial-small.svg',
  // Medium density
  'res.med': '/tiles/buildings/residential-medium.svg',
  'res.med.b': '/tiles/buildings/residential-medium.svg',
  'com.med': '/tiles/buildings/commercial-medium.svg',
  'com.med.b': '/tiles/buildings/commercial-medium.svg',
  'ind.med': '/tiles/buildings/industrial-medium.svg',
  'ind.med.b': '/tiles/buildings/industrial-medium-b.svg',
  // High density
  'res.high': '/tiles/buildings/residential-large.svg',
  'com.high': '/tiles/buildings/commercial-large.svg',
  'com.high.b': '/tiles/buildings/commercial-large-b.svg',
  'ind.high': '/tiles/buildings/industrial-large.svg',
  'ind.high.b': '/tiles/buildings/industrial-large-b.svg',
  // Transit
  'transit.stop': '/tiles/buildings/transit-stop.svg',
  // Power / service / special
  'power.diesel': '/tiles/power/diesel-generator.svg',
  'power.coal': '/tiles/power/power-plant-coal.svg',
  'power.nuclear': '/tiles/power/power-plant-nuclear.svg',
  'service.police.small': '/tiles/buildings/service/police-kiosk.svg',
  'service.police': '/tiles/buildings/service/police-station.svg',
  'service.fire.small': '/tiles/buildings/service/fire-substation.svg',
  'service.fire': '/tiles/buildings/service/fire-station.svg',
  'special.park': '/tiles/buildings/park.svg',
}

export class ColorTileRenderer implements TileRenderer {
  private sprites = new SpriteCache()
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
      const isPaved = !!(infra & Infrastructure.PavedRoad)

      // Try SVG sprite (loaded asynchronously; falls back to programmatic on first render)
      const n = connections & 1 ? '1' : '0'
      const e = connections & 2 ? '1' : '0'
      const s = connections & 4 ? '1' : '0'
      const w = connections & 8 ? '1' : '0'
      const nesw = `${n}${e}${s}${w}`
      const spritePath = isPaved ? `/tiles/roads/paved-${nesw}.svg` : `/tiles/roads/road-${nesw}.svg`
      const img = this.sprites.get(spritePath)
      if (img) {
        ctx.drawImage(img, screenX, screenY, tileSize, tileSize)
      } else {
        // Programmatic fallback while sprite loads
        ctx.fillStyle = isPaved ? '#404040' : '#555'
        const roadWidth = tileSize * 0.4
        const offset = (tileSize - roadWidth) / 2
        ctx.fillRect(screenX + offset, screenY + offset, roadWidth, roadWidth)

        // Draw connections: N=1, E=2, S=4, W=8
        if (connections & 1) ctx.fillRect(cx - roadWidth / 2, screenY, roadWidth, half)
        if (connections & 2) ctx.fillRect(cx, cy - roadWidth / 2, half, roadWidth)
        if (connections & 4) ctx.fillRect(cx - roadWidth / 2, cy, roadWidth, half)
        if (connections & 8) ctx.fillRect(screenX, cy - roadWidth / 2, half, roadWidth)

        // Yellow center stripe on paved roads
        if (isPaved && tileSize >= 8) {
          ctx.fillStyle = '#e8d080'
          ctx.globalAlpha = 0.5
          if (connections & 1) ctx.fillRect(cx - 0.5, screenY, 1, half)
          if (connections & 4) ctx.fillRect(cx - 0.5, cy, 1, half)
          if (connections & 2) ctx.fillRect(cx, cy - 0.5, half, 1)
          if (connections & 8) ctx.fillRect(screenX, cy - 0.5, half, 1)
          ctx.globalAlpha = 1.0
        }
      }
    }

    if (infra & Infrastructure.PowerLine) {
      ctx.strokeStyle = '#ffc107'
      ctx.lineWidth = Math.max(1, tileSize * 0.08)
      ctx.beginPath()

      if (connections & 1) {
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx, screenY)
      }
      if (connections & 2) {
        ctx.moveTo(cx, cy)
        ctx.lineTo(screenX + tileSize, cy)
      }
      if (connections & 4) {
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx, screenY + tileSize)
      }
      if (connections & 8) {
        ctx.moveTo(cx, cy)
        ctx.lineTo(screenX, cy)
      }

      ctx.stroke()

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

    // Opaque background covering full footprint so grid lines don't bleed through
    ctx.fillStyle = '#e8dcc8'
    ctx.fillRect(screenX, screenY, w, h)

    // State-based sprites override normal building sprites
    if (building.state === 'under_construction') {
      const maxDim = Math.max(def.size.w, def.size.h)
      const constructionSprite =
        maxDim >= 4
          ? '/tiles/buildings/construction-4x4.svg'
          : maxDim >= 3
            ? '/tiles/buildings/construction-3x3.svg'
            : maxDim >= 2
              ? '/tiles/buildings/construction-2x2.svg'
              : '/tiles/buildings/construction.svg'
      const img = this.sprites.get(constructionSprite)
      if (img) {
        ctx.fillStyle = '#d8c498'
        ctx.fillRect(screenX, screenY, w, h)
        ctx.drawImage(img, screenX, screenY, w, h)
        return
      }
    }

    if (building.state === 'derelict') {
      const img = this.sprites.get('/tiles/buildings/derelict.svg')
      if (img) {
        ctx.fillStyle = '#c8c0a8'
        ctx.fillRect(screenX, screenY, w, h)
        ctx.drawImage(img, screenX, screenY, w, h)
        return
      }
    }

    // Try SVG sprite first
    const spritePath = BUILDING_SPRITES[building.defId]
    if (spritePath) {
      const img = this.sprites.get(spritePath)
      if (img) {
        ctx.drawImage(img, screenX, screenY, w, h)
        return
      }
    }

    // Fallback: colored rectangle with label
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
    ctx.fillStyle = ZONE_OVERLAY_COLORS[zone]
    ctx.fillRect(screenX, screenY, tileSize, tileSize)

    if (tileSize >= 12) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = `${Math.max(8, tileSize * 0.4)}px system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(ZONE_LETTERS[zone] ?? '', screenX + tileSize / 2, screenY + tileSize / 2)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }
}
