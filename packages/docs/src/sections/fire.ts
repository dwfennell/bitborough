import type { DocSection } from '../types.js'

export const fire: DocSection = {
  id: 'fire',
  title: 'Fire',
  body: [
    'Fires ignite randomly on zoned tiles each month. Each tile has a small chance of catching fire, dramatically reduced by fire station coverage:',
    '',
    '`Fire Risk = 0.1% × (1 − Coverage × 0.9)` — per tile per month',
    '',
    'Fires burn for 3–5 months and spread to adjacent zoned tiles. Spread chance per neighbor:',
    '',
    '`Spread Chance = 15% × (1 − Coverage × 0.7)`',
    '',
    '**Fire Substations** ($60, $12/mo) are small 1×1 units with a 6-tile radius — ideal for early-game coverage. **Fire Stations** ($300, $50/mo) cover a larger 15-tile radius. Substations within a station\'s coverage get a 1.5× range boost (6 → 9 tiles). Tiles with over 50% coverage extinguish fires in 1 month instead of 3–5. When a fire burns out, it **destroys the building** on that tile but **preserves the zoning**, so new buildings can regrow naturally.',
    '',
    'Water, roads, and empty land act as natural firebreaks — fires cannot spread across them.',
    '',
    'Use the **Fire overlay (F)** to see coverage (green = safe) and active fires (orange).',
  ].join('\n'),
}
