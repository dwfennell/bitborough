import type { DocSection } from './types.js'

export const fire: DocSection = {
  title: 'Fire',
  content: `
    <p>Fires ignite randomly on zoned tiles each month. Each tile has a small chance of catching fire, dramatically reduced by fire station coverage:</p>
    <p class="docs-formula"><code>Fire Risk = 0.1% × (1 − Coverage × 0.9)</code> — per tile per month</p>
    <p>Fires burn for 3–5 months and spread to adjacent zoned tiles. Spread chance per neighbor:</p>
    <p class="docs-formula"><code>Spread Chance = 15% × (1 − Coverage × 0.7)</code></p>
    <p><strong>Fire Stations</strong> ($300, $50/mo) cover a 15-tile radius (scales with funding, same as police). Tiles with over 50% coverage extinguish fires in 1 month instead of 3–5. When a fire burns out, it <strong>destroys the zone and building</strong> on that tile.</p>
    <p>Water, roads, and empty land act as natural firebreaks — fires cannot spread across them.</p>
    <p>Use the <strong>Fire overlay (F)</strong> to see coverage (green = safe) and active fires (orange).</p>
  `,
}
