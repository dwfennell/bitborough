import { Command } from 'commander'
import { loadEngine } from '../state.js'
import { out, outErr } from '../output.js'
import { TileType, ZoneType, Infrastructure } from '@bitborough/core'
import type { Building } from '@bitborough/core'
import { BUILDING_DEFS } from '@bitborough/engine'

export function tileCommand(program: Command) {
  program
    .command('tile <x> <y>')
    .description('inspect a single tile')
    .option('--file <path>', 'game file', 'game.json')
    .action((x, y, opts) => {
      const engine = loadEngine(opts.file)
      const tx = parseInt(x),
        ty = parseInt(y)
      const state = engine.getState()
      if (isNaN(tx) || isNaN(ty) || tx < 0 || ty < 0 || tx >= state.map.width || ty >= state.map.height) {
        outErr({ ok: false, error: `Coordinates (${tx},${ty}) out of bounds` })
      }
      const info = engine.getTile(tx, ty)
      const building = state.map.buildings.find((b: Building) => {
        const size = BUILDING_DEFS[b.defId]?.size ?? { w: 1, h: 1 }
        return tx >= b.x && tx < b.x + size.w && ty >= b.y && ty < b.y + size.h
      })
      const def = building ? BUILDING_DEFS[building.defId] : undefined
      out({
        x: tx,
        y: ty,
        terrain: TileType[info.terrain],
        zone: info.zone !== ZoneType.None ? ZoneType[info.zone] : null,
        infra: infraFlags(info.infrastructure),
        powered: info.powered,
        hasRoadAccess: info.hasRoadAccess,
        landValue: info.landValue,
        crimeLevel: info.crimeLevel,
        fireCoverage: info.fireCoverage,
        pollutionLevel: info.pollutionLevel,
        reputation: Math.round(info.reputation * 1000) / 1000,
        building: building
          ? {
              id: building.defId,
              state: building.state,
              residents: building.residents,
              capacity: def?.capacity ?? 0,
            }
          : null,
      })
    })
}

function infraFlags(infra: number): string[] {
  const flags: string[] = []
  if (infra & Infrastructure.Road) {
    flags.push(infra & Infrastructure.PavedRoad ? 'pavedRoad' : 'road')
  }
  if (infra & Infrastructure.PowerLine) flags.push('powerLine')
  if (infra & Infrastructure.Rail) flags.push('rail')
  return flags
}
