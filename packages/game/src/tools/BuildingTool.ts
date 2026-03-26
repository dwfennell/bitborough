import type { Tool } from './Tool.js'
import type { Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'
import { BUILDING_DEFS } from '@bitborough/engine'

export class BuildingTool implements Tool {
  readonly name: string
  readonly cursor = 'crosshair'
  readonly category = 'building' as const

  constructor(private defId: string) {
    this.name = defId
  }

  onTileClick(x: number, y: number, engine: Engine): Result {
    return engine.placeBuilding(x, y, this.defId)
  }

  getPreviewColor(): string {
    return 'rgba(128, 128, 128, 0.5)'
  }

  getPreviewSize(): { w: number; h: number } {
    const def = BUILDING_DEFS[this.defId]
    return def ? def.size : { w: 1, h: 1 }
  }
}
