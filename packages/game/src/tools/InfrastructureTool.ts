import type { Tool } from './Tool.js'
import { type Infrastructure, type Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'

export class InfrastructureTool implements Tool {
  readonly cursor = 'crosshair'
  readonly category = 'infrastructure' as const

  constructor(
    readonly name: string,
    private infra: Infrastructure,
    private previewColor: string,
  ) {}

  onTileClick(x: number, y: number, engine: Engine): Result {
    return engine.placeTile(x, y, this.infra)
  }

  getPreviewColor(): string {
    return this.previewColor
  }
}
