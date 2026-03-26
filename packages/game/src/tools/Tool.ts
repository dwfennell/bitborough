import type { Result } from '@bitborough/core'
import type { Engine } from '@bitborough/engine'

export type ToolCategory = 'infrastructure' | 'zone' | 'building' | 'bulldoze' | 'query'

export interface Tool {
  readonly name: string
  readonly cursor: string
  readonly category: ToolCategory
  onTileClick(x: number, y: number, engine: Engine): Result
  onTileDrag?(x: number, y: number, engine: Engine): Result
  getPreviewColor?(): string
  getPreviewSize?(): { w: number; h: number }
}
