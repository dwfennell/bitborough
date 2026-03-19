#!/usr/bin/env node
import { Command } from 'commander'
import { newCommand } from './commands/new.js'
import { statusCommand } from './commands/status.js'
import { tickCommand } from './commands/tick.js'
import { placeCommand } from './commands/place.js'
import { zoneCommand } from './commands/zone.js'
import { bulldozeCommand } from './commands/bulldoze.js'
import { tileCommand } from './commands/tile.js'
import { tilesCommand } from './commands/tiles.js'
import { buildingsCommand } from './commands/buildings.js'
import { docsCommand } from './commands/docs.js'

const program = new Command()
  .name('bitt')
  .description('Bitborough CLI — AI-friendly terminal interface')
  .version('0.0.1')

newCommand(program)
statusCommand(program)
tickCommand(program)
placeCommand(program)
zoneCommand(program)
bulldozeCommand(program)
tileCommand(program)
tilesCommand(program)
buildingsCommand(program)
docsCommand(program)

program.parse()
