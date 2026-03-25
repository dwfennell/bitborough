import { Command } from 'commander'
import { loadEngine, saveEngine } from '../state.js'
import { out, outErr } from '../output.js'

const SERVICES = ['police', 'fire', 'transit'] as const

export function fundingCommand(program: Command) {
  program
    .command('funding <service> <level>')
    .description('set service funding level (0-100). Services: police, fire, transit')
    .option('--file <path>', 'game file', 'game.json')
    .action((service, level, opts) => {
      if (!SERVICES.includes(service as typeof SERVICES[number])) {
        outErr({ ok: false, error: `Unknown service: ${service}. Valid: ${SERVICES.join(', ')}` })
        return
      }
      const engine = loadEngine(opts.file)
      engine.setFunding(service as 'police' | 'fire' | 'transit', parseInt(level))
      saveEngine(engine, opts.file)
      const s = engine.getState()
      out({
        ok: true,
        service,
        level: parseInt(level),
        serviceCosts: s.budget.serviceCosts.total,
      })
    })
}
