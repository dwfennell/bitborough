import type { Tool } from './Tool.js'
import { ZoneType, type Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'
import { ZONE_PREVIEW_COLORS } from '../render/colors.js'

export class ZoneTool implements Tool {
  readonly name: string
  readonly cursor = 'crosshair'
  readonly category = 'zone' as const

  constructor(private zone: ZoneType) {
    const names: Record<number, string> = {
      [ZoneType.Residential]: 'Residential',
      [ZoneType.Commercial]: 'Commercial',
      [ZoneType.Industrial]: 'Industrial',
    }
    this.name = `Zone ${names[zone] ?? 'Zone'}`
  }

  onTileClick(x: number, y: number, engine: Engine): Result {
    return engine.placeZone(x, y, this.zone)
  }

  getPreviewColor(): string {
    return ZONE_PREVIEW_COLORS[this.zone] ?? 'rgba(128,128,128,0.4)'
  }
}
