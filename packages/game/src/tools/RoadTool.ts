import type { Tool } from './Tool.js'
import { Infrastructure, type Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'

export class RoadTool implements Tool {
  readonly name = 'Road'
  readonly cursor = 'crosshair'

  onTileClick(x: number, y: number, engine: Engine): Result {
    return engine.placeTile(x, y, Infrastructure.Road)
  }

  onTileDrag(x: number, y: number, engine: Engine): Result {
    return engine.placeTile(x, y, Infrastructure.Road)
  }

  getPreviewColor(): string {
    return 'rgba(85, 85, 85, 0.5)'
  }
}
