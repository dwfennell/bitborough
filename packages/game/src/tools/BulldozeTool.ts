import type { Tool } from './Tool.js'
import type { Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'

export class BulldozeTool implements Tool {
  readonly name = 'Bulldoze'
  readonly cursor = 'crosshair'

  onTileClick(x: number, y: number, engine: Engine): Result {
    return engine.bulldoze(x, y)
  }

  getPreviewColor(): string {
    return 'rgba(244, 67, 54, 0.4)'
  }
}
