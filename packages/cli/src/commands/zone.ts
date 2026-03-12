import { Command } from 'commander'
import { ZoneType } from '@bitborough/core'
import { loadEngine, saveEngine } from '../state.js'
import { out } from '../output.js'

const ZONE_MAP: Record<string, ZoneType> = {
  R: ZoneType.Residential,
  C: ZoneType.Commercial,
  I: ZoneType.Industrial,
}

export function zoneCommand(program: Command) {
  program
    .command('zone <type> <x> <y>')
    .description('zone a tile (R=Residential, C=Commercial, I=Industrial)')
    .option('--file <path>', 'game file', 'game.json')
    .action((type, x, y, opts) => {
      const engine = loadEngine(opts.file)
      const zone = ZONE_MAP[type.toUpperCase()]
      if (!zone) out({ ok: false, error: `Zone must be R, C, or I` })
      const result = engine.placeZone(parseInt(x), parseInt(y), zone!)
      if (result.ok) saveEngine(engine, opts.file)
      out({
        ok: result.ok,
        reason: result.ok ? undefined : String((result as { ok: false; reason: unknown }).reason),
        funds: engine.getState().funds,
      })
    })
}
