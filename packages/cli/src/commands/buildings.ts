import { Command } from 'commander'
import { loadEngine } from '../state.js'
import { out } from '../output.js'
import type { Building } from '@bitborough/core'

export function buildingsCommand(program: Command) {
  program
    .command('buildings')
    .description('list all placed buildings')
    .option('--file <path>', 'game file', 'game.json')
    .action((opts) => {
      const engine = loadEngine(opts.file)
      const state = engine.getState()
      out(state.map.buildings.map((b: Building) => ({
        x: b.x, y: b.y, id: b.defId, state: b.state,
      })))
    })
}
