import type { Tool } from './Tool.js'
import type { Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'

export class UpgradeRoadTool implements Tool {
  readonly name = 'Upgrade Road'
  readonly cursor = 'crosshair'
  readonly category = 'infrastructure' as const

  onTileClick(x: number, y: number, engine: Engine): Result {
    return engine.upgradeTile(x, y)
  }

  getPreviewColor(): string {
    return 'rgba(100,160,80,0.5)'
  }
}
