import { Command } from 'commander'
import { loadEngine } from '../state.js'
import { out } from '../output.js'

export function statusCommand(program: Command) {
  program
    .command('status')
    .option('--file <path>', 'game file', 'game.json')
    .action((opts) => {
      const engine = loadEngine(opts.file)
      const s = engine.getState()
      const d = engine.getDemand()
      out({
        month: s.time.month,
        year: s.time.year,
        population: Math.round(s.population),
        funds: Math.round(s.funds),
        taxIncome: s.budget.taxIncome,
        maintenanceCosts: s.budget.maintenanceCosts.total,
        serviceCosts: s.budget.serviceCosts.total,
        projectedBalance: s.budget.projectedBalance,
        demand: { R: d.residential, C: d.commercial, I: d.industrial },
        citizens: {
          agents: s.citizens.agentCount,
          avgSatisfaction: Math.round(s.citizens.avgSatisfaction * 100) / 100,
          tierCounts: { low: s.citizens.tierCounts[0], mid: s.citizens.tierCounts[1], high: s.citizens.tierCounts[2] },
        },
      })
    })
}
