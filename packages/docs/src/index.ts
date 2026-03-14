export type { DocSection, BuildingRow } from './types.js'
export { getBuildingReference } from './building-reference.js'

import { gettingStarted } from './sections/getting-started.js'
import { controls } from './sections/controls.js'
import { tools } from './sections/tools.js'
import { overlays } from './sections/overlays.js'
import { power } from './sections/power.js'
import { zones } from './sections/zones.js'
import { roadsTraffic } from './sections/roads-traffic.js'
import { budgetTaxes } from './sections/budget-taxes.js'
import { demand } from './sections/demand.js'
import { crime } from './sections/crime.js'
import { fire } from './sections/fire.js'
import { landValue } from './sections/land-value.js'
import { timeSimulation } from './sections/time-simulation.js'
import type { DocSection } from './types.js'

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
]
