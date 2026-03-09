import type { DocSection } from './types.js'
import { gettingStarted } from './getting-started.js'
import { controls } from './controls.js'
import { tools } from './tools.js'
import { overlays } from './overlays.js'
import { power } from './power.js'
import { zones } from './zones.js'
import { roadsTraffic } from './roads-traffic.js'
import { budgetTaxes } from './budget-taxes.js'
import { demand } from './demand.js'
import { crime } from './crime.js'
import { fire } from './fire.js'
import { landValue } from './land-value.js'
import { timeSimulation } from './time-simulation.js'
import { buildingReference } from './building-reference.js'

export type { DocSection }

export const SECTIONS: DocSection[] = [
  gettingStarted,
  controls,
  tools,
  overlays,
  power,
  zones,
  roadsTraffic,
  budgetTaxes,
  demand,
  crime,
  fire,
  landValue,
  timeSimulation,
  buildingReference,
]
