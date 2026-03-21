import { Command } from 'commander'
import { loadEngine } from '../state.js'
import { out, outErr } from '../output.js'
import { TileType, ZoneType, Infrastructure } from '@bitborough/core'
import type { Building } from '@bitborough/core'
import { BUILDING_DEFS } from '@bitborough/engine'

export function tilesCommand(program: Command) {
  program
    .command('tiles <x1> <y1> <x2> <y2>')
    .description('inspect a rectangular region of tiles')
    .option('--file <path>', 'game file', 'game.json')
    .action((x1, y1, x2, y2, opts) => {
      const engine = loadEngine(opts.file)
      const state = engine.getState()
      const x1i = parseInt(x1), y1i = parseInt(y1), x2i = parseInt(x2), y2i = parseInt(y2)
      if (
        isNaN(x1i) || isNaN(y1i) || isNaN(x2i) || isNaN(y2i) ||
        x1i < 0 || y1i < 0 || x2i < 0 || y2i < 0 ||
        x1i >= state.map.width || y1i >= state.map.height ||
        x2i >= state.map.width || y2i >= state.map.height
      ) {
        outErr({ ok: false, error: `Coordinates (${x1i},${y1i})-(${x2i},${y2i}) out of bounds` })
      }
      const tiles = []
      const gridRows: string[] = []

      for (let y = y1i; y <= y2i; y++) {
        const rowCells: string[] = []
        for (let x = x1i; x <= x2i; x++) {
          const info = engine.getTile(x, y)
          const building = state.map.buildings.find((b: Building) => {
            const size = BUILDING_DEFS[b.defId]?.size ?? { w: 1, h: 1 }
            return x >= b.x && x < b.x + size.w && y >= b.y && y < b.y + size.h
          })
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
          else if (building) cell = 'B'
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
