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
    '**Fire Stations** ($300, $50/mo) cover a 15-tile radius (scales with funding, same as police). Tiles with over 50% coverage extinguish fires in 1 month instead of 3–5. When a fire burns out, it **destroys the zone and building** on that tile.',
    '',
    'Water, roads, and empty land act as natural firebreaks — fires cannot spread across them.',
    '',
    'Use the **Fire overlay (F)** to see coverage (green = safe) and active fires (orange).',
  ].join('\n'),
}
