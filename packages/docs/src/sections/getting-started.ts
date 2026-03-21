import type { DocSection } from '../types.js'

export const gettingStarted: DocSection = {
  id: 'getting-started',
  title: 'Getting Started',
  body: `
Welcome to Bitborough! Build and manage a thriving city.

**Basic steps:**

1. Place a *Diesel Generator* (key 6) or *Coal Power Plant* (key 7) to generate electricity
2. Run *Power Lines* (key 2) from the plant toward your city
3. Build *Roads* (key 1) for access
4. Zone *Residential* (3), *Commercial* (4), and *Industrial* (5) areas next to roads
5. Wait for buildings to develop automatically

Zones only develop when they are **powered** and **within 3 tiles of a road**.
`.trim(),
}
