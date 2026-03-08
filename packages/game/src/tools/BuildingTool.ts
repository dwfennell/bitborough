import type { Tool } from './Tool.js'
import type { Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'

export class BuildingTool implements Tool {
  readonly name: string
  readonly cursor = 'crosshair'

  constructor(private defId: string) {
    this.name = defId
  }

  onTileClick(x: number, y: number, engine: Engine): Result {
    return engine.placeBuilding(x, y, this.defId)
  }

  getPreviewColor(): string {
    return 'rgba(128, 128, 128, 0.5)'
  }
}
