import { Command } from 'commander'
import { FailReason } from '@bitborough/core'
import { loadEngine, saveEngine } from '../state.js'
import { out, outErr } from '../output.js'

export function bulldozeCommand(program: Command) {
  program
    .command('bulldoze <x> <y>')
    .description('remove infrastructure, zone, or building at tile')
    .option('--file <path>', 'game file', 'game.json')
    .action((x, y, opts) => {
      const engine = loadEngine(opts.file)
      const result = engine.bulldoze(parseInt(x), parseInt(y))
      if (result.ok) saveEngine(engine, opts.file)
      const response = {
        ok: result.ok,
        reason: result.ok ? undefined : FailReason[(result as { ok: false; reason: FailReason }).reason],
        funds: engine.getState().funds,
      }
      if (result.ok) out(response)
      else outErr(response)
    })
}
