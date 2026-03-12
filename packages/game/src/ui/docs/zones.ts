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

    <p><strong>Population fill:</strong> New buildings start empty. Each month, residents and workers gradually fill them based on desirability × demand — buildings do not pop instantly to full capacity.</p>
    <ul>
      <li>Services (police, fire) and parks improve <em>residential</em> desirability.</li>
      <li>Transit stops drive <em>commercial</em> desirability; commercial also needs nearby residents.</li>
    </ul>

    <p><strong>Density progression:</strong> Buildings upgrade from Low → Medium → High density when the neighbourhood is nearly full.</p>
    <ul>
      <li><strong>Low → Medium:</strong> Requires a <em>paved road</em> within 3 tiles, city population above 500, and the building at <em>80%+ occupancy</em>.</li>
      <li><strong>Medium → High:</strong> Requires a <em>transit stop</em> within 10 tiles and the building at <em>80%+ occupancy</em>.</li>
    </ul>
    <p>Upgrades take <em>2 months</em> — you'll see a construction phase before the new building appears.</p>
    <p><strong>Dereliction:</strong> A building that stays below 10% occupancy for 3 consecutive months will downgrade. Removing infrastructure can also trigger dereliction.</p>

    <p><strong>Residential</strong> — Where people live. Low: 10 pop. Medium: 100–120 pop. High: 330 pop.</p>
    <p><strong>Commercial</strong> — Shops and offices. Demand scales with population. High density commercial generates exceptional tax revenue.</p>
    <p><strong>Industrial</strong> — Factories. Higher density means <em>more production value but fewer jobs</em> due to automation — watch your unemployment.</p>
    <p>Watch the <strong>R/C/I demand bars</strong> in the top bar to know when to zone more. The <strong>Pop</strong> counter now shows overall occupancy (% full) so you can gauge when upgrades are near.</p>
  `,
}
