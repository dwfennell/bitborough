import type { DocSection } from '../types.js'

export const zones: DocSection = {
  id: 'zones',
  title: 'Zones & Development',
  body: `
Zones are where your city grows. Place them and buildings appear automatically when conditions are met.

**Requirements for initial development:**

- Zone must be *powered*
- Zone must be within *3 tiles of a road* (Manhattan distance)
- Positive *demand* for that zone type

Each month, every eligible empty zone tile rolls for development:

\`Development Chance = 12% × Zone Demand\` — per tile per month

**Population fill:** New buildings start empty. Each month, residents and workers gradually fill them based on desirability × demand — buildings do not pop instantly to full capacity.

- Services (police, fire) and parks improve *residential* desirability.
- Transit stops drive *commercial* desirability; commercial also needs nearby residents.

**Density progression:** Buildings upgrade from Low → Medium → High density when the neighbourhood is nearly full.

- **Low → Medium:** Requires a *paved road* within 3 tiles, the building at *70%+ occupancy*, and the surrounding neighbourhood at *70%+ average occupancy*.
- **Medium → High:** Requires a *transit stop* within 10 tiles and the building at *85%+ occupancy*.

Upgrades take *2 months* — you'll see a construction phase before the new building appears.

**Dereliction:** A building that stays below 10% occupancy for 3 consecutive months will downgrade. Removing infrastructure can also trigger dereliction.

**Residential** — Where people live. Low: 10 pop. Medium: 100–120 pop. High: 330 pop.

**Commercial** — Shops and offices. Demand scales with population. High density commercial generates exceptional tax revenue.

**Industrial** — Factories. Higher density means *more production value but fewer jobs* due to automation — watch your unemployment.

Watch the **R/C/I demand bars** in the top bar to know when to zone more. The **Pop** counter shows overall occupancy (% full) so you can gauge when upgrades are near.
`.trim(),
}
