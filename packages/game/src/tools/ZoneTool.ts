import type { Tool } from './Tool.js'
import { ZoneType, type Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'

export class ZoneTool implements Tool {
  readonly name: string
  readonly cursor = 'crosshair'

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

  onTileDrag(x: number, y: number, engine: Engine): Result {
    return engine.placeZone(x, y, this.zone)
  }

  getPreviewColor(): string {
    const colors: Record<number, string> = {
      [ZoneType.Residential]: 'rgba(76, 175, 80, 0.4)',
      [ZoneType.Commercial]: 'rgba(33, 150, 243, 0.4)',
      [ZoneType.Industrial]: 'rgba(255, 193, 7, 0.4)',
    }
    return colors[this.zone] ?? 'rgba(128,128,128,0.4)'
  }
}
