import { Command } from 'commander'
import { loadEngine } from '../state.js'
import { out } from '../output.js'
import { TileType, ZoneType, Infrastructure } from '@bitborough/core'
import type { Building } from '@bitborough/core'

export function tilesCommand(program: Command) {
  program
    .command('tiles <x1> <y1> <x2> <y2>')
    .description('inspect a rectangular region of tiles')
    .option('--file <path>', 'game file', 'game.json')
    .action((x1, y1, x2, y2, opts) => {
      const engine = loadEngine(opts.file)
      const state = engine.getState()
      const tiles = []
      const gridRows: string[] = []

      for (let y = parseInt(y1); y <= parseInt(y2); y++) {
        const rowCells: string[] = []
        for (let x = parseInt(x1); x <= parseInt(x2); x++) {
          const info = engine.getTile(x, y)
          const building = state.map.buildings.find((b: Building) => b.x === x && b.y === y)
          tiles.push({
            x, y,
            terrain: TileType[info.terrain],
            zone: info.zone !== ZoneType.None ? ZoneType[info.zone] : null,
            powered: info.powered,
            hasRoadAccess: info.hasRoadAccess,
            building: building?.defId ?? null,
          })
          let cell = '.'
          if (info.terrain === TileType.Water) cell = '~'
          else if (info.infrastructure & Infrastructure.Road) {
            cell = info.infrastructure & Infrastructure.PavedRoad ? '=' : '-'
          } else if (info.zone === ZoneType.Residential) cell = 'R'
          else if (info.zone === ZoneType.Commercial) cell = 'C'
          else if (info.zone === ZoneType.Industrial) cell = 'I'
          rowCells.push(cell)
        }
        gridRows.push(rowCells.join(''))
      }
      out({ tiles, grid: gridRows.join('\n') })
    })
}
