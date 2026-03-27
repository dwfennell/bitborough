import type { DocSection } from '../types.js'

export const power: DocSection = {
  id: 'power',
  title: 'Power',
  body: `
Buildings and zones need electricity to function. Power propagates from plants through adjacent powered tiles — including roads and zoned tiles, so you often don't need power lines within a developed area.

**Diesel Generator** — $300, $15/mo, powers 50 tiles. Small and polluting, but great for getting started.

**Coal Plant** — $2,000, $60/mo, powers 700 tiles. Workhorse mid-game plant. Pollutes heavily.

**Nuclear Plant** — $5,000, $100/mo, powers 2,000 tiles. Most efficient per tile. No pollution.

**Power Lines** — $5 each, $0.50/mo maintenance. Bridge gaps between your plant and developed areas.

Buildings without power show a **flashing lightning bolt** indicator on the map, making it easy to spot gaps in your grid.

**Efficiency comparison:**

| Plant | Cost/tile | Maint./tile | Pollution |
|---|---|---|---|
| Diesel | $6.00 | $0.30/mo | Radius 2 |
| Coal | $2.86 | $0.09/mo | Radius 6 |
| Nuclear | $2.50 | $0.05/mo | None |
`.trim(),
}
