import type { Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'

export interface Tool {
  readonly name: string
  readonly cursor: string
  onTileClick(x: number, y: number, engine: Engine): Result
  onTileDrag?(x: number, y: number, engine: Engine): Result
  getPreviewColor?(): string
}
