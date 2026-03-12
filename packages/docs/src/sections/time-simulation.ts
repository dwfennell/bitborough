import type { DocSection } from '../types.js'

export const timeSimulation: DocSection = {
  id: 'time-simulation',
  title: 'Time & Simulation',
  body: `
The game runs in **ticks**. Every 4 ticks equals one month, and 12 months make a year (starting from January 1900).

Each month the simulation recalculates:

- Zone demand (R/C/I)
- Land values
- Crime levels
- Fire coverage and active fires
- Zone development (new buildings)
- Traffic density
- Monthly budget balance

Your budget balance accumulates monthly but is **applied to your funds once per year in January**.

Control game speed with **Space** (pause), **[** (slower), and **]** (faster).
`.trim(),
}
