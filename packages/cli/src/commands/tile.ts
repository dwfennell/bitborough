import { Command } from 'commander'
import { loadEngine } from '../state.js'
import { out } from '../output.js'
import { TileType, ZoneType, Infrastructure } from '@bitborough/core'
import type { Building } from '@bitborough/core'

export function tileCommand(program: Command) {
  program
    .command('tile <x> <y>')
    .description('inspect a single tile')
    .option('--file <path>', 'game file', 'game.json')
    .action((x, y, opts) => {
      const engine = loadEngine(opts.file)
      const tx = parseInt(x), ty = parseInt(y)
      const state = engine.getState()
      const info = engine.getTile(tx, ty)
      const building = state.map.buildings.find((b: Building) => b.x === tx && b.y === ty)
      out({
        x: tx, y: ty,
        terrain: TileType[info.terrain],
        zone: info.zone !== ZoneType.None ? ZoneType[info.zone] : null,
        infra: infraFlags(info.infrastructure),
        powered: info.powered,
        hasRoadAccess: info.hasRoadAccess,
        building: building ? { id: building.defId, state: building.state } : null,
      })
    })
}

function infraFlags(infra: number): string[] {
  const flags: string[] = []
  if (infra & Infrastructure.Road) {
    flags.push(infra & Infrastructure.PavedRoad ? 'pavedRoad' : 'road')
  }
  if (infra & Infrastructure.PowerLine) flags.push('powerLine')
  if (infra & Infrastructure.Rail) flags.push('rail')
  return flags
}
