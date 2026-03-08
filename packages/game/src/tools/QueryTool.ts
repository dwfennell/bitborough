import type { Tool } from './Tool.js'
import type { Result } from '@bitborough/core'
import { type Engine, type TileInfo } from '@bitborough/engine'

export class QueryTool implements Tool {
  readonly name = 'Query'
  readonly cursor = 'help'
  readonly category = 'query' as const
  lastQuery: TileInfo | null = null

  onTileClick(x: number, y: number, engine: Engine): Result {
    this.lastQuery = engine.getTile(x, y)
    return { ok: true }
  }
}
