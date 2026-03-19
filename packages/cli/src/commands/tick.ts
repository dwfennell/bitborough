import { Command } from 'commander'
import { DEFAULTS } from '@bitborough/core'
import { loadEngine, saveEngine } from '../state.js'
import { out } from '../output.js'

export function tickCommand(program: Command) {
  program
    .command('tick [n]')
    .description('advance game by N months (default 1)')
    .option('--file <path>', 'game file', 'game.json')
    .action((n, opts) => {
      const months = parseInt(n ?? '1')
      if (isNaN(months) || months < 1) {
        out({ ok: false, error: `Invalid tick count: ${n}` })
      }
      const engine = loadEngine(opts.file)
      // ticksPerMonth = 4 by default; advance that many ticks per month
      const ticksPerMonth = DEFAULTS.ticksPerMonth
      for (let i = 0; i < months * ticksPerMonth; i++) engine.tick()
      saveEngine(engine, opts.file)
      const s = engine.getState()
      out({
        ok: true,
        monthsAdvanced: months,
        month: s.time.month,
        year: s.time.year,
        population: s.population,
        funds: s.funds,
      })
    })
}
