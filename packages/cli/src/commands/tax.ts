import { Command } from 'commander'
import { loadEngine, saveEngine } from '../state.js'
import { out } from '../output.js'

export function taxCommand(program: Command) {
  program
    .command('tax <rate>')
    .description('set tax rate (0-20, as percentage)')
    .option('--file <path>', 'game file', 'game.json')
    .action((rate, opts) => {
      const engine = loadEngine(opts.file)
      const pct = parseFloat(rate)
      engine.setTaxRate(pct / 100)
      saveEngine(engine, opts.file)
      const s = engine.getState()
      out({
        ok: true,
        taxRate: (s.budget.taxRate * 100).toFixed(1) + '%',
        taxIncome: s.budget.taxIncome,
        projectedBalance: s.budget.projectedBalance,
      })
    })
}
