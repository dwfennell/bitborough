import type { DocSection } from './types.js'

export const zones: DocSection = {
  title: 'Zones & Development',
  content: `
    <p>Zones are where your city grows. Place them and buildings appear automatically when conditions are met.</p>
    <p><strong>Requirements for development:</strong></p>
    <ul>
      <li>Zone must be <em>powered</em></li>
      <li>Zone must be within <em>3 tiles of a road</em> (Manhattan distance)</li>
      <li>Positive <em>demand</em> for that zone type</li>
    </ul>
    <p>Each month, every eligible empty zone tile rolls for development:</p>
    <p class="docs-formula"><code>Development Chance = 12% × Zone Demand</code> — per tile per month</p>
    <p><strong>Residential</strong> — Where people live. Each building adds 10 population. Strong base demand (0.7).</p>
    <p><strong>Commercial</strong> — Shops and offices. Each building provides 5 jobs. Demand scales with population.</p>
    <p><strong>Industrial</strong> — Factories and workshops. Each building provides 10 jobs. Steady base demand (0.4), less sensitive to taxes. Generates pollution.</p>
    <p>Watch the <strong>R/C/I demand bars</strong> in the top bar to know when to zone more.</p>
  `,
}
