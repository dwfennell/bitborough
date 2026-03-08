import type { Tool } from './Tool.js'
import { Infrastructure, type Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'

export class PowerLineTool implements Tool {
  readonly name = 'Power Line'
  readonly cursor = 'crosshair'

  onTileClick(x: number, y: number, engine: Engine): Result {
    return engine.placeTile(x, y, Infrastructure.PowerLine)
  }

  onTileDrag(x: number, y: number, engine: Engine): Result {
    return engine.placeTile(x, y, Infrastructure.PowerLine)
  }

  getPreviewColor(): string {
    return 'rgba(255, 193, 7, 0.5)'
  }
}
