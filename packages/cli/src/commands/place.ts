import { Command } from 'commander'
import { Infrastructure, FailReason } from '@bitborough/core'
import { loadEngine, saveEngine } from '../state.js'
import { out, outErr } from '../output.js'

const INFRA_MAP: Record<string, Infrastructure> = {
  road:      Infrastructure.Road,
  powerline: Infrastructure.PowerLine,
}

const BUILDING_MAP: Record<string, string> = {
  diesel:  'power.diesel',
  coal:    'power.coal',
  nuclear: 'power.nuclear',
  transit: 'transit.stop',
  police:  'service.police',
  fire:    'service.fire',
  park:    'special.park',
}

export function placeCommand(program: Command) {
  program
    .command('place <type> <x> <y>')
    .description('place infrastructure or building (types: road, powerline, pave, diesel, coal, nuclear, transit, police, fire, park)')
    .option('--file <path>', 'game file', 'game.json')
    .action((type, x, y, opts) => {
      const engine = loadEngine(opts.file)
      const tx = parseInt(x), ty = parseInt(y)

      if (!(type in INFRA_MAP) && type !== 'pave' && !(type in BUILDING_MAP)) {
        outErr({ ok: false, error: `Unknown type: ${type}. Valid: road, powerline, pave, ${Object.keys(BUILDING_MAP).join(', ')}` })
      }

      let result: { ok: boolean; reason?: unknown; detail?: string }

      if (type in INFRA_MAP) {
        result = engine.placeTile(tx, ty, INFRA_MAP[type]!)
      } else if (type === 'pave') {
        result = engine.upgradeTile(tx, ty)
      } else {
        result = engine.placeBuilding(tx, ty, BUILDING_MAP[type]!)
      }

      if (result.ok) saveEngine(engine, opts.file)
      const response = {
        ok: result.ok,
        reason: result.ok ? undefined : FailReason[result.reason as FailReason],
        detail: (result as { detail?: string }).detail,
        funds: engine.getState().funds,
      }
      if (result.ok) out(response); else outErr(response)
    })
}
