import { Command } from 'commander'
import { Engine } from '@bitborough/engine'
import { generateMap } from '@bitborough/map-gen'
import type { MapSize } from '@bitborough/core'
import { saveEngine } from '../state.js'
import { out } from '../output.js'

export function newCommand(program: Command) {
  program
    .command('new')
    .option('--seed <n>', 'map seed', '0')
    .option('--size <n>', 'map size (32|64|128|256|512)', '128')
    .option('--preset <p>', 'map preset (plains|island)', 'plains')
    .option('--file <path>', 'output file', 'game.json')
    .action((opts) => {
      const size = parseInt(opts.size) as MapSize
      const seed = parseInt(opts.seed)
      const preset = opts.preset as 'plains' | 'island'
      const map = generateMap({ size, seed, preset })
      const engine = Engine.create(map)
      saveEngine(engine, opts.file)
      const state = engine.getState()
      out({ ok: true, file: opts.file, size, seed, preset, funds: state.funds })
    })
}
