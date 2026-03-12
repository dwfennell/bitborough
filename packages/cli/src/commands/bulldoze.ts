import { Command } from 'commander'
import { loadEngine, saveEngine } from '../state.js'
import { out } from '../output.js'

export function bulldozeCommand(program: Command) {
  program
    .command('bulldoze <x> <y>')
    .description('remove infrastructure, zone, or building at tile')
    .option('--file <path>', 'game file', 'game.json')
    .action((x, y, opts) => {
      const engine = loadEngine(opts.file)
      const result = engine.bulldoze(parseInt(x), parseInt(y))
      if (result.ok) saveEngine(engine, opts.file)
      out({
        ok: result.ok,
        reason: result.ok ? undefined : String((result as { ok: false; reason: unknown }).reason),
        funds: engine.getState().funds,
      })
    })
}
