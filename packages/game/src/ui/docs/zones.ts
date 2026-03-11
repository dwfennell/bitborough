import type { DocSection } from './types.js'

export const zones: DocSection = {
  title: 'Zones & Development',
  content: `
    <p>Zones are where your city grows. Place them and buildings appear automatically when conditions are met.</p>
    <p><strong>Requirements for initial development:</strong></p>
    <ul>
      <li>Zone must be <em>powered</em></li>
      <li>Zone must be within <em>3 tiles of a road</em> (Manhattan distance)</li>
      <li>Positive <em>demand</em> for that zone type</li>
    </ul>
    <p>Each month, every eligible empty zone tile rolls for development:</p>
    <p class="docs-formula"><code>Development Chance = 12% × Zone Demand</code> — per tile per month</p>

    <p><strong>Density progression:</strong> As your city grows, buildings automatically upgrade from Low → Medium → High density.</p>
    <ul>
      <li><strong>Low → Medium:</strong> Requires a <em>paved road</em> within 3 tiles and city population above 500. Buildings near the city center upgrade first.</li>
      <li><strong>Medium → High:</strong> Requires a <em>transit stop</em> within 10 tiles and a dense surrounding neighborhood. Clusters around transit hubs.</li>
    </ul>
    <p>Upgrades take <em>2 months</em> — you'll see a construction phase before the new building appears.</p>
    <p>If you remove infrastructure after an upgrade, the building goes <em>derelict</em>. Restore the infrastructure within 6 months to recover it, or it will downgrade.</p>

    <p><strong>Residential</strong> — Where people live. Low: 10 pop. Medium: 100–120 pop. High: 330 pop.</p>
    <p><strong>Commercial</strong> — Shops and offices. Demand scales with population. High density commercial generates exceptional tax revenue.</p>
    <p><strong>Industrial</strong> — Factories. Higher density means <em>more production value but fewer jobs</em> due to automation — watch your unemployment.</p>
    <p>Watch the <strong>R/C/I demand bars</strong> in the top bar to know when to zone more.</p>
  `,
}
