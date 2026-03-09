import type { DocSection } from './types.js'

export const roadsTraffic: DocSection = {
  title: 'Roads & Traffic',
  content: `
    <p>Roads ($10 each, $1/mo maintenance) connect your zones and enable development.</p>
    <p><strong>Traffic</strong> simulates commuters traveling from residential areas to commercial and industrial zones. Each residential building generates trips along roads to the nearest workplace zones.</p>
    <p>Trips follow roads up to <strong>30 tiles</strong>. Each trip adds 50 traffic units to every road tile along the route. Road capacity is 100 units per tile — anything beyond that is heavy congestion.</p>
    <p>When average road congestion exceeds 80%, all zone demand is penalized:</p>
    <p class="docs-formula"><code>Demand Penalty = 1.0 − (Avg Congestion − 0.8) × 0.4</code> — minimum 0.5×</p>
    <p><strong>Tips:</strong></p>
    <ul>
      <li>Build parallel roads to distribute traffic</li>
      <li>Keep residential and work zones within 30 tiles of each other</li>
      <li>Use the <strong>Traffic overlay (T)</strong> to spot bottlenecks</li>
    </ul>
  `,
}
